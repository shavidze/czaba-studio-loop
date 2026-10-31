# B round 294 → 295 planning

**Date:** 2026-10-31. **Decisions:** D-29z738 to D-29z745. **Next task:** `current-task.md`, round 295, SYS-VACUOUS-ROWS. The round-294 task is archived as `tasks/round-294.md` (copied, not moved; `cmp` equal).

## 1. Evidence read
- **C round 294** (`c-round-294.json`, `c-round-294.md`): **PASS**.
  - 9 of 9 rows pass and 0 fail. `browserVerified` and `realVerified` are both true.
  - The browser rows were B-MARKER (1440, 1280 and 390, plus `/` and `/store`), B-DESK-SAME (0 px against HEAD rendered in the same job) and G294-AUTH.
  - 1 Low: A-R294-REVIEW-L-DOC-FILELIST. 5 INFO items.
- **A round 294** (`a-round-294.md`): no STOP. It changed exactly 3 paths. The code-reviewer scored 9/10 and gave no Architecture note.
- **Gate 294** (`gates/gate-round-294.json`): **published**, commit `bc85a1a`, with matching hashes on both remotes.
  - `verify.log`: 226 test files and 3385 tests pass.
  - `gates/round-294/review.md`: COMMIT OK, score 8/10. Findings 1–6 are Low (finding 1 is rated "Low–Medium"), finding 7 is info, and it adds an Architecture note.
- **Baseline for round 295:** HEAD `bc85a1a`, clean tree.
- **Regression:** `regression-last.json` is 2026-10-30 (round 258), so the next regression is due on or after 2026-11-02. Round 295 is **not** a regression round. `regression-last.json` is untouched.
- **RETRO:** next at round 305.

## 2. Backlog updates (C and gate evidence only)
- **FIX-PD-1c, FIX-PD-1c2 and FIX-PD-1c3 → done** (D-29z738). The evidence is C round 294 PASS with `browserVerified` true, plus gate 294 published. F8 is closed.
- **Closed:** GATE293-T1, INFO-C293-DOC-L21 and A-R292-REVIEW-L-TH4-TITLE. C-R292-01 is published.
- **New in `deferred_low_polish`** (D-29z739, under the 2026-10-23 bug gate):
  - A-R294-REVIEW-L-DOC-FILELIST;
  - GATE294-R1-NARROW-EXIT-TARGET;
  - GATE294-R2-RENDER-REF;
  - GATE294-R4-VIEW-RESET-DOC;
  - GATE294-R5-NG10-MID-DRAG;
  - GATE294-R6-LRS4-TIMEOUT.

  The doc-218 items form the bundle candidate DOC218-POLISH.
- **Gate finding 1, ruled on a measurement:** B ran Playwright at 390×844 and 360×740 (`b-round-294/probe/tap-result.json`).
  - The exit link is 71×20 px, and the nearest other target is 158 px away.
  - So the WCAG 2.5.8 spacing exception is met, and the finding is **Low**, not Medium. It does not pre-empt new scope.
- **Architecture:** gate finding 3 and the gate's note (an explicit `stopPlayback`) are merged into signal **A-R293-ARCH-SILENCE-ALL** (D-29z740). Not scheduled.
- **INFO rulings** (D-29z741):
  - The desk-sameness method becomes "0 px against HEAD rendered in the same job".
  - The missing Store `<main>` becomes a STORE-2 acceptance addition.
  - The dev stack trace from the token route becomes a risk line in SRW-21-PLAN.
- **Status updates:**
  - SYS-VACUOUS-ROWS and its 4 Lows are marked dispatched (round 295).
  - ROOT-REQ-VITEST-PERF-INCLUDE is re-raised (D-29z743).
  - The `rounds` list gets the round-294 result and the round-295 entry.

## 3. Round 295 in one paragraph
SYS-VACUOUS-ROWS (D-29z742) fixes in one test-only round the four Lows whose rows no mutant could make fail:
- **DW12/DW12b:** the stall timer is cleared on all 5 finish paths.
- **SD10:** a standalone `ArrangementTempoRow` with a metronome spy, plus a positive control that has a tempo.
- **ZQ3:** `expect(before).toBeTruthy()`.
- **LOAF1:** `harness.loaf-scripts` needs an entry with a non-empty `scripts` array. The in-page part stays inline because `addInitScript` serialises the function. The decision itself is a node-side pure function.

**B's scratch pre-run** (`/tmp/b295-scratch`; the store was untouched):
- 4 app files and 85 tests pass, and the perf `report.test.ts` passes 23 of 23 through a scratch config.
- `tsc` gives rc 0, and Biome is clean.
- All 4 mutants are red.
- **Vacuity controls:** HEAD's UI12 stays green under the wrapper mutant, and HEAD's ZQ3 stays green under the no-polyline mutant. That proves the original gaps were real.
- **Real Chromium:** LoAF entries come both with `scripts` and with an empty `scripts`, so the new rule is necessary and satisfiable.
- The row id `LS1` collided with `collection-load-status` LS1 and was renamed `LOAF1`. That collision is why the K9 claim exists.

**C's rows:** CLAIMS, SOURCE-SCOPE, TYPECHECK, UNIT, UNIT-PERF, UNIT-MUTANTS, B-LOAF-REAL (raw browser probe at both viewports), B-PERF-LOAF (one real PERF-1a run), G295-AUTH and DOC-219.

## 4. Ready for commit?
**Round 294:** already published by root as `bc85a1a`. **Round 295:** after C PASS and the gate, root publishes the 8 paths.

## 5. Order after 295 (D-29z745)
REGRESSION if round 296 is planned on or after 2026-11-02. Otherwise:
1. STUDIO-LINK
2. NAME-AND-HINT
3. PERF-3c and the rest of STUDIO-PERFORMANCE
4. STEM-LANES
5. SYS-1…3
6. STORE-2b…5 (direction gate)
7. REVIEW-RECOMMENDATIONS
8. T12-ADVANCED
9. Phase-2 entries (skip rule)

SRW-21-PLAN stays parallel planning. The RETRO runs at round 305. STUDIO-LINK is user-visible, so its planning needs the reference-first section, a `product-designer` consult and a screen-budget check.

**Architecture checkpoint:** not requested.
- The FIX-PD-1 stage closed at a route-level boundary.
- The only structural notes (`silenceAll` / `stopPlayback`) concern one frozen seam and are kept as one signal.
- No owner shows repeated structural risk.

## 6. Why not COMPLETE or BLOCKED
- **Not COMPLETE:**
  - Most of the queued scope is not done: STUDIO-LINK, NAME-AND-HINT, STUDIO-PERFORMANCE, STEM-LANES, SYS-*, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2.
  - The deferred Lows must all be fixed before final acceptance.
  - SRW-21 is `deferred_user`.
- **Not BLOCKED:** nothing external is missing. The open Saba questions do not block.

## 7. Process
- **Advisor:** available and consulted before writing. It confirmed:
  - the `bc85a1a` baseline and the backlog closures;
  - measuring the tap target before ruling on it, which decided the round;
  - the four row designs, with the LoAF constraints (inline in-page code; LOAF1 is not gate-covered);
  - the L23 sweep.
- **Product consults:** none. This is a test-only round, so reference-first does not apply.
- **Claims:** `b-round-294/claims-295.sh`; its output is `claims-295-output.txt` (K1–K15), re-run after the last edit.
- **Backups:**
  - `b-round-294/backlog-before-295.json`
  - `b-next-before-295.json`
  - `feature-status-before-295.md`
  - `lessons-before-295.md` (`lessons.md` unchanged, 59 lines)
- **Scripts:** the backlog edit script is `b-round-294/update-backlog.py`.
