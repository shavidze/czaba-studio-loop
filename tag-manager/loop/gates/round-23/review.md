I've finished reading the diff, the new doc and the verify log. Verdict follows.

COMMIT: OK

This round changes no behaviour. It is a refactor of the save snapshot, a doc of known limits, and test fixes. Verify is green: biome reports no fixes needed, tsc passes for all three tsconfigs, and the tests pass (201 renderer, 93 main).

**Findings**

- **critical / high / medium:** none.
- **low: `tests/renderer/components/metadata-panel-batch-save.test.ts:1140-1156`.** The `(i2)` test only proves anything if `(i1)` runs right before it. If tests are shuffled or run alone (`-t "i2"`), `(i2)` still passes but checks nothing.
  - Fix: put both halves in one `it`. Queue the once-values, call the same `beforeEach` reset logic (pull it into a helper), then assert the defaults. Or add a comment in `docs/` saying the two tests depend on running in order.
- **low: `MetadataPanel.tsx:128`.** `startEditingMetadata` now comes from `useMetadataStore.getState()` instead of the render closure. I checked this and it's correct and slightly safer: the payload, batch keys and the D-30 comparison all use one value read when the save starts. Removing `editingMetadata` from the `useCallback` deps is right, since the callback no longer reads it. The only visible effect is that `handleSave` changes identity less often. This matches D-32 in the doc ("visible behaviour does not change"). No action needed.
- **low: removed casts (`as WavMetadata`, `as Partial<WavMetadata>`, `as Record<...>`).** They were redundant: `updated`, `accumulated` and `refreshed` are already typed that way, and tsc passes. This fits `TYPESCRIPT_STRICT`.
- **low: `docs/bugs/001-...md`.** The line references hard-code numbers such as `FileList.tsx:70`, `:112-114` and `MetadataPanel.tsx:43`, `:149`. They are accurate at this HEAD but will go stale at the next edit. Rule 8 of the doc-only report is met: every entry has a test name or says "ტესტი არ არის" (no test). The README index entry is in place.
- **low: `file-list.test.ts` `(z12)`.** This test pins the current anchor-moves behaviour (deviation 1), which is still an open question for Saba. If Saba picks Explorer-style behaviour, the test will be inverted on purpose. That's fine: doc entry 5 references it.

**Security / IPC:** no changes to main, preload or IPC. `writeMetadata` gets the same payload shape as before.

**Architecture note (proposal only)**

`handleSave` is now about 75 lines with two branches, shared snapshot/selection guards, and `skipSyncRef` coordination. Moving it into a store action or a `useSaveMetadata` hook would make the D-29/D-30/D-32 contract testable without rendering `MetadataPanel`. It would return a small result such as `{ selectionUnchanged, typedDuringSave }`. The same move would let entry 3 (schema change during save) be fixed in one place, by re-reading `fields` from `useSchemaStore.getState()` at re-read time.