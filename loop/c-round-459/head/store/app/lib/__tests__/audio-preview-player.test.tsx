import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioPlayer, audioPlayerRangeFill } from '~/components/audio/AudioPlayer';
import { AudioPreviewButton } from '~/components/audio/AudioPreviewButton';
import type { Track } from '~/contexts/AudioContext';

interface MockAudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Track[];
  queueIndex: number;
}

const audioMock = vi.hoisted(() => {
  const state: MockAudioState = {
    currentTrack: null,
    isPlaying: false,
    isLoading: false,
    error: null,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    queue: [],
    queueIndex: -1,
  };
  return {
    state,
    play: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    togglePlayPause: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    addToQueue: vi.fn(),
    skipNext: vi.fn(),
    skipPrevious: vi.fn(),
    clearQueue: vi.fn(),
    closePlayer: vi.fn(),
  };
});

vi.mock('~/contexts/AudioContext', () => ({
  useAudio: () => audioMock,
}));
vi.mock('~/lib/analytics', () => ({ trackPlayButtonClicked: vi.fn() }));
vi.mock('~/lib/facebook-pixel', () => ({ trackFBPlayButtonClicked: vi.fn() }));

const previewTrack: Track = {
  id: 'track-middle-east',
  title: 'Middle East',
  artist: 'CZABA',
  audioUrl: '/audio/middle-east-preview.mp3',
  imageUrl: '/images/middle-east.jpg',
  productHandle: 'middle-east',
};

const PLAY_PATH = 'M8 5v14l11-7z';
const VARIANTS = ['overlay', 'inline'] as const;

function resetAudioState() {
  audioMock.state.currentTrack = null;
  audioMock.state.isPlaying = false;
  audioMock.state.isLoading = false;
  audioMock.state.error = null;
  audioMock.state.volume = 0.7;
  audioMock.state.currentTime = 0;
  audioMock.state.duration = 0;
}

async function renderHydratedButton(variant: 'overlay' | 'inline') {
  const view = render(<AudioPreviewButton track={previewTrack} variant={variant} />);
  await act(async () => {});
  return view;
}

describe('AudioPreviewButton — one markup on server and client (STORE-1b K2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAudioState();
  });

  const hydrationCleanups: Array<() => void> = [];

  afterEach(() => {
    for (const cleanupHydration of hydrationCleanups.splice(0)) cleanupHydration();
    vi.restoreAllMocks();
  });

  for (const variant of VARIANTS) {
    it(`renders the same idle markup after mount as on the server (${variant})_REGRESSION`, async () => {
      const serverMarkup = renderToStaticMarkup(
        <AudioPreviewButton track={previewTrack} variant={variant} />,
      );
      const { container } = await renderHydratedButton(variant);
      expect(container.innerHTML).toBe(serverMarkup);
    });

    it(`server markup is the interactive icon-only button without a "Preview" label (${variant})`, () => {
      const host = document.createElement('div');
      host.innerHTML = renderToStaticMarkup(
        <AudioPreviewButton track={previewTrack} variant={variant} />,
      );
      const button = host.querySelector('button');
      expect(button).not.toBeNull();
      expect(button?.getAttribute('type')).toBe('button');
      expect(button?.getAttribute('aria-label')).toBe('Play preview');
      expect(button?.querySelector(`path[d="${PLAY_PATH}"]`)).not.toBeNull();
      expect(host.textContent ?? '').not.toContain('Preview');
      expect(host.querySelector('.audio-preview-overlay-text')).toBeNull();
    });

    it(`hydrates the server markup without recoverable errors or console errors (${variant})_REGRESSION`, async () => {
      await expectCleanHydration(<AudioPreviewButton track={previewTrack} variant={variant} />);
    });

    it(`hydrates inside the real AudioProvider without errors (${variant})_REGRESSION`, async () => {
      vi.doUnmock('~/contexts/AudioContext');
      vi.resetModules();
      const realAudioContext = await import('~/contexts/AudioContext');
      const realPreviewButton = await import('~/components/audio/AudioPreviewButton');
      const RealButton = realPreviewButton.AudioPreviewButton;
      expect(() => renderToStaticMarkup(<RealButton track={previewTrack} />)).toThrow(
        'useAudio must be used within an AudioProvider',
      );
      await expectCleanHydration(
        <realAudioContext.AudioProvider>
          <RealButton track={previewTrack} variant={variant} />
        </realAudioContext.AudioProvider>,
      );
    });
  }

  async function expectCleanHydration(element: ReactElement) {
    const serverHtml = renderToString(element);
    const expectedMarkup = renderToStaticMarkup(element);
    const host = document.createElement('div');
    host.innerHTML = serverHtml;
    document.body.appendChild(host);
    const recoverableErrorSpy = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    let root: ReturnType<typeof hydrateRoot> | undefined;
    hydrationCleanups.push(() => {
      act(() => root?.unmount());
      host.remove();
    });
    await act(async () => {
      root = hydrateRoot(host, element, { onRecoverableError: recoverableErrorSpy });
    });
    await act(async () => {});

    expect(recoverableErrorSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(host.innerHTML).toBe(expectedMarkup);
  }

  it('click plays the track once and does not bubble to a parent card link', async () => {
    const parentClick = vi.fn();
    const { getByRole } = render(
      <a href="/products/middle-east" onClick={parentClick}>
        <AudioPreviewButton track={previewTrack} variant="overlay" />
      </a>,
    );
    await act(async () => {});
    const notPrevented = fireEvent.click(getByRole('button', { name: 'Play preview' }));
    expect(notPrevented).toBe(false);
    expect(audioMock.play).toHaveBeenCalledTimes(1);
    expect(audioMock.play).toHaveBeenCalledWith(previewTrack);
    expect(audioMock.pause).not.toHaveBeenCalled();
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('shows "Pause preview" while this track plays and a click pauses it', async () => {
    audioMock.state.currentTrack = previewTrack;
    audioMock.state.isPlaying = true;
    const { getByRole } = await renderHydratedButton('overlay');
    fireEvent.click(getByRole('button', { name: 'Pause preview' }));
    expect(audioMock.pause).toHaveBeenCalledTimes(1);
    expect(audioMock.play).not.toHaveBeenCalled();
  });

  it('marks the button busy with "Cancel loading preview" while this track loads', async () => {
    audioMock.state.currentTrack = previewTrack;
    audioMock.state.isLoading = true;
    for (const variant of VARIANTS) {
      const { getByRole, unmount } = await renderHydratedButton(variant);
      const button = getByRole('button', { name: 'Cancel loading preview' });
      expect(button.getAttribute('aria-busy')).toBe('true');
      expect(button.getAttribute('type')).toBe('button');
      unmount();
    }
  });
});

describe('AudioPlayer — progress and volume fill use a defined token (STORE-1b K1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAudioState();
  });

  it('draws the played and set parts with var(--color-brand)_REGRESSION', () => {
    audioMock.state.currentTrack = previewTrack;
    audioMock.state.currentTime = 30;
    audioMock.state.duration = 120;
    audioMock.state.volume = 0.7;
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <AudioPlayer />
      </MemoryRouter>,
    );
    const host = document.createElement('div');
    host.innerHTML = markup;
    const progress = host.querySelector('input[aria-label="Preview position"]');
    const volume = host.querySelector('input[aria-label="Preview volume"]');
    expect(progress?.getAttribute('style') ?? '').toContain(
      'var(--color-brand) calc(6px + 0.25000 * (100% - 12px))',
    );
    expect(volume?.getAttribute('style') ?? '').toContain(
      'var(--color-brand) calc(6px + 0.70000 * (100% - 12px))',
    );
    expect(markup).not.toContain('--color-primary');
  });

  it('declares --color-brand in the @theme block and --color-primary nowhere', () => {
    const css = readFileSync(resolve(process.cwd(), 'app/styles/app.css'), 'utf8');
    const themeStart = css.indexOf('@theme {');
    const themeEnd = css.indexOf('\n}', themeStart);
    const brandDeclaration = css.indexOf('--color-brand:', themeStart);
    expect(themeStart).toBeGreaterThanOrEqual(0);
    expect(brandDeclaration).toBeGreaterThan(themeStart);
    expect(brandDeclaration).toBeLessThan(themeEnd);
    expect(css).not.toMatch(/--color-primary\s*:/);
  });

  it('renders nothing without a current track', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <AudioPlayer />
      </MemoryRouter>,
    );
    expect(markup).toBe('');
  });
});

describe('AudioPlayer — the seek thumb stays on the brass fill edge (SABA-B-14)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAudioState();
    audioMock.state.currentTrack = previewTrack;
    audioMock.state.currentTime = 10.4;
    audioMock.state.duration = 150;
  });

  function renderPlayer() {
    return render(
      <MemoryRouter>
        <AudioPlayer />
      </MemoryRouter>,
    );
  }

  function progressInput(container: HTMLElement): HTMLInputElement {
    const input = container.querySelector('input[aria-label="Preview position"]');
    if (!(input instanceof HTMLInputElement)) throw new Error('progress input missing');
    return input;
  }

  it('ST1: the progress range takes any step, so the thumb follows the fractional time', () => {
    const { container } = renderPlayer();
    const input = progressInput(container);
    expect(input.getAttribute('step')).toBe('any');
    expect(input.value).toBe('10.4');
    expect(input.valueAsNumber).toBeCloseTo(10.4, 6);
  });

  it('ST2: the fill edge sits on the thumb centre for every fraction and is clamped', () => {
    const edge = (fraction: string) => `calc(6px + ${fraction} * (100% - 12px))`;
    const cases: ReadonlyArray<readonly [number, string]> = [
      [0, '0.00000'],
      [10.4 / 150, '0.06933'],
      [0.5, '0.50000'],
      [1, '1.00000'],
      [-0.25, '0.00000'],
      [1.75, '1.00000'],
      [Number.NaN, '0.00000'],
      [Number.POSITIVE_INFINITY, '0.00000'],
    ];
    for (const [fraction, printed] of cases) {
      const e = edge(printed);
      expect(audioPlayerRangeFill(fraction)).toBe(
        `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${e}, rgba(255, 255, 255, 0.1) ${e}, rgba(255, 255, 255, 0.1) 100%)`,
      );
    }
  });

  it('ST3: ArrowRight/Up and ArrowLeft/Down seek one second from the exact time', () => {
    const { container } = renderPlayer();
    const input = progressInput(container);
    const steps: ReadonlyArray<readonly [string, number]> = [
      ['ArrowRight', 11.4],
      ['ArrowUp', 11.4],
      ['ArrowLeft', 9.4],
      ['ArrowDown', 9.4],
    ];
    for (const [key, expected] of steps) {
      audioMock.seek.mockClear();
      const notCancelled = fireEvent.keyDown(input, { key });
      expect(notCancelled).toBe(false);
      expect(audioMock.seek).toHaveBeenCalledTimes(1);
      expect(audioMock.seek.mock.calls[0]?.[0]).toBeCloseTo(expected, 6);
    }
  });

  it('ST3b: Shift+Arrow seeks one second, like a plain arrow', () => {
    const { container } = renderPlayer();
    expect(fireEvent.keyDown(progressInput(container), { key: 'ArrowRight', shiftKey: true })).toBe(
      false,
    );
    expect(audioMock.seek.mock.calls[0]?.[0]).toBeCloseTo(11.4, 6);
  });

  it('ST3c: a drag change seeks to the exact fractional value', () => {
    const { container } = renderPlayer();
    fireEvent.change(progressInput(container), { target: { value: '42.37' } });
    expect(audioMock.seek).toHaveBeenCalledTimes(1);
    expect(audioMock.seek.mock.calls[0]?.[0]).toBeCloseTo(42.37, 6);
  });

  it('ST4: arrow seeks clamp to 0 and to the duration', () => {
    audioMock.state.currentTime = 0.3;
    const first = renderPlayer();
    fireEvent.keyDown(progressInput(first.container), { key: 'ArrowLeft' });
    expect(audioMock.seek).toHaveBeenLastCalledWith(0);
    first.unmount();
    audioMock.state.currentTime = 149.8;
    const second = renderPlayer();
    fireEvent.keyDown(progressInput(second.container), { key: 'ArrowRight' });
    expect(audioMock.seek).toHaveBeenLastCalledWith(150);
  });

  it('ST5: modified arrows seek one second like HEAD; Page, Home and End stay native', () => {
    const { container } = renderPlayer();
    const input = progressInput(container);
    const modified: ReadonlyArray<Parameters<typeof fireEvent.keyDown>[1]> = [
      { key: 'ArrowRight', altKey: true },
      { key: 'ArrowRight', ctrlKey: true },
      { key: 'ArrowRight', metaKey: true },
    ];
    for (const init of modified) {
      audioMock.seek.mockClear();
      expect(fireEvent.keyDown(input, init)).toBe(false);
      expect(audioMock.seek.mock.calls[0]?.[0]).toBeCloseTo(11.4, 6);
    }
    audioMock.seek.mockClear();
    for (const key of ['PageUp', 'PageDown', 'Home', 'End']) {
      expect(fireEvent.keyDown(input, { key })).toBe(true);
    }
    expect(audioMock.seek).not.toHaveBeenCalled();
  });

  it('ST6: the position is announced as time of duration', () => {
    const { container } = renderPlayer();
    expect(progressInput(container).getAttribute('aria-valuetext')).toBe('0:10 of 2:30');
  });

  it('ST7: the volume fill uses the same thumb-centred edge', () => {
    audioMock.state.volume = 0.35;
    const { container } = renderPlayer();
    const volume = container.querySelector('input[aria-label="Preview volume"]');
    expect(volume?.getAttribute('style') ?? '').toContain(
      'var(--color-brand) calc(6px + 0.35000 * (100% - 12px))',
    );
  });

  it('ST8: every player range thumb in app.css is 12px wide, matching the fill offset', () => {
    const css = readFileSync(resolve(process.cwd(), 'app/styles/app.css'), 'utf8');
    const selectors = [
      '.audio-player-progress::-webkit-slider-thumb {',
      '.audio-player-progress::-moz-range-thumb {',
      '.audio-player-volume-slider::-webkit-slider-thumb {',
      '.audio-player-volume-slider::-moz-range-thumb {',
    ];
    for (const selector of selectors) {
      const lines = css.split('\n');
      const starts = lines.flatMap((line, index) => (line === selector ? [index] : []));
      expect(starts).toHaveLength(1);
      const start = starts[0] ?? 0;
      const end = lines.indexOf('}', start);
      const body = lines.slice(start + 1, end).map((line) => line.trim());
      expect(body).toContain('width: 12px;');
    }
  });
});
