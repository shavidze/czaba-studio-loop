# C — Round 4 verification: TM-T0-CI apt hardening + RR-R3-02

Verifier: C · 2026-10-26 · HEAD `230b87a`, working tree = მხოლოდ A-ს 4 owned path. ყველა gate და შემოწმება C-მ თავად გაუშვა. A-ს report-ს არ ვენდე. Evidence: `c-round-4/`.

## Verdict
**taskStatus: PASS** (R4-1…R4-8 ყველა გავიდა) · **realVerified: false**.
TM-T0-CI-ს რეალური acceptance არის მწვანე GitHub Actions `Check` run publish-ის შემდეგ. Task-ის თანახმად, ეს root-ის საქმეა. C-ს Actions runner-იდან არ ჩანს. ამიტომ TM-T0-CI რჩება `in_progress`, და აქ მოცემული მხოლოდ ლოკალური მტკიცებულებაა. Critical, high ან medium ბაგი ვერ ვიპოვე. ერთი low შენიშვნაა (C-R4-01).

## Acceptance

| ID | შედეგი | Evidence |
|---|---|---|
| R4-1 YAML | PASS | js-yaml parse OK. 10 step, სახელები და რიგი იგივე. job `timeout-minutes: 30`, `runs-on`, `on`, `permissions` უცვლელი. `uses:` ისევ მხოლოდ checkout@v4 / setup-node@v4 / upload-artifact@v4. ახალი action არ არის. ცვლილება მხოლოდ 2 step-შია: "Install system packages" → `run: bash .github/scripts/apt-install.sh ffmpeg xvfb` + `timeout-minutes: 10`; "Install Electron system libraries" → `timeout-minutes: 10`. `checkout` სკრიპტამდე ეშვება. `r4-1-yaml.txt`, `r4-1-check-yml.diff` |
| R4-2 static | PASS | `bash -n` OK. `shellcheck` (უკვე იყო დაყენებული) 0 issue. `set -euo pipefail`. man-db ბრძანებები პირველ apt-get-მდეა. `sudo env DEBIAN_FRONTEND=noninteractive timeout --kill-after=10 <N> apt-get -o Dpkg::Use-Pty=0 …`. install-ს აქვს `-y --no-install-recommends`. Default-ები: 240 / 2. ერთადერთი `#` ხაზი shebang-ია. `r4-2-static.txt` |
| R4-3 shims | PASS | C-ის საკუთარი shims (`c-round-4/shims/`), `APT_ATTEMPT_TIMEOUT_SECONDS=2`. ქვემოთ ცხრილი |
| R4-4 real apt | PASS | ჯერ `apt-get update` + `apt-get -s install --no-install-recommends ffmpeg xvfb`: "0 upgraded, 0 newly installed". ამის შემდეგ real `sudo`: exit 0, `apt-install: attempt 1/2 ok after 16s` (wall 15.66 s). შემდეგ: `man-db/auto-update: false`, `/var/lib/man-db/auto-update` არ არსებობს, `ffprobe version 6.1.1-3ubuntu5`, `/usr/bin/xvfb-run`, `xvfb-run -a true` მუშაობს. შენიშვნა: ამ runner-ზე setting უკვე `false` იყო და ფაილი არ არსებობდა, ასე რომ man-db ეფექტი აქ ვერ გამოირჩევა. Shim-ები ადასტურებენ, რომ ბრძანებები ეშვება. `r4-4-dryrun.txt`, `r4-4-real-apt.txt` |
| R4-4 optional (container) | info | `docker run --rm ubuntu:24.04` + pass-through sudo shim, fresh install: `attempt 1/2 ok after 26s`, script rc 0. ამის შემდეგ არსებობს ffprobe, xvfb-run და xauth. minimal image-ში man-db არ არის დაყენებული (debconf ნაბიჯი tolerant-ად გაიარა). PASS-ისთვის საჭირო არ არის. `r4-4-container.txt` |
| R4-5 red/green | PASS | A-ს `red-before-hint.log` წავიკითხე: 2 failed. C-ის red: `/tmp/c-r4-red` (rsync + node_modules symlink + `git show 230b87a:` contract script) → **2 failed / 2**. მიღებული მესიჯი: `"WAV file not found: /tmp/…/contract.wav"` და `undefined` constant. Green real tree-ზე: **2/2**. ტესტი ffprobe-ს არ იძახებს: `spawnSync` არის `vi.fn` pass-through spy და მოწმდება `not.toHaveBeenCalled()`. CLI: `/nonexistent/contract.wav` → rc 1, `…It is written by tests/main/recording-tag-contract.test.ts (T1-1) during npm run check; run that first.` `sample.wav` → rc 1, 3 mismatch line. `contract.wav` → rc 0, `ICAT=DOORWood`, `IKEY=door, slam`, `comment=მძიმე კარი`. ძველი და ახალი script-ის output byte-identical-ია sample.wav-ზე და contract.wav-ზე, განსხვავდება მხოლოდ missing-file მესიჯი. `r4-5-red.log`, `r4-5-green.log`, `r4-5-cli.txt`, `r4-5-old-vs-new.txt` |
| R4-6 gate | PASS | სუფთა state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) → სრული `verifyCommand` **exit 0**, 19.2 s. Biome: 33 ფაილი, 0 error (9 warning, pre-existing, `src/`). typecheck: node/web/test, 0 error (`tsconfig.test.json` include `tests/**/*`). Renderer **79/79**. Main **42/42** (40 + 2 ახალი). E2E **7/7**. `r4-6-verify.log` |
| R4-6 CI-order replay | PASS | `check.yml`-ის `run:` step-ები js-yaml-ით ამოვიღე და YAML-ის რიგით გავუშვი: `bash --noprofile --norc -eo pipefail`, `CI=true`, step `env`, `DEBIAN_FRONTEND` unset. დავიწყე სუფთა state-იდან, fixtures-ის გარეშე (როგორც fresh checkout-ზე). გამოვტოვე მხოლოდ `npm ci` და `if: failure()` upload. ცხრილი ქვემოთაა. `r4-6-replay.log`, `r4-6-replay-table.md` |
| R4-7 real-app smoke | PASS | built app: `_electron` + `xvfb-run -a`, `--no-sandbox`, სუფთა `XDG_CONFIG_HOME`, `dialog.showOpenDialog` stub temp folder-ზე, სადაც `sample.wav`-ის ასლია. UI-ში: Open Folder click → `sample.wav` row ჩანს ("1 files") → row click → metadata panel, `Category (UCS)` ჩანს. Screenshots: `r4-7-smoke.png`, `r4-7-smoke-category.png`. Spec: `r4-7-smoke.spec.ts` |
| R4-8 frozen/ownership | PASS | `git status`: M `check.yml`, M `tests/contract/check-ffprobe-tags.ts`, ?? `.github/scripts/apt-install.sh`, ?? `tests/main/check-ffprobe-tags.test.ts`. სხვა არაფერი. frozen-ის `git diff --quiet 230b87a -- …` exit 0. `any`, `@ts-ignore`, `@ts-expect-error` და `biome-ignore` არ არის. სკრიპტში კომენტარი არ არის. სტატუსი ასეთივე დარჩა C-ის ყველა run-ის შემდეგ. `r4-8-frozen.txt` |

### R4-3 shim results (wall time)
| Case | rc | wall | stdout | შემოწმება |
|---|---|---|---|---|
| (a) ok | 0 | 0.02 s | `attempt 1/2 ok after 0s` | apt argv: update `-o Dpkg::Use-Pty=0 update`; install `-o Dpkg::Use-Pty=0 install -y --no-install-recommends ffmpeg xvfb`. debconf stdin `[set man-db/auto-update false]` და `rm -f /var/lib/man-db/auto-update` პირველ apt-get-მდეა. ხელახლა გავუშვი `env -u DEBIAN_FRONTEND`-ით (runner-ზე ის გლობალურად იყო დაყენებული): sudo-მ დაინახა `DF=unset`, apt-get-მა `DF=noninteractive`. ეს ადასტურებს, რომ მნიშვნელობა სწორედ სკრიპტიდან მოდის (`r4-3-a-unset-df.txt`) |
| (b) hang→ok | 0 | 2.06 s | `attempt 1/2 timed out in apt-get update after 2s` → `attempt 2/2 ok after 0s` | მათ შორის `dpkg --configure -a` (bounded). orphan `sleep 999` = 0 |
| (c) always hang | 1 | 4.03 s | … `apt-install: failed after 2 attempts` | orphan = 0 |
| (d) exit 100 | 1 | 0.04 s | `failed (exit 100) in apt-get update` ×2, `apt-install: failed after 2 attempts` | |
| (e) no args | 2 | 0.00 s | usage stderr-ზე | apt ბრძანება არ გამოძახებულა |
| mutation (b), timeout wrapper მოხსნილი | 124 (გარე `timeout 30`-მა მოკლა) | 30.0 s | ცარიელი | bound რეალურია (`r4-3-mutation.diff`) |

### R4-6 replay timings
| # | Step | Result | Time |
|---|---|---|---|
| 1 | Install dependencies (`npm ci`) | skipped (agents never run npm ci) | - |
| 2 | Install system packages | exit 0 (`attempt 1/2 ok after 19s`) | 18.5 s |
| 3 | Install Electron system libraries | exit 0 | 2.5 s |
| 4 | Lint, type check and unit tests | exit 0 (79 + 42) | 10.2 s |
| 5 | Tag contract ffprobe cross-check | exit 0 (passed) | 0.8 s |
| 6 | Build | exit 0 | 2.4 s |
| 7 | E2E tests (`--retries=0`) | exit 0 (7 passed) | 3.8 s |

ffprobe step (5) ეშვება `npm run check`-ის შემდეგ და E2E-მდე. E2E `--retries=0`-ით: 7/7, flaky არ იყო.

## Bugs / findings
- **C-R4-01 (low, design gap; A-მ თვითონ მონიშნა).**
  - **ბიუჯეტი:** worst-case step ბიუჯეტი = 2 × (240 + 10 kill-after) + recovery (240 + 10) ≈ 750 s. ეს მეტია step-ის `timeout-minutes: 10`-ზე (600 s).
  - **შედეგი:** თუ ორივე attempt-ში apt ჩამოეკიდება და TERM-ს უგულებელყოფს, ან `dpkg --configure -a` ჩამოეკიდება, GitHub step-ს მოკლავს `apt-install: failed after 2 attempts` ხაზის დაბეჭდვამდე. თუმცა per-attempt timing line-ები უკვე დაბეჭდილი იქნება.
  - **ჩვეულებრივი შემთხვევა:** 2 × 240 + სწრაფი recovery ≈ 480 s ჯდება ბიუჯეტში.
  - **რატომ არ არის FAIL:** task პირდაპირ ითხოვს, რომ recovery-ს "იგივე timeout" ჰქონდეს, და step 10 წთ-ს.
  - **B-სთვის:** recovery-ს ცალკე პატარა bound (მაგ. 60 s), ან step 13 წთ.
- სხვა reproducible ბაგი ვერ ვიპოვე.

## რაც ვერ შემოწმდა / შენიშვნები
- **GitHub Actions `Check` run ვერ შემოწმდა:** ეს არის TM-T0-CI-ს real acceptance, root-ის საქმე, და C-ს Actions არ ჩანს. ამიტომ realVerified=false.
- **man-db-ს ჰიპოთეზა (hang-ის მიზეზი) არ დადასტურებულა:** ამ runner-ზე `auto-update` უკვე false იყო, container-ში კი man-db არ არის. სკრიპტის ღირებულება fail-fast-ში და timing line-ებშია, როგორც task ამბობს.
- **Untracked ფაილები:** `.github/scripts/apt-install.sh` (mode 755) და ახალი ტესტი untracked-ია. publish-ისას root-მა უნდა გააკეთოს `git add`, თორემ CI step ფაილს ვერ იპოვის.
- **`verifyCommand`-ის E2E:** იყენებს `playwright.config.ts`-ის `retries: 1`-ს. `--retries=0` შემოწმდა replay-ში (7/7).

## დამატება (advisor review-ის შემდეგ)
**მნიშვნელოვანია:** `realVerified=false` ნიშნავს **მხოლოდ** იმას, რომ GitHub Actions run აქ ვერ შემოწმდება. ამ round-ის ყველა ლოკალური real check C-მ რეალურად გაუშვა. მათ შორის:
- real `sudo` + real apt (R4-4);
- real-sudo kill path (ქვემოთ);
- built Electron app UI-ით, `xvfb-run`-ის ქვეშ, screenshot-ებით (R4-7);
- სრული gate და CI-order replay (R4-6).

დამატებითი R4-3/R4-4 შემოწმებები:

| Case | rc | wall | stdout | შემოწმება |
|---|---|---|---|---|
| (f) apt-get **TERM-ს უგულებელყოფს** (`trap '' TERM; exec sleep 997`), ყოველთვის hang | 1 | 24.0 s | `attempt 1/2 timed out in apt-get update after 12s` ×2, `apt-install: failed after 2 attempts` | `--kill-after=10` escalation რეალურად მუშაობს. exit 137 → `timed out`. orphan = 0 (`c-round-4/r4-3-f-kill-after.txt`) |
| real `sudo` kill path (shim-ის გარეშე) | 124 / 137 | 2.0 s / 4.0 s | — | `sudo env … timeout --kill-after=2 2 sleep 999` → rc 124. იგივე, TERM ignored-ით → rc 137. ორივე შემთხვევაში orphan 0. ანუ bound real sudo-ს გავლითაც მუშაობს (`c-round-4/r4-4-real-sudo-kill.txt`) |

ამ run-ების შემდეგ `git status --porcelain --untracked-files=all` ისევ მხოლოდ 4 owned path-ს აჩვენებს (`c-round-4/r4-8-frozen.txt`, ბოლო ბლოკი). Verdict უცვლელია: **PASS**, realVerified=false.
