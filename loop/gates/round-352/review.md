I've finished reading the diff and the reader code, and I'm writing up the verdict now.

COMMIT: OK

## Code Review: ArrangementVideoDock.tsx, drag-preview-render.test.tsx, implementation doc 232

I did not run the browser or the tests. This review comes from reading the diff and the nearby code (`ArrangementContext.tsx:1928` and `:4511-4556`, `preview-store.ts:29`, `video.ts:93`, `video-fades.ts:32-61`). I did not review the rest of the module. No auth, purchase or download code is touched. `SECURITY_AUDIT.md` and `ERROR_TAXONOMY.md` don't apply to this diff: it has no `any`, no `dangerouslySetInnerHTML`, no token handling and no new error codes.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Medium-low, latent stale lane object.** `ArrangementVideoDock.tsx:64-66`
   - When the base arrangement changes but the video-lane clips are element-wise equal, the reader returns the old `cachedLane`. That object still carries the old `...base` fields such as `tracks`.
   - Today this is harmless. `video.ts:93` and `video-fades.ts:59` only use the video track's `kind` and `id` and `clips`, and `videoTrackId` comes from the render `arrangement`.
   - The old code rebuilt `{...arrangement, clips}` on every `arrangement` change, so it never had this problem.
   - Fix: when `cachedBase !== base`, also compare `base.tracks` (and any other field the readers use). Otherwise rebuild `cachedLane`. Or add a comment/test that records the invariant "only `clips` and the video track `kind`/`id` are read".
2. **Low, subscription churn.** `ArrangementVideoDock.tsx:78-88`, `:326`, `:807-814`
   - Each commit gives a new reader, so the `useSyncExternalStore` subscriptions are re-created (unsubscribe, then subscribe).
   - Because React diffs the snapshot on re-subscribe, there is no stale-snapshot window.
   - The stopped-video effect also re-runs `syncStoppedVideo` on every commit. `stoppedKeyRef` de-duplicates it, so the cost is small.
   - Keep as is. If it shows up in profiling, make the reader identity stable and read `arrangement` through a ref.
3. **Low, test timing.** `drag-preview-render.test.tsx` DP72
   - The test sleeps a real 20 ms (`setTimeout`) to prove "no write after release". That is a negative assertion with a fixed wait, so it can't flake red, but it can pass vacuously if a write arrives later.
   - The mock cleanup is fine: `vi.restoreAllMocks()` runs in `afterEach` (line 421).
   - Optionally use fake timers or flush microtasks and `requestAnimationFrame` instead.
4. **Info, event ordering.**
   - On pointerup, `historyRef.current` is updated before `clearPreview()` notifies. The reader takes its base from `getArrangement()`, so the overlay never shows the pre-drag opacity on release.
   - DP69 covers this with a `MutationObserver`, and mutant M-B1 turns it red.
   - I could not exercise this in a real browser from here. jsdom's event ordering is only a proxy for the production batching behavior.
5. **Info, accessibility and Tailwind.**
   - No markup, class, test id or text changed.
   - The `style.opacity` write is imperative and was already there.

### Good Practices Found
- The per-move render cost is gone from the dock and its three children, and DP66-DP71 assert it. The mutants M-B1 to M-B4 show the tests catch regressions.
- Every subscription returns its cleanup: `subscribe` in `useVideoSourceIdAtPlayhead`, the layout effect in the fade overlay, and the stopped-seek effect. There are no timer leaks. The snapshot is a string, so `useSyncExternalStore` stays stable.
- The cache is keyed on the identity of both base and preview. It returns the same object when audio drags leave the video lane unchanged.
- No new `any`, `@ts-ignore` or type assertions. Semicolons are present and the `useCallback` deps look complete.

### Architecture note
- signal: `ArrangementVideoDock.tsx:204-233` (the reader hook) and `:296-327` (the fade overlay)
  - These are new lifecycle and subscription code inside a dock that was already large (video sync, floating box, stopped-seek).
  - This is signal 4 (state/lifecycle added to an existing owner) plus signal 3, since this region has now been changed in rounds 345, 349 and 350–352.
  - Keep for now. The reader is cohesive with the three consumers in the same file, so extracting it saves little. It is also pure, so it could move later at low cost.
  - Proposal for the planner, a bounded task: move `useVideoLanePreviewReader` and `sameClipList` to `app/lib/arrangement/video-lane-reader.ts`, or a hook file. Acceptance: DP66-DP72 stay green, the public `useArrangement` shape is unchanged, and a unit test pins that stale `tracks` are not returned (suggestion 1).
  - Do not do this in the current round.

### Alternative Approach
- Current: a memoized reader with an identity cache, with `useSyncExternalStore` for the captions and an imperative write for the overlay.
- Alternative: a selector hook that subscribes to the preview store and returns only `sourceId` (and the opacity string), with no shared reader object.
- Verdict: keep the current one. The reader serves four consumers (caption, gap caption, overlay, seek effect) with one cache. The alternative would duplicate the lane computation and the base-ordering reasoning in each consumer, and the release-ordering bug was caught precisely at that base choice.

### Score: 8.5/10