import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useArrangementPositionStore,
} from '~/contexts/ArrangementContext';
import type { BarsRulerMark, BarsRulerWindow } from '~/lib/arrangement/tempo';
import { TEMPO_EMPTY_HINT } from '~/lib/arrangement/tempo';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import type { ArrangementPositionStore } from '../position-store';

interface ProbeFiber {
  type: unknown;
  memoizedProps: unknown;
  memoizedState: unknown;
  alternate: ProbeFiber | null;
  child: ProbeFiber | null;
  sibling: ProbeFiber | null;
}

type BarsRulerMarksFn = (
  seconds: number,
  pxPerSecond: number,
  bpm: number,
  rulerWindow?: BarsRulerWindow,
) => BarsRulerMark[];

const tempoCalls = vi.hoisted(() => {
  const state: { count: number; actual: BarsRulerMarksFn | null } = { count: 0, actual: null };
  return state;
});

const renderLog = vi.hoisted(() => {
  const counts = new Map<string, number>();
  const seen = new WeakMap<object, { props: unknown; state: unknown }>();
  const componentName = (type: unknown): string | null =>
    typeof type === 'function' && 'name' in type && typeof type.name === 'string'
      ? type.name
      : null;
  const recordCommit = (root: ProbeFiber) => {
    const stack: ProbeFiber[] = [root];
    while (stack.length > 0) {
      const fiber = stack.pop();
      if (!fiber) {
        continue;
      }
      const name = componentName(fiber.type);
      if (name) {
        const previous =
          seen.get(fiber) ?? (fiber.alternate ? seen.get(fiber.alternate) : undefined);
        if (
          !previous ||
          previous.props !== fiber.memoizedProps ||
          previous.state !== fiber.memoizedState
        ) {
          counts.set(name, (counts.get(name) ?? 0) + 1);
        }
        seen.set(fiber, { props: fiber.memoizedProps, state: fiber.memoizedState });
        if (fiber.alternate) {
          seen.delete(fiber.alternate);
        }
      }
      if (fiber.sibling) {
        stack.push(fiber.sibling);
      }
      if (fiber.child) {
        stack.push(fiber.child);
      }
    }
  };
  Object.defineProperty(globalThis, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
    configurable: true,
    value: {
      isDisabled: false,
      supportsFiber: true,
      renderers: new Map(),
      inject: () => 1,
      checkDCE: () => undefined,
      onCommitFiberRoot: (_rendererId: number, root: { current: ProbeFiber }) =>
        recordCommit(root.current),
      onCommitFiberUnmount: () => undefined,
      onPostCommitFiberRoot: () => undefined,
    },
  });
  return { counts };
});

vi.mock('~/lib/arrangement/tempo', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/tempo')>();
  tempoCalls.actual = actual.barsRulerMarks;
  return {
    ...actual,
    barsRulerMarks: (...args: Parameters<BarsRulerMarksFn>) => {
      tempoCalls.count += 1;
      return actual.barsRulerMarks(...args);
    },
  };
});

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const fakeClock = { base: 0 };

class FakeParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
}

class FakeNode {
  connect(destination: FakeNode) {
    return destination;
  }
  disconnect() {}
}

class FakeGain extends FakeNode {
  gain = new FakeParam();
}

class FakePanner extends FakeNode {
  pan = new FakeParam();
}

class FakeSource extends FakeNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  start() {}
  stop() {}
}

class FakeAudioContext {
  state = 'running';
  destination = new FakeNode();
  sampleRate = 48000;
  get currentTime() {
    return Date.now() / 1000 - fakeClock.base;
  }
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
  createGain() {
    return new FakeGain();
  }
  createStereoPanner() {
    return new FakePanner();
  }
  createBufferSource() {
    return new FakeSource();
  }
}

class FakeOfflineAudioContext {}

class FakeAudioBuffer {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  constructor(options: { length: number; numberOfChannels: number; sampleRate: number }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels;
    this.sampleRate = options.sampleRate;
  }
  get duration() {
    return this.length / this.sampleRate;
  }
  getChannelData() {
    return new Float32Array(this.length);
  }
}

const resizeObservers: { callback: () => void; targets: Element[] }[] = [];

class FakeResizeObserver {
  private readonly entry: { callback: () => void; targets: Element[] };
  constructor(callback: () => void) {
    this.entry = { callback, targets: [] };
    resizeObservers.push(this.entry);
  }
  observe(target: Element) {
    this.entry.targets.push(target);
  }
  disconnect() {
    this.entry.targets.length = 0;
  }
}

const SCROLLER_TEST_ID = 'arrangement-timeline-scroller';
const HEADER_PX = 224;
const VIEWPORT_PX = 1216;
const layout = { scrollerWidth: VIEWPORT_PX + HEADER_PX, clientWidthReads: 0 };

const windowCollection: WorkspaceCollection = {
  id: 'window',
  label: 'window',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'window', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 20000, numberOfChannels: 1, sampleRate: 100 }),
};

const LONG_CLIPS: ArrangementClip[] = [
  { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 103 },
];

function windowArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  return { ...base, clips: LONG_CLIPS };
}

interface WindowApiRef {
  current: ArrangementContextValue | null;
}

function WindowProbe({
  api,
  store,
}: {
  api: WindowApiRef;
  store: { current: ArrangementPositionStore | null };
}) {
  api.current = useArrangement();
  store.current = useArrangementPositionStore();
  return null;
}

function live(api: WindowApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function actualMarks(
  seconds: number,
  pxPerSecond: number,
  bpm: number,
  rulerWindow?: BarsRulerWindow,
): BarsRulerMark[] {
  if (!tempoCalls.actual) {
    throw new Error('tempo module not mocked');
  }
  const full = tempoCalls.actual(seconds, pxPerSecond, bpm);
  return rulerWindow === undefined
    ? full
    : full.filter(
        (mark) =>
          mark.time * pxPerSecond >= rulerWindow.fromPx &&
          mark.time * pxPerSecond <= rulerWindow.toPx,
      );
}

async function mountWindowWorkspace(pxPerSecond: number) {
  const api: WindowApiRef = { current: null };
  const store: { current: ArrangementPositionStore | null } = { current: null };
  const view = render(
    <ArrangementProvider collection={windowCollection} initialArrangement={windowArrangement()}>
      <StudioWorkspace />
      <WindowProbe api={api} store={store} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  act(() => live(api).setPxPerSecond(pxPerSecond));
  return { api, store, view };
}

type WindowView = Awaited<ReturnType<typeof mountWindowWorkspace>>['view'];

function scrollerOf(view: WindowView): HTMLElement {
  return view.getByTestId(SCROLLER_TEST_ID);
}

function commitTempo(view: WindowView, text: string) {
  const input = view.getByTestId('arrangement-tempo-input');
  act(() => input.focus());
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

function scrollTo(view: WindowView, left: number) {
  const scroller = scrollerOf(view);
  scroller.scrollLeft = left;
  fireEvent.scroll(scroller);
}

function rulerSeconds(view: WindowView, pxPerSecond: number): number {
  return Math.round(
    parseFloat(view.getByTestId('arrangement-bars-ruler').style.width) / pxPerSecond,
  );
}

function domMarks(view: WindowView) {
  return Array.from(
    view.container.querySelectorAll<HTMLElement>('[data-testid="arrangement-bars-mark"]'),
  ).map((mark) => ({ time: mark.dataset.time, kind: mark.dataset.kind, text: mark.textContent }));
}

function asDom(marks: readonly BarsRulerMark[]) {
  return marks.map((mark) => ({
    time: String(Math.round(mark.time * 1e6) / 1e6),
    kind: mark.kind,
    text: mark.label ?? '',
  }));
}

function windowFor(page: number, viewportPx: number): BarsRulerWindow {
  return { fromPx: (page - 1) * viewportPx, toPx: (page + 2) * viewportPx };
}

function expectVisibleComplete(
  view: WindowView,
  seconds: number,
  pxPerSecond: number,
  bpm: number,
  visible: BarsRulerWindow,
) {
  const expected = asDom(actualMarks(seconds, pxPerSecond, bpm, visible));
  expect(expected.length).toBeGreaterThan(0);
  const present = new Set(domMarks(view).map((mark) => `${mark.kind}@${mark.time}`));
  expect(expected.filter((mark) => !present.has(`${mark.kind}@${mark.time}`))).toEqual([]);
}

function rendersOf(name: string): number {
  return renderLog.counts.get(name) ?? 0;
}

function resizeScroller(view: WindowView, width: number) {
  const scroller = scrollerOf(view);
  layout.scrollerWidth = width;
  act(() => {
    for (const observer of resizeObservers) {
      if (observer.targets.includes(scroller)) {
        observer.callback();
      }
    }
  });
}

async function mountWindowedAt320(bpm: string) {
  const mounted = await mountWindowWorkspace(40);
  commitTempo(mounted.view, bpm);
  act(() => live(mounted.api).setPxPerSecond(320));
  return mounted;
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  layout.scrollerWidth = VIEWPORT_PX + HEADER_PX;
  layout.clientWidthReads = 0;
  resizeObservers.length = 0;
  tempoCalls.count = 0;
  renderLog.counts.clear();
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function stubClientWidth(
    this: Element,
  ) {
    layout.clientWidthReads += 1;
    return this.getAttribute('data-testid') === SCROLLER_TEST_ID ? layout.scrollerWidth : 0;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SRW-15 viewport-windowed bars ruler strip (D-29z35)', { timeout: 15_000 }, () => {
  it('BU1 an unmeasured viewport renders the whole ruler', async () => {
    layout.scrollerWidth = 0;
    const { view } = await mountWindowWorkspace(40);
    commitTempo(view, '90');
    const seconds = rulerSeconds(view, 40);
    expect(seconds).toBe(133);
    const full = asDom(actualMarks(seconds, 40, 90));
    expect(full).toHaveLength(200);
    expect(domMarks(view)).toEqual(full);
  });

  it('BU2 a measured viewport renders only the three-viewport window at load', async () => {
    const { view } = await mountWindowedAt320('999');
    expect(view.getByTestId('arrangement-bars-ruler').dataset.bpm).toBe('999');
    const seconds = rulerSeconds(view, 320);
    expect(seconds).toBe(133);
    const full = actualMarks(seconds, 320, 999);
    expect(full).toHaveLength(2215);
    const pageZero = windowFor(0, VIEWPORT_PX);
    expect(pageZero).toEqual({ fromPx: -1216, toPx: 2432 });
    const dom = domMarks(view);
    expect(dom).toEqual(asDom(actualMarks(seconds, 320, 999, pageZero)));
    expect(dom).toHaveLength(127);
    expect(dom.length).toBeLessThanOrEqual(400);
    expectVisibleComplete(view, seconds, 320, 999, { fromPx: 0, toPx: VIEWPORT_PX });
  });

  it('BU3 a scroll into another page moves the window with one viewport of margin', async () => {
    const { view } = await mountWindowedAt320('999');
    const seconds = rulerSeconds(view, 320);
    scrollTo(view, 6090);
    const pageFive = windowFor(5, VIEWPORT_PX);
    expect(pageFive).toEqual({ fromPx: 4864, toPx: 8512 });
    expect(domMarks(view)).toEqual(asDom(actualMarks(seconds, 320, 999, pageFive)));
    expectVisibleComplete(view, seconds, 320, 999, { fromPx: 6090, toPx: 6090 + VIEWPORT_PX });
  });

  it('BU4 scrolling inside a page renders nothing; the next page renders once', async () => {
    const { view } = await mountWindowedAt320('999');
    const seconds = rulerSeconds(view, 320);
    scrollTo(view, 6090);
    const before = domMarks(view);
    const calls = tempoCalls.count;
    renderLog.counts.clear();
    scrollTo(view, 6500);
    scrollTo(view, 7200);
    expect(tempoCalls.count).toBe(calls);
    expect(rendersOf('ArrangementTempoRow')).toBe(0);
    expect(rendersOf('ArrangementBarsRulerInner')).toBe(0);
    expect(domMarks(view)).toEqual(before);
    scrollTo(view, 7300);
    expect(tempoCalls.count).toBe(calls + 1);
    const pageSix = windowFor(6, VIEWPORT_PX);
    expect(pageSix).toEqual({ fromPx: 6080, toPx: 9728 });
    expect(domMarks(view)).toEqual(asDom(actualMarks(seconds, 320, 999, pageSix)));
  });

  it('BU5 the first render after a keyboard zoom already uses the new view', async () => {
    const { api, view } = await mountWindowWorkspace(40);
    commitTempo(view, '90');
    act(() => live(api).seekTo(40));
    scrollTo(view, 1000);
    const scroller = scrollerOf(view);
    expect(Math.floor(scroller.scrollLeft / VIEWPORT_PX)).toBe(0);
    fireEvent.keyDown(document.body, { key: '=', code: 'Equal' });
    const zoomed = live(api).pxPerSecond;
    expect(zoomed).toBeCloseTo(50, 9);
    const scrollLeft = scroller.scrollLeft;
    expect(scrollLeft).toBeCloseTo(1400, 6);
    expect(Math.floor(scrollLeft / VIEWPORT_PX)).toBe(1);
    const seconds = rulerSeconds(view, zoomed);
    expectVisibleComplete(view, seconds, zoomed, 90, {
      fromPx: scrollLeft,
      toPx: scrollLeft + VIEWPORT_PX,
    });
    expect(domMarks(view)).toEqual(
      asDom(actualMarks(seconds, zoomed, 90, windowFor(1, VIEWPORT_PX))),
    );
  });

  it('BU6 a resize notification re-measures the viewport', async () => {
    const { view } = await mountWindowedAt320('999');
    const seconds = rulerSeconds(view, 320);
    scrollTo(view, 6090);
    resizeScroller(view, 1000 + HEADER_PX);
    const narrow = windowFor(6, 1000);
    expect(narrow).toEqual({ fromPx: 5000, toPx: 8000 });
    expect(domMarks(view)).toEqual(asDom(actualMarks(seconds, 320, 999, narrow)));
    expectVisibleComplete(view, seconds, 320, 999, { fromPx: 6090, toPx: 7090 });
  });

  it('BU7 clearing and setting the tempo keeps the window; no tempo means no mark work', async () => {
    const { view } = await mountWindowedAt320('999');
    const seconds = rulerSeconds(view, 320);
    expect(domMarks(view)).toEqual(
      asDom(actualMarks(seconds, 320, 999, windowFor(0, VIEWPORT_PX))),
    );
    commitTempo(view, '');
    const strip = view.getByTestId('arrangement-bars-ruler');
    expect(strip.dataset.bpm).toBe('');
    expect(strip.textContent).toContain(TEMPO_EMPTY_HINT);
    expect(domMarks(view)).toHaveLength(0);
    const calls = tempoCalls.count;
    scrollTo(view, 7300);
    expect(tempoCalls.count).toBe(calls);
    commitTempo(view, '90');
    expect(domMarks(view)).toEqual(asDom(actualMarks(seconds, 320, 90, windowFor(6, VIEWPORT_PX))));
    expectVisibleComplete(view, seconds, 320, 90, { fromPx: 7300, toPx: 7300 + VIEWPORT_PX });
  });

  it('BU8 playhead position frames neither recompute marks nor read layout', async () => {
    const { store, view } = await mountWindowedAt320('999');
    const before = domMarks(view);
    const calls = tempoCalls.count;
    const reads = layout.clientWidthReads;
    renderLog.counts.clear();
    for (let frame = 1; frame <= 30; frame++) {
      act(() => store.current?.setPosition(frame * 0.5));
    }
    expect(store.current?.getPosition()).toBe(15);
    expect(tempoCalls.count).toBe(calls);
    expect(layout.clientWidthReads - reads).toBe(0);
    expect(rendersOf('ArrangementTempoRow')).toBe(0);
    expect(rendersOf('ArrangementBarsRulerInner')).toBe(0);
    expect(domMarks(view)).toEqual(before);
  });
});
