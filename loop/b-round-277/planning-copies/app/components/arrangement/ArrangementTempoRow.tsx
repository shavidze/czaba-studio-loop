import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  memo,
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useRulerNavigation } from '~/hooks/useRulerNavigation';
import { resolveGridTimeWithTargets } from '~/lib/arrangement/grid';
import { METRONOME_NEEDS_TEMPO_TITLE, METRONOME_TITLE } from '~/lib/arrangement/metronome';
import {
  studioMetronomeStrings,
  studioTempoStrings,
  studioViewStrings,
} from '~/lib/arrangement/strings';
import {
  barsRulerMarks,
  formatTempoBpm,
  parseTempoBpm,
  TEMPO_BEATS_PER_BAR,
} from '~/lib/arrangement/tempo';
import type { TimelineView } from '~/lib/arrangement/view';
import { cn } from '~/lib/utils';
import { ARRANGEMENT_HEADER_WIDTH_PX } from './ArrangementLane';
import { STUDIO_FOCUS_RING_INSET_CLASS } from './studio-focus';

interface ArrangementTempoRowProps {
  seconds: number;
  pxPerSecond: number;
  tempoBpm: number | null;
  onTempoChange: (next: number | null) => void;
  onTempoInvalid: () => void;
  metronomeOn: boolean;
  onMetronomeToggle: () => void;
  getTimelineView: () => TimelineView;
  getTimelineViewportPx: () => number;
  subscribeTimelineScroll: (listener: () => void) => () => void;
  rulerGestures: BarsRulerGestures;
}

export interface BarsRulerGestures {
  onSeek: (time: number) => void;
  onPlayFrom: (time: number) => void;
  onGestureClaim: (pointerId: number, abort: () => void) => (() => void) | null;
  applyTimelineView: (view: TimelineView) => void;
  onNavigationMove: () => void;
  onRulerDoubleClick: () => void;
  snapSeconds: number | null;
  gridSeconds: number | undefined;
  getSnapMarkerTimes: () => readonly number[];
}

interface ArrangementBarsRulerProps {
  seconds: number;
  pxPerSecond: number;
  bpm: number | null;
  fromPx: number | null;
  toPx: number | null;
  getTimelineView: () => TimelineView;
  gestures: BarsRulerGestures;
}

interface BarsRulerPage {
  page: number;
  viewportPx: number;
}

function readBarsRulerPage(
  getTimelineView: () => TimelineView,
  getTimelineViewportPx: () => number,
): BarsRulerPage | null {
  const viewportPx = getTimelineViewportPx();
  if (!(viewportPx > 0)) {
    return null;
  }
  return {
    page: Math.floor(Math.max(0, getTimelineView().scrollLeft) / viewportPx),
    viewportPx,
  };
}

function barsRulerPageKey(rulerPage: BarsRulerPage | null): string {
  return rulerPage === null ? '' : `${rulerPage.page}:${rulerPage.viewportPx}`;
}

function parseBarsRulerPageKey(key: string): BarsRulerPage | null {
  const [pageText, viewportText] = key.split(':');
  if (viewportText === undefined) {
    return null;
  }
  return { page: Number(pageText), viewportPx: Number(viewportText) };
}

function getServerBarsRulerPageKey(): string {
  return '';
}

function ArrangementBarsRulerInner({
  seconds,
  pxPerSecond,
  bpm,
  fromPx,
  toPx,
  getTimelineView,
  gestures,
}: ArrangementBarsRulerProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const pressInStripRef = useRef(false);
  const navigation = useRulerNavigation({
    onGestureClaim: gestures.onGestureClaim,
    getTimelineView,
    applyTimelineView: gestures.applyTimelineView,
    onNavigationMove: gestures.onNavigationMove,
    onRulerDoubleClick: gestures.onRulerDoubleClick,
    onRulerClick: (anchorTime, { altKey, pressTarget }) => {
      const time = resolveGridTimeWithTargets(
        anchorTime,
        gestures.snapSeconds,
        gestures.gridSeconds,
        altKey,
        gestures.getSnapMarkerTimes(),
      );
      if (pressTarget instanceof Node && stripRef.current?.contains(pressTarget)) {
        gestures.onPlayFrom(time);
        return;
      }
      gestures.onSeek(time);
    },
  });
  const interactive = bpm !== null;
  return (
    <div
      className={cn(
        'relative h-5 shrink-0 overflow-hidden border-b border-outline bg-surface',
        interactive && 'cursor-pointer touch-none',
      )}
      style={{ width: seconds * pxPerSecond }}
      onPointerDown={
        interactive
          ? (event) => {
              pressInStripRef.current =
                event.target instanceof Node && (stripRef.current?.contains(event.target) ?? false);
              navigation.onPointerDown(event);
            }
          : undefined
      }
      onPointerMove={interactive ? navigation.onPointerMove : undefined}
      onPointerUp={interactive ? navigation.onPointerUp : undefined}
      onPointerCancel={interactive ? navigation.onPointerCancel : undefined}
      onLostPointerCapture={interactive ? navigation.onLostPointerCapture : undefined}
      onDoubleClick={
        interactive
          ? () => {
              if (pressInStripRef.current) {
                return;
              }
              navigation.onDoubleClick();
            }
          : undefined
      }
      role="presentation"
      title={interactive ? studioViewStrings.rulerTitle : undefined}
      data-testid="arrangement-bars-ruler"
      data-bpm={bpm === null ? '' : formatTempoBpm(bpm)}
    >
      {interactive ? (
        <div
          ref={stripRef}
          className="absolute inset-x-0 top-0 h-2.5 hover:bg-foreground/8"
          title={studioTempoStrings.scrubStripTitle}
          aria-hidden="true"
          data-testid="arrangement-bars-scrub-strip"
        />
      ) : null}
      {bpm === null
        ? null
        : barsRulerMarks(
            seconds,
            pxPerSecond,
            bpm,
            fromPx === null || toPx === null ? undefined : { fromPx, toPx },
          ).map((mark) => (
            <div
              key={mark.time}
              className={cn(
                'pointer-events-none absolute bottom-0 border-l border-outline',
                mark.kind === 'bar' ? 'top-0' : 'h-1.5',
              )}
              style={{ left: mark.time * pxPerSecond }}
              data-testid="arrangement-bars-mark"
              data-kind={mark.kind}
              data-time={String(Math.round(mark.time * 1e6) / 1e6)}
            >
              {mark.label === null ? null : (
                <span
                  className={cn(
                    'absolute left-1 whitespace-nowrap font-mono text-xs leading-none tabular-nums text-muted',
                    mark.kind === 'bar' ? 'top-1' : 'bottom-0.5',
                  )}
                >
                  {mark.label}
                </span>
              )}
            </div>
          ))}
    </div>
  );
}

const ArrangementBarsRuler = memo(ArrangementBarsRulerInner);

export function ArrangementTempoRow({
  seconds,
  pxPerSecond,
  tempoBpm,
  onTempoChange,
  onTempoInvalid,
  metronomeOn,
  onMetronomeToggle,
  getTimelineView,
  getTimelineViewportPx,
  subscribeTimelineScroll,
  rulerGestures,
}: ArrangementTempoRowProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const skipCommitRef = useRef(false);
  const committedText = tempoBpm === null ? '' : formatTempoBpm(tempoBpm);
  const hasTempo = tempoBpm !== null;
  const getBarsRulerPageKey = useCallback(
    () =>
      hasTempo ? barsRulerPageKey(readBarsRulerPage(getTimelineView, getTimelineViewportPx)) : '',
    [hasTempo, getTimelineView, getTimelineViewportPx],
  );
  const rulerPage = parseBarsRulerPageKey(
    useSyncExternalStore(subscribeTimelineScroll, getBarsRulerPageKey, getServerBarsRulerPageKey),
  );

  const commitTempoDraft = (text: string) => {
    setDraft(null);
    if (text.trim() === '') {
      if (tempoBpm !== null) {
        onTempoChange(null);
      }
      return;
    }
    const next = parseTempoBpm(text);
    if (next === null) {
      onTempoInvalid();
      return;
    }
    if (next !== tempoBpm) {
      onTempoChange(next);
    }
  };

  const handleTempoFocus = () => {
    skipCommitRef.current = false;
  };

  const handleTempoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft(event.target.value);
  };

  const handleTempoBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (skipCommitRef.current) {
      skipCommitRef.current = false;
      setDraft(null);
      return;
    }
    if (draft === null) {
      return;
    }
    commitTempoDraft(event.currentTarget.value);
  };

  const handleTempoKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      skipCommitRef.current = true;
      setDraft(null);
      event.currentTarget.blur();
    }
  };

  return (
    <div className="flex">
      <div
        className="sticky left-0 z-30 flex h-5 shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap border-r border-b border-outline bg-surface px-2 text-xs text-muted"
        style={{ width: ARRANGEMENT_HEADER_WIDTH_PX }}
      >
        <span className="text-label font-medium uppercase tracking-label">BPM</span>
        <input
          type="text"
          inputMode="decimal"
          value={draft ?? committedText}
          onFocus={handleTempoFocus}
          onChange={handleTempoChange}
          onBlur={handleTempoBlur}
          onKeyDown={handleTempoKeyDown}
          aria-label={studioTempoStrings.fieldLabel}
          title={studioTempoStrings.fieldTitle}
          className={`h-4 w-14 rounded-md border border-outline-strong bg-background px-1 font-mono text-xs leading-none tabular-nums text-foreground ${STUDIO_FOCUS_RING_INSET_CLASS}`}
          data-testid="arrangement-tempo-input"
        />
        <span className="tabular-nums">{`${TEMPO_BEATS_PER_BAR}/4`}</span>
        <button
          type="button"
          onClick={onMetronomeToggle}
          disabled={tempoBpm === null}
          aria-pressed={metronomeOn}
          title={tempoBpm === null ? METRONOME_NEEDS_TEMPO_TITLE : METRONOME_TITLE}
          className={cn(
            'h-4 shrink-0 rounded-md border border-transparent bg-foreground/5 px-1 text-xs leading-none text-muted motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none! enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted',
            metronomeOn &&
              'border-foreground bg-foreground/20 text-foreground enabled:hover:bg-foreground/20 enabled:active:bg-foreground/20',
            STUDIO_FOCUS_RING_INSET_CLASS,
          )}
          data-testid="arrangement-metronome-toggle"
        >
          {studioMetronomeStrings.toggleLabel}
        </button>
      </div>
      <ArrangementBarsRuler
        seconds={seconds}
        pxPerSecond={pxPerSecond}
        bpm={tempoBpm}
        fromPx={rulerPage === null ? null : (rulerPage.page - 1) * rulerPage.viewportPx}
        toPx={rulerPage === null ? null : (rulerPage.page + 2) * rulerPage.viewportPx}
        getTimelineView={getTimelineView}
        gestures={rulerGestures}
      />
    </div>
  );
}
