import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type RecordingStreamGrant, useRecordingPlayer } from '../useRecordingPlayer';

let audio: HTMLAudioElement;
let created = 0;
let playResolvers: Array<() => void> = [];
let playRejecters: Array<(error: Error) => void> = [];
let grantRequests: Array<{
  recordingId: number;
  resolve: (grant: RecordingStreamGrant) => void;
  reject: (error: Error) => void;
}> = [];

function requestStreamGrant(recordingId: number): Promise<RecordingStreamGrant> {
  return new Promise((resolve, reject) => {
    grantRequests.push({ recordingId, resolve, reject });
  });
}

function grantFor(recordingId: number): RecordingStreamGrant {
  return {
    streamUrl: `https://r2.example/recordings/mall/${recordingId}.m4a?token=t${recordingId}`,
    expiresAt: Date.now() + 15 * 60 * 1000,
  };
}

function setMediaError(code: number) {
  Object.defineProperty(audio, 'error', { configurable: true, value: { code } });
}

function renderPlayer(onPlaybackStart = vi.fn()) {
  return renderHook(() => useRecordingPlayer({ requestStreamGrant, onPlaybackStart }));
}

beforeEach(() => {
  created = 0;
  playResolvers = [];
  playRejecters = [];
  grantRequests = [];
  vi.stubGlobal('Audio', function MockAudio() {
    created++;
    audio = document.createElement('audio');
    audio.load = vi.fn();
    audio.pause = vi.fn();
    audio.play = vi.fn(
      () =>
        new Promise<void>((resolve, reject) => {
          playResolvers.push(resolve);
          playRejecters.push(reject);
        }),
    );
    return audio;
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useRecordingPlayer', () => {
  it('stops and invalidates a pending preview before scene playback', async () => {
    const { result } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    act(() => result.current.stopRecordingPlayback());
    await act(async () => grantRequests[0].resolve(grantFor(1)));
    expect(audio.play).not.toHaveBeenCalled();
    expect(audio.getAttribute('src')).toBeNull();
    expect(result.current.state.activeRecordingId).toBeNull();
  });

  it('does not resume the previous file after cancelling a new stream request', async () => {
    const { result } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    await act(async () => grantRequests[0].resolve(grantFor(1)));
    act(() => audio.dispatchEvent(new Event('playing')));
    act(() => result.current.toggleRecordingPlayback(2));
    act(() => result.current.toggleRecordingPlayback(2));
    await act(async () => grantRequests[1].resolve(grantFor(2)));
    act(() => result.current.toggleRecordingPlayback(2));
    expect(audio.src).toContain('/recordings/mall/2.m4a');
  });

  it('keeps the requested seek position while a stream grant is loading', async () => {
    const { result } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    act(() => result.current.seekRecording(1, 15));
    await act(async () => grantRequests[0].resolve(grantFor(1)));
    expect(audio.currentTime).toBe(15);
  });

  it('retries a new recording from its own position instead of the previous recording', async () => {
    const { result } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    await act(async () => grantRequests[0].resolve(grantFor(1)));
    act(() => {
      audio.dispatchEvent(new Event('playing'));
      audio.currentTime = 42;
      audio.dispatchEvent(new Event('timeupdate'));
    });
    act(() => result.current.toggleRecordingPlayback(2));
    await act(async () => grantRequests[1].resolve(grantFor(2)));
    act(() => {
      setMediaError(2);
      audio.dispatchEvent(new Event('error'));
    });
    await act(async () => grantRequests[2].resolve(grantFor(2)));
    expect(audio.currentTime).toBe(0);
  });

  it('reports loading until the media element actually plays', async () => {
    const onPlaybackStart = vi.fn();
    const { result } = renderPlayer(onPlaybackStart);
    act(() => result.current.toggleRecordingPlayback(1));
    expect(result.current.state.status).toBe('loading');
    expect(onPlaybackStart).toHaveBeenCalledTimes(1);
    await act(async () => grantRequests[0].resolve(grantFor(1)));
    expect(audio.src).toContain('/recordings/mall/1.m4a');
    expect(result.current.state.status).toBe('loading');
    await act(async () => playResolvers[0]());
    expect(result.current.state.status).toBe('loading');
    act(() => {
      audio.dispatchEvent(new Event('playing'));
    });
    expect(result.current.state.status).toBe('playing');
    expect(result.current.state.activeRecordingId).toBe(1);
  });

  it('keeps a single audio element and only the last requested recording active', async () => {
    const { result } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    act(() => result.current.toggleRecordingPlayback(2));
    act(() => result.current.toggleRecordingPlayback(3));
    await act(async () => {
      grantRequests[2].resolve(grantFor(3));
      grantRequests[0].resolve(grantFor(1));
      grantRequests[1].resolve(grantFor(2));
    });
    expect(created).toBe(1);
    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(audio.src).toContain('/recordings/mall/3.m4a');
    expect(result.current.state.activeRecordingId).toBe(3);
  });

  it('pauses the current recording when switching to another one', async () => {
    const { result } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    await act(async () => grantRequests[0].resolve(grantFor(1)));
    act(() => {
      audio.dispatchEvent(new Event('playing'));
    });
    act(() => result.current.toggleRecordingPlayback(2));
    expect(audio.pause).toHaveBeenCalled();
    act(() => {
      audio.dispatchEvent(new Event('pause'));
    });
    expect(result.current.state.activeRecordingId).toBe(2);
    expect(result.current.state.status).toBe('loading');
  });

  it('toggles pause and resumes without requesting a new stream', async () => {
    const { result } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    await act(async () => grantRequests[0].resolve(grantFor(1)));
    act(() => {
      audio.dispatchEvent(new Event('playing'));
    });
    act(() => result.current.toggleRecordingPlayback(1));
    act(() => {
      audio.dispatchEvent(new Event('pause'));
    });
    expect(result.current.state.status).toBe('paused');
    act(() => result.current.toggleRecordingPlayback(1));
    expect(result.current.state.status).toBe('loading');
    act(() => {
      audio.dispatchEvent(new Event('playing'));
    });
    expect(result.current.state.status).toBe('playing');
    expect(grantRequests).toHaveLength(1);
  });

  it('shows a clear error when the browser refuses playback', async () => {
    const { result } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    await act(async () => grantRequests[0].resolve(grantFor(1)));
    await act(async () => playRejecters[0](new DOMException('blocked', 'NotAllowedError')));
    expect(result.current.state.status).toBe('error');
    expect(result.current.state.errorMessage).toContain('Playback failed');
  });

  it('surfaces access errors from the stream request', async () => {
    const { result } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    await act(async () =>
      grantRequests[0].reject(new Error('Your license does not include this recording.')),
    );
    expect(result.current.state.status).toBe('error');
    expect(result.current.state.errorMessage).toBe('Your license does not include this recording.');
    expect(audio.play).not.toHaveBeenCalled();
  });

  it('returns to Play state when the recording ends', async () => {
    const { result } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    await act(async () => grantRequests[0].resolve(grantFor(1)));
    act(() => {
      audio.dispatchEvent(new Event('playing'));
      audio.currentTime = 12;
      audio.dispatchEvent(new Event('timeupdate'));
    });
    expect(result.current.state.currentTime).toBe(12);
    act(() => {
      audio.dispatchEvent(new Event('ended'));
    });
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.currentTime).toBe(0);
  });

  it('resumes from a position chosen after the recording ended', async () => {
    const { result } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    await act(async () => grantRequests[0].resolve(grantFor(1)));
    act(() => {
      audio.dispatchEvent(new Event('playing'));
      audio.dispatchEvent(new Event('ended'));
    });
    act(() => result.current.seekRecording(1, 5));
    act(() => result.current.toggleRecordingPlayback(1));
    expect(result.current.state.status).toBe('loading');
    expect(audio.currentTime).toBe(5);
    expect(grantRequests).toHaveLength(1);
  });

  it('seeks only the active recording', async () => {
    const { result } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    await act(async () => grantRequests[0].resolve(grantFor(1)));
    act(() => result.current.seekRecording(2, 30));
    expect(result.current.state.currentTime).toBe(0);
    act(() => result.current.seekRecording(1, 30));
    expect(result.current.state.currentTime).toBe(30);
    expect(audio.currentTime).toBe(30);
  });

  it('refreshes an expired stream once and resumes from the last position', async () => {
    const { result } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    await act(async () => grantRequests[0].resolve(grantFor(1)));
    act(() => {
      audio.dispatchEvent(new Event('playing'));
      audio.currentTime = 42;
      audio.dispatchEvent(new Event('timeupdate'));
      setMediaError(2);
      audio.dispatchEvent(new Event('error'));
    });
    expect(grantRequests).toHaveLength(2);
    expect(result.current.state.status).toBe('loading');
    await act(async () => grantRequests[1].resolve(grantFor(1)));
    expect(audio.currentTime).toBe(42);
    act(() => {
      setMediaError(2);
      audio.dispatchEvent(new Event('error'));
    });
    expect(grantRequests).toHaveLength(2);
    expect(result.current.state.status).toBe('error');
    expect(result.current.state.errorMessage).toContain('Playback failed');
  });

  it('stops audio and releases the source on unmount', async () => {
    const { result, unmount } = renderPlayer();
    act(() => result.current.toggleRecordingPlayback(1));
    await act(async () => grantRequests[0].resolve(grantFor(1)));
    unmount();
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.getAttribute('src')).toBeNull();
  });
});
