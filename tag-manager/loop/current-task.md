# CURRENT TASK — Round 10: TM-B14 E2E first-window wait moves out of the 30 s test body into one shared launch helper (D-20, C-R9-02) + `check.yml` job timeout 40 (RR-R9-01) + remove a stale run-id sentence (RR-R9-02)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-26

## Why this round
- Round 9 (TM-T0-CI-FU, D-19): **C PASS** on R9-1…R9-8, realVerified=true for every local check. Root review COMMIT OK, published `499a6f3`. RR-R1-01, C-R4-01, RR-R4-02 and RR-R4-05 are closed. No critical or high bug is open.
- TM-T0-CI, TM-T0 and the Actions part of TM-T0-CI-FU close only when root links a green `Check` run. That run uses `--retries=0`. **C-R9-02** is the one known failure mode that can turn it red on a cold runner, and it needs no decision from Saba. Promoted to **TM-B14** (low).
- Root's round-9 review left two lows on the same CI files: RR-R9-01 (job budget) and RR-R9-02 (stale doc fact). Together these make three tightly related items: "the Check run stays green on a cold runner".

**Facts (confirmed, inferred and hypothesis kept separate, policy rule 8):**
- **Confirmed (A R9 `a-round-9/ci-replay-run1.log`):** this was the job's first Electron launch, cold, with 2 workers. `folder-workflow.spec.ts:27` failed with `electronApplication.firstWindow: Timeout 30000ms exceeded` **and** `Test timeout of 30000ms exceeded`. Test 7 in the **same file, on the same `app`**, then passed in 227 ms. So the window did appear, just late (between 30 s and about 37 s). It was not missing.
- **Confirmed:** it does not reproduce warm (C ×3, B ×4, first window in about 0.7 s), with a fresh `HOME`/`XDG_*`, or after `drop_caches` (B ×3, worst 2.7 s).
- **Confirmed:** `playwright.config.ts` has `retries: 1`, so the local `verifyCommand` hides a first-attempt failure. `check.yml` runs `--retries=0`. Actions run `40331357825` (E2E 8 s) is one data point showing a GitHub cold start once fitting in 30 s.
- **Confirmed (code):** every spec calls `app.firstWindow()` **inside a test body**. A test body is bounded by the 30 s per-test timeout, so raising only the `firstWindow` timeout cannot help. The wait has to move into `beforeAll`, with the hook's timeout raised there.
- **Confirmed (B experiment, `/tmp/b-r9`):** Electron main **ignores** `NODE_OPTIONS=--require`. Putting `'-r', '<absolute file>'` **before** the entry path in `electron.launch` `args` does run the module first. A module that delays `app.whenReady()` by 5 s made the first window appear at 5.46 s, and `firstWindow({ timeout: 2000 })` failed with 0 windows. This is a deterministic stand-in for a slow cold start.
- **Hypothesis only:** the cause is first-launch cache building (fontconfig, shader cache). Do not write a cause into code or docs.

## Baseline
- HEAD `499a6f3c8867ed7e9356371df9e83713b652265a`, working tree clean. If HEAD differs, or the tree is dirty in paths you don't own, stop and report.
- Frozen files: everything not listed under File ownership. They must stay byte-identical. In particular:
  - all of `src/**`;
  - every `tests/**` file except the four owned E2E files (in particular `tests/fixtures/**`, `tests/main/**`, `tests/renderer/**`, `tests/contract/**`);
  - `playwright.config.ts`. Keep `retries: 1` and `timeout: 30000`; **retries are not the fix**, because TM-T0 acceptance is `--retries=0`;
  - `.github/scripts/apt-install.sh`, `.github/workflows/release.yml` (protected);
  - `package.json`, `package-lock.json` (protected), every `tsconfig*.json`, `biome.json`, `vitest.config.*.ts`, `electron.vite.config.ts`;
  - `.claude/**`;
  - every `docs/**` file except `docs/ci-cd.md`.

## Step 0 for A: one cold sample, before any edit
Your very first Electron-launching command in this job must be this, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`, then `npx --yes tsx@4 tests/fixtures/create-fixtures.ts`):
`/usr/bin/time -v xvfb-run -a npm run test:e2e -- --retries=0 --reporter=list`
- Save the output to `a-round-10/cold-sample.log` with the per-test times, and copy `test-results/` to `a-round-10/cold-sample-test-results/`.
- State in your report whether this was really the job's first Electron launch. If anything launched Electron earlier in this job, call the sample warm.
- This is data, not a gate. Either result is fine; it is the only real cold sample this round can get.

## Scope (D-20, B, technical, reversible)
1. **`tests/e2e/electron-launch.ts`.** Follow `AGENT_DISCOVERABLE_CODE.md` naming.
   - Keep `getElectronLaunchArgs(mainEntryPath: string): string[]`:
     - D-06 is unchanged: `--no-sandbox` only on `process.platform === 'linux'`.
     - New: if `process.env.TAG_MANAGER_E2E_ELECTRON_REQUIRE` is set and non-empty, insert `'-r', <value>` directly **before** `mainEntryPath`.
     - The value must be an absolute path to an existing file. Otherwise throw `Error` with a message that names the variable. Never ignore it silently.
     - With the variable unset, the result is exactly what it is today.
   - Export constants:
     - `FIRST_WINDOW_TIMEOUT_MS = 60000`: the **total** budget from the start of `electron.launch` to the first window. Launch and `firstWindow` share it.
     - `LAUNCH_HOOK_TIMEOUT_MS = 90000`;
     - `ELECTRON_REQUIRE_ENV = 'TAG_MANAGER_E2E_ELECTRON_REQUIRE'`, used by `getElectronLaunchArgs`.
   - Export `launchTagManagerApp(options?: { env?: Record<string, string | undefined> }): Promise<{ app: ElectronApplication; page: Page }>`. It:
     - launches `out/main/index.js` (path resolved from this file, as the specs do today) with `getElectronLaunchArgs` and env `{ ...process.env, NODE_ENV: 'production', ...options.env }`;
     - waits for the first window within whatever is left of `FIRST_WINDOW_TIMEOUT_MS`, then `waitForLoadState('domcontentloaded')`;
     - collects the main process's stdout/stderr (`app.process()`) while it waits.
   - On a first-window timeout it closes the app (no orphan Electron) and throws `Error` whose message contains:
     - `first window did not appear within 60000 ms`;
     - the elapsed ms;
     - the last ≤ 4000 characters of the captured main-process output.
   - TypeScript strict, no `any`, no comments, semicolons. The file must pass `tsc -p tsconfig.test.json`.
2. **The three specs**: `app-launch.spec.ts`, `folder-workflow.spec.ts`, `recording-tag-contract.spec.ts`.
   - In `beforeAll`:
     - first `test.setTimeout(LAUNCH_HOOK_TIMEOUT_MS)`;
     - then the existing temp-dir setup;
     - then `({ app, page } = await launchTagManagerApp(...))`.
   - `recording-tag-contract.spec.ts` passes its `XDG_CONFIG_HOME` through `options.env`.
   - Test bodies use the stored `page`. **No `firstWindow` call remains in any spec.**
   - `afterAll` must not hide the real error when launch failed: `await app?.close()`, and temp dirs are still removed.
   - The same 7 tests with the same names and the same assertions. Nothing is skipped or removed.
3. **`.github/workflows/check.yml`.** Only the job-level `timeout-minutes: 30` → `40` (RR-R9-01). The setup steps alone can use 13 + 10 = 23 min. Nothing else changes.
4. **`docs/ci-cd.md`, Georgian with English technical terms.**
   - Line 186: `timeout-minutes: 40`, with one sentence on why (23 min of setup budget plus room for check and E2E).
   - Line 239: delete the sentence `Actions run 40331357825-ში apt ნაბიჯმა 19 წამი დაიკავა.` (RR-R9-02). The rest of that paragraph stays.
   - A new subsection inside `## Check workflow (check.yml)`, for example `### E2E launch budget`. It covers:
     - the first window is awaited in `beforeAll` through `launchTagManagerApp` (60 s total, 90 s hook), not in the 30 s test body;
     - why retries are not the fix (`--retries=0` in CI);
     - the error text on timeout;
     - `TAG_MANAGER_E2E_ELECTRON_REQUIRE`: test-only, an absolute path, put before the entry as `-r`, unset in CI. Include a 3-line example of a delay module (`app.whenReady` + `setTimeout`) as a code block. A code block in docs is fine.
   - Release sections stay unchanged.

**Red/green (A, outside the repository, in `a-round-10/`):**
- Injector `a-round-10/delay-window.cjs`: patch `app.whenReady` to resolve after `Number(process.env.E2E_WINDOW_DELAY_MS)` ms.
- **Red:** `git archive 499a6f3 | tar -x -C /tmp/a-r10-old`, symlink `node_modules`, and change **only** `getElectronLaunchArgs` there to insert `-r <injector>`. Build, then run with `E2E_WINDOW_DELAY_MS=40000 xvfb-run -a npx playwright test --retries=0 --reporter=list`. Expected: at least one test in each of the 3 spec files fails with `firstWindow: Timeout 30000ms` / `Test timeout of 30000ms`. Save `a-round-10/red-before.log`.
- **Green:** the repo working tree, with `TAG_MANAGER_E2E_ELECTRON_REQUIRE=<injector> E2E_WINDOW_DELAY_MS=40000` and the same command. Expected: 7/7. Save `a-round-10/green-after.log`.
- **Over budget:** delay 75000. Every spec fails in `beforeAll` within ≤ 90 s with the 60000 ms message. After the run, `pgrep -f out/main/index.js` is empty. Save `a-round-10/over-budget.log`.
- No injector file goes into the repository.

**Explicitly NOT in this round:**
- `playwright.config.ts` (retries, timeouts, workers).
- Any `src/**` change, for example window creation or `show: false`.
- Finding the cold-start cause.
- The apt script (RR-R9-03, RR-R9-04, A-R9-01 stay signals).
- SHA pinning (RR-R1-03).
- TM-B06 (linting `tests/`).
- Package installs.

Read first:
- `.claude/primitives/TESTING.md`, `AGENT_DISCOVERABLE_CODE.md`, `TYPESCRIPT_STRICT.md`, `SEMICOLONS.md`, `GEORGIAN_DOCS.md`, `GIT_RULES.md` (no commits);
- `.claude/rules/test-on-bugfix.md`: the red run above is the failing reproduction;
- `a-round-9/ci-replay-run1.log` (the original failure).

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `tests/e2e/electron-launch.ts` | D-20: `launchTagManagerApp`, budget constants, opt-in `-r` injector |
| `tests/e2e/app-launch.spec.ts` | wait for the first window in `beforeAll` through the helper |
| `tests/e2e/folder-workflow.spec.ts` | same (this is where C-R9-02 failed) |
| `tests/e2e/recording-tag-contract.spec.ts` | same; keeps its own `XDG_CONFIG_HOME` |
| `.github/workflows/check.yml` | job `timeout-minutes` 30 → 40 (RR-R9-01) |
| `docs/ci-cd.md` | job timeout line, remove the stale sentence (RR-R9-02), Georgian E2E launch budget subsection |

Generated or ignored output (`tests/fixtures/*.wav`, `out/`, `test-results/`, `playwright-report/`) is not committed. Injectors, logs and temp copies go to `a-round-10/` or `/tmp`.

## Acceptance (C)
C uses its **own** injector (for example `c-round-10/delay-window.cjs`) and runs mutations in a **temp copy** of the tree (`/tmp/c-r10-*`, `node_modules` symlinked), never in the repository.

| ID | Check | Evidence that means PASS |
|---|---|---|
| R10-1 static + ownership | `git status --porcelain --untracked-files=all`; `git diff --quiet 499a6f3 -- . ':!tests/e2e/electron-launch.ts' ':!tests/e2e/app-launch.spec.ts' ':!tests/e2e/folder-workflow.spec.ts' ':!tests/e2e/recording-tag-contract.spec.ts' ':!.github/workflows/check.yml' ':!docs/ci-cd.md'`; `grep -n firstWindow tests/e2e/*.spec.ts`; `grep -nE '^\s*/[/*]' <owned .ts files>`; `npx tsc --noEmit -p tsconfig.test.json`; js-yaml parse + `git diff 499a6f3 -- .github/workflows/check.yml` | Only owned paths changed. `playwright.config.ts` is byte-identical. No `firstWindow` in any spec. No comment lines. tsc reports 0 errors. The `check.yml` diff is exactly `timeout-minutes: 30` → `40` at job level. |
| R10-2 red on old code | C's own `git archive 499a6f3` copy; only `getElectronLaunchArgs` patched to add `-r <C injector>`; delay 40000; `xvfb-run -a npx playwright test --retries=0 --reporter=list` | At least one failure per spec file (3 files) with `firstWindow: Timeout 30000ms` or `Test timeout of 30000ms`. This reproduces C-R9-02's signature. |
| R10-3 green with the same delay | Repo tree, `TAG_MANAGER_E2E_ELECTRON_REQUIRE=<C injector>`, delay 40000, same command; run twice | 7/7 both times, rc 0, no retry lines. Record the wall time. |
| R10-4 over budget + mutations | (a) delay 75000 on the repo tree.<br>(b) Mutation in a temp copy: remove `test.setTimeout(LAUNCH_HOOK_TIMEOUT_MS)` from one spec, delay 40000.<br>(c) Mutation: move that spec's wait back into a test body (`app.firstWindow()` in the test), delay 40000. | (a) Every spec fails in `beforeAll` within ≤ 90 s of its start. The error contains `first window did not appear within 60000 ms` and an elapsed value. The run exits by itself. Afterwards `pgrep -f out/main/index.js` is empty.<br>(b) That spec fails on the 30 s hook timeout.<br>(c) That spec fails on the 30 s test timeout. Both mutations are caught. |
| R10-5 injector contract | With `npx --yes tsx@4` one-liners importing `tests/e2e/electron-launch.ts`: env unset; env = relative path; env = a missing absolute path; env = an existing file | Unset → `['--no-sandbox', <entry>]` exactly (D-06). Relative or missing → throws, and the message names `TAG_MANAGER_E2E_ELECTRON_REQUIRE`; no Electron process starts. Existing → `['--no-sandbox', '-r', <file>, <entry>]`. |
| R10-6 gate + CI replay | Clean state, then the full `verifyCommand`. Then `xvfb-run -a npx playwright test --retries=0` 3 times. Then the R9-5 CI-order replay of `check.yml` (`js-yaml`, YAML order, `bash --noprofile --norc -eo pipefail`, `CI=true`, skip `npm ci` and the `if: failure()` upload, clean state first). | Exit 0. Biome 0 errors (9 warnings, as on `499a6f3`). Typecheck node/web/test 0. Renderer **107/107**, main **62/62**, E2E **7/7**. `--retries=0` 7/7 ×3. Replay: every step exits 0, with step times recorded; `playwright-report/index.html` exists; the ffprobe step passes before E2E. The un-delayed E2E wall time stays about where it was (R9: 5.9 s for the step). |
| R10-7 real-app smoke | As R9-7: built app, `_electron`, `xvfb-run -a`, `--no-sandbox`, clean `XDG_CONFIG_HOME`, dialog stubbed to a temp folder with a `sample.wav` copy. Open Folder, select the row, set Category `DOORWood`, Save, Rescan. | `Tags saved`. ffprobe shows `ICAT=DOORWood`, music-metadata agrees, and the row is `Tagged`. Screenshots `c-round-10/r10-7-*.png`. |
| R10-8 docs | Read `git diff 499a6f3 -- docs/ci-cd.md`; `grep -n 40331357825 docs/ci-cd.md` | Georgian. Job timeout 40 with the reason. The stale sentence is gone (grep is empty). The new subsection covers every point from Scope 4, and its numbers (60000, 90000, 30000, 40) match the code and `check.yml`. Release sections are unchanged. |

**What realVerified means here:**
- R10-1…R10-8 are real local checks, and the injector makes the slow-window case deterministic. C may report realVerified=true for them.
- "Green on a cold GitHub runner" is a separate thing. It stays with TM-T0-CI until root links a `Check` run on the round-10 commit or later. C must not claim it.
- A's Step 0 cold sample is data. If it reproduces the failure, report it as such. If it passes, that proves nothing either way.
- Windows packaging is not part of this round.

## What could break (C re-checks)
- **D-06:** with the injector unset, launch args are unchanged (R10-5). Windows and macOS still get no `--no-sandbox`. This is checked by reading the code; there is no runner for those systems.
- **`recording-tag-contract.spec.ts` isolation:** it must still use its own `XDG_CONFIG_HOME`, so its clean schema does not touch the user's config (R10-6; T1-7 still passes).
- **The ffprobe step:** its input comes from vitest (`npm run check`), not E2E. It must still pass before E2E in the replay (R10-6).
- **Cleanup:** temp dirs are removed in `afterAll` even after a launch failure, and no orphan Electron is left (R10-4 a).
- **Normal-speed E2E:** same 7 tests, about the same wall time (R10-6). The `playwright-report` upload path (TM-B07) is unchanged.
- **App behaviour:** not touched. The R10-6 gate and the R10-7 smoke confirm it.

## Next (orientation only)
1. Root links a `Check` Actions run on `499a6f3` or later. If it is green, TM-T0-CI, TM-T0 and the Actions part of TM-T0-CI-FU close; if the same commit's run is also green for this round, the Actions part of TM-B14 closes too. A red `firstWindow` run there is a real TM-B14 sample.
2. Low items with no decision needed, candidates for round 11:
   - C-R8-01: a failed batch save leaves "Multiple values" in the panel. Reproduce it first;
   - RR-R5-02: renderer `typeof` guard in `file-row-display.ts`;
   - RR-R1-04/RR-R1-05: `create-fixtures.ts`.
3. The Saba question batch is unchanged:
   - D-07 (TM-T1-MIG);
   - D-10 plus TM-B11;
   - D-12/TM-B08 plus B-R6-01;
   - TM-T1-DUP (RR-R3-01);
   - D-15 plus RR-R5-01;
   - B-R7-02/RR-R8-04 (schema validation at load);
   - TM-B05, TM-B06, RR-R1-07, RR-R3-05;
   - TM-T2-DATA. T-2 stays BLOCKED until it arrives.
