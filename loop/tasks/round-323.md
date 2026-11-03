# Round 323: PERF-8b resumed on A's stopped tree. Ruling on the render-budget positive control (C-R322-01), SELECT-NAMES reworded (C-R322-02), the two selection wrappers memoised, S-* setups named

**Planned by:** B, at the round 322 → 323 planning, 2026-11-03.

**This is a resume, not a new task.** The whole contract of `tasks/round-322.md` (§0–§9) still applies, on the tree A left at its STOP. This file lists only what changes. Where this file and `tasks/round-322.md` disagree, this file wins.

**Decisions** (all in `backlog.json` v282 → `decisions_log_b`):
- **D-29z896: round 322 ruled.** A STOPped at a consistent tree (`a-round-322.md` §1). C FAIL with no app bug (`c-round-322.md`). `browserVerified` and `realVerified` are false only because the tree is incomplete. On every browser row C could run, A's tree behaves the same as HEAD, and the project WAV export is byte-identical. Gate 322 is `skipped` [K30].
  - RT-FIX PASSED. C-R321-01/02/03 close, and RETRO-321 closes with them.
  - The partial work stays. Nothing is reverted (loop policy 6).
- **D-29z897: C-R322-01 (Medium, origin B) → option (a), granted.** See §1.
- **D-29z898: C-R322-02 (Low, origin B) → SELECT-NAMES reworded.** See §3.
- **D-29z899: INFO-C322-WRAPPER-RISE becomes a ruling and a row.** See §2.
- **D-29z900: the S-* setups are named.** B confirmed them in the browser. See §4.
- **D-29z901: A's architecture note** (four in-file wrappers, about 190 lines in `StudioWorkspace.tsx`) is recorded as signal A-R322-ARCH-SELECTION-WRAPPERS for PERF-10. It is not scheduled. It is added as point (4) to the open, non-blocking ARCH-CHECKPOINT-PERF8-STORE-PATTERN.
- **D-29z902: lesson L58 gets a clause** on behaviour asserts hidden by a sketch crash. `lessons.md` stays at 59 lines.

**Read first:** `lessons.md`, with the same lessons as round 322: L11, L12, L23, L28, L29, L34, L37, L38, L49, L52, L56, L57 and L58 (including its new clause).

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§8).

## Baseline and start state
- **Baseline HEAD `53c5c79`.** Gate 322 was `skipped`, so the baseline is still gate 320's published commit [K1, K2, K30].
- **Start state:** A's stopped round-322 tree. It has 34 status entries: 4 app files, the new `selection-store.ts` and 29 test files [K2].
  - B's claims run at planning gives exactly `a-round-322/claims-after-stop.txt` [K31]. Files: `b-round-322/claims-at-planning-323.txt` and `b-round-322/claims-323-planning-output.txt`.
- **No dependency change, no notices.** Protected files: 11/11 OK [K8].

## 1. C-R322-01: the render-budget positive control (D-29z897)
**The problem:**
- **Site:** `app/lib/arrangement/__tests__/render-budget.test.tsx`, the `it` "keeps the context value and its consumers unchanged when the start hold releases (R9-L2, C-R6-02)". These are the lines `act(() => api.current?.selectClip('music-1'));` through the `CONTEXT_CONSUMERS` loop: l.616–620 at HEAD.
- The test uses a selection change as its **positive control**. PERF-8b removes exactly that coupling (D-29z894).
- §2.4's exception does not cover it. The line is a behaviour assert, not a selection-field read.
- B's sketch could not show it. All 81 outside-list files crashed in `StudioWorkspace` before any assert ran (K27; see the new L58 clause).

**Grant:** that one `it` of `render-budget.test.tsx` joins §2.1 of `tasks/round-322.md`. A applies exactly the edit quoted in `a-round-322.md` §1 option (a):
- `selectClip('music-1')` now **keeps** `api.current` identical to `valueAtPlay` (`toBe`). `ArrangementRuler` and `ArrangementLibrary` stay at 0 renders.
- The positive control moves to `act(() => api.current?.setStatus('Positive control'))`. After it, `api.current` is `not.toBe(valueAtPlay)` and every `CONTEXT_CONSUMERS` name renders more than 0 times. That loop is unchanged.
- **Nothing else in the file changes.** The `expect(` count goes from 88 at HEAD to exactly **91** [K28], and no `expect(` line is removed.
- **Already validated:** C's scratch run of this edit gave 8/8 (`c-round-322/render-budget-option-a.log`) [K35].

**What it means:** the new negative row pins the new contract (a selection change no longer rebuilds the context value). The positive control keeps its purpose through a trigger that still changes the value. A test that only *removes* the old lines is still a Medium (L23/10a).

## 2. The two selection wrappers (D-29z899, closes INFO-C322-WRAPPER-RISE)
**Fact (C):** on Ctrl+D, A's commit renders 112 components and HEAD's renders 110 (`c-round-322/probe/selnames-diff.txt`) [K35]. The two extra names are `ArrangementSelectedClipReadoutInner` and `ArrangementDetailPanelWithSelection`.
- `ArrangementGroupHeaderWithSelection` and `ArrangementDetailPanelWithSelection` are plain functions [K32 = 0]. So they render on every `StudioWorkspace` commit. This is the C-R318-01 pattern.

**Ruling:**
1. **Use the memo form for both wrappers.** Write `function ArrangementGroupHeaderWithSelectionInner` + `const ArrangementGroupHeaderWithSelection = memo(…Inner)`, and the same for `ArrangementDetailPanelWithSelection`. This is the form §2.1 already requires (L23). After the edit, K32 = 2.
2. **Memo is useless when a prop changes on every render.** A checks each wrapper's props at its call site (`StudioWorkspace.tsx`, about l.3239 and l.3295 on A's tree). If a prop is a fresh object, array or closure on every `StudioWorkspace` render, and making it stable would need a file outside §2.1, then A **STOPs** (L11) and names the prop. A never ships a memo that does nothing.
3. **B's reading of the code (inference, not measured):** on Ctrl+D the `arrangement` prop really changes, so the detail wrapper renders anyway. That means a structural +1 per wrapper fiber is expected **in an edit commit**. The memo removes the wrapper renders in commits where its props did not change.

**Tolerance for C's comparisons.** This rule replaces `tasks/round-322.md` §3.2 PERF-SELECT's "any rise … is a finding" for the rows below:
- In a commit where A's rendered-name set is larger than HEAD's, every added name must be one of the eight subscriber names:
  - `ArrangementSelectionCount` and `ArrangementSelectionCountInner`
  - `ArrangementSelectedClipReadout` and `ArrangementSelectedClipReadoutInner`
  - `ArrangementGroupHeaderWithSelection` and `ArrangementGroupHeaderWithSelectionInner`
  - `ArrangementDetailPanelWithSelection` and `ArrangementDetailPanelWithSelectionInner`
- Each of those names may appear at most once per mounted instance.
- **Any other added name is a finding.**
- **A drag, zoom or play/pause row that rises at all is still a finding,** unless the rise is made up only of those names. When it is, A names them in the per-component breakdown.

**New C row: DUP-NAMES (dev).** Run `node b-round-321/click-hooks-probe.mjs <base> <out> same-lane` (the same probe as SELECT-NAMES; `c-round-322/probe/click-hooks-probe.mjs` is a byte-identical copy) on HEAD and on A, and read its first step, `dup-ctrl-d`. Every name A has beyond HEAD is one of the eight subscriber names. C reports both totals.

## 3. SELECT-NAMES reworded (D-29z898, closes C-R322-02 on PASS)
This replaces the third clause of `tasks/round-322.md` §3.2 SELECT-NAMES. **New clause:** "`click-original-again`: **0 components rendered**, `providerRendered` false, **≤ 1 commit**."
- HEAD itself has a trailing empty commit (2 commits: 92, then 0). A's stopped tree has 1 commit with 0 components (`c-round-322/probe/selnames-summary.txt`) [K35].
- This is a measured fact, from C's own run on HEAD and on A. It is not from a B sketch.
- The rest of SELECT-NAMES is unchanged: HEAD has 10/10 K15 names, A has 0/10, and MU-SELECTION-IN-VALUE on A's tree brings the names back.

Correspondingly, in §3.2 PERF-SELECT and §2.5 `interact.select.reclick.30.commits`, the A expectation "= 0" becomes "**≤ 1, and `reclick.30.components` = 0**". The row stays `record`.

## 4. Named setups for S-CLICK and S-GROUP (D-29z900)
**Confirmed by B** in the browser on A's tree, :5173, at 1440×900 (`b-round-322/setup-probe.mjs`, `setup-probe-a-tree.json` and `.png`) [K29]: Music add → SFX activate → SFX add → row Shift-select → Ctrl+G → collapse. B's probe did **not** run the Ctrl+D step (step 3); that step comes from C's round-322 script `c-round-322/c322-rows.mjs`, where it worked on both trees. The setup touches only UI that PERF-8b does not change. **C still runs it on HEAD as well.** If a setup step fails on **both** trees, that is INFO (setup), not a FAIL of A.
- **Library target:** the library adds to the active track. The lane header's name button (accessible name "`<Track>` — set as the active track") makes a track active. It is also the track-row selection button.
- **S-CLICK setup (3 clips on 2 lanes):**
  1. Fresh load; wait for "Demo collection ready".
  2. Focus the first library option and press Enter. The clip goes on Music.
  3. Click the Music clip's name bar, then press Ctrl+D. That makes 2 Music clips.
  4. Click "SFX — set as the active track".
  5. Focus the second library option and press Enter. The clip goes on SFX ("… added to the SFX track at 00:00.000.").
  6. Zoom out with `−` until all three name bars are visible.
- **S-CLICK:** as in round 322 §3.2, now across the 2 lanes. Ctrl+click and Shift+click add a clip on the **other** lane.
- **S-GROUP setup:** after S-CLICK's setup:
  1. Click "Music — set as the active track".
  2. Shift+click "SFX — set as the active track". This selects Music, Stems and SFX.
  3. Press Ctrl+G. The status reads "Group “Group 1” created: Music, Stems, SFX.", and one `arrangement-group-fold` exists with `aria-expanded` true.
- **S-GROUP:**
  1. Select a Music clip.
  2. Collapse the group (`arrangement-group-fold` gets `aria-expanded` false) and take the overview-row screenshot.
  3. Unfold, select the SFX clip, collapse again, and take the screenshot again.
  - Compare A with HEAD, pixel for pixel, at both viewports: as in round 322.

**Two INFO facts (pre-existing; not scope for 323):**
- **INFO-C322-ESC:** B's grep found no `Escape` handler in the arrangement code that clears the clip selection [K36 = 0]. The workspace-level one returns the expanded floating video; the others close menus, editors or revert an input. So Esc not clearing a clip selection matches the code. C records what Esc does on HEAD in the S-CLICK context and does not report it as a finding when A equals HEAD.
- **INFO-C322-SHIFT:** at HEAD, Shift+click on a clip calls `toggleClipSelection(id, 'add')` (`ArrangementClip.tsx`, the `isToggle || event.shiftKey` branch) [K37 = 2]. By the code it *should* add the clip. C saw it not add on both trees, using `keyboard.down('Shift')` with `mouse.click`.
  - C re-tries this once on HEAD only, with the name bar's `locator.click({ modifiers: ['Shift'] })` (a second way of sending Shift, besides `keyboard.down`). C records the result.
  - If HEAD still does not add the clip, it becomes the candidate finding C-R322-SHIFT-ADD (Low, origin pre-existing) for the 2026-11-05 REGRESSION round. It is not a FAIL of A.

## 5. What A does now (the remainder of round 322 §3.1)
All rows of `tasks/round-322.md` §3.1 still apply, with these changes:

| Row | Change |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-322/claims-323.sh` from the loop root. K1–K27 must equal `a-round-322/claims-after-stop.txt`, and K28–K37 must equal `b-round-322/claims-323-planning-output.txt` (K32 and K33 change only after A's edits). Any difference is a STOP |
| A-IMPL | §1 edit; §2 memo; then the not-done list of `a-round-322.md` §2: the SS1–SS7 file, the §2.5 harness scenario and rows (with the §3 reword), doc 168 `## მეტრიკები`, doc 230 (l.4 and the GATE320-L1 line), and doc 231 |
| L28 | Doc 230 l.4 **and** doc 231 l.4 read exactly `**სტატუსი:** Completed (C round 323 PASS)`; this round rewrites the round number explicitly (K33 → 2). The doc 230 rulings line is as in round 322 §2.1 |
| A-CLAIMS-AFTER | K3 0, K4 0, K5 0, K10 0, K12 1, K19 ≥ 5, K8 11; K13 shows no `In Progress (stage` line; K28 `88 91`; K32 2; K33 2 |
| A-UNIT | As in round 322 (the new SS file(s), the 29, the 81, `range-store`, `status-lifetime`, and `perf/lib/report.test.ts` through a scratch config). Now **all** pass, `render-budget.test.tsx` included |
| A-EXPECT | `expect-count.py` after ≥ HEAD for every file; `render-budget.test.tsx` = 91 |
| A-MUTANTS | The four of round 322 §3.1, on a scratch copy only |
| A-PERF (alone, L38) | As in round 322. A's per-component breakdown names every added name for any row that rises (the §2 tolerance) |
| A-REVIEW | `code-reviewer` on the final change set, with the round 322 checklist plus: <ul><li>both wrappers are memoised with stable props;</li><li>the render-budget diff is exactly §1.</li></ul> Any code changed after the review goes back to the reviewer (L11) |

**STOP conditions:** the conditions of round 322 §6 still apply, together with §2.2 of this file. A writes "STOP — needs B ruling" at the top of `a-round-323.md`.

## 6. C's rows (the remainder of round 322 §3.2)
C writes `c-round-323.md` and `c-round-323.json` as it goes.

**Rows C runs again** on A's final tree:
- SOURCE-SCOPE (§2.1 + `render-budget.test.tsx`; protected 11/11)
- CLAIMS (`claims-323.sh`, first, L56; as A-CLAIMS-AFTER)
- UNIT (A-UNIT's files, the 4 mutants and at least one mutant of C's own)
- EXPECT
- PERF-SELECT and PERF-LOAD (alone, with the §2 tolerance and the §3 reword)
- SELECT-NAMES (§3), including the mutant on a scratch dev server with its own `cacheDir`
- **DUP-NAMES (new, §2)**
- S2-VIDEO
- S-CLICK, S-EDIT, S-DETAIL, S-TRANSPORT and S-RANGE (on the §4 setup)
- **S-GROUP (§4)**
- G323-AUTH (as G322-AUTH, both viewports)

**RT-FIX is not re-run.** It passed in round 322.

**All L57 fields:**
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`
- an `origin` per finding
- `assertsSpecified` = 7 (SS1–SS7)
- `mutantsRecorded` = 4
- `mutantRedOnSketch` = `null`, with the reason "B built a type-only sketch; mutants not run on a B sketch (D-29z893)"
- `mutantRedOnTree` (C's run on A's tree)
- `gateChecksNamed` = 6
- `gateChecksRunOnSketch` = 2 (typecheck → `b-round-321/sketch-type-tsc.log`; full vitest → `b-round-321/precheck-full.log`)
- `chainHeadGateRunGreen` = `null`, with the reason "chain 322→323: gate 322 skipped on C FAIL; no gate ran on the chain head yet"

**Gate rows go under `"gate"`:** the full vitest, the build in `store/`, Biome, typecheck, `npm run verify` and the e2e smoke.

**`browserVerified`:** true only if every row from PERF-SELECT through G323-AUTH ran at the stated viewports. That includes DUP-NAMES and S-GROUP; if S-GROUP's setup fails on both trees, C records INFO for it.

**Ableton conformance:** not applicable.

## 7. Next
- **After C PASS and gate 323:**
  - PERF-8 is done (8a + 8b).
  - C-R322-01 closes on UNIT PASS, and C-R322-02 on SELECT-NAMES PASS.
- **Round 324:** its planning will likely fall on or after 2026-11-05. If it does, round 324 is a **REGRESSION** round, with the C-R318-06 repro and the C-R322-SHIFT-ADD candidate. Otherwise round 324 is PERF-DRAG-PREVIEW.
- **The queue after that is unchanged:** PERF-9, PERF-10 (C-R320-01 row, SIG-R322-ACTIVE-TRACK-STORE, A-R322-ARCH-SELECTION-WRAPPERS), and so on to PERF-15, then SYS-R2-FAKE-FIDELITY → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries (skip rule).
- **Root:** ARCH-CHECKPOINT-PERF8-STORE-PATTERN is answerable at this PERF-8 boundary. It does not block.

## 8. Claims
Run `bash b-round-322/claims-323.sh` from the loop root (`CLAIMS_STORE` may override the store path).
- **K1–K27:** as in `tasks/round-322.md` §9. The planning output equals `a-round-322/claims-after-stop.txt`.
- **Planning output:** `b-round-322/claims-323-planning-output.txt`.

| Tag | Claim | Now (A's stopped tree) | After A |
|---|---|---|---|
| K28 | `expect(` in `render-budget.test.tsx`: HEAD, working tree | 88 88 | 88 91 |
| K29 | setup probe: clip tracks after the SFX add; groups after Ctrl+G; fold state after collapse | `['music', 'sfx']` 1 `exp=false` | same |
| K30 | gate 322 status | skipped | same |
| K31 | B planning claims = A's stop claims | planning-equals-stop | — |
| K32 | memoised selection wrappers in `StudioWorkspace.tsx` | 0 | 2 |
| K33 | docs 230/231 with l.4 `Completed (C round 323 PASS)` | 0 | 2 |
| K34 | `tasks/round-322.md` = B's before-copy of the round-322 task | archive-equal | same |
| K35 | the cited C and B artifacts exist | checked | checked |
| K36 | arrangement `Escape` handlers that clear the clip selection | 0 | 0 |
| K37 | the Shift-adds branch lines in `ArrangementClip.tsx` | 2 | 2 |
