COMMIT: OK (no blocking findings; nothing touches auth, purchase or download)

## Code Review: SRW-16 stage 2a — moving markers + marker menu (round 75)

This reviews the round-75 diff and the 3 new files only. It is not a full audit of `ArrangementMarkerRow` or the Studio module.

**What was checked:**
- `paths.txt` has 10 files, all under `components/arrangement`, `lib/arrangement` and `docs/implementation`. No auth, cart, purchase or download code is touched.
- `verify.log`: agents:check passes and there are 104 test files with 1766 tests, all passing. The Biome lines in the log are in an existing file outside this diff.
- Read: `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md`, `architecture-checkpoint.md`.
- No `any`, `@ts-ignore` or `as` was added. No `dangerouslySetInnerHTML`. Marker names render through React's escaping in `aria-label`, `title` and text.
- Error codes from ERROR_TAXONOMY don't apply, because this diff has no API calls.

### Critical Issues
- none

### Suggestions (most important first)

1. **Zooming during a drag makes the marker jump** — `ArrangementMarkerRow.tsx:343-344`
   - `handleMarkerPointerMove` turns `dx / pxPerSecond` into time using the current render's `pxPerSecond`. But `startX` and `original.time` were saved when the drag began.
   - If the user Ctrl+wheels with the button still held, the next pointermove rescales the distance and the marker jumps.
   - The layout effect at :251-257 closes the menu on zoom but leaves the drag running.
   - **Fix:** in that same effect, if `dragRef.current` is set, call `endStaleMarkerDrag(dragRef.current)`. Or save `pxPerSecond` into `MarkerDragGesture` in `beginMarkerDrag` and use that value.

2. **A cancelled pointer commits the move** — `ArrangementMarkerRow.tsx:717-718`
   - `onPointerCancel={finishMarkerDrag}` saves `lastTime` as a new Undo entry.
   - Every other abort path (blur, gesture claim taken, lost capture) reverts through `endStaleMarkerDrag`.
   - The project's precedent for cancel is revert: `ArrangementLane.tsx:515` and `ArrangementDetailPanel.tsx:758`.
   - **Fix:** in `finishMarkerDrag`, if `event.type === 'pointercancel'`, call `endStaleMarkerDrag(gesture)` and return.

3. **A blocked press still moves focus and selection** — `ArrangementMarkerRow.tsx:279-281`
   - `flag.focus()` and `setSelectedMarkerId` run before `claimPointerGesture`.
   - So if another gesture is active, the press is refused, but focus and `aria-current` still move to that marker.
   - **Fix:** move the claim first. Keep `focus()` before the claim only if rename-on-blur must finish before the `before` snapshot. Today it does finish first (blur → `settleEditor` → `getArrangement()` already reads the new state), so keep that order and move only `setSelectedMarkerId` after the claim.

4. **"Opened from keyboard" check is unreliable** — `ArrangementMarkerRow.tsx:392`
   - `event.button !== 2` misfires for touch long-press and for Ctrl+click on macOS in some browsers (both send `button: 0` with real clientX/Y).
   - The result is only cosmetic: the menu anchors to the flag instead of the pointer.
   - **Fix:** treat it as keyboard when `event.detail === 0`, or when `clientX === 0 && clientY === 0`.

5. **`aria-expanded` is never `false`** — `ArrangementMarkerRow.tsx:737`
   - A control with `aria-haspopup="menu"` should report `aria-expanded={false}` when the menu is closed. Right now it is `undefined`, so screen readers don't announce the closed state.
   - Optionally, also add an `id` to the menu and `aria-controls` on the flag.

6. **The menu can get stuck if its marker disappears** — `ArrangementMarkerRow.tsx:489, 548`
   - If the marker is removed while the menu is open, `menuMarker` becomes `null` and the portal unmounts. But `menu` state stays set, and focus drops to `body`.
   - It is hard to trigger today (the menu's keydown `stopPropagation` blocks Ctrl+Z), but the state is still inconsistent.
   - **Fix:** clear it with a `useEffect` when `menu && !menuMarker`.

7. **The menu doesn't follow page scroll or Follow page-flips** — the menu is `fixed`
   - Scrolling the window or another ancestor doesn't close it.
   - A Follow page-flip (`StudioWorkspace.tsx:1109-1111` syncs `lastScrollLeftRef` first, so `left === previousLeft`) also keeps it open while the flag moves away. That matches MV16's intent.
   - For now this only needs a note in doc 065. No change required.

8. **Check in a real browser** (tests can't catch these):
   - On macOS/Linux, `contextmenu` fires on pointerdown, before pointerup. Tests use the Windows order in `rightClickFlag`. Tracing the code, the grid menu's capture handler closes it, then `contextmenu` opens the marker menu, and the new listener doesn't receive the current event. It looks correct, but needs a smoke run.
   - On Windows, check that pressing Shift+F10 opens exactly one menu (the guard at :393 is there to stop a second one).
   - Check that dblclick doesn't play after a drag followed by a quick click.

### Good Practices Found
- `dragOrder` and `orderMarkersForDrag` keep the DOM order fixed during a drag. Without this, React's `insertBefore` would make Chrome drop pointer capture and focus. After the drop, `pendingFocusRef` puts focus back. This is the right fix for a browser issue tests don't see.
- `moveMarker` is a pure function and returns a typed `moved | unchanged | conflict` result. It returns the same reference when nothing changes, and it has 4 lib tests.
- A drag creates exactly one Undo entry (`commitArrangement(..., 'Move Marker', before)` with the `before` saved at pointerdown). During the drag only `previewArrangement` runs, and MV13 confirms no new buffer sources are created.
- The gesture contract is respected: `claimPointerGesture`, a stale callback, the `watchUncapturedPointerGesture` fallback, and `release` on unmount.
- `ArrangementMarkerMenu` removes all three window listeners in its cleanup. `armGridMenuDismissClickSwallow` detaches itself, and there is no timer leak (the `suppressClickAfterDrag` timeout only writes a ref).
- After `preventDefault`, `touch-none` and `focus({ preventScroll: true })` are used deliberately.
- Shift+Arrow and Ctrl+Arrow are not taken over. Clip nudge is protected by `isMarkerTarget` (StudioWorkspace:1519), and MV7 confirms Ctrl+Arrow still navigates.
- Tailwind only uses tokens (`bg-surface`, `border-outline`, `hover:bg-elevated`, `ring-brand`), with no hardcoded colours. Inline style is used only for dynamic `left`/`top`.
- `StudioWorkspace.tsx:1056-1063`: the `followAutoScroll` condition mirrors the existing `pauseFollowForNavigation` guard, so vertical scroll and the follow tolerance don't close the menu.
- Render cost is fine: `sortedMarkerIndex` and `orderMarkersForDrag` are O(n) per render, and the drag preview uses the same path as clip drag.

### Architecture note
These are proposals only, not findings for this round.

1. **Coupling:**
   - Evidence: `ArrangementGridMenu.tsx:29` now exports `armGridMenuDismissClickSwallow`, and `ArrangementMarkerMenu.tsx:3` imports it from a component file.
   - The two menus duplicate about 70% of their logic: clamp positioning, roving focus, outside-dismiss, the keydown map.
   - **Keep for now:** behaviour is tested and there is no correctness cost today.
   - **Proposal for the planner:** one bounded task to extract a shared `ArrangementContextMenu` shell (or a dismiss/position helper in `lib/arrangement`).
     - Acceptance: `markers-move-ui.test.tsx` and the grid menu tests pass with no test changes.
     - Value: medium. Risk: low.
2. **Ownership:**
   - Evidence: `StudioWorkspace.tsx:1061-1063` reaches into the row's imperative handle with `closeMenu()`, even though `notifyTimelineScroll()` is two lines below.
   - **Keep:** it's 3 lines and follows the follow-pause semantics.
   - **Proposal:** the row subscribes to the scroll notification, and `closeMenu` is removed from the public handle. Value: low.
3. **New state/lifecycle in an existing owner:**
   - Evidence: `ArrangementMarkerRow` gains drag and menu state, 3 refs, a timer and a layout effect (:152-165, :250-257).
   - **Keep, because** it fits marker ownership and the gesture-claim contract. Pulling it out would need the same `before`/preview/commit plumbing and would protect no invariant.

### Alternative Approach (gesture pipeline = critical logic)
- **Current:** the drag lives in the component (`dragRef`), and the context only provides `previewArrangement`, `commitArrangement` and `claimPointerGesture`. The Undo entry is atomic and the `useArrangement()` shape doesn't change.
- **Alternative:** a context-owned marker drag API (`beginMarkerMove`/`updateMarkerMove`/`endMarkerMove`), like a central gesture store.
  - Gain: one place for abort and cancel rules.
  - Cost: the public hook's shape changes, and every existing test that uses the context API would be affected.
- **Verdict:** keep the current approach. The abort paths (blur, claim taken, uncaptured) are already covered by MV14 and MV12. Only the cancel rule (Suggestion 2) needs to be aligned.

### Score: 8.5/10