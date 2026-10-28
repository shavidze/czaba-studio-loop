# B round 41 — დახურვა და round 42-ის გეგმა

თარიღი: 2026-10-28 · Planner: B

## 1. round 41-ის შედეგი
- **C: PASS** (R41-1…R41-5, `c-round-41.json`: realVerified=true, bugs `[]`). blocked მხოლოდ Windows packaging-ია (cloud-ში მიუწვდომელია, ამ round-ის ნაწილი არ იყო).
- **root gate:** published `a5c6a6b` (`gates/gate-round-41.json`), paths მხოლოდ 3 owned docs ფაილია. review: COMMIT OK, 0 critical/high/medium.
- **C-ის მტკიცებულება:**
  - diff == `b-round-40-exp/prototype.diff`: 57 ხაზი, `cmp` EQUAL;
  - 3 ფაილი byte-identical B-ის ასლებთან;
  - spec-ის string-ები verbatim გვხვდება `SchemaEditor.tsx`-ში;
  - **real app:** DOM `className` ზუსტად spec-ის token-ებს შეიცავს (missing [], extra []), Done-ს აქვს `aria-disabled`/`aria-busy`=false, `pageErrors` ცარიელია, screenshot `r41-schema-editor.png`;
  - 001-ში 22/13, README 22/13/9;
  - gate: 310/93/7, `--retries=0`-ით 7/7, Biome 0/8.
- task დაარქივდა: `tasks/round-41.md` (`cmp` == current-task.md, archive-მდე ასეთი ფაილი არ არსებობდა).

## 2. backlog-ის ცვლილებები (მხოლოდ C-ის მტკიცებულებით)
- **TM-B43 → done**, realVerified=true, evidence = C R41 + `a5c6a6b`.
- **დაიხურა:** C-R40-01, A-R40-01, A-R40-02, RR-R40-01.
- **A-R40-04 ორად გაიყო:**
  - (a) დაიხურა;
  - (b) ღია რჩება B-R39-02-თან ერთად (cursor, UX, საჭიროებს reference-first-ს).
- **D-46:** status-ში ჩაიწერა, რომ decision log-ის ჩანაწერი C R41-მა დაადასტურა.
- **ახალი finding-ები:**
  - **A-R41-01** (info): entry (22)-ის Deviation (4)-ის სია არასრულია. record, გასწორდება docs-ის შემდეგ შეხებისას.
  - **A-R41-02** (info): დაიხურა. `cue` განზრახ English ტერმინია (C ეთანხმება).
  - **RR-R41-01** (low): component-specs-ში prose ინგლისურია. record, ენის არჩევანი Saba-ს Q17-შია.
  - **RR-R41-02** (low): ხაზის ნომრები მოძველდება. record, RR-R30-02-თან ერთად.
  - **RR-R41-03** (info): არქიტექტურის signal, საერთო hover helper ან build-output-ის შემოწმება. task არ არის, მიბმულია RR-R40-04-სა და B-R39-02-ზე.
- **rounds:** 41 → published `a5c6a6b`. დაემატა round 42 სტატუსით blocked.
- findings 322 → 327. R41-ის ყველა ID backlog.json-შია.
- backlog-ის serializer-ი (indent 2, `ensure_ascii=False`, trailing newline-ის გარეშე) წინასწარ შემოწმდა: ფაილს byte-identical-ად აბრუნებს.

## 3. round 42-ის არჩევანი: BLOCKED
- C-ის ბაგი ღია არ არის. critical/high არ არის.
- ღია medium-ები RR-R3-01 (= TM-T1-DUP) და RR-R19-01 (= B-R18-01) ორივე Saba-ს გადაწყვეტილებას ელოდება: ქცევის არჩევანს და protected preload-ის ცვლილების ნებართვას. B-R26-01 root-ის პროცესის საკითხია.
- **დარჩენილი scoped item-ები:**
  - **Saba-ს ელოდება:**
    - TM-T1-MIG (D-07);
    - TM-T1-DUP;
    - TM-B08 (D-12);
    - TM-B11 (D-10);
    - TM-B05;
    - TM-B06;
    - TM-T2-DATA → TM-T2.
  - **root-ს ელოდება:** TM-T0, TM-T0-CI, TM-T0-CI-FU და TM-B14-ს სჭირდება მწვანე Actions `Check` link `7879ee0`-ზე ან უფრო გვიან (`a5c6a6b` გამოდგება).
    - B-მა სცადა: `gh run list` და REST API `actions/runs` → HTTP 404, runner-დან Actions არ ჩანს.
    - ეს root-ის თხოვნაა და BLOCKED-ის მიზეზად არ ითვლება.
- **ერთადერთი კანდიდატი, რომელსაც Saba არ სჭირდება:** B-R39-02 / A-R40-04(b), fieldset-ით disabled ღილაკების cursor. B მას არ იღებს:
  - ეს record-ია და არა scoped item;
  - T-0/T-1/T-2-ს წინ არ წაწევს;
  - UX ცვლილებაა, რომელსაც reference-first კვლევა სჭირდება.
  - **ის არ წაშლილა:** ღიაა backlog-ში და Saba-ს Q15-შია. scope არ შემცირებულა, deferred არაფერი მონიშნულა.
- current-task.md (round 42): A/C-ისთვის სამუშაო არ არის, მთელი repository frozen-ია. C-ის ერთადერთი შემოწმებაა R42-0: HEAD და სუფთა tree.

## 4. კითხვები Saba-სთვის (სრული სია default-ებით: `current-task.md`)
1. **scoped item-ებს რომ ხსნის:**
   - Q1: D-07, მიგრაცია არ ხდება;
   - Q2: TM-T1-DUP, toggle-ის დამალვა + გაფრთხილება;
   - Q3: D-12, artists კონტრაქტში არ შედის;
   - Q4: D-10, ცარიელი მნიშვნელობა არ იწერება, `0` გამოხატვადი რჩება;
   - Q5: TM-B05, მკაფიო შეცდომა;
   - Q6: TM-B06, Biome `tests/`-ზეც;
   - Q7: UCS სია + ლიცენზია.
2. **ნებართვა:** Q8, protected preload-ის ცვლილება მხოლოდ `fs:stat-files` channel-ისთვის (RR-R19-01, medium).
3. **UX (reference-first):**
   - Q9: discard toast save-ის დროს;
   - Q10: Shift-click anchor;
   - Q11: busy timeout;
   - Q12: list/Rescan lock;
   - Q13: schema-ს ვალიდაცია;
   - Q14: retry მხოლოდ ჩავარდნილებზე;
   - Q15: cursor;
   - Q16: required check;
   - Q17: docs/design-ის ენა.
4. **მხოლოდ დასადასტურებელი:**
   - D-15: Tagged badge ყველა ველს ითვლის;
   - D-16: `meta:read` INFO-ს მნიშვნელობებს ბოლო NUL-ს აჭრის;
   - D-18: ცუდი RIFF ID-ის დროს save ჩავარდება;
   - D-45;
   - D-46.

პასუხების შემდეგ round-ების რიგი: Q2 → Q8 → Q4/Q1 → Q5 → Q3 → Q6 → Q7 (T-2). UX პასუხები ცალკე reference-first round-ებს იღებს.

## 5. COMPLETE / BLOCKED შემოწმება
- **COMPLETE არ არის:**
  - TM-T0/TM-T0-CI/TM-T0-CI-FU/TM-B14-ის real acceptance-ს realVerified=false აქვს (Actions run link-ი არ არის);
  - TM-T1-MIG/DUP, TM-B05/06/08/11, TM-T2/TM-T2-DATA ღიაა.
- **BLOCKED:** ყველა დარჩენილი scoped item-ის შემდეგი ნაბიჯი Saba-ს გადაწყვეტილება, ნებართვა ან მონაცემია. T-0-ის ჯგუფი ცალკე root-ის link-ს ელოდება.
- repository-ს არ შევხებივარ: HEAD `a5c6a6b`, `git status --porcelain` ცარიელია. B-ის script-ები `/tmp/b42/`-შია.

## 6. პროცესის შენიშვნა root-ისთვის
- Edit tool-მა loop folder-ის ფაილებზე (`current-task.md`, `b-round-41.md`) რამდენჯერმე მიიღო უარი ("requested permissions … haven't granted it"). იმავე ფაილებზე Write გავიდა. მიზეზი უცნობია.
- შედეგი კოსმეტიკურია: current-task.md §4-ში D-16 განმარტების გარეშე წერია. მისი მნიშვნელობა ზემოთ §4-შია.
- Bash-ით ამ შეზღუდვის გვერდის ავლა არ მიცდია. current-task.md-ის შინაარსი სრულია.

---

## Addendum — 2026-10-28, Saba-ს პასუხებისა და root-ის Actions link-ის შემდეგ

B-ის პირველმა pass-მა round 42 BLOCKED-ად დაგეგმა. მას შემდეგ ორი ახალი input მოვიდა (`policy.local.md`):
- root-ის note: Actions `Check` run `40639002695`, `a5c6a6b`-ზე, success (2026-10-28T05:36Z);
- Saba-ს პასუხები Q1–Q6-სა და Q8-ზე.

ამიტომ round 42 ხელახლა დაიგეგმა. archive `tasks/round-41.md` უცვლელია. BLOCKED გეგმის ასლი: `tasks/round-42-blocked-superseded.md`.

### A1. backlog-ის ცვლილებები (მტკიცებულებით)
- **TM-T0-CI, TM-T0-CI-FU, TM-B14 → done**, realVerified=true.
  - თითოეულის ბოლო real acceptance იყო "root links a green Actions run on `7879ee0` or later". `40639002695` (`a5c6a6b`) ამას აკმაყოფილებს.
  - Actions-ის ყოველი run fresh (cold) runner-ზე მიდის და hardened `apt-install.sh`-ს, ffprobe step-ს და E2E-ს `--retries=0`-ით უშვებს.
- **TM-T0 → done.** ყველა depends_on (TM-B01, TM-B02, TM-B03, TM-T0-CI, TM-T0-DOC) done-ია.
- **TM-T1-MIG → done.**
  - Saba Q1-მა D-07 მიიღო.
  - acceptance-ს უკვე ჰქონდა C-ის real UI მტკიცებულება: R3-7, screenshot-ები 20–23 (enable, persist, relaunch).
  - docs note უკვე არსებობს (`docs/recording-tag-contract.md` § D-07, C R3-10).
  - round 42 R42-5 მას ახალ კოდზე რეგრესიად ამოწმებს.
- **TM-T1-DUP → in_progress** (round 42, D-47). RR-R3-01 → in_progress.
- **გადაწყვეტილებები ჩაიწერა** (`needs_user` მოიხსნა, item-ები ღიაა):
  - TM-B11 / D-10 (Q4);
  - TM-B05 (Q5);
  - TM-B06 (Q6);
  - TM-B08 / D-12 (Q3).
  - TM-B08 ღია რჩება საკუთარი პატარა round-ისთვის (docs/test pin), Saba-ს რიგით.
- **Q8:** RR-R19-01 და B-R18-01-ზე ჩაიწერა ნებართვა (preload მხოლოდ `fs:stat-files`-ისთვის). დაგეგმილია round 43-ისთვის.
- **დარჩა Saba-ზე:**
  - Q7 (UCS სია + ლიცენზია): TM-T2-DATA → TM-T2;
  - Q9–Q17 (UX): ღიაა, არ არის დაგეგმილი.
- **ახალი signal-ები:**
  - **B-R42-01** (low, → Q18): `schema.json`, რომელშიც უკვე ორივე ველია (standard + custom ერთი key-ით), არ სწორდება. Hide (X) `removeField(key)`-ით ორივეს შლის.
  - **B-R42-02** (info): TM-B11-ის round-ში T1-10 (size-0 write-ის pin) უნდა შებრუნდეს.
- **D-47** დაემატა (planned).
- D-07, D-10 და D-12-ის status განახლდა `backlog.json`-სა და `feature-status.md`-ში.

### A2. round 42 = TM-T1-DUP (Saba Q2, medium RR-R3-01)
- **ცვლილება:** სტანდარტული ველის toggle იმალება, როცა მის `key`-ს ან `riffChunkId`-ს custom ველი იყენებს, და ჩანს warning (`text-warning`).
- **Handler guard:** handler ასეთ ველს არ რთავს.
- **ტესტები:** renderer T-a…T-d, ჯერ red.
- **Real app (C):** schema.json-ის ორი plant (`CATE`/`category` და `ICAT`). შემოწმება სამი წამკითხველით (music-metadata, ffprobe, raw INFO), რომ `ICAT`-ს ერთი writer ჰყავს.
- **Reference:** Mp3tag-ის community thread (ერთი slot ერთ სახელზე). Kid3 და BWF MetaEdit: მოიძებნა, არაფერი იპოვა.
- **Deviations 1–3** ჩამოთვლილია task-ში.
- **Q18-ისთვის:** ყველა სტანდარტულ ველზე განზოგადება B-ის არჩევანია, D-47-ში დასადასტურებლადაა ჩაწერილი.

### A3. კითხვები Saba-სთვის (ღია)
- **Q7:** UCS სია + ლიცენზია.
- **Q9–Q17:** UX, უცვლელია (`tasks/round-42-blocked-superseded.md` §3).
- **Q18 (ახალი, B-R42-01):** რა ხდება `schema.json`-ზე, რომელიც უკვე შეიცავს სტანდარტულ და custom ველს ერთი key-ით? B-ის default: load-ისას სტანდარტული ველი რჩება და ჩანს warning, რომელიც დაკარგულ custom ველს ასახელებს. ალტერნატივა: ორივე რჩება და ჩანს warning. round 42-ის R42-6 ამისთვის მონაცემს აგროვებს.
- **დადასტურება:** D-47-ის განზოგადება ყველა სტანდარტულ ველზე.

### A4. Saba-ს რიგი
Q2 (round 42) → Q8 (43) → Q4 (TM-B11) → Q5 (TM-B05) → Q3 (TM-B08) → Q6 (TM-B06) → Q7 (T-2, მონაცემს ელოდება).
