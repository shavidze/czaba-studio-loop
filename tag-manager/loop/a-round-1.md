# A — Round 1 ანგარიში: T-0 Linux baseline

თარიღი: 2026-10-26 · HEAD `acefccc` (commit არ გაკეთებულა) · runner: ubuntu-24.04

## შეცვლილი ფაილები (მხოლოდ ownership ცხრილიდან)
| ფაილი | ცვლილება |
|---|---|
| `vitest.config.main.ts` | +1 ხაზი: `globalSetup: ["./tests/main/global-setup.ts"]` |
| `tests/main/global-setup.ts` (ახალი) | default export `setupMainTestFixtures()` → `createWavTestFixtures(fileURLToPath(new URL("../fixtures/", import.meta.url)))` |
| `tests/fixtures/create-fixtures.ts` | `createWavBuffer` → exported `createSineWavBuffer` (+ guard: `durationSamples` უნდა იყოს მთელი რიცხვი ≥ 1, რომ TM-B05-ის 0-sample WAV არ შეიქმნას); exported `createWavTestFixtures(targetDir)`; ფაილები temp-ში იწერება და მერე `renameSync`-ით ინაცვლებს; CLI იცავს `/(^\|[\\/])create-fixtures\.ts$/` `process.argv[1]`-ზე. `__dirname`-ის ნაცვლად `dirname(resolve(argv[1]))`, ამიტომ CJS(tsx)/ESM(vitest) ორივეში მუშაობს |
| `tests/e2e/electron-launch.ts` (ახალი) | `getElectronLaunchArgs(mainEntryPath)`: `--no-sandbox` მხოლოდ `process.platform === "linux"`-ზე |
| `tests/e2e/app-launch.spec.ts` | მხოლოდ import + `args: getElectronLaunchArgs(...)` |
| `tests/e2e/folder-workflow.spec.ts` | `createMinimalWav()` (44 ბაიტი, ცარიელი data) წაიშალა → `createSineWavBuffer(4410)` (0.1 წმ, 8864 ბაიტი); launch args helper-ით. ტესტების სახელები და assertion-ები უცვლელია |
| `.github/workflows/check.yml` (ახალი) | push + pull_request, `ubuntu-24.04`, Node 22 + npm cache, `permissions: contents: read`; `npm ci` → apt `ffmpeg xvfb` → `npx playwright install-deps chromium` → `npm run check` → `npm run build` → `xvfb-run -a npx playwright test --retries=0 --trace=retain-on-failure`; `if: failure()` upload `playwright-report/` + `test-results/` |
| `docs/plans/002-recording-tag-contract.md` (ახალი) | ქართულად, 6 სექცია, T-0/T-1/T-2, D-01…D-05 `feature-status.md`-დან |

Frozen ფაილები: `git diff --quiet HEAD -- src package.json package-lock.json playwright.config.ts .github/workflows/release.yml .claude tsconfig*.json biome.json electron.vite.config.ts vitest.config.renderer.ts` → FROZEN-OK.

## Red → green (test-on-bugfix), ლოგები `a-round-1/`-ში
| Bug | Red (ჩემი fix-მდე) | Green |
|---|---|---|
| TM-B03 | `red-b03.log`: fixture-ები წაშლილი, `vitest --config vitest.config.main.ts` → 6 failed / 24 passed, `ENOENT … tests/fixtures/sample.wav` (`metadata.test.ts:26`) | `green-b03.log`: 30/30, fixture-ები `globalSetup`-მა შექმნა |
| TM-B01 | `red-e2e.log`: `--retries=0`-ით 2 failed „Process failed to launch!“ (ორივე beforeAll; 0/6 გავიდა) | `green-e2e.log` 6/6 |
| TM-B02 | `red-b02.log` (launch fix მზადაა, fixture ჯერ ძველია): 5 passed, 1 failed „Error invoking remote method 'meta:write': … WAV file is missing data chunk“ | `green-e2e.log` 6/6 |

## რა გავუშვი (საბოლოო მდგომარეობაზე, code-review fix-ების შემდეგ)
- `rm -rf out test-results playwright-report tests/fixtures/*.wav && npm run check` → exit 0; Biome „Checked 33 files … No fixes applied“; renderer 75/75; main 30/30; `sample.wav` 88244 B და `corrupt.wav` 16 B შეიქმნა. sha256 იგივეა, რაც ორიგინალი სკრიპტის output-ში: sample `cbac699b…400c`, corrupt `564867d8…217c`.
- CLI: `npx --yes tsx@4 tests/fixtures/create-fixtures.ts` → „Fixtures created successfully“, ფაილები ბაიტ-იდენტურია HEAD-ის სკრიპტის output-თან (`git stash`-ით შედარდა). ასევე გაეშვა `/tmp`-დან absolute path-ით და გაიარა.
- სრული `verifyCommand` (`{ tsx fixtures && npm run check && xvfb-run -a npm run test:e2e; }`) → exit 0, 75 + 30 + E2E 6 passed (`verify.log`). შენიშვნა: `test:e2e` იყენებს config-ის `retries: 1`-ს, მაგრამ flaky/retry არ ყოფილა.
- `npm run build` → 0; `xvfb-run -a npx playwright test --retries=0 --reporter=list` → 6/6 (`green-e2e.log`, `e2e.log`); CI-ს ზუსტი ბრძანება `xvfb-run -a npx playwright test --retries=0 --trace=retain-on-failure` → 6 passed (`e2e-final.log`). `verify.log`-ში `flaky`/retry 0-ჯერ ჩანს.
- **Scope 4-იდან გადახვევა:** E2E step-ს დავამატე `--trace=retain-on-failure` (code-review finding 1: `--retries=0`-ით config-ის `on-first-retry` trace არასდროს იწერება). trace-ები `test-results/`-ში ხვდება და ის უკვე იტვირთება artifact-ად; `playwright-report/` default reporter-ით არ იქმნება (`if-no-files-found: ignore`). ცვლილება ერთი flag-ია და ადვილად მოიხსნება.
- `npx playwright install-deps --dry-run chromium` (Playwright 1.58.2) noble-ის პაკეტებს ითხოვს (`libasound2t64`, `libatk1.0-0t64`, `libgbm1`, `libnss3`, …), `install-deps-dryrun.log`. ეს მხოლოდ dry-run-ია, რეალური Actions run-ი არ არის.
- check.yml: `js-yaml`-ით parse → on = `[push, pull_request]`, runs-on `ubuntu-24.04`, 9 step. run-step-ები ლოკალურად (`npm ci`/apt/install-deps-ის გარეშე) = ზემოთ ჩამოთვლილი check/build/e2e, ყველა მწვანეა.
- `npx tsc --noEmit -p tsconfig.test.json` → 31 error, ზუსტად B-ის baseline. შეცვლილ/ახალ ფაილებში ახალი შეცდომა არ არის. არსებული შეცდომებიდან ზოგი e2e spec-ებშია (`window.api`/`innerWidth` `Page`-ზე, shadowed `window`): ესენი TM-B04-ისაა და არა ჩემი ცვლილების.
- Biome: `biome.json` `tests/`-ს და root config-ებს იგნორირებს (TM-B06). stdin probe-მა (`--stdin-file-path=src/__probe.ts`) lint დარღვევა არ აჩვენა, მხოლოდ quote style (src-ში single, tests-ში არსებული double). tests-ის არსებული სტილი დავტოვე.
- Code review: `code-reviewer` subagent. blocking findings არ ყოფილა. გასწორებულია: (1) CI-ში trace (`--trace=retain-on-failure`; html reporter განზრახ არ დავამატე: lokal-ად `open: on-failure` server-ს ხსნის) (`--retries=0`-ით `on-first-retry` trace არასდროს იწერებოდა); (2) argv regex anchor; (3) `createSineWavBuffer(0)` guard; (4) ატომური ჩაწერა parallel `test:main`-ისთვის. არ გასწორებულა: `concurrency` group check.yml-ში (scope-ის მიღმა, სურვილისამებრ); ffmpeg რჩება, რადგან Scope 4 და T-1 მოითხოვს. ეს plan doc-ში წერია.

## Acceptance — რეალურად რა გავიარე (A-ის თვითშემოწმება; საბოლოო PASS C-ისაა)
- R1-1: გავუშვი, მწვანეა (ზემოთ).
- R1-2: გავუშვი, 6/6, `--retries=0`.
- R1-3: red/green ჩემი fix-მდე/შემდეგ, HEAD config-ით (scratch config-ის ნაცვლად). C-მ scratch copy-ით უნდა გაიმეოროს.
- R1-4: red `red-e2e.log` (Playwright „Process failed to launch!“). plain `electron` FATAL ხაზი თავად არ გამიმეორებია, ის B-ის R0 ფაქტია.
- R1-5: red `red-b02.log`.
- R1-6: გავუშვი (88244 B, output ტექსტი), სრული verifyCommand exit 0.
- R1-7: YAML parse + ლოკალური ნაბიჯები. **realVerified=false** Actions run-ისთვის: GitHub-ზე არ გაშვებულა.
- R1-8: FROZEN-OK, `git status` მხოლოდ ownership-ის ფაილებს აჩვენებს.
- R1-9: **არ გამიშვია** (UI baseline C-ის საქმეა).
- R1-10: doc დაწერილია. C ამოწმებს.

## ცნობილი ხარვეზები / შენიშვნები B-სთვის
- `.claude/primitives/TESTING.md:129` ჯერ კიდევ წერს „CI-ში `create-fixtures.ts` უნდა გაეშვას ტესტებამდე“. ახლა ამას `globalSetup` აკეთებს. ფაილი frozen-ია (`.claude/**`), ამიტომ შემდეგ რაუნდში განახლდეს.
- `check.yml`-ს `concurrency` არ აქვს: same-repo PR-ზე push + pull_request ორჯერ გაეშვება. `release.yml` check-ზე არ არის დამოკიდებული (by design, Scope 4) და Node 20-ს იყენებს.
- `npx playwright install-deps chromium` sudo/apt-ს იყენებს. GitHub runner-ზე ეს სტანდარტულია, მაგრამ რეალურად მხოლოდ Actions run დაადასტურებს.
- `tsc` type safety-ის მტკიცებულება არ არის (TM-B04).
- ატომური ჩაწერა ქმნის `tests/fixtures/*.wav.<pid>.tmp`-ს. ჩაწერის დროს crash-ის შემთხვევაში ეს ფაილი untracked დარჩება. follow-up: `.gitignore`-ში `tests/fixtures/*.tmp` (ownership-ის მიღმაა).
- `create-fixtures.ts`-ის CLI guard `argv[1]`-ს ეყრდნობა. ფაილის გადარქმევის შემთხვევაში CLI ჩუმად აღარ ჩაწერს: gate-ის `Fixtures created successfully` ხაზი გაქრება.

## შემდეგი შემოწმებები C-სთვის
1. R1-1 ზუსტად: `rm -rf out test-results playwright-report tests/fixtures/*.wav && npm run check; ls -l tests/fixtures`.
2. R1-3 scratch config: `/tmp/vitest.main.nosetup.ts` `root`-ით repo-ზე, `globalSetup`-ის გარეშე → ENOENT. შემდეგ `vitest.config.main.ts` → 30/30.
3. R1-4: `xvfb-run -a node_modules/.bin/electron out/main/index.js` → SUID FATAL.
4. R1-5: scratch spec ძველი 44-ბაიტიანი WAV-ით → „missing data chunk“.
5. R1-2/R1-6/R1-7 ზემოთ მოცემული ბრძანებებით. Windows/mac: `electron-launch.ts`-ის კოდის წაკითხვა.
6. R1-9 რეალური UI + `music-metadata` + `ffprobe`.
7. Renderer config-ს `globalSetup` არ აქვს (`vitest.config.renderer.ts` frozen/უცვლელი) → 75/75.

STATUS: DONE (A). realVerified: ლოკალური runner-ის ბრძანებები რეალურად გავუშვი. Actions run და R1-9 არ გამიშვია.
