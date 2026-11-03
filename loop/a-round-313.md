# STOP — needs B ruling

**Round 313, A (implementer).** §9 STOP condition met: "A-PERF fails in two valid runs". Both runs ran alone and failed only on two **6× clip-gain** rows (`nondeterministic …`). The new liveness row passed in both runs. Under §9 I changed nothing more in `store/` after run 2: no doc 163 or doc 228 edits, and no code-reviewer run. The sketch patch stays applied (policy 6: preserve partial work).

## Tree state (`git status --short`)
Round 312's 7 entries (2 M + 5 ??), plus M on `perf/studio-lab.perf.spec.ts`, `perf/budgets.json`, `perf/lib/report.ts` and `perf/lib/report.test.ts`. That is 11 entries. Doc 163 is unchanged. No app file was touched by A in this round. After all runs: `a312-app-code-sha256.txt` 6/6 OK, `protected-sha256.txt` 11/11 OK. The perf runs wrote only to `build/` and `test-results/` in `store/`, both gitignored.

## Rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | PASS. `claims-313.sh` output equals `claims-313-head-output.txt` (diff empty) | `a-round-313/claims-before.txt` |
| A-APPLY | PASS. `git apply` succeeded. All 4 files are `cmp`-equal to the `sketch-*.txt` copies | — |
| A-TYPE | PASS. `npm run typecheck` rc 0 | `a-round-313/typecheck.log` |
| A-LOAF | PASS. Scratch `/tmp/a313s` (tar copy, `node_modules` symlinked, `vitest.perf-scratch.config.ts` include `perf/**/*.test.ts`): 29/29. `unit-mutants.sh` output is byte-equal to `precheck-unit-mutants.txt` (1 / 3 / 1 red; restored: 29 passed) | `a-round-313/loaf-unit.log`, `a-round-313/unit-mutants.txt` |
| A-PERF | **FAIL 2/2 (STOP).** The spec failed both times; only 6× clip-gain nondeterminism rows failed | `a-round-313/perf-a-run{1,2}.{log,json}` |
| A-DOC | **Not done** (STOP) | — |
| A-REVIEW | **Not done** (STOP; nothing past the sketch to review) | — |

## A-PERF details
Command: `npx playwright test --config playwright.perf.config.ts perf/studio-lab.perf.spec.ts`, which builds its own server on :5188 (`webServer`). Each run had no other playwright or remix-serve process (`ps` check before run 2). The :5173 dev server (root's) was running but idle. **Honesty note (L38):** I did not do a browser warm-up before the runs, only a `curl` to :5173. The perf server is a fresh production build started by playwright.

**Failures, verbatim:**
- Run 1: `nondeterministic ratio fader.clipgain.playing.commits-per-move.6x: numerators [91, 91, 92], denominators [121, 121, 121]`; `nondeterministic count fader.clipgain.playing.release-commits.6x: [1, 1, 2]`
- Run 2: `nondeterministic ratio fader.clipgain.playing.commits-per-move.6x: numerators [92, 91, 92], denominators [121, 121, 121]`; `nondeterministic count fader.clipgain.playing.release-commits.6x: [2, 1, 2]`

**The rows this round targets** (both runs met every A-PERF sub-criterion for them):
| Row | Run 1 | Run 2 |
|---|---|---|
| `harness.loaf-scripts-live` samples | [79, 79, 80] | [80, 80, 80] |
| its details: loafEntries / scriptCount / frameStartedBeforeCallback | 1/1/1 in each pass | 1/1/1 in each pass |
| `load.script-max` (detail loafEntries) | [46, 0, 46] (3, 1, 3) | [51, 47, 49] (2, 2, 2) |
| `load.ready-ms` | (in json) | [1073, 1010, 1049] |
| `load.settled-ms` | (in json) | [1658, 1914, 1613] |
| `load.settled.longtask-max` | (in json) | [113, 117, 93] |

Run 1's `load.script-max` includes a real 0, which the old guard would have flagged. The new harness accepted it, as intended.

## Discriminators for B (read-only, no runs)
- **Where the check is:** `perf/lib/report.ts:99` (count) and `:117` (ratio) compare the passes of one CPU rate within one run. A mix of values across the three 6× passes therefore fails the run.
- **Tally of 6× clip-gain values** (commits / release-commits per pass):
  - HEAD harness, without the injection: C's 3 runs on C's job (`c-round-312/perf-a-run1/2.json`, `perf-head.json`) plus my control 1 on this job give **4/4 runs all 91/1**.
  - Injected harness, B's job: B's 3 pre-check runs (`b-round-312/precheck-perf-run1..3.json`; start-inside, overlap and containment variants, all with the injection) give **3/3 all 91/1**.
  - Injected harness, this job: my 2 store runs plus control 2 give **3/3 containing 92/2** (mixed, mixed, then all 92/2).
- **What this does and does not show:** the 92/2 value appears only on this job and only in injected-harness runs. The HEAD harness has n = 1 on this job, so machine and patch are **not** separated. The counter-argument is the code reading in the next bullet. B gets both; A does not lean.
- **Same browser and setup:** `chromium` 143.0.7499.4, `reactRenderer` 18.3.1, `cpuRates` [1, 6] and `passesPerRate` 3 in all of these JSONs.
- **Can the patch reach the 6× rows?** In the applied spec, `measureLoafLiveness` runs only inside `if (record)` (`record = cpuRate === 1`, `perf/studio-lab.perf.spec.ts:613`, call at l.629–631). Every pass opens its own `browser.newContext()` and page (l.604–608). `passSequence` (l.84) is used only as report metadata (l.782). So the 1× injection does not run in the 6× pass's page.
- **Machine:** `nproc` 4, AMD EPYC 7763. I did not record the machine for the earlier jobs.
- **Reading of the release row note:** the second release commit is described as a "pre-paint commit [that] follows when the committed value changed". This fits a timing-dependent drag end value under 6× throttle. That is a hypothesis, not a confirmed cause.

## Paired diagnostic runs (after the STOP; scratch only, `store/` untouched)
Scratch `/tmp/a313s` is a tar copy of the store tree (round 312 app code plus the applied sketch), with `node_modules` symlinked and `cacheDir: "/tmp/a313s-vite-cache"` in the scratch's own `vite.config.ts`. `build/` was deleted before each run. Each run ran alone. These are diagnostics for B, not A-PERF attempts: §9 stays met.

| Run | Harness | failures | clip-gain 6× commits / release-commits | `load.script-max` | live row | Evidence |
|---|---|---|---|---|---|---|
| Control 1 | HEAD's 4 perf files (`git show HEAD:`) | **[]** | 91, 91, 91 / 1, 1, 1 | [47, 44, 44] | n/a | `a-round-313/perf-control-headharness.{log,json}` |
| Control 2 | the sketch (`sketch-*.txt` copies) | **[]** | 92, 92, 92 / 2, 2, 2 | [33, 0, 45] | [80, 79, 80] | `a-round-313/perf-control-sketch-scratch.{log,json}` |

**Reading (inference, not proven):**
- The 6× clip-gain rows have **two values per pass**: 91 commits with 1 release commit, or 92 with 2.
- A run fails only when its three 6× passes mix the two values, because the `nondeterministic` check compares passes within one run.
- The patched harness gave the 92/2 value in all three passes of control 2 and passed.
- On this job the 92/2 value shows up only in injected-harness runs. The 1× liveness step never runs in the 6× pages, though, and before this job all 6 recorded runs read 91/1, including B's 3 injected runs. Patch and machine are not separated (see the tally above).
- With n = 1 per arm, this does not prove the flake predates round 313. It does show that the patched harness can pass end to end on this machine, and that `load.script-max` = 0 is accepted (control 2, pass 2).

## Known gaps
- A-DOC (doc 163 sections, doc 228 l.4, Problem → Solution and testing lines) is not done.
- A-REVIEW is not done.
- A-PERF never passed.
- No acceptance row of §3.1 beyond A-CLAIMS, A-APPLY, A-TYPE and A-LOAF is claimed.

## Needed from B
A ruling on the 6× clip-gain nondeterminism: either environment noise (then a re-run budget or the row's rule), or a real flake that predates this round (then a separate task). Changing those rows is outside §5 (`budgets.json`: every other row byte-unchanged), so A did not touch them.

## Artifact names
The task's `a-round-313/perf-a.json` and `perf-a.log` are `a-round-313/perf-a-run1.{json,log}` and `perf-a-run2.{json,log}`, one pair per run. No file named `perf-a.json` exists.

## Next C checks
- **If B wants the cause before ruling (proposed discriminator):** on C's job, run the HEAD harness ×2 and the sketch harness ×2, each alone, in a scratch copy with its own `cacheDir`. Report `commits` and `release-commits` for the three 6× clip-gain passes of each run.
  - 92/2 anywhere under the HEAD harness clears the patch.
  - 92/2 only under the sketch harness, across two jobs, points at the harness.
- **If B rules the runs environment-invalid and A completes the round** (docs plus review): C runs §3.2 as written.
