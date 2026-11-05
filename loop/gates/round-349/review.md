COMMIT: OK

**Scope:** The change touches only three files: the implementation doc 232, `perf/budgets.interactions.json` and `perf/studio-lab-interactions.perf.spec.ts`. There are no untracked files. `app/`, auth, purchase and download code are not touched. Runtime and bundle code are not affected, so render cost, accessibility, Tailwind and tokens do not apply. The spec is not covered by Biome, so the "TS strict" check below rests on reading it and on A's recorded `npm run typecheck` rc 0 and `npm run lint` rc 0. I did not re-run either.

**Findings, ranked:**

1. **Low, `perf/studio-lab-interactions.perf.spec.ts:1752-1773`.** Run time is the main risk.
   - **Evidence:** The doc records `durationMs` 490693, 55% of the 900000 ms timeout and 91% of the 540000 ms STOP. D-29z1108 accepted this and froze new rows on this spec.
   - **Fix:** Nothing for this commit. Before any further row, apply ROOT-REQ-PERF-TIMEOUT or split the spec.

2. **Low, `perf/studio-lab-interactions.perf.spec.ts:1752-1762`, event ordering.**
   - **What is fine:** Each playing drag is preceded by Home inside `measureDrag` (`:421-426`), so the seek happens before the grab. Each drag is undone with Ctrl+Z in `resetAfterDrag` (`:494`). The pointer-up path uses the existing `pressedGesture`. No new listeners or timers are added, so there is no leak.
   - **Issue:** The video trim and fade grabs depend on the timeline being at x≈0. Zoom keys anchor on the playhead, and the M1 ruling accepts this because a missed grab fails loudly. The first stopped drag is the only one with a known start state. After the stopped fade, `resetAfterDrag` must restore the scroll position for the playing trim to find its grab point.
   - **Evidence:** Sketch run 6/6 live over 3 passes, plus A's own run (252 rows, 70/70).
   - **Fix:** None needed. If this turns flaky, add a Home press before the first playing video drag.

3. **Info, `perf/studio-lab-interactions.perf.spec.ts:1757-1759`.** `setLive` ANDs with the previous value (`:302`). The unconditional `setLive(..., true)` after the loops therefore cannot hide a failed drag, and liveness stays honest.

4. **Info, `perf/budgets.interactions.json:2741-2983`.** All 22 new rows are `record` with `budget: null`. That matches L58, which says asserts follow only after C's measurement. The `kind` values are copied from the existing video rows. The `video-trim.playing.move-components-per-move` row is `wallclock` because it copies the existing playing video-move row. The doc already explains this. The 70 assert rows are unchanged.

**Architecture note:**
- **Signal (repeated costly change, `perf/studio-lab-interactions.perf.spec.ts`):** Many rounds have extended this one harness, and it is now the run-time bottleneck.
- **Keep for now:** The measurement invariants, such as the shared `measureDrag` windows and the Undo reset, stay identical for all gestures. Extracting now would risk those semantics.
- **Proposal for the planner:** One bounded task, ARCH-R339-DRAG-MEASURE-EXTRACT. Split the interactions spec by gesture family, for example video and lane/group in a separate file. Move `measureDrag`, `dragTarget` and `DragMeasure` into a shared helper under `perf/lib`. The acceptance criteria are:
  - The row set (252 ids) stays identical.
  - The 70 asserted rows stay green.
  - Each file's `durationMs` is well under the timeout.
- This note covers the diff only. It does not claim the module was fully reviewed.

**Alternative Approach:** Not applicable. This is not auth, checkout or the audio pipeline. The change only adds measurement rows.

**Score: 9/10**