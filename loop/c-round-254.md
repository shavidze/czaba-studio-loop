# C round 254: SABA-B-10b (visible flashing insert marker + transport rows in the shortcut sheet)

**Verdict: FAIL.** One row fails as written: C-SHEET-254. The sheet scrolls +30 px more than at HEAD, and all of it comes from two-line rows. Every other runnable row passes in the real browser at 1440×900 and 1280×720.
- `browserVerified` = `realVerified` = **true**: every runnable browser row ran.
- "Purchased origin" is BLOCKED (backend unavailable in cloud).
- The gate rows are not claimed.

C-R254-OBS-01 does **not** contribute to the FAIL: it is pre-existing and identical on the HEAD control.

The cause of the FAIL is the spec, not A's code. The texts are byte-exact to §1.2, so B must rule on C-R254-01. If B accepts the +30 px, every acceptance row of this round passes on the evidence below.

## Environment
- **Store:** HEAD `c65e5e9`. The dev server on :5173 (`remix vite:dev`, started by root) returns 200. `env-status.json`: store 200, round 254.
- **HEAD control:** a `git archive HEAD` copy in `/tmp/c254-head` (node_modules symlinked), served by `vite dev` on :5180. The repo stayed read-only.
- **Mutant scratch:** HEAD archive plus the working diff in `/tmp/c254-scratch`.
- **Browser:** Playwright Chromium, a fresh context per row. The script is `c-round-254/c254.cjs`; results are in `c-round-254/browser/c254.json` (42 screenshots). Helpers come from `c-round-253/c253.cjs`: the same budget counter, the same export recipe and the same auth row.

## Rows
| ID | Result | Evidence (both viewports unless stated) |
|---|---|---|
| C-SCOPE-254 | PASS | <ul><li>HEAD is `c65e5e9`.</li><li>Status: 7 `M` (grants 1–7) plus `??` doc 192.</li><li>Frozen sha256 (1,103 files) rc 0; root files rc 0; the 7 protected files `git diff --quiet` rc 0.</li><li>`app.css` diff: one `@theme` line and one `@keyframes` block outside `@theme`.</li><li>Grant 1 diff: the Signal→Line component and its mount only.</li><li>`render-budget` `git diff -w`: only RB-IM plus the timeout signature.</li><li>The only removed `expect` is SC5 `toBe(9)`, replaced in place by `toBe(11)`.</li></ul> |
| C-UNIT-254 | PASS | <ul><li>The 7 named files run alone: 131/131 (`c-round-254/unit.log`).</li><li>IDs present: SC1, SC5, SS-T1, SS-T2, IMV1–5, RB-IM.</li><li>`{ timeout: 15_000 }` is present.</li><li>Play→Pause→Play takes 2.24 s (15 %); RB-IM takes 1.43 s.</li></ul> |
| C-MUT-254 | PASS | My own mutants (`c-round-254/mutants/run.py`, `summary.txt`), on the 4 test files: <ul><li>FIX-CONTROL: 56/56 green.</li><li>MU-HIDDEN-SIGNAL: IMV1, IMV2, IMV3 red.</li><li>MU-NO-HIDE: IMV3 red.</li><li>MU-SHEET-NO-ROWS: SC1, SC5, SS-T1, SS-T2 red.</li></ul> |
| C-MARKER-VISIBLE-254 | PASS | <ul><li>Lane aim: `elementFromPoint` hits the sfx lane, not the scrub strip.</li><li>Exactly 1 element, not hidden, display block, 1 px wide, `rgb(236, 230, 218)`.</li><li>Same height as the playhead: 408 px at 1440, 392 px at 1280.</li><li>`data-insert-marker` = 2.000.</li><li>Position: x is −0.09 px from the expected value (origin + 2·pps, with pps from the readout, 97.7) and 0.00 px from the ruler `0:02` tick.</li><li>The **painted pixel** at the line on the sfx lane is `rgb(236,230,218)`; 4 px beside it reads `rgb(23,20,16)`.</li><li>`pointer-events: none`: a hit-test at the line x reaches the sfx lane.</li><li>`aria-hidden="true"`, no tabindex, mounted before the playhead in the same parent.</li><li>Where the two lines coincide, both pixels x and x+1 are brass `rgb(201,164,106)`, so the playhead paints over the line in the real browser.</li><li>**HEAD control (:5180):** 1 element, `hidden`, 0×0, value 2.000.</li></ul> |
| C-BLINK-254 | PASS | <ul><li>`no-preference`: animation `insert-marker-blink` 1.2s steps(1) infinite. 24 samples at 100 ms take only the values 1 and 0.25 (6/6 pattern); the minimum is 3 changes in any 2 s window. It also blinks while playing.</li><li>`reduce`: `animation-name: none`; opacity is 1 in all 24 stopped samples and all 14 playing samples.</li></ul> |
| C-CONTRAST-254 | PASS | Ink against the first opaque background, with both lines and the handle hidden: <ul><li>sfx lane `rgb(14,13,12)` (under a 5 % brass overlay): 15.62.</li><li>seconds ruler, bars ruler and marker strip `rgb(22,20,18)`: 14.78.</li><li>video dropzone: 15.62.</li><li>Unselected clip body `rgb(29,26,23)`: 13.94; title bar `rgb(36,32,28)`: 13.01.</li><li>The painted pixel on the clip body is ink.</li><li>**Listed only:** on the selected clip's title bar `rgb(201,164,106)` it is **1.88:1** (INFO-B254-INK-ON-BRASS).</li></ul> |
| C-TWO-LINES-254 | PASS | <ul><li>After Space, ~1.5 s, then Space: the marker stays at 2.000 (dx −0.09 px). The playhead is at 3.483, dx −0.21 px from its own time, and 144.8 px from the marker. Both lines are displayed.</li><li>The next Space starts the clock at `00:02.000` (1440) and `00:02.002` (1280).</li></ul> |
| C-MARKER-PLAYING-254 | PASS | During playback: <ul><li>A bars-ruler lower-zone click at 6 s moves the marker to 6.000 (dx −0.26 px).</li><li>A lane click at 4 s moves it to 4.000 (dx −0.17).</li><li>A MutationObserver plus a rAF counter show ≤ 1 frame between `pointerdown` and the attribute write (14 ms / 8 ms).</li><li>Playback continues, and the playhead keeps moving on its own (0.57 → 0.84 → 1.20 → 1.60 s).</li></ul> |
| C-MARKER-RANGE-254 | PASS | <ul><li>A drag from 5 to 7 s in the music waveform gives `arrangement-range` = 1 and the line `hidden`.</li><li>Space with the selection plays from `00:05.011`/`00:05.031`, and the line stays hidden.</li><li>After the stop the selection persists and the line stays hidden.</li><li>An empty sfx-lane click (8 s at 1440, 3 s at 1280) clears the range, and the line shows at 8.000/3.000 (dx −0.35/−0.13).</li></ul> |
| C-HOME-254 | PASS | <ul><li>Stopped, marker at 6.000, then Home: the final value is 0.000, at the header edge (dx 0).</li><li>**GATE249-S5** (`attributeOldValue`, `data-insert-marker` only; `browser/home-oldvalue.json`): stopped Home gives **1 record** (6.000 → 0.000). Home while playing gives **2 records**, both with oldValue 6.000 and final 0.000; the first is a same-value rewrite. Every value is in {6.000, 0.000}, so there is no foreign intermediate value.</li><li>Home while playing (from 3.98 s) goes to 0.089 s. Playback continues (0.589 s 0.5 s later), and the marker is 0.000.</li></ul> |
| C-ZOOM-254 | PASS | Marker 2.000 throughout. The line equals the ruler `0:02` tick (Δ 0.00 px) at pps 97.7 → 78.1 (`-`) → 97.7 (`=`) → 62.5 (`--`) → 122.1 (`+++`), and after a Shift+wheel scroll (scrollLeft 239). |
| C-SHEET-254 | **FAIL** (C-R254-01) | <ul><li>The 6 transport rows are in the §1.2 order, with exact texts and keys. The `marker` row text is exact.</li><li>The search `insert marker` returns play-stop, insert-marker-to-playhead, back-to-start, split, marker and add-sound (HEAD: split, marker, add-sound).</li><li>Esc closes the sheet, and focus returns to `Keyboard shortcuts (?)`, the same as HEAD.</li><li>**Scroll:** 1260 vs HEAD 1230 (+30 px) at both viewports. Rows at 40 px: play-stop, continue-playback, insert-marker-to-playhead and marker. With nowrap, both measure 1070, so the wraps are the whole delta.</li></ul> |
| C-TITLES-254 | PASS | New equals HEAD: stopped `Play (Space)`/`Space` and `Back to start (Home)`/`Home`; playing `Pause (Space)`/`Space`. |
| C-FOCUS-254 | PASS | <ul><li>The L50 grep gives 20 hits.</li><li>45 Tabs from the Play button give an identical sequence to HEAD at both viewports. The line is never focused.</li></ul> |
| C-BUDGET-254 | PASS | <ul><li>Persistent text lines (round 253's counter): 85/101 at 1440 and 69/85 at 1280, on both new and HEAD.</li><li>Screenshots `budget-{empty,demo}-{vp}[-head].png`.</li></ul> |
| C-LESSON-254 | PASS | `lessons.md` is 58 lines; L44 is at l.30 and L45 at l.31. |
| AN-REVIEW-254 | PASS | <ul><li>Doc 192 l.4 is byte-exact.</li><li>The 7 TEMPLATE headings are in order.</li><li>Every cited id exists in the tests, A's mutant summary, `backlog.json` or the task.</li></ul> |
| LAB-SMOKE-254 | PASS | Real UI export WAV: 48 kHz/24-bit/2 ch, 768,000 frames = 16.000 s, rms −24.91 dB, peak 0.2967, 0 NaN, sha256 `1fea093b…033f94` (= round 253). Playback had rms > 0.001 on the destination tap. No page errors. |
| Auth | PASS | <ul><li>A fresh context with no credentials opens `/studio-lab` (workspace present, no `auth_user`).</li><li>`/studio/middle-east` shows `Sign in required`, with 0 `audio[src]` and no workspace.</li><li>`/api/studio-token`: no header gives 401; a fake bearer gives 500, never 200.</li></ul> |
| Purchased origin | BLOCKED | Backend unavailable in cloud. |
| gate rows | gate | Full vitest, typecheck, lint, build, verify and e2e smoke belong to the root gate. |

## §6 neighbours
- **Playhead:** unchanged. 2 px, `rgb(201,164,106)`, same class and z-10. Its rAF movement is shown in C-MARKER-PLAYING.
- **Clip drag** starting exactly at the marker x on the clip title bar: the clip moves 0.000 → 1.000, the marker stays at 2.000, and Undo restores 0.000. The line does not steal the gesture.
- **Store `/` at 1280:**
  - The console error set is the same as HEAD except the port inside the URLs (the expected cart and connection-refused errors). No page errors.
  - The layout looks identical by eye (`store-home-{new,head}-1280x720.png`). The 3.9 % pixel diff is in the animated hero background.
  - `insert-marker-blink` appears only in the new CSS. The grep of `app/` finds it only in grants 1–2.
- **Not probed:** the floating video and video-dock z-order with a loaded video. Only the dropzone background was measured.
- **Past the end (observe):** this is C-R254-OBS-01 below, and it is pre-existing.

## Bugs for B
- **C-R254-01 (Low):** the C-SHEET-254 scroll delta is +30 px, not A's estimated +132.
  - The copy is fixed by §1.2.
  - B's options: (a) accept +30 px; (b) shorten the play-stop, marker and new-row texts so each fits on one line (changes §1.2); (c) change the sheet layout or width (a layout change, so Saba).
  - This closes A-R254-SHEET-SCROLL-DELTA with a measurement.
  - **Why we missed it:**
    - L3 and L16 (a text change gets a widest-state box row at 1280, longest text first) apply to sheet copy.
    - B's pre-check had a scratch server but did not measure the dialog scroll against HEAD.
    - A only estimated the delta.
- **C-R254-OBS-01 (Low, pre-existing, identical at HEAD):**
  - Steps: at default zoom with Snap, while playing, click past the end. The marker snaps to exactly 16.000 (the end). Stop. The status says "Space plays from the insert marker at 00:16.000".
  - Actual: Space plays from 00:00, and the stale stopped sentence stays.
  - Why it matters now: the marker is visible and still shows 16.000.
  - It is the same class as C-R253-01, so it goes to `deferred_low_polish` with it.

## Notes for B
- **A-R254-WRONG-TIMEOUT-PREMISE is confirmed.** HEAD already had `}, 15000);`. The rewrite removed no assertion.
- **INFO-B254-INK-ON-BRASS** measures 1.88:1, as planned.
- **The playhead's Pause title** was captured while playing.
- **Root (HEAD control):** C ran a HEAD control server on :5180 (`/tmp/c254-head`) and **stopped it** after capturing the evidence. :5173 still returns 200.

## Ableton conformity (separate from the CZABA requirement)
| Behaviour | Status |
|---|---|
| A visible, flashing insert marker | Flashing is confirmed (6.3/6.9). Ink instead of blue and full height instead of per-track are deliberate differences awaiting Saba (SABA-Q-10B-MARKER-LOOK). |
| Blink rate | Unconfirmed (no reference found). |
| Reduced motion | Not applicable (CZABA addition). |
| Visible during playback | Unconfirmed (the manual is silent); a CZABA choice awaiting Saba. |
| Hidden with a time selection | Unconfirmed (inference from 6.6/6.9); awaiting Saba. |
| Two positions after Stop | Confirmed (6.3). |
| Home sends the marker to the start | Confirmed. Double-click Stop is not applicable yet (SABA-B-9). |
| Sheet keys | Confirmed (42.16/42.20). The wording is a deliberate difference. |
