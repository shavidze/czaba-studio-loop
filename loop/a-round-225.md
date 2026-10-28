# A round 225: PERF-HARNESS-SHARED-LIB-b-i fix-up (C-R224-01, A-R224-REVIEW-TENTHS-NAN, C-R224-02)

**No STOP.** Baseline: HEAD `bbaea50`, clean tree. At the start, the frozen (1,072 files), grants and root-files `sha256sum -c` were all rc 0 (run from `store/`).
§0.3 **case 3** applies. There is no `root-grant-r225-vitest.json` and HEAD has no `perf/**` include. `vitest.config.ts` is untouched; the test runs with the scratch config `a-round-225/a225-vitest.config.ts` (`root` = store, `include` = `['perf/**/*.test.ts']`, `environment` = `node`). Low PERF-REPORT-TEST-INCLUDE stays open.
No covering test failed. No covering test is slow (19 cases, about 300 ms).

## Changed files (grants 1–5 only; end `git status`: exactly these 5 as `M`, no `??`)
| Grant | File | Change |
|---|---|---|
| 1 | `perf/lib/report.ts` | +3 lines, 0 removed: the §2.2 guard, byte-exact, placed directly after `if (values.length === 0) return null;` in `case 'tenths'`. |
| 2 | `perf/lib/report.test.ts` | +56, 0 removed. Two new import lines: `node:url` `fileURLToPath`, and a value import of `loadPerfBudgets` from `./budgets` on its own line. The existing `import type` line is byte-identical. Three cases are appended at the end of the describe: DC-MIB-EDGE, DC-MIB-NONFINITE, DC-KINDS. The 16 existing cases are unchanged. The l.1 pragma is kept, and the test does not import `page.ts` or `instrumentation.ts`. |
| 3 | `perf/budgets.interactions.json` | 16 lines changed from `"kind": "deterministic"` to `"kind": "wallclock"`, on exactly the rows that fully match the RECLASS regex. The edit was a parse-and-dump (`indent=2, ensure_ascii=False` + `\n`), so `numstat` is 16/16. `budgets.json` and `budgets.resources.json` are unchanged. |
| 4 | doc 176 | l.4 is `**სტატუსი:** In Progress (stage 1 of 2; C round 225 PASS)`. The other edits are in §კონტექსტი, the contract table, the failure-text table (`non-finite sample`), §გადაკლასიფიცირებული სტრიქონები (the 16 rows with evidence; the 24 fader rows stay exact), §არქიტექტურა (the finite node, and the test's dependency on budgets), §შეცვლილი ფაილები, 3 Problem → Solution entries, §ტესტირება (a round 225 subsection: 19 DC ids and MU-7…10) and §TODO (R224-WINDOW-BOUNDARY-WATCH). |
| 5 | doc 168 | §მეტრიკები: a "(round 225-მდე)" note in the Determinism paragraph, plus one new paragraph on the 16 wallclock rows and why. §TODO: round 225 and the watch item. l.4 is unchanged. |

`vitest.config.ts`, `package.json`, `package-lock.json` and `vite.config.ts` all equal HEAD. The frozen `sha256sum -c` gives rc 0 at the end. The sha256 values of the changed files at the end are in `a-round-225/changed-end-sha256.txt`.

## Checks actually run
| Check | Result | Evidence |
|---|---|---|
| Unit `report.test.ts` (scratch config) | 19/19 green | `a-round-225/unit.log` |
| MU-7 (guard removed) | rc 1; only DC-MIB-NONFINITE red | `a-round-225/mutants/MU-7.log` |
| MU-8 (`spread > 2`) | rc 1; only DC-MIB-EDGE red | `mutants/MU-8.log` |
| MU-9 (`interact.drag.fade.playing.commits-per-move` set back to deterministic, in a scratch `perf/` copy) | rc 1; only DC-KINDS red | `mutants/MU-9.log` |
| MU-10 (`fader.track.stopped.commits-per-move` set to wallclock in a scratch `budgets.json`) | rc 1; only DC-KINDS red | `mutants/MU-10.log` |
| Replay (a): the 3 `c-round-224/reports/*` through the final core and budgets | 0 failures each; complete = true | `a-round-225/replay/tree-a.json` |
| Replay (b): `run1-contaminated/latest-interactions.json` | 0 failures | `replay/tree-b.json` |
| Replay (c): NaN in `res.mem.backing-ready-mib` | exactly 1 failure: `nondeterministic MiB res.mem.backing-ready-mib: [140.3, NaN, 140.3] (non-finite sample)` | `replay/tree-c-nan.json` |
| Control: HEAD core + HEAD budgets (`git show HEAD:`) on (b) | 1 failure: `nondeterministic ratio interact.drag.fade.playing.commits-per-move: numerators [60, 59, 60], denominators [60, 60, 60]` | `replay/head-b-control.json` |
| Control: HEAD core on (c) | 0 failures (the fail-open bug reproduced) | `replay/head-c-nan.json` |
| **Real Chromium, isolated (L38):** `CI=true npx playwright test --config playwright.perf.config.ts studio-lab-interactions studio-lab-resources` | 2 passed, rc 0, 6.8 min in total. PERF-1b-i: 5.5 min, `durationMs` 327960. PERF-1b-ii: 1.0 min, `durationMs` 62795. Nothing else ran during it. It used the frozen config's own production build on :5188; :5173 was not touched. | `a-round-225/perf-run.log`, `perf-start.txt`, `latest-interactions.json`, `latest-resources.json` |
| `equiv-check-b2.py` against `c-round-224/reports/*` | 1b-i: rc 0 (144 rows, 106 deterministic compared, 16 reclassified, 0 problems). 1b-ii: rc 0 (61, 37, 0, 0) | `equiv-latest-interactions.log`, `equiv-latest-resources.log` |
| New reports | `complete` = true, `failures` = [], 0 aborts, 0 pass problems. 106 deterministic rows (1b-i) and 37 (1b-ii); none has varying samples | as above |
| `npm run typecheck` | rc 0. It covers `perf/**` (tsconfig `**/*.ts`) | `typecheck.log` |
| `npm run lint` | rc 0. **It does not cover `perf/`** (`biome.json` includes `app/**` only, L30) | `lint.log` |
| Biome on scratch copies of `report.ts` and `report.test.ts` (project rules, without `files.includes`) | rc 0. The first run flagged 1 format wrap in DC-KINDS; I fixed it | `biome-scratch.log` |
| code-reviewer subagent (5 files) | 9/10. 0 Critical, High or Medium findings. 6 Lows, handled below. Architecture note: none | this report |

Unit, mutants, Biome, typecheck and lint were re-run on the final tree, after the review fixes. The review fixes changed only one test assertion and the docs. `report.ts` and the budgets were final at the time of the perf run and replay, and are unchanged since.

**Observation (fact):** in this clean, isolated run, `interact.drag.fade.playing.commits-per-move` at 1× gave `windowCommits` [59, 59, 59] / `movesInWindow` [60, 60, 60]. C's clean round-224 re-run gave 60 ×3. So the count also differs between clean runs, which supports the D-29z259 wallclock ruling. The other drag rows: range 119, trim 118, move 118, fade.stopped 60 (1×) / 59 (6×), each stable within the run.

## Code-review Lows and what I did
1. Doc 176 stated "a clean run gives 60/60" as a general fact, while my clean run gave 59. **Fixed:** the 60/60 is now credited to C's round-224 re-run, and my 59 is cited.
2. DC-KINDS used `every(...).toBe(true)`, which does not name the bad row. **Fixed:** it now uses `filter(kind !== 'wallclock').toEqual([])`, and MU-9 is still red.
3. Two import lines from `./budgets`. **Kept on purpose:** the existing `import type` line stays byte-identical (grant 2). Biome on the scratch copy is clean.
4. The doc 176 diagram was missing the test → budgets edge. **Fixed.**
5. The doc 168 Determinism paragraph spoke of `commits-per-move` as ratio-checked in the present tense. **Fixed:** "(round 225-მდე, იხ. ქვემოთ)".
6. The doc 168 TODO watch-item wording was imprecise. **Fixed** to match the task §2.1 and doc 176.

## Known gaps / for B and root
- PERF-REPORT-TEST-INCLUDE (Low) is still open. `report.test.ts` is not in the gate's full suite until root adds `perf/**/*.test.ts` to `vitest.config.ts` (`b-round-223-root-request-vitest.md`).
- Biome does not lint `perf/` (L30); only the scratch Biome run covers these files.
- I did not run PERF-1a, as the task says (no 1a file changed; replay (a) covers it).
- I did not run the full suite or `npm run verify` (gate rows, speed rule).
- The cause of the windowed commit variation (start boundary vs a commit without a render) is still an untested hypothesis. It is written in doc 176 as a hypothesis.

## B acceptance (§4) that A actually passed
§4.1 start checks ✔. §4.2 19/19 and MU-7…10 red ✔. §4.3 replay (a)(b)(c) ✔, plus the HEAD controls. §4.4 isolated PERF-1b-i and 1b-ii, equiv rc 0 for both, durations reported ✔. §4.5 typecheck and lint rc 0 ✔ (lint does not cover `perf/`). §4.6 code-reviewer run, findings forwarded ✔. §4.7 git status shows only the grants ✔.
I am not claiming any C row (SCOPE-225 … AN-REVIEW-225) or any gate row.

## Exact next C checks
SCOPE-225 (start and end, against the changed-file sha256 in `a-round-225/changed-end-sha256.txt`). BUDGETS-DIFF-225 (exactly 16 kind flips on the RECLASS full-match rows). CODE-225 (the `report.ts` diff is exactly the 3 §2.2 lines; `determinism.ts` equals HEAD). UNIT-225 (19/19 under the §0.3 scratch config; C's own mutants, including CM-3 `spread > 2`, a guard that checks only `values[0]`, and one drag row flipped back). REPLAY-225 (a/b/c plus the HEAD control on (b)). EQUIV-225 (isolated PERF-1b-i and 1b-ii; equiv-check-b2 rc 0). DET-REMAINING-225 (106 and 37 deterministic rows). LAB-SMOKE-225. G225-3. AN-REVIEW-225 (doc 176 l.4 byte-exact; every DC and MU id exists; doc 168 hunks only in §მეტრიკები and §TODO, l.4 unchanged).

## Scope completed
Round 225 code, data and docs (grants 1–5) are implemented and checked by A. The whole backlog is not complete. Next per B §8: CALM-1 (round 226), unless REGRESSION is due.
