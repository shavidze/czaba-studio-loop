import { type PointerEvent, useEffect, useRef } from 'react';
import { watchUncapturedPointerGesture } from '~/components/arrangement/ArrangementClip';
import {
  rulerDragView,
  TIMELINE_DRAG_THRESHOLD_PX,
  type TimelineView,
} from '~/lib/arrangement/view';

const RULER_DOUBLE_CLICK_AFTER_DRAG_MS = 300;

export interface RulerClickInfo {
  altKey: boolean;
  pressTarget: EventTarget | null;
}

export interface RulerNavigationOptions {
  onGestureClaim: (pointerId: number, abort: () => void) => (() => void) | null;
  getTimelineView: () => TimelineView;
  applyTimelineView: (view: TimelineView) => void;
  onNavigationMove: () => void;
  onRulerDoubleClick: () => void;
  onRulerClick: (anchorTime: number, info: RulerClickInfo) => void;
}

export interface RulerNavigationHandlers {
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void;
  onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => void;
  onDoubleClick: () => void;
}

interface RulerNavigation {
  pointerId: number;
  startX: number;
  startY: number;
  start: TimelineView;
  anchorTime: number;
  anchorScreenX: number;
  pressTarget: EventTarget | null;
  moved: boolean;
  dx: number;
  dy: number;
  frame: number | null;
  release: () => void;
}

export function useRulerNavigation(options: RulerNavigationOptions): RulerNavigationHandlers {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const navigationRef = useRef<RulerNavigation | null>(null);
  const navigationEndedAtRef = useRef(Number.NEGATIVE_INFINITY);

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
    optionsRef.current.applyTimelineView(
      rulerDragView({
        start: navigation.start,
        anchorTime: navigation.anchorTime,
        anchorScreenX: navigation.anchorScreenX,
        dx: navigation.dx,
        dy: navigation.dy,
      }),
    );
  };

  const endRulerNavigation = (navigation: RulerNavigation, click: boolean, altKey = false) => {
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
    if (click) {
      optionsRef.current.onRulerClick(navigation.anchorTime, {
        altKey,
        pressTarget: navigation.pressTarget,
      });
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.buttons === 0) {
      return;
    }
    let claimed: RulerNavigation | null = null;
    const releaseClaim = optionsRef.current.onGestureClaim(event.pointerId, () => {
      if (claimed) {
        endRulerNavigation(claimed, false);
      }
    });
    if (!releaseClaim) {
      return;
    }
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const start = optionsRef.current.getTimelineView();
    const anchorTime = Math.max(0, (event.clientX - rect.left) / start.pxPerSecond);
    claimed = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      start,
      anchorTime,
      anchorScreenX: anchorTime * start.pxPerSecond - start.scrollLeft,
      pressTarget: event.target,
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

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
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
      optionsRef.current.onNavigationMove();
    }
    navigation.dx = dx;
    navigation.dy = dy;
    if (navigation.frame === null) {
      navigation.frame = requestAnimationFrame(() => applyRulerNavigation(navigation));
    }
  };

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const navigation = navigationRef.current;
    if (!navigation || navigation.pointerId !== event.pointerId) {
      return;
    }
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    endRulerNavigation(navigation, event.type === 'pointerup', event.altKey);
  };

  const onDoubleClick = () => {
    if (performance.now() - navigationEndedAtRef.current < RULER_DOUBLE_CLICK_AFTER_DRAG_MS) {
      return;
    }
    optionsRef.current.onRulerDoubleClick();
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
    onLostPointerCapture: onPointerEnd,
    onDoubleClick,
  };
}
