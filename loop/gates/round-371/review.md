COMMIT: OK

I read the diff and the docs file and spot-checked `StudioWorkspace.tsx`. I did not run the code or a browser. The passing `verify.log` and C's PASS are taken as given.

Nothing in the diff touches auth, purchase, download or token code. It also adds no timers, listeners, effects or refs, so there is nothing new to leak. The `useEffect` and `useRef` imports in the header leaf are unchanged.

## Findings (ranked, none blocking)

1. **Low – `StudioWorkspace.tsx` ~L3140–3148, `trackGroupSoloStates`.**
   - It recomputes `trackGroupSoloState` for every group on each `arrangement` change.
   - Cost is O(groups × tracks) on every edit. That is negligible at normal project sizes, and it replaces a per-header compute that ran on every context change.
   - Fix (optional): none needed now. If profiling ever flags it, key the memo on `arrangement.tracks` only.

2. **Low – `StudioWorkspace.tsx` ~L738–751, `samePropsByTable`.**
   - `for (const key in table)` iterates a table that tsc forces to be complete, so no prop can be skipped.
   - The `-?` mapped type does not catch a wrong comparator for a key. For example, `Object.is` on an array prop would compile but never match.
   - Fix (optional): none. The `overviewClips` and `activeCandidateTrackIds` keys are correctly set to content comparators, and GH2 covers the case.

3. **Low – `ArrangementGroupHeader.tsx` L58, TODO comment.**
   - The `TODO(PERF-11c)` line fits the rule that allows TODO comments.
   - It leaves the leaf un-memoised on purpose, because `PARENT_NAMES` in `fader-pointer-preview.test.tsx` depends on its runtime name. The wrapper is the memo boundary.
   - Fix: none. Remove the TODO once PARENT_NAMES stops depending on the runtime name.

4. **Info – event ordering and stale closures.**
   - The nine actions now come through a single memoised `actions` object instead of the live context. Its deps are the same stable callbacks that `StudioWorkspace` already reads from `useArrangement()`. It is rebuilt only if one of them changes identity.
   - The leaf still reads current state through `getArrangement()` and `isPointerGestureActive`, so fader gestures (begin, preview, commit, blur) are not tied to a stale snapshot.
   - GH4 and GH5 cover solo and mute clicks, and GH3 covers a nudge. I could not confirm real-pointer fader ordering without a browser. The doc says C checks Volume, rename and fold in a browser on both viewports.

5. **Info – accessibility, Tailwind, TS strict.** The header's markup, classes and aria are unchanged. `aria-pressed="mixed"` is exercised in GH4. The diff has no `any`, no suppression directives and no type assertions. The new `Pick` and `PropEquality` types are typed strictly.

6. **Info – `ArrangementContext.tsx` ~L4553–4584.** `useArrangementPlaybackStoreContext(hookName)` fixes the wrong hook name in the error message, with tests L8c and L8d. It does not change behaviour.

7. **Info – implementation doc.** `docs/implementation/2026/quarter-IV/238-perf-group-header-leaf.md` is present and follows the required structure.

## Architecture note

- **Signal (new state/ownership change):** `StudioWorkspace.tsx` ~L3140–3175 now also derives group solo state and owns the `groupHeaderActions` object. `StudioWorkspace` is already the owner of every `useArrangement()` read, so this adds one more derived-state block there (signal 4).
  - **Keep, because:**
    - The derived state is cohesive with the existing `trackGroupOverviews` and `trackGroupActiveCandidates` memos.
    - The public hook shape, gesture lifecycle and audio timing are unchanged.
    - The leaf now reads no context.
- **Proposal for the planner (not a finding for this round):** PERF-11c-ii and PERF-11c-iii will add similar blocks to `StudioWorkspace`. When 11c-iii lands, consider one bounded task that moves the group-row derivations (overviews, candidates, solo states, header actions) into a single `useTrackGroupHeaderProps(...)` hook next to `lib/arrangement/groups`.
  - Acceptance criteria: GH1–GH5 and the `fader-pointer-preview` `PARENT_NAMES` rows stay green, and `useArrangement()` keeps its shape.
  - This is a proposal only, and I did not check the module as a whole.

Score: 9/10