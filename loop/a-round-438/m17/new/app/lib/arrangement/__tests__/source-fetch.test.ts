import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPurchasedWorkspaceCollection } from '../collection';
import { fetchAndDecodeSource, type SourceFetch } from '../source-fetch';
import { STEM_CACHE_SCHEMA_VERSION } from '../stem-cache';
import {
  createCachedSourceFetch,
  type StemCacheEntry,
  type StemCacheStore,
} from '../stem-cache.client';
import { studioSourceLoadStrings } from '../strings';

const ARRANGEMENT_ROOT = resolve(__dirname, '..');

const previewFetchHolder = vi.hoisted(() => {
  const holder: { current: SourceFetch | null } = { current: null };
  return holder;
});

vi.mock('../stem-cache.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../stem-cache.client')>();
  return {
    ...actual,
    publicPreviewSourceFetch: (): SourceFetch => (url, init) =>
      (previewFetchHolder.current ?? actual.publicPreviewSourceFetch())(url, init),
  };
});

const decodeAudioDataMock = vi.fn<(data: ArrayBuffer) => Promise<AudioBuffer>>();

class FakeDecodeContext {
  decodeAudioData(data: ArrayBuffer) {
    return decodeAudioDataMock(data);
  }
}

class FakeAudioBuffer {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  constructor(options: { length: number; numberOfChannels: number; sampleRate: number }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels;
    this.sampleRate = options.sampleRate;
  }
}

function decodeContext(): BaseAudioContext {
  return new OfflineAudioContext({ numberOfChannels: 2, length: 1, sampleRate: 48000 });
}

function okResponse(bytes: number[] = [1, 2, 3], headers: Record<string, string> = {}): Response {
  return new Response(new Uint8Array(bytes), { status: 200, headers });
}

function createMemoryStemCacheStore(): {
  store: StemCacheStore;
  entries: Map<string, StemCacheEntry>;
} {
  const entries = new Map<string, StemCacheEntry>();
  return {
    entries,
    store: {
      get: async (key) => entries.get(key) ?? null,
      put: async (record, bytes) => {
        entries.set(record.key, { record, bytes });
      },
      touch: async () => undefined,
      delete: async (key) => {
        entries.delete(key);
      },
      list: async () => [...entries.values()].map((entry) => entry.record),
      sweep: async () => undefined,
    },
  };
}

describe('PERF-9a fetchAndDecodeSource (source-fetch.ts)', () => {
  beforeEach(() => {
    decodeAudioDataMock.mockReset();
    vi.stubGlobal('OfflineAudioContext', FakeDecodeContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  });

  afterEach(() => {
    previewFetchHolder.current = null;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('SF1 one request with exactly { credentials: "omit", signal }, decoded from the response bytes', async () => {
    const decoded = new AudioBuffer({ length: 3, numberOfChannels: 1, sampleRate: 3 });
    decodeAudioDataMock.mockResolvedValue(decoded);
    const fetchSource = vi.fn<SourceFetch>(async () => okResponse([4, 5, 6]));
    const controller = new AbortController();
    await expect(
      fetchAndDecodeSource('/a.mp3', decodeContext(), controller.signal, fetchSource),
    ).resolves.toBe(decoded);
    expect(fetchSource).toHaveBeenCalledTimes(1);
    expect(fetchSource.mock.calls[0]?.[0]).toBe('/a.mp3');
    expect(fetchSource.mock.calls[0]?.[1]).toStrictEqual({
      credentials: 'omit',
      signal: controller.signal,
    });
    const data = decodeAudioDataMock.mock.calls[0]?.[0];
    expect(new Uint8Array(data ?? new ArrayBuffer(0))).toEqual(new Uint8Array([4, 5, 6]));
  });

  it('SF2 a non-ok status maps to httpFailed(status) and nothing is decoded', async () => {
    const fetchSource = vi.fn<SourceFetch>(async () => new Response(null, { status: 404 }));
    await expect(
      fetchAndDecodeSource('/a.mp3', decodeContext(), new AbortController().signal, fetchSource),
    ).rejects.toThrow(studioSourceLoadStrings.httpFailed(404));
    expect(decodeAudioDataMock).not.toHaveBeenCalled();
  });

  it('SF3 a rejected request maps to networkFailed; when aborted the same error object is rethrown', async () => {
    const offline = vi.fn<SourceFetch>(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(
      fetchAndDecodeSource('/a.mp3', decodeContext(), new AbortController().signal, offline),
    ).rejects.toThrow(studioSourceLoadStrings.networkFailed);

    const controller = new AbortController();
    const aborted = new DOMException('aborted', 'AbortError');
    const aborting = vi.fn<SourceFetch>(async () => {
      controller.abort();
      throw aborted;
    });
    await expect(
      fetchAndDecodeSource('/a.mp3', decodeContext(), controller.signal, aborting),
    ).rejects.toBe(aborted);
  });

  it('SF4 a body read failure maps to networkFailed; when aborted the same error object is rethrown', async () => {
    const bodyError = new Error('body failed');
    const brokenBody = () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(stream) {
            stream.error(bodyError);
          },
        }),
      );
    await expect(
      fetchAndDecodeSource(
        '/a.mp3',
        decodeContext(),
        new AbortController().signal,
        vi.fn<SourceFetch>(async () => brokenBody()),
      ),
    ).rejects.toThrow(studioSourceLoadStrings.networkFailed);

    const controller = new AbortController();
    await expect(
      fetchAndDecodeSource(
        '/a.mp3',
        decodeContext(),
        controller.signal,
        vi.fn<SourceFetch>(async () => {
          controller.abort();
          return brokenBody();
        }),
      ),
    ).rejects.toBe(bodyError);
    expect(decodeAudioDataMock).not.toHaveBeenCalled();
  });

  it('SF5 a decode failure maps to decodeFailed', async () => {
    decodeAudioDataMock.mockRejectedValue(new Error('EncodingError'));
    await expect(
      fetchAndDecodeSource(
        '/a.mp3',
        decodeContext(),
        new AbortController().signal,
        vi.fn<SourceFetch>(async () => okResponse()),
      ),
    ).rejects.toThrow(studioSourceLoadStrings.decodeFailed);
  });

  it('SF6 purchased never uses the stem cache: no stem-cache import in collection.ts, and a cached path still sends exactly { credentials: "omit", signal }', async () => {
    const collectionSource = readFileSync(resolve(ARRANGEMENT_ROOT, 'collection.ts'), 'utf8');
    expect(collectionSource.match(/stem-cache/g) ?? []).toEqual([]);

    decodeAudioDataMock.mockResolvedValue(
      new AudioBuffer({ length: 3, numberOfChannels: 1, sampleRate: 3 }),
    );
    const memory = createMemoryStemCacheStore();
    const demoNetwork = vi.fn<SourceFetch>(async () => okResponse([1, 2, 3], { etag: '"d"' }));
    const demoCache = createCachedSourceFetch({
      store: memory.store,
      origin: 'https://czaba.test',
      fetchSource: demoNetwork,
      estimateQuota: async () => 1_000_000_000,
    });
    await fetchAndDecodeSource(
      '/a.mp3',
      decodeContext(),
      new AbortController().signal,
      demoCache.fetchSource,
    );
    await demoCache.idle();
    expect(memory.entries.get('/a.mp3')?.record.schemaVersion).toBe(STEM_CACHE_SCHEMA_VERSION);
    previewFetchHolder.current = demoCache.fetchSource;

    const globalFetch = vi.fn<typeof fetch>(async () => okResponse());
    vi.stubGlobal('fetch', globalFetch);
    const collection = createPurchasedWorkspaceCollection({
      productId: 'p',
      productTitle: 'P',
      stems: [{ id: 'mix', name: 'Mix', audioUrl: '/a.mp3', order: 0 }],
    });
    const source = collection.sources[0];
    if (source === undefined) {
      throw new Error('purchased source missing');
    }
    const controller = new AbortController();
    await collection.loadSource(source, decodeContext(), controller.signal);
    expect(globalFetch).toHaveBeenCalledTimes(1);
    expect(globalFetch.mock.calls[0]?.[0]).toBe('/a.mp3');
    expect(globalFetch.mock.calls[0]?.[1]).toStrictEqual({
      credentials: 'omit',
      signal: controller.signal,
    });
  });
});
