# C round 216: independent verification of PERF-1b-ii + SYS-4 + RT-FIX

**Verdict: FAIL.** Two Low findings: C-R216-01 (DOC-216) and C-R216-02 (PERF-RUN-216, determinism label). No Medium or higher. Everything else passed in the real browser. `browserVerified` = `realVerified` = true: all four browser rows ran (PERF-RUN-216, PROBE-216, G216-3 and STUDIO-SMOKE-216). No row is blocked.

- **Environment:** `env-status.json` gave store 200, round 216.
- **Browser:** Playwright Chromium 143.0.7499.4.
- **Servers:** the dev server ran on :5173. The perf runs used the frozen config, which starts its own production server on :5188. My probe ran a production server on :5189, which I stopped afterwards.
- **Backend:** no mock on :5199.

**Evidence:** `c-round-216/`. It holds the logs, JSON, mutant diffs, the scripts `probe.cjs` and `g216.cjs`, and `shots/`.

**Not run, by rule:** the full vitest suite, `npm run verify`, the build gate and the two frozen perf specs. Those are gate rows.

## Rows
| Row | Result | Evidence |
|---|---|---|
| SCOPE-216 (start + end) | PASS | See the SCOPE notes below. |
| RT-FIX-216 | PASS | See the RT-FIX notes below. |
| PERF-RUN-216 | **FAIL (Low, C-R216-02)**. Only the literal determinism sub-criterion fails; everything else passes. | `c-round-216/perf-run-{1,2}.{log,json,rc}`, `perf-compare.txt` |
| PROBE-216 | PASS | `c-round-216/probe-216.json`, `probe.cjs` |
| REDPROOF-216 | PASS | `cm1*`, `cm2*`, `cm3*` in `c-round-216/`; A's `a-round-216/m*.log` |
| DOC-216 | **FAIL (Low, C-R216-01)** | See the DOC notes below. |
| AN-REVIEW-216 | PASS | `c-round-216/typecheck.log` |
| G216-3 | PASS | `c-round-216/g216.json`, `shots/g-*.png` |
| STUDIO-SMOKE-216 | PASS | `g216.json`, `shots/smoke-*.png` |
| gate | not claimed | Full vitest, typecheck as a gate row, build, Biome, verify and e2e smoke belong to the gate. |

### SCOPE-216
Checked at the start and again at the end:
- HEAD is `eb9e76e1bc2b41f6ec1a3e083a391d05cb1a844f`, with no deps commit.
- `git status` shows 4 M and 3 ??, nothing else.
- `sha256sum -c` of the 1,058-file frozen list gave rc 0.
- Each grant diffed against `b-round-215/r216-granted-start/` is a 1/1 change on l.4 only.
- `od -c` shows the l.4 strings match §2.7 byte for byte, ending in `)\n`.

I hashed the new files at the end of my phase (`c-round-216/new-files-sha256-end.txt`). No source changed during my phase.

### RT-FIX-216
- `diff retro-215-before-216.md retros/retro-215.md` is byte-identical to `b-round-215/retro-215-rtfix.diff`. Only l.32, l.53, l.70 and l.75 changed.
- **l.53:** says "10 review" and names 200, 201, 202, 209 and 212 as having no review. That agrees with the source:
  - re-running `c-round-215/rt/gate-reviews.py` gives 10 reviews and 69 findings;
  - `ls gates/round-2{00..14}/review.md` shows no review for 200, 201, 202, 209 and 212.
- **l.70:** the class label is now "none of the listed classes fits" instead of "ambiguous task text".
- **l.32 and l.75:** both cite l.38–41. `a-round-212.md` l.38–41 is the covering-run, control, alone and conclusion text; l.42 is the perf run, so 38–41 is correct.
- **`lessons.md`:** 47 lines (≤ 60). It changed in exactly three places: the l.3 header note, L28 and L32.
  - L28 matches D-29z214 (`b-round-215.md` l.38–42): post-PASS value, implicit grant on re-dispatch, root request file. `b-round-215-root-request-l28.md` exists.
  - L32 matches A's feedback in `a-round-215.md` l.26: both times are reported and the higher one decides.
  - C's feedback is `c-round-215.json` `needsBRuling` C-R215-02. It exists.

### PERF-RUN-216
I ran the new spec alone, twice, with nothing else running.

**Results that pass:**
- Both runs: rc 0. Wall time 70 s each, including the build.
- `durationMs`: 58,576 and 59,493, well within the 8 min limit.
- Both reports: `complete: true`, `failures []`, `reactRenderer` 18.3.1, `harness` PERF-1b-ii, `innerWidths` [1440].
- 61 rows, all measured 3 times, with no `NaN`. The row set is identical to `budgets.resources.json`: 61 unique ids, all `res.`, owner PERF-1b-ii.
- No 1×-only row (`res.mem.*`, `res.dom.*`, `res.js.*`, `res.harness.js-*-seen`) has a `.6x` sibling.
- Every `res.export.{1,2}.*` row has a `.6x` sibling, and so does each of the six liveness rows.
- **Other `latest*.json` files untouched.** Neither file existed on this machine. Before run 1, I created sentinel `latest.json` and `latest-interactions.json` with mtime 2026-10-01 (`sentinel-before.txt`). After both runs they were unchanged in mtime, size and content (`sentinel-after.txt`). I removed them afterwards. Only `latest-resources.json` and `perf-1b-ii-*.json` were written. A could not test this, because the files were absent on A's machine.
- **Deterministic medians:** these agree across C1, C2, A1 and A2:
  - memory: backing-ready 140.3 MiB, after-export delta 0;
  - DOM: page-0/1/2 = 666, 906 and 1126; clip-subtree 17; ruler-1/2 = 267 and 469; per added clip 220;
  - export: 1-clip and 2-clip bytes 29,189,420 and 58,378,796; peak delta 65 and 129.9 MiB; `longtasks-over-50` (1-clip, 1×) 0;
  - JS (encoded / decoded / scripts / third-party): studio-lab 355,155 / 1,127,433 / 43 / 0, home 263,099 / 825,803 / 41 / 0, studio-guard 287,429 / 921,569 / 42 / 0;
  - liveness: clips 1 and 2, `export-produced` 1.
- **The rows A moved out behaved like A described.** In my run 2, `used-ready-mib` was [5.2, 5.1, 5.1]. `export.2.longtasks-over-50` was 0 in both of my runs.
- **Trend rows (6×, C1 / C2 medians), consistent with A:**

  | Row | C1 / C2 median |
  |---|---|
  | `longtask-max`, 1 clip | 146 / 133 ms |
  | `longtask-max`, 2 clips | 252 / 247 ms |
  | `loaf-blocking-max`, 1 clip | 99 / 86 ms |
  | `loaf-blocking-max`, 2 clips | 209 / 201 ms |
  | `longtasks-over-50` | 2 |

**What fails: C-R216-02 (Low).** Three rows carry `kind: "deterministic"` in `budgets.resources.json`, but their medians differ between runs, and A did not list them as non-deterministic:

| Row | C1 | C2 | A1 | A2 |
|---|---|---|---|---|
| `res.harness.mem-polls-1` | 8 | 8 | 7 | 9 |
| `res.harness.mem-polls-1.6x` | 10 | 10 | 11 | 11 |
| `res.harness.mem-polls-2.6x` | 19 | 18 | 19 | 20 |

- A's own two runs already differed: [7, 7, 7] and [9, 9, 8]. Under §2.5 ("a count that differs across passes in A's two runs leaves the set, with a note") these rows should have left the set.
- The harness does not catch this, because `mem-polls-*` is not in `resourceDeterminismMetrics` (spec l.59–77). So the label has no effect, and the doc 169 table repeats it.
- **Context:** labelling assert rows `deterministic` follows the frozen pattern; all 17 assert rows in `budgets.interactions.json` are `deterministic`. But `mem-polls` is a timing-dependent poll count, and `budgets.json` labels its own timing-dependent liveness rows `wallclock` (`harness.move-latency-live.*`). So the narrow point is that §2.5 applies to these rows specifically. It is not an invented label.
- These are liveness asserts (≥ 5) and all of them passed. The fix is a label and note in the budgets file and the doc table; no measurement changes.
- **Headroom:** `mem-polls-1` at 1× had a minimum of 7 in my runs (7–9 in A's) against ≥ 5. The margin A flagged is real on this machine.

### PROBE-216
My own CDP code (`probe.cjs`), not derived from the spec. Production server on :5189, 1440×900, 1×, 3 runs each:

| Measure | C probe | A median | Criterion |
|---|---|---|---|
| `backingStorageSize` at ready, after GC | 140.34 MiB (identical 3/3) | 140.3 | ±2 % ✔ |
| 1-clip export peak delta (poll every 25 ms, through the download and the text + 400 ms) | 64.96 MiB (3/3) | 65 | ±10 % ✔ |
| Clip subtree elements | 17 | 17 | equal ✔ |
| `/studio-lab` script `encodedDataLength` sum, cache disabled | 355,155 B, 43 scripts, HTTP 200 (3/3) | 355,155 | ±2 % ✔ |
| After export + GC | +0.01 MiB | 0 | no leak |
| Downloaded file | `czaba-studio-lab.wav`, 29,189,420 B, "WAV created: 01:41.352", 0 page errors | | |

**A's window-end claim is not confirmed.** A says a strict in-window peak would be about 37.2 MiB. My "up to text" peak was also 64.96, but my text time is taken on the Node side, after the mutation, so my probe cannot separate the two. A's 37.2 MiB remains A's inference; I neither confirmed nor refuted it.

### REDPROOF-216
My own mutants ran on a `/tmp/c216/scratch` copy (`node_modules` symlinked), never in the store.

| Mutant | Change | Result |
|---|---|---|
| **CM1** | Spec l.316: `wavSampleRate` → `44100` in the expected-frame calculation (`cm1-frames.diff`) | rc 1 in 70 s. Every export fails with "WAV check failed: frames 4864896 vs 4469623", then `assert failed res.harness.export-1-produced` (and `export-2-produced`, plus the `.6x` versions). It also fails the consequential "row not measured 3 times: res.export.*.bytes". |
| **CM2** | Spec l.514: Ctrl+D removed (`cm2-no-dup.diff`) | rc 1 in 118 s. "aborted at Ctrl+D: after Ctrl+D: 1 clips, expected 2" on all 6 passes, then `assert failed res.harness.clips-2: measured median 1 [1, 1, 1], budget == 2` (and `.6x`). Consequential failures: `export-2-produced` and `mem-polls-2`, both with no samples. |
| **CM3** | `PERF_BUDGETS_RESOURCES` file with `res.harness.js-home-seen >= 1000` (`cm3-budgets.diff`) | rc 1 in 71 s. The only failure is `assert failed res.harness.js-home-seen: measured median 41 [41, 41, 41], budget >= 1000`. |

- No mutant hung.
- I read A's logs:
  - M1: rc 1 in 8.7 min, under the 15 min test timeout, with the `export-1-produced` asserts.
  - M2: the "WAV check failed: header" lines.
  - M3: "aborted at ready heap: … no finite backingStorageSize", with no `NaN`.
  - M4: the single `clips-2 == 3` failure.
- As A stated, only the budget mutants (M4, CM3) fail on exactly one row. The code mutants fail on the named row plus consequential rows.

### DOC-216
- **What passes:**
  - Doc 169 has the row table with A's medians (it matches `final-run-{1,2}.json`), the memory-API caveats (page heap only; RSS and `performance.memory` rejected, with reasons), the GATE206-S5 section and §"Findings for later PERF stages" (PERF-14 ruler, PERF-12 1× vs 6×, PERF-13 140 MiB, PERF-11 355 KB vs the 230 KB target).
  - Every one of the 69 cited `res.*` tokens exists in `budgets.resources.json`, or is a task-text wildcard that matches existing ids (`res.export.*.bytes`, `res.harness.js-*-seen`, `res.mem.*` and so on).
  - l.4 is exactly `**სტატუსი:** Completed (C round 216 PASS)`.
  - The diffs of docs 160, 161, 162 and 168 are l.4 only, byte for byte.
- **What fails: C-R216-01 (Low).**
  - `docs/implementation/TEMPLATE.md` (l.35) and `.claude/rules/implementation-docs.md` list `## არქიტექტურა` as a section; only the Mermaid content is "if needed".
  - Doc 169 has no `## არქიტექტურა` heading. Its Mermaid diagram sits inside `## მიდგომა`, after `### Pass-ის თანმიმდევრობა`.
  - All six previous docs in the window (163–168) have the heading, with the diagram under it.
  - The fix is moving the diagram under its own heading.

### AN-REVIEW-216
- `npm run typecheck`: rc 0.
- The new spec contains no `any`, no type assertion (` as `), no `@ts-*` and no lint suppression.
- `biome format` via stdin gives an empty diff, so semicolons and quotes are consistent.
- There are no styling-class selectors: elements are found by role, name, `data-testid` and `data-clip-kind` (L12).
- Biome is not claimed for `perf/` (L30). Both doc 169 and A's report say so.
- `budgets.resources.json` is valid JSON.

### G216-3
Fresh contexts with no credentials, at 1440×900 and 1280×720:
- **`/studio-lab`:** opens with the "Demo collection — no sign-in required" badge, the workspace renders, and `localStorage.auth_user` is null.
- **`/studio/middle-east`:** shows "Sign in required" with 0 `audio[src]`, 0 `audio` and no workspace.
- **`/api/studio-token?product=middle-east&file=stem1.wav`:**
  - no header → 401 `{"error":"Please sign in to access Studio."}`;
  - fake Bearer → 500 `{"error":"Unable to prepare Studio access"}`. The :5199 mock is not running; the task allows 500 in that case.
- **No token issued.** Premium auth is not bypassed.
- **One retry:** the first 1440 attempt threw because `document.body` was null right after the first dev-server load. That was an environment race in my script, not the app. I re-ran it with a `readyState` wait, and the final `g216.json` is that clean re-run.

### STUDIO-SMOKE-216
Dev server, fresh context, real mouse (`mouse.move`/`down`/`up` at element centres), at both viewports:
1. Add the demo clip: 1 audio clip.
2. Click `Export`. It is directly visible at both sizes: 1440 at x 1362, y 43; 1280 at x 1202, y 81. No collapsed toolbar was involved.
3. WAV is checked by default. Click "Export WAV".

**Result at both viewports:**
- **Download:** `czaba-studio-lab.wav` arrives.
- **Header:** RIFF/WAVE, fmt 16, PCM 1, 2 ch, 48,000 Hz, byteRate 288,000, blockAlign 6, 24-bit. The data chunk is 29,189,376 B, which is the file size minus 44.
- **Length:** 4,864,896 frames = 101.352 s. That is 0 frames from the dialog's "WAV created: 01:41.352".
- **Real audio:** RMS −15.29 dBFS and 99.77 % non-zero samples. The 10 s segment RMS rises from 0.075 to 0.22, and the last 1.35 s is quiet (0.0001).
- **0 page errors.** The console errors are only the expected cloud cart/:5199 ones.
- **Done** closes the dialog.
- **Screenshots:** `shots/smoke-{1440x900,1280x720}-{added,dialog,created}.png`.

**Observation, not a round-216 regression.** The dialog shows "Overload: peak +0.0 dBFS — 14 samples clipped to 0 dBFS" for the single demo clip at Master 0 dB. My own count is 30 samples at ±8,388,600 or beyond, across both channels; my threshold is wider than exact full scale, so the two counts are not a discrepancy (≥ 14 either way). This is the known, acknowledged class C-R86-OBS-DEFAULT-OVERLOAD (info). No app file changed this round.

## Ableton / product
- **Ableton conformance:** not applicable. This is a performance harness round (policy "Not in scope: pure performance").
- **CZABA requirement (PERF-1):** the export, memory, DOM and bundle baselines are printed and checked.
- **Product flow verified in the real browser:** find a sound in the demo library, add it, Export WAV, and get a real file. Video fitting was not part of this round's change.

## For B
1. **C-R216-01 (Low):** add a `## არქიტექტურა` heading to doc 169 and move the Mermaid diagram under it.
2. **C-R216-02 (Low):** in `budgets.resources.json` and the doc 169 table, set `res.harness.mem-polls-1`, `mem-polls-1.6x`, `mem-polls-2.6x` (and, for consistency, `mem-polls-2`) to a non-deterministic kind, with a note giving the observed values. Or rule that liveness-assert rows are exempt from the §2.5 label rule.
3. **Ruling A asked for, with C's data added:** A's question about the 0.1 MiB asymmetry is still open. In my runs, `res.export.1.peak-backing-delta-mib` was [65, 65, 65] both times, and `used-ready-mib` was [5.2, 5.1, 5.1] in run 2.
4. **Not re-reviewed:** A says four late spec changes were never seen by the code-reviewer (window redesign, end heap sample, assert evaluation on incomplete runs, 8 min guard). Root's reviewer should cover them.
5. **Why FAIL for two Lows:** both are defects in this round's own deliverable against its own acceptance rows, the same class as round 215. They are not product Lows for `deferred_low_polish`.
6. **Outcome table:** this is the case "a PERF or DOC row fails". The task fixes it as a bounded fix-up of those rows first. Both fixes are label or heading changes. A re-dispatch rewrites doc 169's l.4 N (L28).
