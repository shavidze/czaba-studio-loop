import type { ArrangementClip } from '~/types/arrangement';
import { studioGridStrings } from './strings';

export const GRID_DIVISIONS_SECONDS = [10, 5, 2, 1, 0.5, 0.25, 0.1] as const;

export const GRID_DEFAULT_DIVISION_SECONDS = 1;

export const GRID_LINE_MIN_SPACING_PX = 6;

const GRID_TIME_TOLERANCE = 1e-6;

function isWholeMillisecondStep(step: number): boolean {
  return Math.abs(step * 1000 - Math.round(step * 1000)) < 1e-6;
}

function storedGridLine(index: number, step: number): number {
  return Math.max(0, Math.round(index * step * 1000)) / 1000;
}

function storedGridLineAtOrBelow(time: number, step: number): number | null {
  const base = Math.floor(time / step);
  for (let offset = 1; offset >= -1; offset--) {
    const index = base + offset;
    if (index < 0) {
      return null;
    }
    const line = storedGridLine(index, step);
    if (line <= time + GRID_TIME_TOLERANCE) {
      return line;
    }
  }
  return null;
}

function storedGridLineAtOrAbove(time: number, step: number): number | null {
  const first = Math.max(0, Math.ceil(time / step)) - 1;
  for (let offset = 0; offset <= 2; offset++) {
    const index = first + offset;
    if (index < 0) {
      continue;
    }
    const line = storedGridLine(index, step);
    if (line >= time - GRID_TIME_TOLERANCE) {
      return line;
    }
  }
  return null;
}

function roundGridTime(value: number): number {
  return Math.round(value * 1000) / 1000 || 0;
}

function toWholeMilliseconds(value: number): number {
  return Math.round(value * 1000);
}

export function snapTimeToGrid(time: number, step: number): number {
  if (!isWholeMillisecondStep(step)) {
    return storedGridLine(Math.floor(time / step + 0.5), step);
  }
  const stepMs = toWholeMilliseconds(step);
  const lineIndex = Math.floor(toWholeMilliseconds(time) / stepMs + 0.5);
  return Math.max(0, lineIndex * stepMs) / 1000;
}

export function resolveSnapStep(
  snapSeconds: number | null,
  gridSeconds: number | undefined,
  bypass: boolean,
): number | null {
  if (snapSeconds !== null) {
    return bypass ? null : snapSeconds;
  }
  return bypass ? (gridSeconds ?? null) : null;
}

export function resolveGridTime(
  time: number,
  snapSeconds: number | null,
  gridSeconds: number | undefined,
  bypass: boolean,
): number {
  const step = resolveSnapStep(snapSeconds, gridSeconds, bypass);
  return step === null ? time : snapTimeToGrid(time, step);
}

export function resolveGridTimeWithTargets(
  time: number,
  snapSeconds: number | null,
  gridSeconds: number | undefined,
  bypass: boolean,
  targets: readonly number[],
): number {
  const step = resolveSnapStep(snapSeconds, gridSeconds, bypass);
  return step === null ? time : snapTimeToGridOrEdges(time, step, targets);
}

function adjacentStoredGridLine(time: number, step: number, direction: -1 | 1): number | null {
  if (direction === 1) {
    const base = Math.floor(time / step);
    for (let offset = 0; offset <= 2; offset++) {
      const line = storedGridLine(base + offset, step);
      if (line > time + GRID_TIME_TOLERANCE) {
        return line;
      }
    }
    return storedGridLine(base + 3, step);
  }
  const base = Math.ceil(time / step);
  for (let offset = 0; offset <= 2; offset++) {
    const index = base - offset;
    if (index < 0) {
      return null;
    }
    const line = storedGridLine(index, step);
    if (line < time - GRID_TIME_TOLERANCE) {
      return line;
    }
  }
  return null;
}

export function adjacentGridLine(time: number, step: number, direction: -1 | 1): number | null {
  if (!isWholeMillisecondStep(step)) {
    return adjacentStoredGridLine(time, step, direction);
  }
  if (direction === 1) {
    return roundGridTime((Math.floor((time + GRID_TIME_TOLERANCE) / step) + 1) * step);
  }
  const index = Math.ceil((time - GRID_TIME_TOLERANCE) / step) - 1;
  return index < 0 ? null : roundGridTime(index * step);
}

export function snapGroupDelta(
  anchorStart: number,
  rawDelta: number,
  step: number,
  minDelta: number,
  maxDelta: number,
): number {
  const snapped = roundGridTime(snapTimeToGrid(anchorStart + rawDelta, step) - anchorStart);
  if (snapped >= minDelta - GRID_TIME_TOLERANCE && snapped <= maxDelta + GRID_TIME_TOLERANCE) {
    return snapped;
  }
  const low = Math.max(minDelta, Math.min(0, snapped));
  const high = Math.min(maxDelta, Math.max(0, snapped));
  if (!isWholeMillisecondStep(step)) {
    const line =
      snapped > 0
        ? storedGridLineAtOrBelow(anchorStart + high, step)
        : storedGridLineAtOrAbove(anchorStart + low, step);
    const stored = line === null ? null : roundGridTime(line - anchorStart);
    return stored !== null &&
      stored >= low - GRID_TIME_TOLERANCE &&
      stored <= high + GRID_TIME_TOLERANCE
      ? stored
      : 0;
  }
  const candidate =
    snapped > 0
      ? roundGridTime(
          Math.floor((anchorStart + high + GRID_TIME_TOLERANCE) / step) * step - anchorStart,
        )
      : roundGridTime(
          Math.ceil((anchorStart + low - GRID_TIME_TOLERANCE) / step) * step - anchorStart,
        );
  return candidate >= low - GRID_TIME_TOLERANCE && candidate <= high + GRID_TIME_TOLERANCE
    ? candidate
    : 0;
}

export function gridLinesVisible(step: number, pxPerSecond: number): boolean {
  return step * pxPerSecond >= GRID_LINE_MIN_SPACING_PX;
}

export function formatGridDivision(step: number): string {
  return studioGridStrings.seconds(String(step));
}

export function adjacentGridDivision(
  current: number,
  direction: 'narrow' | 'widen',
): number | null {
  const divisions: readonly number[] = GRID_DIVISIONS_SECONDS;
  const index = divisions.indexOf(current);
  if (index < 0) {
    return null;
  }
  return divisions[direction === 'narrow' ? index + 1 : index - 1] ?? null;
}

function toWholeMicroseconds(value: number): number {
  return Math.round(value * 1e6);
}

function sortedUniqueEdgeTimes(times: readonly number[]): number[] {
  const unique: number[] = [];
  for (const time of [...times].sort((a, b) => a - b)) {
    const last = unique.at(-1);
    if (last === undefined || toWholeMicroseconds(time) !== toWholeMicroseconds(last)) {
      unique.push(time);
    }
  }
  return unique;
}

export function clipEdgeTimes(clips: readonly ArrangementClip[], excludeClipId: string): number[] {
  const edges: number[] = [];
  for (const clip of clips) {
    if (clip.id !== excludeClipId) {
      edges.push(clip.start, clip.start + clip.duration);
    }
  }
  return sortedUniqueEdgeTimes(edges);
}

export function clipEdgeTargets(
  clips: readonly ArrangementClip[],
  excludeClipId: string,
  laneTrackId: string,
  markerTimes: readonly number[] = [],
): { startEdges: number[]; endEdges: number[] } {
  const laneClips = clips.filter(
    (clip) => clip.id !== excludeClipId && clip.trackId === laneTrackId,
  );
  const otherEdges = clipEdgeTimes(
    clips.filter((clip) => clip.trackId !== laneTrackId),
    excludeClipId,
  );
  return {
    startEdges: sortedUniqueEdgeTimes([
      ...otherEdges,
      ...markerTimes,
      ...laneClips.map((clip) => clip.start + clip.duration),
    ]),
    endEdges: sortedUniqueEdgeTimes([
      ...otherEdges,
      ...markerTimes,
      ...laneClips.map((clip) => clip.start),
    ]),
  };
}

function nearestGridOrEdge(
  raw: number,
  gridLine: number,
  edgeCandidates: readonly number[],
): number {
  let best = gridLine;
  let bestDistance = toWholeMicroseconds(Math.abs(gridLine - raw));
  for (const candidate of edgeCandidates
    .filter((time) => toWholeMicroseconds(time) >= 0)
    .sort((a, b) => a - b)) {
    const distance = toWholeMicroseconds(Math.abs(candidate - raw));
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

export function snapTimeToGridOrEdges(
  time: number,
  step: number,
  edges: readonly number[],
): number {
  return nearestGridOrEdge(time, snapTimeToGrid(time, step), edges);
}

export function snapMoveStartToGridOrEdges(
  start: number,
  duration: number,
  step: number,
  edges: readonly number[],
  endEdges: readonly number[] = edges,
): number {
  return nearestGridOrEdge(start, snapTimeToGrid(start, step), [
    ...edges,
    ...endEdges.map((edge) => edge - duration),
  ]);
}

export function snapGroupMoveDelta(
  anchorStart: number,
  anchorDuration: number,
  rawDelta: number,
  step: number,
  minDelta: number,
  maxDelta: number,
  startEdges: readonly number[],
  endEdges: readonly number[],
): { requested: number; allowed: number } {
  const rawStart = anchorStart + rawDelta;
  const gridStart = snapTimeToGrid(rawStart, step);
  const target = snapMoveStartToGridOrEdges(rawStart, anchorDuration, step, startEdges, endEdges);
  const gridFallback = snapGroupDelta(anchorStart, rawDelta, step, minDelta, maxDelta);
  const gridResult = { requested: roundGridTime(gridStart - anchorStart), allowed: gridFallback };
  if (toWholeMicroseconds(target) === toWholeMicroseconds(gridStart)) {
    return gridResult;
  }
  const requested = toWholeMicroseconds(target - anchorStart) / 1e6;
  const inBounds =
    requested >= minDelta - GRID_TIME_TOLERANCE && requested <= maxDelta + GRID_TIME_TOLERANCE;
  return inBounds ? { requested, allowed: requested } : gridResult;
}
