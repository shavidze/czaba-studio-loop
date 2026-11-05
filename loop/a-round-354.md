# A round 354 — PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 (12 video trim/fade rows → assert)

**Timeout note (L11), not a STOP:** the interactions perf spec is above 50 % of its declared timeout.
- Declared timeout: `playwright.perf.config.ts` `timeout: 15 * 60 * 1000` = 900000 ms.
- A's run: 478076 ms (53 %). B's sketch run: 488086 ms.
- The gate does not run this spec, so there is no `verify.log` time.

The task's §3/§4 STOP bound is 540000 ms, which this run is under. The 450000 question stays with Saba as ROOT-REQ-PERF-TIMEOUT.

No STOP. Every A row in §2.1 ran and passed. Logs are in `a-round-354/`.

## Changed files (exactly 2, both from B's patches, applied unchanged)
- `perf/budgets.interactions.json`: `git apply b-round-353/sketch/budgets.patch.txt`. Its sha256 is `c212eecfa1aa2c12682c59ec4e59f2623fbc20b72142f138f0a899e00f886788`, equal to `b-round-353/sketch/budgets-dispatched.sha256`.
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`: `git apply b-round-353/sketch/doc232.patch.txt`.

I touched no `app/`, spec, perf/lib, config or protected file. Store `git status --short` shows 2 M and 0 untracked (`test-results/` is gitignored).

## A rows (actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | rc 0; equal to `b-round-353/claims-354-planning-output.txt` (empty diff) | `a-round-354/claims-pre.txt` |
| A-CLAIMS final (re-run after the mutant) | rc 0. K3 and K5 equal the sketch output. K2 = `a55543b 2`. K7 = `diff-lines-outside-2 0 untracked 0`. Every other K equals the planning output. The only diff from the sketch output is K2 (`no-git 0` there) | `a-round-354/claims-final.txt` |
| A-TYPE | `npm run typecheck` rc 0 | `a-round-354/typecheck.log` |
| A-LINT | `npm run lint` rc 0. There are **205 warnings**, exactly the ≤ 205 limit, plus 1 info | `a-round-354/lint.log` |
| A-PERF-LIB | 40/40 (2 files) | `a-round-354/perf-lib.log` |
| A-PERF (production, alone) | rc 0, `complete` true, `failures` []. 252 rows, **82/82** asserted pass, 0 NEW, 0 deterministic rows higher than C350. **`durationMs` 478076** (≤ 540000; playwright reported 8.2 m). `perf-rowcmp.py` rc 0: asserted 82, asserted-pass 82, and every row line EQUAL. The 12 new rows: video-trim stopped per-move 12.817 ×3 (≤ 13), max 15 ×3 (≤ 15), playing max 15 ×3 (≤ 15), release-commits 1/1, playing move-restarts 0; video-fade stopped per-move 2.95 ×3 (≤ 3), max 3 ×3, playing max 3 ×3, playing move-restarts 0; both live flags 1 ×3 | `a-round-354/perf.log`, `perf-results/latest-interactions.json`, `rowcmp.txt`, `perf-summary.txt` |
| A-MUTANT M-B2 (own scratch `/home/runner/a354-scratch/sc`: round-348 recipe, i.e. `git archive` HEAD + `git diff HEAD` applied + `node_modules` symlink, then `patch -p0` of `b-round-350/mutant-M-B2.diff.txt` into the dock) | The scratch dock and budgets sha256 equal B's `perf-mu-b2.sha256`. rc 1, complete, 82 asserted, 76 pass. Red on **exactly** the 6 `mu-b2` ids, with the same values (compared id by id and value by value): video-trim stopped per-move 18.683 ×3, stopped max 19 ×3, playing max 19 ×3; video-fade stopped per-move 8.85 ×3, stopped max 9 ×3, playing max 9 ×3. `durationMs` 473759. Store `git status` was unchanged by the mutant. I did not re-run M-B2′ (not required; B's run is cited) | `a-round-354/perf-mu-b2.log`, `perf-mu-b2-results/`, `mutant-mb2-summary.txt`, `mutant-mb2.sha256` |
| A-REVIEW | Not run. It is not required: 2 files, a budget JSON and a doc, under the 3-file rule | — |

Run order (L38): claims → typecheck → lint → perf-lib → perf (alone) → scratch build → mutant perf (alone) → claims. No jobs overlapped.

**Scoped Biome (/check):** `npx biome check` on the two owned paths rc 1 with "No files were processed": `biome.json` ignores both paths. That is not a pass. I validated the JSON with `python3 json.load` (ok). The repo-wide `npm run lint` is above.

## Known gaps
- The mutant scratch `/home/runner/a354-scratch` is left in place (outside `store/`; it does not survive the job). Nothing was deleted.
- Not run by A (gate rows): full vitest, build, `npm run verify`, e2e smoke.
- No architecture note (no review was run).

## Next C checks (§2.2)
CLAIMS, SOURCE-SCOPE (budgets sha256 `c212eecf…f886788`; both patches `git apply -R --check`), READ (only the 12 ids differ, in mode/budget/owner/note), PERF (alone; compare `durationMs` with A's 478076), C's own MUTANT (predicted in `c-round-354/progress.json`, not M-B2 or M-B2′), PERF-LIB, VIDEO-DRAG-SMOKE at 1440×900 and 1280×720 on :5173, G354-AUTH, RT-FIX-354, DOCS (l.4 string, one stage-2 section, 7 `## `, 0 `C round N pending` docs).

## Scope completed
The A rows of B task 354 only. The doc 232 l.4 reads `C round 354 PASS` as B's patch writes it (L28). It stays a claim until C passes the round. The backlog is not marked complete.
