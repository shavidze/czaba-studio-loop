COMMIT: OK — no blocking findings. The four candidate paths match `paths.txt`. Verify passed: 214/214 test files, `tsc` clean, build OK, and lint had only old warnings in files this change doesn't touch. No auth, purchase or download code is touched.

## Code Review: ArrangementGroupHeader.tsx, StudioWorkspace.tsx, track-group-collapse-ui.test.tsx, 190-group-undo-focus.md

### Critical Issues
- None.

### Suggestions (ranked)
1. **The "previous row" fallback has no test.** `StudioWorkspace.tsx:363` builds `order.slice(0, index).reverse()` (the rows before the removed one), but no test reaches that branch. The doc says why: a history step on a group always has a next row. The rescue, though, runs on every group-row unmount, not just history steps. **Fix:** add one small test where the removed group is the last row and has no rendered successor. Or narrow the rule to "next row only" and say so in D-29z415.
2. **The doc undersells how safe the event ordering is.** Doc 190 (the "გარემოს ფაქტები" section) calls "ref detach before node removal in Chromium" an inference. It isn't tied to the browser: React-DOM 18 detaches the host ref before `removeChild` on every deletion. So `detached.contains(document.activeElement)` at `ArrangementGroupHeader.tsx:110` sees the element that still has focus in any browser, including Firefox, which doesn't fire blur when a focused element is removed. **Fix:** state it as a React-DOM commit-order guarantee rather than an inference.
3. **Effect order carries the precedence, and only one test guards it.** Three layout effects with no dependency array run in declaration order:
   - the detach rescue (`:929`)
   - `pendingRowFocusRef` (`:942`)
   - the library-rail rescue (`:962`)

   The rescue yields to `pendingRowFocusRef` only because it is declared first and checks the ref (`:934`). Moving the block would silently break GF7's Ctrl+Shift+G case. GF7 and the MU-PRECEDENCE-INVERTED mutant cover it today. **Fix:** nothing needed now (see Architecture note). Just don't reorder these blocks without re-running GF7.
4. **`preventScroll: true` at `:76`.** The successor sits where the removed row was, so it stays in view in practice. If the rescue is later reused for other removals, consider `scrollIntoView({ block: 'nearest' })` after focusing so keyboard focus never lands off-screen.
5. **Known, unchanged behaviour (C-VOLUME-REMOVAL-247).** When the focused group fader is removed, Chromium fires blur and `blurGroupVolume` runs for a group that no longer exists. Nothing new is introduced here, and the doc's TODO tracks it.

### Real-browser ordering, leaks, regressions (what tests can't catch)
- **Ordering:** React clears the ref, then removes the node, then runs the parent's layout effects in the same commit. So the record and the focus move happen in one synchronous commit, with no paint showing focus on BODY.
- **No spurious detaches:** the ref callback is memoised on `[group.id, onFocusedRowDetach]`. The key is `` `group:${row.id}` `` (`:2885`), so `group.id` is fixed for each instance. `recordFocusedRowDetach` has `[]` deps. So `null` only arrives on real unmount. React 18 does not double-call refs in StrictMode.
- **Collapse path doesn't interact:** `setTrackGroupsCollapsed` blurs hidden focus before the state change (`:1108–1113`). It finds the row with `closest('[data-track-id], [data-group-id]')` (`:400`), which covers fold, mute, solo and volume. So by detach time focus is on BODY, nothing is recorded, and the UC4 F3 / UM9 behaviour stays the same.
- **Other unmount cases:** a full StudioWorkspace unmount records a value that no effect ever reads, which is harmless. If a row id is still in `trackRowsRef`, the rescue returns early.
- **Leaks:** no listeners, timers or subscriptions were added. The refs are cleared on every read.
- **Render cost:** two no-deps layout effects per commit, each O(1) unless a detach was recorded. `order.map` runs only on a focused detach. No new state, so no extra renders.

### Accessibility, Tailwind, TS strict
- Focus goes to a real name button, never BODY, and the browser probe confirmed `:focus-visible` and the brass outline. The status text is unchanged, so screen-reader announcements are unchanged.
- No new classes or colours.
- No `any`, assertions or suppression directives. The types are `readonly`, the prop is required and typecheck passes. Semicolons are present.

### Good Practices Found
- The design tracks DOM ownership (the row root's ref) rather than `onBlur`. The doc correctly rejects blur because jsdom doesn't fire it on removal.
- The order comes from the last commit's full row list (`committedTrackRowsRef`), so hidden members of a folded group are included. GF4 and MU-VISIBLE-ORDER prove this.
- An explicit focus request wins, and focus that wasn't inside the removed row is never moved (GF6).
- The doc lists 9 mutation runs, each with its own red tests.

### Architecture note
- **Signal #4 (new lifecycle in an existing owner):** `StudioWorkspace.tsx:651–655, 929–960`. This is the third focus-rescue ref next to `pendingRowFocusRef` and `pendingLibraryRailFocusRef`, and their precedence lives only in declaration order.
- **Signal #2 (coupling):** the child-to-parent ref-callback prop at `ArrangementGroupHeader.tsx:102–115` → `StudioWorkspace.tsx:2901`.
- **Keep for now:** it is one lifecycle (commit-time focus), `StudioWorkspace` already owns the row-focus logic, and GF7 tests the precedence. Extracting now would split a single commit's ordering across modules for little gain. Cost if kept: low.
- **Proposal (for the planner, not this round):** the doc already names the right task, D-29z416 under ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS. A future `useRowFocusRescue` could own the pending and detached refs with precedence written in code rather than effect order. Acceptance: GF1–GF7, UC4 F3, UC9 and UM9 stay green, and the public `useArrangement()` shape doesn't change. No new task needed.

### Alternative Approach
- **Current:** the ref detach records whether focus was inside the row, and a layout effect then focuses the successor in the previous commit's order.
- **Alternative A:** before `undo()`/`redo()` in the key handler, check whether focus is in a group row that the target snapshot drops, and set `pendingRowFocusRef`. It's explicit, but every history entry point (toolbar, menu, future paths) has to repeat it.
- **Alternative B:** a `focusout` listener on the scroller with `relatedTarget === null && !target.isConnected`. It doesn't fire on removal in Firefox, so it would be wrong there.
- **Verdict:** keep the current approach. It covers every removal path and relies on React's guaranteed commit order rather than browser blur behaviour.

### Score: 9/10