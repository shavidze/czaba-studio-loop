# B — Round 17-ის დახურვა და Round 18-ის დაგეგმვა

Planner: B · თარიღი: 2026-10-27 · baseline HEAD `4f8a5780b338ecbdb10377e20764780cb267a4f3` (სუფთა tree; B-ის ფაზაში source არ შეცვლილა)

## 1. Round 17-ის შედეგი (C-ის მტკიცებულებით)
- **C:** `c-round-17.json` → `taskStatus: PASS`, `realVerified: true`, bugs `[]`, passed R17-1…R17-5. blocked მხოლოდ Windows packaging-სა და Actions run-ზეა (არა FAIL).
- **მთავარი evidence:**
  - Red `cb2d76b` worktree-ზე: 12 failed / 31 passed, შეცდომებით `reading 'trim'`, `item.trim is not a function` და typeof mismatch. Green: 43/43.
  - M1–M4 მოკლულია. M2 React-ის `Objects are not valid as a React child`-ით მოკვდა, M4 კი `[{},"A"]`-ით.
  - Gate: 135/93/7, `--retries=0` 7/7, Biome 9 warning (იგივე სია).
  - Real built app: Artists/Genres/Category UI-დან → `Tagged`, artist უჯრაში პირველი მნიშვნელობა ჩანს. ffprobe და music-metadata: `ICAT` `R17Cat`, genre `R17Genre`. Relaunch-ის შემდეგ იგივეა.
- **Root gate:** `gate-round-17.json` → `published`, commit `4f8a578`. Review COMMIT OK, critical/high/medium 0. ეს არის შემდეგი baseline.
- **Archive:** `tasks/round-17.md`. ეს `current-task.md`-ის ასლია, ახალ ფაილად შექმნილი, ძველი archive არ გადაწერილა (`cmp` OK).

## 2. Backlog-ის განახლება (`b-round-17-update-backlog.py`, idempotent, ორჯერ გაეშვა)
- **TM-B20 → done:** `realVerified=true`, commit `4f8a578`, C R17-ის evidence. D-26 → done R17. RR-R5-02 და B-R16-01 → closed.
- **ახალი signal-ები (არა task-ები):**
  - RR-R17-01: ორი `import type` ხაზი.
  - RR-R17-02: `parseUntypedMetadata` ორ ფაილშია.
  - RR-R17-03: `['', 'B']` → `Tagged`, მაგრამ artist უჯრა ცარიელია. D-26-ში ეს განზრახ არის; კითხვა Saba-სთვის.
  - RR-R17-04: არქიტექტურა. array-ის ფორმის ნორმალიზაცია ერთხელ უნდა მოხდეს, main/store-ის საზღვარზე.
  - A-R17-02 (პროცესი): A-ს სესიაში hook არ ამოქმედდა და src ფაილი heredoc-ით დაიწერა. გადაეცა root-ს, ხოლო R18 task-ში დაემატა წესი „მხოლოდ Edit/Write“.
  - backlog `rules`-ს დაემატა წესი `from_round 18`.
- **A-R17-01 → in_progress, ახალი item TM-B21 + D-27** (round 18).
- **C-R17-01 → ახალი item TM-B22 (todo).** Size სვეტი save-ის შემდეგ ძველი რჩება. ეს რეალურ app-ში მიიღწევა. B-ის probe: `WavFileEntry.size`-ს მხოლოდ scan აყენებს (`FolderBrowser.tsx`, `App.tsx` `setFiles`), save-ის path-ი არა. acceptance-ის დაწერამდე probe საჭიროა.
- **rounds:** 17 → published `4f8a578`, დაემატა 18 planned.
- **`feature-status.md`** (`b-round-17-update-feature-status.py`, idempotent; პირველმა ვერსიამ მეორე გაშვებაზე row-ები გააორმაგა, ამიტომ ფაილი `b-round-17-feature-status-before.md`-იდან აღვადგინე, script გავასწორე და ორჯერ გავუშვი; შედეგი: +12 ხაზი, თითო row):
  - header და round 17-ის აბზაცი;
  - root-ის თხოვნა, ახლა `4f8a578`-ზე;
  - TM-B20 done; ახალი row-ები TM-B21 და TM-B22;
  - finding-ები;
  - D-26 done; ახალი row D-27.

## 3. B-ის ექსპერიმენტები
- **E1** (`b-round-17-exp-sort.mts.txt` → `b-round-17-exp-sort-output.txt`): რეალური `4f8a578` `file-store.ts` გაეშვა tsx-ით repo-ს გარედან (`/tmp/b-r17`, tsconfig paths `~`), `selectRange(0,0)`-ით.
  - 2 ფაილზე `[5]`/`[{}]`/`[true]` ისვრის `aStr.localeCompare is not a function`-ს მხოლოდ მაშინ, როცა malformed row სიაში მეორეა (asc და desc). პირველ ადგილზე არ ისვრის.
  - `[null]` და არა-array `{}` არ ისვრის.
- **E2** (`b-round-17-exp-sort3.mts.txt` → `-output.txt`): 3 ფაილი, malformed შუაში.
  - `[5]`, `[{}]`, `[true]`, `[{},"Mid"]` და genres `[{}]` ოთხივე კომბინაციაში ისვრის (2 რიგი × asc/desc).
  - `[null]` და `[]` → asc `yzx`, desc `xzy`. `["Mid"]` → asc `zyx`.
  - ამიტომ task-ი fixture-ს ზუსტად ასე ითხოვს: malformed შუაში, 4 კომბინაცია. ეს red-ის ცალსახა ჩავარდნისთვისაა, რადგან 2 ფაილზე throw რიგზეა დამოკიდებული.
- **მიღწევადობა:** main ყველა ელემენტს string-ად აქცევს (`metadata.ts:44,56,136`), ამიტომ რეალური app-იდან ეს ვერ მოხდება. R18-5 მხოლოდ sort-ის regression-ია. Artist/Genre sort-ს დღეს არცერთი ტესტი არ ფარავს.
- Size სვეტის probe (TM-B22): `grep` → `size` მხოლოდ `file-system.ts:56` scan-იდან მოდის.
- repo-ში `git status --porcelain` ცარიელია.

## 4. Round 18-ის არჩევანი: TM-B21 (D-27)
- critical/high ღია არ არის. A-R17-01 crash-ია: FileList-ის render და `selectRange` ორივე ვარდება. ის TM-B20-ის კლასისაა და Saba-ზე არ არის დამოკიდებული. 3 ფაილს ეხება.
- MetadataPanel-ის cast-ების გასუფთავება refactor-ია და ნაკლები ღირებულება აქვს. ის შემდეგ round-ზე გადავიდა.
- TM-B22 რეალურად მიიღწევა, მაგრამ main/preload-ს შეიძლება შეეხოს, ამიტომ ჯერ probe ჭირდება.
- **D-27:** array-ის sort key = `value[0]`, თუ string-ია, სხვა შემთხვევაში `''`.
  - inline `typeof`, `file-row-display`-ის import-ის გარეშე.
  - არა-array path უცვლელია. თუ number-იც `''`-ად გადაიქცეოდა, number-ისა და გამოტოვებული მნიშვნელობის რიგი შეიცვლებოდა; ამას M3 მუტანტი ამოწმებს.
- **acceptance:**
  - R18-1: ownership და process (Bash write-ის გარეშე);
  - R18-2: red/green `4f8a578` worktree-ზე;
  - R18-3: M1–M5;
  - R18-4: gate, 135 + new / 93 / 7;
  - R18-5: real app. Artist/Genre header asc/desc, shift-click range sort-ის რიგით, დანარჩენი header-ები, ffprobe + music-metadata genre, relaunch.
- reference-first: pure fix, გამონაკლისია.

## 5. Saba-ს კითხვების პაკეტი (უცვლელი, + RR-R17-03)
- D-07 (TM-T1-MIG)
- D-10 + TM-B11
- D-12/TM-B08 + B-R6-01
- TM-T1-DUP (RR-R3-01, medium)
- D-15 + RR-R5-01 + **RR-R17-03** (D-26/D-27 ინფორმაციისთვის)
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

## 6. Root-ისთვის
- `gate-round-17.json`-ში Actions run კვლავ არ არის.
- თხოვნა: მიაბით `Check` run `4f8a578`-ზე (ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე). ის ხურავს TM-T0-CI-ს, TM-T0-ს, TM-T0-CI-FU-ს და TM-B14-ის Actions ნაწილს.
- **A-R17-02:** შეამოწმეთ, აყენებს თუ არა job-ის `~/.claude/settings.json` read-primitives PreToolUse hook-ს (`inject-primitives.mjs`). A-ს R17 სესიაში ის არ ამოქმედდა.

## 7. გადაწყვეტილება
**CONTINUE.** შემდეგი task-ი: round 18, TM-B21 (D-27).

დარჩენილი item-ები:
- TM-B21, TM-B22
- TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14
- TM-B11, TM-T1-MIG, TM-T1-DUP, TM-B08
- TM-T2, TM-T2-DATA
- TM-B05, TM-B06
