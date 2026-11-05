# B round 348 → 349 planning

**Decision: CONTINUE.** Round 349 = PERF-CAND-VIDEO-TRIM-FADE-ROWS (`current-task.md`; D-29z1106…D-29z1110; backlog v310 → v311). The task adds 22 `record` rows for a video clip's trim-start and fade-in drags to the interactions harness.

## For root (read first)
1. **ROOT-REQ-PERF-TIMEOUT is overdue (L46; D-29z1108).**
   - **The request:** in `store/playwright.perf.config.ts` l.10, change `timeout: 15 * 60 * 1000` to `timeout: 25 * 60 * 1000`. It is one `chore(perf)` line on master. The full text is in `b-round-278-root-request-perf-timeout.md`.
   - **Overdue:** it has been open since round 278, through 4 RETROs with no answer.
   - **Evidence that the bound is crossed:**
     - C round 348: 454664 ms; A round 348: 453013 ms.
     - B's HEAD control at this planning: 459503 ms.
     - B's sketch with the video trim/fade rows: 496938 ms.
     - The L31 bound is 450000 ms.
   - **Effect now:** round 349 is accepted under an explicit ruling (A STOPs above 540000 ms). After round 349, **no further interactions-spec rows are added** until this lands or the spec is split.
   - **Deadline:** RETRO 351. If it is still open then, it goes to Saba as one question.
2. **ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is still wanted (non-blocking).** There is still no answer artifact. Its question 3 (the shared drag measurers, ARCH-R339-DRAG-MEASURE-EXTRACT) now also decides whether the interactions spec can be split. Question 3 also covers ARCH-R348-DP-GESTURE-CYCLE. The questions are in `b-round-339.md` §5 and D-29z1093.

## 1. Round 348 close-out (D-29z1106)
- **C round 348: PASS.** `browserVerified`/`realVerified` true, 10 rows, 0 bugs, 0 blocked (`c-round-348.json`).
  - PERF: 70/70 asserted, 0 NEW, 0 DIFF against C347.
  - C's own mutant (memo removed from `ArrangementMixFader`) was red on exactly the 10 rows C predicted.
  - G348-AUTH and DRAG-SMOKE pass at both viewports: purchase protection holds, and `/studio-lab` opens anonymously.
- **Gate 348:** `published` `70751a5` on both remotes. This is the baseline for round 349.
- Stage conversions → done. The task was archived as `tasks/round-348.md`, and backups are in `b-round-348/*-before-349.*`.

## 2. Routing (D-29z1107)
- **To `deferred_low_polish`,** both joined to ARCH-R348-DP-GESTURE-CYCLE:
  - GATE348-S1 = A-R348-REVIEW-L1 (the second `pointerUpAt` in `finally`);
  - GATE348-S2 (`finally` skips `undo`).
- **closed_info:** GATE348-S3, S4 and S5; A-R348-REVIEW-INFO; C-R348-PERF-DURATION (counted as evidence for the root request).
- **Architecture signal, not scheduled:** ARCH-R348-DP-GESTURE-CYCLE (a `runGestureCycle` helper). It joins ARCH-R346-DP-HARNESS-EXTRACT and checkpoint question 3.

## 3. Round 349 shape (D-29z1108, D-29z1109)
- **The change (3 files, applied as patches):**
  - The spec's `dragTarget` gets a `kind` argument, and the 1× video block runs move, trim and fade, stopped and then playing.
  - 22 `record` rows are added. Rows go from 230 to 252, and asserted rows stay at 70.
  - Doc 232 gets a new section.
- **B's runs** (production, alone, same machine; `b-round-348/perf-summary.txt`):
  - HEAD control: 70/70, 459503 ms.
  - Sketch: 70/70 and 22 NEW, all expected. 0 existing deterministic rows differ from C348. Both liveness rows are 1 in 3/3 passes, and every new deterministic row is identical in 3/3. The run took 496938 ms.
  - Video trim: 18.683 per move, max 19, release 1, release-restarts 31.
  - Video fade: 8.85 per move, max 9, release 2, release-restarts 31.
- **New candidate: PERF-CAND-VIDEO-TRIM-FADE-COST.** Video trim is above the item's ≤ 15 target, and video fade costs more than twice the audio fade (3.933). PERF-DRAG-PREVIEW therefore stays in progress.
- **Consults:**
  - `tech-lead` reviewed the sketch (L58). It found M1: the grab depends on the scroll. M1 is ruled with no change: 6/6 grabs were live in all 3 passes, a failure aborts the pass loudly, and adding Home would change the setup of the asserted move rows. Its L2 (a typo) is fixed.
  - The advisor was available and consulted once before writing.

## 4. Order after 349
1. 350: PERF-CAND-VIDEO-TRIM-FADE-COST (a names probe first, then a fix or asserts at the measured values). If the ARCH checkpoint has answered by then, round 350 is PERF-CAND-MASTER-GROUP-FADER-PROPS instead.
2. **RETRO 351** (window 336–350).
3. PERF-CAND-MASTER-GROUP-FADER-PROPS / the project-end crossing.
4. PERF-CAND-FADE-RELEASE-COMMITS.
5. PERF-9…15.
6. SYS-R2-FAKE-FIDELITY.
7. SYS-CLOCK-DETERMINISM.
8. STEM-LANES.
9. SYS-1…3.
10. STORE-2b…5.
11. REVIEW-RECOMMENDATIONS.
12. T12-ADVANCED.
13. The phase-2 entries (skip rule).

REGRESSION is due on or after 2026-11-08.

## 5. Readiness for publication
Round 348 is already published. Nothing in this planning step changed source, and `store/` is clean (K2 `70751a5 0`). The scratch trees are outside `store/`: `/home/runner/b348-scratch/{sk,head}`.
