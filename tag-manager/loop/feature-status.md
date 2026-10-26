# Feature status — czaba-tag-manager

განახლდა: 2026-10-26, B round 4. round 4 დაიხურა და round 5 დაიგეგმა. სტატუსი `done` ხდება მხოლოდ C-ის რეალური შემოწმების შემდეგ. ბოლო publish: `7879ee0` (round 4). ამის წინ: `230b87a` (round 3), `c768567` (round 2), `c34ee5a` (round 1).

**CI:** run `40323787413` (`c34ee5a`) 30 წუთის job timeout-მა გააუქმა apt step-ზე. root-ის შემდგომი შენიშვნით (13:45 UTC), run `40331357825` (`c768567`) **მწვანეა**, ყველა step success, 1 წთ 24 წმ. ესე იგი hang წყვეტილი იყო. B round 3-მა ეს შენიშვნა გამოტოვა, ამიტომ round 4-ის „CI არასდროს მუშაობდა“ მოძველებული იყო; round 4 hardening-ია (fail-fast), არა მკვდარი gate-ის აღდგენა. Actions-ზე ჯერ არ ჩანს: round 3-ის ffprobe step და round 4-ის `apt-install.sh`. მათი პირველი run `7879ee0`-ზეა, root მიაბამს.

| ID | სათაური | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| TM-T0 | T-0 Linux baseline (check + E2E მწვანე ubuntu-24.04-ზე) | in_progress | C R1 PASS: T0-1 (R1-1), T0-2 (R1-2), T0-3 (R1-3), T0-4 (R1-8) | `npm ci` + postinstall დადასტურდა run `40331357825`-ით (`c768567`, root). ყველა acceptance-ს აქვს მტკიცებულება; იხურება TM-T0-CI-სთან ერთად |
| TM-B01 | E2E: Electron არ ეშვება runner-ზე `--no-sandbox`-ის გარეშე | **done** (R1) | C R1-2: 6/6 `--retries=0`. R1-4: red. R1-9: რეალური UI | — |
| TM-B02 | E2E IPC write: fixture-ის data chunk ცარიელია | **done** (R1) | C R1-5, R1-2 | — |
| TM-B03 | სუფთა checkout-ზე main ტესტები ENOENT | **done** (R1) | C R1-1, R1-3, R1-6 | — |
| TM-T0-CI | `.github/workflows/check.yml` | in_progress, realVerified=false | C R1-7, R2-7, R3-4. **C R4 PASS** (R4-1…R4-8, `7879ee0`): `.github/scripts/apt-install.sh` shim-ები a–f + mutation, real sudo/apt 16 s, სუფთა `ubuntu:24.04` container 26 s (ffprobe, xvfb-run, xauth არის), CI-რიგის replay: apt 18.5 s, install-deps 2.5 s, check 10.2 s, ffprobe 0.8 s, build 2.4 s, E2E 7/7 3.8 s. Actions: `40323787413` გაუქმდა, `40331357825` (`c768567`) მწვანე | done, როცა root მიაბამს მწვანე run-ს `7879ee0`-ზე ან მოგვიანებით. follow-up: TM-T0-CI-FU |
| TM-T0-DOC | `docs/plans/002-recording-tag-contract.md` | **done** (R1) | C R1-10. R2-ში დაემატა type-check-ის წინადადება | R3-ში სწორდება მოძველებული `:5`, `:77` (A-R2-01) |
| TM-B04 | `npm run check`-ის `tsc --noEmit` 0 ფაილს ამოწმებდა | **done** (R2), realVerified=true | C R2-1…R2-9 PASS: listFiles 9/26/32. red proof: ახალი check TS2322-ზე ვარდება, ძველი მწვანეა. 75/75, 31/31, E2E 6/6. რეალური UI save (`c-round-2/`) | — |
| TM-B07 | `check.yml` `playwright-report/`-ს ტვირთავდა, მაგრამ ის არ იქმნებოდა | **done** (R2), realVerified=true | C R2-7: `playwright-report/index.html` იქმნება, პროცესი სრულდება, YAML ვალიდურია | Actions-ის ნაწილი TM-T0-CI-ს ეკუთვნის |
| TM-T1 | T-1 tag-კონტრაქტი: `category` → INFO `ICAT`, `IKEY`/`ICMT` round-trip, bext/iXML/data ხელუხლებელი | **done** (R3), realVerified=true | C R3-1…R3-10 PASS, `230b87a`. main 40, renderer 79, E2E 7/7. რეალური UI save: ffprobe `ICAT=DOORWood`, `IKEY=door, slam`, `comment=მძიმე კარი`. raw INFO `ICAT` 8 / `IKEY` 10 / `ICMT` **28** (task-ში შეცდომით 26 ეწერა, C-R3-02). data/bext/iXML sha256 უცვლელია | T1-6-ის Actions ნაწილი TM-T0-CI-ს ეკუთვნის |
| TM-T1-DOC | `docs/recording-tag-contract.md` + `ICAT` `WAV_METADATA.md`-ში | **done** (R3), realVerified=true | C R3-10: ქართულად, Scope 7-ის ყველა პუნქტი, ციფრები 8/10/28. D-07-ის UI გზა რეალურ UI-ში დადასტურდა (R3-7) | — |
| TM-T1-MIG | არსებულ `schema.json`-ში `category` ავტომატურად არ ჩანს | todo | C R3-7 (რეგრესია): 12-ველიანი schema იტვირთება, `+ Category (UCS)` Hidden Standard Fields-შია, ჩართვის შემდეგ ინახება (13 key) | Saba-ს D-07-ის დადასტურება. signal: RR-R3-06 (schema-ს ვერსია + merge) |
| TM-T1-DUP | ძველი custom ველი `ICAT` ID-ით ან `category` key-ით (მაგ. auto `CATE`) + ახალი სტანდარტული ველი | todo | B R2 კოდის წაკითხვა. root review R3 (RR-R3-01, medium): ერთი მნიშვნელობა `CATE`-შიც და `ICAT`-შიც იწერება, React-ში დუბლირებული key-ებია | Saba-ს გადაწყვეტა. შემოთავაზებული default: toggle დაიმალოს/უარყოფილი იყოს, თუ key ან RIFF ID უკვე დაკავებულია, + გაფრთხილება |
| TM-B09 | „Tagged“ badge კონტრაქტის ველებს არ ითვალისწინებს (`FileList.tsx:77-81` `hasTags` = title/artists/bpm) (C-R3-01) | in_progress → **R5** (low) | C R3: `c-round-3/10-after-rescan.png` | R5: `hasAnyTagValue()` D-15-ის მიხედვით (B default, Saba დაადასტურებს) + RR-R2-02 ტესტი |
| TM-T0-CI-FU | CI follow-up: `apt-install.sh`-ის worst case (~750 s) > step 600 s (C-R4-01/RR-R4-02) + ქართული docs შენიშვნა env knob-ებზე (RR-R4-05) | todo (low) | C R4 C-R4-01, root review R4 | დაიგეგმება `7879ee0`-ის Actions run-ის შედეგის შემდეგ |
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
| A-R2-01 | low | `002` plan-ის `:5` და `:77` მოძველებულია | **closed** R3 (C R3-10) |
| RR-R1-01 | medium | `check.yml`-ში ცალკე Build step | review signal |
| RR-R1-02 | medium | `ffmpeg` წინასწარ დგება, მაგრამ ჯერ არაფერი იყენებს | **closed** R3: ffprobe step იყენებს |
| RR-R1-03 | low | action-ები `@v4` tag-ზეა და არა SHA-ზე | review signal |
| RR-R1-04 | low | `create-fixtures.ts`-ის CLI guard regex | review signal (R3-ის ახალი CLI ფართო regex-ს იყენებს) |
| RR-R1-05 | low | `.tmp` ფაილი რჩება, თუ `writeFileSync` ჩავარდა | review signal |
| RR-R1-06 | info | არქიტექტურა: WAV builder ცალკე ფაილში | **closed** R3: `tests/main/riff-chunks.ts` (D-14) |
| RR-R1-07 | info | `check.yml` required check + `needs: check` `release.yml`-ში | Saba |
| RR-R2-01 | medium | `getRiffInfoTags` non-CombinedTag-ზე ისვრის write path-ზე, per-field `try`-ის გარეთ (არა regression, WAV-ზე მიუღწეველი) | signal: WAV-ზე მიუღწეველია, ეხება გაყინულ `metadata.ts`-ს; R5-ში არ შედის |
| RR-R2-02 | low | FileList-ის display fix-ს renderer ტესტი არ აქვს (`test-on-bugfix`) | **R5** |
| RR-R2-03 | low | `skipLibCheck` `src/preload/index.d.ts`-საც ფარავს | review signal |
| RR-R2-04 | info | არქიტექტურა: RiffTags-typed accessor `TagObject` double cast-ის ნაცვლად | review signal |
| C-R3-01 | low | „Tagged“ badge მხოლოდ ICAT/IKEY/ICMT-იან ფაილზე არ ჩანს | TM-B09 (**R5**) |
| C-R3-02 | low | task-ში ICMT 26 ეწერა, რეალურად 28 (ტესტი და დოკუმენტი სწორია) | **closed** R3 (B) |
| A-R3-01 | low | `tests/renderer/setup.ts` (frozen) `window`-ს plain object-ით ცვლის. `schema-editor.test.ts` `vi.hoisted`-ით უვლის გვერდს | რაუნდი, რომელიც `setup.ts`-ს ფლობს |
| RR-R3-01 | medium | ძველი custom `category` (`CATE`) + სტანდარტული toggle → ორი ველი ერთი key-ით | TM-T1-DUP (Saba) |
| RR-R3-02 | low | ffprobe step-ის ფაილს unit ტესტი ქმნის. თუ ფაილი არ არსებობს, შეცდომა მწარმოებელ ტესტს არ ასახელებს | **closed** R4 (C R4-5) |
| RR-R3-03 | info | editor-ის ყოველი save `ICAT=""`-ს წერს (D-10 განზრახ ფიქსირდება) | D-10 (Saba) |
| RR-R3-04 | low | ტესტებში ორმაგი ბრჭყალებია, `src/`-ში ერთმაგი. Biome `tests/`-ს არ ამოწმებს | TM-B06 |
| RR-R3-05 | info | `npx --yes tsx@4` მცურავ major ვერსიას ტვირთავს | signal (`package.json` დაცულია, OOS-03) |
| RR-R3-06 | info | არქიტექტურა: ვერსიიანი `schema.json` + ერთჯერადი merge `loadSchema()`-ში წყვეტს D-07-ს და TM-T1-DUP-ს | signal, Saba |
| C-R4-01 | low | `apt-install.sh` worst case ≈ 750 s > step `timeout-minutes: 10`. საბოლოო `failed after N attempts` ხაზი შეიძლება არ დაიბეჭდოს (მხოლოდ დიაგნოსტიკა) | TM-T0-CI-FU |
| RR-R4-01 | medium | `--no-install-recommends` შეიძლება `xauth`-ს აკლებდეს | **closed** R4: უარყოფილია. `apt-cache show xvfb`: `xauth` Depends-შია; C-ის container run-ში xauth დაყენდა |
| RR-R4-02 | low | იგივე, რაც C-R4-01 | TM-T0-CI-FU |
| RR-R4-03 | low | missing-file hint-ში „during npm run check“ hard-coded-ია | signal |
| RR-R4-04 | info | მეორე ტესტი მხოლოდ constant-ს + `existsSync`-ს ამოწმებს | signal |
| RR-R4-05 | low | `apt-install.sh` და env knob-ები `docs/`-ში არ არის აღწერილი | TM-T0-CI-FU |
| RR-R4-06 | info | არქიტექტურა: ffprobe-ის შემოწმება vitest-ში (skip ffprobe-ის გარეშე) ან ცალკე `npm run test:contract` | signal, RR-R1-01-თან ერთად (`package.json` დაცულია) |

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
| D-15 | „Tagged“ badge ჩანს, თუ ფაილის წაკითხული metadata-ს (meta:read აბრუნებს ზუსტად schema-ს key-ებს) ნებისმიერ ველს არაცარიელი მნიშვნელობა აქვს: string არა-whitespace შიგთავსით, string[] ერთი არა-ცარიელი ელემენტით მაინც, number > 0. `""`, whitespace, `[]`, `[""]`, `0` ცარიელია, ამიტომ ცარიელი editor save (`ICAT=""`, D-10) ფაილს tagged-ად არ აქცევს. მხოლოდ UI, შექცევადი (TM-B09) | B default (R4 close), Saba-ს დასადასტურებელი |
