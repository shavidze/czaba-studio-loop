# A round 206 — PERF-1a perf harness (SABA-B-5 measurement) + doc 162 l.4

No STOP. Baseline c274930. Every edit is inside the B grants and the new-file list. `app/` is untouched: all 1,039 frozen files pass `sha256sum -c b-round-205-r206-tree-sha256.txt`.

## Changed files
| Path | Change |
|---|---|
| `playwright.perf.config.ts` (new) | R-A config:<br>• testDir `./perf`, testMatch `*.perf.spec.ts`, 1 worker, retries 0, timeout 15 min<br>• Chromium (Desktop Chrome, 1440×900) with `--autoplay-policy=no-user-gesture-required`<br>• webServer `npm run build && npx remix-serve build/server/index.js`, `PORT=5188`, url `http://127.0.0.1:5188/studio-lab`, `reuseExistingServer: false`, timeout 300 s<br>• `outputDir: ./test-results/perf-artifacts`, so Playwright's cleanup does not wipe `test-results/perf/` |
| `perf/studio-lab.perf.spec.ts` (new) | One test that runs 6 passes (3 at 1×, 3 at 6×), aggregates them, checks determinism, writes the JSON after every pass and at the end, prints a table, and only then asserts |
| `perf/lib/instrumentation.ts` (new) | `addInitScript` instrumentation:<br>• devtools hook stub with the fiber walk (B's heuristic)<br>• `AudioContext` subclass that tracks contexts<br>• `start()` patch: counted after the native call, non-offline contexts only, grouped per task through a `MessageChannel` boundary<br>• event / LoAF / longtask observers, a rAF loop, and window `pointermove` timestamps |
| `perf/lib/stats.ts` (new) | median, p95, frame intervals, `countsAgree` (±10 % or ±2, whichever is larger) |
| `perf/lib/budgets.ts` (new) | `budgets.json` loader with type guards (no `as`), duplicate-id check, comparator |
| `perf/budgets.json` (new) | 161 rows. Generator: `a-round-206/tools/gen-budgets.cjs` (loop folder, not committed) |
| `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md` (new) | Georgian implementation doc. The status line is conditional, "C round 206 check pending" (L28) |
| `package.json` (grant) | Exactly `+ "test:perf": "playwright test --config playwright.perf.config.ts",` |
| `docs/.../162-lead-magnet-dialog-focus.md` (grant, R112) | l.4 only, set to the required text |

## Interpretations (for B and C)
1. **Pass order ("group last").** In each pass the group is created only after the other four faders were measured in both states. The sequence:
   1. load
   2. Add
   3. track, pan, master and clip gain, stopped
   4. Space, then 1 s settle and 5 s idle
   5. track, pan, master and clip gain, playing
   6. clip drag (`harness.restart-live`)
   7. Space to stop, then click the Stems name, Shift+click the SFX name, Ctrl+G
   8. group stopped, Space, group playing

   This keeps the eight non-group scenarios group-free, the same as B's probe. The exact list is in each result JSON under `sequence`, so C can replay it.
2. **Row ids.** A deterministic fader row has no suffix at 1× and `.6x` at 6×. A wallclock row always ends in `.1x` or `.6x`. Extra rows: `load.components`, `play.idle-components`, and `…moves-dispatched` (which is under the determinism check).
3. **Budget format.** `budget` is `null` or `{ "op": "<"|"<="|"=="|">="|">", "value": number }`. Only `mode: "assert"` rows can fail the run.
   - `fader.*.components-per-commit*` rows carry the PERF-FADER target `{ "op": "<=", "value": 3 }` as a record.
   - `event-share-16` carries `{ "op": "<", "value": 0.05 }` as a record.
   - Asserts:
     - `harness.hook-live >= 1`
     - `harness.audio-running == 1`
     - `harness.restart-live >= 1`
     - `play.idle-longtasks-over-50 == 0`
     - every `fader.*.playing.restarts` and `.restarts.6x` `== 0`
4. **Settle window.** It is not a fixed 600 ms; it is a quiet-wait: at least 600 ms (500 ms for the clip drag), then 200 ms with no commit and no `start()`, capped at 3 s. The measured settle was 604–608 ms everywhere. It is recorded in `components-per-commit` `detail.settleMs`.
5. **Extra run-failing guards** (from the code-review):
   - the slider value must go down and then up during the drag (`did not move`);
   - 0 commits in a fader window fails;
   - the clip must actually move in the restart-live step;
   - a PerformanceObserver type that cannot be observed fails;
   - every step error is recorded as `aborted at <step>`, and the partial JSON is still written.
6. **`harness.restart-live`** uses the metric name `restart-live`, so it is not under the fader-restarts determinism check.

## Exact edits for C's red-proofs
- **HARNESS-LIVE-206:** in a copy of `perf/budgets.json`, set the `harness.restart-live` row's `"budget"` to `{ "op": ">=", "value": 1000 }`. Run `PERF_BUDGETS=<copy> npm run test:perf`.
- **PERF-RED-206 (a):** in the `fader.track.stopped.components-per-commit` row, set `"mode": "assert"`. Its budget is already `{ "op": "<=", "value": 3 }`.
- **PERF-RED-206 (b):** in a tar copy, delete the `window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { … };` assignment in `perf/lib/instrumentation.ts`. Expected: `assert failed harness.hook-live: measured median 0 …`. The fader rows also fail, with "no commits during …".
- Failure wording: `assert failed <id>: measured median <v> [<samples>], budget <op> <value>`.

## Tests actually run (final code)
| Command | Result |
|---|---|
| `npm run typecheck` | exit 0 (`perf/` included) |
| `npm run lint` | exit 0: 0 errors, 205 warnings, all of them pre-existing in `app/` (lint covers only `./app`) |
| `npx biome format perf playwright.perf.config.ts` | **Processes nothing.** `biome.json` `files.includes` is `app/**` only ("These paths were provided but ignored"). Substitute check: a copy of the 6 files plus the project's formatter and linter settings in `/tmp`, `biome check` → "No fixes applied". All fixes Biome suggested (formatting, `Object.hasOwn`) were applied to the real files. |
| `npm run test:perf`, run A | **exit 0**, 383 s wall (test 369.5 s), failures `[]`, `complete: true`. Evidence: `a-round-206/perf-final-runA.json`, `final-runA.log` |
| `npm run test:perf`, run B (separate invocation) | **exit 0**, 422 s wall (test 407.9 s), failures `[]`. Evidence: `a-round-206/perf-final-runB.json`, `final-runB.log`. All 59 deterministic medians (excluding `commits-per-move`) equal run A's exactly (strict equality check) |
| My own red-proof (`a-round-206/red-budgets-final.json`: restart-live ≥ 1000 plus the track-stopped cpc flipped to assert) | **exit 1, as intended.** The output names `harness.restart-live` (median 1) and `fader.track.stopped.components-per-commit` (median 83, budget ≤ 3). Evidence: `final-red.log`, `perf-final-red.json` |
| `npx playwright test --list` (default config) | 80 tests in 10 files; 0 `perf` matches |
| `npx playwright test --config playwright.smoke.config.ts --list` | 0 `perf` matches |
| code-reviewer subagent, two real runs | Findings and handling are below. Review 1 covered the first revision. Review 2 was a scoped pass on everything added after review 1; its 2 Medium findings were fixed too. The very last fixes, for review 2, were not reviewed again; the root gate's independent reviewer sees the final code. |

Run time: 6.2–7.0 min per invocation, under the 12 min target. All three runs above used the exact final tree: typecheck exit 0 and Biome substitute clean after the last edit. Earlier runs are kept as history, not as final evidence: `perf-run1.json`, `perf-run2.json`, `red.log`, `superseded/`, and `superseded/pre-review2/`, which held green A, B and red runs before the review-2 fixes.

## Medians vs B (final run A; run B is identical)
| Scenario | B cpc | A cpc stopped / playing (1× = 6×) | A max per commit | restarts playing 1× / 6× | frame p95 playing 1× / 6× | frames >33 ms playing 1× / 6× | moves |
|---|---|---|---|---|---|---|---|
| track "Volume — Music" | 83 | 83 / 83 | 83 | 0 / 0 | 16.8 / 33.4 | 0 / 30 | 121 |
| master "Master Volume" | 80 | 80 / 80 | 80 | 0 / 0 | 16.7 / 33.4 | 0 / 25 | 121 |
| pan "Pan — Music" | 4 | 4 / 4 | 83 | 0 / 0 | 16.7 / 16.8 | 0 / 5 | 121 |
| group "Volume — … (group)" | — | 85 / 85 | 85 | 0 / 0 | 16.7 / 33.4 | 0 / 14 | 121 |
| clip gain "Clip Gain — fader" | — | 79 / 87 | 87 | 0 / 0 | 33.4 / 66.6 | 9 / 127 | 121 |

The wallclock columns are a trend only. In the pre-review-2 runs, the same 6× rows were 50 ms (track, master, group) and 33.4 ms (pan), with 50–66 frames over 33 ms. All counts in the table are unchanged across every run.

- Commits per move (1×): track 0.752, pan 0.884 / 0.661, master 0.793 / 0.744, clip gain 1.826 / 1.496, group 0.752.
- B's commit counts: 91–92 track, 90–96 master, 80–107 pan. Mine: 91, 96 / 90, 107 / 80 commits. They match.
- Harness rows: hook-live 2, audio-running 1, restart-live 1 (1 task, clip 0.000 → 1.000).
- Load: ready 1.01–1.16 s, longtask-max 359–366 ms, longtasks >50 ms = 2, commits 5, components 320.
- Idle playback: 0 commits, 0 long tasks.
- **No count differs from B's by more than 15 %.** Group and clip gain were not in B's probe, so they have no reference.
- Load numbers are below perf-plan's baseline (463–491 ms; 2.3–2.5 s). Two reasons: a different machine, and my "ready" is "Add enabled + preview waveform drawn".

Observations for B (facts, not app changes):
- **Clip gain re-renders the most and is the slowest.** It re-renders 79–87 components per commit at 1.5–1.8 commits per move, and is the only fader with frame p95 at 33.4 ms at 1× while playing (66.7 ms and 81 LoAF at 6×). It should rank high in PERF-FADER.
- **Pan's max per commit is 83**, though its median is 4: one commit per gesture is a full-tree render, probably the pointerup history commit.

## Code-review (real `code-reviewer` subagent): findings and handling
- **H1** (a throw meant no results were written): **fixed.** Each pass catches its errors into `aborted at <step>`, and the JSON is written after every pass and at the end.
- **M1** (no proof the fader moved; a disabled fader would read as 0): **fixed.** The drag now checks `toBeEnabled`, requires slider values low < high, and fails a window with 0 commits.
  - My first version demanded "high > start". That failed when the drag started at the slider's max (for example 0 → −27 → 0). It is now "low < high".
- **M2** (fixed settle windows at 6×): **fixed** with the quiet-wait (see Interpretations).
- **M3** (`observerErrors` never reported): **fixed.**
- **M4** (restart-live under the determinism check): **fixed** (metric `restart-live`).
- **M5** (`start()` calls not grouped per task, R-H): **fixed.** Each start gets a task id and the detail holds `tasks` and `startsPerTask`. The task boundary is approximate; this is documented.
- **Lows fixed:**
  - L6: rate-suffix regex;
  - L7: count `start()` after the native call;
  - L8: the clip must move, and the grab point is chosen by `elementFromPoint` (see the next point);
  - L9: `FaderName` type.
- **Lows documented in doc 163:**
  - L1: event-share-16 is effectively the share of `input` entries;
  - L2: possible memo double count;
  - L5: commits-per-move windows;
  - L10: observer cost;
  - L11: Ctrl+G is Linux/Windows only;
  - L12: Biome scope.
- **Lows kept by design** (R-D/R-H allow them):
  - L3: the median hides one bad pass on rows outside the determinism check;
  - L4: `running` is weak proof under the autoplay flag; `harness.restart-live` is the real liveness proof.
- **Harness bug found while running the M1/L8 guards (fixed).**
  - What happened: the 6× passes run long enough that the playhead passes ~29 s, and Follow scrolls the timeline. The fixed `clip.x + 200` grab point, and then my first clamp to the scroller edge, landed on the sticky lane-header column (288–512 px). So the clip drag did nothing.
  - It reproduced at 1× after the same scroll, on the dev server (`a-round-206/tools/d8.cjs 1 35000`), so it is **not an app bug**.
  - The grab point is now the first point where `elementFromPoint` hits the clip, plus 200 px.

**Review 2 (scoped, real `code-reviewer` run)**, after the fixes above:
- **Medium:** empty rows were given median 0, which caused false "1x 83 vs 6x 0" cross-rate failures in partial reports. **Fixed:** an empty row gets no median and is skipped in the cross-rate check.
- **Medium:** an aborted pass flooded the report with per-row "row not measured" lines. **Fixed:** `abortedAt` is stored per pass, and rows short only because their rate's pass aborted produce one summary line.
- **Lows fixed:**
  - the grab point is now `hits[20]`, an actual hit;
  - the `start` / `entry` rename;
  - doc 163 states the task-merge limit.
- **Lows not changed:**
  - grab-point flakiness while playing is caught by the clip-moved guard;
  - observerErrors are unread if load aborts;
  - waitForQuiet is bounded at 3 s.
- Its architecture note: "none".

**Architecture note (code-reviewer review 1, verbatim):** "Keep the harness structure as it is. It sits entirely under `perf/` with no coupling to `app/`, and its four files already separate in-page instrumentation, pure stats, budget validation and scenario orchestration. The one signal is that `perf/studio-lab.perf.spec.ts` also owns aggregation and report writing; if PERF-1b adds its scenarios to that file, B should plan one bounded task to move them into `perf/lib/report.ts`. The fiber tag/flag heuristic depends on React 18 internals, so whoever upgrades React must re-check it." (Its signal line: "keep for 1a; proposal for PERF-1b planning: move aggregation and report writing to `perf/lib/report.ts`".) This is a proposal for B; nothing was extracted.

## Known gaps / notes
- **Biome scope.** The literal self-check `npx biome format perf playwright.perf.config.ts` cannot pass or fail: Biome ignores both paths. I used the scratch-copy substitute. Widening `biome.json` is B's or root's call; the file is frozen.
- **remix-serve listens on `*:5188`** (all interfaces), not only on 127.0.0.1. The config sets only `PORT`. This is harmless on the runner. If wanted, a `HOST` env would need a B ruling.
- **No `test:perf` while the dev server was involved:** all perf runs used their own :5188 build. Root's :5173 dev server was never stopped. The scratch probes `d2–d8.cjs` only read from :5173.
- **`build/`** is rewritten by `test:perf`. It is gitignored, and `git status` shows only the intended files.
- **Not run by A (speed rules):** the full vitest suite, `npm run verify`, the e2e smoke. Those are gate rows.

## Next checks for C
1. **SCOPE-206:**
   - `git status` and `git diff`: only `package.json` (+1 line) and doc 162 l.4 among tracked files;
   - new files: `playwright.perf.config.ts`, `perf/studio-lab.perf.spec.ts`, `perf/lib/{instrumentation,stats,budgets}.ts`, `perf/budgets.json`, doc 163;
   - `sha256sum -c b-round-205-r206-tree-sha256.txt` passes.
2. **PERF-RUN-206:**
   - `npm run test:perf` twice: both exit 0;
   - `test-results/perf/latest.json` has 161 rows, each with 3 samples, median, min and max;
   - compare the deterministic medians with A's table.
3. **HARNESS-LIVE-206 / PERF-RED-206:** use the exact edits above.
4. **FADER-206:**
   - C's own probe for track and pan at 1× (expected 83 and 4);
   - group, master and clip gain rows: moves 121, playing restarts 0;
   - `.6x` frame rows exist for all 10 scenarios.
5. **ISOLATION-206:** both `--list` commands.
6. **AN-REVIEW-206:** no `any`, `as` or `@ts-ignore`, and no `route(`; doc 163 cites only existing ids (A's grep: all cited ids exist).
7. **G206-3:** the auth guard rows (unchanged code; A did not run them).

## Scope completed
- All §2 files are written.
- These §2 self-checks were run with the results above: typecheck, lint, Biome (substitute), `test:perf` ×2, default `--list`, my own red-proof, and the code-reviewer.
- I am not marking any C acceptance row as passed; C verifies. The rest of the backlog is open.
