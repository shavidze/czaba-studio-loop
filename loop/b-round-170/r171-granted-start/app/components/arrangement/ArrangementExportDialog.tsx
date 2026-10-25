import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { Modal, ModalBody, ModalDescription, ModalHeader, ModalTitle } from '~/components/ui';
import { formatArrangementTime, useArrangement } from '~/contexts/ArrangementContext';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import { dialogTabStopFocusTarget, groupDialogTabStops } from '~/lib/arrangement/dialog-tab-stops';
import { formatArrangementExportProgress } from '~/lib/arrangement/export-progress';
import { formatMasterGainDb } from '~/lib/arrangement/model';
import { arrangementRangeRenderWindow } from '~/lib/arrangement/render-window';
import { isTrackAudibleWithGroups } from '~/lib/arrangement/schedule';
import { studioExportStrings, studioTimeTextParts } from '~/lib/arrangement/strings';
import { arrangementHasVideoFades } from '~/lib/arrangement/video-fades';
import { cn } from '~/lib/utils';
import type { WorkspaceVideoSource } from '~/types/arrangement';
import { ArrangementTimeText } from './ArrangementTimeText';

interface ArrangementExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ArrangementExportScope = 'project' | 'range';

type ArrangementExportFormat = 'wav' | 'mp3' | 'both';

const EXPORT_FORMAT_BUTTON_LABELS: Record<ArrangementExportFormat, string> = {
  wav: studioExportStrings.formatButtonWav,
  mp3: studioExportStrings.formatButtonMp3,
  both: studioExportStrings.formatButtonBoth,
};

const EXPORT_FORMAT_CREATES: Record<ArrangementExportFormat, string> = {
  wav: studioExportStrings.formatCreatesWav,
  mp3: studioExportStrings.formatCreatesMp3,
  both: studioExportStrings.formatCreatesBoth,
};

const MP3_FORMAT_NOTE = studioExportStrings.mp3FormatNote;

const BOTH_FORMAT_NOTE = studioExportStrings.bothFormatNote;

const EXPORT_RANGE_MISSING_REASON = studioExportStrings.rangeMissingReason;

const VIDEO_RENDER_REASON = studioExportStrings.videoRenderReason;

const VIDEO_FADES_PREVIEW_ONLY_NOTE = studioExportStrings.videoFadesPreviewNote;

export const ARRANGEMENT_EXPORT_FOOTER_FOCUS_MARGIN_PX = 8;

const EXPORT_DIALOG_FOCUSABLE_SELECTOR = [
  'button:not([tabindex="-1"])',
  'input:not([type="hidden"]):not([tabindex="-1"])',
  'select:not([tabindex="-1"])',
  'textarea:not([tabindex="-1"])',
  'a[href]:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function exportDialogFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(EXPORT_DIALOG_FOCUSABLE_SELECTOR),
  ).filter((element) => !element.matches(':disabled') && element.closest('[hidden]') === null);
}

function videoSoundStatus(source: WorkspaceVideoSource, isAudible: boolean): string {
  if (source.audio === 'decoding') {
    return studioExportStrings.videoSoundDecoding;
  }
  if (source.audio !== 'ready') {
    return source.audioNote ?? studioExportStrings.videoSoundUnreadable;
  }
  return isAudible ? studioExportStrings.videoSoundIncluded : studioExportStrings.videoSoundOff;
}

export function ArrangementExportDialog({ isOpen, onClose }: ArrangementExportDialogProps) {
  const {
    arrangement,
    projectEnd,
    exportState,
    exportProgress,
    exportWav,
    exportMp3,
    resetExportState,
    cancelExport,
    sourceStates,
    videoSources,
    range,
  } = useArrangement();
  const isEmpty = arrangement.clips.length === 0;
  const isRendering = exportState.phase === 'rendering';
  const progress = useSyncExternalStore(
    exportProgress.subscribeProgress,
    exportProgress.getProgress,
    () => null,
  );
  const rangeWindow = arrangementRangeRenderWindow(range);
  const rangeStart = rangeWindow?.start ?? 0;
  const rangeEnd = rangeWindow?.end ?? 0;
  const hasValidRange = rangeWindow !== null;
  const rangeReasonId = useId();
  const exportOptionIdBase = useId();
  const optionIds = {
    wavName: `${exportOptionIdBase}-wav-name`,
    wavNote: `${exportOptionIdBase}-wav-note`,
    mp3Name: `${exportOptionIdBase}-mp3-name`,
    mp3Note: `${exportOptionIdBase}-mp3-note`,
    bothName: `${exportOptionIdBase}-both-name`,
    bothNote: `${exportOptionIdBase}-both-note`,
    videoName: `${exportOptionIdBase}-video-name`,
    videoNote: `${exportOptionIdBase}-video-note`,
    rangeName: `${exportOptionIdBase}-range-name`,
  };
  const [scopeChoice, setScopeChoice] = useState<ArrangementExportScope | null>(null);
  const [exportFormat, setExportFormat] = useState<ArrangementExportFormat>('wav');
  const isRangeScope = hasValidRange && (scopeChoice ?? 'range') === 'range';
  const rangeSeconds = studioExportStrings.rangeSeconds(rangeEnd - rangeStart);
  const videoTrack = arrangement.tracks.find((track) => track.kind === 'video');
  const isVideoAudible = videoTrack ? isTrackAudibleWithGroups(videoTrack, arrangement) : false;
  const usedVideoSources = [
    ...new Set(
      arrangement.clips
        .filter((clip) => clip.trackId === videoTrack?.id)
        .map((clip) => clip.sourceId),
    ),
  ].flatMap((sourceId) => {
    const source = videoSources.get(sourceId);
    return source ? [source] : [];
  });
  const hasVideoFades = arrangementHasVideoFades(arrangement);
  const isDecoding = usedVideoSources.some((source) => source.audio === 'decoding');
  const hasSoundingClip = arrangement.clips.some(
    (clip) =>
      sourceStates[clip.sourceId]?.status === 'ready' ||
      videoSources.get(clip.sourceId)?.audio === 'ready',
  );

  const dialogContentRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      if (opener?.isConnected && !opener.matches(':disabled')) {
        opener.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setScopeChoice(null);
      setExportFormat('wav');
    }
  }, [isOpen]);

  useEffect(() => {
    const trap = focusTrapRef.current;
    const content = dialogContentRef.current;
    if (!isOpen || !trap || !content) {
      return;
    }
    const active = document.activeElement;
    if (active instanceof HTMLElement && exportDialogFocusableElements(content).includes(active)) {
      return;
    }
    const close = closeButtonRef.current;
    if (close && !isRendering) {
      close.focus();
    } else {
      trap.focus();
    }
  }, [isOpen, isRendering]);

  useEffect(() => {
    const content = dialogContentRef.current;
    if (!isOpen || !content) {
      return;
    }
    const handleDialogTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }
      const focusable = exportDialogFocusableElements(content);
      const stops = groupDialogTabStops(focusable);
      const firstStop = stops[0];
      const lastStop = stops[stops.length - 1];
      if (!firstStop || !lastStop) {
        return;
      }
      const active = document.activeElement;
      let target: HTMLElement | null = null;
      if (!(active instanceof HTMLElement) || !focusable.includes(active)) {
        target = dialogTabStopFocusTarget(event.shiftKey ? lastStop : firstStop);
      } else if (event.shiftKey && firstStop.includes(active)) {
        target = dialogTabStopFocusTarget(lastStop);
      } else if (!event.shiftKey && lastStop.includes(active)) {
        target = dialogTabStopFocusTarget(firstStop);
      }
      if (!target) {
        return;
      }
      event.preventDefault();
      target.focus();
    };
    content.addEventListener('keydown', handleDialogTabKey);
    return () => content.removeEventListener('keydown', handleDialogTabKey);
  }, [isOpen]);

  useEffect(() => {
    const content = dialogContentRef.current;
    if (!isOpen || !content) {
      return;
    }
    const handleFooterFocusOverlap = (event: FocusEvent) => {
      const footer = footerRef.current;
      const target = event.target;
      if (
        !footer ||
        !(target instanceof HTMLElement) ||
        footer.contains(target) ||
        target.contains(footer)
      ) {
        return;
      }
      const card = target.closest('label');
      const cardBottom =
        card && content.contains(card)
          ? card.getBoundingClientRect().bottom
          : Number.NEGATIVE_INFINITY;
      const coveredBottom = Math.max(target.getBoundingClientRect().bottom, cardBottom);
      const overlap = coveredBottom - footer.getBoundingClientRect().top;
      if (overlap > 0) {
        content.scrollTop += overlap + ARRANGEMENT_EXPORT_FOOTER_FOCUS_MARGIN_PX;
      }
    };
    content.addEventListener('focusin', handleFooterFocusOverlap);
    return () => content.removeEventListener('focusin', handleFooterFocusOverlap);
  }, [isOpen]);

  const progressText = isRendering && progress ? formatArrangementExportProgress(progress) : null;
  const handleClose = () => {
    if (isRendering) {
      return;
    }
    resetExportState();
    onClose();
  };

  return (
    <Modal
      ref={dialogContentRef}
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      aria-labelledby="arrangement-export-title"
    >
      <div ref={focusTrapRef} tabIndex={-1} className="focus:outline-none">
        <ModalHeader>
          <ModalTitle id="arrangement-export-title">Export</ModalTitle>
          <ModalDescription>
            {isRangeScope ? (
              <ArrangementTimeText
                parts={studioTimeTextParts.exportRangeScope({
                  start: formatArrangementTime(rangeStart),
                  end: formatArrangementTime(rangeEnd),
                  seconds: rangeSeconds,
                })}
              />
            ) : (
              <ArrangementTimeText
                parts={studioTimeTextParts.exportProjectScope({
                  start: '00:00.000',
                  end: formatArrangementTime(projectEnd),
                })}
              />
            )}
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4 pb-0">
          <fieldset className="space-y-2">
            <legend className="sr-only">{studioExportStrings.formatLegend}</legend>
            <label
              className={cn(
                'flex items-center gap-3 rounded-sm border p-3 text-sm text-foreground',
                exportFormat === 'wav' ? 'border-brand bg-brand/10' : 'border-outline',
              )}
            >
              <input
                type="radio"
                name="arrangement-export-format"
                data-testid="arrangement-export-format-wav"
                checked={exportFormat === 'wav'}
                onChange={() => setExportFormat('wav')}
                aria-labelledby={optionIds.wavName}
                aria-describedby={optionIds.wavNote}
                className="accent-brand"
              />
              <span>
                <span id={optionIds.wavName}>WAV · 24-bit · 48 kHz · stereo</span>
                <span
                  id={optionIds.wavNote}
                  className="block text-xs text-muted"
                  data-testid="arrangement-export-graph-note"
                >
                  {isRangeScope
                    ? arrangement.loop?.enabled
                      ? studioExportStrings.wavNoteRangeLoop
                      : studioExportStrings.wavNoteRange
                    : arrangement.loop?.enabled
                      ? studioExportStrings.wavNoteProjectLoop
                      : studioExportStrings.wavNoteProject}
                </span>
              </span>
            </label>
            <label
              className={cn(
                'flex items-center gap-3 rounded-sm border p-3 text-sm text-foreground',
                exportFormat === 'mp3' ? 'border-brand bg-brand/10' : 'border-outline',
              )}
            >
              <input
                type="radio"
                name="arrangement-export-format"
                data-testid="arrangement-export-format-mp3"
                checked={exportFormat === 'mp3'}
                onChange={() => setExportFormat('mp3')}
                aria-labelledby={optionIds.mp3Name}
                aria-describedby={optionIds.mp3Note}
                className="accent-brand"
              />
              <span>
                <span id={optionIds.mp3Name}>MP3 · 48 kHz · stereo</span>
                <span id={optionIds.mp3Note} className="block text-xs text-muted">
                  {MP3_FORMAT_NOTE}
                </span>
              </span>
            </label>
            <label
              className={cn(
                'flex items-center gap-3 rounded-sm border p-3 text-sm text-foreground',
                exportFormat === 'both' ? 'border-brand bg-brand/10' : 'border-outline',
              )}
            >
              <input
                type="radio"
                name="arrangement-export-format"
                data-testid="arrangement-export-format-both"
                checked={exportFormat === 'both'}
                onChange={() => setExportFormat('both')}
                aria-labelledby={optionIds.bothName}
                aria-describedby={optionIds.bothNote}
                className="accent-brand"
              />
              <span>
                <span id={optionIds.bothName}>{studioExportStrings.bothOptionName}</span>
                <span id={optionIds.bothNote} className="block text-xs text-muted">
                  {BOTH_FORMAT_NOTE}
                </span>
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-sm border border-outline p-3 text-sm text-dim">
              <input
                type="radio"
                name="arrangement-export-format"
                disabled
                aria-labelledby={optionIds.videoName}
                aria-describedby={optionIds.videoNote}
              />
              <span>
                <span id={optionIds.videoName}>{studioExportStrings.videoOptionName}</span>
                <span id={optionIds.videoNote} className="block text-xs">
                  {VIDEO_RENDER_REASON}
                </span>
              </span>
            </label>
            {hasVideoFades ? (
              <p className="px-3 text-xs text-muted" data-testid="arrangement-export-video-fades">
                {VIDEO_FADES_PREVIEW_ONLY_NOTE}
              </p>
            ) : null}
          </fieldset>
          <fieldset className="space-y-2" data-testid="arrangement-export-scope">
            <legend className="mb-2 text-sm font-medium text-foreground">
              {studioExportStrings.scopeLegend}
            </legend>
            <label
              className={cn(
                'flex items-center gap-3 rounded-sm border p-3 text-sm',
                isRangeScope
                  ? 'border-outline text-foreground'
                  : 'border-brand bg-brand/10 text-foreground',
              )}
            >
              <input
                type="radio"
                name="arrangement-export-scope"
                data-testid="arrangement-export-scope-project"
                checked={!isRangeScope}
                disabled={isRendering}
                onChange={() => setScopeChoice('project')}
                className="accent-brand"
              />
              <span>
                <ArrangementTimeText
                  parts={studioTimeTextParts.exportProjectScope({
                    start: '00:00.000',
                    end: formatArrangementTime(projectEnd),
                  })}
                />
              </span>
            </label>
            <label
              className={cn(
                'flex items-center gap-3 rounded-sm border p-3 text-sm',
                isRangeScope
                  ? 'border-brand bg-brand/10 text-foreground'
                  : hasValidRange
                    ? 'border-outline text-foreground'
                    : 'border-outline text-dim',
              )}
            >
              <input
                type="radio"
                name="arrangement-export-scope"
                data-testid="arrangement-export-scope-range"
                checked={isRangeScope}
                disabled={!hasValidRange || isRendering}
                aria-describedby={hasValidRange ? undefined : rangeReasonId}
                aria-labelledby={hasValidRange ? undefined : optionIds.rangeName}
                onChange={() => setScopeChoice('range')}
                className="accent-brand"
              />
              {hasValidRange ? (
                <span>
                  <ArrangementTimeText
                    parts={studioTimeTextParts.exportRangeScope({
                      start: formatArrangementTime(rangeStart),
                      end: formatArrangementTime(rangeEnd),
                      seconds: rangeSeconds,
                    })}
                  />
                </span>
              ) : (
                <span>
                  <span id={optionIds.rangeName}>{studioExportStrings.rangeOptionName}</span>
                  <span
                    id={rangeReasonId}
                    className="block text-xs"
                    data-testid="arrangement-export-scope-range-reason"
                  >
                    {EXPORT_RANGE_MISSING_REASON}
                  </span>
                </span>
              )}
            </label>
          </fieldset>
          {arrangement.loop ? (
            <p
              className="text-sm text-muted"
              role="note"
              data-testid="arrangement-export-loop-note"
            >
              {isRangeScope ? (
                <ArrangementTimeText
                  parts={studioTimeTextParts.exportLoopRangeNote({
                    start: formatArrangementTime(rangeStart),
                    end: formatArrangementTime(rangeEnd),
                    seconds: rangeSeconds,
                  })}
                />
              ) : (
                <ArrangementTimeText
                  parts={studioTimeTextParts.exportLoopProjectNote({
                    start: '00:00.000',
                    end: formatArrangementTime(projectEnd),
                  })}
                />
              )}
            </p>
          ) : null}
          {usedVideoSources.length > 0 ? (
            <ul
              className="space-y-1 text-sm text-foreground"
              data-testid="arrangement-export-video-sound"
            >
              {usedVideoSources.map((source) => (
                <li key={source.id}>
                  {studioExportStrings.videoSoundLabel(source.name)}{' '}
                  <span className="text-muted">{videoSoundStatus(source, isVideoAudible)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {!isEmpty && !isDecoding && !hasSoundingClip ? (
            <p className="text-sm text-muted" role="note">
              {studioExportStrings.noSoundNote(
                EXPORT_FORMAT_CREATES[exportFormat],
                isRangeScope ? rangeSeconds : formatArrangementTime(projectEnd),
              )}
            </p>
          ) : null}
          {arrangement.master.mute ? (
            <p
              className="text-sm text-muted"
              role="note"
              data-testid="arrangement-export-master-mute"
            >
              {studioExportStrings.masterMutedNote(
                EXPORT_FORMAT_CREATES[exportFormat],
                isRangeScope ? rangeSeconds : formatArrangementTime(projectEnd),
              )}
            </p>
          ) : null}
          {arrangement.master.gainDb !== 0 && !arrangement.master.mute ? (
            <p className="text-sm text-muted" data-testid="arrangement-export-master-gain">
              {studioExportStrings.masterGainNote(formatMasterGainDb(arrangement.master.gainDb))}
            </p>
          ) : null}
          {isEmpty ? (
            <p className="text-sm text-accent" role="note">
              {studioExportStrings.emptyProjectNote}
            </p>
          ) : null}
          <div
            ref={footerRef}
            data-testid="arrangement-export-footer"
            className="sticky bottom-0 -mx-8 space-y-4 border-t border-outline bg-surface px-8 py-4"
          >
            {exportState.message ? (
              <p
                role={exportState.phase === 'error' ? 'alert' : 'status'}
                className={cn(
                  'text-sm',
                  exportState.phase === 'error' && 'text-destructive',
                  exportState.phase === 'done' && 'text-positive',
                  (exportState.phase === 'rendering' || exportState.phase === 'cancelled') &&
                    'text-muted',
                )}
              >
                {exportState.message}
              </p>
            ) : null}
            {isRendering && progress ? (
              <>
                <p
                  aria-hidden="true"
                  className="text-xs text-muted"
                  data-testid="arrangement-export-progress-label"
                >
                  {progressText}
                </p>
                <progress
                  data-testid="arrangement-export-progress"
                  aria-label={studioExportStrings.progressAriaLabel}
                  aria-valuetext={progressText ?? undefined}
                  max={1}
                  value={progress.fraction ?? undefined}
                  className="h-2 w-full accent-brand"
                />
              </>
            ) : null}
            {exportState.warning ? (
              <p
                role="alert"
                className="text-sm text-accent"
                data-testid="arrangement-export-overload"
              >
                {exportState.warning}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              {isRendering ? (
                <button
                  type="button"
                  data-testid="arrangement-export-cancel"
                  onClick={cancelExport}
                  className="rounded-sm border border-outline px-4 py-2 text-sm text-foreground hover:border-outline-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {studioExportStrings.cancelButton}
                </button>
              ) : null}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && event.repeat) {
                    event.preventDefault();
                  }
                }}
                disabled={isRendering}
                className="rounded-sm border border-outline px-4 py-2 text-sm text-foreground hover:border-outline-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-40"
              >
                {studioExportStrings.closeButton}
              </button>
              <button
                type="button"
                onClick={() => {
                  const renderWindow = isRangeScope
                    ? { start: rangeStart, end: rangeEnd }
                    : undefined;
                  if (exportFormat === 'wav') {
                    void (renderWindow ? exportWav(renderWindow) : exportWav());
                  } else if (exportFormat === 'mp3') {
                    void (renderWindow ? exportMp3(renderWindow) : exportMp3());
                  } else {
                    void exportMp3(renderWindow, { includeWav: true });
                  }
                }}
                disabled={isEmpty || isRendering || isDecoding}
                className="rounded-sm border border-brand bg-brand px-4 py-2 text-sm font-medium text-brand-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isRendering
                  ? studioExportStrings.busyButton
                  : EXPORT_FORMAT_BUTTON_LABELS[exportFormat]}
              </button>
            </div>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
}
