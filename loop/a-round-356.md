# A round 356 — PERF-CAND-VIDEO-MOVE-BUDGET

**L11 timeout note (not a STOP):** the perf spec's declared timeout is 900000 ms (`playwright.perf.config.ts`, 15 min). A's A-PERF `durationMs` was 474487, which is 52.7 % of it; the mutant run took 477540. The gate does not run this spec, so there is no `verify.log` time to compare. Both runs are below the task's 540000 STOP line. This is evidence for ROOT-REQ-PERF-TIMEOUT. Port 5188 was free after the runs.

**Status:** implemented, no STOP. Every A row in §2.1 was run by A in this job; the M-B2 mutant was run by A (not cited from B).

## Changed files (2, both via B's patches, unchanged)
| File | How | Check |
|---|---|---|
| `perf/budgets.interactions.json` | `git apply b-round-355/sketch/budgets.patch.txt` | sha256 `7053aee8…4042` = `b-round-355/sketch/budgets-dispatched.sha256` |
| `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | `git apply b-round-355/sketch/doc232.patch.txt` | `cmp` with `b-round-355/sketch/doc232.sketch356.md`: equal |

No other file was touched. `git status --short --untracked-files=all`: those 2 `M` entries only, 0 untracked.

## A rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS: byte-equal to `b-round-355/claims-356-planning-output.txt` | `a-round-356/claims-pre.txt` |
| A-CLAIMS final (re-run after both perf runs) | PASS: K3, K5 equal the sketch output; K2 = `6588f08 2 outside-root-lanes-since-6588f08 0`; K7 = `diff-lines-outside-2 0 untracked 0`; all other K lines equal the planning output | `a-round-356/claims-final.txt` |
| A-READ | PASS: equals `b-round-355/sketch/read-diff-sketch.txt` | `a-round-356/read-diff.txt` |
| A-TYPE | `npm run typecheck` rc 0 | `a-round-356/typecheck.log` |
| A-LINT | `npm run lint` rc 0; 205 warnings (= cap 205), 1 info | `a-round-356/lint.log` |
| A-PERF-LIB | 40/40 (2 files), rc 0 | `a-round-356/perf-lib.log` |
| A-PERF (production, run alone) | PASS: rc 0, `complete` true, `failures` [], 252 rows, **84/84** asserted pass, 0 NEW, 0 DIFF: all 181 non-wallclock rows have the same median as C354. **`durationMs` 474487** (≤ 540000; wall time 8m14s incl. build). The 3 changed rows: stopped per-move 9.883 ×3 (≤10), stopped max 13 ×3 (≤13), playing max 12 ×3 (≤12) | `a-round-356/perf.log`, `a-round-356/perf-results/latest-interactions.json`, `a-round-356/rowcmp.txt` |
| A-MUTANT (M-B2, scratch `/home/runner/a356-scratch/sc`, run alone) | PASS: rc 1, `complete` true, 75/84; red on **exactly** the 9 ids under `mu-b2` in `b-round-355/perf-summary.txt`, with the same medians and samples (video move 15.75 / 17 / 17; video-trim 18.683 / 19 / 19; video-fade 8.85 / 9 / 9). All audio asserts green. `durationMs` 477540. Scratch dock sha256 `53ecfbc7…` = B's M-B2. `store/` git status the same before and after; scratch deleted | `a-round-356/perf-mu-b2.log`, `a-round-356/perf-mu-b2-results/`, `a-round-356/mu-b2-red.txt`, `a-round-356/status-before-mutant.txt` |
| A-REVIEW | not run: 2 files (a JSON budget file and a doc), so the 3-file rule does not apply, as the task says | — |

The run order followed L38: typecheck, lint and perf-lib ran first, then the perf spec ran alone, then the mutant ran alone.

## Notes and gaps (facts, not claims of passing)
- **Scoped Biome:** `npx biome check perf/budgets.interactions.json` processed 0 files, because `biome.json` ignores that path. This is not a Biome pass for the file. The doc is markdown, so Biome does not check it. The repo-wide `npm run lint` is rc 0.
- The scratch budgets file has the dispatched sha256. B's mutant tree had the run-1 sketch, which differs only in one `note` string. The red list and values match anyway, as B expected (the harness does not read `note`).
- Doc 232 l.4 reads `…, video-move-budget; C round 356 PASS)`. Under L28 this stays a claim pending C.
- No browser check at :5173 was run by A. The VIDEO-DRAG-SMOKE and G356-AUTH rows are C's. Behaviour does not change: `app/` is untouched (K4 dock/context sha256 equal).

## For C (exact next checks)
1. CLAIMS: `bash b-round-355/claims-356.sh` should equal `a-round-356/claims-final.txt`.
2. SOURCE-SCOPE: check 2 `M` files and 0 untracked, `git apply -R --check` of both patches, the budgets sha256 `7053aee8…`, and `cmp` of doc 232.
3. READ, plus your own reading of the 19 notes.
4. PERF (alone), compared with `a-round-356/perf-results/latest-interactions.json` and C354.
5. Your own non-M-B2 MUTANT, predicted first.
6. PERF-LIB, VIDEO-DRAG-SMOKE (both viewports), G356-AUTH and DOCS, as in §2.2.

## Scope completed
§1.1 is done: both files are applied unchanged. All A rows of §2.1 passed as listed. Acceptance stays with C, and the backlog is not marked complete.
