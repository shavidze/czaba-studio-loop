COMMIT: OK. Nothing in this diff blocks the commit.

## Code Review: ArrangementLibrary.tsx + library-group-heading-ui.test.tsx + strings.test.ts + docs 216/217

**What I checked:** the diff in `round-291/diff.patch`, the new doc 217, the edited code at `ArrangementLibrary.tsx:196-217` and `:668-694`, the test helpers, and `verify.log`. The log shows 225 files and 3369 tests passed, `# fail 0`, and agent references OK. This covers only the diff, not the whole module.

**Auth, purchase and download code:** not touched. All 5 paths are library rendering, tests or docs. The `SECURITY_AUDIT` checklist doesn't apply: no new input, no HTML injection, no tokens.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low: LG8 doesn't match how a real browser reaches this state.** `library-group-heading-ui.test.tsx:420-424`: the test focuses an option, then sets the search value with `fireEvent.change` while focus stays on the option. In a real browser, typing a search moves focus to the search box first, so this exact sequence can't happen from the keyboard. The key fix is still correct and protects a reachable case: results changing while an option has focus, for example when the purchased collection or `collection.sources` updates. The test name and doc 217 present it as a search scenario, though.
   **Fix (next round, optional):** add one LG8 case that rerenders with changed `collection.sources` while the option has focus. Or rename the test to say "results change" instead of implying a typed search.
2. **Low: after filtering, the focused option can keep focus but be skipped by Tab.** `ArrangementLibrary.tsx:451`: when `c-two` keeps focus and nothing is selected, `isFocusTarget` moves to the option at index 0 (`b-two`). The focused `c-two` then gets `tabIndex=-1`. Arrow keys still work from there, but Shift+Tab out and Tab back in lands on `b-two`. This existed before this round and the diff doesn't make it worse. Now that focus survives, though, users will actually hit it.
   **Fix (planner backlog, not this round):** let the option that currently has focus win `isFocusTarget` when it is still in `resultIds`.
3. **Info: the index-based `headingId` is fine.** `ArrangementLibrary.tsx:670`: the group's `id` and `aria-labelledby` change in the same commit, so the reference never breaks. Doc 217 §2 already explains this.

### Good Practices Found
- **The `aria-hidden="true"` heading still names its group (`:681`).** The accname spec still reads a hidden node when `aria-labelledby` points at it directly, so the group name stays and the repeated `text:` node disappears from the accessibility tree. LG9 checks both the name and the attribute. Classes and text are unchanged, so there is no visual change and no Tailwind or token issue.
- **The key `${label}#${occurrence}` can't collide (`:206-213`).** The occurrence suffix contains no `#`, so even labels that contain `#` produce unique keys. It is computed once per change to `results` inside `useMemo`, so render cost is O(n) with no new allocations per render.
- **No new state, effect, listener or timer, so nothing can leak.** Roving focus, `resultIds` and the flat branch are untouched.
- **The `it.each` LG8 covers both cases (a) and (b).** The doc reports that the M2 alternative (first-option-id key) fails the `b-two` case, so the test pins down the reason for this choice.
- TypeScript stays strict: no `any`, no type assertions, no `@ts-ignore`, semicolons present. The test's `if (!before) throw` narrows the type instead of using `!`.
- Doc 217 states the A,B,A limitation and the deferred grouped↔flat remount honestly. The doc 216 edit fixes the false "always visible" promise (S2).

### Architecture note
- None for this round. The diff adds no state or lifecycle, changes no ownership, and mixes no responsibilities.
- **Watch item (not a finding):** the run-grouping region at `ArrangementLibrary.tsx:198-217` / `:668-694` has changed in two consecutive rounds (289, 291). Both needed specific tests about focus and the accessibility tree, and the grouped↔flat remount is still deferred.
- **Proposal for the planner, only if a third round touches this region:** move the pure run computation (`results → {key,label,start,end}[]`) into a `lib/arrangement` helper with its own unit tests. Also render a single constant parent for both the grouped and flat branches, which would also fix B-R290-LIB-SHAPE-SWITCH-FOCUS. Cost: low. Things that must not change: roving focus, `resultIds` order, LG1–LG9.

### Alternative Approach
- **Current:** key = `label#occurrence`. It survives a whole earlier run disappearing and the run's own first option disappearing. It does not survive A,B,A label shapes.
- **Alternative:** a single non-grouped listbox, with `aria-describedby` on each option pointing to its collection heading. Grouping would then never remount anything, including the grouped↔flat switch.
- **Verdict:** keep the current approach. `role="group"` inside a listbox gives screen-reader users better navigation, and A,B,A doesn't occur in today's data. Revisit together with the deferred shape-switch item.

### Score: 9/10