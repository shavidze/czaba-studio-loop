# Round 313: PERF-5a fix-up. The PERF-1a harness proves LoAF liveness with its own injected frame, so `load.script-max` may honestly read 0 (C-R312-01)

**Planned by:** B, at the round 312 → 313 planning, 2026-11-03.

**Decisions** (all in `backlog.json` v272 → `decisions_log_b`):
- **D-29z837: round 312 ruled.** C FAIL on one row only (PK-PERF-HARNESS → C-R312-01, Medium, origin B spec / B pre-check). Every app-code row passed with `browserVerified`/`realVerified` true. Gate 312 is `skipped` [K1], so HEAD stays `dfa4502` and A's round-312 tree stays in place, uncommitted [K2]. **The app work is not re-dispatched.**
- **D-29z838: harness-contract ruling for C-R312-01** (§4). The vacuity guard `harness.loaf-scripts` moves off the measured load window onto one injected frame: a new 1×-only liveness step that reads **the LoAF entry containing an injected 80 ms callback** (new pure selector `injectedLoafEntries`), and a budget row `harness.loaf-scripts-live` (assert `>= 50`). `load.script-max` stays measured on `[0, settled]` and may read 0.
- **D-29z839: Lows deferred.** A-R312-REVIEW-L1…L5 go to `deferred_low_polish` as one PERF-5 batch; A-R312-REVIEW-L6, C-MU-POOL-NOT-CLEARED and C-MU-LAST-CHUNK-DROPPED are recorded as info. The batch closes in PERF-5b, which owns `peaks.client.ts` and `peaks-worker.test.ts` again. This round grants no app file.
- **D-29z840:** bookkeeping, the L37 clause, requests (§10).

**Read first:** `lessons.md`. These apply directly:
- L11: STOP.
- L23 / L37: B ran the perf spec on the final sketch this time (§2).
- L26 / L28: docs.
- L29 / L56: claims.
- L30: `perf/**` has no Biome coverage, so use `npm run typecheck`.
- L34: whole doc sections.
- L38: perf runs alone; a second server gets its own `cacheDir`; warm up in a browser first.
- L52: asserts must be able to fail.
- L57: harness fields.

**L29 note:** untagged code text in this task is an expected value or a new name, not a fact about current code. Facts about `store/` carry `[K#]`.

## Baseline: HEAD `dfa4502` + A's round-312 tree (uncommitted)
- **Gate 312:** `skipped`, "C taskStatus FAIL" [K1]. HEAD is `dfa4502`, and `git status` shows 7 entries: round 312's 2 M + 5 ?? [K2].
- **App code frozen at C round 312's state:**
  - `b-round-312/a312-app-code-sha256.txt` hashes the 6 round-312 code paths: `ArrangementContext.tsx`, `peaks.ts`, `peaks.client.ts`, `peaks.worker-protocol.ts`, `peaks.worker.ts`, `__tests__/peaks-worker.test.ts`.
  - All 6 are OK now [K3] and must still be OK after A.
  - That is how round 312's PASS rows carry over (§3.2 CARRY-312).
- **Harness files at HEAD:**
  - `b-round-312/head-perf-sha256.txt` covers `perf/studio-lab.perf.spec.ts`, `perf/budgets.json`, `perf/lib/report.ts`, `perf/lib/report.test.ts`, `perf/lib/instrumentation.ts` and doc 163. All 6 are OK at planning [K4].
  - After A, `instrumentation.ts` must still pass.
- **Protected and config files:**
  - `b-round-312/protected-sha256.txt` lists 11 paths: the 7 auth/purchase files, `download-routes.test.ts`, `package.json`, `biome.json` and `vite.config.ts`.
  - All 11 are OK [K21] and must stay OK.

## 0. Why this round

### 0.1 What failed and why (C-R312-01, evidence `c-round-312/`)
- **The guard and its window.** In `measureSettled`, the spec calls `loafScriptsProblem` on the `[0, settled]` load window [K5], and sets `load.script-max` from the same window [K6].
- **Why the guard exists.** It was added in round 283 for A-R283-REVIEW-LOAF-SCRIPTS. Without it, a LoAF observer without `scripts` attribution would pass `load.script-max < 100` as "0 ms".
- **What PERF-5a changed.** PERF-5a took the peaks off the main thread. The settled load window now often holds no LoAF that carries a script, and that is the improvement. The guard read this good result as a dead instrument:
  - A's tree failed 2/2;
  - the guard string appears 4 times in C's run-1 log;
  - the HEAD copy passed with 0 failures [K17].
- **Root cause (B).** Round 312 §3.2 required "spec passes", but B's pre-check never ran the perf spec on the sketch (the L23/L37 class). B ran it this time (§2).

### 0.2 What changes for the user
Nothing. Only the perf harness and two docs change. No app file changes [K3].

### 0.3 Reference / screen budget
This is a perf-harness, test-only round, so the reference rule does not apply (policy "Reference first: not in scope"). Nothing persistent is added to the screen.

### 0.4 Consults (read-only)
- **tech-lead.** Verdict: **change (small)**, and it is adopted.
  - **The hole it found:** B's first final sketch kept every LoAF that *overlaps* the stamp (`t + duration >= start`). An app LoAF that only overlaps the stamp, with its own script ≥ 50 ms, would then satisfy the row even if the injected frame carried no `scripts`.
  - **Fix (adopted):** the callback stamps `start`/`end` itself. A new pure selector `injectedLoafEntries(loafs, start, end)` in `report.ts` keeps only frames that **contain** the callback (with a 1 ms edge tolerance). The spec also requires exactly 1 containing entry.
  - **Unit rows:** LOAF2 covers the selection, the part that failed in run 1.
  - **Kept as it is:** `loafScriptsProblem`, so LOAF1 is unchanged.
  - **Later rows:** the effect is negligible. Every later window starts fresh, and the windows that start at 0 are read before the injection. One caveat: the 1× pass's history differs from the 6× pass's from library Add onward. That caveat is written into the row's `note`.
- **Not consulted:** performance-optimizer. This is not a new perf task; PERF-5b's consults come at its planning.

## 1. Rulings on round 312 (D-29z837, D-29z839)
| Id | Severity | Ruling |
|---|---|---|
| C-R312-01 | Medium | **This round** (§4) |
| Doc 228 l.4 "C round 312 PASS" (C's note) | — | Rewritten as `C round 313 PASS` (L28 re-dispatch grant, §5) [K9] |
| A-R312-REVIEW-L1 (the 3 s stall also covers the worker's cold start) | Low | `deferred_low_polish`. A round-312 §4 rule; re-ruled with a measurement in PERF-5b |
| A-R312-REVIEW-L2 (`onPeaks` throw: try/finally) | Low | `deferred_low_polish`, PERF-5 batch. Not reachable today |
| A-R312-REVIEW-L3 (buffer visible before its peaks) | Low | `deferred_low_polish`, PERF-5 batch. Documented in doc 228 |
| A-R312-REVIEW-L4, with C's evidence C-MU-VIDEO-GUARD-REMOVED and C-MU-STALL-ONLY-AT-BEGIN | Low | `deferred_low_polish`, PERF-5 batch. The missing PW rows go into PERF-5b's test grant |
| A-R312-REVIEW-L5 (PW13 `end`/`cancel` throws, timer count) | Low | Same batch |
| A-R312-REVIEW-L6, C-MU-POOL-NOT-CLEARED, C-MU-LAST-CHUNK-DROPPED | info | Recorded (equivalent or safe) |
| Reviewer Architecture note (keep; a `useSourcePeaksComputer` hook if a second consumer appears) | signal | Recorded, not scheduled |

## 2. B's pre-check (L23, L37)
**Scratch.** `/tmp/b312s` is a tar copy of A's real round-312 tree:
- `node_modules` is symlinked;
- the copy's `vite.config.ts` gets `cacheDir: '/tmp/b312s-vite-cache'`;
- every perf run ran alone (L38).

**Final sketch:** `b-round-312/sketch.patch.txt`, with full copies in `sketch-studio-lab.perf.spec.ts.txt`, `sketch-budgets.json.txt`, `sketch-report.ts.txt` and `sketch-report.test.ts.txt`. From `store/`, `git apply --check` succeeds on A's tree.

**Static and unit checks:**
- `tsc --noEmit` rc 0 (`precheck-tsc.log`).
- `report.test.ts` passes **29/29** through the scratch `vitest.perf-scratch.config.ts`: 23 old rows plus 6 LOAF2 cases (`precheck-loaf1.log`) [K11]. The same file's budgets test reads `perf/budgets.json`, so it covers the new row's shape.
- **Unit mutants** (`b-round-312/unit-mutants.sh`; output `precheck-unit-mutants.txt`, and a scripted re-run in `precheck-unit-mutants-script.txt` with the same result) [K24]. Restored: 29 passed.

  | Mutant | Red |
  |---|---|
  | MU-OVERLAP-ONLY (start condition removed) | 1 |
  | MU-START-INSIDE (`t >= start`) | 3 |
  | MU-NO-TOLERANCE (tolerance 0) | 1 |

**Browser runs, in order:**
- **Run 1, start-inside window.** The injected frame was found in only 1 of 3 passes: samples `[79, 0, 0]`, LoAF entries `[1, 0, 0]` [K13].
  - **Finding:** a LoAF's `startTime` is the start of its frame, and it can precede the injection.
- **Run 2, overlap rule.** The spec passes. Samples are `[79, 79, 80]`, and the frame started before the stamp in 3 of 3 passes [K13b]. This confirms the finding. tech-lead then showed the overlap rule's hole (§0.4).
- **Run 3, final containment rule.** The spec **passes** with 0 failures. Live samples are `[79, 79, 80]`. In each pass exactly 1 entry contains the callback, with `scriptCount` 1, and its frame started before the callback (`frameStartedBeforeCallback` 1) [K12]. `load.script-max` read `[37, 0, 0]`, so a 0 is a real result here.
- **Mutant MU-LIVE-BUSY0.** `injectedLoafBusyMs = 0` on `/tmp/b312m`, which has its own `cacheDir`, run on the final sketch. The spec fails with 7 failures: the `harness.loaf-scripts` problem in every 1× pass, the "0 entries contain the injected callback" problem in every 1× pass, and `assert failed harness.loaf-scripts-live` [K14].

**Claims.** Run on A's tree and on the sketch: `claims-313-head-output.txt` and `claims-313-sketch-output.txt`. The sketch's deltas are all expected:
- **K4 `2`:** the spec, `budgets.json`, `report.ts` and `report.test.ts` changed.
- **K5:** empty.
- **K6:** unchanged at `545`; the removed block and the added import cancel out.
- **K7:** lists `budgets.json` and the spec.
- **K8 `321`.**
- **K20:** adds `budgets.json`.
- **K21 `10`:** only because the scratch has its own `cacheDir` line.
- **K23:** lists `budgets.json` (its note names the selector), `report.ts`, `report.test.ts` and the spec.
- **K25:** `21 2`.

**Not run: the full vitest suite.** No `app/**` file changes, and `perf/**` tests are outside the vitest include [K26]. LOAF1/LOAF2 run through the scratch config.

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, from the loop root, `bash b-round-312/claims-313.sh` equals `b-round-312/claims-313-head-output.txt`. A difference is a STOP |
| A-APPLY | From `store/`: `git apply ../tmp/studio-real-loop/b-round-312/sketch.patch.txt`. The 4 files are then byte-equal (`cmp`) to the matching `sketch-*.txt` copies. Any other change to them is a STOP |
| A-TYPE | `npm run typecheck` rc 0. Under L30, this is the `perf/**` check |
| A-LOAF | On a scratch copy, never in `store/`: write `vitest.perf-scratch.config.ts` with `test.include: ['perf/**/*.test.ts']`, then run `npx vitest run --config vitest.perf-scratch.config.ts perf/lib/report.test.ts`. 29 tests pass. Re-run B's 3 unit mutants with `bash ../tmp/studio-real-loop/b-round-312/unit-mutants.sh` from inside the scratch copy (it edits that copy's `perf/lib/report.ts`, then restores it). The output must equal `b-round-312/precheck-unit-mutants.txt` |
| A-PERF | Run `npx playwright test --config playwright.perf.config.ts perf/studio-lab.perf.spec.ts` once, **alone** (L38). The spec passes. `harness.loaf-scripts-live` has 3 samples, each ≥ 50, with `loafEntries` 1 and `scriptCount` ≥ 1. Copy `test-results/perf/latest.json` to `a-round-313/perf-a.json` and the console output to `a-round-313/perf-a.log` |
| A-REVIEW | Run `code-reviewer` on the 6 changed files (4 perf files + docs 163 and 228). Ask about: vacuity of the liveness row; the containment rule and its tolerance; interference with later steps of the same pass; the accuracy of the docs. A Medium+ inside the grants is fixed and re-reviewed (L11). A §4 rule change is a STOP |
| A-DOC | **Doc 163:** see §5. **Doc 228:** l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 313 PASS)` (L28). Add one Problem → Solution entry for C-R312-01 under `## პრობლემები და გადაწყვეტები`, and one line under `## ტესტირება` that names `harness.loaf-scripts-live` and LOAF2. Write in Georgian with technical terms in English, and cite only rows that exist (L26) |

### 3.2 C's rows
C writes `c-round-313.md` and `c-round-313.json` as it goes, with the L57 fields:
- `assertsSpecified` = 3: the `harness.loaf-scripts-live` budget assert, the spec's "exactly 1 containing entry" check, and LOAF2;
- `mutantsRecorded` = 4: MU-LIVE-BUSY0, MU-OVERLAP-ONLY, MU-START-INSIDE and MU-NO-TOLERANCE;
- `mutantRedOnSketch` = 4.

Each finding carries an `origin`.

| Row | Action | Expected |
|---|---|---|
| SOURCE-SCOPE | `git status --short --untracked-files=all`. Then, from `store/`, `sha256sum -c` of `b-round-312/a312-app-code-sha256.txt`, `head-perf-sha256.txt` and `protected-sha256.txt` | 12 entries: round 312's 7, plus M on `perf/studio-lab.perf.spec.ts`, `perf/budgets.json`, `perf/lib/report.ts`, `perf/lib/report.test.ts` and doc 163. Doc 228 stays `??`. App code: 6/6 OK. Head-perf: only `instrumentation.ts` stays OK. Protected: 11/11 OK |
| CLAIMS | Re-run `claims-313.sh` | Equals `claims-313-sketch-output.txt` on K5, K6, K7, K8, K20, K23 and K25. K4 becomes `1`: doc 163 is now changed too. K9 becomes the round-313 l.4. **K10 is expected to change** (A edits doc 163's granted sections): its first number becomes ≥ 2 and the heading lines may shift. The DOC row checks those sections by heading, not by line number. K21 stays `11`. K2 becomes `12 dfa4502`. K19 stays `1` and K22 stays `228-perf-peaks-worker.md`. Any other difference is a planning FAIL |
| CARRY-312 | Read `c-round-312.json` | Valid only if SOURCE-SCOPE shows app code 6/6 OK. Then round 312's 13 passed rows stand for the app code without a re-run. If any app path changed, CARRY-312 fails, and every PK-* row in `tasks/round-312.md` §3.2 must be re-run |
| HARNESS-PASS | Perf spec on A's tree, **alone**, after a browser warm-up (L38). **2 runs** | Both runs pass with `failures` empty. `harness.loaf-scripts-live`: all 3 samples ≥ 50, each detail with `loafEntries` 1 and `scriptCount` ≥ 1. `load.script-max` is recorded with a `loafEntries` detail; 0 is allowed. Report `load.ready-ms`, `load.settled-ms`, `load.script-max` and `load.settled.longtask-max` next to C round 312's `perf-a-run1/2.json`. This is a trend, not a gate |
| HARNESS-HEAD-CONTROL | One run on a copy with HEAD's app code and the new harness: tar copy; `git show HEAD:` for the 2 M app paths; delete the 5 new app files; keep A's 4 changed `perf/` files; symlink `node_modules`; give the copy its own `cacheDir` | The spec passes. Record `load.script-max`; C round 312 measured a median of 32 at HEAD. This shows the new harness does not hide a real main-thread script on a tree that has one |
| MU-LIVE-BUSY0 | On a scratch copy of A's tree, set `injectedLoafBusyMs = 0` and run once | The spec fails, with `harness.loaf-scripts: no long-animation-frame entry carried script timings` in every 1× pass and `assert failed harness.loaf-scripts-live` |
| LOAF | As A-LOAF, on C's own scratch (`b-round-312/unit-mutants.sh`), plus at least one mutant of C's own on `injectedLoafEntries` | 29 tests pass. The script output equals `precheck-unit-mutants.txt`. Record C's own mutant result |
| PK-SANITY | `b-round-311/probe/peaks-identity.cjs` on A's tree, 1 fresh load at 1440×900 | `mainPeaksMs` is empty, `peaks.worker.ts` appears once, 9/9 shas equal `b-round-311/probe/identity-head.json`, 0 page errors. This is a cheap live check that `:5173` still serves the tree C verified in round 312 |
| DOC | Check doc 163's two granted sections against the live spec, `budgets.json` and `report.ts` (L34). Check doc 228's l.4 byte for byte, and that the 7 TEMPLATE headings appear in order (L26) | Doc 163 names the liveness step at its real position, has a `harness.loaf-scripts-live` metrics row (callback-containing frame, 1 ms tolerance, budget `>= 50`), and its `load.script-max` row no longer claims the settled-window guard |
| G313-AUTH | As G312-AUTH (copy `c-round-311/g311-auth.cjs`), **both viewports** | `/studio-lab`: workspace and demo badge, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401. No token in any body |

**Gate rows.** C does not claim these; they go under `"gate"`: full vitest, build, Biome, `npm run verify` and the e2e smoke.

**Browser flags.**
- `browserVerified` is true only if HARNESS-PASS, PK-SANITY and G313-AUTH all ran.
- HARNESS-HEAD-CONTROL and MU-LIVE-BUSY0 are wanted. If the environment stops them (a build failure for environment reasons), list them under `"notRunnableHere"` with the log.

## 4. Contract (D-29z838)

### 4.1 `perf/lib/report.ts` (append only; every existing export byte-unchanged)
- New `LOAF_EDGE_TOLERANCE_MS = 1`.
- New `injectedLoafEntries(loafs, callbackStart, callbackEnd)`. It keeps the entries with `t <= callbackStart + 1` and `t + duration >= callbackEnd - 1`, that is, the frames that **contain** the callback.
- `loafScriptsProblem` and `LOAF_SCRIPTS_PROBLEM` stay unchanged.

### 4.2 `perf/studio-lab.perf.spec.ts` (exactly the sketch hunks)
- **Constants:** `injectedLoafBusyMs = 80` (above the 50 ms LoAF floor) and `loafLivenessWaitMs = 500`.
- **Import:** `injectedLoafEntries`.
- **`passSequence`:** a second entry for the liveness step.
- **`measureSettled`:**
  - drops the `loafScriptsProblem(settled.loafs)` block [K5];
  - `load.script-max` gains `detail: { loafEntries }`.
- **New `measureLoafLiveness`:**
  1. A `setTimeout(0)` callback in the page stamps `start`, busy-loops for 80 ms, stamps `end`, and resolves on the next `setTimeout(0)` with `{ start, end, spins }`.
  2. Wait 500 ms.
  3. Read `snapshot(page, 0, now).loafs` and select the frames with `injectedLoafEntries`.
  4. Push `loafScriptsProblem(selected)` when it is non-null.
  5. Push a problem when `selected.length !== 1`.
  6. Record `harness.loaf-scripts-live` = the rounded largest `scriptMax`. Detail: `injectedBusyMs`, `callbackMs`, `spins`, `loafEntries`, `scriptCount`, `frameStartedBeforeCallback`.
- **`runPass`:** in the 1× branch, `measureSettled` is followed by `step = 'harness.loaf-scripts-live'` and `measureLoafLiveness`, before `library Add`. The 6× passes are unchanged.

### 4.3 `perf/budgets.json`
- **New row** right after `load.script-max`:
  - `id`: `harness.loaf-scripts-live`;
  - `metric`: `script-max`; `unit`: `ms`; `kind`: `wallclock`;
  - `mode`: `assert`, with `budget` `>= 50`;
  - `owner`: `C-R312-01`;
  - `scenario` and `note` as in the sketch. The note includes the tech-lead caveat about the 1×/6× history.
- **Every other row** is byte-unchanged. The file goes from 320 to 321 `"id"` lines [K8].

### 4.4 `perf/lib/report.test.ts`
- Import `injectedLoafEntries`.
- Add one `it.each` named `LOAF2` with 6 cases, as in the sketch:
  1. containing frame;
  2. overlapping app frame that ends inside the callback;
  3. frame that starts after the callback;
  4. edges within 1 ms;
  5. an app frame beside the containing one;
  6. empty.
- No existing row changes (L4: no assertion is lost).

### 4.5 Unchanged, and the SWEEP
- **Unchanged:** `perf/lib/instrumentation.ts`, `perf/lib/page.ts` and the other two perf specs.
- **SWEEP** of `app perf e2e` for `loafScriptsProblem|LOAF_SCRIPTS_PROBLEM|harness.loaf-scripts`:
  - at HEAD: `report.ts`, `report.test.ts` and the spec;
  - on the sketch: also `budgets.json` [K20].
- No other spec uses the guard.
- **Rejected options:**
  - dropping the guard (it reintroduces A-R283);
  - a warning only (a dead observer would pass);
  - injecting inside `[0, settled]` (it pollutes `load.script-max`);
  - the overlap rule (tech-lead's hole);
  - changing `loafScriptsProblem` (LOAF1 would change for no gain).

## 5. Grants
A edits only:
1. `perf/studio-lab.perf.spec.ts`: §4.2.
2. `perf/budgets.json`: §4.3.
3. `perf/lib/report.ts`: §4.1, append only.
4. `perf/lib/report.test.ts`: §4.4, append only.
5. `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md`, these whole sections only (L34) [K10]:
   - `### Pass-ის თანმიმდევრობა (ინტერპრეტაცია)`: from its heading to the next heading, `## არქიტექტურა`;
   - `## მეტრიკების განმარტება და ზღვრები`: from its heading up to `## შეცვლილი ფაილები`.

   Update the `load.script-max` row and add the `harness.loaf-scripts-live` row and the pass step.
6. `docs/implementation/2026/quarter-IV/228-perf-peaks-worker.md` (A's own new file): l.4, `## პრობლემები და გადაწყვეტები` and `## ტესტირება`.

**Nothing else:**
- no `app/**` file (the 6 code paths stay byte-equal [K3]);
- not `perf/lib/instrumentation.ts`, `perf/lib/page.ts` or the other two perf specs;
- no other existing test file;
- not `package.json`, `biome.json`, `vite.config.ts`, `playwright.perf.config.ts` or any protected file;
- no dependency change.

## 6. Specified test rows (L52)
| Assert | Red-proof |
|---|---|
| `harness.loaf-scripts-live` budget row | MU-LIVE-BUSY0 (browser, [K14]) |
| "exactly 1 containing entry" problem | MU-LIVE-BUSY0, which yields 0 entries |
| LOAF2 | MU-OVERLAP-ONLY, MU-START-INSIDE and MU-NO-TOLERANCE (unit, [K24]) |

Each mutant was run on the final sketch. The start-inside rule also has a recorded browser negative control: run 1 [K13].

## 7. A's order of work
1. A-CLAIMS.
2. A-APPLY.
3. A-TYPE.
4. A-LOAF, on a scratch copy.
5. A-PERF, alone.
6. Docs.
7. A-REVIEW (re-review any fix).
8. `a-round-313.md`: the changed files, the rows, and "Next C checks".

## 8. Neighbouring behaviour at risk (C probes)
- **Later rows of the 1× pass.** The 80 ms injection happens after settled and before library Add. `harness.hook-live` and the fader rows read windows that start later. HARNESS-PASS compares them with round 312 as a trend.
- **`load.*` rows** keep their windows. Only a detail is added.
- **The 6× passes** do not run the step.

## 9. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-313.md` and changes nothing else when:
- A-CLAIMS differs from the HEAD output;
- `git apply` fails, or a change is needed outside §5;
- A-PERF fails in two valid runs (an overlapped run is environment-invalid, L38);
- a §4 rule would have to change: busy time, wait, containment rule, tolerance, budget;
- typecheck fails;
- the reviewer reports a Medium+ outside the grants.

## 10. Next, and requests (D-29z840)
- **After C PASS and the gate:** root publishes round 312's 7 paths and round 313's 5 changed files together. PERF-5a is then done; PERF-5 stays in progress until 5b.
- **Next round:**
  - **REGRESSION**, if the round-314 planning falls on or after **2026-11-05** [K16];
  - otherwise **PERF-5b**, with its own premise measurement and the deferred PERF-5 Low batch (D-29z839).
- **RETRO:** at round 320.
- **For Saba (unchanged):** SABA-Q-WORKER-DEPLOYED and SABA-Q-PERF4-STUDIO-CACHE.
- **For root:**
  - **ROOT-REQ-VITEST-PERF-INCLUDE** stays open, and this round shows its cost again. `report.test.ts` runs only through a scratch config, and `npm run test:perf` is not a gate row, so a broken harness self-check is invisible to the gate.
  - **ROOT-REQ-VERIFY-WORKER-TESTS** stays open.
  - No new checkpoint request.
- **L37 gains one clause** (D-29z840): a PERF task whose change can remove the work a perf row or guard measures runs the perf spec on the sketch in B's pre-check. A vacuity guard proves liveness with its own synthetic signal, selected by containment, not with app work.

## 11. Commit readiness
After C PASS and the gate, root publishes:
- from round 312: 2 M + 5 new paths;
- from round 313: M on the spec, `budgets.json`, `report.ts`, `report.test.ts` and doc 163.

There is no deploy step.

## 12. Claims (L29 + L56)
Run `bash b-round-312/claims-313.sh` from the loop root. Outputs:
- `b-round-312/claims-313-head-output.txt`: A's round-312 tree at planning;
- `b-round-312/claims-313-sketch-output.txt`: `CLAIMS_STORE=/tmp/b312s`, the final sketch.

| Tag | Claim | Expected at planning |
|---|---|---|
| K1 | gate 312 status | `skipped C taskStatus FAIL` |
| K2 | `git status` entries, HEAD | `7 dfa4502` |
| K3 | the 6 round-312 app code paths still match C 312's state | `6` |
| K4 | harness files + doc 163 at HEAD bytes | `6` (sketch `2`) |
| K5 | line of `const loafProblem = loafScriptsProblem(settled.loafs);` in the spec | `539` (sketch: none) |
| K6 | line of `result.samples.set('load.script-max'` in the spec | `545` (sketch `545`: the removed block and the added import cancel out; compare by content, L56) |
| K7 | files in `app perf e2e` naming `harness.loaf-scripts-live` | none (sketch: `perf/budgets.json perf/studio-lab.perf.spec.ts`) |
| K8 | `"id":` lines in `perf/budgets.json` | `320` (sketch `321`) |
| K9 | doc 228 l.4 | `**სტატუსი:** In Progress (stage 1 of 2; C round 312 PASS)` |
| K10 | doc 163: `harness.loaf-scripts` hits; then the lines of `## მეტრიკების…`, `## შეცვლილი ფაილები`, `### Pass-ის თანმიმდევრობა` and `## არქიტექტურა` | `1 58 87 20 39` (the sketch does not edit docs; after A, the first number is ≥ 2 and the lines may shift) |
| K11 | B's `report.test.ts` scratch run | `29` |
| K12 | B's run 3 (final): failures; live samples; loafEntries; scriptCount; frameStartedBeforeCallback | `0 [79, 79, 80] [1, 1, 1] [1, 1, 1] [1, 1, 1]` |
| K13 | B's run 1 (start-inside): live samples; loafEntries | `[79, 0, 0] [1, 0, 0]` |
| K13b | B's run 2 (overlap): failures; samples; started before the stamp | `0 [79, 79, 80] [1, 1, 1]` |
| K14 | MU-LIVE-BUSY0 on the final sketch: guard-problem failures; assert failure; total | `3 1 7` (the other 3 are the "0 entries contain the injected callback" problems) |
| K15 | round-312 archive equals the copy | `archive-equal-312` |
| K16 | last regression date | `2026-11-02` |
| K17 | C 312: guard string count in `perf-run.log`; HEAD-copy failures | `4 0` |
| K18 | every cited `b-round-312/` artifact exists (L56) | `done` |
| K19 | `In Progress (stage` hits in `docs/implementation` | `1` (doc 228; PERF-5b open) |
| K20 | SWEEP: files in `app perf e2e` naming `loafScriptsProblem\|LOAF_SCRIPTS_PROBLEM\|harness.loaf-scripts` | `perf/lib/report.test.ts perf/lib/report.ts perf/studio-lab.perf.spec.ts` (sketch adds `perf/budgets.json`) |
| K21 | the 11 protected/config files at planning bytes | `11` (sketch `10`: the scratch's own `cacheDir`) |
| K22 | last doc in quarter IV | `228-perf-peaks-worker.md` |
| K23 | files naming `injectedLoafEntries\|LOAF_EDGE_TOLERANCE_MS` | none (sketch: `perf/budgets.json perf/lib/report.test.ts perf/lib/report.ts perf/studio-lab.perf.spec.ts`; the row's note names the selector) |
| K24 | unit mutants: 0-red count; mutant lines; restored | `0 3 restored: 29 passed` |
| K25 | `report.test.ts`: `it.each`/`it(` lines; LOAF1/LOAF2 labels | `20 1` (sketch `21 2`) |
| K26 | `vitest.config.ts` includes `app/**/*.test.{ts,tsx}` only | `1` |
