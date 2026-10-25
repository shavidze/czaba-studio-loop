# B round 169 → round 170 planning (D-29z135)

**Decision: CONTINUE.** The next task is round 170, **V-3c-4c-2**: the Clip details panel (`ArrangementDetailPanel`) buttons and fields. It is in `current-task.md`. The previous task is archived as `tasks/round-169.md`, an exact copy (sha256 `5ac812ff044e3289…`, checked with `cmp`).

## Inputs read
- **Active context:** `context/active-summary.md` first. `backlog.json` and `feature-status.md` were opened only for specific IDs (python and grep).
- **Round-169 reports:**
  - `tasks/round-169.md` and `a-round-169.md`.
  - `c-round-169.md` and `c-round-169.json`: PASS. `browserVerified` and `realVerified` are true, with 0 bugs. The only blocked row is fake-Bearer 403 (backend unavailable in cloud).
  - `gates/gate-round-169.json`: **published** `352dc91`, on both remotes.
  - `gates/round-169/review.md`: 9/10, nothing blocking. `verify.log` shows 171 files and 2564 tests passing, and the build is green.
- **Baseline:** HEAD = `352dc91` = the gate-169 commit. The tree is clean with 988 files.
- **User decision files:** `user-review/ableton-decisions.md` and `design-ux-decisions.md`. Every decision in them (ABL approvals, DUX-R-1…9, V-2b-DISPLAY "no serif", REVIEW-RECOMMENDATIONS) is already in `backlog.json`, checked by grep. Nothing new.
- **Checkpoint:** still no frontend-architect answer.
- **Regression:** `regression-last.json` is 2026-10-24, so the next one is due on or after 2026-10-27. It is not due today (2026-10-25).
- **Advisor:** available and consulted before writing. It confirmed the round and the rulings. It also asked for:
  - a check that the decision files really are recorded (done);
  - the disabled state as an informational row;
  - the 1280 collapsed start state in the recipes;
  - a FOCUS-RING-INFO note row;
  - the doc 138 status update.

  All of these are applied.
- **Project subagents:** none consulted. The rulings follow the precedents of rounds 166–169.

## Backlog updates (only from independent C evidence)
- **V-3c-4c-1 → მზადაა** (C round 169 PASS, `browserVerified` true, published `352dc91`). Round 169 → `c_pass_published`.
- **New Lows → `deferred_low_polish`** (2026-10-23 bug gate; none blocks):
  - **C-R169-N1-SEARCH-DOUBLE-RING:** pre-existing, with C's measurement. The likely owner is the protected `app.css`.
  - **GATE169-TEST-HYGIENE-LIBRARY-STRINGS:** gate-169 suggestion 3.
  - **B-R169-1280-SET-SELECTION-SQUASH:** a new B probe observation, pre-existing at `352dc91`. At 1280 the Set selection button is squeezed to 18/23 px, and its reason line is cut. It is not fixed in round 170, because the fix changes layout and the stage acceptance is 0 px.
- **Signals updated, not scheduled:**
  - **ARCH-R167-SURFACE-RECIPE:** the token set is in 9 components, and round 170 adds a 10th.
  - **ARCH-CHECKPOINT-V3C:** new pointer `b-round-169-checkpoint-request.md`.
- **Doc 138 status → Completed:** granted to A as D1 (gate-169 suggestion 1).
- `backlog.json` is now **version 159** (script `b-round-169/update-backlog.py`). `feature-status.md` was updated by `b-round-169/update-fs.py`.

## Why V-3c-4c-2, and the rulings
- **Fixed in advance:** `tasks/round-169.md` §7, "C PASS" row. No bug comes first.
- **Grants:** 3, plus 1 new doc (139).
- **B browser probe** (`b-round-169/v3c4c2-probe.cjs`; real Chromium, both viewports, states D0 nothing selected, D1 one clip, D2 collapsed):
  - Layout: **0.000 px** in every state.
  - Enabled buttons: 14.78 → 13.24, hover 6.58.
  - Disabled buttons: 5.38 → 4.82.
  - Fields: unchanged at 5.69.
- **Smallest honest choices:**
  - **R13:** the three outline buttons get SURF + MOTION + 8 px and keep `hover:text-brand` and `disabled:text-dim`. This is the V-3c-4a R1 precedent; no `disabled:opacity-40` is added.
  - **R3:** the fields change radius only. TH5, PM1/PM2 and F4 stay green without edits.
  - **R14:** the framed boxes (l.221 is locked by `detail-panel-polish` l.128, and l.702) go to V-3c-5. The fader, the resize handle and the dividers are excluded.
  - **All are user-vetoable** (`feature-status.md`).
- **Test hygiene asked of A:** helpers go inside the new describe, and unmount runs in `afterEach` or `finally`. This is gate-169 suggestion 3, applied to the new code only.

## Not complete, and why CONTINUE
Remaining scoped work:
- **VISUAL-A:** V-3c-4c-2/3, V-3c-5, DUX-R-5, M1, M3, M4 and ROOT-RECON-GRID-HARNESS.
- **After VISUAL-A:**
  - REVIEW-RECOMMENDATIONS;
  - T12-ADVANCED;
  - the deferred Lows (fixed before release);
  - the regression due 2026-10-27;
  - the final regression.
- **Awaiting Saba:** ABL-R-5/16/17, M5, phase 2, SRW-21 (`deferred_user`), Q-V3-ICON-SIZE, Q-R166-EXIT-NAME, Q-R167-ON-HOVER and B-R153-PREVIEW-DUR. None of these blocks the next task.

Nothing external is needed to continue.

## Commit readiness
Root has already published round 169 (`352dc91`). Round 170 is not ready until C passes it.

## Files written by B
- **Task and status files:**
  - `current-task.md`
  - `tasks/round-169.md`
  - `b-round-169-checkpoint-request.md`
  - `feature-status.md`
  - `backlog.json` (v159)
  - `b-next.json`
- **Pre-planning copies:** `b-round-169/{b-round-169-current-task.md,b-round-169-feature-status.md,b-round-169-b-next.json}-before` and `b-round-169/backlog-before-r170.json`.
- **Baseline lists and hashes:** `b-round-169-r170-{grants,new-files,tree-sha256,granted-start-sha256,vitest-base}.txt`.
- **Probe and support files:** `b-round-169/{v3c4c2-probe.cjs,tools/,out/,r170-granted-start/,update-backlog.py,update-fs.py}`.

No application source was changed (`git status --short` is empty).
