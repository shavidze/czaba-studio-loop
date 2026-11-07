import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAndDecodeSource, plainSourceFetch, type SourceFetch } from '../source-fetch';
import {
  readStemCacheValidators,
  STEM_CACHE_DB_NAME,
  STEM_CACHE_MAX_BUDGET_BYTES,
  STEM_CACHE_SCHEMA_VERSION,
  type StemCacheRecord,
  selectStemCacheEvictions,
  stemCacheBudgetBytes,
  stemCacheKey,
} from '../stem-cache';
import {
  type CompletableTransaction,
  createBrowserStemCacheStore,
  createCachedSourceFetch,
  isStemCacheRecord,
  publicPreviewSourceFetch,
  type StemCacheEntry,
  type StemCacheStore,
  transactionDone,
} from '../stem-cache.client';
import { studioSourceLoadStrings } from '../strings';

const ORIGIN = 'https://czaba.test';
const URL_A = '/a.mp3';
const URL_B = '/b.mp3';
const QUOTA = 1_000_000_000;

interface Deferred {
  promise: Promise<void>;
  resolve: () => void;
}

function createDeferred(): Deferred {
  let resolve = () => undefined;
  const promise = new Promise<void>((done) => {
    resolve = () => {
      done();
      return undefined;
    };
  });
  return { promise, resolve };
}

interface FakeStemCacheStore {
  store: StemCacheStore;
  entries: Map<string, StemCacheEntry>;
  log: string[];
  get: ReturnType<typeof vi.fn<StemCacheStore['get']>>;
  put: ReturnType<typeof vi.fn<StemCacheStore['put']>>;
  touch: ReturnType<typeof vi.fn<StemCacheStore['touch']>>;
  remove: ReturnType<typeof vi.fn<StemCacheStore['delete']>>;
  list: ReturnType<typeof vi.fn<StemCacheStore['list']>>;
  sweep: ReturnType<typeof vi.fn<StemCacheStore['sweep']>>;
}

function createFakeStemCacheStore(): FakeStemCacheStore {
  const entries = new Map<string, StemCacheEntry>();
  const log: string[] = [];
  const get = vi.fn<StemCacheStore['get']>(async (key) => {
    log.push(`get:${key}`);
    const entry = entries.get(key);
    if (entry === undefined) {
      return null;
    }
    if (!isStemCacheRecord(entry.record) || entry.bytes.byteLength !== entry.record.size) {
      entries.delete(key);
      return null;
    }
    return { record: { ...entry.record }, bytes: entry.bytes.slice(0) };
  });
  const put = vi.fn<StemCacheStore['put']>(async (record, bytes) => {
    log.push(`put:${record.key}`);
    entries.set(record.key, { record: { ...record }, bytes: bytes.slice(0) });
  });
  const touch = vi.fn<StemCacheStore['touch']>(async (key, at) => {
    log.push(`touch:${key}`);
    const entry = entries.get(key);
    if (entry !== undefined) {
      entry.record = { ...entry.record, lastAccessedAt: at };
    }
  });
  const remove = vi.fn<StemCacheStore['delete']>(async (key) => {
    log.push(`delete:${key}`);
    entries.delete(key);
  });
  const list = vi.fn<StemCacheStore['list']>(async () => {
    log.push('list');
    return [...entries.values()].map((entry) => ({ ...entry.record }));
  });
  const sweep = vi.fn<StemCacheStore['sweep']>(async () => {
    log.push('sweep');
  });
  return {
    store: { get, put, touch, delete: remove, list, sweep },
    entries,
    log,
    get,
    put,
    touch,
    remove,
    list,
    sweep,
  };
}

function bytesOf(...values: number[]): Uint8Array<ArrayBuffer> {
  return new Uint8Array(values);
}

function audioResponse(
  body: BodyInit | null,
  headers: Record<string, string> = {},
  status = 200,
): Response {
  return new Response(body, { status, headers });
}

function validatedHeaders(etag = '"v1"'): Record<string, string> {
  return {
    etag,
    'last-modified': 'Wed, 05 Nov 2026 10:00:00 GMT',
    'content-type': 'audio/mpeg',
  };
}

function storedRecord(overrides: Partial<StemCacheRecord> = {}): StemCacheRecord {
  return {
    key: URL_A,
    fileName: 'old-file',
    etag: '"v1"',
    lastModified: 'Wed, 05 Nov 2026 10:00:00 GMT',
    contentType: 'audio/mpeg',
    size: 3,
    storedAt: 10,
    lastAccessedAt: 10,
    schemaVersion: STEM_CACHE_SCHEMA_VERSION,
    ...overrides,
  };
}

function seed(
  fake: FakeStemCacheStore,
  record: StemCacheRecord,
  bytes: Uint8Array = bytesOf(7, 8, 9),
): void {
  fake.entries.set(record.key, { record, bytes: bytes.slice().buffer });
}

interface ControlledBody {
  body: ReadableStream<Uint8Array<ArrayBuffer>>;
  finish: (chunk: Uint8Array<ArrayBuffer>) => void;
}

function createControlledBody(): ControlledBody {
  let finish: (chunk: Uint8Array<ArrayBuffer>) => void = () => undefined;
  const body = new ReadableStream<Uint8Array<ArrayBuffer>>({
    start(controller) {
      finish = (chunk) => {
        controller.enqueue(chunk);
        controller.close();
      };
    },
  });
  return { body, finish: (chunk) => finish(chunk) };
}

async function bodyOf(response: Response): Promise<Uint8Array> {
  return new Uint8Array(await response.arrayBuffer());
}

function clock(start = 1_000): () => number {
  let value = start;
  return () => {
    value += 1;
    return value;
  };
}

async function flushTasks(rounds = 10): Promise<void> {
  for (let index = 0; index < rounds; index += 1) {
    await new Promise<void>((done) => setTimeout(done, 0));
  }
}

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

function cachedWith(
  fake: FakeStemCacheStore | null,
  fetchSource: SourceFetch,
  quota: number | undefined = QUOTA,
) {
  return createCachedSourceFetch({
    store: fake === null ? null : fake.store,
    origin: ORIGIN,
    fetchSource,
    now: clock(),
    estimateQuota: async () => quota,
  });
}

describe('PERF-9a stem cache rules and evictions', () => {
  it('SC1 key: same-origin path only; cross-origin, query and hash give null; relative URLs resolve against the origin', () => {
    expect(stemCacheKey('/middle-east.mp3', ORIGIN)).toBe('/middle-east.mp3');
    expect(stemCacheKey('videos/hero/hero-music.mp3', ORIGIN)).toBe('/videos/hero/hero-music.mp3');
    expect(stemCacheKey(`${ORIGIN}/x.mp3`, ORIGIN)).toBe('/x.mp3');
    expect(stemCacheKey('https://other.test/x.mp3', ORIGIN)).toBeNull();
    expect(stemCacheKey('/x.mp3?token=SECRET', ORIGIN)).toBeNull();
    expect(stemCacheKey('/x.mp3#t=1', ORIGIN)).toBeNull();
  });

  it('SC2 validators: ETag only, Last-Modified only, both, none; no-store and Vary rules', () => {
    expect(readStemCacheValidators(new Headers({ etag: '"e"' }))).toEqual({
      etag: '"e"',
      lastModified: null,
    });
    expect(readStemCacheValidators(new Headers({ 'last-modified': 'L' }))).toEqual({
      etag: null,
      lastModified: 'L',
    });
    expect(readStemCacheValidators(new Headers({ etag: 'W/"e"', 'last-modified': 'L' }))).toEqual({
      etag: 'W/"e"',
      lastModified: 'L',
    });
    expect(readStemCacheValidators(new Headers())).toBeNull();
    expect(
      readStemCacheValidators(new Headers({ etag: '"e"', 'cache-control': 'public, no-store' })),
    ).toBeNull();
    expect(
      readStemCacheValidators(new Headers({ etag: '"e"', vary: 'Accept-Encoding, Origin' })),
    ).toEqual({ etag: '"e"', lastModified: null });
    expect(readStemCacheValidators(new Headers({ etag: '"e"', vary: 'Range' }))).toBeNull();
  });

  it('SC3 budget: unknown, 0 or NaN quota gives 0; 10 % of the quota; capped at 256 MiB', () => {
    expect(stemCacheBudgetBytes(undefined)).toBe(0);
    expect(stemCacheBudgetBytes(0)).toBe(0);
    expect(stemCacheBudgetBytes(Number.NaN)).toBe(0);
    expect(stemCacheBudgetBytes(1_000_005)).toBe(100_000);
    expect(STEM_CACHE_MAX_BUDGET_BYTES).toBe(256 * 1024 * 1024);
    expect(stemCacheBudgetBytes(100 * 1024 * 1024 * 1024)).toBe(256 * 1024 * 1024);
  });

  it('SC4 evictions: least recently used first, none when it fits, null above budget/4, same key never a victim', () => {
    const records = [
      storedRecord({ key: '/new', size: 30, lastAccessedAt: 30 }),
      storedRecord({ key: '/old', size: 30, lastAccessedAt: 10 }),
      storedRecord({ key: '/mid', size: 30, lastAccessedAt: 20 }),
      storedRecord({ key: '/same', size: 30, lastAccessedAt: 1 }),
    ];
    expect(
      selectStemCacheEvictions(records, '/same', 25, 100)?.map((record) => record.key),
    ).toEqual(['/old']);
    expect(selectStemCacheEvictions(records, '/same', 10, 100)).toEqual([]);
    const larger = records.map((record) => ({ ...record, size: 40 }));
    expect(selectStemCacheEvictions(larger, '/same', 25, 100)?.map((record) => record.key)).toEqual(
      ['/old', '/mid'],
    );
    expect(selectStemCacheEvictions(records, '/same', 26, 100)).toBeNull();
  });

  it('SC4 evictions in the cached fetch: the least recently used other entry is deleted before the put', async () => {
    const fake = createFakeStemCacheStore();
    seed(
      fake,
      storedRecord({ key: '/old', fileName: 'o', size: 40, lastAccessedAt: 1 }),
      new Uint8Array(40),
    );
    seed(
      fake,
      storedRecord({ key: '/new', fileName: 'n', size: 40, lastAccessedAt: 50 }),
      new Uint8Array(40),
    );
    const cached = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => audioResponse(new Uint8Array(25), validatedHeaders())),
      1_000,
    );
    await cached.fetchSource(URL_A, { credentials: 'omit', signal: new AbortController().signal });
    await cached.idle();
    expect(fake.remove).toHaveBeenCalledTimes(1);
    expect(fake.remove).toHaveBeenCalledWith('/old');
    expect([...fake.entries.keys()].sort()).toEqual([URL_A, '/new'].sort());
    expect(fake.log.indexOf('delete:/old')).toBeLessThan(fake.log.indexOf(`put:${URL_A}`));
  });

  it('SC16 the database name is czaba-stem-cache-v2 and differs from the legacy czaba-audio-cache', () => {
    expect(STEM_CACHE_DB_NAME).toBe('czaba-stem-cache-v2');
    expect(STEM_CACHE_DB_NAME).not.toBe('czaba-audio-cache');
  });
});

describe('PERF-9a cached source fetch (stem-cache.client.ts)', () => {
  beforeEach(() => {
    decodeAudioDataMock.mockReset();
    vi.stubGlobal('OfflineAudioContext', FakeDecodeContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('SC5 miss: one request with the identical init, body equal to the network body, then one stored record', async () => {
    const fake = createFakeStemCacheStore();
    const fetchSource = vi.fn<SourceFetch>(async () =>
      audioResponse(bytesOf(1, 2, 3, 4), validatedHeaders()),
    );
    const cached = cachedWith(fake, fetchSource);
    const controller = new AbortController();
    const response = await cached.fetchSource(URL_A, {
      credentials: 'omit',
      signal: controller.signal,
    });
    expect(fetchSource).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSource.mock.calls[0] ?? [];
    expect(url).toBe(URL_A);
    expect(init).toEqual({ credentials: 'omit', signal: controller.signal });
    expect(Object.keys(init ?? {}).sort()).toEqual(['credentials', 'signal']);
    expect(await bodyOf(response)).toEqual(bytesOf(1, 2, 3, 4));
    await cached.idle();
    expect(fake.put).toHaveBeenCalledTimes(1);
    const stored = fake.entries.get(URL_A);
    expect(stored?.record).toMatchObject({
      key: URL_A,
      size: 4,
      etag: '"v1"',
      lastModified: 'Wed, 05 Nov 2026 10:00:00 GMT',
      contentType: 'audio/mpeg',
      schemaVersion: STEM_CACHE_SCHEMA_VERSION,
    });
    expect(new Uint8Array(stored?.bytes ?? new ArrayBuffer(0))).toEqual(bytesOf(1, 2, 3, 4));
  });

  it('SC6 hit + 304: conditional no-store request with both validators, stored bytes returned, lastAccessedAt moves forward', async () => {
    const fake = createFakeStemCacheStore();
    seed(fake, storedRecord());
    const fetchSource = vi.fn<SourceFetch>(async () => audioResponse(null, {}, 304));
    const cached = cachedWith(fake, fetchSource);
    const controller = new AbortController();
    const response = await cached.fetchSource(URL_A, {
      credentials: 'omit',
      signal: controller.signal,
    });
    expect(fetchSource).toHaveBeenCalledTimes(1);
    const init = fetchSource.mock.calls[0]?.[1];
    expect(init?.cache).toBe('no-store');
    expect(init?.credentials).toBe('omit');
    expect(init?.signal).toBe(controller.signal);
    const headers = new Headers(init?.headers);
    expect(headers.get('if-none-match')).toBe('"v1"');
    expect(headers.get('if-modified-since')).toBe('Wed, 05 Nov 2026 10:00:00 GMT');
    expect(response.status).toBe(200);
    expect(await bodyOf(response)).toEqual(bytesOf(7, 8, 9));
    await cached.idle();
    expect(fake.entries.get(URL_A)?.record.lastAccessedAt).toBeGreaterThan(10);
    expect(fake.put).not.toHaveBeenCalled();
  });

  it('SC7 hit + 200: the entry is replaced with the new bytes and the new ETag', async () => {
    const fake = createFakeStemCacheStore();
    seed(fake, storedRecord());
    const fetchSource = vi.fn<SourceFetch>(async () =>
      audioResponse(bytesOf(5, 6), validatedHeaders('"v2"')),
    );
    const cached = cachedWith(fake, fetchSource);
    const response = await cached.fetchSource(URL_A, {
      credentials: 'omit',
      signal: new AbortController().signal,
    });
    expect(await bodyOf(response)).toEqual(bytesOf(5, 6));
    await cached.idle();
    const stored = fake.entries.get(URL_A);
    expect(stored?.record.etag).toBe('"v2"');
    expect(stored?.record.size).toBe(2);
    expect(new Uint8Array(stored?.bytes ?? new ArrayBuffer(0))).toEqual(bytesOf(5, 6));
  });

  it('SC8 hit + network error: not aborted returns the stored bytes; aborted rethrows the same error object', async () => {
    const fake = createFakeStemCacheStore();
    seed(fake, storedRecord());
    const offline = new TypeError('Failed to fetch');
    const cached = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => {
        throw offline;
      }),
    );
    const response = await cached.fetchSource(URL_A, {
      credentials: 'omit',
      signal: new AbortController().signal,
    });
    expect(await bodyOf(response)).toEqual(bytesOf(7, 8, 9));

    const controller = new AbortController();
    const aborted = new DOMException('The operation was aborted.', 'AbortError');
    const abortingCache = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => {
        controller.abort();
        throw aborted;
      }),
    );
    await expect(
      abortingCache.fetchSource(URL_A, { credentials: 'omit', signal: controller.signal }),
    ).rejects.toBe(aborted);
  });

  it('SC9 hit + 404 or 410: the entry is deleted and the status is returned unchanged', async () => {
    for (const status of [404, 410]) {
      const fake = createFakeStemCacheStore();
      seed(fake, storedRecord());
      const cached = cachedWith(
        fake,
        vi.fn<SourceFetch>(async () => audioResponse(null, {}, status)),
      );
      const response = await cached.fetchSource(URL_A, {
        credentials: 'omit',
        signal: new AbortController().signal,
      });
      expect(response.status).toBe(status);
      await cached.idle();
      expect(fake.entries.has(URL_A)).toBe(false);
      expect(fake.remove).toHaveBeenCalledWith(URL_A);
    }
  });

  it('SC10 get rejects: plain request with the original init and the load succeeds', async () => {
    const fake = createFakeStemCacheStore();
    fake.get.mockRejectedValueOnce(new Error('idb broken'));
    const fetchSource = vi.fn<SourceFetch>(async () =>
      audioResponse(bytesOf(1, 2), validatedHeaders()),
    );
    const decoded = new AudioBuffer({ length: 2, numberOfChannels: 1, sampleRate: 2 });
    decodeAudioDataMock.mockResolvedValue(decoded);
    const cached = cachedWith(fake, fetchSource);
    const controller = new AbortController();
    await expect(
      fetchAndDecodeSource(URL_A, decodeContext(), controller.signal, cached.fetchSource),
    ).resolves.toBe(decoded);
    expect(fake.get).toHaveBeenCalledTimes(1);
    expect(fetchSource.mock.calls[0]?.[1]).toStrictEqual({
      credentials: 'omit',
      signal: controller.signal,
    });
    await cached.idle();
  });

  it('SC11 quota: evict the oldest other entry once and retry once; a second quota error turns the store off', async () => {
    const fake = createFakeStemCacheStore();
    seed(fake, storedRecord({ key: '/newer', fileName: 'n', lastAccessedAt: 50 }));
    seed(fake, storedRecord({ key: '/oldest', fileName: 'o', lastAccessedAt: 5 }));
    fake.put.mockRejectedValueOnce(new DOMException('full', 'QuotaExceededError'));
    const cached = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => audioResponse(bytesOf(1, 2), validatedHeaders())),
    );
    await cached.fetchSource(URL_A, { credentials: 'omit', signal: new AbortController().signal });
    await cached.idle();
    expect(fake.remove).toHaveBeenCalledTimes(1);
    expect(fake.remove).toHaveBeenCalledWith('/oldest');
    expect(fake.put).toHaveBeenCalledTimes(2);
    expect(fake.entries.has(URL_A)).toBe(true);
    expect(fake.entries.has('/newer')).toBe(true);

    const full = createFakeStemCacheStore();
    full.put.mockRejectedValue(new DOMException('full', 'QuotaExceededError'));
    const fetchSource = vi.fn<SourceFetch>(async () =>
      audioResponse(bytesOf(1, 2), validatedHeaders()),
    );
    const fullCache = cachedWith(full, fetchSource);
    await fullCache.fetchSource(URL_A, {
      credentials: 'omit',
      signal: new AbortController().signal,
    });
    await fullCache.idle();
    expect(full.put).toHaveBeenCalledTimes(2);
    expect(full.get).toHaveBeenCalledTimes(1);
    const controller = new AbortController();
    await fullCache.fetchSource(URL_B, { credentials: 'omit', signal: controller.signal });
    await fullCache.idle();
    expect(full.get).toHaveBeenCalledTimes(1);
    expect(fetchSource.mock.calls[1]?.[1]).toStrictEqual({
      credentials: 'omit',
      signal: controller.signal,
    });
  });

  it('SC12 the signal aborts before the commit: nothing is stored', async () => {
    const fake = createFakeStemCacheStore();
    const pending = createControlledBody();
    const cached = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => audioResponse(pending.body, validatedHeaders())),
    );
    const controller = new AbortController();
    await cached.fetchSource(URL_A, { credentials: 'omit', signal: controller.signal });
    controller.abort();
    pending.finish(bytesOf(1, 2, 3));
    await cached.idle();
    expect(fake.put).not.toHaveBeenCalled();
    expect(fake.entries.size).toBe(0);
  });

  it('SC13 not stored: no validators, no-store, 206, and an entry larger than budget/4', async () => {
    const cases: Array<{ response: () => Response; quota: number }> = [
      {
        response: () => audioResponse(bytesOf(1, 2), { 'content-type': 'audio/mpeg' }),
        quota: QUOTA,
      },
      {
        response: () =>
          audioResponse(bytesOf(1, 2), { ...validatedHeaders(), 'cache-control': 'no-store' }),
        quota: QUOTA,
      },
      { response: () => audioResponse(bytesOf(1, 2), validatedHeaders(), 206), quota: QUOTA },
      { response: () => audioResponse(bytesOf(1, 2, 3, 4, 5), validatedHeaders()), quota: 160 },
    ];
    for (const { response, quota } of cases) {
      const fake = createFakeStemCacheStore();
      const cached = cachedWith(
        fake,
        vi.fn<SourceFetch>(async () => response()),
        quota,
      );
      await cached.fetchSource(URL_A, {
        credentials: 'omit',
        signal: new AbortController().signal,
      });
      await cached.idle();
      expect(fake.put).not.toHaveBeenCalled();
      expect(fake.entries.size).toBe(0);
    }
  });

  it('SC14 on the server (no window) publicPreviewSourceFetch() is plainSourceFetch', () => {
    vi.stubGlobal('window', undefined);
    expect(publicPreviewSourceFetch()).toBe(plainSourceFetch);
  });

  it('SC14 no store: plain fetch with the exact init; createBrowserStemCacheStore() is null in jsdom', async () => {
    expect(createBrowserStemCacheStore()).toBeNull();
    const fetchSource = vi.fn<SourceFetch>(async () =>
      audioResponse(bytesOf(1), validatedHeaders()),
    );
    const cached = cachedWith(null, fetchSource);
    const controller = new AbortController();
    await cached.fetchSource(URL_A, { credentials: 'omit', signal: controller.signal });
    await cached.idle();
    expect(fetchSource).toHaveBeenCalledTimes(1);
    expect(fetchSource.mock.calls[0]?.[1]).toStrictEqual({
      credentials: 'omit',
      signal: controller.signal,
    });
  });

  it('SC15 integrity: a size mismatch or another schemaVersion is a miss that deletes the record and sends the full request', async () => {
    expect(isStemCacheRecord(storedRecord())).toBe(true);
    expect(isStemCacheRecord(storedRecord({ schemaVersion: STEM_CACHE_SCHEMA_VERSION + 1 }))).toBe(
      false,
    );
    expect(isStemCacheRecord({ ...storedRecord(), size: Number.NaN })).toBe(false);
    expect(isStemCacheRecord({ ...storedRecord(), etag: 5 })).toBe(false);
    expect(isStemCacheRecord(null)).toBe(false);

    for (const record of [
      storedRecord({ size: 99 }),
      storedRecord({ schemaVersion: STEM_CACHE_SCHEMA_VERSION + 1 }),
    ]) {
      const fake = createFakeStemCacheStore();
      seed(fake, record);
      const fetchSource = vi.fn<SourceFetch>(async () =>
        audioResponse(bytesOf(4, 4), validatedHeaders('"v2"')),
      );
      const cached = cachedWith(fake, fetchSource);
      const controller = new AbortController();
      const response = await cached.fetchSource(URL_A, {
        credentials: 'omit',
        signal: controller.signal,
      });
      expect(fetchSource.mock.calls[0]?.[1]).toStrictEqual({
        credentials: 'omit',
        signal: controller.signal,
      });
      expect(await bodyOf(response)).toEqual(bytesOf(4, 4));
      await cached.idle();
      expect(fake.entries.get(URL_A)?.record.etag).toBe('"v2"');
    }
  });

  it('SC17 two misses for one key while the first write is pending: put is called once', async () => {
    const fake = createFakeStemCacheStore();
    const sweepGate = createDeferred();
    fake.sweep.mockImplementation(() => sweepGate.promise);
    const cached = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => audioResponse(bytesOf(1, 2), validatedHeaders())),
    );
    await cached.fetchSource(URL_A, { credentials: 'omit', signal: new AbortController().signal });
    await cached.fetchSource(URL_A, { credentials: 'omit', signal: new AbortController().signal });
    expect(fake.get).toHaveBeenCalledTimes(2);
    sweepGate.resolve();
    await cached.idle();
    expect(fake.put).toHaveBeenCalledTimes(1);
  });

  it('SC18 hit + 503: the stored bytes are returned and nothing is written', async () => {
    const fake = createFakeStemCacheStore();
    seed(fake, storedRecord());
    const cached = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => audioResponse(bytesOf(0), validatedHeaders('"v9"'), 503)),
    );
    const response = await cached.fetchSource(URL_A, {
      credentials: 'omit',
      signal: new AbortController().signal,
    });
    expect(response.status).toBe(200);
    expect(await bodyOf(response)).toEqual(bytesOf(7, 8, 9));
    await cached.idle();
    expect(fake.put).not.toHaveBeenCalled();
    expect(fake.entries.get(URL_A)?.record.etag).toBe('"v1"');
  });

  it('SC19 a body read error or abort in the write keeps the store on; a non-quota put error turns it off', async () => {
    const fake = createFakeStemCacheStore();
    const broken = new ReadableStream<Uint8Array<ArrayBuffer>>({
      start(controller) {
        controller.error(new Error('body read failed'));
      },
    });
    const fetchSource = vi.fn<SourceFetch>(async () => audioResponse(broken, validatedHeaders()));
    const cached = cachedWith(fake, fetchSource);
    await cached.fetchSource(URL_A, { credentials: 'omit', signal: new AbortController().signal });
    await cached.idle();
    expect(fake.put).not.toHaveBeenCalled();
    const pending = createControlledBody();
    fetchSource.mockImplementationOnce(async () => audioResponse(pending.body, validatedHeaders()));
    const controller = new AbortController();
    await cached.fetchSource(URL_A, { credentials: 'omit', signal: controller.signal });
    controller.abort();
    pending.finish(bytesOf(1));
    await cached.idle();
    expect(fake.put).not.toHaveBeenCalled();
    fetchSource.mockImplementation(async () => audioResponse(bytesOf(1), validatedHeaders()));
    await cached.fetchSource(URL_A, { credentials: 'omit', signal: new AbortController().signal });
    await cached.idle();
    expect(fake.get).toHaveBeenCalledTimes(3);
    expect(fake.put).toHaveBeenCalledTimes(1);

    const failing = createFakeStemCacheStore();
    failing.put.mockRejectedValue(new Error('idb write failed'));
    const failingCache = cachedWith(
      failing,
      vi.fn<SourceFetch>(async () => audioResponse(bytesOf(1), validatedHeaders())),
    );
    await failingCache.fetchSource(URL_A, {
      credentials: 'omit',
      signal: new AbortController().signal,
    });
    await failingCache.idle();
    expect(failing.put).toHaveBeenCalledTimes(1);
    await failingCache.fetchSource(URL_B, {
      credentials: 'omit',
      signal: new AbortController().signal,
    });
    await failingCache.idle();
    expect(failing.get).toHaveBeenCalledTimes(1);
  });

  it('SC20 sweep runs once per session and every write waits for it, including a second key started together', async () => {
    const fake = createFakeStemCacheStore();
    const sweepGate = createDeferred();
    fake.sweep.mockImplementation(async () => {
      fake.log.push('sweep');
      await sweepGate.promise;
      fake.log.push('sweep-done');
    });
    const cached = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => audioResponse(bytesOf(1, 2), validatedHeaders())),
    );
    await Promise.all([
      cached.fetchSource(URL_A, { credentials: 'omit', signal: new AbortController().signal }),
      cached.fetchSource(URL_B, { credentials: 'omit', signal: new AbortController().signal }),
    ]);
    await flushTasks();
    expect(fake.put).not.toHaveBeenCalled();
    sweepGate.resolve();
    await cached.idle();
    expect(fake.put).toHaveBeenCalledTimes(2);
    const done = fake.log.indexOf('sweep-done');
    expect(done).toBeGreaterThan(-1);
    expect(fake.log.findIndex((line) => line.startsWith('put:'))).toBeGreaterThan(done);
    await cached.fetchSource('/c.mp3', {
      credentials: 'omit',
      signal: new AbortController().signal,
    });
    await cached.idle();
    expect(fake.sweep).toHaveBeenCalledTimes(1);
    expect(fake.put).toHaveBeenCalledTimes(3);
  });

  it('SC21 hit + an unstorable 200 (no-store, or no validators) deletes the entry; a later network error is a network failure, not old bytes', async () => {
    const unstorable: Array<Record<string, string>> = [
      { ...validatedHeaders('"v2"'), 'cache-control': 'no-store' },
      { 'content-type': 'audio/mpeg' },
    ];
    for (const headers of unstorable) {
      const fake = createFakeStemCacheStore();
      seed(fake, storedRecord());
      const fetchSource = vi.fn<SourceFetch>(async () => audioResponse(bytesOf(5), headers));
      const cached = cachedWith(fake, fetchSource);
      const response = await cached.fetchSource(URL_A, {
        credentials: 'omit',
        signal: new AbortController().signal,
      });
      expect(await bodyOf(response)).toEqual(bytesOf(5));
      await cached.idle();
      expect(fake.entries.has(URL_A)).toBe(false);
      expect(fake.put).not.toHaveBeenCalled();
      fetchSource.mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(
        fetchAndDecodeSource(
          URL_A,
          decodeContext(),
          new AbortController().signal,
          cached.fetchSource,
        ),
      ).rejects.toThrow(studioSourceLoadStrings.networkFailed);
      expect(decodeAudioDataMock).not.toHaveBeenCalled();
    }
  });
});

function createFakeTransaction(): CompletableTransaction {
  return { error: null, oncomplete: null, onabort: null };
}

function requestInit(signal: AbortSignal = new AbortController().signal): RequestInit {
  return { credentials: 'omit', signal };
}

type FakeEventHandler = ((event: Event) => void) | null;

interface FakeBrowserStorage {
  records: Map<string, StemCacheRecord>;
  files: Map<string, Uint8Array>;
  holdNextCommit: () => Deferred;
  failNextPut: (error: DOMException) => void;
}

function installFakeBrowserStorage(): FakeBrowserStorage {
  const records = new Map<string, StemCacheRecord>();
  const files = new Map<string, Uint8Array>();
  let heldCommit: Deferred | null = null;
  let putFailure: DOMException | null = null;
  let created = false;

  class FakeRequest {
    result: unknown = undefined;
    error: DOMException | null = null;
    onsuccess: FakeEventHandler = null;
    onerror: FakeEventHandler = null;
    onupgradeneeded: FakeEventHandler = null;
  }

  class FakeTransaction {
    error: DOMException | null = null;
    oncomplete: FakeEventHandler = null;
    onerror: FakeEventHandler = null;
    onabort: FakeEventHandler = null;
    private pending = 0;
    private finished = false;
    private readonly staged: Array<() => void> = [];
    private readonly gate: Promise<void>;

    constructor(mode: string) {
      this.gate =
        mode === 'readwrite' && heldCommit !== null ? heldCommit.promise : Promise.resolve();
      if (mode === 'readwrite') {
        heldCommit = null;
      }
    }

    objectStore() {
      return {
        get: (key: string) => this.request(() => records.get(key)),
        getAll: () => this.request(() => [...records.values()]),
        put: (value: StemCacheRecord) => {
          const failure = putFailure;
          putFailure = null;
          return this.request(() => {
            this.staged.push(() => records.set(value.key, value));
            return value.key;
          }, failure);
        },
        delete: (key: string) =>
          this.request(() => {
            this.staged.push(() => records.delete(key));
            return undefined;
          }),
      };
    }

    private request(read: () => unknown, failure: DOMException | null = null): FakeRequest {
      const request = new FakeRequest();
      this.pending += 1;
      setTimeout(() => {
        if (this.finished) {
          return;
        }
        if (failure !== null) {
          request.error = failure;
          request.onerror?.(new Event('error'));
          this.onerror?.(new Event('error'));
          this.error = failure;
          this.finished = true;
          this.onabort?.(new Event('abort'));
          return;
        }
        request.result = read();
        request.onsuccess?.(new Event('success'));
        this.pending -= 1;
        if (this.pending === 0) {
          void this.commit();
        }
      }, 0);
      return request;
    }

    private async commit(): Promise<void> {
      await this.gate;
      await new Promise<void>((done) => setTimeout(done, 0));
      if (this.finished || this.pending > 0) {
        return;
      }
      this.finished = true;
      for (const apply of this.staged) {
        apply();
      }
      this.oncomplete?.(new Event('complete'));
    }
  }

  const database = {
    objectStoreNames: { contains: () => created },
    createObjectStore: () => {
      created = true;
    },
    transaction: (_name: string, mode: string) => new FakeTransaction(mode),
  };

  class FakeFileHandle {
    constructor(private readonly name: string) {}

    async getFile() {
      const bytes = files.get(this.name);
      if (bytes === undefined) {
        throw new DOMException('missing', 'NotFoundError');
      }
      return { size: bytes.byteLength, arrayBuffer: async () => bytes.slice().buffer };
    }

    async createWritable() {
      const name = this.name;
      let written = new Uint8Array();
      return {
        write: async (data: ArrayBuffer) => {
          written = new Uint8Array(data.slice(0));
        },
        close: async () => {
          files.set(name, written);
        },
        abort: async () => undefined,
      };
    }
  }

  const directory = {
    getFileHandle: async (name: string, options: { create?: boolean } = {}) => {
      if (!files.has(name)) {
        if (options.create !== true) {
          throw new DOMException('missing', 'NotFoundError');
        }
        files.set(name, new Uint8Array());
      }
      return new FakeFileHandle(name);
    },
    removeEntry: async (name: string) => {
      if (!files.delete(name)) {
        throw new DOMException('missing', 'NotFoundError');
      }
    },
    keys: async function* () {
      for (const name of [...files.keys()]) {
        yield name;
      }
    },
  };

  vi.stubGlobal('FileSystemFileHandle', FakeFileHandle);
  vi.stubGlobal('navigator', {
    storage: { getDirectory: async () => ({ getDirectoryHandle: async () => directory }) },
  });
  vi.stubGlobal('indexedDB', {
    open: () => {
      const request = new FakeRequest();
      setTimeout(() => {
        request.result = database;
        request.onupgradeneeded?.(new Event('upgradeneeded'));
        request.onsuccess?.(new Event('success'));
      }, 0);
      return request;
    },
  });

  return {
    records,
    files,
    holdNextCommit: () => {
      const gate = createDeferred();
      heldCommit = gate;
      return gate;
    },
    failNextPut: (error) => {
      putFailure = error;
    },
  };
}

function openBrowserStore(): StemCacheStore {
  const store = createBrowserStemCacheStore();
  if (store === null) {
    throw new Error('the browser stem cache store is unavailable');
  }
  return store;
}

describe('PERF-9b-ii stem cache commit discipline (stem-cache.client.ts)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('SC22 transactionDone resolves only on complete; it rejects on abort with the transaction error, or an AbortError when there is none; with no event it stays pending (the error-event order is SC23)', async () => {
    const completed = createFakeTransaction();
    const done = transactionDone(completed);
    completed.oncomplete?.(new Event('complete'));
    await expect(done).resolves.toBeUndefined();

    const failure = new DOMException('write failed', 'QuotaExceededError');
    const aborted = { ...createFakeTransaction(), error: failure };
    const abortedDone = transactionDone(aborted);
    aborted.onabort?.(new Event('abort'));
    await expect(abortedDone).rejects.toBe(failure);

    const bare = createFakeTransaction();
    const bareDone = transactionDone(bare);
    bare.onabort?.(new Event('abort'));
    await expect(bareDone).rejects.toMatchObject({ name: 'AbortError' });

    const waiting = createFakeTransaction();
    const state = await Promise.race([
      transactionDone(waiting).then(
        () => 'settled',
        () => 'settled',
      ),
      flushTasks(2).then(() => 'pending'),
    ]);
    expect(state).toBe('pending');
  });

  it('SC23 browser store (fake IndexedDB + OPFS): put resolves only after the record transaction completes and removes the previous file only then; an aborted transaction rejects with its own error and keeps the previous entry', async () => {
    const fake = installFakeBrowserStorage();
    const store = openBrowserStore();
    await store.put(storedRecord({ fileName: 'old', size: 3 }), bytesOf(7, 8, 9).buffer);
    expect(fake.files.has('old')).toBe(true);

    const gate = fake.holdNextCommit();
    const pendingPut = store.put(
      storedRecord({ fileName: 'new', etag: '"v2"', size: 2 }),
      bytesOf(1, 2).buffer,
    );
    const state = await Promise.race([
      pendingPut.then(() => 'settled'),
      flushTasks(10).then(() => 'pending'),
    ]);
    expect(state).toBe('pending');
    expect(fake.files.has('old')).toBe(true);
    expect(fake.records.get(URL_A)?.fileName).toBe('old');
    gate.resolve();
    await pendingPut;
    expect(fake.files.has('old')).toBe(false);
    expect(fake.records.get(URL_A)?.etag).toBe('"v2"');
    const entry = await store.get(URL_A);
    expect(new Uint8Array(entry?.bytes ?? new ArrayBuffer(0))).toEqual(bytesOf(1, 2));

    const failure = new DOMException('quota', 'QuotaExceededError');
    fake.failNextPut(failure);
    await expect(
      store.put(storedRecord({ fileName: 'third', etag: '"v3"', size: 1 }), bytesOf(5).buffer),
    ).rejects.toBe(failure);
    expect(fake.files.has('third')).toBe(false);
    expect(fake.files.has('new')).toBe(true);
    expect(fake.records.get(URL_A)?.etag).toBe('"v2"');
  });

  it('SC28 browser store integrity (fake IndexedDB + OPFS): a file whose size differs from its record, or a missing file, is a miss that deletes the record and the file', async () => {
    const fake = installFakeBrowserStorage();
    const store = openBrowserStore();
    await store.put(storedRecord({ fileName: 'a-file', size: 3 }), bytesOf(7, 8, 9).buffer);
    await store.put(
      storedRecord({ key: URL_B, fileName: 'b-file', size: 2 }),
      bytesOf(1, 2).buffer,
    );
    fake.files.set('a-file', bytesOf(7));
    expect(await store.get(URL_A)).toBeNull();
    expect(fake.records.has(URL_A)).toBe(false);
    expect(fake.files.has('a-file')).toBe(false);
    fake.files.delete('b-file');
    expect(await store.get(URL_B)).toBeNull();
    expect(fake.records.has(URL_B)).toBe(false);
    expect([...fake.records.keys()]).toEqual([]);
  });

  it('SC24 an abort after the body is read stores nothing: during the sweep no victim is deleted, during a victim delete nothing is put', async () => {
    const fake = createFakeStemCacheStore();
    seed(
      fake,
      storedRecord({ key: '/old', fileName: 'o', size: 35, lastAccessedAt: 1 }),
      new Uint8Array(35),
    );
    const sweepGate = createDeferred();
    fake.sweep.mockImplementation(() => sweepGate.promise);
    const cached = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => audioResponse(new Uint8Array(10), validatedHeaders())),
      400,
    );
    const controller = new AbortController();
    await cached.fetchSource(URL_A, requestInit(controller.signal));
    await flushTasks();
    expect(fake.sweep).toHaveBeenCalledTimes(1);
    controller.abort();
    sweepGate.resolve();
    await cached.idle();
    expect(fake.remove).not.toHaveBeenCalled();
    expect(fake.put).not.toHaveBeenCalled();
    expect(fake.entries.has('/old')).toBe(true);

    const second = createFakeStemCacheStore();
    seed(
      second,
      storedRecord({ key: '/old', fileName: 'o', size: 35, lastAccessedAt: 1 }),
      new Uint8Array(35),
    );
    const deleteGate = createDeferred();
    second.remove.mockImplementationOnce(async (key) => {
      second.log.push(`delete:${key}`);
      await deleteGate.promise;
      second.entries.delete(key);
    });
    const secondCache = cachedWith(
      second,
      vi.fn<SourceFetch>(async () => audioResponse(new Uint8Array(10), validatedHeaders())),
      400,
    );
    const secondController = new AbortController();
    await secondCache.fetchSource(URL_A, requestInit(secondController.signal));
    await flushTasks();
    expect(second.remove).toHaveBeenCalledWith('/old');
    secondController.abort();
    deleteGate.resolve();
    await secondCache.idle();
    expect(second.put).not.toHaveBeenCalled();
    expect(second.entries.has(URL_A)).toBe(false);
  });

  it('SC25 a 404, 410 or unstorable 200 on a hit returns without waiting for a pending write of the same key, and the delete still lands after that write', async () => {
    const finals: Array<{ status: number; response: () => Response }> = [
      { status: 404, response: () => audioResponse(null, {}, 404) },
      { status: 410, response: () => audioResponse(null, {}, 410) },
      { status: 200, response: () => audioResponse(bytesOf(5), { 'content-type': 'audio/mpeg' }) },
    ];
    for (const final of finals) {
      const fake = createFakeStemCacheStore();
      seed(fake, storedRecord());
      const putGate = createDeferred();
      fake.put.mockImplementationOnce(async (record, bytes) => {
        fake.log.push(`put:${record.key}`);
        await putGate.promise;
        fake.entries.set(record.key, { record: { ...record }, bytes: bytes.slice(0) });
      });
      const fetchSource = vi.fn<SourceFetch>(async () =>
        audioResponse(bytesOf(1, 2, 3, 4), validatedHeaders('"v2"')),
      );
      const cached = cachedWith(fake, fetchSource);
      await cached.fetchSource(URL_A, requestInit());
      await flushTasks();
      expect(fake.put).toHaveBeenCalledTimes(1);
      fetchSource.mockImplementationOnce(async () => final.response());
      const pending = cached.fetchSource(URL_A, requestInit());
      const state = await Promise.race([
        pending.then(() => 'settled'),
        flushTasks(10).then(() => 'pending'),
      ]);
      expect(state).toBe('settled');
      expect((await pending).status).toBe(final.status);
      putGate.resolve();
      await cached.idle();
      expect(fake.entries.has(URL_A)).toBe(false);
      expect(fake.log.lastIndexOf(`delete:${URL_A}`)).toBeGreaterThan(
        fake.log.indexOf(`put:${URL_A}`),
      );
    }
  });

  it('SC26 a clone that throws is an unstored miss with the store still on, and a stored content type that Headers rejects is served without it', async () => {
    const fake = createFakeStemCacheStore();
    const network = audioResponse(bytesOf(1, 2), validatedHeaders());
    vi.spyOn(network, 'clone').mockImplementation(() => {
      throw new TypeError('clone failed');
    });
    const fetchSource = vi.fn<SourceFetch>(async () => network);
    const cached = cachedWith(fake, fetchSource);
    const response = await cached.fetchSource(URL_A, requestInit());
    expect(response).toBe(network);
    expect(await bodyOf(response)).toEqual(bytesOf(1, 2));
    await cached.idle();
    expect(fake.put).not.toHaveBeenCalled();
    fetchSource.mockImplementation(async () => audioResponse(bytesOf(3), validatedHeaders()));
    await cached.fetchSource(URL_B, requestInit());
    await cached.idle();
    expect(fake.put).toHaveBeenCalledTimes(1);

    const hit = createFakeStemCacheStore();
    seed(hit, storedRecord({ contentType: 'audio/mpeg\nx-injected: 1' }));
    const hitCache = cachedWith(
      hit,
      vi.fn<SourceFetch>(async () => audioResponse(null, {}, 304)),
    );
    const served = await hitCache.fetchSource(URL_A, requestInit());
    expect(served.status).toBe(200);
    expect(served.headers.get('content-type')).toBeNull();
    expect(served.headers.get('x-injected')).toBeNull();
    expect(await bodyOf(served)).toEqual(bytesOf(7, 8, 9));
  });

  it('SC27 eviction planning is serialised per session: two keys started together end within the budget', async () => {
    const fake = createFakeStemCacheStore();
    seed(
      fake,
      storedRecord({ key: '/old', fileName: 'o', size: 25, lastAccessedAt: 1 }),
      new Uint8Array(25),
    );
    const sweepGate = createDeferred();
    fake.sweep.mockImplementation(() => sweepGate.promise);
    const cached = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => audioResponse(new Uint8Array(10), validatedHeaders())),
      400,
    );
    await Promise.all([
      cached.fetchSource(URL_A, requestInit()),
      cached.fetchSource(URL_B, requestInit()),
    ]);
    await flushTasks();
    sweepGate.resolve();
    await cached.idle();
    const used = [...fake.entries.values()].reduce((total, entry) => total + entry.record.size, 0);
    expect(used).toBeLessThanOrEqual(40);
    expect([...fake.entries.keys()].sort()).toEqual([URL_A, URL_B].sort());
    expect(fake.remove).toHaveBeenCalledWith('/old');
    expect(fake.log.indexOf(`put:${URL_A}`)).toBeLessThan(fake.log.lastIndexOf('list'));
  });

  it('SC29 idle() waits for a pending hit delete', async () => {
    const fake = createFakeStemCacheStore();
    seed(fake, storedRecord());
    const deleteGate = createDeferred();
    fake.remove.mockImplementationOnce(async (key) => {
      fake.log.push(`delete:${key}`);
      await deleteGate.promise;
      fake.entries.delete(key);
    });
    const cached = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => audioResponse(null, {}, 404)),
    );
    await cached.fetchSource(URL_A, requestInit());
    const state = await Promise.race([
      cached.idle().then(() => 'settled'),
      flushTasks(10).then(() => 'pending'),
    ]);
    expect(state).toBe('pending');
    deleteGate.resolve();
    await cached.idle();
    expect(fake.entries.has(URL_A)).toBe(false);
  });

  it('SC30 a load that arrives after the pending write of its key was aborted joins that write, so the key is stored once: behind a held sweep and behind a held put of another key', async () => {
    const fake = createFakeStemCacheStore();
    const sweepGate = createDeferred();
    fake.sweep.mockImplementation(() => sweepGate.promise);
    const cached = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => audioResponse(bytesOf(1, 2), validatedHeaders())),
    );
    await cached.fetchSource(URL_B, requestInit());
    const first = new AbortController();
    await cached.fetchSource(URL_A, requestInit(first.signal));
    await flushTasks();
    first.abort();
    await cached.fetchSource(URL_A, requestInit());
    await flushTasks();
    sweepGate.resolve();
    await cached.idle();
    expect(fake.entries.has(URL_A)).toBe(true);
    expect(fake.entries.has(URL_B)).toBe(true);
    expect(fake.log.filter((line) => line === `put:${URL_A}`)).toHaveLength(1);

    const held = createFakeStemCacheStore();
    const putGate = createDeferred();
    held.put.mockImplementationOnce(async (record, bytes) => {
      held.log.push(`put:${record.key}`);
      await putGate.promise;
      held.entries.set(record.key, { record: { ...record }, bytes: bytes.slice(0) });
    });
    const heldCache = cachedWith(
      held,
      vi.fn<SourceFetch>(async () => audioResponse(bytesOf(3, 4), validatedHeaders())),
    );
    await heldCache.fetchSource(URL_B, requestInit());
    await flushTasks();
    expect(held.log).toContain(`put:${URL_B}`);
    const aborted = new AbortController();
    await heldCache.fetchSource(URL_A, requestInit(aborted.signal));
    await flushTasks();
    aborted.abort();
    await heldCache.fetchSource(URL_A, requestInit());
    await flushTasks();
    putGate.resolve();
    await heldCache.idle();
    expect(held.entries.has(URL_A)).toBe(true);
    expect(held.log.filter((line) => line === `put:${URL_A}`)).toHaveLength(1);
  });

  it('SC31 a load that joins a pending write keeps it alive when the first load aborts; when only the joining load aborts it is still stored; when every joined load aborts nothing is stored', async () => {
    const fake = createFakeStemCacheStore();
    const sweepGate = createDeferred();
    fake.sweep.mockImplementation(() => sweepGate.promise);
    const cached = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => audioResponse(bytesOf(1, 2), validatedHeaders())),
    );
    const first = new AbortController();
    await cached.fetchSource(URL_A, requestInit(first.signal));
    await flushTasks();
    await cached.fetchSource(URL_A, requestInit());
    await flushTasks();
    first.abort();
    sweepGate.resolve();
    await cached.idle();
    expect(fake.entries.has(URL_A)).toBe(true);
    expect(fake.put).toHaveBeenCalledTimes(1);

    const none = createFakeStemCacheStore();
    const noneSweep = createDeferred();
    none.sweep.mockImplementation(() => noneSweep.promise);
    const noneCache = cachedWith(
      none,
      vi.fn<SourceFetch>(async () => audioResponse(bytesOf(1, 2), validatedHeaders())),
    );
    const one = new AbortController();
    const two = new AbortController();
    await noneCache.fetchSource(URL_A, requestInit(one.signal));
    await flushTasks();
    await noneCache.fetchSource(URL_A, requestInit(two.signal));
    await flushTasks();
    one.abort();
    two.abort();
    noneSweep.resolve();
    await noneCache.idle();
    expect(none.put).not.toHaveBeenCalled();
    expect(none.entries.has(URL_A)).toBe(false);

    const joiner = createFakeStemCacheStore();
    const joinerSweep = createDeferred();
    joiner.sweep.mockImplementation(() => joinerSweep.promise);
    const joinerCache = cachedWith(
      joiner,
      vi.fn<SourceFetch>(async () => audioResponse(bytesOf(1, 2), validatedHeaders())),
    );
    await joinerCache.fetchSource(URL_A, requestInit());
    await flushTasks();
    const late = new AbortController();
    await joinerCache.fetchSource(URL_A, requestInit(late.signal));
    await flushTasks();
    late.abort();
    joinerSweep.resolve();
    await joinerCache.idle();
    expect(joiner.entries.has(URL_A)).toBe(true);
    expect(joiner.put).toHaveBeenCalledTimes(1);
  });

  it('SC32 a hit 404 while a same-key 200 is still reading its body deletes after that write lands', async () => {
    const fake = createFakeStemCacheStore();
    seed(fake, storedRecord());
    const body = createControlledBody();
    const fetchSource = vi.fn<SourceFetch>(async () =>
      audioResponse(body.body, validatedHeaders('"v2"')),
    );
    const cached = cachedWith(fake, fetchSource);
    const first = await cached.fetchSource(URL_A, requestInit());
    expect(first.status).toBe(200);
    fetchSource.mockImplementationOnce(async () => audioResponse(null, {}, 404));
    const gone = await cached.fetchSource(URL_A, requestInit());
    expect(gone.status).toBe(404);
    await flushTasks();
    body.finish(bytesOf(1, 2, 3, 4));
    await cached.idle();
    expect(fake.entries.has(URL_A)).toBe(false);
    expect(fake.log).toContain(`put:${URL_A}`);
    expect(fake.log.lastIndexOf(`delete:${URL_A}`)).toBeGreaterThan(
      fake.log.indexOf(`put:${URL_A}`),
    );
  });

  it('SC33 an abort during the quota-retry eviction stores nothing: the retry put is not made', async () => {
    const fake = createFakeStemCacheStore();
    seed(fake, storedRecord({ key: '/oldest', fileName: 'o', lastAccessedAt: 5 }));
    fake.put.mockRejectedValueOnce(new DOMException('full', 'QuotaExceededError'));
    const deleteGate = createDeferred();
    fake.remove.mockImplementationOnce(async (key) => {
      fake.log.push(`delete:${key}`);
      await deleteGate.promise;
      fake.entries.delete(key);
    });
    const cached = cachedWith(
      fake,
      vi.fn<SourceFetch>(async () => audioResponse(bytesOf(1, 2), validatedHeaders())),
    );
    const controller = new AbortController();
    await cached.fetchSource(URL_A, requestInit(controller.signal));
    await flushTasks();
    expect(fake.remove).toHaveBeenCalledWith('/oldest');
    controller.abort();
    deleteGate.resolve();
    await cached.idle();
    expect(fake.put).toHaveBeenCalledTimes(1);
    expect(fake.entries.has(URL_A)).toBe(false);
  });
});
