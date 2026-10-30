COMMIT: OK. Nothing in the diff blocks this commit. The four findings below are Medium or Low and can wait for stage 2 or later.

**What I checked:**
- **Scope:** the commit touches only `app/components/arrangement/StudioWorkspace.tsx`, `app/contexts/ArrangementContext.tsx`, `app/lib/arrangement/**` and one implementation doc. No auth, purchase or download code is touched.
- **Leaks:** no new listeners, timers or `requestAnimationFrame` loops. The stop effect in `StudioWorkspace.tsx:1933` keeps the same deps (`[isPlaying, setFollowMode]`), and `describeSpaceStart` is a stable `useCallback` with `[]` deps.
- **TypeScript:** no `any`, no suppression comments, no `as` casts.
- **Styling:** no Tailwind, class or token changes.
- **Verify log:** 220 test files and 3272 tests passed, the Biome check is clean, and the build succeeded.
- **Render cost:** every `writeInsertMarker` call now dispatches to `useReducer`. In React 18 that re-runs the `ArrangementProvider` body even when the status text doesn't change, because the bail-out only happens after the render. Consumers don't re-render, because the context value is memoized. I checked every caller: they all run on discrete events (click, key, pointer-up, an edit, a marker jump). The scrub path (`scrubPlayhead`) doesn't write the marker, and dragging a marker flag doesn't call `seekTo`. So the cost is bounded and there is no per-frame regression. Holding a jump-to-marker key re-runs the provider once per key repeat, which is acceptable.

## Code Review: SYS-6 STATUS-LIFETIME stage 1 (round 272)

### Critical Issues
- none

### Suggestions (ranked)

1. **Medium: the status updater reads refs when React applies it, not when the marker is written.** `ArrangementContext.tsx:824-837`
   - The function passed to `setStatus` runs later, inside the reducer during the next provider render. It reads `isPlayingRef.current` and `describeSpaceStartRef.current()` at that point, and `describeSpaceStart` in turn reads `latestRef.range`, `historyRef` and `playbackEndedAtRef`.
   - The problem is general: if a caller writes the marker and then changes playback state, the range or the end flag in the same handler, the text reflects the later state.
   - The doc names one symptom: `playFrom` from a stopped status line writes `insertMarkerWhilePlaying` ("…playback continues…") right after playback starts. Home → clear range happens to come out right only because the updater runs late.
   - In a real browser this depends on how React batches updates. It isn't pinned by any LT row and could change silently.
   - Fix: decide what you want and state it. Either take the snapshot when the marker is written (read `isPlayingRef.current` there and keep it in the updater's closure), or keep the late read and add an LT row for `playFrom` from a stopped text. The B decision pending in the doc should cover this whole class of cases, not just `playFrom`.

2. **Low: a ref is written during render, and the indirection isn't needed.** `ArrangementContext.tsx` diff line 165 (`describeSpaceStartRef.current = describeSpaceStart;`)
   - Every ref that `describeSpaceStart` reads is declared before `writeInsertMarker` at :820: `historyRef` :705, `insertMarkerRef` :707, `latestRef` :746, `playbackEndedAtRef` :759.
   - Its deps are `[]`, and `playPastEndMessage` is a module-level function.
   - Fix: move `describeSpaceStart` above `writeInsertMarker`, call it directly, and delete `describeSpaceStartRef` and the line that assigns it during render.

3. **Low: the selection past-end refusal can go stale.** `playback-start.ts:67-87` (PB8 asserts this as the contract)
   - New path: play → click the ruler (Follow-paused text) → set a time range that starts past the project end → Stop.
   - `describeSpaceStart` now writes "Time selection start (…) is past the end…". That text isn't in the set of status texts that name the marker (set T), so Home doesn't rewrite it. The range is cleared and the marker goes to 0, but the line still describes a selection that no longer exists.
   - This is the same kind of bug as C-R253-01, now produced by the new code.
   - The LT8 middle step shows a similar gap: `setTimeRange` alone leaves "Space plays from the insert marker" on screen while Space would actually play from the selection.
   - Fix (stage 2): add the selection-subject past-end forms to set T, and re-check the status on range writes.

4. **Low: the time in `describeSpaceStart` isn't clamped.** `ArrangementContext.tsx` diff line 151
   - `formatArrangementTime(point.requested)` has no clamp, while `writeInsertMarker` clamps with `Math.max(0, next)` (:829).
   - It's harmless as long as range starts are never negative, but the two should match. Fix: `formatArrangementTime(Math.max(0, point.requested))`.

- **Accessibility note (no action):** Rule W bumps `statusSequence` only when the text actually changes, so pressing Home repeatedly doesn't re-announce. Each Ctrl+←/→ that moves the marker does announce once, which is what the contract asks for. The status element's ARIA attributes are not touched.

### Good Practices Found
- One shared rule decides where Space starts (`resolvePlaybackStart`). `startPlaybackAt` calls it, so the stop text and Space's real behaviour can't drift apart. PB1–PB7 and LT11 check this.
- `insertMarkerStatusKind` rebuilds the full text from the templates and compares it exactly, not by prefix. PB8 includes changed-text cases that must not match.
- The function form of `setStatus` leaves texts outside set T untouched and doesn't move the sequence (LT9).
- When a caller writes its own status after the marker write, the caller's text wins (`setInsertMarker`, `moveInsertMarkerToPlayhead`, `playFrom` refusal), and LT10 covers it.
- LT4 tests the natural end through the real `tick` loop with captured animation frames, not a substituted effect.

### Architecture note (proposal only, nothing to change this round)
- **Signal:** `playback-start.ts:43-89` / `ArrangementContext.tsx:824`. Status text is now being used as state: Rule W and Rule S pull the times back out of the text with a regex and re-render templates to work out what the line means.
  - **Keep it this round, because** B's D-29z594 contract requires it, the exact-match check prevents false positives, and moving it would touch how status is announced and `statusSequence`.
  - **Cost:** every new template that names the marker has to be added to `insertMarkerStatusKind` by hand. If one is missed, nothing fails; the text just goes stale (finding 3 is this case).
  - **Proposal for the planner:** one bounded task. Add a typed tag next to the status text (`{ kind, params }`) so membership in set T is a tag check. Keep `status: string` in the public hook unchanged and keep the `statusSequence` rules.
- **Signal:** `describeSpaceStart` is new public surface on `useArrangement`. Keep it: it's small, stable and has no state of its own.

### Alternative Approach (Studio playback-status logic)
- **Current:** a status updater applied in the reducer (Rule W) plus a rewrite in the stop effect (Rule S). Both are driven by recognising the current text and read refs late.
- **Alternative:** work out the text where the event happens: compute `describeSpaceStart()` / the playing form at the moment of the marker write and dispatch a plain string, but only when a ref mirroring the committed text is in set T.
- **Verdict:** keep the current approach for this round. Its late read is what makes Home → clear range come out right without ordering the calls by hand, and it's the agreed contract. The alternative makes the timing explicit and skips the provider re-render when nothing changes. Weigh it in stage 2 together with B-R272-STOPPED-TEXT-WHILE-PLAYING.

### Score: 8/10