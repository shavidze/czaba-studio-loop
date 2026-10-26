# CURRENT TASK — Round 9: TM-T0-CI-FU `apt-install.sh` worst case fits its step budget and is printed (C-R4-01, RR-R4-02) + one build path for E2E in `check.yml` (RR-R1-01) + Georgian `check.yml` docs (RR-R4-05)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-26

## Why this round
- Round 8 (TM-B13, D-18): **C PASS** on R8-1…R8-7, realVerified=true. Root review COMMIT OK, published `4a2062d`. TM-B13 is done. No critical or high bug is open.
- Every other open item except this one waits for a decision from Saba (D-07, D-10/TM-B11, D-12/TM-B08, TM-T1-DUP, TM-B05, TM-B06, TM-T2-DATA) or for root to link an Actions run (TM-T0-CI).
- **TM-T0-CI-FU** (low) and **RR-R1-01** (medium, open since round 1) need no decision. They touch the same two CI files, so they form one CI round.
- The backlog note said "plan after root reports the first Actions run on 7879ee0". B is bringing the round forward and says so in `b-round-8.md`. The reasons: this is the only decision-free scope left, and root's link only confirms the result; it does not block the work. A round-9 commit also qualifies as "7879ee0 or later" for TM-T0-CI.

**B facts** (code read on `4a2062d` and a small experiment):
- `apt-install.sh` worst case today. T = `APT_ATTEMPT_TIMEOUT_SECONDS` (240), K = kill-after (hard-coded `10`), N = `APT_ATTEMPTS` (2):
  - every attempt: up to T + K;
  - every recovery: `dpkg --configure -a` is bounded by T as well (`recover_interrupted_dpkg`, line 65), so up to T + K;
  - total: 2 × 250 + 250 = **750 s**, against the step's `timeout-minutes: 10` (600 s).
- `disable_man_db_triggers` (line 20) runs `sudo debconf-communicate` with **no timeout**. If it hangs, no budget holds.
- Because K is hard-coded, a shim run with a small T does not scale the whole formula. A "2 s" run alone cannot prove the 600 s budget.
- `npm run <script> -- <args>` appends the args to the **last** command of the script. B experiment in `/tmp/b-r8`: script `echo first && echo second` with `-- --retries=0 --reporter=list,html` printed `second --retries=0 --reporter=list,html`. So `npm run test:e2e -- …` passes the flags to `npx playwright test`, not to `npm run build`.
- `check.yml` today has `Build` (`npm run build`) and then `E2E tests` (`xvfb-run -a npx playwright test …`). The verifyCommand uses `npm run test:e2e` (`npm run build && npx playwright test`). Those are two build paths (RR-R1-01).

## Baseline
- HEAD `4a2062d9258cb97e3d45866d553c58bdbdf65498`, working tree clean. If HEAD differs, or the tree is dirty in paths you don't own, stop and report.
- Frozen files: everything not listed under File ownership. They must stay byte-identical. In particular:
  - all of `src/**`;
  - all of `tests/**`, including `tests/contract/check-ffprobe-tags.ts` and `tests/fixtures/**`;
  - `.github/workflows/release.yml` (protected);
  - `package.json` and `package-lock.json` (protected), every `tsconfig*.json`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts`, `electron.vite.config.ts`;
  - `.claude/**`;
  - every `docs/**` file except `docs/ci-cd.md`.

## Scope
1. **`.github/scripts/apt-install.sh`.** This is decision **D-19** (B, technical, reversible).
   - Knobs. Each one is read from the environment with a default and must be a positive integer; otherwise print the usage message and exit 2, as today:
     - `APT_ATTEMPT_TIMEOUT_SECONDS` (default 240, unchanged);
     - `APT_ATTEMPTS` (default 2, unchanged);
     - **`APT_KILL_AFTER_SECONDS`** (default 10, today a hard-coded constant);
     - **`APT_RECOVERY_TIMEOUT_SECONDS`** (new, default 60).
   - `recover_interrupted_dpkg` bounds `dpkg --configure -a` with `APT_RECOVERY_TIMEOUT_SECONDS` instead of `APT_ATTEMPT_TIMEOUT_SECONDS`.
   - `disable_man_db_triggers` bounds `debconf-communicate` with the same recovery bound. Use `run_bounded_as_root`, which also applies kill-after. The `|| true` tolerance stays. `sudo rm -f /var/lib/man-db/auto-update` stays as it is.
   - Before anything else that touches the system (after argument and knob validation, before `disable_man_db_triggers`), print exactly one line to stdout:
     `apt-install: worst case ${W}s`
     where **W = (R + K) + N × (T + K) + (N − 1) × (R + K)**, with T = attempt timeout, R = recovery timeout, K = kill-after and N = attempts.
     - With the defaults: 70 + 500 + 70 = **640**.
     - With T=3, R=2, K=1, N=2: 3 + 8 + 3 = **14**.
   - The usage message's `Environment:` line lists all four knobs with their defaults.
   - Unchanged:
     - the per-attempt deadline logic (`remaining_attempt_seconds`);
     - `--no-install-recommends` and `-o Dpkg::Use-Pty=0`;
     - `DEBIAN_FRONTEND=noninteractive`;
     - the outcome lines `apt-install: attempt N/M ok|timed out in <phase>|failed (exit X) in <phase> after Ss`;
     - the final line `apt-install: failed after N attempts` and the exit codes (0, 1, 2).
   - Rules: `set -euo pipefail` stays, `shellcheck` reports 0 issues, and there are no `#` lines except the shebang (no comments, the project rule).
2. **`.github/workflows/check.yml`.**
   - "Install system packages": `timeout-minutes: 13` (780 s, which is greater than W = 640). The `run:` line stays.
   - **RR-R1-01, merge:** delete the separate `Build` step. The E2E step becomes:
     - name `Build and E2E tests`;
     - `run: xvfb-run -a npm run test:e2e -- --retries=0 --trace=retain-on-failure --reporter=list,html`;
     - the same `env: PLAYWRIGHT_HTML_OPEN: never`.
   - The order of every other step, `on`, `permissions`, `runs-on`, the job `timeout-minutes: 30`, every `uses:` line (still `@v4`, see RR-R1-03 signal), "Install Electron system libraries" (`timeout-minutes: 10`) and the upload step stay unchanged.
   - The `Tag contract ffprobe cross-check` step **stays before** the E2E step. Playwright cleans `test-results/` when it starts, and that step reads `test-results/recording-tag-contract/contract.wav`.
3. **`docs/ci-cd.md`, in Georgian with English technical terms.** Add one new section at the end, for example `## Check workflow (check.yml)`. It covers:
   - the trigger (push + pull_request), the runner and the steps in order, including that `Build and E2E tests` builds through `npm run test:e2e`, the same path as local runs;
   - `apt-install.sh`: what it does (man-db trigger off, bounded update/install, `dpkg --configure -a` recovery between attempts);
   - the four env knobs with their defaults;
   - the W formula, the value 640 s, and why the step has `timeout-minutes: 13`;
   - every log line format: `worst case Ws`, `attempt N/M ok after Ss`, `timed out in <phase> after Ss`, `failed (exit X) in <phase> after Ss`, `failed after N attempts`; and exit code 2 for usage.
   - Do not change the existing release-workflow sections.

**Red/green (A, outside the repository):**
- Use shims in `a-round-9/shims/` for `sudo` (pass-through), `apt-get`, `dpkg` and `debconf-communicate`. The modes are ok, hang, hang-ignore-term and fail; C's R4 shims in `c-round-4/shims/` are a model.
- Run the case "everything hangs and ignores TERM" (`apt-get`, `dpkg` **and** `debconf-communicate`) with `APT_ATTEMPT_TIMEOUT_SECONDS=3 APT_RECOVERY_TIMEOUT_SECONDS=2 APT_KILL_AFTER_SECONDS=1`:
  - **red** on `git show 4a2062d:.github/scripts/apt-install.sh`, wrapped in an outer `timeout 120`: there is no `worst case` line, and the run does not finish within 14 + 3 s (the man-db step has no bound, and K is fixed at 10).
  - **green** on the new script: the first line is `apt-install: worst case 14s`, the last line is `apt-install: failed after 2 attempts`, rc 1, and the wall time is ≤ 17 s.
- Save the logs as `a-round-9/red-before.log` and `a-round-9/green-after.log`.

**Explicitly NOT in this round:**
- SHA pinning of actions (RR-R1-03, signal).
- Making `check.yml` required or adding `needs:` to `release.yml` (RR-R1-07, Saba; `release.yml` is protected).
- tsx pinning (RR-R3-05: `package.json` is protected, OOS-03).
- Changing the ffprobe hint (RR-R4-03) or moving the ffprobe check into vitest (RR-R4-06).
- Any `src/**` or `tests/**` change.
- Package installs.

Read first:
- `.claude/primitives/GIT_RULES.md` (no commits; root publishes), `GEORGIAN_DOCS.md`, `AGENT_DISCOVERABLE_CODE.md` (naming of new knobs);
- `c-round-4.md` (R4-3 shim table, R4-6 replay) and `c-round-4/shims/` in the loop folder.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `.github/scripts/apt-install.sh` | D-19: knobs, bounded recovery and man-db step, `worst case` line |
| `.github/workflows/check.yml` | apt step `timeout-minutes: 13`; one build path for E2E (RR-R1-01) |
| `docs/ci-cd.md` | Georgian `check.yml` + `apt-install.sh` section (RR-R4-05) |

Generated or ignored output (`tests/fixtures/*.wav`, `out/`, `test-results/`, `playwright-report/`) is not committed. Shims, reports and logs go to `a-round-9/` in the loop folder.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R9-1 static | `bash -n`; `shellcheck .github/scripts/apt-install.sh`; a comment grep (`#` lines other than the shebang); js-yaml parse of `check.yml`; `git diff 4a2062d -- .github/workflows/check.yml` | bash and shellcheck report 0 issues; the shebang is the only `#` line. The YAML is valid. The diff only:<br>• changes the apt step's `timeout-minutes` from 10 to 13;<br>• removes the `Build` step;<br>• renames the E2E step and changes its `run:` exactly as in Scope 2.<br>The ffprobe step comes before E2E. Every `uses:` and the job timeout are unchanged. |
| R9-2 shims | C uses its own shims: extend `c-round-4/shims/` with a hang mode for `debconf-communicate` and `dpkg`. Small knobs (T=3, R=2, K=1, N=2) unless stated; each case is wrapped in an outer `timeout`.<br>(a) ok<br>(b) first apt call hangs, then ok<br>(c) apt always hangs<br>(d) **everything hangs and ignores TERM**, including `dpkg` and `debconf-communicate`<br>(e) apt exits 100<br>(f) no args<br>(g) each of the four knobs set to `0`, `-1`, `abc`<br>(h) `APT_ATTEMPTS=3`, everything hangs | (a) rc 0. The first line is `apt-install: worst case Ws`, with W from the formula for the given knobs; then `attempt 1/2 ok`.<br>(b) rc 0. The shim log argv shows `dpkg --configure -a` bounded by R.<br>(c), (d), (h) rc 1. The last line is `apt-install: failed after N attempts`. **Measured wall ≤ printed W + 3 s.** In (d) the wall time is within 3 s of W, and no orphan `sleep` is left.<br>(e) rc 1, with `failed (exit 100)` lines.<br>(f), (g) rc 2. Usage goes to stderr and names all four knobs. The shim log has no apt or sudo call.<br>**Mutation:** restore `APT_ATTEMPT_TIMEOUT_SECONDS` as the recovery bound → the (d) wall time exceeds the printed W. |
| R9-3 budget at defaults | Run the script with default knobs against `ok` shims and read the first line. Read `timeout-minutes` of "Install system packages" from `check.yml` with js-yaml. | It prints `apt-install: worst case 640s`, and 640 < 13 × 60 = 780.<br>Red on the old pair (`git show 4a2062d:`): the formula gives 750 > 600. |
| R9-4 real apt | On the runner with real `sudo`: `bash .github/scripts/apt-install.sh ffmpeg xvfb` | rc 0, `worst case 640s`, `attempt 1/2 ok after Ss`. Afterwards `ffprobe -version` and `xvfb-run -a true` work, and debconf shows `man-db/auto-update` = `false`. |
| R9-5 CI-order replay | As in R4-6: extract the `run:` steps of `check.yml` with js-yaml and run them in YAML order with `bash --noprofile --norc -eo pipefail`, `CI=true` and each step's `env`. Start clean: `rm -rf out test-results playwright-report tests/fixtures/*.wav`. Skip only `npm ci` and the `if: failure()` upload. | Every step exits 0; record the time of each step.<br>The E2E step builds `out/` itself, since no step before it builds. It gets 7/7, and the list output shows `--retries=0` took effect (no retry lines).<br>`playwright-report/index.html` exists afterwards (TM-B07 regression).<br>The ffprobe step passes before E2E. |
| R9-6 gate | Clean state, then the full `verifyCommand`. Also run E2E with `--retries=0`. | Exit 0. Biome 0 errors (9 warnings, as on `4a2062d`). Typecheck 0 errors (node/web/test). Renderer **107/107**, main **62/62**, E2E **7/7**. |
| R9-7 real-app smoke | Built app with `_electron` under `xvfb-run -a` (`--no-sandbox`, clean `XDG_CONFIG_HOME`, dialog stubbed to a temp folder with a `sample.wav` copy): Open Folder, select the row, set Category `DOORWood`, Save, Rescan. | `Tags saved`. ffprobe shows `ICAT=DOORWood`, music-metadata agrees, and the row is `Tagged`. Screenshot `c-round-9/r9-7-*.png`.<br>No app code changed; this guards against a broken build path. |
| R9-8 frozen/ownership + docs | `git status --porcelain --untracked-files=all`; `git diff --quiet 4a2062d -- . ':!.github/scripts/apt-install.sh' ':!.github/workflows/check.yml' ':!docs/ci-cd.md'`; read the docs diff. | Only the three owned paths changed. The docs diff only adds the Georgian section and states every point from Scope 3. Its numbers (defaults, 640 s, 13 min) match the script and `check.yml`. |

**What realVerified means here:**
- R9-1…R9-8 are real local checks; C may report realVerified=true for them.
- The Actions part (the step running on GitHub) is different. TM-T0-CI stays `in_progress` until root links a green `Check` run on the round-9 commit or later. C must not claim that run.
- Windows packaging is not part of this round.

## What could break (C re-checks)
- **ffprobe step:** it must still run before E2E and find `test-results/recording-tag-contract/contract.wav` (R9-5).
- **playwright-report upload (TM-B07):** `--reporter=list,html` must still reach Playwright through `npm run test:e2e --` (R9-5: `playwright-report/index.html`).
- **`--retries=0`** must reach Playwright, not `npm run build` (R9-5).
- **apt step on a healthy runner:** still one fast attempt (R9-4). `--no-install-recommends` still gives `xauth`, which is a Depends of xvfb (RR-R4-01).
- **Script usage and exit codes:** 0, 1 and 2 are unchanged (R9-2 e/f/g).
- **App behaviour:** not touched; the R9-6 gate and the R9-7 smoke confirm it.

## Next (orientation only)
1. Root links a `Check` Actions run on `7879ee0` or later (any published commit, including this round's). If it is green, TM-T0-CI, TM-T0 and the Actions part of TM-T0-CI-FU close.
2. Saba question batch:
   - D-07 (TM-T1-MIG);
   - D-10 plus TM-B11;
   - D-12/TM-B08 plus B-R6-01;
   - TM-T1-DUP (RR-R3-01);
   - D-15 plus RR-R5-01;
   - B-R7-02/RR-R8-04: validate `riffChunkId` when `schema.json` is loaded. This rejects or flags user fields, so it is a behaviour decision;
   - TM-B05, TM-B06, RR-R1-07, RR-R3-05;
   - TM-T2-DATA. T-2 stays BLOCKED until it arrives.
3. Low items without a decision, candidates once this round closes:
   - RR-R5-02 (renderer `typeof` guard);
   - C-R8-01 (a failed batch save leaves "Multiple values" in the panel; reproduce first);
   - RR-R1-04/RR-R1-05 (`create-fixtures.ts`).
