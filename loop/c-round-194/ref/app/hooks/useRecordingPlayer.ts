import { useCallback, useEffect, useRef, useState } from 'react';

export type RecordingPlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface RecordingStreamGrant {
  streamUrl: string;
  expiresAt: number;
}

export interface RecordingPlayerState {
  activeRecordingId: number | null;
  status: RecordingPlaybackStatus;
  currentTime: number;
  duration: number;
  errorMessage: string | null;
}

interface UseRecordingPlayerOptions {
  requestStreamGrant: (recordingId: number) => Promise<RecordingStreamGrant>;
  onPlaybackStart?: () => void;
}

const GRANT_REFRESH_MARGIN_MS = 60 * 1000;
const PLAYBACK_FAILED_MESSAGE = 'Playback failed. Check your connection and press Play to retry.';

const INITIAL_RECORDING_PLAYER_STATE: RecordingPlayerState = {
  activeRecordingId: null,
  status: 'idle',
  currentTime: 0,
  duration: 0,
  errorMessage: null,
};

function getErrorMessage(error: unknown): string {
  if (error instanceof DOMException) return PLAYBACK_FAILED_MESSAGE;
  return error instanceof Error && error.message ? error.message : PLAYBACK_FAILED_MESSAGE;
}

export function useRecordingPlayer({
  requestStreamGrant,
  onPlaybackStart,
}: UseRecordingPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedRecordingIdRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const grantsRef = useRef(new Map<number, RecordingStreamGrant>());
  const retriedRef = useRef(false);
  const lastPositionRef = useRef(0);
  const [state, setState] = useState<RecordingPlayerState>(INITIAL_RECORDING_PLAYER_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;
  const optionsRef = useRef({ requestStreamGrant, onPlaybackStart });
  optionsRef.current = { requestStreamGrant, onPlaybackStart };

  const getAudioElement = useCallback((): HTMLAudioElement => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'none';
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const startRecordingPlayback = useCallback(
    async (recordingId: number, startAt: number) => {
      const audio = getAudioElement();
      const requestId = ++requestIdRef.current;
      loadedRecordingIdRef.current = null;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      lastPositionRef.current = startAt;
      setState((prev) => ({
        activeRecordingId: recordingId,
        status: 'loading',
        currentTime: startAt,
        duration: prev.activeRecordingId === recordingId ? prev.duration : 0,
        errorMessage: null,
      }));
      optionsRef.current.onPlaybackStart?.();
      try {
        let grant = grantsRef.current.get(recordingId);
        if (!grant || grant.expiresAt - Date.now() < GRANT_REFRESH_MARGIN_MS) {
          grant = await optionsRef.current.requestStreamGrant(recordingId);
          grantsRef.current.set(recordingId, grant);
        }
        if (requestId !== requestIdRef.current) return;
        audio.src = grant.streamUrl;
        loadedRecordingIdRef.current = recordingId;
        audio.currentTime = lastPositionRef.current;
        await audio.play();
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        audio.pause();
        setState((prev) => ({ ...prev, status: 'error', errorMessage: getErrorMessage(error) }));
      }
    },
    [getAudioElement],
  );

  useEffect(() => {
    const audio = getAudioElement();
    const isCurrentStatus = (...statuses: RecordingPlaybackStatus[]) =>
      statuses.includes(stateRef.current.status);

    const handlePlaying = () => {
      if (loadedRecordingIdRef.current !== stateRef.current.activeRecordingId) return;
      if (!isCurrentStatus('loading', 'playing')) {
        audio.pause();
        return;
      }
      retriedRef.current = false;
      setState((prev) => ({ ...prev, status: 'playing', errorMessage: null }));
    };
    const handleWaiting = () => {
      if (isCurrentStatus('playing')) setState((prev) => ({ ...prev, status: 'loading' }));
    };
    const handlePause = () => {
      if (isCurrentStatus('playing')) setState((prev) => ({ ...prev, status: 'paused' }));
    };
    const handleTimeUpdate = () => {
      if (loadedRecordingIdRef.current !== stateRef.current.activeRecordingId) return;
      lastPositionRef.current = audio.currentTime;
      setState((prev) => ({ ...prev, currentTime: audio.currentTime }));
    };
    const handleDuration = () => {
      if (loadedRecordingIdRef.current !== stateRef.current.activeRecordingId) return;
      if (Number.isFinite(audio.duration)) {
        setState((prev) => ({ ...prev, duration: audio.duration }));
      }
    };
    const handleEnded = () => {
      if (loadedRecordingIdRef.current !== stateRef.current.activeRecordingId) return;
      lastPositionRef.current = 0;
      audio.currentTime = 0;
      setState((prev) => ({ ...prev, status: 'idle', currentTime: 0 }));
    };
    const handleError = () => {
      const { activeRecordingId } = stateRef.current;
      if (loadedRecordingIdRef.current !== activeRecordingId) return;
      if (activeRecordingId === null || !audio.error || audio.error.code === 1) return;
      if (isCurrentStatus('paused', 'idle')) {
        grantsRef.current.delete(activeRecordingId);
        loadedRecordingIdRef.current = null;
        audio.removeAttribute('src');
        return;
      }
      if (!retriedRef.current && isCurrentStatus('playing', 'loading')) {
        retriedRef.current = true;
        grantsRef.current.delete(activeRecordingId);
        void startRecordingPlayback(activeRecordingId, lastPositionRef.current);
        return;
      }
      requestIdRef.current++;
      loadedRecordingIdRef.current = null;
      setState((prev) => ({ ...prev, status: 'error', errorMessage: PLAYBACK_FAILED_MESSAGE }));
    };

    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDuration);
    audio.addEventListener('loadedmetadata', handleDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    return () => {
      requestIdRef.current++;
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDuration);
      audio.removeEventListener('loadedmetadata', handleDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, [getAudioElement, startRecordingPlayback]);

  const toggleRecordingPlayback = useCallback(
    (recordingId: number) => {
      const audio = getAudioElement();
      const { activeRecordingId, status, currentTime } = stateRef.current;
      if (activeRecordingId === recordingId && status === 'playing') {
        audio.pause();
        setState((prev) => ({ ...prev, status: 'paused' }));
        return;
      }
      if (activeRecordingId === recordingId && status === 'loading') {
        requestIdRef.current++;
        audio.pause();
        setState((prev) => ({ ...prev, status: 'paused' }));
        return;
      }
      retriedRef.current = false;
      const isResume =
        activeRecordingId === recordingId && (status === 'paused' || status === 'idle');
      const grant = grantsRef.current.get(recordingId);
      if (
        isResume &&
        loadedRecordingIdRef.current === recordingId &&
        audio.src &&
        grant &&
        grant.expiresAt - Date.now() >= GRANT_REFRESH_MARGIN_MS
      ) {
        const requestId = ++requestIdRef.current;
        setState((prev) => ({ ...prev, status: 'loading', errorMessage: null }));
        optionsRef.current.onPlaybackStart?.();
        audio.play().catch((error: unknown) => {
          if (requestId !== requestIdRef.current) return;
          setState((prev) => ({ ...prev, status: 'error', errorMessage: getErrorMessage(error) }));
        });
        return;
      }
      void startRecordingPlayback(recordingId, isResume ? currentTime : 0);
    },
    [getAudioElement, startRecordingPlayback],
  );

  const seekRecording = useCallback(
    (recordingId: number, time: number) => {
      const audio = getAudioElement();
      if (stateRef.current.activeRecordingId !== recordingId || !Number.isFinite(time)) return;
      const duration = stateRef.current.duration;
      const target = Math.max(0, duration > 0 ? Math.min(time, duration) : time);
      lastPositionRef.current = target;
      if (loadedRecordingIdRef.current === recordingId) audio.currentTime = target;
      setState((prev) => ({ ...prev, currentTime: target }));
    },
    [getAudioElement],
  );

  const stopRecordingPlayback = useCallback(() => {
    requestIdRef.current++;
    loadedRecordingIdRef.current = null;
    lastPositionRef.current = 0;
    const audio = audioRef.current;
    audio?.pause();
    audio?.removeAttribute('src');
    audio?.load();
    setState(INITIAL_RECORDING_PLAYER_STATE);
  }, []);

  return { state, toggleRecordingPlayback, seekRecording, stopRecordingPlayback };
}
