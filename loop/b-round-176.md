# B round 176 → round 177 planning (D-29z142)

**Decision: CONTINUE.** The next task is round 177, **DUX-R-5b-2b**: the mode toggles go neutral, and the border carries the on state. Gate-176 suggestion 1 (restore two kept-site count locks) is in the same round. The task is in `current-task.md`.
- **Archive:** the previous task is `tasks/round-176.md`, an exact copy of the round-176 `current-task.md` (sha256 `5e55558d…`, checked with `cmp`). The archive did not exist before.
- **Baseline:** `gates/gate-round-176.json` is `published`, so the next task starts from its commit `ff3f710`. HEAD = `ff3f710`; the tree is clean with 999 files.

## Inputs read (as data)
- **Active context first:** `context/active-summary.md` (head). `backlog.json` and `feature-status.md` were opened only by ID, through python and grep.
- **Round-176 reports:**
  - `a-round-176.md`: 190/190 targeted, m258–m265 all red, reviewer 9/10. A found that tailwind-merge drops the mixed base fill (A-R176-MIXED-REST-BASE).
  - `c-round-176.md` / `c-round-176.json`: **PASS**, `browserVerified` and `realVerified` true, **0 bugs**, 6 infos. Only the fake-Bearer 403 sub-check is blocked (backend unavailable in cloud).
  - `gates/gate-round-176.json`: **published** `ff3f710` on both remotes.
  - `gates/round-176/review.md`: 8/10, nothing blocking. Verify ran 175 files and 2595 tests, and the build passed.
- **User decision files:** `design-ux-decisions.md`, `ableton-decisions.md` and `direction-decision.md` were re-read. Nothing new for this stage.
- **Checkpoint:** no root answer to `b-round-173-checkpoint-request.md`. Fallback (c) continues. B appended a round-176 addendum to it (non-blocking).
- **Regression:** `regression-last.json` = 2026-10-24, so it is due on or after 2026-10-27. It is not due today, and the file is unchanged.
- **`root-pre-push-review.md` / `publication-checkpoint.json`:** an old review whose findings were carried long ago. Nothing new.
- **Advisor:** available, and consulted after orientation (before writing) and at the end. Advice followed:
  - **The CONTRAST criteria are on the border, the text and the loop edge only.** By design the `fg/20` fill is 1.27–1.76 against the backdrop and the off state. Making it a criterion would fail B's own design, so it is recorded as info.
  - **The hover-text expectations flip.** In metronome-ui and transport-surface-ui, `hover:text-accent` was expected present and `hover:text-foreground` absent. That is reversed, not just renamed.
  - **clip-envelope-ui l.357 uses a token-split check.** A plain `toContain('text-foreground')` would pass vacuously on `hover:text-foreground`.
  - **Three sites stay as they are:** Waveform Zoom keeps its base `text-foreground`; library-row-strings-ui l.572 (the Add button, 5b-3) is untouched; and the Lane ghost count is a later-stage lock, not a kept one.
  - **NO-BRASS rows run with `--disable-lcd-text`.** The C baselines point at `c-round-176/out/{env,d6}`.
  - **LOOP-EDGE re-checks C-R175-ENABLED-LOOP-EDGE.**
  - **The checkpoint gets an addendum, not a new request.**
  - **At the end consult: the R2 scope.** Hover = press = rest applies to the filled on-states (Loop, Follow on, Metronome, Snap, Env, and Waveform Zoom, which has no hover fill). The border-only states (Delete with a range, Follow paused, Preview while previewing) keep the base hover steps by design. This avoids a false FAIL like the round-176 mixed-button ambiguity.
  - **Two checks at the end.** A second Loop click with the same range disables the loop and leaves the dashed brace (`ArrangementContext.tsx` `toggleLoopSelection` l.1648–1688), so DXT1 and DXT6 hold. No `e2e/*.spec.ts` selects on Studio colour classes.
- **Project subagents:** none consulted. The recipe was fixed in round-176 §0.4 and rests on B's WCAG computation; it is vetoable.

## Backlog updates (from independent C evidence only) — `backlog.json` v166
- **Round 176 → `c_pass_published` (`ff3f710`).** DUX-R-5b-2a → მზადაა, and A-R175-DETAIL-SEP-ACCENT is closed. GATE175-S3 (doc 144 status) is closed. DUX-R-5 itself stays open until 5b-3 passes C.
- **Round 177 dispatched** (D-29z142). Its plan record is VISUAL-A `dux_r5b2b_plan_d29z142`.
- **New open findings:**
  - GATE176-S1-KEPT-COUNT-LOCKS (Low): scheduled in round 177 as G1, not deferred.
  - GATE176-S2-MIX-ON-STATE-CONSTANT: a signal; the proposal needs approval.
  - GATE176-S3-BORDER-TRANSITION: info.
  - C-R176-NOBRASS-LCD-GLYPH: a method note.
  - A-R176-MIXED-REST-BASE, C-R176-MIXED-LETTER-4.5 and C-R176-MUTE-SOLO-RATIO: info.
  - C-R176-MIXED-VS-OFF-FILL: B ruled no fill floor, because the border carries the state. Vetoable.
  - C-R176-INVENTORY-ACCENT-COLOR: closed; the 6 sites are classified as done 5b-1.
- **Updated:** B-R174-ACCENT-EQ-BRAND, GATE167-TOKEN-TEST-FRAGILITY, C-R175-ENABLED-LOOP-EDGE, GATE175-S2 and ARCH-CHECKPOINT-V3C. `architecture_signals` gets a round-176 entry.
- **Deferred Lows:** unchanged at 250.
- **Progress board:** `feature-status.md` shows DUX-R-5b-2a მზადაა and 5b-2b მუშავდება, with the vetoable list.

## Why this task
- **Open findings first.** C found no bugs. Gate-176 S1 is a Low in DUX-R-5's own test file, and the fix is test-only and cheap. Leaving it would leave K sites unlocked while 5b-2b and 5b-3 edit nearby lines. So it is fixed now (gate-176 S1 overrides the earlier gate-175 S2).
- **Then the stage fixed in advance** (`tasks/round-176.md` §7: C PASS → DUX-R-5b-2b), with the recipe already fixed in round-176 §0.4.
- **Size:**
  - 6 components, each with one class string; `StudioWorkspace.tsx` gets exactly 3 lines.
  - 7 test files, 2 docs and 1 new test.
  - It is one coherent recipe, so it is not split further.
- **Follow (vetoable):** it starts `on`, so it is bordered and filled at first paint. Paused is a dashed border. C screenshots all three states and the load state.
- **The Ableton row is honest.** No Live source was captured for toggle colours, so parity is "not applicable / unverified".

## Not complete, and why CONTINUE
- **Remaining work:**
  - VISUAL-A: DUX-R-5b-2b and 5b-3, then M1, M3, M4 and ROOT-RECON-GRID-HARNESS.
  - After VISUAL-A: STORE-REDESIGN (direction A decided), REVIEW-RECOMMENDATIONS (22 approved ids) and T12-ADVANCED.
  - The deferred Lows (250 entries), the regression due 2026-10-27 and the final regression.
- **Items awaiting Saba do not block the next task:** Q-V3-ICON-SIZE, Q-R166-EXIT-NAME, Q-R167-ON-HOVER, Q-V3C5-MODAL-RADIUS, ABL-R-5/16/17, M5 and phase 2. SRW-21 is `deferred_user`.
- Nothing external is needed to continue, so the decision is neither BLOCKED nor COMPLETE.

## Commit readiness
- Root has published round 176 (`ff3f710`). Purchase protection was preserved: in G176-3, `/studio/middle-east` asks for sign-in and the token request returns 401.
- Round 177 is not ready until C passes it.

## Files written by B
- **Planning files:** `current-task.md`, `tasks/round-176.md`, `feature-status.md`, `backlog.json` (v166), `b-next.json`, `b-round-176.md`, and an addendum to `b-round-173-checkpoint-request.md`.
- **Pre-planning copies:** `b-round-176/{b-round-176-current-task.md,b-round-176-feature-status.md,b-round-176-b-next.json,b-round-173-checkpoint-request.md}-before` and `b-round-176/backlog-before-r177.json`.
- **Baseline files:**
  - `b-round-176-r177-{grants,new-files,tree-sha256,granted-start-sha256,vitest-base}.txt`
  - `b-round-176/r177-granted-start/`
  - `b-round-176/out/vitest-base.json` (13 files, 134/134) and `b-round-176/out/tree-files.txt`
- **Scripts:** `b-round-176/update-backlog.py` and `b-round-176/update-fs.py`.

No application source was changed: `git status --short` is empty at `ff3f710`.
