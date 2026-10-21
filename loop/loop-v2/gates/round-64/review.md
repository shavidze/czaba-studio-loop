## Code Review: Studio Lab round 64 — grid snap/edges, grid menu, 1/2 keys (diff vs `038ed5a`)

COMMIT: OK

Nothing here should block the commit. Auth, purchase and download code is untouched. `sfx-library.test.tsx` is in the diff, but the only change there is a describe timeout. I found no `any`, `@ts-ignore`, type assertions, code comments or hardcoded colours. The tokens `bg-elevated`, `text-accent`, `border-outline`, `ring-brand` and `bg-surface` all exist in `app/styles/app.css`. I read `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md` and `architecture-checkpoint.md`. Nothing new is user-generated, there's no `dangerouslySetInnerHTML`, and no error codes are involved.

### Critical Issues
- none

### Suggestions (most important first)
1. **Medium, product: edge snapping has no pixel threshold** — `app/lib/arrangement/grid.ts:2873-2890` (`nearestGridOrEdge`, diff lines). Any clip edge on any track pulls the clip whenever it is closer than the grid line. On the 10 s grid that means edges up to 5 s away. GS3 (`grid-snap-ui.test.tsx:849-863`) changed in this round: a short drag now moves the clip to 8.5 instead of leaving it alone. The 055–057 docs make this intentional, so it doesn't block. **Fix (if the Tech Lead wants it):** only consider an edge if it is within N px (`|candidate-raw|*pxPerSecond <= N`). That needs `pxPerSecond` passed into the `snap*OrEdges` functions.
2. **Low: hardcoded tuple indexes** — `StudioWorkspace.tsx:450-451` (`GRID_DIVISIONS_SECONDS[6]` / `[0]`). If the list gets longer, the "narrowest" message silently names the wrong division. **Fix:** use `GRID_DIVISIONS_SECONDS.at(-1)` and `GRID_DIVISIONS_SECONDS[0]`, or derive both from `adjacentGridDivision`.
3. **Low: Alt-bypass during a library drag may be unreliable across browsers** — `ArrangementLane.tsx:205` (`resolveSnapStep(..., event.altKey)` on a `DragEvent`). Some browsers and platforms don't report modifiers reliably on `dragover`/`drop`, and on Windows Alt can change `dropEffect`. The ghost and the drop use the same calculation, so they won't disagree, but the bypass may not work. **Fix:** check it in a real browser (`/qa`). If it fails, take the modifier from a window `keydown`/`keyup` ref.
4. **Low, accessibility: the grid menu can't be opened from the keyboard** — `ArrangementLane.tsx:758-761`. The menu itself is solid (`role="menu"`, `menuitemradio`/`menuitemcheckbox`, roving tabindex, Esc/Tab, focus return). But the only way to open it is a lane `contextmenu`, and the lane is not a focusable trigger. The select plus the 1/2 keys cover the same actions, so nothing is lost. **Fix:** nothing needed now. If the menu becomes the main control later, add Shift+F10 / ContextMenu-key handling on the focused lane.
5. **Low, macOS: Ctrl+click on an empty lane seeks instead of opening the menu** — `StudioWorkspace.tsx:1060` and `handleGridMenuRequest:497`. Ctrl+click sends `button 0`, so a lane gesture starts first and `isPointerGestureActive()` then suppresses the menu. A real right-click or two-finger tap works, because every `pointerdown` filters `button !== 0`. **Fix:** in `handleLaneBackgroundPointerDown`, return early for `event.ctrlKey && navigator.platform` on Mac. Only if this matters for the product.
6. **Low, test hygiene: 15 s timeouts** in `track-layout`, `master-ui`, `fader-guards`, `grid-snap-ui` and `sfx-library`. This is documented in 049, but a uniform 15 s can hide render-cost regressions. **Fix:** a planner backlog item to profile the slowest suites.

### Checked by hand — tests can't catch these, no problems found
- **Dismiss-click swallow** (`ArrangementGridMenu.tsx:27-62`): it adds `pointerdown`/`click` listeners while a capture `pointerdown` is being dispatched. Per the DOM spec the listener list is cloned during dispatch, so the new listeners don't fire for the current event. Release happens on pointerup/cancel (timer 0), a new pointerdown, a non-repeat keydown, or blur. Every path cleans up and the timer is cleared, so nothing leaks. A right-click (no click event) releases on pointerup.
- **Effect on menu open** (`StudioWorkspace.tsx:522-555`): it adds scroll, resize and blur listeners and removes all three, keyed on `isGridMenuOpen` + `closeGridMenu`, which is stable. The guard against Follow-mode auto-scroll is correct.
- **Double-step risk on the select's 1/2 keys:** none. `isTypingTarget` treats `HTMLSelectElement` as typing (`StudioWorkspace.tsx:230`), so the global handler skips it. In the global handler, Ctrl/Meta hit the `if (modifier) return` at line 1310 first, so browser Ctrl+1/2 tab switching isn't intercepted.
- **Menu keydown/keyup `stopPropagation`:** the global bubble listeners on `window` don't receive Space, Arrow or Digit keys while the menu is open. Play/pause and nudge don't fire.
- **Enter/Space on menu items:** keydown `preventDefault` plus the `repeat` guard. The keyup `click` can't fire twice, because by then focus has returned to a different element.
- **Range click on a clip:** a seek no longer runs on `pointercancel`. That's a real fix.
- **`timeLocked`:** the explicit `original.start` guard prevents rounding drift on starts with µs precision.
- **`planClipLaneMove`:** rounding moved from ms to µs. This is consistent with edge targets like `6.000437` (SL1/SL2).
- **Render cost:** opening or closing the menu re-renders the workspace once. `handleGridMenuRequest` is a `useCallback` with `[]`, so lane props stay stable. Each pointermove and dragover runs `clipEdgeTargets`, which is O(n log n) over all clips. At the demo's scale this doesn't matter.

### Good Practices Found
- The snapping logic is pure functions in `lib/arrangement/grid.ts`, and the components only pass values through.
- `onCloseRef` keeps the outside-pointerdown effect free of dependency churn.
- Focus return checks `isConnected` and skips `body`.
- `aria-keyshortcuts="1 2"` and the 1/2 hints in the select's title.

### Architecture note
- **Signal 4 (new state/lifecycle in an existing owner):** `StudioWorkspace.tsx:459-461, 469-555`. The grid menu's open state, focus-return ref and scroll/resize/blur effect sit in a workspace that already owns follow-scroll, the marquee and keyboard handling. Keep for now: the scroll-close rule is tied to `autoScrollLeftRef`/`followModeRef`, and moving it out now would add prop plumbing.
- **Signal 3 (one region changed repeatedly at high cost):** the move/trim branches of `ArrangementClip.tsx` (`groupDeltaOnGrid`, `moveStartOnGrid`). They've changed across several rounds (046–057), and the ms/µs rounding rule is now spread across `roundTime`, `roundGridTime`, `toWholeMicroseconds` and `planClipLaneMove` (already logged in doc 055 as ARCH-CHECKPOINT-SRW14-PREFS).
- **Proposal for the planner (not approved scope):** one bounded task, "single time-precision rule". Move the time rounding into one `lib/arrangement/time-precision.ts` module and have `grid.ts`, `selection.ts` and `ArrangementClip.tsx` use it. Owner: `studio-specialist`. Acceptance: no behaviour change. The existing grid-snap-*, selection and track-layout tests pass unchanged, plus µs boundary tests (SL1 and the GROUP-SUBMS-GRID-EDGE case). Undo/Redo atomicity and the gesture lifecycle must not change.
- This reviewed the diff only; I'm not claiming a full module audit.

### Alternative Approach (the Studio edit pipeline is critical logic)
- **Current:** the snap target is whichever of the grid line or any clip edge is nearest in seconds, with no zoom dependency. For group moves, an edge target is used only if it's within bounds; otherwise it falls back to the grid.
- **Alternative:** a pixel-based magnet. An edge only competes within ~8 px at the current zoom; otherwise it's grid only. This is closer to how Ableton and Logic behave, keeps the coarse grid predictable, and means fewer surprises like the GS3 change.
- **Verdict:** keep the current approach for this commit. It's deterministic, tested, zoom-independent and documented. Whether to switch to the pixel magnet is a Tech Lead UX decision, which belongs in a separate round together with the time-precision task above.

### Score: 8.5/10