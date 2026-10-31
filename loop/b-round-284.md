# B round 284 → 285 planning

**Decision: CONTINUE.** Round 285 = **PERF-3b**: the seconds ruler renders only the three-viewport page window, and a Follow page flip updates both rulers before paint. It is stage 2 of 3 of PERF-3. Task: `current-task.md`. Archive of the round-284 task: `tasks/round-284.md` (a copy, byte-identical before the rewrite).

## 1. What closed (evidence only)
- **Round 284, PERF-3a: C PASS.**
  - `c-round-284.json`: `taskStatus` PASS, `browserVerified` true, `realVerified` true, 13 rows passed, ZOOM-TIMING `record`. The one blocked sub-check is the real backend's 401/403 (cloud).
  - `gates/gate-round-284.json`: `published`, commit `0f99960`, both remotes equal.
  - **PERF-3a is მზადაა** (D-29z681). PERF-3 stays **მუშავდება**.
- **A's L10 ruling request** (`a-round-284.md`) is ruled in D-29z682. A-R284-REVIEW-NEG-LOOP (C reproduced it, `c-round-284/neg-loop.txt`, rc 124) and A-R284-REVIEW-ZQ3-VACUITY go to `deferred_low_polish`, because round 285 does not own those files (2026-10-23 bug gate). C's note on the §2.1 prose is acknowledged.
- **No Critical, High or Medium finding is open from round 284.**
- **REGRESSION is not due.** `regression-last.json` = 2026-10-30, so the next one is due on or after 2026-11-02. RETRO is at 290.

## 2. Measurements for PERF-3b (L37 premise re-measure)
All the evidence is in `b-round-284/`; `current-task.md` §1 holds the numbers.
- **HEAD `0f99960`** (production build, 30 clips): the ruler has 6,143 elements at 40 px/s and 12,286 at 122.1 px/s. Event Timing on that key is 112 ms (1440) and 160 ms (1280).
- **B's sketch:**
  - the ruler has 94 / 78 elements at the start;
  - Event Timing is 16–24 ms on the `in` keys;
  - 28 of 28 ruler screenshots per viewport are pixel-identical to HEAD;
  - 0 visible ticks are missing at any step or jump;
  - Follow idle causes 0 churn.
- **B found a painted one-frame gap** on Follow page flips (`flip-probe.cjs` with a post-frame check), measured on the seconds ruler of B's first sketch. The bars ruler at HEAD probably has the same gap with a tempo (the same page key and notification); that is **inferred, not measured**. SR6 proves the fix for both rulers in jsdom. Cause: the Follow writer sets `scrollLeft` inside a position-store callback, and the page key updates only on the next frame's scroll event.
  - Fixed in the sketch with one `notifyTimelineScroll()` call: 0 gap frames over 18 flips, in 4 runs.
  - Recorded as B-R284-FOLLOW-FLIP-GAP (Low, scheduled into round 285).
  - The earlier rAF-based check missed it. It is recorded as a lesson candidate for RETRO 290 (D-29z689).
- **Scratch results:**
  - 69 covering files / 1,261 tests pass, tsc 0, Biome clean;
  - mutants HEADRULER and W1–W7 are each red at their rows (`mutants.txt`);
  - `sketch.diff` + `sketch-sha256.txt` (6 files);
  - the patch dry-runs cleanly on HEAD;
  - the claims (`claims-285.sh`, `claims-285-output.txt`) match on HEAD and on a `git archive` (except K1).

## 3. Consults (read-only)
- **`tech-lead`:**
  - Option (a): move the three private helpers into `view.ts`, and add `timelinePageWindow` and an optional window on `rulerTickMarks`.
  - The new ruler props are optional, because `view.test` mounts the ruler without them.
  - No checkpoint is needed: the seconds ruler is not a fourth consumer of `getTimelineView`.
  - The only test risks are the `view.test` mount and the perf `res.dom.ruler-1/2` record rows.
  - **Adopted.**
- **`performance-optimizer`:**
  - Build an index range instead of building and filtering every tick (**adopted**).
  - Gradient lines save nothing (agreed).
  - One commit per zoom step holds through `pendingViewRef` (B confirmed with SR4).
  - `play.idle-commits` is unproven for page flips (B measured it with FOLLOW-IDLE and found the flip gap).
  - Keep p95 < 50 as a record row or on a median (**adopted**: record in 3b, decided in 3c).
  - Its capped fallback for an unknown viewport was **rejected** (D-29z684, reasons in the task).
- **Advisor:** available and consulted twice: once before the approach, and once at completion. The completion call raised the unmeasured bars-ruler premise, the advisor count, the flip floor, the stale lines in doc 212 and a dead line in `mutants.py`; all are fixed. The first call covered (housekeeping order, baseline move, L10 ruling, measuring idle commits before choosing the window, the unknown-viewport fallback, visual parity rows, sweeps, the stage split and doc 212 l.4).. Everything it raised is applied in the task.
- **Not applicable:** reference-first, AGREE, `product-designer`, the screen budget and the Ableton table (pure performance round, D-29z688). `oss-adoption.md` has no ruler entry, so no new dependency is needed.

## 4. Scope and order
- **PERF-3 split (D-29z685):** 3a done → 3b (round 285) → 3c (harness rows: Event Timing p95 per zoom key, path rewrites, ruler nodes per key, the Ctrl+wheel baseline, the `res.dom.ruler` notes; the exit target p95 < 50 ms with 30 clips; doc 212/213 → Completed). Nothing is dropped; the exit target only moves to the stage that owns the harness.
- **Next after round 285:** REGRESSION if planned on or after 2026-11-02, then PERF-3c, PERF-COMMIT-RESCHEDULE, PERF-4… per `execution_order_d29z645`; RETRO at 290.
- **Architecture signal:** ROOT-R70-ARCH-TIMELINE-TRIO is updated (D-29z687). No checkpoint request; the `tech-lead` reasoning is recorded.
- **Publication:** round 284 is already published (`0f99960`). Nothing from round 285 is ready for a commit until C PASS.

## 5. Files B changed (planning artifacts only)
- `current-task.md` (round 285);
- `tasks/round-284.md` (archive copy);
- `backlog.json` (version 248; `b-round-284/backlog-update.py`, plus B-R284-FOLLOW-FLIP-GAP; backup `b-round-284/backlog-before-285.json`);
- `feature-status.md`;
- `b-next.json`;
- this report;
- `b-round-284/` (probes, results, shots, sketch diff, sha256, claims, mutants, covering list, checkpoint).

The store worktree is clean at `0f99960`. B's servers are stopped, and the :5173 dev server was not touched. Scratch is in `/tmp/b284`.

## 6. Lessons
`lessons.md` is unchanged (D-29z689). The round-284 events are covered by L29 (claims) and L37. One lesson candidate is queued for RETRO 290: the post-frame probe for painted-state checks.
