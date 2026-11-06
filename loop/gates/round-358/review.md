COMMIT: OK

I did not run the code. I read the whole non-test diff, the new files and the implementation doc. I read only the first ~1,080 of the diff's 2,886 lines, which covers all the app source except `studio-lab.tsx`. I read that file's hunk separately. The remaining ~1,800 lines are test-file edits, which I skimmed only through a grep (no `any`, `@ts-*`, `as` casts or Biome-ignore additions) and did not read in full. This is a review of the diff, not a full audit of the module.

## Code Review: playback store (PERF-10a)

### Critical Issues
- None. The diff touches no auth, purchase, download or token code. Its only files are the `arrangement/*` components, `ArrangementContext`, the studio-lab route, tests and the doc.

### Findings, ranked
1. **Low, `StudioWorkspace.tsx` mount effect (about line 2350) and the `ArrangementPlaybackFollowSync` leaf (about line 912).** Correctness depends on React running a child's effects before the parent's.
   - The leaf's layout effect writes `committedIsPlayingRef`. That is safe because layout effects run before any passive effect in the same commit.
   - The `StudioWorkspace` mount effect must stay after the tempo-seed effect, as the doc says. Nothing in the code enforces that order except RM1 and RM2.
   - Fix: add a short Georgian `// NOTE` above the mount effect stating the ordering requirement. Project rules allow comments for context.
2. **Low, `bars-ruler-ui.test.tsx:642` (FW-PB1).** It uses a real `setTimeout` with a 50 ms wait, and `IS_REACT_ACT_ENVIRONMENT` is restored in `finally`. If the original value was `undefined`, `Reflect.set(..., undefined)` leaves the property present with the value `undefined`, not deleted. This is harmless for React but is a small environment leak. Fix: use `Reflect.deleteProperty` when the original was `undefined`.
3. **Info, `drag-preview-render.test.tsx:~1050`.** The `LaneDragProbeValue` type references `WorkspaceProbeValue` above the import that provides it. This compiles because type imports are hoisted, and the position was already odd before the change. Fix: move the type below the imports when the file is next touched.

### Browser behaviours checked by reading (not run)
- **Event ordering:** `isPlayingRef` and `setPlaying` are written next to each other, in the same order as HEAD.
  - The event-time handlers now read `committedIsPlayingRef`, which updates after commit. HEAD's `workspaceRef.current.isPlaying` also only updated after commit, so the staleness window is the same.
  - `pauseFollowForNavigation`, `playFromRuler`, `placeInsertMarkerFromRuler`, the scroll handler and the follow tick all use the same ref, so they stay consistent with each other.
- **Mount while already playing (remount):** the leaf's layout effect sets the ref to `true`, then the mount effect calls the sync with `true`. That resets `autoScrollLeftRef`, which matches the old behaviour.
- **Stop from outside a React event:** the stopped branch uses the functional `setStatus` form. This keeps the stop message after a Follow pause, and FW-PB1 covers it.
- **Listener and timer leaks:** none added.
  - `useStore` handles the subscription.
  - The leaf has no timers or listeners.
  - `ArrangementMarkerRow` reads `getState()` at event time and does not subscribe.
- **Render cost:** `isPlaying` leaves the context value and its `useMemo` deps, so Play and Stop no longer re-render every `useArrangement()` consumer. The store ignores a set to the same value, so it doesn't notify subscribers. The inline selector in `useArrangementIsPlaying` is fine for `useStore`.
- **Remaining `isPlaying` readers:** the repo-wide grep shows no `useArrangement().isPlaying` reader left outside tests. The other `isPlaying` hits are the separate `AudioContext`, `StemsContext` and `StudioContext` states.
- **TypeScript, accessibility, Tailwind:** strict-clean in the new code, with no casts or `any`.
  - The leaf renders `null`, so there is no a11y change.
  - No CSS or tokens were added.

### Good Practices Found
- The store is created per provider through `useState(() => …)`, so it is not a module singleton and is SSR-safe.
- The fix for the remount regression (C-R357-01) has a test that fails on the old tree (RM1, RM2).
- The 46 test files were migrated through one shared `useWorkspaceProbe` helper.
- The `render-budget` assertions were tightened with a positive control.
- The implementation doc follows the TEMPLATE sections.

### Architecture note
- **Signal 4 (new state or lifecycle in an existing owner):** `StudioWorkspace.tsx` ~912–940 and ~2321–2354 now hold the committed-playing ref, the leaf and `syncFollowWithPlayback`.
  - **Keep:** it is one lifecycle with the Follow refs, and the ordering invariants are covered by RM1, RM2 and FW-PB1.
  - Extracting it now would risk the effect-order invariant.
- **Signal 3 (repeated costly change):** the Follow and status coupling in `StudioWorkspace` has needed several rounds and wide mocks.
  - **Proposal for the planner:** one bounded task to extract the Follow state machine into a `useTimelineFollow` hook.
  - Scope: `followModeRef`, `autoScrollLeftRef`, `committedIsPlayingRef`, the leaf and `syncFollowWithPlayback`.
  - Acceptance: the public `useArrangement` shape stays unchanged, the mount effect stays after the tempo-seed effect, and the FW, RM and `render-budget` tests pass unchanged.
  - Cost: medium. Do it after PERF-10b, not now.
- **Signal 2 (coupling):** `ArrangementProvider` now nests about nine context providers. This is acceptable, but another store should trigger a small `ArrangementStoresProvider` composition task.

### Alternative Approach
- **Current:** a per-provider vanilla store, a null-rendering memo leaf that transitions the ref and Follow sync after commit, and event-time reads from the ref.
- **Alternative:** subscribe to the store directly in `StudioWorkspace` with `store.subscribe`, or use a getter on the context value.
- **Verdict:** keep the current approach.
  - A synchronous subscriber fires before the provider's `setStatus` and `updatePosition`, so the position subscriber could see "playing" before `autoScrollLeftRef` is set.
  - A getter goes stale in spread probes. The doc records that this was tested and ruled out.

### Score: 9/10