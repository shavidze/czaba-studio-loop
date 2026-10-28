COMMIT: OK

The diff is consistent from end to end: an unset number field is now `''`, and a 0 the user types is now treated as a real value. The read path, write path, editor input, template capture, the Tagged check and the docs all follow that rule. Gate evidence is green: renderer 326/326, main 120/120 and E2E 7/7 (verify.log), plus C PASS.

**Critical / High:** none.

**Medium:** none.

**Low**
1. `src/main/ipc/metadata.ts:207`, `:34`: when a user types 0 into Year, Track # or BPM, node-taglib-sharp deletes the item on save. On re-read, `readStandardNumberValue` returns `''`, so after "Tags saved" the field goes blank with no warning. `docs/recording-tag-contract.md` already records this as a library limit. Fix (UX only): either set `min="1"` on these three inputs, or show a hint that 0 cannot be stored in standard fields.
2. `src/renderer/src/stores/file-store.ts:194-199`: sorting by a number column used to be purely numeric because unset was `0`. Now an unset `''` falls back to `localeCompare`. I checked the order: `''` sorts before every number and numbers still compare numerically, so the order holds and unset rows come first in ascending order, as before. No change needed. A test that sorts files with mixed `''` and numbers would lock this in.
3. `src/renderer/src/components/metadata-editor/MetadataPanel.tsx:191-198`: `type="number"` inputs report `''` for partial input such as `-` or `1e`, so the field is set to unset while the user is still typing. That is fine (before this change it became `0`), and it is now handled consistently.
4. Older files that already hold `ITKN='0'` will now show as Tagged with Take = 0. The docs cover this and say no migration is planned. Expected behaviour, noted only so it doesn't come back as a bug report.

**Conventions:** no comments in code, semicolons present, no `any`, Georgian docs updated, D-50 recorded in both primitives (`STATE_MANAGEMENT.md`, `WAV_METADATA.md`) and the contract doc. New tests cover the bug-fix rule, including the boundary cases: whitespace, `NaN`, `'abc'`, corrupt file, the C-R6-01 read-then-save case, and `-2`. No IPC surface or security changes.

**Architecture note (proposal only):** the meaning of a number value now lives in three places: main (`normalizeFieldValueForWrite`/`parseRiffNumberValue`), the renderer input, and `TemplatePicker` `parseInt`. Moving it into one shared helper in `src/shared/` (`toNumberFieldValue(raw): number | ''`), used by main, the panel and templates, would stop them drifting apart. Templates currently use `parseInt` and truncate `1.5`, while the panel keeps it. Separately, `FieldValue` could get a typed `NumberFieldValue = number | ''` so the compiler enforces this.