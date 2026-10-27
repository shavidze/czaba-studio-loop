# B — Round 25 დახურვა / Round 26 დაგეგმვა

თარიღი: 2026-10-27 · Planner: B

## 1. Round 25-ის შედეგი (TM-B28)
- **C:** PASS R25-1…R25-6, realVerified=true (`c-round-25.md`, `c-round-25.json`). FAIL არ არის. C-მ ორი low docs finding დატოვა: C-R25-03 და C-R25-04.
- **Root gate:** published `c2c19a7` (base `3d27ba9`), review COMMIT OK. finding-ები low და info დონისაა.
- **მტკიცებულება:**
  - renderer 208/208 (11 file);
  - (i3) და (s8) ცალ-ცალკე გადის;
  - MI-1…MI-6, MB, MA-1 და MA-2 მოკლულია;
  - MBS გადარჩა (C-R25-01), MW გადარჩა (C-R25-02, მხოლოდ style);
  - gate 208/93/7, `--retries=0` 7/7, Biome 0/8 (იგივე სია);
  - real app smoke: ffprobe და music-metadata ველ-ველ ემთხვევა.
- **A-ს გადახვევა spec-იდან (A-R25-01)** სწორია: ფაილზე გადასვლა store-იდან კითხულობს (`MetadataPanel.tsx:111`). C-მ src-თან შეადარა.
- task დაარქივდა `tasks/round-25.md`-ში. ფაილი ახალია, არაფერი გადაწერილა.

## 2. Backlog-ის ცვლილებები (მხოლოდ C-ის მტკიცებულებით)
- **TM-B28:** `in_progress` → **done**, realVerified=true, commit `c2c19a7`.
- **finding-ები → done (TM-B28):** RR-R24-01, RR-R24-03, RR-R24-04, C-R24-01, C-R24-04.
- **RR-R24-02 და B-R23-02:** docs-ში ჩაიწერა (entry 9). fix მიდის → **TM-B29**.
- **B-R23-02-ის severity:** low → **medium** (§3).
- **ახალი finding-ები:**

  | ID | severity | routing |
  |---|---|---|
  | A-R25-01 | info | done |
  | A-R25-02 = C-R25-03 | low | TM-B29 docs: entry 3 step 3 |
  | A-R25-03 = C-R25-04 | low | TM-B29 docs: entry 10 step 3 |
  | C-R25-01 | low | record (MBS; hygiene კანდიდატი) |
  | C-R25-02 | info | record (MW) |
  | RR-R25-01 | low | **უარყოფილია** (ქვემოთ) |
  | RR-R25-02, RR-R25-03 | low/info | done, ცვლილება არ სჭირდება |
  | RR-R25-04 | info | signal; generation-ის ნაწილი → TM-B29 |
  | B-R25-01 | low | ჰიპოთეზა: Rescan ან Open Folder save-ის დროს, იგივე კლასი. ჯერ red reproduction |
  | B-R25-02 | medium | TM-B29 (red reproduction, §3) |

- **RR-R25-01 უარყოფილია.** review ამბობდა, რომ `:111` `if (meta) {`-ზე მიუთითებს. `cat -n` `c2c19a7`-ზე აჩვენებს:
  - :110 = `if (selectedPaths.length === 1) {`;
  - :111 = `const meta = metadata[selectedPaths[0]];`;
  - :112 = `if (meta) {`.

  reference სწორია. round 26 ისედაც ყველა ref-ს ხელახლა მიუთითებს.
- **RR-R25-04, "სხვა test ფაილები":** grep-ით სხვა renderer test-ში `window.api`-ს inline reset არ მოიძებნა. `schema-store.test.ts` თავის mock-ებს იყენებს. ამიტომ ეს signal-ია და სამიზნე არ აქვს.
- **ახალი item TM-B29** (medium, D-34), `depends_on` TM-B28. ახალი გადაწყვეტილება **D-34** (planned) ჩაიწერა backlog-ში და `feature-status.md`-ში. K-4 კონტრაქტს არ ეხება.
- **TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14** უცვლელად `in_progress`-შია. `gate-round-25.json`-ში Actions run არ არის.

## 3. B-ის ექსპერიმენტი: B-R23-02 / RR-R24-02 red (B-R25-02)
ექსპერიმენტი `/tmp/b26` ასლში ჩატარდა, რეპოზიტორიაში არაფერი ჩაწერილა (`git status` ცარიელია). მტკიცებულება loop folder-შია:
- `b-round-25-exp-repro.test.ts.txt`;
- `b-round-25-exp-prototype.diff.txt`;
- `b-round-25-exp-mutants.log`;
- `b-round-25-exp-mut.py.txt`.

**შედეგები:**
- **ფაქტი (component დონე, `c2c19a7` src):** შვიდი ტესტიდან ხუთი ვარდება:
  - (r1) batch;
  - (r2) single + Title-ის აკრეფა save-ის დროს;
  - (r5) stale chunk 1, save chunk-ებს შორის;
  - (r6) reject-ის დროის snapshot, save chunk-ებს შორის;
  - (r7) ნაწილობრივი batch failure.

  ორი pin, (r3) და (r4), გადის. assertion: `expected 'ACat' to be 'R24Cat'`.
- **ფაქტი (prototype, store-ზე დაფუძნებული):** 215/215, Biome 8 warning, tsc 0. MG-1…MG-9 თითოეული მოკლულია.
- **ფაქტი:** ref-ზე დაფუძნებულმა პირველმა prototype-მა (`useCallback`) Biome-ში მე-9 warning გამოიწვია (`useExhaustiveDependencies`). ამიტომ D-34 file store-ში ცხოვრობს, ისე როგორც RR-R24-05 გვთავაზობდა.
- **ფაქტი:** შედარება chunk-ის resolve-ზე (r5)-ზე ჩავარდა. ამიტომ წესი შედარებას store-ში წერის მომენტში ითხოვს.
- **ფაქტი (კოდი):**
  - main-ში single write სინქრონულია (`writeTagsToFile` await-ის გარეშე);
  - batch write ყოველ 5 ფაილზე `setImmediate`-ს აკეთებს;
  - read-batch ყოველ 10 ფაილზე აკეთებს იმავეს.
- **დასკვნა:** batch და chunk-ებს შორის რიგი production-ში მიღწევადია (დიდი ფაილები, ნელი batch write). single რიგი მხოლოდ write-ის delay-ით მიიღწევა. real app-ში ეს ჯერ შემოწმებული არ არის: R26-5 C-ის harness-ით ამოწმებს.
- **დასკვნა (severity medium-ის მიზეზი):** stale ფორმა `isDirty` false-ით რჩება. შემდეგი save მთელ `editingMetadata`-ს წერს, ამიტომ შენახული მნიშვნელობა ჩუმად ბრუნდება ძველზე. ეს data-loss გზაა. R26-5 ამას ორ build-ზე ამოწმებს.

## 4. Round 26: TM-B29 (`current-task.md`)
- **(a) D-34, file store:** `writeGeneration`, `pathWriteGenerations`, `markPathsWritten`.
- **(b) `handleSave`:** write-ის resolve-ის შემდეგ path-ებს აწერს. batch-ში მხოლოდ წარმატებულ path-ებს.
- **(c) `handleSchemaChanged`:**
  - chunk-ის გაგზავნისას generation-ს ინახავს;
  - store-ში წერისას superseded და kept path-ები მიმდინარე store entry-ს იღებენ;
  - ფორმას არ ცვლიან.
- **(d) ტესტები:** (s9)–(s15) და (g1). ძველ src-ზე 6 red, A-ს tree-ზე 216/216. mutant-ები MG-1…MG-10 და MS-1.
- **(e) docs:** entry 9 გასწორდა; entry 3 და entry 10-ის step 3 შესწორდა (C-R25-03, C-R25-04); README; `STATE_MANAGEMENT.md`-ში ერთი სტრიქონი.
- **(f) real app:** `c2c19a7` build vs A-ს build, harness-ით; data-loss გზის შემოწმება; ffprobe და music-metadata.
- **reference-first:** აქ არ ვრცელდება, ეს pure fix-ია (UX ცვლილება არ არის).

## 5. Saba-ს კითხვების პაკეტი
უცვლელია (`b-round-23.md` §5 + B-R23-03). schema editor-ის ჩაკეტვა save-ის დროს UX ვარიანტად რჩება, მაგრამ D-34-ის შემდეგ საჭირო აღარ არის.

## 6. Root-ისთვის
- **Actions run:** `Check` run ჯერ კიდევ არ არის მიბმული `7879ee0`-ზე ან უფრო გვიანდელ commit-ზე. ის ხურავს TM-T0-CI-ს, TM-T0-ს, TM-T0-CI-FU-ს და TM-B14-ის Actions ნაწილს.
- **A-R17-02:** read-primitives hook A-სთან R25-შიც არ ამოქმედდა. ეს ღიაა.
- **RR-R25-01:** უარყოფილია grep-ით (§2).

## 7. გადაწყვეტილება
**CONTINUE.** შემდეგი task: round 26, TM-B29 (D-34).
