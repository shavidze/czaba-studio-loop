import { useEffect, useRef } from 'react';
import { Modal, ModalBody, ModalDescription, ModalHeader, ModalTitle } from '~/components/ui';
import { formatArrangementTime, useArrangement } from '~/contexts/ArrangementContext';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import { formatMasterGainDb } from '~/lib/arrangement/model';
import { isTrackAudible } from '~/lib/arrangement/schedule';
import { cn } from '~/lib/utils';
import type { WorkspaceVideoSource } from '~/types/arrangement';

interface ArrangementExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const UNAVAILABLE_REASON = 'ამ ეტაპზე ხელმისაწვდომი არ არის';

const unavailableOptions = [
  { id: 'mp3', label: 'MP3' },
  { id: 'range', label: 'მხოლოდ მონიშნული მონაკვეთი' },
];

const VIDEO_RENDER_REASON =
  'ვიდეოს რენდერი ამ ციკლში არ კეთდება — ექსპორტი მხოლოდ აუდიოა (ვიდეოს ორიგინალი ხმა შედის, თუ ჩართულია).';

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
    return 'იშიფრება — დაელოდე';
  }
  if (source.audio !== 'ready') {
    return source.audioNote ?? 'ვიდეოს ხმა ვერ წაიკითხა — ექსპორტში არ შევა';
  }
  return isAudible ? 'შედის' : 'გამორთულია (M/Solo)';
}

export function ArrangementExportDialog({ isOpen, onClose }: ArrangementExportDialogProps) {
  const {
    arrangement,
    projectEnd,
    exportState,
    exportWav,
    resetExportState,
    sourceStates,
    videoSources,
  } = useArrangement();
  const isEmpty = arrangement.clips.length === 0;
  const isRendering = exportState.phase === 'rendering';
  const videoTrack = arrangement.tracks.find((track) => track.kind === 'video');
  const isVideoAudible = videoTrack ? isTrackAudible(videoTrack, arrangement.tracks) : false;
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
  const isDecoding = usedVideoSources.some((source) => source.audio === 'decoding');
  const hasSoundingClip = arrangement.clips.some(
    (clip) =>
      sourceStates[clip.sourceId]?.status === 'ready' ||
      videoSources.get(clip.sourceId)?.audio === 'ready',
  );

  const dialogContentRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || !focusable.includes(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    content.addEventListener('keydown', handleDialogTabKey);
    return () => content.removeEventListener('keydown', handleDialogTabKey);
  }, [isOpen]);

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
            მთელი პროექტი · 0:00 — {formatArrangementTime(projectEnd)}
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="sr-only">ფორმატი</legend>
            <label className="flex items-center gap-3 rounded-sm border border-brand bg-brand/10 p-3 text-sm text-foreground">
              <input
                type="radio"
                name="arrangement-export-format"
                checked
                readOnly
                className="accent-brand"
              />
              <span>
                WAV · 24-bit · 48 kHz · stereo
                <span
                  className="block text-xs text-muted"
                  data-testid="arrangement-export-graph-note"
                >
                  {arrangement.loop?.enabled
                    ? 'მთელი პროექტი წრფივად 0-დან ბოლომდე, იგივე მიქსით — loop იგნორირდება'
                    : 'მთელი პროექტი, იგივე graph რაც დაკვრისას'}
                </span>
              </span>
            </label>
            {unavailableOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-3 rounded-sm border border-outline p-3 text-sm text-dim"
              >
                <input type="radio" name="arrangement-export-format" disabled />
                <span>
                  {option.label}
                  <span className="block text-xs">{UNAVAILABLE_REASON}</span>
                </span>
              </label>
            ))}
            <label className="flex items-center gap-3 rounded-sm border border-outline p-3 text-sm text-dim">
              <input type="radio" name="arrangement-export-format" disabled />
              <span>
                ვიდეო (აუდიოთი)
                <span className="block text-xs">{VIDEO_RENDER_REASON}</span>
              </span>
            </label>
          </fieldset>
          {arrangement.loop ? (
            <p
              className="text-sm text-muted"
              role="note"
              data-testid="arrangement-export-loop-note"
            >
              Loop ექსპორტს არ ცვლის — იქმნება მთელი პროექტი (00:00.000 —{' '}
              {formatArrangementTime(projectEnd)}).
            </p>
          ) : null}
          {usedVideoSources.length > 0 ? (
            <ul
              className="space-y-1 text-sm text-foreground"
              data-testid="arrangement-export-video-sound"
            >
              {usedVideoSources.map((source) => (
                <li key={source.id}>
                  ვიდეოს ორიგინალი ხმა ({source.name}):{' '}
                  <span className="text-muted">{videoSoundStatus(source, isVideoAudible)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {!isEmpty && !isDecoding && !hasSoundingClip ? (
            <p className="text-sm text-muted" role="note">
              პროექტში ხმოვანი კლიპი არ არის — WAV შეიქმნება {formatArrangementTime(projectEnd)}{' '}
              სიგრძის სიჩუმით.
            </p>
          ) : null}
          {arrangement.master.mute ? (
            <p
              className="text-sm text-muted"
              role="note"
              data-testid="arrangement-export-master-mute"
            >
              Master დადუმებულია (M) — WAV შეიქმნება {formatArrangementTime(projectEnd)} სიგრძის
              სიჩუმით. ჩართე Master, თუ ხმა გჭირდება.
            </p>
          ) : null}
          {arrangement.master.gainDb !== 0 && !arrangement.master.mute ? (
            <p className="text-sm text-muted" data-testid="arrangement-export-master-gain">
              Master: {formatMasterGainDb(arrangement.master.gainDb)} — ექსპორტში შედის.
            </p>
          ) : null}
          {isEmpty ? (
            <p className="text-sm text-accent" role="note">
              ექსპორტი გამორთულია: პროექტი ცარიელია — დაამატე მინიმუმ ერთი კლიპი.
            </p>
          ) : null}
          {exportState.message ? (
            <p
              role={exportState.phase === 'error' ? 'alert' : 'status'}
              className={cn(
                'text-sm',
                exportState.phase === 'error' && 'text-destructive',
                exportState.phase === 'done' && 'text-positive',
                exportState.phase === 'rendering' && 'text-muted',
              )}
            >
              {exportState.message}
            </p>
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
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              disabled={isRendering}
              className="rounded-sm border border-outline px-4 py-2 text-sm text-foreground hover:border-outline-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-40"
            >
              დახურვა
            </button>
            <button
              type="button"
              onClick={() => void exportWav()}
              disabled={isEmpty || isRendering || isDecoding}
              className="rounded-sm border border-brand bg-brand px-4 py-2 text-sm font-medium text-brand-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isRendering ? 'მიმდინარეობს…' : 'WAV-ის ექსპორტი'}
            </button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
}
