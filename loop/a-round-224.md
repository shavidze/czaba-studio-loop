# A round 224: PERF-HARNESS-SHARED-LIB-b-i (per-row determinism contract)

**Watch item PERF-1A-TIMEOUT-HEADROOM** (not a STOP): PERF-1a took 5.8 min (report durationMs 5.79 min; whole run 11.6 min) (round 223: 7.1–7.4 min, limit 15 min). PERF-1b-i 4.6 min, PERF-1b-ii 56.4 s. All 3 specs passed, and none ran over 12 min (L32).

**No STOP.** Baseline: HEAD `e140ab4`, clean tree. Frozen, grants and root-file `sha256sum -c` all rc 0 at the start (run from `store/`). §0.3 **case 3**: there is no `root-grant-r224-vitest.json` and HEAD has no include, so `vitest.config.ts` is untouched and the test runs with the scratch config `/tmp/a224-vitest.config.ts` (copy: `a-round-224/a224-vitest.config.ts`). B opens Low `PERF-REPORT-TEST-INCLUDE`.

## Changed files (grants only, plus the 3 new files)
- `M perf/lib/report.ts` (grant 1):
  - `determinismFailure` per deterministic row, using the §2.2 texts;
  - cross-rate is now `base !== other`;
  - `rowRate` is exported at module scope and `rateRowId` moved in;
  - the options `determinismMetrics` and `determinismRequiresKind` are removed.
- `M perf/lib/stats.ts` (grant 2): `countsAgree` deleted. A grep shows 0 importers.
- `M perf/lib/budgets.ts` (grant 3): the `tolerancePct` field and the `readRow` line are removed. The leftover `const row … return row;` is kept, because no other change is granted.
- `M perf/lib/page.ts` (grant 4): `export { rateRowId } from './report';`.
- `M perf/studio-lab.perf.spec.ts` (grant 5): the set and the 2 options are removed, and `commits-per-move` gets `detail: { commits: rendered.length, moves }`.
- `M perf/studio-lab-interactions.perf.spec.ts` (grant 6):
  - the set and the options are removed;
  - S4: `min`/`max` are read before the initial value and the first `t0`. A missing (null or empty) or non-finite attribute pushes `<base>: zoom slider min/max missing` and returns;
  - `live` = right direction && symmetric && every value strictly inside;
  - the detail gains `sliderMin` and `sliderMax`, and the problem line names the failing rule.
- `M perf/studio-lab-resources.perf.spec.ts` (grant 7): the set and the options are removed.
- `M perf/budgets.json` (grant 8): `load.longtasks-over-50` becomes `kind` `wallclock` with a note saying why, and the 48 ` Not determinism-checked.` sentences are deleted (24 `commits-per-move` and 24 `release-commits`; counted before the edit). Text replacement only, no JSON re-serialisation.
- `M perf/budgets.resources.json` (grant 9): `res.export.1.longtasks-over-50` becomes `kind` `wallclock`, with a note.
- `M perf/budgets.interactions.json` (grant 10): the notes of `zoom-live`, `zoom-live.6x` and `zoom-30-live`.
- `M` docs 163, 168, 169 and 175 (grants 11–14): granted sections only. Doc 175 l.4 is unchanged.
- `?? perf/lib/determinism.ts`, `?? perf/lib/report.test.ts` and `?? docs/implementation/2026/quarter-IV/176-perf-determinism-contract.md`.

## Checks actually run
| Check | Result | Evidence |
|---|---|---|
| §4.1 offline replay: C r223 reports → new core + new budgets | 1a: exactly 24 `ratio detail missing` (`fader.*.commits-per-move`, 1× and 6×), nothing else. 1b-i: 0. 1b-ii: 0. As expected | `a-round-224/replay-c223.log`, script `a-round-224/replay/` |
| Unit `report.test.ts` (scratch config) | 16/16 green: the 15 DC ids from §2.4 plus DC-CONTRACT | `a-round-224/unit.log` |
| MU-1…MU-6 (scratch copies in `a-round-224/mutants/`) | MU-1 red: DC-INT (+DC-ORDER). MU-2: DC-DENOM. MU-3: DC-MIB. MU-4: DC-UNKNOWN (+DC-ORDER). MU-5: DC-CROSS (+DC-ORDER). MU-6: DC-PARTIAL | `a-round-224/mutants.log`, `mutants/run-mutants.py` |
| `npm run typecheck` | rc 0 | `a-round-224/typecheck.log` |
| `npm run lint` | rc 0, 0 errors (205 warnings in `app/`, pre-existing; `perf/` is not covered, L30) | `a-round-224/lint.log` |
| Scratch tsconfig R4 (`noUnusedLocals`/`noUnusedParameters`, `perf/**/*.ts`) | rc 0, 0 diagnostics. Sanity mutant (an unused `median` import) gives TS6133 | `/tmp/a224-tsconfig.json` (copy in `a-round-224/`), `tsc-unused.log` |
| Biome on scratch copies of the changed perf TS files (project rules without `files.includes`) | clean | `a-round-224/biome-scratch.log` |
| Real perf run `CI=true npx playwright test --config playwright.perf.config.ts` (production build on :5188, started by the frozen config; :5173 untouched) | 3 passed (11.6 min), rc 0; 1a ✓ 5.8 min; 1b-i ✓ 4.6 min; 1b-ii ✓ 56.4 s | `a-round-224/perf-run.log` |
| EQUIV-224 `equiv-check-b1.py` vs `c-round-223/reports/*` | 1b-i: rc 0, 144 rows, 122 deterministic compared, 0 problems. 1b-ii: rc 0, 61 rows, 37 compared, 0 problems. 1a: rc 0, 316 rows, 166 compared, 0 problems. All three have `complete` true, `failures` empty, 0 aborts, 0 page errors. The 1a `commits-per-move` details now carry `{commits, moves}` (e.g. 91/121). Replaying the new reports through the core: 0 failures in all 3 (`replay-new.log`) | `a-round-224/equiv-1b.log`, `equiv-1a.log`, reports copied to `a-round-224/latest*.json` |
| S4 live | `zoom-live` [1,1,1], `.6x` [1,1,1] and `zoom-30-live` [1,1,1]; detail `sliderMin` 0, `sliderMax` 1000; path 678…851…678 | `a-round-224/latest-interactions.json` |
| code-reviewer subagent (actual) | No blocker, score 8.5/10. Findings addressed or forwarded below | this report |

**Timing note (honest):** two small edits landed while the perf run was already in flight. Playwright loads spec files at start, so the measured run used the earlier text:
- S4 `?? NaN` → `|| NaN`, so an empty attribute also counts as missing (reviewer Low). These are 2 pre-window lines, and on this fixture (`min="0"`, `max="1000"`) both forms give the same values.
- The new mixed-pair assertion in the unit test.

typecheck, tsc-unused, unit and mutants were rerun on the final tree. **PERF-1b-i was then re-run alone on the final tree:** ✓ 5.2 min, rc 0, and `equiv-check-b1.py` rc 0 (144 rows, 122 compared, 0 problems), in `a-round-224/final-1bi/`. 1a and 1b-ii have no text change after their run, so all three specs are now proven on the final text.

Doc hunks: `git diff -U0` start lines for docs 163, 168, 169 and 175 all fall inside the granted sections. Doc 175's l.63 hunk is the reworded heading of the granted §GATE214-S2 subsection (its own first line). The frozen and root `sha256sum -c` are rc 0 at the end.

## Reviewer findings
- **Medium, forwarded to B, not changed (the spec formula):** `tenths` is fail-open on NaN or Infinity. `NaN > 1` is false, so a MiB row with a NaN sample passes. `exact`, `ratio` and cross-rate all fail closed on NaN. Proposed ruling: `!Number.isFinite(spread) || spread > 1`, plus a DC case. I did not change it, because §2.2 gives the formula byte-exact and C checks CODE-224 "as written". Proposed id: A-R224-REVIEW-TENTHS-NAN.
- **Low, fixed:** an empty `min`/`max` attribute counted as finite (`Number('') === 0`). Now `|| NaN`.
- **Low, fixed:** no test covered mixed pairs (pair 1 numeric in only some samples). Added to DC-RATIO-ALT.
- **Low, documented:** `tenths` compares rounded tenths ([65.05, 65.24] passes). One sentence added to doc 176.
- **Low, deferred to B:**
  - DC-CROSS-OFF uses 45/60 vs 89/120 rather than a literal "59/60 fade" shape. The cross logic only uses medians, so the shape is equivalent.
  - DC-ORDER covers `ratio detail missing` and `nondeterministic count` in the slot, but not the MiB or ratio texts (same return path).
  - The ratio contract never checks `value` against its detail. Informational.
  - The leftover `const row` in `budgets.ts` (grant 3 forbids other changes).
- **Task deviation (A):** B's DC-DENOM input (59/59) also changes the numerator, so MU-2 could not turn it red. DC-DENOM keeps B's case and adds a denominator-only case (60/61). Documented in doc 176.
- **Architecture note (for B/root, not acted on):** keep. `determinism.ts` owns only the contract table, which keeps the budget JSON byte-stable. `report.ts` owns the failure texts and their order. Moving `determinismFailure` into `determinism.ts` would split the text/order invariant across two files for no gain.

## Doc line references outside the granted sections (join DOC-PERF-LINEREF-DRIFT-223, not edited)
- Doc 163 l.56 (§არქიტექტურა, not granted) still says "PERF-1a ბირთვს გადასცემს: `determinismRequiresKind: false` …".
- Doc 175 l.38–39 (§Report-ის ბირთვი, options table, not granted) still lists `determinismMetrics` and `determinismRequiresKind`.
- Doc 168 §შეცვლილი ფაილები "163…: l.67" (already in DOC-PERF-LINEREF-DRIFT-223).

## Known gaps
- `report.test.ts` is **not gate-covered until root adds the `perf/**/*.test.ts` include** (§0.3 case 3).
- The tenths NaN hole is open, pending B's ruling.
- The full suite, build, verify and e2e smoke were not run by A (speed rule; they are gate rows).

## Exact next C checks
SCOPE-224 (start and end), BUDGETS-DIFF-224, CODE-224, UNIT-224 (`npx vitest run --config <scratch>` with `root` = store, `include` = `['perf/**/*.test.ts']`, `environment` = `node`; plus C's own mutants), REPLAY-224 (the C r223 reports give 24 `ratio detail missing`; the new reports give 0), EQUIV-224 (the real run on the final tree plus `equiv-check-b1.py` ×3), S4-224 (an asymmetric-path mutant gives 0 plus the problem line), UNUSED-224, LAB-SMOKE-224, G224-3, AN-REVIEW-224.

## Scope completed
§2.1–2.4, §3 (S4) and §5 (doc 176 and the granted doc sections), with grants 1–14 applied. The B acceptance criteria I passed myself: §4.1 replay, §4.2 unit and red-proofs, §4.3 EQUIV (all 3 exit 0; 1b-i re-verified on the final tree), §4.4 typecheck, lint and R4, §4.5 code review. The C rows are C's to verify. The backlog is not marked complete.
