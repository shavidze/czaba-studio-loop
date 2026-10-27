import {
  ArrowLeftToLine,
  Delete,
  MoveHorizontal,
  Pause,
  Play,
  Redo2,
  Repeat,
  Scissors,
  Undo2,
} from 'lucide-react';
import { type KeyboardEvent, useCallback, useRef } from 'react';
import {
  formatArrangementTime,
  useArrangement,
  useArrangementPositionStore,
  useArrangementPositionWriter,
} from '~/contexts/ArrangementContext';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import {
  studioEditStrings,
  studioLoopStrings,
  studioPlaybackStrings,
  studioViewStrings,
} from '~/lib/arrangement/strings';
import {
  formatZoomReadout,
  sliderPositionFromZoom,
  TIMELINE_ZOOM_SLIDER_STEPS,
  type TimelineFollowMode,
  zoomFromSliderPosition,
} from '~/lib/arrangement/view';
import { cn } from '~/lib/utils';
import { STUDIO_NEUTRAL_SLIDER_CLASS } from './studio-fader';

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
  'inline-flex h-8 items-center gap-1 rounded-md border border-transparent bg-foreground/5 px-2.5 text-sm text-foreground motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none! enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12 disabled:cursor-not-allowed disabled:opacity-40';

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
    ? range.allTracks
      ? studioEditStrings.deleteRangeAllTracksHint
      : studioEditStrings.deleteRangeHint
    : null;
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
        aria-label={isPlaying ? studioPlaybackStrings.pauseLabel : studioPlaybackStrings.playLabel}
        title={isPlaying ? studioPlaybackStrings.pauseTitle : studioPlaybackStrings.playTitle}
        className={cn(
          toolButtonClass,
          'w-8 justify-center rounded-full px-0 bg-foreground text-background enabled:hover:bg-foreground/92 enabled:active:bg-foreground/88',
        )}
      >
        {isPlaying ? (
          <Pause className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Play className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        onClick={() => seekTo(0)}
        aria-label={studioPlaybackStrings.backToStartLabel}
        title={studioPlaybackStrings.backToStartTitle}
        className={toolButtonClass}
      >
        <ArrowLeftToLine className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
      </button>
      <div className="flex items-baseline gap-2 rounded-md bg-background px-3 py-1 font-mono tabular-nums">
        <ArrangementTransportPosition />
        <span className="text-xs text-muted">
          {studioPlaybackStrings.projectEndPrefix}{' '}
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
        <Undo2 className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
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
        <Redo2 className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
        <span className="truncate">Redo{redoLabel ? `: ${redoLabel}` : ''}</span>
      </button>
      <div className="mx-1 h-6 w-px bg-outline" />
      <button
        type="button"
        onClick={splitSelection}
        disabled={!range && !selectedClipId}
        title={range ? studioEditStrings.splitRangeTitle : studioEditStrings.splitPlayheadTitle}
        className={cn(toolButtonClass, 'gap-0.75')}
      >
        <Scissors className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
        <span>Split</span>
      </button>
      <button
        type="button"
        onClick={(event) => {
          armFocusHandoff(event.currentTarget, undoButtonRef.current);
          deleteSelection();
        }}
        onKeyDown={preventRepeatedEnterKeyDown}
        disabled={!range && !selectedClipId}
        title={rangeDeleteHint ?? studioEditStrings.deleteClipTitle}
        aria-label={rangeDeleteHint ?? studioEditStrings.deleteClipLabel}
        className={cn(toolButtonClass, 'gap-0.5', range && 'border-foreground')}
      >
        <Delete className="size-5 shrink-0" strokeWidth={1.2} aria-hidden="true" />
        <span>{studioEditStrings.deleteButton}</span>
      </button>
      <div className="mx-1 h-6 w-px bg-outline" />
      <button
        type="button"
        onClick={toggleLoopSelection}
        disabled={!range && !loop}
        aria-pressed={loop?.enabled === true}
        title={range ? studioLoopStrings.selectionTitle : studioLoopStrings.toggleTitle}
        className={cn(
          toolButtonClass,
          'gap-0.75',
          loop?.enabled &&
            'border-foreground bg-foreground/20 enabled:hover:bg-foreground/20 enabled:active:bg-foreground/20',
        )}
      >
        <Repeat className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
        <span>Loop</span>
      </button>
      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={navigation.onToggleFollow}
          aria-pressed={navigation.followMode === 'on'}
          title={
            navigation.followMode === 'off'
              ? studioViewStrings.followOffTitle
              : navigation.followMode === 'paused'
                ? studioViewStrings.followPausedTitle
                : studioViewStrings.followOnTitle
          }
          className={cn(
            toolButtonClass,
            'w-16 justify-center px-1 text-xs',
            navigation.followMode === 'on' &&
              'border-foreground bg-foreground/20 enabled:hover:bg-foreground/20 enabled:active:bg-foreground/20',
            navigation.followMode === 'paused' && 'border-dashed border-foreground',
          )}
          data-testid="arrangement-follow"
          data-follow-mode={navigation.followMode}
        >
          {navigation.followMode === 'paused' ? 'Follow ‖' : 'Follow'}
        </button>
        <label className="flex items-center gap-2 text-xs text-muted">
          <span className="text-label font-medium uppercase tracking-label">Zoom</span>
          <input
            type="range"
            min={0}
            max={TIMELINE_ZOOM_SLIDER_STEPS}
            step={1}
            value={sliderPositionFromZoom(pxPerSecond)}
            onChange={(event) =>
              navigation.onZoomSlider(zoomFromSliderPosition(Number(event.target.value)))
            }
            aria-label={studioViewStrings.zoomSliderLabel}
            aria-valuetext={formatZoomReadout(pxPerSecond)}
            title={studioViewStrings.zoomSliderTitle}
            className={`h-4 w-20 ${STUDIO_NEUTRAL_SLIDER_CLASS}`}
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
          aria-label={studioViewStrings.zoomToSelectionLabel}
          aria-keyshortcuts="Z"
          title={
            range
              ? studioViewStrings.zoomToSelectionTitle
              : studioViewStrings.zoomToSelectionNeedsRangeTitle
          }
          className={cn(toolButtonClass, 'w-8 justify-center px-0 text-xs')}
          data-testid="arrangement-zoom-range"
        >
          <MoveHorizontal className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
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
              ? studioViewStrings.zoomBackTitle
              : studioViewStrings.zoomBackEmptyTitle
          }
          className={cn(toolButtonClass, 'gap-0.5 px-2 text-xs')}
          data-testid="arrangement-zoom-back"
        >
          <Undo2 className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
          <span>Zoom</span>
        </button>
        <button
          ref={fitButtonRef}
          type="button"
          onClick={navigation.onFit}
          title={studioViewStrings.fitTitle}
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
          className={cn(toolButtonClass, 'border-brand font-medium text-brand')}
        >
          Export
        </button>
      </div>
    </div>
  );
}
