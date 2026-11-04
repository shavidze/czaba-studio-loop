# B round 336 -> 337 planning checkpoint
- 2026-11-04: tasks/round-336.md archived (cmp equal). Round 337 = SYS-R336-PERF-DRAG-WINDOW (planning before 2026-11-05, D-29z1021).
- Next: verify S1 premise, build sketch in scratch, run perf on sketch, code-reviewer on sketch diff, then write task/backlog/status.
- sketch applied to /home/runner/b336-scratch/sc (apply-sketch.py; patches in b-round-336/sketch/); typecheck rc0. Next: perf run on sketch -> b-round-336/perf-sketch.log
- v1 perf: 139 EQUAL/0 DIFF/0 NEW (perf-rowcmp-sketch-v1-vs-c335.txt). v2 (RV-1..3) perf running -> perf-sketch.log. v2b = v2 + 4 more notes (58). Next: rowcmp v2, budgets v2b into sc, notes check, perf-lib, mutants P/M/D, claims, then backlog/feature-status/task finalize.
- DONE: current-task.md (round 337), backlog v296 (D-29z1023..D-29z1030), feature-status, b-round-336.md, b-next.json CONTINUE; claims re-run after the last edit (stderr empty); store clean f1def9c.
