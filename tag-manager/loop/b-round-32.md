# B — round 32-ის დახურვა და round 33-ის გეგმა

თარიღი: 2026-10-27 · Planner: B

## 1. round 32-ის შედეგი (C-ის მტკიცებულებით)
- **C: PASS**, R32-1…R32-6, `realVerified=true`, ახალი ბაგი 0 (`c-round-32.md`, `c-round-32.json`).
- **Root gate:** `gates/gate-round-32.json` → `published`, commit `ee15e6cfa72f50bb1caecb9075526101e3eb03ec` push-ილია. ეს არის round 33-ის baseline HEAD (repository-ში HEAD = `ee15e6c`, tree სუფთაა).
- **Review:** COMMIT OK (`gates/round-32/review.md`). critical/high/medium არ არის; 4 low და ერთი არქიტექტურის შენიშვნაა.
- **TM-B34 (D-39) → done** (`realVerified=true`, commit `ee15e6c`). evidence:
  - red 260/8 `7355d78`-ზე → green 268/268;
  - SM-1…SM-8 მოკლულია, SM-9 ეკვივალენტურია;
  - gate 268/93/7, `--retries=0` 7/7;
  - real app V/SC/SJ ორ build-ზე;
  - sha256 + ffprobe + music-metadata.
- დაიხურა: RR-R28-03, A-R19-02, RR-R30-01, A-R31-01, RR-R31-02, RR-R31-01, C-R31-01 (TM-B34) და B-R31-02 (C R32-3-მა SM-9-ის ეკვივალენტურობა დაადასტურა).
- D-39 → `verified (C R32 PASS), published ee15e6c`.
- task დაარქივდა: `tasks/round-32.md` (ახალი ფაილი, `current-task.md`-ის byte-identical ასლი, არაფერი გადაწერილა).
- backup: `b-round-32-backlog-before.json`, `b-round-32-feature-status-before.md`.
- update script-ები: `b-round-32-update-backlog.py` (part 1 = დახურვა, part 2 = round 33; თითო ერთხელ გაეშვა — ხელახლა არ გაუშვათ) და `b-round-32-update-feature-status.py`.

## 2. ახალი finding-ები (backlog-ში ჩაწერილი, signal ≠ task)
| ID | severity | რა | სად წავიდა |
|---|---|---|---|
| RR-R32-01 | low | batch filter-ში `isListedPath` O(files × paths) | signal (perf) |
| RR-R32-02 | low | stats refresh folder-ის შეცვლის შემდეგ ახალ folder-ს scan-ს უკეთებს (შედეგი იყრება) | signal (RR-R19-01 ოჯახი, Saba-ს კითხვა) |
| RR-R32-03 | info | `App.tsx:55` early return `finally`-ს სწორად ტოვებს | record |
| RR-R32-04 | low | ძველი schema-თი დაწყებული Rescan read schema re-read-ის შემდეგ სრულდება | **TM-B35** (w3) |
| RR-R32-05 | info | არქიტექტურა: `applyLateRead` store action | signal |
| A-R32-01 | low (A: medium) | Done Open Folder B-ის scan-ის დროს: A-ს schema re-read B-ის `metadata`-ს ცვლის | **TM-B35** (w1)(w2) |
| A-R32-02 | info | `skipSyncRef` დგება, როცა `isListedPath` false-ია | record: შიდა მდგომარეობა გამეორდა, ხილული ეფექტი არ არის |
| C-R32-01 | info | (s1)/(v9) timing load-ის ქვეშ | record |
| B-R32-01 | info | D-40-ით Done load-ის დროს editor-ს ღიად ტოვებს | record; C ზომავს |
| B-R32-02 | info | DM-3 ეკვივალენტური mutant-ია | record |

C-ის დაკვირვება „Unsaved changes were discarded“ Open Folder-ზე save-ის დროს უკვე C-R28-01 / B-R19-01-ია (დუბლიკატი არ ჩამიწერია).

## 3. round 33: TM-B35 (D-40, low)
**რატომ ეს:** critical/high ბაგი ღია არ არის. ორი ახალი finding ერთი ოჯახისაა: schema re-read უკვე მიმდინარე folder load-თან ეჯიბრება. ორივე `MetadataPanel.tsx`-ის `handleSchemaChanged`-შია.

**B-ის reproduction** (`b-round-32-exp/`, throwaway copy `/tmp/b-r33`, repository არ შეცვლილა):
- `ee15e6c` src + 7 ახალი ტესტი: **272 passed / 3 failed of 275**.
  - (w1) red: A-ს map B-ის სიის ქვეშ;
  - (w2) red: stale `Failed to read 2 files`;
  - (w3) red: `r33note` ქრება ძველ-schema-ს Rescan read-ის შემდეგ;
  - (w4)–(w7) green pin-ებია.
- A-R32-02-ისთვის explore ტესტი დავწერე. შიდა მდგომარეობა გამეორდა: `editingMetadata`-ში a-ს re-read-ია, თუმცა a სიაში არ არის. ხილული ეფექტი კი არ არის: panel „Select a file“-ს აჩვენებს, b-ზე click → B-ის ფორმა. ამიტომ ტესტი საბოლოო set-ში არ შევიდა, finding კი info-დ ჩაიწერა.
- prototype (`prototype.diff.txt`): 275/275 16 ფაილში, Biome 0 error / 8 warning (იგივე სია), `tsc` web + test სუფთა.
- mutants (`mutants.log`, 117 ტესტი შვიდ ფაილში):
  - DM-1 (ლოდინის გარეშე) → (w1)(w2)(w3);
  - DM-2 (closure `allFiles`) → (w1)(w2)(w4)(w5);
  - DM-4 (`isScanning` → return, A-ს შემოთავაზება) → (w3);
  - DM-5 (`files` identity, A-ს შემოთავაზება) → (w1)(w3)(w7);
  - DM-6 (ლოდინი store-ის ნებისმიერ ცვლილებაზე) → (w5);
  - DM-7 (D-39(b) guard-ის გარეშე) → (v6)(v7)(v8);
  - DM-3 (`folderLoadId` ლოდინამდე) ეკვივალენტურია.

**გადაწყვეტილება D-40:** `handleSchemaChanged` ჯერ `await waitForFolderLoadIdle()`-ს იძახებს. ის მაშინვე სრულდება, თუ `isScanning` false-ია; სხვა შემთხვევაში subscribe-ით ელოდება, სანამ `isScanning` false გახდება. ამის შემდეგ ფუნქცია `files`-ს და `folderLoadId`-ს `getState()`-დან იღებს და მიმდინარე schema-თი კითხულობს. `allFiles` selector იშლება. D-39(b) guard, D-33, D-34 და toast-ები უცვლელია. ცვლილება მხოლოდ `MetadataPanel.tsx`-შია; App, store-ები, FolderBrowser და SchemaEditor frozen რჩება.
- **რატომ არა გამოტოვება `isScanning`-ზე:** ძველი schema-თი დაწყებული load ბოლოს სრულდება და ახალი ველი იკარგება (DM-4).
- **რატომ არა `files`-ის identity:** save-ის stats refresh `files`-ს ცვლის და სწორ re-read-ს დააგდებდა (DM-5, (w7)).
- **ეფექტი (B-R32-01):** Done მიმდინარე load-ის დროს editor-ს load-ის დასრულებამდე ღიად ტოვებს. Done ახლაც ელოდება re-read-ს (C-R27-01). ახალი ტექსტი ან ელემენტი არ ემატება.

**severity:** low. მხოლოდ ჩვენებას ეხება: დისკზე არაფერი იწერება.

**Reference-first:** exempt, რადგან ეს სუფთა ordering fix-ია.

**C-ის real-app სცენარები:**
- **W/WJ:** Done `fast`-ის scan-ის დროს; `slow`-ის batch read-ი დაყოვნებულია ან reject-დება.
- **R:** Rescan-ის ძველ-schema-ს read დაყოვნებულია. ველი `R33note`/`R33N`, მნიშვნელობით `R33Val`, setup-ში ჩაიწერა.
- **N:** load-ის გარეშე Done მაშინვე იხურება.
- harness-ს ემატება scan delay `fast/`-ზე და old-schema delay marker.

## 4. რა რჩება (scope არ შემცირებულა)
- TM-B35 (round 33).
- TM-T0 / TM-T0-CI / TM-T0-CI-FU / TM-B14: ელოდება root-ის Actions link-ს და CI follow-up-ს.
- TM-T1-MIG, TM-T1-DUP, TM-B08, TM-B05, TM-B06, TM-B11: Saba-ს გადაწყვეტილებები (D-07/D-10/D-12, TM-B06 scope) ან დაბალი პრიორიტეტის todo. TM-B11 და TM-B05-ის decision prep შემდეგი კანდიდატებია.
- TM-T2 / TM-T2-DATA: blocked (UCS სია + ლიცენზია Saba-სგან).
- Saba-ს კითხვების ჯგუფი უცვლელია და ზემოთ ჩამოთვლილს ემატება: `b-round-23.md` §5, B-R23-03, C-R27-01 / B-R32-01 (Done-ის ლოდინი), B-R27-02, RR-R19-01 / B-R18-01 / RR-R32-02 (stats scan-ის performance).
- არქიტექტურის signal-ები (RR-R32-05, RR-R31-04 და სხვ.) task-ად არ გადაქცეულა.

## 5. გადაწყვეტილება
**CONTINUE.** round 33 = TM-B35. COMPLETE არ არის: TM-B35-ს, TM-T0-ს და TM-T0-CI-ს რეალური მტკიცებულება ჯერ არ აქვთ, და Saba-ს item-ები ღიაა. BLOCKED არ არის: TM-B35 მომხმარებლის გარეშე კეთდება.
