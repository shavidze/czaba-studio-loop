# C round 403: PERF-14c-i — verdict PASS (browserVerified true)

| # | Row | Result | Evidence |
|---|---|---|---|
| 1 | SOURCE-SCOPE start | PASS: claims equal planning output except §7 facts (K2,K5,K6,K7,K19,K20,K21,K25); status = 7 granted paths; frozen 1,290 rc 0; protected rc 0 | `c-round-403/claims-start.txt` |
| 2 | PATCH-IDENTITY | PASS: `git diff` of the 4 files equals `sketch-403.patch.txt` ignoring `index` lines | `c-round-403/mine.diff` |
| 3 | AUTH (browser, both vp) | PASS: demo opens, `auth_user` null; `/studio/middle-east` "Sign in required", 0 `audio[src]`; token no-auth 401; fake bearer 500 → BLOCKED (no backend) | `smoke-auth-*.json`, `auth-premium-*.png` |
| 4 | PEAKS-FALLBACK (browser, scratch build :5193) | PASS: 6/6 runs ready, loading 0, waveform 4096 cols / 87900 chars, no page errors; workers created 2/0/2, failed 0/0/1 | `fallback-*.json/png`, `scratch-build.log` |
| 5 | STUDIO-SMOKE (browser, both vp) | PASS: add, move 0→2.5, Ctrl+Z → 0, play to ~1.47 s then stop, export opens/closes, 0 page errors | `smoke-*.png`, `smoke-auth-*.json` |
| 6 | SCALE (alone) | PASS: rc 0, complete, failures [], 31 rows, 7 asserts pass, 17 deterministic rows equal prior, 8 new record rows (121.1 / 1) | `perf-scale.json`, `scale-compare.txt` |
| 7 | UNIT + MUTANT | PASS: 9 files 109/109; 8/8 mutants red incl. PW29 and PW24b | `vitest-a3.log`, `mutants/summary.txt` |
| 8 | PERF-LIB | PASS: 3 files 54/54 | `perf-lib.log` |
| 9 | BUDGET-SHAPE | PASS: first 23 identical; 8 appended rows record, budget null, owner PERF-14c-i, kinds match | inline |
| 10 | DOCS | PASS (see json notes) | git diff |
| 11 | SOURCE-SCOPE end + L57 | PASS: status 7, frozen/protected rc 0, claims-end == claims-start, L57 OK | `claims-end.txt`, `l57-check.txt` |
| gate | full vitest/typecheck/build/Biome/verify | not run by C (gate) | — |

Bugs: none. Blocked: fake-bearer token path (backend unavailable). Not re-measured by design: export WAV integrity (PERF round, no behaviour change; regression round carries it). Dev server cold-start timeout once on attempt 1 (environment). Carried Lows for B: A-R403-REVIEW-L1/L6/L7, A-R403-L2-RESIDUAL-QUEUED-THROW. The scale run rebuilt git-ignored `store/build`; source untouched by C; scratch dir /tmp/c403-scratch, server stopped by PID.
