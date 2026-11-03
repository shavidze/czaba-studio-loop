# C round 323: PERF-8b resume verification — FINAL: FAIL (browserVerified false; see FINAL at the end)

**A status:** `STOP — needs B ruling` (render-budget.test.tsx R11-P1e l.467, broken by the §2 ruling-1 memo). The round cannot PASS (precedent: rounds 282/318/319/322 → FAIL).

## Checkpoint 1 (stop-tree rows)
- CLAIMS (`c-round-323/claims-c.txt`, 0.5 s): byte-equal to `a-round-323/claims-after-stop.txt`. K28 `88 91`, K32 2 (met). K19 0 (needs ≥ 5), K13 still lists doc 230 `In Progress`, K33 0 (needs 2) → A-CLAIMS-AFTER not met.
- SOURCE-SCOPE: 35 status entries = 4 app files + `selection-store.ts` + 30 test files (the 29 + `render-budget.test.tsx`). `render-budget.test.tsx` diff = exactly the §1 edit (+4 lines, 0 removed). StudioWorkspace memo: `ArrangementGroupHeaderWithSelection = memo(…Inner)` l.714, `ArrangementDetailPanelWithSelection = memo(…Inner)` l.794. Protected 11/11 (K8).
- STOP repro (`c-round-323/render-budget-atree.log`, scratch `/tmp/c323/atree`): 7/8, fails at l.467 `expected 0 to be greater than 0`. Genuine: a positive control outside the §1 grant.
- A's option (a) on C's scratch (`option-a-c.log`): 8/8, `expect(` 92. Un-memo detail wrapper mutant (`option-a-mutant-nomemo-c.log`): red at **l.468** (the new `ArrangementDetailPanel toBe(0)`, "expected 3 to be +0"). So the new negative row pins the memo. `StudioWorkspace.tsx` restored (cmp). **Note:** the scratch `render-budget.test.tsx` kept option (a) for the next mutant. It was restored to A's version (cmp with the store) before the UNIT run below.
- **C's own mutant** (`c-mutant-group-nomemo.log`; file list in `c-mutant-group-files.txt`): un-memoising `ArrangementGroupHeaderWithSelection` → render-budget + the 8 `*group*` test files **all green (9/9 files, 110/110 tests)**. `render-budget.test.tsx` in this run had **option (a) applied**, deliberately: A's version is red at l.467 regardless, which would mask the result. No current test pins the group-header memo. Note for the resumed round (SS file / a row should cover it).
- G323-AUTH (`g323-auth.json`): **PASS** both viewports (lab workspace + demo badge, `auth_user` null, no page errors; `/studio/middle-east` "Sign in required", 0 `audio[src]`; token API 401 / 500 no token / 400). Attempt 1 timed out on the cold compile (`g323-auth-attempt1-cold.log`); one retry after warm-up.

## Checkpoint 2 (browser rows; HEAD = scratch `git archive 53c5c79` on :5197 with its own `cacheDir /tmp/c323-head-vite-cache`; A = :5173)
- DUP-NAMES (`c-round-323/probe/dup-summary.txt`, `dup-ctrl-d-commit-diff.txt`; probe = `b-round-321/click-hooks-probe.mjs`, cmp-identical to C322's copy). On the `dup-ctrl-d` edit commit, HEAD renders **110** and A renders **112**. The two added names are `ArrangementDetailPanelWithSelectionInner` and `ArrangementSelectedClipReadoutInner`, once each, and no names were removed. Both are on the §2 list of eight. Step totals: HEAD 204, A 114. On `click-original-same-lane` the only names A adds over HEAD are the same two subscriber Inners, and A renders 25 components to HEAD's 107. **Meets §2 on the stopped tree.** It is provisional: A-PERF has not run.
- SELECT-NAMES (§3 reword), from the same run: on `click-original-again`, HEAD gives 2 commits (92, then 0) and A gives **1 commit with 0 components**, `providerRendered` false. That meets the reworded clause. The `click-original-same-lane` provider did not render on A. **MU-SELECTION-IN-VALUE was not run**, because A wrote no mutant set (STOP).
- S2-VIDEO (`probe/s2-summary.txt`): HEAD has **2** mixed commits (range cleared while the old selection is still drawn) and A has **0**. 0 frames on both. The same as in round 322.
- §4 setup + S-CLICK across lanes + S-GROUP (`c323-group.mjs`, `group-{head,a}.json`, `group-summary.txt`, `shots/{head,a}-group-*`):
  - The setup works on **both** trees at both viewports: Music add, Ctrl+D, SFX active, SFX add, zoom out, all 3 name bars visible. Ctrl+G gives the status "Group “Group 1” created: Music, Stems, SFX." with one fold, `aria-expanded` true.
  - **All 22 step states are identical HEAD vs A at 1440×900 and at 1280×720**, with no page errors.
  - **S-GROUP:** the screenshots of the group header (overview row) and the full window, with Music selected and with SFX selected, are **byte-identical PNGs** HEAD vs A at both viewports (8 files). The setup screenshots are byte-identical too. Folding a group clears the clip selection on **both** trees; this is pre-existing.
  - **INFO-C322-SHIFT resolved:** Shift+click **does add** on HEAD (and on A).
    - `keyboard.down('Shift')`+mouse on the SFX clip: 1 → "2 clips selected".
    - `locator.click({modifiers:['Shift']})` on the second Music clip: → "3 clips selected".
    - It adds same-lane (c8) and cross-lane (c4). **The cause of round 322's non-add is unexplained.** A hypothesis, not verified: the third clip of the round-322 one-lane setup sat at about 202 s and was likely off-screen at that zoom. Round 322 did not record visibility; this round's `visibleBars` are all true. **C-R322-SHIFT-ADD candidate: not confirmed; drop it.**
  - **INFO-C323-S-GROUP-PREMISE: S-GROUP as written is partly vacuous.**
    - At gs1, "select a Music clip" left all 3 selected: a click on an already-selected clip keeps the multi-selection on both trees.
    - Folding the group clears the clip selection on both trees.
    - So the collapsed-overview screenshot never contains a selected clip, and the intended comparison (how a selection renders in the folded overview) did not happen.
    - The byte-identical PNGs are still valid HEAD-vs-A evidence.
    - B should redefine the row or drop it. "Fold clears the clip selection" is a pre-existing candidate for the REGRESSION round (behaviour question vs Live), not A's.
  - **INFO-C322-ESC:** Esc does not clear the 3-clip selection on HEAD (c9). A is the same. It matches K36 = 0, so it is not a finding.
- S-CLICK / S-EDIT / S-DETAIL / S-TRANSPORT / S-RANGE (`c323-rows.mjs` = the C322 script with only the output dir changed; `rows-{head,a}.json`, `rows-diff.txt`): **50/52 step states identical** at both viewports. The 2 that differ are the `export` entries, and they differ only in the download file path. This re-run matters because the new detail-panel memo could have stopped the detail panel from updating. It did not: the S-DETAIL texts and gain states are equal.
- Export (project WAV, from fresh files of this run): 304.056 s, 48 kHz / 24-bit / 2 ch, peak 1.0. All four files (HEAD/A × 2 viewports) share sha256 `5046a987…57d2` and are **byte-identical** (`export-sha256.txt`).
- Store untouched by C: 35 status entries before and after, and the claims at the end equal `claims-c.txt`. C's scratch dirs are `/tmp/c323/{atree,head}`; `atree` was restored after every mutant (cmp). The HEAD server on :5197 is stopped, and :5173 still answers 200.

# FINAL — C round 323 verdict: **FAIL** (browserVerified = realVerified = false)

A STOPped again (§6 / §1 "Nothing else in the file changes"). PERF-8b is incomplete, so the round cannot PASS. The precedent is rounds 282/318/319/322. **There is no app bug.**
- On every browser row C could run, A's tree (now with the two memo wrappers) behaves exactly like HEAD 53c5c79, and the export is byte-identical.
- The STOP is genuine. The §2 memo works as B predicted (§2.3), and that makes the R11-P1e positive control false.

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | **PASS**: §2.1 + render-budget (only the §1 edit); protected 11/11 | git status/diff |
| CLAIMS | FAIL: K19 0 (needs ≥ 5), K13 still lists doc 230, K33 0 (needs 2). K28 `88 91` and K32 2 are met | `claims-c.txt` |
| UNIT | FAIL: render-budget 7/8 (R11-P1e l.467). C's own run of the 111 files on a scratch tree cmp-equal to the store: **110/111 files, 1704/1705 tests, the only failure is l.467**, 205.5 s. No SS file and no 4 mutants | `unit-c.log`, `render-budget-atree.log` |
| EXPECT | provisional meet: `expect-count.py` (the 29 list files) gives TOTAL 4021, every file equal to HEAD; render-budget 88 → 91 (K28), no line removed | `expect-count-c.txt` |
| PERF-SELECT / PERF-LOAD | BLOCKED: no §2.5 harness (K19 0), no A-PERF | — |
| SELECT-NAMES | provisional meet of the §3 clause; mutant not run | `probe/dup-summary.txt` |
| DUP-NAMES | provisional meet: only 2 subscriber names added, once each | `probe/dup-ctrl-d-commit-diff.txt` |
| S2-VIDEO | provisional meet: HEAD 2, A 0 | `probe/s2-summary.txt` |
| S-CLICK/S-EDIT/S-DETAIL/S-TRANSPORT/S-RANGE | provisional: identical to HEAD at both viewports | `rows-diff.txt`, `group-summary.txt` |
| S-GROUP | provisional: pixel- and byte-identical to HEAD at both viewports | `shots/*group*` |
| G323-AUTH | **PASS** at both viewports | `g323-auth.json` |
| Ableton conformance | not applicable | — |

## For B
1. **C-R323-01 (Medium; origin B spec, the same class as C-R322-01 / A STOP):** rule on render-budget R11-P1e l.467.
   - C reproduced the failure (7/8, `expected 0 to be greater than 0`).
   - A's option (a) on C's scratch copy passes 8/8 and gives `expect(` 92, with no line removed.
   - The un-memo mutant goes red at the **new** l.468 (`expected 3 to be +0`), so the new negative row pins the detail-wrapper memo. The positive control moves to `ArrangementTransport`, which still re-renders on Play/Stop.
   - C sees no objection to granting it.
   - **Why it was missed:** B's L58 grep covered only R9-L2. §2 ruling 1 introduced a new memo, and nobody re-checked the consumer-count positive controls against it. A's grep of 7 `toBeGreaterThan(0)` controls is confirmed (C counts 7 too). Only l.467 fails.
2. **C-R323-02 (Low; origin B spec/A, test gap):** the `ArrangementGroupHeaderWithSelection` memo is not pinned by any test. C's mutant, which removes that memo, stays green in render-budget + 8 group test files (110/110). The resumed round's SS file or a row should name a test that turns red without this memo (L52).
3. **INFO-C322-SHIFT resolved:** Shift+click adds on HEAD (on another lane, and on a second clip on the same lane). Drop the C-R322-SHIFT-ADD candidate from the REGRESSION round.
4. After the ruling, C re-runs: CLAIMS, UNIT with the SS file, the 4 mutants and C's group-header mutant, EXPECT, PERF-SELECT, PERF-LOAD, the SELECT-NAMES mutant, and short S-* reruns.
