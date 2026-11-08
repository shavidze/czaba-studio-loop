COMMIT: OK

The diff adds a stable `ArrangementActionsContext`. The five action hooks now take the actions slice instead of the whole workspace. I found no blocking issues. The diff has no matches for auth, cart, checkout, download or `apiClient`, and no listeners, timers, `any` or suppression directives were added.

I did not run the browser or the tests, and I did not read the implementation doc. The memo-stability reading below comes from looking at the callbacks' declarations and dependency lists in `ArrangementContext.tsx`.

**Findings, ranked (all low, none blocking):**
1. `ArrangementContext.tsx:4618-4690`. The `actions` memo is only stable if all 34 callbacks are. I read these, and they are stable:
   - `getArrangement` has an empty dependency list.
   - `undo` and `redo` (3004, 3018) are the same kind of callback.
   - `selectSource` (2138) depends only on a stable setter.

   Two have real dependencies:
   - `addSourceToActiveTrack` (2208) depends on `collection.sources`.
   - `splitSelection` (2667) depends on stable store, ref and setter callbacks.

   The object therefore changes when the collection changes, which is rare and correct. AC1 and AC2 cover only 5 of the 34 callbacks, and they don't run a selection change, playback, a library preview or a master gain gesture.
   - **Fix:** add one test that runs those actions and asserts `currentActions(probe)` is still the same object. This can be done later.
2. `StudioWorkspace.tsx:1037-1042`, `ArrangementMarkerRow.tsx`. Every hook still destructures its fields into a memo, so each hook returns a fresh object whenever `actions` changes. The extra memo layer doesn't hurt, but it is now redundant.
   - **Fix:** a later cleanup could return `actions` directly, but only if a hook's Actions type exactly matches its field list. Not needed now.
3. `ArrangementLoopBrace.tsx:60`, `ArrangementMaster.tsx:158`, `ArrangementTransport.tsx:232` and `ArrangementLibrary.tsx:199`. The hook parameter is now the same type as the return type, so the hook doesn't change its input in any way. This is cosmetic and harmless.
4. `ArrangementLoopBrace.tsx:3` and `ArrangementMarkerRow.tsx:17`. `ArrangementContextValue` is still used in each file, so no unused imports. Biome and the verify run also passed.

**Behavior and regressions:**
- **Rendering:** the wrapper components still call `useArrangement()` for display data, so they re-render exactly as before. Gains only come where a view takes only the actions. `StudioWorkspace` still reads `useArrangement()`, so this round doesn't reduce its render cost.
- **Event ordering:** the callbacks are the same references as before, because AC2 asserts the actions hold the provider's own callbacks. Gesture claim, undo and redo gating, and audio timing therefore don't change.
- **Provider nesting:** the actions provider sits just outside `ArrangementContext`. Because the memo's dependencies are callbacks that don't depend on `arrangement`, an arrangement change doesn't invalidate it, and no ordering issue appeared.
- **Accessibility, Tailwind and TypeScript:** no markup or class changes. There are no type assertions in the code. The test's `if (null) throw` guards are fine.
- **Tests:** AC5 scans source files with a regex for transition APIs. It strips comments, but a string literal containing one of those names would produce a false positive. This is acceptable.

**Architecture note**
- Signal: `ArrangementContext.tsx:549-585` and `4618-4690` → keep. This is a change in ownership and coupling, because actions now live in their own context in the existing provider. The 34-name list appears three times (the `Pick` type, the object and the dependency array). Extracting it would risk the identity guarantees that AC2 pins, and the cost of keeping it is only boilerplate. Keeping the list also leaves `useArrangement()`'s public shape unchanged.
- Proposal for the planner, optional: once more consumers move onto `useArrangementActions`, a bounded task could derive the `Pick` keys from a single `const` tuple to remove the triple listing. The acceptance criteria would be that AC1 to AC3 stay green and the public hook shape is unchanged.
- This is a review of the diff only. It is not an audit of the whole module.

**Score: 8/10**