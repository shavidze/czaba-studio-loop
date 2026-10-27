COMMIT: OK

This round changes only tests and docs. No `src/` files change, so the app's runtime, IPC, security and accessibility are untouched. The verify log passes: Biome reports 8 warnings, all in source files this round doesn't touch, plus tsc, 208 renderer tests, 93 main-process tests and 7 E2E tests.

**Findings**

- **Low — `docs/bugs/001-save-and-selection-known-limits.md:10`:** the line reference `MetadataPanel.tsx:111` points at `if (meta) {`. The store lookup it describes, `const meta = metadata[selectedPaths[0]]`, is on line 110. The `:224` reference (`setMetadata(accumulated)`) is correct.
  - **Fix:** use `:110`, or refer to the selection effect by name, since line numbers go stale.
- **Low — `tests/renderer/helpers/window-api-mocks.ts`:** the new shared helper also resets `saveSchema`. The batch-save suite used to skip that, so it now gets one more mock reset, which is stricter but harmless. Test `(i3)` was extended to cover it, so mocks can't leak between tests through `saveSchema`.
  - **Fix:** none needed.
- **Info — test `(s8)` in `metadata-panel-schema-change.test.ts`:** I checked it against `handleSchemaChanged` (`MetadataPanel.tsx:201-234`):
  - The three paths fit in one chunk, so `failures` is 3 and the toast reads `Failed to read 3 files`.
  - `c.wav` has no store entry (`!previous[path]` → `continue`), so it stays absent.
  - `a.wav` is a kept path, so `setEditingMetadata` is skipped and the form still shows `ACat`.

  The test checks real component behaviour against real stores; only `window.api` is mocked.

**Docs check:** the new D-33 limitation is accurate. When the schema re-read fails for a file, its old entry is kept and the new field has no value until the next successful read. Switching files doesn't re-read, because the selection effect reads from the store. The RR-R24-02 variant is also accurate: `setMetadata` runs only after the last chunk, so results read before a save can overwrite the save's re-read. Both entries keep the status `ცნობილი შეზღუდვა` (known limitation) and say `ტესტი არ არის` (no test), which matches what the code does today.

**Architecture note (proposal only)**

The race RR-R24-02 / A-R21-03 now lists twice could be fixed in the renderer alone:
- Keep a per-path read generation, or one shared counter, in `useFileStore`.
- Bump it on every write's re-read.
- Have `handleSchemaChanged` write only the paths whose generation hasn't changed since its chunk started, instead of a single `setMetadata` for everything.

That would replace the "known limitation" with a guard that can be tested: a deferred chunk 2 resolving after a save completes. Separately, the other test files that still reset `window.api` mocks inline should move to `resetWindowApiMocks` so mock isolation stays the same across suites.