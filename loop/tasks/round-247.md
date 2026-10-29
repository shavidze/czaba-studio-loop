# Round 247: UNDO-GROUP-FOCUS. When a history step removes the group row that holds focus, focus moves to the next surviving row's name button, else the previous one. It never falls to BODY.

**Planned by:** B, at the round 246 → 247 planning, 2026-10-29. **Decisions:** D-29z412…D-29z418.

**Type:** a bug-fix round with one Medium. The mechanism has one owner (`StudioWorkspace.tsx`), plus a 19-line reporting hook in the row that is removed (`ArrangementGroupHeader.tsx`).

| Id | Severity | Origin | One line |
|---|---|---|---|
| **B-R245-UNDO-GROUP-FOCUS** | Medium (pre-existing) | B round-246 planning probe; **re-measured at HEAD `869d767`** (§0.3) | Focus is on any control of a group row (name, fold, mute, volume). `Undo: Group Tracks` or `Redo: Ungroup Tracks` (Ctrl+Shift+Z or Ctrl+Y) removes the row, and focus ends on BODY. This includes the outer row of a nested group. Both viewports. |

**Why this round (D-29z414):**
- Round 246 passed C (`browserVerified: true`), and gate 246 published `869d767`.
- The outcome table of round 246 (§7, D-29z410) says: "if that planning is still on 2026-10-29, B-R245-UNDO-GROUP-FOCUS goes first". This planning is on 2026-10-29.
- **REGRESSION** (`regression-last.json`: 2026-10-27, round 199) is due at the first planning on or after 2026-10-30, so not now. **RETRO** is next due at round 260.

**Read first:** `lessons.md` in full. Directly relevant here:
- **L47** (name the focus target; BODY is never expected) and **L50** (origins by grep, §0.4);
- **L23** (B's pre-check, §0.2), **L29** (every recipe was run, §0.3), **L11** (STOP), **L31** (timeouts);
- **L49** (`ungroupSelectedTrackRows` keeps its own focus target, §1);
- **L26** and **L28** (doc 190).

**Not this round:**
- The marker-row Lows from round 246 (A-R246-REVIEW-L1, GATE246-S3, GATE246-S4) and INFO-C246-DRAG-RING. They are in `deferred_low_polish` (D-29z413).
- A shared focus-successor mechanism for markers and groups (gate 246 Architecture note). It is a checkpoint question, not scope (D-29z416).
- SABA-B-11b stage 2b, SABA-B-10a/10b/9/11c, SABA-B-7 (`awaiting_user`), ROOT-RECON-MARKER-ENTER, and the protected purchased route (SRW-21, `deferred_user`).

## 0. Baseline and scope

**Start state:**
- HEAD = `869d76732e4a4d8e0abe8476b7b403fc195a3a73` (gate 246 `published`; `b-round-246/head-at-planning.txt`).
- `git status --short --untracked-files=all` is **empty** (`b-round-246/git-status-at-planning.txt`, 0 bytes).
- **STOP (L11)** if HEAD differs or any path is dirty. One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-246-r247-tree-sha256.txt`, **1,104** files. That is every tracked file (1,111), minus the 3 granted files and the 4 root files.
- From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-246-r247-tree-sha256.txt` gave rc 0 at planning.
- Each of the 7 protected auth and purchase files appears exactly once (checked): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`.
- Also frozen:
  - `ArrangementContext.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementTransport.tsx`, `ArrangementLane.tsx` and `groups.ts`;
  - every other test file, including `track-groups-ui.test.tsx`;
  - every existing implementation doc;
  - `.claude/**`, `CLAUDE.md` and every config file.

**Root-owned, must equal HEAD:** `b-round-246-r247-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`), with start hashes in `b-round-246-r247-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants (`b-round-246-r247-grants.txt`; start hashes in `b-round-246-r247-grants-start-sha256.txt`; new file in `b-round-246-r247-new-files.txt`)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementGroupHeader.tsx` | Exactly the hunks of `b-round-246/precheck-scratch.diff` for this file: 19 lines added and 1 changed (`useCallback` joins the `react` import). <ul><li>A **required** prop, `onFocusedRowDetach: (groupId: string) => void`. The only caller is `StudioWorkspace` (grep).</li><li>A `rowNodeRef` and a memoised `attachRowNode` ref callback (`useCallback`, deps `[group.id, onFocusedRowDetach]`) on the root `data-testid="arrangement-group-row"` div.</li><li>**In the callback's null branch:** if the stored node `.contains(document.activeElement)`, call `onFocusedRowDetach(group.id)`.</li></ul> Nothing else changes: the editor, the fold, mute, solo and volume controls, the overview, every string and every class stay byte-identical. |
| 2 | `app/components/arrangement/StudioWorkspace.tsx` | Exactly the hunks of the same diff, 42 added lines and nothing removed: <ul><li>A module function `focusRowSuccessor(container, removedId, order)`, placed before `libraryRailExpandButton`. It walks `order` forward from the removed id, then backward, and focuses the first `trackRowNameButton` that is rendered.</li><li>Two refs: `committedTrackRowsRef` (starts as `allTrackRows`) and `detachedRowFocusRef` (`{ rowId, order } \| null`).</li><li>A no-deps `useIsomorphicLayoutEffect` placed **before** the existing `pendingRowFocusRef` effect. It reads and clears the record. It returns when there is no record, when `pendingRowFocusRef.current !== null`, or when the row id is still in `trackRowsRef.current`. Otherwise it calls `focusRowSuccessor`.</li><li>A no-deps layout effect **after** the `pendingRowFocusRef` effect: `committedTrackRowsRef.current = allTrackRows`.</li><li>`recordFocusedRowDetach` (`useCallback`, no deps) stores `{ rowId, order: committedTrackRowsRef.current.map(id) }`, and is passed as `onFocusedRowDetach`.</li></ul> `groupSelectedTrackRows`, `ungroupSelectedTrackRows`, `setTrackGroupsCollapsed`, `closeGridMenu`, the key handler, the status texts and the history labels stay byte-identical. |
| 3 | `app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx` | Exactly the test part of the same diff, appended at the end of the file: <ul><li>the helpers `pressHistoryKey`, `groupStemsAndSfxFromKeys`, `groupRowControl` and `groupRowCount`;</li><li>a new describe, `B-R245 a history step that removes the focused group row`, with `{ timeout: 20_000 }` and rows **GF1–GF7** (§2.2).</li></ul> Every existing line stays byte-identical. |
| 4 | `docs/implementation/2026/quarter-IV/190-group-undo-focus.md` | **New** implementation doc (§2.3). 190 is the next free number; 189 is the last (`ls`). |

- **The applied diff:** `b-round-246/precheck-scratch.diff`, which covers 3 files, against HEAD `869d767`. `git apply --check -p1` on the clean store tree gives rc 0. **A may apply it as is**, then write grant 4.
- **Read before editing:**
  - `AUDIO_ARCHITECTURE.md` (Studio files; no audio change);
  - `AGENT_DISCOVERABLE_CODE.md`: one new module function, `focusRowSuccessor`, named after `trackRowNameButton`; one new prop, `onFocusedRowDetach`; the refs `committedTrackRowsRef` and `detachedRowFocusRef`;
  - `REACT_CONTEXT.md` (no context change; the prop is a plain callback);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`;
  - `.claude/prompts/studio-feature.md`.

### 0.2 B's pre-check (L23, done)
B extracted HEAD to `/tmp/b247-scratch` with `git archive` (outside the repo) and applied the change there.
- **Static checks:** `npx tsc --noEmit` gave no output (rc 0). `npx biome check` on the 3 files: "No fixes applied".
- **Covering set** (`b-round-246/covering.txt`): **96 files, 1,492/1,492 green** in 161 s (`b-round-246/covering.log`). It is every `app/**` test file that matches `grep -rlE "StudioWorkspace|ArrangementGroupHeader|arrangement-group-|Group Tracks|Ungroup Tracks"`. That includes the source-scan tests that read `ArrangementGroupHeader.tsx`: `studio-focus-ring`, `affordance-colour-ui`, `mixer-onstate-colour-ui`, `strings`, `fader-pointer-preview` and `studio-theme-obsidian`. The list is the same on HEAD. No row was red, so no frozen test needs a grant.
- **Timeouts (L31):** `track-group-collapse-ui.test.tsx` has a 20 s describe timeout.
  - In the solo verbose run, the slowest test was UC1 at 1.28 s and the slowest new row was GF5 at 0.98 s.
  - Gate 246's `verify.log` shows 23 tests in 23.8 s for the file. B's loaded covering run shows 30 tests in 35.4 s, which is about 1.2 s per test on average.
  - No test is near 50 %.
- **Red proofs.** All run on `track-group-collapse-ui.test.tsx`, 30 tests (23 existing + 7 new). Script: `b-round-246/mutants/run-mutants.sh <scratch> <logdir>`, with mutants in `mutate.py`. MU-HEAD was run by hand. Logs are in `b-round-246/mutants/logs/`. The mutants ran on a second copy, `/tmp/b247-mut`, so the browser probe's server never saw them.

| Run | Change | Red rows |
|---|---|---|
| FIX-CONTROL | none | none (30/30) |
| MU-HEAD | both source files from `869d767`, with the new tests | **GF1, GF2, GF3, GF4, GF5** |
| MU-PREVIOUS-FIRST | try the previous row before the next one | **GF1–GF5** (focus goes to the row above the group) |
| MU-NO-CONTAINS | record every detached group row, focused or not | **GF5, GF6** (focus elsewhere is stolen) |
| MU-NAME-ONLY | record only when the focused element is a group name button | **GF3, GF5** (fold, mute and volume are missed; another group's name is mistaken for this row) |
| MU-VISIBLE-ORDER | take the order from the visible rows (`trackRows`) | **GF4** (a folded group's hidden members are skipped) |
| MU-RENDER-ORDER | read the order from `trackRowsRef.current` at detach time; that is the new render, which no longer holds the row | **GF1–GF5** |
| MU-PRECEDENCE-INVERTED | the rescue ignores `pendingRowFocusRef` and runs after it | **GF7** |
| MU-BODY-BASED | also record when focus is already BODY | **GF6** (it steals the user's BODY) |

### 0.3 Recipes and measurements (L29, L47)
**Browser probe** (`b-round-246/group-origins-probe-247.cjs <base> <out.json> [shotDir]`). Every case uses a fresh context, waits for `Demo collection ready`, and builds its group the same way: click the 2nd track name (Music), Ctrl+click the 3rd (Stems), then `Ctrl+G`. Track 1 is Video, which cannot be grouped.
- HEAD was measured on `:5173`, at both viewports unless noted: `head-1440.json`, `head-1280.json` (18 rows, 0 errors), `head-1440-extra.json` + `head-1280-extra.json` (groupUndoNatural, ungroupPrecedence, volumeStepUndo), `head-tab.json` and `head-vol-collapse.json`. `head-vol-menu.json` (gridMenuUndo) is 1440 only.
- The scratch fix was measured on `:5174`: `scratch.json`, `scratch-tab.json` and `scratch-groupUndo1440.json`.

| Case | HEAD `869d767` (both viewports) | Scratch fix (both viewports) |
|---|---|---|
| **groupUndo / groupUndoNatural:** group name focused (by `.focus()` or by the focus follow of `Ctrl+G`), `Ctrl+Z` | 1 → 0 groups; **BODY**; status `Undo: Group Tracks` | **Music** name button (`Music — set as the active track`); same status |
| **groupUndoTab:** focus the fold, `Tab` to the name (`:focus-visible` true), `Ctrl+Z` | **BODY** | **Music**, `:focus-visible` true, outline `solid 1px color(srgb 0.788235 0.643137 0.415686 / 0.8)` |
| **ungroupRedo:** `Ctrl+Shift+G`, `Ctrl+Z`, focus the name, `Ctrl+Shift+Z` | **BODY**; `Redo: Ungroup Tracks` | **Music** |
| **groupUndoY:** the same, with `Ctrl+Y` | **BODY** | **Music** |
| **foldFocusUndo / muteFocusUndo / volumeFocusUndo** | **BODY** | **Music** |
| **collapsedUndo:** fold the group, focus the name, `Ctrl+Z` | **BODY** | **Music** (the member is shown again) |
| **nestedOuterUndo:** Group 1 (Music, Stems); then Ctrl+click SFX and `Ctrl+G`, which makes Group 2 = (Group 1, SFX); focus the Group 2 name, `Ctrl+Z` | 2 → 1 groups; **BODY** | the **Group 1** name |
| **nestedInnerUndo** (control): the Group 1 name focused, `Ctrl+Z` removes Group 2 | Group 1 keeps focus | the same |
| **ungroupPrecedence** (control): Group 2 and Group 1 both selected, focus on Group 1, `Ctrl+Shift+G` | **Music** (`childIds[0]`) | **Music** (the explicit ungroup target wins) |
| memberFocusUndo, ungroupUndo, groupRedoMember, renameUndo (controls) | the focused track name, or the group name after a rename, keeps focus | the same |
| noStealOtherTrack (Video focused), noStealBody (status-line click, then `Ctrl+Z`) | focus stays on Video / BODY | the same |
| transportUndo: click the toolbar Undo | focus on "Redo: Group Tracks" | the same |
| nonAdjacentRefused: Music, then Ctrl+click SFX, then `Ctrl+G` | refused: "Only adjacent tracks can be grouped together…". Track rows never move | the same |
| **volumeStepDownUndo** (HEAD only): group volume focused, `ArrowDown` ×2, `Ctrl+Z` ×2 | the value goes +0.0 → −0.2 dB (title `Volume −0.2 dB`). Each step is its own history entry: the first `Ctrl+Z` gives status `Undo: Volume` and value −0.1. After both, the row is still there and the fader keeps focus with the ring. A third `Ctrl+Z` would be `Undo: Group Tracks` | not measured (no change expected before the third `Ctrl+Z`) |
| **collapseFocusReg** (HEAD only): click the group name (select), focus the Music name, press `U` | the group folds (rows video, Group 1, sfx); focus on the group name, `:focus-visible` true, brass 1 px | not measured (`setTrackGroupsCollapsed` unchanged) |

- 0 page errors on every row except one. The scratch `groupUndo@1440` row's first attempt logged `Cannot read properties of null (reading 'useState')` while Vite was optimising dependencies on a cold start (the server log shows 4 re-optimisations). It is kept as `scratch-attempt1.json` and was re-run once with 0 errors (`scratch-groupUndo1440.json`).
- **Harness fact (INFO-B247-MODIFIER-NO-FOCUS-VISIBLE).** When the previous focus came from a mouse click, Chromium does not treat a `Ctrl`+key chord as keyboard modality. The rescued button then has `:focus-visible` false and no ring, at HEAD and on the fix. This follows the SABA-B-4 rule (the ring shows only on keyboard `:focus-visible`). So C's ring rows reach the group by `Tab` first (groupUndoTab).
- **Not reproduced (A-R246-REVIEW-INFO1, closed as info).** `markerMenuUndo`: add a flag, right-click it (focus on the menu's "Rename (F2)"), `Ctrl+Z`. Nothing is undone: the marker count stays 1 and the status is unchanged. The open menu does not pass `Ctrl+Z` on, so no focused element is removed.
- **Signals.** A group row is `[data-testid="arrangement-group-row"][data-group-id]`. The name button is `arrangement-group-name`; the fold, mute and volume controls are `arrangement-group-fold`, `-mute` and `-volume`. A track name button is `[data-testid="arrangement-track-header"] button[aria-label*="— set as the active track"]` (`trackRowNameButton`, l.345). The status line is `[data-testid="arrangement-status"]`.
- **Tracks are never added, deleted or moved by history.** The only history labels are Add, Move and Rename Marker, Group Tracks, Rename Group and Ungroup Tracks (grep of `commitArrangement(…, '<label>'`). Lane rows are keyed by track id. So a group row is the only row that a history step can remove.

### 0.4 L50 enumeration
The regex runs on the two granted source files and on the callers of `undo()`/`redo()`, found by grep:

`grep -nE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)'`
- `ArrangementGroupHeader.tsx`: **10 hits** (`b-round-246/l50-groupheader.txt`).
- `StudioWorkspace.tsx`: **19 hits** (`l50-studioworkspace.txt`).

Callers: `grep -nE "undo\(\)|redo\(\)" StudioWorkspace.tsx ArrangementTransport.tsx` gives **5 hits** (`l50-undo-callers.txt`).

| Hit (line at HEAD) | What | Ruling and row |
|---|---|---|
| SW l.2837 `{trackRows.map(` | the rows; Undo or Redo unmounts a focused group row | **This round's origin.** GF1–GF6; C-GROUP-ORIGINS-247 |
| SW l.914 `trackRowNameButton(…).focus` | the `pendingRowFocusRef` effect (Ctrl+G, Ctrl+Shift+G, collapse) | Unchanged. It wins over the rescue: GF7, UC9, UC4 F3, C-PRECEDENCE-247 |
| SW l.1631, l.1638 `closeGridMenu` | grid-menu focus return, with its existing group fallback | Unchanged. **Unverified** whether history keys reach the workspace while the grid menu is open: B's recipe did not open it. The marker menu does trap `Ctrl+Z` (§0.3), which is only an analogy. C probes it as info (§6); a removal with focus in the menu would be a new finding, not this round's |
| SW l.449 `focusPastHiddenOverview`, l.925 library rail rescue | Overview and library | Not rows. Unchanged (CALM-3 rows) |
| SW l.2545, l.2617 `onPointerDownCapture` | a press releases typing or range focus | Nothing is removed. Unchanged |
| SW l.2712, 2769, 2817, 2880, 2926, 2935, 2945, 2951, 2956, 2964, 3012 | conditional toolbar, loop, marquee, range and drag-hint renders, and the grid-menu portal | Not removed by Group or Ungroup history. The `{tempoBpm !== null ? (` optgroup is inside a `<select>`; the select stays mounted. Out of scope for this bug class |
| GH l.151, l.157 `.focus` | the name editor opens / restores | Unchanged (TG6) |
| GH l.245 `{isEditing ? (`, l.256 `settleEditor`, l.259 `onBlur` | the rename editor | The editor input is a typing target, so `Ctrl+Z` there is ignored (`isTypingTarget`, SW l.2030). The toolbar Undo press blurs and settles the editor first. C-KEEP-247 (rename) |
| GH l.337 `onPointerDown` (volume fader drag) | the row stays mounted | Unchanged (fader tests in the covering set) |
| GH l.349 `onBlur={() => blurGroupVolume(group.id)}` | Chromium fires blur when the focused fader is removed, so `blurVolumeTarget` runs for a group that no longer exists | Pre-existing and unchanged. At HEAD, volumeFocusUndo and volumeStepUndo show 0 page errors. Row C-VOLUME-REMOVAL-247 checks that history and groups match HEAD |
| GH l.239, l.354, l.361 | the chevron icon, overview vs lanes, overview blocks | Not focusable controls. Unchanged |
| SW l.2149, l.2151, l.2157 | `Ctrl+Shift+Z`, `Ctrl+Z`, `Ctrl+Y` | GF1 (Z), GF2 (Shift+Z and Y); C-GROUP-ORIGINS-247 |
| `ArrangementTransport.tsx` l.171, l.187 | the Undo and Redo buttons | Focus is on the button, which stays mounted. Control row C-UNDO-BUTTON-247 |

## 1. Ruling D-29z415: where focus goes when the focused group row disappears
- **The rule.** Focus can be anywhere inside a group row: the name, fold, mute, solo or volume control. When a history step removes that row (Undo: Group Tracks, or Redo: Ungroup Tracks), focus goes to:
  1. the **next** row after it, in the previous commit's full row order, whose name button is rendered;
  2. otherwise, the previous such row.
- **"Full row order"** includes the members of a folded group, because Undo shows them again. In practice the next row is the group's first former member: the first track, or the inner group's name for a nested group. It matches the existing Ctrl+Shift+G rule ("focus lands on the first child", UC9).
- **The explicit focus request wins.** `ungroupSelectedTrackRows` also removes the focused row in the same commit, and it already names a target: the first child of the whole selection, `childIds[0]`. Its `pendingRowFocusRef` request stays in charge. The rescue yields when that ref is set (GF7). This is the gate-246 S2 question for this owner, now ruled. Per L49, `ungroupSelectedTrackRows` itself is untouched, so its side effects (selection, status, history) stay.
- **Focus that was not inside the removed row is never moved.** That covers BODY, another track, a member track of the group, and the toolbar (GF6, MU-NO-CONTAINS, MU-BODY-BASED).
- **Why this design:**
  - **The record is taken at the row's ref detach.** Chromium fires blur on removal, so blur cannot be the signal (INFO-B246-CHROMIUM-BLUR-ON-REMOVAL). That React detaches a deleted host's ref before removing its node was printed in jsdom in round 246 (`b-round-245/jsdom-removal-probe.test.tsx`). For Chromium it is **inferred**, not printed: the scratch fix lands on the successor at both viewports (§0.3), and GF1–GF7 pass in jsdom. Here the ref is on the row root, so `contains(activeElement)` covers every control in the row.
  - **The order is the last committed row list.** During render, `trackRowsRef.current` is already the new list, which no longer holds the row (MU-RENDER-ORDER). It is also the full list, not the visible one (MU-VISIBLE-ORDER).
  - **Not "around `undo()`" in the key handler.** The ref-detach record also covers any later path that removes a group row. It is the same per-owner pattern as round 246, and it keeps row-focus knowledge next to `pendingRowFocusRef`, where it already lives.
  - **A shared mechanism** for flags and rows is a fair idea from gate 246's reviewer. It is recorded as an architecture signal and as checkpoint question 4 (D-29z416), not built here.
- **Status, history and audio do not change.** The labels stay `Undo: Group Tracks` and `Redo: Ungroup Tracks`, and the selection is unchanged.
- **Why we missed it:** this is not a Saba issue. The round-244 L47 origins listed press and blur, not history. L50 (RETRO 245) found this bug at the round-246 planning.

## 2. Changes

### 2.1 Source (grants 1–2)
Exactly the diff, with no new dependency and no new export. Both new layout effects have no deps, like the existing `pendingRowFocusRef` effect, so they run after every `StudioWorkspace` commit. The rescue returns at once unless a focused group row was detached in that commit. Because `attachRowNode` is memoised, React calls it with `null` only when the row unmounts.

### 2.2 Rows (grant 3)
| Row | Case | Expected |
|---|---|---|
| GF1 | Stems and SFX grouped from the keys (focus follows to `Group 1`); `Ctrl+Z` on the group name | 0 group rows; `redoLabel` `Group Tracks`; status `Undo: Group Tracks`; focus on the Stems name button |
| GF2 | `Ctrl+Shift+G` (focus on Stems), `Ctrl+Z` (group back, Stems keeps focus); focus the group name, `Ctrl+Shift+Z`; then `Ctrl+Z`, focus the group name, `Ctrl+Y` | after each Redo: 0 group rows, focus on Stems, status `Redo: Ungroup Tracks`; `undoLabel` `Ungroup Tracks` |
| GF3 | the fold, mute and volume controls in turn: focus, `Ctrl+Z`, then `Ctrl+Y` from Stems | focus on Stems each time; the group comes back after each Redo |
| GF4 | fold the group, focus its name, `Ctrl+Z` | lanes video/music/stems/sfx; focus on Stems |
| GF5 | Group 2 = (Music, Group 1); `Ctrl+Z` on Group 2; then `Ctrl+Y`, focus Group 1, `Ctrl+Z` | the row order is video, music, Group 1, stems, sfx, with focus on Music; then 1 group row and Group 1 keeps focus |
| GF6 | focus Video, `Ctrl+Z`; Redo; focus SFX (a member), `Ctrl+Z`; Redo; focus the group name, blur to BODY, `Ctrl+Z` | focus stays on Video; then on SFX; then BODY |
| GF7 | Group 2 and Group 1 both selected, focus on Group 1, `Ctrl+Shift+G` | 0 group rows; focus on Music (`childIds[0]`), not Stems |

### 2.3 Doc 190 (grant 4)
- Path: `docs/implementation/2026/quarter-IV/190-group-undo-focus.md`.
- l.4 is exactly `**სტატუსი:** Completed (C round 247 PASS)` (L28).
- Its `## ` headings contain the seven TEMPLATE headings in order (L26): `## კონტექსტი` … `## TODO / შემდეგი ნაბიჯები`.
- **Content:**
  - the date and the changed project;
  - the context: B-R245-UNDO-GROUP-FOCUS, its two history paths and the four controls;
  - the approach:
    - the D-29z415 rule and the precedence of `pendingRowFocusRef`;
    - why the record is taken at the row-root ref detach and why the order is the last committed full list (MU-RENDER-ORDER, MU-VISIBLE-ORDER), keeping measured facts apart from inference;
    - the rejected designs: blur, "focus is BODY", and the key handler around `undo()`;
  - a small Mermaid sequence: `Ctrl+Z` → history restore → commit → the row ref gets `null` while it still contains focus → record (old order) → removal (blur in Chromium) → rescue layout effect (yields to `pendingRowFocusRef`) → successor name button;
  - the changed files (a list, no code);
  - Problem → Solution for the Medium;
  - testing: GF1–GF7, the 9 mutant runs and the browser probe. Cite only rows that exist (grep the row ids);
  - TODO:
    - the shared focus-successor checkpoint question (D-29z416);
    - the `blurGroupVolume` on removal note (C-VOLUME-REMOVAL-247).

## 3. Reference
This is a bug-fix round (focus management), so the reference-first rule does not apply to the behaviour.
- The rule follows WAI-ARIA Authoring Practices: when the focused element is removed, move focus to a logical nearby element, not to the document. Studio already does this for Ctrl+Shift+G (UC9) and for marker flags (round 246).
- Ableton Live has no DOM focus model to compare, so no Live parity is claimed.
- Nothing new becomes permanently visible (row C-BUDGET-247).

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start state (§0):** HEAD, empty status, and `sha256sum -c` on the frozen 1,104 list, the root list and the grant start list.
2. **Apply** `b-round-246/precheck-scratch.diff` (`git apply -p1`), then write grant 4.
3. **Static checks:** `npm run typecheck` rc 0; `npx biome check` on grants 1–3 clean; `npm run lint` rc 0.
4. **Covering set:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-246/covering.txt)`. Expect 96 files, all green (1,492). Any test above 50 % of its timeout is a STOP at the top of the report, with its declared timeout, A's time and the gate time (L11).
5. **Mutants:** make a scratch copy outside `store/` (`git archive` of the fixed tree, `node_modules` symlinked) and run `b-round-246/mutants/run-mutants.sh <scratch> <logdir>`. For MU-HEAD, use `git show 869d767:<file>` for both source files, run from `store/`, then run the same test file. Expect exactly the red rows of §0.2. The repo `git status` must be identical before and after.
6. **code-reviewer:** run it on the diff (3+ files). Pass its Architecture note to B.
7. **Playwright** against `:5173` at both viewports. Run a copy of `b-round-246/group-origins-probe-247.cjs`; do not edit it in place. Expect the "Scratch fix" column of §0.3.
8. **Report:** write `a-round-247.md` with:
   - the hunks;
   - the tests run, with counts;
   - the mutants;
   - the reviewer result;
   - any STOP, at the top.

## 5. C: acceptance
Use real Chromium on `/studio-lab` at 1440×900 and 1280×720, with a fresh context per row. Wait for `Demo collection ready` first (L48).

| Row | What | Pass when |
|---|---|---|
| C-SCOPE-247 | HEAD, status, hashes | <ul><li>HEAD is `869d767`.</li><li>Status is exactly `M` on grants 1–3 and `??` on the doc 190 path, with nothing else.</li><li>`sha256sum -c` on `b-round-246-r247-tree-sha256.txt` (1,104) and on the root list gives rc 0.</li><li>The 7 protected files give `git diff --quiet HEAD` rc 0.</li><li>`git diff HEAD` of grants 1–3 equals `b-round-246/precheck-scratch.diff` hunk for hunk.</li></ul> |
| C-UNIT-247 | `b-round-246/covering.txt` (96 files) | All green, including GF1–GF7. The full suite is a gate row. |
| C-MUT-247 | the 9 runs of §0.2, once each, on a scratch copy outside the repo | The red rows are as listed. The repo status is identical before and after. |
| C-GROUP-ORIGINS-247 | The bug: groupUndo, groupUndoTab (focus the fold, then press `Tab` to reach the name, so that modality is keyboard; never `.focus()` on the name), ungroupRedo, groupUndoY, foldFocusUndo, muteFocusUndo, volumeFocusUndo, collapsedUndo and nestedOuterUndo (§0.3 recipes, or C's own equivalents) | <ul><li>At both viewports, `document.activeElement` after the step is the successor of §1: the Music name button (the Group 1 name for nestedOuterUndo). It is never BODY.</li><li>In groupUndoTab, `:focus-visible` matches and a brass outline is painted (≥ 1 px).</li><li>The group count and the status text are as at HEAD.</li><li>Screenshots.</li></ul> |
| C-PRECEDENCE-247 | ungroupPrecedence, plus a plain `Ctrl+Shift+G` with the group name focused | Focus on Music (`childIds[0]`), as at HEAD (UC9). |
| C-NO-STEAL-247 | Focus elsewhere is not moved | <ul><li>Video name focused, `Ctrl+Z`: focus stays on Video.</li><li>A member track focused (memberFocusUndo): it stays.</li><li>BODY (status-line click), `Ctrl+Z`: it stays BODY.</li><li>All as at HEAD.</li></ul> |
| C-KEEP-247 | Steps that keep the row | <ul><li>nestedInnerUndo: Group 1 keeps focus.</li><li>ungroupUndo and groupRedoMember: the track keeps focus.</li><li>renameUndo (F2, type, Enter, `Ctrl+Z`): the group name keeps focus and the old name is back.</li></ul> |
| C-UNDO-BUTTON-247 | The toolbar Undo and Redo | After grouping, click **Undo**: 0 groups, and focus is on the Redo button "Redo: Group Tracks", as at HEAD. Then click **Redo**. |
| C-VOLUME-REMOVAL-247 | GH l.349 neighbour | Focus the group volume and press `ArrowDown` twice (B at HEAD: −0.2 dB, two `Volume` entries). Then press `Ctrl+Z` three times. <ul><li>After the 1st and 2nd: status `Undo: Volume`, the row stays, and the fader keeps focus. These equal HEAD.</li><li>After the 3rd: `Undo: Group Tracks`, 0 groups, and focus on the Music name button (HEAD: BODY).</li><li>The group counts, the status texts and the Undo/Redo button titles equal HEAD at every step except the focus after the 3rd.</li><li>No page error.</li></ul> |
| C-COLLAPSE-REG-247 | Collapse focus still holds | B's HEAD recipe (collapseFocusReg): click the group name, focus the Music name, press `U`. The group folds and focus is on the group name with a ring, as at HEAD. Then Ctrl+G and Ctrl+Shift+G focus follow (UC9, C-PRECEDENCE-247). |
| C-MARKER-REG-247 | Round 246 still holds | `M`, `Enter`, `Ctrl+Z`: focus on Add marker (C-UNDO-ORIGINS-246, addUndo), at one viewport. |
| C-BUDGET-247 | L39 | The persistent text lines outside the timeline match round 246: empty 85/69 and demo 101/85 at 1440/1280. |
| AN-REVIEW-247 | Doc 190 | <ul><li>l.4 is byte-exact.</li><li>The 7 headings are in order.</li><li>D-29z415, the precedence, the ref-detach reason and the rejected designs are explained.</li><li>Every cited row exists (GF1–GF7 and any other cited).</li><li>The two TODO items are present.</li></ul> |
| LAB-SMOKE-247 | `/studio-lab` | It loads. Space plays and pauses. After adding `demo-stem-pulse` (the round 237–246 recipe), the export WAV has sha256 `1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94`. 0 page errors. |
| Auth | Standing check | In a fresh context: <ul><li>`/studio-lab` opens anonymously, with `auth_user` null;</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and no `audio[src]`;</li><li>`/api/studio-token` with no header returns 401.</li></ul> |
| Purchased origin (browser) | Groups on the purchased copy | BLOCKED: backend unavailable in cloud. The grants add no origin branch. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

## 6. Neighbouring behaviour that could break (C probes these first)
- **Focus stealing on re-render.** Because the ref callback is memoised, a normal re-render (selection, playback, a fader drag, a rename) must not move focus out of a group row. Watch a group name focused through 1.5 s of playback, and through a group volume drag.
- **Ctrl+G and Ctrl+Shift+G focus follow** (UC9, GF7), and the collapse rescue (UC4 F3, `setTrackGroupsCollapsed` blurs before the fold).
- **Grid menu (info):** focus a group name, open the lane grid menu with a right-click on the empty part of a lane, press `Ctrl+Z`. Record whether anything is undone and where focus ends. B's own recipe did not open the menu (`head-vol-menu.json` gridMenuUndo, `menuOpen` 0), so use the round-244 C recipe.
- Any change to the group status texts, the history labels, the selection after Undo, or the audio is a regression.

## 7. Outcomes for B's next planning
- **PASS and gate published:** B-R245-UNDO-GROUP-FOCUS closes.
  - **Next (D-29z418):** the **REGRESSION round** at the first planning on or after 2026-10-30. It carries every `scope_additions` entry of REGRESSION-ROUND-2026-10-30, including C-UNDO-ORIGINS-246 and the new C-GROUP-ORIGINS-247 (L6).
  - If that planning is still on 2026-10-29, **SABA-B-11b stage 2b** goes first.
  - Then SABA-B-10a (with C-R235-02), 10b, 9 and 11c. SABA-B-7 runs when Saba answers.
- **A product row FAILS:** a fix-up on the same grants first.
- **The frontend-architect checkpoint** ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS (question 4, with the D-29z416 addendum) is requested from root at this boundary. It does not block the next round.
