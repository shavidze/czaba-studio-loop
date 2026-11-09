# C round 422 — SYS-2 stage 1 (held Enter): PASS

browserVerified true. All 8 rows verified independently; no bugs. Full vitest/typecheck/build/Biome/verify are gate rows (not run by C).

| Row | Result | Evidence |
|---|---|---|
| 1 claims+scope | pass; L58 OK; stderr empty; frozen 1317 rc0, protected rc0 | c-round-422/claims-start.txt |
| 2 patch+unit | 3 files identical to sketch applied to HEAD scratch; 23 files 509/509 | rerun by C |
| 3 mutants | summary == B's 7 lines; each log 17 tests | c-round-422/b421copy/mutants/ |
| 4 held-Enter browser | ALL OK (12 cells, both viewports). First FOLLOW 1440 cell timed out on cold load (env), retried OK | c-round-422/probe/run.log, sketch/*.json |
| 5 per-press smoke | Space play advance 1.5 s over 1.506 s wall; stop frozen 500 ms; Follow on/off/on; Loop pressed; 0 page errors | c-round-422/smoke-auth.json, smoke-*.png |
| 6 auth | demo opens, auth_user null; protected route "Sign in required", 0 audio[src]; studio-token 401. Fake-bearer BLOCKED (no backend) | smoke-auth.json |
| 7 doc 272 | l.4 exact, 7 headings, mutant block equal, GATE107-S1→HE6 | |
| 8 scope end | end claims == start; 3 M + 1 ?? | claims-end.txt, l57-check.txt |

Not measured: export WAV (no export code changed), Fit guard (TH5 ruling), Ableton conformance (does not apply). A-R107 sweep remains open for stage 2.
