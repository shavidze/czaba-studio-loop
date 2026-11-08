COMMIT: OK

I reviewed only the diff and read the surrounding source. I did not rerun the tests. The commit touches no auth, purchase, download, API or Firebase code. Its only production change is renaming one hook parameter.

## Code Review: round-405 (ArrangementLibrary.tsx, 5 test files, doc 258)

### Critical Issues
- None.

### Suggestions (ranked)
1. **`selection-wrappers-render.test.tsx` (diff ~L308-311)**: `expect(muted[0].id).not.toBe('g1')` can never fail, because group ids come from `crypto.randomUUID()`. The doc already records this as A-R405-REVIEW-GH5-G1-VACUOUS.
   - The assertion also does not prove that the collapsed first group is not the one that was muted.
   - Fix: delete the line, or assert the muted group's name is `Group 2`. Alternatively assert that its id differs from the collapsed group's id, read from `live(api).arrangement.groups[0]`.
   - Low priority, since `toEqual([muted[0].id])` still pins the render identity.
2. **`actions-context.test.tsx` AC7 (diff ~L129-135)**: the check that the actions object survives the initial load depends on two `await Promise.resolve()` flushes.
   - If a future loader adds another async hop, `sourceStates.song?.status` would still be `'loading'`. The test would then fail with a misleading message.
   - Fix: replace the manual flushes with `await waitFor(() => expect(...song?.status).toBe('ready'))`. The same file already uses `waitFor` for the preview.
3. **`actions-context.test.tsx` AC7, `ACTION_KEY_COUNT = 34`**: this is a hard-coded magic number. Adding a 35th action breaks the test, which is probably intended and matches the doc.
   - Fix: add a short comment, or derive the count from the `ArrangementActions` key list. It is acceptable as is.
4. **Event ordering and render cost**: no real-browser ordering risk or render-cost regression comes from this diff.
   - The rename is a local parameter. The only call sites are `ArrangementLibrary.tsx:235` and `StudioWorkspace.tsx:1039`, and both pass an object.
   - The `useMemo` dependencies are destructured from `actions`, so memo behaviour is unchanged.
   - The doc says the perf spec was not run because nothing in the runtime changed, which is consistent with the diff.
5. **Listener and timer leaks**: AC7 starts and stops a library preview, and toggles Play and Stop, inside `act`. The existing `afterEach`/`beforeEach` in the test file should clean up. I did not see the full file, so I cannot confirm the teardown.

### Good Practices Found
- The names asserted in the tests now match the components that actually render.
  - `'ArrangementMasterViewInner'` exists at `ArrangementMaster.tsx:206`. The old `'ArrangementMaster'` name was never mounted, so those assertions were vacuous.
  - FP0 guards against this class of mistake by requiring every `PARENT_NAMES` entry to render on mount.
  - `renderLog.counts.clear()` in the master-ui footer test stops a previous test's mount from satisfying the positive control.
- AC7 checks outcomes as well as identity: `gainDb`, `undoLabel`, `sourceStates` ready and `selectedSourceId`. A test that only checked identity could pass even if an action did nothing.
- The 14 mutants all went red, and the pristine runs before and after were clean.
- The doc is complete and honest about its limits, including the unresolved GH5 weakness and the wrapper deletion that is waiting on the owner.
- Tests are strictly typed: no `any`, no suppression directives, no type assertions. Narrowing in `groupIdOf` uses `in` checks and `typeof` guards.
- The tests use no hard-coded colours and no custom CSS.

### Architecture note
- signal: `app/contexts/ArrangementContext.tsx:4618` and `:4939` → **keep**. The commit does not touch this file; this is context from the surrounding code. The actions context was introduced in round 404 and this round only adds coverage for it. The 34 action names are spelled out in three places (the type at L549, the memo at L4618 and the AC7 count). That is a drift risk (TL-R403-SK-L1) and a repeated-change pattern.
  - Cost of keeping it: low. AC7 pins the count and the key identities, and it fails loudly if they diverge.
  - Proposal for the planner (a single bounded task, not for this round): derive the memo's dependency and key list from one const tuple of action names, so the type, the memo and the test share a single source. Acceptance criteria would be AC1, AC2 and AC7 unchanged and green, and `useArrangementActions()` keeping its public shape. This is only worth doing if a third round touches the list.
- The `ArrangementContext.tsx` file is large, but length alone is not a signal.

This was a review of the diff, not a full audit of the module.

### Alternative Approach
Not applicable. This is test coverage plus a parameter rename, with no critical logic change.

### Score: 9/10