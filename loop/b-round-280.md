# B round 280 → 281 planning (2026-10-31)

**Advisor:** available and consulted three times: before the approach, when the pre-check changed it, and before finishing. The last call led B to verify the HEAD-control file and to add the doc 208 ruling.

**Consults** (read-only, told not to start processes during B's perf runs):
- `tech-lead`: correctness, the double record, resources-spec scope, notes, mutants, doc number;
- `performance-optimizer`: whether the extra read can move rows, the 1b-ii re-run, detail keys.

## 1. Inputs and evidence
| Input | Result |
|---|---|
| `c-round-280.json` | **PASS**: 13 rows, `browserVerified: true`, `realVerified: true`, 0 bugs, 0 failed, 0 blocked. Gate rows not claimed. Info: INFO-C280-AUTH-COLD-START, INFO-C280-MU-PROBE-THROW-TSC |
| `a-round-280.md` | done within the grants, no STOP; perf 1b-ii ×2; EQUIV-B2 0 problems; 5 mutants with their signals; code-reviewer 9/10, L1–L4, one Architecture note |
| `gates/gate-round-280.json` | **published**, commit `145f6c1` on both remotes. This is the new baseline |
| `gates/round-280/review.md` | COMMIT OK, 8.5/10. Findings 1–2 Low, 3–4 info, 5 already tracked; Architecture note signal 3 |
| env-status | store 200 (round 280). :5173 answered 200 before and after B's probes |
| regression-last.json | round 258, 2026-10-30 → next REGRESSION is due on/after 2026-11-02, so it is not due today (2026-10-31) |
| `tasks/round-280.md` | archived (a copy of the round-280 `current-task.md`; it did not exist before) |
| `root-pre-push-review.md`, `publication-checkpoint.json` | 2026-10-07 content; no new remaining finding |

## 2. Backlog changes (only from evidence)
**Done (D-29z650)**, by C round 280 PASS + gate 280 published:
- PERF-HARNESS-SHARED-LIB-b-ii-2 → **done / მზადაა**. Its browser rows PERF-RUN, CLOCK-DATA, MUTANTS and G280-AUTH all ran.
- PERF-HARNESS-SHARED-LIB-b-ii and PERF-HARNESS-SHARED-LIB-b → **done** (a feature boundary).
- R216-MEM-POLLS-HEADROOM → **watch**. C's lowest 1× `mem-polls-1` was 9 (≥ 7); doc 209 has the ranges.

**Recorded (D-29z651):**
- **Lows → `deferred_low_polish`:**
  - GATE280-S1: per-sample round-trip stats for the 6× midpoint guess; feeds the R216 watch;
  - GATE280-S2: probe channel vs poll channel.
- **Info:**
  - GATE280-S3: `Date.now` vs `performance.now`;
  - GATE280-S4: a failed probe's offset is still used, by design;
  - INFO-C280-AUTH-COLD-START (2× with INFO-C279);
  - INFO-C280-MU-PROBE-THROW-TSC.
- **Ruling A-R280-REVIEW-KEY-NAMES:** `clockOffsetMs` and `endpointRule` keep their names, because doc 209 and B's and C's scripts read them.
- **Architecture signal (recorded, not scheduled):** GATE280-ARCH-PAGE-CLOCK-HELPERS (gate signal 3 + A's note). The page-clock helpers move to `perf/lib/page.ts` when a second spec needs them.
- **Timeout data:** B's run, PERF-1a 6.8 min = 45 % → ROOT-REQ-PERF-TIMEOUT, PERF-1A-TIMEOUT-HEADROOM. Neither closes.

**New:**
- **B-R281-RESOURCES-READY-FAILED** (Low signal, narrowed by D-29z657);
- **B-R281-GATE279-S1-PREMISE** (info; origin: the gate reviewer's premise; caught by B's L23 pre-check; counted at RETRO 290).

**Dispatched:** GATE279-S1, B-R280-CLICK-LIVE-LANE-ID, A-R279-REVIEW-LANE-NULL → round 281 (PERF-HARNESS-DIAG-281).

**Lessons (D-29z656):** L38 gains the warm-up clause in place: warm `/studio-lab` once, untimed, after perf builds or mutant runs (2× evidence). The file has 59 lines (cap 60); nothing was retired.

**Also updated:**
- `decisions_log_b` D-29z650…D-29z657;
- STUDIO-PERFORMANCE status, stages and `consults_round_281`;
- `rounds` (280 done, 281 dispatched);
- `feature-status.md` (header, round bullets, the STUDIO-PERFORMANCE row);
- `b-next.json`.

**Backups:** `b-round-280/*-before-281.*`. **Scripts:** `b-round-280/backlog-update.py`, then `backlog-patch-v2.py` (the D-29z657 patch; each runs once).

## 3. Rulings
| D-ID | Ruling |
|---|---|
| D-29z650 | Round 280 closed; b-ii-2, b-ii and b are done; R216 → watch |
| D-29z651 | The gate-280 review and the A/C notes, as in §2 |
| D-29z652 | The round-281 design: patterns built from the app's copy (singular + plural), throw-only errors with two distinct prefixes, lane ids in the click-live detail, null guards. Amended by D-29z657 |
| D-29z653 | Equivalence: oracles C's round-279 runs (1a, 1b-i) and C's round-280 run (1b-ii, the two peak rows ±0.1); the only allowed difference is the two detail keys. Amended by D-29z657 |
| D-29z654 | Docs: new doc 210, plus sections of docs 208, 175, 168, 169 and 209 (L34) |
| D-29z655 | The outcome table |
| D-29z656 | L38 warm-up clause |
| **D-29z657** | **Pre-check finding** (see §4) |

## 4. Pre-check, and the finding that changed the design (L23)
- **Browser probes at `145f6c1`** (dev server, 1440×900, `page.route` abort; `failed-status-probe.json`, `failed-other-probe.json`):
  - a failed demo source shows the failed text in ≈ 1–2.3 s, and it stays stable for 15 s;
  - if the failed source is the selected library item (`/middle-east.mp3`), Add stays `aria-disabled` and no preview waveform is drawn;
  - if it is another item (`/hero-music.mp3`), Add and the waveform become ready.
- **Sketch v1** (only `waitForCollectionReady` + the lane items):
  - the 1a + 1b-i perf run was equivalent to the oracles (0 problems each; click-live `music` → `stems` ×6);
  - **but** the runtime mutant MU-FAILED-SOURCE aborted every pass with `page.waitForFunction: Timeout 90000ms exceeded.`. The 90 s library-ready predicate, present in all three specs, runs first and never resolves. The fix could not fire. Evidence: `head-load-control-partial.json`, `mutants/MU-FAILED-SOURCE/run-v1-killed.log`.
  - B stopped the mutants and widened the design inside the same three items (D-29z657).
- **Sketch v2** (`sketch.diff`):
  - one shared `waitForLibraryReady` in `perf/lib/page.ts`: it checks for the failed status first, then the HEAD condition;
  - all three specs call it;
  - the status-wait change is kept for the non-selected case;
  - tsc rc 0.
  - Measurements: §4a below.
- **MU-NO-OWN-GUARD:** tsc TS2322, as designed.
- **Claims:** `claims.sh` → `claims-output-at-145f6c1.txt` (K1–K20, SW-A…SW-D).
- **Grants:** 11 paths. **Frozen:** 1134 files, `sha256sum -c` rc 0.

### 4a. v2 measurements
- **Perf run:** `3 passed (13.3m)`; 1b-i 5.1, 1b-ii 1.1, 1a 6.8 min.
- **Equivalence:** 1a 0 problems (316/166), 1b-i 0 problems (144/106), 1b-ii 0 problems and 0 tolerated (61/37) (`v2-equiv.txt`).
- **Click-live:** `music` → `stems` ×6.
- **Mutants:**
  - MU-FAILED-SOURCE: 6/6 passes, one exact problem each (library-ready prefix); 9.2 s for the whole report (HEAD: 90 s per pass).
  - MU-FAILED-OTHER: 6/6, the library-ready prefix (the status settled first); 6.7 s.
  - **MU-STATUS-WAIT** (added): it proves the status-wait branch, 6/6 with `after load: demo collection failed: …`; 7.0 s.
  - MU-NO-OWN-GUARD: TS2322.

The design now holds on every path B could measure.

## 5. Architecture checkpoint
No new request. This is a test-only harness round, and it reduces duplication: three copies of the predicate become one helper.
- PERF-HARNESS-SHARED-LIB-b is a finished feature boundary. Its signals (A-R279-ARCH-IDLESETTLE-ROLES, GATE279-ARCH-COPY-STRINGS, GATE280-ARCH-PAGE-CLOCK-HELPERS) are small test-harness items. They do not justify a frontend-architect checkpoint before the PERF-2 app work.
- ARCH-CHECKPOINT-SYS5-SOFT-DISABLED stays optional and non-blocking.
- Before PERF-2 (the first app-code PERF task), B consults `performance-optimizer` and `tech-lead` and re-measures, as the policy requires.

## 6. Next
- **If C passes and the gate publishes:** round 282 = REGRESSION if its planning falls on or after 2026-11-02 (`regression-last.json`), otherwise PERF-2 (consults first).
- **After that:** PERF-3 … per `execution_order_d29z645`. RETRO at round 290.

## 7. Commit readiness
Rounds through 280 are published (`145f6c1`). Round 281 becomes ready for the gate after C PASS; it is test-only.
