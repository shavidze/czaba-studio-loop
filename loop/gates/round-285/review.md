COMMIT: OK

## Code Review: round 285: PERF-3b, the seconds ruler only renders ticks near the visible page, plus a Follow-mode notify fix

Scope: this covers only the 8 files in `paths.txt` and `diff.patch` at HEAD `0f99960`. I did not audit any module in full. The verify log shows 222/222 test files passed, the build finished and the agent references check passed. The 205 Biome warnings in it are old and unrelated to this diff. Nothing in the diff touches auth, purchase, download, cart or API code.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Each page flip in Follow mode forces one extra layout calculation.** `StudioWorkspace.tsx:1977-1980` sets `scroller.scrollLeft` and then calls `notifyTimelineScroll()`. That runs the page-key read for both the seconds ruler and the tempo row, and that read (`getTimelineViewportPx`, `StudioWorkspace.tsx:1276-1279`) reads `scroller.clientWidth`. This happens in the same animation frame that just moved the playhead, so the browser has to recalculate style and layout right away. It costs about one recalculation per viewport width of playback, so it's minor. This round didn't introduce the read; the new notify only adds a call site.
   - **Fix (later round):** have `getTimelineViewportPx` return the cached `viewportWidthRef.current` minus the header width instead of reading `clientWidth`. The ResizeObserver at `StudioWorkspace.tsx:1258-1263` already keeps that value current and already calls notify.
2. **The ruler reads layout while React is rendering.** `ArrangementRuler.tsx:301-309` calls `useSyncExternalStore` with a getter that reads `clientWidth`, so every render of the ruler does a layout read. `ArrangementRuler` isn't memoized and re-renders whenever `StudioWorkspace` does (zoom, selection and so on). SR5 shows playhead frames don't trigger the read, but other workspace re-renders do. The cache from item 1 fixes this as well.
3. **Test order:** in `tempo-window-ui.test.tsx:332`, SR6 comes before SR5. Renumber them or put them in order so failure output is easier to follow. Cosmetic only.
4. **Test hooks ship in production:** `ArrangementRuler.tsx:268-269` adds `data-testid` and `data-time` to every tick. With the window in place that's about 40–140 nodes, which costs almost nothing. This follows the existing pattern for bars marks, so no change is needed.

### Checks for things the tests can't catch
- **Real-browser event order:** a scroll the code sets itself (zoom, jumps, overview drag) fires its scroll event before the next paint. The re-render triggered by `useSyncExternalStore` runs synchronously before that paint. The window also keeps a full viewport of margin on the left and up to two on the right, so even a one-frame-late key would leave no visible gap. Follow scrolls never fire a real scroll event before paint, which is why the new notify is needed. The doc's browser check (`flipT`, 18 flips, 0 frames painted without visible ticks) is the right test for this.
- **Listener and timer leaks:** none. `useSyncExternalStore` unsubscribes on its own, the listener `Set` lives in a ref, and no timers were added. The new dependency `[notifyTimelineScroll, positionStore]` is stable because `notifyTimelineScroll` is a `useCallback` with empty deps, so the position subscription isn't re-created.
- **Regressions:** the tempo row's helpers moved into `view.ts` with identical logic, and BU1–BU8 still pass. Calling the notify directly doesn't trigger the marker-menu close or the Follow pause, because both live only in `handleTimelineScroll`. That's correct.
- **Render cost:** the tick component is memoized on four numbers, so scrolling within a page doesn't re-render it (SR3). `rulerTickMarks` only builds the index range around the window and then filters it exactly. RW1 shows the result matches the full list filtered to the window.
- **Accessibility:** the ticks have `pointer-events-none` and sit inside `role="presentation"`. Fewer off-screen labels in the accessibility tree just means less noise. The playhead slider's ARIA attributes are unchanged.
- **Tailwind, tokens and strict TS:** no new classes or colors. No `any`, `@ts-ignore` or `as`, and semicolons are present. The props `getTimelineViewportPx` and `subscribeTimelineScroll` are optional with no-op defaults, so the ruler behaves as before (all ticks) if they aren't passed.

### Good Practices Found
- Both rulers now share one source for the page window, so the two copies can no longer drift apart.
- When the viewport hasn't been measured yet (or during SSR), the ruler renders every tick, the same rule the bars ruler already used. That avoids a one-frame-empty ruler on first load.
- An invalid window (NaN, infinite, or end before start) returns `[]`, matching `barsRulerMarks`.
- The implementation doc (213) includes measurements, rejected alternatives, and an honest "not measured" note about the bars ruler.

### Architecture note
- **Signal 2 (ownership/coupling)** at `view.ts:497-547`: the tempo row's private helpers moved into `lib`. The direction is good: pure logic now lives in `lib`, and nothing depends on anything in both directions. **Keep.**
- **Signal 4 (new state/lifecycle in an existing owner)** at `ArrangementRuler.tsx:301-309` and `ArrangementTempoRow.tsx:205-214`: the same `useCallback` + `useSyncExternalStore` + `parseTimelinePageKey` + `timelinePageWindow` block now appears in two components. Two copies are cheap to keep and the tests protect both, so **keep it for now.**
  - **Proposal for the planner, if a third consumer appears:** one bounded task to add a `useTimelinePageWindow({ getTimelineView, getTimelineViewportPx, subscribeTimelineScroll, enabled })` hook in `app/hooks/`.
    - **Done when:** SR1–SR6, BU1–BU8 and RW3 stay green without edits.
    - **Combine with:** the cached viewport value from Suggestion 1.
- **No action for this round.**

### Alternative Approach
- **Current:** a window three viewports wide, keyed by page, read through `useSyncExternalStore`, plus a direct notify after each Follow scroll.
- **Alternative:** have the Follow writer update a ref with the page and let the ruler read it in its own `requestAnimationFrame` loop. Or use a hysteresis tile window driven by a ResizeObserver or IntersectionObserver.
- **Verdict:** keep the current approach. It re-renders only when the page changes, reuses the existing notify channel, and the browser check shows no painted frames with missing ticks. A rAF loop would add a timer that has to be cleaned up and would be harder to test in jsdom. Hysteresis gains nothing, because scrolling within a page already renders nothing.

### Score: 9/10