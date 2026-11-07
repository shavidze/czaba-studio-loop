COMMIT: OK

I read the diff, the new cache module and both new test files. I didn't run anything. I didn't read `docs/implementation/2026/quarter-IV/248-perf-decoded-buffer-cache.md`. My checks were limited to what I opened, plus `preview.client.ts` and a repo grep. Every item below is minor, and none of them blocks the commit.

## Code Review: ArrangementContext.tsx, decoded-buffer-cache.ts, perf harness

### Critical Issues
- None.
- Auth, purchase and download code are untouched:
  - `collection.ts` and `source-fetch` are not in the diff.
  - The purchased collection has no `canReloadSource`, so its buffers are never evicted and its fetch path doesn't change.
  - The export functions gain a `prepareExportSources` step before the render, and pins are released afterwards. The blob, anchor and download part is unchanged.
  - No entitlement checks are touched.
- Event ordering holds up in the places I checked:
  - `ensureAudioContext()` runs synchronously in the click before the async re-decode (`ArrangementContext.tsx:1719`).
  - The preview player's `onended` is guarded by `active === preview` (`preview.client.ts:49`), so a stale end can't unpin a newer preview.
  - `startPlaybackAt` calls `stopLibraryPreview()` first (line 1629). A preview request that is still decoding therefore can't start over timeline playback.
- Video-import buffers can't trigger a false "not loaded" refusal:
  - They are stored with `evictable: false`.
  - They aren't in `sourceStates`, so `clipSourcesAwaitingDecode` skips them.

### Suggestions (ranked)
1. **Medium: unhandled rejection.**
   - Where: `ArrangementContext.tsx` ~1406–1450 (`ensureDecoded`'s fulfilled handler calls `syncPlayback`). It's called as `void ensureDecoded(...)` from the history publish (~922), from `startPlaybackAt` (1646) and from `startLibraryPreview` (1727).
   - Problem: if `syncPlayback` throws, the `Promise.all` result rejects and nobody catches it.
   - Fix: wrap the `syncPlayback` call in try/catch inside the handler, or end the three `void` call sites with `.catch(() => undefined)`.
2. **Low: Stop is wasted on a failed preview decode.**
   - Where: `ArrangementContext.tsx:1722–1724`.
   - Problem: the deferred preview branch calls `stopPlayback()` at click time. If the re-decode then fails, playback has stopped and nothing plays. The post-decode path (1761) already stops playback.
   - Fix: delete the `isPlayingRef` block from the deferred branch.
3. **Low: UX when Play is pressed during a re-decode.**
   - Where: `startPlaybackAt`, 1644–1650.
   - Problem: Play is refused with a status message and the user must press it again. EV3 locks this behaviour in, so it is intentional.
   - Fix (optional): start playback automatically once `ensureDecoded` settles.
4. **Low: the load effect now deletes buffers on every cleanup.**
   - Where: `ArrangementContext.tsx` ~4255–4265 (`resetDecodedBuffers`).
   - Problem: before, cleanup only aborted. Any identity change in `getDecodeContext`, `syncPlayback`, `patchSourceState` or `requestSourcePeaks` re-runs the effect, drops all buffers, and re-decodes everything. That includes the non-evictable ones.
   - Fix: confirm those callbacks have stable identities. A test that re-renders the provider with an unchanged collection and asserts `loadSource` is called only once would lock that in.
5. **Info: the deferred preview keeps the first call's `offset`.** Two clicks on the same source during one decode replay the first offset. The result is correct, because the second `.then` is dropped by the `previewRequestRef` check.

### Good Practices Found
- The cache is a small, pure module with an LRU, owner-scoped pins and non-evictable entries. The `asReadonlyMap` identity is stable and covered by DC5.
- Pins are released on every export exit: completion, cancel, replace and error. The replace case is guarded by `exportPinOwnerRef`, and EV5 tests each path.
- The history publish recomputes pins only when the `clips` array identity changes (EV8). A volume edit therefore costs nothing.
- In-flight decodes are de-duplicated (EV2), and a collection change deletes only its own ids and never calls `clear` (EV7).
- `storeSourcePeaks` uses a functional update, and EV10 covers two sources arriving in the same tick.
- Eviction only applies to the demo collection, through the opt-in `canReloadSource`, so production behaviour is unchanged.
- No `any`, `@ts-ignore` or type assertions. The new hook dependency arrays look complete. No Tailwind, accessibility or DOM changes.
- Perf harness: the registry is installed only in record mode, and the decode and dropped probes are excluded from the totals.

### Architecture note
- signal: `ArrangementContext.tsx:1406–1450, 1595–1790, 4255–4340` (new state and lifecycle in an existing owner). This diff adds decode orchestration (in-flight map, collection controller, three pin owners, preview request) to a file that is already very large.
- Keep for now, because:
  - The cache itself is already extracted into `lib/`.
  - The orchestration depends on `latestRef`, `syncPlayback`, `patchSourceState` and the gesture-bound `ensureAudioContext`.
  - Extracting it now would risk the audio-timing and gesture invariants.
- Proposal for the planner, one bounded task, only if another round changes this region:
  - Extract a `useDecodedSources(collection, deps)` hook that owns the cache, the in-flight map, `ensureDecoded` and the pin helpers.
  - Acceptance criteria: the public `useArrangement()` shape is unchanged, and EV1–EV10 plus DC1–DC8 pass unchanged.
- This review covers the diff only. It isn't a full audit of the module.

### Alternative Approach (critical logic: Studio audio pipeline)
- Current: lazy re-decode on demand. Demo sources are evicted when unpinned and over the 32 MiB budget. Clips, preview and export pin their sources.
- Alternative: keep everything decoded, and shrink memory by decoding to mono or a lower sample rate.
- Verdict: the current approach is better. It cuts live PCM from about 124 MiB to about 32 MiB without changing audio fidelity. The cost is a one-off re-decode delay on first use, and the tests cover that path. The alternative would change the mix audibly.

### Score: 8.5/10