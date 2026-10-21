## Code Review: Studio checkpoint r37 (diff vs `1cefea1` plus `track-pan.test.tsx` and `fader-guards.test.tsx`)

I put the review of all changed files in one section because this is a single checkpoint diff. Changed files: `ArrangementLane.tsx`, `StudioWorkspace.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementContext.tsx`, `graph.client.ts`, `model.ts`, `types/arrangement.ts`.

### Critical Issues
- **No Critical or High blockers.** I didn't edit anything. Details for the three areas you asked about:
  - **Pan audio graph:** `applySchedule` is the only place that creates panners. It's called from the live path (`ArrangementContext.tsx:708`) and from export (`graph.client.ts:289`). Export reads `track.pan` through `clampPan` at setup, so the export and live playback hear the same pan. The `setTrackPan` handle does nothing once disconnected, for an unknown track, or for a repeated value. A reschedule during a drag carries the preview value forward through `panOverrideRef`. A video track can't be given a pan because the model refuses it.
  - **Keyboard guard and focus:** The Delete/Backspace guard only exempts real `input[type=range]`. A `role="slider"` such as the playhead still deletes, and a test pins this. The gesture-blocked branch above it is unchanged. Both focus-release handlers do nothing while `isPointerGestureActive()` is true, so a second pointer can't blur a field during a drag. The scrollbar-gutter exemption takes the border into account.
  - **Pending Clip Gain:** On blur during a gesture, the typed text is now kept and nothing is written. Enter still resets the text and shows the blocked status. The early return still compares the raw text, which matches C-R37-02.
  - **Can a Pan commit be refused and lost?** I checked. `beginPointerGesture(` has exactly one caller, inside `claimPointerGesture`, and claims are exclusive. So after `finishTrackPanGesture` releases its claim, the gesture count is 0. That means `setTrackPan` inside `commitTrackPan` cannot hit `refuseEditDuringGesture`.
  - **Data loss or security:** Arrangements have no persistence or serialization layer (I found no localStorage, IndexedDB or `JSON.parse` in the arrangement code). There's no `dangerouslySetInnerHTML`, no new network calls and no secrets. Nothing from `SECURITY_AUDIT.md` applies. `ERROR_TAXONOMY.md` doesn't apply either, because no API or error codes are touched.

### Suggestions (Low, not blocking)
1. **Pan keyboard can stay locked after a window blur.** While the blur-suppression is set, `handlePanChange` ignores every change, including arrow keys. Only a successful new pointerdown, or a pointerup/pointercancel with the old pointerId, clears it. If that release is lost during a window blur, the Pan keyboard stays dead until the user clicks the slider. This is separate from C-R37-01 and C-R37-02. It's a candidate for stage 4b.
2. **A drag can create one undo entry per input event in a rare case.** If `claimPointerGesture`'s window-`blur` abort runs without the element getting a `blur` first, `panDragCleanupRef` is still set while the gesture is gone. Further drag input then goes down the keyboard path and records one undo entry per event. I couldn't reproduce this order in normal browsers, where the element blur fires first, so I'm only noting it.
3. **`trackPanValue` returns `track.pan` with no clamp or finite check.** The graph clamps it, but the UI (`formatTrackPan`, the slider value) doesn't. That only matters once there's import or persistence, so it's not reachable today.
4. **The `handle.setTrackPan` interface has no clamp of its own.** Every current caller passes values already normalized or taken from the model, so this is just a defensive note.

### Good Practices Found
- `setArrangementTrackPan` removes the key at 0. Old arrangements keep the same shape, and `isSameArrangement` uses JSON, so a no-op stays a no-op. `-0` and `NaN` are handled.
- Preview, commit and cancel use refs only, so a drag adds no history, needs no reschedule and makes exactly one undo entry. Starting a Pan gesture first flushes any pending Volume or Master preview.
- Window listeners are cleaned up on unmount and on every exit path, and a test checks the listener identities.
- There are must-not tests: the playhead still deletes, typing fields keep Backspace, and a separator gesture blocks the edit. There's also a test pinning the known limitation where a selection change discards the kept text.
- The code follows the project rules: no `any`, no type assertions, no comments, design-token classes only, semicolons throughout.

### Alternative Approach (Studio audio pipeline)
- **Current approach:** The live pan is held in `panOverrideRef` and applied to `tracks` when the graph is scheduled and when it's synced. It goes into history only once, on release.
- **Alternative:** Preview into `history.present`, as the Volume path does with `previewActiveRef`, and commit on release.
- **Verdict: keep the current approach.** It makes no re-renders and no history churn per move. It keeps the preview value through a reschedule mid-drag (tested), and cancel only has to push the stored value back. The cost is a second source of truth during a drag, but it's limited to one track and cleared on every exit path. One possible follow-up for 4b: Volume and Pan now use two different preview mechanisms, and making them the same would simplify that work.

### Score: 8.5/10

**What I didn't cover:**
- I didn't run `verify` or smoke; you're running those.
- I didn't read the body of `renderArrangementWav` directly. I relied on the test's source assertions and the grep of call sites.
- I read only the C37 report for residuals, not the C31ΓÇôC36 reports.
- I didn't check real-browser timing of `change` vs `pointerup` on range inputs.
- The existing sync and SSR issues are still open and out of scope.
