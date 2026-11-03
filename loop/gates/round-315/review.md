COMMIT: OK

## Code Review: round 315 (PERF-5 stage 2: peaks.client.ts, ArrangementContext.tsx, peaks-worker tests, docs 163/228)

I reviewed the diff and the call sites it touches. I did not review the whole module. This change touches no auth, purchase or download code. C also lists G315-AUTH as passed. The diff adds no UI or styles, so accessibility and Tailwind/tokens aren't affected. TS strict holds: there is no `any`, no `@ts-ignore` and no `as` cast, and `importOriginal<typeof import(...)>` is a generic argument, not a cast. The verify log shows 236 test files and 3504 tests passing, Biome with no fixes applied, and the build passing.

### Critical Issues
- None.

### Suggestions (most important first)
1. **One failing timer test can break the tests after it** (`peaks-worker.test.ts:678`). The `PW12-PW13` group's `afterEach` never calls `vi.useRealTimers()`. PW13b, PW16 and PW17 switch the fake timers off only on their last line (`:764`, `:797`, `:823`). If one of their assertions fails, fake timers stay on for the next tests, and the real cause gets hidden behind unrelated failures. **Fix:** add `vi.useRealTimers();` to the `afterEach` at `:678`.
2. **PW18 only unmounts when it passes** (`peaks-worker.test.ts`, `view.unmount()` at the end of PW18, about `:663`). If it fails, the provider and its stubbed `AudioContext` and Worker stay mounted. **Fix:** keep the view in a `let` and unmount it in `afterEach`, as `peaks-worker-video.test.tsx:197-210` already does.
3. **Two test gaps C found (C-R315-T1/T2)** that no test catches today:
   - PW14 measures time relative to the constant, so changing `10_000` to `5_000` still passes.
   - An unreadable message ending the 10 s first-reply wait also goes unnoticed (`peaks.client.ts:202-204`).
   - **Fix:** add `expect(PEAKS_WORKER_COLD_START_TIMEOUT_MS).toBe(10_000)`. Add one test that sends a junk `onmessage` before the first reply, waits `PEAKS_WORKER_STALL_TIMEOUT_MS`, and checks there are no results and no terminate.
4. **Several sources finishing during playback restart the audio graph once each** (`ArrangementContext.tsx:3936-3939`). If the user presses Play while the demo collection is still loading, each source with a clip forces `startGraph` again, up to 9 times in a burst. Each restart retires the old graph and hands over at `startAt`. This is correct, matches what the video path already did (`:2513-2516`), and runs only while playing; `syncPlayback` returns early otherwise (`:1256`). The risk is clicks at the handover points, which tests can't detect. **Fix (later, not this round):** collapse the restarts into one per frame or microtask with a pending flag.
5. **Loading sources are now left out of export without warning** (`ArrangementContext.tsx:3593`, `:3687-3691`). Export used to see a loading source's buffer. Now it renders silence for that clip until the source is ready. This is intended (the "buffer appears only together with ready" rule), is recorded as B-R314-EXPORT-LOADING-GATE, and the doc says it can't be reached in `/studio-lab` today. Library preview is already protected (`:1481`). **Fix:** the export gate under SRW-21, as planned.
6. **One bad buffer can stop the fallback for the jobs behind it** (`peaks.client.ts:82`, `:113-115`). `computePeaksOnMainThread` runs outside the `try`. If it throws inside the `failWorker` loop, the remaining jobs get nothing and those sources stay `loading` forever. This is unlikely with a valid `AudioBuffer`, and doc 228 already lists it as a TODO. **Fix:** catch errors per job inside the loop and send them to the same timer rethrow.
7. **`dispose()` doesn't reset `workerReplied`** (`peaks.client.ts:256-268`). The context makes a fresh computer after unmount (`ArrangementContext.tsx:705`, `:712-713`), so this can't happen today. It is documented.
8. **Doc error** (`228-perf-peaks-worker.md`, the "Browser (C round 314, stage 1)" line). C says the stage-1 browser checks ran in round 312. **Fix:** change it to round 312.

### Good Practices Found
- **The new `syncPlayback` dependency won't reload the collection.** I traced the chain: `syncPlayback` depends only on `startGraph`, which depends on `fillLoopIterations`, `fillMetronomeHorizon` and `releaseRetiredGraphs`. All three have empty dependency lists (`:963-1029`), so the load effect at `:3956` won't run again.
- **The order inside both callbacks is right.** Each one checks the guard, then sets `buffersRef`, then updates state, then runs `syncPlayback` synchronously. So `startGraph` sees the buffer in the same macrotask as `ready`, and React 18 batches the two state updates into one render.
- **`deliver` keeps a callback's error from breaking the queue.** The next job still starts, `failWorker` still delivers every job, and the error is rethrown on a timer. It can no longer reach the collection's `.catch` and turn a `ready` source into `error`.
- **Timers are cleaned up.** The tests check `vi.getTimerCount() === 0`, including when `postMessage` throws on `end` or `cancel`.
- **An empty buffer no longer starts a worker** (PW20).
- **Replies are still checked with a validator**, not a type cast.

### Architecture note
- signal: `ArrangementContext.tsx:2506-2517` and `:3924-3940` contain the same "source ready" block twice: set the buffer, set the peaks, mark ready, re-sync if a clip uses the source. This is a cost from changing the same code more than once: this round had to edit both sites together, and a test missed on one site would have let them drift apart. It also adds lifecycle to an existing owner (signal 4).
  → **Keep it for now.** The two sites use different guards (the video check `videoSourcesRef.has`) and different state setters (`settle` vs `patchSourceState`). The rules around audio timing and refs are what matter here, and both are covered by PW18 and PW19.
  → **Proposal for the planner:** one small task to pull out a `commitDecodedSource(sourceId, buffer, peaks)` helper inside the provider. It would do the buffer set, the peaks set and the conditional re-sync, while each caller keeps its own guard and ready setter. To be accepted, PW11, PW18 and PW19 must pass unchanged, the `useArrangement()` shape must stay the same, and there must be no new dependency in the load effect. This is a proposal only, not something to do this round.

### Alternative Approach (critical logic: when playback gets a source's buffer)
- **Current:** the buffer reaches playback only together with `ready` (after peaks are done), plus a forced re-sync while playing.
- **Alternative:** put the buffer in `buffersRef` right after decoding, as before, and keep only the label on `ready` tied to peaks.
- **Verdict:** keep the current approach. With the alternative, playback and export would use a source the UI still shows as `loading`, which is the inconsistency L3 was about. The cost of the current approach is a short silent gap for a clip while its peaks run in the worker (well under a second normally, at most the 10 s worker timeout), and the re-sync then brings it in. Suggestion 4 covers the burst of restarts.

### Score: 8.5/10