COMMIT: OK

The diff is correct and small. It changes the Shift-click anchor in `FileList.tsx` from a row index to the file's path. Before each range select it looks up where that path sits in the current list. The verify log is green: Biome clean, 198 + 93 tests passing.

**Evidence checked**
- **Same list on both sides:** the click handler uses the rendered list (`useFilteredFiles` → `getSortedFiles`). `selectRange` in `file-store.ts:74-86` re-derives the list with the same `getSortedFiles(state)`. Store updates are synchronous, so at click time both see the same order and the two indices agree.
- **Rescans:** every place that calls `setFiles` (`App.tsx:47/58`, `FolderBrowser.tsx:102/129/138`) also calls `clearSelection`. That empties the selection, and the new effect then sets the anchor back to `null`. The old path also no longer exists in a new folder, so `findIndex` returns -1 and the click selects only that row.
- **Event order:** the click handler sets the anchor before the selection flips from empty to non-empty. The effect only clears the anchor when the selection is empty, so it can't wipe an anchor that was just set.
- **Performance:** there's one O(n) `findIndex` per Shift-click. `FileRow` isn't memoized, so passing `visibleFiles` adds no re-renders. `FileList` now subscribes to one boolean instead of `searchQuery`, `sortField` and `sortDirection`, so it renders slightly less often.
- **Conventions:** no comments, semicolons present, no `any`. The new behaviour comes with tests (z2/z3/z4/z11 cover the bug, z1/z6/z7/z9/z10 pin existing behaviour), as the bug-fix rule requires.
- **Security:** this is renderer-only. No IPC, file-system or secrets code is touched.

**Findings**
- **Critical / High:** none.
- **Medium:** none.
- **Low**
  1. `FileList.tsx:63-70`: a Shift-click moves the anchor to the clicked row. In Windows Explorer the anchor stays put, so a second Shift-click re-extends from the original row. The old code behaved the same way, so this isn't a regression. If Explorer behaviour is wanted, only set `anchorPathRef.current` when no range was selected, and add a test for Shift-click followed by another Shift-click.
  2. `FileList.tsx:66` + `:112-114`: if Ctrl-click unselects the last selected row, the effect clears the anchor, so a later Shift-click selects just one row. Explorer would keep that row as the anchor. It's a minor UX difference; it's acceptable but should be listed under D-31 in `docs/`.
  3. `FileList.tsx:64` + `file-store.ts:74`: passing indices still depends on the component and the store sorting the list identically. It's correct today, but it's an implicit contract (see note below).
  4. The rows are clickable `div`s with no keyboard or ARIA selection support. This predates the diff and isn't introduced by it.

**Architecture note (proposal only)**
Change the store action to `selectRange(anchorPath, targetPath)`. It would find both indices inside `getSortedFiles(state)` and drop the range if the anchor isn't visible. The anchor itself could live in the store as `selectionAnchorPath`, set by `setSelectedPaths` and `toggleSelection` and cleared by `clearSelection` and `setFiles`. That removes the index contract between component and store and the `hasSelection` effect, and makes the anchor logic testable in the store without rendering.