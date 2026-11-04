COMMIT: OK

## Code Review: ArrangementDetailPanel.tsx (+ drag-preview-render.test.tsx, doc 232)

I only read the diff and the surrounding code in `ArrangementDetailPanel.tsx` (lines 535–660). I did not run anything. I took the passing verify and the C round on trust.

### Critical Issues
- None. The commit has exactly three paths: the panel, a test file and a doc. It touches no auth, purchase, download, API client, Firebase or CSS code. `untracked.txt` is empty, so there are no hidden new files.

### Suggestions (ranked)
1. **Low – `ArrangementDetailPanel.tsx:568-573`.**
   - **Issue:** The `rangeTextSource` object is rebuilt on every render and passed to `useState(rangeTextSource)` and to the two lazy initialisers. Only the first value is used, and the cost is a few property reads. This is not a correctness issue.
   - **Fix:** None needed. If you want it cleaner later, move the seeding into one `useState` holding `{ startText, endText, synced }`. That is optional and would change a pattern that matches `syncedClipGainText` at lines 553-558, so I would keep it as is.
2. **Low – `ArrangementDetailPanel.tsx:577-584`.**
   - **Issue:** This is a render-phase `setState` guarded by `Object.is` on raw numbers, so it cannot loop, `NaN` included. It is the same pattern React documents and the file already uses. I checked the event-ordering cases the tests can't see.
     - After `applyDetailRange` (lines 650-653), `setTimeRange` changes the source. The sentinel then rewrites the texts to `rangeInputText(range)`, which is what the old layout effect did.
     - If `clip` becomes undefined, the texts are kept, as at HEAD.
     - There is no timer or listener, so nothing can leak.
   - **Fix:** None.
3. **Low – `drag-preview-render.test.tsx` DP42.**
   - **Issue:** It asserts the drag overwrites typed text in a focused input. That matches HEAD, but it is a questionable UX contract: if the user is typing while a drag runs, they lose their input. jsdom also can't confirm real-browser focus ordering, because the test notes that clip `pointerdown` blurs the input.
   - **Fix:** Add a manual or e2e check in a real browser later. This is not a blocker, because the behaviour is unchanged.
4. **Low – `docs/.../232-perf-drag-preview.md` line 1 of the "In Progress" header.**
   - **Issue:** The doc says "C verifies" and quotes sketch perf numbers ("რეალურ მნიშვნელობებს C ზომავს"). The numbers are B's sketch values, not C's measured values.
   - **Fix:** After the commit, update the doc with C's measured values from `c-round-333`. The doc also records `interact.harness.hook-live` at the budget edge (2 → 1, assert ≥ 1), which is SIG-R333-HOOK-LIVE-MARGIN.

### Good Practices Found
- The extra commit per pointermove is gone: the layout-effect copy became a sentinel computed during render. The seeded initial state avoids an extra mount pass.
- TS strict is respected: no `any`, no assertions, and the interface is named. Comparing with `Object.is` is correct for `NaN` and `-0`.
- `detailRangeTexts` returns `null` when `clipStart` or `clipDuration` is undefined, which matches the old early return.
- The behaviour pins DP35–DP37 and DP39–DP42 cover edge cases. Those are typed text surviving a commit that keeps start and duration, deselect and reselect, an invalid Enter, and Undo.
- The component has one fewer `useIsomorphicLayoutEffect`, so there is less lifecycle to manage. The wheel listener at lines 594-611 still has its cleanup.
- Accessibility, Tailwind and tokens are untouched.

### Architecture note
- signal: `ArrangementDetailPanel.tsx:565-584` and `553-558` → **keep**.
  - The sentinel pattern for derived editable text now appears twice in one component (clip gain and range). Both have one lifecycle and share the same props. Extracting a generic hook would add abstraction for two uses and risk the render-count invariants that DP33, DP34 and DP38 pin.
  - Cost of extracting: medium. Cost of keeping: low.
  - Proposal for the planner, only if a third call site appears: one bounded task to add a small `useSyncedText(source, derive)` helper local to the arrangement components. Acceptance would be unchanged render counts for DP33, DP34, DP38 and DP39, plus unchanged behaviour for DP35–DP37 and DP40–DP42.
- signal: the doc itself says DP33, DP34 and DP38 depend on how `selection.clip` reaches the panel, and that D-29z915 (the preview-readers module) must re-check them. I'm recording that dependency as coupling to keep an eye on, not as a finding.

This is a review of the diff only. I'm not claiming the whole module was audited.

### Alternative Approach
Not critical logic (no auth, checkout or audio pipeline). The one alternative was `useEffect`/`useLayoutEffect` copying, which was the old code. It costs an extra commit per pointermove. Keeping the render-phase sync is better.

### Score: 9/10