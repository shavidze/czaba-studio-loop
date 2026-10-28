COMMIT: OK

The change is small and correct, and the tests cover it, including the async race with the old folder's list that unit tests on the store alone would miss. Nothing blocks the commit.

**What the diff does:** `setFiles` now drops any selected paths that are not in the new file list, keeping the remaining ones in their original order (`file-store.ts:55`, `:242-250`). If nothing is dropped, `selectedPaths` stays out of the update, so the array keeps its identity and `MetadataPanel` doesn't re-sync for nothing. The tests check this directly with `toBe` (x6).

**Findings**

- **critical / high:** none.
- **medium:** none.
- **low – the doc's file:line references will drift** (`docs/bugs/001-…md:14`). Paths like `FolderBrowser.tsx:103/108/161/166` and `App.tsx:48/61` are accurate today (I checked that `setFiles` is at `App.tsx:61` and `FolderBrowser.tsx:108/166`), but any later edit will make them stale. Fix: add the function names next to the line numbers (`handleOpenFolder`, `handleRescan`). The entry already does this for some of them.
- **low – quote style in the test** (`tests/renderer/components/selection-after-folder-switch.test.ts`). The test uses double quotes while `biome.json` sets `quoteStyle: single`. Biome only checks `src/**`, so lint passes. Fix: follow whatever quote style the other test files use; this isn't worth blocking on.
- **No regressions found in existing flows.**
  - Every `setFiles` caller now prunes the selection: `App.tsx:61/91` and `FolderBrowser.tsx:108/138/149/166`.
  - For the clear and error paths (`setFiles([])`), the selection was already cleared, or should be.
  - The search filter does not go through `setFiles`; it uses `getFilteredFiles`. So a search query does not wrongly prune the selection.
  - Shift-click with a missing anchor row falls back to `findIndex === -1`, which acts as a plain click. (x7) pins this.
  - Unsaved typing on a pruned row follows the existing discard-toast rule. (x5) pins this.
- **Performance:** O(n) using a Set, once per folder load. Negligible even with 1000+ files.
- **Security / IPC:** nothing touched.
- **Conventions:** no comments in the code, semicolons present, strict types (`Pick<…>` union, no `any`). The bug-fix rule is followed: failing-first tests plus a `docs/bugs` entry and the README counter update (20 entries, 11 fixed, 9 remaining).

The verify log shows the renderer tests (296/296), main tests (93/93) and the 7 E2E tests all passing.

**Architecture note (proposal only):** selection hygiene is now spread across `setFiles`, `selectRange` (which filters to visible paths) and the anchor ref in `FileList`. A single helper, something like `pruneSelectionTo(paths)` in the store, used by both `setFiles` and `selectRange` would put the "selection ⊆ listed files" rule in one place. Moving the D-31 anchor from a component ref into the store would let `setFiles` prune it at the same time, so it could no longer drift onto a path that has left the list.