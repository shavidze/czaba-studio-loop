import { describe, expect, it } from 'vitest';
import { resolveGridTime, resolveGridTimeWithTargets } from '../grid';

const MARKER = 6.375;

describe('SRW-16 stage 2b-3 resolveGridTimeWithTargets', () => {
  it('TU1a follows the Snap / Alt bypass matrix with a marker target', () => {
    expect(resolveGridTimeWithTargets(6.45, 1, 1, false, [MARKER])).toBe(MARKER);
    expect(resolveGridTimeWithTargets(6.45, 1, 1, true, [MARKER])).toBe(6.45);
    expect(resolveGridTimeWithTargets(6.45, null, 1, false, [MARKER])).toBe(6.45);
    expect(resolveGridTimeWithTargets(6.45, null, 1, true, [MARKER])).toBe(MARKER);
    expect(resolveGridTimeWithTargets(6.45, null, undefined, true, [MARKER])).toBe(6.45);
  });

  it('TU1b the nearest of the grid line and the markers wins', () => {
    expect(resolveGridTimeWithTargets(6.1, 1, 1, false, [MARKER])).toBe(6);
    expect(resolveGridTimeWithTargets(6.3, 1, 1, false, [MARKER])).toBe(MARKER);
    expect(resolveGridTimeWithTargets(6.7, 1, 1, false, [MARKER])).toBe(7);
    expect(resolveGridTimeWithTargets(6.45, 1, 1, false, [12, MARKER, 6.6])).toBe(MARKER);
    expect(resolveGridTimeWithTargets(6.55, 1, 1, false, [MARKER, 6.6])).toBe(6.6);
  });

  it('TU1c a tie between the grid line and a marker goes to the grid line', () => {
    expect(resolveGridTimeWithTargets(6.1875, 1, 1, false, [MARKER])).toBe(6);
    expect(resolveGridTimeWithTargets(6.1, 0.25, 0.25, false, [6.2])).toBe(6);
  });

  it('TU1d negative targets are ignored', () => {
    expect(resolveGridTimeWithTargets(-0.3, 1, 1, false, [-0.3])).toBe(0);
    expect(resolveGridTimeWithTargets(0.2, 1, 1, false, [-0.05])).toBe(0);
    expect(resolveGridTimeWithTargets(0.45, 1, 1, false, [-0.5, MARKER])).toBe(0);
  });

  it('TU1e no targets give exactly resolveGridTime', () => {
    const raws = [0, 0.004, 0.4, 0.5, 2 / 3, 1.2345, 6.45, 7.3, 59.999, 123.456];
    const steps = [1, 0.25, 60 / 90];
    for (const step of steps) {
      for (const raw of raws) {
        expect(resolveGridTimeWithTargets(raw, step, step, false, [])).toBe(
          resolveGridTime(raw, step, step, false),
        );
        expect(resolveGridTimeWithTargets(raw, null, step, true, [])).toBe(
          resolveGridTime(raw, null, step, true),
        );
        expect(resolveGridTimeWithTargets(raw, step, step, true, [])).toBe(
          resolveGridTime(raw, step, step, true),
        );
        expect(resolveGridTimeWithTargets(raw, null, step, false, [])).toBe(
          resolveGridTime(raw, null, step, false),
        );
      }
    }
  });
});
