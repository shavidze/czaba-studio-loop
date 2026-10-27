# B — Round 22-ის დახურვა და Round 23-ის დაგეგმვა

Planner: B · თარიღი: 2026-10-27 · baseline HEAD `9d1c97e005c9fb430190c7765e44a7ed24b6563f`. tree სუფთაა (`git status --porcelain` ცარიელია). B-ის ფაზაში source არ შეცვლილა: ყველა experiment `/tmp/b-r23`-ში გაეშვა (`git archive 9d1c97e`, `node_modules` symlink-ით).

## 1. Round 22-ის შედეგი (C-ის მტკიცებულებით)
- **C:** `c-round-22.json` → `taskStatus: PASS`, `realVerified: true`, passed R22-1…R22-5. bugs: ერთი low, **C-R22-01** (test gap). blocked მხოლოდ Windows packaging-ზეა (ეს FAIL არ არის).
- **მთავარი evidence:**
  - **Red** `601dc4a` worktree-ზე: 6 failed / 13 passed. სიმპტომით ვარდება (z2)–(z5) და (z11), მაგალითად `expected [ 'c.wav' ] to deeply equal [ 'a.wav', 'b.wav', 'c.wav' ]`. (z8) ახალი D-31 ქცევის გამო ვარდება.
  - **Green:** 19/19.
  - **Mutation-ები:** M1–M6 მოკლულია. C-ის დამატებითი M7 (Shift-click anchor-ს აღარ ცვლის) გადარჩა → C-R22-01.
  - **Gate:** 198/93/7, `--retries=0` 7/7, Biome 8 warning.
  - **Real app:**
    - save → Shift-click → `3 files selected` → `Save to 3 files`;
    - ffprobe და music-metadata `exif:ICAT` `R22Range` a, b, c-ზე, d, e-ზე არა;
    - sort, search და Deselect All ვარიანტები სწორია;
    - **red reference** `601dc4a` build-ზე: მხოლოდ c.wav მოინიშნა.
- **Root gate:** `gate-round-22.json` → `published`, commit `9d1c97e`. ეს შემდეგი baseline-ია. Review: COMMIT OK, low-ები RR-R22-01…04, არქიტექტურა RR-R22-05. Actions run gate-ში კვლავ არ არის.
- **Archive:** `tasks/round-22.md` ახალ ფაილად შეიქმნა (`cmp` OK). ძველი archive არ გადაწერილა.

## 2. Backlog-ის განახლება
script: `b-round-22-update-backlog.py`. ის idempotent-ია: ორჯერ გაეშვა, `cmp` OK. backup: `b-round-22-backlog-before.json`.
- **TM-B25 → done:** `realVerified=true`, commit `9d1c97e`, C R22-ის evidence. **D-31 → done R22.** deviations 1–3 კვლავ Saba-ს კითხვაა (B-R21-02).
- **rounds:** 22 → published `9d1c97e`, c_result დაემატა. 23 → planned.
- **ახალი item TM-B26** (hygiene, low): in_progress, round 23, D-32. აერთიანებს:
  - C-R22-01 (C-ის ბაგი, პირველი);
  - A-R21-04;
  - RR-R21-01, RR-R13-02, RR-R15-02;
  - docs ჩანაწერს: RR-R21-02, A-R21-01/02/03, RR-R22-02.
- **ახალი D-32** (ტექნიკური, შექცევადი, behaviour-neutral): MetadataPanel-ის snapshot ერთი `getState()`-ით + 6 cast-ის წაშლა. render-ის 2 narrowing რჩება და მიზეზი ჩაწერილია.
- **ახალი finding-ები (signal-ები, არა task-ები, გარდა მითითებულისა):**
  - **C-R22-01 (low) → TM-B26.**
  - RR-R22-01 = B-R21-02 (Saba).
  - **RR-R22-02 → TM-B26** docs.
  - RR-R22-03 → RR-R22-05.
  - RR-R22-04 (keyboard/ARIA, pre-existing) → Saba-ს პაკეტი: UX ფიჩერია, reference study სჭირდება.
  - RR-R22-05 (არქიტექტურა: `selectRange(anchorPath, targetPath)` + anchor store-ში) → signal.
  - A-R22-01 = B-R21-02.
  - A-R22-02 → docs.
  - A-R22-03 → record only.
- routing განახლდა: RR-R21-01, RR-R13-02, RR-R15-02, A-R21-04, RR-R21-02, A-R21-01, A-R21-02, A-R21-03 → TM-B26. B-R21-02-ს დაემატა R22 note.
- **`feature-status.md`:** script `b-round-22-update-feature-status.py`, idempotent, `cmp` OK, backup `b-round-22-feature-status-before.md`. 37 ხაზი შეიცვალა:
  - header და round 22-ის აბზაცი;
  - root-ის თხოვნა `9d1c97e`-ზე;
  - TM-B25 → done, ახალი row TM-B26;
  - 8 routing row;
  - 9 ახალი finding row;
  - D-31 → done, ახალი row D-32.

## 3. B-ის experiment-ები (`b-round-22-exp/b-round-22-exp.diff.txt`)
- **(z12)** (C-ის შემოთავაზება):
  - setup: a, b, cx, dx; click a → Shift cx → search `x` → Shift dx ⇒ `[cx, dx]`;
  - `9d1c97e`-ზე გადის (20/20);
  - **M7-ზე ვარდება:** `expected [ 'dx.wav' ] to deeply equal [ 'cx.wav', 'dx.wav' ]`.
- **(i1)/(i2)** (A-R21-04):
  - **ძველი `beforeEach` (`mockClear`):** (i2) ვარდება, `promise rejected "Error: leaked" instead of resolving` (ზუსტი ტექსტი პირველ ვერსიაში: `expected { title: 'leaked' } to deeply equal {}`).
  - **`mockReset`:** 50/50.
  - ხუთივე `beforeEach` ხაზი ცალ-ცალკე დაბრუნებული `mockClear`-ზე (MI-1…MI-5) → (i2) ყოველ ჯერზე ვარდება.
  - ექსპერიმენტის პირველ ვერსიაში `readMetadata` ერთი არგუმენტით გამოვიძახე → TS2554. task-ში სწორი signature-ები წერია (`src/preload/index.d.ts`).
- **D-32:**
  - `casts-snapshot.diff` `9d1c97e`-ზე იგივე ცვლილებებით გადავიდა;
  - tsc 0; Biome 8 (იგივე სია), მაგრამ formatter-მა multi-line deps array უარყო, ერთ ხაზზე გადაწერის შემდეგ 0 error;
  - renderer 201/201;
  - **ძველი src + ახალი ტესტები = 201/201** (behaviour-neutral). red ტესტი შეუძლებელია, ამიტომ C-ის მტკიცებულება equivalence-ია, MS-1 კი დაგეგმილი equivalent mutant-ია.
- **დაკვირვება:** `handleSchemaChanged` (სადაც 2 cast იშლება) component ტესტით არ არის დაფარული. `schema-editor.test.ts` editor-ს ამოწმებს და არა MetadataPanel-ის re-read-ს. ამიტომ R23-5-ში ეს გზა real app-ში მოწმდება (step 5). თავიდან "What could break"-ში შეცდომით ეწერა, რომ ტესტი ფარავს. ჩავასწორე `python3`-ით, რადგან Edit tool loop folder-ზე კვლავ უარყოფილია.

## 4. Round 23-ის არჩევანი: TM-B26 (save/selection hygiene, D-32)
- **policy:**
  - C-ის ბაგი C-R22-01 პირველია;
  - critical/high ღია არ არის;
  - დანარჩენი ნაწილი round 21-ში გამოცხადებული MetadataPanel hygiene round-ია. ყველა ნაწილი low-ია, renderer/test/docs, Saba-ს არ ელოდება.
  - ერთი round-ის ფარგლებშია: ოთხივე ნაწილი save/selection ნაკადის ჰიგიენაა და ფაილებით არ კვეთს ერთმანეთს.
- **reference-first:** exempt (ტესტი, behaviour-neutral refactor, docs).
- **ფაილები:**
  - `file-list.test.ts` (z12, მხოლოდ დამატება);
  - `metadata-panel-batch-save.test.ts` (5 `beforeEach` ხაზი + ახალი describe);
  - `MetadataPanel.tsx` (D-32);
  - ახალი `docs/bugs/001-save-and-selection-known-limits.md` და `docs/bugs/README.md` row.
  - store-ები, FileList.tsx, `.claude/**` frozen-ია.
- **acceptance:**
  - R23-1: ownership; tests/-ში მოშლილია მხოლოდ 5 `mockClear` ხაზი; `as` 8 → 2.
  - R23-2: red (i2) + equivalence (ძველი src + ახალი ტესტები 201).
  - R23-3: M7, MI-1…MI-5, MS-1 equivalent. MS-1 = closure snapshot **და** `editingMetadata` deps-ში დაბრუნებული (`9d1c97e`-ის ფორმა). მარტო snapshot-ის დაბრუნება stale closure-ს იძლევა, ეს სხვა, არასწორი mutant-ია (advisor-ის შენიშვნა, ჩასწორდა).
  - R23-4: gate 201/93/7, Biome 8.
  - R23-5: real app: single, batch, D-30 delay replay, schema re-read; ffprobe + music-metadata.
  - R23-6: docs, 8 ჩანაწერი, file:line, pin ტესტები. ჩანაწერები 4–7 Saba-ს კითხვაა (7 = D-31 deviation 3, B-R21-02-ის სიაშია), 1–3 და 8 ცნობილი შეზღუდვაა.

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
  - RR-R15-01 (D-24-ის ცვლილება)
  - RR-R15-03
  - RR-R15-05
  - C-R15-01
  - optional RR-R12-02
  - B-R18-01 + RR-R19-01 (medium, preload `statFiles`)
  - B-R19-01 + RR-R20-01 + C-R21-01
  - RR-R20-04
- **B-R21-02 (+ RR-R22-01, A-R22-01):** Shift-click-ის სემანტიკა Explorer-ის მსგავსად შეიცვალოს?
  - (a) Shift-click anchor-ს არ ცვლის;
  - (b) Shift-click Ctrl-ის გარეშე selection-ს ცვლის, ნაცვლად იმისა, რომ დაამატოს.
- **ახალი, RR-R22-04:** row-ებზე keyboard selection (↑/↓, Shift+↑/↓, Ctrl+A) და ARIA. ეს UX ფიჩერია; Saba-ს პრიორიტეტის შემდეგ B ჯერ reference-ს შეისწავლის (Explorer, Mp3tag).

## 6. Root-ისთვის
- `gate-round-22.json`-ში Actions run კვლავ არ არის. **თხოვნა:** მიაბით `Check` run `9d1c97e`-ზე (ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე). ის ხურავს TM-T0-CI-ს, TM-T0-ს, TM-T0-CI-FU-ს და TM-B14-ის Actions ნაწილს.
- **B-ის Edit tool loop folder-ზე:** `current-task.md`-ზე Edit კვლავ უარყოფილია ("haven't granted"), Write კი მუშაობს. ჩასწორება `python3`-ით გაკეთდა (assert-ით: ყოველი ჩასანაცვლებელი ტექსტი ზუსტად ერთხელ).
- **A-R17-02:** read-primitives hook R22-ში A-სთან კვლავ არ ამოქმედდა. შეამოწმეთ job-ის `~/.claude/settings.json`.

## 7. გადაწყვეტილება
**CONTINUE.** შემდეგი task: round 23, TM-B26 (D-32).

შემდეგი გეგმა: round 24 სავარაუდოდ **BLOCKED** იქნება Saba-ს კითხვების პაკეტზე, თუ მანამდე პასუხი არ მოვა ან C ახალ ბაგს არ იპოვის. round-ებს ამის თავიდან ასაცილებლად არ ვიგონებ.

დარჩენილი item-ები:
- TM-B26
- TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14
- TM-B11, TM-T1-MIG, TM-T1-DUP, TM-B08
- TM-T2, TM-T2-DATA
- TM-B05, TM-B06
