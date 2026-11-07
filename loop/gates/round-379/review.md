COMMIT: OK

I read the diff, the new implementation doc and the call sites. I did not run a browser. The review below rests on the code, the passing C round and the passing `verify.log`.

## Findings (ranked)

No blocking findings. The commit has no auth, purchase, download, token or API-client code. It adds no `any`, no suppression directives and no type assertions. There is no custom CSS, no listener or timer, and no `dangerouslySetInnerHTML`.

1. **Low – `app/components/arrangement/ArrangementMarkerRow.tsx:401-404`, event ordering.**
   - `focusEditorSuccessor` now calls `focusMarkerTarget(...)` and then sets `pendingFocusRef.current = null`.
   - If the flag is connected, `focusMarkerTarget` already clears the ref, so the extra line does nothing.
   - If the flag is not connected, the ref used to be cleared by the workspace re-render that closing the grid menu caused. The memoized view skips that re-render, so the explicit clear keeps the old result.
   - Fix: none needed. The marker-browser rows and unit rows named in the doc cover this. Leave the line in place.

2. **Low – `ArrangementMarkerRow.tsx:122-155`, stale-handle risk.**
   - `useImperativeHandle` re-binds only when the view renders. `closeMenu` depends on local menu state and `stepMarker` depends on `projectEnd`. Both change the view's props or state, so the handle is re-bound in time.
   - `beginAddMarker` and `focusEditorSuccessor` use only stable callbacks and refs.
   - RB-LEAF6 covers the case with `M` after the skipped renders, which opens and focuses the name input.
   - Fix: none. Keep that last assertion in the test, because it is the only guard for this risk.

3. **Low – `ArrangementMarkerRow.tsx:77-104`, the memo depends on all 11 context callbacks staying stable.**
   - The doc says all 11 are `useCallback` in the provider with `[]` or store-based dependencies.
   - If someone later gives one of them a changing dependency, the view starts re-rendering on every commit with no error. RB-LEAF6 and the MU-MR-ACTIONS-FRESH mutant would catch it, but only in jsdom.
   - Fix: none now. A short TODO in the provider next to those callbacks would help, but it is optional.

4. **Info – `app/lib/arrangement/__tests__/render-budget.test.tsx:237`.**
   - The test depends on the fiber name `ArrangementMarkerRowViewInner`. The doc says this name check alone fails against HEAD, so it proves nothing about behavior.
   - The positive controls (marker add, undo, zoom, projectEnd change) do protect against a silently dead counter.

5. **Info – the memo hides in-place mutation of `arrangement.markers`.**
   - The doc already tracks this as GATE378-L2, deferred.
   - The Undo/Redo model I could see in the diff is immutable, and `arrangementMarkers` returns the same `NO_MARKERS` constant when there are none, so list identity is stable.

## What I checked
- **Render cost:** the change is an improvement. The memo props are `markers`, `projectEnd`, the layout numbers, a memoized `actions` object and a ref. `arrangementMarkers(arrangement)` returns `arrangement.markers ?? NO_MARKERS`, so its identity is stable when markers don't change.
- **Existing flows:** `ArrangementMarkerRow` was the old export. A grep shows only `StudioWorkspace.tsx` mounts it. The two other references (`studio-focus-ring.test.ts` and `strings.test.ts`) only scan the file as source text.
- **Accessibility and design:** markup and Tailwind classes are untouched. The diff changes only the data path.
- **`FORWARDREF_COMPONENT.md`:** swapping `forwardRef` for a `handleRef` prop is a deliberate deviation. It matches the four earlier leaf views (Master, Library, Transport, LoopBrace), and the doc explains it.
- **Implementation doc:** `245-perf-marker-row-leaf.md` follows the template and is in Georgian.

## Architecture note
- **Signal 3 (repeated costly change) and signal 2 (coupling):** `app/components/arrangement/ArrangementMarkerRow.tsx:61-105` and `app/components/arrangement/StudioWorkspace.tsx:1037-1040`.
  - This is the fifth `useXActions(workspace)` hook followed by a memo leaf. Each one copies the context callbacks by hand into a `Pick` and a `useMemo`, and the copy stays correct only while the provider keeps those callbacks stable.
  - Keep for this round. The five leaves are consistent, the audio timing, refs, gesture lifecycle and Undo/Redo behavior are unchanged, and the public `useArrangement()` shape is unchanged.
  - Proposal for the planner, as one bounded task: add a single stable actions context to `ArrangementProvider`. Leaves would read it directly, so the `useXActions` hooks and the `Pick` types would go away.
    - Cost: medium. It touches the provider.
    - Acceptance: RB-LEAF1 to RB-LEAF6 stay green, `useArrangement()` keeps its shape, and the render-budget mutants stay red.
    - Do this after the PERF-11c-iii-d/e leaves, or at the planned checkpoint (ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING).
  - This is not a finding for this round. It covers only the diff, not a full audit of the module.

Score: 9/10