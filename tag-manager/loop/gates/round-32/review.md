COMMIT: OK

I found nothing that should block this commit. All tests pass: 268 renderer and 93 main (`verify.log` lines 218–239). The fix makes late re-reads safe after the user switches folders. A save's re-read now goes into the store only for files still in the list (`isListedPath`). A schema re-read is dropped if a newer folder load has started (load id check). A folder drop that is still waiting for the schema stops if a newer load has started.

**Critical / High:** none.

**Medium:** none.

**Low**
1. `src/renderer/src/components/metadata-editor/MetadataPanel.tsx:60-62, 186-188` — slow check in batch saves. `isListedPath` searches the whole file list for every saved file. For 1000 selected files in a 1000-file folder that is about 1,000,000 comparisons on the main thread after the save. **Fix:** build `new Set(useFileStore.getState().files.map(f => f.path))` once per re-read and look paths up in it. Nothing else changes.
2. `MetadataPanel.tsx:64-74, 145, 176` (existing behaviour, not new) — wasted scan after a folder switch. `refreshSavedFileStats` reads `folderPath` when it runs, so a save that finishes after the user opens folder B scans folder B. The written-paths filter throws the results away, so state stays correct. **Fix:** skip it when no written path is still listed, using the same check as item 1.
3. `src/renderer/src/App.tsx:55` — the new early `return` sits inside the schema-wait loop, before the `try/finally`, so it skips the `isScanning` reset. That is correct: only the current load owns `isScanning`, and it was superseded. Recorded so nobody "fixes" it into the `finally` later.
4. `MetadataPanel.tsx:235` — the load id check also drops a schema re-read when a Rescan of the same folder starts after Done. That loses nothing, because the Rescan reads with the new schema. One older gap remains: if a Rescan's read began before the schema change, it applies data read with the old schema and the schema re-read is not dropped. That predates this commit and is not covered by any test.

**Conventions / tests:** no comments in code, semicolons present, no `any`. The bug fix comes with tests that reproduce it: (v1)–(v9) for the save, schema and drop cases, plus (o17)/(o18) for Close Folder. (v5) checks that a parent folder still listing the saved file keeps the saved value, and (v4) covers the RR-R30-01 case. Docs (D-39, item 15, the README count) and `STATE_MANAGEMENT.md` match the code. The renumbered line references I checked are correct (`:158`, `:186-188`, `:217`, `:235`, `App.tsx:55`). The import merge in `file-store.test.ts` is a cleanup only. No security, IPC or accessibility changes.

**Architecture note (proposal only):** Folder-switch safety now depends on three separate rules: a load id for folder loads and schema re-reads, a "still listed" check for save re-reads, and write generations for stale reads. A single store action such as `applyLateRead(entries, { loadId?, readGeneration? })` could hold the listed-path filter, the generation check and the load-current check in one place. Each new async path would then get all three guards by default instead of re-deriving them.