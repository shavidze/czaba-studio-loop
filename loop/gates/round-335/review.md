COMMIT: OK

I read the whole diff and cross-checked it against `perf/studio-lab-interactions.perf.spec.ts` in the repository. I didn't re-run `verify` or the perf run. I'm relying on the passing `verify.log` and `c-round-335.json` you cited.

## Code Review: perf/studio-lab-interactions.perf.spec.ts, perf/budgets.interactions.json, docs 168 and 232

**Scope check:** The four paths are two perf artifacts and two implementation docs. No `app/`, auth, cart, checkout, download or purchased-asset code is touched. The security checklist and error-taxonomy items don't apply: there are no tokens, no HTML rendering and no API calls. The spec only drives the Studio lab page.

### Critical Issues
- None.

### Suggestions (ranked, none blocking)
1. **`perf/studio-lab-interactions.perf.spec.ts:~468–486` (`measureLaneDrag`): button left down on failure.** `readLaneGhosts` or `nowIn` can throw after `mouse.down()` and before `mouse.up()`. The mouse button then stays pressed and the next step in the pass starts mid-gesture.
   - `measureDrag` has the same exposure, so this isn't a regression.
   - Fix: wrap the gesture in `try { … } finally { await page.mouse.up(); }`, or call `page.mouse.up()` in the `runInteractionPass` catch path. Do this when c3-ii touches the file.
2. **`spec:~496–504`: denominator and numerator use different move sets.** `perMove(wholeCommits, moves.length)` divides by all 32 moves, including the first. The commits are counted only after `firstMove`. This matches `measureDrag` (lines 382–400), so the rows stay comparable with the existing drag rows, and `movesInWindow` is recorded in the detail. The doc's "32 move = first + 20 + 11" accounting is correct. No change needed; keep it consistent if c3-ii copies the pattern.
3. **`spec:~468–469`: magic arithmetic.** `dragSteps / 6` and `dragDistancePx / 3` are exact only for 60 and 120. Declare `laneSegmentSteps` and `laneSegmentPx` constants next to `dragSteps` (line 50) so a later edit can't produce non-integer steps. The `interactionSequence` strings repeat the same arithmetic.
4. **`perf/budgets.interactions.json`: the notes are about 400 characters repeated 26 times.** This is harmless but expensive to edit. Generating the rows from a shared gesture string, if the budget file has a generator, would help. Not needed now.

### Good Practices Found
- No `any`, no suppressions, no type assertions. `Locator`, `PlaybackState` and `PerfSample` are typed, and `closest(...)?.getAttribute(...) ?? null` handles nulls explicitly.
- Real-browser event ordering is handled correctly:
  - There is a double-`requestAnimationFrame` settle before reading ghosts, instead of `waitForQuiet`, which would have swallowed the window (L37).
  - `t1`, `t2` and `t3` are taken in-page, around the actual gesture segments.
  - The lane window excludes the cross window, so the two row sets can't double-count.
- The liveness check is strict. Four named conditions (a)–(d) each write a distinct problem, and `setLive` only sets 1 if both the stopped and playing runs pass. The mutant `MU-LANE-NO-CROSS` was reported to turn it red.
- The reset path restores state, and it checks both the lane and the Undo title. `resetAfterDrag` verifies the Undo title returns to its start entry.
- New rows are `record` with `budget: null`, so no existing assert gate can regress. This matches L58.
- The `deterministic` / `wallclock` split follows whether a window's boundaries come from in-page timestamps.
- The spec adds no listeners or timers. The only new async primitive is a one-shot `requestAnimationFrame` Promise, which resolves on its own.
- No UI, Tailwind or accessibility surface is touched.
- The implementation docs are updated: the `232` status line, changed files, problem/solution, testing and TODO, and the new `168` sequence steps and row explanations.

### Architecture note
- signal: `perf/studio-lab-interactions.perf.spec.ts` (`measureDrag` ~336 and `measureLaneDrag` ~449) is a mixed-responsibility and repeated-change signal. The window and sample bookkeeping (`put`, `perMove`, `startTasks` and the `downAt/up/firstMove` derivation) is duplicated between the two functions, and PERF-DRAG-PREVIEW has now changed this region over several rounds. → keep for now. The duplication is about 15 lines, and the invariants (timing windows, deterministic vs wallclock rows) are guarded by C's row comparison, so extracting a helper mid-stage risks changing the existing row values. Proposal for the planner, as one bounded task after c3-ii lands: extract a `dragWindow(whole)` helper that returns `{moves, firstMove, up, release}` and a shared `putRow` factory inside the perf spec only. Acceptance is zero `DIFF` in `perf-rowcmp` versus the C round 335 run and an unchanged `budgets.interactions.json`. Cost: low. Risk: low.
- This only covers the diff above. It isn't a full-module audit.

### Alternative Approach
Not critical business logic (perf harness only), so there is none to compare.

### Score: 9/10