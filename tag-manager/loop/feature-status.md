# Feature status — czaba-tag-manager

განახლდა: 2026-10-26, B round 2. round 2 დაიხურა და round 3 დაიგეგმა. სტატუსი `done` ხდება მხოლოდ C-ის რეალური შემოწმების შემდეგ. ბოლო publish: `c768567` (round 2). ამის წინ: `c34ee5a` (round 1).

| ID | სათაური | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| TM-T0 | T-0 Linux baseline (check + E2E მწვანე ubuntu-24.04-ზე) | in_progress | C R1 PASS: T0-1 (R1-1), T0-2 (R1-2), T0-3 (R1-3), T0-4 (R1-8) | ღიაა: `npm ci` + postinstall რეალურ Actions run-ში (TM-T0-CI) |
| TM-B01 | E2E: Electron არ ეშვება runner-ზე `--no-sandbox`-ის გარეშე | **done** (R1) | C R1-2: 6/6 `--retries=0`. R1-4: red. R1-9: რეალური UI | — |
| TM-B02 | E2E IPC write: fixture-ის data chunk ცარიელია | **done** (R1) | C R1-5, R1-2 | — |
| TM-B03 | სუფთა checkout-ზე main ტესტები ENOENT | **done** (R1) | C R1-1, R1-3, R1-6 | — |
| TM-T0-CI | `.github/workflows/check.yml` | in_progress, realVerified=false | C R1-7 (YAML + ლოკალური step-ები), C R2-7 (E2E step `list,html`). Actions run ჯერ არავის უნახავს | root-მა მიაბას მწვანე Actions run `c768567`-ზე ან უფრო გვიანდელ commit-ზე |
| TM-T0-DOC | `docs/plans/002-recording-tag-contract.md` | **done** (R1) | C R1-10. R2-ში დაემატა type-check-ის წინადადება | R3-ში სწორდება მოძველებული `:5`, `:77` (A-R2-01) |
| TM-B04 | `npm run check`-ის `tsc --noEmit` 0 ფაილს ამოწმებდა | **done** (R2), realVerified=true | C R2-1…R2-9 PASS: listFiles 9/26/32. red proof: ახალი check TS2322-ზე ვარდება, ძველი მწვანეა. 75/75, 31/31, E2E 6/6. რეალური UI save (`c-round-2/`) | — |
| TM-B07 | `check.yml` `playwright-report/`-ს ტვირთავდა, მაგრამ ის არ იქმნებოდა | **done** (R2), realVerified=true | C R2-7: `playwright-report/index.html` იქმნება, პროცესი სრულდება, YAML ვალიდურია | Actions-ის ნაწილი TM-T0-CI-ს ეკუთვნის |
| TM-T1 | T-1 tag-კონტრაქტი: `category` → INFO `ICAT`, `IKEY`/`ICMT` round-trip, bext/iXML/data ხელუხლებელი | in_progress → **R3** | B R2 კოდის წაკითხვა: `category` (text + `riffChunkId`) `keywords`-ის InfoTag გზას მიჰყვება. `metadata.ts` გაყინულია | R3: T1-1…T1-10 (`current-task.md`, R3-1…R3-10) |
| TM-T1-DOC | `docs/recording-tag-contract.md` + `ICAT` `WAV_METADATA.md`-ში | in_progress → **R3** | — | R3-10 |
| TM-T1-MIG | არსებულ `schema.json`-ში `category` ავტომატურად არ ჩანს | todo | R3-7-ში C მხოლოდ რეგრესიას ამოწმებს | Saba-ს D-07-ის დადასტურება |
| TM-T1-DUP | ძველი custom ველი `ICAT` ID-ით ან `category` key-ით + ახალი სტანდარტული ველი | todo | B R2: custom key `category` → toggle-ის შემდეგ ორი ველი ერთი key-ით (`SchemaEditor.tsx:38-59`) | Saba-ს გადაწყვეტა |
| TM-B08 | Artists იწერება ორ `ISTR`-ად, არა `IART`-ად. ffprobe-ის `artist` = მხოლოდ პირველი (C-R2-01) | todo (low) | C R2-6: `c-round-2/r2-6-result.json` | D-12: Saba წყვეტს, შედის თუ არა artists კონტრაქტში |
| TM-T2 | T-2 UCS CatID combobox + ვალიდაცია + batch | blocked | — | TM-T2-DATA |
| TM-T2-DATA | UCS სიის ფაილი + ლიცენზია (Saba) | blocked | — | Saba აწვდის ფაილს და ლიცენზიას |
| TM-B05 | ცარიელი data chunk-ის მქონე WAV-ს tag-ი ვერ ეწერება (node-taglib-sharp 6.0.1) | todo (low) | B R0, C R1-5 | გადაწყვეტა: მკაფიო შეცდომა vs upstream |
| TM-B06 | Biome `tests/`-ს არ ამოწმებს | todo (low) | `biome.json` | TM-B04 დასრულდა, შეიძლება დაიგეგმოს |
| OOS-01 | Windows/macOS build, NSIS | out_of_scope | Saba: ღრუბელში მიუწვდომელია | ყოველთვის BLOCKED |
| OOS-02 | backend import tool და ბაზა | out_of_scope | Saba: ცალკე ნაკადია | მხოლოდ D-კონტრაქტი |
| OOS-03 | ახალი npm დამოკიდებულებები | out_of_scope | Saba: საჭიროებისას BLOCKED | — |

## ღია finding-ები (signal-ები, არა task-ები)

| ID | Severity | შინაარსი | სად მიდის |
|---|---|---|---|
| C-R1-01 | low | ცარიელი Keywords → `IKEY=""`. Save ამატებს `id3 `, `LIST/MID `, `IDVX`, `JUNK` chunk-ებს და `data` ბოლოში გადადის (აუდიო ბაიტები იგივეა) | D-10 → T1-10 (R3-ში ფიქსირდება არსებული ქცევა) |
| C-R1-03 | low | `.claude/primitives/TESTING.md:129` მოძველებულია | რაუნდი, რომელიც ამ ფაილს ფლობს |
| C-R2-01 | low | artists → ორი `ISTR` (schema-ში `IART` წერია) | TM-B08, D-12 |
| A-R2-01 | low | `002` plan-ის `:5` და `:77` მოძველებულია | R3 (owned) |
| RR-R1-01 | medium | `check.yml`-ში ცალკე Build step | review signal |
| RR-R1-02 | medium | `ffmpeg` წინასწარ დგება, მაგრამ ჯერ არაფერი იყენებს | R3: T1-6 step |
| RR-R1-03 | low | action-ები `@v4` tag-ზეა და არა SHA-ზე | review signal |
| RR-R1-04 | low | `create-fixtures.ts`-ის CLI guard regex | review signal (R3-ის ახალი CLI ფართო regex-ს იყენებს) |
| RR-R1-05 | low | `.tmp` ფაილი რჩება, თუ `writeFileSync` ჩავარდა | review signal |
| RR-R1-06 | info | არქიტექტურა: WAV builder ცალკე ფაილში | R3: `tests/main/riff-chunks.ts` (D-14) |
| RR-R1-07 | info | `check.yml` required check + `needs: check` `release.yml`-ში | Saba |
| RR-R2-01 | medium | `getRiffInfoTags` non-CombinedTag-ზე ისვრის write path-ზე, per-field `try`-ის გარეთ (არა regression, WAV-ზე მიუღწეველი) | შემდეგი მცირე bug round |
| RR-R2-02 | low | FileList-ის display fix-ს renderer ტესტი არ აქვს (`test-on-bugfix`) | შემდეგი მცირე bug round |
| RR-R2-03 | low | `skipLibCheck` `src/preload/index.d.ts`-საც ფარავს | review signal |
| RR-R2-04 | info | არქიტექტურა: RiffTags-typed accessor `TagObject` double cast-ის ნაცვლად | review signal |

## კონტრაქტის გადაწყვეტილებები (Tag Manager ↔ czaba-api recording-import)

| D-ID | გადაწყვეტილება | სტატუსი |
|---|---|---|
| D-01 | `category` (ფიქსირებული სტანდარტული ველი) → `LIST/INFO` `ICAT`. `STANDARD_PROP_MAP`-ში არ შედის, ჩაიწერება InfoTag-ით | Saba-ს მიერ დასახელებული. ალტერნატივები (`IGNR`, iXML `USER/CATID`, `ISBJ`) დასადასტურებლად ღიაა. R3 ახორციელებს default-ს |
| D-02 | `keywords` → `IKEY`, ერთი string, გამყოფი `,`/`;` | Saba |
| D-03 | Description = `comment` → `ICMT` (ID3 `COMM` ასლს importer არ კითხულობს) | Saba |
| D-04 | INFO UTF-8-ით იწერება. importer `LIST/INFO`-ს თავად კითხულობს (UTF-8 fatal → latin1), ffprobe `format_tags`-ს არ იყენებს | Saba (K-4-ისთვის) |
| D-05 | „missing data chunk“: სწორდება fixture. ბიბლიოთეკის bug → TM-B05 | B R0 |
| D-06 | E2E-ში `--no-sandbox` მხოლოდ `process.platform === 'linux'`-ზე | B R0, C R1 |
| D-07 | არსებული `schema.json` ავტომატურად არ მიგრირდება | Saba-ს default, დასადასტურებელი |
| D-08 | ცარიელი category დასაშვებია | Saba-ს default, დასადასტურებელი |
| D-09 | `check.yml` Tag Manager-ის repo-შია | Saba-ს default |
| D-10 | ცარიელი INFO ველი. დღეს ცარიელი მნიშვნელობა იწერება ნულოვანი ზომის sub-chunk-ად (`IKEY=""`, C-R1-01). **ახალი შედეგი:** single-file save (`MetadataPanel.tsx:76`) ყველა ველს აგზავნის, ამიტომ T-1-ის შემდეგ ყოველი save დაწერს `ICAT=""`-ს. უბრალოდ „არ ჩაიწეროს“ ძველ მნიშვნელობას ვეღარ წაშლის. რეალური ვარიანტებია (a) `""`-ის ჩაწერა (დღევანდელი ქცევა) და (b) sub-chunk-ის წაშლა. R3 (a)-ს ტესტით აფიქსირებს | **ღია, Saba**. K-4: importer-ისთვის „არ არის“ = „ცარიელი“ |
| D-11 | Type-check gate = `tsc --noEmit -p` node/web/test (`scripts.typecheck`) | B R1. C R2-მ დაადასტურა (done) |
| D-12 | K-4 კონტრაქტი მოიცავს მხოლოდ `ICAT`/`IKEY`/`ICMT`-ს. `STANDARD_PROP_MAP` ველების `riffChunkId` ინფორმაციულია და SchemaEditor-ისთვის რეზერვირებული. რეალურ chunk-ს node-taglib-sharp ირჩევს (artists → `ISTR` თითო მნიშვნელობაზე) | B R2. Saba-ს კითხვა: შედის თუ არა artists კონტრაქტში (TM-B08) |
| D-13 | `category` `STANDARD_FIELDS`-ის **ბოლო** ელემენტია, `keywords`-ის შემდეგ: `{ key: 'category', label: 'Category (UCS)', type: 'text', riffChunkId: 'ICAT', standard: true }` | B R2 |
| D-14 | bext/iXML ტესტ-WAV იქმნება `tests/main/riff-chunks.ts`-ში (`tests/fixtures/**` გაყინულია). ffprobe-ის შემოწმება ცალკე `check.yml` step-ია (`tests/contract/check-ffprobe-tags.ts`, ფაილი: `test-results/recording-tag-contract/contract.wav`). `npm run check`-ს ffprobe არ სჭირდება | B R2 |
