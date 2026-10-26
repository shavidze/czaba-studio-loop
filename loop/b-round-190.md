# B: round 190 → round 191 planning (D-29z156)

Date: 2026-10-26 · Author: B · Advisor: available. Consulted twice before writing (orientation, then reconciling with B's browser probe) and once at the end.

## Inputs read
- **Round 190 files:** `tasks/round-190.md` (the archived round-190 task; `cp` + `cmp` OK), `a-round-190.md`, `c-round-190.md`, `c-round-190.json`.
- **Gate:** `gates/gate-round-190.json` is **published**: commit `338564e` (rounds 189 + 190), and both remotes match. That commit is the baseline for round 191. `git status` is clean.
- **Context and policy:** `context/active-summary.md`, `regression-last.json` (2026-10-24, round 122), the policy sections "Saba's bug and the performance queue (2026-10-26)" and "Retrospective".
- **By ID only:** `backlog.json` (STORE-REDESIGN, regression_rounds, open_findings, rounds, post_current_stage_queue) and `feature-status.md` (§3, §7).
- **Saba's screenshot:** `user-review/img/saba-2026-10-26-volume-fader-click.png`. B viewed it.
- **Source, read-only:** the 6 range inputs (`ArrangementLane.tsx:752/799`, `ArrangementGroupHeader.tsx:314`, `ArrangementMaster.tsx:181`, `ArrangementDetailPanel.tsx:817`, `ArrangementTransport.tsx:274`), `app.css:373-382` (global `:focus-visible`) and `app.css:3920` (Obsidian tokens), `studio-scrollbar.ts`, and DXA1 in `affordance-colour-ui.test.tsx`.

## Round 190 result, from evidence
- **C PASS:** `browserVerified=true`, `realVerified=true`. 16 rows passed, 0 failed, 0 blocked, 0 bugs.
- **CLS:** fresh-mode CLS median 0.00005 / 0.0014 / 0.0009 at 375 / 1280 / 1440, with 0 overlay-sourced shift.
- **Cause and fix:** A confirmed the cause by bisect and an ancestor probe. The `PageTransition` transform was acting as the containing block of the fixed overlay. The fix is a portal to `body`.
- **Backlog effect:**
  - STORE-1d → **მზადაა**, and **STORE-1 is complete**.
  - C-R189-01 and C-R189-02 are closed.
- **Routing:**
  - **C-R190-I1** (the portal has no unit guard; also A's reviewer Medium #1). B decision: add a `parentElement === document.body` case in the next round that owns `SpotlightLoader.tsx` (STORE-5), and add an overlay parent/height + fresh-CLS check to the regression store smoke.
  - **I2:** regression harness rule.
  - **I4** (ArrowDown scrolls the page under the loader) → `deferred_low_polish`.
  - **I3, I5:** info.
  - **Reviewer Architecture note** (the `PageTransition` transform is the containing block for fixed overlays in routes) → signal `ARCH-R190-PAGETRANSITION-FIXED`, not scheduled. Two of the files it names are protected.

## Decision for round 191: SABA-B-3
- **Why SABA-B-3 now:** Saba's 2026-10-26 order makes it a Medium and "the next round's task, ahead of the remaining STORE stages".
- **Regression timing:** regression is **not** due: 2026-10-24 + 2 days, and it is due on or after 2026-10-27. The round-190 task predicted that round 191 would be the regression round, assuming planning on 2026-10-27. Planning happened on 2026-10-26, so that prediction is wrong, and the regression moves to the first planning on or after 2026-10-27.
- **B's reproduction** (`b-round-190/tools/fader-probe.cjs`, `b-round-190/shots/vol-*.png`). It matches Saba's screenshot.
  - On a mouse press `:focus-visible` matches. The computed style is then a `box-shadow` 2 px brass ring plus an `outline` of 2 px solid brass.
  - The outline is there even though the class list has `focus-visible:outline-none`.
  - **Hypothesis**, left to A's K0 to confirm: the global rule in `app.css:379` is unlayered and beats Tailwind v4's layered utility.
- **The fill question, and how B resolved it:**
  - The rest fill is ivory (`accent-foreground`, DUX-R-5b-1). Saba's text names graphite track + brass value fill + normal thumb.
  - The advisor first suggested routing the brass fill to Saba as a question. B's probe then showed that the brass fill is a new target, not a description of the current look. Treating it as `awaiting_user` would have deferred an explicit request without authorization. The advisor then agreed.
  - **R68** therefore implements Saba's look on the four faders he named. It is vetoable and supersedes DUX-R-5b-1 for those fills only.
  - **R69:** one thin offset ring on all six range controls.
  - **R70:** Pan and Zoom get the focus fix only.
  - **R71:** one shared module.
- **Smallest honest scope.** The 6 range inputs share one class string, so fixing only the 4 that Saba named would leave Pan, 40 px away, with the same box. Pan and Zoom get only the ring fix, not the brass fill.
- **Test ownership:** DXA1 must change, so it is a grant limited to that case and its helper. The other colour suites are frozen. If one turns red, A changes the implementation or stops and reports.
- **Ableton row:** no source was consulted. This is a CZABA visual-state bug with a target set by Saba. Parity: არ ეხება (not applicable).
- **Baseline files:**
  - `b-round-190-r191-tree-sha256.txt`: 1013 entries, OK from the store root.
  - `b-round-190-r191-grants.txt`: 6 files.
  - `b-round-190-r191-new-files.txt`: 3 files.
  - `b-round-190-r191-granted-start-sha256.txt`, and start copies in `b-round-190/r191-granted-start/`.

## Other recorded decisions
- **STUDIO-PERFORMANCE** is added to `post_current_stage_queue` after REVIEW-RECOMMENDATIONS and before T12-ADVANCED, with `docs/technical/performance/perf-plan.md`. PERF-1 comes first, and B consults `performance-optimizer` and `tech-lead` before each PERF task.
- **`retro_policy`** is recorded in `backlog.json`. The first RETRO comes after STORE-REDESIGN or at round 200, whichever is first, so it is not due now.
- **New signal `GLOBAL-FOCUS-VISIBLE-UNLAYERED`:** B counted 53 component sites with `focus-visible:outline-none focus-visible:ring-2`, which likely render a double ring. It belongs to the C-R169-N1 class and is a RETRO systemic-task candidate. It is not scheduled now.
- **Architecture checkpoint:** no new feature boundary. `b-round-183-checkpoint-request.md` is still pending, and fallback (c) continues. The next checkpoint point is the STORE-REDESIGN exit, where `ARCH-R190-PAGETRANSITION-FIXED` is a candidate question.
- **Project subagents:** none consulted this round. The task is a bounded bug fix with an explicit user target.

## Files written
- **Archive and backups:** `tasks/round-190.md` (archive) and `b-round-190/`, which holds the before-copies of current-task, backlog, feature-status, b-next and regression-last, plus the start copies, the probe tool and the shots.
- **Round 191 task:** `current-task.md`.
- **`backlog.json` (version 176):** the STORE-REDESIGN status and `store1d_fixup_result`; STUDIO-PERFORMANCE; `retro_policy`; open_findings SABA-B-3, C-R190-INFO, A-R190-SIGNALS, ARCH-R190-PAGETRANSITION-FIXED and GLOBAL-FOCUS-VISIBLE-UNLAYERED; C-R189-01/02 closed; C-R190-I4 deferred; regression scope additions; rounds 190 and 191.
- **Status and next step:** `feature-status.md`, `b-next.json`.
- `regression-last.json` is unchanged.

## Readiness for commit
Round 190 is already published (`338564e`). Round 191 is not ready until C passes it.

## Changes after the final advisor review
- **Ring geometry.** Three level faders are `h-1`, and the ≈ 16 px thumb overflows them, so a ring that follows the input box would cut through the thumb. Changes:
  - K1 now keeps the input's **width** fixed but lets its **height** grow so that its box encloses the thumb. The track thickness, the thumb size, and the row, panel and M/S/readout boxes stay within ± 1 px.
  - PRESS-191 adds: "the ring does not cross the thumb".
  - LAYOUT-191 and the STUDIO-RV-191 mask use the fader rect (the input box ∪ the thumb bbox).
- The backlog `SABA-B-3` entry records the same relaxation.

## For Saba (vetoable)
- **R68 changes the rest look of the track, group, Master and Clip Gain faders.** Their fill goes from neutral ivory to brass, and the thumb stays ivory, as you described.
- **Wider than the four faders you named:** Pan (in the same lane file) and the transport **Zoom** slider (`ArrangementTransport.tsx`) carry the identical class string and the same box bug. They get **only** the single thin focus ring (R69/R70). Their look is otherwise unchanged, with no brass fill.
