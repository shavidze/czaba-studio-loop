# A round 244 — EDITOR-MENU-FOCUS-FIX

**STOP:** none. **Tests above 50 % of their timeout:** none. The slowest covering test is UM9 X1 at 3.66 s against a 20 s describe timeout (18 %). In `grid-snap-menu.test.tsx` the slowest is GM1 at 1.26 s against 15 s; the whole file took 15.1 s for 53 tests, under covering-run load.

**Code review:** done (code-reviewer subagent, 8/10). 0 Critical/High/Medium, 6 Low and 4 info. Two doc Lows were fixed in doc 188; the test and source Lows go to B (§5).

## 1. Start state (§0, step 1)
- HEAD `149faab85978dff06c7450526e5cefb12013bb91`. `git status --short --untracked-files=all` was empty.
- `sha256sum -c --quiet` returned rc 0 on all three lists:
  - `b-round-243-r244-tree-sha256.txt` (1,101 files);
  - `b-round-243-r244-root-files-start-sha256.txt`;
  - `b-round-243-r244-grants-start-sha256.txt`.
- `git apply --check -p1 b-round-243/precheck-scratch.diff` gave rc 0.

## 2. Changes (only the 5 grants)
| # | Path | What |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementMarkerRow.tsx` | B's diff hunks, applied as is: the `focusEditorSuccessor` handle method, `blurSuccessorRef` (cleared in `openEditor` and on every call), and `noteBlurSuccessor` on the add-existing, add-commit and rename paths (blur only) |
| 2 | `app/components/arrangement/StudioWorkspace.tsx` | B's diff hunks, applied as is: `groupNameEditorRowId`, two group-id refs, the L1 write on every press, the request reading and clearing the press refs, and `closeGridMenu` falling back to the marker successor and then the group name button |
| 3 | `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | B's diff hunks, applied as is: the `groupSelectedRows` import, the `rightPress` helper, GM40–GM43 switched to `rightPress` (L3), and GM44–GM49 appended (in file order GM44, 45, 46, 47, 49, 48) |
| 4 | `docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md` | One line inserted after l.265, byte-identical to `b-round-243/doc186-line.txt`. `git diff --stat` shows `1 +` |
| 5 | `docs/implementation/2026/quarter-IV/188-marker-group-editor-menu-focus.md` | New doc. l.4 is `**სტატუსი:** Completed (C round 244 PASS)`. The seven TEMPLATE `## ` headings appear in order (l.7, 32, 71, 93, 105, 128, 140, re-checked after the review edits). It contains the successor table, the identity check, the rejected option, the reason the group id is captured at the press, a Mermaid sequence, and a TODO with addendum 9, ROOT-RECON-MARKER-ENTER, B-R243-UNDO-MARKER-FOCUS and the falsified clip-rename hypothesis. Every row id it cites was grepped: GM40–GM49 and FR1–FR4 exist in `grid-snap-menu.test.tsx`, MU14 in `markers-ui.test.tsx` (l.782), and GM14 (`grid-snap-menu.test.tsx` l.606) |

- **Diff equality:** I compared `git diff HEAD` of grants 1–3 with `precheck-scratch.diff`. The only differences are git's hunk-header function-context suffixes (`@@ … @@ export function StudioWorkspace() {`). Every `+`, `-` and context line is identical.
- **Final status:** `M` on grants 1–4 and `??` on doc 188. Nothing else is changed.

## 3. Checks run (actual results)
| Check | Result |
|---|---|
| `npx biome check` on grants 1–3, without `--write` | "Checked 3 files … No fixes applied", rc 0 |
| `npm run typecheck` | rc 0 |
| `npm run lint` | rc 0 (532 files; 205 warnings and 1 info, which exist outside this diff; none is an error) |
| Covering set `npx vitest run $(cat b-round-243/covering.txt)` | **67 files, 1,159/1,159 passed**, 133 s. Log: `a-round-244/covering.log` |

### Mutants (scratch copy `/tmp/a244-scratch`, made with `git archive HEAD` plus the 3 changed files; script `a-round-244/run-mutants.py`; logs `a-round-244/mutants/`)
| Run | Red rows (A) | Expected (B §0.2) |
|---|---|---|
| FIX-CONTROL | none (53/53) | none |
| MU-HEAD | GM44, GM45, GM46, GM47, GM49 | same |
| MU-NO-MARKER-FALLBACK | GM44, GM45 | same |
| MU-NO-GROUP-FALLBACK | GM46, GM49 | same |
| MU-L1-REVERT | GM47 | same |
| MU-RELEASE-LEFT-ONLY | GM40–GM49 (10) | same |
| MU-SUCCESSOR-NO-IDENTITY | GM49 | same |
| MU-ALWAYS-SUCCESSOR (covering-grep + grid-snap-menu, 270 tests) | GM44, GM45, MU14 | same |

`git status --short --untracked-files=all` in `store/` was identical before and after the mutant runs (checked with `diff`).

## 4. Browser (Playwright Chromium, `http://127.0.0.1:5173/studio-lab`, against the working tree served by the existing dev server)
I ran copies of B's scripts in `a-round-244/` (unedited). Results are in `editor-a.json`, `editor-a-markerAdd.json` and `neighbour-a.json`, with screenshots `*.png`. The state file is `a-browse.json`.

| Case | 1440×900 | 1280×720 |
|---|---|---|
| Marker add + right-click + Escape | `arrangement-marker` "Marker 1", `:focus-visible` true, outline brass at 0.8, solid 1px; markers 0 → 1; status `Marker “Marker 1” added at 00:00.000.` | same |
| Marker rename (`Hit`) | the renamed flag, `:focus-visible` true, brass 1px; status `Marker name: “Hit”.` | same |
| Group rename (`X`) | `arrangement-group-name` "X — group, selected", `:focus-visible` true, brass 1px; status `Group name: “X”.` | same |
| Control: track Volume fader | the fader, focus-visible, brass 1px | same |
| Neighbour: left click with the add editor open | BODY, marker committed (1), no menu | same |
| Neighbour: mouse choice `0.5 s` from the add editor | the new flag, grid 0.5, `:focus-visible` false (info) | same |
| Detached `closest` | `isConnected` false, `closest` null | same |

- **Event log** for marker add: `pointerdown[b2] active=input → out:input → mousedown active=BODY → contextmenu → in:BUTTON → out:BUTTON → in:arrangement-marker`. This matches B's log.
- **Page errors:** 0 in every valid row.
- **Environment-invalid attempt:** in `editor-a.json`, `markerAdd/escape@1440x900` hit the 120 s "Demo collection ready" wait on the first page load after the source edit (a cold Vite transform, the same pattern as B's `editor-scratch-attempt1`). I re-ran it once as `editor-a-markerAdd.json`, and both viewports were valid. The dev server was not restarted or stopped.

## 5. Code review (code-reviewer subagent, read-only, 8/10)
**Severity:** 0 Critical/High/Medium.
- **Correctness clean:**
  - A left press cannot move focus wrongly: the press refs are null, and `closeGridMenu` returns early on BODY or null.
  - There is no race between the blur commit and the menu close, because React flushes the discrete pointerdown first.
  - The group id is captured while the input is still connected.
  - Every new test can fail.
  - The project rules hold.
- **Fixed by A (doc 188 only, my grant):**
  - L2: MU14 was described as a "left-press blur" test. It actually commits by moving focus to the library search. The text is reworded at l.50–52, l.66–67 and l.131–132.
  - L1, the doc half: GM49 was described as a "left-press settle". It actually blurs by hand. The text is reworded at l.50–52 and l.113–114.
- **For B (Lows; not fixed because grants 1–3 must equal `precheck-scratch.diff` hunk for hunk, C-SCOPE-244):**
  - **A-R244-REVIEW-L1:** GM49 settles the marker editor with `markerInput.blur()`, not a real timeline left press, so the left-press path into the identity check is not covered in jsdom. The browser neighbour probe (`leftClick`: BODY) covers it.
  - **A-R244-REVIEW-L3:** the successor branch "add at a time that already has a marker" (`noteBlurSuccessor(result.existing.id)`, ArrangementMarkerRow.tsx ~l.347) has no row. A mutant that deletes it would likely stay green.
  - **A-R244-REVIEW-L4:** GM47's final assertion is `not.toBe(fader)`. With L1 the exact value is BODY, so `toBe(document.body)` would be stricter.
  - **A-R244-REVIEW-L5:** detached nodes stay in refs, bounded to one node each. `blurSuccessorRef` is written on every blur settle and cleared only by `openEditor` or `focusEditorSuccessor`. `gridMenuPressFocusRef` keeps a released element after a no-menu right press until the next pointerdown. Optional: clean up on unmount.
  - **A-R244-REVIEW-L6:** on macOS, a Ctrl+click context menu (`button 0`) gets no restore, so focus ends on BODY. This is pre-existing (the `button === 2` predicate dates from round 243), and L1 now writes null there instead of a stale value. It belongs in a separate task.
- **B task wording (L2 follow-up):** B's own §0.2 (the MU-ALWAYS-SUCCESSOR row) and §1 also call MU14 the "left-press blur neighbour". Please align that wording and the L47 recipe; it is not a doc-188 defect. The real left-press neighbour evidence is the browser `leftClick` row (BODY) and FR1/FR2/FR4.
- **Info:**
  - `focusEditorSuccessor` returns true even when the focus is deferred through `pendingFocusRef`. If the flag is gone before the next render (for example an Undo while the menu is open), focus stays on BODY. This is the existing `closeMenu` pattern.
  - `groupNameEditorRowId` depends on `ArrangementGroupHeader`'s `data-testid` (same pattern as `isMarkerTarget`). GM46 guards it.
  - There is no blank line between GM43 and GM44, and GM49 comes before GM48 in the file. This is cosmetic and Biome-clean.
- **Architecture note (for B/root, proposal only):** the reviewer recommends **keep for now**. Signal 3 applies: this is the third focus change in this region (rounds 242–244). Signal 4 applies: four grid-menu focus refs in StudioWorkspace, plus a module function that reads another component's DOM. Proposal: a separate task extracts `useGridMenuFocusReturn()` returning `{ onPointerDownCapture, onRequest, close }`. It is accepted when GM14, GM40–GM49 and FR1–FR4 stay green and the `useArrangement()` and marker handle shapes are unchanged. Cost is low to medium. This matches addendum 9 and was not acted on.

## 6. B acceptance (§4 A checks) that I passed
- [x] 1 start state; [x] 2 apply + grants 4–5; [x] 3 static checks; [x] 4 covering 67/1,159; [x] 5 mutants 7/7 exact; [x] 6 reviewer (§5; doc Lows fixed, test/source Lows passed to B); [x] 7 Playwright, both viewports, matches the "Scratch fix" column and the neighbour results.
- Not run by A, left for C: C-STALE-244, C-MENU-REG-244 (reposition, swallow, header, marquee), C-LEFT-NEIGHBOUR-244 (group case), C-EDITOR-COMMIT-244 (Undo), C-FOCUS-243-REG, C-BUDGET-244, LAB-SMOKE-244 (export hash) and the auth row. The full suite, build and verify are gate rows.

## 7. Known gaps and next C checks
- **The group left-click neighbour** (C-LEFT-NEIGHBOUR-244, second bullet) was not run in a browser by B or by A.
- **The reposition case** (C-MENU-REG-244) is not browser-proven yet.
- **B-R243-UNDO-MARKER-FOCUS** is pre-existing and out of scope.
- **C, probe first:** C-LEFT-NEIGHBOUR-244 (group), C-MENU-REG-244 reposition, C-STALE-244, then C-EDITOR-COMMIT-244 Undo with focus on the successor.
