# B round 359 -> 360 checkpoint (written before any perf run)

- Round 359 closed PASS from c-round-359.json (browserVerified/realVerified true); gate 359 published a977b97 (baseline for 360).
- tasks/round-359.md = copy of current-task.md (cp -n, made first).
- Next: round 360 = PERF-10a-BUDGETS (D-29z1162 order; REGRESSION due 2026-11-08, not yet).

## Planned budget changes (perf/budgets.interactions.json, 1x rows only)
| row | now | after | C358 / C359 samples |
|---|---|---|---|
| interact.play.start-commits | record | assert == 1 | 1,1,1 / 1,1,1 |
| interact.play.start-components | record | assert <= 28 | 28x3 / 28x3 |
| interact.play.start-sources | record | assert == 1 | 1x3 / 1x3 |
| interact.play.stop-commits | record | assert == 1 | 1x3 / 1x3 |
| interact.play.stop-components | record | assert <= 28 | 28x3 / 28x3 |
| interact.drag.fade.stopped.release-commits | record | assert <= 3 | 3x3 / 3x3 |
| interact.drag.fade.playing.release-commits | record | assert <= 3 | 2x3 / 2x3 |
| interact.drag.video-fade.stopped.release-commits | record | assert <= 3 | 2x3 / 2x3 |
| interact.drag.video-fade.playing.release-commits | record | assert <= 3 | 2x3 / 2x3 |
Asserted 84 -> 93 of 252. .6x copies stay record (loaded replicate, L37).

## Predictions
- SKETCH: rc 0, 93/93 asserted pass, 0 NEW, values equal C359.
- MU-A = M-P1 (StudioWorkspace calls useArrangementIsPlaying() at its top) + M-P3 (startGraph called twice in startPlaybackAt):
  red: play.start-components (> 28, expect ~70), play.stop-components (> 28), play.start-sources (2). Fade rows green.
- MU-B = M-P2 (delayed status write 100 ms after setPlaying in start and stop) + M-F1 (two delayed status writes 100/200 ms after fadeCommitted in ArrangementClip.finishGesture):
  red: play.start-commits (2), play.stop-commits (2), fade.stopped (5), fade.playing (4), video-fade.stopped (4), video-fade.playing (4). Components rows may also go red through the status leaf (+1 per extra commit) -- recorded, not predicted as required.
