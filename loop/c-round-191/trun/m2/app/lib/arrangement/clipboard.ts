import type {
  Arrangement,
  ArrangementClip,
  ArrangementClipEnvelopePoint,
  TimeRange,
} from '~/types/arrangement';
import { withCutEdges } from './fades';
import {
  ARRANGEMENT_EPS,
  type ClipPlacementConflict,
  createClipId,
  deleteTime,
  findClipPlacementConflict,
} from './model';

const CLIPBOARD_MIN_PART_SECONDS = 0.001;

export interface ArrangementClipboardItem {
  trackId: string;
  sourceId: string;
  offset: number;
  sourceOffset: number;
  duration: number;
  gainDb?: number;
  fadeIn?: number;
  fadeOut?: number;
  envelope?: ArrangementClipEnvelopePoint[];
}

export interface ArrangementClipboard {
  length: number;
  items: ArrangementClipboardItem[];
  allTracks?: true;
}

export type ClipboardPasteRefusal = 'empty' | 'lane-kind' | 'missing' | 'overlap';

export interface ClipboardPasteParams {
  at: number;
  activeTrackId: string | null;
  isSourceAvailable: (sourceId: string) => boolean;
}

export interface ClipboardPastePlan {
  arrangement: Arrangement | null;
  clipIds: string[];
  refusal: ClipboardPasteRefusal | null;
  conflict: ClipPlacementConflict | null;
  trackId: string | null;
}

function clipEndTime(clip: ArrangementClip): number {
  return clip.start + clip.duration;
}

function roundClipboardTime(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

function materialInWindow(
  clips: readonly ArrangementClip[],
  a: number,
  b: number,
): ArrangementClipboardItem[] {
  return clips
    .filter((clip) => clip.start < b - ARRANGEMENT_EPS && clipEndTime(clip) > a + ARRANGEMENT_EPS)
    .map((clip) => {
      const start = Math.max(a, clip.start);
      const end = Math.min(b, clipEndTime(clip));
      const duration = roundClipboardTime(end - start);
      const faded = withCutEdges(
        { ...clip, duration },
        {
          start: clip.start < a - ARRANGEMENT_EPS,
          end: clipEndTime(clip) > b + ARRANGEMENT_EPS,
        },
      );
      return {
        trackId: clip.trackId,
        sourceId: clip.sourceId,
        offset: roundClipboardTime(start - a),
        sourceOffset: roundClipboardTime(clip.sourceOffset + (start - clip.start)),
        duration,
        ...(clip.gainDb === undefined ? {} : { gainDb: clip.gainDb }),
        ...(faded.fadeIn === undefined ? {} : { fadeIn: faded.fadeIn }),
        ...(faded.fadeOut === undefined ? {} : { fadeOut: faded.fadeOut }),
        ...(clip.envelope === undefined ? {} : { envelope: clip.envelope }),
      };
    })
    .filter((item) => item.duration >= CLIPBOARD_MIN_PART_SECONDS)
    .sort((left, right) => left.offset - right.offset);
}

export function copyRangeToClipboard(
  arrangement: Arrangement,
  range: TimeRange,
): ArrangementClipboard | null {
  const a = Math.min(range.start, range.end);
  const b = Math.max(range.start, range.end);
  const items = materialInWindow(
    range.allTracks
      ? arrangement.clips
      : arrangement.clips.filter((clip) => clip.trackId === range.trackId),
    a,
    b,
  );
  if (items.length === 0) {
    return null;
  }
  const clipboard = { length: roundClipboardTime(b - a), items };
  return range.allTracks ? { ...clipboard, allTracks: true } : clipboard;
}

export function copyClipsToClipboard(
  arrangement: Arrangement,
  ids: readonly string[],
): ArrangementClipboard | null {
  const selected = new Set(ids);
  const members = arrangement.clips.filter((clip) => selected.has(clip.id));
  if (members.length === 0) {
    return null;
  }
  const first = Math.min(...members.map((clip) => clip.start));
  const last = Math.max(...members.map(clipEndTime));
  return {
    length: roundClipboardTime(last - first),
    items: members
      .map((clip) => ({
        trackId: clip.trackId,
        sourceId: clip.sourceId,
        offset: roundClipboardTime(clip.start - first),
        sourceOffset: clip.sourceOffset,
        duration: clip.duration,
        ...(clip.gainDb === undefined ? {} : { gainDb: clip.gainDb }),
        ...(clip.fadeIn === undefined ? {} : { fadeIn: clip.fadeIn }),
        ...(clip.fadeOut === undefined ? {} : { fadeOut: clip.fadeOut }),
        ...(clip.envelope === undefined ? {} : { envelope: clip.envelope }),
      }))
      .sort((left, right) => left.offset - right.offset),
  };
}

export function cutRangeFromArrangement(arrangement: Arrangement, range: TimeRange): Arrangement {
  const a = Math.min(range.start, range.end);
  const b = Math.max(range.start, range.end);
  const clips = arrangement.clips.flatMap((clip): ArrangementClip[] => {
    const end = clipEndTime(clip);
    if (
      (!range.allTracks && clip.trackId !== range.trackId) ||
      end <= a + ARRANGEMENT_EPS ||
      clip.start >= b - ARRANGEMENT_EPS
    ) {
      return [clip];
    }
    const parts: ArrangementClip[] = [];
    if (clip.start < a - ARRANGEMENT_EPS) {
      parts.push(withCutEdges({ ...clip, duration: a - clip.start }, { start: false, end: true }));
    }
    if (end > b + ARRANGEMENT_EPS) {
      parts.push(
        withCutEdges(
          {
            ...clip,
            id: parts.length > 0 ? createClipId() : clip.id,
            start: b,
            sourceOffset: clip.sourceOffset + (b - clip.start),
            duration: end - b,
          },
          { start: true, end: false },
        ),
      );
    }
    return parts.filter((part) => part.duration >= CLIPBOARD_MIN_PART_SECONDS);
  });
  return clips.length === arrangement.clips.length &&
    clips.every((clip, index) => clip === arrangement.clips[index])
    ? arrangement
    : { ...arrangement, clips };
}

export function deleteRangeKeepingGap(arrangement: Arrangement, range: TimeRange): Arrangement {
  if (Math.abs(range.end - range.start) < CLIPBOARD_MIN_PART_SECONDS) {
    return arrangement;
  }
  return cutRangeFromArrangement(arrangement, range);
}

export function cutClipsFromArrangement(
  arrangement: Arrangement,
  ids: readonly string[],
): Arrangement {
  const selected = new Set(ids);
  const clips = arrangement.clips.filter((clip) => !selected.has(clip.id));
  return clips.length === arrangement.clips.length ? arrangement : { ...arrangement, clips };
}

export function cutTimeToClipboard(
  arrangement: Arrangement,
  a: number,
  b: number,
): { arrangement: Arrangement; clipboard: ArrangementClipboard } {
  const from = Math.min(a, b);
  const to = Math.max(a, b);
  return {
    arrangement: deleteTime(arrangement, from, to),
    clipboard: {
      length: roundClipboardTime(to - from),
      items: materialInWindow(arrangement.clips, from, to),
    },
  };
}

function refusedPaste(
  refusal: ClipboardPasteRefusal,
  trackId: string | null = null,
  conflict: ClipPlacementConflict | null = null,
): ClipboardPastePlan {
  return { arrangement: null, clipIds: [], refusal, conflict, trackId };
}

export function planClipboardPaste(
  arrangement: Arrangement,
  clipboard: ArrangementClipboard | null,
  params: ClipboardPasteParams,
): ClipboardPastePlan {
  if (!clipboard || clipboard.items.length === 0) {
    return refusedPaste('empty');
  }
  const kindOf = (trackId: string) =>
    arrangement.tracks.find((track) => track.id === trackId)?.kind ?? null;
  const lanes = new Set(clipboard.items.map((item) => item.trackId));
  const [onlyLane] = [...lanes];
  const toActiveTrack = !clipboard.allTracks && lanes.size === 1 && kindOf(onlyLane) === 'audio';
  const pasted: ArrangementClip[] = [];
  for (const item of clipboard.items) {
    const trackId = toActiveTrack ? params.activeTrackId : item.trackId;
    const targetKind = trackId ? kindOf(trackId) : null;
    if (!trackId || targetKind === null) {
      return refusedPaste('missing', trackId);
    }
    const itemKind = kindOf(item.trackId) ?? 'audio';
    if (targetKind !== itemKind) {
      return refusedPaste('lane-kind', trackId);
    }
    if (!params.isSourceAvailable(item.sourceId)) {
      return refusedPaste('missing', trackId);
    }
    pasted.push({
      id: createClipId(),
      trackId,
      sourceId: item.sourceId,
      start: roundClipboardTime(Math.max(0, params.at) + item.offset),
      sourceOffset: item.sourceOffset,
      duration: item.duration,
      ...(item.gainDb === undefined ? {} : { gainDb: item.gainDb }),
      ...(item.fadeIn === undefined ? {} : { fadeIn: item.fadeIn }),
      ...(item.fadeOut === undefined ? {} : { fadeOut: item.fadeOut }),
      ...(item.envelope === undefined ? {} : { envelope: item.envelope }),
    });
  }
  const conflict = findClipPlacementConflict(arrangement, pasted, new Set());
  if (conflict) {
    return refusedPaste('overlap', conflict.trackId, conflict);
  }
  return {
    arrangement: { ...arrangement, clips: [...arrangement.clips, ...pasted] },
    clipIds: pasted.map((clip) => clip.id),
    refusal: null,
    conflict: null,
    trackId: toActiveTrack ? params.activeTrackId : null,
  };
}
