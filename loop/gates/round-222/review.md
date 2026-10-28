COMMIT: OK

## Code Review: `app/components/studio/ExportDialog.tsx` (+ test ES1–ES7, doc 174)

The diff is small and correct. It uses React's documented pattern of storing the previous key in state and updating it during render. It touches nothing in auth, purchase or download code: `handleExport`, `handleAbletonExport`, the Blob and anchor download path, the JSX and the classes are byte-identical to HEAD.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low, render cost, `ExportDialog.tsx:32`.** `createStemIdSetKey(state.stems)` runs on every render. `StudioContext.tsx:1665` includes `state.currentTime` in the context value, so the dialog re-renders on every playback tick, even when closed. The added work is about 10 ids, one sort and one `JSON.stringify` per tick, which is negligible. It is not worth a `useMemo`, because `state.stems` gets a new identity on every mute, solo or volume change anyway. The real cost is that the whole closed dialog re-renders on every tick, and that predates this diff. Fix, if wanted later: subscribe the dialog to a narrower context slice. That is out of scope here.
2. **Low, edge case, `ExportDialog.tsx:22` vs `:53` and `:280`.** The key removes duplicate ids, but `toggleAll` and the button label compare `selectedStems.size` with `state.stems.length`. If ids were ever duplicated, the label would get stuck on "Select All". This predates the diff and is unreachable in practice (`StudioContext.tsx:336` builds stems once per product). Fix: compare against the number of unique ids, but only if duplicate ids ever become possible.
3. **Low, behaviour that tests can't fully pin, `ExportDialog.tsx:37-40`.** The render-phase update is idempotent, so the StrictMode double render is safe, and React throws away the stale render before commit, so contract rule 5 holds in a real browser. If the id set changes while an Ableton export is running, the selection silently resets, but `stemsForExport` has already been captured, so the output is correct. Doc 174 states plainly that the tests don't cover rule 5, which is right. No fix needed.
4. **Low, a11y, existing, `ExportDialog.tsx:182, 208, 229, 232`.** These are the 10 existing Biome a11y warnings:
   - `<label>` elements without controls.
   - The normalize switch at `:232` has no `role="switch"`, `aria-checked` or name.
   - The tab buttons at `:151` and `:162` have no `role="tab"` or `aria-selected`.
   - `alert()` at `:84` and `:114` is used for errors.

   The diff changes none of these, and doc 174 records them as out of scope. Fix: a separate a11y round.
5. **Nit, `legacy-export-dialog-stems.test.tsx`.** It lives in `app/lib/__tests__/` although it tests a component. This follows the existing precedent (`store-focus-ring.test.ts`), so it's acceptable. The test quality is good: it queries by role and name, `vi.hoisted` keeps the mock typed without assertions, and the never-resolving `exportAudio` keeps jsdom away from `URL.createObjectURL`.

### Good Practices Found
- The trigger is the id set, unique, sorted and JSON-quoted. Array identity would not work, because `StudioContext` rebuilds `stems` with the same ids on mute, solo, volume and trim (`:382, :899, :965, :1055`). ES3 and ES4 guard this.
- The `useState` initializer is now lazy (`:35`).
- There are no new effects, timers, listeners or refs, so nothing can leak.
- TS strict is respected: no `any`, no assertions, `ReadonlyArray` in the helper signature, semicolons present. Tailwind and design tokens are untouched.
- The red-proof is real: it was run against the HEAD copy and two named mutants. Verify passed with 203 files and 2958 tests.
- Doc 174 is complete: the alternatives, the side effect of rule 4 (deleting a stem resets all toggles) and the Ableton comparison are stated honestly without claiming a source for the default.

### Architecture note
- none. The diff adds one piece of derived state to the same selection lifecycle. It adds no new owner, coupling or lifecycle. For the planner's backlog only (a proposal, not a finding): the dialog re-renders on every playback tick because the `StudioContext` value includes `currentTime` (`StudioContext.tsx:1665`). This belongs to the export-pipeline frontend-architect checkpoint already listed in doc 174's TODO.

### Alternative Approach
- **Current:** a render-phase reset whenever the id-set key changes. There is no extra commit and the user's toggles survive same-id rebuilds and reopening the dialog.
- **Alternative A:** `key={stemIdSetKey}` on `<ExportDialog>` in the route. This is the most idiomatic option, but `studio.$productId.tsx` is protected. It would also remount the Modal and lose the tab, format and quality choices.
- **Alternative B:** store only the user's deselections (`excludedIds`) and derive the selection as `stems − excluded`. This needs no sync step. The catch is that new stems would be auto-included while old exclusions survive a product change, which conflicts with contract rule 1 (any change to the id set means "all current stems selected").
- **Verdict:** keep the current approach. It meets the contract without touching the protected route and is cheaper than B in both behaviour and risk.

### Score: 9/10