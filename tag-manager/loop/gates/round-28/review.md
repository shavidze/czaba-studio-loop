COMMIT: OK

I checked the diff, the new test file, every place `readMetadataChunked` is called, and each file:line reference in the docs against the post-diff source. Nothing in this commit is a correctness, security or regression blocker. The verify log is green: Biome shows 8 warnings and no errors (all in files this diff doesn't touch), `tsc` passes, and 226 renderer, 93 main and 7 E2E tests pass.

**What changed and why it holds up**
- `readMetadataChunked` (`src/renderer/src/lib/utils.ts:63`) reads the write generation before each chunk. It records it only for paths that came back in that chunk's result (`:67-69`), so a rejected chunk records nothing.
- `applyMetadataRead` (`src/renderer/src/stores/file-store.ts:132-145`) replaces `metadata` from scratch, as `setMetadata` did, so files removed from the folder still disappear (test r5).
- A path is treated as stale only when its write stamp is strictly greater than the read's generation (`:136`). A stamp left over from an earlier write is always less than or equal, so it never blocks a later read. Generations only ever increase, so this can't misfire across folders.
- All three call sites (`FolderBrowser.tsx:111-118` and `:153-160`, and drop at `App.tsx:63-70`) were updated, and the type change forced that. The error and empty-folder paths still call `setMetadata({})`.
- `lib/utils.ts` still doesn't import the store; callers pass the generation in as a function, which keeps the dependency direction clean.
- All the line references in the bug doc match the code. That includes the shifted D-34 references (`file-store.ts:122-130`) and the `selectRange` reference (`:83-97`).

**Findings**
- **Medium:** none.
- **Low:**
  1. `file-store.ts:141-142`: if a path's read is stale and the store has no entry for it (for example, Open Folder on a different folder while a write to that path is pending), the file is listed with no metadata. Selecting it shows an empty form until the next successful read, and nothing tells the user. This is documented as intended ("no entry → absent"). Possible fix: count these paths and show a toast like `Failed to read N files`, or note in entry (11) that this case stays open.
  2. `file-store.ts:141`: when a read is stale, the store keeps its current entry. If the save's own re-read hasn't landed yet, or was rejected, that entry is the pre-write value. This is the same accepted limit as D-34 (test r8 covers the case where a later chunk read fixes it). Nothing to do beyond the existing documentation.
  3. Already a known limit (B-R27-02), not introduced here: Rescan, Open Folder and drop are not locked during a save. When the save's re-read lands after the folder has switched, it can add an entry for a file from the old folder into the new folder's `metadata`. It's harmless for rendering because the file list is driven by `files`, but it is a small leak.
  4. `tests/renderer/stores/file-store.test.ts:234-244`: test g2 uses bare keys (`a`, `b`) while `files` holds `/music/*.wav` paths. That's fine for a unit test of the action; it's cosmetic only.
- **Conventions:** no comments in the source, semicolons present, no `any` or `@ts-ignore`, docs in Georgian, and the fix comes with failing-then-passing tests (r1–r3, r6, r7, plus pins r4, r5, r8, u1 and g2).

**Architecture note (proposal only)**
Two places now repeat the "compare generation, keep the current entry if stale, skip if there's no entry" logic: `MetadataPanel.handleSchemaChanged` (D-34, around `:232-243`) and `applyMetadataRead` (D-35). Moving `handleSchemaChanged` to `readMetadataChunked` plus `applyMetadataRead` would leave a single stale-read guard, but it keeps its own behaviour for rejected chunks, and that difference needs a decision first. Separately, a scan token (an id per folder scan) would make the store drop a save's re-read when the folder has switched, which would close low finding 3 without locking the UI.