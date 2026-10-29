COMMIT: OK. None of the three paths touch auth, purchase or download code. Typecheck, the unit tests (214 files, 3095 tests) and the production build are green. The lint warnings are old ones in other files, not in `ArrangementMarkerRow.tsx`.

## Code Review: ArrangementMarkerRow.tsx + markers-ui.test.tsx + 189-marker-undo-focus.md

### Critical Issues
- None.

### Suggestions (most important first)
1. **Browser event order (Low; I found nothing that conflicts with it).** When Chromium removes the focused flag, it fires `blur`/`focusout`, and those bubble to the parents before the new layout effect at `ArrangementMarkerRow.tsx:208-215` moves focus again. I searched for `onBlur`/`onFocusOut`/`focusout`/`relatedTarget` in the arrangement containers, and for `'focusout'`/`onBlurCapture` in all of `app/` outside tests. Nothing that could react to it turned up, so nothing should fight the refocus. The remaining gap is that the Cut Time path was only checked in jsdom (MU23); the doc's Playwright checks cover undo of an add, redo of a delete and undo of a move. **Fix:** add a `cutTime` case to the next browser check on `/studio-lab`.
2. **Two focus requests in the same commit (Low, can't happen today).** `:214` calls `focusMarkerTarget`, and when it succeeds it clears `pendingFocusRef`. This layout effect runs before the passive effect at `:217-225`. So if a future path both sets `pendingFocusRef` and removes the focused flag in one commit, the removal rule silently wins. Today the only direct write is `commitMarkerMove` at `:458`, and a move keeps the marker's id, so this can't happen. **Fix:** none needed now. If such a path is ever added, decide explicitly which focus request wins and add a test.
3. **Fragile assumption about the inline ref (Low).** The saved `order` (`:825`) is only correct because the ref callback is inline: when React calls it with `null`, it sees the previous render's `markers`. The doc names this risk. **Fix:** a short Georgian comment next to the ref callback would be allowed under the project rules ("ქართული კონტექსტი") and would protect it better than the doc alone.
4. **TS nit.** The `{ readonly markerId: string; readonly order: readonly string[] }` shape is written twice (`:126` and `:178-181`). **Fix:** declare one `type DetachedFlagFocus` near `orderMarkersForDrag` and use it in both places.
5. **Render cost (no action).** Because the ref is inline, every re-render calls the old ref with `null`. While a flag is focused, each re-render therefore allocates `markers.map(...)` and the effect does one null check. The cost is O(markers) and small. The row doesn't re-render on every playhead frame because it reads `getLivePosition` rather than holding the position in state.

### Good Practices Found
- The successor rule (next flag, else previous, else Add) uses the same order as `removeMarker` (`:427`). It skips neighbours deleted in the same step, which Cut Time can do (MU23).
- Focus is only moved if the removed flag actually held focus (`detachedNode === document.activeElement`). Focus on BODY or on another control is never taken (MU21).
- The `markers.some(id)` check makes re-attaching the inline ref on a normal render harmless (MU22). The implementer's deliberate-break runs show 8 tests fail without this check.
- The order is correct because markers are kept sorted on write (`sortMarkersByTime` in `markers.ts:85,128`).
- The approach doesn't depend on `onBlur`, which jsdom and Chromium handle differently. React 18 detaches the ref while the node is still `activeElement`, before it is removed.
- No new `any`, assertions or suppressions; semicolons are in place and lines stay within Biome's 100 columns. `removeMarker`, the editor, menus, drag code, status strings and history labels are unchanged.
- The doc is in Georgian, follows TEMPLATE, and its number (189) doesn't collide with an existing file.

### Architecture note
- **Signal 4 (new state/lifecycle in an existing owner):** `ArrangementMarkerRow.tsx:178-181,208-215`. This adds a fourth focus-tracking ref (alongside `restoreFocusRef`, `blurSuccessorRef` and `pendingFocusRef`) and a second effect without deps. **Keep:** it is one lifecycle with no prop plumbing, and audio timing, gesture lifecycle, Undo/Redo atomicity and the `useArrangement()` interface are unchanged.
- **Signal 3 (one region keeps changing at high cost):** focus-after-removal in this file has been reworked over several rounds (MU8, MU8b, MU8c, MU18–23), each needing the inline-ref ordering reasoning. B-R245-UNDO-GROUP-FOCUS will need the same logic in `StudioWorkspace.tsx`.
  - **Proposal for planner (not approved scope):** when B-R245 is scheduled, build a single focus-successor mechanism shared by the marker flags and the group rows, rather than a second copy.
  - **Acceptance:** MU18–23 and the new group-row tests stay green.
- This is a review of the diff only; I did not audit the whole module.

### Alternative Approach (Studio focus/Undo logic)
- **Current:** record the removal when the flag's ref is detached, then move focus in a layout effect once the id is really gone from `markers`. This covers undo, redo, Cut Time and any future way of deleting a marker.
- **Alternative:** move focus inside `StudioWorkspace` around `undo()`/`redo()`/Cut Time.
- **Verdict:** keep the current approach. The alternative needs a hook at every deletion path, so new paths would be missed. It would also move flag-focus knowledge out of the component that owns it. The current approach's only cost is the inline-ref assumption in suggestion 3.

### Score: 9/10