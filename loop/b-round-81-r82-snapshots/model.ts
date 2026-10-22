import type {
  Arrangement,
  ArrangementClip,
  ArrangementLoop,
  ArrangementMaster,
  ArrangementTrack,
  ArrangementTrackKind,
  TimeRange,
} from '~/types/arrangement';
import { remapMarkersAfterDeleteTime, replaceArrangementMarkers } from './markers';
import { nextVideoStart } from './video';

export const ARRANGEMENT_EPS = 1e-4;
export const MIN_CLIP_DURATION = 0.05;
export const MIN_LOOP_LENGTH = 0.1;
const MIN_PART_DURATION = 0.001;
export const DEFAULT_ARRANGEMENT_MASTER: Readonly<ArrangementMaster> = { gainDb: 0, mute: false };
export const MASTER_GAIN_MIN_DB = -60;
export const MASTER_GAIN_MAX_DB = 6;
export const CLIP_GAIN_MIN_DB = -60;
export const CLIP_GAIN_MAX_DB = 24;
export const TRACK_PAN_STEPS = 50;

export type SourceDurations = ReadonlyMap<string, number>;

export interface ArrangementTrackSeed {
  id: string;
  kind: ArrangementTrackKind;
  name: string;
}

export interface AddClipParams {
  trackId: string;
  sourceId: string;
  desiredStart: number;
  sourceDuration: number;
}

export interface ArrangementHistoryEntry {
  label: string;
  snapshot: Arrangement;
}

export interface ArrangementHistory {
  past: ArrangementHistoryEntry[];
  present: Arrangement;
  future: ArrangementHistoryEntry[];
}

export interface ClipPlacementConflict {
  trackId: string;
  start: number;
  end: number;
  occupantId: string;
}

export type DuplicateClipsResult =
  | { arrangement: Arrangement; copyIds: string[]; span: number; conflict: null }
  | { arrangement: null; copyIds: string[]; span: number; conflict: ClipPlacementConflict };

export function createClipId(): string {
  return crypto.randomUUID();
}

function clipEnd(clip: ArrangementClip): number {
  return clip.start + clip.duration;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function replaceClip(arrangement: Arrangement, next: ArrangementClip): Arrangement {
  return {
    ...arrangement,
    clips: arrangement.clips.map((clip) => (clip.id === next.id ? next : clip)),
  };
}

function clipNeighbours(arrangement: Arrangement, clip: ArrangementClip): ArrangementClip[] {
  return arrangement.clips.filter(
    (entry) => entry.trackId === clip.trackId && entry.id !== clip.id,
  );
}

export function createArrangement(seeds: ArrangementTrackSeed[]): Arrangement {
  const videoCount = seeds.filter((seed) => seed.kind === 'video').length;
  if (videoCount !== 1) {
    throw new Error('Arrangement requires exactly one video track');
  }
  return {
    tracks: seeds.map((seed) => ({ ...seed, volume: 1, mute: false, solo: false })),
    clips: [],
    loop: null,
    master: { ...DEFAULT_ARRANGEMENT_MASTER },
  };
}

export function projectEnd(arrangement: Arrangement): number {
  return arrangement.clips.reduce((end, clip) => Math.max(end, clipEnd(clip)), 0);
}

export function findFreeStart(
  arrangement: Arrangement,
  trackId: string,
  duration: number,
  desired: number,
  ignoreClipId?: string,
): number {
  const others = arrangement.clips.filter(
    (clip) => clip.trackId === trackId && clip.id !== ignoreClipId,
  );
  const fits = (start: number) =>
    start >= -ARRANGEMENT_EPS &&
    others.every(
      (clip) =>
        start + duration <= clip.start + ARRANGEMENT_EPS ||
        start >= clipEnd(clip) - ARRANGEMENT_EPS,
    );
  const target = Math.max(0, desired);
  const candidates = [
    target,
    0,
    ...others.flatMap((clip) => [clip.start - duration, clipEnd(clip)]),
  ].filter(fits);
  candidates.sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
  return Math.max(
    0,
    candidates[0] ??
      projectEnd({ tracks: [], clips: others, loop: null, master: DEFAULT_ARRANGEMENT_MASTER }),
  );
}

export function addClip(
  arrangement: Arrangement,
  params: AddClipParams,
): { arrangement: Arrangement; clip: ArrangementClip } | null {
  const track = arrangement.tracks.find((entry) => entry.id === params.trackId);
  if (!track || track.kind !== 'audio' || params.sourceDuration < MIN_CLIP_DURATION) {
    return null;
  }
  const clip: ArrangementClip = {
    id: createClipId(),
    trackId: track.id,
    sourceId: params.sourceId,
    start: findFreeStart(arrangement, track.id, params.sourceDuration, params.desiredStart),
    sourceOffset: 0,
    duration: params.sourceDuration,
  };
  return { arrangement: { ...arrangement, clips: [...arrangement.clips, clip] }, clip };
}

export function appendVideoClip(
  arrangement: Arrangement,
  params: { sourceId: string; sourceDuration: number },
): { arrangement: Arrangement; clip: ArrangementClip } | null {
  const track = arrangement.tracks.find((entry) => entry.kind === 'video');
  if (!track || !Number.isFinite(params.sourceDuration) || params.sourceDuration <= 0) {
    return null;
  }
  const clip: ArrangementClip = {
    id: createClipId(),
    trackId: track.id,
    sourceId: params.sourceId,
    start: nextVideoStart(arrangement),
    sourceOffset: 0,
    duration: params.sourceDuration,
  };
  return { arrangement: { ...arrangement, clips: [...arrangement.clips, clip] }, clip };
}

export function moveClip(
  arrangement: Arrangement,
  clipId: string,
  start: number,
): Arrangement | null {
  const clip = arrangement.clips.find((entry) => entry.id === clipId);
  if (!clip || start < -ARRANGEMENT_EPS) {
    return null;
  }
  const nextStart = Math.max(0, start);
  const blocked = clipNeighbours(arrangement, clip).some(
    (other) =>
      nextStart + clip.duration > other.start + ARRANGEMENT_EPS &&
      nextStart < clipEnd(other) - ARRANGEMENT_EPS,
  );
  if (blocked) {
    return null;
  }
  return replaceClip(arrangement, { ...clip, start: nextStart });
}

export function trimClipStart(arrangement: Arrangement, clipId: string, time: number): Arrangement {
  const clip = arrangement.clips.find((entry) => entry.id === clipId);
  if (!clip) {
    return arrangement;
  }
  const end = clipEnd(clip);
  const previousEnd = clipNeighbours(arrangement, clip)
    .filter((other) => clipEnd(other) <= clip.start + ARRANGEMENT_EPS)
    .reduce((max, other) => Math.max(max, clipEnd(other)), 0);
  const lower = Math.max(previousEnd, clip.start - clip.sourceOffset, 0);
  const upper = end - MIN_CLIP_DURATION;
  if (upper < lower) {
    return arrangement;
  }
  const start = clamp(time, lower, upper);
  if (Math.abs(start - clip.start) < 1e-9) {
    return arrangement;
  }
  return replaceClip(arrangement, {
    ...clip,
    start,
    sourceOffset: clip.sourceOffset + (start - clip.start),
    duration: end - start,
  });
}

export function trimClipEnd(
  arrangement: Arrangement,
  clipId: string,
  time: number,
  sourceDurations: SourceDurations,
): Arrangement {
  const clip = arrangement.clips.find((entry) => entry.id === clipId);
  if (!clip) {
    return arrangement;
  }
  const end = clipEnd(clip);
  const sourceDuration = sourceDurations.get(clip.sourceId) ?? clip.sourceOffset + clip.duration;
  const nextStart = clipNeighbours(arrangement, clip)
    .filter((other) => other.start >= end - ARRANGEMENT_EPS)
    .reduce((min, other) => Math.min(min, other.start), Number.POSITIVE_INFINITY);
  const upper = Math.min(nextStart, clip.start + sourceDuration - clip.sourceOffset);
  const lower = clip.start + MIN_CLIP_DURATION;
  if (upper < lower) {
    return arrangement;
  }
  const nextEnd = clamp(time, lower, upper);
  if (Math.abs(nextEnd - end) < 1e-9) {
    return arrangement;
  }
  return replaceClip(arrangement, { ...clip, duration: nextEnd - clip.start });
}

export function splitClipAt(
  arrangement: Arrangement,
  clipId: string,
  time: number,
): { arrangement: Arrangement; leftId: string; rightId: string } | null {
  const clip = arrangement.clips.find((entry) => entry.id === clipId);
  if (!clip) {
    return null;
  }
  const end = clipEnd(clip);
  if (time - clip.start < MIN_CLIP_DURATION || end - time < MIN_CLIP_DURATION) {
    return null;
  }
  const left: ArrangementClip = { ...clip, duration: time - clip.start };
  const right: ArrangementClip = {
    ...clip,
    id: createClipId(),
    start: time,
    sourceOffset: clip.sourceOffset + (time - clip.start),
    duration: end - time,
  };
  return {
    arrangement: {
      ...arrangement,
      clips: arrangement.clips.flatMap((entry) => (entry.id === clip.id ? [left, right] : [entry])),
    },
    leftId: left.id,
    rightId: right.id,
  };
}

export function splitClipsByRange(
  arrangement: Arrangement,
  range: TimeRange,
): { arrangement: Arrangement; middleId: string } | null {
  const clip = arrangement.clips.find(
    (entry) =>
      entry.trackId === range.trackId &&
      entry.start <= range.start + ARRANGEMENT_EPS &&
      clipEnd(entry) >= range.end - ARRANGEMENT_EPS,
  );
  if (!clip) {
    return null;
  }
  const a = Math.max(range.start, clip.start);
  const b = Math.min(range.end, clipEnd(clip));
  if (b - a < MIN_CLIP_DURATION) {
    return null;
  }
  let current = arrangement;
  let middleId = clip.id;
  let changed = false;
  const leftSplit = splitClipAt(current, middleId, a);
  if (leftSplit) {
    current = leftSplit.arrangement;
    middleId = leftSplit.rightId;
    changed = true;
  }
  const rightSplit = splitClipAt(current, middleId, b);
  if (rightSplit) {
    current = rightSplit.arrangement;
    middleId = rightSplit.leftId;
    changed = true;
  }
  return changed ? { arrangement: current, middleId } : null;
}

export function findClipPlacementConflict(
  arrangement: Arrangement,
  placed: readonly ArrangementClip[],
  ignoreIds: ReadonlySet<string>,
): ClipPlacementConflict | null {
  const kept = arrangement.clips.filter((clip) => !ignoreIds.has(clip.id));
  for (const clip of placed) {
    const end = clipEnd(clip);
    const occupant = [...kept, ...placed].find(
      (other) =>
        other !== clip &&
        other.trackId === clip.trackId &&
        clip.start < clipEnd(other) - ARRANGEMENT_EPS &&
        end > other.start + ARRANGEMENT_EPS,
    );
    if (occupant) {
      return { trackId: clip.trackId, start: clip.start, end, occupantId: occupant.id };
    }
  }
  return null;
}

export function duplicateClips(
  arrangement: Arrangement,
  ids: readonly string[],
): DuplicateClipsResult | null {
  const selected = new Set(ids);
  const members = arrangement.clips.filter((clip) => selected.has(clip.id));
  if (members.length === 0) {
    return null;
  }
  const first = Math.min(...members.map((clip) => clip.start));
  const span = Math.max(...members.map(clipEnd)) - first;
  const copies = members.map(
    (clip): ArrangementClip => ({ ...clip, id: createClipId(), start: clip.start + span }),
  );
  const conflict = findClipPlacementConflict(arrangement, copies, new Set());
  if (conflict) {
    return { arrangement: null, copyIds: [], span, conflict };
  }
  return {
    arrangement: { ...arrangement, clips: [...arrangement.clips, ...copies] },
    copyIds: copies.map((clip) => clip.id),
    span,
    conflict: null,
  };
}

export function splitClipsAtTime(
  arrangement: Arrangement,
  ids: readonly string[],
  time: number,
): { arrangement: Arrangement; rightIds: string[] } | null {
  let current = arrangement;
  const rightIds: string[] = [];
  for (const id of ids) {
    const result = splitClipAt(current, id, time);
    if (result) {
      current = result.arrangement;
      rightIds.push(result.rightId);
    }
  }
  return rightIds.length > 0 ? { arrangement: current, rightIds } : null;
}

export function deleteClip(arrangement: Arrangement, clipId: string): Arrangement {
  return { ...arrangement, clips: arrangement.clips.filter((clip) => clip.id !== clipId) };
}

export function deleteTime(arrangement: Arrangement, a: number, b: number): Arrangement {
  const length = b - a;
  if (length <= ARRANGEMENT_EPS) {
    return arrangement;
  }
  const clips = arrangement.clips.flatMap((clip): ArrangementClip[] => {
    const start = clip.start;
    const end = clipEnd(clip);
    if (end <= a + ARRANGEMENT_EPS) {
      return [clip];
    }
    if (start >= b - ARRANGEMENT_EPS) {
      return [{ ...clip, start: start - length }];
    }
    const parts: ArrangementClip[] = [];
    if (start < a) {
      parts.push({ ...clip, duration: a - start });
    }
    if (end > b) {
      parts.push({
        ...clip,
        id: start < a ? createClipId() : clip.id,
        start: a,
        sourceOffset: clip.sourceOffset + (b - start),
        duration: end - b,
      });
    }
    return parts.filter((part) => part.duration >= MIN_PART_DURATION);
  });
  const next = { ...arrangement, clips, loop: remapLoopAfterDeleteTime(arrangement.loop, a, b) };
  return arrangement.markers === undefined
    ? next
    : replaceArrangementMarkers(next, remapMarkersAfterDeleteTime(arrangement.markers, a, b));
}

function remapLoopAfterDeleteTime(
  loop: ArrangementLoop | null,
  a: number,
  b: number,
): ArrangementLoop | null {
  if (!loop) {
    return null;
  }
  const start = remapTime(loop.start, a, b);
  const end = remapTime(loop.end, a, b);
  if (end - start < MIN_LOOP_LENGTH - 1e-9) {
    return null;
  }
  return { ...loop, start, end };
}

export function remapTime(time: number, a: number, b: number): number {
  if (time <= a) {
    return time;
  }
  if (time < b) {
    return a;
  }
  return time - (b - a);
}

export function setTrackMix(
  arrangement: Arrangement,
  trackId: string,
  patch: Partial<Pick<ArrangementTrack, 'volume' | 'mute'>>,
): Arrangement {
  return {
    ...arrangement,
    tracks: arrangement.tracks.map((track) =>
      track.id === trackId
        ? {
            ...track,
            mute: patch.mute ?? track.mute,
            volume: patch.volume === undefined ? track.volume : clamp(patch.volume, 0, 1),
          }
        : track,
    ),
  };
}

export function setMasterMix(
  arrangement: Arrangement,
  patch: Partial<ArrangementMaster>,
): Arrangement {
  const current = arrangement.master;
  const gainDb =
    patch.gainDb === undefined || !Number.isFinite(patch.gainDb)
      ? current.gainDb
      : clamp(patch.gainDb, MASTER_GAIN_MIN_DB, MASTER_GAIN_MAX_DB);
  const mute = patch.mute ?? current.mute;
  if (gainDb === current.gainDb && mute === current.mute) {
    return arrangement;
  }
  return { ...arrangement, master: { gainDb, mute } };
}

export function masterLinearGain(master: ArrangementMaster): number {
  return master.mute ? 0 : 10 ** (master.gainDb / 20);
}

export function normalizeClipGainDb(gainDb: number): number {
  const rounded = Math.round(clamp(gainDb, CLIP_GAIN_MIN_DB, CLIP_GAIN_MAX_DB) * 10) / 10;
  return rounded === 0 ? 0 : rounded;
}

export function setClipGainDb(
  arrangement: Arrangement,
  clipId: string,
  gainDb: number,
): Arrangement {
  const clip = arrangement.clips.find((entry) => entry.id === clipId);
  const track = clip && arrangement.tracks.find((entry) => entry.id === clip.trackId);
  if (!clip || track?.kind !== 'audio' || !Number.isFinite(gainDb)) {
    return arrangement;
  }
  const next = normalizeClipGainDb(gainDb);
  if (next === (clip.gainDb ?? 0)) {
    return arrangement;
  }
  const { gainDb: _previousGainDb, ...rest } = clip;
  return replaceClip(arrangement, next === 0 ? rest : { ...rest, gainDb: next });
}

export function clipLinearGain(clip: ArrangementClip): number {
  return clip.gainDb === undefined ? 1 : 10 ** (clip.gainDb / 20);
}

export function clipLinearGains(arrangement: Arrangement): Map<string, number> {
  const gains = new Map<string, number>();
  for (const clip of arrangement.clips) {
    if (clip.gainDb !== undefined) {
      gains.set(clip.id, clipLinearGain(clip));
    }
  }
  return gains;
}

export function normalizeTrackPan(pan: number): number {
  const rounded = Math.round(clamp(pan, -1, 1) * TRACK_PAN_STEPS) / TRACK_PAN_STEPS;
  return rounded === 0 ? 0 : rounded;
}

export function trackPanValue(track: ArrangementTrack): number {
  return track.pan ?? 0;
}

export function setArrangementTrackPan(
  arrangement: Arrangement,
  trackId: string,
  pan: number,
): Arrangement {
  const track = arrangement.tracks.find((entry) => entry.id === trackId);
  if (!track || track.kind !== 'audio' || !Number.isFinite(pan)) {
    return arrangement;
  }
  const next = normalizeTrackPan(pan);
  if (next === trackPanValue(track)) {
    return arrangement;
  }
  const { pan: _previousPan, ...rest } = track;
  const updated: ArrangementTrack = next === 0 ? rest : { ...rest, pan: next };
  return {
    ...arrangement,
    tracks: arrangement.tracks.map((entry) => (entry.id === trackId ? updated : entry)),
  };
}

export function formatTrackPan(pan: number): string {
  const units = Math.round(pan * TRACK_PAN_STEPS);
  if (units === 0) {
    return 'C';
  }
  return units < 0 ? `${Math.abs(units)}L` : `${units}R`;
}

export function formatMasterGainDb(gainDb: number): string {
  const magnitude = Math.abs(gainDb).toFixed(1);
  if (magnitude === '0.0') {
    return '0.0 dB';
  }
  return `${gainDb < 0 ? '−' : '+'}${magnitude} dB`;
}

export function toggleSolo(
  arrangement: Arrangement,
  trackId: string,
  additive: boolean,
): Arrangement {
  const target = arrangement.tracks.find((track) => track.id === trackId);
  if (!target) {
    return arrangement;
  }
  if (additive) {
    return {
      ...arrangement,
      tracks: arrangement.tracks.map((track) =>
        track.id === trackId ? { ...track, solo: !track.solo } : track,
      ),
    };
  }
  const groups = arrangement.groups;
  const groupSoloed = groups?.some((group) => group.solo === true) === true;
  const onlySolo =
    target.solo &&
    !groupSoloed &&
    arrangement.tracks.every((track) => track.id === trackId || !track.solo);
  return {
    ...arrangement,
    tracks: arrangement.tracks.map((track) => ({
      ...track,
      solo: onlySolo ? false : track.id === trackId,
    })),
    ...(groups && groupSoloed
      ? { groups: groups.map(({ solo: _previousSolo, ...group }) => group) }
      : {}),
  };
}

export function isSameArrangement(a: Arrangement, b: Arrangement): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function createHistory(arrangement: Arrangement): ArrangementHistory {
  return { past: [], present: arrangement, future: [] };
}

export function commitHistory(
  history: ArrangementHistory,
  next: Arrangement,
  label: string,
  before: Arrangement = history.present,
): ArrangementHistory {
  if (isSameArrangement(before, next)) {
    return before === history.present ? history : { ...history, present: before };
  }
  return {
    past: [...history.past, { label, snapshot: before }],
    present: next,
    future: [],
  };
}

export function undoHistory(history: ArrangementHistory): ArrangementHistory {
  const last = history.past.at(-1);
  if (!last) {
    return history;
  }
  return {
    past: history.past.slice(0, -1),
    present: last.snapshot,
    future: [{ label: last.label, snapshot: history.present }, ...history.future],
  };
}

export function redoHistory(history: ArrangementHistory): ArrangementHistory {
  const [next, ...rest] = history.future;
  if (!next) {
    return history;
  }
  return {
    past: [...history.past, { label: next.label, snapshot: history.present }],
    present: next.snapshot,
    future: rest,
  };
}
