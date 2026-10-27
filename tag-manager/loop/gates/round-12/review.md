COMMIT: OK

Before this change, a batch save wiped the typed values even when some or all files failed to write. Now the form is only cleared when every file saves. The fix moves `setEditingMetadata({})` inside the "nothing failed" branch (`MetadataPanel.tsx:99-104`). The other three files are the test and two doc updates that match. The verify log is green: Biome, tsc, 112 renderer tests, 62 main-process tests and the E2E run all pass. The new test covers all-failed, partial failure, retry after a failure, full success, and a failed single-file write.

**Runtime and event ordering**
- After a partial failure, the save still re-reads every file and updates the store. That triggers the sync effect, which uses up `skipSyncRef` and returns early because the selection didn't change. The typed values are kept as intended (test b).
- If the re-read returns no data (e.g. every file fails), the store doesn't change and the sync effect doesn't run, so `skipSyncRef` stays `true`. On the next selection change the flag is cleared and the change is still treated as a selection change, so the "Unsaved changes were discarded" toast still appears. No regression.
- A retry uses the current `editingMetadata` and `modifiedFields` (the store is read at save time), so the second save writes the same fields to all selected files (test c).

**Findings**
- **Critical / high:** none.
- **Medium:** none.
- **Low:**
  1. `MetadataPanel.tsx:78,94`: `skipSyncRef.current = true` is set even when the store doesn't change, so the flag can stay `true` with nothing to clear it. It is harmless today, but a later edit to the sync effect could make it hide a real update. Fix: set the flag only when the re-read returned at least one file, or clear it in `finally`.
  2. Retrying after a partial failure rewrites the files that already saved. The docs say this on purpose and the rewrite gives the same result each time, so this is just a note. Fix, if wanted later: send only the failed paths on retry.
  3. The new test file uses double quotes while `biome.json` asks for single quotes. Biome only checks `src/**`, and every existing file under `tests/` also uses double quotes, so this matches current practice. No change needed.

**Security, performance and accessibility:** no IPC or preload changes and no new channels. Performance is unchanged. The Save button's disabled state still follows `isDirty`, so after a failure the button stays enabled and can be reached by keyboard.

**Architecture note (proposal only):** the "skip the next sync" flag in the component, plus the sync effect, is fragile because it depends on exactly how often the store notifies. A cleaner approach would be a store action such as `commitBatchSave({ refreshed, failedPaths })`. It would update the file data and decide whether to clear the form in one step, which removes the need for `skipSyncRef`. It could also record the failed paths so a retry writes only to them.