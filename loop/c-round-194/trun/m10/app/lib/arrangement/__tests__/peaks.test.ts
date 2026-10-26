import { describe, expect, it } from 'vitest';
import { computePeaks, normalizePeakColumns } from '../peaks';

describe('computePeaks', () => {
  it('returns one bucket per slice with the max absolute value across channels', () => {
    const left = new Float32Array([0.1, -0.5, 0.2, 0.3, 0, -0.25, 0.75, 0.1, 0.05]);
    const right = new Float32Array([0, 0.2, -0.4, 0.1, -0.9, 0, 0, 0, 0]);
    const peaks = computePeaks([left, right], 4, 2);
    expect(peaks).toHaveLength(5);
    expect(Array.from(peaks)).toEqual([
      0.5,
      Math.fround(0.4),
      Math.fround(0.9),
      0.75,
      Math.fround(0.05),
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(computePeaks([], 48000, 100)).toHaveLength(0);
  });

  it('uses bucketsPerSecond for the bucket count', () => {
    expect(computePeaks([new Float32Array(48000 * 3)], 48000, 100)).toHaveLength(300);
  });
});

describe('normalizePeakColumns (C-R4-04, R5-B3)', () => {
  it('scales a quiet source so its loudest column is 1', () => {
    const normalized = normalizePeakColumns([0.05, 0.25, 0.125, 0]);
    expect(Math.max(...normalized)).toBe(1);
    expect(normalized).toEqual([0.2, 1, 0.5, 0]);
  });

  it('returns finite zeros for silence and ignores non-finite values', () => {
    const silent = normalizePeakColumns([0, 0, 0]);
    expect(silent).toEqual([0, 0, 0]);
    const mixed = normalizePeakColumns([Number.NaN, 0.5, Number.POSITIVE_INFINITY]);
    expect(mixed).toEqual([0, 1, 0]);
    expect(normalizePeakColumns([])).toEqual([]);
  });
});
