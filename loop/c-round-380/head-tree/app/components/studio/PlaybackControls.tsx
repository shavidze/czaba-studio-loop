import { useStudio } from '~/contexts/StudioContext';

export function PlaybackControls() {
  const { state, togglePlayPause, stop } = useStudio();

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isDisabled = !state.allLoaded;

  return (
    <div className="flex items-center gap-4">
      {/* Stop Button */}
      <button
        onClick={stop}
        disabled={isDisabled || !state.isPlaying}
        className={`bg-transparent border-none p-2 flex items-center justify-center rounded-full transition-all duration-200 ${
          isDisabled || !state.isPlaying
            ? 'text-dim cursor-not-allowed opacity-40'
            : 'text-secondary hover:bg-elevated hover:text-brand cursor-pointer'
        }`}
        aria-label="Stop"
        title="Stop"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="1" />
        </svg>
      </button>

      {/* Play/Pause Button (Main - Styled like AudioPlayer) */}
      <button
        onClick={togglePlayPause}
        disabled={isDisabled}
        className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${
          isDisabled
            ? 'bg-muted-bg text-dim cursor-not-allowed opacity-50'
            : 'bg-brand text-brand-foreground hover:bg-brand-hover hover:scale-105 cursor-pointer'
        }`}
        aria-label={state.isPlaying ? 'Pause' : 'Play'}
        title={state.isPlaying ? 'Pause' : 'Play'}
      >
        {state.isPlaying ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Time Display */}
      <div className="flex items-center gap-2">
        <span className="text-secondary font-mono text-sm tabular-nums min-w-[40px] text-center">
          {formatTime(state.currentTime)}
        </span>
        <span className="text-dim">/</span>
        <span className="text-muted font-mono text-sm tabular-nums min-w-[40px] text-center">
          {formatTime(state.masterDuration)}
        </span>
      </div>
    </div>
  );
}
