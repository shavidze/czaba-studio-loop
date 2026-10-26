# A — Round 4 ანგარიში: TM-T0-CI apt hardening + RR-R3-02

Implementer: A · 2026-10-26 · Baseline HEAD `230b87a`, სუფთა working tree (შემოწმდა სამუშაოს დაწყებამდე). commit, push და install არ გაკეთებულა.

## შეცვლილი ფაილები (მხოლოდ owned paths)
| ფაილი | ცვლილება |
|---|---|
| `.github/scripts/apt-install.sh` (ახალი, mode 755) | bounded, non-interactive apt install; man-db off; retry; ყოველ attempt-ზე timing line |
| `.github/workflows/check.yml` | "Install system packages" → `timeout-minutes: 10` + `run: bash .github/scripts/apt-install.sh ffmpeg xvfb`; "Install Electron system libraries" → `timeout-minutes: 10`. სხვა არაფერი შეცვლილა (diff: 6 lines) |
| `tests/contract/check-ffprobe-tags.ts` | ახალი export `CONTRACT_WAV_PRODUCER_TEST`; missing-file error ახლა: `WAV file not found: <path>. It is written by tests/main/recording-tag-contract.test.ts (T1-1) during npm run check; run that first.` სხვა არაფერი შეცვლილა |
| `tests/main/check-ffprobe-tags.test.ts` (ახალი) | 2 ტესტი: (1) missing path-ის error შეიცავს `WAV file not found`-ს და producer-ს, და `spawnSync` **არ** გამოიძახება (`vi.mock` spy-ით); (2) constant ემთხვევა რეალურად არსებულ ფაილს (`existsSync`) |

## სკრიპტის დიზაინი
- `set -euo pipefail`. არგუმენტების გარეშე, ან არა-დადებითი-მთელი env მნიშვნელობისას: usage stderr-ზე და exit 2.
- ჯერ man-db გამოირთვება: `echo 'set man-db/auto-update false' | sudo debconf-communicate` (`|| true`), შემდეგ `sudo rm -f /var/lib/man-db/auto-update`.
- ყოველი გამოძახება: `sudo env DEBIAN_FRONTEND=noninteractive timeout --kill-after=10 <N> apt-get -o Dpkg::Use-Pty=0 …`.
  - `timeout` sudo-ს **შიგნით** ეშვება, root-ად. ასე, real sudo `use_pty`-ის დროსაც, process group-ის kill აღწევს apt-get-სა და dpkg-მდე.
  - install: `-y --no-install-recommends <pkgs>`.
- Attempt budget = `APT_ATTEMPT_TIMEOUT_SECONDS` (default 240), საერთო update+install-ისთვის: install იღებს იმ დროს, რაც update-ის შემდეგ დარჩა. თუ update-მა მთელი budget დახარჯა, attempt ითვლება `timed out (apt-get update)`.
- `APT_ATTEMPTS` (default 2). attempt-ებს შორის: `dpkg --configure -a`, იგივე bound-ით და tolerant (როგორც task ითხოვს).
- Line formats:
  - `apt-install: attempt i/N ok after Xs`
  - `apt-install: attempt i/N timed out in <phase> after Xs` (exit 124/137)
  - `apt-install: attempt i/N failed (exit K) in <phase> after Xs`
  - საბოლოო, წარუმატებლობისას: `apt-install: failed after N attempts`, exit 1

## რეალურად გაშვებული შემოწმებები
| შემოწმება | შედეგი |
|---|---|
| Red-first, ტესტის პირველი ვერსია (1 test) fix-მდე | **1 failed** → `a-round-4/red-before-hint-initial.log`. მიღებული მესიჯი: `"WAV file not found: /tmp/…/contract.wav"` |
| Red, **საბოლოო** ტესტი (2 tests) 230b87a-ის contract script-ზე (`/tmp/a-r4-red` = rsync + node_modules symlink; C-ის R4-5 პროცედურა) | **2 failed / 2** → `a-round-4/red-before-hint.log` |
| Green: საბოლოო ტესტი რეალურ tree-ზე | **2/2 pass** → `a-round-4/green-after-hint.log` |
| `bash -n` + `shellcheck` (უკვე იყო დაყენებული, `/usr/bin/shellcheck`) | 0 issue |
| Shim cases, `APT_ATTEMPT_TIMEOUT_SECONDS=2` (`/tmp/a-r4-shim`; shims და logs: `a-round-4/shims/`, `log-*.txt`, `out-*.txt`) | იხ. ქვემოთ |
| Mutation: `timeout` wrapper მოხსნილი, case (b) | ჩამოეკიდა; გარე `timeout 20`-მა მოკლა 20 s-ზე (exit 124). bound რეალურია |
| სრული `verifyCommand` სუფთა state-იდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), review fix-ების შემდეგ | **exit 0** (`a-round-4/verify-final.log`). Biome 0 errors (9 warnings: pre-existing, მხოლოდ `src/`, რომელიც უცვლელია). typecheck 3/3 tsconfig, მათ შორის `tsconfig.test.json`. Renderer **79/79**. Main **42/42** (40 + 2 ახალი). E2E **7/7** |
| `npx --yes tsx@4 tests/contract/check-ffprobe-tags.ts /nonexistent/contract.wav` | exit 1, producer დასახელებულია |
| იგივე, `tests/fixtures/sample.wav`-ზე | exit 1, სამი mismatch line (როგორც ადრე) |
| იგივე, `test-results/recording-tag-contract/contract.wav`-ზე, `npm run test:main`-ის შემდეგ | exit 0: `ICAT=DOORWood`, `IKEY=door, slam`, `comment=მძიმე კარი` |
| Frozen paths (`git diff --quiet 230b87a -- src package*.json tsconfig*.json biome.json … release.yml tests/fixtures tests/e2e tests/renderer .claude docs`) | clean |
| `any` / `ts-ignore` / `ts-expect-error` / `biome-ignore` ახალ TS ფაილებში | 0. სკრიპტში მხოლოდ ერთი `#`-ხაზია: shebang |

Shim cases (wall time):
- **(a)** ok: exit 0, 0.03 s, ერთი `ok` line. apt argv-ში არის `-o Dpkg::Use-Pty=0` (update და install), `-y --no-install-recommends ffmpeg xvfb`; apt-get ხედავს `DF=noninteractive`-ს. debconf stdin = `set man-db/auto-update false`; ის და `rm -f /var/lib/man-db/auto-update` ჩაიწერა პირველ apt-get-მდე.
- **(b)** hang, მერე ok: exit 0, 2.04 s. line-ები: `timed out in apt-get update` → `dpkg --configure -a` → `ok`.
- **(c)** ყოველთვის hang: exit 1, 4.03 s. ბოლო line: `apt-install: failed after 2 attempts`.
- **(d)** ყოველთვის exit 100: exit 1, 0.03 s, ბოლო line იგივე.
- **(e)** არგუმენტების გარეშე: exit 2 + usage.
- (b)/(c)-ის შემდეგ `ps -eo args | grep -c '^sleep 999$'` = 0. (`pgrep -f 'sleep 999'`-მა ჩემივე bash command line დაითვალა, false positive იყო. C-ს ვურჩევ `pgrep -x sleep`-ს.)

## Code review (code-reviewer subagent)
- **ჩასწორდა:**
  - ტესტი (2) მხოლოდ string literal-ს ადარებდა; დაემატა `existsSync`.
  - update-მა თუ მთელი budget დახარჯა, install `timeout 1`-ით ეშვებოდა და შეცდომა install-ს ბრალდებოდა; ახლა ითვლება `timed out (apt-get update)`.
- **დარჩა, ცნობილი gap-ის სახით (proposal B-სთვის):** worst case = 2×(240+10) + recovery (240+10) ≈ 750 s, step-ის `timeout-minutes: 10` კი 600 s-ია. ასეთ დროს GitHub step-ს მოკლავს `failed after 2 attempts` line-ის დაბეჭდვამდე.
  - ჩვეულებრივი "2 attempt timeout + სწრაფი recovery" ≈ 480 s, ჯდება.
  - Task პირდაპირ ითხოვს, recovery "იმავე timeout-ით" შეიზღუდოს, ამიტომ არ შევცვალე.
  - შემოთავაზება: recovery-ს ცალკე პატარა bound (მაგ. 60 s), ან step 13 წთ.
- **შენიშვნები:**
  - phase ფრჩხილებს გარეთ გავიტანე, რომ spec-ის ზუსტი ტექსტები (`failed (exit N)`, `timed out`) ხელუხლებელი დარჩეს. მაგალითი: `failed (exit 100) in apt-get update`.
  - Shim cases ხელახლა გავუშვი ამ ცვლილების შემდეგ (`out-*.txt` განახლებულია). verifyCommand სკრიპტს არ ეხება, ამიტომ ხელახლა არ გამიშვია.
  - `(T1-1)` მესიჯში task-ის მაგალითიდანაა.

## ცნობილი gaps / რაც არ გამიშვია
- **R4-4 რეალური apt (real sudo) არ გამიშვია.** `apt-get -s install --no-install-recommends ffmpeg xvfb` = "0 upgraded, 0 newly installed" (ffmpeg 7:6.1.1-3ubuntu5 და xvfb 2:21.1.12-1ubuntu1.9 უკვე newest-ია). მაგრამ რეალური `apt-get update` ახალ candidate-ს გამოაჩენდა და install upgrade-ად გადაიქცეოდა, agent-ებს კი upgrade ეკრძალებათ. ეს C-ის R4-4-ია: სჯობს `apt-get update`-ის შემდეგ `apt-get -s`-ით დაადასტუროს, რომ upgrade არ მოხდება.
- CI-order replay (R4-6, `playwright install-deps` ჩათვლით) არ გამიშვია. იგივე მიზეზი: real apt.
- Real-app smoke (R4-7) არ გამიშვია. `src/**` უცვლელია; E2E 7/7 გავიდა.
- Biome `tests/`-ს ignore-ს უკეთებს (TM-B06), ამიტომ ახალი TS ფაილები Biome-ით არ შემოწმებულა. tsc-ით შემოწმდა.
- TM-T0-CI რჩება `in_progress`, realVerified=false, სანამ root Actions-ის მწვანე run-ს არ მიაბამს.

## Acceptance (A-ს მხარე)
- **R4-1:** YAML parse (js-yaml) და diff შემოწმდა; step-ების რიგი და job timeout 30 უცვლელია.
- **R4-2:** შემოწმდა.
- **R4-3:** shim cases (a)–(e) და mutation გაიარა.
- **R4-5:** red/green და CLI-ის 3 path გაიარა.
- **R4-6:** მხოლოდ `verifyCommand`-ის ნაწილი გაიარა, replay არა.
- **R4-8:** შემოწმდა.
- **R4-4 და R4-7:** არ გამიშვია.
- საბოლოო PASS C-ს გადასაწყვეტია.

## შემდეგი შემოწმებები C-სთვის
1. R4-3 თავისი shims-ით. ჩემი shims `a-round-4/shims/`-შია, მაგალითისთვის. orphan check: `pgrep -x sleep`.
2. R4-4 real apt: ჯერ `sudo apt-get update && apt-get -s install --no-install-recommends ffmpeg xvfb`. თუ upgrade არ ჩანს, `time bash .github/scripts/apt-install.sh ffmpeg xvfb`; შემდეგ `sudo debconf-show man-db` და `test ! -e /var/lib/man-db/auto-update`.
3. R4-6 replay: ffprobe step უნდა გაეშვას `npm run check`-ის შემდეგ და E2E-მდე. Playwright სტარტზე `test-results/`-ს შლის, და contract.wav მერე აღარ არსებობს (ეს დავადასტურე: E2E-ის შემდეგ CLI-მ "not found" დააბრუნა, უკვე ახალი hint-ით).
4. R4-5 red: restore `git show 230b87a:tests/contract/check-ffprobe-tags.ts`. მოსალოდნელია 2 failed / 2: `CONTRACT_WAV_PRODUCER_TEST` იქ undefined-ია. ეს უკვე დავადასტურე `red-before-hint.log`-ში.
