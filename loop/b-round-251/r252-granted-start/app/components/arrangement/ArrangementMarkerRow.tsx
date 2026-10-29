import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  formatArrangementTime,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import { adjacentGridLine, resolveGridTime } from '~/lib/arrangement/grid';
import {
  addMarker,
  adjacentMarkerTarget,
  arrangementMarkers,
  deleteMarker,
  MARKER_NAME_MAX_LENGTH,
  MARKER_TIME_EPS,
  markerAtTime,
  moveMarker,
  nextDefaultMarkerName,
  normalizeMarkerName,
  renameMarker,
  roundMarkerTime,
} from '~/lib/arrangement/markers';
import { studioMarkerStrings } from '~/lib/arrangement/strings';
import { cn } from '~/lib/utils';
import type { Arrangement, ArrangementMarker } from '~/types/arrangement';
import { watchUncapturedPointerGesture } from './ArrangementClip';
import { ARRANGEMENT_HEADER_WIDTH_PX } from './ArrangementLane';
import {
  ArrangementMarkerMenu,
  type MarkerMenuAction,
  type MarkerMenuCloseReason,
} from './ArrangementMarkerMenu';
import { STUDIO_FOCUS_RING_EDGE_CLASS, STUDIO_FOCUS_RING_INSET_CLASS } from './studio-focus';

const MARKER_LABEL_MAX_PX = 160;
const MARKER_LABEL_GAP_PX = 4;
const MARKER_LABEL_MIN_VISIBLE_PX = 12;
const MARKER_ADD_FOCUS = 'add';
const MARKER_HEADER_BUTTON_CLASS = `h-4 shrink-0 rounded-md border border-transparent bg-foreground/5 px-1 text-xs leading-none text-muted motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none! enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12 hover:text-foreground ${STUDIO_FOCUS_RING_INSET_CLASS}`;
const MARKER_STEP_BUTTON_CLASS = `${MARKER_HEADER_BUTTON_CLASS} inline-flex items-center justify-center`;
const MARKER_DRAG_THRESHOLD_PX = 3;
const MARKER_KEY_STEP_SECONDS = 0.1;
const MARKER_FLAG_SHORTCUTS = 'F2 Delete ArrowLeft ArrowRight Shift+F10';
const MARKER_FLAG_HINT = studioMarkerStrings.flagHint;
const MARKER_AT_TIME_START_MESSAGE = studioMarkerStrings.atTimeStart;

type MarkerEditor =
  | { kind: 'add'; session: number; time: number; draft: string; fallback: string }
  | { kind: 'rename'; session: number; id: string; time: number; draft: string };

interface MarkerDragGesture {
  markerId: string;
  pointerId: number;
  startX: number;
  before: Arrangement;
  original: ArrangementMarker;
  lastTime: number;
  moved: boolean;
  release: () => void;
}

interface MarkerMenuState {
  session: number;
  markerId: string;
  x: number;
  y: number;
}

export interface ArrangementMarkerRowHandle {
  beginAddMarker: () => void;
  closeMenu: () => void;
  focusEditorSuccessor: (element: HTMLElement) => boolean;
  stepMarker: (
    direction: -1 | 1,
    edgeTimes?: readonly number[],
    options?: { readonly keyRepeat?: boolean },
  ) => void;
}

interface ArrangementMarkerRowProps {
  timelineWidth: number;
  pxPerSecond: number;
  snapSeconds?: number | null;
  gridSeconds?: number;
}

function markerLabelWidth(
  markers: readonly ArrangementMarker[],
  index: number,
  pxPerSecond: number,
): number {
  const next = markers[index + 1];
  if (!next) {
    return MARKER_LABEL_MAX_PX;
  }
  const gap = (next.time - markers[index].time) * pxPerSecond - MARKER_LABEL_GAP_PX;
  return Math.max(0, Math.min(MARKER_LABEL_MAX_PX, gap));
}

function orderMarkersForDrag(
  markers: readonly ArrangementMarker[],
  order: readonly string[] | null,
): readonly ArrangementMarker[] {
  if (order === null) {
    return markers;
  }
  const rank = new Map(order.map((id, index) => [id, index]));
  return [...markers].sort(
    (left, right) => (rank.get(left.id) ?? order.length) - (rank.get(right.id) ?? order.length),
  );
}

function focusSuccessorAfterRemoval(
  detached: { readonly markerId: string; readonly order: readonly string[] },
  markers: readonly ArrangementMarker[],
): string {
  const remaining = new Set(markers.map((marker) => marker.id));
  const index = detached.order.indexOf(detached.markerId);
  const after = detached.order.slice(index + 1).find((id) => remaining.has(id));
  const before = detached.order
    .slice(0, Math.max(index, 0))
    .reverse()
    .find((id) => remaining.has(id));
  return after ?? before ?? MARKER_ADD_FOCUS;
}

function markerFlagMenuAnchor(flag: HTMLElement): { x: number; y: number } {
  const rect = flag.getBoundingClientRect();
  return { x: rect.left, y: rect.bottom };
}

export const ArrangementMarkerRow = forwardRef<
  ArrangementMarkerRowHandle,
  ArrangementMarkerRowProps
>(({ timelineWidth, pxPerSecond, snapSeconds = null, gridSeconds }, ref) => {
  const {
    arrangement,
    range,
    projectEnd,
    getArrangement,
    getLivePosition,
    getLocatorPosition,
    previewArrangement,
    commitArrangement,
    seekTo,
    playFrom,
    status,
    setStatus,
    isPointerGestureActive,
    claimPointerGesture,
  } = useArrangement();
  const markers = arrangementMarkers(arrangement);
  const [editor, setEditor] = useState<MarkerEditor | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const flagRefs = useRef(new Map<string, HTMLButtonElement>());
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const settledRef = useRef(true);
  const sessionRef = useRef(0);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const blurSuccessorRef = useRef<{
    readonly input: HTMLInputElement;
    readonly markerId: string;
  } | null>(null);
  const pendingFocusRef = useRef<string | null>(null);
  const detachedFocusRef = useRef<{
    readonly markerId: string;
    readonly order: readonly string[];
  } | null>(null);
  const dragRef = useRef<MarkerDragGesture | null>(null);
  const suppressClickRef = useRef<string | null>(null);
  const [dragOrder, setDragOrder] = useState<readonly string[] | null>(null);
  const [menu, setMenu] = useState<MarkerMenuState | null>(null);
  const menuSessionRef = useRef(0);

  useEffect(
    () => () => {
      const gesture = dragRef.current;
      dragRef.current = null;
      gesture?.release();
    },
    [],
  );

  const focusMarkerTarget = useCallback((target: string) => {
    const element =
      target === MARKER_ADD_FOCUS ? addButtonRef.current : flagRefs.current.get(target);
    if (element?.isConnected) {
      pendingFocusRef.current = null;
      element.focus({ preventScroll: true });
      return;
    }
    pendingFocusRef.current = target;
  }, []);

  useIsomorphicLayoutEffect(() => {
    const detached = detachedFocusRef.current;
    detachedFocusRef.current = null;
    if (detached === null || markers.some((marker) => marker.id === detached.markerId)) {
      return;
    }
    focusMarkerTarget(focusSuccessorAfterRemoval(detached, markers));
  });

  useEffect(() => {
    const target = pendingFocusRef.current;
    if (target !== null) {
      pendingFocusRef.current = null;
      const element =
        target === MARKER_ADD_FOCUS ? addButtonRef.current : flagRefs.current.get(target);
      element?.focus({ preventScroll: true });
    }
  });

  const editorSession = editor?.session ?? null;
  useEffect(() => {
    if (editorSession === null) {
      return;
    }
    const input = inputRef.current;
    if (input) {
      input.focus();
      input.select();
    }
  }, [editorSession]);

  const openEditor = useCallback((next: MarkerEditor) => {
    const active = document.activeElement;
    restoreFocusRef.current = active instanceof HTMLElement ? active : null;
    blurSuccessorRef.current = null;
    settledRef.current = false;
    sessionRef.current += 1;
    setEditor({ ...next, session: sessionRef.current });
  }, []);

  const beginAddMarker = useCallback(() => {
    const current = getArrangement();
    const time = roundMarkerTime(range ? Math.min(range.start, range.end) : getLocatorPosition());
    const existing = markerAtTime(current, time);
    if (existing) {
      setSelectedMarkerId(existing.id);
      setStatus(studioMarkerStrings.existsAtTime(existing.name));
      focusMarkerTarget(existing.id);
      return;
    }
    const fallback = nextDefaultMarkerName(current);
    openEditor({ kind: 'add', session: 0, time, draft: fallback, fallback });
  }, [focusMarkerTarget, getArrangement, getLocatorPosition, openEditor, range, setStatus]);

  const stepMarker = useCallback(
    (
      direction: -1 | 1,
      edgeTimes?: readonly number[],
      options?: { readonly keyRepeat?: boolean },
    ) => {
      const target = adjacentMarkerTarget(
        getArrangement(),
        getLivePosition(),
        direction,
        projectEnd,
        edgeTimes,
      );
      if (!target) {
        const message =
          direction === 1 ? studioMarkerStrings.noneAfter : studioMarkerStrings.noneBefore;
        if (options?.keyRepeat !== true || status !== message) {
          setStatus(message);
        }
        return;
      }
      seekTo(target.time);
      if (target.marker) {
        setSelectedMarkerId(target.marker.id);
      }
    },
    [getArrangement, getLivePosition, projectEnd, seekTo, setStatus, status],
  );

  const closeMenu = useCallback(() => {
    if (!menu) {
      return;
    }
    setMenu(null);
    focusMarkerTarget(menu.markerId);
  }, [focusMarkerTarget, menu]);

  const menuPxPerSecondRef = useRef(pxPerSecond);
  useIsomorphicLayoutEffect(() => {
    if (menuPxPerSecondRef.current === pxPerSecond) {
      return;
    }
    menuPxPerSecondRef.current = pxPerSecond;
    closeMenu();
  }, [closeMenu, pxPerSecond]);

  const focusEditorSuccessor = useCallback(
    (element: HTMLElement) => {
      const successor = blurSuccessorRef.current;
      blurSuccessorRef.current = null;
      if (successor === null || successor.input !== element) {
        return false;
      }
      focusMarkerTarget(successor.markerId);
      return true;
    },
    [focusMarkerTarget],
  );

  useImperativeHandle(
    ref,
    () => ({ beginAddMarker, closeMenu, focusEditorSuccessor, stepMarker }),
    [beginAddMarker, closeMenu, focusEditorSuccessor, stepMarker],
  );

  const runUnlessGesture = (action: () => void) => {
    if (isPointerGestureActive()) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    action();
  };

  const settleEditor = (reason: 'enter' | 'escape' | 'blur') => {
    if (settledRef.current || !editor) {
      return;
    }
    if (reason === 'enter' && isPointerGestureActive()) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    settledRef.current = true;
    setEditor(null);
    const moveFocus = reason !== 'blur';
    if (reason === 'blur' && isPointerGestureActive()) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    const input = inputRef.current;
    const noteBlurSuccessor = (markerId: string) => {
      if (reason === 'blur' && input) {
        blurSuccessorRef.current = { input, markerId };
      }
    };
    if (editor.kind === 'add') {
      if (reason === 'escape') {
        setStatus(studioMarkerStrings.notAdded);
        const restore = restoreFocusRef.current;
        if (restore?.isConnected) {
          restore.focus({ preventScroll: true });
        }
        return;
      }
      const before = getArrangement();
      const result = addMarker(
        before,
        editor.time,
        normalizeMarkerName(editor.draft, editor.fallback),
      );
      if (result.arrangement === null) {
        setSelectedMarkerId(result.existing.id);
        setStatus(studioMarkerStrings.existsAtTime(result.existing.name));
        noteBlurSuccessor(result.existing.id);
        if (moveFocus) {
          focusMarkerTarget(result.existing.id);
        }
        return;
      }
      commitArrangement(result.arrangement, 'Add Marker', before);
      setSelectedMarkerId(result.marker.id);
      noteBlurSuccessor(result.marker.id);
      setStatus(
        studioMarkerStrings.added({
          name: result.marker.name,
          time: formatArrangementTime(result.marker.time),
        }),
      );
      if (moveFocus) {
        focusMarkerTarget(result.marker.id);
      }
      return;
    }
    const before = getArrangement();
    const marker = arrangementMarkers(before).find((entry) => entry.id === editor.id);
    if (!marker) {
      return;
    }
    noteBlurSuccessor(editor.id);
    if (moveFocus) {
      focusMarkerTarget(editor.id);
    }
    if (reason === 'escape') {
      return;
    }
    if (editor.draft.trim().length === 0) {
      setStatus(studioMarkerStrings.renameEmpty(marker.name));
      return;
    }
    const next = renameMarker(before, editor.id, editor.draft);
    setSelectedMarkerId(editor.id);
    if (next === before) {
      return;
    }
    commitArrangement(next, 'Rename Marker', before);
    const renamed = arrangementMarkers(next).find((entry) => entry.id === editor.id);
    setStatus(studioMarkerStrings.renamed(renamed?.name ?? marker.name));
  };

  const removeMarker = (marker: ArrangementMarker) => {
    const before = getArrangement();
    const list = arrangementMarkers(before);
    const index = list.findIndex((entry) => entry.id === marker.id);
    if (index < 0) {
      return;
    }
    const neighbour = list[index + 1] ?? list[index - 1] ?? null;
    commitArrangement(deleteMarker(before, marker.id), 'Delete Marker', before);
    if (selectedMarkerId === marker.id) {
      setSelectedMarkerId(null);
    }
    setStatus(studioMarkerStrings.deleted(marker.name));
    focusMarkerTarget(neighbour ? neighbour.id : MARKER_ADD_FOCUS);
  };

  const jumpToMarker = (marker: ArrangementMarker) => {
    seekTo(marker.time);
    setSelectedMarkerId(marker.id);
  };

  const commitMarkerMove = (
    before: Arrangement,
    markerId: string,
    time: number,
    keyRepeat = false,
  ): boolean => {
    const result = moveMarker(before, markerId, time);
    if (result.kind === 'conflict') {
      const message = studioMarkerStrings.existsAtTime(result.other.name);
      if (!keyRepeat || status !== message) {
        setStatus(message);
      }
      return false;
    }
    if (result.kind === 'unchanged') {
      return false;
    }
    pendingFocusRef.current = markerId;
    commitArrangement(result.arrangement, 'Move Marker', before);
    setSelectedMarkerId(markerId);
    setStatus(
      studioMarkerStrings.moved({
        name: result.marker.name,
        time: formatArrangementTime(result.marker.time),
      }),
    );
    return true;
  };

  const nudgeMarker = (markerId: string, direction: -1 | 1, keyRepeat: boolean) => {
    const before = getArrangement();
    const current = arrangementMarkers(before).find((entry) => entry.id === markerId);
    if (!current) {
      return;
    }
    setSelectedMarkerId(current.id);
    if (direction === -1 && current.time < MARKER_TIME_EPS) {
      if (!keyRepeat || status !== MARKER_AT_TIME_START_MESSAGE) {
        setStatus(MARKER_AT_TIME_START_MESSAGE);
      }
      return;
    }
    const target =
      snapSeconds === null
        ? current.time + direction * MARKER_KEY_STEP_SECONDS
        : (adjacentGridLine(current.time, snapSeconds, direction) ?? 0);
    commitMarkerMove(before, current.id, target, keyRepeat);
  };

  const suppressClickAfterDrag = (markerId: string) => {
    suppressClickRef.current = markerId;
    window.setTimeout(() => {
      if (suppressClickRef.current === markerId) {
        suppressClickRef.current = null;
      }
    }, 0);
  };

  const endStaleMarkerDrag = (gesture: MarkerDragGesture) => {
    dragRef.current = null;
    if (gesture.moved) {
      previewArrangement(gesture.before);
      setDragOrder(null);
      suppressClickAfterDrag(gesture.markerId);
    }
    gesture.release();
  };

  const beginMarkerDrag = (event: PointerEvent<HTMLButtonElement>, marker: ArrangementMarker) => {
    if (event.button !== 0 || event.buttons === 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = null;
    const flag = event.currentTarget;
    flag.focus({ preventScroll: true });
    setSelectedMarkerId(marker.id);
    let claimed: MarkerDragGesture | null = null;
    const releaseClaim = claimPointerGesture(event.pointerId, () => {
      const stale = claimed;
      if (stale && dragRef.current === stale) {
        endStaleMarkerDrag(stale);
        return;
      }
      stale?.release();
    });
    if (!releaseClaim) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    const leftover = dragRef.current;
    if (leftover) {
      endStaleMarkerDrag(leftover);
    }
    const before = getArrangement();
    const original = arrangementMarkers(before).find((entry) => entry.id === marker.id);
    if (!original) {
      releaseClaim();
      return;
    }
    claimed = {
      markerId: original.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      before,
      original,
      lastTime: original.time,
      moved: false,
      release: releaseClaim,
    };
    dragRef.current = claimed;
    try {
      flag.setPointerCapture(event.pointerId);
    } catch {
      const gesture = claimed;
      watchUncapturedPointerGesture(gesture, () => {
        if (dragRef.current === gesture) {
          endStaleMarkerDrag(gesture);
          return;
        }
        gesture.release();
      });
    }
  };

  const handleMarkerPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const gesture = dragRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - gesture.startX;
    if (!gesture.moved && Math.abs(dx) < MARKER_DRAG_THRESHOLD_PX) {
      return;
    }
    if (!gesture.moved) {
      gesture.moved = true;
      setDragOrder(arrangementMarkers(gesture.before).map((entry) => entry.id));
    }
    const time = resolveGridTime(
      roundMarkerTime(gesture.original.time + dx / pxPerSecond),
      snapSeconds,
      gridSeconds,
      event.altKey,
    );
    const result = moveMarker(gesture.before, gesture.markerId, time);
    if (result.kind === 'conflict') {
      return;
    }
    gesture.lastTime = result.kind === 'moved' ? result.marker.time : gesture.original.time;
    previewArrangement(result.arrangement);
  };

  const finishMarkerDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const gesture = dragRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }
    dragRef.current = null;
    gesture.release();
    const flag = event.currentTarget;
    if (flag.hasPointerCapture(event.pointerId)) {
      flag.releasePointerCapture(event.pointerId);
    }
    if (!gesture.moved) {
      return;
    }
    setDragOrder(null);
    const { markerId } = gesture;
    suppressClickAfterDrag(markerId);
    if (Math.abs(gesture.lastTime - gesture.original.time) < MARKER_TIME_EPS) {
      return;
    }
    commitMarkerMove(gesture.before, markerId, gesture.lastTime);
  };

  const openMarkerMenu = (marker: ArrangementMarker, x: number, y: number) => {
    setSelectedMarkerId(marker.id);
    menuSessionRef.current += 1;
    setMenu({ session: menuSessionRef.current, markerId: marker.id, x, y });
  };

  const handleFlagContextMenu = (
    event: MouseEvent<HTMLButtonElement>,
    marker: ArrangementMarker,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const fromKeyboard = event.button !== 2;
    if (fromKeyboard && menu?.markerId === marker.id) {
      return;
    }
    const flag = event.currentTarget;
    flag.focus({ preventScroll: true });
    const anchor = fromKeyboard
      ? markerFlagMenuAnchor(flag)
      : { x: event.clientX, y: event.clientY };
    openMarkerMenu(marker, anchor.x, anchor.y);
  };

  const closeMarkerMenu = (reason: MarkerMenuCloseReason) => {
    const current = menu;
    if (!current) {
      return;
    }
    setMenu(null);
    if (reason !== 'window') {
      focusMarkerTarget(current.markerId);
    }
  };

  const chooseMarkerMenuAction = (action: MarkerMenuAction) => {
    const current = menu;
    if (!current) {
      return;
    }
    setMenu(null);
    const marker = arrangementMarkers(getArrangement()).find(
      (entry) => entry.id === current.markerId,
    );
    if (!marker) {
      return;
    }
    if (isPointerGestureActive()) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      focusMarkerTarget(marker.id);
      return;
    }
    if (action === 'rename') {
      setSelectedMarkerId(marker.id);
      openEditor({
        kind: 'rename',
        session: 0,
        id: marker.id,
        time: marker.time,
        draft: marker.name,
      });
      return;
    }
    if (action === 'play') {
      playFrom(marker.time);
      setSelectedMarkerId(marker.id);
      focusMarkerTarget(marker.id);
      return;
    }
    removeMarker(marker);
  };

  const handleFlagKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    marker: ArrangementMarker,
  ) => {
    if (event.target !== event.currentTarget || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    if (event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)) {
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) {
        const anchor = markerFlagMenuAnchor(event.currentTarget);
        openMarkerMenu(marker, anchor.x, anchor.y);
      }
      return;
    }
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      runUnlessGesture(() =>
        nudgeMarker(marker.id, event.key === 'ArrowLeft' ? -1 : 1, event.repeat),
      );
      return;
    }
    if (event.key === 'F2') {
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) {
        runUnlessGesture(() =>
          openEditor({
            kind: 'rename',
            session: 0,
            id: marker.id,
            time: marker.time,
            draft: marker.name,
          }),
        );
      }
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) {
        runUnlessGesture(() => removeMarker(marker));
      }
    }
  };

  const renderedMarkers = orderMarkersForDrag(markers, dragOrder);
  const sortedMarkerIndex = new Map(markers.map((marker, index) => [marker.id, index]));
  const menuMarker = menu ? (markers.find((marker) => marker.id === menu.markerId) ?? null) : null;

  return (
    <div className="flex h-5" data-testid="arrangement-marker-row">
      <div
        className="sticky left-0 z-30 flex h-5 shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap border-r border-b border-outline bg-surface px-2 text-xs text-muted"
        style={{ width: ARRANGEMENT_HEADER_WIDTH_PX }}
      >
        <span className="text-label font-medium uppercase tracking-label">Markers</span>
        <button
          ref={addButtonRef}
          type="button"
          onClick={() => runUnlessGesture(beginAddMarker)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.repeat) {
              event.preventDefault();
            }
          }}
          aria-label="Add marker (M)"
          aria-keyshortcuts="M"
          title={studioMarkerStrings.addTitle}
          className={MARKER_HEADER_BUTTON_CLASS}
          data-testid="arrangement-marker-add"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => runUnlessGesture(() => stepMarker(-1))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.repeat) {
              event.preventDefault();
            }
          }}
          aria-label="Previous marker (Ctrl+←)"
          aria-keyshortcuts="Control+ArrowLeft"
          title={studioMarkerStrings.previousTitle}
          className={MARKER_STEP_BUTTON_CLASS}
          data-testid="arrangement-marker-prev"
        >
          <ChevronLeft className="size-2.25 shrink-0" strokeWidth={2.4} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => runUnlessGesture(() => stepMarker(1))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.repeat) {
              event.preventDefault();
            }
          }}
          aria-label="Next marker (Ctrl+→)"
          aria-keyshortcuts="Control+ArrowRight"
          title={studioMarkerStrings.nextTitle}
          className={MARKER_STEP_BUTTON_CLASS}
          data-testid="arrangement-marker-next"
        >
          <ChevronRight className="size-2.25 shrink-0" strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
      <div
        className="relative h-5 shrink-0 border-b border-outline bg-surface"
        style={{ width: timelineWidth }}
        data-testid="arrangement-marker-strip"
      >
        {renderedMarkers.map((marker) => {
          const selected = marker.id === selectedMarkerId;
          const labelWidth = markerLabelWidth(
            markers,
            sortedMarkerIndex.get(marker.id) ?? 0,
            pxPerSecond,
          );
          const time = formatArrangementTime(marker.time);
          return (
            <button
              key={marker.id}
              ref={(node) => {
                if (node) {
                  flagRefs.current.set(marker.id, node);
                } else {
                  const detachedNode = flagRefs.current.get(marker.id);
                  if (detachedNode !== undefined && detachedNode === document.activeElement) {
                    detachedFocusRef.current = {
                      markerId: marker.id,
                      order: markers.map((entry) => entry.id),
                    };
                  }
                  flagRefs.current.delete(marker.id);
                }
              }}
              type="button"
              onPointerDown={(event) => beginMarkerDrag(event, marker)}
              onPointerMove={handleMarkerPointerMove}
              onPointerUp={finishMarkerDrag}
              onPointerCancel={finishMarkerDrag}
              onContextMenu={(event) => handleFlagContextMenu(event, marker)}
              onClick={() => {
                if (suppressClickRef.current !== marker.id) {
                  jumpToMarker(marker);
                }
              }}
              onDoubleClick={() => {
                if (suppressClickRef.current === marker.id) {
                  return;
                }
                playFrom(marker.time);
                setSelectedMarkerId(marker.id);
              }}
              onKeyDown={(event) => handleFlagKeyDown(event, marker)}
              aria-label={studioMarkerStrings.flagLabel({ name: marker.name, time })}
              aria-current={selected ? 'true' : undefined}
              aria-keyshortcuts={MARKER_FLAG_SHORTCUTS}
              aria-haspopup="menu"
              aria-expanded={menuMarker?.id === marker.id ? true : undefined}
              title={`${studioMarkerStrings.flagHeading({ name: marker.name, time })}\n${MARKER_FLAG_HINT}`}
              className={`group absolute top-0 isolate flex h-5 cursor-grab touch-none items-center pr-1 pl-1 active:cursor-grabbing ${STUDIO_FOCUS_RING_EDGE_CLASS}`}
              style={{ left: marker.time * pxPerSecond }}
              data-testid="arrangement-marker"
              data-marker-id={marker.id}
              data-marker-time={marker.time.toFixed(3)}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute top-0 left-0 -z-1 h-full w-px',
                  selected ? 'bg-brand' : 'bg-muted',
                )}
              />
              <span
                className={cn(
                  'h-4 truncate rounded-sm border px-1 text-xs leading-4',
                  selected
                    ? 'border-brand bg-brand/20 text-brand'
                    : 'border-outline bg-foreground/10 text-foreground group-hover:bg-foreground/20',
                  labelWidth < MARKER_LABEL_MIN_VISIBLE_PX && 'invisible',
                )}
                style={{ maxWidth: labelWidth }}
                data-marker-label=""
              >
                {marker.name}
              </span>
            </button>
          );
        })}
        {editor ? (
          <input
            ref={inputRef}
            type="text"
            maxLength={MARKER_NAME_MAX_LENGTH}
            value={editor.draft}
            onChange={(event) => {
              const draft = event.target.value;
              setEditor((current) => (current ? { ...current, draft } : current));
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                if (event.key === 'Enter' && event.repeat) {
                  return;
                }
                settleEditor(event.key === 'Enter' ? 'enter' : 'escape');
              }
            }}
            onBlur={() => settleEditor('blur')}
            aria-label={studioMarkerStrings.nameFieldLabel}
            className="absolute top-0 z-10 h-5 w-40 rounded-md border border-brand bg-background px-1 text-xs text-foreground"
            style={{ left: editor.time * pxPerSecond }}
            data-testid="arrangement-marker-name-input"
          />
        ) : null}
        {menu && menuMarker
          ? createPortal(
              <ArrangementMarkerMenu
                key={menu.session}
                x={menu.x}
                y={menu.y}
                markerName={menuMarker.name}
                onChooseAction={chooseMarkerMenuAction}
                onClose={closeMarkerMenu}
              />,
              document.body,
            )
          : null}
      </div>
    </div>
  );
});

ArrangementMarkerRow.displayName = 'ArrangementMarkerRow';
