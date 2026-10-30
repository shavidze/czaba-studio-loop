# Round 270: GATE266-S1. The detail panel's From/To fields show the real time selection, and Enter never shrinks it silently (Medium), plus the neutral split wording (GATE266-S4, B-R266-CLIPS-SPLIT-COPY, both Low)

**Planned by:** B, at the round 269 → 270 planning, 2026-10-30.

**Decisions:**
- D-29z580: the round-269 result (C PASS; gate 269 published `f6ebd2d`; SABA-B-7 done);
- D-29z581: the GATE266-S1 contract, its sibling B-R269-DETAIL-ALLTRACKS-DROP, and the rejected options;
- D-29z582: the split wording;
- D-29z583: triage of the gate-269 review;
- D-29z584: consults and lessons;
- D-29z585: order and checkpoint.

**Read first:** `lessons.md` in full. These apply directly:
- L23 (B's scratch pre-check, §6);
- L29 (claims, §9);
- L4 (one element, one rule: §3.4);
- L3 (text change → longest-state box row);
- L39 (screen budget);
- L47 (focus target);
- L51 (status write);
- L11 (STOP);
- L26 and L28 (the doc).

**Previous task:** `tasks/round-269.md` (an exact copy of the round-269 `current-task.md`).
- C: `c-round-269.json` = **PASS**, with `browserVerified` and `realVerified` true and 0 bugs.
- Gate 269: **published**, commit `f6ebd2d` on both remotes.

## Baseline: HEAD `f6ebd2d`, clean tree
`git rev-parse HEAD` = `f6ebd2d01c361c17d11c5b885a40e37e2ca9f9eb`, and `git status --porcelain` prints nothing [K1]. If root commits again before A starts, C accepts the drift only when `git diff f6ebd2d HEAD -- app` is empty (L29 clause).

## 1. The bugs, and why we missed them

**GATE266-S1 (Medium; found by the gate-266 reviewer, reproduced by B in the browser at `f6ebd2d` at both viewports, `b-round-269/probe-detail-range-head.json`):**
- Since SABA-B-11c stage 1 (round 265), a drag inside a clip may pass the clip's edge, and the clip stays selected.
- The detail panel's From/To fields (accessible names "Time selection start (seconds)" / "Time selection end (seconds)") then show only the part of the selection that lies inside the clip. The code clamps them with `Math.max(range.start, clip.start)` and `Math.min(range.end, clip.start + clip.duration)` [K2].
- Enter (or Set selection) then sends those clamped values through `clampDetailRangeToClip` and `setTimeRange`, which silently shrinks the user's selection [K3].

| Recipe (both viewports) | Selection readout | Fields | After Enter in From |
|---|---|---|---|
| past start (drag clip.x+100 → clip.x−150) | 00:06.250 — 00:12.500 | `10` / `12.5` | 00:10.000 — 00:12.500 (shrunk) |
| past end (drag clip.x+100 → clip.x+width+150) | 00:12.500 — 01:55.102 | `12.5` / `111.352` | 00:12.500 — 01:51.352 (shrunk) |
| inside (drag clip.x+60 → clip.x+160), control | 00:11.500 — 00:14.000 | `11.5` / `14` | unchanged |

**B-R269-DETAIL-ALLTRACKS-DROP (Medium; B's probe this planning, `b-round-269/probe-alltracks-head.json`). Same root cause, closed by the same rule:**
- Recipe: the inside recipe, then Ctrl+Shift+L, then Enter in From.
- Before Enter: the readout shows "… · all tracks" with 4 lane overlays.
- After Enter: the selection becomes one-track ("Time selection: 00:11.500 — 00:14.000 · Music.") and there are 0 lane overlays. Today `next` is built as `{ ...clamped, trackId: target.trackId }`, without `allTracks` [K3].

**GATE266-S4 and B-R266-CLIPS-SPLIT-COPY (Low).** The split messages claim more than happened [K4]. The browser output at `f6ebd2d` is in `b-round-269/probe-split-copy-head.json`:
- `splitRangeDone` says "split at both edges … the middle part" even when only one edge was cut (the past-start recipe, then Ctrl+E).
- `splitRangeClipsDone` says "Clips split … the 2 parts" when one of the two selected clips was not cut at all (gap recipe G, then Ctrl+E).
- `splitRangeTitle` says "both edges".

**Why we missed it:**
- Round 265 changed what a clip drag can select: the selection may now pass the clip edge. The round-265 task never mentions the detail panel, which displayed the clamped region (`grep -ci detail tasks/round-265.md` = 0).
- No row compared the panel's values with the selection readout after a past-edge drag.
- The rule that would have caught it: when a gesture newly crosses a boundary, every readout or editor that showed the clamped region becomes a consumer row. It is recorded as retro candidate RC-R266-PANEL-CLAMP-CONSUMER for RETRO 275, with no new lesson now (D-29z584). It extends L29's "changed meaning" clause.
- C's row DP-BROWSER below is that consumer row.

## 2. Reference: how Ableton Live 12 does it (checked 2026-10-30)

| Point | Source | What the source says | CZABA, this round | C row |
|---|---|---|---|---|
| Making a time selection | Live 12 manual, Arrangement View §6.9 "Selecting Clips and Time" (https://www.ableton.com/en/live-manual/12/arrangement-view/, fetched by B on 2026-10-30) | "Clicking and dragging selects a timespan." Shift extends "in the same track or across tracks". | Unchanged (round 265 gesture) | n/a |
| A numeric field for the time selection's start and end | §6.3 (Arrangement Position = the play position), §6.6 (Loop Start/Length fields = the loop brace), §6.9 | **No reference.** The manual has no field that shows or types a time selection's start, end or length. | CZABA-only fields. Rule: the fields always show the real selection, and Enter never changes it silently | DP-BROWSER, DP-ENTER |
| Split at a selection | §6.12 "Splitting Clips"; [SC] §42.16 "Split Clip at Selection — Ctrl E" (cited in round 266, `tasks/round-266.md` §1) | Splitting separates out the selection into a new clip. The command name does not say "both edges". | Neutral wording: "Split clips at the time selection" | SPLIT-COPY |

**Deviations:**
- The fields themselves are a CZABA addition with no Live counterpart. They already existed and are not new in this round.
- No other deviation.

**`product-designer`:** not consulted, because this is a bug fix-up that adds no screen element (policy exemption, D-29z584). C may consult it in review mode (at most 7 findings).

## 3. The contract (D-29z581, D-29z582)

### 3.1 Display (`ArrangementDetailPanel.tsx`, `ArrangementDetailContent`)
- `rangeOnClip` is unchanged: the selection is on the clip's lane and overlaps the clip.
- When `rangeOnClip` is true, From/To show `rangeInputText(range.start)` and `rangeInputText(range.end)`, the selection's own values with no clamp. This replaces the two `Math.max`/`Math.min` lines [K2]. The layout effect that resets the texts keeps its dependencies; its inputs are now the raw selection values.
- When `rangeOnClip` is false (no selection, a selection on another lane, or a selection off this clip on the same lane), the fields show the clip bounds, as today.
- The waveform overlay `arrangement-detail-range` is unchanged. It still draws only the part on this clip's waveform, which is true.
- Inputs and button keep `disabled={!clip}`. **No** element gets disabled or hidden by this change. That keeps L47 out of play: nothing focused can unmount or become disabled.

### 3.2 Enter / Set selection (`applyDetailRange`)
The order is fixed. Steps 1–2 are unchanged:
1. Return if there is no selection.
2. If a pointer gesture is active, show the gesture refusal (`GESTURE_EDIT_BLOCKED_MESSAGE`) and return.
3. **New, the keep branch.** If `range` is set, `rangeOnClip` is true, `rangeInputText(parseSecondsInput(startText)) === rangeInputText(range.start)` and `rangeInputText(parseSecondsInput(endText)) === rangeInputText(range.end)`. The comparison is on normalised values, so a retyped equivalent such as `6.250` for `6.25` also keeps the selection. B's sketch used the raw-text form; A implements this rule, and every §7 mutant still applies. Then:
   - do **not** call `setTimeRange` (the range object stays the same reference, `allTracks` included) and do not change the texts;
   - announce `detailRangeAppliedMessage(range, range.allTracks ? studioEditStrings.allTracks : selection.laneName)`. The track label `allTracks` = `'all tracks'` already exists [K4]. The lane case gives "Time selection: 00:06.250 — 00:12.500 · Music."; the all-tracks case gives "… · all tracks.";
   - return.
4. Otherwise (edited values, or the fields show the clip bounds), run the existing code unchanged: `clampDetailRangeToClip` (inside the clip ±0.01 s, clamped), else `rangeInvalid`; on success `setTimeRange({ ...clamped, trackId })` and announce it [K3].
   - An edited value on an all-tracks selection therefore becomes a one-track selection and is **announced** as such ("· <lane>"). That is the existing, explicit behaviour and it stays (see LATER-DETAIL-LANE-RANGE-EDIT).

**Invariant C checks:** Enter or Set either leaves the selection exactly as the fields show it, or applies exactly what the user typed (clamped by ≤ 0.01 s), or refuses with `rangeInvalid` and leaves it unchanged. It never silently changes it.

**Within-tolerance note:**
- A selection such as 1.995–7.25 on a clip that starts at 2 now shows `1.995`, its real value.
- Enter with unchanged text keeps 1.995. Before this round, Enter normalised it to 2.
- Typing `1.995` while the selection is 2–7.25 still normalises to 2. The existing test "shows the normalized applied values after Apply …" covers this and is unchanged.

**Rejected (D-29z581):**
- (a) Disable the fields with a reason when the selection passes the clip. A focused Set button would be disabled under the focus by Ctrl+Shift+L (a button is not a typing target [K9], so the workspace shortcut runs). It would also add a persistent reason line.
- (b) Lift the clamp so the panel can edit a lane selection beyond the clip. That is a new ability and changes what `rangeInvalid` means [K8]. It is recorded as later candidate LATER-DETAIL-LANE-RANGE-EDIT, not queued, and needs Saba.

### 3.3 Split wording (`strings.ts`, wording only; `splitClipsByRange` and `splitSelection` unchanged [K6])
| Key | Old [K4] | New |
|---|---|---|
| `splitRangeDone` | `Clip split at both edges of the time selection; the middle part is selected.` | `Clip split at the time selection; the part inside it is selected.` |
| `splitRangeClipsDone(n)` | `` `Clips split at the edges of the time selection; the ${count} parts inside it are selected.` `` | `` `Split at the time selection; the ${count} clips inside it are selected.` `` |
| `splitRangeTitle` | `studioShortcutTitle('Split at both edges of the time selection', 'split')` | `studioShortcutTitle('Split clips at the time selection', 'split')` → "Split clips at the time selection (Ctrl+E)" |

Each new string is true in the one-edge, two-edge and whole-clip cases. "Clips" counts a part as a clip. All three are shorter than the old ones.

### 3.4 One element, one rule (L4)
- The From/To values are governed by §3.1 only. The text-preservation rules of the existing L4 tests in `detail-panel-polish.test.tsx` still hold, because they compare displayed values: typed text survives a re-set of the same values and resets when the displayed values change.
- Where the old "clamped overlap" test pinned the clamped display, §5.1 rewrites it to §3.1.

## 4. Grants (exact, `b-round-269-r270-grants.txt`)
| File | What may change |
|---|---|
| `app/components/arrangement/ArrangementDetailPanel.tsx` | only the import of `studioEditStrings` (from `~/lib/arrangement/strings`, joined to the existing `studioDetailStrings` import [K7]), the two `onClipStart`/`onClipEnd` lines [K2] and the keep branch inside `applyDetailRange` before `const target = selection.clip;` [K3]. No class token, no testid, no `disabled`, no JSX change |
| `app/lib/arrangement/strings.ts` | the three values in §3.3 only |
| `app/lib/arrangement/__tests__/detail-panel-polish.test.tsx` | §5.1 rewrite of the "clamped overlap" test; new describe DR1–DR6 (§5.2) |
| `app/lib/arrangement/__tests__/background-time-selection-ui.test.tsx` | BS2 literal (§5.1); a literal line added inside `expectSplitPastStart`; new BS3 and DP1 (§5.2) |
| `app/lib/arrangement/__tests__/strings.test.ts` | ST6 (l.385, l.411) and ST7 (l.517, l.520) literals only [K5] |
| `app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx` | NS2 l.261 literal only [K5] |
| `docs/implementation/2026/quarter-IV/201-gate266-s1-detail-range-readout.md` | new doc. l.4 is exactly `**სტატუსი:** Completed (C round 270 PASS)` (L28). Georgian; the 7 TEMPLATE headings in order (L26); cites only test ids that exist |

Everything else is frozen:
- `ArrangementContext.tsx`, `model.ts`, `panels.ts`, `ArrangementTransport.tsx` and `StudioWorkspace.tsx`;
- the protected auth/purchase files (`studio.$productId.tsx`, `app/routes/api.studio-token*`, `app/lib/auth.ts`, `AuthContext.tsx`);
- `package.json`.

The historical doc 111 hit on the old title string stays (it is history, not a consumer).

## 5. Tests

### 5.1 Tests that change, and why (Saba's rule: a rewrite whose only change is removing an assertion is a Medium bug)
| File / test | Old | New | Why |
|---|---|---|---|
| strings.test.ts ST6 (l.385, l.411) | the old `splitRangeDone` and `splitRangeTitle` literals | the §3.3 literals | wording change |
| strings.test.ts ST7 (l.517, l.520) | `Clips split … the 2/3 parts …` | `Split at the time selection; the 2/3 clips inside it are selected.` | wording change |
| navigation-strings-ui NS2 (l.261) | `'Split at both edges of the time selection (Ctrl+E)'` | `'Split clips at the time selection (Ctrl+E)'` | wording change |
| background-time-selection-ui BS2 (l.555) | the old literal | `'Split at the time selection; the 2 clips inside it are selected.'` | wording change |
| detail-panel-polish "shows the clamped overlap for a range that only partly lies on the clip" | selection 0.5–4 shows `['2','4']`; after typing 3 and a re-set to 1–4, start stays `'3'` | renamed "shows the whole time selection for a range that only partly lies on the clip (GATE266-S1)": 0.5–4 shows `['0.5','4']`; typing 3, then a re-set to 1–4 shows `['1','4']` (displayed values changed); typing 3, then the same 1–4 set again as a new object keeps `['3','4']` | the old assertions pinned the bug. Each one is replaced on the same subject, and one more assertion is added |

The B pre-check proves these are the **only** collisions: 168 test files under `app/lib/arrangement/__tests__` and `app/components` ran on the scratch copy, with 5 failures, all listed above (`b-round-269/precheck-folder.txt`).

### 5.2 New rows (each red on a named mutant, §7, or labelled as a guard)
In `detail-panel-polish.test.tsx`, a new describe `GATE266-S1 the detail fields show the whole time selection (DR)`, mounted with music-1 (2–10 s) selected and the panel expanded. The lane name in this fixture is `მუსიკა`.
- **DR1:** set the selection to 0.5–4 → fields `['0.5','4']`. Enter in From → `range` toEqual `{start:0.5,end:4,trackId:'music'}` and the status is exactly `Time selection: 00:00.500 — 00:04.000 · მუსიკა.` Clicking Set leaves the range and the fields unchanged.
- **DR2:** 8–12.5 → `['8','12.5']`. Enter in To keeps it, and the status is `… 00:08.000 — 00:12.500 · მუსიკა.`
- **DR3:** `{start:3,end:5,trackId:'music',allTracks:true}` → `['3','5']`. Enter keeps `allTracks: true`, and the status is `Time selection: 00:03.000 — 00:05.000 · all tracks.`
- **DR4 (guard, the edited-values path is unchanged):** on 0.5–4:
  - typing From = 1 and pressing Enter → range unchanged, status = `rangeInvalid` exact text;
  - typing From = 3 and pressing Enter → `{3,4,'music'}`, fields `['3','4']`, status `… 00:03.000 — 00:04.000 · მუსიკა.`
- **DR5 (guard):** 11–12 on the same lane → fields `['2','10']`. Enter → `{2,10,'music'}`.
- **DR6:** on 0.5–4, type From = `0.500` (the same value, retyped) and press Enter → `range` toEqual `{0.5,4,'music'}` and the status is the applied text. This pins the normalised comparison; a raw-text mutant turns it red.

In `background-time-selection-ui.test.tsx` (real workspace, jsdom gestures):
- **DP1:** run `dragPastClipStart` (6.25–12.5), expanding the panel with `arrangement-detail-toggle` when From is absent. Then:
  - `selectedClipIds` = `['m1']` and fields `['6.25','12.5']`;
  - Enter in From → `range` toEqual `{6.25,12.5,'music'}`, fields unchanged, status exactly `Time selection: 00:06.250 — 00:12.500 · Music.`
- **BS3:** TWO_MUSIC_CLIPS, then `dragClipBody('m1', xFor(5) → +xFor(17))`. Then:
  - `range` = `{15,32,'music'}`;
  - Ctrl+E gives clip spans m1 10/0/5, new 15/5/5, m2 25/0/5 (m2 not cut);
  - selected `[insideA,'m2']`; status exactly `Split at the time selection; the 2 clips inside it are selected.`
- **`expectSplitPastStart`** gains `expect(statusText(mounted)).toBe('Clip split at the time selection; the part inside it is selected.')`, so BS1 and BS4 pin the one-edge literal.

The sketch of all rows is in `b-round-269/sketch.diff`. A may write them differently, provided they are equal or stronger.

### 5.3 A runs (speed rules)
- `npm run typecheck`;
- `npm run lint`;
- `npx biome check` on the 6 changed code and test files;
- `npx vitest run` on these 7 files: `app/lib/arrangement/__tests__/{detail-panel-polish.test.tsx,background-time-selection-ui.test.tsx,strings.test.ts,navigation-strings-ui.test.tsx,detail-panel.test.tsx,panels.test.ts,workspace-strings-ui.test.tsx}`. The B scratch result was 114/114 for the first four.

L31 headroom: gate 269 shows background-time-selection-ui at 20 tests in 6092 ms and detail-panel-polish at 16 tests in 4154 ms. Each test sits far under the 5000 ms default. A reports the slowest covering test; a test above 2500 ms is a STOP (L11).

A also runs the `code-reviewer` (7 files) and reports any Architecture note.

## 6. B's pre-check (L23), all in `b-round-269/`
- **Scratch:** `/tmp/b269-scratch` (an rsync of `store/` at `f6ebd2d`, with `node_modules` symlinked). `sketch.diff` (285 lines) applies §3 and §5.
- **Checks:** `npx tsc --noEmit` rc 0 (`precheck-typecheck.txt`); Biome on the 6 files is clean.
- **Collision sweep:** `precheck-files.txt` lists 27 files found by the regex in §9 K11; the sketch failed exactly the 5 tests in §5.1 (`precheck-sketch-vitest.txt`). The whole folder (168 files) gave the same 5 failures (`precheck-folder.txt`). With the §5.1 rewrites applied, the 4 files passed 114/114.
- **Mutants:** `mutants.py` and `mutants.txt` (§7).
- **Browser (Chromium, both viewports, 0 page errors):**
  - HEAD on :5173: `probe-detail-range-head.json`, `probe-alltracks-head.json`, `probe-split-copy-head.json`;
  - sketch on scratch :5182 (stopped after the probe): `*-sketch.json`.
  - The sketch shows past-start `6.25/12.5`, kept after Enter with "· Music."; past-end `12.5/115.102`, kept; inside unchanged; all-tracks kept, with "· all tracks." and 4 overlays.
  - Split statuses: A "Clip split at the time selection; the part inside it is selected."; G "Split at the time selection; the 2 clips inside it are selected."; title "Split clips at the time selection (Ctrl+E)".
- **1280×720:** the detail panel starts collapsed (`panelWasHidden: true`; INFO-C269-1280-DETAIL-COLLAPSED). Every 1280 recipe clicks `arrangement-detail-toggle` first [K10b].
- **Side effect:** the scratch Vite server re-optimised dependencies, which may have rewritten `store/node_modules/.vite` through the symlink. `store/` `git status` stayed empty.

## 7. Mutants (A red-proofs them; C re-runs them on its own scratch)
| Mutant | Change | Red at B (`mutants.txt`) |
|---|---|---|
| M-CLAMP-DISPLAY | restore the `Math.max`/`Math.min` display | DP1, DR1, DR2, the rewritten partial-overlap test |
| M-NO-KEEP | keep branch disabled (`false &&`) | DP1, DR1, DR2, DR3 |
| M-LANE | always `selection.laneName` in the keep branch | DR3 |
| M-RAW-TEXT | compare raw `startText`/`endText` instead of normalised values | DR6 (added after B's pre-check; A red-proofs it) |
| M-STR-DONE | old `splitRangeDone` | BS1, BS4, ST6 |
| M-STR-CLIPS | old `splitRangeClipsDone` | BS2, BS3, ST7 |
| M-STR-TITLE | old title | NS2, ST6 |

The unmutated sketch: 114/114. DR4 and DR5 are guards for unchanged paths; they are not mutant rows.

## 8. C rows (Chromium, `/studio-lab`, 1440×900 and 1280×720, fresh anonymous contexts)
Recipes as in `b-round-269/probe-detail-range.mjs` and `probe-split-copy.mjs`:
- wait for `Demo collection ready`;
- add the first library item to the Music lane by keyboard (focus option, Enter);
- at 1280, click `arrangement-detail-toggle` before reading fields [K10b].

Gate rows (full vitest, build, full Biome, verify, e2e smoke) are `gate`; do not claim them.

| Row | Steps | PASS when |
|---|---|---|
| SOURCE-SCOPE | `git status --porcelain` | only the 7 granted paths |
| HUNK-SCOPE | diff `ArrangementDetailPanel.tsx` | only the import, the 2 display lines and the keep branch; no class, testid, `disabled` or JSX change |
| CLAIMS | re-run §9 at HEAD | every K matches (L29) |
| TESTS-TARGETED | §5.3 files | all pass |
| TEST-REWRITES | diff each §5.1 test against HEAD | each removed `expect` has an equal or stronger replacement on the same subject |
| MUTANTS | §7 on C's own scratch | each red as listed |
| DP-BROWSER | past-start and past-end recipes | the From/To values equal the `arrangement-range` readout's start and end to 3 decimals (6.25/12.5; 12.5/115.102 or the measured end) |
| DP-ENTER | then focus From, Enter; also click Set | the readout, lane overlay `[data-range-start]/[data-range-end]` and fields are unchanged; status exactly `Time selection: <start> — <end> · Music.`; `document.activeElement` is still From after Enter (L47) |
| DP-EDIT | past-start recipe; type From = 11, Enter; then From = 9 (outside the clip), Enter | 11: selection 11.000–12.500, announced "· Music."; then 9: status = the `rangeInvalid` text, selection unchanged |
| DP-INSIDE | inside recipe; Enter | unchanged from HEAD (11.5/14, status "… · Music.") |
| DP-ALLTRACKS | inside recipe, then Ctrl+Shift+L, then Enter in From | readout keeps "all tracks", 4 lane overlays, status `Time selection: 00:11.500 — 00:14.000 · all tracks.` |
| SPLIT-COPY | recipe A (past start) + Ctrl+E; recipe G (gap, then drag from inside the first part past the last clip's end) + Ctrl+E; the Split button title with a selection | A: `Clip split at the time selection; the part inside it is selected.`; G: `Split at the time selection; the 2 clips inside it are selected.`, with clip starts 10/11.25/20; title `Split clips at the time selection (Ctrl+E)` |
| SPLIT-BOX (L3) | 1280×720, the G status | the status text box is not wider than its container and not truncated beyond HEAD (the old text is longer; measure both) |
| SCREEN-BUDGET (L39) | persistent text lines outside the timeline, HEAD vs new, state: past-start selection with the panel open | equal (no new persistent element) |
| STATUS-CLOBBER (L51) | DP-ENTER: read the status 1 s after Enter | still the applied text (no later write) |
| G270-AUTH | `/studio-lab` anonymous; `/studio/middle-east` signed out; `/api/studio-token` with no header and with a fake Bearer | loads with 4 lanes / "Sign in required", 0 audio requests / 401 / 500 without a token, as in round 269 |

**Ableton conformance:** C rates each §2 row separately. The fields have no reference, so their status is "not applicable". The split wording needs no deliberate-difference entry, because it is closer to Live's command name.

## 9. Claims (L29). Run from `store/` at HEAD
| Tag | Command | Expected |
|---|---|---|
| K1 | `git rev-parse HEAD; git status --porcelain \| wc -l` | `f6ebd2d01c361c17d11c5b885a40e37e2ca9f9eb`, `0` |
| K2 | `grep -n "const onClipStart\|const onClipEnd\|Math.min(range.end, clip.start + clip.duration)" app/components/arrangement/ArrangementDetailPanel.tsx` | `525:` (contains `Math.max(range.start, clip.start)`), `526:`, `527:` |
| K3 | `grep -n "const clamped = clampDetailRangeToClip\|const next: TimeRange = { ...clamped, trackId: target.trackId }\|const target = selection.clip;" app/components/arrangement/ArrangementDetailPanel.tsx` | `576:`, `578:`, `588:` |
| K4 | `grep -n "splitRangeDone:\|splitRangeClipsDone:\|splitRangeTitle:\|  allTracks: 'all tracks'," app/lib/arrangement/strings.ts` | `116:`, `117:`, `134:`, `144:` |
| K5 | `grep -rnE "both edges of the time selection\|Clips split\|middle part is selected\|parts inside it are selected" app perf e2e` | 9 lines: strings.ts 116/118/144, strings.test.ts 385/411/517/520, background-time-selection-ui.test.tsx 555, navigation-strings-ui.test.tsx 261 (`perf`, `e2e`: 0) |
| K6 | `grep -rn "studioEditStrings.splitRange" app --include=*.ts --include=*.tsx \| grep -v __tests__` | ArrangementTransport.tsx:177; ArrangementContext.tsx:1992, :2000, :2005 |
| K7 | `grep -n "import { studioDetailStrings } from '~/lib/arrangement/strings';" app/components/arrangement/ArrangementDetailPanel.tsx` | `51:` |
| K8 | `grep -n "rangeInvalid:\|rangeApplied: " app/lib/arrangement/strings.ts` | `787:`, `810:` |
| K9 | `grep -n "isTypingTarget(event.target)$" app/components/arrangement/StudioWorkspace.tsx`; `grep -n "const TEXT_INPUT_TYPES" app/components/arrangement/StudioWorkspace.tsx` | `2222:`; `409:` (the set has no `button`) |
| K10 | `grep -c "it('" app/lib/arrangement/__tests__/detail-panel-polish.test.tsx app/lib/arrangement/__tests__/background-time-selection-ui.test.tsx` | 16 and 18 |
| K10b | browser: `b-round-269/probe-detail-range.mjs` at HEAD | `panelWasHidden` false at 1440×900, true at 1280×720 |
| K11 | the collision regex: `grep -rlE "arrangement-detail-(start\|end\|apply\|reason)\|clampDetailRangeToClip\|isDetailRangeInsideClip\|splitRange\|both edges\|Clips split\|studioDetailStrings\|studioEditStrings\|rangeMultiReason\|noneReason" app --include=*.test.ts --include=*.test.tsx \| wc -l` | 27 |
| K12 | browser state recipes, `b-round-269/probe-*-head.json` | the §1 tables (run once by B at HEAD) |

## 10. STOP conditions (L11)
- Any covering test fails, or one runs above 2500 ms.
- A change is needed outside §4.
- Two clauses of this task disagree.
- The keep branch would have to call `setTimeRange` to pass a row.
- Any row would need a disabled or hidden element.

## 11. After C PASS
- GATE266-S1, B-R269-DETAIL-ALLTRACKS-DROP, GATE266-S4 and B-R266-CLIPS-SPLIT-COPY close.
- Round 271 = SABA-B-11c stage 2 (relative snap, Saba option (a)), unless REGRESSION is due (on or after 2026-11-02, in which case it goes first).
- Then SYS-6.
- RETRO at 275.
