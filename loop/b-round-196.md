# B — Round 196 → 197 planning (D-29z162)

Date: 2026-10-26 · Author: B · Advisor: **used** (two calls: before writing and a review after writing; both adopted, see §7).

## 1. Inputs read
- `current-task.md` (round 196), `a-round-196.md` (including the reviewer's Architecture note), `c-round-196.md` and `c-round-196.json`.
- `gates/gate-round-196.json`: **skipped** ("C taskStatus FAIL"). The baseline HEAD stays `7339cd5`, and the round-196 tree is still uncommitted.
- `env-status.json`: store 200. `regression-last.json`: 2026-10-24, round 122, so a regression round is due at planning on or after 2026-10-27. Today is 2026-10-26, so it is not due yet.
- `context/active-summary.md`, header only, and `backlog.json`, by id (SABA-B-4, `rounds[196]`, `narrow_grants`, `deferred_low_polish`).
- Source, read-only: `ArrangementMarkerRow.tsx` (the flag, ~l.796) and `StudioWorkspace.tsx` (the scroller ~l.2255, `refreshTrackLaneLayout` ~l.695, ResizeObserver ~l.1103). C's shots `marker-ref-vs-tree.png` and `r1280-video-row.png`, and C's 1280 stop data (i66–74).
- **Archive:** `tasks/round-196.md` = round-196 `current-task.md` (`cmp` OK). It was created before the new task was written.

## 2. Acceptance results used (independently evidenced by C)
- **C round 196: FAIL**, `browserVerified=true`, `realVerified=true`. 13 rows passed. **RING-KEY-196 failed** on C-R196-01. Nothing was blocked or notRun.
- **Backlog changes, from this evidence only:**
  - SABA-B-4: status changed to "stage 1 implemented, C FAIL, fix-up round 197". It is **not** მზადაა, and nothing in `closes_on_stage1_pass` is closed.
  - C-R196-01 and C-R196-02 were added as open Mediums.
  - C-R196-03 became a stage-2 input.
  - C-R196-04 is `closed_ruled` (R90).
  - C-R196-05 went to `deferred_low_polish` (now 273 entries).
  - `rounds[196]` status was set to FAIL. Its item text was corrected from "h-3.5" to **h-4**, which is what the task specified and what C measured.
- Nothing was published, so nothing moves to done.

## 3. Decision: round 197 = SABA-B-4 stage 1 fix-up (two tightly related Mediums)
- **Policy basis:**
  - Round 196 §7 row 2: a Medium+ failure in Studio focus or a11y gets one bounded fix-up ahead of the regression round.
  - The 2026-10-23 bug gate: Mediums are fixed before new scope.
  - The round limit is ≤ 3 tightly related bugs. Both bugs here are about keyboard focus visibility in the Studio.
- **C-R196-01 (marker flag ring 1.45:1).**
  - **Cause:** the inset ring on the rectangular `h-5` button lands exactly on the centred `h-4` pill's brass border (the selected state) and next to the brass stem.
  - **R88:** first try a measured per-site offset on the flag's own box, keeping ≥ 1 device px of background clear of the pill and the stem. Fall back to making the button the pill, with the hit area kept.
  - `group-focus` and any second recipe are forbidden: SFR2 already denies them, and that is the point of SABA-B-4.
- **C-R196-02 (Video row focus under the sticky chrome, pre-existing).**
  - **Smallest honest fix (R89):** scroller `scroll-padding-top` = the chrome height, set in the existing measured layout path.
  - Whether Chromium honours scroll-padding for focus scrolling is **unconfirmed**, so A must probe it live.
  - The **stop rule** blocks any bigger mechanism: no focusin handler and no `scrollIntoView`. If the probe fails, R89 is reverted and C-R196-02 gets its own round. That way it cannot turn round 197 into a second FAIL.
- **C-R196-04 (width).**
  - The round-196 acceptance "computed 1.5px" could not be met in Chromium. That is a B spec defect, not an A or C bug.
  - **R90:** keep the declared `1.5px` (Saba's value; Firefox and Safari render it). C accepts a computed `1px` or `1.5px`.
  - `2px` was rejected as heavier, which is the opposite of Saba's complaint.
- **Lows:**
  - C-R196-05 is deferred, because the Library file stays frozen.
  - C-R196-03 belongs to stage 2.
  - The reviewer's leftover Lows from round 196 are minor test hygiene. They are recorded in `a-round-196.md` and not scheduled.

## 4. Scope bookkeeping
- **Baseline:** `7339cd5` + the round-196 tree (31 ` M`, 5 `??`), recorded in `b-round-196/git-status-at-planning.txt`. A's `a-round-196/end-sha256.txt` re-checked OK.
- **Grants (6):**
  - `ArrangementMarkerRow.tsx` (the flag only)
  - `StudioWorkspace.tsx` (R89 only)
  - `studio-focus.ts` (one constant)
  - `studio-focus-ring.test.ts`
  - `markers-ui.test.tsx` (token swaps)
  - doc 159 (a Round-197 section)
- **New (1):** `focus-reveal-ui.test.tsx`.
- **Pre-authorised:** flag-token swaps in other `app/lib/arrangement/__tests__/*`.
- **Frozen:** `b-round-196-r197-tree-sha256.txt`, 1023 entries = 1024 tracked + 5 untracked − 6 grants, checked OK from the store root.
- **Start copies:** `b-round-196/r197-granted-start/`.
- **Untouched:** no protected auth or purchase file, no `root.tsx`, no `app.css`.
- **Backups:** `b-round-196/backlog-before-r197.json`, `feature-status-before-r197.md` and `b-next-before-r197.json`.
- **On PASS:** root publishes 196 + 197 together.

## 5. Signals recorded (not scheduled)
- **A-R196-ARCH-SIGNALS** (`architecture_signals`), verbatim from `a-round-196.md`:
  - **Signal 4:** move the R85 mount out of `StudioWorkspace` at the stage-2 store-mount decision; this also fixes the unconditional-cleanup Low.
  - **Signal 2:** the `--focus-offset` string is shared between two files.
  - **Signal 3:** points to ARCH-R193-THEME-REGION.
- **Checkpoint:** no new frontend-architect request. The `app.css` shared-region addendum is already in `b-round-183-checkpoint-request.md`.
- **Workflow drift:** `agent-workflow.md` still lacks the policy sections from SABA-B-3 onward (root note).

## 6. Queue after round 197
1. **Round 198: REGRESSION**, if planned on or after 2026-10-27. It includes SABA-B-4 stage 1. C-R196-02 gets its own round right after it if the R89 stop rule fired.
2. **SABA-B-4 stage 2** (store pages), with C-R196-03 as an input and the store-mount decision (Signal 4).
3. **STORE-2b, 2c, 2d**, then STORE-3..5.
4. **RETRO** at round 200, or at the STORE-REDESIGN exit.
5. **REVIEW-RECOMMENDATIONS**, then STUDIO-PERFORMANCE, then T12-ADVANCED.
6. **PHASE2-VIDEO-SCORING** stays gated on the user go-ahead (skip rule).
7. **PHASE2B-SPOTTING**, STUDIO-AGENT-COMMANDS and RECORDING-META-S1.
8. Backend-blocked rows, Tech Lead manual checks, and `deferred_low_polish` before final acceptance.

## 7. Advisor
- Consulted once, before writing. Adopted:
  - the baseline pattern from the 193→194 fix-up (a new frozen list over the round-196 tree, not a reuse of the round-195 list);
  - option (a) first, (b) as the fallback, `group-focus` rejected;
  - C checks both the selected and the unselected flag;
  - R89 through the existing chrome-height measurement, with a stop rule;
  - the R90 ruling, plus a rewritten C width acceptance;
  - C-R196-05 deferred and C-R196-03 attached to stage 2;
  - the correction of the `rounds[196]` record.
- **A second call reviewed the written task.** It found that R88 option (a), as first written, was geometrically unreachable:
  - the pill has 0 px clearance on the right and the stem fills column 0–1, so no offset alone could keep the ring clear of both;
  - (b) has the same bottom-cover problem.
- **The task was amended:**
  - (a) is now `pr-1` (transparent, the box 4 px wider) plus a measured edge offset, expected −1 px;
  - the stem-gap clause was dropped; each ring side is judged by inner **and** outer neighbour ≥ 3:1, with ≥ 1 px clear of the pill border;
  - (b) now states that it needs its own measured offset;
  - SFR6, REST-197 and SCOPE-197 allow `pr-1`;
  - the wording was fixed to "three-bug limit (two here)".
- No conflict with B's own evidence.

## 8. Commit readiness (for root)
- Nothing is commit-ready. The round-196 tree waits for the round-197 C PASS. After that, root publishes 196 + 197 against `7339cd5`.
