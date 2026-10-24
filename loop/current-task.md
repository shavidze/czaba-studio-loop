# CURRENT TASK — Round 142: VISUAL-A V-0.4e — Clip Detail panel, range/Clip Gain messages and library kind/folder labels in English

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 141)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). Module contract: `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract` + the R6 clarification of round 133 (leaf module, one object per area, plain strings + small pure formatters, branches stay in the caller, existing exported constants keep their names and take their values from the module).
- **Previous task:** `tasks/round-141.md` (exact copy of the round-141 `current-task.md`, sha256 `c45b533e…`). Rationale: `b-round-141.md`. Decision record: **D-29z107** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: commit `6e9f9b1e97d67703ba34e8b2a260a0a5215c3506`** (gate 141 published on both remotes; HEAD). Tree **clean** at planning (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-141-r142-tree-sha256.txt`, **941 entries** = `git ls-files -co --exclude-standard` (961) minus the 20 existing grants. Grants: `b-round-141-r142-grants.txt` (22 lines; the last 2 are new files). `sha256sum -c --quiet` OK at planning, run from `store/`.
- **Start hashes of the 20 existing grants:** `b-round-141-r142-granted-start-sha256.txt`. **Start copies:** `b-round-141/r142-granted-start/` (paths relative to `store/`; `sha256sum -c` OK there). A checks both first; any difference → A stops and reports.
- **Measured pin lines:** `b-round-141-r142-pin-lines.txt` (**56 lines in 13 test files**, listed in §0).
- **Browser baseline (B probe at `6e9f9b1`, read-only, real Chromium):** `b-round-141/out/detail-baseline-6e9f9b1.json` + `b-round-141/shots/{none,single,multi,video,videomulti}-{1440,1280}.png`. Tool: `b-round-141/tools/detail-probe.cjs`. C uses it as the LAYOUT baseline (§5).

## 0. Why this round (D-29z107)
- **Round 141: C PASS**, `browserVerified` = `realVerified` = true. All rows passed at 1440 and 1280. Group Mute dropped real audio by 179 dB and unmute restored it within 0.03 dB. GEO-COUNT was net 0 and LAYOUT showed 0 px movement. Gate 141 published `6e9f9b1` (verify 166 files / 2481 tests, build OK, review 8/10). **V-0.4d is done.** One new Low, C-R141-01 (nested `Drums` truncated to `Dru…` at 1280), went to `deferred_low_polish`.
- `tasks/round-141.md` §8 set this step: C PASS → **V-0.4e**, re-measured first. Checks at planning:
  - The regression is due on/after 2026-10-27; today is 2026-10-24, so not yet.
  - No Critical, High or Medium finding is open.
  - `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist.
  - There is no strings-split checkpoint result yet; it does not block.
- **B's measurement at `6e9f9b1`** (non-comment lines containing Georgian):
  - `ArrangementDetailPanel.tsx`: **38**. Lines 50–57 and 62–66 are constants; l.125 is the range-applied status; l.386/410/449/566/611 are `Clip Gain უცვლელია: …`; l.648–676 are info labels; l.703/712/719/728/748 are range labels and the apply button; l.853 is the reset aria-label; l.1081 is the header count; l.1104/1108/1130/1134 are the separator and toggle.
  - `panels.ts` l.8: `DETAIL_RANGE_INVALID_MESSAGE` (exported; used by the detail panel l.353).
  - `clip-gain-multi.ts` l.113: `formatClipGainMembersStatus`.
  - `library.ts` l.8–9 (`LIBRARY_KIND_LABELS`) and l.14–15 (`LIBRARY_FOLDER_LABELS`).
  - Total **44 lines in 4 files**. After this round, the only Georgian source left in the Studio is the V-0.5 area: `collection.ts` 19, `ArrangementLibrary.tsx` 19, `studio-lab-demo.ts` 18, `ArrangementVideoDock.tsx` 18, `ArrangementLibraryPreview.tsx` 8, the `studio-lab.tsx` meta title 1, and context l.3468 1.
- **Pins (56 lines in 13 files):**
  - detail-panel.test 12
  - detail-panel-fit 7 (incl. l.327 `ხაზი SFX` and l.331 `ხაზები მუსიკა, SFX`, where only the label word changes; `მუსიკა`/`SFX` are fixture track names and stay)
  - clip-gain 6
  - detail-panel-polish 6
  - clip-gain-multi 5
  - detail-panel-reason 5
  - library.test 4 (l.44/48/49 folder labels, l.71 kind query)
  - clip-gain-fader 3
  - fader-guards 3
  - status-announcement-ui 2
  - panels.test 1
  - pending-status 1
  - self-disabling-focus 1

  `e2e/` has 0. **Not pins (excluded on purpose):** `collection.test` l.379/389, `collection-load-status` l.53 and `purchased-collection-ui` l.36 match `დეტალები` only inside the V-0.5 load-error message, so they stay. Every other `მუსიკა` / `სტემები` in tests is fixture track data (D-29z103 R4).
- **`group.count` is always ≥ 2.** `StudioWorkspace.tsx` l.2138 returns `null` below 2. The plural-safe formatter still handles 1 (R6).
- **`library.ts` is not pure copy.** `LIBRARY_KIND_LABELS` is part of the search haystack (`matchesLibraryQuery` l.113). English labels change which queries match (R8, §1.3).

### Rulings D-29z107
- **R1 — one round, one owner.** The detail panel, panels.ts and clip-gain-multi.ts are one surface (the detail panel shows all three messages). The library labels get their own section (§1.3), mutation and C row because they carry the only behaviour change. The size (44 source lines, 56 pins in 13 files, 1 new test file) is comparable to round 138 (25 + ~100 lines in 17 files) and round 140 (16 files).
- **R2 — where the texts live.**
  - A new object **`studioDetailStrings`** is appended as the **last** export of `strings.ts`.
  - The library labels are appended as the last 4 keys of the existing **`studioLibraryStrings`**: `kindMusic`, `kindStem`, `folderMusic` and `folderStems`. `sfx: 'SFX'` stays the Latin literal it already is.
  - Existing names keep their export, name and type:
    - `LIBRARY_KIND_LABELS` and `LIBRARY_FOLDER_LABELS` (`Record<WorkspaceSourceKind, string>`) take their values from the module;
    - `DETAIL_RANGE_INVALID_MESSAGE` becomes `studioDetailStrings.rangeInvalid`;
    - the module-local `DETAIL_*` constants in the detail panel keep their names and are defined from the module (smallest diff).
  - `panels.ts`, `library.ts` and `clip-gain-multi.ts` may import `strings.ts`. It is a leaf and imports nothing, so there is no cycle.
- **R3 — the multi-clip note is not a "group".** l.53 describes a selection of several clips. Since round 141, `Group N` is a Group Track, so calling the selection a "group" would collide. The text says **"The selected clips …"**. This deliberately departs from the round-141 §8 hint ("role word → group"). `data-testid="arrangement-detail-group"` stays.
- **R4 — vocabulary.**
  - Panel = **collapse/expand**, the library/dock wording in `studioVideoStrings`. A track is **fold** (`studioLaneStrings`).
  - Per the glossary: `ხაზი` → Track, `კლიპი` → clip, `მონიშვნა` → time selection.
  - The apply button reads **`Set selection`** (a bare "Select" would be ambiguous next to "Select a clip first").
- **R5 — `Clip Gain უცვლელია: X.`** (5 sites) becomes one formatter, `clipGainUnchanged(value)` → `Clip Gain unchanged: +3.0 dB.`. `studioClipStrings.historyUnchanged` is **not** reused: it drops the value and is a different sentence.
- **R6 — plural-safe counts.** `clipCount(count)` → `1 clip` / `2 clips`, following the `studioEditStrings` `count === 1` pattern. It is used for the header label (l.1081) and the group block (l.669). `clipGainMembers(count, range)` → `Clip Gain: 2 clips — +15.0 … +22.0 dB.`.
- **R7 — pending invariant.** `DETAIL_CLIP_GAIN_PENDING_HINT = FULL_TEXT.slice(LABEL.length)` stays. The English full text **starts with** the exact English label (`Unsaved` / `Unsaved — Enter saves, Esc reverts`), so the sr-only hint is ` — Enter saves, Esc reverts`. This is pinned (DPS3, ST42).
- **R8 — library search follows the labels.**
  - After the change, the queries `music` / `stem` / `stems` match by kind (case-insensitive).
  - The Georgian kind words `მუსიკა` / `სტემი` no longer match **by kind**. Titles and collection labels are unchanged data, so a Georgian title word still matches.
  - This is accepted because the UI is English (VISUAL-A M2). `library.test` l.71 `'სტემი პადი'` → `'stem პადი'`; `პადი` is the demo title, which is data.
- **R9 — accepted mixed state for one round, named:**
  - the library panel's own copy and aria-labels (`ArrangementLibrary.tsx` 19, `ArrangementLibraryPreview.tsx` 8; for example `ბიბლიოთეკა`, `აქტიური ხაზი: …`);
  - the collection label `Middle East · შეძენილი სტემები`, the demo badge, the load statuses and the demo source titles (`collection.ts`, `studio-lab-demo.ts`);
  - the video dock;
  - the route meta title and context l.3468.

  All of these are **V-0.5**. The detail panel's selected-clip **title** is source-title data (for example `Middle East — საჯარო preview`), so it also stays until V-0.5.
- **R10 — fold-ins and ratifications.**
  - Doc 117 status (gate-141 #5).
  - ST39 back to an exact count (gate-141 #1; B's round-141 `>=` spec weakened it).
  - A's round-141 deviations 1–4 are ratified, including the DS2 codepoint-built regex: C verified it equals the literal, the reviewer endorsed it, and it keeps the `ჯგუფი` grep empty.
  - Gate-141 #2 (SSR `console.error` spy) and #3 (ST40 meta-title pin) become **V-0.5 forward constraints**. V-0.5 owns that route and those tests; this round does not.

## 1. What changes (user-visible)
The Clip Detail panel at the bottom of `/studio-lab` reads entirely in English, apart from the selected clip's own source title (data, R9). Its status messages (range applied, range invalid, Clip Gain invalid/unchanged/multi-clip) are English. The library rows show the kind chip `Music` / `Stem` / `SFX`, and the folder tree shows `Music` / `Stems` / `SFX`. Typing `music` or `stem` in the library search filters by kind.

Nothing else changes: no handler, condition, numbering rule, key binding, gesture, history behaviour, Clip Gain math, panel size or step, `data-testid`, class or glyph. The `▸`/`▾` glyphs stay.

### 1.1 `studioDetailStrings` (new, appended last in `strings.ts`; exact values)
| Key | Value (exact) | Replaces |
|---|---|---|
| `panelTitle` | `Clip details` | l.50 |
| `nothingSelected` | `Nothing selected` | l.51 |
| `noSelectionHint` | `Select a clip to see its details` | l.52 |
| `multiClipNote` | `The selected clips move together · Delete deletes them · Ctrl+D duplicates them` | l.53 (R3) |
| `videoPlaceholder` | `Video clip · no waveform` | l.54 |
| `rangeMultiReason` | `A time selection is set on one clip — select only one` | l.55 |
| `noneReason` | `Select a clip first` | l.56 |
| `sourceUnchanged` | `The source file stays unchanged` | l.57 |
| `clipGainMultiReason` | `Clip Gain works on audio clips only — remove the video from the selection` | l.62 |
| `clipGainVideoReason` | `A video clip has no Clip Gain — for its sound use the track Volume/Mute` | l.63 |
| `clipGainInvalid` | `Clip Gain: enter a number in dB (−60…+24).` | l.64 (keep the `−` U+2212 and `…` U+2026 exactly as at baseline) |
| `pendingFull` | `Unsaved — Enter saves, Esc reverts` | l.65 |
| `pendingLabel` | `Unsaved` | l.66 (R7) |
| `rangeApplied` | `({ start, end, track }) => \`Time selection: ${start} — ${end} · ${track}.\`` (named object: 3 strings) | l.125 |
| `clipGainUnchanged` | `(value: string) => \`Clip Gain unchanged: ${value}.\`` | l.386/410/449/566/611 (R5) |
| `clipCount` | `(count: number) => count === 1 ? '1 clip' : \`${count} clips\`` | l.669, l.1081 (R6) |
| `clipGainMembers` | `(count: number, range: string) => \`Clip Gain: ${count === 1 ? '1 clip' : \`${count} clips\`} — ${range}.\`` | clip-gain-multi l.113 |
| `trackLabel` | `Track` | l.648 |
| `tracksLabel` | `Tracks` | l.671 |
| `startLabel` | `Start` | l.652, l.674 |
| `lengthLabel` | `Length` | l.654, l.676 |
| `sourceOffsetLabel` | `Source offset` | l.660 |
| `rangeFromLabel` | `From, s` | l.703 |
| `rangeToLabel` | `To, s` | l.719 |
| `rangeStartLabel` | `Time selection start (seconds)` | l.712 aria-label |
| `rangeEndLabel` | `Time selection end (seconds)` | l.728 aria-label |
| `applyRange` | `Set selection` | l.748 (R4) |
| `clipGainResetLabel` | `Reset Clip Gain (0 dB)` | l.853 aria-label |
| `heightLabel` | `Details height` | l.1104 aria-label |
| `collapsedValueText` | `(height: number) => \`collapsed · ${height} px\`` | l.1108 (the open branch `${openHeight} px` stays in the caller; R4) |
| `expandLabel` | `Expand details` | l.1130 (collapsed branch) |
| `collapseLabel` | `Collapse details` | l.1130 (open branch) |
| `expandText` | `Expand ▸` | l.1134 |
| `collapseText` | `Collapse ▾` | l.1134 |
| `rangeInvalid` | `The time selection must stay inside the clip, and its end must be after its start.` | panels.ts l.8 (`DETAIL_RANGE_INVALID_MESSAGE = studioDetailStrings.rangeInvalid`) |

Key order in the object follows this table. The ternaries for `isCollapsed` and the `selection ? … : group ? … : …` branches stay in the caller (R3 of D-29z103). In JSX, the label spans keep their exact markup and classes; only the text child becomes `{studioDetailStrings.…}`, and the trailing `{' '}` separators stay.

**Exact rendered examples (for pins and C):**
- header `Nothing selected` / `2 clips`
- status `Time selection: 00:03.500 — 00:07.250 · Music.`
- status `Clip Gain unchanged: 0.0 dB.`
- status `Clip Gain: 2 clips — +15.0 … +22.0 dB.`
- the separator `aria-valuetext` reads `collapsed · 130 px` when collapsed and `130 px` when open
- toggle aria-label `Collapse details`, toggle text `Collapse ▾`
- pending: `<p title="Unsaved — Enter saves, Esc reverts">Unsaved<span class="sr-only"> — Enter saves, Esc reverts</span></p>`

### 1.2 Source edits outside `studioDetailStrings`
| ID | File / line | Before | After |
|---|---|---|---|
| DD1 | `ArrangementDetailPanel.tsx` (all 38 lines) | Georgian literals | values and calls from `studioDetailStrings` per §1.1. One new import line from `~/lib/arrangement/strings` |
| DD2 | `panels.ts` l.7–8 | Georgian literal | `export const DETAIL_RANGE_INVALID_MESSAGE = studioDetailStrings.rangeInvalid;` + the import |
| DD3 | `clip-gain-multi.ts` l.113 | `` `Clip Gain: ${span.clipIds.length} კლიპი — …` `` | `studioDetailStrings.clipGainMembers(span.clipIds.length, formatClipGainRange(span.minDb, span.maxDb))` + the import |

### 1.3 Library labels (behaviour-adjacent, R8)
| ID | File / line | Before | After |
|---|---|---|---|
| LB1 | `strings.ts` `studioLibraryStrings`, 4 keys appended last | — | `kindMusic: 'Music'`, `kindStem: 'Stem'`, `folderMusic: 'Music'`, `folderStems: 'Stems'` |
| LB2 | `library.ts` l.8–9 | `'მუსიკა'`, `'სტემი'` | `studioLibraryStrings.kindMusic`, `studioLibraryStrings.kindStem` (`sfx: 'SFX'` unchanged) + the import |
| LB3 | `library.ts` l.14–15 | `'მუსიკა'`, `'სტემები'` | `studioLibraryStrings.folderMusic`, `studioLibraryStrings.folderStems` |

`ArrangementLibrary.tsx` stays **frozen**. It renders `LIBRARY_KIND_LABELS[source.kind]` and the folder `label`, so the English appears without editing it. Its other copy is V-0.5 (R9).

**Glossary additions (d29z107):**
- `კლიპის დეტალები` → Clip details
- `დასაწყისი / სიგრძე / წყაროდან` → Start / Length / Source offset
- `საიდან, წმ / სადამდე, წმ` → From, s / To, s
- `მონიშვნა` (apply button) → Set selection
- `შეუნახავია` → Unsaved
- `უცვლელია` → unchanged
- `გაშლა / დაკეცვა` (panel) → Expand / Collapse, `დაკეცილია` (panel) → collapsed (track fold stays "fold")
- library kind `მუსიკა / სტემი` → Music / Stem; folder `მუსიკა / სტემები` → Music / Stems
- the multi-clip note says "selected clips" (R3)

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/lib/arrangement/strings.ts` | LB1 (4 keys appended last in `studioLibraryStrings`) and the new `studioDetailStrings` appended as the last export. Every other object, key and value stays byte-identical. No import. |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | DD1 only (the 38 lines + 1 import). No class, testid, handler or structure change. |
| `app/lib/arrangement/panels.ts` | DD2 only. |
| `app/lib/arrangement/clip-gain-multi.ts` | DD3 only. |
| `app/lib/arrangement/library.ts` | LB2, LB3 + 1 import only. |
| `app/lib/arrangement/__tests__/strings.test.ts` | Import specifiers. The `studioLibraryStrings` plain-string list (l.648 block) and key list (l.702 block) gain the 4 LB1 entries. ST39 exact count (§3.1). The new `describe('V-0.4e detail and library strings')` with ST41–ST44. |
| The 13 pin files of §0 | Replace each pinned Georgian literal on the lines in `b-round-141-r142-pin-lines.txt` with its exact English from §1.1/§1.3. Nothing else on those lines changes. The only extra edit is LB-SEARCH in `library.test.ts` (§3.2). No new `it`, and `it` counts stay the same. A Biome-forced rewrap of a changed line is allowed and must be reported. |
| `docs/.../117-studio-v0-default-names.md` | l.4 → `Completed (A-ის შემოწმებები მწვანეა რაუნდ 141-ში; C round 141 — PASS, browserVerified; gate 141 — 6e9f9b1)`. Replace the sentence about C round 141 not having run with `C round 141 — PASS (browserVerified).`. Delete a C round 141 TODO line if one exists. Locate the lines by content (`grep -n "141"`). Nothing else changes. |
| **new** `app/lib/arrangement/__tests__/detail-panel-strings-ui.test.tsx` | DPS1–DPS4 (§3.3) |
| **new** `docs/implementation/2026/quarter-IV/118-studio-v0-detail-library-strings.md` | Georgian, with the `docs/implementation/TEMPLATE.md` sections, including the per-string map (glossary rule); the status says C round 142 has not run yet. |

- **Protected (never touch):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, `app/routes/account.downloads.tsx`, `download-routes.test.ts`, and everything in `backlog.json` `global_forbidden_files`. **Frozen and relevant:** `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx`, `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `collection.ts`.
- **Pin rule:** replaced pins are hand-written English literals with the same matcher. No pin imports the module value it checks. Test files that already import a constant keep importing it.
- **Stop rule:** A stops and reports, without widening scope, if any of these happens:
  - a pin file's Georgian count on the listed lines differs from §0;
  - a non-granted test fails because of the new texts or labels (for example a library UI test that matches `მუსიკა` as a folder or kind label rather than as a track name);
  - an English text in a width-limited slot needs a class change to fit.
- **Edit rule (C-R120-01):** every lasting edit goes through Edit/Write. Shell writes are only for temporary mutations, which are restored and sha-verified. A lists every shell write.

## 3. A — tests and mutations
### 3.1 `strings.test.ts` (40 → 44 `it`s)
- **ST39 (gate-141 #1):** restore `expect(outputs.length).toBe(17)`. Keep the `>= formatterCount` and non-empty checks next to it.
- **ST41:** every plain-string property of `studioDetailStrings` equals its exact §1.1 literal (hand-written list), and the sorted key list is exact.
- **ST42:** formatter outputs, all hand-written:
  - `rangeApplied({start:'00:03.500', end:'00:07.250', track:'Music'})` → `Time selection: 00:03.500 — 00:07.250 · Music.`
  - `clipGainUnchanged('+3.0 dB')` → `Clip Gain unchanged: +3.0 dB.`
  - `clipCount(1)` → `1 clip`; `clipCount(2)` → `2 clips`
  - `clipGainMembers(2, '0.0 dB')` → `Clip Gain: 2 clips — 0.0 dB.`
  - `collapsedValueText(130)` → `collapsed · 130 px`
  - `pendingFull.startsWith(pendingLabel)` is true, and `pendingFull.slice(pendingLabel.length)` is ` — Enter saves, Esc reverts` (R7)
  - `DETAIL_RANGE_INVALID_MESSAGE` equals the §1.1 `rangeInvalid` literal
  - `formatClipGainMembersStatus({clipIds:['a','b'], minDb:15, maxDb:22})` → `Clip Gain: 2 clips — +15.0 … +22.0 dB.`
- **ST43:** `LIBRARY_KIND_LABELS` equals `{ music: 'Music', stem: 'Stem', sfx: 'SFX' }` and `LIBRARY_FOLDER_LABELS` equals `{ music: 'Music', stem: 'Stems', sfx: 'SFX' }` (hand-written).
- **ST44:** with comments stripped, `ArrangementDetailPanel.tsx`, `panels.ts`, `clip-gain-multi.ts` and `library.ts` have **no** Georgian line and no `«»`. No `studioDetailStrings` string or formatter sample has Georgian or `«»`.

### 3.2 Pin replacements and `library.test.ts`
The 56 lines of `b-round-141-r142-pin-lines.txt` change only their Georgian literal, to the exact English. Examples:
- `'2 კლიპი'` → `'2 clips'`
- `'დაკეცილია · 130 px'` → `'collapsed · 130 px'`
- `'ხაზები მუსიკა, SFX'` → `'Tracks მუსიკა, SFX'` (the fixture track name stays)
- `'მონიშვნა: 00:03.500 — 00:07.250 · მუსიკა.'` → `'Time selection: 00:03.500 — 00:07.250 · მუსიკა.'`
- `library.test` l.44/48 `['მუსიკა', 1]` → `['Music', 1]`, l.49 `['სტემები', 4]` → `['Stems', 4]`, l.71 `'სტემი პადი'` → `'stem პადი'` (R8)

After the edits, `grep -nP '[\x{10A0}-\x{10FF}]'` on the 56 listed lines prints only Georgian that is **fixture data** (track names, source titles). A saves the before and after grep in `a-round-142/`.

The one allowed new assertion in `library.test.ts` is **LB-SEARCH**, added inside the existing `it` at l.68 as extra `expect` lines (no new `it`). It checks that:
- `'music'` and `'MUSIC'` match the music source by kind;
- `'stems'` matches the stem sources by kind;
- `'მუსიკა'` alone no longer matches a source whose title and collection lack it.

A picks fixture ids from the file and lists them in the report.

### 3.3 New `detail-panel-strings-ui.test.tsx` (jsdom)
Copy the render harness of `detail-panel.test.tsx` (do not import that file). All expectations are hand-written.
- **DPS1:** with nothing selected. The start state depends on the harness fit metrics (`detailPanelStartsOpen`; see `stubTimelineMetrics` in `detail-panel.test.tsx`), so assert both sets by toggling once, whichever state the harness starts in:
  - the panel's `aria-label` and the `h2` text are `Clip details`;
  - the header label is `Nothing selected`;
  - the hint is `Select a clip to see its details`;
  - the separator `aria-label` is `Details height` and its open `aria-valuetext` is `{h} px`;
  - open state: the toggle reads `Collapse details` / `Collapse ▾`;
  - collapsed state: the toggle reads `Expand details` / `Expand ▸`, and the `aria-valuetext` is `collapsed · {h} px`.
- **DPS2:** with one audio clip selected:
  - the info labels are exactly `['Track', 'Start', 'Length', 'Source offset']` in DOM order;
  - `The source file stays unchanged` is present;
  - the range labels are `From, s` / `To, s`, and their inputs' aria-labels are `Time selection start (seconds)` / `Time selection end (seconds)`;
  - the apply button text is `Set selection`;
  - the reset aria-label is `Reset Clip Gain (0 dB)`.
- **DPS3:** after typing a new Clip Gain without committing, `arrangement-detail-clip-gain-pending` has these values:
  - `title` = `Unsaved — Enter saves, Esc reverts`;
  - its first text node = `Unsaved`;
  - the `.sr-only` span text = ` — Enter saves, Esc reverts`;
  - full `textContent` = `Unsaved — Enter saves, Esc reverts`.
- **DPS4:** with two clips selected:
  - the header and the group block read `2 clips`;
  - the label `Tracks` is present;
  - the note is `The selected clips move together · Delete deletes them · Ctrl+D duplicates them`;
  - the range inputs' title is `A time selection is set on one clip — select only one`.

### 3.4 Forward rule (GATE130-S3)
Every §1.1 key and LB1 key has at least one hand-written literal test (ST41–ST43, DPS1–DPS4 or a replaced pin). A lists the key → test mapping in its report.

### 3.5 Mutations (each turns the named tests red; restore and check by sha256)
| ID | Mutation | Must turn red |
|---|---|---|
| m82 | `studioDetailStrings.noneReason` → `'Select a clip'` | ST41, detail-panel.test, clip-gain, detail-panel-reason |
| m83 | `clipCount` always returns `` `${count} clip` `` | ST42, DPS4, detail-panel.test l.407/409 |
| m84 | `pendingFull` → `'Not saved — Enter saves, Esc reverts'` (breaks R7) | ST42, DPS3, pending-status, detail-panel-fit |
| m85 | `clip-gain-multi.ts` back to a Georgian `კლიპი` literal | ST44, clip-gain-multi.test |
| m86 | `kindStem: 'Stem'` → `'Stem sound'`, which still contains `stem`, so only the exact pins catch it; then a second run with `'სტემი'` | run 1: ST43; run 2: ST43, library.test l.71 + LB-SEARCH |
| m87 | `collapsedValueText` → `` `folded · ${height} px` `` | ST42, DPS1, detail-panel.test l.551/684/686 |

## 4. A — checks (speed rules)
- At the start: the frozen list, the 20 start hashes and the start copies are all OK, and `git status --short` is empty.
- Pre-edit greps go to `a-round-142/pre-grep.txt`:
  - Georgian in the 4 source files;
  - the 56 pin lines;
  - every test or e2e file that imports `library.ts`, `panels.ts`, `clip-gain-multi.ts` or `ArrangementDetailPanel`, or renders the library (A greps and lists them);
  - any test that matches `მუსიკა` / `სტემები` / `სტემი` as a **library folder or kind label** (B found none outside library.test).
- `npm run typecheck` and `npm run lint` exit 0. A read-only `npx biome check` on the changed files gives 0 diagnostics.
- `npx vitest run` on these files, saved to `a-round-142/vitest.json`:
  - the 13 pin files, `strings.test` and the new `detail-panel-strings-ui`;
  - the neighbours `library-preview`, `library-focus-handoff`, `render-budget`, `collection`, `collection-load-status`, `purchased-collection-ui`, `clip-gain-waveform`, `fader-touch`, `track-volume-db`, `ssr-layout-effect` and `default-track-names-ssr`;
  - every other test file found by the import grep.
- Mutations m82–m87 per §3.5.
- The code-reviewer runs, because more than 3 files change. Its Architecture note goes to B.
- **Not run:** the full suite, `npm run verify`, build or e2e (the gate does these).
- At the end:
  - `git status --short` shows exactly the 20 ` M` + 2 `??` granted paths;
  - the frozen list is OK;
  - the protected `git diff 6e9f9b1` is empty;
  - the end sha256 of the changed paths is in `a-round-142/end-sha256.txt`.
- No commit, stash, checkout, install, `--write` or `check:fix`.

## 5. C — rows
Real Playwright Chromium at **1440×900 and 1280×720** on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session. State Snap at the start of each session (default off). Harness notes:
- at 1280×720 the detail panel **starts collapsed** (36 px); expand it with the toggle before the content rows;
- the default demo starts empty;
- video media lives in `tmp/studio-real-loop/media/` (`clip-4s-vp9-opus.webm` was used by the B probe);
- B's probe `b-round-141/tools/detail-probe.cjs` shows the state setup (none, single, multi of 2 audio clips, video, video+audio).

| Row | Start state → action → expected |
|---|---|
| T142-TARGETED | Run A's named vitest list; the counts equal A's |
| SOURCE-SCOPE | Only granted paths changed. Frozen list OK at start and end. End hashes equal `a-round-142/end-sha256.txt`. Protected diff vs `6e9f9b1` is empty. No source changes during C's phase |
| AN-REVIEW | `diff -u` against `b-round-141/r142-granted-start/`. Expected:<br>- `strings.ts` adds only LB1 and `studioDetailStrings`, exactly as in §1.1;<br>- the 4 other source files change only DD1–DD3 and LB2–LB3, with no class, testid or handler change;<br>- each pin file changes only the listed lines plus LB-SEARCH (report any Biome rewrap);<br>- strings.test changes only §3.1;<br>- doc 117 changes only the named lines;<br>- ST44's grep over the 4 sources is empty |
| DETAIL-TEXT | In each state (none, single audio, multi of 2 audio clips, video, video+audio), compare every visible text and aria-label/title/aria-valuetext in `[data-testid=arrangement-detail-panel]` with §1.1:<br>- the panel name, header label, hint, info labels, range labels, input aria-labels, apply text, reset label, both reasons, video placeholder, multi-clip note and `2 clips`;<br>- the toggle text and label, open and collapsed;<br>- the separator label and valuetext.<br>Georgian in the panel = only the selected clip's source title (R9) |
| DETAIL-STATUS | 1. Single clip: set From/To to valid values, then Set selection → status `Time selection: {start} — {end} · Music.`, and the time selection is drawn on the clip.<br>2. Invalid From > To → status = the §1.1 `rangeInvalid` text, and nothing changes.<br>3. Clip Gain input `abc` + Enter → `Clip Gain: enter a number in dB (−60…+24).`.<br>4. Enter without a change → `Clip Gain unchanged: 0.0 dB.`.<br>5. Type `-3` and do not press Enter → the pending label `Unsaved` is visible with the full `title`. Esc → the value reverts.<br>6. Two audio clips selected: Clip Gain `-3` + Enter → `Clip Gain: 2 clips — −3.0 dB.`; Reset → `Clip Gain: 2 clips — 0.0 dB.`.<br>7. Undo/Redo titles of these edits are unchanged from round 141 (C reports the exact text) |
| CLIP-GAIN-AUDIO | **Real audio**, paired and at the same position. One Music clip, playing a window where only that clip sounds. Detail Clip Gain `-20` + Enter → output RMS drops by 20 dB ± 1 dB. Reset (0 dB) → it comes back to within 1 dB of the base. Three valid measurements at most, per the sync budget |
| LIBRARY-LABELS | Fresh load:<br>- the folder tree shows `Music`, `Stems` and `SFX` under the demo collection (counts unchanged from baseline);<br>- a library row's kind chip reads `Music`, `Stem` or `SFX`.<br>Search:<br>- `music` → only music sources; `stem` → only stems; `MUSIC` → the same as `music`;<br>- `მუსიკა` → no source matches by kind (C reports the count and which sources, if any, match by title or collection);<br>- clearing the search restores the full list.<br>Adding a sound with Enter still works (status `… added to the Music track at …`).<br>**Mixed attribute (R9):** the frozen `ArrangementLibrary.tsx` l.518 renders the folder toggle aria-label as `${label} — დაკეცვა/გაშლა`, so after LB3 it reads, for example, `Music — გაშლა`. The folder label word must be English; the `— დაკეცვა/გაშლა` suffix is a V-0.5 subtraction. C reports the exact attribute text |
| GEO-COUNT | Count Georgian in the detail panel (text and attributes), the status line, Undo/Redo titles, the library kind chips and folder labels, and the round-141 surfaces. Expect **0** after these named subtractions (R9):<br>- source titles (data);<br>- the collection label `… შეძენილი სტემები` / demo collection name;<br>- the demo badge;<br>- the demo-ready load status;<br>- the library panel's own copy (aria-labels, headings, preview row), including the `— დაკეცვა/გაშლა` suffix of the folder toggle aria-label (the folder label word before it is counted);<br>- the dock;<br>- `document.title`.<br>The detail panel and the library labels are **no longer** excluded. List every subtraction |
| LAYOUT | Compare with `b-round-141/out/detail-baseline-6e9f9b1.json` (same states, both viewports; at 1280 compare after expanding, and record the 1280 open boxes as the new baseline because the B probe stored only the collapsed panel there):<br>- the boxes of `arrangement-detail-start`, the clip-gain input, reset, fader and panel, and the x/w of every column, must not move or resize by more than 1 px;<br>- the apply button and toggle are `w-fit`, so their width may change; report it, and the x of other nodes must not move;<br>- reason line counts must not exceed the baseline (range reason 1, Clip Gain multi reason 2 at 1440, video reason 1, none reasons 1), and the group block height must not exceed 87 px;<br>- `contentScroll` must show no overflow, `clippedBelowPanel` must be empty, and no node may overflow horizontally.<br>Any breach = FAIL (not a Low) |
| REG-141 | One sample each: Ctrl+G on Music + Stems → `Group “Group 1” created: Music, Stems.`; the track header aria-label `Music — set as the active track` |
| G142-3 (alone, last) | `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. `GET /api/studio-token?…` → 401. The fake-Bearer 403 check is BLOCKED (backend unavailable in cloud) |
| PX-NET / REG-HYD | 0 forbidden requests, 0 Authorization headers, 0 hydration errors and 0 pageerror (the known cart noise is expected) |

Gate rows (C does not claim them): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## 6. Ableton source
Live 12 Reference Manual, B's saved capture `b-round-133/live/arrangement-view.txt` (TOC + the Arrangement View chapter; B checked it on 2026-10-24). The Clip View chapter and the Browser chapter are **not** in the capture, and no new capture was taken.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Detail panel labels (Start, Length, Clip Gain) | Live Clip View chapter — not captured | **unconfirmed** | CZABA wording per the glossary. CZABA's detail panel is its own simplified panel, not Live's Clip View. No Live claim | DETAIL-TEXT |
| Library kind/folder labels and search | Live Browser chapter — not captured | **unconfirmed** | CZABA library labels Music/Stem(s)/SFX; search is AND over title + kind + collection (SRW-12) | LIBRARY-LABELS |

C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 7. Evidence and reporting
- C writes `c-round-142.md` and `c-round-142.json` as it goes, with these fields: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` with subtractions, `measurements` (incl. the LAYOUT deltas and the CLIP-GAIN-AUDIO values), `invalidRuns`, `notesForB`.
- Evidence goes under `c-round-142/{tools,out,shots}/`. Every run writes a uniquely named output (C-R125-HARNESS-OVERWRITE). C makes no writes under `store/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`. A state that honestly cannot be observed is `inconclusive`, with the reason.
- A writes `a-round-142.md` as it goes. It covers:
  - start checks and the pre-grep;
  - changed files and `it` counts before/after;
  - the key → test map;
  - test results and mutations;
  - the reviewer verdict and Architecture note;
  - shell writes and the end state;
  - deviations and known gaps.

## 8. Outcome, fixed in advance (B at round 143 planning)
| Condition | Round 143 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first (every done / c_pass item, both viewports, `test:e2e:smoke`), then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.4e fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.4e → `c_pass`, then `c_pass_published` after the gate; **V-0.4 complete**. Round 143 = **V-0.5**, re-measured first. Its area: library, preview, dock, route, `studio-lab-demo.ts` UI labels, `collection.ts`, context l.3468, `lang="en"`, and the final RV-4 grep. B decides the split, since ≈84 source lines is likely 2–3 rounds. Forward constraints: gate-141 #2 (SSR `console.error` assertion in `default-track-names-ssr`) and #3 (ST40 meta-title pin update). If root's strings-split checkpoint result arrives first, B applies it as its own bounded round before V-0.5 |

At every planning B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Library search:** the kind label is in the haystack, so English labels change matches (R8). LIBRARY-LABELS and LB-SEARCH check it, and m86 proves the coupling. Library UI tests that use Georgian *track* names are unaffected.
- **Width-limited slots:** the reasons sit in fixed columns (`w-44`, `w-52`, middle column w 392 at 1440), and the panel is 144 px. English must not add wrap lines. The LAYOUT baseline is B's real-browser probe, so a worse wrap is a FAIL, not a Low. DETAIL-REASON-FIT stays as it was.
- **Pending hint:** derived by `slice`. R7 + DPS3 + m84 guard it.
- **Text in status consumers:** `status-announcement-ui` and `self-disabling-focus` pin the Clip Gain unchanged text; both are swept.
- **Server rendering:** the detail panel renders on the server inside `/studio-lab`. `ssr-layout-effect` and `default-track-names-ssr` are in the neighbour list.
- **Architecture:** the strings-split checkpoint request is still open and does not block. Added this round: the gate-141 Architecture note (default-name seeds in strings vs data) is appended to `b-round-136-checkpoint-request.md`; A's SSR-helper note (extract when a third SSR test appears) is a signal.
- **Commit readiness:** after C PASS, root may publish V-0.4e as an interim unit (it completes V-0.4).
