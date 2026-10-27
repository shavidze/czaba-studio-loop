COMMIT: OK

The change is small and correct. In `FolderBrowser.tsx` (Open Folder) and `App.tsx` (drop), an empty folder now calls `setMetadata({})`, which Rescan already did. `setMetadata` was already in scope and in each `useCallback` dependency list, so there's no stale closure. The verify log shows 13 test files and 240 tests passing, including e1–e4 and u3.

**Critical / High:** none.

**Medium:** none.

**Low**
1. `FolderBrowser.tsx:127-129`, `App.tsx:79-81`: this is an existing limitation, not caused by this diff. If a save on a file from the old folder is still running when an empty folder is opened, the save's re-read can still write that file's entry into `metadata` after it was cleared. The entry is hidden because `files` is empty. If that old folder is reopened and its read fails, the leftover entry would show as current. The k5 case (switching to a different non-empty folder) has the same gap. Fix, if you want it: have the post-save re-read skip any path that isn't in `files` at the time it writes to the store, or record it as a known limitation in `001-…md`.
2. Docs: the line references in D-35, D-36 and D-37 and in entries (11), (12) and (13) match the current code: `FolderBrowser.tsx` lines 111-126, 127-129, 130-135, 163-178, 179-181 and 182-185, and `App.tsx` lines 63-78, 79-81 and 82-87. The `STATE_MANAGEMENT.md` summary is correct too. Nothing to fix. Line-number references go stale easily, though; referring to code by function name (e.g. "`handleRescan` else-branch") would last longer.
3. Tests: e1, e2 and e3 check the actual bug and would fail on the old code. e4 is a pin test for Rescan, which already behaved this way. u3 adds boundary coverage for chunks that fail non-contiguously, and it restores the mock in `finally`. This follows the test-on-bugfix rule.

**Architecture note (proposal only):** The three folder-load callers (`handleOpenFolder`, `handleRescan`, App's `openFolder`) duplicate the same steps: scan, then `setFiles`, then the chunked read, then `applyMetadataRead`, then the toast, plus an empty-folder branch. That duplication is how this bug happened: one caller had the empty-folder branch and the other two didn't. A single shared `loadFolderContents(path, { onErrorClear: boolean })` helper in the store or `lib/` would keep these branches the same in all three places, and the remaining difference (Rescan keeping its files and metadata on error) would be an explicit option.