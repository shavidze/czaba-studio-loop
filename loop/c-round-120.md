# C — Round 120 verification: T12 stage 4a, the waveform shows Clip Gain (display only)

Verifier C · 2026-10-23 23:07–23:19 UTC · Playwright Chromium headless, a fresh context per session · target `http://127.0.0.1:5173/studio-lab` · env-status: store 200 (round 120, attempt 1).

**Verdict: PASS.** `browserVerified: true`, `realVerified: true`. No app bugs.

## How the drawing was measured
- C parsed `[data-clip-id=<id>] [data-testid="arrangement-clip-waveform"] path` `d` into per-column `y`, with `h = 1 − y`. Column counts came from the `viewBox`.
- The ratio rule from §5 was coded before any run (`tools/wg.cjs` `ratio()`):
  - judged columns: `|h − s·h0| ≤ 0.0006·(1+s)`;
  - clamped columns: `y = 0.000`;
  - floor columns: `y = 0.980`;
  - a row needs at least 10 judged columns to count;
  - any column past the clip edge is a fail.
- `s` comes from the field value or the fader `aria-valuetext`, read in the same moment as the drawing.
- Setup for every session: `demo-middle-east` on music @0, `demo-stem-pulse` on stems @2, `demo-soft-impact` on SFX @4, Snap off.

## Rows

| ID | Result | Evidence |
|---|---|---|
| T120-TARGETED | **PASS**: 20/20 files, **331/331** tests, run by C. This matches A's counts | `out/t120-targeted.log` |
| AN-REVIEW | **PASS**. **ArrangementClip:** only the import, the `scale` parameter, `s`, the clamp line, `gainScale` with its call site and memo deps, and the `data-testid`. **DetailPanel:** only the import, `gainScale`, the call site and the deps. A's deviation 1 (`gainScale` outside the memo) is behaviour-equivalent. WG1–WG8 exist and use exact `toBe` matchers. WG1 holds B's 5 literals unchanged. Doc 102 has every TEMPLATE section. **WG2 pin checked independently:** C pulled the HEAD (`4090f6e`) `buildPeakShape` out of git and ran it on A's fixture. It gives 120 columns, length 2530, sha256 `cc617f0c…`, exactly the pinned value. On the WG1 fixture it gives B's scale-1 literal | `out/an-diff.txt`, `out/wg2-head-check.txt` |
| SOURCE-SCOPE | **PASS**. HEAD `4090f6e`. Porcelain is exactly the §2 end state: 2 ` M` and 2 `??`. `sha256sum -c` on the 930 entries is OK at the start and at the end. Protected files `fa2cf0bc` / `13914809` / `56f5b76f` / `bf9ee257`, and `git diff 4090f6e` on them is empty. The granted files' sha256 did not change during C's phase | `out/source-scope-{start,end}.txt` |
| WG-SCALE 1440 | **PASS**. At −6.0 (s 0.501187): 224 judged columns, max error 0.00057, 0 violations. At +3.0 (s 1.412538): 288 judged, max error 0.00107 (bound 0.00145), 0 violations, nothing past the edge | `out/wg-1440-2.json`, `shots/WG-SCALE-{0db,m6,p3}-1440-2.png` |
| WG-SCALE 1280 | **PASS**. The same numbers, and the drawings hash the same as at 1440 (640 columns in both) | `out/wg-1280-1.json`, `shots/WG-SCALE-*-1280-1.png` |
| WG-CLAMP-FLOOR | **PASS**. At +12 (s 3.981072): 256 judged, 32 clamped at `y=0.000`, 0 violations, 0 columns past the edge. At −60: all 640 columns are `0.980…1.020`. Extra check on the music clip at +12: 652 judged, 3198 clamped, 0 violations | `out/wg-1440-2.json`, `shots/WG-CLAMP-p12…`, `WG-FLOOR-m60…` |
| WG-LIVE 1440 | **PASS**. A −20 px fader press-drag. Before release: valuetext −17.5 dB, the drawing already differs from the start, and the ratio holds (64 judged, 0 violations). The undo title is still the sentinel `Undo: Pan — SFX` during the drag. After release: `Undo: Clip Gain`. One Ctrl+Z gives back the sentinel title, value 0, and a `d` byte-identical to the start, so exactly one entry | `out/wg-1440-2.json`, `shots/WG-LIVE-mid-1440-2.png` |
| WG-LIVE 1280 | **PASS**. Identical | `out/wg-1280-1.json` |
| WG-DETAIL | **PASS**. The detail panel has 480 columns. At −6 against its own 0 dB reading: 192 judged, 0 violations | `out/wg-1440-2.json`, `shots/WG-DETAIL-m6-1440-2.png` |
| WG-MULTI | **PASS** (run 3; see the note below). Stems at −6 and SFX at 0, each set with the field. The SFX drawing did not change while stems was set. A multi-drag of −10 px moved the range from `−6.0 … 0.0` to `−14.7 … −8.7 dB` with one `Undo: Clip Gain`. Both drawings changed. Stems at −14.7: 96 judged, 0 violations. SFX at −8.7: 35 judged, 0 violations. Each was checked against its own 0 dB reading | `out/wg-1440-3.json`, `shots/WG-MULTI-1440-3.png` |
| WG-MUSTNOT | **PASS**. With stems at −6, the stems `d` stayed byte-identical after each of these: lane Volume −12, Master −12 (step 0.5), Pan −5, Mute on, Solo on, a 1.000 s fade-in (start and width unchanged), and an envelope point (envelope mode on, 1 point, `Undo: Envelope: წერტილის დამატება`) | `out/wg-1440-2.json`, `shots/WG-MUSTNOT-*.png` |
| WG-PLAY | **PASS**. A −20 px drag during playback, with music and SFX muted. 0 `createBufferSource` calls between press and release. The playhead went 2.551 → 5.001 and never moved backwards. Still playing at the end. 21 distinct drawings during the drag. All 23 valid mid-drag samples are ratio-correct for their own fader value. The final −17.5 dB drawing is ratio-correct. The real output tap fell from −13.7 to −28.1 dBFS | `out/play-1440-1.json`, `shots/WG-PLAY-1440-1.png` |
| WG-AUDIO | **PASS**. Exported WAV with only stems audible, at 0 and at −6.0: PCM 24-bit, 2 ch, 48 kHz, 4,864,896 frames (101.352 s) in both files. 0 NaN, 0 full-scale samples, no overload. **Peak ratio 0.501187, RMS ratio 0.501187**, the same as round 114. The display change did not touch the audio. The 0 dB export peak (0.2967) matches the drawing's highest column (0.297) | `out/audio-1440-1.json`, `out/exp-1440-stems-*.wav` |
| WG-VIDEO | **PASS for the disabled state**: the field and fader are disabled, the reason reads „ვიდეო კლიპს Clip Gain არ აქვს — ხმა: ხაზის Volume/Mute“, typing is refused, and the detail panel says „ტალღა არ ჩანს“. The video lane drawing exists and did not change during the attempt. **Inconclusive:** "unchanged vs before this round" has no browser baseline. It rests on code: the field reads `0.0`, so `gainDb` is undefined or 0 and the scale is 1. `Math.min(1, max * 1)` gives the same value as the HEAD line, and WG2 shows scale 1 is byte-identical | `out/video-1440-1.json`, `shots/WG-VIDEO-*.png` |
| NB neighbours | **PASS**. Zoom in 40→50 px/s (800 columns) and zoom out 50→40 (640): the −6 ratio holds at each new column count. A header move +0.5 s gives `Undo: კლიპის გადატანა` with the same drawing, and Undo restores start 2.000 with gain still −6.0. A range drag in the waveform area made a 2.000 s selection without changing start, gain or the drawing. The fade ramp and envelope draw over the scaled waveform (screenshot) | `out/wg-1440-3.json`, `shots/NB-after-move-range-1440-3.png`, `shots/WG-MUSTNOT-fade-envelope-1440-2.png` |
| G120-3 (alone, last) | **PASS**. `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. The token API returns **401** `{"error":"Please sign in to access Studio."}`. A fresh context with no credentials | `out/g120-3.json`, `shots/g120-3-*.png` |
| G120-3 fake-Bearer 403 | **BLOCKED**: backend unavailable in cloud | — |
| PX-NET / REG-HYD | **PASS**. Across all 11 measured sessions plus G120-3: 0 forbidden-host requests, 0 `Authorization` headers, 0 hydration messages, 0 `pageerror`, 0 non-noise console errors (2 known cloud-noise errors per Studio session) | `net` arrays in the run JSONs |

### Invalid and harness-only runs
- **`wg-1440-1` (invalid):** ENV-FIRST-LOAD-GRID-NULL. `setSnapOff` read a null grid control on the job's first load, before any measurement. It was replaced once by `wg-1440-2`. Its console log was not saved.
- **`wg-1440-2`, WG-MULTI and NB:** these runs failed on C's own script errors, not on the app.
  - **WG-MULTI:** C read the fields while both clips were still selected, so the fields showed the empty mixed state. The multi range text (`−14.7 … −8.7`) was already correct.
  - **NB:** C's drag in the waveform area made a time selection, not a move. C's following Ctrl+Z then undid the −6 gain set.
  - Both scripts were fixed and run again in fresh sessions (`wg-1440-3`). Both PASS.

## Bugs
None.

## Observations (process, for B; not app defects, not for `deferred_low_polish`)
- **C-R120-01:**
  - **What happened:** A's deviation 2 was one lasting formatting edit to the A-owned new test file. A made it with a Python string replace instead of the Edit tool, which bypasses the primitives hook that §2 requires.
  - **Impact:** Biome re-checked the file clean, and the content matches §3.2.
  - **Mutations:** A also applied m1–m5 with shell edits, but they were temporary. The 2 tracked files hash to the A-reported `a5c0b7be…` / `87c878e5…` at C's start and end.

## Two separate ratings
- **CZABA requirement (T12.19 / D-29z85):** met.
  - The drawing is the source peak × `10^(dB/20)`, clamped to the clip and floored at 0.02. It is live during single and multi drags. Undo is exact. The detail panel agrees with the lane.
  - The mix controls, fades and envelope do not change the drawing. The audio is unchanged.
  - **Stage 4 / T12.27 item 8 is NOT complete:** it still needs 4b, Waveform Vertical Zoom.
- **Ableton correspondence:**
  - "Clip Gain changes the drawn size" is an **inference** (დასკვნა) from Live 12 §6.1, the Vertical Zoom sentence quoted in B's capture. C did not re-browse the manual.
  - The linear scale, the clamp, and "Track Volume does not change the drawing" are **unconfirmed** (დაუდასტურებელი).
  - All three stay open for ABLETON-EXPERT-REVIEW.

## For B
- After this C PASS, the next planning (on or after 2026-10-24 UTC) is the **REGRESSION round**, per current-task.md §0/§8.
- The reviewer's Architecture note (move `buildPeakShape` to `peaks.ts` when 4b lands) belongs in the `b-round-91-checkpoint-request.md` addendum. It is low value and does not block.

## Gate (not claimed by C)
Full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## Side effects
- No `store/` writes. Vitest ran read-only on the 20 listed files.
- The browser changed only local demo state. The WAV exports are saved under `c-round-120/out/`.
