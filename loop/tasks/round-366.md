# CURRENT TASK — Round 366: PERF-9b-i. Stem-cache perf rows on the production build (new spec + budgets), doc 236 stage 2

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-06, at the round 365 → 366 planning (`b-round-365.md`).

**Decisions** (`backlog.json` → `decisions_log_b`, v328 → v329):
- **D-29z1195:** round 365 = C PASS (`c-round-365.json`, browserVerified true, realVerified true), gate 365 published `413218e`. PERF-9a is done. Rulings on A's two STOPs (§0.1).
- **D-29z1196:** reviewer Lows A-R365-REVIEW-L3…L6 and C-R365-OBS-INTEGRITY → `deferred_low_polish`, closed together by the systemic task SYS-R365-STEM-CACHE-HARDENING (= PERF-9b-ii).
- **D-29z1197:** PERF-9b is split into 9b-i (this round) and 9b-ii. The stem rows are documented in doc 236, not doc 168; the three round-364 Lows are re-routed (§5).
- **D-29z1198:** B's production pre-check and its findings (§0.2).
- **D-29z1199:** the scope of this round (§1).
- **D-29z1200:** the order after this round (§5).

**Why this round, now.** No Critical/High/Medium is open that the cloud can fix (the five open Mediums are tech-lead-manual, awaiting_user or open_root). PERF-9b is next in D-29z1194's order. REGRESSION is not due: `regression-last.json` = 2026-11-05, next due on or after 2026-11-08; today is 2026-11-06. RETRO is at 368.

**Read first:**
- `lessons.md`. A reads 11, 26, 28, 30, 38 and 58. C also reads 22, 37, 38, 56, 57, 59 and 60.
- This task, `b-round-365.md`, the sketch `b-round-365/sketch.patch.txt` and its review log `b-round-365/sketch-review.md`.
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`. Plan source: `/home/runner/czaba-project/docs/technical/performance/perf-plan.md` (outside `store/`; the PERF-9 row: "second open: 0 stem network bytes; ready ≤ 50 % of cold").

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§7).

**Not applicable:** reference-first, product-designer, the YouTube request and the screen budget. This is a performance-harness round; no `app/` file changes and nothing on screen changes. Ableton conformance: not applicable.

## Baseline
- HEAD is `413218e` (gate 365 published) with a clean tree [K1, K2]. Protected files: 11/11 OK [K5]. No dependency change [K6].
- The perf config matches every `*.perf.spec.ts` under `perf/`, builds the app and serves it with remix-serve on port 5188 [K9]. A new spec file is picked up by `npm run test:perf` with no config change.
- The stem cache (PERF-9a) uses the IndexedDB database `czaba-stem-cache-v2` with the object store `entries`; a hit revalidates with `cache: 'no-store'`; the demo previews are wired through `publicPreviewSourceFetch()` [K10].
- Biome checks `app/**` only, so `perf/**` is checked by `npm run typecheck` (L30) [K11]. The determinism contract treats `count`, `bytes` and `boolean (1 = true)` as exact units [K11].
- Doc 236 l.4 is `In Progress (stage 1 of 2; C round 365 PASS)` and has the 7 TEMPLATE headings [K8, K12].
- **Root lanes (2026-11-05 parallel policy).** A HEAD that descends from `413218e` only through `app/components/studio/export/*`, `app/components/studio/StudioToolbar.tsx` or `docs/` (COPY-PD, SRW-21-PLAN) other than doc 236 is an allowed delta, not a STOP; K2's hash may then differ.

## 0. Premises and B's evidence

### 0.1 Rulings on round 365 (L10)
- **STOP 1 / C-R365-INFO-01 (K11 = 12):** accepted. The planning value counted the tree before the two required test files existed. Closed. RETRO 368 input B-R365-COUNT-CLAIM-PLANNING-VS-FINAL.
- **STOP 2 / C-R365-INFO-02 (sweep error):** §1.2 l.127 of task 365 wins: a sweep error is **ignored**, as the code and sketch ruling D1 do. Listing `sweep` among the errors that turn the cache off (l.143) was a B spec error. No code change. Closed.
- **SSR dev-log half:** dropped. It was BLOCKED twice (A and C cannot read the orchestrator's pipe). This round changes no `app/` file, so it has no SSR row.

### 0.2 B's production pre-check (scratch `git archive 413218e`, `npm run build`, remix-serve)
- **Headers on the harness host** (`perf-sketch/headers-prod.json`): both previews are served with `Cache-Control: public, max-age=31536000, immutable`, a weak ETag (size + mtime, new on every build) and `Last-Modified`. A conditional request with the stored ETag gets 304.
- **DevTools cache-disabled mode is not a user path.** With `Network.setCacheDisabled(true)`, Chromium adds `Cache-Control: no-cache` and `Pragma: no-cache`; remix-serve then ignores `If-None-Match` and answers 200 with the full body (`perf-sketch/run1.log`). C's round-365 CS-WARM "cache off → 304" was on the Vite dev server, which behaves differently. Recorded as B-R365-DEVTOOLS-NOCACHE-200 (info). The harness keeps this case as record rows `stem.warm-nocache.*`.
- **Real reopen paths:** HTTP cache evicted (`Network.clearBrowserCache`) and HTTP cache kept both send `If-None-Match` and get 304 (`probe/stem-prod-1440x900.json`, `-1280x720.json`, both viewports). Under the CDP throttle (latency 40 ms, 1,250,000 B/s down, 375,000 B/s up), 3 passes (`perf-sketch/run2.log`):
  - cold: ready 7427 ms, stem window 6175 ms, network body 7,664,757 B, 2 entries stored;
  - warm (evicted): ready 1275 ms, 2 × 304, network body 0, window 44 ms; **ready ratio 0.172**;
  - loaded replicate (4 busy loops on 4 cores, `run3-loaded.log`): ratio 0.235 (max 0.252); every count row equal.
- **Production is Vercel**, not remix-serve (`vercel.json`, `framework: remix`). The harness headers above belong to the harness host. Vercel's headers were not measured (no access from the cloud). Recorded as B-R365-HARNESS-HOST-HEADERS (info) and the root question ROOT-Q-R365-VERCEL-STATIC-HEADERS. Nothing in this task depends on the answer.
- **The narrow-screen `<audio preload="metadata">` request** (B-R364-DEMO-DOUBLE-FETCH) also appears in production: a Media request with `Range: bytes=0-`, 206, then aborted, on the cold and DevTools-no-cache opens. The harness records its bytes (`cdp-media-bytes`); it is not fixed here.

### 0.3 B's sketch (L58), on the scratch + `b-round-365/sketch.patch.txt`
- **Patch:** two new files, `perf/studio-lab-stem-cache.perf.spec.ts` and `perf/budgets.stem-cache.json`; sha256 in `b-round-365/sketch-dispatched.sha256`. `git apply --check` passes on HEAD.
- **Checks:** `npm run typecheck` rc 0 (`sketch-typecheck.log`); Biome on a temporary `app/` copy of the spec: clean (`sketch-biome.log`; L30: Biome does not cover `perf/`).
- **C's command on the sketch** (`npx playwright test --config playwright.perf.config.ts perf/studio-lab-stem-cache.perf.spec.ts`, production build, nothing else running, L38):
  - v2: `perf-sketch/run4-assert.log` (+ `run4-assert-latest.json`): every assert PASS, 3 passes.
  - v3: `perf-sketch/run-v3.log` (+ `run-v3-latest.json`): 46 rows, the 7 asserts PASS, 0 failures; cold ready 7415 ms, warm 1285 ms, ratio 0.173.
  - **v4 (dispatched)** = v3 with 4 record rows changed from `deterministic` to `wallclock` (`stem.cold.body-bytes`, `stem.cold.transfer-bytes`, `stem.warm-nocache.body-bytes`, `stem.warm-nocache.transfer-bytes`): a plain fetch can reuse the partial HTTP-cache entry of the concurrent `<audio>` 206 request, so its byte total varies (cache-off mutant: 7,664,757 / 7,515,518 / 7,517,018), and the exact-match rule would fail the spec on a record row. The spec file is unchanged from v3. `perf-sketch/run-v4.log` (+ `run-v4-latest.json`): the 7 asserts PASS, 0 failures, ratio 0.168.
  - **Mutant cache-off** (`publicPreviewSourceFetch()` returns `plainSourceFetch`; `mutant-cache-off.diff.txt`): `mutant-cache-off-assert.log` (v2) and `mutant-cache-off-v3.log` (v3; same spec as v4, and none of the 4 re-kinded rows is an assert). Red on v3: `stem.cold.entries-stored` −1 (no database: the read never creates one), `stem.warm.body-bytes` 7.5 MB, `stem.warm.status-304` 0, `stem.warm-ready-ratio` 0.987, `stem.blocked.ready` 0, `stem.blocked.entries` −1. Liveness stays green.
  - **Mutant counter-zero** (the body-byte counter never counts; `mutant-counter-zero.diff.txt`, on v3): `mutant-counter-zero.log`. Red only on `stem.harness.cold-body-live`, while `stem.warm.body-bytes` 0 stays green: the liveness row is what keeps the 0 honest.
- **Sketch review:** `b-round-365/sketch-review.md` (B's own v1 → v2, performance-optimizer and tech-lead).

### 0.4 Consults (STUDIO-PERFORMANCE `consults_round_366`)
- **performance-optimizer:** keep the asserts; add `stem.blocked.entries`, a CDP byte cross-check and machine details (all adopted in v3); a changed-ETag row goes to 9b-ii; per-hit revalidation is a Low later candidate (PERF-CAND-STEM-BACKGROUND-REVALIDATE). Its "Medium, if production" rating of the headers does not apply: production is Vercel.
- **tech-lead** (on v2; `sketch-review.md`): wait for both stem fetch entries and for the collection status before reading (Medium, fixed); the ready ratio is noisy (Medium, **kept as assert**: the cold open pays the same JS download under the same throttle; 12 unloaded samples 0.166–0.177, loaded 0.220–0.252, budget 0.5); the entries read must never create the database (fixed: `onupgradeneeded` aborts); the blocked open checks the whole collection (fixed); import the DB name from `app/` (fixed); raise the Resource Timing buffer (fixed). Keep the spec as its own file.

## 1. Scope (A)

### 1.1 Files (exactly 3)
| # | File | Change |
|---|---|---|
| 1 | `perf/studio-lab-stem-cache.perf.spec.ts` | **New**, the sketch verbatim |
| 2 | `perf/budgets.stem-cache.json` | **New**, the sketch verbatim (rows and asserts in §1.2) |
| 3 | `docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md` | l.4 and the stage-2 content (§1.3). The whole doc is granted (L34) |

**Start:** from the store root, check the sha256 of `../tmp/studio-real-loop/b-round-365/sketch.patch.txt` against `sketch-dispatched.sha256`, then `git apply` it. No other file changes:
- no `app/**`, no `perf/lib/**`, no existing spec or budgets file (`studio-lab.perf.spec.ts`, `studio-lab-resources.perf.spec.ts`, `studio-lab-interactions.perf.spec.ts`, `budgets.json`, `budgets.resources.json`, `budgets.interactions.json`) [K7];
- no `package.json`, config or protected file;
- no doc 168 (its Lows are routed, §5).

A change needed outside these 3 files is a STOP (L11), and so is a code-reviewer Medium+ on the 2 perf files. A may change the sketch only to fix a code-reviewer finding; any such change is re-run with the A-PERF row and both mutants, and goes back to the reviewer.

### 1.2 What the harness measures (the contract C checks)
One browser context per pass (empty HTTP cache, IndexedDB and OPFS), 3 passes, CPU rate 1, viewport 1440×900, the CDP throttle of §0.2 on every open. Sequence:
Every open waits for library ready (`waitForLibraryReady`, which gives `ready-ms`) and then for the collection status (`waitForCollectionReady`, which fails on a failed status); every open except the blocked one also waits until both stem paths have a fetch entry before reading Resource Timing. The entries read uses `indexedDB.open` with an aborting `onupgradeneeded`, so it never creates the database (−1 when it is absent).
- **a. cold:** open `/studio-lab`, read Resource Timing for the two stem paths, then poll the `entries` store until it holds 2 records (cap 30 s).
- **b. warm:** `Network.clearBrowserCache`, reopen.
- **c. warm-http:** reopen with the HTTP cache kept.
- **d. warm-nocache:** `Network.setCacheDisabled(true)`, reopen, then turn it off again.
- **e. blocked:** `Network.setBlockedURLs(['*.mp3'])`, reopen; read the entries count.

Per open, record rows `stem.<phase>.{ready-ms, fetch-requests, audio-requests, body-bytes, transfer-bytes, status-200, status-304, stem-window-ms, cdp-mp3-bytes, cdp-media-bytes}`. "Network body bytes" = Σ `encodedBodySize` over the fetch-initiator stem entries whose `transferSize > 0` (a 304 and an HTTP-cache hit count 0).

**Assert rows (7)**, each with the mutant that turns it red on B's sketch:

| Row | Budget | Red under |
|---|---|---|
| `stem.harness.cold-body-live` | == 1 (cold body > 1,000,000 B) | counter-zero |
| `stem.cold.entries-stored` | == 2 | cache-off (−1) |
| `stem.warm.body-bytes` | == 0 | cache-off |
| `stem.warm.status-304` | == 2 | cache-off |
| `stem.warm-ready-ratio` | ≤ 0.5 (wallclock; measured 0.172, loaded 0.235) | cache-off (0.993) |
| `stem.blocked.ready` | == 1 | cache-off |
| `stem.blocked.entries` | == 2 | cache-off (−1) |

Every other row is `record`. The ratio row is the plan target "ready ≤ 50 % of cold", measured under the throttle (plan deviation 2 of D-29z1192). "0 stem body bytes" is plan deviation 1 (one 304 per stem is allowed).

### 1.3 Doc 236 (Georgian, technical terms in English)
- l.4 is exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 366 PASS)` (L28; stage 3 = PERF-9b-ii).
- The 7 TEMPLATE `## ` headings stay, in order (L26).
- Add the stage-2 content, each in its own section:
  - **კონტექსტი / მიდგომა:** why production (`npm run test:perf`), the CDP throttle values, why the evicted-cache reopen is the primary scenario and the DevTools no-cache case is record only (§0.2), the two plan deviations.
  - **შეცვლილი ფაილები:** the 2 perf files.
  - **პრობლემები და გადაწყვეტები:** DevTools no-cache → 200 (Problem → Solution); `encodedBodySize` counts cache hits → network body bytes; a blocked fetch leaves no Resource Timing entry → `stem.blocked.entries`; the harness host is not production (Vercel).
  - **ტესტირება:** the 7 asserts with their measured medians and their mutants; C's rows.
  - **TODO:** PERF-9b-ii (SYS-R365-STEM-CACHE-HARDENING), 9c (awaiting Saba), 9d (root), ROOT-Q-R365-VERCEL-STATIC-HEADERS, PERF-CAND-STEM-BACKGROUND-REVALIDATE.
- Cite only rows and tests that exist (L26). Write measured numbers from A's own run, labelled as A's.

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-365/claims-366.sh` (loop root) | equals `b-round-365/claims-366-planning-output.txt` |
| A-CLAIMS final | same | K1, K5, K6, K9–K11 equal planning. K2 = `413218e 3`. K3 `spec 1 budgets 1`. K4 equals `b-round-365/claims-366-sketch-output.txt`. K7 all 0. K8 l.4 = §1.3 and `pending 0`. K12 `doc236-headings ≥ 7`. K13 empty |
| A-TYPE / A-LINT | `npm run typecheck`; `npm run lint` | rc 0; lint warnings ≤ 205 |
| A-PERF | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-stem-cache.perf.spec.ts`, alone (L38) | exit 0; every assert PASS; save the log and `test-results/perf/latest-stem-cache.json` under `a-round-366/` |
| A-MUTANTS | cache-off and counter-zero, exactly as `b-round-365/perf-sketch/mutant-*.diff.txt`, each on a full rebuild (the config's webServer rebuilds) | each red on its rows in §1.2; the other asserts as listed; source restored and checked with `cmp`; logs under `a-round-366/mutants/` |
| A-REVIEW | `code-reviewer` on the 3 files | no unruled Medium+ (STOP). Any edit after the review goes back to the reviewer (L11) |
| A-DOC | doc 236 | as §1.3; `grep -rl 'C round [0-9]* pending' docs/implementation` → 0 |

A does not run the full suite, `npm run verify` or the other perf specs; the gate does. **Mutant hygiene (L60):** a mutant edits `app/lib/arrangement/stem-cache.client.ts` or the new spec in place; restore from a copy under `a-round-366/` and prove it with `cmp` before the next run. The webServer rebuilds on every run, so a restored source needs no manual rebuild.

### 2.2 C rows
Run nothing else while a perf spec or probe runs (L38). Order: PERF first (its webServer builds and serves on 5188 and stops), then `npm run build` and start the 5189 production server for PROBE, AUDIO and G366-AUTH, then stop it.

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-365/claims-366.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git diff --stat` | 2 new perf files + doc 236 modified; no other path |
| PERF (1440×900) | A-PERF's command, alone | exit 0; the 7 asserts PASS; every row measured 3 times; no `failures`; save `latest-stem-cache.json` under `c-round-366/` |
| MUTANT-OWN (C's own, on a scratch under `c-round-366/`, predicted first in `progress.json`) | one mutant not in A's two, e.g. the 304 branch returns the network response (warm body bytes stay 0 but no audio: expect `stem.blocked.*` or ready to change), or the blocked branch deletes entries | red on the predicted row, or reported with counts if green. Scratch deleted (L60) |
| PROBE (1440×900 and 1280×720) | `node b-round-365/probe/stem-prod-probe.mjs <base> <w>x<h> c-round-366/stem-prod-<w>x<h>.json` against a production server C starts from the store (`npm run build`, then `PORT=5189 npx remix-serve build/server/index.js`, output redirected to a file under `c-round-366/`) | per viewport: cold = one fetch request per stem, 200, and 2 OPFS files of 4,054,080 and 3,610,677 B; warm-evicted and warm-http = 304 with `If-None-Match`; warm-nocache = 200 with `Cache-Control: no-cache` (recorded, the DevTools case); blocked = ready text "Demo collection ready" and both entries still present; screenshots saved. A 304 that CDP reports as `net::ERR_ABORTED` is expected (the cache cancels the 304 body stream) |
| AUDIO (1440×900) | on the warm-evicted open of the production server: add "Middle East — public preview" to a track (Enter on the library item), play 2 s | the playhead advances and a level C names shows signal: the cached bytes play real audio in production |
| G366-AUTH (both viewports) | copy `c-round-365/auth.mjs` (production or dev server) | `/studio-lab` opens anonymously; `/studio/<id>` asks for sign-in with 0 audio sources; `/api/studio-token` without credentials → 401 and no token. A fake-bearer 500 that fails closed goes under `blocked` |
| DOCS | doc 236 | l.4 byte-exact; the 7 `## ` headings in TEMPLATE order; every named row and mutant exists (L26); `grep -rl 'C round [0-9]* pending' docs/implementation` → 0 |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified** is false if PERF, PROBE (either viewport), AUDIO or G366-AUTH does not run. None of them needs the backend.

**Write all L57 fields** in `c-round-366.json` and run `python3 -I tools/l57-check.py c-round-366.json c-round-366/l57-check.txt` until it exits 0.
- `assertsSpecified`: the 7 assert rows of §1.2.
- `mutantsRecorded`: cache-off, counter-zero (A logs) plus C's own.
- `mutantRedOnSketch`: `b-round-365/perf-sketch/mutant-cache-off-v3.log`, `b-round-365/perf-sketch/mutant-counter-zero.log`.
- `gateChecksNamed`: full vitest, typecheck, biome.
- `gateChecksRunOnSketch`: `b-round-365/sketch-typecheck.log`, `b-round-365/sketch-biome.log` (no full vitest on the sketch: it adds no vitest file and changes no `app/` file).
- `chainHeadGateRunGreen`: gate 365.
- `affectedChecksNamed`: the stem-cache perf spec; the production probe at both viewports.
- `affectedChecksRunOnSketch`: `b-round-365/perf-sketch/run-v4.log`, `b-round-365/probe/stem-prod-1440x900.json`, `b-round-365/probe/stem-prod-1280x720.json`.

## 3. Neighbouring behaviour that could break
- **The other perf specs** share `perf/lib` and the config; this round edits neither [K7], and the new spec only imports from `perf/lib`. `buildPerfReportCore` fails a sample without a budget row and a row measured fewer than 3 times: both are part of PERF.
- **The gate's `npm run test:perf`** (if root runs it) now includes about 1 more minute of work (B: 49–90 s per run incl. the loaded one; the file timeout is 15 min). Each pass makes 5 throttled navigations; the blocked open is capped at 60 s navigation + the 90 s ready wait.
- **The stem cache itself** is unchanged; PERF-9a's unit rows and C's round-365 rows stay valid. AUDIO re-checks real playback from the cache on the production build.
- **Purchase protection:** unchanged; G366-AUTH guards it.

## 4. STOP conditions (A)
- The sketch patch does not apply, or its sha256 differs.
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1.
- Any change needed outside the 3 files.
- An assert fails on A's run, or a row is measured fewer than 3 times (write the medians; do not loosen a budget).
- A mutant stays green on its named rows.
- A code-reviewer Medium+.

## 5. Routed, not in scope
- **PERF-9b-ii = SYS-R365-STEM-CACHE-HARDENING** (next, unless REGRESSION is due): A-R365-REVIEW-L3…L6, C-R365-OBS-INTEGRITY (corrupted OPFS file browser row), a changed-validator browser row, the reviewer proposal "serialize eviction planning", doc 236 → Completed.
- **C-R364-01, A-R364-REVIEW-SELECTED-BEFORE, A-R364-REVIEW-MARKER-PRE-DRAG:** re-routed (D-29z1197) to the next task that owns the interactions spec / doc 168, else the polish pass.
- **PERF-9c:** `awaiting_user` (SABA-Q-PERF4-STUDIO-CACHE). **PERF-9d:** ROOT-REQ-PERF9D-LEGACY-CACHE.
- **ROOT-Q-R365-VERCEL-STATIC-HEADERS**, **PERF-CAND-STEM-BACKGROUND-REVALIDATE**, **B-R364-DEMO-DOUBLE-FETCH:** recorded, not scheduled.
- **Architecture:** `b-round-362/root-request-arch-checkpoint.md` stays with root; this round touches no component owner.
- **D-29z1200, next:** REGRESSION if the round-367 planning is on or after 2026-11-08, else PERF-9b-ii → RETRO 368 → PERF-11 → PERF-12…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 entries (skip rule).

## 6. Deliverables
- **A:** `a-round-366.md` with every §2.1 row, evidence under `a-round-366/` (perf log, report JSON, mutant logs) and the code-reviewer result.
- **C:** `c-round-366.md`, `c-round-366.json` (all L57 fields), evidence under `c-round-366/`.

## 7. Claims
Run `bash b-round-365/claims-366.sh` from the loop root. Set `CLAIMS_STORE` to point it at a scratch.

| Output | File |
|---|---|
| Planning, on `413218e` | `b-round-365/claims-366-planning-output.txt` |
| Sketch (scratch + patch) | `b-round-365/claims-366-sketch-output.txt` |

| Tag | What it pins |
|---|---|
| K1 | gate 365 status and commit |
| K2 | HEAD and the status entry count |
| K3 | the 2 new perf files exist |
| K4 | budgets: row count, assert count, owner, each assert's op and value |
| K5 | protected files OK |
| K6 | `package.json` / lock sha |
| K7 | no change under `app/`, `perf/lib/` or the existing spec/budgets files |
| K8 | doc 236 l.4; `pending` docs; `In Progress (stage` hits |
| K9 | perf config: testMatch, port 5188, build + remix-serve webServer |
| K10 | stem cache DB name, store name, the hit's `cache: 'no-store'`, the demo wiring |
| K11 | Biome includes `app/**` only; the exact determinism units |
| K12 | doc 236 heading count |
| K13 | cited `b-round-365/` artifacts missing (empty at hand-off) |

L29 check for C: every backticked `store/` fact in the Baseline and §0 carries a `[K#]`; an untagged one is a B-spec Low.
