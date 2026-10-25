# B round 172 → round 173 planning (D-29z138)

**Decision: CONTINUE.** The next task is round 173, **V-3c-5b**: the Overview at 10 px (root, outline overlay and view frame together), plus 8 px on the Transport readout and the Library preview waveform. It is in `current-task.md`. The previous task is archived as `tasks/round-172.md`, an exact copy (sha256 `529ad8f0fc98…`, checked with `cmp`; the archive did not exist before).

## Inputs read
- **Active context** first (`context/active-summary.md` headers; the full `backlog.json` and `feature-status.md` only by ID, through python and grep).
- **Round-172 reports (read as data):**
  - `a-round-172.md`: 362/362 targeted tests, mutations m227–m234 red, reviewer 9/10, Architecture note none.
  - `c-round-172.md` / `c-round-172.json`: **PASS**, `browserVerified` and `realVerified` true. Every §4 row passed at both viewports. The only blocked row is fake-Bearer 403 (backend unavailable in cloud). There are 2 pre-existing Lows and one note about grid-menu focus.
  - `gates/gate-round-172.json`: **published** `3810816` on both remotes. `gates/round-172/review.md`: 9/10, 4 Lows, nothing blocking.
- **Baseline:** HEAD = `3810816` = the gate-172 commit. The tree is clean with 992 files.
- **User decision files:** `ableton-decisions.md`, `design-ux-decisions.md` and `docs/technical/store-redesign/direction-decision.md` (still present, direction A). Nothing new for this stage.
- **Checkpoint** (`b-round-170-checkpoint-request.md`): no answer yet (third planning), so fallback (c) continues.
- **Regression:** `regression-last.json` = 2026-10-24, so it is due on or after 2026-10-27. Not today.
- **Advisor:** available, and consulted after orientation, before writing. It advised:
  - **Run a narrow-frame probe before ruling.** Done: B ran a read-only Playwright probe at `3810816`, `b-round-172/tools/probe-ov.cjs` → `b-round-172/out/probe-ov.json`. Results:
    - The Overview root is 956×64 (1440) / 796×64 (1280).
    - With one 101 s clip at max zoom, the frame is **27.05 / 18.59 px** wide.
    - At the right end, the frame runs 11.5 / 7.3 px past the root, which clips it.
  - **Move all three Overview layers together.** A 6 px frame inside a 10 px root would reopen the SABA-B-2 notch.
  - **Accept the capsule frame (vetoable) rather than add `min-w`** or change `overviewFrame`.
  - **Explicit grants** for OV1 and PNR2.
  - **Rule each leftover 6 px site.**
  - **Route C's notes and the gate findings** as recorded below.
- **Advisor at the end:** it found that m241 mutated the protected `StudioWorkspace.tsx`, so B removed it (R28 is proven by PNR5 plus C's RADIUS row). It also found that the BOX and NARROW-FRAME before-values claimed more than `probe-ov.json` holds; they are now limited to the root, overlay and frame in O0–O2, and the probe's click point is stated. L1 may add 2 `expect(`s.
- **Project subagents:** none consulted. The rulings follow the R21–R24 precedents.

## Backlog updates (only from independent C evidence) — `backlog.json` v162
- **V-3c-5a → მზადაა.** Round 172 → `c_pass_published`.
- **New Lows → `deferred_low_polish`** (both pre-existing, both need layout changes outside R21–R23):
  - C-R172-01: at 1280 the group-reason text crosses the bottom border of the P2 box. The cause is wrapping, not the radius.
  - C-R172-02: Set selection adds a footer line, and the Clip details panel jumps 20 px.
- **Harness facts:**
  - C-R172-GRID-ESCAPE-FOCUS-BODY. A real right-press on a non-focusable lane blurs the focused element first, so Escape sends focus to BODY. The acceptance wording is fixed from round 173 on: "focus returns to the opener" only when the opener is focusable.
  - C-R172-DETAIL-COLLAPSED-720.
- **Gate-172 review findings:**
  1. The doc 141 status → round 173 D1.
  2. twMerge does not know `rounded-panel` → signal GATE172-TWMERGE-RADIUS-PANEL, plus task rule R29.
  3. Safari may not clip the video to the rounded corner → Tech Lead manual check GATE172-SAFARI-VIDEO-RADIUS (the cloud is Chromium only).
  4. Exact-string locks → `GATE167-TOKEN-TEST-FRAGILITY.round172_update`.
- **Info:** B-R172-OV-FRAME-OVERFLOW, from B's probe. It is pre-existing and not scheduled.
- **Architecture:** `ARCH-R167-SURFACE-RECIPE.round172_update` and an `architecture_signals` entry (note: none). Neither is scheduled.
- **Plan record:** VISUAL-A `v3c5b_plan_d29z138` (probe, R25–R29, sites, locks, mutations, C rows).
- **Progress board:** `feature-status.md` shows V-3c-5a მზადაა and V-3c-5b მუშავდება, with the vetoable R25–R28.

## Why V-3c-5b, and the rulings
- **Fixed in advance:** `tasks/round-172.md` §7, row "C PASS". No Critical, High or Medium bug comes first.
- **The rulings** (all vetoable):
  - **R25:** the Overview is a panel → root, overlay and frame → `rounded-panel`, together. The capsule frame at extreme zoom is accepted.
  - **R26:** the readout is a field-like display → 8 px.
  - **R27:** the preview wave is a slider control → 8 px.
  - **R28:** the exit link stays at 6 px, because its radius only shapes the focus ring.
  - **R29:** no `rounded-panel` passes through `cn()` together with another `rounded-*`.
- **Scope does not shrink:** this completes V-3c-5. DUX-R-5, M1, M3, M4 and ROOT-RECON-GRID-HARNESS remain in VISUAL-A.
- **Grants:** 6 existing files plus 1 new one (doc 142). The frozen list has 986 files. The vitest base is 25 files, **423/423** at `3810816` (`b-round-172/out/vitest-base.json`). New locks are PNR4 and PNR5; the mutations are m235–m240 (granted files only).

## Architecture checkpoint
The request is still unanswered (third planning). This round adds no SURF/MOTION copy. When V-3c-5b passes, V-3c reaches a feature boundary, and B will then write a refreshed bounded request (`b-round-173-checkpoint-request.md`). B does not schedule the extraction on its own.

## Not complete, and why CONTINUE
- **Remaining:**
  - VISUAL-A: V-3c-5b, DUX-R-5, M1, M3, M4, ROOT-RECON-GRID-HARNESS.
  - After VISUAL-A: STORE-REDESIGN, REVIEW-RECOMMENDATIONS and T12-ADVANCED.
  - The deferred Lows (248 entries, fixed before release), the regression due 2026-10-27, and the final regression.
- **Items awaiting Saba** do not block the next task. Nothing external is needed to continue.

## Commit readiness
Root has published round 172 (`3810816`). Round 173 is not ready until C passes it.

## Files written by B
- `current-task.md`, `tasks/round-172.md`, `feature-status.md`, `backlog.json` (v162), `b-next.json`, `b-round-172.md`.
- **Pre-planning copies:** `b-round-172/{b-round-172-current-task.md,b-round-172-feature-status.md,b-round-172-b-next.json}-before` and `b-round-172/backlog-before-r173.json`.
- **Baseline files:** `b-round-172-r173-{grants,new-files,tree-sha256,granted-start-sha256,vitest-base}.txt`.
- **Support files:** `b-round-172/{r173-granted-start/,out/vitest-base.json,out/probe-ov.json,shots/,tools/probe-ov.cjs,tools/lib.cjs,update-backlog.py,update-fs.py}`.

No application source was changed: `git status --short` is empty at `3810816`.
