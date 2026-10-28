Diff, test file and verify log are read, and the hook order in `MetadataPanel` checks out. Writing up the verdict now.

COMMIT: OK

The change does what it says. `Done` now shows a busy state while it waits, a second click while it is pending starts no extra re-read, and when two `Done`s overlap the later one always wins, whichever read finishes first. The failing-`onSave` path is handled. Verify log: renderer 287/287, main 93/93 and E2E 7/7 all pass. The new test file `schema-editor-done-busy.test.ts` covers (b1)–(b6), including both orders of the overlapping reads.

**Critical / High:** none.

**Medium:** none.

**Low**
1. **Focus is lost when Done is clicked** (`SchemaEditor.tsx:280`). The button becomes natively `disabled` while it has focus, so focus drops to `<body>`. A keyboard or screen-reader user has to tab back in from the top. The doc records this as a deliberate choice to match Save Tags (Deviation 1). Fix (next round): use `aria-disabled` + `aria-busy` on Done and Save Tags together, with a no-op guard in `handleSave`.
2. **Busy state can last forever** (`SchemaEditor.tsx:139`). If `onSave` never settles (a folder scan that never finishes, QA-R33-03), the editor shows `Applying...` until the user presses Back, opens a folder or closes it. This is documented, and Back stays enabled so the user is not stuck. Optional fix: a timeout that clears `isApplying` and shows a toast.
3. **Superseded re-read drops its own read-failure toast** (`MetadataPanel.tsx:249`). When a `Done` is superseded, its "Failed to read N files" toast is skipped too. That is correct, because the later `Done` re-reads every file and reports its own failures. Not a bug; noted so nobody "fixes" it later.
4. **Test (b2) can't fail** (`schema-editor-done-busy.test.ts:178`). React never fires `onClick` on a natively disabled button, so this test can't catch the double-click regression on its own. (b1)'s check that the button is disabled is what actually protects it. Acceptable. Making Done `aria-disabled` (item 1) would make (b2) meaningful.
5. **Conventions**
   - Hook order: `schemaReadIdRef` (`MetadataPanel.tsx:225`) sits before the `if (showSchemaEditor)` early return, so hook order is stable.
   - `useState` after the mount effect is fine.
   - No hardcoded colours (`disabled:opacity-60` is a utility class) and no comments in code.
   - Biome passes per verify.

**Security / performance:** no new IPC calls, no new inputs, and no leaks. The early return for a superseded re-read discards its results before anything is written to the store.

**Docs:** the D-42/D-43 entries and entries (18)/(19) match the code. I spot-checked the line references (`:225`, `:227-229`, `:249-250`, `:266`, `:270`, `:277`) and they are correct after the 3/1-line shift. README counts (19 entries, 10 fixed) match.

**Architecture note (proposal only):** the stale-result guards for schema re-reads are now spread out: `schemaReadIdRef`, `folderLoadId`, write generations, plus `isMountedRef` in the editor. One option is to move the schema re-read into the file store as an action, e.g. `beginSchemaRead()` / `isSchemaReadCurrent(id)`, mirroring `beginFolderLoad`. The editor would then read a store-level `isApplyingSchema`. That would:
- let the busy state survive Back and reopen, so the reopened editor could show `Applying...` instead of an enabled `Done`;
- remove the component-local ref;
- let store tests check ordering without rendering the panel.