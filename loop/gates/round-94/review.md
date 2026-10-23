COMMIT: OK. Nothing blocks the commit. The change is small and correct, it touches no auth, purchase or download code, C passed it, and verify passed (139 files, 2196 tests).

Both bugs are fixed only in unit tests. `/studio-lab` always passes one fixed demo collection and the purchased route isn't mounted yet, so no browser can produce an empty collection or a collection swap. C's result says the same. Both checks need a browser re-run once the purchased route is mounted (SRW-21).

## Code Review: ArrangementContext.tsx load effect + collection.ts copy (round 94)

### Critical Issues
- none

### Suggestions (most important first)
1. **A new collection object always resets the status and reloads every source** (`app/contexts/ArrangementContext.tsx:3000-3007`, deps at `:3051`). The reload already happened before this round. What's new is the visible part: the effect now writes `copy.loading` over whatever status the user was reading, such as an export result. The 082 doc expects that a token refresh may create a new collection object during SRW-21. If so, every refresh would flash "იტვირთება…" and re-decode all stems.
   - **Fix (SRW-21 scope, not this round):** keep the collection object stable across token refreshes. For example, memoize it by `productId` and have `loadSource` read the current token through a ref or getter. Add a test like LS6 for the purchased adapter.
2. **Switching to an empty collection leaves the old collection's data in memory** (`:3003-3006`). `buffersRef`, `sourcePeaks` and `sourceStates` keep entries from the previous collection. Old entries could stay stuck on `loading` if the swap happens mid-load. The same happens on any swap and it predates this round, so this is not a regression; the empty case just makes it easier to hit.
   - **Fix (later Low):** clear these per-collection maps in the effect cleanup, or at the start of the effect. LS4 already deliberately avoids asserting `loading`, so it would survive that change.
3. **Unused controller in the empty branch** (`:3005`). It returns `() => controller.abort()` for a controller nothing listens to. It's harmless, but `return;` or `return undefined;` would be clearer. If the uniform cleanup is intentional, leave it.
4. **Two stale doc lines.**
   - `docs/implementation/2026/quarter-IV/082-…md:4` still says "C-ის შემოწმებას ელოდება" although C has passed.
   - `docs/technical/arrangement-workspace.md:44` says "დაიხურება C-ის შემოწმების შემდეგ".
   - **Fix:** update both in the next round, the same way 081 was updated in this one.
5. **Type-assertion rule** (`collection-load-status.test.tsx:428`). `['resolve','reject'] as const` is a const assertion. It isn't the unsafe kind of cast, but CLAUDE.md says "no type assertions" with no exception. Only change it if you read that rule strictly; a typed tuple `const outcomes: readonly ['resolve','reject'] = [...]` avoids it.

**What tests can't show (checked by reading the code):**
- **First paint and SSR:** unchanged. On mount, `setStatus(copy.loading)` writes the same value that `useState` started with (`:533`), so React skips the extra render.
- **Event order:** `lastNonRefusalStatusRef` updates in a layout effect on `status` (`:535-539`). If a gesture refusal is showing during a swap, it is overwritten by loading and the ref then holds loading, which is correct.
- **Leaks:** no new listeners or timers. The abort cleanup is unchanged, and the stale-result guards in `then` and `catch` are still there.
- **Accessibility:** the status element is unchanged and only its text changes.
- **Tailwind and TS strict:** no styling or new types touched, apart from one new required field `empty`. The only implementations of that interface are the two copy objects in `collection.ts`, and both have it.
- **Security:** `collection.ts` only changed copy strings. PM1 drives the purchased adapter through a mocked `fetchAudio` in the test only.

### Good Practices Found
- One `copy` object per effect run is shared by the empty branch, the loading branch and `settle`. This removes the duplicate lookup and cannot mix demo and purchased text.
- The rejected alternative (a separate effect keyed on `origin`) is documented with the right reason: it would miss swaps to a new object with the same origin, which LS3b covers.
- Swap tests use deferred loaders, the fail-before list is honest, and mutation proofs a–f are recorded.
- The empty text is deliberately not the ready text, because "pick a line and add a sound" would be false for an empty library.

### Architecture note
- Signal 4 (status/lifecycle state added to an existing owner) at `ArrangementContext.tsx:3000-3051`. **Keep:** the collection status and the source loading share one lifecycle, the effect's abort. Splitting them would bring back the ordering problem between two effects described in the 082 doc. Cost is low.
- **Proposal for the planner (not current-round work):** before SRW-21, one small task to make the purchased collection object stable across token refreshes and to clear per-collection buffers, peaks and states on swap. Acceptance:
  - an LS6-style test for the purchased adapter (a token refresh does not reload anything and does not overwrite the status);
  - an empty-swap test showing no old entries in `sourceStates`;
  - the existing LS1–LS7 and PM1 tests stay green.

### Alternative Approach
- **Current:** the load effect sets the status itself (empty or loading, then ready or failed(n)), keyed on the collection object.
- **Alternative:** compute the status from `sourceStates` plus the last user message.
- **Verdict:** keep the current approach. Computing it would change the meaning of `status`, which the public `useArrangement()` hook exposes, and it would interfere with the gesture-refusal restore at `:1472`. The current fix is the smallest correct change.

### Score: 8.5/10