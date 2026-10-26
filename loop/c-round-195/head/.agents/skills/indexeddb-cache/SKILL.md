---
name: indexeddb-cache
description: IndexedDB client-side audio file caching with 30-day expiration. Use when working on audio caching, offline support, or optimizing stem loading in Studio.
---

# IndexedDB Cache

IndexedDB for client-side audio file caching - avoid re-downloading stems.

## Architecture

```
Request Audio → Check Cache (IndexedDB) → Cache Hit → Return
                       │ Miss
                       ▼
                Fetch + Save to IndexedDB
```

## Key Concepts

- **DB:** `czaba-audio-cache`, store: `audio`, keyPath: `key`
- **Schema:** `{ key, data: ArrayBuffer, contentType, size, cachedAt, expiresAt }`
- **Expiration:** 30 days (`CACHE_DURATION = 30 * 24 * 60 * 60 * 1000`)
- **Indexes:** `expiresAt` (for cleanup), `cachedAt` (for ordering)
- **Cleanup:** `cleanExpired()` on startup — remove entries past `expiresAt`

## Storage Limits

| Browser | Default Limit | Notes |
|---------|---------------|-------|
| Chrome | 80% of disk | Per origin |
| Firefox | 50% of disk | Per origin |
| Safari | 1GB | Prompts after |

## Best Practices

1. **Unique cache keys** - Use full URL or hash
2. **Set expiration** - 30 days is reasonable for audio
3. **Clean on startup** - Remove expired entries
4. **Handle quota errors** - Clear old entries if full
5. **Show cache status** - Let users clear if needed

## Implementation Details

Full AudioCacheService class + React hook: `references/cache-service.md`

## References

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- `docs/technical/architecture/audio-cache.md` - CZABA cache system
