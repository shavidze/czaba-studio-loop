**COMMIT: OK**: nothing blocks. The diff touches no auth, purchase or download code: it's limited to the 12 paths in `paths.txt`, all in arrangement and docs. I read the diff and the four new files and grepped `verify.log` (the excerpt I read passes). I'm taking the overall verify pass and C PASS on your word. I didn't run anything in a browser.

## Code Review: round 82, clip fades (SRW-18 stage 1) and X1

### Critical Issues
- None.

### Suggestions (most important first)
1. **Medium: a double-click right after a drag may wipe the new fade.** `ArrangementClip.tsx:875` (`onDoubleClick` → `resetClipFade`, l.717–728).
   - **What can happen:** drag a handle, release (one `Fade In` entry), then click again quickly. The browser may count that as a double-click on the handle. `resetClipFade` then writes a second entry and sets the fade back to 0.
   - **Unconfirmed:** whether Chromium counts it after a 3–10 px drag depends on its click-count distance check. jsdom can't show this, so it needs a Playwright check.
   - **Fix:** remember in a ref whether the last fade gesture moved, set it in `finishGesture`. `resetClipFade` returns early if it moved and less than about 500 ms has passed.
2. **Medium: splitting inside a fade changes the sound.** `fades.ts:84–95` (`withCutEdges`), as used in `model.ts:269–279`.
   - **Example:** split inside a fade-out. The right part keeps the whole fade-out, squeezed to its own length, so it starts at gain 1 instead of the gain the ramp had at the split point. That's an audible jump up. Splitting inside a fade-in makes the left part ramp more steeply.
   - The doc (§ "დაუდასტურებელი") calls the F3 rules a CZABA decision, which is fine. But it doesn't say that split isn't sound-neutral.
   - **Fix:** add one line to doc 072. Later, either keep the ramp's gain across the split, or split the ramp proportionally.
3. **Low: hit areas in existing flows changed.**
   - The handles (`size-2.5`, `z-30`/`z-40`, l.866–867) can still be clicked when hidden with `opacity-0`.
   - They take over the top 10 px of the left trim strip (`w-2 z-20`, l.882) and the top corners of the clip body.
   - A plain click there now starts a fade gesture that writes nothing, so it no longer trims or moves the playhead.
   - This is deliberate (Live does the same) and the touch case is in the TODO. Only the mouse case is missing from the doc.
4. **Low: no keyboard or screen-reader access.** The handles at l.862 are `<div>`s with only a `title`: no role, no focus, no keyboard path. This is noted as SRW18-KEYBOARD-FADES. It should get its own backlog entry, not stay only in the doc's TODO.
5. **Low: fades can fail silently.** `graph.client.ts:16–17` makes `setValueAtTime` and `linearRampToValueAtTime` optional so the frozen test fakes still work, and calls them with `?.`. If either is missing, fades simply don't happen.
   - Real `AudioParam` has both, so browsers are fine.
   - Later, upgrade the fakes and make both methods required.
6. **Low: the clip can't be reached during playback while dragging a fade.**
   - Each preview move changes `scheduleKey` (`ArrangementContext.tsx:470–473`). Fades are deliberately kept in the key, unlike `gainDb`, so the graph rebuilds on every `pointermove`.
   - This is the same as clip move today and is documented as FD-PLAY-EDIT.
   - Optional fix if users notice clicks: throttle the preview reschedule.
7. **Low: the hit-handle can disappear mid-drag.**
   - Pointer capture is now on the handle (l.341). If the handle unmounts during a drag, capture is lost and `root` has no `onLostPointerCapture`.
   - That happens if the clip becomes narrower than 24 px on zoom (`showFadeHandles`, l.204) or the lane is folded.
   - Recovery then waits for the leftover path in the next `beginGesture`. Until then `isArrangementPreviewActive()` stays true.
   - **Fix:** while a fade gesture is active, keep the handle mounted (OR `showFadeHandles` with `gestureRef.current?.kind` starting with `fade`). Or handle `onLostPointerCapture` the same way as `pointercancel`.
8. **Trivial: status text.** The status during drag ends `… წმ` (l.102) and after release `… წმ.` (l.160). The ramp's `viewBox` uses `width`, but the body's inner width is `width − 2` px. That's under one pixel of visual error.

### Good Practices Found
- **Audio:**
  - The fade has its own `fadeGain` node (`source → fadeGain → clipGain`), so live Clip Gain changes (`setTargetAtTime`) can't break the ramp.
  - Clips without fades build the same graph as before.
  - Both cleanup paths disconnect `fadeGain`: the `appendPlan` filter (l.249) and `disconnect` (l.294).
- **Scheduling:**
  - Starting mid-fade begins at the ramp's current gain (`clipFadeGainAt(shape, item.when)`).
  - The fade-out never starts before the fade-in ends (`Math.max(..., fadeInEnd)`), which fixes the float off-by-one-ulp bug; FD7g covers it.
  - Loop iterations map time correctly: `from = loop.start`, `startAt = iterationStart`.
- **Gestures and Undo:**
  - On `pointercancel`, `endStaleClipGesture` restores the arrangement first and only then releases the claim.
  - A release writes exactly one history entry; a click without movement writes nothing.
  - `setClipFade` returns the same object when nothing changed, so previews are cheap.
- **Model consistency:** every place that changes a clip's length (trim, split, `deleteTime`, cut, range copy, paste) goes through `fades.ts`. I grepped for `...clip, duration`; none are missed. Move, duplicate and group move carry fades along with the clip.
- **Render cost:** no new hooks, state, timers or listeners. Hover is CSS-only, so the render budget is unchanged. The bare `group` class is safe: no ancestor of the timeline has a `group` class.
- **TypeScript and Tailwind:**
  - No `any`, `@ts-*` or type assertions in the diff or the new tests.
  - Only tokens are used (`bg-brand`, `border-foreground`, `text-foreground`). The inline `style` is only the dynamic `left`/`right` offset.
  - Semicolons are present. 0 is stored as an absent key, not `undefined`.
- **X1:** `laneRefusal` is cleared on success and on a block in the same lane (l.545), so the "kept place" status only appears after a real lane refusal.

### Architecture note
- **Signal 4 (new lifecycle variant in the same owner) and signal 3 (same region changed round after round):**
  - **Where:** `ArrangementClip.tsx:341` (capture element chosen per gesture kind) and `:619–641` (separate cancel and commit branch for fades). `beginGesture`/`finishGesture` now handle six gesture kinds. Testing each needs the full `ClipGesture` context, and this region has changed in several recent rounds.
  - **Keep for now:** there's one pointer registry, one lifecycle and no prop plumbing.
  - **Proposal for the planner (not approved scope):** a bounded task to describe gesture kinds as a small table of `{ capture, onMove, onRelease, onCancel }`.
    - Must stay unchanged: audio timing, refs, Undo atomicity and the shape of `useArrangement()`.
    - Acceptance: the existing trim, move, range, FU1–FU6 and render-budget tests stay green unchanged. Cost: medium.

### Alternative Approach (Studio audio pipeline)
- **Current:** a separate `fadeGain` node per faded clip, with ramps scheduled through the `AudioParam` timeline.
- **Alternative A:** put the ramp directly on `clipGain`. One fewer node, but live Clip Gain changes (`setTargetAtTime`) would break the ramp.
- **Alternative B:** bake the fade into the buffer (pre-render each clip). No conflicts, but it costs memory and CPU on every edit and breaks the shared-buffer cache.
- **Verdict:** the current approach is the best of the three. The extra node only exists on faded clips, live playback and export share one path, and the conflict is avoided by design.

### Score: 8.5/10