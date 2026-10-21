# A — Round 6 report

Status: A round 6 implementation finished (two sessions). Session 1 was frozen by root into checkpoint commit `c5ed47b`; session 2 worked on top of it (baseline = `c5ed47b`, nothing reverted or duplicated). Nothing here is a PASS claim; C verifies. Final sections §3–§9 are at the end of this file, after the progress log.

## 1. Pre-flight gate

**Assumptions**
- Baseline = HEAD `354e341` + uncommitted round-5 work (19 M + 4 ??, matches task §2.1). Nothing reverted; edits go on top.
- D-26: one workspace-wide pointer-gesture registry in `ArrangementContext` (`claimPointerGesture(pointerId, abort)`), layered on the existing `beginPointerGesture()` counter (kept, its nested-count test stays valid). Different pointerId → ignored; same pointerId → old gesture's own abort, then the new one starts.
- D-24a: only the interval constant changes (1000 → 600 ms) and the per-element decision moves into pure `video-sync.ts` so RF6-U can test it; the dock calls it.
- D-27: one refusal branch in `togglePlayback` for position > `projectEnd + EPS` without an active loop.
- D-28: view = context `pxPerSecond` + DOM `scrollLeft`; zoom history and Follow live in `StudioWorkspace` refs; maths in new pure `view.ts`; overview is a memoised component passed into the dock strip as a slot (dock sync loop / `<video>` untouched).

**Smallest version per item**
- S1: registry (~35 lines) + clip/brace/marquee/playhead routed through it + `refuseEditDuringGesture` on mute/solo/volume/split/delete/loop/add/drop.
- S2: constant + pure `canEscalateVideoStallAfterSeek` (~15 lines) + dock wiring (~5).
- S3: ~8 lines in `togglePlayback`.
- S4: list title markup, ghost overflow + footer reason, paste refusal string, Shift hint state.
- S5: status/TODO lines in docs 012/013/014.
- U1: `view.ts` (~150), `ArrangementOverview.tsx` (~150), ruler drag, wheel, keys, Follow, transport controls.

**Files (each inside task §2.2)**
- `app/contexts/ArrangementContext.tsx` — registry, refusals, D-27, zoom clamp.
- `app/components/arrangement/ArrangementClip.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementRuler.tsx`, `StudioWorkspace.tsx` — D-26 routing; ruler navigation; keys, wheel, Follow; footer hint.
- `app/components/arrangement/ArrangementLane.tsx` — ghost overflow, claim prop.
- `app/components/arrangement/ArrangementVideoDock.tsx` — strip layout slot for the overview + escalation interval wiring only.
- `app/components/arrangement/ArrangementTransport.tsx` — Follow/⇔/↩ Zoom/Fit, log slider.
- `app/components/arrangement/ArrangementLibrary.tsx` — C-R5-01 list titles.
- `app/lib/arrangement/video-sync.ts` — D-24a.
- new `app/lib/arrangement/view.ts`, `app/components/arrangement/ArrangementOverview.tsx`, tests, doc 015.

**Success commands:** task §9 (vitest arrangement + full, tsc, biome owned + ./app read-only, build, hash check, git status/diff, Header diff).

## 2. design-philosopher ruling (real subagent, read-only, session 2), quoted

> **(a) Overview strip — approve-with-changes.** Placing the overview where the caption used to sit is the right call: it adds an instrument without taking any room. The dock height comes from the `w-40 aspect-video` box (90 px). The left column needs 16 px caption + 4 px gap + 64 px `h-16` = 84 px, inside 90 px, so "adds no height" holds. Change: `bg-accent/40` on video bars clashes with the `bg-accent` playhead; accent should stay for live state only → `OVERVIEW_VIDEO_BAR_CLASS = 'bg-foreground/25'`. Optionally `bg-dim` instead of `bg-muted` for the third audio tier (`muted` is a text token).
>
> **(b) Follow / ⇔ / ↩ Zoom / Fit — approve-with-changes.** "Follow ‖" in accent fits the existing meaning of accent (Pause, Loop on, range delete). The risk is width: rough estimate ~1,650 px with the loop readout shown, beside a 288 px library. **I expect "one row at 1440×900" to fail.** Needs measuring. Cheapest fix: shrink Undo/Redo from `w-40` to `w-28` (they truncate and carry the full label in `title`). At 1280 the row wraps (`flex-wrap`); acceptable only if the lane area is `flex-1 min-h-0` so the extra row squeezes lanes rather than hiding the ruler or loop strip. Needs a screenshot.
>
> **(c) Library titles — approve-with-changes.** All 9 visible titles are distinct; no row uses `truncate`. Gaps: (1) the composition name is not shown as secondary text, so a bare "ბასი" has no context in "ყველა ფაილი" → add it to the secondary line. (2) ≤ 2 lines is not guaranteed: "Middle East — საჯარო preview" sits at the 2-line limit at ~112 px text width; give the previews a `shortTitle` and move "საჯარო preview" to the secondary line. "სინთეზური დემო" is still present (collection label in the tree).

Conflicts with acceptance criteria: none in (a)/(c). (b) is a measurement question against the Controls rule; see §3/§9 for the measured result.

## Progress log
- Orientation done (task, plan D-24a/26/27/28, c-round-5, a-round-5, root-pre-push-review, primitives, prompts, all touched source files). design-philosopher launched (read-only).
- R26-U written first: `gesture-guard.test.tsx` (7 tests). Run on unchanged round-5 code: **7 failed (7)** (`%TEMP%/a6-guard-before.txt`: impact 9≠8, loop 14–16, aria-pressed true, 3 clips, stale 4≠2, brace stale, ghost cleared → undefined).
- S1 done: `claimPointerGesture(pointerId, abort)` registry in context (on top of the `beginPointerGesture` counter); clip, brace, marquee, playhead handle route through it; Ctrl/Shift toggles checked after the claim; refusals added to mute/solo/volume/split/delete/loop/add/drop. 7/7 + gesture-reentry 14/14 pass. gesture-reentry harness line 91 changed `beginPointerGesture` → `claimPointerGesture` prop (contract change D-26).
- S2 done: `VIDEO_STALL_ESCALATION_INTERVAL_MS` 1000 → 600; decision moved to pure `canEscalateAfterSeeked` in video-sync.ts; dock calls it. +3 RF6-U tests (persistent-lag simulation would fail with 1000: counted 700 > 450).
- S3 done: `togglePlayback` refusal past end (+ `playPastEndMessage`); natural end-stop overshoot (> 0.05 s rAF stall) still restarts from 0 via `playbackEndedAtRef`. +3 R27-U tests.
- C-R5-04 done (+ test R6-P1). Arrangement suite 16 files 261/261, tsc 0.
- S4 done: C-R5-01 optional `shortTitle` (types, demo data: stems + mix) shown as list primary, wraps (no truncate); C-R5-03 ghost `overflow-hidden`, label at the bottom of the ghost box, refusal reason moved to the footer drag-hint line (accent); R6-H1 `ClipLaneDragState.timeLocked` → footer `Shift — დრო ჩაიკეტება…` / `…ჩაკეტილია…`; C-R5-04 message with `{time}-დან`.
- S5 docs done (012 status + TODO lines 126–128; 013 status + TODO; 014 status + TODO). Line-ending note: python edits had written CRLF; restored LF (biome --write on owned paths; docs via sed). git numstat shows only real changes.
- design-philosopher ruling received (quoted in §2).
- (session 2, after root checkpoint commit `c5ed47b`, which is now the baseline; nothing reverted) Applied `checkpoint-r6-review.md` findings: #1 overview exempt from the focused-slider rule for +/−/Z/X/Space; #2 registry safety net (window capture pointerup/pointercancel for the active pointerId → deferred abort if still active; window blur → abort; forced release after abort) + `onLostPointerCapture` on ruler and overview; #3 waveform columns capped at 4096 (memo key stable above the cap); #4 `pendingViewRef` (getTimelineView returns the requested view until the layout effect applies it; slider uses it as base); #5 Follow ignores a leftward browser clamp at max scroll; #7 playhead handle requires `buttons !== 0`; #8 overview double-click ignored 300 ms after a drag; #9 Ctrl+wheel screenX clamped ≥ 0; #12 D-27 refusal before `ensureAudioContext`. Left: #6 (stale scrub commits its position — C decides), #7 marquee has no buttons check (a lane-background press starts nothing destructive; adding it risks R6-S2 scripts), #10 commitTrackVolume (no data loss). +5 tests (3 gesture-guard, 2 view). Arrangement 296, full vitest 760/760, tsc 0, biome owned 0, build OK, hashes OK.
- design-philosopher re-run (session-1 quote was not saved): ruling in §2; applied (a) video bars `bg-foreground/25`, third audio tier `bg-dim`; (c)1 context line (collection label) under short titles; (b) and (c)2 to be measured in the browser.
- U1 code done: `view.ts` (+ `timelineNavigationKey`), `ArrangementOverview.tsx` (memo, imperative frame/playhead, claims a gesture), ruler navigation (seek on release, pan/zoom drag, dblclick Z/Fit), StudioWorkspace (applyView + layout-effect scroll, zoom history, Follow on/paused/off, Ctrl+wheel native non-passive, +/−/Z/X), transport controls, dock strip slot, footer hint. Arrangement suite green, tsc 0, biome owned 0. NEXT: browser checks, full gates, code-reviewer, doc 015, report.
- Session-2 browser (gstack, state `a-browse.json`, harness `%TEMP%/a6b`, synthetic pointers with `buttons: 1`), 1440×900 unless noted:
  - R26-1 (a) cross-lane, (b) same-lane, (c) Mute: second action changed nothing (impact 8, `aria-pressed=false`, Mute → `GESTURE_EDIT_BLOCKED_MESSAGE`); ghost + Shift hint kept until pointer 7 released; one entry from the first gesture; Ctrl+Z / Ctrl+Shift+Z then worked.
  - R26-2: Volume input → value stays 1 + blocked status; Solo refused; ＋, Enter, synthetic drop refused (clips 2); Play during the drag played (0.142 s) and the drag continued (music → 3, one `კლიპის გადატანა`).
  - R26-3: clip-stale and brace-stale (pointer 7): stale preview reverted, no entry; new clip drag → impact 9, one entry; undo back to 8.
  - Blur safety net: mid-drag `window.dispatchEvent(new Event('blur'))` → clip reverted (3 → 2), no entry, Mute works afterwards.
  - R27-1: impact 0–2, seek 5, Space → not playing, 5.000, D-27 status; Ctrl+V → pasted at 00:05.000. Natural end (2.000) → Space restarts from 0. Seek 1 → plays from 1. Loop 3–4 with end 2, seek 3.5, Space → playing, 3.949 after 1.5 s (wrap; D-17 unchanged).
  - R6-L1 (1440 and 1280, library 288 px): "ყველა ფაილი" 9 titles, 9 distinct, 0 with scrollWidth > clientWidth, max 2 lines (the two public previews are exactly 2 lines); სტემები 4/4 one line. Shots `a-r6-list-1280.png`, `a-r6-list-1440.png`.
  - R6-G1 (1280×720): amber ghost on video lane (00:04.000) and occupied music lane (00:08.000): labels inside the ghost box, no intersection with clip titles; footer hint shows `აუდიო ვიდეოხაზზე არ გადადის · …` / `აქ ადგილი არ არის · …`, one line. Shot `a-r6-ghost-amber-1280.png`.
  - R6-H1: not held → `Shift — დრო ჩაიკეტება, შეიცვლება მხოლოდ ხაზი`; held → `Shift — დრო ჩაკეტილია, იცვლება მხოლოდ ხაზი`; one line.
  - R6-P1: music clip copied, video lane active, seek 40, Ctrl+V → status contains `00:40.000-დან`, arrangement + history unchanged.
  - Transport at 1440 wrapped (design ruling (b) was right). Fix: loop readout (`arrangement-loop-times`, same text) moved into the loop-strip header cell; tool buttons px-3 → px-2.5, gaps 2 → 1.5, Undo/Redo w-40 → w-28, Follow w-20 → w-16. Now one row at 1440 with loop on/off (slack ≈ 19 px); loop cell fits "… · off" (202 ≤ 223 px).
  - RF6-1 own runs (`%TEMP%/a6b/esc6.js`, adapted from C's `esc.js`; R3-V1 with clip-4s moved to 6.008 for a continuous video; real rate held 0.7 with writes ignored, injected ~0.4 s, held 5.2 s, then 1.5 s recovery): 3 runs × 6 escalations; escalation − previous `seeked` = 0.64–0.90 s (min 640 ms ≥ 600); episode counted time (|d| > 0.12 crossing → escalation, from the d trace) ≈ 260–350 ms, first episode 301–331 ms (≤ 450); 0 `currentTime` writes while seeking; hard seeks ≥ 899 ms apart. After release: run 1 0 further escalations, |d| ≤ 0.1 within ~0.16 s; runs 2 and 3: **one escalation 139–160 ms after release** (the release fell inside an episode already counting at d ≈ −0.17), then |d| ≤ 0.1 by +0.4 s. The recovery window crosses the clip boundary at 6.0 s (fixture is 6 s), so recovery after 6.0 was not measured. Raw: `%TEMP%/a6b/run_esc{1,2,3}.json`.
  - RF6-2 own drift runs (C's light `rf5.js` + `rf5an.js`, R3-V1, 13 s): A6L_1 (analysis lost — browse server restarted; res median 0.0093, max 0.047, 0 hard seeks), A6L_2 PASS (0.012/0.0196), A6L_3 INVALID (stall cover 12.6 %, 1 escalation, raw max 0.61), A6L_4 FAIL (max 0.1209, app LoAF 126 ms with 110 ms in ArrangementContext rAF). **Finding:** round 5 had 0 app LoAFs in 16 runs; the new per-frame Follow check read `scrollLeft`/`clientWidth` (forced layout) every playback frame. Fixed: Follow uses cached scrollLeft (scroll events) and viewport width (ResizeObserver). After the fix: A6L_5 INVALID (cover 14.6 %, stall-excluded max 0.0758, app LoAF 27 ms), A6L_6 PASS, A6L_7 PASS (0 app LoAF). Machine busy (Brave, ChatGPT, Teams, Edge WebView). Not the full RF6-2 set; C runs it.
  - R10-N1 (1440, project 101 s, stopped): ruler drag up 100 px at 10 s → 40 → 78.28 px/s, anchor error −0.19 px; horizontal drag 120 px → anchor error 0.00 px; no seek and no history after either drag. Click (2 px) at 20 s → seek on release only (position unchanged after pointerdown), 20.000, not playing. While playing: click at 20 → playing, 20.55 after 0.6 s; Follow stays on.
  - R10-N2: Ctrl+wheel up/down over the music lane at 8 s → anchor −0.06 / 0.00 px, `defaultPrevented` true. Plain and Shift wheel `defaultPrevented` **true before the fix** (root Lenis), **false after** `data-lenis-prevent`. `+`/`−` at a visible playhead (6 s) → 0.42 / 0.00 px; with a range present the anchor is the range centre (as specified). Range 10–12 → Z → fraction 0.600, centre error 0.40 px; X → zoom and scrollLeft exactly restored; X again → status `Zoom-ის ისტორია ცარიელია…`, unchanged, button disabled with a reason title. `Z X + −` typed with real `$B press` in the library search → value `zx+-`, view unchanged.
  - R10-N3: frame width = visible/extent exactly (110.61 / 110.61 px) and left exact; click at 60 s outside the frame → centre 60.002 s (0.13 px); `aria-valuenow` 0 → 54; `+` right after the overview click (overview focused) zooms 78 → 98 (review #1 fix); horizontal drag 30 px → start +3.181 s = 30/width × extent; vertical drag up 60 px → 78 → 115 px/s; double-click → Fit (frame = whole overview, status Fit); focused → pans 5 s (10.19 → 15.19), selected SFX clip not nudged (3 → 3), `aria-valuenow` 15.
  - R10-N4: 224.85 px/s (4.08 s visible), Play from 0 → at 5.10 s scrollLeft 589, playhead visible; manual scroll → `Follow ‖`, `aria-pressed=false`, accent class, status message; view unchanged for 2.5 s; Follow button → on; follows again (playhead visible); manual scroll → paused; Pause + Play → on; Follow off → view never moved, playhead ran out of view; positions monotone. Clip header drag held across the edge time (3.98 s; released at 4.82 s): scrollLeft 0 for all 44 samples during the drag, clip landed at the pointer (error −0.08 px), one entry; after release Follow scrolled (784) with mode on.
  - R10-N5 (1280×720): two Ctrl+D → end 05:04.056; Fit → 2.4798 px/s, extent 754 px ≤ viewport 758 − 4, scrollLeft 0, horizontal overflow 92 px (the 30 s tail), 11 visible labels, min gap 74.4 px, 0 overlaps; one more Ctrl+D → overview extent 304.056 → 405.408; total 21:57.576 → Fit 0.5723 px/s (≥ ZOOM_MIN), readout `0.6 px/წმ`, labels min gap 68.7 px, 0 overlaps, 137 ms, no error.
  - R10-N7 (22-min project, harder than the 4-min case): Fit, slider to max (320), 3× −, 3× +, Fit: worst LoAF 192 ms (the jump Fit → 320), others 59–72 ms, **0 ms attributed to app script** in all; visible waveforms drawn at Fit (15/16, the 16th is a 1-px clip) and at max (2/2).
  - R10-N6 (R3-V1, loop off, 12.3 s): control vs 10 navigation actions (+, −, Ctrl+wheel ×2, ruler drag, Fit, X, +, Fit, X): starts 4 / 4, stops 1 / 1, 0 start/stop within ±50 ms of an action, |d| max 0.0252 (control) / 0.0663 (nav), light harness with 300 ms boundary exclusions, position monotone, same `<video>` nodes, 0 writes while seeking, 0 hard seeks.
  - R10-N8: 1440×900 dock 1152×107, video box 160×90, overview 956×64 left of the video, inside the dock, no overlap; transport one row (height 49); 4 lanes + ruler visible; hint 1 line; `Follow ‖` fits. 1280×720: same dock height, transport wraps (87 px), 4 lanes + ruler + loop strip visible. 1280 collapsed library: overview 1044 px wide, same. Shots `a-r6-nav-1440.png`, `a-r6-nav-1280.png`, `a-r6-nav-1280-collapsed.png`.
  - R4-B3 (after the transport change, loop off): `↻ Loop` box `837.5,43,70.2,32` and loop-times box `296,218.5,201.5,16` identical in none / one clip / range / 2 clips.
  - G6-3 sanity (anonymous): requests = 2 demo MP3s, fonts, GA (consent denied, `pscdl=denied`), root `GET localhost:5199/api/cart`; no studio-token / recording / download / R2, no Authorization header. `curl GET /api/studio-token` → 400 here (C used its own method and got 401 in round 5; not re-judged by A).

## 3. Files changed (task §2.2 subset)

Round 6 total vs `354e341` (incl. round-5 files, committed in `c5ed47b`): 32 files. Session 2 vs `c5ed47b` (uncommitted, 11 files):
- `app/contexts/ArrangementContext.tsx` — registry safety net (window capture pointerup/pointercancel + blur, forced release, try/finally), D-27 check before `ensureAudioContext`.
- `app/components/arrangement/StudioWorkspace.tsx` — overview key exemption (`data-timeline-overview`), `pendingViewRef`, cached Follow inputs, Follow clamp exemption, Ctrl+wheel clamp, loop readout in the loop-strip header, `data-lenis-prevent`.
- `app/components/arrangement/ArrangementTransport.tsx` — compact row, loop readout removed from the row.
- `app/components/arrangement/ArrangementOverview.tsx` — lost capture, dblclick-after-drag guard, bar tokens, `data-timeline-overview`.
- `app/components/arrangement/ArrangementRuler.tsx` — lost capture on the ruler, playhead `buttons === 0`.
- `app/components/arrangement/ArrangementClip.tsx` — waveform column cap 4096.
- `app/components/arrangement/ArrangementLibrary.tsx` — context line under short titles.
- Tests: `gesture-guard.test.tsx` (+3), `view.test.ts` (+2), `ArrangementContext.test.ts` (+1).
- `docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md` — full doc (was a root stub).
- Outside the repo: this report, `a-browse.json`, shots `a-r6-list-{1280,1440}.png`, `a-r6-ghost-amber-1280.png`, `a-r6-nav-{1440,1280,1280-collapsed}.png`.

No round-5 file reverted. `ArrangementVideoDock.tsx` untouched in session 2. `Header.tsx`: `git diff HEAD` and `git diff 354e341` both empty; vs `cc1e531` +21/−0. No `app/styles`, `root.tsx`, `routes/`, `public`, `package.json` change.

## 4. Command tails (session 2, final run)

```
npx vitest run app/lib/arrangement   → Test Files 17 passed (17) · Tests 297 passed (297)
npx vitest run                       → Test Files 49 passed (49) · Tests 761 passed (761)
npx tsc --noEmit                     → exit 0
npx biome check <owned paths>        → Checked 49 files in 156ms. No fixes applied. (exit 0)
npx biome check ./app                → Checked 313 files in 463ms. No fixes applied. Found 218 warnings. Found 1 info. (0 errors, exit 0)
npm run build                        → ✓ built in 1.93s (exit 0)
protected hashes                     → download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK
git status --short                   → M ArrangementClip, ArrangementLibrary, ArrangementOverview, ArrangementRuler, ArrangementTransport, StudioWorkspace, ArrangementContext, __tests__/ArrangementContext.test.ts, gesture-guard.test.tsx, view.test.ts, docs/…/015 (11 files vs c5ed47b; 443+/59−)
git diff HEAD -- Header.tsx          → (empty)
```

`--write` was run only on the 9 owned files I edited; no `npm run check`, no `npm run format`.

Session 3 (fresh session after the context-watch restart, 2026-10-09; no source edits, re-verification only): `npx vitest run` → 49 files / 761 passed; `npx tsc --noEmit` exit 0; biome owned → 49 files, no fixes; biome `./app` → 313 files, 218 warnings, 1 info, 0 errors; `npm run build` → ✓ built in 2.78s; protected hashes 4× OK; `git diff HEAD` and `git diff 354e341` on `Header.tsx` empty; `git diff --stat` = the same 11 files, 443+/59−.

## 5. Tests

Changed contracts (session 1, unchanged since):
- `gesture-reentry.test.tsx` harness line (`beginPointerGesture` → `claimPointerGesture`, D-26);
- `video-sync.test.ts` interval 1.0 → 0.6 s (D-24a);
- `ArrangementContext.test.ts` zoom clamp 20–200 → 0.5–320 (D-28) and the lane-kind paste message (R6-P1).

New (session 1): `gesture-guard.test.tsx` 8 (R26-U; 7 ran FAIL on round-5 code: `%TEMP%/a6-guard-before.txt`), `view.test.ts` maths + keys + ruler/overview components (R10-U incl. render count), D-24a 3 (RF6-U), D-27 3 (R27-U).

New (session 2):
- `gesture-guard`: (1) pointerup reaching only the window ends the gesture (revert, count 0) and a new pointer works; (2) window blur ends a gesture without an entry; (3) a gesture that got its own pointerup is not aborted by the deferred check. The old registry had no window listeners, so (1) and (2) would fail (the gesture stays claimed, `isPointerGestureActive()` stays true, the next pointer is refused); (3) guards against false aborts.
- `view.test`: ruler lost capture ends navigation without a seek; overview lost capture ends the drag, and a double-click right after a drag does not Fit (old code: no handler, the gesture stays active; dblclick → Fit).
- `ArrangementContext.test`: a refused Play creates no AudioContext (the old order created one first; `ensureAudioContext` is only called from Play paths, so `before` is 0).

Not unit-tested (browser-verified only): `pendingViewRef`, Follow cached inputs and clamp exemption, the overview key exemption, `data-lenis-prevent`, the library context line.

## 6. Reviews

- Root's `checkpoint-r6-review.md` (7.5/10): handled #1, #2, #3, #4, #5, #7 (playhead), #8, #9, #12; left #6, #7 (marquee), #10 with reasons (§8, §9, doc 015 TODO).
- Real `code-reviewer` subagent on the session-2 diff, summary quoted: *"The registry, Follow caching, `pendingViewRef` and the lostpointercapture handling are correct. I found no ordering bug, no listener leak, no harmful timeout after unmount, and no case where the safety net ends a legitimate gesture. … The two Medium issues are presentation and maintainability problems, not logic bugs: the loop readout hides '· off', and keyboard behaviour depends on a `data-testid`. … Score: 8.5/10."*
  - M1 loop readout "· off": measured in the browser it fits (scrollWidth 223 = clientWidth 223 with `tracking-tight`); I added a `title` with the full text anyway.
  - M2: overview detection now uses `data-timeline-overview`; browser-verified (`+`/`−` on the focused overview).
  - L1: `lastScrollLeftRef` is synced after direct scroll writes. L2: `try/finally` around abort + release. L5: added the D-27 AudioContext test; the rest are listed as not unit-tested (§5). L3 (theoretical re-entrant claim) and L4 (blur semantics) are recorded in doc 015 and here.
- design-philosopher: §2.

## 7. Constants and own runs

- **Navigation:** `ZOOM_MIN` 0.5, `ZOOM_MAX` 320, default 40 px/s; wheel ×1.15; step ×1.25; drag threshold 4 px, vertical dead zone 6 px, zoom `exp(−lift/140)`; Fit padding 4 px; range fill 0.6; min extent 10 s; Follow edge 24 px, Follow target 1/3; overview pan 5 s; slider 1000 log steps; ruler steps {0.5 … 600} s with ≥ 40 px (56 px for fractional labels); dblclick-after-drag 300 ms (ruler and overview); waveform cap 4096 columns.
- **D-24a interval:** 600 ms.
- **Escalation:** 3 forced runs, 18 escalations; minimum gap from the previous `seeked` 0.64 s; worst counted episode ≈ 350 ms; 18 hard seeks (min spacing 899 ms); 0 writes while seeking. In 2/3 runs one escalation came 139–160 ms after the forcing stopped (see progress log).
- **Drift:** 7 R3-V1 runs. Worst: A6L_3 (INVALID, raw max 0.61, 1 escalation) and A6L_4 (FAIL by 0.0009 over 0.12, before the Follow layout fix).

## 8. Deviations

1. The overview is exempt from "ignored on focused sliders" for `+ − Z X Space`. It is itself a navigation control; otherwise shortcuts die after every overview click (root review #1).
2. The loop readout `arrangement-loop-times` moved from the transport into the loop-strip header cell (same text and test id), so the transport is one row at 1440×900. Design ruling (b) predicted the wrap; R4-B3 re-checked.
3. The playhead handle now ignores `pointerdown` with `buttons === 0` (round-5 deviation 1 applied to the last gesture start). Old R4-P1 scripts must send `buttons: 1`. The lane-background marquee still has no such check: it starts no edit, and changing it risks the R6-S2 scripts.
4. The registry ends the active gesture on window `blur` (clip/brace revert, a scrub keeps its position, ruler/overview keep the last frame). Any harness action that blurs the page ends the active gesture with no history entry.
5. `data-lenis-prevent` on the workspace root. Not named in the task, but required for NAV-07, because the protected `root.tsx` installs Lenis, which calls `preventDefault` on every vertical wheel event.
6. Follow's per-frame check uses cached scroll and viewport values (a performance fix found in A's drift runs).
7. The window safety net acts only after the component had its chance (0 ms timeout), so C's scripts that send their own pointerup keep their round-5 behaviour.
8. Design ruling (c)2 (short titles for the two public previews) not applied: R6-L1 passes as is (they are exactly 2 lines at 288 px), so the full titles stay.

## 9. Not ready / not verified by A (per item)

- **S1:** none known. R26-1/2/3 and R26-U checked by A as above. Real touch (two physical pointers) not available.
- **S2:**
  - **RF6-1:** needs C's judgement on the 2/3 runs with an escalation 139–160 ms after the forcing stopped. Recovery could not be observed past 6.0 s with the 6 s fixture.
  - **RF6-2:** only 7 R3-V1 runs by A (3 PASS / 2 INVALID / 1 FAIL before the fix / 1 lost). R2-V3, RF5-2 loop and RF5-3 not run by A. Tech Lead quiet-Chrome items carried.
- **S3:** none known (R27-1, R27-U).
- **S4:** none known (R6-L1, R6-G1, R6-P1, R6-H1).
- **S5:** none known. Root M3, doc 012 lines checked: 4 (status), 122 (smoke line), 126–127 (TODO: RF3-1 counts; R5-L3/L5/E1/R6-S2/R6-S3 PASS in C round 3).
- **SRW-10:** none known from A's runs (R10-N1..N8, R10-U). Real mouse, real Ctrl+wheel, trackpad pinch and real wheel scrolling after the Lenis fix are Tech Lead items.
- **Gates:** G6-1 and G6-2 pass in A's run; G6-3 only a sanity pass; **G6-R not run by A** (C's regression list).

**C/B follow-up (incl. root reviews):**
- Lenis on `/studio-lab`: the root.tsx smooth scroll intercepted wheel events in the real app; fixed locally with `data-lenis-prevent`. Root/B may want the same check for the purchased Studio (`/studio/*`, protected, not touched).
- `root-pre-push-review.md` (round 3):
  - its commit-scope finding is resolved (4 protected hashes OK, none dirty);
  - its doc-012 correction (root M3) is in place (lines above);
  - its RF3-1, RF3-2 and R5-L6 items are superseded by D-19/D-24 and C round 5 (RF5-1..3 PASS);
  - the RF3-2 and R5-L6 real-Chrome checks stay with the Tech Lead.
- Open low items:
  - a stale scrub keeps its position on abort (#6);
  - the marquee has no `buttons` check;
  - `commitTrackVolume` is unguarded (no data loss);
  - the component-level `watchUncapturedPointerGesture` could be consolidated into the registry (the reviewer's alternative, separate ticket).
- Exact next C checks: task §11 in order, plus:
  - (a) wheel over the timeline and library is not `defaultPrevented` (Lenis fix);
  - (b) `+` after an overview click;
  - (c) the loop readout in the loop-strip header (on/off text, R4-B3);
  - (d) the transport is one row at 1440 with a loop present;
  - (e) RF6-1 with a longer video fixture, if one is available.
