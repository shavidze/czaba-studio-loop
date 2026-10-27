COMMIT: OK

The change is limited to E2E test infrastructure and docs, and no app runtime code is touched. Verify passed: typecheck covers the test files, and `tests/main/electron-launch-failure.test.ts` ran 17 tests, all passing. I read the diff and both new files, and found nothing that blocks the commit.

**Critical / High:** none.

**Medium:** none.

**Low**
1. **Biome lint doesn't reach these files.** `npm run check` runs `biome check src/`, so none of the four changed files are linted. One example: whether Biome's import sorting accepts the import order in `tests/e2e/electron-launch.ts:5-13` was never checked. Fix: run `npx biome check tests/` once before committing, or widen the `check` script to cover `tests/` (that would be a separate task).
2. **Failures before the `try` don't get the new message format.** In `tests/e2e/electron-launch.ts:62`, `getElectronLaunchArgs` runs before the `try`. An error from it (a bad `TAG_MANAGER_E2E_ELECTRON_REQUIRE` path) is thrown as-is, without the phase, elapsed time or `cause` wrapping. Nothing is lost, because that message already explains the problem and no process exists yet. Fix: either note this in `docs/ci-cd.md` next to the phase table or leave it.
3. **A failed `SIGKILL` still waits 5 s.** In `tests/e2e/electron-launch-failure.ts:79-80`, if `kill("SIGKILL")` returns `false` (no pid or already reaped), the helper waits the full `FAILED_APP_KILL_WAIT_MS` for nothing. That stays inside the worst-case budget: 60 + 15 + 10 + 5 = 90 s, under the 100 s hook timeout. Optional fix: resolve right away when `kill()` returns `false`.

**What checks out**
- **Event ordering in `killAndWaitForExit`:** the `exit` listener is registered before `kill`, so an exit that fires synchronously isn't missed (test g3). The timer is cleared on exit, and the listener is removed when the timeout wins (tests i and g2). Neither a timer nor a listener leaks.
- **Phase tracking:** `phase` changes to `window` only after `electron.launch` resolves, and to `load` only after `firstWindow` resolves. Each failure message therefore matches the step that actually failed.
- **Types:** `ElectronApplication` fits the narrow `FailedTagManagerApp` interface, confirmed by `tsconfig.test.json` passing. `new Error(text, { cause })` keeps the original error.
- **Imports and timeouts:** the spec files' imports are unchanged thanks to the re-exports. All three specs call `test.setTimeout(LAUNCH_HOOK_TIMEOUT_MS)`, so they pick up the new 100 s value. Test (j) checks that the timeout sum stays below it.
- **Conventions:** there are no code comments, no `any`, and semicolons are used throughout. The docs are in Georgian.

**Architecture note (proposal only):** `captureMainProcessOutput` starts after `electron.launch` resolves, so anything Electron prints during launch never appears in the error output. Playwright doesn't expose the child process before `launch` resolves, so fixing this would mean starting Electron ourselves and connecting to it over CDP. That isn't worth doing unless failures in the `launch` phase actually start showing up in CI.