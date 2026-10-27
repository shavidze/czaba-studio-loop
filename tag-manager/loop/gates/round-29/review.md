COMMIT: OK

Nothing blocks this commit. The change is small and stays within D-36. All callers are updated, and the full check passed: tsc, Biome (8 existing warnings, none from this diff), 235 renderer tests, 93 main-process tests and 7 E2E tests.

**What I checked**
- **Correctness:** `readMetadataChunked` now builds `failedPaths` in the same order as `paths`, and `failures` is always `failedPaths.length` (`lib/utils.ts:72,75`).
- **Kept entries:** in `applyMetadataRead`, the kept-paths loop runs inside the same `set` as the D-35 superseded loop. Each kept path keeps the store entry it has when the store is written, not the one it had when its chunk rejected; test k6 covers this. A kept path is never also in `read`, so the two loops can't overwrite each other's entries.
- **Missing entries:** a kept path with no current entry stays out of the store. Opening a different folder therefore can't bring back entries from the previous folder (k5).
- **Callers:** the only production callers are `FolderBrowser.tsx` (`handleOpenFolder`, `handleRescan`) and `App.tsx` (`openFolder`, drop). All three pass `failedPaths` and show the toast. Because `keptPaths` is a required parameter, the compiler would reject any caller that forgot to pass it.
- **Regressions:** the error path, the empty-folder path and `handleCloseFolder` still call `setMetadata({})`. D-35 behaviour is unchanged (the folder-read-during-save tests r1–r8 still pass). The happy path shows no toast (k7).
- **Security and IPC:** no new channels, the preload is unchanged, and the toast text is a number inside a fixed string, so there is no injection risk.
- **Conventions:** no comments in the code, semicolons and strict types are in place. Every changed store/utility behaviour has a test (g3, u2, k1–k7). The docs/primitive updates and the D-36 entry match the code, and the line references I spot-checked are accurate.

**Low**
1. **Toast grammar.** With one failed file the toast reads `Failed to read 1 files` (`FolderBrowser.tsx:125,175`, `App.tsx:77`). This copies the existing D-33 wording in `MetadataPanel.tsx:252` and k4 pins it, so it's consistent. If it gets fixed, change all four sites and the tests together.
2. **Duplicated read-and-apply block.** The same block is now repeated three times: read chunks, apply with generations and kept paths, then show the toast (`FolderBrowser.tsx:111-126`, `:161-176`, `App.tsx:63-78`). Each new rule now needs editing in three places. See the note below.
3. **Concurrent folder reads.** Two overlapping folder reads (e.g. Rescan twice, or Rescan during a drop) have no ordering guard, so whichever finishes last wins, and its kept paths keep the entries current at that moment. This existed before this change and isn't made worse by it. It's worth a backlog item, since D-35 only guards against writes and not against a second read.

**Architecture note (proposal only)**
Move the shared sequence into one helper in the file store, for example `loadFolderMetadata(paths, schema): Promise<{ failures }>`. It would call `readMetadataChunked` with the store's `writeGeneration`, run `applyMetadataRead` with the generations and failed paths, and return the failure count so each caller only shows the toast. That would reduce the three call sites to one line each. It would also give one place to add a per-read sequence guard for the concurrent-read case in item 3.