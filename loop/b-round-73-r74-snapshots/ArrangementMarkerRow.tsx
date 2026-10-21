import {
  forwardRef,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  formatArrangementTime,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
} from '~/contexts/ArrangementContext';
import {
  addMarker,
  adjacentMarkerTarget,
  arrangementMarkers,
  deleteMarker,
  MARKER_NAME_MAX_LENGTH,
  markerAtTime,
  nextDefaultMarkerName,
  normalizeMarkerName,
  renameMarker,
  roundMarkerTime,
} from '~/lib/arrangement/markers';
import { cn } from '~/lib/utils';
import type { ArrangementMarker } from '~/types/arrangement';
import { ARRANGEMENT_HEADER_WIDTH_PX } from './ArrangementLane';

const MARKER_LABEL_MAX_PX = 160;
const MARKER_LABEL_GAP_PX = 4;
const MARKER_LABEL_MIN_VISIBLE_PX = 12;
const MARKER_ADD_FOCUS = 'add';
const MARKER_HEADER_BUTTON_CLASS =
  'h-4 shrink-0 rounded-sm border border-outline px-1 text-xs leading-none text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
const MARKER_FLAG_HINT =
  'დაწკაპუნება: გადასვლა · ორმაგი დაწკაპუნება: დაკვრა აქედან · F2: სახელის შეცვლა · Delete: წაშლა';

type MarkerEditor =
  | { kind: 'add'; session: number; time: number; draft: string; fallback: string }
  | { kind: 'rename'; session: number; id: string; time: number; draft: string };

export interface ArrangementMarkerRowHandle {
  beginAddMarker: () => void;
  stepMarker: (direction: -1 | 1) => void;
}

interface ArrangementMarkerRowProps {
  timelineWidth: number;
  pxPerSecond: number;
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

export const ArrangementMarkerRow = forwardRef<
  ArrangementMarkerRowHandle,
  ArrangementMarkerRowProps
>(({ timelineWidth, pxPerSecond }, ref) => {
  const {
    arrangement,
    range,
    isPlaying,
    projectEnd,
    getArrangement,
    getLivePosition,
    commitArrangement,
    seekTo,
    togglePlayback,
    setStatus,
    isPointerGestureActive,
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
  const pendingFocusRef = useRef<string | null>(null);

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
    settledRef.current = false;
    sessionRef.current += 1;
    setEditor({ ...next, session: sessionRef.current });
  }, []);

  const beginAddMarker = useCallback(() => {
    const current = getArrangement();
    const time = roundMarkerTime(range ? Math.min(range.start, range.end) : getLivePosition());
    const existing = markerAtTime(current, time);
    if (existing) {
      setSelectedMarkerId(existing.id);
      setStatus(`ამ დროზე მარკერი უკვე არის: «${existing.name}»`);
      focusMarkerTarget(existing.id);
      return;
    }
    const fallback = nextDefaultMarkerName(current);
    openEditor({ kind: 'add', session: 0, time, draft: fallback, fallback });
  }, [focusMarkerTarget, getArrangement, getLivePosition, openEditor, range, setStatus]);

  const stepMarker = useCallback(
    (direction: -1 | 1) => {
      const target = adjacentMarkerTarget(
        getArrangement(),
        getLivePosition(),
        direction,
        projectEnd,
      );
      if (!target) {
        setStatus(direction === 1 ? 'წინ მარკერი აღარ არის' : 'უკან მარკერი აღარ არის');
        return;
      }
      seekTo(target.time);
      if (target.marker) {
        setSelectedMarkerId(target.marker.id);
      }
    },
    [getArrangement, getLivePosition, projectEnd, seekTo, setStatus],
  );

  useImperativeHandle(ref, () => ({ beginAddMarker, stepMarker }), [beginAddMarker, stepMarker]);

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
    settledRef.current = true;
    setEditor(null);
    const moveFocus = reason !== 'blur';
    if (reason === 'blur' && isPointerGestureActive()) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    if (editor.kind === 'add') {
      if (reason === 'escape') {
        setStatus('მარკერი არ დაემატა');
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
        setStatus(`ამ დროზე მარკერი უკვე არის: «${result.existing.name}»`);
        if (moveFocus) {
          focusMarkerTarget(result.existing.id);
        }
        return;
      }
      commitArrangement(result.arrangement, 'Add Marker', before);
      setSelectedMarkerId(result.marker.id);
      setStatus(
        `მარკერი «${result.marker.name}» დაემატა: ${formatArrangementTime(result.marker.time)}.`,
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
    if (moveFocus) {
      focusMarkerTarget(editor.id);
    }
    if (reason === 'escape') {
      return;
    }
    if (editor.draft.trim().length === 0) {
      setStatus(`სახელი ცარიელია — დარჩა «${marker.name}»`);
      return;
    }
    const next = renameMarker(before, editor.id, editor.draft);
    setSelectedMarkerId(editor.id);
    if (next === before) {
      return;
    }
    commitArrangement(next, 'Rename Marker', before);
    const renamed = arrangementMarkers(next).find((entry) => entry.id === editor.id);
    setStatus(`მარკერის სახელი: «${renamed?.name ?? marker.name}».`);
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
    setStatus(`მარკერი «${marker.name}» წაიშალა.`);
    focusMarkerTarget(neighbour ? neighbour.id : MARKER_ADD_FOCUS);
  };

  const handleFlagKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    marker: ArrangementMarker,
  ) => {
    if (event.target !== event.currentTarget || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    if (event.key === 'F2') {
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) {
        openEditor({
          kind: 'rename',
          session: 0,
          id: marker.id,
          time: marker.time,
          draft: marker.name,
        });
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

  const jumpToMarker = (marker: ArrangementMarker) => {
    seekTo(marker.time);
    setSelectedMarkerId(marker.id);
  };

  return (
    <div className="flex h-5" data-testid="arrangement-marker-row">
      <div
        className="sticky left-0 z-30 flex h-5 shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap border-r border-b border-outline bg-surface px-2 text-xs text-muted"
        style={{ width: ARRANGEMENT_HEADER_WIDTH_PX }}
      >
        <span>Markers</span>
        <button
          ref={addButtonRef}
          type="button"
          onClick={() => runUnlessGesture(beginAddMarker)}
          aria-label="Add marker (M)"
          aria-keyshortcuts="M"
          title="მარკერის დამატება playhead-ზე ან მონიშვნის დასაწყისში (M)"
          className={MARKER_HEADER_BUTTON_CLASS}
          data-testid="arrangement-marker-add"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => runUnlessGesture(() => stepMarker(-1))}
          aria-label="Previous marker (Ctrl+←)"
          aria-keyshortcuts="Control+ArrowLeft"
          title="წინა მარკერზე გადასვლა (Ctrl+←)"
          className={MARKER_HEADER_BUTTON_CLASS}
          data-testid="arrangement-marker-prev"
        >
          ◀
        </button>
        <button
          type="button"
          onClick={() => runUnlessGesture(() => stepMarker(1))}
          aria-label="Next marker (Ctrl+→)"
          aria-keyshortcuts="Control+ArrowRight"
          title="შემდეგ მარკერზე გადასვლა (Ctrl+→)"
          className={MARKER_HEADER_BUTTON_CLASS}
          data-testid="arrangement-marker-next"
        >
          ▶
        </button>
      </div>
      <div
        className="relative h-5 shrink-0 border-b border-outline bg-surface"
        style={{ width: timelineWidth }}
        data-testid="arrangement-marker-strip"
      >
        {markers.map((marker, index) => {
          const selected = marker.id === selectedMarkerId;
          const labelWidth = markerLabelWidth(markers, index, pxPerSecond);
          const time = formatArrangementTime(marker.time);
          return (
            <button
              key={marker.id}
              ref={(node) => {
                if (node) {
                  flagRefs.current.set(marker.id, node);
                } else {
                  flagRefs.current.delete(marker.id);
                }
              }}
              type="button"
              onClick={() => jumpToMarker(marker)}
              onDoubleClick={() => {
                jumpToMarker(marker);
                if (!isPlaying) {
                  togglePlayback();
                }
              }}
              onKeyDown={(event) => handleFlagKeyDown(event, marker)}
              aria-label={`Marker «${marker.name}» — ${time}`}
              aria-current={selected ? 'true' : undefined}
              title={`«${marker.name}» — ${time}\n${MARKER_FLAG_HINT}`}
              className="group absolute top-0 flex h-5 items-center pl-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
              style={{ left: marker.time * pxPerSecond }}
              data-testid="arrangement-marker"
              data-marker-id={marker.id}
              data-marker-time={marker.time.toFixed(3)}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute top-0 left-0 h-full w-px',
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
                settleEditor(event.key === 'Enter' ? 'enter' : 'escape');
              }
            }}
            onBlur={() => settleEditor('blur')}
            aria-label="მარკერის სახელი"
            className="absolute top-0 z-10 h-5 w-40 rounded-sm border border-brand bg-background px-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
            style={{ left: editor.time * pxPerSecond }}
            data-testid="arrangement-marker-name-input"
          />
        ) : null}
      </div>
    </div>
  );
});

ArrangementMarkerRow.displayName = 'ArrangementMarkerRow';
