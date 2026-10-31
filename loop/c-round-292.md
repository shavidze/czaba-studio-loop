# C round 292: FIX-PD-1c narrow-window state for `/studio-lab` + LRS4 timeout

**Verdict: FAIL.** One Medium bug was found, and this round caused it: **C-R292-01**. All 20 specified acceptance rows pass. `browserVerified` and `realVerified` are both true, because every browser row ran in Playwright Chromium against `127.0.0.1:5173`. Source was read-only, and C made no app edits.

## C-R292-01 (Medium, origin B spec §3.3 / A known gap; caused by this round)
**The library preview keeps playing behind the narrow screen, and the narrow screen has no control to stop it.**

Steps:
1. Fresh context at 1440×900 (repeated at 1280×720). Wait for `Demo collection ready`.
2. Select the library option `Bass` and press `Preview`. The master tap reads ≈ 0.047 RMS.
3. Resize the window to 899 px (also tried 390 px).

Measured master-tap RMS after the resize:

| Time after resize | RMS |
|---|---|
| 0.3 s | 0.102 |
| 1 s | 0.048 |
| 2.5 s | 0.046 |
| 5 s | 0.096 |
| 10 s | 0.103 |
| 20 s | 0 (the preview's natural end) |

- The narrow screen offers only the native `<audio>` and `Send link`; neither stops the preview.
- After widening, the library button still reads `Stop`.
- At HEAD the workspace stayed mounted at 899 px, so the preview's Stop button was still reachable. This is a new regression.
- `StopPlaybackOnNarrow` stops only the transport (`togglePlayback`), exactly as §3.3 says. A reported the gap from code reading; C confirmed it in the browser.

Evidence: `c-round-292/c292.json` rows `X-LIBRARY-PREVIEW` and `X-PREVIEW-LIFETIME`; screenshots `shots/libpreview-1440-narrow.png`, `libpreview-1280-narrow.png` and `libpreview-390-after-narrow.png`.

For B: the next task needs a grant to stop the library preview when the narrow state latches (and a row that turns red without it). C proposes no source change.

## Rows
| Row | Result |
|---|---|
| CLAIMS | PASS. K1 is `88b23dd`. Only the expected deltas changed: K2 9, K3 rc1, K5 `91 2 0`, K7 `193 379`, K8 `180 264 1`, K11 `218 1`, K12 `exists exists 2`, K13 `386 3906 2`. K14 also gains `studio-narrow-gate-ui` (INFO). The L29 grep returns 35 hits; none is an untagged fact about current store code (`c-round-292/l29-untagged.txt`) |
| SOURCE-SCOPE | PASS. Exactly the 9 §4 paths changed. `sha256sum -c` fails only on the 5 granted files |
| TYPECHECK | PASS, rc 0 |
| UNIT | PASS. 8 files, 145 tests. The highest timeout shares: LRS4 2578 / 15 000 ms, NG5 2185 / 15 000 ms, MS1 1657 / 5000 ms (33 %). Nothing is above 50 % |
| UNIT-MUTANTS | PASS. All 9 mutants turn a row red (`mutants.json`). Server snapshot `false` turns only NG9c red; NG3 stays green, which confirms A's D2 |
| B-NARROW-LOAD | PASS at 390, 768 and 899: body focus, the exact h1 and body line, no `arrangement-exit`, `scrollWidth` equals the viewport, the exit link goes to `/`, 0 hydration warnings |
| B-BOUNDARY | PASS with JavaScript on and off, at 899 and 900 px |
| B-DESK-SAME | PASS. 0 differing pixels at 1280×720 and at 1440×900 |
| B-THEME | PASS. Background `rgb(14, 13, 12)`, audio `color-scheme` dark. Contrast: heading 15.62:1, body line 7.06:1 |
| B-AX | PASS. One h1, the `Audio` element is named `Middle East — public preview`, the `Send link` button and a `status` region are present, one `main` |
| B-FOCUS-ORDER | PASS. exit → audio → Send link, with a 1 px brass outline on each. The audio adds 5 internal native stops, which show Chromium's own ring (INFO) |
| B-PREVIEW | PASS. Duration 101.35 s before Play. `currentTime` advanced +1.005 s in 1 s. Pause stops it |
| B-SEND | PASS for (a), (b), (c) and (d). After a second failed copy, the field is focused again |
| B-AUDIO-ERROR | PASS |
| B-RESIZE-KEEP | PASS at 1440 and 1280. The literal recipe's RMS check is vacuous: the Bass clip lands on the Music lane, which the recipe mutes. The unmuted variant measured 0.045–0.048 while playing and 0 at +100, +200 and +300 ms |
| B-NARROW-WIDE | PASS. Focus goes to `arrangement-exit`; Play gives RMS 0.048 |
| B-NET | PASS. Media URLs at 390 are the same set as HEAD; 3 requests, all aborted |
| B-JOURNEY-292 | PASS. 5 screenshots: `journey-1…5` |
| G292-AUTH | PASS. Anonymous `/studio-lab` works at both widths, with `auth_user` null. The legacy route shows `Sign in required` with 0 `audio[src]`. The token API returns 401 without a header and no token |
| DOC-218 | PASS. Line 4 is byte-exact, the headings are in order, every cited id exists, and the limitation and both Saba questions are recorded |
| X-BODY-KEYS / X-DELETE-SELECTED (C extra) | PASS. In the latched narrow state with focus on body, the keys do nothing. A selected clip survives Delete; in the wide control run, Delete removes it |
| gate | Full suite, build, Biome, `verify` and smoke belong to root's gate |

## INFO for B
- **Recipe:** B-RESIZE-KEEP's recipe is vacuous for RMS, because the clip is on the muted lane.
- **D1:** the status line is an `<output>` element instead of `<p role=status>`. The AX tree still exposes the `status` role; B should acknowledge it.
- **D2:** the "server snapshot false" mutant belongs to NG9c, not NG3.
- **K14:** the claim gains the new test file; §6 did not list it.
- **D4:** no hydration warning appeared in Chromium at any width.
- **Desktop media:** the hidden narrow `<audio>` adds one media request on desktop. This belongs to B-R291-NARROW-PREFETCH.
- **Ableton conformity:** not applicable (Live has no browser version). CZABA requirement: met, except C-R292-01.
- **Doc 218 line 4:** it reads `Completed (C round 292 PASS)`, which is false after this FAIL. Under L28 the fix-up round implicitly grants that line for rewriting to the passing round number; B should list it in the round-293 task.
- **Origin of C-R292-01:** B spec, plus A self-check (L11). A reported a Medium regression as a "known gap" note, not as a STOP.
- **C-R292-01, how the user hears it:** in that state, pressing the narrow screen's native Play starts the Middle East preview, with `currentTime` 1.46 s. The Studio master tap still reads 0.062 RMS, so both sources sound together. Evidence: `c-round-292/mix-probe.json` and `shots/libpreview-390-native-play-mix.png`.
