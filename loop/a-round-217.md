# A round 217: PERF-1b-ii fix-up (C-R216-01, C-R216-02, D-29z219)

No STOP. No A-caused regression. No covering-test failure. HEAD is `eb9e76e1bc2b41f6ec1a3e083a391d05cb1a844f` and there is no `chore(deps)` commit on top.

## Changed files (only the 2 grants)
| File | Start sha256 | End sha256 |
|---|---|---|
| `perf/budgets.resources.json` | 76c8918931ff02610516ff3951c6b4d13bcf75deda48f870a588e1a5e95eb8c1 | 4b23cc3fbfa50f7da4defb8f752eda256b61db5658aa2b646537aee59501964e |
| `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md` | f9ea4d3545a8d1497e3e29e7e6ced0a06126b46d790ca87c91d004af3b1aefcd | c5bca50f4e955e0616395a623a9b54ee5e30c85cca857b3f658d48f8ac73b087 |

- **Frozen list** (`b-round-216-r217-tree-sha256.txt`, 1,063 files), `sha256sum -c --quiet`: rc 0 at the start, rc 0 at the end (after the perf runs).
- **`git status --short --untracked-files=all` at the end:** exactly 4 M (docs 160, 161, 162 and 168) and 3 ?? (doc 169, the budgets file, the spec). This is unchanged from planning.
- **Spec:** `perf/studio-lab-resources.perf.spec.ts` was not touched (it is in the frozen list, rc 0).

## budgets.resources.json (§1.1–§1.3)
- The edit was a text-level replacement inside each target row's block, so indentation and key order are preserved. The `git diff --no-index --numstat` against the start copy is 14/14 lines: 5 `kind` lines and 9 `note` lines.
- `JSON.parse` (node): rc 0. 61 rows; ids and order are identical; the key order of every row is identical.
- Field diff against `b-round-216/r217-granted-start/budgets.resources.json`: **exactly 9 rows changed, only in `kind`/`note`.** The full dump is in `a-round-217-budgets-diff.txt`.
  - The 4 `mem-polls` rows (`-1`, `-2`, `-1.6x`, `-2.6x`): `deterministic` → `wallclock`. Each note gets the §1.1 sentence, with the ranges 7–9, 13–15, 9–12 and 17–20 (en dash). `mode`, `budget` (>= 5) and the other fields are unchanged.
  - `res.mem.used-ready-mib`: `wallclock` → `deterministic`. The note sentence is replaced exactly as §1.2 states; the rest of the note is unchanged.
  - The 4 `peak-backing-delta-mib` rows (1/2, 1×/.6x): only "polled every 50 ms in the window" changed, to "polled in the window (at most every 50 ms) plus one window-end sample".
  - Inline diff (id: kind start → end; note):
    1. `res.mem.used-ready-mib`: wallclock → deterministic; note changed
    2. `res.export.1.peak-backing-delta-mib`: deterministic (unchanged); note changed
    3. `res.export.2.peak-backing-delta-mib`: deterministic (unchanged); note changed
    4. `res.harness.mem-polls-1`: deterministic → wallclock; note + "… round 216: 7–9."
    5. `res.harness.mem-polls-2`: deterministic → wallclock; note + "… round 216: 13–15."
    6. `res.export.1.peak-backing-delta-mib.6x`: wallclock (unchanged); note changed
    7. `res.export.2.peak-backing-delta-mib.6x`: wallclock (unchanged); note changed
    8. `res.harness.mem-polls-1.6x`: deterministic → wallclock; note + "… round 216: 9–12."
    9. `res.harness.mem-polls-2.6x`: deterministic → wallclock; note + "… round 216: 17–20."
    The script output was "rows 61 61 ids/order identical True … changed rows 9 … clips/produced/seen all deterministic".
  - Every `clips-*`, `export-*-produced` and `js-*-seen` row is still `deterministic` (asserted by the script).

## Doc 169 (§2 a–f)
The diff against the start copy is in `a-round-217-doc169.diff`.
- (a) l.4 is `**სტატუსი:** Completed (C round 217 PASS)`.
- (b) A new `## არქიტექტურა` section sits directly after the end of `### GATE206-S5` and before `## გაზომილი სტრიქონები`. It holds "Pass-ის ნაკადი:" and the Mermaid block.
  - A python regex compare shows the block is byte-identical to the start copy's block.
  - The block was removed from its old place after `### Pass-ის თანმიმდევრობა`, together with its trailing blank line. `grep -c '```mermaid'` = 1.
- **`##` headings** (`grep -n '^## '`): კონტექსტი 7, მიდგომა 11, არქიტექტურა 88, გაზომილი 105, Findings 173, შეცვლილი ფაილები 180, პრობლემები 187, ტესტირება 197, TODO 203. TEMPLATE l.29–47 lists 7 headings; all 7 are present in TEMPLATE order, and the 2 extra sections sit after არქიტექტურა.
- (c) The determinism subsection now states 3 rules: the count rule (§2.5), the 0.1 MiB rule (D-29z219) and the poll-count rule (D-29z219, with the set-membership exception).
  - Table: `res.export.2.longtasks-over-50` (unchanged values) and the 4 `mem-polls` rows with the B ranges. The column header is "დაკვირვება (round 216)".
  - `used-ready-mib` left the table. A sentence says it returned under the 0.1 MiB rule (median 5.1 in all four round-216 runs, one sample 5.2).
- (d) The kind cells changed for 5 rows: `used-ready-mib` → `deterministic / record`, and the 4 `mem-polls` → `wallclock / assert`.
  - The intro sentence now names the 0.1 MiB rule, with A's peak sample [65.1, 65, 65]. No C data was added to this A-run section.
  - It also says the `mem-polls` rows are wallclock, so their median differences do not count for determinism.
- (e) The `mem-polls-N` metric row reads `(liveness; wallclock, D-29z219)`.
- (f) One Problem → Solution line for C-R216-01 and C-R216-02.
- No other line changed.
- L26: all 61 distinct `res.*` ids the doc cites exist in the budgets file (script: missing []).

## Tests actually run
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`a-round-217-typecheck.log`). Biome is not cited: it ignores `perf/` (L30). |
| `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`, run once, with nothing else on :5188 (the orchestrator's dev server on :5173 was left running, as told) | rc 0, 1 passed (1.2 m). `complete: true`, `failures []`, `durationMs` 60 587, `reactRenderer` 18.3.1, `budgetsFile` `perf/budgets.resources.json`. 61 rows × 3 samples. The 38 deterministic medians equal C round 216 run 1's medians (0 diffs). Files: `a-round-217/perf-run-1.{log,json,rc}`, `perf-run-1-summary.txt`. |
| Named mutant: a `/tmp/a217-mutant-flaky.json` copy with `res.harness.mem-polls-1` (index 26) set to `kind: "flaky"`, run with `PERF_BUDGETS_RESOURCES` | rc 1. `Error: budgets[26].kind must be deterministic or wallclock` (thrown at `perf/lib/budgets.ts:59`, via `loadPerfBudgets` from spec l.857). It fails at load, with no hang. The store file is unchanged. Log: `a-round-217/mutant-flaky.log`. |

**Determinism check:** `res.mem.used-ready-mib` is back in the deterministic set, and in this run it gave [5.1, 5.1, 5.1] with `failures []`. So the harness's in-run determinism check (`countsAgree`, over `resourceDeterminismMetrics`) passed for it. This is the purpose B gave for this run.

Samples of the 9 changed rows (the one real run):

| Row | kind | Samples | Median |
|---|---|---|---|
| `res.mem.used-ready-mib` | deterministic | [5.1, 5.1, 5.1] | 5.1 |
| `res.export.1.peak-backing-delta-mib` | deterministic | [65, 65, 65] | 65 |
| `res.export.2.peak-backing-delta-mib` | deterministic | [129.9 ×3] | 129.9 |
| `res.export.1.peak-backing-delta-mib.6x` | wallclock | [65, 65.1, 65.1] | 65.1 |
| `res.export.2.peak-backing-delta-mib.6x` | wallclock | [129.9 ×3] | 129.9 |
| `res.harness.mem-polls-1` | wallclock | [8, 8, 7] | 8 (PASS) |
| `res.harness.mem-polls-2` | wallclock | [16, 15, 15] | 15 (PASS) |
| `res.harness.mem-polls-1.6x` | wallclock | [12, 12, 13] | 12 (PASS) |
| `res.harness.mem-polls-2.6x` | wallclock | [22, 21, 21] | 21 (PASS) |

The code-reviewer was not invoked: there are 2 files (labels and docs) and no change beyond §2, so the task does not require it.

## Known gaps / for B
- **This run's `mem-polls` counts fall outside the round-216 ranges.**
  - `mem-polls-2` = 16 (range 13–15), `mem-polls-1.6x` = 13 (9–12) and `mem-polls-2.6x` = 22 (17–20).
  - The notes and the doc say "observed in round 216", so they stay literally true.
  - This supports the wallclock ruling. All samples are well above the `>= 5` assert.
  - B may decide later whether the notes should carry a widened range. I kept B's exact text.
- `res.export.1.peak-backing-delta-mib.6x` = [65, 65.1, 65.1] in this run. It is a wallclock row, so this has no effect.
- The perf run rewrote the shared `store/build/` (GATE206-S5, expected) and `test-results/perf/latest-resources.json`. The spec does not write `latest.json` or `latest-interactions.json`, and A did not touch them.
- ROOT-R216-LATE-SPEC-REVIEW still stands for the root reviewer. The spec is unchanged this round.

## Exact next C checks
SCOPE-217, BUDGETS-217, DOC-217, PERF-RUN-217 (with sentinels), REDPROOF-217 (A's `a-round-217/mutant-flaky.log` plus C's `>= 1000` mutant), AN-REVIEW-217, G217-3 and STUDIO-SMOKE-217, as listed in `current-task.md` §3. A did not run G217-3 or STUDIO-SMOKE-217: they are C browser rows.

## Scope completed (A self-checks only)
- [x] §1.1–§1.3: the 9 budget rows, exact wording. §1.4: no edit needed.
- [x] §2 doc (a)–(f), with (e) taken.
- [x] Frozen sha rc 0 at the start and at the end; JSON parse; 61 rows; exactly 9 rows changed.
- [x] typecheck rc 0. One perf run rc 0 (`complete`, `failures []`). The named `flaky` mutant shows the loader error.
- [x] The 7 TEMPLATE `##` headings appear in order.
- [ ] The C rows are not claimed by A (C verifies them).
