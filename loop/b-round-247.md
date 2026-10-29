# B round 247 → 248 planning (2026-10-29)

**Decision: CONTINUE.** Round 248 is **SABA-B-11b stage 2b**: a grid whose lines are hidden pauses Snap, including Alt. It is the final 11b stage and closes ABL-R-8. Decisions D-29z419…D-29z425. The baseline is HEAD `da8c641` (gate 247 `commit`), clean, with 10 grants (9 by B's applied diff, plus doc 186) and 1,098 frozen files.

**Advisor:** available and used before writing. It asked for:
- housekeeping first: the archive copy, the `da8c641` hash lists, closing the round-247 items, and the reviewer Lows to `deferred_low_polish` (L3 merged with GATE247-S1);
- the transcripts file read at the right path;
- doc 186 as the final-stage doc (L28);
- the ARCH-CHECKPOINT-TEMPO-GRID re-ask;
- the "pause + status on user actions" ruling, with coarsening rejected;
- `undefined` passed to `resolveSnapStep` for the Alt path, with its own row and mutant;
- the nudge fallback;
- confirming the hidden state in the browser at `da8c641` before writing recipes;
- mutants for each part.

All of these were done. A final advisor check follows this report.

**Consults:** none new. The 2026-10-29 `ableton-arrangement-expert` and `docs-explorer` results ("no reference found" for hidden-line snapping) are reused from the SABA-B-11b `stage_plan`. `reference/youtube/SABA-B-9-10-11-transcripts.md` was read; it has nothing on hidden lines (GRGG 0:00, 0:44 cover the readout and the adaptive default).

## 1. Inputs read
- **Gate 247:** `published`, commit `da8c641`, pushed to both remotes. Review 9/10, no Critical issues. Suggestions S1–S5 and an Architecture note. `verify.log`: 214/214 test files and the build passed.
- **C round 247:** PASS. `browserVerified` and `realVerified` are true, 15 rows passed, 0 bugs, and the purchased origin is BLOCKED (backend). Info notes: INFO-C247-GRIDMENU, INFO-C247-NESTED-COLLAPSE, and A's reviewer Lows.
- **A round 247:** no STOP. Reviewer 8.5/10, with Lows L1–L3 and an Architecture note.
- **Regression:** `regression-last.json` is round 199, 2026-10-27, so it is due on or after 2026-10-30. Today is 2026-10-29: **not due**. RETRO is next at round 260.
- **User-review folder:** no new decision file. AGREE-SABA-B-7 is still unanswered.
- **Archive:** `tasks/round-247.md` is a byte copy of the round-247 `current-task.md` (`cmp` identical; it did not exist before). Before-copies are in `b-round-247/*-before-248.*`.
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json` are unchanged old snapshots (C round 247 says the same). No new finding for this round.

## 2. Backlog changes from independent evidence (D-29z419, D-29z420)
- **Closed by C round 247 PASS and gate 247:**
  - B-R245-UNDO-GROUP-FOCUS;
  - INFO-B247-GRIDMENU-UNVERIFIED (closed by INFO-C247-GRIDMENU);
  - INFO-C247-GRIDMENU and INFO-C247-NESTED-COLLAPSE (info).
- **To `deferred_low_polish` (399 → 403):** A-R247-REVIEW-L1, A-R247-REVIEW-L2, A-R247-REVIEW-L3 (merged with GATE247-S1) and GATE247-S2, each with its evidence and repro. The option "narrow D-29z415 to next-only" is recorded as a polish-pass question.
- **Info:** GATE247-S3, S4 and S5.
- **Architecture:** GATE247-ARCH-ROW-FOCUS-RESCUE is a signal, not scheduled (D-29z421).
- **Regression scope:** C-GROUP-ORIGINS-247 was already in REGRESSION-ROUND-2026-10-30. C-HIDDEN-SNAP-248 was added, conditional on round 248.

## 3. Round 248 (D-29z420, D-29z423, D-29z425)
- **The bug, measured in Chromium at both viewports at `da8c641`:** with Snap on and hidden lines, clicks land on lines that are not drawn:
  - 11.1 / 13.3 at 0.1 s and 40 px/s;
  - 810 at 0.5 px/s (adaptive 10 s);
  - 8.563 at 1/32 and 120 BPM.
- **The Alt path:** with Snap off, Alt switches on the hidden grid (970, 18.7).
- **The nudge** steps 0.25 s along hidden lines.
- **The rule:** a hidden grid acts as Snap off for every snap path, including the keyboard steps. Alt never enables it. The toggle keeps the user's choice, and zooming in resumes snapping. The titles, `data-snap-paused` and the 6 user grid statuses say "paused". Zoom stays silent.
- **Mechanism:** two derived values in `StudioWorkspace` replace the 5 prop sites. The 2 ref sites check `gridLinesVisible`. `ArrangementLane` gets `snapGridSeconds` for its own snap and the clip's, and keeps `gridSeconds` for drawing. `grid.ts` is unchanged.
- **B's pre-check:**
  - `precheck-scratch.diff`, 9 files;
  - tsc and Biome clean;
  - covering set 134 files, 2,073/2,073;
  - 10 mutant runs, each with the expected red rows;
  - Chromium HEAD vs fix at both viewports: the fix gives free times (11.133, 811.328, 973.08, 18.717, 8.535), a 0.1 s nudge, then the next visible line. Visible grids are unchanged (11.1; 7.625 at 1440).
- **Invalid attempts, kept:**
  - a cold start;
  - a same-x double-click (INFO-B248-RULER-DBLCLICK);
  - off-screen clicks at high zoom (INFO-B248-OFFSCREEN-RULER);
  - the 1280 visible musical click. C re-measures it.
- **Saba question:** SABA-Q-11B-HIDDEN-SNAP (L44, D-29z422), non-blocking.
- **Not run by B in the browser:** the loop brace and marker key steps over hidden lines. The code path is cited, and C measures them (C-KEYSTEP-248).

## 4. Architecture checkpoint (D-29z421, D-29z423)
`b-round-247-checkpoint-request.md` asks root for two bounded `frontend-architect` checkpoints at this feature boundary:
- ARCH-CHECKPOINT-TEMPO-GRID addendum 10: `useStudioGrid`, keep or extract;
- ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS question 4 addendum 2: gate-247 note, keep or `useRowFocusRescue`.

They do not block, and they are wanted before SABA-B-10a.

## 5. Next (D-29z424)
1. Round 249 = **REGRESSION** at the first planning on or after 2026-10-30. It carries every `scope_additions` entry, now including C-HIDDEN-SNAP-248.
2. If that planning is still on 2026-10-29, **SABA-B-10a** goes first, with C-R235-02 and its list of Space-contract tests.
3. Then SABA-B-10b, 9 and 11c. SABA-B-7 runs when Saba answers. Then SYS-5, PERF b-ii and the rest of the queue, unchanged.
- **Commit readiness for root:** round 248 changes 4 source files and 5 test files, and updates doc 186. Publish only after C PASS and the gate. Round 247 is already published (`da8c641`). The loop-state commit carries this planning.

## 6. Completion check
- **Not COMPLETE.**
  - SABA-B-11b stage 2b is dispatched, not verified.
  - SABA-B-10a, 10b, 9 and 11c, SABA-B-7, SYS, PERF, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2 remain.
  - All 403 deferred Lows must be fixed and C-verified before final acceptance.
- **Not BLOCKED.** Runnable work exists. Only SABA-B-7 and PHASE2-VIDEO-SCORING wait for Saba.

## 7. Self-check
- **Backlog edits** come only from C-247 and gate-247 evidence, plus B's own probe and mutant files.
- **No scope shrunk; nothing deferred without authority.** The Lows were moved under the 2026-10-23 bug gate. Edge magnetism without a grid is asked as a question, not dropped.
- **Protected files** are untouched and frozen, each listed once. `/studio-lab` stays demo-only (the Auth row).
- **The store tree was not modified:**
  - every experiment ran in `/tmp/b248-scratch`, `/tmp/b248-mut` and on `:5174`, which is now stopped;
  - `git status` is empty, and all three hash lists give rc 0;
  - `:5173` still answers 200.
- **Speed rule:** no task row asks A or C for the full suite; those are gate rows.
- **Lessons:** `lessons.md` is unchanged (57 lines). No Saba-reported issue was planned, so no new lesson is required. The two harness facts are retro candidates for RETRO 260.

## Attempt 2 (2026-10-29 11:43 UTC, ROOT RESUME)
- Resumed from `b-round-247-checkpoint.md`. Attempt 1 had written every artifact. No artifact was rewritten or duplicated.
- Re-verified:
  - `tasks/round-247.md` matches `b-round-247/current-task-before-248.md` (cmp);
  - HEAD is `da8c641` and the store worktree is clean;
  - `sha256sum -c` on `b-round-247-r248-tree-sha256.txt` gives rc 0;
  - `b-next.json` and `backlog.json` parse;
  - `c-round-247.json` has browserVerified and realVerified true;
  - feature-status: round 247 is მზადაა and round 248 is მუშავდება;
  - current-task.md has §1.7 "Why we missed it", §3 Reference and Deviations;
  - lessons.md is 57 lines and unchanged this round.
- Final advisor check: the advisor was available and was used. Its verdict: CONTINUE stands, nothing blocks.
