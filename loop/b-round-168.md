# B round 168 → round 169 planning (D-29z134)

**Decision: CONTINUE.** The next task is round 169, **V-3c-4c-1**: the Library panel and Library preview buttons. It is in `current-task.md`. The previous task is archived as `tasks/round-168.md`, an exact copy (sha256 `51d19ab137fbd5a5…`, checked with `cmp`).

## Inputs read
- **Active context:** `context/active-summary.md` first. `backlog.json` and `feature-status.md` were opened only for specific IDs (python and grep).
- **Round-168 reports:**
  - `tasks/round-168.md` and `a-round-168.md`.
  - `c-round-168.md` and `c-round-168.json`: PASS. `browserVerified` and `realVerified` are true, with 0 bugs. The only blocked row is fake-Bearer 403 (backend unavailable in cloud).
  - `gates/gate-round-168.json`: **published** `e50498f`, on both remotes.
  - `gates/round-168/review.md`: 9/10, nothing blocking. `verify.log` shows 171 files and 2562 tests passing, and the build is green.
- **Baseline:** HEAD = `e50498f` = the gate-168 commit. The tree is clean with 987 files.
- **User decision files:** `user-review/ableton-decisions.md` and `design-ux-decisions.md` are unchanged.
- **Checkpoint:** there is still no frontend-architect answer.
- **Regression:** `regression-last.json` is 2026-10-24, so the next one is due on or after 2026-10-27. It is not due today (2026-10-25).
- **Advisor:** available and consulted before writing. It confirmed the round choice and asked for several additions, all applied:
  - name the whole 4c split now;
  - write explicit rulings for Stop (R10, not the R2 pattern) and Add (R11);
  - get after-data for the Add variant: B re-ran the probe, `v3c4c1-probe-add.json`;
  - list the excluded sites with reasons (R12);
  - make the disabled state an informational C row;
  - record the reviewers' timing disagreement in the checkpoint pointer.
- **Project subagents:** none consulted. The rulings follow the precedents set in rounds 166–168, and the advisor covered the open questions.

## Backlog updates (only from independent C evidence)
- **V-3c-4b → მზადაა** (C round 168 PASS, `browserVerified` true, published `e50498f`). Round 168 → `c_pass_published`.
- **Signals and notes recorded, not scheduled:**
  - **ARCH-R167-SURFACE-RECIPE**, updated: 12 copies after 4b. The reviewers disagree on timing, and a file-local constant was suggested.
  - **ARCH-CHECKPOINT-V3C**, updated: pointer `b-round-168-checkpoint-request.md`.
  - **Q-R167-ON-HOVER**: now browser-confirmed and still awaiting Saba.
  - **C-R168-BORDERLESS-REDUCED-MOTION**: borderless buttons keep the global 150 ms transition under reduced motion. Pre-existing; a candidate for V-3c-5 or a motion audit.
  - **C-R168-1280-COMPACT-IMPORT**: pre-existing density behaviour.
  - **GATE168-BEHAVIOUR-TRANSITION**: the 180 ms Mute/Solo toggle animation matches the spec.
- **No new Lows,** so `deferred_low_polish` is unchanged.
- **Doc 137 status → Completed:** granted to A as D1 (gate-168 suggestion 5).
- **The file-local `LANE_MIX_BUTTON_CLASS` suggestion** is part of the ARCH signal, not scheduled.
- `backlog.json` is now **version 158** (script `b-round-168/update-backlog.py`).

## Why V-3c-4c-1, and the rulings
- **Fixed in advance:** `tasks/round-168.md` §7, "C PASS" row. No bug comes first.
- **Split by owner:** 4c-1 Library + Preview (169), 4c-2 DetailPanel (170), 4c-3 ExportDialog + VideoDock + the MarkerRow l.811 chip question (171). **No scope was dropped.**
- **Grants:** 4, plus 1 new doc.
- **B browser probe** (`b-round-168/v3c4c1-probe.cjs`, `v3c4c1-probe-add.cjs`; real Chromium, both viewports, P0–P3):
  - Layout: **0.000 px** in every state.
  - Toggle: 7.88 → 7.05, hover 6.58.
  - Add: 6.69 → 7.05, hover 5.48 → 6.58.
  - Borderless buttons and rows: unchanged.
- **Smallest honest choices where the contract was unclear:**
  - **R10:** Stop is an outline button, so it follows the R6 pattern (keep the coloured border, gain the fill), not R2.
  - **R11:** Add follows the spec's single primary style (brand border and text) instead of keeping a second, brand-tinted primary.
  - **R12:** tree rows have no radius today, so giving them one would be a shape change, not 6 → 8 px. They are excluded.
  - **All are user-vetoable** (`feature-status.md`).

## Architecture checkpoint
`b-round-168-checkpoint-request.md` updates the request with the round-168 evidence:
- A's reviewer says to extract **after** 4c; the gate-168 reviewer says **before** 4c.
- It is non-blocking. Without an answer, each 4c stage uses fallback (c).
- B does not schedule the extraction.

## Not complete, and why CONTINUE
Remaining scoped work:
- **VISUAL-A:** V-3c-4c-1/2/3, V-3c-5, DUX-R-5, M1, M3, M4, ROOT-RECON-GRID-HARNESS.
- **After VISUAL-A:** REVIEW-RECOMMENDATIONS, T12-ADVANCED, the deferred Lows (fixed before release), the regression due 2026-10-27, and the final regression.
- **Awaiting Saba:** ABL-R-5/16/17, M5, phase 2, SRW-21 (`deferred_user`), Q-V3-ICON-SIZE, Q-R166-EXIT-NAME, Q-R167-ON-HOVER and B-R153-PREVIEW-DUR. None of these blocks the next task.

Nothing external is needed to continue.

## Commit readiness
Round 168 has already been published by root (`e50498f`). Round 169 is not ready until C passes it.

## Files written by B
- **Task and status:**
  - `current-task.md`
  - `tasks/round-168.md`
  - `b-round-168-checkpoint-request.md`
  - `feature-status.md`
  - `backlog.json` (v158)
  - `b-next.json`
- **Pre-planning copies:** `b-round-168/{b-round-168-current-task.md,b-round-168-feature-status.md,b-round-168-b-next.json}-before` and `b-round-168/backlog-before-r169.json`.
- **Baseline lists and hashes:** `b-round-168-r169-{grants,new-files,tree-sha256,granted-start-sha256,vitest-base}.txt`.
- **Probe, tools, outputs, start copies and update scripts:** `b-round-168/{v3c4c1-probe.cjs,v3c4c1-probe-add.cjs,tools/,out/,r169-granted-start/,update-backlog.py,update-fs.py}`.

No application source was changed (`git status --short` is empty).
