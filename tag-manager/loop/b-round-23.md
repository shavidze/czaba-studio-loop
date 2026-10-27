# B — Round 23-ის დახურვა და Round 24-ის დაგეგმვა

Planner: B · თარიღი: 2026-10-27 · baseline HEAD `59c26d6a3c6d4ca0b73e9fa78d822a5bac427d16` (root-ის `bb4671d` v1.4.0 release commit-ის თავზე). tree სუფთაა (`git status --porcelain` ცარიელია). B-ის ფაზაში source არ შეცვლილა: ყველა experiment გაეშვა `/tmp/b-r24`-ში (`git archive 59c26d6`, `node_modules` symlink-ით).

## 1. Round 23-ის შედეგი (C-ის მტკიცებულებით)
- **C:** `c-round-23.json` → `taskStatus: PASS`, `realVerified: true`, passed R23-1…R23-6, bugs 0. blocked მხოლოდ Windows packaging-ზეა (ეს FAIL არ არის).
- **მთავარი evidence:**
  - ძველი src + ახალი ტესტები: 201/201. D-32 behaviour-neutral-ია, (z12) pin-ია.
  - ხუთივე `beforeEach` ხაზი `mockClear`-ზე → (i2) ვარდება (1/49).
  - M7 და MI-1…5 მოკლულია; MS-1 დაგეგმილი equivalent-ია და გადარჩა.
  - gate: 201/93/7, `--retries=0` 7/7, Biome 8.
  - real app (3000 ms delay): single, batch, D-30 replay და schema add ნორმალურად მუშაობს; ffprobe და music-metadata ემთხვევა.
  - docs/bugs/001: 8 ჩანაწერი.
- **Root gate:** `gate-round-23.json` → `published`, commit `59c26d6`. ეს შემდეგი baseline-ია. Review: COMMIT OK; low-ები RR-R23-01…03, არქიტექტურა RR-R23-04.
- **Archive:** `tasks/round-23.md` ახალ ფაილად შეიქმნა (`cmp` OK). ძველი archive არ გადაწერილა.

## 2. Backlog-ის განახლება
script: `b-round-23-update-backlog.py`. idempotent-ია (ორჯერ გაეშვა, `cmp` OK). backup: `b-round-23-backlog-before.json`.
- **TM-B26 → done:** `realVerified=true`, commit `59c26d6`, evidence C R23-დან. **D-32 → done R23.**
- **rounds:**
  - 23 → published `59c26d6` + c_result;
  - 24 → planned.
- **ახალი item TM-B27** (bug, low, in_progress, round 24, D-33). შედის:
  - RR-R23-01;
  - A-R21-03 (routing შეიცვალა: R23-ში known limit იყო, ახლა fix-ია);
  - B-R23-01;
  - C-R23-01;
  - docs: RR-R23-02, B-R23-02, B-R23-03.
- **ახალი D-33** (ტექნიკური, შექცევადი, renderer-only):
  1. save-ის re-read იყენებს `useSchemaStore.getState().fields`-ს, write კი click-ის დროის `fields`-ს;
  2. `handleSchemaChanged` ჩავარდნილი chunk-ის path-ებს store-ის ჩანაწერს უტოვებს (D-22-ის ანალოგი).
  - K-4 კონტრაქტს არ ეხება.
- **ახალი finding-ები:**
  - RR-R23-01 (low) → TM-B27.
  - RR-R23-02 (low): docs-ის line refs → TM-B27 + signal.
  - RR-R23-03 → record only (= B-R21-02).
  - **RR-R23-04 (არქიტექტურა) → signal**, task არ არის. მისი entry-3 ნაწილი D-33 ნაწილი 1-ად აიღება, hook-ში გადატანის გარეშე.
  - A-R23-01 → signal.
  - A-R23-02 → TM-B27 ((i3) ცვლის).
  - C-R23-01 → TM-B27.
  - **B-R23-01 (low, ახალი):** schema re-read-ის reject ფაილებს map-იდან აგდებს.
  - **B-R23-02 (low):** A-R21-03-ის შებრუნებული რიგი → docs, entry 9.
  - **B-R23-03 (low):** schema-ს Done unsaved edits-ს ჩუმად ცვლის → Saba-ს კითხვა + docs, entry 10.
- **`feature-status.md`:** script `b-round-23-update-feature-status.py`, idempotent (`cmp` OK), backup `b-round-23-feature-status-before.md`. 22 ხაზი შეიცვალა:
  - header და round 23-ის აბზაცი;
  - TM-B26 → done, ახალი row TM-B27;
  - A-R21-03-ის routing;
  - 10 ახალი finding row;
  - D-32 → done, ახალი row D-33.

## 3. B-ის experiment-ები (`b-round-23-exp/`)
- **`metadata-panel-schema-change.exp.test.ts.txt`** real `SchemaEditor`-ით (Customize Fields → R24note → Add Field → Done):
  - (s1) `59c26d6`-ზე გადის.
  - (s4) single და (s5) batch save, რომლის დროსაც schema იცვლება, ვარდება: `expected undefined to be 'fromfile'`. **A-R21-03 რეპროდუცირდა.**
  - (s3) `readMetadataBatch` reject → `expected '' to be 'ACat'`, store map = `{}`. **ეს ახალი ბაგია, B-R23-01.**
- **`metadata-panel-d33.exp.diff.txt`** (+6 ხაზი): ყველა ტესტი გადის, Biome 8 (იგივე სია).
- **საბოლოო შემადგენლობა** (advisor-ის შენიშვნით შემოწმდა, task-ის მსგავსად: (s1)–(s5), მათ შორის (s2), (s1)-ის call assertion-ები და (s4)-ის write/read schema assertion-ები, + (i3)-იანი batch-save ფაილი, 49 ტესტი):
  - D-33 src: **205/205** (11 ფაილი);
  - `59c26d6` src: **202 passed / 3 failed**, ზუსტად (s3), (s4), (s5);
  - `tsc -p tsconfig.test.json` 0 და `-p tsconfig.web.json` 0.
- **`batch-save-i3.exp.diff.txt`** (`resetWindowApiMocks()` + (i3)):
  - 49/49 გადის; `-t "i3"` მარტოც გადის.
  - helper-ის ხუთი ხაზი `mockClear`-ზე → (i3) მარტო ვარდება: `promise rejected "Error: leaked" instead of resolving`.
  - `beforeEach` helper-ის გამოძახების გარეშე → 24 ტესტი ვარდება (MB survivor არ არის).
- **კოდის წაკითხვა:**
  - `writeTagsToFile` მხოლოდ მიცემულ schema-ს გადის და `undefined`-ს ტოვებს, ამიტომ Title-ის გარეშე write title-ს არ შლის (R24-5 ნაბიჯი 5-ის საფუძველი);
  - `setEditingMetadata` `modifiedFields`/`isDirty`-ს წმენდს → B-R23-03.

## 4. Round 24-ის არჩევანი: TM-B27 (D-33)
- **policy:**
  - critical/high ღია არ არის, C-ს ბაგი არ უპოვია.
  - RR-R23-01 review-ის რეალური test defect-ია: pin, რომელიც შეიძლება არაფერს ამოწმებდეს. ის Saba-ს არ ელოდება, ამიტომ BLOCKED არასწორი იქნებოდა.
  - A-R21-03-ს და B-R23-01-ს მოსალოდნელი შედეგი ცალსახა აქვთ (ფორმა მიმდინარე schema-ს აჩვენებს, ჩანაწერები D-22-ის მსგავსად რჩება), ამიტომ product არჩევანი არ სჭირდებათ.
  - სამივე ერთ ადგილზეა (`MetadataPanel` save/schema re-read და მისი ტესტები), ანუ policy-ის ფარგლებშია (≤ 3 ახლოს მდგომი ბაგი).
- **reference-first:** exempt (fix + test, ახალი UX არ არის).
- **ფაილები:**
  - batch-save test (helper + (i3));
  - ახალი `metadata-panel-schema-change.test.ts` (s1)–(s5);
  - `MetadataPanel.tsx` (D-33);
  - `docs/bugs/001` (D-33, entry 3 fixed, line refs, entries 9/10);
  - README cell;
  - `STATE_MANAGEMENT.md`, ერთი ხაზი.
  - `SchemaEditor.tsx`, store-ები და დანარჩენი ტესტები frozen-ია.
- **acceptance:**
  - R24-1: ownership.
  - R24-2: red (s3)(s4)(s5), 202/3 ძველ src-ზე; (i2)-ის vacuity proof; 205/205.
  - R24-3: MR-1, MR-2, MF-1, MI-1…5 (მარტო), MB.
  - R24-4: gate 205/93/7, Biome 8.
  - R24-5: real app — Title დამალვა → save-ის დროს `+ Title` → Title რჩება; read-batch reject → ფორმა და row-ები რჩება; ffprobe + music-metadata; red reference `59c26d6` build-ზე.
  - R24-6: docs + primitive.
- **advisor-ის შენიშვნები გათვალისწინებულია:**
  - helper-ის გზა არჩეულია და არა comment;
  - (i3) მარტო ეშვება;
  - MB mutant წინასწარ შემოწმდა;
  - re-read-ის getState() fix-ად ცალსახად დასახელდა;
  - docs/bugs/001-ის line refs ownership-შია;
  - SchemaEditor-ის `onSave` და `setup.ts` წაკითხულია.

## 5. Saba-ს კითხვების პაკეტი
- **უცვლელი:**
  - D-07 (TM-T1-MIG)
  - D-10 + TM-B11
  - D-12/TM-B08 + B-R6-01
  - TM-T1-DUP (RR-R3-01, medium)
  - D-15 + RR-R5-01 + RR-R17-03
  - B-R7-02/RR-R8-04
  - TM-B05
  - TM-B06 (+ RR-R14-03/05, RR-R16-01, A-R16-02)
  - RR-R1-07
  - RR-R3-05
  - TM-T2-DATA
  - RR-R13-01
  - RR-R15-01
  - RR-R15-03
  - RR-R15-05
  - C-R15-01
  - optional RR-R12-02
  - B-R18-01 + RR-R19-01 (medium)
  - B-R19-01 + RR-R20-01 + C-R21-01
  - RR-R20-04
  - B-R21-02 (+ RR-R22-01, A-R22-01, RR-R23-03)
  - RR-R22-04
- **ახალი, B-R23-03:** schema-ს შენახვამ (Done) unsaved edits ჩუმად არ უნდა დაკარგოს. ვარიანტები:
  - (a) toast `Unsaved changes were discarded`, როგორც selection-ის შეცვლისას;
  - (b) აკრეფილი მნიშვნელობები re-read-ის თავზე რჩება (D-30-ის მსგავსად);
  - (c) `Customize Fields` dirty ფორმაზე ჩაკეტილია.
- **ახალი, B-R23-02 (optional):** save-ის დროს schema editor ჩაიკეტოს? ეს შებრუნებულ race-ს მოხსნის; ახალი UX-ია, reference-first კვლევა სჭირდება.

## 6. Root-ისთვის
- `gate-round-23.json`-ში Actions run კვლავ არ არის. **თხოვნა:** მიაბით `Check` run `59c26d6`-ზე (ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე). ის ხურავს TM-T0-CI-ს, TM-T0-ს, TM-T0-CI-FU-ს და TM-B14-ის Actions ნაწილს.
- **A-R17-02:** read-primitives hook A-სთან ბოლო round-ებში არ ამოქმედდა. შეამოწმეთ job-ის `~/.claude/settings.json`.

## 7. გადაწყვეტილება
**CONTINUE.** შემდეგი task: round 24, TM-B27 (D-33).

round 25 სავარაუდოდ **BLOCKED** იქნება Saba-ს კითხვების პაკეტზე, თუ მანამდე პასუხი არ მოვა ან C/review ბაგს არ იპოვის.

დარჩენილი item-ები:
- TM-B27
- TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14
- TM-B11, TM-T1-MIG, TM-T1-DUP, TM-B08
- TM-T2, TM-T2-DATA
- TM-B05, TM-B06
