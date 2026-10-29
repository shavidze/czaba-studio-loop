# B: round 242 → 243 planning (2026-10-29)

**Decision: CONTINUE.** Round 243 = **C-R242-01-FIX**, one Medium bug on one code path. **Decisions:** D-29z382…D-29z388.

**Advisor:** the configured `advisor` tool was available and was used before the write-up. Its points were applied:
- the D-29z22-F vs L47 conflict is ruled explicitly (D-29z382);
- FR3 is rewritten to a positive new assertion, so no check is removed without a replacement;
- the capture site was chosen as one writer: it moves to the scroller's capture handler, and the lane copy is removed;
- one origin per blurred class was measured in Chromium;
- the marker editor was filed separately, not folded in;
- the covering grep goes by branch names;
- the round-242 archive and housekeeping were done.

The final advisor check, after the files were written, kept the decision (CONTINUE, round 243 as written). It asked for three additions, all applied:
- label the C-BRACE-KEYS-243 (a)/(b) rows and the BPM-field return note as not run by B in the browser;
- add a `Why we missed it` paragraph to the task;
- record the L28 grep and the marker-editor severity choice.

No project subagent was consulted: this is a focus-management bug fix with no reference-product question.

## 1. Inputs read
- `c-round-242.json` and `c-round-242.md`:
  - **taskStatus PASS**, `browserVerified: true`, `realVerified: true`; 11 rows passed.
  - The purchased-origin row is BLOCKED (backend unavailable in cloud).
  - New bug **C-R242-01** (Medium, pre-existing).
- `a-round-242.md`: 3 grants; covering 61 files, 1,077/1,077; mutants red. The reviewer's A-R242-REVIEW-M1 (Medium, source only) is the same bug as C-R242-01. The reviewer also left an Architecture note.
- `gates/gate-round-242.json`: **published** `7e5b23c` on both remotes. That commit is the round-243 baseline.
- Also read:
  - `regression-last.json`: 2026-10-27, so not due until 2026-10-30;
  - `lessons.md` and `context/active-summary.md` (head only);
  - `tasks/round-57.md` §0.2 and M10 (D-29z22-F, FR3);
  - the source of `releaseEditFocusOnTimelinePointerDown`, `handleGridMenuRequest`, `closeGridMenu`, `ArrangementMarkerRow.settleEditor` and `ArrangementTempoRow`.

## 2. Backlog changes, from C evidence only
- **Rounds 241 and 242** → `c_pass_published` (`7e5b23c`). **SABA-B-11b stage 2a is done**: C ran its browser rows in round 241, and round 242 passed with `browserVerified: true`.
- **Closed (D-29z383):** C-R241-01, GATE239-S4, C-R240-01, GATE240-S2, A-R241-REVIEW-R5 and A-R241-REVIEW-R6.
- **Opened:**
  - **C-R242-01** (Medium), with `why_missed`;
  - A-R242-REVIEW-M1, merged into C-R242-01;
  - **B-R242-MARKER-EDITOR-MENU-FOCUS** (Medium, pre-existing, found by B's probe; D-29z385).
- **Architecture:** signal A-R242-ARCH-GRIDMENU-FOCUS-HOOK becomes **addendum 8** to ARCH-CHECKPOINT-TEMPO-GRID (D-29z386).
  - The reviewer's own trigger for extracting `useGridMenuFocusReturn` was "if this region is touched again", and round 243 meets it.
  - The extraction is not scheduled; round 243 stays a 2-hunk fix. The re-ask stays after stage 2b, before SABA-B-10a.
  - No new checkpoint is requested: this is not a feature boundary.
- **Regression:** REGRESSION-ROUND-2026-10-30 `scope_additions` gains C-FOCUS-ORIGINS-243 (D-29z388).
- **`lessons.md` L47** is amended in place (D-29z387): the recipe probes one origin per blurred class. The file stays at 59 lines, and nothing was dropped.
- **L28 planning grep** (`grep -rn 'In Progress (stage' docs/implementation`): 2 hits, each tied to an open stage.
  - Doc 186 (`stage 2 of 3; C round 242 PASS`) → SABA-B-11b stage 2b.
  - Doc 176 (`stage 1 of 2; C round 225 PASS`) → the open PERF harness stage (PERF-HARNESS-SHARED-LIB-b-ii).

  No grant is needed this round.
- **No Lows deferred** this planning, and no `deferred_low_polish` change (387).

## 3. Ruling and design (D-29z382, D-29z384)
- **The conflict.** D-29z22-F (round 57) made the edit-focus release apply to any button, and FR3 pinned "the menu does not restore the brace". L47 and WAI-ARIA require the menu to return focus. The two cannot both bind a right press on a lane.
- **The ruling.** A right press on a lane or clip body edits nothing, so the menu's focus return wins. Left presses and right presses on paths that open no grid menu keep D-29z22-F. FR3 is rewritten: the brace comes back, `ArrowRight` moves the loop, and the clip stays put.
- **The design.** The scroller's capture handler always runs before the lane's bubble handler. So the single right-press capture moves to the first statement of `releaseEditFocusOnTimelinePointerDown`, before the blur decision, and the lane copy is removed.
  - The rejected option was to skip the release on button 2: it changes paths with no menu and keeps two writers.
  - A stale value is harmless, for the reasons in the task §1.

## 4. B's pre-check (L23, L29, L47)
- **Scratch:** a `git archive` of HEAD in `/tmp/b243-scratch`.
  - tsc rc 0; Biome clean.
  - Covering set: **67 files, 1,153/1,153 green**. It is round 242's 61 files plus two branch-name greps.
- **Mutants:**
  - MU-LANE-CAPTURE-ONLY: GM40–GM43 and FR3 red.
  - MU-NO-SCROLLER-CAPTURE: GM36, GM37, GM39, GM40–GM43 and FR3 red.
  - MU-PRESS-WINS: GM38 red.
- **Chromium** (`b-round-242/focus-probe-243.cjs`, both viewports):
  - At HEAD, all 5 origins end on BODY: the fader, the BPM field, the brace, the marker flag and the marker editor.
  - On the fix, the first 4 get focus back, with `:focus-visible` and a brass outline after Escape. The marker editor stays on BODY (filed separately).
  - One scratch attempt was environment-invalid (a cold Vite start) and was re-run. There were 0 page errors.
  - The `:5174` server is stopped, and `:5173` answers 200.

## 5. Why not other scope this round
- C-R242-01 is Medium, so it blocks under the 2026-10-23 gate.
- The marker editor case has a different mechanism: the origin unmounts and needs `ArrangementMarkerRow` plumbing. It gets its own round.
- **Its severity, Medium, is a choice by consistency** with C-R241-01 and C-R242-01: the same WCAG 2.4.3 loss of focus to BODY. It costs a round before stage 2b. The next RETRO (245) can weigh that choice.
- Stage 2b waits for both Mediums. If the next planning is on or after 2026-10-30, the regression round comes first (D-29z388).

## 6. Ready for commit
Nothing new is commit-ready. Rounds 241 and 242 are already published (`7e5b23c`). Round 243 becomes commit-ready after C PASS.

## 7. Files written by B this planning
- **Tasks:**
  - `tasks/round-242.md` (a copy of the round-242 task);
  - `current-task.md` (round 243).
- **Baseline:**
  - `b-round-242/head-at-planning.txt` and `git-status-at-planning.txt` (empty);
  - `b-round-242-r243-{grants,grants-start-sha256,root-files,root-files-start-sha256,tree-sha256}.txt`.
- **Pre-check evidence (`b-round-242/`):**
  - `precheck-scratch.diff`;
  - `covering{,-base,-grep,-grep2,-extra}.txt` and `covering.log`;
  - `tsc.log`, `biome.log`, `mutants/*.log`;
  - `focus-probe-243.cjs`, `shots/`, `dev5174.log`.
- **Backups:** `backlog-before-r243-planning.json`, `feature-status-before-r243-planning.md`, `lessons-before-r243-planning.md`, `b-next-before.json`.
- **Updated:** `backlog.json` (version 224), `feature-status.md`, `lessons.md` (L47), `b-round-234-checkpoint-request.md` (addendum 8), `b-next.json`.
- **Scratch:** `/tmp/b243-scratch` stays outside the repo. The store tree is unchanged (`git status` empty).
