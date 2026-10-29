# A round 246 — B-R243-UNDO-MARKER-FOCUS (implementer report)

No STOP. No covering test is red or above 50 % of its timeout (details in §3).

## 1. Start state (task §0) — run by A
- HEAD `e9fb805e28e6679c08c6c64f96562b355d171bf7`; `git status --short --untracked-files=all` was empty.
- From `store/`: `sha256sum -c --quiet` on `b-round-245-r246-tree-sha256.txt` (1,104 files) gave rc 0; on the root-files start list, rc 0; on the grants start list, rc 0.
- `git apply --check -p1 b-round-245/precheck-scratch.diff` gave rc 0.

## 2. Changed files (grants 1–3 only)
| Path | Status | Change |
|---|---|---|
| `app/components/arrangement/ArrangementMarkerRow.tsx` | M | B's diff applied as is (`git apply -p1`), +34 lines, nothing removed. Hunks: <ul><li>`focusSuccessorAfterRemoval` (module function, before `markerFlagMenuAnchor`);</li><li>`detachedFocusRef`;</li><li>a no-deps `useIsomorphicLayoutEffect` before the `pendingFocusRef` effect;</li><li>the record in the flag ref callback's `null` branch.</li></ul> |
| `app/lib/arrangement/__tests__/markers-ui.test.tsx` | M | B's diff applied as is: the `pressCtrlKey` helper and MU18–MU23 after MU9. |
| `docs/implementation/2026/quarter-IV/189-marker-undo-focus.md` | ?? | New doc 189. <ul><li>l.4 is exactly `**სტატუსი:** Completed (C round 246 PASS)`.</li><li>Its `## ` headings contain the 7 TEMPLATE headings in order.</li><li>Every cited row id was grepped and exists: MU4, MU7, MU8, MU8b, MU8e, MU17–MU23.</li></ul> |

- `git diff HEAD` of grants 1–2, compared on its `@@`/`+`/`-` lines, is identical to `b-round-245/precheck-scratch.diff`.
- The 7 protected files: `git diff --quiet HEAD` rc 0 for each.
- The tree and root hash lists were re-checked after the work: rc 0 and rc 0.
- Status after the work: exactly the 2 `M` and 1 `??` above.

## 3. Tests actually run
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 |
| `npx biome check` on grants 1–2 | "Checked 2 files … No fixes applied." |
| `npm run lint` | rc 0 (532 files checked; 205 warnings and 1 info; `grep -c` of the two granted file names in the lint log = 0) |
| Doc 189, re-checked after the reviewer edits | l.4 byte-exact; `## ` headings at lines 7, 22, 64, 83, 91, 112, 147 in TEMPLATE order; every cited MU id appears once as a test row |
| Covering set: `npx vitest run $(cat b-round-245/covering.txt)` | **58/58 files, 1,115/1,115 tests passed**, 100 s. Log: `a-round-246/covering.log` |
| Timeout headroom (L11/L31) | Slowest single test: CP12a, 6.7 s in A's run and 8.15 s in gate 244 `verify.log`, against a 30 s describe timeout (27 %). UM9 X1: 2.6 s (A) and 3.3 s (gate), against a 20 s describe timeout. No test is above 50 % of its timeout. |

The full suite, `verify`, build and e2e smoke were not run (speed rule). They are gate rows.

## 4. Mutants (scratch copy `/tmp/a246-scratch`, outside the repo)
- Setup: `git archive HEAD`, plus the 2 changed files copied in, plus `node_modules` symlinked.
- Script: `b-round-245/mutants/run-mutants.sh`, unedited. MU-HEAD was run by hand (`git show e9fb805:<file>` copied into the scratch copy).
- Logs: `a-round-246/mutants/*.log`.

| Run | Red rows (A) | Matches §0.2 |
|---|---|---|
| FIX-CONTROL | none (31/31) | yes |
| MU-HEAD | MU18, MU19, MU20, MU23 (4 failed / 31) | yes |
| MU-ALWAYS-ADD | MU19, MU20, MU23 | yes |
| MU-PREVIOUS-FIRST | MU19, MU20, MU23 | yes |
| MU-STEAL | MU19, MU20, MU23 | yes |
| MU-NO-ID-CHECK | MU4, MU7, MU8, MU8e, MU17, MU20, MU21, MU22 | yes |
| MU-NEXT-NOT-SURVIVOR | MU23 | yes |
| MU-BODY-BASED | MU21 | yes |

The repo `git status` was byte-identical before and after (`cmp` of the two status dumps).

## 5. Browser (Playwright, Chromium, against the running `:5173`; no server started or stopped)
- Script: a copy of B's probe, `a-round-246/a-undo-origins-probe-246.cjs`, unedited.
- Results: `a-round-246/a-undo-origins-attempt1.json` and `a-round-246/a-undo-origins-addUndo1440.json`. Screenshots: `a-round-246/shots/`.

| Case | 1440×900 | 1280×720 |
|---|---|---|
| addUndo | **Add marker** (`arrangement-marker-add`), `:focus-visible` true; status `Undo: Add Marker`; flags 1 → 0 | same |
| addUndoNeighbour | **Marker 1 — 00:00.100**, `:focus-visible` true; `Undo: Add Marker` | same |
| deleteRedo | **Add marker**, outline as Chromium printed it: `color(srgb 0.788235 0.643137 0.415686 / 0.8) solid 1px` (= #C9A46A at 0.8); status `Redo: Delete Marker` | same |
| moveUndo (control) | the flag keeps focus (00:00.000); `Undo: Move Marker` | same |
| addUndoThenRedo (info) | Add marker → Add marker; `Redo: Add Marker` | same |
| groupUndo / ungroupRedo (info, out of scope) | BODY (known B-R245-UNDO-GROUP-FOCUS) | BODY |

- 0 page errors on every row.
- **Invalid attempt:** `addUndo@1440` timed out once at 120 s waiting for `Demo collection ready` (a cold start, as in B's run). It is kept in `a-undo-origins-attempt1.json` and was re-run once with `ONLY_VP=1440 ONLY_ROW=addUndo`, which passed.
- A did not run `Ctrl+Y` or Cut Time in the browser. In the unit tests they are covered by MU20 and MU23. The browser checks are C's rows (C-UNDO-ORIGINS-246 Ctrl+Y, C-CUTTIME-246).

## 6. code-reviewer (real subagent, read-only)
- **Result:** no Critical, High or Medium findings; score 8/10. The reviewer confirmed that React detaches the ref before the node is removed, that the `=== activeElement` check limits the record to one per commit, and that the Delete, Move and drag paths are unaffected.
- **What A changed, in doc 189 only:**
  - the mutant table now defines each mutant in one line, and explains why MU21 does not catch MU-STEAL (the last detach is a surviving flag's);
  - a Problem → Solution note on the inline-ref `order` freshness risk;
  - the Chromium inference now also cites React 18's commit order, still marked as not measured in Chromium.
- **Not changed (outside the byte-exact grant 2), for B:**
  - **A-R246-REVIEW-L1 (Low, test gap):** no row covers "the next flag was removed in the same step, but a later one survives" (e.g. 4 markers, focus B, cut B and C, expect D). A mutant that checks only `order[index + 1]` before falling back to the previous flag would pass MU23. Suggested: one more MU row in a later round on this owner.
  - **A-R246-REVIEW-INFO1 (pre-existing, not this round):** the marker context menu is open (focus inside its portal), and Undo or Cut Time removes that marker. `menuMarker` becomes null, the portal unmounts and focus falls to BODY. This is not reproduced in the browser by A; it is a source-reading hypothesis. Same L47 class; B to rule (next to B-R245-UNDO-GROUP-FOCUS).
  - **Info:** MU21 part 1 and MU22 are guards (green on HEAD); the proofs are MU18, MU19, MU20 and MU23, all red on MU-HEAD.
- **Architecture note (for B/root, not acted on):** `detachedFocusRef` plus a no-deps layout effect make the fourth focus-recovery ref in `ArrangementMarkerRow` (with `pendingFocusRef`, `restoreFocusRef` and `blurSuccessorRef`). The reviewer's verdict is keep: the same DOM owner, one lifecycle, and no change to the handle, audio or history. Candidate for later: a shared focus-successor mechanism for the marker row and the group row (checkpoint question 4).

## 7. B acceptance status (A side only; C verifies)
- **Run by A and matching:**
  - §4 steps 1–7: start state, apply, static checks, covering set, mutants, reviewer, browser probe (the "Scratch fix" column);
  - grant 3 written with the l.4 and heading rules.
- **Not claimed by A:** every C row of §5. In particular:
  - C-NO-STEAL-246, C-KEEP-246 rename, C-CUTTIME-246 in the browser, C-UNDO-BUTTON-246, C-MENU-DELETE-246, C-EDITOR-REG-246, C-BUDGET-246, LAB-SMOKE-246 and Auth;
  - RT-FIX-246, which is B's documents; A did not touch `lessons.md` or `retros/`.
- **Backend-blocked:** "Purchased origin" (backend unavailable in cloud).
- **Gate rows:** full vitest, build, `verify` and e2e smoke.

## 8. Exact next C checks
1. C-SCOPE-246: HEAD `e9fb805`; status is exactly the 3 paths above; both hash lists rc 0; the 7 protected files are clean; grant 1–2 diff equals `b-round-245/precheck-scratch.diff`.
2. C-UNDO-ORIGINS-246 at both viewports, plus one `Ctrl+Y` Redo of a delete with the restored flag focused (expect the next flag, else Add marker; never BODY).
3. C-CUTTIME-246 in the browser (A did not run it).
4. C-NO-STEAL-246: another flag focused, Add marker focused, and BODY (empty-area click), each with `Ctrl+Z`.
5. C-UNDO-BUTTON-246 and C-MENU-DELETE-246. Optionally probe A-R246-REVIEW-INFO1 (menu open, then `Ctrl+Z` of that marker's add) as info.
6. C-KEEP-246 (moveUndo, rename + `Ctrl+Z`), C-EDITOR-REG-246, C-BUDGET-246, LAB-SMOKE-246, Auth, AN-REVIEW-246 (doc 189), RT-FIX-246.

## 9. Known gaps
- A-R246-REVIEW-L1 and A-R246-REVIEW-INFO1 (above).
- B-R245-UNDO-GROUP-FOCUS stays open (BODY confirmed again by A's probe; out of scope).

Scope completed: grants 1–3 only. No commit, push, install, deploy or server start/stop.
