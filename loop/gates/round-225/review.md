Checks are done: `kind` is only read at `perf/lib/report.ts:69`, so moving the 16 rows to wallclock affects only the determinism check. Here is the verdict.

COMMIT: OK

## Code Review: round-225 (perf/lib/report.ts, perf/lib/report.test.ts, perf/budgets.interactions.json, docs 168/176)

**Scope:** HEAD bbaea50 plus the 5 paths in `paths.txt`. `untracked.txt` is empty, so there are no new files. **No changes to `app/**`, auth, purchase or download code.** Verify passed: 203 test files, 2958 tests, both builds green. I reviewed only this diff, not the whole module.

**N/A for this diff:** real-browser event ordering, listener/timer leaks, render cost, accessibility, Tailwind/tokens and changes to existing UI flows. Only the perf harness's report logic, its budget data and docs changed.

### Critical Issues
- none

### Suggestions (ranked, none block the commit)
1. **The gate does not run the new tests.** `perf/lib/report.test.ts` (DC-MIB-EDGE at line 348, DC-MIB-NONFINITE at 355, DC-KINDS at 374–400) is outside `vitest.config.ts`, which only includes `app/**`. The 2958 tests in verify.log do not include them. The 19/19 pass and the red-proof (named mutants MU-7…MU-10) come from A's scratch config, as doc 176 describes. The gate did not confirm them.
   **Fix:** carry out the existing root request (`b-round-223-root-request-vitest.md`) to add `perf/**/*.test.ts` to the include, or a separate `vitest.perf` project. Not for this round.
2. **Biome does not check `perf/` (L30).** Formatting in `perf/` is only checked on scratch copies.
   **Fix:** add `perf/**` to Biome's `files.includes`, in the same task as point 1.
3. **Style, low (`perf/lib/report.test.ts:4–5`):** two separate imports from `./budgets`, one type and one value.
   **Fix:** merge into one line: `import { loadPerfBudgets, type PerfBudgetRow } from './budgets';`.
4. **Docs, low (`168-perf-interactions-baseline.md:10`):** the sentence that ends "`commits-per-move` კი fade-ზე 1 / 0.983-ია" (fade's `commits-per-move` is 1 / 0.983) is still correct. But the same paragraph still lists `commits-per-move` among the deterministic ratios, and only the parenthetical "(round 225-მდე)" (until round 225) qualifies it. A reader may miss that.
   **Fix:** state the reclassification in the first sentence instead of a parenthetical. Optional.

### Good Practices Found
- `report.ts:80–82`: the `Number.isFinite` guard runs before `Math.round`, which closes the fail-open path where a NaN sample passed. The empty case (`values.length === 0`) still returns before it. The message matches the tests exactly. Strict TypeScript holds: no `any`, no assertions, semicolons present.
- `budgets.interactions.json`: exactly 16 hunks, each changing only `"kind"`. This matches the doc's "სხვა byte არ შეცვლილა" (no other byte changed) and DC-KINDS's `toHaveLength(16)`. All 16 rows stay `mode: "record"` with `budget: null`, so no assert is lost.
- DC-KINDS reads the real budget files through `loadPerfBudgets` and `import.meta.url`, so the path does not depend on the working directory. It locks in both sides of the split: the 16 drag rows are wallclock, and the 24 fader rows are deterministic with the `ratio` contract.
- Doc 176 separates the confirmed fact, the conclusion and the unchecked hypothesis, and records the 1b-i/1b-ii real-Chromium equivalence runs (EQUIV-225).

### Architecture note
- Signal 2 (ownership/coupling) at `perf/lib/report.test.ts:374–400`: a unit test now reads the production budget JSON and locks in its `kind` values, so a future reclassification means editing both the JSON and the test. **I'd keep it**: it is a deliberate guard against C-R224-01 coming back, it costs little, and it stays inside `perf/lib`.
- **Proposal for the planner, not this round:** if reclassifications come up again in b-ii, move the kind checks into a separate `perf/lib/budgets.test.ts` driven by a table of id → kind instead of a regex. Acceptance criteria: the same mutants MU-9/MU-10 still turn red, and none of the other 19 cases change.

### Alternative Approach
- N/A. The diff doesn't touch auth, checkout or the Studio audio pipeline; it only changes how the perf report is classified. On the classification choice: the alternative was to keep the 16 rows deterministic and allow ±1 on `windowCommits`. That would bring back a tolerance the ratio rows can never fail, the same problem as code-review M2. Making them wallclock while `move-components-per-move` and `move-components-max` stay exact is the better choice.

### Score: 9/10