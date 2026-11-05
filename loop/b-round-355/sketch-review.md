# Sketch review, round 356 (PERF-CAND-VIDEO-MOVE-BUDGET)

Dispatched sketch sha256:
- budgets: 7053aee8db9cbf8e0269785ca0ffe44cac6fbbede0d0b4b503a90e5a44454042
- doc 232: 1e7f9909d398863a3b5d70ebfc82f3bb457996612fb38c47e1792fa3b44cdd98
- budgets.patch.txt: d9a5fd7dcd732bfd20f8ef3be8981ab569eb4d492491c2336aa40943f795613e
- doc232.patch.txt: a1ac9d70a766dcc82c3d0d12abc8663ed6d5bacf3c7ab18bcfdf2a071c426056

Reviewers: `tech-lead` (whole budgets sketch, read-only, no runs) and `performance-optimizer` (one question: the playing max assert). Both ran on the run-1 sketch (`sketch/budgets-run1.sha256`); the dispatched sketch differs from it only in the TL-R356-2 note wording.

| id | sev | finding | ruling |
|---|---|---|---|
| TL-R356-1 | Low | playing max has zero headroom while a tick commit can land in the window (59/60 commits) | keep assert `<= 12`: max stayed 12 in all samples; tick and drag updates run in different tasks, so they never share a commit (`performance-optimizer`: tick commits ~3 components); `determinismFailure` already checks deterministic rows in record mode, so assert adds failures only when all three samples move together |
| TL-R356-2 | Low | per-move note said "one more window commit of 8 or more components"; the real trigger is 8 extra components in total | fixed in the sketch ("8 or more extra components in the window turn it red") |
| TL-R356-3 | info | `<= 10` follows the ceiling rule; exact in 9 samples | none |
| TL-R356-4 | info | nothing reads `note`; `owner` only needs to be a string (perf/lib/budgets.ts) | none; perf-lib 40/40 on the sketch |
| TL-R356-5 | info | 252 rows, same order, only mode/budget/owner/note change; 19 notes; no asserted note keeps "Record until" | matches `sketch/read-diff-sketch.txt` |
| TL-R356-6 | info | D-29z1147 must appear in doc 232 | done in doc232.patch.txt (§114 heading) |
| TL-R356-7 | info | playing per-move stays wallclock/record, so M-B2's 15.783 there is unchecked by that row | caught by the stopped per-move and both max rows (M-B2 run: 9 red) |
| PO-R356-1 | info | `performance-optimizer`: use assert `<= 12` on the playing max; update the "record, as every move/lane/group max row" sentence | done: the sentence is replaced in both max notes |

0 Medium+. Perf evidence: `perf-summary.txt` (sketch 84/84; M-B2 9 red, as predicted in `checkpoint.md`).
