# CURRENT TASK — Round 139: VISUAL-A V-0.4b — track lane and track header texts (ArrangementLane) in English

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 138)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). Module contract: `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract` with the R6 clarification of round 133 (leaf module, one object per area, plain strings + small pure formatters, formatters take already formatted values, a branch that only picks between two texts stays in the caller, local names keep their names).
- **Previous task:** `tasks/round-138.md` (exact copy of the round-138 `current-task.md`, sha256 `91668986…`). Rationale: `b-round-138.md`. Decision record: **D-29z104** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: commit `1d4df51594aa977fec987d72fed87d1d679e4fb7`** (gate 138 published on both remotes; HEAD). Tree **clean** at planning (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-138-r139-tree-sha256.txt`, **937 entries** = `git ls-files -co --exclude-standard` (955) minus the 18 existing grants. Grants: `b-round-138-r139-grants.txt` (20 lines; the last 2 are new files). `sha256sum -c --quiet` OK at planning, run from `store/`.
- **Start hashes of the 18 existing grants:** `b-round-138-r139-granted-start-sha256.txt`. **Start copies:** `b-round-138/r139-granted-start/` (paths relative to `store/`; `sha256sum -c` OK there). A checks both first; any difference → A stops and reports.

## 0. Why this round (D-29z104)
- **Round 138: C PASS**, `browserVerified` = `realVerified` = true, every browser row at 1440 and 1280, GEO-COUNT net 0, 2 Lows (C-R138-01 doc wording, C-R138-02 pre-existing blocked status after commit → `deferred_low_polish`). Gate 138 published `1d4df51` (163 test files / 2460 tests, build OK, review 9/10). **V-0.4a is done.**
- `tasks/round-138.md` §8 fixed this step: C PASS → **V-0.4b**, re-measured first. No strings-split checkpoint result exists (request `b-round-136-checkpoint-request.md` still unanswered). Regression due on/after 2026-10-27 (not yet). No Critical/High/Medium open. `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist.
- **B's measurement at `1d4df51`:** `ArrangementLane.tsx` has **22** non-comment Georgian lines (l.58, 59, 60, 620, 621, 676, 697, 701, 711, 765, 818, 853, 864, 889, 891, 893, 951, 953, 954, 1001, 1013, 1017). `StudioWorkspace.tsx` has 1 (l.331, the track-header selector that matches l.697). `e2e/` has 0 hits.
- **Pins (measured; phrase grep plus partial-phrase grep, incl. role-name regexes and attribute selectors — R6 extended to aria-labels):**
  - `track-layout`: l.285, 286, 295, 311, 312, 313, 316, 317, 346, 428, 834, 1036, 1123
  - `grid-snap-loop-drop`: l.441, 465, 551, 567, 620 (library drop ghost)
  - `fader-touch`: l.182 (role-name regex), l.200 (video `Volume —` selector) · `fader-click`: l.193 (video `Volume —` selector)
  - `track-volume-db`: l.41 (test-local `VIDEO_MIX_LABEL` value), l.303 (role-name regex)
  - `group-volume-db` l.207 · `track-group-mix-ui` l.207 · `track-groups-ui` l.214 · `track-group-collapse-ui` l.215 (all `new RegExp(\`^${…} — აქტიური ხაზის არჩევა\`)`)
  - `track-pan` l.718 · `track-groups-ui` l.422 (exact aria-labels)
  - `marker-snap` l.725 (lane drop ghost) · `delete-selection-ui` l.517, 520 (all-tracks overlay)
  - `strings.test`: `WORKSPACE_TRACK_HEADER_SELECTOR_LINE` (l.1656–1657) and the ST33 body that expects it.
- **UI pin gaps (no existing literal):** l.701 `· აქტიური`, l.711 compact import title, l.765 Pan reset aria-label, l.818 `ორიგინალი ხმა` (only `toContain`), l.853 empty-video placeholder, l.864 both file-drag hints, l.951/953/954 clip audio notes (video-import-status-ui l.248 pins the *source* `studioVideoStrings.noSound`, not this overlay). They get tests in the new `lane-strings-ui.test.tsx`.
- **Not V-0.4b, do not touch (named mixed state, R5):** `ArrangementGroupHeader.tsx` (fold title `(U)`, group fold aria-label, group Solo, `, მონიშნული`) and its pins `track-group-mix-ui` l.403/405/425/680/689/694, `track-group-collapse-ui` l.415/473/660/667/671 → V-0.4c. `ArrangementDetailPanel.tsx` l.703/719/1104/1108 and `detail-panel.test` → V-0.4e. `ArrangementVideoDock.tsx` l.227 `ვიდეო არ არის ·` and `render-budget.test` → V-0.5. `library-preview.test` `აქტიური ხაზი: …` (library) → V-0.5. Track names (`მუსიკა`, `სტემები`, `SFX`, `ვიდეო`) are fixture/default data (V-0.4d) and stay inside the new English literals.

### Rulings D-29z104
- **R1 — one new object `studioLaneStrings`** (track lane and track header area), appended after `studioClipStrings`. Reuse instead of copies:
  - the all-tracks overlay (l.1001) uses `studioClipStrings.seconds(…)` and `studioEditStrings.allTracks` → `00:03.000 – 00:05.000 · 2.000 s · all tracks` (same unit shape as the clip badge);
  - the blocked ghost suffix uses **`studioLaneMoveStrings.noRoom`** (`No room here`), as already ruled in GATE130-S1 `note_round133`; no new key.
- **R2 — ghost texts say what the status says (GATE130-S1).** The refused ghost reuses the closing clause of `studioLibraryStrings.audioOnVideoTrack` (“… audio is not added to the video track.”) as `Audio is not added to the video track`; the not-ready ghost reuses the opening clause of `studioLibraryStrings.dropNotLoaded` as `This sound has not loaded yet`. Smallest honest choice: short tail/head of the status the user sees on release, no new wording. The status sentences themselves are unchanged.
- **R3 — branches stay in the caller:** `, selected` suffix (`selected ? … : ''`), the folded valuetext vs `${height} px`, the three ghost cases, the three audio notes, the two file-drag hints.
- **R4 — forward constraints (V-0.4c / V-0.4e / V-0.5 must reuse, not copy):** GroupHeader l.33 = `` `${studioLaneStrings.foldTitle} (U)` ``; GroupHeader l.290 title = `studioLaneStrings.soloTitle`; GroupHeader l.62 selected suffix = `studioLaneStrings.selectedSuffix`; DetailPanel l.1108 folded valuetext = `studioLaneStrings.foldedValueText(…)`; VideoDock l.227 = `studioLaneStrings.noVideo`. B records them in `backlog.json`.
- **R5 — accepted mixed state for one round, named:** English track headers next to Georgian **group** headers (fold title, group Solo, group aria-label) until V-0.4c; detail panel (V-0.4e); default track names in sentences (V-0.4d); library, dock and route (V-0.5); the meter/Master titles (V-0.4c).
- **R6 — every text and its matchers change in the same round**, including aria-label role-name regexes and attribute selectors (`aria-label*=`, `aria-label="…"`), not only titles.
- **Folded in (owned, low cost):**
  - **gate-137 finding 1 / GATE137-SELECTED-CLIP-HALF-MOVED:** the selected-clip line's visible tail and its `title` come from one helper (§1.2);
  - **gate-138 finding 1:** doc 114 status → Completed;
  - **gate-138 finding 2 = C-R138-01:** doc 113 double "selector".
  - **Not folded:** gate-138 #3 (`fadePreview` unit via `seconds()`) and #4 (singular `clips`) change existing objects' code → stay `deferred_low_polish`; #5 (`data-testid` for trim handles) and A's Architecture note → checkpoint addendum; #6 (trim strips not keyboard-reachable) → Low (a keyboard path exists: time-selection fields + Ctrl+E split + Delete), `deferred_low_polish`.

## 1. What changes (user-visible)
**Text only.** None of these change: any handler, condition, threshold, key binding, drag/drop decision, Solo/Mute/fold logic, any `data-testid`, class name, the glyphs (`▸`, `▾`, `＋`, `·`), or the time formats.

### 1.1 The English map (exact text; A may not reword it. If a line seems wrong, A reports it and B rules)
All new keys go into `studioLaneStrings`. `{…}` are values passed by the caller.

| ID | Source line(s) in `ArrangementLane.tsx` | Key | Exact English |
|---|---|---|---|
| LN1 | l.58 `VIDEO_MIX_LABEL` | `videoMixLabel` | `Original video sound` (so the video track reads `Mute — Original video sound`, `Volume — Original video sound`) |
| LN2 | l.59 `VIDEO_IMPORT_LABEL` | `videoImportLabel` | `＋ Your own video` |
| LN3 | l.60 `TRACK_FOLD_TITLE` | `foldTitle` | `Fold / unfold` |
| LN4 | l.620 | `soloLabel(name: string)` | `Solo — {name} (Ctrl/Cmd+click = add to solo)` |
| LN5 | l.621 | `soloTitle` | `Solo (Ctrl/Cmd+click = add to solo)` |
| LN6 | l.676 | `foldLabel(name: string)` | `Fold or unfold — {name}` |
| LN7 | l.697 | `activeTrackLabel(name: string)` | `{name} — set as the active track` |
| LN8 | l.697 (selected branch) | `selectedSuffix` | `, selected` |
| LN9 | l.701 | `activeBadge` | `· active` |
| LN10 | l.711 | `videoImportTitle` | `Your own video` |
| LN11 | l.765 | `panResetLabel(name: string)` | `Reset Pan to centre — {name}` |
| LN12 | l.818 | `videoOriginalSound` | `Original sound` |
| LN13 | l.853 | `noVideo` + `videoEmptyHint` | `No video` and `use “＋ Your own video” or drop a file here`; caller renders `` `${noVideo} — ${videoEmptyHint}` `` → `No video — use “＋ Your own video” or drop a file here` |
| LN14 | l.864 (video lane) | `dropVideoHere` | `Drop the video here` |
| LN15 | l.864 (audio lane) | `videoNotOnAudioTrack` | `Video is not added here — drop it on the video track` |
| LN16 | l.889 | `ghostAudioOnVideoTrack` | `Audio is not added to the video track` (caller keeps the ` · ` prefix) |
| LN17 | l.891 | `ghostNotLoaded` | `This sound has not loaded yet` |
| LN18 | l.893 | (reuse) `studioLaneMoveStrings.noRoom` | `No room here` |
| LN19 | l.951 | `audioDecoding` | `Sound is decoding…` |
| LN20 | l.953 | `audioUnreadable` | `Sound could not be read` |
| LN21 | l.954 | `audioNone` | `No sound` |
| LN22 | l.1001 | (reuse) `studioClipStrings.seconds` + `studioEditStrings.allTracks` | rendered `{start} – {end} · {x.xxx} s · all tracks` |
| LN23 | l.1013 | `heightLabel(name: string)` | `Height — {name}` |
| LN24 | l.1017 | `foldedValueText(height: number)` | `folded · {height} px` (unfolded stays `${height} px` in the caller) |

**StudioWorkspace l.331 selector** → `'[data-testid="arrangement-track-header"] button[aria-label*="— set as the active track"]'`.

**Exact rendered text that pins and C rows must match (examples):**
- Track name button: `მუსიკა — set as the active track`; selected: `მუსიკა — set as the active track, selected`; visible badge `· active`.
- Fold button: aria-label `მუსიკა — …` is **not** used; it is `Fold or unfold — მუსიკა`, title `Fold / unfold`.
- Solo: `Solo — მუსიკა (Ctrl/Cmd+click = add to solo)`, title `Solo (Ctrl/Cmd+click = add to solo)`.
- Video track: `Volume — Original video sound`, header text contains `Original sound`, import button `＋ Your own video`.
- Ghosts: `00:05.000 · No room here`, `00:09.000 · Audio is not added to the video track`, `00:07.000 · This sound has not loaded yet`.
- Height separator: `Height — SFX`, valuetext `folded · 80 px`.
- Local constant names stay (`VIDEO_MIX_LABEL`, `VIDEO_IMPORT_LABEL`, `TRACK_FOLD_TITLE`) and take their values from the module.

### 1.2 Selected-clip line (gate-137 finding 1)
- `strings.ts`: add a **module-level, not exported** helper `selectedClipDetailText({ start, length, offset })` returning `` ` · start ${start} · length ${length} · source offset ${offset}` `` (leading space). Add the key **`selectedClipDetail`** to `studioWorkspaceStrings` (calls the helper) and make `selectedClipTitle` return `` `Clip: ${title}${selectedClipDetailText(…)}` ``. Its output is byte-identical to today (ST31's existing samples must stay green unchanged). This is the only allowed change to an existing object.
- `StudioWorkspace.tsx` l.2576–2579: the inline `· start{' '} … · source offset{' '}` tail becomes `{studioWorkspaceStrings.selectedClipDetail({ start, length, offset })}` after the `<span>{selectedTitle}</span>`. `textContent` of `arrangement-selected-clip` must stay byte-identical.

**Glossary additions (d29z104):**
| Georgian | English | Source |
|---|---|---|
| `დაკეცვა / გახსნა` | Fold / unfold | Live 12 §6.9 “unfold its track”, “Unfold Track button” |
| `აქტიური ხაზის არჩევა` | set as the active track | CZABA label |
| `მონიშნული` | selected | glossary |
| `Ctrl/Cmd+click ამატებს` | Ctrl/Cmd+click = add to solo | CZABA label (`click = playhead` shape) |
| `ორიგინალი ხმა` | Original sound | CZABA label (D-29z49 video sound) |
| `საკუთარი ვიდეო` | Your own video | reuses `studioVideoStrings.audioFileRejected` “your own video” |
| `სიმაღლე` | Height | Live §6.9 “Adjusting an Unfolded Track’s Height” |
| `დაკეცილია` | folded | glossary |
| `ყველა ხაზი` | all tracks | existing `studioEditStrings.allTracks` |

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/lib/arrangement/strings.ts` | Append `studioLaneStrings` (§1.1) after `studioClipStrings`; §1.2 helper + `selectedClipDetail` + `selectedClipTitle` body. Other objects, keys and values byte-identical. No import. |
| `app/components/arrangement/ArrangementLane.tsx` | A new strings import, plus exactly the §1.1 lines. Biome-style wraps allowed. |
| `app/components/arrangement/StudioWorkspace.tsx` | l.331 selector and l.2576–2579 (§1.2). Nothing else (the strings import already exists, l.~80–92). |
| `app/lib/arrangement/__tests__/strings.test.ts` | Import specifiers; delete `WORKSPACE_TRACK_HEADER_SELECTOR_LINE`; ST33: retitle to `ST33: the new texts, waveform-zoom.ts and StudioWorkspace have no Georgian and no «»` and change only `expect(georgianLines).toEqual([WORKSPACE_TRACK_HEADER_SELECTOR_LINE])` → `toEqual([])`; ST31: add `'selectedClipDetail'` to the key list and one sample (§3.1). New `describe('V-0.4b lane strings')` with ST36–ST37. |
| The 12 pin files of §0 | Exactly the listed lines. No other line, no new `it`, `it` counts unchanged. |
| `docs/.../113-studio-v0-workspace-strings.md` | l.21 and l.74: `track-header selector (l.331)-ის selector` → `track-header selector (l.331)` (C-R138-01). Nothing else. |
| `docs/.../114-studio-v0-clip-strings.md` | l.4 → `Completed (A-ის შემოწმებები მწვანეა რაუნდ 138-ში; C round 138 — PASS, browserVerified; gate 138 — 1d4df51)`; l.72 last sentence → C round 138 PASS; delete the C round 138 TODO line (l.76). Locate these lines by content (`grep -n "C round 138"`), not only by number. |
| **new** `app/lib/arrangement/__tests__/lane-strings-ui.test.tsx` | LSU1–LSU6 (§3.3) |
| **new** `docs/implementation/2026/quarter-IV/115-studio-v0-lane-strings.md` | Georgian, `docs/implementation/TEMPLATE.md` sections; status says C round 139 is still to come. |

- **Protected (never touch):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, `app/routes/account.downloads.tsx`, `download-routes.test.ts`, everything in `backlog.json` `global_forbidden_files`.
- **Pin rule:** each replaced pin is a **hand-written English literal** with the same matcher (`toBe` stays `toBe`, `toContain` stays `toContain`, a RegExp stays a RegExp with the same anchors, a selector keeps its operator `*=` / `=`). No pin imports the module value it checks. Fixture track names stay.
- **Stop rule:** if the pre-edit grep finds a Georgian V-0.4b text (§1.1) in a non-granted file other than the R5 list, or a pin line differs from §0, A stops and reports. A does not widen scope. `delete-selection-ui` l.517 `/all tracks$/` must still find exactly the elements it found before (the overlay); if the count changes, stop and report.

## 3. A — tests and mutations
### 3.1 `strings.test.ts` (35 → 37 `it`s)
- **ST31 (edit):** key list gains `selectedClipDetail`; `ws.selectedClipDetail({ start: '00:02.000', length: '00:08.000', offset: '00:01.000' })` equals ` · start 00:02.000 · length 00:08.000 · source offset 00:01.000` (hand-written), and the existing `selectedClipTitle` sample is unchanged.
- **ST36:** exact key set of `studioLaneStrings`; every plain string equals its §1.1 literal; every formatter returns the exact English for Latin samples (`soloLabel('Drums')`, `foldLabel('Drums')`, `activeTrackLabel('Drums')`, `panResetLabel('Drums')`, `heightLabel('SFX')`, `foldedValueText(80)`).
- **ST37 (per-file scans):** `studioLaneStrings` values and all sample outputs have no Georgian and no `«»`; `ArrangementLane.tsx` (comments stripped) has **no** Georgian line and no `«»`. (ST33 now pins StudioWorkspace at 0.)

### 3.2 Pin replacements
Each §0 pin gets the §1.1 English with fixture names unchanged. Examples: role-name regexes → `` new RegExp(`^${escapeRegExp(name)} — set as the active track`) ``; `track-pan` l.718 → `'მუსიკა — set as the active track'`; `track-groups-ui` l.422 → `'მუსიკა — set as the active track, selected'`; `fader-*` → `input[aria-label="Volume — Original video sound"]`; `track-volume-db` l.41 → `'Original video sound'`; `track-layout` l.285/286 → `'Fold or unfold — მუსიკა'` / `'Fold / unfold'`, l.295 → `'Solo — მუსიკა (Ctrl/Cmd+click = add to solo)'`, l.311/316 → `'Original sound'`, l.312/313/317 → `'＋ Your own video'`, l.346 → `'Height — SFX'`, l.1123 → `'Height — მუსიკა'`, l.428/834 → `'folded · 80 px'`; ghosts per §1.1; `delete-selection-ui` → `/all tracks$/` and `'00:03.000 – 00:05.000 · 2.000 s · all tracks'`.

### 3.3 New `lane-strings-ui.test.tsx` (real `StudioWorkspace` in jsdom; copy the mount harness of `track-layout.test.tsx`/`clip-strings-ui.test.tsx`, do not import them)
- **LSU1:** the active track's name button shows `· active` (textContent ends with it); the compact video import button has `title` `Your own video` and aria-label `＋ Your own video`.
- **LSU2:** the Pan reset button aria-label is `Reset Pan to centre — მუსიკა`.
- **LSU3:** an empty video lane shows exactly `No video — use “＋ Your own video” or drop a file here`.
- **LSU4:** a file `dragenter`/`dragover` (with `Files` in `dataTransfer.types`) on the video lane shows `Drop the video here`; on an audio lane shows `Video is not added here — drop it on the video track`.
- **LSU5:** a video clip whose source audio state is `decoding` / `error` / `none` renders the clip note `Sound is decoding…` / `Sound could not be read` / `No sound` (drive the state through the same path `video-import-status-ui.test.tsx` uses; if one state cannot be reached in jsdom without non-granted changes, A reports it instead of faking it).
- **LSU6:** the selected-clip line: `textContent` of `arrangement-selected-clip` equals its `title` and equals `Clip: {title} · start … · length … · source offset …` for a known clip.

### 3.4 Forward rule (GATE130-S3)
Every LN key (and the §1.2 key) has at least one hand-written UI literal in a pin file or in LSU1–6. A lists the key → test mapping in its report.

### 3.5 Mutations (each turns the named tests red; restore and check by sha256)
| ID | Mutation | Must turn red |
|---|---|---|
| m61 | LN7 `set as the active track` → `set active track` | ST36, the role-name regex files (e.g. `track-volume-db`, `track-groups-ui`), `track-pan` l.718 |
| m62 | StudioWorkspace l.331 selector back to the Georgian text | ST33, and any UI test that uses track-row focus/rename through `trackRowNameButton` (A names which) |
| m63 | the `selected ? selectedSuffix : ''` branch inverted | `track-groups-ui` l.422 or `track-pan` l.718 |
| m64 | LN18 ghost uses a new literal `No space here` instead of `studioLaneMoveStrings.noRoom` | `grid-snap-loop-drop` l.441/551 |
| m65 | LN22 overlay unit `s` → `sec` (inline in the Lane) | `delete-selection-ui` l.520 |
| m66 | LN14/LN15 ternary branches swapped | LSU4 |
| m67 | §1.2 `selectedClipDetail` drops ` · source offset …` | ST31, LSU6 |
| m68 | a Georgian letter added inline to Lane l.701 | ST37 |

## 4. A — checks (speed rules)
- At the start: the frozen list, the 18 start hashes and the start copies all OK. `git status --short` empty.
- Pre-edit grep for every §1.1 Georgian text (full and partial phrases) in `app/**` and `e2e/**`, saved to `a-round-139/pre-grep.txt`.
- `npm run typecheck` and `npm run lint` exit 0. Read-only `npx biome check` on the changed code and test files: 0 diagnostics.
- `npx vitest run` on: `strings`, the 12 pin files, `lane-strings-ui`, and neighbours `clip-strings-ui`, `workspace-strings-ui`, `video-import-status-ui`, `track-volume-db`, `grid-snap-clip-edges`, `status-announcement-ui`, `detail-panel`, `render-budget`, `library-preview`. Save to `a-round-139/vitest.json`.
- Mutations m61–m68 per §3.5.
- The code-reviewer (more than 3 files change). Its Architecture note goes to B.
- **Not run:** the full suite, `npm run verify`, build, e2e (the gate does these).
- At the end: `git status --short` shows exactly the 18 ` M` + 2 `??` granted paths (if a pin file needed no change, say so). Frozen list OK. Protected `git diff 1d4df51` empty. End sha256 of the changed paths → `a-round-139/end-sha256.txt`. No commit, stash, checkout, install, `--write` or `check:fix`.

## 5. C — rows
Real Playwright Chromium at **1440×900 and 1280×720** on `http://127.0.0.1:5173/studio-lab`, fresh context per session. Use `data-testid`s and the **new English** labels (the round-138 tool used the Georgian fold aria-label; it is now `Fold or unfold — {track}`). State Snap at the start of each session (default off).

| Row | Start state → action → expected |
|---|---|
| T139-TARGETED | Run A's named vitest list; counts equal A's |
| SOURCE-SCOPE | Only granted paths changed; frozen list OK at start and end; end hashes equal `a-round-139/end-sha256.txt`; protected diff vs `1d4df51` empty; no source change during C's phase |
| AN-REVIEW | `diff -u` against `b-round-138/r139-granted-start/`: only §1.1/§1.2 lines and the import change; no handler, condition, class or testid change; pins hand-written with the same matchers/anchors/operators; strings.test changes only the import, the constant removal, ST31 key+sample, ST33 retitle + `[]`, ST36–37; docs 113/114 only the named lines |
| TRACK-SELECT | Click the music name button: it gets `aria-pressed=true`, shows `· active`; aria-label `{track} — set as the active track`. Ctrl/Cmd+click stems: both selected; music aria-label ends `, selected`. Ctrl+G groups them (real result: a group row appears) — this proves the `trackRowNameButton` selector path still works |
| TRACK-FOLD | `data-testid="arrangement-track-fold"` on stems: `title` `Fold / unfold`, aria-label `Fold or unfold — სტემები`; click → `aria-expanded=false`, clips hidden, height separator valuetext `folded · {h} px`; click again → unfolded, valuetext `{h} px` |
| SOLO | Solo on music: aria-label/title per LN4/LN5. **Behaviour:** Ctrl/Cmd+click Solo on stems → both soloed (`aria-pressed=true` on both); a plain click on SFX Solo → only SFX soloed. Real audio: with music soloed, the output-tap RMS while playing a region where only stems has signal is ≥ 20 dB below the unsoloed level (paired, same position) |
| VIDEO-HEADER | Video header text contains `Original sound`; `Volume — Original video sound` slider exists and moving it changes `aria-valuetext`; the `＋ Your own video` button opens a file chooser (`page.waitForEvent('filechooser')`); compact density shows `＋` with title `Your own video` |
| EMPTY-VIDEO | With no video clip: the lane shows `No video — use “＋ Your own video” or drop a file here` |
| FILE-DRAG-HINT | Synthetic `dragenter`/`dragover` with a `Files` DataTransfer over the video lane → `Drop the video here`; over music → `Video is not added here — drop it on the video track`; `dragleave` removes it |
| LIBRARY-GHOST | Drag a library sound over: a free spot (no suffix), an occupied spot → `{time} · No room here` with `data-blocked=true`, the video lane → `{time} · Audio is not added to the video track`. If a not-loaded source can be produced in the browser, check `· This sound has not loaded yet`; otherwise report that state as covered by the unit pin only (inconclusive, not PASS). On release over the occupied spot the status starts with `No room here` |
| ALL-TRACKS-OVERLAY | Make a range, Ctrl+Shift+L: overlay label `{start} – {end} · {x.xxx} s · all tracks`, with the measured length |
| HEIGHT | Separator aria-label `Height — {track}`; ArrowDown/ArrowUp change `aria-valuenow` and the real row height by the same px |
| PAN-RESET | Move music Pan off centre, then the reset button (aria-label `Reset Pan to centre — მუსიკა`) → Pan readout `C`, button disabled |
| AUDIO-NOTE | Import a real small video file (generate one in the tool folder, e.g. with a canvas+MediaRecorder or a committed fixture if one exists) and report which clip note states are observable (`Sound is decoding…` while decoding, `No sound` for a silent-track-less file). Unobservable states → inconclusive with the reason, covered by LSU5 only |
| SELECTED-CLIP | Select a clip: `arrangement-selected-clip` `textContent` equals its `title` and reads `Clip: {title} · start … · length … · source offset …` with the clip's real values; move it and the line updates |
| GEO-COUNT | At every step count Georgian in the track headers (all attributes + text), lane hints, ghosts, overlay, separators, status line, Undo/Redo titles, selected-clip line. Expect **0** after the named subtractions (R5): track names, group header, detail panel, library, dock, demo badge, meter/Master. List every subtraction |
| LAYOUT | S0/S1/S2 (round-130 harness) against round 138: any change >1 px only from a granted text width (header badge, hints, overlay) |
| REG-138 | One sample each: CLIP-MOVE status + `Undo: Move clip`, and RANGE-BADGE `00:03.000 – 00:05.000 · 2.000 s` |
| G139-3 (alone, last) | `/studio-lab` shows the workspace and demo badge. `/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`. `GET /api/studio-token?…` → 401. Fake-Bearer 403 BLOCKED (backend unavailable in cloud) |
| PX-NET / REG-HYD | 0 forbidden requests, 0 Authorization headers, 0 hydration errors, 0 pageerror (known cart noise expected) |

Gate rows (C does not claim them): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## 6. Ableton source
Live 12 Reference Manual, Arrangement View, B's saved capture `b-round-133/live/arrangement-view.txt` (re-grepped 2026-10-24 for this task).

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Fold / unfold a track | §6.9 Selecting Clips and Time | “unfold its track by clicking the button next to the track name”; “selected tracks can also be unfolded by pressing the U key” | Same idea; label `Fold / unfold` is CZABA's. CZABA's U applies to groups (existing behaviour, not changed here) | TRACK-FOLD |
| Track height | §6.9 “Adjusting an Unfolded Track’s Height” | “dragging the split line below the Unfold Track button, or … Alt +/- (Win) / Option +/- (Mac)” | CZABA: drag the separator or arrow keys on the focused separator (deliberate difference in keys) | HEIGHT |
| Solo, Ctrl/Cmd+click adds | not in the saved capture (Mixer chapter) | **unconfirmed** | CZABA rule; no Live claim this round | SOLO |
| Active track, video header, drop hints, ghosts | none | **unconfirmed / not applicable** | CZABA labels | the rows above |

C rates “CZABA requirement met” and “Ableton correspondence” separately.

## 7. Evidence and reporting
- C writes `c-round-139.md` and `c-round-139.json` as it goes (`taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` with subtractions, `measurements`, `invalidRuns`, `notesForB`). Evidence under `c-round-139/{tools,out,shots}/`. No `store/` writes.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`; an honestly unobservable state is `inconclusive` with its reason.
- A writes `a-round-139.md` as it goes: start checks, pre-grep, changed files, `it` counts before/after, test results, mutations, reviewer verdict and Architecture note, shell writes, end state, deviations and known gaps.

## 8. Outcome, fixed in advance (B at round 140 planning)
| Condition | Round 140 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.4b fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.4b → `c_pass`, then `c_pass_published` after the gate. Round 140 = **V-0.4c** (ArrangementClipEnvelope with `historyUnchanged('Envelope')`, ArrangementGroupHeader with the R4 reuse, TrackMeter, Master), re-measured first. If root's strings-split checkpoint result arrives first, B applies it as its own bounded round before V-0.4c |

At every planning B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Role-name matchers:** 6 test files find the track name button by a `^… — აქტიური ხაზის არჩევა` regex; a label change without them makes those tests fail to find the button (not test the wrong thing). m61 proves it.
- **`trackRowNameButton` (StudioWorkspace l.323–333):** used for keyboard focus handoff and group rename; the selector and the aria-label must change together (m62, TRACK-SELECT).
- **`/all tracks$/` regex:** the workspace range readout also contains `all tracks ·`, but it does not end with it; A confirms the match count is unchanged.
- **Width:** `· active` and `Original sound` are about the same width; the hints are in a `max-w-md` box. LAYOUT checks it.
- **Undo labels / status:** no status sentence changes this round (the ghost reuses existing status wording).
- **Architecture:** strings-split checkpoint request still open and non-blocking (round-138 addendum: gate-138 Architecture note and A's `data-testid` proposal).
- **Commit readiness:** after C PASS, root may publish V-0.4b as an interim unit.
