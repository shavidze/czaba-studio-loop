# B round 281 → 282 planning: checkpoint

- Inputs read: c-round-281 PASS (15 rows, browserVerified/realVerified true, 1 Low C-R281-01 planning), a-round-281, gate 281 published 000da42 (review 9/10, Lows 1-4 + info 5, two Architecture signals).
- Archived: tasks/round-281.md (copy of current-task.md). Backups: b-round-281/*-before-282.*.
- Next = PERF-2 (REGRESSION is not due until 2026-11-02).
- Measurements so far:
  - synth-node-timing.txt: composition 413 ms; impact 6 ms; rise 24 ms (Node).
  - loaf-head.json (HEAD prod build, 3 runs): long tasks = the first frame 83-131 ms (no script > 5 ms) + the synth effect 363-367 ms (MessagePort.onmessage).
  - loaf-sketch.json (sketch prod build): synth task gone; Worker.onmessage 46-53 ms; first frame 73-122 ms.
- Consults: tech-lead done (worker + client, sync fallback, FakeWorker stubGlobal, impact/rise stay sync, copy-drop optional); performance-optimizer pending.
- Sketch: /tmp/r282-sketch (client + worker + studio-lab-demo change + harness rows load.settled-ms, load.script-max (assert < 100), load.settled.longtask-max, load.settled.longtasks-over-50).
- Running: the full 3-spec perf run on the sketch → sketch-perf-run.log, sketch-results/.
- Next steps: equivalence vs c-round-281/run-1; mutants (worker forced to fail → sync fallback → script-max ≥ 300); write the task, backlog, feature-status, b-round-281.md, b-next.json, lessons (C-R281-01 L29 ruling).
- [04:5x] Sketch v1 3-spec run: 1b-i, 1b-ii passed; 1a failed only on nondeterministic load.commits [5,5,6] / load.components [371,371,464] (worker races the mp3). v2 = those two rows reclassified wallclock; v2 PERF-1a rc 0, script-max 42-63 (assert < 100 PASS), longtask-max 77-115 (first frame).
- export-head.json / export-sketch.json: WAV sha256 identical HEAD vs sketch (pulse 1fea093b…, all 7 synth sources 72228706…) at both viewports.
- equiv-check-r282.py written; v2-equiv-1a 0 problems, v1-equiv-1b-i 0, v1-equiv-1b-ii 0 (free: bytes + used-ready).
- Running: MU-SYNC-FALLBACK PERF-1a (mu-sync-fallback/).
- Done: task, backlog (v245), feature-status, lessons L29, b-round-281.md, b-next.json written. Final advisor check done (3 calls); MU-SYNC-FALLBACK mutation pinned in the task.
