# B — Round 13 დახურვა / Round 14 გეგმა

**გადაწყვეტილება: CONTINUE.** round 14 = TM-B17 (D-23): fixture-ების გენერატორის ჰიგიენა.

## Round 13 შედეგი (C evidence-ის მიხედვით)
- **C taskStatus PASS**, realVerified=true, bugs 0. R13-1…R13-6 ყველა PASS:
  - R13-1: შეიცვალა მხოლოდ 4 owned ფაილი. `MetadataPanel.tsx`-ის diff (+6/−2) მხოლოდ batch branch-ს ეხება. `permission_denials: []`.
  - R13-2: red `c3bd412` worktree-ზე: 3 failed / 6 passed. (f), (g) და (h) store-entry-ზე ვარდება: `OLDCat`→`""`. green: 9/9.
  - R13-3: M1–M4 ყველა მოკლულია.
  - R13-4: სუფთა verifyCommand exit 0. renderer 116/116, main 62/62, E2E 7/7, `--retries=0`-ით 7/7. Biome: 0 errors, 9 warnings (უცვლელი).
  - R13-5: real app, `chmod 000` p2:
    - toast `1 saved, 1 failed`; p2-ის row `Tagged`-ს ინარჩუნებს;
    - **red reference `c3bd412`-ის build-ზე: p2 კარგავს `Tagged`-ს** (`old-2-…png`);
    - p1: `ICAT=D22Cat` ffprobe-შიც და music-metadata-შიც. p2: sha256 უცვლელია;
    - regression: batch OK და single save გადის.
  - R13-6: docs კოდს ემთხვევა.
- all-failed გზაზე `skipSyncRef` real app-ში არ შემოწმებულა. მას ფარავს ტესტები (h)/(i) და M4, რასაც task პირდაპირ უშვებდა. ეს მტკიცებულების ნაკლად არ ითვლება.
- root gate: **published `a652f06`**, review COMMIT OK.
- archive: `tasks/round-13.md` (round 13-ის current-task-ის ასლი).

## backlog / feature-status ცვლილებები (მხოლოდ C-ის evidence-ით)
- **TM-B16 → done**, realVerified=true, commit `a652f06`. acceptance-ის ყველა ხაზს C R13-ის მტკიცებულება აქვს.
- **D-22 → done**, published.
- **დაიხურა:** A-R11-01, A-R11-02, RR-R12-01.
- **rounds:** 13 → published `a652f06`. round 14 დაემატა planned სტატუსით.
- **ახალი finding-ები (signal-ები, არა task-ები):**
  - RR-R13-01 (low): write OK, re-read fail → `emptyMetadata`. ეს D-22-ის known limit (2)-ია. fix-ს სჭირდება `readMetadataBatch`-ის დაბრუნების ფორმის შეცვლა, ანუ `src/preload/index.d.ts`. ეს ფაილი **protected**-ია, ამიტომ user-ის ნებართვა სჭირდება.
  - RR-R13-02 (low): `as WavMetadata` cast. იგივე protected preload-ის მიზეზით user-ს ელოდება.
  - RR-R13-03 (low): თუ `readMetadataBatch` reject-ს აკეთებს წარმატებული write-ის შემდეგ, ჩანს ზოგადი toast და store stale რჩება. fix მხოლოდ renderer-შია, შემდეგი low რაუნდის კანდიდატია.
  - RR-R13-04 (info): არქიტექტურა, `applyBatchSaveResult` + save-generation counter. RR-R12-04-თან ერთად signal-ად რჩება.
  - C-R13-01 (low): test helper main-ის `emptyMetadata`-ს ხელით აკოპირებს.
- `C-R12-01`-ის დუბლიკატი finding-ების სიიდან ამოვიღე (ერთნაირი id და title).
- **უცვლელი (in_progress):** TM-T0, TM-T0-CI, TM-T0-CI-FU და TM-B14. `gate-round-13.json`-ში Actions run არ არის. თხოვნა root-ს განახლდა: `Check` run `a652f06`-ზე.

## round 14-ის არჩევა
- C-ის ღია bug არ არის, critical/high არ არის. user-ის გადაწყვეტილების გარეშე დარჩენილი სამუშაო მხოლოდ low finding-ებია.
- round 13-ის "Next 1" C-R1-03 იყო. მას ერთვის იმავე ფაილის ორი round 1-იდან ღია finding, RR-R1-04 და RR-R1-05: ერთი ფაილი, მისი `.gitignore` და მისი docs. ≤3 მჭიდროდ დაკავშირებული.
- **ექსპერიმენტები** (`b-round-13-exp-tmp-leak.mts.txt`, ფაილები `/tmp/b-r13/`-ში):
  1. start: target dir, სადაც `sample.wav` არაცარიელი დირექტორიაა → action: `createWavTestFixtures(dir)` → result: `EISDIR` throw; `readdir` = `[sample.wav, sample.wav.10165.tmp]`. **დადასტურდა RR-R1-05**: temp ფაილი რჩება. finding `writeFileSync`-ს ასახელებდა, მაგრამ დეტერმინისტული გზა `renameSync`-ია.
  2. start: `create-fixtures.ts`-ის ასლი `/tmp/b-r13/m/create-fixtures.mts` → action: `npx --yes tsx@4` → result: exit 0, ფაილები არ შეიქმნა. **დადასტურდა RR-R1-04.**
  3. კოდის წაკითხვით (grep): `TESTING.md:129` ამბობს, რომ CI-მ სკრიპტი ტესტებამდე უნდა გაუშვას. რეალურად main-ს fixture-ებს `globalSetup` აძლევს, E2E `createSineWavBuffer`-ს თავად იძახებს, CLI-ს მხოლოდ verifyCommand უშვებს. **დადასტურდა C-R1-03.**
- **D-23** (ტექნიკური, შექცევადი, მხოლოდ test tooling):
  - ჩავარდნისას temp ფაილი იშლება და ორიგინალი შეცდომა ხელახლა ისვრის;
  - ახალი export `isCreateFixturesCliEntry`, regex `[cm]?[jt]s`;
  - `.gitignore`-ს ემატება `tests/fixtures/*.tmp`;
  - docs.
  - გამომავალი ბაიტები უცვლელია, ამას R14-4 sha256-ით ამოწმებს.
- ახალი item **TM-B17** (low), რომ acceptance და evidence მას მიება.
- real app-ის როლი ამ რაუნდში: R14-6 მხოლოდ regression smoke-ია, რომ გენერირებული fixture ჯერ კიდევ ვალიდური და დასატეგი WAV-ია. ამას task-ში პირდაპირ ვწერ. app კოდი არ იცვლება.

## გაფრთხილება user-ისთვის
round 14-ის შემდეგ ბლოკის გარეშე დარჩება დაახლოებით ორი პატარა low რაუნდი:
- RR-R13-03;
- RR-R5-02 და RR-R10-01/02 + A-R10-01.

ამის შემდეგ ყველაფერი Saba-ს კითხვების პაკეტს ელოდება:
- D-07 (TM-T1-MIG);
- D-10 + TM-B11;
- D-12/TM-B08 + B-R6-01;
- TM-T1-DUP (RR-R3-01, medium);
- D-15 + RR-R5-01;
- B-R7-02/RR-R8-04;
- TM-B05;
- TM-B06;
- RR-R1-07;
- RR-R3-05;
- TM-T2-DATA;
- **ახალი:** RR-R13-01/02 (protected preload ტიპები);
- სურვილისამებრ RR-R12-02.

ცალკე root-ის Actions link-ს ელოდება TM-T0-CI და მასთან დაკავშირებული item-ები.

## critical/high bug-ები
ღია არ არის.
- TM-B06: title-ის ნაწილი "tsconfig.test.json not part of check" მოძველებულია. `scripts.typecheck` round 2-იდან (D-11) `tsconfig.test.json`-ს უკვე ამოწმებს. ღია რჩება მხოლოდ `tests/`-ის Biome lint-ი. backlog-ში ჩაწერილია note.
