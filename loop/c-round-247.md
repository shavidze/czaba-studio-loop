# C round 247: verification of B-R245-UNDO-GROUP-FOCUS (Medium)

**Verdict: PASS.** `browserVerified: true`, `realVerified: true`. No bugs. One row is BLOCKED (backend unavailable in cloud). Gate rows are left to the gate.

- **Environment:** Chromium 143.0.7499.4 (Playwright). The fix ran on `:5173`. The HEAD control ran on `:5174`, from `git archive 869d767` in `/tmp/c247-head`, with per-entry `node_modules` links and its own `.vite` cache. It was stopped after use.
- **Script:** `c-round-247/c247.cjs` (C's own; fresh context per row; waits for `Demo collection ready`).
- **Results:** `out-fix/c247.json` (fix), `out-head/c247.json` (HEAD). Screenshots: `out-fix/*.png`, `out-head/*.png`.
- **Fix vs HEAD table:** `c-round-247/table.txt`, made by `summarize.cjs`. Each row verdict is recomputed from the saved data. The table compares group count, status, Undo/Redo titles, row order (group ids normalised), group names and fader values with HEAD.
  - **Result: 0 differences in those facts at either viewport.** Only the focus differs, and only on the removal rows.
- **Invalid attempt, kept:** HEAD `groupUndo@1440` timed out on a Vite cold start (`out-head/attempt1-groupUndo1440-timeout.json`). I re-ran it once; it lands on BODY.
- **Recipe note:** my first in-script pass flags for `ungroupRedo`/`groupUndoY` (fix) and the ORIGIN-based no-steal rows were wrong. The Music button's label ends in ", selected", and my exact-match check missed it. The verdicts in `table.txt` are recomputed with `startsWith`. **`summarize.cjs` is the verdict source.** The in-script `pass` flag on `noStealVideo`/`noStealMember` comes from a misapplied ORIGIN template (it requires the focus to start in a group row), so it is ignored.
- **Reproduce:** `node c247.cjs <base> <dir> '.'` runs every row. A run with no regex skips smoke, auth and budget.

## Acceptance rows

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-247 | PASS | <ul><li>HEAD is `869d767`.</li><li>Status is exactly 3 `M` (grants 1–3) plus `??` doc 190.</li><li>`sha256sum -c` gives rc 0 on the tree list (1,104 lines) and the root list.</li><li>The 7 protected files give `git diff --quiet HEAD` rc 0.</li><li>`git diff HEAD -- app`, with the `index` lines removed, is byte-identical to `b-round-246/precheck-scratch.diff` (`cmp`).</li><li>All of this was re-checked at the end of the round, with the same result.</li></ul> |
| C-UNIT-247 | PASS | <ul><li>`npx vitest run $(cat covering.txt)`: 96 files, 1,492/1,492, rc 0, 112.9 s (`c-round-247/covering.log`).</li><li>GF1–GF7 took 0.52–1.18 s each, against the 20 s describe timeout. The file took 22.2 s for 30 tests.</li><li>The slowest single test is CP12c at 4.40 s of its 30 s timeout (15 %). Nothing is near 50 %.</li></ul> |
| C-MUT-247 | PASS | <ul><li>Scratch copy `/tmp/c247-mut`: `git archive HEAD` plus the 3 working files (`cmp` equal). Run with B's `run-mutants.sh`; MU-HEAD done by hand inside the scratch.</li><li>Red rows: FIX-CONTROL none (30/30); MU-HEAD GF1–5; MU-PREVIOUS-FIRST GF1–5; MU-NO-CONTAINS GF5, GF6; MU-NAME-ONLY GF3, GF5; MU-VISIBLE-ORDER GF4; MU-RENDER-ORDER GF1–5; MU-PRECEDENCE-INVERTED GF7; MU-BODY-BASED GF6. This equals §0.2.</li><li>The repo status is identical before and after (`status-before.txt` = `status-after.txt`).</li></ul> |
| C-GROUP-ORIGINS-247 | PASS | <ul><li>At both viewports, after the step, focus is on the Music name button for: groupUndo, groupUndoNatural, groupUndoTab, ungroupRedo (Ctrl+Shift+Z), groupUndoY, fold, mute, **solo** (C extra), volume and collapsedUndo (4 lanes back).</li><li>nestedOuterUndo goes from 2 groups to 1, with focus on the Group 1 name.</li><li>HEAD gives BODY on every one of these rows.</li><li>**groupUndoTab:** Ctrl+G, then real `Shift+Tab` to the fold, then `Tab` to the name (`:focus-visible` true), then `Ctrl+Z`. Music gets `:focus-visible` with outline `solid 1px color(srgb 0.788 0.643 0.416 / 0.8)`.</li><li>The group counts, statuses (`Undo: Group Tracks` / `Redo: Ungroup Tracks`) and titles equal HEAD.</li><li>0 page errors.</li><li>**C extras:**<ul><li>bottomGroupUndo (Stems+SFX group): focus goes to Stems; HEAD gives BODY.</li><li>playingUndo (a clip playing, `Ctrl+Z` during playback): focus goes to Music with the ring; HEAD gives BODY.</li></ul></li></ul> |
| C-PRECEDENCE-247 | PASS | <ul><li>ungroupPrecedence (Group 2 and Group 1 selected, focus on Group 1, `Ctrl+Shift+G`): 0 groups, focus on Music.</li><li>plainUngroup (name focused, `Ctrl+Shift+G`): focus on Music.</li><li>groupFocusFollow: Ctrl+G puts focus on the group name, and Ctrl+Shift+G puts it on Music.</li><li>Both viewports; equal to HEAD.</li></ul> |
| C-NO-STEAL-247 | PASS | <ul><li>Video focused, `Ctrl+Z`: focus stays on Video.</li><li>Member (Stems) focused: it stays.</li><li>Status-line click (BODY), `Ctrl+Z`: it stays BODY.</li><li>The group is removed in all three. Both viewports; equal to HEAD.</li></ul> |
| C-KEEP-247 | PASS | <ul><li>nestedInnerUndo: Group 1 keeps focus.</li><li>ungroupUndo and groupRedoMember: Music keeps focus.</li><li>renameUndo (F2, `Bus`, Enter, `Ctrl+Z`): "Group 1" is back, the status is `Undo: Rename Group`, and the name keeps focus with the ring.</li><li>Both viewports; equal to HEAD.</li></ul> |
| C-UNDO-BUTTON-247 | PASS | <ul><li>Click Undo: 0 groups, and focus is on "Redo: Group Tracks (Ctrl+Shift+Z)".</li><li>Click Redo: 1 group, and focus is on "Undo: Group Tracks (Ctrl+Z)".</li><li>Both viewports; equal to HEAD.</li></ul> |
| C-VOLUME-REMOVAL-247 | PASS | <ul><li>`ArrowDown` ×2: 0 → −0.2.</li><li>Z1: `Undo: Volume`, −0.1, the fader keeps focus, titles Undo: Volume / Redo: Volume.</li><li>Z2: `Undo: Volume`, 0, the fader keeps focus, titles Undo: Group Tracks / Redo: Volume.</li><li>Z3: `Undo: Group Tracks`, 0 groups, focus on Music with the ring (HEAD: BODY), Undo disabled, Redo: Group Tracks.</li><li>Every value, status and title equals HEAD. 0 page errors. Both viewports.</li></ul> |
| C-COLLAPSE-REG-247 | PASS | <ul><li>Click the group name, focus Music, press `U`: 3 rows (folded), and focus is on the group name with `:focus-visible` and the brass 1 px ring.</li><li>Ctrl+G and Ctrl+Shift+G focus follow pass (row above).</li><li>Both viewports; equal to HEAD.</li></ul> |
| C-MARKER-REG-247 | PASS | `M`, `Enter`, `Ctrl+Z`: 1 → 0 flags, and focus is on "Add marker (M)" with the ring. Run at both viewports. |
| C-BUDGET-247 | PASS | Persistent text lines outside the timeline: 1440×900 empty 85 / demo 101; 1280×720 empty 69 / demo 85. These equal round 246. Screenshots: `budget-*.png`. |
| AN-REVIEW-247 | PASS | <ul><li>l.4 is byte-exact: `**სტატუსი:** Completed (C round 247 PASS)`.</li><li>The 7 TEMPLATE headings are in order (l.7, 21, 74, 95, 107, 122, 156).</li><li>The doc covers D-29z415 and the precedence (l.23–35), and the ref-detach reason with measured facts kept apart from the inference (l.40–62). The rejected designs are onBlur, BODY-based, around `undo()` and the shared mechanism (l.64–72).</li><li>Cited rows: GF1–GF7 each grep 1, and UC9 greps 2.</li><li>Both TODOs are present: D-29z416 and `blurGroupVolume`. There is a Mermaid sequence.</li></ul> |
| LAB-SMOKE-247 | PASS | Both viewports: <ul><li>Space plays (0 → 0.861/0.870 s, RMS 0.0015) and pauses (0.882 holds).</li><li>The export WAV is 48 kHz, 24-bit, stereo, 768,000 frames = 16.000 s, peak 0.2967, −24.91 dB, 0 NaN.</li><li>sha256 `1fea093b…3f94` matches.</li><li>0 page errors.</li></ul> |
| Auth | PASS | Fresh context, 0 cookies: <ul><li>`/studio-lab` opens the workspace, and `auth_user` is null.</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`.</li><li>`/api/studio-token` with no header returns 401.</li><li>A fake Bearer returns 500 "Unable to prepare Studio access" (backend unavailable); no token is issued.</li></ul> Premium auth is not bypassed. |
| Purchased origin (browser) | BLOCKED | The backend is unavailable in the cloud. |
| gate | gate | Full vitest, typecheck, lint, build, verify and e2e smoke belong to the root gate. They are not claimed. |

## §6 neighbours and L50
- **Focus stealing on re-render:** none. The group name (reached by Tab) kept focus through 1.5 s of playback (6 samples). The group volume kept focus through a 6-step mouse drag and after it, and the group stayed. Both viewports.
- **L50 re-run.**
  - The regex gives `ArrangementGroupHeader` 10 hits at HEAD and 10 in the working tree, and `StudioWorkspace` 19 → 20.
  - The only new hit is `button.focus({ preventScroll: true })` in `focusRowSuccessor`, which is the fix itself.
  - The caller grep gives 5 hits. No unruled hit.
- **INFO-C247-GRIDMENU (§6 info probe, round-244 empty-lane recipe):**
  - Steps: focus the group name, then right-click an empty lane point; the menu opens and focus moves to its "Medium" item. Then press `Ctrl+Z`.
  - Result: nothing is undone (1 group, status unchanged), and the menu stays open. Escape returns focus to the group name.
  - Same at HEAD. No removal happens with focus in the menu, so there is no finding.
- **INFO-C247-NESTED-COLLAPSE:** with the inner group name focused and the outer group selected, `U` folds the outer group. Focus goes to the outer name with the ring. No BODY.
- **A's reviewer Lows (A-R247-REVIEW-L1–L3)** stay with B. I found no browser path to them: in bottomGroupUndo the successor exists (Stems).
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json` are the 2026-10-07 round-3 snapshots. They contain no item about this round's code.

## Requirement and Ableton parity
- **CZABA requirement (D-29z415):** met. The removed row's focus goes to the next row in the last full order (the Music, Stems or Group 1 name). An explicit `pendingRowFocusRef` target wins. Focus elsewhere is never moved.
- **Ableton parity: does not apply.** Live has no DOM focus model, and the task claims no parity (§3).
- **Not exercised this round:** the video lane and fit-to-video. They are not this round's rows. Export integrity was checked via LAB-SMOKE.
