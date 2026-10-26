import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type {
  Arrangement,
  ArrangementClip,
  ArrangementClipEnvelopePoint,
} from '~/types/arrangement';
import {
  copyClipsToClipboard,
  copyRangeToClipboard,
  cutRangeFromArrangement,
  planClipboardPaste,
} from '../clipboard';
import {
  addClipEnvelopePoint,
  clipEnvelopeGainAt,
  clipEnvelopeGainAtSource,
  clipEnvelopeShapes,
  formatClipEnvelopeData,
  formatClipEnvelopeGain,
  moveClipEnvelopePoint,
  removeClipEnvelopePoint,
  visibleClipEnvelopePoints,
} from '../envelope';
import { clipFadeShapes } from '../fades';
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
import {
  createArrangement,
  deleteTime,
  duplicateClips,
  moveClip,
  splitClipAt,
  trimClipStart,
} from '../model';
import { planSchedule } from '../schedule';

const V_POINTS: ArrangementClipEnvelopePoint[] = [
  { time: 4, gain: 1 },
  { time: 8, gain: 0.2512 },
  { time: 12, gain: 1 },
];

function envelopeArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

function stemsClip(overrides: Partial<ArrangementClip> = {}): ArrangementClip {
  return {
    id: 'c',
    trackId: 'stems',
    sourceId: 'pulse',
    start: 2,
    sourceOffset: 0,
    duration: 16,
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

describe('SRW-18 stage 2 clipEnvelopeGainAtSource (EV1)', () => {
  it('EV1 is 1 without points, holds the edge values, is exact at points and linear between them', () => {
    expect(clipEnvelopeGainAtSource([], 3)).toBe(1);
    expect(clipEnvelopeGainAtSource(V_POINTS, 0)).toBe(1);
    expect(clipEnvelopeGainAtSource([{ time: 4, gain: 0.5 }], 1)).toBe(0.5);
    expect(clipEnvelopeGainAtSource([{ time: 4, gain: 0.5 }], 9)).toBe(0.5);
    expect(clipEnvelopeGainAtSource(V_POINTS, 8)).toBe(0.2512);
    expect(clipEnvelopeGainAtSource(V_POINTS, 4)).toBe(1);
    expect(clipEnvelopeGainAtSource(V_POINTS, 6)).toBeCloseTo(0.6256, 10);
    expect(clipEnvelopeGainAtSource(V_POINTS, 10)).toBeCloseTo(0.6256, 10);
    expect(clipEnvelopeGainAtSource(V_POINTS, 20)).toBe(1);
    const clip = stemsClip({ envelope: V_POINTS });
    expect(clipEnvelopeGainAt(clip, 8)).toBeCloseTo(0.6256, 10);
    expect(clipEnvelopeGainAt(clip, 10)).toBe(0.2512);
  });

  it('EV1 formats gains in dB with a true minus sign, 0 dB at unity and −∞ at silence', () => {
    expect(formatClipEnvelopeGain(1)).toBe('0.0 dB');
    expect(formatClipEnvelopeGain(0.99999)).toBe('0.0 dB');
    expect(formatClipEnvelopeGain(0.2512)).toBe('−12.0 dB');
    expect(formatClipEnvelopeGain(0.5)).toBe('−6.0 dB');
    expect(formatClipEnvelopeGain(0)).toBe('−∞ dB');
  });
});

describe('SRW-18 stage 2 add and remove points (EV2)', () => {
  it('EV2 a new point takes the current line value, rounds to ms and is inserted in order', () => {
    const arrangement = envelopeArrangement([
      stemsClip({
        envelope: [
          { time: 4, gain: 1 },
          { time: 12, gain: 0.5 },
        ],
      }),
    ]);
    const added = addClipEnvelopePoint(arrangement, 'c', 10);
    expect(clipById(added, 'c').envelope).toStrictEqual([
      { time: 4, gain: 1 },
      { time: 8, gain: 0.75 },
      { time: 12, gain: 0.5 },
    ]);
    const third = envelopeArrangement([
      stemsClip({
        envelope: [
          { time: 0, gain: 1 },
          { time: 3, gain: 0 },
        ],
      }),
    ]);
    expect(clipById(addClipEnvelopePoint(third, 'c', 3.0004), 'c').envelope?.[1]).toStrictEqual({
      time: 1,
      gain: 0.6667,
    });
    const bare = envelopeArrangement([stemsClip()]);
    expect(clipById(addClipEnvelopePoint(bare, 'c', 7.0006), 'c').envelope).toStrictEqual([
      { time: 5.001, gain: 1 },
    ]);
  });

  it('EV2 returns the same arrangement for a missing clip, a video clip, a time outside or a duplicate ms', () => {
    const arrangement = envelopeArrangement([
      stemsClip({ envelope: [{ time: 4, gain: 1 }] }),
      { id: 'v', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 6 },
    ]);
    expect(addClipEnvelopePoint(arrangement, 'missing', 5)).toBe(arrangement);
    expect(addClipEnvelopePoint(arrangement, 'v', 3)).toBe(arrangement);
    expect(addClipEnvelopePoint(arrangement, 'c', 1.9)).toBe(arrangement);
    expect(addClipEnvelopePoint(arrangement, 'c', 18.1)).toBe(arrangement);
    expect(addClipEnvelopePoint(arrangement, 'c', 6.0003)).toBe(arrangement);
    expect(addClipEnvelopePoint(arrangement, 'c', Number.NaN)).toBe(arrangement);
  });

  it('EV2 removing the last point leaves no envelope key and a missing point changes nothing', () => {
    const arrangement = envelopeArrangement([stemsClip({ envelope: [{ time: 4, gain: 0.5 }] })]);
    expect(removeClipEnvelopePoint(arrangement, 'c', 5)).toBe(arrangement);
    const removed = removeClipEnvelopePoint(arrangement, 'c', 4);
    expect(clipById(removed, 'c')).toStrictEqual(stemsClip());
    expect('envelope' in clipById(removed, 'c')).toBe(false);
    const v = envelopeArrangement([stemsClip({ envelope: V_POINTS })]);
    expect(clipById(removeClipEnvelopePoint(v, 'c', 8), 'c').envelope).toStrictEqual([
      { time: 4, gain: 1 },
      { time: 12, gain: 1 },
    ]);
  });
});

describe('SRW-18 stage 2 move points (EV3)', () => {
  const arrangement = envelopeArrangement([stemsClip({ envelope: V_POINTS })]);

  it('EV3 a point stops 1 ms short of each neighbour and inside the clip window', () => {
    expect(clipById(moveClipEnvelopePoint(arrangement, 'c', 8, 40, 0.2512), 'c').envelope).toEqual([
      V_POINTS[0],
      { time: 11.999, gain: 0.2512 },
      V_POINTS[2],
    ]);
    expect(clipById(moveClipEnvelopePoint(arrangement, 'c', 8, 0, 0.2512), 'c').envelope).toEqual([
      V_POINTS[0],
      { time: 4.001, gain: 0.2512 },
      V_POINTS[2],
    ]);
    expect(clipById(moveClipEnvelopePoint(arrangement, 'c', 4, -5, 1), 'c').envelope?.[0]).toEqual({
      time: 0,
      gain: 1,
    });
    expect(
      clipById(moveClipEnvelopePoint(arrangement, 'c', 12, 100, 1), 'c').envelope?.[2],
    ).toEqual({ time: 16, gain: 1 });
    expect(
      clipById(moveClipEnvelopePoint(arrangement, 'c', 8, 11.2, 0.2512), 'c').envelope?.[1],
    ).toEqual({ time: 9.2, gain: 0.2512 });
  });

  it('EV3 the gain is clamped to [0, 1] and rounded to 4 decimals; no change returns the same arrangement', () => {
    const top = moveClipEnvelopePoint(arrangement, 'c', 8, 10, 1.7);
    expect(clipById(top, 'c').envelope?.[1]).toEqual({ time: 8, gain: 1 });
    const bottom = moveClipEnvelopePoint(arrangement, 'c', 8, 10, -0.3);
    expect(clipById(bottom, 'c').envelope?.[1]).toEqual({ time: 8, gain: 0 });
    const rounded = moveClipEnvelopePoint(arrangement, 'c', 8, 10, 0.123456);
    expect(clipById(rounded, 'c').envelope?.[1]).toEqual({ time: 8, gain: 0.1235 });
    expect(moveClipEnvelopePoint(arrangement, 'c', 8, 10, 0.2512)).toBe(arrangement);
    expect(moveClipEnvelopePoint(arrangement, 'c', 8, 10.0002, 0.25121)).toBe(arrangement);
    expect(moveClipEnvelopePoint(arrangement, 'c', 9, 10, 0.5)).toBe(arrangement);
    expect(moveClipEnvelopePoint(arrangement, 'missing', 8, 10, 0.5)).toBe(arrangement);
  });
});

describe('SRW-18 stage 2 envelope under clip edits (EV4)', () => {
  const original = stemsClip({ envelope: V_POINTS });
  const arrangement = envelopeArrangement([original]);

  it('EV4 a move keeps the envelope and the timeline points shift with the clip', () => {
    const moved = moveClip(arrangement, 'c', 3);
    if (!moved) {
      throw new Error('move refused');
    }
    expect(clipById(moved, 'c').envelope).toStrictEqual(V_POINTS);
    expect(formatClipEnvelopeData(clipById(moved, 'c'))).toBe(
      '7.000:1.0000;11.000:0.2512;15.000:1.0000',
    );
  });

  it('EV4 a split gives both parts the full list and the level is continuous at the cut', () => {
    const split = splitClipAt(arrangement, 'c', 10);
    if (!split) {
      throw new Error('split refused');
    }
    const left = clipById(split.arrangement, split.leftId);
    const right = clipById(split.arrangement, split.rightId);
    expect(left.envelope).toStrictEqual(V_POINTS);
    expect(right.envelope).toStrictEqual(V_POINTS);
    expect(clipEnvelopeGainAt(left, 10)).toBe(0.2512);
    expect(clipEnvelopeGainAt(right, 10)).toBe(0.2512);
    expect(formatClipEnvelopeData(left)).toBe('6.000:1.0000;10.000:0.2512');
    expect(formatClipEnvelopeData(right)).toBe('10.000:0.2512;14.000:1.0000');
    for (let time = 2; time <= 18; time += 0.25) {
      const part = time < 10 ? left : right;
      expect(clipEnvelopeGainAt(part, time)).toBeCloseTo(clipEnvelopeGainAt(original, time), 12);
    }
  });

  it('EV4 a start trim hides points without deleting them and a trim back shows them again', () => {
    const trimmed = trimClipStart(arrangement, 'c', 8);
    const clip = clipById(trimmed, 'c');
    expect(clip.envelope).toStrictEqual(V_POINTS);
    expect(visibleClipEnvelopePoints(clip)).toStrictEqual([V_POINTS[1], V_POINTS[2]]);
    expect(clipEnvelopeGainAt(clip, 8)).toBeCloseTo(0.6256, 10);
    const back = clipById(trimClipStart(trimmed, 'c', 2), 'c');
    expect(visibleClipEnvelopePoints(back)).toStrictEqual(V_POINTS);
  });

  it('EV4 Delete Time keeps the level of every source sample on the right part', () => {
    const deleted = deleteTime(arrangement, 4, 5);
    const right = deleted.clips.find((entry) => entry.start === 4);
    if (!right) {
      throw new Error('right part missing');
    }
    expect(right.envelope).toStrictEqual(V_POINTS);
    for (let time = 4; time <= 17; time += 0.25) {
      expect(clipEnvelopeGainAt(right, time)).toBeCloseTo(
        clipEnvelopeGainAt(original, time + 1),
        12,
      );
    }
    const cut = cutRangeFromArrangement(arrangement, { start: 8, end: 9, trackId: 'stems' });
    expect(cut.clips.map((entry) => entry.envelope)).toStrictEqual([V_POINTS, V_POINTS]);
  });

  it('EV4 duplicate, clip copy/paste and range copy keep the whole list', () => {
    const duplicated = duplicateClips(arrangement, ['c']);
    if (!duplicated?.arrangement) {
      throw new Error('duplicate refused');
    }
    expect(clipById(duplicated.arrangement, duplicated.copyIds[0]).envelope).toStrictEqual(
      V_POINTS,
    );
    const clipboard = copyClipsToClipboard(arrangement, ['c']);
    expect(clipboard?.items[0].envelope).toStrictEqual(V_POINTS);
    const pasted = planClipboardPaste(arrangement, clipboard, {
      at: 20,
      activeTrackId: 'stems',
      isSourceAvailable: () => true,
    });
    if (!pasted.arrangement) {
      throw new Error('paste refused');
    }
    const copy = clipById(pasted.arrangement, pasted.clipIds[0]);
    expect(copy.envelope).toStrictEqual(V_POINTS);
    expect(formatClipEnvelopeData(copy)).toBe('24.000:1.0000;28.000:0.2512;32.000:1.0000');
    const range = copyRangeToClipboard(arrangement, { start: 8, end: 12, trackId: 'stems' });
    expect(range?.items[0]).toStrictEqual({
      trackId: 'stems',
      sourceId: 'pulse',
      offset: 0,
      sourceOffset: 6,
      duration: 4,
      envelope: V_POINTS,
    });
  });

  it('EV4 a clip without an envelope gives exactly today’s objects (no envelope key)', () => {
    const plain = envelopeArrangement([stemsClip()]);
    const clipboard = copyClipsToClipboard(plain, ['c']);
    expect(clipboard?.items[0]).toStrictEqual({
      trackId: 'stems',
      sourceId: 'pulse',
      offset: 0,
      sourceOffset: 0,
      duration: 16,
    });
    const range = copyRangeToClipboard(plain, { start: 4, end: 6, trackId: 'stems' });
    expect(range?.items[0] && 'envelope' in range.items[0]).toBe(false);
    const pasted = planClipboardPaste(plain, clipboard, {
      at: 20,
      activeTrackId: 'stems',
      isSourceAvailable: () => true,
    });
    const copy = pasted.arrangement && clipById(pasted.arrangement, pasted.clipIds[0]);
    expect(copy && 'envelope' in copy).toBe(false);
    expect(clipEnvelopeShapes(plain).size).toBe(0);
  });

  it('EV4 shapes cover audio clips with at least one point only', () => {
    const shapes = clipEnvelopeShapes(
      envelopeArrangement([
        stemsClip({ envelope: V_POINTS }),
        stemsClip({ id: 'empty', start: 30, envelope: [] }),
        {
          id: 'v',
          trackId: 'video',
          sourceId: 'film',
          start: 0,
          sourceOffset: 0,
          duration: 6,
          envelope: [{ time: 1, gain: 0.5 }],
        },
      ]),
    );
    expect([...shapes.keys()]).toEqual(['c']);
    expect(shapes.get('c')).toStrictEqual({ points: V_POINTS });
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
  start() {}
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

function gainAfter(node: ScheduleAudioNode | null | undefined, label: string): RecordingGain {
  if (!(node instanceof RecordingNode) || !(node.target instanceof RecordingGain)) {
    throw new Error(`${label} is not connected to a gain`);
  }
  return node.target;
}

function roundedCalls(gain: RecordingGain): ParamCall[] {
  return gain.gain.calls.map(([method, value, time]) => [
    method,
    Math.round(value * 1e6) / 1e6,
    Math.round(time * 1e6) / 1e6,
  ]);
}

function scheduleEnvelopes(arrangement: Arrangement, from: number, startAt: number) {
  const ctx = new RecordingContext();
  const handle = applySchedule(ctx, planSchedule(arrangement, from), {
    buffers: new Map([['pulse', { id: 'pulse' }]]),
    tracks: arrangement.tracks,
    from,
    startAt,
    clipFades: clipFadeShapes(arrangement),
    clipEnvelopes: clipEnvelopeShapes(arrangement),
  });
  return { ctx, handle };
}

describe('SRW-18 stage 2 envelope scheduling in applySchedule (EV5)', () => {
  it('EV5a playing from 0 sets the first value at the clip start and ramps through every point', () => {
    const arrangement = envelopeArrangement([stemsClip({ envelope: V_POINTS })]);
    const { ctx } = scheduleEnvelopes(arrangement, 0, 0);
    const envelopeGain = gainAfter(ctx.sources[0], 'source');
    expect(envelopeGain.gain.value).toBe(1);
    expect(roundedCalls(envelopeGain)).toEqual([
      ['set', 1, 2],
      ['ramp', 1, 6],
      ['ramp', 0.2512, 10],
      ['ramp', 1, 14],
      ['ramp', 1, 18],
    ]);
  });

  it('EV5b a mid-clip start begins at the line value of that position, not at the first point', () => {
    const arrangement = envelopeArrangement([stemsClip({ envelope: V_POINTS })]);
    const { ctx } = scheduleEnvelopes(arrangement, 8, 100);
    const envelopeGain = gainAfter(ctx.sources[0], 'source');
    expect(envelopeGain.gain.value).toBeCloseTo(0.6256, 10);
    expect(roundedCalls(envelopeGain)).toEqual([
      ['set', 0.6256, 100],
      ['ramp', 0.2512, 102],
      ['ramp', 1, 106],
      ['ramp', 1, 110],
    ]);
  });

  it('EV5c a trimmed window ramps toward a hidden point after it and ends on the line value', () => {
    const arrangement = envelopeArrangement([
      stemsClip({ start: 8, sourceOffset: 6, duration: 4, envelope: V_POINTS }),
    ]);
    const { ctx } = scheduleEnvelopes(arrangement, 0, 0);
    expect(roundedCalls(gainAfter(ctx.sources[0], 'source'))).toEqual([
      ['set', 0.6256, 8],
      ['ramp', 0.2512, 10],
      ['ramp', 0.6256, 12],
    ]);
  });

  it('EV5d a clip without points builds no extra node; one with points adds exactly one', () => {
    const plain = envelopeArrangement([stemsClip()]);
    const { ctx } = scheduleEnvelopes(plain, 0, 0);
    expect(ctx.gains).toHaveLength(1 + plain.tracks.length + 1);
    expect(gainAfter(ctx.sources[0], 'source')).toBe(ctx.gains[1 + plain.tracks.length]);
    const shaped = scheduleEnvelopes(
      envelopeArrangement([stemsClip({ envelope: V_POINTS })]),
      0,
      0,
    );
    expect(shaped.ctx.gains).toHaveLength(1 + plain.tracks.length + 2);
  });

  it('EV5e a loop iteration appended later schedules against its own startAt', () => {
    const arrangement = envelopeArrangement([
      stemsClip({
        envelope: [
          { time: 2, gain: 1 },
          { time: 4, gain: 0.5 },
        ],
      }),
    ]);
    const params = { loop: { start: 2, end: 10, enabled: true }, from: 2, startAt: 10 };
    const ctx = new RecordingContext();
    const options = {
      buffers: new Map([['pulse', { id: 'pulse' }]]),
      tracks: arrangement.tracks,
      clipEnvelopes: clipEnvelopeShapes(arrangement),
    };
    const handle = applySchedule(ctx, planLoopIteration(arrangement, params, 0), {
      ...options,
      from: 2,
      startAt: 10,
    });
    handle.appendPlan(planLoopIteration(arrangement, params, 1), 2, 18);
    expect(ctx.sources).toHaveLength(2);
    expect(roundedCalls(gainAfter(ctx.sources[0], 'first source'))).toEqual([
      ['set', 1, 10],
      ['ramp', 1, 12],
      ['ramp', 0.5, 14],
      ['ramp', 0.5, 18],
    ]);
    expect(roundedCalls(gainAfter(ctx.sources[1], 'second source'))).toEqual([
      ['set', 1, 18],
      ['ramp', 1, 20],
      ['ramp', 0.5, 22],
      ['ramp', 0.5, 26],
    ]);
  });

  it('EV5f setClipGain touches only the clip gain; disconnect releases the envelope node', () => {
    const arrangement = envelopeArrangement([stemsClip({ envelope: V_POINTS })]);
    const { ctx, handle } = scheduleEnvelopes(arrangement, 0, 0);
    const envelopeGain = gainAfter(ctx.sources[0], 'source');
    const clipGain = gainAfter(envelopeGain, 'envelope gain');
    const before = [...envelopeGain.gain.calls];
    handle.setClipGain('c', 0.5);
    expect(envelopeGain.gain.calls).toEqual(before);
    expect(clipGain.gain.calls).toEqual([['target', 0.5, 0]]);
    handle.disconnect();
    expect(envelopeGain.disconnected).toBe(1);
  });

  it('EV5g a faded clip with an envelope connects source → fade → envelope → clip gain', () => {
    const arrangement = envelopeArrangement([stemsClip({ fadeIn: 1, envelope: V_POINTS })]);
    const { ctx } = scheduleEnvelopes(arrangement, 0, 0);
    const base = 1 + arrangement.tracks.length;
    const [clipGain, fadeGain, envelopeGain] = ctx.gains.slice(base);
    expect(ctx.sources[0].target).toBe(fadeGain);
    expect(fadeGain.target).toBe(envelopeGain);
    expect(envelopeGain.target).toBe(clipGain);
    expect(clipGain.target).toBe(
      ctx.gains[1 + arrangement.tracks.findIndex((t) => t.id === 'stems')],
    );
    expect(roundedCalls(fadeGain)).toEqual([
      ['set', 0, 2],
      ['ramp', 1, 3],
    ]);
    expect(roundedCalls(envelopeGain)[0]).toEqual(['set', 1, 2]);
  });

  it('EV5h an ended source is released together with its envelope node on the next append', () => {
    const arrangement = envelopeArrangement([stemsClip({ envelope: V_POINTS })]);
    const { ctx, handle } = scheduleEnvelopes(arrangement, 0, 0);
    const envelopeGain = gainAfter(ctx.sources[0], 'source');
    ctx.sources[0].onended?.(new Event('ended'));
    handle.appendPlan([], 0, 0);
    expect(envelopeGain.disconnected).toBe(1);
  });
});

describe('SRW-18 stage 2 export source (EV6)', () => {
  it('EV6 renderArrangementWav passes envelopes and fades and still has no pan or live-gain calls', () => {
    const source = readFileSync(resolve(__dirname, '../graph.client.ts'), 'utf8');
    const render = source.slice(source.indexOf('export async function renderArrangementWav'));
    expect(render).toContain('clipEnvelopes: clipEnvelopeShapes(arrangement),');
    expect(render).toContain('clipFades: clipFadeShapes(arrangement),');
    expect(render).not.toContain('pan');
    expect(render).not.toContain('setTrackGain');
    expect(render).not.toContain('setClipGain');
    const context = readFileSync(
      resolve(__dirname, '../../../contexts/ArrangementContext.tsx'),
      'utf8',
    );
    expect(context).toContain('clipEnvelopes: clipEnvelopeShapes(arrangement),');
  });
});

class FakeRenderBuffer implements AudioBuffer {
  readonly duration = 20;
  readonly length = 960000;
  readonly numberOfChannels = 1;
  readonly sampleRate = 48000;
  copyFromChannel() {}
  copyToChannel() {}
  getChannelData() {
    return new Float32Array(this.length);
  }
}

describe('SRW-18 stage 2 export render (EV6b)', () => {
  it('EV6b an export renders an enveloped clip through its own envelope gain', async () => {
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
      const arrangement = envelopeArrangement([
        stemsClip({ envelope: V_POINTS }),
        stemsClip({ id: 'plain', start: 20, duration: 2 }),
      ]);
      await renderArrangementWav(arrangement, new Map([['pulse', new FakeRenderBuffer()]]));
      const [ctx] = contexts;
      expect(ctx.sources).toHaveLength(2);
      expect(roundedCalls(gainAfter(ctx.sources[0], 'source'))).toEqual([
        ['set', 1, 2],
        ['ramp', 1, 6],
        ['ramp', 0.2512, 10],
        ['ramp', 1, 14],
        ['ramp', 1, 18],
      ]);
      expect(gainAfter(ctx.sources[1], 'plain source').gain.calls).toEqual([]);
      expect(ctx.gains).toHaveLength(1 + arrangement.tracks.length + 3);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
