import type { Arrangement } from '~/types/arrangement';
import {
  CLIP_GAIN_MAX_DB,
  CLIP_GAIN_MIN_DB,
  formatMasterGainDb,
  normalizeClipGainDb,
} from './model';

export interface ClipGainMemberSpan {
  clipIds: readonly string[];
  minDb: number;
  maxDb: number;
}

const CLIP_GAIN_MEMBER_KEY_SEPARATOR = '\n';

export function clipGainMemberKey(clipIds: readonly string[]): string {
  return [...clipIds].sort().join(CLIP_GAIN_MEMBER_KEY_SEPARATOR);
}

export function clipGainMemberSpan(
  arrangement: Arrangement,
  clipIds: readonly string[],
): ClipGainMemberSpan | null {
  const wanted = new Set(clipIds);
  const audioTrackIds = new Set(
    arrangement.tracks.filter((track) => track.kind === 'audio').map((track) => track.id),
  );
  const members = arrangement.clips.filter(
    (clip) => wanted.has(clip.id) && audioTrackIds.has(clip.trackId),
  );
  if (members.length === 0) {
    return null;
  }
  const gains = members.map((clip) => clip.gainDb ?? 0);
  return {
    clipIds: members.map((clip) => clip.id),
    minDb: Math.min(...gains),
    maxDb: Math.max(...gains),
  };
}

export function clipGainShiftTargets(
  baseline: Arrangement,
  clipIds: readonly string[],
  deltaDb: number,
): Map<string, number> {
  const targets = new Map<string, number>();
  const span = clipGainMemberSpan(baseline, clipIds);
  if (!span || !Number.isFinite(deltaDb)) {
    return targets;
  }
  const clamped = Math.min(
    CLIP_GAIN_MAX_DB - span.maxDb,
    Math.max(CLIP_GAIN_MIN_DB - span.minDb, deltaDb),
  );
  const effectiveDelta = Math.round(clamped * 10) / 10;
  const members = new Set(span.clipIds);
  for (const clip of baseline.clips) {
    if (members.has(clip.id)) {
      targets.set(clip.id, normalizeClipGainDb((clip.gainDb ?? 0) + effectiveDelta));
    }
  }
  return targets;
}

export function applyClipGainTargets(
  arrangement: Arrangement,
  targets: ReadonlyMap<string, number>,
): Arrangement {
  let isChanged = false;
  const clips = arrangement.clips.map((clip) => {
    const target = targets.get(clip.id);
    if (target === undefined || target === (clip.gainDb ?? 0)) {
      return clip;
    }
    isChanged = true;
    const { gainDb: _previousGainDb, ...rest } = clip;
    return target === 0 ? rest : { ...rest, gainDb: target };
  });
  return isChanged ? { ...arrangement, clips } : arrangement;
}

export function shiftClipGainsDb(
  arrangement: Arrangement,
  clipIds: readonly string[],
  deltaDb: number,
): Arrangement {
  return applyClipGainTargets(arrangement, clipGainShiftTargets(arrangement, clipIds, deltaDb));
}

export function setClipGainsDb(
  arrangement: Arrangement,
  clipIds: readonly string[],
  gainDb: number,
): Arrangement {
  const span = clipGainMemberSpan(arrangement, clipIds);
  if (!span || !Number.isFinite(gainDb)) {
    return arrangement;
  }
  const next = normalizeClipGainDb(gainDb);
  return applyClipGainTargets(arrangement, new Map(span.clipIds.map((clipId) => [clipId, next])));
}

export function formatClipGainRange(minDb: number, maxDb: number): string {
  if (minDb === maxDb) {
    return formatMasterGainDb(maxDb);
  }
  return `${formatMasterGainDb(minDb).replace(/ dB$/, '')} … ${formatMasterGainDb(maxDb)}`;
}

export function formatClipGainMembersStatus(span: ClipGainMemberSpan): string {
  return `Clip Gain: ${span.clipIds.length} კლიპი — ${formatClipGainRange(span.minDb, span.maxDb)}.`;
}
