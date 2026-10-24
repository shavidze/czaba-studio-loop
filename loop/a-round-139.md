# A — Round 139 report (VISUAL-A V-0.4b: track lane and track header strings in English)

Status: A phase complete. Ready for C round 139. No commit, push, stash, checkout, install, `--write` or `check:fix`.

## 1. Start checks (2026-10-24)
- HEAD `1d4df51594aa977fec987d72fed87d1d679e4fb7`; `git status --short` was empty.
- Frozen list `b-round-138-r139-tree-sha256.txt` (937 entries): `sha256sum -c --quiet` OK.
- 18 start hashes: OK. Start copies `b-round-138/r139-granted-start/`: OK.
- Pre-flight gate done before any code was written:
  - assumptions: text only, §1.1 exact, branches stay in the caller, §1.2 output byte-identical;
  - files: the 20 grants only;
  - success: typecheck/lint 0, Biome 0, named vitest green, m61–m68 red.

## 2. Pre-grep — `a-round-139/pre-grep.txt` (app/** and e2e/**)
- `e2e/`: 0 hits. `ArrangementLane.tsx`: exactly the 22 §0 lines. `StudioWorkspace.tsx`: l.331 only.
- Every pin line equals the §0 list exactly (track-layout ×13, grid-snap-loop-drop ×5, fader-touch ×2, fader-click ×1, track-volume-db ×2, group-volume-db / track-group-mix-ui / track-groups-ui / track-group-collapse-ui role regexes, track-pan l.718, track-groups-ui l.422, marker-snap l.725, delete-selection-ui l.517/520, strings.test l.1656–1657).
- Other hits are all R5 or unrelated, so no stop was triggered:
  - R5: GroupHeader l.33/62/217/289/290, DetailPanel l.1104/1108/1130/1134, VideoDock l.227, Library, LibraryPreview, and the tests detail-panel, render-budget, library-preview and the group pins in track-group-mix-ui / track-group-collapse-ui;
  - unrelated: the WaveForm comment and the collection decode error.
- Stop rule `/all tracks$/`: the workspace span `all tracks ·` does not end with `all tracks`. The test's `toHaveLength(1)` stays green, so the count is unchanged.

## 3. Changed files (18 ` M` + 2 `??`, equal to the grants file; end hashes in `a-round-139/end-sha256.txt`)
- `app/lib/arrangement/strings.ts`:
  - `studioLaneStrings` (23 keys) appended after `studioClipStrings`;
  - before `studioWorkspaceStrings`: the non-exported helper `selectedClipDetailText` and, as a **deviation (small, needed for strict typing of the helper's argument)**, the local, non-exported `type StudioWorkspaceClipDetail = Omit<StudioWorkspaceClipText, 'title'>`. The precedent is the local `StudioClipGroupMoveText` of round 138;
  - new key `selectedClipDetail`, and `selectedClipTitle` now returns `` `Clip: ${title}${selectedClipDetailText(detail)}` `` (same output; ST31's sample is unchanged and green);
  - other objects are byte-identical; no import.
- `app/components/arrangement/ArrangementLane.tsx`: one new strings import (`studioClipStrings, studioEditStrings, studioLaneMoveStrings, studioLaneStrings`) plus the 22 §1.1 lines. Biome wraps:
  - l.818 became a 3-line `? ( <p>… ) : null`;
  - the LN22 overlay became two lines (`{seconds(…)} ·{' '}` / `{allTracks}`). Rendered text: `00:03.000 – 00:05.000 · 2.000 s · all tracks`.
  - Branches stay inline (R3). The local constants keep their names.
- `app/components/arrangement/StudioWorkspace.tsx`: the l.331 selector → `*="— set as the active track"`. The selected-clip tail → `{studioWorkspaceStrings.selectedClipDetail({ start, length, offset })}` after `<span>{selectedTitle}</span>`, so textContent is byte-identical (LSU6; reviewer checked it).
- `strings.test.ts`:
  - the import specifier;
  - `WORKSPACE_TRACK_HEADER_SELECTOR_LINE` deleted;
  - ST33 retitled exactly, and `toEqual([])`;
  - ST31: `'selectedClipDetail'` added to the key list, plus one hand-written sample check;
  - **deviation (needed):** a `selectedClipDetail` entry was also added to `WORKSPACE_FORMATTER_SAMPLES`, because ST31 asserts that the formatter keys equal the sample keys;
  - new `describe('V-0.4b lane strings')` with ST36 and ST37.
- 12 pin files: 32 pin lines, rewritten only on the §0 line numbers, with hand-written English, the same matchers/anchors/operators and the fixture names kept. A script asserted a single match per line and that no Georgian remained except `მუსიკა`. Diff: `a-round-139/pin-edits.txt`. One Biome wrap of the same statement: track-layout l.295 became 3 lines. Every pin file needed a change.
- New `lane-strings-ui.test.tsx`: 8 `it`s (LSU1, LSU2, LSU3, LSU4, LSU5a/b/c, LSU6). It is 8 rather than 6 because LSU5 is split into one `it` per sound state (decoding / error / none). The harness is copied from clip-strings-ui, and the video.client mocks from video-import-status-ui; neither file is imported.
- Doc `113`: `track-header selector (l.331)-ის selector` → `track-header selector (l.331)` at l.21 and l.74.
- Doc `114`: l.4 status Completed (C round 138 PASS, browserVerified, gate 138 `1d4df51`); the l.72 last sentence → C round 138 PASS; the C round 138 TODO line deleted.
- New doc `115-studio-v0-lane-strings.md`: Georgian, TEMPLATE sections, status "C round 139 still to come".
- **Shell writes (not Edit/Write):**
  - python scripts did the 22 Lane replacements, the StudioWorkspace edits, the strings.test changes plus the ST36/37 append, the 32 pin lines, the docs 113/114 lines and the Biome-style wraps; each one assert-checked an exact single match;
  - one `sed -i` renamed the three LSU5 titles to LSU5a/b/c;
  - the mutation runner `a-round-139/mutations/run.py` wrote each mutation and restored it from a backup, with a sha256 assert.

## 4. `it` counts (source `it(` lines)
- strings 35 → 37 (runtime 37). lane-strings-ui: new, 8.
- The 12 pin files are unchanged (`it-counts-before.txt` = `it-counts.txt`): fader-touch 7, fader-click 26, track-volume-db 11, group-volume-db 9, track-group-mix-ui 10, track-pan 26, track-groups-ui 14, track-group-collapse-ui 22, marker-snap 25, grid-snap-loop-drop 36, delete-selection-ui 13, track-layout 36.

## 5. Checks actually run (final state)
- `npm run typecheck`: exit 0 (`typecheck.log`).
- `npm run lint`: exit 0, with 218 warnings and 1 info, all pre-existing in files A did not change (`lint.log`).
- Read-only `npx biome check` on the 17 changed .ts/.tsx files: 0 diagnostics.
- `npx vitest run` on 22 files: **22 files, 404/404 passed**, exit 0 → `vitest.json`, `vitest.log`, `vitest-per-file.txt`.
  - The files: strings, the 12 pins, lane-strings-ui, and the neighbours clip-strings-ui, workspace-strings-ui, video-import-status-ui, grid-snap-clip-edges, status-announcement-ui, detail-panel, render-budget, library-preview. track-volume-db is both a pin and a neighbour.
  - Runtime counts: clip-strings-ui 3, delete-selection-ui 13, detail-panel 24, fader-click 26, fader-touch 7, grid-snap-clip-edges 44, grid-snap-loop-drop 36, group-volume-db 9, lane-strings-ui 8, library-preview 7, marker-snap 25, render-budget 7, status-announcement-ui 33, strings 37, track-group-collapse-ui 22, track-group-mix-ui 10, track-groups-ui 14, track-layout 36, track-pan 26, track-volume-db 11, video-import-status-ui 4, workspace-strings-ui 2.
- Not run (speed rules; the gate runs them): the full suite, `npm run verify`, build, e2e.

## 6. Mutations m61–m68 (`a-round-139/mutations/results.json`; all restored, sha256 asserted)
| ID | Result (failing tests) |
|---|---|
| m61 LN7 → `set active track` | 66 red across the named list. Among them: ST36; role-regex files fader-touch (FT1–7), group-volume-db (GV1–9), track-group-mix-ui (UM1–10), track-groups-ui (TG1–11), track-group-collapse-ui (UC*), track-volume-db TV11; `track-pan` "row 1 DOM order…" (l.718); track-layout R23-N (l.1036); LSU1 |
| m62 l.331 selector back to Georgian | ST33 + **track-group-collapse-ui UC8, UC9 F1 (×2)**: these are the UI tests that go through `trackRowNameButton` (focus handoff after Ctrl+G / Ctrl+Shift+G / Redo) |
| m63 `selected` branch inverted | track-groups-ui TG1 (l.422), track-pan l.718, track-layout R23-N, LSU1 |
| m64 ghost `No space here` literal | grid-snap-loop-drop SD6 (l.441) and DE4 (l.551) |
| m65 overlay `sec` inline | delete-selection-ui "after Ctrl+Shift+L … the label once" (l.520) |
| m66 LN14/LN15 swapped | LSU4 |
| m67 drop ` · source offset …` | ST31, LSU6 |
| m68 Georgian letter inline at l.701 | ST37 |
- m63 and m66 were re-run after the reviewer-driven LSU edits: still red (same tests). m61 and m67 were not re-run after that edit. LSU1 still looks the button up by the exact English name, and LSU6 was unchanged.

## 7. Key → hand-written UI literal (GATE130-S3)
- videoMixLabel: fader-click l.193, fader-touch l.200, track-volume-db l.41.
- videoImportLabel: track-layout l.312/313/317, LSU1.
- foldTitle: track-layout l.286.
- soloLabel: track-layout l.295. soloTitle: **no UI literal.** See known gap 1.
- foldLabel: track-layout l.285.
- activeTrackLabel: the role regexes, track-pan l.718, track-layout l.1036, LSU1.
- selectedSuffix: track-groups-ui l.422.
- activeBadge: LSU1. videoImportTitle: LSU1. panResetLabel: LSU2.
- videoOriginalSound: track-layout l.311/316.
- noVideo + videoEmptyHint: LSU3.
- dropVideoHere / videoNotOnAudioTrack: LSU4.
- ghostAudioOnVideoTrack: grid-snap-loop-drop l.465/620, marker-snap l.725. ghostNotLoaded: grid-snap-loop-drop l.567. noRoom reuse: grid-snap-loop-drop l.441/551.
- audioDecoding / audioUnreadable / audioNone: LSU5a/b/c.
- LN22: delete-selection-ui l.517/520.
- heightLabel: track-layout l.346/1123. foldedValueText: track-layout l.428/834.
- §1.2 selectedClipDetail: LSU6 (plus ST31).

## 8. Code review (real `code-reviewer` subagent): Ready, 8.5/10, no Critical/High
- Behaviour check: no change. The overlay and selected-clip textContent are confirmed identical. Pins keep their matchers.
- Low, fixed in owned LSU:
  - LSU5's className lookup → `within(clip).getByText(…)`;
  - LSU1's `endsWith` → exact `toBe('მუსიკა· active')`.
- Suggestions not applied, reported for B:
  - `videoEmptyHint` repeats the `＋ Your own video` text instead of composing from `videoImportLabel` (B's exact map; could drift);
  - the `selectedClipDetail` wrapper could be the helper itself (cosmetic);
  - the unfolded `${height} px`, Mute/Pan/Volume English labels and `Pan → C` stay inline (out of scope; V-0.4c candidates).
- **Architecture note (for B/root, not acted on):** `StudioWorkspace.tsx:331` hard-codes the substring `— set as the active track`, while `ArrangementLane` builds it from `studioLaneStrings.activeTrackLabel`. Two files must agree with no shared constant; ST33 and the m62-covered UC tests catch drift.
  - Proposal: one small task that exports a suffix constant or derives the selector from `activeTrackLabel` in `strings.ts`.
  - Acceptance: `trackRowNameButton` has no inline text, and the focus tests stay green.
  - Keep for this round.

## 9. End state
- `git status --short`: exactly the 18 ` M` + 2 `??` granted paths (compared to the grants file: equal).
- Frozen list OK. `git diff 1d4df51` of the protected files: empty. No grant is on `global_forbidden_files` (24 entries).
- End sha256 of the 20 granted paths: `a-round-139/end-sha256.txt`.

## 10. Known gaps / notes for C and B
1. **`soloTitle` (LN5) has no hand-written UI literal.** The §0 pin list has none for the lane Solo `title`, only the aria-label at track-layout l.295, and adding a new expectation to a pin file was not allowed. ST36 pins the value. C's SOLO row checks the title in the browser. B may add a UI pin in a later round.
2. LSU4 uses a synthetic `dataTransfer` (`types: ['Files']`). The real browser path is C's FILE-DRAG-HINT row.
3. Everything is jsdom/unit evidence. No browser run by A (the C rows are in §5 of the task).

## 11. Exact next C checks
Run the task's §5 rows at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`. In particular:
- T139-TARGETED: the 22-file list in `a-round-139/vitest-files.txt`; expected 22 files / 404 tests.
- SOURCE-SCOPE against `a-round-139/end-sha256.txt`.
- TRACK-SELECT, including Ctrl+G (the `trackRowNameButton` path).
- TRACK-FOLD with the new aria-label `Fold or unfold — {track}`.
- SOLO title `Solo (Ctrl/Cmd+click = add to solo)` (gap 1).
- FILE-DRAG-HINT, LIBRARY-GHOST, ALL-TRACKS-OVERLAY, AUDIO-NOTE, SELECTED-CLIP, GEO-COUNT, LAYOUT, then G139-3 last.

## 12. Scope completed (A-side only; C acceptance is still pending)
- Done: §1.1 LN1–LN24, §1.2, the §2 file list, §3.1–3.5, and the §4 checks.
- Not claimed: any C browser row, the gate rows, or "V-0.4b done".
