# B round 421 → 422 planning (2026-11-09)

**Decision: CONTINUE.** Next is round 422: SYS-2 stage 1, a held Enter on the transport and on a marker flag (`current-task.md`).

**Advisor:** available and used twice, after orientation and before close. The close call found four gaps, and all four are fixed:
1. The first mutant harness re-applied the whole sketch after every mutant, which appended the HE block again each time (up to 53 tests in one log). The summary lines were right, but the logs were inflated. `run.py` now commits the sketch once and runs `git reset --hard` after each mutant. Every log shows 17 tests (K17 `logs-17-tests 7`), and `summary.txt` is byte-identical.
2. `compare.py` asserted more than row 4 states. It now checks exactly row 4: the first press acts, nothing changes on hold, and there are 0 page errors.
3. Row 2's patch-shape claim is now explicit: 3 files, 0 removed test lines.
4. The Reference section made an unsourced claim about Live. It now says that no Ableton reference was searched, and why.
**Consults:** `tech-lead` reviewed the sketch (`b-round-421/sketch-review.md`, approve-with-lows). Its three Lows were fixed in the sketch. No other consult was needed: nothing user-visible changes, and there is no perf budget.

## 1. Round 421 is accepted, from C's evidence only (D-29z1471)
- **C PASS** (`c-round-421.json`): 8 rows passed, 0 bugs, `browserVerified` and `realVerified` true. The fake-bearer auth path is BLOCKED (backend unavailable in the cloud) and stays as open backend evidence.
- **L57 check on `c-round-421.json`:** OK (`b-round-421/l57-check-c421.txt`).
- **Gate 421 published `4786c13`** on both remotes. That commit is the round-422 baseline.
- **Closed:**
  - SYS-R418-PREVIEW-LIFECYCLE → done.
  - Its 8 Lows: TL-R418-L1/L2/L3/L4, GATE418-L4, A-R418-REVIEW-L1/L2/L3 (rows PL1–PL9, PC12).
  - C-R420-CLAIMS-K22-ARCHIVE-AGAIN and C-R420-CLAIMS-K8-K24-YOUTUBE-REQUEST-CONSUMED (C row 1).
- **New Low:** A-R421-REVIEW-L1-DECODED-STOP-ROW → `deferred_low_polish`.
- **Architecture note from A-421** (an internal `useLibraryPreviewController` hook): recorded as signal SIG-R421-PREVIEW-CONTROLLER-HOOK and attached to the still-open root request ARCH-CHECKPOINT-PREVIEW-AFTER-13C. It is not scheduled. The preview Lows are all closed, so it does not block anything.
- **Archive:** `tasks/round-421.md` is byte-identical to the round-421 task (K13).

## 2. Why SYS-2 stage 1 now
- **REGRESSION-2026-11-10 is not due** (D-29z1472). `regression-last` is 2026-11-07 and today is 2026-11-09: 2 days, and the rule needs 3. It goes first at the 422 → 423 planning, and its window extends to round 422.
- **STEM-LANES:** Saba has not answered `AGREE-STEM-LANES.md`, and there are no transcripts. The recorded order therefore opens SYS-1…3.
- **Premises re-checked at `4786c13`** (all three entries date from `5b1a2bb`):
  - **SYS-1:** all six anchors are still present.
  - **SYS-3:** `isComposing` is still 0 in the arrangement components.
  - **SYS-2:** partly covered since then. Play, Stop, Undo, Redo, Delete, Zoom back, Export and the marker add/prev/next/rename controls are guarded. Split, Follow, Back to start, Loop, Zoom to range, Fit and the marker flag are not.
- **ARCH-R107-SHARED-ENTER-GUARD** no longer gates SYS-2. Its L46 default passed long ago, and `preventRepeatedEnterKeyDown` is the shared convention.
- **Order (D-29z1474):** SYS-2 stage 1 goes before SYS-1. The reason is user impact: in real Chromium at HEAD, a held Enter flips Follow and Loop again and restarts playback from Back to start and from a flag (`b-round-421/probe/head/*.json`). SYS-1 is test-only.

## 3. Scope and full-scope preservation (D-29z1473)
- **Stage 1 (round 422):**
  - five transport buttons and the marker flag;
  - rows HE1–HE6;
  - doc 272.
- **Fit is excluded:** TH5 has pinned it since round 98, and a repeated Fit is idempotent. The task has a ruling line for it.
- **Stage 2 (next SYS-2 round):** every remaining site of the A-R107 sweep, from `b-round-421/data/button-guard-scan.txt` (62 buttons over the arrangement components: 16 guarded, 9 with a keydown handler but no repeat guard, 37 with no handler). Each site gets a ruling: guard, or idempotent exclusion. The sites:
  - lane, group and master Mute/Solo;
  - the metronome;
  - video dock expand, return and close;
  - folds and the detail toggle;
  - grid menu items and the library notice/folder buttons;
  - the group-name editor;
  - held Escape on the marker editor.

  Nothing is dropped.

## 4. Sketch evidence (L58; final sha `7002efc1…`)
| Check | Result | Evidence |
|---|---|---|
| Mutants (HEAD base; the script applies and commits the sketch) | 7 lines. MU-HEAD-SRC turns HE1–6 red; each single-guard mutant turns exactly its row red; every log shows 17 tests | `b-round-421/mutants/summary.txt`, `mutant-*.log` |
| Covering files | 23 app files, 509/509 | `precheck-a2.log` |
| Full suite (final sha) | 264 files, 3957/3957, rc 0 | `precheck-full.log` |
| typecheck / lint / biome | rc 0 / rc 0 (205 warnings, 1 info) / rc 0 | `precheck-*.log` |
| Browser, HEAD :5173 vs sketch :5174, 1440×900 and 1280×720 | `ALL OK (12 cells)`. HEAD: Follow, Loop+Undo and source starts change on hold; sketch: nothing changes after the first press | `probe/compare-head-vs-sketch.txt` |
| tech-lead | approve-with-lows (TL-R422-01…09). The 04/05/06 Lows are fixed in the sketch; the delta is recorded with both shas | `sketch-review.md` |

**Environment notes:**
- The first sketch browser cell (FOLLOW 1440) timed out on a cold Vite load and was re-run (L38).
- The scratch server used its own `cacheDir` and was stopped. The scratch `vite.config.ts` edit was reverted before the final freeze.
- The store tree stayed clean.

## 5. Architecture signals and checkpoints
- **SIG-R421-PREVIEW-CONTROLLER-HOOK** is new. It is attached to ARCH-CHECKPOINT-PREVIEW-AFTER-13C, which root has not run.
- **ARCH-CHECKPOINT-STEM-LANES** is still requested of root.
- **No new checkpoint request.** SYS-2 adds one existing handler to six elements. No owner shows accumulated structural risk this round.

## 6. Order after this round (D-29z1474)
1. **422:** SYS-2 stage 1.
2. **REGRESSION-2026-11-10** (due at the 422 → 423 planning).
3. **STEM-LANES S1–S4,** first, as soon as Saba answers.
4. Otherwise: SYS-2 stage 2 → SYS-1 → SYS-3.
5. STORE-2b…5.
6. REVIEW-RECOMMENDATIONS.
7. T12-ADVANCED.
8. Phase 2 (skip rule).

The next RETRO is round 435.

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE.** Still open:
  - SYS-1…3;
  - REGRESSION-2026-11-10;
  - STEM-LANES;
  - STORE-REDESIGN 2b–5;
  - REVIEW-RECOMMENDATIONS;
  - T12-ADVANCED;
  - the phase-2 entries;
  - the parked STUDIO-PERFORMANCE remainders;
  - SRW-21 (`deferred_user`);
  - every deferred Low, all of which must be fixed and C-verified before release.
- **Not BLOCKED.** Round 422 runs fully on the cloud runner and needs no backend or approval.

## Files written by B in this planning
- `current-task.md` (round 422)
- `tasks/round-421.md` (archive copy)
- `b-next.json`
- `backlog.json` (v398, via `b-round-421/update-backlog.py` + `.done`)
- `feature-status.md`
- `b-round-421/*`:
  - the sketch, its sha and its review;
  - mutants and probe;
  - prechecks;
  - claims, grants and the frozen manifest;
  - the button scan;
  - before-copies and the checkpoint.

`lessons.md` is unchanged (60 lines). No new failure class appeared this round.
