COMMIT: OK

I reviewed the diff and the files it touches. I did not re-run the tests; I relied on C's PASS and the verify log.

## Code Review: studio-lab-demo.ts, demo-synth.ts, new SB1–SB6 test, docs 247 and 253

### Critical Issues
- None. The diff does not touch auth, purchase, download, token or Stripe code. It only changes `app/data/studio-lab-demo.ts`, removes one unused export from `app/lib/arrangement/demo-synth.ts`, and adds a test and docs.

### Findings, ranked
1. **Low – `app/data/studio-lab-demo.ts:95-99`, hidden tab.**
   - `setTimeout(0)` is throttled in a hidden tab, so the demo becomes ready about 1 s later there. Doc 253 accepts this.
   - I'd keep it. No fix is needed.
   - If it ever matters, the fix is to skip the yield when `document.visibilityState === 'hidden'`. That adds a branch without a failing test, so I don't recommend it now.
2. **Low – `studio-lab-demo.ts:108-109`, timer not cancelled on abort.**
   - An abort during the yield leaves the timer running. It fires within 0 ms and resolves once, so nothing leaks.
   - Both callers drop aborted loads: `ArrangementContext.tsx:1505` and `:1517` for the effect path, and `:4468` and `:4490` for the re-decode path. Their `.catch` handlers check `signal.aborted` first, so an abort rejection never shows as a source error.
   - No fix is needed.
3. **Low – `studio-lab-demo.ts:107-109`, the abort check comes after the await.**
   - If the abort happens while the worker is still running, the load only rejects once the worker resolves and the timer fires. This matches the earlier behaviour and is harmless.
   - The SFX branch (line 113) never checks the signal. Doc 253 states this and the callers ignore aborted loads. Fine.
4. **Info – `studio-lab-demo.ts:134-135`, memory and render cost.**
   - Both `copyToChannel` calls now read the same cached worker array. This saves a 3 MB `Float32Array` allocation per load.
   - The cached composition arrays are only read, never mutated, so sharing them is safe.
   - The five builds are queued in order, so they run in five separate timer tasks. SB4 pins this.
5. **Info – TypeScript and style.**
   - No `any`, no suppression directives and no assertions in the new code.
   - Semicolons are present. The test uses `vi.stubGlobal` with a fake class, which is not a type assertion.
   - No Tailwind or accessibility surface changed.
   - The "status text unchanged" claim (doc 253 L51) comes from the author, and I did not re-verify it.

### Suggestions
- None blocking. Doc 253 states its trade-offs and cites the real-browser evidence from C round 397.

### Good Practices Found
- The author measured before changing anything (long task 135–185 ms at 6× CPU), and the doc records it.
- The mono option was rejected with a reason: `StereoPannerNode` pans mono at about −3 dB, which would change what the user hears.
- Mutants were run for each assertion, and the SFX no-yield case is pinned by SB6.
- The new test cleans up with `unstubAllGlobals`, `useRealTimers` and `restoreAllMocks`.
- The removed `generateDemoStereoChannels` has no other importer; I grepped, and the only remaining mentions are in docs.

### Architecture note
- signal: `app/data/studio-lab-demo.ts:95-114` → keep. The yield sits next to the one place that awaits the shared worker promise, so it has a single owner and one lifecycle. Extracting it into a shared helper now would be a one-off abstraction.
- proposal for the planner, optional and not part of this round: if other collections (store previews) start to need the "one build per task" pattern, add one bounded task for a small `yieldToNextTask` helper in `lib/arrangement/` with its own test. Cost is low and no invariants are at risk.
- This is a review of the diff only. I have not audited the whole module.

### Alternative Approach (critical logic: Studio audio pipeline)
- Current: after the worker resolves, each load waits on `setTimeout(0)` and then builds its buffer, so the five builds run in separate tasks.
- Alternative: `scheduler.yield()` or `MessageChannel` instead of `setTimeout`.
- Verdict: keep the current approach. `scheduler.yield` is not available in every supported browser, and feature-detecting it adds a branch that has no failing-test path. `MessageChannel` has the same problem. `setTimeout` is available everywhere, and its only cost is the hidden-tab delay that was accepted.

### Score: 9/10