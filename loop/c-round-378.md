# C round 378 — PERF-11c-iii-c2a (LoopBrace leaf)

**Verdict: PASS. 0 bugs. browserVerified true.** (JSON: `c-round-378.json`; L57 check: `c-round-378/l57-check.txt` rc 0.)

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: 4 lines (3 M + doc 244) at start and end; frozen rc 0; protected rc 0 | `c-round-378/status-start.txt`, `status-end.txt` |
| CLAIMS | PASS: rc 0, 0 MISSING; differs from sketch output only in K2 (4) and K19 | `c-round-378/claims.txt` |
| SKETCH-EQUAL | PASS 3/3 (start and end) | |
| ASSERT-COUNT | PASS 197 / 19 | |
| UNIT | PASS: 140 files / 2202 tests; shuffle seed 42 33/33. No test ≥ 1 s, so none above 50 % of the 5 s default | `unit140.log`, `shuffle.log` |
| MUTANTS-TREE | PASS: 3 mutants each red on RB-LEAF5 only (1 failed / 5 passed / 13 skipped), `restored` | `mutants.out`, `mutants/` |
| PERF-INTERACT | PASS: all asserts, 0 FAIL, count rows equal HEAD log except 2 record-only fractional medians inside the sketch run's min/max | `perf-interact.log`, `pa.txt` vs `ph.txt` |
| LEAF-PROBE (browser) | PASS at 1440×900 and 1280×720: A == sketch JSON; wrapper 0 everywhere; ViewInner 0 on lane mute, Ctrl+Z, preview start/stop; other leaves = HEAD. Brace renders HEAD→A: lane mute 1→0, Ctrl+Z 1→0, preview start 1→0, stop 2→0, add 3→2 | `leaf-A.json`, `leaf-HEAD.json` |
| LOOP-BROWSER (browser) | PASS: s0–s9 all fields equal HEAD and sketch at both viewports | `loop-A.json`, `loop-HEAD.json` |
| G378-AUTH (browser) | PASS: lab workspace with auth_user null; `/studio/middle-east` "Sign in required", 0 audio[src], no workspace; token API 401 without token. Premium auth not bypassed. Fake-bearer 500: BLOCKED (backend unavailable) | `smoke-A.json` `.auth` |
| STUDIO-SMOKE-378 (browser) | PASS: equal HEAD; position 00:01.462 / 00:01.451 after 1.5 s | `smoke-A.json`, `smoke-HEAD.json` |
| DOCS | PASS: l.4 byte-exact, 7 headings in TEMPLATE order, named rows/mutants exist, 0 pending hits | |

## Notes
- LEAF-PROBE attempt 1 hit a cold-start 120 s timeout at 1440×900 on both trees: environment-invalid (L38), kept in `attempt1/`; attempt 2 valid (1 of 2 replacements).
- `arrangement-lane-range` count was 0 at 1280×720 in both A and HEAD, yet the brace was created and all fields match: observation only.
- Gate rows (full vitest, typecheck, build, Biome, verify, e2e smoke) belong to the gate. Not run by C.
- Ableton conformance: not applicable (invisible perf refactor, per task).
- Verification limits: HEAD copy used its own Vite cache on port 5174; A's tree used the live dev server on 5173.
