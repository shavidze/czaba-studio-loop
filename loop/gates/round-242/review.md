COMMIT: OK

## Code Review: round 242 (14 paths; SABA-B-11b stage 2a + C-R241-01 focus fix-up)

The paths file lists 14 files, and the untracked list is empty, so there are no new files. Verify passes: 214/214 test files, typecheck clean, build OK. Lint shows only warnings in files outside this diff. No auth, purchase, download, token or API code is touched. The diff adds no new listeners, timers or effects, uses no `any`, suppressions or type assertions, and uses only Tailwind tokens (`text-muted`, `border-outline`).

### Critical Issues
- none

### Suggestions (ranked)
1. **Medium: the menu can be taller than the window, and nothing lets it scroll** (`app/components/arrangement/ArrangementGridMenu.tsx:202`).
   - **Problem:** the menu box has no height limit and no scrolling. With a BPM set it now holds about 20 items × 28px, 2 group labels (~22px each), 3 `<hr>` (~9px each) and padding. That is about 640px; before this diff it was about 450px.
   - **Effect:** when the menu is taller than the window, `clampGridMenuAxis` (`:35-38`) pins it to `top=4`. Snap (G) and Triplets (3) then sit below the window edge. A mouse can't reach them. A keyboard user can move focus there, but `focus({ preventScroll: true })` (`:127`, `:148`) never brings them into view.
   - **Why the Playwright check doesn't cover it:** the 1280×720 run measures 720px of page area. A 1080p laptop at 150% scaling has only about 600–640px of page area once the browser toolbars are counted.
   - **Fix:** add `max-h-[calc(100dvh-0.5rem)] overflow-y-auto` to the root class. The clamp maths stays correct because `offsetHeight` can no longer exceed the window. Scrolling inside the menu won't close it, because the close-on-scroll effect listens to the lane scroller only.
   - **Why it doesn't block:** no data is at risk, and the G, 4 and 3 keys still work. Treat it as the next fix-up.
2. **Low: `gridMenuPressFocusRef` can keep an old element** (`StudioWorkspace.tsx:1877-1881`).
   - **Problem:** only `handleGridMenuRequest` (`:1622-1623`) clears the ref. On Windows the context menu event fires on mouseup. If the user right-presses a lane, drags off and releases elsewhere, the lane never gets that event, and the ref keeps the element until the next right press.
   - **Why it's harmless today:** every way of opening the menu starts with a right press on a lane, and `closeGridMenu` checks `isConnected`. One exception: on macOS, Ctrl+click is `button 0`, so it neither records nor clears the ref.
   - **Fix:** in `handleLaneBackgroundPointerDown`, set the ref for `button === 2` and clear it (`= null`) for every other press. That is one line.
3. **Low: the status text can come out empty** (`StudioWorkspace.tsx:1656-1658`).
   - **Problem:** `width?.label ?? ''` can produce "Adaptive grid — , now 1 s". The menu can't trigger this, but `onChooseAdaptiveDensity(density: number)` accepts any number.
   - **Fix:** pass the `GridAdaptiveWidthOption` (or its label) through the callback instead of looking it up again by density.
4. **Low / accessibility:** the two `<fieldset>` groups inside `role="menu"` are valid ARIA, since a fieldset is a group named by its legend. But in adaptive mode the Fixed group has no checked item, so a screen reader can't hear the current division from inside the menu. The doc records this as a choice (D-29z369), and the division is still announced by the `<select>`. No change needed now; it needs Saba's confirmation.

### Good Practices Found
- **The focus fix fits real browsers, not only jsdom.** In a real browser the order is: pointerdown, then mousedown (which moves focus to `<body>`), then the context menu event. Chromium, WebKit and Firefox on Linux fire that event on mousedown; Windows fires it on mouseup. Capturing at pointerdown comes before the focus loss in all of these. Because the ref lives until the context menu event, the Windows case is covered too.
- **Right presses on a clip reach the lane handler.** `ArrangementClip.tsx:389` and `ArrangementClipEnvelope.tsx:131` return before `stopPropagation` for any button other than 0, so a right press on a clip bubbles up (GM39). Audio and video lanes share the same `ArrangementLane.tsx:872-876` handler.
- **Old behaviour is preserved where it should be.** If focus is still on a real element when the menu opens, that element wins (GM38). The press-time element is only a fallback when focus is on `<body>`.
- **Index maths in the menu is consistent:** width items come first, then `widthCount + divisionIndex`, then `snapIndex`, then `tripletIndex`. `itemCount` and arrow-key wrap-around (the GM7 loops of 13 and 9 steps) match.
- **Key `4` follows the same pattern as G:** plain key only, ignores auto-repeat, sits after the modifier `return` (`:2231`), and works on the select without triggering its type-ahead search. `aria-keyshortcuts` and the shortcut sheet are updated.
- **Each new test in the menu fix-up has a mutant that makes it fail** (MU-NO-PRESS-CAPTURE, MU-PRESS-WINS). The test edits change only expected values or which group a query searches, and no assertion was deleted.
- **No import cycle:** `grid-divisions.ts:911-917` reads `studioGridStrings` when the module loads, and `strings.ts` imports only `./shortcuts`, which imports nothing.

### Architecture note
- **Signal (3 + 4): the grid area of `StudioWorkspace.tsx`.** Rounds 239–242 have all changed it. This round adds a ref (`:578`), a handler (`:1646-1663`) and a pointerdown branch (`:1877-1881`). The handling of keys 1–5 now exists in two places: the window handler (`:2262-2294`) and the select's `onKeyDown` (`:2650-2672`). Adding `4` meant editing both.
- **Keep for now:** stage 2b will touch the same `snapSeconds` plumbing. Extracting code mid-way would force the GM/GAU/GU/TU test suites to be rewritten twice. Moving the refs out could also change grid ref and focus-return timing and the gesture lifecycle.
- **Proposal for the planner, after the 2b C PASS (a suggestion, not approved scope):** one bounded task. Add a `dispatchGridDigit(code)` helper that both the window handler and the select call. Optionally add a grid-state hook that owns the `gridMode`, `gridDensity` and `gridHandChosen` refs plus menu open and focus return. Acceptance: ref behaviour unchanged, existing tests pass without edits, `useArrangement()` keeps its shape. Cost: medium.

### Alternative Approach
- **Current:** capture `activeElement` in the lane's pointerdown handler on a right press, then use it when the menu opens if focus is on `<body>`.
- **Alternative:** a capture-phase `onPointerDownCapture` on the workspace root, or a `focusout` listener that records `relatedTarget`.
- **Verdict:** keep the current approach. It only reacts to right presses on lanes and adds no listener. The alternatives would see every press or focus change in the workspace, and the `focusout` one could interfere with the existing focus handling (fader guards, Clip Gain commit on blur).

### Score: 8/10

This review covers the diff only; I did not audit the whole module.