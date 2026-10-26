# CURRENT TASK — Round 4: TM-T0-CI apt-step hang fix (check.yml hardening) + RR-R3-02 ffprobe missing-file hint

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-26

## Why this round
Round 3 (TM-T1 + TM-T1-DOC) was **C PASS with realVerified=true** (R3-1…R3-10). The root review was COMMIT OK, and root published it as `230b87a`. TM-T1 and TM-T1-DOC are done. No critical or high bug is open in the app.

The CI gate, though, has never worked. Root's note in `policy.local.md`: Actions run `40323787413` (`Check`, `c34ee5a`) was **cancelled by the 30-minute job timeout**. Step "Install system packages" (`sudo apt-get update && sudo apt-get install -y ffmpeg xvfb`) ran from 12:36:29 to 13:06:24 and never finished. Lint, tests, build and E2E never ran on GitHub. Root assigned the fix to **TM-T0-CI**, ahead of feature work. Every publish since `c34ee5a` carries a `check.yml` that has never completed, so B treats this as **high**.

**RR-R3-02** (root review round 3, low) is planned with it because it is on the same CI path. The ffprobe step reads a file that a unit test produces. When the file is missing, the error must name the test that produces it.

### Facts and hypotheses (policy §8)
- **Fact (root):** the apt step ran for 30 minutes and was cancelled. Root could not read the step log.
- **Fact (root):** the same packages installed in about 2 minutes in the loop job on `ubuntu-24.04`.
- **Fact (B, this runner):**
  - `/var/lib/man-db/auto-update` does not exist here;
  - `/usr/bin/debconf-communicate` and `/usr/bin/timeout` are present;
  - `xvfb` has `xauth` as a Depends, and `/usr/bin/ffprobe` belongs to the `ffmpeg` package, so `--no-install-recommends` keeps both `xvfb-run` and `ffprobe`.
- **Hypothesis:** man-db trigger processing, or a blocking dpkg/debconf prompt or pty, caused the hang on the GitHub image. This is not confirmed, and the man-db part may be a no-op on some images.
- **The guaranteed gain is fail-fast and visible behaviour:** bounded attempts, one retry, a step timeout and timing lines in the log. The next Actions run will either pass or tell root where the time went. This round does not claim to know the cause.

## Baseline
- HEAD `230b87a85e7301b25e86e3768a9e242cf9adc5f4`, working tree clean. If HEAD differs, or the tree is dirty in paths you don't own, stop and report.
- Frozen files (must stay byte-identical): everything not listed under File ownership. In particular:
  - `src/**`;
  - `package.json` and `package-lock.json` (agents do not install or upgrade packages);
  - all `tsconfig*.json`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts`, `electron.vite.config.ts`;
  - `.github/workflows/release.yml` (protected);
  - `tests/fixtures/**`, and every existing file under `tests/` except `tests/contract/check-ffprobe-tags.ts`;
  - `.claude/**`, `docs/**`, `node_modules/**`.

## Scope
1. **New `.github/scripts/apt-install.sh`** (bash). It uses only coreutils `timeout`, `sudo`, `apt-get`, `dpkg` and `debconf-communicate`. Usage: `bash .github/scripts/apt-install.sh <package>...`.
   - `set -euo pipefail`. With no package arguments it prints a usage line to stderr and exits 2.
   - **Before any apt call**, turn off man-db trigger processing:
     - `echo 'set man-db/auto-update false' | sudo debconf-communicate`, tolerating failure (for example when man-db is not installed);
     - `sudo rm -f /var/lib/man-db/auto-update`.
   - **Non-interactive apt:** `DEBIAN_FRONTEND=noninteractive` must reach apt-get through sudo (`sudo env DEBIAN_FRONTEND=noninteractive …` or `sudo DEBIAN_FRONTEND=noninteractive …`).
   - **apt options:** `-o Dpkg::Use-Pty=0` on both `update` and `install`. `install` also gets `-y --no-install-recommends` and the given packages.
   - **Bounded attempts:**
     - Each attempt runs `apt-get update` and then `apt-get install`, each bounded with coreutils `timeout --kill-after=…`.
     - The bound per attempt comes from `APT_ATTEMPT_TIMEOUT_SECONDS` (default **240**).
     - The number of attempts comes from `APT_ATTEMPTS` (default **2**, which means one retry).
     - Both are environment variables, so C can test with short values.
   - **Recovery between attempts:** after a failed or timed-out attempt, and before the next one, run `sudo dpkg --configure -a`. Bound it with the same timeout and tolerate failure, so a killed dpkg does not leave the next attempt locked out.
   - **Logging:** each attempt prints one stdout line with:
     - the attempt number and the total;
     - the elapsed seconds;
     - the outcome: `ok`, `failed (exit N)` or `timed out`.

     Root will read these timings in the first Actions run.
   - **Exit status:** 0 on the first successful attempt. Otherwise, after the last attempt, it prints the final line `apt-install: failed after N attempts` and exits non-zero.
   - **No comments** (project rule). Keep the script readable through function and variable names (`AGENT_DISCOVERABLE_CODE.md`).
   - **Not a Vitest target:** `npm run check` must stay runnable on Windows dev machines. C tests the script with PATH shims (R4-3).

2. **`.github/workflows/check.yml`.** Only these changes:
   - **Step "Install system packages":** `run: bash .github/scripts/apt-install.sh ffmpeg xvfb`, and add `timeout-minutes: 10` to the step. 10 minutes covers 2 × 240 s attempts plus recovery. Root suggested 8, but 8 would cut the retry short.
   - **Step "Install Electron system libraries"** (`npx playwright install-deps chromium`): it also runs apt internally, so it gets `timeout-minutes: 10`. Its `run` stays unchanged. It relies on the man-db/debconf setting from the previous step, so the order "Install system packages" → "Install Electron system libraries" must stay.
   - **Unchanged:** the job's `timeout-minutes: 30` (backstop), triggers, permissions, and every other step with its order and text. No new `uses:` action (no third-party retry action; RR-R1-03).

3. **RR-R3-02, `tests/contract/check-ffprobe-tags.ts`.**
   - When the WAV path does not exist, the error also names the producer, for example: `WAV file not found: <path>. It is written by tests/main/recording-tag-contract.test.ts (T1-1) during npm run check; run that first.`
   - Export the producer path as a named constant (for example `CONTRACT_WAV_PRODUCER_TEST`), following `AGENT_DISCOVERABLE_CODE.md`.
   - Nothing else in the file changes: expected tags, ffprobe arguments, CLI guard and exit codes stay as they are.
   - **Red first** (`test-on-bugfix`):
     - add `tests/main/check-ffprobe-tags.test.ts` (new);
     - it calls `checkFfprobeContractTags()` on a path that does not exist under `os.tmpdir()` and expects a throw whose message contains both `WAV file not found` and `recording-tag-contract.test.ts`;
     - the missing-file branch returns before spawning, so the test **must not spawn ffprobe**;
     - run it before the fix, save the failing output as `a-round-4/red-before-hint.log`, then fix.

**Explicitly NOT in this round:**
- Pinning actions to SHAs (RR-R1-03), the separate Build step (RR-R1-01), `needs: check` in `release.yml` (RR-R1-07, Saba).
- Pinning `tsx` as a devDependency (RR-R3-05; it needs `package.json`, which is protected).
- TM-T1-DUP / RR-R3-01 (Saba decides the behaviour), TM-B09 (Tagged badge), RR-R2-01/02, TM-B05, TM-B06, TM-B08, TM-T1-MIG.
- Installing or upgrading packages on the host, `npm ci`, any `src/**` change.

Read first: `.claude/primitives/AGENT_DISCOVERABLE_CODE.md`, `TESTING.md`, `TYPESCRIPT_STRICT.md`, `SEMICOLONS.md`, `GIT_RULES.md` (no commit), `.claude/rules/test-on-bugfix.md`, and root's note in `policy.local.md`.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `.github/scripts/apt-install.sh` (new) | bounded, non-interactive apt install with one retry and man-db off |
| `.github/workflows/check.yml` | two steps only: new `run` + `timeout-minutes` on "Install system packages"; `timeout-minutes` on "Install Electron system libraries" |
| `tests/contract/check-ffprobe-tags.ts` | RR-R3-02 producer hint + exported constant |
| `tests/main/check-ffprobe-tags.test.ts` (new) | red-first test for the hint (no ffprobe spawn) |

Generated and ignored output (`tests/fixtures/*.wav`, `out/`, `test-results/`, `playwright-report/`) is not committed. Reports and logs go to `a-round-4/` in the loop folder.

## Acceptance (C)
**TM-T0-CI stays `in_progress`, realVerified=false, after this round, even on PASS.** Its real acceptance is a green GitHub Actions run, which root links after publishing. C's evidence here is local proof only.

| ID | Check | Evidence that means PASS |
|---|---|---|
| R4-1 (YAML) | Parse `check.yml` with `js-yaml`. Compare it with `git show 230b87a:.github/workflows/check.yml`, both parsed and as a text diff. | Valid YAML. Same step names in the same order. The only differences: "Install system packages" has `run: bash .github/scripts/apt-install.sh ffmpeg xvfb` and `timeout-minutes: 10`; "Install Electron system libraries" has `timeout-minutes: 10`. Job timeout 30, triggers, permissions and the `uses:` lines are unchanged. No new action. Paste the diff. |
| R4-2 (script static) | `bash -n .github/scripts/apt-install.sh`. Read the script. Run `shellcheck` if it is already available (do not install it). | Syntax OK; `set -euo pipefail`. The man-db commands come before the first apt-get call. `DEBIAN_FRONTEND=noninteractive` reaches apt-get through sudo. `-o Dpkg::Use-Pty=0` is on update and install; `-y --no-install-recommends` is on install. The `timeout` bounds use `--kill-after`. Env defaults are 240 / 2. No comments. |
| R4-3 (behaviour with shims) | Make `/tmp/c-r4-shim/bin` and put it first on PATH, with shims for `sudo`, `apt-get`, `dpkg` and `debconf-communicate`. The `sudo` shim logs its argv and runs the rest without privilege. Every shim logs argv and `DEBIAN_FRONTEND`; `debconf-communicate` also logs its stdin. Run the real script from the repo with `APT_ATTEMPT_TIMEOUT_SECONDS=2`, and time each case: **(a)** apt-get succeeds; **(b)** apt-get hangs (`sleep 999`) on attempt 1 and succeeds on attempt 2; **(c)** apt-get always hangs; **(d)** apt-get always exits 100; **(e)** no package arguments. **Mutation:** in a `/tmp` copy of the script, remove the `timeout` wrapper and rerun case (b), killing it at 30 s. | **(a)** exit 0 with one attempt line. The apt argv contains `-o Dpkg::Use-Pty=0` (update and install), `-y`, `--no-install-recommends`, `ffmpeg` and `xvfb`. `DEBIAN_FRONTEND=noninteractive` is seen by apt-get. The debconf stdin is `set man-db/auto-update false`, and both it and `rm -f /var/lib/man-db/auto-update` are logged before the first apt-get. **(b)** exit 0 with two attempt lines, the first `timed out`, and `dpkg --configure -a` between them. Total time is below 15 s, and `pgrep -f 'sleep 999'` is empty afterwards. **(c) and (d)** non-zero, with the last line `apt-install: failed after 2 attempts` and bounded time; no orphan `sleep` after (c). **(e)** exit 2 with usage. **Mutation:** (b) no longer finishes within 15 s, which proves the bound is real. Logs go in `c-round-4/`. |
| R4-4 (real apt on the runner) | `time bash .github/scripts/apt-install.sh ffmpeg xvfb` with the real `sudo`. The packages are already present, so this installs nothing new and upgrades nothing (`--no-install-recommends`, no `--only-upgrade`). Then run `sudo debconf-show man-db`, `test ! -e /var/lib/man-db/auto-update`, `ffprobe -version \| head -1` and `command -v xvfb-run`. **Optional, supporting only:** if `docker run --rm ubuntu:24.04` works without changing the host, run the script in a fresh container with a pass-through `sudo` shim and record the real fresh-install time. | Exit 0, one `ok` attempt line with elapsed seconds. The man-db `auto-update` setting is false and the file is absent. ffprobe and xvfb-run are present. Timings are recorded. The container run, if done, is reported separately and is not needed for PASS. |
| R4-5 (RR-R3-02 red/green) | Read A's `a-round-4/red-before-hint.log`. In `/tmp/c-r4-red` (rsync + `node_modules` symlink), restore `git show 230b87a:tests/contract/check-ffprobe-tags.ts` and run the new test there. On the real tree, run `npx --yes tsx@4 tests/contract/check-ffprobe-tags.ts` on three paths: `/nonexistent/contract.wav`; `tests/fixtures/sample.wav`; and `test-results/recording-tag-contract/contract.wav` after `npm run check`. Read the test code for any spawn. | Red against the old script, green against the new one. On the missing path the CLI exits 1 with a message naming `tests/main/recording-tag-contract.test.ts`. `sample.wav` exits 1 with the three mismatch lines, as before. `contract.wav` exits 0 with `ICAT=DOORWood`, `IKEY=door, slam` and `comment=მძიმე კარი`, as before. The test does not call ffprobe. |
| R4-6 (gate + CI-order replay) | Clean state: `rm -rf out test-results playwright-report tests/fixtures/*.wav`, then the full `verifyCommand`. Separately, extract the `run:` steps of `check.yml` with js-yaml and replay them in YAML order, skipping only `npm ci` (agents never run it). This includes the real apt script and `npx playwright install-deps chromium`. Time every step. | `verifyCommand` exits 0. Biome 0 errors. Typecheck 0 errors (the new test is in `tsconfig.test.json`). Renderer **79**. Main **40 + A's new count**, all green. E2E **7/7** with `--retries=0`. In the replay every step exits 0; give a timing table that shows the ffprobe step running before E2E. |
| R4-7 (real-app smoke) | Launch the built app with `_electron` under `xvfb-run` (`--no-sandbox`, a clean `XDG_CONFIG_HOME`, the dialog stubbed to a temp folder that holds a copy of `sample.wav`). Open the folder, select the file and take a screenshot. | The app starts. The file row renders, and the metadata panel shows `Category (UCS)` (screenshot in `c-round-4/`). `src/**` is unchanged (R4-8), so this is a smoke check only. |
| R4-8 (frozen/ownership) | `git status --porcelain`; `git diff --stat 230b87a`; `git diff --quiet 230b87a -- src package.json package-lock.json 'tsconfig*.json' biome.json playwright.config.ts vitest.config.renderer.ts vitest.config.main.ts electron.vite.config.ts .github/workflows/release.yml tests/fixtures tests/main/recording-tag-contract.test.ts tests/main/riff-chunks.ts tests/main/metadata.test.ts tests/e2e tests/renderer .claude docs` | Only the four owned paths changed or were added. No `any`, `@ts-ignore`, `@ts-expect-error` or `biome-ignore` added. No comments in the shell script. |

## What could break (C re-checks)
- **E2E** depends on `xvfb-run`. With `--no-install-recommends`, `xvfb` still pulls in `xauth` as a Depends. C confirms that `xvfb-run -a` works after R4-4.
- **ffprobe** ships in the `ffmpeg` package itself, so `--no-install-recommends` must not drop it (R4-4).
- **`set -e` with `timeout`**: a timed-out attempt (exit 124) must not abort the script before the retry. Case (b) proves this.
- **Orphan processes**: a killed apt or dpkg must not survive. The script uses `--kill-after`, and C checks with `pgrep` after (b) and (c).
- **`playwright install-deps`** still runs and exits 0 after the apt script (R4-6 replay).
- **ffprobe script output** for the existing positive and negative paths must not change (R4-5).
- **`npm run check` without ffmpeg**: the new Vitest test only exercises the missing-file branch, which runs no external command.

## Next (orientation only)
1. After publishing, root watches the first `Check` run:
   - if it is green, root links it, TM-T0-CI and TM-T0 close, and root may propose RR-R1-07 (required check) to Saba;
   - if the apt step still times out, the per-attempt timing lines decide the next CI round.
2. A small bug round: RR-R2-01 (`getRiffInfoTags` outside the per-field try), RR-R2-02 (FileList display test) and TM-B09 (Tagged badge, C-R3-01).
3. Questions for Saba: D-07 (TM-T1-MIG), D-10, D-12/TM-B08, and TM-T1-DUP (both collision cases, RR-R3-01). T-2 stays BLOCKED until TM-T2-DATA arrives.
