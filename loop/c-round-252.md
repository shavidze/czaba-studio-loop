# C round 252 — SABA-B-10a stage 2b (Follow on ruler clicks, nav origin, titles, at-end wording) + IM22

**Verdict: FAIL — one acceptance row fails (C-FOLLOW-STOP-252). Every other C row that can run here passes.** The failure is Low severity and comes from a conflict in the spec. A flagged it as "needs B ruling" and did not STOP. B must rule before 10a is closed (L10). The rest of the stage works in the real browser, at both viewports, and has HEAD controls.

- `browserVerified` = `realVerified` = **true**: every browser row was run at 1440×900 and 1280×720.
- Env: `env-status.json` round 252, store 200.
- Chromium via Playwright (`@playwright/test` in the store), on the fix server `:5173` and a HEAD control `:5174`. The control is a tar copy of the store with `b-round-251/r252-granted-start/` restored: the grants-start `sha256sum -c` gave rc 0 and `git status` was empty.

## Bug for B

### C-R252-01 (Low): after a Follow-pausing ruler click, Stop resumes Follow but the status still says "Follow paused"
- **Steps** (both viewports, §0.2 recipe: pulse + Add, `=` ×4 → 97.7 px/s, tempo 120):
  1. Press Space.
  2. Click the bars ruler's lower zone (aim confirmed by `elementFromPoint` = `arrangement-bars-ruler`).
  3. Press Space (stop).
- **Expected** (C-FOLLOW-STOP-252): Follow is `on` with the text `Follow`, and **the status is not a Follow text**.
- **Actual:**
  - `data-follow-mode="on"` and the button reads `Follow`, which is correct.
  - The status line still reads `Insert marker at 00:06.500 — playback continues, Follow paused. Stop, then Space plays from here.` (1440) / `… 00:04.750 …` (1280).
  - So the stopped screen says both "playback continues" and "Follow paused", while the button shows Follow on.
  - Space-stop writes no status at all. The same-page control, a play and stop with no pause, leaves the previous text unchanged as well.
- **Cause:** the spec conflicts with itself. §1.2/§1.3 say the Stop resume "writes no status" and the stop text is "the text HEAD writes on stop", and FW6 pins exactly that. The C row, however, requires a status that is not a Follow text. A implemented §1.3 and reported the conflict (`a-round-252.md`, ruling 1).
- **New this round:** the phrase "Follow paused" is new. At HEAD, the stale line after Stop was only "playback continues", which was already pre-existing and less wrong.
- **Fix options for B** (no implementation by C):
  - (a) the stop resume writes a short status, or clears the Follow clause;
  - (b) B rewrites the row and accepts the stale line, recorded as a Low in `deferred_low_polish`.

  Live itself has no status line (§3).
- **Evidence:** `c-round-252/fix/c252.json` rows `followPause@1440x900` and `followPause@1280x720` (`stop`, `stop2`, `stopStatusUnchangedByStop: true`), screenshots `c-round-252/fix/follow-stop-{1440x900,1280x720}.png`.
- **Why this fails the round although it is Low:** the round fails because an acceptance row fails as written, not because of the bug's severity. The 2026-10-23 "Lows do not block" rule is about T12 entry and open findings; it does not turn a failing acceptance row into a PASS.
- **Two readings of the row:**
  - A's FW6 reads "not a Follow text" as "not `followResumed`" (the resume must be silent).
  - C reads it at face value: the stopped screen must not show a Follow text. It shows "Follow paused" while Follow is on.
  - Either way, the stopped screen now carries new, false text that this round introduced.
- **What closes this (round 253 can be small):** the only open item is a B ruling.
  - **(a)** The stop resume writes or clears the status: a one-line change in the stop effect (grant 1, `StudioWorkspace.tsx`), FW6 amended to the new text, and the copy key in `strings.ts`/`strings.test.ts` if a new string is used.
  - **(b)** B rewrites the row to accept the stale line, and C-R252-01 goes to `deferred_low_polish`.
  - **Re-run next round:** only C-FOLLOW-STOP-252, C-SCOPE, `bars-ruler-ui.test.tsx` (FW6) plus any file the fix touches, and LAB-SMOKE/Auth. With no other source change, every other row above needs no re-run; its evidence stands for this tree.

### Notes for B (not round failures)
- **C-N252-FOLLOW-TITLE (Low, copy, L29):** the paused button's title is still `Follow paused by manual navigation — press Follow or Play`, and the drag status is `Follow paused by manual navigation. Follow or Play resumes it.`
  - After this round, a ruler click also pauses Follow (not "manual navigation" in the 6.2 sense), and Stop or a strip click also resume it.
  - Measured on `after.followTitle` in `followPause@*`.
  - A noted it too. It is outside the §0.3 regex, so no row covered it. It is a candidate for `deferred_low_polish`.
- **A-R252-REVIEW-PLAYING-SOURCE (A's Low):** not reproducible with real-browser discrete events. No browser evidence either way.
- **Planning-gap data point for RETRO 260 (info):** A met the IM4 collision (`insert-marker-ui`) outside B's L23 pre-check. That pre-check applied only the strings changes (items 3–4) to the scratch, not item 1's behaviour, so "insert-marker-ui stayed green" said nothing about item 1.
- **Playing "after the playhead" at the project end** is not reachable in the browser: playback auto-stops at the end (A's ruling 2, confirmed by C's control run).
  - C used A's alternative: Home, Space, then two quick Ctrl+← gives `No more markers before the playhead` while playing, at both viewports.
  - IM24 pins the "after" text in jsdom.

## Acceptance (task §5)
| ID | Result | Evidence / numbers (1440×900 · 1280×720) |
|---|---|---|
| C-SCOPE-252 | PASS | <ul><li>HEAD is `83b7c756…`.</li><li>Status is exactly 13 × `M`, all grants, with nothing untracked.</li><li>Frozen list (1,097) rc 0 and root files rc 0.</li><li>The 7 protected files: `git diff --quiet` rc 0, and each appears once in the frozen list.</li><li>`git status` was identical before and after C's mutant runs.</li></ul> |
| C-UNIT-252 | PASS | <ul><li>Covering set `b-round-251/covering-252.txt` (130 files): **1,956/1,956 passed**, rc 0 (`c-round-252/covering.{log,json}`).</li><li>**Not fully alone:** C started the HEAD control dev server (vite compile and dep optimisation on `:5174`) while this run was in progress. No browser job overlapped it. The timings match A's alone run (same slowest tests, same 26 %), so the result is kept, and the overlap is disclosed here.</li><li>**Removed-assertion check (policy):** the test diff removes 8 `expect` lines, and each has a replacement in the same place. The title literals become the new titles. IM4's playing status becomes the composed text plus `data-follow-mode="paused"`. The 6 `No more markers … playhead` asserts become R-NONE `… insert marker` (stopped rows). No test's only change is a removal.</li><li>FW1–FW7, IM22, IM24 and ST11 each found once, all passed.</li><li>Slowest tests: PERF-FADER-b, 7.4–7.9 s of a 30 s timeout (26 %).</li></ul> |
| C-MUT-252 | PASS | C's own scratch `/tmp/c252-fix` with A's `mutate252.py` (read first, copied to `c-round-252/mutants/`):<ul><li>FIX-CONTROL: green.</li><li>MU-IM22-REDPROOF: **IM22 red** (`'00:03.961' to be '00:03.000'`).</li><li>MU-IM22-REDPROOF-HEAD-ROW: green (the old vacuity, confirmed).</li><li>MU-FW-NO-PAUSE: FW1, FW2, FW6 and IM4 red.</li><li>MU-FW-NO-RESUME: FW3 red.</li><li>MU-FW-NO-STOP-RESUME: FW6 red.</li><li>MU-NAV-LIVE-ORIGIN: IM24 red.</li><li>tsc rc 0 on every mutant (`c-round-252/mutants/logs/summary.txt`).</li></ul> |
| C-FOLLOW-PAUSE-252 | PASS | <ul><li>Lower zone (aim = `arrangement-bars-ruler`): `on` → `paused`, `Follow ‖`.</li><li>Status exactly `Insert marker at 00:06.500 — playback continues, Follow paused. …` (1280: `00:04.750`).</li><li>The marker equals the status time and is on the grid.</li><li>The playhead advanced 1.599 s / 1.559 s in 1.5 s, and audio RMS stayed above 0 (0.0007 / 0.0013).</li><li>MutationObserver: exactly **one** status write.</li><li>HEAD control: Follow stays `on` with the old text.</li></ul> |
| C-FOLLOW-SECONDS-252 | PASS | <ul><li>Seconds ruler (aim = `arrangement-ruler`): `paused` with the composed text.</li><li>The playhead advanced 1.500 s / 1.492 s.</li><li>Stop gives `on`.</li></ul> |
| C-FOLLOW-RESUME-252 | PASS | <ul><li>Paused by a ruler click, then a strip click at scroller right − 100 px (x = 1340 / 1180) gives `on` and `Follow is following the playback position again.`</li><li>12 samples over 3 s: all `on`.</li><li>`scrollLeft` went 0 → 589 / 0 → 482 by 750 ms (follow scroll) and was not read back as a manual scroll.</li><li>**HEAD control** (paused by a manual scroll, the same strip click): stays `paused`, and `scrollLeft` stays 0 for all 8 samples.</li><li>**Fix, Follow off control:** scroll stays put.</li></ul> |
| C-FOLLOW-OFF-252 | PASS | <ul><li>Follow off, then a strip click: `off`. Then a lower-zone click: `off`.</li><li>The status is the HEAD text `Insert marker at 00:06.500 — playback continues. Stop, then Space plays from here.`</li><li>The scroll stayed put.</li></ul> |
| C-FOLLOW-STOP-252 | **FAIL** | `on` and `Follow` are correct, but the status after Stop is still the "… Follow paused …" text. See C-R252-01. |
| C-FOLLOW-STOPPED-252 | PASS | Stopped, Follow stays `on` for both clicks:<ul><li>lower zone (x = scroller right − 300, aim verified; A's metronome aim trap avoided): marker 0 → 6.500 / 4.750;</li><li>seconds ruler: 5.250 / 3.500.</li></ul>Neither status has a Follow text. |
| C-FOLLOW-LANE-252 | PASS | Playing, an SFX-lane click: marker 0 → 6.500 / 4.750, status `Insert marker at … — playback continues. …` (HEAD text), Follow `on`, still playing. |
| C-FOCUS-252 | PASS | <ul><li>`document.activeElement` is BODY before and after every Follow row, in every FOLLOW row.</li><li>L50 regex over grants 1–2: 20 + 12 = **32 hits**, the same as HEAD (20 + 12). No new hit.</li></ul> |
| C-NAV-ORIGIN-252 | PASS (amended) | **Amended:** the playing "`… after the playhead` at the end" clause cannot be reached in the browser, because playback auto-stops at the end. C ran the "before the playhead" playing case instead; the "after" case is pinned in jsdom only (IM24). **B: please rewrite this row.** <ul><li>Markers at 2.000 and 6.000. Marker at 1, Space 3 s, Space: stopped at 3.98 with the marker at 1.000.</li><li>**Ctrl+→ gives marker 2 `aria-current`, insert marker 2.000, playhead 2, clock `00:02.000`.** Then 6 → 16 (end edge), then `No more markers after the insert marker`.</li><li>**HEAD control: Ctrl+→ jumps to 6.000**, and the end text is `… after the playhead`.</li><li>Playing (from 1, playhead 2.56), Ctrl+→ goes to 6.000, so it uses the live origin (insert-marker origin would give 2).</li><li>Playing "none" (A's recipe): `No more markers before the playhead`, still playing.</li></ul> |
| C-TITLES-252 | PASS | <ul><li>`arrangement-ruler` and `arrangement-bars-ruler` titles are both exactly `Click = insert marker · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit / Zoom to selection`.</li><li>After a range drag on the clip, the range body title is `drag = time selection · click = insert marker`.</li><li>No `[title]` still contains `click = playhead`; the HEAD control has 3 such titles.</li></ul> |
| C-PASTEND-252 | PASS | <ul><li>The transport reads `end 00:16.000`.</li><li>Stopped strip click at 15.96 s (snaps): `Insert marker (00:16.000) is at the end of the project — there is nothing to play here. Home returns to 0.`, not playing, marker 16.000.</li><li>Alt-click at 16.3 s: `Insert marker (00:16.307) is past the end of the project (00:16.000) — …`, not playing.</li><li>The script's own `end` regex mis-parsed the label (harness only; the values were read by hand from `fix/c252.json`).</li></ul> |
| C-STATUS-WIDE-252 | PASS | <ul><li>Composed Follow text: 1 line, h 16, sw = cw (1416 / 1256), no transport overlap.</li><li>At-end text: 1 line, the same box as the longer past-end text (1 line, no overlap).</li></ul> |
| C-COPY-252 | PASS | The §0.3 grep finds only `strings.ts` `noneAfter` and `noneBefore` (the listed keep-hits). |
| C-BUDGET-252 | PASS | Empty / demo: 85 / 101 at 1440 and 69 / 85 at 1280, equal to round 251 and to the HEAD control (85 / 101, 69 / 85). |
| C-LESSON-252 | PASS | `lessons.md` is 58 lines (≤ 60), and L52 is present. |
| AN-REVIEW-252 | PASS | <ul><li>Doc 191 l.4 is byte-exact `**სტატუსი:** Completed (C round 252 PASS)`. That is A's L28 claim; it becomes true only if this round passes, and with this FAIL it is not yet true.</li><li>The 7 TEMPLATE headings are present, in order.</li><li>Every cited row id exists: EN4, FW1–7, IM4, IM22, IM24, MU6, NS4, SK6, SK10, ST11, ST12, ST17, ST34.</li><li>The 6.2 quote matches §3 verbatim.</li></ul> |
| LAB-SMOKE-252 | PASS | <ul><li>Plays (RMS 0.020 / 0.024).</li><li>Exported WAV: 48 kHz, 24-bit, 2 ch, 768,000 frames = 16.000 s, 0 NaN, peak 0.2967, −24.91 dB.</li><li>sha256 `1fea093b…` equals round 251 (export unchanged).</li><li>0 page errors.</li></ul> |
| Auth | PASS | <ul><li>Fresh context, no cookies: `/studio-lab` opens the demo, and `auth_user` is null.</li><li>`/studio/middle-east` shows `Sign in required`, with 0 `audio[src]` and no workspace.</li><li>`/api/studio-token` returns 401 with no header and 500 with a fake bearer, never 200. Premium is not bypassed.</li></ul> |
| Purchased origin | BLOCKED | Backend unavailable in cloud. |
| gate | gate | full vitest, typecheck, lint, build, verify, e2e smoke: root gate. |

**§6 neighbours (browser), both viewports:**
- A ruler ↔ drag while playing still pauses with `Follow paused by manual navigation. …`, and Stop then resumes it (`on`).
- A strip click while playing with Follow `on` jumps (0.65 → 8.55 / 8.05), keeps playing, writes **no** status (0 mutations), and the auto-scroll moves with Follow staying `on` for all 16 samples (4 s).
- **A stopped strip click (BR2, the `playFromRuler` stopped branch) works** (row `stripStopped`, `fix-run3.log`):
  - aim `arrangement-bars-scrub-strip` at 4.07 s;
  - marker 4.000, playing, playhead 4.023 after 60 ms and 4.72 / 4.74 after 760 ms;
  - RMS 0.012 / 0.010, Follow `on`.
- The library line names the insert marker (`Active track: Music · insert marker 00:04.750`, in the screenshot).
- The export hash is unchanged.

## Ableton conformity (separate from the CZABA requirement)
| §3 row | Status |
|---|---|
| Pause on a beat-time ruler click (6.2) | **Confirmed** (browser, bars lower zone) |
| Pause on a horizontal scroll (6.2) | Confirmed (unchanged from HEAD; drag-pause measured) |
| Pause on an edit (6.2) | **Unconfirmed / not built**: listed deviation SABA-Q-FOLLOW-EDIT-RESTART (a), `awaiting_user` |
| Resume on a scrub-area click (6.2) | **Confirmed** (strip, with HEAD control) |
| Resume on stop (6.2) | **Confirmed** for the Follow state. Live has no status line, so C-R252-01 is a CZABA-only text issue. |
| Resume on a playback restart (6.2) | Partial: Space-play (HEAD) and strip are confirmed. Marker-flag play is an inference, SABA-Q-FOLLOW-EDIT-RESTART (b). |
| A track click while playing (6.3) | Deliberate difference / inference (Live names no Follow effect). CZABA leaves it unchanged; measured. |
| Time-ruler click (6.1 item 15) | Deliberate difference: SABA-Q-TIME-RULER-ROLE (a)/(b), `awaiting_user` |
| Follow-resumed status | Not applicable (CZABA addition) |
| Prev/Next locator origin while stopped (6.3/6.4) | Unconfirmed in the manual (origin not stated); CZABA uses the insert marker, measured |
| Quantized locator jump (6.1 item 6) | Deliberate difference, listed (SABA-Q-10A-DEVIATIONS (d)) |
| Follow toggle shortcut | Deliberate difference, listed (button only) |
| At/past end | No reference found; CZABA wording measured |

## Files
- `c-round-252/c252.cjs`: the browser script.
- `c-round-252/fix/c252.json` and `c-round-252/control/c252.json` (HEAD), with screenshots in each.
- `c-round-252/covering.{log,json}`.
- `c-round-252/mutants/` (summary, logs, status before and after).
- `c-round-252/source.diff`.
- Runs: `fix-run1.log` (pastEnd aim error from C's own scroll math and a neighbours script error where C toggled Follow off; both fixed and re-run in `fix-run2.log`), and `control-run1.log` (the first cold control budget load timed out at 150 s and was re-run once).

The scratch copies `/tmp/c252-fix` and `/tmp/c252-control` are outside the repo. C changed no app source.
