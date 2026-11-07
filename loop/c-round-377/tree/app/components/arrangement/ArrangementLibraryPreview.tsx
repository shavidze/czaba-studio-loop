import { Play, Plus, Square } from 'lucide-react';
import {
  type KeyboardEvent,
  type MouseEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type ArrangementContextValue,
  formatArrangementTime,
  useArrangement,
  useArrangementActiveTrackId,
  useArrangementInsertMarkerStore,
} from '~/contexts/ArrangementContext';
import { normalizePeakColumns } from '~/lib/arrangement/peaks';
import { studioLibraryPanelStrings } from '~/lib/arrangement/strings';
import { cn } from '~/lib/utils';
import type { ArrangementTrackKind } from '~/types/arrangement';
import { guardSoftDisabledClick, softDisabledButtonProps } from './studio-soft-disabled';

const PREVIEW_WAVE_COLUMNS = 96;
const PREVIEW_KEY_STEP_SECONDS = 1;
const PREVIEW_END_RESTART_SECONDS = 0.05;
const PREVIEW_CURSOR_STEPS_PER_SECOND = 20;

interface ArrangementLibraryPreviewProps {
  sourceId: string | null;
}

export interface LibraryTrackLabel {
  readonly id: string;
  readonly kind: ArrangementTrackKind;
  readonly name: string;
}

export type ArrangementLibraryPreviewActions = Pick<
  ArrangementContextValue,
  | 'startLibraryPreview'
  | 'stopLibraryPreview'
  | 'getLibraryPreviewOffset'
  | 'addSourceToActiveTrack'
>;

interface ArrangementLibraryPreviewViewProps {
  sourceId: string | null;
  collection: ArrangementContextValue['collection'];
  sourceStates: ArrangementContextValue['sourceStates'];
  sourcePeaks: ArrangementContextValue['sourcePeaks'];
  libraryPreviewSourceId: string | null;
  tracks: readonly LibraryTrackLabel[];
  actions: ArrangementLibraryPreviewActions;
}

export function sameLibraryTrackLabels(
  previous: readonly LibraryTrackLabel[],
  next: readonly LibraryTrackLabel[],
): boolean {
  if (previous === next) {
    return true;
  }
  if (previous.length !== next.length) {
    return false;
  }
  return previous.every((track, index) => {
    const other = next.at(index);
    return (
      other !== undefined &&
      track.id === other.id &&
      track.kind === other.kind &&
      track.name === other.name
    );
  });
}

export function sameLibraryLeafProps<Props extends { tracks: readonly LibraryTrackLabel[] }>(
  previous: Props,
  next: Props,
): boolean {
  for (const key in previous) {
    if (key !== 'tracks' && !Object.is(previous[key], next[key])) {
      return false;
    }
  }
  for (const key in next) {
    if (!(key in previous)) {
      return false;
    }
  }
  return sameLibraryTrackLabels(previous.tracks, next.tracks);
}

interface PreviewCursor {
  sourceId: string | null;
  seconds: number;
}

interface PreviewWaveColumn {
  id: string;
  height: number;
}

function previewWaveColumns(peaks: Float32Array | undefined): PreviewWaveColumn[] {
  if (!peaks || peaks.length === 0) {
    return [];
  }
  const perColumn = peaks.length / PREVIEW_WAVE_COLUMNS;
  const maxima = Array.from({ length: PREVIEW_WAVE_COLUMNS }, (_, column) => {
    const from = Math.floor(column * perColumn);
    const to = Math.max(from + 1, Math.floor((column + 1) * perColumn));
    let max = 0;
    for (let i = from; i < to && i < peaks.length; i++) {
      max = Math.max(max, peaks[i]);
    }
    return max;
  });
  return normalizePeakColumns(maxima).map((height, column) => ({
    id: `wave-${column}`,
    height: Math.max(0.04, height),
  }));
}

function LibraryInsertMarkerText() {
  const insertMarkerStore = useArrangementInsertMarkerStore();
  const textRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const writeLibraryInsertMarkerText = () => {
      const span = textRef.current;
      if (!span) {
        return;
      }
      const text = formatArrangementTime(insertMarkerStore.getPosition());
      if (span.textContent !== text) {
        span.textContent = text;
      }
    };
    writeLibraryInsertMarkerText();
    return insertMarkerStore.subscribePosition(writeLibraryInsertMarkerText);
  }, [insertMarkerStore]);
  return (
    <span
      ref={textRef}
      className="font-mono tabular-nums"
      data-testid="arrangement-library-insert-marker"
    >
      {formatArrangementTime(insertMarkerStore.getPosition())}
    </span>
  );
}

const LibraryInsertMarkerTextMemo = memo(LibraryInsertMarkerText);

export function ArrangementLibraryPreview({ sourceId }: ArrangementLibraryPreviewProps) {
  const {
    collection,
    arrangement,
    sourceStates,
    sourcePeaks,
    libraryPreviewSourceId,
    startLibraryPreview,
    stopLibraryPreview,
    getLibraryPreviewOffset,
    addSourceToActiveTrack,
  } = useArrangement();
  const actions = useMemo(
    (): ArrangementLibraryPreviewActions => ({
      startLibraryPreview,
      stopLibraryPreview,
      getLibraryPreviewOffset,
      addSourceToActiveTrack,
    }),
    [startLibraryPreview, stopLibraryPreview, getLibraryPreviewOffset, addSourceToActiveTrack],
  );
  return (
    <ArrangementLibraryPreviewView
      sourceId={sourceId}
      collection={collection}
      sourceStates={sourceStates}
      sourcePeaks={sourcePeaks}
      libraryPreviewSourceId={libraryPreviewSourceId}
      tracks={arrangement.tracks}
      actions={actions}
    />
  );
}

function ArrangementLibraryPreviewViewInner({
  sourceId,
  collection,
  sourceStates,
  sourcePeaks,
  libraryPreviewSourceId,
  tracks,
  actions,
}: ArrangementLibraryPreviewViewProps) {
  const {
    startLibraryPreview,
    stopLibraryPreview,
    getLibraryPreviewOffset,
    addSourceToActiveTrack,
  } = actions;
  const previewCursorRef = useRef<PreviewCursor>({ sourceId: null, seconds: 0 });
  const [previewCursor, setPreviewCursor] = useState<PreviewCursor>(previewCursorRef.current);
  const source = collection.sources.find((entry) => entry.id === sourceId) ?? null;
  const state = source ? sourceStates[source.id] : undefined;
  const isReady = state?.status === 'ready';
  const duration = isReady ? state.duration : 0;
  const isPreviewing = source !== null && libraryPreviewSourceId === source.id;
  const activeTrackId = useArrangementActiveTrackId();
  const activeTrack = tracks.find((track) => track.id === activeTrackId);
  const canAdd = isReady && activeTrack?.kind === 'audio';
  const previewUnavailableTitle = !source
    ? studioLibraryPanelStrings.previewNeedsSoundTitle
    : state?.status === 'error'
      ? studioLibraryPanelStrings.previewFailedTitle
      : isReady
        ? null
        : studioLibraryPanelStrings.previewLoadingTitle;
  const addTitle = !source
    ? studioLibraryPanelStrings.addNeedsSoundTitle
    : state?.status === 'error'
      ? studioLibraryPanelStrings.addFailedTitle
      : !isReady
        ? studioLibraryPanelStrings.addLoadingTitle
        : activeTrack?.kind !== 'audio'
          ? studioLibraryPanelStrings.addNeedsAudioTrackTitle
          : studioLibraryPanelStrings.addTitle;
  const activeLaneName = activeTrack ? activeTrack.name : '—';
  const activeLaneVideoNote =
    activeTrack?.kind === 'video' ? studioLibraryPanelStrings.videoTrackNote : '';
  const peaks = source ? sourcePeaks.get(source.id) : undefined;
  const columns = useMemo(() => previewWaveColumns(peaks), [peaks]);
  const sourceKey = source?.id ?? null;
  const previewSeconds = previewCursor.sourceId === sourceKey ? previewCursor.seconds : 0;
  const playedColumns =
    duration > 0 ? Math.round(Math.min(1, previewSeconds / duration) * PREVIEW_WAVE_COLUMNS) : 0;

  const readPreviewCursor = () =>
    previewCursorRef.current.sourceId === sourceKey ? previewCursorRef.current.seconds : 0;

  const movePreviewCursor = useCallback(
    (seconds: number) => {
      const next = { sourceId: sourceKey, seconds };
      const shown = previewCursorRef.current;
      previewCursorRef.current = next;
      if (
        shown.sourceId !== next.sourceId ||
        Math.round(shown.seconds * PREVIEW_CURSOR_STEPS_PER_SECOND) !==
          Math.round(seconds * PREVIEW_CURSOR_STEPS_PER_SECOND)
      ) {
        setPreviewCursor(next);
      }
    },
    [sourceKey],
  );

  useEffect(() => {
    if (!isPreviewing || duration <= 0) {
      return;
    }
    let frameId = requestAnimationFrame(function updatePreviewProgress() {
      const offset = getLibraryPreviewOffset();
      if (offset !== null) {
        movePreviewCursor(offset);
      }
      frameId = requestAnimationFrame(updatePreviewProgress);
    });
    return () => cancelAnimationFrame(frameId);
  }, [duration, getLibraryPreviewOffset, isPreviewing, movePreviewCursor]);

  const seekPreviewCursor = (seconds: number) => {
    if (!source || !isReady) {
      return;
    }
    const target = Math.min(duration, Math.max(0, seconds));
    movePreviewCursor(target);
    if (isPreviewing) {
      startLibraryPreview(source.id, target);
    }
  };

  const togglePreviewAtCursor = () => {
    if (!source || !isReady) {
      return;
    }
    if (isPreviewing) {
      const offset = getLibraryPreviewOffset();
      if (offset !== null) {
        movePreviewCursor(offset);
      }
      stopLibraryPreview();
      return;
    }
    const cursor = readPreviewCursor();
    const from = cursor >= duration - PREVIEW_END_RESTART_SECONDS ? 0 : cursor;
    movePreviewCursor(from);
    startLibraryPreview(source.id, from);
  };

  const handleWaveClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!source || !isReady) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
    const target = Math.min(1, Math.max(0, fraction)) * duration;
    movePreviewCursor(target);
    startLibraryPreview(source.id, target);
  };

  const handleWaveKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isReady) {
      return;
    }
    const step =
      event.key === 'ArrowLeft'
        ? -PREVIEW_KEY_STEP_SECONDS
        : event.key === 'ArrowRight'
          ? PREVIEW_KEY_STEP_SECONDS
          : null;
    const isToggle = event.key === ' ' || event.key === 'Enter';
    if (step === null && !isToggle && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (isToggle) {
      if (!event.repeat) {
        togglePreviewAtCursor();
      }
      return;
    }
    if (step !== null) {
      const current = isPreviewing
        ? (getLibraryPreviewOffset() ?? readPreviewCursor())
        : readPreviewCursor();
      seekPreviewCursor(current + step);
      return;
    }
    seekPreviewCursor(event.key === 'Home' ? 0 : duration);
  };

  return (
    <section
      aria-label={studioLibraryPanelStrings.previewLabel}
      className="shrink-0 space-y-2 border-t border-outline p-3"
      data-testid="arrangement-library-preview"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="min-w-0 truncate text-sm text-foreground" title={source?.title}>
          {source ? source.title : studioLibraryPanelStrings.previewEmpty}
        </p>
        <span className="shrink-0 text-xs tabular-nums text-muted">
          {isReady ? formatArrangementTime(duration) : '—'}
        </span>
      </div>
      <div
        role="slider"
        tabIndex={isReady ? 0 : -1}
        aria-disabled={!isReady}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration * 1000) / 1000}
        aria-valuenow={Math.min(Math.round(duration * 1000) / 1000, Math.round(previewSeconds))}
        aria-valuetext={formatArrangementTime(previewSeconds)}
        aria-label={studioLibraryPanelStrings.previewWaveLabel}
        onClick={handleWaveClick}
        onKeyDown={handleWaveKeyDown}
        className={cn(
          'relative block h-8 w-full overflow-hidden rounded-md bg-background',
          isReady ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
        )}
        data-testid="arrangement-library-preview-wave"
      >
        {columns.length > 0 ? (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${columns.length} 2`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {columns.map((entry, column) => (
              <rect
                key={entry.id}
                x={column + 0.15}
                y={1 - entry.height}
                width={0.7}
                height={entry.height * 2}
                className={column < playedColumns ? 'fill-brand' : 'fill-dim'}
              />
            ))}
          </svg>
        ) : null}
      </div>
      <p
        className="line-clamp-2 h-8 text-xs text-muted"
        title={`${studioLibraryPanelStrings.activeTrack} ${activeLaneName}${activeLaneVideoNote}`}
      >
        {studioLibraryPanelStrings.activeTrack}{' '}
        <span className="text-foreground">
          {activeLaneName}
          {activeLaneVideoNote}
        </span>{' '}
        · {studioLibraryPanelStrings.insertMarker} <LibraryInsertMarkerTextMemo />
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={guardSoftDisabledClick(() => {
            if (!source) {
              return;
            }
            if (isPreviewing) {
              stopLibraryPreview();
            } else {
              startLibraryPreview(source.id, 0);
            }
          })}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.repeat) {
              event.preventDefault();
            }
          }}
          {...softDisabledButtonProps(!isReady)}
          title={previewUnavailableTitle ?? undefined}
          className={cn(
            'flex flex-1 items-center justify-center gap-0.75 rounded-md border border-transparent bg-foreground/5 px-2 py-1.5 text-sm font-medium motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none! not-aria-disabled:hover:bg-foreground/8 not-aria-disabled:active:bg-foreground/12 aria-disabled:cursor-not-allowed! aria-disabled:*:opacity-40',
            isPreviewing ? 'border-foreground text-foreground' : 'text-foreground',
          )}
          data-testid="arrangement-library-preview-toggle"
        >
          {isPreviewing ? (
            <Square className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
          ) : (
            <Play className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
          )}
          <span>
            {isPreviewing
              ? studioLibraryPanelStrings.previewStop
              : studioLibraryPanelStrings.previewPlay}
          </span>
        </button>
        <button
          type="button"
          onClick={guardSoftDisabledClick(() => {
            if (source) {
              addSourceToActiveTrack(source.id);
            }
          })}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.repeat) {
              event.preventDefault();
            }
          }}
          {...softDisabledButtonProps(!canAdd)}
          title={addTitle}
          className="flex flex-1 items-center justify-center gap-0.75 rounded-md border border-outline-strong bg-foreground/5 px-2 py-1.5 text-sm font-medium text-foreground motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none! not-aria-disabled:hover:bg-foreground/8 not-aria-disabled:active:bg-foreground/12 aria-disabled:cursor-not-allowed! aria-disabled:*:opacity-40"
        >
          <Plus className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>{studioLibraryPanelStrings.add}</span>
        </button>
      </div>
    </section>
  );
}

export const ArrangementLibraryPreviewView = memo(
  ArrangementLibraryPreviewViewInner,
  sameLibraryLeafProps,
);
