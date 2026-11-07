import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentPropsWithoutRef } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioNarrowScreen } from '~/components/arrangement/StudioNarrowScreen';
import { STUDIO_WIDE_MIN_PX, useStudioWideViewport } from '~/hooks/useStudioWideViewport';
import StudioLabRoute from '~/routes/studio-lab';
import { createWorkspaceTestEnvironment } from './helpers/workspace-test-environment';

vi.mock('@remix-run/react', () => ({
  useSearchParams: () => [new URLSearchParams()],
  Link: ({ to, children, ...rest }: ComponentPropsWithoutRef<'a'> & { to: string }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/demo-synth.client', () => ({
  synthesizeDemoCompositionOffMainThread: () => new Promise(() => undefined),
}));

const {
  fakeClock,
  FakeAudioContext,
  FakeOfflineAudioContext,
  FakeAudioBuffer,
  FakeResizeObserver,
} = createWorkspaceTestEnvironment();

const STUDIO_WIDE_QUERY = '(min-width: 900px)';
const NARROW_HEADING = 'The Studio works on a computer';

interface ViewportStub {
  queries: string[];
  setWide: (next: boolean) => void;
}

function installViewportStub(initialWide: boolean): ViewportStub {
  let wide = initialWide;
  const listeners = new Set<() => void>();
  const queries: string[] = [];
  const matchMedia = (query: string) => {
    queries.push(query);
    const isStudioQuery = query === STUDIO_WIDE_QUERY;
    return {
      get matches() {
        return isStudioQuery ? wide : false;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: () => void) => {
        if (isStudioQuery) listeners.add(listener);
      },
      removeEventListener: (_type: string, listener: () => void) => {
        listeners.delete(listener);
      },
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    };
  };
  vi.stubGlobal('matchMedia', matchMedia);
  return {
    queries,
    setWide: (next: boolean) => {
      wide = next;
      act(() => {
        for (const listener of [...listeners]) listener();
      });
    },
  };
}

function applyBrowserParsedMutedState(container: HTMLElement): void {
  for (const video of container.querySelectorAll('video')) {
    video.muted = video.defaultMuted;
  }
}

function testId(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}

function muteMusic(): HTMLElement {
  return screen.getByRole('button', { name: 'Mute — Music' });
}

function WideProbe() {
  return <span data-testid="wide-probe">{useStudioWideViewport() ? 'wide' : 'narrow'}</span>;
}

let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  fetchSpy = vi.fn(() => new Promise<Response>(() => undefined));
  vi.stubGlobal('fetch', fetchSpy);
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('FIX-PD-1c studio-lab narrow-window gate (D-29z725, R1–R8)', { timeout: 15_000 }, () => {
  it('NG1: a narrow client render shows only the narrow state and never mounts the provider', () => {
    installViewportStub(false);
    render(<StudioLabRoute />);

    expect(testId('studio-narrow-heading')?.textContent).toBe(NARROW_HEADING);
    expect(testId('arrangement-exit')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('NG2: a wide client render shows the workspace with exactly one theme marker', () => {
    installViewportStub(true);
    render(<StudioLabRoute />);

    expect(testId('arrangement-exit')).not.toBeNull();
    expect(testId('studio-narrow-screen')?.hasAttribute('data-studio-theme')).toBe(false);
    expect(document.querySelectorAll('[data-studio-theme]')).toHaveLength(1);
  });

  it('NG3: the server HTML holds both trees once, one theme marker and the complementary visibility classes', () => {
    installViewportStub(false);
    const html = renderToString(<StudioLabRoute />);

    expect(html.split('data-testid="arrangement-exit"')).toHaveLength(2);
    expect(html.split('data-testid="studio-narrow-heading"')).toHaveLength(2);
    expect(html.split('data-studio-theme=')).toHaveLength(2);
    const narrowRoot = /<main\b[^>]*data-testid="studio-narrow-screen"[^>]*>/.exec(html)?.[0] ?? '';
    expect(/\bclass="([^"]*)"/.exec(narrowRoot)?.[1]?.split(/\s+/)).toContain('min-[900px]:hidden');
    const wrapper = /<div class="contents[^"]*"/.exec(html)?.[0] ?? '';
    expect(wrapper).toContain('max-[900px]:hidden');
  });

  it('NG4: the boundary query is exactly (min-width: 900px) and the innerWidth fallback is inclusive at 900', () => {
    const stub = installViewportStub(true);
    const first = render(<WideProbe />);
    expect(stub.queries.length).toBeGreaterThan(0);
    expect(new Set(stub.queries)).toEqual(new Set([STUDIO_WIDE_QUERY]));
    expect(STUDIO_WIDE_MIN_PX).toBe(900);
    first.unmount();

    vi.stubGlobal('matchMedia', undefined);
    vi.stubGlobal('innerWidth', 899);
    const below = render(<WideProbe />);
    expect(below.getByTestId('wide-probe').textContent).toBe('narrow');
    below.unmount();

    vi.stubGlobal('innerWidth', 900);
    const at = render(<WideProbe />);
    expect(at.getByTestId('wide-probe').textContent).toBe('wide');
  });

  it('NG5: narrowing after a wide start keeps the arrangement, its history and moves focus both ways', () => {
    const viewport = installViewportStub(true);
    render(<StudioLabRoute />);
    fireEvent.click(muteMusic());
    expect(muteMusic().getAttribute('aria-pressed')).toBe('true');

    viewport.setWide(false);
    expect(testId('arrangement-exit')).toBeNull();
    expect(document.activeElement).toBe(testId('studio-narrow-heading'));

    viewport.setWide(true);
    expect(muteMusic().getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(testId('arrangement-exit'));

    act(() => {
      fireEvent.keyDown(document.body, { key: 'z', code: 'KeyZ', ctrlKey: true });
    });
    expect(muteMusic().getAttribute('aria-pressed')).toBe('false');
  });

  it('NG5b: narrowing while a clip plays stops playback and it stays stopped after widening', async () => {
    vi.stubGlobal(
      'AudioBuffer',
      class extends FakeAudioBuffer {
        copyToChannel() {}
      },
    );
    const viewport = installViewportStub(true);
    render(<StudioLabRoute />);
    await act(async () => {
      await Promise.resolve();
    });
    const softImpact = document.querySelector<HTMLElement>('[data-source-id="demo-soft-impact"]');
    if (!softImpact) throw new Error('Soft impact option missing');
    expect(softImpact.getAttribute('draggable')).toBe('true');
    act(() => {
      fireEvent.doubleClick(softImpact);
    });
    expect(document.querySelectorAll('[data-clip-id]')).toHaveLength(1);
    const play = () => {
      const button = document.querySelector<HTMLElement>('[data-playing]');
      if (!button) throw new Error('play button missing');
      return button;
    };
    await act(async () => {
      fireEvent.click(play());
      await Promise.resolve();
    });
    expect(play().getAttribute('data-playing')).toBe('true');

    viewport.setWide(false);
    expect(document.querySelector('[data-playing]')).toBeNull();
    viewport.setWide(true);
    expect(play().getAttribute('data-playing')).toBe('false');
    expect(document.querySelectorAll('[data-clip-id]')).toHaveLength(1);
  });

  it('NG5c: narrowing while a library preview plays stops the preview and it reads Preview after widening', async () => {
    vi.stubGlobal(
      'AudioBuffer',
      class extends FakeAudioBuffer {
        copyToChannel() {}
      },
    );
    const createdSources: Array<{ stop: () => void }> = [];
    const createBufferSource = FakeAudioContext.prototype.createBufferSource;
    vi.spyOn(FakeAudioContext.prototype, 'createBufferSource').mockImplementation(function (
      this: InstanceType<typeof FakeAudioContext>,
    ) {
      const source = createBufferSource.call(this);
      createdSources.push(source);
      return source;
    });
    const viewport = installViewportStub(true);
    render(<StudioLabRoute />);
    await act(async () => {
      await Promise.resolve();
    });
    const softImpact = document.querySelector<HTMLElement>('[data-source-id="demo-soft-impact"]');
    if (!softImpact) throw new Error('Soft impact option missing');
    act(() => {
      fireEvent.click(softImpact);
    });
    const previewRegion = () => screen.getByRole('region', { name: 'Preview' });
    const sourcesBeforePreview = createdSources.length;
    await act(async () => {
      fireEvent.click(within(previewRegion()).getByRole('button', { name: 'Preview' }));
      await Promise.resolve();
    });
    expect(within(previewRegion()).getByRole('button', { name: 'Stop' })).toBeTruthy();
    expect(createdSources).toHaveLength(sourcesBeforePreview + 1);
    const previewSource = createdSources[sourcesBeforePreview];
    if (!previewSource) throw new Error('preview source missing');
    const stopSpy = vi.spyOn(previewSource, 'stop');
    expect(stopSpy).not.toHaveBeenCalled();

    viewport.setWide(false);
    expect(stopSpy).toHaveBeenCalledTimes(1);
    viewport.setWide(true);
    expect(within(previewRegion()).queryByRole('button', { name: 'Stop' })).toBeNull();
    expect(within(previewRegion()).getByRole('button', { name: 'Preview' })).toBeTruthy();
  });

  it('NG6: in the latched narrow state Space and Delete on Send link never reach the workspace transport', () => {
    const viewport = installViewportStub(true);
    render(<StudioLabRoute />);
    expect(document.querySelector('[data-playing]')?.getAttribute('data-playing')).toBe('false');

    viewport.setWide(false);
    const sendLink = screen.getByRole('button', { name: 'Send link' });
    sendLink.focus();
    act(() => {
      fireEvent.keyDown(sendLink, { key: ' ', code: 'Space' });
      fireEvent.keyDown(sendLink, { key: 'Delete', code: 'Delete' });
    });
    expect(document.querySelector('[data-playing]')).toBeNull();

    viewport.setWide(true);
    const playing = document.querySelectorAll('[data-playing]');
    expect(playing).toHaveLength(1);
    expect(playing[0]?.getAttribute('data-playing')).toBe('false');
  });

  describe('NG7: Send link', () => {
    const PAGE_URL = () => window.location.href;

    function stubNavigator(name: 'share' | 'clipboard', value: unknown) {
      Object.defineProperty(navigator, name, { configurable: true, writable: true, value });
    }

    afterEach(() => {
      stubNavigator('share', undefined);
      stubNavigator('clipboard', undefined);
    });

    function renderNarrowScreen() {
      render(<StudioNarrowScreen themeMarker focusHeadingOnMount={false} />);
      return {
        status: () => screen.getByRole('status').textContent ?? '',
        send: async () => {
          await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Send link' }));
          });
        },
      };
    }

    it('NG7a: navigator.share is called once with the title and URL and the status stays empty', async () => {
      const share = vi.fn(() => Promise.resolve());
      const writeText = vi.fn(() => Promise.resolve());
      stubNavigator('share', share);
      stubNavigator('clipboard', { writeText });
      const view = renderNarrowScreen();
      await view.send();

      expect(share).toHaveBeenCalledTimes(1);
      expect(share).toHaveBeenCalledWith({ title: 'CZABA Studio', url: PAGE_URL() });
      expect(writeText).not.toHaveBeenCalled();
      expect(view.status()).toBe('');
    });

    it('NG7b: a cancelled share (AbortError) leaves the status empty and does not touch the clipboard', async () => {
      const share = vi.fn(() => Promise.reject(new DOMException('cancelled', 'AbortError')));
      const writeText = vi.fn(() => Promise.resolve());
      stubNavigator('share', share);
      stubNavigator('clipboard', { writeText });
      const view = renderNarrowScreen();
      await view.send();

      expect(share).toHaveBeenCalledTimes(1);
      expect(writeText).not.toHaveBeenCalled();
      expect(view.status()).toBe('');
    });

    it('NG7c: without share, a successful clipboard write reads Link copied', async () => {
      const writeText = vi.fn(() => Promise.resolve());
      stubNavigator('share', undefined);
      stubNavigator('clipboard', { writeText });
      const view = renderNarrowScreen();
      await view.send();

      expect(writeText).toHaveBeenCalledWith(PAGE_URL());
      expect(view.status()).toBe('Link copied');
      expect(screen.queryByLabelText('Studio link')).toBeNull();
    });

    it('NG7d: a failed clipboard write shows the error and a focused read-only Studio link field', async () => {
      const writeText = vi.fn(() => Promise.reject(new Error('denied')));
      stubNavigator('share', undefined);
      stubNavigator('clipboard', { writeText });
      const view = renderNarrowScreen();
      await view.send();

      expect(view.status()).toBe("Couldn't copy the link.");
      const field = screen.getByLabelText('Studio link');
      if (!(field instanceof HTMLInputElement)) throw new Error('Studio link is not an input');
      expect(field.value).toBe(PAGE_URL());
      expect(field.readOnly).toBe(true);
      expect(document.activeElement).toBe(field);
    });
  });

  it('NG8: an audio error replaces the preview with Preview unavailable. and keeps Send link', () => {
    render(<StudioNarrowScreen themeMarker focusHeadingOnMount={false} />);
    const audio = document.querySelector('audio');
    expect(audio?.getAttribute('preload')).toBe('metadata');
    expect(audio?.getAttribute('src')).toBe('/middle-east.mp3');
    if (!audio) throw new Error('audio element missing');
    expect(screen.getByLabelText('Middle East — public preview')).toBe(audio);

    act(() => {
      fireEvent.error(audio);
    });
    expect(screen.getByText('Preview unavailable.')).not.toBeNull();
    expect(document.querySelector('audio')).toBeNull();
    expect(screen.getByRole('button', { name: 'Send link' })).not.toBeNull();
  });

  it('NG9: hydrating the server HTML on a narrow window lands on the narrow state without autofocus or warnings', async () => {
    installViewportStub(false);
    const html = renderToString(<StudioLabRoute />);
    const container = document.createElement('div');
    container.innerHTML = html;
    applyBrowserParsedMutedState(container);
    document.body.appendChild(container);
    const consoleError = vi.spyOn(console, 'error');

    let root: ReturnType<typeof hydrateRoot> | null = null;
    await act(async () => {
      root = hydrateRoot(container, <StudioLabRoute />);
    });

    expect(testId('arrangement-exit')).toBeNull();
    expect(testId('studio-narrow-heading')).not.toBeNull();
    expect(document.activeElement).toBe(document.body);
    const hydrationWarnings = consoleError.mock.calls
      .map((args) => args.map((arg) => String(arg)))
      .filter((args) =>
        args.some((arg) =>
          /did not match|Extra attributes from the server|Did not expect server HTML|Expected server HTML|Hydration failed/i.test(
            arg,
          ),
        ),
      );
    expect(hydrationWarnings).toEqual([]);
    act(() => {
      root?.unmount();
    });
  });

  it('NG9c: hydrating the server HTML on a wide window keeps the workspace and moves no focus', async () => {
    installViewportStub(true);
    const html = renderToString(<StudioLabRoute />);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const exitBefore = testId('arrangement-exit');

    let root: ReturnType<typeof hydrateRoot> | null = null;
    await act(async () => {
      root = hydrateRoot(container, <StudioLabRoute />);
    });

    expect(testId('arrangement-exit')).toBe(exitBefore);
    expect(document.activeElement).toBe(document.body);
    act(() => {
      root?.unmount();
    });
  });

  it('NG9b: a client navigation render on a narrow window does not autofocus the heading', () => {
    installViewportStub(false);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(<StudioLabRoute />);
    });

    expect(testId('studio-narrow-heading')).not.toBeNull();
    expect(document.activeElement).toBe(document.body);
    act(() => {
      root.unmount();
    });
  });
});
