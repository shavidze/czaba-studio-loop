# B — round 30-ის დახურვა და round 31-ის გეგმა

## 1. Round 30-ის შედეგი
- **C: PASS** (R30-1…R30-6, `c-round-30.json` realVerified=true, bugs `[]`). blocked მხოლოდ Windows packaging-ია (cloud-ში მიუწვდომელია, round-ის ნაწილი არ იყო).
- **root gate:** `published`, commit `bf83c7dc5e2462304159acc3df56ededbcd9d517` (round 30). review: `COMMIT: OK`, critical/high/medium არ არის. ეს commit **round 31-ის baseline-ია**. B-მ შეამოწმა: HEAD = `bf83c7d`, tree სუფთაა, და B-ის ფაზის ბოლოსაც სუფთაა (`git status --porcelain --untracked-files=all` ცარიელი).
- **TM-B32 (D-37) → done**, realVerified=true. C-ის მტკიცებულება:
  - red → green: 237/3 → 240/240 (13 ფაილი);
  - EX-1, EX-2, ME-1…ME-5 ყველა მოკლულია;
  - gate: 240/93/7, `--retries=0` 7/7, Biome 0/8, იგივე სია;
  - real app ორ build-ზე: ახალ build-ზე E == O, ძველზე stale `R30Cat` ჩანს; sha256 უცვლელია; ffprobe და music-metadata ორივე `ICAT=R30Cat`-ს კითხულობს.
- დახურულია: **C-R29-01, A-R29-01, C-R29-02, A-R29-02**. D-37: verified / published `bf83c7d`.
- `tasks/round-30.md` round 30-ის `current-task.md`-ის ასლია. ახალი ფაილია, არაფერი გადაწერილა.

## 2. ახალი finding-ები (backlog-ში, task-ად არა)
- **C-R30-01 (info):** ME-5-ს მხოლოდ (k2) კლავს → signal.
- **RR-R30-01 (low):** save-ის re-read old-folder ფაილზე სხვა folder-ის გახსნის შემდეგ entry-ს ამატებს. იგივე კლასია, რაც RR-R28-03 / A-R19-02. TM-B33-ის შემდეგ პირველი კანდიდატია: `folderLoadId`-ის ჩაწერა save-ის დასაწყისში.
- **RR-R30-02 (info):** line ref-ები სწრაფად ძველდება → signal. ამ round-ში `file:line` კონვენცია რჩება და ref-ები ხელახლა მიეთითება.
- **RR-R30-03 (info):** არქიტექტურის signal, `loadFolderContents` helper (RR-R29-02 ოჯახი).
- **A-R30-01 (info):** entry 12-ის სიაში (k7) არ არის → round 31-ის docs-ში ემატება.
- **B-R30-01 (info):** superseded `readMetadataChunked` ყველა chunk-ს ბოლომდე კითხულობს (მხოლოდ IPC-ის ხარჯი) → signal; `utils.ts` frozen-ია.

## 3. Round 31 = TM-B33 (D-38, low)
- **რატომ ეს:** critical/high ბაგი ღია არ არის, C-ს ახალი ბაგი არ აქვს. dependency-ის რიგით შემდეგი ბაგი TM-B33-ია (RR-R29-03), რომელსაც round 30-ის "Next" ასახელებდა.
- **red reproduction** (`bf83c7d`, `/tmp` ასლი; `b-round-30-exp/b-r31-overlap.test.ts`, `red-run.log`): 16 ტესტიდან **15 red**, (x8) pin green. სულ 241 passed / 15 failed, 256-დან. ყველა red ტესტი symptom-ზე ვარდება:
  - გვიანი read ცვლის `metadata`-ს;
  - გვიანი scan ცვლის `files`-ს;
  - `isScanning` ადრე ქრება;
  - stale toast ჩანს;
  - Close-ის შემდეგ metadata ბრუნდება;
  - (x16)-ში export აკლია.
- **reachability:** Rescan `disabled={isScanning}`-ია, Open Folder და drop კი არა. Rescan→Rescan UI-დან მიუღწეველია.
- **prototype** (`prototype.diff.txt`): store-ში `folderLoadId` / `beginFolderLoad` / `isFolderLoadCurrent`, plus ოთხი guard სამივე caller-ში და Close.
  - renderer 256/256; Biome 0/8 იგივე სია; `tsc` web და test სუფთაა.
  - repository არ შეხებია.
- **mutants** (`mutants.log`, 4 ტესტ-ფაილი):
  - GM-1…GM-19-დან 18 მოკლულია.
  - GM-7 (Rescan-ი ახალი id-ის ნაცვლად მიმდინარეს იყენებს) პირველ run-ში გადარჩა. ეს UI-დან equivalent-ია: Rescan scanning-ის დროს disabled-ია, ამიტომ მის id-ს ძველი pending load ვერ გაიზიარებს.
  - ამიტომ დაემატა პირდაპირი ტესტი (x16). ხელახალ run-ში GM-7 მოკლულია: `1 failed | 15 passed (16)`, killer (x16).
- **დიზაინის გადაწყვეტილებები (D-38), რომლებიც task-ში ცხადად წერია:**
  - `folderLoadId` არასდროს reset-დება. `reset-stores.ts` frozen რჩება: monotonic id ძველ pending promise-ს ვერ დაემთხვევა.
  - `handleOpenFolder` id-ს dialog-ის **შემდეგ** იღებს, რომ cancel-მა მიმდინარე load არ გააუქმოს. ამას (o8) pin-ავს.
  - Close Folder ახალ id-ს იღებს და `setIsScanning(false)`-ს იძახებს. ხილული შედეგი: spinner Close-ზე ჩერდება. ეს D-38-ის ნაწილია და real app-ში C სცენარით მოწმდება.
- **reference-first:** გათავისუფლებულია. ეს სუფთა ordering fix-ია, ახალი UX ელემენტი და ტექსტი არ ემატება.
- **ტესტები:**
  - (o1)–(o16) ახალ ფაილში და (f1) file-store-ში: სულ 17;
  - baseline-ზე 16 red / 1 green; ახალზე 257, 14 ფაილში.
- **real app:** ოთხი სცენარი ორ build-ზე (L/J/S/C), harness-ით, რომელიც `slow/`-ზე read-ს და scan-ს აყოვნებს. sha256 და ორი reader.
- **round-ის გარეთ:**
  - RR-R28-03/A-R19-02/RR-R30-01 (`MetadataPanel` frozen; შემდეგი კანდიდატი);
  - B-R30-01;
  - RR-R29-02/RR-R30-03;
  - RR-R15-04/RR-R29-01;
  - RR-R13-01 (protected preload);
  - B-R27-02 (Saba).

## 4. Saba-სთვის (უცვლელი პაკეტი)
- ღიაა: `b-round-23.md` §5, B-R23-03, C-R27-01, B-R27-02, D-07/D-10/D-12, TM-B06 scope, RR-R19-01/B-R18-01 (preload).
- round 31 არცერთ მათგანზე არ არის დამოკიდებული.
- **B-R26-01** ღია რჩება root-ისთვის.
- TM-T0-CI / TM-T0 / TM-T0-CI-FU / TM-B14 უცვლელია: `gate-round-30.json`-ში Actions run-ის ბმული არ არის.

## 5. Decision
**CONTINUE.** ყველა scoped ერთეულს რეალური მტკიცებულება ჯერ არ აქვს:
- TM-B33 დაგეგმილია;
- TM-T0-CI და TM-B14 root-ის Actions ბმულს ელოდება;
- TM-T1-DUP, TM-T1-MIG და TM-T2 Saba-ს ელოდება.

მომხმარებლის ინფორმაციის გარეშე შესრულებადი სამუშაო კიდევ არის: TM-B33, შემდეგ RR-R28-03 კლასი.
