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
  formatArrangementTime,
  useArrangement,
  useArrangementPositionStore,
  useArrangementPositionWriter,
} from '~/contexts/ArrangementContext';
import { normalizePeakColumns } from '~/lib/arrangement/peaks';
import { cn } from '~/lib/utils';

const PREVIEW_WAVE_COLUMNS = 96;
const PREVIEW_KEY_STEP_SECONDS = 1;
const PREVIEW_END_RESTART_SECONDS = 0.05;
const PREVIEW_CURSOR_STEPS_PER_SECOND = 20;

interface ArrangementLibraryPreviewProps {
  sourceId: string | null;
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

function LibraryPlayheadText() {
  const positionStore = useArrangementPositionStore();
  const textRef = useRef<HTMLSpanElement>(null);
  const writeLibraryPlayheadText = useCallback((position: number) => {
    const span = textRef.current;
    if (!span) {
      return;
    }
    const text = formatArrangementTime(position);
    if (span.textContent !== text) {
      span.textContent = text;
    }
  }, []);
  useArrangementPositionWriter(writeLibraryPlayheadText);
  return (
    <span ref={textRef} className="tabular-nums" data-testid="arrangement-library-playhead">
      {formatArrangementTime(positionStore.getPosition())}
    </span>
  );
}

const LibraryPlayheadTextMemo = memo(LibraryPlayheadText);

export function ArrangementLibraryPreview({ sourceId }: ArrangementLibraryPreviewProps) {
  const {
    collection,
    arrangement,
    activeTrackId,
    sourceStates,
    sourcePeaks,
    libraryPreviewSourceId,
    startLibraryPreview,
    stopLibraryPreview,
    getLibraryPreviewOffset,
    addSourceToActiveTrack,
  } = useArrangement();
  const previewCursorRef = useRef<PreviewCursor>({ sourceId: null, seconds: 0 });
  const [previewCursor, setPreviewCursor] = useState<PreviewCursor>(previewCursorRef.current);
  const source = collection.sources.find((entry) => entry.id === sourceId) ?? null;
  const state = source ? sourceStates[source.id] : undefined;
  const isReady = state?.status === 'ready';
  const duration = isReady ? state.duration : 0;
  const isPreviewing = source !== null && libraryPreviewSourceId === source.id;
  const activeTrack = arrangement.tracks.find((track) => track.id === activeTrackId);
  const canAdd = isReady && activeTrack?.kind === 'audio';
  const activeLaneName = activeTrack ? activeTrack.name : '—';
  const activeLaneVideoNote = activeTrack?.kind === 'video' ? ' (აუდიო აქ არ ემატება)' : '';
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
      aria-label="პრევიუ"
      className="shrink-0 space-y-2 border-t border-outline p-3"
      data-testid="arrangement-library-preview"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="min-w-0 truncate text-sm text-foreground" title={source?.title}>
          {source ? source.title : 'აირჩიე ხმა სიიდან'}
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
        aria-label="პრევიუს ტალღა — click = მოსმენა ამ ადგილიდან · ← → 1 წმ · Home/End · Space = ▶/■"
        onClick={handleWaveClick}
        onKeyDown={handleWaveKeyDown}
        className={cn(
          'relative block h-8 w-full overflow-hidden rounded-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
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
        title={`აქტიური ხაზი: ${activeLaneName}${activeLaneVideoNote}`}
      >
        აქტიური ხაზი:{' '}
        <span className="text-foreground">
          {activeLaneName}
          {activeLaneVideoNote}
        </span>{' '}
        · playhead <LibraryPlayheadTextMemo />
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (!source) {
              return;
            }
            if (isPreviewing) {
              stopLibraryPreview();
            } else {
              startLibraryPreview(source.id, 0);
            }
          }}
          disabled={!isReady}
          className={cn(
            'flex-1 rounded-sm border px-2 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40',
            isPreviewing
              ? 'border-accent text-accent hover:bg-accent/10'
              : 'border-outline text-brand hover:border-brand',
          )}
          data-testid="arrangement-library-preview-toggle"
        >
          {isPreviewing ? '■ შეჩერება' : '▶ მოუსმინე'}
        </button>
        <button
          type="button"
          onClick={() => source && addSourceToActiveTrack(source.id)}
          disabled={!canAdd}
          className="flex-1 rounded-sm border border-brand bg-brand/10 px-2 py-1.5 text-sm font-medium text-brand hover:bg-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40"
        >
          ＋ დამატება
        </button>
      </div>
    </section>
  );
}
