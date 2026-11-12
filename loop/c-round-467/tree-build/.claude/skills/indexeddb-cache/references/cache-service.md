# IndexedDB Cache Service Reference

## Cache Service Implementation

```typescript
const DB_NAME = "czaba-audio-cache";
const DB_VERSION = 1;
const STORE_NAME = "audio";
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

class AudioCacheService {
  private db: IDBDatabase | null = null;

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
          store.createIndex("expiresAt", "expiresAt");
          store.createIndex("cachedAt", "cachedAt");
        }
      };
    });
  }

  async get(key: string): Promise<ArrayBuffer | null> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const result = request.result as CachedAudio | undefined;

        if (!result) {
          resolve(null);
          return;
        }

        if (Date.now() > result.expiresAt) {
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
    });
  }

  async set(key: string, data: ArrayBuffer, contentType: string): Promise<void> {
    const db = await this.open();
    const now = Date.now();

    const entry: CachedAudio = {
      key,
      data,
      contentType,
      size: data.byteLength,
      cachedAt: now,
      expiresAt: now + CACHE_DURATION,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key: string): Promise<void> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    const db = await this.open();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async cleanExpired(): Promise<number> {
    const db = await this.open();
    const now = Date.now();
    let deleted = 0;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("expiresAt");
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);

      request.onerror = () => reject(request.error);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          resolve(deleted);
        }
      };
    });
  }
}

export const audioCache = new AudioCacheService();
```

## Usage with Fetch

```typescript
async function fetchAudioWithCache(url: string): Promise<ArrayBuffer> {
  const cached = await audioCache.get(url);
  if (cached) {
    return cached;
  }

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "audio/wav";

  await audioCache.set(url, arrayBuffer, contentType);

  return arrayBuffer;
}
```

## React Hook

```typescript
function useAudioCache() {
  const [stats, setStats] = useState({ count: 0, size: 0 });

  const getStats = async () => {
    const db = await audioCache.open();

    return new Promise<{ count: number; size: number }>((resolve) => {
      const tx = db.transaction("audio", "readonly");
      const store = tx.objectStore("audio");
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as CachedAudio[];
        const totalSize = items.reduce((sum, item) => sum + item.size, 0);
        resolve({ count: items.length, size: totalSize });
      };
    });
  };

  const clearCache = async () => {
    await audioCache.clear();
    setStats({ count: 0, size: 0 });
  };

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  return { stats, clearCache, refresh: () => getStats().then(setStats) };
}
```

## Storage Limits

| Browser | Default Limit | Notes |
|---------|---------------|-------|
| Chrome | 80% of disk | Per origin |
| Firefox | 50% of disk | Per origin |
| Safari | 1GB | Prompts after |

```typescript
async function checkStorage() {
  if (navigator.storage && navigator.storage.estimate) {
    const { usage, quota } = await navigator.storage.estimate();
    return { usage, quota };
  }
  return null;
}
```
