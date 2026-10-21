# CURRENT TASK — Round 6: round-5 bugs first (C-R5-01..05, the D-24 escalation interval), then SRW-10 navigation (FB-01)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-08
Previous task: `tmp/studio-real-loop/tasks/round-5.md`. C's verdict: **PASS for every round-5 acceptance ID**, plus 1 Medium and 4 Low bugs (`c-round-5.md`, `c-round-5.json`). B's decision record: `b-round-5.md`.
Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **D-24a, D-26, D-27 and D-28 are new and binding.**
Backlog: `tmp/studio-real-loop/backlog.json` (v6) → `C-R5-02`, `B-R5-01`, `C-R5-05`, `C-R5-01`, `C-R5-03`, `C-R5-04`, then `SRW-10`.
Working dir for all paths: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Baseline at dispatch.** HEAD `354e341`, plus the uncommitted round-5 work that C verified (19 M + 4 ??, listed in §2.1). If root commits the round-5 files before you start, HEAD is the baseline. **Either way, do not revert, re-create or reformat any round-5 file.** Edit on top of it. Nobody commits in this round; root makes the final commit after everything is done.

## 0. Two tracks, in this order

Finish Track S before Track U. Report "not ready" IDs **per item**. C verifies Track S first.

**Track S — bugs (bugs first)**
1. **S1 — C-R5-02 (Medium):** a second pointer's edit is silently reverted by the first gesture. D-26 (§3).
2. **S2 — B-R5-01:** the D-24 escalation interval contradicts RF5-1b under persistent lag (C §2 RF5-1b). D-24a (§4).
3. **S3 — C-R5-05 (Low, product decision):** Play past `projectEnd` jumps to 0 and loses the insert position. D-27 (§5).
4. **S4 — Low UI bugs (§6):** C-R5-01 (library list titles indistinguishable), C-R5-03 (lane-ghost label paints over clips), C-R5-04 (lane-kind paste refusal has no time), and C's Shift-hint wording note.
5. **S5 — docs honesty (§6.5):** doc 014 status to C's round-5 result; root M3 check of doc 012.

**Track U — next dependency-ordered scope**
6. **U1 — SRW-10 (FB-01 navigation):** anchored zoom (ruler drag, Ctrl+wheel, +/−), Z/X zoom history, overview, Follow, Fit. D-28 (§7).

If an item is not finished, list its acceptance IDs under "not ready" for that item. C fails those IDs and B carries them over. Do not fake or soften behaviour.

**Not this round (no UI for these):** detail panel, track height/fold, floating video (SRW-11B, next round); gain/pan/master/meters (SRW-13); grid/snap/tempo/metronome (SRW-14/15); markers (SRW-16); track groups (SRW-17); fades/envelopes (SRW-18); video opacity fade (SRW-19); range/MP3 export (SRW-20); purchased mount (SRW-21); T12 Gain/Volume. Out of scope for the whole project: plugins/effects, pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md`, then: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`. Prompts `studio-feature.md`, `new-component.md` (ArrangementOverview), `new-test.md`; skill `pre-flight`. Where a primitive example is stale, the code and this task win.
2. Read for behaviour only (do not copy code):
   - `c-round-5.md` §2 (RF5-1b note), §5 (C-R5-01..05, with steps) and C's scripts under `c-round-5/scripts/` (escalation diagnostic `esc.js`, the second-pointer runs).
   - Prototype `../output/studio-workspace-prototype/workspace.js`: navigation state (lines ~110–125), `renderOverview` (~1865), `updateFollow`/`zoomToSelection`/`changeZoom`/`setView`/`stepZoom`/`beginNavigation`/`applyNavigation`/`endNavigation` (~2135–2345), the Fit/Follow/scroll/wheel/overview/dblclick/zoomBack handlers (~2775–2890), the `+`/`−`/`Z`/`X` keymap (~3315–3355), Follow scrolling in `frame` (~3451). Layout in `index.html` lines 8 and 18 (overview sits in the strip left of the video box).
   - `../docs/technical/ableton-live-current-workflow.md` rows NAV-01..NAV-07 and TRN-05.
3. **Design check (narrow).** Invoke the real `design-philosopher` subagent read-only on (a) the overview placement and look inside the existing dock strip, (b) where the Follow/Fit/⇔/↩ controls go in the transport row, (c) the C-R5-01 list-title fix. Quote its ruling. Where it conflicts with an acceptance criterion here, the criterion wins and you record the conflict.
4. Read every file you change.
5. Post the **pre-flight gate** at the top of your report: assumptions, the smallest version per item, each file with its reason, the commands that prove success.

## 2. File ownership (exact; nothing else may change)

### 2.1 Baseline at dispatch (round-5 work, keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementExportDialog,ArrangementLane,ArrangementLibrary,ArrangementLibraryPreview,ArrangementLoopBrace,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/data/studio-lab-demo.ts
 M app/lib/arrangement/__tests__/{ArrangementContext,peaks,selection,video-sync}.test.ts
 M app/lib/arrangement/{model,peaks,selection,video-sync}.ts
 M docs/implementation/2026/quarter-IV/013-studio-lab-sync-library.md
?? app/lib/arrangement/__tests__/{clipboard.test.ts,gesture-reentry.test.tsx}
?? app/lib/arrangement/clipboard.ts
?? docs/implementation/2026/quarter-IV/014-studio-lab-edit-clipboard.md
```

`app/components/layout/Header.tsx` is **frozen**: it must stay byte-identical to HEAD `354e341` (C diffs it; `git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 2.2 May modify / create this round

**Modify:**
- `app/types/arrangement.ts` — new fields only if optional (SRW-21 adapter contract). No new field is expected.
- `app/lib/arrangement/model.ts`, `selection.ts`, `clipboard.ts`, `video-sync.ts`, `library.ts`, `peaks.ts`, `transport.ts`
- `app/lib/arrangement/__tests__/*.test.ts` and `*.test.tsx`. Existing tests may change only where §3–§7 change their contract; name each one with a reason.
- `app/contexts/ArrangementContext.tsx`
- `app/components/arrangement/*` (every existing file). `ArrangementVideoDock.tsx`: only the strip layout (to host the overview) and the escalation interval wiring; its sync loop logic, its two `<video>` elements and their mount must stay as they are.
- `app/data/studio-lab-demo.ts` (only for the C-R5-01 visible title, if you choose that route)
- `docs/implementation/2026/quarter-IV/012-studio-lab-loop-multiselect.md`, `013-studio-lab-sync-library.md`, `014-studio-lab-edit-clipboard.md` (status/TODO lines only, §6.5)

**Create:**

| File | Responsibility |
| --- | --- |
| `app/lib/arrangement/view.ts` + `__tests__/view.test.ts` | Pure navigation maths (§7): zoom clamp, fit zoom, anchored scroll, step zoom anchor, zoom-to-range, zoom history push/pop, overview time↔px mapping and frame, Follow scroll decision, ruler tick step. No DOM. |
| `app/components/arrangement/ArrangementOverview.tsx` | The overview strip (§7). |
| `app/lib/arrangement/__tests__/gesture-guard.test.tsx` (optional name) | D-26 component tests (§3). You may put them in `gesture-reentry.test.tsx` instead. |
| `docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md` | Per `.claude/rules/implementation-docs.md` + `docs/implementation/TEMPLATE.md`, Georgian. If 015 is taken, use the next free number. |
| `../tmp/studio-real-loop/a-round-6.md` | Your report (§10). |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state. |

**Read-only imports allowed:** `~/lib/sfx-edit` (`encodeSfxWav`), `~/lib/sfx-video.client` (`seekSfxVideo`), `~/components/ui`, `~/lib/utils`, `@remix-run/react`.
**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`, `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`
- `root.tsx`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`)
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`
- `package.json`, lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap

**Also not allowed:** new dependencies or installs; deleting files or tests; git commit, push or deploy; reverting round-5 work.

## 3. S1 — C-R5-02: one edit gesture at a time, workspace-wide (D-26)

**What C found.** D-23 guards re-entry per component only. While pointer 7 drags the music clip header (same lane or cross-lane), a second pointer (touch id 21) can drag another clip and release, or click a lane **M**. That edit commits (history entry `კლიპის გადატანა` or `Mute — SFX`). The first gesture's next preview/commit is rebuilt from its `gesture.before` and silently reverts it (impact back at 8, mute back to false); the history keeps the lost entry. The second gesture's release also clears the first gesture's lane ghost and Shift hint (`setClipLaneDrag(null)`). A's report §10 lists the same gap; code-reviewer #7 (mute/solo mid-gesture) is the same bug.

**D-26 (binding).** While any pointer gesture is active (`isPointerGestureActive()`: clip move/trim/range, cross-lane, brace, marquee, playhead scrub, ruler navigation from §7):
1. **No second gesture.** A `pointerdown` whose `pointerId` differs from the active gesture's on **any** clip part, the loop brace, a lane background (marquee), the ruler or the playhead handle is ignored: no gesture, no `beginPointerGesture()`, no selection change, no seek, no side effect on the first gesture.
2. **Stale pointer, workspace-wide.** A `pointerdown` with the **same** `pointerId` as an active gesture, on any of those targets, proves the old gesture lost its pointerup. End that old gesture first (its own abort path: revert its preview, call its `release()`, write no history, clear its ghost/hint), then handle the new pointerdown normally. A clip, brace or lane must never become permanently un-draggable. This extends D-23 rule 1 from one component to the workspace (it needs a small context registry of the active gesture's `pointerId` + abort callback; mechanism is yours).
3. **Commands that change the arrangement are refused** with `GESTURE_EDIT_BLOCKED_MESSAGE` and change nothing (no history entry): track Mute, Solo, Volume (the `input[type=range]` must snap back to the stored value; it is not a gesture, so it needs its own guard), the transport/edit buttons (split, delete, loop, duplicate, undo/redo — keys are already guarded), library add (＋, Enter, double-click) and library drop onto a lane. Video import that finishes mid-gesture keeps its existing wait-for-preview behaviour. Not refused: Play/Pause, preview of a library sound, scrolling, the export dialog opening.
4. Every gesture's ghost/hint state is owned by that gesture: no other gesture's release may clear it.

Consequence (intended, not a bug): Mute/Solo/Volume and the other refused commands are also refused during a playhead scrub, a marquee and a ruler navigation drag, because those are pointer gestures too.

**Acceptance (C):**
- **R26-1 (browser, C's three repros).** (a) pointer 7 cross-lane drag of music 2–6, pointer 21 drags impact @8 by +1 s and releases, then pointer 7 moves and releases; (b) the same with a same-lane drag; (c) pointer 7 drag, then a click on the SFX lane **M**, then release 7. Each: the second action changes nothing (impact stays at 8, `aria-pressed` stays false, no history entry from it), the status shows `GESTURE_EDIT_BLOCKED_MESSAGE` for (c); the first gesture's ghost and Shift hint stay visible until its own release; exactly one history entry, from the first gesture; afterwards `isPointerGestureActive()` is false and real Ctrl+Z, the Undo button and Delete work.
- **R26-2 (browser).** Mid-drag (pointer 7): Volume slider input on another lane → value unchanged after the event, status message, no history; Solo click → refused; library ＋ and Enter → refused; a synthetic library drop onto a lane → refused, no clip added; Play/Pause during the drag still works and the drag continues.
- **R26-3 (stale, browser).** All synthetic pointerdowns use `buttons: 1` (round-5 deviation 1: a pointerdown with `buttons === 0` starts no gesture). Pointer 7 down on clip A (header), no pointerup; pointer 7 down on clip B's header and drag +1 s, release → clip A unchanged (its preview reverted, no entry), clip B moved with one entry, count 0. Same with the brace as the stale gesture and a clip as the new one.
- **R26-U.** Component tests inside `ArrangementProvider`: second pointer on another clip ignored; second pointer on the brace ignored; Mute/Solo/Volume refused during a gesture (no entry, value unchanged); same-pointer stale gesture on component A ended by a pointerdown on component B (count returns to 0, A unchanged, B's gesture works); ghost state not cleared by another component. These must fail on the round-5 code (say how you know: run them once before the fix, or reason from the old code path; no git stash/checkout).
- **Regression:** R5-B1, R5-B1u, R5-B1r (both r3v3 scripts), R8-M5, R4-B1, R6-S2 (marquee), R4-P1 (playhead drag).

## 4. S2 — B-R5-01: escalation interval (D-24a)

**What C found.** RF5-1b passed only vacuously (0 natural episodes > 0.12 s). The forced diagnostic proved the path (first escalation 320 ms), but under **persistent** lag the counted time between escalations runs from `seeked` + 300 ms (end of the hard-seek exclusion) to `seeked` + 1000 ms (the D-24 interval), about 700 ms, which is above RF5-1b's 600 ms FAIL line. A correct dock would fail the task's own rule.

**D-24a (binding, amends D-24).** The minimum interval between escalations on one element is **600 ms**, measured from the previous escalation seek's `seeked` (or its pending timeout). Nothing else in D-24 changes: `T` = 300 ms, `D` = 0.12 s, edge 1.5 / 0.5, shrink test 0.02 s, ≤ 1 hard seek per 250 ms per element, no write while seeking/pending, rate 1 on the seek, window reset on every seek/swap/play/pause/source change. Worst-case counted time per episode is then about max(600 − 300, `T`) + one frame ≈ 320 ms, inside `T` + 150 ms.

**Acceptance (C):**
- **RF6-1 (verdict, non-vacuous).** C's forced persistent-lag diagnostic (`c-round-5/scripts/esc.js` approach: the active element's real rate held near 0.7 for ≥ 5 s of playback, R3-V1 layout) → ≥ 3 consecutive escalations; each episode's counted time (stall windows and hard-seek windows excluded, as in RF5-1b) ≤ `T` + 150 ms; no escalation issued < 600 ms after the previous `seeked`; 0 `currentTime` writes while seeking; ≤ 1 hard seek per 250 ms; after the forcing stops, |d| ≤ 0.1 within 1.5 s and no further escalation.
- **RF6-2 (regression).** RF5-1 (R3-V1 10 same-load + 5 reload; R2-V3 3 + 2) and RF5-2 (5 loop runs) repeated with the D-24 measurement rules, light harness, raw and stall-excluded series per run, invalid-run cap 5. RF5-3 3 runs.
- **RF6-U.** `video-sync.test.ts`: no escalation at 599 ms after `seeked`; escalation allowed at ≥ 600 ms when the window still qualifies; a simulated persistent lag yields escalations spaced 600 ms + window time; all D-19/D-24 tests still pass (name any changed test and why: the 1.0 s → 0.6 s contract change).
- **Tech Lead (manual, carried):** RF6-1/RF6-2 on a quiet real Windows Chrome, VP9 + H.264, including the natural decoder ramp (round-4 Lr5 scenario).

## 5. S3 — C-R5-05: Play past the project end keeps the insert position (D-27)

**Decision (binding, amends D-15).** D-15 says the playhead is the insert position, so Play must never discard a position the user placed. With no active loop covering the position:
- position within `ARRANGEMENT_EPS` of `projectEnd` (playback ran to the end and stopped there) → Play starts from 0, as today;
- position **beyond** `projectEnd` + `ARRANGEMENT_EPS` (the user seeked past the end) → Play does **not** start and the position is unchanged; status: `Playhead ({time}) პროექტის ბოლოს ({end}) მიღმაა — აქ დასაკრავი არაფერია. Home აბრუნებს 0-ზე.` (times via `formatArrangementTime`).
- An active loop keeps the D-17 rules unchanged.

Rationale (recorded in plan.md D-27): restarting at 0 loses the insert position used by paste (seek 20 → Space → paste lands at 0); playing silence past the end would need a transport that never auto-stops, which is a bigger change. Refusing with a message is the smallest behaviour that keeps D-15.

**Acceptance (C):** **R27-1.** Impact 0–2, seek 5, Space → not playing, position 5.000, the status above; Ctrl+V of a copied clip then lands at 5.000. Play after a natural stop at the end (position = end) → restarts from 0 (R4-P3 unchanged). Seek 1.0 → Play from 1.0. Loop 3–4 enabled with position 3.5 past an end of 2 → D-17 behaviour unchanged (R5-L5). **R27-U:** context or transport test for the three cases.

## 6. S4 — Low bugs

### 6.1 C-R5-01 — list titles indistinguishable
The C-R4-03 tree fix narrowed the list column to 144 px; 7 of 9 titles truncate and the four stems plus the mix all read `ღამის პულსი…`.
**Fix:** outcome only; the mechanism is yours (for example: the part name first, the composition name as secondary text; two-line titles; a stacked tree-over-list layout at narrow widths). Keep the honesty rules: synthetic sources keep the words **"სინთეზური დემო"** somewhere searchable (R12-L1 `ბასი დემო`), the public ones still say they are the CZABA public preview.
**R6-L1 (C):** 1280×720 and 1440×900, library at the default 288 px, "ყველა ფაილი" and the სტემები folder: every option's title element has `scrollWidth ≤ clientWidth` (no ellipsis) and ≤ 2 lines, and no two options show the same visible title text (9/9 distinct). R5-B2 (tree nodes), R12-L1, R12-L2, R23-3 still pass. Shots `list-1280.png`, `list-1440.png`.

### 6.2 C-R5-03 — lane-ghost label paints over clip headers
**Fix:** the ghost's text stays inside the ghost box (clipped, no `overflow-visible` text); the refusal reason (`აუდიო ვიდეოხაზზე არ გადადის`, `აქ ადგილი არ არის`) is shown in the footer drag-hint line while the ghost is amber, so it is always readable.
**R6-G1 (C):** 1280×720, SFX clip dragged onto the video lane near 4 s and onto an occupied place: the ghost label's bounding box lies within the ghost box (±1 px) and intersects no clip title element; the footer shows the refusal reason; the footer stays one line (R11A-3).

### 6.3 C-R5-04 — lane-kind paste refusal has no time
**Fix:** the lane-kind refusal names the lane and the paste time: `ჩასმა ვერ შესრულდა: {lane} ხაზზე {time}-დან ეს მასალა არ ჯდება (აუდიო და ვიდეო ხაზს არ იცვლის). არაფერი შეცვლილა.`
**R6-P1 (C):** C's R9-C4 lane-kind repro (copy a music clip, video lane active, seek 40, Ctrl+V) → the message contains `00:40.000`; arrangement and history unchanged.

### 6.4 Shift hint wording (C note)
While the header drag is active and Shift is **not** held: `Shift — დრო ჩაიკეტება, შეიცვლება მხოლოდ ხაზი`. While Shift is held: `Shift — დრო ჩაკეტილია, იცვლება მხოლოდ ხაზი`.
**R6-H1 (C):** both texts appear in the right state during a header drag (R8-M2 re-run); the footer stays one line.

### 6.5 Docs honesty
- Doc 013 status/TODO: RF4-1/RF4-2 (C-R4-01) and C-R4-02..04 were since passed by C round 5 under D-23/D-24 (RF5-1, RF5-2, R5-B1..B3); RF5-1b was vacuous; quiet real Chrome stays a Tech Lead check.
- Doc 014 status/TODO: C round 5 PASS of all round-5 IDs; open C-R5-01..05; the Tech Lead real-mouse/real-Chrome list. No PASS claims beyond C's.
- **Root M3 (doc 012).** C round 5 §7 still lists it as open, B considers it resolved (lines 126–131). Re-read doc 012's status/TODO; if R6-S2 "while playing" and R6-S3 "heard while playing" (both since verified by C round 3) or RF3-1's failing counts are missing or misstated, correct those lines only. Report which lines you checked.
- Doc 015 covers round 6.
**R6-D1 (C):** 013, 014 and 015 make no unverified PASS claim and 013 no longer reports C-R4-01..04 as open; C cites the doc 012 lines that satisfy root M3 (or the remaining gap).

## 7. U1 — SRW-10: navigation (FB-01, D-28)

**Model.** The view is `{ pxPerSecond, scrollLeft }` plus a zoom-history stack, owned by the workspace (context or a view store). Navigation never writes history, never seeks (except the ruler click below), never touches audio or the video sync loop.

**Bounds and Fit.**
- `ZOOM_MAX` = 320 px/s. `ZOOM_MIN` = 0.5 px/s (Fit must reach a 20-minute project at 1280 px; D-14 caps video audio at 20 min). Default stays 40 px/s.
- **Extent** = max(`projectEnd`, loop end if a loop exists, 10 s).
- **Fit** (button, ruler double-click without a range, overview double-click): with `timelineViewport = scroller.clientWidth − ARRANGEMENT_HEADER_WIDTH_PX`, zoom = clamp((timelineViewport − 4) / extent); scrollLeft = 0; so `extent × zoom ≤ timelineViewport − 4` and the whole extent is visible at once. The timeline keeps its 30 s tail, so scrolling into the tail stays possible; that is allowed. Push the previous view onto the zoom history.
- The zoom slider maps **logarithmically** onto [`ZOOM_MIN`, `ZOOM_MAX`]; its readout shows px/წმ with up to one decimal; `aria-valuetext` says the same.
- **Ruler ticks:** the step is chosen from {0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600} s so that labelled ticks are ≥ 40 px apart at every zoom; labels never overlap.

**Anchored zoom (NAV-01).**
- **Ctrl/Cmd + wheel** over the timeline: zoom × 1.15 (wheel up) or ÷ 1.15, anchored at the time under the mouse (that time stays under the pointer ±1 px); `preventDefault` so the page does not zoom. Plain wheel and Shift+wheel keep the native scroll (NAV-07).
- **+ / −** (also `=`, numpad +/−; ignored in text inputs and on focused sliders): zoom × 1.25 / × 0.8 around the range centre if a range exists, else the playhead; if the anchor is visible it keeps its screen x, otherwise it is centred.
- The slider zooms around the playhead the same way.

**Ruler drag (NAV-03), replaces "pointerdown = seek".**
- Pointerdown on the ruler (not on the playhead handle) starts a navigation gesture (D-20/D-23/D-26 apply). **Release with < 4 px movement = seek** to the time under the pointerdown (stopped: no play start; playing: continues from there), so R1-B8/TRN-05 semantics are unchanged; only the seek moves from pointerdown to release.
- ≥ 4 px: horizontal movement pans (the anchor time follows the pointer x); vertical movement beyond a 6 px dead zone zooms, `zoom = startZoom · exp(−lift / 140)`, anchored so the pointerdown time stays under the pointer ±1 px. No seek on release after a drag; the click that follows the drag is suppressed.
- Double-click on the ruler: with a range → Zoom to range (Z); without → Fit. A double-click is two short releases, so it first seeks (twice) to the click time and then applies Z/Fit. This is accepted: no delayed-click timer (it would make single-click seeks feel late while playing).
- The playhead handle keeps its own scrub drag (R4-P1).

**Zoom to range and back (NAV-02).**
- **Z** (no modifier) or the `⇔` button: requires a range (else status `Zoom-ისთვის ჯერ მონიშნე მონაკვეთი.`, nothing changes). Push the current view onto the history; zoom so the range fills 60 % of the viewport, centred.
- **X** (no modifier) or the `↩ Zoom` button: pop and restore the previous view (zoom and scrollLeft). Empty history → status, nothing changes; the button is disabled with a reason in its title. Ctrl/Cmd+X stays Cut (§D-25).
- The history is in memory, not in the edit history; Undo never changes the view.

**Overview (NAV-04).**
- A strip showing the whole extent: one mini bar per clip in its lane row, a viewport frame, and a playhead line. Place it in the existing strip **left of the video box** (prototype layout), replacing the free space now taken by the dock caption, so the overview adds **no height** (R11A-3). Keep the dock caption text available (e.g. as the video box title or a short line in the strip).
- `role="slider"`, focusable, `aria-label` in Georgian, `aria-valuemin` 0, `aria-valuemax` = extent (s), `aria-valuenow` = visible start (s, rounded).
- Frame: left = visibleStart / extent × width, width = min(1, visibleSeconds / extent) × width.
- Pointer: click outside the frame centres the view there; horizontal drag pans; vertical drag zooms (same exp rule, anchored at the frame centre); double-click = Fit. Keys when focused: ←/→ pan by 5 s; they must not reach the global nudge handler.
- The playhead line and frame follow the **position store** and scroll events; the overview must not subscribe to a per-frame context value (root M2 / R4-M2).

**Follow (NAV-06).**
- A `Follow` toggle (on by default, `aria-pressed`). While playing with Follow on: when the playhead leaves the viewport (x > right edge − 24 px or < scrollLeft), scroll so the playhead sits at one third of the viewport.
- Any manual horizontal navigation while playing (scrollbar, wheel, keyboard scroll, ruler drag, overview, +/−, Z/X, Fit) pauses Follow: the button shows `Follow ‖` in the accent token with `aria-pressed=false`, and the status says `Follow შეჩერდა ხელით ნავიგაციისას. Follow ან Play აბრუნებს.`. Pressing Follow or starting Play resumes it. Follow off → the view never moves by itself.
- Follow scrolling must not be mistaken for manual scrolling (it must not pause itself).
- **While any pointer gesture is active** (clip move/trim/range/cross-lane, brace, marquee, playhead scrub, ruler drag), Follow does not scroll: it is suspended without changing its state and resumes after release. Otherwise the timeline would scroll under a pointer-anchored drag (Ableton NAV-06 also stops Follow on edits).

**Controls.** `Follow`, `⇔`, `↩ Zoom`, `Fit` go next to the Zoom slider (design-philosopher places them). The transport stays one row at 1440×900; at 1280×720 it is one row or wraps without hiding any lane, the ruler or the loop strip (R11A-3). R4-B3 (Loop box Δ 0 px across states) must still hold. Tooltips name the shortcuts. The footer hint gains `+/− · Z/X · Ctrl+wheel` and stays one line.

**Acceptance (C):**
- **R10-N1 (ruler).** Stopped, project ≥ 60 s: vertical drag up 100 px on the ruler at a mark visible at the current zoom (e.g. 10 s at the default zoom, or 30 s after scrolling) → zoom increases; that time stays under the pointer ±1 px; horizontal drag pans with the anchor under the pointer ±1 px. A click (< 4 px) at 20 s → position 20.000, not playing; while playing, the click → playback continues from 20 (R1-B8/TRN-05). Release after a drag → no seek, no history entry.
- **R10-N2 (wheel, keys, history).** Synthetic `WheelEvent` with `ctrlKey` at a visible time point → anchored ±1 px, the page is not zoomed (`preventDefault`); plain wheel scrolls natively. `+`/`−` → anchored at the playhead (visible) or the range centre. Range 10–12 → `Z` → the range is ~60 % of the viewport (±5 %), centred (±2 px); `X` → previous zoom and scrollLeft exactly; `X` again with an empty history → status, unchanged. `Z` without a range → status, unchanged. `Z`/`X`/`+`/`−` typed in the library search input edit the text only.
- **R10-N3 (overview).** At a zoom where the viewport shows less than the extent: frame width / overview width = visibleSeconds / extent (±1 px); at Fit the frame spans the whole overview; click outside the frame → view centred there (±1 px); horizontal drag pans; vertical drag zooms; double-click → Fit; focused ←/→ pans 5 s and does not nudge a selected clip; `aria-valuenow` follows the view.
- **R10-N4 (Follow).** Play from 0 at a zoom where the project is wider than the viewport → the view scrolls when the playhead nears the right edge (playhead stays visible); a manual scroll while playing → `Follow ‖`, the view no longer moves; the Follow button → following again; Pause + Play after a manual scroll → following again; Follow off → no auto scroll. Position monotone throughout. While playing with Follow on, a clip header drag held across the moment the playhead reaches the right edge → `scrollLeft` unchanged during the drag, the clip lands where the pointer is (±1 px), Follow resumes after release.
- **R10-N5 (Fit, 4 minutes).** Extend the project to ≥ 240 s (Ctrl+D / paste copies) → Fit → whole extent visible, no horizontal scrollbar overflow beyond the timeline tail, ruler labels ≥ 40 px apart and non-overlapping; extend further by Ctrl+D → the overview extent grows with `projectEnd`. Fit on a 20-minute extent at 1280×720 reaches `ZOOM_MIN` or better without error.
- **R10-N6 (playing, no side effects).** While playing with a video clip (loop off): 10 zoom steps (+/−, Ctrl+wheel, ruler drag, Fit, Z/X) → no `AudioBufferSourceNode` start/stop within ±50 ms of any navigation action, and the run's start/stop counts equal a control run of the same layout and duration without navigation, position monotone, video |d| ≤ 0.1 (light harness), same `<video>` DOM nodes, no `currentTime` write while seeking.
- **R10-N7 (performance).** 4-minute project at `ZOOM_MAX` and at Fit: each zoom step completes without a long task > 200 ms attributed to app script (LoAF); clip waveforms remain drawn (non-empty) at both zooms.
- **R10-N8 (layout).** Screenshots at 1440×900 and 1280×720 (library open and collapsed, with video): the overview sits in the dock strip, the dock is ≥ 160×90 and overlaps nothing, 4 lanes + ruler + loop strip visible, footer one line, transport per the Controls rule. Shots `nav-1440.png`, `nav-1280.png`, `nav-1280-collapsed.png`.
- **R10-U.** `view.test.ts`: clamp; fit zoom (incl. 240 s and 1200 s extents); anchored zoom keeps the anchor screen x; step-zoom anchor choice (range centre / visible playhead / centre); zoom-to-range 60 %; history push/pop/empty; overview frame maths and click-to-centre; Follow decision (inside, right-edge margin, left of view, off, paused); tick step ≥ 40 px at representative zooms. Context/component tests: the ruler click seeks on release only; the ruler drag writes no history; navigation keys are ignored in inputs; the overview does not re-render on position updates (the R4-M2 render-count pattern).

## 8. Required tests (behavioural, named)

- D-26 component tests (R26-U).
- `video-sync.test.ts`: the 600 ms interval (RF6-U).
- Transport/context test for D-27 (R27-U).
- `view.test.ts` and the navigation component tests (R10-U).
- Any refusal message changed in §6 is asserted by a test.

## 9. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/types/arrangement.ts app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement app/data/studio-lab-demo.ts
npx biome check ./app
npm run build
git status --short
git diff --stat
git diff app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

**`/check` rule (unchanged):** `--write` only on paths you own this round (never on `Header.tsx`); `npm.cmd run check` only if the read-only `./app` run shows no format or safe-fix diffs outside your files, then re-run the hash check; never `npm run format`.

**Dev server and browser.** Use the running `http://127.0.0.1:5173`; do not start or stop servers. All browser work through gstack `/browse` with state file `../tmp/studio-real-loop/a-browse.json`. Media fixtures: `../tmp/studio-real-loop/media/`. Use real `$B press` keys. For drift, use adapted copies of C's **light** harness in your system temp directory, not in `c-round-*`. Do not work on, publish or test the standalone prototype or any Sites copy.

**Review.** Invoke the actual `code-reviewer` subagent, fix its findings, and quote its summary.

## 10. Report `../tmp/studio-real-loop/a-round-6.md`

1. The pre-flight gate.
2. The design-philosopher ruling (overview, controls, list titles), quoted.
3. Files actually changed (a subset of §2.2); confirmation that no round-5 file was reverted and `Header.tsx` is byte-identical to HEAD.
4. Verbatim command tails.
5. Changed tests, each with its reason; new tests listed; for R26-U how you know they fail on the old code.
6. code-reviewer findings and your fixes.
7. Navigation constants (`ZOOM_MIN/MAX`, wheel factor, step factor, drag constants, Follow margin), the D-24a interval, and your own drift/escalation runs (count, worst run, escalations, hard seeks).
8. Deviations, each with a reason.
9. **"Not ready" acceptance IDs per item** (S1, S2, S3, S4, S5, SRW-10).

Do not claim PASS.

## 11. What C will verify (in this order)

1. **Track S:** R26-1, R26-2, R26-3, R26-U; RF6-1, RF6-2, RF6-U; R27-1, R27-U; R6-L1, R6-G1, R6-P1, R6-H1; R6-D1.
2. **Track U:** R10-N1..N8, R10-U.
3. **Gates:**
   - **G6-1.** tsc 0. vitest ≥ 709 + new, 0 failures. Build passes. Biome 0 errors (owned paths and `./app`).
   - **G6-2.** Protected hashes OK. `git status`/`git diff --stat` show only paths from §2.1 and §2.2 (path allowlist, not exact counts); `Header.tsx` identical to HEAD; no `app/styles`, `root.tsx`, `routes/`, `public`, `package.json` change.
   - **G6-3.** Anonymous `/studio-lab` (direct and via the header link): no request to `/api/studio-token`, `/api/recording-*`, `/api/download`, no R2 host, no `Authorization` header from workspace code; media only the 2 demo MP3s and `blob:`; anonymous `/api/studio-token` → 401; a fake Bearer gets no token; `/studio/middle-east` shows "Sign in required". The root `CartContext` anonymous `GET /api/cart` and root GA consent-denied `page_view` are known and allowed.
4. **G6-R (regression),** with a disabled brace present and 2 clips selected where relevant; R8-M1 and R8-M5 are also run **while playing with Follow on**: R1-B5, R1-B8 (ruler click semantics), R1-B10, R1-B12, R1-E1, R1-E5; R2-V1, R2-V2; R3-V2, R3-V3, R3-V4; R4-P1, R4-P3; R4-M2 (render count; also for the overview); R4-B1, R4-B3, R4-B4, R4-B5, R4-B6, R4-B7; R5-L1..L5, R5-E1; R6-S1..S5 (S5 per D-25); R7-D1..D5; R8-M1..M5; R9-C1..C5; R11A-1, **R11A-2** and R11A-3 (not re-run in round 5); R12-L1..L4, R12-S2; R22-1; R5-B5.
5. **G6-shots** at 1440×900 and 1280×720: navigation (§R10-N8), list titles (§6.1), the amber ghost with the footer reason (§6.2).
6. **Harness notes for C:**
   - Light harness only for drift; raw and stall-excluded series per D-24.
   - Ctrl+wheel via synthetic `WheelEvent` dispatch (gstack has no wheel); record the limit.
   - Synthetic pointer events are acceptable for R26-*, R10-N1/N3; every synthetic pointerdown that should start a gesture needs `buttons: 1`; record real-mouse limits.
7. **Tech Lead real-mouse / real-Chrome list (carried, not this round's verdict):** R23-1 scrollbar visuals and mint hover/drag; R23-2 wheel/trackpad and thumb drag; R12-L4 real HTML5 library drag; RF6-1/RF6-2 (and RF5-1/RF5-2) on a quiet real Windows Chrome (VP9 + H.264); R8-M1/M2 real mouse; R10-N1/N2 real mouse and real Ctrl+wheel/trackpad pinch.
