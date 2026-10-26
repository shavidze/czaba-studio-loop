# CURRENT TASK — Round 1: T-0 Linux baseline (E2E launch, E2E fixture, auto-generated main fixtures, check.yml, plan doc)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-26

## Why this round
Round 0 was the bootstrap, so there is no earlier C result. This round delivers requirement **T-0** (backlog `TM-T0`, bugs `TM-B01`, `TM-B02`, `TM-B03`, plus `TM-T0-CI` and `TM-T0-DOC`). Until it is done, the gate's `verifyCommand` cannot pass on the runner. Every later round depends on it.

B checked these facts on this runner (ubuntu-24.04, HEAD `acefccc`):
- **TM-B01 (E2E cannot launch here):** `xvfb-run -a npx playwright test tests/e2e/app-launch.spec.ts --retries=0` fails with "Process failed to launch!". Electron by itself fails with `FATAL:setuid_sandbox_host.cc(163) The SUID sandbox helper binary was found, but is not configured correctly` (`chrome-sandbox` is not root-owned 4755, and `kernel.apparmor_restrict_unprivileged_userns = 1`). The same build starts with `--no-sandbox`. So on the runner the E2E result is currently **0/6**, not the 5/6 seen in root's container.
- **TM-B02 (E2E IPC write, "WAV file is missing data chunk"):** `node-taglib-sharp@6.0.1` `dist/riff/riffFile.js` `read()` loops `while (position + 8 < this.length)`. In the spec's 44-byte `createMinimalWav()`, the `data` header starts at byte 36, and `36 + 8 < 44` is false, so the empty `data` chunk is never parsed. Then `readProperties` throws. B's experiment: 0 samples gives the error; 1 sample and 100 samples write and read back fine. Verdict (D-05): a WAV with an empty data chunk is legal RIFF, so the library has a boundary bug. But the spec's fixture is not realistic, and we do not patch dependencies. **Fix the fixture in this round.** The library limitation is tracked separately as `TM-B05` (low).
- **TM-B03 (clean clone):** with `tests/fixtures/*.wav` missing, `npx vitest run --config vitest.config.main.ts` fails with `ENOENT … tests/fixtures/sample.wav` (`tests/main/metadata.test.ts:26`). No config generates the fixtures.

## Baseline
- HEAD `acefccc4022546893c38559042620791c70b3b21`; working tree clean. If HEAD differs or the tree is dirty in paths you don't own, stop and report.
- Frozen files (must stay byte-identical): everything under `src/**` (includes `src/preload/*`), `.github/workflows/release.yml`, `package.json`, `package-lock.json`, `playwright.config.ts`, `vitest.config.renderer.ts`, `electron.vite.config.ts`, `tsconfig*.json`, `biome.json`, `.claude/**`, `src/renderer/src/styles/app.css` (design tokens), `node_modules/**`.

## Scope
1. **Main-process fixtures are generated automatically (TM-B03).**
   - Add a Vitest `globalSetup` to `vitest.config.main.ts`. It creates `tests/fixtures/sample.wav` and `tests/fixtures/corrupt.wav` before the main tests run.
   - Refactor `tests/fixtures/create-fixtures.ts` to export a function, for example `createTestFixtures(targetDir: string): void`. Name it per `AGENT_DISCOVERABLE_CODE.md`.
   - **Constraint:** `npx --yes tsx@4 tests/fixtures/create-fixtures.ts` must still create both files in `tests/fixtures/` and print `Fixtures created successfully`, because the gate's `verifyCommand` runs exactly that command. Keep the top-level call, or guard it so it runs when the file is executed as a script.
   - **Trap:** `globalSetup` is loaded as ESM. Resolve paths with `fileURLToPath(new URL('.', import.meta.url))` or `import.meta.dirname` (Node 22). Do not rely on `__dirname` in the new file. tsx runs `create-fixtures.ts` as CJS (no `"type": "module"`), so the script path must keep working under both loaders.
   - Fixture bytes stay as they are now (44100-sample mono 16-bit sine; corrupt = `RIFF\0\0\0\0WAVEfmt `).
2. **E2E fixture has real audio (TM-B02).** In `tests/e2e/folder-workflow.spec.ts`, replace the empty-data `createMinimalWav()` with a valid WAV that has a non-empty `data` chunk (at least 0.1 s of PCM, with correct RIFF size and data size). Reusing the generator from `create-fixtures.ts` is allowed. Keep the existing test names and assertions unchanged.
3. **E2E launches on Linux (TM-B01).** Both specs pass `--no-sandbox` to `electron.launch` **only when `process.platform === 'linux'`**, so Windows and macOS dev runs are unchanged. A small shared helper `tests/e2e/electron-launch.ts` is allowed (for example `launchTagManagerApp()` or a `getElectronLaunchArgs()`). Change nothing else in the specs.
4. **CI workflow (TM-T0-CI).** New `.github/workflows/check.yml`:
   - Triggers: `push` + `pull_request`. Runner: `ubuntu-24.04`, Node 22 (`actions/setup-node` with npm cache). Set `permissions: contents: read`.
   - A fresh Actions runner may lack Electron's system libraries (libgbm, libnss3, libasound2…). A may add `npx playwright install-deps chromium` (apt only, no npm package).
   - Steps: `npm ci` → `sudo apt-get update && sudo apt-get install -y ffmpeg xvfb` → `npm run check` → `npm run build` → `xvfb-run -a npx playwright test --retries=0`.
   - Upload `playwright-report/` and `test-results/` as artifacts when the run fails.
   - Do not change `release.yml`, and do not add a `needs` link to it.
5. **Plan doc (TM-T0-DOC).** New `docs/plans/002-recording-tag-contract.md`, written in Georgian (rule `plan-to-docs.md`, primitive `GEORGIAN_DOCS.md`). It has the sections Status, Priority, Context, Approach, Key Files, Verification and covers T-0 → T-1 → T-2, with decisions D-01…D-05 copied from `feature-status.md`.

**Explicitly NOT in this round:**
- Any `src/**` change.
- Fixing the `tsc --noEmit` no-op (`TM-B04`, next round).
- The `category`/`ICAT` field (T-1).
- Changing `playwright.config.ts` `retries`.
- Patching `node-taglib-sharp`.
- Adding Biome coverage for `tests/`.
- Installing packages.

Read first: `.claude/primitives/TESTING.md`, `AGENT_DISCOVERABLE_CODE.md`, `GIT_RULES.md` (no commit), `GEORGIAN_DOCS.md`, and `.claude/rules/test-on-bugfix.md`. The failing tests already exist for B01 and B02 (the E2E specs) and for B03 (main tests with the fixtures deleted). Capture each red run before your fix, as the rule requires.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `vitest.config.main.ts` | add `globalSetup` only |
| `tests/main/global-setup.ts` (new) | calls the fixture generator |
| `tests/fixtures/create-fixtures.ts` | export the generator, keep the CLI behaviour |
| `tests/e2e/folder-workflow.spec.ts` | valid non-empty WAV fixture + Linux launch args |
| `tests/e2e/app-launch.spec.ts` | Linux launch args only |
| `tests/e2e/electron-launch.ts` (new, optional) | shared launch helper |
| `.github/workflows/check.yml` (new) | Linux CI gate |
| `docs/plans/002-recording-tag-contract.md` (new) | plan doc required by `plan-to-docs.md` |

Generated and ignored files (`tests/fixtures/*.wav`, `out/`, `test-results/`, `playwright-report/`) may appear. They must not be committed.

## Acceptance (C)
**Important for C:** `npm run check`'s `npx tsc --noEmit` currently type-checks **zero files**. The root `tsconfig.json` has `files: []` plus references and no `-b`, so `--listFiles` prints 0 lines, while `-p tsconfig.node.json` shows 10 errors, `web` 32 and `test` 31. A green `check` is **not** type-safety evidence. Do not report it as such (`TM-B04`).

| ID | Check | Evidence that means PASS |
|---|---|---|
| R1-1 (T0-1) | Simulated clean checkout: `rm -rf out test-results playwright-report tests/fixtures/*.wav`, then `npm run check` (do **not** run the tsx fixture script first). Do not run `git clean -xfd` or `npm ci`: agents do not reinstall `node_modules`. The real `npm ci` evidence comes from the first Actions run after publish (TM-T0-CI). | exit 0; Biome 0 errors; renderer 75/75 and main 30/30 (or more); `tests/fixtures/sample.wav` and `corrupt.wav` exist afterwards and were created by the globalSetup. Paste the log tail and `ls -l tests/fixtures`. |
| R1-2 (T0-2) | `npm run build && xvfb-run -a npx playwright test --retries=0 --reporter=list` | 2 spec files, 6/6 tests pass on the **first** attempt (no retry). Paste the list output. |
| R1-3 (T0-3 red proof B03) | Use a scratch copy of the config without the `globalSetup` line (e.g. `/tmp/vitest.main.nosetup.ts` with `root` set to the repo, run with `--config`). Do not edit A's file. Delete `tests/fixtures/*.wav`, run `npx vitest run --config vitest.config.main.ts`. | Red: ENOENT on `sample.wav`. Then with globalSetup back: green. |
| R1-4 (red proof B01) | Run the launch with the Linux arg removed (scratch copy of a spec, or plain `xvfb-run -a node_modules/.bin/electron out/main/index.js`) | Red: SUID sandbox FATAL. With A's change: launches (R1-2). |
| R1-5 (red proof B02) | In a scratch spec, use the old 44-byte `createMinimalWav()` with `writeMetadata` | Red: "WAV file is missing data chunk". A's fixture: green (R1-2). |
| R1-6 (CLI kept) | `rm tests/fixtures/*.wav; npx --yes tsx@4 tests/fixtures/create-fixtures.ts` | prints `Fixtures created successfully`; `sample.wav` is 88244 bytes (unchanged size); `corrupt.wav` exists. Also: the full `verifyCommand` exits 0. |
| R1-7 (check.yml) | Parse the YAML (e.g. `node -e` with `js-yaml` from `node_modules`, if present; otherwise a careful read). Then run its run-steps locally in order, except `npm ci` and `apt-get`. | Valid YAML. Triggers are push + pull_request, runner `ubuntu-24.04`, Node 22. Steps match Scope 4, including `--retries=0` and `xvfb-run`. Local run of the steps is green. Mark `realVerified=false` for the Actions run itself: TM-T0-CI stays open until root links a green Actions run. |
| R1-8 (T0-4 frozen) | `git status --short` and `git diff --stat` | Only paths from the ownership table, plus ignored generated files. `src/**`, `release.yml`, `package.json`, `package-lock.json`, `playwright.config.ts` are byte-identical. |
| R1-9 (real-app UI baseline) | Launch the built app with Playwright `_electron` under `xvfb-run` (`--no-sandbox`). Stub the folder dialog from the main process (`app.evaluate(({ dialog }, dir) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [dir] }); }, dir)`), using a temp folder with copies of `sample.wav`. Through the UI: open the folder, select a file, type a Title and a Comment, click Save. Then read the file with `music-metadata` (`parseFile`) and with `ffprobe -v error -show_entries format_tags -of json`. | Screenshots before and after Save in `c-round-1/`. Both readers show the typed `title` and `comment` (ASCII values). This is a **baseline observation of existing behaviour**: a defect not caused by A's diff becomes a new finding with repro steps and does not fail A's round. A regression caused by the diff fails the round. |
| R1-10 (plan doc) | Read `docs/plans/002-recording-tag-contract.md` | Georgian, with English technical terms. Has all six sections. Covers T-0/T-1/T-2 and D-01…D-05, consistent with `feature-status.md`. |

## What could break (C re-checks)
- Renderer Vitest config: it must not pick up the main globalSetup. Renderer stays 75/75.
- Existing main tests that copy `sample.wav` (`metadata.test.ts`) and `corrupt.wav` (if used): they must still find the files. The globalSetup must not delete fixtures while tests run.
- `npx tsx tests/fixtures/create-fixtures.ts`, which the gate uses (R1-6).
- `folder-workflow.spec.ts` "scan a folder" still finds exactly 2 WAVs.
- The E2E app-launch tests still check the title, dimensions, and `window.api` keys.
- Windows/macOS: launch args unchanged off Linux (code read of the condition).
- `release.yml` is still the only workflow that runs on a version bump; `check.yml` has no release or secrets permissions (`permissions: contents: read`).

## Next (orientation only)
Round 2: `TM-B04`, making `npm run check` really type-check (`tsc -b`/per-project `-p`, plus fixing the 10 node, 32 web and 31 test errors). This needs user confirmation that `package.json` `scripts.check` may change and that `src/preload/index.d.ts` may be included in the web project. After that, T-1 (`category` → INFO `ICAT`).
