import { act, cleanup, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioProvider, type Track, useAudio } from '../AudioContext';

let audio: HTMLAudioElement;
let resolvePlay: () => void;
let rejectPlay: (error: Error) => void;
let created = 0;
const track: Track = {
  id: '1',
  title: 'Mall',
  artist: 'CZABA',
  audioUrl: '/preview.wav',
  imageUrl: '/cover.jpg',
  productHandle: 'mall',
};
function wrapper({ children }: { children: ReactNode }) {
  return <AudioProvider>{children}</AudioProvider>;
}

beforeEach(() => {
  created = 0;
  vi.stubGlobal('Audio', function MockAudio() {
    created++;
    audio = document.createElement('audio');
    audio.load = vi.fn();
    audio.pause = vi.fn();
    audio.play = vi.fn(
      () =>
        new Promise<void>((resolve, reject) => {
          resolvePlay = resolve;
          rejectPlay = reject;
        }),
    );
    return audio;
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Audio playback lifecycle', () => {
  it('keeps the audio element alive across playback, progress and volume updates', async () => {
    const { result } = renderHook(useAudio, { wrapper });
    act(() => result.current.play(track));
    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.isLoading).toBe(true);
    await act(async () => resolvePlay());
    expect(result.current.state.isPlaying).toBe(true);
    expect(result.current.state.isLoading).toBe(false);
    act(() => {
      audio.currentTime = 4;
      audio.dispatchEvent(new Event('timeupdate'));
    });
    act(() => result.current.setVolume(0.4));
    expect(result.current.state.currentTime).toBe(4);
    expect(created).toBe(1);
    expect(audio.pause).not.toHaveBeenCalled();
    expect(audio.src).toContain('/preview.wav');
  });

  it('does not claim playback after a rejected play request', async () => {
    const { result } = renderHook(useAudio, { wrapper });
    act(() => result.current.play(track));
    await act(async () => rejectPlay(new Error('Playback unavailable')));
    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toContain('Press Play to retry');
    act(() => result.current.resume());
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.isLoading).toBe(true);
    await act(async () => resolvePlay());
    expect(result.current.state.isPlaying).toBe(true);
  });

  it('ignores a pending play completion after the player closes', async () => {
    const { result } = renderHook(useAudio, { wrapper });
    act(() => result.current.play(track));
    act(() => result.current.closePlayer());
    await act(async () => resolvePlay());
    expect(result.current.state.currentTrack).toBeNull();
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.isPlaying).toBe(false);
  });

  it('pauses immediately and ignores a pending playback completion', async () => {
    const { result } = renderHook(useAudio, { wrapper });
    act(() => result.current.play(track));
    act(() => result.current.pause());
    expect(audio.pause).toHaveBeenCalledOnce();
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBeNull();
    await act(async () => resolvePlay());
    expect(result.current.state.isPlaying).toBe(false);
  });

  it('uses the current queue when a track ends', async () => {
    const { result } = renderHook(useAudio, { wrapper });
    act(() => result.current.play(track));
    await act(async () => resolvePlay());
    act(() => result.current.addToQueue({ ...track, id: '2', audioUrl: '/second.wav' }));
    act(() => audio.dispatchEvent(new Event('ended')));
    expect(result.current.state.currentTrack?.id).toBe('2');
    expect(audio.src).toContain('/second.wav');
    expect(created).toBe(1);
  });
});
