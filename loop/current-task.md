# Round 248: SABA-B-11b stage 2b. Snap never lands on a grid whose lines are hidden. Hidden lines pause Snap (Alt included), and the controls and grid statuses say so.

**Planned by:** B, at the round 247 → 248 planning, 2026-10-29. **Decisions:** D-29z419…D-29z425.

**Type:** the last stage of a feature (SABA-B-11b, approved by Saba on 2026-10-28 as part of SABA-B-9/10/11). It closes **ABL-R-8**. One owner for the mechanism (`StudioWorkspace.tsx`), plus 1 prop in `ArrangementLane.tsx`, 1 type in `ArrangementTempoRow.tsx` and 3 strings.

**Why this round (D-29z419, D-29z424):**
- Round 247 passed C (`browserVerified: true`), and gate 247 published `da8c641`.
- D-29z418 says: "if that planning is still 2026-10-29, SABA-B-11b stage 2b first". This planning is on 2026-10-29 (`date -u` 10:58).
- **REGRESSION** (`regression-last.json`: 2026-10-27, round 199) is due at the first planning on or after 2026-10-30, so not now. **RETRO** is next due at round 260.

**Read first:** `lessons.md` in full. Directly relevant here:
- **L23** (B's pre-check, §0.2) and **L29** (every recipe was run; claims cite a grep, §0.3);
- **L3** (the longest status state, row C-STATUS-BOX-248) and **L51** (status clobber, §1.4);
- **L39** (screen budget: titles and status only), **L44** (one Saba question, §1.6), **L45** (the unit is unchanged);
- **L11** (STOP), **L31** (timeouts), **L26** and **L28** (doc 186 is the final-stage doc).

**Not this round:**
- REGRESSION-ROUND-2026-10-30 (next planning on or after 2026-10-30).
- SABA-B-10a/10b/9/11c, SABA-B-7 (`awaiting_user`), ROOT-RECON-MARKER-ENTER, and the protected purchased route (SRW-21, `deferred_user`).
- The round-247 Lows (A-R247-REVIEW-L1, -L2, -L3 + GATE247-S1, GATE247-S2). They are in `deferred_low_polish` (D-29z420).
- A shared focus-rescue hook (gate 247 Architecture note). It is a checkpoint question, not scope (D-29z421).
- Clip-edge and marker snapping on their own when the grid is hidden ("magnetic edges without a grid"). That is a new behaviour, not this stage. It is asked as part of SABA-Q-11B-HIDDEN-SNAP (§1.6).

## 0. Baseline and scope

**Start state:**
- HEAD = `da8c64192d3574adf349dd3a9626ad16ec94d858` (gate 247 `published`; `b-round-247/head-at-planning.txt`).
- `git status --short --untracked-files=all` is **empty** (`b-round-247/git-status-at-planning.txt`, 0 bytes).
- **STOP (L11)** if HEAD differs or any path is dirty. One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-247-r248-tree-sha256.txt`, **1,098** files. That is every tracked file (1,112), minus the 10 granted files and the 4 root files.
- From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-247-r248-tree-sha256.txt` gave rc 0 at planning.
- Each of the 7 protected auth and purchase files appears exactly once (checked): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`.
- Also frozen:
  - `grid.ts` (`resolveSnapStep` keeps its contract; §1.2), `grid-divisions.ts`, `ArrangementClip.tsx`, `ArrangementRuler.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementGridMenu.tsx`, `ArrangementContext.tsx` and `shortcuts.ts`;
  - every other test file;
  - every implementation doc except doc 186;
  - `.claude/**`, `CLAUDE.md` and every config file.

**Root-owned, must equal HEAD:** `b-round-247-r248-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`), with start hashes in `b-round-247-r248-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants (`b-round-247-r248-grants.txt`; start hashes in `b-round-247-r248-grants-start-sha256.txt`)
The applied diff is `b-round-247/precheck-scratch.diff` (grants 1–9) against HEAD `da8c641`. `git apply --check -p1` on the clean store tree gives rc 0. **A may apply it as is**, then write grant 10.

| # | Path | Change (`git apply --numstat`) |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | +94/−53. Most of the −53 is Biome re-wrapping `changeGridDivision` once it gets a deps array; its body, order and side effects are unchanged (L49). <ul><li>`gridLinesShown` moves up, next to `gridSeconds` (it was at l.2578, after the `barsRulerGestures` memo that now needs it). Two derived values: `snapGridSeconds = gridLinesShown ? gridSeconds : undefined` and `activeSnapSeconds = snapEnabled && gridLinesShown ? gridSeconds : null`.</li><li>The 5 snap sites get `activeSnapSeconds` / `snapGridSeconds`: `barsRulerGestures` (and its deps), `ArrangementRuler`, `ArrangementMarkerRow`, `ArrangementLoopBrace`. `ArrangementLane` keeps `gridSeconds` (drawing) and gets the new `snapGridSeconds`.</li><li>The two ref paths check `gridLinesVisible(gridSecondsRef.current, pxPerSecondRef.current)`: the empty-lane click seek (l.2041) and the selected-clip arrow nudge (l.2390), which falls back to `NUDGE_SECONDS` (0.1 s) as with Snap off.</li><li>`withSnapPausedNote(message)` (`useCallback`, no deps) appends `studioGridStrings.snapPausedNote` when `snapEnabledRef.current` is true and the current grid's lines are hidden. It wraps exactly 6 writes: `toggleSnap` (on), `changeGridDivision`, the adaptive branch of `stepGridDivision`, `toggleGridMode`, the adaptive branch of `toggleGridTriplet` and `chooseGridMenuAdaptiveDensity`. Their deps arrays gain `withSnapPausedNote`.</li><li>The grid control gets `data-snap-paused` (`'true'` only when Snap is on and the lines are hidden). The Snap button's `title` becomes `snapPausedTitle` in that state. `data-snap`, `aria-pressed` and the button text stay as they are.</li></ul> |
| 2 | `app/components/arrangement/ArrangementLane.tsx` | +4/−2: the optional prop `snapGridSeconds?: number`. The library-drop `resolveSnapStep` (l.252) uses it, and it is forwarded to `ArrangementClip` as `gridSeconds`. The lane's own `gridSeconds` stays for the lines, `data-grid-seconds` and `data-grid-lines`. |
| 3 | `app/components/arrangement/ArrangementTempoRow.tsx` | +1/−1: `BarsRulerGestures.gridSeconds: number` → `number \| undefined`. The key stays required. |
| 4 | `app/lib/arrangement/strings.ts` | +3/−1: `titleLinesHidden` says "…lines are hidden at this zoom, so Snap is paused. Zoom in. …"; new `snapPausedTitle` and `snapPausedNote` (exact text in §1.3). |
| 5 | `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | +122/−3: GS10 rewritten to the new contract (§2.2); `HIDDEN_LINES_TITLE` gets the new text; a new describe `SABA-B-11b stage 2b Snap never lands on hidden grid lines (D-29z420)`, `{ timeout: 15_000 }`, with HS1–HS5 and the helpers `altDragClip` and `pressArrowRight`. |
| 6 | `app/lib/arrangement/__tests__/grid-snap-position.test.tsx` | +39: a new describe `SABA-B-11b stage 2b no seek snap on hidden grid lines (D-29z420)` with HP1–HP2. |
| 7 | `app/lib/arrangement/__tests__/grid-musical-ui.test.tsx` | +1: GU12 zooms to 100 px/s before its nudges. At 40 px/s, 1/32 at 120 BPM is 2.5 px, so the old test pinned snapping to hidden lines. Its expected values are unchanged. |
| 8 | `app/lib/arrangement/__tests__/grid-musical.test.ts` | +2/−2: GM5's two `titleLinesHidden` strings. |
| 9 | `app/lib/arrangement/__tests__/strings.test.ts` | +7/−3: ST23 keys and plain strings gain `snapPausedNote` and `snapPausedTitle`; three `titleLinesHidden` strings in ST24. |
| 10 | `docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md` | §2.3. This is the final stage, so l.4 becomes `Completed (C round 248 PASS)` (L28, multi-stage clause). |

- **No test assertion is removed.** GS10 changes its expected values and adds asserts. GU12 adds one zoom line. All the string rows change only the pinned text.
- **Read before editing:**
  - `AUDIO_ARCHITECTURE.md` (Studio files; no audio change);
  - `AGENT_DISCOVERABLE_CODE.md`: new names `snapGridSeconds`, `activeSnapSeconds`, `withSnapPausedNote`, the prop `snapGridSeconds`, and the strings `snapPausedTitle` / `snapPausedNote`;
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`;
  - `.claude/prompts/studio-feature.md`.

### 0.2 B's pre-check (L23, done)
B extracted HEAD to `/tmp/b248-scratch` with `git archive` (outside the repo) and applied the change there.
- **Static checks:** `npx tsc --noEmit` rc 0. `npx biome check` on the 9 files: "No fixes applied".
- **L23 grep** for the changed tokens in tests (`Snap still works|titleLinesHidden|lines are hidden|data-grid-lines|data-snap`) gives 19 test files. All of them are in the covering set. Only GS10, GU12, GM5, ST23 and ST24 went red on the change before their grants were written. No frozen test needed a grant.
- **Covering set** (`b-round-247/covering.txt`): **134 files, 2,073/2,073 green** (`b-round-247/covering.log`). It is every `app/**` test file that matches `grep -rlE "StudioWorkspace|ArrangementLane|ArrangementTempoRow|studioGridStrings|strings'|grid|[Ss]nap"`.
- **Timeouts (L31):**
  - The new rows take 45–80 ms each, against the 15 s describe timeouts.
  - The files take `grid-snap-ui` 4.8 s (25 tests), `grid-snap-position` 2.6 s (19 tests) and `grid-musical-ui` 3.6 s (14 tests).
  - No test in these files is near 50 %. The slowest covering file is `track-group-collapse-ui` (22.1 s for 30 tests); it is unchanged.
- **Red proofs.** All run on the 5 test files of grants 5–9. Script: `b-round-247/mutants/run-mutants.sh <scratch> <logdir>`, with the mutants in `mutate.py`. MU-HEAD was run by hand (the 4 source files from `da8c641`, with the new tests). Summary: `b-round-247/mutants/logs/summary.txt`. The runs used a second copy, `/tmp/b248-mut`, so the browser probe's server never saw a mutant.

| Run | Change | Red rows |
|---|---|---|
| FIX-CONTROL | none | none |
| MU-HEAD | all 4 source files from `da8c641` | **GM5, GS10, HP1, HP2, HS1, HS2, HS4, HS5, ST23, ST24** (HS3 is green at HEAD, because Alt + Snap on is already free there) |
| MU-ACTIVE-IGNORES-LINES | `activeSnapSeconds = snapEnabled ? gridSeconds : null` | **GS10, HP1, HS5** |
| MU-ALT-ENABLES-HIDDEN | `snapGridSeconds = gridSeconds` | **HP2, HS2, HS3** |
| MU-LANE-FORWARDS-DRAW-GRID | Lane uses `gridSeconds` for its `resolveSnapStep` and for the clip | **HS2, HS3** |
| MU-SEEK-REF-IGNORES-LINES | the empty-lane seek uses the old ref expressions | **HP1, HP2** |
| MU-NUDGE-HIDDEN | the nudge checks only `snapEnabledRef` | **HS4** |
| MU-NO-NOTE | `withSnapPausedNote` returns the message unchanged | **HS1** |
| MU-TITLE-NOT-PAUSED | the Snap title stays `snapOnTitle` | **HS1** |
| MU-PAUSED-ATTR | `data-snap-paused` is always `"false"` | **GS10, HS1, HS5** |

### 0.3 Recipes and measurements (L29)
**Browser probe** `b-round-247/snap-hidden-probe-248-v2.cjs <base> <out.json> [shotDir] [caseRegex]`. Each case uses a fresh context and waits for `Demo collection ready`. HEAD was measured on `:5173` and the fix on `:5174` (`/tmp/b248-scratch`, now stopped).
- **At load (both builds):** Snap is **off**. The grid is adaptive 1 s in the seconds family at 40 px/s, with no tempo. So every recipe turns Snap on with `G` itself.
- Musical cases first add `demo-stem-pulse` (click its library row, then **Add**). That seeds 120 BPM and Snap on (status `… Tempo 120 BPM … Snap on — grid 1/2 (G)`).
- Zoom is set by the `arrangement-zoom` range input (native value setter + `input` event). The minimum is 0.5 px/s at position 0. The probe binary-searches for 20, 60 or 100 px/s.

| Case | HEAD `da8c641` | Fix (scratch) | Files |
|---|---|---|---|
| **minZoomAdaptive:** slider 0 (0.5 px/s; adaptive 10 s; `data-grid-lines` hidden), `G`, ruler click | 810 (1440) / 670 (1280): a hidden 10 s line | 811.328 / 669.92: free | `head-probe3.json`, `scratch-probe.json` |
| same, Snap off, **Alt** ruler click | 970 / 800: Alt switched the hidden grid on | 973.08 / 803.48: free | same |
| **fixed01Hidden:** choose `0.1` (4 px at 40 px/s), `G`, ruler clicks | 11.1, 13.3 | 11.133, 13.299 | same |
| same, Snap off, Alt click (its own x, ≥ 800 ms after the previous click) | 18.7 | 18.717 | same |
| **fixed01Visible:** `0.1` at 60 px/s (6 px, visible), `G`, click; then Snap off + Alt click | 11.1; 11.1 | 11.1; 11.1 (unchanged) | `head-probe2.json`, `scratch-probe.json` |
| **musical132Hidden:** pulse, choose `1/32` (2.5 px), ruler click | 8.563 (1440) / 7.063 (1280) | 8.535 / 7.051 | `head-probe-musical.json`, `scratch-probe-musical.json` |
| same at 100 px/s (6.25 px, visible), click | 7.688 (1440) | 7.625 (1440): snapped | same; **1280 invalid**, see below |
| **nudgeHidden:** pulse, choose `0.25`, 20 px/s (5 px), click the clip, Snap on, ArrowRight ×2; then 40 px/s, ArrowRight | 0 → 0.25 → 0.5 → 0.75 | 0 → 0.1 → 0.2 → **0.25** (the next visible line) | `head-probe2.json`, `scratch-probe.json` |

- **Signals at the fix** (both viewports, `scratch-probe.json`):
  - Hidden + Snap on gives `data-snap-paused="true"`, Snap title `Snap on — paused: grid lines are hidden at this zoom. Zoom in. (G)`, and select title `Grid 0.1 s — lines are hidden at this zoom, so Snap is paused. Zoom in. · 1 — narrower, 2 — wider · Fixed at every zoom — 5 for adaptive`.
  - Status after `G`: `Snap on — grid 0.1 s (G) · Lines are hidden at this zoom, so Snap is paused — zoom in.`
  - Status after choosing `1/32`: `Grid: 1/32 · 0.063 s at 120 BPM (Snap on) · Lines are hidden at this zoom, so Snap is paused — zoom in.`
  - Visible gives `data-snap-paused="false"` and no note. At HEAD the attribute does not exist.
  - Every row has 0 page errors.
- **Invalid attempts, kept:**
  - `atLoad@1440` (fix) timed out on the Vite cold start. Re-run clean in `scratch-probe-musical.json`.
  - `head-probe2.json` fixed01Hidden `altClickSnapOff` = 11.133. It reused the x of the click before it, so Chromium may have counted a double-click (the ruler's double-click is Fit). Re-measured with distinct positions in `head-probe3.json`: 18.7.
  - `clickVisible` in `head-probe2.json` and `scratch-probe.json` was off-screen (the ruler at 100 px/s is wider than the window).
  - The musical visible click at 1280 repeated the first value on both builds, so it is invalid. C re-measures it.
- **Harness facts for C:** (INFO-B248-RULER-DBLCLICK) give each ruler click its own x and ≥ 800 ms between clicks. (INFO-B248-OFFSCREEN-RULER) clamp click x to the visible part of the ruler.
- **Code facts (grep at `da8c641`):**
  - every snap path starts from StudioWorkspace props or refs: `grep -rn "resolveSnapStep\|resolveGridTime\|adjacentGridLine\|snapTimeToGrid" app --include=*.tsx` → Clip l.513/735 (fed by Lane), LoopBrace l.144/167/207, Lane l.252, Ruler l.158/181/283, TempoRow l.119, MarkerRow l.486/580, StudioWorkspace l.2041/2400;
  - `ArrangementLoopBrace` l.201 and `ArrangementMarkerRow` l.484 already take their Snap-off branch when `snapSeconds === null`: `LOOP_KEY_STEP_SECONDS` and `MARKER_KEY_STEP_SECONDS`, both 0.1 s (l.17, l.54). B did not run those two key paths in the browser; C measures them (C-KEYSTEP-248).

## 1. Ruling D-29z420: a hidden grid pauses Snap

### 1.1 The rule
- **Hidden** means `gridLinesVisible(gridSeconds, pxPerSecond)` is false. The lines are less than 6 px apart (`GRID_LINE_MIN_SPACING_PX`). This covers:
  - a fixed division zoomed out (0.1 s below 60 px/s, 1/32 at 120 BPM below 96 px/s, …);
  - the adaptive grid at its widest end (10 s below 0.6 px/s; 1 bar at 120 BPM below 3 px/s).
- **While the lines are hidden, every grid snap acts as Snap off.** That covers clip move and trim, library drop, ruler click, playhead drag, empty-lane click, the bars ruler, the tempo row, markers and the loop brace.
  - Clip-edge and marker targets are not snapped to either. Today they are reached only through a non-null grid step, the same as with Snap off.
  - The keyboard steps use their Snap-off steps: a selected clip moves 0.1 s (`NUDGE_SECONDS`), and the loop brace and markers move 0.1 s.
- **Alt never switches on a hidden grid.**
  - With Snap off, Alt + a visible grid still snaps, as Live 6.10 says ("if the grid is switched off, using the modifier will temporarily enable it").
  - With Snap on, Alt bypasses as before.
- **The Snap toggle keeps the user's choice.** `data-snap`, `aria-pressed` and the button's look stay `on`. Zooming in until the lines show resumes snapping at once, with no key press.
- **The drawn grid, the division readout and the adaptive chooser are unchanged.**

### 1.2 Why this design (and not the alternatives)
- **The approved text** (transport-grid-review.md, 11b): "snap ხილულ ბიჯზე გადადის ან status-ს წერს" (snap moves to a visible step, or writes a status). This round takes the second branch: snap pauses and the UI says so.
- **Coarsening was rejected.** Snapping to the finest visible step of the same family would land on lines that are still not drawn, because `ArrangementLane` draws `gridSeconds` (l.677). Drawing the coarser step instead would make the readout ("1/32") disagree with the drawn lines, and it would invent a "fixed with a floor" mode that Live does not document. It is bigger and less honest. It is the alternative in SABA-Q-11B-HIDDEN-SNAP.
- **`grid.ts` is not changed.** Passing `undefined` as the grid to the existing `resolveSnapStep` already gives `null` for both Alt cases. That keeps its 1 jsdom contract (SP1) and every other caller unchanged.
- **The ref paths read the zoom from `pxPerSecondRef`** at the moment of the gesture. No new ref is needed.

### 1.3 Exact strings (grant 4)
- `titleLinesHidden(label)`: `` `Grid ${label} — lines are hidden at this zoom, so Snap is paused. Zoom in. · 1 — narrower, 2 — wider` ``.
- `snapPausedTitle`: `'Snap on — paused: grid lines are hidden at this zoom. Zoom in. (G)'`.
- `snapPausedNote`: `'· Lines are hidden at this zoom, so Snap is paused — zoom in.'`. It is appended after one space.

### 1.4 Status writes (L51)
- **The note is appended only by the 6 user grid actions of grant 1**, and only when Snap is on and the resulting grid is hidden. The checks read `gridSecondsRef` after the action has updated it.
- **Zoom changes write no status.** This is D-29z357 (adaptive zoom is silent), and it is the same for the visible/hidden crossing.
  - A crossing in either direction keeps the last status. The title and `data-snap-paused` follow the zoom.
  - A status per crossing was rejected. It would fire on every zoom step and overwrite other statuses (L51), for example the seed, an export or a refusal.
- **Unchanged writes:**
  - The tempo seed's `Snap on — grid … (G)` part keeps its text. The seed picks an adaptive 1/4 grid, which is hidden only below 3 px/s at 120 BPM.
  - The tempo change and the clear-tempo message (`gridTempoClearedMessage`), and the adaptive end messages (`adaptiveNarrowest` / `adaptiveWidest`, which do not mention Snap).
  - All of these are info rows for C (C-STATUS-NEIGHBOURS-248). Saba is asked about them in §1.6.
- **What a note can overwrite:** the 6 writes replace the status line, as they do at HEAD. The note only lengthens them. No new write is added.

### 1.5 Side effects kept (L49)
`changeGridDivision`, `toggleSnap`, `stepGridDivision`, `toggleGridMode`, `toggleGridTriplet` and `chooseGridMenuAdaptiveDensity` keep every ref and state write, in order, at HEAD: `gridHandChosenRef`, `gridModeRef`, `snapHandChosenRef`, the density and the division. Only the string passed to `setStatus` gains the conditional note. Rows GS1–GS20, GAU*, GM* and GU* in the covering set pin those side effects, and they stay green.

### 1.6 Saba question (L44, D-29z422)
**SABA-Q-11B-HIDDEN-SNAP** (`awaiting_user`, non-blocking):
- When the grid lines are hidden at the current zoom, CZABA now pauses Snap, including Alt and the clip-edge and marker targets. The Snap title and the grid statuses say "paused", and zooming in resumes it.
- Alternatives:
  - (b) snap to the finest visible step and draw that step;
  - (c) keep edge and marker magnetism while the grid is paused;
  - (d) add a one-time status when zooming hides the lines, which today is silent.
- Live 12 documents none of these.

### 1.7 Why we missed it
This is not a Saba-reported issue, so no lesson is required. The gap ("Snap still works" on hidden lines) was recorded in `transport-grid-review.md` §3 row "დამალული ხაზები" and has been carried as stage 2b since D-29z368.

## 2. Changes

### 2.1 Source (grants 1–4)
Exactly the diff, with no new dependency and no new export. `ArrangementLane`'s new prop is optional, so every other `<ArrangementLane>` render (tests) keeps its old behaviour: a Lane without `snapGridSeconds` has no Alt grid of its own.

### 2.2 Rows (grants 5–9)
| Row | Case | Expected |
|---|---|---|
| GS10 (rewritten) | fixed 0.1 s at 40 px/s: lines hidden; `G`; drag m1 +13 px; zoom 60; drag +13 px | `data-snap` on, `data-snap-paused` true; m1 7 → **7.325** (free); at 60 px/s lines visible, paused false, the old visible title; m1 7.325 → **7.5** (snapped) |
| HS1 | 0.1 s at 40 px/s: status after the choice, after `G`; zoom 60; choose 0.25; zoom 40, choose 0.1; `G` | `Grid: 0.1 s (Snap off)`, paused false, title Snap off; then the paused status (§0.3), paused title, `aria-pressed` true, paused true; at 60 px/s paused false, the normal title, **status unchanged** by the zoom; `Grid: 0.25 s (Snap on)` with no note; `Grid: 0.1 s (Snap on) · Lines are hidden …`; `Snap off — free movement (G)`, paused false |
| HS2 | Snap off, 0.1 s at 40 px/s, Alt drag m1 +13 px; zoom 60, Alt drag +13 px | 7.325 (free); then **7.5** (Alt switched the visible grid on) |
| HS3 | Snap on, 0.1 s at 40 px/s, Alt drag +13 px | 7.325 |
| HS4 | 0.25 s at 20 px/s (hidden), Snap on, s1 selected, ArrowRight; zoom 40 (visible), ArrowRight | 4.3 → **4.4** (0.1 s step); 4.4 → **4.5** (the next grid line) |
| HS5 | adaptive, Snap on, 0.5 px/s | mode adaptive, division 10, lines hidden, paused true; drag s1 +4 px (8 s) → **12.3** (free). Under MU-ACTIVE-IGNORES-LINES it lands on 12.5 (m2's start edge, reached through the hidden grid step). At HEAD the row fails first on the missing attribute. |
| HP1 | fixed 0.1 s at 40 px/s, Snap on: ruler click x 293, empty-lane click x 185, playhead drag to x 213 / release at 217; then 80 px/s: ruler x 586, lane x 370 | **7.325, 4.625**, handle 5.325, release **5.425** (free); at 80 px/s **7.3, 4.6** (snapped) |
| HP2 | Snap off, Alt, the same ruler and lane clicks at 40 and at 80 px/s | 7.325, 4.625 (free); then **7.3, 4.6** (Alt switched the visible grid on) |
| GU12 (+1 line) | 1/32 at 120 BPM, zoom 100 px/s before the nudges | the same values as at HEAD: 0.188, 0.25, 0.188, 0.125 |

### 2.3 Doc 186 (grant 10)
- l.4 is exactly `**სტატუსი:** Completed (C round 248 PASS)` (L28).
- `## მიდგომა`: one paragraph on stage 2b. Cover the D-29z420 rule, the rejected coarsening and why `grid.ts` is unchanged, and keep measured facts (§0.3) apart from inference.
- `## შეცვლილი ფაილები`: add the stage-2b files (a list, no code).
- `## პრობლემები და გადაწყვეტები`: Problem → Solution for "Snap still works" on hidden lines, and for the Alt path that switched on a hidden grid (HEAD 970 / 18.7 in the browser).
- `## ტესტირება`: GS10, HS1–HS5, HP1–HP2, GU12 and the 10 runs of §0.2. Cite only rows that exist (grep the ids, L26).
- `## TODO / შემდეგი ნაბიჯები`: replace the "ეტაპი 2b (შემდეგი რაუნდი)" block with:
  - stage 2b done;
  - ABL-R-8 closes at this PASS;
  - the Saba questions, now with **SABA-Q-11B-HIDDEN-SNAP**;
  - the ARCH-CHECKPOINT-TEMPO-GRID re-ask (D-29z423).
- Every other section is unchanged. The seven TEMPLATE headings stay in order (L26).
- `grep -rn 'In Progress (stage' docs/implementation` at planning gives 2 hits:
  - doc 186: this grant;
  - doc 176 (`stage 1 of 2; C round 225 PASS`): tied to the open PERF-HARNESS-SHARED-LIB-b-ii, not this round.

## 3. Reference: how Ableton Live 12 does it
| Behaviour | Source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Snap follows the grid lines; the grid is zoom-adaptive or fixed | Live 12 manual 6.10 "Using the Editing Grid" (checked 2026-10-28, `transport-grid-review.md` §3, [AV 6.10]) | "the cursor will snap to grid lines …"; "zoom-adaptive or fixed" | Snap lands only on drawn lines | C-HIDDEN-SNAP-248, C-VISIBLE-KEEP-248 |
| The modifier with the grid off | the same, 6.10 | "If the grid is switched off, using the modifier will temporarily enable it" | **Kept for a visible grid.** A hidden grid is not enabled: a deviation (⚖), in SABA-Q-11B-HIDDEN-SNAP. The Mac modifier is still SABA-Q-11B-MAC-BYPASS | C-ALT-HIDDEN-248 |
| Snapping when the lines are not drawn | `ableton-arrangement-expert` and `docs-explorer` consults (2026-10-29, `stage_plan` of SABA-B-11b); the manual 6.10 text; tutorial notes `reference/youtube/SABA-B-9-10-11-transcripts.md` (GRGG 0:00, 0:44: readout and adaptive default only) | **No reference found.** Adaptive mode in Live avoids the state; fixed-mode zoom-out is not described | B ruling D-29z420 (pause), asked once (L44) | parity status: **unconfirmed** |
| Grid readout and Snap state are shown | GRGG 0:00 (spacing readout bottom-right) | a readout exists | CZABA tells the paused state in titles, `data-snap-paused` and action statuses. No new persistent text (L39) | C-SIGNALS-248, C-BUDGET-248 |

- **Deviations:** (⚖) a hidden grid is never enabled by Alt; (⚖) edge and marker magnetism pause together with the grid. "Simpler to build" is not the reason: the reason is that the user cannot see the lines being snapped to (`transport-grid-review.md` §3, "Selection ხტება ხაზებზე, რომლებიც ეკრანზე არ ჩანს").
- **Better than Live (claim to test):** the select title and the status name the reason and the remedy ("zoom in").

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start state (§0):** HEAD, empty status, and `sha256sum -c` on the frozen 1,098 list, the root list and the grant start list.
2. **Apply** `b-round-247/precheck-scratch.diff` (`git apply -p1`), then write grant 10.
3. **Static checks:** `npm run typecheck` rc 0; `npx biome check` on grants 1–9 clean; `npm run lint` rc 0.
4. **Covering set:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-247/covering.txt)`. Expect 134 files, 2,073/2,073. Any test above 50 % of its timeout is a STOP at the top of the report (L11).
5. **Mutants:** make a scratch copy outside `store/` (`git archive` of HEAD plus the 9 changed files, with `node_modules` symlinked). Run `b-round-247/mutants/run-mutants.sh <scratch> <logdir>`. For MU-HEAD, put the 4 source files back from `git show da8c641:<file>` and run the 5 test files. Expect exactly the red rows of §0.2. The repo `git status` must be identical before and after.
6. **code-reviewer:** run it on the diff (3+ files). Pass its Architecture note to B.
7. **Playwright** against `:5173` at both viewports. Run a copy of `b-round-247/snap-hidden-probe-248-v2.cjs`; do not edit it in place. Expect the "Fix" column of §0.3.
8. **Report:** write `a-round-248.md` with:
   - the hunks;
   - the tests run, with counts;
   - the mutants;
   - the reviewer result;
   - any STOP, at the top.

## 5. C: acceptance
Use real Chromium on `/studio-lab` at 1440×900 and 1280×720, with a fresh context per row. Wait for `Demo collection ready` first (L48). Give each ruler click its own x, within the visible ruler, with ≥ 800 ms between clicks (§0.3 harness facts). Compare with a HEAD control server where the row says "as at HEAD".

| Row | What | Pass when |
|---|---|---|
| C-SCOPE-248 | HEAD, status, hashes | <ul><li>HEAD is `da8c641`.</li><li>Status is exactly `M` on the 10 grants, with nothing else.</li><li>`sha256sum -c` on `b-round-247-r248-tree-sha256.txt` (1,098) and on the root list gives rc 0.</li><li>The 7 protected files give `git diff --quiet HEAD` rc 0.</li><li>`git diff HEAD -- app` equals `b-round-247/precheck-scratch.diff` hunk for hunk.</li></ul> |
| C-UNIT-248 | `b-round-247/covering.txt` (134 files) | All green, including GS10, HS1–HS5 and HP1–HP2. The full suite is a gate row. |
| C-MUT-248 | the 10 runs of §0.2, once each, on a scratch copy outside the repo | The red rows are as listed. The repo status is identical before and after. |
| C-HIDDEN-SNAP-248 | The bug, both viewports, Snap on and lines hidden (`data-grid-lines="hidden"` on the control and every lane): <ul><li>(a) fixed `0.1` at 40 px/s;</li><li>(b) adaptive at the slider minimum (0.5 px/s, division 10);</li><li>(c) after adding `demo-stem-pulse`, fixed `1/32` at 40 px/s.</li></ul>For each: a ruler click, an empty-lane click, a playhead drag release, and a clip drag (read `data-clip-start`). | <ul><li>Every result is the free time: not a multiple of the hidden step (beyond rounding to 1 ms), and within 1 px of the pointer.</li><li>At HEAD the same recipe lands on the hidden line (B: 11.1 / 810 / 8.563).</li><li>`data-snap-paused="true"`.</li><li>Screenshots.</li></ul> |
| C-ALT-HIDDEN-248 | Alt (on the pointer up) over a hidden grid: (a) Snap off; (b) Snap on. Then the control: Snap off + Alt with the lines visible (0.1 at 60 px/s) | <ul><li>(a) and (b) give the free time; HEAD (a) lands on the hidden line (B: 18.7, 970).</li><li>The control snaps, as at HEAD (11.1).</li></ul> |
| C-VISIBLE-KEEP-248 | Visible grids still snap, as at HEAD: 0.1 at 60 px/s; 1/32 at 100 px/s (pulse added); the load state (adaptive 1 s at 40 px/s) with Snap on: ruler click, clip drag, loop brace drag, marker drag | The same values as at HEAD, at both viewports. Re-measure the 1/32 at 100 px/s click at 1280, whose B attempt was invalid. |
| C-RESUME-248 | Snap on, hidden (0.1 at 40 px/s); zoom in to 60 px/s without any key; click the ruler | It snaps (resume without a key press). `data-snap-paused` goes `true` → `false`. The Snap button's `aria-pressed` stays `true` throughout. |
| C-NUDGE-248 | After the pulse is added: choose `0.25`, 20 px/s, click the clip, Snap on, ArrowRight ×2; then 40 px/s, ArrowRight | `data-clip-start` 0.000 → 0.100 → 0.200 → **0.250** (HEAD: 0.25, 0.5, 0.75). |
| C-KEYSTEP-248 | Hidden 0.1 at 40 px/s with Snap on: <ul><li>a focused loop brace (make a loop with Ctrl+L on a time selection), ArrowRight;</li><li>a selected marker flag (`M`), ArrowRight.</li></ul> Then the same at 60 px/s | <ul><li>Hidden: each moves 0.1 s (`LOOP_KEY_STEP_SECONDS`, `MARKER_KEY_STEP_SECONDS`).</li><li>Visible: each moves to the next 0.1 s grid line, as at HEAD. B did not run these in the browser (§0.3), so C writes the values it measures, with HEAD as the control.</li></ul> |
| C-SIGNALS-248 | Titles, attribute and statuses | <ul><li>Hidden + Snap on: the Snap title, the select title and the statuses are exactly the §0.3 / §1.3 texts.</li><li>The note appears after each of `G`, `4`, choosing a division (select and grid menu), `1`/`2` in adaptive mode and the grid menu width items, `5`, and `3` in adaptive mode, whenever the result is hidden with Snap on.</li><li>There is no note when the result is visible or Snap is off.</li><li>A zoom crossing in either direction leaves the status text unchanged.</li><li>Lines visible: `data-snap-paused="false"` and the old titles.</li></ul> |
| C-STATUS-BOX-248 | L3: the longest note status (`Grid: 1/32T · … (Snap on) · Lines are hidden …` after the pulse, `3`, at 40 px/s) at 1280×720 and 1440×900 | <ul><li>The status element has no horizontal overflow (`scrollWidth ≤ clientWidth`) and does not cover the transport.</li><li>Record its height and the footer height. Compare with the add + seed status after adding the pulse (the existing long state), and record both.</li><li>FAIL if the note status takes more lines than the seed status at the same width.</li></ul> |
| C-STATUS-NEIGHBOURS-248 | Info | The tempo seed status, tempo clear, and the adaptive end messages keep their HEAD text (§1.4). Record any case where "Snap on" is announced while `data-snap-paused` is true. |
| C-KEYS-248 | Neighbour keys | `G`, `4`, `5`, `1`, `2` and `3` typed in a text field (BPM, search) do nothing to the grid, as at HEAD. |
| C-BUDGET-248 | L39 | The persistent text lines outside the timeline match round 247: empty 85/69 and demo 101/85 at 1440/1280. |
| AN-REVIEW-248 | Doc 186 | <ul><li>l.4 is byte-exact.</li><li>The 7 headings are in order.</li><li>D-29z420 and the rejected coarsening are explained.</li><li>Every cited row exists.</li><li>The TODO no longer calls 2b "next", and lists SABA-Q-11B-HIDDEN-SNAP.</li></ul> |
| LAB-SMOKE-248 | `/studio-lab` | It loads. Space plays and pauses. After adding `demo-stem-pulse`, the export WAV has sha256 `1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94`. 0 page errors. |
| Auth | Standing check | In a fresh context: <ul><li>`/studio-lab` opens anonymously, with `auth_user` null;</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and no `audio[src]`;</li><li>`/api/studio-token` with no header returns 401.</li></ul> |
| Purchased origin (browser) | Snap on the purchased copy | BLOCKED: backend unavailable in cloud. The grants add no origin branch. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

**Ableton parity** (C states it separately): rows 1–2 of §3 are **confirmed** or a **deliberate deviation**, as listed; row 3 is **unconfirmed**. A test PASS does not prove parity.

## 6. Neighbouring behaviour that could break (C probes these first)
- **Visible-grid snapping anywhere** (C-VISIBLE-KEEP-248). The derived values replace 5 prop sites and 2 ref sites; a missed one would stop snapping on a visible grid.
- **Clip-edge and marker snap with Snap on and a visible grid** (D-29z17/18, the `grid-snap-clip-edges` rows). They are unchanged.
- **The drawn lines and `data-grid-seconds` on each lane** stay those of the division. Only the snap input changes.
- **Adaptive zoom silence** (D-29z357), the seed, `gridHandChosen` (GAU21) and the grid menu checks (D-29z369).
- **Library drop onto a lane** with hidden lines: it lands free (Lane l.252). Snap on with visible lines still snaps.
- Any change to the export, the audio, history labels or selection is a regression.

## 7. Outcomes for B's next planning
- **PASS and gate published:** SABA-B-11b is done (stages 1, 2a, 2b). ABL-R-8 closes.
  - **Next (D-29z424):** the **REGRESSION round** at the first planning on or after 2026-10-30. It carries every `scope_additions` entry of REGRESSION-ROUND-2026-10-30, plus C-HIDDEN-SNAP-248 (one short row).
  - If that planning is still on 2026-10-29, **SABA-B-10a** goes first, with C-R235-02. Before dispatching it, B lists every test that pins the Space contract (policy), and asks root once more for the two checkpoints below.
  - Then SABA-B-10b, 9 and 11c. SABA-B-7 runs when Saba answers.
- **A product row FAILS:** a fix-up on the same grants first.
- **Checkpoints (non-blocking, D-29z421, D-29z423):** ARCH-CHECKPOINT-TEMPO-GRID (re-ask after 2b, now due) and ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS (with the gate-247 note) are requested from root at this feature boundary: `b-round-247-checkpoint-request.md`.
