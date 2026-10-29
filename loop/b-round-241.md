# B: round 241 → 242 planning (2026-10-29)

**Decision: CONTINUE.** Round 242 = **SABA-B-11b-FIX-2**: a fix-up for C-R241-01, plus the doc 186 housekeeping. **Decisions:** D-29z375…D-29z381.

**Advisor:** the configured `advisor` tool was available and was used twice: before the write-up, and at the final check. Its gap list was applied:
- the lane-press covering files;
- the literal base red-proof;
- the stale-ref ruling;
- the Escape-vs-mouse ring wording;
- GM39, which pins the clip-body path in jsdom;
- the conditional regression timing;
- the saved round-241 copies for C's scope `diff`;
- addendum 7 in place of a new checkpoint request.

No project subagent was consulted: this is a focus-management bug fix with no reference-product question.

## 1. Inputs read
- `c-round-241.json` and `c-round-241.md`: **taskStatus FAIL**, `browserVerified: true`, `realVerified: true`.
  - 13 rows passed, including every stage-2a feature row.
  - The failure is the focus clause of C-MENU-CHOOSE-241 (a) and C-MENU-REG-241 (Escape), filed as **C-R241-01**, Medium.
  - The bug is pre-existing: it was identical at HEAD `04c2a5b`.
- `a-round-241.md`: 14 grants, covering 49 files 780/780, 5 mutants red. The reviewer reported 0 Critical, 0 High, 0 Medium and 7 Lows, plus an Architecture note.
- `gates/gate-round-241.json`: `skipped`, reason "C taskStatus FAIL". HEAD stays `04c2a5b`; nothing was published.
- `regression-last.json`: 2026-10-27, so the regression round is due on or after 2026-10-30. It is not due today (2026-10-29).
- `lessons.md`, the round-238 fix-up task (the precedent for a FAIL-kept tree), the backlog entries by id, and `env-status.json` (store 200).

## 2. Backlog changes, from C evidence only
- **Round 241:** `c_fail_not_published`.
  - The stage-2a feature rows are recorded as **met in C, not done**: there was no publication.
  - **GATE239-S4, C-R240-01 and GATE240-S2** are met in C (C-MENU-CHECK/C-S4-AX, AN-REVIEW and C-SCOPE/C-UNIT). They close when rounds 241 + 242 publish (D-29z375).
- **New `open_findings`:**
  - **C-R241-01** (Medium) → round 242, with `why_missed`;
  - A-R241-REVIEW-R5 → GM37;
  - A-R241-REVIEW-R6 → grant 3;
  - A-R241-REVIEW-R2 (info).
- **`deferred_low_polish`:** this adds 3, for a total of 387. The ruling is D-29z379.
  - **A-R241-REVIEW-R1**, the menu height. The bottom spare at 1280×720 with a BPM is 4 px, not the 79 px in the round-241 task. It must be solved in any task that adds a menu row, for example an "Off" item if Saba answers SABA-Q-11B-MENU-OFF with yes.
  - A-R241-REVIEW-R3.
  - A-R241-REVIEW-R4.
- **Architecture:** the reviewer's note becomes signal A-R241-ARCH-GRIDMENUITEM and **addendum 7** to ARCH-CHECKPOINT-TEMPO-GRID. It is not scheduled. The re-ask is after stage 2b. No new checkpoint is requested now: this is not a feature boundary, and one fix-up adds no structural risk beyond what question 7 already covers.
- **Regression:** REGRESSION-ROUND-2026-10-30 `scope_additions` gains the stage-2a + FIX-2 key acceptance (C-FOCUS-242), D-29z381.
- **`lessons.md` L47** is amended in place (D-29z380). The file is still ≤ 60 lines (59), and no lesson was dropped.

## 3. Round 242 task (`current-task.md`)
- **Start:** HEAD `04c2a5b` plus exactly the 14 `M` paths of round 241 (`b-round-241-r242-start-sha256.txt`). Do not STOP on the dirty tree.
- **Grants (3):**
  - `StudioWorkspace.tsx`: the 3 hunks of `b-round-241/precheck-scratch.diff`;
  - `grid-snap-menu.test.tsx`: append only, GM36–GM39 (GM39 = clip body, added after the advisor's final check; the clip's `beginGesture` returns on a non-left button before `stopPropagation`, so the right press bubbles to the lane);
  - doc 186.
- **Frozen:** 1,101 files.
- **Fix:**
  - On a right press, `handleLaneBackgroundPointerDown` stores the focused element, before its early return, so clip-body right-clicks are covered too.
  - `handleGridMenuRequest` reads and clears that value first, and uses it only when the active element is BODY.
- **B pre-check:**
  - covering: 49 files 783/783 plus 12 lane-press files 293/293;
  - tsc rc 0, Biome clean;
  - the round-241 code with the new rows turns GM36 and GM37 red;
  - MU-NO-PRESS-CAPTURE turns GM36, GM37 and GM39 red; MU-PRESS-WINS turns GM38 red.
- **Chromium:** C's recipe gives BODY in 6/6 runs on the round-241 tree and the Snap toggle in 6/6 on the fix. After Escape, `:focus-visible` is true. After a mouse choice it is false, which SABA-B-4 rules as info (D-29z378).
- **C rows:**
  - C-SCOPE, C-UNIT and C-MUT;
  - C-FOCUS-242 (C's own recipe) and C-FOCUS-CLIP-242 (clip body; B ran it from source only, and says so);
  - C-MENU-REG-242 (reposition, swallow, play, header, marquee) and the C-2A-SPOT re-check;
  - budget, AN-REVIEW, smoke and Auth;
  - purchased origin BLOCKED (backend unavailable in cloud); gate rows.
- **When C passes,** the gate publishes rounds 241 + 242 together.

## 4. Why not other scope this round
- C-R241-01 is Medium, so it blocks under the 2026-10-23 bug gate and comes before stage 2b.
- It is one bug on one code path. The doc housekeeping rides along because the doc is granted anyway (L28).
- The menu-height Low is not taken. It needs a scroll design (focus `preventScroll`, GM13 closes on scroll), which is more than a small item.
- Next: SABA-B-11b stage 2b, but the **REGRESSION round** comes first if the next planning falls on or after 2026-10-30 (D-29z381, conditional: rounds currently close about hourly, so it may still be 2026-10-29).

## 5. Ready for commit
Nothing is ready for root this round: round 241 is unpublished. Rounds 241 + 242 become commit-ready together after C PASS on round 242.

## 6. Files written by B this planning
- **Tasks:**
  - `tasks/round-241.md` (copy of the round-241 task);
  - `current-task.md` (round 242).
- **Baseline and hash lists:**
  - `b-round-241/head-at-planning.txt` and `git-status-at-planning.txt`;
  - `b-round-241-r242-{start-sha256,grants,grants-start-sha256,root-files,root-files-start-sha256,tree-sha256}.txt`.
- **Pre-check and probe evidence (`b-round-241/`):**
  - `precheck-scratch.diff`;
  - `covering.txt`, `covering-extra.txt`, `covering.log`, `covering-extra.log`;
  - `tsc.log`, `biome.log`, `mutants/*.log`;
  - `focus-probe-242.cjs`, `shots/`, `dev5174.log`;
  - `backlog-before-r242-planning.json`.
- **Updated:** `backlog.json`, `feature-status.md`, `lessons.md` (L47), `b-round-234-checkpoint-request.md` (addendum 7), `b-next.json`.
- **Scratch:** `/tmp/b242-scratch` stays outside the repo. Its dev server on `:5174` is stopped, and `:5173` still answers 200.
