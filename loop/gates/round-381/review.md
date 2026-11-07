COMMIT: OK

Only the perf harness and one doc change (5 files). Nothing under `app/`, auth, purchase or download code is touched. I did not read `verify.log` or `c-round-381.json`, and I did not run anything in a browser.

## Findings (ranked)

1. **Low, `perf/studio-lab-resources.perf.spec.ts:544`.**
   - `installPcmLiveRegistry` is installed in every pass, but only the `record` pass (`cpuRate === 1`, line 540) reads it.
   - The throttled passes still carry the wrappers on `decodeAudioData`, `createBuffer`, `startRendering` and the `AudioBuffer` constructor. They also keep `WeakRef`s alive in the `refs` array, which grows and is never pruned. This can slightly skew timing and memory in passes that don't use the data.
   - Fix: add the init script only when the pass is the record pass (decide it before the context is created), or document that the skew is accepted.

2. **Low, `perf/lib/pcm-live.ts:59-66`.**
   - `window.AudioBuffer` is replaced with a subclass. Native buffers from `decodeAudioData` and `startRendering` are not instances of that subclass, so `x instanceof AudioBuffer` is false for them.
   - A grep of `app/` found no `instanceof AudioBuffer` in production code, only `new AudioBuffer(...)` calls. Today this is safe and only a future-proofing note.
   - Fix: keep a comment or doc line, or pass `Symbol.hasInstance` through to the native class.

3. **Low, `perf/studio-lab-resources.perf.spec.ts:97-100`.**
   - `expectedCount` is the number of `option` elements in the library listbox. If that list is ever virtualized or filtered, the count guard reports a false "pcm live count" problem. It is fine while the full list is rendered.
   - Fix: take the expected count from the collection data, or assert that the list is not virtualized.

4. **Info, `pcm-live.ts:116-122`.**
   - The probe buffer lives in `window.__czabaPcmProbe`. It is deleted in the second `evaluate` (line 126), so it does not leak.
   - The probe is allocated before the two GCs, so it also checks that the registry sees live buffers.
   - Error paths in `readPcmLiveAfterGc` could leave the probe set if `collectGarbage` throws. This only matters if the page is reused afterwards, and the page is discarded.

Checked and fine:
- **Event ordering and timers:** there are no listeners or timers. The only wait is a fixed 100 ms between the two GCs, which is acceptable.
- **TS strict and assertions:** no `any`, suppression directives or type assertions. The `declare global` is typed.
- **Budgets:** the `budgets.resources.json` rows use `record` mode with `budget: null`, so no gate can fail on them.
- **Accessibility, Tailwind and render cost:** not applicable, because no UI is touched.
- **Wrapper behaviour:** wrapping `decodeAudioData` with `.then` is safe. It returns the promise either way, and callbacks passed through `args` still fire.

## Architecture note
- signal: `perf/lib/pcm-live.ts:36-89` → keep. It is a self-contained perf lib with a pure part (summarize, problems) that has unit tests and a browser part that does not, and it has no coupling to `app/`. The `studio-lab-resources.perf.spec.ts` `runResourcePass` gained a second `if (record)` block (lines 578-590) and a post-export block (lines 642-647). This is a mild signal of lifecycle accretion in one function.
- proposal for the planner (not for this round): if PERF-13b adds more probes, extract a "record-only probes" helper that takes `(cdp, page, result)` and returns the ready and after-export hooks, so `runResourcePass` doesn't gain a branch per metric. Not needed now.