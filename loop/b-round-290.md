# B — round 290 → 291 planning (2026-10-31)

**Decision: CONTINUE.** Round 291 = FIX-PD-1b2 + RT-FIX-291. The task is in `current-task.md`. The round-290 task is archived as `tasks/round-290.md` (a byte copy, made before any edit).
**Advisor:** available and consulted once, before writing. It confirmed the outcome task 290 §4 had fixed in advance. Its advice was applied:
- the AX-tree pre-probe;
- the A,B,C fixture with a mutant shown red;
- a separate doc 217;
- `regression-last.json` left untouched;
- no new lesson.

## Inputs read
- `context/active-summary.md` (head only), and `tasks/round-290.md` (= the old `current-task.md`).
- `a-round-290.md`: no change; HEAD, clean tree and frozen list all OK.
- `c-round-290.md` / `c-round-290.json`: FAIL on RT-CAUSE only. `browserVerified`/`realVerified` true.
- `gates/gate-round-290.json`: `skipped` (C FAIL), so **the baseline stays `5a911ff`**, the gate-289 commit.
- `gates/round-289/review.md`, `lessons.md`, and the backlog IDs by lookup.

## Backlog updates (only from C's evidence; v251, `b-round-290/update-backlog.py`; before-copy `b-round-290/backlog-before-291.json`)
- **D-29z719: round 290 closed.**
  - C-R290-01 (Low, origin B spec) goes into `open_findings` as "fixed at planning". The fix rewrote retro-290 l.87; see `b-round-290/retro-diff.txt`.
  - INFO-C290-01/02 are noted.
  - `retro_runs` 290 is updated.
  - Nothing is marked done or "მზადაა" on C's word alone: RETRO 290 stays "მოწმდება (RT-FIX)".
- **D-29z720: FIX-PD-1b2 dispatched** (GATE289-S1/S2/S3 and A-R289-REVIEW-L2 marked dispatched). Ruling: the reviewer's `key={results[run.start].id}` covers only one of the two focus-loss cases (B-R290-S3-FIRST-ID-KEY-PARTIAL, info). The task requires the behaviour, LG8 with both cases, and B's sketch uses a label+occurrence key.
- **D-29z721:**
  - New Low **B-R290-LIB-SHAPE-SWITCH-FOCUS** → `deferred_low_polish`. It is pre-existing: switching between the grouped and flat branches remounts the focused option, and the demo cannot reach it.
  - Retro candidates RC-R290-AX-TREE-ROW and RC-R290-L50-MULTILINE-TERNARY: the L50 regex missed the l.660 ternary, which B added by hand.
  - A-R289-ARCH-GROUP-RUNS stays a signal.
- **D-29z722:** the order is unchanged.

## B pre-check evidence (`b-round-290/`)
- **AX probe at HEAD,** `probe/ax-before.json`: each group has 1 extra generic/text child, 2 per viewport.
- **Sketch,** on a scratch server at :5174 with its own `cacheDir`, `probe/ax-sketch.json`: 0 extra children, names unchanged, list bbox identical at both viewports.
- **Scratch `git archive 5a911ff`:**
  - tsc rc 0, Biome rc 0;
  - 15 files / 258 tests pass;
  - mutants M1 (HEAD key) and M2 (first-id key) are red on LG8, and M3 (no `aria-hidden`) is red on LG9.
- **Claims:** `claims-291.sh` produces `claims-291-output.txt`, with K13 checking that the artifacts exist (L56). The store tree was clean before and after (K2 0); the scratch copy and the 5174 server lived outside `store/` and were removed.

## Why not COMPLETE / BLOCKED
- **Not COMPLETE.** Open work: FIX-PD-1b2 (2 Mediums), FIX-PD-1c (F8 Medium), STUDIO-LINK, NAME-AND-HINT, STUDIO-PERFORMANCE, STEM-LANES, SYS-1…3, SYS-VACUOUS-ROWS, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries, `deferred_low_polish` and the Saba/Tech Lead manual items.
- **Not BLOCKED.** Nothing external is missing.

## Commit readiness (for root)
- **Store:** nothing to publish from round 290. Round 291 publishes after C PASS and the gate.
- **Loop state:** the corrected `retros/retro-290.md` l.87 and the B artifacts can go in the loop-state commit.

## Architecture checkpoint
None requested: one small change on one owner. A-R289-ARCH-GROUP-RUNS stays a backlog signal.

## For Saba (unchanged, non-blocking)
- SABA-Q-LIB-SINGLE-RUN together with SR-275-6;
- SR-290-1…10;
- TLM-R274.

## Final check (advisor, second call)
The advisor's second review led to these changes:
- K16 now matches the `it.each` LG8 form.
- K19 tags the testids and strings the browser rows rely on (L29).
- K13 now covers 21 paths, including the probe PNGs and `claims-291-output.txt` (L56).
- A Deliverables section (§9b) is added.
- The K12 post-edit tolerance is now written into the task.

`claims-291.sh` was then re-run, and its output equals `claims-291-output.txt`. The store tree had 0 changed paths.
