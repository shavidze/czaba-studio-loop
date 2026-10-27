COMMIT: OK

The change does what D-30 says it should. On a successful save, if the selection set hasn't changed, it keeps any field the user changed while the write was running. I checked it against `metadata-store.ts`: `setEditingMetadata` resets `modifiedFields`/`isDirty`, and `mergeFields` puts them back. All four `check` steps passed: Biome showed only 9 warnings that were already there, plus tsc, unit tests (187 renderer + 93 main) and 7 E2E tests.

**Critical / High:** none.

**Medium:** none.

**Low**
1. `MetadataPanel.tsx:128`: `startEditingMetadata` comes from the render closure, not `useMetadataStore.getState()`. The code writes this same snapshot (lines 134, 158), so it's consistent and correct. Taking both from `getState()` once at the start of the save would stop a future change from making the snapshot and the written data differ. Optional.
2. `MetadataPanel.tsx:44-47`: a field that was edited before the save, changed during the write, then set back to its pre-save value is treated as "not typed". The panel then shows the re-read value, which can differ from the typed one if taglib normalized it (trimmed whitespace, rounded BPM). Test y4 pins this as intended and it matches the D-30 text, so no change needed. It is worth a note in the bug docs.
3. `metadata-panel-batch-save.test.ts`: no test covers typing during a **batch** save when the set changes (`selectionUnchanged=false` → `typedDuringSave={}`, so nothing is merged). D-29 coverage and y8 (single-file, A→B→A) cover the logic next to it, but a one-line pin for the batch case would protect against regressions. Fix: add a test where the selection goes AB→A during the write, the user types, and the result is the sync-effect state with no merge.

**Checked, no issue**
- **Effect ordering:** the store updates (`skipSyncRef=true` → `updateFileMetadata` → `setEditingMetadata` → `mergeFields`) all run in the same tick, so the sync effect sees only the final state. `skipSyncRef` handles the `metadata` change, and once `isDirty` is true with data present, a later effect run returns early anyway.
- **Error paths:** a partial batch failure, a write that rejects, and a re-read that fails (D-24) don't touch the new code. Tests y11–y13 cover them.
- **Templates:** a template applied during the save goes through `mergeFields`, so it is also kept. That's consistent.
- **Conventions:** no comments, semicolons present, no `any`, `STATE_MANAGEMENT.md` updated with D-30. No security or IPC surface changed, and the comparisons are O(fields), so no performance concern.

**Architecture note (proposal only):** `handleSave` has picked up several overlapping rules (D-21, D-24, D-28, D-29, D-30) that all work off `skipSyncRef`, flags and snapshots inside a component callback. Moving the post-save reconciliation into a pure function in the metadata store would make each D-rule unit-testable without rendering, and would retire `skipSyncRef`. That function would take the start snapshot, current store state, selection-unchanged, the re-read result and the write result, and return the next `editingMetadata`/`modifiedFields`/`isDirty` plus a skip-sync flag.