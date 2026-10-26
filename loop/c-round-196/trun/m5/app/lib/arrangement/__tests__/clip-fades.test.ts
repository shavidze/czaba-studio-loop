import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { Arrangement, ArrangementClip } from '~/types/arrangement';
import {
  copyClipsToClipboard,
  copyRangeToClipboard,
  cutRangeFromArrangement,
  planClipboardPaste,
} from '../clipboard';
import {
  clampClipFadesAfterTrim,
  clipFadeGainAt,
  clipFadeIn,
  clipFadeOut,
  clipFadeShapes,
  setClipFade,
  withCutEdges,
} from '../fades';
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
import { planLoopIteration } from '../loop';
import { createArrangement, deleteTime, splitClipAt, trimClipEnd, trimClipStart } from '../model';
import { planSchedule } from '../schedule';

function fadeArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
  ]);
  return { ...base, clips };
}

function stemsClip(overrides: Partial<ArrangementClip> = {}): ArrangementClip {
  return {
    id: 'c',
    trackId: 'stems',
    sourceId: 'pulse',
    start: 0,
    sourceOffset: 0,
    duration: 10,
    ...overrides,
  };
}

function clipById(arrangement: Arrangement, id: string): ArrangementClip {
  const clip = arrangement.clips.find((entry) => entry.id === id);
  if (!clip) {
    throw new Error(`clip ${id} missing`);
  }
  return clip;
}

describe('SRW-18 stage 1 setClipFade (FD1)', () => {
  it('FD1 clamps to [0, duration - other fade], rounds to ms and omits zero', () => {
    const base = fadeArrangement([stemsClip({ fadeOut: 3 })]);
    const grown = setClipFade(base, 'c', 'in', 9);
    expect(clipById(grown, 'c')).toStrictEqual(stemsClip({ fadeIn: 7, fadeOut: 3 }));
    const rounded = setClipFade(base, 'c', 'in', 1.23456);
    expect(clipById(rounded, 'c').fadeIn).toBe(1.235);
    const negative = setClipFade(base, 'c', 'in', -4);
    expect(negative).toBe(base);
    const removed = setClipFade(base, 'c', 'out', 0);
    expect(clipById(removed, 'c')).toStrictEqual(stemsClip());
    expect(Object.hasOwn(clipById(removed, 'c'), 'fadeOut')).toBe(false);
    const outGrown = setClipFade(setClipFade(base, 'c', 'in', 4), 'c', 'out', 20);
    expect(clipById(outGrown, 'c')).toStrictEqual(stemsClip({ fadeIn: 4, fadeOut: 6 }));
  });

  it('FD1 returns the same reference for no change, a missing clip, a video clip or NaN', () => {
    const base = fadeArrangement([
      stemsClip({ fadeIn: 2 }),
      { id: 'v', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 6 },
    ]);
    expect(setClipFade(base, 'c', 'in', 2)).toBe(base);
    expect(setClipFade(base, 'c', 'in', 2.0004)).toBe(base);
    expect(setClipFade(base, 'missing', 'in', 1)).toBe(base);
    expect(setClipFade(base, 'v', 'in', 1)).toBe(base);
    expect(setClipFade(base, 'c', 'out', Number.NaN)).toBe(base);
  });

  it('FD1 reads effective fades clamped by the invariant even when stored values overlap', () => {
    const clip = stemsClip({ duration: 4, fadeIn: 3, fadeOut: 3 });
    expect(clipFadeOut(clip)).toBe(3);
    expect(clipFadeIn(clip)).toBe(1);
    expect(clipFadeIn(stemsClip())).toBe(0);
    expect(clipFadeOut(stemsClip({ fadeOut: 20 }))).toBe(10);
  });
});

describe('SRW-18 stage 1 clipFadeGainAt (FD2)', () => {
  const shape = { start: 2, duration: 10, fadeIn: 2, fadeOut: 4 };

  it('FD2 follows the linear in/out ramps and is 1 between them', () => {
    expect(clipFadeGainAt(shape, 2)).toBe(0);
    expect(clipFadeGainAt(shape, 3)).toBe(0.5);
    expect(clipFadeGainAt(shape, 7)).toBe(1);
    expect(clipFadeGainAt(shape, 10)).toBe(0.5);
    expect(clipFadeGainAt(shape, 12)).toBe(0);
    expect(clipFadeGainAt(shape, 1)).toBe(1);
    expect(clipFadeGainAt(stemsClip({ start: 2 }), 2)).toBe(1);
  });

  it('FD2 meets at exactly 1 when fadeIn + fadeOut = duration', () => {
    const meeting = { start: 0, duration: 6, fadeIn: 2, fadeOut: 4 };
    expect(clipFadeGainAt(meeting, 2)).toBe(1);
    expect(clipFadeGainAt(meeting, 1)).toBe(0.5);
    expect(clipFadeGainAt(meeting, 4)).toBe(0.5);
  });
});

describe('SRW-18 stage 1 fades under clip edits (FD3-FD6)', () => {
  const faded = () => fadeArrangement([stemsClip({ fadeIn: 2, fadeOut: 3 })]);

  it('FD3 a start trim shrinks the fade-in first, an end trim the fade-out first', () => {
    const startTrim = trimClipStart(faded(), 'c', 6);
    expect(clipById(startTrim, 'c')).toStrictEqual(
      stemsClip({ start: 6, sourceOffset: 6, duration: 4, fadeIn: 1, fadeOut: 3 }),
    );
    const endTrim = trimClipEnd(faded(), 'c', 4, new Map([['pulse', 20]]));
    expect(clipById(endTrim, 'c')).toStrictEqual(stemsClip({ duration: 4, fadeIn: 2, fadeOut: 2 }));
    const roomy = trimClipStart(faded(), 'c', 1);
    expect(clipById(roomy, 'c')).toStrictEqual(
      stemsClip({ start: 1, sourceOffset: 1, duration: 9, fadeIn: 2, fadeOut: 3 }),
    );
  });

  it('FD3 a clip without fades trims to exactly the pre-fade object', () => {
    const plain = fadeArrangement([stemsClip()]);
    expect(clipById(trimClipStart(plain, 'c', 6), 'c')).toStrictEqual(
      stemsClip({ start: 6, sourceOffset: 6, duration: 4 }),
    );
    expect(clipById(trimClipEnd(plain, 'c', 4, new Map([['pulse', 20]])), 'c')).toStrictEqual(
      stemsClip({ duration: 4 }),
    );
    const clip = stemsClip();
    expect(clampClipFadesAfterTrim(clip, 'start')).toBe(clip);
    expect(withCutEdges(clip, { start: true, end: true })).toBe(clip);
  });

  it('FD4 split keeps the fade-in on the left and the fade-out on the right only', () => {
    const result = splitClipAt(faded(), 'c', 5);
    if (!result) {
      throw new Error('split refused');
    }
    expect(clipById(result.arrangement, result.leftId)).toStrictEqual(
      stemsClip({ duration: 5, fadeIn: 2 }),
    );
    expect(clipById(result.arrangement, result.rightId)).toStrictEqual(
      stemsClip({ id: result.rightId, start: 5, sourceOffset: 5, duration: 5, fadeOut: 3 }),
    );
  });

  it('FD4 a kept fade longer than its part shrinks to the part', () => {
    const long = fadeArrangement([stemsClip({ fadeIn: 8 })]);
    const result = splitClipAt(long, 'c', 5);
    expect(result && clipById(result.arrangement, result.leftId).fadeIn).toBe(5);
  });

  it('FD5 deleteTime drops the fade at each new cut and only shifts later clips', () => {
    const arrangement = fadeArrangement([
      stemsClip({ fadeIn: 2, fadeOut: 3 }),
      stemsClip({ id: 'late', start: 12, duration: 4, fadeIn: 1, fadeOut: 1 }),
    ]);
    const result = deleteTime(arrangement, 4, 6);
    const [left, right, late] = result.clips;
    expect(left).toStrictEqual(stemsClip({ duration: 4, fadeIn: 2 }));
    expect(right).toStrictEqual(
      stemsClip({ id: right.id, start: 4, sourceOffset: 6, duration: 4, fadeOut: 3 }),
    );
    expect(right.id).not.toBe('c');
    expect(late).toStrictEqual(
      stemsClip({ id: 'late', start: 10, duration: 4, fadeIn: 1, fadeOut: 1 }),
    );
  });

  it('FD5 a cut that starts before the clip drops only its fade-in', () => {
    const result = deleteTime(
      fadeArrangement([stemsClip({ start: 2, fadeIn: 2, fadeOut: 3 })]),
      1,
      4,
    );
    expect(result.clips).toStrictEqual([
      stemsClip({ start: 1, sourceOffset: 2, duration: 8, fadeOut: 3 }),
    ]);
  });

  it('FD6 clip copy and paste keep both fades', () => {
    const arrangement = fadeArrangement([stemsClip({ fadeIn: 2, fadeOut: 3 })]);
    const clipboard = copyClipsToClipboard(arrangement, ['c']);
    expect(clipboard?.items).toStrictEqual([
      {
        trackId: 'stems',
        sourceId: 'pulse',
        offset: 0,
        sourceOffset: 0,
        duration: 10,
        fadeIn: 2,
        fadeOut: 3,
      },
    ]);
    const plan = planClipboardPaste(arrangement, clipboard, {
      at: 20,
      activeTrackId: 'stems',
      isSourceAvailable: () => true,
    });
    const pasted = plan.arrangement && clipById(plan.arrangement, plan.clipIds[0]);
    expect(pasted).toStrictEqual(
      stemsClip({ id: plan.clipIds[0], start: 20, fadeIn: 2, fadeOut: 3 }),
    );
  });

  it('FD6 a range copy keeps a fade only when the window contains that clip edge', () => {
    const arrangement = fadeArrangement([stemsClip({ start: 2, fadeIn: 2, fadeOut: 3 })]);
    const tail = copyRangeToClipboard(arrangement, { start: 3, end: 12, trackId: 'stems' });
    expect(tail?.items).toStrictEqual([
      { trackId: 'stems', sourceId: 'pulse', offset: 0, sourceOffset: 1, duration: 9, fadeOut: 3 },
    ]);
    const head = copyRangeToClipboard(arrangement, { start: 0, end: 5, trackId: 'stems' });
    expect(head?.items).toStrictEqual([
      { trackId: 'stems', sourceId: 'pulse', offset: 2, sourceOffset: 0, duration: 3, fadeIn: 2 },
    ]);
    const middle = copyRangeToClipboard(arrangement, { start: 4, end: 6, trackId: 'stems' });
    expect(middle?.items).toStrictEqual([
      { trackId: 'stems', sourceId: 'pulse', offset: 0, sourceOffset: 2, duration: 2 },
    ]);
  });

  it('FD6 cutRangeFromArrangement drops the fade at each new cut edge', () => {
    const arrangement = fadeArrangement([stemsClip({ start: 2, fadeIn: 1, fadeOut: 2 })]);
    const result = cutRangeFromArrangement(arrangement, { start: 8, end: 9, trackId: 'stems' });
    const [left, right] = result.clips;
    expect(left).toStrictEqual(stemsClip({ start: 2, duration: 6, fadeIn: 1 }));
    expect(right).toStrictEqual(
      stemsClip({ id: right.id, start: 9, sourceOffset: 7, duration: 3, fadeOut: 2 }),
    );
  });

  it('FD6 clipFadeShapes lists only audio clips with an effective fade', () => {
    const arrangement = fadeArrangement([
      stemsClip({ fadeIn: 2 }),
      stemsClip({ id: 'plain', start: 12 }),
      {
        id: 'v',
        trackId: 'video',
        sourceId: 'film',
        start: 0,
        sourceOffset: 0,
        duration: 6,
        fadeIn: 1,
      },
    ]);
    expect([...clipFadeShapes(arrangement).entries()]).toStrictEqual([
      ['c', { start: 0, duration: 10, fadeIn: 2, fadeOut: 0 }],
    ]);
  });
});

interface FakeBuffer {
  id: string;
}

type ParamCall = [method: 'set' | 'ramp' | 'target', value: number, time: number];

class RecordingParam implements ScheduleAudioParam {
  value = 0;
  calls: ParamCall[] = [];
  setTargetAtTime(target: number, startTime: number) {
    this.calls.push(['target', target, startTime]);
  }
  setValueAtTime(value: number, startTime: number) {
    this.calls.push(['set', value, startTime]);
  }
  linearRampToValueAtTime(value: number, endTime: number) {
    this.calls.push(['ramp', value, endTime]);
  }
}

class RecordingNode implements ScheduleAudioNode {
  target: ScheduleAudioNode | null = null;
  disconnected = 0;
  connect(destination: ScheduleAudioNode) {
    this.target = destination;
    return destination;
  }
  disconnect() {
    this.disconnected += 1;
  }
}

class RecordingGain extends RecordingNode implements ScheduleGainNode {
  gain = new RecordingParam();
}

class RecordingPanner extends RecordingNode implements SchedulePannerNode {
  pan = new RecordingParam();
}

class RecordingSource extends RecordingNode implements ScheduleSourceNode<FakeBuffer> {
  buffer: FakeBuffer | null = null;
  onended: ((event: Event) => unknown) | null = null;
  starts: [number, number, number][] = [];
  start(when: number, offset: number, duration: number) {
    this.starts.push([when, offset, duration]);
  }
  stop() {}
}

class RecordingContext implements ScheduleAudioContext<FakeBuffer> {
  currentTime = 0;
  destination = new RecordingNode();
  gains: RecordingGain[] = [];
  sources: RecordingSource[] = [];
  createBufferSource() {
    const source = new RecordingSource();
    this.sources.push(source);
    return source;
  }
  createGain() {
    const gain = new RecordingGain();
    this.gains.push(gain);
    return gain;
  }
  createStereoPanner() {
    return new RecordingPanner();
  }
}

function sourceGains(ctx: RecordingContext, index: number) {
  const first = ctx.sources[index]?.target;
  if (!(first instanceof RecordingGain)) {
    throw new Error(`source ${index} is not connected to a gain`);
  }
  const second = first.target;
  return { first, second };
}

function scheduleFades(arrangement: Arrangement, from: number, startAt: number) {
  const ctx = new RecordingContext();
  const handle = applySchedule(ctx, planSchedule(arrangement, from), {
    buffers: new Map([['pulse', { id: 'pulse' }]]),
    tracks: arrangement.tracks,
    from,
    startAt,
    clipFades: clipFadeShapes(arrangement),
  });
  return { ctx, handle };
}

describe('SRW-18 stage 1 fade scheduling in applySchedule (FD7)', () => {
  it('FD7a a fade-in from 0 starts silent at the clip start and ramps to 1', () => {
    const arrangement = fadeArrangement([stemsClip({ start: 2, duration: 4, fadeIn: 1 })]);
    const { ctx } = scheduleFades(arrangement, 0, 10);
    const { first: fadeGain, second: clipGain } = sourceGains(ctx, 0);
    expect(fadeGain.gain.value).toBe(0);
    expect(fadeGain.gain.calls).toEqual([
      ['set', 0, 12],
      ['ramp', 1, 13],
    ]);
    expect(clipGain).toBeInstanceOf(RecordingGain);
    expect(clipGain instanceof RecordingGain && clipGain.gain.calls).toEqual([]);
    expect(ctx.sources[0].starts).toEqual([[12, 0, 4]]);
  });

  it('FD7b playback started mid-fade begins at the ramp value of that instant', () => {
    const arrangement = fadeArrangement([stemsClip({ start: 2, duration: 4, fadeIn: 1 })]);
    const { ctx } = scheduleFades(arrangement, 2.5, 10);
    const { first: fadeGain } = sourceGains(ctx, 0);
    expect(fadeGain.gain.value).toBe(0.5);
    expect(fadeGain.gain.calls).toEqual([
      ['set', 0.5, 10],
      ['ramp', 1, 10.5],
    ]);
  });

  it('FD7c a fade-out holds 1 until its start and ramps to 0 at the clip end', () => {
    const arrangement = fadeArrangement([stemsClip({ start: 2, duration: 16, fadeOut: 2 })]);
    const { ctx } = scheduleFades(arrangement, 0, 0);
    const { first: fadeGain } = sourceGains(ctx, 0);
    expect(fadeGain.gain.calls).toEqual([
      ['set', 1, 2],
      ['set', 1, 16],
      ['ramp', 0, 18],
    ]);
    const inside = scheduleFades(arrangement, 17, 0);
    expect(sourceGains(inside.ctx, 0).first.gain.calls).toEqual([
      ['set', 0.5, 0],
      ['ramp', 0, 1],
    ]);
  });

  it('FD7d a clip without fades builds the same graph as before (no extra gain node)', () => {
    const plain = fadeArrangement([stemsClip({ start: 2, duration: 4 })]);
    const { ctx } = scheduleFades(plain, 0, 0);
    expect(ctx.gains).toHaveLength(1 + plain.tracks.length + 1);
    const { first: clipGain, second: trackGain } = sourceGains(ctx, 0);
    expect(clipGain.gain.calls).toEqual([]);
    expect(trackGain).toBe(ctx.gains[1 + plain.tracks.findIndex((track) => track.id === 'stems')]);
    const faded = scheduleFades(
      fadeArrangement([stemsClip({ start: 2, duration: 4, fadeIn: 1 })]),
      0,
      0,
    );
    expect(faded.ctx.gains).toHaveLength(1 + plain.tracks.length + 2);
  });

  it('FD7e a loop iteration appended later schedules the ramps against its own startAt', () => {
    const arrangement = fadeArrangement([stemsClip({ start: 2, duration: 4, fadeIn: 1 })]);
    const params = { loop: { start: 1, end: 5, enabled: true }, from: 1, startAt: 10 };
    const { ctx, handle } = scheduleFades(arrangement, 1, 10);
    handle.appendPlan(planLoopIteration(arrangement, params, 1), 1, 14);
    expect(ctx.sources).toHaveLength(2);
    expect(sourceGains(ctx, 0).first.gain.calls).toEqual([
      ['set', 0, 11],
      ['ramp', 1, 12],
    ]);
    expect(sourceGains(ctx, 1).first.gain.calls).toEqual([
      ['set', 0, 15],
      ['ramp', 1, 16],
    ]);
  });

  it('FD7f setClipGain during a fade touches only the clip gain node', () => {
    const arrangement = fadeArrangement([stemsClip({ start: 2, duration: 4, fadeIn: 1 })]);
    const { ctx, handle } = scheduleFades(arrangement, 0, 0);
    const { first: fadeGain, second: clipGain } = sourceGains(ctx, 0);
    const before = [...fadeGain.gain.calls];
    handle.setClipGain('c', 0.5);
    expect(fadeGain.gain.calls).toEqual(before);
    expect(clipGain instanceof RecordingGain && clipGain.gain.calls).toEqual([['target', 0.5, 0]]);
    handle.disconnect();
    expect(fadeGain.disconnected).toBe(1);
  });
});

describe('SRW-18 stage 1 fade scheduling edge cases (FD7g-FD7h)', () => {
  it('FD7g meeting fades with non-exact float sums keep event times in order', () => {
    const arrangement = fadeArrangement([
      stemsClip({ start: 0.1, duration: 0.4, fadeIn: 0.2, fadeOut: 0.2 }),
    ]);
    const { ctx } = scheduleFades(arrangement, 0, 0);
    const times = sourceGains(ctx, 0).first.gain.calls.map(([, , time]) => time);
    expect(times.length).toBeGreaterThanOrEqual(3);
    for (let index = 1; index < times.length; index++) {
      expect(times[index]).toBeGreaterThanOrEqual(times[index - 1]);
    }
  });

  it('FD7h a loop iteration that starts inside a fade-in starts at the ramp value', () => {
    const arrangement = fadeArrangement([stemsClip({ start: 2, duration: 4, fadeIn: 2 })]);
    const params = { loop: { start: 3, end: 5, enabled: true }, from: 3, startAt: 10 };
    const { ctx, handle } = scheduleFades(arrangement, 3, 10);
    handle.appendPlan(planLoopIteration(arrangement, params, 1), 3, 12);
    expect(sourceGains(ctx, 1).first.gain.calls).toEqual([
      ['set', 0.5, 12],
      ['ramp', 1, 13],
    ]);
  });
});

describe('SRW-18 stage 1 export source (FD8)', () => {
  it('FD8 renderArrangementWav passes the fade shapes and still has no pan or live-gain calls', () => {
    const source = readFileSync(resolve(__dirname, '../graph.client.ts'), 'utf8');
    const render = source.slice(source.indexOf('export async function renderArrangementWav'));
    expect(render).toContain('clipFades: clipFadeShapes(arrangement),');
    expect(render).toContain('applySchedule(ctx, planSchedule(arrangement, 0)');
    expect(render).not.toContain('pan');
    expect(render).not.toContain('setTrackGain');
    expect(render).not.toContain('setClipGain');
    const context = readFileSync(
      resolve(__dirname, '../../../contexts/ArrangementContext.tsx'),
      'utf8',
    );
    expect(context).toContain('clipFades: clipFadeShapes(arrangement),');
  });
});

class FakeRenderBuffer implements AudioBuffer {
  readonly duration = 10;
  readonly length = 480000;
  readonly numberOfChannels = 1;
  readonly sampleRate = 48000;
  copyFromChannel() {}
  copyToChannel() {}
  getChannelData() {
    return new Float32Array(this.length);
  }
}

describe('SRW-18 stage 1 export render (FD8b)', () => {
  it('FD8b an export renders a faded clip through its own fade gain with the same ramps', async () => {
    const contexts: RecordingContext[] = [];
    class RenderRecordingContext extends RecordingContext {
      constructor() {
        super();
        contexts.push(this);
      }
      startRendering() {
        return Promise.resolve({ sampleRate: 48000, getChannelData: () => new Float32Array(4) });
      }
    }
    vi.stubGlobal('OfflineAudioContext', RenderRecordingContext);
    try {
      const arrangement = fadeArrangement([
        stemsClip({ start: 2, duration: 4, fadeIn: 1 }),
        stemsClip({ id: 'plain', start: 8, duration: 2 }),
      ]);
      await renderArrangementWav(arrangement, new Map([['pulse', new FakeRenderBuffer()]]));
      const [ctx] = contexts;
      expect(ctx.sources).toHaveLength(2);
      expect(sourceGains(ctx, 0).first.gain.calls).toEqual([
        ['set', 0, 2],
        ['ramp', 1, 3],
      ]);
      expect(sourceGains(ctx, 1).first.gain.calls).toEqual([]);
      expect(ctx.gains).toHaveLength(1 + arrangement.tracks.length + 3);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
