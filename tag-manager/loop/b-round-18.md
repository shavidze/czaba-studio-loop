# B — Round 18-ის დახურვა და Round 19-ის დაგეგმვა

Planner: B · თარიღი: 2026-10-27 · baseline HEAD `d015470cc28335494de993d951e4a8036869919c` (სუფთა tree, `git status --porcelain` ცარიელია; B-ის ფაზაში source არ შეცვლილა)

## 1. Round 18-ის შედეგი (C-ის მტკიცებულებით)
- **C:** `c-round-18.json` → `taskStatus: PASS`, `realVerified: true`, bugs `[]`, passed R18-1…R18-5. blocked მხოლოდ Windows packaging-ზეა (არა FAIL).
- **მთავარი evidence:**
  - Red `4f8a578` worktree-ზე: 6 failed / 30 passed, ყველა `aStr.localeCompare is not a function`-ით. (c)-ის 5 pin ძველ კოდზეც გადის. Green: 36/36.
  - M1–M5 მოკლულია. M5 (try/catch) order assertion-ით მოკვდა, არა throw-ით. M3 C-მ direct tie-ით განახორციელა (C-R18-01, იგივე observable ქცევა).
  - Gate: 146/93/7, `--retries=0` 7/7, Biome 9 warning (იგივე სია).
  - Real built app: Artist asc/desc, Genre asc, shift-click range sort-ის რიგით, დანარჩენი header-ები page error-ის გარეშე, relaunch იგივე. ffprobe + music-metadata genre (`IGNR`). artists მხოლოდ ჩაწერილია (TM-B08).
- **Root gate:** `gate-round-18.json` → `published`, commit `d015470`. Review COMMIT OK, critical/high/medium 0. ეს არის შემდეგი baseline.
- **Archive:** `tasks/round-18.md`. ეს `current-task.md`-ის ასლია, ახალ ფაილად შექმნილი, ძველი archive არ გადაწერილა (`cmp` OK).

## 2. Backlog-ის განახლება (`b-round-18-update-backlog.py`, idempotent, ორჯერ გაეშვა, `cmp` OK)
- **TM-B21 → done:** `realVerified=true`, commit `d015470`, C R18-ის evidence. D-27 → done R18. A-R17-01 → closed.
- **A-R17-02** ღია რჩება. A-ს თქმით hook R18-შიც არ ამოქმედდა, C ამას მხოლოდ ირიბად ადასტურებს. კვლავ root-ს გადაეცა.
- **ახალი signal-ები (არა task-ები):**
  - RR-R18-01: არა-array `{}` → `'[object Object]'`.
  - RR-R18-02: number vs გამოტოვებული ტექსტად შედარდება (pin-ით დაფიქსირებული).
  - RR-R18-03: store ტესტი რიგს `selectRange`-ით კითხულობს.
  - RR-R18-04: არქიტექტურა. metadata-ს normalise ერთხელ, IPC საზღვარზე; უერთდება RR-R17-04-ს, RR-R6-05-ს და RR-R5-06-ს.
  - A-R18-01: `toString`-ის გარეშე object `String()`-ზე ისვრის.
  - A-R18-02: M2-ის kill collation-ზეა დამოკიდებული.
  - C-R18-01: M3 direct tie-ით, record only.
  - B-R18-01: D-28-ის ფასი (ერთი recursive scan ყოველ save-ზე). გადაეცა Saba-ს.
- **TM-B22 → in_progress, round 19, D-28.** სათაური გაფართოვდა Date სვეტზე, რადგან `modifiedAt` იმავე მიზეზით ძველდება. ეს იგივე bug-ია, scope-ის შემცირება არ არის. acceptance ჩაიწერა. C-R17-01 → in_progress.
- **rounds:** 18 → published `d015470`, დაემატა 19 planned.
- **`feature-status.md`** (`b-round-18-update-feature-status.py`, idempotent, ორჯერ გაეშვა, `cmp` OK). backup: `b-round-18-feature-status-before.md`. diff: 8 ხაზი შეიცვალა, 11 დაემატა:
  - header და round 18-ის აბზაცი;
  - root-ის თხოვნა, ახლა `d015470`-ზე;
  - TM-B21 done, TM-B22 round 19;
  - A-R17-01 closed, A-R17-02 და C-R17-01 განახლდა;
  - 8 ახალი finding row;
  - D-27 done, ახალი row D-28.

## 3. B-ის probe (TM-B22, კოდის წაკითხვა `d015470`-ზე)
- `size`/`modifiedAt` მხოლოდ `fs:scan-folder`-იდან მოდის (`file-system.ts:56-57`), `setFiles`-ით: `App.tsx` `openFolder` და `FolderBrowser` open/rescan.
- `meta:write` აბრუნებს `void`-ს, `meta:write-batch` კი `{ succeeded, failed }`-ს.
- preload (`index.ts`, `index.d.ts`) დაცულია. ახალი channel-ი ან return ტიპის შეცვლა renderer-ში ტიპიზირებული ვერ იქნება, ამიტომ main-ის ცვლილება აზრს კარგავს.
- dropped ფაილები მშობელ საქაღალდეს ხსნიან (`App.tsx:124-130`), ანუ ყველა ფაილი `folderPath`-ის ქვეშაა. ამიტომ `scanFolder(folderPath)` ერთადერთი წყაროა.
- `useFilteredFiles` უკვე `metadata`-ზეა დამოკიდებული, ამიტომ `lastClickRef` დღესაც ყოველ save-ზე reset-დება. `files`-ის patch ახალ regression-ს არ შემოიტანს.
- `vitest.config.renderer.ts`-ში `mockReset` არ არის. ამიტომ task ნებას რთავს `beforeEach`-ში ერთი ხაზის დამატებას, `scanFolder` mock-ის გასასუფთავებლად.
- `STATE_MANAGEMENT.md` `### Save flow` save-ის ნაკადს აღწერს, ამიტომ ერთი ხაზი ემატება (path (b), Edit tool).

## 4. Round 19-ის არჩევანი: TM-B22 (D-28)
- critical/high ღია არ არის. TM-B22 რეალურ app-ში მიიღწევა (R17-5, R18-5) და Saba-ზე არ არის დამოკიდებული. დანარჩენი ღია item-ების უმეტესობა Saba-ს ან root-ს ელოდება.
- **D-28:**
  - write → `scanFolder(folderPath)` → `updateFileStats` (მხოლოდ ჩაწერილი path-ები, patch) → re-read. ამ რიგით D-24-ის path-იც ანახლებს.
  - batch-ზე მხოლოდ არა-failed path-ები ახლდება, `succeeded > 0`-ზე.
  - scan-ის reject ჩუმია.
- **acceptance:**
  - R19-1: ownership და process;
  - R19-2: red/green `d015470`-ზე; primary red = panel ტესტები, არა missing API;
  - R19-3: M1–M7;
  - R19-4: gate, 146 + new / 93 / 7;
  - R19-5: real app. 2020-ზე `touch`-ილი ასლები. single, batch და `chmod 444` partial save-ის შემდეგ Size/Date `fs.stat`-ს ემთხვევა. Size sort. ffprobe + music-metadata ICAT/IGNR. relaunch. 200 ფაილზე save-ის დრო მხოლოდ დაკვირვებაა.
- reference-first: pure fix, გამონაკლისია.

## 5. Saba-ს კითხვების პაკეტი (უცვლელი, + B-R18-01)
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
- **ახალი, B-R18-01:** შეიძლება თუ არა preload-ის შეცვლა ცალკე `fs:stat-files` channel-ისთვის? ის სრული scan-ის ნაცვლად მხოლოდ ჩაწერილ path-ებს გააკეთებდა stat-ს.

## 6. Root-ისთვის
- `gate-round-18.json`-ში Actions run კვლავ არ არის.
- თხოვნა: მიაბით `Check` run `d015470`-ზე (ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე). ის ხურავს TM-T0-CI-ს, TM-T0-ს, TM-T0-CI-FU-ს და TM-B14-ის Actions ნაწილს.
- **A-R17-02:** read-primitives hook R18-შიც არ ამოქმედდა. შეამოწმეთ, აყენებს თუ არა job-ის `~/.claude/settings.json` hook-ს `inject-primitives.mjs`.

## 7. გადაწყვეტილება
**CONTINUE.** შემდეგი task-ი: round 19, TM-B22 (D-28).

დარჩენილი item-ები:
- TM-B22
- TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14
- TM-B11, TM-T1-MIG, TM-T1-DUP, TM-B08
- TM-T2, TM-T2-DATA
- TM-B05, TM-B06
