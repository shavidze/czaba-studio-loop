COMMIT: OK. Nothing in this diff should block the commit. The one change that could break existing audio flows, the new `stop(when)` guard, behaves exactly as before for every current caller (shown below).

## Code Review: `graph.client.ts`, `graph.test.ts`, `224-perf-commit-reschedule.md`

### Scope
- **Files:** the commit touches only the three paths in `paths.txt`. `untracked.txt` is empty.
- **Auth, purchase and download code:** not touched.
- **Studio behaviour:** the diff adds no listeners, timers, effects or state. It touches no render path, Tailwind classes or accessibility surface.
- **TypeScript strict:** passes. `type ReplaceShapes = Parameters<ReturnType<typeof startFixture>['replaceClips']>[4]` derives the type without a type assertion. Making `clipFades` and `clipEnvelopes` required compiles because `replaceClips` has no callers outside the tests.
- **Verify log:** 234 test files and 3478 tests passed, and the production build completed.

### Why existing callers behave the same
The guard changed from `stopAt <= ctx.currentTime` to `stopAt <= (when ?? ctx.currentTime)` (`graph.client.ts:324`, `:338`).
- `ArrangementContext.tsx:1015` and `:1022` call `stop()` without a time, so the new expression is the same as the old one.
- `ArrangementContext.tsx:1093` calls `previous.stop(stopAt)` exactly once on the live handle. Only the earlier `stop()` calls or `replaceClips` set `stopAt` on a source, and the live handle has had neither. `replaceClips` has no callers (I searched `app/` outside the tests), so every `stopAt` is still `null` at that point and the guard result is unchanged.
- When `stopGraph` later calls `entry.handle.stop()` on retired handles, it passes no time, so this matches the old behaviour too.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low: the evidence won't last** (`224-perf-commit-reschedule.md:299–302, 347, 361`). The doc closes PERF-COMMIT-RESCHEDULE by citing `tmp/studio-real-loop/b-round-307/probe/*.json` and `tmp/studio-real-loop/a-round-308/mutant-*`. Those paths are outside the repository and will disappear. The key numbers are copied into the doc, so the decision can still be reconstructed.
   **Fix:** copy the probe JSON summaries into `docs/` (for example next to the implementation doc), or mark the `tmp/` paths as temporary in the doc.
2. **Suggestion: compute the stop time once** (`graph.client.ts:324/327`, `:338/341`). `when ?? ctx.currentTime` is evaluated twice per source in each of the two loops, and `ctx.currentTime` is read live every time.
   **Fix:** put `const at = when ?? ctx.currentTime;` at the top of `stop()` and use `at` in both the guard and the `stopAt` assignment. This removes the repeated expression and the chance of reading two different times.
3. **Suggestion: tighter check in RC13** (`graph.test.ts`, `expect(clicks.length).toBeGreaterThanOrEqual(1)`). The test passes two clicks, and `startClicks` creates one source per click.
   **Fix:** use `toBe(2)`. As written, the test would still pass if one click silently disappeared.
4. **Note (checked, not a bug): browser event ordering.** The new "move the stop earlier" branch could call `source.stop(when)` with a time already in the past, on a source that has stopped but whose `onended` has not fired yet. The Web Audio spec allows calling `stop()` again, and the call has no effect once the source has stopped. No current caller passes a time in the past.

### Good Practices Found
- Stops can now only move earlier, which closes the gate-307 F1 trap. Chromium applies the latest `stop()` call, so a later `stop(when)` would have overridden a stop that `replaceClips` set earlier.
- The new mutants (MU-CLIP-STOP-LATER, MU-CLICK-STOP-LATER, MU-STOP-ONCE) each fail on RC12, RC13 or M10. That shows the tests actually check the guard.
- Making `clipFades` and `clipEnvelopes` required removes the case where leaving a map out silently deleted the fade or envelope (F5).
- The test-only type derivation and `noShapes` respect the rule not to edit the existing imports in `graph.test.ts`.
- The only new comment is a TODO, which `CLAUDE.md` allows, and it points to the implementation doc.
- The doc keeps measured facts (D-29z817) separate from untested assumptions (D-29z819).

### Architecture note
- **Signal 3, the same costly region keeps changing:** `graph.client.ts:310–319` and `:422–431` are identical prune blocks, and `:322–351` is two parallel stop loops. Rounds 307 and 308 both changed this closure, and each round needed recording test doubles and mutant runs.
  - **Keep it for now:** `replaceClips` has no caller and the feature has been closed on the evidence, so pulling the code out now gains nothing.
  - **Proposal for the planner:** do the bounded task already drafted in the doc's TODO ("Source registry-ის გამოყოფა") before any `replaceClips` caller is added. Limit it to `graph.client.ts`: prune, `stopAt` and `activeSourceCount`. RC6, RC10, RC12, RC13 and M10 should keep passing with unchanged behaviour. This is a proposal, not something to fix in this round.

### Alternative Approach (critical logic: audio stop semantics)
- **Current:** one guard skips a source if it has ended or if its existing stop time is at or before the requested one. So a stop can move earlier but never later.
- **Alternative:** have `stop(when)` skip any source that already has a `stopAt` (first stop wins, the MU-STOP-ONCE mutant).
- **Verdict:** keep the current approach. The alternative would break an immediate `stop()` after a stop scheduled for the future: `stopGraph` → `entry.handle.stop()` on a retired handle with `stopAt = startAt` would leave the audio playing until `startAt`. M10 and RC13 correctly fail on that mutant.

### Score: 9/10