COMMIT: OK

This commit adds `category` to the standard fields, written to the WAV file's `ICAT` tag. I found nothing that should block it. The verify run passed lint, type check, 79 renderer tests, 40 main-process tests and 7 E2E tests. The new contract tests check the actual bytes written to the file, not mocks. They cover tag sizes and padding, the audio data staying unchanged, recorder `bext`/`iXML` chunks staying byte-identical, batch writes keeping other fields, and clearing a value. `release.yml` is unchanged and no runtime code changed other than the one-line field addition in `src/shared/types.ts`.

**Medium**
1. **A saved custom field named "Category" collides with the new standard field.** Files: `src/renderer/src/components/schema/SchemaEditor.tsx:38-57` and `src/main/ipc/schema.ts:23-34`.
   - Suppose a user created a custom field "Category" before this change. It is stored with key `category` and an auto-generated tag ID of `CATE`, without the standard flag.
   - After the update, the Schema Editor lists "+ Category (UCS)" as a hidden standard field, because it only checks for standard fields.
   - Clicking it adds a second field with the same key. The same value then gets written to both `CATE` and `ICAT`, the second read overwrites the first, and React sees duplicate keys.
   - The contract doc tracks the case of an old custom field that already uses `ICAT` (TM-T1-DUP). It does not cover this same-key, different-ID case.
   - Fix: build `enabledStandardKeys` from all field keys, not just standard ones, or reject the toggle when the key already exists. Add a renderer test with an old schema that contains `{key:'category', riffChunkId:'CATE'}`. Can follow up under TM-T1-DUP.

**Low**
2. **The CI ffprobe step depends on a file produced by a unit test.** File: `.github/workflows/check.yml:36-37`.
   - The step reads `test-results/.../contract.wav`, which is created as a side effect of test T1-1 in `tests/main/recording-tag-contract.test.ts:113-114`. If someone renames or skips T1-1, CI fails with "WAV file not found" rather than a clear message.
   - It works now only because the step runs before Playwright, which wipes `test-results/`.
   - The verify log doesn't show this step running locally, so whether it passes is still unproven until the first green CI run (TM-T0-CI).
   - The expected tag names look right: as far as I know, ffmpeg doesn't rename `ICAT` or `IKEY`, so ffprobe reports them as-is. It does report `ICMT` as `comment`, which matches the script.
   - Fix: have the script fail with a hint naming the test that produces the file, or generate the WAV inside the script.
3. **Every save from the editor panel will now add an empty `ICAT` tag to the file**, because the form sends `category: ""`. This is the same as how `IKEY` already behaves, and the D-10 tests pin it on purpose. Just be aware that files will change for users who never use the field.
4. **Style:** the new test files use double quotes, while `src/` uses single quotes. Biome only checks `src/`, so nothing enforces it. Not a blocker.

**Security, performance, accessibility:** nothing new. The commit adds no new IPC channels, no secrets, and no UI markup changes. The CI workflow still has read-only permissions. `npx --yes tsx@4` downloads a floating major version at runtime; consider pinning it as a dev dependency.

**Architecture note (proposal only):** schemas are saved whole, with no version or migration step. Every new standard field will hit the same problems: it won't show up for existing users (D-07), and it can collide with old custom fields (finding 1, TM-T1-DUP). A versioned `schema.json` with a one-time merge step in `loadSchema()` could fix both:
- append new standard fields as hidden;
- flag custom fields whose key or tag ID clashes with a standard one.

Deciding duplicates once at load time, rather than in the editor, would remove both edge cases.