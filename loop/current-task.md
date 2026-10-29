# Round 252: SABA-B-10a stage 2b (final 10a stage) + the IM22 test-strength fix

The changes:
- **Item 0 (Medium, first): A-R251-REVIEW-IM22-PLAYING.** IM22's playing assert is vacuous: in jsdom `requestAnimationFrame` is stubbed, so the position store stays at the play-from value 3, which is also the marker. The row writes the live position into the store first.
- **Item 1 (C-R235-02, Low, Live 12 manual 6.2):**
  - while playing, a click on the bars ruler's lower zone (and, by the CZABA rule below, on the seconds ruler) **pauses Follow**;
  - a click in the bars ruler's **scrub strip** while playing **resumes** a paused Follow;
  - **Stop** resumes a paused Follow.
- **Item 2 (B-R250-NAV-ORIGIN, Low, Live 6.3/6.4):** while stopped, Ctrl+←/→ steps from the **Insert Marker**, not from the stop point. The "no more markers" status names the insert marker while stopped and the playhead while playing.
- **Item 3 (B-R250-PLAYHEAD-TITLES, Low):** the seconds ruler, bars ruler and range body titles say `click = insert marker`.
- **Item 4 (B-R251-PASTEND-AT-END, info; also closes the deferred Low B-R236-END-WORDING, same root cause, L7):** a play exactly at the end reads `… (00:16.000) is at the end of the project — …` instead of `(00:16.000) is past the end of the project (00:16.000)`.
- **Doc 191** → `Completed (C round 252 PASS)`. This is the last SABA-B-10a stage (L28).

**Planned by:** B, at the round 251 → 252 planning, 2026-10-29. **Decisions:** D-29z452…D-29z460.

**Why this round (D-29z452):**
- **C round 251:** PASS, `browserVerified` and `realVerified` both true.
- **Gate 251:** `published`, commit **`83b7c756ce3108d0e31f023a1aa2b0e59547d913`**, on both remotes. Rounds 250–251 are published together.
- **SABA-B-10a stage 2a is done.**
- **The one open Medium:** A-R251-REVIEW-IM22-PLAYING (test strength, no product failure). C row C-CAPTION-MOVE-251 covers the browser half.
  - The bug gate puts it first.
  - It is 3 lines in `insert-marker-ui.test.tsx`, which this stage owns anyway. It is item 0, with its own red-proof.
- **REGRESSION is not due.** `regression-last.json` is 2026-10-27. Today is 2026-10-29, 2 days later, and the rule is ≥ 3 days. It is due at the first planning on or after **2026-10-30**, which is very likely the next one (§7).
- **RETRO** is due at round 260.
- **The export-progress flake did not come back.** Gate 251's `verify.log` shows `export-progress-ui.test.tsx` 8/8 green (1,242 ms) and 215/215 files. EXPORT-PROGRESS-LOAD-FLAKE-250 stays a watch item, and no isolation task is scheduled (D-29z447 condition not met).
- **Stage 2b as one round, not split (D-29z453):**
  - All five items are consumers of one change, the insert-marker model of stages 1–2a. Every item is stage-2b scope already sequenced by D-29z436/D-29z449/D-29z451.
  - Only item 1 changes behaviour, in one owner (`StudioWorkspace.tsx`, which owns `followModeRef`). Items 2–4 are an origin swap and copy.
  - **Seam, if A STOPs on item 1:** items 0+2+3+4 can pass alone, and item 1 is re-dispatched.

**Read first:** `lessons.md` in full. Directly relevant here:
- **L29**, all four clauses (a changed meaning means every readout is a consumer; §0.3 copy sweep);
- **L23** (pre-applied, §0.2);
- **L3** (the new status strings → widest-state rows);
- **L39** (nothing new is persistent);
- **L47/L50** (focus grep, §0.2);
- **L51** (status clobber, §1.3);
- **L49** (the wrapper keeps `setInsertMarker`'s side effects, §1.2);
- **L28** (doc 191 final);
- **L52** (new: playing-branch readout asserts in jsdom).

## 0. Baseline and scope

**Start state:**
- **HEAD** = `83b7c756ce3108d0e31f023a1aa2b0e59547d913` (gate 251; `b-round-251/head-at-planning.txt`).
- **The working tree is clean.** `git status --short --untracked-files=all` is empty (`b-round-251/git-status-at-planning.txt`, 0 lines).
- **STOP (L11)** if HEAD differs, if the status is not empty, or if any hash check fails. One exception: a root commit that touches only the 4 root files. In that case, re-hash them and continue.

**Frozen:** `b-round-251-r252-tree-sha256.txt`, **1,097** files. That is every tracked file (1,114), minus the 13 grants and the 4 root files.
- From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-251-r252-tree-sha256.txt` gave rc 0 at planning.
- These are frozen in particular:
  - `ArrangementContext.tsx` (no context change this round; it changed in rounds 248–251, see GATE249-ARCH-TRANSPORT-POSITIONS);
  - `ArrangementRuler.tsx`, `ArrangementTempoRow.tsx`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementTransport.tsx` and `shortcuts.ts`;
  - `ArrangementContext.test.ts`, `grid-snap-menu.test.tsx`, `markers-move-ui.test.tsx`, `mode-toggle-colour-ui.test.tsx`, `focus-reveal-ui.test.tsx`, `library-preview.test.tsx` and `render-budget.test.tsx`.

  Their Follow asserts (GM24, `markers-move-ui` l.777, DXT3, FR-e) check `paused` **while playing** only. B read each one, and the stop-resume does not reach them.
- **The 7 protected auth and purchase files** each appear exactly once in the frozen list (checked), and `git diff --quiet HEAD` gives rc 0 on each:
  - `app/routes/studio.$productId.tsx`;
  - `app/routes/api.studio-token.ts`;
  - `app/routes/account.downloads.tsx`;
  - `app/lib/__tests__/download-routes.test.ts`;
  - `app/lib/auth.ts`;
  - `app/contexts/AuthContext.tsx`;
  - `app/entry.server.tsx`.
- **Also frozen:**
  - every other component;
  - every other test file;
  - every implementation doc except doc 191;
  - `.claude/**`, `CLAUDE.md` and every config file.

**Root-owned, must equal HEAD:** `b-round-251-r252-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`), with start hashes in `b-round-251-r252-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants (`b-round-251-r252-grants.txt`; start hashes in `b-round-251-r252-grants-start-sha256.txt`; start copies in `b-round-251/r252-granted-start/`)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | Item 1 (§1.2): the ruler-click wrapper, strip resume, and Stop resume. |
| 2 | `app/components/arrangement/ArrangementMarkerRow.tsx` | Item 2 (§1.4): `stepMarker` origin and the "none" message by state. |
| 3 | `app/lib/arrangement/strings.ts` | <ul><li>Items 1–4 copy (§1.6).</li><li>New: `studioPlaybackStrings.insertMarkerWhilePlayingFollowPaused`, `studioMarkerStrings.noneAfterInsertMarker` and `noneBeforeInsertMarker`.</li><li>Changed: `rulerTitle`, `rangeBodyTitle` and `playPastEnd` (at-end branch).</li></ul> |
| 4 | `app/lib/arrangement/__tests__/insert-marker-ui.test.tsx` | Item 0 (IM22). New **IM24** (nav origin): this is the known-good home, with M (IM23), Space, `advance` and `clickRuler` already in the file. |
| 5 | `app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx` | New FW1–FW7 (§2.3). BR9/BR13 are unchanged unless a literal collides. |
| 6 | `app/lib/arrangement/__tests__/markers-ui.test.tsx` | `No more markers … playhead` literals (l.430/439/450/456) → by state (R-NONE). |
| 7 | `app/lib/arrangement/__tests__/marker-edge-nav-ui.test.tsx` | l.371/375 literals by state (R-NONE). This file also mounts with `togglePlayback` (l.424/430), so a playing "none" row may go here. |
| 8 | `app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | `MARKER_NEXT_NONE_TEXT` (l.405) by the state of the row that uses it. |
| 9 | `app/lib/arrangement/__tests__/strings.test.ts` | <ul><li>ST17 (`rulerTitle`, l.1008–1009) and ST34 (`rangeBodyTitle`, l.1927).</li><li>The marker-strings exact-key row (l.1630–1631) gets the 2 new keys.</li><li>ST11 gets the at-end and Follow-paused formatter cases.</li><li>Any exact-key list of `studioPlaybackStrings` gets the new key.</li></ul> |
| 10 | `app/lib/arrangement/__tests__/clip-strings-ui.test.tsx` | `RANGE_BODY_TITLE` (l.103) and l.244 → the new title. Fixes CSU1, CSU2 and LC1 (LC1 finds the body by that title). |
| 11 | `app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx` | NS4 l.343 → the new ruler title. |
| 12 | `app/lib/arrangement/__tests__/track-layout.test.tsx` | l.475 `rangeBodySelector` → the new title. This keeps the folded-clip "no range body" assert from going vacuous: it must still find the body on an unfolded clip in the same row (it failed on B's scratch, so it does find it today). |
| 13 | `docs/implementation/2026/quarter-IV/191-saba-b-10a-insert-marker.md` | The whole doc (L34). l.4 becomes exactly `**სტატუსი:** Completed (C round 252 PASS)` (L28 final stage). Add a round-252 / stage-2b part to each of the 7 TEMPLATE sections, without rewriting the earlier text. |

- **No assertion is removed** without a stronger replacement. A test whose only change is removing an assertion is a Medium bug (policy).
- **Read before editing:**
  - `AGENT_DISCOVERABLE_CODE.md` (the new keys and the wrapper name);
  - `AUDIO_ARCHITECTURE.md` (position stores and playback restart);
  - `FORWARDREF_COMPONENT.md` (no component API change expected);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`;
  - `.claude/prompts/studio-feature.md`.

### 0.2 B's pre-check (L23, L50, done)
- **Copy collisions** (scratch `/tmp/b252-scratch` = a tar copy of HEAD with the item 3 and item 4 strings changes applied; `b-round-251/precheck-copy-fails.txt`):
  - `tsc` rc 0.
  - The 8 files that pin those literals ran: **7 failures, all in granted files.** They are CSU1, CSU2, LC1 (grant 10), NS4 (grant 11), ST17, ST34 (grant 9), and the track-layout row "renders no range body on a folded clip…" (grant 12).
  - `ArrangementContext.test.ts`, `metronome-horizon-ui`, `bars-ruler-ui` and `insert-marker-ui` stayed green. BR13 and BR8 compute the text with `playPastEndMessage`, so the at-end wording flows through them.
  - **The only frozen file that names the end wording is `ArrangementContext.test.ts` l.687/701.** Those are test titles with no literal assert, so they are unaffected.
- **"No more markers" literals:** the grep `grep -rn "noneAfter\|noneBefore\|No more markers" app/lib/arrangement/__tests__` hits only grants 6–9 (markers-ui l.430/439/450/456, marker-edge-nav l.371/375/398, status-announcement l.405, strings.test l.1630–1631). **Ruling R-NONE:** each hit takes the text for the state its row is in (stopped → `…insert marker`, playing → `…playhead`). A hit whose state A cannot tell is a STOP (L23).
- **Item 0** (`b-round-251/precheck-im22.txt`, sketch `b-round-251/im22-fixed-sketch.test.tsx`):
  - **The fix:** after `advance(1)`:
    - `act(() => mounted.api.position?.setPosition(live(mounted.api).getLivePosition()));`
    - `expect(positionOf(mounted.api)).toBeGreaterThan(3.5);`
    - then the existing `caption === '00:03.000'`.
  - **Red-proof:** MU-CAPTION-POSITION (`b-round-250/mutants/mutate251.py`), plus the stopped caption asserts removed on the scratch only. IM22 goes **red at the playing assert** (`expected '00:03.960' to be '00:03.000'`).
  - **Control:** HEAD's IM22 under the same two changes is **green**, which is the vacuity being fixed.
- **Focus (L47/L50):**
  - The regex `onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)` over grants 1–2 has **32 hits**.
  - **Ruling: all out of scope.** No hunk in this task moves focus or unmounts a focusable element:
    - Follow changes a `data-follow-mode` attribute and the button text (`Follow` / `Follow ‖`) on the **same** button element;
    - the nav change only swaps the origin of an existing `seekTo`.
  - C re-runs the grep and checks that `document.activeElement` is unchanged across the FOLLOW rows (C-FOCUS-252).
- **Timeout headroom (L31):** gate 251 `verify.log` shows:

  | File | Tests | Time | Declared timeout |
  |---|---|---|---|
  | `insert-marker-ui` | 23 | 5.08 s | 15 s per test |
  | `bars-ruler-ui` | 15 | 4.38 s | – |
  | `markers-ui` | 31 | 5.06 s | – |
  | `marker-edge-nav-ui` | 12 | 2.22 s | – |

  No single test is near 50 % of its timeout. A reports any test above 50 % of its declared timeout at the top (L11).
- **Browser baseline at HEAD** (`b-round-251/probe/follow-baseline.cjs` → `follow-baseline.json`, both viewports). This also verifies the recipe (L29):
  1. Load `/studio-lab` and wait for `Demo collection ready`.
  2. Click library item `demo-stem-pulse`, then **Add**. The status reads `Tempo 120 BPM from …` and the bars ruler `data-bpm="120"`.
  3. Blur, then press `=` ×4. The zoom becomes 97.7 px/s.
  4. Press **Space**.

  Results at HEAD:
  - A lower-zone click (`bars.y + h − 3`) gives `data-follow-mode="on"` (**bug**) with the status `Insert marker at 00:01.250 — playback continues. …`.
  - A seconds-ruler click gives `on`.
  - A manual scroll of +200 px gives `paused` (status `Follow paused by manual navigation…`).
  - A strip click (`bars.y + 2`) gives **`paused`** (bug).
  - **Space (stop)** gives **`paused`**, so Follow stays paused after Stop (Live: it resumes on stop).

### 0.3 Copy sweep (L29 changed-meaning clause)
`grep -rniE "click = playhead|click.{0,20}playhead|playhead.{0,20}click|markers? (after|before) the playhead" app --include=*.ts --include=*.tsx | grep -v __tests__` gives `strings.ts` `rulerTitle`, `rangeBodyTitle`, `noneAfter` and `noneBefore` (all this round). There are no inline JSX hits.

These stay, because they name the playhead correctly:
- `playheadTitle` (the playhead handle);
- `startPointPlayhead` (the Shift+Space origin);
- `insertMarkerToPlayhead`;
- `noneAfter`/`noneBefore`, now used only while playing.

C re-runs the grep (C-COPY-252).

## 1. Rulings

### 1.1 Which clicks pause or resume Follow (D-29z454)
Live 12 manual 6.2, verbatim (§3): *"Follow will pause if you make an edit or scroll the view horizontally in the Arrangement or if you click on the beat-time ruler. Follow will start again once you stop or restart playback, or click in the Arrangement or clip scrub area."*
- **"the Arrangement or clip scrub area"** is read as "the Arrangement scrub area or the clip scrub area". Both are scrub areas. In CZABA, the Arrangement scrub area is the bars ruler's top strip (`arrangement-bars-scrub-strip`, 11a). There is no clip scrub area (no Clip View).
- **A track (lane) click is therefore not a resume trigger,** and it is **not changed** (inference, recorded).

| Action while playing | Follow before | Follow after | Status after |
|---|---|---|---|
| Bars ruler lower zone click | `on` | **`paused`** | **`insertMarkerWhilePlayingFollowPaused(t)`** |
| Seconds ruler click (CZABA rule, §1.5) | `on` | **`paused`** | same |
| Either ruler click | `paused` / `off` | unchanged | `insertMarkerWhilePlaying(t)` (unchanged) |
| Scrub strip click | `paused` | **`on`** | **`followResumed`** |
| Scrub strip click | `on` / `off` | unchanged | unchanged (no write, as at HEAD) |
| Lane / clip-body / range-body click | any | unchanged | unchanged |
| Ruler drag (↔ scroll, ↕ zoom), manual scroll, wheel | `on` | `paused` | `followPaused` (unchanged, HEAD behaviour) |
| Space (stop) | `paused` | **`on`**, silently | the stop's own status (unchanged) |
| Space (stop) | `off` | `off` | unchanged |

- **While stopped,** no ruler or strip click changes Follow. That is the existing `isPlaying` guard. A stopped strip click starts playback, and the existing play effect (l.1888–1896) still resumes `paused`.
- **`off` never turns on by itself.** Only the Follow button does that.

### 1.2 Where the logic lives (D-29z455, L49)
- **Not in the context.** `setInsertMarker` serves both the ruler clicks (pause) and the lane clicks (no change), so the rule belongs at the call sites. `StudioWorkspace.tsx` owns `followModeRef` and wires both rulers: `barsRulerGestures.onSeek` (l.1413) and `<ArrangementRuler onSeek>` (l.2902).
- **New callback `placeInsertMarkerFromRuler(time)`** in `StudioWorkspace.tsx`, used for both `onSeek` props. Its body:
  1. `const pausing = workspaceRef.current.isPlaying && followModeRef.current === 'on';`
  2. `setInsertMarker(time)`. It is called unchanged and **keeps all its side effects**: the marker write, the stopped `updatePosition`, the playing status and the scrub-ref reset.
  3. If `pausing`: `setFollowMode('paused')`, then `workspaceRef.current.setStatus(studioPlaybackStrings.insertMarkerWhilePlayingFollowPaused(formatArrangementTime(Math.max(0, time))))`.
  - Do **not** call `pauseFollowForNavigation`, whose status would be clobbered or would clobber; see §1.3.
  - Both status writes happen in one event handler, so React batches them and the `aria-live="polite"` status (`StudioWorkspace.tsx` l.3047) receives one final text. If A finds that `setStatus` announces per call (any announce helper or dedupe), FW1 also asserts a single announcement of the composed text. Otherwise A states the batching in the report.
  - A mutant that deletes step 2 or step 3 must turn an FW row red.
- **`playFromRuler`** (l.1408) gains a resume branch. If `isPlaying` and `followModeRef.current === 'paused'`:
  - first set `autoScrollLeftRef.current = scrollerRef.current?.scrollLeft ?? 0` (as `toggleFollow` does, so the next follow scroll is not read as a manual scroll);
  - then call `playFrom(time)`;
  - then `setFollowMode('on')` and `setStatus(studioViewStrings.followResumed)`.

  The `playFrom` call is unchanged in every case.
- **Stop resume:** in the effect at l.1888, when `isPlaying` turns false and `followModeRef.current === 'paused'`, call `setFollowMode('on')`. It writes no status. The existing true-branch is unchanged.
- **Not in scope:**
  - the marker flag's play (`ArrangementMarkerRow` `playFrom` while playing). Whether a locator jump counts as a "restart" is an inference; it is recorded in SABA-Q-FOLLOW-EDIT-RESTART (b).
  - Ctrl+←/→ during playback. Unchanged.

### 1.3 Status writes (L51)
| Sequence (real order) | Final status after the last write |
|---|---|
| Ruler click while playing, Follow `on`: `setInsertMarker` writes `insertMarkerWhilePlaying(t)`, then the wrapper writes the composed text | `Insert marker at 00:01.250 — playback continues, Follow paused. Stop, then Space plays from here.` |
| Ruler click while playing, Follow `paused`/`off` | `Insert marker at <t> — playback continues. Stop, then Space plays from here.` (HEAD text) |
| Strip click while playing, Follow `paused`: `playFrom` (no status, `seekTo` only, context l.1490–1498), then `followResumed` | `Follow is following the playback position again.` |
| Paused, then Space (stop) | the text HEAD writes on stop, unchanged. FW6 computes the expected text from a stop without a pause in the same test and asserts they are equal. |

### 1.4 Ctrl+←/→ origin (D-29z456; Live 6.3/6.4)
- In `stepMarker` (`ArrangementMarkerRow.tsx` l.262–289), `getLivePosition()` → **`getLocatorPosition()`**. That already exists in the context: while playing it returns the live position, while stopped the insert marker.
  - **Stopped:** after Play from 1 and a Stop at about 4, Ctrl+→ goes to the first marker after **1**, not after 4.
  - **Playing:** unchanged.
  - `seekTo` already writes the insert marker (EN3). Add `getLocatorPosition` to the deps and drop `getLivePosition` if it is now unused.
  - This also answers part of the gate-251 reviewer's signal 2: the three-way position split becomes two sources (context `getLocatorPosition`, commands `insertMarkerRef`). No refactor.
- **The "none" message by state:**
  - stopped → `studioMarkerStrings.noneAfterInsertMarker` = `'No more markers after the insert marker'` (`noneBeforeInsertMarker` = `'No more markers before the insert marker'`);
  - playing → the existing `noneAfter`/`noneBefore` (`… the playhead`), unchanged.
  - The key-repeat dedupe (`status !== message`) is unchanged.
  - The state is read from `isPlaying` of `useArrangement()`; add it to the deps.

### 1.5 The seconds ruler (SABA-Q-TIME-RULER-ROLE stays `awaiting_user`, L44)
- The default from round 249 holds: a seconds-ruler click places the insert marker. It does what the bars lower zone does.
- **CZABA rule (inference, not Live):** because it does the same thing, it also pauses Follow while playing. In a no-BPM project the seconds ruler is the only click ruler, and Live's own time ruler only scrolls (6.1 item 15).
- This is appended to SABA-Q-TIME-RULER-ROLE as part (b). It is not a Saba decision.

### 1.6 Copy (items 1, 3, 4)
- `rulerTitle`: `'Click = insert marker · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit / Zoom to selection'`.
- `rangeBodyTitle`: `'drag = time selection · click = insert marker'`.
- **`playPastEnd`:** when `position === end` (the formatted strings are equal), it returns `` `${subject} (${position}) is at the end of the project — there is nothing to play here. Home returns to 0.` ``. Otherwise it returns the HEAD text.
  - The comparison is on the formatted ms strings, so 15.9999995 vs 16 reads as at the end, honestly.
  - No caller changes.
- **New** `insertMarkerWhilePlayingFollowPaused: (time: string): string` → `` `Insert marker at ${time} — playback continues, Follow paused. Stop, then Space plays from here.` ``.

### 1.7 Screen budget (L39) and Lows
- **Nothing persistent is added.** Statuses are transient and titles are tooltips. The Follow button already shows `Follow ‖` when paused. C still counts the persistent lines (C-BUDGET-252).
- **New Lows go to `deferred_low_polish`** (D-29z458). This round does not fix them:
  - GATE251-S1 (library span: JSX text plus a direct DOM write);
  - A-R251-REVIEW-ADD-DESCRIBEDBY;
  - A-R251-REVIEW-CLASS-SELECTORS.

## 2. Changes

### 2.1 Source (grants 1–2)
As §1.2 and §1.4. The new callback is `placeInsertMarkerFromRuler`, wrapped in `useCallback` and placed next to `playFromRuler`. It replaces `setInsertMarker` in `barsRulerGestures` (value and deps) and in the `<ArrangementRuler onSeek>` prop. No prop, type or other component changes.

### 2.2 Strings (grant 3)
As §1.4 and §1.6. Every new key gets its exact literal row in `strings.test.ts`.

### 2.3 Rows (grants 4–12)
| Row | File | What it pins | Red-proof (named mutant A runs) |
|---|---|---|---|
| IM22 (amended) | 4 | Playing: the position store is above 3.5 and the caption is still `00:03.000`. | MU-CAPTION-POSITION + the scratch-only removal of IM22's stopped caption asserts → red at the playing assert (§0.2). |
| FW1 | 5 | Tempo 90, Snap on, playing, Follow `on`. A lower-zone click gives `data-follow-mode="paused"`, button text `Follow ‖`, the exact composed status, the insert marker at the snapped time, and `isPlaying` true. | MU-FW-NO-PAUSE (the wrapper's step 3 deleted) |
| FW2 | 5 | The same with a seconds-ruler click. | MU-FW-SECONDS-RAW (`<ArrangementRuler onSeek={setInsertMarker}>` restored) |
| FW3 | 5 | Paused (by a scroll of +200 and `fireEvent.scroll`, as NS3b), then a strip click while playing gives `on`, the status `followResumed`, and still `isPlaying` true. | MU-FW-NO-RESUME |
| FW4 | 5 | Follow `off` (button), playing. A strip click leaves it `off`, and a lower-zone click leaves it `off` with the HEAD status `insertMarkerWhilePlaying(t)`. | MU-FW-RESUME-ANY (`if paused` → `if !== 'on'`) |
| FW5 | 5 | Stopped, Follow `on`. A lower-zone click and a seconds-ruler click leave it `on`, with no Follow text in the status. | MU-FW-PAUSE-STOPPED (the `isPlaying` guard deleted) |
| FW6 | 5 | Paused while playing, then Space (stop) gives `on`. The status equals what a stop without the pause writes (computed in the same test). | MU-FW-NO-STOP-RESUME |
| FW7 | 5 | Playing, Follow `on`. A lane-body click moves the marker and Follow stays `on` (§1.1, the lane row unchanged). neighbour pin, no mutant (the lane takes `setInsertMarker` from `useArrangement()` at `ArrangementLane.tsx` l.189, so a wrapper-routing mutant would need a new prop through a frozen component) |
| IM24 | 4 | Markers at 2 and 6. Play from 1, advance about 3 s, stop. Ctrl+→ selects the marker at **2**, and the marker and playhead are at 2. Then the stopped "none" text `…after the insert marker` at the end of the steps, and while playing `…after the playhead`. | MU-NAV-LIVE-ORIGIN (`getLivePosition` restored), MU-NONE-PLAYHEAD-STOPPED |
| ST11 + | 9 | `playPastEnd` at the end: subject Insert marker, 00:16.000 / 00:16.000 → the at-end text. `playPastEndMessage(16, 16, 'insert-marker')` gives the same. `insertMarkerWhilePlayingFollowPaused('00:08.000')` → the exact text. | MU-PASTEND-ALWAYS-PAST |

- Rows FW1–FW7 use the existing `bars-ruler-ui` helpers: `mountTempo90SnapOn`, `clickStrip` and `clickAt`. Lower zone and seconds-ruler y are as in BR4/BR9. Use `fireEvent.scroll` for the pause, as GM24/NS3b do.
- A states, per row, the mutant run and the failing line (`a-round-252/mutants/`).

### 2.4 Doc 191 (grant 13)
- l.4 is exactly `**სტატუსი:** Completed (C round 252 PASS)`.
- Each of the 7 TEMPLATE headings, in order, gets a stage-2b part:
  - context (C-R235-02, NAV-ORIGIN, the titles, the at-end wording, IM22);
  - approach: D-29z454…D-29z456, the 6.2 parsing, and the rejected alternatives (pause and resume inside the context: rejected because `setInsertMarker` is shared with lane clicks; `pauseFollowForNavigation` for ruler clicks: rejected because of the status clobber);
  - Mermaid: rulers → `placeInsertMarkerFromRuler` → `setInsertMarker` + `followModeRef`;
  - files;
  - problems: IM22 vacuity → L52;
  - testing: rows with their mutants;
  - TODO: 10b, 9, 11c, SABA-Q-FOLLOW-EDIT-RESTART, ARCH-CHECKPOINT-TRANSPORT-POSITIONS.
- Every test the doc cites exists (L26).

## 3. Reference: how Ableton Live 12 does it
Sources:
- Live 12 Reference Manual, chapter 6 "Arrangement View", https://www.ableton.com/en/manual/arrangement-view/, fetched by B on 2026-10-29 (WebFetch). The section numbers are the manual's.
- Official Ableton video "Learn Live: Transport bar and Follow behavior" (https://www.youtube.com/watch?v=m84wUU8CQnY), as summarised in root's `reference/youtube/SABA-B-9-10-11-transcripts.md` l.17/l.35. It has no pause/resume detail; B did not watch it.

| Behaviour | Ableton source | Confirmed there | CZABA decision / deviation | C check |
|---|---|---|---|---|
| Follow pauses on a beat-time ruler click | 6.2 | "Follow will pause … if you click on the beat-time ruler." | Match: the bars lower zone, while playing | FW1, C-FOLLOW-PAUSE-252 |
| Follow pauses on a horizontal scroll | 6.2 | "… or scroll the view horizontally" | Match (HEAD) | §6 neighbour |
| Follow pauses on an edit | 6.2 | "Follow will pause if you make an edit" | **Not built. Deviation listed:** SABA-Q-FOLLOW-EDIT-RESTART (a), `awaiting_user` | not tested (listed) |
| Follow resumes on a scrub-area click | 6.2 | "… or click in the Arrangement or clip scrub area." | Match: the bars scrub strip | FW3, C-FOLLOW-RESUME-252 |
| Follow resumes on stop | 6.2 | "Follow will start again once you stop …" | Match: Stop → `on`, silently | FW6, C-FOLLOW-STOP-252 |
| Follow resumes on a playback restart | 6.2 | "… or restart playback" | Partial: Space-play (HEAD) and a strip click. A marker-flag play while playing is **not** treated as a restart (inference): SABA-Q-FOLLOW-EDIT-RESTART (b) | FW3; listed |
| A track click while playing | 6.3 "You can click anywhere within a track to move the insert marker" | 6.2 names no Follow effect | Unchanged: Follow stays as it was (inference: not a scrub area) | FW7, C-FOLLOW-LANE-252 |
| A time-ruler (min:sec) click | 6.1 item 15: "You can click and drag in the time ruler to scroll left or right." | no click action documented | CZABA: click = insert marker (SABA-Q-TIME-RULER-ROLE (a)) and pauses Follow like the beat-time ruler (b, inference) | FW2, C-FOLLOW-SECONDS-252 |
| A status message when Follow resumes | none (Live has no status line for it) | – | CZABA addition: `followResumed`, the same text as the Follow button's resume | FW3 |
| Previous/Next locator origin while stopped | 6.4: "You can jump to locators by clicking on them or by using the Previous and Next Locator buttons"; 6.3: "Adjusting the Arrangement Position fields automatically moves the insert marker" | the origin is **not stated** (inference: the play position = the insert marker while stopped) | The insert marker while stopped, the live position while playing. Live has no default keys; Ctrl+←/→ is CZABA's | IM24, C-NAV-ORIGIN-252 |
| A locator jump during playback is quantized | 6.1 item 6 | "The jump between triggered locators is quantized based on the global launch quantization value." | Deviation already listed: SABA-Q-10A-DEVIATIONS (d) | listed |
| Follow toggle shortcut | root's transcript note `reference/youtube/SABA-B-9-10-11-transcripts.md` l.35 (official video m84w 0:00–1:50): "Follow is on by default, with Ctrl/Cmd+Shift+F" (not verified in the manual text B fetched) | Live: a key toggles Follow | **CZABA: button only.** `grep -in follow app/lib/arrangement/shortcuts.ts` = 0 hits at HEAD. Listed deviation, not built this round: SABA-Q-FOLLOW-EDIT-RESTART (c), and a candidate for the 10b shortcut-sheet work | listed |
| Ruler / strip cursor, hover and visuals | 11a (round 235) reference rows | – | Unchanged this round: the bars ruler `cursor-pointer`, strip `hover:bg-foreground/8`, and the Follow button's `Follow ‖` dashed paused state (DXT3) | §6 neighbour |
| At or past the end | no reference found (the manual text fetched has no end-of-arrangement play rule) | – | D-27 refusal kept; at-end wording only | ST11, C-PASTEND-252 |

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start state:** HEAD, empty status, the frozen and root lists, and the grant start hashes (`sha256sum -c`, rc 0).
2. Implement §1 and §2.
   - Re-run the §0.2 "none" grep and apply R-NONE, reporting each hunk old → new.
   - Re-run the L50 grep: if a hunk now moves focus, STOP.
3. `npm run typecheck`, `npx biome check` on grants 1–12, and `npm run lint`.
4. **The covering set,** `b-round-251/covering-252.txt` (130 files), run **alone** (no reviewer, browser or scratch job at the same time). Report the counts and any test above 50 % of its timeout.
5. **Mutants** (on a tar scratch outside the repo; the repo `git status` is identical before and after): the 10 named in §2.3 (FW7 has none), plus FIX-CONTROL. Each must be red on the named row. Write a table to `a-round-252/mutants/summary.txt`.
6. **The code-reviewer subagent** (13 files ≥ 3). Hand on its Architecture note.
7. **Playwright, both viewports,** with the §0.2 recipe: FW1-equivalent, strip resume, stop resume, and nav origin. Save the JSON and screenshots under `a-round-252/`.
8. Write `a-round-252.md`: files, tests actually run, mutants, reviewer findings, a STOP at the top if any.

## 5. C: acceptance
Run each browser row at **1440×900 and 1280×720**, fresh context, with the §0.2 recipe (pulse, tempo 120, `=` ×4, 97.7 px/s). Wait for `Demo collection ready` first (L48).

| ID | Check | Pass |
|---|---|---|
| C-SCOPE-252 | HEAD, status, hashes | <ul><li>HEAD is `83b7c75`.</li><li>Status is exactly `M` on a subset of the 13 grants. Nothing is untracked.</li><li>The frozen (1,097) and root lists give rc 0.</li><li>The 7 protected files give rc 0.</li></ul> |
| C-UNIT-252 | Covering set alone | All green. FW1–FW7, IM22, IM24 and ST11 are present (grep the ids). |
| C-MUT-252 | ≥ 4 of A's mutants re-run by C, including MU-FW-NO-PAUSE, MU-FW-NO-RESUME, MU-NAV-LIVE-ORIGIN, and the IM22 red-proof | Each is red on its row. |
| C-FOLLOW-PAUSE-252 | Play; a lower-zone click on the visible bars ruler | <ul><li>`data-follow-mode="paused"` and text `Follow ‖`.</li><li>The status is exactly the composed text with the snapped time.</li><li>Playing continues: the playhead advances over 1.5 s.</li><li>The insert marker (`[data-insert-marker]`) equals the time in the status.</li><li>The discriminators against HEAD are `data-follow-mode` and the status. A sample showing `scrollLeft` unchanged over 1.5 s is a neighbour observation only, because it can also hold at HEAD while the playhead is on screen.</li></ul> |
| C-FOLLOW-SECONDS-252 | Play; a seconds-ruler click | The same as above. |
| C-FOLLOW-RESUME-252 | Paused by a ruler click, then a strip click while playing **about 100 px left of the viewport's right edge**, so the follow scroll is due within about 1 s at 97.7 px/s | <ul><li>`on`.</li><li>The status is `Follow is following the playback position again.`</li><li>`data-follow-mode` stays `on` for 3 s (the auto-scroll is not read back as a manual scroll).</li><li>Within 2 s, `scrollLeft` changes (follow scroll). The control is a paused Follow with no strip click: `scrollLeft` stays put. C states the samples.</li></ul> |
| C-FOLLOW-OFF-252 | Follow off (button), play; a strip click, then a lower-zone click | It stays `off` both times. The second status is the HEAD text without "Follow paused". |
| C-FOLLOW-STOP-252 | Paused, then Space | `on` and `Follow` text. The status is not a Follow text. |
| C-FOLLOW-STOPPED-252 | Stopped; a lower-zone click, then a seconds-ruler click | It stays `on`. The marker moves (HEAD behaviour). |
| C-FOLLOW-LANE-252 | Playing; a lane click | The marker moves, the status is the HEAD text, and Follow stays `on`. |
| C-FOCUS-252 | `document.activeElement` before and after each FOLLOW row | Unchanged. C re-runs the L50 grep: 32 hits at planning, all ruled out of scope; a new hit needs a ruling. |
| C-NAV-ORIGIN-252 | <ol><li>Markers at 2 and 6: ruler click at 2 + M, then ruler click at 6 + M.</li><li>Ruler click at 1, Space, wait about 3 s, Space.</li><li>Ctrl+→.</li></ol> | <ul><li>The marker at **2** is selected, and the insert marker and playhead are both 2.000.</li><li>The control at HEAD (a tar copy with `b-round-251/r252-granted-start/` restored) jumps to 6.</li><li>Then repeat Ctrl+→ (≤ 4) until the status reads `No more markers after the insert marker`.</li><li>While playing, the same at the end reads `… after the playhead`.</li></ul> |
| C-TITLES-252 | `title` of `arrangement-ruler`, `arrangement-bars-ruler` and the range body (after a range drag on a clip) | The exact new strings. |
| C-PASTEND-252 | Stopped; a strip click that snaps to the project end (C reads the end from the transport `/ end`) | `Insert marker (<end>) is at the end of the project — there is nothing to play here. Home returns to 0.` Not playing. A click past the end with Snap bypassed (Alt) keeps the HEAD past-end text. |
| C-STATUS-WIDE-252 | The composed Follow text and the at-end text at 1280×720 and 1440×900 | The status box line count and overlap with the transport are measured as in `c-round-251/c251.cjs` `statusBox`. No overlap, and it fits like the HEAD past-end text (the control, which is longer). |
| C-COPY-252 | The §0.3 grep | Only the listed keep-hits remain. |
| C-BUDGET-252 | Persistent text lines outside the timeline, empty and demo, both viewports | Equal to the round-251 counts (85/69 empty, 101/85 demo) or to a HEAD control. |
| C-LESSON-252 | `lessons.md` | L52 exists, and the file has ≤ 60 lines. |
| AN-REVIEW-252 | Doc 191 | <ul><li>l.4 byte-exact.</li><li>7 TEMPLATE headings in order.</li><li>Every cited row id exists.</li><li>The 6.2 quote matches §3.</li></ul> |
| LAB-SMOKE-252 | `/studio-lab` loads, plays and exports a WAV | No page errors. |
| Auth | `/studio/<handle>` without a session shows `Sign in required` and no `audio[src]` | As round 251. |
| Purchased origin | `/studio/$productId` purchased copy | **BLOCKED:** backend unavailable in cloud. |
| gate | full vitest, typecheck, lint, build, verify, e2e smoke | Gate rows, not claimed by C. |

**Ableton conformity** is reported separately per §3 row: confirmed / deliberate difference / unconfirmed / not applicable.

## 6. Neighbouring behaviour that could break (C probes these first)
- **Follow's own auto-scroll** while playing with no clicks. A resume must not be read back as a manual scroll and re-paused.
- **The ruler drag gestures:**
  - ↔ drag still pauses with `followPaused`, and ↕ zoom pauses;
  - a double-click still Fits or zooms;
  - a strip click while **stopped** still plays from the snapped line (BR2);
  - a strip click while playing with Follow `on` jumps and keeps playing (BR3), with no status write.
- **The playhead handle** drag and arrow keys on the seconds ruler: unchanged (`onScrub`/`onScrubEnd`, not `onSeek`).
- **Marker flags:**
  - a click selects;
  - double-click / the play button plays from the flag;
  - M adds a marker;
  - Ctrl+←/→ **while playing** steps from the live position.
- **The library line** (round 251) still names the insert marker after a ruler click.
- **Export, video sync, history labels, clip drag and trim** are unchanged. Any change there is a regression.

## 7. Next (D-29z460)
- **PASS and gate:**
  - **SABA-B-10a is done** (stages 1, 2a and 2b; rounds 249–252).
  - Closed: C-R235-02, B-R250-NAV-ORIGIN, B-R250-PLAYHEAD-TITLES, B-R251-PASTEND-AT-END, B-R236-END-WORDING and A-R251-REVIEW-IM22-PLAYING.
  - B writes the **ARCH-CHECKPOINT-TRANSPORT-POSITIONS** request for root at this 10a/10b boundary (non-blocking), at the next planning.
- **FAIL on a product row:** a fix-up on the same grants. **A STOP on item 1:** items 0 and 2–4 alone, and item 1 is re-dispatched (D-29z453 seam).
- **Then:**
  1. **REGRESSION-ROUND-2026-10-30** at the next planning, if it is on or after 2026-10-30. It carries every `scope_additions` entry, including C-CAPTION-251 and the new C-FOLLOW-252 / C-NAV-ORIGIN-252.
  2. **SABA-B-10b:**
     - the visible flashing marker (`motion-safe:`);
     - the sheet rows for Shift+Space and Ctrl/Cmd+Shift+Space;
     - the sheet `marker` copy;
     - `useArrangementInsertMarkerWriter`, when the third subscriber lands (A's round-251 note).
  3. **SABA-B-9**, then **SABA-B-11c**. **SABA-B-7** when Saba answers.
