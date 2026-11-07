import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Arrangement, ArrangementTrack, ScheduledClip } from '~/types/arrangement';
import {
  applySchedule,
  measureExportOverload,
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
  createMasterMeterStore,
  floorMasterMeter,
  formatMeterDbAttribute,
  formatPeakDbfs,
  isOverFullScale,
  MAX_24BIT_SAMPLE,
  type MasterMeterState,
  METER_FLOOR_DB,
  METER_PEAK_HOLD_MS,
  METER_RELEASE_DB_PER_SECOND,
  measureBlock,
  resetMasterMeterPeak,
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
  constructor(readonly kind: string) {}
  connect(destination: ScheduleAudioNode): ScheduleAudioNode {
    if (destination instanceof FakeNode) {
      this.outputs.push(destination);
    }
    return destination;
  }
  disconnect() {
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
  nodes: FakeNode[] = [];
  gains: FakeGain[] = [];
  createBufferSource() {
    const source = new FakeSource('source');
    this.nodes.push(source);
    return source;
  }
  createGain() {
    const gain = new FakeGain('gain');
    this.gains.push(gain);
    this.nodes.push(gain);
    return gain;
  }
  createStereoPanner() {
    const panner = new FakePanner('panner');
    this.nodes.push(panner);
    return panner;
  }
}

function track(id: string, patch: Partial<ArrangementTrack> = {}): ArrangementTrack {
  return { id, kind: 'audio', name: id, volume: 0.8, mute: false, solo: false, ...patch };
}

const tracks = [track('video', { kind: 'video' }), track('music'), track('stems')];

const plan: ScheduledClip[] = [
  { clipId: 'a', trackId: 'music', sourceId: 'song', when: 0, sourceOffset: 0, duration: 4 },
  { clipId: 'b', trackId: 'stems', sourceId: 'song', when: 1, sourceOffset: 0, duration: 2 },
];

const buffers = new Map<string, FakeBuffer>([['song', { id: 'song' }]]);

function dbToAmplitude(db: number): number {
  return 10 ** (db / 20);
}

function steps(blocks: ReadonlyArray<[number, number]>): MasterMeterState {
  let state = createMasterMeterState();
  for (const [peak, at] of blocks) {
    state = stepMeter(state, { peak, over: isOverFullScale(peak) }, at);
  }
  return state;
}

describe('isOverFullScale (the export predicate, shared)', () => {
  it('flags only samples above the 24-bit maximum or below −1', () => {
    expect(isOverFullScale(MAX_24BIT_SAMPLE)).toBe(false);
    expect(isOverFullScale(1)).toBe(true);
    expect(isOverFullScale(-1)).toBe(false);
    expect(isOverFullScale(-1.0001)).toBe(true);
    expect(isOverFullScale(0)).toBe(false);
  });

  it('is the predicate measureExportOverload counts with', () => {
    const samples = [MAX_24BIT_SAMPLE, 1, -1, -1.0001, 0.5, 1.2];
    const report = measureExportOverload([samples]);
    expect(report.clippedSamples).toBe(samples.filter(isOverFullScale).length);
    expect(report.clippedSamples).toBe(3);
  });
});

describe('measureBlock', () => {
  it('returns the absolute peak and the over flag of a Float32Array block', () => {
    const block = measureBlock(Float32Array.of(0.1, -0.5, 1.2, 0));
    expect(block.peak).toBeCloseTo(1.2, 6);
    expect(block.over).toBe(true);
  });

  it('treats −1.0 as a peak of 1 that is not over, and an empty block as silence', () => {
    expect(measureBlock(Float32Array.of(0.5, -1))).toEqual({ peak: 1, over: false });
    expect(measureBlock(new Float32Array(0))).toEqual({ peak: 0, over: false });
  });
});

describe('stepMeter', () => {
  it('rises instantly and falls at the documented release rate down to the floor', () => {
    expect(METER_RELEASE_DB_PER_SECOND).toBeGreaterThanOrEqual(12);
    expect(METER_RELEASE_DB_PER_SECOND).toBeLessThanOrEqual(30);
    const loud = steps([[dbToAmplitude(-6), 0]]);
    expect(loud.levelDb).toBeCloseTo(-6, 6);
    const later = stepMeter(loud, { peak: 0, over: false }, 500);
    expect(later.levelDb).toBeCloseTo(-6 - METER_RELEASE_DB_PER_SECOND * 0.5, 6);
    const louder = stepMeter(later, { peak: dbToAmplitude(-3), over: false }, 510);
    expect(louder.levelDb).toBeCloseTo(-3, 6);
    const silent = stepMeter(louder, { peak: 0, over: false }, 60000);
    expect(silent.levelDb).toBe(METER_FLOOR_DB);
  });

  it('holds the highest level for 1.5 s and then follows the level', () => {
    expect(METER_PEAK_HOLD_MS).toBe(1500);
    let state = steps([[dbToAmplitude(-6), 0]]);
    state = stepMeter(state, { peak: dbToAmplitude(-30), over: false }, 1000);
    expect(state.holdDb).toBeCloseTo(-6, 6);
    expect(state.holdDb).toBeGreaterThanOrEqual(state.levelDb);
    state = stepMeter(state, { peak: dbToAmplitude(-30), over: false }, 1400);
    expect(state.holdDb).toBeCloseTo(-6, 6);
    state = stepMeter(state, { peak: dbToAmplitude(-30), over: false }, 1600);
    expect(state.holdDb).toBeCloseTo(state.levelDb, 6);
    const followed = stepMeter(state, { peak: 0, over: false }, 1700);
    expect(followed.holdDb).toBeCloseTo(followed.levelDb, 6);
    expect(followed.holdDb).toBeLessThan(state.holdDb);
  });

  it('keeps a monotonic max peak until reset', () => {
    const state = steps([
      [0.5, 0],
      [0.2, 16],
      [0.4, 32],
    ]);
    expect(state.maxPeak).toBe(0.5);
    const reset = resetMasterMeterPeak(state);
    expect(reset.maxPeak).toBe(0);
    expect(stepMeter(reset, { peak: 0.1, over: false }, 48).maxPeak).toBe(0.1);
  });

  it('latches over on any over block; quiet blocks never clear it, only the reset does', () => {
    let state = steps([
      [0.5, 0],
      [1.5, 16],
    ]);
    expect(state.over).toBe(true);
    for (let at = 32; at < 5000; at += 16) {
      state = stepMeter(state, { peak: 0, over: false }, at);
    }
    expect(state.over).toBe(true);
    expect(state.maxPeak).toBe(1.5);
    const reset = resetMasterMeterPeak(state);
    expect(reset.over).toBe(false);
    expect(reset.maxPeak).toBe(0);
  });

  it('floorMasterMeter drops level and hold to the floor and keeps the max and the latch', () => {
    const state = steps([[1.5, 0]]);
    const floored = floorMasterMeter(state);
    expect(floored.levelDb).toBe(METER_FLOOR_DB);
    expect(floored.holdDb).toBe(METER_FLOOR_DB);
    expect(floored.maxPeak).toBe(1.5);
    expect(floored.over).toBe(true);
    expect(formatMeterDbAttribute(floored.levelDb)).toBe('-inf');
  });
});

describe('formatPeakDbfs and formatMeterDbAttribute', () => {
  it('formats over peaks with + floored at +0.0, clear peaks with U+2212, and silence as −∞', () => {
    expect(formatPeakDbfs(1.778, true)).toBe('+5.0');
    expect(formatPeakDbfs(1.5, true)).toBe('+3.5');
    expect(formatPeakDbfs(1.0000001, true)).toBe('+0.0');
    expect(formatPeakDbfs(0.8907, false)).toBe('−1.0');
    expect(formatPeakDbfs(MAX_24BIT_SAMPLE, false)).toBe('0.0');
    expect(formatPeakDbfs(1, false)).toBe('0.0');
    expect(formatPeakDbfs(0, false)).toBe('−∞');
    expect(formatPeakDbfs(dbToAmplitude(-60), false)).toBe('−∞');
    expect(formatPeakDbfs(dbToAmplitude(-12), false)).toBe('−12.0');
  });

  it('writes one decimal or -inf at or below the floor for the data attributes', () => {
    expect(formatMeterDbAttribute(-12)).toBe('-12.0');
    expect(formatMeterDbAttribute(3.52)).toBe('3.5');
    expect(formatMeterDbAttribute(METER_FLOOR_DB)).toBe('-inf');
    expect(formatMeterDbAttribute(Number.NEGATIVE_INFINITY)).toBe('-inf');
  });
});

describe('createMasterMeterStore', () => {
  it('publishes frames to subscribers and exposes the latch as a separate snapshot', () => {
    const store = createMasterMeterStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribeMeter(listener);
    expect(store.getMeterOver()).toBe(false);
    const frame = steps([[1.5, 0]]);
    store.publishMeterFrame(frame);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getMeterFrame()).toBe(frame);
    expect(store.getMeterOver()).toBe(true);
    unsubscribe();
    store.publishMeterFrame(createMasterMeterState());
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('applySchedule meter tap', () => {
  it('fans the master out to the destination and the tap only when a tap is given', () => {
    const tapped = new FakeContext();
    const tap = new FakeNode('tap');
    applySchedule(tapped, plan, { buffers, tracks, from: 0, startAt: 10, tap });
    expect(tapped.gains[0].outputs).toEqual([tapped.destination, tap]);
    const plain = new FakeContext();
    applySchedule(plain, plan, { buffers, tracks, from: 0, startAt: 10 });
    expect(plain.gains[0].outputs).toEqual([plain.destination]);
  });

  it('feeds the tap from the master node and from no track, panner or clip node', () => {
    const ctx = new FakeContext();
    const tap = new FakeNode('tap');
    applySchedule(ctx, plan, { buffers, tracks, from: 0, startAt: 10, tap });
    const feeding = ctx.nodes.filter((node) => node.outputs.includes(tap));
    expect(feeding).toEqual([ctx.gains[0]]);
    const master = ctx.gains[0];
    const intoMaster = ctx.nodes.filter((node) => node.outputs.includes(master));
    expect(intoMaster.length).toBe(tracks.length);
    expect(intoMaster.every((node) => node.kind === 'panner')).toBe(true);
  });
});

describe('renderArrangementWav passes no meter tap', () => {
  const offline: { ctx: FakeContext | null } = { ctx: null };

  class FakeOfflineAudioContext extends FakeContext {
    constructor() {
      super();
      offline.ctx = this;
    }
    startRendering() {
      const channels = [Float32Array.of(0.5, 0), Float32Array.of(0, 0)];
      return Promise.resolve({
        sampleRate: 48000,
        getChannelData: (index: number) => channels[index],
      });
    }
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('connects the offline master only to the destination', async () => {
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    const arrangement: Arrangement = {
      ...createArrangement([
        { id: 'video', kind: 'video', name: 'ვიდეო' },
        { id: 'music', kind: 'audio', name: 'მუსიკა' },
      ]),
      clips: [
        { id: 'c', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 0.5 },
      ],
    };
    await renderArrangementWav(arrangement, new Map());
    const ctx = offline.ctx;
    if (!ctx) {
      throw new Error('offline context not created');
    }
    expect(ctx.gains[0].outputs).toEqual([ctx.destination]);
  });
});
