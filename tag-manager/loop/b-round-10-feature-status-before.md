# Feature status — czaba-tag-manager

განახლდა: 2026-10-26, B round 9. round 9 დაიხურა და round 10 დაიგეგმა. სტატუსი `done` ხდება მხოლოდ C-ის რეალური შემოწმების შემდეგ. ბოლო publish: `499a6f3` (round 9). ამის წინ: `4a2062d` (round 8), `28ad3ab` (round 7), `d52354d` (round 6), `a8c1b53` (round 5), `7879ee0` (round 4), `230b87a` (round 3), `c768567` (round 2), `c34ee5a` (round 1).

**CI:** run `40323787413` (`c34ee5a`) 30 წუთის job timeout-მა გააუქმა apt step-ზე. root-ის შემდგომი შენიშვნით (13:45 UTC), run `40331357825` (`c768567`) **მწვანეა**, ყველა step success, 1 წთ 24 წმ. ესე იგი hang წყვეტილი იყო. Actions-ზე ჯერ არ ჩანს: round 3-ის ffprobe step და round 4-ის `apt-install.sh`. B R9 close: root-ს `7879ee0`…`499a6f3`-ის Actions run ჯერ არ მიუბამს. round 9-მა (`499a6f3`) `check.yml` შეცვალა (apt step 13 წთ, ერთი build path), round 10 job timeout-ს 40 წთ-მდე ზრდის. **თხოვნა root-ს:** მიაბით `Check` run-ის id და შედეგი `499a6f3`-ზე ან ნებისმიერ ადრინდელ published commit-ზე. თუ run წითელია `firstWindow`-ზე, ეს TM-B14-ის რეალური ნიმუშია.

| ID | სათაური | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| TM-T0 | T-0 Linux baseline (check + E2E მწვანე ubuntu-24.04-ზე) | in_progress | C R1 PASS: T0-1 (R1-1), T0-2 (R1-2), T0-3 (R1-3), T0-4 (R1-8) | `npm ci` + postinstall დადასტურდა run `40331357825`-ით (`c768567`, root). ყველა acceptance-ს აქვს მტკიცებულება; იხურება TM-T0-CI-სთან ერთად |
| TM-B01 | E2E: Electron არ ეშვება runner-ზე `--no-sandbox`-ის გარეშე | **done** (R1) | C R1-2: 6/6 `--retries=0`. R1-4: red. R1-9: რეალური UI | — |
| TM-B02 | E2E IPC write: fixture-ის data chunk ცარიელია | **done** (R1) | C R1-5, R1-2 | — |
| TM-B03 | სუფთა checkout-ზე main ტესტები ENOENT | **done** (R1) | C R1-1, R1-3, R1-6 | — |
| TM-T0-CI | `.github/workflows/check.yml` | in_progress, realVerified=false | C R1-7, R2-7, R3-4. **C R4 PASS** (R4-1…R4-8, `7879ee0`): `.github/scripts/apt-install.sh` shim-ები a–f + mutation, real sudo/apt 16 s, სუფთა `ubuntu:24.04` container 26 s, CI-რიგის replay: apt 18.5 s, install-deps 2.5 s, check 10.2 s, ffprobe 0.8 s, build 2.4 s, E2E 7/7 3.8 s. Actions: `40323787413` გაუქმდა, `40331357825` (`c768567`) მწვანე | done, როცა root მიაბამს მწვანე run-ს `7879ee0`-ზე ან მოგვიანებით (`499a6f3` ითვლება). R9-ის ლოკალური replay ×3 მწვანეა (C R9-5). cold-start რისკი: TM-B14 (**R10**) |
| TM-T0-DOC | `docs/plans/002-recording-tag-contract.md` | **done** (R1) | C R1-10. R2-ში დაემატა type-check-ის წინადადება | R3-ში სწორდება მოძველებული `:5`, `:77` (A-R2-01) |
| TM-B04 | `npm run check`-ის `tsc --noEmit` 0 ფაილს ამოწმებდა | **done** (R2), realVerified=true | C R2-1…R2-9 PASS: listFiles 9/26/32. red proof: ახალი check TS2322-ზე ვარდება, ძველი მწვანეა. 75/75, 31/31, E2E 6/6. რეალური UI save (`c-round-2/`) | — |
| TM-B07 | `check.yml` `playwright-report/`-ს ტვირთავდა, მაგრამ ის არ იქმნებოდა | **done** (R2), realVerified=true | C R2-7: `playwright-report/index.html` იქმნება, პროცესი სრულდება, YAML ვალიდურია | Actions-ის ნაწილი TM-T0-CI-ს ეკუთვნის |
| TM-T1 | T-1 tag-კონტრაქტი: `category` → INFO `ICAT`, `IKEY`/`ICMT` round-trip, bext/iXML/data ხელუხლებელი | **done** (R3), realVerified=true | C R3-1…R3-10 PASS, `230b87a`. main 40, renderer 79, E2E 7/7. რეალური UI save: ffprobe `ICAT=DOORWood`, `IKEY=door, slam`, `comment=მძიმე კარი`. raw INFO `ICAT` 8 / `IKEY` 10 / `ICMT` **28** (task-ში შეცდომით 26 ეწერა, C-R3-02). data/bext/iXML sha256 უცვლელია | T1-6-ის Actions ნაწილი TM-T0-CI-ს ეკუთვნის |
| TM-T1-DOC | `docs/recording-tag-contract.md` + `ICAT` `WAV_METADATA.md`-ში | **done** (R3), realVerified=true | C R3-10: ქართულად, Scope 7-ის ყველა პუნქტი, ციფრები 8/10/28. D-07-ის UI გზა რეალურ UI-ში დადასტურდა (R3-7) | — |
| TM-T1-MIG | არსებულ `schema.json`-ში `category` ავტომატურად არ ჩანს | todo | C R3-7 (რეგრესია): 12-ველიანი schema იტვირთება, `+ Category (UCS)` Hidden Standard Fields-შია, ჩართვის შემდეგ ინახება (13 key) | Saba-ს D-07-ის დადასტურება. signal: RR-R3-06 (schema-ს ვერსია + merge) |
| TM-T1-DUP | ძველი custom ველი `ICAT` ID-ით ან `category` key-ით (მაგ. auto `CATE`) + ახალი სტანდარტული ველი | todo | B R2 კოდის წაკითხვა. root review R3 (RR-R3-01, medium): ერთი მნიშვნელობა `CATE`-შიც და `ICAT`-შიც იწერება, React-ში დუბლირებული key-ებია | Saba-ს გადაწყვეტა. შემოთავაზებული default: toggle დაიმალოს/უარყოფილი იყოს, თუ key ან RIFF ID უკვე დაკავებულია, + გაფრთხილება |
| TM-B09 | „Tagged“ badge კონტრაქტის ველებს არ ითვალისწინებს (C-R3-01) | **done** (R5), realVerified=true | C R5-1…R5-7 PASS, `a8c1b53`: red 4/2 → green 28/28, mutation M1/M2/M2b, renderer 107, main 42, E2E 7/7 `--retries=0`. რეალური app: `c-round-5/r5-4-comment-only-tagged.png` (ffmpeg ICMT), `r5-4-contract-tagged.png` (ICAT), `r5-5-x-tagged.png` → `r5-5-blank-untagged.png` (ცარიელი ICAT), `r5-6-*.png`, ძველი build: badge არ ჩანს | D-15 Saba-ს დასადასტურებელია. NUL-only მნიშვნელობა ჯერ კიდევ Tagged-ია (C-R5-01) → TM-B10 |
| TM-B10 | `meta:read` RIFF INFO-ს NUL terminator-ს ინარჩუნებდა (C-R5-02, C-R5-01) | **done** (R6), realVerified=true | C R6-1…R6-7 PASS, `d52354d`: red 8/8 → green 8/8, mutation M1–M4, main 50, renderer 107, E2E 7/7 `--retries=0`. რეალური app: NUL-only ფაილები untagged, Comment = `მძიმე კარი` (code 0 არ არის), Take `120` save-ის შემდეგაც (raw `ITKN` 3 byte). **ძველ build-ზე** Take `0`, save-ის შემდეგ raw `ITKN`=`0` → data loss დადასტურდა, medium სწორია | — (Saba-ს ეცნობება D-16) |
| TM-B12 | write path: custom INFO ველები ჩუმად გამოიტოვებოდა, როცა InfoTag არ არის (`getRiffInfoTags` → `[]`), save მაინც ხდებოდა და წარმატებად ითვლებოდა (RR-R6-01) | **done** (R7), realVerified=true | C R7-1…R7-6 PASS, `28ad3ab`: red 2 failed (a),(c) / 11 passed → green 13/13; mutation M1, M2, M2b, M3, M4 მოკლულია; renderer 107, main 55, E2E 7/7 `--retries=0`. რეალური app: single save raw `ICAT` 8 / `IKEY` 10 / `ICMT` 10 byte, NUL-ის გარეშე, ffprobe და music-metadata ეთანხმება; batch `Tags saved to 2 files`; read-only ფაილით `1 saved, 1 failed`, sha256 უცვლელია. guard-ის branch მხოლოდ spy ტესტით მიიღწევა (defensive) | — |
| TM-B13 | per-field `catch` `setValuesFromStrings`-ის შეცდომას ყლაპავდა (hand-edited `schema.json`-ში `riffChunkId: 'AB'`), ველი არ იწერებოდა, save კი წარმატებად ითვლებოდა (RR-R7-02) | **done** (R8), realVerified=true | C R8-1…R8-7 PASS, `4a2062d`: red 3 failed (a),(c1),(d) / 8 passed → green 11/11; mutation M1–M5 მოკლულია; renderer 107, main 62, E2E 7/7 `--retries=0`. რეალური app ცუდი schema-თი: toast `Failed to write metadata: RIFF INFO fields could not be written: AB`, sha256 უცვლელი; **ძველ build-ზე** `Tags saved`, `ICAT`=`DOORWood`, `AB` არ იწერება (ჩუმი დანაკარგი დადასტურდა). batch: მხოლოდ შეცვლილი Category → `Tags saved to 2 files`; Bad-ის შეცვლით → `0 saved, 2 failed`, sha256 უცვლელი. ჩვეულებრივი schema: ICAT 8 / IKEY 10 / ICMT 10, ffprobe + music-metadata ეთანხმება. `//` კომენტარები წაშლილია, docs სექცია დაემატა | — (D-18 Saba-ს ეცნობება) |
| TM-B11 | schema-ში custom Number ველისას ყოველი save წერს `ITKN="0"`-ს ფაილში, რომელსაც ეს ველი არ ჰქონია (C-R6-01, pre-existing) | todo (low) | C R6: `c-round-6/r6-result.json`, `r6-before-result.json` | Saba: D-10-ის გაფართოება number ველებზე |
| TM-T0-CI-FU | CI follow-up: `apt-install.sh`-ის worst case (750 s) > step 600 s (C-R4-01/RR-R4-02), `debconf-communicate` bound-ის გარეშე + ქართული docs (RR-R4-05) + ერთი build path E2E-სთვის (RR-R1-01) | in_progress (low); ლოკალური ნაწილი realVerified=true, Actions ნაწილი realVerified=false | **C R9 PASS** (R9-1…R9-8, `499a6f3`): shellcheck 0; shim (d) ყველაფერი hang + TERM-ის იგნორი → wall 14.03 s = W 14, (h) N=3 → 21.03 s = W; 12 ცუდი knob → rc 2, 0 system call; mutation R→T დაიჭირა; default-ებზე `worst case 640s` < 780; real apt `attempt 1/2 ok after 2s`, debconf `man-db/auto-update` true → false; CI replay ×3 (apt 1.5 s, check 10.6 s, ffprobe 0.8 s, Build and E2E 5.9 s, 7/7, `playwright-report/index.html`); gate 107/62/7; real app DOORWood → ffprobe + music-metadata `ICAT` | Actions-ის მწვანე run TM-T0-CI-სთან ერთად (root) |
| TM-B14 | E2E cold start: პირველი Electron ფანჯარა cold runner-ზე > 30 s-ს შეიძლება მოითხოვდეს; `firstWindow` test-ის body-შია, ამიტომ 30 s per-test timeout `--retries=0`-ით (check.yml) run-ს აწითლებს. ლოკალურად `retries: 1` ამას ფარავს (C-R9-02) | todo → **R10** (low) | A R9 `ci-replay-run1.log`: `firstWindow` 30000ms + Test timeout, იმავე app-ის შემდეგი ტესტი 227 ms-ში გავიდა (ფანჯარა დაგვიანდა, არ დაკარგულა). warm ×7 და `drop_caches` ×3 (max 2.7 s) არ მეორდება. მიზეზი უცნობია. B ექსპერიმენტი: `-r <file>` args-ში ფანჯრის დაყოვნებას დეტერმინისტულად იწვევს | R10: D-20 (საერთო `launchTagManagerApp`, budget 60 s/90 s, opt-in injector), job timeout 40 (RR-R9-01), docs (RR-R9-02). Actions ნაწილი TM-T0-CI-სთან |
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
| RR-R1-01 | medium | `check.yml`-ში ცალკე Build step, `npm run test:e2e`-ისგან განსხვავებული build path | **closed** R9 (C R9-1, R9-5) |
| RR-R1-02 | medium | `ffmpeg` წინასწარ დგება, მაგრამ ჯერ არაფერი იყენებს | **closed** R3: ffprobe step იყენებს |
| RR-R1-03 | low | action-ები `@v4` tag-ზეა და არა SHA-ზე | review signal |
| RR-R1-04 | low | `create-fixtures.ts`-ის CLI guard regex | review signal (R3-ის ახალი CLI ფართო regex-ს იყენებს) |
| RR-R1-05 | low | `.tmp` ფაილი რჩება, თუ `writeFileSync` ჩავარდა | review signal |
| RR-R1-06 | info | არქიტექტურა: WAV builder ცალკე ფაილში | **closed** R3: `tests/main/riff-chunks.ts` (D-14) |
| RR-R1-07 | info | `check.yml` required check + `needs: check` `release.yml`-ში | Saba |
| RR-R2-01 | medium | `getRiffInfoTags` non-CombinedTag-ზე ისროდა write path-ზე | **closed** R6 (C R6-1 h, M3). შედეგად ჩუმი გამოტოვება → RR-R6-01 |
| RR-R2-02 | low | FileList-ის display fix-ს renderer ტესტი არ აქვს (`test-on-bugfix`) | **closed** R5: C R5-2 M1 |
| RR-R2-03 | low | `skipLibCheck` `src/preload/index.d.ts`-საც ფარავს | review signal |
| RR-R2-04 | info | არქიტექტურა: RiffTags-typed accessor `TagObject` double cast-ის ნაცვლად | review signal |
| C-R3-01 | low | „Tagged“ badge მხოლოდ ICAT/IKEY/ICMT-იან ფაილზე არ ჩანს | **closed** R5 (TM-B09) |
| C-R3-02 | low | task-ში ICMT 26 ეწერა, რეალურად 28 (ტესტი და დოკუმენტი სწორია) | **closed** R3 (B) |
| A-R3-01 | low | `tests/renderer/setup.ts` (frozen) `window`-ს plain object-ით ცვლის. `schema-editor.test.ts` `vi.hoisted`-ით უვლის გვერდს | რაუნდი, რომელიც `setup.ts`-ს ფლობს |
| RR-R3-01 | medium | ძველი custom `category` (`CATE`) + სტანდარტული toggle → ორი ველი ერთი key-ით | TM-T1-DUP (Saba) |
| RR-R3-02 | low | ffprobe step-ის ფაილს unit ტესტი ქმნის. თუ ფაილი არ არსებობს, შეცდომა მწარმოებელ ტესტს არ ასახელებს | **closed** R4 (C R4-5) |
| RR-R3-03 | info | editor-ის ყოველი save `ICAT=""`-ს წერს (D-10 განზრახ ფიქსირდება) | D-10 (Saba) |
| RR-R3-04 | low | ტესტებში ორმაგი ბრჭყალებია, `src/`-ში ერთმაგი. Biome `tests/`-ს არ ამოწმებს | TM-B06 |
| RR-R3-05 | info | `npx --yes tsx@4` მცურავ major ვერსიას ტვირთავს | signal (`package.json` დაცულია, OOS-03) |
| RR-R3-06 | info | არქიტექტურა: ვერსიიანი `schema.json` + ერთჯერადი merge `loadSchema()`-ში წყვეტს D-07-ს და TM-T1-DUP-ს | signal, Saba |
| C-R4-01 | low | `apt-install.sh` worst case ≈ 750 s > step `timeout-minutes: 10`. საბოლოო `failed after N attempts` ხაზი შეიძლება არ დაიბეჭდოს | **closed** R9 (C R9-2 d, R9-3) |
| RR-R4-01 | medium | `--no-install-recommends` შეიძლება `xauth`-ს აკლებდეს | **closed** R4: უარყოფილია. `apt-cache show xvfb`: `xauth` Depends-შია; C-ის container run-ში xauth დაყენდა |
| RR-R4-02 | low | იგივე, რაც C-R4-01 | **closed** R9 |
| RR-R4-03 | low | missing-file hint-ში „during npm run check“ hard-coded-ია | signal |
| RR-R4-04 | info | მეორე ტესტი მხოლოდ constant-ს + `existsSync`-ს ამოწმებს | signal |
| RR-R4-05 | low | `apt-install.sh` და env knob-ები `docs/`-ში არ არის აღწერილი | **closed** R9 (C R9-8) |
| RR-R4-06 | info | არქიტექტურა: ffprobe-ის შემოწმება vitest-ში (skip ffprobe-ის გარეშე) ან ცალკე `npm run test:contract` | signal, RR-R1-01-თან ერთად (`package.json` დაცულია) |
| C-R5-01 | low | NUL-only INFO მნიშვნელობა row-ს Tagged-ად აჩენდა | **closed** R6 (C R6-4) |
| C-R5-02 | low→TM-B10 medium | `meta:read` NUL terminator-ს ინარჩუნებდა | **closed** R6 (C R6-4) |
| RR-R5-01 | low | badge ახლა ყველა ველს ითვლის (year/track/ISRC-only ფაილიც Tagged-ია); `docs/`-ში შენიშვნა | signal, D-15-ის დადასტურების შემდეგ |
| RR-R5-02 | low | `file-row-display.ts:11` `item.trim()` ვარაუდობს string ელემენტს; `null` row-ს render-ს ჩააგდებს | signal |
| RR-R5-03 | info | number ველი Tagged-ია მხოლოდ `> 0`-ზე | signal |
| RR-R5-04 | low | `getFileRow` ტესტში ზუსტად 2 parent-ით ადის, markup-ის მიმართ მყიფეა | signal |
| RR-R5-05 | info | ტესტებში ორმაგი ბრჭყალები (RR-R3-04-ის მსგავსი) | TM-B06 |
| RR-R5-06 | info | არქიტექტურა: „ცარიელია თუ არა“ წესი სამ ადგილასაა (`isNonEmptyFieldValue`, `TemplatePicker.tsx:130`, dirty tracking). ერთი საერთო `isEmptyFieldValue` | signal, არა task |
| B-R6-01 | low | `bpm`/`track` INFO-only WAV-იდან 0-ად იკითხება NUL-ით და მის გარეშეც: node-taglib-sharp `IBPM`/`ITRK`-ს არ კითხულობს. `year` (ICRD) იკითხება | signal + Saba-ს კითხვა D-12/TM-B08-თან ერთად |
| C-R6-01 | low | custom Number ველი → ყოველი save `ITKN="0"` (size 1), pre-existing | TM-B11 (Saba, D-10) |
| C-R6-02 | info | `music-metadata` RIFF INFO-ს UTF-8 ქართულს mojibake-ად კითხულობს; ffprobe და ID3 სწორია | rule: ICMT hex + ffprobe-ით მოწმდება |
| RR-R6-01 | medium | `getRiffInfoTags` `[]` → write path ყველა custom ველს ჩუმად ტოვებს, `save()` + success | **closed** R7 (TM-B12, `28ad3ab`) |
| RR-R6-02 | low | `year`/`track`/`bpm` getter-ები NUL-ს არ აჭრიან, ტესტი არ არის | **closed** R7: pin ტესტი `ICRD "2024\0"` → 2024 (C R7-1). track/bpm = B-R6-01 |
| RR-R6-03 | low | `riff-info-nul.test.ts` ორმაგი ბრჭყალები | TM-B06 |
| RR-R6-04 | low | `metadata.ts`-ის ორი ძველი `//` კომენტარი catch-ებში | **closed** R8 (C R8-7: `grep -n '//'` ცარიელია) |
| RR-R7-01 | medium | D-17 save-ს all-or-nothing-ად აქცევს: სტანდარტული ველებიც აღარ იწერება. docs შენიშვნა | **closed** R8: `docs/recording-tag-contract.md` სექცია (C R8-7) |
| RR-R7-02 | low | per-field `catch {}` ცუდი `riffChunkId`-ის შეცდომას ყლაპავდა | **closed** R8 (TM-B13, D-18) |
| RR-R7-03 | low | `// InfoTag write failed for this field` | **closed** R8 (C R8-7) |
| RR-R7-04 | low | guard ტესტი `file.tag`-ს bare `Id3v2Tag`-ით ცვლის, ბიბლიოთეკის getter-ის ფორმაზეა მიბმული | signal (ბიბლიოთეკის upgrade-ისას) |
| RR-R7-05 | info | არქიტექტურა: `planTagWrite(meta, schema)` (pure) + `applyTagWrite(file, plan)`, რომელიც ყველაფერს ამოწმებს mutation-მდე | signal, არა task |
| A-R7-01 | info | ფაქტი (A M2, C M2/M2b): INFO-ს გარეშე `sample.wav`-ზე `getRiffInfoTags` title workaround-მდეც non-empty-ია. hypothesis: workaround ზედმეტია | signal; task-ებში აღარ ვწერ, რომ workaround ქმნის InfoTag-ს |
| B-R7-01 | low | R7 task-ში ეწერა `meta:writeBatch`, რეალური channel `meta:write-batch`-ია | **closed** (B): D-17-ის ტექსტი გასწორდა |
| B-R7-02 | low | `schema.ts` `isValidField` `riffChunkId`-ს არ ამოწმებს; hand-edited schema write path-ს ცუდ ID-ს აწვდის | Saba-ს კითხვა: load-time ვალიდაცია user-ის ველს უარყოფს ან მონიშნავს (ქცევის გადაწყვეტილება). იგივეა RR-R8-04; A-R8-02 |
| B-R7-03 | low | custom ველი `riffChunkId`-ის გარეშე write-ზე ჩუმად გამოიტოვება (UI ასეთს არ ქმნის) | signal, D-18-ში არ შედის |
| RR-R6-05 | info | არქიტექტურა: ერთი `readRiffValue` normalisation layer + write-side შემოწმება და პატიოსანი per-file `BatchWriteResult` ცარიელი `catch {}`-ის ნაცვლად | signal, არა task |
| RR-R8-01 | low | `metadata.ts:199` `String(riffChunkId)` ზედმეტია (უკვე string-ია) | signal |
| RR-R8-02 | low | `metadata-write-field-errors.test.ts` ორმაგი ბრჭყალები | TM-B06 |
| RR-R8-03 | low | read path-ის ცარიელი `catch {}` non-ID შეცდომას კვალის გარეშე მალავს; debug log დაეხმარებოდა | signal |
| RR-R8-04 | info | არქიტექტურა: schema-ს ვალიდაცია load-ზე (`riffChunkId` `/^[A-Z0-9 ]{4}$/`, reserved/duplicate), all-or-nothing write მეორე ხაზად | signal = B-R7-02, Saba |
| A-R8-01 | info | `recording-tag-contract.md`-ის header და `## შემოწმება` D-17/D-18-ს და ახალ ტესტს არ ახსენებს | signal (შემდეგი docs რაუნდი) |
| A-R8-02 | low | ბიბლიოთეკა ID-ს JS string length-ით ამოწმებს, არა ბაიტებით: 4-სიმბოლოიანი non-ASCII ID D-18-ს არ იწვევს | B-R7-02 |
| C-R8-01 | low | batch-ის ჩავარდნის შემდეგ (`0 saved, 2 failed`) panel ორივე ფაილზე „Multiple values“-ს აჩვენებს (`c-round-8/r8-5-after-ii-toast.png`); ღრმად არ შემოწმებულა, ბაგია თუ არა უცნობია | კანდიდატი R11: ჯერ რეპროდუქცია |
| RR-R9-01 | low | `check.yml`: apt 13 წთ + install-deps 10 წთ = job-ის 30 წთ-დან 23 check/E2E-მდე | **R10** (TM-B14, job timeout 40) |
| RR-R9-02 | low | `docs/ci-cd.md:239` run `40331357825`-ის (apt 19 s) ერთჯერადი ფაქტი მოძველდება | **R10** (TM-B14, წინადადება იშლება) |
| RR-R9-03 | low | `apt-install.sh`-ის knob ვალიდაციას და `worst case` ხაზს ავტომატური ტესტი არ აქვს | signal |
| RR-R9-04 | info | არქიტექტურა: `worst_case_seconds` და `timeout-minutes` ხელით სინქრონდება; `--print-worst-case` ან CI შედარება drift-ს აიცილებს | signal, არა task |
| A-R9-01 | low | knob ვალიდაცია ძალიან დიდ რიცხვს იღებს, bash arithmetic overflow შესაძლებელია (`^[1-9][0-9]{0,5}# Feature status — czaba-tag-manager

განახლდა: 2026-10-26, B round 9. round 9 დაიხურა და round 10 დაიგეგმა. სტატუსი `done` ხდება მხოლოდ C-ის რეალური შემოწმების შემდეგ. ბოლო publish: `499a6f3` (round 9). ამის წინ: `4a2062d` (round 8), `28ad3ab` (round 7), `d52354d` (round 6), `a8c1b53` (round 5), `7879ee0` (round 4), `230b87a` (round 3), `c768567` (round 2), `c34ee5a` (round 1).

**CI:** run `40323787413` (`c34ee5a`) 30 წუთის job timeout-მა გააუქმა apt step-ზე. root-ის შემდგომი შენიშვნით (13:45 UTC), run `40331357825` (`c768567`) **მწვანეა**, ყველა step success, 1 წთ 24 წმ. ესე იგი hang წყვეტილი იყო. Actions-ზე ჯერ არ ჩანს: round 3-ის ffprobe step და round 4-ის `apt-install.sh`. B R9 close: root-ს `7879ee0`…`499a6f3`-ის Actions run ჯერ არ მიუბამს. round 9-მა (`499a6f3`) `check.yml` შეცვალა (apt step 13 წთ, ერთი build path), round 10 job timeout-ს 40 წთ-მდე ზრდის. **თხოვნა root-ს:** მიაბით `Check` run-ის id და შედეგი `499a6f3`-ზე ან ნებისმიერ ადრინდელ published commit-ზე. თუ run წითელია `firstWindow`-ზე, ეს TM-B14-ის რეალური ნიმუშია.

| ID | სათაური | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |
|---|---|---|---|---|
| TM-T0 | T-0 Linux baseline (check + E2E მწვანე ubuntu-24.04-ზე) | in_progress | C R1 PASS: T0-1 (R1-1), T0-2 (R1-2), T0-3 (R1-3), T0-4 (R1-8) | `npm ci` + postinstall დადასტურდა run `40331357825`-ით (`c768567`, root). ყველა acceptance-ს აქვს მტკიცებულება; იხურება TM-T0-CI-სთან ერთად |
| TM-B01 | E2E: Electron არ ეშვება runner-ზე `--no-sandbox`-ის გარეშე | **done** (R1) | C R1-2: 6/6 `--retries=0`. R1-4: red. R1-9: რეალური UI | — |
| TM-B02 | E2E IPC write: fixture-ის data chunk ცარიელია | **done** (R1) | C R1-5, R1-2 | — |
| TM-B03 | სუფთა checkout-ზე main ტესტები ENOENT | **done** (R1) | C R1-1, R1-3, R1-6 | — |
| TM-T0-CI | `.github/workflows/check.yml` | in_progress, realVerified=false | C R1-7, R2-7, R3-4. **C R4 PASS** (R4-1…R4-8, `7879ee0`): `.github/scripts/apt-install.sh` shim-ები a–f + mutation, real sudo/apt 16 s, სუფთა `ubuntu:24.04` container 26 s, CI-რიგის replay: apt 18.5 s, install-deps 2.5 s, check 10.2 s, ffprobe 0.8 s, build 2.4 s, E2E 7/7 3.8 s. Actions: `40323787413` გაუქმდა, `40331357825` (`c768567`) მწვანე | done, როცა root მიაბამს მწვანე run-ს `7879ee0`-ზე ან მოგვიანებით (`499a6f3` ითვლება). R9-ის ლოკალური replay ×3 მწვანეა (C R9-5). cold-start რისკი: TM-B14 (**R10**) |
| TM-T0-DOC | `docs/plans/002-recording-tag-contract.md` | **done** (R1) | C R1-10. R2-ში დაემატა type-check-ის წინადადება | R3-ში სწორდება მოძველებული `:5`, `:77` (A-R2-01) |
| TM-B04 | `npm run check`-ის `tsc --noEmit` 0 ფაილს ამოწმებდა | **done** (R2), realVerified=true | C R2-1…R2-9 PASS: listFiles 9/26/32. red proof: ახალი check TS2322-ზე ვარდება, ძველი მწვანეა. 75/75, 31/31, E2E 6/6. რეალური UI save (`c-round-2/`) | — |
| TM-B07 | `check.yml` `playwright-report/`-ს ტვირთავდა, მაგრამ ის არ იქმნებოდა | **done** (R2), realVerified=true | C R2-7: `playwright-report/index.html` იქმნება, პროცესი სრულდება, YAML ვალიდურია | Actions-ის ნაწილი TM-T0-CI-ს ეკუთვნის |
| TM-T1 | T-1 tag-კონტრაქტი: `category` → INFO `ICAT`, `IKEY`/`ICMT` round-trip, bext/iXML/data ხელუხლებელი | **done** (R3), realVerified=true | C R3-1…R3-10 PASS, `230b87a`. main 40, renderer 79, E2E 7/7. რეალური UI save: ffprobe `ICAT=DOORWood`, `IKEY=door, slam`, `comment=მძიმე კარი`. raw INFO `ICAT` 8 / `IKEY` 10 / `ICMT` **28** (task-ში შეცდომით 26 ეწერა, C-R3-02). data/bext/iXML sha256 უცვლელია | T1-6-ის Actions ნაწილი TM-T0-CI-ს ეკუთვნის |
| TM-T1-DOC | `docs/recording-tag-contract.md` + `ICAT` `WAV_METADATA.md`-ში | **done** (R3), realVerified=true | C R3-10: ქართულად, Scope 7-ის ყველა პუნქტი, ციფრები 8/10/28. D-07-ის UI გზა რეალურ UI-ში დადასტურდა (R3-7) | — |
| TM-T1-MIG | არსებულ `schema.json`-ში `category` ავტომატურად არ ჩანს | todo | C R3-7 (რეგრესია): 12-ველიანი schema იტვირთება, `+ Category (UCS)` Hidden Standard Fields-შია, ჩართვის შემდეგ ინახება (13 key) | Saba-ს D-07-ის დადასტურება. signal: RR-R3-06 (schema-ს ვერსია + merge) |
| TM-T1-DUP | ძველი custom ველი `ICAT` ID-ით ან `category` key-ით (მაგ. auto `CATE`) + ახალი სტანდარტული ველი | todo | B R2 კოდის წაკითხვა. root review R3 (RR-R3-01, medium): ერთი მნიშვნელობა `CATE`-შიც და `ICAT`-შიც იწერება, React-ში დუბლირებული key-ებია | Saba-ს გადაწყვეტა. შემოთავაზებული default: toggle დაიმალოს/უარყოფილი იყოს, თუ key ან RIFF ID უკვე დაკავებულია, + გაფრთხილება |
| TM-B09 | „Tagged“ badge კონტრაქტის ველებს არ ითვალისწინებს (C-R3-01) | **done** (R5), realVerified=true | C R5-1…R5-7 PASS, `a8c1b53`: red 4/2 → green 28/28, mutation M1/M2/M2b, renderer 107, main 42, E2E 7/7 `--retries=0`. რეალური app: `c-round-5/r5-4-comment-only-tagged.png` (ffmpeg ICMT), `r5-4-contract-tagged.png` (ICAT), `r5-5-x-tagged.png` → `r5-5-blank-untagged.png` (ცარიელი ICAT), `r5-6-*.png`, ძველი build: badge არ ჩანს | D-15 Saba-ს დასადასტურებელია. NUL-only მნიშვნელობა ჯერ კიდევ Tagged-ია (C-R5-01) → TM-B10 |
| TM-B10 | `meta:read` RIFF INFO-ს NUL terminator-ს ინარჩუნებდა (C-R5-02, C-R5-01) | **done** (R6), realVerified=true | C R6-1…R6-7 PASS, `d52354d`: red 8/8 → green 8/8, mutation M1–M4, main 50, renderer 107, E2E 7/7 `--retries=0`. რეალური app: NUL-only ფაილები untagged, Comment = `მძიმე კარი` (code 0 არ არის), Take `120` save-ის შემდეგაც (raw `ITKN` 3 byte). **ძველ build-ზე** Take `0`, save-ის შემდეგ raw `ITKN`=`0` → data loss დადასტურდა, medium სწორია | — (Saba-ს ეცნობება D-16) |
| TM-B12 | write path: custom INFO ველები ჩუმად გამოიტოვებოდა, როცა InfoTag არ არის (`getRiffInfoTags` → `[]`), save მაინც ხდებოდა და წარმატებად ითვლებოდა (RR-R6-01) | **done** (R7), realVerified=true | C R7-1…R7-6 PASS, `28ad3ab`: red 2 failed (a),(c) / 11 passed → green 13/13; mutation M1, M2, M2b, M3, M4 მოკლულია; renderer 107, main 55, E2E 7/7 `--retries=0`. რეალური app: single save raw `ICAT` 8 / `IKEY` 10 / `ICMT` 10 byte, NUL-ის გარეშე, ffprobe და music-metadata ეთანხმება; batch `Tags saved to 2 files`; read-only ფაილით `1 saved, 1 failed`, sha256 უცვლელია. guard-ის branch მხოლოდ spy ტესტით მიიღწევა (defensive) | — |
| TM-B13 | per-field `catch` `setValuesFromStrings`-ის შეცდომას ყლაპავდა (hand-edited `schema.json`-ში `riffChunkId: 'AB'`), ველი არ იწერებოდა, save კი წარმატებად ითვლებოდა (RR-R7-02) | **done** (R8), realVerified=true | C R8-1…R8-7 PASS, `4a2062d`: red 3 failed (a),(c1),(d) / 8 passed → green 11/11; mutation M1–M5 მოკლულია; renderer 107, main 62, E2E 7/7 `--retries=0`. რეალური app ცუდი schema-თი: toast `Failed to write metadata: RIFF INFO fields could not be written: AB`, sha256 უცვლელი; **ძველ build-ზე** `Tags saved`, `ICAT`=`DOORWood`, `AB` არ იწერება (ჩუმი დანაკარგი დადასტურდა). batch: მხოლოდ შეცვლილი Category → `Tags saved to 2 files`; Bad-ის შეცვლით → `0 saved, 2 failed`, sha256 უცვლელი. ჩვეულებრივი schema: ICAT 8 / IKEY 10 / ICMT 10, ffprobe + music-metadata ეთანხმება. `//` კომენტარები წაშლილია, docs სექცია დაემატა | — (D-18 Saba-ს ეცნობება) |
| TM-B11 | schema-ში custom Number ველისას ყოველი save წერს `ITKN="0"`-ს ფაილში, რომელსაც ეს ველი არ ჰქონია (C-R6-01, pre-existing) | todo (low) | C R6: `c-round-6/r6-result.json`, `r6-before-result.json` | Saba: D-10-ის გაფართოება number ველებზე |
| TM-T0-CI-FU | CI follow-up: `apt-install.sh`-ის worst case (750 s) > step 600 s (C-R4-01/RR-R4-02), `debconf-communicate` bound-ის გარეშე + ქართული docs (RR-R4-05) + ერთი build path E2E-სთვის (RR-R1-01) | in_progress (low); ლოკალური ნაწილი realVerified=true, Actions ნაწილი realVerified=false | **C R9 PASS** (R9-1…R9-8, `499a6f3`): shellcheck 0; shim (d) ყველაფერი hang + TERM-ის იგნორი → wall 14.03 s = W 14, (h) N=3 → 21.03 s = W; 12 ცუდი knob → rc 2, 0 system call; mutation R→T დაიჭირა; default-ებზე `worst case 640s` < 780; real apt `attempt 1/2 ok after 2s`, debconf `man-db/auto-update` true → false; CI replay ×3 (apt 1.5 s, check 10.6 s, ffprobe 0.8 s, Build and E2E 5.9 s, 7/7, `playwright-report/index.html`); gate 107/62/7; real app DOORWood → ffprobe + music-metadata `ICAT` | Actions-ის მწვანე run TM-T0-CI-სთან ერთად (root) |
| TM-B14 | E2E cold start: პირველი Electron ფანჯარა cold runner-ზე > 30 s-ს შეიძლება მოითხოვდეს; `firstWindow` test-ის body-შია, ამიტომ 30 s per-test timeout `--retries=0`-ით (check.yml) run-ს აწითლებს. ლოკალურად `retries: 1` ამას ფარავს (C-R9-02) | todo → **R10** (low) | A R9 `ci-replay-run1.log`: `firstWindow` 30000ms + Test timeout, იმავე app-ის შემდეგი ტესტი 227 ms-ში გავიდა (ფანჯარა დაგვიანდა, არ დაკარგულა). warm ×7 და `drop_caches` ×3 (max 2.7 s) არ მეორდება. მიზეზი უცნობია. B ექსპერიმენტი: `-r <file>` args-ში ფანჯრის დაყოვნებას დეტერმინისტულად იწვევს | R10: D-20 (საერთო `launchTagManagerApp`, budget 60 s/90 s, opt-in injector), job timeout 40 (RR-R9-01), docs (RR-R9-02). Actions ნაწილი TM-T0-CI-სთან |
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
| RR-R1-01 | medium | `check.yml`-ში ცალკე Build step, `npm run test:e2e`-ისგან განსხვავებული build path | **closed** R9 (C R9-1, R9-5) |
| RR-R1-02 | medium | `ffmpeg` წინასწარ დგება, მაგრამ ჯერ არაფერი იყენებს | **closed** R3: ffprobe step იყენებს |
| RR-R1-03 | low | action-ები `@v4` tag-ზეა და არა SHA-ზე | review signal |
| RR-R1-04 | low | `create-fixtures.ts`-ის CLI guard regex | review signal (R3-ის ახალი CLI ფართო regex-ს იყენებს) |
| RR-R1-05 | low | `.tmp` ფაილი რჩება, თუ `writeFileSync` ჩავარდა | review signal |
| RR-R1-06 | info | არქიტექტურა: WAV builder ცალკე ფაილში | **closed** R3: `tests/main/riff-chunks.ts` (D-14) |
| RR-R1-07 | info | `check.yml` required check + `needs: check` `release.yml`-ში | Saba |
| RR-R2-01 | medium | `getRiffInfoTags` non-CombinedTag-ზე ისროდა write path-ზე | **closed** R6 (C R6-1 h, M3). შედეგად ჩუმი გამოტოვება → RR-R6-01 |
| RR-R2-02 | low | FileList-ის display fix-ს renderer ტესტი არ აქვს (`test-on-bugfix`) | **closed** R5: C R5-2 M1 |
| RR-R2-03 | low | `skipLibCheck` `src/preload/index.d.ts`-საც ფარავს | review signal |
| RR-R2-04 | info | არქიტექტურა: RiffTags-typed accessor `TagObject` double cast-ის ნაცვლად | review signal |
| C-R3-01 | low | „Tagged“ badge მხოლოდ ICAT/IKEY/ICMT-იან ფაილზე არ ჩანს | **closed** R5 (TM-B09) |
| C-R3-02 | low | task-ში ICMT 26 ეწერა, რეალურად 28 (ტესტი და დოკუმენტი სწორია) | **closed** R3 (B) |
| A-R3-01 | low | `tests/renderer/setup.ts` (frozen) `window`-ს plain object-ით ცვლის. `schema-editor.test.ts` `vi.hoisted`-ით უვლის გვერდს | რაუნდი, რომელიც `setup.ts`-ს ფლობს |
| RR-R3-01 | medium | ძველი custom `category` (`CATE`) + სტანდარტული toggle → ორი ველი ერთი key-ით | TM-T1-DUP (Saba) |
| RR-R3-02 | low | ffprobe step-ის ფაილს unit ტესტი ქმნის. თუ ფაილი არ არსებობს, შეცდომა მწარმოებელ ტესტს არ ასახელებს | **closed** R4 (C R4-5) |
| RR-R3-03 | info | editor-ის ყოველი save `ICAT=""`-ს წერს (D-10 განზრახ ფიქსირდება) | D-10 (Saba) |
| RR-R3-04 | low | ტესტებში ორმაგი ბრჭყალებია, `src/`-ში ერთმაგი. Biome `tests/`-ს არ ამოწმებს | TM-B06 |
| RR-R3-05 | info | `npx --yes tsx@4` მცურავ major ვერსიას ტვირთავს | signal (`package.json` დაცულია, OOS-03) |
| RR-R3-06 | info | არქიტექტურა: ვერსიიანი `schema.json` + ერთჯერადი merge `loadSchema()`-ში წყვეტს D-07-ს და TM-T1-DUP-ს | signal, Saba |
| C-R4-01 | low | `apt-install.sh` worst case ≈ 750 s > step `timeout-minutes: 10`. საბოლოო `failed after N attempts` ხაზი შეიძლება არ დაიბეჭდოს | **closed** R9 (C R9-2 d, R9-3) |
| RR-R4-01 | medium | `--no-install-recommends` შეიძლება `xauth`-ს აკლებდეს | **closed** R4: უარყოფილია. `apt-cache show xvfb`: `xauth` Depends-შია; C-ის container run-ში xauth დაყენდა |
| RR-R4-02 | low | იგივე, რაც C-R4-01 | **closed** R9 |
| RR-R4-03 | low | missing-file hint-ში „during npm run check“ hard-coded-ია | signal |
| RR-R4-04 | info | მეორე ტესტი მხოლოდ constant-ს + `existsSync`-ს ამოწმებს | signal |
| RR-R4-05 | low | `apt-install.sh` და env knob-ები `docs/`-ში არ არის აღწერილი | **closed** R9 (C R9-8) |
| RR-R4-06 | info | არქიტექტურა: ffprobe-ის შემოწმება vitest-ში (skip ffprobe-ის გარეშე) ან ცალკე `npm run test:contract` | signal, RR-R1-01-თან ერთად (`package.json` დაცულია) |
| C-R5-01 | low | NUL-only INFO მნიშვნელობა row-ს Tagged-ად აჩენდა | **closed** R6 (C R6-4) |
| C-R5-02 | low→TM-B10 medium | `meta:read` NUL terminator-ს ინარჩუნებდა | **closed** R6 (C R6-4) |
| RR-R5-01 | low | badge ახლა ყველა ველს ითვლის (year/track/ISRC-only ფაილიც Tagged-ია); `docs/`-ში შენიშვნა | signal, D-15-ის დადასტურების შემდეგ |
| RR-R5-02 | low | `file-row-display.ts:11` `item.trim()` ვარაუდობს string ელემენტს; `null` row-ს render-ს ჩააგდებს | signal |
| RR-R5-03 | info | number ველი Tagged-ია მხოლოდ `> 0`-ზე | signal |
| RR-R5-04 | low | `getFileRow` ტესტში ზუსტად 2 parent-ით ადის, markup-ის მიმართ მყიფეა | signal |
| RR-R5-05 | info | ტესტებში ორმაგი ბრჭყალები (RR-R3-04-ის მსგავსი) | TM-B06 |
| RR-R5-06 | info | არქიტექტურა: „ცარიელია თუ არა“ წესი სამ ადგილასაა (`isNonEmptyFieldValue`, `TemplatePicker.tsx:130`, dirty tracking). ერთი საერთო `isEmptyFieldValue` | signal, არა task |
| B-R6-01 | low | `bpm`/`track` INFO-only WAV-იდან 0-ად იკითხება NUL-ით და მის გარეშეც: node-taglib-sharp `IBPM`/`ITRK`-ს არ კითხულობს. `year` (ICRD) იკითხება | signal + Saba-ს კითხვა D-12/TM-B08-თან ერთად |
| C-R6-01 | low | custom Number ველი → ყოველი save `ITKN="0"` (size 1), pre-existing | TM-B11 (Saba, D-10) |
| C-R6-02 | info | `music-metadata` RIFF INFO-ს UTF-8 ქართულს mojibake-ად კითხულობს; ffprobe და ID3 სწორია | rule: ICMT hex + ffprobe-ით მოწმდება |
| RR-R6-01 | medium | `getRiffInfoTags` `[]` → write path ყველა custom ველს ჩუმად ტოვებს, `save()` + success | **closed** R7 (TM-B12, `28ad3ab`) |
| RR-R6-02 | low | `year`/`track`/`bpm` getter-ები NUL-ს არ აჭრიან, ტესტი არ არის | **closed** R7: pin ტესტი `ICRD "2024\0"` → 2024 (C R7-1). track/bpm = B-R6-01 |
| RR-R6-03 | low | `riff-info-nul.test.ts` ორმაგი ბრჭყალები | TM-B06 |
| RR-R6-04 | low | `metadata.ts`-ის ორი ძველი `//` კომენტარი catch-ებში | **closed** R8 (C R8-7: `grep -n '//'` ცარიელია) |
| RR-R7-01 | medium | D-17 save-ს all-or-nothing-ად აქცევს: სტანდარტული ველებიც აღარ იწერება. docs შენიშვნა | **closed** R8: `docs/recording-tag-contract.md` სექცია (C R8-7) |
| RR-R7-02 | low | per-field `catch {}` ცუდი `riffChunkId`-ის შეცდომას ყლაპავდა | **closed** R8 (TM-B13, D-18) |
| RR-R7-03 | low | `// InfoTag write failed for this field` | **closed** R8 (C R8-7) |
| RR-R7-04 | low | guard ტესტი `file.tag`-ს bare `Id3v2Tag`-ით ცვლის, ბიბლიოთეკის getter-ის ფორმაზეა მიბმული | signal (ბიბლიოთეკის upgrade-ისას) |
| RR-R7-05 | info | არქიტექტურა: `planTagWrite(meta, schema)` (pure) + `applyTagWrite(file, plan)`, რომელიც ყველაფერს ამოწმებს mutation-მდე | signal, არა task |
| A-R7-01 | info | ფაქტი (A M2, C M2/M2b): INFO-ს გარეშე `sample.wav`-ზე `getRiffInfoTags` title workaround-მდეც non-empty-ია. hypothesis: workaround ზედმეტია | signal; task-ებში აღარ ვწერ, რომ workaround ქმნის InfoTag-ს |
| B-R7-01 | low | R7 task-ში ეწერა `meta:writeBatch`, რეალური channel `meta:write-batch`-ია | **closed** (B): D-17-ის ტექსტი გასწორდა |
| B-R7-02 | low | `schema.ts` `isValidField` `riffChunkId`-ს არ ამოწმებს; hand-edited schema write path-ს ცუდ ID-ს აწვდის | Saba-ს კითხვა: load-time ვალიდაცია user-ის ველს უარყოფს ან მონიშნავს (ქცევის გადაწყვეტილება). იგივეა RR-R8-04; A-R8-02 |
| B-R7-03 | low | custom ველი `riffChunkId`-ის გარეშე write-ზე ჩუმად გამოიტოვება (UI ასეთს არ ქმნის) | signal, D-18-ში არ შედის |
| RR-R6-05 | info | არქიტექტურა: ერთი `readRiffValue` normalisation layer + write-side შემოწმება და პატიოსანი per-file `BatchWriteResult` ცარიელი `catch {}`-ის ნაცვლად | signal, არა task |
| RR-R8-01 | low | `metadata.ts:199` `String(riffChunkId)` ზედმეტია (უკვე string-ია) | signal |
| RR-R8-02 | low | `metadata-write-field-errors.test.ts` ორმაგი ბრჭყალები | TM-B06 |
| RR-R8-03 | low | read path-ის ცარიელი `catch {}` non-ID შეცდომას კვალის გარეშე მალავს; debug log დაეხმარებოდა | signal |
| RR-R8-04 | info | არქიტექტურა: schema-ს ვალიდაცია load-ზე (`riffChunkId` `/^[A-Z0-9 ]{4}$/`, reserved/duplicate), all-or-nothing write მეორე ხაზად | signal = B-R7-02, Saba |
| A-R8-01 | info | `recording-tag-contract.md`-ის header და `## შემოწმება` D-17/D-18-ს და ახალ ტესტს არ ახსენებს | signal (შემდეგი docs რაუნდი) |
| A-R8-02 | low | ბიბლიოთეკა ID-ს JS string length-ით ამოწმებს, არა ბაიტებით: 4-სიმბოლოიანი non-ASCII ID D-18-ს არ იწვევს | B-R7-02 |
| C-R8-01 | low | batch-ის ჩავარდნის შემდეგ (`0 saved, 2 failed`) panel ორივე ფაილზე „Multiple values“-ს აჩვენებს (`c-round-8/r8-5-after-ii-toast.png`); ) | signal |
| C-R9-01 | info | hang-ignore-term case-ებში bash stderr-ზე `Killed sudo env …` ხაზებს ბეჭდავს; მხოლოდ log-ის ხმაური | signal |
| C-R9-02 | low | cold-start `firstWindow` Timeout 30000ms (A R9 run1, `folder-workflow.spec.ts:27`) | **R10** (TM-B14) |

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
| D-16 | `meta:read` ყოველი დაბრუნებული string-იდან შლის trailing NUL-ების მწკრივს (`/\u0000+$/`): სტანდარტული string ველები, array ველების (artists, genres) თითო ელემენტი, custom INFO text/tags მნიშვნელობები; custom number ველისთვის `Number()`-მდე. `''`-ად ქცეული array ელემენტი რჩება (არ იფილტრება). შიდა და წინა NUL-ს არ ეხება. ჩაწერა უცვლელია (T1-1 „no NUL“ guard-ად რჩება). ffprobe NUL-ს მალავს, ამიტომ მტკიცებულება raw INFO ბაიტებია | B (R5 close), ტექნიკური, შექცევადი; Saba-ს ეცნობება. **done** R6 (`d52354d`): Biome regex-ს კრძალავს (`noControlCharactersInRegex`), ამიტომ charCode loop-ითაა |
| D-17 | `writeTagsToFile`: თუ schema-ში არის custom INFO ველი და title workaround-ის შემდეგ `getRiffInfoTags` მაინც `[]`-ს აბრუნებს, ისვრის `Error('RIFF INFO tag is not available; custom fields were not written')`-ს **`file.save()`-მდე**: არაფერი იწერება. `meta:write` → `Failed to write metadata: …`, `meta:write-batch` → ფაილი `failed`-შია. custom ველის გარეშე schema-ზე გავლენა არ აქვს. per-field catch უცვლელია (RR-R6-05) | B (R6 close), ტექნიკური, შექცევადი. **done** R7 (`28ad3ab`, TM-B12) |
| D-18 | `writeTagsToFile`: custom INFO loop-ში `setValuesFromStrings`-ის შეცდომა აღარ იყლაპება ჩუმად. loop ყველა ველს ცდის და აგროვებს ჩავარდნილ `String(riffChunkId)`-ებს schema-ს რიგით. თუ ერთი მაინც ჩავარდა, **`file.save()`-მდე** ისვრის `Error('RIFF INFO fields could not be written: AB, …')`-ს, ამიტომ არაფერი იწერება (all-or-nothing, როგორც D-17). `meta:write` → `Failed to write metadata: RIFF INFO fields could not be written: AB`, `meta:write-batch` → ფაილი `failed`-შია, დანარჩენი გრძელდება. `undefined` მნიშვნელობის ველს არ ცდის. `riffChunkId`-ის გარეშე custom ველი ისევ გამოიტოვება (B-R7-03). read path უცვლელია | B (R7 close), ტექნიკური, შექცევადი. **done** R8 (`4a2062d`, TM-B13) |
| D-19 | `apt-install.sh`: knob-ები `APT_ATTEMPT_TIMEOUT_SECONDS` (240), `APT_ATTEMPTS` (2), `APT_KILL_AFTER_SECONDS` (10, ადრე hard-coded), `APT_RECOVERY_TIMEOUT_SECONDS` (60, ახალი). `dpkg --configure -a` და `debconf-communicate` R+K-ით შეზღუდულია. პირველი ხაზი `apt-install: worst case Ws`, W=(R+K)+N(T+K)+(N−1)(R+K) = 640. `check.yml` apt step `timeout-minutes: 13`; E2E `npm run test:e2e`-ით build-დება (RR-R1-01). CI-ს ეხება, importer-ის კონტრაქტს არა | B R8 close. **done** R9 (`499a6f3`, C R9-1…R9-8) |
| D-20 | E2E launch: ერთი helper `launchTagManagerApp()` (`tests/e2e/electron-launch.ts`) = `electron.launch` + `firstWindow({ timeout: FIRST_WINDOW_TIMEOUT_MS = 60000 })` + `waitForLoadState('domcontentloaded')`, აბრუნებს `{ app, page }`. ყოველი spec მას `beforeAll`-იდან იძახებს, hook timeout `LAUNCH_HOOK_TIMEOUT_MS = 90000`. timeout-ზე Error ასახელებს budget-ს, elapsed ms-ს და main process-ის stdout/stderr-ის ბოლოს. retry fix არ არის; `playwright.config.ts` უცვლელია. test-only opt-in env `TAG_MANAGER_E2E_ELECTRON_REQUIRE=<absolute path>` → `-r <path>` entry-მდე; unset → args უცვლელია (D-06). `check.yml` job timeout 30 → 40. CI/ტესტებს ეხება, importer-ის კონტრაქტს არა | B R9 close, ტექნიკური, შექცევადი; R10 |
