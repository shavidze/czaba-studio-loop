# CURRENT TASK — Round 214: PERF-1b-i. Interaction baselines (drags, clip click, zoom with 30 clips, play/pause) + harness hygiene

Decisions: **D-29z204** (round 213 accepted; SABA-B-5, GATE212-B1 and PERF-FADER-c closed), **D-29z205** (gate-213 review findings; doc 167 post-PASS grant), **D-29z206** (PERF-1b split into 1b-i and 1b-ii), **D-29z207** (PERF-1b-i design and rulings), **D-29z208** (queue: RETRO 215, then PERF-1b-ii).
- Planned by B on 2026-10-27.
- Dispatcher: B. Implementer: A. Verifier: C.
- Consults: `performance-optimizer` and `tech-lead`, 2026-10-27. Summary in `b-round-213.md` §4. Raw probe: `b-round-213/consult-perf/{results.json,measure.mjs}`.

**Read first:**
- `lessons.md`. L10, L11, L12, L23, L26 and L28 apply.
- `b-round-213.md` §4: the consults and the dev-server probe numbers.
- Harness doc: `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md` (approach, metrics table, liveness rows).
- Code:
  - `perf/studio-lab.perf.spec.ts`: l.114–260 (helpers), l.286–480 (`dragFader`, `moveWindow`, `moveToPaint`, `measureFader`), l.607–744 (`runPass`) and l.746–881 (report and test);
  - `perf/lib/instrumentation.ts` (l.120–140: the hook stub), `perf/lib/budgets.ts` and `perf/lib/stats.ts`;
  - `playwright.perf.config.ts` (read only).
- App selectors (read only):
  - `ArrangementClip.tsx`: l.891–896 (move header title), l.908 (range body title), l.990–1000 (fade handles), l.1011–1016 (trim edges);
  - `ArrangementLane.tsx` l.1025–1026 (`data-range-start` / `data-range-end`);
  - `StudioWorkspace.tsx` l.1865 (Ctrl+D), l.1228 and l.1790 (zoom step);
  - `app/lib/arrangement/strings.ts` l.344 (`Zoom (px/s)`).
- Project:
  - `.claude/prompts/new-test.md`;
  - primitives `TESTING_QUALITY_GATES.md`, `AGENT_DISCOVERABLE_CODE.md` and `GEORGIAN_DOCS.md`.

## Baseline
- **HEAD `fe556fd`** (gate 213 published rounds 212 and 213). The tree is clean.
- **Frozen:** the 1,054 files in `b-round-213-r214-tree-sha256.txt`. That is every tracked file minus the 5 grants. From the store root, run `sha256sum -c --quiet <loop>/b-round-213-r214-tree-sha256.txt`. B checked it: rc 0.
- **Grants:** `b-round-213-r214-grants.txt` (5 files).
  - Start hashes: `b-round-213-r214-granted-start-sha256.txt`.
  - Start copies: `b-round-213/r214-granted-start/`.
- **New files:** `b-round-213-r214-new-files.txt` (3 files). None of them exist yet.
- **Protected as always:**
  - `app/**`: no app source, test or style changes this round;
  - auth and purchase files;
  - `.claude/**`, `CLAUDE.md`;
  - `package.json`, `biome.json`, `tsconfig*.json`, `vitest.config.ts`, `vite.config.ts`, `playwright*.config.ts`.

## 0. Why this round
- **Round 213 PASSED** (C, `browserVerified` and `realVerified` both true). Gate 213 published `fe556fd`.
  - **SABA-B-5 is closed:** all three parts are now published.
  - **GATE212-B1 is closed:** in gate 213, CP12a–d took 4.6–5.9 s against the 30 s limit (`gates/round-213/verify.log` l.536–539).
- **No open C bug.** So the next item is the next queue stage. Under D-29z199 that is **PERF-1b** in STUDIO-PERFORMANCE.
- **PERF-1b is split (D-29z206).** This is a split, not a deferral; both halves stay in `stages`.
  - PERF-1a already takes 8.8 min of its 15 min Playwright timeout (`a-round-212/perf-run-1.log` l.35: 525 s).
  - So the full PERF-1b list does not fit in that test, or in one round.
  - **1b-i (this round):** the interaction scenarios, plus the hygiene items that live in the same spec.
  - **1b-ii (round 216, after RETRO 215):** WAV export long tasks and peak memory, JS bytes per route, DOM per clip, backing-store MB, and GATE206-S5 (document only).
- **SABA-B-5 asked for this.** The policy says "B checks the other continuous drags (fade handles, clip gain, range, trim) with the same harness and lists the ones that need the same treatment as PERF tasks". This round produces that list from measured numbers.
- **Reference first:** not applicable. This is a performance harness round (policy "Not in scope: pure performance").
- **Ableton conformance:** not applicable.

## 1. What the probe already shows (indicative only)
`performance-optimizer`'s dev-server probe (React 18.3.1 dev build, 1×, 3 identical runs): `b-round-213/consult-perf/results.json`.

| Scenario | commits / move | components / move | `start()` per move (playing) | `start()` at release |
|---|---|---|---|---|
| range body drag | 2.03 | 103 | 0 | 0 |
| fade-in handle | 1.00 | 94.7 | 0 | 1 (1 clip), 29 (30 clips) |
| trim start | 1.87 | 96.1 | 0 | 1 / 29 |
| clip move | 1.93 | 99.7 | 0 | 1 |
| zoom key | 1 per key | 95 (1 clip), 240 (30 clips) | — | — |
| clip click | 2 commits | 87 + 0 | — | — |
| play / pause | — | about 87 each | — | 1 (1 clip), 28 (30 clips) |

These are **dev-build numbers**. The production harness numbers this round are the baseline. Do not copy the probe numbers into the doc as measured results.

## 2. Rulings (D-29z207). Required.
1. **A second spec file, self-contained** (tech-lead).
   - Create `perf/studio-lab-interactions.perf.spec.ts` with one test, `'studio-lab perf harness PERF-1b-i'`.
   - Copy the small pure helpers it needs from the PERF-1a spec: `snapshot`, `waitForQuiet`, `startTasks`, `setPlayback`/`isPlaying`, `blurActive`, `moveToPaint`, `formatLimit`, and the median/determinism logic of `buildReport`.
   - **Do not refactor the PERF-1a spec into `perf/lib/` this round.** That is a later signal (`PERF-HARNESS-SHARED-LIB`). The PERF-1a spec is the reference for 316 rows, and its regressions must not mix with the new baseline.
2. **Separate budgets and results.**
   - Budgets: `perf/budgets.interactions.json`, loaded with the existing `loadPerfBudgets` (`perf/lib/budgets.ts:84`). Override env var: `PERF_BUDGETS_INTERACTIONS`.
   - Every row id starts with `interact.`.
   - Results: `test-results/perf/perf-1b-i-<ISO>.json` and `test-results/perf/latest-interactions.json`. The report's `harness` field is `'PERF-1b-i'`.
   - **The PERF-1a `latest.json` is never written by the new spec.**
   - The new report keeps PERF-1a's two failure rules on its own file: "measured row without a budget row" and "row not measured N times".
3. **Passes, rates and order.** `cpuRates [1, 6]`, with 3 passes per rate. Each pass is one fresh browser context at 1440×900.
   - **Pass order:**
     1. load and Add (1× only);
     2. clip click;
     3. zoom with 1 clip;
     4. the four drags, stopped;
     5. play (play rows);
     6. the four drags, playing;
     7. pause (pause rows);
     8. **the 30-clip block:** Ctrl+D ×29, zoom with 30 clips, then the playing fade-in drag with 30 clips.
   - **Throttle.** It turns on after step 1, as in PERF-1a.
   - **The 30-clip block (step 8) runs in 1× passes only.** Its rows have no `.6x` siblings: `interact.harness.clips-30`, `interact.zoom.30.*`, `interact.harness.drag-fade-30-live` and `interact.drag.fade.30.*`. 6× passes end after step 7.
   - The load rows are also 1× only, like PERF-1a. Steps 2–7 are measured at both rates; their 6× ids carry `.6x`.
   - **Time limit:** the new test's own duration (`durationMs` in the report) must be ≤ 12 min.
     - **Pre-ruled fallback:** if it is over and the overage comes from the 6× passes, drop the 6× zoom-with-1-clip rows (step 3 becomes 1×-only, with no `.6x` rows). Record that as a deviation in doc 168. This is not a STOP.
     - It is a **STOP (L11)** only if the test is still over 12 min after the fallback. Report the per-scenario timing.
     - Drop nothing else, and cut no steps, by yourself.
4. **Drags.** Each drag uses `dragSteps = 60` mouse steps, like PERF-1a, and moves **+120 px to the right** from the grab point (the same distance for all four drags; C's PROBE-214 uses the same steps and distance). Each runs both stopped and playing. Use these grab targets:

   | Drag | Target | Grab point |
   |---|---|---|
   | range | `getByTitle('drag = time selection · click = playhead')` on the added clip | at 0.6 of its height |
   | fade-in | `getByTestId('arrangement-clip-fade-in-handle')` | its centre |
   | trim start | `getByTitle('Trim — left edge')` | at 0.6 of its height, so it misses the fade handle |
   | move | `getByTitle(/ — drag to move$/)` | `clipGrabPoint`-style point, clamped to the viewport |

   - No styling-class selectors (L12).
   - Clamp every grab point to the viewport. After Add, the clip is about 4,054 px wide.
   - **Reset after every drag**, so each pass and each scenario starts from the same state. Use Undo (Ctrl+Z) for history edits, and Escape or a playhead click to clear the range; A names the method in the doc.
   - Then **assert the reset**: `data-clip-start`, `data-fade-in` and the clip's width are back to their start values, and no `[data-range-start]` element is left.
   - Ctrl+D refuses while a range is set (`ArrangementContext.tsx` ~l.1994), so the range must be cleared before the 30-clip step.
5. **The 30-clip setup.**
   - Click the added clip's header and blur focus.
   - Press Ctrl+D 29 times. After each press, assert the clip count (`[data-clip-kind="audio"]`) is the press number + 1.
   - Then measure zoom with 30 clips.
   - Then measure one playing fade-in drag on the first clip, for the release restart count. The copies sit back to back, so the fade-in handle of clip 1 is the only drag here.
6. **Hygiene in the PERF-1a spec.** Only these three edits are allowed in `perf/studio-lab.perf.spec.ts`, `perf/lib/instrumentation.ts` and `perf/budgets.json`.
   - **GATE206-S3 (renderer version).**
     - In `installPerfInstrumentation`'s `inject`, record the injected renderer's `version` when it is a string, using a type guard. No `as`.
     - Expose it, e.g. as `window.__czabaPerf.rendererVersions()`.
     - Both specs push a failure when no renderer was injected, or when the major version is not `18`. Both reports gain a field `reactRenderer` holding the version string.
     - No new budget row.
   - **GATE206-S6 (audio really runs).**
     - `harness.audio-running` becomes 1 only when the AudioContext state is `running` **and** at least 1 `start()` was recorded from the play key press to the end of the idle window.
     - The row id, mode and budget (`== 1`) stay. Rewrite only its `note` in `budgets.json` to the new meaning; this is the only `budgets.json` edit.
     - The new spec has its own liveness row with the same rule: `interact.harness.audio-running`.
   - **GATE211-S4 (fixed wait).**
     - In `selectClipGainMembers` (l.203), replace `waitForTimeout(2000)` with a state wait: two audio clips, and two `arrangement-clip-waveform` elements rendered.
     - **Ruling:** the `waitForTimeout(2000)` at l.638 stays. It is the measurement window of `harness.hook-live` ("React commits ... in the 2 s after the Add click", `budgets.json` l.14), not a settle wait.
   - **The PERF-1a assert rows must still pass, and the record medians must stay where they are.** Every one of the 316 rows is still measured 3 times.
7. **Row design** (D-29z174 pattern). Every new metric is `record`. Only the liveness and setup rows are `assert`. Asserts on the interaction budgets come with the PERF fix that owns each interaction.

## 3. A: the files you own. Everything else is frozen.
| Path | What |
|---|---|
| `perf/studio-lab-interactions.perf.spec.ts` (new) | §2.1–2.5 and the rows in §4. |
| `perf/budgets.interactions.json` (new) | One row per measured id. Fields as in `budgets.json`: `id, scenario, metric, unit, kind, mode, budget, owner: "PERF-1b-i", note`. |
| `perf/studio-lab.perf.spec.ts` | §2.6 only: S3's failure and `reactRenderer` field, S6's new rule, S4's state wait. Nothing else. |
| `perf/lib/instrumentation.ts` | §2.6 S3 only: record the renderer version in `inject` and expose a reader. |
| `perf/budgets.json` | §2.6 S6 only: the `note` of `harness.audio-running`. |
| `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md` | l.67 only: the `harness.audio-running` description (the autoplay caveat is now covered by `start()` ≥ 1). Add one sentence pointing to doc 168. |
| `docs/implementation/2026/quarter-IV/167-waveform-outline-path.md` | The post-PASS lines that root missed (L28; D-29z205). l.4 → `Completed (PERF-FADER-c C round 212 PASS; CP12 split C round 213 PASS; published fe556fd)`. l.23 `antialiased` → `anti-aliased` (gate-213 review S1, C-R212-04). l.102: the decision is D-29z200 (accepted; the release commit removed under D-29z198). l.108 and l.110: mark them done, with the evidence (C round 212 rows; gate 213 CP12a–d 4.6–5.9 s). l.109 (GATE211-S2) stays. Nothing else. |
| `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` (new) | `TEMPLATE.md` sections, in Georgian. Status line: `In Progress (C round 214 check pending)` (L28). It holds: the scenario sequence, the reset method, the row table with A's medians, the hygiene changes, and **§"PERF candidates"** (§5 below). Cite only rows that exist (L26). |

**Red-proof (named mutants)** — each one on a `/tmp` scratch copy of the store, never in the store tree. For each, name the mutated line and the failure text.
- **M1 (liveness):** in a scratch copy of the new spec, skip the mouse-down of the fade-in drag. `interact.harness.drag-fade-live` fails.
- **M2 (S6):** in a scratch `instrumentation.ts`, stop recording `start()` calls. `harness.audio-running` fails in the PERF-1a report.
- **M3 (S3):** in a scratch `instrumentation.ts`, record the renderer version as `'17.0.2'`. Both reports list the renderer failure.
- **M4 (budgets file):** a `PERF_BUDGETS_INTERACTIONS` file with `interact.harness.clips-30` set to `== 31`. The new test fails on that row only.
- M2–M4 may share one scratch run of the new spec if you show each failure text.

**Self-checks before handover** (not the full suite; that is a gate row):
- `npm run typecheck` (it covers `perf/**`; `tsconfig.json:19`).
- `npx biome check perf/`: 0 errors and 0 warnings on the touched perf files. Biome's `npm run lint` covers only `./app`, so this manual run is required.
- `npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` **twice**: exit 0 both times. Report `durationMs` and the medians, and whether every count row agrees between the two runs.
- PERF-1a once, because its spec changed: `npx playwright test --config playwright.perf.config.ts perf/studio-lab.perf.spec.ts`, exit 0. Compare it to `a-round-212/perf-run-1.json` with `a-round-212/perfcmp.py`. Every deterministic median must be equal.
- `sha256sum -c` of the frozen list at the start and at the end: rc 0.
- **Do not run `npm run build` or `verify` at the same time as a perf run.** The perf webServer rewrites `build/` (GATE206-S5).
- Code-reviewer: **required**, because more than 3 files change. Carry its Architecture note verbatim.

## 4. The new rows (`interact.*`)
`<s>` is `stopped` or `playing`. Rows measured at 6× carry the `.6x` suffix, as in PERF-1a.

| Group | Rows (record unless marked) | Liveness / setup (assert) |
|---|---|---|
| setup | `interact.load.ready-ms` | `interact.harness.hook-live` ≥ 1; `interact.harness.audio-running` == 1 (§2.6 S6 rule); `interact.harness.clips-30` == 30 |
| clip click | `interact.click.commits`, `interact.click.components` (sum over the click window), `interact.click.event-duration-max` (Event Timing, if the observer gives it; otherwise the longest LoAF in the window) | `interact.harness.click-live` == 1: start with no clip selected (A finds an honest way and documents it); after the click, the `Clip Gain — fader` slider count is 1 |
| drags × `<s>` | for each of `range`, `fade`, `trim`, `move`: `interact.drag.<d>.<s>.commits-per-move`, `.move-components-per-move`, `.move-components-max`, `.release-commits`, `.move-to-paint-p95`; when playing, also `.move-restarts` (the `start()` calls in the move window) and `.release-restarts` (the `start()` calls after release, until quiet) | `interact.harness.drag-<d>-live` == 1: range: `[data-range-end]` exists and changes during the drag; fade: `data-fade-in` grows; trim and move: `data-clip-start` changes. A drag whose live row is 0 also pushes a failure |
| play / pause | `interact.play.start-commits`, `.start-components`, `.start-sources` (`start()` count); `interact.play.stop-commits`, `.stop-components` | covered by `interact.harness.audio-running` |
| zoom, 1 clip | 5 × `=` then 5 × `-`, each key its own window: `interact.zoom.1.commits-per-key`, `.components-per-key`, `.components-max`, `.key-window-longest-ms` | `interact.harness.zoom-live` == 1: the `Zoom (px/s)` slider value changes on every key, in the right direction |
| zoom, 30 clips | the same rows with `.30.` | the same rule |
| 30 clips, playing | `interact.drag.fade.30.playing.release-restarts`, `.move-components-per-move` | `interact.harness.drag-fade-30-live` == 1 |

- **Count determinism.** Commit and component counts go in the new spec's determinism set.
  - A count that differs across passes in A's two runs leaves that set. Give it a `note` with the observed values, and list it in the doc.
  - This is not a STOP. Do not report a median of per-commit sizes; the probe found it bimodal. Report per-move sums.
- **Wall-clock rows** are trends (±30 %), never asserts.

## 5. The output B needs (doc 168 §"PERF candidates")
For each scenario, one line: the production median of components per move (or per key or click), the restarts per move and at release while playing, and A's verdict.
- **"Same treatment as the faders"** means the whole provider re-renders on every move, so it gets its own PERF task. Name the preview path (file:line).
- The other verdicts are **"commit restart"** (every clip restarts on release; candidate: reschedule only the changed clip) or **"ok"**.
- A proposes. B rules at round 216 planning. Do not open the tasks yourself.

## 6. C: rows
Setup: Playwright Chromium. Run the perf tests with nothing else running. Do not run the full vitest suite or `npm run verify`.

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-214** (start + end) | HEAD, `git status`, `sha256sum -c` of the 1,054-file list, and the grant diffs against `b-round-213/r214-granted-start/`. | HEAD is `fe556fd`. `git status` shows only the 5 grants (M) and the 3 new files (??). The PERF-1a spec diff touches only S3, S6 and S4. `instrumentation.ts` changes only the renderer-version record and its reader. `budgets.json` changes only the `harness.audio-running` note. Doc 163 changes only l.67 plus one pointer sentence. Doc 167 changes only l.4, l.23, l.102, l.108 and l.110. |
| **PERF-RUN-214** (real browser) | `npm run test:perf` once (both specs), then the new spec alone once. | Both exit 0. The new report is `complete`, with no failures, and its `durationMs` is ≤ 12 min. Every `interact.*` budget row is measured 3 times (each 1× id and each `.6x` sibling is its own row; the 1×-only rows of §2.3 have no `.6x` sibling). The count medians agree between C's two runs of the new spec, apart from rows A listed as non-deterministic. PERF-1a's deterministic medians equal `a-round-212/perf-run-1.json`. Both reports carry `reactRenderer` 18.x. PERF-1a's `latest.json` and `latest-interactions.json` are separate files. |
| **PROBE-214** (real browser) | C's own probe on a production server. After the perf run, start `PORT=5189 npx remix-serve build/server/index.js`. Use C's own commit counter (not the spec's code) for the range drag and the fade-in drag, stopped, 60 steps, +120 px, at 1440×900. | C's components per move agree with A's medians within ±10 %, or C explains the difference. Restarts per move while playing are 0 in both. |
| **REDPROOF-214** | C's own mutants on `/tmp` copies (e.g. a liveness target that never changes, and a `PERF_BUDGETS_INTERACTIONS` file with one impossible assert). Check A's M1–M4 logs. | Each mutant fails with the named row only. |
| **HYGIENE-214** | Read the S3, S6 and S4 edits. | S3 fails on a missing renderer or a major other than 18. S6 needs both a `running` context and `start()` ≥ 1. `selectClipGainMembers` has no fixed `waitForTimeout`. l.638 is unchanged (ruling §2.6). |
| **DOC-214** | Docs 168, 163 and 167. | Doc 168 has the template sections, the row table with A's numbers, the reset method and §"PERF candidates" with one line per scenario. Every cited row exists (grep). Its l.4 is conditional. Doc 167 has the new l.4 and `anti-aliased`, and `git grep -n antialiased docs/` shows no hit in doc 167. |
| **AN-REVIEW-214** | The diff. | No `any`, ` as ` (type assertion), `@ts-*` or lint suppressions; semicolons are present. `npx biome check perf/` is clean. `npm run typecheck` rc 0. |
| **G214-3** (browser) | Fresh contexts at 1440×900 and 1280×720: `/studio-lab` anonymous; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` with no header and with a fake Bearer. | `/studio-lab` opens anonymously with the demo badge. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. No header gives 401. A fake Bearer gives 403 with the `:5199` mock, or 500 without it. **No token is issued.** |
| **STUDIO-SMOKE-214** (browser) | On `/studio-lab` at both viewports: add the demo clip, drag its fade-in handle, then Undo. | The fade changes and one Undo entry appears. Undo restores it. 0 page errors. |
| **gate** | Full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke. | Not claimed by C. |

**`browserVerified`:** PERF-RUN-214, PROBE-214, G214-3 and STUDIO-SMOKE-214 all run in the cloud. If any of them does not run, the flag is false.

**Product / Ableton:** the CZABA requirement is SABA-B-5's instruction: measure the other continuous drags and list the ones that need the fader treatment. Ableton conformance does not apply (performance harness).

## 7. Adjacent behaviour that could break
- **The PERF-1a run:**
  - its 316 rows and their medians;
  - `harness.audio-running` (stricter now);
  - `selectClipGainMembers` timing (it now waits on state, not a fixed 2 s);
  - its `latest.json`.
- **`npm run typecheck`** covers `perf/**`, so a type error there breaks the gate.
- **`test:perf` total time** grows by the new spec, but each test has its own 15 min timeout.
- **`build/`**: a perf run rewrites it (GATE206-S5). Never run it in parallel with a build.
- **Nothing in the product.** No app file is granted.

## 8. Publication
- After C PASS, root runs the gate on this tree and publishes it.
- Commit message: "test(perf): PERF-1b-i interaction baselines (range/fade/trim/move drags, clip click, zoom 1/30 clips, play/pause); harness hygiene GATE206-S3/S6, GATE211-S4; doc 167 post-PASS status".
- Root amends doc 168 l.4 to `Completed (PERF-1b-i C round 214 PASS, published <sha>)` (L28).

## 9. After this round (not in scope)
- **Round 215 = RETRO** (15 rounds since retro 200).
  - Signals: B-R212-TIMEOUT-HEADROOM; L28 root amend missed a third time (ROOT-L28-AMEND-MISSED); doc-status lines.
- **Round 216 = PERF-1b-ii:** export long tasks and peak memory, JS bytes per route, DOM per clip, backing-store MB, and GATE206-S5 documented. At its planning, B rules on the PERF candidates from doc 168 and files `root-deps-request.json` for mediabunny (PERF-16 follows).
- **Regression:** due on or after 2026-10-30.
- **The architecture checkpoint** (D-29z195) is still pending with root. It is non-blocking.
