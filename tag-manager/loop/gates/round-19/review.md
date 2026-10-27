COMMIT: OK

The change does what it should. Size and Date are refreshed only after a write is confirmed, and only for the paths that were actually written. Errors are handled silently and existing save behaviour is unchanged (D-21, D-22, D-24, skipSync). Tests cover the store action and the save flows, including the call order write → scan → read. I found nothing that should block the commit.

**Critical / High:** none.

**Medium**
1. **Performance: every save re-scans the whole folder tree.** `MetadataPanel.tsx:25` calls `window.api.scanFolder(folderPath)` to refresh the stats of 1 to N files. In the main process, `scanFolderRecursive` (`src/main/ipc/file-system.ts:16-66`) visits every directory up to depth 20 and runs `stat` on every WAV, one at a time. The call is awaited inside the save, before the re-read, while `isSaving` is true. So on a large library (1000+ files) or a network drive, saving one file's tags waits on a full tree walk, with no timeout. Saving and then saving again makes this worse.
   *Fix (next round is fine):* add a narrow IPC channel such as `statFiles(paths: string[]) → WavFileEntry[]` that only runs `stat` on the written paths, validates the input under ELECTRON_IPC rules and skips ENOENT. Or at least run the refresh without awaiting it, after the success toast, so the save is never blocked. Either change keeps the D-28 rule (patch written paths only).

**Low**
2. **The shift-click anchor resets after each successful save.** `updateFileStats` returns a new `files` array when a path matches. That fires the effect at `FileList.tsx:107-109`, which sets `lastClickRef` back to -1. So a user who saves and then shift-clicks gets a single selection instead of a range. This is arguably right when the list is sorted by Size or Date, because the saved row can move. When sorted by name it is a small UX regression. Accept it or document it under D-28; if you'd rather keep the anchor, the effect could depend on the file paths instead of the array.
3. **Stale `folderPath` is read after the write.** `refreshSavedFileStats` reads `folderPath` after the write finishes. If the user opens another folder during a slow save, the new folder gets scanned. This does no harm, because only the written paths are patched and the stats come from disk. It's noted only so nobody "fixes" it into a bug later.
4. **Convention, ok:** the bare `catch { return; }` at `MetadataPanel.tsx:28` follows the D-28 "scan reject silent" rule. `STATE_MANAGEMENT.md` was updated in the same change, so the docs match the code.

**Architecture note (proposal only)**
File-stat refresh now sits in a component helper that reaches into `useFileStore.getState()`. Two cleaner options:
- Move it into a store action, e.g. `useFileStore.refreshStats(paths)`, backed by the dedicated `statFiles` IPC from finding 1.
- Have the write IPC return the new stats with its result (`writeMetadata` → `{ size, modifiedAt }`, and per-path stats in `BatchWriteResult`).

The second option removes the extra round trip and the ordering question entirely, because the stats are exactly those of the write that just happened.