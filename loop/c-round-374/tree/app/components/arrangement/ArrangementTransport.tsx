import {
  ArrowLeftToLine,
  Delete,
  MoveHorizontal,
  Play,
  Redo2,
  Repeat,
  Scissors,
  Square,
  Undo2,
} from 'lucide-react';
import { type KeyboardEvent, memo, useCallback, useId, useRef } from 'react';
import {
  formatArrangementTime,
  useArrangement,
  useArrangementIsPlaying,
  useArrangementPositionStore,
  useArrangementPositionWriter,
  useArrangementPreview,
  useArrangementRange,
  useArrangementSelection,
} from '~/contexts/ArrangementContext';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import { selectPreviewProjectEnd } from '~/lib/arrangement/preview-store';
import { studioShortcutAria } from '~/lib/arrangement/shortcuts';
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
import {
  guardSoftDisabledClick,
  isSoftDisabledButton,
  softDisabledButtonProps,
} from './studio-soft-disabled';

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
  'inline-flex h-8 items-center gap-1 rounded-md border border-transparent bg-foreground/5 px-2.5 text-sm text-foreground motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none! not-aria-disabled:hover:bg-foreground/8 not-aria-disabled:active:bg-foreground/12 aria-disabled:cursor-not-allowed! aria-disabled:*:opacity-40';

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

function ArrangementProjectEndTextInner({ committedProjectEnd }: { committedProjectEnd: number }) {
  const projectEnd = useArrangementPreview((state) =>
    selectPreviewProjectEnd(state.preview, committedProjectEnd),
  );
  return <span data-testid="arrangement-project-end">{formatArrangementTime(projectEnd)}</span>;
}

const ArrangementProjectEndText = memo(ArrangementProjectEndTextInner);

function preventRepeatedEnterKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.key === 'Enter' && event.repeat) {
    event.preventDefault();
  }
}

interface ArrangementTransportPlayStopProps {
  togglePlayback: () => void;
  returnToStart: () => void;
}

function ArrangementTransportPlayStopInner({
  togglePlayback,
  returnToStart,
}: ArrangementTransportPlayStopProps) {
  const isPlaying = useArrangementIsPlaying();
  const playbackStateId = useId();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!isPlaying) {
            togglePlayback();
          }
        }}
        onKeyDown={preventRepeatedEnterKeyDown}
        aria-label={studioPlaybackStrings.playLabel}
        aria-describedby={playbackStateId}
        title={studioPlaybackStrings.playTitle}
        aria-keyshortcuts={studioShortcutAria('play-stop')}
        data-playing={isPlaying ? 'true' : 'false'}
        className={cn(
          toolButtonClass,
          'w-8 justify-center rounded-full px-0 text-background',
          isPlaying
            ? 'bg-brand not-aria-disabled:hover:bg-brand/92 not-aria-disabled:active:bg-brand/88'
            : 'bg-foreground not-aria-disabled:hover:bg-foreground/92 not-aria-disabled:active:bg-foreground/88',
        )}
      >
        <Play className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => {
          if (isPlaying) {
            togglePlayback();
          }
        }}
        onDoubleClick={returnToStart}
        onKeyDown={preventRepeatedEnterKeyDown}
        aria-label={studioPlaybackStrings.stopLabel}
        aria-describedby={playbackStateId}
        title={studioPlaybackStrings.stopTitle}
        aria-keyshortcuts={studioShortcutAria('play-stop')}
        className={cn(toolButtonClass, 'w-8 justify-center px-0')}
      >
        <Square className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
      </button>
      <span id={playbackStateId} hidden data-testid="arrangement-playback-state">
        {isPlaying
          ? studioPlaybackStrings.playbackStatePlaying
          : studioPlaybackStrings.playbackStateStopped}
      </span>
    </>
  );
}

const ArrangementTransportPlayStop = memo(ArrangementTransportPlayStopInner);

export function ArrangementTransport({ onOpenExport, navigation }: ArrangementTransportProps) {
  const {
    projectEnd: committedProjectEnd,
    undoLabel,
    redoLabel,
    pxPerSecond,
    togglePlayback,
    returnToStart,
    undo,
    redo,
    splitSelection,
    deleteSelection,
    arrangement,
    toggleLoopSelection,
  } = useArrangement();
  const hasRange = useArrangementRange((state) => state.range !== null);
  const hasSelectedClip = useArrangementSelection((state) => state.selectedClipIds.length > 0);
  const isRangeAllTracks = useArrangementRange((state) => state.range?.allTracks === true);
  const loop = arrangement.loop;
  const rangeDeleteHint = hasRange
    ? isRangeAllTracks
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
    if (
      !handoff ||
      !isSoftDisabledButton(handoff.source) ||
      !handoff.partner ||
      isSoftDisabledButton(handoff.partner)
    ) {
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

  return (
    <div
      data-testid="arrangement-transport"
      className="grid grid-cols-2 items-center gap-x-3 gap-y-1.5 border-b border-outline bg-surface px-3 py-2 [grid-template-areas:'centre_centre'_'edit_view'] min-[1408px]:grid-cols-[1fr_auto_1fr] min-[1408px]:[grid-template-areas:none]"
    >
      <div
        data-testid="arrangement-transport-edit"
        className="flex items-center gap-1.5 justify-self-start [grid-area:edit] min-[1408px]:[grid-area:auto]"
      >
        <button
          ref={undoButtonRef}
          type="button"
          onClick={guardSoftDisabledClick((event) => {
            armFocusHandoff(event.currentTarget, redoButtonRef.current);
            undo();
          })}
          onKeyDown={preventRepeatedEnterKeyDown}
          {...softDisabledButtonProps(!undoLabel)}
          title={studioEditStrings.undoTitle(undoLabel)}
          aria-keyshortcuts={studioShortcutAria('undo')}
          className={cn(toolButtonClass, 'w-28')}
        >
          <Undo2 className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span className="truncate">Undo{undoLabel ? `: ${undoLabel}` : ''}</span>
        </button>
        <button
          ref={redoButtonRef}
          type="button"
          onClick={guardSoftDisabledClick((event) => {
            armFocusHandoff(event.currentTarget, undoButtonRef.current);
            redo();
          })}
          onKeyDown={preventRepeatedEnterKeyDown}
          {...softDisabledButtonProps(!redoLabel)}
          title={studioEditStrings.redoTitle(redoLabel)}
          aria-keyshortcuts={studioShortcutAria('redo')}
          className={cn(toolButtonClass, 'w-28')}
        >
          <Redo2 className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span className="truncate">Redo{redoLabel ? `: ${redoLabel}` : ''}</span>
        </button>
        <div className="mx-1 h-6 w-px bg-outline" />
        <button
          type="button"
          onClick={guardSoftDisabledClick((event) => {
            splitSelection();
          })}
          {...softDisabledButtonProps(!hasRange && !hasSelectedClip)}
          title={
            hasRange
              ? studioEditStrings.splitRangeTitle
              : hasSelectedClip
                ? studioEditStrings.splitAtInsertMarkerTitle
                : studioEditStrings.splitNeedsTargetTitle
          }
          aria-keyshortcuts={studioShortcutAria('split')}
          className={cn(toolButtonClass, 'gap-0.75')}
        >
          <Scissors className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>Split</span>
        </button>
        <button
          type="button"
          onClick={guardSoftDisabledClick((event) => {
            armFocusHandoff(event.currentTarget, undoButtonRef.current);
            deleteSelection();
          })}
          onKeyDown={preventRepeatedEnterKeyDown}
          {...softDisabledButtonProps(!hasRange && !hasSelectedClip)}
          title={
            rangeDeleteHint ??
            (hasSelectedClip
              ? studioEditStrings.deleteClipTitle
              : studioEditStrings.deleteNeedsTargetTitle)
          }
          aria-label={
            rangeDeleteHint ??
            (hasSelectedClip ? studioEditStrings.deleteClipLabel : studioEditStrings.deleteButton)
          }
          aria-keyshortcuts={studioShortcutAria('delete')}
          className={cn(toolButtonClass, 'gap-0.5', hasRange && 'border-foreground')}
        >
          <Delete className="size-5 shrink-0" strokeWidth={1.2} aria-hidden="true" />
          <span>{studioEditStrings.deleteButton}</span>
        </button>
      </div>
      <div
        data-testid="arrangement-transport-centre"
        className="flex items-center gap-1.5 justify-self-center [grid-area:centre] min-[1408px]:[grid-area:auto]"
      >
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
              'border-foreground bg-foreground/20 not-aria-disabled:hover:bg-foreground/20 not-aria-disabled:active:bg-foreground/20',
            navigation.followMode === 'paused' && 'border-dashed border-foreground',
          )}
          data-testid="arrangement-follow"
          data-follow-mode={navigation.followMode}
        >
          {navigation.followMode === 'paused' ? 'Follow ‖' : 'Follow'}
        </button>
        <div className="flex items-baseline gap-2 rounded-md bg-background px-3 py-1 font-mono tabular-nums">
          <ArrangementTransportPosition />
          <span className="text-xs text-muted">
            {studioPlaybackStrings.projectEndPrefix}{' '}
            <ArrangementProjectEndText committedProjectEnd={committedProjectEnd} />
          </span>
        </div>
        <ArrangementTransportPlayStop
          togglePlayback={togglePlayback}
          returnToStart={returnToStart}
        />
        <button
          type="button"
          onClick={returnToStart}
          aria-label={studioPlaybackStrings.backToStartLabel}
          title={studioPlaybackStrings.backToStartTitle}
          aria-keyshortcuts={studioShortcutAria('back-to-start')}
          className={toolButtonClass}
        >
          <ArrowLeftToLine className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={guardSoftDisabledClick((event) => {
            toggleLoopSelection();
          })}
          {...softDisabledButtonProps(!hasRange && !loop)}
          aria-pressed={loop?.enabled === true}
          title={
            hasRange
              ? studioLoopStrings.selectionTitle
              : loop
                ? studioLoopStrings.toggleTitle
                : studioLoopStrings.needsSelectionTitle
          }
          aria-keyshortcuts={studioShortcutAria('loop')}
          className={cn(
            toolButtonClass,
            'gap-0.75',
            loop?.enabled &&
              'border-foreground bg-foreground/20 not-aria-disabled:hover:bg-foreground/20 not-aria-disabled:active:bg-foreground/20',
          )}
        >
          <Repeat className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>Loop</span>
        </button>
      </div>
      <div
        data-testid="arrangement-transport-view"
        className="flex items-center gap-1.5 justify-self-end [grid-area:view] min-[1408px]:[grid-area:auto]"
      >
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
          onClick={guardSoftDisabledClick((event) => {
            navigation.onZoomToRange();
          })}
          {...softDisabledButtonProps(!hasRange)}
          aria-label={studioViewStrings.zoomToSelectionLabel}
          aria-keyshortcuts="Z"
          title={
            hasRange
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
          onClick={guardSoftDisabledClick((event) => {
            armFocusHandoff(event.currentTarget, fitButtonRef.current);
            navigation.onZoomBack();
          })}
          onKeyDown={preventRepeatedEnterKeyDown}
          {...softDisabledButtonProps(!navigation.canZoomBack)}
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
