COMMIT: OK

## Code Review: SABA-B-9 stage 1, centre transport group (round 257)

This review covers only the diff at HEAD `a061d52` plus the two new files, not the whole module. None of the changed files touch auth, purchase or download code: they are 1 component, `strings.ts`, `shortcuts.ts`, 10 test files and 1 doc. I relied on the round-257 verify log and C's PASS without re-running them.

### Critical Issues
- None.

### Suggestions (most important first)

1. **Medium: on narrow windows the toolbar's left and right groups overlap.** `app/components/arrangement/ArrangementTransport.tsx:133`, `:137` and `:317`.
   - At HEAD the toolbar wrapped onto extra rows (`flex flex-wrap`). Now, below 1408 px, it is a 2-column grid. The edit and view groups each need about 432 px and can't wrap (`flex`, no `flex-wrap`).
   - Each column holds them only while it is at least 432 px wide, which is roughly a 900 px window. Below that, both groups spill past their columns and draw on top of each other, so buttons overlap. The page root is `overflow-hidden` (`StudioWorkspace.tsx:2712`), so nothing scrolls either.
   - Below about 511 px the centre group (487 px) overflows too.
   - The browser checks only covered 1280–1440 px.
   - **Fix:** add `flex-wrap` to the three group containers. Or add one more narrow layout, e.g. `max-[920px]:grid-cols-1 max-[920px]:[grid-template-areas:'centre'_'edit'_'view']`, then confirm in Chromium at 768 and 900 px.
   - This isn't blocking only if the Studio is officially desktop-only; I couldn't find a narrow-screen guard in the route.

2. **Low (accessibility, WCAG 2.4.3 / 1.3.2): below 1408 px, Tab order doesn't match what's on screen.** `ArrangementTransport.tsx:133`.
   - The centre row is shown first, but Tab starts at Undo, which is the left of the second row. The doc says this is deliberate (avoids remounting or using CSS `order`), so this isn't a fix request.
   - Worth adding to SABA-Q-9-TRANSPORT (c) as a known trade-off, alongside the 1351–1407 px height change.

3. **Low: the shortcut sheet shows "Double-click Stop" as a keyboard key.** `app/lib/arrangement/shortcuts.ts:40`.
   - The sheet wraps every entry in `keys` in a `<kbd>` (`ArrangementShortcutSheet.tsx:173–178`), but this is a mouse gesture, not a key.
   - **Fix:** add a separate `gestures` field to the shortcut entry (or a `kind: 'pointer'` flag), or put it in the action text, so the sheet renders it as plain text.
   - `ariaKeyShortcuts: 'Home'` is correctly left unchanged.

4. **Low: one test finds the Back to start button by position.** `app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx:175` uses `centre.querySelectorAll('button')[3]`, which breaks if any centre button is added or moved.
   - **Fix:** look it up by name: `view.getByRole('button', { name: studioPlaybackStrings.backToStartLabel })`.

5. **Low: the implementation doc is out of date.** `docs/implementation/2026/quarter-IV/193-saba-b-9-centre-transport.md:93` says the new test file has "TC1–TC9", but it now has TC1–TC11.
   - The first Testing bullet (`:126`) also stops at TC9; the round-257 bullet at `:139` covers TC10 and TC11 separately.

6. **Low, existing code: Export repeats an inline keydown handler.** `ArrangementTransport.tsx:390–394` copies `preventRepeatedEnterKeyDown` instead of using it. Since this component was touched anyway, swapping it in is a one-line cleanup.

### Things checked that tests can't catch

- **Event order in a real browser:**
  - Double-click Stop while playing: the first click stops playback, the second does nothing, then `dblclick` calls `returnToStart`. React 18 finishes re-rendering before the second click arrives, so it sees the updated `isPlaying`, and playback never restarts.
  - Double-clicking Play no longer starts and then immediately stops playback, as Play/Pause did at HEAD. That's an improvement.
- **Space on a focused Play or Stop:**
  - The existing window keydown handler (`StudioWorkspace.tsx:2235–2252`) calls `preventDefault` and ignores key repeat. The keyup handler (`:2548–2556`) also calls `preventDefault`, which stops the browser's own Space click.
  - So a focused Stop can't start playback on keydown and then stop it again on keyup.
  - Enter fires a native click on keydown, and its auto-repeat is blocked on both buttons.
- **Listener and timer leaks:** the diff adds no effects, listeners or timers. `useId` costs nothing.
- **Render cost:**
  - The toolbar still re-renders on `isPlaying` changes, the same as at HEAD.
  - The clock (`ArrangementTransportPosition`) keeps its direct DOM writer, so it doesn't re-render as the position updates.
  - The render-budget tests are kept, and they now also check that Stop really stops.
- **Accessibility:**
  - Play and Stop point to one `hidden` element via `aria-describedby`. Hidden elements are still read for descriptions when referenced directly, so screen readers get "Playing" or "Stopped".
  - It isn't a live region, so it doesn't announce changes on its own.
  - Rejecting `aria-pressed` was the right call, because a second Play click does nothing rather than toggling it off.
  - Stop is never disabled, so keyboard focus never gets stuck on a disabled button.
- **Tailwind and design tokens:**
  - Only theme tokens are used (`bg-brand`, `bg-foreground`, `text-background`); no hard-coded colours.
  - The custom `grid-template-areas` value is valid (Tailwind turns `_` into spaces).
  - The hidden span adds no gap inside the flex row.
- **TypeScript strict:** no `any`, no type assertions, no `@ts-ignore`, and every statement ends with a semicolon.

### Good Practices Found
- Play now always has the same name, title and icon, and the playback state is exposed separately. This fixes B-R249-PAUSE-LABEL without the button's name changing under the user.
- Tests that used to find the toolbar via `parentElement` or a `flex-wrap` class now use `data-testid` hooks, so they're less fragile.
- After `pauseLabel` was removed, a lookup by that name would have silently matched every button. The test helpers now read `data-playing` instead.
- The doc lists mutation checks M1–M9, each mapped to the test that failed.

### Architecture note
- **Signal 3, the same area keeps changing at high cost:** `ArrangementTransport.tsx:130–400`. The toolbar's layout and button order have been reworked across several rounds (V-3a/b, SRW-14, now SABA-B-9), and each time about 9 test files that depended on button order had to change. This round's switch to `data-testid` lookups has already lowered that cost.
  - **Keep, because:** the three groups share one owner, one `useArrangement()` read and the focus-handoff ref (`:99–122`), which crosses from the edit group to the view group (`fitButtonRef`). Splitting the groups into separate components would mean passing those refs around as props.
  - **Proposal for the planner (not approved scope):** after stage 2 (moving the master volume), consider one bounded task: switch the remaining tests that check button order by index (GS14 `grid-snap-ui.test.tsx:405–418`, NS `navigation-strings-ui.test.tsx:175`) to check each group by name. No component changes. Acceptance: grid-snap-ui, navigation-strings-ui and transport-centre-ui stay green, and moving a button inside one group changes only that group's test.

### Alternative Approach (critical playback logic)
- **Current:** separate Play and Stop buttons. Play only starts; Stop only stops; double-click Stop goes back to the start. A hidden description gives the playback state.
- **Alternative:** one Play/Stop toggle button with `aria-pressed`, plus a separate Back to start button.
- **Verdict:** the current approach is better.
  - **UX:** it matches Ableton's manual, and double-clicking Play can no longer flip playback on and off.
  - **Accessibility:** the button names never change.
  - **Performance:** no difference.
  - **Cost:** one extra button, plus the narrow-width layout problem in Suggestion 1, which is about layout, not this design.

### Score: 8/10