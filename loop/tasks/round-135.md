# CURRENT TASK — Round 135: VISUAL-A V-0.3b — Transport bar, tempo row, ruler, overview, loop brace and navigation statuses in English

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 134)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). Module contract: `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract`, with the R6 clarification of round 133:
  - `strings.ts` is a leaf module (it imports nothing), with one object per area;
  - it holds plain strings plus small pure formatters, and no type assertions;
  - formatters take values that are already formatted; a branch that only picks between two texts stays in the caller;
  - existing exported names keep their names and signatures and get their values from the module.
- **Previous task:** `tasks/round-134.md` (exact copy of the round-134 `current-task.md`, sha256 `6bd19815…`). Rationale: `b-round-134.md`. Decision record: **D-29z100** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: commit `16533c1667fa3be3e5df916b5eb6ae4ff0e76d4c`** (gate 134 published; HEAD). The tree was **clean** at planning (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-134-r135-tree-sha256.txt`, **934 entries** = `git ls-files -co --exclude-standard` (947) minus the 13 grants in `b-round-134-r135-grants.txt`. `sha256sum -c --quiet` was OK at planning, run from `store/`.
- **Start hashes of the 13 grants:** `b-round-134-r135-granted-start-sha256.txt`. **Start copies:** `b-round-134/r135-granted-start/` (paths relative to `store/`; `sha256sum -c` OK there at planning). A checks both at the start. If a hash differs, A stops and reports.

## 0. Why this round (D-29z100)
- **Round 134: C PASS.** `browserVerified` = `realVerified` = true. Every grid/Snap row was exact at both viewports with unchanged effects; GEO-COUNT 0 over 95 steps; GATE132-TEMPO-CLEARED-MIXED closed in the browser; C-R122-02 no longer reproduces. Gate 134 published `16533c1` (verify OK, review 9/10). **V-0.3a is done.**
- **`tasks/round-134.md` §8 fixed this step:** after a PASS comes **V-0.3b**, re-measured first. The strings-split checkpoint (`b-round-130-checkpoint-request.md` (e)/(f)/(g)) still has no root result (checked in `gates/`, the loop folder and `store/.claude/references/`). V-0.3b proceeds on the same rationale as round 134: the import path `~/lib/arrangement/strings` is already used by frozen files, so any later split must keep it; this round adds **no new object** (see R3).
- **Not due:** the regression round (`regression-last.json` = 2026-10-24, round 122; due on or after 2026-10-27). **No Critical/High/Medium finding is open.** `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist.
- **B's re-measurement at `16533c1`** (the round-133 estimate of ~71 test lines was fragment-based and too high):
  - Source: Transport 20, TempoRow 3, Ruler 2, Overview 3, LoopBrace 5 = **33 lines**; MarkerMenu 4.
  - **Real test pins: 9 lines in 4 files** (`delete-selection-ui` l.144, 146, 214, 527; `grid-snap-ui` l.376, 380, 383; `tempo-ui` l.288; `metronome-ui` l.288), plus `markers-move-ui` l.480–482 for MarkerMenu. **0 in `e2e/`** (e2e holds no Georgian at all).
  - False matches, **not** V-0.3b (do not touch): `panels.test` l.349, `detail-panel.test` l.130 (`დასაწყისზე` in the panels refusal, V-0.4); `floating-video.test` l.129 (`გადაათრიე` in the video status, V-0.3d); `all-lane-clipboard` l.504/515 (range readout, V-0.3d).
- **Ruling D-29z100 R1 — MarkerMenu moves to V-0.3c.** `markers-move-ui` pins the menu items (l.480–482) and the MarkerRow statuses (l.318) in one file; MarkerMenu l.124 `მარკერი «…»` is the same phrase and quote style as the MarkerRow statuses; the `«» → “”` change is already V-0.3c. The marker surface moves whole (same logic as R2 of D-29z99).
- **Ruling D-29z100 R2 — the navigation statuses in StudioWorkspace join this round.** The Transport tooltips (Follow, Zoom to selection, Zoom back, Fit) and the statuses the same buttons write (StudioWorkspace l.145–147, 1174, 1191, 1211–1212, 1264, 1266–1267) are one surface. Translating only the tooltips would make every navigation click show an English tooltip and a Georgian status. These 10 lines have **0 UI pins** today, so this round also adds one new UI test file for their wiring (§3.2). The ST25 ratchet list shrinks **33 → 23** (`b-round-134/r135-studioworkspace-remaining-georgian.txt`); this edit of an existing `it` is explicitly granted.
- **Accepted mixed surface for one round (named, not a bug):** the range readout under the lanes (StudioWorkspace l.2536–2542, `… Delete = წაშლა, სიცარიელე რჩება · Ctrl+Shift+X = Cut Time`) stays Georgian until V-0.3d while the Delete button becomes English. It has its own pins in `all-lane-clipboard` and `delete-selection-ui`, and moves with the rest of the selection readout.
- **Ruling D-29z100 R3 — no new strings object.** Every text goes to the existing object of its area (reviewer Signal 3 is about object count): edit (split/delete), playback (back to start, end), loop (Transport loop titles and the brace), tempo (BPM field), metronome (toggle text), view (Follow, Zoom, Fit, ruler, overview and their statuses). The earlier ST maps grow **additively** (§3.1).
- **Folded in (owned code, low cost):** **GATE134-DOC110-STATUS** (gate-134 reviewer finding 1): doc 110 l.4, l.132, and its V-0.3b TODO line l.136 (MarkerMenu → V-0.3c).

## 1. What changes (user-visible)
**Text only.** None of these change: any handler, condition, key binding (0, Z, X, Ctrl/Cmd+E, Ctrl/Cmd+L, + / −, arrows), Follow state machine, zoom history, the loop step, the tempo/metronome logic, focus hand-off, or any class name.

### 1.1 The English map (exact text; A may not reword it — if a line seems wrong, report it and B rules)
Line numbers are at `16533c1`. `{x}` = a value the caller already formats today with `formatArrangementTime` (or `span`, as computed today).

| # | Where today | Object.key (A may rename the key, not the text) | English |
|---|---|---|---|
| TR1 | Transport l.126 `aria-label` | `studioPlaybackStrings.backToStartLabel` | `Back to start` |
| TR2 | Transport l.127 `title` | `studioPlaybackStrings.backToStartTitle` | `Back to start (0)` |
| TR3 | Transport l.135 JSX text `/ ბოლო{' '}` | `studioPlaybackStrings.projectEndPrefix` | `/ end` (the caller keeps `{' '}` and the `arrangement-project-end` span) |
| TR4 | Transport l.177 split title (range) | `studioEditStrings.splitRangeTitle` | `Split at both edges of the time selection (Ctrl/Cmd+E)` |
| TR5 | Transport l.178 split title (no range) | `studioEditStrings.splitPlayheadTitle` | `Split at the playhead (Ctrl/Cmd+E)` |
| TR6 | Transport l.72 range delete hint, one track | `studioEditStrings.deleteRangeHint` | `Delete time selection — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X` |
| TR7 | Transport l.72 range delete hint, `range.allTracks` | `studioEditStrings.deleteRangeAllTracksHint` | `Delete time selection on all tracks — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X` |
| TR8 | Transport l.192 title without range (`${deleteHint} (Delete)`) | `studioEditStrings.deleteClipTitle` | `Delete clip — leaves a gap (Delete)` |
| TR9 | Transport l.193 aria-label without range (`⌫ წაშლა — ${deleteHint}`) | `studioEditStrings.deleteClipLabel` | `⌫ Delete — the selected clip; leaves a gap` |
| TR10 | Transport l.196 button text | `studioEditStrings.deleteButton` | `⌫ Delete` |
| TR11 | Transport l.205 loop title (range) | `studioLoopStrings.selectionTitle` | `Loop the time selection (Ctrl/Cmd+L)` |
| TR12 | Transport l.205 loop title (no range) | `studioLoopStrings.toggleTitle` | `Loop on / off (Ctrl/Cmd+L)` |
| TR13 | LoopBrace l.17 `LOOP_HINT` | `studioLoopStrings.braceHint` | `Loop: make a time selection and press ↻ Loop (Ctrl+L)` |
| TR14 | LoopBrace l.18 `LOOP_KEYBOARD_HINT` | `studioLoopStrings.braceKeyboardHint` | `← → nudge · Shift + ← → length` |
| TR15 | LoopBrace l.234 brace title | `studioLoopStrings.braceTitle(span)` | `{span} · the bar moves the loop; the edges change its length` |
| TR16 | LoopBrace l.263 | `studioLoopStrings.braceStartTitle` | `Loop start` |
| TR17 | LoopBrace l.269 | `studioLoopStrings.braceEndTitle` | `Loop end` |
| TR18 | TempoRow l.227 `aria-label` | `studioTempoStrings.fieldLabel` | `Project tempo (BPM)` |
| TR19 | TempoRow l.228 `title` | `studioTempoStrings.fieldTitle` | `Project tempo — bars grid only; audio is not stretched (no time-stretch). Enter — save · Esc — cancel · empty — hide the bars` |
| TR20 | TempoRow l.245 JSX text | `studioMetronomeStrings.toggleLabel` | `Metronome` |
| NV1 | Transport l.218 Follow title (off) | `studioViewStrings.followOffTitle` | `Follow off: the view does not follow playback` |
| NV2 | Transport l.220 Follow title (paused) | `studioViewStrings.followPausedTitle` | `Follow paused by manual navigation — press Follow or Play` |
| NV3 | Transport l.221 Follow title (on) | `studioViewStrings.followOnTitle` | `Follow: the view follows the playback position` |
| NV4 | Transport l.245 zoom slider `aria-label` | `studioViewStrings.zoomSliderLabel` | `Zoom (px/s)` (closes R4 of D-29z97) |
| NV5 | Transport l.247 zoom slider `title` | `studioViewStrings.zoomSliderTitle` | `Zoom around the playhead · + / − · Ctrl+wheel` |
| NV6 | Transport l.259 `aria-label` | `studioViewStrings.zoomToSelectionLabel` | `Zoom to selection (Z)` |
| NV7 | Transport l.262 title (range) | `studioViewStrings.zoomToSelectionTitle` | `Zoom to the time selection (Z)` |
| NV8 | Transport l.262 title (no range) | `studioViewStrings.zoomToSelectionNeedsRangeTitle` | `Zoom to selection: make a time selection first (Z)` |
| NV9 | Transport l.280 zoom back title | `studioViewStrings.zoomBackTitle` | `Back to the previous zoom (X)` |
| NV10 | Transport l.281 zoom back title (empty) | `studioViewStrings.zoomBackEmptyTitle` | `Previous zoom: the history is empty — use Fit or Zoom to selection first (X)` |
| NV11 | Transport l.292 Fit title | `studioViewStrings.fitTitle` | `Fit — the entire project is visible (double-click the ruler or the overview)` |
| NV12 | Ruler l.231 playhead title | `studioViewStrings.playheadTitle` | `Playhead — drag · ←/→ = ±0.1 s` |
| NV13 | Ruler l.440 ruler title | `studioViewStrings.rulerTitle` | `Click = playhead · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit / Zoom to selection` |
| NV14 | Overview l.282 `aria-label` | `studioViewStrings.overviewLabel` | `Overview — entire project (← → = 5 s, double-click = Fit)` |
| NV15 | Overview l.288 `title` | `studioViewStrings.overviewTitle` | `Overview: click = centre here · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit` |
| NV16 | Overview l.60 `overviewValueText` body | `studioViewStrings.overviewVisibleStart({start, extent})` | `Visible start {start} / {extent}` |
| NV17 | StudioWorkspace l.145 `FOLLOW_PAUSED_MESSAGE` | `studioViewStrings.followPaused` | `Follow paused by manual navigation. Follow or Play resumes it.` |
| NV18 | StudioWorkspace l.146 `ZOOM_RANGE_MISSING_MESSAGE` | `studioViewStrings.zoomNeedsSelection` | `To zoom, make a time selection first.` |
| NV19 | StudioWorkspace l.147 `ZOOM_HISTORY_EMPTY_MESSAGE` | `studioViewStrings.zoomHistoryEmpty` | `The zoom history is empty — there is no view to go back to.` |
| NV20 | StudioWorkspace l.1174 Fit status | `studioViewStrings.fitStatus(extent)` | `Fit: the entire project is visible ({extent}). X goes back.` |
| NV21 | StudioWorkspace l.1191 zoom status | `studioViewStrings.zoomedToSelection({start, end})` | `Zoom to selection: {start} — {end}. X goes back.` |
| NV22 | StudioWorkspace l.1211 | `studioViewStrings.zoomBackMore` | `Previous view restored. X goes back one more step.` |
| NV23 | StudioWorkspace l.1212 | `studioViewStrings.zoomBackDone` | `Previous view restored.` |
| NV24 | StudioWorkspace l.1264 | `studioViewStrings.followOff` | `Follow off: the view does not move by itself.` |
| NV25 | StudioWorkspace l.1266 | `studioViewStrings.followResumed` | `Follow is following the playback position again.` |
| NV26 | StudioWorkspace l.1267 | `studioViewStrings.followOn` | `Follow on: the view follows the playback position during playback.` |

- **Caller shapes (the only non-literal edits allowed):**
  - Transport l.71–73: `range ? (range.allTracks ? <TR7> : <TR6>) : null` (the same condition; two full sentences instead of a template fragment). The local `deleteHint` const (l.74) may be removed; title becomes `rangeDeleteHint ?? <TR8>`, aria-label `rangeDeleteHint ?? <TR9>`.
  - The other ternaries keep their conditions and order and only swap the picked literals.
  - JSX text children (`/ ბოლო`, `⌫ წაშლა`, `მეტრონომი`) become `{object.key}` expressions. This is allowed in AN-REVIEW.
  - Local names stay and take module values: `LOOP_HINT`, `LOOP_KEYBOARD_HINT`, `FOLLOW_PAUSED_MESSAGE`, `ZOOM_RANGE_MISSING_MESSAGE`, `ZOOM_HISTORY_EMPTY_MESSAGE`, `overviewValueText(visibleStart, extent)` (returns `overviewVisibleStart({ start: formatArrangementTime(visibleStart), extent: formatArrangementTime(extent) })`). LoopBrace l.233 `aria-label={`${span} · ${LOOP_KEYBOARD_HINT}`}` is unchanged.
- **Facts that must survive (a dropped one is Medium):** TR6/TR7: the gap stays, the keys Delete/Backspace, Cut Time closes the gap on Ctrl+Shift+X, and "on all tracks" only when all tracks are selected (user decision 2026-10-11); TR8/TR9: clip delete leaves a gap; TR4/TR5 both edges vs the playhead and Ctrl/Cmd+E; TR11/TR12 and TR13 the key; TR14 both key hints; TR15 bar moves, edges change length; TR19 grid only / not stretched / Enter / Esc / empty hides; NV1–NV3 three different states; NV10 the remedy; NV11 both double-click places; NV14 5 s step and double-click; NV17 both ways back; NV20/NV21 the extent or the two times and "X goes back"; NV22 vs NV23 "one more step" only when history remains.
- **Imports:** the five components and StudioWorkspace import from `~/lib/arrangement/strings` (StudioWorkspace adds names to its existing l.83 import). `strings.ts` still imports nothing.
- **Unchanged this round** (they stay Georgian; C subtracts them by name):
  - (a) the 23 StudioWorkspace lines in `b-round-134/r135-studioworkspace-remaining-georgian.txt` (lane Shift hints, video/library panel statuses, the aria-label selector l.325, group rename statuses, Envelope status/toggle, `· სამუშაო სივრცე`, waveform-zoom label/title, the range/selection readout l.2536–2557) → V-0.3d;
  - (b) MarkerMenu and MarkerRow → V-0.3c;
  - (c) lanes, clips, detail panel, track names (V-0.4), library and video dock (V-0.5).
- **Glossary additions** (doc 111 and the backlog glossary): დასაწყისზე დაბრუნება = Back to start; ბოლო = end; ორმაგი click = double-click; გადახვევა = scroll; ცენტრში = centre here; მიმოხილვა = Overview (Live 12 §6.1); Zoom მონიშნულზე = Zoom to selection (Live "Zoom to Arrangement Time Selection"); წინა Zoom = previous zoom (Live "Zoom Back"); Follow შეჩერდა = Follow paused (Live 12 §6.2); ხილვადი დასაწყისი = Visible start; დროის ამოჭრა = Cut Time (Live §42 "Cut Time"); Loop-ის დასაწყისი / დასასრული = Loop start / Loop end; პროექტის ტემპი = Project tempo; გადაადგილება (brace keys) = nudge (d29z95).

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/strings.ts` | Add the §1.1 keys to `studioPlaybackStrings`, `studioEditStrings`, `studioLoopStrings`, `studioTempoStrings`, `studioMetronomeStrings`, `studioViewStrings`. No new object; existing keys unchanged; still no import |
| `app/components/arrangement/ArrangementTransport.tsx` | **Only:** one import, l.71–74 (caller shape §1.1), l.126, 127, 135, 177–178, 192–193, 196, 205, 218–221, 245, 247, 259, 262, 280–281, 292 |
| `app/components/arrangement/ArrangementTempoRow.tsx` | **Only:** the import (a new line, or names added to an existing one), l.227, 228, 245 |
| `app/components/arrangement/ArrangementRuler.tsx` | **Only:** one import, l.231, 440 |
| `app/components/arrangement/ArrangementOverview.tsx` | **Only:** one import, l.59–61 (`overviewValueText` body), l.282, 288 |
| `app/components/arrangement/ArrangementLoopBrace.tsx` | **Only:** one import, l.17, 18, 234, 263, 269 |
| `app/components/arrangement/StudioWorkspace.tsx` | **Only:** names added to the l.83 import, l.145, 146, 147, 1174, 1191 (with its 1190–1192 call), 1211–1212, 1264, 1266–1267. The other **23** Georgian lines are byte-identical. Biome may re-wrap the three sites l.1190–1192, l.1210–1213 and l.1263–1268 (and the Transport ternaries); the condition and pick order must be unchanged — this is not a deviation |
| `app/lib/arrangement/__tests__/strings.test.ts` | Additive updates to the expected maps/key lists/formatter samples used by ST6/ST8 (edit), ST10/ST12 (playback, loop), ST17/ST19 (tempo, metronome, view); **ST25**: list → the 23 lines of `b-round-134/r135-studioworkspace-remaining-georgian.txt` as literals, `toHaveLength(23)`, title unchanged; new `describe('V-0.3b transport and navigation strings')` with ST26–ST27 (§3.1). No other ST changes |
| `app/lib/arrangement/__tests__/delete-selection-ui.test.tsx` | l.144, 146 (the two constants' text lines), l.214, l.527 → hand-written English |
| `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | l.376 → `'Back to start'`; l.380 `toContain('Delete')`; l.383 → `'Zoom to selection (Z)'` |
| `app/lib/arrangement/__tests__/tempo-ui.test.tsx` | **Only l.288** → `'Project tempo (BPM)'` |
| `app/lib/arrangement/__tests__/metronome-ui.test.tsx` | **Only l.288** → `'Metronome'` |
| **new** `app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx` | §3.2 |
| `docs/implementation/2026/quarter-IV/110-studio-v0-grid-snap-strings.md` | l.4 → `**სტატუსი:** Completed (A-ის შემოწმებები მწვანეა რაუნდ 134-ში; C round 134 — PASS, browserVerified; gate 134 — 16533c1)`. l.132 → `- ბრაუზერის შემოწმება (GRID-SEC, GRID-MUSICAL, GRID-TRIPLET, GRID-HIDDEN, SNAP, MENU, GEO-COUNT, LAYOUT): C round 134 — PASS, browserVerified (c-round-134.json).` l.136 → the same TODO with MarkerMenu moved: `- V-0.3b: Transport, TempoRow, Ruler, Overview, LoopBrace და StudioWorkspace-ის ნავიგაციის სტატუსები. V-0.3c: MarkerRow და MarkerMenu. V-0.3d: StudioWorkspace-ის დარჩენილი 23 ხაზი და waveform-zoom.ts (R3), მათ შორის GATE133-LANE-HINT-MIXED და GATE133-GROUP-RENAME.` Nothing else |
| **new** `docs/implementation/2026/quarter-IV/111-studio-v0-transport-navigation-strings.md` | Sections from TEMPLATE.md, in Georgian: the TR/NV map; rulings R1 (MarkerMenu → V-0.3c), R2 (navigation statuses join; ratchet 33 → 23; the accepted range-readout mix), R3 (no new object); the re-measurement; facts that must survive; glossary additions; tests and mutations. Status Completed only after §4 is green, naming C round 135 as still to come |

- **Test rules (as in rounds 129–134):** every replaced pin is a **hand-written English literal** with the same matcher (GATE130-S3); where a file has a shared constant (`SINGLE_LANE_DELETE_HINT`, `ALL_LANE_DELETE_HINT`), change it once. No `it` is added, removed or renamed outside the new `describe` in `strings.test.ts` and the new test file. Line numbers are baseline positions; find each line by its text.
- **Pre-edit grep (A records it):** for each TR/NV row grep the old Georgian text in `app/**` and `e2e/**`; also grep test files for regex or partial forms (`name: /`, `getByTitle(`, `getByLabelText(`, `toContain(`) with Georgian next to `Follow|Zoom|Fit|Loop|Split|Delete|Playhead|Overview`. B found exactly the pins in §2 and the false matches in §0. Another pin of a TR/NV text is a **stop-rule** case.
- **Stop rule:** stop and report (B rules) if a test outside §2 asserts an old text or turns red; a change needs a frozen file or a non-string line beyond §1.1 caller shapes; an import cycle or `undefined` label appears; the new UI test cannot reach a state (report which; do not fake it).
- **Checkpoint rule:** if your context grows large, stop at a clean point (one file fully edited and its vitest green) and write `a-round-135-checkpoint.md` (files done with sha256, files left, next step). Say STATUS: RESTART-NEEDED. Never revert finished files.
- **Expected end state:** `git status` shows 13 ` M` + 2 `??` (the new test file and doc 111) and no other path. The frozen list is OK at the start and at the end. Report the end sha256 of the 15 paths.
- **Protected (unchanged; `git diff 16533c1` on them is empty):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, and everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`.
- **Forbidden actions:** commit, push, stash, checkout, reset, deploy, dev-server restart, `npm install`, `npm run check:fix` / any `--write`, `npm run format`.
- **Edit rule (C-R120-01):** lasting edits only with Edit/Write. Shell writes only for temporary mutations, restored and checked by sha256. List every shell write.
- **Before editing, read:** `.claude/primitives-map.json`; `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md` (components change); `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `.claude/prompts/new-test.md` (new test file); `GEORGIAN_DOCS.md`, `docs/implementation/TEMPLATE.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` (no new `as const`), semicolons, no code comments.

## 3. A — tests and mutations
### 3.1 `strings.test.ts` (25 → 27 `it`s)
- **ST6/ST8, ST10/ST12, ST17/ST19 data:** add each new plain key with its exact §1.1 literal to the matching expected map / key list, and a sample for each new formatter (`braceTitle`, `overviewVisibleStart`, `fitStatus`, `zoomedToSelection`). Additions only; no existing entry changes.
- **ST25:** the ratchet list = the 23 lines; `toHaveLength(23)`.
- **ST26:** the four new formatters return the exact English for Latin inputs (`toBe`): `braceTitle('00:01.000 — 00:03.000')`, `overviewVisibleStart({ start: '00:02.000', extent: '00:30.000' })`, `fitStatus('00:30.000')`, `zoomedToSelection({ start: '00:01.000', end: '00:03.000' })`. Nothing else: the local consts (`LOOP_HINT`, `FOLLOW_PAUSED_MESSAGE`, …) are not exported and are covered through the DOM by NS1–NS4; do not export them for the test.
- **ST27:** per-file scan (comments stripped): `ArrangementTransport.tsx`, `ArrangementTempoRow.tsx`, `ArrangementRuler.tsx`, `ArrangementOverview.tsx`, `ArrangementLoopBrace.tsx` contain no Georgian codepoint (widened pattern).

### 3.2 New `navigation-strings-ui.test.tsx` (renders `StudioWorkspace` in jsdom, following `self-disabling-focus.test.tsx`)
At least these behavioural assertions, each a hand-written English literal (`toBe`), read from the real DOM title / aria-label / text and the live status region:
- **NS1 (no range):** back-to-start label and title; the `/ end` prefix text; split title `Split at the playhead (Ctrl/Cmd+E)`; with a selected clip the delete title, aria-label and text; loop title `Loop on / off (Ctrl/Cmd+L)` (with a loop present); Follow title for the default `on`; zoom slider label and title; Zoom to selection label and the needs-range title; zoom back empty title; Fit title; tempo field label and title; metronome text.
- **NS2 (range):** a one-track time range → split range title, `deleteRangeHint` as title and aria-label, loop selection title, zoom-to-selection title; an all-tracks range → `deleteRangeAllTracksHint`.
- **NS3 (statuses):** Z with no range → NV18; X with empty history → NV19; Fit → NV20 with the extent as `formatArrangementTime` prints it; Z with a range → NV21; then X → NV22 or NV23 exactly as the history depth dictates, and the zoom-back title switches between NV9 and NV10; Follow click → NV24 and title NV1, click again → NV26 and title NV3. The paused state (NV2/NV17/NV25) only if reachable in jsdom; if not, report it (C covers it in the browser).
- **NS4:** ruler title and playhead title; overview label, title and `aria-valuetext` (NV16 with the formatted times); loop brace: no loop → TR13 text; with a loop → aria-label `{span} · ← → nudge · Shift + ← → length`, title TR15, edge titles TR16/TR17.

### 3.3 Forward rule (GATE130-S3)
After §2/§3.2 every new key that a UI reaches has a hand-written UI literal (delete hints: `delete-selection-ui` + NS2; labels: `grid-snap-ui`, `tempo-ui`, `metronome-ui`; the rest: NS1–NS4). If one does not, A reports it.

### 3.4 Mutations (each turns the named tests red; restore and check by sha256)
| Mutation | Change | Must turn red |
|---|---|---|
| **m30** | `deleteRangeAllTracksHint` drops ` on all tracks` | ST6, `delete-selection-ui` (an `ALL_LANE_DELETE_HINT` `it`), NS2 |
| **m31** | Transport swaps the `range.allTracks` picks | `delete-selection-ui`, NS2 |
| **m32** | StudioWorkspace swaps the Follow `next === 'off'` status picks | NS3 |
| **m33** | `fitStatus` drops `({extent})` | ST26, NS3 |
| **m34** | Transport swaps the Zoom-to-selection title picks | NS1 or NS2 |
| **m35** | StudioWorkspace `FOLLOW_PAUSED_MESSAGE` back to the Georgian | ST25 (ratchet 24 ≠ 23) |
| **m36** | TempoRow metronome text back to `მეტრონომი` | ST27, `metronome-ui` (l.288 `it`) |

## 4. A — checks (speed rules)
- `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the 13 changed or new code/test files.
- `npx vitest run` on, all green; name the exact list and counts (C runs the same list):
  - **granted/new:** `strings`, `delete-selection-ui`, `grid-snap-ui`, `tempo-ui`, `metronome-ui`, `navigation-strings-ui`;
  - **neighbours:** `self-disabling-focus`, `transport`, `edge-navigation`, `loop`, `grid-snap-loop-drop`, `all-lane-clipboard`, `markers-move-ui`, `tempo`, `tempo-window-ui`, `waveform-zoom`, `render-budget`, `status-announcement-ui`, `grid-snap-menu`, `grid-snap-keys`, `floating-video`.
  If a name does not exist, report it and do not invent one.
- No full suite and no `npm run verify` (the gate runs them). **code-reviewer required** (15 paths); pass its Architecture note to B.
- **Report `a-round-135.md`:** start HEAD, frozen OK, 13 start hashes; the pre-edit grep; per-file `diff -u` vs `b-round-134/r135-granted-start/` saved as `a-round-135/granted.diff`; `it` counts before/after per file; m30–m36; typecheck/lint; reviewer verdict and Architecture note; every shell write; end `git status`, frozen OK, 15 end hashes; deviations.

## 5. C — rows
Real Playwright Chromium, a fresh context per session, **1440×900 and 1280×720**, `http://127.0.0.1:5173/studio-lab`. Reuse `c-round-134/tools/` (status reading, MutationObserver, GEO count, layout compare) and `c-round-122/tools/` for transport/zoom/loop steps. **Find controls by `data-testid`, role and position, never by Georgian text** (the labels change). State the Snap state (default **off**) and every precondition in each run record.
- **Invalid runs:** ENV-FIRST-LOAD — discard one crashed first load and record it under `invalidRuns`. At most 2 replacement attempts per row, only for environment-invalid runs. A unique evidence file per run; open every screenshot with Read and describe it.

| ID | Action | Expected (PASS) |
|---|---|---|
| **T135-TARGETED** | A's exact §4 vitest list | All green; counts equal A's |
| **SOURCE-SCOPE** | `git status`; `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-134-r135-tree-sha256.txt` (from `store/`); protected `git diff 16533c1` | 13 ` M` + 2 `??`; frozen OK; protected unchanged; no source change during C's phase |
| **AN-REVIEW** | `diff -u` of each grant vs `b-round-134/r135-granted-start/`; read the new test and doc 111 | `strings.ts`: only added keys in the six existing objects, no new object, no import. Components: only the import and the §2 lines; the §1.1 caller shapes; JSX text → `{object.key}` allowed. StudioWorkspace: only the import names and the 10 lines; the other 23 Georgian lines byte-identical to the list file. Tests: Georgian → hand-written English with the same matcher, additive ST map entries, the ST25 list, ST26–ST27, the new file; no `skip`/`only`/`todo`. Meaning check of TR1–NV26 side by side with the Georgian (the §1.1 facts list). Every shell write listed |
| **TRANSPORT** (both) | Fresh project. Read title/aria-label/text of: back to start, the `/ end` prefix, Split, Delete, Loop, Follow, zoom slider, Zoom to selection, Zoom back, Fit — (a) nothing selected, (b) a clip selected, (c) a one-track time range, (d) an all-tracks range (Ctrl+Shift+L) | Exactly TR1–TR12 and NV1/NV3–NV11 for the state. **Effects as before:** Delete on the clip leaves a gap; Delete on the range leaves a gap on that track (all tracks for (d)); Split on the range splits at both edges; Undo restores each. Back to start puts the playhead at 0 |
| **FOLLOW** (both) | Fresh project, Follow `on` (default). Play; scroll the lanes horizontally by hand (→ paused); read title + status; then click Follow three times; stop. Pause happens **only during playback** (`pauseFollowForNavigation` checks `isPlaying`); a Fit/Z/X press during playback also pauses, but its own status then replaces NV17 — the MutationObserver must record both | Ordered sequence: paused — title NV2, status NV17 → click 1: on, status NV25, title NV3 → click 2: off, status NV24, title NV1 → click 3: on, status NV26, title NV3 (toggle rule `previous === 'on' ? 'off' : 'on'`). **Effect:** with Follow on the view follows the playhead; off it does not |
| **ZOOM-FIT** (both) | Z with no range; X with empty history; Fit; make a time range; Z; X; X | NV18; NV19; NV20 with the project extent; NV21 with the range times; NV22 then NV23 (or as the depth gives; the zoom-back title switches NV9 ↔ NV10 when the history empties). **Effects:** Fit shows the whole project; Z fits the range to the viewport; X restores the previous view each step |
| **RULER-OVERVIEW** (both) | Read the ruler and playhead titles; overview aria-label, title and `aria-valuetext`; scroll and read `aria-valuetext` again; double-click the ruler with no selection | NV12, NV13, NV14, NV15; `aria-valuetext` = `Visible start {start} / {extent}` and its start changes with the scroll; the double-click does Fit as before |
| **LOOP** (both) | No loop: read the brace hint. Make a range, Ctrl+L; read the brace aria-label, title, edge titles; focus the brace, ArrowRight, Shift+ArrowRight | TR13; then `{span} · ← → nudge · Shift + ← → length`, TR15, `Loop start`, `Loop end`; the Transport Loop title is TR11 with a range, TR12 without. **Effects:** ArrowRight moves the loop by the same step as before (0.1 s with Snap off), Shift+ArrowRight changes its length; the loop status texts are the already-English ones |
| **TEMPO** (both) | Read the BPM field aria-label/title and the metronome button text with no BPM; enter BPM 120; toggle the metronome | TR18, TR19, `Metronome`; the metronome toggles as before with the English statuses of V-0.2c2. **Grid tempo is not audio stretch:** a clip keeps its start and width after BPM 120 |
| **GEO-COUNT** (both) | After each row step | Georgian count = 0 in: the transport bar (titles, aria-labels, button texts), the tempo row field and metronome text, the ruler and playhead titles, the overview label/title/valuetext, the loop brace hint/aria-label/title/edges, and the status region for every NV status. Subtract by name and list: the 23 StudioWorkspace lines when shown (e.g. the range readout `… Delete = წაშლა …`, the Envelope toggle, the waveform-zoom label), the load-time demo-ready status, frozen clip/lane statuses (V-0.4), marker texts (V-0.3c), track names, and any other item C finds |
| **LAYOUT** (both) | S0/S1 boxes vs `c-round-125/out/bbox-baseline-*.json`; transport bar and tempo row `scrollWidth` vs `clientWidth` with no selection and with a range | Every box outside the changed text nodes within 1 px, **except** (RV-1 V-0 text-width exception, stated explicitly): a control whose own text changed may change width, and its right-hand neighbours in the same flex row may shift x by that width delta with unchanged size. A new overflow (`scrollWidth > clientWidth`) or a wrap in the transport bar or tempo row is a **Low**; record both viewports |
| **REG-134** (1440, short) | G | `Snap on — grid 1 s (G)` |
| **G135-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` | Workspace + demo badge; the product route shows "Sign in required", no workspace, 0 `audio[src]`; the token API **401**; fake-Bearer 403 **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 requests to `/api/studio-token` (outside G135-3), `/api/recording-*`, `/api/download` or the R2 host; 0 `Authorization` headers; 0 hydration errors; 0 `pageerror` (the known cloud cart noise is not reported) |

- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:** **Medium:** any behaviour change (Delete/Split/Loop/Follow/Zoom/Fit/overview/brace effect, keys, focus); a wrong or fact-dropping message (§1.1 facts list); a weakened, removed or skipped test; a non-string hunk beyond the §1.1 caller shapes; any change to the 23 remaining StudioWorkspace lines. **Low:** wording or style; a new overflow or wrap caused by the English text.

## 6. Ableton source
Sources (read as data): Live 12 Reference Manual, Arrangement View, `https://www.ableton.com/en/live-manual/12/arrangement-view/`, fetched by B on 2026-10-24 (`b-round-133/live/arrangement-view.html` sha256 `be767e38…`, text `arrangement-view.txt` sha256 `2b9a3007…`); shortcut capture `b-round-71/ableton-shortcuts-20261021.txt` (sha256 `2097004e…`), §42.

| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Follow and its pause | Manual §6.2 "Navigation and Zooming" | "turn on the Follow switch … Follow will pause if you make an edit or scroll the view horizontally … or if you click on the beat-time ruler. Follow will start again once you stop or restart playback, or click in the Arrangement or clip scrub area" | Same three states (on / paused / off). CZABA resumes with Follow or Play (subset of Live's ways) — deliberate difference. Live shortcut Ctrl+Shift+F (§42); CZABA has no key for it | FOLLOW |
| Zoom to selection / back | §6.2: "press Z or use the Zoom to Arrangement Time Selection command … revert to the previous zoom state by pressing the X key … X can be pressed multiple times"; §42 "Zoom to Arrangement Time Selection Z", "Zoom Back … X" | Z and X, repeatable | Same keys; "Zoom to selection" is a shortened Live name | ZOOM-FIT |
| Ruler/overview drag and double-click | §6.1: "drag left or right to scroll … drag vertically to zoom. Double-clicking in the beat-time ruler zooms in to the current selection. If nothing is selected … zooms out to show the entire Arrangement" | Confirmed | Same gestures. **"Fit" is a CZABA label** (Live names no command "Fit"); unconfirmed as a Live name | RULER-OVERVIEW |
| Split | §42 "Split Clip at Selection Ctrl E" | Confirmed | Same key; CZABA splits at the playhead without a selection | TRANSPORT |
| Delete vs Cut Time | §42 "Cut Time Ctrl Shift X", "Delete Time Ctrl Shift Delete"; manual Cut Time text | Live Delete Time closes the gap | **User decision 2026-10-11:** Delete/Backspace always leaves a gap; only Ctrl+Shift+X cuts time — deliberate difference | TRANSPORT |
| Loop brace arrows | §6.x loop brace: "arrow keys nudge the loop brace … based on the current grid settings" | Grid-based nudge | CZABA nudges by a fixed 0.1 s with Snap off (snap target with Snap on) — deliberate difference; "nudge" wording follows the manual | LOOP |
| BPM, metronome | — | Not re-checked this round | V-0.2c2 wording reused | TEMPO |

C rates "CZABA requirement met" and "Ableton correspondence" separately. Only text changes; no new Live behaviour is claimed.

## 7. Evidence and reporting
- C writes `c-round-135.md` and `c-round-135.json` as it goes: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` (with the subtracted items), `invalidRuns`, `notesForB`. Evidence under `c-round-135/{tools,out,shots}/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`; gestures Chromium truly cannot reach go under `inconclusive` with the reason. C makes no `store/` writes.

## 8. Outcome, fixed in advance (B at round 136 planning)
| Condition | Round 136 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.3b fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.3b → `c_pass`, then `c_pass_published` after the gate. Round 136 = **V-0.3c** (MarkerRow + MarkerMenu), re-measured first and split if larger than one round. If root's strings-split checkpoint result exists, B applies it first (an approved split is its own bounded round with behaviour-preserving tests) |

At every planning B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **C harnesses** that find transport buttons by `'⌫ წაშლა'`, `'Zoom მონიშნულზე (Z)'`, `'დასაწყისზე დაბრუნება'` or `'მეტრონომი'` (e.g. `c-round-122/tools/`) will not match; use test ids/roles.
- **Width:** `⌫ Delete` vs `⌫ წაშლა`, `Metronome` vs `მეტრონომი`, `/ end` vs `/ ბოლო` change widths in flex rows (RV-1 exception). The tempo row lives in the fixed-width header (`ARRANGEMENT_HEADER_WIDTH_PX`): watch for overflow at 1280.
- **Label-in-name (WCAG 2.5.3):** the word `Delete` of the visible text is contained in the Delete button's aria-label in every state (TR6/TR7/TR9). With a range the aria-label has no `⌫` glyph — the same shape as before (pre-existing, not a new finding).
- **Mixed for one round (accepted):** the Georgian range readout next to the English Delete button (V-0.3d), and MarkerRow/MarkerMenu (V-0.3c).
- **StudioWorkspace** (2600+ lines): only 10 literal lines and import names change; ST25 and AN-REVIEW protect the other 23.
- **Architecture:** the strings-split checkpoint (addenda e–g) is still unanswered; it is non-blocking (§0). The gate-134 reviewer suggests running it after V-0.3d.
- **Commit readiness:** after C PASS, root may publish V-0.3b as an interim unit.
