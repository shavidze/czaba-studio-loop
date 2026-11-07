COMMIT: OK

I reviewed the diff and read the surrounding code in `ArrangementContext.tsx`. I did not run the code or a real browser. The change touches no auth, purchase or download code. The paths are the Arrangement context, its tests, `strings.ts` and the implementation doc. No new `any`, type assertions or suppressions appear, and nothing new is added to localStorage. The `scheduleFailed` string is plain text, so there is no XSS or injection surface. `SECURITY_AUDIT.md` and `ERROR_TAXONOMY.md` don't apply: no auth, API or error-code changes.

## Code Review: ArrangementContext.tsx (+ tests, strings)

### Critical Issues
- None.

### Suggestions (ranked)
1. **`ArrangementContext.tsx:1743-1758`, preview of an evicted source.** The timeline now keeps playing while the preview decode is in flight (the `stopPlayback()` was removed). Playback only stops at line 1777, in the recursive call after the decode succeeds. If the user pauses during the decode and the preview then starts, they hear a preview they pressed earlier. That fits the intent and is not a bug. The one thing the tests can't show is whether the delay feels like a hang, because the decode is slow in a real browser. Fix, only if QA flags it: show a "loading preview…" status while `previewRequestRef` is set.
2. **`:1412-1426`, `resyncAfterDecode` catch.** The status text `scheduleFailed` overwrites any status already showing, such as an export or error message. The replacement is only undone by `startPlaybackAt` at line 1679. This is acceptable. Also, `stopPlayback()` runs even if the sync threw while not playing. Fix (optional): guard with `isPlayingRef.current`. Avoid a `setStatus` call when the status text would not change.
3. **`:1743-1758`, stale preview after a collection change.** The `collection` guard at line 1431 stops the stale decode, which EV12 covers. The `.then` still runs, though. It calls `releasePreviewPin()` and sets a "not loaded" status with the old source's title. This message is harmless but misleading. Fix: in the `.then`, bail out if `collection.sources` no longer contains the source.
4. **Tests, `decoded-buffer-eviction-ui.test.tsx` ~586 and ~311.** The new `it(` blocks have no blank line before them (EV11 and EV15). This is only a style nit.
5. **`ArrangementContext.tsx:4265-4350`.** The listener/timer lifecycle is unchanged. The controller is now `{collection, controller}`, and the cleanup still compares `.controller === controller`, so there are no leaks. `resyncAfterDecode` is a stable `useCallback` and adds no render cost.

### Good Practices Found
- The three duplicated `syncPlayback` calls are now one guarded helper. A throw inside the async decode `.then` no longer becomes an unhandled rejection or breaks the other waiters. The tests check that an export waiting on the same decode still renders.
- Tests cover the unhandled-rejection and window `error` paths (EV11, EV15, PW20).
- The `scheduleFailed` string is registered in `strings.ts` and pinned in `strings.test.ts`.
- No Tailwind or token changes.

### Architecture note
- signal (new lifecycle in an existing owner): `ArrangementContext.tsx:816-1489`. The decode/resync/preview coordination (`collectionControllerRef`, `decodeInFlightRef`, `previewRequestRef`, `resyncAfterDecode`) keeps growing inside the provider. Several rounds have touched this region, and each needs a large mocked harness.
- Keep it for now. These pieces share refs with `syncPlayback`, `stopPlayback` and the pinned buffers, and splitting them would risk audio timing and the shape of the public hook. This round makes the coupling slightly cleaner.
- Proposal for the planner (bounded task): extract a `useDecodeCoordinator` hook that owns the controller, the in-flight map and `ensureDecoded`, and takes `onDecoded(sourceId)` as a callback. Acceptance criteria: the `useArrangement()` shape is unchanged, and the EV/PW test suites pass unmodified. Do it only if this region is touched again.
- This is a review of the diff only. I did not check the whole module.

### Alternative Approach
- Current: catch a schedule failure in `resyncAfterDecode`, then stop playback and set a status.
- Alternative: make `syncPlayback` itself return a result, or catch inside it, so every caller is protected.
- Verdict: keep the current approach. It is the narrowest change and the three decode call sites share one handler. The alternative would change the behavior of the other `syncPlayback` callers (edits, scrub), which sit outside this scope.

### Score: 8.5/10