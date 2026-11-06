# A round 365: PERF-9a, persistent stem cache (v2) for the two /studio-lab public previews

## STOP: needs a B ruling on 2 task-text conflicts (L11). The code is complete and all other A rows pass
1. **A-CLAIMS final K11: two task clauses disagree.**
   - §2.1 says K11 equals planning (`covering-tests 10`). The final run gives **`K11 covering-tests 12`**.
   - K11's grep (`b-round-364/claims-365.sh` l.20) matches `source-fetch|stem-cache` in test paths. The two test files that §1.1 #6/#7 and K5 require (`stem-cache.test.ts`, `source-fetch.test.ts`) necessarily match it.
   - §2.1 A-TESTS uses the same grep for "the 2 new files plus the 10 covering files", which is 12.
   - Proposed ruling, B's call: K11 final = 12. Nothing was changed to work around it.
2. **Contract text conflict, from the code reviewer's I1.**
   - §1.2 l.127 says "A sweep error is ignored".
   - §1.2 l.143 lists `sweep` among the storage errors that turn the cache off.
   - The code (sketch v3, unchanged) follows l.127 and ruling D1: `sweepPromise … .catch(() => undefined)`. No SC row pins either reading. No code was changed.

The tree is at a consistent state. Every A row below was run on the final files, and the pristine sha256 values of the 5 code files are verified (`a-round-365/pristine/sha256.txt`). The earlier checkpoint is kept in `a-round-365/checkpoint-before-final.md`.

## Changed files (exactly the 8 in §1.1)
`git status`: 2 modified + 6 new. No other path.
- M `app/lib/arrangement/collection.ts`, from the sketch. The purchased `loadSource` calls `fetchAndDecodeSource(url, ctx, signal, fetchAudio)`; `PurchasedStemFetch = SourceFetch`. The default fetcher is unchanged. There is no `stem-cache` import.
- M `app/data/studio-lab-demo.ts`, from the sketch. The URL branch calls `fetchAndDecodeSource(url, ctx, signal, publicPreviewSourceFetch())`.
- New `app/lib/arrangement/source-fetch.ts`, `stem-cache.ts` and `stem-cache.client.ts`: sketch v3, applied verbatim with sha256 `d37406ae…40a8`, equal to `sketch-dispatched.sha256`. All the `sketch-review.md` rulings (1–8, D1, D2, I3) were already in v3. **A changed no source-module code.**
- New `app/lib/arrangement/__tests__/stem-cache.test.ts`: SC1–SC21, 23 `it`s. SC4 and SC14 each have a second row:
  - `SC4 evictions in the cached fetch: the least recently used other entry is deleted before the put`, so that M4 on the client delete loop is also red;
  - `SC14 on the server (no window) publicPreviewSourceFetch() is plainSourceFetch`, from reviewer L8.
- New `app/lib/arrangement/__tests__/source-fetch.test.ts`: SF1–SF6. SF6 is a source scan plus a tripwire: a `vi.mock` of `../stem-cache.client` routes `publicPreviewSourceFetch` per request to a demo cache that already holds `/a.mp3`.
- New `docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md`.
  - l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 365 PASS)`.
  - It has the 7 TEMPLATE `## ` headings in order.
  - The 5 new code and test files contain 0 Georgian characters.

## A rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS: identical to `claims-365-planning-output.txt` | `a-round-365/claims-pre.txt` |
| A-CLAIMS final | K1, K6–K8, K10, K12, K13 and K15 equal planning. K2 `df4e5b1 8`. K3/K4 equal the sketch output. K5 is all 1. K9 `v2-db-name-in-app 1`. K14 `doc236 1 pending 0`. **K11 = 12 → STOP 1** | `a-round-365/claims-final.txt` |
| A-TYPE | `npm run typecheck` rc 0 | `a-round-365/typecheck.log` |
| A-LINT | `npm run lint` rc 0; 205 warnings (≤ 205) | `a-round-365/lint.log` |
| A-BIOME | `npx biome check` on files 1–7: clean | `a-round-365/biome.log` |
| A-TESTS | 12 files, **194/194**: the 10 old files 165 (unchanged, nothing removed or edited, DL6/PC3 and the Georgian guard included) + stem-cache 23 + source-fetch 6 | `a-round-365/tests.log`, file list `a-round-365/covering-files.txt` |
| A-MUTANTS | 15 runs, each red on its named row (below) | `a-round-365/mutants/summary.txt`, `summary-m7-rerun.txt`, `mutant-*.log`; script `a-round-365/scripts/mutants.py` |
| A-SSR | **Partial.** `curl /studio-lab` returns 200 and the HTML contains `CZABA Studio`. The second half was **not checked by A**: the dev-server stdout/stderr goes to the orchestrator through a pipe (`/proc/3076/fd/1 → pipe:[19998]`), so A could not read the log for errors naming `stem-cache`. Not claimed | `a-round-365/ssr.html` |
| A-REVIEW | 3 code-reviewer passes; no unruled Medium+ on store files (details below) | this file |
| A-DOC | doc 236 as §1.4; `grep -rl 'C round [0-9]* pending' docs/implementation` → 0 | — |

### Mutants: all red on the named row
After every run the pristine sha256 values were re-verified.

| Mutant | Red row |
|---|---|
| M1 | SC6 |
| M2 | SC8 |
| M3 | SC5 (also SC10 and SC15) |
| M4a (pure loop) | SC4 ×2 |
| M4b (client delete loop) | SC4 client row |
| M5 | SC13 (also SC2) |
| M6 | SC12 (also SC19) |
| M8 | SC11 |
| M9 | SC17 |
| M10 | SC19 |
| M11 | SC20 |
| M12 | SC21 |
| M7 | SF6, through the scan |
| M7b, A-added: a re-export through `source-fetch.ts`, which the scan does not see | SF6, through the tripwire (`globalFetch` called 0 times) |
| M7c, A-added: a fetcher captured at import time through the re-export | SF6, through the tripwire |

## A's browser sanity (A evidence, not a C row)
Script: B's probe copied to `a-round-365/browser/sanity.mjs`, run on `:5173` at 1440×900 with a persistent profile under `a-round-365/browser/profile`. State: `a-browse.json`.
- **Run 1** (`sanity-1440x900-run1-coldserver.json`): the first "cold" open timed out after 120 s with no fetch. This was the unwarmed dev server (L38) and is environmental, so it is not claimed.
- **Run 2** (`sanity-1440x900-run2.json`), with the server warm:
  - cold: each URL got 200 and was stored. The records are `/middle-east.mp3` 4,054,080 B and `/videos/hero/hero-music.mp3` 3,610,677 B.
  - warm, HTTP cache on and off: each URL got 304 with 0 encoded body bytes.
  - mp3 blocked: "Demo collection ready", with no failed text.
  - after clearing: each URL got 200 with the full body and was stored again.
  - Every open also has the `audio`-initiator `/middle-east.mp3` entry (status 0, 0 B), as B-R364-DEMO-DOUBLE-FETCH describes.

## Code review (actual `code-reviewer` subagent, 3 passes)
- **Pass 1** (all 8 files): 0 Critical/High/Medium; L1–L8 Low, I1–I5 Info.
  - Fixed in owned test/doc files:
    - L1: SF6 behaviour half strengthened;
    - L7: weak-ETag wording in the doc;
    - L8: SC14 server branch;
    - SC10 now asserts `get` was called.
  - **L2: kept as a recorded exception to §1.3's "no blind timers".** SC20 uses `flushTasks()` (10× `setTimeout(0)`) only for the negative check "put not called while the sweep is held". Background writes are still awaited through `idle()`. M11 needs the flush to go red. This is stated in doc 236.
- **Pass 2** (the edits): one Medium on **evidence only**: the M7b log did not record its `collection.ts` half. Fixed by logging it. Lows fixed:
  - the holder is read per request, and M7c was added;
  - SC14 was split into its own `it`, so there is no mid-test unstub;
  - doc wording.
- **Pass 3**: all pass-2 findings resolved; 0 Critical/Medium. Low: assert the `collection.ts` needles in the mutant script. Fixed in the loop tooling only, and M7/M7b/M7c re-run red. The Info about doc 236's M7c wording was left, to avoid another store edit.

### For B: sketch-code Lows, not changed (L11: sketch code + task-ruled behaviour)
- **L3** `stem-cache.client.ts:321`: the abort/disabled check runs before sweep/list/evictions/put. An abort during those awaits still commits complete bytes; harmless. Fix: re-check `signal?.aborted || disabled` just before each `put`.
- **L4** `:127-132, 187-195, 146-155`: `requestToPromise` resolves on request success, not on transaction `complete`. A transaction abort after success leaves an orphan or a lost old file; this becomes a miss through the integrity check. Fix: await `tx.oncomplete`, reject on `onerror`/`onabort`.
- **L5** `:393-395, 400-402`: a 404/410 or unstorable-200 delete does not wait for a pending same-key background write, which may re-create the entry. This is the concurrent case of D2. Fix: `await writes.get(key)?.catch(() => undefined)` before the delete.
- **L6** `:354, 391, 398, 258`: `response.clone()` and the `cachedResponse` `headers.set` sit outside a `try`. Unreachable today. Fix: wrap them.
- **Info:**
  - I2: hit headers replace `init.headers` rather than merging;
  - I3: `get` reads the whole file before revalidating (a 9b perf candidate);
  - I4: 401/403/429/other 3xx on a hit keep the entry;
  - I5: an empty file is left if `createWritable` throws; the sweep cleans it.
- **Reviewer proposal for 9b:** serialize eviction planning per session. Two concurrent writes of different keys can exceed the budget by up to budget/4.

### Architecture note (for B/root; not acted on)
- `studio-lab-demo.ts` now depends on `stem-cache.client`. Keep it: the dependency is one-way and mirrors the existing `demo-synth.client` import.
- `stem-cache.client.ts` holds the store, the policy wrapper and the singleton. Keep it: this is a new owner, tested apart through `StemCacheStore`.
- Alternative for a later stage: the Cache Storage API, if L4 or the sweep cost proves significant in 9b.

## Known gaps
- **Browser-store integrity is not unit-tested.** In `stem-cache.client.ts` l.164–172 (missing file or size mismatch in the browser store's `get`), jsdom returns `null` from `createBrowserStemCacheStore()`. SC15 covers this only through the fake's contract and `isStemCacheRecord`. CS-COLD and CS-CLEAR are the real checks.
- A-SSR's dev-log half was not checked (above).
- The full suite, build and `npm run verify` were not run by A; per the speed rules, they are gate rows.

## Next C checks
- The §2.2 rows, unchanged: CLAIMS, SOURCE-SCOPE, UNIT, MUTANT-OWN, CS-COLD, CS-WARM, CS-AUDIO, CS-BLOCKED, CS-CLEAR, CS-LEGACY, ONE-FETCH, SSR, G365-AUTH and DOCS.
- Expect K11 = 12 per B's ruling on STOP 1.
- The UNIT name grep finds SC1–SC21 and SF1–SF6. SC4 and SC14 each appear twice.
- SSR: please check the dev-server log for `stem-cache` errors, which A could not read.
- Warm the dev server first (L38). A's run 1 hit a cold-server timeout.

## Scope completed
PERF-9a A-side work: the 8 files, tests, mutants, doc, and the checks above. A did not self-mark any backlog item complete. Whether the round passes depends on B's ruling on the 2 STOP items and on C.
