I've finished checking; here is the review.

COMMIT: OK

## Code Review: round-249 — SABA-B-10a stage 1 (separate Insert Marker)

This reviews only the diff in `diff.patch` plus the two new files. It is not a full audit of `ArrangementContext` or `StudioWorkspace`. The diff doesn't touch auth, purchase, download or protected-file code: the 11 paths cover only arrangement components, the context, strings, tests and the doc. Verify passed with 215 test files and 3,123 tests, typecheck clean, and the build succeeded. Lint shows only warnings.

### Critical Issues
- None.

### Suggestions (most important first)
1. **Stopped handle drag now clears the time selection.** `app/contexts/ArrangementContext.tsx:1519-1521`
   - `endPlayheadScrub` now calls `placeInsertMarker` when stopped, and that calls `setRange(null)`.
   - Handle drag already used `onScrubEnd` before this round (`ArrangementRuler.tsx:116,179`). So dragging the playhead handle while stopped, or now pressing ←/→ on it (`:200`), clears a range that used to survive.
   - Doc row D-29z431 / Live 6.9 says this is intended, but it changes an existing flow and no test pins it.
   - **Fix:** add one IM row: range set → stopped handle ←/→ → range is `null`. That way a future revert gets caught.
2. **`seekTo` keeps the range but Space plays from the range start.** `ArrangementContext.tsx:1435` vs `:379-380`
   - Ctrl+←/→ and a single flag click go through `seekTo`. They move the marker and keep the range, so the next Space plays from `range.start`, not from where the user just jumped.
   - This is already logged as SABA-Q-10A-CTRL-ARROW-RANGE. Nothing to fix now. The planner should keep it with the stage-2 questions so it isn't lost.
3. **Dead prop after the arrow-key change.** `app/components/arrangement/ArrangementRuler.tsx:64`
   - `ArrangementRulerPlayhead` still destructures `onSeek`, but nothing uses it after `:200` switched to `onScrubEnd`.
   - **Fix:** remove `onSeek` from that destructure (the parent `:262/282` still needs it). It's only a lint warning, but leaving it in makes it look like the handle still seeks.
4. **A test-only node ships to production.** `app/components/arrangement/StudioWorkspace.tsx:497-519` (`ArrangementInsertMarkerSignal`)
   - It's a hidden `div` with `data-testid` and a store subscription, used only by tests. Cost is small: one subscription, attribute writes, no React re-render. The effect cleans up correctly.
   - **Fix (in 10b):** move the subscription into the visible marker component and point IM/BR4b at its `data-insert-marker`. Then delete this node.
5. **Each action writes the marker store twice.** `ArrangementContext.tsx:1457-1458` and `:1470` + `:1472/1483/1487`
   - `returnToStart` and `playFrom` call `placeInsertMarker(target)`, then `seekTo(target)`, which calls `writeInsertMarker` again. That's two subscriber notifications per action.
   - It's harmless today but will matter once 10b renders a blinking marker.
   - **Fix:** a private `seekPlayhead` without the marker write that these two call. Or accept it and note it.
6. **Ctrl/Cmd+Shift+Space isn't blocked during a pointer gesture.** `StudioWorkspace.tsx:2184-2189`
   - `moveInsertMarkerToPlayhead` → `placeInsertMarker` → `setRange(null)` can run in the middle of a range or marquee drag. The gesture's finish then writes the range again. This is a real-browser ordering issue that jsdom tests won't see.
   - **Fix:** `if (current.isPointerGestureActive()) return;` before the call, as the KeyO branch at `:2166` does.
7. **The new shortcuts aren't discoverable yet.** Shift+Space and Ctrl/Cmd+Shift+Space have no `aria-keyshortcuts` and no shortcut-sheet row. The doc defers this to 10b, so it's a reminder, not a block.
8. **Status copy vs button label.** `app/lib/arrangement/strings.ts:634-635`
   - The status says "Stop, then Space…" while the transport button still reads "Pause".
   - Already tracked as B-R249-PAUSE-LABEL / SABA-B-9. Ship as is.
9. **Mac path unverified.** Cmd+Shift+Space is only sent, not actually checked, in IM3 (the doc admits A-MU-CTRL-ONLY survives). Covered by TLM-R249-MAC-CMD-SHIFT-SPACE; not raising it again.

### Good Practices Found
- **One start path.** `startPlaybackAt(from)` takes the old `togglePlayback` body unchanged. Space, Shift+Space and `playFrom` all share the same D-27 and loop rules, and `playFrom` no longer depends on `togglePlayback` reading `positionRef`.
- **Store reuse.** The second store uses the existing `createArrangementPositionStore` and its own context. Every new callback is a stable `useCallback`, so `value` doesn't churn (BR11 still green).
- **Keyboard edge case handled.** The key-up `preventDefault` now covers Ctrl/Cmd+Shift+Space on focused buttons (IM14), and `event.repeat` is guarded in every new branch.
- **Cut Time.** It remaps the marker with the same `remapTime` used for the playhead.
- **Project rules.** No `any`, no assertions, no new className or colours, English status strings with exact-text tests, semicolons present.
- **Doc quality.** The implementation doc is thorough: each path decision is written down, and 16 mutants were run to prove the tests fail when the code is wrong.

### Architecture note
- **Signal 4 (new state/lifecycle in an existing owner):** `ArrangementContext.tsx:646,684,795-808,1317-1465`. The provider gains a second position store, a ref, a context and four transport callbacks.
- **Signal 3 (one region changed repeatedly):** the Space/transport branch in `StudioWorkspace.tsx:2183-2211` and the `startPlaybackAt` area have changed across several rounds. Stage 2, 10b and B-9 are still queued against the same code.
- **Keep for now.** The marker and playhead share one lifecycle: `isPlayingRef`, `positionRef`, `scrubbingRef`, the `remapTime` in Cut, and the `startGraph` timing. Pulling them apart mid-feature would mean reworking audio-timing refs and the shape of `useArrangement()`. Cost of splitting now: medium/high; benefit: low until 10b lands.
- **Proposal for the planner (not approved scope):** after 10b and B-9 merge, one bounded task: extract a `transport positions` unit (two stores, remap, `startPlaybackAt`, marker/playhead write rules) inside the context file's ownership.
  - Acceptance: `useArrangement()` keeps the same shape; IM1–IM14, BR4b, EN3 and the cut-time tests stay unchanged and green.
  - Also retire `ArrangementInsertMarkerSignal` in the same task.

### Alternative Approach (Studio audio pipeline is critical logic)
- **Current:** a second subscribable store (`insertMarkerStore` + ref + context), with `startPlaybackAt(from)` taking the start point as a parameter. Space and Shift+Space pick the source; timeline clicks write only the marker while playing.
- **Alternative:** keep the single position store and add just a plain `insertMarkerRef`, read by `togglePlayback`. No new context, no hidden signal node.
- **Verdict:** keep the current approach.
  - The ref-only version is lighter today, but 10b needs a subscribable value to draw the visible marker without re-rendering the workspace. The ref would have to become a store later, touching the same code twice.
  - Security is the same either way. For UX, the current approach is the one that makes the visible marker possible.

### Score: 8.5/10