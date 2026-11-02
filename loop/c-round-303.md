# C round 303 — NAME-AND-HINT-b verification

**Verdict: PASS.** browserVerified = realVerified = true. Bugs: 0. Info: 3. Gate rows (full vitest, build, verify) are not claimed.

Tree: HEAD `1fd0129`, plus A's 9 granted paths (unchanged from the start to the end of C's phase: `c-round-303/scope-start.txt`, `scope-end.txt`). Server: env-status 200. Loop mock API started for store pages and stopped afterwards.
Browser: Playwright Chromium, a fresh context for each row, 1440×900 and 1280×720, untimed warm-up first. Media: only the repository's own `public/videos/hero/1.mp4`, used locally.

## Browser rows (both viewports, identical results)
| Row | Result | Evidence |
|---|---|---|
| H-FIRST-ENTER | PASS. The status is exactly `“Middle East — public preview” added to the Music track at 00:00.000. Drag a clip by its name bar to move it.` There is 1 `arrangement-status`. MutationObserver sequence: ready text → hint text, with no intermediate write. | main.json `firstEnter`, shots/first-enter-* |
| H-SECOND | PASS. With `demo-hero-music` (no BPM), the second add shows `“CZABA hero — public preview” added to the Music track at 01:41.352 (nearest free spot).`, with 0 occurrences of `name bar`. Also tried `demo-stem-pulse` (BPM): no hint, and the seed text (same shape as the HEAD seed) is appended. Note: `rows2.json` `plainExact=false` is a probe regex false negative (wrong title assumption). C's title-agnostic re-check gives `plainExactGeneric=true` (INFO-C303-SECOND-REGEX). | rows2.json `second`, main.json `firstEnter.second` |
| H-FIRST-DROP | PASS. A native HTML5 drag from the library to the empty Music lane at x=200 adds a clip at 00:05.000. The status ends with `. Drag a clip by its name bar to move it.`, once. | main.json `firstDrop`, shots/first-drop-* |
| H-SEED | PASS. The text is exactly the HEAD reference (`b-round-302/probe-status.json` `fullmix.added`, the method B allows) with the hint inserted after the first sentence: `… at 00:00.000. Drag a clip by its name bar to move it. Tempo 120 BPM … Snap on — grid 1/2 (G)`. Sequence: add+hint → add+hint+seed. | main.json `seed` |
| H-UNDO | PASS. First add has the hint → `Undo: Add — Middle East — public preview` (0 clips) → the second add is plain, with no hint. | main.json `undo` |
| H-RELOAD | PASS. After reload, Enter shows the hint again. | main.json `firstEnter.reload` |
| H-VIDEO-FIRST | PASS. Video statuses: `Opening “1.mp4”…`, `“1.mp4” added to the video track: 00:00.000 — 00:12.969`. 0 of them contain the hint. The next Enter add shows the hint. | main.json `videoFirst`, shots/video-first-* |
| H-BEHAVIOUR | PASS. (a) A 100 px body drag: cursor `text`, `arrangement-range` = `00:01.500 — 00:04.000`, clip left stays 0. (b) A 100 px name-bar drag: cursor `grab`, title `… — drag to move`, left 0→100 (dx = 100), range absent. | main.json `behaviour`, shots/behaviour-* |
| H-BOX | PASS. Output 16 px = line-height 16, 1 rect, no overflow, footer 53 px. Timeline height unchanged: 512 at 1440 and 402 at 1280. This was compared with the ready state of the same build (HEAD behaviour, since the change touches only status text), not with a separate HEAD server. Longest text (seed): 1162 px in 1416 / 1256 px. | main.json `box`, `seed.box` |
| H-SR | PASS. 1 live region (`output` aria-live=polite, AX role status) contains the hint, once. Its AX StaticText holds both sentences. No other live region repeats it. | main.json `firstEnter.sr` |
| H-BUDGET | PASS. Visual rows/text lines: empty 56/95 (1440) and 49/78 (1280); one clip 59/113 and 51/95. These are identical to the 1fd0129 baselines (`c-round-302/budget*.json`), with 0 added and 0 removed lines. | rows2.json `budget` |
| H-JOURNEY | PASS. `/` → nav "Studio" → Enter (hint) → name bar +100 px → Space (clock 0.27 → 1.57 s, Playing) → Stop (Stopped) → Export WAV → `← CZABA` back to `/`. WAV: RIFF/WAVE PCM, 2 ch, 48 kHz, 24-bit, 103.852 s (= the end of a clip moved to 2.5 s + 101.352 s), 97.4 % nonzero samples, 0 NaN, RMS −15.4 dB. A screenshot was taken at each step. | rows2.json `journey`, shots/journey-* |
| RV-EN | PASS. 0 Georgian characters in innerText or AX names in the clip-added state. The only new visible text is the English hint. | main.json `firstEnter.geo` |
| G303-AUTH | PASS (2nd run; the 1st was environment-invalid, INFO-C303-AUTH-ATTEMPT1). `/studio-lab` is anonymous, with `auth_user` null and the badge shown. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token`: 401 with no header, 403 with a fake bearer, 400 bare, and no token in any body. | auth/g303-auth.json |

Page errors: 0 in every row.

## Offline rows
- **SOURCE-SCOPE: PASS.**
  - Exactly the 9 §5 paths are changed.
  - `sha256sum -c` fails only on the 8 modified paths.
  - Both source grants are `cmp`-equal to the sketches, at the start and at the end.
  - The 7 protected files have no diff.
- **CLAIMS: PASS, with a ruling.**
  - K2 = 9, K4 = 8, K5 unchanged, K6 = 5, K13 = `Completed (C round 303 PASS)`, K16 all ok. The rest equal HEAD.
  - K9/K10: the content is identical, but each line is +1 (INFO-C303-K9K10-LINESHIFT). This is the inevitable result of byte-equal grant 2, and A's STOP correctly raised the contradiction. C treats it as a pass on content. B confirms.
- **DOC: PASS.** l.4 is exact. TEMPLATE's 7 headings appear in order, with the stage-b section before TODO. It cites only rows that exist (NB1–NB9, NB4b and the 12 collision ids, each found in its file). It names SABA-Q-NAME-HINT-LIFETIME.
- **Unit re-run (C):** the covering set plus the NB file, alone: 20 files, 386 tests, all passed (`logs/covering.log`). Test diff: 0 removed `expect` lines and no new `toContain`/`toMatch`. A's mutant logs m1–m5 show the required red rows.

## Ableton conformity (separate from CZABA acceptance)
- Clip moves only by its bar (Live 12 manual §6.7): **confirmed** in the browser.
- Body drag = time selection (§6.9): **confirmed**.
- One-time hint: **deliberate difference** (Saba Q5, a CZABA-only aid). Live has no such hint.
- Term "name bar" vs the manual's "clip bar": Saba's verbatim copy, recorded as info.

## Extra info
- INFO-C303-WAV-PEAK: the export has peak 1.0, but only 30 isolated full-scale samples (3e-6, each run 1 sample long; `c-round-303/peak.json`). This fits a normalised source, not clipping. Pre-existing and unrelated.
- INFO-C303-A-STOP: A's STOP covers only K9/K10; the work is complete.

## Blocked
- The purchased workspace's first add in a browser: backend unavailable in cloud (SRW-21 is deferred_user). It does not affect browserVerified.

## For B
- Confirm the K9/K10 ruling (content-equal, lines may shift).
- A reviewer Low worth recording: after an edit-during-gesture refusal, `statusAfterGestureRelease` may restore the first-add text that contains the hint. This was not reproduced in the browser and is not a task violation.
