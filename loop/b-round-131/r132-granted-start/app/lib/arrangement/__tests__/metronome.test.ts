import { describe, expect, it } from 'vitest';
import type { ArrangementTrack, ScheduledClip } from '~/types/arrangement';
import {
  applySchedule,
  type ScheduleAudioContext,
  type ScheduleAudioNode,
  type ScheduleAudioParam,
  type ScheduleGainNode,
  type SchedulePannerNode,
  type ScheduleSourceNode,
} from '../graph.client';
import {
  generateMetronomeClickSamples,
  METRONOME_ACCENT_PEAK,
  METRONOME_BEAT_PEAK,
  METRONOME_NEEDS_TEMPO_TITLE,
  METRONOME_TITLE,
  type MetronomeClick,
  metronomeStatusMessage,
  planMetronomeClicks,
} from '../metronome';

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
  starts: Array<[number, number, number]> = [];
  stops: Array<number | undefined> = [];
  start(when: number, offset: number, duration: number) {
    this.starts.push([when, offset, duration]);
  }
  stop(when?: number) {
    this.stops.push(when);
  }
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
}

function track(id: string, patch: Partial<ArrangementTrack> = {}): ArrangementTrack {
  return { id, kind: 'audio', name: id, volume: 0.8, mute: false, solo: false, ...patch };
}

const tracks = [track('video', { kind: 'video' }), track('music'), track('sfx')];

const clipPlan: ScheduledClip[] = [
  { clipId: 'a', trackId: 'music', sourceId: 'song', when: 1, sourceOffset: 0, duration: 4 },
  { clipId: 'b', trackId: 'sfx', sourceId: 'hit', when: 2, sourceOffset: 0, duration: 1 },
];

const clipBuffers = new Map<string, FakeBuffer>([
  ['song', { id: 'song' }],
  ['hit', { id: 'hit' }],
]);

const accentBuffer: FakeBuffer = { id: 'accent' };
const beatBuffer: FakeBuffer = { id: 'beat' };

function isClickSource(source: FakeSource): boolean {
  return source.buffer === accentBuffer || source.buffer === beatBuffer;
}

function clickSources(ctx: FakeContext): FakeSource[] {
  return ctx.sources.filter(isClickSource);
}

function masterGain(ctx: FakeContext): FakeGain {
  const master = ctx.gains.find((gain) => gain.outputs.includes(ctx.destination));
  if (!master) {
    throw new Error('master gain missing');
  }
  return master;
}

function scheduleWithClicks(ctx: FakeContext) {
  const tap = new FakeNode('tap');
  const trackTaps = new Map<string, ScheduleAudioNode>(
    tracks.map((entry) => [entry.id, new FakeNode(`tap-${entry.id}`)]),
  );
  const handle = applySchedule(ctx, clipPlan, {
    buffers: clipBuffers,
    tracks,
    from: 1,
    startAt: 10,
    tap,
    trackTaps,
    metronome: {
      accent: accentBuffer,
      beat: beatBuffer,
      clicks: planMetronomeClicks(120, 1, 3),
    },
  });
  return { handle, tap, trackTaps };
}

function signChanges(samples: Float32Array, count: number): number {
  let changes = 0;
  for (let i = 1; i < count; i++) {
    if (samples[i - 1] * samples[i] < 0) {
      changes += 1;
    }
  }
  return changes;
}

function maxMagnitude(samples: Float32Array): number {
  let peak = 0;
  for (const sample of samples) {
    peak = Math.max(peak, Math.abs(sample));
  }
  return peak;
}

function expectClick(click: MetronomeClick | undefined, expected: MetronomeClick) {
  if (!click) {
    throw new Error('click missing');
  }
  expect(click.when).toBeCloseTo(expected.when, 9);
  expect(click.offset).toBeCloseTo(expected.offset, 9);
  expect(click.duration).toBeCloseTo(expected.duration, 9);
  expect(click.accent).toBe(expected.accent);
}

describe('SRW-15 stage 2 metronome plan, sound and graph (D-29z31)', () => {
  it('M1 plans 8 clicks at 120 BPM over 0–4 s with accents on each bar downbeat', () => {
    const clicks = planMetronomeClicks(120, 0, 4);
    expect(clicks).toHaveLength(8);
    clicks.forEach((click, k) => {
      expectClick(click, { when: k * 0.5, offset: 0, duration: 0.03, accent: k === 0 || k === 4 });
    });
  });

  it('M2 computes every beat time from its index, never by accumulation', () => {
    const ninety = planMetronomeClicks(90, 0, 8);
    expect(ninety).toHaveLength(12);
    ninety.forEach((click, k) => {
      expect(click.when).toBe((k * 60) / 90);
    });
    expect(ninety.filter((click) => click.accent).map((click) => click.when)).toEqual([
      (0 * 60) / 90,
      (4 * 60) / 90,
      (8 * 60) / 90,
    ]);
    const fractional = planMetronomeClicks(92.5, 0, 60);
    expect(fractional).toHaveLength(93);
    fractional.forEach((click, k) => {
      expect(click.when).toBe((k * 60) / 92.5);
    });
    expect(fractional.at(-1)?.when).toBeCloseTo(59.675675675675, 9);
  });

  it('M3 keeps only the beats inside the window and never plays the tail of an earlier click', () => {
    const slow = planMetronomeClicks(40, 2, 5);
    expect(slow).toHaveLength(2);
    expectClick(slow[0], { when: 3, offset: 0, duration: 0.03, accent: false });
    expectClick(slow[1], { when: 4.5, offset: 0, duration: 0.03, accent: false });
    const seek = planMetronomeClicks(120, 2.25, 3.1);
    expect(seek).toHaveLength(2);
    expectClick(seek[0], { when: 2.5, offset: 0, duration: 0.03, accent: false });
    expectClick(seek[1], { when: 3, offset: 0, duration: 0.03, accent: false });
  });

  it('M4 includes a beat that lies within ARRANGEMENT_EPS before the window start, clamped to it', () => {
    const clicks = planMetronomeClicks(120, 2.00005, 3);
    expect(clicks).toHaveLength(2);
    expectClick(clicks[0], { when: 2.00005, offset: 0.00005, duration: 0.02995, accent: true });
    expectClick(clicks[1], { when: 2.5, offset: 0, duration: 0.03, accent: false });
  });

  it('M5 truncates the last click at the window end', () => {
    const clicks = planMetronomeClicks(120, 0, 3.51);
    expect(clicks).toHaveLength(8);
    expectClick(clicks.at(-1), { when: 3.5, offset: 0, duration: 0.01, accent: false });
    for (const click of clicks.slice(0, 7)) {
      expect(click.duration).toBeCloseTo(0.03, 9);
    }
  });

  it('M6 returns no clicks for an invalid tempo or an empty window', () => {
    expect(planMetronomeClicks(0, 0, 4)).toEqual([]);
    expect(planMetronomeClicks(Number.NaN, 0, 4)).toEqual([]);
    expect(planMetronomeClicks(Number.POSITIVE_INFINITY, 0, 4)).toEqual([]);
    expect(planMetronomeClicks(-1, 0, 4)).toEqual([]);
    expect(planMetronomeClicks(120, 3, 3)).toEqual([]);
    expect(planMetronomeClicks(120, 4, 3)).toEqual([]);
  });

  it('M7 generates a short decaying click: 1600 Hz accent at 0.5, 1000 Hz beat at 0.25', () => {
    const accent = generateMetronomeClickSamples(48_000, true);
    const beat = generateMetronomeClickSamples(48_000, false);
    expect(accent).toHaveLength(1440);
    expect(beat).toHaveLength(1440);
    expect(accent[0]).toBe(0);
    expect(beat[0]).toBe(0);
    expect(maxMagnitude(accent)).toBeGreaterThanOrEqual(0.9 * METRONOME_ACCENT_PEAK);
    expect(maxMagnitude(accent)).toBeLessThanOrEqual(METRONOME_ACCENT_PEAK);
    expect(maxMagnitude(beat)).toBeGreaterThanOrEqual(0.9 * METRONOME_BEAT_PEAK);
    expect(maxMagnitude(beat)).toBeLessThanOrEqual(METRONOME_BEAT_PEAK);
    expect(Math.abs(accent[accent.length - 1])).toBeLessThan(0.002);
    expect(Math.abs(beat[beat.length - 1])).toBeLessThan(0.002);
    expect(Math.abs(signChanges(accent, 480) - 32)).toBeLessThanOrEqual(2);
    expect(Math.abs(signChanges(beat, 480) - 20)).toBeLessThanOrEqual(2);
  });

  it('M8 writes the on/off status and the two toggle titles verbatim', () => {
    expect(metronomeStatusMessage(40)).toBe(
      'მეტრონომი ჩართულია — 40 BPM, 4/4: კლიკი ყოველ დარტყმაზე, ტაქტის პირველზე უფრო ხმამაღლა. ექსპორტში არ შედის.',
    );
    expect(metronomeStatusMessage(92.5)).toContain('92.5 BPM');
    expect(metronomeStatusMessage(null)).toBe('მეტრონომი გამორთულია.');
    expect(METRONOME_NEEDS_TEMPO_TITLE).toBe('მეტრონომი — ჯერ მიუთითე BPM');
    expect(METRONOME_TITLE).toBe(
      'მეტრონომი — კლიკი ყოველ დარტყმაზე დაკვრისას (4/4, ტაქტის პირველი დარტყმა უფრო ხმამაღლა). Master-ის ხმა და Mute მასზეც მოქმედებს. ექსპორტში არ შედის.',
    );
  });

  it('M9 routes every click through one metronome gain into the master gain only', () => {
    const ctx = new FakeContext();
    const { tap, trackTaps } = scheduleWithClicks(ctx);
    const clicks = clickSources(ctx);
    expect(clicks.map((source) => source.starts)).toEqual([
      [[10, 0, 0.03]],
      [[10.5, 0, 0.03]],
      [[11, 0, 0.03]],
      [[11.5, 0, 0.03]],
    ]);
    expect(clicks.map((source) => source.buffer?.id)).toEqual(['beat', 'beat', 'accent', 'beat']);
    const metronomeGain = clicks[0].outputs[0];
    expect(metronomeGain).toBeInstanceOf(FakeGain);
    for (const source of clicks) {
      expect(source.outputs).toEqual([metronomeGain]);
    }
    const master = masterGain(ctx);
    expect(metronomeGain.outputs).toEqual([master]);
    const trackGains = ctx.gains.filter((gain) =>
      gain.outputs.some((output) => output instanceof FakePanner),
    );
    expect(trackGains).toHaveLength(tracks.length);
    expect(trackGains).not.toContain(metronomeGain);
    expect(ctx.panners).not.toContain(metronomeGain);
    expect(metronomeGain).not.toBe(tap);
    expect([...trackTaps.values()]).not.toContain(metronomeGain);
    const clips = ctx.sources.filter((source) => !isClickSource(source));
    expect(clips).toHaveLength(2);
    for (const source of clips) {
      expect(source.outputs).not.toContain(metronomeGain);
      expect(source.outputs[0].outputs).not.toContain(metronomeGain);
    }
  });

  it('M10 appends clicks, honours stop(when), counts clips only and disconnects everything', () => {
    const ctx = new FakeContext();
    const { handle } = scheduleWithClicks(ctx);
    const reference = applySchedule(new FakeContext(), clipPlan, {
      buffers: clipBuffers,
      tracks,
      from: 1,
      startAt: 10,
    });
    handle.appendClicks(planMetronomeClicks(120, 2, 3), 2, 20);
    const clicks = clickSources(ctx);
    expect(clicks).toHaveLength(6);
    expect(clicks.slice(4).map((source) => source.starts)).toEqual([
      [[20, 0, 0.03]],
      [[20.5, 0, 0.03]],
    ]);
    expect(handle.activeSourceCount()).toBe(reference.activeSourceCount());
    expect(handle.activeSourceCount()).toBe(2);
    const endedClick = clicks[0];
    endedClick.onended?.(new Event('ended'));
    handle.appendClicks([], 2, 20);
    expect(ctx.sources).toHaveLength(clipPlan.length + 6);
    expect(endedClick.disconnected).toBe(true);
    for (const source of clicks.slice(1)) {
      expect(source.disconnected).toBe(false);
    }
    handle.stop(21);
    expect(endedClick.stops).toEqual([]);
    for (const source of clicks.slice(1)) {
      expect(source.stops).toEqual([21]);
    }
    handle.stop();
    for (const source of clicks.slice(1)) {
      expect(source.stops).toEqual([21, undefined]);
    }
    const metronomeGain = clicks[1].outputs[0];
    handle.disconnect();
    for (const source of clicks) {
      expect(source.disconnected).toBe(true);
    }
    expect(metronomeGain.disconnected).toBe(true);
    const sourceCount = ctx.sources.length;
    handle.appendClicks(planMetronomeClicks(120, 3, 4), 3, 30);
    expect(ctx.sources).toHaveLength(sourceCount);
  });

  it('M11 creates exactly the existing nodes without a metronome and appendClicks does nothing', () => {
    const ctx = new FakeContext();
    const handle = applySchedule(ctx, [], {
      buffers: clipBuffers,
      tracks,
      from: 0,
      startAt: 10,
    });
    expect(ctx.gains).toHaveLength(1 + tracks.length);
    expect(ctx.panners).toHaveLength(tracks.length);
    expect(ctx.sources).toHaveLength(0);
    expect(masterGain(ctx).outputs).toEqual([ctx.destination]);
    handle.appendClicks(planMetronomeClicks(120, 0, 4), 0, 10);
    expect(ctx.sources).toHaveLength(0);
    expect(ctx.gains).toHaveLength(1 + tracks.length);
  });
});
