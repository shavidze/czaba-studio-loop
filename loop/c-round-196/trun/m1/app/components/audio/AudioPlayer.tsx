import { Link } from '@remix-run/react';
import { Loader2, X } from 'lucide-react';
import { useAudio } from '~/contexts/AudioContext';

export function AudioPlayer() {
  const { state, togglePlayPause, seek, setVolume, skipNext, skipPrevious, closePlayer } =
    useAudio();

  // Don't render if no track is loaded
  if (!state.currentTrack) {
    return null;
  }

  const { currentTrack, isPlaying, isLoading, error, volume, currentTime, duration } = state;

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player">
      <div className="audio-player-container">
        {/* Track Info */}
        <div className="audio-player-track-info">
          <img
            src={currentTrack.imageUrl}
            alt={currentTrack.title}
            className="audio-player-artwork"
          />
          <div className="min-w-0 flex-1">
            <Link to={`/products/${currentTrack.productHandle}`} className="audio-player-title">
              {currentTrack.title}
            </Link>
            <div className="audio-player-artist">{currentTrack.artist}</div>
            {isLoading && <output className="block text-xs text-muted">Loading preview…</output>}
            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
          </div>
          {/* Close Button */}
          <button
            onClick={closePlayer}
            className="absolute top-1/2 right-0 -translate-y-1/2 bg-transparent border-none text-muted p-2 flex items-center justify-center rounded-full transition-all duration-200 opacity-60 hover:bg-white/10 hover:text-error hover:opacity-100 hover:scale-110 cursor-pointer"
            aria-label="Close player"
            title="Close player"
          >
            <X size={18} />
          </button>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={skipPrevious}
              className="bg-transparent border-none text-foreground p-2 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 hover:text-brand cursor-pointer"
              aria-label="Previous track"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={togglePlayPause}
              className="audio-player-button-play flex items-center justify-center rounded-full cursor-pointer"
              aria-busy={isLoading}
              aria-label={isLoading ? 'Cancel loading preview' : isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              ) : isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={skipNext}
              className="bg-transparent border-none text-foreground p-2 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 hover:text-brand cursor-pointer"
              aria-label="Next track"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-4 w-full">
            <span className="text-base text-muted tabular-nums min-w-[40px] text-center">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label="Preview position"
                disabled={duration <= 0 || isLoading}
                className="audio-player-progress"
                style={{
                  background: `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${progressPercentage}%, rgba(255, 255, 255, 0.1) ${progressPercentage}%, rgba(255, 255, 255, 0.1) 100%)`,
                }}
              />
            </div>
            <span className="text-base text-muted tabular-nums min-w-[40px] text-center">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-4 justify-end">
          <button
            onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
            className="bg-transparent border-none text-foreground p-2 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 hover:text-brand cursor-pointer"
            aria-label={volume === 0 ? 'Unmute' : 'Mute'}
          >
            {volume === 0 ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : volume < 0.5 ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Preview volume"
            className="audio-player-volume-slider"
            style={{
              background: `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${volume * 100}%, rgba(255, 255, 255, 0.1) ${volume * 100}%, rgba(255, 255, 255, 0.1) 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
