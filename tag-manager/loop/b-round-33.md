# B — Round 33 დახურვა / Round 34 გეგმა

Planner: B · თარიღი: 2026-10-28 · Repository HEAD: `9f5ac51` (root-მა round 33 გამოაქვეყნა; working tree სუფთაა; B-ის phase-ში src არ შეცვლილა)

## 1. Round 33 შედეგი (C-ის მტკიცებულებიდან)
- **C: PASS**, R33-1…R33-6, `realVerified=true` (`c-round-33.md`/`.json`). root gate: `published`, commit `9f5ac51`, review COMMIT OK (`gates/round-33/review.md`: 1 medium, 2 low).
- **TM-B35 → done** (D-40 verified). დაიხურა: A-R32-01, RR-R32-04.
- ძირითადი მტკიცებულება:
  - red 272/3 `ee15e6c`-ზე, symptom-ზე: (w1) `:181`, (w2) `:213`, (w3) `:236`; green 275/275.
  - DM-1/2/4/5/6/7 მოკლულია.
  - gate: 275/93/7, `--retries=0` 7/7.
  - real app W/WJ/R: ძველ build-ზე ყველა symptom ჩანს, ახალზე არცერთი. N ორივეზე სწრაფია.
  - sha256 უცვლელია; ffprobe + music-metadata ველ-ველ.
- **B-ის შეცდომა, ღიად:** round 32-ში B-მ DM-3 ეკვივალენტურად გამოაცხადა (B-R32-02). C-მ (k1)-ით უარყო ეს მტკიცება.
  - (k1): superseding load-ის საკუთარი read reject-დება (D-36). ამ დროს C-ის ფაილს D-40-ის re-read ავსებს, DM-3 კი ამ re-read-ს აგდებს.
  - B-R32-02 დაიხურა როგორც "შესწორებული C-R33-01-ით". TM-B35-ის acceptance-ის ტექსტი backlog-ში გასწორდა.
  - repository-ის docs-ში DM-3-ის "ეკვივალენტობა" არსად არ წერია (grep), ამიტომ docs-ის შესწორება არ სჭირდება.

## 2. ახალი finding-ები და მარშრუტი
| ID | Severity | მარშრუტი |
|---|---|---|
| C-R33-02 = QA-R33-01 = A-R33-02(2) | low (A qa: medium; C: low) | **TM-B36, round 34**. B-ის შეფასება low-ია: დისკზე არაფერი იცვლება, იკარგება მხოლოდ editor-ში აკრეფილი ტექსტი. round-ში მაინც პირველია |
| C-R33-01 | low (test gap) | **TM-B36**: pin (w8) |
| RR-R33-03 | low (doc) | **TM-B36**: ერთი წინადადება D-40-ში. B-მ შეამოწმა: `App.tsx:47` `setIsScanning(true)` schema-ს ლოდინამდე (`:50-55`) ხდება |
| A-R33-04 | low (doc) | **TM-B36**: README-ის ფორმულირება. B-მ დათვალა: 16 ჩანაწერი, 8 გასწორდა, დანარჩენი 8-დან 5 Saba-ს კითხვაა და 3 ცნობილი შეზღუდვა |
| RR-R33-01 | medium | **TM-B37** (ახალი item, todo, medium) |
| QA-R33-02 = A-R33-02(1) | low | **TM-B37** |
| QA-R33-03 | info | record (TM-B37-ის ოჯახი) |
| RR-R33-02, A-R33-01, A-R33-03 | low | signal (არქიტექტურა / წესის კანდიდატი); task-ები არ არის |
| B-R32-01 | info | C-მ გაზომა (W 1.81 s, R 5.51 s); ღიაა → TM-B37 |

**რატომ არ არის TM-B37 round 34-ში.** ეს **scope-ის შემცირება არ არის**: TM-B37 backlog-ში todo-ა და round 35-ის პირველი კანდიდატია. ცალკე round-ს სამი მიზეზით იღებს:
- (a) `Done`-ის busy/disabled მდგომარეობა ხილული UX ცვლილებაა, ამიტომ reference-first წესი მოქმედებს.
- (b) B-ის პირველი ძებნის შედეგი ორაზროვანია:
  - Opquast checklist და a11y სტატიები `disabled`-ის ნაცვლად `aria-disabled` + `aria-busy`-ს ურჩევენ;
  - Mp3tag forum-ზე მომხმარებლები save-ის დროს control-ების გათიშვას ითხოვენ.

  ამიტომ ვარიანტის არჩევა თავისი Reference და Deviations სექციით უნდა მოხდეს.
- (c) re-entrancy guard ცვლის იმას, რასაც მეორე `Done` აკეთებს, სანამ editor ჯერ ისევ რედაქტირებადია. re-read-ის **დროს** დამატებული ველი ვეღარ წაიკითხება, და ეს ცალკე გადაწყვეტილებაა.

წყაროები (TM-B37-ის Reference-ის საწყისი):
- https://checklists.opquast.com/en/digital-quality/98
- https://community.mp3tag.de/t/improper-action-while-saving/54838
- https://commerce.nearform.com/open-source/react-native-ama/guidelines/accessibility-states
- https://learn.microsoft.com/windows/apps/design/controls/progress-controls

## 3. Round 34 = TM-B36 (D-41)
- **B-ის red reproduction** (`b-round-33-exp/`, throwaway copy `/tmp/b33`, `git archive 9f5ac51`):
  - `red-run.log`: **279 passed / 2 failed of 281**. ორივე ჩავარდნილი, (e1) და (e2), `expected undefined to be 'QTyped'`-ით ვარდება: ხელახლა გახსნილი editor გაქრა.
  - (e3)(e4)(e5)(w8) green-ია.
- **Prototype** (`prototype.diff.txt`):
  - `isMountedRef` + mount effect + ერთი guard ხაზი;
  - `green-run.log` **281/281, 17 ფაილი**;
  - Biome 0 errors / 8 warnings, tsc web + test სუფთა.
- **Mutants** (`mutants.log`): SM-0 control 41/41; SM-1/SM-3/SM-4 → (e1)(e2); SM-2 → (e3) (StrictMode); DM-3 → (w8). SM-5 SM-1-ის დუბლიკატია (guard გათიშული).
- **რატომ mount ref `SchemaEditor`-ში და არა token `MetadataPanel`-ში:**
  - stale callback unmount-ებულ instance-ს ეკუთვნის;
  - `MetadataPanel.tsx` D-40-ით ახლახან გამოქვეყნდა და frozen რჩება;
  - ცვლილება ერთ ფაილშია და ერთ ხაზზე მოწმდება.
- **StrictMode:** `main.tsx:7`. effect-მა `true` თავად უნდა დააყენოს. ამას (e2)(e3) ამოწმებს; production build-ში dev double-effect არ ეშვება, რასაც C R34-5-ში ასახელებს.

## 4. ფაილები, რომლებიც B-მ შეცვალა
- `tasks/round-33.md`: round 33-ის task-ის ასლი (ადრე არ არსებობდა).
- `backlog.json`: `b-round-33-update-backlog.py`; წინა ვერსია `b-round-33-backlog-before.json`-შია.
  - TM-B35 done; D-40 verified;
  - ახალი: TM-B36, TM-B37, D-41;
  - 12 ახალი finding;
  - round 33 PASS, round 34 planned.
- `feature-status.md`: `b-round-33-update-feature-status.py`; წინა ვერსია `b-round-33-feature-status-before.md`-შია.
- `current-task.md`: round 34.
- `b-next.json`.

## 5. COMPLETE / BLOCKED შემოწმება
- **COMPLETE არა:** ღიაა TM-B36, TM-B37 (medium), TM-T0/TM-T0-CI/TM-T0-CI-FU/TM-B14 (root-ის Actions link), TM-T1-MIG/TM-T1-DUP, TM-B05/06/08/11 და blocked TM-T2/TM-T2-DATA.
- **BLOCKED არა:** TM-B36-ს მომხმარებლის input არ სჭირდება.
- Saba-ს კითხვების batch (`b-round-23.md` §5 და სხვ.) უცვლელად ღიაა.
