import { describe, expect, it, vi } from 'vitest';
import {
  arrangementRenderSuspendFrames,
  createArrangementExportProgressStore,
  formatArrangementExportProgress,
} from '../export-progress';

describe('SRW-20 stage 3a export progress model (D-29z52)', () => {
  it('PR1 suspend frames are render-quantum multiples, unique, ascending and inside the render', () => {
    for (const length of [14_611_488, 240_000, 4_881_696, 240, 129, 1000]) {
      const frames = arrangementRenderSuspendFrames(length);
      for (const frame of frames) {
        expect(frame % 128).toBe(0);
        expect(frame).toBeGreaterThan(0);
        expect(frame).toBeLessThan(length);
      }
      expect([...new Set(frames)].sort((a, b) => a - b)).toEqual(frames);
    }
    expect(arrangementRenderSuspendFrames(14_611_488)).toHaveLength(19);
    expect(arrangementRenderSuspendFrames(240_000)).toHaveLength(19);
    expect(arrangementRenderSuspendFrames(240_000)[0]).toBe(11_904);
    expect(arrangementRenderSuspendFrames(240)).toEqual([128]);
    expect(arrangementRenderSuspendFrames(0)).toEqual([]);
    expect(arrangementRenderSuspendFrames(Number.NaN)).toEqual([]);
    expect(arrangementRenderSuspendFrames(-5)).toEqual([]);
    expect(arrangementRenderSuspendFrames(Number.POSITIVE_INFINITY)).toEqual([]);
  });

  it('PR2 the store notifies only on a phase, null-ness or whole-percent change, clamps and ignores non-finite fractions', () => {
    const store = createArrangementExportProgressStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribeProgress(listener);
    expect(store.getProgress()).toBeNull();
    store.setProgress({ phase: 'render', fraction: 0.1 });
    expect(listener).toHaveBeenCalledTimes(1);
    const snapshot = store.getProgress();
    store.setProgress({ phase: 'render', fraction: 0.105 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getProgress()).toBe(snapshot);
    store.setProgress({ phase: 'render', fraction: 0.11 });
    expect(listener).toHaveBeenCalledTimes(2);
    store.setProgress({ phase: 'wav', fraction: 0.11 });
    expect(listener).toHaveBeenCalledTimes(3);
    store.setProgress({ phase: 'wav', fraction: 7 });
    expect(store.getProgress()).toEqual({ phase: 'wav', fraction: 1 });
    expect(listener).toHaveBeenCalledTimes(4);
    store.setProgress({ phase: 'mp3', fraction: -3 });
    expect(store.getProgress()).toEqual({ phase: 'mp3', fraction: 0 });
    expect(listener).toHaveBeenCalledTimes(5);
    store.setProgress({ phase: 'mp3', fraction: Number.NaN });
    store.setProgress({ phase: 'mp3', fraction: Number.POSITIVE_INFINITY });
    expect(store.getProgress()).toEqual({ phase: 'mp3', fraction: 0 });
    expect(listener).toHaveBeenCalledTimes(5);
    store.setProgress({ phase: 'load', fraction: null });
    expect(store.getProgress()).toEqual({ phase: 'load', fraction: null });
    expect(listener).toHaveBeenCalledTimes(6);
    store.setProgress({ phase: 'load', fraction: null });
    expect(listener).toHaveBeenCalledTimes(6);
    store.setProgress(null);
    expect(store.getProgress()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(7);
    store.setProgress(null);
    expect(listener).toHaveBeenCalledTimes(7);
    unsubscribe();
    store.setProgress({ phase: 'render', fraction: 0.5 });
    expect(listener).toHaveBeenCalledTimes(7);
  });

  it('PR3 labels name the phase and the floored percent exactly', () => {
    expect(formatArrangementExportProgress({ phase: 'render', fraction: 0.509 })).toBe(
      'რენდერი · 50%',
    );
    expect(formatArrangementExportProgress({ phase: 'wav', fraction: 0.999 })).toBe(
      'WAV-ის ჩაწერა · 99%',
    );
    expect(formatArrangementExportProgress({ phase: 'wav', fraction: 1 })).toBe(
      'WAV-ის ჩაწერა · 100%',
    );
    expect(formatArrangementExportProgress({ phase: 'load', fraction: null })).toBe(
      'MP3 encoder-ის ჩატვირთვა…',
    );
    expect(formatArrangementExportProgress({ phase: 'mp3', fraction: 0.07 })).toBe(
      'MP3-ის შექმნა · 7%',
    );
  });
});
