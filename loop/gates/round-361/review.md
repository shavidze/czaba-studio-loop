COMMIT: OK

I read the diff, `verify.log` (248 files and 3643 tests passed, build ok) and the primitives. I didn't run the app in a browser or rerun anything.

- **Auth, purchase and download code:** none touched. The changes are limited to the Studio arrangement store and context, three arrangement components, tests, one doc and the perf budgets.
- **TS strict:** no new `any`, `@ts-*` or type assertions. Semicolons are present.
- **Tailwind, tokens, accessibility:** no markup or class changes.
- **Cleanup:** no new timers, listeners or effects. The store is created once per provider, so there is nothing new to leak.

## Findings (ranked)

1. **Medium, render cost: collapsed group headers now re-render on every arrangement change.**
   - Where: `StudioWorkspace.tsx`, the `trackGroupActiveCandidates` memo (diff ~L3086) and the `activeCandidateTrackIds` prop on the memoized `ArrangementGroupHeaderWithSelection`.
   - Why: the memo depends on `arrangement`, so every edit creates new arrays for each collapsed group. The array identity changes even when its contents don't, so the header's `memo` stops helping. Before, `containsActive` was a boolean that stayed stable.
   - Where it was missed: the perf harness has no collapsed group (PO-R361-3), so neither the budget nor `verify` would catch it.
   - Fix: keep the previous array per group id in a ref and reuse it when the ids are equal. A stable `useEqualityStableSelector`-style helper, or passing a joined string key and splitting inside the selector, would also work. Optionally add a render-count test with a collapsed group and a clip edit. It doesn't block this commit.

2. **Low, doc accuracy.**
   - Where: `234-perf-playback-store.md`, "Testing" (diff ~L610) and mutant MU-6.
   - Why: the doc says UC7 in `track-group-collapse-ui.test.tsx` was added in round 361. That file is not in `paths.txt` or the diff, and `untracked.txt` is empty, so UC7 already exists at HEAD. It exists in the working tree at L832 and passes in `verify.log`.
   - Fix: reword it as "UC7 (existing) covers…", or confirm that the file wasn't supposed to be part of the commit.

3. **Low, render cost.**
   - Where: `ArrangementLibraryPreview.tsx:111`.
   - Why: each library row subscribes to the raw `activeTrackId`. Every active-track change re-renders all rows, although only `canAdd` can change. The old context path did the same, so this is no regression.
   - Fix: select a boolean, such as whether the active track is an audio track, via a selector.

4. **Info, `activeTrackId` removed from `useArrangement()`.**
   - Why: this changes the public hook's shape, which the checkpoint lists among its invariants. It follows the `isPlaying` precedent, the probes were updated, and tsc and the tests are green, so it is acceptable here.
   - Fix: none. Make sure no consumer outside `app/` reads the field.

5. **Info, `interact.click.components <= 42` has no headroom.**
   - Why: the count is deterministic and matched in all 6 samples, so the budget follows the project's own rule. Any unrelated change that adds a rendered component will turn it red. That is intended, but tell whoever hits it.

## Event ordering
This looks correct.
- `setActiveTrackId` now writes synchronously to the store, which replaces the old `latestRef` mirror.
- The library add, paste and Alt+Arrow handlers read `selectionStore.getState()` when they run, so they never see a stale render-time value. SS11 covers a change followed by a paste in the same event.
- The setter's equality guard keeps listeners quiet on repeat clicks (SS9).
- The seed is still the first audio track (SS10).

## Architecture note
- Signal 2 (ownership/coupling change): `activeTrackId` moves from provider `useState` and `latestRef` into `selection-store.ts` (`ArrangementContext.tsx:~710, ~918`). The selection store now owns selection and active lane. Keep it. Both belong to the same selection lifecycle, a 13th store would add plumbing, and SS8–SS11 plus UC7 pin the behavior.
- Signal 4 (new state in an existing owner): `ArrangementGroupHeaderWithSelectionInner` now owns the active-lane subscription (`StudioWorkspace.tsx:~755`). Keep it. It is already the `XInner` plus `memo` owner for selection-derived header data.
- Signal 3 (repeated costly changes to one region): `ArrangementContext.tsx` and `StudioWorkspace.tsx` are touched in every PERF-10 round. A bounded task is already queued as PERF-10b-ii. The proposal for the planner is to do it as one task: stabilize the `activeCandidateTrackIds` identity (finding 1), then add a collapsed-group row to the perf harness so this path is measured. It is a proposal only, not for this round.
- This review covers the diff only and does not claim the modules were fully checked.

Score: 8/10