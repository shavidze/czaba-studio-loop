# B — Round 27 დახურვა და Round 28-ის გეგმა

თარიღი: 2026-10-27 · Planner: B · baseline: `6c956b41dee3580d01c6285c9c7c3e1c8495101c` (tree სუფთაა, B-ის ფაზაშიც)

## 1. Round 27-ის შედეგი
- **C: PASS.** R27-1…R27-6 გავიდა, realVerified=true, bugs: 0 (`c-round-27.md`, `c-round-27.json`, `c-round-27/`).
- **A:** idle იყო. repository-ში არაფერი ჩაუწერია, HEAD `6c956b4`, tree სუფთაა. A-მ verify ინფორმაციისთვის გაუშვა: 216/93/7 (`a-round-27/verify.log`).
- **root gate:** `skipped — no real changes` (`gates/gate-round-27.json`, head `6c956b4`). გამოსაქვეყნებელი არაფერი იყო, კოდი უკვე `6c956b4`-შია, ამიტომ შემდეგი baseline ისევ `6c956b4`-ია.
- **C-ის მტკიცებულების მოკლე შინაარსი:**
  - **R27-1 diff:** `c2c19a7..6c956b4` ზუსტად 8 path-ია (232+/27−). original process ცნობილი არ არის (B-R26-01), ეს FAIL არ არის.
  - **R27-2:** ძველი src + ახალი ტესტები 210/6. 6 ჩავარდნილი ტესტია, ყველა symptom-ზე ვარდება. `6c956b4`-ზე 216/216, თითოეული ტესტი ცალკეც გადის.
  - **R27-3:** 12/12 mutant მოკლულია, ყველა მოსალოდნელი killer-ით.
  - **R27-4:** verify exit 0, Biome 0/8 (იგივე სია), 216/93/7, `--retries=0` 7/7.
  - **R27-5 real app ორ build-ზე:**
    - `6c956b4` Category R27Cat-ს ინარჩუნებს. ffprobe და music-metadata ველ-ველ ემთხვევა: `ICAT=R27Cat`, title `R27T2`.
    - `c2c19a7` ფორმას აბრუნებს, მეორე save კი დისკზე `ICAT=''`-ს წერს. data loss reproduce-და.
  - **R27-6 docs:** PASS. ყველა line reference grep-ით შემოწმდა.

## 2. Backlog-ის ცვლილებები (მხოლოდ C-ის მტკიცებულებით)
- **TM-B29 → done.** round 27, commit `6c956b4`, realVerified=true, evidence = C R27.
- **D-34 → verified** (C R27).
- **დაიხურა:** B-R23-02, RR-R24-02, B-R25-02, C-R25-03, C-R25-04, A-R25-02, A-R25-03 (TM-B29).
  - RR-R25-01 დაიხურა: C R27-6-მა ყველა reference grep-ით შეამოწმა.
  - C-R26-01 დაიხურა: R27-მა ჩაანაცვლა.
- **B-R26-01 ღია რჩება (root).** R27-მა C-ის მტკიცებულება შეავსო. ღია რჩება ორი რამ: original transcript/review აღარ აღდგება, და publication ჩანაწერი არ ემთხვევა (§6).
- **ახალი finding-ები:**
  - **C-R27-01 (info):** schema editor-ის `Done` ნელ read-ზე ღია რჩება. UX-ის საკითხია, მიდის Saba-ს batch-ში.
  - **C-R27-02 (info):** `RNOT=''` იწერება. D-10 კლასია, record.
  - **B-R27-01 (low, signal):** reject-ილი chunk folder read-ში entry-ებს ჩუმად აგდებს.
  - **B-R27-02 (info):** D-35-ის UX ალტერნატივა (ჩაკეტვა). მიდის Saba-ს batch-ში.
- **B-R25-01:** low → **medium**, in_progress, routed to **TM-B30** (ახალი item, round 28, D-35). red reproduction იხ. §3. RR-R25-04-ს note დაემატა.
- **reviewer-ის არქიტექტურული შენიშვნები:** ამ round-ში ახალი არ არის (review არ გაშვებულა, gate skipped). ძველი signal-ები უცვლელია.
- **`tasks/round-27.md`:** შეიქმნა როგორც round 27-ის `current-task.md`-ის ასლი (`cp -n`, ადრე არ არსებობდა).

## 3. B-R25-01-ის red reproduction (B R27, repository-ს გარეთ)
- **ასლი:** `/tmp/b-r28-exp` (`git archive 6c956b4`, `node_modules` symlink). ფაილები: `b-round-27-exp/b-r28-rescan.test.ts`, `b-round-27-exp/b-r28-app.test.ts`, `b-round-27-exp/prototype-fix.diff`.
- **`6c956b4` src:**
  - (x1) single save pending + Rescan, rescan read write-მდე იწყება და save-ის re-read-ის შემდეგ ბრუნდება → **red**, `:62` `expected 'ACat' to be 'R28Cat'`.
  - (x2) batch → **red**, `:83`, იგივე symptom.
  - (x3) pin: Rescan save-ის გარეშე → green.
  - (x4, App drop) → **red**, `expected 'ACat' to be 'R28Cat'`.
- **prototype:**
  - რაც შეიცვალა: `readMetadataChunked` + `readGenerations`, `applyMetadataRead` file-store-ში, სამი caller.
  - შედეგი:
    - x1/x2/x4 green;
    - ძველი 216 ტესტი green;
    - suite 219/220. ერთადერთი ჩავარდნა x1-ის ბოლო ზედმეტი `getByText('a.wav')` click-ია (FileList არ არის render-ებული), ასერშენზე არ ვარდება.
  - შემოწმებები: tsc (web) 0; Biome 8 warning + 1 format (გრძელი ხაზი App.tsx-ში).
  - prototype-ში `lib/utils.ts` `useFileStore`-ს import-ს აკეთებს (ვარიანტი a). D-35 აირჩევს **ვარიანტ b-ს**: required parameter `getWriteGeneration`, lib store-ს არ იმპორტებს. ასე lib→store დამოკიდებულება არ ჩნდება, ქცევა იგივეა. stores-ი `lib/utils`-ს არ იმპორტებს (grep), ამიტომ cycle არც ვარიანტ a-ში იქნებოდა.
- **production-ში მიღწევადობა (კოდის წაკითხვით):**
  - `meta:write-batch` ყოველ 5 ფაილზე yield-ს აკეთებს (`src/main/ipc/metadata.ts:289-290`), `meta:read-batch` ყოველ 10-ზე (`:243-244`). renderer-ის chunk 50 ფაილია.
  - ამიტომ batch save + 50-ზე მეტი ფაილის rescan delay-ის გარეშეც იკვეთება.
  - single write main-ში სინქრონულია, ამიტომ single შემთხვევა მხოლოდ delay-ით მიიღწევა (C-ის harness).

## 4. Round 28 = TM-B30 (D-35)
- **რატომ ეს:**
  - critical/high ბაგი ღია არ არის;
  - C-ს R27-ში FAIL არ ჰქონია;
  - B-R25-01 R27-ის "Next"-ში დასახელებული შემდეგი item იყო;
  - red-ად დადასტურდა და data-loss კლასისაა (medium).
- **ზომა:**
  - 4 src ფაილი: `lib/utils.ts`, `file-store.ts`, `FolderBrowser.tsx`, `App.tsx`;
  - 1 ახალი test file, (r1)–(r8);
  - 2 test file მხოლოდ დამატებით: (g2) და (u1);
  - 3 docs ფაილი.
  - MetadataPanel და ორივე metadata-panel test frozen-ია, რომ D-34-ის verified კოდი არ შეიცვალოს.
- **მოსალოდნელი:**
  - baseline src-ზე 7 red / 3 green ახალ ტესტებში, ანუ 219/7;
  - A-ს tree-ზე 226/226, 12 ფაილი;
  - MR-1…MR-10, თითოეულს დასახელებული killer აქვს;
  - real app ორ build-ზე, Rescan და Open Folder სცენარებით.
- **Reference-first:** exempt-ია, რადგან ეს pure fix-ია და UX არ იცვლება. ალტერნატივა (ჩაკეტვა) არ აირჩია, იხ. B-R27-02.
- **scope არ შემცირებულა.** B-R27-01, A-R19-02 და MetadataPanel-ის refactor ცალკე ჩანაწერებად რჩება და დახურული არ არის.

## 5. Saba-ს კითხვების პაკეტი
- `b-round-23.md` §5 უცვლელია. ახალი:
  - **C-R27-01:** schema editor `Done`-ის შემდეგ ნელი read-ის დროს ღია რჩება. დაიხუროს თუ არა მაშინვე?
  - **B-R27-02 (optional):** Rescan / Open Folder / drop ჩაიკეტოს თუ არა save-ის დროს? D-35 ამას guard-ით აგვარებს, ამიტომ ეს მხოლოდ UX არჩევანია.

## 6. Root-ისთვის
- `last-publication.json` და `publications.jsonl` ბოლოს round 25-ს (`c2c19a7`) აჩვენებს. `6c956b4` ("verified loop rounds 26-26") origin/master-ზეა და round 27-ში C-მ ის სრულად შეამოწმა (PASS). root-ის გადასაწყვეტია, ჩაიწეროს თუ არა `6c956b4` publication-ად round 27-ის მტკიცებულებით (B-R26-01).
- Actions-ის `Check` run-ის ბმული TM-T0-CI/TM-B14-სთვის ისევ root-ზეა.

## 7. დამატებითი შემოწმება (advisor-ის შემდეგ)
- (u1)-ის ფორმა (`readMetadataChunked` React render-ის გარეშე, 101 path, chunk 2 reject, generation chunk 1-ში იზრდება) prototype-ზე მწვანეა (`b-round-27-exp/b-r28-u1.test.ts`): `window.api` setup.ts-ის mock-ით მუშაობს.
- task-ში დაზუსტდა: ცხრილის ყოველი ხაზი ერთი `it`-ია (226 = 216 + 10); chunk-ში მოხვედრა `scanFolder`-ის რიგით განისაზღვრება ((r7) a პირველია, (r8) z 51-ე); R28-5 old build-ის მოსალოდნელი მნიშვნელობა `ICAT=''`. backlog-ში TM-B30-ის acceptance MR-1..MR-10-ზე გასწორდა.
