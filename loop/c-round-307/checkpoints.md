# C round 307 checkpoints
- [x] orientation
- [x] SOURCE-SCOPE: 5 paths, sha -c fails only on 2 modified, graph.test.ts 0 removed lines (hunks: import l.1-6, append after l.392)
- [x] CLAIMS: diffs K2/K5/K6/K10/K11/K14/K15/K16; K14 30 711 vs B's 19 (B spec mismatch)
- [x] TESTS-READ: RS1-10 RC1-11 read; covering 10 files 185 green; A mutant logs; C mutants GAINDB->RS2, NOGAIN->RC7 red, restored green
- [x] NO-CHANGE: A prod build (scratch /tmp/c307/s, replaceClips in studio-lab bundle) :5190, 1440+1280: 30 clips, 12/12 releases starts 30, playing true, loaf 0, pos advancing; server stopped
- [x] PLAY-SMOKE-307: attempt1 dev demo-ready timeout 120s (env-invalid, kept smoke/attempt1-timeout.log); attempt2 PASS both vp
- [x] G307-AUTH: attempt1 cold /studio/middle-east (env-invalid, auth/attempt1-cold.log); attempt2 PASS both vp
- [x] store tree unchanged by C (5 A paths)
- [x] report + json written
