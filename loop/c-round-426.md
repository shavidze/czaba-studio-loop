# C round 426 — SYS-2 stage 2a: PASS (browserVerified true)

Source untouched by C; claims end == start; diff HEAD = the 6 granted files + 3 new (9 paths).

| Row | Result | Evidence |
|---|---|---|
| 1 scope+claims | PASS | c-round-426/claims-start.txt, claims-end.txt (identical; K5 "no" is expected, sketch already applied), L58 OK, frozen 1316 rc0, protected rc0 |
| 2 patch identity + unit | PASS | 8 files cmp identical; a2-vitest.log 57 files / 1015 tests |
| 3 mutants | PASS | b425copy/mutants/summary.txt identical to B's 18 lines |
| 4 held Enter browser | PASS | probe/compare: ALL OK (28 cells). One env retry (LMUTE 1440 cold load timeout, probe/lmute-attempt1-timeout.json) |
| 5 mouse+Space smoke | PASS | probe/smoke.log, equals B's HEAD values |
| 6 focus targets | PASS | Pan reset -> Pan slider (readout C); group name button after Enter/Escape; focus-visible solid 1px; both vp |
| 7 lane names | PASS | probe/names-{fade,trim}.json = B's (4 / 15 / 59 commits) |
| 8 auth | PASS (fake-bearer w/ real backend BLOCKED) | auth.json |
| 9 doc 274 | PASS | l4 exact, 7 headings, mutant block, rows exist |
| 10 end scope + L57 | PASS | l57-check.txt |

No bugs. Carried: TL-R425-09 (HM5 gesture-active row) stays a deferred Low for stage 2b; A's code-reviewer called it Medium, but it is a test-coverage gap (MU-PAN-RESET already red on HM5), not sketch logic. Gate rows (full vitest, typecheck, build, Biome, verify) not run by C.
