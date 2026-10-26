import { Loader2, Pause, Play, Volume2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useStems } from '~/contexts/StemsContext';
import { StemControl } from './StemControl';

export function StemsPlayerModal() {
  const { state, isModalOpen, closeStemsPlayer, togglePlayPause, seek } = useStems();

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeStemsPlayer();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen, closeStemsPlayer]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={closeStemsPlayer}
    >
      <div
        className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-surface rounded-2xl shadow-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-surface border-b border-outline">
          <h2 className="text-3xl font-bold text-foreground">Stems</h2>
          <button
            onClick={closeStemsPlayer}
            className="p-2 text-muted hover:text-foreground hover:bg-elevated rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Loading State */}
        {state.isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={48} className="text-teal-500 animate-spin" />
            <p className="text-muted mt-4">Loading stems...</p>
          </div>
        )}

        {/* Content */}
        {!state.isLoading && state.allLoaded && (
          <div className="px-8 py-6">
            {/* Track Info Section */}
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-outline">
              {/* Album Artwork */}
              <img
                src={state.currentTrack?.imageUrl}
                alt={state.currentTrack?.title}
                className="w-20 h-20 rounded-lg object-cover shadow-lg"
              />

              {/* Track Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-foreground truncate">
                  {state.currentTrack?.title}
                </h3>
                <p className="text-sm text-muted mt-1">{state.currentTrack?.artist}</p>
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={togglePlayPause}
                className="flex items-center justify-center w-12 h-12 bg-white text-black rounded-full hover:bg-neutral-100 transition-colors shadow-md cursor-pointer flex-shrink-0"
                aria-label={state.isPlaying ? 'Pause' : 'Play'}
              >
                {state.isPlaying ? (
                  <Pause size={20} fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" className="ml-0.5" />
                )}
              </button>

              {/* Time Display */}
              <span className="text-sm text-muted tabular-nums min-w-[50px] text-center flex-shrink-0">
                {formatTime(state.currentTime)}
              </span>

              {/* Volume Icon & Slider */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <Volume2 size={20} className="text-muted" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="70"
                  className="w-24 h-1 bg-elevated rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-3
                    [&::-moz-range-thumb]:h-3
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>
            </div>

            {/* Stems List */}
            <div className="space-y-0">
              {state.stems.map((stem) => (
                <StemControl
                  key={stem.id}
                  stemId={stem.id}
                  name={stem.name}
                  isMuted={stem.isMuted}
                  isSoloed={stem.isSoloed}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!state.isLoading && !state.allLoaded && state.stems.length > 0 && (
          <div className="p-8 text-center">
            <p className="text-destructive mb-4">Failed to load stems. Please try again.</p>
            <button
              onClick={closeStemsPlayer}
              className="px-6 py-2 bg-elevated text-foreground rounded-lg hover:bg-muted-bg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
