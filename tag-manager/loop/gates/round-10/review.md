COMMIT: OK

This round only touches the E2E launch harness, the CI timeout and the docs. No production code changes, so the app's security, IPC, payments and secrets aren't affected. verify.log shows the main tests (107), the renderer tests (62) and the E2E tests (7) all passing.

**Checks that came out fine**
- **Passing `-r` before the entry path works.** Playwright adds its own loader with `-r` (`playwright-core/lib/server/electron/electron.js:156`), so Electron's default app accepts more than one `-r`. Without the env var, the args are the same as before: `--no-sandbox` is added on Linux only.
- **Failure cleanup is safe.** If launch fails, `launchTagManagerApp` closes the app itself and throws before the `({ app, page } = …)` assignment, so `app` stays `undefined`. `afterAll` then calls `app?.close()` safely and still deletes the temp folders in `finally`. The original launch error is reported, not hidden by a cleanup error.
- **Timeouts fit.** Worst case is 60 s (launch plus first window, one shared budget) + 15 s (`domcontentloaded`) + 10 s (closing a failed app) = 85 s, under the 90 s `beforeAll` limit. Each test keeps the 30 s per-test limit from the config. Raising the CI job to 40 minutes is consistent with the 23 minutes of step timeouts and with the docs.
- **No process left running.** If `close()` hangs, the app is killed with `SIGKILL` once the 10 s close timeout runs out.
- **Sharing one `page`** across the tests in a file behaves the same as before, since `firstWindow()` always returned the same page.

**Findings**
- **Critical / high / medium:** none.
- **Low — `tests/e2e/electron-launch.ts:253`:** the wrapped `Error` drops the original stack. Fix: `throw new Error(describeLaunchFailure(...), { cause: error })`.
- **Low — `tests/e2e/electron-launch.ts:222`:** a `TimeoutError` from `electron.launch` itself, which can happen before any window exists, is reported as "first window did not appear". The message is slightly misleading; it's acceptable because the docs say both steps share one budget. Fix: track a `launched` flag and say "electron.launch timed out" when it's still false.
- **Low — `tests/e2e/electron-launch.ts:242`:** main-process output is only captured after `electron.launch` returns, so early crash output isn't in the tail. This is documented. Optional fix: capture output from Playwright's launch logger as well.
- **Low — `tests/e2e/electron-launch.ts:207`:** `SIGKILL` doesn't wait for the process to exit. Fine for tests; optionally wait for the `exit` event with a short timeout.

**Architecture note (proposal only)**
All three specs repeat the same `beforeAll`/`afterAll` code. A Playwright worker-scoped fixture (`test.extend<{}, { tagManager: LaunchedTagManagerApp }>`) could own the launch, the timeout, cleanup and per-spec env such as `XDG_CONFIG_HOME`, so that code lives in one place. Temp-folder cleanup could move into the same fixture.