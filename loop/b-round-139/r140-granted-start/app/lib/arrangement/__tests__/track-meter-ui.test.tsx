import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useMasterMeterStore,
  useTrackMeterStore,
} from '~/contexts/ArrangementContext';
import { applySchedule } from '~/lib/arrangement/graph.client';
import type { MasterMeterStore, TrackMeterStore } from '~/lib/arrangement/meter';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

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

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return {
    ...actual,
    applySchedule: vi.fn(actual.applySchedule),
  };
});

const applyScheduleMock = vi.mocked(applySchedule);

const fakeClock: { base: number; frozenAt: number | null } = { base: 0, frozenAt: null };
const analysers: FakeAnalyser[] = [];
const splitters: FakeSplitter[] = [];

class FakeParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
}

class FakeNode {
  outputs: FakeNode[] = [];
  connect(destination: FakeNode) {
    this.outputs.push(destination);
    return destination;
  }
  disconnect() {
    this.outputs = [];
  }
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

class FakeAnalyser extends FakeNode {
  fftSize = 2048;
  level = 0;
  reads = 0;
  getFloatTimeDomainData(target: Float32Array) {
    this.reads += 1;
    target.fill(this.level);
  }
}

class FakeSplitter extends FakeNode {
  channelOutputs: Array<[FakeNode, number]> = [];
  constructor(readonly channels: number) {
    super();
  }
  connect(destination: FakeNode, output = 0) {
    this.channelOutputs.push([destination, output]);
    return super.connect(destination);
  }
}

class PlainAudioContext {
  state = 'running';
  destination = new FakeNode();
  sampleRate = 48000;
  get currentTime() {
    return fakeClock.frozenAt ?? Date.now() / 1000 - fakeClock.base;
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

class MeteredAudioContext extends PlainAudioContext {
  createChannelSplitter(channels: number) {
    const splitter = new FakeSplitter(channels);
    splitters.push(splitter);
    return splitter;
  }
  createAnalyser() {
    const analyser = new FakeAnalyser();
    analysers.push(analyser);
    return analyser;
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

const TRACK_IDS = ['video', 'music', 'sfx'] as const;

const trackCollection: WorkspaceCollection = {
  id: 'tracks',
  label: 'tracks',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'tracks', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'tracks', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function trackArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips: [
      {
        id: 'music-1',
        trackId: 'music',
        sourceId: 'song',
        start: 0,
        sourceOffset: 0,
        duration: 20,
      },
      { id: 'hit-1', trackId: 'sfx', sourceId: 'hit', start: 0, sourceOffset: 0, duration: 20 },
    ],
  };
}

interface ApiRef {
  current: ArrangementContextValue | null;
}

function TrackProbe({ api }: { api: ApiRef }) {
  api.current = useArrangement();
  return null;
}

interface StoreRef {
  master: MasterMeterStore | null;
  tracks: TrackMeterStore | null;
}

function StoreProbe({ stores }: { stores: StoreRef }) {
  stores.master = useMasterMeterStore();
  stores.tracks = useTrackMeterStore();
  return null;
}

function live(api: ApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function waitReal(ms: number) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

function tapAnalysers(splitter: FakeSplitter): FakeAnalyser[] {
  return splitter.channelOutputs.flatMap(([node]) => (node instanceof FakeAnalyser ? [node] : []));
}

function lastTrackTaps(): ReadonlyMap<string, unknown> | undefined {
  return applyScheduleMock.mock.calls.at(-1)?.[2].trackTaps;
}

function trackTapOf(trackId: string): FakeSplitter {
  const tap = lastTrackTaps()?.get(trackId);
  if (!(tap instanceof FakeSplitter)) {
    throw new Error(`no tap for ${trackId}`);
  }
  return tap;
}

function setTrackLevel(trackId: string, value: number) {
  for (const analyser of tapAnalysers(trackTapOf(trackId))) {
    analyser.level = value;
  }
}

function setMasterLevel(value: number) {
  for (const analyser of tapAnalysers(splitters[0])) {
    analyser.level = value;
  }
}

const MINUS_12_DBFS = 10 ** (-12 / 20);
const MINUS_6_DBFS = 10 ** (-6 / 20);

describe('per-track meters in the lane headers (SRW-13 stage 2b, D-29r)', () => {
  const frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    frames.length = 0;
    analysers.length = 0;
    splitters.length = 0;
    fakeClock.base = Date.now() / 1000;
    fakeClock.frozenAt = null;
    applyScheduleMock.mockClear();
    renderLog.counts.clear();
    vi.stubGlobal('AudioContext', MeteredAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.stubGlobal('innerWidth', 1440);
    vi.stubGlobal('innerHeight', 900);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function runFrames(count = 1) {
    for (let index = 0; index < count; index++) {
      const pending = frames.splice(0, frames.length);
      act(() => {
        for (const frame of pending) {
          frame(performance.now());
        }
      });
    }
  }

  async function mountWorkspace() {
    const api: ApiRef = { current: null };
    const view = render(
      <ArrangementProvider collection={trackCollection} initialArrangement={trackArrangement()}>
        <StudioWorkspace />
        <TrackProbe api={api} />
      </ArrangementProvider>,
    );
    await flushLoads();
    const row = (trackId: string) => {
      const element = view.container.querySelector<HTMLElement>(`[data-track-id="${trackId}"]`);
      if (!element) {
        throw new Error(`row ${trackId} missing`);
      }
      return element;
    };
    const part = (trackId: string, testId: string) => {
      const element = row(trackId).querySelector<HTMLElement>(`[data-testid="${testId}"]`);
      if (!element) {
        throw new Error(`${testId} missing on ${trackId}`);
      }
      return element;
    };
    return {
      api,
      view,
      row,
      header: (trackId: string) => part(trackId, 'arrangement-track-header'),
      meter: (trackId: string) => part(trackId, 'arrangement-track-meter'),
      fold: (trackId: string) => part(trackId, 'arrangement-track-fold'),
      masterPeak: view.getByTestId('arrangement-master-peak'),
    };
  }

  async function startPlaying(api: ApiRef) {
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    await waitReal(150);
  }

  it('creates 1 + N stereo splitters and 2 + 2N analysers on Play, master first, and passes every track tap', async () => {
    const { api } = await mountWorkspace();
    await startPlaying(api);
    expect(splitters).toHaveLength(1 + TRACK_IDS.length);
    expect(analysers).toHaveLength(2 + 2 * TRACK_IDS.length);
    expect(applyScheduleMock.mock.calls.at(-1)?.[2].tap).toBe(splitters[0]);
    expect(tapAnalysers(splitters[0])).toEqual([analysers[0], analysers[1]]);
    const taps = lastTrackTaps();
    expect([...(taps?.keys() ?? [])].sort()).toEqual([...TRACK_IDS].sort());
    for (const trackId of TRACK_IDS) {
      const tap = trackTapOf(trackId);
      expect(tap).not.toBe(splitters[0]);
      expect(tap.channels).toBe(2);
      expect(tap.channelOutputs.map(([, output]) => output)).toEqual([0, 1]);
      for (const analyser of tapAnalysers(tap)) {
        expect(analyser.fftSize).toBeGreaterThanOrEqual(4096);
      }
    }
    act(() => live(api).togglePlayback());
  });

  it('reuses the same track taps after Pause/Play and after a reschedule edit while playing', async () => {
    const { api } = await mountWorkspace();
    await startPlaying(api);
    const first = new Map(TRACK_IDS.map((trackId) => [trackId, trackTapOf(trackId)]));
    act(() => live(api).togglePlayback());
    act(() => live(api).togglePlayback());
    for (const trackId of TRACK_IDS) {
      expect(trackTapOf(trackId)).toBe(first.get(trackId));
    }
    const graphsBefore = applyScheduleMock.mock.calls.length;
    act(() => live(api).selectClip('music-1'));
    act(() => live(api).nudgeSelectedClip(0.5));
    expect(applyScheduleMock.mock.calls.length).toBe(graphsBefore + 1);
    for (const trackId of TRACK_IDS) {
      expect(trackTapOf(trackId)).toBe(first.get(trackId));
    }
    expect(splitters).toHaveLength(1 + TRACK_IDS.length);
    act(() => live(api).togglePlayback());
  });

  it('meters each track independently: music −12, SFX −6, video silent', async () => {
    const { api, meter } = await mountWorkspace();
    expect(meter('music').getAttribute('data-level-db')).toBe('-inf');
    await startPlaying(api);
    setTrackLevel('music', MINUS_12_DBFS);
    setTrackLevel('sfx', MINUS_6_DBFS);
    runFrames(3);
    expect(meter('music').getAttribute('data-level-db')).toBe('-12.0');
    expect(meter('music').getAttribute('data-hold-db')).toBe('-12.0');
    expect(meter('music').getAttribute('data-peak')).toBe('−12.0');
    expect(meter('sfx').getAttribute('data-level-db')).toBe('-6.0');
    expect(meter('sfx').getAttribute('data-peak')).toBe('−6.0');
    expect(meter('video').getAttribute('data-level-db')).toBe('-inf');
    expect(meter('video').getAttribute('data-peak')).toBe('−∞');
    for (const trackId of TRACK_IDS) {
      expect(meter(trackId).getAttribute('data-state')).toBe('clear');
    }
    act(() => live(api).togglePlayback());
  });

  it('latches an over on the SFX track only (+3.5, warning, sr-only text) and leaves music clear', async () => {
    const { api, meter, header } = await mountWorkspace();
    await startPlaying(api);
    setTrackLevel('music', MINUS_12_DBFS);
    setTrackLevel('sfx', 1.5);
    runFrames(1);
    expect(meter('sfx').getAttribute('data-state')).toBe('over');
    expect(meter('sfx').getAttribute('data-peak')).toBe('+3.5');
    expect(header('sfx').textContent).toContain('SFX: დონემ 0 dBFS-ს გადააჭარბა');
    expect(meter('sfx').getAttribute('title')).toBe(
      'SFX · Peak +3.5 dBFS — 0 dBFS-ს გადააჭარბა. გასასუფთავებლად დააჭირე Master Peak-ს',
    );
    expect(meter('sfx').querySelector('[data-testid="arrangement-track-meter-over"]')).not.toBe(
      null,
    );
    expect(meter('music').getAttribute('data-state')).toBe('clear');
    expect(meter('music').getAttribute('title')).toBe('მუსიკა · Peak −12.0 dBFS');
    expect(meter('music').querySelector('[data-testid="arrangement-track-meter-over"]')).toBe(null);
    expect(header('music').textContent).not.toContain('გადააჭარბა');
    act(() => live(api).togglePlayback());
  });

  it('keeps the track latch through quiet frames and Pause/Play', async () => {
    const { api, meter } = await mountWorkspace();
    await startPlaying(api);
    setTrackLevel('sfx', 1.5);
    runFrames(1);
    setTrackLevel('sfx', 0.1);
    runFrames(10);
    expect(meter('sfx').getAttribute('data-state')).toBe('over');
    expect(meter('sfx').getAttribute('data-peak')).toBe('+3.5');
    act(() => live(api).togglePlayback());
    expect(meter('sfx').getAttribute('data-state')).toBe('over');
    act(() => live(api).togglePlayback());
    await waitReal(100);
    runFrames(3);
    expect(meter('sfx').getAttribute('data-state')).toBe('over');
    expect(meter('sfx').getAttribute('data-peak')).toBe('+3.5');
    act(() => live(api).togglePlayback());
  });

  it('a Master Peak click clears the Master and the SFX latch with no history entry and no status', async () => {
    const { api, meter, header, masterPeak } = await mountWorkspace();
    act(() => live(api).toggleMasterMute());
    act(() => live(api).toggleMasterMute());
    const undoBefore = live(api).undoLabel;
    const arrangementBefore = live(api).arrangement;
    await startPlaying(api);
    const statusBefore = live(api).status;
    setMasterLevel(1.5);
    setTrackLevel('sfx', 1.5);
    runFrames(2);
    expect(masterPeak.getAttribute('data-state')).toBe('over');
    expect(meter('sfx').getAttribute('data-state')).toBe('over');
    const graphsBefore = applyScheduleMock.mock.calls.length;
    fakeClock.frozenAt = Date.now() / 1000 - fakeClock.base;
    fireEvent.click(masterPeak);
    expect(masterPeak.getAttribute('data-state')).toBe('clear');
    expect(masterPeak.textContent).toBe('−∞');
    expect(meter('sfx').getAttribute('data-state')).toBe('clear');
    expect(meter('sfx').getAttribute('data-peak')).toBe('−∞');
    expect(meter('sfx').getAttribute('title')).toBe('SFX · Peak −∞ dBFS');
    expect(header('sfx').textContent).not.toContain('გადააჭარბა');
    expect(live(api).undoLabel).toBe(undoBefore);
    expect(live(api).arrangement).toBe(arrangementBefore);
    expect(live(api).status).toBe(statusBefore);
    expect(applyScheduleMock.mock.calls.length).toBe(graphsBefore);
    runFrames(1);
    expect(meter('sfx').getAttribute('data-state')).toBe('clear');
    fakeClock.frozenAt = null;
    act(() => live(api).togglePlayback());
  });

  it('Pause floors every track meter to -inf/-inf and keeps data-peak', async () => {
    const { api, meter } = await mountWorkspace();
    await startPlaying(api);
    setTrackLevel('music', MINUS_12_DBFS);
    setTrackLevel('sfx', MINUS_6_DBFS);
    runFrames(2);
    act(() => live(api).togglePlayback());
    for (const trackId of TRACK_IDS) {
      expect(meter(trackId).getAttribute('data-level-db')).toBe('-inf');
      expect(meter(trackId).getAttribute('data-hold-db')).toBe('-inf');
    }
    expect(meter('music').getAttribute('data-peak')).toBe('−12.0');
    expect(meter('sfx').getAttribute('data-peak')).toBe('−6.0');
  });

  it('keeps a hidden, unfocusable meter absolutely inside every header, folded included, without changing the Tab stops', async () => {
    const { meter, header, fold, row } = await mountWorkspace();
    const focusables = (element: HTMLElement) =>
      [
        ...element.querySelectorAll<HTMLElement>('button, input, [tabindex], a[href], select'),
      ].filter((node) => !node.hasAttribute('hidden') && node.tabIndex >= 0);
    fireEvent.click(fold('sfx'));
    expect(row('sfx').getAttribute('data-track-folded')).toBe('true');
    for (const trackId of TRACK_IDS) {
      const element = meter(trackId);
      expect(header(trackId).contains(element)).toBe(true);
      expect(element.getAttribute('aria-hidden')).toBe('true');
      expect(element.className).toContain('absolute');
      expect(element.tabIndex).toBe(-1);
      expect(focusables(element)).toEqual([]);
      expect(header(trackId).style.height).toBe('');
      expect(header(trackId).nextElementSibling).not.toBe(null);
      const withMeter = focusables(header(trackId));
      element.remove();
      expect(focusables(header(trackId))).toEqual(withMeter);
    }
  });

  it('renders ArrangementLane and ArrangementTrackMeter 0 times per frame and one meter once on its latch and its reset', async () => {
    const { api, meter, masterPeak } = await mountWorkspace();
    await startPlaying(api);
    for (const trackId of TRACK_IDS) {
      setTrackLevel(trackId, MINUS_12_DBFS);
    }
    setMasterLevel(MINUS_6_DBFS);
    runFrames(1);
    renderLog.counts.clear();
    runFrames(30);
    expect(meter('music').getAttribute('data-level-db')).toBe('-12.0');
    expect(renderLog.counts.get('ArrangementLane') ?? 0).toBe(0);
    expect(renderLog.counts.get('ArrangementTrackMeter') ?? 0).toBe(0);
    setTrackLevel('sfx', 1.5);
    runFrames(1);
    expect(meter('sfx').getAttribute('data-state')).toBe('over');
    expect(renderLog.counts.get('ArrangementTrackMeter') ?? 0).toBe(1);
    expect(renderLog.counts.get('ArrangementLane') ?? 0).toBe(0);
    setTrackLevel('sfx', MINUS_12_DBFS);
    renderLog.counts.clear();
    runFrames(10);
    expect(renderLog.counts.get('ArrangementTrackMeter') ?? 0).toBe(0);
    fireEvent.click(masterPeak);
    expect(meter('sfx').getAttribute('data-state')).toBe('clear');
    expect(renderLog.counts.get('ArrangementTrackMeter') ?? 0).toBe(1);
    expect(renderLog.counts.get('ArrangementLane') ?? 0).toBe(0);
    act(() => live(api).togglePlayback());
  });

  it('without createAnalyser, Play works, no track taps are passed and every track meter stays -inf', async () => {
    vi.stubGlobal('AudioContext', PlainAudioContext);
    const { api, meter } = await mountWorkspace();
    await startPlaying(api);
    expect(() => runFrames(5)).not.toThrow();
    expect(live(api).isPlaying).toBe(true);
    const taps = lastTrackTaps();
    expect(taps === undefined || taps.size === 0).toBe(true);
    for (const trackId of TRACK_IDS) {
      expect(meter(trackId).getAttribute('data-level-db')).toBe('-inf');
      expect(meter(trackId).getAttribute('data-state')).toBe('clear');
    }
    act(() => live(api).togglePlayback());
  });

  it('unsubscribes every master and track meter subscription exactly once on unmount', async () => {
    const stores: StoreRef = { master: null, tracks: null };
    const view = render(
      <ArrangementProvider collection={trackCollection} initialArrangement={trackArrangement()}>
        <StoreProbe stores={stores} />
      </ArrangementProvider>,
    );
    await flushLoads();
    const master = stores.master;
    const tracks = stores.tracks;
    if (!master || !tracks) {
      throw new Error('stores missing');
    }
    const masterUnsubscribes: Array<ReturnType<typeof vi.fn>> = [];
    const trackUnsubscribes: Array<ReturnType<typeof vi.fn>> = [];
    const subscribeMeter = master.subscribeMeter;
    master.subscribeMeter = (listener) => {
      const spy = vi.fn(subscribeMeter(listener));
      masterUnsubscribes.push(spy);
      return spy;
    };
    const subscribeTrackMeters = tracks.subscribeTrackMeters;
    tracks.subscribeTrackMeters = (listener) => {
      const spy = vi.fn(subscribeTrackMeters(listener));
      trackUnsubscribes.push(spy);
      return spy;
    };
    view.rerender(
      <ArrangementProvider collection={trackCollection} initialArrangement={trackArrangement()}>
        <StoreProbe stores={stores} />
        <StudioWorkspace />
      </ArrangementProvider>,
    );
    await flushLoads();
    expect(view.getAllByTestId('arrangement-track-meter')).toHaveLength(TRACK_IDS.length);
    expect(masterUnsubscribes.length).toBeGreaterThanOrEqual(2);
    expect(trackUnsubscribes.length).toBeGreaterThanOrEqual(2 * TRACK_IDS.length);
    view.unmount();
    for (const spy of [...masterUnsubscribes, ...trackUnsubscribes]) {
      expect(spy).toHaveBeenCalledTimes(1);
    }
    expect(() => master.publishMeterFrame(master.getMeterFrame())).not.toThrow();
    expect(() => tracks.publishTrackMeterFrames(new Map())).not.toThrow();
  });
});
