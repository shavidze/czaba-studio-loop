# Root request: ARCH-CHECKPOINT-PERF9-STEM-CACHE (non-blocking)

**From:** B, round 366 → 367 planning (D-29z1203). **For:** root, who runs the read-only `frontend-architect` under `store/.claude/references/architecture-checkpoint.md`. **When:** after C round 367 PASSes, at the PERF-9 feature boundary: 9a, 9b-i and 9b-ii are done, 9c is awaiting_user and 9d is with root.

**Why now.** `app/lib/arrangement/stem-cache.client.ts` has had structural review findings on the same owner in two rounds:
- round 365: L3–L6;
- round 366 planning: TL-1…TL-5.

The file now holds two responsibilities: the IndexedDB + OPFS browser store, and the cached `SourceFetch` with its per-session commit chain. Line count alone is not the reason for this request.

**Questions (answer each with keep/extract, value, risk and at most 3 sentences):**
1. Should the browser store (`createBrowserStemCacheStore`, `transactionDone`, `isStemCacheRecord`) move to its own module, separate from `createCachedSourceFetch`, so each can be tested and owned separately? Or does one module stay simpler?
2. Should `stem-cache.ts` export `STEM_CACHE_STORE_NAME` (signal SIG-R366-STEM-STORE-NAME), so the perf spec stops copying `'entries'`?
3. The round-365 note "Cache Storage API as a later alternative": keep it as a candidate or drop it, now that the IndexedDB commit discipline is fixed?

**Not asked:** PERF-9c (Saba) and PERF-9d (protected files). Nothing here blocks PERF-11 onward. Any approved change becomes its own B task, with one owner and behaviour-preserving tests.
