import { describe, expect, it } from 'vitest';
import { adjacentGridLine, formatGridDivision, snapTimeToGrid } from '../grid';
import {
  adjacentGridDivisionId,
  GRID_TRIPLET_MENU_LABEL,
  gridDivisionEndMessage,
  gridDivisionLabel,
  gridDivisionOptions,
  gridDivisionStatusMessage,
  gridDivisionTitle,
  gridTripletGroupLabel,
  gridTripletRefusalMessage,
  isMusicalGridDivisionId,
  isTripletGridDivisionId,
  MUSICAL_GRID_DIVISIONS,
  MUSICAL_TRIPLET_GRID_DIVISIONS,
  musicalGridDivisionSeconds,
  toggledTripletGridDivisionId,
} from '../grid-divisions';
import { moveLoop } from '../loop';
import { createArrangement } from '../model';

const STEP_90_QUARTER_TRIPLET = ((2 / 3) * 60) / 90;
const STEP_120_EIGHTH_TRIPLET = ((1 / 3) * 60) / 120;
const SWEEP_BPMS = [20, 60, 90, 92.5, 100, 120, 133.33, 999];

const TRIPLET_TABLE = [
  { id: '1/2T', label: '1/2T', beats: 4 / 3, straight: '1/2' },
  { id: '1/4T', label: '1/4T', beats: 2 / 3, straight: '1/4' },
  { id: '1/8T', label: '1/8T', beats: 1 / 3, straight: '1/8' },
  { id: '1/16T', label: '1/16T', beats: 1 / 6, straight: '1/16' },
  { id: '1/32T', label: '1/32T', beats: 1 / 12, straight: '1/32' },
];

const SECONDS_OPTIONS = [10, 5, 2, 1, 0.5, 0.25, 0.1].map((step) => ({
  id: String(step),
  label: formatGridDivision(step),
  family: 'seconds',
}));

const STRAIGHT_OPTIONS = ['bar', '1/2', '1/4', '1/8', '1/16', '1/32'].map((id) => ({
  id,
  label: id === 'bar' ? '1 ტაქტი' : id,
  family: 'musical',
}));

const TRIPLET_OPTIONS = TRIPLET_TABLE.map(({ id, label }) => ({ id, label, family: 'musical' }));

const SECONDS_IDS = SECONDS_OPTIONS.map((option) => option.id);
const STRAIGHT_IDS = STRAIGHT_OPTIONS.map((option) => option.id);
const TRIPLET_IDS = TRIPLET_TABLE.map((division) => division.id);
const ALL_IDS = [...SECONDS_IDS, ...STRAIGHT_IDS, ...TRIPLET_IDS];

const NO_TEMPO_REFUSAL = 'ტრიოლები მხოლოდ ტემპით — ჯერ ჩაწერე BPM (3)';
const BAR_REFUSAL = '1 ტაქტს ტრიოლი არ აქვს — აირჩიე 1/2 ან უფრო მჭიდრო (3)';
const SECONDS_REFUSAL = 'ტრიოლები მხოლოდ ტაქტების ბადეზე — აირჩიე 1/2 … 1/32 (3)';

function storedLine(index: number, step: number): number {
  return Math.max(0, Math.round(index * step * 1000)) / 1000;
}

function straightStepSeconds(id: string, bpm: number): number {
  const division = MUSICAL_GRID_DIVISIONS.find((entry) => entry.id === id);
  if (!division) {
    throw new Error(`straight division ${id} missing`);
  }
  return musicalGridDivisionSeconds(division.id, bpm);
}

function divisionFamily(id: string): 'seconds' | 'straight' | 'triplet' {
  if (isTripletGridDivisionId(id)) {
    return 'triplet';
  }
  return isMusicalGridDivisionId(id) ? 'straight' : 'seconds';
}

function loopArrangement(start: number, end: number) {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  return { ...base, loop: { start, end, enabled: true } };
}

describe('SRW-14 stage 5b triplet grid divisions (D-29z34)', () => {
  it('TR1 lists the triplet divisions widest first and keeps the straight table', () => {
    expect(
      MUSICAL_TRIPLET_GRID_DIVISIONS.map(({ id, label, beats, straight }) => ({
        id,
        label,
        beats,
        straight,
      })),
    ).toEqual(TRIPLET_TABLE);
    expect(MUSICAL_GRID_DIVISIONS).toHaveLength(6);
    expect(MUSICAL_GRID_DIVISIONS.filter((division) => division.id.endsWith('T'))).toEqual([]);
  });

  it('TR2 derives each triplet step as two thirds of its straight step', () => {
    expect(musicalGridDivisionSeconds('1/4T', 90)).toBeCloseTo(((2 / 3) * 60) / 90, 12);
    expect(musicalGridDivisionSeconds('1/4T', 90)).toBeCloseTo(0.4444444444, 9);
    expect(musicalGridDivisionSeconds('1/8T', 120)).toBeCloseTo(0.1666666667, 9);
    expect(musicalGridDivisionSeconds('1/2T', 60)).toBeCloseTo(1.3333333333, 9);
    expect(MUSICAL_TRIPLET_GRID_DIVISIONS).toHaveLength(TRIPLET_TABLE.length);
    for (const bpm of SWEEP_BPMS) {
      MUSICAL_TRIPLET_GRID_DIVISIONS.forEach((division, index) => {
        const expected = TRIPLET_TABLE[index];
        const triplet = musicalGridDivisionSeconds(division.id, bpm);
        expect(triplet).toBe((expected.beats * 60) / bpm);
        expect(triplet).toBeCloseTo((straightStepSeconds(expected.straight, bpm) * 2) / 3, 12);
      });
    }
  });

  it('TR3 offers the triplet family only when asked and only with a BPM', () => {
    expect(gridDivisionOptions(120, true)).toEqual([...SECONDS_OPTIONS, ...TRIPLET_OPTIONS]);
    expect(gridDivisionOptions(null, true)).toEqual(SECONDS_OPTIONS);
    expect(gridDivisionOptions(120)).toEqual([...SECONDS_OPTIONS, ...STRAIGHT_OPTIONS]);
    expect(gridDivisionOptions(120, false)).toEqual([...SECONDS_OPTIONS, ...STRAIGHT_OPTIONS]);
    expect(gridDivisionOptions(120)).toHaveLength(13);
  });

  it('TR4 toggles each straight division to its triplet and back; bar and seconds refuse', () => {
    for (const division of TRIPLET_TABLE) {
      expect(toggledTripletGridDivisionId(division.straight)).toBe(division.id);
      expect(toggledTripletGridDivisionId(division.id)).toBe(division.straight);
    }
    for (const id of ['bar', ...SECONDS_IDS, 'unknown', '', '1/4t', '1/64T']) {
      expect(toggledTripletGridDivisionId(id)).toBeNull();
    }
    expect([...ALL_IDS, 'bar ', 'T', 'unknown'].filter(isTripletGridDivisionId)).toEqual(
      TRIPLET_IDS,
    );
  });

  it('TR5 narrows and widens inside the triplet family and never crosses families', () => {
    expect(adjacentGridDivisionId('1/4T', 'narrow')).toBe('1/8T');
    expect(adjacentGridDivisionId('1/4T', 'widen')).toBe('1/2T');
    expect(adjacentGridDivisionId('1/32T', 'narrow')).toBeNull();
    expect(adjacentGridDivisionId('1/2T', 'widen')).toBeNull();
    const crossings: string[] = [];
    for (const id of ALL_IDS) {
      for (const direction of ['narrow', 'widen'] as const) {
        const next = adjacentGridDivisionId(id, direction);
        if (next !== null && divisionFamily(next) !== divisionFamily(id)) {
          crossings.push(`${id} ${direction} -> ${next}`);
        }
      }
    }
    expect(crossings).toEqual([]);
    expect(gridDivisionEndMessage('1/32T', 'narrow')).toBe('ბადე უკვე ყველაზე მჭიდროა — 1/32T (1)');
    expect(gridDivisionEndMessage('1/2T', 'widen')).toBe('ბადე უკვე ყველაზე ფართოა — 1/2T (2)');
  });

  it('TR6 writes the triplet status, group, refusal, menu, label and title strings', () => {
    expect(gridDivisionStatusMessage('1/4T', 90, true)).toBe(
      'ბადე: 1/4T · 0.444 წმ 90 BPM-ზე (Snap ჩართულია)',
    );
    expect(gridDivisionStatusMessage('1/8T', 120, false)).toBe(
      'ბადე: 1/8T · 0.167 წმ 120 BPM-ზე (Snap გამორთულია)',
    );
    expect(gridTripletGroupLabel(92.5)).toBe('ტრიოლები · 92.5 BPM');
    expect(gridTripletRefusalMessage('1', null)).toBe(NO_TEMPO_REFUSAL);
    expect(gridTripletRefusalMessage('bar', 90)).toBe(BAR_REFUSAL);
    expect(gridTripletRefusalMessage('0.5', 90)).toBe(SECONDS_REFUSAL);
    expect(GRID_TRIPLET_MENU_LABEL).toBe('ტრიოლები (3)');
    expect(gridDivisionLabel('1/16T')).toBe('1/16T');
    expect(gridDivisionTitle('1/4T', true)).toBe('ბადე 1/4T · 1 — უფრო მჭიდრო, 2 — უფრო ფართო');
  });

  it('TR7 the frozen snap, line and loop rules land on stored triplet lines', () => {
    expect(
      [0.95, 1.7, 2.9, 1.2, 4.5].map((x) => snapTimeToGrid(x, STEP_90_QUARTER_TRIPLET)),
    ).toEqual([0.889, 1.778, 3.111, 1.333, 4.444]);
    const chain: (number | null)[] = [];
    let time: number | null = 1.333;
    for (const direction of [1, 1, -1, -1, -1] as const) {
      time = time === null ? null : adjacentGridLine(time, STEP_90_QUARTER_TRIPLET, direction);
      chain.push(time);
    }
    expect(chain).toEqual([1.778, 2.222, 1.778, 1.333, 0.889]);
    expect(adjacentGridLine(0.5, STEP_120_EIGHTH_TRIPLET, 1)).toBe(0.667);
    expect(adjacentGridLine(0.5, STEP_120_EIGHTH_TRIPLET, -1)).toBe(0.333);
    for (const [start, end] of [
      [1.778, 2.667],
      [2.667, 3.556],
      [4, 4.889],
      [1.333, 2.222],
    ]) {
      expect(moveLoop(loopArrangement(0.889, 1.778), start, STEP_90_QUARTER_TRIPLET).loop).toEqual({
        start,
        end,
        enabled: true,
      });
    }
    const failures: string[] = [];
    let count = 0;
    for (const bpm of SWEEP_BPMS) {
      for (const division of MUSICAL_TRIPLET_GRID_DIVISIONS) {
        const step = musicalGridDivisionSeconds(division.id, bpm);
        for (let ms = 0; ms <= 10_000; ms++) {
          const t = ms / 1000;
          count++;
          let forward: number | null = null;
          let backward: number | null = null;
          const base = Math.floor(t / step);
          for (let m = Math.max(0, base - 3); m <= base + 4; m++) {
            const line = storedLine(m, step);
            if (forward === null && line > t + 1e-9) {
              forward = line;
            }
            if (line < t - 1e-9) {
              backward = line;
            }
          }
          const gotForward = adjacentGridLine(t, step, 1);
          const gotBackward = adjacentGridLine(t, step, -1);
          if (gotForward !== forward || gotBackward !== backward) {
            failures.push(
              `${bpm} ${division.id} t=${t} ${gotForward}/${forward} ${gotBackward}/${backward}`,
            );
          }
        }
      }
    }
    expect(count).toBe(400_040);
    expect({ count: failures.length, first: failures.slice(0, 5) }).toEqual({
      count: 0,
      first: [],
    });
  });
});
