import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementClip, ArrangementLoop } from '~/types/arrangement';
import {
  loopIterationTiming,
  loopTimelinePosition,
  MIN_LOOP_LENGTH,
  moveLoop,
  planLoopIteration,
  resizeLoop,
  resolveActiveLoop,
  setLoopFromRange,
  toggleLoop,
} from '../loop';
import { createArrangement, deleteTime } from '../model';

function baseArrangement(
  clips: ArrangementClip[] = [],
  loop: ArrangementLoop | null = null,
): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips,
    loop,
  };
}

function clip(
  id: string,
  trackId: string,
  start: number,
  duration: number,
  sourceOffset = 0,
): ArrangementClip {
  return { id, trackId, sourceId: `src-${id}`, start, sourceOffset, duration };
}

const loop24: ArrangementLoop = { start: 2, end: 4, enabled: true };

describe('setLoopFromRange', () => {
  it('creates an enabled loop from a range', () => {
    const next = setLoopFromRange(baseArrangement(), { start: 2, end: 4 });
    expect(next?.loop).toEqual({ start: 2, end: 4, enabled: true });
  });

  it('replaces a different brace and re-enables it', () => {
    const next = setLoopFromRange(baseArrangement([], { ...loop24, enabled: false }), {
      start: 6,
      end: 8,
    });
    expect(next?.loop).toEqual({ start: 6, end: 8, enabled: true });
  });

  it('refuses a range shorter than 0.1 s', () => {
    expect(MIN_LOOP_LENGTH).toBe(0.1);
    expect(setLoopFromRange(baseArrangement(), { start: 2, end: 2.09 })).toBeNull();
    expect(setLoopFromRange(baseArrangement(), { start: 2, end: 2.1 })?.loop?.end).toBe(2.1);
  });

  it('returns the same reference when the brace already matches', () => {
    const arrangement = baseArrangement([], loop24);
    expect(setLoopFromRange(arrangement, { start: 2, end: 4 })).toBe(arrangement);
  });
});

describe('toggleLoop', () => {
  it('keeps start and end when toggling off and on', () => {
    const off = toggleLoop(baseArrangement([], loop24));
    expect(off.loop).toEqual({ start: 2, end: 4, enabled: false });
    expect(toggleLoop(off).loop).toEqual(loop24);
  });

  it('is a no-op returning the same reference when there is no loop', () => {
    const arrangement = baseArrangement();
    expect(toggleLoop(arrangement)).toBe(arrangement);
  });
});

describe('moveLoop', () => {
  it('keeps the length', () => {
    expect(moveLoop(baseArrangement([], loop24), 5).loop).toEqual({
      start: 5,
      end: 7,
      enabled: true,
    });
  });

  it('clamps the start at 0', () => {
    expect(moveLoop(baseArrangement([], loop24), -1.5).loop).toEqual({
      start: 0,
      end: 2,
      enabled: true,
    });
  });

  it('returns the same reference when nothing changes', () => {
    const arrangement = baseArrangement([], { start: 0, end: 2, enabled: true });
    expect(moveLoop(arrangement, -1)).toBe(arrangement);
  });
});

describe('resizeLoop', () => {
  it('enforces the 0.1 s minimum on both edges', () => {
    const arrangement = baseArrangement([], loop24);
    expect(resizeLoop(arrangement, 'end', 2.02).loop?.end).toBeCloseTo(2.1, 12);
    expect(resizeLoop(arrangement, 'start', 3.99).loop?.start).toBeCloseTo(3.9, 12);
    expect(resizeLoop(arrangement, 'start', -3).loop?.start).toBe(0);
  });

  it('has no 60 s or project-end cap', () => {
    expect(resizeLoop(baseArrangement([], loop24), 'end', 125).loop).toEqual({
      start: 2,
      end: 125,
      enabled: true,
    });
  });
});

describe('deleteTime remaps the loop', () => {
  it('shifts a loop after the deleted span', () => {
    expect(deleteTime(baseArrangement([], { start: 6, end: 8, enabled: true }), 1, 2).loop).toEqual(
      { start: 5, end: 7, enabled: true },
    );
  });

  it('shrinks a loop the span cuts across (brace 2–4, delete 1–2 → 1–3)', () => {
    expect(deleteTime(baseArrangement([], loop24), 1, 2).loop).toEqual({
      start: 1,
      end: 3,
      enabled: true,
    });
    expect(deleteTime(baseArrangement([], loop24), 3, 3.5).loop).toEqual({
      start: 2,
      end: 3.5,
      enabled: true,
    });
  });

  it('removes a loop that becomes shorter than 0.1 s', () => {
    expect(deleteTime(baseArrangement([], loop24), 1.5, 4.5).loop).toBeNull();
    expect(deleteTime(baseArrangement([], loop24), 2.05, 3.98).loop).toBeNull();
  });

  it('leaves a loop before the span untouched', () => {
    expect(deleteTime(baseArrangement([], loop24), 5, 6).loop).toEqual(loop24);
  });
});

describe('resolveActiveLoop / loopTimelinePosition', () => {
  it('is the identity before the loop end', () => {
    expect(loopTimelinePosition(1, loop24, 1)).toBe(1);
    expect(loopTimelinePosition(3.999, loop24, 1)).toBe(3.999);
  });

  it('maps the loop end to the loop start', () => {
    expect(loopTimelinePosition(4, loop24, 1)).toBe(2);
  });

  it('maps 2.5 iterations after the first pass correctly', () => {
    expect(loopTimelinePosition(4 + 2 * 2.5, loop24, 3)).toBeCloseTo(3, 9);
    expect(loopTimelinePosition(4 + 2 * 2 + 0.25, loop24, 1)).toBeCloseTo(2.25, 9);
  });

  it('stays linear when the schedule starts at or after the loop end', () => {
    expect(resolveActiveLoop(loop24, 6)).toBeNull();
    expect(resolveActiveLoop(loop24, 4)).toBeNull();
    expect(loopTimelinePosition(9, loop24, 6)).toBe(9);
  });

  it('stays linear when the loop is disabled or missing', () => {
    expect(loopTimelinePosition(9, { ...loop24, enabled: false }, 1)).toBe(9);
    expect(loopTimelinePosition(9, null, 1)).toBe(9);
  });
});

describe('planLoopIteration', () => {
  const arrangement = baseArrangement(
    [
      clip('music', 'music', 0, 20),
      clip('impact', 'sfx', 3, 2, 0.5),
      clip('early', 'sfx', 0, 1),
      clip('late', 'sfx', 6, 1),
    ],
    loop24,
  );
  const params = { loop: loop24, from: 1, startAt: 10 };

  it('truncates a clip that straddles the loop end at the end', () => {
    const first = planLoopIteration(arrangement, params, 0);
    expect(first.find((item) => item.clipId === 'music')).toMatchObject({
      when: 1,
      sourceOffset: 1,
      duration: 3,
    });
    expect(first.find((item) => item.clipId === 'impact')).toMatchObject({
      when: 3,
      sourceOffset: 0.5,
      duration: 1,
    });
  });

  it('gives a clip straddling the loop start the offset at loop.start', () => {
    const second = planLoopIteration(arrangement, params, 1);
    expect(second.find((item) => item.clipId === 'music')).toMatchObject({
      when: 2,
      sourceOffset: 2,
      duration: 2,
    });
  });

  it('starts iteration k+1 exactly where iteration k ends', () => {
    for (let iteration = 0; iteration < 4; iteration++) {
      const current = loopIterationTiming(params, iteration);
      const next = loopIterationTiming(params, iteration + 1);
      const music = planLoopIteration(arrangement, params, iteration).find(
        (item) => item.clipId === 'music',
      );
      if (!music) throw new Error('music not planned');
      const currentEnd = current.startAt + (music.when - current.from) + music.duration;
      const nextMusic = planLoopIteration(arrangement, params, iteration + 1).find(
        (item) => item.clipId === 'music',
      );
      if (!nextMusic) throw new Error('music not planned');
      const nextWhen = next.startAt + (nextMusic.when - next.from);
      expect(Math.abs(nextWhen - currentEnd)).toBeLessThan(1e-3);
      expect(nextWhen).toBeCloseTo(current.endAt, 12);
    }
    expect(loopIterationTiming(params, 1).startAt).toBe(13);
    expect(loopIterationTiming(params, 3).startAt).toBe(17);
  });

  it('does not plan a clip fully outside the loop in iterations >= 1', () => {
    expect(planLoopIteration(arrangement, params, 0).some((item) => item.clipId === 'early')).toBe(
      false,
    );
    const fromZero = { ...params, from: 0 };
    expect(
      planLoopIteration(arrangement, fromZero, 0).some((item) => item.clipId === 'early'),
    ).toBe(true);
    for (const iteration of [1, 2, 5]) {
      const ids = planLoopIteration(arrangement, fromZero, iteration).map((item) => item.clipId);
      expect(ids).not.toContain('early');
      expect(ids).not.toContain('late');
      expect(ids.sort()).toEqual(['impact', 'music']);
    }
  });
});
