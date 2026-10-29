import { act, fireEvent, render, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ARRANGEMENT_HEADER_WIDTH_PX } from '~/components/arrangement/ArrangementLane';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  formatArrangementTime,
  useArrangement,
  useArrangementInsertMarkerStore,
  useArrangementPositionStore,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
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

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

const budgetCollection: WorkspaceCollection = {
  id: 'budget',
  label: 'budget',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'budget', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'budget', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function budgetArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      {
        id: 'music-1',
        trackId: 'music',
        sourceId: 'song',
        start: 0,
        sourceOffset: 0,
        duration: 20,
      },
      { id: 'hit-1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0, duration: 2 },
      { id: 'video-1', trackId: 'video', sourceId: 'film', start: 2, sourceOffset: 0, duration: 1 },
    ],
  };
}

const WATCHED_LISTS = [
  'ArrangementClipViewInner',
  'ArrangementOverviewInner',
  'ArrangementLibraryOptionInner',
  'ArrangementRulerTicksInner',
] as const;

const POSITION_CONSUMERS = [
  'ArrangementPlayheadLine',
  'ArrangementRulerPlayhead',
  'ArrangementTransportPosition',
  'ArrangementVideoCaption',
  'ArrangementVideoGapCaption',
] as const;

interface BudgetApiRef {
  current: ArrangementContextValue | null;
}

function BudgetProbe({ api }: { api: BudgetApiRef }) {
  api.current = useArrangement();
  return null;
}

function PositionStoreProbe({ store }: { store: { current: ArrangementPositionStore | null } }) {
  store.current = useArrangementPositionStore();
  return null;
}

function InsertMarkerStoreProbe({
  store,
}: {
  store: { current: ArrangementPositionStore | null };
}) {
  store.current = useArrangementInsertMarkerStore();
  return null;
}

function countsOf(names: readonly string[]): Record<string, number> {
  return Object.fromEntries(names.map((name) => [name, renderLog.counts.get(name) ?? 0]));
}

const CONTEXT_CONSUMERS = [
  'ArrangementTransport',
  'ArrangementRuler',
  'ArrangementLibrary',
  'ArrangementLane',
  'ArrangementDetailPanel',
] as const;

function detailTranslatePercent(element: HTMLElement): number {
  const match = /^translateX\((-?\d+(?:\.\d+)?(?:e-?\d+)?)%\)$/.exec(element.style.transform);
  return match ? Number(match[1]) : Number.NaN;
}

async function waitReal(ms: number) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

describe('Play render budget and per-frame writers (C-R6-02, RF7-P2, RF7-U)', () => {
  const frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    frames.length = 0;
    fakeClock.base = Date.now() / 1000;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function mountWorkspace() {
    const api: BudgetApiRef = { current: null };
    const view = render(
      <ArrangementProvider collection={budgetCollection} initialArrangement={budgetArrangement()}>
        <StudioWorkspace />
        <BudgetProbe api={api} />
      </ArrangementProvider>,
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    return { api, view };
  }

  function runFrames() {
    const pending = frames.splice(0, frames.length);
    act(() => {
      for (const frame of pending) {
        frame(performance.now());
      }
    });
  }

  it('does not re-render clips, overview bars, library rows or ruler ticks over Play → Pause → Play', async () => {
    const { api, view } = await mountWorkspace();
    const mounted = countsOf(WATCHED_LISTS);
    for (const name of WATCHED_LISTS) {
      expect(mounted[name]).toBeGreaterThan(0);
    }
    expect(
      within(view.getByRole('listbox', { name: 'Sounds' })).getAllByRole('option'),
    ).toHaveLength(2);
    renderLog.counts.clear();
    fireEvent.click(view.getByRole('button', { name: 'Play' }));
    expect(api.current?.isPlaying).toBe(true);
    await waitReal(260);
    fireEvent.click(view.getByRole('button', { name: 'Pause' }));
    expect(api.current?.isPlaying).toBe(false);
    fireEvent.click(view.getByRole('button', { name: 'Play' }));
    await waitReal(260);
    expect(api.current?.isPlaying).toBe(true);
    for (const parent of [
      'ArrangementTransport',
      'ArrangementRuler',
      'ArrangementLibrary',
      'ArrangementLane',
    ]) {
      expect(renderLog.counts.get(parent) ?? 0).toBeGreaterThan(0);
    }
    expect(countsOf(WATCHED_LISTS)).toEqual({
      ArrangementClipViewInner: 0,
      ArrangementOverviewInner: 0,
      ArrangementLibraryOptionInner: 0,
      ArrangementRulerTicksInner: 0,
    });
    fireEvent.click(view.getByRole('button', { name: 'Pause' }));
  }, 15000);

  it('moves the playhead, ruler handle and transport time on playback frames without React renders', async () => {
    const { api, view } = await mountWorkspace();
    const transport = view.getByTestId('arrangement-position');
    const line = view.getByTestId('arrangement-playhead');
    const handle = view.getByTestId('arrangement-playhead-handle');
    const gap = view.getByTestId('arrangement-video-gap');
    expect(transport.textContent).toBe('00:00.000');
    for (const name of POSITION_CONSUMERS) {
      expect(renderLog.counts.get(name) ?? 0).toBeGreaterThan(0);
    }
    fireEvent.click(view.getByRole('button', { name: 'Play' }));
    await waitReal(300);
    renderLog.counts.clear();
    runFrames();
    runFrames();
    const position = api.current?.getLivePosition() ?? 0;
    expect(position).toBeGreaterThan(0.1);
    expect(countsOf([...POSITION_CONSUMERS, 'LibraryInsertMarkerText'])).toEqual({
      ArrangementPlayheadLine: 0,
      ArrangementRulerPlayhead: 0,
      ArrangementTransportPosition: 0,
      ArrangementVideoCaption: 0,
      ArrangementVideoGapCaption: 0,
      LibraryInsertMarkerText: 0,
    });
    expect(countsOf(WATCHED_LISTS)).toEqual({
      ArrangementClipViewInner: 0,
      ArrangementOverviewInner: 0,
      ArrangementLibraryOptionInner: 0,
      ArrangementRulerTicksInner: 0,
    });
    expect(transport.textContent).not.toBe('00:00.000');
    expect(gap.textContent).toBe(`No video · ${transport.textContent}`);
    expect(Number.parseFloat(line.style.left)).toBeGreaterThan(ARRANGEMENT_HEADER_WIDTH_PX);
    expect(Number.parseFloat(handle.style.left)).toBeGreaterThan(1);
    expect(Number(handle.getAttribute('aria-valuenow'))).toBeGreaterThan(0);
    fireEvent.click(view.getByRole('button', { name: 'Pause' }));
    const stoppedAt = api.current?.getLivePosition() ?? 0;
    expect(transport.textContent).toBe(formatArrangementTime(stoppedAt));
  }, 15000);

  it('does not re-render the detail panel content over 60 position frames or Play → Pause → Play (R11-P1e)', async () => {
    const api: BudgetApiRef = { current: null };
    const store: { current: ArrangementPositionStore | null } = { current: null };
    const view = render(
      <ArrangementProvider collection={budgetCollection} initialArrangement={budgetArrangement()}>
        <StudioWorkspace />
        <BudgetProbe api={api} />
        <PositionStoreProbe store={store} />
      </ArrangementProvider>,
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    act(() => api.current?.selectClip('music-1'));
    fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
    expect(renderLog.counts.get('ArrangementDetailContentInner') ?? 0).toBeGreaterThan(0);
    expect(renderLog.counts.get('ArrangementDetailPlayhead') ?? 0).toBeGreaterThan(0);
    const detailPlayhead = view.getByTestId('arrangement-detail-playhead');
    renderLog.counts.clear();
    const lefts: number[] = [];
    for (let frame = 1; frame <= 60; frame++) {
      act(() => store.current?.setPosition(frame * 0.3));
      lefts.push(detailTranslatePercent(detailPlayhead));
    }
    expect(lefts[0]).toBeCloseTo(1.5, 6);
    expect(lefts[59]).toBeCloseTo(90, 6);
    expect(lefts.every((left, index) => index === 0 || left > lefts[index - 1])).toBe(true);
    expect(detailPlayhead.style.display).toBe('block');
    act(() => store.current?.setPosition(25));
    expect(detailPlayhead.style.display).toBe('none');
    expect(renderLog.counts.get('ArrangementDetailContentInner') ?? 0).toBe(0);
    expect(renderLog.counts.get('ArrangementDetailPlayhead') ?? 0).toBe(0);
    act(() => api.current?.seekTo(0));
    renderLog.counts.clear();
    fireEvent.click(view.getByRole('button', { name: 'Play' }));
    expect(api.current?.isPlaying).toBe(true);
    await waitReal(260);
    fireEvent.click(view.getByRole('button', { name: 'Pause' }));
    fireEvent.click(view.getByRole('button', { name: 'Play' }));
    await waitReal(260);
    runFrames();
    expect(api.current?.isPlaying).toBe(true);
    expect(renderLog.counts.get('ArrangementDetailPanel') ?? 0).toBeGreaterThan(0);
    expect(renderLog.counts.get('ArrangementDetailContentInner') ?? 0).toBe(0);
    expect(renderLog.counts.get('ArrangementDetailPlayhead') ?? 0).toBe(0);
    expect(countsOf(WATCHED_LISTS)).toEqual({
      ArrangementClipViewInner: 0,
      ArrangementOverviewInner: 0,
      ArrangementLibraryOptionInner: 0,
      ArrangementRulerTicksInner: 0,
    });
    fireEvent.click(view.getByRole('button', { name: 'Pause' }));
  }, 15000);

  it('shows the seek position immediately when stopped and after a zoom change', async () => {
    const { api, view } = await mountWorkspace();
    act(() => api.current?.seekTo(5));
    const line = view.getByTestId('arrangement-playhead');
    const handle = view.getByTestId('arrangement-playhead-handle');
    expect(view.getByTestId('arrangement-position').textContent).toBe('00:05.000');
    const pxPerSecond = api.current?.pxPerSecond ?? 0;
    expect(Number.parseFloat(line.style.left)).toBeCloseTo(
      ARRANGEMENT_HEADER_WIDTH_PX + 5 * pxPerSecond,
      6,
    );
    expect(handle.getAttribute('aria-valuenow')).toBe('5');
    expect(handle.getAttribute('aria-valuetext')).toBe('00:05.000');
    act(() => api.current?.setPxPerSecond(80));
    expect(Number.parseFloat(line.style.left)).toBeCloseTo(ARRANGEMENT_HEADER_WIDTH_PX + 5 * 80, 6);
    expect(Number.parseFloat(handle.style.left)).toBeCloseTo(5 * 80 + 1, 6);
    expect(view.getByTestId('arrangement-video-gap').textContent).toBe('No video · 00:05.000');
    act(() => api.current?.seekTo(2.5));
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    act(() => api.current?.seekTo(7.25));
    expect(view.getByTestId('arrangement-video-gap').textContent).toBe('No video · 00:07.250');
  });

  it('writes only transform on the detail playhead per frame and never left, width or height (R9-D3, C-R8-01)', async () => {
    const api: BudgetApiRef = { current: null };
    const store: { current: ArrangementPositionStore | null } = { current: null };
    const view = render(
      <ArrangementProvider collection={budgetCollection} initialArrangement={budgetArrangement()}>
        <StudioWorkspace />
        <BudgetProbe api={api} />
        <PositionStoreProbe store={store} />
      </ArrangementProvider>,
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    act(() => api.current?.selectClip('music-1'));
    fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
    const detailPlayhead = view.getByTestId('arrangement-detail-playhead');
    act(() => store.current?.setPosition(25));
    expect(detailPlayhead.style.display).toBe('none');
    const observer = new MutationObserver(() => undefined);
    observer.observe(detailPlayhead, { attributes: true, attributeFilter: ['style'] });
    const styleWritesPerFrame: number[] = [];
    const styleSnapshots: string[] = [];
    const layoutReads = [
      vi.spyOn(Element.prototype, 'getBoundingClientRect'),
      vi.spyOn(Element.prototype, 'getClientRects'),
      vi.spyOn(Element.prototype, 'clientWidth', 'get'),
      vi.spyOn(Element.prototype, 'clientHeight', 'get'),
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get'),
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get'),
      vi.spyOn(window, 'getComputedStyle'),
    ];
    for (let frame = 1; frame <= 30; frame++) {
      act(() => store.current?.setPosition(frame * 0.5));
      styleWritesPerFrame.push(observer.takeRecords().length);
      styleSnapshots.push(detailPlayhead.getAttribute('style') ?? '');
    }
    act(() => store.current?.setPosition(25));
    const exitWrites = observer.takeRecords().length;
    observer.disconnect();
    expect(
      layoutReads.map((spy) => spy.mock.calls.length),
      'no position writer reads layout per frame',
    ).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(styleWritesPerFrame[0]).toBe(2);
    expect(styleWritesPerFrame.slice(1).every((writes) => writes === 1)).toBe(true);
    expect(exitWrites).toBe(1);
    expect(detailPlayhead.style.left).toBe('');
    expect(detailPlayhead.style.width).toBe('');
    expect(detailPlayhead.style.height).toBe('');
    expect(styleSnapshots.some((style) => /(^|;\s*)(left|width|height)\s*:/.test(style))).toBe(
      false,
    );
    expect(detailTranslatePercent(detailPlayhead)).toBeCloseTo(75, 6);
    expect(detailPlayhead.style.display).toBe('none');
  });

  it('keeps the library insert-marker text on 60 position frames and writes marker moves without rendering LibraryInsertMarkerText (R9-L1, C-R6-02, C-R250-01)', async () => {
    const store: { current: ArrangementPositionStore | null } = { current: null };
    const markerStore: { current: ArrangementPositionStore | null } = { current: null };
    const view = render(
      <ArrangementProvider collection={budgetCollection} initialArrangement={budgetArrangement()}>
        <StudioWorkspace />
        <PositionStoreProbe store={store} />
        <InsertMarkerStoreProbe store={markerStore} />
      </ArrangementProvider>,
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const libraryText = view.getByTestId('arrangement-library-insert-marker');
    expect(libraryText.closest('p')?.textContent).toContain('· insert marker 00:00.000');
    expect(libraryText.className).toBe('font-mono tabular-nums');
    expect(libraryText.textContent).toBe('00:00.000');
    expect(renderLog.counts.get('LibraryInsertMarkerText') ?? 0).toBeGreaterThan(0);
    renderLog.counts.clear();
    const texts: string[] = [];
    for (let frame = 1; frame <= 60; frame++) {
      act(() => store.current?.setPosition(frame * 0.1));
      texts.push(libraryText.textContent ?? '');
    }
    expect(store.current?.getPosition()).toBeCloseTo(6, 6);
    expect(new Set(texts)).toEqual(new Set(['00:00.000']));
    act(() => markerStore.current?.setPosition(3));
    expect(libraryText.textContent).toBe(formatArrangementTime(3));
    act(() => markerStore.current?.setPosition(4.5));
    expect(libraryText.textContent).toBe(formatArrangementTime(4.5));
    expect(renderLog.counts.get('LibraryInsertMarkerText') ?? 0).toBe(0);
    expect(view.getByTestId('arrangement-library-insert-marker')).toBe(libraryText);
  });

  it('keeps the context value and its consumers unchanged when the start hold releases (R9-L2, C-R6-02)', async () => {
    const { api, view } = await mountWorkspace();
    fireEvent.click(view.getByRole('button', { name: 'Play' }));
    const valueAtPlay = api.current;
    expect(valueAtPlay?.isPlaying).toBe(true);
    expect(valueAtPlay?.getLivePosition()).toBe(0);
    renderLog.counts.clear();
    await waitReal(450);
    for (let frame = 0; frame < 30; frame++) {
      runFrames();
    }
    expect(api.current?.getLivePosition() ?? 0).toBeGreaterThan(0.3);
    expect(api.current).toBe(valueAtPlay);
    expect(countsOf(CONTEXT_CONSUMERS)).toEqual({
      ArrangementTransport: 0,
      ArrangementRuler: 0,
      ArrangementLibrary: 0,
      ArrangementLane: 0,
      ArrangementDetailPanel: 0,
    });
    act(() => api.current?.selectClip('music-1'));
    expect(api.current).not.toBe(valueAtPlay);
    for (const name of CONTEXT_CONSUMERS) {
      expect(renderLog.counts.get(name) ?? 0).toBeGreaterThan(0);
    }
    fireEvent.click(view.getByRole('button', { name: 'Pause' }));
  }, 15000);
});
