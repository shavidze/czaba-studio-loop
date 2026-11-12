import { describe, expect, it } from 'vitest';
import { loopTimelinePosition } from '../loop';
import { remapTime } from '../model';
import {
  createPlaybackAnchor,
  isPlaybackAnchorHolding,
  positionAt,
  reschedulePlaybackAnchor,
  shouldRescheduleScrub,
} from '../transport';

const LOOKAHEAD = 0.05;

describe('createPlaybackAnchor (fresh start)', () => {
  it('holds at from before startAt and advances after it', () => {
    const anchor = createPlaybackAnchor(7, 10 + LOOKAHEAD);
    expect(positionAt(anchor, 10)).toBe(7);
    expect(positionAt(anchor, 10.03)).toBe(7);
    expect(positionAt(anchor, 10 + LOOKAHEAD)).toBe(7);
    expect(positionAt(anchor, 11 + LOOKAHEAD)).toBeCloseTo(8, 12);
  });

  it('pause before startAt returns from exactly', () => {
    const anchor = createPlaybackAnchor(20, 3.008 + LOOKAHEAD);
    expect(positionAt(anchor, 3.016)).toBe(20);
  });

  it('five Play/Pause pairs 8 ms apart leave the position unchanged', () => {
    let position = 20;
    let now = 1;
    for (let pair = 0; pair < 5; pair++) {
      const anchor = createPlaybackAnchor(position, now + LOOKAHEAD);
      now += 0.008;
      position = positionAt(anchor, now);
      now += 0.008;
    }
    expect(position).toBe(20);
  });

  it('never moves backwards while playing', () => {
    const anchor = createPlaybackAnchor(5, 2 + LOOKAHEAD);
    let previous = positionAt(anchor, 2);
    for (let t = 2; t < 3; t += 0.016) {
      const current = positionAt(anchor, t);
      expect(current).toBeGreaterThanOrEqual(previous);
      expect(current).toBeGreaterThanOrEqual(5);
      previous = current;
    }
  });
});

describe('reschedulePlaybackAnchor (continuous)', () => {
  it('gives an identical position before and after the handoff', () => {
    const fresh = createPlaybackAnchor(4, 1 + LOOKAHEAD);
    const next = reschedulePlaybackAnchor(fresh, 2 + LOOKAHEAD);
    for (const t of [1.5, 2, 2.03, 2 + LOOKAHEAD, 2.2, 5]) {
      expect(positionAt(next, t)).toBeCloseTo(positionAt(fresh, t), 12);
    }
  });

  it('re-holds until the new startAt when rescheduled inside the previous hold (L2)', () => {
    const fresh = createPlaybackAnchor(9, 1 + LOOKAHEAD);
    const now = 1.02;
    const next = reschedulePlaybackAnchor(fresh, now + LOOKAHEAD, undefined, now);
    expect(next.holdUntil).toBeCloseTo(now + LOOKAHEAD, 12);
    for (const t of [1, 1.01, 1.02, 1 + LOOKAHEAD, 1.06, now + LOOKAHEAD]) {
      expect(positionAt(next, t)).toBe(9);
    }
    expect(positionAt(next, now + LOOKAHEAD + 0.5)).toBeCloseTo(9.5, 12);
  });

  it('a reschedule inside the hold keeps the transport stopped before the sounding startAt (R4-B5)', () => {
    const fresh = createPlaybackAnchor(3, 0.05);
    const next = reschedulePlaybackAnchor(fresh, 0.075, (position) => position, 0.025);
    expect(isPlaybackAnchorHolding(next, 0.05)).toBe(true);
    expect(isPlaybackAnchorHolding(next, 0.074)).toBe(true);
    expect(isPlaybackAnchorHolding(next, 0.075)).toBe(false);
    expect(positionAt(next, 0.06)).toBe(3);
    const mapped = reschedulePlaybackAnchor(fresh, 0.075, (position) => position - 1, 0.025);
    expect(mapped.position).toBe(2);
    expect(positionAt(mapped, 0.07)).toBe(2);
  });

  it('keeps the continuous handoff once the previous anchor is running', () => {
    const fresh = createPlaybackAnchor(9, 1 + LOOKAHEAD);
    const now = 1.2;
    const next = reschedulePlaybackAnchor(fresh, now + LOOKAHEAD, undefined, now);
    for (const t of [now, now + LOOKAHEAD, now + 0.3]) {
      expect(positionAt(next, t)).toBeCloseTo(positionAt(fresh, t), 12);
    }
  });

  it('applies a Delete Time remap once and never moves backwards around the jump', () => {
    const fresh = createPlaybackAnchor(7, 1 + LOOKAHEAD);
    const editAt = 1.94;
    const next = reschedulePlaybackAnchor(fresh, editAt + LOOKAHEAD, (position) =>
      remapTime(position, 4, 6),
    );
    const before = positionAt(fresh, editAt);
    const after = positionAt(next, editAt);
    expect(after - before).toBeCloseTo(-2, 9);
    let previous = after;
    for (let t = editAt; t < editAt + 1; t += 0.016) {
      const current = positionAt(next, t);
      expect(current).toBeGreaterThanOrEqual(previous);
      previous = current;
    }
  });
});

describe('reschedulePlaybackAnchor while looping (D-17)', () => {
  const loop = { start: 2, end: 4, enabled: true };

  function mappedAt(anchor: ReturnType<typeof createPlaybackAnchor>, t: number, active: boolean) {
    return loopTimelinePosition(positionAt(anchor, t), active ? loop : null, anchor.position);
  }

  it('a continuous reschedule while looping keeps the mapped position continuous', () => {
    const fresh = createPlaybackAnchor(1, 1 + LOOKAHEAD);
    const editAt = 5.3;
    const next = reschedulePlaybackAnchor(fresh, editAt + LOOKAHEAD, (position) =>
      loopTimelinePosition(position, loop, fresh.position),
    );
    expect(next.position).toBeGreaterThanOrEqual(2);
    expect(next.position).toBeLessThan(4);
    const handoff = editAt + LOOKAHEAD;
    expect(mappedAt(next, handoff, true)).toBeCloseTo(mappedAt(fresh, handoff, true), 9);
    for (let t = handoff; t < handoff + 5; t += 0.01) {
      expect(mappedAt(next, t, true)).toBeCloseTo(mappedAt(fresh, t, true), 6);
    }
  });

  it('toggle-off hands off at the mapped position with no jump, then runs linearly', () => {
    const fresh = createPlaybackAnchor(1, 1 + LOOKAHEAD);
    const offAt = 6.2;
    const handoff = offAt + LOOKAHEAD;
    const next = reschedulePlaybackAnchor(fresh, handoff, (position) =>
      loopTimelinePosition(position, loop, fresh.position),
    );
    const before = mappedAt(fresh, handoff - 0.016, true);
    const after = mappedAt(next, handoff, false);
    expect(after - before).toBeGreaterThanOrEqual(0);
    expect(after - before).toBeLessThan(0.02);
    expect(mappedAt(next, handoff + 3, false)).toBeCloseTo(after + 3, 9);
    expect(mappedAt(next, handoff + 3, false)).toBeGreaterThan(4);
  });
});

describe('shouldRescheduleScrub', () => {
  it('allows the first reschedule and then at most one per 100 ms', () => {
    expect(shouldRescheduleScrub(null, 5)).toBe(true);
    expect(shouldRescheduleScrub(5, 5.05)).toBe(false);
    expect(shouldRescheduleScrub(5, 5.099)).toBe(false);
    expect(shouldRescheduleScrub(5, 5.1)).toBe(true);
    expect(shouldRescheduleScrub(5, 6)).toBe(true);
  });
});
