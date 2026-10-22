COMMIT: OK (nothing blocks. No auth, purchase or download code is touched. There are no new listeners, timers, DOM, ARIA or className changes. Without markers the snap behaviour is exactly the same as before, and the verify run is green: 109 files and 1846 tests pass, typecheck is clean, lint has 0 errors, and the build succeeds.)

## Code Review: round 78 — marker snapping for the playhead, time range and Loop brace

This review covers the diff only, not the whole module.

### Critical Issues
- none

### Checks run (what tests may not prove)
- **Old results with no markers:** with an empty marker list, `nearestGridOrEdge` (`grid.ts:244-261`) only replaces the grid line when a marker is strictly closer. So `resolveGridTimeWithTargets(…, [])` returns exactly what `resolveGridTime` returned. The TU1e table in the new test also checks this.
- **Playhead drag gets the markers:** `ArrangementRuler.tsx:445` passes `{...props}` to `ArrangementRulerPlayhead`, so `getSnapMarkerTimes` reaches the drag code. `StudioWorkspace.tsx:1860` is the only place the ruler is rendered, so the ruler click and the playhead drag can't get out of step.
- **Loop length when moving onto a marker:** if the snapped start is off the grid, `moveLoop` (`loop.ts:71-83`) skips grid alignment and keeps the loop length to the microsecond. This is correct.
- **Order of browser events:** the Alt key is still read from the release event itself (`end.altKey` / `event.altKey`), as before. Markers are read when the event fires: from `gesture.before` in the clip and the Loop brace, and from `getArrangement()` in the workspace and ruler. A gesture can't change the markers mid-drag, so nothing goes stale.
- **Leaks and render cost:** no effects, listeners or rAF calls were added. `getRulerSnapMarkerTimes` is a stable `useCallback([])` that reads through `workspaceRef`, so the ruler doesn't re-render on arrangement changes. The render-budget test is green.
- **TS strict and Biome:** no `any`, `@ts-*`, type assertions or `!` in the new code or test files. Semicolons are in place. Tailwind and tokens are not touched.

### Suggestions (most important first)
1. **Low — `ArrangementLoopBrace.tsx:153-161`:** the inline `Math.round(x * 1e6) / 1e6` repeats the private `toWholeMicroseconds` from `grid.ts:192`. **Fix:** add a `snapLoopMoveStart(raw, length, step, markers)` export next to `snapMoveStartToGridOrEdges` in `grid.ts` (or a `roundToMicroseconds` helper), so the rounding rule lives in one place. Not for this round.
2. **Low — `ArrangementRuler.tsx:170-176`:** every pointer move during a playhead drag calls `getSnapMarkerTimes()`, which builds a new array and then filters and sorts it in `nearestGridOrEdge`. With a few markers this cost is negligible. Markers can't change during a drag, so reading them once at pointerdown would give the same result. Keep it as is for consistency with rule T7 unless profiling shows a problem.
3. **Info — `docs/implementation/2026/quarter-IV/068-studio-lab-marker-time-snap.md:4`:** the status line still says it is waiting for C, but `c-round-78.json` is PASS. Doc 067 followed the same pattern and was updated at the next gate (GATE77-S2). Update it in round 79.
4. **Info:** `resolveGridTime` is now used only by the marker drag (`ArrangementMarkerRow.tsx:490`). Marker-to-marker snapping is deliberately excluded there (T6). Later, that call could become `resolveGridTimeWithTargets(…, [])` and `resolveGridTime` could be removed. Not now.

### Good Practices Found
- The ruler gets markers through a getter prop instead of calling `useArrangement`. Its default returns a constant empty array, so any ruler rendered without the prop behaves exactly as before.
- `markerSnapTimes(gesture.before)` follows the trim pattern from round 76, so every gesture reads markers the same way.
- Loop move uses the same start/end candidate rule as clip move (`snapMoveStartToGridOrEdges(raw, len, step, markers, markers)`), and the float noise is caught by the TS7c test.
- The doc honestly marks which behaviours Ableton confirms and which it doesn't. The mutation list (a–i) shows each test actually fails when its rule is broken.

### Architecture note
- **Signal 3 (one region changed repeatedly at high cost):** the snap helpers in `grid.ts` (`grid.ts:77-96` and `263-282`) grew in rounds 76, 77 and 78. Each time, the same four places had to change: Clip, LoopBrace, Ruler and Workspace. **Keep for now:** audio timing, refs, the gesture lifecycle, Undo/Redo (the Loop gesture still makes one history entry) and the shape of `useArrangement()` are all unchanged, and the duplication is small. **Proposal for planner at the end of SRW-16:** one `resolveSnapTime(time, { snapSeconds, gridSeconds, bypass, targets = [] })` entry point and retire `resolveGridTime`. Acceptance: the TU1a–e equivalence table plus the existing grid-snap-* and marker-* suites stay green. Low value and low risk.
- The ruler's getter prop (instead of using the context) is a **keep**: it exists to protect the ruler's render budget, including the RU-DBLCLICK behaviour.

### Alternative Approach
- **Current:** markers are read when the event fires, through a stable getter prop on the ruler and from `gesture.before` / `getArrangement()` everywhere else.
- **Alternative:** compute `markerSnapTimes` once in context or with `useMemo` in StudioWorkspace and pass the array down as a prop.
- **Verdict:** the current approach is better. Passing an array prop would re-render the ruler and its playhead on every marker change, and every gesture would have to take a snapshot anyway to stay consistent with `before`. The getter costs nothing at render time, and the TS1b test shows it picks up markers added after mount.

### Score: 9/10