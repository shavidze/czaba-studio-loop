COMMIT: OK

This is a review of the diff only. I read the diff, `ArrangementOverview.tsx` and the `StudioWorkspace.tsx` wrapper. I did not run the code or a real browser.

## Code Review: round 332 (overview equality, `memo` on the track meter, tests, doc 232)

### Critical Issues
- None. The diff touches no auth, purchase or download code, no `any`, no `@ts-ignore` and no type assertions.

### Suggestions (ranked)
1. **`StudioWorkspace.tsx:643-651` (`useEqualityStableSelector`, now with 3 callers).** It writes `heldRef` inside the selector, which React calls during render. Under StrictMode or concurrent rendering, a discarded render can leave `heldRef` pointing at a value that was never committed.
   - The effect here is harmless. Held values are only compared, never rendered, and a wrong hold gives at most one extra render.
   - The doc cites zustand's `useShallow`, which uses the same pattern.
   - Fix: leave as is. If the hold ever becomes visible, move the ref write to a `useEffect`.

2. **`preview-store.ts:333-344` (`OVERVIEW_CLIP_FIELD_ROLES`) and `:346-351` (`sameOverviewClipShownFields`).** The roles record is never read at runtime. Its link to the hand-written equality is guarded only by the tests PS-OVR-ROLES and DP32. A future overview field such as per-source colour would compile and pass, because the record only needs a `shown` or `ignored` entry for each clip field.
   - Fix: nothing now. The doc records this as GATE331-S1. Keep the tests as the guard.

3. **`ArrangementOverview.tsx:49-58, 321-333` (what the overview reads).** I checked this against the new equality. The overview reads only `tracks` (id and kind, compared by reference), plus each clip's `id`, `trackId`, `start` and `duration`, and `clips.length`. That matches the `shown` set exactly, so skipping the render is safe. The wrapper reads `arrangement.loop` from the committed prop, not from the held value.
   - Fix: none.

4. **`ArrangementTrackMeter.tsx:23, 108-109` (`memo` wrapper).** The props are two primitives, so `memo` is correct and adds no cost. The meter keeps its own `useSyncExternalStore` and writer subscriptions, so behaviour is unchanged, as `track-meter-ui.test.tsx` covers. The `Inner` suffix keeps the probe-name counting working. I found no listener or timer changes and no leaks.

5. **Tests.** The new `try/finally` around `view.unmount()` fixes a leaked mount when an assertion throws, which was a real hazard in the old loops. DP32 mounts the workspace once per ignored field plus one more. That is slow, but it matches the existing DP27 pattern.

### Good Practices Found
- The roles record is exhaustive over `keyof ArrangementClip`, so a new clip field is a compile error until someone classifies it.
- The equality checks the `tracks` reference first, so any track change still reaches the render.
- DP29–DP32 include positive controls (`ArrangementClipViewInner` renders 2, overview bars change on move and trim) and an unchanged-markup check after release. They also check the case where equality must not suppress a render.
- The doc records the rejected alternatives, such as the `ArrangementPeakPath` comparator, with measurements.
- Real-browser event ordering (pointer capture, gesture lifecycle) is not touched. The overview's pointer handlers, refs and effects are unchanged.

### Architecture note
- **Signal 3/4 (repeated costly change to the preview-reader region):** `StudioWorkspace.tsx:638-652, 845-869` and `preview-store.ts:60-135`. Rounds 331 and 332 each add a selector with its own equality function and a record. The helper `useEqualityStableSelector` lives privately in a 1,000-line component file.
  - Keep for now. The pattern is cohesive, tested, and has one lifecycle. Moving it would add prop and import plumbing with no behaviour gain.
  - Proposal for the planner, after c2b-ii if more equality readers appear: one bounded task to move `useEqualityStableSelector` next to `useArrangementPreview` in `ArrangementContext`. Acceptance criteria are that the public hook shape stays the same and the DP25–DP32 render counts are unchanged. This is not a fix for the current round.

### Alternative Approach
- Not critical business logic (this is a render-performance change on the Studio preview path). Current approach: field-level equality with an exhaustive record. Alternative: a `Pick` projection of the clip. It was already rejected in D-29z967 because it spreads through `ArrangementClip.tsx`, `waveform-zoom.ts` and `model.ts`. The current approach is better.

### Score: 9/10