# CURRENT TASK — Round 130: VISUAL-A V-0.2b — playback, library add/drop, loop and nudge messages in English

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 129)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). The module contract is in `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract`: leaf module, one object per area, plain strings plus small pure formatters, no type assertions, **existing exported constants keep their names and are defined from the module**.
- **Previous task:** `tasks/round-129.md` (exact copy, `cmp` OK, 26482 bytes). Rationale: `b-round-129.md`. Decision record: **D-29z95** in `plan.md`.
- **Baseline: commit `1e453b15185bca71f9137aa483d3e25a8b7d4abf`** (gate 129 published). The tree was **clean** at planning (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-129-r130-tree-sha256.txt`, **930 entries** (`git ls-files -co --exclude-standard` minus the 11 grants in `b-round-129-r130-grants.txt`). `sha256sum -c --quiet` was OK at planning, run from `store/`.
- **Start hashes of the 11 grants:** `b-round-129-r130-granted-start-sha256.txt`. **Start copies:** `b-round-129/r130-granted-start/` (paths relative to `store/`). A checks both at the start. If a hash differs, A stops and reports.

## 0. Why this round (D-29z95)
- **Round 129: C PASS**, `browserVerified` = `realVerified` = true. Gate 129 published `1e453b1`. **V-0.2a (edit commands) is done.**
- V-0.2b follows the order fixed in `tasks/round-129.md` §8. The gate-128 Medium note still applies: the Studio is mixed-language until V-0 finishes.
- The regression round is not due: `regression-last.json` is dated 2026-10-24, so it is due on or after 2026-10-27. No Critical, High or Medium finding is open. `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist.
- **Folded in (costs little; the round already owns the code):**
  - **m4 gap:** no UI test asserts the delete-clip status (A round 129: m4 survived; gate-129 info #4). This round adds **one `it`** to `status-announcement-ui`.
  - **GATE129-S2:** the ST9 constant loop has nothing to check. It now asserts that the six constants are gone.

## 1. What changes (user-visible)
Four new exported objects go in `app/lib/arrangement/strings.ts`: **`studioPlaybackStrings`**, **`studioLibraryStrings`**, **`studioLoopStrings`** and **`studioMoveStrings`**. Every Georgian literal in the scope below moves there, in English. **Text only:** no change to any condition, order of checks, state update, selection, history push, playback, scheduling or timing.

### 1.1 The English map (exact text; A may not reword it — if a line seems wrong, report it and B rules)
Notation:
- `{t}` = an already formatted time (`formatArrangementTime`).
- `{span}` = the output of `formatLoopSpan` (stays in the Context).
- `{title}` = a sound title. It is user content and is not translated.
- `{track}` = a track name as it is today.
- Georgian „…“ quotes become English “…” (U+201C / U+201D).

| # | Where today (baseline line) | Object.key (A may rename the key, not the text) | English |
|---|---|---|---|
| P1 | `GESTURE_UNDO_BLOCKED_MESSAGE` l.178 (exported) | `studioMoveStrings.undoBlockedDuringDrag` | `Undo/Redo does not work while dragging — let go first.` |
| P2 | `GESTURE_EDIT_BLOCKED_MESSAGE` l.179 (exported) | `studioMoveStrings.editBlockedDuringDrag` | `Editing does not work while dragging — let go first.` |
| P3 | `NUDGE_AT_TIME_START_MESSAGE` l.180 (exported) | `studioMoveStrings.nudgeAtTimeStart` | `Nudge blocked — start of the timeline.` |
| P4 | `AUDIO_ON_VIDEO_LANE_MESSAGE` l.181–182 | `studioLibraryStrings.audioOnVideoTrack` | `Choose an audio track (music, stems or SFX) — audio is not added to the video track.` |
| P5 | `LIBRARY_DROP_BLOCKED_MESSAGE` l.183 | `studioLibraryStrings.dropBlocked` | `No room here — clips on one track do not overlap.` |
| P6 | `librarySourceFailedMessage(title)` l.184–185 | `studioLibraryStrings.sourceFailed(title)` | `“{title}” failed to load — details are in the library.` |
| P7 | `WEB_AUDIO_UNAVAILABLE_MESSAGE` l.186–187 (exported; also the export error) | `studioPlaybackStrings.webAudioUnavailable` | `Web Audio is not available in this browser — playback and export will not work.` |
| P8 | `LOOP_STEP_BLOCKED_MESSAGE` l.190 | `studioLoopStrings.stepBlocked` | `The loop cannot move further: start of the timeline or minimum length.` |
| P9 | `playPastEndMessage(position, end)` l.513–514 (exported function) | `studioPlaybackStrings.playPastEnd({position, end})` | `Playhead ({position}) is past the end of the project ({end}) — there is nothing to play here. Home returns to 0.` |
| P10 | `togglePlayback`, empty project l.1214 | `studioPlaybackStrings.nothingToPlay` | `Nothing to play — add a clip from the library first.` |
| P11 | no source selected l.1261, l.1374 | `studioLibraryStrings.selectSoundFirst` | `Select a sound in the library first.` |
| P12 | source not loaded l.1265, l.1382 | `studioLibraryStrings.sourceNotLoaded(title)` | `“{title}” has not loaded yet.` |
| P13 | add failed l.1400 | `studioLibraryStrings.addFailed` | `Could not add the clip.` |
| P14 | history `დამატება — {title}` l.1403, l.1472 | `studioLibraryStrings.historyAdd(title)` | `Add — {title}` |
| P15 | added, l.1408 (button / `A`) and l.1477 (drop) | `studioLibraryStrings.clipAdded({title, track, time, suffix})` | `“{title}” added to the {track} track at {t}{suffix}.` |
| P15a | its suffix when the clip moved (l.1408 ternary) | `studioLibraryStrings.nearestFreeSpot` | ` (nearest free spot)` (leading space; the drop passes `''`) |
| P16 | drop, source not ready l.1448 | `studioLibraryStrings.dropNotLoaded` | `This sound has not loaded yet — wait and try again.` |
| P17 | loop range too short l.1643 | `studioLoopStrings.tooShort` | `A loop needs a time selection of at least 0.1 s.` |
| P18 | history l.1647 | `studioLoopStrings.historyReplaced`, `historyCreated` | `Loop replaced` / `Loop created` |
| P19 | status l.1650 / l.1651 | `studioLoopStrings.replaced(span)`, `created(span)` | `Loop replaced with the new range: {span}.` / `Loop created and turned on: {span}.` |
| P20 | no range and no loop l.1656 | `studioLoopStrings.needsSelection` | `To set a loop, first make a time selection on the waveform.` |
| P21 | history l.1660 | `studioLoopStrings.historyOn`, `historyOff` | `Loop on` / `Loop off` |
| P22 | status l.1661 | `studioLoopStrings.on`, `off` | `Loop is on.` / `Loop is off; the range is kept.` |
| P23 | history `Loop-ის დიაპაზონი` l.1682, l.1714 | `studioLoopStrings.historyRange` | `Loop range` |
| P24 | nudge blocked by a neighbour l.1749 | `studioMoveStrings.nudgeBlocked` | `Nudge blocked — a neighbouring clip or the start of the timeline.` |
| P25 | history `კლიპის ჩაჩოჩება` l.1753 | `studioMoveStrings.historyNudgeClip` | `Nudge clip` |

- **Exported names stay, values move (contract rule).** `GESTURE_UNDO_BLOCKED_MESSAGE`, `GESTURE_EDIT_BLOCKED_MESSAGE`, `NUDGE_AT_TIME_START_MESSAGE`, `WEB_AUDIO_UNAVAILABLE_MESSAGE` and `playPastEndMessage` keep their names and signatures. They are defined from the module (for example `export const GESTURE_EDIT_BLOCKED_MESSAGE = studioMoveStrings.editBlockedDuringDrag;`). They are imported by 7 frozen components and by tests: `StudioWorkspace.tsx` l.1994 compares `current.status !== NUDGE_AT_TIME_START_MESSAGE`, and the Context compares the gesture constants at l.576 and l.1542. Do **not** delete or rename them. This is the opposite of round 129, where the six constants were private. The private constants `AUDIO_ON_VIDEO_LANE_MESSAGE`, `LIBRARY_DROP_BLOCKED_MESSAGE`, `librarySourceFailedMessage` and `LOOP_STEP_BLOCKED_MESSAGE` may be deleted (uses point at the module) or kept as aliases. A chooses one and reports it.
- **Unchanged this round** (they stay Georgian; C subtracts them by name):
  - (a) **`გადატანა (${ids.length})`** l.1733, the history label of the keyboard group nudge. `ArrangementClip.tsx` l.700/l.713 writes the same label for a mouse group drag, next to `კლიპის გადატანა`, `გადატანა ხაზზე — …` and the Trim labels. **Ruling (smallest honest choice):** all move/trim history labels move together in V-0.4, with `ArrangementClip.tsx`. That way one action never has two Undo labels in two languages.
  - (b) `GROUP_MOVE_BLOCKED_MESSAGE` (from `selection.ts`, V-0.2c), used at l.1730.
  - (c) the default track names l.539–540 (V-0.4).
  - (d) the video import lines l.2203–2294 and l.3435 (V-0.2c).
  - (e) the already-English `Loop: {span}{ · off}.` statuses l.1686 and l.1716. They are not moved.
- **Same phrase, different owner (frozen; do not translate):**
  - `ArrangementLane.tsx` l.893, the drop-ghost text `' · აქ ადგილი არ არის'`, and the ghost `ხმა ჯერ არ ჩატვირთულა`. These are V-0.4. `grid-snap-loop-drop` l.436/525/541 pin the **ghost**, not the Context status, so those lines stay.
  - `selection.ts` l.42 `overlap: 'აქ ადგილი არ არის'` (V-0.2c).
  - `collection.ts` `… წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია` (V-0.2c). `collection.test` l.379/389, `collection-load-status` l.52 and `purchased-collection-ui` l.36 pin it, so those lines stay.
  - `ArrangementClip.tsx` l.586/619/620 (V-0.4).
  - `ArrangementTransport.tsx` / `StudioWorkspace.tsx` `ჯერ მონიშნე მონაკვეთი` (their own hints, V-0.3).
  - `model.test.ts` l.350–356 passes its own labels to `commitHistory` and does not read the Context, so it stays frozen.
- **Conditional copy stays in the Context** (as in V-0.2a). These ternaries stay where they are and only pick module values or formatters: `moved ? nearestFreeSpot : ''`, `replaced ? …`, `enabling ? …`, `state?.status === 'error' ? …`, and the `keyRepeat ? () => message : message` thunks. Formatters take already formatted strings (leaf rule: `strings.ts` imports nothing).
- **Track names in P4 (ruling):** `strings.ts` may not contain Georgian (ST12). The V-0.4 English track names are not decided yet. So P4 names the track roles in lower case (`music, stems or SFX`), not the exact lane labels. This keeps the fact (which tracks take audio) without inventing labels.
- **Glossary additions** (doc 106 and the backlog glossary):
  - nudge (`ჩაჩოჩება`), loop range (`Loop-ის დიაპაზონი`), Loop on / Loop off
  - “… failed to load — details are in the library.” Reused by `collection.ts` in V-0.2c.
  - No room here (`აქ ადგილი არ არის`). Reused by `selection.ts` and the ArrangementLane ghost in V-0.2c and V-0.4.
  - has not loaded yet (`ჯერ არ ჩატვირთულა`), nearest free spot, Add — {title}, let go first (`ჯერ ხელი აუშვი`), start of the timeline (`დროის დასაწყისი`).

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/strings.ts` | Add the four objects with P1–P25. The existing `studioExportStrings` and `studioEditStrings` are unchanged. Imports nothing |
| `app/contexts/ArrangementContext.tsx` | **Only:** (a) the import; (b) the constants and the function of l.178–190 and l.513–514 (values from the module; exported names and signatures kept); (c) the string literals of P10–P25 inside `togglePlayback`, `startLibraryPreview`, `addSourceToActiveTrack`, `dropLibrarySource`, `toggleLoopSelection`, `commitLoopRange`, `stepLoopRange` and `nudgeSelectedClip` (baseline l.1205–1757) → module values or formatters. No condition, dependency array, call order or non-string expression changes. l.1733 stays |
| `app/lib/arrangement/__tests__/strings.test.ts` | New `describe('V-0.2b playback, library, loop and move strings')` with ST10–ST13 (§3.1). **GATE129-S2:** in ST9, the constant loop asserts `index === -1` for each of the six names (no `continue`). ST1–ST9 keep everything else |
| `status-announcement-ui.test.tsx` | Literal → module for `NOTHING_TO_PLAY` l.26, `FAILED_TEXT` l.27, `NUDGE_BLOCKED_TEXT` l.394, `NUDGE_SNAP_BLOCKED_TEXT` l.395, `LOOP_BLOCKED_TEXT` l.397, `LOOP_OFF_TEXT` l.708, `LOOP_ON_TEXT` l.709 and the undo label l.783–784 (`historyOff`, title `Undo: ${…}`). `GROUP_BLOCKED_TEXT` l.396 stays. **Plus exactly one new `it` (SA-DEL, closes m4):** select one clip, press Delete, and expect the status `toBe(studioEditStrings.deleteClipDone)`. Then select two clips, press Delete, and expect `toBe(studioEditStrings.deleteClipsDone(2))`. Use the file's existing helpers and fixtures |
| `grid-snap-ui.test.tsx` | l.106 `NUDGE_AT_ZERO_STATUS` → `studioMoveStrings.nudgeAtTimeStart` (or the exported constant); l.643 `'კლიპის ჩაჩოჩება'` → `historyNudgeClip`. The `'გადატანა (2)'` lines and l.109/l.111 stay |
| `grid-snap-loop-drop.test.tsx` | l.111 `DROP_BLOCKED_STATUS`, l.112 `LOOP_BLOCKED_STATUS`; the `Undo: დამატება — Hit` titles l.385/451/486 (`Undo: ${historyAdd('Hit')}`); the added statuses l.368/384/485/502/516 (`clipAdded`, with the track names kept as they are: `SFX`, `მუსიკა`, `სტემები`); l.547 `dropNotLoaded`; the `Undo: Loop-ის დიაპაზონი` titles l.615/629/740/849. The ghost texts l.436/525/541 stay |
| `marker-time-snap-ui.test.tsx` | l.117 `LOOP_LABEL` → `studioLoopStrings.historyRange` |
| `gesture-reentry.test.tsx` | l.323 → `studioLoopStrings.historyRange` |
| `failed-source-refusal.test.tsx` | l.90 `NO_SOURCE`; the helpers l.93 (`sourceFailed`) and l.97 (`sourceNotLoaded`); l.250 (`clipAdded` with `track: 'მუსიკა'`, suffix `''`) |
| `collection-load-status.test.tsx` | l.57 `NOTHING_TO_PLAY` only. l.52 (`collection.ts`, V-0.2c) stays |
| `ArrangementContext.test.ts` | l.656 the play-past-end literal → `studioPlaybackStrings.playPastEnd({position: '00:05.000', end: '00:02.000'})`, with the same matcher |
| new `docs/implementation/2026/quarter-IV/106-studio-v0-playback-loop-strings.md` | TEMPLATE.md sections, in Georgian: the P map, the move-label ruling (a), the P4 track-role ruling, the exported-name rule, the glossary additions, SA-DEL, the tests and mutations. Status is Completed only after §4 is green |

- **Test rules (as in round 129):**
  - Every assertion that pins a P-text uses the module value or formatter with the same inputs and **the same matcher**.
  - Georgian **track names** inside expected text stay (they are interpolated).
  - Add the import.
  - No `it` is added, removed or renamed, except SA-DEL. The one exception is a title that quotes a migrated Georgian text: it becomes English.
  - Line numbers are baseline (`1e453b1`) positions. Find each by its text.
- **Pre-edit grep (A records it):** for each P row, grep the old Georgian text in `app/**/__tests__/**` and `e2e/**`. B's exact grep found test hits only in the 8 test files above. `e2e/` has no Georgian text. Name-only importers (`self-disabling-focus`, `pending-status`, `clip-gain-fader`, `export-mp3`, and the components) need no change because the names stay.
- **Stop rule:** stop and report (B rules) if any of these happens:
  - a test outside §2 asserts an old P-text, or turns red;
  - a change needs a frozen file or a non-string line in the Context;
  - SA-DEL cannot be written with the existing fixtures.
- **Expected end state:** `git status` shows 11 ` M` + 1 `??` (doc 106) and no other path. The frozen list is OK at the start and at the end. Report the end sha256 of the 12 paths.
- **Protected (unchanged; `git diff 1e453b1` on them is empty):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, and everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`.
- **Forbidden actions:** commit, push, stash, checkout, reset, deploy, dev-server restart, `npm install`, `npm run check:fix` / any `--write`, `npm run format`.
- **Edit rule (C-R120-01):** lasting edits only with the Edit/Write tool. Shell writes are allowed only for temporary mutations, restored and checked by sha256. List every shell write.
- **Before editing, read:** `.claude/primitives-map.json`, `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md` (the playback callbacks are touched, strings only), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `docs/implementation/TEMPLATE.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` (also no `as const`), semicolons, no code comments.

## 3. A — tests and mutations
### 3.1 `strings.test.ts`: ST10–ST13 (strings goes from 9 to 13 `it`s)
- **ST10:** every plain-string property of the four objects equals its exact English literal from §1.1 (`toBe`). Each object's key list equals the expected list.
- **ST11:** every formatter returns the exact English for its inputs, with `toBe`:
  - `sourceFailed` / `sourceNotLoaded` / `historyAdd` with the title `Hit`;
  - `clipAdded` with `SFX` and suffix `''`, and with `nearestFreeSpot` as the suffix;
  - `playPastEnd`, `replaced` and `created` with sample times;
  - the exported aliases (`GESTURE_*`, `NUDGE_AT_TIME_START_MESSAGE`, `WEB_AUDIO_UNAVAILABLE_MESSAGE`) `toBe` their module values, and `playPastEndMessage(5, 2)` `toBe` `playPastEnd({position: '00:05.000', end: '00:02.000'})`.
- **ST12:** no plain value and no formatter output of the four objects contains a Georgian codepoint. The formatter key list equals the sample list.
- **ST13 (ratchet):** after comments are stripped, the trimmed lines of `ArrangementContext.tsx` that contain a Georgian codepoint equal exactly this list, in order:
  - the two default track-name lines (`'ვიდეო'`, `'აუდიო'`);
  - the `გადატანა (${ids.length})` label line;
  - the video import lines of V-0.2c (today 6, baseline l.2203/2253/2259/2264/2294/3435). A reads the final text from the file.

  Any new or remaining Georgian line in the V-0.2b scope turns it red. Each later stage shortens the list.

### 3.2 Mutations (each turns the named test red; restore and check by sha256)
| Mutation | Change | Must turn red |
|---|---|---|
| **m5** | `studioLoopStrings.off` back to `Loop გამორთულია; დიაპაზონი შენარჩუნებულია.` | ST10 and ST12 |
| **m6** | put `'Loop-ის დიაპაზონი'` back in `stepLoopRange` | ST13 |
| **m7** | `clipAdded` drops `{track}` (UI tests pass `suffix: ''`, so a suffix mutation would be seen by ST11 only) | ST11, and `grid-snap-loop-drop` (added status, e.g. baseline l.368) |
| **m8** | in `toggleLoopSelection`, swap `on` and `off` | a `status-announcement-ui` test (proves the UI tests bind through the module) |
| **m4 (repeat of round 129)** | in `deleteSelection`, single-clip status → `deleteClipsDone(1)` | **SA-DEL** |

## 4. A — checks (speed rules)
- `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the 11 changed code files.
- `npx vitest run` on:
  - the granted tests: `strings` and the 8 test files of §2;
  - the name-only importers: `self-disabling-focus`, `pending-status`, `clip-gain-fader`, `export-mp3`;
  - the neighbours: `model`, `collection`, `purchased-collection-ui`, `grid-snap-edit`, `grid-snap-clip-edges`, `marker-snap`, `delete-selection-ui`, `gesture-guard`.

  Every file must be green. Name the exact list and counts in the report; C runs the same list.
- No full suite and no `npm run verify` (the gate runs them).
- **code-reviewer required** (12 paths). Pass its Architecture note to B.
- **Report `a-round-130.md`:**
  - start HEAD, frozen OK and the 11 start hashes;
  - the pre-edit grep;
  - per granted file, the changed keys/lines (`diff -u` vs `b-round-129/r130-granted-start/`, saved as `a-round-130/granted.diff`);
  - `it` counts before and after per file;
  - m4–m8;
  - typecheck/lint results;
  - the reviewer's verdict and Architecture note;
  - every shell write;
  - end `git status`, frozen OK, and the 12 end hashes;
  - deviations.

## 5. C — rows
Real Playwright Chromium, a fresh context per session, **1440×900 and 1280×720**, `http://127.0.0.1:5173/studio-lab`.
- **Tools and media:** reuse `c-round-129/tools/` (edit harness, deselect by clicking an empty lane, not Escape) and `c-round-106/tools/kr106.cjs` (keys). Media: `tmp/studio-real-loop/media/`.
- **Invalid runs:** ENV-FIRST-LOAD — discard one crashed first load and record it under `invalidRuns`. At most 2 replacement attempts per row, and only for environment-invalid runs.
- **Evidence:** a unique file per run. Open every screenshot with Read and describe it.
- **Reading values:** read the status from the live status region (the element the UI tests call `statusText`) and the Undo button `title`.

| ID | Action | Expected (PASS) |
|---|---|---|
| **T130-TARGETED** | A's exact §4 vitest list | All green; counts equal A's |
| **SOURCE-SCOPE** | `git status`; `sha256sum -c --quiet b-round-129-r130-tree-sha256.txt` (from `store/`); protected `git diff 1e453b1` | 11 ` M` + 1 `??`; frozen OK; protected unchanged; no source change during C's phase |
| **AN-REVIEW** | `diff -u` of each grant vs `b-round-129/r130-granted-start/` | `strings.ts`: four new objects and nothing else changed; no import.<br>Context: only the import, l.178–190 and l.513–514 values (exported names and signatures kept), and string literals inside the 8 callbacks. **No condition, dependency array or call-order change** (list every hunk). l.1733 unchanged.<br>Tests: every hunk is an import, a literal → module change with the same matcher, ST9's `index === -1`, ST10–ST13 or SA-DEL; track names kept.<br>Meaning check: no P row drops or adds a fact vs the Georgian original (side by side).<br>Every shell write is listed |
| **PLAY-COPY** (both viewports) | (a) Fresh `/studio-lab`, Space on the empty project. (b) Add one short clip, click the ruler past the project end (Snap off), Space | (a) `Nothing to play — add a clip from the library first.` (b) `Playhead (…) is past the end of the project (…) — there is nothing to play here. Home returns to 0.`, with the real times. No playback starts (playhead does not move for 0.5 s) |
| **LIB-COPY** (both) | (a) The library add action (button or `A`) with a loaded sound on an audio track. (b) The same with the playhead inside an existing clip on that track, so the clip goes to the nearest free spot. (c) Active track = video, then the add action (button or `A`); a drop on the video lane is not used, because it gets no drop event in a real browser. (d) Drag a sound over an occupied spot of an audio lane and release. (e) Drag a sound to a free spot. (f) Undo title after (a) and after (e) | (a) `“{title}” added to the {track} track at {t}.` (b) the same, ending ` (nearest free spot).` if reachable; otherwise inconclusive (ST11). (c) P4 text. (d) A real browser gives a blocked drop `dropEffect none`, so no `drop` event and no status (INFO-R64-BLOCKED-NO-STATUS). PASS = the ArrangementLane ghost shows its frozen overlap note (` · აქ ადგილი არ არის`, V-0.4; read it by its time label, there is no `data-ghost-start`, INFO-C67-DROP-GHOST-ATTR), no clip is added, and the status region is unchanged. P5 itself is inconclusive (ST10 + `grid-snap-loop-drop` jsdom). (e) `“{title}” added to the {track} track at {t}.`, the clip at the drop time. (f) `Undo: Add — {title}`, and Undo removes the clip. The effects are as before (clip count, start, selection). C states the effect next to each message |
| **LOOP-COPY** (both) | (a) Ctrl+L with nothing selected and no loop. (b) Make a time selection on a clip, Ctrl+L. (c) A different time selection, Ctrl+L. (d) Click a clip or the ruler so no range differs from the brace, then Ctrl+L twice. (e) A time selection under 0.1 s if reachable, Ctrl+L. (f) The loop brace arrow step at the timeline start until it is blocked; drag a brace edge once. (g) Undo titles after (b), (c), (d) and (f) | (a) P20. (b) `Loop created and turned on: {span}.` (c) `Loop replaced with the new range: {span}.` (d) `Loop is off; the range is kept.` then `Loop is on.` (e) P17, or inconclusive. (f) P8 when blocked; after a step or drag, `Loop: {span}.` (`· off` when off), unchanged English. (g) `Undo: Loop created`, `Loop replaced`, `Loop off`/`Loop on`, `Loop range`. Each Undo restores the brace. The brace's real position and enabled state match each message |
| **NUDGE-COPY** (both) | (a) Select a clip at 0 s, Left arrow (nudge). (b) A clip butting a neighbour, an arrow towards it. (c) A free nudge, Undo title. (d) **Hold** Left on the clip at 0 s for ~1 s (key repeat). Playwright `keyboard.down` does not auto-repeat: send held-key repeats through CDP `Input.dispatchKeyEvent` with `autoRepeat: true` (about 10 over 1 s), and record `event.repeat` with the `c-round-106/tools/kr106.cjs` key recorder to prove the repeats arrived (working example: `c-round-110/tools/lf-hold.cjs`) | (a) P3. (b) P24. (c) `Undo: Nudge clip`, and Undo returns the start. (d) The status region announces P3 once (no flood of repeated live-region updates; count the text changes), and the clip stays at 0. This checks the `NUDGE_AT_TIME_START_MESSAGE` `===` path in `StudioWorkspace` |
| **DEL-COPY-RECHECK** (1440) | Delete one clip, then two clips | `Clip deleted; the gap remains.` / `2 clips deleted; the gap remains.` (the SA-DEL texts; a short recheck after round 129) |
| **GEO-COUNT** (both) | After each copy row | Georgian in the status region and in the Undo title = 0 after removing **by name**: the track names (`ვიდეო`, `მუსიკა`, `სტემები`), sound titles, and the known out-of-scope texts (group nudge label `გადატანა (n)`, the group-blocked status, the drop ghost, the collection-load message). List each subtracted item |
| **LAYOUT** (both) | S0/S1 boxes vs `c-round-125/out/bbox-baseline-*.json`, outside the status region; status region box after the longest P message (P9 or P4) | Every box outside the status region and the Undo button is within 1 px. The status region keeps its position. A height or wrap change must come from the message text (RV-1 V-0 text-width exception). No new horizontal overflow |
| **G130-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` | Workspace + demo badge. The product route shows "Sign in required", no workspace and 0 `audio[src]`. The token API returns **401**. Fake-Bearer 403: **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 requests to `/api/studio-token` (outside G130-3), `/api/recording-*`, `/api/download` or the R2 host; 0 `Authorization` headers; 0 hydration errors; 0 `pageerror` (the known cloud cart noise is not reported) |

- **Known not reachable in cloud Chromium (inconclusive, ST10/ST11 only):** P5 (real browsers fire no drop on a blocked spot; see LIB-COPY (d)), P1/P2 (gesture-blocked: a keyboard command during a live pointer drag. C may try once with mouse down + key; if it does not appear, inconclusive), P7 (Web Audio exists), P13 (`addClip` failure), P16 (drop before decode, only if C cannot catch a loading sound), P6/P12 unless a source is still loading or failed.
- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:**
  - **Medium:** any behaviour change (playback start, clip placement, loop state, nudge result, history); a wrong or fact-dropping message; a weakened, removed or skipped test; a non-string Context hunk; a key-repeat announcement flood that did not happen before.
  - **Low:** wording or style.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Ctrl+L sets the loop from the time selection and toggles the loop | Live 12 manual ch. 6 §6.6 "The Arrangement Loop" (Loop Selection, Ctrl+L, "can also be used to toggle the Arrangement loop on or off"); B capture `b-round-71/ableton-arrangement-view-20261021.txt` (captured 2026-10-21, reused) | **Confirmed** | Same command; messages name it "loop" / "loop range". Text only | LOOP-COPY |
| Arrow keys nudge the loop brace by the grid | same §6.6 ("The left and right arrow keys nudge the loop brace … based on the current grid settings") | **Confirmed term "nudge"** | "Nudge" is also used for clips (P3, P24, P25) | LOOP-COPY (f), NUDGE-COPY |
| Clip nudge by arrow keys; "nearest free spot" placement on add | — | **Unconfirmed**; no claim | CZABA behaviour (existing) | NUDGE-COPY, LIB-COPY |
| Space starts playback from the insert marker (our playhead) | same file §6.3 "Transport and Playback" | **Confirmed** (the play-past-end refusal is a CZABA rule) | CZABA says "Playhead" (existing term, V-0.2a glossary) | PLAY-COPY |

C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 7. Evidence and reporting
- C writes `c-round-130.md` and `c-round-130.json` as it goes, with these fields: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` (with the subtracted items), and `notesForB`. Evidence goes under `c-round-130/{tools,out,shots}/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`.
- C makes no `store/` writes.

## 8. Outcome, fixed in advance (B at round 131 planning)
| Condition | Round 131 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.2b fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.2b → `c_pass`, then `c_pass_published` after the gate. Round 131 = **V-0.2c**: video import messages (Context l.2203–2294, l.3435) and the helper modules `groups.ts`, `selection.ts`, `library.ts`, `video.ts`, `video.client.ts` (incl. `source.audioNote`), `tempo.ts`, `metronome.ts`, `view.ts`, `collection.ts` messages. B measures first and splits it if needed |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Where it could break:**
  - the status announcement de-duplication for key repeat (`keyRepeat ? () => message : message`, and the `StudioWorkspace` `===` check against `NUDGE_AT_TIME_START_MESSAGE`);
  - the gesture-refusal comparisons in the Context (l.576, l.1542), which compare against the exported constants;
  - the Export error state, which shows `WEB_AUDIO_UNAVAILABLE_MESSAGE`;
  - the Undo/Redo titles of add/loop/nudge;
  - library add placement, where the message must still follow the real placement.
- **Architecture:**
  - `ArrangementContext.tsx` (3797 lines) is edited by every V-0.2 stage. This is a string-only change.
  - Gate-129 Architecture note: messages are assembled in two places (the Context picks the variant, `strings.ts` holds the template).
  - Both fold into the bounded frontend-architect checkpoint that B asks root for when V-0.2c closes, before V-0.3. Questions: the strings module shape, conditional copy in formatters vs the Context, and the Context size.
- **Commit readiness:** after C PASS, root may publish V-0.2b as an interim unit.
