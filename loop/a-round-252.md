# A round 252 — SABA-B-10a stage 2b + IM22 test-strength fix

**No STOP.** No covering test above 50 % of its declared timeout (slowest: CP12a–d 7.4–7.9 s of a 30 s describe timeout = 26 %; UM9 3.5 s of 20 s).

## Needs B ruling (not STOPs; implementation follows the task text)
1. **C-FOLLOW-STOP-252 vs §1.2/§1.3.** The task says the Stop resume "writes no status" and the stop status is "the text HEAD writes on stop, unchanged". Measured: Space-stop writes **no** status at all (jsdom: `statusSequence` unchanged; browser: status after stop = the previous text). So after a ruler-click pause, the line after Stop still reads `Insert marker at 00:01.250 — playback continues, Follow paused. …` while the button shows `Follow` (browser 1440 and 1280, `A_afterStop`). C's row "The status is not a Follow text" therefore fails as written for any pause → stop sequence. A did not add a status write (no spec for it). Candidate: Low (stale status), or a C-row change.
2. **C-NAV-ORIGIN-252, playing half.** "While playing, the same at the end reads `… after the playhead`" is not reachable in the browser: Ctrl+→ to the project end during playback stops playback at the end (`tick` auto-stop), so the next press is a stopped press (`… after the insert marker`). Measured both viewports (`E_playingSteps`: 2.089 → 6.098 → 16.000 with `playing: false`). The playing branch **is** reachable via Home, Space, then a fast double Ctrl+← (≤ 60 ms): `No more markers before the playhead`, `playing: true` (`nav-playing-fast-252-a.json`, both viewports). Suggested C recipe: that one. IM24 pins both: the end case (jsdom-only state, rAF stubbed) and the browser-reachable start case.
3. **IM4 collision (L23, not in B's pre-check).** IM4 (grant 4 file) asserted the HEAD playing ruler status; with Follow `on` the wrapper now writes the composed text. Updated in place to `insertMarkerWhilePlayingFollowPaused('00:08.000')` and added `data-follow-mode="paused"` (no assertion removed). Grep `insertMarkerWhilePlaying|playback continues` over `__tests__`: no other hit outside grants.

## Changed files (all 13 within grants; `git status` = 13 × `M`, nothing untracked)
| # | File | Change |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | import `studioPlaybackStrings`; new `placeInsertMarkerFromRuler` (calls `setInsertMarker` unchanged, then pause + composed status when playing and Follow `on`); `playFromRuler` resume branch (reset `autoScrollLeftRef`, `playFrom`, `on`, `followResumed`); stop effect false-branch `paused → on` silently; both `onSeek` props use the wrapper. |
| 2 | `app/components/arrangement/ArrangementMarkerRow.tsx` | `stepMarker` → `getLocatorPosition()`; "none" text by `isPlaying`; `getLivePosition` dropped from destructure (unused). |
| 3 | `app/lib/arrangement/strings.ts` | new `insertMarkerWhilePlayingFollowPaused`, `noneAfterInsertMarker`, `noneBeforeInsertMarker`; `rulerTitle`, `rangeBodyTitle`; `playPastEnd` at-end branch (formatted-string equality). |
| 4 | `__tests__/insert-marker-ui.test.tsx` | IM22 (setPosition + store > 3.5 before the playing assert); IM4 (see above); new IM24. |
| 5 | `__tests__/bars-ruler-ui.test.tsx` | new describe FW1–FW7 + 3 helpers; BR rows untouched. |
| 6–8 | `markers-ui` (MU6 l.430/439/450/456), `marker-edge-nav-ui` (EN4 l.371/375), `status-announcement-ui` (`MARKER_NEXT_NONE_TEXT`, used by SK6/SK10) | R-NONE: every hit is in a **stopped** row (no `togglePlayback` before it) → `…the playhead` → `…the insert marker`. EN l.398 (`not.toContain('No more markers')`) unchanged. |
| 9 | `__tests__/strings.test.ts` | ST17 `rulerTitle`, ST34 `rangeBodyTitle`, marker exact keys + 2, ST12 samples (+ at-end sample, + new formatter), ST11 + at-end exact text, `playPastEndMessage(16,16)`, `(15.9999995,16)` = at-end, new formatter exact text. |
| 10–12 | `clip-strings-ui` (l.103, l.244), `navigation-strings-ui` (NS4 l.343), `track-layout` (l.475) | new title literals. |
| 13 | doc 191 | l.4 = `**სტატუსი:** Completed (C round 252 PASS)`; stage-2b part in all 7 TEMPLATE sections, in order; title "stages 1–2b". |

R-NONE grep (`grep -rn "noneAfter\|noneBefore\|No more markers" app/lib/arrangement/__tests__`) re-run: hits only in grants 6–9, all stopped, none outside R. Copy sweep (§0.3) re-run → only `strings.ts` `noneAfter`/`noneBefore` remain (`a-round-252/copy-grep.txt`). L50 focus grep over grants 1–2: **32 hits** (20 + 12), unchanged from planning; no hunk moves focus (browser: `document.activeElement` BODY before/after the ruler click, `A_focusUnchanged: true`).

## Row details / deviations from B's sketch
- **IM24:** fixture m1 at 10 stays, markers 2/6 added **sorted** (`adjacentMarkerTarget` assumes sorted markers; an unsorted fixture jumped to 10). Stopped visits after the first Ctrl+→ = `[6, 10, 16]`, then `No more markers after the insert marker`. Then Home, Space, Ctrl+← → `No more markers before the playhead` (playing), then Ctrl+→ × 5 = `[2, 6, 10, 16, 16]` → `… after the playhead`.
- **FW1:** single announcement asserted with a MutationObserver on the status region: added nodes = exactly `[composed]` (batching confirmed: one render, one keyed span).
- **FW6:** stop writes nothing in both cases (text and `statusSequence` unchanged before/after Space, control without pause first) and the status is not `followResumed`.
- **FW3:** after the reviewer's Medium, also fires a scroll event with no position change after the resume and asserts Follow stays `on` (pins the `autoScrollLeftRef` reset).
- **FW7:** lane-body pointer sequence copied from `grid-snap-position` `clickLane`; status via `formatArrangementTime`.

## Tests actually run
- `npm run typecheck` rc 0; `npx biome check` on the 12 code files rc 0; `npm run lint` rc 0 (205 pre-existing warnings, 0 in touched files).
- **Covering set** `b-round-251/covering-252.txt` (130 files), run alone: **130 files / 1,956 tests passed**, 200 s (`a-round-252/covering.log`, `covering.json`). After the review fixes (FW3/FW7) and the IM24 playing-left row, the 3 affected files were re-run: 3 files / 110 tests passed (`final-touched.log`).
- **Mutants** (tar scratch `/tmp/a252-fix`, `git status` identical before/after; `a-round-252/mutants/summary.txt`, scripts `mutate252.py`/`run252.sh`):

| Mutant | Red rows |
|---|---|
| FIX-CONTROL | none (green) |
| MU-IM22-REDPROOF (MU-CAPTION-POSITION + stopped caption asserts removed) | IM22 at the playing assert: `expected '00:03.959' to be '00:03.000'` |
| MU-IM22-REDPROOF-HEAD-ROW (same, IM22 without the fix) | none — the old vacuity |
| MU-FW-NO-PAUSE | FW1, FW2, FW6, IM4 |
| MU-FW-NO-SETMARKER (wrapper step 2 deleted) | FW1, FW2, FW4, FW5 + BR4/4b/5/9/10, most IM rows |
| MU-FW-SECONDS-RAW | FW2, IM4 |
| MU-FW-NO-RESUME | FW3 |
| MU-FW-NO-AUTOSCROLL-RESET | FW3 |
| MU-FW-RESUME-ANY | FW4 |
| MU-FW-PAUSE-STOPPED | FW5 |
| MU-FW-NO-STOP-RESUME | FW6 |
| MU-NAV-LIVE-ORIGIN | IM24 (`aria-current` null on marker 2) |
| MU-NONE-PLAYHEAD-STOPPED | IM24 (stopped none text) |
| MU-NONE-INSERT-PLAYING | IM24 (playing `before the playhead`) |
| MU-PASTEND-ALWAYS-PAST | ST11 |

- **Playwright** (existing server 127.0.0.1:5173, Chromium, fresh page per block, §0.2 recipe: pulse, Add, `=` ×4 → 97.7 px/s, `data-bpm=120`), both viewports, 0 page errors. Files: `a-round-252/follow-probe-252-a.{cjs,json}`, `nav-playing-probe-252-a.json`, `nav-playing-fast-252-a.json`, screenshots `a-round-252/shots/`. First attempt: 1440 timed out waiting for `Demo collection ready` (first compile) — kept as `follow-probe-attempt1.*`.
- **Invalid row, both attempts:** `follow-probe-252-a.json` `D_stoppedLower` (x = 488 at the bars ruler's lower y) hit **`arrangement-metronome-toggle`**, not the ruler: marker unchanged (8.500 / 6.750) and the metronome turned on for the rest of that page. It is a probe aim error, not a product result. The **valid** stopped lower-zone row is `nav-playing-probe-252-a.json` `stoppedLower` (x = 1140 / 980, `elementFromPoint` = `arrangement-bars-ruler`; marker 6.500 / 4.750, Follow `on`, no Follow text). **Aiming note for C-FOLLOW-STOPPED-252:** the metronome toggle overlaps the bars ruler's lower band at x ≈ 488 at both viewports; click well right of it (e.g. 300 px left of the scroller's right edge) and confirm with `elementFromPoint`.
- Test-side copy grep (§0.3 regex, `-i`, over `app/**/__tests__`): only the intended playing literals (IM24, strings.test `noneAfter`/`noneBefore`) and the frozen MV3 test **title** (marker-flag click, not a ruler title); no frozen test pins `Click = playhead`.

| Check | 1440×900 | 1280×720 |
|---|---|---|
| Lower-zone click while playing | `paused`, `Follow ‖`, `Insert marker at 00:01.250 — playback continues, Follow paused. …`, marker 1.250, playhead +147.4 px in 1.5 s | same, +146.5 px |
| Seconds ruler click while playing | `paused`, composed text at 00:01.750 | same |
| Strip click ~100 px from right edge while paused | `on`, `Follow is following…`, `on` for all 12 samples (3 s), `scrollLeft` changed | same |
| Space stop after pause | `on`, `Follow`; status still the composed text (ruling 1) | same |
| Stopped lower-zone click (`nav-playing-probe` `stoppedLower`) / stopped seconds click (`follow-probe` `D_stoppedSeconds`) | `on`, marker moves (6.500 / 6.500), no Follow text | same (4.750 / 5.250) |
| Nav origin: markers 2, 6; ruler 1, play ~3 s, stop (3.980), Ctrl+→ | marker 2 `aria-current`, insert marker and position 2.000; then 6 → 16 → `No more markers after the insert marker` | same |
| Titles | seconds and bars ruler `Click = insert marker · …`; a range-body element also matches `click = insert marker` | same |

## Code-reviewer (subagent, actually run; score 8/10)
- **Medium — FW3 did not pin the `autoScrollLeftRef` reset.** Fixed (FW3 scroll event; MU-FW-NO-AUTOSCROLL-RESET → FW3 red).
- **Low — FW7 literal `00:0${…}`.** Fixed (`formatArrangementTime`).
- **Low — two "is playing" sources:** the wrappers read `workspaceRef.current.isPlaying` (render state) while `setInsertMarker`/`playFrom` read `isPlayingRef`; in a same-task start+click (BR14-style) Follow would not pause, and a same-task stop+click could pause with a "playback continues" text. The same split exists in `stepMarker` (origin via ref, text via React `isPlaying`). Real-browser discrete events render synchronously, so it is a harness edge. **Not fixed:** the fix needs a ref-backed getter on the frozen `ArrangementContext.tsx`, and the task prescribes `workspaceRef.current.isPlaying` / `isPlaying` of `useArrangement()`. Proposed id **A-R252-REVIEW-PLAYING-SOURCE** (Low → `deferred_low_polish`).
- **Info:** status clobber safe (FW1 one write); deps correct; the stop effect's two branches could merge (readability).
- **Architecture note (for B/root, not acted on):** the Follow state machine (ref, state, `autoScrollLeftRef`, scroll check, stop effect, ruler wrappers) keeps growing inside `StudioWorkspace.tsx`. Reviewer verdict **keep for now** (shared lifecycle with the scroller and gesture claims); proposal only: a `useTimelineFollow(scrollerRef, workspaceRef)` hook with the FW/BR rows as acceptance. Relevant to ARCH-CHECKPOINT-TRANSPORT-POSITIONS.

## A-side acceptance passed
§4 steps 1–8 done: start state verified (HEAD `83b7c75`, empty status, frozen/grant/root `sha256sum -c` rc 0); implemented §1–§2; greps re-run; typecheck/Biome/lint rc 0; covering set alone green; all named mutants + FIX-CONTROL red/green as required; code-reviewer run and its Medium addressed; Playwright both viewports. End state: frozen list rc 0, root files rc 0, 7 protected files unchanged, changed files ⊆ 13 grants. **Not claimed:** any C row, doc 191 status (claim pending C, L28), gate rows.

## Known gaps / for B
- Rulings 1–2 above (C-FOLLOW-STOP status wording; C-NAV-ORIGIN playing-at-end unreachable).
- `followPausedTitle`/`followPaused` still say "paused by manual navigation … Follow or Play resumes it"; after this round a ruler click also pauses and Stop/strip also resume. Not in the §0.3 sweep regex; copy candidate (Low).
- A-R252-REVIEW-PLAYING-SOURCE (Low, above).

## Exact next C checks
C-SCOPE-252, C-UNIT-252 (grep FW1–FW7, IM22, IM24, ST11), C-MUT-252 (rerun MU-FW-NO-PAUSE, MU-FW-NO-RESUME, MU-NAV-LIVE-ORIGIN, MU-IM22-REDPROOF from `a-round-252/mutants/mutate252.py`), C-FOLLOW-PAUSE/SECONDS/RESUME/OFF/STOP/STOPPED/LANE-252, C-FOCUS-252 (32 hits), C-NAV-ORIGIN-252 (playing half per ruling 2), C-TITLES-252, C-PASTEND-252, C-STATUS-WIDE-252 (the composed text is the longest new state), C-COPY-252, C-BUDGET-252, AN-REVIEW-252, LAB-SMOKE-252, auth guard. Probe first: Follow auto-scroll after a strip resume at the right edge (no re-pause), and BR3 (strip click while playing with Follow `on` writes no status).
