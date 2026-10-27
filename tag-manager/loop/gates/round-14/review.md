COMMIT: OK

I found no blocking issues in this candidate. The change is scoped to test fixtures and docs, and no production runtime code (`src/`) is touched.

**What the change does**
- `tests/fixtures/create-fixtures.ts:59-71`: if the write or the rename fails, the temp file is now removed and the original error is thrown again. The cleanup uses `rmSync(..., { force: true })` inside an empty `try/catch`, so the original error is the one that comes back, not a cleanup failure. In the ENOSPC test the temp path is a symlink to `/dev/full`. `rmSync` removes only the symlink, not `/dev/full`, so the test is safe.
- `isCreateFixturesCliEntry` (`create-fixtures.ts:79-81`): the regex is anchored at a path separator or the start of the string, and at the end. It accepts `create-fixtures.{ts,mts,cts,js,mjs,cjs}` and rejects `create-fixtures.test.ts`, `.tsx` and `my-create-fixtures.ts`. Importing the file still writes nothing, so the Vitest `globalSetup` and Playwright behaviour don't change.
- `.gitignore`: `tests/fixtures/*.tmp` matches the temp name `sample.wav.<pid>.tmp`.
- `verify.log`: `tests/main/create-fixtures.test.ts` ran and passed (14 tests). The Biome warnings in the log are all in renderer files this diff doesn't touch.
- The new test checks the generated fixtures against the SHA-256 hashes from a652f06, so the files are confirmed byte-for-byte unchanged.
- The project rule that a bug fix comes with a test is met: there are tests for the EISDIR failure, the ENOSPC failure and the CLI-path matcher.

**Findings**
- **Low**, `tests/main/create-fixtures.test.ts:40`: the EISDIR test only asserts `toThrow()`. Renaming over a directory gives EISDIR on Linux but EPERM on Windows, so the loose assertion is right. Just don't tighten it to check a specific error code.
- **Low**, `tests/main/create-fixtures.test.ts:52`: the ENOSPC test is skipped wherever `/dev/full` doesn't exist (Windows/macOS). There, only the rename-failure path is tested. That's acceptable. Optionally, add a Windows test that makes `writeFileSync` fail some other way, such as a temp path that is a directory.
- **Low**, `create-fixtures.ts:69`: the empty `catch {}` would trip Biome's recommended `noEmptyBlockStatements` rule, but `biome.json` only lints `src/**`, so nothing flags it. If tests are ever added to the lint scope, write it as `catch (_cleanupError) { /* ... */ }` or move cleanup into a helper. The project bans comments in code, so the helper is probably the better choice.
- **Low**, docs: `TESTING.md` says `npx --yes tsx@4` while plan 002 still says `npx tsx`. Both work; align them when you next touch these docs.

**Architecture note (proposal only):** `tests/` is excluded from Biome, so the semicolons, quote-style and no-comment rules aren't checked on test code. Consider adding `tests/**/*.ts` to `files.includes`, with a relaxed override if needed, so test code follows the same conventions as `src/`.