# C round 306 checkpoints
- [x] orientation (task, A report, lessons L38/L57)
- [ ] PERF-RUN started (alone) at 
Tue Nov  3 01:00:26 UTC 2026
- [x] CLAIMS: only K2 differs (9 adf959d, expected); K15 27
- [x] SOURCE-SCOPE: 9 paths, sha -c fails on 7 modified, protected no diff, peak fns identical (73-line extract), budgets 9 rows exact text, spec only K12 entry, doc 222 one line
- [x] TESTS-READ: WG0-WG4 per §6; mutants red rows match; WG5 + MU-NO-PENDING A additions
- [x] DOC: doc 223 7 headings in order, l.4 exact
- [x] RT-FIX: diff only l.17 and l.26; retro-305 no uncommitted diff (no before copy)
- [x] HEAD scratch /tmp/c306/head prepared (git archive adf959d)
- [x] PERF-RUN 00:59:5x -> 01:13:53 UTC alone, rc 0, 3 passed 13.5m; reports copied to c-round-306/perf
- [x] HEAD build /tmp/c306/head (own cacheDir), A build = store/build from PERF-RUN (contains timelineWindow; HEAD build does not); served :5190 A, :5191 HEAD; warm-up both
- [x] PROBE 4 runs, SCROLL 3 runs, VIS 4 runs -> probe/*.json, probe-summary.txt, scroll-vis-summary.txt; servers stopped
- [x] PLAY-SMOKE-306 both vp PASS; G306-AUTH attempt1 cold-start timeout (env), attempt2 PASS
- [x] report + json final (manifest 40, mutant diffs checked, head-build.log saved)
