COMMIT: OK

The fix is correct. It skips the sync effect and overwrites the editor only when the selection is still the same set as when the save started. Otherwise the store gets the re-read data and the existing sync effect decides what the editor shows. I traced each new branch against the sync effect at `MetadataPanel.tsx:61-94` and the store setters, and found no regressions. The verify log shows Biome clean, renderer tests 173/173 and main tests 93/93.

**How each case plays out at runtime**
- **Single file, A → B during the write:** `updateFileMetadata(A)` creates a new `metadata` object, so the effect re-runs. `selectionChanged` is false, because switching to B already updated `prevSelectionRef`. `isDirty` is false, because switching to B called `setEditingMetadata`, which resets it (`metadata-store.ts:33`). So the effect reloads B's own values, which is harmless. If the user typed on B, `isDirty` and the editing data are both set, so the effect returns early and B's edits are kept (x3).
- **Batch, A+B → A:** with no `skipSync` set, the effect shows A's refreshed values (x5, x6, x11).
- **Same set reordered, or A → B → A:** `isSameSelectionSet` makes these behave exactly as before (x9, x10).
- **Leaks:** `skipSyncRef` is only set to true when `updateFileMetadata` is about to be called, and that call always creates a new object. So the effect always runs and clears the flag, and it can't stay stuck at true.
- **Event order:** the selection check runs after the last `await`, with nothing async between the check and the updates, so the selection can't change in between.
- **Error paths:** a rejected write or a failed re-read returns before the check (x7, x8 cover this).

**Findings**

- **Low, existing behaviour not fixed here** (`MetadataPanel.tsx:74-76`): switching away from a dirty selection while a save is running shows "Unsaved changes were discarded", even though those edits are being written. The save toast replaces it a moment later, so this is cosmetic. Possible fix: skip the discard toast while `isSaving` is true, or rather while the save started from the selection being left.
- **Low, existing behaviour pinned by x10** (`MetadataPanel.tsx:115-118`): if the user goes A → B → A and types on A during the write, the selection counts as unchanged, so `setEditingMetadata(updated)` overwrites the new typing. The same happens when the user types on the original selection without ever switching away. It's outside this task, but worth a backlog item: check whether the editor changed after the save started (for example, compare `modifiedFields` to what it was at the start), not only the selection.
- **Low, conventions:** no code comments, semicolons present, no `any`. The `STATE_MANAGEMENT.md` D-29 line accurately describes the new behaviour. The test file uses double quotes, which matches that file's existing style.

**Architecture note (proposal only)**
`handleSave` now has to work out on its own whether its result still applies to the screen, which is spread across `skipSyncRef`, the selection snapshot and `isDirty`. A small save token would make that explicit. At save start, record `{selectionKey, editVersion}`, with `editVersion` increased on every `updateField`. Only write to the editor if both still match. Store updates would stay unconditional. This would fix both low findings in one place, and the sync effect would only need to handle selection changes.