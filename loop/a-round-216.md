# A round 216: PERF-1b-ii resource baselines + SYS-4 doc status backfill

**Status:** implemented; handed to C. No STOP.

**L32 headroom:** the new perf test takes **59.0 s / 59.1 s** of its 15 min Playwright timeout (6.6 %), and `durationMs` is far below the 8 min limit. The 8 min fallback (dropping the 6× 2-clip export) was not needed. The M1 mutant run (export click skipped, every download waits 60 s) takes 8 min 45 s (58 %), and the 8 min pass guard stops it. That is mutant-only behaviour; the clean run is 1 min.

**Port note:** the orchestrator's 5173 dev server was not used or touched. `playwright.perf.config.ts` (frozen) starts its own production `remix-serve` on `:5188` via `npm run build`. My mutant runs used a `/tmp/a216/scratch` copy with its own build and its own `:5188` server. I stopped that server myself before the final runs. No perf run overlapped another build or perf run.

## Changed files (exactly the B grants)
| Path | Change |
|---|---|
| `perf/studio-lab-resources.perf.spec.ts` (new) | Test `studio-lab perf harness PERF-1b-ii`, §2.1–2.5. |
| `perf/budgets.resources.json` (new) | 61 rows, all `res.*`, owner `PERF-1b-ii`. The notes name PERF-11, PERF-12, PERF-13 and PERF-14. |
| `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md` (new) | TEMPLATE sections in Georgian. l.4 = `**სტატუსი:** Completed (C round 216 PASS)`. |
| docs 160, 161, 162, 168 | l.4 only, byte for byte per §2.7 (`git diff --numstat` 1/1 each; diffed against `b-round-215/r216-granted-start/`). |

`git status`: 4 M + 3 ??, nothing else. HEAD is `eb9e76e`, with no deps commit. The frozen `sha256sum -c` gave rc 0 at the start, before the final runs, and at the end.

## Self-checks actually run
- `npx tsc --noEmit` (`npm run typecheck`): rc 0 after the last edit. The `biome format` stdin diff of the final spec is empty. Biome is **not** claimed for `perf/` (L30). I used `biome format` via stdin (with an `app/` path) only to match the project layout, and applied pure formatting. Grep finds no `any`, ` as `, `@ts-*` or `biome-ignore`. Semicolons and single quotes are used throughout.
- **Final runs:** `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`, twice, nothing else running. Logs and reports are in `a-round-216/final-run-{1,2}.{log,json}`.
  - Both runs: exit 0, `complete: true`, `failures []`.
  - `durationMs`: 58,988 and 59,143.
  - `reactRenderer`: 18.3.1. `innerWidths`: [1440].
  - Per-step timing, 1× pass 1 (ms): load 1946, ready heap 318, Add 728, export-1 1190, GC 328, Ctrl+D 695, export-2 1826, js studio-lab 1703, js home 1394, js studio-guard 1372.
  - Per-step timing, 6× pass 1 (ms): export-1 1884, Ctrl+D 890, export-2 2481.
- **Determinism:** every deterministic median is identical between the two runs. The only sample-level difference is `res.export.1.peak-backing-delta-mib` [65, 65, 65] vs [65.1, 65, 65], which is 0.1 MiB rounding.
- **Moved out of the deterministic set (§2.5), each with a note in the budgets file and in the doc:**
  - `res.mem.used-ready-mib`: [5.1, 5.2, 5.1] in one early run.
  - `res.export.2.longtasks-over-50`: [0, 0, 0] vs [0, 0, 1]; one task sits at the 50 ms threshold (50, 51 and 52 ms seen).
- **Key medians:**

  | Area | Rows | Medians |
  |---|---|---|
  | Memory at ready | backing-ready / used-ready | 140.3 / 5.1 MiB |
  | Leak row | after-export delta | 0 MiB |
  | DOM | page-0 / page-1 / page-2 | 666 / 906 / 1126 |
  | DOM | clip-subtree | 17 |
  | DOM | ruler-1 / ruler-2 | 267 / 469 |
  | DOM | per added clip | 220 |
  | Export, 1× | 1 clip: bytes / peak / wall | 29,189,420 B / 65 MiB / ~390–450 ms |
  | Export, 1× | 2 clips: bytes / peak / wall | 58,378,796 B / 129.9 MiB / ~750 ms |
  | Export, 1× | long tasks | 0 for both (2-clip borderline, see above) |
  | Export, 6× | longtask-max, 1 / 2 clips | ≈ 140 / ≈ 250–260 ms |
  | Export, 6× | loaf-blocking-max, 1 / 2 clips | ≈ 92 / ≈ 200–211 ms |
  | Export, 6× | count over 50 ms | 2–3 |
  | JS encoded bytes | studio-lab / home / studio-guard | 355,155 / 263,099 / 287,429 (43 / 41 / 42 scripts, 0 third-party) |
- **Earlier runs, for history only, not the baseline:** `a-round-216/run-0-calibration.*` and a scratch clean run. Two runs on the pre-review spec were removed and replaced by the final runs.

## Red-proof (mutants on the `/tmp/a216/scratch` copy, never in the store)
Diffs are in `a-round-216/m*.diff`; logs and JSON in `a-round-216/m*.{log,json}`. All four ran on the final spec. The last change after M2–M4 only adds assert evaluation for incomplete reports, so complete-run behaviour is unchanged.

| Mutant | Mutated line | Result |
|---|---|---|
| **M1** | Removed `await primary.click();` in `measureExport` | rc 1 in 8 min 45 s, no hang. The pass guard skipped 6× passes 2–3. Failures: `assert failed res.harness.export-1-produced: measured median 0 [0, 0, 0], budget == 1` (plus `export-2-produced` and the `.6x` versions), and per export `no download within 60 s` / `no pointerdown recorded`. |
| **M2** | `bits !== 24` → `bits !== 16` | rc 1. Failures: `export N: WAV check failed: header format 1, 2 ch, 48000 Hz, 24-bit`, `assert failed res.harness.export-1-produced …`, `… export-2-produced …` (and `.6x`). `bytes` rows are "not measured 3 times" (bytes are only recorded for a valid file). |
| **M3** | `heap.backingStorageSize` → `heap.backingStorageSizeX` in `readHeap` | rc 1 in 27 s. Dedicated failure: `aborted at ready heap: Runtime.getHeapUsage gave no finite backingStorageSize at ready` on all 6 passes, plus liveness assert failures (`mem-polls-1` …). NaN rows: 0. |
| **M4** | `PERF_BUDGETS_RESOURCES=/tmp/a216/budgets-m4.json` with `res.harness.clips-2 == 3` | rc 1. The only failure: `assert failed res.harness.clips-2: measured median 2 [2, 2, 2], budget == 3`. |

Only M4 fails on exactly one row. M1–M3 fail on their named row plus rows that fail as a consequence: the `.6x` siblings, "not measured 3 times" for `bytes` (M2), the liveness rows of aborted passes (M3) and the guard lines (M1). §3 asks for "the named row" only for M4.

## Code-reviewer: run (score 7.5/10) and addressed
- **H1 (`mem-polls` padded by samples from before the click):** fixed. Every heap sample carries a timestamp, and only samples whose request was sent after the window start and answered before the window end are counted. The loop period is max(50 ms, round trip).
- **M1 (`wall-ms` biased at both ends):** fixed.
  - The window start is the click's `pointerdown` from instrumentation, so the long task of the click's own task is still counted.
  - The window end is a one-shot `MutationObserver` installed before the click, so there is no polling cost.
- **M2 (last long task / LoAF entry could be missed):** fixed with a 200 ms settle before the snapshot. The filter is still `startTime ≤ end`.
- **M3 (stale "WAV created" text):** fixed. Before the click, the spec fails if the dialog already shows the text.
- **M4 (doc used B's probe numbers):** fixed. The table and findings come from `final-run-{1,2}.json`. The ids cited in the doc were grepped against the budgets file: all exist (the leftovers are wildcard prefixes).
- **M5 (`countsAgree` is lax):** written down in the doc. The lib is frozen.
- **L1:** pass guard lowered from 11 to 8 min.
- **L2:** `download.path()` gets a 30 s timeout. CDP `send` has none; noted in the doc.
- **L3–L7:** written down in the doc: expect timeouts, how null heap readings are handled, the frame tolerance only holding for whole-ms lengths, polling on the main thread, and `data:` URLs.

**New finding from fixing H1 (in doc 169):** with strictly in-window samples, the peak was nondeterministic: [74.4, 74.4, 129.9]. 37.2 MiB matches the float `.slice()` copies; 65 MiB adds the 27.8 MiB WAV ArrayBuffer, which appears at the end of the window. I added one window-end heap sample, read 23–50 ms after the text (up to 61 ms in a scratch run). The row is now 65 / 129.9 on every pass. `detail` keeps `windowPeakMib` and `endSampleMib` separately. This is useful input for PERF-12.

**Not re-reviewed:** the code-reviewer saw the spec as it was before its own fixes. Four later changes were not reviewed again: the window redesign, the window-end heap sample, the assert evaluation for incomplete reports, and the 8 min guard. Root's independent reviewer should cover them.

**Architecture note (verbatim from code-reviewer; a proposal for B/root, not an in-round task):**
> The only signal is repeated duplication. The helpers at `perf/studio-lab-resources.perf.spec.ts:158-230` and the report builder at `:672-770` are a third copy of `perf/studio-lab-interactions.perf.spec.ts:102-190` and `:806-904`. That copy was ordered by §2.1 and is already queued as PERF-HARNESS-SHARED-LIB (D-29z215).
> Keep it as is for now. The spec touches no app code. It doesn't move any audio timing, refs, gesture lifecycle, Undo/Redo or public hook. It adds no state or lifecycle to an existing owner and changes no coupling. It is one cohesive test-only file. Extracting now would break the frozen-file rule for no gain this round.
> I have no new proposal for the planner beyond the queued stage. When that stage runs, it should move `nowIn`, `snapshot`, `waitForQuiet`, `blurActive`, `reactRendererProblem`, `rateRowId`, `formatLimit` and the generic report builder into `perf/lib/`. It should also add a page-timestamped export-window helper (see H1/M1), so a fourth spec doesn't copy these measurement issues too. Its acceptance criterion is that all three specs keep identical row ids and medians.

## Deviations from the task text (for B)
1. **Peak memory includes a window-end sample**, in addition to the samples polled inside the window (reason above). §2.4.c says "polled every 50 ms in the window; max minus ready". Without the end sample the row is not deterministic. `mem-polls` still counts in-window samples only.
2. **The 6× throttle goes on after ready and Add**, as in PERF-1a and PERF-1b-i. "After ready" is satisfied.
3. **Assert rows are evaluated on any row with samples**, not only when the report is complete. Without this, M1 (a guard-truncated run) would not name `export-1-produced`. Complete runs behave the same.
4. **The "WAV created" end is detected by `MutationObserver`**, not `getByText` polling. `getByText(/^WAV created:/)` still reads the text afterwards.
5. **Needs B ruling: the 0.1 MiB asymmetry.**
   - I moved `res.mem.used-ready-mib` out of the deterministic set because of a single 0.1 MiB sample difference ([5.1, 5.2, 5.1]).
   - I kept `res.export.1.peak-backing-delta-mib` in, although it has the same kind of difference ([65, 65, 65] vs [65.1, 65, 65], identical medians, seen after the end-sample fix).
   - By the literal §2.5 rule it would also leave the set. B decides whether both go out, or whether a rule like "a difference of one 0.1 rounding step with identical medians stays in" applies to both.
   - Today the harness check (`countsAgree`) passes either way.

## Artifact inventory (`a-round-216/`)
- **Current evidence:**
  - `final-run-{1,2}.{log,json}`: the baseline.
  - `m1.{log,json,rc}`, `m2.*`, `m3.*`, `m4.*`: the final mutants.
  - `m1-export-click.diff`, `m2-bits.diff`, `m3-heap-field.diff`: the mutated lines.
  - `table.md`: the doc 169 table source.
- **History only:**
  - `run-0-calibration.*`: the first spec, before the review.
  - `m1-old-spec-interrupted.log`: stopped by me when the spec changed.
  - `m1-before-assert-fix.{log,json}`: same mutant, before deviation 3.
  - `scratch-clean.log`: the latest passing scratch run.
- **Lost artifact:** the scratch run that showed the nondeterministic in-window peak ([74.4, 74.4, 129.9]) was overwritten by the next scratch run. Only the numbers quoted here and in doc 169 remain. C can reproduce it by removing the end-sample read (`endHeap`) on a scratch copy.

## Known gaps / risks
- `res.harness.mem-polls-1` at 1× is 7–9 samples against `>= 5`. That margin is small: a slower CI machine (longer CDP round trip) or a faster export could fail it. If C sees it near 5, B may want a rule (for example a shorter poll interval).
- The 1× 2-clip export has a task at about 50 ms, so `longtasks-over-50` there is 0 or 1.
- `test-results/perf/latest.json` and `latest-interactions.json` did not exist on this machine before or after (`ls` shows only `latest-resources.json` plus `perf-1b-ii-*.json`). Nothing could be overwritten here. C should compare mtimes if those files exist on its machine.
- B-R215-EXPORT-CEIL-FRAME (+1 frame) is not touched. The demo frames equal `Math.round` exactly.
- The full suite, `verify`, build and e2e smoke were not run (speed rules: gate). The two frozen perf specs were not run.

## Exact next C checks
- **SCOPE-216:** HEAD `eb9e76e`; status = 4 M + 3 ??; `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-215-r216-tree-sha256.txt`; each grant diff is l.4 only.
- **PERF-RUN-216:** two runs of the new spec. Expect about 59 s, `failures []`, the medians above, and `reactRenderer` 18.3.1.
- **PROBE-216:** expect backing at ready ≈ 140.3 MiB, 1-clip peak ≈ 65 MiB **if C's probe samples through the end of the export / download** (≈ 37.2 MiB if it stops strictly at the text, see the deviation), clip subtree 17, `/studio-lab` encoded bytes 355,155.
- **REDPROOF-216:** A's M1–M4 logs are in `a-round-216/`.
- **DOC-216:** doc 169 l.4, the GATE206-S5 section, §"Findings for later PERF stages", cited ids.
- **AN-REVIEW-216**, **G216-3**, **STUDIO-SMOKE-216**, **RT-FIX-216:** not touched by A.

## B acceptance I truly passed (A side only; C verifies)
- §2.1–2.5 spec / budgets / results files: done. Two clean runs exit 0. The time limit holds.
- §2.6 GATE206-S5 section: done.
- §2.7 SYS-4: four l.4 lines, byte for byte.
- §2.8 doc 169 l.4: done.
- §3 red-proof M1–M4: done on a `/tmp` copy, with failure texts as above.
- typecheck: rc 0. Code-reviewer: run, findings addressed, Architecture note carried.

Whole-backlog completion is **not** claimed.
