import { describe, expect, it } from 'vitest';
import {
  adaptiveGridDivisionId,
  GRID_ADAPTIVE_DENSITY_MAX,
  GRID_ADAPTIVE_DENSITY_MIN,
  GRID_ADAPTIVE_MIN_SPACING_PX,
  gridDivisionSecondsOf,
  MUSICAL_GRID_DIVISIONS,
  MUSICAL_TRIPLET_GRID_DIVISIONS,
} from '../grid-divisions';

const SECONDS_FAMILY = ['10', '5', '2', '1', '0.5', '0.25', '0.1'];
const STRAIGHT_FAMILY = MUSICAL_GRID_DIVISIONS.map((division) => division.id);
const TRIPLET_FAMILY = MUSICAL_TRIPLET_GRID_DIVISIONS.map((division) => division.id);
const SPACING_EPSILON = 1e-6;

function logSpacedZooms(count: number, min: number, max: number): number[] {
  const ratio = Math.log(max / min);
  return Array.from({ length: count }, (_, index) => min * Math.exp((ratio * index) / (count - 1)));
}

describe('SABA-B-11b stage 1 adaptive grid chooser (D-29z357)', () => {
  it('GA1 the seconds family picks the finest step that is at least 24 px apart', () => {
    expect(adaptiveGridDivisionId('1', null, 40)).toBe('1');
    expect(adaptiveGridDivisionId('1', null, 50)).toBe('0.5');
    expect(adaptiveGridDivisionId('1', null, 97.66)).toBe('0.25');
    expect(adaptiveGridDivisionId('1', null, 320)).toBe('0.1');
    expect(adaptiveGridDivisionId('1', null, 0.5)).toBe('10');
  });

  it('GA2 for every family and 30 zooms the pick is ≥ 24 px and the next finer member is < 24 px', () => {
    const cases: Array<{ family: string[]; member: string; bpm: number | null }> = [
      { family: SECONDS_FAMILY, member: '1', bpm: null },
      { family: STRAIGHT_FAMILY, member: '1/4', bpm: 90 },
      { family: STRAIGHT_FAMILY, member: '1/4', bpm: 120 },
      { family: TRIPLET_FAMILY, member: '1/4T', bpm: 90 },
      { family: TRIPLET_FAMILY, member: '1/4T', bpm: 120 },
    ];
    let checked = 0;
    for (const { family, member, bpm } of cases) {
      for (const zoom of logSpacedZooms(30, 0.5, 320)) {
        const pick = adaptiveGridDivisionId(member, bpm, zoom);
        const index = family.indexOf(pick);
        expect(index).toBeGreaterThanOrEqual(0);
        const spacing = gridDivisionSecondsOf(pick, bpm) * zoom;
        if (index > 0) {
          expect(spacing).toBeGreaterThanOrEqual(GRID_ADAPTIVE_MIN_SPACING_PX - SPACING_EPSILON);
        }
        const finer = family[index + 1];
        if (finer !== undefined) {
          expect(gridDivisionSecondsOf(finer, bpm) * zoom).toBeLessThan(
            GRID_ADAPTIVE_MIN_SPACING_PX - SPACING_EPSILON,
          );
        }
        checked += 1;
      }
    }
    expect(checked).toBe(150);
  });

  it('GA3 the straight musical family: 120 BPM @ 40 is 1/2, 90 @ 40 is 1/4, 120 @ 97.66 is 1/8', () => {
    expect(adaptiveGridDivisionId('1/4', 120, 40)).toBe('1/2');
    expect(adaptiveGridDivisionId('1/4', 90, 40)).toBe('1/4');
    expect(gridDivisionSecondsOf('1/4', 90) * 40).toBeCloseTo(26.67, 2);
    expect(adaptiveGridDivisionId('1/4', 120, 97.66)).toBe('1/8');
    expect(adaptiveGridDivisionId('bar', 120, 97.66)).toBe('1/8');
  });

  it('GA4 the triplet family stays triplet: 120 BPM @ 122.07 px/s is 1/4T', () => {
    expect(adaptiveGridDivisionId('1/4T', 120, 122.07)).toBe('1/4T');
    expect(adaptiveGridDivisionId('1/32T', 120, 122.07)).toBe('1/4T');
  });

  it('GA5 density moves the pick by one member per level and clamps at the family ends', () => {
    expect(adaptiveGridDivisionId('1', null, 40, 0)).toBe('1');
    expect(adaptiveGridDivisionId('1', null, 40, -1)).toBe('0.5');
    expect(adaptiveGridDivisionId('1', null, 40, -2)).toBe('0.25');
    expect(adaptiveGridDivisionId('1', null, 40, 1)).toBe('2');
    expect(adaptiveGridDivisionId('1', null, 40, 2)).toBe('5');
    expect(adaptiveGridDivisionId('1', null, 320, -2)).toBe('0.1');
    expect(adaptiveGridDivisionId('1', null, 0.5, 2)).toBe('10');
  });

  it('GA6 an unknown id, a zoom that is 0, negative or NaN, or a musical id without a BPM returns the input id', () => {
    expect(adaptiveGridDivisionId('3', null, 40)).toBe('3');
    expect(adaptiveGridDivisionId('1/3', 120, 40)).toBe('1/3');
    expect(adaptiveGridDivisionId('0.5', null, 0)).toBe('0.5');
    expect(adaptiveGridDivisionId('0.5', null, -40)).toBe('0.5');
    expect(adaptiveGridDivisionId('1/8', 120, Number.NaN)).toBe('1/8');
    expect(adaptiveGridDivisionId('1/4', null, 40)).toBe('1/4');
  });

  it('GA7 gridDivisionSecondsOf reads musical steps at a BPM, seconds as numbers, NaN without a BPM', () => {
    expect(gridDivisionSecondsOf('1/4', 90)).toBeCloseTo(0.6667, 4);
    expect(gridDivisionSecondsOf('0.25', null)).toBe(0.25);
    expect(gridDivisionSecondsOf('1/4', null)).toBeNaN();
  });

  it('GA8 the agreed constants: 24 px, density −2 … 2', () => {
    expect(GRID_ADAPTIVE_MIN_SPACING_PX).toBe(24);
    expect(GRID_ADAPTIVE_DENSITY_MIN).toBe(-2);
    expect(GRID_ADAPTIVE_DENSITY_MAX).toBe(2);
  });
});
