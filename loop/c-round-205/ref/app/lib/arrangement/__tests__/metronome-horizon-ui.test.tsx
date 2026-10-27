import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import {
  type ApplyScheduleOptions,
  applySchedule,
  type ScheduleHandle,
} from '~/lib/arrangement/graph.client';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { type MetronomeClick, planMetronomeClicks } from '../metronome';
import { ARRANGEMENT_EPS, createArrangement } from '../model';

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
    renderArrangementWav: vi.fn(),
  };
});

const applyScheduleMock = vi.mocked(applySchedule);

const fakeClock = { base: 0 };

function fakeNow(): number {
  return Date.now() / 1000 - fakeClock.base;
}

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

const startedSources: FakeSource[] = [];

class FakeSource extends FakeNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  starts: Array<[number, number, number]> = [];
  calledAt: number[] = [];
  start(when: number, offset: number, duration: number) {
    this.starts.push([when, offset, duration]);
    this.calledAt.push(fakeNow());
    startedSources.push(this);
  }
  stop() {}
}

class FakeAudioContext {
  state = 'running';
  destination = new FakeNode();
  sampleRate = 48000;
  get currentTime() {
    return fakeNow();
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
  copyToChannel() {}
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

const horizonCollection: WorkspaceCollection = {
  id: 'horizon',
  label: 'horizon',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'horizon', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 6000, numberOfChannels: 1, sampleRate: 100 }),
};

const HORIZON_CLIPS: ArrangementClip[] = [
  { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 60 },
];

const PROJECT_END = 60;

function horizonArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips: HORIZON_CLIPS };
}

interface HorizonApiRef {
  current: ArrangementContextValue | null;
}

function HorizonProbe({ api }: { api: HorizonApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: HorizonApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountHorizonWorkspace() {
  vi.useFakeTimers({
    toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout', 'Date'],
  });
  fakeClock.base = Date.now() / 1000;
  const api: HorizonApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={horizonCollection} initialArrangement={horizonArrangement()}>
      <StudioWorkspace />
      <HorizonProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return { api, view };
}

type HorizonView = Awaited<ReturnType<typeof mountHorizonWorkspace>>['view'];

function commitTempo(view: HorizonView, text: string) {
  const input = view.getByTestId('arrangement-tempo-input');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('tempo input missing');
  }
  act(() => input.focus());
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

function clickMetronome(view: HorizonView) {
  const button = view.getByTestId('arrangement-metronome-toggle');
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error('metronome toggle missing');
  }
  fireEvent.click(button);
}

function togglePlay(api: HorizonApiRef) {
  act(() => live(api).togglePlayback());
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function advanceInSteps(untilSeconds: number) {
  while (fakeNow() < untilSeconds) {
    advance(200);
  }
}

type AppendClicksSpy = MockInstance<ScheduleHandle['appendClicks']>;

interface TrackedGraph {
  options: ApplyScheduleOptions<unknown>;
  appendClicks: AppendClicksSpy;
}

function trackGraphs(tracked: TrackedGraph[]): TrackedGraph[] {
  const calls = applyScheduleMock.mock.calls;
  const results = applyScheduleMock.mock.results;
  for (let i = tracked.length; i < results.length; i++) {
    const result = results[i];
    if (result.type !== 'return') {
      throw new Error('graph creation failed');
    }
    tracked.push({ options: calls[i][2], appendClicks: vi.spyOn(result.value, 'appendClicks') });
  }
  return tracked;
}

function appendedClicks(graph: TrackedGraph): MetronomeClick[] {
  return graph.appendClicks.mock.calls.flatMap(([clicks]) => [...clicks]);
}

function beatTime(click: MetronomeClick): number {
  return click.when - click.offset;
}

function isClickSource(source: FakeSource, options: ApplyScheduleOptions<unknown>): boolean {
  const metronome = options.metronome;
  return (
    metronome !== undefined &&
    (source.buffer === metronome.accent || source.buffer === metronome.beat)
  );
}

beforeEach(() => {
  startedSources.length = 0;
  applyScheduleMock.mockClear();
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
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('D-29z36 metronome horizon refill in the mounted workspace', { timeout: 15_000 }, () => {
  it('HU1 Play from 0 schedules only the first 2 s of clicks', async () => {
    const { api, view } = await mountHorizonWorkspace();
    commitTempo(view, '120');
    clickMetronome(view);
    togglePlay(api);
    const [graph] = trackGraphs([]);
    expect(graph.options.from).toBe(0);
    expect(graph.options.metronome?.clicks).toEqual(planMetronomeClicks(120, 0, 2, PROJECT_END));
    expect(graph.options.metronome?.clicks).toHaveLength(4);
    expect(startedSources.filter((source) => isClickSource(source, graph.options))).toHaveLength(4);
  });

  it('HU2 the pump refills every beat exactly once to the end, never late, then stops appending', async () => {
    const { api, view } = await mountHorizonWorkspace();
    commitTempo(view, '120');
    clickMetronome(view);
    togglePlay(api);
    const graphs = trackGraphs([]);
    advanceInSteps(61);
    trackGraphs(graphs);
    expect(graphs).toHaveLength(1);
    const { options } = graphs[0];
    const clickSources = startedSources.filter((source) => isClickSource(source, options));
    const heard = clickSources
      .map((source) => {
        const [when, offset] = source.starts[0];
        return {
          beat: when - options.startAt + options.from - offset,
          accent: source.buffer === options.metronome?.accent,
        };
      })
      .sort((a, b) => a.beat - b.beat);
    const expected = planMetronomeClicks(120, 0, PROJECT_END);
    expect(expected).toHaveLength(120);
    expect(heard).toHaveLength(expected.length);
    heard.forEach((entry, index) => {
      expect(entry.beat).toBeCloseTo(beatTime(expected[index]), 9);
      expect(entry.accent).toBe(expected[index].accent);
    });
    const lateStarts = clickSources.filter(
      (source) => source.starts[0][0] < source.calledAt[0] - 1e-9,
    );
    expect(lateStarts).toHaveLength(0);
    const calls = graphs[0].appendClicks.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.at(-1)?.[0].at(-1)?.when).toBe(59.5);
    const count = calls.length;
    advanceInSteps(63);
    expect(graphs[0].appendClicks).toHaveBeenCalledTimes(count);
  });

  it('HU3 a seek replaces the horizon: the old graph gets nothing, the new one continues', async () => {
    const { api, view } = await mountHorizonWorkspace();
    commitTempo(view, '120');
    clickMetronome(view);
    togglePlay(api);
    advanceInSteps(5);
    const graphs = trackGraphs([]);
    act(() => live(api).seekTo(30.2));
    trackGraphs(graphs);
    expect(graphs).toHaveLength(2);
    const [previous, next] = graphs;
    const from = next.options.from;
    expect(from).toBeCloseTo(30.2, 9);
    expect(next.options.metronome?.clicks).toEqual(
      planMetronomeClicks(120, from, from + 2, PROJECT_END),
    );
    const previousCount = previous.appendClicks.mock.calls.length;
    advance(3000);
    expect(previous.appendClicks).toHaveBeenCalledTimes(previousCount);
    const appended = appendedClicks(next);
    expect(appended.length).toBeGreaterThan(0);
    for (const [, appendFrom, appendStartAt] of next.appendClicks.mock.calls) {
      expect(appendFrom).toBe(next.options.from);
      expect(appendStartAt).toBe(next.options.startAt);
    }
    const continued = planMetronomeClicks(120, from + 2, PROJECT_END, PROJECT_END).slice(
      0,
      appended.length,
    );
    expect(appended).toEqual(continued);
  });

  it('HU4 a late pump drops the missed clicks, never starts one in the past and never resyncs', async () => {
    const { api, view } = await mountHorizonWorkspace();
    commitTempo(view, '120');
    clickMetronome(view);
    togglePlay(api);
    const [graph] = trackGraphs([]);
    advance(4200);
    const before = appendedClicks(graph);
    const lastBeat = beatTime(before[before.length - 1]);
    expect(lastBeat).toBe(7.5);
    const callsBefore = graph.appendClicks.mock.calls.length;
    const sourcesBefore = startedSources.length;
    const graphsBefore = applyScheduleMock.mock.calls.length;
    vi.setSystemTime(Date.now() + 5000);
    advance(200);
    expect(applyScheduleMock.mock.calls.length).toBe(graphsBefore);
    const lateCalls = graph.appendClicks.mock.calls.slice(callsBefore);
    expect(lateCalls.length).toBeGreaterThan(0);
    const fresh = startedSources
      .slice(sourcesBefore)
      .filter((source) => isClickSource(source, graph.options));
    expect(fresh.length).toBeGreaterThan(0);
    for (const source of fresh) {
      expect(source.starts[0][0]).toBeGreaterThanOrEqual(source.calledAt[0] + 0.02 - 1e-9);
    }
    const threshold = fresh[0].calledAt[0] + 0.02 - graph.options.startAt + graph.options.from;
    const lateBeats = lateCalls.flatMap(([clicks]) => clicks.map(beatTime));
    expect(
      lateBeats.filter((beat) => beat > lastBeat && beat < threshold - ARRANGEMENT_EPS),
    ).toEqual([]);
    for (const missed of [8, 8.5, 9]) {
      expect(lateBeats).not.toContain(missed);
    }
    expect(lateBeats[0]).toBe(9.5);
    const expectedFirst = planMetronomeClicks(120, 0, PROJECT_END)
      .map(beatTime)
      .find((beat) => beat >= threshold - ARRANGEMENT_EPS);
    expect(lateBeats[0]).toBe(expectedFirst);
  });

  it('HU5 Stop, or turning the metronome off while playing, ends every refill', async () => {
    const { api, view } = await mountHorizonWorkspace();
    commitTempo(view, '120');
    clickMetronome(view);
    togglePlay(api);
    advanceInSteps(1);
    const graphs = trackGraphs([]);
    const countAtStop = graphs[0].appendClicks.mock.calls.length;
    togglePlay(api);
    expect(live(api).isPlaying).toBe(false);
    advance(5000);
    expect(graphs[0].appendClicks).toHaveBeenCalledTimes(countAtStop);

    togglePlay(api);
    trackGraphs(graphs);
    expect(graphs).toHaveLength(2);
    advance(1000);
    const before = applyScheduleMock.mock.calls.length;
    act(() => {
      clickMetronome(view);
    });
    expect(applyScheduleMock.mock.calls.length).toBe(before + 1);
    trackGraphs(graphs);
    const off = graphs[2];
    expect(off.options.metronome).toBeUndefined();
    const counts = graphs.map((graph) => graph.appendClicks.mock.calls.length);
    advance(5000);
    expect(graphs.map((graph) => graph.appendClicks.mock.calls.length)).toEqual(counts);
    expect(off.appendClicks).not.toHaveBeenCalled();
  });

  it('HU6 a tempo change resyncs once and every later click is on the new beat', async () => {
    const { api, view } = await mountHorizonWorkspace();
    commitTempo(view, '120');
    clickMetronome(view);
    togglePlay(api);
    advanceInSteps(3);
    const graphs = trackGraphs([]);
    const before = applyScheduleMock.mock.calls.length;
    commitTempo(view, '60');
    expect(applyScheduleMock.mock.calls.length).toBe(before + 1);
    trackGraphs(graphs);
    const next = graphs[graphs.length - 1];
    const from = next.options.from;
    expect(next.options.metronome?.clicks).toEqual(
      planMetronomeClicks(60, from, Math.min(PROJECT_END, from + 2), PROJECT_END),
    );
    advanceInSteps(61);
    const all = [...(next.options.metronome?.clicks ?? []), ...appendedClicks(next)];
    expect(all).toEqual(planMetronomeClicks(60, from, PROJECT_END));
    expect(all.map(beatTime).at(-1)).toBe(59);
  });

  it('HU7 near the end every beat sounds once, the last click is whole and nothing is past the end', async () => {
    const { api, view } = await mountHorizonWorkspace();
    commitTempo(view, '120');
    clickMetronome(view);
    act(() => live(api).seekTo(57));
    togglePlay(api);
    const [graph] = trackGraphs([]);
    expect(graph.options.from).toBe(57);
    advanceInSteps(5);
    const clickSources = startedSources.filter((source) => isClickSource(source, graph.options));
    const heard = clickSources
      .map((source) => {
        const [when, offset, duration] = source.starts[0];
        return { beat: when - graph.options.startAt + graph.options.from - offset, duration };
      })
      .sort((a, b) => a.beat - b.beat);
    expect(heard.map((entry) => entry.beat)).toEqual([57, 57.5, 58, 58.5, 59, 59.5]);
    expect(heard[heard.length - 1].duration).toBeCloseTo(0.03, 9);
    const planned = [...(graph.options.metronome?.clicks ?? []), ...appendedClicks(graph)];
    expect(planned.filter((click) => click.when >= PROJECT_END - ARRANGEMENT_EPS)).toEqual([]);
    expect(planned.every((click) => click.when + click.duration <= PROJECT_END + 1e-9)).toBe(true);
  });

  it('HU8 at 999 BPM every scrub-like seek plans at most one horizon of clicks', async () => {
    const { api, view } = await mountHorizonWorkspace();
    commitTempo(view, '999');
    clickMetronome(view);
    togglePlay(api);
    for (let i = 0; i < 20; i++) {
      act(() => live(api).seekTo(1 + i * 2.7));
      advance(50);
    }
    const graphs = trackGraphs([]);
    expect(graphs).toHaveLength(21);
    const bound = Math.ceil((2 * 999) / 60) + 1;
    expect(bound).toBe(35);
    for (const graph of graphs) {
      expect(graph.options.metronome?.clicks.length ?? 0).toBeGreaterThan(0);
      expect(graph.options.metronome?.clicks.length ?? 0).toBeLessThanOrEqual(bound);
    }
  });
});
