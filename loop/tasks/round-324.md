# Round 324: PERF-8b resumed again on A's stopped tree. R11-P1e positive control moved (C-R323-01), group-header memo pinned (C-R323-02, SS8), the 7 consumer-count controls pre-ruled, S-GROUP redefined on Ctrl+A in a folded group

**Planned by:** B, at the round 323 → 324 planning, 2026-11-03.

**This is a resume, not a new task.** The whole contract of `tasks/round-322.md` (§0–§9) and `tasks/round-323.md` (§1–§8) still applies, on the tree A left at its round-323 STOP. This file lists only what changes. Order of precedence: this file, then `tasks/round-323.md`, then `tasks/round-322.md`. **Scope is not reduced:** SS1–SS7 (+ SS8 below), the four mutants (+ two below), the §2.5 harness rows, A-PERF with the HEAD control, docs 168/230/231 and the code-reviewer all remain in this round.

**Decisions** (all in `backlog.json` v283 → `decisions_log_b`):
- **D-29z903: round 323 ruled.** A STOPped at a consistent tree (`a-round-323.md` §1–§2). C FAIL with no app bug (`c-round-323.md`). On every browser row C could run, A's tree (with both memo wrappers) equals HEAD `53c5c79`, and the project WAV export is byte-identical. `browserVerified`/`realVerified` are false only because PERF-SELECT/PERF-LOAD could not run on an incomplete tree. Gate 323 `skipped` [K30]. Partial work stays; nothing is reverted (loop policy 6).
- **D-29z904: C-R323-01 (Medium, origin B) → A's option (a), granted exactly.** See §1.
- **D-29z905: the seven consumer-count positive controls are pre-ruled** so that a later in-grant change cannot produce a fourth STOP of the same class. See §2.
- **D-29z906: C-R323-02 (Low, origin B/A) → new unit row SS8 + mutant MU-GROUP-HEADER-NO-MEMO.** Fixed now: this round already owns the code and it is cheap (2026-10-23 Low rule). See §3.
- **D-29z907: S-GROUP redefined** on a B-browser-confirmed recipe (Ctrl+A in a folded group). INFO-C323-S-GROUP-PREMISE closes on S-GROUP PASS. See §4.
- **D-29z908: INFO-C322-SHIFT resolved by C** (Shift+click adds on HEAD and A, same lane and cross lane). The C-R322-SHIFT-ADD candidate is **dropped**; it does not go to the REGRESSION round.
- **D-29z909: "folding a group clears the clip selection"** (pre-existing, both trees, C round 323) is recorded as candidate CAND-R323-FOLD-CLEARS-SELECTION (info) for the next REGRESSION round, with a reference-first question (what does Live 12 do to a clip selection inside a group track when the group folds?). Not scope here; not asserted.
- **D-29z910: lesson L58's sketch-crash clause gets a memo sentence** (A's suggestion, `a-round-323.md` §4). `lessons.md` stays at 59 lines.

**Read first:** `lessons.md`: L11, L12, L23, L28, L29, L34, L37, L38, L49, L52, L56, L57, L58 (with its D-29z910 sentence).

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§10).

## Baseline and start state
- **Baseline HEAD `53c5c79`.** Gates 322 and 323 were `skipped`, so the baseline is still gate 320's published commit [K1, K2, K30].
- **Start state:** A's stopped round-323 tree, 35 status entries [K2]: the round-322 tree + the round-323 §1 R9-L2 edit of `render-budget.test.tsx` (`expect(` 88 → 91 [K28]) + the two memo wrappers [K32 = 2].
- B's claims run at planning: K1–K27 equal `a-round-323/claims-after-stop.txt` [K31]; K28, K29, K32, K36, K37 equal `c-round-323/claims-c.txt` (K30, K31, K33, K34, K35 are reworded for this round). Files: `b-round-323/claims-324-planning-output.txt`, `b-round-323/claims-324-planning-k1-k27.txt`.
- No dependency change, no notices. Protected files 11/11 OK [K8].

## 1. C-R323-01: the R11-P1e positive control (D-29z904)
**The problem (fact; A and C reproduced it):** in `render-budget.test.tsx`, the `it` "does not re-render the detail panel content over 60 position frames or Play → Stop → Play (R11-P1e)", the line `expect(renderLog.counts.get('ArrangementDetailPanel') ?? 0).toBeGreaterThan(0);` [K44 = 1] is the `it`'s positive control. With `ArrangementDetailPanelWithSelection` memoised (round 323 §2 ruling 1), no wrapper prop changes on Play → Stop → Play, so the outer panel renders 0 times. The memo works; the old control became false (`c-round-323/render-budget-atree.log`: 7/8).

**Grant:** that `it` joins §2.1 of `tasks/round-322.md`. A applies exactly `a-round-323/option-a-r11p1e.patch.txt`:
- the line above is replaced by `expect(renderLog.counts.get('ArrangementTransport') ?? 0).toBeGreaterThan(0);`. The positive control moves to a consumer that still re-renders on Play/Stop: `ArrangementTransport` destructures `isPlaying` from `useArrangement()` [K40];
- directly after it comes `expect(renderLog.counts.get('ArrangementDetailPanel') ?? 0).toBe(0);` (the new contract);
- **nothing else in the file changes** beyond round 323 §1 and this edit.

**Expect rule, stated so it can be checked (replaces "no `expect(` line is removed" for this file):**
- `expect(` count in `render-budget.test.tsx` = exactly **92** (HEAD 88) [K28 → `88 92`].
- Every HEAD assert of the file is either unchanged, or its subject or matcher changed to pin the new contract. The file has exactly two such changes, each listed in A's report with its reason: R9-L2 (`not.toBe(valueAtPlay)` → `toBe` after `selectClip`, round 323 §1) and R11-P1e (`ArrangementDetailPanel > 0` → `ArrangementTransport > 0` plus `ArrangementDetailPanel` `toBe(0)`).
- **A flip that pins the new contract, with a positive control kept in the same `it`, is not a 10a removal.** This answers A's question (`a-round-323.md` §1). A test whose only change is a removed assertion is still a Medium (L23/10a).
- **Already validated:** A's scratch 8/8 (`a-round-323/option-a-scratch.log`) and C's scratch 8/8 (`c-round-323/option-a-c.log`). Mutant **MU-DETAIL-NO-MEMO** (`const ArrangementDetailPanelWithSelection = ArrangementDetailPanelWithSelectionInner;`) turns the new `toBe(0)` row red ("expected 3 to be +0", `c-round-323/option-a-mutant-nomemo-c.log`). It is the fifth mutant of A-MUTANTS.

**B's reading of R9-L2's control (a fact plus an inference, recorded for PERF-9/PERF-10):** the R9-L2 `it` clears the render log once, before Play's hold [K39 = 1]. Its `CONTEXT_CONSUMERS > 0` loop therefore counts the renders of both the `selectClip` step and the `setStatus` step. `ArrangementDetailPanel.tsx` calls no `useArrangement()` [K40, third value 0], so the outer panel's count there most likely comes from the selection change through the detail wrapper's subscription (inference, not measured). No change in round 324. It is recorded as signal SIG-R323-R9L2-CONTROL-SOURCE for the PERF task that next touches status or the detail wrapper.

## 2. The seven consumer-count positive controls (D-29z905)
A's grep `grep -rn -E "counts\.get\('[A-Za-z]+'\) \?\? 0\)\.toBeGreaterThan\(0\)" app --include=*.tsx` gives 7 lines on A's tree [K43 = 7]:
- `library-preview.test.tsx` (1 line), `master-ui.test.tsx` (1), `context-hygiene.test.tsx` (1);
- `render-budget.test.tsx` (4): the two R11-P1e content controls, the R11-P1e outer-panel line of §1, and the R9-L1 `LibraryInsertMarkerText` control.

On A's tree every one except the §1 line passes (A's 111-file run; C's own run `c-round-323/unit-c.log`, whose only failure is the §1 line).

**Pre-ruling (no STOP for this class):** if a change A makes **inside §2.1** after this point (for example a code-reviewer fix) makes one of these seven lines false, A applies the §1 pattern to that line only:
1. the positive control moves to a consumer that still renders on the same trigger in that `it` (A names it and why it renders);
2. a `toBe(0)` row on the old subject is added directly after it;
3. the file's `expect(` count does not decrease, and A lists the change in the report;
4. a mutant that removes the change's cause (the memo or subscription) turns the new `toBe(0)` row red, on a scratch copy.

This pre-ruling grants those four test files only for that pattern. **Any other test change still STOPs** (round 322 §6). If no in-grant change flips a line, none of these files is edited (except `render-budget.test.tsx` per §1).

## 3. SS8: pin the group-header memo (D-29z906, closes C-R323-02 on PASS)
**Fact (C):** removing the `memo` of `ArrangementGroupHeaderWithSelection` leaves render-budget and the 8 `*group*` test files green (110/110; `c-round-323/c-mutant-group-nomemo.log`). No test pins that memo.

**New file (grant):** `app/lib/arrangement/__tests__/selection-wrappers-render.test.tsx` [K38 absent → present].
- It may copy the render-log pattern of `render-budget.test.tsx` (the `vi.hoisted` DevTools-hook block, which counts a fiber only when its props or state changed) and the group setup of `track-group-collapse-ui.test.tsx` (`mountGroupsWorkspace`, `clickLane`, `pressGroupKey` [K41 = 3]). It copies them; it does not import from or edit those two files.

| Row | Asserts |
|---|---|
| SS8a (memo pin) | With one group made by lane select + Ctrl+G, and **collapsed**: clear the log, then trigger a `StudioWorkspace` commit that changes no group-header prop. A uses `setStatus('Positive control')`; if that does change a group prop, A uses Play → Stop instead and states why. Asserts: `ArrangementGroupHeaderWithSelectionInner` = 0, and the positive control `ArrangementTransport` > 0 in the same step |
| SS8b (subscription live) | In the same collapsed state, `selectAllClips()` (or Ctrl+A on `document.body`): `ArrangementGroupHeaderWithSelectionInner` > 0, and every overview block of the group header carries the selected state, read through `data-overview-selected` (a data attribute, not a class, L12) |

- Mutant **MU-GROUP-HEADER-NO-MEMO** (`const ArrangementGroupHeaderWithSelection = ArrangementGroupHeaderWithSelectionInner;`) turns SS8a red. It is the sixth mutant of A-MUTANTS.
- SS8b must stay green under that mutant (the subscription is still there).
- **If a group cannot be built in jsdom without editing a file outside §2.1 or this grant,** A does not STOP. A records why and writes SS8 as far as it can. C-R323-02 then goes to `deferred_low_polish` at the next planning. Every other row of this round continues.

## 4. S-GROUP redefined (D-29z907; closes INFO-C323-S-GROUP-PREMISE on PASS)
**Why:** C showed that folding a group clears the clip selection on both trees, so the old S-GROUP never had a selected clip in the folded overview.

**B's browser check, on A's tree at :5173, 1440×900** (`b-round-323/fold-select-probe.mjs`, `fold-select-probe-a-tree.json`, PNGs `fold-select-probe-a-tree-ctrlA-folded.png` and `-ctrlA-body.png`) [K42 = `2 0 2 exp=false`]: after the round 323 §4 setup and a fold, the group shows 2 overview blocks with 0 selected. **Ctrl+A while folded marks both blocks selected** (`data-overview-selected="true"` on 2), and the group stays folded. That held both with focus on the fold button and with focus on the body.

**New S-GROUP (C, on HEAD and on A, both viewports):**
1. Run the round 323 §4 S-CLICK and S-GROUP setup up to Ctrl+G, then fold (`arrangement-group-fold` gets `aria-expanded` false). Record the selected-block count (expected 0 on both trees) and the "n clips selected" readout.
2. Press Ctrl+A. Record the overview block count, the selected-block count, the readout and `aria-expanded` (still false). Take the group-header and full-window screenshots.
3. Unfold. Record the clip selection readout.
4. **Pass:** every recorded value of A equals HEAD, and the step-2 screenshots are pixel-equal HEAD vs A. Step 2 shows every overview block selected on both trees. If HEAD itself does not show that, the row is INFO (setup), not a FAIL of A.

## 5. What A does now
All rows of `tasks/round-322.md` §3.1, as changed by `tasks/round-323.md` §5, still apply. Changes:

| Row | Change |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-323/claims-324.sh` from the loop root. Its output must equal `b-round-323/claims-324-planning-output.txt`. Any difference is a STOP |
| A-IMPL | §1 edit, §3 SS8 file, then everything not done yet (`a-round-323.md` §2): the SS1–SS7 file, the §2.5 harness scenario and rows (with round 323 §3's reword), doc 168 `## მეტრიკები`, doc 230 (l.4 and the GATE320-L1 line), doc 231 |
| L28 | Doc 230 l.4 **and** doc 231 l.4 read exactly `**სტატუსი:** Completed (C round 324 PASS)` [K33 → 2] |
| A-CLAIMS-AFTER | K3 0, K4 0, K5 0, K10 0, K12 1, K19 ≥ 5, K8 11; K13 shows no `In Progress (stage` line; K28 `88 92`; K32 2; K33 2; K38 `present` with ≥ 3; K44 0 |
| A-UNIT | As in round 323, plus the SS8 file. **All** pass, `render-budget.test.tsx` included |
| A-EXPECT | `expect-count.py` after ≥ HEAD for every file; `render-budget.test.tsx` = 92; any §2 pre-ruling use listed |
| A-MUTANTS | Six, on a scratch copy only: MU-NO-EQUAL-GUARD, MU-UNORDERED-GUARD, MU-SELECTION-IN-VALUE, MU-STALE-SELECTION-READ, MU-DETAIL-NO-MEMO (§1) and MU-GROUP-HEADER-NO-MEMO (§3). Each turns its row red; restored, all are green |
| A-PERF (alone, L38) | As in round 322, with the round 323 §2 tolerance |
| A-REVIEW | `code-reviewer` on the final change set, with the round 322 and 323 checklists, plus: <ul><li>the render-budget diff is exactly round 323 §1 + this §1;</li><li>SS8 does not import from or edit another test file.</li></ul> Any code changed after the review goes back to the reviewer (L11). A flipped positive control follows §2 |

**STOP conditions:** as in round 322 §6 and round 323 §2.2, except where §2 or §3 of this file says "no STOP". A writes "STOP — needs B ruling" at the top of `a-round-324.md`.

## 6. C's rows
C writes `c-round-324.md` and `c-round-324.json` as it goes.

**Rows C runs** on A's final tree:
- CLAIMS first (L56): `claims-324.sh`, checked against A-CLAIMS-AFTER.
- SOURCE-SCOPE: round 322 §2.1 + `render-budget.test.tsx` (round 323 §1 + this §1 only) + the SS8 file + any §2 pre-ruling use. Protected 11/11.
- UNIT: A-UNIT's files, the six mutants, and C's own group-header mutant re-run (now expected red at SS8a).
- EXPECT.
- PERF-SELECT and PERF-LOAD (alone, with the round 323 §2 tolerance and §3 reword).
- SELECT-NAMES (round 323 §3), including MU-SELECTION-IN-VALUE on a scratch dev server with its own `cacheDir`.
- DUP-NAMES.
- **Short reruns on A's final tree** (round 323's provisional rows ran on a stopped tree, so they are repeated): S2-VIDEO, S-CLICK, S-EDIT, S-DETAIL, S-TRANSPORT, S-RANGE and the project WAV export byte-compare HEAD vs A.
- **S-GROUP as redefined in §4.**
- G324-AUTH (as G323-AUTH, both viewports).

**L57 fields:**
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`
- an `origin` per finding
- `assertsSpecified` = 9 (SS1–SS7, SS8a, SS8b)
- `mutantsRecorded` = 6
- `mutantRedOnSketch` = `null`, with the reason "B built a type-only sketch; mutants not run on a B sketch (D-29z893)"
- `mutantRedOnTree` (C's run on A's tree)
- `gateChecksNamed` = 6
- `gateChecksRunOnSketch` = 2 (typecheck → `b-round-321/sketch-type-tsc.log`; full vitest → `b-round-321/precheck-full.log`)
- `chainHeadGateRunGreen` = `null`, with the reason "chain 322→323→324: gates 322 and 323 skipped on C FAIL; no gate ran on the chain head yet"

**Gate rows go under `"gate"`:** the full vitest, the build in `store/`, Biome, typecheck, `npm run verify` and the e2e smoke.

**`browserVerified`:** true only if every row from PERF-SELECT through G324-AUTH ran at the stated viewports.

**Ableton conformance:** not applicable (performance refactor, no behaviour change). CAND-R323-FOLD-CLEARS-SELECTION is not checked here.

## 7. Neighbouring behaviour at risk (C probes)
- Round 322 §5 and round 323 §2, unchanged.
- **The detail panel still updating** when the selection, the primary clip or the clip gain changes. The memo must not freeze it (S-DETAIL).
- **The folded group overview** following the selection (S-GROUP step 2, SS8b).

## 8. Next
- **After C PASS and gate 324:**
  - PERF-8 is done (8a + 8b).
  - C-R322-01 and C-R323-01 close on UNIT PASS, C-R322-02 on SELECT-NAMES PASS, C-R323-02 on SS8 + mutant PASS, INFO-C323-S-GROUP-PREMISE on S-GROUP PASS.
  - Root: ARCH-CHECKPOINT-PERF8-STORE-PATTERN becomes answerable at this PERF-8 boundary (non-blocking; no new request).
- **Round 325:** its planning will most likely fall on or after 2026-11-05. Then round 325 is a **REGRESSION** round, with the C-R318-06 repro and the CAND-R323-FOLD-CLEARS-SELECTION question (not C-R322-SHIFT-ADD, which is dropped). Otherwise round 325 is PERF-DRAG-PREVIEW.
- **The queue after that is unchanged:** PERF-DRAG-PREVIEW, PERF-9, PERF-10 (C-R320-01 row, SIG-R322-ACTIVE-TRACK-STORE, A-R322-ARCH-SELECTION-WRAPPERS, SIG-R323-R9L2-CONTROL-SOURCE), and so on to PERF-15, then SYS-R2-FAKE-FIDELITY → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries (skip rule).

## 9. Commit readiness
After C PASS and gate 324, root publishes the round 322 §2.1 paths + the SS8 file on top of `53c5c79`.

## 10. Claims
Run `bash b-round-323/claims-324.sh` from the loop root (`CLAIMS_STORE` may override the store path). It runs `b-round-321/claims-322.sh` for K1–K27 and re-emits K28–K37 in round-324 wording. Planning output: `b-round-323/claims-324-planning-output.txt`.

| Tag | Claim | Now (A's stopped tree) | After A |
|---|---|---|---|
| K1–K27 | as in `tasks/round-322.md` §9 | = `a-round-323/claims-after-stop.txt` | round 322 §3.1 / this §5 |
| K28 | `expect(` in `render-budget.test.tsx`: HEAD, working tree | 88 91 | 88 92 |
| K29 | round 322 setup probe (unchanged) | `['music', 'sfx']` 1 `exp=false` | same |
| K30 | gate 323 status | skipped | same |
| K31 | B planning K1–K27 = A's round-323 stop K1–K27 | planning-equals-stop | — |
| K32 | memoised selection wrappers in `StudioWorkspace.tsx` | 2 | 2 |
| K33 | docs 230/231 with l.4 `Completed (C round 324 PASS)` | 0 | 2 |
| K34 | `tasks/round-323.md` = B's before-copy of the round-323 task | archive-equal | same |
| K35 | the cited A, C and B artifacts exist | checked | checked |
| K36 | arrangement `Escape` handlers that clear the clip selection | 0 | 0 |
| K37 | Shift-adds branch lines in `ArrangementClip.tsx` | 2 | 2 |
| K38 | SS8 file present, its `expect(` count | absent | present, ≥ 3 |
| K39 | `counts.clear()` calls inside the R9-L2 `it` | 1 | 1 |
| K40 | `ArrangementTransport.tsx`: `} = useArrangement();` lines and `isPlaying,` lines; `ArrangementDetailPanel.tsx`: `useArrangement()` calls | 1 1 0 | 1 1 0 |
| K41 | group helpers in `track-group-collapse-ui.test.tsx` (`pressGroupKey`, `clickLane`, `mountGroupsWorkspace`) | 3 | 3 |
| K42 | fold probe: overview blocks, selected after fold, selected after Ctrl+A folded, fold state | 2 0 2 exp=false | same |
| K43 | consumer-count `toBeGreaterThan(0)` lines in `app/**/*.tsx` | 7 | 7 + the number of such lines in the SS8 file (A states it) |
| K44 | the old R11-P1e `ArrangementDetailPanel > 0` line | 1 | 0 |
