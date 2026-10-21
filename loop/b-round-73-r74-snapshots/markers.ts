import type { Arrangement, ArrangementMarker } from '~/types/arrangement';

export const MARKER_NAME_MAX_LENGTH = 64;
export const MARKER_DEFAULT_NAME_PREFIX = 'Marker';
export const MARKER_TIME_EPS = 0.0005;

const DEFAULT_MARKER_NAME_PATTERN = /^Marker (\d+)$/;
const NO_MARKERS: readonly ArrangementMarker[] = [];

export type AddMarkerResult =
  | { arrangement: Arrangement; marker: ArrangementMarker }
  | { arrangement: null; existing: ArrangementMarker };

export interface AdjacentMarkerTarget {
  time: number;
  marker: ArrangementMarker | null;
}

export function roundMarkerTime(time: number): number {
  return Math.max(0, Math.round(time * 1000) / 1000);
}

function sortMarkersByTime(markers: readonly ArrangementMarker[]): ArrangementMarker[] {
  return [...markers].sort((left, right) => left.time - right.time);
}

export function arrangementMarkers(arrangement: Arrangement): readonly ArrangementMarker[] {
  return arrangement.markers ?? NO_MARKERS;
}

export function replaceArrangementMarkers(
  arrangement: Arrangement,
  markers: readonly ArrangementMarker[],
): Arrangement {
  if (markers.length === 0) {
    const { markers: _removed, ...withoutMarkers } = arrangement;
    return withoutMarkers;
  }
  return { ...arrangement, markers: [...markers] };
}

export function nextDefaultMarkerName(arrangement: Arrangement): string {
  let largest = 0;
  for (const marker of arrangementMarkers(arrangement)) {
    const match = DEFAULT_MARKER_NAME_PATTERN.exec(marker.name);
    if (match) {
      largest = Math.max(largest, Number.parseInt(match[1], 10));
    }
  }
  return `${MARKER_DEFAULT_NAME_PREFIX} ${largest + 1}`;
}

export function normalizeMarkerName(raw: string, fallback: string): string {
  const name = Array.from(raw.trim()).slice(0, MARKER_NAME_MAX_LENGTH).join('').trimEnd();
  return name.length > 0 ? name : fallback;
}

export function markerAtTime(arrangement: Arrangement, time: number): ArrangementMarker | null {
  return (
    arrangementMarkers(arrangement).find(
      (marker) => Math.abs(marker.time - time) < MARKER_TIME_EPS,
    ) ?? null
  );
}

export function addMarker(arrangement: Arrangement, time: number, name: string): AddMarkerResult {
  const at = roundMarkerTime(time);
  const existing = markerAtTime(arrangement, at);
  if (existing) {
    return { arrangement: null, existing };
  }
  const marker: ArrangementMarker = {
    id: crypto.randomUUID(),
    time: at,
    name: normalizeMarkerName(name, nextDefaultMarkerName(arrangement)),
  };
  return {
    arrangement: replaceArrangementMarkers(
      arrangement,
      sortMarkersByTime([...arrangementMarkers(arrangement), marker]),
    ),
    marker,
  };
}

export function renameMarker(arrangement: Arrangement, id: string, name: string): Arrangement {
  const markers = arrangementMarkers(arrangement);
  const current = markers.find((marker) => marker.id === id);
  if (!current) {
    return arrangement;
  }
  const nextName = normalizeMarkerName(name, current.name);
  if (nextName === current.name) {
    return arrangement;
  }
  return replaceArrangementMarkers(
    arrangement,
    markers.map((marker) => (marker.id === id ? { ...marker, name: nextName } : marker)),
  );
}

export function deleteMarker(arrangement: Arrangement, id: string): Arrangement {
  const markers = arrangementMarkers(arrangement);
  const remaining = markers.filter((marker) => marker.id !== id);
  if (remaining.length === markers.length) {
    return arrangement;
  }
  return replaceArrangementMarkers(arrangement, remaining);
}

export function adjacentMarkerTarget(
  arrangement: Arrangement,
  position: number,
  direction: -1 | 1,
  end: number,
): AdjacentMarkerTarget | null {
  const markers = arrangementMarkers(arrangement);
  if (direction === 1) {
    const next = markers.find((marker) => marker.time > position + MARKER_TIME_EPS);
    if (next) {
      return { time: next.time, marker: next };
    }
    return end > position + MARKER_TIME_EPS ? { time: end, marker: null } : null;
  }
  for (let index = markers.length - 1; index >= 0; index -= 1) {
    const previous = markers[index];
    if (previous.time < position - MARKER_TIME_EPS) {
      return { time: previous.time, marker: previous };
    }
  }
  return position > MARKER_TIME_EPS ? { time: 0, marker: null } : null;
}

export function remapMarkersAfterDeleteTime(
  markers: readonly ArrangementMarker[],
  a: number,
  b: number,
): ArrangementMarker[] {
  const length = b - a;
  const moved = markers.flatMap((marker): ArrangementMarker[] => {
    if (marker.time <= a + MARKER_TIME_EPS) {
      return [marker];
    }
    if (marker.time >= b - MARKER_TIME_EPS) {
      return [{ ...marker, time: roundMarkerTime(marker.time - length) }];
    }
    return [];
  });
  const result: ArrangementMarker[] = [];
  for (const marker of sortMarkersByTime(moved)) {
    const last = result.at(-1);
    if (!last || Math.abs(marker.time - last.time) >= MARKER_TIME_EPS) {
      result.push(marker);
    }
  }
  return result;
}
