COMMIT: OK (no blocking findings. The change only touches Studio render memoization; no auth, purchase or download code is touched. verify.log shows 243 test files and 3570 tests passing, and the build succeeds.)

## Code Review: StudioWorkspace.tsx, preview-store.ts, drag-preview-render.test.tsx, preview-store.test.ts, 232-perf-drag-preview.md

### Critical Issues
- None.

### Suggestions (ranked)
1. **The fields are listed in two places** — `app/lib/arrangement/preview-store.ts:331-363`. `SELECTED_CLIP_FIELD_ROLES` is never used when the code runs. `sameSelectedClipShownFields` compares its own hand-written list of 7 fields. Today the tests keep the two in sync: the `-?` mapped type in PS-ROLES forces a test variant for every field, and the equality is checked against each role. But the record documents the rule while the function enforces it, so they can still drift apart.
   **Fix (optional):** loop over the `'shown'` keys of the record inside the equality function. All 7 shown fields are primitives, so `===` per key stays correct and costs about the same. If you keep the hand-written version, add one line to item 27 of the doc saying this is a deliberate choice for speed.
2. **The doc doesn't fully match the code** — `232-perf-drag-preview.md`:
   - Line 1 (title) still lists stages a/b/c1 only. c2a is missing.
   - TODO line 474 still describes "c2" as remaining, including the detail panel and readout. Item 25 and line 471 say those are done in c2a, so line 474 should say only the overview, meter and peak path are left (c2b).
   - Item 30 lists the fields the panel actions read as `id, trackId, start, duration, gainDb`. The panel also shows `sourceOffset` (`ArrangementDetailPanel.tsx:928`). It is classed as "shown", so this is harmless, but the list should include it.
3. **Possible leaked mounts if a test fails** — `drag-preview-render.test.tsx:220-240` (DP28) and `mountedSelectionMarkup` (`:132-138`). Each loop iteration mounts a workspace and calls `view.unmount()` only after its assertions. If an assertion fails mid-loop, that mount is left behind. Testing Library's auto-cleanup probably catches it, but I didn't confirm that.
   **Fix:** wrap each iteration in `try { … } finally { view.unmount(); }`.
4. **Exact render count in DP25** — `drag-preview-render.test.tsx:162` expects exactly 2 renders of `ArrangementClipViewInner`. This makes it a good positive control, but it will fail on any unrelated change to how clip views render.
   **Fix:** keep `toBe(2)`, or use `toBeGreaterThan(0)` together with the `data-fade-in` check, as DP26 already does.

### What I checked that tests can't catch
- **Stale clip object in the detail panel.** The panel now keeps an older clip object when only fade/envelope change. I traced every reader:
  - `ArrangementDetailWaveformInner` (`ArrangementDetailPanel.tsx:213-250`) reads start, duration and trackId only.
  - `ArrangementPeakPathInner` (`ArrangementClip.tsx:332-340`) reads id, sourceOffset, duration and gainDb. `clipLinearGain` (`model.ts:526`) reads only gainDb.
  - `applyDetailRange` (`:601-613`) reads start, duration and trackId.
  - Clip Gain and reset (`:681-706`, `:865`) send `id` plus a value. Nothing spreads `selection.clip` back into a write.
  - So item 30 in the doc holds (apart from the `sourceOffset` gap in suggestion 2).
- **Order of updates at pointer-up in a real browser.** On release, two things change: the preview store is cleared, and React's `clipLaneDrag` state goes back to null. They can land in either order. If the store clears first, the readout's last selector still sees the drag and returns nothing, which is equal to before, so it doesn't re-render. Then the prop change re-renders it with the committed clip. If the prop changes first, it re-renders straight to the clip. Both orders end in the same correct state, and DP26 checks the final text.
- **The new hook under React's external-store rules.** `useEqualityStableSelector` (`StudioWorkspace.tsx:637-651`) writes to a ref inside the selector, the same way zustand's own `useShallow` does. It returns a new function on every render, as inline selectors already did. Because it hands back the same object when nothing visible changed, React's "getSnapshot should be cached" check is satisfied. If React throws away a render, the ref may keep a newer value, but that value is still valid store state.
- **Leaks, render cost, accessibility, styling, types.**
  - No new listeners, timers or effects.
  - No changes to markup, Tailwind classes or ARIA.
  - No `any`, `@ts-ignore` or `as`, and semicolons are in place.
  - Removing `useShallow` from this file is safe: its only use was the detail wrapper, and the lane hook keeps its own.
  - The extra cost is 7 primitive comparisons per selected clip per store notification, which is negligible.

### Good Practices Found
- `Record<keyof ArrangementClip, …>` plus the `-?` mapped type in the tests means a new clip field won't compile until someone classifies it.
- DP27 and DP28 test the actual safety condition: what is on screen doesn't depend on the ignored fields, whether the clip is freshly mounted or changed by a commit. They don't just count renders.
- Turning the readout off during a lane drag (`:672`) is minimal, and DP26 shows the hint while the drag lasts and the right text after release.
- The rejected alternatives (`Pick` projection, overview in c2a) are written down with decision IDs.

### Architecture note
- signal 3 (the same region keeps getting costly changes): `StudioWorkspace.tsx:637-864`. The preview-reader wrappers (readout, detail wrapper, overview wrapper) and now a general-purpose hook have been edited in rounds 328, 329, 330 and 331, each time inside a 3400+ line owner.
  - **Keep for now, because:** stage c2b (overview equality) is about to touch this same region, and D-29z915 (still unanswered) decides where lane/overview geometry lives. Moving code before that would mean moving it twice.
  - **Proposal for the planner, after c2b:** one bounded task. Move `useEqualityStableSelector` and the three `*WithPreview`/`*WithSelection` wrappers into `app/components/arrangement/ArrangementPreviewReaders.tsx`.
    - **Must stay the same:** the public `useArrangement()` shape, the gesture lifecycle, and the DP1–DP28 and PS-* tests, which should pass unchanged.
    - **Done when:** `StudioWorkspace` imports these readers, there are no behavior changes, and the render counts are identical.
    - **Estimated cost:** low.

### Alternative Approach (critical logic: Studio drag render path)
- **Current:** a field-level equality check inside a local hook that keeps the same object when nothing visible changed, plus a full classification of every clip field.
- **Alternative:** have the selector return a `Pick<ArrangementClip, shown>` projection, so the panel never holds a stale object at all.
- **Verdict:** keep the current approach for this round. `ArrangementPeakPath` and `clipWaveformScale` take a full `ArrangementClip`, so the projection would spread into `ArrangementClip.tsx`, `waveform-zoom.ts` and `model.ts` (as D-29z967 notes). The stale-object risk is covered by tests: DP27/DP28 check the markup, and I traced every action above. Switch to the projection when the panel first shows a fade field (SIG-R331-DETAIL-PICK, T12 micro fades). At that point the field's role in the record has to change to "shown", and PS-ROLES/DP27 will force that.

### Score: 9/10