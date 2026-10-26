import type { Arrangement, ArrangementClip } from '~/types/arrangement';
import { ARRANGEMENT_EPS, type ClipPlacementConflict, findClipPlacementConflict } from './model';
import { studioLaneMoveStrings } from './strings';

export type SelectionToggleMode = 'toggle' | 'add';

export const GROUP_MOVE_BLOCKED_MESSAGE = studioLaneMoveStrings.groupMoveBlocked;

export type ClipLaneMoveRefusal =
  | 'video-clip'
  | 'video-lane'
  | 'out-of-range'
  | 'before-start'
  | 'overlap';

export interface ClipLaneMoveParams {
  clipIds: readonly string[];
  anchorClipId: string;
  targetTrackId: string;
  timeDelta: number;
}

export interface ClipLanePlacement {
  clipId: string;
  trackId: string;
  start: number;
  duration: number;
}

export interface ClipLaneMovePlan {
  arrangement: Arrangement | null;
  placements: ClipLanePlacement[];
  refusal: ClipLaneMoveRefusal | null;
  conflict: ClipPlacementConflict | null;
}

export const CLIP_LANE_REFUSAL_MESSAGES: Record<ClipLaneMoveRefusal, string> = {
  'video-clip': studioLaneMoveStrings.videoClipKeepsTrack,
  'video-lane': studioLaneMoveStrings.audioNotOnVideoTrack,
  'out-of-range': studioLaneMoveStrings.noTrackForPart,
  'before-start': studioLaneMoveStrings.partBeforeStart,
  overlap: studioLaneMoveStrings.noRoom,
};

export interface MarqueeBounds {
  t0: number;
  t1: number;
  firstTrack: number;
  lastTrack: number;
}

export interface GroupMoveBounds {
  minDelta: number;
  maxDelta: number;
}

export function toggleInSelection(
  ids: readonly string[],
  id: string,
  mode: SelectionToggleMode,
): string[] {
  const rest = ids.filter((entry) => entry !== id);
  if (mode === 'toggle' && rest.length !== ids.length) {
    return rest;
  }
  return [...rest, id];
}

export function clipsInMarquee(
  arrangement: Arrangement,
  trackOrder: readonly string[],
  bounds: MarqueeBounds,
): string[] {
  const t0 = Math.min(bounds.t0, bounds.t1);
  const t1 = Math.max(bounds.t0, bounds.t1);
  const first = Math.min(bounds.firstTrack, bounds.lastTrack);
  const last = Math.max(bounds.firstTrack, bounds.lastTrack);
  const tracks = new Set(trackOrder.slice(Math.max(0, first), last + 1));
  return arrangement.clips
    .filter(
      (clip) =>
        tracks.has(clip.trackId) &&
        clip.start < t1 - ARRANGEMENT_EPS &&
        clip.start + clip.duration > t0 + ARRANGEMENT_EPS,
    )
    .map((clip) => clip.id);
}

export function unionSelection(base: readonly string[], added: readonly string[]): string[] {
  return [...base, ...added.filter((id) => !base.includes(id))];
}

export function groupMoveBounds(arrangement: Arrangement, ids: readonly string[]): GroupMoveBounds {
  const selected = new Set(ids);
  const members = arrangement.clips.filter((clip) => selected.has(clip.id));
  let minDelta = Number.NEGATIVE_INFINITY;
  let maxDelta = Number.POSITIVE_INFINITY;
  for (const member of members) {
    const memberEnd = member.start + member.duration;
    minDelta = Math.max(minDelta, -member.start);
    for (const other of arrangement.clips) {
      if (selected.has(other.id) || other.trackId !== member.trackId) {
        continue;
      }
      const otherEnd = other.start + other.duration;
      if (other.start >= memberEnd - ARRANGEMENT_EPS) {
        maxDelta = Math.min(maxDelta, other.start - memberEnd);
      } else if (otherEnd <= member.start + ARRANGEMENT_EPS) {
        minDelta = Math.max(minDelta, otherEnd - member.start);
      }
    }
  }
  if (members.length === 0) {
    return { minDelta: 0, maxDelta: 0 };
  }
  return { minDelta: Math.min(0, minDelta) || 0, maxDelta: Math.max(0, maxDelta) };
}

export function moveClips(
  arrangement: Arrangement,
  ids: readonly string[],
  delta: number,
): Arrangement | null {
  const selected = new Set(ids);
  if (!arrangement.clips.some((clip) => selected.has(clip.id))) {
    return null;
  }
  const { minDelta, maxDelta } = groupMoveBounds(arrangement, ids);
  if (delta < minDelta - ARRANGEMENT_EPS || delta > maxDelta + ARRANGEMENT_EPS) {
    return null;
  }
  if (delta === 0) {
    return arrangement;
  }
  return {
    ...arrangement,
    clips: arrangement.clips.map((clip) =>
      selected.has(clip.id) ? { ...clip, start: Math.max(0, clip.start + delta) } : clip,
    ),
  };
}

export function deleteClips(arrangement: Arrangement, ids: readonly string[]): Arrangement {
  const selected = new Set(ids);
  const clips = arrangement.clips.filter((clip) => !selected.has(clip.id));
  return clips.length === arrangement.clips.length ? arrangement : { ...arrangement, clips };
}

function refusedLanePlan(
  refusal: ClipLaneMoveRefusal,
  placements: ClipLanePlacement[] = [],
  conflict: ClipPlacementConflict | null = null,
): ClipLaneMovePlan {
  return { arrangement: null, placements, refusal, conflict };
}

export function planClipLaneMove(
  arrangement: Arrangement,
  params: ClipLaneMoveParams,
): ClipLaneMovePlan {
  const selected = new Set(params.clipIds);
  selected.add(params.anchorClipId);
  const members = arrangement.clips.filter((clip) => selected.has(clip.id));
  const anchor = members.find((clip) => clip.id === params.anchorClipId);
  const audioOrder = arrangement.tracks
    .filter((track) => track.kind === 'audio')
    .map((track) => track.id);
  const targetTrack = arrangement.tracks.find((track) => track.id === params.targetTrackId);
  if (!anchor || !targetTrack) {
    return refusedLanePlan('out-of-range');
  }
  const delta = Math.round(params.timeDelta * 1e6) / 1e6;
  const anchorPlacement: ClipLanePlacement = {
    clipId: anchor.id,
    trackId: targetTrack.id,
    start: Math.max(0, anchor.start + delta),
    duration: anchor.duration,
  };
  if (members.some((clip) => !audioOrder.includes(clip.trackId))) {
    return refusedLanePlan('video-clip', [anchorPlacement]);
  }
  if (targetTrack.kind !== 'audio') {
    return refusedLanePlan('video-lane', [anchorPlacement]);
  }
  const laneDelta = audioOrder.indexOf(targetTrack.id) - audioOrder.indexOf(anchor.trackId);
  const placements: ClipLanePlacement[] = [];
  for (const clip of members) {
    const trackId = audioOrder[audioOrder.indexOf(clip.trackId) + laneDelta];
    const start = clip.start + delta;
    if (trackId === undefined) {
      return refusedLanePlan('out-of-range', [anchorPlacement]);
    }
    if (start < -ARRANGEMENT_EPS) {
      return refusedLanePlan('before-start', [anchorPlacement]);
    }
    placements.push({
      clipId: clip.id,
      trackId,
      start: Math.max(0, start),
      duration: clip.duration,
    });
  }
  const moved = members.map((clip): ArrangementClip => {
    const placement = placements.find((entry) => entry.clipId === clip.id);
    return placement ? { ...clip, trackId: placement.trackId, start: placement.start } : clip;
  });
  const conflict = findClipPlacementConflict(arrangement, moved, selected);
  if (conflict) {
    return refusedLanePlan('overlap', placements, conflict);
  }
  const byId = new Map(moved.map((clip) => [clip.id, clip]));
  return {
    arrangement: {
      ...arrangement,
      clips: arrangement.clips.map((clip) => byId.get(clip.id) ?? clip),
    },
    placements,
    refusal: null,
    conflict: null,
  };
}
