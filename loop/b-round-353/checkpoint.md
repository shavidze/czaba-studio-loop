# B round 353 -> 354 checkpoint
- [x] tasks/round-353.md archived (cmp equal). l57-check on c-round-353.json: rc 0 (l57-check-c353.txt).
- [x] Shape: 12 of 22 rows convert (deterministic, equal samples in C350); 10 stay record (8 wallclock paint-p95 + playing per-move, 2 release-restarts... see task). video-fade release-commits (2/2) stays record -> PERF-CAND-FADE-RELEASE-COMMITS.
- [x] Scratch /home/runner/b353-scratch/sc = HEAD a55543b archive + sketch/budgets.patch.txt (84+ 48-), 252 rows, 82 assert.
- [x] Mutant mu/m-b2p = sc + b-round-350/mutant-M-B2prime.diff.txt (dock subscribes to the preview store).
- [ ] perf runs (run-sketch-perf.sh, background) -> perf-summary.txt
## Prediction written BEFORE the runs (L58)
- sketch: rc 0, 252 rows, 82/82 asserted pass, 0 NEW, no deterministic row higher than C350.
- M-B2prime: RED certain = the 6 new component asserts (video-trim stopped per-move, video-trim stopped/playing max, video-fade stopped per-move, video-fade stopped/playing max).
  Likely also red: existing component asserts of audio trim/fade/move/lane/group and video move per-move (the dock re-renders on every preview write, whatever the clip).
  GREEN: every release-commits, move-restarts and *-live assert.
- [x] sketch run: rc 0, 82/82, 0 NEW, 0 higher, 488086 ms. tech-lead review 0 Medium+, TL-R354-1/2 applied (notes only; budgets-run1.sha256 vs budgets-dispatched.sha256 differ only in 12 note strings).
- [x] M-B2prime run: rc 1, 16 red = the 6 new video component asserts + 10 audio trim/fade/move asserts; lane/group/video-move per-move NOT red (my "likely" guess was partly wrong; recorded as is).
## Prediction for M-B2 (b-round-350/mutant-M-B2.diff.txt: dock selects the video lane clips again), written BEFORE the run
- RED: video-trim stopped per-move, video-trim max (both), video-fade stopped per-move, video-fade max (both) = the 6 new component asserts.
- GREEN: every audio trim/fade/move/lane/group asserts and every release/restart/live row (the video-lane selector does not change on audio drags).
- [ ] M-B2 run (run-mb2.sh)
- [x] backlog v317, feature-status, current-task, b-round-353.md, b-next.json written
