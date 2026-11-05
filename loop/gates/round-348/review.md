COMMIT: OK

## Code Review: drag-preview-render.test.tsx, budgets.interactions.json, 232-perf-drag-preview.md

I reviewed only the diff. `untracked.txt` is empty, so there are no new files. I did not run the browser perf spec myself. The perf numbers below come from the doc's claims about C's round 347 and A's round 348 runs.

### Critical Issues
- None. The diff touches no auth, purchase, download or production code. The three paths are one test file, one perf budget JSON and one doc.

### Suggestions (ranked)
1. **`drag-preview-render.test.tsx:~1952-1969 and ~2027-2044` (the DP63 and DP65 `try/finally`).** If `pointerUpAt` itself throws, `released` is still `false`. The `finally` then calls `pointerUpAt` a second time and can hide the original error behind a second throw. The risk is small and only affects failure diagnostics. Fix: set `released = true` before the release call, or wrap the `finally` release in its own `try {} catch {}` so the original assertion error survives.
2. **Same blocks.** After a failed assertion, the `finally` releases the pointer but skips `undo()`. The failed gesture's commit stays in the shared arrangement for the next gesture iteration. The test is already red at that point, so later failures may be noise. Fix (optional): call `undo()` in the `finally` as well, guarded the same way. Alternatively, note in the doc that only the first failure is meaningful.
3. **`budgets.interactions.json`, `interact.drag.fade.*.move-components-max <= 4` and `trim.*.move-components-max <= 15`.** These rows have zero headroom, which the notes say is intentional because the rows are deterministic. A future legitimate change that adds one component to a commit will turn them red. That is the intent of the gate, but the failure message should lead people to the `windowCommits` and `componentsSum` detail. The doc already says so (item 89), so no change is needed.
4. **`budgets.interactions.json`, `interact.drag.move.*.move-components-per-move <= 16`.** The 15.317 figure includes one 82-component commit when the drag crosses the project end. The budget therefore hides a steady-state regression of up to about 1.5 components per move. It is documented in item 91 and in the note, and it is tracked as PERF-CAND-MASTER-GROUP-FADER-PROPS. Fix: no action now. Do not tighten the budget to 15 before that crossing is fixed.
5. **Doc 232.** The doc is consistent with the diff. The 14 rows break down as 6 trim, 4 move and 4 fade, and assert rows go from 60 to 70 because the 4 fade rows were already assert. The status line, file list and TODO were all updated. Item 90 correctly leaves `fade release-commits` and the move `max` as `record`.

### Good Practices Found
- The `finally` has no `catch`, so assertion errors are not swallowed. The assertions and their order are unchanged.
- Each budget is the ceiling of the measured value from an independent C run. The doc backs this with three production mutants (MU-FINE-CLIPGAIN, MU-GROSS-PREVIEW, MU-COMBO) that go red on the new rows, and the red row ids match B's sketch.
- Previously silent `record` rows now guard against going back to the provider path.
- Owner and note fields were updated on every changed row. The change is JSON and test only, so no Tailwind, token, TypeScript strict or accessibility surface is touched.
- The diff adds no listeners, timers or render-cost code. It reduces a test-side leak, because the pointer is no longer left captured after a failure.

### Architecture note
- signal: `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` (~2000+ lines; DP63 and DP65 repeat the same gesture-loop and try/finally scaffold) → keep for now. The invariants are that the render-counter semantics and gesture lifecycle must stay identical across DP63, DP64 and DP65, and the helper cost of extracting them is not yet justified. Proposal for the planner (one bounded task): extract a `runGestureCycle(gesture, steps)` helper in the same test directory that owns pointerdown, pointermove, guaranteed release and undo. Acceptance: DP63, DP65 and any later DP row use it, all 67 tests pass unchanged, and a deliberately failing assertion leaves no pressed pointer. This repeated-edit signal (rounds 346, 347 and 348 all touched these blocks) is not a fix for this round.
- signal: the project-end crossing commit (82 components) is the one remaining spike in the move rows. It is already tracked as ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE and PERF-CAND-MASTER-GROUP-FADER-PROPS. No new note.

### Alternative Approach
Not critical logic (perf budgets and test hygiene), so this section does not apply.

### Score: 9/10