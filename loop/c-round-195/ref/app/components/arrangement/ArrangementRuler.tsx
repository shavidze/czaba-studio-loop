import {
  type KeyboardEvent,
  memo,
  type PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  formatArrangementTime,
  useArrangementPositionStore,
  useArrangementPositionWriter,
} from '~/contexts/ArrangementContext';
import { resolveGridTimeWithTargets } from '~/lib/arrangement/grid';
import { studioViewStrings } from '~/lib/arrangement/strings';
import {
  RULER_TICK_STEPS_SECONDS,
  rulerDragView,
  rulerTickMarks,
  rulerTickStep,
  TIMELINE_DRAG_THRESHOLD_PX,
  type TimelineView,
} from '~/lib/arrangement/view';
import { watchUncapturedPointerGesture } from './ArrangementClip';

const PLAYHEAD_KEY_STEP_SECONDS = 0.1;
const RULER_DOUBLE_CLICK_AFTER_DRAG_MS = 300;
const NO_SNAP_MARKER_TIMES: readonly number[] = [];

function noSnapMarkerTimes(): readonly number[] {
  return NO_SNAP_MARKER_TIMES;
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

interface RulerNavigation {
  pointerId: number;
  startX: number;
  startY: number;
  start: TimelineView;
  anchorTime: number;
  anchorScreenX: number;
  moved: boolean;
  dx: number;
  dy: number;
  frame: number | null;
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
    onSeek(Math.max(0, Math.round((positionStore.getPosition() + delta) * 1000) / 1000));
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
        className="absolute top-0 z-10 h-5 w-3 -translate-x-1/2 cursor-ew-resize touch-none rounded-b-sm bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
}: {
  seconds: number;
  pxPerSecond: number;
}) {
  return (
    <>
      {rulerTickMarks(seconds, pxPerSecond).map((mark) => (
        <div
          key={mark.time}
          className="pointer-events-none absolute top-0 bottom-0 border-l border-outline"
          style={{ left: mark.time * pxPerSecond }}
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
  } = props;
  const rulerRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<RulerNavigation | null>(null);
  const navigationEndedAtRef = useRef(Number.NEGATIVE_INFINITY);
  const step = rulerTickStep(pxPerSecond);
  const fractionDigits = step < RULER_TICK_STEPS_SECONDS[1] ? 1 : 0;

  useEffect(
    () => () => {
      const navigation = navigationRef.current;
      navigationRef.current = null;
      if (navigation) {
        if (navigation.frame !== null) {
          cancelAnimationFrame(navigation.frame);
        }
        navigation.release();
      }
    },
    [],
  );

  const applyRulerNavigation = (navigation: RulerNavigation) => {
    navigation.frame = null;
    applyTimelineView(
      rulerDragView({
        start: navigation.start,
        anchorTime: navigation.anchorTime,
        anchorScreenX: navigation.anchorScreenX,
        dx: navigation.dx,
        dy: navigation.dy,
      }),
    );
  };

  const endRulerNavigation = (navigation: RulerNavigation, seek: boolean, bypass = false) => {
    if (navigationRef.current === navigation) {
      navigationRef.current = null;
    }
    if (navigation.frame !== null) {
      cancelAnimationFrame(navigation.frame);
      applyRulerNavigation(navigation);
    }
    navigation.release();
    if (navigation.moved) {
      navigationEndedAtRef.current = performance.now();
      return;
    }
    if (seek) {
      onSeek(
        resolveGridTimeWithTargets(
          navigation.anchorTime,
          snapSeconds,
          gridSeconds,
          bypass,
          getSnapMarkerTimes(),
        ),
      );
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.buttons === 0) {
      return;
    }
    let claimed: RulerNavigation | null = null;
    const releaseClaim = onGestureClaim(event.pointerId, () => {
      if (claimed) {
        endRulerNavigation(claimed, false);
      }
    });
    if (!releaseClaim) {
      return;
    }
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const start = getTimelineView();
    const anchorTime = Math.max(0, (event.clientX - rect.left) / start.pxPerSecond);
    claimed = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      start,
      anchorTime,
      anchorScreenX: anchorTime * start.pxPerSecond - start.scrollLeft,
      moved: false,
      dx: 0,
      dy: 0,
      frame: null,
      release: releaseClaim,
    };
    navigationRef.current = claimed;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      const navigation = claimed;
      watchUncapturedPointerGesture(navigation, () => endRulerNavigation(navigation, false));
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const navigation = navigationRef.current;
    if (!navigation || navigation.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - navigation.startX;
    const dy = event.clientY - navigation.startY;
    if (
      !navigation.moved &&
      Math.abs(dx) < TIMELINE_DRAG_THRESHOLD_PX &&
      Math.abs(dy) < TIMELINE_DRAG_THRESHOLD_PX
    ) {
      return;
    }
    if (!navigation.moved) {
      navigation.moved = true;
      onNavigationMove();
    }
    navigation.dx = dx;
    navigation.dy = dy;
    if (navigation.frame === null) {
      navigation.frame = requestAnimationFrame(() => applyRulerNavigation(navigation));
    }
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const navigation = navigationRef.current;
    if (!navigation || navigation.pointerId !== event.pointerId) {
      return;
    }
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    endRulerNavigation(navigation, event.type === 'pointerup', event.altKey);
  };

  const handleDoubleClick = () => {
    if (performance.now() - navigationEndedAtRef.current < RULER_DOUBLE_CLICK_AFTER_DRAG_MS) {
      return;
    }
    onRulerDoubleClick();
  };

  return (
    <div
      ref={rulerRef}
      className="relative h-7 shrink-0 cursor-pointer touch-none border-b border-outline bg-surface"
      style={{ width: seconds * pxPerSecond }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
      onDoubleClick={handleDoubleClick}
      role="presentation"
      title={studioViewStrings.rulerTitle}
      data-testid="arrangement-ruler"
      data-tick-step={step.toFixed(fractionDigits)}
    >
      <ArrangementRulerTicks seconds={seconds} pxPerSecond={pxPerSecond} />
      <ArrangementRulerPlayhead {...props} rulerRef={rulerRef} />
    </div>
  );
}
