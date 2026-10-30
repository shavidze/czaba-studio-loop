COMMIT: OK (no blocking findings in the round-270 diff, and the verify log is green.)

## Code Review: round 270 (GATE266-S1: the detail range readout and split strings)

**Pre-checks**
- **Verify log:** typecheck has no errors, 218 test files and 3238 tests pass, and the build passes. The lint warnings are all in files this diff doesn't touch.
- **Out-of-scope code:** none of the paths in `paths.txt` touch auth, purchase or download code.
- **Listeners and timers:** no new listeners, timers or effects.
- **Tailwind and TS:** no new classes or colors. No `any`, suppression comments or type assertions; the test narrows with `instanceof`. Every statement ends with a semicolon.
- **Real browser:** the From/To inputs (`ArrangementDetailPanel.tsx:960-988`) have no `min`/`max`. So a value outside the clip (0.5 or 12.5) won't put the input into `:invalid`, won't show Firefox's red ring, and the arrow keys step from the shown value. There's no `onBlur` commit on the range inputs, so clicking Set has no blur-then-click ordering race.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Editing one field of a selection that crosses the clip edge is refused** (`ArrangementDetailPanel.tsx:591-599`). Example: the selection is 0.5–4 on a clip that runs 2–10, and the user changes only To to 5. From still says 0.5, so `isDetailRangeInsideClip` returns false and the status says "must stay inside the clip…". The user never touched From. DR4 locks this in on purpose, and the old behaviour (silently cutting the selection to 2) was worse. Fix options:
   - (a) In this case, name the field that is out of bounds in the message.
   - (b) Track it in LATER-DETAIL-LANE-RANGE-EDIT.
   
   Not blocking.
2. **Pressing Enter twice with no change isn't announced the second time** (the `<output aria-live>` at `StudioWorkspace.tsx:3136-3139`, and the keep branch at `ArrangementDetailPanel.tsx:575-588`). The keep branch sets the same string that's already in the status. React skips the update, so the DOM doesn't change and the screen reader says nothing. DR1 only passes because it calls `setStatus('')` between the two presses. `clipGainUnchanged` already behaves this way, so this isn't new. Fix: re-trigger the announcement with a status nonce or `key`, as a separate task.
3. **Edited values on an all-tracks selection still drop `allTracks`** (`ArrangementDetailPanel.tsx:601`, `{ ...clamped, trackId }`). The keep branch now handles unchanged values correctly (DR3). But if the user edits a value inside the clip, the selection becomes single-track again. The implementation doc says this path is deliberately unchanged, and DR4 only covers a single-track selection. Worth a backlog row. Not this round.
4. **Two intended behaviour changes, noted so nobody reopens them:**
   - Typed text that hasn't been applied is now replaced when the selection changes from outside (the rewritten polish test: '3' becomes '1'). The old behaviour only kept the text by accident, because both values clamped to the same number. The new behaviour is correct: the fields follow the selection.
   - A drag past the clip edge now runs the layout effect (`:531-537`) on every step, just as a drag inside the clip already did. Two `setState` calls per step is an acceptable cost.
5. **Test smell:** in DP1 (`background-time-selection-ui.test.tsx:105-107`), the conditional click on the panel toggle hides whether the panel starts open. Assert that state explicitly instead.

### Good Practices Found
- The keep branch compares values after normalizing them with `rangeInputText(parseSecondsInput(...))`, so `0.500` equals `0.5` (DR6). It also leaves the range object untouched, and the tests check that with `toBe(before)`.
- The status names the track from `range.allTracks`, and `rangeOnClip` already guarantees that `laneName` is correct.
- The new split texts are now true for one cut edge, two cut edges and a whole clip. The string literals are pinned in the unit tests and in the real-workspace UI tests.
- The implementation doc is complete: the rejected alternative is stated (D-29z581), and the within-tolerance change from 1.995 is called out as intended.

### Architecture note
- **Signal 3 (the same region keeps changing at high cost):** `ArrangementDetailPanel.tsx:567-606`. `applyDetailRange` now has three branches (gesture blocked, keep, clamp and apply). Several rounds since 265 have changed this region, and every test needs the whole workspace mounted. The doc already lists RC-R266-PANEL-CLAMP-CONSUMER as a retro candidate.
  - **Keep:** the component stays responsible for `setStatus`/`setTimeRange`. Gesture handling, Undo and the shape of `useArrangement()` are not affected.
  - **Proposal for the planner (one bounded task):** add a pure `resolveDetailRangeApply({ startText, endText, range, clip, rangeOnClip })` that returns `{ kind: 'keep' | 'apply' | 'invalid', next? }`. Put it in `lib/arrangement/panels.ts` next to `clampDetailRangeToClip` and unit-test it with the DR1–DR6 cases. The component then just acts on the result.
  - **Cost:** low. **Risk:** low. This is a proposal only, not a finding for this round.

### Alternative Approach (critical logic: how Enter/Set applies the selection)
- **Current:** the fields show the selection's real start and end. Values that haven't changed (after normalizing) mean "keep the selection and announce it"; changed values go through the existing clamp to the clip.
- **Alternative:** remove the clamp so the panel can edit selections outside the clip, or disable the fields and show a reason when the selection crosses the clip edge (rejected as D-29z581).
- **Verdict:** keep the current approach. It fixes the silent shortening and the lost all-tracks state without adding a new feature. It also avoids a disabled control under focus. Removing the clamp is a product decision (LATER-DETAIL-LANE-RANGE-EDIT).

### Score: 8.5/10