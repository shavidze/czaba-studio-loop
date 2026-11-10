# C round 427 — SYS-2 stage 3 (2b-i) held Enter: PASS (0 bugs, browserVerified true)

Evidence in `c-round-427/` (claims-start/end, a2-vitest.log, mutants-run.log, probe/, auth.log, legacy-*.png, l57-check.txt).

| Row | Result |
|---|---|
| 1 source scope + claims | PASS: stderr empty, L58 OK, frozen 1319 rc0, protected rc0, 8 status lines |
| 2 patch identity + unit | PASS: 7 files identical to sketch on HEAD archive; 68 files 1226/1226 |
| 3 mutants | PASS: 12 lines identical to B summary (HEAD-SRC 9 red, each single mutant its row) |
| 4 held-Enter browser | PASS: ALL OK 18 cells, both viewports; focus map as specified, ring solid. SNAP-1440 cold timeout retried once |
| 5 per-press smoke | PASS: equal to B HEAD output, both viewports |
| 6 auth | PASS: demo opens (badge, auth_user null); /studio/middle-east Sign in required, 0 audio[src], no workspace; token API 401/400. Fake bearer BLOCKED (no backend, route 500). Premium not bypassed |
| 7 doc 275 | PASS: l.4 exact, 7 headings, mutant block byte-equal, ids exist |
| 8 end scope + L57 | PASS: end claims == start; L57 OK |

Note: one auth run read legacy `signIn:false` at 1440 on a first read (workspace false, no audio); repeated polling and a third run show the sign-in gate. Treated as a timing artefact of the probe, not a bypass.
Gate rows (full vitest, typecheck, build, Biome, verify) not run by C.
A's sketch-test Lows (L3/I1/I3) are carried to B for ruling; not re-rated.
