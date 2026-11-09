# C round 419 — SYS-R369-STEM-CACHE-WRITE-COORDINATOR: PASS (browserVerified true)

All 8 rows run; evidence in `c-round-419/`. No new bugs. Env-invalid retries: smoke first run timed out on cold dev server; auth 1440 empty body on cold render (retried once, green).

| Row | Result | Evidence |
|---|---|---|
| 1 SOURCE-SCOPE + CLAIMS | PASS: stderr 0 B; differs from planning output only in expected K2/K5/K6/K9/K10; K3 1316 rc 0; K4 rc 0; K14 9 ids found; K19 `L58 OK` | claims-start.out/.err |
| 2 PATCH-IDENTITY + UNIT | PASS: sketch applied to HEAD archive, both files `cmp` identical to working tree; test diff equals precheck-testdiff.txt (6 hunks, 1 removed line = x-injected assert); vitest 49/49 | vitest-a2.log |
| 3 MUTANTS | PASS: 15 lines byte-equal to B's summary.txt (`cmp`); loaded replicate (2 busy loops) 43/43 in 454 ms | b418copy/mutants/summary.txt, vitest-loaded.log |
| 4 BROWSER stem cache | PASS: production build, 1440x900 + 1280x720, 4 phases each, ALL EQUAL vs HEAD; 0 page errors; starts 1; peak 0.31; new-form names | probe/compare.txt, probe/out/sketch/*.png |
| 5 PLAY-STOP | PASS both viewports: advanced 1.07/1.062 s over 1.13/1.108 s wall; stop frozen over 500 ms; 0 page errors | browser.json |
| 6 AUTH | PASS: fresh contexts, auth_user null, demo opens; /studio/middle-east "Sign in required", 0 audio[src]; studio-token 401. BLOCKED: fake-bearer (no backend) | browser.json, shots/ |
| 7 DOC 270 | PASS: l.4 byte-exact; 7 headings in order; mutant block present byte-for-byte; 8 ids with existing SC rows; idle() drain change stated; GATE368-L3 (two holding points) and TL-R419-L4 a/b/c as TODO | doc 270 |
| 8 SOURCE-SCOPE end | PASS: end claims == start claims; `git diff HEAD --stat` only the 2 granted files; L57 OK | claims-end.out, l57-check.txt |

Not run by C: export WAV measurement (no export/graph/playback runtime file changed); full vitest/typecheck/build/verify (gate). Ableton conformance: does not apply. Open Lows carried (not bugs of this round): GATE368-L3, TL-R419-L4 a/b/c (documented TODOs, deferred).
