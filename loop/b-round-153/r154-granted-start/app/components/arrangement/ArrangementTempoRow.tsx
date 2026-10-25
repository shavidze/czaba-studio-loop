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
import { METRONOME_NEEDS_TEMPO_TITLE, METRONOME_TITLE } from '~/lib/arrangement/metronome';
import { studioMetronomeStrings, studioTempoStrings } from '~/lib/arrangement/strings';
import {
  barsRulerMarks,
  formatTempoBpm,
  parseTempoBpm,
  TEMPO_BEATS_PER_BAR,
  TEMPO_EMPTY_HINT,
} from '~/lib/arrangement/tempo';
import type { TimelineView } from '~/lib/arrangement/view';
import { cn } from '~/lib/utils';
import { ARRANGEMENT_HEADER_WIDTH_PX } from './ArrangementLane';

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
}

interface ArrangementBarsRulerProps {
  seconds: number;
  pxPerSecond: number;
  bpm: number | null;
  fromPx: number | null;
  toPx: number | null;
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
}: ArrangementBarsRulerProps) {
  return (
    <div
      className="relative h-5 shrink-0 overflow-hidden border-b border-outline bg-surface"
      style={{ width: seconds * pxPerSecond }}
      role="presentation"
      data-testid="arrangement-bars-ruler"
      data-bpm={bpm === null ? '' : formatTempoBpm(bpm)}
    >
      {bpm === null ? (
        <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center whitespace-nowrap text-xs text-muted">
          {TEMPO_EMPTY_HINT}
        </span>
      ) : (
        barsRulerMarks(
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
                  'absolute left-1 whitespace-nowrap text-xs leading-none tabular-nums text-muted',
                  mark.kind === 'bar' ? 'top-1' : 'bottom-0.5',
                )}
              >
                {mark.label}
              </span>
            )}
          </div>
        ))
      )}
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
          className="h-4 w-14 rounded-sm border border-outline-strong bg-background px-1 font-mono text-xs leading-none tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
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
            'h-4 shrink-0 rounded-sm border border-outline px-1 text-xs leading-none text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted',
            metronomeOn && 'border-accent bg-accent/20 text-accent hover:text-accent',
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
      />
    </div>
  );
}
