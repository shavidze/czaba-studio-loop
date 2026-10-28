COMMIT: OK

This change stops writing empty values to the file. When a text or tags field is empty, it removes the existing sub-chunk instead of writing a zero-length one. That covers whitespace-only text, empty tag lists, and tag lists where every item is blank. It works for the standard fields and the custom `riffChunkId` ones, in both single-file and batch saves. The verify log shows lint (warnings only, all in files this commit doesn't touch), typecheck, 320 renderer tests, 109 main-process tests and 7 E2E tests passing.

**What I checked**
- **Error for an invalid custom ID still fires.** It used to come from `setValuesFromStrings`; for empty values it now comes from `removeValue`. Tests (e8) and (e9) show it still rejects with the same message and leaves the file unchanged, including on a file that has no `LIST/INFO` chunk.
- **Standard fields are cleared by the library.** For title, album, comment and similar fields, the library's setter treats `''` as "remove the item". For genres and artists, an empty list removes the sub-chunk too. Test (e10) confirms this for genres.
- **Batch save only touches changed fields.** Fields that weren't sent are still skipped, so clearing one field in a batch leaves the others byte-identical (test e7).
- **The form updates after a save.** The metadata panel (`MetadataPanel.tsx:161`) re-reads the file after writing. A title saved as `'   '` comes back as `''`, so the form matches the file and doesn't stay marked as changed.
- **Project rules are followed.** No comments in code, semicolons and strict typing are in place, the bug fix comes with tests, and the contract doc and the `WAV_METADATA.md` notes are updated.

**Findings**
- **Medium: a behaviour change for the backend importer.** On a bare WAV where every field is empty, the library still writes an empty `LIST/INFO` chunk (size 4). Before this change no such chunk existed. The contract doc records this. Still, tell the `czaba-api/tools/recording-import` owner, so an importer that expects at least one sub-chunk in `LIST/INFO` doesn't break.
- **Low: a guard that may never run** (`src/main/ipc/metadata.ts:208-213`). Test (e9) only passes if `getRiffInfoTags` returns an InfoTag even when the file has no `LIST/INFO` chunk. If that's always true, the `tag.title = tag.title ?? ''` workaround and its error never run. Fix: add a test showing the branch can run, or remove it in a later round.
- **Low: trimming is inconsistent** (`metadata.ts:105-113`). A whitespace-only value is treated as empty, but non-empty values keep their surrounding spaces (`' KM184'` is kept). This is intended and tested in (e4), but someone reading the code may not expect it. The contract doc mentions it; nothing else needed.
- **Low: no test that typing spaces into the panel saves cleanly.** No renderer test types `'   '` into the panel, saves, and checks that the form is no longer marked as changed. Add one to `metadata-panel-batch-save.test.ts` or a sibling test file.

**Architecture note (proposal only)**
`normalizeFieldValueForWrite` and `isEmptyFieldValueForWrite` decide emptiness by field type, and stage 2 (number `0` → remove) will add more of these rules. Consider one function per type, such as `toRiffWriteOp(field, value)`, that returns either "remove the sub-chunk" or "set these strings". The standard-field path and the custom-field path would then use the same emptiness rule, rather than relying on how the library's setter happens to handle `''`.