# B — round 29-ის დახურვა და round 30-ის გეგმა

## 1. Round 29-ის შედეგი
- **C: PASS** (R29-1…R29-6, `c-round-29.json` realVerified=true). acceptance-ის FAIL არ არის. C-მ ორი low finding დაადასტურა: C-R29-01 და C-R29-02. ორივე A-მ უკვე აღნიშნა (A-R29-01, A-R29-02). blocked: მხოლოდ Windows packaging (cloud-ში მიუწვდომელია, round-ის ნაწილი არ იყო).
- **root gate:** `published`, commit `20967a001e3b8adc59f99344bc802483e4f8dcce` (round 29, base `b182557`). review: `COMMIT: OK`, მხოლოდ low შენიშვნები. ეს commit **round 30-ის baseline-ია**: B-მ შეამოწმა, რომ HEAD = `20967a0` და tree სუფთაა.
- **TM-B31 (D-36) → done**, realVerified=true. C-ის მტკიცებულება:
  - red → green: 227/8 → 235/235;
  - MK-1…MK-9c ყველა მოკლულია;
  - gate: 235/93/7, `--retries=0` 7/7, Biome 0/8, იგივე სია;
  - real app ორ build-ზე: ახალი build Rescan-ზე და იგივე folder-ის Open Folder-ზე ინარჩუნებს `Tagged`-ს და `R29Cat`-ს და აჩვენებს toast-ს; `b182557` row-ებს ცლის toast-ის გარეშე. დისკი უცვლელია: sha256 იგივეა, ffprobe-იც და music-metadata-ც `ICAT=R29Cat`-ს კითხულობს.
- დახურულია: **B-R27-01**, **A-R28-01**, **A-R28-02**, **RR-R28-01** (docs ნაწილი), **RR-R28-02**. D-36-ის სტატუსია verified/published.
- `tasks/round-29.md` round 29-ის `current-task.md`-ის ასლია. ახალი ფაილია, არაფერი გადაწერილა.

## 2. ახალი finding-ები (backlog-ში)
- **C-R29-01 / A-R29-01 (low):** ორი reject-ილი chunk-ის შემთხვევას ტესტი არ ამოწმებს. ამიტომ EX-1 mutant (`splice`, ინახავს მხოლოდ ბოლო chunk-ს) გადარჩება → **TM-B32** (u3).
- **C-R29-02 / A-R29-02 (low):** D-35-ის ტექსტი ამბობს „error და ცარიელი folder → `setMetadata({})`“. კოდში ცარიელ folder-ს მხოლოდ Rescan წმენდს, Rescan-ის error კი მხოლოდ toast-ია → **TM-B32** (D-37), იხ. §3.
- **RR-R29-01 (low):** `Failed to read 1 files` → record RR-R15-04-თან ერთად. თუ ოდესმე შეიცვლება, ოთხივე ადგილი და (k4) ერთად უნდა შეიცვალოს.
- **RR-R29-02 (info):** reviewer-ის არქიტექტურის შენიშვნა (`loadFolderMetadata` helper). ჩაიწერა signal-ად, task არ არის. TM-B33-ის guard-ისთვის ბუნებრივი ადგილი იქნებოდა.
- **RR-R29-03 (low):** ორი გადაფარული folder read-ისას ბოლოს დასრულებული იმარჯვებს → **TM-B33** (todo). ჯერ B-მ red-ად უნდა reproduce გააკეთოს. ამ round-ში არ შედის: reproduce ჯერ არ არის, ხოლო fix-ს D-35-ის generation-ებთან შეთანხმებული დიზაინი სჭირდება.
- **C-R25-01:** round 28-ის "Next"-ში ეწერა. B-ის გადაწყვეტილება: **სუფთა signal**. defaults-only ტესტი რიგზე იქნებოდა დამოკიდებული (RR-R23-01), ამიტომ task არ იქნება. `remaining`-დან ამოღებულია, ეს scope-ის შემცირება არ არის: ეს hygiene finding-ია და არა მომხმარებლის მოთხოვნა.
- **B-R26-01:** ღია რჩება root-ისთვის. `publications.jsonl` ახლა შეიცავს ჩანაწერებს `b182557` (26–28) და `20967a0` (29–29). `6c956b4`-ს საკუთარი ხაზი კვლავ არ აქვს.
- **TM-T0-CI / TM-T0 / TM-T0-CI-FU / TM-B14:** უცვლელია. `gate-round-29.json`-ში Actions run-ის ბმული არ არის.

## 3. Round 30 = TM-B32 (D-37, low)
- **რატომ ეს:** critical ან high ბაგი ღია არ არის. ბაგებიდან რიგით პირველია C-ის ორი low finding. ორივე D-35/D-36 folder-read flow-ს ეხება და იმავე ფაილებშია.
- **red reproduction** (`20967a0`, `/tmp` ასლი; `b-round-29-exp/b-r30-empty-folder.test.ts`, `red-run.log`):
  - (x1) Open Folder ცარიელ folder-ზე → `metadata`-ში ისევ `/music/a.wav`, `/music/b.wav`-ა;
  - (x2) App-ზე ცარიელი folder-ის drop → იგივე;
  - (x3) ცარიელი folder, შემდეგ Open Folder `/music`, რომლის read reject-დება → ძველი entry-ები მიმდინარედ ჩანს. არაცარიელი სხვა folder-ის შემდეგ კი `{}` + toast ჩანს (D-36 (k5));
  - (x4) Rescan ცარიელ folder-ზე → `{}` (green).
- **prototype:** ორი `else { setMetadata({}); }` (`prototype.diff.txt`) → renderer 239/239 (`green-run.log`). repository არ შეხებია: `git status` ცარიელია.
- **რატომ კოდი და არა მხოლოდ docs:**
  - სამი ტექსტი (docs, STATE_MANAGEMENT, round 29-ის task) უკვე ამ წესს აღწერს;
  - Close Folder და არაცარიელი folder-ის Open Folder ძველ entry-ებს უკვე აგდებს;
  - `6ecfb40`-მა `else` მხოლოდ Rescan-ს დაუმატა, და არცერთ D-ID-ს სხვაგვარი ქცევა არ აურჩევია.
  - severity low-ა: ცვლილება მხოლოდ ჩვენებას ეხება, დისკზე არაფერი იწერება.
- **trade-off, რომელიც task-ში ღიად წერია:** R30-5-ის E სცენარში ძველი build შემთხვევით სწორ მნიშვნელობას აჩვენებს, რადგან დისკი არ შეცვლილა. ახალი build ცარიელ ფორმას და toast-ს აჩვენებს, ზუსტად ისე, როგორც არაცარიელი სხვა folder-ის შემდეგ. სხვა folder-ზე გადასვლის შემდეგ ძველი entry „მიმდინარე“ აღარ არის: ის შეიძლება stale იყოს გარე ცვლილების შემდეგ, და D-36 kept-entry-ის წესი მიმდინარე ხედისთვის არის. შემდეგი წარმატებული Rescan მნიშვნელობას აბრუნებს (R30-5 R).
- **ტესტები:**
  - (e1)–(e4) და (u3): 3 red, 2 green; renderer 235 → 240, 13 ფაილი;
  - mutant-ები EX-1, EX-2, ME-1…ME-5;
  - real app old vs new (empty → armed Open Folder m, control `o`, Rescan), sha256-ით და ორი reader-ით.
- **docs:** entry 13; entry 12-ში (u3); D-35-ის error/empty-folder წინადადება ზუსტად; D-37 bullet; README 13/5/5; STATE_MANAGEMENT-ის D-35 clause.
- **reference-first:** გათავისუფლებულია, რადგან ეს სუფთა bug fix-ია და ახალი UX ელემენტი არ ემატება.
- **round-ის გარეთ:** TM-B33 (RR-R29-03), RR-R29-02, RR-R15-04/RR-R29-01, RR-R28-03/A-R19-02 (save-ის re-read folder-ის შეცვლის შემდეგ), RR-R13-01 (protected preload), B-R27-02 (Saba).

## 4. Saba-სთვის (უცვლელი პაკეტი)
- ღიაა: `b-round-23.md` §5, B-R23-03, C-R27-01, B-R27-02, D-07/D-10/D-12, TM-B06 scope, RR-R19-01/B-R18-01 (preload).
- ეს round არცერთ მათგანზე არ არის დამოკიდებული.

## 5. Decision
**CONTINUE.** ყველა scoped ერთეულს ჯერ არ აქვს რეალური მტკიცებულება:
- TM-T0-CI და TM-B14 root-ის Actions ბმულს ელოდება;
- TM-T1-DUP, TM-T1-MIG და TM-T2 Saba-ს გადაწყვეტილებებს ელოდება.

მომხმარებლის ინფორმაციის გარეშე შესრულებადი სამუშაო კიდევ არის: TM-B32, შემდეგ TM-B33.
