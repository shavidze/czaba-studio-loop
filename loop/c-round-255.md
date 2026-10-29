# C round 255 — SABA-B-10b fix-up: independent verification

**Verdict: PASS.** `browserVerified` = `realVerified` = true. No new bugs.
**Environment:** env-status.json says store 200, round 255. Chromium is Playwright headless, launched with `--autoplay-policy=no-user-gesture-required`.
- The new build is served at `http://127.0.0.1:5173`.
- The **HEAD control** is a `git archive HEAD` copy in `/tmp/c255-head` with node_modules symlinked, served by `vite dev` on :5180. C stopped it and deleted it after use. :5173 still returns 200.

Every browser context was fresh, incognito, and had no credentials.

**Evidence:** `c-round-255/browser/c255.json` and screenshots, `c-round-255/unit.log`, and the script `c-round-255/c255.cjs`. The script reuses C round 254's helpers.

**Invalid runs (environment):**
- The first `sheet@1440` run hit a 150 s cold-compile timeout on a fresh Vite server.
- The first two `zorder` runs were aim errors in my own script:
  - a screenshot clip outside the viewport;
  - the HEAD aim used the line x, but the line is hidden at HEAD.

I fixed the script and re-ran. Each row below comes from a complete valid run, and the run budget was respected.

**Lessons read in full:** the C-probe lessons L16 (longest text state: the sheet at 1280 is the widest wrap, run) and L25 (file chooser: not used, `setInputFiles` direct) were applied. L17–L21 and L38 do not apply: no token, font or focus change and no perf spec.

## Rows run this round
| ID | Result | Evidence |
|---|---|---|
| C-SCOPE-255 | PASS | <ul><li>HEAD is `c65e5e9`, and the status has the same 8 lines.</li><li>Carried sha256 rc 0. The diff sha256 is `a8492a4c…46d5`.</li><li>Frozen tree (1,110 files) rc 0, root files rc 0, and all 7 protected files `git diff --quiet` rc 0.</li><li>Doc 192 against `r255-granted-start/` has exactly 3 hunks: l.4, a new bullet after l.98, and a TODO bullet after l.129.</li><li>**I re-checked at the end of my phase:** HEAD, status, carried, tree and diff hash are unchanged, so the source did not change during C.</li></ul> |
| C-UNIT-255 | PASS | 7 files, **131/131**, rc 0 (`unit.log`). |
| C-SHEET-255 | PASS (both viewports) | <ul><li>**Scroll container:** `scrollHeight` is **1,260** on the new build and 1,230 on HEAD. `clientHeight` is 808 at 1440 and 646 at 1280 on both. `scrollWidth` = `clientWidth` = 718, and the dialog has no horizontal overflow.</li><li>**The 5 rows round 254 changed or added:** `play-stop` 40, `continue-playback` 40, `insert-marker-to-playhead` 40, `back-to-start` 20, `marker` 40 px. All are ≤ 40.</li><li>**The other 43 row ids:** of 48 ids in total, the 5 are listed above and the other 43 have heights equal to HEAD's, row by row. The full id → (head, new) table is `perRow` in c255.json. `otherDiffs` = [], and no row exists only at HEAD.</li><li>**Transport group:** the 6 rows are in order, with the exact texts and keys. All 6 were compared: the 4 rows round 254 changed match its §1.2, and `play-from-point` (`Play from a point (needs a BPM)` / `Click the top strip of the bars ruler`) and `loop` (`Loop the selection · Loop on / off` / `Ctrl+L`) are byte-equal to HEAD. The `marker` text is exact.</li><li>**Search `insert marker`:** returns exactly play-stop, insert-marker-to-playhead, back-to-start, split, marker and add-sound.</li><li>**Esc:** closes the sheet whether it was opened with `?` or with the footer button. Focus returns to `Keyboard shortcuts (?)`, the same as HEAD.</li><li>**Last row:** `close` scrolls into view inside the scroller at 1280×720 (rows 663–683, scroller bottom 684) and is hit-testable (`sheet-close-row-new-1280x720.png`).</li><li>No page errors.</li></ul> |
| C-VIDEO-ZORDER-255 | PASS (both viewports) | <ul><li>**Setup:** load `beeps-6s-vp9-opus.webm`, put the marker at 2.000, then play and stop. The playhead ends at 3.48, about 60 px from the marker.</li><li>**Docked monitor:** it is the 160×90 box above the timeline (y 92–182 at 1440, y 130–220 at 1280). The lines run from the timeline top downward, so the two never overlap and there is no paint order to compare. This is recorded as geometry, not as a pass by assumption.</li><li>**Video clip on the video lane:** I compared the painted pixel at each line's x with the pixel after hiding that line.<ul><li>Line: `rgb(236,230,218)` over `rgb(85,80,73)`, so the line is **above**.</li><li>Playhead: brass over `rgb(36,32,28)`, so the playhead is **above**.</li><li>Both are above, and the HEAD playhead is also above.</li><li>`elementFromPoint` at the line x hits the video clip.</li></ul></li><li>**Floating video:** the expanded video is fixed with z 40. I moved it with the drag handle's arrow keys (33 × 16 px) so it covers both lines.<ul><li>At both lines' x, the pixel is identical with the line shown or hidden, so **both lines are below** the floating video.</li><li>The HEAD playhead is also below.</li><li>The hit target at both x positions is `arrangement-video` inside `arrangement-video-box`.</li></ul></li><li>Screenshots: `zorder-clip-*`, `zorder-float-*`, new and head.</li></ul> |
| C-LESSON-255 | PASS | <ul><li>`lessons.md` has 58 lines.</li><li>L3 cites C-R254-01 and the measured-bound rule.</li><li>L44 and L45 are present (l.30–31).</li></ul> |
| AN-REVIEW-255 | PASS | <ul><li>l.4 is byte-exact `**სტატუსი:** Completed (C round 255 PASS)` (od checked).</li><li>The 7 TEMPLATE headings are in order (l.7, 25, 56, 68, 83, 109, 132).</li><li>The new bullet cites C-R254-01, 1230 → 1260 and D-29z476. The TODO bullet cites C-R254-OBS-01 and C-R253-01.</li><li>Every id exists: C-R254-01, C-R254-OBS-01 and C-R253-01 in c-round-253/254.md and backlog.json, D-29z476 in backlog.json.</li></ul> |
| LAB-SMOKE-255 | PASS (both viewports) | <ul><li>**Playback:** the playhead moves from 0 to 1.18 s, and the real output RMS tap reads 0.0199.</li><li>**Export WAV:** 48 kHz, 24-bit, stereo, 768,000 frames = 16.000 s, 0 NaN, peak 0.2967, −24.91 dBFS RMS.</li><li>**sha256** is `1fea093b…033f94`, equal to round 254. No page errors.</li></ul> |
| Auth | PASS (both viewports) | <ul><li>The fresh context has 0 cookies. `/studio-lab` opens the workspace with `auth_user` = null.</li><li>`/studio/middle-east` shows `Sign in required`, with 0 `audio[src]` and no workspace.</li><li>`/api/studio-token` returns 401 with no header and 500 with a fake bearer, never 200. Premium is not bypassed.</li></ul> |
| Purchased origin | BLOCKED | Backend unavailable in cloud. |
| gate | not claimed | Full vitest, typecheck, lint, build, verify and e2e smoke belong to the root gate. |

## Carried from round 254 by diff identity (D-29z477)
C-SCOPE-255 passed at both the start and the end of my phase. So the 12 rows of task §3.3 carry forward. They are listed under `"carried"` in `c-round-255.json`, with their evidence paths, and are not in `"passed"`:

C-MUT, C-MARKER-VISIBLE, C-BLINK, C-CONTRAST, C-TWO-LINES, C-MARKER-PLAYING, C-MARKER-RANGE, C-HOME, C-ZOOM, C-TITLES, C-FOCUS, C-BUDGET (all -254).

## Findings
- **New bugs:** none.
- **C-R254-01 closes:** C-SHEET-255 passed under the D-29z476 bound.
- **C-R254-OBS-01** (deferred) was not re-probed. It is observe-only and nothing in scope changed.
- **Observation, not a bug:** the expanded floating video covers both the insert-marker line and the playhead where it overlaps them. HEAD behaves the same for the playhead, and the criterion asks only for the same order.
  - Ableton conformity: **does not apply**. Live's video window is a separate window, not an overlay on the Arrangement. CZABA's floating video over the library is CZABA's own design, so no Live claim is made here.

## Ableton conformity
This round changes no behaviour. Conformity is unchanged from `c-round-254.md`.

## For B
- SABA-B-10b can close as task §6 describes. Double-click Stop stays in SABA-B-9 scope.
- REGRESSION-ROUND-2026-10-30 is next if the next planning is on or after 2026-10-30.
- C's reusable script for the sheet bound, the video z-order and the smoke/auth rows is `c-round-255/c255.cjs`. Its arguments are `<base> <outDir> [rowRegex] [1440|1280]`, and it needs a HEAD control on :5180.
