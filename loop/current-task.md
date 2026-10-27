# CURRENT TASK — Round 206: STUDIO-PERFORMANCE PERF-1a, a perf harness that measures the fader drag (SABA-B-5), plus a one-line doc fix

Decision: **D-29z171**. The queue move is D-29z172. Planned by B on 2026-10-27. Dispatcher: B. Implementer: A. Verifier: C.

**Read first:**
- `lessons.md` in the loop root.
- The previous task, `tasks/round-205.md` (an exact copy).
- B's rationale, in `b-round-205.md`.
- B's planning probe:
  - `b-round-205/tools/perfprobe.cjs`
  - the outputs `b-round-205/out/perfprobe-head-*.json`

## Baseline
- **Commit:** `c274930`. Gate 205 is **published** to both remotes, so this is a clean tree with nothing uncommitted.
- **Frozen files:** the 1,039 files in `b-round-205-r206-tree-sha256.txt`. This covers every tracked file except the 2 grants, so **all of `app/` is frozen**.
- **Grants:** `b-round-205-r206-grants.txt`. Their start hashes are in `b-round-205-r206-granted-start-sha256.txt`, and start copies are in `b-round-205/r206-granted-start/`.
- **New files:** listed in `b-round-205-r206-new-files.txt`.
- **Protected areas:** auth/purchase files, `.claude/**` and `CLAUDE.md` are frozen, as always.

## 0. Why this round
- **Saba's order (2026-10-27):** after SABA-B-4 (rounds 204 and 205, now published), **STUDIO-PERFORMANCE** comes next, starting with PERF-1, the harness. It comes before SYS-1…3 and before the remaining STORE stages. Saba finds the Studio slow, and gave the fader drag as an example (SABA-B-5, Medium).
- **The bug gate is clear.** No Critical, High or Medium finding is open apart from:
  - SABA-B-5 itself, which this stage measures and PERF-FADER fixes;
  - Tech Lead, environment or accepted classes.
  - C round 205's two new findings are Low (rulings are in `b-round-205.md` §3).
- **Split, without shrinking scope** (tech-lead consult): PERF-1 becomes two rounds.
  - **PERF-1a** (this round): infra, load, playback and the fader scenarios.
  - **PERF-1b** (next): zoom, clip click, range drag, **fade-handle drag and trim drag** (Saba's SABA-B-5 text: "B checks the other continuous drags"), play/pause commit size, export, bytes, DOM and memory.
  - All baseline rows of `perf-plan.md` stay in scope.
- **B's probe on a scratch prod build of `c274930`** (1440×900, demo library, one "Add"). These are facts:

| Drag (121 pointer moves, 60 steps each way) | Commits | Re-rendered components per commit (median) | `start()` calls during drag while playing | Frame p95 at 1× / 6× CPU, playing |
|---|---|---|---|---|
| Track volume "Volume — Music" (runs `music-f1/f6`; the earlier `head-*` runs hit "Volume — Original video sound" and also gave 83) | 91–92 | **83** | 0 | 16.8 / **50** ms (53–105 frames > 33 ms) |
| Master "Master Volume" | 90–96 | **80** | 0 | 16.8 / **50** ms (96–134 frames > 33 ms) |
| Pan "Pan — Music" (already writes the AudioParam directly) | 80–107 | **4** | 0 | 16.7 / 33.4 ms (31–66 frames > 33 ms) |
| Idle playback, 3 s | 0–1 | 0–1 | — | 16.8 / 33.2 ms |

- **Source facts behind these numbers** (`ArrangementContext.tsx` at c274930):
  - These four previews call `updateHistory`, which makes the whole context value new, and then `syncPlayback`, on every move:
    - `previewVolumeTarget` (l.2365), for track and group;
    - `previewMasterGain` (l.2727);
    - `previewClipGainFader` (l.2846);
    - `previewClipGainMembers` (l.2892).
  - `syncPlayback` calls `startGraph` only when `scheduleKey` (l.533) changes. `scheduleKey` serialises clips and loop **without** `gainDb`. So root's hypothesis "a fader move rebuilds the graph" is **not supported** by the source or the probe (0 restarts).
  - "0 restarts while playing" therefore stays an **asserted** row. It guards PERF-FADER.
- **Measurement methods B proved on the prod bundle** (the performance-optimizer consult agrees):
  - a `__REACT_DEVTOOLS_GLOBAL_HOOK__` stub installed with `addInitScript` receives every commit;
  - a fiber walk, using the PerformedWork flag (1) and descending only where `child !== alternate.child`, separates 83 from 4;
  - patching `start` on `AudioScheduledSourceNode`, and on `AudioBufferSourceNode`, `OscillatorNode` and `ConstantSourceNode` where they define their own, counts the 1 start on Play.
  - **Fact:** a capture/bubble wrapper around `pointermove` measures only the handler (~0.1 ms). React renders a native-listener update in a later task. Event Timing at `durationThreshold: 16` recorded 0 pointermove entries at 1×. Wall-clock evidence therefore comes from rAF frame intervals and LoAF, not from handler time.

## 1. Rulings (B; Saba or root may veto)
- **R-A (placement).**
  - The specs live in a new top-level **`perf/`** testDir. They are not under `e2e/`, so the default `playwright test` (`testDir: './e2e'`) and `npm run test:e2e` never pick them up, and `playwright.config.ts` stays frozen.
  - The new `playwright.perf.config.ts` sets:
    - `testDir: './perf'`, `workers: 1`, `retries: 0`;
    - Chromium only;
    - `webServer` runs `npm run build && npx remix-serve build/server/index.js`, with `PORT=5188`, `url: http://127.0.0.1:5188/studio-lab`, `reuseExistingServer: false` and a timeout ≥ 180 s.
  - `package.json` gets one script: `"test:perf": "playwright test --config playwright.perf.config.ts"`. It is **not** added to `verify`.
- **R-B (budgets).**
  - `perf/budgets.json` is an array of rows: `{ id, scenario, metric, unit, kind: "deterministic" | "wallclock", mode: "assert" | "record", budget, tolerancePct?, owner: "PERF-n", note }`.
  - Only `assert` rows can fail the run. A `record` row is printed and written, never asserted. Later PERF tasks flip their own rows to `assert`.
  - `wallclock` rows are never `assert` in this round.
  - A `PERF_BUDGETS=<path>` environment variable replaces the budgets file. It exists for C's red-proof and for later tasks.
- **R-C (results).**
  - Each run writes `test-results/perf/perf-1a-<ISO time>.json` and `test-results/perf/latest.json`. `test-results/` is already gitignored.
  - Each row stores: the 3 samples, the median, min, max, and the budget with its mode and pass/fail.
  - A short table is also printed to stdout.
- **R-D (median of 3).** A **pass** is one fresh browser context that runs the whole scenario sequence in the fixed order of R-G. There are **3 passes per CPU rate** (so 6 page loads in total, not one context per scenario). Each row reports the median of its 3 samples.
  - **Determinism assert:** applies **only** to `components-per-commit`, `restarts` and moves dispatched. Their 3 samples must agree within ±10 % or ±2, whichever is larger. If they do not, the run fails with "nondeterministic count <id>".
  - **Commit counts** (`commits-per-move`, `load.commits`, `play.idle-commits`) are record-only and never under the determinism assert. The Scheduler merges commits under load, so they can vary.
  - **Wallclock rows:** a trend only, with ±30 % expected noise.
- **R-E (no interception).**
  - No `page.route` or `context.route` on `/studio-lab` (perf-plan gotcha: it left the page on "Loading…").
  - No app source change; all of `app/` is frozen. Instrumentation is `addInitScript` only.
  - `localStorage.czaba_analytics_consent = 'denied'` is allowed (the e2e smoke precedent).
- **R-F (CPU profiles).**
  - Load and playback rows run at 1×.
  - Every fader scenario runs at **1× and 6×** (`Emulation.setCPUThrottlingRate`), with 3 contexts each. B's probe shows the volume/pan difference in frames only at 6×. `components-per-commit` and `restarts` must agree across the two rates within R-D. Commit counts may differ between rates and are only recorded.
- **R-G (fader scenarios).** There are 5 faders × {stopped, playing}. **Fixed order inside a pass:** track volume → pan → master → clip gain → **group last**. Ctrl+G changes the lane tree, so creating the group earlier would change the counts of every later fader. C's independent probe uses the same order. Each drag is `mouse.down` at the middle, 60 steps to 5 % of the width, then 60 steps to 95 %, then `mouse.up`. Moves dispatched = 121, and this is recorded.
  1. track volume (`aria-label` "Volume — Music");
  2. **group** volume: group two audio lanes first with click + Shift-click on the lane names, then Ctrl+G. The pattern is in `c-round-80/tools/q1.cjs`. Use the group's own fader label from `studioGroupHeaderStrings.volumeLabel`.
  3. "Master Volume";
  4. "Pan — Music";
  5. "Clip Gain — fader", after a click selects the added clip.
  - Find every element by role or label, never by class (L12).
  - If the group or clip-gain fader cannot be reached through the UI, write **STOP — needs B ruling** (L11). Do not use a hidden route or a source change.
- **R-H (playing state).**
  - "Playing" means: Space after the library "Add", the Play button's `aria-label` reads "Pause", and the patched `AudioContext` constructor reports `state === 'running'` on the context that is not offline.
  - Launch Chromium with `--autoplay-policy=no-user-gesture-required`.
  - Count `start()` calls only on contexts that are **not** `OfflineAudioContext`.
  - Loop stays off. Group the `start()` calls per task when reporting.

## 2. A — files you own (everything else is frozen)
| Path | What |
|---|---|
| **new** `playwright.perf.config.ts` | R-A |
| **new** `perf/studio-lab.perf.spec.ts` (+ helpers under `perf/lib/` if you want) | the scenarios below |
| **new** `perf/budgets.json` | R-B rows listed below |
| **new** `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md` | Georgian implementation doc (TEMPLATE.md sections). It covers how to run the harness, each metric's definition and its known limit (Event Timing 16 ms floor; handler time ≠ render time; counts heuristic may slightly undercount hook bailouts), B's baseline table and your own measured medians, and the TODOs (PERF-1b scenarios, PERF-FADER flips its rows). **L26:** cite only test or row ids that exist. **L28:** write the status line conditionally ("C round 206 check pending"); root amends it at publication. |
| `package.json` (grant) | exactly the one `test:perf` script line; no dependency change |
| `docs/implementation/2026/quarter-IV/162-lead-magnet-dialog-focus.md` (grant), **R112** | l.4 only: the status becomes `In Progress (C round 205 PASS — c-round-205.md; published c274930; open: C-R205-01 in-flight window, Low)`. No other line changes. |

**TypeScript:** strict mode. `tsc` includes `**/*.ts`, so `npm run typecheck` checks `perf/` too.
- No `any`, no `@ts-ignore`, no `as` assertions.
- Type the fiber walk with a minimal local interface (`{ tag: number; flags: number; child, sibling, alternate: Fiber | null }`). Type the hook with `declare global { interface Window { … } }`.
- Semicolons everywhere. Biome lints only `./app`, but keep the same style.

### Scenarios and budget rows (R111)
| Row id | Scenario | Metric | kind | mode / budget |
|---|---|---|---|---|
| `harness.hook-live` | load + library "Add" click | commits seen by the hook after the Add click | deterministic | **assert ≥ 1** (a disabled hook must fail, not report 0) |
| `harness.audio-running` | playing setup (R-H) | the AudioContext is running, and Play's label is "Pause" | deterministic | **assert true** |
| `harness.restart-live` | while playing, drag the added clip 1 s to the right (a scheduleKey change) | `start()` calls from pointerdown until 500 ms after pointerup (the move may apply on release) | deterministic | **assert ≥ 1** (proves the restart counter is live) |
| `load.longtask-max` / `load.longtasks-over-50` / `load.ready-ms` | fresh `/studio-lab` until "ready" (A defines and documents ready as an observable UI state, e.g. the library Add button enabled and the waveform drawn) | the largest long task; the count over 50 ms; ms to ready | wallclock / deterministic / wallclock | record (owner PERF-2 / PERF-5); baseline 463–491 ms, ready 2.3–2.5 s |
| `load.commits` | the same | commits and summed re-rendered components until ready | deterministic | record |
| `play.idle-commits` | 5 s of playback after start + 1 s settle | commits and re-rendered components | deterministic | record (perf-plan: 0; B saw 0–1) |
| `play.idle-longtasks-over-50` | the same | count | deterministic | **assert 0** at 1× |
| `fader.<track/group/master/pan/clipgain>.<stopped/playing>.components-per-commit` | R-G | median of re-rendered components per commit during the drag (+ max) | deterministic | record (owner PERF-FADER, target ≤ 3) |
| `…commits-per-move` | R-G | commits ÷ moves dispatched | deterministic | record (an upper bound only; the Scheduler merges commits) |
| `…restarts` (playing only) | R-G | `start()` calls during the drag | deterministic | **assert 0** |
| `…frame-p95` / `…frames-over-33` (1× and 6×) | R-G | rAF interval p95 and count > 33.4 ms during the drag | wallclock | record (trend) |
| `…loaf-count` / `…event-share-16` | R-G | LoAF entries during the drag; the share of dispatched moves with an Event Timing pointermove or input entry ≥ 16 ms | wallclock | record (owner PERF-FADER: share < 5 % ⇔ p95 < 16 ms) |

**Self-checks before handover (A runs these, not the full suite):**
- `npm run typecheck`
- `npm run lint`
- `npx biome format perf playwright.perf.config.ts` (read-only; it must report no changes)
- `npm run test:perf` **twice**, keeping both result JSONs in `a-round-206/`
- `npx playwright test --list` with the default config: it must show no `perf/` file
- one red-proof of your own (see PERF-RED-206)
- the code-reviewer, because 3+ files change. Carry its Architecture note to B verbatim.

**Report** (`a-round-206.md`):
- the medians table next to B's table;
- any count that differs from B's by > 15 %, with your explanation (a different heuristic, or a group or clip-gain scenario not in B's probe);
- the run time of `test:perf`, which should be ≤ 12 min. If it is longer, say so.

**STOP conditions (L11):**
- the hook receives no commits from the prod bundle;
- the group or clip-gain fader cannot be reached via the UI;
- the non-offline AudioContext stays `suspended` in headless Chromium even with the autoplay flag;
- a needed change touches any frozen file.

## 3. C — rows
**Setup:**
- Root's dev server stays on :5173. The perf config builds and serves its own copy on :5188.
- Run on the tree, or on a tar copy with node_modules symlinked if you want to isolate it.
- **No ref comparison is needed:** this is a new harness, so there is no before-picture.
- **Ableton: does not apply** (no product behaviour changes).

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-206** (start and end) | HEAD, `git status`, the frozen list (1039), the grant diffs vs the start copies, the new files | only `package.json` (+1 script line) and doc 162 l.4 differ among tracked files; the new files are exactly the ones in `b-round-205-r206-new-files.txt`; **0 changes under `app/`**; protected files, `.claude` and `CLAUDE.md` unchanged |
| **PERF-RUN-206** | `npm run test:perf` twice (separate invocations) | both runs exit 0; every `assert` row passes; the JSON has every row of §2 with 3 samples, median, min and max; deterministic medians agree between the two invocations within ±10 %/±2; the run time is recorded |
| **HARNESS-LIVE-206** | read `harness.*` in both JSONs; then run once with a `PERF_BUDGETS` copy where `harness.restart-live` needs ≥ 1000 | the three `harness.*` rows pass with real values; the ≥ 1000 copy **fails** and names that row (the counter is read, not hard-coded) |
| **FADER-206** | compare the 5 × 2 fader rows with C's **own independent probe** (not A's code), written under `c-round-206/tools/`, for track volume and pan, stopped and playing, at 1× | C's component-per-commit medians match the harness within ±15 % (B's reference: 83 and 4); the group, master and clip-gain rows have real values with moves dispatched = 121; restarts while playing = 0 in every playing row; the 6× frame rows exist for all 10 scenarios |
| **PERF-RED-206** | (a) a `PERF_BUDGETS` copy that flips `fader.track.stopped.components-per-commit` to `assert ≤ 3`; (b) on a tar copy outside the tree (never in A's files), remove the hook stub from the spec and run it | (a) the run fails, naming that row and the measured value; (b) `harness.hook-live` fails (a hook that is off cannot pass as "0 commits") |
| **ISOLATION-206** | `npx playwright test --list` (default config) and `npx playwright test --config playwright.smoke.config.ts --list` | no `perf/` spec in either; `e2e/` file list unchanged from HEAD |
| **AN-REVIEW-206** | the new `.ts` files and the docs | no `any`, `@ts-ignore` or `as` assertion; no `route(` interception; no committed fixtures or binaries; doc 163 in Georgian with the metric definitions and limits, B's table, A's medians and the TODOs; **L26:** every row id cited in doc 163 exists in `budgets.json` or the spec; doc 162 differs only at l.4 |
| **G206-3** | fresh contexts at 1440 and 1280: `/studio-lab` opens anonymously (demo collection, no sign-in); `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token` returns 401 with no header and 403 with a fake Bearer | all true; premium auth is not bypassed |
| **gate** | full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke | not claimed by C; the root gate runs them |

`browserVerified`: PERF-RUN, HARNESS-LIVE, FADER, PERF-RED and G206-3 are real Chromium rows that **can** run in the cloud. If any of them did not run, the flag is false.

## 4. Adjacent behaviour that could break
- **`npm run typecheck`:** the new `.ts` files are type-checked. A type error there fails the gate.
- **`npm run test:e2e` and the smoke gate:** they must not pick up `perf/` (ISOLATION-206).
- **`build/`:** `test:perf` writes the production build into `store/build`. It is gitignored, and root's dev server on :5173 does not read it. C checks that `git status` shows nothing new outside the new files.
- **Run time:** a `test:perf` run longer than 15 min is reported as a Low.

## 5. Publication
After C PASS, root runs the gate. The commit message says: "perf harness only; no app/ change; doc 162 status line". Root also amends doc 163's status line to the post-PASS wording, per L28.

## 6. After this round (not in scope)
- **PERF-1b** also measures the fade-handle, trim and range drags. Each one that shows the same whole-provider re-render becomes its own PERF task.
- **PERF-FADER** (SABA-B-5 fix, following the pan pattern; tech-lead traps are listed in `b-round-205.md` §5) or **PERF-1b**. B decides at round-207 planning, from the PERF-1a numbers.
- **Then** PERF-2…16, then SYS-1…3, then STORE-2b…5 (paused), then REVIEW-RECOMMENDATIONS and T12-ADVANCED.
- **Regression round:** due on or after 2026-10-30.
- **RETRO:** at round 215, or at the end of the STUDIO-PERFORMANCE entry, whichever comes first.
