# B round 170 → round 171 planning (D-29z136)

**Decision: CONTINUE.** The next task is round 171, **V-3c-4c-3**: the Export dialog and video dock surfaces. It is in `current-task.md`. The previous task is archived as `tasks/round-170.md`, an exact copy (sha256 `2cfeee98614c6485…`, checked with `cmp`).

## Inputs read
- **Active context:** `context/active-summary.md` first. `backlog.json` and `feature-status.md` were opened only for specific IDs (python and grep).
- **Round-170 reports:**
  - `tasks/round-170.md` and `a-round-170.md`.
  - `c-round-170.md` and `c-round-170.json`: PASS. `browserVerified` and `realVerified` are true, with 0 bugs. The only blocked row is fake-Bearer 403 (backend unavailable in cloud).
  - `gates/gate-round-170.json`: **published** `fe6ea99`, on both remotes.
  - `gates/round-170/review.md`: 9/10, nothing blocking. Verify passed 171 files and 2566 tests, and the build is green.
- **Baseline:** HEAD = `fe6ea99` = the gate-170 commit. The tree is clean with 989 files.
- **User decision files:**
  - `user-review/ableton-decisions.md` and `design-ux-decisions.md` are unchanged; everything in them is already in the backlog.
  - **New:** `docs/technical/store-redesign/direction-decision.md` (direction A, 2026-10-25).
- **Checkpoint:** no frontend-architect answer yet.
- **Regression:** due on or after 2026-10-27, so not today (2026-10-25).
- **Advisor:** available and consulted three times: before writing, on R15, and at the end.
  - **Before writing**, it asked for:
    - the missing STORE-REDESIGN queue entry;
    - a case-insensitive lock grep (done; only TH11 touches the dock, and it is unchanged);
    - rulings on Cancel/Done, the cards, the dock and MarkerRow l.811;
    - the Cancel render state as a C row;
    - a checkpoint request at the V-3c-4 boundary.
  - **At the end** it found that the task's change IDs (E1–E4, V1–V2) collided with the state names (E0–E2, V0/V1). They were renamed S1–S4 and K1–K2.
  - **On the Export button**, its first suggestion was to keep the solid fill. I showed it `transport-surface-ui` l.336–343 (the transport Export already dropped `bg-brand`) and the R6/R11 precedents. It then agreed with **R15** (the Export look), with keepFill recorded as the vetoable fallback.
- **Project subagents:** none consulted. The rulings follow the precedents of rounds 166–170.

## Backlog updates (only from independent C evidence) — `backlog.json` v160
- **V-3c-4c-2 → მზადაა** (C round 170 PASS, `browserVerified` true, published `fe6ea99`). Round 170 → `c_pass_published`.
- **STORE-REDESIGN added** to `post_current_stage_queue`, after VISUAL-A-OBSIDIAN and before REVIEW-RECOMMENDATIONS, as the 2026-10-25 workflow rule requires. It was missing.
  - **Recorded with it:** stages STORE-0…5, the binding keep-list, direction A, and that STORE-2…5 are no longer gated.
  - **Prerequisite:** REVIEW-RECOMMENDATIONS now also requires STORE-REDESIGN.
  - **Root dependency:** neither `mock-api/` nor any `cloud/run.sh` exists under `/home/runner/czaba-project`. Root needs to confirm the hook that starts the mock API.
- **New Low → `deferred_low_polish`:** GATE170-DISABLED-HOVER-TEXT-VARIANT (gate-170 suggestion 1: `enabled:hover:text-brand` on Set selection and 0 dB).
- **C-R169-N1 scope widened:** C round 170 saw the same double focus ring on the Detail inputs and Set selection.
- **Signals, not scheduled:**
  - ARCH-R167-SURFACE-RECIPE: about 17 copies in 10 files today; round 171 adds 3 in an 11th file.
  - C-R168-BORDERLESS-REDUCED-MOTION: now also covers the dock buttons.
- **New `harness_facts` entry:** C-R170-LANE-RANGE-TESTID (single-lane ranges have no `arrangement-lane-range` testid).
- **Progress board:** `feature-status.md` updated (V-3c-4c-2 მზადაა, V-3c-4c-3 მუშავდება, STORE-REDESIGN row added).

## Why V-3c-4c-3, and the rulings
- **Fixed in advance:** `tasks/round-170.md` §7, "C PASS" row. No bug comes first.
- **B browser probe** (`b-round-170/v3c4c3-probe.cjs`; real Chromium at both viewports; states E0 empty dialog, E1 dialog with a clip, V0 dock with a real video, V1 floating):
  - layout **0.000 px** in every state and both primary variants;
  - Done 14.78 → 13.24 (hover 12.35);
  - Export 8.32 → 7.05 (hover 6.58);
  - cards and dock: colours unchanged.
  - Cancel only exists during a render, so it is C's E2 row with a known recipe (`c-round-100/tools/lib100.cjs`). If C cannot catch it, the stage is not მზადაა.
- **The rulings** (all vetoable):
  - **R15:** Export takes the Export look; keepFill is the fallback.
  - **R16:** Cancel and Done get SURF; Done keeps its locked `disabled:opacity-40`.
  - **R17:** the cards change radius only.
  - **R18:** the dock buttons change radius only and keep `bg-background/80`.
  - **R19:** the frames go to V-3c-5.
  - **R20:** the MarkerRow l.811 chip is closed and stays out of V-3c. It is a label inside a button, and a pill radius would clip its truncated text.
- **Grants:** 5, plus 1 new doc (140). Doc 139's status goes to Completed (gate-170 suggestion 5).
- **Baseline:** 19 vitest files, 279/279 (`b-round-170/out/vitest-base.json`). New locks ESU1, ECR1 and VFR1; mutations m219–m226.

## Architecture checkpoint
V-3c-4 ends with round 171, which is a feature boundary. I wrote `b-round-170-checkpoint-request.md` for root, with three questions: keep or extract the surface recipe, drop the `!` suffixes, and the order against V-3c-5. Without an answer, fallback (c) continues, and B does not schedule the extraction on its own.

## Not complete, and why CONTINUE
Remaining scoped work:
- **VISUAL-A:** V-3c-4c-3, V-3c-5, DUX-R-5, M1, M3, M4 and ROOT-RECON-GRID-HARNESS.
- **After VISUAL-A:**
  - STORE-REDESIGN (STORE-0…5);
  - REVIEW-RECOMMENDATIONS;
  - T12-ADVANCED;
  - the deferred Lows (fixed before release);
  - the regression due 2026-10-27;
  - the final regression.
- **Awaiting Saba:** ABL-R-5/16/17, M5, phase 2, SRW-21 (`deferred_user`), Q-V3-ICON-SIZE, Q-R166-EXIT-NAME, Q-R167-ON-HOVER and B-R153-PREVIEW-DUR. None of these blocks the next task.

Nothing external is needed to continue.

## Commit readiness
Root has already published round 170 (`fe6ea99`). Round 171 is not ready until C passes it.

## Files written by B
- **Task and status files:**
  - `current-task.md`
  - `tasks/round-170.md`
  - `b-round-170-checkpoint-request.md`
  - `feature-status.md`
  - `backlog.json` (v160)
  - `b-next.json`
  - `b-round-170.md`
- **Pre-planning copies:** `b-round-170/{b-round-170-current-task.md,b-round-170-feature-status.md,b-round-170-b-next.json}-before` and `b-round-170/backlog-before-r171.json`.
- **Baseline lists and hashes:** `b-round-170-r171-{grants,new-files,tree-sha256,granted-start-sha256,vitest-base}.txt`.
- **Probe and support files:** `b-round-170/{v3c4c3-probe.cjs,tools/,out/,r171-granted-start/,update-backlog.py,update-fs.py}`.

No application source was changed (`git status --short` is empty).
