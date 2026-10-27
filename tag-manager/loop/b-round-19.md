# B — Round 19-ის დახურვა და Round 20-ის დაგეგმვა

Planner: B · თარიღი: 2026-10-27 · baseline HEAD `3006615b365edf3847542c06e119a020b426b093` (სუფთა tree, `git status --porcelain` ცარიელია; B-ის ფაზაში source არ შეცვლილა)

## 1. Round 19-ის შედეგი (C-ის მტკიცებულებით)
- **C:** `c-round-19.json` → `taskStatus: PASS`, `realVerified: true`, bugs `[]`, passed R19-1…R19-5. blocked მხოლოდ Windows packaging-ზეა (არა FAIL).
- **მთავარი evidence:**
  - Red `d015470` worktree-ზე: 11 failed / 46 passed. (n),(o),(p),(s),(t) ვარდება `expected "vi.fn()" to be called 1 times, but got 0 times`-ით, (s1)–(s6) missing API-თი. pin-ები ძველზეც გადის. Green: 57/57.
  - M1–M8 და M3b მოკლულია, survivor არ არის.
  - Gate: 162/93/7, `--retries=0` 7/7, Biome 9 warning (იგივე სია).
  - Real built app:
    - single: 86.2 KB → 88.3 KB, Date 2020 → 2026, ორივე `fs.stat`-ს უდრის;
    - batch b+c და `chmod 444` partial save-ის შემდეგაც cell-ები `fs.stat`-ს ემთხვევა, c უცვლელია;
    - Size sort სწორია, relaunch-ის შემდეგ იგივე ჩანს;
    - ffprobe + music-metadata `ICAT`/`IGNR`;
    - `Unsaved changes` toast არ გამოჩენილა;
    - 200 ფაილზე save 169 ms (დაკვირვება).
  - A-ს transcript ხელმისაწვდომი იყო: repo-ში ყველა write Edit-ით გაკეთდა.
- **Root gate:** `gate-round-19.json` → `published`, commit `3006615`. Review COMMIT OK, critical/high 0, medium 1 (RR-R19-01). ეს არის შემდეგი baseline.
- **Archive:** `tasks/round-19.md`. ეს `current-task.md`-ის ასლია, ახალ ფაილად შექმნილი (`cmp` OK, ძველი archive არ გადაწერილა).

## 2. Backlog-ის განახლება (`b-round-19-update-backlog.py`, idempotent, ორჯერ გაეშვა, `cmp` OK)
- **TM-B22 → done:** `realVerified=true`, commit `3006615`, C R19-ის evidence. D-28 → done R19. C-R17-01 → closed.
- **B-R18-01:** დაემატა C-ის timing (169 ms) და root-ის შეფასება (medium). კვლავ Saba-ს კითხვაა.
- **A-R17-02:** ღია რჩება. A-ს თქმით hook R19-შიც არ ამოქმედდა. კვლავ root-ს გადაეცა.
- **ახალი item-ები:**
  - **TM-B23 (high, in_progress, round 20, D-29):** selection-ის შეცვლა მიმდინარე save-ის დროს. წყარო: qa-engineer P1 `a-round-19.md`-ში. C-მ გადმოგვცა, მაგრამ არ გაიმეორა. B-მ კოდის წაკითხვით დაადასტურა (სექცია 3).
  - **TM-B24 (medium, todo):** იგივე selection-ზე save-ის დროს აკრეფილი ტექსტი re-read-ის მნიშვნელობით იცვლება (qa-engineer P3). fix განსხვავებულია, ამიტომ TM-B23-ის შემდეგ.
- **ახალი signal-ები (არა task-ები):**
  - RR-R19-01 (medium): ყოველი save ელოდება სრულ recursive scan-ს. → Saba-ს კითხვა B-R18-01 (preload).
  - RR-R19-02: `lastClickRef` reset ყოველი save-ის შემდეგ.
  - RR-R19-03: `folderPath` write-ის შემდეგ იკითხება (record only).
  - RR-R19-04: არქიტექტურა. `statFiles` IPC, ან stat-ები write-ის შედეგში.
  - A-R19-01: batch-ზე scan-reject ტესტი არ არის.
  - A-R19-02: folder-ის შეცვლა save-ის დროს → stray metadata key (qa-engineer P2).
  - C-R19-01: batch-ის შემდეგ Genres placeholder. D-21-ით მოსალოდნელია.
  - B-R19-01: save-ის დროს selection-ის შეცვლა აჩვენებს `Unsaved changes were discarded`-ს. → Saba.
- **D-29** დაემატა (decisions). rounds: 19 → published `3006615`, დაემატა 20 planned. `current_task` განახლდა.
- **`feature-status.md`** (`b-round-19-update-feature-status.py`, idempotent, ორჯერ გაეშვა, `cmp` OK). backup: `b-round-19-feature-status-before.md`. diff 25 ხაზია:
  - header და round 19-ის აბზაცი;
  - root-ის თხოვნა `3006615`-ზე;
  - TM-B22 done, ახალი row-ები TM-B23 და TM-B24;
  - C-R17-01 closed, B-R18-01 განახლდა, 8 ახალი finding row;
  - D-28 done, ახალი row D-29.

## 3. B-ის probe (TM-B23, კოდის წაკითხვა `3006615`-ზე)
- `handleSave` (`MetadataPanel.tsx:89-159`) `selectedFiles`-სა და `editingMetadata`-ს closure-ში იჭერს. ამიტომ write სწორ ფაილში (A) მიდის.
- `await`-ების შემდეგ კოდი selection-ს არ ამოწმებს:
  - single (`:105-107`) უპირობოდ აკეთებს `skipSyncRef = true; updateFileMetadata(A); setEditingMetadata({...A})`;
  - batch (`:133-143`) უპირობოდ აკეთებს `skipSyncRef`-ს და `setEditingMetadata({})`-ს.
- sync effect (`:54-87`) selection-ის შეცვლაზე B-ს ტვირთავს და `Unsaved changes were discarded`-ს აჩვენებს. ამის შემდეგ save-ის ბოლო ფორმას A-ს მნიშვნელობებით გადაწერს, `skipSyncRef` კი resync-ს ბლოკავს.
- შედეგი: B არჩეულია, ფორმაში A-ს მნიშვნელობებია, `isDirty` false. შემდეგი edit + Save → `writeMetadata(B, A-ს სრული ველები)`. **ეს ჩუმი data corruption-ია, ამიტომ high.**
- ფაილების სია save-ის დროს არ იკეტება: მხოლოდ Save ღილაკია disabled (`:284`). D-28-მა ფანჯარა გაზარდა (write + scan + read).
- **Harness experiment-ები** (ფაილები loop folder-ში):
  - Electron 35.7.5-ზე `-r` module, რომელიც `ipcMain.handle`-ს ახვევს, `meta:write`-ს source-ის შეცვლის გარეშე აყოვნებს: 1500-ზე 1502 ms (`b-round-19-exp-delay-write.cjs.txt`, `b-round-19-exp-delay-app.cjs.txt`). ეს D-06/D-20-ის `-r` პრეცედენტს მიჰყვება.
  - 518 MB WAV-ის write პირველად 765 ms-ს გრძელდება, შემდეგ 10 ms-ს, ამიტომ არასანდოა (`b-round-19-exp-bigwav-write.cjs.txt`).
  - C R20-5-ში delay module-ს იყენებს და red reference-ს `3006615`-ის build-ზე ამოწმებს.

## 4. Round 20-ის არჩევანი: TM-B23 (D-29)
- policy: critical/security/data-loss პირველია. TM-B23 data corruption-ია, ამიტომ ყველა სხვა ღია item-ის წინ დგას.
- **D-29:**
  - save-ის დასაწყისში იკითხება `selectedPaths`. `await`-ების შემდეგ ის მიმდინარე selection-ს set-ის სახით ედარება.
  - იგივე set → დღევანდელი ქცევა.
  - სხვა set → store-ის განახლებები (`updateFileStats`, `updateFileMetadata`) და toast-ები რჩება, მაგრამ `skipSyncRef` და `setEditingMetadata` აღარ ხდება.
  - list არ იკეტება. ეს ახალი UX იქნებოდა, reference-first და Saba-ს გადაწყვეტილება სჭირდება.
- **ფაილები:**
  - `MetadataPanel.tsx`;
  - `metadata-panel-batch-save.test.ts` (additions only);
  - ერთი ხაზი `STATE_MANAGEMENT.md`-ში.
  - store-ები frozen-ია.
- **acceptance:**
  - R20-1: ownership და process;
  - R20-2: red/green `3006615`-ზე. primary red = (x1)–(x6) სიმპტომით, (x2) = B-ში A-ს მნიშვნელობების ჩაწერის მტკიცება; pin-ები (x7)–(x10);
  - R20-3: M1–M8;
  - R20-4: gate, 162 + new / 93 / 7;
  - R20-5: real app delay harness-ით, ffprobe + music-metadata `b.wav`-ზე და red reference ძველ build-ზე.
- reference-first: pure fix, გამონაკლისია.

## 5. Saba-ს კითხვების პაკეტი (უცვლელი + ახალი)
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
  - RR-R15-03
  - RR-R15-05
  - C-R15-01
  - optional RR-R12-02
- **B-R18-01 + RR-R19-01 (medium):** შეიძლება თუ არა preload-ის შეცვლა `statFiles(paths)` channel-ისთვის, ან write IPC-ებისთვის, რომლებიც stat-ებს დააბრუნებენ? ალტერნატივა preload-ის გარეშე: refresh toast-ის შემდეგ, await-ის გარეშე. ეს D-28-ის რიგს ცვლის.
- **ახალი, B-R19-01:** save-ის დროს selection-ის შეცვლისას `Unsaved changes were discarded` ჩანს, თუმცა edits იწერება. რომელი გზა ავირჩიოთ: ტექსტი შეიცვალოს, თუ list save-ის დროს ჩაიკეტოს? მეორეს reference-first კვლევა სჭირდება (Mp3tag, Kid3).

## 6. Root-ისთვის
- `gate-round-19.json`-ში Actions run კვლავ არ არის. თხოვნა: მიაბით `Check` run `3006615`-ზე (ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე). ის ხურავს TM-T0-CI-ს, TM-T0-ს, TM-T0-CI-FU-ს და TM-B14-ის Actions ნაწილს.
- **A-R17-02:** read-primitives hook R19-შიც არ ამოქმედდა. შეამოწმეთ, აყენებს თუ არა job-ის `~/.claude/settings.json` hook-ს `inject-primitives.mjs`.
- B-ის Edit tool loop folder-ზე უარყოფილია, Write კი მუშაობს. ამიტომ `feature-status.md` წინა round-ების მსგავსად script-ით განახლდა.

## 7. გადაწყვეტილება
**CONTINUE.** შემდეგი task-ი: round 20, TM-B23 (D-29).

დარჩენილი item-ები:
- TM-B23, TM-B24
- TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14
- TM-B11, TM-T1-MIG, TM-T1-DUP, TM-B08
- TM-T2, TM-T2-DATA
- TM-B05, TM-B06

## 8. დამატება (advisor-ის შემოწმების შემდეგ)
- R20-3-ის M4 (ordered `join` შედარება) **equivalent mutant-ად** მოინიშნა. sync effect selection-ს უკვე `join('\0')`-ით ადარებს, ამიტომ reorder save-ის დასრულებამდე ფორმას `{}`-ზე წმენდს, და (x9) ორივე შედარებით ერთნაირად სრულდება. C ამას ჩაწერს. M4-ის გადარჩენა FAIL არ არის. (x9) pin-ად რჩება.
- შეცვლა `b-round-19-patch-task.py`-ით გაკეთდა (`current-task.md` + TM-B23-ის acceptance `backlog.json`-ში). script idempotent-ია, ორჯერ გაეშვა, `cmp` OK. მთავარი update script-იც კვლავ idempotent-ია.
