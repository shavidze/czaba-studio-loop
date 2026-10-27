import { describe, expect, it, vi } from 'vitest';
import {
  createArrangementMixDraftStore,
  groupVolumeDraftKey,
  MASTER_GAIN_DRAFT_KEY,
  trackPanDraftKey,
  trackVolumeDraftKey,
} from '../mix-draft-store';

describe('createArrangementMixDraftStore (D-29z179)', () => {
  it('MD1: set notifies only the listeners of its key and get returns the value', () => {
    const store = createArrangementMixDraftStore();
    const music = vi.fn();
    const master = vi.fn();
    store.subscribe(trackVolumeDraftKey('music'), music);
    store.subscribe(MASTER_GAIN_DRAFT_KEY, master);
    store.set(trackVolumeDraftKey('music'), 0.5);
    expect(store.get(trackVolumeDraftKey('music'))).toBe(0.5);
    expect(music).toHaveBeenCalledTimes(1);
    expect(master).not.toHaveBeenCalled();
    expect(store.get(MASTER_GAIN_DRAFT_KEY)).toBeUndefined();
  });

  it('MD2: setting the same value again does not notify; a new value does', () => {
    const store = createArrangementMixDraftStore();
    const listener = vi.fn();
    store.subscribe(MASTER_GAIN_DRAFT_KEY, listener);
    store.set(MASTER_GAIN_DRAFT_KEY, -3);
    store.set(MASTER_GAIN_DRAFT_KEY, -3);
    expect(listener).toHaveBeenCalledTimes(1);
    store.set(MASTER_GAIN_DRAFT_KEY, -3.5);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('MD3: clear removes the value and notifies its key once; clearing an empty key is silent', () => {
    const store = createArrangementMixDraftStore();
    const listener = vi.fn();
    const other = vi.fn();
    store.subscribe(trackPanDraftKey('music'), listener);
    store.subscribe(groupVolumeDraftKey('g1'), other);
    store.set(trackPanDraftKey('music'), 0.2);
    store.clear(trackPanDraftKey('music'));
    expect(store.get(trackPanDraftKey('music'))).toBeUndefined();
    expect(listener).toHaveBeenCalledTimes(2);
    store.clear(trackPanDraftKey('music'));
    expect(listener).toHaveBeenCalledTimes(2);
    expect(other).not.toHaveBeenCalled();
  });

  it('MD4: unsubscribe removes the listener; other listeners of the key keep receiving', () => {
    const store = createArrangementMixDraftStore();
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = store.subscribe(trackVolumeDraftKey('music'), first);
    store.subscribe(trackVolumeDraftKey('music'), second);
    unsubscribeFirst();
    unsubscribeFirst();
    store.set(trackVolumeDraftKey('music'), 0.4);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('MD5: the store keeps its identity and methods across writes; keys are distinct per kind', () => {
    const store = createArrangementMixDraftStore();
    const { get, set, clear, subscribe } = store;
    set(trackVolumeDraftKey('a'), 1);
    clear(trackVolumeDraftKey('a'));
    expect(store.get).toBe(get);
    expect(store.set).toBe(set);
    expect(store.clear).toBe(clear);
    expect(store.subscribe).toBe(subscribe);
    expect(
      new Set([
        trackVolumeDraftKey('x'),
        groupVolumeDraftKey('x'),
        trackPanDraftKey('x'),
        MASTER_GAIN_DRAFT_KEY,
      ]).size,
    ).toBe(4);
  });
});
