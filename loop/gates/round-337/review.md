COMMIT: OK

## Code Review: perf/studio-lab-interactions.perf.spec.ts, perf/budgets.interactions.json, docs 168 and 233

I reviewed the diff and read doc 233, the spec and the verify log. I did not re-run the perf run.

### Critical Issues
- None. The four paths are one perf spec, one budget JSON (note text only, per doc 233), and two docs. No auth, purchase, download, Studio runtime, audio engine or `app/` code is touched.
- The change introduces no new `any`, no type assertions and no suppression directives. The `pressedGesture<T>` generic is typed without a cast.
- The change adds no listeners, timers or other leakable resources.

### Suggestions (ranked)
1. **`perf/studio-lab-interactions.perf.spec.ts:~629-636`, `pressedGesture`.** When the gesture throws, `page.mouse.up().catch(() => undefined)` swallows the release error and rethrows the original. That is the right order. If `page.mouse.up()` itself fails on the success path, nothing handles it. That is acceptable because the pass aborts and its `catch`/`finally` closes the context. No fix is needed. If `runInteractionPass` ever continues after a failed drag, it will need a `mouse.up` guard first (doc 233 already records this).
2. **`perf/studio-lab-interactions.perf.spec.ts`, `measureLaneDrag`.** `t3` is now read inside the callback, before `mouse.up()`, and `tUp` is read after it. That matches the old order, so `backMoves` (`t > t2 && t < t3`) is unchanged. Keep `nowIn(page)` as the last statement of the callback. If someone adds a step after it, `t3` will go stale.
3. **Real-browser event ordering.** `pressedGesture` still does move → down → gesture → up, the same as before. `dragWindow` still takes the last pointerdown and the first pointerup after it. Commit and `start()` boundaries are unchanged: `firstMove < t < up` for the whole window, `t >= up` for release. The fade `<= 24` asserts and the `move-restarts == 0` assert therefore keep their semantics. Doc 233 reports 139 EQUAL rows and 0 DIFF against round 335.
4. **`perf/budgets.interactions.json`.** The note edits change wording only. The wording now matches the code: the denominator is all pointermoves from pointerdown to pointerup, the first included. The old text ("pointermoves in that window") was ambiguous.
5. **`laneSegmentSteps = 10` and `laneSegmentPx = 40`.** These equal the old `dragSteps / 6` and `dragDistancePx / 3`, so the gesture is identical. They no longer shift if `dragSteps` or `dragDistancePx` is edited.

I found nothing to fix in the diff.

### Good Practices Found
- Three small helpers (`dragWindow`, `rowWriter`, `componentsPerMove`) replace code that was duplicated in `measureDrag` and `measureLaneDrag`. The helper semantics are bit-identical, so no row value moves.
- Doc 233 proves the equivalence with row comparison, a notes-only diff check (58 notes changed, 0 non-note changes) and mutants P, M and D. This is good evidence that "equal" is not vacuous.
- The `interactionSequence` text now matches the actual run order (Ctrl+wheel runs after the last Space). I confirmed this in the spec: the wheel step is at line ~1330.
- Verify log: `fail 0` in the agents/unit phase.
- The docs are in Georgian, with the sections the implementation-docs rule requires.
- Tailwind and design tokens are not relevant here. Accessibility and render cost of shipped code are not affected either, since nothing under `app/` changed.

### Architecture note
- signal: `perf/studio-lab-interactions.perf.spec.ts:measureDrag` / `measureLaneDrag` (signal 3, repeated costly change to one region; this round already extracted `dragWindow`) → keep the current shape. The two functions now share the window and row-writing helpers. They differ in gesture and in cross/lane windows, so merging them would add parameters without reducing risk.
- The spec is large and holds gesture drivers, window math and row emission together. Possible proposal for the planner (not a finding for this round): one bounded task to move `dragWindow`, `componentsPerMove` and `rowWriter` into `perf/lib/`, with focused tests in `perf/lib/report.test.ts`. The cost is low. It depends on the existing ROOT-REQ-VITEST-PERF-INCLUDE (the `perf/lib` tests are not yet in the gate). It must not touch the row id or budget semantics.
- This covers the diff only. It is not a full audit of the module.

### Alternative Approach
Not applicable. This is not auth, checkout or the Studio audio pipeline. It is test-harness refactoring that changes no values.

### Score: 9/10