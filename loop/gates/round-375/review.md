COMMIT: OK

I read the diff, the touched files and the architecture reference. I did not run the app in a browser, and I did not open the verify log or the 242 implementation doc. My conclusions come from reading the code.

**Scope.** Nothing touches auth, purchase, download, API client or Firebase code. The only product files changed are `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx` and `StudioWorkspace.tsx`.

**Event ordering and leaks.** No listeners, timers or effects were added or moved.
- `libraryAsideRef`, `libraryBodyRef`, `changeLibraryCollapsed` (a `useCallback` at `StudioWorkspace.tsx:1235`) and the other library props passed in at `StudioWorkspace.tsx:3265-3281` are stable references. Those refs are still created in `StudioWorkspace`, where its focus and inset effects at lines 1170-1251 read them.
- `ArrangementLibraryViewInner` now takes `libraryPreviewSourceId` and `selectedSourceId` as props. The preview's active-lane store subscription (`useArrangementActiveTrackId`) stays inside the preview, so an active-lane change re-renders only the preview, as the RB-LEAF3 test checks.

**Regressions.**
- `ArrangementLibrary` (exported from `index.ts`) and `ArrangementLibraryPreview` keep their public shape and still work as wrappers over the new views.
- The comparator `sameLibraryLeafProps` compares every prop by identity except `tracks`, which it compares by id, kind and name. It also returns false if a key exists only in the next props. A mute change on a lane therefore doesn't re-render the library.
- Props the library reads from the workspace (`collection`, `sourceStates`, `sourcePeaks`, selected id, preview id) are passed explicitly, so nothing stale is read from a closed-over context.

**TS strict, Tailwind and accessibility.** No `any`, suppression directives or type assertions in the diff. The JSX and classes are unchanged, so the tokens and Tailwind usage are unchanged. The new RB-LEAF3 test checks the Add button's `aria-disabled` and `title` after active-lane changes.

**Findings, ranked**
1. Low, `ArrangementLibrary.tsx:231-247` and `ArrangementLibraryPreview.tsx:156-185`: the `ArrangementLibrary` and `ArrangementLibraryPreview` wrappers appear unused by the Studio runtime (only the `index.ts` re-export and tests reference them). They are not harmful, but they can drift from the views. Fix: either leave them as the public convenience API, or drop them in a later cleanup if nothing outside the app imports them.
2. Low, `ArrangementLibraryPreview.tsx:226-241`: `sameLibraryLeafProps` iterates `for...in` with `Object.is`, so any future inline callback or object prop silently defeats the memo. LP-EQ2 covers a changed `actions` object, but nothing guards against someone adding an unstable prop. Fix: keep the render-budget tests as the guard, and add a one-line note in the 242 doc.
3. Info, `render-budget.test.tsx`: the tests assert `ArrangementLibraryViewInner` render counts by component name. If the inner function is renamed, `?? 0` makes the `toBe(0)` assertions pass vacuously. The `toBe(1)` assertions in RB-LEAF3 would still fail, which partly protects against that.

**Architecture note**
- Signal: new state and lifecycle in an existing owner, with a change in coupling. `StudioWorkspace.tsx:1031-1032` now calls two action-bundle hooks (`useArrangementMasterActions` and `useArrangementLibraryActions`) and passes seven or more props to the library at `StudioWorkspace.tsx:3265-3281`.
- Keep, because it is the third use of the same leaf pattern (clip, master, library). It leaves audio timing, refs, the public `useArrangement()` hook and Undo/Redo unchanged, and the render-budget tests protect it.
- Proposal for the planner, not for this round: if a fourth leaf (detail panel or ruler) follows the same pattern, consider one bounded task to extract a shared "leaf actions bundle" helper. The acceptance criterion would be the existing render-budget tests staying green with no change to `useArrangement()`'s shape.
- This note comes from reviewing the diff. It does not mean the module was fully audited.

**Score: 9/10**