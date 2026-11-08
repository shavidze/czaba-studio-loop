COMMIT: OK. Status: I read the diff and the full `peaks.client.ts`, and checked the spec's `measureZoomKeys` direction logic and the fake-timer cleanup in the test file. I did not run any code. The checks below come from reading only.

## Code Review: peaks.client.ts, peaks-worker.test.ts, studio-lab-scale.perf.spec.ts, budgets.scale.json, docs 228/254/257

No auth, purchase or download code is touched. The commit has no UI, Tailwind or markup changes, no new `any`, no suppression directives and no type assertions. No new listeners were added. Every added `setTimeout` is either cleared (`stallTimer`) or is a one-shot rethrow.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low, `peaks.client.ts:70` and `:275-284`.** `requestingFailure` is not cleared in the `finally` block.
   - Today `failWorker` is the only writer, and it runs inside `startNext` before the `finally`, so nothing can leak.
   - If a later edit lets `startNext` throw after `failWorker` has recorded a failure, a stale error would be thrown by the next `request()`.
   - Fix: in the `finally`, set `requestingFailure = null` only on the throwing path, or call `takeRequestingFailure()` before rethrowing. This is already filed as TL-R402-SK2-L1.
2. **Low, `peaks.client.ts:129`.** `job === requesting` assumes a single synchronous request frame.
   - I traced a nested `request()` inside `onPeaks`, called from `handleReply`. After a worker failure the nested call goes straight to `deliverOnMainThread`, and `deliver` catches any error from it, so this is safe.
   - A nested `request()` that reaches `startNext` overwrites `requesting` and then sets it to `null` in its `finally`. The outer frame loses its marker, so an outer failure would go to `rethrowLater` instead of being thrown from `request()`.
   - Fix: save the previous value and restore it in the `finally` (`const prev = requesting; … requesting = prev;`). This matches TL-R402-SK2-L2.
3. **Low, `budgets.scale.json`, the 6× `note` fields.**
   - The notes cite `perf-sketch-scale.json`, but the values come from `-v2.json`. Doc 254 admits the 6× numbers differ (components 112.4 vs 121.1).
   - Fix: update the notes to name `v2`, so the JSON does not contradict its own docs. This is documentation only.
4. **Low, `studio-lab-scale.perf.spec.ts:~554-580`.** The 6× block restores `cpuRate` in a `finally`, but the CPU throttle is applied before the `try` begins.
   - If `setCPUThrottlingRate` throws, `result.cpuRate` stays at 1 and the `finally` never runs, so the throttle may persist. The effect is limited to the end of that pass, because each pass uses a fresh context.
   - Fix: move `result.cpuRate = throttledRate` and the `send` call inside the `try`. This is the same family as the deferred TL-R402-SK-L3.

### Good Practices Found
- The new logic does not call `onPeaks` more than once for any job. Aborted jobs are skipped, the pool is cleared, and `dispose()` now also resets `workerReplied`.
- A throw from the requesting job's main-thread peaks still reaches `request()`'s caller, so the existing `catch`/`.catch` handling stays intact. Errors from queued jobs go to a timer and no longer stop the delivery loop, which fixes the loop-abort bug.
- PW29 shows a throw from the requesting job leaves no pending timer, and PW27 shows the queued case does.
- The previously missing `vi.useRealTimers()` is added where it was missing. The `PW4-PW10` describe already had it.
- `unmount` in PW18 moved into `afterEach` inside a `try/finally`, so a failing assertion no longer leaks a mounted tree.
- In step i, `measureZoomKeys` keeps its defaults, so steps d and e are unchanged. The direction check handles `=` as the first key, and the returns to the starting zoom value and the restored `scrollLeft` are both self-checked.
- All 8 new rows are `record` with `budget: null`, so they cannot fail the gate. The first 23 rows are untouched.
- The `rethrowLater` helper replaces the inline duplicate.

### Architecture note
- signal: `peaks.client.ts:61-300` (new state/lifecycle in an existing owner; `requesting`/`requestingFailure` are a second control-flow channel next to `active`/`queue`/`workerFailed`).
  - Keep it for now. The state is small, the lifecycle is the same, and the public `SourcePeaksComputer` shape is unchanged. Extracting it would add plumbing for four variables, so the cost is medium and the benefit is low.
  - Proposal for the planner, as one bounded task: add an `onError` callback to `request()`. This is the already-recorded `A-R403-L2-RESIDUAL-QUEUED-THROW`.
    - Doing so would remove `requesting`/`requestingFailure` and the timer rethrow, and would give queued jobs a proper error state.
    - It changes `ArrangementContext.tsx` (an ownership change), so it needs a separate, approved scope.
    - Acceptance: PW26–PW29 are rewritten as callback assertions, and the `loading` residual for a queued job is gone.
  - `commitDecodedSource` (`ARCH-R315-COMMIT-DECODED-SOURCE`) stays a signal, unchanged.
  - I reviewed only this diff and the full `peaks.client.ts`. I did not audit the module's other consumers.

### Alternative Approach (critical logic: Studio audio pipeline)
- Current: a `requesting` marker plus `requestingFailure` lets `request()` rethrow only the requesting job's error synchronously. Every other job's error goes to a timer.
- Alternative: an `onError` callback on `request()` (see Architecture note).
- Verdict: the current approach is better for this commit. It keeps the existing caller contract (the video decode `catch`, the collection `.catch`) and needs no change to `ArrangementContext.tsx`. The alternative is cleaner long-term but changes an API owner outside this scope.

### Score: 8/10