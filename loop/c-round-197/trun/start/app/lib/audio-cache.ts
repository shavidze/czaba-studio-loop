/**
 * Audio Cache - IndexedDB-based caching for audio stems
 *
 * Stores ArrayBuffer data to skip network requests on subsequent loads.
 * Decoding still required, but network time is eliminated.
 */

import { debug } from '~/lib/debug';

const DB_NAME = 'czaba-audio-cache';
const DB_VERSION = 1;
const STORE_NAME = 'stems';
const CACHE_EXPIRY_DAYS = 360;

interface CachedStem {
  key: string; // `${productHandle}:${stemId}`
  productHandle: string;
  stemId: string;
  arrayBuffer: ArrayBuffer;
  size: number;
  cachedAt: number; // timestamp
}

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Open/create the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      debug.error('Failed to open audio cache DB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('productHandle', 'productHandle', { unique: false });
        store.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
    };
  });

  return dbPromise;
}

/**
 * Get cached stem from IndexedDB
 */
export async function getCachedStem(
  productHandle: string,
  stemId: string,
): Promise<ArrayBuffer | null> {
  try {
    const db = await openDB();
    const key = `${productHandle}:${stemId}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => {
        debug.error('Failed to get cached stem:', request.error);
        resolve(null);
      };

      request.onsuccess = () => {
        const result = request.result as CachedStem | undefined;

        if (!result) {
          resolve(null);
          return;
        }

        // Check expiry
        const ageInDays = (Date.now() - result.cachedAt) / (1000 * 60 * 60 * 24);
        if (ageInDays > CACHE_EXPIRY_DAYS) {
          // Expired, delete and return null
          deleteCachedStem(productHandle, stemId);
          resolve(null);
          return;
        }

        debug.log(`📦 Cache hit: ${stemId} (${(result.size / 1024 / 1024).toFixed(1)}MB)`);
        resolve(result.arrayBuffer);
      };
    });
  } catch (error) {
    debug.error('Cache read error:', error);
    return null;
  }
}

/**
 * Store stem in IndexedDB cache
 */
export async function cacheStem(
  productHandle: string,
  stemId: string,
  arrayBuffer: ArrayBuffer,
): Promise<void> {
  try {
    const db = await openDB();
    const key = `${productHandle}:${stemId}`;

    const cachedStem: CachedStem = {
      key,
      productHandle,
      stemId,
      arrayBuffer,
      size: arrayBuffer.byteLength,
      cachedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(cachedStem);

      request.onerror = () => {
        debug.error('Failed to cache stem:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        debug.log(`💾 Cached: ${stemId} (${(arrayBuffer.byteLength / 1024 / 1024).toFixed(1)}MB)`);
        resolve();
      };
    });
  } catch (error) {
    debug.error('Cache write error:', error);
  }
}

/**
 * Delete a specific cached stem
 */
export async function deleteCachedStem(productHandle: string, stemId: string): Promise<void> {
  try {
    const db = await openDB();
    const key = `${productHandle}:${stemId}`;

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(key);
      resolve();
    });
  } catch (error) {
    debug.error('Cache delete error:', error);
  }
}

/**
 * Delete all cached stems for a product
 */
export async function clearProductCache(productHandle: string): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('productHandle');
      const request = index.openCursor(IDBKeyRange.only(productHandle));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          debug.log(`🗑️ Cleared cache for: ${productHandle}`);
          resolve();
        }
      };
    });
  } catch (error) {
    debug.error('Cache clear error:', error);
  }
}

/**
 * Clear all expired entries
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    const db = await openDB();
    const expiryTime = Date.now() - CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('cachedAt');
      const request = index.openCursor(IDBKeyRange.upperBound(expiryTime));

      let deletedCount = 0;
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          if (deletedCount > 0) {
            debug.log(`🧹 Cleared ${deletedCount} expired cache entries`);
          }
          resolve();
        }
      };
    });
  } catch (error) {
    debug.error('Cache cleanup error:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalSize: number;
  stemCount: number;
  products: string[];
}> {
  try {
    const db = await openDB();

    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as CachedStem[];
        const products = [...new Set(items.map((i) => i.productHandle))];
        const totalSize = items.reduce((sum, i) => sum + i.size, 0);

        resolve({
          totalSize,
          stemCount: items.length,
          products,
        });
      };

      request.onerror = () => {
        resolve({ totalSize: 0, stemCount: 0, products: [] });
      };
    });
  } catch (_error) {
    return { totalSize: 0, stemCount: 0, products: [] };
  }
}
