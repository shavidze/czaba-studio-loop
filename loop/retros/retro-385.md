# RETRO 385 — მეცამეტე რეტროსპექტივა (რაუნდები 369–384)

**თარიღი:** 2026-11-07 · **ავტორი:** B (D-29z1288…D-29z1292) · **სტატუსი:** C ამოწმებს round 385-ში (RT-* row-ები).

**წესები:** „Retrospective: stop, look back, improve“ (Saba, 2026-10-26); „Look back on every issue Saba finds, and guard the whole screen“ (2026-10-28); RETRO-ზე გზის მიმოხილვა (2026-10-31); `backlog.json` → `retro_policy`.

**სახელი:** backlog-ში ძველი id-ები „RETRO 384“ / `RETRO-384` ამ ფაილს ეხება. RETRO round 385-ში ტარდება, ამიტომ ფაილის სახელი `retro-385.md`-ია, ისევე როგორც retro-369 ჩატარდა round 369-ში. `retro-384.md` არ არსებობს: round 384 PERF-13b-i იყო (D-29z1288).

**კონსულტაციები** (read-only, ორივე რეალურად გამოძახებული; მათი verdict-ები მათი აზრია და ასეა მონიშნული):
- retro-სთვის: `tech-lead` (§3, §7, §9, §10, §11);
- ეკრანისა და გზისთვის: `product-designer` (`user-review/screen-review-385.md`).

`consequence-tester`, `qa-engineer`, `design-philosopher` და `first-visit-host` B-ის კონსულტაციების სიაში არ არიან (2026-11-04 §6). არ გამომიძახებია და მათ სახელით აზრი არ დამიწერია. B-მ advisor-იც გამოიყენა დაგეგმვის მიდგომისთვის (ხელმისაწვდომია, გამოყენებულია).

**ფანჯარა:** 369–384, ანუ 16 რაუნდი. round 369 თავად RETRO იყო და ფანჯარაში შედის, როგორც 353 retro 369-ში. `retro_policy.next_due` იყო round 384. RETRO ერთი რაუნდით გადაიწია: round 384-ში PERF-13b-i-ის Medium-ის (C-R382-01) შემოწმება მთავრდებოდა.

**ყველა რიცხვის წყარო** (გზები `tmp/studio-real-loop/`-ის მიმართ). სკრიპტები retro 369-ის ასლია, ფანჯრით 369–384, და default-ად `b-round-384/data/`-ში წერენ. გაუშვით loop-ის root-იდან: `python3 -I b-round-384/<script>`.
- `collect.py` → `data/rounds-369-384.json`, `collect.txt`; `cost.py` → `data/cost-rows.json`, `cost.txt`. B-ის ღირებულება წანაცვლებულია: `b-round-(N−1)-result*.json` = რაუნდ N-ის დაგეგმვა.
- ყველა რიცხვი ერთად: `data/retro-numbers-385.txt` (ბრძანება: `b-round-384/retro-numbers.py`).
- დანარჩენი სკრიპტები და მათი output-ები:
  - `fails-detail.py` → `fails-detail.txt`;
  - `gate-reviews.py` → `gate-reviews.txt`;
  - `classify.py` → `classify.txt`, `classify-out.json`;
  - `l57-coverage.py` → `l57-coverage.txt`;
  - `exp-fields.py`, `manifest-fields.py`;
  - `awaiting-user.py` → `awaiting-user.txt`;
  - `misc-outputs.sh` → `task-titles.txt`, `stops-count.txt`, `deferred-totals.txt`, `open-medium-plus.txt`, `archived-mediums.txt`, `c-models.txt`.
- ახალი ამ RETRO-ში:
  - `data/retro384-deadlines.txt`: ყველა backlog-ის ჩანაწერი, რომელიც „RETRO 384“-ს ასახელებს;
  - `data/l58-l30-application.txt`: L58 sketch-review-ისა და L30 perf-lib pre-run-ის გამოყენება;
  - `data/retro-candidates-open.txt`.
- სკრიპტები კითხულობენ `b-round-384/backlog-before-385.json`-ს: backlog-ის ასლს, აღებულს ამ დაგეგმვის ყველა ცვლილებამდე.
- **შეზღუდვა:** `cloud/optimize-backlog.py` დახურულ findings-ს `archive/findings-archived.json`-ში გადაიტანს. ამიტომ `classify.py`-ის ფანჯრის რიცხვები before-ასლის **ღია** ჩანაწერებს ითვლის და დახურულს არა. დახურული Medium-ები ცალკე ჩანს `archived-mediums.txt`-ში (C-R382-02).

---

## 1. მოკლედ
- **C: PASS 13 / FAIL 1 / BLOCKED 2.** FAIL: 382. BLOCKED: 376, 383. **Gate: published 12 / skipped 4 / failed 0.** skipped: 369 RETRO, 376, 382, 383.
- **ღირებულება $320.36:** B $195.21, A $102.83, C $22.32. B-ის წილი 60.9 %, round-ის მედიანა $19.63, B-ის მედიანა $12.505.
- **არაPASS რაუნდებისა და მათი გასწორებების ღირებულება:** 376–377 $36.78; 382–384 $54.07; ჯამი $90.85.
- **L57:** ველები 15/16 C JSON-შია (383-ში არ არის); `origin` 4/4 bug-ზე.
- **ეკრანზე არაფერი შეცვლილა:** 138/168/118/144, retro 369-ის ტოლი (`b-round-384/screens/compare-369-385.txt`). Saba-ს ახალი ბაგი ფანჯარაში არ ყოფილა.
- **დასრულდა:**
  - PERF-11a (370);
  - PERF-11c-i, 11c-ii-a/b, 11c-iii-a/b/c1/c2a/c2b (371–379);
  - PERF-12a (380);
  - PERF-13a (381);
  - PERF-13b-i (382–384, gate `7295618`).

## 2. ციფრები (`data/retro-numbers-385.txt`, `cost.txt`, `collect.txt`)
| მაჩვენებელი | 369–384 | retro 369 (353–368) |
|---|---|---|
| რაუნდები | 16 | 16 |
| C PASS / FAIL / BLOCKED | 13 / 1 / 2 | 13 / 3 / 0 |
| gate published / skipped / failed | 12 / 4 / 0 | 12 / 4 / 0 |
| ჯამი | $320.36 | $287.91 |
| B / A / C | $195.21 / $102.83 / $22.32 | $173.19 / $99.77 / $14.95 |
| B-ის წილი | 60.9 % | 60.2 % |
| round-ის მედიანა | $19.63 | $16.73 |
| ფაზის მედიანა B / A / C | $12.505 / $5.885 / $1.01 | $11.46 / $6.07 / $0.76 |
| STOP ხაზი `a-round-N.md`-ში (`stops-count.txt`) | 376, 382 (2) | 357, 361, 363, 367 (4) |
| არაPASS რაუნდების ღირებულება | $70.84 (376, 382, 383) | $54.00 |
| top 5 რაუნდი | 380 $36.94, 382 $29.19, 373 $28.24, 375 $25.31, 376 $24.37 | 365, 366, 367, 360, 361 |

- **B-ის მედიანა** $12.505-ია: stop line-ის ($13.94) ქვემოთ, მაგრამ +$1.05 retro 369-თან შედარებით. ყველაზე ძვირი B-ის დაგეგმვა იყო 373 ($18.92), 375 ($17.44), 380 ($17.98) და 376 ($16.05): PERF-11c-ის leaf-ებისა და PERF-12a-ის sketch-ები. **inference:** ზრდა sketch-ზე დაფუძნებული დაგეგმვიდან მოდის, რომელსაც L58 ითხოვს.
- **C-ის ღირებულება გაიზარდა** ($14.95 → $22.32), მაგრამ მედიანა მაინც $1.01-ია. ზრდა სამ რაუნდზეა: 377 $3.54, 380 $2.97, 382 $3.93. სამივეში C-მა advisor-იც გამოიყენა (`c-models.txt`: `claude-fable-5-1`).

## 3. FAIL/BLOCKED და ჯაჭვები: რატომ და რომელი წესი აიცილებდა (`data/fails-detail.txt`, `a-round-N.md` STOP ხაზები)
| რაუნდი | რა მოხდა (ფაქტი, წყარო) | კლასი (`tech-lead`-ის აზრი) | წესი: არსებობდა / იცვლება |
|---|---|---|---|
| 376 BLOCKED | A-მ STOP გააკეთა (`a-round-376.md` l.3): TC10 დატვირთვისას 5 s-ის 62 %-ს იკავებდა (C standalone-ზე 33 %, `c-round-376.md`); reviewer-ის M1-ს („Edit group“-ის სტაბილურობის row არ არის") ruling არ ჰქონდა. 377-მა ორივე გადაწყვიტა და PASS მიიღო. | B-ის დაგეგმვა: წესები ერთმანეთს ეწინააღმდეგებოდა. L11 A-ს STOP-ს ავალებს ყველა covering ტესტზე, რომელიც 50 %-ს აჭარბებს; L31 B-ს მხოლოდ იმ ფაილების შემოწმებას ავალებს, რომლებსაც row-ები ემატება. TC10-ის ფაილი არ შეცვლილა. M1: L58 არსებობდა, მაგრამ არ გამოიყენეს. | **L31 იცვლება** (§10): covering set-იც. |
| 382 FAIL | C-R382-01 (Medium): 150.37 s hero buffer React updater-ის closure-ში რჩებოდა (D-29z1277). round sketch-ის გარეშე გაიგზავნა (`data/l58-l30-application.txt`). K32 („other holders release it") წყაროს წაკითხვით დამტკიცდა. C-R382-02 C-ის locator-ის შეცდომა იყო. A-ს STOP-ი (M2) L4-ის ტიპის ორი clause-ის შეჯახება იყო. | B-ის pre-check-მა არასწორი მეთოდი გამოიყენა: release-ს მხოლოდ Chromium-ის GC×2 liveness/heap probe ამტკიცებს. წარმოშობა შერეულია: B premise + A + HEAD-ზე უკვე არსებული updater. | **წესი არსებობდა, მაგრამ ვერ ამბობდა, როგორ დამტკიცდეს release** → **L58 clause** (§10). |
| 383 BLOCKED | C-ს დრო ამოეწურა: production heap, PERF-RES, mutant-ები არ გაეშვა; `progress.json` და L57 ველები არ იყო; auth row bare URL-ით 400-ს იღებდა (`c-round-383.json`). 384-მა იგივე row-ები გაიარა. | C-ის დროის მართვა. L59 სიტყვასიტყვით არსებობდა: **მესამედ არ შესრულდა** (340, 341, 383). `tools/l57-check.py` ამას არ ამოწმებს. | **L59 clause** (heaviest first, `progressFile`/`stopSignal`); checker = ROOT-REQ-L57-CHECK-PROGRESS. auth recipe → **L29 clause**. |

- **ფანჯრის counter-ი „A-ს მიერ B-ის sketch-ზე ნაპოვნი გადაუწყვეტელი Medium":** 2/16 (376 M1, 382 M2). სამიზნე 0 იყო, retro 369-შიც 2/16 იყო. **inference:** L58-ის sketch-review-ის clause ფანჯრის ბოლოს აღარ გამოიყენებოდა: 380–383-ის დაგეგმვას `sketch-review.md` არ ჰქონდა, მათ შორის 382-ს.
- **B-ის წარმოშობის C FAIL:** 1/16 (382, ნაწილობრივ). ზღვარი 3 იყო; retro 369-ში იყო 3/16.

## 4. Findings-ის კლასიფიკაცია (`data/classify.txt`; regex-კატეგორიები retro 353-ისაა)
- **open_findings, ფანჯრის ID-ები:** 46. წარმოშობა: A 19, C 11, gate 11, B 5. severity: Medium 1, Low 29, info 16. კატეგორია: keyboard 11, uncategorised 11, tests/harness 8, focus 8, timing/audio 4, a11y 2, layout/visual 1, docs/process 1.
- **deferred_low_polish, ფანჯრის ID-ები:** 32, ყველა Low. წარმოშობა: A 14, gate 11, B 7. კატეგორია: tests/harness 9, keyboard 6, timing/audio 6, uncategorised 4, focus 3, დანარჩენი 1–1.
- **ჯამში (before-ასლი):** `deferred_low_polish` 715, `open_findings` 1106, `awaiting_user` 96 ID (`awaiting-user.txt`).
- **ფანჯრის ერთადერთი Medium bug:** C-R382-01. C-R382-02 გადაკლასიფიცირდა: C-მა transport-ის Stop დააჭირა library-ის Stop-ის ნაცვლად (B-R382-SCOPED-LOCATORS). გაუქმებული Medium-ია, რეალური ბაგი არა.
- **gate review-ები** (`gate-reviews.txt`): 12 `review.md`, critical 0, დანომრილი suggestion 8 (374: 3, 384: 5). gate 384-ის suggestion 1 Medium-ია: GATE384-M1-ENSURE-DECODED-UNHANDLED-REJECTION, round 386-ის ბაგი (D-29z1287).
- **ფესვური მიზეზები (inference, B):**
  - ფანჯრის Low-ების დიდი ნაწილი PERF-11c-ის leaf-რაუნდებიდანაა: memo comparator-ები, wrapper-ები, action hook-ები (GATE371-L2, GATE375-L1/L2, GATE378-L2, GATE379-L3, A-R376-REVIEW-L1…L3). ყველა ერთ ღია არქიტექტურულ კითხვაზე მიდის: ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING (§8).
  - „regression from an unrelated change“ ერთია: C-R382-01. updater HEAD-შიც იყო; eviction-მა გამოაჩინა (D-29z1277).

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **382 (C-R382-01):** B-ის K32 premise („other buffer holders release it“) სამ ცნობილ holder-ს ამოწმებდა: peaks, preview, stem-cache. React-ის updater closure-ის retention-ს jsdom ვერ ხედავს. browser heap-retainer probe sketch-ზე (`b-round-382/probe/heap-retainers.mjs`) round 382-მდე დაიჭერდა. round 382 sketch-ის გარეშე გაიგზავნა: `b-round-381/`-ში `sketch-review.md` არ არის (`data/l58-l30-application.txt`).
- **382 (C-R382-02):** სახელით scope-იანი locator, რადგან „Stop“ ორი ღილაკის სახელია (B-R382-SCOPED-LOCATORS, B-R382-DUP-STOP-NAME).
- **383:** L59 უკვე არსებობდა, მაგრამ არ გამოიყენეს: არ იყო `progress.json`, არ იყო L57 ველები, stop signal არ დასახელდა (C-R383-L59-EARLY-STOP). row-ების რიგი „ყველაზე მძიმე მტკიცებულება ჯერ“ round 384-ში დაიწერა და იმუშავა.
- **383/382 auth:** auth row-ის URL-ი ვალიდაციაზე ჩერდებოდა (400) და 401-ის branch-ს ვერ აღწევდა; ანგარიშში კი „401 verified“ ეწერა (B-R383-AUTH-ROW-BARE-URL, C-R382-AUTH-CLAIM-MISMATCH).

## 6. Saba-ს ნაპოვნი საკითხები და ეკრანი
- **ფანჯარაში Saba-ს ახალი SABA-B-* ბაგი არ ყოფილა.** L47/L48-ის მსგავსი ახალი lesson ამ წყაროდან არ არის საჭირო.
- **ეკრანი:** ოთხივე ხედის ტექსტი სიტყვასიტყვით ემთხვევა 369-ს. ახალი კანდიდატი არ არის; Saba-სთვის ერთი კითხვაა: Q-SR-385-1 (`user-review/screen-review-385.md`).
- **გზა:** „Personal Mixdown“ ისევ stem-ების დამატებაზე ირღვევა: ოთხი stem ერთმანეთის მიყოლებით დგება ერთ ხაზზე (512/1152/1792/2432 px). ამას STEM-LANES ფარავს. export-ის შემოწმება გზის row-ს დაემატა STEM-LANES-ის `scope_additions`-ში (D-29z1288).

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
- **ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING:**
  - `tech-lead` (აზრი): (B)-ის actions ნახევარი და d/e-ის შეჩერება.
  - B ეთანხმება და კითხვას Saba-ს უგზავნის L46-ით. root-ს ის 11 echo-ს განმავლობაში ჰქონდა.
  - B შეგნებულად **არ** იწყებს d/e-ს pattern A-თი, რომ ძირითადი სამუშაო არ შეჩერდეს. PERF-13b-ii/13c/13d მასზე არ არის დამოკიდებული.
- **round 385 = RETRO და არა GATE384-M1-ის გასწორება.** bug gate-ით Medium პირველია, მაგრამ RETRO კოდს არ ცვლის. RETRO-ს ვადა უკვე გადაცილებული იყო, ანალიზი კი მზადაა. M1 არც უსაფრთხოებაა და არც მონაცემების დაკარგვა. ამიტომ round 386 = M1 + A-R383-REVIEW-L1 (ერთი ფუნქცია, D-29z1291). REGRESSION მის შემდეგ მოდის.
- **`tech-lead`-ის L59 წინადადება** („`l57-check.py` ჩავარდება") გადავაკეთე: `tools/` B-ის საკუთრება არ არის, ამიტომ წესი C-ის ველებს ითხოვს და checker-ის ცვლილება root-ის მოთხოვნაა.

## 8. ღია კანდიდატებისა და ვადების ბედი (`data/retro384-deadlines.txt`, `data/retro-candidates-open.txt`)
| ჩანაწერი | ბედი (D-29z1289/D-29z1290) |
|---|---|
| ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING (ვადა RETRO 384) | Saba-ს: `user-review/questions-arch-leaf-plumbing.md`. default: d/e ჩერდება; RETRO 400-ზე პასუხი თუ არ იქნება → SYS-R385-LEAF-ACTIONS-CONTEXT ჩვეულებრივი ამოცანაა |
| PERF-11c-iii-d/e (ვადა RETRO 384) | hold, იგივე default |
| SYS-R369-STEM-CACHE-WRITE-COORDINATOR | root-ის პასუხი არ არის; RETRO 400-ზე default: PERF-13-ის შემდეგ ჩვეულებრივი ამოცანა |
| RC-R305-LESSON-CHAR-CAP | watch RETRO 400-მდე: L23 5058, L58 3717 bytes (< 5500) |
| B-R365-COUNT-CLAIM-PLANNING-VS-FINAL | retired: 369–384-ში მეორე შემთხვევა არ ყოფილა |
| B-R382-SCOPED-LOCATORS | watch (1×) |
| B-R382-UPDATER-CLOSURE-RETENTION, C-R383-L59-EARLY-STOP, C-R382-AUTH-CLAIM-MISMATCH | applied: L58, L59, L29 |
| RC-R376-COVERING-HEADROOM (ახალი) | applied: L31 |
| TL-R376-M1-HANDOFF-ARM-LIFETIME | დაიხურა როგორც stale-open (377 PASS, D-29z1286; L7) |

## 9. countermetric-ები RETRO 400-ისთვის
- A-ს მიერ B-ის sketch-ზე ნაპოვნი გადაუწყვეტელი Medium+: სამიზნე 0 (ახლა 2/16).
- B-ის წარმოშობის C FAIL: ზღვარი 3 (ახლა 1).
- დროის გამო BLOCKED: სამიზნე 0 (ახლა 1).
- B-ის მედიანა < $13.94 (ახლა $12.505); B-ის წილი (ახლა 60.9 %).
- L57 16/16 (ახლა 15/16).
- lessons 60; L58 < 5500 bytes (ახლა 3717).
- ახალი clause-ები L29/L31/L58/L59 გამოყენებულია თუ არა (grep task-ებში: `GC×2`, `progressFile`, covering 50 %).
- ARCH-ზე პასუხი მოვიდა თუ არა, ან default ამოცანა დაიგეგმა თუ არა. SYS-R369-ის გადაწყვეტილება.

## 10. ცვლილებები: lessons
`lessons.md`: **60 ხაზი**, ახალი ხაზი არ დამატებულა. before-ასლი: `b-round-384/lessons-before-385.md`; diff: `b-round-384/lessons-diff.txt` (`3c3 18c18 20c20 41c41 59c59`). ყველა clause-ის ავტორია `tech-lead`, B-ის ფორმულირებით.
- **l.3:** pointer → retro-385 (ფანჯარა 369–384).
- **L29 (l.18):** „Recipe reaches the branch": ერთ branch-ზე მიმართული row ისეთ input-ებს იყენებს, რომლებიც ყველა წინა შემოწმებას გადის. B მას baseline-ზე უშვებს.
- **L31 (l.20):** covering set-იც 50 %-ის შემოწმებაში შედის.
- **L58 (l.41):** release/eviction/retention-ს ამტკიცებს ბრაუზერის GC×2 probe sketch-ზე და mutant. წყაროს წაკითხვა და jsdom ამის მტკიცებულება არ არის.
- **L59 (l.59):** ჯერ ყველაზე მძიმე row-ები; BLOCKED-for-time JSON-ში `progressFile` და `stopSignal`.

## 11. სისტემური ამოცანა
- **SYS-R385-LEAF-ACTIONS-CONTEXT** (`tech-lead`): 8 Low ერთი მიზეზით, pattern A-ს leaf-memo ვალით. ესენია: GATE371-L2, GATE375-L2, GATE379-L3, GATE378-L2, A-R371-GH5-IDENTITY, B-R374-MASTER-VACUOUS-NAME-COUNTS, GATE375-L1 და GATE377-L1. `classify.txt` რამდენიმე მათგანს „keyboard"-ად აჯგუფებს; აქ ისინი id-ით არის დაჯგუფებული.
- **სტატუსი `awaiting_user`:** ამოცანა არქიტექტურულ კითხვაზეა დამოკიდებული. `queued_conditional` არ გამოვიყენე, რადგან SYS-R369-მა აჩვენა, რომ ასეთი ამოცანა ჩერდება. მის ნაცვლად RETRO 400-ზე ვადა და default არის.

## 12. Saba-სთვის და root-ისთვის (წინადადებები და კითხვები; loop-ში არ სრულდება)
1. **Saba:** `user-review/questions-arch-leaf-plumbing.md`: A / B / B-actions.
2. **Saba:** Q-SR-385-1: „Try it in the Studio"-ის ადგილი (მხოლოდ კითხვა).
3. **root:** ROOT-REQ-L57-CHECK-PROGRESS (`tools/l57-check.py` BLOCKED-ზე `progressFile`/`stopSignal`-ს ამოწმებს).
4. **root:** ARCH-CHECKPOINT-PERF9-STEM-CACHE ისევ უპასუხოა (RETRO 400-ის default).
5. **root:** ROOT-REQ-B-RETRO-CONSULTS (retro 369 §12.3) ისევ ღიაა: `consequence-tester` და `qa-engineer` B-ის სიაში არ არიან, თუმცა retro_policy მათ ასახელებს.

## 13. შემდეგი
- **round 385:** ეს RETRO. C ამოწმებს RT-* row-ებს.
- **round 386:** GATE384-M1-ENSURE-DECODED-UNHANDLED-REJECTION + A-R383-REVIEW-L1 (+ GATE384-L2, თუ იაფია), ყველა `ensureDecoded`/`startLibraryPreview`-შია.
- შემდეგ:
  1. REGRESSION-2026-11-08;
  2. PERF-13b-ii;
  3. PERF-13c, 13d, 14, 15;
  4. SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM;
  5. STEM-LANES;
  6. SYS-1…3;
  7. STORE-2b…5;
  8. REVIEW-RECOMMENDATIONS;
  9. T12-ADVANCED;
  10. phase 2 (skip rule).
- **შემდეგი RETRO:** round 400 ან STUDIO-PERFORMANCE-ის დასრულება, რომელიც უფრო ადრე მოვა.
