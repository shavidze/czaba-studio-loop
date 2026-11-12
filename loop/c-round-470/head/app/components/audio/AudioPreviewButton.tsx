import { Loader2 } from 'lucide-react';
import { type Track, useAudio } from '~/contexts/AudioContext';
import { trackPlayButtonClicked } from '~/lib/analytics';
import { trackFBPlayButtonClicked } from '~/lib/facebook-pixel';

interface AudioPreviewButtonProps {
  track: Track;
  variant?: 'overlay' | 'inline';
}

export function AudioPreviewButton({ track, variant = 'overlay' }: AudioPreviewButtonProps) {
  const { state, play, pause } = useAudio();

  const isCurrentTrack = state.currentTrack?.id === track.id;
  const isPlaying = isCurrentTrack && state.isPlaying;
  const isLoading = isCurrentTrack && state.isLoading;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPlaying || isLoading) {
      pause();
    } else {
      play(track);
      // GA4 Event: play_button_clicked
      trackPlayButtonClicked({
        trackId: track.id,
        trackTitle: track.title,
        artistName: track.artist,
        productHandle: track.productHandle,
      });
      // Facebook Pixel Event: PlayButtonClicked (custom)
      trackFBPlayButtonClicked({
        trackId: track.id,
        trackTitle: track.title,
        productHandle: track.productHandle,
      });
    }
  };

  if (variant === 'overlay') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="audio-preview-overlay-button cursor-pointer"
        aria-busy={isLoading}
        aria-label={
          isLoading ? 'Cancel loading preview' : isPlaying ? 'Pause preview' : 'Play preview'
        }
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        ) : isPlaying ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`audio-preview-inline-button cursor-pointer ${isPlaying ? 'playing' : ''}`}
      aria-busy={isLoading}
      aria-label={
        isLoading ? 'Cancel loading preview' : isPlaying ? 'Pause preview' : 'Play preview'
      }
    >
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      ) : isPlaying ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}
