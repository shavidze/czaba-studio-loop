I've finished reading the diff and the surrounding code. Here is the verdict.

COMMIT: OK

## Code Review: round 243 (C-R242-01 menu focus return): `StudioWorkspace.tsx`, `grid-snap-menu.test.tsx`, doc 187

**What changed:** the right-button press-focus capture moved. It used to happen in the lane's bubble handler `handleLaneBackgroundPointerDown`, which only ran after the blur. Now it happens in the scroller's `onPointerDownCapture` (`releaseEditFocusOnTimelinePointerDown`, `StudioWorkspace.tsx:1846-1848`), before the release blur. That leaves one place that writes the value. No auth, purchase or download code is touched. There are no new exports, dependencies, `any`, assertions, styles or listeners. Verify passed: 214/214 test files, `tsc` clean, build OK. Lint only shows warnings that were already there.

**Event-ordering check (real browser):** these lane handlers only see the right press after the scroller handler has run. The `window` capture listener `handleOutsidePointerDown` (`ArrangementGridMenu.tsx:141`) runs before the scroller capture. So a right press on another lane while a menu is open goes like this:
1. The open menu closes and focus goes back to the fader.
2. The scroller capture records the fader.
3. The blur runs.
4. `contextmenu` opens the new menu with `pressFocus = fader`.

This works whether `contextmenu` fires on mousedown (Mac) or mouseup (Windows/Linux). Both lane and clip-body requests come through `ArrangementLane.tsx:873`, which is inside the scroller (`StudioWorkspace.tsx:2589-2593`, `2842`).

### Critical Issues
- None.

### Suggestions (ranked)
1. **Medium — FR3 now expects the opposite of what it used to** (`grid-snap-menu.test.tsx:1152-1167`). Before, the menu did not give focus back to the brace and ArrowRight moved the clip. Now the brace gets focus back and ArrowRight moves the loop. This deliberately reverses the earlier D-29z22-F/FR3 rule, so a user's keyboard flow after Escape behaves differently. **Fix:** make sure D-29z382 is approved by root or the planner, not just by A or C, and add it to the decisions log before or with this commit. The code itself is fine.
2. **Low — the BPM field gets focus back after a mouse choice, and that path is untested** (`StudioWorkspace.tsx:1616`). GM41 only covers Escape. After clicking `0.5 s`, focus lands in a typing field, so global shortcuts like Space (play) and `g` (Snap) stop working until the user clicks away. That matches WAI-ARIA, but users may find it surprising. **Fix:** add a GM41 row for "choice → tempo focused" so it's an explicit, tested contract. Also do a quick Playwright check that focusing the field doesn't select its text or reopen editing.
3. **Low — the saved press focus can go stale** (`StudioWorkspace.tsx:1846-1848`). Every right press anywhere in the scroller records it, including the header, ruler, the menu itself and native-menu paths. It's only cleared by the next `handleGridMenuRequest`. It can't cause a wrong focus return, because it's only used when the active element is BODY and `closeGridMenu` checks `isConnected` (`:1616`). But it can keep a reference to a removed node until the next request. **Fix (optional):** clear it in `closeGridMenu`, or only record it when `event.target` is inside a lane body or clip. That second option would also narrow what this release handler is responsible for.
4. **Info — doc 187** explains the marker-editor limitation and opens TODO B-R242-MARKER-EDITOR-MENU-FOCUS. That's fine. The clip-rename hypothesis listed under TODO isn't confirmed yet; keep it out of the bug list until it's checked in a browser.

### Good Practices Found
- The fix targets the real cause (capture runs before bubble), and there is one writer instead of two.
- Before reading the value, `handleGridMenuRequest` clears it, even on rejected requests (`:1622-1626`), so a stale press can't apply to a later gesture.
- Mutant coverage (MU-LANE-CAPTURE-ONLY, MU-NO-SCROLLER-CAPTURE, MU-PRESS-WINS) shows the new rows actually catch the bug.
- Left-press release (FR1/FR2/FR4) is unchanged, so gesture lifecycle and Undo are untouched.

### Architecture note
- **Signal 2 + 3:** `StudioWorkspace.tsx:1843-1863`. The timeline release handler now does two jobs: it releases edit focus, and it records press focus for the grid menu. The grid-menu focus-return code (`:1608-1636`, `:1846`) changed in both round 242 and round 243, and each time it needed browser-ordering reasoning.
  - **Keep for now:** the change is small, it touches the same lifecycle (one pointerdown) and the refs are local.
  - **Proposal for the planner:** this is already listed as ARCH-CHECKPOINT-TEMPO-GRID addendum 8. Move `gridMenuPressFocusRef`, `gridMenuReturnFocusRef`, the open ref, `closeGridMenu` and the request handler into a single `useGridMenuFocusReturn` hook that exposes `notePressFocus(event)`. Acceptance criteria: GM1–GM43 and FR1–FR4 pass unchanged, and `useArrangement()` keeps its shape. Only do this if focus changes come up a third time.

### Alternative Approach
- **Current:** record the press focus in the scroller capture handler on every `button === 2`, before the blur.
- **Alternative:** skip the release blur on right presses. Doc 187 rejected this because header and ruler right presses would change too, and there would still be two writers. Another option: keep track of the last focused edit control with a `focusout` listener and use it when the menu opens. That needs a new listener and its lifecycle, which costs more.
- **Verdict:** the current approach is the smallest correct one. Only the target-scoping change in Suggestion 3 is worth considering.

### Score: 8.5/10