# B round 175 → round 176 planning (D-29z141)

**Decision: CONTINUE.** The next task is round 176, **DUX-R-5b-2a**: the mixer on-states go neutral and distinct, plus C's round-175 finding **A-R175-DETAIL-SEP-ACCENT**. It is written in `current-task.md`.
- **Archive:** the previous task is `tasks/round-175.md`, an exact copy of the round-175 `current-task.md` (sha256 `c3e47d47…`, checked with `cmp`). The archive did not exist before.
- **Baseline:** `gates/gate-round-175.json` is `published`, so the next task starts from its commit `c53eefc`. HEAD = `c53eefc`; the tree is clean with 997 files.

## Inputs read (as data)
- **Active context first:** `context/active-summary.md`. `backlog.json` and `feature-status.md` were opened only by ID, through python and grep.
- **Round-175 reports:**
  - `a-round-175.md`: 206/206 targeted tests, mutations m248–m257 all red, reviewer 9/10. A raised the separator gap itself.
  - `c-round-175.md` / `c-round-175.json`: **PASS**, `browserVerified` and `realVerified` true. 0 Critical/High/Medium and 1 Low (A-R175-DETAIL-SEP-ACCENT). Only the fake-Bearer 403 sub-check is blocked (backend unavailable in cloud).
  - `gates/gate-round-175.json`: **published** `c53eefc` on both remotes.
  - `gates/round-175/review.md`: 8.5/10, nothing blocking. Verify ran 174 files and 2589 tests, and the build passed.
- **User decision files:** `design-ux-decisions.md`, `ableton-decisions.md` and `direction-decision.md` have nothing new for this stage.
- **Checkpoint:** no root answer to `b-round-173-checkpoint-request.md`, so fallback (c) continues.
- **Regression:** `regression-last.json` = 2026-10-24, so it is due on or after 2026-10-27. Not today; the file is unchanged.
- **`root-pre-push-review.md` / `publication-checkpoint.json`:** the review is the old round-3 review; its findings were carried long ago. Nothing new.
- **Advisor:** available and consulted after orientation (before writing) and at the end. What it advised and what B did:
  - **Split 5b-2.** Done: 5b-2a covers the mixer on-states and the separator; 5b-2b covers the mode toggles. The 5b-2b recipe is fixed now (§0.4 of the task).
  - **Rebuild the whole inventory, because round 175 missed a site.** Done (§0.3 of the task), from a token-level scan of `app/components/arrangement/` and `studio-lab.tsx`. At the end consult the advisor found that B's first line-level grep hid lines ending in `focus-visible:ring-brand`. The rescan found these unclassified sites:
    - 5b-3: video import Lane l.723/731 and Library Add LibraryPreview l.332 (R35); `hover:text-brand` on DetailPanel l.752/861/1142; the `← CZABA` exit link StudioWorkspace l.2197.
    - Kept: the playheads DetailPanel l.180 and Ruler l.233 (K8); the marker name field MarkerRow l.847 (K10).
    - C now has a per-token **INVENTORY-GREP** row (0 unclassified).
  - **Mixed-Solo numbers corrected** at the end consult: the half paints over the `bg-foreground/5` base, so the predictions are 3.62 vs the header and 3.85 for the letter. The letter on the half is below 4.5:1, which is recorded as info; it improves on 1.88.
  - **The border carries a toggle's state.** A fg/20 fill against a hovered off button is only 1.44:1, so in 5b-2b the border (14.78) shows the on state.
  - **Mute vs Solo at 2.21:1** is recorded as a conscious, vetoable choice in which the M/S letter is the cue. C reports the ratio as information only.
  - **The semantic-token proposal** (gate-175 note (b)) was decided "no", and the reasons are written in the task.
  - **Bookkeeping** comes from C's evidence only.
- **Project subagents:** none consulted. The colours rest on B's WCAG computation (§0.1 of the task) and the approved rule. They are vetoable.

## Backlog updates (from independent C evidence only) — `backlog.json` v165
- **Round 175 → `c_pass_published` (`c53eefc`), and DUX-R-5b-1 → მზადაა.** DUX-R-5 itself stays open until 5b-3 passes C.
- **Round 176 dispatched** (D-29z141). Its plan record is VISUAL-A `dux_r5b2_plan_d29z141`. It holds the split, the M1–M6/B1/L1–L4 edits, the computation, the 5b-2b recipe and sites (with their test locks), the 5b-3 sites, R35, the semantic-token decision, the mutations, the C rows and the Ableton note.
- **Open findings added:**
  - A-R175-DETAIL-SEP-ACCENT (Low; scheduled in round 176 as B1).
  - C-R175-UNFILLED-TRACK, -PRESSED-THUMB, -ENABLED-LOOP-EDGE and -SELECTED-GROUP-BLOCK (all info).
  - GATE175-S2 → L4(b). GATE175-S3 → D1. GATE175-S5 (scrollbar jump: info, vetoable).
  - B-R175-INVENTORY-GAPS (info).
- **Updated:**
  - B-R174-ACCENT-EQ-BRAND: Solo vs Mute is resolved in 5b-2a.
  - GATE167-TOKEN-TEST-FRAGILITY gets a `round175_update`.
  - ARCH-CHECKPOINT-V3C gets a status note.
  - `architecture_signals` gets a round-175 entry.
- **Deferred Lows:** unchanged at 250. The new Low is scheduled, not deferred.
- **Progress board:** `feature-status.md` shows DUX-R-5b-1 მზადაა, 5b-2a მუშავდება, and 5b-2b and 5b-3 არ დაწყებულა, with the vetoable list.

## Why this task
- **C's bug comes first.** A-R175-DETAIL-SEP-ACCENT is the only open finding from round 175. It is cheap and is in a file this stage would grant anyway.
- **Then the stage fixed in advance** (`tasks/round-175.md` §7: C PASS → DUX-R-5b-2).
- **The split.** The full 5b-2 is about 23 files, including the protected `StudioWorkspace.tsx`, and it needs two recipes. The mixer on-states are one coherent part: 4 components and 4 test files. The mode toggles need the StudioWorkspace grant.
- **Colours (computed, vetoable):**
  - Mute on: filled `muted` grey. 6.68 vs the lane header and 7.06 for the letter.
  - Solo on: filled `foreground`. 14.78, and 15.62 for the letter.
  - Mixed Solo: a `foreground/40` half. Its letter is 4.20, against 1.88 today.
  - The separator: `foreground/50` (4.40–4.53), the same as the track-height handle.
  - The hover rule R2 stays, because Q-R167-ON-HOVER is still awaiting Saba.
- **The Ableton row is honest.** No Live source was captured for button colours, so parity is "not applicable / unverified". The grey-Mute analogy to Live's unlit Track Activator is marked as an inference, not a fact.

## Not complete, and why CONTINUE
- **Remaining work:**
  - VISUAL-A: DUX-R-5b-2a/2b/3, M1, M3, M4 and ROOT-RECON-GRID-HARNESS.
  - After VISUAL-A: STORE-REDESIGN (direction A decided), REVIEW-RECOMMENDATIONS (22 approved ids) and T12-ADVANCED.
  - The deferred Lows (250 entries), the regression due 2026-10-27 and the final regression.
- **Items awaiting Saba do not block the next task:** Q-V3-ICON-SIZE, Q-R166-EXIT-NAME, Q-R167-ON-HOVER, Q-V3C5-MODAL-RADIUS, ABL-R-5/16/17, M5 and phase 2. SRW-21 is `deferred_user`.
- Nothing external is needed to continue, so the decision is neither BLOCKED nor COMPLETE.

## Commit readiness
- Root has published round 175 (`c53eefc`). Purchase protection was preserved (G175-3: `/studio/middle-east` asks for sign-in, and the token request returns 401).
- Round 176 is not ready until C passes it.

## Files written by B
- **Planning files:** `current-task.md`, `tasks/round-175.md`, `feature-status.md`, `backlog.json` (v165), `b-next.json`, `b-round-175.md`.
- **Pre-planning copies:** `b-round-175/{b-round-175-current-task.md,b-round-175-feature-status.md,b-round-175-b-next.json}-before` and `b-round-175/backlog-before-r176.json`.
- **Baseline files:**
  - `b-round-175-r176-{grants,new-files,tree-sha256,granted-start-sha256,vitest-base}.txt`
  - `b-round-175/r176-granted-start/`
  - `b-round-175/out/vitest-base.json` (13 files, 184/184) and `b-round-175/out/tree-files.txt`
- **Scripts:** `b-round-175/update-backlog.py` and `b-round-175/update-fs.py`.

No application source was changed: `git status --short` is empty at `c53eefc`.
