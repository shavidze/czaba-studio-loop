# CURRENT TASK — Round 16: TM-B19 — E2E launch helper reports which phase failed, keeps the original error as `cause`, and waits for the killed Electron to exit (RR-R10-01, RR-R10-02, RR-R10-04 + A-R10-01 tests) — D-25

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 15 result:** C PASS, realVerified=true (R15-1…R15-7), 0 bugs. Every mutant (M1s, M1b, M2–M5) was killed. The real app with an injected IPC rejection showed the exact D-24 toasts. Root published `5854d45` with review COMMIT OK. TM-B18 and D-24 are done.
- No critical or high bug is open. Most of the rest of the backlog waits on Saba (see Next). Two unblocked lows were left: this one and RR-R5-02.
- **Why this one first:**
  - B's experiments (`b-round-15.md` E1–E6) show that every failure path in this item can be reached on the real built app, so C can check each one for real.
  - RR-R5-02 (a null array element in `file-row-display.ts`) cannot be reached from the real app today. Main maps every value through `getValuesAsStrings`/`stripRiffNulTerminator`, so that fix could only be checked with unit tests. It stays next, and its acceptance will say so honestly.
- **Defects, all in `tests/e2e/electron-launch.ts`, all verified on the `5854d45` build:**
  - **RR-R10-02:** if `electron.launch` itself times out (the main process is blocked before Playwright connects), the helper still reports `first window did not appear within 60000 ms`.
    - B E1 shows Playwright's error is `electron.launch: Timeout …ms exceeded.` (`TimeoutError`, no app object yet).
    - A non-timeout launch failure (E2, `process.exit(3)` → `electron.launch: Process failed to launch!`) is reported as `first window failed before 60000 ms: …`.
  - **RR-R10-01:** the thrown `Error` keeps only the message. The original error and its stack are lost (no `cause`).
  - **RR-R10-04:** `closeFailedTagManagerApp` sends `SIGKILL` and returns at once, without waiting for the process to exit.
    - B E5: `app.close()` hangs while the main event loop is blocked, and the process is still alive (`exitCode null`) until `SIGKILL`.
  - **A-R10-01:** none of these failure paths has a test.
- **Not in this round, with reasons:**
  - **RR-R10-03** (early main output). Playwright gives `app.process()` only after `electron.launch` resolves, so output printed before that cannot be captured with this launcher. `docs/ci-cd.md` keeps saying so.
  - **RR-R10-05** (worker-scoped fixture). This is an architecture signal, not a task.
- **Reference first:** this is a pure fix of the test harness with no product UX, so the reference rule does not apply.

## Baseline
- HEAD `5854d450b67e5d5aef29a81920b0fd531f516ba7`. The working tree must be **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
- **Frozen** (byte-identical to `5854d45`): everything not in the ownership table. In particular:
  - `src/**`;
  - all three specs (`tests/e2e/app-launch.spec.ts`, `folder-workflow.spec.ts`, `recording-tag-contract.spec.ts`);
  - `tests/main/setup.ts`, `tests/main/global-setup.ts`, every other test, `tests/fixtures/**`, `tests/renderer/**`;
  - `playwright.config.ts`, `vitest.config.*.ts`, `biome.json`, tsconfigs, `.github/**`;
  - `.claude/**`;
  - `docs/**` except the `### E2E launch budget` section of `docs/ci-cd.md`. Its `#### TAG_MANAGER_E2E_ELECTRON_REQUIRE` subsection stays unchanged.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Scope (D-25, see `feature-status.md`)
Read `TESTING.md`, `TYPESCRIPT_STRICT.md` and `AGENT_DISCOVERABLE_CODE.md` before editing; the hook injects them anyway. Follow the `test-on-bugfix` rule: write the failing tests first, then the fix. `tests/**` is type-checked by `npm run typecheck` (`tsconfig.test.json`), so use no `any`, no `@ts-ignore` and no `as unknown as`. Add no comments in code and use semicolons. Keep the double-quote style of `tests/e2e/electron-launch.ts`.

### Target behaviour (D-25)
1. **The phase is tracked in `launchTagManagerApp`:**
   - `"launch"` until `electron.launch` resolves;
   - `"window"` until `firstWindow` resolves;
   - `"load"` after that.
   - This replaces the `windowAppeared` boolean.
2. **Message by phase.** Each message is followed by ` (elapsed N ms)` and then the existing main-output tail block, in today's format.
   | Phase | Error | Message |
   |---|---|---|
   | launch | `TimeoutError` | `electron.launch did not finish within ${FIRST_WINDOW_TIMEOUT_MS} ms` |
   | launch | any other error | `electron.launch failed: ${message}` |
   | window | `TimeoutError` | `first window did not appear within ${FIRST_WINDOW_TIMEOUT_MS} ms` (unchanged) |
   | window | any other error | `first window failed before ${FIRST_WINDOW_TIMEOUT_MS} ms: ${message}` (unchanged) |
   | load | any error | `first window appeared but domcontentloaded did not finish within ${DOM_CONTENT_LOADED_TIMEOUT_MS} ms: ${message}` (unchanged) |
   - `message` is `error.message` for an `Error`, otherwise `String(error)`, as today.
   - In the launch phase the tail is empty, because there is no process handle yet. Keep the block anyway.
3. **The thrown error is `new Error(text, { cause: error })`.** `cause` is the original value, by identity.
4. **`closeFailedTagManagerApp`:**
   - It races `app.close()` against `FAILED_APP_CLOSE_TIMEOUT_MS` (10000), as today.
   - If the process is still running after that (`exitCode === null && signalCode === null`), it registers an `exit` listener, sends `SIGKILL`, and waits for `exit` for at most the new constant `FAILED_APP_KILL_WAIT_MS = 5000`. It resolves when either comes first, and clears its timer.
   - If the process has already exited, it sends no kill and does not wait.
5. **Budget:** `LAUNCH_HOOK_TIMEOUT_MS` changes from 90000 to **100000**. The worst case is 60 (launch + window) + 15 (load) + 10 (close) + 5 (kill wait) = 90 s, which stays below the hook timeout.
   - `FIRST_WINDOW_TIMEOUT_MS` (60000) and `DOM_CONTENT_LOADED_TIMEOUT_MS` (15000) stay unchanged.
6. **New module `tests/e2e/electron-launch-failure.ts`** holds the Playwright-free parts, so that main-env Vitest can test them:
   - It has **no runtime import** of `@playwright/test` or `electron` (`import type` is fine).
   - It exports the phase type, the message/error builder, `closeFailedTagManagerApp`, and **all** the constants: `FIRST_WINDOW_TIMEOUT_MS`, `LAUNCH_HOOK_TIMEOUT_MS`, `DOM_CONTENT_LOADED_TIMEOUT_MS`, `FAILED_APP_CLOSE_TIMEOUT_MS`, `FAILED_APP_KILL_WAIT_MS`, and `MAIN_OUTPUT_TAIL_CHARS` if the builder uses it. Today `DOM_CONTENT_LOADED_TIMEOUT_MS` and `FAILED_APP_CLOSE_TIMEOUT_MS` are private; test (j) needs them.
   - `closeFailedTagManagerApp` takes a minimal structural type (for example `close()` and `process()` that return the fields it uses), not `ElectronApplication`.
   - Its timeouts can be overridden through an optional parameter (defaults = the constants), so tests run in milliseconds. Choose agent-discoverable names.
   - `tests/e2e/electron-launch.ts` imports from it and **re-exports** `FIRST_WINDOW_TIMEOUT_MS`, `LAUNCH_HOOK_TIMEOUT_MS` and `ELECTRON_REQUIRE_ENV`, so the frozen specs' imports still resolve unchanged.
   - Playwright's default `testMatch` does not pick up the new module, because it is not a `.spec`/`.test` file. C confirms the E2E count stays at 7.
7. **Unchanged:**
   - `getElectronRequireArgs` and `getElectronLaunchArgs`, byte-identical: D-06, and D-20 (the injector env is the only launch-arg change, and no injector file is stored in the repo);
   - the `electron.launch` options and `remainingMs`;
   - `captureMainProcessOutput`.

### Steps
1. **Red tests first: `tests/main/electron-launch-failure.test.ts`** (Node env; the existing `tests/main/setup.ts` electron mock is harmless here).
   - **Messages:**
     - (a) launch + an `Error` with `name = "TimeoutError"` gives a text that starts with `electron.launch did not finish within 60000 ms (elapsed 123 ms)`.
     - (b) launch + `new Error("electron.launch: Process failed to launch!")` gives `electron.launch failed: electron.launch: Process failed to launch! (elapsed …)`.
     - (c) window + TimeoutError gives today's text.
     - (d) window + other error gives today's text.
     - (e) load gives today's text.
     - (f) a thrown string `"boom"` in the launch phase gives `electron.launch failed: boom`.
     - (a)–(f) each assert `cause` identity, the ` (elapsed N ms)` suffix and the tail header `--- main process output (last 4000 chars) ---` followed by the given output.
   - **Close** (fake app and process: an EventEmitter plus `exitCode`/`signalCode` and a `kill` spy; small override timeouts):
     - (g) `close()` never resolves, and `kill` emits `exit` after about 50 ms. The helper resolves only **after** `exit` (an ordering flag), and `kill` was called once with `"SIGKILL"`.
     - (h) `close()` resolves and the process has `exitCode 0`. No `kill` is sent, and the helper resolves without waiting for the kill timeout.
     - (i) `close()` never resolves, and `kill` never emits `exit`. The helper still resolves, after at least the kill wait and before the kill wait plus a margin. No timer is left pending (use fake timers or check with `vi.getTimerCount()` if you use them).
     - (j) a constants pin: `LAUNCH_HOOK_TIMEOUT_MS` > `FIRST_WINDOW_TIMEOUT_MS + DOM_CONTENT_LOADED_TIMEOUT_MS + FAILED_APP_CLOSE_TIMEOUT_MS + FAILED_APP_KILL_WAIT_MS`.
   - **Red run:** the file fails on `5854d45`, because the module does not exist. Record the log in `a-round-16/`. Record the real-launch red evidence too, following the recipe of R16-5 (1)+(2), on your own build of `5854d45` (worktree, never `git stash`). If that takes too long, say so; C repeats it anyway.
2. **Fix:**
   - create `tests/e2e/electron-launch-failure.ts`;
   - adapt `tests/e2e/electron-launch.ts` per D-25: phase tracking, the builder, the imported close helper, re-exports, `LAUNCH_HOOK_TIMEOUT_MS` 100000.
3. **Docs: `docs/ci-cd.md` `### E2E launch budget` only** (Georgian, English technical terms):
   - the constants table: `LAUNCH_HOOK_TIMEOUT_MS` is 100000, and add a row for `FAILED_APP_KILL_WAIT_MS` 5000;
   - all five message texts;
   - `cause`;
   - waiting for `exit` after `SIGKILL`;
   - the worst-case sum 60 + 15 + 10 + 5 = 90 < 100;
   - keep the RR-R10-03 sentence (output before `electron.launch` finishes is not in the tail);
   - one line that names `tests/main/electron-launch-failure.test.ts`.
4. **`a-round-16.md`** (Georgian). A writes it with:
   - the red/green logs;
   - the diff summary;
   - the full `verifyCommand` result;
   - `--retries=0`;
   - the code-reviewer result. 4 files change, so A runs `code-reviewer`. After the fix, also run `qa-engineer` read-only, per the read-primitives rule.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `tests/e2e/electron-launch.ts` | D-25 phase tracking, use the new module, re-exports, hook timeout |
| `tests/e2e/electron-launch-failure.ts` (new) | Playwright-free builder + close helper + constants |
| `tests/main/electron-launch-failure.test.ts` (new) | tests (a)–(j) |
| `docs/ci-cd.md` | `### E2E launch budget` section only |

Logs go to `a-round-16/` (A) and `c-round-16/` (C) in the loop folder. Injector files live only outside the repository (for example `/tmp`). B's are in the loop folder as `b-round-15-exp-*.cjs.txt`.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R16-1 ownership | `git status --porcelain --untracked-files=all`; `git diff --stat 5854d45`; `git diff --quiet 5854d45 -- . ':!<4 owned paths>'`; read the diff | Only the 4 owned paths differ: 2 M and 2 new, and no other untracked file. `getElectronRequireArgs`, `getElectronLaunchArgs` and `captureMainProcessOutput` are byte-identical (compare the function bodies). The new module has no runtime import of `@playwright/test` or `electron`. There is no `any`, `@ts-ignore`, `as unknown as` or comment in the new code. The `ci-cd.md` diff is inside `### E2E launch budget`, and `#### TAG_MANAGER_E2E_ELECTRON_REQUIRE` is unchanged. A's result shows `permission_denials` empty. |
| R16-2 red/green | `git worktree add /tmp/c-r16-old 5854d45` with `node_modules` symlinked (never `git stash`, never touch A's tree). Copy the new test file in and run `npx vitest run -c vitest.config.main.ts tests/main/electron-launch-failure.test.ts`, then run it on A's tree | Old: it fails, because the module is missing (record the error). New: every test passes, with the exact count. |
| R16-3 mutations | In a throwaway copy of A's tree, run the unit file against each mutant. **M1:** drop `{ cause }`. **M2:** delete the launch-phase branch in the builder (launch falls through to the window texts). **M3:** no `exit` wait after `SIGKILL`. **M4:** wait for `exit` with no kill-wait timer. **M5:** send `SIGKILL` without the exited check. **M6** is real-launch only, in `electron-launch.ts`: start the phase at `"window"` instead of `"launch"`. The M6 copy needs A's built `out/` (symlink or copy); a TS-only change needs no rebuild. | M1 is killed by (a)–(f); M2 by (a)/(b)/(f); M3 by (g); M4 by (i), by timeout or assertion; M5 by (h). M6 is killed by R16-5 (1) on the mutant build: the old text `first window did not appear` comes back. Report the killing test for each. A survivor is a FAIL unless C shows it is equivalent. |
| R16-4 gate | Clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Biome: 0 errors and 9 warnings, the same list as on `5854d45`. Typecheck 0, including `tsconfig.test.json`. Renderer **120/120**. Main **76 + new** (exact). E2E **7/7**, and **7/7** with `--retries=0`; the new module is not collected as a spec. |
| R16-5 real launches | Built app (`npm run build`, A's tree), `xvfb-run`. A driver outside the repo (for example `/tmp/c-r16/drive.ts`, run with `npx --yes tsx@4`) imports `launchTagManagerApp` from A's real `tests/e2e/electron-launch.ts`. The repo is CommonJS (`package.json` has no `type`), so wrap the driver in `async function main()` and use no top-level await. B smoke E7: `b-round-15-exp-helper-smoke.ts.txt` → `title Czaba Tag Manager`, `closed`. It sets `TAG_MANAGER_E2E_ELECTRON_REQUIRE` to an injector under `/tmp`, and records the rejection's `message`, `cause` (name and message), elapsed time, and whether the Electron pid is alive. Each injector first writes `process.pid` to a file. Use the real budgets (60/15/10/5 s); no override.<br>(1) **block:** `Atomics.wait` for 75 s at require time.<br>(2) **exit:** `process.exit(3)`.<br>(3) **slow load:** a `webRequest.onBeforeRequest` delay of 30 s on the renderer's `.js` request (B E4).<br>(4) **hung main:** `app.whenReady` never resolves, and about 1 s after ready the event loop blocks (`Atomics.wait`) for 120 s (B E5). If `electron.launch` does not resolve with that timing, start the block later and record what you used.<br>(5) **no injector:** a normal launch, `page.title()`, close.<br>**Red reference:** the same (1) and (2) on a build of `5854d45`: a worktree with `node_modules` symlinked, then a real `npm run build` inside it, as in R15 (`old-build.log`). | (1) after about 60 s: `electron.launch did not finish within 60000 ms (elapsed …)`; `cause.name === "TimeoutError"`, and `cause.message` contains `electron.launch: Timeout 60000ms exceeded`; the pid is gone.<br>(2) within a few seconds: `electron.launch failed: electron.launch: Process failed to launch!`; `cause` is set; the pid is gone.<br>(3) after about 15 s: `first window appeared but domcontentloaded did not finish within 15000 ms: …`; the pid is gone.<br>(4) `first window did not appear within 60000 ms`. The rejection arrives only after the Electron pid is gone, so `process.kill(pid, 0)` throws ESRCH at the moment of the catch. Elapsed is about 70–75 s, below 100 s. `pgrep -f out/main/index.js` is empty afterwards.<br>(5) the window opens and closes cleanly.<br>Red reference: (1) gives `first window did not appear within 60000 ms` and (2) gives `first window failed before 60000 ms: …`, both with no `cause`. For (4) on the old tree, report whether the pid was still alive at the catch; this is informational only.<br>Give the full driver and the injector sources in `c-round-16/`. |
| R16-6 docs | Read the `docs/ci-cd.md` diff against the code | Georgian text. All five message texts match the code exactly. The constants table matches the code. The sum 60 + 15 + 10 + 5 = 90 < 100 is stated. `cause` and the `exit` wait are described. The RR-R10-03 limit and the injector subsection are unchanged in meaning. |

## What could break (C re-checks)
- **The three specs** import `LAUNCH_HOOK_TIMEOUT_MS` (and `launchTagManagerApp`) from `./electron-launch`. The re-exports must keep them resolving: E2E 7/7 (R16-4).
- **Normal launch args (D-06):** `--no-sandbox` on Linux only, and `-r` only when the env var is set. Covered by the R16-1 byte check and R16-5 (5).
- **No orphan Electron** after any failure (R16-5 `pgrep`).
- **The hook timeout** grows by 10 s. That only matters on failure; the `check.yml` job timeout (40 min) is unaffected.
- **Main test count and global setup:** the new main test must not need the WAV fixtures and must not leave timers running (R16-4 count, (i)).

## What realVerified means here
- R16-1…R16-4 and R16-6 are real local checks.
- R16-5 runs the real built Electron app through the real helper, with failure injectors that exist only in C's phase (the D-20 mechanism already in the repo) and the real budgets.
- The Actions part (a cold-runner `Check` run) belongs to TM-B14/TM-T0-CI and is root's to link.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
1. **RR-R5-02** (`file-row-display.ts` `typeof` guard). Its acceptance can only be unit tests, and the task will say so.
2. **A MetadataPanel polish round:**
   - RR-R13-02 + RR-R15-02: remove the `as WavMetadata` casts. The preload types already fit, so no protected edit is needed.
   - RR-R15-01: re-read reason. This changes the D-24 wording, so it needs a D-24 amendment.
3. **Root:** please link the `Check` Actions run on `5854d45` or `a4ad852` (or any commit since `35ed18b`). A green run closes TM-T0-CI, TM-T0, TM-T0-CI-FU and the Actions part of TM-B14.
4. **Saba question batch:**
   - D-07 (TM-T1-MIG);
   - D-10 + TM-B11;
   - D-12/TM-B08 + B-R6-01;
   - TM-T1-DUP (RR-R3-01, medium);
   - D-15 + RR-R5-01;
   - B-R7-02/RR-R8-04;
   - TM-B05;
   - TM-B06 (+ RR-R14-03/05);
   - RR-R1-07;
   - RR-R3-05;
   - TM-T2-DATA;
   - RR-R13-01 (protected preload return shape);
   - RR-R15-03 (dirty after a confirmed write);
   - RR-R15-05 (write returns the re-read; preload);
   - C-R15-01 (toast placement; reference-first);
   - optional RR-R12-02.
