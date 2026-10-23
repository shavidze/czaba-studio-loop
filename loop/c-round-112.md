# C — Round 112 (measurement round) — FINAL

**taskStatus: PASS** (every row ran; A's one-line doc change is correct). `browserVerified: true`. Measurement outcome per §5:

| Finding | §5 row | Evidence (runs) |
|---|---|---|
| **C-R27-01** (VM, meters running) | **PASS** → closed | VM1–VM3 3/3 valid, max \|d\| 15.6 / 16.0 / 15.6 ms ≤ 30.1, hardSeeks 0→0 |
| **C-R8-01** (mode D) | **FAIL, no app attribution** (rule as written: D 0/3, from one boundary sample per run). With B's named one-frame skew applied: D 3/3 PASS → B decides | D1–D3 |
| **C-R6-02** (mode D, mode N, RF5-3) | **FAIL, no app attribution** (D 0/3, N 1/3 literal; RF5-3 1/3). With the skew applied: D 3/3, N 3/3; RF5-3 stays 1/3 | D1–D3, N1–N3 |
| **A-R38-REVIEW-TOUCH** | **FAIL** (harness valid) → bounded A round with the pre-specified amendment | touch-* (Zoom 3/3 jumps; Volume, Pan, Master 3/3 jump on touchStart) |

None of the four is "FAIL with app attribution" for drift: there are 0 LoAFs and 0 app scripts in every play window. TOUCH is a behaviour FAIL that §5 maps to a bounded A round. Under the §5 SRW rule, SRW-13 keeps its status until that round passes C, because A-R38-REVIEW-TOUCH is FAIL (C-R27-01 is closed).


## Environment (§2) — `c-round-112/env.json`
- 4 vCPU, 16 GB, load avg 0.1–0.5, Chromium **143.0.7499.4 headless** (`--autoplay-policy=no-user-gesture-required`), fresh context per run, no storage/credentials, 1440×900.
- `long-animation-frame` **supported** → D-24 stall exclusion computable. canPlayType VP9/Opus `probably`, H.264/AAC `probably`.
- env-status.json store 200. Media SHA256 all OK.
- Start: HEAD `6abd3f3`, status = only ` M docs/implementation/2026/quarter-IV/096-…md`, numstat 1/1, frozen list OK.
- Cloud audio clock (diagnostic, `runs/diagD1.json`, `runs/diagP1.json`): `AudioContext.currentTime` advances in irregular jumps of 8.7 / 11.6 / 17.4 / 20.3 / 31.9 ms (multiples of the 2.9025 ms render quantum at 44.1 kHz); the ruler `aria-valuenow` steps 8–21 ms per 16.7 ms frame.
- Fixture fps = 30 (measured: `totalVideoFrames` deltas 176 and 180 over ≈6.008 s per element).

## Harness (§3) — `c-round-112/tools/`
- `lib.cjs` init script: rAF sampler `{t,pos,vt,paused,rate,i}` (handle re-queried per frame, getAttribute only), LoAF observer (buffered, scripts[] kept), `play`/`pause`/`currentTime`-setter spy, document-capture `seeking`/`seeked` listeners, dock counters + `getVideoPlaybackQuality` on both elements at Play and at end.
- **App-script rule:** a LoAF script is app script when `sourceURL` starts with `http://127.0.0.1:5173/app/`; `/node_modules/`, `/@vite/`, `/@fs/` and empty URLs are not app.
- Play/Pause: blur → `Space` keydown (timestamp captured by a capture-phase keydown listener); Pause by `Space` after 13 s.
- Run window for drift = from the first sample with pos > p0 to the Pause keydown; samples with no covering video clip are dropped.
- Hard-seek window: an app `currentTime` write on element *i* → that element's next `seeked` + 300 ms, applied to samples whose active element is *i*. (In every run the only in-run write was the standby pre-seek at ≈5.2 s on element 1, before it became active → 0 samples excluded.)
- Stall windows per D-24; validity per §3 incl. the decoder-starved delta rule with the rate exception.
- Clip table (identical in every D/N/P run): video 0–6.008 off 0, video 6.008–12.016 off 0 (Ctrl+D: „დუბლირება (1): ასლები 00:06.008-დან.“), music Middle East 0–101.352, stems **demo-stem-pulse** (ღამის პულსი · პულსი) 2–18, SFX Soft impact 4–6. **Substitution:** the demo library has no CZABA-hero *stem* (demo-hero-music is music only), so the nearest stem was used. Stems cannot cover 0–2 by construction; music covers 0–13.
- Harness deviations, recorded: (1) the first N1–N3 were run with the SFX clip still selected (my deselect click landed off-screen) → wrong layout, set aside in `runs/invalid-N-selected/` as a harness error, **not** counted and not counted as replacements; (2) the valid N1–N3 were therefore re-run as a block after D/P, not alternated; (3) `runs/trial/` and `runs/diag*` are not verdict runs (diag used an added `ctx.currentTime` sample per frame).

## 4.1 Drift layouts — results (1440×900, cloud adaptation of R3-V1)
All 9 runs **valid**: stall coverage 0 %, 0 LoAF in the play window (so 0 app-attributed), dropped frames 0/356, rate ≠ 1 in 2.6–2.8 % of samples (max 1.35–1.45, only right after the swap), escalations 0, dock `swaps 1, fallbacks 0, hardSeeks 0, escalations 0, settles 1`. Panel height: D 144 px, N 144 px (nothing selected, hint shown), P 36 px (collapsed).

**Verdict uses the rule as written (literal d against the clip covering `pos`).** In 8 of 9 runs exactly one sample at the 6.008 cut has pos 5.99–6.002 while the active element already shows clip 2 (vt ≈ 0.001), so the literal |d| ≈ 5.99–6.00.

| Run | literal median / max (stall-excl.) | verdict | boundary-corrected median / max | max at |
|---|---|---|---|---|
| D1 | 0.0099 / 5.989 @5.990 | FAIL | 0.0099 / 0.0265 | 6.063 (clip 2) |
| D2 | 0.0100 / 5.989 @5.990 | FAIL | 0.0100 / 0.0278 | 6.080 (clip 2) |
| D3 | 0.0100 / 5.989 @5.990 | FAIL | 0.0100 / 0.0260 | 6.063 (clip 2) |
| N1 | 0.0117 / 6.001 @6.002 | FAIL | 0.0116 / 0.0277 | 6.080 (clip 2) |
| N2 | 0.0100 / 0.0365 @6.092 | PASS | same | 6.092 (clip 2) |
| N3 | 0.0129 / 5.989 @5.990 | FAIL | 0.0129 / 0.0276 | 6.080 (clip 2) |
| P1 | 0.0117 / 6.001 @6.002 | no verdict (control) | 0.0117 / 0.0274 | 6.080 |
| P2 | 0.0109 / 5.989 @5.990 | no verdict (control) | 0.0109 / 0.0276 | 6.080 |
| P3 | 0.0116 / 6.001 @6.002 | no verdict (control) | 0.0116 / 0.0277 | 6.080 |

Raw series = stall-excluded series in every run (no stall windows). D − N median: −0.0016, −0.0000, −0.0029 (info). D − P: −0.0018, −0.0009, −0.0016 (info).

**Boundary sample, separated per policy #8.**
- *Confirmed:* the dock calls `play()` on the standby element and `pause()` on the old one in the same frame (e.g. D1: play@6047.8 ms, pause@6048.7 ms after the Play keydown); in that frame the ruler still reads 5.990/6.002 and reads 6.010 one frame later; the frame delta of that sample is 17.7–17.9 ms.
- *Inference:* the user sees the cut up to ≈18–19 ms (≈1 frame) early, not a 6 s desync. This is the "up to one frame of skew / 1 ms rounding" harness limit that §3 names. The correction I computed attributes **only samples within (that sample's frame dt + 1 ms) of a clip boundary** to the adjacent clip when that gives the smaller |d|. I added it to `ana.cjs` **after** seeing the 6.0 s values, so it is reported for B and **not** used for the verdict.
- *Hypothesis (unverified):* none about app cost. There is no LoAF or app script in any failing window.

**§5 row (literal):** C-R8-01 (D 0/3) and C-R6-02 mode D (0/3) and mode N (1/3) → **"FAIL, no app attribution"**: there is no app LoAF or script ≥ 10 ms in any failing window, and D − N shows no app-state cost. If B accepts the boundary correction as the named skew limit, all 9 runs pass (D 3/3, N 3/3), which would be the PASS row for the drift part. B decides.

## 4.2 RF5-3 (first Play after fresh load + import) — series = N1–N3
N1–N3 match §4.2 exactly (layout N, fresh context, `priorPlays 0` before the Play). No dedicated extra runs were added after seeing the numbers.

| Run | hold ms | play() − startAt | window | paused until play | pre-start advance | drift 0–100 / 100–300 | verdict |
|---|---|---|---|---|---|---|---|
| N1 | 54.5 | −15.3 ms | [−16.7, +16.7] | yes | 0.0005 s | 0.0241 / 0.0217 | PASS |
| N2 | 48.5 | −22.6 ms | [−16.7, +16.7] | yes | 0.0169 s | 0.0162 / 0.0107 | **FAIL** (play early) |
| N3 | 52.8 | −22.4 ms | [−16.7, +16.7] | yes | 0.0169 s | 0.0180 / 0.0165 | **FAIL** (play early) |

- `frameInterval` = median rAF delta 16.7 ms; `startAt` = back-extrapolated from the first sample with pos > 0 (B's definition). Pre-start advance is judged against 1 frame = 1/30 s (fixture 30 fps; at 60 fps the 0.0169 would fail).
- *Confirmed (info, not verdict):* first Play in D1–D3 −22.6 / −22.7 / −22.6 ms (all outside); P1–P3 −15.4 / −15.2 / −15.2 ms (all inside); diagD1 −31.7 (outside), diagP1 −15.0 (inside).
- *Inference:* the failing excess is 5.7–6 ms past the bound. `startAt` comes from the ruler `pos`, which follows a cloud audio clock that jumps 8.7–31.9 ms, so the estimate's error is larger than the ±16.7 ms window here.
- *Hypothesis (unverified):* the open/collapsed state of the detail panel shifts the frame phase at start (panel open: 5 of 6 fail; panel collapsed: 0 of 4 fail). This is not the D − N attribution named in §5, and P is labelled attribution-control only. **B must judge** whether this split counts as "cost follows app state".
- **§5 row (literal):** "FAIL, no app attribution" (no LoAF; D − N does not separate). RF5-3 1/3.

## 4.3 VM — C-R27-01 (`lay11-cloud`)
- Layout: video beeps VP9 0–6.008 (single clip), music Middle East 0–101.352 **muted** (M `aria-pressed=true`), stems demo-stem-pulse 2–18, SFX Soft impact 4–6. Nothing selected, panel open 144 px. Same table in every run.
- Meter pre-check (separate context `runs/METER.json`, shots `vm-meters-1440.png` at ≈0.9 s and `vm-meters-3s-1440.png` at ≈3.3 s). Master and the video-lane meter are live from 0 s (−6 → −18 dB per beep). The **stems meter cannot move in the first second**, because its clip starts at 2 s. It moves from 2.00 s (−10.6 dB). Music stays −∞ (muted). The layout was not changed; this is a property of the specified layout (§4.3 asks for "stems moving during the first second").
- Oracle (max \|d\| ≤ 30.1 ms over 0–6.008, stall-excluded; hardSeeks 0→0):

| Run | valid | median | max | hardSeeks | LoAF | drops | verdict |
|---|---|---|---|---|---|---|---|
| VM1 | yes (stall 0 %) | 0.0028 | 0.0156 @0.043 | 0→0 | 0 | 0 | PASS |
| VM2 | yes | 0.0053 | 0.0160 @0.060 | 0→0 | 0 | 0 | PASS |
| VM3 | yes | 0.0028 | 0.0156 @0.043 | 0→0 | 0 | 0 | PASS |

Raw = stall-excluded. Rate ≠ 1 in 1.9–2.4 % of samples (max 1.1–1.15), escalations 0. **C-R27-01 → PASS row (3/3).**

## 4.4 H.264 (diagnostic, not a verdict)
- canPlayType `probably`, and it actually plays (`out/h264-probe.json`): active currentTime 0 → 1.959 s in 2 s, totalVideoFrames 4 → 63, 640×360. The clip is 0–6.000; Ctrl+D gives 6.000–12.000.
- Layout D ×3 (`H1–H3`), all valid, 0 stalls, 0 LoAFs, 0 drops. Literal: median 0.0143 / 0.0129 / 0.0114, max 5.980 / 5.980 / 5.989 (the boundary sample at pos 5.981–5.990, with the cut seen ≈19 ms before the ruler's 6.000). With the skew applied: H3 passes (max 0.0337); H1/H2 still exceed it because the ruler step before the cut was 8 ms + 21 ms, which puts 5.981 outside one frame + 1 ms of 6.000. First-Play RF5-3 numbers: −15.3 / −15.2 / −22.5 ms. Diagnostic only; VP9 + H.264 in a quiet real Chrome stays the Tech Lead's check.

## 4.5 TOUCH — A-R38-REVIEW-TOUCH (`out/touch.json`, shots `touch-<target>[-mouse]-1440.png`)
Context `hasTouch: true, isMobile: false`, 1440×900, sounds layout (music/stems/SFX, no video), Stop. CDP `Input.dispatchTouchEvent` touchStart → 5 × touchMove (+4 px) → touchEnd at 15 % from the end opposite the thumb.

| Target | before | after touchStart (100 ms, no move) | moves | end | touch-point value | 20 px equiv. | result |
|---|---|---|---|---|---|---|---|
| Zoom (control) ×3 | 678 (40 px/წმ) | **63** | 63,63,63,313,375 | 375 (5.6 px/წმ) | 150 | 250 | jumps → **harness valid** |
| Volume (music) ×3 | 1.00 | **0.09** | 0.09,0.09,0.09,0.26,0.31 | 0.31 | 0.15 | 0.187 | **JUMP** |
| Pan (music) ×3 | 0 (C) | **50** | 8,17,25,50,42 | 42 (42R) | 35 | 41.7 | **JUMP** |
| Master ×3 | 0.0 dB | **−54.5** | 3,5.5,6,−41.5,−38 | −38.0 dB | −50.1 | 13.75 | **JUMP** |

- All 3 runs per target are identical. Every touch jump commits an undo step ("Undo: Volume", "Undo: Pan — მუსიკა", "Undo: Master Volume"), and the status text does not change.
- Mouse control at the same far point (1 each): Volume 1 → 1 (no jump; it cannot move right of max), Pan 0 → 0 on press, then 8, 17, 25, 33, 42 over 20 px (relative 1:1 ≈ 2.08/px; 42 vs 41.7 is step rounding, not a jump), Master 0 → 0 on press, then 3 … 6 (clamped at +6). **The mouse does not jump**, as in round 38.
- *Confirmed:* in Chromium 143 with CDP touch, a touchStart far from the thumb jumps Volume, Pan and Master toward the touch point (native range behaviour). The value then alternates between app-relative and native values during the moves (Pan 50 → 8 → 17 → 25 → 50 → 42).
- **§5 row: FAIL** → bounded A round with the pre-specified amendment (native non-passive `touchstart` + `preventDefault` on Volume, Pan and Master only; Zoom excluded). A real touch device stays a Tech Lead info note.

## 4.6 Neighbours and protection
- **SOURCE-UNCHANGED: PASS.** Start and end: HEAD `6abd3f3`, `git status` = ` M docs/implementation/2026/quarter-IV/096-studio-video-return-library-focus.md` only, numstat 1/1, frozen list `b-round-111-r112-tree-sha256.txt` OK at start and at end. C wrote nothing in `store/`.
- **DOC-096-L4: PASS.** Line 4 = „**სტატუსი:** Round 111 — C PASS, გამოქვეყნებულია `6abd3f3`-ში (gate 111; D-29z76; C-R110-01).“, same pattern as doc 095 l.4.
- **PX-NET: PASS.** 34 Studio sessions (all runs, probes and touch): 0 forbidden-host requests (R2/r2-proxy/workers.dev, Shopify, Firebase auth, Brevo, studio-token), 0 `Authorization` headers (`out/px-net-reg-hyd.json`). The G112-3 session: 0 forbidden, 0 auth.
- **REG-HYD: PASS.** 0 hydration messages, 0 `pageerror`, 0 non-noise console errors. 68 known-noise errors (cart / ERR_CONNECTION_REFUSED).
- **G112-3: PASS** (run alone, last; `out/g112-3.json`, shots `g112-3-*.png`). `/studio-lab` shows the workspace and „დემო კოლექცია — ავტორიზაცია არ სჭირდება“. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. `/api/studio-token?product=middle-east&file=stem1.wav` → **401** `{"error":"Please sign in to access Studio."}`. The fake-Bearer 403 sub-check is **BLOCKED (backend unavailable in cloud)**.

## 4.7 Gate rows (not claimed)
full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL → gate.

## Ableton correspondence
Every row: **არ ეხება** (§6). No Ableton claim is made.

## Notes to B
1. **Boundary skew decides C-R6-02/C-R8-01.** Under the literal rule, every run that has the one cut-frame sample fails by ≈6 s, even though the visible error is about 1 frame (18–19 ms early cut). In 9/9 VP9 runs every other sample stays ≤ 0.037 s. Please decide whether §3's named skew limit allows attributing the sample at the cut to the adjacent clip (my correction: within that sample's frame dt + 1 ms). Better still, a harness that reads the dock's own clock (or `requestVideoFrameCallback` mediaTime against the audio clock) would remove the ambiguity. I did not use the correction for the verdict.
2. **RF5-3 `startAt` estimator.** The cloud audio clock jumps 8.7–31.9 ms, so `startAt` from the ruler `pos` has an error larger than the ±16.7 ms window. The panel-open vs panel-collapsed split (5/6 fail vs 0/4 fail) is an unverified hypothesis about app state; B must judge whether it counts as "cost follows app state".
3. **TOUCH** also shows that a stray tap commits an undo step and changes the mix. That is user-visible data change, not just a visual jump.
4. Deviations: N re-run as a block after the first N set had the wrong layout (harness error, set aside, not counted); RF5-3 series = N1–N3 first Plays; the diag runs used an added `ctx.currentTime` sample per frame.
