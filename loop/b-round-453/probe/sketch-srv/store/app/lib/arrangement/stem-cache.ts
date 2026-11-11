export const STEM_CACHE_DB_NAME = 'czaba-stem-cache-v2';
export const STEM_CACHE_SCHEMA_VERSION = 1;
export const STEM_CACHE_MAX_BUDGET_BYTES = 256 * 1024 * 1024;
export const STEM_CACHE_QUOTA_SHARE = 0.1;

export interface StemCacheRecord {
  key: string;
  fileName: string;
  etag: string | null;
  lastModified: string | null;
  contentType: string | null;
  size: number;
  storedAt: number;
  lastAccessedAt: number;
  schemaVersion: number;
}

export interface StemCacheValidators {
  etag: string | null;
  lastModified: string | null;
}

export function stemCacheKey(url: string, origin: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url, origin);
  } catch {
    return null;
  }
  if (parsed.origin !== origin || parsed.search !== '' || parsed.hash !== '') {
    return null;
  }
  return parsed.pathname;
}

export function readStemCacheValidators(headers: Headers): StemCacheValidators | null {
  const cacheControl = (headers.get('cache-control') ?? '').toLowerCase();
  if (cacheControl.includes('no-store')) {
    return null;
  }
  const vary = (headers.get('vary') ?? '')
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0 && part !== 'accept-encoding' && part !== 'origin');
  if (vary.length > 0) {
    return null;
  }
  const etag = headers.get('etag');
  const lastModified = headers.get('last-modified');
  if (etag === null && lastModified === null) {
    return null;
  }
  return { etag, lastModified };
}

export function stemCacheConditionalHeaders(record: StemCacheRecord): Headers {
  const headers = new Headers();
  if (record.etag !== null) {
    headers.set('If-None-Match', record.etag);
  }
  if (record.lastModified !== null) {
    headers.set('If-Modified-Since', record.lastModified);
  }
  return headers;
}

export function stemCacheBudgetBytes(quota: number | undefined): number {
  if (quota === undefined || !Number.isFinite(quota) || quota <= 0) {
    return 0;
  }
  return Math.min(STEM_CACHE_MAX_BUDGET_BYTES, Math.floor(quota * STEM_CACHE_QUOTA_SHARE));
}

export function selectStemCacheEvictions(
  records: readonly StemCacheRecord[],
  incomingKey: string,
  incomingSize: number,
  budget: number,
): StemCacheRecord[] | null {
  if (incomingSize <= 0 || incomingSize > budget / 4) {
    return null;
  }
  const others = records
    .filter((record) => record.key !== incomingKey)
    .sort((first, second) => first.lastAccessedAt - second.lastAccessedAt);
  let used = others.reduce((total, record) => total + record.size, 0);
  const victims: StemCacheRecord[] = [];
  for (const record of others) {
    if (used + incomingSize <= budget) {
      break;
    }
    victims.push(record);
    used -= record.size;
  }
  return victims;
}
