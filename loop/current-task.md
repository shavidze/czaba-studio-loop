# CURRENT TASK — Round 216: PERF-1b-ii. Resource baselines (WAV export long tasks and peak memory, backing store, DOM per clip, JS bytes per route; GATE206-S5 documented) + SYS-4 doc status backfill + RT-FIX of retro 215

Decisions:
- **D-29z213:** round 215 C FAIL on RT-NUM only; the retro was corrected; RT-FIX rides in this round.
- **D-29z214:** rulings on L28 and L32 (A/C feedback), plus rounds[] bookkeeping.
- **D-29z215:** doc 168 PERF candidates ruled; new PERF stages queued.
- **D-29z216:** `root-deps-request.json` deferred to PERF-16 planning.
- **D-29z217:** PERF-1b-ii design.

Planned by B on 2026-10-28. Dispatcher: B. Implementer: A. Verifier: C.

Consults (2026-10-28):
- `performance-optimizer`: production-build probe. Raw data and scripts are in `b-round-215/consult-perf/` (`export-probe.cjs`, `dom-diff.cjs`, `js-bytes-probe.cjs`, `summary-export.json`, `dom-diff.json`, `js-bytes.json`).
- `tech-lead`.
- Both are summarised in `b-round-215.md` §3.

**Read first:**
- `lessons.md`. L10, L11, L12, L26, L28 (amended in this planning), L29, L30, L31, L32 (amended) and L34 apply.
- `b-round-215.md` §3, with the probe numbers.
- Template spec: `perf/studio-lab-interactions.perf.spec.ts`:
  - l.14–60: constants and paths;
  - l.102–190: helpers;
  - l.629–675: load/ready and `buildThirtyClips`;
  - l.806–938: report and test.
- Also `perf/lib/instrumentation.ts`, `perf/lib/budgets.ts` and `perf/lib/stats.ts`. They are read-only and imported, not copied.
- App code, read only:
  - `app/contexts/ArrangementContext.tsx` l.3288–3371 (`exportWav`);
  - `app/lib/arrangement/graph.client.ts` l.453–522 (`renderArrangementWav`: OfflineAudioContext, `.slice()`, worker encode);
  - `app/components/arrangement/ArrangementExportDialog.tsx` (l.607 is the export call);
  - `app/components/arrangement/ArrangementRuler.tsx` l.442 (`data-testid="arrangement-ruler"`).
- Project: `docs/implementation/TEMPLATE.md`; primitives `TESTING_QUALITY_GATES.md`, `AGENT_DISCOVERABLE_CODE.md` and `GEORGIAN_DOCS.md`; `.claude/prompts/new-test.md`.

## Baseline
- **HEAD `eb9e76e`.** Gate 215 was skipped (C FAIL, nothing to publish), so the last publication is still gate 214's `eb9e76e1bc2b41f6ec1a3e083a391d05cb1a844f`. The tree is clean (`b-round-215/git-status-at-planning.txt`).
- **Frozen:** 1,058 files, which is every tracked file minus the 4 grants: `b-round-215-r216-tree-sha256.txt`. From `store/`, run `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-215-r216-tree-sha256.txt`. B checked it: rc 0.
- **Grants:** `b-round-215-r216-grants.txt` (4 docs, **l.4 only**).
  - Start hashes: `b-round-215-r216-granted-start-sha256.txt`.
  - Start copies: `b-round-215/r216-granted-start/`.
- **New files:** `b-round-215-r216-new-files.txt` (3). None of them exist yet.
- **No dependency change this round.** D-29z216: the mediabunny request is filed together with PERF-16's dispatch, which `oss-adoption.md` allows ("in the same planning step as the dispatch"). So HEAD must be exactly `eb9e76e`. A `chore(deps)` commit on top would be unexpected: report it, don't stop.
- **Protected as always:**
  - `app/**`: no app source, test or style change;
  - auth and purchase files: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`;
  - `.claude/**`, `CLAUDE.md`;
  - `package.json`, `package-lock.json`, `biome.json`, `tsconfig*.json`, `vitest.config.ts`, `vite.config.ts`, `playwright*.config.ts`;
  - both existing perf specs, `perf/lib/**`, `perf/budgets.json` and `perf/budgets.interactions.json`. These are byte-identical by the frozen list.

## 0. Why this round
- **Round 215 (RETRO) FAILED on one Low** (C-R215-01). `retro-215.md` l.53 said "11 review"; there are 10.
  - Every other row passed, `browserVerified` and `realVerified` were true, and no source changed.
  - Under the outcome fixed in advance (`tasks/round-215.md` §4), B corrected the retro in this planning (D-29z213). The next C round re-checks only the changed lines (row RT-FIX-216), and round 216 still runs as planned.
- **No open C bug at Medium+.** The three open Medium+ findings (`A-R73-SAFARI-FLAG-FOCUS`, `GATE128-S1-MIXED-LANGUAGE`, `R80-RECORDINGS-FIELD-BORDERS`) predate the window. They are Tech-Lead/backend items (`b-round-214/open-medium-plus.txt`).
- **Regression is not due.** `regression-last.json` is round 199 (2026-10-27); the next one is due on or after 2026-10-30. Round-217 planning will very likely fall on or after that date, so **round 217 is expected to be REGRESSION**.
- **Next stage:** PERF-1b-ii, the last baseline half of PERF-1b (D-29z206). SYS-4 rides along as four one-line doc grants (D-29z212).
- **Reference first / Ableton:** not applicable. This is a performance harness round (policy "Not in scope: pure performance").

## 1. What the probe already shows (production build, Chromium 143, 1440×900; `b-round-215/consult-perf/`)
| Metric | Value (3 runs) | Note |
|---|---|---|
| Demo clip after Add | 101.352 s; Ctrl+D copies go back to back | 2 clips = 03:22.704 (closest to the perf-plan 04:11) |
| WAV download | `czaba-studio-lab.wav`; PCM, 2 ch, 48 kHz, **24-bit**; 1 clip 29,189,420 B, 2 clips 58,378,796 B | size = 44 + frames × 6 |
| Click → download, 1× | 1 clip 384–424 ms; 2 clips 672–705 ms | wall-clock trend only |
| Long tasks > 50 ms during export | 1×: 0 (1 and 2 clips). 6× (single run): 1 clip [52, 117, 84] ms; 2 clips [193, 156] ms | at 1× the old 123 ms task is gone; 6× separates before from after. Gate on `longtask` entries or LoAF `blockingDuration`, never LoAF `duration` (always > 50 ms) |
| `Runtime.getHeapUsage().backingStorageSize` at ready, after GC | 140.35 MiB (±40 B) | reproduces perf-plan's "140 MB"; already present before Add |
| Export peak `backingStorageSize` minus ready (poll 50 ms) | 1 clip +65.0 MiB; 2 clips +129.9 MiB (±0.1) | linear, 0.641 MiB per project second |
| After export + GC | back to 140.4 MiB | no leak |
| Renderer RSS delta (`/proc/<pid>/status` VmRSS) | +108–112 / +201–210 MiB (±5) | noisy; not used |
| `performance.memory` | fixed 157,000,000 | useless; not used |
| Elements per clip subtree | **17**, identical | |
| Whole page with 0/1/2/3/4 clips | 666 / 906 / 1126 / 1348 / 1568 | about 220 per added clip: 17 clip + **~202 ruler** + 1 overview |
| `/studio-lab` scripts, fresh context | 43 scripts; CDP `encodedDataLength` sum 355,155 B (headers included); body 339,306 B; decoded 1,127,433 B; 0 third-party | identical runs |
| `/` | 200, renders; 41 scripts, 263,099 B (`encodedDataLength`) | logs 1 connection-refused to :5199 (expected in the cloud) |
| `/studio/middle-east` | 200, "Sign in required"; 42 scripts, 287,429 B | the guard screen, not the Studio |
| Full probe pass | 13.8–15.3 s | |

These are **B's probe numbers, indicative only.** The harness numbers this round are the baseline. Do not copy the table into doc 169 as A's measured results.

## 2. Rulings (D-29z217). Required.
1. **A third spec file, self-contained** (tech-lead).
   - Create `perf/studio-lab-resources.perf.spec.ts` with one test, `'studio-lab perf harness PERF-1b-ii'`.
   - Copy only the helpers it needs from the PERF-1b-i spec: `nowIn`, `snapshot`, `waitForQuiet`, `blurActive`, `reactRendererProblem`, `rateRowId`, `formatLimit`, `audioClips`, the load/ready wait, and the `buildInteractionReport` logic (budget-id set check, median of 3, determinism, `complete`, `failures`).
   - Do not copy the playback helpers; no row needs playback.
   - **Do not edit the two existing specs or `perf/lib/**`.** The third copy is a known debt: PERF-HARNESS-SHARED-LIB is now queued as its own stage after OSS-LIC (D-29z215).
2. **Separate budgets and results.**
   - Budgets: `perf/budgets.resources.json`, loaded with `loadPerfBudgets` (`perf/lib/budgets.ts:84`). Override env var: `PERF_BUDGETS_RESOURCES`.
   - Every row id starts with `res.`; the owner field is `"PERF-1b-ii"`.
   - Results: `test-results/perf/perf-1b-ii-<ISO>.json` and `test-results/perf/latest-resources.json`, with `harness: 'PERF-1b-ii'` and a `reactRenderer` field.
   - The new spec never writes `latest.json` or `latest-interactions.json`.
   - The two failure rules apply to its own file: "measured row without a budget row" and "row not measured N times".
3. **Passes and rates.** 3 passes at 1×, then 3 passes at 6×. Each pass is a fresh browser context at 1440×900 with `acceptDownloads: true`.
   - **1× pass:** steps a–f of §2.4.
   - **6× pass:** throttling via `Emulation.setCPUThrottlingRate` turns on after ready, as in PERF-1a. It runs only the two exports (steps c and e, with the setup they need). Its rows are `res.export.*` with the `.6x` suffix.
   - **Which rows carry `.6x` (one rule, L4):**
     - every `res.export.1.*` and `res.export.2.*` row, including `peak-backing-delta-mib` and `bytes`;
     - the liveness rows the 6× exports need: `res.harness.clips-1`, `clips-2`, `export-1-produced`, `export-2-produced`, `mem-polls-1` and `mem-polls-2`, so a 6× export cannot fail silently.
   - **1× only, with no `.6x` siblings:** `res.mem.*` (ready and leak rows), `res.dom.*`, `res.js.*` and `res.harness.js-*-seen`. Under throttling DOM and the ready memory do not change, and byte counts are network numbers.
   - **Time limit:** the report's `durationMs` must be ≤ 8 min (the probe predicts about 2–3 min plus route loads).
     - **Pre-ruled fallback:** if it is over, drop the 6× 2-clip export (the 6× pass keeps the 1-clip export) and record a DEVIATION in doc 169. This is not a STOP.
     - It is a **STOP (L11)** only if the test is still over 8 min after the fallback. Report the per-step timing.
4. **Pass sequence (1×).**
   - **a. Ready.**
     - Same ready signal as PERF-1b-i (library Add enabled and preview waveform bars drawn).
     - Run `HeapProfiler.collectGarbage` through a CDP session, then read `Runtime.getHeapUsage`.
     - Rows: `res.mem.backing-ready-mib` and `res.mem.used-ready-mib`.
     - Count elements: `res.dom.page-0` (`document.querySelectorAll('*').length`).
   - **b. Add the demo clip.**
     - Rows: `res.dom.page-1` and `res.dom.clip-subtree` (the first `[data-clip-kind="audio"]` element plus its descendants).
     - Also `res.dom.ruler-1` (`[data-testid="arrangement-ruler"]` plus its descendants; `ArrangementRuler.tsx:442` on the component's root `div`, which has no early return; it is mounted by `StudioWorkspace.tsx:2435` with no condition at that site, as B checked (L29). A re-greps it before relying on it.
     - Liveness `res.harness.clips-1` == 1.
   - **c. Export WAV, 1 clip.**
     - Open: `getByRole('button', { name: 'Export', exact: true })`.
     - The WAV format is the default: `getByTestId('arrangement-export-format-wav')` is checked; assert it, don't click it.
     - Register `page.waitForEvent('download')` **before** clicking `getByRole('dialog').getByRole('button', { name: 'Export WAV', exact: true })`.
     - Wait for the download and the text `/^WAV created:/`, then click `Done`.
     - **Measurement window:** from the click to the "WAV created" text.
     - Rows `res.export.1.<metric>`:
       - `wall-ms` (wallclock);
       - `longtasks-over-50` (count of `longtask` entries over 50 ms);
       - `longtask-max` (ms);
       - `loaf-blocking-max` (the largest LoAF `blockingDuration`; if the browser does not give it, push a failure; do not use LoAF `duration`);
       - `peak-backing-delta-mib` (`Runtime.getHeapUsage` polled every 50 ms in the window; max minus the step-a ready value);
       - `bytes` (the download size).
     - Liveness `res.harness.export-1-produced` == 1. Read the saved file (`download.path()`) and check all of these:
       - the name is `czaba-studio-lab.wav`;
       - the RIFF/WAVE header says PCM, 2 channels, 48,000 Hz, 24 bits;
       - the data chunk size equals the file size − 44;
       - frames = data size / 6, and frames equals `Math.round(clipSeconds × 48000)` or that value + 1 (the +1 is the known float `Math.ceil` artifact, B-R215-EXPORT-CEIL-FRAME, which this round does not fix);
       - `clipSeconds` comes from the "WAV created: mm:ss.mmm" text.
     - Liveness `res.harness.mem-polls-1` ≥ 5 heap samples in the window.
   - **d. After export.** Run GC again, then read `res.mem.backing-after-export-delta-mib` (after-GC value minus the ready value). The probe value is about 0, so this is the leak row.
   - **e. Duplicate and export again.**
     - Click the clip header and blur. Press Ctrl+D once (the dialog must be closed first; Ctrl+D is ignored while it is open).
     - Liveness `res.harness.clips-2` == 2.
     - Rows: `res.dom.page-2`, `res.dom.ruler-2`, and the derived `res.dom.page-per-added-clip` (= page-2 − page-1).
     - Then export again with the same steps, giving rows `res.export.2.*` and the liveness rows `res.harness.export-2-produced` and `res.harness.mem-polls-2`.
   - **f. JS bytes per route.** Use a **new fresh context** for each route, with no cache: `/studio-lab`, `/` and `/studio/middle-east`.
     - Open CDP `Network` before `goto`. Wait for `load` plus a quiet network of 1 s, capped at 8 s.
     - Rows `res.js.<route>.<metric>`, with route keys `studio-lab`, `home` and `studio-guard`:
       - `encoded-bytes`: the sum of `Network.loadingFinished.encodedDataLength` for responses whose `Network.responseReceived` `type` is `Script`;
       - `decoded-bytes`: the sum of `Network.dataReceived.dataLength` for the same requests;
       - `scripts`: the count;
       - `third-party-scripts`: script URLs whose origin is not the page origin.
     - Liveness `res.harness.js-<route>-seen` ≥ 1 (scripts counted) and HTTP status 200.
     - `/studio/middle-east` measures the **sign-in guard screen's bundle**, by design. The doc says so; it is not the Studio bundle.
     - The `:5199` connection-refused console error on `/` is expected in the cloud and is not a failure.
   - Every liveness row that is 0 also pushes a failure text. A download that does not arrive within 60 s records `export-N-produced` = 0 and moves on; it must not hang the test.
5. **Row design** (D-29z174 pattern):
   - Every metric is `record`. Only the liveness and setup rows are `assert`.
   - Deterministic set: the DOM counts, the bytes rows (`res.export.*.bytes`, `res.js.*`), `longtasks-over-50` at 1×, and the MiB rows rounded to 0.1.
   - A count that differs across passes in A's two runs leaves the set. It gets a `note` with the observed values and is listed in the doc. This is not a STOP.
   - `wall-ms`, `longtask-max`, `loaf-blocking-max` and every `.6x` row are trends (wallclock, ±30 %).
6. **GATE206-S5 (document only).** Doc 169 gets a section on the shared `build/` folder:
   - the `test:perf` webServer runs `npm run build && npx remix-serve build/server/index.js` with `reuseExistingServer: false` (`playwright.perf.config.ts` l.27–33);
   - so every perf run rewrites the shared `store/build/`;
   - so no perf run may overlap `npm run build`, `npm run verify`, a gate build or another `remix-serve` on `build/`.

   No config change (it is frozen). Closes GATE206-S5.
7. **SYS-4 (four l.4 lines, nothing else in those files).** Each line keeps its `**სტატუსი:** ` prefix and gets exactly this text:

   | Doc | New l.4 |
   |---|---|
   | `160-saba-b-4-store-focus-ring.md` | `**სტატუსი:** Completed (C round 203 PASS)` |
   | `161-hidden-focusables-runtime.md` | `**სტატუსი:** Completed (C round 204 PASS)` |
   | `162-lead-magnet-dialog-focus.md` | `**სტატუსი:** Completed (C round 205 PASS)` |
   | `168-perf-interactions-baseline.md` | `**სტატუსი:** Completed (C round 214 PASS)` |

   Closes GATE214-DOC168-STATUS, B-R214-DOC160-161-STATUS and GATE205-DOC162-STATUS (RT-IDS-215 confirmed the round numbers).
8. **Doc 169 status line (L28, amended D-29z214).** l.4 is exactly `**სტატუსი:** Completed (C round 216 PASS)`.
   - It is the post-PASS value; it is true only once the doc reaches HEAD.
   - If this round fails and is re-dispatched as round 217, A rewrites only N.

## 3. A: the files you own. Everything else is frozen.
| Path | What |
|---|---|
| `perf/studio-lab-resources.perf.spec.ts` (new) | §2.1–2.5. |
| `perf/budgets.resources.json` (new) | One row per measured id (each 1× id and each `.6x` sibling is its own row). Fields as in `budgets.interactions.json`: `id, scenario, metric, unit, kind, mode, budget, owner, note`. The `note` names the PERF stage that will own each metric's budget: PERF-12 for export long tasks and peak memory, PERF-13 for backing store, PERF-14 for DOM and ruler, PERF-11 for JS bytes. |
| `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md` (new) | `TEMPLATE.md` sections, in Georgian. l.4 per §2.8. It holds: the pass sequence; the WAV header check; the memory API choice and its caveats (`backingStorageSize` = the page's JS heap only, so the worker's copies and the rendered AudioBuffer are outside it; RSS and `performance.memory` were rejected, with the reason); the row table with A's medians; the §2.6 section; and **§"Findings for later PERF stages"**: the ruler grows with project length (PERF-14 cannot meet its 2000-element target by virtualizing clips alone); the 1× vs 6× export long tasks (PERF-12); 140 MiB at ready before Add (PERF-13); `/studio-lab` JS bytes vs the 230 KB target (PERF-11). Cite only rows that exist (L26). |
| `docs/implementation/2026/quarter-IV/160-…`, `161-…`, `162-…`, `168-…` | l.4 only, per §2.7. |

**Red-proof (named mutants).** Run each on a `/tmp` scratch copy of the store, never in the store tree. For each one, name the mutated line and the failure text.
- **M1 (export liveness):** skip the click on "Export WAV". `res.harness.export-1-produced` fails, the test still finishes within the time limit, and it does not hang.
- **M2 (header check):** expect 16 bits instead of 24. `export-1-produced` and `export-2-produced` fail.
- **M3 (memory liveness):** read a misspelled field (`backingStorageSizeX`). `res.harness.mem-polls-1` (or a dedicated failure) fails. No row records `NaN` as a value.
- **M4 (budgets file):** a `PERF_BUDGETS_RESOURCES` file with `res.harness.clips-2` set to `== 3`. The test fails on that row only.
- M2–M4 may share one scratch run if you show each failure text.

**Self-checks before handover** (not the full suite; that is a gate row):
- `npm run typecheck`. It covers `perf/**` (`tsconfig.json:19`). **Do not cite `npx biome check perf/`: Biome ignores `perf/` (L30, GATE206-S2).** Hold the new files to the project style by hand: semicolons, single quotes, no `any`, no ` as `, no `@ts-*`.
- `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts` **twice**, with nothing else running: exit 0 both times. Report `durationMs`, the medians, and whether every deterministic row agrees between the two runs.
- Do not run the two existing perf specs. They are frozen and unchanged, and C does not re-run them either.
- `sha256sum -c` of the frozen list, at the start and at the end: rc 0.
- **Never run `npm run build`, `verify` or a dev `remix-serve` on `build/` while a perf run is going** (GATE206-S5).
- Code-reviewer: **required**, because more than 3 files change. Carry its Architecture note verbatim.
- L32: if your perf run takes more than 50 % of the 15 min Playwright timeout, put it at the top of your report.

## 4. C: rows
Setup: Playwright Chromium. Run the perf tests with nothing else running. Do not run the full vitest suite, `npm run verify` or the two frozen perf specs.

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-216** (start + end) | HEAD; `git status --short --untracked-files=all`; `sha256sum -c` of the 1,058-file list; grant diffs against `b-round-215/r216-granted-start/`. | <ul><li>HEAD is `eb9e76e`.</li><li>Status shows only the 4 grants (M) and the 3 new files (??).</li><li>Each grant diff is exactly one changed line, l.4, with the §2.7 text byte for byte.</li></ul> |
| **RT-FIX-216** | Re-check only the retro/lessons lines B changed (`b-round-215/retro-215-rtfix.diff`; `diff b-round-215/lessons-before-216.md lessons.md`). <ul><li>Re-run `c-round-215/rt/gate-reviews.py`.</li><li>`ls gates/round-2{00..14}/review.md`.</li><li>Open the cited lines `a-round-212.md` l.38–41.</li><li>Check that the amended L28 and L32 cite `a-round-215.md` / `c-round-215.json` feedback that exists.</li><li>Check `lessons.md` is ≤ 60 lines.</li></ul> | <ul><li>retro l.53 says 10 reviews and names 200, 201, 202, 209 and 212 as having none.</li><li>l.70's class label no longer claims "ambiguous task text".</li><li>l.32 and l.75 cite l.38–41.</li><li>`lessons.md` changed in exactly three places: the l.3 header note, L28 and L32; each matches the rulings in `b-round-215.md` §2.</li><li>Nothing else in either file changed.</li></ul> |
| **PERF-RUN-216** (real browser) | Run the new spec alone twice: `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`. | <ul><li>Both exit 0, the report is `complete` with `failures []`, and `durationMs` ≤ 8 min.</li><li>Every `res.*` budget row is measured 3 times; each 1×-only row has no `.6x` sibling.</li><li>The deterministic medians agree between C's two runs and with A's, apart from rows A listed as non-deterministic.</li><li>`reactRenderer` is 18.x.</li><li>`latest-resources.json` is a separate file, and `latest.json` / `latest-interactions.json` keep their pre-run mtimes.</li></ul> |
| **PROBE-216** (real browser) | C's own probe on a production server, with its own CDP code, not the spec's. After the perf run, start `PORT=5189 npx remix-serve build/server/index.js`. At 1×, 1440×900, measure: <ul><li>`backingStorageSize` at ready after GC;</li><li>the 1-clip export peak delta (poll ≤ 50 ms);</li><li>the clip-subtree element count;</li><li>`/studio-lab` script `encodedDataLength` sum.</li></ul> | <ul><li>Backing store at ready within ±2 % of A's median.</li><li>Peak delta within ±10 %.</li><li>Clip subtree equal.</li><li>Script bytes within ±2 %.</li><li>Or C explains each difference.</li></ul> |
| **REDPROOF-216** | C's own mutants on `/tmp` copies (for example, a download never awaited, and a budgets file with one impossible assert). Check A's M1–M4 logs. | Each mutant fails with the named row only, and none hangs past the time limit. |
| **DOC-216** | Doc 169 and the four SYS-4 lines. | <ul><li>Doc 169 has the template sections, the row table with A's numbers, the memory-API caveats, the GATE206-S5 section and §"Findings for later PERF stages".</li><li>Every cited row id exists in `budgets.resources.json` (grep).</li><li>Doc 169 l.4 is exactly `**სტატუსი:** Completed (C round 216 PASS)`.</li><li>`git diff` of docs 160, 161, 162 and 168 is l.4 only, byte for byte as in §2.7.</li></ul> |
| **AN-REVIEW-216** | The diff. | <ul><li>No `any`, ` as ` (type assertion), `@ts-*` or lint suppressions; semicolons present.</li><li>`npm run typecheck` rc 0.</li><li>No styling-class selectors (L12).</li><li>Biome is **not** claimed for `perf/` (L30).</li></ul> |
| **G216-3** (browser) | Fresh contexts at 1440×900 and 1280×720: <ul><li>`/studio-lab` anonymous;</li><li>`/studio/middle-east`;</li><li>`/api/studio-token?product=middle-east&file=stem1.wav` with no header and with a fake Bearer.</li></ul> | <ul><li>`/studio-lab` opens anonymously with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required" with 0 `audio[src]`.</li><li>No header → 401.</li><li>Fake Bearer → 403 with the `:5199` mock, or 500 without it.</li><li>**No token is issued.**</li></ul> |
| **STUDIO-SMOKE-216** (browser) | On `/studio-lab` (dev server) at both viewports, with the real mouse: add the demo clip, open Export, click "Export WAV", and capture the download. B's probe confirmed the single `Export` button only at 1440. If it sits in a collapsed toolbar at 1280, open that toolbar first. If it is missing, that is a finding, not a blocked row. | <ul><li>A file `czaba-studio-lab.wav` arrives.</li><li>Its header is PCM, 2 ch, 48 kHz, 24-bit, and its length matches the clip within 1 frame.</li><li>The data is not all zeros (real audio).</li><li>The dialog shows "WAV created".</li><li>0 page errors.</li></ul> |
| **gate** | Full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke. | Not claimed by C. |

**`browserVerified`:** PERF-RUN-216, PROBE-216, G216-3 and STUDIO-SMOKE-216 all run in the cloud. If any of them does not run, the flag is false.

**Product / Ableton:** the CZABA requirement is perf-plan's PERF-1 ("prints and checks every baseline below"), now covering the export, memory, DOM and bundle baselines. Ableton conformance does not apply.

## 5. Adjacent behaviour that could break
- **`npm run typecheck`** covers `perf/**`, so a type error in the new spec breaks the gate.
- **`test:perf` total time** grows by the new spec (about 3 min); each test has its own 15 min timeout.
- **`build/`** is rewritten by every perf run (GATE206-S5).
- **`test-results/perf/`**: the new spec must not overwrite the other two `latest*.json` files.
- **Docs 160, 161, 162 and 168:** a wrong l.4 string re-opens the stale-status class (L28 experiment in `retro-215.md` §8).
- **Nothing in the product.** No app file is granted.

## 6. Outcome, fixed in advance
| C result | B at round-217 planning |
|---|---|
| PASS, and planning is on or after 2026-10-30 | Round 217 = **REGRESSION** (3-day rule). PERF-16 follows in 218, with `root-deps-request.json` (`{"add": ["mediabunny", "@mediabunny/mp3-encoder"], "remove": []}`; `@ffmpeg/*` is removed by the PERF-16 round itself, never before) filed at the planning step that dispatches it. |
| PASS, and planning is before 2026-10-30 | Round 217 = **PERF-16**, with the request filed in that planning step. Under the baseline rule, its baseline is the `chore(deps)` commit. |
| RT-FIX-216 fails | B corrects the retro line again. The next round re-checks it; the round's other rows stand. |
| A PERF or DOC row fails | Bounded fix-up of the failing rows first. |
| G216-3 or STUDIO-SMOKE-216 finds Medium+ | Bounded fix-up first (2026-10-23 bug gate). A Low goes to `deferred_low_polish`. |
| SCOPE-216 fails | Stop. Root inspects the change. |

## 7. Publication
- After C PASS, root runs the gate on this tree and publishes it.
- Commit message: "test(perf): PERF-1b-ii resource baselines (WAV export long tasks + peak memory, backing store, DOM per clip, JS bytes per route); GATE206-S5 documented; SYS-4 doc status backfill (docs 160/161/162/168)".
- **Root does not amend any doc l.4** (L28).
- Root request, non-blocking: `b-round-215-root-request-l28.md` (gate-side `Pending (C round N)` → `Completed (C round N PASS)` substitution).
- The frontend-architect checkpoint (D-29z195) is still pending with root. It is non-blocking.
