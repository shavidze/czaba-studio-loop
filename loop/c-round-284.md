# C round 284: PERF-3a verification (waveform column bands + envelope line in seconds)

**Verdict: PASS.** `browserVerified` = `realVerified` = true. Every browser row ran in real Chromium (Playwright), against production builds of both HEAD and A's tree, and also on the :5173 dev target for auth. Two Low findings from the code-reviewer are reproduced or confirmed by C and go to B (`deferred_low_polish`). Neither blocks.

Ableton conformity: **does not apply** (the drawing resolution of the waveform is not an Ableton contract; the task marks this a pure performance round). The CZABA requirement for this round is fulfilled.

## Setup
- Scratch builds: `/tmp/c284/head` (`git archive 54a3fcc`) and `/tmp/c284/a` (copy of A's working tree, sha256 6/6 = sketch).
- Each build had its own `cacheDir` (`/tmp/c284/vitecache-{head,a}`; this vite.config edit was made in scratch only) and its own port (HEAD :5301, A :5302).
- Each server ran alone after one warm-up probe run. It was stopped before the next server or the perf run started. Both `remix vite:build` runs: rc 0.
- The probes are B's oracle scripts:
  - `zoom-probe3v.cjs` is `zoom-probe3.cjs` with an optional viewport argument (argv 7/8). The diff is exactly one line, and the counting is unchanged.
  - `env-probe.cjs`, `imgdiff.cjs` and `crop.cjs` are unchanged copies.

## Rows
| Row | Result | Evidence (`c-round-284/` unless stated) |
|---|---|---|
| CLAIMS | **PASS.** `claims-284.sh` on the HEAD archive equals `claims-284-output.txt` except K1, which prints `(archive)` as the task allows. K18 prints 0. L29 sweep over the task: every file:line and count fact in §1–§4 and §10 carries a K tag or cites a `b-round-283/` file. Untagged facts: the gate-283 timing ("31 tests took 5.4 s"), which is a gate-log fact, and B's scratch counts (171 tests, mutants), which cite `covering-9files.txt` and `mutants.txt` | `claims-c.txt` |
| SOURCE-SCOPE | **PASS**, at the start and at the end (after PERF-RUN built inside `store/`). `git status`: exactly 6 M + `?? docs/implementation/2026/quarter-IV/212-perf-zoom-waveform-columns.md`; `sha256sum -c b-round-283/sketch-sha256.txt` 6/6 OK, rc 0; `perf/` unmodified. Doc 212 sha256 `e736808e…81f1` | `checkpoint.md` |
| TYPECHECK | **PASS**, `npm run typecheck` rc 0 | — |
| UNIT | **PASS.** The nine §7 files: **9 files / 171 tests** pass. ZQ1, ZQ2, ZQ2b and ZQ3 exist by name. ZQ2's table has 18 cases | `unit-9files.log` |
| UNIT-MUTANTS | **PASS.** C ran its own HEADCODE and Z1–Z5 on a scratch copy of A's tree (B's `mutants.py`, with the paths pointed at C's copies). Each is red at its §3 rows:<br>• HEADCODE: ZQ1, EU7, EU5, ZQ3 (4/48)<br>• Z1: ZQ1<br>• Z2: ZQ2, ZQ1<br>• Z3: EU5, AL1 ×2<br>• Z4: 9 rows (EU3 ×3, EU4 ×2, AL1 ×2, EUDB2, EUDB3)<br>• Z5: ZQ2, ZQ2b, ZQ1 | `mutants-c.txt`, `mutants.py`, `mu.sh` |
| ZOOM-PATH-IN | **PASS.** 30 clips, 1440×900:<br>• A ×3: `[0,0,0,0,0,0,0,0,0,0]`, sum 0, viewBox writes 0;<br>• extra run at 1280×720: sum 0;<br>• warm-up run: sum 0.<br>HEAD control: `[30,0,0,0,0,0,0,0,0,30]`, sum 60, at both viewports, so the probe does see rewrites | `probe/a-in-{1,2,3,1280}.json`, `probe/head-in-{1440,1280}.json` |
| ZOOM-PATH-OUT | **PASS.**<br>• A ×3 at 1440×900: `[0,0,30,0,0,0,0,30,0,0]`, sum 60. The two rewrites fall exactly where 25 px/s is crossed (25.6 → 20.5 and 20.5 → 25.6 px/s). 1280×720: the same.<br>• HEAD control: `[30 ×10]`, sum 300 | `probe/a-out-*.json`, `probe/head-out-*.json` |
| ZOOM-ONE-COMMIT | **PASS.** From PERF-RUN: `interact.zoom.1.commits-per-key` = 1 in [1,1,1] (also 1 at 6×), and `interact.zoom.30.commits-per-key` = 1 in [1,1,1] | `perf/latest-interactions.json` |
| WAVE-PIXELS | **PASS at both viewports.** Element screenshots at each probe step, A vs HEAD:<br>• steps ≥ 50 px/s (in-0…in-8): meanAbs **0**;<br>• 40 px/s: 0.54 / 0.54 % (1440) and 0.416 / 0.381 % (1280);<br>• worst step, 13.1 px/s (out-4): meanAbs **5.001**, 6.057 % with \|Δ\| > 32 at 1440; 4.161 / 5.109 % at 1280. All within ≤ 6.0 / ≤ 7.0 %.<br>Visual verdict on the 13.1 px/s side-by-side crops (HEAD on top, A below): the same envelope shape and the same transient positions, slightly softer spike tips (sub-pixel anti-aliasing), and no stair steps, gaps or clipping | `imgdiff-1440.json`, `imgdiff-1280.json`, `compare-out4-1440.png`, `compare-out4-1280.png`, `shots/{head,a}-{1440,1280}/` |
| ENVELOPE-ZOOM | **PASS at both viewports.** 30 lines in Env mode. A double-click adds one point, with status `Envelope: point added — 7.725 s · 0.0 dB.` Over three `=` keys (40 → 50 → 62.5 → 78.1 px/s):<br>• A: **0 `points` and 0 `viewBox` writes**; the viewBox stays `0 0 101.352 1`;<br>• the dot centre vs the polyline vertex: Δ **0 px** at every step (821 / 898.25 / 994.81 / 1115.52 px, the same as HEAD);<br>• Ctrl+Z leaves 0 points.<br>HEAD control: 180 `points` / 90 `viewBox` writes, at both viewports | `probe/a-env-{1440,1280}.json`, `probe/head-env-{1440,1280}.json` |
| ZOOM-TIMING | **record (no pass/fail).** Event Timing keydown in ms; table below | `timing-table.md` |
| PERF-RUN | **PASS.** `npm run test:perf` ran alone on A's tree: rc 0, 3 passed (10.8 min).<br>• All three reports have `complete` true, `failures` [], 0 harness problems and 0 page errors.<br>• Asserts within budget: interactions 17/17, resources 15/15, PERF-1a 93/93.<br>• Zoom rows: `interact.harness.zoom-live`, `zoom-live.6x` and `zoom-30-live` = 1; components-per-key 102 (1 clip) and 247 (30 clips); `interact.zoom.30.key-window-longest-ms` [72.1, 77.6, 73.4] (record) | `perf-run.log`, `perf/*.json` |
| DOC-212 | **PASS.**<br>• l.4 is byte-exact: `**სტატუსი:** In Progress (stage 1 of 2; C round 284 PASS)`.<br>• The seven TEMPLATE headings appear in order.<br>• Every cited id exists: ZQ1, ZQ2, ZQ2b, ZQ3, EU3, EU4, EU5, EU7, AL1, EUDB2, EUDB3.<br>• The numbers match their cited files: 6,142 `dNodes` (`head-detail.json`); 6,143 / 264 (`nodes-head-30/1.json`); 88–104 / 152 / 104 ms (`head-in-*.json`); 40–128 ms (`head-out-*.json`); 180 / 90 (`head-env-*.json`); 5.001 / 6.057 % (`imgdiff-head-vs-sketch.json`).<br>• The band wording agrees with the code. At 25 px/s the loop gives 4 buckets per column (1·4·0.25 = 1 ≤ 1), and at 25.1 px/s it gives 1. So the bands are (6.25, 25] and (1.5625, 6.25], open at the bottom, and "the largest power of 4 with b·ppb ≤ 1" is a correct restatement of the loop. Note for B: the task's §2.1 prose ("[6.25, 25]") is imprecise; the doc and the code agree | doc 212 |
| G284-AUTH | **PASS** at both viewports, each in a fresh context with no credentials and no stored state.<br>• `/studio-lab`: demo workspace, the badge `Demo collection — no sign-in required`, `auth_user` null.<br>• `/studio/middle-east`: `Sign in required`, `audio[src]` 0, no workspace (0 arrangement status, 0 clips).<br>• `/api/studio-token?product=middle-east&file=stem-01.wav`: no header → **401** `Please sign in to access Studio.`; fake bearer → **500** `Unable to prepare Studio access` (not 200, no token).<br>The same result on :5302 (A prod) and on :5173 (dev).<br>Invalid attempts, kept here for the record:<br>(1) C's first prod probe called the endpoint without query parameters and got 400 from the parameter check. That was a probe error, not an app finding; it was corrected and re-run.<br>(2) The first :5173 attempt timed out waiting for `Demo collection ready`. The dev server log shows `new dependencies optimized: firebase/app, firebase/auth … reloading` at 07:51:01 during that attempt (`servers/store-20261031T073550Z.out.log`), which is Vite's lazy dependency discovery in dev mode. The retry passed.<br>The real backend's 401/403 for a forged bearer is BLOCKED: backend unavailable in cloud | `probe/auth-a.json`, `probe/auth-dev.json`, `shots/auth/`, `shots/auth-dev/` |
| gate | The full vitest suite, the build gate, Biome/lint, `npm run verify` and `test:e2e:smoke` belong to the root gate. They are not claimed. C did not run lint; A's "205 warnings" in doc 212 l.77 is A's claim | — |

### ZOOM-TIMING (Event Timing keydown, ms; trend only)
Columns: rewrites per key / sum / Event Timing per key / DOM node delta per key.

| Run | d writes per key | sum | Event Timing keydown | dNodes |
|---|---|---|---|---|
| HEAD in 1440 | [30,0,0,0,0,0,0,0,0,30] | 60 | [80,40,32,32,112,72,32,32,32,72] | [1,0,0,0,6142,-6142,0,0,0,-1] |
| HEAD in 1280 | [30,0,0,0,0,0,0,0,0,30] | 60 | [72,32,40,32,104,72,32,32,32,72] | same |
| A in 1 / 2 / 3 | [0 ×10] | 0 | [32,32,40,32,104,72,32,32,32,32] / [32,40,32,32,112,72,…,32] / [32,32,32,32,112,72,…,32] | same |
| A in 1280 | [0 ×10] | 0 | [32,32,32,32,128,72,32,32,32,40] | same |
| HEAD out 1440 | [30 ×10] | 300 | [88,48,48,56,32,32,56,56,48,96] | [-3070,0,0,-1842,0,0,1842,0,0,3070] |
| HEAD out 1280 | [30 ×10] | 300 | [80,48,48,48,32,40,56,48,48,96] | same |
| A out 1 / 2 / 3 | [0,0,30,0,0,0,0,30,0,0] | 60 | [40,24,40,32,24,16,48,72,32,56] / […,40,72,32,56] / [40,24,48,32,24,24,48,72,32,64] | same |
| A out 1280 | [0,0,30,0,0,0,0,30,0,0] | 60 | [32,24,48,32,24,16,40,64,24,56] | same |

Reading:
- **Zoom in.** On the in-band keys 1 and 10, A's tree measures 32 ms against HEAD's 72–80 ms. The quiet keys measure 32–40 ms on both trees. The ruler keys are unchanged: key 5 (122.1 px/s) is 104–128 ms and key 6 is 72 ms, and the ruler still adds and then removes 6,142 nodes on them. That is the PERF-3b scope.
- **Zoom out.** A's keys measure 16–72 ms against HEAD's 32–96 ms. A's highest value, 72 ms, is on key 8 (20.5 → 25.6 px/s), which is a band-crossing rewrite and also a ruler step of 1,842 nodes.
- **Exit target.** PERF-3's exit target, zoom keydown p95 < 50 ms with 30 clips, is **not met yet** (the ruler keys are 104–128 ms). It belongs to PERF-3b by the task's own split.

## Findings for B (both Low; deferred_low_polish under the 2026-10-23 gate; the files are byte-locked to the sketch, so A could not fix them)
1. **A-R284-REVIEW-NEG-LOOP (Low), reproduced by C.** `waveformPeakColumns(-12, -40)` never returns. `timeout 10 node --experimental-strip-types` exits with rc **124**. The neighbouring cases return as expected: (12, 40) → 1200; (12, 0), (−12, 40) and (12, −40) → 0. The app cannot reach this: the only caller is `ArrangementClip.tsx:366`; `clampTimelineZoom` (`view.ts:65`) keeps px/s ≥ `TIMELINE_ZOOM_MIN` = 0.5; and clip durations are positive. It is still a public export that can hang. Suggested fix: guard `!(pxPerSecond > 0) || !(duration > 0)` → 0, plus a ZQ2 row `[-12, -40, 0]`. Evidence: `c-round-284/neg-loop.txt`.
2. **A-R284-REVIEW-ZQ3-VACUITY (Low/info), confirmed by reading.** In `clip-envelope-ui.test.tsx` ZQ3 (l.1054, l.1068), `before` comes from `?.getAttribute('points')`. If the polyline were missing, `before` would be `undefined`, and the per-zoom `points` compare would pass vacuously. The viewBox, node-identity and mutation-record asserts make a silent miss unlikely. Fix: `expect(before).toBeTruthy()`.

## Scope notes
- This round changes only how the waveform and the envelope line are drawn on zoom. The source timing, the audio graph, the transport and export code are untouched (the diff covers 3 code files). By the workflow's verification scope, C did not re-measure export WAV or audio output this round. The next regression round (due on or after 2026-11-02 per `regression-last.json`) covers them.
- Side effects: `store/build/` and `store/test-results/` were written by PERF-RUN (both are git-ignored). Scratch lives in `/tmp/c284`. All of C's servers are stopped. The :5173 dev server was not touched. No app source was edited.

## Lessons check (C)
- I read `lessons.md`, including the "What to probe first (C)" section. L29 is applied in the CLAIMS row.
- L38 is applied:
  - PERF-RUN ran alone; only file reads and report writes ran beside it, with no vitest, tsc, build or browser job;
  - the HEAD and A builds each had their own `cacheDir`;
  - each prod server got a warm-up probe run before the measured runs.
- The first :5173 auth attempt was warmed with `curl` only, not a browser load. It is therefore counted as environment-invalid under L38, and the browser retry passed.
- L16–L21 and L25 do not apply to this round (no copy, font, focus or file-chooser change). L22 does not apply (A delivered a diff). L37 is B's premise clause; B re-measured the premise in §1, and C's HEAD controls reproduce it.
- No C lesson is left unchecked.
- PERF-1a `latest.json`: 6 passes, `pageErrors` 0, so the "0 page errors in all three reports" claim above is checked.
