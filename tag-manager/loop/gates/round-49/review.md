COMMIT: OK

This round adds `tests/` to Biome linting and reformats the test files to match. I found no changes to runtime code or to test logic, and nothing that blocks the commit.

**Evidence**
- **What changed:** `package.json` now runs `lint`, `lint:fix` and `check` over `src/ tests/`. `biome.json` adds the `tests/**` patterns, plus an override so test files keep double quotes. `BIOME_LINTING.md` documents both. The other 37 files are Biome formatting output only: line wrapping, import ordering, extra parentheses around `(await x) as T`, and two duplicate `import type` lines merged into one.
- **Removed imports were unused:** `vi` in `tests/main/file-system.test.ts` and `readdirSync`/`writeFileSync` in `tests/main/templates.test.ts`. A grep finds no remaining references to them in either file.
- **Import reordering is safe:** none of the reordered blocks contains a side-effect-only import. `vi.mock` is hoisted regardless of import order, so the moves can't change mock setup.
- **Tests really are linted now:** `verify.log` shows "Checked 85 files". That equals 34 tracked `src` files plus 51 `tests` files, so the new globs are picked up. All 8 warnings are in `src/`, none in `tests/`, and Biome applied no fixes, so the files are already formatted.
- **Verify run:** typecheck passed, renderer 326/326, main 135/135, E2E 7/7 after a fresh build.
- **Security, runtime, IPC and performance:** nothing applicable. No `src/` file changes.

**Findings**
- **Critical / High:** none.
- **Medium:** none.
- **Low:**
  1. `biome.json` overrides: tests use double quotes while `src` uses single quotes. It's documented in `BIOME_LINTING.md` (D-52), but the codebase now has two quote styles. Fix: plan a separate `biome check --write tests/` to move tests to single quotes, then drop the override.
  2. Several changed test files still use non-null assertions, e.g. `entry!.name` in `tests/main/file-system.test.ts`. Biome raised no warning for them, so `noNonNullAssertion` seems to be off or doesn't cover tests. That conflicts with the strict-TypeScript rule in `TYPESCRIPT_STRICT.md`. Fix: decide explicitly whether tests are exempt, and say so in the primitive.
  3. Eight a11y warnings already in `src/`, now visible in every `npm run check`:
     - `useKeyWithClickEvents`: `FileList.tsx:82`, `AudioPlayer.tsx:138`, `FolderBrowser.tsx:253`
     - `noLabelWithoutControl`: `TagsInput.tsx:45`, `TemplatePicker.tsx:195`, `input.tsx:13`, `select.tsx:13`
     - extra `toastKey` dependency: `toast.tsx:16`

     None of them come from this diff. Fix: add them to the backlog; the click-only `div`s are real keyboard-accessibility gaps.

**Architecture note (proposal only)**
The same `getHandler(channel)` helper, which reaches into `ipcMain._handlers`, is copied into about 10 files under `tests/main/` and was reformatted in each one this round. Moving it into one shared helper (e.g. `tests/main/helpers/ipc-handlers.ts`) would remove the duplication. It would also leave a single place to update if Electron changes that private field. Separately, now that tests are linted, making warnings fail the lint step (a `--diagnostic-level`/`--error-on-warnings`-style option) would stop new a11y warnings from piling up. That should wait until the eight existing ones are fixed.