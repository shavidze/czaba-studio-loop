import { describe, expect, it } from 'vitest';
import { type BarsRulerMark, type BarsRulerWindow, barsRulerMarks } from '../tempo';

const VIEWPORT_PX = 1216;

function filteredMarks(
  marks: readonly BarsRulerMark[],
  pxPerSecond: number,
  rulerWindow: BarsRulerWindow,
): BarsRulerMark[] {
  return marks.filter(
    (mark) =>
      mark.time * pxPerSecond >= rulerWindow.fromPx && mark.time * pxPerSecond <= rulerWindow.toPx,
  );
}

function sameMarks(actual: readonly BarsRulerMark[], expected: readonly BarsRulerMark[]): boolean {
  return (
    actual.length === expected.length &&
    actual.every(
      (mark, index) =>
        Object.is(mark.time, expected[index].time) &&
        mark.kind === expected[index].kind &&
        mark.label === expected[index].label,
    )
  );
}

describe('SRW-15 viewport-windowed bars ruler marks (D-29z35)', () => {
  it('BW1 without a window the list is unchanged for the frozen inputs and the BD fixture', () => {
    const inputs: [number, number, number][] = [
      [10, 40, 90],
      [10, 40, 120],
      [60, 5, 120],
      [4, 160, 120],
      [133, 320, 999],
    ];
    for (const [seconds, pxPerSecond, bpm] of inputs) {
      expect(barsRulerMarks(seconds, pxPerSecond, bpm)).toEqual(
        barsRulerMarks(seconds, pxPerSecond, bpm, undefined),
      );
    }
    expect(barsRulerMarks(133, 320, 999)).toHaveLength(2215);
  });

  it('BW2 a window returns exactly the full list filtered to the window over the oracle sweep', () => {
    const bpms = [20, 60, 90, 92.5, 120, 133.33, 999];
    const zooms = [0.5, 5, 15, 40, 190.7, 320];
    const lengths = [10, 133, 600];
    const failures: string[] = [];
    let cases = 0;
    for (const bpm of bpms) {
      for (const pxPerSecond of zooms) {
        for (const seconds of lengths) {
          const full = barsRulerMarks(seconds, pxPerSecond, bpm);
          const width = seconds * pxPerSecond;
          const lastPage = Math.floor(width / VIEWPORT_PX);
          const windows: BarsRulerWindow[] = [
            { fromPx: -500, toPx: 700 },
            { fromPx: 0, toPx: VIEWPORT_PX },
            { fromPx: 3 * VIEWPORT_PX - VIEWPORT_PX, toPx: 3 * VIEWPORT_PX + 2 * VIEWPORT_PX },
            {
              fromPx: lastPage * VIEWPORT_PX - VIEWPORT_PX,
              toPx: lastPage * VIEWPORT_PX + 2 * VIEWPORT_PX,
            },
            { fromPx: width - 100, toPx: width + 5000 },
            { fromPx: width + 10, toPx: width + 20 },
          ];
          for (const rulerWindow of windows) {
            cases += 1;
            const windowed = barsRulerMarks(seconds, pxPerSecond, bpm, rulerWindow);
            if (!sameMarks(windowed, filteredMarks(full, pxPerSecond, rulerWindow))) {
              failures.push(
                `${bpm} BPM ${pxPerSecond} px/s ${seconds} s [${rulerWindow.fromPx}, ${rulerWindow.toPx}]`,
              );
            }
          }
        }
      }
    }
    expect(cases).toBe(756);
    expect({ count: failures.length, first: failures.slice(0, 5) }).toEqual({
      count: 0,
      first: [],
    });
  });

  it('BW3 marks exactly on the window edges are included; past the end is empty; a negative start begins at bar 1', () => {
    const full = barsRulerMarks(10, 40, 90);
    const barTwo = full.find((mark) => mark.kind === 'bar' && mark.label === '2');
    if (!barTwo) {
      throw new Error('bar 2 missing');
    }
    const barTwoPx = barTwo.time * 40;
    expect(barsRulerMarks(10, 40, 90, { fromPx: barTwoPx, toPx: barTwoPx })).toEqual([barTwo]);
    const endingAtBarTwo = barsRulerMarks(10, 40, 90, { fromPx: barTwoPx - 50, toPx: barTwoPx });
    expect(endingAtBarTwo.at(-1)).toEqual(barTwo);
    expect(endingAtBarTwo).toEqual(
      filteredMarks(full, 40, { fromPx: barTwoPx - 50, toPx: barTwoPx }),
    );
    const startingAtBarTwo = barsRulerMarks(10, 40, 90, { fromPx: barTwoPx, toPx: barTwoPx + 50 });
    expect(startingAtBarTwo[0]).toEqual(barTwo);
    expect(barsRulerMarks(10, 40, 90, { fromPx: 410, toPx: 420 })).toEqual([]);
    const fromNegative = barsRulerMarks(10, 40, 90, { fromPx: -1000, toPx: 200 });
    expect(fromNegative[0]).toEqual({ time: 0, kind: 'bar', label: '1' });
    expect(fromNegative).toEqual(filteredMarks(full, 40, { fromPx: -1000, toPx: 200 }));
  });

  it('BW4 thinned bars keep their multiples of the bar step counted from bar 1', () => {
    const full = barsRulerMarks(600, 5, 120);
    const barSevenPx = ((7 * 4 * 60) / 120) * 5;
    const rulerWindow = { fromPx: barSevenPx, toPx: barSevenPx + 200 };
    const windowed = barsRulerMarks(600, 5, 120, rulerWindow);
    expect(windowed[0]).toEqual({ time: 16, kind: 'bar', label: '9' });
    expect(windowed.map((mark) => mark.label)).toEqual(['9', '13', '17', '21', '25']);
    expect(windowed).toEqual(filteredMarks(full, 5, rulerWindow));
    expect(windowed.every((mark) => mark.kind === 'bar')).toBe(true);
  });

  it('BW5 a window on a 100-hour timeline costs only the marks inside it', () => {
    const rulerWindow = { fromPx: 1e8, toPx: 1e8 + 3648 };
    const started = performance.now();
    const marks = barsRulerMarks(360_000, 320, 999, rulerWindow);
    const elapsed = performance.now() - started;
    expect(marks.length).toBeGreaterThanOrEqual(180);
    expect(marks.length).toBeLessThanOrEqual(240);
    expect(
      marks.every(
        (mark) => mark.time * 320 >= rulerWindow.fromPx && mark.time * 320 <= rulerWindow.toPx,
      ),
    ).toBe(true);
    for (let index = 1; index < marks.length; index++) {
      expect(marks[index].time - marks[index - 1].time).toBeCloseTo(60 / 999, 9);
    }
    const firstBar = marks.findIndex((mark) => mark.kind === 'bar');
    expect(firstBar).toBeGreaterThanOrEqual(0);
    expect(firstBar).toBeLessThan(4);
    expect(
      marks.every((mark, index) =>
        (((index - firstBar) % 4) + 4) % 4 === 0 ? mark.kind === 'bar' : mark.kind === 'beat',
      ),
    ).toBe(true);
    expect(marks.filter((mark) => mark.kind === 'beat').every((mark) => mark.label === null)).toBe(
      true,
    );
    expect(elapsed).toBeLessThan(100);
  });

  it('BW6 an invalid window returns no marks', () => {
    expect(barsRulerMarks(133, 320, 999, { fromPx: Number.NaN, toPx: 100 })).toEqual([]);
    expect(barsRulerMarks(133, 320, 999, { fromPx: 0, toPx: Number.POSITIVE_INFINITY })).toEqual(
      [],
    );
    expect(barsRulerMarks(133, 320, 999, { fromPx: 500, toPx: 100 })).toEqual([]);
  });
});
