# A — Round 9 ანგარიში (TM-T0-CI-FU / D-19, RR-R1-01, RR-R4-05)

Baseline: HEAD `4a2062d`, working tree სუფთა იყო. Commit/push არ გამიკეთებია.

## შეცვლილი ფაილები (მხოლოდ owned)
| ფაილი | ცვლილება |
|---|---|
| `.github/scripts/apt-install.sh` | D-19: `APT_KILL_AFTER_SECONDS` (default 10) და `APT_RECOVERY_TIMEOUT_SECONDS` (default 60) env knob-ებად; ოთხივე knob იმავე `is_positive_integer` loop-ით მოწმდება (exit 2 + usage); usage `Environment:` ხაზი ოთხივეს ასახელებს; `worst_case_seconds()` = (R+K) + N(T+K) + (N−1)(R+K), ბეჭდავს `apt-install: worst case ${W}s` ვალიდაციის შემდეგ, `disable_man_db_triggers`-მდე; `debconf-communicate` ახლა `run_bounded_as_root "$R"`-ით (`\|\| true` დარჩა, `sudo rm -f …` უცვლელი); `recover_interrupted_dpkg` → R. დანარჩენი (deadline logic, apt flags, outcome/final lines, exit codes) უცვლელი. |
| `.github/workflows/check.yml` | apt step `timeout-minutes: 10 → 13`; `Build` step წაშლილია; `E2E tests` → `Build and E2E tests`, `run: xvfb-run -a npm run test:e2e -- --retries=0 --trace=retain-on-failure --reporter=list,html`, env უცვლელი. სხვა არაფერი. |
| `docs/ci-cd.md` | ბოლოში ახალი ქართული სექცია `## Check workflow (check.yml)`: ტრიგერი, runner, ნაბიჯები, ერთი build path, apt-install.sh, 4 knob, W ფორმულა/640/13 წთ, ყველა log ხაზი, exit 0/1/2. Release სექციები ხელუხლებელია. |

`git diff --quiet 4a2062d -- . ':!…3 owned…'` → OK (FROZEN-OK). `git status --porcelain --untracked-files=all` → მხოლოდ 3 ` M` ხაზი.

## რეალურად გაშვებული შემოწმებები
Logs: `a-round-9/`.
- **Static:** `bash -n` OK; `shellcheck` 0 issues; `#` ხაზი მხოლოდ shebang (line 1); check.yml js-yaml parse OK, step order: checkout, setup-node, npm ci, apt (13), Electron libs (10), check, ffprobe, Build and E2E, upload.
- **Red** (`red-before.log`, `git show 4a2062d:` script, ყველაფერი hang-ignore-term, T=3 R=2 K=1 N=2, outer `timeout 120`): `worst case` ხაზი არ არის, rc=124 outer timeout-ზე, wall 120.0 s; script-ი unbounded `debconf-communicate`-ზე გაიჭედა. TERM-ის იგნორირებული `sleep 997` დარჩა, ხელით მოვკალი.
- **Green** (`green-after.log`, იგივე case ახალ script-ზე): პირველი ხაზი `apt-install: worst case 14s`, ბოლო `apt-install: failed after 2 attempts`, rc=1, **wall 14.02 s** (≤17). Orphan sleep 0. Shim argv-ში ჩანს: debconf `timeout --kill-after=1 2`, dpkg `timeout --kill-after=1 2`, apt `--kill-after=1 3`.
- **დამატებითი cases** (`extra-cases.log`, ჩემი shim-ები `a-round-9/shims/`, harness `run-case.sh`):
  - (a) ok, default knob-ები: `worst case 640s`, `attempt 1/2 ok after 0s`, rc 0.
  - (e) apt exit 100: `failed after 2 attempts`, rc 1.
  - (f) არგუმენტების გარეშე და (g) ოთხივე knob-ზე `0`/`-1`/`abc`: rc 2, usage ოთხივე knob-ით. Shim log-ში არცერთ ამ შემთხვევაში არ არის argv (0 call).
  - (h) N=3, ყველაფერი hang-ignore-term: `worst case 21s`, wall 21.03 s, rc 1, orphan 0.
- **R9-4-ის ექვივალენტი, რეალური apt** (`real-apt.log`): `bash .github/scripts/apt-install.sh ffmpeg xvfb` → `worst case 640s`, `attempt 1/2 ok after 2s`, rc 0. Packages უკვე დაყენებული იყო. ამის შემდეგ `ffprobe -version` 6.1.1 მუშაობს, `xvfb-run -a true` OK, debconf `man-db/auto-update` = `0 false`.
- **CI-order replay** (`ci-replay.mjs`: js-yaml-ით ამოღებული `run:` steps YAML-ის რიგით, `bash --noprofile --norc -eo pipefail`, `CI=true` + step env; გამოტოვებულია npm ci და `if:` upload; ყოველი run სუფთა state-იდან):
  - **run1: FAIL.** 1 E2E ჩავარდა: `folder-workflow.spec.ts:27` "can scan a folder via IPC", `electronApplication.firstWindow: Timeout 30000ms`. 6 passed, E2E 37.7 s. ეს job-ის პირველი Electron გაშვება იყო cold machine-ზე. ცალკე ტესტში app-მა საერთოდ ვერ გახსნა ფანჯარა, ანუ შეფერხება IPC/ცვლილებას არ ეხება. Retry ხაზი არ არის, `--retries=0` მოქმედებს. Log: `ci-replay-run1.log`.
  - **run2 და run3: PASS.** step-ების დრო: apt 1.7 s, Electron libs 2.4 s, check 10.9 s, ffprobe 0.8 s, Build and E2E 6.1 s (7 passed 2.6 s). `playwright-report/index.html` არსებობს, ffprobe step E2E-მდე გადის.
- **Gate verifyCommand** (`verify.log`, სუფთა state: `rm -rf out test-results playwright-report tests/fixtures/*.wav`): rc 0. Biome 0 errors / 9 warnings, typecheck node/web/test OK, renderer 107/107, main 62/62, E2E 7/7.
- **debconf path proof** (`real-apt.log`, advisor-ის რჩევით): `set man-db/auto-update true` → `get` = `0 true` → script rc 0 (`worst case 640s`, `attempt 1/2 ok after 2s`) → `get` = `0 false`. ე.ი. stdin გადის `sudo env … timeout … debconf-communicate`-ში. ეს ახალი bounded pipe-ის რეალური მტკიცებულებაა.
- **Code review** (`code-reviewer` subagent, static read): high/medium არ არის. გასწორდა (docs-only): (1) „ყოველი root ბრძანება timeout-ით“ შევავიწროვე debconf/apt-get/dpkg-ზე, `sudo rm -f` ამის გარეშე; (nit) `set man-db/auto-update false`; (nit) „~20 წამში“ ჩავანაცვლე observed 19 s-ით Actions run 40331357825-დან და დავამატე შენიშვნა, რომ W მიახლოებითია (~1 s/attempt `SECONDS` rounding). არ გასწორდა: (4) ძალიან დიდი knob-ის arithmetic overflow, scope-ის გარეთაა, შემოთავაზებაა B-სთვის (`^[1-9][0-9]{0,5}$`). (2) `$#` line 87-ზე კომენტარი არ არის; C-მ comment grep-ისთვის `grep -nE '^[[:space:]]*#'` გამოიყენოს. Docs edit-ის შემდეგ gate აღარ გამიშვია, რადგან Biome მხოლოდ `src/`-ს ამოწმებს და docs არცერთ შემოწმებაში არ შედის.

## Acceptance (ჩემი ლოკალური მტკიცებულება; C-ის verdict-ს არ ცვლის)
- R9-1 static: გავიარე.
- R9-2: ჩემი shim-ებით გავიარე a, e, f, g, h და d (green). C-ის b, c, mutation არ გამიშვია.
- R9-3: default-ებზე 640 გავიარე; 640 < 780.
- R9-4: გავიარე, მაგრამ packages უკვე დაყენებული იყო.
- R9-5: run2/run3 PASS, run1 FAIL (firstWindow flake). C-მ ეს სუფთა machine-ზე უნდა გაიმეოროს.
- R9-6: გავიარე ერთხელ (default retries). `--retries=0` E2E ცალკე მხოლოდ replay-ში გავუშვი.
- R9-7: **არ გამიშვია** (C-ის real-app smoke).
- R9-8: frozen/ownership გავიარე. Docs-ის შინაარსს C ამოწმებს.

TM-T0-CI რჩება `in_progress`, სანამ root Actions run-ს არ დააკავშირებს. Actions-ის შედეგი არ მაქვს.

## ცნობილი ხარვეზები
- **E2E cold-start flake:** run1-ის `test-results/` (trace) run2-მდე წაიშალა; დარჩა მხოლოდ `ci-replay-run1.log`. C: თუ flake განმეორდება, `test-results/` შეინახე. run1-ში job-ის პირველ Electron launch-ზე `firstWindow` 30 s timeout. `--retries=0`-ით CI-ში ეს ჩავარდნად იქცევა. ძველ check.yml-შიც ასევე იყო (`--retries=0` ძველადაც იყო). შემოთავაზება B-ს: ცალკე backlog item (მაგ. warm-up ან firstWindow timeout-ის გაზრდა `tests/**`-ში). ამ round-ში scope-ის გარეთაა.
- W ფორმულა attempt-ს T+K-ად თვლის. `remaining_attempt_seconds`-ის clamp to 1 თეორიულად ~1 s-ით მეტს უშვებს attempt-ში, როცა update deadline-მდე წამზე ნაკლებით ადრე სრულდება. Spec-ით ეს logic უცვლელი უნდა დარჩეს. 780 s budget-ში 140 s რეზერვია.

## შემდეგი შემოწმებები C-სთვის
1. R9-2 (b), (c), mutation (`APT_RECOVERY_TIMEOUT_SECONDS` → `APT_ATTEMPT_TIMEOUT_SECONDS` recover-ში ⇒ (d) wall > W) საკუთარი shim-ებით.
2. R9-5 სუფთა state-იდან, **სულ ცოტა 2-ჯერ**; ჩაიწერე, განმეორდება თუ არა run1-ის `firstWindow` flake.
3. R9-6 `--retries=0`-ით; R9-7 real-app smoke (DOORWood → ffprobe ICAT + music-metadata).
4. R9-8 docs diff: რიცხვები 240/2/10/60, 640, 13 წთ.
