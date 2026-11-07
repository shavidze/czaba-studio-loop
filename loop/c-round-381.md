# C round 381: PERF-13a (live decoded PCM in the perf harness) - PASS

Verdict PASS, 0 bugs, browserVerified true. Evidence in `c-round-381/`.

| Row | Result |
|---|---|
| SOURCE-SCOPE | status = exactly the 5 granted paths, none under `app/`; frozen (1271) + protected sha checks rc 0 at start and end (`status-start/end.txt`) |
| CLAIMS | rc 0, 0 MISSING; diffs vs B's output are only the expected ones: K2 0->5, K8 3->7 rows, K10 line shifts + 4th addInitScript, K15 247 present, K16 lists 247, K19 3 files (`claims.txt`) |
| UNIT-PERF-LIB | 3 files / 48 tests pass (pcm-live 8, report 34, zoom-probe 6) |
| PERF-RES (production build) | 1 passed, 0 FAIL, 0 problems. New rows: pcm-live-mib-ready 124 (min=max), count 9, decode 92.2, after-export delta 0. Existing rows unchanged: export bytes 29,189,420 / 58,378,796, backing-ready 19.3, used 5.8, dom 684/751/769/18, peak-backing 0.1/0.2 (`perf-res.log`, `res-rows*.txt`) |
| Wall-ms drift | export.1/2 wall-ms 426/772 -> 492/919 (record). HEAD control copy on this machine: 539/904 (`perf-res-ctrl-head.log`) -> environment noise, not caused by the registry |
| PCM-PROBE-BROWSER (dev) | 1440x900 and 1280x720 x3: 124.04 MiB, 9 live (ctor 31.86 + decode 92.18) = `pcm-head-381.json`. First run's pass 0 at 1440 read 0 (dev cold compile); rerun clean (`pcm-probe.json`, `pcm-probe-2.json`) |
| HARNESS-MUTANTS | SUM-NO-CHANNELS red on PL1; NO-DECODE-WRAP -> "pcm live count 7 ≠ 9 library sources"; NO-CTOR-WRAP -> probe-not-counted + "count 2 ≠ 9"; spec reports them; `restored` (`mutants/summary.txt`) |
| G381-AUTH | Fresh anonymous contexts, both viewports: `/studio-lab` shows demo (auth_user null, 9 sounds); `/studio/middle-east` "Sign in required", 0 `audio[src]`, no workspace; `/api/studio-token?product=..&file=..` without token -> 401, no token in body (a request without params gives 400, before the auth check). Fake bearer 500 = BLOCKED (backend unavailable). Premium auth not bypassed (`auth.json`, `auth2.json`, screenshots) |
| DOCS | Doc 247 l.4 byte-exact; 7 TEMPLATE headings in order; all rows/mutants/PL ids it names exist; 0 "C round N pending" hits |

Gate rows (full vitest, typecheck, build, Biome, verify, e2e smoke) not claimed.

Notes for B (not bugs): code-reviewer M3 (no dropped-probe guard), GATE304-M1 (perf/lib tests outside the gate), the count guard will conflict with 13b eviction by design.
