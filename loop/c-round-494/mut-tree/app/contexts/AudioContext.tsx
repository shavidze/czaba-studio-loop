import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  imageUrl: string;
  productHandle: string;
}

interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Track[];
  queueIndex: number;
}

interface AudioContextValue {
  state: AudioState;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  skipNext: () => void;
  skipPrevious: () => void;
  clearQueue: () => void;
  closePlayer: () => void;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

const FADE_DURATION = 150;
const FADE_STEPS = 10;

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackRequestRef = useRef(0);
  const [state, setState] = useState<AudioState>({
    currentTrack: null,
    isPlaying: false,
    isLoading: false,
    error: null,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    queue: [],
    queueIndex: -1,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const clearFade = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, []);

  const fadeIn = useCallback(
    (audio: HTMLAudioElement, targetVolume: number) => {
      clearFade();
      audio.volume = 0;
      let step = 0;
      fadeIntervalRef.current = setInterval(() => {
        step++;
        audio.volume = Math.min(targetVolume, (step / FADE_STEPS) * targetVolume);
        if (step >= FADE_STEPS) clearFade();
      }, FADE_DURATION / FADE_STEPS);
    },
    [clearFade],
  );

  const play = useCallback(
    (track: Track) => {
      const audio = audioRef.current;
      if (!audio) return;
      clearFade();
      const requestId = ++playbackRequestRef.current;
      const isNewTrack =
        stateRef.current.currentTrack?.id !== track.id ||
        stateRef.current.currentTrack?.audioUrl !== track.audioUrl;
      if (isNewTrack) {
        audio.src = track.audioUrl;
        audio.load();
      }
      setState((prev) => ({
        ...prev,
        currentTrack: track,
        isPlaying: false,
        isLoading: true,
        error: null,
        currentTime: isNewTrack ? 0 : prev.currentTime,
        duration: isNewTrack ? 0 : prev.duration,
      }));
      void audio
        .play()
        .then(() => {
          if (requestId !== playbackRequestRef.current) return;
          fadeIn(audio, stateRef.current.volume);
          setState((prev) => ({ ...prev, isPlaying: true, isLoading: false, error: null }));
        })
        .catch(() => {
          if (requestId !== playbackRequestRef.current) return;
          setState((prev) => ({
            ...prev,
            isPlaying: false,
            isLoading: false,
            error: 'Preview could not play. Press Play to retry.',
          }));
        });
    },
    [clearFade, fadeIn],
  );

  const skipNext = useCallback(() => {
    const current = stateRef.current;
    if (current.queue.length === 0) return;
    const nextIndex = (current.queueIndex + 1) % current.queue.length;
    const nextTrack = current.queue[nextIndex];
    if (nextTrack) {
      play(nextTrack);
      setState((prev) => ({ ...prev, queueIndex: nextIndex }));
    }
  }, [play]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = stateRef.current.volume;

    const audio = audioRef.current;

    // Update current time
    const handleTimeUpdate = () => {
      setState((prev) => ({ ...prev, currentTime: audio.currentTime }));
    };

    // Update duration
    const handleLoadedMetadata = () => {
      setState((prev) => ({ ...prev, duration: audio.duration }));
    };

    // Handle track end
    const handleEnded = () => {
      setState((prev) => ({ ...prev, isPlaying: false, isLoading: false, error: null }));
      // Auto-play next track if available
      skipNext();
    };

    // Handle errors
    const handleError = () => {
      ++playbackRequestRef.current;
      clearFade();
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        error: 'Preview could not play. Press Play to retry.',
      }));
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      ++playbackRequestRef.current;
      clearFade();
      audioRef.current = null;
      audio.pause();
      audio.src = '';
    };
  }, [clearFade, skipNext]);

  const pause = () => {
    if (typeof window === 'undefined' || !audioRef.current) return;
    const audio = audioRef.current;
    ++playbackRequestRef.current;
    setState((prev) => ({ ...prev, isPlaying: false, isLoading: false, error: null }));
    clearFade();
    audio.pause();
  };

  const resume = () => {
    if (state.currentTrack) play(state.currentTrack);
  };

  const togglePlayPause = () => {
    if (state.isPlaying || state.isLoading) {
      pause();
    } else if (state.currentTrack) {
      resume();
    }
  };

  const seek = (time: number) => {
    if (typeof window === 'undefined' || !audioRef.current) return;
    audioRef.current.currentTime = time;
    setState((prev) => ({ ...prev, currentTime: time }));
  };

  const setVolume = (volume: number) => {
    if (typeof window === 'undefined' || !audioRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    clearFade();
    audioRef.current.volume = clampedVolume;
    setState((prev) => ({ ...prev, volume: clampedVolume }));
  };

  const addToQueue = (track: Track) => {
    setState((prev) => ({
      ...prev,
      queue: [...prev.queue, track],
    }));
  };

  const skipPrevious = () => {
    if (state.queue.length === 0) return;

    // If more than 3 seconds played, restart current track
    if (state.currentTime > 3) {
      seek(0);
      return;
    }

    const prevIndex = state.queueIndex - 1 < 0 ? state.queue.length - 1 : state.queueIndex - 1;
    const prevTrack = state.queue[prevIndex];

    if (prevTrack) {
      play(prevTrack);
      setState((prev) => ({ ...prev, queueIndex: prevIndex }));
    }
  };

  const clearQueue = () => {
    setState((prev) => ({ ...prev, queue: [], queueIndex: -1 }));
  };

  const closePlayer = () => {
    if (typeof window === 'undefined' || !audioRef.current) return;

    ++playbackRequestRef.current;
    clearFade();

    // Pause and clear audio
    audioRef.current.pause();
    audioRef.current.src = '';

    // Reset state
    setState((prev) => ({
      ...prev,
      currentTrack: null,
      isPlaying: false,
      isLoading: false,
      error: null,
      currentTime: 0,
      duration: 0,
    }));
  };

  const value: AudioContextValue = {
    state,
    play,
    pause,
    resume,
    togglePlayPause,
    seek,
    setVolume,
    addToQueue,
    skipNext,
    skipPrevious,
    clearQueue,
    closePlayer,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
