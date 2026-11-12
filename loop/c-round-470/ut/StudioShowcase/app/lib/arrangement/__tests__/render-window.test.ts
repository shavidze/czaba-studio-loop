import { describe, expect, it } from 'vitest';
import {
  ARRANGEMENT_RENDER_WINDOW_MIN_SECONDS,
  arrangementRangeRenderWindow,
  isValidArrangementRenderWindow,
} from '../render-window';

const XU4_INVALID_WINDOWS = [
  { start: 5, end: 5 },
  { start: 5, end: 5.0005 },
  { start: 9, end: 4 },
  { start: -1, end: 4 },
  { start: 0, end: Number.POSITIVE_INFINITY },
  { start: Number.NaN, end: 4 },
];

describe('arrangement render window rule (R0, GATE85-S3)', () => {
  it('RW1 strict validity accepts 4–9 and exactly 1 ms, rejects every XU4 window including inverted', () => {
    expect(isValidArrangementRenderWindow({ start: 4, end: 9 })).toBe(true);
    expect(isValidArrangementRenderWindow({ start: 0, end: 0.001 })).toBe(true);
    for (const invalid of XU4_INVALID_WINDOWS) {
      expect(isValidArrangementRenderWindow(invalid)).toBe(false);
    }
  });

  it('RW2 a range maps to a normalised window or null', () => {
    expect(ARRANGEMENT_RENDER_WINDOW_MIN_SECONDS).toBe(0.001);
    expect(arrangementRangeRenderWindow(null)).toBeNull();
    expect(arrangementRangeRenderWindow(undefined)).toBeNull();
    expect(arrangementRangeRenderWindow({ start: 9, end: 4 })).toStrictEqual({ start: 4, end: 9 });
    expect(arrangementRangeRenderWindow({ start: 4, end: 9 })).toStrictEqual({ start: 4, end: 9 });
    expect(arrangementRangeRenderWindow({ start: 5, end: 5.0009 })).toBeNull();
    expect(arrangementRangeRenderWindow({ start: Number.NaN, end: 4 })).toBeNull();
    expect(arrangementRangeRenderWindow({ start: 4, end: Number.NaN })).toBeNull();
    expect(arrangementRangeRenderWindow({ start: -1, end: 4 })).toBeNull();
    expect(arrangementRangeRenderWindow({ start: 4, end: -1 })).toBeNull();
  });
});
