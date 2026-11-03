# A round 306 — PERF-3d (in progress)

- A-CLAIMS: PASS (claims-306.sh == claims-306-head-output.txt; a-round-306/claims-before.txt)
- Edits: sketch (b-round-305/sketch.patch.txt) applied to the 7 sketch paths; view.ts `spanInTimelineWindow` third param made optional (`timelineWindow?: TimelinePxWindow`, grant wording); doc 222 one line added in `## მიდგომა`.
- A-TYPE: `npm run typecheck` rc 0. A-LINT: `npm run lint` rc 0 (205 warnings, 1 info, none in a granted path); scoped `biome check` on the 7 code/perf paths: clean.
- A-UNIT: 11 files / 169 tests green (a-round-306/covering.log, covering.json). Slowest: CP12a 9,991 ms / 30,000 timeout (33 %; gate 304 9,464 ms).
- A-PERF-LIB: scratch config `/tmp/a306/vitest.perf.config.mjs` (root=store, own cacheDir): 2 files / 29 tests green (a-round-306/unit-perf-lib.log).
- A-MUTANTS (scratch `/tmp/a306/scratch` = git archive HEAD + A's 9 files + node_modules symlink; only the new test file): control 5/5; MU-GATE-OFF red WG2,WG3,WG4; MU-NO-SCROLL red WG3; MU-FALLBACK red WG0,WG1; MU-EDGE red WG0; restored 5/5. Logs/diffs a-round-306/mut-*.
- A-DOC: doc 223 written (`docs/implementation/2026/quarter-IV/223-perf-waveform-window.md`); doc 222 one line added. A-PERF-RUN started (alone) at ~00:40 UTC; code-reviewer (read-only) running.
- A-PERF-RUN (alone; a read-only code-reviewer agent was reading files concurrently, no CPU jobs): rc 0, 3 passed (14.1 min). Reports copied to a-round-306/perf/. perf-1a 93/93 asserts, perf-1b-ii 15/15, perf-1b-i (interactions) 23/23; complete true, failures [], pageErrors 0, problems 0 in all three. Interactions runtime 348,952 ms (39 % of 15 min).
  - in.keydown-max-ms samples [16,24,24] median 24; out.keydown-max-ms [24,24,24] median 24; in/out keydown-median 16/16; in/out/wheel loaf-max 0/0/0
  - commits in/out per key, wheel per step: 1, detail.max 1 in all 3 samples; zoom.30.components-per-key 247 (247/247/247); commits-per-key 1; key-window-longest-ms median 9.5
  - path-rewrites in 0; out 3 [3,3,3] perKey 0,0,1,1,0,0,0,1,0,0; wheel 2 [2,2,2] perStep 0,0,0,1,0,0,1,0,0,0 (= B's sketch)
