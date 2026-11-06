# CURRENT TASK — Round 365: PERF-9a. A persistent stem cache (v2) for the two /studio-lab public previews: OPFS + IndexedDB index, conditional revalidation, LRU

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-06, at the round 364 → 365 planning (`b-round-364.md`).

**Decisions** (`backlog.json` → `decisions_log_b`, v327 → v328):
- **D-29z1189:** round 364 = C PASS (`c-round-364.json`, browserVerified true), gate 364 published `df4e5b1`. PERF-10 is done. C-R363-01/02, C-R320-01 and A-R362-DOC-STALE-MERMAID are closed.
- **D-29z1190:** the new Lows (C-R364-01, A-R364-REVIEW-SELECTED-BEFORE, A-R364-REVIEW-MARKER-PRE-DRAG) go to `deferred_low_polish`. Their fix home is PERF-9b.
- **D-29z1191:** the PERF-9 harness decision (D-29z1152). The network stem path is the two same-origin public previews that `/studio-lab` already fetches.
- **D-29z1192:** PERF-9 is split into 9a/9b/9c/9d, with four recorded plan deviations (§0.3).
- **D-29z1193:** the scope of this round (§1).
- **D-29z1194:** the order after this round (§5).

**Why this round, now.** No Critical/High/Medium is open that the cloud can fix (the five open Mediums are tech-lead-manual, awaiting_user or open_root). PERF-9 is next in D-29z1188's order. REGRESSION is not due: `regression-last.json` = 2026-11-05, next due on or after 2026-11-08; today is 2026-11-06.

**Read first:**
- `lessons.md`. A reads 11, 12, 23, 26, 28, 30, 31 and 58. C also reads 22, 38, 56, 57, 59 and 60.
- This task, `b-round-364.md`, and the sketch `b-round-364/sketch.patch.txt` with its review `b-round-364/sketch-review.md`.
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `API_ERROR_HANDLING.md`, `ERROR_TAXONOMY.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`. Template: `.claude/prompts/new-service.md`. Plan source: `/home/runner/czaba-project/docs/technical/performance/perf-plan.md` (outside `store/`; the PERF-9 row).

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§7).

**Not applicable:** reference-first, product-designer, the YouTube request and the screen budget. This is a performance round and nothing on screen changes. Ableton conformance: not applicable (Live's own sample cache is not a UI reference for a web download cache).

## Baseline
- HEAD is `df4e5b1` (gate 364 published), with a clean tree [K1, K2]. Protected files: 11/11 OK [K6]. No dependency change and no `fake-indexeddb` [K8].
- `app/data/studio-lab-demo.ts` maps `demo-middle-east` → `/middle-east.mp3` and `demo-hero-music` → `/videos/hero/hero-music.mp3`. It fetches them with a raw `fetch` block [K3].
- `app/lib/arrangement/collection.ts` has the same fetch/arrayBuffer/decode/error block in `createPurchasedWorkspaceCollection`. Its default fetcher is `fetchAudio = (url, init) => fetch(url, init)` [K4].
- The legacy `app/lib/audio-cache.ts` (DB `czaba-audio-cache`) is imported only by the protected `app/contexts/StudioContext.tsx` [K7, K9].
- The dev server sends `ETag` and `Last-Modified` for `/middle-east.mp3` [K15].
- Covering test files: 10 [K11]. They include:
  - the Georgian-line guard over `studio-lab-demo.ts` and the `walked.length ≥ 60` floor [K12];
  - DL6 (demo: one fetch with omitted credentials) and PC3 (purchased: exactly `{ credentials: "omit", signal }`) [K13].
- The next free doc number is 236 [K14].
- **Root lanes (2026-11-05 parallel policy).** A HEAD that descends from `df4e5b1` only through `app/components/studio/export/*`, `app/components/studio/StudioToolbar.tsx` or `docs/` (COPY-PD, SRW-21-PLAN) is an allowed delta, not a STOP: K2's hash and K14's `doc-next` may differ. If a doc 236 already exists when A starts, A takes the next free number, names file 8 with it, and reports the number. K14's `doc236` check then applies to that number.

## 0. Premises and B's evidence

### 0.1 Why a cache (B probe, HEAD, dev server, Chromium, 1440×900)
`b-round-364/probe/reopen-1440.json`:
- Cold open: `/middle-east.mp3` 200 (gzip, 908,352 B encoded) and `/videos/hero/hero-music.mp3` 200 (3,610,677 B).
- Warm reopen in the same context: middle-east was **downloaded again in full** (200, 4,054,380 B), while hero-music revalidated (transfer 300 B).
- This is dev-server evidence. Production (`remix-serve`) may differ, and PERF-9b measures production.
- `/studio-lab` "ready" took 2759 ms cold and 2483 ms warm. Synth and decode dominate on localhost, so the plan's "ready ≤ 50 % of cold" belongs in PERF-9b under a fixed throttle (§0.3).

### 0.2 B's sketch (L23/L58), on a scratch `git archive df4e5b1` + `b-round-364/sketch.patch.txt`
- **Patch:** `b-round-364/sketch.patch.txt` (**v3**, after two tech-lead reviews in `b-round-364/sketch-review.md`: v1 → 4 Medium + 4 Low fixed, the 5xx Info adopted; the v1→v2 delta → 2 more Medium fixed); its sha256 is in `b-round-364/sketch-dispatched.sha256`. `git apply --check` passes on HEAD. The v1 patch and its probe outputs are kept under `b-round-364/sketch-v1/` and `probe/sketch-v1-cache-*.json`.
  - New: `source-fetch.ts`, `stem-cache.ts`, `stem-cache.client.ts`.
  - Changed: `collection.ts`, `studio-lab-demo.ts`.
- **Checks:**
  - `npm run typecheck` rc 0 (`b-round-364/sketch-typecheck.log`).
  - Biome on the 5 files: clean (`sketch-biome.log`).
  - The 10 covering files: 165/165 (`sketch-covering.log`).
  - **Full suite: 248 files, 3647/3647**, rc 0, on v1, v2 and v3 (`b-round-364/precheck-full.log` is the v3 run). The sketch has no new tests; A writes them.
- Claims on the sketch: `b-round-364/claims-365-sketch-output.txt`. K6 shows 10 there only because the scratch's `vite.config.ts` got a private `cacheDir` for B's second dev server (L38). That edit is not in the patch.
- **Browser probe of the sketch.** Script: `b-round-364/probe/sketch-cache.mjs`. It ran on a scratch dev server at :5174 with its own Vite cacheDir, in a persistent Chromium profile, using CDP only (no `route()`). Output: `probe/sketch-cache-1440x900.json` and `-1280x720.json`.
  - **cold:** each URL gets one `fetch` request, 200. After ready, the IndexedDB `czaba-stem-cache-v2` holds 2 records: `/middle-east.mp3` 4,054,080 B and `/videos/hero/hero-music.mp3` 3,610,677 B. OPFS `czaba-stem-cache-v2/` holds 2 files.
  - **warm, HTTP cache on, and warm with `Network.setCacheDisabled(true)`:** each URL is requested once with `If-None-Match` equal to the stored ETag. The response is 304 with `encodedBodySize` 0, the status is "Demo collection ready", and no "failed to load" text appears.
  - **mp3 blocked** (`Network.setBlockedURLs ['*.mp3']`): both fetches fail on the network, yet the page reaches "Demo collection ready" with no failed text. The audio came from the cache.
  - **after clearing** OPFS and IndexedDB: cold again (200, full body), and the entries are stored again.
  - In every open there is one extra `/middle-east.mp3` resource entry with `initiatorType` `audio` (status 0, 0 body bytes). The loader itself makes exactly one fetch per URL. This is B-R364-DEMO-DOUBLE-FETCH (info). Inference, not proven: the `<audio preload="metadata">` in `StudioNarrowScreen.tsx` [K10] is mounted at desktop width too. Not in scope.

### 0.3 PERF-9 split and plan deviations (D-29z1192)
| Stage | Scope | When |
|---|---|---|
| **9a (this round)** | Shared `source-fetch.ts`; the cache policy and its OPFS + IndexedDB store; wired into the two demo public previews | round 365 |
| 9b | Perf-harness rows on the production build: warm-reopen stem body bytes, request count, and cold vs warm stem-load time under a fixed CDP throttle; budgets; doc 168; the three deferred Lows | next |
| 9c | Purchased stems in the cache | `awaiting_user`, SABA-Q-PERF4-STUDIO-CACHE (with SRW-21-PLAN) |
| 9d | Retire the legacy `audio-cache.ts` and rewrite the `indexeddb-cache` skill doc | protected files → ROOT-REQ-PERF9D-LEGACY-CACHE |

Deviations from the plan row, each recorded:
1. "0 stem network bytes" becomes **"0 stem body bytes"**. One conditional request that gets a 304 is allowed, and it keeps a changed file fresh.
2. "ready ≤ 50 % of cold" is measured in 9b under a fixed throttle and gated on stem-load time.
3. `navigator.storage.persist()` is **not** called. Firefox shows a permission prompt, and best-effort storage is enough for a cache that can be downloaded again.
4. Keys are the same-origin path plus the ETag / Last-Modified validators, not a content hash. A hash needs the full download first and can never produce a 304.

### 0.4 Consults (STUDIO-PERFORMANCE `consults_round_365`)
- **performance-optimizer:**
  - test for the 304 before `!ok`;
  - skip 206, opaque, `no-store` and any `Vary` other than Accept-Encoding;
  - the IndexedDB record is the commit point;
  - 404/410 evicts;
  - budget `min(256 MB, 10 % quota)`; an entry larger than budget/4 is not stored;
  - QuotaExceeded → evict once, retry once, then turn the cache off;
  - no `persist()`.
- **tech-lead:**
  - extract `fetchAndDecodeSource` now;
  - the cache is a `SourceFetch`;
  - the purchased adapter keeps plain `fetch`, with a test;
  - an in-memory store fake;
  - a new DB name plus `schemaVersion`;
  - an AbortError passes through;
  - an SSR guard.

## 1. Scope (A)

### 1.1 Files (exactly 8)
| # | File | Change |
|---|---|---|
| 1 | `app/lib/arrangement/source-fetch.ts` | **New** (sketch). `SourceFetch`, `plainSourceFetch`, `fetchAndDecodeSource`. The error mapping is byte-for-byte the current one (same strings, same abort rethrow) |
| 2 | `app/lib/arrangement/stem-cache.ts` | **New**, pure (sketch): DB name, schema version, record type, `stemCacheKey`, `readStemCacheValidators`, `stemCacheConditionalHeaders`, `stemCacheBudgetBytes`, `selectStemCacheEvictions` |
| 3 | `app/lib/arrangement/stem-cache.client.ts` | **New** (sketch v2): `StemCacheStore` (get/put/touch/delete/list/sweep), `isStemCacheRecord`, `createBrowserStemCacheStore`, `createCachedSourceFetch` → `{ fetchSource, idle }`, `publicPreviewSourceFetch` |
| 4 | `app/lib/arrangement/collection.ts` | Purchased `loadSource` calls `fetchAndDecodeSource(url, ctx, signal, fetchAudio)`. `PurchasedStemFetch = SourceFetch`; the default fetcher is unchanged; **no import from `stem-cache*`** |
| 5 | `app/data/studio-lab-demo.ts` | The URL branch calls `fetchAndDecodeSource(url, ctx, signal, publicPreviewSourceFetch())`. Nothing else changes |
| 6 | `app/lib/arrangement/__tests__/stem-cache.test.ts` | **New**: rows SC1–SC21 (§1.3) |
| 7 | `app/lib/arrangement/__tests__/source-fetch.test.ts` | **New**: rows SF1–SF6 (§1.3) |
| 8 | `docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md` | **New** doc (§1.4) |

**Start:** from the store root, run `git apply ../tmp/studio-real-loop/b-round-364/sketch.patch.txt` (check its sha256 first). Then apply the rulings in `b-round-364/sketch-review.md`. No other file changes:
- no `app/components/**`, `ArrangementContext`, perf spec or budgets;
- no `package.json`, config or protected file;
- no legacy `audio-cache.ts`, no `StudioNarrowScreen.tsx`.

A change needed outside these 8 files is a STOP (L11), and so is a code-reviewer Medium+.

### 1.2 Behaviour contract (what the tests pin)
- **Key.**
  - Only a same-origin URL with no query and no hash is cached; the key is its pathname. Anything else goes to plain fetch.
  - **On a miss the request is exactly the original** `fetch(url, { credentials: 'omit', signal })`, with no added headers and no `cache` field. This keeps DL6 and PC3 valid.
- **Store on a miss** (in the background, never delaying the returned response). The response is stored only if all of these hold:
  - status 200;
  - it has an ETag or a Last-Modified;
  - `Cache-Control` has no `no-store`;
  - `Vary` has nothing other than `Accept-Encoding` or `Origin`;
  - the size is ≤ budget/4;
  - the signal was not aborted before the commit.

  The checks for `disabled`, an in-flight write of the same key, status 200 and the validators run **before** `clone()`. While one write of a key is pending, a second write of that key is skipped. The OPFS file is written first. The IndexedDB record is the commit point: if writing the record fails, the file is removed. The old file is removed after the record is written. The stored bytes are the decoded body (`arrayBuffer()` of the clone). A body read error inside the write returns quietly. Every write of a session awaits one shared `sweep()` promise, which runs once. It deletes invalid index records, plus any OPFS files that no record references and that are older than 60 s (from the base-36 time prefix of the file name). A sweep error is ignored.
- **Hit.** The request becomes `{ ...init, cache: 'no-store', headers: If-None-Match / If-Modified-Since }` from the stored validators.
  - **304:** returns a 200 `Response` whose body is the stored bytes, and updates `lastAccessedAt`.
  - **200:** returns the network response and replaces the entry.
  - **404 or 410:** deletes the entry and returns the response, so the loader maps it to `httpFailed`.
  - **Status ≥ 500:** returns the stored bytes.
  - **200 that cannot be stored** (`no-store`, a disallowed `Vary`, no validators): the entry is **deleted** and the response returned, so stale bytes are never served later.
  - **Network error, not aborted:** returns the stored bytes.
  - **Aborted:** rethrows the same error object.
- **Integrity.**
  - A record whose file is missing, or whose file size differs from the record, is a miss: the record is deleted and the full request is sent.
  - A record with another `schemaVersion` is a miss.
- **Budget and LRU.**
  - The budget is `min(256 MiB, floor(10 % of estimate().quota))`. An unknown quota gives budget 0, which means nothing is stored.
  - Before a store, the least recently used other entries are evicted until used + new ≤ budget.
  - `QuotaExceededError` on write: delete the oldest other entry (by `lastAccessedAt`) once and retry once. If that fails too, the cache is off for this page session and every later load uses plain fetch.
- **Failure isolation.** Any IndexedDB, OPFS or quota error never fails a load. A `get` error is a miss. A **storage** error during a write (`sweep`/`list`/`delete`/`put`) turns the cache off for the session; a body read error or an abort does not.
- **Environment.**
  - `createBrowserStemCacheStore()` returns `null` when `indexedDB`, `navigator.storage.getDirectory` or `FileSystemFileHandle.prototype.createWritable` is missing. That covers jsdom and older Safari.
  - On the server, `publicPreviewSourceFetch()` returns `plainSourceFetch`.
  - The DB/OPFS directory name is `czaba-stem-cache-v2`, never `czaba-audio-cache`.
- **Purchased.** It never uses the cache in 9a (D-29z1192).

### 1.3 Tests: names and what each must prove
Use an in-memory `StemCacheStore` fake and a `vi.fn` fetcher returning real `Response` objects. No new dependency.
- **SC1:** key rules (same-origin path; cross-origin, query and hash → `null`; a relative URL resolves against the origin).
- **SC2:** validators (ETag only, Last-Modified only, both, none → `null`; `no-store` → `null`; `Vary: Accept-Encoding` and `Origin` are OK; `Vary: Range` → `null`).
- **SC3:** budget (`undefined`, 0 or NaN → 0; 10 % of the quota; capped at 256 MiB).
- **SC4:** evictions (LRU order; none when it fits; `null` above budget/4; the same key is excluded from victims).
- **SC5:** miss:
  - the fetcher is called once with the **identical** init object contents (`toEqual({ credentials: 'omit', signal })`);
  - the returned body is byte-equal to the network body;
  - after the background write settles, one record holds the right size, validators and `schemaVersion`.
- **SC6:** hit with a 304:
  - the request has `cache: 'no-store'` and both validator headers;
  - the body is byte-equal to the stored bytes;
  - `lastAccessedAt` moves forward.
- **SC7:** hit with a 200 → the entry is replaced (new bytes and new ETag).
- **SC8:** hit with a network error:
  - not aborted → the stored bytes;
  - aborted → the **same** error object is rethrown.
- **SC9:** hit with a 404 and a 410 → the entry is deleted, and the status is returned unchanged.
- **SC10:** `get` rejects → plain request with the original init, and the load succeeds.
- **SC11:** quota → evict once and retry once (stored); a second quota error → later calls bypass the store (`get` is not called).
- **SC12:** signal aborted before the commit → nothing is stored.
- **SC13:** not stored: no validators, `no-store`, 206, and an entry larger than budget/4.
- **SC14:** `store: null` → plain fetch with the exact init. `createBrowserStemCacheStore()` returns `null` in jsdom.
- **SC15:** integrity → a size mismatch or another `schemaVersion` is a miss (test it through the fake's `get` contract and the pure `isStemCacheRecord`, or the exported equivalent).
- **SC16:** the DB name is `czaba-stem-cache-v2` and differs from `czaba-audio-cache`.
- **SC17:** two misses for the same key while the first write is pending → `put` is called once.
- **SC18:** hit with a 503 → the stored bytes; no write.
- **SC19:** a body read error or abort inside the background write → nothing is stored, and the **next** call still uses the store (`get` is called). A `put` that rejects with a non-quota error → later calls bypass the store.
- **SC20:** `sweep()` runs once per session. Two writes of **different** keys started together both wait for it: in the fake, `put` is never called before `sweep` resolves.
- **SC21:** hit, then a 200 with `no-store` (and, separately, with no validators) → the entry is deleted. A later network error returns the network error mapping, not the old bytes.

Tests wait for background writes with `await cached.idle()`, never with blind timers.
- **SF1–SF5:** `fetchAndDecodeSource`:
  - SF1: exact init, one call;
  - SF2: non-ok → `httpFailed(status)`, no decode;
  - SF3: a network reject → `networkFailed`; aborted → the same object;
  - SF4: body failure → `networkFailed`; aborted → the same object;
  - SF5: decode failure → `decodeFailed`.
- **SF6:** purchased never uses the cache:
  - a source scan finds no `stem-cache` import in `collection.ts`;
  - after the demo path has stored an entry for `/a.mp3` in a fake, a purchased `loadSource` for `/a.mp3` sends exactly `{ credentials: 'omit', signal }`.

**Mutants (A runs each against its new tests; logs in `a-round-365/mutants/`; each must turn the named row red):**

| Mutant | Change | Red row |
|---|---|---|
| M1 | 304 branch returns the network response | SC6 |
| M2 | network-error branch ignores `signal.aborted` | SC8 |
| M3 | miss request adds the conditional headers | SC5 |
| M4 | eviction loop removed | SC4 |
| M5 | store responses without validators | SC13 |
| M6 | abort check before commit removed | SC12 |
| M8 | quota retry deletes nothing (`oldest` lookup removed) | SC11 |
| M9 | in-flight `writes` check removed | SC17 |
| M10 | body read error sets `disabled` | SC19 |
| M11 | only the first writer awaits the sweep (the v2 `swept` flag) | SC20 |
| M12 | unstorable 200 on a hit keeps the entry | SC21 |
| M7 | `collection.ts` default fetcher = `publicPreviewSourceFetch()` | SF6 |

B wrote no unit tests on the sketch, so these mutants have **no B run** (`record — not run on sketch: tests are A's`). A's logs and C's re-run are the evidence.

### 1.4 Doc 236 (Georgian, technical terms in English)
- l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 365 PASS)` (L28).
- The 7 TEMPLATE `## ` headings, in order (L26).
- Content:
  - context (§0.1);
  - the approach and the rejected options (mock-api collection, SRW-21, content-hash keys, `persist()`);
  - a mermaid diagram of miss / hit-304 / network error;
  - the changed files;
  - Problem → Solution entries (gzip vs stored bytes, the weak ETag, abort, quota);
  - testing: SC/SF rows, mutants, B's probe and C's rows;
  - TODO: 9b, 9c (awaiting Saba), 9d (root), B-R364-DEMO-DOUBLE-FETCH.
- Cite only tests that exist (L26).

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-364/claims-365.sh` (loop root) | equals `b-round-364/claims-365-planning-output.txt` |
| A-CLAIMS final | same | K1, K6–K13 and K15 equal planning. K2 = `df4e5b1 8` (2 modified + 6 new). K3/K4 equal `b-round-364/claims-365-sketch-output.txt`. K5 is all `1`. K9 `v2-db-name-in-app` ≥ 1. K14 `doc236 1 pending 0` |
| A-TYPE / A-LINT | `npm run typecheck`; `npm run lint` | rc 0; lint warnings ≤ 205 |
| A-BIOME | `npx biome check` on files 1–7 | clean |
| A-TESTS | `npx vitest run` on the 2 new files plus the 10 covering files (list from `grep -rlE "studio-lab-demo\|createPurchasedWorkspaceCollection\|studioSourceLoadStrings\|source-fetch\|stem-cache" app perf e2e`, test folders only) | all pass; record counts. The old files' counts equal B's 165 plus nothing removed |
| A-MUTANTS | M1–M12 | each red on its named row; logs saved |
| A-SSR | `curl -s http://127.0.0.1:5173/studio-lab` | 200, and the HTML contains `CZABA Studio`; the dev log has no error that names `stem-cache` |
| A-REVIEW | `code-reviewer` on the 8 files | no unruled Medium+ (STOP). Any edit after the review goes back to the reviewer (L11) |
| A-DOC | doc 236 | as §1.4 |

A does not run the full suite or `npm run verify`; the gate does.

### 2.2 C rows
Warm the dev server in a browser first (L38). If `:5173` returns "504 Outdated Optimize Dep", restart it. Copy `b-round-364/probe/sketch-cache.mjs` into `c-round-365/` and point it at `http://127.0.0.1:5173/studio-lab`. Use a **fresh persistent profile per viewport**, CDP only, and no `context.route()`.

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-364/claims-365.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git diff --stat` | 2 modified (`collection.ts`, `studio-lab-demo.ts`) + 6 new (3 modules, 2 test files, doc 236; §1.1); no other path |
| UNIT | A-TESTS' command | all pass; SC1–SC21 and SF1–SF6 exist by name (grep) |
| MUTANT-OWN (C's own, on a scratch under `c-round-365/`, predicted first in `progress.json`) | One mutant not in M1–M12, e.g. a 304 that does not refresh `lastAccessedAt`, or a budget without the 256 MiB cap | red on its row, or reported with counts if green. Scratch deleted (L60) |
| CS-COLD (1440×900 and 1280×720) | Cold open | each URL has exactly one `fetch`-initiator request, status 200; after ready, `czaba-stem-cache-v2` has 2 records with sizes equal to each response's `decodedBodySize`; OPFS has 2 files of those sizes |
| CS-WARM (both viewports) | Reopen twice: HTTP cache on, then `Network.setCacheDisabled(true)` | each URL is requested once, with `If-None-Match` = stored ETag; `responseStatus` 304, `encodedBodySize` 0; "Demo collection ready"; no "failed to load" |
| CS-AUDIO (1440×900) | On the warm open, add "Middle East — public preview" to a track (Enter on the library item), then play 2 s | the clip's length equals the cold open's; the playhead advances; a level indicator C names shows signal. The cached file plays real audio |
| CS-BLOCKED (both viewports) | `Network.setBlockedURLs(['*.mp3'])`, reopen | "Demo collection ready", no failed text, both previews listed as loaded |
| CS-CLEAR (1440×900) | Remove the OPFS directory and delete the DB, reopen | 200 with the full body, and the entries are stored again |
| CS-LEGACY | `indexedDB.databases()` after the opens | no `czaba-audio-cache` was created by `/studio-lab` |
| ONE-FETCH | every scenario above | at most one `fetch`-initiator request per URL per open; the `audio`-initiator entry is recorded with its values (B-R364-DEMO-DOUBLE-FETCH) |
| SSR | A-SSR | as A |
| G365-AUTH (both viewports) | copy `c-round-364/auth.mjs` | `/studio-lab` opens anonymously; `/studio/<id>` asks for sign-in and has 0 audio sources; `/api/studio-token` without credentials → 401 and no token. A fake-bearer 500 that fails closed goes under `blocked` |
| DOCS | doc 236 | l.4 byte-exact; 7 `## ` headings in TEMPLATE order; every named test exists (L26); `grep -rl 'C round [0-9]* pending' docs/implementation` → 0 |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified** is false if CS-COLD, CS-WARM, CS-AUDIO, CS-BLOCKED or G365-AUTH does not run. None of them needs the backend.

**Write all L57 fields** in `c-round-365.json` and run `python3 -I tools/l57-check.py c-round-365.json c-round-365/l57-check.txt` until it exits 0.
- `assertsSpecified`: SC1–SC21, SF1–SF6.
- `mutantsRecorded`: M1–M12 plus C's own.
- `mutantRedOnSketch`: `null`. Reason: "B wrote no unit tests on the sketch; A's mutant logs (`a-round-365/mutants/`) and C's re-run are the evidence".
- `gateChecksNamed`: full vitest, typecheck, biome.
- `gateChecksRunOnSketch`: `b-round-364/precheck-full.log`, `b-round-364/sketch-typecheck.log`, `b-round-364/sketch-biome.log`.
- `chainHeadGateRunGreen`: gate 364.
- `affectedChecksNamed`: the 10 covering files, the 2 new test files, the browser cache probe.
- `affectedChecksRunOnSketch`: `b-round-364/sketch-covering.log`, `b-round-364/probe/sketch-cache-1440x900.json`, `b-round-364/probe/sketch-cache-1280x720.json`.

## 3. Neighbouring behaviour that could break
- **Library load states** (loading → ready / failed text, per-source failed state): the covering files [K11] and the CS rows guard them.
- **Error texts:**
  - The demo-loader and purchased-adapter rows in the covering files [K11], including DL6 and PC3 [K13], must pass unchanged.
  - The Georgian-line guard over `studio-lab-demo.ts` [K12]: the new files must contain no Georgian text.
- **SSR:** `/studio-lab` must render on the server (A-SSR).
- **Synth sources, video, peaks and export:** these consume decoded `AudioBuffer`s, which are unchanged. CS-AUDIO is the end-to-end check.
- **Purchased path:** its behaviour is unchanged (PC rows + SF6). Purchase protection is guarded by G365-AUTH.
- **Storage growth:** the budget plus the 2 entries (~7.7 MB) are inside the default quota (B probe: `estimate().quota` ≈ 1 GB).

## 4. STOP conditions (A)
- The sketch patch does not apply, or its sha256 differs.
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1.
- Any change needed outside the 8 files.
- An existing covering test fails, or must be edited.
- A mutant stays green.
- A code-reviewer Medium+.
- A ruling in `sketch-review.md` that A cannot apply as written.

## 5. Routed, not in scope
- **PERF-9b** (next): production perf rows and budgets, the throttled ratio, doc 168, and the three deferred Lows (C-R364-01, A-R364-REVIEW-SELECTED-BEFORE, A-R364-REVIEW-MARKER-PRE-DRAG).
- **PERF-9c:** `awaiting_user` (SABA-Q-PERF4-STUDIO-CACHE).
- **PERF-9d:** ROOT-REQ-PERF9D-LEGACY-CACHE, protected files:
  - `audio-cache.ts` / `StudioContext.tsx` retirement with the SRW-21 mount;
  - delete the old `czaba-audio-cache` DB once;
  - rewrite `.claude/skills/indexeddb-cache/SKILL.md`.
- **B-R364-DEMO-DOUBLE-FETCH:** info; the `audio` initiator is recorded.
- **Architecture:** PERF-10 closed a feature boundary. The open request `b-round-362/root-request-arch-checkpoint.md` is now actionable for root; this round touches neither `ArrangementContext` nor `StudioWorkspace`.
- **D-29z1194, next:** PERF-9b → REGRESSION at any planning on or after 2026-11-08 → PERF-11 → PERF-12…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 entries (skip rule). RETRO at 368.

## 6. Deliverables
- **A:** `a-round-365.md` with every §2.1 row, evidence under `a-round-365/`, mutant logs and the code-reviewer result.
- **C:** `c-round-365.md`, `c-round-365.json` (all L57 fields), evidence under `c-round-365/`.

## 7. Claims
Run `bash b-round-364/claims-365.sh` from the loop root. Set `CLAIMS_STORE` to point it at a scratch.

| Output | File |
|---|---|
| Planning, on `df4e5b1` | `b-round-364/claims-365-planning-output.txt` |
| Sketch (scratch + patch) | `b-round-364/claims-365-sketch-output.txt` |

| Tag | What it pins |
|---|---|
| K1 | gate 364 status and commit |
| K2 | HEAD and the status entry count |
| K3 | demo: the two URL map lines, raw `fetch` block, `fetchAndDecodeSource` call, cache import |
| K4 | collection: raw fetch block, `fetchAndDecodeSource` call, `stem-cache` import (must stay 0), default fetcher |
| K5 | the 3 new modules and the 2 new test files exist |
| K6 | protected files OK |
| K7 | importers of the legacy `audio-cache` |
| K8 | `package.json` / lock sha; no `fake-indexeddb` |
| K9 | legacy DB name; the v2 name in `app/` |
| K10 | `StudioNarrowScreen.tsx` preview URL and `preload="metadata"` |
| K11 | covering test file count |
| K12 | Georgian-line guard over the demo file; walk floor |
| K13 | DL6 and PC3 test names |
| K14 | last quarter-IV doc; doc 236 exists; `pending` docs |
| K15 | dev server: `/middle-east.mp3` 200 with ETag and Last-Modified |
| K16 | cited `b-round-364/` artifacts missing (empty at hand-off; includes `sketch-review.md`) |

L29 check for C: every backticked `store/` fact in the Baseline and §0 carries a `[K#]`; an untagged one is a B-spec Low.
