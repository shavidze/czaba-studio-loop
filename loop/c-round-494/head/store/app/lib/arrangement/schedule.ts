import type {
  Arrangement,
  ArrangementTrack,
  ArrangementTrackGroup,
  ScheduledClip,
} from '~/types/arrangement';
import { arrangementGroups, trackGroupAncestors, trackGroupVolume } from './groups';
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

function isAnySoloInArrangement(arrangement: Arrangement): boolean {
  if (arrangement.tracks.some((entry) => entry.solo)) {
    return true;
  }
  if (!arrangementGroups(arrangement).some((group) => group.solo === true)) {
    return false;
  }
  return arrangement.tracks.some((track) =>
    trackGroupAncestors(arrangement, track.groupId).some((group) => group.solo === true),
  );
}

function isTrackChainAudible(
  track: ArrangementTrack,
  chain: readonly ArrangementTrackGroup[],
  anySolo: boolean,
): boolean {
  if (track.mute || chain.some((group) => group.mute === true)) {
    return false;
  }
  return !anySolo || track.solo || chain.some((group) => group.solo === true);
}

export function isTrackAudibleWithGroups(
  track: ArrangementTrack,
  arrangement: Arrangement,
): boolean {
  return isTrackChainAudible(
    track,
    trackGroupAncestors(arrangement, track.groupId),
    isAnySoloInArrangement(arrangement),
  );
}

export function trackEffectiveGains(arrangement: Arrangement): Map<string, number> {
  const anySolo = isAnySoloInArrangement(arrangement);
  return new Map(
    arrangement.tracks.map((track) => {
      const chain = trackGroupAncestors(arrangement, track.groupId);
      const gain = isTrackChainAudible(track, chain, anySolo)
        ? chain.reduce((product, group) => product * trackGroupVolume(group), track.volume)
        : 0;
      return [track.id, gain];
    }),
  );
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
