import { AlertCircle, Loader2, Pause, Play } from 'lucide-react';
import type { RecordingPlaybackStatus } from '~/hooks/useRecordingPlayer';
import type { ProductRecording } from '~/services/api/client';

interface RecordingCatalogRowProps {
  recording: ProductRecording;
  isActive: boolean;
  status: RecordingPlaybackStatus;
  currentTime: number;
  duration: number;
  errorMessage: string | null;
  onTogglePlayback: (recordingId: number) => void;
  onQuickEdit?: (recordingId: number) => void;
  onSeek: (recordingId: number, time: number) => void;
}

const ROW_STATUS_TEXT: Record<RecordingPlaybackStatus, string> = {
  idle: '',
  loading: 'Loading',
  playing: 'Playing',
  paused: 'Paused',
  error: 'Playback failed',
};

export function formatRecordingTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function formatRecordingSpecs(recording: ProductRecording): string {
  const sampleRate = `${Number((recording.sampleRateHz / 1000).toFixed(1))} kHz`;
  const channelNames: Record<number, string> = { 1: 'Mono', 2: 'Stereo' };
  const channels = channelNames[recording.channels] ?? `${recording.channels} ch`;
  return `${sampleRate} · ${recording.bitDepth}-bit · ${channels}`;
}

export function RecordingCatalogRow({
  recording,
  isActive,
  status,
  currentTime,
  duration,
  errorMessage,
  onTogglePlayback,
  onSeek,
  onQuickEdit,
}: RecordingCatalogRowProps) {
  const rowStatus: RecordingPlaybackStatus = isActive ? status : 'idle';
  const totalSeconds = isActive && duration > 0 ? duration : recording.durationMs / 1000;
  const position = isActive ? Math.min(currentTime, totalSeconds) : 0;
  const isPlaying = rowStatus === 'playing';
  const isLoading = rowStatus === 'loading';
  const actionLabel = `${isPlaying || isLoading ? 'Pause' : 'Play'} ${recording.title}`;

  return (
    <li
      className={[
        'rounded-xl border p-4 sm:p-5 transition-colors',
        isActive ? 'border-brand/40 bg-brand/5' : 'border-outline/60 bg-surface/50',
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => onTogglePlayback(recording.id)}
          aria-label={actionLabel}
          title={actionLabel}
          className={[
            'shrink-0 w-12 h-12 rounded-full inline-flex items-center justify-center',
            'transition-all active:scale-95',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            isActive
              ? 'bg-brand text-background hover:bg-brand-hover'
              : 'bg-elevated text-foreground border border-outline hover:text-brand',
          ].join(' ')}
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" aria-hidden="true" />
          ) : isPlaying ? (
            <Pause size={20} aria-hidden="true" />
          ) : (
            <Play size={20} className="ml-0.5" aria-hidden="true" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-base sm:text-lg font-medium text-foreground break-words">
              <span className="text-dim tabular-nums mr-2">
                {String(recording.position).padStart(2, '0')}
              </span>
              {recording.title}
            </h2>
            <span className="text-sm text-muted tabular-nums">
              {formatRecordingTime(recording.durationMs / 1000)}
            </span>
          </div>
          {recording.description && (
            <p className="mt-1 text-sm text-muted">{recording.description}</p>
          )}
          <p className="mt-1 text-xs text-dim">{formatRecordingSpecs(recording)}</p>

          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={totalSeconds}
              step={0.1}
              value={position}
              disabled={!isActive || rowStatus === 'error'}
              onChange={(event) => onSeek(recording.id, Number(event.currentTarget.value))}
              aria-label={`Seek ${recording.title}`}
              aria-valuetext={`${formatRecordingTime(position)} of ${formatRecordingTime(totalSeconds)}`}
              className="h-8 w-full cursor-pointer accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded disabled:cursor-default disabled:opacity-40"
            />
            <span className="w-24 shrink-0 text-right text-xs text-muted tabular-nums">
              {formatRecordingTime(position)} / {formatRecordingTime(totalSeconds)}
            </span>
          </div>

          {onQuickEdit && (
            <button
              type="button"
              onClick={() => onQuickEdit(recording.id)}
              className="mt-2 min-h-11 rounded-lg border border-outline px-4 text-sm text-brand hover:bg-brand/10 focus-visible:ring-2 focus-visible:ring-brand"
            >
              Quick Edit
            </button>
          )}
          <p className="sr-only" aria-live="polite">
            {isActive ? ROW_STATUS_TEXT[rowStatus] : ''}
          </p>
          {rowStatus === 'error' && errorMessage && (
            <p role="alert" className="mt-2 flex items-start gap-2 text-sm text-destructive">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
