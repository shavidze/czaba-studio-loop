# B round 329 → 330 planning (2026-11-04)

**Decision: CONTINUE.** Round 330 is the PERF-DRAG-PREVIEW stage c1 fix-up. It covers C-R329-01 (memo the project-end leaf) and C-R329-02 (DP24, the loop extent), and it rewords doc 232 l.4. The task is in `current-task.md` (D-29z954…D-29z961, backlog v289). The baseline is `dae81bf` plus A's uncommitted 4-file round-329 tree.

## 1. Inputs read
- `c-round-329.md` and `c-round-329.json`: **FAIL**, with `browserVerified`/`realVerified` true.
  - Passed: CLAIMS, SOURCE-SCOPE, UNIT ×3, MUTANT, END-LIVE, DRAG-NAMES, D-ROWS (export sha included), C's viewport-bound probe, G329-AUTH and DOCS.
  - Failed: only PERF bullet 2, the equality to round 328.
  - Two Lows: C-R329-01 and C-R329-02.
- `a-round-329.md`: no STOP; the sketch was applied verbatim. Reviewer (9/10): two Low test gaps and an Architecture note ("keep").
- `gates/gate-round-329.json`: **skipped** ("C taskStatus FAIL"). Nothing was published, so the next baseline is still `dae81bf` (gate 328) with A's tree on top.
- `env-status.json`: store 200.
- `regression-last.json`: 2026-11-02. Today is 2026-11-04, so REGRESSION is not due.
- `root-pre-push-review.md` and `publication-checkpoint.json`: their mtime is today, but the content is the old 2026-10-07 review and checkpoints. Nothing new in them.
- The task archive: `tasks/round-329.md` is a byte-equal copy of the previous `current-task.md` (K13). It was made before any edit. Before-copies of the backlog, b-next, feature-status, lessons and the task are kept in `b-round-329/`.

## 2. Backlog changes (evidence only)
- **Nothing is marked done.** Stage c1 is not done: C failed it, and nothing was published (D-29z954).
- **C-R329-01 (Low, origin B spec)** is ruled a fix: `memo` on the leaf (D-29z955). "Accept +1 as the new baseline" is rejected, because it would rewrite a row to fit a result.
- **C-R329-02 (Low)**, which equals A-R329-REVIEW-LOOP-EXTENT, is fixed as DP24 (D-29z956).
- **A-R329-REVIEW-VIEWPORT-BOUND** → `deferred_low_polish` (D-29z957). C's browser probe covers that branch, and it is a row again in round 330.
- **Doc 232 l.4** is reworded so that it no longer pre-claims a C PASS (D-29z958).
- **Signals:** A-R329-ARCH-KEEP and INFO-C329-FULLSCALE (D-29z959). Neither is scheduled.
- **C-R328-01** keeps its status. DP20 was verified by C round 329, and the finding closes when round 330 passes and the gate publishes it.
- `lessons.md` **L58** gains the C-R329-01 clause. It now covers: equality to a prior run is an assert; a new child of a frequently rendering parent is memoised and gets a parent-renders, child-0 row; the inline memo form is not allowed. The file is still 59 lines.

## 3. B's evidence (`b-round-329/`)
- **Sketch:** `sketch/sketch.patch.txt`, two files on a scratch copy of A's tree (`/home/runner/b329-scratch`). `git apply --check` is clean on `store/`.
- **The first attempt used the inline `memo(function ArrangementProjectEndText …)` form.** In jsdom the render log stopped seeing the leaf: DP21 read 0, and DP23 passed vacuously (`inline-memo-attempt.txt`). It was replaced by the file's `XInner` + `memo` convention.
- **The first HEAD-parity run** showed DP23 green against a missing name. DP23 then got a positive control (the leaf renders at mount). In the final parity run, DP21 and DP23 are red and DP24 is green (`head-parity-dp23-24.log`). DP24's red proof is its mutant.
- **Perf, production build, the interactions spec run alone** (`perf-sketch-results/`, `perf-rowcmp-vs-c328.txt`): all 36 asserted rows pass.
  - 113 non-wallclock rows equal round 328: every range, fade, trim, click, zoom and play row.
  - 8 differ, all move record rows: 30.367 per move (from 106.85) and max 108.
- **Browser names probe** (dev :5198): the click commit is [104, 2, 0], equal to HEAD in counts and names. The move commits equal round 329's (`names-compare.txt`). The cold warm-up timed out (an environment issue), and the probe itself completed.
- **Full vitest 3564/3564**, typecheck rc 0, and Biome is clean on both files. Covering set: 119/119.
- **7 mutants, all red on their named rows.** Restored: 26/26.
- **Claims:** `claims-330.sh`, with the planning and sketch outputs saved.
- **Process note:** a `pkill -f "port 5198"` also ended B's own shell for one command. The scratch state was checked afterwards and was intact. No store file was touched.

## 4. Consults and advisor
- **Advisor: available and used** before the ruling. I followed it:
  - memo rather than accepting +1;
  - checking that the render-log heuristic can see a memo child before relying on DP23 (it caught both the inline form and the vacuous parity);
  - restoring the equality clause, not weakening it;
  - a truthful l.4;
  - housekeeping before writing.
- **Project agents:** none consulted. This is a one-line fix-up inside the c1 contract that `tech-lead` and `performance-optimizer` already set at round 328, and B measured it directly. No feature boundary is crossed, so no frontend-architect checkpoint is requested.

## 5. Next
- **After round 330 C PASS:** the gate publishes rounds 329 and 330 together. Stage c1 is then done, and C-R328-01, C-R329-01 and C-R329-02 close.
- **Round 331:** REGRESSION if it is planned on or after 2026-11-05. Otherwise it is stage c2.
- **Commit readiness:** not ready until C passes round 330.
