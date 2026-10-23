import { formatGridDivision, GRID_DIVISIONS_SECONDS } from './grid';
import { formatTempoBpm, tempoStatusMessage } from './tempo';

export const MUSICAL_GRID_DIVISIONS = [
  { id: 'bar', label: '1 ტაქტი', beats: 4 },
  { id: '1/2', label: '1/2', beats: 2 },
  { id: '1/4', label: '1/4', beats: 1 },
  { id: '1/8', label: '1/8', beats: 0.5 },
  { id: '1/16', label: '1/16', beats: 0.25 },
  { id: '1/32', label: '1/32', beats: 0.125 },
] as const;

export const MUSICAL_TRIPLET_GRID_DIVISIONS = [
  { id: '1/2T', label: '1/2T', beats: 4 / 3, straight: '1/2' },
  { id: '1/4T', label: '1/4T', beats: 2 / 3, straight: '1/4' },
  { id: '1/8T', label: '1/8T', beats: 1 / 3, straight: '1/8' },
  { id: '1/16T', label: '1/16T', beats: 1 / 6, straight: '1/16' },
  { id: '1/32T', label: '1/32T', beats: 1 / 12, straight: '1/32' },
] as const;

export type MusicalGridDivisionId =
  | (typeof MUSICAL_GRID_DIVISIONS)[number]['id']
  | (typeof MUSICAL_TRIPLET_GRID_DIVISIONS)[number]['id'];

export const GRID_TRIPLET_MENU_LABEL = 'ტრიოლები (3)';

export interface GridDivisionOption {
  id: string;
  label: string;
  family: 'seconds' | 'musical';
}

const SECONDS_GRID_DIVISION_IDS: readonly string[] = GRID_DIVISIONS_SECONDS.map((step) =>
  String(step),
);

const MUSICAL_GRID_DIVISION_IDS: readonly string[] = MUSICAL_GRID_DIVISIONS.map(
  (division) => division.id,
);

const MUSICAL_TRIPLET_GRID_DIVISION_IDS: readonly string[] = MUSICAL_TRIPLET_GRID_DIVISIONS.map(
  (division) => division.id,
);

function findMusicalGridDivision(id: string) {
  for (const division of MUSICAL_GRID_DIVISIONS) {
    if (division.id === id) {
      return division;
    }
  }
  return findTripletGridDivision(id);
}

function findTripletGridDivision(id: string) {
  for (const division of MUSICAL_TRIPLET_GRID_DIVISIONS) {
    if (division.id === id) {
      return division;
    }
  }
  return null;
}

export function isMusicalGridDivisionId(value: string): value is MusicalGridDivisionId {
  return findMusicalGridDivision(value) !== null;
}

export function isTripletGridDivisionId(value: string): boolean {
  return findTripletGridDivision(value) !== null;
}

export function toggledTripletGridDivisionId(id: string): string | null {
  for (const division of MUSICAL_TRIPLET_GRID_DIVISIONS) {
    if (division.id === id) {
      return division.straight;
    }
    if (division.straight === id) {
      return division.id;
    }
  }
  return null;
}

export function musicalGridDivisionSeconds(id: MusicalGridDivisionId, bpm: number): number {
  const beats = findMusicalGridDivision(id)?.beats ?? Number.NaN;
  return (beats * 60) / bpm;
}

export function gridDivisionOptions(bpm: number | null, triplet = false): GridDivisionOption[] {
  const seconds: GridDivisionOption[] = GRID_DIVISIONS_SECONDS.map((step) => ({
    id: String(step),
    label: formatGridDivision(step),
    family: 'seconds',
  }));
  if (bpm === null) {
    return seconds;
  }
  return [
    ...seconds,
    ...(triplet ? MUSICAL_TRIPLET_GRID_DIVISIONS : MUSICAL_GRID_DIVISIONS).map(
      (division): GridDivisionOption => ({
        id: division.id,
        label: division.label,
        family: 'musical',
      }),
    ),
  ];
}

export function gridDivisionLabel(id: string): string {
  return findMusicalGridDivision(id)?.label ?? formatGridDivision(Number(id));
}

function gridDivisionFamilyIds(id: string): readonly string[] {
  if (isTripletGridDivisionId(id)) {
    return MUSICAL_TRIPLET_GRID_DIVISION_IDS;
  }
  return isMusicalGridDivisionId(id) ? MUSICAL_GRID_DIVISION_IDS : SECONDS_GRID_DIVISION_IDS;
}

export function adjacentGridDivisionId(id: string, direction: 'narrow' | 'widen'): string | null {
  const family = gridDivisionFamilyIds(id);
  const index = family.indexOf(id);
  if (index < 0) {
    return null;
  }
  return family[direction === 'narrow' ? index + 1 : index - 1] ?? null;
}

export function gridDivisionEndMessage(id: string, direction: 'narrow' | 'widen'): string {
  const family = gridDivisionFamilyIds(id);
  if (direction === 'narrow') {
    return `ბადე უკვე ყველაზე მჭიდროა — ${gridDivisionLabel(family.at(-1) ?? id)} (1)`;
  }
  return `ბადე უკვე ყველაზე ფართოა — ${gridDivisionLabel(family[0] ?? id)} (2)`;
}

export function gridDivisionStatusMessage(
  id: string,
  bpm: number | null,
  snapEnabled: boolean,
): string {
  const snap = `(Snap ${snapEnabled ? 'ჩართულია' : 'გამორთულია'})`;
  if (!isMusicalGridDivisionId(id) || bpm === null) {
    return `ბადე: ${gridDivisionLabel(id)} ${snap}`;
  }
  const step = musicalGridDivisionSeconds(id, bpm);
  return `ბადე: ${gridDivisionLabel(id)} · ${String(Math.round(step * 1000) / 1000)} წმ ${formatTempoBpm(bpm)} BPM-ზე ${snap}`;
}

export function gridTempoClearedMessage(secondsStep: number): string {
  return `${tempoStatusMessage(null)} ბადე დაბრუნდა წამებზე: ${formatGridDivision(secondsStep)}.`;
}

export function gridMusicalGroupLabel(bpm: number): string {
  return `ტაქტები · ${formatTempoBpm(bpm)} BPM`;
}

export function gridTripletGroupLabel(bpm: number): string {
  return `ტრიოლები · ${formatTempoBpm(bpm)} BPM`;
}

export function gridTripletRefusalMessage(id: string, bpm: number | null): string {
  if (bpm === null) {
    return 'ტრიოლები მხოლოდ ტემპით — ჯერ ჩაწერე BPM (3)';
  }
  if (id === 'bar') {
    return '1 ტაქტს ტრიოლი არ აქვს — აირჩიე 1/2 ან უფრო მჭიდრო (3)';
  }
  return 'ტრიოლები მხოლოდ ტაქტების ბადეზე — აირჩიე 1/2 … 1/32 (3)';
}

export function gridDivisionTitle(id: string, linesVisible: boolean): string {
  const label = gridDivisionLabel(id);
  return linesVisible
    ? `ბადე ${label} · 1 — უფრო მჭიდრო, 2 — უფრო ფართო`
    : `ბადე ${label} — ამ მასშტაბზე ხაზები დამალულია; Snap მაინც მუშაობს. გაადიდე Zoom. · 1 — უფრო მჭიდრო, 2 — უფრო ფართო`;
}
