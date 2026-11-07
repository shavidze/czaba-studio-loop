# Sketch review, round 397 (PERF-13d)

reviewed sha256 4db03d5ace7a6b76181eb199af08f6fbcd1906663f978c8a7525fdb97d7ce3a6
dispatched sha256 4db03d5ace7a6b76181eb199af08f6fbcd1906663f978c8a7525fdb97d7ce3a6 (equal; no edit after the review)

Reviewer: `tech-lead` (read-only; grep and reads only, no test runs, because the perf spec was running), 2026-11-07, after the mutants (mutants/summary.txt 7/7 red) and the full suite on the sketch (precheck-full.log 259/3847 rc 0).

## Verdict
OK to land. Critical 0, High 0, Medium 0.

## Findings and B rulings
| # | Sev | Finding | B ruling |
|---|---|---|---|
| L1 | Low | `setTimeout(0)` is throttled to about 1 s in a hidden tab, so a demo loaded in a background tab becomes ready about 1 s later | Accepted. `scheduler.yield` is not in every supported browser; `MessageChannel` adds a second mechanism with no row that could fail. Doc 253 records it. No id (not a defect: nothing waits on a background tab) |
| L2 | Low | No row for the unknown-source path after the rewrite | Covered: `studio-lab-demo.test.ts` DL7 ("unknown source rejects with the unknown-demo text and never fetches") runs the same branch and stays in the covering set |
| L3 | Low | No row aborts before the worker resolves | Ruled out: the same `throwIfAborted` after the yield handles it; SB5 pins that line (MU-397-NO-ABORT-CHECK red). Matrix cell A×W excluded with this reason |
| L4 | Low | Row order SB4, SB6, SB5 | Cosmetic; kept |

## Event matrix (W worker resolves, T timer fires, A abort, U unknown source), one load in flight
| | W | T | A | U |
|---|---|---|---|---|
| W | SB4 | SB1, SB3, SB4 | SB5 (A after W, before T) | excluded: U never reaches W |
| T | excluded: T is queued only after W | SB4 | excluded: A after T: buffer built, consumer drops it on `signal.aborted` [K11] | excluded |
| A | excluded (L3 ruling, same line as SB5) | SB5 | excluded: abort is idempotent | excluded: rejects with the unknown-source Error; consumers ignore it after abort |
| U | excluded | excluded | as above | DL7 |
16 cells: 7 rows (SB1, SB3, SB4, SB5, DL7) cover 6 cells, 10 cells excluded with a reason. Generated SFX without a timer: SB6.

## Vacuity
Red at HEAD: SB1, SB2 (identity), SB4 (five builds in microtasks), SB5 (resolves). Green at HEAD on purpose (regression guards): SB3 (red under MONO, SKIP-RIGHT, WRONG-STEM), SB6 (red under YIELD-ALL).
