COMMIT: OK

## Code Review: round 283 (PERF-2: demo synth moved to a Web Worker, plus perf harness rows)

This review covers the 10 candidate paths only. I read the diff, the 4 new files, the load effect in `ArrangementContext.tsx:3844-3902` and `perf/lib/page.ts:114-129`. I did not check the whole module. I'm relying on C's PASS for round 283, `verify.log`, and the browser and perf evidence recorded in doc 211 (round 282, same code bytes).

### Critical Issues
- None.
- **No auth, purchase or download code is touched.** All paths are under `app/data`, `app/lib/arrangement`, `perf/` and `docs/`.
- **No markup or styles changed**, so accessibility and Tailwind/token checks don't apply.
- **TS strict:** no `as`, `any` or `@ts-ignore` written in the diff (one inferred `any`, see finding 1).
- **Leaks:** every worker exit path goes through one `finish` (`demo-synth.client.ts:59-66`). That covers a valid message, `onerror`, `onmessageerror`, a malformed message, a `postMessage` throw and the 10 s stall timer. Each one clears the timer, sets the three handlers to null and calls `terminate()` once. A late message after the stall fallback can't reach anything.
- **Top-level globals:** the client module has no top-level `window` or `document`. This matters now because the worker bundle includes it.
- **Abort and unmount:** the caller ignores results after an abort (`ArrangementContext.tsx:3876`, `3889`). The shared job keeps running and is reused after a remount or a StrictMode re-run, which is fine.
- **Load order in a real browser:** synth sources now race the mp3 decode. I checked that nothing in the load effect depends on which source finishes first: buffers, peaks and source state are keyed by `source.id`, and `settle` counts. Only `load.commits` and `load.components` move (5→6 commits), which is the intended effect of freeing the main thread, not a regression.

### Suggestions (ranked, none blocking)
1. **Low: `app/lib/arrangement/demo-synth.client.ts:22`.** `stems` is narrowed only to `object`, so `Object.entries(stems)` gives `[string, any][]`. That means `pulse`, `bass`, `pad` and `lead` are `any` until `isDemoSamples` narrows them. It's safe at runtime, but `any` gets in under strict mode. **Fix:** `new Map<string, unknown>(Object.entries(stems))`.
2. **Low: `app/data/studio-lab-demo.ts:9` imports a `.client.ts` module into a route-level data file** (`routes/studio-lab.tsx:4`). Remix leaves the exports of `.client` modules undefined in the server build. Today `loadSource` only runs inside an effect, so nothing breaks. But doc 211 §მიდგომა says the `typeof Worker === 'undefined'` branch covers SSR, and on the server that branch is never reached because the module is stripped. If a loader ever calls `loadSource`, it will throw `TypeError`. **Fix (doc only):** correct the SSR wording in doc 211, or rename the file to something like `demo-synth-job.ts` (the `Worker` guard already handles SSR).
3. **Info: `demo-synth.client.ts:3` vs `perf/lib/page.ts:120`.** The worst case at 6× CPU throttle is a 10 s stall plus about 2.5 s of synth on the main thread, roughly 12.5 s. The `waitForCollectionReady` timeout is 15 s, so there's little headroom. No code change; flag it for the harness owner.
4. **Info: `perf/budgets.json:106,119`.** `load.commits` and `load.components` moved from `deterministic` to `wallclock`. Both are record-only (`budget: null`), so no gate gets weaker. Note in the backlog that making them deterministic again would need the harness to wait for the worker explicitly.
5. **Info: `perf/studio-lab.perf.spec.ts:223`.** The `harness.loaf-scripts` guard passes if a single LoAF entry has an empty `scripts` array (giving `scriptMax` 0). Doc 163 already records this as a known limitation.
6. **Info: render cost.** All 5 synth sources resolve from one promise, so `computePeaks` runs 5 times and 5 state updates happen in a single task. The measured `load.script-max` median is about 45 ms (< 100), so this is acceptable. Moving peaks to a worker is already PERF-5.

### Good Practices Found
- The worker reply is checked structurally without `as`, so a malformed message falls back cleanly (DW6).
- The 5 buffers are sent with a transfer list, so nothing is copied.
- One job is shared via `??=`; 5 concurrent sources create one worker (DW2).
- Mutation tests MU-U1 to MU-U5 and MU-SYNC-FALLBACK show the unit tests and the `< 100` assert actually catch failures.
- WAV export sha256 is unchanged (EQUIV), so the audio output is identical.
- `measureSettled` runs only on the 1× pass. The new `scriptMax?` field is optional, so the resources spec, which uses the same instrumentation, is unaffected.

### Architecture note
- **Signal 2 (coupling) at `app/lib/arrangement/demo-synth.worker.ts:2`.** The worker imports its own launcher, `demo-synth.client.ts`, which contains `new Worker(new URL('./demo-synth.worker.ts'))` and `window.setTimeout`. So the worker bundle carries main-thread code and refers to itself. Vite deduplicates it: the build emits one 1.96 kB `demo-synth.worker` chunk and the browser probe is clean.
- **Keep for this round.** It does no harm now and the cost is low. Doc 211 already records it as A-R282-REVIEW-WORKER-PROTOCOL.
- **Proposal for the planner (one bounded task):**
  - Move `DemoSynthWorkerResponse`, `readDemoSynthWorkerComposition` and `demoCompositionTransfer` into `demo-synth.protocol.ts`, imported by both the worker and the client.
  - Acceptance: no behaviour change, and DW1–DW11 pass with only their import paths changed.
  - The shared-job, teardown and transfer invariants stay as they are.
  - This is a proposal, not a refactor instruction.

### Alternative Approach (Studio audio pipeline)
- **Current:** a module Worker plus a transfer list plus one shared `??=` job, with a silent synchronous fallback on every failure path.
- **Alternative:** chunked synthesis on the main thread that yields between chunks (scheduler or `setTimeout`).
- **Verdict:** keep the current approach. The alternative still leaves about 413 ms of work on the main thread and would need resumable generators inside `demo-synth.ts`. The worker removes the long task completely (`load.script-max` fell from 363–367 ms to a median of about 45 ms) with byte-identical audio, and the fallback keeps the demo working when workers fail. The cost is one extra chunk (~2 kB) and the less deterministic commit counts, which are already documented.

### Score: 9/10