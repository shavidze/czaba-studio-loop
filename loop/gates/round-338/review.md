COMMIT: OK

I reviewed the diff and the new store file and read the call sites in `ArrangementClip.tsx` and `ArrangementContext.tsx`. I did not run anything (read-only), and I relied on `verify.log` and C's PASS for the build, tests and perf run. Auth, purchase and download code is untouched. I found no blockers.

## Code Review: clip-lane drag store (round 338, PERF-DRAG-PREVIEW c3-ii)

### Critical Issues
- None.

### Suggestions (ranked)
1. **`ArrangementContext.tsx:1941-1945`, the new identity branch in `previewClipGeometry`.**
   - **Risk:** The branch resets `historyRef.current` to `publishedHistoryRef.current`. That is safe only because `previewClipGeometry` is the only writer that lets `historyRef` diverge from the published history without publishing. If another unpublished writer is added later (c4 group move, c5 video), the branch would silently discard its state.
   - **Fix:** Add a one-line TODO or invariant test saying the branch assumes no other unpublished writers. Keep the code as it is.
2. **Five probe files, for example `gesture-guard.test.tsx:12-16`.**
   - **Problem:** Each test file declares `type LaneDragProbeValue` between import statements and builds its own `{...useArrangement(), clipLaneDrag}` probe. That is five copies.
   - **Fix:** Move the type and a `useLaneDragProbe()` helper into a shared test util. This is a cosmetic fix and can wait.
3. **`perf/budgets.interactions.json`, the `interact.harness.drag-lane-live` notes (about lines 2100 and 2246).**
   - **Problem:** The notes still say "Record until C measures it (L58)" while `mode` is now `assert`.
   - **Fix:** Drop that sentence.
4. **`ArrangementLane.tsx:~270-282`, `selectLaneMoveSourceKey` joined with `'\n'` and split again.**
   - **Problem:** It works because clip ids cannot contain a newline. The selector also allocates `clips.map` for every lane on every store update.
   - **Cost:** That is small, because `publishLaneGhosts` already de-duplicates by key. No fix is needed. If lane or clip counts grow, return a sorted `readonly string[]` through `useShallow` instead.
5. **`perf/studio-lab-interactions.perf.spec.ts`, the new check (e).**
   - **Problem:** `Number('')` gives NaN, which fails the `>` comparison. That fails the check in the safe direction.
   - **Fix:** None needed.

### Checks beyond the tests
- **Event ordering:**
  - **Release path:** `release()` calls `setClipLaneDrag(null)`, and `commitArrangement` follows in the same pointerup event. `useSyncExternalStore` updates are batched together with the `setHistory` update. The perf row `release-commits == 1` confirms one commit in a real browser. Release calls that come from native listeners (an uncaptured pointer, or a claim abort) still land in one microtask flush.
  - **Unmount:** The `ArrangementClip` unmount cleanup calls `release()`, which writes to the store during cleanup. This is legal. It re-renders only the subscribers.
- **Leaks:** There are no new listeners, timers or effects. The store is created once per provider with `useState`, so it is garbage-collected with the provider. `zustand/vanilla` subscriptions are owned by `useStore`.
- **Existing flows:**
  - **Selectors:** `isLaneMoveSource` and the lane ghost filter keep the same semantics (`clipId` match and `!blocked`). The readout still derives the refusal from the first blocked ghost that has a message.
  - **Context value:** `setClipLaneDrag` is a stable `useCallback` and is now in the memo deps, so `useArrangement()` consumers no longer re-render on drag.
  - **Video import wait:** `previewActiveRef` is still set to true on every call. This is the TL-1 fix, and MU-GUARD-V2 covers it.
- **Render cost:**
  - **Ghost filtering:** `useShallow` with the shared empty array keeps lanes without ghosts from re-rendering. A lane that does have ghosts still re-renders in full on each ghost change; the doc already records this as SIG-R338-GHOST-LAYER.
  - **Per-move cost:** The provider and `StudioWorkspace` no longer render on cross-lane moves. The doc reports 58.97 → 24.9 components per move. The budget of 25 leaves 0.1 of headroom, which is tight, so watch it when c4 and c5 land.
- **TypeScript, Tailwind and accessibility:**
  - **TypeScript:** Non-test code has no `any`, suppression directives or type assertions.
  - **Tailwind and DOM:** There is no CSS change, and the DOM and testids are unchanged.
  - **Accessibility:** The readout keeps the same text and the same refusal span.
  - **Imports:** `ArrangementClip` now takes its types from `lib/` instead of the context, which reduces coupling.
- **Docs:** The implementation doc (232) is updated, in Georgian, with alternatives and mutants. Doc 168 is in sync.

### Good Practices Found
- The store follows the existing range-store pattern, with an `Object.is` guard against needless notifies.
- Selectors are pure functions with unit tests (CL1–CL4).
- DP49 and DP50 assert render counts, the release result and the refusal path.
- The perf rows were promoted from `record` to `assert` only after mutants went red.

### Architecture note
- **Signal 2/4 (new state in an existing owner):** `ArrangementContext.tsx:4412-4440`. The provider now nests a 10th store context (`ArrangementClipLaneDragContext`), and each context needs its own create/provider/hook trio (`:540-545`, `:4483-4495`).
  - **Keep, because:** Each store has its own lifecycle, and the public `useArrangement()` shape and the gesture and undo atomicity are unchanged. The cost of keeping it is low.
  - **Proposal for the planner, not for this round:** A bounded task, "compose the per-provider stores into one `ArrangementStoresProvider` / factory". It would be pure plumbing, with the existing render-count tests (DP*) as acceptance. Do it only if c4 or c5 adds an 11th store.
- **Signal 3 (repeated costly change to one region):** The cross-lane and group `previewArrangement(gesture.before)` calls and the `ArrangementLane` ghost layer are already queued as SIG-R338-GROUP-CROSS-PREVIEW and SIG-R338-GHOST-LAYER in doc 232. Keep them queued for c4.
- This note covers only the diff, not the whole module.

### Alternative Approach
- **Current:** A separate `clipLaneDragStore` with per-lane selectors, plus an identity short-circuit in `previewClipGeometry`.
- **Alternative:** Put the ghosts into the preview store, or guard the cross-lane branch with `getArrangement() !== gesture.before`.
- **Verdict:** The current approach is better. Ghosts are not geometry, and the preview store's convergence logic would then also have to cover them. The guard variant stops setting `previewActiveRef` on a direct cross-lane move, which the video import wait depends on. This is already recorded in doc 232 and covered by MU-GUARD-V2.

### Score: 9/10