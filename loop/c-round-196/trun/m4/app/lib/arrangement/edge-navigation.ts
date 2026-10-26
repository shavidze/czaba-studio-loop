import type { Arrangement, TimeRange } from '~/types/arrangement';
import { MARKER_TIME_EPS, roundMarkerTime } from './markers';

const APPLE_PLATFORM_PATTERN = /Mac|iPhone|iPad|iPod/;

export interface EdgeNavigationSelection {
  activeTrackId: string | null;
  selectedClipIds: readonly string[];
  range: TimeRange | null;
}

export function edgeNavigationTrackIds(
  arrangement: Arrangement,
  selection: EdgeNavigationSelection,
): string[] {
  if (selection.range?.allTracks) {
    return arrangement.tracks.map((track) => track.id);
  }
  const selectedClipIds = new Set(selection.selectedClipIds);
  const wanted = new Set<string>();
  if (selection.activeTrackId) {
    wanted.add(selection.activeTrackId);
  }
  for (const clip of arrangement.clips) {
    if (selectedClipIds.has(clip.id)) {
      wanted.add(clip.trackId);
    }
  }
  if (selection.range) {
    wanted.add(selection.range.trackId);
  }
  return arrangement.tracks.filter((track) => wanted.has(track.id)).map((track) => track.id);
}

export function clipEdgeTimesOnTracks(
  arrangement: Arrangement,
  trackIds: readonly string[],
): number[] {
  const edges = arrangement.clips
    .filter((clip) => trackIds.includes(clip.trackId))
    .flatMap((clip) => [roundMarkerTime(clip.start), roundMarkerTime(clip.start + clip.duration)])
    .sort((left, right) => left - right);
  const unique: number[] = [];
  for (const edge of edges) {
    const last = unique.at(-1);
    if (last === undefined || edge - last >= MARKER_TIME_EPS) {
      unique.push(edge);
    }
  }
  return unique;
}

export function isApplePlatform(platform: string, userAgent: string): boolean {
  if (platform.length > 0) {
    return APPLE_PLATFORM_PATTERN.test(platform);
  }
  return APPLE_PLATFORM_PATTERN.test(userAgent);
}
