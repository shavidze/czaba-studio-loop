COMMIT: OK

## Code Review: ArrangementLane.tsx, drag-preview-render.test.tsx, doc 273

I read the diff, `preview-store.ts` and `ArrangementContext.tsx` (the `useArrangementPreviewStore` and `useArrangementPreviewLaneClips` hooks). I did not run the browser. The `verify.log` I grepped shows no failures, but I did not read it in full.

### Critical Issues
- None.
- Auth, purchase and download code is untouched. The three files are one arrangement lane component, one test file and one doc.
- There are no new `any` types, suppressions or type assertions. There are no new listeners, timers or effects, so there is nothing that can leak.

### Suggestions (ranked, none blocking)
1. `ArrangementLane.tsx:108-117` (Low, already recorded as TL-R424-L1): `laneGhostTitles` reads `getArrangement().clips` inside a memo keyed on `laneGhosts`.
   - The title can go stale if a ghost clip's `sourceId` changes while the ghost array stays shallow-equal. That is unlikely during a drag.
   - Fix: carry `sourceId` on `ClipLaneGhost`, as the doc proposes.
2. `ArrangementLane.tsx:~1346`, `useShallow(fn)(arrangement)` called in render (Low):
   - It works. `useShallow` calls `useRef` itself and the returned function is pure, so the hook order is stable and the array stays stable when other tracks change.
   - It looks like a hook called through a closure, and a future reader or lint rule may flag it. The fix is a short named helper such as `useCommittedLaneClips(arrangement, trackId)`, or a small unit test that pins the stable-reference behaviour.
3. `ArrangementLane.tsx:~88`, `selectPreviewLaneClips(state.preview, state.preview, id)` (Low, TL-R424-L3): passing the same argument twice reads oddly. A lane-filter helper would be clearer.
4. DP30 in `drag-preview-render.test.tsx` still expects `ArrangementLane` renders `> 0` on a same-lane move, and it passes.
   - The doc admits the cause of this residue was not found (it passes, but the shell still renders in that step).
   - Check what re-renders the shell there. If it is `useArrangement()` context churn, it is a small remaining cost during that gesture.
5. `useArrangementPreviewLaneClips` is now used only by tests (TL-R424-L2). Deleting it needs Saba's approval, so leave it.

### Good Practices Found
- Behaviour is equivalent. The inner component uses the preview clips when a preview exists and `committedLaneClips` otherwise. This is the same logic as the old `useArrangementPreviewLaneClips`.
- Clip arrays stay referentially stable through `useShallow`. The shell's props do not change during a drag, so the `memo` comparator can skip it. That brings the lane back to 1 fiber per drag commit.
- The tests were not weakened. Each moved assertion keeps its value on the inner component, and a new `ArrangementLane === 0` assertion pins the fix.
- The public `useArrangement()` shape is unchanged, and the performance budgets were not raised.
- The implementation doc is complete and has the right alternatives and TODO items.
- No custom CSS or hardcoded colours were added. The UI markup is unchanged, so accessibility is unaffected.

### Architecture note
- Signal 4 (new state or lifecycle in an existing owner), `ArrangementLane.tsx:~330-370`: `ArrangementLaneViewInner` now also owns the preview and ghost subscriptions and derives `laneSources` and `laneGhostTitles`.
  - Keep it. The subscriptions share the inner component's render lifecycle, and moving them is exactly what removes the extra shell and Memo fibers. Extracting a hook would add prop plumbing without isolating anything.
- Signal 3 (repeated costly change to one region): rounds 409 and 424 both reshaped the lane shell/inner split. Both rounds needed fiber-count probes to check the result.
  - Proposal for the planner, one bounded task: add a fast render-count guard (a unit test at the `drag-preview-render` level) that fails if the lane shell subscribes to any store.
  - The round-424 change already adds this for four scenarios. A permanent `test:perf` row on the fiber-count budget, as the doc suggests (RC-R423-PERF-SPEC-ON-STRUCTURE), would prevent the next silent regression.
- This note covers only the diff. I did not audit the whole module.

### Alternative Approach
Not critical business logic (this is a render-performance change). For the record:
- Current: the inner component subscribes to the stores directly.
- Alternative: raise the budgets by 2 fibers per lane, as the performance-optimizer suggested.
- Verdict: the current approach is better. The alternative would hide a real structural regression and would remove the "no headroom" rule on the budgets.

### Score: 9/10