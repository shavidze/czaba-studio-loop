COMMIT: OK

## Code Review: round 289 (`ArrangementLibrary.tsx`, `studio-lab-demo.ts` + tests/doc)

This review covers the diff only. I didn't check the whole module. C round 289 passed and `verify.log` is green.

**Not touched:** auth, purchase and download code. `collection.ts`, which builds purchased sources, has no changes. The only effect on purchased libraries is visual: the product line under each card is gone.

**No new listeners, timers or effects.** The only additions are `useId` and one `useMemo`.

**No selectors depend on the old markup.** No e2e or non-test `app/` code uses `arrangement-library-list` or assumes options are direct children of the listbox. No e2e or app code still uses the removed `arrangement-library-option-context`, and no e2e test uses the Georgian demo titles.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Medium · accessibility.** `ArrangementLibrary.tsx:671-676`: the heading `div` is plain text inside `listbox > group`. In a real browser, VoiceOver and NVDA can read it as a stray item and then read it again as the group name. Unit tests can't catch this.
   - **Fix:** add `aria-hidden="true"` to the heading div. `aria-labelledby` still works with hidden elements, and LG2 still passes.
2. **Medium · UX and doc accuracy.** The collection line was removed from each card, and headings only appear when there are 2 or more collection runs. So the card shows only "Bass" or "Drums" with no collection in two cases:
   - in the All view, when a search narrows the list to one collection (e.g. "bass"; LG4 locks this in on purpose);
   - in every purchased library, since it has a single collection.
   
   In both cases the collection appears only in the hover `title`. Screen readers still get it as the accessible description; sighted users only see it on hover.
   - Doc 216 line 17 says the collection "always shows", which is false for these cases.
   - **Fix:** correct the doc's wording now. Whether to show one heading when a search narrows to a single collection is a product question for the planner.
3. **Low · group keys.** `ArrangementLibrary.tsx:662,666`: group keys are based on `runIndex`. If the results change while an option has focus and that option lands in a different group, it remounts and focus falls to `body`. This is rare.
   - **Fix:** use `key={results[run.start].id}`.
4. **Low · new lint suppression.** `ArrangementLibrary.tsx:664` adds a `biome-ignore`. The reason given holds and matches the existing `role="separator"` case, but it is still a new suppression directive.
5. **Low · polish.** Moving with ArrowUp to the first option of a group scrolls the option into view, but its heading can stay above the visible area. The doc already rejected sticky headings, so this is known; no fix this round.
6. **Info.** `library.test.ts:17-31` still has Georgian fixtures. The doc already lists this under TODO.

### Good Practices Found
- The runs are contiguous, so the DOM order always matches the `resultIds` keyboard order. LG7 (labels A, B, A) and mutant M3 protect this.
- `isFocusTarget` uses the global index (`run.start + offset`), so exactly one option has `tabIndex=0`.
- `memo` on the option still works: the handlers are stable and the runs are memoized on `results`.
- The tokens are correct (`text-muted`, spacing utilities) and there is no custom CSS.
- TypeScript is strict: no `any` and no type assertions.
- DL-EN pins all 9 titles exactly and checks that no Georgian code points remain.
- `DEMO_REMAINING_GEORGIAN_LINES` is now `[]`, so the exception list is closed.

### Architecture note
- **Signal 1 (mixed responsibilities):** `ArrangementLibrary.tsx:198-209`. The component already owns the tree, search, the resize gesture, roving focus and preview. The run computation is a pure function of `results`.
- **Decision for this round: keep it.** It has one lifecycle and adds no prop plumbing.
- **Proposal for the planner:** move it to `lib/arrangement/library.ts` as `groupLibraryResults(results)`, next to `filterLibrarySources`, with a unit test for the A, B, A case. LG7 stays as the DOM-level check. Cost and risk are both low.

### Alternative Approach
This isn't critical logic (it's not auth, checkout or the audio pipeline), so one line is enough. Doc 216 already compares the four alternatives that were rejected. Using contiguous runs instead of grouping by first appearance is correct because keyboard order and DOM order stay the same.

### Score: 8.5/10