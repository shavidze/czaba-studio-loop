import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import type { Track } from '~/types/audio';

// Stem State Interface
interface StemState {
  id: string;
  name: string;
  audioUrl: string;
  isMuted: boolean;
  isSoloed: boolean;
  isLoaded: boolean;
}

// Player State Interface
interface StemsPlayerState {
  currentTrack: Track | null;
  stems: StemState[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  allLoaded: boolean;
}

// Context Value Interface
interface StemsContextValue {
  state: StemsPlayerState;
  isModalOpen: boolean;
  openStemsPlayer: (track: Track) => void;
  closeStemsPlayer: () => void;
  togglePlayPause: () => void;
  toggleMute: (stemId: string) => void;
  toggleSolo: (stemId: string) => void;
  seek: (time: number) => void;
}

const StemsContext = createContext<StemsContextValue | undefined>(undefined);

const initialState: StemsPlayerState = {
  currentTrack: null,
  stems: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  allLoaded: false,
};

export function StemsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StemsPlayerState>(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const previousMuteStatesRef = useRef<Map<string, boolean>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioElementsRef.current.forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
      audioElementsRef.current.clear();
    };
  }, []);

  // Open stems player and load stems
  const openStemsPlayer = async (track: Track) => {
    if (!track.stems || track.stems.length === 0) return;

    setIsModalOpen(true);
    setState((prev) => ({
      ...prev,
      currentTrack: track,
      stems: track.stems!.map((stem) => ({
        id: stem.id,
        name: stem.name,
        audioUrl: stem.audioUrl,
        isMuted: false,
        isSoloed: false,
        isLoaded: false,
      })),
      isLoading: true,
      allLoaded: false,
    }));

    // Load all stems
    try {
      const loadPromises = track.stems.map(
        (stem) =>
          new Promise<HTMLAudioElement>((resolve, reject) => {
            const audio = new Audio(stem.audioUrl);

            const handleCanPlay = () => {
              audio.removeEventListener('canplaythrough', handleCanPlay);
              audio.removeEventListener('error', handleError);
              audioElementsRef.current.set(stem.id, audio);
              resolve(audio);
            };

            const handleError = (error: ErrorEvent) => {
              audio.removeEventListener('canplaythrough', handleCanPlay);
              audio.removeEventListener('error', handleError);
              reject(new Error(`Failed to load ${stem.name}`));
            };

            audio.addEventListener('canplaythrough', handleCanPlay as EventListener);
            audio.addEventListener('error', handleError as EventListener);
            audio.load();
          }),
      );

      await Promise.all(loadPromises);

      // All stems loaded - set duration from first stem
      const firstAudio = audioElementsRef.current.values().next().value;
      const duration = firstAudio?.duration || 0;

      // Add timeupdate listener to master (first) stem
      firstAudio?.addEventListener('timeupdate', handleTimeUpdate);

      setState((prev) => ({
        ...prev,
        stems: prev.stems.map((stem) => ({ ...stem, isLoaded: true })),
        allLoaded: true,
        isLoading: false,
        duration,
      }));
    } catch (error) {
      console.error('Failed to load stems:', error);
      setState((prev) => ({ ...prev, isLoading: false, allLoaded: false }));
    }
  };

  // Handle time update from master stem
  const handleTimeUpdate = () => {
    const firstAudio = audioElementsRef.current.values().next().value;
    if (!firstAudio) return;

    const currentTime = firstAudio.currentTime;
    setState((prev) => ({ ...prev, currentTime }));

    // Check for drift and resync if needed
    audioElementsRef.current.forEach((audio, id) => {
      if (audio !== firstAudio) {
        const drift = Math.abs(audio.currentTime - currentTime);
        if (drift > 0.1) {
          // 100ms tolerance
          audio.currentTime = currentTime;
        }
      }
    });
  };

  // Helper function to determine if stem should be audible
  const shouldStemBeAudible = (
    stem: { isMuted: boolean; isSoloed: boolean },
    anySoloed: boolean,
  ) => {
    // If muted, never audible
    if (stem.isMuted) return false;
    // If any stems are soloed, only soloed stems are audible
    if (anySoloed) return stem.isSoloed;
    // Otherwise, all non-muted stems are audible
    return true;
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!state.allLoaded) return;

    if (state.isPlaying) {
      // Pause all
      audioElementsRef.current.forEach((audio) => audio.pause());
      setState((prev) => ({ ...prev, isPlaying: false }));
    } else {
      // Sync all to same time first
      const currentTime = state.currentTime;
      audioElementsRef.current.forEach((audio) => {
        audio.currentTime = currentTime;
      });

      // Check if any stems are soloed
      const anySoloed = state.stems.some((s) => s.isSoloed);

      // Play all simultaneously with correct mute states
      const playPromises: Promise<void>[] = [];
      state.stems.forEach((stem) => {
        const audio = audioElementsRef.current.get(stem.id);
        if (audio) {
          // Set mute based on solo/mute logic
          audio.muted = !shouldStemBeAudible(stem, anySoloed);
          playPromises.push(audio.play());
        }
      });

      Promise.all(playPromises)
        .then(() => setState((prev) => ({ ...prev, isPlaying: true })))
        .catch((error) => console.error('Playback failed:', error));
    }
  };

  // Toggle mute on individual stem
  const toggleMute = (stemId: string) => {
    setState((prev) => {
      const newStems = prev.stems.map((stem) =>
        stem.id === stemId
          ? { ...stem, isMuted: !stem.isMuted, isSoloed: stem.isMuted ? stem.isSoloed : false }
          : stem,
      );

      // Update audio immediately
      const anySoloed = newStems.some((s) => s.isSoloed);
      newStems.forEach((stem) => {
        const audio = audioElementsRef.current.get(stem.id);
        if (audio) {
          audio.muted = !shouldStemBeAudible(stem, anySoloed);
        }
      });

      return { ...prev, stems: newStems };
    });
  };

  // Toggle solo on stem (allows multiple stems to be soloed)
  const toggleSolo = (stemId: string) => {
    setState((prev) => {
      // Toggle solo state on clicked stem, and turn off mute if turning solo ON
      const newStems = prev.stems.map((stem) =>
        stem.id === stemId
          ? { ...stem, isSoloed: !stem.isSoloed, isMuted: stem.isSoloed ? stem.isMuted : false }
          : stem,
      );

      // Check if any stems are soloed
      const anySoloed = newStems.some((s) => s.isSoloed);

      // Update audio elements based on new solo state
      newStems.forEach((stem) => {
        const audio = audioElementsRef.current.get(stem.id);
        if (audio) {
          audio.muted = !shouldStemBeAudible(stem, anySoloed);
        }
      });

      return { ...prev, stems: newStems };
    });
  };

  // Seek all stems to same time
  const seek = (time: number) => {
    const wasPlaying = state.isPlaying;

    // Pause if playing
    if (wasPlaying) {
      audioElementsRef.current.forEach((audio) => audio.pause());
    }

    // Set time on all
    audioElementsRef.current.forEach((audio) => {
      audio.currentTime = time;
    });

    setState((prev) => ({ ...prev, currentTime: time }));

    // Resume if was playing
    if (wasPlaying) {
      audioElementsRef.current.forEach((audio, id) => {
        const stem = state.stems.find((s) => s.id === id);
        if (stem && !stem.isMuted) {
          audio.play();
        }
      });
    }
  };

  // Close player and cleanup
  const closeStemsPlayer = () => {
    // Pause and clear all audio
    audioElementsRef.current.forEach((audio) => {
      audio.pause();
      audio.src = '';
    });
    audioElementsRef.current.clear();
    previousMuteStatesRef.current.clear();

    // Reset state
    setState(initialState);
    setIsModalOpen(false);
  };

  const value: StemsContextValue = {
    state,
    isModalOpen,
    openStemsPlayer,
    closeStemsPlayer,
    togglePlayPause,
    toggleMute,
    toggleSolo,
    seek,
  };

  return <StemsContext.Provider value={value}>{children}</StemsContext.Provider>;
}

export function useStems() {
  const context = useContext(StemsContext);
  if (context === undefined) {
    throw new Error('useStems must be used within a StemsProvider');
  }
  return context;
}
