import { describe, expect, it, vi } from 'vitest';
import * as arrangementContext from '~/contexts/ArrangementContext';
import { createArrangementPlaybackStore } from '../playback-store';

describe('PERF-10a playback store', () => {
  it('PS1 a new store starts stopped', () => {
    expect(createArrangementPlaybackStore().getState().isPlaying).toBe(false);
  });

  it('PS2 setPlaying(true) notifies a subscriber once and stores the value', () => {
    const store = createArrangementPlaybackStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.getState().setPlaying(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getState().isPlaying).toBe(true);
  });

  it('PS3 an equal value notifies nobody and keeps the state object', () => {
    const store = createArrangementPlaybackStore();
    store.getState().setPlaying(true);
    const before = store.getState();
    const listener = vi.fn();
    store.subscribe(listener);
    store.getState().setPlaying(true);
    expect(listener).toHaveBeenCalledTimes(0);
    expect(store.getState()).toBe(before);
  });

  it('PS4 the context exports a read-only playing reader and no store that carries setPlaying', () => {
    const exported = Object.keys(arrangementContext);
    expect(exported).toContain('useArrangementIsPlayingReader');
    expect(exported).toContain('useArrangementIsPlaying');
    expect(exported).not.toContain('useArrangementPlaybackStore');
  });
});
