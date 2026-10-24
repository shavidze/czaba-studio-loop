# CURRENT TASK — Round 133: VISUAL-A V-0.2c3 — lane-move and track-group texts in English

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 132)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). Module contract: `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract`, clarified in §1.2 (R6) below:
  - a leaf module (`strings.ts` imports nothing), one object per area;
  - plain strings plus small pure formatters;
  - no type assertions;
  - **existing exported names keep their names and signatures and get their values from the module**.
- **Previous task:** `tasks/round-132.md` (exact copy, `cmp` OK, 30435 bytes). Rationale: `b-round-132.md`. Decision record: **D-29z98** in `plan.md`.
- **Baseline: commit `b25507ed0f127b2e64e46333bea7c6827bbf6eac`** (gate 132 published). The tree was **clean** at planning (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-132-r133-tree-sha256.txt`, **934 entries** = `git ls-files -co --exclude-standard` (945) minus the 11 grants in `b-round-132-r133-grants.txt`. `sha256sum -c --quiet` was OK at planning, run from `store/`.
- **Start hashes of the 11 grants:** `b-round-132-r133-granted-start-sha256.txt`. **Start copies:** `b-round-132/r133-granted-start/` (paths relative to `store/`; `sha256sum -c` OK there at planning). A checks both at the start. If a hash differs, A stops and reports.

## 0. Why this round (D-29z98)
- **Round 132: C PASS**, `browserVerified` = `realVerified` = true, no bugs. TEMPO, METRO and ZOOM texts were exact at both viewports with unchanged effects (the clip kept start 2.000 / width 150.372 s through every tempo step: grid tempo is not audio stretch). Gate 132 published `b25507e` (verify OK, review 9/10). **V-0.2c2 is done.**
- `tasks/round-132.md` §8 fixed this step: after a V-0.2c2 PASS, round 133 = **V-0.2c3**: `selection.ts` + `groups.ts`. B re-measured first (below).
- The regression round is not due: `regression-last.json` is dated 2026-10-24 (round 122); the next one is due on or after 2026-10-27. No Critical, High or Medium finding is open. `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist.
- **B's measurement (exact greps at `b25507e`):**
  - Source: 6 Georgian lines in `selection.ts` (l.7, 38–42) and 10 in `groups.ts` (l.3, 222, 474–479, 490, 495).
  - Raw hits of these texts outside the two sources: 12 in 7 files. **9 pins in 5 test files are granted** (§2). The other 3 (`grid-snap-loop-drop` l.441/551 and `ArrangementLane.tsx` l.893) are the lane-ghost literal and stay frozen (next bullet). There are 0 hits in `e2e/`.
  - Module-built users that need no change: `marker-snap.test.tsx` l.676, `grid-snap-clip-edges.test.tsx` l.932, and the `trackGroupRefusalMessage(...)` lines in `track-groups-ui`.
  - `grid-snap-loop-drop.test.tsx` l.441 and l.551 pin `'00:05.000 · აქ ადგილი არ არის'`. That is the **library drop ghost** literal in `ArrangementLane.tsx` l.893 (V-0.4), **not** `CLIP_LANE_REFUSAL_MESSAGES.overlap`. They stay unchanged and are not granted.
  - **The ArrangementContext and every component stay frozen.**
- **Ruling D-29z98 R1 — `TRACK_GROUP_NAME_PREFIX` (`'ჯგუფი'`, the default group name) moves in V-0.4, not here.**
  - It is used as data in **180 fixture lines in 7 test files** (`track-group-mix-ui` 86, `track-group-collapse-ui` 60, `track-groups-ui` 21, `groups.test` 7, `track-group-mix.test` 4, `group-volume-db` 1, `fader-touch` 1). Round 132 had 14 pins; §8 said "split if larger".
  - It is an app-created default **name**, the same class as the default track names and the `library.ts` kind/folder labels already ruled into V-0.4 (GATE130-S2, D-29z96). Moving it alone would not un-mix the created/ungrouped sentences, because the track names in them stay Georgian until V-0.4.
  - This is V-0.4 scope, not a deferral. Tracked as **GATE133-GROUP-PREFIX** (V-0.4).
- **Ruling D-29z98 R2 — the `groups.ts` per-file scan allows exactly one line.** ST22 scans `groups.ts` with the single declaration line `export const TRACK_GROUP_NAME_PREFIX = 'ჯგუფი';` removed **by exact text**. Any other Georgian codepoint in `groups.ts` turns ST22 red. V-0.4 removes the allowance.
- **Ruling D-29z98 R3 — two composite surfaces become two-language for a while (tracked, like GATE132-TEMPO-CLEARED-MIXED):**
  - **GATE133-LANE-RELEASE-MIXED (V-0.4):** `ArrangementClip.tsx` l.738 builds the refused-release status `${laneRefusal} — ${CLIP_LANE_REFUSAL_KEPT_PLACE}: ${laneName}, start …`. The tail `კლიპი ბოლო თავისუფალ ადგილას დარჩა` lives in the frozen `ArrangementClip.tsx` (V-0.4). After this round the status reads `No room here — კლიპი ბოლო თავისუფალ ადგილას დარჩა: მუსიკა, start 00:01.375.` `clip-fades-ui.test.tsx` l.525 pins it through its `OVERLAP_TEXT` constant, which becomes a hand-written English literal.
  - **GATE133-LANE-HINT-MIXED (V-0.3):** `StudioWorkspace.tsx` l.2574–2579 renders `{laneMoveRefusal} · {CLIP_LANE_SHIFT_HINT}`. The Shift hint (`Shift — დრო ჩაიკეტება, შეიცვლება მხოლოდ ხაზი`, l.142–143) is V-0.3 workspace chrome. No test pins that paragraph, so C subtracts the hint by name.
  - The lane ghost text `აქ ადგილი არ არის` (library drop and clip lane drag, `ArrangementLane.tsx`) is already tracked as GATE130-S1 (V-0.4, must reuse the status English).
  - Keeping the refusals Georgian instead would leave `selection.ts` half-migrated and still mix the same two surfaces after V-0.3. The single-clip blocked status `გადატანა დაბლოკილია — …` (`ArrangementClip.tsx` l.586) also stays Georgian until V-0.4, while the group version becomes English. These are separate status lines, never one line.
- **Folded in (cheap; the round already owns the code or it is one line):**
  - **GATE132-S5 (doc 108 status line):** l.4 still says the browser check is pending. One line changes.
  - **GATE130-S3 forward rule:** each new formatter and each moved plain string that a UI test already reaches gets **one hand-written English literal in a UI test** (§3.2). No `it` is added.

## 1. What changes (user-visible)
Two new exported objects in `app/lib/arrangement/strings.ts`: **`studioLaneMoveStrings`** and **`studioTrackGroupStrings`**. Every Georgian literal below moves there, in English.

**Text only.** None of these change:
- `planClipLaneMove`, the refusal codes, their order of checks, or `findClipPlacementConflict`;
- group create/ungroup/fold logic, nesting, the selection rules, `nextTrackGroupName` (l.310–317, which uses the prefix);
- any condition, the order of checks, or any non-string expression.

### 1.1 The English map (exact text; A may not reword it — if a line seems wrong, report it and B rules)
Notation: `{name}` = a group name string; `{members}` = the member names **already joined** with `', '` in `groups.ts`; `{names}` = the quoted group names **already joined** with `', '` in `groups.ts`.

| # | Where today (baseline line) | Object.key (A may rename the key, not the text) | English |
|---|---|---|---|
| L1 | `selection.ts` l.7 `GROUP_MOVE_BLOCKED_MESSAGE` | `studioLaneMoveStrings.groupMoveBlocked` | `Group move stopped — a neighbouring clip or the start of the timeline.` |
| L2 | `selection.ts` l.38 `'video-clip'` | `studioLaneMoveStrings.videoClipKeepsTrack` | `A video clip does not change tracks — the group moves in time only.` |
| L3 | `selection.ts` l.39 `'video-lane'` | `studioLaneMoveStrings.audioNotOnVideoTrack` | `Audio does not move to the video track` (no final period, as today) |
| L4 | `selection.ts` l.40 `'out-of-range'` | `studioLaneMoveStrings.noTrackForPart` | `There is no track for part of the group — only the time changes.` |
| L5 | `selection.ts` l.41 `'before-start'` | `studioLaneMoveStrings.partBeforeStart` | `Part of the group would go before the start of the timeline (0) — the track does not change.` |
| L6 | `selection.ts` l.42 `overlap` | `studioLaneMoveStrings.noRoom` | `No room here` (no final period, as today; the ArrangementClip composite appends ` — …`) |
| G1 | `groups.ts` l.222 `TRACK_GROUP_COLLAPSE_EMPTY_MESSAGE` | `studioTrackGroupStrings.foldNeedsGroup` | `To fold a group, select it first — click the group name.` |
| G2 | `groups.ts` l.474 `empty` | `studioTrackGroupStrings.groupNeedsTracks` | `To group tracks, select them first — Ctrl+click or Shift+click a track name.` |
| G3 | `groups.ts` l.475 `unknown` | `studioTrackGroupStrings.trackGone` | `A selected track no longer exists — select again.` |
| G4 | `groups.ts` l.476 `video` | `studioTrackGroupStrings.videoNotGroupable` | `The video track cannot be grouped.` |
| G5 | `groups.ts` l.477 `mixed-parents` | `studioTrackGroupStrings.mixedLevels` | `Only tracks at the same level can be grouped together — the selected tracks are in different groups.` |
| G6 | `groups.ts` l.478 `gap` | `studioTrackGroupStrings.notAdjacent` | `Only adjacent tracks can be grouped together — the selection skips a track.` |
| G7 | `groups.ts` l.479 `'no-group'` | `studioTrackGroupStrings.ungroupNeedsGroup` | `To ungroup, select a group — click the group name.` |
| G8 | `groups.ts` l.490 `trackGroupCreatedMessage` | `studioTrackGroupStrings.created({name, members})` | `Group “{name}” created: {members}.` |
| G9 | `groups.ts` l.494 per-name quoting `«…»` | `studioTrackGroupStrings.quoted(name)` | `“{name}”` |
| G10 | `groups.ts` l.495 singular branch | `studioTrackGroupStrings.ungroupedOne(names)` | `Group {names} ungrouped.` |
| G11 | `groups.ts` l.495 plural branch | `studioTrackGroupStrings.ungroupedMany(names)` | `Groups {names} ungrouped.` |

Examples that must come out exactly:
- `trackGroupCreatedMessage('ჯგუფი 1', ['მუსიკა', 'სტემები'])` → `Group “ჯგუფი 1” created: მუსიკა, სტემები.`
- one group named `ჯგუფი 2` → `Group “ჯგუფი 2” ungrouped.`; two groups `A`, `B` → `Groups “A”, “B” ungrouped.`

- **Quotes (R5):** the Georgian `«…»` become English curly quotes `“…”`, the same convention as `studioLibraryStrings` and `studioVideoStrings` (`“{title}”`). Group and track names themselves are user/default content and are **not** translated (M2).
- **Facts that must survive (a dropped one is Medium):**
  - L1: both reasons, "a neighbouring clip" **and** "the start of the timeline";
  - L2: the video clip keeps its track, the group still moves in time;
  - L4: only the time changes; L5: the `(0)` start and "the track does not change";
  - G2: both modifiers `Ctrl+click` and `Shift+click`, and "a track name";
  - G1 / G7: "click the group name";
  - G5 / G6: the reason after the dash;
  - G8: the group name and the member list; G10 / G11: the singular/plural difference.
- **Exported names stay; their values move.**
  - `GROUP_MOVE_BLOCKED_MESSAGE = studioLaneMoveStrings.groupMoveBlocked`.
  - `CLIP_LANE_REFUSAL_MESSAGES` keeps its name and its type `Record<ClipLaneMoveRefusal, string>`; each value is the module value (L2–L6).
  - `TRACK_GROUP_COLLAPSE_EMPTY_MESSAGE = studioTrackGroupStrings.foldNeedsGroup`.
  - The local map `GROUP_TRACKS_REFUSAL_MESSAGES` keeps its name and type; its values are the module values (G2–G7). `trackGroupRefusalMessage` is unchanged.
  - `trackGroupCreatedMessage(groupName, memberNames)` keeps its signature and returns `studioTrackGroupStrings.created({ name: groupName, members: memberNames.join(', ') })`.
  - `trackGroupDissolvedMessage(groups)` keeps its signature. `names` becomes `groups.map((group) => studioTrackGroupStrings.quoted(group.name)).join(', ')`, and the **existing** `groups.length === 1 ? … : …` branch stays in `groups.ts` and picks `ungroupedOne(names)` / `ungroupedMany(names)`.
  - `TRACK_GROUP_NAME_PREFIX` is **unchanged** (R1).
  - These importers stay frozen: `ArrangementClip.tsx`, `StudioWorkspace.tsx`, `ArrangementContext.tsx`.
- **Imports:** `selection.ts` and `groups.ts` may import their object from `./strings`. `strings.ts` imports nothing, so no cycle can appear.
- **Unchanged this round** (they stay Georgian; C subtracts them by name):
  - (a) the default group names `ჯგუფი N` wherever they appear (R1, V-0.4) and the track names (`მუსიკა`, `სტემები`, `SFX`, …);
  - (b) the release tail `კლიპი ბოლო თავისუფალ ადგილას დარჩა` and the single-clip `გადატანა დაბლოკილია — …` status in `ArrangementClip.tsx` (V-0.4, R3);
  - (c) the lane-drag Shift hints in `StudioWorkspace.tsx` l.142–143 (V-0.3, R3);
  - (d) the lane ghost texts in `ArrangementLane.tsx` (`… · აქ ადგილი არ არის`, `აუდიო ვიდეოხაზზე არ ემატება`, `ხმა ჯერ არ ჩატვირთულა`; GATE130-S1, V-0.4);
  - (e) the group header and lane controls (`ArrangementGroupHeader`, lane names, fold button labels; V-0.4) and the move/trim history labels such as `გადატანა (n)` (V-0.4, D-29z95).
- **Glossary additions** (doc 109 and the backlog glossary; Live 12 §18.3 terms, excerpt below):
  - Group Tracks / Ungroup Tracks (`დაჯგუფება` / `დაშლა`; already the Undo labels);
  - fold (`დაკეცვა`) — Live's "Fold/Unfold Group";
  - group move (`ჯგუფის გადატანა`), timeline start (`დროის დასაწყისი`), neighbouring clip (`მეზობელი კლიპი`);
  - No room here (`აქ ადგილი არ არის`) — the short form of `studioLibraryStrings.dropBlocked`;
  - same level (`ერთი დონე`), adjacent tracks (`მეზობელი ხაზები`).

### 1.2 Contract clarification (R6, answers gate 132 suggestion 6 and the round-132 reviewer's Low 3)
- Formatters take **plain strings or numbers that are already formatted for display** (a joined list, a formatted time, a rounded number). They do not join arrays, round or format time themselves.
- Branches that only choose between two texts (`groups.length === 1 ? … : …`, `bpm === null ? … : …`) **stay in the caller** and pick module values. The module holds no branching logic.
- Pure wrapping of an argument in fixed text (`quoted(name)`, `created({name, members})`) is allowed.

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/strings.ts` | Add the two objects with L1–L6 and G1–G11. The ten existing objects are unchanged. It still imports nothing |
| `app/lib/arrangement/selection.ts` | **Only:** the import, l.6–7 (`GROUP_MOVE_BLOCKED_MESSAGE` value) and l.37–43 (the `CLIP_LANE_REFUSAL_MESSAGES` values) |
| `app/lib/arrangement/groups.ts` | **Only:** the import, l.221–222, l.473–480 (the map values), l.490, l.494–495 as described in §1.1. l.3 is unchanged |
| `app/lib/arrangement/__tests__/strings.test.ts` | New `describe('V-0.2c3 lane-move and track-group strings')` with ST20–ST22 (§3.1). ST1–ST19 are unchanged |
| `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | **Only l.110** `GROUP_BLOCKED_STATUS` → the hand-written L1 English |
| `app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | **Only l.402** `GROUP_BLOCKED_TEXT` → the hand-written L1 English |
| `app/lib/arrangement/__tests__/grid-snap-edit.test.tsx` | **Only l.115–117**: `BEFORE_START_TEXT`, `OUT_OF_RANGE_TEXT`, `OVERLAP_TEXT` → the hand-written L5, L4, L6 English. The l.597–599 comparisons stay as they are (they now compare the module with hand-written English) |
| `app/lib/arrangement/__tests__/clip-fades-ui.test.tsx` | **Only l.110** `OVERLAP_TEXT` → `'No room here'`. l.525 is unchanged in source and now asserts the R3 composite `No room here — კლიპი ბოლო თავისუფალ ადგილას დარჩა: მუსიკა, start 00:01.375.` |
| `app/lib/arrangement/__tests__/track-groups-ui.test.tsx` | l.453, l.500 and l.521 → the hand-written English (§3.2). **Add** the forward-rule literal lines of §3.2 inside existing `it`s. Rename **only** the TG5 title words `with a Georgian status` → `with an English status` (the title would otherwise be false). Nothing else |
| `app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx` | **Add** one forward-rule literal after l.520 (§3.2). Nothing else |
| `docs/implementation/2026/quarter-IV/108-studio-v0-tempo-metronome-view-strings.md` | **Only l.4** → `**სტატუსი:** Completed (A-ის შემოწმებები მწვანეა რაუნდ 132-ში; C round 132 — PASS, browserVerified; gate 132 — b25507e)` |
| **new** `docs/implementation/2026/quarter-IV/109-studio-v0-lane-move-group-strings.md` | Sections from TEMPLATE.md, in Georgian: the L/G map; rulings R1 (prefix → V-0.4, GATE133-GROUP-PREFIX), R2 (the one-line scan allowance), R3 (GATE133-LANE-RELEASE-MIXED, GATE133-LANE-HINT-MIXED), R5 (quotes), R6 (the contract clarification); the facts that must survive; the glossary additions; the tests and the mutations. The status line says Completed only after §4 is green, and names C's round as still to come |

- **Test rules (as in rounds 129–132):**
  - The UI pins in §2 and §3.2 use **hand-written English literals** (GATE130-S3).
  - No `it` is added or removed outside the new `describe` in `strings.test.ts`. The only renamed title is TG5, words above.
  - Line numbers are baseline (`b25507e`) positions. Find each by its text.
- **Pre-edit grep (A records it):** for each L/G row, grep the old Georgian text in `app/**` and `e2e/**`. B's grep found only the lines in §2 plus the ghost literal in `ArrangementLane.tsx` l.893 and its two pins in `grid-snap-loop-drop` (frozen, R3 (d)). If A finds another pin, that is a stop-rule case.
- **Stop rule:** stop and report (B rules) if any of these happens:
  - a test outside §2 asserts an old text, or turns red;
  - a change needs a frozen file or a non-string line;
  - an import cycle or a module-load order problem appears (e.g. a constant reads `undefined`);
  - the `noUncheckedIndexedAccess`/strict types force a non-string change in `trackGroupDissolvedMessage`.
- **Expected end state:** `git status` shows 11 ` M` + 1 `??` (doc 109) and no other path. The frozen list is OK at the start and at the end. Report the end sha256 of the 12 paths.
- **Protected (unchanged; `git diff b25507e` on them is empty):**
  - `app/routes/studio.$productId.tsx`;
  - `app/routes/api.studio-token.ts`;
  - `app/lib/auth.ts`;
  - `app/contexts/AuthContext.tsx`;
  - `app/components/ui/Modal.tsx`;
  - everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`.
- **Forbidden actions:** commit, push, stash, checkout, reset, deploy, dev-server restart, `npm install`, `npm run check:fix` / any `--write`, `npm run format`.
- **Edit rule (C-R120-01):** lasting edits only with the Edit/Write tool. Shell writes are allowed only for temporary mutations, which are restored and checked by sha256. List every shell write.
- **Before editing, read:**
  - `.claude/primitives-map.json`;
  - `AGENT_DISCOVERABLE_CODE.md`;
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` (and no new `as const`), semicolons, no code comments.

## 3. A — tests and mutations
### 3.1 `strings.test.ts`: ST20–ST22 (the file goes from 19 to 22 `it`s)
- **ST20:**
  - Every plain-string property of the two objects equals its exact English literal from §1.1 (`toBe`).
  - The key list of each object equals the expected list.
  - `GROUP_MOVE_BLOCKED_MESSAGE`, `TRACK_GROUP_COLLAPSE_EMPTY_MESSAGE` and each of the five `CLIP_LANE_REFUSAL_MESSAGES` values are `toBe` the hand-written English. The key list of `CLIP_LANE_REFUSAL_MESSAGES` is unchanged (`video-clip`, `video-lane`, `out-of-range`, `before-start`, `overlap`).
- **ST21:** every formatter and export returns the exact English, with `toBe`:
  - `created({name: 'Drums', members: 'Kick, Snare'})`, `quoted('A')`, `ungroupedOne('“A”')`, `ungroupedMany('“A”, “B”')`;
  - `trackGroupRefusalMessage` for all six reasons (`empty`, `unknown`, `video`, `mixed-parents`, `gap`, `no-group`);
  - `trackGroupCreatedMessage('ჯგუფი 1', ['მუსიკა', 'სტემები'])` → `Group “ჯგუფი 1” created: მუსიკა, სტემები.`;
  - `trackGroupDissolvedMessage` with one typed group (`{id: 'g1', name: 'ჯგუფი 2', parentId: null}`) → `Group “ჯგუფი 2” ungrouped.` and with two (`A`, `B`) → `Groups “A”, “B” ungrouped.`;
  - `TRACK_GROUP_NAME_PREFIX` is still `toBe('ჯგუფი')` (documents R1).
- **ST22:**
  - No plain value or formatter output of the two objects contains a Georgian codepoint (formatters called with Latin inputs).
  - **Per-file scan:** after comments are stripped, `selection.ts` contains no Georgian codepoint; `groups.ts` contains none after the single exact line `export const TRACK_GROUP_NAME_PREFIX = 'ჯგუფი';` is removed (R2). The test also asserts that this exact line is present exactly once, so the allowance cannot silently widen.

### 3.2 Forward-rule UI literals (hand-written English)
- `track-groups-ui.test.tsx`:
  - **TG-UI1** l.453 (TG1): `toBe('Group “ჯგუფი 1” created: მუსიკა, სტემები.')` (replaces the Georgian literal).
  - **TG-UI2** l.500 (TG3): `toBe('Group “ჯგუფი 2” created: მუსიკა, ჯგუფი 1.')` (replaces).
  - **TG-UI3** l.521 (TG4): `toBe('Group “ჯგუფი 2” ungrouped.')` (replaces).
  - **TG-UI4** after l.477 (TG2): status `toBe('To group tracks, select them first — Ctrl+click or Shift+click a track name.')` (added; the module-built line stays).
  - **TG-UI5** after l.479 (TG2): `toBe('To ungroup, select a group — click the group name.')` (added).
  - **TG-UI6** after l.551 (TG5): `toBe('The video track cannot be grouped.')` (added).
  - **TG-UI7** after l.556 (TG5): `toBe('Only adjacent tracks can be grouped together — the selection skips a track.')` (added).
  - **TG-UI8** after l.563 (TG5): `toBe('Only tracks at the same level can be grouped together — the selected tracks are in different groups.')` (added).
- `track-group-collapse-ui.test.tsx`:
  - **TC-UI1** after l.520: status `toBe('To fold a group, select it first — click the group name.')` (added).
- The L1, L4, L5, L6 literals are the replaced constants in `grid-snap-ui`, `status-announcement-ui`, `grid-snap-edit` and `clip-fades-ui` (§2).
- L2, L3 and G3 have no UI test that reaches them today; they are pinned by ST20/ST21 only, and C checks L3 in the browser (§5).
- If an anchor line is inside a loop or helper, so the literal would run with other values, A puts it at the nearest single-value point in the same `it` and reports where.

### 3.3 Mutations (each turns the named tests red; restore and check by sha256)
| Mutation | Change | Must turn red |
|---|---|---|
| **m19** | `groupMoveBlocked` drops ` or the start of the timeline` | ST20, grid-snap-ui (the `GROUP_BLOCKED_STATUS` `it`) **and** status-announcement-ui SK3 |
| **m20** | `noRoom` back to `'აქ ადგილი არ არის'` | ST20, ST22, grid-snap-edit (l.599 and the l.648 `it`) and clip-fades-ui FU5 |
| **m21** | `groups.ts` swaps the `ungroupedOne` / `ungroupedMany` picks | ST21 and TG4 (TG-UI3) |
| **m22** | `groups.ts` l.490 returns the old Georgian template | ST21, ST22 (per-file scan) and TG1 (TG-UI1) |
| **m23** | `foldNeedsGroup` drops ` — click the group name` | ST20 and the collapse `it` (TC-UI1) |

## 4. A — checks (speed rules)
- `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the 10 changed code and test files.
- `npx vitest run` on these files. Every one must be green. Name the exact list and counts in the report; C runs the same list.
  - The granted tests: `strings`, `grid-snap-ui`, `status-announcement-ui`, `grid-snap-edit`, `clip-fades-ui`, `track-groups-ui`, `track-group-collapse-ui`.
  - The name-only importers and neighbours: `selection`, `groups`, `track-group-collapse`, `track-group-mix`, `track-group-mix-ui`, `group-volume-db`, `fader-touch`, `marker-snap`, `grid-snap-clip-edges`, `grid-snap-loop-drop`, `delete-selection-ui`. If one of these file names does not exist, report it and do not invent one.
- No full suite and no `npm run verify` (the gate runs them).
- **code-reviewer required** (12 paths). Pass its Architecture note to B.
- **Report `a-round-133.md`:**
  - start HEAD, frozen OK and the 11 start hashes;
  - the pre-edit grep;
  - per granted file, the changed keys and lines (`diff -u` vs `b-round-132/r133-granted-start/`, saved as `a-round-133/granted.diff`);
  - `it` counts before and after, per file;
  - m19–m23;
  - typecheck and lint results;
  - the reviewer's verdict and Architecture note;
  - every shell write;
  - end `git status`, frozen OK, and the 12 end hashes;
  - deviations.

## 5. C — rows
Real Playwright Chromium, a fresh context per session, **1440×900 and 1280×720**, `http://127.0.0.1:5173/studio-lab`.
- **Tools:** reuse `c-round-132/tools/` (status reading, MutationObserver on the status region, GEO count, layout compare) and:
  - `c-round-122/tools/` (RG-17: lane-name click / Shift+click, Ctrl+G, F2, fold, group rows);
  - `c-round-123/tools/` (P2/P3: clip drag to another lane, the occupied ghost, `arrangement-lane-move-hint` / `arrangement-lane-move-refusal`).
  - For a clip, use the library add (**＋ დამატება, or Enter on a focused option**). Shortcuts: Ctrl+G = Group Tracks, Ctrl+Shift+G = Ungroup Tracks, U = fold the selected group.
- **Invalid runs:** ENV-FIRST-LOAD — discard one crashed first load and record it under `invalidRuns`. At most 2 replacement attempts per row, and only for runs that are invalid because of the environment.
- **Evidence:** a unique file per run. Open every screenshot with Read and describe it.
- **Reading values:** read the status from the live status region and record every text change with a MutationObserver; read the lane-move hint paragraph `textContent` during the drag.

| ID | Action | Expected (PASS) |
|---|---|---|
| **T133-TARGETED** | A's exact §4 vitest list | All green; the counts equal A's |
| **SOURCE-SCOPE** | `git status`; `sha256sum -c --quiet b-round-132-r133-tree-sha256.txt` (from `store/`); protected `git diff b25507e` | 11 ` M` + 1 `??`; frozen OK; protected files unchanged; no source change during C's phase |
| **AN-REVIEW** | `diff -u` of each grant vs `b-round-132/r133-granted-start/`; read doc 109 | **`strings.ts`:** two new objects and nothing else changed; still no import.<br>**`selection.ts` / `groups.ts`:** only the import and the string expressions of §2. `planClipLaneMove`, the refusal codes, the group logic, l.3 and the `groups.length === 1` branch are unchanged.<br>**Doc 108:** only l.4.<br>**Tests:** every hunk is an import, a Georgian → hand-written English literal with the same matcher, an added forward-rule `expect`, the TG5 title words, or ST20–ST22; no `it` added or removed outside `strings.test`; no `skip`, `only` or `todo`.<br>**Meaning check:** side by side with the Georgian, no L/G row drops or adds a fact (§1.1 list).<br>Every shell write is listed |
| **GROUP** (both viewports) | Fresh project. (a) Ctrl+G with no track selected. (b) Click the music track name, Shift+click stems, Ctrl+G. (c) Select the video track name with music (Ctrl+click), Ctrl+G. (d) Ctrl+click music and SFX (a gap), Ctrl+G. (e) Select only the music track name, press U. (f) Click the group name, press U, then U again. (g) Click the group name, Ctrl+Shift+G. (h) Select a track name only, Ctrl+Shift+G | (a) `To group tracks, select them first — Ctrl+click or Shift+click a track name.`<br>(b) `Group “ჯგუფი 1” created: მუსიკა, სტემები.`; the group row appears, Undo label `Group Tracks`.<br>(c) `The video track cannot be grouped.`<br>(d) `Only adjacent tracks can be grouped together — the selection skips a track.`<br>(e) `To fold a group, select it first — click the group name.`<br>(f) the group folds and unfolds as before.<br>(g) `Group “ჯგუფი 1” ungrouped.`; Undo label `Ungroup Tracks`.<br>(h) `To ungroup, select a group — click the group name.`<br>**Effect:** refusals leave the rows, the selection and the Undo label unchanged; create/ungroup change the rows exactly as before. C states the effect next to each message. If a step's selection gesture differs from the rounds 122 tools, C uses the gesture that reaches the same refusal code and names it |
| **LANE** (both) | Fresh project; add a library clip on music and another on stems that overlaps the first in time. (a) Drag the music clip right by about 1 s on its own lane first, then down onto the stems lane where it overlaps (the same gesture as `clip-fades-ui` FU5; a purely vertical drag may not produce the release composite); read status and the hint paragraph during the drag, then release. (b) Drag an audio clip onto the video lane. (c) Select two clips on different tracks, drag them so one would leave the bottom track; then so one would go before 0. (d) Select two clips and press ← until the left one is at 0 | (a) During the drag: status `No room here`; the hint paragraph starts `No room here · ` followed by the frozen Georgian Shift hint (R3, subtracted by name). After release: `No room here — კლიპი ბოლო თავისუფალ ადგილას დარჩა: მუსიკა, start …` (R3 exact shape) and the clip stays on music at the last free place, as before.<br>(b) `Audio does not move to the video track`; the clip does not change track.<br>(c) `There is no track for part of the group — only the time changes.` and `Part of the group would go before the start of the timeline (0) — the track does not change.`<br>(d) `Group move stopped — a neighbouring clip or the start of the timeline.` (announced once per press).<br>**Effect:** clip positions and tracks are exactly what the rule allows, as before. Any step whose gesture cannot be reached in Chromium is **inconclusive** with the reason (unit-only), not FAIL |
| **GEO-COUNT** (both) | After each row step | Georgian in the status region and in the `arrangement-lane-move-refusal` span = 0 after removing **by name**: the group names `ჯგუფი N`, the track names, the R3 release tail `კლიპი ბოლო თავისუფალ ადგილას დარჩა`, the Shift hint (outside the refusal span), the lane ghost texts, the single-clip `გადატანა დაბლოკილია — …` status if it appears, the load-time demo-ready status, the grid statuses written by a division change, and the clip/sound titles. List each subtracted item |
| **LAYOUT** (both) | S0/S1 boxes vs `c-round-125/out/bbox-baseline-*.json`, outside the status region; the lane-move hint paragraph box during a refused drag | Every box outside the status region and the hint paragraph is within 1 px. A width or wrap change of those two must come from their text (the RV-1 V-0 text-width exception). No new horizontal overflow; if the English hint line wraps where the Georgian did not, C records the measurement as a Low |
| **REG-132** (1440, short) | Type `90` in the BPM field, Enter | `Tempo 90 BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched.` |
| **G133-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` | The workspace and the demo badge show. The product route shows "Sign in required", no workspace and 0 `audio[src]`. The token API returns **401**. The fake-Bearer 403 check is **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 requests to `/api/studio-token` (outside G133-3), `/api/recording-*`, `/api/download` or the R2 host; 0 `Authorization` headers; 0 hydration errors; 0 `pageerror` (the known cloud cart noise is not reported) |

- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:**
  - **Medium:**
    - any behaviour change: a group created, refused, folded or ungrouped differently; a clip moved to a different place or track than before; a refusal code changed;
    - a wrong or fact-dropping message (§1.1 list);
    - a weakened, removed or skipped test;
    - a non-string hunk in `selection.ts` or `groups.ts`.
  - **Low:** wording or style; a hint wrap caused by the English text.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Group Tracks / Ungroup Tracks | Live 12 Reference Manual §18.3 "Group Tracks", `https://www.ableton.com/en/live-manual/12/mixing/`. Saved capture `b-round-78/ableton-mixing-20261022.txt` (Playwright, 2026-10-22, sha256 `792522f0…`), l.90 and l.100 | "select the tracks to include and execute the Edit menu's Group Tracks command"; "a group can be reverted back into individual tracks by executing the Edit Menu's Ungroup Tracks command" | Existing CZABA behaviour (SRW-17, rounds 79–80). The command names are already the Undo labels. Text only this round | GROUP |
| Fold / Unfold a group | Same capture, l.96 ("shown or hidden via the Unfold Group button") and l.104 ("A Folded Group Track in Arrangement View") | The fold/unfold term | "fold" in G1; the U shortcut is CZABA's own (not confirmed as a Live shortcut) | GROUP (e, f) |
| Refusal texts (adjacent tracks, same level, video track, lane-move refusals) | No Live source | — | CZABA's own rules (one video track, contiguous same-level grouping, no overlaps on one track). No Ableton claim is made | AN-REVIEW |

C rates "CZABA requirement met" and "Ableton correspondence" separately. For this round the Ableton correspondence is **not applicable / unconfirmed** apart from the reused command terms: only text changes, and no new Live behaviour is claimed.

## 7. Evidence and reporting
- C writes `c-round-133.md` and `c-round-133.json` as it goes, with these fields: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` (with the subtracted items), and `notesForB`. Evidence goes under `c-round-133/{tools,out,shots}/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`; gestures that Chromium truly cannot reach go under `inconclusive` with the reason.
- C makes no `store/` writes.

## 8. Outcome, fixed in advance (B at round 134 planning)
| Condition | Round 134 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.2c3 fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.2c3 → `c_pass`, then `c_pass_published` after the gate; **V-0.2 is complete**. Before V-0.3 is dispatched, root runs the bounded frontend-architect checkpoint `b-round-130-checkpoint-request.md` (addenda (e), (f)): the `strings.ts` split decision must land **before** V-0.3 adds component texts. If root has the result, round 134 = the approved split (if any) or **V-0.3 stage 1**, measured first and split by component if larger than one round. If the checkpoint has not run yet, B plans V-0.3 stage 1 on the files that do not depend on the split decision and records why |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Where it could break:**
  - **The group create/ungroup statuses:** the quotes change from `«»` to `“”`; any C tool or old evidence matching `«` will not match.
  - **The lane drag:** the refused-release status and the hint paragraph become two-language (R3).
  - **Module load order:** `selection.ts` and `groups.ts` constants are evaluated at import from `strings.ts`; a cycle would show as `undefined` text (stop rule).
  - **The keyboard group nudge** (`ArrangementContext.tsx` l.1758) reads `GROUP_MOVE_BLOCKED_MESSAGE`; the held-key once-per-press behaviour must stay (status-announcement-ui SK3).
- **Architecture:** no Context or component change this round. Addendum (f) to `b-round-130-checkpoint-request.md` asks root to run the checkpoint before V-0.3 (gate 132 Architecture note). It does not block A or C in this round.
- **Commit readiness:** after C PASS, root may publish V-0.2c3 as an interim unit; that closes V-0.2.
