# B round 339 → 340 planning

**Date:** started 2026-11-04 at 23:20 UTC, finished 2026-11-05 at 00:1x UTC.
**Decision:** CONTINUE.
**Next task:** round 340 = **REGRESSION-ROUND-2026-11-05** (`current-task.md`). The round-339 task is archived as `tasks/round-339.md`, byte-equal to that round's `current-task.md`.
**Then:** round 341 = PERF-DRAG-PREVIEW c4-ii. It is already sketched, measured and reviewed: `b-round-339/current-task-c4-ii-draft.md`.
**Advisor:** available and consulted three times: after orientation, at the date boundary (the pivot to the regression) and before the final hand-off.

## 1. Round 339 result (from C's evidence only)
- `c-round-339.json` is PASS, with `browserVerified`/`realVerified` true and 0 bugs. Its 10 rows are CLAIMS, SOURCE-SCOPE, PERF, PREMISE, MUTANT, GROUP-NAMES, HARNESS-READ, PERF-LIB, G339-AUTH and DOCS; the 6 gate rows are not claimed.
- Gate 339 is `published` as `99a5912` on both remotes, so that is the baseline. `context/head-sha.txt` still shows `662ed42`, which is stale.
- **Stage c4-i → done (D-29z1049).** The backlog was updated only from this evidence.

## 2. Notes routed (D-29z1050)
- **To `deferred_low_polish`:** A's reviewer Lows (E-GHOST-ORDER, LANE-NOTE-ORDER, OVER-UNDO, NULL-SETUP) and gate 339 #1–#3 (GATE339-S1/S2/S3).
- **A-R339-REVIEW-TEARDOWN-ABORT** was a Medium on B's sketch. A fixed it and C confirmed the fix. It is closed and kept as an L58-class RETRO input.
- **Architecture notes** → signal ARCH-R339-DRAG-MEASURE-EXTRACT, not scheduled.
- **GATE338-S3** is closed as fixed in round 339.

## 3. Why the regression now (D-29z1051)
- `regression-last.json` is 2026-11-02 (round 301). Six earlier D-IDs fixed "the first planning on or after 2026-11-05".
- This planning began on 2026-11-04 with c4-ii as its target. The UTC date rolled over before the task and backlog were written, so the rule makes round 340 the regression. The c4-ii work is not lost; it moves to round 341.
- The regression task (`current-task.md`):
  - follows `tasks/round-301.md` §2–§10;
  - adds §4d, one short row per item finished in rounds 302–339;
  - names all 20 `scope_additions` (SA-1…SA-20, L6). That includes the first browser regression of the c3-ii source change (R340-CROSS-LANE) and the c4-i group premise;
  - runs RR-PERF alone, with both liveness rows, then RG-SMOKE and G340-AUTH;
  - fixes the outcome in advance (§7).

## 4. c4-ii package, ready for round 341 (D-29z1052…D-29z1056)
- **The sketch** (`b-round-339/sketch/`):
  - `ArrangementClip.tsx`: the group branch previews through the store (`previewGeometry`), except for groups with a video-track clip, which keep the HEAD path until c5;
  - `StudioWorkspace.tsx`: the collapsed group header reads the preview store.
- **The collapsed-overview case is real.** Ctrl+A selects clips on collapsed lanes. B's browser probe at HEAD (:5173) and on the sketch's production build (:5192) gives the same result at both viewports: the hidden block reads 0 → 3.000 mid-drag → 3.000 → 0.000 after Undo. Without the reader change the overview freezes (MU-OVERVIEW-COMMITTED: only DP54 red).
- **Tests:**
  - DP51–DP56 are new;
  - GS5b's two mid-drag reads move to the shown state, with 3 new asserts and no assertion removed;
  - 23 affected suites pass, 561/561;
  - on HEAD, DP51/52/54/56 and GS5b are red and DP53/55 green;
  - MU-VIDEO-STORE turns only DP53 red.
- **Consults** (`b-round-339/sketch-review.md`):
  - `tech-lead`: no Critical or High. TL-3 (a Medium test gap) became DP56. TL-1 and TL-2 are HEAD-equal edge cases and became signals.
  - `performance-optimizer`: agrees with the asserted set (10 rows).
- **Carry-forward note** at the top of the draft: re-check if HEAD moves, re-point K1, renumber 340 → 341, regenerate the budget-note round number.

## 5. Architecture checkpoint request (for root)
`ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE` is planned for the close of PERF-DRAG-PREVIEW, after c5 passes C. Root calls the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md`. It does not block c4-ii or c5.

Questions (keep or extract, with value, risk and at most three sentences):
1. The per-provider store contexts (ARCH-R338-STORES-PROVIDER).
2. The size of `ArrangementClip`'s gesture handler, and its group and single-clip branches.
3. The perf harness drag measurers (ARCH-R339-DRAG-MEASURE-EXTRACT, ARCH-R337-PERF-HELPERS-TO-LIB).

## 6. Final c4-ii perf numbers (alone, L38)
- **Final sketch with the c4-ii budgets** (`b-round-339/perf-sketch-final-results/`):
  - rc 0, `complete` true, `failures` [], 219 rows, **55/55 asserts**;
  - vs c-round-339: 149 EQUAL / 8 DIFF / 0 NEW. The DIFF rows are group per move 74.781 → 26.969 (×4) and max 106 → 104 (×4);
  - wallclock: lane window 35.45, cross window 14.
- **MU-HEAD-SOURCE** (HEAD source + the c4-ii budgets; `b-round-339/perf-mutant-head-source/`): rc 1, 51/55. Exactly the 4 `move-components-per-move` asserts fail, at 74.781 > 27.

## 7. Environment notes (D-29z1057)
- **Shared Vite cache.** B's sketch dev server on :5191 shared `node_modules/.vite` through the scratch symlink and re-optimized it. Root's :5173 was re-checked afterwards with B's probe: it loads and shows no page errors. The task now forbids a second dev server on a symlinked tree.
- **One perf run invalidated by B.** B's own `pkill` killed one of its perf mutant runs. That log is kept and marked as environment-invalid (`perf-mutant-head-source-killed-by-B.log`). The final runs above ran alone.
- **Shared runs.** Two earlier sketch perf runs shared the machine with B's vitest runs. They are recorded but are not the cited evidence.

## 8. Status and remaining scope
- **PERF-DRAG-PREVIEW:** a, b, c1, c2a, c2b-i/ii/iii, c3-i/ii and c4-i are done. c4-ii is ready for round 341. c5 has not started.
- **Remaining, in queue order:**
  1. REGRESSION-ROUND-2026-11-05 (round 340);
  2. PERF-DRAG-PREVIEW c4-ii and c5;
  3. PERF-9…15, PERF-4b/4c, SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM;
  4. STEM-LANES and SRW-21-PLAN;
  5. SYS-1…3;
  6. STORE-2b…5 (direction gate);
  7. COPY-PD and REVIEW-RECOMMENDATIONS;
  8. T12-ADVANCED;
  9. phase 2 (user go-ahead gate) and the three later entries;
  10. `deferred_low_polish`;
  11. SRW-21 (`deferred_user`).
- **Commit readiness:** nothing to publish from this planning. Round 340 changes no source by design.
