# B — Round 36 დახურვა და round 37-ის გეგმა

თარიღი: 2026-10-28 · Planner: B

## 1. Round 36 შედეგი
- **C: PASS**, R36-1…R36-6, realVerified=**true** (`c-round-36.md`/`.json`). real-app მტკიცებულება: gate-ის E2E რეალურ Electron-ში xvfb-ში, 7/7 და `--retries=0` 7/7. `src/` byte-identical-ია `46bd74b`-თან.
- **Root gate:** published `51969a270d9642b8d2e9ae4fb9ab309b43fbcece` (`gates/gate-round-36.json`). Review **COMMIT OK** (`gates/round-36/review.md`): 0 critical/high/medium, 4 low, 1 არქიტექტურის შენიშვნა. ეს არის round 37-ის baseline.
- **TM-B38 → done** (commit `51969a2`).
- **დახურული finding-ები:** C-R34-02, B-R34-02, C-R34-03, C-R35-02, C-R35-03.
- Archive: `tasks/round-36.md` (ახალი ასლი; `cmp`-ით შემოწმდა, რომ round 36-ის task-ის იდენტურია; ძველი archive არ გადაწერილა).
- **C-ის გაზომვა:** ოთხი ნელი ფაილი 7.5–14.2×-ით სწრაფია, ყველაზე ნელი ტესტი 402 ms. C-ის runner-ზე "before" 15.6 s იყო, B-ის 23 s-ის ნაცვლად; შეფარდება მაინც დადასტურდა.

## 2. ახალი finding-ები და მათი მიმართულება
| ID | severity | სად მიდის |
|---|---|---|
| C-R36-01 | low | TM-B41 (`dom-queries` unit ტესტი, HM-1…HM-3) |
| RR-R36-01 | low | TM-B40: ის round-ი `schema-editor-done-busy.test.ts`-ს მაინც ცვლის |
| RR-R36-02 | low | TM-B41 (TESTING.md §6: a11y სახელი ისევ `getByRole`-ით) |
| RR-R36-03 | low | TM-B41 (RegExp `g`/`y` `lastIndex`; = R36-A-02) |
| RR-R36-04 | low | TM-B41 (აგენტის სახელი TESTING.md-ში) |
| RR-R36-05 | info | signal: Biome `tests/` = TM-B06 (note დაემატა); `clickButton` helper — task არ არის |
| R36-A-01 | low (latent) | record: შიდა whitespace; დღეს მიუღწეველია (C probe) |
| R36-A-03 | info | დახურულია: (b7)/(b8) mutant-ის pin-ებია, არა ცნობილი შეზღუდვა, ამიტომ entry 18-ში არ შედის |
| B-R36-01 | info | signal / Saba-ს კითხვა: pending scan-ის დროს ძველი სია clickable რჩება (round 37 Deviation 2) |

**ახალი item TM-B41** (todo, low, test-only, TM-B40-ის შემდეგ). TM-B39-თან არ ერთიანდება: policy-ით ერთ round-ში მხოლოდ მჭიდროდ დაკავშირებული bug-ები შედის.

## 3. Round 37 = TM-B39 (C-R34-01, D-44)
**Root cause** (`51969a2`):
- Open Folder, Rescan და drop load-ის დასაწყისში `clearSelection()`-ს იძახებენ (`FolderBrowser.tsx:103`, `:161`, `App.tsx:48`).
- scan-ის ლოდინისას ძველი სია clickable-ია (`FileList.tsx:68`).
- `setFiles` (`file-store.ts:55`) `selectedPaths`-ს არ ეხება.
- `grep -rn "setState(" src/renderer/src` ცარიელია. ჩაგდებული WAV-ებიც `openFolder(parentDir)`-ით მიდის. ამიტომ ერთი store ცვლილება ყველა გზას ფარავს.

**Red reproduction** (`b-round-36-exp/selection-after-folder-switch.test.ts.txt`, (x1)–(x7)):
- `51969a2`-ის src-ზე **7/7 red** სიმპტომზე (`red-run.log`).
- `red-run.log` შემოკლებულია: მასში მხოლოდ ×/✓ ხაზები და AssertionError-ებია, სრული output არ ინახება.

**Prototype** (`prototype.diff.txt`, `file-store.proto.ts.txt`): ხაზი 55 + ფაილის ბოლოს დამატებული private `withListedSelection`.
- **296/296** 19 ფაილში (`green-run.log`; ეს ფაილის ბოლოში helper-იანი მეორე prototype-ია, (x7)-ით).
- `tsc` web + test სუფთაა; Biome 0/8.
- helper ფაილის ბოლოშია. ამიტომ 1–240 ხაზები ხაზ 55-ის გარდა უცვლელია და docs/bugs/001-ის ყველა `file-store.ts:N` ref ვალიდური რჩება.

**Mutants** (`mutants.log`, (x7)-ის დამატებამდე გაშვებული):
- PM-1 კლავს (x1)–(x6);
- PM-2 (clear) კლავს (x2)(x6);
- PM-3 კლავს (x6).

**D-44:** prune და არა clear. clear-ი Rescan-ის დროს შენარჩუნებულ row-ზე განზრახ click-ს დაკარგავდა. სხვა folder-ზე prune და clear ერთსა და იმავეს იძლევა.

**Reference** (task-ში URL-ებით):
- **დადასტურებული (docs):**
  - R1 Qt `QItemSelectionModel`: `reset()` selection-ს წმენდს;
  - R2 Kid3 handbook;
  - R3 Mp3tag: opt-in "Select files automatically".
- **anecdotal:** R4 Explorer, ოფიციალური წყარო ვერ მოიძებნა.
- **inference:** ახალი folder selection-ის გარეშე იწყება. სიიდან ამოღებულ, მაგრამ მონიშნულ ფაილს არცერთი reference არ ინახავს.
- refresh-ზე გადარჩენილი row-ის ქცევაზე წყარო ვერ ვიპოვე; B ამას reference-ად არ ასახელებს.
- **Deviations:** 1–4.

**C-სთვის real app (R37-4)**, ძველი `51969a2` vs ახალი, scan delay-ით (`c-round-33/harness.cjs`):
- S1: სხვა folder;
- S2: Rescan, row გადარჩა;
- S3: dirty;
- S2-save: ffprobe + music-metadata.

## 4. დარჩენილი
- **B დაგეგმავს:** TM-B39 (round 37) → TM-B40 → TM-B41. შემდეგ TM-B11 ან TM-B05-ის მომზადება, TM-T1-MIG, TM-T1-DUP, TM-B08.
- **Saba-ს სჭირდება:**
  - კითხვების batch (`b-round-23.md` §5 + B-R36-01);
  - TM-T2 / TM-T2-DATA (UCS სია და ლიცენზია);
  - TM-B06-ის scope.
- **root-ს სჭირდება:** Actions-ის ბმული TM-T0-CI / TM-T0-CI-FU / TM-B14-ისთვის. TM-T0 ღიაა მათთან ერთად.

## 5. Checkpoint
- [x] round 36-ის ფაილები წაკითხულია;
- [x] archive;
- [x] red/green ექსპერიმენტი;
- [x] reference;
- [x] `current-task.md`;
- [x] backlog (`b-round-36-update-backlog.py`);
- [x] feature-status (`b-round-36-update-feature-status.py`; before-ასლები `b-round-36-exp/`-ში);
- [x] `b-next.json`.
