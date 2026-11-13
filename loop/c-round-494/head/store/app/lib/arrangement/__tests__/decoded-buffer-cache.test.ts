import { describe, expect, it } from 'vitest';
import { createDecodedBufferCache, estimateBufferBytes } from '../decoded-buffer-cache';

interface FakeBuffer {
  bytes: number;
}

function makeCache(budgetBytes: number) {
  return createDecodedBufferCache<FakeBuffer>({
    budgetBytes,
    estimate: (buffer) => buffer.bytes,
  });
}

describe('createDecodedBufferCache', () => {
  it('DC1: evicts the least recently used entry first, and get refreshes an entry', () => {
    const cache = makeCache(25);
    cache.set('a', { bytes: 10 }, { evictable: true });
    cache.set('b', { bytes: 10 }, { evictable: true });
    cache.set('c', { bytes: 10 }, { evictable: true });
    expect(cache.get('a')).toEqual({ bytes: 10 });
    expect(cache.evict()).toEqual(['b']);
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(false);
    expect(cache.has('c')).toBe(true);
    expect(cache.evictableUnpinnedBytes()).toBe(20);
  });

  it('DC2: a pinned entry is never evicted, and is evicted once the last owner unpins it', () => {
    const cache = makeCache(0);
    cache.set('a', { bytes: 10 }, { evictable: true });
    cache.setPinned('clips', ['a']);
    cache.setPinned('export', ['a']);
    expect(cache.evict()).toEqual([]);
    expect(cache.has('a')).toBe(true);
    cache.setPinned('clips', []);
    expect(cache.evict()).toEqual([]);
    expect(cache.has('a')).toBe(true);
    cache.setPinned('export', []);
    expect(cache.evict()).toEqual(['a']);
    expect(cache.has('a')).toBe(false);
  });

  it('DC3: a non-evictable entry is never evicted, even over the budget', () => {
    const cache = makeCache(0);
    cache.set('video', { bytes: 100 }, { evictable: false });
    expect(cache.totalBytes()).toBe(100);
    expect(cache.evictableUnpinnedBytes()).toBe(0);
    expect(cache.evict()).toEqual([]);
    expect(cache.has('video')).toBe(true);
  });

  it('DC4: an entry larger than the budget on its own is evicted once it is unpinned', () => {
    const cache = makeCache(32);
    cache.set('big', { bytes: 40 }, { evictable: true });
    cache.setPinned('preview', ['big']);
    expect(cache.evict()).toEqual([]);
    cache.setPinned('preview', []);
    expect(cache.evict()).toEqual(['big']);
    expect(cache.totalBytes()).toBe(0);
  });

  it('DC5: asReadonlyMap returns the same instance after set, delete, clear and evict', () => {
    const cache = makeCache(0);
    const map = cache.asReadonlyMap();
    cache.set('a', { bytes: 1 }, { evictable: false });
    expect(cache.asReadonlyMap()).toBe(map);
    expect(map.get('a')).toEqual({ bytes: 1 });
    cache.delete('a');
    expect(cache.asReadonlyMap()).toBe(map);
    expect(map.has('a')).toBe(false);
    cache.set('b', { bytes: 1 }, { evictable: true });
    cache.evict();
    expect(cache.asReadonlyMap()).toBe(map);
    cache.set('c', { bytes: 1 }, { evictable: false });
    cache.clear();
    expect(cache.asReadonlyMap()).toBe(map);
    expect(map.size).toBe(0);
  });

  it('DC6: estimateBufferBytes gives mono ×4 and stereo ×8 per frame', () => {
    expect(estimateBufferBytes({ length: 1000, numberOfChannels: 1 })).toBe(4000);
    expect(estimateBufferBytes({ length: 1000, numberOfChannels: 2 })).toBe(8000);
  });

  it('DC7: setPinned with an empty list releases only that owner pins', () => {
    const cache = makeCache(0);
    cache.set('a', { bytes: 10 }, { evictable: true });
    cache.set('b', { bytes: 10 }, { evictable: true });
    cache.setPinned('clips', ['a']);
    cache.setPinned('preview', ['b']);
    cache.setPinned('preview', []);
    expect(cache.isPinned('a')).toBe(true);
    expect(cache.isPinned('b')).toBe(false);
    expect(cache.evict()).toEqual(['b']);
    expect(cache.has('a')).toBe(true);
  });

  it('DC8: deleteMany removes only the named ids, keeps pins, and evict keeps the LRU order of the rest', () => {
    const cache = makeCache(10);
    const map = cache.asReadonlyMap();
    cache.set('a', { bytes: 10 }, { evictable: true });
    cache.set('b', { bytes: 10 }, { evictable: true });
    cache.set('c', { bytes: 10 }, { evictable: true });
    cache.set('d', { bytes: 10 }, { evictable: true });
    cache.set('e', { bytes: 10 }, { evictable: true });
    cache.set('video', { bytes: 50 }, { evictable: false });
    expect(cache.get('a')).toEqual({ bytes: 10 });
    cache.setPinned('clips', ['b', 'c']);
    cache.deleteMany(['b', 'd', 'missing']);
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(false);
    expect(cache.has('c')).toBe(true);
    expect(cache.has('d')).toBe(false);
    expect(cache.has('e')).toBe(true);
    expect(cache.has('video')).toBe(true);
    expect(cache.asReadonlyMap()).toBe(map);
    expect(cache.isPinned('b')).toBe(true);
    expect(cache.isPinned('c')).toBe(true);
    expect(cache.totalBytes()).toBe(80);
    expect(cache.evictableUnpinnedBytes()).toBe(20);
    expect(cache.evict()).toEqual(['e']);
    expect(cache.has('a')).toBe(true);
    expect(cache.has('c')).toBe(true);
  });
});
