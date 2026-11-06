import { plainSourceFetch, type SourceFetch } from './source-fetch';
import {
  readStemCacheValidators,
  STEM_CACHE_DB_NAME,
  STEM_CACHE_SCHEMA_VERSION,
  type StemCacheRecord,
  selectStemCacheEvictions,
  stemCacheBudgetBytes,
  stemCacheConditionalHeaders,
  stemCacheKey,
} from './stem-cache';

const STORE_NAME = 'entries';
const SWEEP_GRACE_MS = 60_000;

export interface StemCacheEntry {
  record: StemCacheRecord;
  bytes: ArrayBuffer;
}

export interface StemCacheStore {
  get(key: string): Promise<StemCacheEntry | null>;
  put(record: StemCacheRecord, bytes: ArrayBuffer): Promise<void>;
  touch(key: string, at: number): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<StemCacheRecord[]>;
  sweep(now: number): Promise<void>;
}

export interface CachedSourceFetchDeps {
  store: StemCacheStore | null;
  origin: string;
  fetchSource?: SourceFetch;
  now?: () => number;
  estimateQuota?: () => Promise<number | undefined>;
}

export interface CachedSourceFetch {
  fetchSource: SourceFetch;
  idle: () => Promise<void>;
}

interface ListableDirectory {
  keys(): AsyncIterable<string>;
}

function isListableDirectory(
  directory: FileSystemDirectoryHandle,
): directory is FileSystemDirectoryHandle & ListableDirectory {
  return 'keys' in directory && typeof directory.keys === 'function';
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function isStringOrNull(value: unknown): boolean {
  return value === null || typeof value === 'string';
}

function isFiniteNumber(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isStemCacheRecord(value: unknown): value is StemCacheRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    'key' in value &&
    'fileName' in value &&
    'etag' in value &&
    'lastModified' in value &&
    'contentType' in value &&
    'size' in value &&
    'storedAt' in value &&
    'lastAccessedAt' in value &&
    'schemaVersion' in value &&
    typeof value.key === 'string' &&
    typeof value.fileName === 'string' &&
    isStringOrNull(value.etag) &&
    isStringOrNull(value.lastModified) &&
    isStringOrNull(value.contentType) &&
    isFiniteNumber(value.size) &&
    isFiniteNumber(value.storedAt) &&
    isFiniteNumber(value.lastAccessedAt) &&
    value.schemaVersion === STEM_CACHE_SCHEMA_VERSION
  );
}

export function createBrowserStemCacheStore(): StemCacheStore | null {
  if (
    typeof indexedDB === 'undefined' ||
    typeof navigator === 'undefined' ||
    typeof navigator.storage?.getDirectory !== 'function' ||
    typeof FileSystemFileHandle === 'undefined' ||
    typeof FileSystemFileHandle.prototype.createWritable !== 'function'
  ) {
    return null;
  }
  let dbPromise: Promise<IDBDatabase> | null = null;
  const openDb = (): Promise<IDBDatabase> => {
    if (dbPromise === null) {
      const request = indexedDB.open(STEM_CACHE_DB_NAME, STEM_CACHE_SCHEMA_VERSION);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      dbPromise = requestToPromise(request);
    }
    return dbPromise;
  };
  const directory = async (): Promise<FileSystemDirectoryHandle> =>
    (await navigator.storage.getDirectory()).getDirectoryHandle(STEM_CACHE_DB_NAME, {
      create: true,
    });
  const readRecord = async (key: string): Promise<StemCacheRecord | null> => {
    const db = await openDb();
    const value: unknown = await requestToPromise(
      db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key),
    );
    return isStemCacheRecord(value) ? value : null;
  };
  const writeRecord = async (record: StemCacheRecord): Promise<void> => {
    const db = await openDb();
    await requestToPromise(
      db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(record),
    );
  };
  const removeFile = async (fileName: string): Promise<void> => {
    try {
      await (await directory()).removeEntry(fileName);
    } catch {
      return;
    }
  };
  const readAll = async (): Promise<unknown[]> => {
    const db = await openDb();
    return requestToPromise(
      db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll(),
    );
  };
  const remove = async (key: string): Promise<void> => {
    const record = await readRecord(key);
    const db = await openDb();
    await requestToPromise(
      db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(key),
    );
    if (record !== null) {
      await removeFile(record.fileName);
    }
  };
  return {
    async get(key) {
      const record = await readRecord(key);
      if (record === null) {
        return null;
      }
      let file: File;
      try {
        file = await (await (await directory()).getFileHandle(record.fileName)).getFile();
      } catch {
        await remove(key);
        return null;
      }
      if (file.size !== record.size) {
        await remove(key);
        return null;
      }
      return { record, bytes: await file.arrayBuffer() };
    },
    async put(record, bytes) {
      const previous = await readRecord(record.key);
      const handle = await (await directory()).getFileHandle(record.fileName, { create: true });
      const writable = await handle.createWritable();
      try {
        await writable.write(bytes);
        await writable.close();
      } catch (error) {
        await writable.abort().catch(() => undefined);
        await removeFile(record.fileName);
        throw error;
      }
      try {
        await writeRecord(record);
      } catch (error) {
        await removeFile(record.fileName);
        throw error;
      }
      if (previous !== null && previous.fileName !== record.fileName) {
        await removeFile(previous.fileName);
      }
    },
    async touch(key, at) {
      const db = await openDb();
      const store = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME);
      const value: unknown = await requestToPromise(store.get(key));
      if (isStemCacheRecord(value)) {
        await requestToPromise(store.put({ ...value, lastAccessedAt: at }));
      }
    },
    delete: remove,
    async list() {
      return (await readAll()).filter(isStemCacheRecord);
    },
    async sweep(now) {
      const values = await readAll();
      const db = await openDb();
      const known = new Set<string>();
      for (const value of values) {
        if (isStemCacheRecord(value)) {
          known.add(value.fileName);
        } else if (typeof value === 'object' && value !== null && 'key' in value) {
          const key = value.key;
          if (typeof key === 'string') {
            await requestToPromise(
              db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(key),
            );
          }
        }
      }
      const dir = await directory();
      if (!isListableDirectory(dir)) {
        return;
      }
      const orphans: string[] = [];
      for await (const name of dir.keys()) {
        const writtenAt = Number.parseInt(name.split('-')[0] ?? '', 36);
        const recent = Number.isFinite(writtenAt) && now - writtenAt < SWEEP_GRACE_MS;
        if (!known.has(name) && !recent) {
          orphans.push(name);
        }
      }
      for (const name of orphans) {
        await removeFile(name);
      }
    },
  };
}

async function browserQuota(): Promise<number | undefined> {
  if (typeof navigator === 'undefined' || typeof navigator.storage?.estimate !== 'function') {
    return undefined;
  }
  return (await navigator.storage.estimate()).quota;
}

function isQuotaError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'QuotaExceededError';
}

function cachedResponse(entry: StemCacheEntry): Response {
  const headers = new Headers();
  if (entry.record.contentType !== null) {
    headers.set('content-type', entry.record.contentType);
  }
  return new Response(entry.bytes, { status: 200, headers });
}

export function createCachedSourceFetch({
  store,
  origin,
  fetchSource = plainSourceFetch,
  now = () => Date.now(),
  estimateQuota = browserQuota,
}: CachedSourceFetchDeps): CachedSourceFetch {
  let disabled = store === null;
  let sweepPromise: Promise<void> | null = null;
  const writes = new Map<string, Promise<void>>();

  const storeBytes = async (
    activeStore: StemCacheStore,
    record: StemCacheRecord,
    bytes: ArrayBuffer,
  ): Promise<void> => {
    sweepPromise ??= activeStore.sweep(now()).catch(() => undefined);
    await sweepPromise;
    const victims = selectStemCacheEvictions(
      await activeStore.list(),
      record.key,
      record.size,
      stemCacheBudgetBytes(await estimateQuota()),
    );
    if (victims === null) {
      return;
    }
    for (const victim of victims) {
      await activeStore.delete(victim.key);
    }
    try {
      await activeStore.put(record, bytes);
    } catch (error) {
      if (!isQuotaError(error)) {
        throw error;
      }
      const oldest = (await activeStore.list())
        .filter((candidate) => candidate.key !== record.key)
        .sort((first, second) => first.lastAccessedAt - second.lastAccessedAt)[0];
      if (oldest !== undefined) {
        await activeStore.delete(oldest.key);
      }
      await activeStore.put(record, bytes);
    }
  };

  const write = async (
    activeStore: StemCacheStore,
    key: string,
    response: Response,
    signal: AbortSignal | null | undefined,
  ): Promise<void> => {
    let bytes: ArrayBuffer;
    try {
      bytes = await response.arrayBuffer();
    } catch {
      return;
    }
    if (signal?.aborted || disabled) {
      return;
    }
    const validators = readStemCacheValidators(response.headers);
    if (validators === null) {
      return;
    }
    const at = now();
    const record: StemCacheRecord = {
      key,
      fileName: `${at.toString(36)}-${Math.random().toString(36).slice(2)}`,
      etag: validators.etag,
      lastModified: validators.lastModified,
      contentType: response.headers.get('content-type'),
      size: bytes.byteLength,
      storedAt: at,
      lastAccessedAt: at,
      schemaVersion: STEM_CACHE_SCHEMA_VERSION,
    };
    try {
      await storeBytes(activeStore, record, bytes);
    } catch {
      disabled = true;
    }
  };

  const isStorable = (response: Response): boolean =>
    response.status === 200 && readStemCacheValidators(response.headers) !== null;

  const writeInBackground = (key: string, response: Response, init: RequestInit): void => {
    if (store === null || disabled || writes.has(key) || !isStorable(response)) {
      return;
    }
    const pending = write(store, key, response.clone(), init.signal).finally(() => {
      writes.delete(key);
    });
    writes.set(key, pending);
  };

  const cachedFetch: SourceFetch = async (url, init) => {
    const key = disabled || store === null ? null : stemCacheKey(url, origin);
    if (key === null || store === null) {
      return fetchSource(url, init);
    }
    let entry: StemCacheEntry | null;
    try {
      entry = await store.get(key);
    } catch {
      entry = null;
    }
    if (entry === null) {
      const response = await fetchSource(url, init);
      writeInBackground(key, response, init);
      return response;
    }
    let response: Response;
    try {
      response = await fetchSource(url, {
        ...init,
        cache: 'no-store',
        headers: stemCacheConditionalHeaders(entry.record),
      });
    } catch (error) {
      if (init.signal?.aborted) {
        throw error;
      }
      return cachedResponse(entry);
    }
    if (response.status === 304) {
      await store.touch(key, now()).catch(() => undefined);
      return cachedResponse(entry);
    }
    if (response.status === 404 || response.status === 410) {
      await store.delete(key).catch(() => undefined);
      return response;
    }
    if (response.status >= 500) {
      return cachedResponse(entry);
    }
    if (response.ok && !isStorable(response)) {
      await store.delete(key).catch(() => undefined);
      return response;
    }
    writeInBackground(key, response, init);
    return response;
  };

  return {
    fetchSource: cachedFetch,
    idle: async () => {
      await Promise.all([...writes.values()]);
    },
  };
}

let sharedPreviewFetch: SourceFetch | null = null;

export function publicPreviewSourceFetch(): SourceFetch {
  if (typeof window === 'undefined') {
    return plainSourceFetch;
  }
  if (sharedPreviewFetch === null) {
    sharedPreviewFetch = createCachedSourceFetch({
      store: createBrowserStemCacheStore(),
      origin: window.location.origin,
    }).fetchSource;
  }
  return sharedPreviewFetch;
}
