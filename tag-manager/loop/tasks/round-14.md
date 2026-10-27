# CURRENT TASK — Round 14: TM-B17 — fixture generator hygiene: temp-file cleanup on failure (RR-R1-05), CLI guard for .mts/.js copies (RR-R1-04), TESTING.md fixtures section (C-R1-03) — D-23

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- Round 13 result:
  - **C PASS**, realVerified=true (R13-1…R13-6), 0 bugs. The real app with `chmod 000` keeps the `Tagged` badge, and the red reference was seen on `c3bd412`.
  - Root published `a652f06` with review COMMIT OK. TM-B16/D-22 is done.
  - No critical or high bug is open.
- Three low findings, open since round 1, all in the same fixture generator and its documentation. None needs a user decision. B reproduced all three at round-13 close (`b-round-13-exp-tmp-leak.mts.txt`):
  - **RR-R1-05:** `writeFixtureFileAtomically` writes `${filePath}.${pid}.tmp` and then renames it. If the write or the rename throws, the temp file stays behind. `*.tmp` is also not gitignored.
    - **Repro:** target dir in which `sample.wav` is a non-empty *directory* → `createWavTestFixtures` throws `EISDIR`, and `readdir` = `[sample.wav, sample.wav.<pid>.tmp]`.
  - **RR-R1-04:** the CLI guard regex `/(^|[\\/])create-fixtures\.ts$/` matches only `.ts`.
    - **Repro:** `npx --yes tsx@4 /tmp/b-r13/m/create-fixtures.mts` (a copy) → exit 0, nothing created, no message.
  - **C-R1-03:** `.claude/primitives/TESTING.md:124-129` says "CI-ში `create-fixtures.ts` უნდა გაეშვას ტესტებამდე". That is not what happens:
    - main tests get the fixtures from Vitest `globalSetup` (`tests/main/global-setup.ts` → `createWavTestFixtures`);
    - the E2E specs build their own WAVs with `createSineWavBuffer`;
    - only the loop's `verifyCommand` runs the CLI;
    - `.github/workflows/check.yml` does not run it.
- These are three tightly related items: one file, its ignore rule, and its documentation.

## Baseline
- HEAD `a652f06e0afe16455f7370249be6c037fada902f`. The working tree must be **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
- Frozen (byte-identical to `a652f06`): everything not in the ownership table. In particular:
  - `tests/main/global-setup.ts`, `tests/main/riff-chunks.ts`, `tests/e2e/**`. They import `createSineWavBuffer` / `createWavTestFixtures`; names, signatures and output bytes must not change.
  - `vitest.config.*.ts`, `playwright.config.ts`, `biome.json`, the tsconfigs, `.github/**`.
  - `src/**` in full. This round touches no application code.
  - `docs/**`, except the single sentence named below in `docs/plans/002-recording-tag-contract.md`.
  - `.claude/**`, except `.claude/primitives/TESTING.md`. `.claude/primitives-map.json` stays unchanged.
- Protected (never edit):
  - `src/preload/index.ts`, `src/preload/index.d.ts`;
  - `src/renderer/src/styles/app.css`;
  - `package.json`, `package-lock.json`;
  - `.github/workflows/release.yml`;
  - `.claude/settings*`, `.claude/hooks/**`.

## Scope (D-23, see `feature-status.md`)
Steps 1–2 follow the repo's `test-on-bugfix` rule: write the failing test first, then the fix. Read `TESTING.md`, `TYPESCRIPT_STRICT.md` and `AGENT_DISCOVERABLE_CODE.md` before editing; the hook injects them anyway.

1. **Red test first:** new file `tests/main/create-fixtures.test.ts`. It runs in the main Vitest project; `include: tests/main/**/*.test.ts` picks it up with no config change.
   - Use a fresh `mkdtempSync(join(os.tmpdir(), …))` directory per test, removed in `afterEach`. **Never write into `tests/fixtures/`**, because `globalSetup` and other tests use it.
   - **(a) temp cleanup, rename fails:**
     - Make `<dir>/sample.wav` a directory with one file inside.
     - `createWavTestFixtures(dir)` must throw.
     - Afterwards `readdirSync(dir)` has no entry ending in `.tmp`.
     - The `sample.wav` directory and its file are still there: the final path is never removed.
   - **(b) temp cleanup, write fails:** use any real, non-mocked way to make `writeFileSync` of the temp file throw after A checks that it is reachable. If none is deterministic on Linux as a non-root user, write that in `a-round-14.md` and skip (b). (a) is mandatory.
   - **(c) CLI predicate:** import the new export `isCreateFixturesCliEntry(scriptPath: string): boolean`.
     - True for `create-fixtures.ts`, `.mts`, `.cts`, `.js`, `.mjs` and `.cjs`, each with a POSIX directory (`/a/b/create-fixtures.mts`) and a Windows one (`C:\\a\\b\\create-fixtures.js`), and also the bare name.
     - False for `my-create-fixtures.ts`, `create-fixtures.test.ts`, `create-fixtures.tsx`, `create-fixtures.json` and `''`.
   - **(d) generator output pin:** `createWavTestFixtures(dir)` on an empty dir creates exactly `sample.wav` (88244 bytes) and `corrupt.wav`, with no other entries. The sha256 of each equals the constants A records from `a652f06`. Compute them **before** editing the generator and write them in `a-round-14.md`.
   - Run the file on `a652f06` before the fix and record the run in `a-round-14/`:
     - (a) must fail on the `.tmp` assertion, and (b) too if it exists;
     - (c) fails because the export is missing;
     - (d) passes.
2. **Fix in `tests/fixtures/create-fixtures.ts` only:**
   - `writeFixtureFileAtomically`: if `writeFileSync` or `renameSync` throws, remove the temp path (`rmSync(tempPath, { force: true })`) and rethrow the **original** error.
     - If the cleanup itself throws, the original error still wins.
     - Never touch `filePath`.
   - Add `export function isCreateFixturesCliEntry(scriptPath: string): boolean` with `/(^|[\\/])create-fixtures\.[cm]?[jt]s$/`. The CLI block uses it. The block's behaviour is otherwise unchanged:
     - it creates the fixtures in `dirname(resolve(scriptPath))`;
     - it prints `Fixtures created successfully`;
     - nothing is written on import.
   - `createSineWavBuffer` and `createWavTestFixtures`: names, signatures and bytes unchanged. No comments in code. Keep the file's existing quote style.
3. **`.gitignore`:** add one line `tests/fixtures/*.tmp` in the `# Test` block. No other change.
4. **Docs (Georgian text, English technical terms):**
   - **`.claude/primitives/TESTING.md`, `## Fixture-ების გენერაცია` section only.**
     - Describe the real flow:
       - main tests: Vitest `globalSetup` (`tests/main/global-setup.ts`) creates `sample.wav` and `corrupt.wav` before the run, so no manual step is needed;
       - E2E specs build their WAVs with `createSineWavBuffer`;
       - the CLI `npx --yes tsx@4 tests/fixtures/create-fixtures.ts` is for manual or `verifyCommand` use and prints `Fixtures created successfully`;
       - the generated files and `*.tmp` are gitignored.
     - Remove the sentence that CI must run the script before the tests.
     - Line 12 (`create-fixtures.ts  # გენერატორი: sample.wav, corrupt.wav`) may stay as it is.
     - Make this edit with the **Edit tool**: path (b), standing permission. **Do not** write to `.claude/**` through Bash. If the Edit is refused, stop and report BLOCKED for this item only.
   - **`docs/plans/002-recording-tag-contract.md:23`, that one sentence only.** "CLI ნაწილი მხოლოდ მაშინ ეშვება, როცა `process.argv[1]` `create-fixtures.ts`-ით მთავრდება" becomes a statement that the CLI runs when `isCreateFixturesCliEntry(process.argv[1])` is true (`create-fixtures.{ts,mts,cts,js,mjs,cjs}`), and that the temp file is removed on failure (D-23). The rest of the file is unchanged.
5. **`a-round-14.md`** (Georgian). A writes it with:
   - the sha256 constants and how they were computed;
   - the red/green logs;
   - the diff summary;
   - the full `verifyCommand` result;
   - the code-reviewer result. 3+ files change, so A runs `code-reviewer`, per the read-primitives rule.

**Explicitly NOT in this round:**
- RR-R13-03 (re-read rejection after a successful batch write), RR-R5-02 (`file-row-display.ts` guard), RR-R10-01/02 + A-R10-01 (E2E launch helper polish). These are the next small rounds.
- RR-R13-01/02: they need `src/preload/index.d.ts`, which is protected, so they wait on the user.
- TM-B06 (lint `tests/`, quote style): waits on Saba.
- Any change to `check.yml`. TM-T0-CI waits for root's Actions link.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `tests/fixtures/create-fixtures.ts` | D-23: temp cleanup + exported CLI predicate (RR-R1-05, RR-R1-04) |
| `tests/main/create-fixtures.test.ts` (new) | red/green tests (a)–(d) |
| `.gitignore` | one line `tests/fixtures/*.tmp` (RR-R1-05, "not gitignored") |
| `.claude/primitives/TESTING.md` | `## Fixture-ების გენერაცია` section only (C-R1-03), Edit tool |
| `docs/plans/002-recording-tag-contract.md` | line 23 CLI-guard sentence only |

Logs go to `a-round-14/` (A) and `c-round-14/` (C) in the loop folder.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R14-1 ownership | `git status --porcelain --untracked-files=all`; `git diff --stat a652f06`; `git diff --quiet a652f06 -- . ':!<5 owned paths>'` | Only the 5 owned paths differ, and the only untracked file is the new test. The `TESTING.md` diff is limited to the fixtures section. The `002-…md` diff is limited to line 23. The `.gitignore` diff is +1 line. `.claude/primitives-map.json` and `.claude/settings*` are unchanged. A's result shows `permission_denials` empty. If the `.claude` Edit was refused, C's `taskStatus` is **BLOCKED**: C keeps all other evidence and root does not publish a partial round. |
| R14-2 red/green | `git worktree add /tmp/c-r14-old a652f06`, with `node_modules` symlinked. Never use `git stash` and never touch A's tree. Copy the new test file into the worktree and run `npx vitest run -c vitest.config.main.ts tests/main/create-fixtures.test.ts`, then run it on A's tree. | Old code: (a) fails on the `.tmp` assertion (and (b) if A wrote it), (c) fails because the export is missing, (d) passes. New code: all pass. |
| R14-3 mutations | In a copy of the fixed tree, run the test file against each mutant: **M1** drop the cleanup; **M2** remove `filePath` instead of `tempPath` in the cleanup; **M3** revert the regex to `\.ts$`; **M4** cleanup swallows the error (no rethrow). | M1 is killed by (a). M2 is killed by (a), because the `sample.wav` directory must survive (or the test shows that rm on a directory without `recursive` throws; report which). M3 is killed by (c). M4 is killed by (a), which asserts the throw. |
| R14-4 generator bytes + real CLI | (i) In the old worktree and in A's tree, run `npx --yes tsx@4 tests/fixtures/create-fixtures.ts` and compare `sha256sum tests/fixtures/sample.wav tests/fixtures/corrupt.wav`. (ii) Copy the fixed file to `/tmp/c-r14-cli/create-fixtures.mts` and run `tsx@4` on it; do the same with the old file (red). (iii) Repeat B's EISDIR repro with the fixed code through a small `.mts` driver: `ls` shows no `*.tmp`. (iv) `git check-ignore -v tests/fixtures/x.123.tmp` | (i) Both runs print `Fixtures created successfully` and both sha256 pairs are identical; `sample.wav` = 88244 bytes. (ii) The fixed copy prints the message and creates both files; the old copy exits 0 and creates nothing. (iii) It throws `EISDIR` and leaves no `.tmp`. (iv) It matches the new `.gitignore` line. |
| R14-5 gate | Clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Biome: 0 errors and 9 warnings, as on `a652f06`. Typecheck 0, which includes `tsconfig.test.json` on the new test. Renderer **116/116**. Main **62 + new** (report the exact count). E2E **7/7**, and **7/7** with `--retries=0`. After the run `tests/fixtures/` contains no `*.tmp`. |
| R14-6 real app smoke | Built app under `xvfb-run` with Playwright `_electron`. Copy the **newly generated** `tests/fixtures/sample.wav` to a temp folder, scan it, select it, type Category `R14Cat` and Save. Read the file with `ffprobe -show_entries format_tags -of json` and with `music-metadata`, and take a screenshot. | Toast `Tags saved`; the row shows `Tagged`; ffprobe and music-metadata both give `ICAT=R14Cat`. This round changes no app code: R14-6 is a regression smoke that the generated fixture is still a valid, taggable WAV, not the round's main evidence. |
| R14-7 docs | Read the `TESTING.md`, `002-…md:23` and `.gitignore` diffs against the code and `vitest.config.main.ts` | Each describes the real flow: globalSetup for main, `createSineWavBuffer` in E2E, CLI for manual and `verifyCommand` use, `*.tmp` ignored, CI does not need a separate step. Georgian text. No other section changed. |

## What could break (C re-checks)
- **Main tests and `globalSetup`:**
  - `globalSetup` imports the generator, so a bad top-level change (for example the CLI block running on import) would write files or crash before every main test.
  - R14-5 covers this. Also check that importing the module in the new test does not create files in `tests/fixtures/` by itself.
- **E2E specs and `riff-chunks.ts`** import `createSineWavBuffer`. The output must be byte-identical (R14-4 (i), and the E2E 7/7).
- **`verifyCommand`'s first step** (`npx --yes tsx@4 tests/fixtures/create-fixtures.ts`) must still print the message and exit 0 (R14-4 (i)).
- **Windows paths:** the predicate keeps `[\\/]` (test (c)).

## What realVerified means here
- R14-1…R14-5 and R14-7 are real local checks: real filesystem errors and real CLI runs, with no mocks.
- R14-6 is the real Electron UI with independent readers. Its role is a regression smoke, because the round changes test tooling only and no user-visible behaviour.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
1. **RR-R13-03** (renderer only): wrap the batch re-read in its own `try`. If it rejects after a successful write, still show `N saved` and keep the store entries. Its own small round.
2. **RR-R5-02** (`file-row-display.ts` `typeof` guard) and **RR-R10-01/02 + A-R10-01** (E2E launch helper messages). One more small round each, or paired if they turn out to be tightly related.
3. **Root:** please link the `Check` Actions run on `a652f06`, or on any commit since `35ed18b`. A green run closes TM-T0-CI, TM-T0, TM-T0-CI-FU and the Actions part of TM-B14.
4. **Saba question batch:** every other backlog item waits on it.
   - D-07 (TM-T1-MIG);
   - D-10 + TM-B11;
   - D-12/TM-B08 + B-R6-01;
   - TM-T1-DUP (RR-R3-01, medium);
   - D-15 + RR-R5-01;
   - B-R7-02/RR-R8-04;
   - TM-B05;
   - TM-B06;
   - RR-R1-07;
   - RR-R3-05;
   - TM-T2-DATA;
   - RR-R13-01/02 (protected preload types);
   - optional RR-R12-02.
