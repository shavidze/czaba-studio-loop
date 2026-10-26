COMMIT: OK

The diff only touches CI and docs (`apt-install.sh`, `check.yml`, `docs/ci-cd.md`), so no app runtime code, IPC, security settings or user flows change. I reviewed it by reading the code only. My attempt to run `bash -n` and the bad-input cases needed approval and didn't run, so I relied on C's PASS and the verify run. The sandbox also blocked reading the end of `verify.log`.

**What I checked, no problems found:**
- **Script order:** `run_bounded_as_root` is defined below `disable_man_db_triggers` but is only called after both exist, so the order is safe.
- **Input checks:** all four `APT_*` settings are checked before `worst_case_seconds` does any arithmetic. A bad value like `0`, `abc` or `010` still exits with code 2 before anything on the system is touched.
- **Piped `debconf-communicate`:** piping into `sudo env … timeout … debconf-communicate` passes stdin through. Stdin is a pipe, not a terminal, so `timeout` putting itself in its own process group won't stall it. The `|| true` together with `pipefail` keeps a failure here from stopping the script, as before.
- **Worst-case formula:** `(R+K) + N(T+K) + (N−1)(R+K)` = 640s with defaults, which matches the code. The man-db step, N attempts and N−1 recoveries are each wrapped in `timeout --kill-after`. The `remaining_attempt_seconds` floor of 1 adds at most about 1s per attempt, as the docs say. 640s fits inside the 780s step timeout.
- **`npm run test:e2e -- <args>`:** npm adds the extra arguments to the end of the script string (`npm run build && npx playwright test`). So `--retries`, `--trace` and `--reporter` go to Playwright, not to the build. `xvfb-run` now also wraps the build, which does no harm.
- **Step order:** the ffprobe contract check still runs before the E2E step, so Playwright's cleanup of `test-results/` doesn't delete its input.

**Findings**
- **Critical / high / medium:** none.
- **Low** – `.github/workflows/check.yml:26`: the apt step timeout went from 10 to 13 minutes. Together with the 10-minute playwright install-deps step, the system-setup steps alone could now use 23 of the job's 30 minutes before check and E2E run. In practice this is unlikely (apt took 19s in the cited run). Fix: raise the job's `timeout-minutes` to about 40, or lower `APT_ATTEMPT_TIMEOUT_SECONDS`.
- **Low** – `docs/ci-cd.md:169`: the line naming Actions run `40331357825` is a one-off fact that will go stale and can't be checked from the repo. Fix: drop it or say "typical runs take about 20s".
- **Low** – `.github/scripts/apt-install.sh`: there is no automated test for the input checks or the worst-case log line. The project's test-on-bugfix rule covers store, IPC and utility code, so this isn't strictly required. Fix: optionally add a small test that runs the script with bad `APT_*` values and checks for exit 2, plus `worst case 640s` with defaults, using fake `sudo`/`apt-get` on PATH.

**Architecture note (proposal only):** `worst_case_seconds` and the step's `timeout-minutes` are kept in sync by hand. A CI step, or a `--print-worst-case` flag, could compare `ceil(W/60)` plus a margin against the YAML value so the two can't silently drift when someone changes a default.