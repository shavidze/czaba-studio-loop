# B round 173 → round 174 planning (D-29z139)

**Decision: CONTINUE.** The next task is round 174, **DUX-R-5a**, the first part of the one colour rule: content goes neutral. It is written in `current-task.md`.
- **Archive:** the previous task is `tasks/round-173.md`, an exact copy (sha256 `79a76994…`, checked with `cmp`). The archive did not exist before.

## Inputs read (as data)
- **Active context first:** `context/active-summary.md`. `backlog.json`, `feature-status.md` and `design-ux-review.md` were opened only by ID, through python and grep.
- **Round-173 reports:**
  - `a-round-173.md`: 425/425 targeted tests, mutations m235–m240 red, reviewer 9/10. Its Architecture note is Signal 3 (keep).
  - `c-round-173.md` / `c-round-173.json`: **PASS**, `browserVerified` and `realVerified` true, **0 bugs**. Only the fake-Bearer 403 row is blocked (backend unavailable in cloud). Notes N1–N3 are info and pre-existing.
  - `gates/gate-round-173.json`: **published** `02c08fd` on both remotes.
  - `gates/round-173/review.md`: 9/10, 1 info + 3 Lows, Architecture note Signal 3.
- **Baseline for round 174:** HEAD = `02c08fd`, the gate-173 commit. The tree is clean, with 993 files.
- **User decision files:**
  - `design-ux-decisions.md`: DUX-R-5 approved, as its own VISUAL-A stage before M1, keeping the D6 thresholds.
  - `ableton-decisions.md` and `direction-decision.md`: nothing new for this stage.
- **Checkpoint:** no root answer has arrived. A refreshed request was written (below).
- **Regression:** `regression-last.json` = 2026-10-24, so it is due on or after 2026-10-27. Not today.
- **Advisor: available and consulted** after orientation, before writing. Its advice and what B did with it:
  - **Preserve first:** done (see "Files written by B").
  - **Split DUX-R-5 into 5a (content) and 5b (the remaining brass sites that are not reserved).** 5b is the next step, not deferred, and DUX-R-5 is not done until 5b passes.
  - **Inheritance check for the threshold:** inside the body, no text inherits `currentColor`, so the threshold is 3:1, not 4.5:1.
  - **Name the cue that replaces hue for video vs audio:** done (R31).
  - **Re-run ENV-VIS in all round-164 states:** done (the ENV-VIS row).
  - **One countable acceptance with no brass:** done (NO-BRASS-CONTENT).
  - **Inventory the test locks:** done. `video-fades-ui.test.tsx` l.383 was found and granted; the two `'bg-brand'` hits are lane/group M/S, not the Overview.
  - **Route the gate-173 findings** and refresh the checkpoint: both done (below).
- **Advisor, end-of-task review:** done (see the end of this file).
- **Project subagents:** none consulted. The colour choice rests on B's WCAG computation (§0.1 of the task) and the spec. It is vetoable.

## Backlog updates (from independent C evidence only) — `backlog.json` v163
- **Round 173 → `c_pass_published`, and V-3c-5b → მზადაა.** So V-3c-5, V-3c and V-3 are complete.
- **New `deferred_low_polish` entries (Lows, test quality; 250 entries total):**
  - GATE173-S3-PNR5-DUP-MOUNT
  - GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR
- **Open findings (info):**
  - C-R173-N1: a mouse click on the Overview shows the focus ring. This is a product question, not scheduled.
  - C-R173-N2 and C-R173-N3: acknowledged.
  - GATE173-S1 → round 174 D2(b).
  - GATE173-S2 → round 174 D1. The reviewer cited l.284; the real line is l.83.
- **Signals:** `GATE167-TOKEN-TEST-FRAGILITY.round173_update`, `ARCH-R167-SURFACE-RECIPE.round173_update`, an `architecture_signals` entry for round 173, and an `ARCH-CHECKPOINT-V3C` status line. None of them is scheduled on its own.
- **Plan record:** VISUAL-A `dux_r5a_plan_d29z139`, holding the inventory, the computation, R30–R33 and K1–K6, the sites, the mutations, the C rows and the 5b scope list. DUX-R-5's status records the split.
- **Progress board:** `feature-status.md` now shows V-3c-5b მზადაა, DUX-R-5a მუშავდება and DUX-R-5b არ დაწყებულა, with the vetoable R30–R33 and K5.

## Why DUX-R-5a, and how it was split
- **Fixed in advance:** `tasks/round-173.md` §7, row "C PASS". No Critical, High or Medium bug comes first.
- **The split keeps the full scope.** B's inventory found about 150 `brand`/`accent` sites in 19 files.
  - **5a** covers the content sites, which are the F-9 defect itself: 6 token edits in 3 files.
  - **5b** covers the remaining sites that are not reserved: fader thumbs, fade handles, trim hover, on-states, labels and StudioWorkspace. Each needs a per-site ruling and its own owner set. It is scheduled next.
- **Colour choice (vetoable):**
  - `text-muted/70` gives 3.76 / 3.61 / 3.98 against the real surfaces (≥ 3:1, D6). `dim/70` and `muted/60` were rejected as too close to the floor.
  - The envelope line against the waveform improves (3.24 → 3.71), and the halo still carries it.
  - The video header uses `bg-foreground/15` rather than `outline-strong` (#736b60 in Obsidian, header text only 4.22).
  - The Overview ladder is fg/80, muted/60 and dim.
- **Reserved brass is kept** (K1–K6): selection, the playheads, focus, the preview's played part (playback progress), and the envelope.

## Architecture checkpoint
- **Request:** V-3c reached its feature boundary, so B wrote `b-round-173-checkpoint-request.md`. It is bounded, non-blocking, and asks 3 questions:
  - Q1: the surface recipe and the `!` suffixes;
  - Q2: token-based test assertions, including the PNR5 cross-file lock, bundled with ROOT-RECON-GRID-HARNESS;
  - Q3: the order against DUX-R-5b.
- **Default:** fallback (c). B does not schedule an extraction on its own.

## Not complete, and why CONTINUE
- **Remaining work:**
  - VISUAL-A: DUX-R-5a, DUX-R-5b, M1, M3, M4 and ROOT-RECON-GRID-HARNESS.
  - After VISUAL-A: STORE-REDESIGN (direction A decided), REVIEW-RECOMMENDATIONS (22 approved ids) and T12-ADVANCED.
  - The deferred Lows (250 entries, to be fixed before release), the regression due 2026-10-27, and the final regression.
- **Items awaiting Saba** (Q-V3-ICON-SIZE, Q-R166-EXIT-NAME, Q-R167-ON-HOVER, Q-V3C5-MODAL-RADIUS, ABL-R-5/16/17, M5, phase 2) do not block the next task.
- **SRW-21** is `deferred_user`.
- Nothing external is needed to continue, so the decision is neither BLOCKED nor COMPLETE.

## Commit readiness
- Root has published round 173 (`02c08fd`). Purchase protection was preserved (G173-3).
- Round 174 is not ready until C passes it.

## Files written by B
- **Planning files:** `current-task.md`, `tasks/round-173.md`, `feature-status.md`, `backlog.json` (v163), `b-next.json`, `b-round-173.md`, `b-round-173-checkpoint-request.md`.
- **Pre-planning copies:**
  - `b-round-173/{b-round-173-current-task.md,b-round-173-feature-status.md,b-round-173-b-next.json}-before`
  - `b-round-173/backlog-before-r174.json`
- **Baseline files:** `b-round-173-r174-{grants,new-files,tree-sha256,granted-start-sha256,vitest-base}.txt`, `b-round-173/r174-granted-start/`, `b-round-173/out/vitest-base.json` (115/115).
- **Scripts:** `b-round-173/update-backlog.py`, `b-round-173/update-fs.py`.

No application source was changed: `git status --short` is empty at `02c08fd`.

## Advisor end-of-task review
- **Test-lock inventory completed.**
  - Context was read for `track-group-mix-ui` l.827 and `lane-strings-ui` l.495: they are Solo-on lane/group tokens.
  - Grep for `'bg-accent'`/`toContain('bg-*')` hits: clip-envelope-ui l.787 is an absence check on the envelope point; transport, lane and group hits are on-state buttons; studio-theme-obsidian l.214 is the Overview playhead (K2, kept).
  - e2e: only `store-page.spec.ts` matches, and it covers Store pills.
  - No frozen test locks a changed token, so the grants are unchanged.
- **Harness note added to §4:** blur the Overview before the scans (C-R173-N1 ring). Keep the pointer off the clips, keep Env mode off, and scan the detail box while stopped.
- **Traceability:** the SABA-B-1 entries (`backlog.json` and `feature-status.md`) now point to the round-174 ENV-VIS re-verify.
