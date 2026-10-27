import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ArrangementTrack, ScheduledClip } from '~/types/arrangement';
import {
  applySchedule,
  renderArrangementWav,
  type ScheduleAudioContext,
  type ScheduleAudioNode,
  type ScheduleAudioParam,
  type ScheduleGainNode,
  type SchedulePannerNode,
  type ScheduleSourceNode,
} from '../graph.client';
import {
  createMasterMeterState,
  createTrackMeterStore,
  floorTrackMeterFrames,
  type MasterMeterState,
  METER_FLOOR_DB,
  resetTrackMeterPeaks,
  stepMeter,
} from '../meter';
import { createArrangement } from '../model';

interface FakeBuffer {
  id: string;
}

class FakeParam implements ScheduleAudioParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
}

class FakeNode implements ScheduleAudioNode {
  outputs: FakeNode[] = [];
  disconnected = false;
  constructor(readonly kind: string) {}
  connect(destination: ScheduleAudioNode): ScheduleAudioNode {
    if (destination instanceof FakeNode) {
      this.outputs.push(destination);
    }
    return destination;
  }
  disconnect() {
    this.disconnected = true;
    this.outputs = [];
  }
}

class FakeGain extends FakeNode implements ScheduleGainNode {
  gain = new FakeParam();
}

class FakePanner extends FakeNode implements SchedulePannerNode {
  pan = new FakeParam();
}

class FakeSource extends FakeNode implements ScheduleSourceNode<FakeBuffer> {
  buffer: FakeBuffer | null = null;
  onended: ((event: Event) => unknown) | null = null;
  start() {}
  stop() {}
}

class FakeContext implements ScheduleAudioContext<FakeBuffer> {
  currentTime = 10;
  destination = new FakeNode('destination');
  sources: FakeSource[] = [];
  gains: FakeGain[] = [];
  panners: FakePanner[] = [];
  createBufferSource() {
    const source = new FakeSource('source');
    this.sources.push(source);
    return source;
  }
  createGain() {
    const gain = new FakeGain('gain');
    this.gains.push(gain);
    return gain;
  }
  createStereoPanner() {
    const panner = new FakePanner('panner');
    this.panners.push(panner);
    return panner;
  }
  allNodes(): FakeNode[] {
    return [this.destination, ...this.sources, ...this.gains, ...this.panners];
  }
}

function track(id: string, patch: Partial<ArrangementTrack> = {}): ArrangementTrack {
  return { id, kind: 'audio', name: id, volume: 0.8, mute: false, solo: false, ...patch };
}

const tracks = [track('video', { kind: 'video' }), track('music'), track('sfx')];

const plan: ScheduledClip[] = [
  { clipId: 'a', trackId: 'music', sourceId: 'song', when: 5, sourceOffset: 0, duration: 4 },
  { clipId: 'b', trackId: 'sfx', sourceId: 'hit', when: 6, sourceOffset: 0, duration: 1 },
];

const buffers = new Map<string, FakeBuffer>([
  ['song', { id: 'song' }],
  ['hit', { id: 'hit' }],
]);

function pannerOf(ctx: FakeContext, trackId: string): FakePanner {
  const index = tracks.findIndex((entry) => entry.id === trackId);
  const panner = ctx.panners[index];
  if (!panner) {
    throw new Error(`no panner for ${trackId}`);
  }
  return panner;
}

function frameAt(peak: number, over = false, nowMs = 1000): MasterMeterState {
  return stepMeter(createMasterMeterState(), { peak, over }, nowMs);
}

describe('track meter store (SRW-13 stage 2b)', () => {
  it('keeps independent state per track: an over on one track leaves another clear and unchanged', () => {
    const store = createTrackMeterStore();
    const music = frameAt(0.25);
    const sfx = frameAt(1.5, true);
    store.publishTrackMeterFrames(
      new Map([
        ['music', music],
        ['sfx', sfx],
      ]),
    );
    expect(store.getTrackMeterOver('sfx')).toBe(true);
    expect(store.getTrackMeterOver('music')).toBe(false);
    expect(store.getTrackMeterFrame('music').levelDb).toBeCloseTo(20 * Math.log10(0.25), 6);
    expect(store.getTrackMeterFrame('music').maxPeak).toBe(0.25);
    expect(store.getTrackMeterFrame('sfx').maxPeak).toBe(1.5);
    expect(store.getTrackMeterFrame('music')).not.toBe(store.getTrackMeterFrame('sfx'));
  });

  it('notifies each subscriber exactly once per publish, however many tracks it carries', () => {
    const store = createTrackMeterStore();
    const listener = vi.fn();
    store.subscribeTrackMeters(listener);
    store.publishTrackMeterFrames(
      new Map([
        ['video', frameAt(0)],
        ['music', frameAt(0.5)],
        ['sfx', frameAt(0.1)],
      ]),
    );
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('stops notifying after unsubscribe', () => {
    const store = createTrackMeterStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribeTrackMeters(listener);
    unsubscribe();
    store.publishTrackMeterFrames(new Map([['music', frameAt(0.5)]]));
    expect(listener).not.toHaveBeenCalled();
  });

  it('reset clears every track max peak and over latch and keeps the levels', () => {
    const frames = new Map([
      ['music', frameAt(0.5)],
      ['sfx', frameAt(1.5, true)],
    ]);
    const reset = resetTrackMeterPeaks(frames);
    for (const trackId of ['music', 'sfx']) {
      expect(reset.get(trackId)?.maxPeak).toBe(0);
      expect(reset.get(trackId)?.over).toBe(false);
      expect(reset.get(trackId)?.levelDb).toBe(frames.get(trackId)?.levelDb);
    }
    expect(frames.get('sfx')?.over).toBe(true);
  });

  it('floor drops every track level and hold to the floor and keeps max peak and latch', () => {
    const frames = new Map([
      ['music', frameAt(0.5)],
      ['sfx', frameAt(1.5, true)],
    ]);
    const floored = floorTrackMeterFrames(frames);
    for (const trackId of ['music', 'sfx']) {
      expect(floored.get(trackId)?.levelDb).toBe(METER_FLOOR_DB);
      expect(floored.get(trackId)?.holdDb).toBe(METER_FLOOR_DB);
      expect(floored.get(trackId)?.lastMs).toBeNull();
    }
    expect(floored.get('music')?.maxPeak).toBe(0.5);
    expect(floored.get('sfx')?.maxPeak).toBe(1.5);
    expect(floored.get('sfx')?.over).toBe(true);
  });

  it('returns a floor frame, not a throw, for an unknown track id', () => {
    const store = createTrackMeterStore();
    expect(() => store.getTrackMeterFrame('nope')).not.toThrow();
    const frame = store.getTrackMeterFrame('nope');
    expect(frame.levelDb).toBe(METER_FLOOR_DB);
    expect(frame.holdDb).toBe(METER_FLOOR_DB);
    expect(frame.maxPeak).toBe(0);
    expect(store.getTrackMeterOver('nope')).toBe(false);
  });

  it('a later publish does not leak a latch from one track into another', () => {
    const store = createTrackMeterStore();
    store.publishTrackMeterFrames(new Map([['sfx', frameAt(1.5, true)]]));
    store.publishTrackMeterFrames(
      new Map([
        ['sfx', frameAt(0.1)],
        ['music', frameAt(0.1)],
      ]),
    );
    expect(store.getTrackMeterOver('music')).toBe(false);
    expect(store.getTrackMeterFrame('music').maxPeak).toBeCloseTo(0.1, 6);
  });
});

describe('per-track graph taps (post-panner fan-out)', () => {
  it('connects the music panner to the master first and then to its own tap', () => {
    const ctx = new FakeContext();
    const musicTap = new FakeNode('music-tap');
    applySchedule(ctx, plan, {
      buffers,
      tracks,
      from: 5,
      startAt: 10,
      trackTaps: new Map([['music', musicTap]]),
    });
    const master = ctx.gains[0];
    const panner = pannerOf(ctx, 'music');
    expect(panner.outputs).toEqual([master, musicTap]);
    expect(panner.outputs[0]).toBe(master);
  });

  it('leaves a track without a tap wired to the master only', () => {
    const ctx = new FakeContext();
    applySchedule(ctx, plan, {
      buffers,
      tracks,
      from: 5,
      startAt: 10,
      trackTaps: new Map([['music', new FakeNode('music-tap')]]),
    });
    expect(pannerOf(ctx, 'sfx').outputs).toEqual([ctx.gains[0]]);
    expect(pannerOf(ctx, 'video').outputs).toEqual([ctx.gains[0]]);
  });

  it('wires exactly as before when no trackTaps are given', () => {
    const ctx = new FakeContext();
    applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10 });
    const master = ctx.gains[0];
    for (const panner of ctx.panners) {
      expect(panner.outputs).toEqual([master]);
    }
    expect(master.outputs).toEqual([ctx.destination]);
  });

  it('feeds each tap only from its own track panner, never from a track gain, clip, other panner or the master', () => {
    const ctx = new FakeContext();
    const taps = new Map(tracks.map((entry) => [entry.id, new FakeNode(`${entry.id}-tap`)]));
    applySchedule(ctx, plan, { buffers, tracks, from: 5, startAt: 10, trackTaps: taps });
    for (const entry of tracks) {
      const tap = taps.get(entry.id);
      const feeders = ctx.allNodes().filter((node) => node.outputs.some((out) => out === tap));
      expect(feeders).toEqual([pannerOf(ctx, entry.id)]);
    }
    expect(ctx.gains[0].outputs).toEqual([ctx.destination]);
  });

  it('removes the tap connection when the graph is disconnected', () => {
    const ctx = new FakeContext();
    const musicTap = new FakeNode('music-tap');
    const handle = applySchedule(ctx, plan, {
      buffers,
      tracks,
      from: 5,
      startAt: 10,
      trackTaps: new Map([['music', musicTap]]),
    });
    handle.disconnect();
    expect(pannerOf(ctx, 'music').disconnected).toBe(true);
    expect(ctx.allNodes().some((node) => node.outputs.includes(musicTap))).toBe(false);
  });
});

describe('renderArrangementWav gets no track taps', () => {
  const offline: { ctx: FakeContext | null } = { ctx: null };

  class FakeOfflineAudioContext extends FakeContext {
    constructor() {
      super();
      offline.ctx = this;
    }
    startRendering() {
      const channels = [Float32Array.of(0.1, 0.2), Float32Array.of(0.1, 0.2)];
      return Promise.resolve({
        sampleRate: 48000,
        getChannelData: (index: number) => channels[index],
      });
    }
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('connects every offline panner only to the master and the master only to the destination', async () => {
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    const arrangement = {
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
          duration: 2,
        },
      ],
    };
    await renderArrangementWav(arrangement, new Map());
    const ctx = offline.ctx;
    if (!ctx) {
      throw new Error('offline context missing');
    }
    const master = ctx.gains[0];
    expect(ctx.panners).toHaveLength(3);
    for (const panner of ctx.panners) {
      expect(panner.outputs).toEqual([master]);
    }
    expect(master.outputs).toEqual([ctx.destination]);
  });
});
