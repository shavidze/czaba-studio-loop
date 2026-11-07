import {
  type KeyboardEvent,
  memo,
  type PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import {
  formatArrangementTime,
  useArrangementPositionStore,
  useArrangementPositionWriter,
} from '~/contexts/ArrangementContext';
import { useRulerNavigation } from '~/hooks/useRulerNavigation';
import { resolveGridTimeWithTargets } from '~/lib/arrangement/grid';
import { studioViewStrings } from '~/lib/arrangement/strings';
import {
  getServerTimelinePageKey,
  parseTimelinePageKey,
  RULER_TICK_STEPS_SECONDS,
  readTimelinePage,
  rulerTickMarks,
  rulerTickStep,
  type TimelineView,
  timelinePageKey,
  timelinePageWindow,
} from '~/lib/arrangement/view';
import { watchUncapturedPointerGesture } from './ArrangementClip';

const PLAYHEAD_KEY_STEP_SECONDS = 0.1;
const NO_SNAP_MARKER_TIMES: readonly number[] = [];

function noSnapMarkerTimes(): readonly number[] {
  return NO_SNAP_MARKER_TIMES;
}

function noTimelineViewportPx(): number {
  return 0;
}

function noTimelineScrollSubscription(): () => void {
  return () => {};
}

interface ArrangementRulerProps {
  seconds: number;
  pxPerSecond: number;
  onSeek: (time: number) => void;
  onScrub: (time: number) => void;
  onScrubEnd: (time: number) => void;
  onGestureClaim: (pointerId: number, abort: () => void) => (() => void) | null;
  getTimelineView: () => TimelineView;
  applyTimelineView: (view: TimelineView) => void;
  onNavigationMove: () => void;
  onRulerDoubleClick: () => void;
  snapSeconds?: number | null;
  gridSeconds?: number;
  getSnapMarkerTimes?: () => readonly number[];
  getTimelineViewportPx?: () => number;
  subscribeTimelineScroll?: (listener: () => void) => () => void;
}

interface ArrangementRulerPlayheadProps extends ArrangementRulerProps {
  rulerRef: RefObject<HTMLDivElement | null>;
}

interface PlayheadDrag {
  pointerId: number;
  moved: boolean;
  time: number;
  release: () => void;
}

function ArrangementRulerPlayhead({
  seconds,
  pxPerSecond,
  rulerRef,
  onSeek,
  onScrub,
  onScrubEnd,
  onGestureClaim,
  snapSeconds = null,
  gridSeconds,
  getSnapMarkerTimes = noSnapMarkerTimes,
}: ArrangementRulerPlayheadProps) {
  const positionStore = useArrangementPositionStore();
  const dragRef = useRef<PlayheadDrag | null>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const position = positionStore.getPosition();
  const writeRulerPlayhead = useCallback(
    (next: number) => {
      const left = next * pxPerSecond;
      if (lineRef.current) {
        lineRef.current.style.left = `${left}px`;
      }
      const handle = handleRef.current;
      if (handle) {
        handle.style.left = `${left + 1}px`;
        handle.setAttribute('aria-valuenow', String(Math.round(next * 1000) / 1000));
        handle.setAttribute('aria-valuetext', formatArrangementTime(next));
      }
    },
    [pxPerSecond],
  );
  useArrangementPositionWriter(writeRulerPlayhead);

  useEffect(
    () => () => {
      const drag = dragRef.current;
      dragRef.current = null;
      drag?.release();
    },
    [],
  );

  const pointerTime = (clientX: number): number => {
    const rect = rulerRef.current?.getBoundingClientRect();
    return rect ? Math.max(0, (clientX - rect.left) / pxPerSecond) : positionStore.getPosition();
  };

  const endPlayheadDrag = (drag: PlayheadDrag) => {
    if (dragRef.current !== drag) {
      drag.release();
      return;
    }
    dragRef.current = null;
    drag.release();
    if (drag.moved) {
      onScrubEnd(drag.time);
    }
  };

  const handlePlayheadPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.buttons === 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    let claimed: PlayheadDrag | null = null;
    const releaseClaim = onGestureClaim(event.pointerId, () => {
      if (claimed) {
        endPlayheadDrag(claimed);
      }
    });
    if (!releaseClaim) {
      return;
    }
    event.currentTarget.focus();
    dragRef.current?.release();
    claimed = {
      pointerId: event.pointerId,
      moved: false,
      time: positionStore.getPosition(),
      release: releaseClaim,
    };
    dragRef.current = claimed;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      const drag = claimed;
      watchUncapturedPointerGesture(drag, () => endPlayheadDrag(drag));
    }
  };

  const handlePlayheadPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    drag.moved = true;
    drag.time = resolveGridTimeWithTargets(
      pointerTime(event.clientX),
      snapSeconds,
      gridSeconds,
      event.altKey,
      getSnapMarkerTimes(),
    );
    onScrub(drag.time);
  };

  const handlePlayheadPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    dragRef.current = null;
    drag.release();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag.moved) {
      onScrubEnd(
        event.type === 'pointerup'
          ? resolveGridTimeWithTargets(
              pointerTime(event.clientX),
              snapSeconds,
              gridSeconds,
              event.altKey,
              getSnapMarkerTimes(),
            )
          : drag.time,
      );
    }
  };

  const handlePlayheadKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    const delta =
      event.key === 'ArrowLeft' ? -PLAYHEAD_KEY_STEP_SECONDS : PLAYHEAD_KEY_STEP_SECONDS;
    onScrubEnd(Math.max(0, Math.round((positionStore.getPosition() + delta) * 1000) / 1000));
  };

  return (
    <>
      <div ref={lineRef} className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-accent" />
      <div
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label="Playhead"
        aria-valuemin={0}
        aria-valuemax={seconds}
        aria-valuenow={Math.round(position * 1000) / 1000}
        aria-valuetext={formatArrangementTime(position)}
        aria-orientation="horizontal"
        title={studioViewStrings.playheadTitle}
        className="absolute top-0 z-10 h-5 w-3 -translate-x-1/2 cursor-ew-resize touch-none rounded-b-sm bg-accent"
        onPointerDown={handlePlayheadPointerDown}
        onPointerMove={handlePlayheadPointerMove}
        onPointerUp={handlePlayheadPointerUp}
        onPointerCancel={handlePlayheadPointerUp}
        onLostPointerCapture={handlePlayheadPointerUp}
        onKeyDown={handlePlayheadKeyDown}
        data-testid="arrangement-playhead-handle"
      />
    </>
  );
}

function ArrangementRulerTicksInner({
  seconds,
  pxPerSecond,
  fromPx,
  toPx,
}: {
  seconds: number;
  pxPerSecond: number;
  fromPx: number | null;
  toPx: number | null;
}) {
  return (
    <>
      {rulerTickMarks(
        seconds,
        pxPerSecond,
        fromPx === null || toPx === null ? undefined : { fromPx, toPx },
      ).map((mark) => (
        <div
          key={mark.time}
          className="pointer-events-none absolute top-0 bottom-0 border-l border-outline"
          style={{ left: mark.time * pxPerSecond }}
          data-testid="arrangement-ruler-tick"
          data-time={String(Math.round(mark.time * 1e6) / 1e6)}
        >
          {mark.label === null ? null : (
            <span className="absolute top-1 left-1 whitespace-nowrap font-mono text-xs tabular-nums text-muted">
              {mark.label}
            </span>
          )}
        </div>
      ))}
    </>
  );
}

const ArrangementRulerTicks = memo(ArrangementRulerTicksInner);

export function ArrangementRuler(props: ArrangementRulerProps) {
  const {
    seconds,
    pxPerSecond,
    onSeek,
    onGestureClaim,
    getTimelineView,
    applyTimelineView,
    onNavigationMove,
    onRulerDoubleClick,
    snapSeconds = null,
    gridSeconds,
    getSnapMarkerTimes = noSnapMarkerTimes,
    getTimelineViewportPx = noTimelineViewportPx,
    subscribeTimelineScroll = noTimelineScrollSubscription,
  } = props;
  const rulerRef = useRef<HTMLDivElement>(null);
  const getRulerPageKey = useCallback(
    () => timelinePageKey(readTimelinePage(getTimelineView, getTimelineViewportPx)),
    [getTimelineView, getTimelineViewportPx],
  );
  const rulerWindow = timelinePageWindow(
    parseTimelinePageKey(
      useSyncExternalStore(subscribeTimelineScroll, getRulerPageKey, getServerTimelinePageKey),
    ),
  );
  const step = rulerTickStep(pxPerSecond);
  const fractionDigits = step < RULER_TICK_STEPS_SECONDS[1] ? 1 : 0;
  const navigation = useRulerNavigation({
    onGestureClaim,
    getTimelineView,
    applyTimelineView,
    onNavigationMove,
    onRulerDoubleClick,
    onRulerClick: (anchorTime, { altKey }) => {
      onSeek(
        resolveGridTimeWithTargets(
          anchorTime,
          snapSeconds,
          gridSeconds,
          altKey,
          getSnapMarkerTimes(),
        ),
      );
    },
  });

  return (
    <div
      ref={rulerRef}
      className="relative h-7 shrink-0 cursor-pointer touch-none border-b border-outline bg-surface"
      style={{ width: seconds * pxPerSecond }}
      onPointerDown={navigation.onPointerDown}
      onPointerMove={navigation.onPointerMove}
      onPointerUp={navigation.onPointerUp}
      onPointerCancel={navigation.onPointerCancel}
      onLostPointerCapture={navigation.onLostPointerCapture}
      onDoubleClick={navigation.onDoubleClick}
      role="presentation"
      title={studioViewStrings.rulerTitle}
      data-testid="arrangement-ruler"
      data-tick-step={step.toFixed(fractionDigits)}
    >
      <ArrangementRulerTicks
        seconds={seconds}
        pxPerSecond={pxPerSecond}
        fromPx={rulerWindow === undefined ? null : rulerWindow.fromPx}
        toPx={rulerWindow === undefined ? null : rulerWindow.toPx}
      />
      <ArrangementRulerPlayhead {...props} rulerRef={rulerRef} />
    </div>
  );
}
