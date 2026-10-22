import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import {
  type ApplyScheduleOptions,
  applySchedule,
  renderArrangementWav,
  type ScheduleHandle,
} from '~/lib/arrangement/graph.client';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import {
  METRONOME_NEEDS_TEMPO_TITLE,
  METRONOME_SCHEDULE_HORIZON_SECONDS,
  METRONOME_TITLE,
  metronomeStatusMessage,
  planMetronomeClicks,
} from '../metronome';
import { createArrangement } from '../model';
import { tempoStatusMessage } from '../tempo';

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
const renderWavMock = vi.mocked(renderArrangementWav);

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

const startedSources: FakeSource[] = [];

class FakeSource extends FakeNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  starts: Array<[number, number, number]> = [];
  start(when: number, offset: number, duration: number) {
    this.starts.push([when, offset, duration]);
    startedSources.push(this);
  }
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
  readonly written: Float32Array[] = [];
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
  copyToChannel(source: Float32Array) {
    this.written.push(source);
  }
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

const metronomeCollection: WorkspaceCollection = {
  id: 'grid',
  label: 'grid',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'grid', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'grid', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

const METRONOME_CLIPS: ArrangementClip[] = [
  { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 8 },
  { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0, duration: 2 },
];

const PROJECT_END = 8;

function metronomeArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips: METRONOME_CLIPS };
}

interface MetronomeApiRef {
  current: ArrangementContextValue | null;
}

function MetronomeProbe({ api }: { api: MetronomeApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: MetronomeApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountMetronomeWorkspace() {
  const api: MetronomeApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={metronomeCollection}
      initialArrangement={metronomeArrangement()}
    >
      <StudioWorkspace />
      <MetronomeProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return { api, view };
}

type MetronomeView = Awaited<ReturnType<typeof mountMetronomeWorkspace>>['view'];

function tempoInput(view: MetronomeView): HTMLInputElement {
  const input = view.getByTestId('arrangement-tempo-input');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('tempo input missing');
  }
  return input;
}

function metronomeToggle(view: MetronomeView): HTMLButtonElement {
  const button = view.getByTestId('arrangement-metronome-toggle');
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error('metronome toggle missing');
  }
  return button;
}

function statusText(view: MetronomeView): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function undoTitle(view: MetronomeView): string {
  const button = view.container.querySelector<HTMLButtonElement>('button[title^="Undo"]');
  if (!button) {
    throw new Error('undo button missing');
  }
  return button.title;
}

function commitTempo(view: MetronomeView, text: string) {
  const input = tempoInput(view);
  act(() => input.focus());
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

function clickMetronome(view: MetronomeView) {
  fireEvent.click(metronomeToggle(view));
}

function play(api: MetronomeApiRef) {
  act(() => live(api).togglePlayback());
}

function lastScheduleOptions(): ApplyScheduleOptions<unknown> {
  const call = applyScheduleMock.mock.calls.at(-1);
  if (!call) {
    throw new Error('no graph was created');
  }
  return call[2];
}

function latestHandle(): ScheduleHandle {
  const result = applyScheduleMock.mock.results.at(-1);
  if (!result || result.type !== 'return') {
    throw new Error('no graph was created');
  }
  return result.value;
}

function isClickBuffer(buffer: unknown): boolean {
  return buffer instanceof FakeAudioBuffer && buffer.length === 1440;
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  startedSources.length = 0;
  applyScheduleMock.mockClear();
  renderWavMock.mockReset();
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

describe('SRW-15 stage 2 metronome toggle and live clicks (D-29z31)', { timeout: 15_000 }, () => {
  it('UI1 is disabled and unpressed without a tempo, and Play schedules no metronome', async () => {
    const { api, view } = await mountMetronomeWorkspace();
    const toggle = metronomeToggle(view);
    expect(toggle.textContent).toBe('მეტრონომი');
    expect(toggle.type).toBe('button');
    expect(toggle.disabled).toBe(true);
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(toggle.title).toBe(METRONOME_NEEDS_TEMPO_TITLE);
    play(api);
    expect(live(api).isPlaying).toBe(true);
    expect(lastScheduleOptions().metronome).toBeUndefined();
    expect(startedSources.some((source) => isClickBuffer(source.buffer))).toBe(false);
  });

  it('UI2 turns on at 120 BPM with its status and Play schedules a click on every beat', async () => {
    const { api, view } = await mountMetronomeWorkspace();
    commitTempo(view, '120');
    const toggle = metronomeToggle(view);
    expect(toggle.disabled).toBe(false);
    expect(toggle.title).toBe(METRONOME_TITLE);
    clickMetronome(view);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(statusText(view)).toBe(metronomeStatusMessage(120));
    play(api);
    const options = lastScheduleOptions();
    expect(options.from).toBe(0);
    const expected = planMetronomeClicks(
      120,
      0,
      Math.min(PROJECT_END, METRONOME_SCHEDULE_HORIZON_SECONDS),
      PROJECT_END,
    );
    expect(expected).toHaveLength(4);
    expect(options.metronome?.clicks).toEqual(expected);
    const clickStarts = startedSources.filter((source) => isClickBuffer(source.buffer));
    expect(clickStarts).toHaveLength(4);
    expect(clickStarts[0].starts[0][0]).toBeCloseTo(options.startAt, 9);
    expect(clickStarts[1].starts[0][0]).toBeCloseTo(options.startAt + 0.5, 9);
  });

  it('UI3 turning it off while playing forces one resync without a metronome', async () => {
    const { api, view } = await mountMetronomeWorkspace();
    commitTempo(view, '120');
    clickMetronome(view);
    play(api);
    expect(lastScheduleOptions().metronome).toBeDefined();
    const before = applyScheduleMock.mock.calls.length;
    act(() => {
      clickMetronome(view);
    });
    expect(statusText(view)).toBe(metronomeStatusMessage(null));
    expect(metronomeToggle(view).getAttribute('aria-pressed')).toBe('false');
    expect(applyScheduleMock.mock.calls.length).toBe(before + 1);
    expect(lastScheduleOptions().metronome).toBeUndefined();
    expect(live(api).isPlaying).toBe(true);
  });

  it('UI4 turning it on while playing resyncs once with clicks from the live position', async () => {
    const { api, view } = await mountMetronomeWorkspace();
    commitTempo(view, '120');
    play(api);
    act(() => live(api).seekTo(3.2));
    expect(lastScheduleOptions().metronome).toBeUndefined();
    const before = applyScheduleMock.mock.calls.length;
    act(() => {
      clickMetronome(view);
    });
    expect(applyScheduleMock.mock.calls.length).toBe(before + 1);
    const options = lastScheduleOptions();
    expect(options.from).toBeGreaterThanOrEqual(3.2 - 1e-9);
    expect(options.metronome?.clicks).toEqual(
      planMetronomeClicks(
        120,
        options.from,
        Math.min(PROJECT_END, options.from + METRONOME_SCHEDULE_HORIZON_SECONDS),
        PROJECT_END,
      ),
    );
    expect(options.metronome?.clicks[0].when).toBeGreaterThanOrEqual(options.from);
  });

  it('UI5 a tempo change while it is on resyncs once with the new beat and keeps it pressed', async () => {
    const { api, view } = await mountMetronomeWorkspace();
    commitTempo(view, '120');
    clickMetronome(view);
    play(api);
    const before = applyScheduleMock.mock.calls.length;
    commitTempo(view, '60');
    expect(applyScheduleMock.mock.calls.length).toBe(before + 1);
    const options = lastScheduleOptions();
    expect(options.metronome?.clicks).toEqual(
      planMetronomeClicks(
        60,
        options.from,
        Math.min(PROJECT_END, options.from + METRONOME_SCHEDULE_HORIZON_SECONDS),
        PROJECT_END,
      ),
    );
    expect(statusText(view)).toBe(tempoStatusMessage(60));
    expect(metronomeToggle(view).getAttribute('aria-pressed')).toBe('true');
  });

  it('UI6 clearing the tempo turns it off and setting a tempo again does not re-enable it', async () => {
    const { api, view } = await mountMetronomeWorkspace();
    commitTempo(view, '120');
    clickMetronome(view);
    expect(metronomeToggle(view).getAttribute('aria-pressed')).toBe('true');
    commitTempo(view, '');
    expect(statusText(view)).toBe(tempoStatusMessage(null));
    expect(metronomeToggle(view).disabled).toBe(true);
    expect(metronomeToggle(view).getAttribute('aria-pressed')).toBe('false');
    commitTempo(view, '120');
    expect(metronomeToggle(view).disabled).toBe(false);
    expect(metronomeToggle(view).getAttribute('aria-pressed')).toBe('false');
    play(api);
    expect(lastScheduleOptions().metronome).toBeUndefined();
  });

  it('UI7 plans the clicks for loop iteration 0 and appends them for every refilled iteration', async () => {
    vi.useFakeTimers({
      toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout', 'Date'],
    });
    fakeClock.base = Date.now() / 1000;
    const { api, view } = await mountMetronomeWorkspace();
    act(() => live(api).setTimeRange({ start: 2, end: 5, trackId: 'music' }));
    act(() => live(api).toggleLoopSelection());
    expect(live(api).arrangement.loop).toEqual({ start: 2, end: 5, enabled: true });
    commitTempo(view, '40');
    clickMetronome(view);
    act(() => live(api).seekTo(2));
    play(api);
    const first = lastScheduleOptions();
    expect(first.from).toBe(2);
    expect(first.metronome?.clicks).toEqual(planMetronomeClicks(40, 2, 5));
    const appendClicks = vi.spyOn(latestHandle(), 'appendClicks');
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(appendClicks).toHaveBeenCalledTimes(1);
    const [clicks, from, startAt] = appendClicks.mock.calls[0];
    expect(clicks).toEqual(planMetronomeClicks(40, 2, 5));
    expect(from).toBe(2);
    expect(startAt).toBeCloseTo(first.startAt + 3, 9);
  });

  it('UI8 is not part of history: Undo title, arrangement and Ctrl+Z leave it unchanged', async () => {
    const { api, view } = await mountMetronomeWorkspace();
    commitTempo(view, '120');
    const arrangementBefore = structuredClone(live(api).arrangement);
    const undoBefore = undoTitle(view);
    clickMetronome(view);
    expect(undoTitle(view)).toBe(undoBefore);
    expect(live(api).arrangement).toEqual(arrangementBefore);
    clickMetronome(view);
    expect(undoTitle(view)).toBe(undoBefore);
    expect(live(api).arrangement).toEqual(arrangementBefore);
    expect(live(api).undoLabel).toBeNull();
    clickMetronome(view);
    expect(metronomeToggle(view).getAttribute('aria-pressed')).toBe('true');
    fireEvent.keyDown(document.body, { key: 'z', code: 'KeyZ', ctrlKey: true });
    expect(metronomeToggle(view).getAttribute('aria-pressed')).toBe('true');
    expect(live(api).arrangement).toEqual(arrangementBefore);
  });

  it('UI9 export never receives the metronome: two arguments and the same buffers', async () => {
    renderWavMock.mockResolvedValue({ blob: new Blob(['x']), peak: 0.5, clippedSamples: 0 });
    const { api, view } = await mountMetronomeWorkspace();
    await act(async () => {
      await live(api).exportWav();
    });
    commitTempo(view, '120');
    clickMetronome(view);
    expect(metronomeToggle(view).getAttribute('aria-pressed')).toBe('true');
    await act(async () => {
      await live(api).exportWav();
    });
    expect(renderWavMock).toHaveBeenCalledTimes(2);
    const offCall = renderWavMock.mock.calls[0];
    const onCall = renderWavMock.mock.calls[1];
    expect(onCall).toHaveLength(2);
    expect(onCall[0]).toEqual(live(api).arrangement);
    expect([...onCall[1].keys()]).toEqual([...offCall[1].keys()]);
    for (const buffer of onCall[1].values()) {
      expect(isClickBuffer(buffer)).toBe(false);
    }
  });

  it('UI10 Space on the focused toggle starts playback and does not toggle the metronome', async () => {
    const { api, view } = await mountMetronomeWorkspace();
    commitTempo(view, '120');
    const toggle = metronomeToggle(view);
    act(() => toggle.focus());
    clickMetronome(view);
    expect(document.activeElement).toBe(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(fireEvent.keyDown(toggle, { key: ' ', code: 'Space' })).toBe(false);
    expect(fireEvent.keyUp(toggle, { key: ' ', code: 'Space' })).toBe(false);
    expect(live(api).isPlaying).toBe(true);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(lastScheduleOptions().metronome?.clicks).toEqual(
      planMetronomeClicks(
        120,
        0,
        Math.min(PROJECT_END, METRONOME_SCHEDULE_HORIZON_SECONDS),
        PROJECT_END,
      ),
    );
  });
});
