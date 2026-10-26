# C — Round 1 ვერიფიკაცია: T-0 Linux baseline

თარიღი: 2026-10-26 · HEAD `acefccc` · runner ubuntu-24.04 · ყველა ბრძანება C-მ თავად გაუშვა. A-ის ლოგებს არ დავეყრდენი.
ევიდენცია: `c-round-1/` (ლოგები, screenshot-ები, RIFF dump).

**taskStatus: PASS** (ლოკალურად შემოწმებადი ყველა acceptance) · **realVerified: false**. მიზეზი: GitHub Actions run (R1-7 / TM-T0-CI) ჯერ არ გაშვებულა. ეს ლოკალურად ვერ შემოწმდება.

> ⚠️ `npm run check`-ის `tsc --noEmit` 0 ფაილს ამოწმებს (TM-B04). მწვანე check type safety-ის მტკიცებულება **არ არის**.

## Acceptance

| ID | შედეგი | ევიდენცია |
|---|---|---|
| R1-1 | PASS | `rm -rf out test-results playwright-report tests/fixtures/*.wav && npm run check` → exit 0. Biome „Checked 33 files … No fixes applied“; renderer 75/75; main 30/30. `ls -l` შემდეგ: `sample.wav` 88244 B, `corrupt.wav` 16 B. mtime 12:30:10 = main run-ის „Start at 12:30:10“, ანუ globalSetup-მა შექმნა. `r1-1-check.log` |
| R1-2 | PASS | `npm run build && xvfb-run -a npx playwright test --retries=0 --reporter=list` → 2 spec, **6 passed** პირველივე ცდაზე (retry არ ყოფილა). `r1-2-e2e.log` |
| R1-3 | PASS | scratch config `/tmp/cscratch/vitest.main.nosetup.ts` (`root`=repo, globalSetup-ის გარეშე, A-ის ფაილი შეუცვლელი) + fixture-ები წაშლილი → **6 failed / 24 passed**, `ENOENT … copyfile '…/tests/fixtures/sample.wav'` (`metadata.test.ts:26`). `vitest.config.main.ts` → 30/30, fixture-ები შეიქმნა. `r1-3-red.log`, `r1-3-green.log` |
| R1-4 | PASS | `xvfb-run -a node_modules/.bin/electron out/main/index.js` → exit 1, `FATAL:setuid_sandbox_host.cc(163) … chrome-sandbox is owned by root and has mode 4755`. `--no-sandbox`-ით პროცესი timeout-მდე (15 წმ) ცოცხალია. `r1-4-red.log` |
| R1-5 | PASS | რეალური app (`_electron`), `window.api.writeMetadata`: ძველი 44-ბაიტიანი `createMinimalWav()` → `Error invoking remote method 'meta:write': … WAV file is missing data chunk`; sine fixture → write+read `title` = „E2E Test Title“. `r1-5-r1-9-drive.log` |
| R1-6 | PASS | `rm tests/fixtures/*.wav; npx --yes tsx@4 tests/fixtures/create-fixtures.ts` → „Fixtures created successfully“, sample 88244 B. sha256 (sample `cbac699b…400c`, corrupt `564867d8…217c`) ემთხვევა HEAD-ის სკრიპტის output-ს (`git show HEAD:…` გაშვებული `/tmp`-ში) და globalSetup-ის output-ს. სრული `verifyCommand` → **exit 0** (75 + 30 + E2E 6 passed). `verify.log` |
| R1-7 | BLOCKED (ნაწილობრივ შემოწმდა) | `js-yaml` parse OK: `on: push, pull_request`, `permissions: contents: read`, `ubuntu-24.04`, Node 22 + npm cache. step-ები: `npm ci` → apt `ffmpeg xvfb` → `playwright install-deps chromium` → `npm run check` → `npm run build` → `xvfb-run -a npx playwright test --retries=0 --trace=retain-on-failure` → `if: failure()` upload. `needs`/secrets არ აქვს. `release.yml` უცვლელია. run-step-ები სუფთა მდგომარეობიდან ლოკალურად → exit 0 (`r1-7-ci-steps.log`). **Actions run არ გაშვებულა → TM-T0-CI ღია რჩება.** იხ. C-R1-02 |
| R1-8 | PASS | `git diff --quiet HEAD -- src package.json package-lock.json playwright.config.ts .github/workflows/release.yml .claude tsconfig*.json biome.json electron.vite.config.ts vitest.config.renderer.ts` → FROZEN-OK. `git status`: მხოლოდ ownership-ის 8 path, ignored: `out/`, `test-results/`, `tests/fixtures/*.wav`. C-ის ფაზაში tracked `git diff`-ის sha256 და `git status` უცვლელია. untracked ფაილების byte snapshot ფაზის დასაწყისში არ ავიღე, root-მა გადაამოწმოს. დამატებით: `npx tsc --noEmit -p tsconfig.test.json` → **31 error** (= B-ის baseline). შეცვლილ ფაილებში მხოლოდ არსებული `window.api`/`innerWidth` on `Page` შეცდომებია (shadowed `window`, TM-B04). `global-setup.ts`, `electron-launch.ts` და `create-fixtures.ts` `tests/**`-შია და შეცდომა არ აქვთ. `c-round-1/tsc-test.log` |
| R1-9 | PASS (baseline) | `_electron` + xvfb, `--no-sandbox`, სუფთა `XDG_CONFIG_HOME`. dialog stub → „Open Folder“ → alpha.wav/beta.wav ჩანს → alpha.wav არჩევა → Title „C Round1 Title“, Comment „C round1 comment ascii“ → „Save Tags“ → toast „Tags saved“, badge „Tagged“. **music-metadata**: title = „C Round1 Title“, comment[0].text = „C round1 comment ascii“. **ffprobe** format_tags: `title` და `comment` ემთხვევა. `beta.wav` ხელუხლებელია. `data` chunk-ის sha256 იგივეა, რაც საწყისში (`4d05c112…`). Screenshot-ები: `01-empty.png`, `02-folder-open.png`, `03-before-save.png`, `04-after-save.png` |
| R1-10 | PASS | `docs/plans/002-recording-tag-contract.md`: ქართული + English ტერმინები. სექციები Status/Priority/Context/Approach/Key Files/Verification. T-0/T-1/T-2. D-01…D-05 სიტყვასიტყვით ემთხვევა `feature-status.md`-ის 30–34 ხაზებს |

„What could break“: renderer 75/75 (globalSetup არ ეხება); „scan a folder“ ზუსტად 2 WAV-ს პოულობს; app-launch title/dimensions/`window.api` ტესტები მწვანეა; `electron-launch.ts` `--no-sandbox`-ს მხოლოდ `process.platform === "linux"`-ზე ამატებს, სხვაგან `[mainEntryPath]` (კოდი წავიკითხე); `check.yml`-ს მხოლოდ `contents: read` აქვს.

## ახალი finding-ები (A-ის diff-ით არ არის გამოწვეული, round-ს არ აფელებს)

### C-R1-01 (low): ცარიელი `IKEY` ჩაიწერება
- ნაბიჯები: R1-9-ის flow. Keywords ცარიელი რჩება, Save.
- მოსალოდნელი: ცარიელი ველი არ იწერება, ან ეს კონტრაქტში დოკუმენტირებულია.
- ფაქტი: `LIST/INFO`: `INAM`, `ICMT`, **`IKEY=""`**. ffprobe-ში ჩანს `"IKEY": ""`. ამის გარდა ფაილს ემატება `id3 `, `LIST/MID ` (TITL/COMM ასლები), `IDVX`, `JUNK` chunk-ები და `data` ბოლოში გადადის. აუდიო ბაიტ-იდენტურია. ეს არსებული `src` ქცევაა და T-1-ის კონტრაქტისთვის (D-02, importer) მნიშვნელოვანია.
- ევიდენცია: `c-round-1/r1-9-riff-chunks.json`.

### C-R1-02 (low): `check.yml`-ის `playwright-report/` არასდროს იქმნება
- `playwright.config.ts`-ს reporter არ აქვს, ამიტომ default `list` reporter-ია და `playwright-report/` არ იქმნება (ლოკალურად შემოწმდა). ჩავარდნისას artifact-ში მხოლოდ `test-results/` (trace-ები) მოხვდება. `if-no-files-found: ignore` ამას მალავს. plan doc კი წერს, რომ report აიტვირთება. ასევე `--trace=retain-on-failure` Scope 4-ის მიღმა დამატებაა: A-მ გამოაცხადა, უვნებელია.

## შენიშვნები B-სთვის
- `.claude/primitives/TESTING.md:129` მოძველებულია (fixture-ებს ახლა globalSetup ქმნის). A-მ აღნიშნა, frozen ფაილია.
- `createWavTestFixtures`-ის CLI guard `argv[1]` regex-ს ეყრდნობა. ფაილის გადარქმევისას gate-ის ხაზი ჩუმად გაქრება (A-მ აღნიშნა).

STATUS: DONE (C)
