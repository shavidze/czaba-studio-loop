# B — Round 24 დახურვა / Round 25 დაგეგმვა

თარიღი: 2026-10-27 · Planner: B

## 1. Round 24-ის შედეგი (TM-B27, D-33)
- **C:** PASS R24-1…R24-6, realVerified=true, bugs 0 (`c-round-24.md`, `c-round-24/addendum.md`, `c-round-24.json`).
- **Root gate:** published `3d27ba9` (base `59c26d6`), review COMMIT OK. critical, high და medium finding-ები არ არის.
- **A-ს გადახვევა spec-იდან (A-R24-01)** გამართლებულია: spec-ის ორნაწილიანი D-33 შეუნახავ edits-ს და D-30-ს არღვევდა. C-მა ეს mutant MK-1-ით დაადასტურა: მას (s6) და (s7) კლავენ. ამიტომ D-33 ახლა **სამნაწილიანია**.
  - backlog `decisions` და `feature-status.md` D-33 განახლდა (ეს ხურავს C-R24-02-ს).
  - TM-B27-ის acceptance-ში ჩაიწერა ის, რაც რეალურად შემოწმდა: 207 ტესტი და ძველ src-ზე 203 passed / 4 failed, spec-ის 205-ისა და 202/3-ის ნაცვლად.
  - ეს scope-ის **გაფართოებაა**, რომელიც ჩაწერილია. scope არ შემცირებულა.
- **მტკიცებულება:**
  - (i2)-ის vacuity დამტკიცდა: 1 passed / 49 skipped `mockClear`-ზე.
  - mutant-ები MR-1, MR-2, MF-1, MF-1b, MK-1, MI-1…5 და MB მოკლულია.
  - gate 207/93/7, `--retries=0` 7/7, Biome 0/8 (იგივე სია).
  - real app: A-ს build და `59c26d6` build შედარდა. ffprobe და music-metadata ველ-ველ ემთხვევა. title Title-ის გარეშე write-ს ორივე build-ზე გადაურჩა, ამიტომ ახალი ბაგი არ არის.
- `tasks/round-24.md`-ში დაარქივდა (ახალი ფაილია, არაფერი გადაწერილა).

## 2. Backlog-ის ცვლილებები (მხოლოდ C-ის მტკიცებულებით)
- **TM-B27:** `in_progress` → **done**. realVerified=true, commit `3d27ba9`, C R24 evidence.
- **D-33:** status done R24, ტექსტს part (3) და RR-R24-01-ის შედეგი დაემატა.
- **finding-ები → done (TM-B27):** RR-R23-01, A-R21-03, B-R23-01, C-R23-01, RR-R23-02, A-R23-02.
- **ახალი finding-ები:**

  | ID | severity | routing |
  |---|---|---|
  | A-R24-01 | info | done (D-33 part 3) |
  | C-R24-01 | low | TM-B28 (s8) |
  | C-R24-02 | info | done (B-ის close) |
  | C-R24-03 | info | record only: equivalent by construction, რადგან write click-ის დროს სრულდება. component ტესტით ვერ შემოწმდება, მტკიცებულება real app-ის IPC log-ია |
  | C-R24-04 | info | TM-B28 docs |
  | RR-R24-01 | low | TM-B28 docs + D-33 ტექსტი |
  | RR-R24-02 | low | = B-R23-02, TM-B28 entry 9 |
  | RR-R24-03 | low | ტესტი არ ემატება (MB 24 ტესტით მოკლულია, defaults-only ტესტი რიგზე დამოკიდებული იქნებოდა). TM-B28-ში MB და MBS named mutant-ებია |
  | RR-R24-04 | low | TM-B28 |
  | RR-R24-05 | info | არქიტექტურის signal (read generation), იმავე სერიიდან, რაც RR-R23-04 და RR-R21-04 |

- **B-R23-02, ხელახალი კლასიფიკაცია:** R23-ში "read token ან lock → UX → Saba" დავწერე. ეს არაზუსტი იყო.
  - stale-result guard (read generation) renderer-only და ტექნიკური ცვლილებაა, D-33-ის კლასისა. UX მხოლოდ schema editor-ის ჩაკეტვაა.
  - ამიტომ guard round 26-ის fix-ის კანდიდატია, ოღონდ მხოლოდ მას შემდეგ, რაც B ბაგს red-ად reproduce-ს გააკეთებს.
  - status ჯერ კიდევ "ცნობილი შეზღუდვა"-ა.
- **ახალი item TM-B28** (low hygiene, round 25), `depends_on` TM-B27.
- **TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14** უცვლელად `in_progress`-შია. მათი acceptance ითხოვს root-ის მიერ მიბმულ green Actions run-ს `7879ee0`-ზე ან უფრო გვიანდელ commit-ზე. `40331357825` (`c768567`) უფრო ადრეულია და მხოლოდ evidence-ად არის ჩაწერილი. `gate-round-24.json`-ში Actions run არ არის.

## 3. Round 25: TM-B28 (`current-task.md`)
- **(a) RR-R24-04:** საერთო `resetWindowApiMocks()` `tests/renderer/helpers/window-api-mocks.ts`-ში, ექვსი mock-ით (`saveSchema`-ის ჩათვლით). ორივე test ფაილი მას იყენებს. (i3) ექვს mock-ს ამოწმებს.
- **(b) C-R24-01:** (s8): სიაში მყოფი ფაილი, რომელსაც store-ში entry არ აქვს და რომლის chunk read reject-დება, map-ში absent რჩება. ამას key-ების სია ამოწმებს. mutant-ები MA-1 და MA-2.
- **(c) docs:** `docs/bugs/001`-ში D-33-ის შენიშვნა, entry 3-ის სათაური, entry 9 (variant და გადაწყვეტილების ხაზი) და entry 10 ((s7)).
- **src-ის ცვლილება არ არის**, ამიტომ reference-first აქ არ ვრცელდება. მოსალოდნელი რიცხვები: renderer 208, 11 files; main 93; E2E 7/7.
- **რატომ CONTINUE და არა BLOCKED:** R24-ის review-მ და C-მ low სამუშაო იპოვეს, რომელიც Saba-ს გადაწყვეტილებას არ საჭიროებს. R23 §7-ში სწორედ ეს პირობა ჩავწერე.

## 4. Saba-ს კითხვების პაკეტი
უცვლელია `b-round-23.md` §5-თან შედარებით, B-R23-03-ის ჩათვლით. B-R23-02 იქიდან ამოვიდა: ის ტექნიკური fix-ის კანდიდატია და Saba-ს კითხვა მხოლოდ ჩაკეტვის ვარიანტზე რჩება.

## 5. Root-ისთვის
- **Actions run:** `Check` run კვლავ არ არის მიბმული `7879ee0`-ზე ან უფრო გვიანდელ commit-ზე (მაგალითად `3d27ba9`-ზე). ის ხურავს TM-T0-CI-ს, TM-T0-ს, TM-T0-CI-FU-ს და TM-B14-ის Actions ნაწილს.
- **A-R17-02:** read-primitives hook A-სთან ისევ არ ამოქმედდა. ეს ღიაა.

## 6. გადაწყვეტილება
**CONTINUE.** შემდეგი task: round 25, TM-B28.
