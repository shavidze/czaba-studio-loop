import { type KeyboardEvent, useCallback, useRef } from 'react';
import {
  formatArrangementTime,
  useArrangement,
  useArrangementPositionStore,
  useArrangementPositionWriter,
} from '~/contexts/ArrangementContext';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import {
  formatZoomReadout,
  sliderPositionFromZoom,
  TIMELINE_ZOOM_SLIDER_STEPS,
  type TimelineFollowMode,
  zoomFromSliderPosition,
} from '~/lib/arrangement/view';
import { cn } from '~/lib/utils';

export interface ArrangementTransportNavigation {
  followMode: TimelineFollowMode;
  canZoomBack: boolean;
  onToggleFollow: () => void;
  onZoomToRange: () => void;
  onZoomBack: () => void;
  onFit: () => void;
  onZoomSlider: (pxPerSecond: number) => void;
}

interface ArrangementTransportProps {
  onOpenExport: () => void;
  navigation: ArrangementTransportNavigation;
}

const toolButtonClass =
  'inline-flex h-8 items-center gap-1 rounded-sm border border-outline bg-elevated px-2.5 text-sm text-foreground hover:border-outline-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40';

function ArrangementTransportPosition() {
  const positionStore = useArrangementPositionStore();
  const textRef = useRef<HTMLSpanElement>(null);
  const writeTransportPosition = useCallback((position: number) => {
    if (textRef.current) {
      textRef.current.textContent = formatArrangementTime(position);
    }
  }, []);
  useArrangementPositionWriter(writeTransportPosition);
  return (
    <span ref={textRef} className="text-base text-foreground" data-testid="arrangement-position">
      {formatArrangementTime(positionStore.getPosition())}
    </span>
  );
}

export function ArrangementTransport({ onOpenExport, navigation }: ArrangementTransportProps) {
  const {
    isPlaying,
    projectEnd,
    undoLabel,
    redoLabel,
    pxPerSecond,
    range,
    selectedClipId,
    togglePlayback,
    seekTo,
    undo,
    redo,
    splitSelection,
    deleteSelection,
    arrangement,
    toggleLoopSelection,
  } = useArrangement();
  const loop = arrangement.loop;
  const rangeDeleteHint = range
    ? `წაშლა მონაკვეთზე${range.allTracks ? ' ყველა ხაზზე' : ''} — სიცარიელე დარჩება (Delete / Backspace). დროის ამოჭრა სიცარიელის დახურვით: Ctrl+Shift+X`
    : null;
  const deleteHint = 'კლიპის წაშლა — სიცარიელე დარჩება';
  const undoButtonRef = useRef<HTMLButtonElement>(null);
  const redoButtonRef = useRef<HTMLButtonElement>(null);
  const fitButtonRef = useRef<HTMLButtonElement>(null);
  const focusHandoffRef = useRef<{
    source: HTMLButtonElement;
    partner: HTMLButtonElement | null;
  } | null>(null);

  const armFocusHandoff = (source: HTMLButtonElement, partner: HTMLButtonElement | null) => {
    focusHandoffRef.current = document.activeElement === source ? { source, partner } : null;
  };

  useIsomorphicLayoutEffect(() => {
    const handoff = focusHandoffRef.current;
    focusHandoffRef.current = null;
    if (!handoff?.source.disabled || !handoff.partner || handoff.partner.disabled) {
      return;
    }
    const activeElement = document.activeElement;
    if (
      activeElement === handoff.source ||
      activeElement === document.body ||
      activeElement === null
    ) {
      handoff.partner.focus();
    }
  });

  const preventRepeatedEnterKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' && event.repeat) {
      event.preventDefault();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-outline bg-surface px-3 py-2">
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className={cn(
          toolButtonClass,
          'w-24 justify-center font-medium',
          isPlaying ? 'border-accent text-accent' : 'border-brand text-brand',
        )}
      >
        {isPlaying ? '❚❚ Pause' : '▶ Play'}
      </button>
      <button
        type="button"
        onClick={() => seekTo(0)}
        aria-label="დასაწყისზე დაბრუნება"
        title="დასაწყისზე (0)"
        className={toolButtonClass}
      >
        ↤
      </button>
      <div className="flex items-baseline gap-2 rounded-sm bg-background px-3 py-1 font-mono tabular-nums">
        <ArrangementTransportPosition />
        <span className="text-xs text-muted">
          / ბოლო{' '}
          <span data-testid="arrangement-project-end">{formatArrangementTime(projectEnd)}</span>
        </span>
      </div>
      <div className="mx-1 h-6 w-px bg-outline" />
      <button
        ref={undoButtonRef}
        type="button"
        onClick={(event) => {
          armFocusHandoff(event.currentTarget, redoButtonRef.current);
          undo();
        }}
        onKeyDown={preventRepeatedEnterKeyDown}
        disabled={!undoLabel}
        title={undoLabel ? `Undo: ${undoLabel}` : 'Undo'}
        className={cn(toolButtonClass, 'w-28')}
      >
        <span aria-hidden="true">↶</span>
        <span className="truncate">Undo{undoLabel ? `: ${undoLabel}` : ''}</span>
      </button>
      <button
        ref={redoButtonRef}
        type="button"
        onClick={(event) => {
          armFocusHandoff(event.currentTarget, undoButtonRef.current);
          redo();
        }}
        onKeyDown={preventRepeatedEnterKeyDown}
        disabled={!redoLabel}
        title={redoLabel ? `Redo: ${redoLabel}` : 'Redo'}
        className={cn(toolButtonClass, 'w-28')}
      >
        <span aria-hidden="true">↷</span>
        <span className="truncate">Redo{redoLabel ? `: ${redoLabel}` : ''}</span>
      </button>
      <div className="mx-1 h-6 w-px bg-outline" />
      <button
        type="button"
        onClick={splitSelection}
        disabled={!range && !selectedClipId}
        title={
          range
            ? 'გაყოფა მონაკვეთის ორივე საზღვარზე (Ctrl/Cmd+E)'
            : 'გაყოფა playhead-ზე (Ctrl/Cmd+E)'
        }
        className={toolButtonClass}
      >
        ✂ Split
      </button>
      <button
        type="button"
        onClick={(event) => {
          armFocusHandoff(event.currentTarget, undoButtonRef.current);
          deleteSelection();
        }}
        onKeyDown={preventRepeatedEnterKeyDown}
        disabled={!range && !selectedClipId}
        title={rangeDeleteHint ?? `${deleteHint} (Delete)`}
        aria-label={rangeDeleteHint ?? `⌫ წაშლა — ${deleteHint}`}
        className={cn(toolButtonClass, range && 'border-accent text-accent')}
      >
        ⌫ წაშლა
      </button>
      <div className="mx-1 h-6 w-px bg-outline" />
      <button
        type="button"
        onClick={toggleLoopSelection}
        disabled={!range && !loop}
        aria-pressed={loop?.enabled === true}
        title={
          range ? 'Loop მონიშნულ მონაკვეთზე (Ctrl/Cmd+L)' : 'Loop-ის ჩართვა/გამორთვა (Ctrl/Cmd+L)'
        }
        className={cn(toolButtonClass, loop?.enabled && 'border-accent bg-accent/20 text-accent')}
      >
        ↻ Loop
      </button>
      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={navigation.onToggleFollow}
          aria-pressed={navigation.followMode === 'on'}
          title={
            navigation.followMode === 'off'
              ? 'Follow გამორთულია: დაკვრისას ხედი არ მიჰყვება'
              : navigation.followMode === 'paused'
                ? 'Follow შეჩერდა ხელით ნავიგაციისას — დააჭირე Follow-ს ან Play-ს'
                : 'Follow: დაკვრისას ხედი პოზიციას მიჰყვება'
          }
          className={cn(
            toolButtonClass,
            'w-16 justify-center px-1 text-xs',
            navigation.followMode === 'on' && 'text-brand',
            navigation.followMode === 'paused' && 'border-accent text-accent',
          )}
          data-testid="arrangement-follow"
          data-follow-mode={navigation.followMode}
        >
          {navigation.followMode === 'paused' ? 'Follow ‖' : 'Follow'}
        </button>
        <label className="flex items-center gap-2 text-xs text-muted">
          Zoom
          <input
            type="range"
            min={0}
            max={TIMELINE_ZOOM_SLIDER_STEPS}
            step={1}
            value={sliderPositionFromZoom(pxPerSecond)}
            onChange={(event) =>
              navigation.onZoomSlider(zoomFromSliderPosition(Number(event.target.value)))
            }
            aria-label="Zoom (px/წმ)"
            aria-valuetext={formatZoomReadout(pxPerSecond)}
            title="Zoom playhead-ის გარშემო · + / − · Ctrl+wheel"
            className="w-20 accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            data-testid="arrangement-zoom"
          />
          <span className="w-16 text-right tabular-nums" data-testid="arrangement-zoom-readout">
            {formatZoomReadout(pxPerSecond)}
          </span>
        </label>
        <button
          type="button"
          onClick={navigation.onZoomToRange}
          disabled={!range}
          aria-label="Zoom მონიშნულზე (Z)"
          aria-keyshortcuts="Z"
          title={
            range ? 'Zoom მონიშნულ მონაკვეთზე (Z)' : 'Zoom მონიშნულზე: ჯერ მონიშნე მონაკვეთი (Z)'
          }
          className={cn(toolButtonClass, 'w-8 justify-center px-0 text-xs')}
          data-testid="arrangement-zoom-range"
        >
          ⇔
        </button>
        <button
          type="button"
          onClick={(event) => {
            armFocusHandoff(event.currentTarget, fitButtonRef.current);
            navigation.onZoomBack();
          }}
          onKeyDown={preventRepeatedEnterKeyDown}
          disabled={!navigation.canZoomBack}
          aria-keyshortcuts="X"
          title={
            navigation.canZoomBack
              ? 'წინა Zoom-ის დაბრუნება (X)'
              : 'წინა Zoom: ისტორია ცარიელია — ჯერ Fit ან Zoom მონიშნულზე (X)'
          }
          className={cn(toolButtonClass, 'px-2 text-xs')}
          data-testid="arrangement-zoom-back"
        >
          ↩ Zoom
        </button>
        <button
          ref={fitButtonRef}
          type="button"
          onClick={navigation.onFit}
          title="Fit — მთლიანი პროექტი ჩანს (ruler-ის ან მიმოხილვის ორმაგი click)"
          className={cn(toolButtonClass, 'px-2 text-xs')}
          data-testid="arrangement-fit"
        >
          Fit
        </button>
        <div className="mx-1 h-6 w-px bg-outline" />
        <button
          type="button"
          onClick={onOpenExport}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.repeat) {
              event.preventDefault();
            }
          }}
          className={cn(toolButtonClass, 'border-brand bg-brand font-medium text-brand-foreground')}
        >
          Export
        </button>
      </div>
    </div>
  );
}
