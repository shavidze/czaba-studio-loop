# Round 235: SABA-B-11a stage 2 — the bars ruler becomes interactive; its top strip starts playback from the clicked point

**Planned by:** B, at the round 234 → 235 planning, 2026-10-28. **Decisions:** D-29z327…D-29z332.

**Type:** feature stage (Saba-approved). Final stage of `SABA-B-9-10-11-TRANSPORT-GRID` → `SABA-B-11a` (stage 2 of 2). Stage 1 (asset-BPM tempo seed) passed C in round 234 and was published as `c95b8a8`.

**Read first:** `lessons.md` in full (57 lines).
- Directly relevant: L23 (pre-check done, §0.2), L29 (B ran every recipe in Chromium, §0.3), L31, L39 (row C-BUDGET), L40, L43–L45, and L28 (multi-stage: grant 8).
- For A: L11/L32/L33 (STOP), L12 (no class selectors), L26/L28 (docs 182 and 183).

**Not this round:**
- the Insert Marker model, where a lane click during playback moves only the marker (Saba decision 1): SABA-B-10a. Until 10a, a **lower-zone** bars-ruler click does exactly what a seconds-ruler click does today (it moves the single playhead position; during playback that jumps playback);
- changing the seconds ruler's click (§3, Saba question `SABA-Q-TIME-RULER-ROLE`);
- hold-to-loop in the scrub strip and right-click → Add Locator (Saba questions, §3);
- adaptive grid and keys 4/5 (SABA-B-11b); transport layout (SABA-B-9); empty-lane time selection and F1 (SABA-B-11c);
- **A-R234-REVIEW-M1** (lost seed status at mount). It is ruled and scheduled as round 236 with its own `ArrangementContext.tsx` grant (D-29z329). Do not touch the seed code;
- the purchased route `app/routes/studio.$productId.tsx` (protected; SRW-21 `deferred_user`); the clip envelope taper (SABA-B-7, `awaiting_user`).

## 0. Baseline and scope

**Baseline:** HEAD = `c95b8a8966bfedef7c1d3793e23391be512a831e` (gate 234 `published`, its `commit`). At the start, `git status --short --untracked-files=all` must be empty. B's check is in `b-round-234/git-status-at-planning.txt`: HEAD `c95b8a8`, 0 changed paths.
- If HEAD differs or any path is dirty at the start: **STOP** (L11). One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-234-r235-tree-sha256.txt` lists **1,087** tracked files: every tracked file except the 8 grants and the 4 root files. From `store/`, `sha256sum -c --quiet` gives rc 0 at planning. The frozen set includes:
- every protected auth and purchase file: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`;
- `.claude/**`, `CLAUDE.md`, every config file;
- `ArrangementContext.tsx`, `grid.ts`, `tempo.ts`, `tempo-seed.ts`, `view.ts`, `ArrangementClip.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementTransport.tsx`;
- every other test, including `tempo-ui.test.tsx`, `tempo-window-ui.test.tsx`, `grid-musical-ui.test.tsx`, `grid-triplet-ui.test.tsx`, `markers-ui.test.tsx`, `navigation-strings-ui.test.tsx` and `shortcut-sheet-ui.test.tsx`.

**Root-owned, must equal HEAD:** `b-round-234-r235-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`); start hashes in `b-round-234-r235-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementRuler.tsx` | §2.1: the ruler's navigation gesture (pointer down/move/up/cancel/lost-capture, double-click guard, the `RulerNavigation` type, `RULER_DOUBLE_CLICK_AFTER_DRAG_MS`) moves into the new hook N1. **Behaviour unchanged.** The playhead handle and the ticks are untouched. |
| 2 | `app/components/arrangement/ArrangementTempoRow.tsx` | §2.2: the bars ruler takes the hook and the scrub strip when a tempo exists; one new prop `rulerGestures`. Nothing else in the tempo field or metronome. |
| 3 | `app/components/arrangement/StudioWorkspace.tsx` | §2.3 only: `playFromRuler`, the memoised `barsRulerGestures`, the `rulerGestures` prop on `<ArrangementTempoRow>`, and the type import. |
| 4 | `app/lib/arrangement/strings.ts` | §2.4: one plain string, `studioTempoStrings.scrubStripTitle`. |
| 5 | `app/lib/arrangement/shortcuts.ts` | §2.5: one new row `play-from-point` in the Transport group, after `back-to-start`. |
| 6 | `app/lib/arrangement/__tests__/strings.test.ts` | §2.6: `'scrubStripTitle'` in the key list and its exact literal. Existing assertions unchanged. |
| 7 | `app/lib/arrangement/__tests__/shortcuts.test.ts` | §2.6: `'play-from-point'` in `EXPECTED_ROW_ORDER` after `'back-to-start'`, plus one keys assertion. Existing assertions unchanged. |
| 8 | `docs/implementation/2026/quarter-IV/182-saba-b-11a-tempo-seed.md` | **l.4 only**, to exactly `**სტატუსი:** Completed (C round 235 PASS)` (L28, final stage of a multi-stage feature). |
| N1 | `app/hooks/useRulerNavigation.ts` | New hook (§2.1). It lives in `app/hooks/`, as `.claude/prompts/new-hook.md` says, beside the Studio's `useRelativeFaderDrag.ts`. Import it directly (`~/hooks/useRulerNavigation`), as the arrangement components import `useRelativeFaderDrag`. Do **not** add it to `app/hooks/index.ts`, which is frozen and does not export `useRelativeFaderDrag` either. B's scratch sketch put it under `app/components/arrangement/`; this path is the grant. |
| N2 | `app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx` | New UI tests BR1–BR10 (with BR4b) and mutants MU-B, MU-C (§2.6). |
| N3 | `docs/implementation/2026/quarter-IV/183-saba-b-11a-bars-ruler.md` | New implementation doc (§2.7). |

The grants' start hashes are in `b-round-234-r235-granted-start-sha256.txt`; lists in `b-round-234-r235-grants.txt` and `b-round-234-r235-new-files.txt`. None of the 3 new files exists at HEAD. Before writing N1, read `.claude/prompts/new-hook.md` and the primitives the hook needs (`AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`).

### 0.2 B's collision pre-check (L23, done)
B applied a sketch of §2 on a scratch copy (`git archive HEAD` → `/tmp/b234-scratch`, `node_modules` symlinked), outside the repo and the loop folder. Diff: `b-round-234/precheck-scratch.diff`.
- **Static:** `tsc --noEmit` rc 0; `npx biome check` on the 6 touched source files is clean after `--write` (formatting only).
- **Covering set:** `b-round-234/covering-files.txt` holds every test file that mentions `StudioWorkspace`, `ArrangementRuler`, `ArrangementTempoRow`, `studioTempoStrings`, `studioViewStrings`, `shortcuts'`, `arrangement-ruler`, `arrangement-bars-ruler`, `studio-lab-demo` or `tempo` (107 files).
  - Result: **105 files green, 2 red, 1,611 of 1,613 tests passed** (`b-round-234/precheck-covering.log`, 137 s).
  - **After moving the hook** to `app/hooks/useRulerNavigation.ts` (advisor review): `tsc` rc 0, Biome clean, and 6 key suites 83/83 green (`b-round-234/precheck-after-move.log`). The diff above is regenerated with the final path.
  - The 2 reds are the granted pins: `strings.test.ts` ST17 (key list of `studioTempoStrings`) and `shortcuts.test.ts` SC1 (`EXPECTED_ROW_ORDER`). Grants 6 and 7 cover them.
  - Notable greens: `tempo-window-ui.test.tsx` BU7 (an empty bars ruler has `textContent === ''`) and BU8 (playhead frames re-render neither `ArrangementTempoRow` nor `ArrangementBarsRulerInner`); `grid-musical-ui` GU4 and `grid-triplet-ui` TU4 (they click the **seconds** ruler with a tempo, unchanged here); `markers-ui` MU8d; `navigation-strings-ui` (pins `rulerTitle`).
- **Keep these true:** do not rename `ArrangementBarsRulerInner` (BU8 counts renders by that name); render no child inside `arrangement-bars-ruler` when there is no tempo (BU7); keep `rulerGestures` referentially stable across playhead frames (memo with stable callbacks, §2.3).

### 0.3 Render conditions, recipes, timeouts and testids (L29, L31, L40)
**Recipes (L29).** B ran all of these in Chromium, at the baseline on `:5173` (`b-round-234/probe/out-baseline/baseline.json`) and on the scratch build on `:5174` (`b-round-234/probe/out-scratch/recipes.json`, both viewports, 0 page errors).
- **Seed a tempo:** click `[data-source-id="demo-stem-pulse"]`, then the enabled button whose text starts with `Add`. Result: tempo 120, `1/4`, Snap on (round 234). Pixels: 40 px/s at the default zoom, so x = `bars.x + t × 40`.
- **Geometry (baseline):** `arrangement-ruler` (seconds) is 28 px high at y 191 (1440×900) / 229 (1280×720). `arrangement-bars-ruler` is 20 px high directly under it, at y 219 / 257. `arrangement-marker-row` is under that. At the baseline, a click anywhere on the bars ruler changes nothing (playhead stays 0); a seconds-ruler click at 3.175 s lands on 3.000.
- **Scrub strip click:** `page.mouse.click(bars.x + t × 40, bars.y + 4)`. Scratch: stopped at t = 4.1 → playing, from 4.000 (the playhead read 4.571 after 600 ms). Playing at t = 8.2 → still playing, jumped to 8.000 (8.237 after 300 ms).
- **Lower-zone click:** `bars.y + 15`. Scratch: t = 6.3 → playhead `6.5` (snap 0.5 s), not playing. With Alt held → `6.3`.
- **Drag:** press at `bars.y + 15`, move 200 px left in 10 steps, release. Scratch: `arrangement-timeline-scroller.scrollLeft` 0 → 200; the playhead does not change; nothing plays.
- **Double-click** on the lower zone → status `Fit: the entire project is visible (00:16.000). X goes back.`
- **Past the end:** scroll by 400 px, then click the strip at t = 20 → not playing; status `Playhead (00:20.000) is past the end of the project (00:16.000) — there is nothing to play here. Home returns to 0.`
- **Empty project with a typed tempo (90):** a strip click → status `Nothing to play — add a clip from the library first.`
- **No tempo (Add `demo-soft-impact`):** a strip-height click changes nothing; `arrangement-bars-scrub-strip` is absent; the bars ruler has no `title` and cursor `auto`.
- **Play state signal:** the transport button's `aria-label` is `Pause` while playing and `Play` when stopped (`ArrangementTransport.tsx` l.134). The position signal is `[data-testid="arrangement-playhead-handle"]` `aria-valuenow` (always rendered).

**Timeouts (L31).** Gate 234: `strings.test.ts` 110 ms, `shortcuts.test.ts` 14 ms, `tempo-window-ui` 2.35 s, `tempo-ui` 2.27 s, `grid-snap-position` 2.67 s, `navigation-strings-ui` 3.26 s, none near its limit. N2 declares `{ timeout: 15_000 }` on its describe, as `tempo-ui.test.tsx` does.

**Testids (L40).** `arrangement-bars-ruler` gains attributes (`title`, classes) and, only with a tempo, one child `arrangement-bars-scrub-strip`. Its tests (`tempo-ui`, `tempo-window-ui`, `tempo-seed-ui`) are in the covering set and passed on the sketch. `arrangement-ruler` keeps its markup (only its handlers come from the hook).

## 1. Why
Saba's decisions for SABA-B-11 (2026-10-28):
- **Decision 2:** "A click on the top strip of the bars ruler starts playback from that point, as Live's scrub area does."
- **Decision 3:** the min:sec ruler always stays visible; with a BPM the grid is musical.
- The approved review `transport-grid-review.md` §4.3 lists "the bars ruler becomes interactive" (drag = scroll/zoom, click = position) under 11a.

Today the bars ruler is display-only: `role="presentation"` with no handlers, and its marks are `pointer-events-none` (`ArrangementTempoRow.tsx` l.80–128). Every ruler gesture lives on the seconds ruler (`ArrangementRuler.tsx` l.272–449). So the musical ruler, the reference's unit (L45), cannot be used to navigate or to start playback.

## 2. Changes

### 2.1 `useRulerNavigation` (N1) and the seconds ruler (grant 1)
- **N1** exports `useRulerNavigation(options)`. It returns `{ onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, onDoubleClick }`. It also exports the option and click-info types.
  - Options: `onGestureClaim`, `getTimelineView`, `applyTimelineView`, `onNavigationMove`, `onRulerDoubleClick`, and `onRulerClick(anchorTime, { altKey, pressTarget })`.
  - `pressTarget` (`EventTarget | null`) is the `event.target` captured in `onPointerDown` and stored on the navigation record, next to `anchorTime`. The seconds ruler ignores it.
- **Logic moves unchanged** from `ArrangementRuler.tsx`:
  - the left-button, `buttons !== 0` guard;
  - the gesture claim and its abort;
  - pointer capture, with the `watchUncapturedPointerGesture` fallback;
  - the `TIMELINE_DRAG_THRESHOLD_PX` threshold, `rulerDragView` in one rAF per frame, and `onNavigationMove` on the first move;
  - the end path: flush a pending frame, release, record `navigationEndedAt` after a drag, and call the click only on an unmoved `pointerup`, with `event.altKey`;
  - the 300 ms double-click-after-drag guard;
  - unmount cleanup.
- Keep the latest options in a ref, so the returned handlers always read current props.
- `ArrangementRuler` uses the hook. Its `onRulerClick` is today's seek: `onSeek(resolveGridTimeWithTargets(anchorTime, snapSeconds, gridSeconds, altKey, getSnapMarkerTimes()))`.
- **The seconds ruler's behaviour, markup, `title` and testid are unchanged.**

### 2.2 The bars ruler (grant 2)
- `ArrangementTempoRow` gets one prop, `rulerGestures: BarsRulerGestures`, and passes it, with `getTimelineView`, to `ArrangementBarsRuler`. The exported type `BarsRulerGestures` holds:
  - `onSeek`, `onPlayFrom`, `onGestureClaim`, `applyTimelineView`, `onNavigationMove`, `onRulerDoubleClick`;
  - `snapSeconds: number | null`, `gridSeconds: number`, `getSnapMarkerTimes`.
- **No tempo (`bpm === null`):** the bars ruler renders exactly as at HEAD: no handlers, no `title`, no child, no cursor class.
- **With a tempo:**
  - **Attached:** the root `div` gets the hook's handlers and `cursor-pointer touch-none`. Its `title` is the existing `studioViewStrings.rulerTitle`, because the lower zone does what the seconds ruler does.
  - **Scrub strip:** the first child is `<div data-testid="arrangement-bars-scrub-strip" aria-hidden="true" title={studioTempoStrings.scrubStripTitle}>`. It spans the full width, is the **top 10 px** (`h-2.5`, the upper half of the 20 px row), and its only visual is a hover tint from an existing token (e.g. `hover:bg-foreground/8`, as the metronome button uses). It renders before the marks; the marks stay `pointer-events-none` and paint above it.
  - **Zone test:** the bars ruler holds a ref to the strip. A click is a strip press when `pressTarget instanceof Node && stripRef.current?.contains(pressTarget)`, so the hit zone and the painted strip are always the same element. Do not compare against a second px constant. B's sketch used `offsetY < 10`, which is equivalent today; do not copy it.
  - **Target size:** the strip is 10 px high, below WCAG 2.5.8's 24 px. This is a recorded trade-off: the row is 20 px and no position moves. Keyboard and larger-target equivalents exist: the playhead handle (focus + ←/→), then Space or the Play button.
  - **Unmoved click:** `time = resolveGridTimeWithTargets(anchorTime, snapSeconds, gridSeconds, altKey, getSnapMarkerTimes())`, the same snap as the seconds ruler: the editing grid plus markers when Snap is on, and Alt bypasses. Then:
    - in the strip → `onPlayFrom(time)`;
    - below it → `onSeek(time)`.
  - **Drag** (≥ threshold, either zone): scroll/zoom through `rulerDragView`, exactly as the seconds ruler. No seek, no play.
  - **Double-click:** `onRulerDoubleClick` (Fit, or zoom to the time selection), with the same after-drag guard.
- Keep `ArrangementBarsRuler` memoised under the name `ArrangementBarsRulerInner`.

### 2.3 Wiring (grant 3)
- `playFromRuler(time)`, a `useCallback` with `[]` deps reading `workspaceRef.current`:
  - `seekTo(time)`;
  - then, **only if not playing**, `togglePlayback()`.
- So a strip click while stopped starts playback from `time`, and a strip click while playing jumps there and keeps playing (`seekTo` restarts the graph at the target, `ArrangementContext.tsx` l.1368–1383).
- The existing `togglePlayback` guards stay in charge, unchanged:
  - empty project → `nothingToPlay`;
  - past the end with no active loop → `playPastEnd(...)`, not playing; the position stays where it was clicked.
- `barsRulerGestures` is a `useMemo` built from:
  - `seekTo`, `playFromRuler`, `claimPointerGesture`, `applyTimelineView`, `pauseFollowForNavigation`, `handleRulerDoubleClick`;
  - `snapEnabled ? gridSeconds : null`, `gridSeconds`, `getRulerSnapMarkerTimes`.

  Each of these is already a stable callback or primitive. Pass it as `rulerGestures`.
- No other StudioWorkspace change. No new status text: a playback start is already audible and visible on the transport button.

### 2.4 String (grant 4)
`studioTempoStrings.scrubStripTitle = 'Click = play from here'`.
- A tooltip only, so it is not persistent screen text (L39).
- The lower zone reuses `studioViewStrings.rulerTitle`.

### 2.5 Shortcut sheet (grant 5)
New row, in the Transport group after `back-to-start`:

`{ id: 'play-from-point', action: 'Play from a point (needs a BPM)', keys: ['Click the top strip of the bars ruler'] }`

- No `ariaKeyShortcuts` (it is a mouse action, like `fit`'s double-click keys).
- It makes the strip discoverable in the `?` sheet, the quiet home the policy names.

### 2.6 Tests
**N2 `bars-ruler-ui.test.tsx`.** Build its own fixture with `StudioWorkspace` and a collection holding one `stem` (`bpm: 90`, 16 s) and one `sfx`.
- **Rules:**
  - query by testid, role and name only (L12);
  - fire pointer events with `button: 0, buttons: 1`, `clientX = t × PX_PER_SECOND` and `clientY` 4 (strip, targeting the strip element) or 15 (lower zone, targeting the ruler);
  - stub pointer capture and `getBoundingClientRect` as the existing ruler tests do (copy the helper pattern from `grid-musical-ui.test.tsx` l.115–153; do not import from it);
  - spy `togglePlayback` and `seekTo` through the context or use the transport button's `aria-label`.

| Row | Case | Expected |
|---|---|---|
| BR1 | No tempo | The bars ruler has no `title`, no `arrangement-bars-scrub-strip` and `textContent === ''`. A click at y 4 and at y 15 moves nothing and starts nothing; a 200 px drag does not scroll. |
| BR2 | Tempo 90 (typed), Snap on (G); strip click at 4.1 s while stopped | Playing (button `Pause`). Playback started from the 1/4 line nearest 4.1 s (60/90 multiples: 4.0000 s ±1 ms). |
| BR3 | BR2 state, playing; strip click at 8.2 s | Still playing. The position is the 1/4 line nearest 8.2 s (8.0000 s), and `togglePlayback` was not called again (no stop). |
| BR4 | Stopped; lower-zone click at 6.3 s, Snap on | Position 6.0000 s (nearest 1/4 at 90 BPM: 6.000 vs 6.667). Not playing. |
| BR4b | Playing; lower-zone click at 6.3 s | Still playing, position 6.0000 s. This is the existing `seekTo` behaviour, the same as a seconds-ruler click today. 10a replaces it with Insert Marker semantics. |
| BR5 | Alt held on a strip click and on a lower click | Both land free (the raw time, ±1 ms). Snap off and no Alt → free as well. |
| BR6 | Drag ≥ threshold horizontally, then vertically, from the lower zone and from the strip | Horizontal: the timeline scroll changes. Vertical: `pxPerSecond` changes. No seek, no playback in any case. |
| BR7 | Double-click with no time selection; double-click within 300 ms after a drag | The first fits the project (the same status as a seconds-ruler double-click). The second does nothing. |
| BR8 | Strip click past the project end while stopped; strip click in an empty project with tempo 90 | The first: not playing, status `playPastEnd`. The second: status `nothingToPlay`. |
| BR9 | With tempo 90, a seconds-ruler click at 3.1 s, Snap on | Unchanged behaviour: position on the nearest 1/4 line, not playing. Its `title` equals `studioViewStrings.rulerTitle`. |
| BR10 | Another pointer gesture holds the claim (e.g. a clip drag in progress); press on the bars ruler | `onGestureClaim` refuses it; nothing moves or plays. |

**Mutants (red-proof; apply, run N2, revert; report counts in `a-round-235.md`; the final files contain no mutant):**
- **MU-B:** the strip calls `onSeek` instead of `onPlayFrom` → BR2 and BR3 must turn red.
- **MU-C:** attach the handlers when `bpm === null` too → BR1 must turn red.

**Grant 6 (`strings.test.ts`):** add `'scrubStripTitle'` to `EXPECTED_V02C2_KEYS.studioTempoStrings` and its exact literal to the plain-string table, so ST17 holds.

**Grant 7 (`shortcuts.test.ts`):** add `'play-from-point'` after `'back-to-start'` in `EXPECTED_ROW_ORDER`. Add one assertion: `findStudioShortcut('play-from-point')?.keys` equals `['Click the top strip of the bars ruler']`.

### 2.7 Docs
- **N3 (doc 183):**
  - written in Georgian, technical terms in English, L26 headings;
  - l.4 exactly `**სტატუსი:** Completed (C round 235 PASS)`;
  - it records: the zones, the snap rule, the hook extraction, the deviations (§3), the Saba questions, and that Insert Marker semantics come in 10a;
  - it cites only tests that exist (BR1–BR10, BR4b, MU-B, MU-C, ST17, SC1).
- **Grant 8 (doc 182):** l.4 → `**სტატუსი:** Completed (C round 235 PASS)`. Nothing else in doc 182.

## 3. Reference: how Ableton Live 12 does it
**Sources:**
- Live 12 manual [6 Arrangement View](https://www.ableton.com/en/live-manual/12/arrangement-view/), fetched by B with WebFetch on 2026-10-28 (the whole page, 0–128k chars). Quotes from 6.1 "Layout" and 6.3 "Transport and Playback".
- `ableton-arrangement-expert` consult, 2026-10-28. It used the local manual captures (`loop/b-round-71/ableton-arrangement-view-20261021.txt`) and watched no video.
- Root's video notes `reference/youtube/SABA-B-9-10-11-transcripts.md` (riOD 2:22–3:08, m84w 0:00–0:58).

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Scrub click starts playback | 6.1: "Clicking anywhere in the scrub area launches playback from that point." 6.3: "You can also launch playback using the scrub area above the tracks." | Confirmed | Built: the strip click plays from the point | C-STRIP-STOPPED |
| Scrub click while playing | 6.3: "the jump between triggered play positions is quantized…" | "Jump" confirmed; "keeps playing" is an **inference** (expert) | Jump and keep playing | C-STRIP-PLAYING |
| Where the scrub area is, and its height | 6.3: "above the tracks"; 6.1: locators are added "to any point in the scrub area" | Position relative to the beat-time ruler and height **not found** | **Saba decision 2:** the top strip of the bars ruler, 10 px (the upper half of the 20 px row). The marker row keeps its own place ("no other positions move") | C-ZONES |
| Jump quantization | 6.3: quantized by "the Quantization Menu's value in the Control Bar" | Confirmed; the default value is not found | **Deviation:** CZABA has no launch Quantization menu, so the jump uses the editing grid when Snap is on (Alt bypasses), the same rule as every other CZABA ruler click. Sent to Saba as `SABA-Q-SCRUB-QUANTIZE` (L44) | C-STRIP-STOPPED, C-ALT |
| Hold in the scrub area loops | 6.3: "hold the left mouse button down on a specific point in the scrub area to play a repeated portion … based on the global launch quantization value" | Confirmed | **Not built** in this stage. Not in Saba's request; it needs launch quantization. Sent to Saba once as `SABA-Q-SCRUB-HOLD-LOOP` | — |
| Beat-time ruler drag | 6.1: drag left/right scrolls, drag vertically zooms | Confirmed | Built on the bars ruler, both zones | C-DRAG |
| Beat-time ruler double-click | 6.1: "Double-clicking in the beat-time ruler zooms in to the current selection" (whole Arrangement if none) | Confirmed | Built: Fit, or zoom to the time selection (the existing `handleRulerDoubleClick`) | C-DBL |
| Plain click in the beat-time ruler, outside the scrub area | — | **Not found** (expert: no documented effect) | **CZABA decision:** the lower zone sets the playback position, the same as CZABA's seconds-ruler click (review §4.3 "click = Insert Marker"; 10a turns it into the Insert Marker). Recorded as unconfirmed, inside `SABA-Q-TIME-RULER-ROLE` | C-LOWER |
| Time ruler (min:sec) | 6.1: "You can click and drag in the time ruler to scroll left or right." A plain click is not found | Scroll confirmed | **Deviation kept:** the seconds ruler keeps click = playhead. With no BPM (Saba decision 3: seconds grid) it is the only ruler, so removing its click would leave no-BPM projects without ruler positioning. Review §4.3 acceptance 4 ("click on the seconds ruler → only scroll") is therefore **not** applied; this is sent to Saba as `SABA-Q-TIME-RULER-ROLE` (L43/L44) | C-SECONDS |
| Cursor over the scrub area and ruler | — | **Not found** (expert) | `cursor-pointer` over the whole bars ruler with a tempo (SABA-B-6 finger rule); the strip is told apart by its hover tint and tooltip | C-ZONES |
| Right-click the scrub area → Add Locator | Video riOD 2:22–3:08 (root notes, **NEW**) | Seen in the video only | Not built (marker menu stays on flags). Saba question `SABA-Q-SCRUB-ADD-LOCATOR`, later candidate | — |
| Shift-click scrubs when Permanent Scrub Areas is off | 6.3 | Confirmed | Does not apply (no such preference; the strip is always on) | — |

**Deviations, with their reasons:**
- Strip placement: Saba's decision.
- Editing-grid quantization: there is no launch quantization in CZABA. Sent to Saba.
- The seconds ruler keeps its click: no-BPM projects need it (Saba decision 3). Sent to Saba.
- No hold-to-loop: not requested. Sent to Saba.

None of them is there because it is "simpler to build".

**Better than Live (small):** the strip snaps to the same grid the user edits on, and it is listed in the `?` sheet. Live's manual documents its scrub area; Live's in-app hints were not checked.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. `npm run typecheck` rc 0. `npx biome check` on every changed code file is clean.
2. Run `npx vitest run $(cat ../tmp/studio-real-loop/b-round-234/covering-files.txt) app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx`. Everything must be green. Any test above 50 % of its timeout goes at the top of the report (L32).
3. MU-B and MU-C (§2.6), applied and reverted.
4. `code-reviewer` (3+ files changed). Pass its Architecture note to B.
5. Your own Playwright run on `/studio-lab` (both viewports):
   - the §0.3 strip-stopped, strip-playing, lower-zone and no-tempo recipes;
   - the full-window before/after screenshots, with no new persistent text (L39).
6. Write `a-round-235.md`: changed files, tests run with counts, mutants, reviewer result, any STOP at the top.

## 5. C: acceptance (real Chromium on `/studio-lab` at 1440×900 and 1280×720, fresh context per row)
| Row | What | Pass when |
|---|---|---|
| C-SCOPE-235 | HEAD, status, hashes | <ul><li>HEAD is `c95b8a8`;</li><li>only the 8 grants are `M`, plus the 3 new files;</li><li>`sha256sum -c` on the frozen and root lists gives rc 0;</li><li>protected files: `git diff --quiet HEAD` gives rc 0;</li><li>doc 182 differs from HEAD in l.4 only.</li></ul> |
| C-UNIT-235 | N2, `strings.test.ts`, `shortcuts.test.ts`, `tempo-ui`, `tempo-window-ui`, `tempo-seed-ui`, `grid-snap-position`, `navigation-strings-ui` | All green. The full suite is a gate row. |
| C-STRIP-STOPPED | Seed (Add pulse), then a strip click at t = 4.1 s | Playing within 500 ms (button `Pause`). Playhead ≥ 4.000 and < 4.1 + elapsed: it started from 4.000, the 1/4 line at 120 BPM. An analyser on the destination shows non-zero RMS. 0 page errors. |
| C-STRIP-PLAYING | While playing, a strip click at t = 8.2 s | Still playing, with no stop/start blip in the button label. The playhead reads 8.000 + elapsed (±50 ms), not a continuation of the old position. |
| C-LOWER | Stopped; lower-zone click at t = 6.3 s. Then, while playing, another lower-zone click at 10.2 s | Stopped: playhead `6.5`, not playing. Playing: still playing, jumped to 10.000 + elapsed. This is the existing seek-while-playing behaviour, listed so it is not judged as unlisted; 10a will change it. |
| C-ALT | Alt + strip click at 4.3 s; Alt + lower click at 6.3 s | The strip starts from 4.3 (±25 ms); the lower click gives `6.3`. |
| C-DRAG | A 200 px horizontal drag from the lower zone, then one from the strip; a 60 px vertical drag | Scroll +200 px each time, then a zoom change. The playhead is unchanged and nothing plays. |
| C-DBL | Double-click on the bars ruler with no time selection | Status `Fit: the entire project is visible (00:16.000). X goes back.` |
| C-EDGE | Past-end strip click (scroll 400 px, t = 20); empty project with tempo 90 typed, strip click | The exact `playPastEnd` and `nothingToPlay` statuses; not playing. |
| C-NO-TEMPO | Add `demo-soft-impact` only | No `arrangement-bars-scrub-strip`, no `title`, cursor `auto`. Clicks at y 4 and y 15 and a drag change nothing. The bars ruler `textContent` is empty. |
| C-SECONDS | With a seed, a seconds-ruler click at 3.175 s | `3.000`, not playing, `title` unchanged (`Click = playhead · …`). The playhead handle drag still scrubs. |
| C-ZONES | Hover the strip, then the lower zone | `elementFromPoint` at y 4 is the strip (computed height 10 px, full ruler width) and at y 15 is the ruler. The strip shows a background tint on hover only (screenshot crop) and has the title `Click = play from here`. Computed cursor `pointer` on both. |
| C-SHEET | `?` sheet | The Transport group lists `Play from a point (needs a BPM)` — `Click the top strip of the bars ruler`, after `Back to start`. The filter `play` finds it. |
| C-BUDGET | L39 | Persistent text lines outside the timeline, empty project and after a seed, at both viewports, compared with the HEAD build: no increase. The strip has no text and no fill at rest. |
| C-REF-235 | §3 | Each row matches or is a listed deviation. The five new Saba questions exist in `backlog.json`: SABA-Q-TIME-RULER-ROLE, SABA-Q-SCRUB-QUANTIZE, SABA-Q-SCRUB-HOLD-LOOP, SABA-Q-SCRUB-ADD-LOCATOR (§3) and SABA-Q-SEED-STATUS-LENGTH (gate 234 S5). |
| AN-REVIEW-235 | Docs 182 and 183 | Doc 183: L26 headings, l.4 byte-exact, cites only existing ids. Doc 182: l.4 byte-exact `**სტატუსი:** Completed (C round 235 PASS)`. |
| LAB-SMOKE-235 | `/studio-lab` | It loads. Play/Pause with Space works, and the export dialog opens. 0 page errors. |
| C-SHOTS-235 | Evidence | Before/after full-window screenshots at both viewports (empty, seeded, strip hover). |
| Auth | Standing check | A fresh context: `/studio-lab` opens anonymously with `auth_user` null. `/studio/middle-east` shows "Sign in required", with no workspace and no `audio[src]`. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

## 6. Neighbouring behaviour that could break (C probes these first)
- **The seconds ruler after the hook extraction:**
  - click, drag pan and zoom, and double-click (Fit and zoom-to-selection);
  - the drag-then-double-click guard;
  - the playhead handle drag and its arrow keys;
  - a press on the ruler releasing a focused marker flag (MU8d).
- **Follow:** a bars-ruler drag pauses Follow, as a seconds-ruler drag does.
- **Loop:** with an active loop brace, a strip click inside the loop plays and loops. One outside it plays from the click; this is the existing `togglePlayback` rule, so record what you see.
- **Library preview:** a strip click while a library preview plays stops the preview (`togglePlayback` already does this).
- **Render budget:** playhead frames must not re-render the bars ruler (BU8). Check one Performance trace for long tasks during a strip-started playback.
- **Touch:** `touch-none` on the bars ruler with a tempo only. Without a tempo, page scroll over it is unchanged.

## 7. Outcomes for B's next planning
- **PASS and gate published:** SABA-B-11a is complete. Round 236 is the A-R234-REVIEW-M1 bug round (D-29z329), then SABA-B-11b. If planning is on or after 2026-10-30, the REGRESSION round comes first.
- **FAIL:** a fix-up on the same grants.
- If Saba answers `AGREE-SABA-B-7.md`, SABA-B-7 is scheduled right after the running stage.

## 8. Root notes
- New Saba questions: `SABA-Q-TIME-RULER-ROLE`, `SABA-Q-SCRUB-QUANTIZE`, `SABA-Q-SCRUB-HOLD-LOOP`, `SABA-Q-SCRUB-ADD-LOCATOR`, `SABA-Q-SEED-STATUS-LENGTH` (`backlog.json`, `awaiting_user`).
- New checkpoint request `b-round-234-checkpoint-request.md` (ARCH-CHECKPOINT-TEMPO-GRID: the tempo/grid/Snap cluster in `StudioWorkspace.tsx`, the `useTempoGrid` proposal). Non-blocking; please run it before SABA-B-11b if possible.
- B's scratch dev server on `:5174` shared the symlinked `store/node_modules/.vite` cache. Vite re-optimised dependencies there once. That cache is untracked and machine-local; no tracked file changed.
