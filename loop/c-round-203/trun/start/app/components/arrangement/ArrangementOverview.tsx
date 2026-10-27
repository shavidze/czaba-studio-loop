import { type KeyboardEvent, memo, type PointerEvent, useCallback, useEffect, useRef } from 'react';
import { formatArrangementTime, useArrangementPositionStore } from '~/contexts/ArrangementContext';
import { studioViewStrings } from '~/lib/arrangement/strings';
import {
  centreTimelineView,
  overviewDragView,
  overviewFrame,
  overviewTimeAt,
  TIMELINE_DRAG_THRESHOLD_PX,
  TIMELINE_OVERVIEW_PAN_SECONDS,
  type TimelineView,
} from '~/lib/arrangement/view';
import { cn } from '~/lib/utils';
import type { Arrangement } from '~/types/arrangement';
import { watchUncapturedPointerGesture } from './ArrangementClip';

const OVERVIEW_AUDIO_BAR_CLASSES = ['bg-foreground/80', 'bg-muted/60', 'bg-dim'] as const;
const OVERVIEW_VIDEO_BAR_CLASS = 'bg-foreground/25';
const OVERVIEW_DOUBLE_CLICK_AFTER_DRAG_MS = 300;

interface ArrangementOverviewProps {
  arrangement: Arrangement;
  extent: number;
  pxPerSecond: number;
  getTimelineView: () => TimelineView;
  getTimelineViewportPx: () => number;
  subscribeTimelineScroll: (listener: () => void) => () => void;
  applyTimelineView: (view: TimelineView) => void;
  onNavigationMove: () => void;
  onFit: () => void;
  claimPointerGesture: (pointerId: number, abort: () => void) => (() => void) | null;
}

interface OverviewDrag {
  pointerId: number;
  startX: number;
  startY: number;
  start: TimelineView;
  anchorTime: number;
  anchorScreenX: number;
  widthPx: number;
  moved: boolean;
  dx: number;
  dy: number;
  frame: number | null;
  release: () => void;
}

function overviewBarClass(arrangement: Arrangement, trackId: string): string {
  const track = arrangement.tracks.find((entry) => entry.id === trackId);
  if (!track || track.kind === 'video') {
    return OVERVIEW_VIDEO_BAR_CLASS;
  }
  const audioIndex = arrangement.tracks
    .filter((entry) => entry.kind === 'audio')
    .findIndex((entry) => entry.id === trackId);
  return OVERVIEW_AUDIO_BAR_CLASSES[Math.min(audioIndex, OVERVIEW_AUDIO_BAR_CLASSES.length - 1)];
}

function overviewValueText(visibleStart: number, extent: number): string {
  return studioViewStrings.overviewVisibleStart({
    start: formatArrangementTime(visibleStart),
    extent: formatArrangementTime(extent),
  });
}

function ArrangementOverviewInner({
  arrangement,
  extent,
  pxPerSecond,
  getTimelineView,
  getTimelineViewportPx,
  subscribeTimelineScroll,
  applyTimelineView,
  onNavigationMove,
  onFit,
  claimPointerGesture,
}: ArrangementOverviewProps) {
  const positionStore = useArrangementPositionStore();
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<OverviewDrag | null>(null);
  const dragEndedAtRef = useRef(Number.NEGATIVE_INFINITY);
  const visibleStartRef = useRef(0);

  const updateOverviewFrame = useCallback(() => {
    const frame = frameRef.current;
    const viewportPx = getTimelineViewportPx();
    if (!frame || viewportPx <= 0) {
      return;
    }
    const view = getTimelineView();
    const box = overviewFrame(view, viewportPx, extent);
    frame.style.left = `${box.left * 100}%`;
    frame.style.width = `${box.width * 100}%`;
    const visibleStart = Math.round(view.scrollLeft / view.pxPerSecond);
    const root = rootRef.current;
    if (root && visibleStart !== visibleStartRef.current) {
      visibleStartRef.current = visibleStart;
      root.setAttribute('aria-valuenow', String(Math.min(visibleStart, Math.round(extent))));
      root.setAttribute('aria-valuetext', overviewValueText(visibleStart, extent));
    }
  }, [extent, getTimelineView, getTimelineViewportPx]);

  const updateOverviewPlayhead = useCallback(() => {
    const playhead = playheadRef.current;
    if (playhead) {
      playhead.style.left = `${Math.min(1, positionStore.getPosition() / extent) * 100}%`;
    }
  }, [extent, positionStore]);

  useEffect(() => {
    if (pxPerSecond > 0) {
      updateOverviewFrame();
    }
    return subscribeTimelineScroll(updateOverviewFrame);
  }, [pxPerSecond, subscribeTimelineScroll, updateOverviewFrame]);

  useEffect(() => {
    updateOverviewPlayhead();
    return positionStore.subscribePosition(updateOverviewPlayhead);
  }, [positionStore, updateOverviewPlayhead]);

  useEffect(
    () => () => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (drag) {
        if (drag.frame !== null) {
          cancelAnimationFrame(drag.frame);
        }
        drag.release();
      }
    },
    [],
  );

  const applyOverviewDrag = (drag: OverviewDrag) => {
    drag.frame = null;
    applyTimelineView(
      overviewDragView({
        start: drag.start,
        anchorTime: drag.anchorTime,
        anchorScreenX: drag.anchorScreenX,
        dx: drag.dx,
        dy: drag.dy,
        overviewWidthPx: drag.widthPx,
        extent,
      }),
    );
  };

  const endOverviewDrag = (drag: OverviewDrag) => {
    if (dragRef.current === drag) {
      dragRef.current = null;
    }
    if (drag.frame !== null) {
      cancelAnimationFrame(drag.frame);
      applyOverviewDrag(drag);
    }
    if (drag.moved) {
      dragEndedAtRef.current = performance.now();
    }
    drag.release();
  };

  const handleOverviewPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.buttons === 0) {
      return;
    }
    let claimed: OverviewDrag | null = null;
    const releaseClaim = claimPointerGesture(event.pointerId, () => {
      if (claimed) {
        endOverviewDrag(claimed);
      }
    });
    if (!releaseClaim) {
      return;
    }
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    const rect = event.currentTarget.getBoundingClientRect();
    const viewportPx = getTimelineViewportPx();
    const time = overviewTimeAt(
      rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0,
      extent,
    );
    let start = getTimelineView();
    const shownFrom = start.scrollLeft / start.pxPerSecond;
    const shownTo = shownFrom + viewportPx / start.pxPerSecond;
    if (time < shownFrom || time > shownTo) {
      onNavigationMove();
      start = centreTimelineView(start, time, viewportPx);
      applyTimelineView(start);
    }
    const anchorTime = (start.scrollLeft + viewportPx / 2) / start.pxPerSecond;
    claimed = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      start,
      anchorTime,
      anchorScreenX: anchorTime * start.pxPerSecond - start.scrollLeft,
      widthPx: rect.width,
      moved: false,
      dx: 0,
      dy: 0,
      frame: null,
      release: releaseClaim,
    };
    dragRef.current = claimed;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      const drag = claimed;
      watchUncapturedPointerGesture(drag, () => endOverviewDrag(drag));
    }
  };

  const handleOverviewPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (
      !drag.moved &&
      Math.abs(dx) < TIMELINE_DRAG_THRESHOLD_PX &&
      Math.abs(dy) < TIMELINE_DRAG_THRESHOLD_PX
    ) {
      return;
    }
    if (!drag.moved) {
      drag.moved = true;
      onNavigationMove();
    }
    drag.dx = dx;
    drag.dy = dy;
    if (drag.frame === null) {
      drag.frame = requestAnimationFrame(() => applyOverviewDrag(drag));
    }
  };

  const handleOverviewPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    endOverviewDrag(drag);
  };

  const handleOverviewDoubleClick = () => {
    if (performance.now() - dragEndedAtRef.current < OVERVIEW_DOUBLE_CLICK_AFTER_DRAG_MS) {
      return;
    }
    onFit();
  };

  const handleOverviewKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const view = getTimelineView();
    const delta = TIMELINE_OVERVIEW_PAN_SECONDS * view.pxPerSecond;
    onNavigationMove();
    applyTimelineView({
      pxPerSecond: view.pxPerSecond,
      scrollLeft: Math.max(0, view.scrollLeft + (event.key === 'ArrowLeft' ? -delta : delta)),
    });
  };

  const roundedExtent = Math.round(extent);

  return (
    <div
      ref={rootRef}
      role="slider"
      tabIndex={0}
      aria-label={studioViewStrings.overviewLabel}
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={roundedExtent}
      aria-valuenow={Math.min(visibleStartRef.current, roundedExtent)}
      aria-valuetext={overviewValueText(visibleStartRef.current, extent)}
      title={studioViewStrings.overviewTitle}
      className="relative h-16 w-full cursor-ew-resize touch-none overflow-hidden rounded-panel bg-background"
      onPointerDown={handleOverviewPointerDown}
      onPointerMove={handleOverviewPointerMove}
      onPointerUp={handleOverviewPointerEnd}
      onPointerCancel={handleOverviewPointerEnd}
      onLostPointerCapture={handleOverviewPointerEnd}
      onDoubleClick={handleOverviewDoubleClick}
      onKeyDown={handleOverviewKeyDown}
      data-testid="arrangement-overview"
      data-timeline-overview=""
      data-extent={extent.toFixed(3)}
    >
      <div className="pointer-events-none absolute inset-0 rounded-panel border border-outline" />
      <div className="pointer-events-none absolute inset-x-0 inset-y-1 flex flex-col gap-0.5">
        {arrangement.tracks.map((track) => (
          <div key={track.id} className="relative min-h-0 flex-1">
            {arrangement.clips
              .filter((clip) => clip.trackId === track.id)
              .map((clip) => (
                <div
                  key={clip.id}
                  className={cn(
                    'absolute inset-y-0 rounded-xs',
                    overviewBarClass(arrangement, track.id),
                  )}
                  style={{
                    left: `${(clip.start / extent) * 100}%`,
                    width: `max(2px, ${(clip.duration / extent) * 100}%)`,
                  }}
                />
              ))}
          </div>
        ))}
      </div>
      <div
        ref={frameRef}
        className="pointer-events-none absolute inset-y-0 rounded-panel border border-foreground/70 bg-foreground/5"
        data-testid="arrangement-overview-frame"
      />
      <div
        ref={playheadRef}
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-accent ring-1 ring-background"
        data-testid="arrangement-overview-playhead"
      />
    </div>
  );
}

export const ArrangementOverview = memo(ArrangementOverviewInner);
