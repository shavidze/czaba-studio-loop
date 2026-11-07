import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { addClip, createArrangement } from '../model';
import { studioPlaybackStrings } from '../strings';
import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';

const fakeClock = { base: 0 };
const startFailure = { armedAt: 0, calls: 0, thrown: 0 };

class FakeParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
  setValueAtTime() {}
  linearRampToValueAtTime() {}
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
  started = false;
  stops = 0;
  start() {
    if (startFailure.armedAt > 0) {
      startFailure.calls += 1;
      if (startFailure.calls === startFailure.armedAt) {
        startFailure.armedAt = 0;
        startFailure.calls = 0;
        startFailure.thrown += 1;
        throw new Error('injected start failure');
      }
    }
    this.started = true;
  }
  stop() {
    this.stops += 1;
  }
}

const createdSources: FakeSource[] = [];

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
    const source = new FakeSource();
    createdSources.push(source);
    return source;
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

const SAMPLE_RATE = 48000;
const SOURCE_SECONDS = 4;

function failureCollection(): WorkspaceCollection {
  return {
    id: 'schedule-failure',
    label: 'schedule-failure',
    origin: 'demo',
    sources: [
      { id: 'one', title: 'One', collectionLabel: 'schedule-failure', kind: 'sfx', origin: 'demo' },
      { id: 'two', title: 'Two', collectionLabel: 'schedule-failure', kind: 'sfx', origin: 'demo' },
    ],
    loadSource: () =>
      Promise.resolve(
        new AudioBuffer({
          length: SOURCE_SECONDS * SAMPLE_RATE,
          numberOfChannels: 2,
          sampleRate: SAMPLE_RATE,
        }),
      ),
  };
}

function twoClipArrangement(loop: Arrangement['loop'] = null): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  const first = addClip(base, {
    trackId: 'music',
    sourceId: 'one',
    desiredStart: 0,
    sourceDuration: SOURCE_SECONDS,
  });
  if (!first) {
    throw new Error('first clip not added');
  }
  const second = addClip(first.arrangement, {
    trackId: 'sfx',
    sourceId: 'two',
    desiredStart: 0,
    sourceDuration: SOURCE_SECONDS,
  });
  if (!second) {
    throw new Error('second clip not added');
  }
  return { ...second.arrangement, loop };
}

interface ProbeRef {
  current: WorkspaceProbeValue | null;
}

function FailureProbe({ api }: { api: ProbeRef }) {
  api.current = useWorkspaceProbe();
  return null;
}

function live(api: ProbeRef): WorkspaceProbeValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flushAsync(rounds = 5) {
  for (let i = 0; i < rounds; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

async function mountFailure(loop: Arrangement['loop'] = null) {
  const api: ProbeRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={failureCollection()}
      initialArrangement={twoClipArrangement(loop)}
    >
      <FailureProbe api={api} />
    </ArrangementProvider>,
  );
  await flushAsync();
  expect(live(api).sourceStates.one?.status).toBe('ready');
  expect(live(api).sourceStates.two?.status).toBe('ready');
  return { api, view };
}

function startedWithoutStop(): number {
  return createdSources.filter((source) => source.started && source.stops === 0).length;
}

function armStartFailure(nth: number) {
  startFailure.armedAt = nth;
  startFailure.calls = 0;
}

describe('schedule failure stops playback with a status (GATE-B385-M2)', () => {
  const errors: unknown[] = [];
  const onError = (event: ErrorEvent) => {
    errors.push(event.error);
  };
  const onRejection = (reason: unknown) => {
    errors.push(reason);
  };

  beforeEach(() => {
    errors.length = 0;
    createdSources.length = 0;
    startFailure.armedAt = 0;
    startFailure.calls = 0;
    startFailure.thrown = 0;
    fakeClock.base = Date.now() / 1000 - 5;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    window.addEventListener('error', onError);
    process.on('unhandledRejection', onRejection);
  });

  afterEach(() => {
    window.removeEventListener('error', onError);
    process.off('unhandledRejection', onRejection);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('SF1: a Play whose second source start throws stops at the start point with a status and leaves nothing sounding', async () => {
    const { api } = await mountFailure();
    armStartFailure(2);
    act(() => live(api).togglePlayback());
    await flushAsync(1);
    expect(startFailure.thrown).toBe(1);
    expect(errors).toEqual([]);
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).status).toBe(studioPlaybackStrings.scheduleFailed);
    expect(startedWithoutStop()).toBe(0);
    expect(live(api).getLivePosition()).toBe(0);
  });

  it('SF2: a repeated Play throw keeps the failure status, then a clean Play plays from the start point', async () => {
    const { api } = await mountFailure();
    armStartFailure(2);
    act(() => live(api).togglePlayback());
    armStartFailure(1);
    act(() => live(api).togglePlayback());
    await flushAsync(1);
    expect(startFailure.thrown).toBe(2);
    expect(errors).toEqual([]);
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).status).toBe(studioPlaybackStrings.scheduleFailed);
    expect(startedWithoutStop()).toBe(0);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).status.startsWith('Playing from 00:00.000')).toBe(true);
    expect(startedWithoutStop()).toBe(2);
    act(() => live(api).togglePlayback());
    expect(startedWithoutStop()).toBe(0);
  });

  it('SF3: an edit while playing whose reschedule throws keeps the edit, stops the old graph and shows the status', async () => {
    const { api } = await mountFailure();
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    const clipsBefore = live(api).arrangement.clips.length;
    armStartFailure(2);
    act(() => live(api).addSourceToActiveTrack('one'));
    await flushAsync();
    expect(startFailure.thrown).toBe(1);
    expect(errors).toEqual([]);
    expect(live(api).arrangement.clips).toHaveLength(clipsBefore + 1);
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).status).toBe(studioPlaybackStrings.scheduleFailed);
    expect(startedWithoutStop()).toBe(0);
  });

  it('SF4: a seek while playing whose reschedule throws stops at the seek target with the status', async () => {
    const { api } = await mountFailure();
    act(() => live(api).togglePlayback());
    armStartFailure(1);
    act(() => live(api).seekTo(2));
    await flushAsync(1);
    expect(startFailure.thrown).toBe(1);
    expect(errors).toEqual([]);
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).status).toBe(studioPlaybackStrings.scheduleFailed);
    expect(live(api).getLivePosition()).toBe(2);
    expect(startedWithoutStop()).toBe(0);
  });

  it('SF5: a scrub while playing whose reschedule throws stops at the scrub point, and the scrub end leaves the marker there', async () => {
    const { api } = await mountFailure();
    act(() => live(api).togglePlayback());
    armStartFailure(1);
    act(() => live(api).scrubPlayhead(1.5));
    await flushAsync(1);
    expect(startFailure.thrown).toBe(1);
    expect(errors).toEqual([]);
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).status).toBe(studioPlaybackStrings.scheduleFailed);
    expect(live(api).getLivePosition()).toBe(1.5);
    act(() => live(api).endPlayheadScrub(1.5));
    expect(errors).toEqual([]);
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).getLocatorPosition()).toBe(1.5);
    expect(startedWithoutStop()).toBe(0);
  });

  it('SF7: a scrub end while playing whose reschedule throws stops at the release point with the status', async () => {
    const { api } = await mountFailure();
    act(() => live(api).togglePlayback());
    act(() => live(api).scrubPlayhead(1));
    expect(live(api).isPlaying).toBe(true);
    armStartFailure(1);
    act(() => live(api).endPlayheadScrub(1.5));
    await flushAsync(1);
    expect(startFailure.thrown).toBe(1);
    expect(errors).toEqual([]);
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).status).toBe(studioPlaybackStrings.scheduleFailed);
    expect(live(api).getLivePosition()).toBe(1.5);
    expect(startedWithoutStop()).toBe(0);
  });

  it('SF8: an edit that removes time while playing and whose reschedule throws stops at the remapped position', async () => {
    const { api } = await mountFailure();
    act(() => live(api).playFrom(3));
    expect(live(api).isPlaying).toBe(true);
    act(() => live(api).setTimeRange({ start: 0, end: 2, trackId: 'music' }));
    armStartFailure(1);
    act(() => live(api).cutTimeSelection());
    await flushAsync(1);
    expect(startFailure.thrown).toBe(1);
    expect(errors).toEqual([]);
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).status).toBe(studioPlaybackStrings.scheduleFailed);
    expect(live(api).getLivePosition()).toBeCloseTo(1, 1);
    expect(startedWithoutStop()).toBe(0);
  });

  it('SF9: a Play whose first loop iteration fill throws inside the build stops at the start point with the status', async () => {
    const { api } = await mountFailure({ start: 0, end: 0.5, enabled: true });
    armStartFailure(3);
    act(() => live(api).togglePlayback());
    await flushAsync(1);
    expect(startFailure.thrown).toBe(1);
    expect(errors).toEqual([]);
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).status).toBe(studioPlaybackStrings.scheduleFailed);
    expect(live(api).getLivePosition()).toBe(0);
    expect(startedWithoutStop()).toBe(0);
  });

  it('SF10: a clean Play right after a failed Play in the same task keeps playing and is not overwritten by the failure text', async () => {
    const { api } = await mountFailure();
    armStartFailure(2);
    act(() => {
      live(api).togglePlayback();
      live(api).togglePlayback();
    });
    await flushAsync(1);
    expect(startFailure.thrown).toBe(1);
    expect(errors).toEqual([]);
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).status).not.toBe(studioPlaybackStrings.scheduleFailed);
    expect(startedWithoutStop()).toBe(2);
    act(() => live(api).togglePlayback());
    expect(startedWithoutStop()).toBe(0);
  });

  it('SF6: a loop iteration appended by the audio pump that throws stops playback with the status', async () => {
    const { api } = await mountFailure({ start: 0, end: 0.5, enabled: true });
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    armStartFailure(1);
    for (let i = 0; i < 20 && startFailure.thrown === 0; i++) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });
    }
    await flushAsync(1);
    expect(startFailure.thrown).toBe(1);
    expect(errors).toEqual([]);
    expect(live(api).isPlaying).toBe(false);
    expect(live(api).status).toBe(studioPlaybackStrings.scheduleFailed);
    expect(startedWithoutStop()).toBe(0);
  });
});
