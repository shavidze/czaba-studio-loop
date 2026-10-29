# A round 247 — UNDO-GROUP-FOCUS (B-R245-UNDO-GROUP-FOCUS, Medium)

**No STOP.** No covering test failed or is near its timeout. No Medium+ finding came from the review.

## 0. Pre-flight gate (also posted in chat before the edit)
- Assumptions: the task means "apply B's pre-checked diff exactly, then write doc 190", with no deviation from the hunks; the `:5173` server serves this working tree; success = GF1–GF7 green and the browser probe matching the "Scratch fix" column.
- Smallest version: the granted diff (GroupHeader +19 lines and 1 changed; StudioWorkspace +46); no new export.
- Files: the GroupHeader (detach signal), StudioWorkspace (record + rescue), the collapse test (GF1–GF7), doc 190 (the implementation-doc rule).
- Success commands: `npm run typecheck` rc 0, biome on the 3 files clean, the 96-file covering set green, mutants as in §0.2, and the probe at both viewports.
- Hunk headers: `a-round-247/hunks.txt`.

## 1. Start state (§0)
- HEAD `869d76732e4a4d8e0abe8476b7b403fc195a3a73`. `git status --short --untracked-files=all` was empty at start.
- `sha256sum -c --quiet` gave rc 0 on all three lists:
  - `b-round-246-r247-tree-sha256.txt` (1,104 lines);
  - `b-round-246-r247-root-files-start-sha256.txt`;
  - `b-round-246-r247-grants-start-sha256.txt`.
- `git apply --check -p1 b-round-246/precheck-scratch.diff` gave rc 0.

## 2. Changes (grants 1–4)
- **Grants 1–3:** `b-round-246/precheck-scratch.diff`, applied verbatim (`git apply -p1`). After the round, `git diff HEAD -- app` equals the precheck diff hunk for hunk; only the `index` lines were ignored in the comparison.
  - `ArrangementGroupHeader.tsx`: +19 lines, 1 line changed (the `useCallback` import). It adds the required prop `onFocusedRowDetach`, `rowNodeRef`, and the memoised `attachRowNode` (deps `[group.id, onFocusedRowDetach]`) on the root `arrangement-group-row` div.
  - `StudioWorkspace.tsx`: **+46 lines, 0 removed.** The task text says "42 added lines", but the diff it grants has 46 (16 + 5 + 13 + 11 + 1 across 5 hunks). I applied the diff exactly; only the count in the task text is off. It adds `focusRowSuccessor` before `libraryRailExpandButton`, `committedTrackRowsRef`, `detachedRowFocusRef`, the rescue layout effect before the `pendingRowFocusRef` effect, the commit-snapshot effect after it, `recordFocusedRowDetach`, and the `onFocusedRowDetach` prop.
  - `track-group-collapse-ui.test.tsx`: +168 lines, appended. It adds the helpers and the describe `B-R245 a history step that removes the focused group row` (`{ timeout: 20_000 }`) with GF1–GF7. Every existing line is unchanged.
- **Grant 4:** new `docs/implementation/2026/quarter-IV/190-group-undo-focus.md`.
  - l.4 is exactly `**სტატუსი:** Completed (C round 247 PASS)`.
  - The 7 TEMPLATE `## ` headings are present, in order.
  - It covers D-29z415, the precedence of `pendingRowFocusRef`, why the record is taken at ref detach (measured facts kept apart from inference), and the rejected designs (onBlur, BODY-based, around `undo()`, the shared mechanism).
  - It has the Mermaid sequence and the full mutant table.
  - TODO: D-29z416, and the `blurGroupVolume` on removal note.
  - It cites only GF1–GF7, which exist (grep).
- **Final status:** `M` on grants 1–3 and `??` on the doc 190 path, nothing else.
  - Tree, root and protected checks all pass: tree `sha256sum -c` rc 0, root list rc 0, and the 7 protected files give `git diff --quiet HEAD` rc 0.

## 3. Checks actually run
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 |
| `npx biome check` on grants 1–3 | "Checked 3 files … No fixes applied." |
| `npm run lint` | rc 0 (205 pre-existing warnings, 1 info; same command as the repo baseline) |
| Covering set `npx vitest run $(cat b-round-246/covering.txt)` | **96/96 files, 1,492/1,492 tests**, 115.8 s, rc 0 (`a-round-247/a247-covering.log`, summary `a-round-247/covering-summary.txt`; tsc/lint logs `a-round-247/a247-tsc.log`, `a247-lint.log`) |
| GF row times | GF1 0.66 s, GF2 1.09 s, GF3 1.00 s, GF4 0.68 s, GF5 1.18 s, GF6 0.71 s, GF7 0.94 s. The limit is 20 s; GF5 is the slowest at 6 % |
| Timeout headroom (L11/L31) | The slowest individual test is CP12b in `clip-gain-pointer-preview.test.tsx`: A 5.10 s, gate 246 `verify.log` 7.16 s (CP12a), declared limit 30 s, so 24 %. `track-group-collapse-ui` file total: 23.3 s for 30 tests (gate 246: 23.8 s for 23). Nothing is above 50 %. |

## 4. Mutants (scratch copy `/tmp/a247-mut`, outside the repo)
- **Setup:** `git archive HEAD` plus the 3 changed files copied over (each `cmp` identical), with `node_modules` symlinked.
- **Runs:** `b-round-246/mutants/run-mutants.sh /tmp/a247-mut a-round-247/mutants`. MU-HEAD ran inside the same scratch, with `git show 869d767:<file>` for both source files, followed by a restore.
- **Repo:** `git status` is byte-identical before and after.
- **Logs:** `a-round-247/mutants/` (`summary.txt` plus one log per run).

| Run | Red (A) | Expected (§0.2) |
|---|---|---|
| FIX-CONTROL | none (30/30) | none |
| MU-HEAD | GF1–GF5 | GF1–GF5 |
| MU-PREVIOUS-FIRST | GF1–GF5 | GF1–GF5 |
| MU-NO-CONTAINS | GF5, GF6 | GF5, GF6 |
| MU-NAME-ONLY | GF3, GF5 | GF3, GF5 |
| MU-VISIBLE-ORDER | GF4 | GF4 |
| MU-RENDER-ORDER | GF1–GF5 | GF1–GF5 |
| MU-PRECEDENCE-INVERTED | GF7 | GF7 |
| MU-BODY-BASED | GF6 | GF6 |

All 9 runs match.

## 5. Browser (Playwright Chromium against `:5173`, 1440×900 and 1280×720)
- **Probe:** a copy of B's probe, `a-round-247/group-origins-probe-247-a.cjs` (unedited). Output in `a-round-247/probe.json`, `probe.log` and `shots/`.
  - **One environment-invalid attempt:** `groupUndo@1440` timed out waiting for `Demo collection ready` (120 s), while the mutant runs were loading the machine. It was re-run once alone and passed: `probe-rerun-groupUndo1440.json`, `shots-rerun/`.
  - Every other row loaded normally. Every row has 0 page errors.
- **Results** (they match B's "Scratch fix" column):
  - **groupUndo, groupUndoNatural, groupUndoTab, ungroupRedo, groupUndoY, foldFocusUndo, muteFocusUndo, volumeFocusUndo, collapsedUndo, volumeStepUndo:** focus lands on the Music name button at both viewports, never BODY. Status is `Undo: Group Tracks`, or `Redo: Ungroup Tracks` for the redo rows. Groups go 1 → 0.
  - **groupUndoTab:** `:focus-visible` is true, with outline `solid 1px color(srgb 0.788235 0.643137 0.415686 / 0.8)` at both viewports.
  - **nestedOuterUndo:** focus lands on the Group 1 name; groups go 2 → 1.
  - **Precedence and kept rows:**
    - ungroupPrecedence → Music.
    - nestedInnerUndo → Group 1 keeps focus.
    - ungroupUndo and groupRedoMember → Music keeps focus.
    - renameUndo → the group name keeps focus, and the name is back to "Group 1".
  - **No-steal:**
    - noStealOtherTrack → Video.
    - memberFocusUndo → Stems.
    - noStealBody → BODY.
    - transportUndo → focus on "Redo: Group Tracks".
  - **gridMenuUndo:** BODY before and after, the same as HEAD (`head-vol-menu.json`); this is not this round's origin. **markerMenuUndo:** nothing is undone, the same as HEAD.
  - **collapseFocusReg:** the group folds, and focus is on the group name with `:focus-visible` true.
- **Extra check for the third `Ctrl+Z` of C-VOLUME-REMOVAL-247:** `a-round-247/vol3-probe.cjs`, output in `vol3-probe.json` and `vol3-1440.png` / `vol3-1280.png`. At both viewports:
  - `ArrowDown` ×2 takes the value to −0.2.
  - Ctrl+Z #1 and #2 each give `Undo: Volume`; the row stays and the fader keeps focus.
  - Ctrl+Z #3 gives `Undo: Group Tracks`, 0 groups, and focus on Music.
  - 0 page errors.
  - My script did not capture the Undo/Redo button titles (its aria-label lookup returned nothing), so C must check that part.

## 6. code-reviewer (actual subagent, read-only)
- **Score:** 8.5/10. No Critical, High or Medium.
- **Ordering assumptions confirmed:** ref(null) runs in the mutation phase before node removal and before the layout effects; `committedTrackRowsRef` still holds the previous commit at detach time; the effects run in declaration order; StrictMode is safe; precedence holds.
- **Low findings (not fixed: grants 1–2 are "exactly the hunks", so I pass them to B):**
  - **A-R247-REVIEW-L1:** `StudioWorkspace.tsx` `focusRowSuccessor`. When `removedId` is not in `order` (`index === -1`), every row becomes a candidate, so Video would get focus. It is unreachable today, because a focused row is always in the previous commit's list. Fix: `if (index === -1) return;`.
  - **A-R247-REVIEW-L2:** the rescue effect does not check whether focus already moved in the same commit; child layout effects run first (only `ArrangementMarkerRow`'s own rescue today, which cannot fire in the same history step). Fix: only rescue when `activeElement` is null, BODY, or disconnected.
  - **A-R247-REVIEW-L3 (tests):** the "else previous row" fallback of D-29z415 has no test. It is effectively unreachable for group history steps.
- **Info:**
  - GF3 does not cover solo; `contains` covers it by construction. Doc 190 now says this.
  - `trackRowNameButton` depends on the aria-label substring (pre-existing).
  - `blurGroupVolume` on removal (pre-existing; already a TODO in doc 190).
  - Doc 190 wording: "not in `trackRowsRef.current`" means the visible rows. It is correct today because a collapse blurs hidden focus first.
- **Doc follow-up:** I acted on the two doc points in grant 4 by adding the solo and fallback note to the testing section.
- **Architecture note (for B/root, not a refactor here):** `StudioWorkspace` now holds several independent focus-rescue refs and effects (`pendingRowFocusRef`, `detachedRowFocusRef`, `pendingLibraryRailFocusRef`, the grid-menu return refs), and their precedence lives only in declaration order. Keep for now: low cost, one commit lifecycle. A later bounded task (already D-29z416) could merge them into one prioritised focus-request record and effect, using the GF/UC tests as acceptance; the risk is effect-order regressions.

## 7. B acceptance criteria A passed
- §4 steps 1–7: done, with results as above. Step 7 had one environment-invalid row, re-run.
- C-SCOPE-247 preconditions:
  - status;
  - hashes;
  - protected files;
  - diff equal to the precheck.
- GF1–GF7 green; the covering set is green.
- The mutant table matches.
- The browser origins, precedence, no-steal and keep rows at both viewports match the expected column.
- The third Ctrl+Z of C-VOLUME-REMOVAL-247 lands on Music.

**Not claimed (C's or the gate's rows):**
- C-BUDGET-247;
- LAB-SMOKE-247 (export hash);
- Auth;
- C-MARKER-REG-247;
- the Undo/Redo titles in C-VOLUME-REMOVAL-247;
- AN-REVIEW-247 (C checks independently);
- the full suite, build, verify and e2e smoke (gate).
- The purchased-origin row is BLOCKED (backend unavailable in cloud).

## 8. Next C checks
1. C-SCOPE-247: run `git diff HEAD -- app` against `b-round-246/precheck-scratch.diff`, and the 3 hash lists.
2. C-GROUP-ORIGINS-247, especially groupUndoTab, reached by real `Tab`, with the ring painted. Also nestedOuterUndo.
3. C-VOLUME-REMOVAL-247 with the Undo/Redo titles at every step, compared with HEAD.
4. C-NO-STEAL-247, C-PRECEDENCE-247 and C-KEEP-247.
5. C-UNDO-BUTTON-247 and C-COLLAPSE-REG-247.
6. LAB-SMOKE-247 (export sha `1fea093b…`), C-BUDGET-247 and Auth.
7. AN-REVIEW-247 on doc 190.
8. Info: gridMenuUndo. In my probe, focus was on BODY before `Ctrl+Z`, so it never tested "focus in the menu". C's §6 info probe stays open.

## 9. Known gaps
- The three review Lows (L1–L3 above) are open, for B to rule on; they are outside the exact-hunk grants.
- Chromium ref-detach-before-removal is still inferred from the outcome, not printed directly (as stated in doc 190).
- No commit, push or deploy. No file outside the grants was changed; the scratch copy and logs are outside `store/`.
