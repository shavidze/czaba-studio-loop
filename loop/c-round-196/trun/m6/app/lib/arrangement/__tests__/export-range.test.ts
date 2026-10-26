import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Arrangement, ArrangementClip, ScheduledClip } from '~/types/arrangement';
import {
  type ArrangementRenderWindow,
  renderArrangementWav,
  type ScheduleAudioNode,
  type ScheduleAudioParam,
  type ScheduleGainNode,
  type SchedulePannerNode,
  type ScheduleSourceNode,
} from '../graph.client';
import { createArrangement, projectEnd } from '../model';
import { planSchedule } from '../schedule';

type ParamCall = ['set', number, number] | ['ramp', number, number];

interface SourceStart {
  sourceId: string;
  when: number;
  offset: number;
  duration: number;
}

class RecordingParam implements ScheduleAudioParam {
  value = 0;
  calls: ParamCall[] = [];
  setTargetAtTime() {}
  setValueAtTime(value: number, startTime: number) {
    this.calls.push(['set', value, startTime]);
  }
  linearRampToValueAtTime(value: number, endTime: number) {
    this.calls.push(['ramp', value, endTime]);
  }
}

class RecordingNode implements ScheduleAudioNode {
  connect(destination: ScheduleAudioNode): ScheduleAudioNode {
    return destination;
  }
  disconnect() {}
}

class RecordingGain extends RecordingNode implements ScheduleGainNode {
  gain = new RecordingParam();
}

class RecordingPanner extends RecordingNode implements SchedulePannerNode {
  pan = new RecordingParam();
}

class RenderBuffer implements AudioBuffer {
  readonly duration = 60;
  readonly length = 60 * 48000;
  readonly numberOfChannels = 1;
  readonly sampleRate = 48000;
  readonly sourceId: string;
  readonly level: number;
  constructor(sourceId: string, level: number) {
    this.sourceId = sourceId;
    this.level = level;
  }
  copyFromChannel() {}
  copyToChannel() {}
  getChannelData() {
    return new Float32Array(this.length);
  }
}

const offline: { contexts: RecordingOfflineContext[] } = { contexts: [] };

class RecordingSource extends RecordingNode implements ScheduleSourceNode<AudioBuffer> {
  buffer: AudioBuffer | null = null;
  onended: ((event: Event) => unknown) | null = null;
  constructor(private readonly owner: RecordingOfflineContext) {
    super();
  }
  start(when: number, offset: number, duration: number) {
    const buffer = this.buffer;
    if (buffer instanceof RenderBuffer) {
      this.owner.starts.push({ sourceId: buffer.sourceId, when, offset, duration });
      this.owner.levels.push({ when, duration, level: buffer.level });
    }
  }
  stop() {}
}

class RecordingOfflineContext {
  readonly currentTime = 0;
  readonly destination = new RecordingNode();
  readonly length: number;
  readonly sampleRate: number;
  starts: SourceStart[] = [];
  levels: Array<{ when: number; duration: number; level: number }> = [];
  gains: RecordingGain[] = [];
  constructor(options: { numberOfChannels: number; length: number; sampleRate: number }) {
    this.length = options.length;
    this.sampleRate = options.sampleRate;
    offline.contexts.push(this);
  }
  createBufferSource() {
    return new RecordingSource(this);
  }
  createGain() {
    const gain = new RecordingGain();
    this.gains.push(gain);
    return gain;
  }
  createStereoPanner() {
    return new RecordingPanner();
  }
  startRendering() {
    const channel = new Float32Array(this.length);
    for (const entry of this.levels) {
      const first = Math.max(0, Math.round(entry.when * this.sampleRate));
      const last = Math.min(
        this.length,
        Math.round((entry.when + entry.duration) * this.sampleRate),
      );
      for (let frame = first; frame < last; frame++) {
        channel[frame] += entry.level;
      }
    }
    const channels = [channel, Float32Array.from(channel)];
    return Promise.resolve({
      sampleRate: this.sampleRate,
      getChannelData: (index: number) => channels[index],
    });
  }
}

function clip(overrides: Partial<ArrangementClip> & Pick<ArrangementClip, 'id'>): ArrangementClip {
  return {
    trackId: 'music',
    sourceId: 'quiet',
    start: 0,
    sourceOffset: 0,
    duration: 1,
    ...overrides,
  };
}

function rangeArrangement(clips: ArrangementClip[]): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips,
  };
}

const buffers = new Map<string, AudioBuffer>([
  ['quiet', new RenderBuffer('quiet', 0.25)],
  ['loud', new RenderBuffer('loud', 2)],
]);

function twentySecondProject(): Arrangement {
  return rangeArrangement([
    clip({ id: 'spanning', start: 2, sourceOffset: 1.5, duration: 10 }),
    clip({ id: 'inside', trackId: 'sfx', start: 6, sourceOffset: 0, duration: 2 }),
    clip({ id: 'before', start: 0.5, duration: 3.5 }),
    clip({ id: 'at-end', trackId: 'sfx', start: 9, duration: 3 }),
    clip({ id: 'tail', start: 15, duration: 5 }),
  ]);
}

function expectedStarts(plan: readonly ScheduledClip[], from: number): SourceStart[] {
  return plan.map((item) => ({
    sourceId: item.sourceId,
    when: item.when - from,
    offset: item.sourceOffset,
    duration: item.duration,
  }));
}

async function renderOnce(arrangement: Arrangement, renderWindow?: ArrangementRenderWindow) {
  offline.contexts = [];
  const result = renderWindow
    ? await renderArrangementWav(arrangement, buffers, renderWindow)
    : await renderArrangementWav(arrangement, buffers);
  const [ctx] = offline.contexts;
  if (!ctx || offline.contexts.length !== 1) {
    throw new Error('expected exactly one OfflineAudioContext');
  }
  return { ctx, result };
}

function wavFrames(blob: Blob): Promise<DataView> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      reader.result instanceof ArrayBuffer
        ? resolve(new DataView(reader.result))
        : reject(new Error('WAV bytes missing'));
    reader.onerror = () => reject(new Error('WAV read failed'));
    reader.readAsArrayBuffer(blob);
  });
}

function readSample24(view: DataView, at: number): number {
  const raw = view.getUint8(at) | (view.getUint8(at + 1) << 8) | (view.getUint8(at + 2) << 16);
  return raw >= 0x800000 ? raw - 0x1000000 : raw;
}

describe('SRW-20 stage 1 range export renderer (D-29z50, R20-X1)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('XR1 no window renders the whole project exactly like the 0-based plan', async () => {
    vi.stubGlobal('OfflineAudioContext', RecordingOfflineContext);
    const arrangement = twentySecondProject();
    const { ctx } = await renderOnce(arrangement);
    expect(projectEnd(arrangement)).toBe(20);
    expect(ctx.length).toBe(Math.ceil(20 * 48000));
    expect(ctx.sampleRate).toBe(48000);
    expect(ctx.starts).toStrictEqual(expectedStarts(planSchedule(arrangement, 0), 0));
    expect(ctx.starts).toHaveLength(5);
  });

  it('XR1 no window keeps ceil for a fractional project end', async () => {
    vi.stubGlobal('OfflineAudioContext', RecordingOfflineContext);
    const arrangement = rangeArrangement([clip({ id: 'a', start: 0, duration: 1.00001 })]);
    const { ctx } = await renderOnce(arrangement);
    expect(ctx.length).toBe(48001);
  });

  it('XR1 window 4–9 on a 20 s project: 240000 frames, mid-start offsets, outside clips skipped', async () => {
    vi.stubGlobal('OfflineAudioContext', RecordingOfflineContext);
    const arrangement = twentySecondProject();
    const { ctx } = await renderOnce(arrangement, { start: 4, end: 9 });
    expect(ctx.length).toBe(240000);
    expect(ctx.starts).toStrictEqual([
      { sourceId: 'quiet', when: 0, offset: 1.5 + 2, duration: 8 },
      { sourceId: 'quiet', when: 2, offset: 0, duration: 2 },
    ]);
    expect(ctx.starts).toStrictEqual(expectedStarts(planSchedule(arrangement, 4, 9), 4));
  });

  it('XR1 the window length is rounded, not ceiled (4–9.00001 s stays 240000 frames)', async () => {
    vi.stubGlobal('OfflineAudioContext', RecordingOfflineContext);
    const { ctx } = await renderOnce(twentySecondProject(), { start: 4, end: 9.00001 });
    expect(ctx.length).toBe(240000);
  });

  it('XR2 a fade-in 3–5 s with window start 4 begins at 0.5 and reaches 1 at render time 1', async () => {
    vi.stubGlobal('OfflineAudioContext', RecordingOfflineContext);
    const arrangement = rangeArrangement([
      clip({ id: 'faded', start: 3, duration: 6, fadeIn: 2 }),
      clip({ id: 'end', trackId: 'sfx', start: 19, duration: 1 }),
    ]);
    const { ctx } = await renderOnce(arrangement, { start: 4, end: 9 });
    const fadeCalls = ctx.gains.map((gain) => gain.gain).filter((param) => param.calls.length > 0);
    expect(fadeCalls).toHaveLength(1);
    expect(fadeCalls[0]?.value).toBe(0.5);
    expect(fadeCalls[0]?.calls).toStrictEqual([
      ['set', 0.5, 0],
      ['ramp', 1, 1],
    ]);
  });

  it('XR2 an envelope crossing the window start begins at its mid-value', async () => {
    vi.stubGlobal('OfflineAudioContext', RecordingOfflineContext);
    const arrangement = rangeArrangement([
      clip({
        id: 'enveloped',
        start: 3,
        duration: 6,
        envelope: [
          { time: 0, gain: 0 },
          { time: 2, gain: 1 },
        ],
      }),
      clip({ id: 'end', trackId: 'sfx', start: 19, duration: 1 }),
    ]);
    const { ctx } = await renderOnce(arrangement, { start: 4, end: 9 });
    const envelopeCalls = ctx.gains
      .map((gain) => gain.gain)
      .filter((param) => param.calls.length > 0);
    expect(envelopeCalls).toHaveLength(1);
    expect(envelopeCalls[0]?.value).toBe(0.5);
    expect(envelopeCalls[0]?.calls).toStrictEqual([
      ['set', 0.5, 0],
      ['ramp', 1, 1],
      ['ramp', 1, 5],
    ]);
  });

  it('XR3 overload is measured over the window only', async () => {
    vi.stubGlobal('OfflineAudioContext', RecordingOfflineContext);
    const arrangement = rangeArrangement([
      clip({ id: 'loud', sourceId: 'loud', start: 1, duration: 1 }),
      clip({ id: 'bed', trackId: 'sfx', start: 0, duration: 20 }),
    ]);
    const outside = await renderOnce(arrangement, { start: 4, end: 9 });
    expect(outside.result.clippedSamples).toBe(0);
    expect(outside.result.peak).toBe(0.25);
    const whole = await renderOnce(arrangement);
    expect(whole.result.clippedSamples).toBe(2 * 48000);
    const inside = await renderOnce(arrangement, { start: 0.5, end: 3 });
    expect(inside.result.clippedSamples).toBe(2 * 48000);
    expect(inside.result.peak).toBe(2.25);
  });

  it('XR4 a window past the project end renders its own length with silence after the end', async () => {
    vi.stubGlobal('OfflineAudioContext', RecordingOfflineContext);
    const arrangement = rangeArrangement([clip({ id: 'bed', start: 0, duration: 10 })]);
    const { ctx, result } = await renderOnce(arrangement, { start: 8, end: 12 });
    expect(ctx.length).toBe(4 * 48000);
    expect(ctx.starts).toStrictEqual([{ sourceId: 'quiet', when: 0, offset: 8, duration: 2 }]);
    const view = await wavFrames(result.blob);
    const frames = (view.byteLength - 44) / 6;
    expect(frames).toBe(4 * 48000);
    const sampleAt = (frame: number, channel: number) =>
      readSample24(view, 44 + frame * 6 + channel * 3);
    expect(sampleAt(0, 0)).toBe(0x200000);
    expect(sampleAt(2 * 48000 - 1, 1)).toBe(0x200000);
    let nonZeroAfterEnd = 0;
    for (let frame = 2 * 48000; frame < frames; frame++) {
      if (sampleAt(frame, 0) !== 0 || sampleAt(frame, 1) !== 0) {
        nonZeroAfterEnd += 1;
      }
    }
    expect(nonZeroAfterEnd).toBe(0);
  });
});
