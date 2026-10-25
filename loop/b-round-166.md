# B round 166 → round 167 planning (D-29z132)

**Decision: CONTINUE.** The next task is round 167, **V-3c-4a**: the toolbar button surfaces. It is in `current-task.md`; the previous task is archived as `tasks/round-166.md`, an exact copy (sha256 `3791013e1a112ba5…`).

## Inputs read
- **`context/active-summary.md`, `context/active-backlog.json`:** read first. `backlog.json` and `feature-status.md` were opened only for specific IDs.
- **Round-166 reports:**
  - `a-round-166.md`;
  - `c-round-166.md` and `c-round-166.json`: PASS, `browserVerified` and `realVerified` true, 0 bugs. The only blocked row is fake-Bearer 403 (backend unavailable in cloud);
  - `gates/gate-round-166.json`: **published** `330f1f3`, on both remotes;
  - `gates/round-166/review.md`: 9/10, no blockers.
- **Baseline:** HEAD = `330f1f3` = the gate-166 commit. The tree is clean with 985 files.
- **User decision files:** `user-review/ableton-decisions.md` and `design-ux-decisions.md` are unchanged and add nothing for this stage.
- **Checkpoint:** no frontend-architect answer has arrived (`b-round-160-checkpoint-request.md` and its addendum `b-round-165-checkpoint-request.md`).
- **Regression:** `regression-last.json` is 2026-10-24, so the next one is due on or after 2026-10-27. It is not due today (2026-10-25).
- **Advisor:** available and consulted twice.
  - **Before writing**, it confirmed:
    - the split by owner;
    - the narrow token recipe (copying the whole transport constant would break MS4);
    - the buttons-vs-fields rule and the on-state precedent;
    - the arbitrary-value whitelist;
    - contrast as the real risk, and the round-166 bookkeeping.
  - **At review**, it pointed out four gaps:
    - the Master Mute tap position needed confirming. B checked it: `graph.client.ts` l.177 connects master → destination, and C's tap hooks the destination, so the row stays;
    - C-R166-TRIPLET-CHECKED-BROWSER can close this round, because FUNC-SMOKE already sets BPM 120. It is now scheduled;
    - TS8 needed a mount fallback. ArrangementMaster has no early return, so a fallback sentence was added;
    - a checkpoint pointer file was missing.
  - All of these were applied.

## Backlog updates (only from independent C evidence)
- **V-3c-3b → მზადაა** (C round 166 PASS, `browserVerified` true, published `330f1f3`). That completes V-3c-3 and the glyph-to-icon work. Round 166 in the backlog is now `c_pass_published`.
- **Reviewer notes recorded as backlog signals, not scheduled tasks:**
  - **GATE166-ICON-PROPS (signal):** icon props repeat at 7 sites. It is checkpoint Q3 evidence.
  - **Q-R166-EXIT-NAME (awaiting_user):** an option of `aria-label="Back to CZABA"`, for Saba to decide.
  - **C-R166-TRIPLET-CHECKED-BROWSER (evidence gap):** the checked Triplets Check icon has not been seen in a browser yet, only in vitest TU11. It is **scheduled in round 167**, as one line in FUNC-SMOKE-V3C4A.
  - **Deferred Lows** (under the 2026-10-23 bug gate; `deferred_low_polish` total 239):
    - GATE166-TS7-INDEXOF;
    - GATE166-GRID-ARIA-HIDDEN-DUP.
- **Doc 135 status → Completed:** granted to A as D1 (gate suggestion 1).
- **Architecture note from A's code-reviewer and from the gate reviewer:** "none" from both.

## Why V-3c-4a, and why split
- **Fixed in advance:** `tasks/round-166.md` §7 ("C PASS" row) named V-3c-4 as round 167.
- **No bug comes first:** there are no C bugs, and no Critical, High or Medium finding is open apart from the Tech Lead manual items.
- **Why split:**
  - The bordered buttons and fields sit in 11 components. With one test file per owner, that is well over the ~12-grant limit.
  - **4a** takes the four owners of the small toolbar controls:
    - StudioWorkspace: Snap, Env, 2 selects;
    - Tempo row: Metronome, BPM;
    - Marker row: header buttons, name input;
    - Master: Peak, Mute.
  - That makes 9 grants and 1 new doc.
  - 4b (Lane/Group Mute/Solo, video import) and 4c (Detail panel, Library preview and search, Export dialog, dock float buttons) are recorded with their line lists at `330f1f3` in `backlog.json` → `v3c4a_plan_d29z132.v3c4_inventory`. **The scope is not reduced.**
- **B browser probe** (`b-round-166/v3c4a-probe.cjs` → `out/v3c4a-probe.json`; real Chromium, both viewports, S0 and S3):
  - **Layout:** 0.000 px.
  - **Off-state contrast:** 6.68 → 5.98, with 12.35 on hover. On-states are unchanged: 5.48 and 8.32.
  - **Colour parsing:** the first version regex-parsed `rgb()` and misread Tailwind v4's oklab output. It was fixed with a canvas parse, and C is told to do the same.
- **Rulings** (user-vetoable, listed in `feature-status.md`):
  - **R1:** the narrow SURF + MOTION token set.
  - **R2:** on-state strings stay byte-identical, with the same hover/active fill added (Loop precedent; the TH10 Peak over string stays exact).
  - **R3:** fields keep their border and change radius only.
  - **R4:** 16 px controls become pill or circle shapes under the literal 8 px radius.
  - **R5:** what is out of this slice.
- **Smallest honest choice where the contract was unclear:**
  - **R3** follows the spec's own wording: border removal is for buttons, the radius is for buttons and fields.
  - **R4** applies the approved 8 px literally and gives Saba 4× crops to veto it, rather than inventing a size exception.

## Architecture checkpoint (request to root at the feature boundary)
Pointer file: `b-round-166-checkpoint-request.md`.
This is the end of the V-3 glyph work, a feature boundary.
- **Applied:** the pending checkpoint (`b-round-160-checkpoint-request.md` Q1–Q4 + `b-round-165-checkpoint-request.md` Q-COMMIT) is still unanswered, so B applied **fallback (c)** to V-3c-4a, as written in advance.
- **Request:** B asks root to run the bounded read-only frontend-architect checkpoint **before V-3c-4b planning**. V-3c-4b and 4c copy the same SURF + MOTION token set into 5 more components (Lane, GroupHeader, DetailPanel, LibraryPreview, ExportDialog, plus the dock). That is where Q1 (a shared recipe, or keep) and Q2 (the global transition rule, which forces the `!` suffixes) change the most work.
- **Without an answer:** V-3c-4b also uses fallback (c). Independent work is not delayed.

## Not complete, and why CONTINUE
Remaining scoped work:
- **VISUAL-A:** V-3c-4a/4b/4c, V-3c-5, DUX-R-5, M1, M3, M4, ROOT-RECON-GRID-HARNESS.
- **After VISUAL-A:** REVIEW-RECOMMENDATIONS (approved ABL-R / DUX-R), T12-ADVANCED, the deferred Lows (fixed before release), the regression due 2026-10-27, and the final regression.
- **Awaiting Saba:** ABL-R-5/16/17, M5, phase 2, SRW-21 (deferred_user), Q-V3-ICON-SIZE, Q-R166-EXIT-NAME and B-R153-PREVIEW-DUR. None of these blocks the next task.
- **Missing external input:** nothing is needed to continue.

## Commit readiness
Round 166 has already been published by root (`330f1f3`). Round 167 is not ready until C passes it.

## Files written by B
- **Task and status:** `current-task.md`, `b-round-166-checkpoint-request.md`, `tasks/round-166.md`, `feature-status.md`, `backlog.json` (version 156), `b-next.json`.
- **Pre-planning copies:** `b-round-166-{current-task.md,feature-status.md,b-next.json}-before`, `b-round-166/backlog-before-r167.json`.
- **Baseline lists and hashes:** `b-round-166-r167-{grants,new-files,tree-sha256,granted-start-sha256,vitest-base}.txt`.
- **Probe, outputs, start copies and update scripts:** `b-round-166/{v3c4a-probe.cjs,tools/,out/,r167-granted-start/,update-backlog.py,update-fs.py}`.
- No application source was changed.
