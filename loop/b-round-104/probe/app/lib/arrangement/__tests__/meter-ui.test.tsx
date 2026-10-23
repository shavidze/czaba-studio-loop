import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementExportDialog } from '~/components/arrangement/ArrangementExportDialog';
import { ArrangementMaster } from '~/components/arrangement/ArrangementMaster';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { applySchedule } from '~/lib/arrangement/graph.client';
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
    <a href={to} className={className} data-testid="arrangement-exit">
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
const meterSignal: { value: number; right: number | null } = { value: 0, right: null };
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
  reads = 0;
  constructor(readonly channel: number) {
    super();
  }
  getFloatTimeDomainData(target: Float32Array) {
    this.reads += 1;
    target.fill(this.channel === 1 ? (meterSignal.right ?? meterSignal.value) : meterSignal.value);
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
    const analyser = new FakeAnalyser(analysers.length);
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

const meterCollection: WorkspaceCollection = {
  id: 'meter',
  label: 'meter',
  origin: 'demo',
  sources: [{ id: 'song', title: 'Song', collectionLabel: 'meter', kind: 'music', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function meterArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
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
    ],
  };
}

interface MeterApiRef {
  current: ArrangementContextValue | null;
}

function MeterProbe({ api }: { api: MeterApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: MeterApiRef): ArrangementContextValue {
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

const MINUS_12_DBFS = 10 ** (-12 / 20);
const CLEAR_SUFFIX = 'dBFS — გასასუფთავებლად დააჭირე';
const OVER_SUFFIX = 'dBFS — გადატვირთვა (Clip). გასასუფთავებლად დააჭირე';

describe('Master meter and Master Peak (SRW-13 stage 2a, D-29q)', () => {
  const frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    frames.length = 0;
    analysers.length = 0;
    splitters.length = 0;
    meterSignal.value = 0;
    meterSignal.right = null;
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

  async function mountMaster() {
    const api: MeterApiRef = { current: null };
    const view = render(
      <ArrangementProvider collection={meterCollection} initialArrangement={meterArrangement()}>
        <ArrangementMaster />
        <MeterProbe api={api} />
      </ArrangementProvider>,
    );
    await flushLoads();
    const meter = view.getByTestId('arrangement-master-meter');
    const peak = view.getByTestId('arrangement-master-peak');
    return { api, view, meter, peak };
  }

  async function startPlaying(api: MeterApiRef) {
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    await waitReal(150);
  }

  it('creates one stereo splitter with an analyser per channel (fftSize ≥ 4096) as the live tap', async () => {
    const { api } = await mountMaster();
    await startPlaying(api);
    expect(splitters).toHaveLength(1 + meterArrangement().tracks.length);
    const splitter = splitters[0];
    expect(splitter.channels).toBe(2);
    expect(analysers).toHaveLength(2 + 2 * meterArrangement().tracks.length);
    expect(splitter.channelOutputs).toEqual([
      [analysers[0], 0],
      [analysers[1], 1],
    ]);
    for (const analyser of analysers) {
      expect(analyser.fftSize).toBeGreaterThanOrEqual(4096);
    }
    expect(applyScheduleMock.mock.calls.at(-1)?.[2].tap).toBe(splitter);
    act(() => live(api).togglePlayback());
    act(() => live(api).togglePlayback());
    expect(splitters).toHaveLength(1 + meterArrangement().tracks.length);
    expect(analysers).toHaveLength(2 + 2 * meterArrangement().tracks.length);
    expect(applyScheduleMock.mock.calls.at(-1)?.[2].tap).toBe(splitter);
    act(() => live(api).togglePlayback());
  });

  it('keeps the same tap when an edit reschedules the graph while playing', async () => {
    const { api } = await mountMaster();
    await startPlaying(api);
    const graphsBefore = applyScheduleMock.mock.calls.length;
    act(() => live(api).selectClip('music-1'));
    act(() => live(api).nudgeSelectedClip(0.5));
    expect(applyScheduleMock.mock.calls.length).toBe(graphsBefore + 1);
    expect(applyScheduleMock.mock.calls.at(-1)?.[2].tap).toBe(splitters[0]);
    expect(splitters).toHaveLength(1 + meterArrangement().tracks.length);
    act(() => live(api).togglePlayback());
  });

  it('latches an over that is only on the right channel (no mono down-mix)', async () => {
    const { api, peak } = await mountMaster();
    await startPlaying(api);
    meterSignal.value = 0.3;
    meterSignal.right = 1.2;
    runFrames(1);
    expect(peak.getAttribute('data-state')).toBe('over');
    expect(peak.textContent).toBe('+1.6');
    act(() => live(api).togglePlayback());
  });

  it('shows a −12 dBFS block as level −12.0, Peak text −12.0 and the clear state', async () => {
    const { api, meter, peak } = await mountMaster();
    expect(peak.textContent).toBe('−∞');
    expect(peak.getAttribute('data-state')).toBe('clear');
    expect(meter.getAttribute('aria-hidden')).toBe('true');
    expect(meter.getAttribute('data-level-db')).toBe('-inf');
    await startPlaying(api);
    meterSignal.value = MINUS_12_DBFS;
    runFrames(3);
    expect(analysers[0].reads).toBeGreaterThan(0);
    expect(meter.getAttribute('data-level-db')).toBe('-12.0');
    expect(meter.getAttribute('data-hold-db')).toBe('-12.0');
    expect(peak.textContent).toBe('−12.0');
    expect(peak.getAttribute('data-state')).toBe('clear');
    expect(peak.getAttribute('aria-label')).toBe(`Master Peak −12.0 ${CLEAR_SUFFIX}`);
    act(() => live(api).togglePlayback());
  });

  it('latches over at 1.5, shows +3.5 and keeps it through quiet frames and Pause/Play', async () => {
    const { api, peak } = await mountMaster();
    await startPlaying(api);
    meterSignal.value = 1.5;
    runFrames(1);
    expect(peak.getAttribute('data-state')).toBe('over');
    expect(peak.textContent).toBe('+3.5');
    expect(peak.getAttribute('aria-label')).toBe(`Master Peak +3.5 ${OVER_SUFFIX}`);
    meterSignal.value = 0.1;
    runFrames(10);
    expect(peak.getAttribute('data-state')).toBe('over');
    expect(peak.textContent).toBe('+3.5');
    act(() => live(api).togglePlayback());
    expect(peak.getAttribute('data-state')).toBe('over');
    act(() => live(api).togglePlayback());
    await waitReal(100);
    runFrames(3);
    expect(peak.getAttribute('data-state')).toBe('over');
    expect(peak.textContent).toBe('+3.5');
    act(() => live(api).togglePlayback());
  });

  it('a Master Peak click resets to −∞ and clear with no history entry and no status text', async () => {
    const { api, peak } = await mountMaster();
    act(() => live(api).toggleMasterMute());
    act(() => live(api).toggleMasterMute());
    const undoBefore = live(api).undoLabel;
    const pastBefore = live(api).arrangement;
    await startPlaying(api);
    const statusBefore = live(api).status;
    meterSignal.value = 1.5;
    runFrames(2);
    expect(peak.getAttribute('data-state')).toBe('over');
    const graphsBefore = applyScheduleMock.mock.calls.length;
    fakeClock.frozenAt = Date.now() / 1000 - fakeClock.base;
    fireEvent.click(peak);
    expect(peak.textContent).toBe('−∞');
    expect(peak.getAttribute('data-state')).toBe('clear');
    expect(peak.getAttribute('aria-label')).toBe(`Master Peak −∞ ${CLEAR_SUFFIX}`);
    expect(live(api).undoLabel).toBe(undoBefore);
    expect(live(api).arrangement).toBe(pastBefore);
    expect(live(api).status).toBe(statusBefore);
    expect(applyScheduleMock.mock.calls.length).toBe(graphsBefore);
    runFrames(1);
    expect(peak.getAttribute('data-state')).toBe('clear');
    expect(peak.textContent).toBe('−∞');
    fakeClock.frozenAt = null;
    meterSignal.value = 0.5;
    await waitReal(30);
    runFrames(2);
    expect(peak.textContent).toBe('−6.0');
    expect(peak.getAttribute('data-state')).toBe('clear');
    act(() => live(api).togglePlayback());
  });

  it('ignores a stale analyser block after a reset while paused, before fresh audio arrives', async () => {
    const { api, peak } = await mountMaster();
    await startPlaying(api);
    meterSignal.value = 1.5;
    runFrames(2);
    act(() => live(api).togglePlayback());
    fireEvent.click(peak);
    expect(peak.getAttribute('data-state')).toBe('clear');
    act(() => live(api).togglePlayback());
    runFrames(1);
    expect(peak.getAttribute('data-state')).toBe('clear');
    expect(peak.textContent).toBe('−∞');
    act(() => live(api).togglePlayback());
  });

  it('Pause writes the floor frame: both attributes -inf, the Peak text unchanged', async () => {
    const { api, meter, peak } = await mountMaster();
    await startPlaying(api);
    meterSignal.value = 0.5;
    runFrames(2);
    expect(meter.getAttribute('data-level-db')).toBe('-6.0');
    act(() => live(api).togglePlayback());
    expect(meter.getAttribute('data-level-db')).toBe('-inf');
    expect(meter.getAttribute('data-hold-db')).toBe('-inf');
    expect(peak.textContent).toBe('−6.0');
  });

  it('renders ArrangementMaster and its meter 0 times per frame and at most once on the latch', async () => {
    const { api, peak } = await mountMaster();
    await startPlaying(api);
    meterSignal.value = MINUS_12_DBFS;
    renderLog.counts.clear();
    runFrames(30);
    expect(peak.textContent).toBe('−12.0');
    expect(renderLog.counts.get('ArrangementMaster') ?? 0).toBe(0);
    expect(renderLog.counts.get('ArrangementMasterMeter') ?? 0).toBe(0);
    meterSignal.value = 1.5;
    runFrames(1);
    expect(peak.getAttribute('data-state')).toBe('over');
    const latchRenders =
      (renderLog.counts.get('ArrangementMaster') ?? 0) +
      (renderLog.counts.get('ArrangementMasterMeter') ?? 0);
    expect(latchRenders).toBe(1);
    renderLog.counts.clear();
    runFrames(20);
    expect(renderLog.counts.get('ArrangementMaster') ?? 0).toBe(0);
    expect(renderLog.counts.get('ArrangementMasterMeter') ?? 0).toBe(0);
    fireEvent.click(peak);
    expect(
      (renderLog.counts.get('ArrangementMaster') ?? 0) +
        (renderLog.counts.get('ArrangementMasterMeter') ?? 0),
    ).toBeLessThanOrEqual(1);
    act(() => live(api).togglePlayback());
  });

  it('without createAnalyser, Play works, nothing throws and the meter stays at -inf', async () => {
    vi.stubGlobal('AudioContext', PlainAudioContext);
    const { api, meter, peak } = await mountMaster();
    await startPlaying(api);
    meterSignal.value = 1.5;
    expect(() => runFrames(5)).not.toThrow();
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).getLivePosition()).toBeGreaterThan(0);
    expect(applyScheduleMock.mock.calls.at(-1)?.[2].tap).toBeUndefined();
    expect(meter.getAttribute('data-level-db')).toBe('-inf');
    expect(peak.textContent).toBe('−∞');
    expect(peak.getAttribute('data-state')).toBe('clear');
    act(() => live(api).togglePlayback());
  });

  it('puts Master Peak after Master Volume and before Play in the header', async () => {
    const view = render(
      <ArrangementProvider collection={meterCollection} initialArrangement={meterArrangement()}>
        <StudioWorkspace />
      </ArrangementProvider>,
    );
    await flushLoads();
    const group = view.getByRole('group', { name: 'Master' });
    const fader = view.getByRole('slider', { name: 'Master Volume' });
    const peak = view.getByRole('button', { name: /^Master Peak / });
    const play = view.getByRole('button', { name: 'Play' });
    expect(group.contains(peak)).toBe(true);
    expect(peak.getAttribute('data-testid')).toBe('arrangement-master-peak');
    expect(peak.hasAttribute('disabled')).toBe(false);
    expect(fader.compareDocumentPosition(peak) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(peak.compareDocumentPosition(play) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(view.getByTestId('arrangement-master-meter').getAttribute('aria-hidden')).toBe('true');
  });

  describe('R26-X export dialog', () => {
    it('hides the gain note while Master is muted and shows it again when unmuted', async () => {
      const api: MeterApiRef = { current: null };
      const view = render(
        <ArrangementProvider collection={meterCollection} initialArrangement={meterArrangement()}>
          <ArrangementExportDialog isOpen onClose={() => undefined} />
          <MeterProbe api={api} />
        </ArrangementProvider>,
      );
      await flushLoads();
      act(() => live(api).previewMasterGain(-5));
      act(() => live(api).commitMasterGain());
      act(() => live(api).toggleMasterMute());
      expect(view.getByTestId('arrangement-export-master-mute')).toBeTruthy();
      expect(view.queryByTestId('arrangement-export-master-gain')).toBeNull();
      act(() => live(api).toggleMasterMute());
      expect(view.queryByTestId('arrangement-export-master-mute')).toBeNull();
      expect(view.getByTestId('arrangement-export-master-gain').textContent).toBe(
        'Master: −5.0 dB — ექსპორტში შედის.',
      );
    });
  });
});
