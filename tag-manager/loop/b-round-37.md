# B — Round 37 დახურვა და round 38-ის გეგმა

თარიღი: 2026-10-28 · Planner: B

## 1. Round 37 შედეგი
- **C: PASS** (`c-round-37.md` / `.json`). R37-1…R37-6, realVerified=**true**.
- **real-app მტკიცებულება.** Playwright `_electron` xvfb-ში, ძველი `51969a2` vs ახალი build, 10 run. Scenario-ები:
  - S1: ძველზე `1 selected`, ახალზე არაფერი;
  - S2: `a2.wav` მონიშნული, `1 selected`;
  - S2p;
  - S3: toast `Unsaved changes were discarded`;
  - S4: Shift-click გადარჩენილი anchor-ით range-ს იძლევა.
- **S2-save:** ffprobe და music-metadata ორივე აჩვენებს `ICAT=R37Kept`-ს. sha256 სხვა ფაილებზე უცვლელია, `pageErrors` ცარიელია.
- **Gate:** 296/93/7, `--retries=0` 7/7.
- **Root gate:** published `ea4a1cb5c439b47565bce1c3883f8e41ca775511` (`gates/gate-round-37.json`). Review **COMMIT OK**: 0 critical/high/medium, 2 low, 1 არქიტექტურის შენიშვნა. ეს არის round 38-ის baseline.
- **TM-B39 → done**, C-R34-01 → closed, D-44 → verified.
- **Archive:** `tasks/round-37.md`. ახალი ასლია; `cmp`-ით შემოწმდა, რომ round 37-ის task-ის იდენტურია. ძველი archive არ არსებობდა.

## 2. ახალი finding-ები და მათი მიმართულება
| ID | Severity | რა | სად მიდის |
|---|---|---|---|
| C-R37-01 | low | PM-6 (D-44-ის რიგი) გადარჩა; დღეს ეკვივალენტურია | TM-B41 |
| C-R37-02 = A-R37-01 | low | docs/bugs/001-ის header-ში entry 20 / D-44 არ არის | TM-B40 (round 38 docs) |
| RR-R37-01 | low | entry 20-ის ref-ებს ფუნქციის სახელი სჭირდება | TM-B40 (round 38 docs) |
| RR-R37-02 | low | test-ის quote style; Biome `tests/`-ს არ ამოწმებს | TM-B06 |
| RR-R37-03 | info | `pruneSelectionTo` + anchor store-ში | signal, task არ არის |
| B-R37-01 | info | Done-ის წარმატების შემდეგ focus `<body>`-ზე გადადის (editor unmount-დება) | signal |
| B-R37-02 | info | ფაქტი: jsdom focus-ის დაკარგვას native `disabled`-ზე არ აჩვენებს | TM-B41 (TESTING.md §6) |
| B-R37-03 | info | Applying-ის დროს Input / Add Field 0.3 opacity-ზეა (ორმაგი dim, ისრებზე ნაკლებად მძიმე) | signal |

## 3. Round 38 = TM-B40 (D-45)
**Bugs.** ერთ round-ში სამი დაკავშირებული low ბაგი:
- RR-R35-01 + RR-R35-04: Done / Save Tags focus-ს კარგავს, click-ის guard არ აქვს;
- C-R35-01: ისრები ორმაგად ფერმკრთალდება;
- RR-R36-01: (b7)-ის assertion.

ამას docs follow-up-ები ემატება: C-R37-02 და RR-R37-01.

**Prototype** (`b-round-37-exp/`, `ea4a1cb`-ზე, throwaway copy-ში):
- **jsdom probe:** focused ღილაკი native `disabled`-ის შემდეგ `activeElement`-ად რჩება. ამიტომ unit ტესტები attribute-ს და guard-ს ამოწმებს, focus-ს კი მხოლოდ real app (R38-4).
- **Red:** HEAD src-ზე 30 failed / 274 passed of 304. ახალი ფაილიდან (f1) და (f3)–(f8) ვარდება, (f2) pin-ია. დანარჩენი 23 არსებული ტესტია, რომელიც migrated assertion-ს აღწევს.
- **Green:** 304/304, 20 ფაილი, ორჯერ. `tsc` web + test clean, Biome 0/8.
- **Mutants:** GM-1…GM-11 ყველა მოკლულია (guard-ები, `aria-busy`, native `disabled`-ის დაბრუნება, ისრის class, stale deps).
- **ხაზების სტაბილურობა:** helper-ები ფაილის ბოლოშია, Done-ის guard state-ით მუშაობს. ამიტომ docs/bugs/001-ის ref-ები `SchemaEditor.tsx:279`-მდე და `MetadataPanel.tsx:372`-მდე არ იცვლება (RR-R37-01-ის გაკვეთილი). ref-ზე დაფუძნებული პირველი ვერსია უარვყავი, რადგან ყველა D-41/D-42 ref-ს წაანაცვლებდა.

**Reference:**
- APG "Focusability of disabled controls";
- MDN `aria-disabled`;
- R35-ის ARIA Practices / GitLab / Fluid.

Desktop tag editor-ები (Mp3tag, Kid3) ამ დონეს არ აჩვენებს; წყარო არ მოიძებნა და არც გამოგონილა. Deviations 1–6 ჩაწერილია task-ში.

## 4. Saba-ს კითხვები (ღია, ჩემი გადაწყვეტილება არ არის)
- **RR-R35-02:** თუ Done ან Save არასოდეს სრულდება (მაგ. scan, რომელიც არ მთავრდება), `Applying...` / `Saving...` სამუდამოდ რჩება. ამ დროს Back, Open Folder და Close Folder მუშაობს.
  - კითხვა: გინდა timeout (მაგ. 30 s), რომელიც busy-ს წმენდს და toast-ს აჩვენებს?
  - round 38 ამას **არ** აკეთებს; finding ღია რჩება.
- წინა კითხვები ძალაში რჩება: `b-round-23.md` §5, B-R36-01 (სიის ჩაკეტვა scan-ის დროს), TM-T2-DATA (UCS სია და ლიცენზია).

## 5. დარჩენილი (dependency-ს რიგით)
- **TM-B40** (round 38).
- **TM-B41** (test-only): C-R36-01, RR-R36-02/03/04, C-R37-01, B-R37-02.
- **Saba-ს ან root-ის მოლოდინში:**
  - TM-T0 / TM-T0-CI / TM-T0-CI-FU / TM-B14: root-ის Actions-ის მტკიცებულება;
  - TM-T2 / TM-T2-DATA: Saba;
  - TM-T1-MIG, TM-T1-DUP, TM-B08, TM-B05, TM-B06, TM-B11: todo, დაბალი პრიორიტეტი, contract / Saba-ს კითხვებთან დაკავშირებული.

## 6. Checkpoint
- [x] tasks/round-37.md archive
- [x] backlog.json: TM-B39 done + evidence, C-R34-01 closed, D-44 verified, round 37 published, ახალი finding-ები, D-45 planned, TM-B40 in_progress, round 38 planned
- [x] feature-status.md
- [x] current-task.md (round 38)
- [x] b-round-37-exp/ (test draft, prototype diff, red/green/mutant logs)
- [x] b-next.json
