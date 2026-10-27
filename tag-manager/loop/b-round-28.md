# B — round 28-ის დახურვა და round 29-ის გეგმა

## 1. Round 28-ის შედეგი
- **C: PASS** (R28-1…R28-6, `c-round-28.json` realVerified=true, bugs `[]`). blocked: მხოლოდ Windows packaging (cloud-ში მიუწვდომელია, round-ის ნაწილი არ იყო).
- **root gate:** `published`, commit `b182557baf43c21d10844e15027f9df5e0be9347` (rounds 26–28, base `6c956b4`). review: `COMMIT: OK`, medium არ არის. ეს commit არის **round 29-ის baseline** (HEAD = `b182557`, tree სუფთაა, B-მ შეამოწმა).
- **TM-B30 (D-35) → done**, realVerified=true. C-ის მტკიცებულება:
  - red → green: 219/7 → 226/226;
  - MR-1…MR-10 ყველა მოკლულია;
  - gate: 226/93/7, `--retries=0` 7/7, Biome 0/8, იგივე სია;
  - real app ორ build-ზე: ახალი build ინახავს `ICAT=R28Cat`-ს (ffprobe + music-metadata), `6c956b4` კი დისკზე `ICAT=''`-ს აბრუნებს, ანუ data loss reproduce-და.
- დახურულია: **B-R25-01**. D-35-ის სტატუსია verified/published.
- `tasks/round-28.md` = round 28-ის `current-task.md`-ის ასლი. ახალი ფაილია, არაფერი გადაწერილა.

## 2. ახალი finding-ები (backlog-ში)
- **A-R28-01 (info) / RR-R28-02 (info):** single-chunk read write-მდე + save-ის re-read reject → superseded path save-მდელ entry-ს ინარჩუნებს. დოკუმენტირებული არ არის → TM-B31 docs.
- **A-R28-02 (low):** entry 11-ში (r8) არ არის დასახელებული → TM-B31 docs.
- **RR-R28-01 (low):** superseded path entry-ის გარეშე absent რჩება, შეტყობინება არ არის → TM-B31: entry 11-ში ცნობილ შეზღუდვად იწერება. შეტყობინება ან დათვლა signal-ად რჩება.
- **RR-R28-03 (low):** folder-ის შეცვლის შემდეგ ძველი folder-ის entry ახალ `metadata`-ში ხვდება → signal (A-R19-02 / B-R27-02 კლასი; scan token).
- **RR-R28-04 (info):** (g2)-ში bare key-ებია → record.
- **RR-R28-05 (info):** არქიტექტურის signal, ერთი stale-read guard D-34-ისთვის და D-35-ისთვის. task-ად არ იქცა.
- **C-R28-01 (info):** `Unsaved changes were discarded` Rescan-ზე save-ის დროს = B-R19-01 (Saba).
- **B-R26-01:** ღია რჩება root-ისთვის. `publications.jsonl`-ში round 28 ახლა წერია როგორც `26-28`, base `6c956b4`, მაგრამ `6c956b4`-ს თავისი publication ხაზი ჯერ კიდევ არ აქვს.
- **TM-T0-CI / TM-T0 / TM-T0-CI-FU / TM-B14:** უცვლელია. `gate-round-28.json`-ში Actions run-ის ბმული არ არის.

## 3. Round 29 = TM-B31 (D-36, low)
- **რატომ ეს:** critical ან high ბაგი ღია არ არის, C-ს ბაგი არ უპოვია, ხოლო round 28-ის "Next"-მა სწორედ B-R27-01 დაასახელა. ეს dependency რიგის შემდეგი ერთეულია, რომელიც Saba-ზე არ არის დამოკიდებული.
- **red reproduction:** B-მა `b182557`-ზე, `/tmp` copy-ში გაუშვა (`b-round-28-exp/b-r29-rescan-reject.test.ts`, `red-run.log`). Rescan, რომლის ერთადერთი chunk reject-დება, იძლევა `metadata` keys `[]`, files 2, `toastMessage null`.
- **reachability:** main-ის `meta:read-batch` per-file შეცდომას `emptyMetadata`-ით ცვლის (`metadata.ts:233-247`), ამიტომ chunk reject-დება მხოლოდ IPC დონეზე. შედეგი მხოლოდ ჩვენებაზე აისახება: single save მხოლოდ განსაზღვრულ ველებს აგზავნის (`metadata.ts:170-171`), ამიტომ დისკზე არაფერი იშლება. severity low რჩება.
- **D-36 (B-ს ტექნიკური გადაწყვეტილება):** D-33-ის წესი folder read-ზეც ვრცელდება:
  - `readMetadataChunked` აბრუნებს `failedPaths`-ს;
  - `applyMetadataRead(read, readGenerations, keptPaths)`-ს მესამე პარამეტრი სავალდებულოა. kept path-ს store-ის მიმდინარე entry რჩება, ხოლო თუ entry არ არსებობს, path absent რჩება;
  - სამი caller `failures > 0`-ზე აჩვენებს არსებულ toast-ს `Failed to read N files`.
  - UX ელემენტი ახალი არ არის (toast-ის ტექსტი D-33-დან მოდის), ამიტომ reference-first-ისგან გათავისუფლებულია, როგორც სუფთა bug fix.
- **trade-off, რომელიც task-ში ღიად წერია:** სავალდებულო `keptPaths` `tsconfig.test.json`-ის typecheck-ს არღვევს არსებულ (g2)-ში. ამიტომ ნებადართულია ზუსტად ერთი ხაზის ცვლილება: (g2)-ის call-ს ემატება `[]`. ეს უფრო მეტს ღირს, ვიდრე optional პარამეტრი, რომლის დავიწყებაც caller-ს შეეძლება (D-35-ის `getWriteGeneration` იგივე პრინციპით არის სავალდებულო).
- **ერთად შესრულდება:** entry 11-ის docs-ის შევსება (A-R28-01, A-R28-02, RR-R28-01) და ახალი entry 12. ფაილი და flow იგივეა.
- **ტესტები:**
  - (k1)–(k7), (g3), (u2): 8 red, 1 green pin; renderer 226 → 235, 13 ფაილი;
  - mutant-ები MK-1…MK-9;
  - real app old vs new, harness reject-ით, sha256-ით და ორი reader-ით.
- **round-ის გარეთ:** C-R25-01 (სხვა ფაილი, სხვა კლასი), RR-R28-03, RR-R28-05, RR-R13-01 (protected preload) და B-R27-02 (Saba).

## 4. Saba-სთვის (უცვლელი პაკეტი)
- ღიაა: `b-round-23.md` §5, B-R23-03, C-R27-01, B-R27-02, D-07/D-10/D-12, TM-B06 scope, RR-R19-01/B-R18-01 (preload).
- ეს round არცერთ მათგანზე არ არის დამოკიდებული.

## 5. Decision
CONTINUE. ყველა scoped ერთეული ჯერ არ არის realVerified: TM-T0-CI და TM-B14 root-ის Actions ბმულს ელოდება, დანარჩენი Saba-ს გადაწყვეტილებებს. მომხმარებლის ინფორმაციის გარეშე შესრულებადი სამუშაო ჯერ კიდევ არის: TM-B31 და შემდეგ C-R25-01.
