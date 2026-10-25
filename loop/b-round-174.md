# B round 174 → round 175 planning (D-29z140)

**Decision: CONTINUE.** The next task is round 175, **DUX-R-5b-1**: controls and affordances go neutral. It is written in `current-task.md`.
- **Archive:** the previous task is `tasks/round-174.md`, an exact copy of the round-174 `current-task.md` (sha256 `dcb5efe3…`, checked with `cmp`). The archive did not exist before.

## Inputs read (as data)
- **Active context first:** `context/active-summary.md`. `backlog.json`, `feature-status.md` and `design-ux-review.md` were opened only by ID, through python and grep.
- **Round-174 reports:**
  - `a-round-174.md`: 121/121 targeted tests, mutations m241–m247 red, reviewer 8.5/10. Its Architecture note is Signal 3 (keep): the copied harness belongs to ROOT-RECON-GRID-HARNESS.
  - `c-round-174.md` / `c-round-174.json`: **PASS**, `browserVerified` and `realVerified` true. 0 Critical/High/Medium and 1 Low info (C-R174-ENV-BELOW-DROP). Only the fake-Bearer 403 row is blocked (backend unavailable in cloud).
  - `gates/gate-round-174.json`: **published** `0a4a41e` on both remotes.
  - `gates/round-174/review.md`: 9/10, 3 Lows and 2 info. Its Architecture note is Signal 3, with a post-5b test-helper proposal.
- **Baseline for round 175:** HEAD = `0a4a41e`, the gate-174 commit. The tree is clean, with 995 files.
- **User decision files:** `design-ux-decisions.md` holds the DUX-R-5 wording, quoted in the task. `ableton-decisions.md` and `docs/technical/store-redesign/direction-decision.md` have nothing new for this stage.
- **Checkpoint:** no root answer has arrived, so fallback (c) continues.
- **Regression:** `regression-last.json` = 2026-10-24, so it is due on or after 2026-10-27. Not today, and the file is unchanged.
- **Advisor:** available and consulted after orientation, before writing. What it advised and what B did:
  - **Write the full 5b site table now, but make round 175 only stage 5b-1 (affordances).** Done. 5b-2 (on-states) and 5b-3 (labels, ghosts, dialog) are recorded with line numbers.
  - **Grep the test locks.** Done. Only `track-layout.test.tsx` l.801/835 locks a 5b-1 token, and it is granted. `detail-panel-reason` imports the scrollbar constant, so it does not lock a string.
  - **Q-R167-ON-HOVER** is recorded as a 5b-2 constraint.
  - **`app/components/studio/*`** is ruled out of scope explicitly, with the reason.
  - **The accent ≡ brand finding** is recorded (§0.3 of the task).
  - **C must pixel-measure `accent-color`.** The ENV-VIS and RV1 re-runs are included.
  - **Round-174 bookkeeping** comes from C's evidence only.
- **Project subagents:** none consulted. The colour choices rest on B's WCAG computation (§0.1 of the task) and the approved spec. They are vetoable.

## Backlog updates (from independent C evidence only) — `backlog.json` v164
- **Round 174 → `c_pass_published` (`0a4a41e`), and DUX-R-5a → მზადაა.** DUX-R-5 itself is not done: its done condition is now the 5b-3 C PASS.
- **Open findings:**
  - C-R174-ENV-BELOW-DROP (info): B agrees with C's disposition, so there is no code change and no deferred entry.
  - B-R174-ACCENT-EQ-BRAND (Low): scheduled in 5b-2 and 5b-3, not deferred.
  - GATE174-S1-FIXED-CN → round 175 A9.
  - GATE174-S2-DOC143-STATUS → round 175 D1.
  - GATE174-S4-R31-CUE (info).
  - GATE174-OVERVIEW-LADDER-NONMONOTONIC (info, vetoable with R33).
- **Deferred Lows:** gate-174 suggestion 3 is merged into the existing GATE173-S4 entry (`round174_update`), so the count stays at 250.
- **Signals:** `GATE167-TOKEN-TEST-FRAGILITY.round174_update` (the post-5b role-based test helper), the `ARCH-CHECKPOINT-V3C` status, and the `architecture_signals` round-174 entry. None of them is scheduled.
- **Plan record:** VISUAL-A `dux_r5b_plan_d29z140`. It holds R34, K7–K12, the out-of-scope note, the 5b-1 edits, the 5b-2 and 5b-3 site lists, the computation, the mutations and the C rows.
- **Progress board:** `feature-status.md` shows DUX-R-5a მზადაა, 5b-1 მუშავდება, and 5b-2 and 5b-3 არ დაწყებულა, with the vetoable list.

## Why 5b-1, and the split
- **Fixed in advance:** `tasks/round-174.md` §7, row "C PASS" → DUX-R-5b. No Critical, High or Medium bug comes first.
- **The inventory is too large for one round.** About 75 brass sites remain outside the focus rings. The policy says one feature stage per round, and the full scope is kept.
- **5b-1 goes first** because its sites are the least ambiguous:
  - They are controls you grab or hover, with no state meaning.
  - Only one test locks them.
  - They include the fader thumbs that F-9 names.
- **5b-2 needs a product rule first.** The on-states must get distinct neutral targets (B-R174-ACCENT-EQ-BRAND), and Q-R167-ON-HOVER is still open.
- **5b-3 covers the remaining labels and dialog sites.**
- **R34 (vetoable) draws the brass line:** brass stays on selecting an object, on playheads, on the primary action and on focus.
  - So the active track, the selected rows, the marker, the Library node, the marquee and the chosen Export option stay brass.
  - Toggles, affordances, labels and warnings go neutral.
- **Colour choices** (computed, vetoable):
  - `accent-foreground` thumbs (14.78).
  - A hollow `bg-background` fade handle, so it never looks like the filled envelope point.
  - `foreground/50` hover edges (4.30–4.53; `/40` was too close to 3:1).
  - A `bg-foreground` scrollbar thumb on hover (a 2.75 step from the `dim` rest).
  - `foreground/25` unselected group blocks (≈1.98, today 1.57). This keeps the selected block 1.84× brighter.

## Not complete, and why CONTINUE
- **Remaining work:**
  - VISUAL-A: DUX-R-5b-1/2/3, M1, M3, M4 and ROOT-RECON-GRID-HARNESS.
  - After VISUAL-A: STORE-REDESIGN (direction A decided), REVIEW-RECOMMENDATIONS (22 approved ids) and T12-ADVANCED.
  - The deferred Lows (250 entries, fixed before release), the regression due 2026-10-27 and the final regression.
- **Items awaiting Saba do not block the next task.** They include Q-V3-ICON-SIZE, Q-R166-EXIT-NAME, Q-R167-ON-HOVER, Q-V3C5-MODAL-RADIUS, ABL-R-5/16/17, M5 and phase 2.
- **SRW-21** is `deferred_user`.
- Nothing external is needed to continue, so the decision is neither BLOCKED nor COMPLETE.

## Commit readiness
- Root has published round 174 (`0a4a41e`). Purchase protection was preserved (G174-3: `/studio/middle-east` asks for sign-in, and the token request returns 401).
- Round 175 is not ready until C passes it.

## Files written by B
- **Planning files:** `current-task.md`, `tasks/round-174.md`, `feature-status.md`, `backlog.json` (v164), `b-next.json`, `b-round-174.md`.
- **Pre-planning copies:** `b-round-174/{b-round-174-current-task.md,b-round-174-feature-status.md,b-round-174-b-next.json}-before` and `b-round-174/backlog-before-r175.json`.
- **Baseline files:**
  - `b-round-174-r175-{grants,new-files,tree-sha256,granted-start-sha256,vitest-base}.txt`
  - `b-round-174/r175-granted-start/`
  - `b-round-174/out/vitest-base.json` (13 files, 199/199) and `b-round-174/out/tree-files.txt`
- **Scripts:** `b-round-174/update-backlog.py`, `b-round-174/update-fs.py`.

No application source was changed: `git status --short` is empty at `0a4a41e`.

## Advisor end-of-task review
B wrote every deliverable before the end consult, then applied what it advised to `current-task.md`:
1. **NO-BRASS-AFFORD and CONTRAST-DUX5B1:** the trim edge is scanned and measured on an **unselected** clip, body rows only. The edge is `inset-y-0`, so on a selected clip it composites over the K1 brass header; that overlap is now info. The loop edge is measured on a **disabled** loop.
2. **Held thumb and dragged height handle:** the K4 focus ring is masked (inset 3 px, or the centre row only), or the two frames are read as colour values instead. A focus ring no longer counts as a failure.
3. **Thumb contrast:** the surface is now defined. The thumb is measured against the **unfilled** track and against the backdrop. The thumb against the filled part is ≈1:1 by design and only recorded. §7 has a pre-ruled fallback: if the thumb is below 3:1 against the unfilled track, the fix-up is `accent-muted`.
4. **RV1:** it now uses the exact round-174 files, `c-round-174/out/d6/d6-{1440,1280}-r1.json`, with `cmp-d6-174.cjs`.
5. **DXA2:** it now points A at the `clip-fades-ui.test.tsx` mount recipe (`FADE_HANDLE_MIN_CLIP_PX` = 24).
6. **DXA7:** the lock on the multi-line `cn(` fragment was dropped; it could not be grepped. The two plain-string locks remain.
- **`backlog.json`:** the plan record `dux_r5b_plan_d29z140` now holds `pre_ruled_fallback` and `scan_exclusions`.
