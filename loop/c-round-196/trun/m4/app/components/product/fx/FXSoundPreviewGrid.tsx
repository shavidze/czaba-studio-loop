/**
 * FXSoundPreviewGrid - Grid of playable sound effect previews
 * Each sound can be played independently with a simple click
 */

import { Pause, Play, Volume2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export interface FXSound {
  id: string;
  name: string;
  duration: string; // e.g. "0:03"
  audioUrl: string;
  category?: string;
}

interface FXSoundPreviewGridProps {
  sounds: FXSound[];
  maxDisplay?: number; // Limit displayed sounds (show "and X more")
}

export function FXSoundPreviewGrid({ sounds, maxDisplay = 12 }: FXSoundPreviewGridProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = useCallback(
    (sound: FXSound) => {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // If clicking the same sound, just stop
      if (playingId === sound.id) {
        setPlayingId(null);
        return;
      }

      // Play new sound
      const audio = new Audio(sound.audioUrl);
      audio.addEventListener('ended', () => {
        setPlayingId(null);
        audioRef.current = null;
      });
      audio.play();
      audioRef.current = audio;
      setPlayingId(sound.id);
    },
    [playingId],
  );

  const displayedSounds = sounds.slice(0, maxDisplay);
  const remainingCount = sounds.length - maxDisplay;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Volume2 size={20} className="text-brand" />
          Sound Previews
        </h3>
        <span className="text-sm text-muted">{sounds.length} sounds included</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {displayedSounds.map((sound) => {
          const isPlaying = playingId === sound.id;
          return (
            <button
              key={sound.id}
              onClick={() => handlePlay(sound)}
              className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                isPlaying
                  ? 'bg-brand/20 border-brand text-brand'
                  : 'bg-surface/50 border-outline hover:border-outline-hover hover:bg-elevated/50 text-secondary'
              }`}
            >
              {/* Play/Pause Icon */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isPlaying ? 'bg-brand text-black' : 'bg-elevated group-hover:bg-muted-bg'
                }`}
              >
                {isPlaying ? (
                  <Pause size={14} fill="currentColor" />
                ) : (
                  <Play size={14} fill="currentColor" className="ml-0.5" />
                )}
              </div>

              {/* Sound Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium truncate">{sound.name}</div>
                <div className="text-xs text-muted">{sound.duration}</div>
              </div>

              {/* Playing Indicator */}
              {isPlaying && (
                <div className="absolute top-1 right-1">
                  <div className="flex gap-0.5">
                    <div
                      className="w-0.5 h-3 bg-brand animate-pulse"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-0.5 h-3 bg-brand animate-pulse"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-0.5 h-3 bg-brand animate-pulse"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Show remaining count */}
      {remainingCount > 0 && (
        <div className="text-center text-sm text-muted py-2">
          + {remainingCount} more sounds included in full pack
        </div>
      )}
    </div>
  );
}
