COMMIT: BLOCK (the public shape of `useArrangement()` changed without a grant I could find. `range` was removed from `ArrangementContextValue`, but `.claude/references/architecture-checkpoint.md:33` says that shape must not change. No other blocker: if root confirms the PERF-8a grant covers removing it, this becomes COMMIT: OK with no code changes.)

## Code Review: round 320, PERF-8a range store (43 paths, HEAD `50662e1`)

**Scope.** I read the whole diff except about 230 lines (1553–1642 and 1643–2167). Those are the mechanical probe rewrites in the other test files, apart from `render-budget.test.tsx`. I also read all of `range-store.ts`, doc 230, the first 80 lines of `range-store.test.tsx`, the parts of `verify.log` my searches matched, and the budget JSON. This is a review of the diff, not of whole modules.

**No auth, purchase or download code is touched.** Every path is under `app/components/arrangement/*`, `ArrangementContext.tsx`, `lib/arrangement/*`, the tests, `perf/`, the docs or `THIRD_PARTY_NOTICES.md`. `package.json` and the lockfile are not in the diff: `zustand@5.0.16` is already committed at HEAD.

### Critical Issues
1. **`ArrangementContext.tsx:303` (the removed `range: TimeRange | null`) and `:4038` / `:4155`: the public hook's shape changes.** The checkpoint rule lists the shape of `useArrangement()` as an invariant that must not change. The only document that approves removing `range` is doc 230, and that doc is part of this commit. The round's gate folder has only `paths.txt`, `diff.patch`, `untracked.txt` and `verify.log`: no task brief, and the `c-round-320.json` you cited is not there either. Docs 171 and 172 at HEAD confirm "PERF-8 (zustand)" was planned. They don't say the hook shape may change. The removal is what makes the speed-up work, so I'm not suggesting a code fix.
   **Fix:** root records the grant (task brief or ruling ID) and adds it to doc 230's "გადაწყვეტილებები" section, for example "D-…: `range` leaves `useArrangement()`; read it with `useArrangementRange`". After that, commit as it is.

### Suggestions (none block)
2. **`ArrangementContext.tsx` ~1697, 1774, 1911, 1930, 2127, 2431 and 2615: `setRange(null)` now runs before `setSelectedClipId` / `setSelection` in 8 places.** Doc 230 doesn't explain why.
   - Inside event handlers React still batches both updates, so nothing changes there.
   - After an `await` (adding a video at ~2615, adding a library clip after it loads), the store write re-renders at SyncLane in a microtask, while `setState` waits at DefaultLane. That gives two commits, and possibly one painted frame where the range is gone but the old selection is still showing. HEAD did both in one commit.
   - **Fix:** write the reason for the reorder (or an RS test) into doc 230. If the frame matters, wrap the post-`await` writes in `unstable_batchedUpdates`, or set the selection through the same store.
3. **`range-store.ts:48-49` with `ArrangementLane.tsx:347`: on an all-tracks drag, every lane re-renders on every move.** The selector hands every lane the same `range` reference. The 5 asserted budget rows cover only the clip-range drag; nothing asserts the all-lanes or background drag.
   **Fix:** add the background all-lanes drag as a `record` row (backlog for PERF-10). Later, move the all-lanes overlay into a small memo child, like `ArrangementClipRangeOverlay`.
4. **`ArrangementDetailPanel.tsx:1078`: the whole panel re-renders on every move,** including the header and toggle while collapsed, and when no clip is selected. Doc 230 already tracks this as `A-R319-ARCH-DETAIL-SUBSCRIPTION`. Note that a passed `range={null}` now behaves differently from leaving the prop out. That is tested (RS8a/b/c), but it is easy to trip over. A short JSDoc on the prop would help.
5. **`THIRD_PARTY_NOTICES.md`:** `@types/react`, `@types/prop-types` and `csstype` are listed as runtime packages because of zustand's optional peer dependency. This is already with root as `SIG-R319-DEVOPTIONAL-NOTICES`, so I'm not raising it again.
6. **Consistency:** the project's other stores (position, insert marker, mix draft, meter) are hand-written on `useSyncExternalStore`. This one is zustand. It works and the dependency was planned, but there are now two store patterns. Name zustand as the standard for new stores, or mention the mix in `REACT_CONTEXT.md`.
7. **Small items, no action needed:**
   - The `toggleEnvelopeMode` move in the `StudioWorkspace.tsx` dependency array is only a reorder.
   - The new readout's ` · ` text produces the same DOM text as before.

**Checked and fine:**
- **Strict TypeScript:** no `any`, no `@ts-ignore`, no `as`.
- **Tailwind and tokens:** classes moved without changes, no new colours.
- **SSR:** zustand v5 `useStore` uses `getInitialState` as its server snapshot.
- **Leaks:** no new listeners or timers. Store subscriptions are cleaned up by `useSyncExternalStore`.
- **Accessibility:** the readout and overlay `data-testid`s, the text and the `aria-hidden` icons are the same as before.

### Good Practices Found
- Callbacks read the range when the event fires (`rangeStore.getState().range`), not from a render snapshot, so stale `latestRef` reads are gone. RS7 protects this.
- `setRange` checks `Object.is` and skips no-op notifications.
- Selectors return the same reference or `null`. That is required with zustand v5's `useStore`, which has no shallow compare, and it avoids render loops.
- In `ArrangementExportDialog.tsx`, `isOpen ? state.range : null` means a closed dialog ignores drags.
- The `XInner` + `memo` naming follows the existing convention, so the render-budget sentinels keep their names (D-29z873).
- The budgets switched from `record` to `assert` and are not loosened: ≤15 per move (measured 9.233), max ≤35 (measured 30), `move-restarts == 0`.
- The mutant-backed RS1–RS8 tests cover each claim.

### Architecture note
- **Signal 2 (ownership/coupling change):** `ArrangementContext.tsx:781` with `range-store.ts:11`. Range state moves from context state into a store in `lib/`. Components (`ArrangementLane.tsx:347`, `ArrangementClip.tsx:94`, `ArrangementDetailPanel.tsx:1078`, `ArrangementTransport.tsx:438-439`, `StudioWorkspace.tsx:539,548`) now subscribe to it directly instead of reading `useArrangement()`.
  - **Keep it.** There is one owner (the provider creates the store and writes it through `setRange`) and one lifecycle. Undo/Redo atomicity and audio timing are unchanged: `move-restarts == 0` is asserted.
  - **The cost:** the public hook shape changed (finding 1), and there are two ways to read the range.
  - **Proposals for the planner:** both already exist, so no new task. `A-R319-ARCH-DETAIL-SUBSCRIPTION` (move the subscription into `ArrangementDetailContent`) and `SIG-R319-TRANSPORT-FLIP` (split the transport's `hasRange` part out) go to PERF-10.

### Alternative Approach (critical logic: state the gesture depends on)
- **Current:** a zustand vanilla store per provider, components subscribe with selectors, callbacks read it when the event fires.
- **Alternative:** a hand-written `createArrangementRangeStore` on `useSyncExternalStore`, matching the position and mix-draft stores. No new dependency and one store pattern across the Studio. The cost is copying the selector/equality plumbing that zustand provides.
- **Verdict:** the current approach is acceptable. zustand is small, it was planned in PERF-8 (docs 171 and 172), and its typed `useStore` selector API keeps the selectors simple. The hand-written option is only worth it if root wants a single store pattern (suggestion 6).

### Score: 8/10
The code and tests are solid and the measured gain is large: 108 → 9.2 components per move. Points come off for the unconfirmed change to the public hook (finding 1) and the unexplained reorder after `await` (finding 2).