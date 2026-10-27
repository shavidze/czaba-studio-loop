import { Film, GripVertical } from 'lucide-react';
import { type MouseEvent, memo, type PointerEvent, useEffect, useMemo, useRef } from 'react';
import {
  type ClipLaneDragState,
  type ClipLaneGhost,
  formatArrangementTime,
} from '~/contexts/ArrangementContext';
import { formatClipEnvelopeData } from '~/lib/arrangement/envelope';
import { type ClipFadeEdge, clipFadeIn, clipFadeOut, setClipFade } from '~/lib/arrangement/fades';
import {
  clipEdgeTargets,
  resolveGridTimeWithTargets,
  resolveSnapStep,
  snapGroupMoveDelta,
  snapMoveStartToGridOrEdges,
  snapTimeToGridOrEdges,
} from '~/lib/arrangement/grid';
import { markerSnapTimes } from '~/lib/arrangement/markers';
import { clipGainDraftKey } from '~/lib/arrangement/mix-draft-store';
import { moveClip, trimClipEnd, trimClipStart } from '~/lib/arrangement/model';
import { PEAK_BUCKETS_PER_SECOND } from '~/lib/arrangement/peaks';
import {
  CLIP_LANE_REFUSAL_MESSAGES,
  type ClipLanePlacement,
  GROUP_MOVE_BLOCKED_MESSAGE,
  type GroupMoveBounds,
  groupMoveBounds,
  moveClips,
  planClipLaneMove,
  type SelectionToggleMode,
} from '~/lib/arrangement/selection';
import { studioClipStrings } from '~/lib/arrangement/strings';
import { setVideoClipFade } from '~/lib/arrangement/video-fades';
import { clipWaveformScale } from '~/lib/arrangement/waveform-zoom';
import { cn } from '~/lib/utils';
import type { Arrangement, ArrangementClip, TimeRange } from '~/types/arrangement';
import {
  ArrangementClipEnvelope,
  CLIP_DRAG_DOUBLE_CLICK_GUARD_MS,
} from './ArrangementClipEnvelope';
import { useMixDraftValue } from './ArrangementMixFader';

const DRAG_THRESHOLD_PX = 3;
const TRIM_BLOCK_TOLERANCE = 0.01;
const PEAK_SHAPE_MAX_COLUMNS = 4096;
const CLIP_FOLDED_TITLE_LINE = studioClipStrings.foldedTitleLine;
const FADE_HANDLE_PX = 10;
const FADE_HANDLE_MIN_CLIP_PX = 24;
const CLIP_BORDER_PX = 2;
const CLIP_FADE_LABELS: Record<ClipFadeEdge, string> = { in: 'Fade In', out: 'Fade Out' };
const CLIP_FADE_HANDLE_TITLES: Record<ClipFadeEdge, string> = {
  in: 'Fade In — drag · double-click = 0',
  out: 'Fade Out — drag · double-click = 0',
};
const VIDEO_FADE_LABELS: Record<ClipFadeEdge, string> = {
  in: 'Video Fade In',
  out: 'Video Fade Out',
};
const VIDEO_FADE_HANDLE_TITLES: Record<ClipFadeEdge, string> = {
  in: studioClipStrings.videoFadeInTitle,
  out: studioClipStrings.videoFadeOutTitle,
};
const CLIP_LANE_REFUSAL_KEPT_PLACE = studioClipStrings.keptLastFreeSpot;

type ClipGestureKind = 'move' | 'trimStart' | 'trimEnd' | 'range' | 'fadeIn' | 'fadeOut';

interface ClipLaneTarget {
  trackId: string;
  arrangement: Arrangement;
  placements: ClipLanePlacement[];
}

interface ClipGesture {
  kind: ClipGestureKind;
  pointerId: number;
  startX: number;
  startY: number;
  before: Arrangement;
  original: ArrangementClip;
  anchorTime: number;
  moved: boolean;
  blocked: boolean;
  group: { ids: readonly string[]; bounds: GroupMoveBounds } | null;
  laneTarget: ClipLaneTarget | null;
  laneRefusal: string | null;
  captureElement: HTMLElement;
  ghostKey: string | null;
  timeLocked: boolean;
  release: () => void;
}

interface PeakShape {
  columns: number;
  path: string;
}

export interface ArrangementClipViewProps {
  clip: ArrangementClip;
  title: string;
  peaks: Float32Array | undefined;
  isVideo: boolean;
  audioNote: string | null;
  pxPerSecond: number;
  isSelected: boolean;
  isLaneMoveSource: boolean;
  range: TimeRange | null;
  sourceDurations: ReadonlyMap<string, number>;
  getArrangement: () => Arrangement;
  previewArrangement: (next: Arrangement) => void;
  commitArrangement: (next: Arrangement, label: string, before: Arrangement) => boolean;
  selectClip: (clipId: string | null) => void;
  toggleClipSelection: (clipId: string, mode: SelectionToggleMode) => void;
  getSelectedClipIds: () => readonly string[];
  setTimeRange: (range: TimeRange | null) => void;
  setActiveTrack: (trackId: string) => void;
  seekTo: (time: number) => void;
  setStatus: (message: string) => void;
  claimPointerGesture: (pointerId: number, abort: () => void) => (() => void) | null;
  setClipLaneDrag: (next: ClipLaneDragState | null) => void;
  folded?: boolean;
  snapSeconds?: number | null;
  gridSeconds?: number;
  envelopeMode?: boolean;
  waveformZoom?: number;
}

function roundTime(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function clipFadeGestureEdge(kind: ClipGestureKind): ClipFadeEdge | null {
  return kind === 'fadeIn' ? 'in' : kind === 'fadeOut' ? 'out' : null;
}

function clipFadeSeconds(clip: ArrangementClip, edge: ClipFadeEdge): number {
  return edge === 'in' ? clipFadeIn(clip) : clipFadeOut(clip);
}

function moveStartOnGrid(
  start: number,
  delta: number,
  duration: number,
  snapStep: number | null,
  startEdges: readonly number[],
  endEdges: readonly number[],
): number {
  return snapStep === null
    ? Math.max(0, roundTime(start + delta))
    : snapMoveStartToGridOrEdges(start + delta, duration, snapStep, startEdges, endEdges);
}

function groupDeltaOnGrid(
  anchor: ArrangementClip,
  delta: number,
  snapStep: number | null,
  group: { ids: readonly string[]; bounds: GroupMoveBounds },
  clips: readonly ArrangementClip[],
  laneTrackId: string,
  markerTimes: readonly number[],
): { requested: number; allowed: number } {
  const { bounds } = group;
  if (snapStep === null) {
    const requested = roundTime(delta);
    return {
      requested,
      allowed: Math.min(bounds.maxDelta, Math.max(bounds.minDelta, requested)),
    };
  }
  const targets = clipEdgeTargets(
    clips.filter((entry) => !group.ids.includes(entry.id)),
    anchor.id,
    laneTrackId,
    markerTimes,
  );
  return snapGroupMoveDelta(
    anchor.start,
    anchor.duration,
    delta,
    snapStep,
    bounds.minDelta,
    bounds.maxDelta,
    targets.startEdges,
    targets.endEdges,
  );
}

export function watchUncapturedPointerGesture(
  gesture: { pointerId: number; release: () => void },
  onLostPointer: () => void,
) {
  const releaseGesture = gesture.release;
  const handleWindowPointerEnd = (event: globalThis.PointerEvent) => {
    if (event.pointerId === gesture.pointerId) {
      onLostPointer();
    }
  };
  const detach = () => {
    window.removeEventListener('pointerup', handleWindowPointerEnd);
    window.removeEventListener('pointercancel', handleWindowPointerEnd);
  };
  gesture.release = () => {
    detach();
    releaseGesture();
  };
  window.addEventListener('pointerup', handleWindowPointerEnd);
  window.addEventListener('pointercancel', handleWindowPointerEnd);
}

function laneTrackIdAtPointer(root: HTMLElement, clientY: number): string | null {
  const container = root.closest<HTMLElement>('[data-track-id]')?.parentElement;
  if (!container) {
    return null;
  }
  const rows = Array.from(container.children).filter(
    (entry): entry is HTMLElement =>
      entry instanceof HTMLElement && entry.dataset.trackId !== undefined,
  );
  const first = rows[0];
  const last = rows.at(-1);
  if (!first || !last) {
    return null;
  }
  for (const row of rows) {
    const rect = row.getBoundingClientRect();
    if (clientY >= rect.top && clientY < rect.bottom) {
      return row.dataset.trackId ?? null;
    }
  }
  if (clientY < first.getBoundingClientRect().top) {
    return first.dataset.trackId ?? null;
  }
  if (clientY >= last.getBoundingClientRect().bottom) {
    return last.dataset.trackId ?? null;
  }
  return null;
}

function laneGhostsFrom(
  placements: readonly ClipLanePlacement[],
  blocked: boolean,
  message: string | null,
): ClipLaneGhost[] {
  return placements.map((placement) => ({ ...placement, blocked, message }));
}

export function buildPeakShape(
  peaks: Float32Array | undefined,
  sourceOffset: number,
  duration: number,
  columns: number,
  scale: number,
): PeakShape | null {
  if (!peaks || peaks.length === 0 || columns <= 0) {
    return null;
  }
  const from = Math.floor(sourceOffset * PEAK_BUCKETS_PER_SECOND);
  const to = Math.min(peaks.length, Math.ceil((sourceOffset + duration) * PEAK_BUCKETS_PER_SECOND));
  const span = to - from;
  if (span <= 0) {
    return null;
  }
  const count = Math.max(1, Math.min(span, Math.round(columns)));
  const perColumn = span / count;
  const s = Number.isFinite(scale) && scale >= 0 ? scale : 1;
  const parts: string[] = [];
  for (let column = 0; column < count; column++) {
    const start = from + Math.floor(column * perColumn);
    const end = Math.max(start + 1, from + Math.floor((column + 1) * perColumn));
    let max = 0;
    for (let i = start; i < end && i < to; i++) {
      max = Math.max(max, peaks[i]);
    }
    const height = Math.max(0.02, Math.min(1, max * s));
    parts.push(`M${column} ${(1 - height).toFixed(3)}h1V${(1 + height).toFixed(3)}h-1Z`);
  }
  return { columns: count, path: parts.join('') };
}

interface ArrangementPeakPathProps {
  clip: ArrangementClip;
  peaks: Float32Array | undefined;
  columns: number;
  isVideo?: boolean;
  zoom?: number;
  testId?: string;
}

export function ArrangementPeakPath({
  clip,
  peaks,
  columns,
  isVideo = false,
  zoom = 1,
  testId,
}: ArrangementPeakPathProps) {
  const draftGainDb = useMixDraftValue(clipGainDraftKey(clip.id));
  const scale = clipWaveformScale(
    draftGainDb === undefined ? clip : { ...clip, gainDb: draftGainDb },
    isVideo,
    zoom,
  );
  const peakShape = useMemo(
    () => buildPeakShape(peaks, clip.sourceOffset, clip.duration, columns, scale),
    [peaks, clip.sourceOffset, clip.duration, columns, scale],
  );
  if (!peakShape) {
    return null;
  }
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${peakShape.columns} 2`}
      preserveAspectRatio="none"
      aria-hidden="true"
      data-testid={testId}
    >
      <path d={peakShape.path} fill="currentColor" />
    </svg>
  );
}

function ArrangementClipViewInner({
  clip,
  title,
  peaks,
  isVideo,
  audioNote,
  pxPerSecond,
  isSelected,
  isLaneMoveSource,
  range,
  sourceDurations,
  getArrangement,
  previewArrangement,
  commitArrangement,
  selectClip,
  toggleClipSelection,
  getSelectedClipIds,
  setTimeRange,
  setActiveTrack,
  seekTo,
  setStatus,
  claimPointerGesture,
  setClipLaneDrag,
  folded = false,
  snapSeconds = null,
  gridSeconds,
  envelopeMode = false,
  waveformZoom = 1,
}: ArrangementClipViewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<ClipGesture | null>(null);
  const lastFadeDragRef = useRef<{ edge: ClipFadeEdge; at: number } | null>(null);
  const setFade = isVideo ? setVideoClipFade : setClipFade;
  const fadeLabels = isVideo ? VIDEO_FADE_LABELS : CLIP_FADE_LABELS;
  const width = clip.duration * pxPerSecond;
  const peakColumns = Math.round(Math.min(width, PEAK_SHAPE_MAX_COLUMNS));

  useEffect(
    () => () => {
      const gesture = gestureRef.current;
      gestureRef.current = null;
      gesture?.release();
    },
    [],
  );

  const endStaleClipGesture = (gesture: ClipGesture) => {
    gestureRef.current = null;
    const fadeEdge = clipFadeGestureEdge(gesture.kind);
    if (fadeEdge && gesture.moved) {
      lastFadeDragRef.current = { edge: fadeEdge, at: performance.now() };
    }
    if (gesture.moved && gesture.kind !== 'range') {
      previewArrangement(gesture.before);
    }
    gesture.release();
  };

  const beginGesture = (kind: ClipGestureKind, event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || event.buttons === 0 || !rootRef.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    let claimed: ClipGesture | null = null;
    const releaseClaim = claimPointerGesture(event.pointerId, () => {
      const stale = claimed;
      if (stale && gestureRef.current === stale) {
        endStaleClipGesture(stale);
        return;
      }
      stale?.release();
    });
    if (!releaseClaim) {
      return;
    }
    const leftover = gestureRef.current;
    if (leftover) {
      endStaleClipGesture(leftover);
    }
    const isToggle = event.ctrlKey || event.metaKey;
    if (isToggle || event.shiftKey) {
      releaseClaim();
      toggleClipSelection(clip.id, isToggle ? 'toggle' : 'add');
      return;
    }
    const root = rootRef.current;
    const rect = root.getBoundingClientRect();
    const before = getArrangement();
    const selection = getSelectedClipIds();
    const captureElement = clipFadeGestureEdge(kind) ? event.currentTarget : root;
    const groupIds =
      kind === 'move' && selection.length >= 2 && selection.includes(clip.id) ? selection : null;
    claimed = {
      kind,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      before,
      original: clip,
      anchorTime: clip.start + (event.clientX - rect.left) / pxPerSecond,
      moved: false,
      blocked: false,
      group: groupIds ? { ids: groupIds, bounds: groupMoveBounds(before, groupIds) } : null,
      laneTarget: null,
      laneRefusal: null,
      captureElement,
      ghostKey: null,
      timeLocked: false,
      release: () => {
        if (kind === 'move') {
          setClipLaneDrag(null);
        }
        releaseClaim();
      },
    };
    gestureRef.current = claimed;
    if (!groupIds) {
      selectClip(clip.id);
    }
    setActiveTrack(clip.trackId);
    if (kind !== 'range') {
      setTimeRange(null);
    }
    try {
      captureElement.setPointerCapture(event.pointerId);
    } catch {
      const gesture = gestureRef.current;
      if (gesture) {
        watchUncapturedPointerGesture(gesture, () => {
          if (gestureRef.current === gesture) {
            endStaleClipGesture(gesture);
            return;
          }
          gesture.release();
        });
      }
    }
  };

  const publishLaneGhosts = (gesture: ClipGesture, ghosts: ClipLaneGhost[]) => {
    const timeLocked = gesture.timeLocked;
    const key = JSON.stringify([ghosts, timeLocked]);
    if (gesture.ghostKey === key) {
      return;
    }
    gesture.ghostKey = key;
    setClipLaneDrag({ ghosts, timeLocked });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - gesture.startX;
    const dy = gesture.kind === 'move' ? event.clientY - gesture.startY : 0;
    if (!gesture.moved && Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) {
      return;
    }
    gesture.moved = true;
    const timeLocked = gesture.kind === 'move' && event.shiftKey;
    gesture.timeLocked = timeLocked;
    const delta = timeLocked ? 0 : dx / pxPerSecond;
    const fadeEdge = clipFadeGestureEdge(gesture.kind);
    if (fadeEdge) {
      const startSeconds = clipFadeSeconds(gesture.original, fadeEdge);
      const otherSeconds = clipFadeSeconds(gesture.original, fadeEdge === 'in' ? 'out' : 'in');
      const seconds = Math.min(
        Math.max(0, gesture.original.duration - otherSeconds),
        Math.max(0, roundTime(startSeconds + (fadeEdge === 'in' ? delta : -delta))),
      );
      const next = setFade(gesture.before, gesture.original.id, fadeEdge, seconds);
      previewArrangement(next);
      const faded = next.clips.find((entry) => entry.id === gesture.original.id);
      setStatus(
        studioClipStrings.fadePreview(
          fadeLabels[fadeEdge],
          (faded ? clipFadeSeconds(faded, fadeEdge) : 0).toFixed(3),
        ),
      );
      return;
    }
    const step = resolveSnapStep(snapSeconds, gridSeconds, event.altKey);
    const snapStep = timeLocked ? null : step;
    const original = gesture.original;
    const root = rootRef.current;
    const hoverTrackId =
      gesture.kind === 'move' && !isVideo && root
        ? (laneTrackIdAtPointer(root, event.clientY) ??
          gesture.laneTarget?.trackId ??
          original.trackId)
        : original.trackId;
    const isCrossLane = hoverTrackId !== original.trackId;
    if (gesture.group) {
      const { requested, allowed } = groupDeltaOnGrid(
        original,
        delta,
        snapStep,
        gesture.group,
        gesture.before.clips,
        hoverTrackId,
        markerSnapTimes(gesture.before),
      );
      if (isCrossLane) {
        const plan = planClipLaneMove(gesture.before, {
          clipIds: gesture.group.ids,
          anchorClipId: original.id,
          targetTrackId: hoverTrackId,
          timeDelta: requested,
        });
        if (plan.arrangement) {
          gesture.laneTarget = {
            trackId: hoverTrackId,
            arrangement: plan.arrangement,
            placements: plan.placements,
          };
          gesture.blocked = false;
          previewArrangement(gesture.before);
          publishLaneGhosts(gesture, laneGhostsFrom(plan.placements, false, null));
          return;
        }
        const message = CLIP_LANE_REFUSAL_MESSAGES[plan.refusal ?? 'overlap'];
        gesture.laneTarget = null;
        setStatus(message);
        if (plan.refusal === 'before-start' || plan.refusal === 'out-of-range') {
          publishLaneGhosts(gesture, []);
        } else {
          const shown = planClipLaneMove(gesture.before, {
            clipIds: gesture.group.ids,
            anchorClipId: original.id,
            targetTrackId: hoverTrackId,
            timeDelta: allowed,
          });
          publishLaneGhosts(gesture, laneGhostsFrom(shown.placements, true, message));
        }
      } else {
        gesture.laneTarget = null;
        publishLaneGhosts(gesture, []);
      }
      gesture.blocked = Math.abs(allowed - requested) > 1e-9;
      if (gesture.blocked && !isCrossLane) {
        setStatus(GROUP_MOVE_BLOCKED_MESSAGE);
      }
      const next = moveClips(gesture.before, gesture.group.ids, allowed);
      if (next) {
        previewArrangement(next);
      }
      return;
    }
    if (gesture.kind === 'move') {
      const targets = clipEdgeTargets(
        gesture.before.clips,
        original.id,
        hoverTrackId,
        markerSnapTimes(gesture.before),
      );
      const requestedStart = timeLocked
        ? original.start
        : moveStartOnGrid(
            original.start,
            delta,
            original.duration,
            snapStep,
            targets.startEdges,
            targets.endEdges,
          );
      const keptGhosts = gesture.laneTarget
        ? laneGhostsFrom(gesture.laneTarget.placements, false, null)
        : [];
      if (isCrossLane) {
        const plan = planClipLaneMove(gesture.before, {
          clipIds: [original.id],
          anchorClipId: original.id,
          targetTrackId: hoverTrackId,
          timeDelta: requestedStart - original.start,
        });
        if (plan.arrangement) {
          gesture.laneTarget = {
            trackId: hoverTrackId,
            arrangement: plan.arrangement,
            placements: plan.placements,
          };
          gesture.blocked = false;
          gesture.laneRefusal = null;
          previewArrangement(gesture.before);
          publishLaneGhosts(gesture, laneGhostsFrom(plan.placements, false, null));
          return;
        }
        const message = CLIP_LANE_REFUSAL_MESSAGES[plan.refusal ?? 'overlap'];
        gesture.blocked = true;
        gesture.laneRefusal = message;
        setStatus(message);
        publishLaneGhosts(gesture, [
          ...keptGhosts,
          ...laneGhostsFrom(plan.placements, true, message),
        ]);
        return;
      }
      const next = moveClip(gesture.before, original.id, requestedStart);
      gesture.laneRefusal = null;
      if (next) {
        gesture.blocked = false;
        gesture.laneTarget = null;
        previewArrangement(next);
        publishLaneGhosts(gesture, []);
      } else {
        gesture.blocked = true;
        setStatus(studioClipStrings.moveBlocked);
        publishLaneGhosts(gesture, keptGhosts);
      }
      return;
    }
    if (gesture.kind === 'trimStart' || gesture.kind === 'trimEnd') {
      const edge =
        gesture.kind === 'trimStart' ? original.start : original.start + original.duration;
      const requested =
        step === null
          ? roundTime(edge + delta)
          : snapTimeToGridOrEdges(
              edge + delta,
              step,
              clipEdgeTargets(
                gesture.before.clips,
                original.id,
                original.trackId,
                markerSnapTimes(gesture.before),
              )[gesture.kind === 'trimStart' ? 'startEdges' : 'endEdges'],
            );
      const next =
        gesture.kind === 'trimStart'
          ? trimClipStart(gesture.before, original.id, requested)
          : trimClipEnd(gesture.before, original.id, requested, sourceDurations);
      const trimmed = next.clips.find((entry) => entry.id === original.id) ?? original;
      const actual =
        gesture.kind === 'trimStart' ? trimmed.start : trimmed.start + trimmed.duration;
      gesture.blocked = Math.abs(actual - requested) > TRIM_BLOCK_TOLERANCE;
      if (gesture.blocked) {
        setStatus(
          gesture.kind === 'trimStart'
            ? studioClipStrings.trimStartBlocked
            : studioClipStrings.trimEndBlocked,
        );
      }
      previewArrangement(next);
      return;
    }
    const clipEnd = original.start + original.duration;
    const markers = markerSnapTimes(gesture.before);
    const onGrid = (time: number) =>
      step === null ? time : snapTimeToGridOrEdges(time, step, markers);
    const current = Math.min(clipEnd, Math.max(original.start, onGrid(gesture.anchorTime + delta)));
    const anchor = Math.min(clipEnd, Math.max(original.start, onGrid(gesture.anchorTime)));
    if (step !== null && Math.abs(current - anchor) < 1e-9) {
      setTimeRange(null);
      return;
    }
    setTimeRange({
      start: roundTime(Math.min(anchor, current)),
      end: roundTime(Math.max(anchor, current)),
      trackId: original.trackId,
    });
  };

  const finishGesture = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }
    const fadeEdge = clipFadeGestureEdge(gesture.kind);
    if (fadeEdge && event.type === 'pointercancel') {
      endStaleClipGesture(gesture);
    } else {
      gestureRef.current = null;
      gesture.release();
    }
    if (gesture.captureElement.hasPointerCapture(event.pointerId)) {
      gesture.captureElement.releasePointerCapture(event.pointerId);
    }
    if (fadeEdge) {
      if (gesture.moved) {
        lastFadeDragRef.current = { edge: fadeEdge, at: performance.now() };
      }
      if (!gesture.moved || event.type === 'pointercancel') {
        return;
      }
      const fadeLabel = fadeLabels[fadeEdge];
      if (!commitArrangement(getArrangement(), fadeLabel, gesture.before)) {
        setStatus(studioClipStrings.historyUnchanged(fadeLabel));
        return;
      }
      const faded = getArrangement().clips.find((entry) => entry.id === gesture.original.id);
      setStatus(
        studioClipStrings.fadeCommitted(
          fadeLabel,
          (faded ? clipFadeSeconds(faded, fadeEdge) : 0).toFixed(3),
        ),
      );
      return;
    }
    if (gesture.kind === 'range') {
      if (!gesture.moved) {
        setTimeRange(null);
        if (event.type !== 'pointercancel') {
          seekTo(
            resolveGridTimeWithTargets(
              gesture.anchorTime,
              snapSeconds,
              gridSeconds,
              event.altKey,
              markerSnapTimes(gesture.before),
            ),
          );
        }
      }
      return;
    }
    if (!gesture.moved) {
      return;
    }
    const laneTarget = gesture.kind === 'move' ? gesture.laneTarget : null;
    if (laneTarget) {
      const laneName =
        gesture.before.tracks.find((track) => track.id === laneTarget.trackId)?.name ??
        laneTarget.trackId;
      const laneLabel = gesture.group
        ? studioClipStrings.historyMoveClips(gesture.group.ids.length)
        : studioClipStrings.historyMoveToTrack(laneName);
      if (!commitArrangement(laneTarget.arrangement, laneLabel, gesture.before)) {
        setStatus(studioClipStrings.historyUnchanged(laneLabel));
        return;
      }
      const moved = laneTarget.placements.find((entry) => entry.clipId === gesture.original.id);
      setStatus(
        `${laneLabel}: start ${formatArrangementTime(moved?.start ?? gesture.original.start)}.`,
      );
      return;
    }
    const label = gesture.group
      ? studioClipStrings.historyMoveClips(gesture.group.ids.length)
      : gesture.kind === 'move'
        ? studioClipStrings.historyMoveClip
        : gesture.kind === 'trimStart'
          ? studioClipStrings.trimStartLabel
          : studioClipStrings.trimEndLabel;
    const committed = commitArrangement(getArrangement(), label, gesture.before);
    if (!committed) {
      setStatus(studioClipStrings.historyUnchanged(label));
      return;
    }
    const updated = getArrangement().clips.find((entry) => entry.id === gesture.original.id);
    if (gesture.group) {
      if (updated && !gesture.blocked) {
        setStatus(
          (updated.start >= gesture.original.start
            ? studioClipStrings.groupMovedRight
            : studioClipStrings.groupMovedLeft)({
            label,
            count: gesture.group.ids.length,
            distance: formatArrangementTime(Math.abs(updated.start - gesture.original.start)),
          }),
        );
      }
      return;
    }
    if (updated && gesture.blocked && gesture.kind === 'move' && gesture.laneRefusal) {
      const laneName =
        gesture.before.tracks.find((track) => track.id === updated.trackId)?.name ??
        updated.trackId;
      setStatus(
        `${gesture.laneRefusal} — ${CLIP_LANE_REFUSAL_KEPT_PLACE}: ${laneName}, start ${formatArrangementTime(updated.start)}.`,
      );
      return;
    }
    if (updated && !gesture.blocked) {
      setStatus(
        `${label}: start ${formatArrangementTime(updated.start)}, length ${formatArrangementTime(updated.duration)}, source offset ${formatArrangementTime(updated.sourceOffset)}.`,
      );
    }
  };

  const resetClipFade = (edge: ClipFadeEdge, event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const lastFadeDrag = lastFadeDragRef.current;
    if (
      lastFadeDrag?.edge === edge &&
      performance.now() - lastFadeDrag.at < CLIP_DRAG_DOUBLE_CLICK_GUARD_MS
    ) {
      return;
    }
    const before = getArrangement();
    const next = setFade(before, clip.id, edge, 0);
    if (next === before) {
      return;
    }
    const fadeLabel = fadeLabels[edge];
    if (commitArrangement(next, fadeLabel, before)) {
      setStatus(studioClipStrings.fadeCommitted(fadeLabel, '0.000'));
    }
  };

  const rangeLeft = range ? (range.start - clip.start) * pxPerSecond : 0;
  const rangeWidth = range ? (range.end - range.start) * pxPerSecond : 0;
  const fadeInSeconds = clipFadeIn(clip);
  const fadeOutSeconds = clipFadeOut(clip);
  const fadeInPx = fadeInSeconds * pxPerSecond;
  const fadeOutPx = fadeOutSeconds * pxPerSecond;
  const showFadeHandles = !folded && !envelopeMode && width >= FADE_HANDLE_MIN_CLIP_PX;
  const fadeTestIdPrefix = isVideo ? 'arrangement-video-fade' : 'arrangement-clip-fade';
  const fadeHandleTitles = isVideo ? VIDEO_FADE_HANDLE_TITLES : CLIP_FADE_HANDLE_TITLES;
  const fadeHandleMaxOffset = Math.max(0, width - CLIP_BORDER_PX - FADE_HANDLE_PX);
  const fadeHandles: {
    edge: ClipFadeEdge;
    side: 'left' | 'right';
    offset: number;
    active: boolean;
  }[] = [
    {
      edge: 'in',
      side: 'left',
      offset: Math.min(fadeHandleMaxOffset, Math.max(0, fadeInPx)),
      active: fadeInSeconds > 0,
    },
    {
      edge: 'out',
      side: 'right',
      offset: Math.min(fadeHandleMaxOffset, Math.max(0, fadeOutPx)),
      active: fadeOutSeconds > 0,
    },
  ];

  return (
    <div
      ref={rootRef}
      data-clip-id={clip.id}
      data-clip-kind={isVideo ? 'video' : 'audio'}
      data-clip-start={clip.start.toFixed(3)}
      data-fade-in={fadeInSeconds.toFixed(3)}
      data-fade-out={fadeOutSeconds.toFixed(3)}
      data-envelope={formatClipEnvelopeData(clip)}
      className={cn(
        'group absolute top-1 bottom-1 flex select-none flex-col overflow-hidden rounded-sm border',
        isVideo ? 'bg-muted-bg' : 'bg-elevated',
        isLaneMoveSource && 'opacity-40',
        isSelected ? 'z-10 border-brand ring-2 ring-brand' : 'border-outline-hover',
      )}
      style={{ left: clip.start * pxPerSecond, width: Math.max(2, width) }}
      title={folded ? `${title}\n${CLIP_FOLDED_TITLE_LINE}` : undefined}
      onPointerMove={handlePointerMove}
      onPointerUp={finishGesture}
      onPointerCancel={finishGesture}
    >
      <div
        className={cn(
          'flex h-5 shrink-0 cursor-grab items-center gap-0.75 truncate px-2 text-xs font-medium active:cursor-grabbing',
          isSelected
            ? 'bg-brand text-brand-foreground'
            : isVideo
              ? 'bg-foreground/15 text-foreground'
              : 'bg-muted-bg text-foreground',
        )}
        title={
          folded
            ? `${studioClipStrings.moveTitle(title)}\n${CLIP_FOLDED_TITLE_LINE}`
            : studioClipStrings.moveTitle(title)
        }
        onPointerDown={(event) => beginGesture('move', event)}
      >
        {isVideo ? (
          <Film className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
        ) : (
          <GripVertical className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
        )}
        <span className="truncate">{title}</span>
      </div>
      {folded ? null : (
        <div
          className="relative min-h-0 flex-1 cursor-text text-muted/70"
          title={studioClipStrings.rangeBodyTitle}
          onPointerDown={(event) => beginGesture('range', event)}
        >
          <ArrangementPeakPath
            clip={clip}
            peaks={peaks}
            columns={peakColumns}
            isVideo={isVideo}
            zoom={waveformZoom}
            testId="arrangement-clip-waveform"
          />
          {fadeInPx > 0 || fadeOutPx > 0 ? (
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full text-foreground"
              viewBox={`0 0 ${Math.max(1, width)} 1`}
              preserveAspectRatio="none"
              aria-hidden="true"
              data-testid={`${fadeTestIdPrefix}-ramps`}
            >
              {fadeInPx > 0 ? (
                <path
                  d={`M0 0L0 1L${fadeInPx} 0Z`}
                  fill="currentColor"
                  fillOpacity={0.15}
                  stroke="currentColor"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
              {fadeOutPx > 0 ? (
                <path
                  d={`M${width} 0L${width} 1L${width - fadeOutPx} 0Z`}
                  fill="currentColor"
                  fillOpacity={0.15}
                  stroke="currentColor"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
            </svg>
          ) : null}
          {isVideo ? null : (
            <ArrangementClipEnvelope
              clip={clip}
              pxPerSecond={pxPerSecond}
              width={width}
              editing={envelopeMode && width >= FADE_HANDLE_MIN_CLIP_PX}
              getArrangement={getArrangement}
              previewArrangement={previewArrangement}
              commitArrangement={commitArrangement}
              selectClip={selectClip}
              toggleClipSelection={toggleClipSelection}
              setActiveTrack={setActiveTrack}
              setTimeRange={setTimeRange}
              setStatus={setStatus}
              claimPointerGesture={claimPointerGesture}
              watchLostPointer={watchUncapturedPointerGesture}
            />
          )}
          {audioNote ? (
            <span className="pointer-events-none absolute inset-0 flex items-center truncate px-2 text-xs text-muted">
              {audioNote}
            </span>
          ) : null}
          {range ? (
            <div
              className="pointer-events-none absolute inset-y-0 border-x-2 border-foreground bg-foreground/30"
              style={{ left: rangeLeft, width: Math.max(2, rangeWidth) }}
            >
              <span className="absolute top-0 left-0 whitespace-nowrap rounded-br-sm bg-foreground px-1 text-xs font-medium text-background">
                <span className="font-mono font-normal tabular-nums">
                  {formatArrangementTime(range.start)}
                </span>{' '}
                –{' '}
                <span className="font-mono font-normal tabular-nums">
                  {formatArrangementTime(range.end)}
                </span>{' '}
                · {studioClipStrings.seconds((range.end - range.start).toFixed(3))}
              </span>
            </div>
          ) : null}
          {showFadeHandles
            ? fadeHandles.map(({ edge, side, offset, active }) => (
                <div
                  key={edge}
                  data-testid={`${fadeTestIdPrefix}-${edge}-handle`}
                  className={cn(
                    'absolute top-0 size-2.5 cursor-ew-resize rounded-xs border border-foreground bg-background',
                    active ? 'z-40' : 'z-30',
                    active || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                  )}
                  style={side === 'left' ? { left: offset } : { right: offset }}
                  title={fadeHandleTitles[edge]}
                  onPointerDown={(event) =>
                    beginGesture(edge === 'in' ? 'fadeIn' : 'fadeOut', event)
                  }
                  onDoubleClick={(event) => resetClipFade(edge, event)}
                />
              ))
            : null}
        </div>
      )}
      <div
        className="absolute inset-y-0 left-0 z-20 w-2 cursor-ew-resize hover:bg-foreground/50"
        title={studioClipStrings.trimStartLabel}
        onPointerDown={(event) => beginGesture('trimStart', event)}
      />
      <div
        className="absolute inset-y-0 right-0 z-20 w-2 cursor-ew-resize hover:bg-foreground/50"
        title={studioClipStrings.trimEndLabel}
        onPointerDown={(event) => beginGesture('trimEnd', event)}
      />
    </div>
  );
}

export const ArrangementClipView = memo(ArrangementClipViewInner);
