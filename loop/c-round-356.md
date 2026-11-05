# C round 356 — PERF-CAND-VIDEO-MOVE-BUDGET: PASS

browserVerified true (production perf spec, dev :5173 behaviour probes at 1440x900 and 1280x720, auth guard). Evidence in `c-round-356/`; machine-readable `c-round-356.json`.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS, equals A final | claims.txt |
| SOURCE-SCOPE | PASS: 2 M, 0 untracked; both patches reverse-apply; budgets sha256 7053aee8…4042 = dispatched; doc 232 cmp equal | — |
| READ | PASS: 19 changed / 233 equal; field sets as specified; 0 asserted notes with "Record until" (14 record rows keep it, as ruled) | read-diff.txt |
| PERF (prod, alone) | PASS rc 0, complete, failures [], 252 rows, 84/84 asserted pass, 0 NEW, 0 non-equal vs C354; durationMs 479512; video move 9.883/13/12 | perf.log, rowcmp.txt |
| MUTANT M-C1 | PASS. Predicted before run (progress.json): all 3 red. Measured 10.867>10, 14>13, 13>12; also trim/fade/audio move asserts red (19 total). Scratch deleted; store git status unchanged | perf-mutant.log, mutant-red.txt |
| PERF-LIB | 40/40 | perf-lib.log |
| VIDEO-DRAG-SMOKE | PASS both viewports, equal to C354 except blob src | behaviour-*.json |
| G356-AUTH | PASS: demo opens with auth_user null; /studio/middle-east "Sign in required", 0 audio[src]; token route 401 w/o header; no token in body. Fake bearer: 500 fails closed (mock :5199 down) → BLOCKED sub-check, not a failure | auth.json |
| DOCS | PASS: l.4 correct, one stage section, 7 `## `, 0 pending files, budgets in doc match file | — |

Gate rows (full vitest, build, Biome, typecheck, verify, e2e smoke) are not claimed. Ableton conformance: not applicable. Bugs: none.
