import { describe, expect, it } from 'vitest';
import { buildPeakShape } from '~/components/arrangement/ArrangementClip';
import { PEAK_BUCKETS_PER_SECOND, PEAK_SHAPE_MAX_COLUMNS, waveformPeakColumns } from '../peaks';

type PeakColumnEdges = readonly [string, string];

interface PeakShapeCase {
  label: string;
  peaks: Float32Array;
  sourceOffset: number;
  duration: number;
  columns: number;
  scale: number;
}

const FIVE_COLUMN_PEAKS = new Float32Array([0.2, 0.5, 0.9, 1.0, 0.01]);

function realisticPeaks(): Float32Array {
  const peaks = new Float32Array(300);
  for (let i = 0; i < 300; i++) {
    peaks[i] = Math.abs(Math.sin(i / 7)) * (0.3 + 0.7 * Math.abs(Math.cos(i / 41)));
  }
  return peaks;
}

function fiveColumnCase(label: string, scale: number): PeakShapeCase {
  return { label, peaks: FIVE_COLUMN_PEAKS, sourceOffset: 0, duration: 0.05, columns: 5, scale };
}

const OUTLINE_CASES: readonly PeakShapeCase[] = [
  ...[0.5, 2, 4, 8].map((zoom) => fiveColumnCase(`WZ1 zoom ${zoom}`, zoom)),
  fiveColumnCase('WZ1 −6 dB × 2', 10 ** (-6 / 20) * 2),
  fiveColumnCase('WZ1 −60 dB × 8', 10 ** (-60 / 20) * 8),
  ...[0, -6, 3, -60, 24].map((db) => fiveColumnCase(`WG1 ${db} dB`, 10 ** (db / 20))),
  ...[Number.NaN, Number.POSITIVE_INFINITY, -1].map((scale) =>
    fiveColumnCase(`WG1 fallback ${scale}`, scale),
  ),
  {
    label: 'WG2 realistic',
    peaks: realisticPeaks(),
    sourceOffset: 0.5,
    duration: 2,
    columns: 120,
    scale: 1,
  },
];

function referenceEdgesOf(shapeCase: PeakShapeCase): PeakColumnEdges[] {
  const { peaks, sourceOffset, duration, columns, scale } = shapeCase;
  const from = Math.floor(sourceOffset * PEAK_BUCKETS_PER_SECOND);
  const to = Math.min(peaks.length, Math.ceil((sourceOffset + duration) * PEAK_BUCKETS_PER_SECOND));
  const count = Math.max(1, Math.min(to - from, Math.round(columns)));
  const perColumn = (to - from) / count;
  const s = Number.isFinite(scale) && scale >= 0 ? scale : 1;
  const edges: PeakColumnEdges[] = [];
  for (let column = 0; column < count; column++) {
    const start = from + Math.floor(column * perColumn);
    const end = Math.max(start + 1, from + Math.floor((column + 1) * perColumn));
    const max = Math.max(0, ...peaks.slice(start, Math.min(end, to)));
    const height = Math.max(0.02, Math.min(1, max * s));
    edges.push([(1 - height).toFixed(3), (1 + height).toFixed(3)]);
  }
  return edges;
}

function columnsOf(path: string): PeakColumnEdges[] {
  const edges = [...path.matchAll(/V(\d+\.\d{3})H\d+/g)].map((match) => match[1]);
  const count = edges.length / 2;
  return edges.slice(0, count).map((top, column) => [top, edges[edges.length - 1 - column]]);
}

function shapeOf(shapeCase: PeakShapeCase) {
  const { peaks, sourceOffset, duration, columns, scale } = shapeCase;
  return buildPeakShape(peaks, sourceOffset, duration, columns, scale);
}

describe('buildPeakShape outline path (D-29z197, PERF-FADER-c)', () => {
  it('PO1: for the WZ1, WG1 and WG2 fixtures the outline encodes the per-column top and bottom of the documented height formula', () => {
    for (const shapeCase of OUTLINE_CASES) {
      const shape = shapeOf(shapeCase);
      const reference = referenceEdgesOf(shapeCase);
      expect(shape?.columns, shapeCase.label).toBe(reference.length);
      expect(columnsOf(shape?.path ?? ''), shapeCase.label).toEqual(reference);
    }
  });

  it('PO2: the path is one closed outline: one M, one Z and 2 × columns V/H pairs, starting at M0 1 and ending at H0Z', () => {
    for (const shapeCase of OUTLINE_CASES) {
      const shape = shapeOf(shapeCase);
      const path = shape?.path ?? '';
      const columns = shape?.columns ?? 0;
      expect(path.match(/M/g)?.length, shapeCase.label).toBe(1);
      expect(path.match(/Z/g)?.length, shapeCase.label).toBe(1);
      expect(path.startsWith('M0 1V'), shapeCase.label).toBe(true);
      expect(path.endsWith('H0Z'), shapeCase.label).toBe(true);
      expect(path.match(/h/g), shapeCase.label).toBeNull();
      const pairs = [...path.matchAll(/V(\d+\.\d{3})H(\d+)/g)];
      expect(pairs.length, shapeCase.label).toBe(2 * columns);
      expect(pairs.map((pair) => pair[0]).join(''), shapeCase.label).toBe(path.slice(4, -1));
      const xs = pairs.map((pair) => Number(pair[2]));
      const forward = Array.from({ length: columns }, (_, column) => column + 1);
      const backward = Array.from({ length: columns }, (_, column) => columns - 1 - column);
      expect(xs, shapeCase.label).toEqual([...forward, ...backward]);
    }
  });

  it('PO3: a silent column draws the 0.980/1.020 floor and a clipping column draws 0.000/2.000', () => {
    const shape = buildPeakShape(new Float32Array([0, 1, 0.5]), 0, 0.03, 3, 4);
    expect(shape?.path).toBe('M0 1V0.980H1V0.000H2V0.000H3V2.000H2V2.000H1V1.020H0Z');
    expect(columnsOf(shape?.path ?? '')).toEqual([
      ['0.980', '1.020'],
      ['0.000', '2.000'],
      ['0.000', '2.000'],
    ]);
  });

  it('PO4: one column gives M0 1V{top}H1V{bottom}H0Z', () => {
    expect(buildPeakShape(new Float32Array([0.25]), 0, 0.01, 1, 1)).toEqual({
      columns: 1,
      path: 'M0 1V0.750H1V1.250H0Z',
    });
    expect(buildPeakShape(FIVE_COLUMN_PEAKS, 0, 0.05, 1, 1)).toEqual({
      columns: 1,
      path: 'M0 1V0.000H1V2.000H0Z',
    });
  });

  it('PO5: missing peaks, empty peaks, columns ≤ 0 and an empty span still give null', () => {
    expect(buildPeakShape(undefined, 0, 1, 10, 1)).toBeNull();
    expect(buildPeakShape(new Float32Array(0), 0, 1, 10, 1)).toBeNull();
    expect(buildPeakShape(FIVE_COLUMN_PEAKS, 0, 0.05, 0, 1)).toBeNull();
    expect(buildPeakShape(FIVE_COLUMN_PEAKS, 0, 0.05, -3, 1)).toBeNull();
    expect(buildPeakShape(FIVE_COLUMN_PEAKS, 0.05, 0.02, 5, 1)).toBeNull();
    expect(buildPeakShape(FIVE_COLUMN_PEAKS, 0, 0, 5, 1)).toBeNull();
  });
});

describe('waveformPeakColumns zoom bands (PERF-3a)', () => {
  it('ZQ2: the column count depends on the clip length and the zoom band only', () => {
    const cases: readonly (readonly [duration: number, pxPerSecond: number, columns: number])[] = [
      [12, 40, 1200],
      [12, 50, 1200],
      [12, 80, 1200],
      [12, 25.1, 1200],
      [12, 25, 300],
      [12, 20, 300],
      [12, 6.3, 300],
      [12, 6.25, 75],
      [12, 6.2, 75],
      [12, 1.5625, 19],
      [12, 0.5, 19],
      [101.352, 40, 4096],
      [101.352, 20, 2534],
      [101.352, 320, 4096],
      [0.006, 100, 1],
      [0.004, 100, 0],
      [Number.NaN, 40, 0],
      [12, 0, 0],
    ];
    for (const [duration, pxPerSecond, columns] of cases) {
      expect(
        waveformPeakColumns(duration, pxPerSecond),
        `${duration} s at ${pxPerSecond} px/s`,
      ).toBe(columns);
    }
  });

  it('ZQ2b: at least one column per pixel up to the cap and the bucket count, fewer than four per pixel', () => {
    for (let pxPerSecond = 0.5; pxPerSecond <= 320; pxPerSecond *= 1.25) {
      for (const duration of [0.5, 2, 12, 101.352]) {
        const columns = waveformPeakColumns(duration, pxPerSecond);
        const width = duration * pxPerSecond;
        const label = `${duration} s at ${pxPerSecond} px/s`;
        expect(columns, label).toBeGreaterThanOrEqual(
          Math.min(
            PEAK_SHAPE_MAX_COLUMNS,
            Math.round(width),
            Math.ceil(duration * PEAK_BUCKETS_PER_SECOND),
          ),
        );
        expect(columns, label).toBeLessThanOrEqual(Math.ceil(4 * width) + 1);
      }
    }
  });
});
