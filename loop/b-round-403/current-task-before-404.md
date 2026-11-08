# Round 403: PERF-14c-i — peaks client hardening (closes the 8 round-315 peaks Lows) + min-zoom zoom-key harness rows (PERF-14 stage 4 of 6), from B's reviewed sketch

**Planned by:** B, at the round 402 → 403 planning, 2026-11-08 (`b-round-402.md`). Advisor used before planning and before hand-off.

## Read first
- `lessons.md` in full. Most relevant: L4, L11, L23, L28, L29, L30, L31, L37, L38, L49, L56, L57, L58, L59, L60.
- This file. Open `tasks/round-402.md` only to look up the PERF-14b-ii contract (unchanged here).
- Primitives: `AUDIO_ARCHITECTURE.md`, `AGENT_DISCOVERABLE_CODE.md`, `ERROR_TAXONOMY.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `.claude/prompts/new-test.md`.
- **Claims:** `bash b-round-402/claims-403.sh` from the loop root. Planning output: `b-round-402/claims-403-planning-output.txt` (26 claims, stderr empty). The same script on B's sketch-applied scratch: `b-round-402/claims-403-sketch-output.txt` (the allowed code deltas, §7). A runs it before editing; C runs it at the start of SOURCE-SCOPE (it must equal the planning output) and at the end (only the §7 facts may differ).

## Baseline: HEAD `7d7d7b2`, clean tree
- Gate 402 published `7d7d7b2` on both remotes (rounds 401–402) [K1]. `git status --short --untracked-files=all` is empty at planning [K2].
- **Frozen:** `b-round-402/r403-frozen-sha256.txt`, **1,290** entries = every tracked file except the 6 tracked grants; `sha256sum -c` rc 0 from `store/` [K3]. Each of the 11 protected files of `b-round-318/protected-sha256.txt` is in it exactly once, and none is in the grants [K4].
- **Grants:** `b-round-402/grants-403.txt` (§4).

## 0. Why this round
- Round 402 (PERF-14b-ii) is C PASS with `browserVerified`/`realVerified` true, 0 bugs, and is published [K16]. RETRO 401 is closed by RT-FIX-401 PASS. REGRESSION-2026-11-10 is not due: today is 2026-11-08 and `regression-last.json` says 2026-11-07 [K13]. It runs at the first planning on or after 2026-11-10.
- No Critical/High finding is open. The 5 open Mediums are root-only, manual or `awaiting_user` (`context/active-summary.md`); none is reproducible in the cloud browser.
- The next scope in order is **PERF-14c** (D-29z1375). **B re-measured its premise first (L37, D-29z1383)** on a HEAD production build with 200 clips (`b-round-402/probe/head-minzoom-*.json`) [K11]:
  - At 1x CPU every zoom key takes ≤ 24 ms at default zoom and near minimum zoom, so the plan target "zoom p95 < 50 ms" is met at 1x.
  - At 6x: default zoom takes 64 ms max with 1–2 clips mounted, near min zoom 88 / 80 ms. Near min zoom only 159 columns are drawn per clip, while 16–24 mounted clips alternate on every key.
  - `performance-optimizer` (`b-round-402/consult-perf-14c-ii.md`): near min zoom the cost is mount churn, not peak building. The pyramid's value has to be measured (column-cap and fixed-path mutants, CPU profile) before PERF-14c-ii is written.
  - So PERF-14c is split (D-29z1383): **14c-i (this round)** clears the peaks-client debt and gives the harness the near-min-zoom scenario as `record` rows; **14c-ii** (pyramid, after its measurement) and **14c-iii** (canvas tiles) follow. PERF-14 now has 6 stages.
- The 8 Lows whose fix home is "PERF-14, next owner of `peaks.client.ts`" (D-29z854) are one cluster under one owner, closed together like a systemic task. **They count as one feature stage, not 8 bug fixes.**
- **Product promise this stage serves (L55):** waveforms always appear. A stalled, failing or missing worker never leaves a sound stuck in "loading", while a sound whose own decode fails is still reported to its caller.

## 1. Rulings (B)
### D-29z1384: the dispatched patch (L58: reviewed = dispatched)
- **Patch:** `b-round-402/sketch-403.patch.txt`, sha256 `5cc6d6341a34712b…`, 4 files; `git apply --check` is clean on HEAD [K5]. **A applies it byte-for-byte and does not edit those 4 files further.**
- **`app/lib/arrangement/peaks.client.ts`:**
  - **A-R315-REVIEW-L2:** in the `failWorker` fallback loop, a throw from the main-thread peak computation of one job no longer stops the jobs behind it. It is rethrown on a timer (`rethrowLater`).
    - **Exception (TL-R402-SK-M2):** the job that the current `request()` call started, when `failWorker` runs synchronously inside that call (a failing `postMessage`). Its error is thrown from `request()` after every other pending job has been delivered, as before the patch. This keeps the callers' error handling (video decode `catch` → `error`; collection `.then` → `.catch`) [K12].
    - The no-Worker path of `request()` is unchanged and still throws synchronously (PW28).
  - **A-R315-REVIEW-L1:** `dispose()` resets `workerReplied`, so a new worker after dispose gets the cold-start budget again (PW25).
  - `rethrowLater` is the helper that `deliver` already used inline.
- **`app/lib/arrangement/__tests__/peaks-worker.test.ts`:**
  - New rows:
    - PW14b (C-R315-T1): pins 10 000 / 3 000 ms [K19].
    - PW24 (C-R315-T2): junk before the first reply neither ends nor re-arms the cold-start budget.
    - PW24b (TL-R402-SK-M1): junk while the worker is idle after a pre-aborted request leaves the next job with the cold-start budget.
    - PW25 (A-R315-REVIEW-L1).
    - PW26 (A-R315-REVIEW-L3): no Worker + throwing `onPeaks` does not throw from `request` and rethrows on a timer.
    - PW27 (L2 loop).
    - PW28 (sync throw kept).
    - PW29 (requesting job's error from `request`, no deferred rethrow).
  - **A-R315-REVIEW-L4:** `vi.useRealTimers()` is added to the PW12–PW13 `afterEach`.
  - **GATE315-S2:** PW18 unmounts in `afterEach` through a describe-scope `view`.
  - 0 assertions are removed. PW-id count goes 19 → 27 [K20].
- **`perf/studio-lab-scale.perf.spec.ts` + `perf/budgets.scale.json`:**
  - New step **i**, appended after h. From the minimum zoom it presses 5 × `=` then 5 × `-`, one window per key until quiet, at 1x. Then `scrollLeft` is restored to its value at the start of i, and the same keys run at 6x.
  - 8 new rows `scale.zoom.min.{keydown-p95-ms, keydown-max-ms, commits-per-key, components-per-key}` and `.6x`. All are `record`, with kinds copied from `scale.zoom.*`.
  - The first 23 rows are unchanged; the file grows to 31 rows, still 7 asserts [K21].
  - `measureZoomKeys` gains `rowPrefix` / `firstKey` with defaults that keep steps d/e. `setTimelineScroll` also accepts a number.
- **Evidence on the final sketch (L58):**
  - Mutants: **8/8 red**, pristine before and after rc 0 (`b-round-402/mutants/summary.txt`, runner `mutants/run.py`) [K8].
  - Full vitest: 261 files / 3870 tests [K9]. `tsc`, `lint` and Biome: rc 0.
  - Scale spec alone on the production build: rc 0, complete, failures []. All 23 HEAD rows' deterministic samples equal `c-round-402/perf-scale.json`. New: components 121.1 at 1x and 6x, commits 1 / 1 [K10].
  - Browser fallback probe on the sketch build at both viewports (`b-round-402/probe/sketch-fallback-*`, HEAD controls `head-fallback-*`).
- **Review:** `tech-lead` pass 1 on v1 (3 Medium, 5 Low, all disposed). Delta pass 2 on the final sha says **"no new Medium+"**, plus 2 hardening Lows, which are recorded (`b-round-402/sketch-review.md`, which names the dispatched sha256) [K15].

### D-29z1385: rulings inside the patch
- **MU-403-REPLIED-ON-GARBAGE:** first believed equivalent, but `tech-lead` showed it is reachable through a pre-aborted request. It is now killed by PW24b. C-R315-T2 closes with PW24 + PW24b.
- **Residual of A-R315-REVIEW-L2 (recorded, Low):** in the fallback loop, a job that is *not* the requesting job and whose own computation throws gets no peaks; its source stays `loading` and the error is rethrown on a timer.
  - Before the patch, the same throw stopped every later job, and it reached whichever caller happened to be running, often the wrong one.
  - Reporting that job's error to its own source needs an error callback in the `request` API, which changes `ArrangementContext.tsx` (not granted). Recorded as `A-R403-L2-RESIDUAL-QUEUED-THROW` (deferred Low; fix home: the next owner of the `request` API).
- **TL-R402-SK-L3** (6x abort resets `cpuRate` before `abortedAt`, same as step e), **TL-R402-SK2-L1** (`requestingFailure` not cleared in `finally`; cannot leak today) and **TL-R402-SK2-L2** (a nested request on a synchronous fake reply clobbers `requesting`; test-only): `deferred_low_polish`.
- **TL-R402-SK-L4** (notes cite `b-round-*` paths): kept, as in every PERF-14 note.

### D-29z1386: docs and the stage count
- **New doc 257** `docs/implementation/2026/quarter-IV/257-perf-peaks-client-hardening.md` (257 is free [K6]):
  - Georgian, technical terms in English, the 7 TEMPLATE headings in order (L26).
  - l.4 byte-exact: `**სტატუსი:** In Progress (stage 4 of 6; C round 403 PASS)` (L28).
  - It holds:
    - the premise numbers [K11];
    - the 8 Lows and how each is closed;
    - the two error paths (requesting job vs queued job) and the residual;
    - the PW row table (PW14b, PW24, PW24b, PW25–PW29);
    - the mutant table (8 rows, from `mutants/summary.txt`);
    - step i and its 8 `record` rows with the sketch values;
    - the stage plan 14c-ii / 14c-iii;
    - the stage-count note: PERF-14 has 6 stages from D-29z1383, and docs 254–256 keep "of 4" on l.4 until the final stage rewrites them (L28).
- **PERF-14 has 6 stages from now on.** Docs 254/255/256 keep "of 4" on l.4 until the final stage, which rewrites every earlier l.4 to `Completed (C round M PASS)` (L28 multi-stage clause). l.4 of 254 stays byte-unchanged here [K6].
- **Doc 254** (contract sections, L34):
  - `### Spec-ის ნაბიჯები (a–h)` becomes `### Spec-ის ნაბიჯები (a–i)` and gains step i, including the restore of `scrollLeft` before 6x.
  - `### Budget-ები` gains the 8 `record` rows with their kinds and the sketch values.
  - l.4 is unchanged.
- **Doc 228** (sections `## ტესტირება` and `## TODO / შემდეგი ნაბიჯები` only; l.4 `Completed (C round 315 PASS)` byte-unchanged [K6]):
  - **GATE315-S8:** `**Browser (C round 314, stage 1):**` → `**Browser (C round 312, stage 1):**`.
  - The TODO bullet that starts `- **Round 315-ის review-ის Low შენიშვნები` (exactly 1 such line at HEAD [K25]) keeps its whole text and gains at its end, after the final character of that line, exactly this string (one leading space; the backticks around commitDecodedSource are part of the text):

```text
 — დაიხურა PERF-14c-i-ში (round 403, doc 257); `commitDecodedSource` architecture note რჩება signal-ად.
```

### Side effects (L49)
| Effect | Ruling |
|---|---|
| A queued job's main-thread compute throw no longer aborts the fallback loop | Intended (L2). The jobs behind it are delivered (PW27) |
| The requesting job's compute throw inside a synchronous `failWorker` | Kept: still thrown from `request()` (PW29), after the others are delivered |
| A queued job whose own compute throws stays `loading` | Residual, recorded (D-29z1385) |
| `dispose()` + a new request gets 10 s, not 3 s, before fallback | Intended (L1, PW25) |
| Scale spec runs ~20 more key windows per pass | Accepted. Steps a–h are measured before i, and every pass is a fresh context |

### Ruling lines (L4)
- "Apply the patch byte-for-byte" wins over any style preference of A's reviewer for those 4 files. A Medium+ in the patch **logic** is a STOP (L11), not an edit. A doc finding is fixed in the docs.
- Doc 228: the two edits above win over "Completed docs stay unchanged"; nothing else in doc 228 changes.

## 2. Reference
Not applicable: PERF / test-only round with no visible or behavioural change on the normal path. The policy's reference-first rule excludes performance, refactor and test-only rounds. No screen-budget change. The product-designer and YouTube steps do not apply.

## 3. What A changes
1. Claims at start (A1).
2. From `store/`: `git apply --check`, then `git apply ../tmp/studio-real-loop/b-round-402/sketch-403.patch.txt`. Do not edit the 4 files after that.
3. Write doc 257 and edit docs 254 and 228 exactly as in §1 D-29z1386.
4. Run the §5 checks. Write `a-round-403.md` as you go: changed files, checks with rc and file paths, reviewer findings, For B.

## 4. Grants (`b-round-402/grants-403.txt`)
- `app/lib/arrangement/peaks.client.ts`, `app/lib/arrangement/__tests__/peaks-worker.test.ts` (patch only)
- `perf/studio-lab-scale.perf.spec.ts`, `perf/budgets.scale.json` (patch only)
- `docs/implementation/2026/quarter-IV/228-perf-peaks-worker.md` (the two §1 edits only), `254-perf-scale-harness.md` (the two contract subsections; l.4 unchanged)
- `docs/implementation/2026/quarter-IV/257-perf-peaks-client-hardening.md` (new)

Anything else changing is a STOP. The protected files (auth, purchased Studio route, token API) are frozen.

## 5. A: checks
| # | Check | PASS when |
|---|---|---|
| A1 | Claims at start | Equal to the planning output |
| A2 | `npm run typecheck`; `npm run lint` | rc 0 both |
| A3 | `npx vitest run` on `app/lib/arrangement/__tests__/peaks-worker.test.ts` and `peaks-worker-video.test.tsx`, plus the round-315 covering set: `clip-gain-waveform.test.tsx`, `content-colour-ui.test.tsx`, `clip-gain-pointer-preview.test.tsx`, `waveform-zoom.test.tsx`, `failed-source-refusal.test.tsx`, `video-import-status-ui.test.tsx`, `export-mp3.test.tsx` (all under `app/lib/arrangement/__tests__/` [K23]) | All pass. `peaks-worker.test.ts` has 33 tests. Record each file's duration; a test above 50 % of its timeout is reported (L31). Gate 402: `peaks-worker.test.ts` 25 tests in 930 ms [K18]. Covering-set headroom (L31): the slowest test is `clip-gain-pointer-preview.test.tsx` CP12d, 4,582 ms at gate 402 against its declared `{ timeout: 30_000 }`, about 15 % [K26] |
| A4 | `npx vitest run --config ../tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` (GATE304-M1) | 3 files, ≥ 54 tests pass |
| A5 | Scale spec **alone** (L38): `npx playwright test --config playwright.perf.config.ts perf/studio-lab-scale.perf.spec.ts` | rc 0, `complete` true, `failures` [], `problems` [] in every pass. The 23 HEAD rows' deterministic samples equal `c-round-402/perf-scale.json`. The 8 new rows exist, all `record`; `scale.zoom.min.components-per-key` and `.6x` are 121.1 and `commits-per-key` (both) 1, as on B's sketch [K10]. Write a per-row compare file |
| A6 | Claims at end | Only the §7 facts differ |
| A7 | `code-reviewer` on the applied diff and the docs (≥ 3 files) | No open Medium+. A Medium+ in the patch logic is a STOP; doc findings are fixed. Any change after the review goes back to the reviewer |

## 6. C: rows
Write `c-round-403.md`, `c-round-403.json` and `c-round-403/progress.json` as you go (L59).

**Run order:** browser rows 3–5, then perf row 6 (alone, L38), then the rest. The dev server is `http://127.0.0.1:5173`. For row 4, build the working tree in a scratch copy outside `store/` and serve it on its own free port. B used 5191/5192 with `PORT=<port> npx remix-serve build/server/index.js`; port 5189 was held by an older process. Stop your server by PID, not by a pattern that matches your own shell (L60).

| # | Row | Steps | PASS when |
|---|---|---|---|
| 1 | **SOURCE-SCOPE** (start) | Claims; `git status --short --untracked-files=all`; both manifests | Claims equal the planning output except the §7 facts. Status = the 7 granted paths only (6 M, 1 ??). Frozen rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY** | `git diff -- <the 4 patch files>` compared with `b-round-402/sketch-403.patch.txt`, ignoring `index` lines | Identical |
| 3 | **AUTH (browser)** | Fresh context, 1440×900 and 1280×720: `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization | Demo opens with `auth_user` null. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. The token request returns 401 `Please sign in to access Studio.` and no token. Fake bearer → `blocked` (no backend) |
| 4 | **PEAKS-FALLBACK (browser)** | `node b-round-402/probe/peaks-fallback.cjs <base> <mode> <abs out.json> <vp>` on the working-tree build, modes `normal`, `none`, `failing`, both viewports; keep the PNGs | Every run: `ready` true, the status starts with `Demo collection ready`, `loadingText` 0, `clip.waveform` true with `columns` 4096 and `pathChars` 87900, `pageErrors` []. `normal`: `workers.created` 2. `none`: `workers.created` 0. `failing`: `workers.failed` 1. B's values on the sketch and HEAD: `probe/sketch-fallback-*`, `probe/head-fallback-*` [K24]. Scope: `failing` proves the page recovers from a dead worker (the error fires at load, with at most one job queued; later sources go straight to the main thread). The multi-job fallback loop is proven by PW27/PW29 in jsdom (row 7), not by this row |
| 5 | **STUDIO-SMOKE (browser)** | Dev server, both viewports, after `Demo collection ready`: Enter adds a clip; drag it by its name bar 100 px; Ctrl+Z; Play ~1.5 s then Stop; open Export and close it | The clip appears and moves; Ctrl+Z restores its start; the position advances, then stops; the dialog opens and closes; 0 page errors; screenshots |
| 6 | **SCALE** | Scale spec alone on the working tree | As A5 |
| 7 | **UNIT + MUTANT** | The A3 vitest set. Then, on your own scratch copy, apply MU-403-REQUESTING-DEFERRED and MU-403-REPLIED-ON-GARBAGE from `b-round-402/mutants/run.py` and run `peaks-worker.test.ts` | All pass. The first mutant turns PW29 red, the second PW24b red. A `PW4` in a "failing" list is the describe label `PW4-PW10`, not a test |
| 8 | **PERF-LIB** | As A4 | 3 files, ≥ 54 tests |
| 9 | **BUDGET-SHAPE** | JSON diff of `perf/budgets.scale.json` against HEAD | The first 23 objects are identical to HEAD, in order. The 8 appended rows have the §1 ids, `mode` `record`, `budget` null, `owner` `PERF-14c-i`, and `kind` equal to the matching `scale.zoom.*` row |
| 10 | **DOCS** | Read docs 257, 254, 228 | Georgian. Doc 257: the 7 TEMPLATE headings in order; l.4 byte-exact. Doc 254: l.4 unchanged; heading `(a–i)`; step i and the 8 rows match the live spec and JSON (L34). Doc 228: l.4 unchanged; exactly the two §1 edits (diff against HEAD). Every id and file cited exists. `grep -rln 'In Progress (stage' docs/implementation` = 7; `grep -rn 'C round [0-9]* pending' docs/implementation` = 0 |
| 11 | **SOURCE-SCOPE** (end) + **L57** | As row 1; claims; `python3 -I tools/l57-check.py c-round-403.json c-round-403/l57-check.txt` | As row 1; rc 0 |
| — | **gate** | Full vitest, typecheck, build, Biome, verify | Marked `gate`; not claimed in `passed` |

- **`browserVerified`:** true only if rows 3–5 ran at both viewports.
- **All L57 fields** (`lessons.md` L57), with these values:
  - `manifestPaths`: `b-round-402/r403-frozen-sha256.txt`, `b-round-318/protected-sha256.txt`;
  - `assertsSpecified`: PW14b, PW24, PW24b, PW25–PW29, plus "no new perf assert; 8 `record` rows";
  - `mutantsRecorded` and `mutantRedOnSketch`: `b-round-402/mutants/summary.txt`;
  - `mutantRedOnTree`: row 7;
  - `gateChecksRunOnSketch`: `b-round-402/sketch-full-vitest.log`, `sketch-tsc.log`, `sketch-lint.log`, `sketch-biome.log`;
  - `chainHeadGateRunGreen`: gate 402 published `7d7d7b2`;
  - `affectedChecksNamed`: rows 4, 6, 7, 8;
  - `affectedChecksRunOnSketch`: `b-round-402/perf-sketch-scale-v2.*`, `probe/sketch-fallback-*`, `mutants/summary.txt`;
  - `progressFile` and `stopSignal`.

**Verdict and routing:**
- Every row PASS → PASS.
- A failing app-behaviour row (4, 5) at Medium+ is fixed first (bug gate).
- A Low → `deferred_low_polish`.
- A claims or doc mismatch caused by B's spec → finding with `origin` B.

## 7. Claims that may change during the round
From `b-round-402/claims-403-sketch-output.txt` (code) plus the doc rows of §1:
- **K2:** status 0 → 7 lines (the grants). HEAD stays `7d7d7b2`; the sketch scratch's own commit id in that file is not a claim.
- **K5:** `applies-on-tree` yes → no.
- **K6:**
  - `doc257-free` 0 → 1;
  - `doc228-browser-314` 1 → 0 and `doc228-browser-312` 0 → 1;
  - `doc254-steps-heading` 1 → 0 (renamed `(a–i)`);
  - `doc228-l4` and `doc254-l4` stay 1.
- **K7:** `in-progress-stage-docs` 6 → 7.
- **K19:** `workerReplied-resets` 1 → 2.
- **K20:** PW-ids 19 → 27, `useRealTimers` 4 → 5, `pw18-inline-unmount` 2 → 1.
- **K21:** 23 7 0 → 31 7 8.
- **K25:** `suffix-present` 0 → 1 (the anchor count stays 1).
- Everything else stays. K3 stays at 1,290 entries and 0 failures.

## 8. Order after this round (D-29z1387)
1. **REGRESSION-2026-11-10** at the first planning on or after 2026-11-10. It carries every item done since 2026-11-08, including 14b-ii and 14c-i, and one fallback check (row 4's `failing` mode).
2. **PERF-14c-ii.** Its planning starts with the measurement in `b-round-402/consult-perf-14c-ii.md` §1: mutant A (`PEAK_SHAPE_MAX_COLUMNS` 512) and mutant B (a fixed path) at 6x over ≥ 10 keys, plus a CPU profile.
   - If path cost is small, 14c-ii first takes the near-min-zoom mount churn (PERF-CAND-14-SCROLL-HYSTERESIS) as its fix, and the pyramid follows.
   - Pyramid design to start from: max-only, exact range-max (byte-identical paths), lazy levels, `sourcePeaks` type unchanged.
3. **PERF-14c-iii** (canvas tiles for the visible window; the starved `path-rewrites` rows and `arrangement-clip-waveform` locators re-ruled).
4. Then SYS-R385-LEAF-ACTIONS-CONTEXT → PERF-15 → SYS-R2-FAKE-FIDELITY + SYS-R388 → SYS-CLOCK-DETERMINISM → SYS-R369 → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 entries (skip rule).
5. At the end of PERF-14, B asks root for a bounded `frontend-architect` checkpoint on the lane and peaks owners (b-round-401 note).
6. ARCH-CHECKPOINT-PREVIEW-AFTER-13C stays with root (deadline RETRO 416).

## 9. Out of scope (recorded, not dropped)
- The pyramid and canvas tiles (14c-ii/iii).
- Scroll hysteresis (PERF-CAND-14-SCROLL-HYSTERESIS).
- An error callback in the `request` API (A-R403-L2-RESIDUAL-QUEUED-THROW).
- The `commitDecodedSource` architecture note.
- The round-402 Lows (A-R402-REVIEW-F1/F2/F3/F5/F8, GATE402-L1..L3): `deferred_low_polish`.
- Protected files; the purchased route (SRW-21, `deferred_user`).
