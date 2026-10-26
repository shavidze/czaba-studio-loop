COMMIT: OK

This round touches CI only: a bounded apt installer script, step timeouts, and a clearer error from the contract script plus its test. It doesn't change runtime app code (main, preload or renderer), so there's no effect on IPC, Electron security, or the store and save flow. The verify log shows typecheck, 79 renderer and 42 main unit tests, and 7 E2E tests passing. All 9 Biome warnings are in renderer files this commit doesn't touch.

**Critical / High**
None.

**Medium**
1. `.github/scripts/apt-install.sh:57`: the new `--no-install-recommends` flag can break E2E on a fresh image. The old step was a plain `apt-get install -y ffmpeg xvfb`. As far as I know, `xvfb` lists `xauth` only as a Recommends, not a hard dependency, and `xvfb-run` (used at `check.yml:43`) exits with "xauth command not found" when it's missing. The current GitHub `ubuntu-24.04` runner image ships with xauth already, so it works today, but that's a hidden dependency. I didn't check this against the package metadata. **Fix:** call `apt-install.sh ffmpeg xvfb xauth` explicitly, or drop the flag for this call.

**Low**
2. `apt-install.sh` plus `check.yml:26`: the worst case adds up to more than the step's `timeout-minutes: 10`. Two attempts at (240 + 10 s kill-after) plus a `dpkg --configure -a` recovery bounded at 240 + 10 s comes to about 750 s, roughly 12.5 min. If that happens, GitHub kills the step before the script prints its "failed after N attempts" line, so the error message is lost. The job still fails, so this is a diagnostics problem only. **Fix:** lower the recovery bound (e.g. 60 s), or raise the step timeout to 13 min.
3. `tests/contract/check-ffprobe-tags.ts:20`: the message hard-codes the order "during npm run check". It's correct for `check.yml`, but it's a coupling to keep in mind if the steps get reordered. A possible follow-up, not a fix: have the CLI print the exact command (`npx vitest run --config vitest.config.main.ts tests/main/recording-tag-contract.test.ts`).
4. `tests/main/check-ffprobe-tags.test.ts:30-33`: the second test only checks a constant and that a file exists, which `TESTING.md` treats as low-value. It's acceptable here because it stops the error message from pointing at a renamed file. The first test is the useful one: it checks the missing-file error path and that `spawnSync` is never called.
5. Docs: per the project convention (Georgian `docs/`), the new CI script and its env knobs (`APT_ATTEMPT_TIMEOUT_SECONDS`, `APT_ATTEMPTS`) aren't documented. Add a short note under `docs/`.

**Verified**
- **Script error handling:** `set -euo pipefail` with `fn || var=$?` correctly captures exit codes from each phase.
- **Timeout handling:** the per-attempt deadline is shared across `update` and `install`, and the check after `update` catches an `update` that finishes past the deadline.
- **Kill semantics:** `timeout` runs as root under `sudo env`, so killing apt works, and exit codes 124 and 137 are both reported as timeouts.
- **Recovery and retries:** `dpkg --configure -a` runs only between retries, and inputs are validated as positive integers.
- **Injection:** none. Packages are passed as a quoted array.
- **Permissions and secrets:** the workflow keeps `contents: read`, and no secrets are added.

**Architecture note (proposal only)**
The ffprobe cross-check depends on a file left behind by the earlier `npm run check` step. Consider moving the cross-check into `recording-tag-contract.test.ts` as an `it` that is skipped when ffprobe isn't installed, or making it a dedicated `npm run test:contract` script that produces the WAV and checks it in one go. Either would remove the ordering dependency, the hard-coded producer path, and the need for this error message.