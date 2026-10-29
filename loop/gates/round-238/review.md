COMMIT: OK. Nothing blocks the commit. I found one low a11y regression that the tests can't catch, plus a few small consistency items. The diff doesn't touch auth, purchase or download code.

## Code Review: SABA-B-11a FIX-2/FIX-3 (round 238): `ArrangementContext.tsx`, `StudioWorkspace.tsx`, `collection.ts`, `tempo-seed.ts`, tests, docs 182/183/185

### Critical Issues
- None.

### Suggestions (ranked)

1. **Low–Medium, a11y: the "Loading…" message is no longer announced at mount** (`ArrangementContext.tsx:3675`)
   - Before, `setStatus(copy.loading)` sent a plain string. The reducer always advances `sequence` for a string when no gesture is active (`status-announcement.ts:17-21`). That changed the `<span key={statusSequence}>` key inside `<output aria-live="polite">` (`StudioWorkspace.tsx:2740-2745`), so a screen reader announced "Loading the demo collection…".
   - Now the call passes a function, and the reducer returns `previous` when the text hasn't changed (`status-announcement.ts:24-26`). At mount the text equals the initial value set in `ArrangementContext.tsx:654`, so `sequence` stays at 0, the span keeps its key, and the loading text isn't re-announced.
   - It only affects mount when no seed exists. The ready/failed message is still announced, and a mount seed still advances `sequence`.
   - jsdom tests can't see this, and C's browser check looked at the visible text, not screen-reader output.
   - Fix: decide whether the mount loading announcement is wanted. If yes, add a provider-internal reducer action that always advances `sequence` (for example `{ update, announce: true }`), and keep the public `setStatus` type as it is. Sending the string from the effect won't work: it would wipe out a seed the child effect has already queued. If no, write in doc 185 that the change is accepted.

2. **Low: the code contradicts doc 185 on load failures** (`collection.ts:58-61`)
   - If the status starts with the loading text and `failed > 0`, the result is `${failed(n)} ${rest}`, which keeps the seed text after the failure message. CR2 tests exactly this.
   - Doc 185 says failed(n) always replaces the status, because the appended version wraps to two lines (32 px) at 1280×720.
   - It's only reachable with a mount seed plus a load failure. `/studio-lab` starts empty, so it can't happen there today.
   - Fix: either return the bare `settled` in that branch when `failed > 0` and update CR2, or say in doc 185 that the appended version is accepted for this one case.

3. **Low, a11y: the seed is announced twice** (`ArrangementContext.tsx:3694`)
   - When ready replaces the loading prefix, `sequence` advances and the whole line ("ready + seed + Snap on") is announced again, so the seed text is read a second time.
   - This is still better than HEAD, where the seed was dropped entirely. Note it as accepted.

4. **Nit: redundant dependency** (`StudioWorkspace.tsx:1459`)
   - `collectionHasTempoSource` is computed from `collection.sources`, which is already in the deps, so listing it adds nothing.
   - It's harmless and Biome's exhaustive-deps rule requires it. Leave it.

5. **Note: the "last non-refusal status" ref now has two writers** (`ArrangementContext.tsx:3689`)
   - `lastNonRefusalStatusRef` is written by the layout effect at line 659 and now also inside `settle`. This isn't a bug:
     - the transform maps a non-refusal status to a non-refusal status;
     - aborted loads return before reaching `settle`;
     - the write happens in the callback, not the reducer updater, so StrictMode is safe;
     - the layout effect overwrites it on the next status commit that isn't a refusal.
   - It's worth a one-line comment only if a third writer ever shows up.

**Checked with no findings:**
- No new listeners, timers or `AbortController`s.
- Render cost is down: the seed search now returns early for collections with no BPM source (TQ1/TQ2).
- No styling changes, so Tailwind/tokens are not affected.
- TS strict: no `any`, no assertions, semicolons present.
- `setStatus` now accepts a wider type, so every existing string caller still compiles. `useArrangement()` keeps the same shape; only the parameter type of `setStatus` is wider.
- Event ordering: the child seed effect runs before the provider's load effect at mount. Both updates now go through the reducer as functions, so the mount seed survives. In StrictMode the second effect run is a no-op because `tempoSeedOpenRef` is already closed.
- Verify passed: 212 test files, 3,044 tests, plus the build.

**Auth / purchase / download:** none touched. `collection.ts` contains `createPurchasedWorkspaceCollection`, but the diff only adds two pure string functions above `workspaceCollectionCopy`. The purchased-stem fetch path, `studio.$productId.tsx` and token code are unchanged.

### Good Practices Found
- The status rules are pure functions (`loadingCollectionStatus`, `settledCollectionStatus`, `gestureRefusalPrefix`, `statusAfterGestureRelease`), each with direct unit tests (CR1–CR4).
- The UI tests TU12–TU14 check the announcement `sequence` exactly (+0 or +1), not just the text.
- Mutation testing (MU-RF, MU-L1-REL, MU-L1-EFF) shows the new branches are each caught by a test.
- Doc 185 records the known unfixed edge cases honestly: the stale prefix for the same origin, and a repeated refusal on top of a seed.
- The fix moved the ref recompute into `settle` instead of the reducer updater, which keeps it StrictMode-safe.

### Architecture note
- Signal 3 (one region changed repeatedly at high cost), with some of signal 2 (coupling):
  - The status line is now built by string-prefix matching split across three owners:
    - `collection.ts:43-63`: the loading/settled rules;
    - `ArrangementContext.tsx:205-221` plus the ref writes at 659 and 3689: refusal handling and restoring the previous status;
    - `StudioWorkspace.tsx:1456`: appending the seed.
  - Rounds 234 to 238 each added another prefix rule to this same line. Each one needed a deferred-collection fixture and a mutant run.
- **Keep for now.** Gesture lifecycle and announcement `sequence` are covered by TU9–TU15 and LS1–LS7, and the rules are small. Extracting now would put gesture timing at risk with no change users can see.
- **Proposal for the planner** (not approved scope): a structured status model in `status-announcement.ts`.
  - The line becomes separate parts: collection base, last action, seed tail and a refusal overlay, joined only when rendered. The three prefix rules become operations on those parts. It could also carry an explicit `announce` flag, which fixes Suggestion 1.
  - Acceptance: TU9–TU15, LS1–LS7 and CR1–CR4 pass unchanged; `useArrangement()` keeps its shape; `sequence` advances exactly as today.
  - Cost: medium.

### Alternative Approach
- **Current:** string-prefix rules (`loading → settled`, `refusal → last non-refusal`) applied through functional `setStatus`, plus a ref recompute in `settle`.
- **Alternative:** the structured status model described in the Architecture note. Overlap between parts is handled by the type, not by `startsWith`.
- **Verdict:** keep the current approach for this round. It's small and well tested, and the known edge cases are documented and can't be reached in `/studio-lab`. The structured model is a separate task for the planner to scope, not a fix for this commit.

### Score: 8/10