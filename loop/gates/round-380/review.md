COMMIT: OK

This is a review of the diff plus a read of `export-wav.client.ts`, not a full audit. I found no blockers.

**Scope and security**
- The change touches no auth, purchase or download code, no `ArrangementContext`, and no UI components.
- `renderArrangementWav` still returns `{blob, peak, clippedSamples}`, so downstream callers and the download flow are unchanged. A grep for the removed APIs finds only historical docs (079, 091).
- I found no secrets, XSS surface, `any`, suppression directives or type assertions. The new tests narrow message types with guards instead of casts.

**Findings, ranked**
1. **Low, perf budgets, `perf/budgets.resources.json` (the two `longtask-max.6x` rows):** these assert a wall-clock metric (`kind: wallclock`) at ≤100 ms under 6× CPU throttle. The note that said "trend only (±30 %)" is gone. The sketch measured 0 ms and the mutant 1419 ms, so there is wide margin. Still, any unrelated main-thread work (dialog render, GC) inside the export window could exceed 100 ms on a slow CI runner and cause a flaky failure.
   - Fix: keep the assertion, but if it flakes, loosen it to about 150–200 ms rather than reverting to record mode. The mutant sits at 1400 ms or more, so detection is unaffected.
2. **Low, `export-wav.client.ts:139-143`:** if `post` throws inside the ack handler, `fail()` runs and `reportProgress` is skipped. That is correct. The one gap is that `fail()` loses the real error cause, which matches the old behaviour. No action needed.
3. **Low, `export-wav.client.ts:155-163`:** `armStallTimer()` is called only after the synchronous `begin`, first chunk and `reportProgress(0)`. If `reportProgress(0)` blocked, the timer would start late, which is harmless. `onProgress` exceptions are swallowed in `createWavProgressReporter`, which fits the TL-R380-B1 decision.
   - Optional fix: call `armStallTimer()` before `post`, so a failure in `begin` also covers the stall path. It is not required, because `fail()` clears the timer.
4. **Info, `export-wav.worker.ts`:** the worker holds the full WAV ArrayBuffer and the Blob copy together, about 2× the WAV size, inside the worker only. This is already tracked as SIG-R380-WORKER-DOUBLE-BUFFER and is out of the 5 MiB page metric. I agree it can wait.
5. **Info, event ordering:**
   - Message order is guaranteed on a single worker channel, so `begin` then `chunk` is safe.
   - After `detachWorker` nulls the handlers and terminates the worker, a late ack or complete cannot run. The abort listener is removed exactly once, and the tests assert that.
   - There is one in-flight chunk and the next copy only happens on an ack, so abort stops `copyFromChannel`.
   - Listener and timer cleanup is complete on every exit path: complete, error, stall, abort, `onerror`, `onmessageerror`.
6. **Info, accessibility, Tailwind, render cost:** no UI or styling changes. Chunk allocations are two 256 KB `Float32Array`s per ~1.4 s of audio, which is negligible.

**Good practices found**
- Byte-for-byte equivalence with `encodeArrangementWav` is tested at boundary lengths, with NaN and ±1.5 samples, and with early and late peaks.
- The stall watchdog re-arms on every ack, and the tests cover the 29 s and 58 s cases.
- Perf rows are asserted only after mutant evidence.
- The implementation doc (246) records the TL-R380 behaviour decisions.

**Architecture note**
- Signal: `export-wav.ts:70-150` (writer) → keep. The WAV header and 24-bit encoding now exist in two places, `createArrangementWavStreamWriter` and `encodeSfxWav`, so a future format change must touch both. The oracle byte-equality tests (SW1) guard this, and the doc already records the decision not to share the header. The cost of keeping it is low.
- Proposal for the planner, as one bounded task after PERF-12b: extract a shared `buildWavHeader(length, channelCount, sampleRate)` used by the writer and `encodeSfxWav`.
  - Acceptance: SW1 byte-equality unchanged, and `sfx-edit` tests green.
  - This is not a fix for the current round.
- Signal: `export-wav.client.ts` now owns the worker protocol, chunk copying, progress and the stall timer. That is cohesive and a single lifecycle, so keep it. The module would only be worth splitting if the 12b windowed-render work adds a second lifecycle here.