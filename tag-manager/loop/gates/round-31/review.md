Review is done; the change is safe to commit.

COMMIT: OK

**Findings**

*Critical / High:* none.

*Medium:* none.

*Low*
1. `tests/renderer/stores/file-store.test.ts:2-3`: `isFolderLoadCurrent` is imported in a second statement from `~/stores/file-store`, even though `useFileStore` is already imported from there. Biome passed, but merge them into one import (`import { isFolderLoadCurrent, useFileStore } ...`), as `folder-read-overlap.test.ts:7` already does.
2. `src/renderer/src/App.tsx:50-55`: the wait for the schema to load runs after `beginFolderLoad()` and never checks whether the load is still current. A superseded drop keeps polling every 50 ms for up to 5 s and then calls `scanFolder`, whose result is thrown away. Nothing wrong ends up in the store, because the check at `:59` catches it. Still, it wastes a scan IPC call. Fix: inside the loop, add `if (!isFolderLoadCurrent(loadId)) { return; }`, with the matching `finally` handling (or move the check before the `try`).
3. `src/renderer/src/stores/file-store.ts:155-158`: `beginFolderLoad` does `set` and then reads it back with `get()`. That is correct, because Zustand's `set` is synchronous. A simpler version computes `const next = get().folderLoadId + 1; set({ folderLoadId: next }); return next;`. Optional.

**Checked and correct**
- **Every exit is guarded.** All three load paths (Open Folder, Rescan, drop) check whether the load is still current after `scanFolder`, after `readMetadataChunked` and at the top of `catch`. An early `return` inside `try` still runs `finally`, and `finally` only clears `isScanning` for the current load, so the spinner can't get stuck.
- **Cancelled dialog.** Open Folder takes its load id after `if (!path) return;`, so cancelling the dialog doesn't cancel a pending load. Test (o8) covers this.
- **Close Folder.** It takes a new id and stops the spinner, so a pending load can't refill a closed folder. Test (o5) covers this.
- **Counter.** `folderLoadId` only goes up and isn't reset in the test helper. Test (f1) uses relative values, so the tests don't depend on each other's order.
- **Earlier rules unchanged.** D-35, D-36 and D-37 behave as before inside the current load, and the existing rejected-chunk and read-during-save tests still pass.
- **Verify run.** 257 renderer tests, 93 main-process tests and 7 E2E tests pass, and type-checking is clean. The 8 Biome warnings were already there; this diff doesn't touch those lines.
- **Project rules.** Bug entry (14) in `docs/bugs/` is in Georgian and lists the test names. `STATE_MANAGEMENT.md` is updated, the bug fix comes with tests that fail without it, there are no code comments, and semicolons are present. Security is unaffected: no IPC or preload changes.
- **Scope.** A save re-read landing after the folder changes (RR-R28-03) is still open. The docs state this as out of scope, so it is not a gap in this change.

**Architecture note (proposal only)**
The same load sequence is now copied three times (`handleOpenFolder`, `handleRescan`, App `openFolder`): begin the load, stop the player, scan, check, read in chunks, check, apply, show a toast, and the guarded `finally`. Every fix since D-35 has had to touch all three copies, and their line references in the docs drift each round. A single `loadFolder(path, { onError: 'clear' | 'toastOnly' })` in the file store or a `lib/` helper, with the load id handled inside it, would remove that drift. The App's schema wait could then become an awaited "schema ready" promise that is cancelled when a newer load starts.