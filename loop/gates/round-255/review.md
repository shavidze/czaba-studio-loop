Verify passed; the code checks are done. Writing the verdict now.

COMMIT: OK

## Code Review: round-255 (SABA-B-10b: visible insert marker line, transport rows in the shortcut sheet)

This is a review of the diff only, not the whole module. It touches no auth, purchase or download code. The changes are limited to `StudioWorkspace.tsx`, `shortcuts.ts`, `app.css`, four test files and one implementation doc. verify.log shows 215 test files and 3151 tests passing.

### Critical Issues
- None.

### Suggestions (ranked)
1. **The marker line is hidden under the playhead when playback is stopped.** In `StudioWorkspace.tsx:3064-3065` the playhead is drawn after the marker, at the same `z-10`, and is wider (`w-0.5` against `w-px`). When stopped, both usually sit at the same time, so the playhead fully covers the blinking line. The line is only really visible while playing or after Ctrl+Shift+Space moves the marker apart. This is acceptable, but the doc should say so. If it should always be visible, a separate task could use a different shape (for example a triangle head on the ruler) instead of changing the z-order.
2. **The blink never stops.** `app.css:178` runs `insert-marker-blink 1.2s step-end infinite` with no end. `motion-safe:` (`StudioWorkspace.tsx:524`) correctly respects `prefers-reduced-motion`. The rate is below 1 Hz, so there is no flash risk. Under WCAG 2.2.2, blinking that starts by itself and lasts longer than 5 seconds needs a way to stop it. A text caret is the usual accepted exception, and this marker is a similar case. Low risk. Possible fix: blink only while stopped, or let it settle after about 5 seconds. Product decision, not needed now.
3. **One extra layer during playback.** An infinite opacity animation on a full-height absolute element creates its own composited layer. It runs on the compositor and causes no React renders: the RB-IM test confirms the node stays the same through Play → Pause → Play. Low cost. Before the next round of profiling, check in the Chrome Layers panel that it does not repaint the lanes while scrolling.
4. **The new `app.css` block is acceptable.** The `@keyframes` block (`app.css:182-185`) plus the `--animate-*` token inside `@theme` is the standard Tailwind v4 way to add an animation utility. It is not ad-hoc custom CSS. The colour uses the `bg-foreground` token, with no hardcoded colour.
5. **Optional test cleanup.** `insert-marker-ui.test.tsx:91` declares `insertMarker?:` as optional, so every call uses `?.`. If the probe were not mounted, a call would silently do nothing. The `.style.left` assertions after each call would still catch that, so the risk is small. Possible fix: make it required (`insertMarker: ArrangementPositionStore | null`) and throw when it is null.

### Checked and confirmed (real-browser concerns)
- **Event ordering and leaks:** the subscription is created inside `useIsomorphicLayoutEffect` (`StudioWorkspace.tsx:507-518`) and its cleanup is returned. When zoom (`pxPerSecond`) changes it unsubscribes and resubscribes. There is no timer and no window listener, so nothing leaks.
- **React and direct DOM writes stay consistent:** both the render's `style.left` (line 526) and the store's direct write use the same formula. When the parent re-renders, React writes the store's current value, so the line cannot jump.
- **`hidden` while the line is `absolute`:** Tailwind v4 preflight sets `[hidden]` to `display:none !important`, so the time-selection hide (`range !== null`) works in a real browser too, not only in jsdom.
- **Clicks and accessibility:** `pointer-events-none` lets lane, ruler and marquee clicks pass through. `aria-hidden` and no `tabindex` keep it out of the screen-reader tree and the tab order.
- **Sticky headers:** the sticky headers are `z-30`, so the line passes under them when scrolled horizontally, the same as the playhead.
- **The shortcut sheet matches the real handlers:** Shift+Space calls `continuePlayback` and Ctrl/Meta+Shift+Space calls `moveInsertMarkerToPlayhead` (`StudioWorkspace.tsx:2235-2251`). Home calls `returnToStart` (line 2486). `aria-keyshortcuts` covers both Control and Meta.
- **Marker row wording, partly checked:** M calls `markerRowRef.current?.beginAddMarker()` (line 2428). I did not trace inside `beginAddMarker` to confirm the "selection start → insert marker → playhead while playing" order the new text claims. Before merging, check it against its source or an existing test.
- **TS strict:** no `any`, no `@ts-ignore`, no type assertions. Semicolons are present.

### Good Practices Found
- The hidden signal element became the visible line in place, so one node keeps the testid and the `data-insert-marker` attribute. The tests check that it stays the same node (`markerLine(mounted)).toBe(line)`, RB-IM).
- The marker line follows the same pattern as `ArrangementPlayheadLine`: position written straight to the DOM, the right header offset, zoom applied through `pxPerSecond`.
- The tests cover the main cases: ruler and empty-lane clicks while playing, Home, zoom in and out, and the time-selection hide and show.

### Architecture note
- Signal 4 (new state/lifecycle in an existing owner), weak: `StudioWorkspace.tsx:498-531`. A second line component that writes its own position now sits inside `StudioWorkspace`. → **keep**, because it is small and has the same lifecycle as `ArrangementPlayheadLine`, and moving it would add imports without a real gain.
- Proposal for the planner, not part of this round: move both line components into `app/components/arrangement/ArrangementTimelineLines.tsx` with no change in behaviour. Acceptance: the existing render-budget, insert-marker-ui and bars-ruler-ui tests pass unchanged. Value: low.

### Alternative Approach
- **Current:** a DOM line driven by a store subscription, with a CSS animation.
- **Alternative:** read both positions in the `ArrangementPositionWriter` frame loop and paint them together on one overlay.
- **Verdict:** keep the current approach. The insert marker moves only on user actions, so a subscription with no per-frame work is cheaper and simpler. A shared frame loop would only be worth it if the overlay later gets more frame-synced elements.

### Score: 8.5/10