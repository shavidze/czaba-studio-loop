COMMIT: OK. Nothing blocks the commit. No auth, purchase or download code is touched: the candidate paths are only arrangement peaks, ArrangementContext, the perf harness and docs. No UI, Tailwind or accessibility surface changed. TS strict holds: no `any`, no suppression directives, no type assertions; the typing uses `Float32Array<ArrayBuffer>` and the `isChannelList` / `readPeaksWorkerReply` checks. The verify log shows 235 test files and 3495 tests passing, and the build produced the worker file (`assets/peaks.worker-BSY34p46.js`, 1.11 kB).

## Code Review: round 314 (peaks moved to a worker + Follow/scroll guards in the perf harness)

### Critical Issues
- None.

### Suggestions (most important first)

1. **Medium. A throwing peaks callback can stall the queue or leave sources stuck.**
   - **The stall** (`app/lib/arrangement/peaks.client.ts:198-204`): in `handleReply`, `active = null` is set, then `job.onPeaks(reply.peaks)` runs before `startNext()`. If `onPeaks` throws, `startNext` never runs. The queue then waits until the 3 s stall timer calls `failWorker`.
   - **Stuck sources** (`peaks.client.ts:101-103`): in `failWorker`, if one `deliverOnMainThread` throws, every remaining pending job is lost. Those sources stay `loading` forever and show no error.
   - **Why this matters now** (`ArrangementContext.tsx:2507-2517`): in the video path, `setSourcePeaks`, `settle` and `syncPlayback` used to run inside `try/catch`, which turned any failure into `decode-failed`. They now run in an async callback outside that `try`.
   - **Fix:** in `handleReply`, use `try { if (!job.signal.aborted) job.onPeaks(reply.peaks); } finally { if (!active) startNext(); }`. In the `failWorker` loop, wrap each job in its own `try/catch`. In the video callback, catch errors and call `settle({ audio: 'error', audioNote: videoAudioNote('decode-failed') })`.
   - **Test:** add a PW test: "onPeaks throws, the next job still gets delivered."

2. **Medium-low. One false stall turns the worker off for the whole session** (`peaks.client.ts:87-89`, `:106-109`, `:211`).
   - The stall timer is re-armed only when a reply arrives. If the main thread is blocked for more than 3 s (6× CPU throttle, or a weak device during load), the timer and the worker's reply can both be queued, and the browser doesn't guarantee which runs first.
   - If the timer runs first, `workerFailed = true` stays set permanently. Every later source then computes peaks on the main thread, which is exactly the long task this work removes, and nothing reports it.
   - **Fix:** in the stall handler, check `performance.now()` against the time of the last reply (a measured interval rather than just the timer). Alternatively, allow one worker restart on the next `request` after a cooldown.

3. **Low. A request with an already-aborted signal still creates the worker and posts begin and cancel** (`peaks.client.ts:227-237`).
   - **Fix:** return early at the top of `request` when `signal.aborted`. Both current call sites check for abort first (`ArrangementContext.tsx:2495`, `:3921`), so this guards future callers.

4. **Low. A behavior change worth recording (not a regression).**
   - Collection sources now become `ready` one at a time, because one worker queue processes one job at a time (`peaks.client.ts:162-183`). Before, each source became ready as soon as its decode finished.
   - Between decode and peaks, `buffersRef` already holds the buffer while the state is still `loading` (`ArrangementContext.tsx:3924`, `:2506`). Nothing in the diff depends on that window, and the A perf runs passed. Add one sentence about it to `228-perf-peaks-worker.md`.

5. **Low. Docs and process.**
   - `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md`, in the "Rounds 313–314" testing paragraph, still says "C-ის შემოწმება მოლოდინშია" (C check pending). c-round-314 has passed, so update that line.
   - `perf/lib/report.test.ts` (LOAF2 and SCROLL1) is outside vitest's include, so `npm run verify` does not run it. The doc says so, but the gate depends on someone running the scratch config by hand. Consider a `test:perf-unit` script.

### Real-browser checks (results)
- **Listeners and timers on unmount:** `dispose` clears the stall timer, nulls the handlers and calls `terminate()`. The computer is created lazily (`??=`), so StrictMode's cleanup-then-setup doesn't leak it. Both paths check abort before calling `requestSourcePeaks`, so no worker is created after unmount.
- **Message ordering when a job is cancelled:** chunks of the old job already sent come back as acks with the old `jobId` and are ignored. The worker drops the job on `cancel` and then gets the new job's `begin`. This is correct.
- **Re-entrancy:** a `request` made inside `onPeaks` keeps the order (covered by test PW12).
- **SSR:** the module is `.client.ts` and is only called inside client callbacks after decode.
- **Harness:** `setFollowOff` clicks at most twice and then hard-asserts the mode is `off`. The `scrollLeft` comparison is exact. The extra 80 ms block in 1× passes is documented in `budgets.json` and in doc 163.

### Good Practices Found
- The streaming kernel `accumulatePeakChunk` is tested byte-for-byte against `computePeaks` across sample rates, lengths, chunk sizes and channel counts, including NaN, -0 and Infinity.
- At most 4 chunks are in flight, transferred buffers are reused from a pool, and the full `getChannelData` arrays are never copied to the worker in one go.
- Worker replies are checked at runtime (`readPeaksWorkerReply`) instead of being trusted as typed data.
- Every failure path falls back to the main thread: no `Worker`, constructor throws, `postMessage` throws, `onerror` / `onmessageerror`, and stalls.
- The harness fixes the 91/92 flake by removing its cause (Follow page turns) and adds loud scroll and Follow guards; no tolerance was loosened.

### Architecture note
- **Signal 4 (new state/lifecycle in an existing owner) at `ArrangementContext.tsx:702-716`:** a worker, a stall timer and a job queue are attached to the provider through one ref and one unmount-only effect.
- **Signal 2 (ownership change):** peak computation moves from the context into `lib/arrangement/peaks.client.ts`.
- **Keep, because:** the provider only sees a two-method interface (`request`, `dispose`), one ref and one cleanup. Audio timing, gesture refs, Undo/Redo and the shape of `useArrangement()` are unchanged, and the kernel and protocol are tested in isolation.
- **Proposal for the planner (one bounded task):** "Make the peaks client exception-safe." Ownership: `peaks.client.ts` plus the video callback. Acceptance: Suggestion 1 is fixed, and a new PW test proves the next job still runs after a throw. This is not a request to refactor anything this round.

### Alternative Approach (Studio audio pipeline)
- **Current:** one lazily created module worker per provider. Chunks are copied with `copyFromChannel` and transferred, at most 4 in flight, jobs run one at a time, and a 3 s stall timer falls back to the main thread.
- **Alternative:** compute peaks with `requestIdleCallback` time-slicing on the main thread, or send each whole channel to the worker in one transfer by copying `getChannelData`.
- **Verdict:** keep the current approach. Time-slicing still competes with the UI and transport during load, and the A/C perf rounds show the settled window is now free of long animation frames. A one-shot full-channel transfer would duplicate the whole buffer in memory at once. Bounded chunks keep peak memory at about 4 × 2 s × channel count. The cost is the serialized ready order and the stall false-positive risk (Suggestion 2).

### Score: 8.5/10