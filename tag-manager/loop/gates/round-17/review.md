COMMIT: OK

I reviewed the diff and the full `file-row-display.ts`, checked the new tests against the `FileList` row layout, and read `verify.log`. Lint shows 9 old warnings and no errors; tsc passes; 135 renderer, 93 main and 7 E2E tests pass.

**Critical / High / Medium:** none.

The fix is correct and only changes behaviour for malformed data. `formatFirstFieldValue` returns `''` when the first array element is not a string. `isNonEmptyFieldValue` skips non-string array elements before calling `.trim()`. So bad IPC or metadata data like `[{}]` or `[null]` can no longer crash `FileRow` during render. Valid string arrays behave exactly as before. The test column indices are right: in `FileList.tsx:84-94`, cell 2 is artist and cell 3 is genre. There are no new IPC, security or performance concerns. The tests cover empty, `null`, number, object and boolean values, mixed arrays, and a full render, which meets the bug-fix test rule.

**Low**
1. `tests/renderer/utils/file-row-display.test.ts:74-75`: there are two separate `import type … from "~/types"` lines. Biome doesn't flag it, but it's untidy. Fix: merge into `import type { FieldValue, WavMetadata } from "~/types";`.
2. The `parseUntypedMetadata` helper is defined in both test files. It's minor, but it could move to `tests/renderer/helpers/`.
3. `formatFirstFieldValue(['', 'B'])` still returns `''` while `hasAnyTagValue` returns true, so a row can show "Tagged" with an empty artist cell. This behaviour existed before this change; noting it only for the backlog.

**Architecture note (proposal only)**
This fixes the symptom where the data is displayed. The underlying problem is that nothing checks the shape of `FieldValue` arrays when data crosses into the renderer. `TemplatePicker.tsx:21` (`value.join(', ')`) and any metadata form code that handles arrays rely on the same assumption. A better long-term fix is to clean the data once, in the main-process metadata read handler or in the `file-store` setter, keeping only string elements. Then all renderer code could trust the `WavMetadata` type, and these per-function `typeof` checks would only be a backup.