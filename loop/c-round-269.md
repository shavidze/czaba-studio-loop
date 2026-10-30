# C round 269: SABA-B-7, clip envelope on the lane fader dB scale

**Verdict: PASS.** `browserVerified` = `realVerified` = true. No bugs found. Gate rows (full vitest, build, full Biome, verify, e2e smoke) are left to the gate and not claimed.

Evidence folder: `c-round-269/`. Chromium (Playwright), fresh anonymous contexts, `http://127.0.0.1:5173/studio-lab`, at 1440×900 and 1280×720. Environment: `env-status.json` (store 200, round 269).

## Baseline and scope
- **K1:** HEAD is `5e73fe9`, not `3058a7c`; `git diff 3058a7c HEAD -- app` is empty, so the drift is accepted under the L29 clause.
- **K2–K12, K14:** re-ran (`claims.txt`). **K13 was not re-run verbatim.** B's `probe-meter-head.json` is the HEAD baseline; my PLAY-THROUGH below is the measurement on the new code. At HEAD: K2 `95:`; K3 `122/137/143`; K4 `261/267/370/400/401/402`. In the working tree K5, K7 (2 hits), K10 (the 4 files), K11, K12 (`4`) and K14 match. K9 = 8/6/1. K2/K3/K4/K6/K8 line numbers moved, as the change requires.
- **SOURCE-SCOPE:** `git status --porcelain` = 6 modified files + the new doc 200, all inside the grants.
- **HUNK-SCOPE** (`hunks.diff`):
  - `graph.client.ts`: only the import and the `scheduleClipEnvelopeGain` body changed.
  - `ArrangementClipEnvelope.tsx`: only the import, the drag mapping (`depthDelta === 0` keeps the stored gain), the `top` style and the polyline vertices changed. No class token changed.
  - A's reorder of the early return in `interpolateEnvelopeGain` returns the same value for every input.

## Tests (offline; these do not stand in for the browser rows)
- **TESTS-TARGETED:** the §5.3 set, 7 files, passed 121/121 (`vitest-targeted.txt`).
- **TEST-REWRITES** (`rewrites.diff`): I diffed every §5.1 rewrite. Each removed `expect` has an equal or stronger replacement on the same subject:
  - EV5a/b/c/e and EV6b assert the literal step count per segment, every knot exactly, a ≤ 0.5 dB step bound, strictly increasing times and the exact total call count;
  - XR2 pins all 62 calls at 1e-12;
  - EV5b keeps `gain.value` (now at 1e-12).
  - All the §5.2 cases are present: DB1 (±0.005 dB, `toBe` at the points), DB2 (including `gain(1.2)` and NaN), DB3 (1e-12 against `trackVolumeFromDb`), DB4 (120 steps; two points at 0 or at 0.5 give one step; a mid-segment window gives 90 steps from −15.5 dB), DB5 (both halves), DB6, EUDB1–3 (EUDB2 includes the past-bottom `0.0000` / `−∞ dB` case).
  - EU7 and EU5 compare the vertices numerically at 1e-4 with the vertex count and x exact.
- **MUTANTS** (my own scratch `/tmp/c269-scratch`, `mutants.txt`). Each mutant goes red, and the unmutated scratch passes 69/69.

  | Mutant | Red tests |
  |---|---|
  | M-LINEAR | 12, including DB1 and EV1 |
  | M-NO-STEPS | 7, including DB4, EV5* and XR2 |
  | M-DISPLAY | EUDB1 |
  | M-DRAG | 4, including EU3 quarter and EUDB2 |
  | M-DY0 | EUDB3 |
  | M-FLOOR (all uses) | 6, including DB3 |

  - **Extra mutant:** a −40 floor only in `depth()` turns DB2 and DB4 red, but not DB3. DB3 pins only `gain(depth)`. This is no gap: DB2 catches it.

## Browser rows (both viewports, identical results)
The recipe gave points `0.725:1.0000;5.725:0.0000;10.725:0.0000` on lane `music`, with the clip start at 0. The WAVs are 24-bit PCM, 48 kHz, stereo, 101.352 s; A, B and M have the same size and data length, and no sample is non-finite. Files: `export-<vp>.json`, `analysis-<vp>.json`.

| Row | Result 1440×900 | Result 1280×720 | |
|---|---|---|---|
| TAPER-EXPORT (25/50/75 %) | −15.003 / −29.999 / −44.999 dB | same | PASS |
| CURVE-EXPORT (75 samples, 50 ms) | max \|err\| 0.033 dB | 0.033 dB | PASS (≤ 0.2) |
| SILENCE-EXPORT [p2, end], both channels | 0 nonzero of 9,180,192 samples; Export A has 9,161,855 nonzero samples there | same | PASS |
| NO-CLICK-EXPORT [p1, p2] per sample | max 0.00100, at 5.72498 s (the final step to 0) | same | PASS (≤ 0.002) |
| UNITY-EXPORT before p1 | ratio error 0; 69,600/69,600 samples bit-identical to A | same | PASS |
| MULTIPLY-EXPORT | fade 1.000 s × −6.0 dB × curve: max err 0.000155 | fade × curve: 0.000304 (see note) | PASS |
| PLAY-THROUGH (meter of lane 2/4) | not `-inf` at 12/12 samples in (0, 3.225 s), minimum −37.6 dB; `-inf` at 12/12 in [7.725, 10.725]; first `-inf` at 4.99 s; other meters `-inf`; position monotonic; 0 page errors | same; first `-inf` at 5.00 s | PASS |
| DRAG-READOUT 25/50/75 % | status and title −15.0/−30.0/−45.0 dB (also during the drag); gains 0.1778/0.0316/0.0056; depth 0.25/0.5/0.7503; bottom `−∞ dB`, `0.0000`, depth 1 | same | PASS |
| UNDO | Ctrl+Z restores `data-envelope` byte for byte, and Ctrl+Shift+Z re-applies it, on each of the 4 drags | same | PASS |
| LINE-THROUGH | line at each point centre, \|dy\| ≤ 0.005 px; mid add between 0 and −30 dB gives −15.001 dB (expected −15.003); with a −∞ neighbour, −30.006 dB (expected −30) | same | PASS |
| HORIZONTAL-DRAG | +40 px moves the point from 5.725 to 6.725 s; `data-gain` `0.0316` is unchanged; one Ctrl+Z restores it exactly | same | PASS |
| PLAY-EDIT | drag during playback: `0.725:0.1778`; 20 position samples monotonic (1.27 → 3.19 s); 0 page or console errors; one Ctrl+Z restores | same | PASS |
| SCREEN-BUDGET | text-line boxes outside the timeline match HEAD (a `git archive` copy of `5e73fe9` in /tmp on :5181, since stopped and deleted) in all states: empty 97, one clip 117, Env on 117 | 79, 89, 89, equal to HEAD | PASS |
| G269-AUTH | `/studio-lab` loads anonymously (4 lanes, no `auth_user`, no cookies). `/studio/middle-east` shows "Sign in required", with 0 `audio[src]` and 0 audio or token requests. `/api/studio-token` with no header returns 401; a fake Bearer returns 500 "Unable to prepare Studio access" (backend unavailable), with no token | n/a | PASS |

**Notes:**
- **MULTIPLY at 1280×720:** the Clip Gain input is inside the detail panel, which is collapsed at 720 px height (an ancestor has `display:none`; that layout predates this round). At that viewport the export checked fade × curve without the gain. The full product, including −6 dB, was checked at 1440×900.
- **PLAY-THROUGH:** the first poll right after Space (position 00:00.000, before audio starts) reads `-inf`. Rows count samples with position > 0, which is B's baseline method.

**Environment side effect:** the HEAD scratch server used `node_modules` from `store/` through a symlink. Vite may have rewritten `store/node_modules/.vite` cache files. `/studio-lab` on :5173 stayed 200, and `git status` is unchanged (A's 6 files + doc 200).

## Docs and lessons
- **LESSON:** `lessons.md:26` holds `41. **Perceptual axes…` (1 hit).
- **DOC-200:** l.4 is byte-exact. The 7 `##` headings follow TEMPLATE order. Every cited test id exists: DB1–6, EUDB1–3, EV1/2/4/5a/b/c/e/6b, EU2/3/5/7 and XR2.

## Ableton conformance (separate from the CZABA requirement)
- **R3:** confirmed. The export measures −15/−30/−45 dB at 25/50/75 %, which is option A. Root measured Live 12 and found option A within 0.03 of Live's fader taper down to −36 dB.
- **D1–D3** (dB readout, −60 dB floor then −∞, interpolation in dB): deliberate deviations approved by Saba.
- **R5 and R6:** unchanged. Double-click adds a point, drag moves it, and the point title and status show the value in dB.

## For B
- No bugs.
- One observation, info only: DB3 does not by itself catch a wrong floor in `depth()`; DB2 does.
- The 1280×720 detail panel is collapsed by default, so no clip-gain export check is possible at that viewport without expanding it. This predates this round.
- Next per §11: SABA-B-7 is done; round 270 is GATE266-S1.
