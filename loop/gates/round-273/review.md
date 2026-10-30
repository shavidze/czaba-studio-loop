COMMIT: OK (auth, purchase and download code are not touched; typecheck, 220/220 test files and the build passed; no lint warnings land in the touched files; I found no blocking issues)

## Code Review: SYS-6 stage 2 — `ArrangementContext.tsx`, `playback-start.ts`, `strings.ts`, tests, docs 203/204

### Critical Issues
- None.

### Suggestions (most important first)
1. **Some range writes now re-render the provider for nothing.** At `app/contexts/ArrangementContext.tsx:845-854`, `setRange` now always sends a status update when no pointer gesture is active. A status update from `useReducer` can't be skipped early, so React always re-runs the `ArrangementProvider` body. Most of the roughly 20 places that call `setRange(null)` already change other state in the same batch, so they cost nothing extra. The exceptions are calls that change nothing, such as `setTimeRange(null)` when there is already no range. Before this diff React could skip those; now they always re-render the provider. The same happens during playback, where the rewrite never changes anything (`rewriteStoppedTruth` returns early when `isPlayingRef.current` is true).
   **Fix:** `if (gestureCountRef.current === 0 && !isPlayingRef.current) setStatus(rewriteStoppedTruth);`. Optionally, also skip the whole write when `latestRef.current.range === null && next === null`. LT19's playing branch keeps passing, because the text and its sequence number don't change.
2. **The status line now announces twice per play/stop cycle when it starts from a stopped message.** At `ArrangementContext.tsx:1414-1418`, starting playback replaces a stopped message with "Playing from X." Stop then puts the stopped message back (through the `StudioWorkspace.tsx:1940-1943` effect). Each change bumps the sequence number on `<output aria-live="polite">` at `StudioWorkspace.tsx:3137`, so screen readers hear two announcements.
   **Before:** pressing Space left the stopped text in place, so playback start announced nothing. (Stop's effect still wrote a plain string, which always bumps the sequence.)
   This matches the stage 2 goal (the status line describes the state after the action), and the message is short. It is a deliberate UX trade-off, so whoever approves the commit (root) should know it was made on purpose.
   **Fix:** none needed. If it gets noisy, check it in the browser with NVDA or VoiceOver.
3. **The new behaviour relies on update functions reading refs late.** At `:838-844`, `:860-873` and `:1414-1418`, the update functions read `isPlayingRef`, `insertMarkerRef`, `latestRef.current.range` and `historyRef` when the reducer runs during render, not when the update is sent. That is why LT12 and LT13 give the same final text whichever order the writes happen in. React applies queued reducer updates the same way in jsdom and in a real browser, so this is not a browser event-order risk.
   It is an unwritten contract, though. It would break if this moved to a store or `useState` that computes the value immediately, or to a value captured when the update is sent.
   **Fix:** state this contract in doc 204's "მიდგომა" (Approach) section.
4. **One test sits under the wrong heading.** PBS9 (`playback-start.test.ts:257`) is a stage 2 test inside `describe('SYS-6 stage 1 …')`. **Fix:** move it to a stage 2 `describe` block, or rename the block.
5. **Unchanged past-end matching (no action).** The new `subjects` loop in `playback-start.ts:74-84` matches the same texts as before. A past-end message has two time values, so `second` is used; an at-end message has one, so it falls back to `first`. The selection forms now count as 'stopped' and the playhead forms still don't. PBS8 and PBS9 cover both.

### Good Practices Found
- The old `describeSpaceStartRef` workaround is gone: `describeSpaceStart` moved above its users and is called directly, so the ref is no longer written during render.
- Every new `useCallback` has stable dependencies (they read refs only), so `setRange`, the gesture-release closure and the context value don't change identity.
- No new effects, timers, listeners or audio scheduling. `stopPlayback`, `tick` and the requestAnimationFrame / audio-pump lifecycle are unchanged.
- Range writes during a pointer gesture don't touch the text, and the gesture release re-derives it once with one sequence bump (LT17).
- The sequence number only moves when the text actually changes, because the reducer returns the previous state for an unchanged text from an update function (LT15, LT19).
- Strings are kept in `studioPlaybackStrings` and the `V02B_FORMATTER_SAMPLES` coverage check was extended.
- The rename from `PB*` to `PBS*` is justified: `store-focus-fixups.test.tsx` already uses PB1–PB2, and doc 204 explains this. The remaining `PB1`/`PB2` mentions in doc 160 refer to that other file, which is correct.
- No UI, Tailwind or token changes, no type casts (`as`), `any` or suppression directives, and no auth, purchase or download code.

### Architecture note
- **Signal 2 (ownership/coupling): rules for rewriting the status text live in two places.** `ArrangementContext.tsx` handles `setRange` (845), `writeInsertMarker` (856) and gesture release (1804). `StudioWorkspace.tsx:1933-1946` handles the stop path: an effect that calls the public `describeSpaceStart()`.
- **Signal 3 (repeated costly changes to one region):** stage 1 and stage 2 both reworked this region, and stage 3 is still to come.
- **Keep for now:** stage 3 will touch this code again, and moving it now risks audio timing, the gesture lifecycle and the shape of `useArrangement()`. Cost of waiting: low.
- **Proposal for the planner, after stage 3:** one bounded task that moves the on-stop rewrite into the provider, or into a pure `lib/arrangement/status-policy.ts`, so that `describeSpaceStart` can leave the public hook.
  - Acceptance: LT1–LT19 and PBS1–PBS9 pass unchanged, and audio timing and the gesture lifecycle don't change.
  - This is a proposal, not a fix for this round.

### Alternative Approach (Studio pipeline–adjacent logic)
- **Current:** each write path (marker, range, playback start, gesture release) rewrites stopped texts with a reducer update that reads refs when it runs.
- **Alternative:** compute the stopped text during render from `range`, `isPlaying`, the arrangement and the insert marker.
- **Verdict:** keep the current approach. The insert marker lives in a store and a ref, not in React state. Computing the text during render would mean putting the marker into state, which would re-render the provider on every marker move or scrub. It would also lose the "last message wins" ordering with messages that aren't about playback, such as "clip added".

### Score: 8.5/10