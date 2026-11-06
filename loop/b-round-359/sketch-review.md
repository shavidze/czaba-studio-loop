# Sketch review, round 360 (PERF-10a-BUDGETS)

Dispatched sketch: `b-round-359/sketch/budgets.patch.txt` -> `perf/budgets.interactions.json` sha256 `728ed85b08d422a5c878a790ca8c6daac9f818987197f7817d3cb880f1a0c8ed` (`budgets-dispatched.sha256`). Reviewers read files only (a perf run was in progress, L38).

## tech-lead (read-only; recomputed the sha by applying the patch in memory: match; 93 asserted of 252)
- **TL-R360-1 (info):** keep `== 1` for start/stop commits; `<= 1` would accept 0 commits (a Play button that never re-renders). For start-sources `==1` and `<=1` are equivalent because 0 is caught by `interact.harness.audio-running`. No new flake class: `perf/lib/report.ts` already checks every `deterministic` row (record or assert) for equal samples. Ruling: adopted.
- **TL-R360-2 (Low):** `<= 28` with no headroom is right. Ruling: adopted.
- **TL-R360-3 (Medium+, pending on B's runs):** each row has a predicted red mutant (MU-A: components, sources; MU-B: commits and the four fade rows; video clips share `ArrangementClip.finishGesture`). Accept only if B's runs show every row red at the median. No mutant tests the 0-commit side of `== 1` (info). Ruling: see "Mutant results" below.
- **TL-R360-4 (Low):** `.6x` as record acceptable; the spec passes no `crossRateMetrics`, each rate still gets its own equal-samples check. Ruling: adopted (D-29z1165).
- **TL-R360-5 (info):** nothing stops A or C: `==` is supported, `owner` is only checked as a string, `report.test.ts` reads the file only for commits-per-move rows (DC-KINDS). Tension: D-29z1151 calls the playing third fade commit intermittent but the row is deterministic, so a 2,3,2 split already fails today; risk pre-exists the patch. Ruling: recorded in the task §0.2.

## performance-optimizer (read-only)
- **PO-R360-1 (info):** playback ticks never commit to React: tick -> `updatePosition` writes the position store, listeners are DOM writers; Follow page turn sets `scrollLeft` + `notifyTimelineScroll()` (only the clip `inWindow` flag reads it, not flipped by a 1 s play from Home); the video dock is null without a video clip; meters re-render only when `over` flips. Ruling: adopted.
- **PO-R360-2 (Low):** the meter `over` latch could add +1 commit to start-commits if the played source overloads. Ruling: accepted risk, not a contract change. Evidence: 18 samples per row (C358 and C359, 1x and 6x, 3 each) all equal 1, plus B's sketch; `report.ts` already fails unequal deterministic samples in record mode (TL-R360-1), so a flip would already show today. If a run shows 2, L37's "name the extra commit" applies before any ruling.
- **PO-R360-3 (info):** start-sources == 1 is stable: the spec asserts 1 clip, metronome off by default, library preview stopped, Home before Space.
- **PO-R360-4 (info):** MU-A: one StudioWorkspace render already makes 29 (red without needing ~70); duplicate startGraph gives 2 sources. MU-B: the 100/200 ms writes land inside the windows and before the 200 ms quiet threshold; distinct texts so React does not bail out; the video fade handle uses the same `finishGesture`.
- **PO-R360-5 (info):** zero headroom on 28 and 3; the mutants show breaches larger than off-by-one. Ruling: the M-P1 prediction (+1 from the StudioWorkspace render alone) is the off-by-one case; B's MU-A result is the evidence.

## Mutant results (TL-R360-3)
From `perf-summary.txt` (production, alone, sequential):
- Sketch: rc 0, 93/93 asserted pass, 0 NEW, 0 DIFF vs C359 (`perf-rowcmp-sketch-vs-c359.txt`).
- MU-A: rc 1, 90/93; red exactly start-components 70, stop-components 70, start-sources 2 (predicted).
- MU-B: rc 1, 85/93; red start-commits 2, stop-commits 2, fade stopped 5, fade playing 4, video-fade stopped 4, video-fade playing 4 (predicted) plus start/stop-components 99 (recorded as possible in checkpoint.md).
TL-R360-3 is met: every asserted row is red at the median under a run mutant. 0 unruled Medium+.
