COMMIT: OK

The fix is small and correct. I found nothing blocking: the change has no security, IPC or performance impact and doesn't affect existing flows. Lint, type-check, unit tests (146 renderer, 93 main) and the 7 E2E tests all passed in verify.log.

**What changed**
- `src/renderer/src/stores/file-store.ts:106-111`: a new helper, `getFieldSortKey`, works out the text used to sort a field. If the field is a list and its first item isn't text (a number, `{}`, `true`, `null`), or the list is empty, it now sorts as an empty string.
- Before this, the comparator at `file-store.ts:132-133` used `aVal[0] ?? ''` without checking the type. A malformed first item (for example `{}`) was then passed to `localeCompare` as a non-string, which could throw or give the wrong order.
- `getSortedFiles` is used by both `useFilteredFiles` (the file list) and `selectRange` (shift-select), so the fix covers both.
- Behaviour for good data doesn't change. When both values are numbers they still compare as numbers, and string values and missing metadata sort as before. Tests (b) and (c) cover these cases.

**Findings**
- critical / high: none.
- medium: none.
- low, `file-store.ts:110`: a malformed value that isn't a list (e.g. `{"artists":{}}`) still becomes `"[object Object]"` and sorts as that text. It doesn't throw, and the behaviour is unchanged by this diff. Fix: also return `''` when the value is neither a string nor a number.
- low, `file-store.ts:129`: when one row has a number and the other has text or nothing, they are compared as text, so `"120"` sorts against `""`. This is unchanged by the diff and test (c) "bpm vs missing" locks it in. Just noting it.
- low, the tests: the store test reads the sort order back through `selectRange`, which makes it depend on how selection is implemented. The order is correct today. A test-only reader of `getSortedFiles` or a `renderHook(useFilteredFiles)` would be less fragile. The R18-e component test already covers the UI path.
- Conventions: no comments in code, semicolons present, no `any` or `@ts-ignore`. The failing-test-with-bugfix rule is met by TM-B21 / D-27 tests at both store and component level.

**Architecture note (proposal only)**
Several places now guard against array items that aren't strings: the TM-B20 display fix and this sort fix. A better long-term fix is to clean the metadata once, at the IPC boundary or in `setMetadata` / `updateFileMetadata`. That step would turn every `FieldValue` array into `string[]` (dropping or converting other items) and reject non-list values for list fields. The renderer could then trust the `WavMetadata` types, and new spots that read list fields wouldn't need their own guards.