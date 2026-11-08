COMMIT: OK

## Code Review: precomputed peaks (PERF-15a), `ArrangementContext.tsx`, `precomputed-peaks.ts`, `arrangement.ts`, 2 test files, doc 263

I read the diff and the new files, and I checked `plainSourceFetch` and every non-test reader of `sourcePeaks`. I did not re-run the tests or the verify command; I relied on the stated C PASS and `verify.log`. I did not run a real browser.

### Critical Issues
- None. The candidate touches no auth, purchase, download, token or Firebase code. There is no `any`, no `@ts-*` directive and no type assertion in the diff. The `Record<string, unknown> = { ...data }` spread and the `unknown` narrowing in the parser are strict-clean.

### Suggestions (ranked)
1. **Low, `ArrangementContext.tsx:4553`.** `collection.peaksUrl?.(source)` runs unguarded inside the effect. If a collection's `peaksUrl` throws, the effect throws before the `loadSource` loop starts. Every source then stays `loading`, because `patchSourceState(..., 'loading')` ran on the line before. This matches the existing `previewUrl` behaviour, and the doc defers it as TL-R410-SK-3. No collection sets `peaksUrl` yet, so it can't fire today. Fix when 15b wires the URLs: wrap the call in try/catch and treat a throw as "no URL", for `peaksUrl` and `previewUrl` together.
2. **Low, `precomputed-peaks.ts:106-110`.** The 4 MiB cap only works when `content-length` is present and uncompressed. Without it, `response.json()` reads an unbounded body on the main thread. The doc admits this. Since the URLs will be same-origin or backend-owned, the risk is acceptable. If it matters later, read the body as text and check its length, or stream it with a byte counter.
3. **Low, `ArrangementContext.tsx:4520-4524`.** Peaks are keyed by source id only. If a new collection reuses an id that was ready in the previous collection, the new run's early peaks overwrite the old ready peaks. If the new source never becomes ready, the cleanup drops that id. A clip in the lane that still references the id then loses its waveform. HEAD never deleted peaks. Real ids are unique per collection (demo and purchased), so I consider this theoretical. No fix is needed now.
4. **Nit, `ArrangementContext.tsx:4557`.** The `.then` has no `.catch`. That is safe today because `fetchPrecomputedPeaks` never rejects, and `storeSourcePeaks` is a plain `setState`. Keep that invariant if the function changes.

### Good Practices Found
- **Event ordering and races:**
  - A fetch that resolves after the source is decided is ignored (`peaksDecided`, PPC4).
  - A fetch that resolves after abort is ignored (`controller.signal.aborted`).
  - A decode failure also marks the source decided and drops the early peaks (PPC9).
  - A decoded result always overwrites a placeholder.
  - The ready patch order is unchanged: `decodedBuffers.set`, then `evict`, then peaks, then `ready`, then `settle`, then `resyncAfterDecode`.
- **Leaks:**
  - The fetch uses the effect's `controller.signal`, so unmount or a collection swap aborts it (PPC8).
  - `precomputedPeaks`, `peaksDecided` and `peaksReady` are local to each effect run, so nothing outlives it.
  - No new listeners or timers.
  - `dropSourcePeaks` returns the same state when the id is absent, so it causes no extra render.
  - `dropSourcePeaks` is stable (`useCallback([])`), so the effect dependency list doesn't churn.
- **Render cost:**
  - HEAD-equivalent when `peaksUrl` is absent: no fetch, no extra renders (PPC6).
  - With a URL, there is at most one extra `Map` copy per source at load, the same cost as `storeSourcePeaks` already has.
  - For 16-bit peaks the worker job is skipped.
- **Data safety:**
  - The parser validates version, channel count, integer ranges and `values.length === length × channels × 2`.
  - It rejects files coarser than 100 buckets per second.
  - It returns `null` on any problem.
  - 8-bit peaks are only a placeholder, because their steps show on quiet stems.
- **Accessibility, Tailwind, tokens:** no UI or CSS is touched. The existing dimmed loading waveform in `ArrangementLibraryPreview` is unchanged.
- **Tests:** 17 of 17 mutants went RED, and the pristine runs are green. The context tests cover swap, error, late-arrival and abort. The doc is a complete Georgian implementation doc with the required sections.

### Architecture note
- signal 4 (new state/lifecycle in an existing owner): `ArrangementContext.tsx:4505-4629`. The collection-load effect now carries three per-run sets and a map, with a four-way interleaving of fetch, decode, worker and swap. The interleaving is covered by PPC1–PPC11.
- Keep for now. The effect owns the controller and `decodedBuffers`, and the sets share its single lifecycle. Moving them out would add prop plumbing without removing any coupling.
- Proposal for the planner, to be done after 15b, not in this round:
  - Task: extract a pure `createCollectionPeaksTracker({ store, drop })` into `lib/arrangement/` that owns `early`, `decided` and `ready`, with methods `onEarly`, `onDecoded` (returns the peaks to reuse, or null) and `onFailed`.
  - Ownership: only the peaks bookkeeping moves. Audio timing, refs and the public shape of `useArrangement()` stay as they are.
  - Acceptance: PPC1–PPC11 stay green unchanged, plus a unit test per method.
  - Cost: low to medium.
- This is a review of the diff only. I did not audit the whole of `ArrangementContext.tsx`.

### Alternative Approach (critical logic: Studio audio pipeline)
- Current: fetch the peaks in parallel with decode, store them early as a placeholder, and reuse 16-bit peaks at ready only when the bucket count is within ±1 of the decoded length. Otherwise the worker recomputes.
- Alternative: wait for decode, then always recompute (HEAD), or trust the server peaks without a length check.
- Verdict: keep the current approach. It is a strict superset of HEAD's behaviour when no URL is given. The decode result always wins on a mismatch, so a wrong or stale server file can't leave a bad waveform. Trusting the server without a check would save little and risk wrong waveforms.

### Score: 9/10