# A round 304 — PERF-3c (checkpoint, in progress)

- Claims before editing: equal to `b-round-303/claims-304-output.txt` (diff empty). Saved `a-round-304/claims-before.txt`.
- lessons.md: not found anywhere under /home/runner/czaba-project (find). Lessons cited by id in the task were followed from the task text.
- Next: write perf/lib/zoom-probe.ts + test, spec functions, budgets rows, docs.
- [checkpoint 2] All 8 §5 paths written. typecheck rc 0; lint rc 0 (205 warnings / 1 info project-wide; biome `files` = app/** only, so perf files need scratch biome). Scratch vitest (/tmp/a304/vitest.perf.config.mjs): 2 files, 28/28 PASS. A-PERF-RUN started alone -> a-round-304/perf-run.log.
- [checkpoint 3] A-PERF-RUN DONE: `npm run test:perf` rc 0, 3 passed (14.0 m wall), interactions durationMs 339158 = 37.7 % of 900 s. Reports complete, failures [], 0 problems, 0 page errors. All new asserts PASS. Copies in a-round-304/perf/. Next: mutants m1-m4 on /tmp/a304/scratch.
- [checkpoint 4] Run 1 PASS (log moved to a-round-304/perf-run-1.log, reports a-round-304/perf-run-1/). Mutants m1-m4 red, control green (scratch, prod build on 5189, server stopped). code-reviewer 8/10: Medium = out LoAF row misses frames (t-window filter). Fixed in grants: LoAF rows now count entries overlapping the step window; notes updated; ZP4 async + ZP6 added (29/29; m5 kills ZP4/ZP6). Run 2 (final tree) started alone -> a-round-304/perf-run.log.
