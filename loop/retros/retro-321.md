# RETRO 321 — მეცხრე რეტროსპექტივა (რაუნდები 305–320)

**თარიღი:** 2026-11-03 · **ავტორი:** B (D-29z882) · **სტატუსი:** C ამოწმებს round 321-ში (RT-* row-ები).

**წესები:**
- „Retrospective: stop, look back, improve“ (Saba, 2026-10-26);
- „Look back on every issue Saba finds, and guard the whole screen“ (Saba, 2026-10-28);
- RETRO-ზე გზის მიმოხილვა (Saba, 2026-10-31);
- `backlog.json` → `retro_policy`.

**კონსულტაციები** (read-only, ყველა რეალურად გამოძახებულია):
- retro-სთვის: `tech-lead`, `consequence-tester`;
- ეკრანისა და გზისთვის: `product-designer`, `design-philosopher`, `first-visit-host`.

`design-philosopher`-ს ჩაწერა აეკრძალა. ყველა კონსულტაციის შემდეგ store-ის tree შევამოწმე (`sha256sum -c` rc 0, `git status` ცარიელი; `b-round-320.md` §2). `qa-engineer` B-ის ნებადართულ სიაში არ არის, ამიტომ არ გამომიძახებია. Advisor ხელმისაწვდომი იყო და მიდგომამდე გამოვიყენე. კონსულტანტების დასკვნები მონიშნულია („`tech-lead`:“ და ა.შ.); ეს მათი აზრია და არა ხელახლა გამოთვლილი ფაქტი.

**ფანჯარა:** 305–320 (16 რაუნდი). D-29z877-მა RETRO 320-დან 321-ზე გადაიტანა, ამიტომ ფანჯარაში round 320-იც შედის. Round 305 თავად RETRO იყო და ფანჯარაში შედის (retro 290/305-ის პრეცედენტი).

**ყველა რიცხვის წყარო.** გზები `tmp/studio-real-loop/`-ის მიმართაა. სკრიპტები გაუშვით loop-ის root-იდან: `python3 -I b-round-320/<script>`. ისინი retro 305-ის ასლია ფანჯრით 305–320.
- `collect.py` → `rounds-305-320.json` (გამოტანა `collect.txt`).
- `cost.py` → `cost-rows.json`; ჯამებს ბეჭდავს, გამოტანა `cost.txt`-შია. B-ის ღირებულება წანაცვლებულია: `b-round-(N−1)-result*.json` არის რაუნდ N-ის დაგეგმვა. ამ დაგეგმვის (321) ღირებულება ფანჯარაში არ შედის. root gate და reviewer არ ითვლება.
- `retro-numbers.py` → `retro-numbers.txt` (ჯგუფები ხელით, `task-titles.txt`-ის მიხედვით); `fails-detail.py` → `fails-detail.txt`; `gate-reviews.py` → `gate-reviews.txt`.
- `classify.py` → `classify.txt`, `classify-out.json`; `window-findings.py` → `window-findings.txt`; `totals.py` → `totals.txt`, `deferred-totals.txt`, `open-medium-plus.txt`.
- `manifest-fields.py` → `manifest-fields.txt`; L57-ის ველები: `l57-fields.txt`; B-ის მედიანა რაუნდების მიხედვით: `b-running-median.txt`; `unfailable-assert-fields.txt`.
- `awaiting-user.py` → `awaiting-user.txt`; STOP-ები: `stops-count.txt` (`grep -c 'STOP — needs B ruling' a-round-N.md`).
- ხელით: `fails-cause-hand.txt` (§3).
- inventory: `retro321-mentions.py` → `retro321-mentions.txt`, `retro321-mention-ids.txt` (§8).

**C-R215-01-ის გაკვეთილი:** სკრიპტები კითხულობს `b-round-320/backlog-before-321.json`-ს, backlog-ის ცვლილებამდე აღებულ ასლს.

---

## 1. მოკლედ
- **C PASS 10, FAIL 6** (305, 312, 313, 316, 318, 319). `browserVerified=false` არცერთხელ. retro 305-ის ფანჯარაში 13 / 2 იყო.
- **Gate:** გამოქვეყნდა 10, skipped 6 (ექვსივე C FAIL), **failed 0**.
- **ღირებულება $394.74** = B $192.26 + A $110.06 + C $92.42.
  - რაუნდის მედიანა $24.46 (retro 305: $18.39).
  - FAIL-რაუნდებზე დაიხარჯა $150.14 (retro 305: $52.14).
  - B-ის წილი 49%-ია. **B-ის დაგეგმვის მედიანა $12.12** (retro 305: $9.75).
- **სამი fix-up ჯაჭვი, სამივე B-დან** (§3): PERF-5a 312 → 313 → 314, PERF-7 316 → 317, PERF-8a 318 → 319 → 320. მათი fix-up რაუნდები ჯამში $108.09-ია.
- **feature-ის 7 პირველი ეტაპიდან C-ზე 3 ჩავარდა** (312, 316, 318). retro 305-ში 5-დან 1 იყო.
- **A-ს STOP: 3** (313, 318, 319). სამივე C-მდე მივიდა.
- **EXP-R305-SKETCH-MUTANT: შეჩერებულია და უარყოფილია** საკუთარი წესით (§9; `consequence-tester`). მემკვიდრე ექსპერიმენტი: **EXP-R321-PRECHECK-GATES** (§10).
- **დასრულდა:** RT-FIX 305 (306-ში), PERF-3d (306), PERF-COMMIT-RESCHEDULE a / b-close (307–308), PERF-4a/4d/4e (309–311), PERF-5a (312–314), PERF-5b (315), PERF-7 (316–317), **PERF-8a (318–320)**.
- **Critical / High 0.** ღია Medium-ები (`open-medium-plus.txt`, backlog-ის ცვლილებამდე 8):
  - ძველი, დაპარკული: A-R73-SAFARI-FLAG-FOCUS, GATE128-S1-MIXED-LANGUAGE, R80-RECORDINGS-FIELD-BORDERS, GATE232-S2, GATE271-S1-NO-REALIGN, GATE274-S1-HELD-REPEAT-ANNOUNCE;
  - GATE304-M1-PERF-LIB-NOT-IN-GATE (root-ის vitest include);
  - C-R319-02 — ამ დაგეგმვაზე დაიხურა (round 320-ის C PASS, D-29z880).

## 2. ციფრები
| რა | მნიშვნელობა | წყარო |
|---|---|---|
| რაუნდები | 16 (305–320) | `collect.txt` |
| C PASS / FAIL | 10 / 6 | `cost.txt` |
| Gate published / skipped / failed | 10 / 6 / 0 | `cost.txt` |
| ღირებულება B / A / C / სულ | $192.26 / $110.06 / $92.42 / $394.74 | `cost.txt` |
| რაუნდის მედიანა | $24.46 | `cost.txt` |
| ფაზების მედიანა B / A / C | $12.12 / $6.84 / $5.42 | `retro-numbers.txt` |
| ყველაზე ძვირი ფაზა | B-ის დაგეგმვა 315 ($21.89), შემდეგ 306 ($16.43) | `retro-numbers.txt` |
| FAIL-რაუნდების ღირებულება | $150.14 | `cost.txt` |
| ჯგუფები: RETRO / feature stage / close-out / fix-up | $19.79 / $202.23 / $64.63 / $108.09 | `retro-numbers.txt` |
| fix-up-ები ცალ-ცალკე | 313 $18.59, 314 $24.97, 317 $13.59, 319 $26.80, 320 $24.14 | `retro-numbers.txt` |
| C `bugs[]` | Medium 8, Low 10 | `retro-numbers.txt` |
| gate review.md | 10 ფაილი, 51 დანომრილი finding (50 suggestion + 1 Critical, 320) | `gate-reviews.txt` |
| ფანჯრის finding-ები (open + deferred) | 75 + 29 = 104 | `classify.txt` |
| deferred_low_polish | 574 სულ; დახურული/folded 34 | `deferred-totals.txt` |
| awaiting_user | 82 id | `awaiting-user.txt` |
| A-ს STOP | 3 (313, 318, 319) | `stops-count.txt` |

## 3. FAIL-ები და fix-up ჯაჭვები: რატომ და რომელი წესი აიცილებდა (`fails-cause-hand.txt`)
| რაუნდი | finding | origin (C-ის JSON) | რა მოხდა | რომელი წესი აიცილებდა |
|---|---|---|---|---|
| 305 | C-R305-01 Low | B | ეკრანის მიმოხილვა capture JSON-იდან დაიწერა, რომელიც ტექსტს 120 სიმბოლოზე ჭრიდა | L54-ის ახალი clause (RC-R305-CAPTURE-TEXT-SLICE); ამ RETRO-ს `capture.mjs` ტექსტს აღარ ჭრის 120-ზე |
| 312 | C-R312-01 Medium | B spec / B pre-check | peaks worker-ში გადავიდა და `harness.loaf-scripts`-ის guard-ს სიგნალი გაუქრა; `perf/**` grant-ში არ იყო | L37-ის vacuity clause (313-ში დაემატა) → ახლა უპირობო L58 |
| 313 | C-R313-01 Medium | pre-existing | commit-ების რაოდენობა ორ მნიშვნელობას შორის ხტოდა (91/1 და 92/2); A-მ STOP გააკეთა | L37 „name the extra commit“ (314-ში); მიზეზი Follow-ის page turn იყო (D-29z842) |
| 316 | C-R316-01 Medium | B pre-check / B spec | Playfair-ის ფაილები Google-ის kit endpoint-იდან ავიღე და არა იმ bytes-იდან, რასაც ბრაუზერი იღებს | L29 mirrored-bytes (317-ში) → L58 |
| 318 | C-R318-02 Medium (+ C-R318-03/04) | B spec / A STOP | ≤ 15 per move grant-ის ფარგლებში მიუღწეველი იყო: layout-effect-ის commit არ გამოვაკელი | L37 budget headroom (319-ში) → L58 |
| 319 | C-R319-01 Medium (+ C-R319-02) | B spec + B sketch pre-check | `memo(function X)` esbuild-მა `X2`-ად გადაარქვა და სახელით მომუშავე ტესტები გაწითლდა; A-მ STOP გააკეთა | L23 runtime-name (320-ში) → L58 |
| 320 (PASS) | C-R320-01 Low | B spec | memo-ს ოთხი საზღვარი არაფერს იცავს; budget ≤ 15 memo-ს გარეშე tree-ზეც სრულდებოდა (14.15) | L58: budget, რომელსაც ფიქსამდელი tree ასრულებს, ფიქსს არ ამტკიცებს |

**საერთო მიზეზი (`tech-lead`):** სამივე ჯაჭვში B-მ assert-ის რიცხვი, სახელი ან byte pin დაწერა დასკვნიდან ან გვერდითი გაზომვიდან. C-ის საკუთარი ბრძანება sketch-ზე არ გაუშვია. ყოველი ჩავარდნის შემდეგ ერთი clause დაემატა (L37, L29, L23), მაგრამ თითოეული პირობითი იყო („თუ PERF task მუშაობას ამოძრავებს“). ამიტომ შემდეგი ჯაჭვი სხვა ფორმით მოვიდა. ახალი **L58** უპირობოა: ის, რაც ასერტდება, B-ის sketch-ზე C-ის ბრძანებით უნდა იყოს გაზომილი. სხვაგვარად row `record` რჩება.

**ჩემი დაკვირვება (B):** 318-მა და 319-მა ერთი და იგივე სცენარი გაიმეორა: A-მ STOP გააკეთა, deliverable-ები გამოტოვა და C-მ რაუნდი FAIL-ით დახურა. ეს RC-R275-STOP-ROUTES-TO-B-ის მეოთხე შემთხვევაა (§12).

## 4. Findings-ის კლასიფიკაცია (`classify.txt`)
- **origin, ფანჯარა (open + deferred):** C 41, gate reviewer 29, A 27, B 7.
- **severity, open_findings-ში:** Medium 12, Low 20, info 43; deferred-ში Low 28, info 1.
- **კატეგორია:** ყველაზე დიდია tests/harness (open 9 + deferred 14) და timing/audio (11 + 3). უკატეგორიოა 34 + 7 (ძირითადად info და PERF-ის სიგნალები).
- ფანჯრის ყველა Medium performance-ის რაუნდებიდანაა. focus/keyboard-ის კლასი, რომელიც retro 245–290-ში დომინირებდა, აქ თითქმის აღარ ჩანს (7 + 2). ეს ფანჯრის შინაარსს ასახავს (PERF) და არა გაუმჯობესების მტკიცებულებას.

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **უკეთესი spec (B):** 312, 316, 318, 319, 320 — ხუთივე L58-ის ფორმაა (§3).
- **A-ს self-check:** 318 და 319-ში A-მ deliverable-ები STOP-ის გამო გამოტოვა (C-R318-03/04, C-R319-02). L11 ამბობს „change nothing else“ და A-მ ზუსტად ასე მოიქცა. ამიტომ ეს A-ს შეცდომა არ არის. პრობლემა მარშრუტშია: STOP-ის შემდეგ რაუნდი C-მდე მიდის (§12).
- **shared helper:** R2 worker-ის ტესტების fake R2-ს ზედმეტად ლმობიერად იქცევა. ოთხი Low ერთი მიზეზიდან მოდის (§11): C-R311-01, A-R311-REVIEW-L4, GATE311-L1, A-R309-REVIEW-TEST-GAPS.
- **გარემო:** env-ის ჩავარდნები (ცივი dev compile, export-ის flake) C-მ სწორად ჩაანაცვლა (L38). ჩავარდნა არცერთს არ გამოუწვევია.

## 6. Saba-ს ნაპოვნი საკითხები (2026-10-28-ის წესი)
ფანჯარაში ახალი SABA-B-* არ გაჩენილა (backlog-ში ბოლო SABA-B-11-ია). დასათვლელი არაფერია. ძველი SABA-B-ების ტიპის განმეორება არც §4-ში ჩანს.

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
- **C-R320-01:** C-მ მოითხოვა, რომ required row გამხდარიყო. `tech-lead`-მა PERF-10 დაასახელა (L8: deferred Low, რომელიც შემდეგი ეტაპის კოდს იცავს). **გადაწყვეტილება:** PERF-10-ის required row: `…Inner` = 0 range drag-ის ყოველ move-ზე, detail panel ღიაა, ოთხ memo-ზე; მასვე ემატება all-lanes drag-ის `record` row (GATE320-S3). deferred-ში **არ** გადადის.
- **Gate 320, finding 1 (Critical, „COMMIT: BLOCK“):** hook-ის ფორმის ცვლილების grant არსებობდა: `tasks/round-318.md` l.102 („Removed from `ArrangementContextValue`“). root-მა გამოაქვეყნა. **დაიხურა**, მაგრამ doc 230-ში D-ID-ის ხაზი აკლია: GATE320-L1-DOC230-GRANT-LINE (Low) PERF-8b-ს მიჰყვება.
- **Gate 320, suggestion 2 (`setRange(null)` await-ის შემდეგ):** `tech-lead`: მექანიზმი რეალურია (`ArrangementContext.tsx` ვიდეოს დამატება), მაგრამ საბოლოო მდგომარეობა სწორია, ამიტომ Low/სიგნალია. Medium მაშინ ხდება, თუ შუალედური frame იხატება. **გადაწყვეტილება:** open_low_provisional; PERF-8b-ს (selection store, იმავე ჩაწერებს ეხება) ემატება ბრაუზერის ექსპერიმენტის row. მეთოდი `tech-lead`-ისაა: per-commit logger + rAF marker, ხოლო `unstable_batchedUpdates` control.
- **Gate 320, suggestion 6 (store-ის ორი pattern):** `tech-lead`: შეზღუდული `frontend-architect` checkpoint PERF-8-ის საზღვარზე. მიმართულება უკვე D-29z193-შია (zustand). **გადაწყვეტილება:** root-ისთვის მოთხოვნა ARCH-CHECKPOINT-PERF8-STORE-PATTERN (D-29z887). ის PERF-8b-ს არ აჩერებს: თუ პასუხი PERF-8b-ის დაგეგმვამდე არ მოვა, PERF-8b D-29z193-ს მიჰყვება.
- **EXP-R305:** `consequence-tester`-ის აზრით, დიზაინი ჩავარდა უფრო ადრე, ვიდრე ჰიპოთეზის შემოწმება მოხერხდებოდა (§9). ვერდიქტი მაინც ლიტერალურია; მისი შენიშვნა ცალკეა ჩაწერილი.

## 8. ღია კანდიდატების ბედი (inventory: `retro321-mention-ids.txt`, `retro321-mentions.txt`)
regex `retro[ -_]?32[01]`, before-ასლზე. 10 id და 2 string:
| id / ადგილი | ბედი |
|---|---|
| `post_current_stage_queue` STUDIO-PERFORMANCE | სტატუსი განახლდა (PERF-8a done; შემდეგი PERF-8b ან REGRESSION) |
| D-29z827, D-29z836, D-29z840, D-29z844, D-29z849 | ისტორიული ჩანაწერები: „RETRO 320“ ნიშნავდა მომავალ RETRO-ს, რომელიც D-29z877-მა 321-ზე გადაიტანა. ახლა ტარდება; ცვლილება არ სჭირდება |
| D-29z877 | შესრულებულია: RETRO 321, ფანჯარა 305–320 |
| RC-R305-LESSON-CHAR-CAP | **ნაწილობრივ მიღებულია:** line 3 pointer-ად შემოკლდა (3,928 → 808 byte, `sed -n 3p lessons.md | wc -c`). L23 ახლა 5,058 byte-ია (`sed -n 16p lessons.md | wc -c`; retro 305-ზე 4,269 იყო, ანუ +789). ახალი sketch-run clause-ები L58-ში წავა და არა L23-ში. სიმბოლოების ლიმიტი watch-ზე რჩება RETRO 336-მდე; trigger: L23 > 5,500 byte |
| RC-R305-CAPTURE-TEXT-SLICE | **მიღებულია** → L54-ის clause; `b-round-320/screens/capture.mjs` ტექსტს `slice(0, 2000)`-მდე ინახავს |
| RC-R308-SPLICE-PROBE | **გაუქმებულია:** 309–320-ში აღარ განმეორებულა (1×). ტექსტი ისტორიისთვის რჩება |
| `retro_policy.next_due` | → „round 336 ან STUDIO-PERFORMANCE-ის დასრულება“ (D-29z882) |
| `retro_policy.signals_for_next_retro` (EXP-R305) | §9-ში დაიხურა; EXP-R321 დაემატა |

## 9. retro 305-ის ექსპერიმენტი: EXP-R305-SKETCH-MUTANT (`l57-fields.txt`, `unfailable-assert-fields.txt`, `b-running-median.txt`)
- **წესი:** უარყოფილია, თუ ≥ 2 finding-ია ისეთ assert-ზე, რომელსაც ჩაწერილი წითელი mutant ჰქონდა და მაინც ვერ ჩავარდებოდა, ან თუ ≥ 1 ჯაჭვია ≥ 2 fix-up-ით, რომლის წყაროც B spec-ია. stop: B-ის მედიანა > $11.70, ან C ველებს 2 რაუნდში ცარიელს ტოვებს. null: < 3 რაუნდი.
- **ფაქტები:**
  - null არ არის: 16-ივე რაუნდი ასახელებს assert-ებს (7–18).
  - **stop შესრულდა:** B-ის მედიანა $12.12 > $11.70. მიმდინარე მედიანა 305-იდანვე ზღვარს ზემოთაა ($14.23).
  - (b) შესრულდა ორჯერ: 312 → 313 → 314 და 318 → 319 → 320.
  - (a) არ შესრულდა: 0. C-R310-01, C-R311-01, C-R319-03 და C-R320-01 C-ის საკუთარი mutant-ები იყო, რომლებიც გადარჩა იმ row-ებზე, რომლებიც B-ს არ მოუწერია. ესენი assert-ის ნაკლებობაა და არა ჩავარდნის შეუძლებლობა. ერთადერთი ნამდვილი შემთხვევა C-R319-01-ია (CP1/R11-P1e), და იმაზე B-ის mutant საერთოდ არ იყო ჩაწერილი.
  - ძველი ოთხი ველი (manifest) 313, 315, 318 და 320-ში აკლია. ახალი სამი ველი 16-ივე რაუნდშია, ამიტომ stop-ის ეს ნაწილი არ შესრულებულა.
- **ვერდიქტი: შეჩერებულია და უარყოფილია.** ქმედებას stop განსაზღვრავს, რადგან ის პირველი შესრულდა (`consequence-tester`). წესი, როგორც ექსპერიმენტი, იხურება. L23/L52-ის mutant-ის მოთხოვნა წესად რჩება.
- **დიზაინის შენიშვნა (`consequence-tester`, ცალკე):** 318–320-ში ველი `mutantRedOnSketch` A-ს tree-ს ზომავდა და არა B-ის sketch-ს. ეს task-ებმა მოითხოვეს (`tasks/round-319.md` l.233, `tasks/round-320.md` §3.2). ამასთან, (b) ყველა B-spec ჯაჭვს ითვლის, მათ შორის grant-ისა და bytes-ის მიზეზებით დაწყებულსაც. ამიტომ ჰიპოთეზა „ძირითადად დაუმტკიცებელია“ და არა სუფთად უარყოფილი.
- **stop-ის შენიშვნა:** რომ B-ის ღირებულება mutant-ის წესმა გაზარდა, დამტკიცებული არ არის. მედიანას 315 ($21.89) და 306 ($16.43) ზრდის.

## 10. ცვლილებები: lessons, harness, ექსპერიმენტი
- **`lessons.md`: 59 → 59 ხაზი** (D-29z883; diff `b-round-320/lessons-diff.txt`):
  - **L16 შეუერთდა L3-ს** (alias L16, `tech-lead`: ერთი წესის B და C ნახევრებია);
  - **ახალია L58:** assert-ის რიცხვი, სახელი ან byte pin C-ის ბრძანების შენახული გამოტანაა B-ის sketch-ზე; სხვა შემთხვევაში row `record`-ია; ფიქსამდელი tree-ს მიერ შესრულებული budget ფიქსს არ ამტკიცებს (`tech-lead`);
  - L54-ს დაემატა truncation/overflow-ის clause (RC-R305-CAPTURE-TEXT-SLICE);
  - L57-ს დაემატა: task ველების სრულ სიას წერს და არა ქვესიმრავლეს; `mutantRedOnSketch` B-ის ფაილს ასახელებს, A-ს tree ცალკე ველია (`mutantRedOnTree`); ახალი ველები EXP-R321-ისთვის;
  - line 3 pointer-ად შემოკლდა (ისტორია სიტყვასიტყვით დარჩა `b-round-320/lessons-before-321.md` l.3-ში).
- **ახალი ექსპერიმენტი EXP-R321-PRECHECK-GATES** (`consequence-tester`; ფანჯარა 322–337, timebox 16 რაუნდი):
  - **ჰიპოთეზა:** fix-up ჯაჭვები იწყება, როცა B-ის pre-check გამოტოვებს task-ში დასახელებულ gate-check-ს (perf spec, pixel compare, budget-ის მიღწევადობა grant-ის ფარგლებში).
  - **წესი:** B task-ში დასახელებულ ყოველ gate-check-ს sketch-ზე dispatch-მდე უშვებს და შედეგს ფაილად ინახავს `b-round-N/`-ში (L58). C წერს `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen` (L57).
  - **საწყისი მდგომარეობა (305–320):** 16 რაუნდში 3 ჯაჭვი, აქედან 2 ≥ 2 fix-up-ით; B-ის მედიანა $12.12.
  - **უარყოფილია, თუ:** ≥ 1 ჯაჭვია ≥ 2 fix-up-ით, რომლის საწყისი check B-მ sketch-ზე მწვანედ გაუშვა, ან ≥ 2 ჯაჭვია pre-check-ის სრული დაფარვის მიუხედავად.
  - **stop:** B-ის მედიანა > $13.94 (12.12 × 1.15), ან შედეგის ფაილები 2 რაუნდში აკლია.
  - **null:** gate-check-ს 3-ზე ნაკლები რაუნდი ასახელებს.
  - **countermetric:** A-ს ღირებულება რაუნდზე, რომ ღირებულება B-დან A-ზე უბრალოდ არ გადავიდეს.

## 11. სისტემური დავალება
**SYS-R2-FAKE-FIDELITY** (D-29z886): ერთი test-only დავალება. R2 worker-ის ტესტების fake R2 რეალური R2-სავით იქცევა: object `httpEtag`-ის გარეშე, `outOfRange`-ის რიგი throw-მდე, დაუსრულებელი body throw mode-ში და version-ის შეცვლა head/get-ს შორის. ის ერთად ხურავს ოთხ Low-ს: **C-R311-01, A-R311-REVIEW-L4, GATE311-L1, A-R309-REVIEW-TEST-GAPS**. მისი ადგილი STUDIO-PERFORMANCE-ის ბოლოა, PERF-15-ის შემდეგ (worker-ის ტესტები ამ რიგს ეკუთვნის; ეს Saba-ს რიგს არ ცვლის). Peaks-client-ის სამეული (C-R315-T1/T2, GATE315-S2) უკვე PERF-14-შია.

## 12. Saba-სთვის (წინადადებები; loop-ში არ სრულდება)
1. **RC-R275-STOP-ROUTES-TO-B (მეოთხედ).** A-ს STOP-ის შემდეგ runner-მა რაუნდი B-ს დაუბრუნოს და არა C-ს. ამ ფანჯარაში 3 STOP C-მდე მივიდა (313, 318, 319), სამივე FAIL-ით, ჯამში $78.18 (313 $18.59 + 318 $32.79 + 319 $26.80; `cost.txt` per-round). B-ის ruling ყოველ ჯერზე მხოლოდ შემდეგ დაგეგმვაზე დაიწერა.
2. **ეკრანის მიმოხილვა:** `user-review/screen-review-321.md`. რაც ხილულია, 305-ის შემდეგ არ შეცვლილა (ტექსტის ხაზების რაოდენობა იგივეა). ყველაზე სუსტი ნაბიჯი ისევ SR-305-3-ია: „Try it in the Studio“ ცარიელ timeline-ზე ჩერდება. ახალი კანდიდატები SR-321-*.
3. **82 კითხვა ელოდება შენს პასუხს** (`b-round-320/awaiting-user.txt`; retro 305-ში 70 იყო). არცერთი loop-ს არ ბლოკავს.
4. **root-ისთვის:** ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1) ისევ ღიაა; ARCH-CHECKPOINT-PERF8-STORE-PATTERN ახალია (§7).
5. **პროექტის წესის წინადადება.** `store/.claude/primitives/REACT_CONTEXT.md`-ში ჩაიწეროს, რომ Studio-ს ახალი store-ები zustand-ზე იწერება (D-29z193). ეს gate 320-ის suggestion 6-ია და ARCH-CHECKPOINT-PERF8-STORE-PATTERN-ის პირველი კითხვა. loop ამას თავად არ ცვლის.

## 13. შემდეგი
round 321 (C ამოწმებს ამ retro-ს) → round 322:
- თუ 322-ის დაგეგმვა **2026-11-05-ზე ან შემდეგაა** → **REGRESSION** (`regression-last` 2026-11-02), C-R318-06-ის repro row-ით;
- სხვა შემთხვევაში → **PERF-8b** (selection store) GATE320-S2-ის ექსპერიმენტით და GATE320-L1-ით. დაგეგმვამდე: `performance-optimizer` + `tech-lead`, HEAD-ის ხელახალი გაზომვა (L37) და L58.

ამის შემდეგ: PERF-DRAG-PREVIEW / PERF-9 / PERF-10 (C-R320-01-ის row) … PERF-15 → SYS-R2-FAKE-FIDELITY → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). შემდეგი RETRO: round 336 ან STUDIO-PERFORMANCE-ის დასრულება, რომელიც უფრო ადრე მოვა.
