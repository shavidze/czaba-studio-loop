COMMIT: OK. No blocking issues: there is no auth, purchase or download code in the diff, no new `any`, `@ts-ignore` or type assertions, no new CSS or hardcoded colours, and every new window listener is removed in `cleanup`. The verify log shows 218 test files and 3202 tests passing, and the build succeeds.

## Code Review: round-266, background time selection plus multi-clip range split (SABA-B-11c stage 1)

### Critical Issues
- None.

### Suggestions (most important first)
1. **The detail panel shows different times than the actual selection.** `ArrangementDetailPanel.tsx:519-527` and `:578-591`
   - **Problem:** If you drag inside a clip and past its edge, the clip stays selected. The panel's Start/End fields then show only the part inside the clip, for example 10 to 12.5 when the selection is really 6.25 to 12.5. Pressing Enter in those fields then quietly shrinks the selection to the clip (`clampDetailRangeToClip`). Before this round the drag stopped at the clip edge, so this mismatch couldn't happen. No test covers it.
   - **Fix:** If the selection extends past the selected clip, show the full selection times, or disable the fields with a reason such as "selection extends beyond this clip". Add one UI test: drag past the clip start, then check the panel's input values.
2. **The ruler doesn't move with the selection if the view scrolls or zooms during a drag.** `StudioWorkspace.tsx:2096-2098`
   - **Problem:** `clickTime` is fixed when the pointer goes down, but the pointer position is converted with the zoom level current at each move (`latest.pxPerSecond`) and ignores horizontal scroll. In a real browser, wheel-scrolling or Ctrl+wheel zooming mid-drag makes the selection end move away from the pointer. The old marquee had the same weakness, and tests can't see it because jsdom has no scrolling.
   - **Fix:** Save the scroll position and zoom at pointer-down. On each move, compute the time directly as `(clientX - laneRect.left + scrollDelta) / pxPerSecond` instead of adding a delta to `clickTime`.
3. **Ctrl+drag behaves differently on macOS.** `shortcuts.ts:81`
   - **Problem:** On a Mac, Ctrl+click is a secondary click and opens the context menu, so "Ctrl + drag on a lane" may start the marquee and also open the lane's grid menu. Cmd works (BT4 covers Meta).
   - **Fix:** Label the shortcut as Ctrl/Cmd, or show the platform's key the way other rows do.
   - **Also:** "Ctrl + drag" is spaced differently from the existing "Ctrl+click". Make them match.
4. **Splitting one clip edge still says "both edges".** `strings.ts:116` (`splitRangeDone`)
   - **Problem:** In MS1 and BS1 only one edge is cut, but the message still says "split at both edges", which is wrong.
   - **Fix:** This is already handed to B. Use a neutral wording such as "Clip split at the time selection; the part inside it is selected."
5. **Background selections aren't announced to screen readers.** `StudioWorkspace.tsx:2147-2154`
   - **Problem:** The lane overlay is `aria-hidden` and the new branch never calls `setStatus`. A screen-reader user gets nothing when a selection is made, though the clip-drag path behaves the same way.
   - **Fix:** On `finish` with an active selection, set the status once, for example "Time selection 00:06.250 – 00:12.500 on Music". Do it on pointerup only, not on every move.
6. **Render cost (no change needed).** Each pointermove calls `setTimeRange`, which re-renders every lane, and each lane runs `clips.some(isRangeInClip)`. That is O(clips) per lane per move, the same as the clip-drag path already costs, so it's fine for now. If a profile shows lane re-renders during a drag, wrap `isRangeInClip`/`laneRange` in `useMemo([range, clips])`.

### Good Practices Found
- The range branch only runs inside the existing gesture claim (`claimPointerGesture`), which releases correctly on pointerup and pointercancel. Escape still goes through `marqueeCleanupRef`.
- A selection whose rounded ends are equal becomes `null` (BT9), so a vertical-only drag can't leave a zero-length selection.
- `splitClipsByRange` builds every split into one arrangement, so a whole Ctrl+E is one `applyEdit` and one Undo step (BS2). Whole clips inside the selection are selected only when another clip is actually cut (MS6). Overlaps shorter than `MIN_CLIP_DURATION` are skipped, which matches `splitClipAt`'s own guard.
- A selection inside one clip still uses the clip's own overlay and creates no lane `[data-range-start]` element (BT7), so the existing performance contract holds.
- The two new props are optional and have safe defaults (`Infinity` for the clip, `timelineWidth / pxPerSecond` for the lane), so tests that mount these components directly still compile.
- The mutant runs M1–M11 each make a named test fail, which shows the new tests actually check the changed behaviour.

### Architecture note
- **Signal 4, new lifecycle in an existing owner:** `StudioWorkspace.tsx:2058-2203`
  - **What changed:** `handleLaneBackgroundPointerDown` now holds two separate gestures (marquee and range), each with its own snapping and limits.
  - **Coupling:** the time limit lives in a component ref (`timelineSecondsRef`, line 226) and is also passed as a prop through Lane to ClipView. That means two copies of the same value.
  - **Keep or extract:** keep for now. It is a single pointer lifecycle under one gesture claim and one cleanup, and splitting it now would risk the gesture-lifecycle and Undo guarantees for little benefit.
  - **Proposal for the planner, if stage 2 (relative snap) touches this function again:**
    - **Task:** move the snap-and-clamp step into one pure helper in `lib/arrangement/grid.ts`, for example `resolveRangeEnds(anchorTime, pointerTime, {step, markers, limit})`. Both the background branch and `ArrangementClip.tsx:679-683` would call it.
    - **Done when:** BT2, BT6, BT9, SE8 and SE9 stay green without changes.
  - **Cost:** low.

### Alternative Approach (critical logic: rule D3 for split)
- **Current:** Ctrl+E cuts every clip the selection overlaps at whichever selection edges fall inside that clip, and selects the parts inside the selection.
- **Alternative:** do what Ctrl+Shift+X (Cut Time) already does inside `cutRangeFromArrangement`, i.e. split at both selection edges and leave whole clips alone. Or refuse when the selection spans a gap.
- **Verdict:** keep the current approach. It brings back what the user could do before this round (a drag past the clip start, then Ctrl+E, still splits: MS1 and BS1). It is a single Undo step, and refusing would turn a now-reachable gesture into a silent dead end. Whether this matches Ableton Live is still open (SABA-Q-11C-SPLIT-SPAN).

### Score: 8.5/10