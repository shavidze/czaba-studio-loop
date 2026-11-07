Reading is done. I traced the call paths in `ArrangementContext.tsx` and `graph.client.ts`. Here is the review.

COMMIT: OK

## Code Review: ArrangementContext.tsx, graph.client.ts (+ tests, doc)

I reviewed the diff, the surrounding code at `ArrangementContext.tsx:1136-1270`, `1680-1745` and `1936-1976`, and `SF1`–`SF11` in the UI test. I did not run anything. I rely on C's PASS and the passing `verify.log`, which I did not open. This is a review of the diff, not an audit of the whole module.

### Critical Issues
- None. The diff touches no auth, purchase or download code. It adds no `any`, `@ts-ignore` or type assertions. It adds no listeners, timers or custom CSS. `queueMicrotask` is one-shot.

### Suggestions (ranked)
1. **`ArrangementContext.tsx:1262-1268` (Low).** `stopForScheduleFailure` runs `stopPlayback`, which calls `stopGraph` → `handle.stop()` and `disconnect()`, without a guard. If those throw in a real browser, for example after an `InvalidStateError` on a context that has been closed, the failure path throws too. Callers in `startPlaybackAt`, scrub and seek would then see an uncaught exception, and `isPlayingRef` would stay `true`. The fix is to wrap `stopGraph()` in `stopPlayback` in a try/catch that still runs the rest of the cleanup, or to put the try/finally inside `stopForScheduleFailure`. This is an edge case the tests do not inject.
2. **`ArrangementContext.tsx:1264` (Low).** The microtask calls `setStatus` after unmount if the provider unmounts in between. This is harmless in React 18, since the unmount warning was removed. It also relies on microtask ordering to beat the `setStatus` updater at `:1712`. Updaters queue in order, so this is correct, and `SF10` covers it. A short ASCII comment is not needed; the Georgian one is acceptable.
3. **`graph.client.ts:~255-320` (Low).** If `createGain`, `createStereoPanner` or `createBufferSource` throws partway through an iteration, the half-built nodes of that iteration are not disconnected. Examples are `clipGain` already connected to `trackGain`, or `fadeGain`. They have no running source and are garbage-collected. This is an acceptable leak, but a try/catch around the whole per-clip body would make it complete.
4. **`graph.client.ts` (Info).** `metronomeGain` is now a mutable `let` captured by `startClicks` and `appendClicks`. TS narrowing is handled correctly through the local `clickGain`. The node creation order changed: track gains are registered in the maps before they are connected, and `metronomeGain` is created after `startPlan`. This matches the old order for the metronome. Node creation order has no audible effect.
5. **Accessibility (Info).** The status text is the existing `status` channel. The diff adds no new UI. I did not check whether it is announced through a live region.

### Real-browser event ordering and leaks
- **`tick` guard (`:1363-1367`).** It re-checks `isPlayingRef` after the pump, so no `requestAnimationFrame` is re-queued after a failure. `stopPlayback` cancels the frame and clears the pump interval. `SF11` asserts that no frame is left queued.
- **`startPlaybackAt` (`:1720-1722`).** It returns before starting the rAF and the pump interval when the start fails. No timer is created and then leaked.
- **Scrub.** `scrubbingRef` is reset by `stopPlayback`. Later pointer moves return early on `!isPlayingRef`, and `endPlayheadScrub` places the marker.
- **`startGraph` failure after `applySchedule` succeeds.** The new handle is already in `handleRef`, so `stopGraph` stops and disconnects it. The previous handle is either still in `handleRef`, or in `retiredRef` and stopped there. Nothing is left sounding. I traced this path in the code, and `SF9` covers it.
- **`applySchedule` catch.** It calls `stop()` only on sources that were started. A source whose `start` threw is disconnected in its own catch. `releaseNodes` is shared with `disconnect`, so cleanup is idempotent.

### Good Practices Found
- `releaseNodes` is extracted once and reused by both `disconnect` and the failure path.
- Tests cover Play, repeated Play, edit, seek, scrub, scrub end, time-removing edit, loop fill, pump and rAF. They also include the "no error events" assertion and the microtask race (`SF10`).
- All the previously separate ad-hoc `catch` blocks now go through one failure path.

### Architecture note
- signal 4 (new state or lifecycle in an existing owner): `ArrangementContext.tsx:1260-1283` adds a failure policy (stop plus status, with the status deferred by microtask) to a context that already owns the graph lifecycle. Keep it, because the policy needs `isPlayingRef`, `stopPlayback` and `setStatus`, all of which are context-owned. Extracting it would add ref plumbing for about 25 lines.
- `ArrangementContext.tsx` has taken several scheduling and failure rounds. If more rounds hit the `startGraph`, `syncPlayback` and pump region, the planner could consider one bounded task: move the playback-scheduling callbacks into a `usePlaybackScheduler` hook inside the context's ownership. The invariants would be audio timing, the refs, the shape of the public `useArrangement()` hook, and `SF1`–`SF11`. The cost is medium, and it is not needed now. This is a proposal for the planner only.

### Alternative Approach
- **Current:** `try/catch` around `startGraph` in a wrapper (`startGraphOrStop`), and the same `stopForScheduleFailure` policy at every call site. A partial `applySchedule` is rolled back inside `applySchedule` itself.
- **Alternative:** one error boundary in the scheduler that catches errors from every entry point, with no per-call-site `stopAt` argument.
- **Verdict:** keep the current approach. Each call site knows its own stop position (start point, seek target, scrub point), and a central catch would not. Rolling back inside `applySchedule` keeps audio-graph invariants in `lib/`.

### Score: 8.5/10