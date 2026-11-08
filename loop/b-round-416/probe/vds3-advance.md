# VDS3 advance probe (B, round 416 -> 417 planning, scratch /tmp/b416-scratch = HEAD 344a59f + make-sketch.py)
- Date.now frozen only (vi.spyOn(Date,'now')) + fakeClock.base -= 0.1, 6 flushes (with and without macrotask yields): play never called; position stays 0.0499999 -> the dock also gates on performance.now (ArrangementVideoDock.tsx runPlayingStep(clock, performance.now()) ~l.1057). Date-only freeze is NOT sufficient for VDS3.
- vi.useFakeTimers({ toFake: ['Date','performance'] }) + advanceTimersByTime(50) + one flushFrames: play called once (position 1.9e-7); file 5/5 green, -t VDS3 green.
- Same with advanceTimersByTime(100): play called 0 times (-t VDS3 and whole file both red). So the row advances exactly 50 ms (= PLAYBACK_LOOKAHEAD); a later first frame takes another path (not investigated further; not a source change in this task).

# BW5 window-read probe
- HEAD tempo.ts, BW5 with a counting window object (getters on fromPx/toPx): 442 reads, 190 marks.
- Full-build mutant MU-BW5-FULLBUILD (firstBar = 0, the `barTime*px > toPx` break removed): 6,784,880 reads, 190 marks (the existing 180-240 count bound stays green: it does not prove no full build); the test took 217 ms.
- Bound chosen: <= 1,000 reads (2.26x the windowed value; 6,785x below the full build).
