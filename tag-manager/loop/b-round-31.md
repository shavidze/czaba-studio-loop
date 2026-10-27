# B — round 31-ის დახურვა და round 32-ის გეგმა

თარიღი: 2026-10-27 · Planner: B

## 1. round 31-ის შედეგი (C-ის მტკიცებულებით)
- **C: PASS**, R31-1…R31-6, `realVerified=true`, ახალი ბაგი 0 (`c-round-31.md`, `c-round-31.json`).
- **Root gate:** `gates/gate-round-31.json` → `published`, commit `7355d78cecfd24bc895c29b3cc84b8e905283d58` push-ილია. ეს არის round 32-ის baseline HEAD.
- **Review:** COMMIT OK (`gates/round-31/review.md`). critical/high/medium არ არის; 3 low და ერთი არქიტექტურის შენიშვნაა.
- **TM-B33 (D-38) → done** (`realVerified=true`, commit `7355d78`). evidence:
  - red 241/16 `bf83c7d`-ზე → green 257/257;
  - GM-1…GM-19 (+GM-7b) მოკლულია;
  - gate 257/93/7, `--retries=0` 7/7;
  - real app L/J/S/C სცენარები ორ build-ზე;
  - sha256 + ffprobe + music-metadata უცვლელია.
- დაიხურა: **RR-R29-03** (TM-B33) და **A-R30-01** (entry 12 ასახელებს (k7)-ს, C R31-6).
- D-38 → `verified (C R31 PASS), published 7355d78`.
- task დაარქივდა: `tasks/round-31.md` (ახალი ფაილი, არაფერი გადაწერილა).
- backup: `b-round-31-backlog-before.json`, `b-round-31-feature-status-before.md`. update script-ები: `b-round-31-update-backlog.py`, `b-round-31-update-feature-status.py`.

## 2. ახალი finding-ები (backlog-ში ჩაწერილი, signal ≠ task)
| ID | severity | რა | სად წავიდა |
|---|---|---|---|
| RR-R31-01 | low | `file-store.test.ts:2-3`: ორი import ერთი module-დან | TM-B34 rider |
| RR-R31-02 | low | App-ის schema-wait loop load id-ს არ ამოწმებს: superseded drop მაინც აკეთებს `scanFolder`-ს | TM-B34 (D-39c) |
| RR-R31-03 | info | `beginFolderLoad`-ის გამარტივება | signal |
| RR-R31-04 | info | არქიტექტურა: ერთი `loadFolder(path, { onError })` helper + schema-ready promise | signal (RR-R29-02 / RR-R30-03 ოჯახი) |
| A-R31-01 | low | `handleSchemaChanged` folder switch-ის შემდეგ მთელ `metadata`-ს ძველი folder-ით ცვლის | TM-B34 (D-39b); B-მ red-ით დაადასტურა |
| C-R31-01 | low | test gap: Close pending scan-ის / drop-ის დროს (CR-6) | TM-B34 pin-ები (o17)(o18) |
| A-R31-02 | info | `waitMs(100)` App ტესტებში | record |
| B-R31-01 | info | ფაქტი: save `folderLoadId`-ით D-35-ს ამტვრევს (SM-3) | record (D-39-ის საფუძველი) |
| B-R31-02 | info | SM-9 ეკვივალენტური mutant-ია | record |

RR-R28-03, A-R19-02 და RR-R30-01 → `in_progress`, მიბმულია TM-B34-ზე.

## 3. round 32: TM-B34 (D-39, low)
**რატომ ეს:** critical/high ბაგი ღია არ არის. round 31-ის „Next“ save-ის re-read-ს ასახელებდა. ამავე ოჯახშია A-R31-01 და RR-R31-02: ძველი folder-ის async შედეგი folder-ის შეცვლის შემდეგ ბრუნდება. ეს სამი მჭიდროდ დაკავშირებული ბაგია, policy-ის მაქსიმუმი, და ყველა `MetadataPanel.tsx` / `App.tsx`-შია.

**B-ის reproduction** (`b-round-31-exp/`, throwaway copy `/tmp/b-r32`, repository არ შეცვლილა):
- `7355d78` src + ახალი ტესტები: **260 passed / 8 failed of 268**. (v1)–(v4) და (v6)–(v9) red-ია symptom-ზე: stray `/fa/a.wav` key, A-ს map B-ს list-ის ქვეშ, stale `Failed to read 2 files`, `/fa` scan. (v5), (o17) და (o18) green pin-ებია.
- პირველი ცდისას (v4)-ში setup ჩავარდა: save-ის stats refresh-მა `scanFolder`-ის once-მნიშვნელობა მოიხმარა. per-path mock-ით გასწორდა.
- (o18)-ის პირველი ვერსია TitleBar-ის X-ს აწვებოდა, ამიტომ locator folder row-ზე (`getByTitle("/fa")`) შეიცვალა.
- prototype (`prototype.diff.txt`): 268/268 15 ფაილში, Biome 0 error / 8 warning (იგივე სია), `tsc` web + test სუფთა.
- mutants (`mutants.log`): SM-1…SM-8 მოკლულია; SM-9 ეკვივალენტურია (guard loop-ის შემდეგ: scan მაინც არ ხდება).

**გადაწყვეტილება D-39:**
- **(a) save:** re-read store-ში იწერება მხოლოდ იმ path-ისთვის, რომელიც ჯერ კიდევ `files`-შია (`isListedPath`).
  - **`folderLoadId` არა.** round 30-ის hint-ი არასწორი აღმოჩნდა: SM-3 D-35-ის (r1)(r2)(r3)(r6)(r7)(k6)-ს ამტვრევს, რადგან Rescan-იც იღებს load id-ს.
  - **`folderPath` არა.** SM-4 (v5)-ს ამტვრევს: parent folder, რომელიც ფაილს ისევ აჩვენებს.
- **(b) schema re-read:** load-id guard. ის მთელ map-ს ცვლის, ხოლო ყოველი შემდეგი load უკვე ახალი schema-თი კითხულობს.
- **(c) App:** guard schema-wait loop-ში.
- `file-store.ts` და `FolderBrowser.tsx` frozen რჩება.
- toast-ის ტექსტები არ იცვლება.

**severity:** low. მხოლოდ ჩვენებას ეხება: დისკზე არაფერი იწერება, ცარიელი ფორმა მხოლოდ აკრეფილ ველებს წერს (`writeTagsToFile` `undefined`-ს ტოვებს). QA-მ A-R31-01 medium-ად შეაფასა, B-მ reproduction-ის მიხედვით low მიანიჭა.

**Reference-first:** exempt. ეს სუფთა ordering fix-ია: UX ელემენტი და ტექსტი არ იცვლება.

**C-ის real-app სცენარები:**
- **V** (save re-read → reopen + reject): ძველი build stale `Tagged R32Slow2`-ს აჩვენებს.
- **SC/SJ** (schema Done → Open Folder fast): ძველი build-ში `f.wav` `Tagged`-ს კარგავს და/ან stale toast ჩნდება.
- harness-ს ემატება `meta:read`-ის read-one delay marker.

## 4. რა რჩება (scope არ შემცირებულა)
- TM-B34 (round 32).
- TM-T0 / TM-T0-CI / TM-T0-CI-FU / TM-B14: ელოდება root-ის Actions link-ს და CI follow-up-ს.
- TM-T1-MIG, TM-T1-DUP, TM-B08, TM-B05, TM-B06, TM-B11: Saba-ს გადაწყვეტილებები (D-07/D-10/D-12, TM-B06 scope) ან დაბალი პრიორიტეტის todo.
- TM-T2 / TM-T2-DATA: blocked (UCS სია + ლიცენზია Saba-სგან).
- არქიტექტურის signal-ები (RR-R31-04 და სხვ.) task-ად არ გადაქცეულა.

## 5. გადაწყვეტილება
**CONTINUE.** round 32 = TM-B34. COMPLETE არ არის, რადგან scoped item-ებს რეალური მტკიცებულება ჯერ არ აქვთ. BLOCKED არ არის, რადგან TM-B34 მომხმარებლის გარეშე კეთდება.
