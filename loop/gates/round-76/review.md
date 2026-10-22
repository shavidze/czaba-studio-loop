COMMIT: OK. Nothing blocks. All 6 paths are in Studio arrangement code and its docs. Nothing touches auth, purchase or download.

## Code Review: round 76 — clips snap to markers (SRW-16 2b-1)

I reviewed only this diff, not the whole module. What I checked:
- **Tests and verify:** `verify.log` shows 1791 tests passed. The new `marker-snap.test.tsx` has 25 tests, matching the doc's count.
- **Biome warnings in verify.log:** the useButtonType warnings point at `app/components/audio/AudioPlayer.tsx:48` and `:61`, plus one array-index-key warning in a file outside the candidate paths. None of them are in this commit, so they're out of scope.
- **Doc numbering:** 066 is the next number in quarter-IV.
- **Every snap caller:** the only places that build snap targets are the 3 in `ArrangementClip.tsx` (lines 129, 455, 525) and 1 in `ArrangementLane.tsx:202`. All 4 now pass the markers, so no snap path was missed.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low: same marker list computed 3 times per pointer move.** At `ArrangementClip.tsx:406`, `:459` and `:529`, `markerSnapTimes(gesture.before)` appears 3 times in `handlePointerMove`. The cost is tiny (a small array per move), but it's one value fetched in three places. Fix: compute it once next to `const original = gesture.original;` (around line 391) and pass that local to all three calls.
2. **Low: grouped moves can skip a nearby clip edge.** This is the MS8c case at `ArrangementClip.tsx:129-144`. A group move only looks at the single nearest target. If that target is a marker outside the group's allowed range, it falls back to the grid, even when a clip edge inside the range was reachable. The behaviour comes from the existing group-snap rule and is written up in the doc. Fix: none this round. If it bothers anyone in the browser check, a follow-up could pick the nearest target *inside* the allowed range.
3. **Low: no test for moving a video clip onto a marker.** A video clip's move goes through the same single-clip path (`ArrangementClip.tsx:455`), so it now snaps to markers too. That seems right, but nothing tests it. Only refusing a library drop on the video lane is covered (MS10c). Fix: add one test, or have C check it in the browser.
4. **Info: stale doc status.** In `066-studio-lab-clip-snap-markers.md:4` the status still says it's waiting for C's check. C has passed the round, so update the status in the commit.
5. **Info: snapshot vs live data.** Clip drags read markers from the arrangement as it was when the drag started (`gesture.before`). Library drops read the live arrangement (`getArrangement()` at `ArrangementLane.tsx:201`). Clips were already read this way in each path, so nothing regresses. Practically, a marker changed mid-drag won't affect a clip drag already in progress.

### Good Practices Found
- `clipEdgeTargets(…, markerTimes = [])` adds an optional last parameter, so existing callers get exactly the same result. MSU1 checks this with and without `[]`.
- Markers go into both the start and end target lists. Mutation (e) proves that, and it stops the per-lane end-edge exclusion (CM14) from wrongly applying to markers.
- Marker times are never negative (`roundMarkerTime` clamps to 0), so the `>= 0` filter in `nearestGridOrEdge` drops nothing.
- No new state, effects, listeners or timers. The pointer-capture and gesture lifecycle are unchanged, and the window `pointerup`/`pointercancel` cleanup in `watchUncapturedPointerGesture` is untouched.
- Render cost is fine: the drop-side work in `ArrangementLane.tsx:185-209` only runs from the dragOver/drop handlers, not during render. The existing check that skips unchanged `setLibraryGhost` updates also stays.
- No JSX, Tailwind, token or accessibility changes. No `any`, `@ts-ignore` or type assertions. The new export is named clearly and greps easily.
- Undo/Redo stays one step, and markers are byte-identical before and after (MS11). The test markers are deliberately off-grid (12.3 / 20.7), and MS1b shows the same drag without markers lands on the grid, so the tests can't pass by accident.

### Architecture note
- Signal 3 (the same region keeps changing): `ArrangementClip.tsx:398-531`, inside `handlePointerMove`. SRW-14 stage 4 changed it to build snap targets, this round changed it again, and rounds 77/78 (2b-2/2b-3) will add more snap uses.
  - **Keep for now:** it's one gesture lifecycle, there's no new state, and the logic still lives in `lib/arrangement`.
  - **Proposal for the planner:** at the SRW-16 checkpoint the doc already schedules, consider one small `lib/arrangement` helper, e.g. `snapTargetsFor(arrangement, excludeId, laneId)`. It would return the start and end target lists with markers included. The 4 call sites would collapse into it, and 2b-3's range/playhead snap would reuse it instead of adding a fifth.
  - Acceptance: existing snap tests unchanged, and `grid-snap-clip-edges` plus `marker-snap` still green.
  - This is a proposal, not something to fix this round.

### Alternative Approach
- **Current:** marker times are added as extra snap targets next to clip edges, and the single "nearest wins, ties go to the grid line" rule decides.
- **Alternative:** a separate `markerTargets()` function, with each caller merging markers itself, or a marker-first priority with a pixel threshold.
- **Verdict:** keep the current approach. Merging at each caller repeats the same code in 4 places and makes it easy to put markers in only one of the two lists (the "markers in both lists" rule, M5). A threshold or marker-first priority would change round-75 snap behaviour and break the no-markers-means-no-change guarantee (M8).

### Score: 9/10