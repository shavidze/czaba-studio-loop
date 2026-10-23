COMMIT: OK — I found nothing that blocks this commit. No auth, purchase, download or protected-file code is touched; the only download logic in the diff is test assertions.

## Code Review: round-103 (`export-wav.client.ts` plus 3 test files and 2 docs)

I read the two required primitives (`SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md`) and `architecture-checkpoint.md`. This reviews the diff only; I did not audit the full module.

### Critical Issues
- None.

### Suggestions (ranked)
1. **The 30-second silence before the first `progress` is the riskiest point, and no test or C report I read measures it** (`export-wav.client.ts:99` arms the timer right after `postMessage`). Before the first `onProgress(0)`, the worker loads its module, runs `measureExportOverload` over every sample, and clamps in place (`export-wav.ts:65-70`). Nothing is sent during that time. On a fast machine this is far under 30 s, but a long stereo project on a slow or ×6-throttled CPU is the case most likely to trip the stall. **Fix:** make the WD-SLOW gap from `postMessage` to the first `progress` a required, cited number in C's report. If it gets anywhere near 10 s, have the worker send `progress 0` before `measureExportOverload` instead of raising the timeout. That change belongs to the planner, not this round.
2. **The "30" is written twice** (`export-wav.client.ts:10` and `:13`): the stalled message hardcodes `30 წამი` while the timeout is a separate constant. EW8f pins both, so a change gets caught, but they can still drift. **Fix:** build the message from the constant (`${ARRANGEMENT_WAV_WORKER_STALL_TIMEOUT_MS / 1000} წამი`), or leave it as is. It's cosmetic.
3. **The worker's error text is appended with no length limit and in English** (`export-wav.client.ts:53-58`). An engine string like "Array buffer allocation failed" lands inside the Georgian `role="alert"` (`ArrangementContext.tsx:2753/2825/2957`). It renders as a React text node, so there is no XSS risk. It is a UX and accessibility issue: a screen reader reads out a long English string. The doc already lists this as a TODO. **Fix:** a separate task to cap the length (around 120 characters) or map known engine messages.
4. **CU10 depends on the exact number of microtasks** (`export-cancel-ui.test.tsx:37-42`, `removeEventListener` must have been called exactly once before `cancelExport()`). This is deliberate and documented (m7). The test turns red instead of silently falling back to the CU4 path. But any change to the number of `await`s in `exportMp3` or `raceArrangementExportAbort` will break it, and the failure won't look like a real bug. **Fix:** none needed now. Add a one-line note to the bug or backlog index that a red CU10 after a refactor means "recount the microtasks", not a regression.
5. **Doc 091 status line** (`091-...md:4`) still says "C-ის შემოწმებას ელოდება", although `c-round-103.json` is PASS. This follows the existing pattern: 090's status was updated one round late, in this round. **Fix:** optionally change it to `C PASS (Round 103)` in this commit so the docs don't lag a round.

### Checked and found sound (things tests can't easily show)
- **Event ordering and leaks:** all five ways the promise can finish go through `detachWorker`. It clears the timer, removes the abort listener, nulls all three handlers and calls `terminate()` once. After a stall, a late `complete` or `progress` has no handler left, so it can't call `terminate()` a second time or call `onProgress`. `handleAbort` is used inside `detachWorker` before it is declared, but it is only ever called after its declaration, so there's no TDZ problem. The `return` after the `postMessage` failure stops the timer from being armed after the promise has already been rejected.
- **Background tabs:** timer throttling only delays the timer, never fires it early. A worker that dies silently (for example, an OOM kill with no `onerror`) now ends in a clear error instead of hanging forever.
- **Render cost:** none. Nothing new is rendered. Progress forwarding is unchanged and still once per whole percent (`export-wav.worker.ts:20`).
- **TS strict:** no `any`, no `@ts-ignore`, no type assertions, semicolons present. `onerror = () => fail()` correctly keeps the `ErrorEvent` from reaching `fail(message?)`. `tsc` and Biome are clean in `verify.log`; the 99-line Biome mention is old and in an unrelated component.
- **Tailwind/tokens:** no UI or CSS in the diff.
- **Error taxonomy:** this is client-side Studio error text, outside the 50001–50399 backend ranges, so the taxonomy doesn't apply.
- **Verify:** 144 files and 2254 tests pass, and the build is green.

### Good Practices Found
- The timer resets on each message rather than capping total time, so long projects on slow machines aren't failed wrongly. The doc gives the reasoning.
- The error-text change is backward compatible: a blank message, `onerror` and `onmessageerror` all return exactly the old constant.
- The PU tests in `export-progress-ui.test.tsx` now run on their own (`-t "PU2"`). The `it` bodies are unchanged, and the `import gate` dependency is now explicit in `describe`.
- Mutation evidence is listed (m1–m8), along with which tests fail before the fix, per test.

### Architecture note
- Signal 4 (new state/lifecycle in an existing owner): `export-wav.client.ts:37-69`. A timer and `detachWorker` were added to the worker-bridge promise. **Keep it:** the timer, the abort listener and the worker handlers share a single lifecycle, which ends when the promise settles. Splitting them up (for example, a generic `withWatchdog`) would scatter cleanup across files and bring back the double-`terminate()` bug that code-reviewer already caught. Extracting has low value and real risk.
- Signal 3 (one region changed repeatedly at high cost): the `exportMp3` cancel/abort ordering in `ArrangementContext.tsx` has needed new microtask-sensitive tests over several rounds (CU4, and now CU10). **Proposal for the planner (not approved scope):** one bounded task to document, in `docs/technical/`, the export pipeline's abort contract: who removes which listener, and when `signal.aborted` is checked. Acceptance: CU1–CU10 stay unchanged and green, with no code changes. Doing this before any refactor of `exportMp3` would make CU10 less fragile.

### Alternative Approach (export pipeline, which is critical logic)
- **Current:** a 30 s inactivity watchdog in the main-thread bridge, reset on every `progress`.
- **Alternative A:** a single cap on total time, scaled by sample count. It's simpler, but a constant per-sample rate has to be guessed, and that guess fails slow machines in exactly the cases the current approach handles.
- **Alternative B:** a heartbeat from the worker (`setInterval` inside it). It doesn't help, because a stuck synchronous loop blocks the worker's own timers, and it adds traffic.
- **Verdict:** the current approach is better. It only fires when the worker is actually silent, and it needs no change to the worker protocol. Its one weak spot is the silence before the first `progress` (Suggestion 1). The fix for that is an earlier `progress 0` from the worker, not a bigger timeout.

### Score: 9/10