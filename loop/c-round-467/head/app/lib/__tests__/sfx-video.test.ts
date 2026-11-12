import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSfxSyncPosition, seekSfxVideo } from '../sfx-video.client';

afterEach(() => vi.useRealTimers());

describe('Video Sync transport', () => {
  it('keeps the paused frame inside the repeated section after multiple repeats', () => {
    const loop = { start: 5, end: 10, enabled: true };
    expect(getSfxSyncPosition(23.125, 30, loop)).toBe(8.125);
    expect(getSfxSyncPosition(10, 30, loop)).toBe(5);
    expect(getSfxSyncPosition(9.99, 30, loop)).toBe(9.99);
    expect(getSfxSyncPosition(40, 30, { ...loop, enabled: false })).toBe(30);
  });
  it('waits for a seeked, decoded frame before starting sound', async () => {
    const video = document.createElement('video');
    Object.defineProperty(video, 'readyState', { configurable: true, get: () => 2 });
    let seeking = true;
    Object.defineProperty(video, 'seeking', { get: () => seeking });
    let resolved = false;
    const pending = seekSfxVideo(video, 7.24, new AbortController().signal).then(() => {
      resolved = true;
    });
    await Promise.resolve();
    expect(resolved).toBe(false);
    expect(video.currentTime).toBe(7.24);
    seeking = false;
    video.dispatchEvent(new Event('seeked'));
    await pending;
    expect(resolved).toBe(true);
  });
  it('cancels stale seeks and releases listeners', async () => {
    const video = document.createElement('video');
    const remove = vi.spyOn(video, 'removeEventListener');
    const abort = new AbortController();
    const pending = seekSfxVideo(video, 2, abort.signal);
    const assertion = expect(pending).rejects.toThrow('cancelled');
    abort.abort();
    await assertion;
    expect(remove).toHaveBeenCalledWith('seeked', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('error', expect.any(Function));
  });
  it('reports unsupported or stalled video rather than silently running sound', async () => {
    vi.useFakeTimers();
    const video = document.createElement('video');
    const failed = seekSfxVideo(video, 2, new AbortController().signal);
    const assertion = expect(failed).rejects.toThrow('cannot be played');
    video.dispatchEvent(new Event('error'));
    await assertion;
    const stalled = seekSfxVideo(video, 3, new AbortController().signal);
    const timeoutAssertion = expect(stalled).rejects.toThrow('not ready');
    await vi.advanceTimersByTimeAsync(10000);
    await timeoutAssertion;
  });
});
