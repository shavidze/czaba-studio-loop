# B round 313→314 planning checkpoint
- tasks/round-313.md archived (cmp equal to current-task.md at start).
- C-R313-01 discriminating probe running: scratch /tmp/b314s (store tree + names instrumentation + __probeRelease detail), logs /tmp/b314-probe-run{1,2}.{log,json}, status /tmp/b314-probe.status.
- History scan: only in-run variation ever = fader.clipgain.playing.release-commits.6x (today's job); head-app-control also 92/2 => PERF-5a app cleared.
- Next: read probe -> rule (app idempotency vs harness window contract) -> write current-task 314 (A-DOC+A-REVIEW+C-R313-01), backlog, feature-status, b-round-313.md, b-next.json.
- PROBE DONE: run2 pass1 = 92/2; extra release commit +28 ms renders _0,D0,A0 = ArrangementRuler/ticks/playhead (timeline scroll subscription) -> Follow page turn during playback, not the clip-gain block. Ruling direction: harness confound fix (Follow off for playing faders + timeline scroll guard), rows stay exact.
- SKETCH at /tmp/b314k, saved b-round-313/sketch.patch.txt + sketch-*.txt; tsc 0, unit 34/34. Perf runs k1,k2 + mutant mu (/tmp/b314m: Follow-off removed + scrollLeft+=50 after up) running -> b-round-313/precheck-perf-{k1,k2,mu}.{log,json}. tech-lead consult running.
- TODO after runs: unit mutants (SCROLL1), claims script claims-314.sh + outputs, current-task.md 314, backlog v273, feature-status, lessons L37 clause, b-round-313.md, b-next.json.
- DONE (10:32:14): ruling D-29z841..D-29z844 written; current-task.md (round 314), b-round-313.md, b-next.json, backlog v273, feature-status, lessons L37, claims-314 head+sketch outputs. Nothing left from the TODO list.
