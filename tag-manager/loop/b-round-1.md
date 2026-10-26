# B — Round 1 დახურვა და Round 2-ის გეგმა, 2026-10-26

## Round 1-ის შედეგი
- **C: PASS**, realVerified=false. მიზეზი: GitHub Actions run-ის შედეგი არ ჩანს. Root review: COMMIT OK, critical/high finding არ არის. Gate: **published**, commit `c34ee5ad834eef4561c50f03e87934623705cb53`. ეს არის Round 2-ის baseline HEAD, tree სუფთაა.
- Archive: `tasks/round-1.md` უკვე არსებობდა და `current-task.md`-ის იდენტურია (`diff -q`). ფაილს არ შევხებივარ.
- backlog-ის ცვლილებები, მხოლოდ C-ის ევიდენციით:
  - **done:** TM-B01 (R1-2, R1-4 red, R1-9), TM-B02 (R1-5 red რეალურ app-ში, R1-2), TM-B03 (R1-1, R1-3 red/green, R1-6), TM-T0-DOC (R1-10).
  - **in_progress:** TM-T0-CI, realVerified=false. C R1-7-მა YAML და ლოკალური step-ები შეამოწმა, Actions run კი არ ჩანს. B-მ სცადა `gh run list -R TCzaba/czaba-tag-manager` → HTTP 404. ტოკენს run-ების ნახვა არ შეუძლია. **Root-მა უნდა მიაბას მწვანე run `c34ee5a`-ზე.** ამის გამო არ ვბლოკავ: ეს root-ის საქმეა.
  - **in_progress:** TM-T0. მისი ერთ-ერთი acceptance (`npm ci` + postinstall Actions-ში) TM-T0-CI-ზეა დამოკიდებული.
  - B-R0-02 დაიხურა: C-მ დაადასტურა, რომ runner-ზე `--no-sandbox` სავალდებულოა.

## C-ის finding-ები და review-ის შენიშვნები
- **C-R1-01 (low):** ცარიელი Keywords-ის შემთხვევაში იწერება `IKEY=""`. ეს კონტრაქტის საკითხია K-4-ისთვის, ამიტომ ახლა `src`-ს არ ვასწორებ. გავხსენი **D-10** (ღია, Saba) და TM-T1-ს დავუმატე acceptance **T1-10**.
- **C-R1-02 (low):** `check.yml`-ის `playwright-report/` არ იქმნება. ჩავწერე **TM-B07** და Round 2-ში შევიტანე: ესეც gate-ის მთლიანობის bug-ია, TM-B04-თან ახლოს.
- **C-R1-03 (low):** `TESTING.md:129` მოძველებულია, მაგრამ `.claude/**` გაყინულია. ჩავწერე finding-ად.
- Root review RR-R1-01…07 ჩავწერე finding-ებად (`source: root-review`). task-ად არცერთი არ გადავაქციე. `tests/fixtures/wav.ts` TM-T1-ის hint-ია. `needs: check` `release.yml`-ში Saba-ს სჭირდება.

## Round 2 = TM-B04 (+ TM-B07)
- **რატომ ახლა:** TM-B04 high severity-ისაა. სანამ ის არ გასწორდება, ყოველი მწვანე `check` type safety-ის მტკიცებულება არ არის. T-1 მასზეა დამოკიდებული.
- **Saba-ს დასტური საჭირო არ არის.** ეს ჩემი round-0-ის სიფრთხილის გადახედვაა. `requirements.md:65` `package.json`-ში მხოლოდ `version`-ს და `build`-ს ყინავს, `src/preload/*`-ს კი ყინავს მხოლოდ „თუ რაუნდი სხვას არ ამბობს“. Round 2 ფლობს მხოლოდ `scripts.check`-ს და ახალ `scripts.typecheck`-ს. preload ფაილი byte-identical რჩება, tsconfig-ის include მას მხოლოდ მიმართავს. გადაწყვეტილება ჩავწერე **D-11**-ად. Saba-ს წინააღმდეგობის შესაძლებლობა რჩება (Q1).
- **B-ის ექსპერიმენტი** (`/tmp/bexp2`, source-ს არ შევხებივარ): საწყისი შეცდომები იყო node 10, web 32, test 31. `target ES2022` + `lib` + `skipLibCheck` + preload `.d.ts` include-ის შემდეგ რჩება 21 კოდის შეცდომა 6 ფაილში:
  - `metadata.ts`: `file.tag.tags`;
  - `FileList.tsx`: `FieldValue[0]`;
  - `utils.ts:63`: `type: string`;
  - ორივე E2E spec: Page ცვლადს `window` ჰქვია;
  - `tests/renderer/setup.ts`: cast.
  ზუსტი ownership ამ სიიდან გამოვიყვანე. თუ A სხვა შეცდომას იპოვის, ჩერდება და მოახსენებს.
- **აღმოჩენა:** `tests/main/metadata.test.ts`-ში InfoTag path-ზე (keywords → `IKEY`) ტესტი არ არსებობს. `metadata.ts` შეიცვლება, ამიტომ A ჯერ წერს pin ტესტს, რომელიც ცვლილებამდეც და შემდეგაც მწვანეა. C ამოწმებს, რომ ეს ტესტი `/tmp`-ის ასლში ვარდება (R2-5).
- **Red proof** სრულდება `/tmp` ასლში. აქ type error-ის შეყვანისას ახალი `check` წითელია, ძველი კი მწვანე (R2-3). C working tree-ს არ ეხება.
- `target ES2022`-ის რისკი: `src`-ში `class` არ არის (grep), ამიტომ `useDefineForClassFields`-ის default-ის ცვლილება build-ზე არ მოქმედებს.

## ღია კითხვები Saba-სთვის
1. **(D-11, TM-B04)** ვთვლი, რომ `scripts.check`/`scripts.typecheck` და preload `.d.ts`-ის include დაშვებულია `requirements.md:65`-ის მიხედვით. თუ ეს ასე არ არის, მითხარი. Round 2 ამ დაშვებით გაგრძელდება.
2. **(D-10, ახალი)** ცარიელი ველი, მაგალითად `IKEY=""`: არ ჩაიწეროს, თუ ჩაიწეროს და დოკუმენტირდეს? B-ის default: არ ჩაიწეროს.
3. **(D-01)** `ICAT` საბოლოოა? (`IGNR` / iXML `USER/CATID` / `ISBJ`)
4. **(D-07)** არსებული `schema.json`-ის migration არ ხდება. დასტური?
5. **(D-08)** ცარიელი category დასაშვებია. დასტური?
6. **(TM-B05)** ცარიელი data chunk-ის მქონე WAV: მკაფიო შეცდომა თუ upstream issue?
7. **(TM-T2-DATA)** UCS სიის ფაილი და ლიცენზია. მის გარეშე T-2 BLOCKED-ია.
8. **(RR-R1-07)** მწვანე run-ის შემდეგ `check.yml` გავხადოთ required check და `release.yml`-ს დავუმატოთ `needs: check`? `release.yml` გაყინულია.
9. **Root-ისთვის:** მიაბით Actions run-ის URL `c34ee5a`-ზე (TM-T0-CI). B-ის ტოკენით `gh run list` 404-ს აბრუნებს.

## გადაწყვეტილება
**CONTINUE.** Round 2: TM-B04 + TM-B07 (`current-task.md`). user-ის ინფორმაცია არ სჭირდება. Round 3 იქნება T-1. მანამდე სასურველია პასუხები D-01, D-07, D-08 და D-10-ზე. თუ პასუხი არ იქნება, T-1 დაიგეგმება default-ებით, რომლებსაც ტესტები დააფიქსირებს.
