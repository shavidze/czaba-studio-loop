import { memo, type PointerEvent, useEffect, useMemo, useRef } from 'react';
import {
  type ClipLaneDragState,
  type ClipLaneGhost,
  formatArrangementTime,
} from '~/contexts/ArrangementContext';
import {
  clipEdgeTargets,
  resolveGridTimeWithTargets,
  resolveSnapStep,
  snapGroupMoveDelta,
  snapMoveStartToGridOrEdges,
  snapTimeToGridOrEdges,
} from '~/lib/arrangement/grid';
import { markerSnapTimes } from '~/lib/arrangement/markers';
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
import { cn } from '~/lib/utils';
import type { Arrangement, ArrangementClip, TimeRange } from '~/types/arrangement';

const DRAG_THRESHOLD_PX = 3;
const TRIM_BLOCK_TOLERANCE = 0.01;
const PEAK_SHAPE_MAX_COLUMNS = 4096;
const CLIP_FOLDED_TITLE_LINE = 'ხაზი დაკეცილია — დროის მოსანიშნად გაშალე';

type ClipGestureKind = 'move' | 'trimStart' | 'trimEnd' | 'range';

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
}

function roundTime(value: number): number {
  return Math.round(value * 1000) / 1000;
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
  const parts: string[] = [];
  for (let column = 0; column < count; column++) {
    const start = from + Math.floor(column * perColumn);
    const end = Math.max(start + 1, from + Math.floor((column + 1) * perColumn));
    let max = 0;
    for (let i = start; i < end && i < to; i++) {
      max = Math.max(max, peaks[i]);
    }
    const height = Math.max(0.02, Math.min(1, max));
    parts.push(`M${column} ${(1 - height).toFixed(3)}h1V${(1 + height).toFixed(3)}h-1Z`);
  }
  return { columns: count, path: parts.join('') };
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
}: ArrangementClipViewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<ClipGesture | null>(null);
  const width = clip.duration * pxPerSecond;
  const peakColumns = Math.round(Math.min(width, PEAK_SHAPE_MAX_COLUMNS));
  const peakShape = useMemo(
    () => buildPeakShape(peaks, clip.sourceOffset, clip.duration, peakColumns),
    [peaks, clip.sourceOffset, clip.duration, peakColumns],
  );

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
      root.setPointerCapture(event.pointerId);
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
          previewArrangement(gesture.before);
          publishLaneGhosts(gesture, laneGhostsFrom(plan.placements, false, null));
          return;
        }
        const message = CLIP_LANE_REFUSAL_MESSAGES[plan.refusal ?? 'overlap'];
        gesture.blocked = true;
        setStatus(message);
        publishLaneGhosts(gesture, [
          ...keptGhosts,
          ...laneGhostsFrom(plan.placements, true, message),
        ]);
        return;
      }
      const next = moveClip(gesture.before, original.id, requestedStart);
      if (next) {
        gesture.blocked = false;
        gesture.laneTarget = null;
        previewArrangement(next);
        publishLaneGhosts(gesture, []);
      } else {
        gesture.blocked = true;
        setStatus(
          'გადატანა დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი. კლიპი ბოლო თავისუფალ ადგილას დარჩა.',
        );
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
            ? 'Trim შეჩერდა: წყაროს დასაწყისი, მეზობელი კლიპი ან მინიმალური სიგრძე (0.05 წმ).'
            : 'Trim შეჩერდა: წყაროს დასასრული, მეზობელი კლიპი ან მინიმალური სიგრძე (0.05 წმ).',
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
    gestureRef.current = null;
    gesture.release();
    if (rootRef.current?.hasPointerCapture(event.pointerId)) {
      rootRef.current.releasePointerCapture(event.pointerId);
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
        ? `გადატანა (${gesture.group.ids.length})`
        : `გადატანა ხაზზე — ${laneName}`;
      if (!commitArrangement(laneTarget.arrangement, laneLabel, gesture.before)) {
        setStatus(`${laneLabel}: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`);
        return;
      }
      const moved = laneTarget.placements.find((entry) => entry.clipId === gesture.original.id);
      setStatus(
        `${laneLabel}: start ${formatArrangementTime(moved?.start ?? gesture.original.start)}.`,
      );
      return;
    }
    const label = gesture.group
      ? `გადატანა (${gesture.group.ids.length})`
      : gesture.kind === 'move'
        ? 'კლიპის გადატანა'
        : gesture.kind === 'trimStart'
          ? 'Trim — მარცხენა კიდე'
          : 'Trim — მარჯვენა კიდე';
    const committed = commitArrangement(getArrangement(), label, gesture.before);
    if (!committed) {
      setStatus(`${label}: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`);
      return;
    }
    const updated = getArrangement().clips.find((entry) => entry.id === gesture.original.id);
    if (gesture.group) {
      if (updated && !gesture.blocked) {
        setStatus(
          `${label}: ${gesture.group.ids.length} კლიპი გადავიდა ${formatArrangementTime(Math.abs(updated.start - gesture.original.start))}-ით ${updated.start >= gesture.original.start ? 'მარჯვნივ' : 'მარცხნივ'}.`,
        );
      }
      return;
    }
    if (updated && !gesture.blocked) {
      setStatus(
        `${label}: start ${formatArrangementTime(updated.start)}, length ${formatArrangementTime(updated.duration)}, source offset ${formatArrangementTime(updated.sourceOffset)}.`,
      );
    }
  };

  const rangeLeft = range ? (range.start - clip.start) * pxPerSecond : 0;
  const rangeWidth = range ? (range.end - range.start) * pxPerSecond : 0;

  return (
    <div
      ref={rootRef}
      data-clip-id={clip.id}
      data-clip-kind={isVideo ? 'video' : 'audio'}
      data-clip-start={clip.start.toFixed(3)}
      className={cn(
        'absolute top-1 bottom-1 flex select-none flex-col overflow-hidden rounded-sm border',
        isVideo ? 'bg-accent/10' : 'bg-elevated',
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
          'flex h-5 shrink-0 cursor-grab items-center gap-1 truncate px-2 text-xs font-medium active:cursor-grabbing',
          isSelected
            ? 'bg-brand text-brand-foreground'
            : isVideo
              ? 'bg-accent/30 text-foreground'
              : 'bg-muted-bg text-foreground',
        )}
        title={
          folded ? `${title} — გადაადგილება\n${CLIP_FOLDED_TITLE_LINE}` : `${title} — გადაადგილება`
        }
        onPointerDown={(event) => beginGesture('move', event)}
      >
        <span aria-hidden="true">{isVideo ? '▶' : '⠿'}</span>
        <span className="truncate">{title}</span>
      </div>
      {folded ? null : (
        <div
          className={cn(
            'relative min-h-0 flex-1 cursor-text',
            isVideo ? 'text-accent/70' : 'text-brand/70',
          )}
          title="drag = დროის მონიშვნა · click = playhead"
          onPointerDown={(event) => beginGesture('range', event)}
        >
          {peakShape ? (
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 0 ${peakShape.columns} 2`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d={peakShape.path} fill="currentColor" />
            </svg>
          ) : null}
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
                {formatArrangementTime(range.start)} – {formatArrangementTime(range.end)} ·{' '}
                {(range.end - range.start).toFixed(3)} წმ
              </span>
            </div>
          ) : null}
        </div>
      )}
      <div
        className="absolute inset-y-0 left-0 z-20 w-2 cursor-ew-resize hover:bg-accent/60"
        title="Trim — მარცხენა კიდე"
        onPointerDown={(event) => beginGesture('trimStart', event)}
      />
      <div
        className="absolute inset-y-0 right-0 z-20 w-2 cursor-ew-resize hover:bg-accent/60"
        title="Trim — მარჯვენა კიდე"
        onPointerDown={(event) => beginGesture('trimEnd', event)}
      />
    </div>
  );
}

export const ArrangementClipView = memo(ArrangementClipViewInner);
