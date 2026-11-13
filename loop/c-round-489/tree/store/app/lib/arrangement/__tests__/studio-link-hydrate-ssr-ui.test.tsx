import { act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StudioLabRoute from '~/routes/studio-lab';
import { createWorkspaceTestEnvironment } from './helpers/workspace-test-environment';

const routeSearch = vi.hoisted(() => ({ params: new URLSearchParams() }));

vi.mock('@remix-run/react', () => ({
  useSearchParams: () => [routeSearch.params],
  Link: ({ to, children, ...rest }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/demo-synth.client', () => ({
  synthesizeDemoCompositionOffMainThread: () => new Promise(() => undefined),
}));

vi.mock('~/data/studio-lab-demo', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/data/studio-lab-demo')>();
  const sources = [...actual.studioLabDemoCollection.sources].reverse();
  return {
    ...actual,
    studioLabDemoCollection: { ...actual.studioLabDemoCollection, sources },
  };
});

const {
  fakeClock,
  FakeAudioContext,
  FakeOfflineAudioContext,
  FakeAudioBuffer,
  FakeResizeObserver,
} = createWorkspaceTestEnvironment();

const STUDIO_WIDE_QUERY = '(min-width: 900px)';
const PREVIEW_SOURCE_ID = 'demo-middle-east';

interface ViewportStub {
  setWide: (next: boolean) => void;
}

function installViewportStub(initialWide: boolean): ViewportStub {
  let wide = initialWide;
  const listeners = new Set<() => void>();
  vi.stubGlobal('matchMedia', (query: string) => {
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
  });
  return {
    setWide: (next: boolean) => {
      wide = next;
      act(() => {
        for (const listener of [...listeners]) listener();
      });
    },
  };
}

function selectedSourceId(): string | null {
  return (
    document
      .querySelector<HTMLElement>('[role="option"][aria-selected="true"]')
      ?.getAttribute('data-source-id') ?? null
  );
}

function focusedSourceId(): string | null {
  const active = document.activeElement;
  return active instanceof HTMLElement && active.getAttribute('role') === 'option'
    ? (active.dataset.sourceId ?? null)
    : null;
}

function firstOptionSourceId(): string | null {
  return document.querySelector('[role="option"]')?.getAttribute('data-source-id') ?? null;
}

const HYDRATION_WARNING_PATTERN =
  /did not match|Extra attributes from the server|Did not expect server HTML|Expected server HTML|Hydration failed/i;

function hydrationWarnings(calls: unknown[][]): string[][] {
  return calls
    .map((args) => args.map((arg) => String(arg)))
    .filter((args) => args.some((arg) => HYDRATION_WARNING_PATTERN.test(arg)));
}

function applyBrowserParsedMutedState(container: HTMLElement): void {
  for (const video of container.querySelectorAll('video')) {
    video.muted = video.defaultMuted;
  }
}

function mountServerHtml(): HTMLDivElement {
  const container = document.createElement('div');
  container.innerHTML = renderToString(<StudioLabRoute />);
  applyBrowserParsedMutedState(container);
  document.body.appendChild(container);
  return container;
}

const mountedRouteUnmounts: (() => void)[] = [];

async function hydrateRoute(container: HTMLDivElement = mountServerHtml()): Promise<() => void> {
  let root: ReturnType<typeof hydrateRoot> | null = null;
  const unmount = () => {
    const mounted = root;
    root = null;
    act(() => {
      mounted?.unmount();
    });
  };
  mountedRouteUnmounts.push(unmount);
  await act(async () => {
    root = hydrateRoot(container, <StudioLabRoute />);
  });
  return unmount;
}

beforeEach(() => {
  routeSearch.params = new URLSearchParams();
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise<Response>(() => undefined)),
  );
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
  for (const unmount of mountedRouteUnmounts.splice(0)) {
    unmount();
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe(
  'STUDIO-LINK deep link server HTML hydration, alone in its file (rounds 298-299)',
  { timeout: 15_000 },
  () => {
    it('LH3: hydrating the server HTML on a wide window with ?preview= focuses the option without a hydration mismatch', async () => {
      installViewportStub(true);
      routeSearch.params = new URLSearchParams({ preview: 'middle-east' });
      const container = mountServerHtml();

      expect(
        container
          .querySelector(`[role="option"][data-source-id="${PREVIEW_SOURCE_ID}"]`)
          ?.getAttribute('aria-selected'),
      ).toBe('true');
      const consoleError = vi.spyOn(console, 'error');
      const unmount = await hydrateRoute(container);

      expect(firstOptionSourceId()).not.toBe(PREVIEW_SOURCE_ID);
      expect(selectedSourceId()).toBe(PREVIEW_SOURCE_ID);
      expect(focusedSourceId()).toBe(PREVIEW_SOURCE_ID);
      expect(document.activeElement?.getAttribute('aria-selected')).toBe('true');
      expect(hydrationWarnings(consoleError.mock.calls)).toEqual([]);
      unmount();
    });
  },
);
