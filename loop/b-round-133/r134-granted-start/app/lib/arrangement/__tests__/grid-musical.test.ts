import { describe, expect, it } from 'vitest';
import { adjacentGridLine, formatGridDivision, snapGroupDelta, snapTimeToGrid } from '../grid';
import {
  adjacentGridDivisionId,
  gridDivisionEndMessage,
  gridDivisionLabel,
  gridDivisionOptions,
  gridDivisionStatusMessage,
  gridDivisionTitle,
  gridMusicalGroupLabel,
  gridTempoClearedMessage,
  isMusicalGridDivisionId,
  MUSICAL_GRID_DIVISIONS,
  musicalGridDivisionSeconds,
} from '../grid-divisions';
import { MIN_LOOP_LENGTH, moveLoop } from '../loop';
import { createArrangement } from '../model';

const STEP_90_QUARTER = 60 / 90;

function storedLine(index: number, step: number): number {
  return Math.max(0, Math.round(index * step * 1000)) / 1000;
}

function roundMs(value: number): number {
  return Math.round(value * 1000) / 1000 || 0;
}

function loopArrangement(start: number, end: number) {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  return { ...base, loop: { start, end, enabled: true } };
}

const SECONDS_OPTIONS = [10, 5, 2, 1, 0.5, 0.25, 0.1].map((step) => ({
  id: String(step),
  label: formatGridDivision(step),
  family: 'seconds',
}));

const MUSICAL_OPTIONS = [
  { id: 'bar', label: '1 ტაქტი', family: 'musical' },
  { id: '1/2', label: '1/2', family: 'musical' },
  { id: '1/4', label: '1/4', family: 'musical' },
  { id: '1/8', label: '1/8', family: 'musical' },
  { id: '1/16', label: '1/16', family: 'musical' },
  { id: '1/32', label: '1/32', family: 'musical' },
];

const ALL_DIVISION_IDS = [...SECONDS_OPTIONS, ...MUSICAL_OPTIONS].map((option) => option.id);

describe('SRW-14 stage 5a musical grid divisions (D-29z32)', () => {
  it('GM1 lists the musical divisions widest first with their beats', () => {
    expect(MUSICAL_GRID_DIVISIONS.map(({ id, label, beats }) => ({ id, label, beats }))).toEqual([
      { id: 'bar', label: '1 ტაქტი', beats: 4 },
      { id: '1/2', label: '1/2', beats: 2 },
      { id: '1/4', label: '1/4', beats: 1 },
      { id: '1/8', label: '1/8', beats: 0.5 },
      { id: '1/16', label: '1/16', beats: 0.25 },
      { id: '1/32', label: '1/32', beats: 0.125 },
    ]);
  });

  it('GM2 derives the step in seconds from the BPM', () => {
    expect(
      MUSICAL_GRID_DIVISIONS.map((division) => musicalGridDivisionSeconds(division.id, 120)),
    ).toEqual([2, 1, 0.5, 0.25, 0.125, 0.0625]);
    for (const division of MUSICAL_GRID_DIVISIONS) {
      expect(musicalGridDivisionSeconds(division.id, 90)).toBe((division.beats * 60) / 90);
    }
    expect(musicalGridDivisionSeconds('1/4', 92.5)).toBe((1 * 60) / 92.5);
    expect(musicalGridDivisionSeconds('bar', 120)).toBe(2);
    expect(musicalGridDivisionSeconds('1/32', 120)).toBe(0.0625);
  });

  it('GM3 offers the musical divisions only with a BPM, after the seconds ones', () => {
    expect(gridDivisionOptions(null)).toEqual(SECONDS_OPTIONS);
    const withTempo = gridDivisionOptions(120);
    expect(withTempo).toHaveLength(13);
    expect(withTempo).toEqual([...SECONDS_OPTIONS, ...MUSICAL_OPTIONS]);
  });

  it('GM4 narrows and widens within the family only', () => {
    expect(adjacentGridDivisionId('1/4', 'narrow')).toBe('1/8');
    expect(adjacentGridDivisionId('1/32', 'narrow')).toBeNull();
    expect(adjacentGridDivisionId('bar', 'widen')).toBeNull();
    expect(adjacentGridDivisionId('bar', 'narrow')).toBe('1/2');
    expect(adjacentGridDivisionId('1', 'narrow')).toBe('0.5');
    expect(adjacentGridDivisionId('0.1', 'narrow')).toBeNull();
    expect(adjacentGridDivisionId('10', 'widen')).toBeNull();
    const crossings: string[] = [];
    for (const id of ALL_DIVISION_IDS) {
      for (const direction of ['narrow', 'widen'] as const) {
        const next = adjacentGridDivisionId(id, direction);
        if (next !== null && isMusicalGridDivisionId(next) !== isMusicalGridDivisionId(id)) {
          crossings.push(`${id} ${direction} -> ${next}`);
        }
      }
    }
    expect(crossings).toEqual([]);
  });

  it('GM5 writes the status, end, tempo-cleared, group and title strings', () => {
    expect(gridDivisionStatusMessage('0.5', null, true)).toBe('ბადე: 0.5 წმ (Snap ჩართულია)');
    expect(gridDivisionStatusMessage('1/4', 90, true)).toBe(
      'ბადე: 1/4 · 0.667 წმ 90 BPM-ზე (Snap ჩართულია)',
    );
    expect(gridDivisionStatusMessage('1/4', 120, false)).toBe(
      'ბადე: 1/4 · 0.5 წმ 120 BPM-ზე (Snap გამორთულია)',
    );
    expect(gridDivisionEndMessage('0.1', 'narrow')).toBe('ბადე უკვე ყველაზე მჭიდროა — 0.1 წმ (1)');
    expect(gridDivisionEndMessage('10', 'widen')).toBe('ბადე უკვე ყველაზე ფართოა — 10 წმ (2)');
    expect(gridDivisionEndMessage('1/32', 'narrow')).toBe('ბადე უკვე ყველაზე მჭიდროა — 1/32 (1)');
    expect(gridDivisionEndMessage('bar', 'widen')).toBe('ბადე უკვე ყველაზე ფართოა — 1 ტაქტი (2)');
    expect(gridTempoClearedMessage(0.5)).toBe(
      'Tempo cleared — the bars ruler is hidden. Audio is unchanged. ბადე დაბრუნდა წამებზე: 0.5 წმ.',
    );
    expect(gridMusicalGroupLabel(92.5)).toBe('ტაქტები · 92.5 BPM');
    expect(gridDivisionLabel('bar')).toBe('1 ტაქტი');
    expect(gridDivisionLabel('0.25')).toBe('0.25 წმ');
    expect(gridDivisionTitle('1/4', true)).toBe('ბადე 1/4 · 1 — უფრო მჭიდრო, 2 — უფრო ფართო');
    expect(gridDivisionTitle('1/4', false)).toBe(
      'ბადე 1/4 — ამ მასშტაბზე ხაზები დამალულია; Snap მაინც მუშაობს. გაადიდე Zoom. · 1 — უფრო მჭიდრო, 2 — უფრო ფართო',
    );
    expect(gridDivisionTitle('1', true)).toBe('ბადე 1 წმ · 1 — უფრო მჭიდრო, 2 — უფრო ფართო');
    expect(gridDivisionTitle('1', false)).toBe(
      'ბადე 1 წმ — ამ მასშტაბზე ხაზები დამალულია; Snap მაინც მუშაობს. გაადიდე Zoom. · 1 — უფრო მჭიდრო, 2 — უფრო ფართო',
    );
  });

  it('GM6 snapTimeToGrid puts musical lines from the index on whole milliseconds', () => {
    expect(snapTimeToGrid(0.9, STEP_90_QUARTER)).toBe(0.667);
    expect(snapTimeToGrid(6, STEP_90_QUARTER)).toBe(6);
    expect(snapTimeToGrid(100, STEP_90_QUARTER)).toBe(100);
    expect(snapTimeToGrid(0.3334, STEP_90_QUARTER)).toBe(0.667);
    expect(snapTimeToGrid(-1, STEP_90_QUARTER)).toBe(0);
    expect(snapTimeToGrid(0.19, 0.0625)).toBe(0.188);
    expect(snapTimeToGrid(0.15, 0.1)).toBe(0.2);
    expect(snapTimeToGrid(1.26, 0.25)).toBe(1.25);
  });

  it('GM7 adjacentGridLine never sticks on a stored musical line', () => {
    expect(adjacentGridLine(0.667, STEP_90_QUARTER, -1)).toBe(0);
    expect(adjacentGridLine(0.667, STEP_90_QUARTER, 1)).toBe(1.333);
    expect(adjacentGridLine(1.333, STEP_90_QUARTER, 1)).toBe(2);
    expect(adjacentGridLine(1.333, STEP_90_QUARTER, -1)).toBe(0.667);
    expect(adjacentGridLine(0, STEP_90_QUARTER, -1)).toBeNull();
    expect(adjacentGridLine(0.3, STEP_90_QUARTER, 1)).toBe(0.667);
    expect(adjacentGridLine(100, STEP_90_QUARTER, 1)).toBe(100.667);
  });

  it('GM8 snapGroupDelta reaches the farthest musical line inside the bounds', () => {
    expect(snapGroupDelta(2, -1.8, STEP_90_QUARTER, -1.333, 5)).toBe(-1.333);
    expect(snapGroupDelta(0.667, 0.6, STEP_90_QUARTER, -0.667, 10)).toBe(0.666);
    expect(snapGroupDelta(0, 1.2, STEP_90_QUARTER, 0, 0.667)).toBe(0.667);
  });

  it('GM9 every musical line is stable, whole-ms and reachable by the neighbour lines', () => {
    const tempos = [20, 60, 90, 92.5, 120, 133.33, 999];
    const failures: string[] = [];
    for (const bpm of tempos) {
      for (const division of MUSICAL_GRID_DIVISIONS) {
        const step = musicalGridDivisionSeconds(division.id, bpm);
        const line = (k: number) => snapTimeToGrid(k * step, step);
        for (let k = 0; k * step < 600; k++) {
          const current = line(k);
          const next = line(k + 1);
          const tag = `${bpm} ${division.id} k=${k}`;
          if (Math.abs(current - k * step) > 0.0005 + 1e-9) {
            failures.push(`${tag} off ${current}`);
          }
          if (Math.abs(Math.round(current * 1000) - current * 1000) > 1e-6) {
            failures.push(`${tag} not whole ms ${current}`);
          }
          if (adjacentGridLine(current, step, 1) !== next) {
            failures.push(`${tag} +1 ${adjacentGridLine(current, step, 1)} != ${next}`);
          }
          if (adjacentGridLine(next, step, -1) !== current) {
            failures.push(`${tag} -1 ${adjacentGridLine(next, step, -1)} != ${current}`);
          }
          if (snapTimeToGrid(current + 0.0004, step) !== current) {
            failures.push(`${tag} +0.4ms ${snapTimeToGrid(current + 0.0004, step)}`);
          }
          if (k >= 1 && snapTimeToGrid(current - 0.0004, step) !== current) {
            failures.push(`${tag} -0.4ms ${snapTimeToGrid(current - 0.0004, step)}`);
          }
        }
      }
    }
    expect({ count: failures.length, first: failures.slice(0, 20) }).toEqual({
      count: 0,
      first: [],
    });
  });

  it('GM10 adjacentGridLine from an off-line time returns the nearest stored line beyond', () => {
    const q = STEP_90_QUARTER;
    expect(adjacentGridLine(0.187, 0.0625, 1)).toBe(0.188);
    expect(adjacentGridLine(0.187, 0.0625, -1)).toBe(0.125);
    expect(adjacentGridLine(0.188, 0.0625, 1)).toBe(0.25);
    expect(adjacentGridLine(0.188, 0.0625, -1)).toBe(0.125);
    expect(adjacentGridLine(0.189, 0.0625, -1)).toBe(0.188);
    expect(adjacentGridLine(0.126, 0.0625, -1)).toBe(0.125);
    expect(adjacentGridLine(1.332, q, 1)).toBe(1.333);
    expect(adjacentGridLine(1.334, q, -1)).toBe(1.333);
    expect(adjacentGridLine(0.001, q, -1)).toBe(0);
    expect(adjacentGridLine(0.3, 60 / 999, 1)).toBe(0.36);
    expect(adjacentGridLine(0.667, q, -1)).toBe(0);
    expect(adjacentGridLine(0.667, q, 1)).toBe(1.333);
    expect(adjacentGridLine(1.333, q, 1)).toBe(2);
    expect(adjacentGridLine(1.333, q, -1)).toBe(0.667);
    expect(adjacentGridLine(0, q, -1)).toBeNull();
    expect(adjacentGridLine(0.3, q, 1)).toBe(0.667);
    expect(adjacentGridLine(100, q, 1)).toBe(100.667);
    const failures: string[] = [];
    for (const bpm of [20, 60, 90, 92.5, 120, 133.33, 999]) {
      for (const division of MUSICAL_GRID_DIVISIONS) {
        const step = musicalGridDivisionSeconds(division.id, bpm);
        for (let ms = 0; ms <= 10_000; ms++) {
          const t = ms / 1000;
          const base = Math.floor(t / step);
          let forward: number | null = null;
          let backward: number | null = null;
          for (let m = Math.max(0, base - 3); m <= base + 4; m++) {
            const line = storedLine(m, step);
            if (forward === null && line > t + 1e-9) {
              forward = line;
            }
            if (line < t - 1e-9) {
              backward = line;
            }
          }
          const up = adjacentGridLine(t, step, 1);
          const down = adjacentGridLine(t, step, -1);
          if (up !== forward || down !== backward) {
            failures.push(
              `${bpm} ${division.id} t=${t} +1 ${up}/${forward} -1 ${down}/${backward}`,
            );
          }
        }
      }
    }
    expect({ count: failures.length, first: failures.slice(0, 20) }).toEqual({
      count: 0,
      first: [],
    });
  });

  it('GM11 snapGroupDelta clamps to the farthest stored line inside the bounds', () => {
    expect(snapGroupDelta(0, 0.1875, 0.0625, -10, 0.187)).toBe(0.125);
    expect(snapGroupDelta(0.1, -0.0697, 0.0625, -0.069, 10)).toBe(-0.037);
    expect(snapGroupDelta(2, -1.8, STEP_90_QUARTER, -1.333, 5)).toBe(-1.333);
    expect(snapGroupDelta(0.667, 0.6, STEP_90_QUARTER, -0.667, 10)).toBe(0.666);
    expect(snapGroupDelta(0, 1.2, STEP_90_QUARTER, 0, 0.667)).toBe(0.667);
    const failures: string[] = [];
    let clamped = 0;
    for (const bpm of [60, 90, 120, 133.33]) {
      for (const beats of [1, 0.5, 0.125]) {
        const step = (beats * 60) / bpm;
        for (let anchorMs = 0; anchorMs <= 4000; anchorMs += 37) {
          const a = anchorMs / 1000;
          for (let highMs = 1; highMs <= 3000; highMs += 53) {
            const high = highMs / 1000;
            const raw = high + 0.0007;
            const snapped = roundMs(snapTimeToGrid(a + raw, step) - a);
            if (snapped >= -a - 1e-6 && snapped <= high + 1e-6) {
              continue;
            }
            clamped++;
            let expected = 0;
            for (let m = 0; storedLine(m, step) <= a + high + 1; m++) {
              const d = roundMs(storedLine(m, step) - a);
              if (d >= 0 && d <= high + 1e-9 && d > expected) {
                expected = d;
              }
            }
            const actual = snapGroupDelta(a, raw, step, -a, high);
            if (actual !== expected) {
              failures.push(`${bpm} ${beats} a=${a} high=${high} ${actual} != ${expected}`);
            }
          }
        }
      }
    }
    expect(clamped).toBeGreaterThan(0);
    expect({ count: failures.length, first: failures.slice(0, 20) }).toEqual({
      count: 0,
      first: [],
    });
  });

  it('GM12 moveLoop keeps a grid loop length in lines of the step', () => {
    const q = STEP_90_QUARTER;
    expect(moveLoop(loopArrangement(1.333, 2.667), 2, q).loop).toEqual({
      start: 2,
      end: 3.333,
      enabled: true,
    });
    expect(moveLoop(loopArrangement(1.333, 2.667), 2.667, q).loop).toEqual({
      start: 2.667,
      end: 4,
      enabled: true,
    });
    expect(moveLoop(loopArrangement(1.333, 2.667), 4.667, q).loop).toEqual({
      start: 4.667,
      end: 6,
      enabled: true,
    });
    expect(moveLoop(loopArrangement(1.3, 2.667), 2, q).loop).toEqual({
      start: 2,
      end: 3.367,
      enabled: true,
    });
    expect(moveLoop(loopArrangement(1.333, 2.7), 2, q).loop).toEqual({
      start: 2,
      end: 3.367,
      enabled: true,
    });
    expect(moveLoop(loopArrangement(1.333, 2.667), -1, q).loop).toEqual({
      start: 0,
      end: 1.333,
      enabled: true,
    });
    expect(moveLoop(loopArrangement(1, 3), 2.5, 0.5).loop).toEqual({
      start: 2.5,
      end: 4.5,
      enabled: true,
    });
    expect(moveLoop(loopArrangement(1.333, 2.667), 2).loop).toEqual({
      start: 2,
      end: 3.334,
      enabled: true,
    });
    expect(moveLoop(loopArrangement(0, 0.063), 0.063, 0.0625).loop).toEqual({
      start: 0.063,
      end: 0.126,
      enabled: true,
    });
    const failures: string[] = [];
    let checks = 0;
    for (const step of [60 / 90, 0.0625, 60 / 92.5]) {
      for (let k = 0; k <= 200; k++) {
        for (const w of [1, 2, 3, 5]) {
          if (w * step < MIN_LOOP_LENGTH) {
            continue;
          }
          for (const d of [-3, -1, 1, 2, 7]) {
            if (k + d < 0) {
              continue;
            }
            checks++;
            const moved = moveLoop(
              loopArrangement(storedLine(k, step), storedLine(k + w, step)),
              storedLine(k + d, step),
              step,
            ).loop;
            if (moved?.end !== storedLine(k + w + d, step)) {
              failures.push(`${step} k=${k} w=${w} d=${d} end ${moved?.end}`);
            }
          }
        }
      }
    }
    expect(checks).toBeGreaterThan(0);
    expect({ count: failures.length, first: failures.slice(0, 20) }).toEqual({
      count: 0,
      first: [],
    });
  });
});
