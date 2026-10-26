COMMIT: OK (no blocking findings; none of the five paths touch auth, purchase or download code)

## Code Review: round 198 — R91 keyboard focus reveal (`StudioWorkspace.tsx`, `focus-reveal.ts`, 2 test files, implementation doc 159)

This covers the diff only. I did not review the whole module.

### Critical Issues
- None.

### Findings, most important first (none block the commit)

1. **Low — the focus ring sits right on the chrome's edge.** `app/lib/arrangement/focus-reveal.ts:22`. After the reveal, the target's top is exactly at `chromeBottom` (the doc measures 313.0). A ring drawn outside the element's box would have its top 1–2 px under the sticky chrome. This passes WCAG 2.4.11 (the control is not *fully* covered) but not 2.4.12. Lane rings are mostly drawn inside the box (R23-N), so the doc's "ring changed px > 0 on every stop" holds.
   **Fix:** add a separate `FOCUS_REVEAL_MARGIN_PX` (around 2–4) to `delta`, and keep the 0.5 px tolerance for rounding noise. This is a suggestion, not a requirement for this round.

2. **Low / note — browser event order is only measured in Chromium.** `StudioWorkspace.tsx:1504–1527`. The handler runs during the focus event. Chromium then does its own "scroll into view if needed", which does nothing because the handler has already moved the target into the visible area. This is backed by A's live Playwright run (33 stops inside the scroller, 0/0 hidden, `scrollTop` changes only for the Video lane, and Snap / F2 / Shift+F10 / playhead all stay at 46). Firefox and Safari were not measured. Either order should give the same result, because the target already ends up below the chrome, so this is not a bug.
   **Fix:** none needed. Add one Firefox line to the C round if possible.

3. **Low — two edges are still open (already listed in the doc as out of scope).** A target can still be hidden horizontally under the sticky lane header, and a target near the bottom relies on the browser's own focus scroll. I see no regression here.

4. **Note — the effect on scroll handlers was checked.** The `scrollTop` write fires the scroller's native `scroll` event:
   - `handleTimelineScroll` (`:1474`) only acts when the horizontal position changes, so it does not close the marker menu or pause follow.
   - `closeGridMenuOnUserScroll` (`:1446`) closes the grid menu when `scrollTop` changes. The grid menu is rendered outside the scroller (`:2659`), so focus inside it never reaches the scroller's `onFocus`. The reveal cannot close it unless focus leaves the menu, and then it should close anyway.
   - The only other subscriber to the scroll notifications is `ArrangementOverview.tsx:117`, which updates its frame on every notification.
   - The scroller has no other `sticky top-` element besides the chrome (`:2295`), so no case can produce a scroll that changes nothing visible.
   - The floating video is positioned from the library panel (`:592–593`), not from a lane, so it does not drift.

### Suggestions
- Only finding 1's margin. Everything else can stay as it is.

### Good Practices Found
- **No listener or timer leaks.** The handler uses React's own event delegation, with no `addEventListener`, no effect and no cleanup.
- **Low render cost.** `useCallback([])` is stable, the handler reads refs only, and it writes no state, so it causes no re-renders. It reads layout twice per focus, and only when focus came from the keyboard.
- **Strict TypeScript without casts.** The structural `{ target: Element }` parameter correctly widens React's misleading `EventTarget & HTMLDivElement` type. There is no `any`, assertion or suppression comment.
- **Correct portal guard.** `!scroller.contains(event.target)` handles the marker menu, which is portaled to `body` but still bubbles through React to the scroller. FR-f and mutant m6 prove this guard is needed.
- **Reuses the existing focus-source signal.** It gates on the same R85 attribute used for the ring. `pointerdown` is caught in the capture phase before focus happens, so pointer focus never scrolls.
- **Pure, tested helper.** It handles `NaN`/`Infinity` and never returns a negative value. Horizontal scroll is never touched (all FR tests assert `leftWrites`).
- **No style changes.** No new Tailwind classes or colours; only a `data-testid` was added.
- **Checks pass.** The verify log shows 189/189 test files passing, a clean `tsc`, and a successful build. The 214 lint warnings are existing ones, all in files outside the diff.

### Architecture note
- **Signal 3 (one region changed repeatedly at high cost):** `StudioWorkspace.tsx:1504–1527` and `:2283–2297`. The scroller/chrome area has been changed in back-to-back rounds (R83–R91).
- **Signal 4 does not apply:** no new state, effect, timer, listener or cleanup was added.
- **Keep for now:** the handler holds no state, the calculation is already in `lib/arrangement/focus-reveal.ts` with its own tests, and ownership and coupling do not change. Extracting now would add prop plumbing around refs (`scrollerRef`, `timelineChromeRef`, `autoScrollLeftRef`) that the follow and audio timing depend on.
- **Proposal for the planner, not this round:** a scoped `useTimelineScroller` hook that owns `handleTimelineScroll`, the follow pause on navigation, the grid-menu close-on-scroll effect and `revealKeyboardFocusBelowChrome`. The returned refs and the `useArrangement()` shape stay the same. Acceptance: `focus-reveal-ui`, `grid-snap-menu`, the follow tests and `floating-video` pass unchanged. Value: low to medium. Priority: low.

### Alternative Approach (critical logic: focus and scroll on the Studio timeline)
- **Current:** an `onFocus` handler that only acts on keyboard focus and moves `scrollTop` by exactly the hidden amount.
- **Alternative:** CSS `scroll-padding-top` set to the chrome's height (R89), plus a negative `scroll-margin-top` on the chrome's controls.
- **Verdict:** keep the current approach. B's probe shows R89 jumped the view to 0 whenever a chrome control got focus, and the combined version still did that for F2 and Tab in the chrome. `scroll-margin` alone had no effect in Chromium 143. The handler gives 0/0 hidden stops without moving the view on chrome focus or pointer focus.

### Score: 9/10