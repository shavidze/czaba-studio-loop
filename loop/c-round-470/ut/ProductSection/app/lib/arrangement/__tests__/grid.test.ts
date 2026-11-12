import { describe, expect, it } from 'vitest';
import {
  adjacentGridLine,
  formatGridDivision,
  GRID_DEFAULT_DIVISION_SECONDS,
  GRID_DIVISIONS_SECONDS,
  GRID_LINE_MIN_SPACING_PX,
  gridLinesVisible,
  snapGroupDelta,
  snapTimeToGrid,
} from '../grid';

function isWholeMillisecond(value: number): boolean {
  return Math.abs(value * 1000 - Math.round(value * 1000)) < 1e-9;
}

function isOnGrid(value: number, step: number): boolean {
  return Math.abs(value / step - Math.round(value / step)) < 1e-6;
}

function seededValues(count: number): number[] {
  let state = 47;
  const values: number[] = [];
  for (let index = 0; index < count; index++) {
    state = (state * 1103515245 + 12345) % 2147483648;
    values.push((state / 2147483648) * 120 - 5);
  }
  return values;
}

describe('grid constants (SRW-14 stage 1)', () => {
  it('offers seven whole-millisecond divisions, 1 s by default, 6 px minimum spacing', () => {
    expect([...GRID_DIVISIONS_SECONDS]).toEqual([10, 5, 2, 1, 0.5, 0.25, 0.1]);
    for (const step of GRID_DIVISIONS_SECONDS) {
      expect(isWholeMillisecond(step)).toBe(true);
    }
    expect(GRID_DEFAULT_DIVISION_SECONDS).toBe(1);
    expect(GRID_LINE_MIN_SPACING_PX).toBe(6);
  });
});

describe('snapTimeToGrid (GM1)', () => {
  it('snaps to the nearest line, a tie goes later, never below 0', () => {
    expect(snapTimeToGrid(0.4, 1)).toBe(0);
    expect(snapTimeToGrid(0.5, 1)).toBe(1);
    expect(snapTimeToGrid(2.5, 1)).toBe(3);
    expect(snapTimeToGrid(0.125, 0.25)).toBe(0.25);
    expect(snapTimeToGrid(7.926, 0.25)).toBe(8);
    expect(snapTimeToGrid(0.149, 0.1)).toBe(0.1);
    expect(snapTimeToGrid(-0.3, 1)).toBe(0);
  });

  it('returns whole milliseconds on the grid for 1000 seeded values at every division', () => {
    const values = seededValues(1000);
    for (const step of GRID_DIVISIONS_SECONDS) {
      for (const value of values) {
        const snapped = snapTimeToGrid(value, step);
        expect(isWholeMillisecond(snapped)).toBe(true);
        expect(isOnGrid(snapped, step)).toBe(true);
        expect(snapped).toBeGreaterThanOrEqual(0);
        expect(Math.abs(snapped - Math.max(0, value))).toBeLessThanOrEqual(
          step / 2 + 0.0005 + 1e-9,
        );
      }
    }
  });

  it('breaks decimal ties towards the later line despite binary floating point', () => {
    expect(snapTimeToGrid(0.15, 0.1)).toBe(0.2);
    expect(snapTimeToGrid(7.05, 0.1)).toBe(7.1);
    expect(snapTimeToGrid(0.35, 0.1)).toBe(0.4);
    expect(snapTimeToGrid(5.6 - 2.6, 2)).toBe(4);
    expect(snapTimeToGrid(1.4 - 0.9, 1)).toBe(1);
  });

  it('equals the whole-millisecond reference for every millisecond up to 120 s', () => {
    for (const step of GRID_DIVISIONS_SECONDS) {
      const stepMs = Math.round(step * 1000);
      for (let ms = 0; ms <= 120000; ms++) {
        const expected = (Math.floor(ms / stepMs + 0.5) * stepMs) / 1000;
        if (snapTimeToGrid(ms / 1000, step) !== expected) {
          expect(`${ms / 1000}/${step} → ${snapTimeToGrid(ms / 1000, step)}`).toBe(
            `${ms / 1000}/${step} → ${expected}`,
          );
        }
      }
    }
  });
});

describe('adjacentGridLine (GM2)', () => {
  it('finds the line strictly after or before, null before 0', () => {
    expect(adjacentGridLine(7, 1, 1)).toBe(8);
    expect(adjacentGridLine(7, 1, -1)).toBe(6);
    expect(adjacentGridLine(7.3, 1, 1)).toBe(8);
    expect(adjacentGridLine(7.3, 1, -1)).toBe(7);
    expect(adjacentGridLine(0, 1, -1)).toBeNull();
    expect(adjacentGridLine(0.05, 0.1, -1)).toBe(0);
    expect(adjacentGridLine(0.1, 0.1, 1)).toBe(0.2);
    expect(adjacentGridLine(0.3, 0.1, 1)).toBe(0.4);
    expect(adjacentGridLine(0.3, 0.1, -1)).toBe(0.2);
  });

  it('equals the whole-millisecond reference for every millisecond up to 120 s', () => {
    for (const step of GRID_DIVISIONS_SECONDS) {
      const stepMs = Math.round(step * 1000);
      for (let ms = 0; ms <= 120000; ms++) {
        const after = ((Math.floor(ms / stepMs) + 1) * stepMs) / 1000;
        const beforeIndex = Math.ceil(ms / stepMs) - 1;
        const before = beforeIndex < 0 ? null : (beforeIndex * stepMs) / 1000;
        const actual = [
          adjacentGridLine(ms / 1000, step, 1),
          adjacentGridLine(ms / 1000, step, -1),
        ];
        if (actual[0] !== after || actual[1] !== before) {
          expect(`${ms / 1000}/${step} → ${actual.join(',')}`).toBe(
            `${ms / 1000}/${step} → ${after},${before}`,
          );
        }
      }
    }
  });
});

describe('snapGroupDelta (GM3)', () => {
  it('moves the anchor onto the grid and never jumps against the drag', () => {
    expect(snapGroupDelta(7, 0.6, 1, -7, 10)).toBe(1);
    expect(snapGroupDelta(7, 0.6, 1, -7, 0.4)).toBe(0);
    expect(snapGroupDelta(7.3, 0.9, 1, -7, 3)).toBe(0.7);
    expect(snapGroupDelta(7, 2.6, 1, -7, 2.2)).toBe(2);
    expect(snapGroupDelta(7.3, -0.2, 1, -0.1, 5)).toBe(0);
  });

  it('keeps the bounded result between 0 and the snapped delta for a leftward drag', () => {
    expect(snapGroupDelta(7.3, -2.6, 1, -1.5, 5)).toBe(-1.3);
    expect(snapGroupDelta(4.3, 0.9, 1, -4.3, 10)).toBe(0.7);
  });

  it('breaks decimal ties of the anchor towards the later line', () => {
    expect(snapGroupDelta(0, 0.15, 0.1, 0, 100)).toBe(0.2);
    expect(snapGroupDelta(5.6, -2.6, 2, -5.6, 100)).toBe(-1.6);
    expect(snapGroupDelta(1.4, -0.9, 1, -1.4, 100)).toBe(-0.4);
    expect(snapGroupDelta(7, 0.05, 0.1, -7, 0.04)).toBe(0);
  });
});

describe('gridLinesVisible and formatGridDivision (GM4)', () => {
  it('shows lines only when they are at least 6 px apart', () => {
    expect(gridLinesVisible(1, 40)).toBe(true);
    expect(gridLinesVisible(0.1, 40)).toBe(false);
    expect(gridLinesVisible(0.1, 60)).toBe(true);
    expect(gridLinesVisible(10, 0.5)).toBe(false);
  });

  it('labels every division in seconds', () => {
    expect(GRID_DIVISIONS_SECONDS.map((step) => formatGridDivision(step))).toEqual([
      '10 s',
      '5 s',
      '2 s',
      '1 s',
      '0.5 s',
      '0.25 s',
      '0.1 s',
    ]);
  });
});
