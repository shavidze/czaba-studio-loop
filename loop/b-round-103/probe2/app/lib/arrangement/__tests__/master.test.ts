import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Arrangement, ArrangementTrack, ScheduledClip } from '~/types/arrangement';
import { planClipboardPaste } from '../clipboard';
import {
  applySchedule,
  formatExportOverloadWarning,
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
  commitHistory,
  createArrangement,
  createHistory,
  DEFAULT_ARRANGEMENT_MASTER,
  deleteTime,
  formatMasterGainDb,
  MASTER_GAIN_MAX_DB,
  MASTER_GAIN_MIN_DB,
  masterLinearGain,
  redoHistory,
  setMasterMix,
  undoHistory,
} from '../model';

interface FakeBuffer {
  id: string;
}

class FakeParam implements ScheduleAudioParam {
  value = 0;
  targets: Array<{ target: number; startTime: number; timeConstant: number }> = [];
  setTargetAtTime(target: number, startTime: number, timeConstant: number) {
    this.targets.push({ target, startTime, timeConstant });
    this.value = target;
  }
}

class FakeNode implements ScheduleAudioNode {
  disconnected = false;
  connect(destination: ScheduleAudioNode): ScheduleAudioNode {
    return destination;
  }
  disconnect() {
    this.disconnected = true;
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
  destination = new FakeNode();
  gains: FakeGain[] = [];
  createBufferSource() {
    return new FakeSource();
  }
  createGain() {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }
  createStereoPanner() {
    return new FakePanner();
  }
}

const tracks: ArrangementTrack[] = [
  { id: 'video', kind: 'video', name: 'video', volume: 1, mute: false, solo: false },
  { id: 'music', kind: 'audio', name: 'music', volume: 0.8, mute: false, solo: false },
];

const plan: ScheduledClip[] = [
  { clipId: 'a', trackId: 'music', sourceId: 'song', when: 0, sourceOffset: 0, duration: 4 },
];

const buffers = new Map<string, FakeBuffer>([['song', { id: 'song' }]]);

function masterNodeOf(ctx: FakeContext): FakeGain {
  const master = ctx.gains[0];
  if (!master) {
    throw new Error('master gain missing');
  }
  return master;
}

function baseArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
    ]),
    clips: [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
    ],
  };
}

describe('master model (SRW-13 stage 1, D-29p)', () => {
  it('createArrangement starts with the default master (0 dB, not muted)', () => {
    const arrangement = baseArrangement();
    expect(arrangement.master).toEqual({ gainDb: 0, mute: false });
    expect(DEFAULT_ARRANGEMENT_MASTER).toEqual({ gainDb: 0, mute: false });
    expect(arrangement.master).not.toBe(DEFAULT_ARRANGEMENT_MASTER);
    expect([MASTER_GAIN_MIN_DB, MASTER_GAIN_MAX_DB]).toEqual([-60, 6]);
  });

  it('setMasterMix clamps gainDb to [-60, +6] and returns the same object on a no-op', () => {
    const arrangement = baseArrangement();
    expect(setMasterMix(arrangement, { gainDb: -80 }).master.gainDb).toBe(-60);
    expect(setMasterMix(arrangement, { gainDb: 9 }).master.gainDb).toBe(6);
    expect(setMasterMix(arrangement, { gainDb: 0 })).toBe(arrangement);
    expect(setMasterMix(arrangement, { mute: false })).toBe(arrangement);
    expect(setMasterMix(arrangement, {})).toBe(arrangement);
    const muted = setMasterMix(arrangement, { mute: true });
    expect(muted.master).toEqual({ gainDb: 0, mute: true });
    expect(muted.tracks).toBe(arrangement.tracks);
    expect(arrangement.master).toEqual({ gainDb: 0, mute: false });
  });

  it('masterLinearGain maps dB to linear and mute to 0', () => {
    expect(masterLinearGain({ gainDb: -6, mute: false })).toBeCloseTo(0.501187, 6);
    expect(masterLinearGain({ gainDb: 0, mute: false })).toBe(1);
    expect(masterLinearGain({ gainDb: 0, mute: true })).toBe(0);
    expect(masterLinearGain({ gainDb: -60, mute: false })).toBeCloseTo(0.001, 9);
    expect(masterLinearGain({ gainDb: -60, mute: false })).toBeGreaterThan(0);
  });

  it('formatMasterGainDb uses U+2212 for negatives, + for positives and no sign at 0', () => {
    expect(formatMasterGainDb(0)).toBe('0.0 dB');
    expect(formatMasterGainDb(-6)).toBe('−6.0 dB');
    expect(formatMasterGainDb(6)).toBe('+6.0 dB');
    expect(formatMasterGainDb(-60)).toBe('−60.0 dB');
    expect(formatMasterGainDb(-0.5)).toBe('−0.5 dB');
  });

  it('deleteTime and a clipboard paste keep the master unchanged', () => {
    const arrangement = setMasterMix(baseArrangement(), { gainDb: -6, mute: true });
    expect(deleteTime(arrangement, 2, 4).master).toEqual({ gainDb: -6, mute: true });
    const pasted = planClipboardPaste(
      arrangement,
      {
        length: 2,
        items: [{ trackId: 'music', sourceId: 'song', offset: 0, sourceOffset: 0, duration: 2 }],
      },
      { at: 20, activeTrackId: 'music', isSourceAvailable: () => true },
    );
    expect(pasted.arrangement?.clips).toHaveLength(2);
    expect(pasted.arrangement?.master).toEqual({ gainDb: -6, mute: true });
  });

  it('undo and redo restore a master change', () => {
    const start = baseArrangement();
    const changed = setMasterMix(start, { gainDb: -6 });
    const history = commitHistory(createHistory(start), changed, 'Master Volume');
    expect(history.past.map((entry) => entry.label)).toEqual(['Master Volume']);
    const undone = undoHistory(history);
    expect(undone.present.master).toEqual({ gainDb: 0, mute: false });
    const redone = redoHistory(undone);
    expect(redone.present.master).toEqual({ gainDb: -6, mute: false });
    expect(commitHistory(history, setMasterMix(changed, { gainDb: -6 }), 'noop')).toBe(history);
  });
});

describe('master gain in the graph (D-02, C-R21-01 de-click)', () => {
  it('sets the initial master gain from masterGain, and to 1 when it is omitted', () => {
    const withGain = new FakeContext();
    applySchedule(withGain, plan, { buffers, tracks, from: 0, startAt: 10, masterGain: 0.25 });
    expect(masterNodeOf(withGain).gain.value).toBe(0.25);
    const omitted = new FakeContext();
    applySchedule(omitted, plan, { buffers, tracks, from: 0, startAt: 10 });
    expect(masterNodeOf(omitted).gain.value).toBe(1);
    const muted = new FakeContext();
    applySchedule(muted, plan, { buffers, tracks, from: 0, startAt: 10, masterGain: 0 });
    expect(masterNodeOf(muted).gain.value).toBe(0);
  });

  it('setMasterGain uses τ 0.003 into and out of mute and τ 0.015 otherwise', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, plan, { buffers, tracks, from: 0, startAt: 10 });
    const master = masterNodeOf(ctx);
    handle.setMasterGain(0);
    handle.setMasterGain(0.5);
    handle.setMasterGain(0.25);
    expect(master.gain.targets).toEqual([
      { target: 0, startTime: 10, timeConstant: 0.003 },
      { target: 0.5, startTime: 10, timeConstant: 0.003 },
      { target: 0.25, startTime: 10, timeConstant: 0.015 },
    ]);
  });

  it('a graph started muted unmutes with the short constant', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, plan, {
      buffers,
      tracks,
      from: 0,
      startAt: 10,
      masterGain: 0,
    });
    handle.setMasterGain(1);
    expect(masterNodeOf(ctx).gain.targets).toEqual([
      { target: 1, startTime: 10, timeConstant: 0.003 },
    ]);
  });

  it('setMasterGain does nothing after disconnect', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, plan, { buffers, tracks, from: 0, startAt: 10 });
    handle.disconnect();
    handle.setMasterGain(0);
    const master = masterNodeOf(ctx);
    expect(master.disconnected).toBe(true);
    expect(master.gain.targets).toEqual([]);
    expect(master.gain.value).toBe(1);
  });
});

describe('export overload report (R13-M4 export part)', () => {
  const MAX_24BIT = 8388607 / 8388608;

  it('measures the pre-clamp peak and counts 3 over-range samples → +0.8 dBFS, 3 sample, 0.9 dB', () => {
    const left = Float32Array.from([0.1, 1.1, -0.5, 1.05]);
    const right = Float32Array.from([1.02, 0.2, 0, -0.3]);
    const report = measureExportOverload([left, right]);
    expect(report.peak).toBeCloseTo(1.1, 6);
    expect(report.clippedSamples).toBe(3);
    expect(formatExportOverloadWarning(report.peak, report.clippedSamples)).toBe(
      'გადატვირთვა: პიკი +0.8 dBFS — 3 sample შეიზღუდა 0 dBFS-ზე. შეამცირე Master მინიმუმ 0.9 dB-ით და გაიმეორე ექსპორტი.',
    );
  });

  it('does not count a sample exactly at MAX_24BIT_SAMPLE and gives no warning', () => {
    const report = measureExportOverload([Float32Array.of(MAX_24BIT, -1), Float32Array.of(0.5, 0)]);
    expect(report.clippedSamples).toBe(0);
    expect(report.peak).toBe(1);
    expect(formatExportOverloadWarning(report.peak, report.clippedSamples)).toBeNull();
  });

  it('counts negative over-range samples', () => {
    const report = measureExportOverload([
      [-1.2, 0.3],
      [-1.0000001, 0.9],
    ]);
    expect(report.clippedSamples).toBe(2);
    expect(report.peak).toBeCloseTo(1.2, 9);
    expect(formatExportOverloadWarning(report.peak, report.clippedSamples)).toBe(
      'გადატვირთვა: პიკი +1.6 dBFS — 2 sample შეიზღუდა 0 dBFS-ზე. შეამცირე Master მინიმუმ 1.6 dB-ით და გაიმეორე ექსპორტი.',
    );
  });

  it('prints +0.0 dBFS and the 0.1 dB minimum when the peak is at or just below 1.0', () => {
    expect(formatExportOverloadWarning(1, 1)).toBe(
      'გადატვირთვა: პიკი +0.0 dBFS — 1 sample შეიზღუდა 0 dBFS-ზე. შეამცირე Master მინიმუმ 0.1 dB-ით და გაიმეორე ექსპორტი.',
    );
    const justUnder = (MAX_24BIT + 1) / 2;
    expect(formatExportOverloadWarning(justUnder, 1)).toContain('პიკი +0.0 dBFS');
    expect(formatExportOverloadWarning(justUnder, 1)).toContain('მინიმუმ 0.1 dB-ით');
  });

  it('ignores NaN in the peak and treats an all-silent render as no overload', () => {
    const report = measureExportOverload([Float32Array.of(0, Number.NaN), new Float32Array(2)]);
    expect(report).toEqual({ peak: 0, clippedSamples: 0 });
  });
});

describe('renderArrangementWav applies the Master and reports the pre-clamp overload', () => {
  const offline: { gains: FakeGain[] } = { gains: [] };

  class FakeOfflineAudioContext extends FakeContext {
    constructor() {
      super();
      offline.gains = this.gains;
    }
    startRendering() {
      const channels = [Float32Array.of(1.1, 0.5), Float32Array.of(-1.2, 0)];
      return Promise.resolve({
        sampleRate: 48000,
        getChannelData: (index: number) => channels[index],
      });
    }
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function readSample24(view: DataView, at: number): number {
    const raw = view.getUint8(at) | (view.getUint8(at + 1) << 8) | (view.getUint8(at + 2) << 16);
    return raw >= 0x800000 ? raw - 0x1000000 : raw;
  }

  it('sets the offline master gain from the model and measures raw samples before the unchanged clamp', async () => {
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    const arrangement = setMasterMix(baseArrangement(), { gainDb: -6 });
    const result = await renderArrangementWav(arrangement, new Map());
    expect(offline.gains[0]?.gain.value).toBeCloseTo(0.501187, 6);
    expect(result.peak).toBeCloseTo(1.2, 6);
    expect(result.clippedSamples).toBe(2);
    const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        reader.result instanceof ArrayBuffer
          ? resolve(reader.result)
          : reject(new Error('WAV bytes missing'));
      reader.onerror = () => reject(new Error('WAV read failed'));
      reader.readAsArrayBuffer(result.blob);
    });
    const view = new DataView(bytes);
    expect(view.byteLength).toBe(44 + 2 * 2 * 3);
    expect([0, 1, 2, 3].map((index) => readSample24(view, 44 + index * 3))).toEqual([
      8388607, -8388608, 4194304, 0,
    ]);
  });

  it('keeps the offline master gain at exactly 1 at 0 dB and 0 when muted', async () => {
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    await renderArrangementWav(baseArrangement(), new Map());
    expect(offline.gains[0]?.gain.value).toBe(1);
    await renderArrangementWav(setMasterMix(baseArrangement(), { mute: true }), new Map());
    expect(offline.gains[0]?.gain.value).toBe(0);
  });
});
