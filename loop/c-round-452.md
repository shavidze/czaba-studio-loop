# C round 452: PASS

Test-only re-dispatch (sketch v5). All of C1–C12 were run by C. Full verify, typecheck, build and lint are gate rows (`gates/gate-round-452.json`).

| Row | Result | Evidence |
|---|---|---|
| C1 scope | PASS. `git status` is identical at start and end (the 5 grants). Tree sha256 rc 0, protected files rc 0 | c-round-452/status-start.txt, status-end.txt |
| C2 claims | PASS. `claims-c.txt` is byte-equal to `claims-452-sketch-output.txt`, stderr empty | claims-c.txt, claims-c.err |
| C3 apply | PASS. sketch-files sha256, 4 files OK | |
| C4 covering | PASS. 3 files, 16 tests. TS1–TS6, GT1, GT1b, GT2–GT5, GT4b, GT5b each exist once | covering.log |
| C5 golden G1 | PASS. `equal: true`, sizes 349/17/5/354/6/0/1/3/5 | golden.json |
| C6 mutants on tree | PASS. 57 lines, equal to `b-round-451/mutants.txt`. BASE none, N11 → GT5, N11b → GT5, N8h → GT5b | mutants/mutants.txt |
| C7 HEAD control | PASS. 37 lines, equal to B's. N11 and N11b red at GT5 on HEAD | head-mutants/mutants.txt |
| C8 no weakening | PASS. expect counts teal 10, gradient 23, naming 6 equal `expect-counts.txt`. `BARREL_FILES` is HEAD's 3 barrels. The barrel-scope Medium from round 451 no longer reproduces: N11/N11b are red on the tree | |
| C9 doc 295 | PASS. l.4 is exact, 7 headings in TEMPLATE order, 0 `pending`, every cited row id exists, barrel-scope Problem → Solution present | |
| C10 auth (browser, 1440×900 and 1280×720) | PASS. `auth_user` null, workspace opens; `/studio/middle-east` shows "Sign in required", 0 `audio[src]`; the token API returns 401. Premium bypass: none. The fake-bearer path is BLOCKED (backend unavailable in cloud) | auth-run.log |
| C11 smoke (browser, both viewports) | PASS. Enter adds 1 clip, Play moves 0 → ~1.47 s, Stop holds the position (two reads equal), Export opens and Esc closes | auth-run.log |
| C12 L57 | PASS, rc 0 | l57-check.txt |

## Notes
- The first browser run timed out because the mutant runs were loading the CPU. The rerun on a quiet machine passed.
- Only a test file and a doc changed, so no runtime audio or export WAV measurement was relevant. None was run, and none is claimed.
- A's reviewer Lows (R452-CR-L1…L3) were not independently re-verified. They are Lows, already ruled or deferred.
- There are no bugs, and the Medium from round 451 is closed.
