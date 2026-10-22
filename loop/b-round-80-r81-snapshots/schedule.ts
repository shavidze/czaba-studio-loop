import type { Arrangement, ArrangementTrack, ScheduledClip } from '~/types/arrangement';
import { ARRANGEMENT_EPS } from './model';

export function isTrackAudible(
  track: ArrangementTrack,
  tracks: readonly ArrangementTrack[],
): boolean {
  if (track.mute) {
    return false;
  }
  const anySolo = tracks.some((entry) => entry.solo);
  return !anySolo || track.solo;
}

export function planSchedule(
  arrangement: Arrangement,
  from: number,
  until?: number,
): ScheduledClip[] {
  const trackIds = new Set(arrangement.tracks.map((track) => track.id));
  return arrangement.clips
    .filter((clip) => trackIds.has(clip.trackId))
    .filter((clip) => clip.start + clip.duration > from + ARRANGEMENT_EPS)
    .filter((clip) => until === undefined || clip.start < until)
    .map((clip) => {
      const when = Math.max(clip.start, from);
      return {
        clipId: clip.id,
        trackId: clip.trackId,
        sourceId: clip.sourceId,
        when,
        sourceOffset: clip.sourceOffset + Math.max(0, from - clip.start),
        duration: clip.start + clip.duration - when,
      };
    })
    .sort((a, b) => a.when - b.when);
}
