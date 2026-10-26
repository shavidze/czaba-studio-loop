# Feature status — czaba-tag-manager

განახლდა: 2026-10-26, B round 1 (round 1 დაიხურა, round 2 დაიგეგმა). სტატუსი `done` ხდება მხოლოდ C-ის რეალური შემოწმების შემდეგ. ბოლო publish: `c34ee5a` (round 1).

| ID | სათაური | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| TM-T0 | T-0 Linux baseline (check + E2E მწვანე ubuntu-24.04-ზე) | in_progress | C R1 PASS: T0-1 (R1-1), T0-2 (R1-2), T0-3 (R1-3), T0-4 (R1-8) | ღიაა: `npm ci` + postinstall რეალურ Actions run-ში (TM-T0-CI) |
| TM-B01 | E2E: Electron არ ეშვება runner-ზე `--no-sandbox`-ის გარეშე | **done** (R1) | C R1-2: 6/6 `--retries=0`. R1-4: red, `FATAL setuid_sandbox`. R1-9: რეალური UI | — |
| TM-B02 | E2E IPC write: fixture-ის data chunk ცარიელია | **done** (R1) | C R1-5: რეალურ app-ში ძველი fixture → „missing data chunk“, ახალი → OK. R1-2: 6/6 | — |
| TM-B03 | სუფთა checkout-ზე main ტესტები ENOENT | **done** (R1) | C R1-1 (globalSetup ქმნის fixture-ებს). R1-3: red ENOENT / green. R1-6: CLI sha ემთხვევა, `verifyCommand` exit 0 | — |
| TM-T0-CI | `.github/workflows/check.yml` | in_progress, realVerified=false | C R1-7: YAML ვალიდურია, ლოკალური step-ები exit 0. Actions run არ ჩანს (B-ის `gh run list` → 404) | root-მა მიაბას მწვანე Actions run `c34ee5a`-ზე |
| TM-T0-DOC | `docs/plans/002-recording-tag-contract.md` | **done** (R1) | C R1-10 | R2-ში ემატება type-check-ის წინადადება |
| TM-B04 | `npm run check`-ის `tsc --noEmit` 0 ფაილს ამოწმებს | todo → **R2** (high) | B R1: config-ის გასწორების შემდეგ რჩება 21 კოდის შეცდომა 6 ფაილში (`current-task.md`) | R2: `scripts.typecheck` (3× `-p`), red proof `/tmp`-ის ასლში |
| TM-B07 | `check.yml` `playwright-report/`-ს ტვირთავს, მაგრამ ის არ იქმნება (C-R1-02) | todo → **R2** (low) | C R1: `ls playwright-report` → არ არსებობს | R2: `--reporter=list,html` |
| TM-T1 | T-1 tag-კონტრაქტი: `category` → INFO `ICAT`, `IKEY`/`ICMT` round-trip | todo | — | R3, TM-B04-ის შემდეგ. ახალი acceptance T1-10 (D-10) |
| TM-T1-DOC | `docs/recording-tag-contract.md` + `ICAT` `WAV_METADATA.md`-ში | todo | — | TM-T1-თან ერთად ან მის შემდეგ |
| TM-T1-MIG | არსებულ `schema.json`-ში `category` ავტომატურად არ ჩანს | todo | კოდი: `schema.ts:23-34` | D-07-ის დადასტურება |
| TM-T1-DUP | ძველი custom ველი `ICAT` ID-ით + ახალი სტანდარტული ველი = ორი ველი ერთ chunk-ზე | todo | — | ქცევის არჩევა |
| TM-T2 | T-2 UCS CatID combobox + ვალიდაცია + batch | blocked | — | TM-T2-DATA |
| TM-T2-DATA | UCS სიის ფაილი + ლიცენზია (Saba) | blocked | — | Saba აწვდის ფაილს და ლიცენზიას |
| TM-B05 | ცარიელი data chunk-ის მქონე WAV-ს tag-ი ვერ ეწერება (node-taglib-sharp 6.0.1) | todo (low) | B R0 ექსპერიმენტი. C R1-5: იგივე შეცდომა რეალურ app-ში | გადაწყვეტა: მკაფიო შეცდომა vs upstream |
| TM-B06 | Biome `tests/`-ს არ ამოწმებს | todo (low) | `biome.json` | TM-B04-ის შემდეგ |
| OOS-01 | Windows/macOS build, NSIS | out_of_scope | Saba: ღრუბელში მიუწვდომელია | ყოველთვის BLOCKED |
| OOS-02 | backend import tool და ბაზა | out_of_scope | Saba: ცალკე ნაკადია | მხოლოდ D-კონტრაქტი |
| OOS-03 | ახალი npm დამოკიდებულებები | out_of_scope | Saba: საჭიროებისას BLOCKED | — |

## ღია finding-ები (signal-ები, არა task-ები)

| ID | Severity | შინაარსი | სად მიდის |
|---|---|---|---|
| C-R1-01 | low | ცარიელი Keywords → `IKEY=""`. Save ამატებს `id3 `, `LIST/MID `, `IDVX`, `JUNK` chunk-ებს და `data` ბოლოში გადადის (აუდიო ბაიტები იგივეა) | D-10 → TM-T1 T1-10 |
| C-R1-02 | low | `playwright-report/` არ იქმნება | TM-B07 (R2) |
| C-R1-03 | low | `.claude/primitives/TESTING.md:129` მოძველებულია (`.claude/**` გაყინულია) | რაუნდი, რომელიც `.claude`-ს ფლობს |
| RR-R1-01 | medium | `check.yml`-ში ცალკე Build step არის, რაც `npm run test:e2e`-ისგან განსხვავდება | review signal |
| RR-R1-02 | medium | `ffmpeg` წინასწარ დგება, მაგრამ T-1-მდე არაფერი იყენებს | T-1 (T1-6) |
| RR-R1-03 | low | action-ები `@v4` tag-ზეა და არა SHA-ზე | review signal |
| RR-R1-04 | low | `create-fixtures.ts`-ის CLI guard regex | review signal |
| RR-R1-05 | low | `.tmp` ფაილი რჩება, თუ `writeFileSync` ჩავარდა | review signal |
| RR-R1-06 | info | არქიტექტურა: `tests/fixtures/wav.ts` builder (bext/iXML T-1-ისთვის) | TM-T1 hint |
| RR-R1-07 | info | არქიტექტურა: `check.yml` გახდეს required check, `release.yml`-ს დაემატოს `needs: check` | Saba (`release.yml` გაყინულია) |

## კონტრაქტის გადაწყვეტილებები (Tag Manager ↔ czaba-api recording-import)

| D-ID | გადაწყვეტილება | სტატუსი |
|---|---|---|
| D-01 | `category` (ფიქსირებული სტანდარტული ველი) → `LIST/INFO` `ICAT`. `STANDARD_PROP_MAP`-ში არ შედის, ჩაიწერება InfoTag-ით | Saba-ს მიერ დასახელებული. ალტერნატივები (`IGNR`, iXML `USER/CATID`, `ISBJ`) დასადასტურებლად ღიაა |
| D-02 | `keywords` → `IKEY`, ერთი string, გამყოფი `,`/`;` | Saba |
| D-03 | Description = `comment` → `ICMT` (ID3 `COMM` ასლს importer არ კითხულობს) | Saba |
| D-04 | INFO UTF-8-ით იწერება. importer `LIST/INFO`-ს თავად კითხულობს (UTF-8 fatal → latin1), ffprobe `format_tags`-ს არ იყენებს | Saba (K-4-ისთვის) |
| D-05 | „missing data chunk“: სწორდება fixture. ბიბლიოთეკის boundary bug → TM-B05, დამოკიდებულება არ იპაჩება | B R0 |
| D-06 | E2E-ში `--no-sandbox` მხოლოდ `process.platform === 'linux'`-ზე | B R0, C R1-მა დაადასტურა |
| D-07 | არსებული `schema.json` ავტომატურად არ მიგრირდება | Saba-ს default, დასადასტურებელი |
| D-08 | ცარიელი category დასაშვებია | Saba-ს default, დასადასტურებელი |
| D-09 | `check.yml` Tag Manager-ის repo-შია | Saba-ს default |
| D-10 | ცარიელი INFO ველი: არ ჩაიწეროს, თუ ჩაიწეროს `""`-ად და დოკუმენტირდეს? დღეს ცარიელი Keywords → `IKEY=""` (C-R1-01). B-ის შემოთავაზება: არ ჩაიწეროს (importer-ისთვის „არ არის“ = ცარიელი) | **ღია, Saba**. K-4-ის კონტრაქტს ეხება |
| D-11 | Type-check gate = `tsc --noEmit -p` node/web/test-ზე (`scripts.typecheck`). `skipLibCheck: true`, `target ES2022`. `src/preload/index.d.ts` შედის include-ში, თავად ფაილი არ იცვლება | B R1 (`requirements.md:65`-ის საფუძველზე); Saba-ს შეუძლია წინააღმდეგობა |
