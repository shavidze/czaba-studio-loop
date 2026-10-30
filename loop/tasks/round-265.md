# Round 265: SABA-B-11c stage 1. A time selection on the empty lane background, no clamp to one clip, the marquee on Ctrl/Cmd+drag

**Planned by:** B, at the round 264 → 265 planning, 2026-10-30. **Decisions:** D-29z552 (L46-CONTRACT-CHECKS done), D-29z553 (11c split; relative snap waits for Saba), D-29z554 (marquee on Ctrl/Cmd+drag + Saba questions), D-29z555 (grants, doc 198), D-29z556 (outcome table), D-29z557 (rulings: copy, range bound, focus), D-29z558 (gate-264 triage: GATE264-S2).
- **Read first:** `lessons.md` in full. These apply directly:
  - L4 (one element, one rule: §2.3);
  - L11 (STOP);
  - L12 (no class selectors);
  - L23 (the collisions below come from B's scratch run);
  - L29 (claims, §7);
  - L31 (timeouts);
  - L39 (screen budget);
  - L43/L44 (the deviations go to Saba as questions);
  - L47/L50 (focus, §2.6);
  - L49 (the replaced marquee branch keeps its side effects, §2.4);
  - L51 (no new status write).
- **Previous task:** `tasks/round-264.md` (an exact copy of the round-264 `current-task.md`). C's result: `c-round-264.json` (PASS, 13 rows, `browserVerified` true). The gate's result: `gates/gate-round-264.json` = **published**, commit `2ea196e`. B's reasoning: `b-round-264.md`.
- **Source of the scope:** policy section "SABA-B-9/10/11", task 6 (SABA-B-11c: "Time selection on an empty lane background, no clamp to one clip, relative snap"), and `docs/technical/studio-real-workspace/transport-grid-review.md` §4.3 "11c". **This round is stage 1 of 2.** Relative snap (stage 2) waits for Saba (§1).

## Baseline: published HEAD `2ea196e`
- `gates/gate-round-264.json`: `published`, commit `2ea196e20e6c3b9099db519f807eaa4a1d95a48a`, pushed to both remotes.
- `git rev-parse HEAD` = `2ea196e…`, and the working tree is clean (`b-round-264/head-at-planning.txt`, `b-round-264/git-status-at-planning.txt`, which is empty) [K1].
- **Frozen:** every tracked file except the 9 grants, **1,114** entries, in `b-round-264-r265-tree-sha256.txt`. From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-264-r265-tree-sha256.txt` returns rc 0 at planning. Each of the 7 protected auth and purchase files appears in it exactly once [K2].
- **Grant (edit):** `b-round-264-r265-grants.txt`, 9 files [K2]:
  - `app/components/arrangement/StudioWorkspace.tsx`, `ArrangementClip.tsx` and `ArrangementLane.tsx`; [K2]
  - `app/lib/arrangement/shortcuts.ts`; [K2]
  - in `app/lib/arrangement/__tests__/`, only the rows named in §2.5: `grid-snap-position.test.tsx`, `track-group-collapse-ui.test.tsx`, `track-groups-ui.test.tsx`, `grid-snap-edit.test.tsx` and `shortcuts.test.ts`. [K2]
- **Grant (new files):** `b-round-264-r265-new-files.txt` lists `app/lib/arrangement/__tests__/background-time-selection-ui.test.tsx` and `docs/implementation/2026/quarter-IV/198-saba-b-11c-background-time-selection.md`. Neither exists at planning, and 198 is the next free number [K3].
- **Not granted:** everything else. That includes `ArrangementContext.tsx`, `grid.ts`, `selection.ts`, `strings.ts`, `strings.test.ts`, `perf/**`, `e2e/**`, every other test file, `package.json`, `.claude/**`, `CLAUDE.md` and the 7 protected files. [K2]
- **Implementation doc 198:**
  - L26: its headings contain TEMPLATE's as an in-order subsequence.
  - L28: l.4 is exactly `In Progress (stage 1 of 2; C round 265 PASS)`. [K3]
  - It is written in Georgian and cites only rows that exist in the test files.

## 0. Why this round
- **L46-CONTRACT-CHECKS is done.** C round 264 PASSed with `browserVerified` true and 0 bugs, and gate 264 published `2ea196e`. The pre-fixed outcome (`tasks/round-264.md` §4) names SABA-B-11c stage 1 for a planning before 2026-11-02, and today is 2026-10-30.
- **Nothing outranks it:**
  - no Critical, High or Medium finding is open with a cloud reproduction;
  - SABA-B-7 is still `awaiting_user`;
  - the next REGRESSION is due on or after 2026-11-02;
  - the next RETRO is at round 275.
- **Ruler click (review §4.3, 11c bullet 4)** is already covered: the bars ruler and scrub strip by SABA-B-11a stage 2 (round 235), and the Insert Marker model by SABA-B-10a. It is not in this round.

## 1. Reference: how Ableton Live 12 does it (checked 2026-10-30)
Sources:
- **[AV]** the Live 12 manual, Arrangement View, https://www.ableton.com/en/live-manual/12/arrangement-view/, fetched by B on 2026-10-30;
- **[SC]** the Live 12 manual, Live Keyboard Shortcuts, cited by the `ableton-arrangement-expert` consult from the saved capture `b-round-71/ableton-shortcuts-20261021.txt`;
- **[riOD]** the official Ableton video "Learn Live: Arrangement View", https://www.youtube.com/watch?v=riOD-fnyCsg at 1:37, as summarised by root in `reference/youtube/SABA-B-9-10-11-transcripts.md` (root watched it; B did not).

No hands-on Live session was available. Each row below is labelled **confirmed** (a quoted source) or **unknown** (no source found).

| Behaviour | Source | What the source says | CZABA, this round | C row |
|---|---|---|---|---|
| Drag on the background | [AV] 6.9 (confirmed) | "Clicking into the Arrangement background selects a point in time, represented by a flashing insert marker. Clicking and dragging selects a timespan." | A plain drag on an empty lane background makes a time selection on that lane | BG-RANGE |
| Click on the background | [AV] 6.9 (confirmed) | (as above) | Unchanged: the insert marker | CLICK-SAME |
| Drag inside a clip | [AV] 6.9 (confirmed text; the clamp is **unknown**) | "Clicking and dragging in the clip's waveform or MIDI display allows you to select time within the clip." The `ableton-arrangement-expert` consult found no text on whether the selection stops at the clip edge | **Saba decision:** "no clamp to one clip". The range continues past the clip edge | CLIP-PAST-START |
| Snap of the selection | [AV] 6.10 (confirmed) | "the cursor will snap to grid lines …"; "hold down the Alt (Win) / Cmd (Mac) modifier while performing an action to bypass grid snapping. If the grid is switched off, using the modifier will temporarily enable it." | The same rule as today's in-clip range (grid + markers, Alt bypass, a hidden grid pauses Snap) | SNAP |
| Rubber-band (marquee) clip selection | [AV] 6.9 / [SC] 42.9 (**unknown**) | The manual describes no marquee. [SC] 42.9: "Add Items to a Selection: Shift click or drag"; "Add Nonadjacent Clips/Tracks/Scenes to a Multi-Selection: Ctrl click" | **Deviation D1:** the marquee stays (SRW-06 R6-S2) on Ctrl/Cmd+drag | MARQUEE-CTRL |
| Vertical drag across tracks | [riOD] 1:37 (video, root summary); [AV] 6.9 Shift-click "in the same track or across tracks" (confirmed); vertical drag itself **unknown** | The video shows a time range over one or several tracks | **Deviation D2:** the range stays on the lane where the drag started. Ctrl+Shift+L extends it to all tracks | VERTICAL |
| Off-grid clip drag (relative or absolute snap) | [AV] 6.7 / 6.10 (**unknown**) | "Clips snap to the editing grid, as well as …" The offset question has no source | **Not in this round** (stage 2, waits for Saba's R49-T answer) | none |
| Cursor over the background | **no reference found** (searched [AV] 6.9/6.10) | none | Unchanged (default cursor) | none |

### Deviations (each one goes to Saba once: `user-review/questions-11c.md`, L44)
- **D1, marquee on Ctrl/Cmd+drag (D-29z554).** Live documents no marquee. SRW-06 R6-S2 is an accepted CZABA feature, so it moves to Ctrl/Cmd, which already means "add to the selection" (marquee base l.2073 [K4]; clip Ctrl-click toggle [K5]). Shift stays free for Live's "Shift click … extends an existing selection" ([AV] 6.9). This follows the `flow-sage` consult (`b-round-264.md` §4): to start a fresh marquee, first click the background, which clears the selection.
- **D2, a range lives on one lane.** `TimeRange` is either one `trackId` or all tracks [K6]. A partial multi-lane range is not representable without a model change, so vertical movement is ignored.
- **Not a deviation:** "no clamp" is Saba's decision, not B's.

### Why we missed it (SABA-B-11, `transport-grid-review.md` §3.5)
- The background time selection was missing since SRW-14 stage 2 ("lane background has no time-range gesture"). The clamp was introduced with the clip-body range.
- The reference-first rule did not exist yet. No round compared the background drag with [AV] 6.9.
- The lessons that would have caught it are already in `lessons.md`: L45 (the reference's unit first) and L46 (a parked feel-check gets a deadline). They were added when SABA-B-11a was planned. C checks that both still exist (row LESSONS).

## 2. A: what to do
### 2.1 Behaviour (all lanes, video included: every lane uses the same background handler [K7])
1. **A plain background drag makes a range.**
   - Trigger: `pointerdown` with button 0 directly on the lane background, without Ctrl or Meta. Today's threshold applies: after the pointer moves `MARQUEE_THRESHOLD_PX` (4 px) [K4], the gesture becomes a time selection on the lane where it started, not a marquee.
   - Shift has no meaning on the background this round, and a Shift drag also makes a range.
   - The time under the pointer is computed as today (`clickTime`, l.2072 [K4]).
   - Snap uses the same rule as the in-clip range [K8]:
     - grid lines + markers;
     - `resolveSnapStep` with Alt;
     - a hidden grid gives no snap;
     - when both ends snap onto one line, there is no range (`setTimeRange(null)`).
   - The range updates on every move, and the last move wins.
   - The range is bounded to [0, the lane's time extent] (D-29z557). The extent is `timelineSeconds`, the value behind the `timelineWidth` prop (`timelineWidth = timelineSeconds * pxPerSecond`) that `StudioWorkspace` already passes to every `ArrangementLane` [K23]. Pass it down by prop (to the clip gesture too). **Never** read it from `getBoundingClientRect()`: jsdom returns 0, which would collapse the bound to [0, 0].
   - `pointercancel` keeps the last range, as the in-clip range does today [K8].
2. **The range continues past a clip.** In `ArrangementClip.tsx`, the range gesture no longer clamps to `[clip.start, clipEnd]` (l.681–682 [K8]). The bound is [0, `timelineSeconds`], from the same prop source as item 1 [K23]. Everything else in the in-clip gesture is unchanged: the anchor, snap, the "one line → no range" rule, and click = seek.
3. **Ctrl/Cmd+drag on the background is the marquee.** It behaves exactly as today's marquee, with the base = the current selection (l.2073 [K4]). There is no other change to the marquee code path.
4. **A click is unchanged** (no movement past the threshold): the insert marker, `selectClip(null)`, `setTimeRange(null)` and the active track (l.2141–2158 [K4]).
5. **No new status write** (L51). A range shows in the existing footer readout `arrangement-range` [K9]. No new persistent text is added (L39, §2.3).

### 2.2 Range rendering (L4: one rule per element)
- **A single-lane range that lies inside one clip renders exactly as today:** the in-clip overlay, and no `[data-range-start]` element [K6]. This is binding. `perf/studio-lab-interactions.perf.spec.ts` asserts `rangeElements === 0` for an in-clip drag (l.137, l.274 [K10]). `delete-selection-ui` pins one clip overlay and 0 lane overlays for an in-clip range [K11].
- **Any other single-lane range** (it starts or ends outside every clip, or spans a gap or several clips) renders as **one** lane-level overlay in the row of its `trackId`. The element is `data-testid="arrangement-lane-range"`, with `data-range-start`/`data-range-end`, `aria-hidden`, `pointer-events-none`, the same tokens as the all-tracks overlay, and the start–end · seconds label **without** "all tracks". [K6]
- **All-tracks ranges are unchanged** [K6].

### 2.3 Shortcut sheet (`shortcuts.ts`): the quiet home for the moved gesture (L39)
Add two rows, with these ids, texts and positions. B's scratch run inserted them in these places [K12].
- **`select-area`:** action `Add clips in an area to the selection`, keys `['Ctrl + drag on a lane']`, right after `add-to-selection`.
- **`select-time`:** action `Select time`, keys `['Drag in a lane']`, right before `cut-time`.

Rules:
- Neither row has `ariaKeyShortcuts` (these are mouse gestures, like `add-to-selection`).
- No tooltip, title or helper line is added anywhere.
- The sheet already scrolls at HEAD: 48 rows, one scroll container (`scrollHeight` 1280 vs `clientHeight` 808 at 1440×900 and 646 at 1280×720), horizontal overflow 0 [K13].

### 2.4 Side effects of the replaced marquee branch (L49)
On activation, today's marquee branch does two things (l.2119–2123 [K4]):
- **(a) `setTimeRange(null)`:** kept for the marquee. For the range branch it is replaced by the new range.
- **(b) `selectClips(union(base, found))`:** kept for the marquee. For the range branch, the clip selection is cleared once on activation (`selectClip(null)`), and the active track becomes the origin lane. That matches today's click.

Each kept or replaced effect has a jsdom row (BT1, BT4, BT9).

### 2.5 Tests
**Rewrites.** B ran the §2.1–2.3 sketch on a scratch copy. Of the 167 files in `app/lib/arrangement` + `app/components`, exactly 4 tests went red (`b-round-264/precheck-sketch-vitest.clean.txt` [K14]), plus SC1 under the sheet rows (`b-round-264/precheck-sheet-vitest.txt` [K14]). B then re-ran all 167 files on the **final** sketch: Ctrl/Cmd-only marquee, the three `ctrlKey` rewrites and the final sheet rows. Only SE8 and SC1 are red; both are planned rewrites below [K19]. The sketch diff is `b-round-264/sketch.diff`. It is B's evidence, not code for A to copy.

| Test (file:line) | Why it changes | Allowed rewrite |
|---|---|---|
| SP13 `grid-snap-position.test.tsx:447` | its plain drag is now a range | Add `ctrlKey: true` to its `pointerDown` (the title may say "a Ctrl marquee"). Every assertion stays. B checked: green with that one line [K15] |
| UC10b `track-group-collapse-ui.test.tsx:904` | same | same, green [K15] |
| TG9 `track-groups-ui.test.tsx:723` | same | same, green [K15] |
| SE8 `grid-snap-edit.test.tsx:431` | the clamp is removed (Saba) | Rewrite it to the new contract: "a snapped range past the clip end continues past it". The sketch gives `{ start: 7, end: 24, trackId: 'music' }` where HEAD gave `end: 23` [K14]. Keep an assertion of the exact range object. |
| SC1 `shortcuts.test.ts:95` | the ordered row-id list | Insert `select-area` and `select-time` at their positions. Nothing else changes. |

A rewrite whose only change is removing an assertion is a Medium bug (policy, SABA-B-10a rule).

**New file `background-time-selection-ui.test.tsx`.**
- Take the audio fakes and stubs from the shared `createWorkspaceTestEnvironment` (`./helpers/workspace-test-environment`), as 11 test files already do [K21]. This follows gate-264 reviewer suggestion 1: no new copy of `FakeAudioContext`.
- Model the mount and lane helpers on `grid-snap-position.test.tsx` (`mountPositionWorkspace`, `laneBody`, `press`), but define them in the new file. Do not import from another test file.

Rows:
- **BT1:** a plain background drag over empty space gives a range `{start, end, trackId}` with free times (Snap off). No `arrangement-marquee` mid-drag. One lane overlay in that row with the right `data-range-*`; 0 in the other rows. The selection is cleared, and the active track is the origin lane.
- **BT2:** Snap on 1 s: the ends snap to lines. Alt held: free times. Both ends on one line: no range.
- **BT3:** a drag from the background into a clip and across a gap into a second clip gives one range spanning both. Then Delete leaves the gap, and the status is `deleteRangeDone` with the two times and `on the Music track` [K9]. A range over empty space only, then Delete: `deleteRangeEmpty`, and the arrangement is unchanged [K9].
- **BT4:** Ctrl+drag gives the marquee (the testid exists mid-drag, there is no range), and its base is the earlier selection. Meta+drag does the same.
- **BT5:** a click (< 4 px) leaves the insert marker as today and makes no range.
- **BT6:** an in-clip drag past the clip start and past the clip end continues outside the clip. Also: the lower bound 0, and the upper bound is the lane extent.
- **BT7:** a range inside one clip has an in-clip overlay and 0 `[data-range-start]`.
- **BT8:** while playing (L52: write `setPosition(getLivePosition())` and assert the store moved before the playing assert), a background drag does not stop or seek. `isPlaying` stays true, and no `seek`/`playFrom` happens.
- **BT9:** a drag that starts on the music lane and ends over the stems lane gives a range with `trackId` = music only.

**Red-proofs (L23, L52).** Run them on a scratch copy **outside** `store/`, with the new file only, and report each red as file:line.
- **M1:** force the marquee branch for every background drag. BT1, BT3 and BT9 must go red.
- **M2:** restore the clip clamp (l.681–682). BT6 must go red. [K8]
- **M3:** restore the lane overlay to `range?.allTracks` only. BT1 must go red on the overlay assertion.
- **M4:** make the marquee start without Ctrl/Meta (that is, HEAD). BT4's "no range" or BT1's "no marquee" must go red.

### 2.6 Focus (L47, L50)
- **L50 grep** at HEAD: `grep -cE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)'` gives 20 hits in `StudioWorkspace.tsx`, 13 in `ArrangementClip.tsx` and 25 in `ArrangementLane.tsx` [K16]. Rulings:
  - **The background `pointerdown` hit:** no `.focus()` is added. The typing-focus release on `pointerdown` is unchanged and is not this round's contract. Row FOCUS-SAME.
  - **The conditional renders this round adds or changes** (the lane overlay; `range ?` in the footer and in the clip): none of them is focusable (`aria-hidden`, `<p>`, `pointer-events-none`), so nothing focused can unmount. The overlay row checks `aria-hidden`. [K6]
  - **The clip selection cleared on range activation** equals today's marquee activation (`selectClips([])`) and today's click (`selectClip(null)`) [K4]. So no focused element unmounts that does not unmount at HEAD. Row FOCUS-SAME covers it.
  - **Every other hit** is out of scope: its code is unchanged.
- **Ruling (D-29z557):** the focus target equals HEAD for the same origin. B's baseline [K17]:
  - focus on a toolbar `BUTTON` stays on it after a background drag;
  - from "Search the library", the result is **BODY**. That comes from the unchanged typing-focus release; it is not this round's code. C records it. It is equal to HEAD, so it is not a FAIL.

### 2.7 Checks (speed rules), from `store/`
- `npm run typecheck` and `npm run lint`;
- `npx biome check` on the 4 granted source files and the new test file;
- `npx vitest run` on the new file + the 5 rewritten files + `delete-selection-ui.test.tsx` + `shortcut-sheet-ui.test.tsx` + `workspace-strings-ui.test.tsx` + `selection.test.ts`;
- L31: report the slowest test in each rewritten file against its limit. At gate 264, `track-group-collapse-ui` took 46.7 s for 30 tests and `track-groups-ui` 20.6 s for 14, both with a describe timeout of 20 s [K18].
- **code-reviewer:** required (11 files). Pass its Architecture notes to B.
- Do not run the full suite or `npm run verify`.

### 2.8 STOP conditions (L11, at the top of `a-round-265.md`)
- A change is needed outside the 9 grants and the 2 new files.
- A test outside §2.5 goes red.
- A rewrite would need to drop an assertion.
- A mutant leaves its rows green.
- `sha256sum -c` of the frozen list is not rc 0 before or after.
- The perf in-clip contract (§2.2) cannot hold.

## 3. Neighbouring behaviour at risk
- SRW-06 R6-S2 (the marquee): it moves to Ctrl/Cmd. R6-S1 (Ctrl/Shift-click on clips) is unchanged.
- R4-P2 (a range drag during playback does not change playback): BT8 and C's PLAYING.
- The perf in-clip range drag (§2.2).
- The delete-selection overlay rows.
- Ctrl+Shift+L, Ctrl+E split at a range, Delete and Space-from-range (SABA-B-10a) on a range that spans a gap: C's rows.
- SP-rows of click = insert marker.

## 4. C: what to verify
C writes `c-round-265.md` and `c-round-265.json` as it goes.
- "Both viewports" means 1440×900 and 1280×720, in a fresh anonymous `/studio-lab` context, after `Demo collection ready` (L48).
- **Setup S (B ran it [K17]):**
  1. Click the **Music** lane background at lane x + 400 px, 70 % of the lane height. That puts the insert marker at 10.000.
  2. Focus the first library `option`, then press Enter. The clip is placed at `data-clip-start` "10.000", the status is "“Middle East — საჯარო preview” added to the Music track at 00:10.000.", the clip is 101.35 s long, and the zoom is 40 px/s (the clip's x − the lane's x = 400 px).
  3. Snap is off (`aria-pressed` "false", `aria-keyshortcuts` "G 4"), `data-grid-seconds` is "1", and the tempo field is empty. [K17]
- The lane is `[data-grid-seconds]:not([data-testid])`, first row = Music. "lane x" is its bounding-box left, and y is 70 % of its height. [K17]
- **Ableton conformance** is per the §1 table (confirmed, deliberate difference D1/D2, or unknown). Unknown rows are not claimed as matching.

| Row | Steps | PASS means | FAIL means |
|---|---|---|---|
| **SOURCE-SCOPE** | From `store/`:<ul><li>`sha256sum -c --quiet ../tmp/studio-real-loop/b-round-264-r265-tree-sha256.txt`;</li><li>`git status --short --untracked-files=all`;</li><li>HEAD.</li></ul> | <ul><li>rc 0;</li><li>status shows only grant files (`M`) and the 2 new files (`??`);</li><li>HEAD is `2ea196e`.</li></ul> | Any other change. |
| **CLAIMS** | Re-run K1–K24 verbatim, plus the L29 untagged-fact grep over this file. | Every output matches. | A mismatch (planning FAIL). |
| **TESTS-TARGETED** | The §2.7 file set. | All green. | Red. |
| **REWRITES** | Diff the 5 rewritten tests against HEAD. | SP13/UC10b/TG9 gain only `ctrlKey: true` (plus an optional title change). SE8 asserts the exact new range object. SC1 gains exactly the 2 ids. **No assertion is removed.** | An assertion is removed (Medium). |
| **MUTANTS** | M1–M4 on C's own scratch, with the new file only. | Each goes red as in §2.5. | Any mutant stays green. |
| **BG-RANGE** (both viewports) | After S, drag on Music from lane x + 40 to lane x + 300 (8 steps). Read mid-drag and after. | <ul><li>Mid-drag: 0 `arrangement-marquee`.</li><li>After: `arrangement-range` reads "Time selection: 00:01.000 — 00:07.500 · length 00:06.500 · Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time".</li><li>Exactly 1 `arrangement-lane-range` (in the Music row), `data-range-start` "1.000", `data-range-end` "7.500", `aria-hidden` "true"; its text has no "all tracks".</li><li>`arrangement-insert-marker` is hidden.</li><li>Screenshot.</li></ul> | A marquee, no range, wrong times, or an overlay in another row. [K9][K17][K20] |
| **BG-INTO-CLIP** (both) | After S, drag lane x + 40 → clip x + 200. Then Delete, then Ctrl+Z. | <ul><li>Range "00:01.000 — 00:15.000", 1 lane overlay.</li><li>Delete: clips `["15.000"]`, status "Deleted 00:01.000 — 00:15.000 on the Music track; the gap remains." [K9][K24]</li><li>Ctrl+Z: clips `["10.000"]`.</li></ul> | Otherwise. |
| **BG-EMPTY-DELETE** (both) | BG-RANGE's range, then Delete. | The status is "Nothing to delete in the time selection — nothing changed.", and the clips are `["10.000"]` [K9][K24]. | Otherwise. |
| **CLIP-PAST-START** (both) | After S, drag on the clip body from clip x + 100 to clip x − 150. | <ul><li>Range "00:06.250 — 00:12.500" (B's HEAD baseline: clamped "00:10.000 — 00:12.500" [K17]).</li><li>1 lane overlay; no in-clip range label.</li></ul> | Clamped, or not shown. |
| **IN-CLIP-SAME** (both) | After S, drag on the clip body from clip x + 100 to clip x + 400. | <ul><li>Range "00:12.500 — 00:20.000" [K17].</li><li>0 `[data-range-start]` elements, and the in-clip label shows (§2.2).</li></ul> | A lane overlay appears. |
| **SNAP** (both) | After S, press G (Snap `aria-pressed` "true"). Then:<ol><li>drag lane x + 52 → lane x + 304;</li><li>the same with Alt held;</li><li>drag lane x + 44 → lane x + 52.</li></ol> | <ol><li>"00:01.000 — 00:08.000";</li><li>"00:01.300 — 00:07.600";</li><li>no `arrangement-range`.</li></ol> | Otherwise. [K17] |
| **MARQUEE-CTRL** (both) | After S:<ol><li>click the background at lane x + 60 (this clears the selection);</li><li>Control held, drag lane x + 40 → clip x + 200;</li><li>Delete.</li></ol>Then repeat from a fresh S with **Shift** held instead of Control in step 2, then Delete. | <ul><li>Control: `arrangement-marquee` count 1 mid-drag; after, no `arrangement-range`; Delete gives "Clip deleted; the gap remains." and 0 clips.</li><li>Shift: a range "00:01.000 — 00:15.000" (no marquee); Delete gives the BG-INTO-CLIP status.</li></ul> | Ctrl makes a range, or Shift makes a marquee. |
| **CLICK-SAME** (both) | After S, click the background at lane x + 120. | `data-insert-marker` "3.000" and not hidden; no `arrangement-range`. | Otherwise. |
| **VERTICAL** (both) | After S, drag from Music lane x + 40 down into the second lane's row at lane x + 300. | The range is "00:01.000 — 00:07.500" with 1 overlay, in the Music row only. | An overlay in another row, or no range. |
| **ALL-TRACKS** (both) | BG-RANGE's range, then Ctrl+Shift+L. | The status is "Selection on all tracks: 00:01.000 — 00:07.500.", and every lane row has exactly 1 overlay [K9]. | Otherwise. |
| **PLAYING** (both) | After S, press Space (`arrangement-playback-state` "Playing"). Wait 500 ms, then do BG-RANGE's drag. Wait 500 ms. | <ul><li>The playback state is still "Playing".</li><li>The `arrangement-position` text after the drag is later than before it (playback was not restarted or moved).</li><li>Then Space (stop), then Space again: playback starts from the range start, with the position in [00:01.000, 00:02.000] 500 ms later (L48: 50 ms lead).</li></ul> | Playback stops or jumps on the drag, or does not start from 1.000. |
| **SHEET** (both) | Open with `?`. | <ul><li>Rows 48 → **50** (`tr, li, [role=row]` in the dialog).</li><li>The rows "Add clips in an area to the selection" · "Ctrl + drag on a lane" and "Select time" · "Drag in a lane" are present, in the §2.3 order.</li><li>One scroll container, and horizontal overflow 0 [K13].</li><li>Screenshot of each new row scrolled into view.</li></ul> | Missing rows, overflow, or a clipped row. |
| **SCREEN-BUDGET** (both, L39) | Full-window screenshots of the empty `/studio-lab` and of setup S at rest, before (HEAD, B's `b-round-264/p*.png` or C's own) and after. Count persistent text lines outside the timeline. | Equal. A range overlay appears only while a range exists. | Any new persistent line (Low; a new strip is Medium). |
| **FOCUS-SAME** (both) | <ol><li>Focus the Snap button (keyboard), then do BG-RANGE's drag and read `document.activeElement`.</li><li>Focus "Search the library", then do the same drag.</li></ol> | <ol><li>The Snap button keeps focus.</li><li>BODY, equal to B's HEAD baseline (P6 [K17]). Record it; it is not a FAIL (§2.6).</li></ol> | (1) moves focus. |
| **LESSONS** | `grep -n '^4[56]\. ' lessons.md` (loop root). | L45 and L46 exist. | Missing. |
| **DOC-198** | l.4 byte for byte; the headings subsequence (L26); its row citations exist (`grep`). | Matches §Baseline. | Otherwise. [K3] |
| **G265-AUTH** (browser; reuse `c-round-264/g264-auth.cjs`) | A fresh anonymous 1440×900 context: `/studio-lab`, `/studio/middle-east`, `/api/studio-token` with no header. | <ul><li>Workspace + demo badge, `auth_user` null.</li><li>"Sign in required", 0 `audio[src]`.</li><li>401, no token.</li></ul> | Any bypass (Critical). |

- **Gate rows:** the full vitest, the build, Biome (full), `npm run verify` and the e2e smoke. List them under `"gate"`, never under `"passed"`.
- **`browserVerified`** is true only if every browser row above ran at both viewports.
- **Not in this round:** relative snap (stage 2), multi-lane partial ranges (D2), and the Live-style Shift-click extension. List them under `"notInScope"`, not under `"blocked"`.

## 5. Outcome, fixed in advance (D-29z556)
| Result | B at the round-266 planning |
|---|---|
| C PASS and gate 265 `published` | <ul><li>SABA-B-11c stage 1 → done.</li><li>R6-S2 (the marquee) re-verified on Ctrl/Cmd.</li><li>Stage 2 (relative snap) stays `awaiting_user` until Saba answers R49-T (`user-review/questions-11c.md`). Without an answer, 11c stays `in_progress (stage 2 awaiting_user)` and the loop moves on.</li><li>Round 266 = **REGRESSION** if planned on or after 2026-11-02. Otherwise **GATE264-S2** (Medium, below), then SYS-6 STATUS-LIFETIME.</li></ul> |
| C PASS, gate fails | A bounded fix-up for that step. |
| A Medium+ finding in a §4 row | A fix-up with the same grants, ≤ 3 related bugs. |
| A STOP | B rules on it before re-dispatch (L10). |

### New Medium found at this planning: GATE264-S2 (next bug round, not this round)
- **Source:** gate-264 reviewer suggestion 2 (`gates/round-264/review.md`). B reproduced it in the browser (`b-round-264/probe-altgr-edit.json`, both viewports, 0 page errors) [K22].
- **Repro:** a synthetic `keydown` with `ctrlKey`, `altKey` and `modifierAltGraph: true` (`getModifierState('AltGraph')` true), dispatched on `document.body`:
  - on `KeyZ` (Polish "ż") it runs Undo;
  - on `KeyE` ("ę") it splits the selected clip;
  - on `KeyL` ("ł") it reaches the loop handler.

  All three are prevented. The `KeyO` branch already ignores AltGraph [K22].
- **Why it is not in round 265:** the policy allows one feature stage or at most 3 related bugs per round. It is not data loss: Undo and Redo restore the state.
- **Its round:** the next one, unless the REGRESSION round is due. It closes with the cloud contract half; the real Windows AltGr check stays with Saba, as with GATE232-S2.
- **Before that dispatch:** this round edits the same `StudioWorkspace.tsx`, so the reviewer's line references (l.2307–2338, `gates/round-264/review.md`) are re-grepped on round 265's published commit [K22].
- **RETRO 275 candidate:** a guard added to one branch of a shared handler (AltGraph on `KeyO`) was never checked against its sibling branches.

## 6. Saba questions written this planning (`user-review/questions-11c.md`)
- **SABA-Q-11C-MARQUEE (D1);**
- **SABA-Q-11C-MULTILANE (D2);**
- **R49-T, restated with the expert's result:** no Live source answers the off-grid offset question.

Until Saba answers, D1 and D2 are the implemented defaults, and stage 2 does not start.

## 7. Claims (L29; C re-runs each command verbatim; commands from `store/` unless marked "loop root")
| Tag | Claim | Command | Expected |
|---|---|---|---|
| K1 | HEAD, clean tree | `git rev-parse HEAD; git status --short --untracked-files=all \| wc -l` | `2ea196e20e6c3b9099db519f807eaa4a1d95a48a`; `0` (at planning) |
| K2 | 1,114 frozen entries; 9 grants; each protected file once | loop root: `wc -l < b-round-264-r265-tree-sha256.txt; wc -l < b-round-264-r265-grants.txt; for f in 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/__tests__/download-routes.test.ts app/lib/auth.ts app/contexts/AuthContext.tsx app/entry.server.tsx; do grep -cF "  $f" b-round-264-r265-tree-sha256.txt; done \| tr '\n' ' '` | `1114`; `9`; `1 1 1 1 1 1 1` |
| K3 | the new files are absent; 197 is the last doc | `test -e app/lib/arrangement/__tests__/background-time-selection-ui.test.tsx; echo $?; ls docs/implementation/2026/quarter-IV/ \| sort -n \| tail -1` | `1` (at planning); `197-l46-meta-shortcut-contract.md` |
| K4 | the background handler, threshold, marquee base, activation and click branch | `grep -n "const MARQUEE_THRESHOLD_PX = 4;" app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1; grep -n "const handleLaneBackgroundPointerDown = useCallback(" app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1; grep -n "base: event.ctrlKey \|\| event.metaKey ? current.getSelectedClipIds() : \[\]," app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1; grep -n "clickTime: Math.max(0, (event.clientX - laneRect.left) / current.pxPerSecond)," app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1; grep -n "latest.selectClips(unionSelection(gesture.base, found));" app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1; grep -n "latest.selectClip(null);" app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1` | `175`; `2054`; `2073`; `2072`; `2106`; `2143` |
| K5 | Ctrl/Meta or Shift on a clip toggles or adds it | `grep -n "const isToggle = event.ctrlKey \|\| event.metaKey;" app/components/arrangement/ArrangementClip.tsx \| cut -d: -f1` | `410` |
| K6 | `TimeRange` shape; the lane overlay only for all-tracks ranges; the in-clip containment rule | `grep -n -A5 "export interface TimeRange" app/types/arrangement.ts \| grep -c "trackId: string;\|allTracks?: true;"; grep -n "{range?.allTracks ? (" app/components/arrangement/ArrangementLane.tsx \| cut -d: -f1; grep -n "range.end <= clip.start + clip.duration + 1e-4" app/components/arrangement/ArrangementLane.tsx \| cut -d: -f1` | `2`; `1031`; `983` |
| K7 | every lane gets the same background handler | `grep -n "onBackgroundPointerDown={handleLaneBackgroundPointerDown}" app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1; grep -c "<ArrangementLane$" app/components/arrangement/StudioWorkspace.tsx; grep -n "onPointerDown={(event) => onBackgroundPointerDown(event, track.id)}" app/components/arrangement/ArrangementLane.tsx \| cut -d: -f1` | `3040`; `1`; `874` |
| K8 | the in-clip range clamp and its snap step | `grep -n "Math.min(clipEnd, Math.max(original.start" app/components/arrangement/ArrangementClip.tsx \| cut -d: -f1 \| tr '\n' ' '; grep -n "const step = resolveSnapStep(snapSeconds, gridSeconds, event.altKey);" app/components/arrangement/ArrangementClip.tsx \| cut -d: -f1` | `681 682`; `513` |
| K9 | the status strings and the readout | `grep -n "deleteRangeEmpty: 'Nothing to delete in the time selection — nothing changed.',\|deleteClipDone: 'Clip deleted; the gap remains.',\|clipsSelected: (count: number)\|rangeDeleteHint: 'Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time',\|  allTracks: 'all tracks',\|Selection on all tracks: \${start} — \${end}.\|Deleted \${start} — \${end} \${lanes}; the gap remains." app/lib/arrangement/strings.ts \| cut -d: -f1 \| tr '\n' ' '; grep -c 'data-testid="arrangement-range"' app/components/arrangement/StudioWorkspace.tsx` | `121 127 132 162 168 653 654`; `1` |
| K10 | the perf in-clip contract | `grep -n "rangeElements: document.querySelectorAll('\[data-range-start\]').length,\|after.rangeElements === 0;" perf/studio-lab-interactions.perf.spec.ts \| cut -d: -f1 \| tr '\n' ' '` | `137 274` |
| K11 | the delete-selection overlay row | `grep -n "expect(view.queryAllByTestId('arrangement-lane-range')).toHaveLength(0);" app/lib/arrangement/__tests__/delete-selection-ui.test.tsx \| cut -d: -f1` | `509` |
| K12 | the sheet anchors | `grep -n "id: 'add-to-selection'\|id: 'cut-time'" app/lib/arrangement/shortcuts.ts \| cut -d: -f1 \| tr '\n' ' '` | `77 94` |
| K13 | the sheet at HEAD (both viewports) | loop root: `node b-round-264/probe-sheet.mjs /tmp/k13.json` | per viewport: `rows 48`, one scroller (`sh 1280`, `ch 808` / `646`), `overflowX 0` |
| K14 | B's scratch collisions | loop root: `grep -c "^ FAIL " b-round-264/precheck-sketch-vitest.clean.txt; grep -o "Tests  [0-9]* failed \| [0-9]* passed" b-round-264/precheck-sketch-vitest.clean.txt; grep -c "FAIL .*SC1" b-round-264/precheck-sheet-vitest.txt; grep -c "expected { start: 7, end: 24, trackId: 'music' }" b-round-264/precheck-sketch-vitest.clean.txt` | `3` (SE8 appears only in the annotation lines); `Tests  4 failed \| 2439 passed`; `1`; `1` |
| K15 | the test lines and the Ctrl-only rewrite check | `grep -nE "it\('(SP13\|UC10b\|TG9\|SE8) " app/lib/arrangement/__tests__/grid-snap-position.test.tsx app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx app/lib/arrangement/__tests__/track-groups-ui.test.tsx app/lib/arrangement/__tests__/grid-snap-edit.test.tsx \| cut -d: -f1,2; grep -n "it('SC1" app/lib/arrangement/__tests__/shortcuts.test.ts \| cut -d: -f1`; loop root: `grep -c . b-round-264/precheck-ctrl-rewrite.txt` | `…grid-snap-position.test.tsx:447`, `…track-group-collapse-ui.test.tsx:904`, `…track-groups-ui.test.tsx:723`, `…grid-snap-edit.test.tsx:431`; `95`; `2` (the lines `Test Files  3 passed (3)` and `Tests  63 passed (63)`) |
| K16 | the L50 counts | `for f in StudioWorkspace ArrangementClip ArrangementLane; do grep -cE 'onPointerDown(Capture)?\|onBlur\|settleEditor\(\|\.focus\(\|^\s*\{[^}]*(\.map\(\|&&\|\?)' app/components/arrangement/$f.tsx; done \| tr '\n' ' '` | `20 13 25` |
| K17 | browser baseline (both viewports, 0 page errors) | loop root: `node b-round-264/probe-11c.mjs /tmp/k17.json; node b-round-264/probe-grid.mjs /tmp/k17g.json` | `probe-11c`: clip `10.000`, clip x − lane x = 400; P1 range "Time selection: 00:10.000 — 00:12.500 …"; P2 `marquee true` mid-drag, no range after; P5 no range; P6 active `INPUT\|Search the library` → `BODY`. `probe-grid`: Snap `pressed "false"`, keys `"G 4"`, `g "1"`, tempo `""`, in-clip "00:12.500 — 00:20.000", Delete → `["10.000","20.000"]` |
| K19 | the final-sketch run over all 167 files | loop root: `grep -E "^ FAIL\|Tests " b-round-264/precheck-final-sketch-vitest.txt \| sed 's/ >.*//'` | the `Failed Tests 2` banner line, then ` FAIL  app/lib/arrangement/__tests__/grid-snap-edit.test.tsx`, ` FAIL  app/lib/arrangement/__tests__/shortcuts.test.ts`, `      Tests  2 failed \| 2441 passed (2443)` |
| K20 | the DOM signals C reads | `grep -c 'data-testid="arrangement-marquee"' app/components/arrangement/StudioWorkspace.tsx; grep -c 'data-testid="arrangement-insert-marker"' app/components/arrangement/StudioWorkspace.tsx; grep -c 'data-testid="arrangement-playback-state"\|data-testid="arrangement-position"' app/components/arrangement/ArrangementTransport.tsx` | `1`; `1`; `2` |
| K21 | the shared test helper | `grep -c "^export function createWorkspaceTestEnvironment" app/lib/arrangement/__tests__/helpers/workspace-test-environment.ts; grep -rl "workspace-test-environment" app/lib/arrangement/__tests__ \| wc -l` | `1`; `11` |
| K22 | AltGr reaches the Ctrl-letter branches; only `KeyO` checks AltGraph | `grep -c "getModifierState('AltGraph')" app/components/arrangement/StudioWorkspace.tsx`; loop root: `node b-round-264/probe-altgr-edit.mjs /tmp/k22.json` | `1`; per viewport: `z.after.clips 0` with status "Undo: Add — Middle East — საჯარო preview", `e.after.clips 2` with "Clip split at 00:07.500.", `l.after.status` "To set a loop, first make a time selection on the waveform.", each `altGraphState true`, `notPrevented false` |
| K23 | the lane-extent source | `grep -n "const timelineSeconds = Math.ceil(Math.max(projectEnd + TIMELINE_TAIL_SECONDS, viewportSeconds));\|const timelineWidth = timelineSeconds \* pxPerSecond;\|timelineWidth={timelineWidth}" app/components/arrangement/StudioWorkspace.tsx \| cut -d: -f1 \| tr '\n' ' '; grep -n "  timelineWidth: number;" app/components/arrangement/ArrangementLane.tsx \| cut -d: -f1` | `2614 2615 2981 3018 3039`; `133` |
| K24 | `deleteRangeKeepingGap` on the BG-INTO-CLIP and BG-EMPTY-DELETE windows (B ran the real function on the scratch copy) | loop root: `cat b-round-264/probe-delete-range.test.ts.txt`; B's run printed `RESULT [{"id":"c1",…,"start":15,"sourceOffset":5,"duration":96.352}]` and `EMPTY_SAME true`. C may copy the file to a scratch `__tests__/` folder and run it with vitest | the clip at 10 s with window 1–15 becomes start 15, offset 5; window 1–7.5 returns the same object (→ `deleteRangeEmpty`, `ArrangementContext.tsx` l.2033–2034) |
| K18 | the describe timeouts | `grep -c "{ timeout: 20_000 }" app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx app/lib/arrangement/__tests__/track-groups-ui.test.tsx` | `…collapse-ui.test.tsx:3`, `…track-groups-ui.test.tsx:1` |
