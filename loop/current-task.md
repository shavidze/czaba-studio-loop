# CURRENT TASK — Round 137: VISUAL-A V-0.3d — the rest of StudioWorkspace and Waveform Zoom in English

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 136)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). Module contract: `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract`, with the R6 clarification of round 133:
  - `strings.ts` is a leaf module (it imports nothing), with one object per area;
  - it holds plain strings plus small pure formatters, and no type assertions;
  - formatters take values that are already formatted; a branch that only picks between two texts stays in the caller;
  - existing local names keep their names and get their values from the module.
- **Previous task:** `tasks/round-136.md` (exact copy of the round-136 `current-task.md`, sha256 `9068d99e…`). Rationale: `b-round-136.md`. Decision record: **D-29z102** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: commit `7d9fed0f434b506b42e0d3bc86346202a28273f2`** (gate 136 published on both remotes; HEAD). The tree was **clean** at planning (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-136-r137-tree-sha256.txt`, **939 entries**. That is `git ls-files -co --exclude-standard` (951) minus the 12 existing grants in `b-round-136-r137-grants.txt`. The file has 14 lines; the last 2 are new files. `sha256sum -c --quiet` was OK at planning, run from `store/`.
- **Start hashes of the 12 existing grants:** `b-round-136-r137-granted-start-sha256.txt`. **Start copies:** `b-round-136/r137-granted-start/` (paths are relative to `store/`; `sha256sum -c` was OK there at planning). A checks both at the start. If a hash differs, A stops and reports.

## 0. Why this round (D-29z102)
- **Round 136: C PASS.** `browserVerified` = `realVerified` = true, and every row ran at 1440 and 1280. GEO-COUNT on the marker surface was 0 Georgian and 0 `«»` before any subtraction (39 + 39 steps). Bugs: 0. Gate 136 published `7d9fed0` (verify OK: 161 files / 2450 tests, build OK, review 9/10). **V-0.3c is done.**
- **`tasks/round-136.md` §8 fixed this step.** After a PASS comes **V-0.3d**, re-measured first. The regression round is not due: `regression-last.json` says 2026-10-24, round 122, so it is due on or after 2026-10-27. **No Critical, High or Medium finding is open.** `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist. The strings-split checkpoint has no root result, and every reviewer says to run it **after V-0.3d**. V-0.3d closes V-0.3, so B now files the bounded request (`b-round-136-checkpoint-request.md`). It does not block this round.
- **B's re-measurement at `7d9fed0`:**
  - **Source:** StudioWorkspace has **23** Georgian lines (l.143, 144, 150, 152, 154, 155, 157, 325, 954, 964, 1292, 2194, 2350, 2351, 2370, 2371, 2537, 2538, 2540, 2543, 2549, 2555, 2558). These are exactly the 23 lines of the ST25 ratchet. `waveform-zoom.ts` has **1** (l.22). The only `«»` lines in StudioWorkspace are l.954 and l.964.
  - **Test pins: 23 lines in 7 files:**
    - `floating-video.test`: l.129, 131, 132, 133, 134;
    - `track-groups-ui`: l.613, 627;
    - `clip-envelope-ui`: l.120, 121, 352, 356;
    - `purchased-collection-ui`: l.31, 37;
    - `waveform-zoom.test`: l.435, 476, 478, 485;
    - `all-lane-clipboard`: l.495 (`it` title), 502, 504, 513, 515;
    - `track-layout`: l.865.
  - Also the ST25 list in `strings.test` (l.1328–1352, plus the StudioWorkspace block of ST25). **`e2e/` has 0.**
  - **UI pin gaps:** the lane Shift hints (l.143/144) and the selection count (l.2549) have no UI pin. They get one in the new `workspace-strings-ui.test.tsx`.
- **False matches. They are NOT V-0.3d, so do not touch them:**
  - `detail-panel.test` l.327 and `status-announcement-ui` l.709 (`მონიშვნა: … · მუსიკა.`) come from `ArrangementDetailPanel.tsx:125` (V-0.4).
  - `delete-selection-ui` l.517–520 (`… წმ · ყველა ხაზი`) is the lane overlay at `ArrangementLane.tsx:1001` (V-0.4). Its `getAllByText(/ყველა ხაზი$/)` still finds exactly 1 element after this round, because the workspace span becomes English.
  - `grid-snap-edit` / `grid-snap-clip-edges` `Trim შეჩერდა…` and the `detail-panel-polish` info labels belong to V-0.4.
  - `floating-video` l.135–136 (`EXPAND_LABEL`, `RETURN_LABEL`, dock labels) and the other `purchased-collection-ui` constants (badge, loading, ready, failed) belong to V-0.5.
  - `clip-envelope-ui` l.117–119 (`Envelope: წერტილის …`, the ArrangementClipEnvelope point labels) belong to V-0.4.
  - Georgian **fixture data** (track names `მუსიკა`, `სტემები`, group name `SFX ქუჩა`, and so on) is user or track data, not UI copy. It stays inside the new English literals.
- **Ruling D-29z102 R1: the l.325 selector stays for V-0.4.** `'[data-testid="arrangement-track-header"] button[aria-label*="— აქტიური ხაზის არჩევა"]'` matches the aria-label of `ArrangementLane.tsx:697`. That label is pinned in 9 test files and is V-0.4 copy. Changing only the selector would break focus hand-off. So a fully Georgian-free StudioWorkspace is not honest this round. The smallest honest guard is a per-file scan that says StudioWorkspace has **exactly one** Georgian line, this selector, and **0** `«»`. V-0.4 changes the label and the selector together and turns the allowance into 0.
- **Ruling D-29z102 R2: texts go to their area objects, and one new object per new area.**
  - The video statuses go to `studioVideoStrings`.
  - The lane Shift hints go to `studioLaneMoveStrings`.
  - The group rename goes to `studioTrackGroupStrings`.
  - Waveform Zoom goes to `studioViewStrings`.
  - New: **`studioClipEnvelopeStrings`** (the Envelope area, which V-0.4 extends with the ArrangementClipEnvelope labels).
  - New: **`studioWorkspaceStrings`** (workspace chrome: the heading suffix, the range readout, the selection count, the selected-clip line).
  - Older ST maps only grow additively, the same as D-29z100 R3. No existing entry changes.
- **Ruling D-29z102 R3: the group rename uses the MK12 shape (forward constraint of D-29z101 R4).** `renameEmpty` must give the **same output** as `studioMarkerStrings.renameEmpty` for the same input; ST33 asserts this. `renamed` follows MK13: `Group name: “{name}”.`
- **Ruling D-29z102 R4: an accepted mixed state for one round, named.** The workspace readout will say `all tracks`, while the lane overlay (`ArrangementLane.tsx:1001`, V-0.4) still says `ყველა ხაზი`. Also, the dock buttons (`ვიდეოს გაფართოება`, `ვიდეოს პატარა ხედზე დაბრუნება`, V-0.5) stay Georgian next to the English statuses. **Forward constraint for V-0.5:** the dock return label must use **"compact view"**, the term chosen here (for example, `Return the video to the compact view`).
- **Folded in (owned doc, low cost):** **GATE136-DOC112-STATUS**, gate-136 reviewer finding 1. Doc 112 l.4, l.115 and l.119 only. This is the same pattern as doc 111 last round.

## 1. What changes (user-visible)
**Text and quote marks only.** None of these change: any handler, condition, key binding (A, Shift during a lane drag, Esc, Ctrl+Shift+L, Ctrl+Shift+X, Delete, F2, Enter), the order of the status calls, any focus hand-off (including the l.325 selector), the history labels (`Rename Group` and the others), any `data-testid`, any class name, the `Env` button text, or the zoom option labels (`½×` … `8×`).

### 1.1 The English map (exact text; A may not reword it. If a line seems wrong, A reports it and B rules)
| ID | Source line(s) | Object.key | Exact English |
|---|---|---|---|
| WS1 | StudioWorkspace l.143 `CLIP_LANE_SHIFT_HINT` | `studioLaneMoveStrings.shiftHint` | `Shift — lock the time; only the track changes` |
| WS2 | l.144 `CLIP_LANE_SHIFT_LOCKED_HINT` | `studioLaneMoveStrings.shiftLockedHint` | `Shift — the time is locked; only the track changes` |
| WS3 | l.149–150 `VIDEO_EXPANDED_MESSAGE` | `studioVideoStrings.expanded` | `The video is expanded over the library. Drag it where you want; Esc or ✕ brings it back.` |
| WS4 | l.151–152 `VIDEO_EXPANDED_LIBRARY_OPENED_MESSAGE` | `studioVideoStrings.expandedLibraryOpened` | `The library opened temporarily for the expanded video; it collapses again when the video closes. Esc or ✕ brings it back.` |
| WS5 | l.153–154 `VIDEO_RETURNED_LIBRARY_COLLAPSED_MESSAGE` | `studioVideoStrings.returnedLibraryCollapsed` | `The library collapsed, so the video went back to the compact view.` |
| WS6 | l.155 `VIDEO_RETURNED_COMPACT_MESSAGE` (exported) | `studioVideoStrings.returnedCompact` | `The video went back to the compact view.` |
| WS7 | l.156–157 `VIDEO_RETURNED_LIBRARY_RECOLLAPSED_MESSAGE` (exported) | `studioVideoStrings.returnedLibraryRecollapsed` | `The video went back to the compact view; the library collapsed again.` |
| WS8 | l.954 | `studioTrackGroupStrings.renameEmpty(name)` | `The name is empty — “{name}” is kept` (same output as `studioMarkerStrings.renameEmpty`) |
| WS9 | l.964 | `studioTrackGroupStrings.renamed(name)` | `Group name: “{name}”.` |
| WS10 | l.1292 (on) | `studioClipEnvelopeStrings.modeOn` | `Envelope mode: on.` |
| WS11 | l.1292 (off) | `studioClipEnvelopeStrings.modeOff` | `Envelope mode: off.` |
| WS12 | l.2350 | `studioClipEnvelopeStrings.toggleOnTitle` | `Envelope on — double-click a clip to add a point (A)` |
| WS13 | l.2351 | `studioClipEnvelopeStrings.toggleOffTitle` | `Envelope off — edit the clip volume envelope (A)` |
| WS14 | l.2370 | `studioViewStrings.waveformZoomLabel` | `Waveform Zoom — view only, the sound does not change` |
| WS15 | l.2371 | `studioViewStrings.waveformZoomTitle(percent: number)` | `Waveform Zoom {percent}% — view only, the sound does not change` |
| WS16 | `waveform-zoom.ts` l.22 | `studioViewStrings.waveformZoomStatus(percent: number)` | `Waveform Zoom {percent}% — view only, the sound does not change.` |
| WS17 | l.2194 | `studioWorkspaceStrings.headingSuffix` | `· Workspace` |
| WS18 | l.2537–2538 | `studioWorkspaceStrings.rangeReadout({ start, end, length })` | `Time selection: {start} — {end} · length {length} ·` (no trailing space; the caller keeps its `{' '}`) |
| WS19 | l.2540 | none: the caller renders `{studioEditStrings.allTracks} · ` inside the existing span | span text `all tracks · ` |
| WS20 | l.2543 | `studioWorkspaceStrings.rangeDeleteHint` | `Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time` |
| WS21 | l.2549 | `studioWorkspaceStrings.clipsSelected(count: number)` | `{count} clips selected` (it is rendered only when count > 1) |
| WS22 | l.2558 | `studioWorkspaceStrings.clipLabel` | `Clip:` (the caller keeps `{' '}<span …>{selectedTitle}</span> · start{' '}…`, so the visible text starts `Clip: {title} · start …`) |
| WS23 | l.2555 | `studioWorkspaceStrings.selectedClipTitle({ title, start, length, offset })` | `Clip: {title} · start {start} · length {length} · source offset {offset}` |

**Exact rendered text that A's pins and C's rows must match:**
- `arrangement-range`, one track: `Time selection: 00:03.000 — 00:05.000 · length 00:02.000 · Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time`
- `arrangement-range`, all tracks: `Time selection: 00:03.000 — 00:05.000 · length 00:02.000 · all tracks · Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time`
- `arrangement-selected-clip`: the `title` equals `textContent`, for example `Clip: Song · start 00:02.000 · length 00:08.000 · source offset 00:01.000`. The `track-layout` l.866 invariant `title === textContent` must stay green.
- The heading: `CZABA Studio Lab · Workspace` (demo) and `CZABA Studio · Workspace` (purchased). The prefix comes from `collection.ts` (V-0.5) and is unchanged.
- `waveform-zoom.ts` `waveformZoomStatus(level)` keeps its name and signature. Its body becomes `studioViewStrings.waveformZoomStatus(waveformZoomPercent(level))`. `waveform-zoom.ts` may import `./strings`, because strings.ts imports nothing, so there is no cycle.
- The local constant names stay (`CLIP_LANE_SHIFT_HINT`, `VIDEO_EXPANDED_MESSAGE`, …). They take their values from the module, and the two `export`s stay exported.

**Glossary additions (d29z102):**
| Georgian | English |
|---|---|
| `პატარა ხედი` | compact view |
| `გაფართოებული ვიდეო` | expanded video |
| `ბიბლიოთეკა დაიკეცა` | the library collapsed |
| `მხოლოდ ხედი, ხმა არ იცვლება` | view only, the sound does not change |
| `მონიშვნა` (readout) | Time selection |
| `სიგრძე` | length |
| `სამუშაო სივრცე` | Workspace |
| `Envelope რეჟიმი` | Envelope mode |
| `დრო ჩაკეტილია` | the time is locked |

Existing terms are reused: track, clip, gap, all tracks, Cut Time, “…”.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/lib/arrangement/strings.ts` | Append the WS keys to `studioLaneMoveStrings`, `studioVideoStrings`, `studioTrackGroupStrings`, `studioViewStrings`. Add two new objects after `studioMarkerStrings`: `studioClipEnvelopeStrings` and `studioWorkspaceStrings`. Formatters with 3+ same-type params take a named object (a local, not exported, interface is fine). Existing keys and values are byte-identical. No import. |
| `app/components/arrangement/StudioWorkspace.tsx` | The import names, plus exactly the §1.1 lines (l.143, 144, 149–157, 954, 964, 1292, 2194, 2350–2351, 2370–2371, 2537–2558). **l.325 is not touched.** Biome-style wraps are allowed. |
| `app/lib/arrangement/waveform-zoom.ts` | The import, plus the l.22 body only |
| `app/lib/arrangement/__tests__/strings.test.ts` | The import specifiers. **Additive** entries in `EXPECTED_VIDEO_PLAIN_STRINGS`, `EXPECTED_V02C2_PLAIN_STRINGS.studioViewStrings`, `EXPECTED_V02C2_KEYS.studioViewStrings`, `V02C2_FORMATTER_SAMPLES.studioViewStrings`, `EXPECTED_V02C3_PLAIN_STRINGS.studioLaneMoveStrings`, `EXPECTED_V02C3_KEYS` (laneMove + trackGroup) and `V02C3_FORMATTER_SAMPLES.studioTrackGroupStrings`, plus any formatter-sample map that the existing ST tests require to be exhaustive. Delete `STUDIO_WORKSPACE_REMAINING_GEORGIAN_LINES` and the StudioWorkspace block at the end of ST25, and retitle ST25 to `ST25: studioGridStrings and the grid sources contain no Georgian codepoint` (granted edit of an existing `it`). New `describe('V-0.3d workspace strings')` with ST31–ST33 (§3.1). |
| `floating-video.test.tsx` | l.129, 131, 132, 133, 134 only |
| `track-groups-ui.test.tsx` | l.613, 627 only |
| `clip-envelope-ui.test.tsx` | l.120, 121, 352, 356 only |
| `purchased-collection-ui.test.tsx` | l.31, 37 only |
| `waveform-zoom.test.tsx` | l.435, 476, 478, 485 only |
| `all-lane-clipboard.test.tsx` | l.495 (`it` title → `after Ctrl+Shift+L the range line says all tracks`), 502, 504, 513, 515 only |
| `track-layout.test.tsx` | l.865 only |
| `docs/implementation/2026/quarter-IV/112-studio-v0-marker-strings.md` | l.4 → `Completed (A-ის შემოწმებები მწვანეა რაუნდ 136-ში; C round 136 — PASS, browserVerified; gate 136 — 7d9fed0)`; l.115 cites `c-round-136.json` as PASS; delete the C-round TODO line l.119 (GATE136-DOC112-STATUS) |
| **new** `app/lib/arrangement/__tests__/workspace-strings-ui.test.tsx` | WSU1–WSU2 (§3.3) |
| **new** `docs/implementation/2026/quarter-IV/113-studio-v0-workspace-strings.md` | Georgian, with the `docs/implementation/TEMPLATE.md` sections. Its status says that C round 137 is still to come. |

- **Protected (never touch):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, `app/routes/account.downloads.tsx`, `download-routes.test.ts`, and everything in `backlog.json` `global_forbidden_files`.
- **Pin rule:** each replaced pin is a **hand-written English literal** with the same matcher (`toBe` stays `toBe`, `toContain` stays `toContain`, `not.toContain` stays `not.toContain` with the English fragment `all tracks`). No pin may import the module value it checks. No new `it` goes into the 7 pin files, and their `it` counts stay the same.
- **Stop rule:** if the pre-edit grep finds a Georgian V-0.3d text in a file that is not granted, or a pin line differs from §0, A stops and reports. A does not widen scope.

## 3. A — tests and mutations
### 3.1 `strings.test.ts` (30 → 33 `it`s)
- **ST31:** the exact key sets of `studioClipEnvelopeStrings` and `studioWorkspaceStrings`; every plain string equals its §1.1 literal; every formatter returns the exact English for Latin samples (WS18 with `00:03.000` / `00:05.000` / `00:02.000`, WS21 with 2 and 3, WS23 with `Song`). The new keys of the four existing objects are pinned through the additive map entries.
- **ST32:** the exported aliases: `VIDEO_RETURNED_COMPACT_MESSAGE` and `VIDEO_RETURNED_LIBRARY_RECOLLAPSED_MESSAGE` equal WS6/WS7; `waveformZoomStatus(2)` is `Waveform Zoom 200% — view only, the sound does not change.`; `waveformZoomStatus(0.5)` is `Waveform Zoom 50% — view only, the sound does not change.`
- **ST33 (per-file scan, replaces the ratchet):**
  - `studioClipEnvelopeStrings`, `studioWorkspaceStrings` and all the new formatter outputs contain no Georgian and no `«»`;
  - `waveform-zoom.ts` (comments stripped) has no Georgian;
  - `StudioWorkspace.tsx` (comments stripped) has **exactly one** Georgian line, equal to the l.325 selector line (R1), and **no** `«»`;
  - `studioTrackGroupStrings.renameEmpty('X')` equals `studioMarkerStrings.renameEmpty('X')` for at least two names, one of them `SFX ქუჩა` (R3).

### 3.2 Pin replacements (hand-written English; fixture names stay as they are)
The pin lines are listed in §0. Each one gets the exact §1.1 text, for example `'Group name: “SFX ქუჩა”.'`, `'The name is empty — “SFX ქუჩა” is kept'`, `'CZABA Studio Lab · Workspace'`, and the two `arrangement-range` lines given in §1.1.

### 3.3 New `workspace-strings-ui.test.tsx` (real `StudioWorkspace` in jsdom; copy the mount harness of `gesture-guard.test.tsx` l.296–336, do not import it)
- **WSU1:** start a clip lane drag (pointer down on a clip header, then move to another lane). `arrangement-lane-move-hint` has the text `Shift — lock the time; only the track changes`. Move again with `shiftKey: true`: the text is `Shift — the time is locked; only the track changes` and `timeLocked` is true. Pointer up: the hint is gone and `arrangement-shortcut-hint` is back.
- **WSU2:** select two clips (Ctrl+click or the existing multi-select path): `arrangement-selection-count` is `2 clips selected`. With one clip selected the element is absent.

### 3.4 Forward rule (GATE130-S3)
Every WS key has at least one hand-written UI literal in a pin file or in WSU1–2. A lists the key → test mapping in its report. WS19 is covered by the `all-lane-clipboard` all-tracks line.

### 3.5 Mutations (each turns the named tests red; restore and check by sha256)
| ID | Mutation | Must turn red |
|---|---|---|
| m45 | WS2 text changed (for example `locked` → `fixed`) | ST map test, WSU1 |
| m46 | StudioWorkspace l.2579 ternary branches swapped | WSU1 |
| m47 | WS6 trailing `.` removed | ST32, `floating-video` (RETURNED_TEXT users) |
| m48 | WS8 changed to `… “{name}” remains` | ST33 equality, `track-groups-ui` l.627 |
| m49 | WS16 trailing `.` removed | ST32, `waveform-zoom.test` l.435 |
| m50 | WS18 drops `length` | ST31, `all-lane-clipboard` l.504 and l.515 |
| m51 | WS21 → `{count} clip selected` | ST31, WSU2 |
| m52 | a Georgian letter added to WS17 in StudioWorkspace (inline literal) | ST33 |

## 4. A — checks (speed rules)
- At the start: the frozen list, the 12 start hashes and the start copies all OK. `git status --short` is empty.
- The pre-edit grep for every §1.1 Georgian text in `app/**` and `e2e/**`, saved to `a-round-137/pre-grep.txt`.
- `npm run typecheck` and `npm run lint` exit 0. Read-only `npx biome check` on the changed code and test files gives 0 diagnostics.
- `npx vitest run` on the named list: `strings`, `floating-video`, `track-groups-ui`, `clip-envelope-ui`, `purchased-collection-ui`, `waveform-zoom`, `all-lane-clipboard`, `track-layout` and `workspace-strings-ui`. Neighbours: `gesture-guard`, `delete-selection-ui`, `detail-panel`, `status-announcement-ui`, `marker-strings-ui`, `track-group-collapse-ui`, `navigation-strings-ui`. Save the results to `a-round-137/vitest.json`.
- Mutations m45–m52 per §3.5.
- The code-reviewer (more than 3 files change). Its Architecture note goes to B.
- **Not run:** the full suite, `npm run verify`, build and e2e (the gate does these).
- At the end: `git status --short` shows the 12 ` M` + 2 `??` granted paths and nothing else. The frozen list is OK. The protected `git diff 7d9fed0` is empty. Write the end sha256 of the 14 paths to `a-round-137/end-sha256.txt`. A does no commit, stash, checkout, install, `--write` or `check:fix`.

## 5. C — rows
Real Playwright Chromium at **1440×900 and 1280×720** on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session. Use test ids, not Georgian titles (the older harnesses that search for Georgian text will not match). State the Snap state at the start of each session; the default is off.

| Row | Start state → action → expected |
|---|---|
| T137-TARGETED | Run A's named vitest list; the counts equal A's |
| SOURCE-SCOPE | 12 ` M` + 2 `??` and nothing else. The frozen list is OK at the start and at the end. The end hashes equal `a-round-137/end-sha256.txt`. The protected diff against `7d9fed0` is empty. No source change during C's phase |
| AN-REVIEW | `diff -u` against `b-round-136/r137-granted-start/`. Only the §1.1 lines and the import change; l.325 is unchanged; no handler, condition, key or class changes; the pins are hand-written English with the same matchers; the ST25 edit is only the deletion and the retitle; doc 112 changes only l.4, l.115 and l.119 |
| HEADING | Fresh load: the `h1` text is `CZABA Studio Lab · Workspace` |
| LANE-HINT | A clip on music; there is a stems track below. Press on the clip header, move down past the threshold onto stems, and hold the button: `arrangement-lane-move-hint` shows WS1. Then move with Shift held: WS2, and the ghost keeps its start time. Release: the clip is on stems at the same start (Shift case), with one Undo entry, and the shortcut hint is back |
| VIDEO-STATUS | Import a short generated MP4 with the round-131 harness (`c-round-131/tools/`). (a) Library open, then ⤢ `arrangement-video-expand`: status WS3. (b) ✕ `arrangement-video-close`: WS6. (c) Collapse the library (`arrangement-library-collapse`), then ⤢: WS4. ✕: WS7, and the library is collapsed again. (d) Library open, ⤢, then collapse the library while it is expanded: WS5. In each case the video keeps playing or stays paused as before (check `currentTime` and the paused state); the status text is exact |
| GROUP-RENAME | Ctrl+G on two adjacent tracks, F2 on the group name, `Drums` + Enter: status `Group name: “Drums”.`, and Undo shows `Rename Group`. F2, clear, Enter: `The name is empty — “Drums” is kept`, and the name is unchanged. Then rename a marker to an empty name: the marker sentence has the same shape (REG-136) |
| ENVELOPE | The `Env` button title is WS13 while off. Press A (or click): status WS10, title WS12, `aria-pressed=true`. Double-click on a clip adds an envelope point (the line has one more point). A again: status WS11 |
| WAVEFORM-ZOOM | The `arrangement-waveform-zoom` aria-label is WS14 and its title is `Waveform Zoom 100% — …`. Choose 2×: status `Waveform Zoom 200% — view only, the sound does not change.`, and the title says 200%. The waveform path of an audio clip changes. **Audio unchanged:** the real output tap peak over the same 2 s of playback at 1× and at 2× is within ±0.5 dB. Back to 1×: the path equals the 1× path |
| RANGE-READOUT | Make a range of 3–5 s on music: the `arrangement-range` text equals the one-track line of §1.1. Ctrl+Shift+L: it equals the all-tracks line. Delete: the clips keep a gap (the next clip's start is unchanged) and Undo restores it |
| SELECTION | Select two clips: `2 clips selected`. Select one: the line is absent, and `arrangement-selected-clip` shows `Clip: {title} · start …` with `title === textContent` |
| GEO-COUNT | At every step of the rows above, count Georgian in the StudioWorkspace surface: the heading suffix, the toolbar (`Env`, Waveform Zoom), the status, the range, selection and selected-clip lines, and the lane-move hint. Expect **0** after the named subtractions: track names (`მუსიკა`, `სტემები`, …), demo titles, and the dock buttons, library, lane overlay and detail panel (V-0.4/V-0.5). List every subtraction |
| LAYOUT | S0/S1/S2 (the round-130 harness) against round 136: any change >1 px is only a text-width change of a granted element. The status, range and lane-hint lines wrap without horizontal overflow (`scrollWidth == clientWidth`) at 1280 with the all-tracks readout |
| REG-136 | One marker sample: M at 3 s gives `Marker “Marker 1” added at 00:03.000.` (or the existing marker-exists text if one is there). See the corrected V-0.3c expectations in `backlog.json` (prev/next go to the timeline start or the project end first; a direct drag onto an occupied time is refused silently) |
| G137-3 (alone, last) | `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` shows "Sign in required" with no workspace and 0 `audio[src]`. `GET /api/studio-token?…` → 401. The fake-Bearer 403 check is BLOCKED (backend unavailable in cloud) |
| PX-NET / REG-HYD | 0 forbidden requests, 0 Authorization headers, 0 hydration errors and 0 pageerror (the known cart noise is expected) |

Gate rows (C does not claim them): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## 6. Ableton source
Live 12 Reference Manual, Arrangement View (B's saved capture `b-round-133/live/arrangement-view.txt`, sha256 `2b9a3007…`, re-read 2026-10-24) and §3.19 / §26 (the table of contents in the same capture). Only text changes this round.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Time selection readout | §6 Arrangement, "time selection" | the term "time selection" | The readout line is a CZABA addition. Delete leaves a gap: user decision 2026-10-11 | RANGE-READOUT |
| Clip envelope edit mode | §3.19 Clip Envelopes, §26.6.2 Draw Mode | clip envelopes exist; drawing uses Draw Mode (B) | **Deliberate difference:** the CZABA `Env` toggle with A. Not a Live claim | ENVELOPE |
| Group rename | §18.3 Grouping Tracks (D-29z98) | Rename | **Deliberate difference:** F2 instead of Ctrl+R (same as markers) | GROUP-RENAME |
| Shift time-lock during a cross-track drag | none found | **unconfirmed** | CZABA rule; no Live claim is made | LANE-HINT |
| Waveform Zoom (view only) | none found for the Arrangement | **unconfirmed** | CZABA view control; the audio is unchanged | WAVEFORM-ZOOM |
| Floating expanded video | not applicable | not applicable | CZABA single video track (user scope) | VIDEO-STATUS |

C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 7. Evidence and reporting
- C writes `c-round-137.md` and `c-round-137.json` as it goes, with these fields: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` (with the subtracted items), `invalidRuns`, `notesForB`. Evidence goes under `c-round-137/{tools,out,shots}/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`. Gestures that Chromium truly cannot reach go under `inconclusive`, with the reason. C makes no `store/` writes.
- A writes `a-round-137.md` as it goes: start checks, pre-grep, changed files, `it` counts before and after, test results, mutations, the reviewer verdict and its Architecture note, shell writes, end state, deviations and known gaps.

## 8. Outcome, fixed in advance (B at round 138 planning)
| Condition | Round 138 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first (use the corrected V-0.3c expectations), then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.3d fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.3d → `c_pass`, then `c_pass_published` after the gate. **V-0.3 is complete.** If root's strings-split checkpoint result exists, B applies it first (an approved split is its own bounded round with behaviour-preserving tests). Otherwise round 138 = **V-0.4** (lanes and detail), re-measured first and split by surface |

At every planning B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Focus hand-off:** l.325 is the only selector that finds the track-name button. It must stay byte-identical, or Ctrl+G / group focus breaks. ST33 pins it.
- **Status de-duplication:** the Envelope and video statuses are set once per action, and nothing compares them by value. The texts are stable strings.
- **Width:** the English readout is longer than the Georgian one (`Time selection:` and `Delete = delete, the gap remains`). The line already wraps (`tabular-nums`, no `truncate`). LAYOUT checks 1280.
- **jsdom vs browser:** the readout spacing comes from the JSX `{' '}` and the span boundaries. C checks the real `textContent`.
- **Mixed for one round (accepted, named):** the lane overlay `ყველა ხაზი`, the dock buttons, the detail-panel range status (V-0.4/V-0.5).
- **Architecture:** the strings-split checkpoint request is `b-round-136-checkpoint-request.md`, to run after C round 137 PASS and before V-0.4 is planned. It is non-blocking.
- **Commit readiness:** after C PASS, root may publish V-0.3d as an interim unit.
