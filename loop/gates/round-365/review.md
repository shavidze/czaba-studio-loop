COMMIT: OK. `collection.ts` is touched, but only by a behavior-identical extraction. There is no access, URL, credentials or cache change on the purchased path. If the "must be none" rule is meant literally, that is a scope-policy BLOCK, not a defect. I did not read the tail of `verify.log`. I only read its first 5 lines and relied on your statement that it passed.

## Purchased-code check
- `collection.ts:118` now calls `fetchAndDecodeSource`. The removed block (diff lines 72–97) matches `source-fetch.ts:13–38` statement for statement. The error strings and the abort rethrow are the same.
- The default fetcher at `collection.ts:83` is unchanged: `fetch(url, init)`. `init` is still exactly `{credentials:'omit', signal}`.
- `source-fetch.ts` does not import `stem-cache*`. `collection.ts` does not either, and the SF6 source scan and tripwire guard that.
- `createPurchasedWorkspaceCollection` has no non-test caller in `app/`, so the purchased path is not live yet.
- No auth, checkout, download or token code is in the diff.

## Findings, ranked
1. **Medium, not blocking: warm loads read the whole OPFS file before the conditional request.**
   - Location: `stem-cache.client.ts:367` calling `get` (line 173, `file.arrayBuffer()`), serial before `fetchSource` at line 378.
   - On a 200 those bytes are thrown away. For `hero-music.mp3` (about 3.6 MB) every warm load pays a full disk read plus latency.
   - Fix: make `get` return the record only, with lazy bytes. Or start the conditional fetch first and read bytes only on 304, 5xx or network error.

2. **Medium, not blocking: the cache can serve stale bytes after a too-large replacement.**
   - Location: `stem-cache.client.ts:287`, where `victims === null` returns silently.
   - On a hit with a new 200 that is over budget/4, or when quota is unknown so the budget is 0, the old same-key record stays. A later network error then serves the old bytes. SC21 fixed the same problem for unstorable 200s.
   - Fix: when `victims === null`, call `activeStore.delete(record.key)` first, and add a test row.

3. **Low: a rejected `open` is cached forever.**
   - Location: `stem-cache.client.ts:104–114`, where `dbPromise` keeps a rejected promise.
   - It degrades safely, because `get` is caught and the write path sets `disabled`. But the cache stays off until the page reloads, even after a transient failure. The doc already defers `onblocked` and `onversionchange` to 9b. Fix: reset `dbPromise` to `null` on rejection.

4. **Low: `touch` awaits between `get` and `put` in one IndexedDB transaction.**
   - Location: `stem-cache.client.ts:199–203`.
   - This works in current engines, but it is fragile. Fix: use a cursor or `readwrite` with the `put` issued from the `get` `onsuccess`. Note that CS-WARM covers it only in Chromium.

5. **Low: the browser singleton hides `idle()`.**
   - Location: `stem-cache.client.ts:418–429`.
   - Browser rows such as CS-WARM cannot deterministically await the background write. Fix: also export the `idle` handle, or add a test-only accessor.

6. **Low: no content-type guard on stored responses.**
   - Location: `stem-cache.client.ts:347`, `isStorable`.
   - A 200 `text/html` fallback that carries an ETag would be cached and then fail at decode. Fix: require `content-type` to start with `audio/` or `application/octet-stream`.

7. **Info: `studio-lab-demo.ts:10` imports from a `.client` module.** This is the same pattern as `demo-synth.client` on line 8. `publicPreviewSourceFetch()` is only called client-side and falls back to `plainSourceFetch` without `window`. Per the doc, the A-SSR row covers the server build.

## Other checks
- **Listeners and timers:** none added. In-flight writes are tracked in the `writes` map and cleared in `finally`.
- **Event ordering:** abort is respected before commit (SC12), and an abort never disables the cache (SC19).
- **TypeScript strict:** grep found no `as` assertions, no `any`, no `@ts-*` and no `biome-ignore`. There are no comments and no `console`.
- **Tailwind, accessibility, render cost:** not applicable, because there is no UI change.
- **Security:** `credentials:'omit'` is kept. Keys exclude cross-origin URLs, query strings and hashes (SC1 covers `?token=`). `no-store` and Vary responses are not stored. There are no secrets.
- **Docs:** the implementation doc is present and follows the template.
- **Error taxonomy:** it applies to backend error ranges and is not touched here.

## Architecture note
- Signal 1, mixed responsibilities: `stem-cache.client.ts:93–242` holds the OPFS and IndexedDB adapter. Lines 263–414 hold the HTTP-policy orchestrator.
  - Keep now: they share one lifecycle, and both sides are tested through the fake `StemCacheStore` interface.
  - Proposal for the planner, only if 9c adds a purchased variant: extract `createBrowserStemCacheStore` to its own `.client` file. Policy would stay shared and the adapter would be swappable. The acceptance criterion would be that SC1–SC21 and SF1–SF6 pass unchanged.
- Signal 2, ownership and coupling: `app/data/studio-lab-demo.ts:10` now depends on a storage singleton.
  - Keep, because it is a single call site with a server fallback.
  - If 9c adds a second consumer, consider injecting the fetcher through the collection factory instead of a module-level singleton.
- This note is not something to fix in this round, and it does not mean the module was fully reviewed.

## Alternative approach (Studio audio pipeline)
- **Current:** OPFS bytes, an IndexedDB record as the commit point, validator revalidation, and an LRU budget of `min(256 MiB, 10% quota)`.
- **Alternative:** the Cache Storage API (`caches.open`) with `fetch` plus manual `If-None-Match`.
  - It needs less code and has native body streaming.
  - It gives no size or LRU control, no atomic commit point, and Safari is more aggressive about eviction.
- **Verdict:** keep the current approach. The budget and eviction guarantees and the integrity check (size and schema mismatch counts as a miss) are worth the extra code. The cost is findings 1 and 2, which are fixable in 9b.

## Score: 8/10