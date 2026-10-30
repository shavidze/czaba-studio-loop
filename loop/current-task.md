# Round 262: SABA-B-9 stage 2. Master volume moves to the workspace's bottom-right corner (+ the Master labels move into `strings.ts`)

**Planned by:** B, at the round 261 → 262 planning, 2026-10-30. **Decisions:** D-29z530 (round 261 closed), D-29z531 (this round), D-29z532 (placement ruling + Saba question), D-29z533 (Master labels, SIG-R261-INLINE-LABELS), D-29z534 (no toolbar fold-in), D-29z535 (docs, L28), D-29z536 (gate-261 suggestions), D-29z537 (C info notes), D-29z538 (architecture addendum).
- **Read first:** `lessons.md` in full. These apply directly: L3 (the bounds below are measured), L4 (one element, one rule), L11 (STOP), L12 + L23 (a moved target: grep roots `app/**/__tests__`, `perf/**`, `e2e/**`), L26/L28 (docs), L29 (claims block, §9), L38 (perf runs alone), L39 (screen budget), L43/L44 (Saba question, §1), L47/L50 (focus), L53 (narrow probe).
- **Previous task:** `tasks/round-261.md` (an exact copy of the round-261 `current-task.md`). C's result: `c-round-261.json` (PASS). B's reasoning: `b-round-261.md`.
- **Saba's decision this implements** (`policy.local.md`, "SABA-B-9/10/11", decision 4): "the master volume (`ArrangementMaster`, now in the header's right side) moves to the **bottom-right corner** of the workspace, where Live keeps the Main track's mixer. These are the only position moves approved."

## Baseline: HEAD `10e1cd4`, clean tree
- `gates/gate-round-261.json` = `published`, commit `10e1cd4f7df96bb0f9bd4c2f6ab293ee2e805839` (rounds 260–261). At planning, `git rev-parse HEAD` = `10e1cd4…` and `git status --short --untracked-files=all` was empty (`b-round-261/head-at-planning.txt`, `b-round-261/git-status-at-planning.txt`, 0 bytes) [K1].
- **Frozen:** every tracked file except the 9 grants: **1,111** entries, in `b-round-261-r262-tree-sha256.txt`. From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-261-r262-tree-sha256.txt` → rc 0 at planning. Each of the 7 protected auth and purchase files appears in it exactly once [K2].
- **Grants (edit):** `b-round-261-r262-grants.txt`:
  1. `app/components/arrangement/StudioWorkspace.tsx`: only the move of `<ArrangementMaster />` (§3.1).
  2. `app/components/arrangement/ArrangementMaster.tsx`: only the label wiring (§3.2), plus a `shrink-0` class if §3.1 needs it.
  3. `app/lib/arrangement/strings.ts`: one new object (§3.2).
  4. `app/lib/arrangement/__tests__/master-ui.test.tsx`
  5. `app/lib/arrangement/__tests__/meter-ui.test.tsx`
  6. `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`
  7. `perf/lib/app-labels.ts`
  8. `perf/studio-lab.perf.spec.ts`: the import and the master locator line only.
  9. `docs/implementation/2026/quarter-IV/193-saba-b-9-centre-transport.md`: l.4 only (L28 multi-stage).
- **New file:** `b-round-261-r262-new-files.txt`: `docs/implementation/2026/quarter-IV/196-saba-b-9-master-bottom-right.md`.
- **Not granted:** everything else, especially `ArrangementTransport.tsx`, `ArrangementContext.tsx`, `ArrangementVideoDock.tsx`, `ArrangementLibrary.tsx`, `panels.ts`, `shortcuts.ts`, `app.css`, `e2e/**`, the other perf specs, `perf/budgets*.json`, `package.json`, `.claude/**`, `CLAUDE.md` and the 7 protected files.

## 0. Why this round
- **Round 261 closed as C PASS** (10/10 rows, `browserVerified` and `realVerified` true, 0 bugs), and gate 261 published it. That closes PERF-HARNESS-STRINGS-DRIFT and C-R260-01/02 (D-29z530). C's three spec-tension rulings are confirmed (`b-round-261.md` §3).
- **Outcome fixed in advance** (task 261 §4, row 1): all rows passed, and the planning date is 2026-10-30, before 2026-11-02. So the regression is not due (`regression-last.json`: round 258, next due on or after 2026-11-02), and round 262 = **SABA-B-9 stage 2**.
- **Open Critical/High:** none. The parked Mediums are unchanged.
- **Stage 1** (rounds 256–257, `d732d26`) centred the transport and added Stop. This stage closes SABA-B-9.

## Why we missed it (SABA-B-9; policy 2026-10-28)
- **Which phase should have caught it:** the Ableton expert review P1 (rounds 123–124), the VISUAL-A M1 round (181) and screen review 230. Each one saw the transport and the master, and none compared their positions with Live's Control Bar and Main track.
- **Why not:** the position was frozen by the visual rules ("positions stay"), so "±0 px" counted as a pass, and no phase had to turn it into a Saba question (`docs/technical/studio-real-workspace/transport-grid-review.md` §1.4).
- **The rule:** it already exists as **L43** ("A position frozen by the rules is a question for Saba, not a pass"), added at the SABA-B-11a planning. B does not add a new lesson; this round applies L43 again (SABA-Q-9-MASTER-ROW, §1). C row LESSON checks that the lesson exists.

## 1. Reference: how Ableton Live 12 does it
Sources were fetched by B on 2026-10-30. The manual is Live 12, `https://www.ableton.com/en/live-manual/12/mixing/` (Mixing chapter) and `https://www.ableton.com/en/live-manual/12/arrangement-view/` (Arrangement View chapter). The video is the root transcript `reference/youtube/SABA-B-9-10-11-transcripts.md`, "Mixer layout (riOD 0:51)".

| # | Point | Live 12: confirmed fact (source) | CZABA after this round | C row |
|---|---|---|---|---|
| R1 | Where the Main (master) mixer lives | "The return tracks and the Main track occupy the right-hand side of the Session mixer view and the bottom end of the Arrangement View." (Mixing §18.4 "Return Tracks and the Main track"). Video riOD 0:51: the Main track's mixer sits at the bottom of the track list. | The Master group sits at the bottom of the workspace, at the right end of the footer's last row. **Deviation D1** (below). | PLACE-1440, PLACE-1280 |
| R2 | Mixer control at the bottom right | "You can also show/hide the mixer using the mixer view control in the bottom right corner of Live's window." (Arrangement View §6.15; also §6.1 item 16). | The Master group sits next to the bottom-right `Shortcuts ?` button. It cannot be hidden. **Deviation D2.** | PLACE-* |
| R3 | Mixer show/hide shortcut | "The mixer can be opened using the Mixer command in the View menu or the shortcut Ctrl+Alt+M (Win) / Cmd+Option+M (Mac)." (§6.15) | No hide shortcut. **Deviation D2.** | (none; not built) |
| R4 | Which side the track mixer controls are on | Figure caption: "The Mixer (Bottom) and Arrangement Track Controls (Right)." (§6.15). Track Controls hold "Volume, panning, I/O…" (§6.1 item 10). | Lane mixers stay on the left (unchanged). **Deviation D3** (a frozen position, so per L43 a Saba question). | (none; unchanged) |
| R5 | Behaviour of the Main volume | "The Volume control adjusts the track's output level." (§18.1.1). Mute is the Track Activator switch (§18.1.1). The text read states a double-click reset for Pan only, not for Volume. | Unchanged: the fader (−60…+6 dB, 0.5 step), `M`, double-click → 0.0 dB, keyboard steps, Shift fine, the readout, the meter and Peak. **Deviation D4** (our M button and double-click reset predate this round). | AUDIO, KEYS |
| R6 | Cursor, hover and visuals | No reference found. The text read (Mixing chapter characters 0–100,000; Arrangement View 0–100,000) describes no cursor or hover for the Main track. | Unchanged. The move changes no colour, size or cursor. | SCREEN-BUDGET |
| R7 | Edge cases | Inference from §18.4, not observed in a video: the Main track stays at the "bottom end" whatever the number of tracks. | The Master group stays visible at every scroll position and in every footer state (selected clip, time range, lane-move hint). | STATES |

**Deviations.** Each is part of one Saba question, `SABA-Q-9-MASTER-ROW` (D-29z532, L43/L44). The default listed is what this round builds.
- **D1, the footer corner instead of a Main-track row under the lanes.**
  - Live puts the Main track at "the bottom end of the Arrangement View". The literal Live form is a new always-visible strip (a lane row) under the lanes.
  - That strip moves the lane and scroller geometry and adds a persistent strip, which the screen-budget rule (L39) rates Medium without approval. Saba approved a move to "the bottom-right corner", not a new row.
  - So the round uses the existing footer: it is the workspace's bottom-right corner and adds no strip.
  - Question (a): "Should Master become a Main-track row under the lanes, as in Live?"
- **D2, Master sits left of `Shortcuts ?`, not in the very corner, and cannot be hidden.**
  - The policy allows only the master to move, so `Shortcuts ?` keeps its corner. L4 ruling: the frozen-position rule wins for `Shortcuts ?`, and the Master group takes the next slot to its left.
  - Live's corner holds the mixer toggle (R2).
  - Question (b): "Swap Master and `Shortcuts ?`?" Question (c): "Add a show/hide for Master like Live's Ctrl+Alt+M?"
- **D3, lane mixers on the left.** Pre-existing and not moved (L43). Question (d): "Live shows Track Controls on the right (§6.15). Move ours?"
- **D4, the `M` button and double-click → 0 dB on Volume.** These are pre-existing CZABA behaviours (SRW-13). Listed for completeness and not asked again, because it is not a position.

## 2. Measured facts (B's baseline probe at `10e1cd4`, real Chromium, `/studio-lab`)
Scripts and output are in `b-round-261/probe/` (`baseline.mjs` → `head.json`; `sketch.mjs` → `sketch.json`; `range.mjs` → `range.json`). The sketch moved the Master `fieldset` in the DOM into `footer > div`, before its last child (the `Shortcuts ?` button) [K9].

| Measure | 1440×900 HEAD | 1440×900 sketch | 1280×720 HEAD | 1280×720 sketch |
|---|---|---|---|---|
| `header` height | 35 | 35 | 35 | 35 |
| transport toolbar (y, h) | 35, 49 | unchanged | 35, 87 | unchanged |
| `footer` height (empty, or clip selected) | 49 | **53** | 49 | **53** |
| `footer` height (time range set) | 69 | **73** | 69 | **73** |
| `[data-testid="arrangement-timeline-scroller"]` height (empty) | 516 | **512** | 406 | **402** |
| Master group box (x, y, w, h) | 765.8, 7, 424.3, 20 | 911.8, 874, 424.3, 20 | 605.8, 7, 424.3, 20 | 751.8, 694, 424.3, 20 |
| `Shortcuts ?` x / right | 1352 / 1428 | 1352 / 1428 | 1192 / 1268 | 1192 / 1268 |
| overlaps with Master; footer horizontal overflow | – | 0; 0 | – | 0; 0 |

- **1024×720 (L53):** the sketch also gives 0 overlaps and 0 overflow. The selected-clip line truncates to 468 px (its existing `truncate`).
- **Why +4 px:** the Master row is 20 px tall (the `M` button is `h-5`), and the footer's last row was 16 px.
- **Ruling (L3, D-29z532):** the footer may grow by exactly the Master row's extra height, **+4 px (±0.5)**, in every state, and the scroller loses the same 4 px. The header and toolbar stay ±0. Shrinking the `M` button to fit 16 px is **not** allowed: it would change a control's size, and only its position was approved.
- **Tab order at HEAD** (empty project; from `arrangement-exit`, Tab): Master Mute → Master Volume → Master Peak → Follow → Play → … (`head.json` `tabFromExit`). Undo and Redo are disabled in the empty project, so they are not stops. From `Shortcuts ?`, Tab leaves the page content (BODY, then the exit link) [K9].
- `head.json` holds only the empty state (its clip key is `null`, because the probe's selector found no clip there). The clip-selected and range states are in `sketch.json` (`headClip`) and `range.json` (`headRange`), with screenshots `head-clip-*.png`.
- **HEAD evidence for C (one method, chosen here):** C does not need a running HEAD app. The HEAD side of every "same as HEAD" row is B's stored probe output and screenshots in `b-round-261/probe/`, plus the HEAD `master-ui` / `fader-*` unit rows for keyboard behaviour. If C wants to re-run a HEAD probe (K9), the recipe is: `git -C store archive 10e1cd4 | tar -x -C <dir outside store/>`, symlink `node_modules`, run `npx vite dev --port 5174` there, then `BASE=http://127.0.0.1:5174 node b-round-261/probe/<script>.mjs <outdir>`. Never run it at the same time as `test:perf` (L38).

## 3. A: what to build
1. **Move** (`StudioWorkspace.tsx`):
   - Remove `<ArrangementMaster />` from the header's right group (l.2733) [K3].
   - Render it inside the footer's last row (`<div className="flex min-w-0 basis-full items-center gap-x-4">`, l.3128), as the element **directly before** the `Shortcuts ?` button (`ref={shortcutButtonRef}`, l.3175) [K3].
   - It sits at a fixed child slot of that row, after the existing one-slot ternary (lane-move hint / selected clip / reserve; l.3129 and l.3144) [K10], so a change of footer content never remounts it (row FOCUS-KEEP).
   - The header keeps its badge in the right group. No other header, toolbar, library, dock, timeline or footer element changes position.
   - Add `shrink-0` on the Master `fieldset` if it is needed so the group never compresses. The hint and selected-clip lines keep truncating (`min-w-0 flex-1 truncate`).
2. **Labels** (SIG-R261-INLINE-LABELS, D-29z533):
   - Add to `strings.ts`: `export const studioMasterStrings = { groupLabel: 'Master', muteLabel: 'Master Mute', volumeLabel: 'Master Volume' };`. The values are byte-identical to today's inline text [K4].
   - In `ArrangementMaster.tsx`, use these keys for the `fieldset` `aria-label`, the visible `Master` span, the Mute `aria-label` and `title`, and the fader `aria-label` [K4]. The rendered DOM text and attributes stay byte-identical.
   - The Peak labels (`studioMeterStrings`) are unchanged.
3. **Perf** (`perf/lib/app-labels.ts`, `perf/studio-lab.perf.spec.ts`):
   - Import `studioMasterStrings` in the existing single import from `../../app/lib/arrangement/strings`.
   - Export `perfMasterVolumeLabel = studioMasterStrings.volumeLabel`.
   - Delete the `masterVolume` entry from `perfInlineLabels`, so the allowlist has **5** entries [K6].
   - `perf/studio-lab.perf.spec.ts` l.179 uses `perfMasterVolumeLabel` [K6]. Nothing else in the perf files changes. `perf/budgets.json` scenario texts ("drag Master Volume, …") are report data, not locators, and stay unchanged.
4. **The 3 colliding tests** (B's scratch pre-check, §4). The rule: **no assertion lost; equal or stronger replacements allowed** (L4).
   - `master-ui.test.tsx` l.623, "sits in the workspace header before the transport…" [K5], becomes "sits in the footer's last row, directly before the Shortcuts button…":
     - the `footer` contains Mute and Volume, and the `header` does not;
     - `Shortcuts ?` follows Master Peak in document order, and Play precedes Master Mute;
     - keep the 0-renders-per-Play-frame and Stop asserts.
   - `meter-ui.test.tsx` l.535, "puts Master Peak after Master Volume and before Play in the header" [K5]: Peak still follows Volume, and it now comes **after Play and before the Shortcuts button**.
   - `studio-theme-obsidian.test.tsx` TH9 l.311 [K5]: the label order becomes `['Zoom', 'BPM', 'Markers', 'Loop', 'Master']`, with the same token asserts.
   - **New row** (in `master-ui.test.tsx`): the rendered group, mute and volume names equal `studioMasterStrings.*`, and the source of `ArrangementMaster.tsx` contains none of the inline literals (`aria-label="Master`, `title="Master Mute"`). Red-proof: a mutant that restores one inline `aria-label="Master Volume"` is red.
   - **New row FOCUS-KEEP** (in `master-ui.test.tsx`):
     - render `StudioWorkspace` and hold a reference to the Master Volume element; focus it;
     - change the footer content through the provider API: add and select a clip, clear the selection, and set a time range;
     - after each step, the Master Volume node is the same node (`===`) and is still `document.activeElement`.
     - Red-proof: a mutant that puts `<ArrangementMaster />` inside a branch of the footer ternary is red.
5. **Docs:**
   - **Doc 196** (new): Georgian, TEMPLATE headings in order (L26); l.4 byte-exact `**სტატუსი:** Completed (C round 262 PASS)` (L28); it states deviations D1–D4 and the +4 px footer ruling; it cites only tests that exist.
   - **Doc 193 l.4** becomes `**სტატუსი:** Completed (C round 262 PASS)` (L28 multi-stage; this is stage 2 of 2). Nothing else in doc 193 changes.
6. **Checks A runs** (speed rules):
   - `npm run typecheck` and `npm run lint`;
   - `npx vitest run` on the 3 granted test files plus `strings.test.ts`, `fader-focus-order.test.tsx`, `transport-surface-ui.test.tsx`, `header-meter-envelope-strings-ui.test.tsx`, `track-volume-db.test.tsx` and `fader-style-ui.test.tsx`;
   - **`npm run test:perf`, alone (L38),** because the master fader scenario's target moved (the C-R258-01 class). Paste the rc, specs passed, `complete`, aborts, failed budget rows and the `fader.master.*` rows.
   - No full suite and no `npm run verify` (gate rows).
7. **Code-reviewer:** 9+ files, so ask `code-reviewer`, and pass its Architecture note to B. A Medium+ finding outside the grants is a STOP (L11).
8. **STOP conditions** (L11, at the top of `a-round-262.md`):
   - the footer cannot hold Master without wrapping into a new row at 1280×720 or 1024×720;
   - the header or toolbar height changes;
   - any test outside the grants turns red;
   - `test:perf` fails at a step that passed in round 261 (`c-round-261/latest*.json`).

## 4. B's pre-check (L23)
- **Scratch:** `/home/runner/czaba-project/tmp/b261-scratch`, a copy of `10e1cd4` with §3.1–3.3 applied (`b-round-261/probe/sketch-full.diff`).
- **Tests run:** `npx vitest run` on the 23 test files that the grep `arrangement-master|'Master'|Master Volume|Master Mute|Master Peak|ArrangementMaster|labelTexts` finds in `app/lib/arrangement/__tests__` (list in `b-round-261/probe/precheck-files.txt`, `strings.test.ts` included). Result: **3 failed / 373 passed**, exactly the 3 rows granted in §3.4 (`precheck-vitest-2.txt`).
- **Typecheck and lint:** `npx tsc --noEmit` rc 0 (`precheck-tsc-2.txt`). Biome on the 2 app files: clean.
- **Other roots:** in `perf/**` the only `.ts` hits are `app-labels.ts` l.72–75 and `studio-lab.perf.spec.ts` l.179, both granted [K6]. `e2e/**` has 0 hits [K7].
- **Timeout headroom (L31):** in the gate-261 `verify.log`, `master-ui` takes 2.7 s for 18 tests, `meter-ui` 3.4 s and `studio-theme-obsidian` 0.4 s. All are far below their limits.
- **Focus origins (L50):** `grep -cE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)'` gives 2 hits in `ArrangementMaster.tsx` and 20 in `StudioWorkspace.tsx` [K8]. **Ruling:**
  - This task moves no focus and adds no handler. The only changed relation is the Master group's parent.
  - The footer hits are the conditional siblings (`range ?`, `selectedClipIds.length > 1 ?`, and `clipLaneDrag ? … : selectedClip ? … : …`). They share one row: FOCUS-KEEP.
  - Every other hit is out of scope: its code is unchanged, and the Master group is not inside it.

## 5. C: what to verify
C writes `c-round-262.md` and `c-round-262.json` as it goes. "Both viewports" means 1440×900 and 1280×720, a fresh anonymous context on `/studio-lab`, after `Demo collection ready` (L48).

| Row | Check | PASS means | FAIL means |
|---|---|---|---|
| **SOURCE-SCOPE** | From `store/`:<ul><li>`sha256sum -c --quiet ../tmp/studio-real-loop/b-round-261-r262-tree-sha256.txt` → rc 0;</li><li>`git status --short --untracked-files=all` lists only grants (` M`) and doc 196 (`??`);</li><li>HEAD is `10e1cd4`.</li></ul> | Only granted and new files changed. | Any other change. |
| **PLACE-1440 / PLACE-1280** (browser) | Normal state. Bounding boxes of the Master group `[data-testid="arrangement-master"]`, `header`, the toolbar `[data-testid="arrangement-transport"]`, `footer`, `Shortcuts ?` and the scroller. | <ul><li>Master is inside `footer` and not inside `header`.</li><li>Its right edge is left of `Shortcuts ?`, with a gap of 16 ± 0.5 px (the row's `gap-x-4`), and it is vertically inside the footer's last row.</li><li>`Shortcuts ?` x and right equal §2 (±0.5).</li><li>Header 35 and toolbar 49 / 87 (±0.5).</li><li>Footer 53 (±0.5); scroller 512 / 402 (±0.5).</li><li>0 overlaps between Master and any footer leaf; footer `scrollWidth` = `clientWidth`.</li></ul> | Any value out of bound, an overlap, or overflow. |
| **STATES** (browser, both viewports) | <ol><li>Add the first library item (`Add`), so a clip is selected.</li><li>Drag on the clip body to make a time range.</li><li>Start a lane-move drag if it is reachable; otherwise record "not reachable" with the reason.</li></ol> | Master's x and width are unchanged across the states. The footer is the HEAD state + 4 (clip 53, range 73). The selected-clip line truncates, does not wrap, and keeps its text. | The footer wraps into a new row, Master shifts, or text is lost. |
| **NARROW** (L53, browser) | 1024×720 in the normal state and with a clip selected. Also find the narrowest width ≥ 1024 at which any footer leaf overlaps Master. | 0 overlaps at 1024. Report the first-overlap width, or "none ≥ 1024". | An overlap at ≥ 1024. |
| **SCREEN-BUDGET** (L39, browser) | Full-window screenshots before (HEAD: B's `b-round-261/probe/head-full-*.png`, or C's own HEAD run) and after, at both viewports, for the empty project and the demo with a clip. Count persistent text lines outside the timeline. | Count ±0: `MASTER` moved, not added. No new strip. | +1 line or more (Low), or a new strip (Medium). |
| **TAB-ORDER** (L47, browser, both viewports) | **Empty project** (fresh load; Undo and Redo disabled). From `arrangement-exit`, Tab. Then Shift+Tab from `Shortcuts ?`. | <ul><li>Forward: Master Mute, Master Volume and Master Peak are no longer the first 3 stops; the first stop is Follow (the first enabled toolbar stop).</li><li>Shift+Tab from `Shortcuts ?` gives Master Peak → Master Volume → Master Mute, each with a visible SABA-B-4 ring (computed outline ≥ 1 px).</li><li>Tab from `Shortcuts ?` behaves as at HEAD (it leaves the page content).</li><li>BODY never appears in between.</li></ul> | A different order, BODY, or a missing ring. |
| **FOCUS-KEEP** (unit; no browser half) | Run the A row FOCUS-KEEP (§3.4) and its mutant on a scratch copy. The browser half is dropped on purpose: every browser recipe that changes the footer content (selecting a clip, `Add`, an empty-lane click) points at a focusable, and the pointer press moves focus by itself, so the browser cannot isolate a remount. | The row is green; the mutant (Master inside a ternary branch) is red. | Green mutant, or a red row. |
| **AUDIO** (browser, real audio) | Add a clip and Play. Read `[data-testid="arrangement-master-meter"]` `data-level-db` over ≥ 1 s. Then: <ol><li>drag the Master Volume fader down by about 40 % of its width;</li><li>press `M`;</li><li>unmute and double-click the fader;</li><li>drag again and Undo.</li></ol> | <ul><li>Playing at 0 dB, the level is finite.</li><li>After the drag, the readout is < −10 dB and the level falls by ≥ 6 dB.</li><li>`M` → `aria-pressed=true`, and the level reads `-inf` within 1 s.</li><li>Double-click → readout `0.0 dB`.</li><li>Undo after the drag → the previous gain, in one entry.</li></ul> | Any step without its effect. |
| **KEYS** (browser) | Focus Master Volume: ArrowDown ×2, then Shift+ArrowDown once. Then press Escape mid-drag (pointer down, move, Escape). | The values match the HEAD contract pinned in the unchanged unit rows (`master-ui`, `fader-guards`, `fader-focus-order`; C names the rows it compares with): the step values those rows assert for ArrowDown and Shift+ArrowDown. Esc restores the pre-drag value. | Any deviation from those rows. |
| **LABELS** | Read `strings.ts` and `ArrangementMaster.tsx`; run `grep -cE 'aria-label="Master\|title="Master Mute"\|^ *Master$' app/components/arrangement/ArrangementMaster.tsx`. In the browser, read the accessible names of the group, the mute button and the fader. | grep gives 0; `studioMasterStrings` has exactly the 3 values; the browser names (`Master`, `Master Mute`, `Master Volume`) are byte-equal to HEAD. | A literal left, or a changed name. |
| **PERF-WIRING** | <ul><li>`perfInlineLabels` has exactly 5 entries (no `masterVolume`); `perfMasterVolumeLabel` comes from `studioMasterStrings.volumeLabel`.</li><li>The 5 remaining needles are found (`grep -cF`).</li><li>Mutant, on a fresh scratch copy outside `store/` (as in MUTANT-PERF 261): rename `volumeLabel` in `studioMasterStrings`, then run `npx tsc --noEmit`. Control first: rc 0.</li></ul> | Control rc 0; the mutant shows an error in `perf/lib/app-labels.ts`; 5/5 needles found. | No perf error on the mutant, or a needle not found. |
| **PERF-RUN** (browser) | `npm run test:perf`, **alone** (L38), once (2 replacement attempts only for environment-invalid runs). | <ul><li>rc 0 and 3/3 specs.</li><li>Every pass `complete`, 0 aborts, 0 page errors, and every budget row passes.</li><li>The `fader.master.stopped` and `fader.master.playing` rows are present, with `playing.restarts` = 0.</li><li>The deterministic rows equal `c-round-261/latest*.json`, except layout-dependent rows, which C lists with a reason.</li></ul> | Any abort, failed spec or failed budget (Medium). |
| **TESTS-TARGETED** | `npx vitest run` on the files A lists in §3.6. Mutant: restore `<ArrangementMaster />` in the header on a scratch copy. | Green; with the mutant, the new `master-ui` placement row and the `meter-ui` row are red. | Red, or the mutant stays green. |
| **DOCS** | Doc 196 and doc 193 l.4. | TEMPLATE headings in order; l.4 byte-exact in both; D1–D4 and the +4 px ruling stated; only existing tests cited. | Any miss. |
| **ABLETON** | One row per reference point R1–R7 of §1. | Each is "match" or a listed deviation (D1–D4). | A difference with no listed deviation (Medium if it changes what a user must learn). |
| **LESSON** | From the loop root: `grep -c "^43\. \*\*A position frozen by the rules is a question for Saba" lessons.md`. | `1` | `0` (the lesson is missing). |
| **G262-AUTH** (browser) | Fresh anonymous context at 1440×900: <ul><li>`/studio-lab` shows the workspace and the demo badge, and `auth_user` is null;</li><li>`/studio/middle-east` shows "Sign in required" and 0 `audio[src]`;</li><li>`/api/studio-token` with no header.</li></ul> | 401, and no token is issued. | Any bypass (Critical). |

- **Gate rows:** full vitest, build, Biome, `npm run verify` and e2e smoke. List them under `"gate"`, never in `"passed"`.
- **`browserVerified`** is true only if every browser row above ran.
- **Ableton conformance status per row:** confirmed, deliberate difference, unconfirmed, or not applicable.

## 6. Outcome, fixed in advance
| C result | B at the round-263 planning |
|---|---|
| All rows PASS, planning before 2026-11-02 | SABA-B-9 → **მზადაა**, and SABA-Q-9-MASTER-ROW goes to Saba. Round 263 = **L46-CONTRACT-CHECKS**, then SABA-B-11c (the `ableton-arrangement-expert` consult on the off-grid offset first), then SYS-6. |
| All rows PASS, planning on or after 2026-11-02 | Round 263 = **REGRESSION**, then as above. |
| A layout, focus or audio row fails | Round 263 = a bounded fix-up with the same grants. |
| PERF-RUN fails only in the master scenario | A fix-up in `perf/**` with the same grants. |
| G262-AUTH bypass | Stop. Critical first. |
| SOURCE-SCOPE fails | Stop. Root inspects. |

## 7. Neighbour risk
- **The floating video** (`ArrangementVideoDock`, `fixed z-40`, clamped to the window) can be dragged over the footer, as it already can over `Shortcuts ?` today. Its default rect sits inside the library body. The library inset depends only on the dock rect (`floatingVideoLibraryInsetPx`), so it is unchanged. STATES runs with the dock collapsed. No new rule.
- **The timeline loses 4 px of height** (§2). Fit and the vertical scroll metrics read live sizes. C's PLACE rows measure the scroller.
- **The SABA-Q-11B-READOUT corner question:** a future grid-spacing readout would share this footer area. Nothing is added now.
- **The undo label `Master Volume`** lives in `ArrangementContext.tsx`, which is not granted, so it stays inline (a signal).

## 8. Deliverables and root notes
- **A:** the granted files, doc 196, and `a-round-262.md` (changes, the commands run with their results, the `test:perf` summary, the reviewer notes).
- **C:** `c-round-262.md` and `c-round-262.json` (`taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`), with evidence under `c-round-262/`.
- **Root:** commit-ready on C PASS. This completes SABA-B-9. The ARCH-CHECKPOINT-TRANSPORT-POSITIONS addendum is `b-round-261-checkpoint-addendum.md` (non-blocking).

## 9. Claims (L29 form; C re-runs each verbatim)
`\|` inside a command is the markdown table escape; run it with `|`.

| Tag | Claim | Command (from `store/` unless stated) | Expected |
|---|---|---|---|
| K1 | gate 261 published; HEAD and tree at planning | from the loop root: `python3 -I -c "import json;g=json.load(open('gates/gate-round-261.json'));print(g['status'],g['commit'])"; cat b-round-261/head-at-planning.txt; wc -c < b-round-261/git-status-at-planning.txt` | `published 10e1cd4f7df96bb0f9bd4c2f6ab293ee2e805839`; the same hash; `0` |
| K2 | 1,111 frozen entries; each protected file once | from the loop root: `wc -l < b-round-261-r262-tree-sha256.txt; for f in 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/__tests__/download-routes.test.ts app/lib/auth.ts app/contexts/AuthContext.tsx app/entry.server.tsx; do grep -cF "  $f" b-round-261-r262-tree-sha256.txt; done \| tr '\n' ' '` | `1111`; `1 1 1 1 1 1 1` |
| K3 | the header mount, the footer row and the Shortcuts button | `grep -n "<ArrangementMaster />\|<header \|<footer \|ref={shortcutButtonRef}\|className=\"flex min-w-0 basis-full items-center gap-x-4\"" app/components/arrangement/StudioWorkspace.tsx` | 5 lines: l.2717 header, l.2733 mount, l.3096 footer, l.3128 row, l.3175 ref |
| K4 | the inline Master labels; no strings key yet | `grep -nE 'aria-label="Master\|title="Master Mute"\|^ *Master$' app/components/arrangement/ArrangementMaster.tsx; grep -c studioMasterStrings app/lib/arrangement/strings.ts` | 5 lines: l.172, 180, 185, 186, 208; then `0` |
| K5 | the 3 colliding rows | `grep -n "it('sits in the workspace header\|it('puts Master Peak after" app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/meter-ui.test.tsx; grep -n "'Master', 'Zoom'" app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | master-ui l.623; meter-ui l.535; studio-theme-obsidian l.311 |
| K6 | the perf master locator | `grep -rn --include=*.ts "masterVolume\|Master Volume" perf` | 4 lines: `perf/lib/app-labels.ts` l.72, l.73, l.75; `perf/studio-lab.perf.spec.ts` l.179 |
| K7 | no e2e hit | `grep -rlE "Master Volume\|Master Mute\|arrangement-master" e2e \| wc -l` | `0` |
| K8 | the L50 counts | `grep -cE 'onPointerDown(Capture)?\|onBlur\|settleEditor\(\|\.focus\(\|^\s*\{[^}]*(\.map\(\|&&\|\?)' app/components/arrangement/ArrangementMaster.tsx app/components/arrangement/StudioWorkspace.tsx` | `…ArrangementMaster.tsx:2`, `…StudioWorkspace.tsx:20` |
| K10 | the footer row's one-slot ternary | `grep -n "{clipLaneDrag ? (\|) : selectedClip ? (" app/components/arrangement/StudioWorkspace.tsx` | 2 lines: l.3129, l.3144 |
| K9 | the baseline browser measurements of §2 | from the loop root: read `b-round-261/probe/head.json`, `sketch.json` and `range.json` (B's stored HEAD measurement). Optional re-run against a HEAD app, using the §2 recipe: `BASE=http://127.0.0.1:5174 node b-round-261/probe/baseline.mjs <outdir> head` and `BASE=… node b-round-261/probe/sketch.mjs <outdir>` | header 35; toolbar 49/87; footer 49 → sketch 53; scroller 516/406 → 512/402; Master w 424.3; Shortcuts x 1352/1192 |
