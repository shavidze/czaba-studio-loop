import { describe, expect, it } from 'vitest';
import {
  METRONOME_CLICK_SECONDS,
  type MetronomeClick,
  type MetronomeHorizonState,
  nextMetronomeChunk,
  planMetronomeClicks,
} from '../metronome';
import { ARRANGEMENT_EPS } from '../model';

const LATE_MARGIN = 0.02;
const HORIZON = 2;

function beatTime(click: MetronomeClick): number {
  return click.when - click.offset;
}

function chunkedPlan(bpm: number, end: number, boundaries: number[]): MetronomeClick[] {
  const edges = [0, ...boundaries.filter((value) => value > 0 && value < end), end];
  const clicks: MetronomeClick[] = [];
  for (let i = 0; i + 1 < edges.length; i++) {
    clicks.push(...planMetronomeClicks(bpm, edges[i], edges[i + 1], end));
  }
  return clicks;
}

function beatTimes(bpm: number, end: number): number[] {
  const times: number[] = [];
  for (let k = 0; (k * 60) / bpm < end; k++) {
    times.push((k * 60) / bpm);
  }
  return times;
}

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

describe('D-29z36 metronome horizon planning (pure)', () => {
  it('MH1 an omitted, equal, non-finite or too-small soundUntil gives the 3-argument plan', () => {
    const inputs: Array<[number, number, number]> = [
      [120, 0, 4],
      [90, 0, 8],
      [92.5, 0, 60],
      [40, 2, 5],
      [120, 2.25, 3.1],
      [120, 2.00005, 3],
      [120, 0, 3.51],
      [0, 0, 4],
      [Number.NaN, 0, 4],
      [Number.POSITIVE_INFINITY, 0, 4],
      [-1, 0, 4],
      [120, 3, 3],
      [120, 4, 3],
      [999, 0, 133],
    ];
    for (const [bpm, from, until] of inputs) {
      const plain = planMetronomeClicks(bpm, from, until);
      expect(planMetronomeClicks(bpm, from, until, until)).toEqual(plain);
      expect(planMetronomeClicks(bpm, from, until, Number.NaN)).toEqual(plain);
      expect(planMetronomeClicks(bpm, from, until, Number.POSITIVE_INFINITY)).toEqual(plain);
      expect(planMetronomeClicks(bpm, from, until, until - 1)).toEqual(plain);
    }
  });

  it('MH2 any chunking with soundUntil = end reproduces the full plan click for click', () => {
    const failures: string[] = [];
    for (const bpm of [40, 60, 90, 92.5, 120, 133.33, 999]) {
      for (const end of [8, 133]) {
        const full = planMetronomeClicks(bpm, 0, end);
        const beats = beatTimes(bpm, end);
        const families: Record<string, number[]> = {
          seconds: Array.from({ length: Math.ceil(end / 2) }, (_, k) => k * 2),
          beats,
          beatsPlus: beats.map((t) => t + ARRANGEMENT_EPS / 2),
          beatsMinus: beats.map((t) => t - ARRANGEMENT_EPS / 2),
          insideClick: beats.map((t) => t + 0.02),
        };
        for (const [family, boundaries] of Object.entries(families)) {
          const chunked = chunkedPlan(bpm, end, boundaries);
          const label = `${bpm}/${end}/${family}`;
          if (chunked.length !== full.length) {
            failures.push(`${label}: count ${chunked.length} vs ${full.length}`);
            continue;
          }
          const seen = new Set<number>();
          chunked.forEach((click, index) => {
            const reference = full[index];
            const key = Math.round(beatTime(click) * 1e6);
            if (seen.has(key)) {
              failures.push(`${label}: duplicate beat ${beatTime(click)}`);
            }
            seen.add(key);
            if (Math.abs(beatTime(click) - beatTime(reference)) > 1e-9) {
              failures.push(`${label}#${index}: beat ${beatTime(click)} vs ${beatTime(reference)}`);
            }
            if (click.accent !== reference.accent) {
              failures.push(`${label}#${index}: accent`);
            }
            const audibleEnd = click.when + click.duration;
            const referenceEnd = reference.when + reference.duration;
            if (Math.abs(audibleEnd - referenceEnd) > 1e-9) {
              failures.push(`${label}#${index}: end ${audibleEnd} vs ${referenceEnd}`);
            }
          });
        }
      }
    }
    expect({ count: failures.length, first: failures.slice(0, 5) }).toEqual({
      count: 0,
      first: [],
    });
  });

  it('MH3 soundUntil caps a click only at the project end, never at the chunk end', () => {
    const capped = planMetronomeClicks(120, 0, 2, 8);
    const atOneAndHalf = capped.find((click) => click.when === 1.5);
    expect(atOneAndHalf?.duration).toBe(METRONOME_CLICK_SECONDS);
    const straddling = planMetronomeClicks(120, 0, 1.51, 8).at(-1);
    expect(straddling?.when).toBe(1.5);
    expect(straddling?.duration).toBe(METRONOME_CLICK_SECONDS);
    const legacy = planMetronomeClicks(120, 0, 1.51);
    const legacyLast = legacy.at(-1);
    expect(legacyLast?.when).toBe(1.5);
    expect(legacyLast?.duration).toBeCloseTo(0.01, 9);
    const atEnd = planMetronomeClicks(120, 0, 3.51, 3.51);
    const endClick = atEnd.at(-1);
    expect(endClick?.when).toBe(3.5);
    expect(endClick?.duration).toBeCloseTo(0.01, 9);
  });

  it('MH4 nextMetronomeChunk follows the due, late-skip and end rules', () => {
    const base: MetronomeHorizonState = { bpm: 120, from: 10, startAt: 100, end: 60, nextFrom: 12 };
    expect(nextMetronomeChunk(base, 99.9, HORIZON, LATE_MARGIN)).toBeNull();
    expect(nextMetronomeChunk(base, 100.5, HORIZON, LATE_MARGIN)).toEqual({ from: 12, until: 14 });
    const late = nextMetronomeChunk(base, 103, HORIZON, LATE_MARGIN);
    expect(late?.from).toBeCloseTo(13.02, 9);
    expect(late?.until).toBeCloseTo(15.02, 9);
    const nearEnd: MetronomeHorizonState = { ...base, nextFrom: 59 };
    expect(nextMetronomeChunk(nearEnd, 148, HORIZON, LATE_MARGIN)).toEqual({ from: 59, until: 60 });
    const lateNearEnd = nextMetronomeChunk(nearEnd, 149, HORIZON, LATE_MARGIN);
    expect(lateNearEnd?.from).toBeCloseTo(59.02, 9);
    expect(lateNearEnd?.until).toBe(60);
    expect(nextMetronomeChunk({ ...base, nextFrom: 60 }, 148, HORIZON, LATE_MARGIN)).toBeNull();
    expect(nextMetronomeChunk(nearEnd, 152, HORIZON, LATE_MARGIN)).toBeNull();
    for (const key of ['from', 'startAt', 'end', 'nextFrom'] as const) {
      expect(
        nextMetronomeChunk({ ...base, [key]: Number.NaN }, 100.5, HORIZON, LATE_MARGIN),
      ).toBeNull();
    }
  });

  it('MH5 a random audio clock never starts a click in the past and drops only skipped beats', () => {
    const bpm = 999;
    const end = 133;
    const state: MetronomeHorizonState = { bpm, from: 0, startAt: 1, end, nextFrom: HORIZON };
    const appended: MetronomeClick[] = planMetronomeClicks(bpm, 0, HORIZON, end);
    const skipped: Array<[number, number]> = [];
    const pastStarts: string[] = [];
    const random = seededRandom(71);
    let now = 1 - 0.05;
    while (now < state.startAt + end + 6) {
      now += 0.01 + random() * 4.99;
      for (;;) {
        const chunk = nextMetronomeChunk(state, now, HORIZON, LATE_MARGIN);
        if (!chunk) {
          break;
        }
        if (chunk.from > state.nextFrom) {
          skipped.push([state.nextFrom, chunk.from]);
        }
        for (const click of planMetronomeClicks(bpm, chunk.from, chunk.until, end)) {
          const startsAt = state.startAt + (click.when - state.from);
          if (startsAt < now + LATE_MARGIN - 1e-9) {
            pastStarts.push(`${click.when} at ${now}`);
          }
          appended.push(click);
        }
        state.nextFrom = chunk.until;
      }
    }
    expect(pastStarts).toEqual([]);
    expect(skipped.length).toBeGreaterThan(0);
    const fullBeats = planMetronomeClicks(bpm, 0, end).map(beatTime);
    const appendedBeats = appended.map(beatTime);
    const keys = appendedBeats.map((t) => Math.round(t * 1e6));
    expect(new Set(keys).size).toBe(keys.length);
    const fullKeys = new Set(fullBeats.map((t) => Math.round(t * 1e6)));
    expect(keys.filter((key) => !fullKeys.has(key))).toEqual([]);
    const appendedKeys = new Set(keys);
    const wrong = fullBeats.filter((t) => {
      const dropped = skipped.some(
        ([lo, hi]) => t >= lo - ARRANGEMENT_EPS && t < hi - ARRANGEMENT_EPS,
      );
      return appendedKeys.has(Math.round(t * 1e6)) === dropped;
    });
    expect(wrong).toEqual([]);
  });
});
