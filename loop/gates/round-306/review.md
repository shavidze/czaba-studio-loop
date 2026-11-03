COMMIT: OK (nothing blocks. No auth, purchase or download code is touched. The verify log shows 233 test files and 3455 tests passing, and both builds succeed. The new `useSyncExternalStore` setup and the guarded `setState` during render are used correctly.)

## Code Review: PERF-3d — waveform columns rebuild only inside the visible timeline window (round 306)

### Critical Issues
- None.

Before the verdict I checked three things:
- **Stretched waveforms are safe.** `ArrangementPeakPath` (`ArrangementClip.tsx:345-346`) uses `viewBox="0 0 ${columns} 2"` with `preserveAspectRatio="none"`. A clip outside the window that keeps its old column count is stretched to fit its box, not boxed or misplaced.
- **Server and first client render match.** `scrollerRef` is still null on the first render, so `readTimelinePage` returns null and every clip counts as in the window, which is the same as the server value `alwaysInWindow` (true).
- **Zoom always goes through one function.** `setPxPerSecond` is only called inside `applyTimelineView` (`StudioWorkspace.tsx:1305`, `:1312`). So every zoom render checks the window against the pending scroll position (`pendingViewRef`), not the old one.

### Suggestions (ranked)
1. **Low/Medium — a layout read inside a value React reads during render, now done by every clip.** `ArrangementClip.tsx:395-406`: `getInWindow` → `getTimelineViewportPx` (`StudioWorkspace.tsx:1276-1279`) reads `scroller.clientWidth`.
   - It runs during render for each clip (30 in the harness) and again on every `notifyTimelineScroll`.
   - That includes each frame of follow-scroll during playback (`:1985`), followed by a second notify from the native scroll event (`:1910`).
   - Layout is usually clean at those points, so the cost is small today. But it is now 30 times the ruler's pattern, and on the playback path it could force a layout.
   - **Fix:** have `getTimelineViewportPx` return `Math.max(0, viewportWidthRef.current - ARRANGEMENT_HEADER_WIDTH_PX)`. The ResizeObserver already keeps that ref up to date (`:1259`, `:1265`). The interface stays the same and the DOM read goes away. Alternatively, work out the window once per notify in the source and give clips a cached value.
2. **Low — the exact `==` budgets depend on the screen size.** `perf/budgets.interactions.json:1751` (`out.path-rewrites == 3`) and `:1812` (`wheel == 2`). The viewport is pinned at 1440×900 (`perf/studio-lab-interactions.perf.spec.ts:49`, `:839`), so they are deterministic now. If the viewport, header width or clip length in the harness changes, though, these rows fail even though gating still works.
   - **Fix (optional):** state that dependency in the note, or add a second row `< 60` as a "gating still works" guard, so the exact count can be updated on its own.
3. **Low — waveform rebuilds during follow-scroll.** When playback follow scrolls the view to a new page, one clip's 4096-column path is rebuilt on the main thread inside the position callback (`StudioWorkspace.tsx:1960-1986`). Audio is not affected, but the existing harness rows don't measure this. The `PERF-3D-SCROLL-HARNESS-ROW` already planned in doc 223 should cover playback follow too, not only manual scroll.
4. **Info — accepted trade-offs (not findings).**
   - An edit (trim, gain, undo) on a clip outside the window rebuilds it at the old column count. Doc 223 already says this.
   - If a future zoom path skips `applyTimelineView`, clips will be checked against the old scroll position until the next scroll event or React's re-check after commit. Add one line about this to doc 223 under "Problems and Solutions".

Checked with no findings:
- **TypeScript:** no `any`, `@ts-ignore` or type assertions in the diff or the new test.
- **Tailwind and accessibility:** no class, colour or ARIA changes, and the waveform stays `aria-hidden`.
- **Memoization:** `timelineWindow` is a stable `useMemo` built from three `useCallback([])` functions, so the memoized `ArrangementClipView` doesn't re-render extra.
- **Listener leaks:** none. The subscribe function has a stable identity, so React keeps one subscription per clip and removes it on unmount. No new scroll listener or timer was added.
- **Real-browser event order:** this repairs itself. Scroll is a continuous event and external-store updates render synchronously, so a clip that enters the window is rebuilt before paint. A difference caused by the browser clamping `scrollLeft` is caught by React's re-check after commit.

### Good Practices Found
- It reuses the rulers' existing three-viewport window (`readTimelinePage` / `timelinePageWindow`) instead of adding IntersectionObserver or a new listener. A visible clip is always inside page−1…page+2, so users never see a stale waveform during normal scrolling.
- Each clip subscribes to a yes/no value, so scrolling re-renders only the clips whose state changed.
- The "adjust state while rendering" pattern avoids a second commit (`commits detail.max` stays 1).
- Visible paths are byte-identical to before, since `buildPeakShape` and `ArrangementPeakPath` are unchanged.
- An unmeasured viewport (jsdom/SSR) means "all clips are in the window" (WG1), so existing tests keep their behaviour.
- WG5 tests a real anchored zoom against the pending view, and the mutant matrix in doc 223 is convincing.

### Architecture note (proposal only, not for this round)
- **Signal 4 (new state and a subscription in an existing component):** `ArrangementClip.tsx:395-416`. A store subscription and per-clip `useState` are added to a component whose lifecycle is otherwise about pointer gestures. **Keep it**, because:
  - it follows the rulers' existing pattern;
  - it doesn't touch the gesture refs (`gestureRef`, `lastFadeDragRef`), Undo/Redo or the shape of `useArrangement()`;
  - it doesn't touch audio timing;
  - WG0–WG5 pin the behaviour.
- **Signal 2 (coupling):** `StudioWorkspace.tsx:1290-1293` → `ArrangementLane.tsx:115/131` → `ArrangementClip.tsx:384`. The workspace's scroll internals are passed two levels down, and the same three functions are already passed separately to the rulers (`:2810-2812`, `:3000-3021`). Doc 223's own TODO notes this.
  - **Proposal for the planner (one bounded task):** in `lib/arrangement`, add a `TimelineWindowProvider` plus `useTimelineSpanInWindow(fromPx, toPx)`, and use it in both the rulers and the clips instead of passing the three functions as props.
  - **Done when:** WG0–WG5 and the ruler/tempo-window tests are green; `components-per-key`, `commits` and `path-rewrites` are unchanged; there are still no new listeners.
  - **Cost:** low/medium. Best done at the end of STUDIO-PERFORMANCE.

### Alternative Approach (Studio rendering pipeline)
- **Current:** gate on the scroll window with `useSyncExternalStore` and keep the last shown columns outside the window.
- **Alternatives:**
  - IntersectionObserver per clip: adds a second commit and its callback arrives late, after the zoom render.
  - Integer path coordinates with relative `h1` (about 65–75 ms): the exit target still isn't met and visible paths change.
  - `useDeferredValue`: visible waveforms update late.
- **Verdict:** the current approach is better. It's the only one of these that meets the PERF-3 exit target (key median 24 ms, LoAF 0), leaves visible output byte-identical, and adds no new commit or listener. The only tweak worth making is the layout-read fix in suggestion 1.

### Score: 8.5/10