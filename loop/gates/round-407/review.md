COMMIT: OK

I reviewed only the four paths in the diff: `ArrangementVideoDock.tsx`, `drag-preview-render.test.tsx` and docs 259/260. I did not run the code or a browser. C's PASS and the verify log cover the tests. The review below covers what tests can't.

## Code Review: ArrangementVideoDock.tsx (+ test, docs)

I found no blocking issues.

### Critical Issues
- None. No auth, purchase or download code is touched. No XSS surface was added, and no `dangerouslySetInnerHTML` or secrets. I checked SECURITY_AUDIT and ERROR_TAXONOMY. Neither applies to this diff.

### Suggestions (ranked, none blocking)
1. **`ArrangementVideoDock.tsx:260-270`, `useCommittedVideoLaneClips` (low).** It writes `clipsRef.current` during render. React can discard a render in concurrent mode, which would leave the ref holding an uncommitted list. The result is self-correcting, because `publishCommittedVideoClips` (:246) compares against `publishedClips`. The worst case is one extra or one missed notify during a discarded render, not a stuck state. The fix, if you want one, is to derive the list with `useMemo` keyed on `arrangement.clips`, then keep identity with a layout-effect-updated ref. Not needed now.
2. **`:230-233`, cached lane staleness (low, already recorded as TL-R407-SK-L1).** `cachedLane` keeps the top-level fields of an older `base` (`tracks`, `loop`) after commits that don't change the video clips. I checked every consumer of the lane:
   - `findVideoClipAt` and `videoTrackClips` (`video.ts:93`) read only `track.kind` and `track.id`.
   - `videoFadeOpacityAt` goes through `findVideoClipAt`.
   - `resolveVideoTarget` and `findVideoClipAt` use only `tracks` and `clips`.

   A change to the video track's `id` or `kind` changes `videoTrackId`, which builds a new reader. So there is no visible effect today. The risk is that a future lane consumer reading `loop` or `mute` would see stale data. The hardening already named in doc 260 is the right fix: rebuild the lane from the current base and keep only the clip-list identity.
3. **`:55-57` / `:61`, notify ordering (info).** `publishCommittedVideoClips` runs in the shell's layout effect, after the children's layout effects. The fade overlay subscribes in its own layout effect, which runs first. Both the overlay and the seek effect are therefore subscribed before the first non-silent publish. The silent first publish and the `publishedClips` reset on a new reader are consistent: consumers re-subscribe to the new `videoLane` anyway.
4. **`:1118-1123` (info).** `videoLane` is now stable across commits, so the stopped-seek effect no longer re-runs on every commit. The notify path replaces that re-run. `stoppedKeyRef` dedupes the repeated calls, so no extra seeks happen. The doc says the Redo re-seek has no unit row and relies on the browser recipe. That is acceptable, and I couldn't check the recipe here.

### Good Practices Found
- The float-drag logic moved over unchanged: `claimPointerGesture`, window listeners, pointer capture, `floatDragCleanupRef`, and the resize and focus-restore cleanup. The move is verbatim. The cleanup contract is intact: `cleanup(false)` on unmount and abort via the claim callback. The listeners are removed on every path, so I see no listener or timer leak.
- The fragment keeps the DOM order. The focus handlers, `data-*` hooks and aria labels are identical, so accessibility is unchanged.
- There is no new `any`, assertion or ts-ignore. It uses Tailwind tokens only, no hardcoded colors, and the semicolons are consistent.
- The commit listeners are a per-subscription `Set` of wrapped closures, and `publish` iterates over a copy. Unsubscribing during a notify is safe.
- The tests give both negative (DP73, DP74) and positive (DP75) controls, and the mutants each fail the intended row.

### Architecture note
- signal 4 (new state/lifecycle in an existing owner): `ArrangementVideoDock.tsx:210-258` → `useVideoLanePreviewReader` now also acts as a commit event bus (`commitListeners`, `publishedClips`) next to the preview-reader cache. Proposal for the planner, after PERF-11c-iii-e: one bounded task to extract a `createVideoLaneStore()` into `app/lib/arrangement/`.
  - Owner: the video lane read, subscribe and publish contract.
  - Acceptance: the `VideoLanePreviewReader` shape is unchanged, and DP70/DP72/DP73–DP75 pass untouched.
  - Cost: low-medium. The cache and the listener set already share one closure.
- Keep it for now. The reader, publisher and consumers form one lifecycle, and the invariants (stopped-seek timing, refs, gesture lifecycle, Undo/Redo) are tested as they are. The shell's size is not a signal.
- I only reviewed this diff. I make no claim that the whole module was audited.

### Alternative Approach
- Not auth, checkout or the audio pipeline, but it is critical for video sync.
- Current: the reader is stable, and a layout-effect-driven publish notifies subscribers when the video-lane clip list changes identity.
- Alternative: subscribe through `useSyncExternalStore` directly to a selector over the workspace store, with no publish step.
- Verdict: the alternative would remove the render-phase ref and the layout-effect hop. It would also require the actions context to expose a subscribable store, which is a broader ownership change than this round allows. Keep the current approach.

### Score: 8.5/10