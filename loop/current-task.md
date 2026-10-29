# Round 246: UNDO-MARKER-FOCUS — when a history step or Cut Time removes the focused marker flag, focus goes to the next surviving flag, else the previous one, else "Add marker". Plus RT-FIX-246 (C re-checks the lesson and retro lines B corrected)

**Planned by:** B, at the round 245 → 246 planning, 2026-10-29. **Decisions:** D-29z406…D-29z411.

**Type:** bug-fix round, one Medium with one owner: `ArrangementMarkerRow.tsx`. One mechanism (the focused flag's id leaves `markers`) reaches it by three paths: Undo of an add, Redo of a delete, and Cut Time. RT-FIX-246 is a document check of B's own files. It adds no code.

| Id | Severity | Origin | One line |
|---|---|---|---|
| **B-R243-UNDO-MARKER-FOCUS** | Medium (pre-existing) | B round-244 planning probe; **re-measured at HEAD `e9fb805`** (§0.3) | With a marker flag focused, `Ctrl+Z` of its add removes the flag and focus ends on BODY. So does Redo of a marker delete with the restored flag focused. Both viewports. |
| C-R245-01, C-R245-02, C-R245-03 | Low (documents) | C round 245 RT-LESSONS and RT-SABA | B corrected these at this planning (D-29z407). C re-checks only the changed lines (RT-FIX-246, §5). |

**Why this round (D-29z406, D-29z408):**
- Round 245 (RETRO 245) FAILED only on its document rows: RT-LESSONS and RT-SABA, 3 Lows.
- Its product rows passed: G245-AUTH and STUDIO-SMOKE-245, with `browserVerified: true`.
- Gate 245 was `skipped` and nothing was published, so the baseline is still `e9fb805`.
- The outcome table of round 245 (§4, D-29z405) puts **B-R243-UNDO-MARKER-FOCUS** next when this planning is still on 2026-10-29. It is.
- **REGRESSION** (`regression-last.json`: 2026-10-27, round 199) is due at the first planning on or after 2026-10-30, so not now. **RETRO** is next due at round 260.

**Read first:** `lessons.md` in full. RT-FIX 246 changed its header, L11, L12 and L50. Directly relevant here:
- L47 (focus target, BODY never expected) and **L50** (origins by grep, §0.3);
- L11 (STOP, now with the restored old-L32 clauses) and L12 (testid hits);
- L23 (B's pre-check, §0.2) and L29 (every signal and recipe was run, §0.3);
- L26 and L28 (doc 189) and L31 (timeouts).

**Not this round:**
- **B-R245-UNDO-GROUP-FOCUS** (Medium, pre-existing, new, D-29z409). With the group name button focused, `Undo: Group Tracks` or `Redo: Ungroup Tracks` removes the group row, and focus ends on BODY (§0.3).
  - It is the same L47 class, but a different owner (`StudioWorkspace.tsx`: `pendingRowFocusRef`, `focusedTrackRowId`).
  - It is scheduled after the REGRESSION round and is question 4 of ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS.
  - C records it as info only. It is not a regression of this round.
- `useGridMenuFocusReturn` and the other checkpoint questions (`b-round-244-checkpoint-request.md`, non-blocking).
- ROOT-RECON-MARKER-ENTER, SABA-B-11b stage 2b, SABA-B-10a/10b/9/11c, SABA-B-7 (`awaiting_user`), and the protected purchased route (SRW-21, `deferred_user`).

## 0. Baseline and scope

**Start state:**
- HEAD = `e9fb805e28e6679c08c6c64f96562b355d171bf7` (gate 244 `published`; gate 245 `skipped`; `b-round-245/head-at-planning.txt`).
- `git status --short --untracked-files=all` is **empty** (`b-round-245/git-status-at-planning.txt`, 0 bytes).
- **STOP (L11)** if HEAD differs or any path is dirty. One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-245-r246-tree-sha256.txt`, **1,104** files. That is every tracked file (1,110), minus the 2 tracked grants and the 4 root files.
- From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-245-r246-tree-sha256.txt` gave rc 0 at planning.
- Each of the 7 protected auth and purchase files appears exactly once (checked): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`.
- Also frozen:
  - `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `ArrangementTransport.tsx`, `ArrangementMarkerMenu.tsx` and `ArrangementGroupHeader.tsx`;
  - every other test file and every existing implementation doc;
  - `.claude/**`, `CLAUDE.md` and every config file.

**Root-owned, must equal HEAD:** `b-round-245-r246-root-files.txt` lists `package.json`, `package-lock.json`, `vite.config.ts` and `vitest.config.ts`. Their start hashes are in `b-round-245-r246-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants (`b-round-245-r246-grants.txt`; start hashes in `b-round-245-r246-grants-start-sha256.txt`; new file in `b-round-245-r246-new-files.txt`)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementMarkerRow.tsx` | Exactly the hunks of `b-round-245/precheck-scratch.diff` for this file, 34 added lines and nothing removed: <ul><li>A module function `focusSuccessorAfterRemoval(detached, markers)`, placed before `markerFlagMenuAnchor`. It walks the recorded `order` forward from the removed id to the first id still in `markers`, then backward. With neither it returns `MARKER_ADD_FOCUS`.</li><li>A ref `detachedFocusRef` (`{ markerId, order } \| null`).</li><li>**In the flag's ref callback, null branch:** before `flagRefs.current.delete`, if the stored node **is** `document.activeElement`, record `{ markerId: marker.id, order: markers.map(id) }`. Here `markers` is the closure of the render that is being replaced, so it holds the old time order.</li><li>A `useIsomorphicLayoutEffect` with no deps, placed before the existing `pendingFocusRef` effect. It reads and clears the ref. It returns when nothing was recorded or the id is still in `markers`; otherwise it calls `focusMarkerTarget(focusSuccessorAfterRemoval(…))`.</li></ul> Nothing else changes: `removeMarker`, `settleEditor`, the menus, the drag code, the status texts and every commit stay byte-identical. |
| 2 | `app/lib/arrangement/__tests__/markers-ui.test.tsx` | Exactly the test part of the same diff: <ul><li>a helper `pressCtrlKey(key: 'z' \| 'y', target = document.body, { shiftKey })`, placed before `addNamedMarker`;</li><li>**MU18–MU23** appended after MU9, at the end of the describe `marker row: rename and delete` (§2.2).</li></ul> Every other line stays byte-identical. |
| 3 | `docs/implementation/2026/quarter-IV/189-marker-undo-focus.md` | **New** implementation doc (§2.3). 189 is the next free number; 188 is the last. |

- **The applied diff:** `b-round-245/precheck-scratch.diff` (204 lines, 2 files), made against HEAD `e9fb805`. `git apply --check -p1` on the clean store tree gives rc 0. **A may apply it as is**, then write grant 3.
- **Read before editing:**
  - `AUDIO_ARCHITECTURE.md` (a Studio file; no audio change);
  - `AGENT_DISCOVERABLE_CODE.md`: one new module function, `focusSuccessorAfterRemoval`, named after the existing `focusMarkerTarget`, and one ref, `detachedFocusRef`;
  - `FORWARDREF_COMPONENT.md` (the marker row is a `forwardRef`; its handle does not change);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`;
  - `.claude/prompts/studio-feature.md`.

### 0.2 B's pre-check (L23, done)
B extracted HEAD to `/tmp/b246-scratch` with `git archive` (outside the repo, `node_modules` symlinked) and applied the change there.
- **Static checks:** `npx tsc --noEmit` rc 0. `npx biome check` on both files: "No fixes applied".
- **Covering set** (`b-round-245/covering.txt`): **58 files, 1,115/1,115 green**, in 82 s (`b-round-245/covering.log`). It is every `app/**` test file that matches `grep -rlE "arrangement-marker|ArrangementMarkerRow|Add Marker|Delete Marker|Move Marker|key: 'z'|key: 'y'|\.undo\(\)|\.redo\(\)"`. No row was red, so no frozen test needs a grant.
- **Red proofs.** All run on `markers-ui.test.tsx`, 31 tests (25 existing + 6 new), on the final scratch copy. Script: `b-round-245/mutants/run-mutants.sh <scratch> <logdir>`, which B ran twice with the same result. Logs are in `b-round-245/mutants/`.

| Run | Change | Red rows |
|---|---|---|
| FIX-CONTROL | none | none (31/31) |
| MU-HEAD | the `e9fb805` `ArrangementMarkerRow.tsx` with the new tests | **MU18, MU19, MU20, MU23** |
| MU-ALWAYS-ADD | the successor is always `MARKER_ADD_FOCUS` | **MU19, MU20, MU23** |
| MU-PREVIOUS-FIRST | try the previous flag before the next one | **MU19, MU20, MU23** |
| MU-STEAL | record every detached flag, focused or not | **MU19, MU20, MU23** (the last detach overwrites the record) |
| MU-NO-ID-CHECK | drop the "id still in `markers`" return | **MU4, MU7, MU8, MU8e, MU17, MU20, MU21, MU22** (every re-render moves focus) |
| MU-NEXT-NOT-SURVIVOR | take `order[index + 1]` even when it was removed too | **MU23** |
| MU-BODY-BASED | the plausible wrong design: a rescue on "activeElement is BODY and some id disappeared", with no focus record | **MU21** (it steals focus that the user had left on BODY) |

- **Timeouts (L31):** `markers-ui.test.tsx` has 15 s per test (a describe option). Gate 244's `verify.log` shows 25 tests in 6.0 s. B's loaded covering run shows 31 tests in 4.7 s. No test is near 50 %.

### 0.3 Recipes, signals and origins (L29, L47, L50)
**Environment facts (D-29z408, INFO-B246-CHROMIUM-BLUR-ON-REMOVAL).** These decided the design:

| Fact | Evidence |
|---|---|
| Chromium 143 fires `blur` and `focusout` when a focused element is removed. `activeElement` becomes BODY. | `b-round-245/chromium-removal.cjs` printed `focused=true \| blur \| focusout \| sync active=BODY` |
| jsdom fires neither event on removal. `activeElement` also becomes BODY. React 18 calls the removed element's ref with `null` while it is **still** `activeElement`. | `b-round-245/jsdom-removal-probe.test.tsx` printed `ref:set \| focused=true \| ref:null active=BUTTON \| after: active=BODY connected=false` |
| A rescue keyed on `onBlur` would therefore pass in jsdom and fail in Chromium. The fix records focus at the ref detach instead. **Inference, not printed:** that React detaches the ref before removal in Chromium too is inferred from the scratch probe landing on the successor at both viewports; the order was printed only in jsdom. | The scratch browser probe below |

**Browser probe** (`b-round-245/undo-origins-probe-246.cjs`). Each case uses a fresh context at 1440×900 and 1280×720 and waits for `Demo collection ready`. HEAD was measured on `:5173` (`shots/undo-origins-head.json`) and the scratch fix on `:5174` (`shots/undo-origins-scratch.json`, plus `undo-origins-scratch-addUndo1440.json`).

| Case and recipe | HEAD `e9fb805` (both viewports) | Scratch fix (both viewports) |
|---|---|---|
| **addUndo:** focus BODY, `M`, `Enter` (focus on the new flag), `Ctrl+Z` | flags 1 → 0; **BODY**; status `Undo: Add Marker` | flags 1 → 0; **`arrangement-marker-add`**, `:focus-visible` true, brass `solid 1px` at 0.8; same status |
| **addUndoNeighbour:** `M`, `Enter`, `ArrowRight` (Marker 1 moves to 00:00.100), `M`, `Enter` (Marker 2 at 0, focused), `Ctrl+Z` | Marker 2 removed; **BODY** | **Marker 1 — 00:00.100**, `:focus-visible` true, brass 1px |
| **deleteRedo:** `M`, `Enter`, `Delete` (focus on Add marker), `Ctrl+Z` (flag back; focus stays on Add marker), focus the flag, `Ctrl+Shift+Z` | flag removed; **BODY**; status `Redo: Delete Marker` | **`arrangement-marker-add`**, `:focus-visible` true; same status |
| **moveUndo** (control): `M`, `Enter`, `ArrowRight`, `Ctrl+Z` | the flag at 00:00.000 keeps focus | the same |
| **addUndoThenRedo** (info, INFO-B246-REDO-ADD-NO-UNMOUNT): `M`, `Enter`, `Ctrl+Z`, `Ctrl+Shift+Z` | BODY → BODY | Add marker → Add marker (Redo unmounts nothing) |
| **groupUndo / ungroupRedo** (out of scope, B-R245-UNDO-GROUP-FOCUS): select tracks 2 and 3, `Ctrl+G`, focus `arrangement-group-name`, `Ctrl+Z` (or `Ctrl+Shift+G`, `Ctrl+Z`, focus the name, `Ctrl+Shift+Z`) | 1 → 0 groups; **BODY** | **BODY** (unchanged, not this round) |

- There were 0 page errors.
- **Invalid attempt:** the scratch `addUndo@1440` row timed out once at 120 s on a cold Vite start. It is kept as `shots/undo-origins-scratch-attempt1.json` and was re-run.
- The scratch server on `:5174` is stopped; `:5173` still answers 200.
- **Clips are not focusable** (`[data-clip-id]` has `tabIndex -1` and no focusable child; `b-round-245/discover.cjs`), so clip Undo/Redo is outside L50 here.

**L50 enumeration (RT-FIX 246 regex).** It runs on the granted source file and on the callers, found by grep, of the actions that remove a flag.

`grep -nE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)' app/components/arrangement/ArrangementMarkerRow.tsx` → **12 hits** (`b-round-245/l50-markerrow.txt`). Callers: `grep -nE "undo\(\)|redo\(\)" StudioWorkspace.tsx ArrangementTransport.tsx` → **5 hits** (`l50-undo-callers.txt`). Each hit's ruling:

| Hit (line at HEAD) | What | Ruling and row |
|---|---|---|
| l.779 `{renderedMarkers.map(` | the flags; a removal unmounts the focused one | **This round's origin.** MU18–MU23; C-UNDO-ORIGINS-246 |
| l.184, l.196 `.focus(` in `focusMarkerTarget` and the `pendingFocusRef` effect | the focus mechanism the fix reuses | Covered by MU18–MU23 |
| l.207 `input.focus()` | editor open | Unchanged: MU1, MU7 |
| l.334 `restore.focus` | Escape in the add editor | Unchanged: MU2. Nothing is removed |
| l.490 `flag.focus` and l.798 `onPointerDown` | drag start | The flag stays mounted. `markers-move-ui` is in the covering set |
| l.607 `flag.focus` | the context menu opens | The flag stays mounted. The menu's Delete calls `removeMarker`, which focuses the neighbour **before** the commit, so the detach sees no focused flag. Row C-MENU-DELETE-246 |
| l.853 `{editor ? (`, l.870 `settleEditor(…)`, l.873 `onBlur` | the name editor | Not a flag. Round-244 successor path, unchanged: MU2, MU14, MU15, MU16; C-EDITOR-REG-246 |
| l.880 `{menu && menuMarker` | the menu portal | `closeMarkerMenu` refocuses `menu.markerId`, unchanged. C-MENU-DELETE-246 |
| `StudioWorkspace.tsx` l.2149, l.2151, l.2157 | `Ctrl+Shift+Z`, `Ctrl+Z`, `Ctrl+Y` | The three keys: MU18 (Z), MU20 (Shift+Z and Y); C-UNDO-ORIGINS-246 |
| `ArrangementTransport.tsx` l.171, l.187 | the Undo and Redo buttons | The focus is on the button, which stays mounted, so nothing focused is removed. Control row C-UNDO-BUTTON-246 |

- **Signals.** The flag is `[data-testid="arrangement-marker"]`, rendered once per marker. `arrangement-marker-add` is always rendered (l.737). The status line is `[data-testid="arrangement-status"]`.
- **Recipe facts:** `ArrowRight` on a focused flag moves the marker by 0.1 s. `M` adds at the playhead (0 on a fresh load).

## 1. Ruling D-29z408: where focus goes when the focused flag disappears
- **The rule.** The focused flag can leave the marker list by any path (Undo of its add, Redo of its delete, Cut Time over it). Focus then goes to:
  1. the next flag in time order that still exists;
  2. otherwise, the previous flag that still exists;
  3. otherwise, the **Add marker** button.

  This is `removeMarker`'s own rule (MU8, MU8b), extended to skip neighbours that were removed in the same step.
- **Focus that was not on the removed flag is never moved.** That includes BODY, another flag and any other control (MU21, MU-BODY-BASED).
- A history step that keeps the flag id (Move, Rename) keeps focus on that flag (MU22).
- **Why not simpler:**
  - **A blur handler:** Chromium fires blur on removal, so the record would be cleared before it is used. jsdom does not, so the tests would pass while the browser fails (§0.3).
  - **"Focus is BODY after a removal":** this steals focus that the user had already left on BODY (MU-BODY-BASED).
  - **Doing it in `StudioWorkspace` around `undo()`:** Cut Time and any later removal path would be missed. `tech-lead` (RETRO 245) placed the fix in MarkerRow.
- **Status and history do not change.** The texts stay `Undo: Add Marker`, `Redo: Delete Marker` and the Cut Time message.
- **Why we missed it** (not a Saba issue; kept for the L50 experiment). The round-244 L47 rule listed press and blur origins, not history origins. L50 (RETRO 245) now asks for the callers of every removing action. That is how this planning found the group sibling.

## 2. Changes

### 2.1 Source (grant 1)
Exactly the diff, with no new dependency and no new export. The layout effect has no deps, like the existing `pendingFocusRef` effect, so it runs after every commit. It returns at once unless a focused flag was detached in that commit.

### 2.2 Rows (grant 2)
| Row | Case | Expected |
|---|---|---|
| MU18 | `M`, type `Hit`, `Enter` (the flag is focused); `Ctrl+Z` on the flag | 0 flags; `redoLabel` `Add Marker`; status `Undo: Add Marker`; focus on `arrangement-marker-add` |
| MU19 | THREE_MARKERS (12, 20, 40); `seekTo(30)`, add `Mid`, `Ctrl+Z`; then `seekTo(45)`, add `Tail`, `Ctrl+Z` | times back to 12/20/40 each time; focus on the **40** flag in both cases (the next one, then the previous one) |
| MU20 | THREE_MARKERS; focus 20, `Delete` (focus on 40); `Ctrl+Z` (20 back; focus stays on 40); focus 20, `Ctrl+Shift+Z`; then `Ctrl+Z`, focus 20, `Ctrl+Y` | after each Redo the times are 12/40, focus is on the 40 flag, and the status is `Redo: Delete Marker` (after Shift+Z) |
| MU21 | THREE_MARKERS + `Mid` at 30; focus the 12 flag, `Ctrl+Z`; `redo()`; blur to BODY; `Ctrl+Z` on body | focus stays on the 12 flag; then stays BODY (focus that was not on the removed flag is not moved) |
| MU22 | THREE_MARKERS; focus 20, `ArrowRight` (Move Marker); `Ctrl+Z` | the flag is back at 20.000 and keeps focus |
| MU23 | THREE_MARKERS; range 15–25 on music; focus 20; `Ctrl+Shift+X`; then `Ctrl+Z`; range 15–45; focus 20; `Ctrl+Shift+X` | 12/30 with focus on the 30 flag (the shifted 40); then 12 only, with focus on the 12 flag (both later flags were removed) |

### 2.3 Doc 189 (grant 3)
- Path: `docs/implementation/2026/quarter-IV/189-marker-undo-focus.md`.
- l.4 is exactly `**სტატუსი:** Completed (C round 246 PASS)` (L28).
- Its `## ` headings contain the seven TEMPLATE headings in order (L26): `## კონტექსტი` … `## TODO / შემდეგი ნაბიჯები`.
- **Content:**
  - the date and the changed project;
  - the context: B-R243-UNDO-MARKER-FOCUS and the three paths;
  - the approach:
    - the D-29z408 rule;
    - why the record is taken at the ref detach (the Chromium and jsdom facts of §0.3, keeping the measured fact and the Chromium inference apart);
    - the two rejected designs;
  - a small Mermaid sequence: `Ctrl+Z` → history restore → commit → the old ref callback gets `null` while the flag is still focused → record → removal (blur in Chromium) → layout effect → successor focus;
  - the changed files (a list, no code);
  - Problem → Solution for the Medium;
  - testing: MU18–MU23, the 8 mutants and the browser probe. Cite only rows that exist (grep the row ids);
  - TODO: B-R245-UNDO-GROUP-FOCUS (separate owner, next) and checkpoint question 4.

## 3. Reference
This is a bug-fix round (focus management), so the reference-first rule does not apply to the behaviour.
- The rule follows the general WAI-ARIA Authoring Practices advice: when the focused element is removed, move focus to a logical nearby element and do not leave it on the document. The same rule already holds for Delete in this Studio (MU8, MU8b).
- Ableton Live has no DOM focus model to compare. No Live parity is claimed.
- Nothing new becomes permanently visible (row C-BUDGET-246).

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start state (§0):** HEAD, empty status, and `sha256sum -c` on the frozen 1,104 list, the root list and the grant start list.
2. **Apply** `b-round-245/precheck-scratch.diff` (`git apply -p1`), then write grant 3.
3. **Static checks:** `npm run typecheck` rc 0; `npx biome check` on grants 1–2 clean; `npm run lint` rc 0.
4. **Covering set:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-245/covering.txt)`. Expect 58 files, all green (1,115). If any test is above 50 % of its timeout, write a STOP at the top of the report, with its declared timeout, A's time and the gate time (L11).
5. **Mutants:** make a scratch copy outside `store/` (`git archive` of the fixed tree, `node_modules` symlinked) and run `b-round-245/mutants/run-mutants.sh` there. Run MU-HEAD by hand: in the scratch copy, replace the file with the output of `git show e9fb805:app/components/arrangement/ArrangementMarkerRow.tsx` (run from `store/`; the scratch has no `.git`), then run the same test file. Expect exactly the red rows of §0.2. The repo `git status` must be identical before and after.
6. **code-reviewer:** run it on the diff. Pass its Architecture note to B.
7. **Playwright** against `:5173` at both viewports. Run a copy of `b-round-245/undo-origins-probe-246.cjs`; do not edit it in place. Expect the "Scratch fix" column of §0.3.
8. **Report:** write `a-round-246.md` with:
   - the hunks;
   - the tests run, with counts;
   - the mutants;
   - the reviewer result;
   - any STOP, at the top.

## 5. C: acceptance
Use real Chromium on `/studio-lab` at 1440×900 and 1280×720, with a fresh context per row. Wait for `Demo collection ready` first (L48).

| Row | What | Pass when |
|---|---|---|
| C-SCOPE-246 | HEAD, status, hashes | <ul><li>HEAD is `e9fb805`.</li><li>Status is exactly `M` on grants 1–2 and `??` on the doc 189 path, with nothing else.</li><li>`sha256sum -c` on `b-round-245-r246-tree-sha256.txt` (1,104) and on the root list gives rc 0.</li><li>The 7 protected files give `git diff --quiet HEAD` rc 0.</li><li>`git diff HEAD` of grants 1–2 equals `b-round-245/precheck-scratch.diff` hunk for hunk.</li></ul> |
| C-UNIT-246 | `b-round-245/covering.txt` (58 files) | All green, including MU18–MU23 and MU1–MU17. The full suite is a gate row. |
| C-MUT-246 | the 8 runs of §0.2, once each, on a scratch copy outside the repo | The red rows are as listed. The repo status is identical before and after. |
| C-UNDO-ORIGINS-246 | B-R243-UNDO-MARKER-FOCUS: B's recipes in §0.3 (addUndo, addUndoNeighbour, deleteRedo) or C's own equivalents, plus `Ctrl+Y` for one Redo | <ul><li>At both viewports, `document.activeElement` after the step is the successor of §1: Add marker, Marker 1 at 00:00.100, Add marker. It is never BODY.</li><li>`:focus-visible` matches and a brass outline is painted (≥ 1 px).</li><li>The marker count and the status text are as at HEAD.</li><li>Screenshots.</li></ul> |
| C-NO-STEAL-246 | Focus elsewhere is not moved | <ul><li>Add a marker. Then focus another flag, or Tab to the Add marker button, and press `Ctrl+Z`. Focus stays on that element.</li><li>With focus on BODY (click an empty non-focusable area first), press `Ctrl+Z`: focus stays BODY, as at HEAD. Nothing focused was removed.</li></ul> |
| C-KEEP-246 | Steps that keep the flag | **moveUndo** (§0.3): the flag keeps focus. Rename + `Ctrl+Z` (F2, type, Enter, `Ctrl+Z`): the renamed flag keeps focus (round-244 `renamedFlag` row). |
| C-CUTTIME-246 | MU23 in the browser | <ul><li>Two markers, one inside a time selection. Focus the inside flag and press `Ctrl+Shift+X`: focus goes to the next surviving flag, else the previous one.</li><li>The status keeps the `marker deleted` count.</li><li>B did not run this in the browser; it rests on MU23.</li></ul> |
| C-UNDO-BUTTON-246 | Toolbar Undo and Redo | Add a marker, then click **Undo** in the transport. The marker is removed and focus is on the Undo or Redo button (the existing hand-off), not BODY and not the Add marker button. Then click **Redo**. |
| C-MENU-DELETE-246 | The marker menu | Two markers. Open a flag's menu (right-click or the menu key) and choose Delete: focus is on the neighbouring flag, as at HEAD. Escape on an open menu returns focus to its flag. |
| C-EDITOR-REG-246 | Round 244 still holds | `M`, then right-click an empty lane, then Escape: focus is on the new flag (C-EDITOR-ORIGINS-244). Escape inside the add editor restores the origin. |
| C-GROUP-INFO-246 | Info only, not a pass criterion | Record `groupUndo` at HEAD and on the fix. BODY on both is the known B-R245-UNDO-GROUP-FOCUS. |
| C-BUDGET-246 | L39 | The persistent text lines outside the timeline match round 244: empty 85/69 and demo 101/85 at 1440/1280. |
| AN-REVIEW-246 | Doc 189 | <ul><li>l.4 is byte-exact.</li><li>The 7 headings are in order.</li><li>D-29z408, the ref-detach reason and the two rejected designs are explained.</li><li>Every cited row exists (MU18–MU23 and any other cited).</li><li>B-R245-UNDO-GROUP-FOCUS is in TODO.</li></ul> |
| **RT-FIX-246** | B's corrections of C-R245-01…03 (D-29z407). Re-check **only** the changed lines. | <ul><li>`diff b-round-245/lessons-before-246.md lessons.md` changes only the header line (l.3), L11, L12 and L50, and the file stays ≤ 60 lines (57).</li><li>**C-R245-01:** L11 contains "(a timeout included)", "not under \"For B/root\"" and "its declared timeout". L12 contains "a hit that pins classes in a frozen or protected file is a STOP (L11) with the hit list".</li><li>**C-R245-03:** L50's regex is valid under `grep -nE`. On `ArrangementMarkerRow.tsx` at `e9fb805` it gives 12 hits, including l.779 (`.map`), l.853 and l.880 (conditional renders). The rule names its root: the granted files plus the grep-found callers, not the whole folder.</li><li>**C-R245-02:** `diff b-round-245/retro-245-before-246.md retros/retro-245.md` changes only §12 lines 179–180. R49-T now has one concrete question and "ვადა: RETRO 260". GATE244-S4 has "ვადა: RETRO 260".</li></ul> |
| LAB-SMOKE-246 | `/studio-lab` | It loads. Space plays and pauses. After adding `demo-stem-pulse` (the round 237–245 recipe), the export WAV has sha256 `1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94`. 0 page errors. |
| Auth | Standing check | In a fresh context: <ul><li>`/studio-lab` opens anonymously, with `auth_user` null;</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and no `audio[src]`;</li><li>`/api/studio-token` with no header returns 401.</li></ul> |
| Purchased origin (browser) | Markers on the purchased copy | BLOCKED: backend unavailable in cloud. Grant 1 adds no origin branch. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

## 6. Neighbouring behaviour that could break (C probes these first)
- **Focus stealing on re-render.** The flag refs are inline, so React detaches and re-attaches every flag on every render. The "id still in `markers`" check makes that a no-op (MU22, MU-NO-ID-CHECK). Watch a drag, a rename and playback with a flag focused.
- **Delete and Backspace on a flag** (MU8, MU8b) already move focus before the commit. The detach then sees no focused flag, so the old path is unchanged.
- **The marker menu's Delete** and the round-244 editor successor (§5 rows).
- **Clip, Delete and arrow keys after a marker add** (MU8c–MU8f, C-R72-01): a press releases the flag first, so no focused flag is removed.
- Any change to the marker status texts or the history labels is a regression.

## 7. Outcomes for B's next planning
- **PASS and gate published:**
  - B-R243-UNDO-MARKER-FOCUS closes. C-R245-01…03 close, and `retro_runs` 245 becomes done.
  - **Next (D-29z410):** the **REGRESSION round**, at the first planning on or after 2026-10-30. It carries every `scope_additions` entry of REGRESSION-ROUND-2026-10-30, including the new C-UNDO-ORIGINS-246 (L6). If that planning is still on 2026-10-29, **B-R245-UNDO-GROUP-FOCUS** goes first.
  - Then B-R245-UNDO-GROUP-FOCUS, then **SABA-B-11b stage 2b**, then SABA-B-10a (with C-R235-02), 10b, 9 and 11c.
- **A product row FAILS:** a fix-up on the same grants first.
- **Only RT-FIX-246 FAILS:** B corrects the line at the next planning, and the next C round re-checks it. The product result stands.
- If Saba answers `AGREE-SABA-B-7.md`, SABA-B-7 is scheduled right after the running stage.
