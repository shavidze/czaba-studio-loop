# C round 84: independent verification of SRW-19 (video opacity fade, R19-F1/R19-F2) and X1 (C-R83-L1)

**Verdict: PASS.** `browserVerified=true`, `realVerified=true`. Every SRW-19 and X1 acceptance row passed in a real browser at both viewports.

- **Bugs for B:**
  - **C-R84-M1 (Medium):** the P-M1 probe **reproduced**. Fade handles paint over the sticky track header and stay grabbable. A real drag edited a hidden video clip's fade.
  - **C-R84-L1 (Low):** WAV export is not bit-reproducible over the video-sound span (±1 LSB).
- **BLOCKED:** the fake-Bearer 403 sub-check of G84-3, because the backend is unavailable in the cloud.
- **Gate rows** (full vitest, typecheck, build, Biome, verify, e2e smoke) are not claimed here.

## Environment
- `env-status.json`: store 200, round 84.
- Browser: Playwright Chromium (headless), anonymous fresh context, real `page.mouse` and keyboard. Each session started with a warm-up load.
- Viewports: **1440x900** and **1280x720**.
- Media:
  - built-in demo audio (Middle East on music @0.35, `ღამის პულსი · პულსი` on stems @2–18, Soft impact on sfx @4);
  - owned synthetic `media/beeps-6s-vp9-opus.webm`. It decodes here (`videoWidth` 640, frames painted), so the pixel sub-checks ran.
  - Nothing was uploaded.
- V was imported at 0, then moved +80 px with Snap off. Actual values used in every oracle: **S = 2.000**, length 6.0078, **E = 8.0078**, 40 px/s.
- Files:
  - scripts in `c-round-84/tools/` (`lib84`, `r1` video rows, `r2` export determinism, `r3` X1/EN/P-M1, `pm1b`, `g84`, `tok`, `ana`);
  - raw results in `c-round-84/*.json`; screenshots in `c-round-84/shots/`;
  - WAVs were deleted after analysis.
- **Harness incident:** one 1280 r3 run and one 1440 g84 run were cut by "Execution context was destroyed". The cause: I ran them in parallel, and the other session's first visit to `/` triggered a dev-server reload. Both were re-run alone and the re-runs are the evidence.

## Source unchanged (start = end)
- HEAD `a68c81d` at start and end. `git status` shows 6 M + 4 ?? (the task's file table).
- Frozen list: 478/478 OK. A's `end-hashes.txt`: 10/10 OK. Protected files: 4/4 (`cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`). The auth files are untouched.
- Doc 073 l.4 is exactly the required line (1 insertion, 1 deletion). Doc 074 exists with status `Round 84 — იმპლემენტირებულია, C-ის შემოწმებას ელოდება (D-29z49)`.
- A grep of doc 074 finds the required topics: `fadeIn` reuse, `bg-background`, overlay vs `opacity-0`, X1 and the §28 / D-11 differences. It is Georgian.
- **T84-TARGETED:**
  - re-run of A's 51-file list: **51/51 files, 980/980 tests** (`c-round-84/vitest-targeted.txt`);
  - a grep shows no test that imports the changed modules is missing from the list.

## Acceptance (identical at both viewports unless noted)

| ID | Result | Evidence |
|---|---|---|
| VF-HANDLES | PASS | V has `arrangement-video-fade-in/out-handle` with the exact titles `Video Fade In/Out — სურათი (ხმა არ იცვლება) · drag · double-click = 0`, and 0 `arrangement-clip-fade-*` elements. The stems audio handles are unchanged (`Fade In — drag · double-click = 0`). Env mode: no video or audio handles. Folded video lane (`data-track-folded=true`): none. Unfold: handles back. Shots `vf-handles{,-env,-folded}-*.png` |
| VF-IN (R19-F1) | PASS | A +40 px drag gives `data-fade-in="1.000"`. Status during the drag is `Video Fade In: 1.000 წმ`; after release `…წმ.`. Undo shows `Video Fade In`. `arrangement-video-fade-ramps` is present |
| VF-PREVIEW stopped | PASS | Seeks to 1.5 / 2.25 / 2.5 / 2.75 / 3.5 s gave `data-video-opacity` 1 / 0.25 / 0.5 / 0.75 / 1. The overlay's computed opacity is exactly 1 − value |
| VF-PREVIEW play | PASS | Play from 1.5 s for 2.9 s, sampled every animation frame (153 samples, 90 on the ramp). Before S the opacity is 1, since there is no clip there. The ramp starts at 0.001 at pos 2.001 and is monotonic up to 1.000. Max \|value − (pos − S)\| = 0.000, max \|overlay − (1 − value)\| = 0, and the position never ran backwards. (My first analyser expected 0 before S, which was a C oracle error; I re-analysed the same raw samples, `ana.cjs`, `r1-play-faded-*.json`) |
| VF-PREVIEW pixel | PASS | Mean luminance of the box centre: background (S) 9.7 < S+0.25 39.4 < S+0.75 98.9. The no-fade reference at the same seeks is 129.3 / 128.4. Full opacity matches the reference (128.29 = 128.29). Shots `vf-box-*.png`, `vf-box-ref-*.png` |
| VF-OUT | PASS | A −80 px drag gives `fadeOut 2.000`, status `Video Fade Out: 2.000 წმ.`, Undo `Video Fade Out`. At E−1.5 / E−0.5 the value is 0.754 / 0.254, matching (E−t)/2 with E = 8.0078 (±0.01); at E−2.5 it is 1 |
| VF-FLOAT | PASS | The expanded box (`data-video-expanded=true`, 272x153 / 189x106) contains the overlay, with `0.500` and opacity 0.5 at S+0.5. It returns to the dock afterwards. Shot `vf-float-*.png` |
| VF-EDITS | PASS | (a) Move +1 s: start 3, fades 1/2; at 3.5 / 3.25 the value is 0.500 / 0.250 (shifted). (b) Trim start +0.5: start 2.5, in 1.000 / out 2.000, equal to `clampClipFadesAfterTrim`. Extra clamp case: in 3 / out 2, trim +2.5 s, so in = 1.508 as the formula requires. (c) Ctrl+E at 5.000: left [2,5] in 1 / out 0, right [5, 8.008] in 0 / out 2. (d) Ctrl+D: the copy at 8.008 carries 1/2. Every Ctrl+Z restored the exact state |
| VF-UNDO | PASS | Each drag makes one entry, and Ctrl+Z / Ctrl+Y restore exactly (1.000 ↔ 0 and 1.500 ↔ 1.000). A double-click more than 1.2 s after the drag gives 0.000, status `Video Fade In: 0.000 წმ.`, one entry, and Ctrl+Z gives 1.000. A still press writes nothing (undo title and fades unchanged) |
| VF-AUDIO | PASS (see L1) | 1440: faded and unfaded WAV sha are equal (`3b3010fd…`), max diff 0, 4,881,696 frames, 48k/24-bit/2ch, no NaN. 1280 (r1 session): max diff 1 LSB. A control showed this is export jitter, not the fade: two exports of an **unchanged** state also differ by 1 LSB, only within 2–8 s. The faded export in r2-b has the same hash (`3b3010fd…`) as an unfaded export in r2-a, so a sample-identical faded/unfaded pair exists at 1280 too. The video's own sound is present and not faded: the faded export minus a video-muted export has a max diff of 0.507 within S..S+1 |
| VF-EXPORT (R19-F2) | PASS | The video option stays disabled with the unchanged reason. With a fade, exactly one `arrangement-export-video-fades` line appears, with the exact text. Without a fade it is absent. The only download is `czaba-studio-lab.wav`. Shots `vf-export-{faded,nofade}-*.png` |
| VF-PLAY-EDIT | PASS | A drag during playback gives 1.500 with one `Video Fade In` entry. Playback continued (Δpos 0.32 s over 20 frames), the position never ran backwards, and there was no console error. Ctrl+Z gives 1.000. **SRW19-RESCHEDULE signal:** 4 extra `createBufferSource` calls (12→16) at both viewports |
| VF-SYNC | PASS | Stopped, at S+0.5 / S+3 / S+5: `currentTime` 0.5 / 3 / 5, error 0, with and without fades. Playing (1 paired run per viewport, within budget): max \|ct − (pos − S)\| was 0.0256 faded vs 0.0252 no-fade at 1440, and 0.0236 vs 0.0214 at 1280. That is well inside +0.05 of the control. The no-fade control's opacity was 1 throughout |
| X1-ALIGN (C-R83-L1) | PASS | At 40 px/s, double-clicks at ruler 6/10/14 store `6.000/10.000/14.000` (Δ = 0). Point centre − ruler x = 0 px. Polyline vertex − point = 0 px. The line's right end − clip right edge = 0 px. At 32 px/s (zoom −), 5/9.5/13 store `5.000/9.500/13.000`, again with 0 px offsets. Short EN-ADD / EN-DRAG (−12.0 dB at 10.000) / EN-UNDO (delete + Ctrl+Z/Y) re-runs passed. Shots `x1-40-*.png`, `x1-zoom2-*.png` |
| P-M1 (probe) | **REPRODUCED → C-R84-M1** | Envelope point under the header: the header is topmost (`arrangement-track-fold`) and the Mute click hit the header. The video fade-in handle scrolled under the header (x 312/362, header right edge 512) is itself topmost (`z-index 40`). A real drag there changed the hidden clip's fade 1.000→2.000 (Undo `Video Fade In`). The audio fade handle (`z-index 30`) is topmost there too (pre-existing). Mute 11 px lower still hit the header. Note: `"repro":false` in `r3-*.json` refers only to the Mute-click sub-probe; the reproduction is the `pm1b` handle probe. Shots `pm1b-{video,audio}-*.png` |
| REG-HYD | PASS | No hydration or `useLayoutEffect` warning and no non-noise console error in any session (r1, r2, r3, pm1b at both viewports) |
| G84-3 | PASS (one sub-check BLOCKED; follows the round-83 handling) | `/studio/middle-east` anonymous shows "Sign in required" with 0 workspace. `/api/studio-token?product=middle-east&file=stem1.wav` anonymous returns 401 (also from inside the page). `/studio-lab` made no token, R2 or download request and sent 0 Authorization headers. The visible header link "Studio Lab Demo" opens `/studio-lab` with the demo badge. Fake Bearer returns 500 "Unable to prepare Studio access": BLOCKED, backend unavailable in cloud |
| T84-TARGETED | PASS | 51/51 files, 980/980 tests |
| SOURCE-UNCHANGED | PASS | See above |

## Bugs for B

### C-R84-M1 — Medium — Fade handles escape the sticky track header (hidden clip fades editable through the header)
- **Steps:**
  1. Open `/studio-lab` and import the VP9 media. Move V to 2 s and give it a 1 s video fade-in. Give the stems clip a 1 s fade-in.
  2. Hover the clip, then wheel-scroll horizontally (deltaX ≈ 276) so the handle is at x≈362, under the header.
- **Expected:** the header covers the clip content beneath it.
- **Actual:** the handles are drawn on top of the header and are topmost for hit-testing. A drag there edits the hidden video clip (1.000 → 2.000).
- **Scope:** the audio handle is the same class and pre-existing (gate-83 reviewer M1). Envelope points are correctly covered.
- **Evidence:** `pm1b-*.json` and the shots.
- **Not reproduced:** a header Mute click a few px below the handle worked. That sub-probe is the `"repro":false` in `r3-*.json`.
- **Observed, unexplained:** on the audio handle under the header, the same drag reported status `Fade In: 1.000 წმ.` while the value and Undo stayed unchanged. B should not read this as a clean negative.

### C-R84-L1 — Low — WAV export is not bit-reproducible over video sound
- **Confirmed facts:**
  - (a) Two exports of an unchanged arrangement differ by ±1 LSB (24-bit) in ≈6.4k–7.7k samples, only within 2–8 s (the video clip's span).
  - (b) Exactly one hash, `3b3010fd…`, was produced both by a faded export and by an unfaded export.
  - (c) About 10 exports gave 6 distinct hashes. That is not a demonstrated cycle.
  - (d) Per-second differing-sample counts in the fade windows are **not elevated** for faded vs unfaded (n1–f1: 2 s 564, 3 s 510, 6 s 547, 7 s 541). The unchanged control (n1–n2) had 624 / 582 / 621 / 685.
- **Inference:** the video fade has no effect on the audio; the jitter is in the export of the video's own sound.
- **Impact:** inaudible, but it makes "max difference 0" oracles flaky. It is likely pre-existing: the audio path is in frozen files.
- **Evidence:** `r2-1280x720-{a,b}.json`.

## Ableton match (separate from the CZABA requirement)

| Behaviour | Status |
|---|---|
| Video clips get the same fade handles and linear `in + out ≤ length` rule (§28.2.1, §6.8) | Confirmed (text), implemented the same way |
| A fade goes to the same black as a gap (§28.2.2.1) | Confirmed for gaps; the fade itself is a CZABA addition (FB-07); Ableton match = not applicable |
| Video render in export (§28.3) | Conscious difference D-11, stated in the dialog |
| A video-clip fade also fades its sound | Unconfirmed in Live; CZABA = picture only (V3) |

## Signals
- **SRW19-RESCHEDULE:** 4 source restarts per video-fade edit during playback.
- **VIDEO-FADE-SOUND:** the video's own sound is audible in the export and is not faded.
- **Harness note:** A's whole-pixel note held. With integer `tx()` there was no 1 px loss.
