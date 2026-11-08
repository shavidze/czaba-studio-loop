# B round 416 → 417 planning (2026-11-08)

**Decision:** CONTINUE. **Next:** round 417 = SYS-CLOCK-DETERMINISM (test-only), D-29z1450…D-29z1453.
- **Advisor:** available, and used after orientation (bookkeeping order, the helper ruling, per-row kinds, L58 mutants). A final check was requested after the files were written.
- **Consults:** none. This is a test-only round, so reference-first and `product-designer` do not apply, and the helper ruling did not need `tech-lead` because the helper stays frozen.

## 1. Accepted from independent evidence
- **C round 416: PASS** (`c-round-416.json`): 11 rows passed, `browserVerified`/`realVerified` true, 0 app bugs. The only BLOCKED row is the fake-bearer path (backend unavailable in the cloud). → **RETRO-416 is done (მზადაა)** (D-29z1450).
- **Gate 416: `skipped`** ("no real changes"). Gate 415 is `published` at `344a59f`. `git rev-parse HEAD` = `344a59f`, and the tree is clean. **The round-417 baseline stays `344a59f`.**
- **REGRESSION not due:** `regression-last.json` is 2026-11-07 (round 390), so the next one is due on or after 2026-11-10. `regression-last.json` is unchanged.
- **C-R416-CLAIMS-K22-ARCHIVE** (Low, environment, B's own claims script) is recorded and **fixed in B tooling now** instead of being deferred (D-29z1451):
  - `claims-417.sh` K14 also reads `archive/findings-archived.json`;
  - L56 gains one clause;
  - it closes when C round 417 row 1 shows K14 with empty stderr.
- `tasks/round-416.md` is a byte copy of the round-416 task (K13 `identical`). Before-copies: `b-round-416/*-before-417.*`.

## 2. Round 417 task (`current-task.md`)
- **Scope:** EN10, VDS3, SF11, IM24 and BW5 in 5 test files, plus doc 268. Both helpers and all runtime code are frozen (1,311 entries). It closes GATE77-S4-EN10-CLOCK, GATE148-S2-VDS3-WALLCLOCK, A-R388-REVIEW-L4-SF11-REAL-CLOCK, A-R415-REVIEW-L1-CALLSITE-FLAG, C-R326-01 and ROOT-R70-L4-BW5-WALLCLOCK.
- **Rulings (D-29z1452):**
  1. The entry's "helper unchanged" and `note_d29z1442` conflicted. **Resolved:** the helper stays unchanged. SF11 already gets `fakeClock` from it, and the other three files have local fakes, so convergence stays signal SIG-R415-WORKSPACE-ENV-CONVERGENCE.
  2. Each row has its own clock method.
     - **VDS3 needs fake `Date` and `performance`.** B's probe showed that freezing `Date.now` alone never reaches `play`, because the dock steps on `performance.now()`. The advance must be exactly 50 ms; with 100 ms, `play` is not called.
  3. **IM24 now asserts the end-stop**, which is the browser's behaviour (C-R326-01, origin B spec).
  4. **BW5's `elapsed < 100` is replaced by a deterministic read count (≤ 1,000).**
     - HEAD reads the window 442 times; the full-build mutant reads it 6,784,880 times.
     - The old 180–240 count bound does not catch a full build.
- **Sketch evidence (L58):**
  - `b-round-416/sketch-417.patch.txt` (sha `70a75d98…`) gives 63/63 (`sketch-run.log`). Biome on the 5 files is clean. On the scratch, `npm run typecheck` is rc 0 and `npm run lint` is rc 0 with 205 warnings and 1 info, the same as round 415 (`precheck-typecheck.log`, `precheck-lint.log`).
  - 6 mutants × HEAD/sketch, all as designed (`mutants/summary.txt`, `reasons.txt`). After the advisor's final check, `run.py` gained a guard that asserts the scratch base is HEAD. It was re-run on a fresh `git archive HEAD` scratch, and `summary.txt` is byte-identical.
  - Claims: planning and sketch stderr are both empty; the diff is K1, K5 and K10 only (`claims-417-planning-vs-sketch.diff`).
- **C's browser rows:** IM24-BROWSER (the end-stop contract the test now pins), a Play/Stop smoke and AUTH, each at 1440×900 and 1280×720. The full suite is a gate row.

## 3. Schedule (D-29z1453, unchanged order)
417 SYS-CLOCK-DETERMINISM → SYS-R416-PREVIEW-CONTROLLER → SYS-R369 (L46 default, queued before STEM-LANES) → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule).
- REGRESSION-2026-11-10 goes first at the first planning on or after 2026-11-10.
- The next RETRO is at round 431 or at the end of STUDIO-PERFORMANCE.

## 4. Architecture
No new checkpoint request.
- This round is test-only, on one owner (`__tests__`), and the helpers are frozen.
- The signals are unchanged: SIG-R414-R2-FAKE-SCENARIO and SIG-R415-WORKSPACE-ENV-CONVERGENCE. With this round, 3 more files keep local fakes, so it stays a candidate for one bounded test-only round after STUDIO-PERFORMANCE.
- ARCH-CHECKPOINT-DECODE-REGION stays open for root.

## 5. For root
- **Publish:** nothing new from round 416 (gate skipped; no source change). After C PASS in round 417, the round-417 diff (5 test files + doc 268) is ready for the gate.
- Unchanged open root items: ROOT-REQ-PLAYWRIGHT-FIREFOX (TLM-PERF15-FIREFOX, Saba question, RETRO 431) and ROOT-REQ-VITEST-PERF-INCLUDE (GATE304-M1).
- **Loop tooling note:** C's mutant row writes into `<arg2>/mutants/`. The task tells C to pass a copy of `b-round-416/`, so B's evidence is never overwritten.

## 6. Files written (B-owned only)
- `b-round-416/`:
  - `make-sketch.py`, `sketch-417.patch.txt`, `sketch-417.sha256`, `sketch-run.log`;
  - `mutants/` (`run.py`, 12 logs, `summary.txt`, `reasons.txt`), `probe/vds3-advance.md`;
  - `grants-417.txt`, `r417-frozen-sha256.txt`;
  - `claims-417.sh` and its planning/sketch outputs, stderr and diff;
  - `update-backlog.py` (`.done`), `update-feature-status.py` (`.done`), `lessons-diff.txt`, `checkpoint.md` and the before-copies.
- Loop folder: `tasks/round-416.md`, `current-task.md`, `backlog.json` (v392 → v393), `feature-status.md`, `lessons.md` (60 lines; L56 + 1 clause), `b-next.json`, and this file.
- No app source was edited. The scratch copy is outside the store (`/tmp/b416-scratch`).
