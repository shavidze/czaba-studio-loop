# RETRO 435 — მეჩვიდმეტე რეტროსპექტივა (რაუნდები 420–434)

**ავტორი:** B, round 434 → 435 დაგეგმვისას, 2026-11-10. **D-ID:** D-29z1540…D-29z1543. **master:** `8233840` (gate 434 published).
**კონსულტაციები:**
- `tech-lead` — რეალურად გამოვიძახე; პასუხი: `b-round-434/consult-tech-lead.md`.
- `product-designer` — ეკრანი და გზა; `b-round-434/consult-product-designer.md`.
- advisor — დაგეგმვის მიდგომა.
- `qa-engineer`, `consequence-tester`, `design-philosopher` და `first-visit-host` B-ის consult სიაში არ არიან (2026-11-04 §6) და არ გამომიძახებია.

**რატომ ახლა:** Saba-ს წესით (2026-10-26) RETRO ყოველ 15 რაუნდში ტარდება. RETRO 420-ის შემდეგ 15 რაუნდი გავიდა (`backlog.json` → `retro_policy.next_due`).

**მონაცემები:**
- სკრიპტები: `b-round-434/*.py` და `misc-outputs.sh`. ეს retro 420-ის სკრიპტების ასლებია; შეცვლილია მხოლოდ ფანჯარა და გზები.
- `gate-reviews.py` თავიდან დაიწერა. ძველი parser-ი მხოლოდ `### Critical/Suggestions` სათაურებს ითვლიდა და `## Findings`-იან review-ებზე 0-ს აბრუნებდა.
- input: `b-round-434/backlog-retro-input.json`. ეს `backlog.json` v418-ია, round 434-ის მიღების შემდეგ (D-29z1538/1539). ამიტომ round 434-ის სამი Low ფანჯრის ციფრებში შედის.
- ამას ემატება `b-round-434/archive-findings-snapshot.json`: optimizer-ის archive-ის ასლი, დაგეგმვისას გადაღებული (C-R416/C-R420-ის გაკვეთილი).
- შედეგები: `b-round-434/data/`.

## 1. მოკლედ
- **15 რაუნდი:** 14 C PASS, 1 FAIL (423). `browserVerified` ჩაიწერა 15/15-ში (`data/collect.txt`).
- **ხარჯი $255.35:** B $180.02, A $61.73, C $13.60 (`data/cost.txt`).
- **ბაგები და STOP:**
  - C-მ იპოვა 4 ბაგი: 1 Medium (C-R423-01) და 3 Low (`data/fails-detail.txt`).
  - A STOP: 0 (`data/stops-count.txt`).
  - Gate review: 12 published, ყველა `COMMIT: OK`; Medium+-ად მონიშნული პუნქტი 0. 24 პუნქტს severity არ აწერია (`data/gate-reviews.txt`).
- **დასრულდა:**
  - SYS-2 (held Enter): 5 ეტაპი.
  - SABA-B-12: ეტაპები 1–3b. ეტაპი 4 (select) REVIEW-RECOMMENDATIONS-ს ეკუთვნის.
  - REGRESSION-2026-11-10.
- **ეკრანი:** 420-თან შედარებით მუდმივი ტექსტი არ შეცვლილა. spin-ისრები გაქრა, radio-ები brass ფერისაა (`user-review/screen-review-435.md`).

## 2. ციფრები (`data/cost-rows.json`, `data/cost.txt`, `gates/gate-round-N.json`)
| რაუნდი | შინაარსი | B | A | C | ჯამი | C | gate |
|---|---|---|---|---|---|---|---|
| 420 | RETRO 420 | 14.33 | 0.51 | 0.78 | 15.62 | PASS | skipped (source არ შეცვლილა) |
| 421 | SYS-R418-PREVIEW-LIFECYCLE | 11.98 | 4.02 | 0.56 | 16.56 | PASS | `4786c13` |
| 422 | SYS-2 ეტაპი 1 | 11.63 | 3.02 | 0.55 | 15.20 | PASS | `875ff37` |
| 423 | REGRESSION ნაწილი 1 | 7.85 | 0.51 | 5.11 | 13.47 | **FAIL** | skipped |
| 424 | PERF-FIX-R423-LANE-SHELL (fix-up) | 14.25 | 4.66 | 0.83 | 19.74 | PASS | `f6c76f4` |
| 425 | REGRESSION ნაწილი 2 | 8.41 | 0.49 | 0.30 | 9.20 | PASS | skipped (source არ შეცვლილა) |
| 426 | SYS-2 ეტაპი 2a | 17.02 | 6.10 | 0.74 | 23.86 | PASS | `052c76c` |
| 427 | SYS-2 ეტაპი 2b-i | 14.74 | 8.11 | 0.65 | 23.50 | PASS | `ffae71c` |
| 428 | SYS-2 ეტაპი 4 | 13.68 | 7.17 | 0.77 | 21.62 | PASS | `b604cfb` |
| 429 | SYS-2 ეტაპი 5 | 12.78 | 7.22 | 0.54 | 20.54 | PASS | `76f4147` |
| 430 | SABA-B-12 ეტაპი 1 | 11.04 | 3.09 | 0.52 | 14.65 | PASS | `5a30894` |
| 431 | SABA-B-12 ეტაპი 2a | 10.21 | 4.85 | 0.54 | 15.60 | PASS | `1197dcb` |
| 432 | SABA-B-12 ეტაპი 2b | 11.07 | 4.66 | 0.59 | 16.32 | PASS | `1a417fb` |
| 433 | SABA-B-12 ეტაპი 3 | 11.23 | 3.56 | 0.55 | 15.34 | PASS | `0c22ac9` |
| 434 | SABA-B-12 ეტაპი 3b | 9.80 | 3.76 | 0.57 | 14.13 | PASS | `8233840` |

- B-ის სვეტი round N-ის დაგეგმვაა (`b-round-(N-1)-result*.json`).
- **მედიანები:** რაუნდი $15.62, B $11.63. B-ის ფარგლები: მინიმუმი 7.85, მაქსიმუმი 17.02.
- **A-ს საშუალო:** PASS-ზე $4.37.
- **retro 420-ის ფანჯარა (416–419):** რაუნდი $15.51, B $11.735, A PASS $3.69 (`b-round-419/data/cost.txt`).
- **ეტაპების მიხედვით (`data/stage-sums.txt`, სკრიპტი `b-round-434/stage-sums.py`):**
  - SYS-2: 5 რაუნდი, $104.72, საშუალოდ $20.94. ყველაზე ძვირი ეტაპია.
  - SABA-B-12: 5 რაუნდი, $76.04.
  - REGRESSION + fix-up (423–425): $42.41.
- **B-ის წილი:** 70.5 % (`data/stage-sums.txt`). RETRO 420-მა ეს საზომი შეცვალა მედიანებით (D-29z1465), ამიტომ ახლა მხოლოდ ინფორმაციაა.

## 3. FAIL-ები და gate block-ები
- **ერთადერთი FAIL — round 423, C-R423-01 (Medium).**
  - **რა მოხდა:** REGRESSION-ის RR-PERF row-ში 17 assert ჩავარდა: committed components per move (fade, trim, video, video-trim, video-fade). C-მ შედეგი 3 გამეორებით დაადასტურა (`c-round-423.json`).
  - **მიზეზი, D-29z1482-ის მიხედვით:**
    - `test:perf` gate-ში არ შედის.
    - 405–422 რაუნდებში perf საერთოდ არ გაშვებულა.
    - რაუნდებში 405–409 ArrangementLane/VideoDock-ის shell და leaf-ების დაყოფა მოხდა.
    - C-ის JSON-ში ეს **ჰიპოთეზად** წერია, bisect-ის გარეშე.
  - **გამოსწორება:** round 424 (fix-up B-ის reviewed sketch-იდან). C PASS, 17 id-ვე sketch-ის მედიანაზე (D-29z1483).
  - **origin:** `tech-lead` RETRO 416-ის წესით C-R423-01-ს `B spec`-ად თვლის, რადგან დაყოფები B-ის sketch-ებიდან მოდიოდა.
- **Gate block:** არ ყოფილა. სამი `skipped` არის 420 (RETRO), 423 (C FAIL) და 425 (C-only).
- **რომელი წესი აიცილებდა:** L37-ის ახალი clause (§10): ყოველი ცვლილება, რომელიც fiber-ის სტრუქტურას ცვლის, sketch-ზე სრულ `test:perf`-ს უშვებს.

## 4. Findings (`data/fails-detail.txt`, `data/classify.txt`, `data/gate-reviews.txt`, `data/l57-enum-backfill.txt`)
**C-ის 4 ბაგი:**
- C-R420-CLAIMS-K22-ARCHIVE-AGAIN — Low, origin environment.
- C-R420-CLAIMS-K8-K24-YOUTUBE-REQUEST-CONSUMED — Low, environment.
- C-R423-01-PERF-DRAG-COMPONENTS-BUDGET — Medium; origin თავისუფალი ტექსტია (ჰიპოთეზა).
- C-R425-01 — Low; origin „C“.
- ოთხივეს `origin` აქვს. მაგრამ ორი მნიშვნელობა L57-ის enum-ში არ შედის (`tech-lead`). ძველი `tools/l57-check.py` მხოლოდ ველის არსებობას ამოწმებდა.
- C-R425-01 backlog-ში C-R425-01-RVM-COLD-DEV-EMPTY სახელით წერია. ეს **ერთი** id-ია, დუბლიკატი არ არის (`tools/find-ids.py`: C-R425-01 NOT-FOUND).

**`deferred_low_polish`-ში ფანჯრის რაუნდების 37 Low:**
- **origin:** A 25, gate reviewer 6, B 4, C 2.
- **კატეგორიები:** focus 7, tests/harness 6, keyboard 5, docs/process 4, a11y 3, layout 2, copy 2, timing 1, uncategorised 7.
- 37-ში შედის round 434-ის ახლად დამატებული სამი id (GATE434-S1, GATE434-S2, B-R434-CONFIRMMODAL-NAME).
- archive-ში ფანჯრიდან 4 id-ია: 2 Low, 1 Medium, 1 info.

**Gate review-ები:**
- 12 review, ყველა `COMMIT: OK`. Score 9 აქვს შვიდს (422, 424, 426, 430, 432, 433, 434); დანარჩენ ხუთს score არ აქვს.
- ჯამში 46 დანომრილი პუნქტი: Low 18, info 4, severity-ის გარეშე 24 (სიტყვის საზღვრით ძებნა).
- Medium+-ად მონიშნული პუნქტი არ არის. severity-ის გარეშე 24 პუნქტზე ამის თქმა სკრიპტით შეუძლებელია; ყველა review `COMMIT: OK`-ია.

**B-ის Low-ებიდან ორი** (ფანჯარაში B-ის 4 Low-ია):
- **B-R433-HEAD-BLUE-PX-MISCOUNT** — task-ში ეწერა 8 px, B-ის probe-ში იყო 32.
- **B-R434-CONFIRMMODAL-NAME** — task-ში ეწერა ConfirmModal, სინამდვილეში ConfirmDialog-ია.
- ორივეს ერთი კლასი აქვს: ტექსტში ხელით გადაწერილი რიცხვი ან სახელი, რომელიც ფაილიდან არ არის ამოღებული.

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **C-R423-01:** აიცილებდა sketch-ზე გაშვებული perf suite. დღეს L37/L58 მხოლოდ name probe-ს ან კონკრეტული row-ის perf-ს ითხოვს. ამიტომ ემატება L37-ის clause.
- **B-ის Low-ებიდან ორი** (ფანჯარაში B-ის 4 Low-ია): აიცილებდა L56-ის ახალი clause (რიცხვი ან სახელი თავისი ფაილით და JSON key-ით; C greps). სრული checker ჯერ არ არის აწყობილი: RC-R435-NUMBER-CHECKER (კანდიდატი).
- **source-scan Low-ები (11 id):** აიცილებდა საერთო helper-ი.
  - თითოეულმა SABA-B-12 და held-Enter რაუნდმა საკუთარი regex scanner დაწერა. `tech-lead`-მა ექვსი ცალკე scanner ფაილი იპოვა, საერთო import-ის გარეშე.
  - ეს §11-ის სისტემური ამოცანაა.
- **C-R420-ის ორი environment Low:** უკვე დაიხურა 420-ში (`tools/find-ids.py`, D-29z1468). ფანჯარაში აღარ განმეორებულა.

## 6. Saba-ს ნაპოვნი საკითხები და ეკრანი
- **ფანჯარაში Saba-ს ორი ახალი საკითხი (2026-11-10):**
  - SABA-B-12 — ბრაუზერის ნაგულისხმევი form control-ები, Medium.
  - SABA-LANE-RESIZE-HANDLE — Low.
  - ორივე `backlog.json`-ში იმავე დღეს ჩაიწერა (L42).
- **lesson:**
  - SABA-B-12-ს აქვს L61 (round 430; scrollbar-ის clause round 434-ში).
  - lane handle-ს lesson არ აქვს. `tech-lead`-მა უარყო: ერთჯერადია, resize handle native chrome არ არის. „Why we missed it“ COPY-PD-VIS-ის task-ში დაიწერება.
- **იგივე ტიპი დაბრუნდა:**
  - 2026-10-07-ს მომხმარებელმა native scrollbar-ზე იჩივლა (`publication-checkpoint.json` → `scrollbarUserRequest`). მაშინ გასწორდა მხოლოდ library და timeline.
  - იმავე კლასის ხარვეზი (ბრაუზერის/store-ის chrome Studio-ში) 2026-11-10-ს SABA-B-12-ად დაბრუნდა. მათ შორის იყო Modal-ის teal scrollbar, რომელიც cloud-ის headless screenshot-ებში არასოდეს ჩანდა (`--hide-scrollbars`, L61).
  - ეს **1 განმეორებაა**. ამიტომ §12-ში წინადადებაა Saba-სთვის (პროექტის წესი).
- **ეკრანი (`user-review/screen-review-435.md`):**
  - მუდმივი ტექსტის ხაზები: 138/168/118/144; timeline-ისა და library-ის გარეთ: 97/124/86/101. ორივე 420-ის ტოლია.
  - გზაზე F2 (stems ერთი მეორის მიყოლებით) ისევ ჩანს.
  - ახალი: SR-435-1 (From/To ერთეულის გარეშე — კითხვა Saba-ს, Q4) და SR-435-2 („source offset“ footer-ში — STUDIO-VIS-4-ის scope).

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
- **რიგი RETRO-ს შემდეგ.**
  - `tech-lead`: REGRESSION → SYS-R435 → COPY-PD-VIS.
  - **B (D-29z1543):** REGRESSION, როცა ვადა მოვა (2026-11-13). მანამდე ჯერ COPY-PD-VIS და მერე SYS-R435.
  - მიზეზი: 2026-10-23-ის bug gate-ით ღია Medium-ები (STUDIO-VIS-4, STUDIO-VIS-6; Saba-ს დამტკიცებული) Low-ების დამხურავ test-only ამოცანაზე ადრე სრულდება.
  - ორივე რიგით SYS-R435 ARCH-SPLIT-ზე ადრეა, ასე რომ `tech-lead`-ის მიზეზი (L8) დაცულია.
- **L56-ის checker.** `tech-lead` ახალი clause-ით `tools/l58-check.py`-ის ცვლილებას გულისხმობდა. B-მ checker არ ააწყო: clause C-ის CLAIMS row-ს ავალდებულებს, checker კი კანდიდატად დარჩა (RC-R435-NUMBER-CHECKER). ასე lesson-ში წერია მხოლოდ ის, რაც დღეს რეალურად მოწმდება.
- **SR-435-1.** `product-designer` „From (s)“-ს გვთავაზობს, Saba-მ კი „From“ დაამტკიცა. B დამტკიცებულ ტექსტს თვითონ არ ცვლის (L44): კითხვა Q4, default = დამტკიცებული.

## 8. ღია კანდიდატებისა და ვადების ბედი (L46; `data/retro435-deadlines.txt`)
- **TLM-SABA-B-12-FIREFOX-SAFARI** (პირველი ვადა): ერთი კითხვა Saba-ს (`user-review/questions-retro-435.md` Q1, 5 შემოწმება, RV432-1-ის ჩათვლით). ახალი ვადა: RETRO 450.
- **TLM-PERF15-FIREFOX:** RETRO 416-ზე და 420-ზე იკითხა, პასუხი არ მოსულა. L46-ის მიხედვით **ხელახლა გაიხსნა task-ად**, რომელსაც ROOT-REQ-PLAYWRIGHT-FIREFOX ბლოკავს (runner-ზე მხოლოდ Chromium-ია). მესამე კითხვა: Q2.
  - თუ root უარს იტყვის, ორივე Firefox-ის ნაწილი დაიხურება როგორც „loop-ში შეუმოწმებადი“. ეს მხოლოდ Saba-ს თანხმობით (`tech-lead`).
- **STUDIO-PERFORMANCE-ის ნარჩენები:**
  - PERF-4b, 9c, 11b, 12b და 14c-ii/iii ერთ კითხვად გაერთიანდა (Q3).
  - PERF-9d (root) და PERF-4c (backend) გაჩერებულია RETRO 450-მდე.
- **RC-R305-LESSON-CHAR-CAP:** L23 5058, L58 4988 bytes (`wc -c`). უცვლელია, რადგან ახალი clause-ები L37-სა და L56-ში წავიდა. watch → RETRO 450.
- **RC-R423-PERF-SPEC-ON-STRUCTURE + SIG-R424 + GATE304-M1:** L37-ის clause-ად მიიღო (D-29z1541). GATE304-M1 (perf/lib gate-ში არ არის) root-ის ხელშია და §12-ში წინადადებაა.

## 9. countermetric-ები: retro 420-ის მიზნები → შედეგი
| საზომი | მიზანი | შედეგი | სტატუსი |
|---|---|---|---|
| sketch `l58-check` rc 0-ის გარეშე | 0 | 0; 12 sketch, ყველა L58 OK (`data/l58-check-window.txt`) | შესრულდა |
| L57 ველები და `origin` | ყველა | ველები 15/15 (`data/l57-coverage.txt`); `origin` 4/4, მაგრამ enum-ში 2/4 (`data/l57-enum-backfill.txt`) | ნაწილობრივ |
| B-ის წარმოშობის C FAIL | ≤ 1 | 1 (423, `tech-lead`-ის შეფასებით) | შესრულდა, ზღვარზე |
| A STOP C-მდე | ≤ 1 | 0 | შესრულდა |
| წმინდა fix-up ჯაჭვი | < 15 % | 1/15 = 6.7 % (424) | შესრულდა |
| რაუნდის მედიანა / B მედიანა | ≤ $17.00 / ≤ $14.50 | $15.62 / $11.63 | შესრულდა |
| L58 | < 5000 bytes | 4988 (`wc -c`) | შესრულდა |
| ერთი დეფექტი = ერთი id | `confirmedBy` | 13 ჩანაწერი იყენებს `confirmedBy`-ს (`data/counters-extra.txt`); სკრიპტით ვერ მოწმდება | ინფორმაცია |
| STEM-LANES: browser row „stems ერთად ჟღერს“ | ყოველ ეტაპზე | STEM-LANES არ დაწყებულა | არ ეხება |

**RETRO 450-ის მიზნები (`tech-lead`; ყველა სკრიპტით მოწმდება):**
- `l58-check` rc 0 ყველა sketch-ზე.
- `l57-check` rc 0, enum-ის ჩათვლით.
- fiber-ის სტრუქტურის ყოველ ცვლილებას (ARCH-SPLIT-ის ყოველ ეტაპს) აქვს შენახული `test:perf` log-ი.
- C FAIL ≤ 1 და fix-up ჯაჭვი < 15 %.
- რაუნდის მედიანა ≤ $17.00 და B მედიანა ≤ $14.50.
- L23 და L58 თითო < 5100 bytes, lessons ≤ 60 ხაზი.

## 10. ცვლილებები: lessons და tools (`b-round-434/lessons-diff.txt`, `b-round-434/l57-check-diff.txt`)
- **l.3 (hunk `3c3`):** pointer → `retro-435.md`, `420–434`. ბოლოში ემატება „**RETRO 435 (D-29z1541):** L37 and L56 gain one clause each (both `tech-lead`); `tools/l57-check.py` validates `origin` values.“
- **L37 (hunk `24c24`):** + „Fiber-structure change → full perf suite on the sketch (RETRO 435)“. task, რომელიც გაზომილ გზაზე კომპონენტებს ყოფს, ახვევს, memo-ს უკეთებს ან გადაადგილებს (ARCH-SPLIT-ის ყოველი ეტაპი), sketch-ის production build-ზე `npm run test:perf`-ს ცალკე უშვებს და log-ს `[K#]`-ით ინახავს.
- **L56 (hunk `40c40`):** „a count names the file it was counted from“ იცვლება ასე: task-ში ჩაწერილი რიცხვი, სახელი ან pixel-ის მნიშვნელობა თავის ფაილს და JSON key-ს ასახელებს, და C-ის CLAIMS row მას იქ greps-ით ეძებს.
- **`tools/l57-check.py`:** `origin` უნდა იწყებოდეს enum-ის ერთ-ერთი ტერმინით (`B spec`, `B pre-check`, `A`, `pre-existing`, `environment`).
  - ძველ JSON-ებზე გაშვებით 423 და 425 ჩავარდებოდა; 434 OK-ია.
  - ძველი შედეგები არ იცვლება; წესი round 435-იდან მოქმედებს.
- **ფაილი:** ზუსტად 60 ხაზი. lesson-ების id-ები უცვლელია; L23 და L58 არ შეცვლილა.
- **უარყოფილია (`tech-lead`):** lane handle-ის lesson (1×) და origin-ის lesson-ის ტექსტი (ამის ნაცვლად tool).

## 11. სისტემური ამოცანა
**SYS-R435-SOURCE-SCAN-HELPER** (`tech-lead`; test-only).
- **რას აკეთებს:** ერთი საერთო source-scan helper. ის მთლიან JSX tag-ს parse-ავს (L13), tag-ის შიგნით spread-სა და `style=`-ს უარყოფს და subfolder-ებსაც რეკურსიულად გადის. ექვსი არსებული scanner მასზე გადადის, ქცევის შემნახველი mutant-ებით.
- **ხურავს 11 Low-ს:**
  - A-R430-REVIEW-NF2-TYPE-BOUNDARY, -NF2-SIDE-EFFECT-IMPORT, -NF2-CLASSNAME-CONST;
  - A-R431-REVIEW-L1-RD2-SPREAD-AFTER-TYPE, -L2-RD2-DATA-TYPE, -L3-RD2-DATETIME-LOCAL;
  - A-R432-REVIEW-RV432-5-PG2-SPREAD;
  - A-R433-REVIEW-SF2-SCANNER-BLIND-SPOTS;
  - GATE434-S2-DS4-SOURCE-SCAN-SCOPE;
  - GATE431-REVIEW-L3-STRING-COUNT-PINS;
  - A-R429-REVIEW-SCAN-NEGATED-REPEAT.
- **ადგილი:** COPY-PD-VIS-ის შემდეგ და SYS-1-მდე. ყოველ შემთხვევაში ARCH-SPLIT-მდე: DS4 მხოლოდ ზედა დონის `arrangement/*.tsx`-ს ამოწმებს, და subfolder-ში გადატანილ ფაილებს ჩუმად გაატარებდა (L8).
- **არ ეხება:** Modal-ის `scrollbarClassName`-ის semantics (GATE434-S1) და StudioDialog wrapper-ის კითხვა. ეს ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS-ის Q4-ია.

## 12. Saba-სთვის და root-ისთვის (წინადადებები და კითხვები; loop-ში არ სრულდება)
- **Saba:** `user-review/questions-retro-435.md`:
  - Q1 — Firefox/Safari, SABA-B-12.
  - Q2 — TLM-PERF15-FIREFOX, მესამედ.
  - Q3 — PERF-ის ნარჩენები.
  - Q4 — From/To-ს ერთეული.
  - ყველას აქვს default; loop არ ჩერდება.
- **Saba:** `user-review/AGREE-STEM-LANES.md` ისევ პასუხს ელოდება. STEM-LANES წინ წავა, როგორც კი პასუხი მოვა.
- **პროექტის წესის წინადადებები (`tech-lead`; ჯერ არ არის გადაწყვეტილი, მხოლოდ Saba გადაწყვეტს):**
  1. `test:perf` (ან committed-components-ის სწრაფი ნაწილი) და `perf/lib` vitest root-ი `npm run verify`-ში ან gate-ში (GATE304-M1, C-R423-01).
  2. root-მა runner-ზე Playwright Firefox დააყენოს (`npx playwright install --with-deps firefox`; ROOT-REQ-PLAYWRIGHT-FIREFOX).
  3. DESIGN_SYSTEM / TAILWIND_FIRST-ში: „ბრაუზერის ნაგულისხმევი control chrome (scrollbar, spin-ისრები, progress, search ✕) არ გამოდის“. ეს ორჯერ დაბრუნდა: 2026-10-07 და SABA-B-12.
- **root:**
  - ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS: პასუხს ელოდება. gate 434-ის Architecture note მის Q4-ს ემატება.
  - ROOT-REQ-PLAYWRIGHT-FIREFOX: ხელახლა მოთხოვნილია.

## 13. შემდეგი
1. **Round 435:** ეს RETRO. C ამოწმებს traceability-ს; A არაფერს აკეთებს.
2. **REGRESSION-2026-11-13:** პირველ დაგეგმვაზე, რომელიც 2026-11-13-ზე ან მის შემდეგ ხდება. ემატება REG-PERF-FULL-SUITE.
3. **COPY-PD-VIS:** STUDIO-VIS-4/6/7/10 + SABA-LANE-RESIZE-HANDLE, + SR-435-2; Q4-ის default.
4. **SYS-R435-SOURCE-SCAN-HELPER.**
5. **შემდეგ რიგით:** SYS-1 → SYS-3 → STORE-REDESIGN 2b…5 → ARCH-SPLIT (L37-ის perf clause უკვე ძალაშია) → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule).
6. **STEM-LANES:** წინ წავა, როგორც კი Saba უპასუხებს.
7. **შემდეგი RETRO:** round 450, ან queue entry-ის დასრულებისას — რომელიც ადრე მოვა.
