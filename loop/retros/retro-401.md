# RETRO 401 — მეთოთხმეტე რეტროსპექტივა (რაუნდები 385–400)

**თარიღი:** 2026-11-08 · **ავტორი:** B (D-29z1372…D-29z1376) · **სტატუსი:** C ამოწმებს round 401-ში (RT-* row-ები).

**წესები:** „Retrospective: stop, look back, improve“ (Saba, 2026-10-26); „Look back on every issue Saba finds, and guard the whole screen“ (2026-10-28); RETRO-ზე გზის მიმოხილვა (2026-10-31); `backlog.json` → `retro_policy`.

**სახელი:** backlog-ში ძველი id-ები „RETRO 400“ / `RETRO-400` ამ ფაილს ეხება. RETRO round 401-ში ტარდება, რადგან round 400-ში PERF-14b-i-ის C-ის ბაგი (C-R399-01) სრულდებოდა (D-29z1369). ამიტომ `retro-400.md` არ არსებობს.

**კონსულტაციები** (read-only, ორივე რეალურად გამოძახებული; მათი verdict-ები მათი აზრია და ასეა მონიშნული):
- retro-სთვის: `tech-lead` (§3, §5, §7, §9, §10, §11);
- ეკრანისა და გზისთვის: `product-designer` (`user-review/screen-review-401.md`).

`consequence-tester`, `qa-engineer`, `design-philosopher` და `first-visit-host` B-ის კონსულტაციების სიაში არ არიან (2026-11-04 §6). არ გამომიძახებია და მათ სახელით აზრი არ დამიწერია. advisor ხელმისაწვდომია და გამოყენებულია დაგეგმვის მიდგომისთვის.

**ფანჯარა:** 385–400, ანუ 16 რაუნდი. round 385 თავად RETRO იყო და ფანჯარაში შედის, ისევე როგორც 369 შედიოდა retro 385-ში.

**ყველა რიცხვის წყარო** (გზები `tmp/studio-real-loop/`-ის მიმართ). სკრიპტები retro 385-ის ასლია, ფანჯრით 385–400. ისინი default-ად `b-round-400/data/`-ში წერენ. გაუშვით loop-ის root-იდან: `python3 -I b-round-400/<script>`.
- `collect.py` → `data/rounds-385-400.json`, `collect.txt`. `cost.py` → `data/cost-rows.json`, `cost.txt`. B-ის ღირებულება წანაცვლებულია: `b-round-(N−1)-result*.json` არის რაუნდ N-ის დაგეგმვა.
- ყველა მთავარი რიცხვი ერთად არის `data/retro-numbers-401.txt`-ში (ბრძანება: `b-round-400/retro-numbers.py`).
- დანარჩენი: `fails-detail.py`, `gate-reviews.py`, `classify.py` (`classify-out.json`), `l57-coverage.py`, `exp-fields.py`, `manifest-fields.py`, `awaiting-user.py`. `misc-outputs.sh` წერს `task-titles.txt`, `stops-count.txt`, `deferred-totals.txt`, `open-medium-plus.txt`, `archived-mediums.txt` და `c-models.txt`-ს.
- **სკრიპტებში ორი ცვლილებაა retro 385-ის შემდეგ:**
  - `stops-count.txt` ახლა regex-ით `^(\*\*|## )STOP` ითვლის. ძველმა ზუსტმა ფრაზამ „STOP — needs B ruling“ round 387 („STOP — B must rule“) და 394 („## STOP: needs a B ruling“) გამოტოვა.
  - `archived-mediums.txt`-ის ფილტრი ფანჯრის id-ებს იყენებს.
- **ახალი ამ RETRO-ში:**
  - `data/retro400-deadlines.txt`: backlog-ის ყველა ჩანაწერი, რომელიც „RETRO 400/401“-ს ასახელებს;
  - `data/l58-sketch-review-application.txt`: რომელ დაგეგმვას ჰქონდა sketch patch და `sketch-review.md`;
  - `data/new-clauses-applied.txt`: retro 385-ის ახალი clause-ები task-ებში (grep);
  - `data/l57-c400.txt`: `tools/l57-check.py` `c-round-400.json`-ზე.
- სკრიპტები კითხულობენ `b-round-400/backlog-before-401.json`-ს. ეს backlog-ის ასლია, აღებული ამ დაგეგმვის ყველა ცვლილებამდე.
- **შეზღუდვები:**
  - `classify.py` before-ასლის **ღია** ჩანაწერებს ითვლის, დახურულს არა (`cloud/optimize-backlog.py` დახურულს archive-ში გადაიტანს). დახურული Medium-ები ცალკე ჩანს `archived-mediums.txt`-ში.
  - `gate-reviews.txt`-ში 395, 396 და 400-ის `score None` parse-ის ხარვეზია: იმ `review.md`-ებში „Score: N/10“ ხაზი არ არის. ეს review-ის შედეგი არ არის.

---

## 1. მოკლედ
- **C: PASS 12 / FAIL 4 / BLOCKED 0.** FAIL-ები: 387, 391, 394, 399.
- **Gate:** published 9, skipped 7, failed 0. skipped-ია:
  - 385, რადგან RETRO იყო;
  - 389 და 390, რადგან REGRESSION-ში კოდი არ შეცვლილა;
  - 387, 391, 394 და 399, რადგან C-მ FAIL დაწერა.
- **ღირებულება $294.13:** B $181.15, A $98.51, C $14.47. B-ის წილია 61.6 %, round-ის მედიანა $19.16, B-ის მედიანა $11.28.
- **FAIL რაუნდები:** $101.13 (34.4 %). FAIL-ები გასწორებებთან ერთად (387–388, 391–392, 394–395, 399–400): **$156.23 (53.1 %)**.
- **ოთხივე FAIL რაუნდი A-ს STOP-ით დაიწყო** (`data/stops-count.txt`: 387, 391, 394, 399 — თითო 1). runner-მა C მაინც გაუშვა (ROOT-NOTE-R387-STOP-NOT-HONOURED), C-მ კი STOP-ი ბრაუზერში დაადასტურა.
- **Saba-ს ახალი ბაგი ფანჯარაში არ ყოფილა.** ეკრანი სიტყვასიტყვით ემთხვევა retro 385-ს (`user-review/screen-review-401.md`).

## 2. ციფრები (`data/retro-numbers-401.txt`, `cost.txt`, `collect.txt`)
| მაჩვენებელი | 369–384 (retro 385) | 385–400 (ეს) |
|---|---|---|
| C PASS / FAIL / BLOCKED | 13 / 1 / 2 | 12 / 4 / 0 |
| ჯამი | $320.36 | $294.13 |
| B / A / C | $195.21 / $102.83 / $22.32 | $181.15 / $98.51 / $14.47 |
| B-ის წილი | 60.9 % | 61.6 % |
| round-ის მედიანა | $19.63 | $19.16 |
| B / A / C მედიანა | $12.505 / $5.885 / $1.01 | $11.28 / $5.695 / $0.64 |
| A-ს STOP, რომელიც C-მდე მივიდა | 376, 382 | 387, 391, 394, 399 |
| L57: 12-ვე ველი ყველა C JSON-ში | 15/16 | 12/16 |

- **ყველაზე ძვირი რაუნდები:** 399 ($34.90), 393 ($25.47), 398 ($24.74), 387 ($23.52), 391 ($22.66) (`cost.txt` top5).
- **A-ს საშუალო:** FAIL რაუნდში $9.35, PASS-ში $5.09 (`cost.txt`). STOP-ამდე A თითქმის მთელ სამუშაოს ასრულებს.
- **RETRO 385 ღირდა $10.27, REGRESSION 389–390 — $18.75** (`retro-numbers-401.txt`).
- **C-ის მოდელი:** Sonnet (`c-models.txt`). C-ის მედიანა $0.64.
- **gate review:** 9 მიმოხილვაში 31 დანომრილი შენიშვნაა, Critical 0 (`gate-reviews.txt`).

## 3. FAIL-ები და ჯაჭვები: რატომ და რომელი წესი აიცილებდა (`data/fails-detail.txt`, `stops-count.txt`, `l58-sketch-review-application.txt`)
| რაუნდი | ფაქტი (წყარო) | მიზეზის კლასი (`tech-lead`-ის აზრი) | sketch-review | წესი, რომელიც აიცილებდა |
|---|---|---|---|---|
| 387 | `a-round-387.md` l.1: STOP A-R387-REVIEW-M1-ზე. `tick` meter-ებს `pumpPlaybackAudio`-ის შემდეგ შეამოწმებლად აჯამებს. C-მ ბრაუზერში გაიმეორა: C-R387-01, meter-ი −19.8 dB-ზე გაიყინა | აკლდა test ან helper: SF6 rAF-ს stub-ავს, `FakeAudioContext`-ს `createAnalyser` არ აქვს | აქვს (`b-round-386/sketch-review.md`, delta review) | L49: side-effect-ების ცხრილი stop-ის ახალი გზისთვის `tick`-ის შიგნით |
| 391 | `a-round-391.md` l.1: STOP D-29z1325-ის success rule-ზე (ორი clause ეწინააღმდეგება). C-R391-01: „Loading …“ ხაზზე დარჩა | task-ის ტექსტი თავის თავს ეწინააღმდეგება | არ აქვს (`b-round-390/`) | L4: ruling line |
| 394 | `a-round-394.md` l.3: STOP A-R394-REVIEW-M1-SEEK-BEFORE-PLAYING. C-R394-01: HOLD-ში wave click-ის შემდეგ fallback არ ჩაირთო | აკლდა acceptance row: gesture degraded state-ში (RC-R394) | არ აქვს (`b-round-393/`) | L58-ის matrix degraded state × gesture-ით. ახლა ეს L4-ის ახალი clause-ია (§10) |
| 399 | `a-round-399.md` l.3: STOP R-b-ზე. C-R399-01: virtualization-ში Ctrl+D-ის ასლი არ ჩანს | task-ის ტექსტი ეწინააღმდეგება (R-b vs „equal HEAD“). L58 არ გამოყენებულა: B-ს migrated interactions spec sketch-ზე არ გაუშვია (`c-round-399.json` `affectedChecksRunOnSketch`) | აქვს, მაგრამ harness patch-ის ხელახალი review გადაიდო (`b-round-398/sketch-review.md`, „Split after review“) | L58-ის უპირობო clause. ახლა მას ემატება „Pre-step rules“ (§10) |

- **საერთო ფაქტი:** ოთხივე FAIL ზუსტად ოთხივე STOP-ს ემთხვევა. C ყველაზე მაინც გაეშვა (ROOT-NOTE-R387-STOP-NOT-HONOURED). C-ის ღირებულება ოთხ რაუნდში $2.68-ია (`cost.txt`). ჯაჭვები კი $156.23 ღირს (`retro-numbers-401.txt`).
- **origin-ის ხელახალი მონიშვნა (D-29z1376, `tech-lead`):**
  - C-მ 387 მონიშნა `C`-ად, 391 კი `A (open STOP)`-ად (`manifest-fields.txt`).
  - მიზეზით ორივე B-ისაა: 387 B-ის reviewed sketch-ში დარჩენილი Medium-ია, 391 task-ის ორი clause-ის კონფლიქტი.
  - ამიტომ B-origin FAIL **4/16**-ია (retro 385-ში 1/16). RC-R401-ORIGIN-RETAG watch-ზეა.
- **sketch review-ის გარეშე გაგზავნილი sketch:** 4 დაგეგმვა 15-დან: 388, 391, 394 და 395 (`l58-sketch-review-application.txt`). აქედან 391 და 394 ჩავარდა. L58 ამ review-ს ითხოვდა, მაგრამ შემოწმებადი claim არ ჰქონდა. ამიტომ L58-ს ემატება `[K#]` claim (§10).

## 4. Findings-ის კლასიფიკაცია (`data/classify.txt`; regex-კატეგორიები retro 353-ისაა)
- **`open_findings`:** ფანჯარაში ღია ჩანაწერი 5-ია (info 3, low 1, medium 1); წარმოშობით C 4, gate 1. Medium = C-R399-01. ის ამ დაგეგმვაზე დაიხურა (D-29z1371).
- **`deferred_low_polish`:** ფანჯარაში 44 (low 42, info 2). წარმოშობით:
  - A 25;
  - gate reviewer 13;
  - C 4;
  - B 2.
- **დაკეტილი Medium-ები** (`archived-mediums.txt`): C-R387-01, C-R391-01 და C-R394-01. სამივე შემდეგ რაუნდში გასწორდა და გამოქვეყნდა.
- **კატეგორიები (deferred):**
  - uncategorised 15;
  - timing/audio 10;
  - tests/harness 5;
  - docs/process 5;
  - focus 4;
  - keyboard 3;
  - layout/visual 2.

  რეგექსი preview-stream-ის Lows-ს ხშირად „focus“-ად ან „keyboard“-ად ჯგუფავს, მაგალითად B-R395-PURCHASED-DUP-URL და GATE395-L1-CURRENTTIME-READ. ამიტომ §11 მათ id-ით აჯგუფებს.
- **ჯამი** (`deferred-totals.txt`): `deferred_low_polish` 769, `open_findings` 1114. ეს before-ასლის რიცხვებია.

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **387:** A-ს reviewer-მა Medium იპოვა და STOP დაწერა. ეს სწორად მუშაობდა. სისუსტე fake-შია: `FakeAudioContext`-ს analyser არ აქვს და SF6 rAF-ს stub-ავს. **SYS-R388-FAKE-WEB-AUDIO-HELPER** რიგში დგება SYS-R2-FAKE-FIDELITY-ის გვერდით (D-29z1374). L52-ის ბოლო clause (captured rAF callback) ამ კლასს უკვე ფარავს, მტკიცებულებით C-R387-01 (`lessons.md` l.36).
- **391 და 399:** task-ის ორი წესი ერთ ელემენტზე. L4-ის ruling line არსებობდა, მაგრამ sketch-ზე გაშვება (L58) არ მომხდარა. 399-ში ის არ მომხდარა virtualization-ის sketch-ზე, 391-ში review-ც კი არ ყოფილა.
- **394:** watchdog-ის row-ები stall-ს (R1) და false positive-ს (R3) ცალ-ცალკე ამოწმებდა. gesture HOLD-ის შიგნით არცერთ row-ს არ ჰქონდა (RC-R394).
- **shared helper:** preview controller-ის re-entrancy-სა და supersession-ის Lows ერთ კლასად იკრიბება (§11). მათ ARCH-CHECKPOINT-PREVIEW-AFTER-13C ელოდება.

## 6. Saba-ს ნაპოვნი საკითხები და ეკრანი
- **ფანჯარაში Saba-ს ახალი SABA-B-* ბაგი არ ყოფილა.** ამ წყაროდან ახალი lesson საჭირო არ არის.
- **ეკრანი:** ოთხივე ხედის ტექსტი სიტყვასიტყვით ემთხვევა 385-ს: 138/168/118/144. timeline-ისა და library-ს გარეთ 97/124/86/101-ია (`b-round-400/screens/compare-385-401.txt`, `capture.log`). ახალი კანდიდატი არ არის.
- **გზა:** „Personal Mixdown“ ისევ stem-ების დამატებაზე ირღვევა. stem-ები ერთმანეთის მიყოლებით დგას: 512/1152/1792/2432 px. ამას ფარავს STEM-LANES. ახალი ხარვეზი არ არის.
- **„1 audio files“:** უკვე STORE-4-ის acceptance-შია (PD-REVIEW F3, Saba 2026-10-31).

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
- **ახალი SYS id არ იქმნება.** `tech-lead` (აზრი): preview-ის კლასისთვის L46-ის ვადა და default ჯობია ახალ SYS-ს, რადგან SYS-R369-ის მსგავსად დაელოდებოდა. B ეთანხმება: ARCH-CHECKPOINT-PREVIEW-AFTER-13C-ის ვადაა RETRO 416. default ერთი შეზღუდული preview-controller ამოცანაა (D-29z1374).
- **lessons-ის merge (`tech-lead`-ის წინადადება: l.43-ის pointer L57-ში ჩაიშალოს) არ გავაკეთე.** ხაზი თავისუფალი არ გვჭირდება და diff ნაკლებია. ხაზების რიცხვი 60-ია.
- **`tech-lead`-მა თქვა, რომ L58-ის ახალი clause ნაწილობრივ იმეორებს არსებულს და checker-ი უფრო ღირებულია.** B-მ ორივე ერთ clause-ში გააერთიანა: pre-step წესი და `sketch-review.md`-ის `[K#]` claim. checker-ი B-ის საკუთარ claims-ში ცხოვრობს და `tools/`-ის ცვლილებას არ ითხოვს.
- **SYS-R385-ის ადგილი:** „PERF-11c-iii-d/e-მდე“ რიგში არაფერს ნიშნავს, რადგან d/e-ს slot არ აქვს. `tech-lead` (აზრი): PERF-14c-ის შემდეგ, PERF-15-მდე. 14b-ii ArrangementLane-ს ფლობს და sketch მოძველდებოდა. B ეთანხმება. PERF-15-ის გადაკვეთა B-მ არ შეამოწმა. ეს მისი დაგეგმვის დროს შემოწმდება.
- **REGRESSION:** 2026-11-10-ის შემდეგ პირველ დაგეგმვაზეა დანიშნული (`regression-last.json` 2026-11-07, round 390). round 402-ის დაგეგმვა თუ ამ თარიღზე ან უფრო გვიან მოხდება, REGRESSION PERF-14b-ii-ს წინ წავა.

## 8. ღია კანდიდატებისა და ვადების ბედი (`data/retro400-deadlines.txt`)
| ჩანაწერი | ბედი (D-29z1373/D-29z1374) |
|---|---|
| ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING (ვადა RETRO 400) | პასუხი არ არის (`user-review/questions-arch-leaf-plumbing.md`, პასუხის ხაზი ცარიელია). default: **SYS-R385-LEAF-ACTIONS-CONTEXT `queued`**, PERF-14c-ის შემდეგ, PERF-15-მდე. Saba-ს პასუხი dispatch-მდე default-ს ცვლის |
| SYS-R369-STEM-CACHE-WRITE-COORDINATOR (ვადა RETRO 400) | root-ის პასუხი არ არის. default: **`queued`**, უშუალოდ STEM-LANES-მდე |
| SYS-R388-FAKE-WEB-AUDIO-HELPER | candidate → `queued`, SYS-R2-FAKE-FIDELITY-ის გვერდით |
| ARCH-CHECKPOINT-PREVIEW-AFTER-13C | root-ს round 396-იდან ელოდება. L46-ის ვადაა RETRO 416, default — preview-controller-ის ამოცანა (§11) |
| RC-R394-GESTURE-IN-DEGRADED-STATE | applied: L4 |
| RC-R399-RULE-NOOP-AT-HEAD | applied: L58 |
| B-R382-SCOPED-LOCATORS | retired: 385–400-ში მეორე შემთხვევა არ არის (grep `.first()` / strict mode, 0) |
| RC-R305-LESSON-CHAR-CAP | watch RETRO 416-მდე: L23 5058, L58 4335 bytes (< 5500) |
| RC-R401-ORIGIN-RETAG (ახალი) | watch RETRO 416-მდე |

## 9. countermetric-ები: retro 385-ის §9 → შედეგი
| retro 385-ის სამიზნე | შედეგი 385–400 (წყარო) |
|---|---|
| A-ს მიერ B-ის sketch-ზე ნაპოვნი გადაუწყვეტელი Medium+: 0 | **2/16** (387, 394; `a-round-387.md` l.1, `a-round-394.md` l.3). ჩავარდა, უკვე მეორე ფანჯარაა |
| B-ის წარმოშობის C FAIL: ≤ 3 | C-ის tag-ებით 2 (394, 399). ხელახალი მონიშვნით **4** (§3). ჩავარდა |
| დროის გამო BLOCKED: 0 | **0** (`collect.txt`). მიღწეულია |
| B-ის მედიანა < $13.94 | **$11.28**. მიღწეულია. B-ის წილი 61.6 % (იყო 60.9 %) |
| L57 16/16 | **12/16**: 386, 390, 391 და 392-ში ველები აკლია (`l57-coverage.txt`). ჩავარდა |
| lessons 60; L58 < 5500 bytes | 60 ხაზი; L58 3717 → 4335 bytes. მიღწეულია |
| ახალი clause-ები გამოყენებულია | GC×2: 393, 394; `progressFile`: 393–400 (8 task); covering 50 %: 387, 388; recipe: 386, 387, 388, 393, 394, 398 (`new-clauses-applied.txt`) |
| ARCH-ზე პასუხი ან default ამოცანა | პასუხი არ მოსულა. default დაიგეგმა (§8) |
| SYS-R369-ის გადაწყვეტილება | default: `queued` STEM-LANES-მდე |

**RETRO 416-ისთვის** (`tech-lead`, `retro_policy.signals_for_next_retro`):
1. A-STOP რაუნდები, რომლებიც C-მდე მივიდა: ≤ 1 (ახლა 4/16).
2. sketch patch `sketch-review.md`-ის გარეშე: 0 (ახლა 4/15).
3. A-ს მიერ B-ის sketch-ზე ნაპოვნი გადაუწყვეტელი Medium: 0 (ახლა 2/16).
4. ხელახლა მონიშნული B-origin C FAIL: ≤ 1 (ახლა 4).
5. L57: 16/16 (ახლა 12/16).
6. გასწორების ჯაჭვების წილი ღირებულებაში: < 30 % (ახლა 53.1 %). დამატებით: B-ის მედიანა, L23/L58 bytes და ARCH-CHECKPOINT-PREVIEW-AFTER-13C-ის ბედი.

## 10. ცვლილებები: lessons
`lessons.md` **60 ხაზია**, ახალი ხაზი არ დამატებულა. before-ასლი: `b-round-400/lessons-before-401.md`. diff: `b-round-400/lessons-diff.txt` (`3c3 9c9 41c41`). სკრიპტი: `b-round-400/edit-lessons.py`. ყველა clause-ის ავტორია `tech-lead`, B-ის ფორმულირებით.
- **l.3:** pointer → retro-401 (ფანჯარა 385–400) და RETRO 401-ის შენიშვნა.
- **L4 (l.9), „Degraded state × gesture“:** watchdog/timeout/stall-ის ფიქსს აქვს row, რომელიც ფუნქციის ყველა gesture-ს degraded state-ის დროს იმეორებს, mutant-ით. მტკიცებულება: C-R394-01.
- **L58 (l.41), „Pre-step rules and the review claim“:** წესი, რომელიც გაზომვის წინ მოქმედებას ამატებს, B-ს sketch-ზე ყველა spec-ისთვის აქვს გაშვებული, ან პირობითად წერია. ყველა sketch-იან დაგეგმვას აქვს `[K#]` claim: `sketch-review.md` არსებობს და dispatched sha256-ს ასახელებს. მტკიცებულება: C-R399-01 და დაგეგმვები 388, 391, 394, 395.
- L23 უცვლელია (5058 bytes). L58 ახლა 4335 bytes-ია.

## 11. სისტემური ამოცანა
- **ახალი SYS id არ არის** (§7).
- **preview controller-ის კლასი** (`tech-lead`). ერთი მიზეზი შვიდ Low-ს აქვს: re-entrancy და supersession library preview-ში. ესენია:
  - GATE393-L3-FALLBACK-REENTRY;
  - A-R394-REVIEW-L3-REENTRANT-SYNC-THROW;
  - A-R395-REVIEW-L1-SEEK-REENTRANT;
  - GATE395-L1-CURRENTTIME-READ;
  - A-R392-REVIEW-L2-STALE-CALL-STOPS-PREVIEW;
  - A-R392-REVIEW-L3-SUPERSESSION-BY-ID;
  - A-R393-REVIEW-L3-URL-SWITCH-ROWS.

  მათ დახურავს ARCH-CHECKPOINT-PREVIEW-AFTER-13C-ის default ამოცანა, თუ root RETRO 416-მდე არ უპასუხებს.
- **perf spec-ის Lows** უკვე PERF-14b-ii-ის input-ებია: A-R399-REVIEW-LOWS, A-R399-REVIEW-PLANNER-PATCH-LOWS, A-R400-REVIEW-SPEC-LOWS, GATE398-L1-L5 და C-R397-NOTE-LONGTASK-1280.
- **fake-ის Lows** SYS-R388-ს ეკუთვნის: A-R388-REVIEW-L3-SF11-SETINTERVAL-STUB / A-R388-REVIEW-L4-SF11-REAL-CLOCK და 387-ის `createAnalyser`-ის ხარვეზი.

## 12. Saba-სთვის და root-ისთვის (წინადადებები და კითხვები; loop-ში არ სრულდება)
1. **root, ROOT-NOTE-R387-STOP-NOT-HONOURED (4×):** ამ ფანჯრის ყველა C FAIL A-ს STOP-ით დაიწყო, რომელიც runner-მა C-ს გადასცა. წინადადება: A STOP → პირდაპირ B-თან, C-ის გარეშე. ეს C-ის მხოლოდ $2.68-ს დაზოგავდა, მაგრამ მთავარი სარგებელი STOP-ის გადაწყვეტის ერთ რაუნდში მოხვედრაა.
2. **root, ARCH-CHECKPOINT-PREVIEW-AFTER-13C** round 396-იდან ელოდება (`b-round-393/root-request-arch-checkpoint-preview.md`, ARCH-CHECKPOINT-DECODE-REGION-თან ერთად). ვადაა RETRO 416.
3. **Saba, `user-review/questions-arch-leaf-plumbing.md`** ისევ ღიაა. default (B-actions) უკვე რიგშია. თუ პასუხი SYS-R385-ის dispatch-მდე მოვა, ის default-ს შეცვლის.
4. **Saba, Q-SR-385-1:** „Try it in the Studio“-ს ადგილი (მხოლოდ კითხვა).
5. **root, ROOT-REQ-B-RETRO-CONSULTS** ისევ ღიაა: `consequence-tester` და `qa-engineer` B-ის სიაში არ არიან. ROOT-REQ-L57-CHECK-PROGRESS-იც ღიაა.
6. **root (ინფორმაცია):** gate-ის `review.md`-ებში 395, 396 და 400-ზე „Score: N/10“ ხაზი არ არის. `gate-reviews.py` მას ვერ კითხულობს.

## 13. შემდეგი
- **round 401:** ეს RETRO. C ამოწმებს RT-* row-ებს.
- **round 402:** PERF-14b-ii, თუ იმ დაგეგმვაზე REGRESSION-2026-11-10 ჯერ არ არის დანიშნული. dispatch-მდე `b-round-398/sketch-14bii-lane.patch.txt`-ში გასწორდება TL-R398-SK-M1 (window `blur` unpin, სამივე listener-ის მოხსნა) და TL-R398-SK-L1. შემდეგ თავიდან გაეშვება VZ და mutant-ები და დაიწერება delta review (L58, ახალი claim).
- **რიგი შემდეგ** (D-29z1375):
  1. PERF-14c;
  2. SYS-R385-LEAF-ACTIONS-CONTEXT;
  3. PERF-15;
  4. SYS-R2-FAKE-FIDELITY + SYS-R388;
  5. SYS-CLOCK-DETERMINISM;
  6. SYS-R369;
  7. STEM-LANES;
  8. SYS-1…3;
  9. STORE-2b…5;
  10. REVIEW-RECOMMENDATIONS;
  11. T12-ADVANCED;
  12. phase 2 (skip rule).
- **შემდეგი RETRO:** round 416 ან STUDIO-PERFORMANCE-ის დასრულება, რომელიც უფრო ადრე მოვა.
