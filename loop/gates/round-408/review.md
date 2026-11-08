COMMIT: OK

The change only moves 23 lane callbacks into the stable actions context. I read the diff and spot-checked the callback definitions in `ArrangementContext.tsx`. I did not re-run the tests; I relied on C's PASS and `verify.log`.

## Findings (no blockers)

1. **Low – `app/lib/arrangement/__tests__/actions-context.test.tsx:106-115` (`ACTIONS_PICK`, `declaredActionKeys`).** AC7 now reads the context source with a regex.
   - The `[^>]*` part would break if a Pick key ever contained `>`. Today that can't happen.
   - The key regex `[A-Za-z]+` would silently skip a key with a digit or underscore. Failure mode: the test goes red on the count mismatch, not green, so this is safe.
   - The doc already lists this as TL-R408-SK-L1, deferred.
   - Fix, when convenient: widen it to `\w+`.

2. **Low – `actions-context.test.tsx:389` (AC8).** `music()?.pan ?? 0` hides a missing track. Fix: assert `music()` is defined first. This is the doc's TL-R408-SK-L2.

3. **Info – `ArrangementContext.tsx:2253` (`getLibraryDragSource`).** It depends on `collection.sources`, so the actions identity changes when the `collection` prop changes. `addSourceToActiveTrack` already behaved this way, so it is not a regression. AC8 doesn't cover a `collection` change, which is acceptable.

4. **Info – `ArrangementLane.tsx:217`.** The lane still subscribes to the value context, so its render count is unchanged. The doc says so explicitly, and the saving comes in e-ii. This commit is plumbing only.

## What I checked
- **Event ordering and handlers.** The JSX is untouched. Only the source of the callbacks changed, and each is the same `useCallback` reference as before. `dropLibrarySource`, `importVideoFiles`, `setClipLaneDrag` and `getSelectedClipIds` go through refs and stores, not through `arrangement` state. The `useCallback` dependency arrays I read contain no `arrangement` or `history`.
- **Listener and timer leaks.** None added. The `livePosition` to `getLivePosition` rename is complete: the grep shows no stale references. The `tick` and `stopPlayback` dependency arrays were updated consistently.
- **Pick, memo object and deps.** The three lists contain the same 23 new keys, and `livePosition` was removed from the deps.
- **TypeScript strict.** No `any`, no `@ts-ignore`, no type assertions.
- **Tailwind, tokens and accessibility.** No style or markup change.
- **Auth, purchase and download.** None touched. The four paths are the lane, the context, a test and a doc.
- **Implementation doc.** Present in the right quarter folder, Georgian, and has the required sections.

## Architecture note
- **Signal: `ArrangementContext.tsx:551-607` and `4640-4770`.** The Pick, the memo object and the deps array are three parallel 59-key lists, and each new key must be added to all three. This is signal 4 (growing state in one owner). The test now catches a missing or extra key in the actions object, but not a missing dependency.
- **Keep for now.** The provider's refs, audio timing and gesture lifecycle depend on it. The public shape of `useArrangement()` and `useArrangementActions()` is unchanged. Extracting now would put more risk on the Undo/Redo atomicity than it saves.
- **Proposal for the planner (a bounded task, after e-ii).** Derive the actions object and its deps from a single declaration. The doc's rejected const-tuple idea (TL-R403-SK-L1) needs `as const` or a helper, so the task should find a form that avoids type assertions. Acceptance criteria: AC7 and AC8 stay green, no identity change on commit, and the public hook shape is unchanged. This is a proposal, not an approved scope.

This reviews the diff only. I did not audit the whole module.