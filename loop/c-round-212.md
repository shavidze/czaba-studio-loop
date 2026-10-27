# C round 212 — PERF-FADER-c (waveform outline path, single release commit, stored gains as a prop; SABA-B-5 part 3) — verification

**Verdict: PASS, with one B ruling needed (C-R212-01).**
- `browserVerified = realVerified = true`. Every C row ran in real Chromium (Playwright, real mouse and keyboard) or as a real harness run, at 1440×900 and 1280×720.
- The `gate` rows (full vitest, typecheck, build, `npm run verify`, e2e smoke) belong to the root gate and are not claimed.
- **SABA-B-5 (Clip Gain drag latency): met at 1×.**
  - Harness and C's own probe both put single Clip Gain move-to-paint p95 at **5.4–7.6 ms**, stopped and playing, at both viewports. The target is < 16 ms.
  - The baseline control `28a274c` measured 23.9 / 41.4 ms the same day.
- **PERF-RUN-212 is not in `passed`.** By the letter of the row, two deterministic rows differ from C round 211, and B's exclusion list names neither. Both are in one ruling request (C-R212-01): `fader.clipgain.stopped.commits-per-move` (1×/6×) 0.926 → 0.917, which is exactly the removed release commit (whole-gesture commits 112 → 111), and `load.longtasks-over-50` 1 → 2, where C's probe shows 1 long task on both builds (C-R212-02). Every other part of PERF-RUN-212 holds.

**Product / Ableton.**
- CZABA requirement (SABA-B-5, a fast Clip Gain fader): met for the single-clip and members drags at 1× CPU. Under 6× throttle it is still ≥ 16 ms on both builds (C-R212-03).
- Ableton conformance: **not applicable** (performance round). PIX-212, SYNC-212 and WAVE-LIVE-212 show that nothing visible or behavioural changed against the baseline.

## Setup
- **Current build:** `store/build` from C's perf run 2, served on `:5190`.
- **Baseline `28a274c`:** `git archive` into `c-round-212/baseline` with `node_modules` symlinked; `npm run build` rc 0 (`out/baseline-build.log`); served on `:5191`.
  - Built twice: once for the main rows, once more for the load-long-task check.
  - Deleted after use, both times. Servers stopped. The root dev server `:5173` stayed up (200).
- **Order:** the two `npm run test:perf` runs went first, alone and sequentially. The baseline build ran after them, alone. All browser probes came after that. G212-3 ran on `:5173`.
- **Probes:** C's own, in `c-round-212/tools/`. None imports `perf/`.
  - `c212lib.cjs`, adapted from c211lib. Its `display()` hash now uses **normalised column geometry**, so the old rect format and the new outline format compare equal when the drawing is the same.
  - `c212lat`, `c212pix` + `c212pixcmp`, `c212release`, `c212inv` + `invdiff`, `c212sel`, `c212wave`, `c212export`, `c212adj`, `c212redraw`, `c212load`, `g212-3`, `perfcmp.py`.
- **Media:** the owned synthetic `media/clip-3s-h264-aac.mov` and the built-in `/studio-lab` demo audio. Nothing was uploaded. The WAVs were deleted after hashing.
- **App CSS bundle:** differs between the builds (`app-Ijsdx7fz.css` → `app-DiFcXdcK.css`) by exactly one added rule, `.antialiased{…}`. See C-R212-04.

## Row table
| Row | Status | Evidence |
|---|---|---|
| SCOPE-212 (start + end) | PASS | below |
| LATENCY-212 | PASS | `out/perfcmp.txt`, `out/lat-*.json` |
| PERF-RUN-212 | **B ruling needed (C-R212-01)**; every other clause holds | `out/perf-run{1,2}.{log,json}`, `out/perfcmp.txt` |
| PIX-212 | PASS | `out/pix-*.json`, `out/pixcmp-{1440,1280}.json`, `shots/pix/` |
| RELEASE-212 | PASS | `out/release-{base,cur}-{1440,1280}.{json,log}` |
| SYNC-212 | PASS | `out/inv-*.json`, `out/sel-*.json` |
| WAVE-LIVE-212 | PASS | `out/wave-cur-{1440,1280}.json`, `shots/wave-*` |
| EXPORT-212 | PASS (1440; the render does not depend on the viewport) | `out/export-cur-1440.json`, `out/export-wav-sha256.txt` |
| DOC-212 | PASS | below |
| AN-REVIEW-212 | PASS | below, `out/vitest-owned.log` |
| G212-3 | PASS | `out/g212-3.json`, `shots/g212-3-*.png` |
| §4 adjacent | PASS | `out/adj-*.json`, `out/redraw-*.json` |
| gate | gate | Not claimed by C. |

### SCOPE-212
- **Start:**
  - HEAD `28a274c`. `git status`: 7 M + 2 ??, which are exactly the 7 grants and the 2 listed new files.
  - `sha256sum -c --quiet b-round-211-r212-tree-sha256.txt` rc 0.
  - All 7 grants differ from `b-round-211/r212-granted-start/`.
- **Diff shape:**
  - `ArrangementClip.tsx`: hunks `@@ -265`, `-274` and `+276,8`, all inside `buildPeakShape`'s path assembly (heights collected, then the forward and backward passes and `Z`). Signature, bucketing, height formula and null guards are unchanged.
  - `StudioWorkspace.tsx`: one added line, `clipGainsDb: clips.map((clip) => clip.gainDb ?? 0),`, in the `detailGroup` memo. It is index-aligned with `clipIds`, because both come from the same `clips` array.
  - Doc 166: one hunk, `@@ -4 +4 @@`, with the exact D-29z196 text.
  - Pinned tests: only the WZ1, WG1 and WG2 assert hunks, plus file-level helper blocks (`columnsOf`, `outlineOf`, `rectPathOf`, `expectOutlineOfRects`). The rect literals stay in the files.
  - CP file: one append hunk, `@@ -1006,0 +1007,122`, with CP15–CP17.
- **End:**
  - `sha256sum -c` rc 0 again.
  - Tree fingerprint (diff + untracked hashes) `0db4de8e…` at start and end (`out/tree-start.sha` = `out/tree-end.sha`). Nothing changed during C's phase.
  - The scratch mutant copy was in `/tmp` and was deleted.

### LATENCY-212 (the SABA-B-5 closure row)
**Harness**, 1× move-to-paint p95 (C run1 / run2; C round 211 in brackets):

| row | stopped | playing |
|---|---|---|
| clipgain | **6.2 / 6.3** (18.1 / 18.6) | **7.5 / 7.6** (59.7 / 58.1) |
| clipgain-members | 5.7 / 5.8 (7 / 6) | 8.4 / 8.7 (10.2 / 9.4) |

**C's own probe**, written by C:
- Method: pointermove → rAF → MessageChannel. Production build, single clip, down at 50 %, 60 steps to 5 %, 60 steps to 95 %.
- A run is valid when it has ≥ 110 samples, the value changed, playback stayed on for the playing runs, there were no page errors, and the detail waveform exists (single) or a group is selected (members).
- 3 valid runs each, and no replacement runs were needed.

| build / viewport | single stopped | single playing | members stopped | members playing |
|---|---|---|---|---|
| current 1440 | 6.1 / 6.8 / 5.8 → **6.1** | 7.8 / 7.3 / 7.3 → **7.3** | 5.5 / 5.2 / 5.9 → 5.5 | 7.5 / 7.2 / 7.1 → 7.2 |
| current 1280 | 5.4 / 5.4 / 5.3 → **5.4** | 7.2 / 7.0 / 7.1 → **7.1** | 5.7 / 5.5 / 5.9 → 5.7 | 7.8 / 8.2 / 7.9 → 7.9 |
| baseline 1440 (control) | 22.9 / 28.5 / 23.9 → 23.9 | 29.4 / 41.4 / 52.4 → 41.4 | — | — |

- Probe-method note: the first members runs at 1440 were marked invalid by my own rule ("detail waveform exists"), but a group has no detail waveform. I corrected the rule and recomputed validity from the saved fields. The note is in `lat-cur-1440.json`. The 1280 runs used the corrected tool.
- **Every value is < 16 ms**, both as harness medians and as probe medians, at both viewports. **SABA-B-5's 1× criterion is met.**

### PERF-RUN-212
- run1: exit 0, 533 s; run2: exit 0, 518 s. Both are `complete: true`, with 316 rows, 92 asserts, 0 failing and `failures: []`.
- Restarts are 0 on every playing row.
- Deterministic rows: identical between run1 and run2, identical across the 3 passes of each run, and identical at 1× and 6× for every clipgain row.
- `move-components-max` for clipgain: 3 (members 3). `release-commits` for the single clipgain drag: **1** (stopped and playing, 1× and 6×). Members: 1.
- **Compared with C round 211's medians:** 159 deterministic rows, excluding the 8 clipgain/clipgain-members `release-commits` rows. 3 differ:
  - `fader.clipgain.stopped.commits-per-move` and `.6x`: 0.926 → **0.917**. The row is `whole.commits / moves`, and `whole` runs from pointerdown until quiet after pointerup. Its `components-per-commit` detail shows commits 112 → 111 with moves 121, so it is exactly the one removed release commit (the ruled `release-commits` 2 → 1). See **C-R212-01**.
  - `load.longtasks-over-50`: 1 → 2. C round 211 already had a 2 inside a run (`[1,2,1]`); A's and C's runs here are all 2. C's own load probe on both builds gives **1 long task in 8/8 loads of each build** (`out/load-longtasks.json`). This round adds nothing measurable to load. It is outside the D-29z190 identity list. See C-R212-02.
- Wall-clock record rows at 6×: see C-R212-03.

### PIX-212
- **Method:** element screenshots of the lane waveform svg and the detail waveform svg, current vs baseline, with the detail panel expanded, at 1440×900 and 1280×720.
- **States:** rest at 0 dB; mid-drag with the mouse held at −12.2 dB and at +6.1 dB (1 px steps; the same values on both builds); waveform zoom 2× and 8×; the floor at −60 dB typed; clipping at +24 dB typed.
- **Result:** 28 cases (7 states × 2 elements × 2 viewports). **0 pixels with any channel delta > 8; the max delta is 5** (detail), and ≤ 3 on the lane.
- **Geometry:** the svg box, `viewBox`, class, computed colour (`oklab(0.6926 0.0036 0.0205 / 0.7)`), fill and path count are identical in every case. The parsed per-column (top, bottom) list of the current outline equals the baseline's rects in every case (4,054 lane columns, 480 detail columns).
- The 7 states give 7 distinct lane drawings, so the states really differ. The floor state's detail crop is pixel-identical (0 differing pixels).

### RELEASE-212 (C-R211-01)
Method: a MutationObserver with `attributeOldValue` and childList on the whole Clip Gain block, plus a `value` setter hook on the field. Root commits are counted after pointerup, and a frame sampler runs for 10 rAF frames.

| case (both viewports) | current | baseline `28a274c` |
|---|---|---|
| typed −12, drag +10 px, release (→ −3.2) | **1 commit, 0 records** | 2 commits; `value −3.2→−12.0 (pend=true)`, then back; the pending `<p>` mounts |
| from −3.2, drag −25 px (→ −25.1) | 1 commit, 0 records | 2 commits, stale `−3.2 (pend=true)` |
| from 0, drag +10 px (→ +8.8) | 1 commit, 0 records | 2 commits, stale `0.0 (pend=true)` |
| members −6 / +1, drag +10 px (→ +2.8 … +9.8) | 1 commit, 0 records | 1 commit, 0 records |

- Every painted frame shows the committed value with no marker.
- The probe discriminates, because the baseline reproduces C-R211-01.
- **C-R211-01 is fixed.**

### SYNC-212
Baseline vs current, both viewports, with the geometry-normalised hash.
- **`c212inv`** (the c211 invariants suite) covers, for single and members (−6 / +1):
  - arrow keys and a held key;
  - Shift-fine and plain drags;
  - Esc, cancel and blur mid-drag;
  - full drags;
  - Tab order;
  - double-click reset;
  - Undo/Redo after a drag;
  - typed pending, Enter, blur and Escape;
  - the reset button, then Undo/Redo.

  Result: **1,523 values per viewport; the only differences are 4 random clip UUIDs.**
- **`c212sel`** covers clip ↔ group switches (members typed −6 / +1):
  - group → clip by Ctrl+click toggle-off, clip → other clip, Shift+click back to the group;
  - group pending text, then Esc;
  - group typed, then Undo/Redo;
  - group drag, then switching to one clip, then Undo/Redo on that clip;
  - clip pending text, then Shift+click into a group (blur commits);
  - clip reset button, then group double-click reset, then Undo.

  Result: **292 values per viewport, 4 differences (UUIDs only).**
- Method note: a plain click on a member inside a group keeps the group on both builds, so the first `sel` run never left the group. v2 uses Ctrl+click toggle-off, which is identical on both builds.
- Field text, `data-pending`, the pending marker, the range text, reset `disabled`, the undo/redo titles and the statuses are all identical to the baseline.

### WAVE-LIVE-212 (current, both viewports, identical results)
- **Single slow drag** (25 ms per move), sampled at 25 / 50 / 75 % = −12.6 / 0.0 / +12.6 dB:
  - For every unclamped column, the parsed lane and detail heights equal rest × 10^(dB/20) within 3-decimal rounding (lane 3,637 / 3,848 / 570 columns checked; detail 437 / 442 / 21). The top and bottom are symmetric.
  - Typing the same dB value afterwards gives **byte-identical** lane and detail `d` for all 3 samples, and also for the released value.
- **Members drag** (−6 / +1): at anchors −11.6 / +1.0 / +13.6, both members' lane heights match their own gain, and the 7 dB difference is kept.
- **Release:** the rAF frames after pointerup show one drawing, equal to the pre-release drawing, so there is no snap-back. Undo restores the rest drawing exactly, and Redo restores the released one.
- The format in the browser is the one closed outline (`^M0 1(V…H…)+Z$`).

### EXPORT-212 (current, 1440)
| session | how | sha256 |
|---|---|---|
| single 1 | type −12, plain drag → −26.9 dB | `76735f30…7e127c` |
| single 2 | fresh session, type −26.9 | **same** |
| single control | defaults | `5fadd97a…` (differs) |
| members 1 | −6 / +1, drag → +14.1 … +21.1 | `5b8581cc…a8e493` |
| members 2 | fresh, 201 ArrowUp presses → the same | **same** |
| members control | −6 / +1 | `c4f50501…` (differs) |

- **Format:** PCM 24-bit stereo, 48 kHz, 4,864,896 frames = 101.352 s. NaN 0, 99.77 % non-zero samples. The single peak is 0.04519 (= −26.9 dBFS).
- All four hashes equal C round 211's. **The drawing change does not affect export.**

### DOC-212
- Doc 166 l.4 is exactly `**სტატუსი:** Completed (PERF-FADER-b C round 211 PASS, published 28a274c)`.
- Doc 167:
  - status `In Progress (C round 212 check pending)` (L28);
  - Georgian, following the TEMPLATE sections;
  - it has B's measured table, A's measured table, the outline format, the rejected options with their numbers, and C-R211-01 and S1.
- Every cited row exists (grep): PO1–PO5 in `waveform-outline-path.test.tsx`, CP15–CP17, WZ1, WG1 and WG2. The doc names the file for PO, because of the id collision with `pending-status.test.tsx` PO1–PO4 (info for B).

### AN-REVIEW-212
- **Forbidden patterns:** none in the 342 added lines (no `any`, `as`, `@ts-*`, lint suppressions, class selectors, `toHaveClass` or hardcoded colours).
- **Semicolons:** every statement ends with one. The only unterminated lines are chained calls.
- **Biome:** `npx biome check` (read-only) on the 7 owned code paths: "No fixes applied".
- **Block leaf** (`ArrangementDetailClipGain` body): no `.current` and no `getArrangement` read. `draftedClipGains` reads the `storedClipGainsDb` prop. The parent keeps `getArrangement` only for `readClipGainAnchorDb` (a handler).
- **WG2** still checks `WG2_PRE_ROUND_SHA256` (constant unchanged) through the legacy formatter `rectPathOf(columnsOf(path))`, with length 2530.
- **Owned tests:** the 4 owned test files pass 42/42 (`out/vitest-owned.log`).
- **C's own mutants**, on a `/tmp` scratch copy that was deleted afterwards:
  - **M-C1:** the render-time sync is moved back into a layout effect → CP15 red ("expected 2 to be 1"); CP16 stays green.
  - **M-C2:** the outline's bottom edge is scaled by 0.999 → 6 rows red across PO, WG and WZ.

### G212-3 (`:5173`, fresh contexts, no credentials)
- `/studio-lab` opens anonymously at 1440 and 1280: `auth_user` null, 0 cookies, demo badge shown, 0 forbidden requests, 0 Authorization headers, no LeadMagnet.
- `/studio/middle-east` shows "Sign in required", with 0 `audio[src]` and no workspace, at 1440 and 1280.
- Token endpoint:
  - no header → **401**;
  - fake Bearer → **500** "Unable to prepare Studio access" (no `:5199` mock), no Set-Cookie, 0 context cookies.
- **No token is issued. Premium auth is not bypassed.**

### §4 adjacent (both builds, both viewports; `out/adj-*.json`, `out/redraw-*.json`)
- **Library Add, first render:** the lane path appears in the first rAF poll (65–84 ms; baseline 69–70 ms), already in the outline format, with the same geometry as the baseline.
- **Clip move drag:** start 0.000 → 1.500, "Undo: Move clip". The lane geometry is the same mid-drag and after, and equal to the baseline.
- **Video clip with an audio stream** (owned synthetic media): the lane waveform is drawn on both builds (`viewBox 0 0 120 2`) with equal geometry (C-R211-04 premise).
- **Waveform zoom to max and back, and trim:** every geometry hash sequence equals the baseline.
  - The trim-end drag redraws mid-drag and after at 1440.
  - At 1280 the same grab hits the Fade Out handle on both builds (probe geometry, as in round 211).
- **1280 detail panel:** it starts collapsed. Expanding it shows the detail path in the first sampled frame (53 ms; baseline 40 ms).
- **Track Volume drag:** max 1 component per move, 0.75 per move, 1 release commit, 0 statuses during the drag. PERF-FADER-a is intact.
- 0 page errors.
- **Not browser-tested:** the code-reviewer's Minor (group → group pending text carry-over). It predates this round, and SYNC shows the current build equal to the baseline on the switches tested.

## Findings for B
- **C-R212-01 (ruling needed, not a bug; covers both differing deterministic rows: `commits-per-move` below and `load.longtasks-over-50` in C-R212-02).**
  - **What differs:** PERF-RUN-212 says "every deterministic row equals C round 211's medians, except the clipgain/clipgain-members `release-commits` rows". `fader.clipgain.stopped.commits-per-move` (1× and 6×) moved 0.926 → 0.917.
  - **Cause, confirmed from the spec and the data:** `commits-per-move = whole.commits / moves` (`perf/studio-lab.perf.spec.ts` l.426), and the whole window includes the release. Commits go 112 → 111 at 121 moves, which is exactly the removed release commit that D-29z198 item 3 pre-rules as intended.
  - **Which list applies:** the row is not on the D-29z190 identity list, which for clipgain names only `moves-dispatched` and `.restarts`.
  - **What B should rule:** that derived row joins the D-29z198 exclusions. C does not rule. PERF-RUN-212 is kept out of `passed` until B rules.
- **C-R212-02 (info).**
  - **Observation:** `load.longtasks-over-50` is 2 in every pass of C's and A's runs, against `[1,2,1]` / `[1,1,1]` in C round 211.
  - **Code effect:** C's probe gives 1 long task in 8/8 loads of each build (`out/load-longtasks.json`), so this round shows no code effect. The round's code does not run at load (0 clips).
  - **Interpretation:** inference, not proof — machine or harness-sequence variance. The row is outside the identity list.
- **C-R212-03 (note for SABA-B-5 on slow CPUs, not a round criterion).**
  - **Harness 6× record rows vs C round 211:**
    - clipgain stopped 34.4 / 33.8 → 45.3 / 46.1;
    - clipgain playing 43.1 / 42.3 → 58.1 / 58.3;
    - members stopped 30.5 / 29.6 → 40.4 / 40.2;
    - members playing 44 / 47.9 → 58.7 / 55.3.
  - **C's 6× probe, same day, current vs baseline:** stopped **45.8 vs 45.2**, playing **59.6 vs 57.2**. So the round-over-round rise is not reproduced as a current-vs-baseline difference. It looks like day or machine variance (inference).
  - **Remaining gap:** under 6× throttle the Clip Gain drag is still ~45–60 ms on both builds, far above 16 ms. If Saba's machine is slow, SABA-B-5 may still be felt. B decides whether a 6× budget belongs in STUDIO-PERFORMANCE.
- **C-R212-04 (info).** Confirmed by `git grep`: at `28a274c` the word appears only in `app/styles/app.css`, and doc 167 is the only new occurrence.
  - **What:** Tailwind v4 automatic source detection scans `docs/`. Doc 167 contains the word "antialiased", so the app CSS gains one unused utility rule, `.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}`, and the bundle hash changes (`app-Ijsdx7fz` → `app-DiFcXdcK`).
  - **Effect:** 0 elements use the class (browser `querySelectorAll('.antialiased')` = 0), and body smoothing is already `antialiased` from `app/styles/app.css` l.460. No visual effect.
  - **Why record it:** docs prose can change the shipped CSS. The fix (`@source not` for `docs/`) would touch protected `app/styles/**`, so B decides whether to plan it.
- **Info:**
  - WG2's title still says "byte-identical to the pre-round d". The check is now through the legacy formatter, so the intent holds.
  - PO1–PO4 duplicate the ids in `pending-status.test.tsx` (A's gap 4).
  - A's CP12 full-suite timeout risk is a root-gate matter; C did not run the full suite.
