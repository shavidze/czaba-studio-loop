COMMIT: OK. I found no blocking issues. The diff is limited to `ArrangementTempoRow.tsx`, `tempo.ts`, the three props passed in `StudioWorkspace.tsx`, two new test files and docs. Nothing in auth, purchase or download code is touched.

## Code Review: Round 70 — bars ruler only draws marks near the visible area (D-29z35)

Basis: `diff.patch`, the three new files, the full `ArrangementTempoRow.tsx` and `tempo.ts`, the scroll/viewport code in `StudioWorkspace.tsx` (lines 662–740 and 1037–1056), and `verify.log` (99 test files / 1683 tests passed, build OK; the lint warnings in it come from files this diff doesn't touch). `c-round-70.json` is not in the `gates/round-70/` folder, so the C PASS comes from your message, not from a file I read. I didn't run anything: this is a read-only review.

### Critical Issues
- None.

### Suggestions (most important first, all Low)
1. **The first mount draws the whole ruler.** `ArrangementTempoRow.tsx:53-55` returns `null` while `scrollerRef` is still unset on the first render, so lines 252-253 pass no window and every mark gets built once.
   - This costs nothing today because the tempo starts as `null`. It becomes a real one-off cost (thousands of marks) once the tempo is restored from a saved project.
   - Doc 062 already lists this as a TODO. Fix in a later task: when the viewport hasn't been measured, fall back to a fixed window (e.g. `[0, 3 × window.innerWidth]`) and update BU1 to match.
2. **The ruler reads layout during render.** `ArrangementTempoRow.tsx:151-157`: `getSnapshot` reads `scroller.clientWidth` every time the row renders. The row isn't memoised, so this happens on every `StudioWorkspace` render, plus the extra snapshot calls `useSyncExternalStore` makes.
   - It's safe on playhead position frames (BU8 shows 0 reads), but after a commit that changed layout it can force a synchronous reflow.
   - Fix: have `getTimelineViewportPx` use the existing `viewportWidthRef` (already kept current by the ResizeObserver at `StudioWorkspace.tsx:681`) instead of reading the DOM. That's a separate `StudioWorkspace` task, as the doc says.
3. **Tests depend on React internals.** `tempo-window-ui.test.tsx:17-91` counts renders by walking React's internal fiber tree through `__REACT_DEVTOOLS_GLOBAL_HOOK__` (`memoizedProps`, `alternate`).
   - This will quietly break on a React 19 upgrade.
   - The global hook is defined but never removed. Vitest's default per-file isolation limits the damage, but `vitest.config.ts` doesn't set it explicitly.
   - Fix: move the probe into a shared test helper (it's currently copied from `render-budget`) so there is one place to update.
4. **A timing assertion may be flaky.** `tempo-window.test.ts:146` checks `elapsed < 100` ms against the wall clock, which can fail on a loaded CI runner. The 180–240 mark-count bounds at lines 125-126 already prove the full list is never built. Fix: drop the timing check or loosen it a lot.
5. **Two mutations survived (doc 062:94).**
   - m (no unsubscribe): React manages the subscription, so the real risk is low. Possible guard: after `unmount()`, a `fireEvent.scroll` doesn't increase `tempoCalls.count`.
   - n (negative `scrollLeft`): add a BU case with `scrollLeft = -50` (as with rubber-band scrolling) that expects page 0.
6. **Doc 062:4 status** still says it's waiting for C. That matches how 058 and 061 were handled (status updated the following round), so it doesn't block this commit.

### Things I checked that hold up
- **Listener and timer leaks:** none. The subscription goes through `useSyncExternalStore` using the existing `subscribeTimelineScroll` (a `useCallback` with `[]`, so it never resubscribes). No new window/document listeners, timers or ResizeObservers.
- **Event ordering in a real browser:**
  - Scroll events re-render synchronously through `useSyncExternalStore`. The window extends one viewport beyond each side of the visible area, which covers the compositor scrolling ahead of the main thread.
  - During zoom, `getTimelineView()` returns the pending view, so the first commit already uses the new scroll position (BU5).
  - If the browser clamps `scrollLeft` after a zoom, a changed page key makes React re-check the snapshot after commit, once the layout effect has cleared the pending view. So the window corrects itself without needing a scroll event. C's BR-ZOOM browser check should still confirm this.
- **`tempo.ts`:**
  - Without a window the output is identical (BW1, 2215 marks).
  - The loop starts one `barStep` before the window, which absorbs floating-point error in `windowBar`.
  - The `break` uses the same `barTime * pxPerSecond` formula as the filter.
  - Label fitting is still measured against the full ruler width.
- **Re-render cost:** the snapshot is a primitive `"page:vp"` string, the strip is `memo` with primitive `fromPx`/`toPx`, and without a tempo it returns `''`, so scrolling causes no re-renders (BU4, BU7, BU8).
- **TypeScript strict:** no `any`, type assertions or `@ts-ignore`; `null` is handled explicitly.
- **Tailwind and accessibility:** no new classes, colours or interactive elements. `role="presentation"` and the input/button `aria-*` attributes are unchanged.
- The pure tests compare against an oracle across 756 cases, and the UI test oracle filters the full list (so it no longer passes falsely on the old code).

### Architecture note
- Signal (repeated prop plumbing): `StudioWorkspace.tsx:1672-1674` and `:1813-1815`, plus part of the same trio at `:1797`. `getTimelineView`, `getTimelineViewportPx` and `subscribeTimelineScroll` are now passed by hand to three consumers. **Keep for now:** the callbacks are stable, there's one owner and no shared lifecycle, and extracting them now would add an abstraction with little benefit.
- Proposal for the planner (not approved scope): when a fourth consumer appears, bundle the trio into one stable `timelineViewport` object built from refs. In the same task, switch `getTimelineViewportPx` to `viewportWidthRef`.
  - Acceptance: consumer props shrink to one; zoom, pan, Follow and Undo/Redo behaviour unchanged; BU1–BU8, `view.test.ts` and the Overview/Ruler tests green.
- This is a review of the diff only, not a full check of the module.

### Alternative Approach (performance-critical: the render path the Studio audio timeline depends on)
- **Current:** the row subscribes to scroll with `useSyncExternalStore`, keyed on `page:vp`, and draws a window of three viewports.
- **Alternative A:** a `scrollLeft` state in `StudioWorkspace`. It re-renders the whole workspace on every scroll step, so it's worse.
- **Alternative B:** draw beat marks with a CSS gradient. Fewer DOM nodes, but it removes the `data-kind="beat"` marks that the frozen tests and C's harnesses read, and labelled beats would still need nodes.
- **Verdict:** the current approach is the best of the three. It is safe under concurrent rendering, adds no new subscription channel, and only re-renders when the page changes.

### Score: 8.5/10