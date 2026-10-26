COMMIT: OK

This commit moves the "Tagged" check and the first-value formatter out of `FileList.tsx` into a new pure module, `src/renderer/src/lib/file-row-display.ts`. The badge now appears when any metadata field has a real value, not only title, artists or bpm. That fixes TM-B09/D-15: rows with only category, keywords or comment showed no badge. The verify log shows Biome clean and 107 renderer tests plus all main-process suites passing.

**Critical / High:** none.

**Medium:** none.

**Low**
1. **Badge behaviour change** (`file-row-display.ts:15-18`): the badge now checks every field, so a file whose only metadata is a year, track number or ISRC will show "Tagged". This fits D-15, but it is a visible change. Nothing in the UI needs fixing; put a note in `docs/`.
2. **Possible runtime crash** (`file-row-display.ts:11`): `item.trim()` assumes every array element is a string. Today that holds: the reader returns plain strings (`metadata.ts:36,48,129`), and the type says `string[]`. If a template or edited value ever puts a `null` into an array, the whole row crashes while rendering. Optional fix: `typeof item === 'string' && item.trim() !== ''`.
3. **Number fields** (`file-row-display.ts:12`): any field with type "number" counts as tagged only when it is greater than 0. That's fine for bpm, year and track. A future custom number field where 0 or a negative value is meaningful would be treated as empty. No action needed now.
4. **Fragile test helper** (`tests/renderer/components/file-list.test.ts:47`): `getFileRow` finds a row by going up exactly two parent elements from the file name. Any change to the row's markup breaks every test in that file. A `data-testid` or `role="row"` on the row would be more robust, but that touches the component.
5. **Conventions:** no comments, semicolons present, no `any`, no new styling. The tests use double quotes and the source single quotes, but Biome passed, so the config accepts both.

**Performance:** `Object.values(meta).some(...)` runs on each row render over about 10–20 fields and stops at the first value it finds. That's negligible even at 1000+ files.

**Security / IPC / accessibility:** none of these are touched.

**Architecture note (proposal only):** the "is this value empty" check now exists in three places with different rules: `isNonEmptyFieldValue` here, the inline `val !== '' && val !== 0` in `TemplatePicker.tsx:130`, and probably the dirty-tracking in the save flow. One shared `isEmptyFieldValue` (for example in `src/shared/`) would keep "Tagged", template capture and save behaviour consistent. Next step: move `TemplatePicker` onto it, with a test for whitespace-only values.