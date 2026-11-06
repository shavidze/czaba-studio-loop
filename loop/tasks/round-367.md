# CURRENT TASK — Round 367: PERF-9b-ii. Stem-cache commit discipline (SYS-R365-STEM-CACHE-HARDENING), doc 236 Completed

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-06, at the round 366 → 367 planning (`b-round-366.md`).

**Decisions** (`backlog.json` → `decisions_log_b`, v329 → v330):
- **D-29z1201:** round 366 = C PASS (`c-round-366.json`: browserVerified true, realVerified true). Gate 366 published `d53d113`, the baseline here. PERF-9b-i is done.
- **D-29z1202:** the 10 A-R366-REVIEW perf-spec Lows go to `deferred_low_polish`. The STEM_CACHE_STORE_NAME note becomes signal SIG-R366-STEM-STORE-NAME.
- **D-29z1203:** the scope of this round (§1), B's pre-check (§0) and the tech-lead rulings (`b-round-366/sketch-review.md`).
- **D-29z1204:** observations recorded, not scheduled (§5).
- **D-29z1205:** the order after this round (§5).

**Why this round, now.**
- No Critical or High is open. The five open Mediums are tech-lead-manual, awaiting_user or open_root, and none blocks this round.
- This round is SYS-R365-STEM-CACHE-HARDENING, queued right after PERF-9b-i (D-29z1196, D-29z1200). It closes A-R365-REVIEW-L3, -L4, -L5, -L6 and C-R365-OBS-INTEGRITY together: one file, one root cause (storage write and commit discipline).
- REGRESSION is not due: `regression-last.json` = 2026-11-05, so the next is due on or after 2026-11-08, and today is 2026-11-06. RETRO is at 368.
- This is the final stage of PERF-9b. PERF-9c waits on Saba and PERF-9d on root.

**Read first:**
- `lessons.md`. A reads 11, 12, 23, 26, 28 and 58. C also reads 22, 29, 38, 56, 57, 59 and 60.
- This task, `b-round-366.md`, the sketch `b-round-366/sketch.patch.txt` and `b-round-366/sketch-review.md`. The review rules every tech-lead finding (TL-1…TL-8) and gives the reasons for the smallest honest behaviour.
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md` (the source-loading layer), `ERROR_TAXONOMY.md` (no new codes: storage errors stay silent fallbacks), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§7).

**Not applicable:** reference-first, product-designer, the YouTube request and the screen budget. This is storage hardening behind the demo preview loader: nothing on screen changes and no new user action exists. Ableton conformance: not applicable.

## Baseline
- HEAD is `d53d113` (gate 366 published) with a clean tree [K1, K2]. Protected files: 11/11 OK [K12]. No dependency change [K14].
- `app/lib/arrangement/stem-cache.client.ts` at HEAD [K3–K9]:
  - It has 8 `requestToPromise(` calls and 4 `'readwrite'` transactions; their writes resolve on request success [K3].
  - The only abort/disabled check sits before the sweep [K4].
  - The two hit-path deletes are awaited directly [K5].
  - `response.clone()` and `headers.set('content-type', …)` are not guarded [K6].
  - The sweep runs once per session, and there is no commit chain [K8].
  - `get()` has the size-integrity branch; `put()` removes the previous file after the record write [K9].
- `app/lib/arrangement/__tests__/stem-cache.test.ts` at HEAD [K10, K11]:
  - 23 `SC` rows in 2 `describe` blocks [K10];
  - 23 tests in 96 ms in gate 366's verify log, so timeout headroom is ample (L31) [K11].
- The demo previews are wired through `publicPreviewSourceFetch()`. The IndexedDB store is `entries` in the database `czaba-stem-cache-v2` [K15]. `idle()` has no caller in `app/**` outside tests [K17].
- Doc 236 l.4 is `In Progress (stage 2 of 3; C round 366 PASS)`. It has 7 `## ` headings. The only other `In Progress (stage` doc is 232, tied to the open PERF-DRAG-PREVIEW stage [K13].
- **Root lanes (2026-11-05 parallel policy).** A HEAD that descends from `d53d113` only through other paths is an allowed delta, not a STOP, and K2's hash may then differ. "Other paths" means `app/components/studio/export/*`, `app/components/studio/StudioToolbar.tsx`, or `docs/` other than doc 236 (COPY-PD, SRW-21-PLAN).

## 0. Premises and B's evidence

### 0.1 Round 366 (L10)
- No STOP. A changed B's sketch for two code-reviewer Mediums that B had not ruled; this was allowed by task 366 §1.1, and C passed the final files. It is recorded as RETRO 368 input B-R366-SKETCH-MEDIUMS-UNRULED (B origin, L58). No action is needed in this round.

### 0.2 B's sketch (L58), on the scratch (`git archive d53d113`) + `b-round-366/sketch.patch.txt`
- **sha256:** `66ce5455be6075f75ed62ea326b28537c30d248674acc0b4438e88a4c7c84e20` (`b-round-366/sketch-dispatched.sha256`). `git apply --check` is OK on HEAD.
- **Runs:**
  - covering file 31/31 (`b-round-366/sketch-covering.log`);
  - `npm run typecheck` rc 0 (`sketch-typecheck.log`);
  - Biome rc 0 on both files (`sketch-biome.log`);
  - **full suite on the sketch: 250 files, 3684 tests, rc 0** (`b-round-366/precheck-full.log`, L23).
- **Mutants:** 13, each red on its own row (`b-round-366/sketch/mutant-<id>.log` and `.diff.txt`; summary `sketch/mutant-summary.txt`).
- **History:** v1 had SC22–SC27 and a regex source-scan SC23, and all 9 of its mutants were red. tech-lead still found 2 High and 3 Medium in it. v2 fixes or rules every finding (`sketch-review.md`), so the mutants alone did not prove v1 correct (RETRO input B-R366-V1-SKETCH-HIGHS).

### 0.3 B's browser pre-check (production builds, remix-serve)
Probe: `b-round-366/probe/stem-integrity-probe.mjs <base> <w>x<h> <out.json> 1`. It makes 4 opens in one context:
1. **cold**;
2. **truncate**: the OPFS file of `/middle-east.mp3` is cut to 1000 B;
3. **delete-file**: the OPFS file of `/videos/hero/hero-music.mp3` is removed;
4. **stale-etag**: the stored ETag of `/middle-east.mp3` is set to `"b366-stale"`.

Each reopen follows `Network.clearBrowserCache`. Each open records the mp3 requests with their If-None-Match, the IndexedDB records, the OPFS files, then adds "Middle East — public preview" with Enter and plays 2.2 s. Summary: `b-round-366/probe/probe-summary.txt`.

| Build | Result |
|---|---|
| HEAD `d53d113`, 1440×900 and 1280×720 (`probe/head-*.json`) | Every phase is "Demo collection ready" and plays (playhead about 00:02.77, analyser peak 0.31, 1 source start). **truncate:** middle-east 200 without If-None-Match, re-stored under a new file name; hero 304. **delete-file:** hero 200, re-stored. **stale-etag:** middle-east sent `If-None-Match: "b366-stale"` and got 200, re-stored with the server ETag. After every phase: 2 records, 2 files, sizes equal. |
| Sketch, both viewports (`probe/sketch-*.json`) | Identical. |
| Mutant `nosize` (size check removed, `probe/mutant-nosize.diff.txt`) | **truncate is red:** 304, "1 sound in the demo collection failed to load", not re-stored, no playback. |
| Mutant `nohitrestore` (hit + 200 not written, `probe/mutant-nohitrestore.diff.txt`) | **stale-etag is red:** the record keeps `"b366-stale"`. |

So the INTEGRITY and VALIDATOR browser rows (§2.2) are **coverage rows**: HEAD already behaves correctly (C-R365-OBS-INTEGRITY was a coverage gap, not a bug). Each row is proven able to fail by a named mutant build. The harness host answers a mismatched If-None-Match with 200 even with a future If-Modified-Since (curl, `b-round-366.md` §3).

### 0.4 Consults
- **tech-lead** (read-only) reviewed sketch v1. All findings are ruled in `b-round-366/sketch-review.md`; the gist is in `backlog.json` STUDIO-PERFORMANCE `consults_round_367`.
- performance-optimizer and product-designer were not consulted: no perf budget changes and nothing on screen changes.

## 1. Scope (A)

### 1.1 Files (exactly 3)
| File | Change |
|---|---|
| `app/lib/arrangement/stem-cache.client.ts` | B's sketch, verbatim |
| `app/lib/arrangement/__tests__/stem-cache.test.ts` | B's sketch, verbatim: new rows SC22–SC29 in a third `describe`, the fake browser storage helper and the `transactionDone` import. **No existing row SC1–SC21 is edited or removed.** |
| `docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md` | stage 3 (§1.3) |

Apply `b-round-366/sketch.patch.txt` with `git apply`, then check that `git diff -- app` equals the patch (`cmp`).

A may change the sketch only to fix a code-reviewer finding that `sketch-review.md` does not already rule. Such a change is a STOP if it changes a ruled behaviour (L11). Otherwise A re-runs every mutant whose row it touched, and sends the files back to the reviewer.

No other `app/**`, `perf/**`, config, `package.json` or protected-file change. `stem-cache.ts` and `source-fetch.ts` stay as they are [K7].

### 1.2 Behaviour contract (what C checks)
1. **Writes resolve on commit (L4).**
   - Every readwrite IndexedDB transaction in the browser store (record write, record delete, `touch`, and the sweep's invalid-record delete) resolves through the new exported `transactionDone(transaction)`. It resolves on `complete` and rejects on `abort` with `transaction.error`, or with an `AbortError` DOMException when that is null.
   - An `error` event alone does not settle it (TL-1: the error event fires before `transaction.error` is set).
   - `put` removes the previous OPFS file only after the record transaction completes. An aborted record write removes the new file and keeps the previous record and file.
   - Rows: SC22, SC23.
2. **Abort and disable are re-checked (L3).** A write cancelled by its signal, or by the store turning off, returns:
   - when it starts on the commit chain;
   - after the sweep/list/quota awaits (no victim is deleted);
   - before each `put`, including the quota retry.

   Row: SC24.
3. **Hit-path deletes (L5).** On a hit, a 404/410 or unstorable 200 response **returns at once**. The delete is queued after any pending same-key write and on the commit chain, so a delete never loses to a re-creating write. `idle()` waits for queued deletes and the chain. Rows: SC25, SC29; SC9 and SC21 stay green.
4. **Guards (L6).** A throwing `response.clone()` stores nothing, returns the response unchanged and keeps the store on. A stored content type that `Headers.set` rejects is served with no `content-type`. Row: SC26.
5. **Per-session serialisation (reviewer proposal, ruled yes).** Each write's sweep → list → evict → put runs after the previous one, so two keys started together end within the budget. Row: SC27. Cross-tab overshoot stays possible; doc TODO.
6. **Browser-store integrity (C-R365-OBS-INTEGRITY, unit half).** In the browser store (fake IndexedDB + OPFS), a size mismatch and a missing file are each a miss that deletes the record and the file. Row: SC28. The browser half is the INTEGRITY row (§2.2).
7. **Unchanged:** keys, validators, budget and eviction policy, the 304/5xx/network-error behaviour, the decode path and the purchased adapter (no cache). SC1–SC21 stay green unedited.

**Accepted trade-offs** (ruled in `sketch-review.md`; C does not fail them):
- A store call that never settles stops caching for the session but never blocks a load (TL-3).
- A same-key fetch issued before `idle()`, right after a hit 404, may still see the old entry.

### 1.3 Doc 236 (Georgian, technical terms in English)
- l.4 is exactly `**სტატუსი:** Completed (C round 367 PASS)` (L28, final stage; no hash and no "pending").
- l.5 adds stage 3 to the file list.
- Stage-3 content goes under the existing headings:
  - **კონტექსტი:** the 5 Lows and the systemic task.
  - **მიდგომა:** each contract item in §1.2, plus the serialisation ruling.
  - **არქიტექტურა:** a short Mermaid or text sequence of the commit chain.
  - **შეცვლილი ფაილები:** the files.
  - **პრობლემები და გადაწყვეტები:** TL-1 and TL-2 as Problem → Solution; TL-3 and the stale-before-idle trade-off as accepted risks.
  - **ტესტირება:** SC22–SC29 by id, the mutant ids, and B's and C's browser rows.
  - **TODO:** PERF-9c (Saba), PERF-9d (root), ROOT-Q-R365-VERCEL-STATIC-HEADERS, PERF-CAND-STEM-BACKGROUND-REVALIDATE, the cross-tab budget, and ARCH-CHECKPOINT-PERF9-STEM-CACHE.
- Every test the doc names exists in the test file (L26). The 7 TEMPLATE headings stay in order.
- **Multi-stage clause (L28):** stages 1 and 2 are in this same doc, so no other doc's l.4 is granted. Doc 232 stays as it is; it is tied to PERF-DRAG-PREVIEW [K13].

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-366/claims-367.sh` | equals `b-round-366/claims-367-planning-output.txt` |
| A-CLAIMS final | same | K1, K11, K12, K14, K15 equal planning. K2 = `d53d113 3`. K3–K6, K8–K10 and K17 equal `b-round-366/claims-367-sketch-output.txt`. K7 all 0. K13: l.4 = §1.3, `pending 0`, stage-hits = `232-perf-drag-preview.md` only, headings ≥ 7. K16 empty |
| A-TESTS | `npx vitest run app/lib/arrangement/__tests__/stem-cache.test.ts app/lib/arrangement/__tests__/source-fetch.test.ts`. These are the 2 files importing `stem-cache.client` or its fetch layer; to confirm, run `grep -rl "stem-cache.client" app --include=*.test.ts --include=*.test.tsx`, which gives only stem-cache and source-fetch at HEAD | all green; stem-cache 31/31 |
| A-TYPE / A-LINT | `npm run typecheck`; `npm run lint` | rc 0; lint warnings ≤ 205 (gate 366 verify log: 205) |
| A-MUTANTS | the 13 diffs in `b-round-366/sketch/mutant-*.diff.txt`, each applied to `stem-cache.client.ts`, then the stem-cache test file | each red on the row in `sketch/mutant-summary.txt`. Restore from a copy under `a-round-367/` and prove it with `cmp` (L60). Logs under `a-round-367/mutants/` |
| A-REVIEW | `code-reviewer` on the 3 files | no unruled Medium+ (STOP). Any edit after the review goes back to the reviewer (L11) |
| A-DOC | doc 236 | as §1.3; `grep -rl 'C round [0-9]* pending' docs/implementation` → 0 |

A does not run the full suite, `npm run verify`, perf specs or browser probes; the gate and C do.

### 2.2 C rows
Order:
1. CLAIMS, SOURCE-SCOPE, UNIT and MUTANT-OWN first.
2. Then `npm run build` in the store and start a production server (`PORT=5189 npx remix-serve build/server/index.js`, output to `c-round-367/serve.log`).
3. Warm up with one untimed browser load (L38).
4. Then INTEGRITY, VALIDATOR, PLAYBACK-EXPORT and G367-AUTH.
5. Stop the server **by its PID or port**. Never use `pkill -f` with a pattern that also matches your own command line: B's shell killed itself that way at planning.

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-366/claims-367.sh` | equals A's final (§2.1) |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git diff --stat` | exactly the 3 files of §1.1. `git diff -- app` equals the sketch patch, or A's reviewed deltas listed in `a-round-367.md` |
| UNIT | the stem-cache test file | 31/31; SC1–SC21 unedited (`git diff` of the test file adds lines only, apart from the import block) |
| MUTANT-OWN (C's own, on a scratch copy, predicted first in `c-round-367/progress.json`) | one mutant not in the 13. Examples: `touch` puts outside `onsuccess`; the quota-retry `cancelled()` check removed (a row that aborts during the retry delete); `deleteAfterPendingWrite` skipping the pending-write wait | red on the predicted row, or reported with counts if green. Scratch deleted (L60) |
| INTEGRITY (1440×900 and 1280×720) | `node b-round-366/probe/stem-integrity-probe.mjs http://127.0.0.1:5189 <w>x<h> c-round-367/integrity-<w>x<h>.json 1`; summarise with `python3 -I b-round-366/probe/summarize.py <json>` | Every phase: "Demo collection ready", 0 page errors, the playhead past 00:02.5 after 2.2 s, `starts` = 1, and the max of the 5 analyser samples > 0.01 (B: 0.31). **truncate:** middle-east status 200 (not 304); the record is re-stored under a new file name with size 4,054,080. **delete-file:** hero status 200 (not 304); re-stored under a new file name with size 3,610,677. The other stem in each phase is 304. After each phase: 2 records, 2 OPFS files, sizes equal (`waitedMs` not null). **Record only (wallclock, L37):** If-None-Match and body bytes on the miss requests. B's HEAD cold phase showed an If-None-Match from HTTP-cache priming by the aborted 206 (B-R364-DEMO-DOUBLE-FETCH). If it appears on a miss phase, note it there; it is not a FAIL. |
| VALIDATOR (same runs) | the stale-etag phase of the same JSON | middle-east request carries `If-None-Match: "b366-stale"` → 200, and the stored record's ETag equals the response ETag (not `"b366-stale"`); hero 304; plays |
| PLAYBACK-EXPORT (1440×900) | **record — not run on sketch: B ran playback in every phase, not export.** On a fresh context: cold open, add Middle East, Export WAV (copy `c-round-366/audio.mjs`); then truncate its OPFS file as the probe does, reopen, export again | record both WAV headers and sha256; a difference is reported as an observation with both files kept, not a FAIL |
| G367-AUTH (both viewports) | copy `c-round-366/auth.mjs` | `/studio-lab` opens anonymously; `/studio/<id>` asks for sign-in with 0 audio sources; `/api/studio-token` without credentials → 401 and no token. A fake-bearer 500 that fails closed goes under `blocked` |
| DOCS | doc 236 | l.4 byte-exact; the 7 `## ` headings in TEMPLATE order; every SC id and mutant id named in the doc exists (L26); `grep -rl 'C round [0-9]* pending' docs/implementation` → 0 |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified** is false if INTEGRITY (either viewport), VALIDATOR or G367-AUTH does not run. None of them needs the backend.

**Write all L57 fields** in `c-round-367.json` and run `python3 -I tools/l57-check.py c-round-367.json c-round-367/l57-check.txt` until it exits 0.
- `assertsSpecified`: SC22–SC29; INTEGRITY (per phase: ready, playback liveness, miss status 200 and re-store with a new file name and full size, record/file consistency); VALIDATOR (`If-None-Match: "b366-stale"` → 200, record ETag = response ETag).
- `mutantsRecorded`: the 13 sketch mutants (A logs), the 2 probe mutant builds (B), plus C's own.
- `mutantRedOnSketch`: `b-round-366/sketch/mutant-summary.txt`, `b-round-366/probe/mutant-nosize-1440x900.json`, `b-round-366/probe/mutant-nohitrestore-1440x900.json`.
- `gateChecksNamed`: full vitest, typecheck, biome.
- `gateChecksRunOnSketch`: `b-round-366/precheck-full.log`, `b-round-366/sketch-typecheck.log`, `b-round-366/sketch-biome.log`.
- `chainHeadGateRunGreen`: gate 366.
- `affectedChecksNamed`: the stem-cache test file; the integrity probe at both viewports.
- `affectedChecksRunOnSketch`: `b-round-366/sketch-covering.log`, `b-round-366/probe/sketch-1440x900.json`, `b-round-366/probe/sketch-1280x720.json`.

## 3. Neighbouring behaviour that could break
- **Demo loading:** every preview load goes through `cachedFetch`. A regression shows as "failed to load" or silence; INTEGRITY plays in every phase.
- **The round-366 perf spec** (`perf/studio-lab-stem-cache.perf.spec.ts`) measures cold, warm, blocked and stored entries on this code. Writes are now serialised and resolve on commit, so `cold.entries-stored` could settle later. The spec waits for 2 consistent entries, and B's probe saw `waitedMs` 0 on the sketch. It is a gate/root row (`npm run test:perf`); C does not run it.
- **SC9 and SC21** now depend on `idle()` waiting for queued deletes (SC29 guards it).
- **Purchased adapter:** shares `source-fetch.ts`, never the cache [K15]. Unchanged.
- **Purchase protection:** unchanged; G367-AUTH guards it.

## 4. STOP conditions (A)
- The sketch patch does not apply, or its sha256 differs.
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1.
- Any change needed outside the 3 files.
- A mutant stays green on its row.
- A covering test fails or exceeds 50 % of its timeout (L11).
- A code-reviewer Medium+ that `sketch-review.md` does not rule, or whose fix would change a ruled behaviour.

## 5. Routed, not in scope
- **A-R366-REVIEW-*** (10 perf-spec Lows): `deferred_low_polish` (D-29z1202), for the next owner of the stem-cache perf spec. **SIG-R366-STEM-STORE-NAME:** a signal.
- **ARCH-CHECKPOINT-PERF9-STEM-CACHE:** request to root (`b-round-366/root-request-arch-checkpoint.md`), non-blocking, after this round passes.
- **D-29z1204 observations:**
  - B-R364-DEMO-DOUBLE-FETCH: the 206 Media request shows at 1440 too, and an HTTP-cache priming side effect is seen in B's HEAD probe.
  - The exported WAV peak of 1.0 goes under C-R178-EXPORT-CLIPS-AT-0DB, severity to confirm (T12-ADVANCED T12.20 or Saba).
- **PERF-9c:** `awaiting_user`. **PERF-9d:** ROOT-REQ-PERF9D-LEGACY-CACHE. **ROOT-Q-R365-VERCEL-STATIC-HEADERS** and **PERF-CAND-STEM-BACKGROUND-REVALIDATE:** recorded.
- **D-29z1205, next:** RETRO 368 (window 353–367) → REGRESSION at the first planning on or after 2026-11-08 that is not the RETRO round → PERF-11 → PERF-12…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 entries (skip rule).

## 6. Deliverables
- **A:** `a-round-367.md` with every §2.1 row, evidence under `a-round-367/` (test log, mutant logs, claims outputs) and the code-reviewer result.
- **C:** `c-round-367.md` and `c-round-367.json` (all L57 fields), evidence under `c-round-367/`.

## 7. Claims
Run `bash b-round-366/claims-367.sh` from anywhere. Set `CLAIMS_STORE` to point it at a scratch.

| Output | File |
|---|---|
| Planning, on `d53d113` | `b-round-366/claims-367-planning-output.txt` |
| Sketch (scratch + patch, before the doc change) | `b-round-366/claims-367-sketch-output.txt` |

| Tag | What it pins |
|---|---|
| K1 | gate 366 status and commit |
| K2 | HEAD and the status entry count |
| K3 | `requestToPromise(` call count, `'readwrite'` count, `transactionDone(` count in the client |
| K4 | the HEAD abort check before the sweep; the count of `cancelled()` |
| K5 | the awaited hit-path deletes (HEAD 2, sketch 0); the `writes.get` waits (0 in both) |
| K6 | `response.clone()` and the content-type `headers.set` |
| K7 | no change outside the 3 files (app, perf, other docs, `stem-cache.ts`, `source-fetch.ts`) |
| K8 | the sweep-once line; the `commitChain` count |
| K9 | the integrity size check in `get()`; the previous-file removal in `put()` |
| K10 | `SC` row count, new rows SC22–SC29, `describe` count |
| K11 | gate 366 verify-log time of the stem-cache test file (timeout headroom, L31) |
| K12 | protected files OK |
| K13 | doc 236 l.4, the `pending` count, the `In Progress (stage` docs, the heading count |
| K14 | `package.json` / lock sha; Biome includes `app/**` only |
| K15 | the preview wiring, the store name `entries`, the DB name |
| K16 | every cited `b-round-366/` artifact exists |
| K17 | `idle()` callers in `app/**` outside tests (0); the `transactionDone` export; the fake-storage helper |
