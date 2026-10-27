# C round 206: PERF-1a perf harness (SABA-B-5 measurement) + doc 162 l.4

**Verdict: PASS** on every C row of `current-task.md` §3. One harness finding goes to B (**C-R206-01**, Medium proposed; B rules). Every real-Chromium row ran (`browserVerified: true`).

- **Baseline:** c274930, uncommitted A work.
- **C role:** read-only for source. A's files are byte-identical at C's start and end (`out/scope-start-sha256.txt`).
- **Evidence:** everything is under `c-round-206/`: `tools/`, `out/`, `shots/`.
- **Ableton:** does not apply. No product behaviour changed; this is a perf/test-only round, and the "reference first" rule excludes those.

## Rows

| Row | Status | Evidence / facts |
|---|---|---|
| **SCOPE-206** (start and end) | **PASS** | **Frozen files:** `sha256sum -c b-round-205-r206-tree-sha256.txt` gives 1039/1039 OK at start and at end.<br>**Tracked diff:** `package.json` +1 line (`"test:perf": "playwright test --config playwright.perf.config.ts"`); doc 162 changes at l.4 only, with the exact R112 text.<br>**Untracked:** exactly the 7 files in `b-round-205-r206-new-files.txt`.<br>**Protected:** 0 changes under `app/`, `.claude/` and `CLAUDE.md` (all inside the frozen list).<br>**Ignored output:** after 5 perf runs, the only new output is gitignored (`build/`, `test-results/`); `git status` is the same at start and end. |
| **PERF-RUN-206** | **PASS** | **Run 1:** exit 0, 390 s wall (test 375.6 s), `failures []`, `complete true`.<br>**Run 2** (a separate invocation): exit 0, 383 s (test 368.8 s).<br>**Rows:** both JSONs have 161 rows, each with 3 samples, median, min and max (programmatic check, 0 bad rows). All 14 `assert` rows have `pass: true`.<br>**Determinism:** the 50 deterministic rows (components-per-commit, restarts, moves-dispatched, at 1× and 6×) are **identical** between runs, so 0 fall outside ±10 %/±2.<br>**Info:** `commits-per-move` is identical too. `load.longtask-max` was 362 / 366 ms, `load.ready-ms` 1112 / 1105.<br>**Run time:** 6.4–6.6 min, under the 12 min target.<br>**Overlap disclosure:** run 1 overlapped with C's `g206-3.cjs` (two browser contexts, about 25 s) during its build/load phase. Counts are unaffected (run 2 and the probe agree), wallclock rows are trend-only, and the run 2 load rows matched within 4–7 ms.<br>Files: `out/run1.*`, `out/run2.*`, `out/compare-run1-run2.txt` |
| **HARNESS-LIVE-206** | **PASS** | **Both green runs:** `harness.hook-live` = 2, `harness.audio-running` = 1, `harness.restart-live` = 1. All are PASS with real values.<br>**Red copy** (`out/red-hl-budgets.json`; only restart-live's budget changed, to `>= 1000`, per the JSON diff): exit 1 after 391 s. The only failure is `assert failed harness.restart-live: measured median 1 [1, 1, 1], budget >= 1000`.<br>The counter is read at run time, not hard-coded. Files: `out/red-hl.{log,json}` |
| **FADER-206** | **PASS** | **C's own probe:** `tools/cprobe.cjs` uses its own devtools-hook stub, its own fiber walk and its own `start()` patch on non-offline contexts. It does not import from `perf/`. It ran on a copy of the run-1 prod build served on :5190, at 1440×900, with 3 fresh contexts. Results:<br>• Volume — Music: **83** stopped and **83** playing (B 83, harness 83).<br>• Pan — Music: **4** / **4** (B 4, harness 4).<br>• Commits: 91 for track and 107 / 80 for pan, the same as the harness.<br>• `start()` during drags: 0. Play label "Pause", context `running`.<br>**Harness rows** (both runs):<br>• group 85 / 85, master 80 / 80, clip gain 79 / 87;<br>• moves-dispatched = 121 in all 20 rows;<br>• playing restarts = 0 in all 10 rows (1× and 6×);<br>• `frame-p95.6x` exists for all 10 scenarios.<br>Files: `out/cprobe-1440.{json,log}` |
| **PERF-RED-206** | **PASS** | **(a)** `out/red-a-budgets.json`, where only the `mode` of `fader.track.stopped.components-per-commit` is changed to `assert`: exit 1 after 397 s. The only failure is `assert failed fader.track.stopped.components-per-commit: measured median 83 [83, 83, 83], budget <= 3`.<br>**(b)** A tar copy at `/tmp/c206-redb` (outside the tree; `node_modules` symlinked; it built its own `build/`). The `window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {…}` assignment was deleted (`out/red-b.diff`). Result: exit 1 after 379 s, with `assert failed harness.hook-live: measured median 0 [0, 0, 0], budget >= 1`, plus "no commits during fader.*" for every window. A disabled hook cannot pass as 0. Liveness of the red-b page: `harness.audio-running` [1,1,1] and `harness.restart-live` [1,1,1] pass, all `moves-dispatched` rows = 121, playing restarts 0. Only the hook-dependent rows failed. Files: `out/red-a.*`, `out/red-b.*` |
| **ISOLATION-206** | **PASS** | `npx playwright test --list`: 80 tests in 10 files, 0 `perf` matches.<br>The smoke config `--list`: 2 tests in 1 file, 0 `perf` matches.<br>`git status e2e` is clean, so the `e2e/` list is unchanged from HEAD.<br>Files: `out/list-default.txt`, `out/list-smoke.txt` |
| **AN-REVIEW-206** | **PASS, with finding C-R206-01** | **Code:** `perf/*.ts`, `perf/lib/*.ts` and the config have no `any`, `as` assertion (the only ` as ` hits are inside label strings), `@ts-ignore`/`@ts-nocheck` or `route(`. There are no binaries or fixtures; `perf/` has 5 text files.<br>**Doc 163:** written in Georgian. It has the TEMPLATE sections, the metric definitions and limits, B's table, A's medians and the TODOs.<br>**L26:** all 13 row ids cited in doc 163 exist in `budgets.json`.<br>**Doc 162:** l.4 only.<br>**One false limit statement:** doc 163 l.60 says event-share-16 "is effectively the share of native range `input` entries". C measured 0 native `input` events during these drags (see C-R206-01). |
| **G206-3** | **PASS** | **Fresh contexts, no credentials** (`tools/g206-3.cjs`):<br>• `/studio-lab` opens anonymously at 1440 and 1280: workspace shown, "Demo collection — no sign-in required", `auth_user` null, 0 cookies, 0 forbidden or auth requests, 0 page errors.<br>• `/studio/middle-east` shows "Sign in required" with 0 `audio[src]` at both sizes.<br>• `/api/studio-token`: **401** with no header.<br>**Environment note:** this job had **no mock API on :5199** at start. Without it, the fake Bearer gets **500** "Unable to prepare Studio access": the backend fetch throws and the code's `catch` answers. No token is issued.<br>With the loop's `mock-api/server.mjs` started (the round 204/205 condition), the re-run (`tools/g206-3-mock.cjs`, `out/g206-3-mock.json`) gives **403** "Unable to verify ownership". All other checks are the same.<br>C stopped the mock afterwards. Premium auth is **not** bypassed. |
| gate | not claimed | full vitest, typecheck, build, Biome and `npm run verify` / e2e smoke belong to the root gate |

### Measured medians (both runs identical; 1× = 6× for counts)
| Fader | components/commit stopped / playing | restarts playing 1× / 6× | frame p95 playing 1× / 6× (ms, trend) | event-share-16 |
|---|---|---|---|---|
| track | 83 / 83 | 0 / 0 | 16.7 / 33.4 | 0 |
| pan | 4 / 4 | 0 / 0 | 16.8 / 33.3 | 0 |
| master | 80 / 80 | 0 / 0 | 16.7 / 33.4 | 0 |
| clip gain | 79 / 87 | 0 / 0 | 33.4 / 66.7 | 0 |
| group | 85 / 85 | 0 / 0 | 16.7 / 33.4 | 0 |

## Findings for B

### C-R206-01: `event-share-16` cannot go above 0 for these drags (Medium proposed; B rules)

**Repro:**
1. `node c-round-206/tools/cprobe.cjs http://127.0.0.1:<prod port> out.json`.
2. Pass 3 drags Volume — Music and Pan — Music while playing, at 6× CPU. The probe records every Event Timing entry ≥ 16 ms and counts `input` events in the window's capture phase.

**Expected:** the row meant to back "pointermove p95 < 16 ms" (budget note: "share < 5 % ⇔ p95 < 16 ms", owner PERF-FADER, which flips it to assert) can show a slow drag as non-zero. Doc 163's stated limit should be true.

**Actual:**
- The Event Timing entries during a drag are only `pointerover/enter/out`, `mouseover/out`, `pointerdown`, `pointerup` and `click`. Event Timing does not report `pointermove`.
- The faders dispatch **0 native `input` events** during a mouse drag (`inputEvents: 0` in all 14 probe drags; the value changes −27…0 and −45…45).
- So the row's filter (`pointermove` or `input`) matches nothing.
- In both runs, all 20 `event-share-16` rows are 0. That includes `fader.clipgain.playing.*.6x`: frame p95 66.7 ms, 136–147 frames over 33 ms (run 1), 74 LoAF, and probe `pointerup` up to 56 ms.
- If PERF-FADER flips this row to assert, it passes vacuously. This is the same "0 must not mean off" class the task guards for hook-live.
- Doc 163 l.60 and A's report ("effectively the share of native range input entries") are factually wrong.

**Two origins, so B can act on each:**
- **(a) Spec.** The metric definition is B's (R111; task §0 already recorded 0 pointermove entries). The vacuous-assert risk belongs in the PERF-FADER task text: replace, relabel or liveness-prove the metric before any flip to assert.
- **(b) Doc.** A added this round the false limit sentence in doc 163 l.60 ("effectively the share of native range `input` entries"). The `budgets.json` note on the event-share rows (e.g. l.219) carries the same "share < 5 % ⇔ p95 < 16 ms" equivalence. This is a one-line doc fix that B can grant alongside PERF-FADER.

**Neither blocks this round's PASS.** Every C row's criterion is met; event-share-16 is a `record` row. This is a harness and spec issue, not an app bug.

**Evidence:** `out/cprobe-1440.json` (`eventNamesMaxDur`, `inputEvents`); `out/run1.json` and `out/run2.json`, rows `*.event-share-16.*` (details: `slowEvents 0`, `eventEntries 26`).

### Info for B (not bugs of this round)
- **I-206-a.** The fake-Bearer result depends on the environment: 500 without :5199, 403 with the mock. The mock was not running at job start; there is no `cloud/` folder in the loop folder (`ls` result), and the cause was not established further. Future G-rows should start it or accept "500 = no token issued".
- **I-206-b.** The perf config's `remix-serve` listens on `*:5188` (A disclosed this).
- **I-206-c.** `biome.json` covers only `app/**`, so `perf/` is not linted or formatted by the project (A disclosed this).
- **I-206-d.** A drag to 95 % of the "Volume — Music" track only reaches 0 dB, the start value (−27 at 5 %). The guard is "low < high", so this passes, but PERF-FADER might want a drag that changes the value at both ends.

## Notes
- **Side effects:**
  - C started a prod copy on :5190 (`/tmp/c206-serve`) and the loop mock on :5199. Both were stopped.
  - The tar copy is `/tmp/c206-redb`.
  - Root's :5173 server was never touched and still returns 200.
- **Not run by C (speed rules):** the full suite, verify, e2e smoke. These are gate rows.
