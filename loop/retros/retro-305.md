# RETRO 305 — მერვე რეტროსპექტივა (რაუნდები 290–304)

**თარიღი:** 2026-11-02 · **ავტორი:** B (D-29z801) · **სტატუსი:** C ამოწმებს round 305-ში (RT-* row-ები).

**წესები:**
- „Retrospective: stop, look back, improve“ (Saba, 2026-10-26);
- „Look back on every issue Saba finds, and guard the whole screen“ (Saba, 2026-10-28);
- RETRO-ზე გზის მიმოხილვა (Saba, 2026-10-31);
- `backlog.json` → `retro_policy`.

**კონსულტაციები** (read-only, ყველა რეალურად გამოძახებულია):
- retro-სთვის: `tech-lead`, `consequence-tester`;
- ეკრანისა და გზისთვის: `product-designer`, `design-philosopher`, `first-visit-host`.

`design-philosopher`-ს ჩაწერა აეკრძალა. ყველა კონსულტაციის შემდეგ store-ის tree შევამოწმე: `sha256sum -c` rc 0, `git status` ცარიელი. `qa-engineer` B-ის ნებადართულ სიაში არ არის, ამიტომ არ გამომიძახებია. Advisor ხელმისაწვდომი იყო და მიდგომამდე გამოვიყენე. კონსულტანტების დასკვნები მონიშნულია („`tech-lead`:“ და ა.შ.); ეს მათი აზრია და არა ხელახლა გამოთვლილი ფაქტი.

**ფანჯარა:** 290–304 (15 რაუნდი). Round 290 თავად RETRO იყო და ფანჯარაში შედის (retro 275/290-ის პრეცედენტი).

**ყველა რიცხვის წყარო.** გზები `tmp/studio-real-loop/`-ის მიმართაა. სკრიპტები გაუშვით loop-ის root-იდან: `python3 -I b-round-304/<script>`. ისინი retro 290-ის ასლია ფანჯრით 290–304. `retro-numbers.py`-ის ჯგუფები ხელით ხელახლა დავწერე, რაუნდების სათაურების მიხედვით (`tasks/round-N.md` l.1).
- `collect.py` → `rounds-290-304.json` (გამოტანა `collect.txt`).
- `cost.py` → `cost-rows.json`; ჯამებს ბეჭდავს, გამოტანა `cost.txt`-შია. B-ის ღირებულება წანაცვლებულია: `b-round-(N−1)-result*.json` არის რაუნდ N-ის დაგეგმვა. ამ დაგეგმვის (305) ღირებულება ფანჯარაში არ შედის. root gate და reviewer არ ითვლება.
- `retro-numbers.py` → `retro-numbers.txt`; `fails-detail.py` → `fails-detail.txt`; `gate-reviews.py` → `gate-reviews.txt`.
- `classify.py` → `classify.txt`, `classify-out.json`; `window-findings.py` → `window-findings.txt`; `totals.py` → `totals.txt`.
- `claims-count.txt`, shell loop-ით: თითო `tasks/round-N.md`-ში `SWEEP`-ის hit-ები და უნიკალური `[K#]`; თითო `a-round-N.md`-ში „STOP — needs B ruling“ ხაზები; თითო `c-round-N.json`-ში `"manifestPaths"`.
- `manifest-fields.py` → `manifest-fields.txt`: HR-C-MANIFEST-FIELDS-ის ველები და finding-ის `origin` რაუნდების მიხედვით.
- `awaiting-user.py` → `awaiting-user.txt`.
- ხელით: `fails-cause-hand.txt` (§3), `claims-findings-hand.txt` (§9), `stops.txt`.
- inventory: `retro305-mentions.py` → `retro305-mentions.txt`, `retro305-mention-ids.txt` (§8).

**C-R215-01-ის გაკვეთილი:** სკრიპტები კითხულობს `b-round-304/backlog-before-305.json`-ს, backlog-ის ცვლილებამდე აღებულ ასლს.

---

## 1. მოკლედ
- **C PASS 13, FAIL 2** (290, 292). `browserVerified=false` არცერთხელ. retro 290-ის ფანჯარაში 12 / 3 იყო.
- **Gate:** გამოქვეყნდა 11, skipped 3 (290 და 292 C FAIL-ის გამო, 301 REGRESSION-ში store არ შეცვლილა), **failed 1** (293: C PASS, `verify`-ში 1 ტესტ-ფაილი ჩავარდა).
- **ღირებულება $304.14** = B $146.29 + A $71.43 + C $86.42.
  - რაუნდის მედიანა $18.39 (retro 290: $22.32).
  - FAIL-რაუნდებზე დაიხარჯა $52.14.
  - **B-ის წილი 48%-ია** (retro 290: 51%). B-ის დაგეგმვის მედიანა $9.75 (retro 290: $12.77).
- **სამივე ჩავარდნა (2 C FAIL + 1 gate fail) B-დან მოდის** (§3):
  - retro-ს ხელით დაწერილი მიზეზი (290);
  - spec-მა გაშვებული ხმა არ გაითვალისწინა (292; C-ის `origin`-ში A-ს self-check-იც ერთვის);
  - pre-check-ის sweep-ის ფესვი (293).
- **ფუნქციის 5 ეტაპიდან პირველ C-ზე 1 ჩავარდა** (292). retro 290-ში 7-დან 1 იყო.
- **fix-up ჯაჭვი 296 → 297 → 298 → 299** (STUDIO-LINK-a). ოთხივე C PASS იყო, მაგრამ assert-ები, რომლებსაც ჩავარდნა არ შეეძლოთ, სამი fix-up-ით გასწორდა. ღირებულება $45.75 (§3).
- **EXP-R290-ARTIFACT-MANIFEST უარყოფილია** საკუთარი სამივე პირობით (§9; `consequence-tester` ადასტურებს).
- **დასრულდა:**
  - FIX-PD-1b2 (291), FIX-PD-1c/1c2/1c3 (F8, 292–294);
  - SYS-VACUOUS-ROWS (295);
  - STUDIO-LINK-a…a4 და -b (296–300);
  - REGRESSION 301;
  - NAME-AND-HINT-a/b (302–303);
  - PERF-3c (304).
- **Critical / High 0.** ღია Medium-ები:
  - ძველი, დაპარკული: A-R73-SAFARI-FLAG-FOCUS, GATE128-S1, R80-RECORDINGS-FIELD-BORDERS, GATE232-S2, GATE271-S1, GATE274-S1 (`totals.txt`);
  - ახალი, gate-304-დან: GATE304-M1 (root-ის vitest include) და GATE304-M2 (PERF-3d-ში). §13.

## 2. ციფრები

| საზომი | მნიშვნელობა | წყარო |
|---|---|---|
| რაუნდები | 15 (290–304) | `rounds-290-304.json` |
| C PASS / FAIL | 13 / 2 (290, 292) | `cost.txt` |
| Gate | published 11, skipped 3, failed 1 (293) | `cost.txt` |
| ღირებულება | $304.14: B 146.29, A 71.43, C 86.42 | `cost.txt` |
| მედიანა ფაზის მიხედვით | B $9.75, A $3.70, C $3.86 | `retro-numbers.txt` |
| ყველაზე ძვირი ფაზები | C 301 ($27.31, REGRESSION), B plan 290 ($14.64), B plan 292 ($13.60), B plan 300 ($12.19), B plan 304 ($11.97), A 292 ($11.68) | `retro-numbers.txt` |
| C `bugs[]` | 13: Medium 2, Low 11 | `retro-numbers.txt`, `fails-detail.txt` |
| gate review | 11 review.md, 51 დანომრილი finding; „Critical“ 1 (297, LH3) | `gate-reviews.txt` |
| ფანჯრის findings, `open_findings` | 48: C 25, A 9, gate 7, B 7; info 31, Low 9, Medium 8 | `classify.txt` |
| ფანჯრის findings, `deferred_low_polish` | 38: gate 18, A 14, C 4, B 2 | `classify.txt` |
| `deferred_low_polish` სულ (წინა ასლი) | 544: closed/folded 28, დანარჩენი 516 | `totals.txt` |
| A-ს STOP | 3 (291, 295, 303); სამივე C-მდე მივიდა და გავიდა | `stops.txt`, `claims-count.txt` |
| `[K#]` claims თითო task-ში | 4–29, max 29 (304) | `claims-count.txt` |
| C-ის manifest ველები | 290–299-ში ყოველთვის, 300–304-ში არცერთხელ | `manifest-fields.txt`, `claims-count.txt` |

**ჯგუფები და ღირებულება** (`retro-numbers.txt`):
- RETRO [290] $19.95;
- REGRESSION [301] $35.36;
- feature stage [292, 296, 300, 302, 303] $115.23;
- test-only / perf harness [295, 304] $44.31;
- ფანჯრამდე არსებული finding-ების ფიქსი, gate-289-ის Medium-ები [291] $15.96;
- ფანჯარაში გამოწვეულის fix-up [293, 294, 297, 298, 299] $73.33. ცალ-ცალკე: 12.98 / 14.60 / 11.43 / 18.39 / 15.93.

## 3. FAIL-ები, gate fail და fix-up ჯაჭვი: რატომ და რომელი წესი აიცილებდა (`fails-cause-hand.txt`)

| რაუნდი | რა მოხდა | საიდან | წესი |
|---|---|---|---|
| 290 C FAIL | retro-290 §3-ის ხაზი „276 gate fail“ წერდა 3 test ფაილს და native `disabled`-ს. წყარო: 2 ფაილი, 3 ტესტი, ერთი Split-ის ძველ title-ს ამოწმებდა (C-R290-01, Low) | B: მიზეზის ხაზი ხელით დაიწერა, `verify.log`-ის ციტირების გარეშე | RT-FIX-291 (D-29z719). ამ retro-ს §3-ის ყველა ხაზი წყაროს ასახელებს |
| 292 C FAIL | narrow-screen gate-მა Studio დაკეცა, მაგრამ ბიბლიოთეკის preview ჟღერდა (C-R292-01, Medium) | C-ის `origin`: „B spec (§3.3 named only togglePlayback) + A self-check“ | L49-ის „unmount that keeps the provider“ პუნქტი (D-29z730). ფიქსი round 293 PASS. მას შემდეგ განმეორება 0 |
| 293 gate fail | `app/lib/__tests__/store-theme-tokens.test.ts` ST6 theme-marker-ის რუკას ამოწმებს. round 292-ის StudioNarrowScreen marker-მა ის 4/2 გახადა (GATE293-T1, Medium; `gates/round-293/verify.log` l.3069, l.3093: `1 failed`) | B pre-check: sweep-მა მხოლოდ `app/lib/arrangement`-ის scanner-ები გაუშვა | L23-ის added-marker პუნქტი (D-29z736). **ახლა** L23-ის „full suite on the sketch“ (§10) |
| 296 → 299 (fix-up ჯაჭვი, არა FAIL) | A-ს reviewer: SSR → hydrate არ იყო შემოწმებული (A-R296-REVIEW-1/2, Medium) → 297 gate „Critical“: LH3-ის hydration-warning assert ვერ ჩავარდებოდა, რადგან React-ის once-only flag-ს LH1 ხარჯავდა (GATE297-F1) → 298 C: შევიწროებული regex-ი „Extra attributes from the server“-ს ვერ იჭერდა (C-R298-01, Medium) | B spec: დაწერილ assert-ს mutant არ ჰქონდა რეალურ wiring-სა და warning-ის კლასზე | L52-ის once-only-flag პუნქტი (D-29z767). ახალი ექსპერიმენტი EXP-R305-SKETCH-MUTANT (§10) |

`tech-lead`: „ერთადერთმა pre-check-ით გამოწვეულმა FAIL-მა (gate 293) $14.60-იანი fix-up 294 მოიტანა, B-ის მედიანის დაახლოებით 1.5-ჯერადი. ხელით შენახული repo-scan სია ძველდება“.

## 4. Findings-ის კლასიფიკაცია
- **წარმოშობა** (`classify.txt`, ფანჯრის `open_findings` + `deferred_low_polish`): C 29, gate reviewer 25, A 23, B 9.
- **კატეგორია:**
  - `open_findings`: keyboard 7, tests/harness 5, focus 5, timing/audio 4, a11y/announcements 3, docs/process 3, copy/i18n 1, layout/visual 1, უკატეგორიო 19;
  - deferred-ში keyboard 11, focus 10 და tests/harness 7 სჭარბობს.
- **ძირეული მიზეზები** (ხელით, §3 + §9):
  - **B-ის spec ან pre-check** — სამივე ჩავარდნა და fix-up ჯაჭვი;
  - **claim ან artifact** — 3 დასახელებული (C-R295-INFO-01, C-R298-02, INFO-C303-K9K10) და 2 count mismatch (290, 293);
  - **assert, რომელიც ვერ ჩავარდება** — fix-up ჯაჭვი 297–299. ეს SYS-VACUOUS-ROWS-ის (295) შემდეგ მოხდა, ანუ კლასი helper-ით არ დაიხურა;
  - **ადრე არსებული ბაგი, რომელიც ჩვენმა ცვლილებამ გამოაჩინა** — C-R301-01 (pointer-ით გახსნილი grid menu-დან Tab BODY-ზე ხვდება; DOM-ის რიგი 262/263-ის შემდეგ შეიცვალა, D-29z782). L47-ის კლასია, Low, deferred;
  - **გადახრა, რომელიც STOP უნდა ყოფილიყო** — C-R304-01 (A-მ task-ის LoAF წესი შეცვალა და გადახრად ჩაწერა). L11 ამას უკვე STOP-ად თვლის (`tech-lead`).

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **უკეთესი spec:** 292 და ჯაჭვი 296–299 (§3).
- **pre-check:** 293. ცვლილება: L23 „full suite on the sketch“.
- **A-ს self-check:**
  - 292-ში C A-საც ასახელებს: Medium „known gap“-ად ჩაიწერა და არა STOP-ად;
  - 304-ში გადახრა STOP-ის ნაცვლად მოხდა, და review-ის შემდეგ შეცვლილი კოდი reviewer-მა აღარ ნახა (`a-round-304.md` l.107).

  L11-ს ორივე დაემატა.
- **shared helper:** ახალი helper-კლასი არ გამოჩენილა. `tech-lead` გვთავაზობს harness-ის წესების ერთ ფაილს (§11).

## 6. Saba-ს ნაპოვნი საკითხები (2026-10-28-ის წესი)
- ფანჯარაში ახალი `SABA-B-*` არ შემოსულა.
- 2026-10-31-ის product-design მიმოხილვიდან F8 (narrow) 292–294-ში, F7-ის დარჩენილი ნაწილი 291-ში, Q4/Q5 302–303-ში, STUDIO-LINK 296–300-ში შესრულდა. ყველას ჰქონდა გაკვეთილი (L54, L55), რადგან ისინი round 286-ზე დაემატა.
- **იგივე სახე დაბრუნდა?** ნაწილობრივ. ამ RETRO-ს გზამ ახალი journey-ხარვეზი იპოვა: SR-305-3, „Try it in the Studio“ ცარიელ timeline-ზე ჩერდება. STUDIO-LINK-a-ს journey row-მა (L54) მხოლოდ მონიშვნა და focus შეამოწმა, მოსმენა არა. ასევე SR-305-2: შენიშვნა „not CZABA catalogue audio“ ნამდვილ preview-ს ეწინააღმდეგება.

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
- **RC-R290-PRECHECK-FULL-SUITE.**
  - `tech-lead`: „მივიღოთ, მხოლოდ `app/**`-ის task-ებისთვის“.
  - **B: მიღებულია.** RETRO 290-მა პირობა დაუწესა: „თუ pre-check-ით გამოწვეული FAIL განმეორდება“. gate 293 ასეთი იყო. სრული suite-ის გაშვება B-ის საკუთარი scratch-ის ნაბიჯია და არა A-ს ან C-ის მიღების row. ამიტომ 2026-10-21-ის speed rules არ ირღვევა.
- **harness-ის წესების ფაილი.**
  - `tech-lead`: „C-ის HR-* წესები ერთ ფაილში, რომელსაც C ყოველ რაუნდში კითხულობს; ეს სისტემური task-ია“.
  - **B:** ასეთი ფაილი უკვე არსებობს: `lessons.md`, რომელსაც policy-ის მიხედვით B, A და C ყოველ რაუნდში კითხულობს. ველები L57-ში ჩავწერე. ცალკე სისტემური task არ არის საჭირო.
- **lessons-ის ზომა.**
  - `tech-lead`: „60 ხაზი ზრდას ვერ აჩერებს: L23 4,269 სიმბოლოა; დავაწესოთ სიმბოლოების ლიმიტი“.
  - **B:** ჯერ არა. ამ RETRO-მ L23-ს ერთი პუნქტი დაუმატა. ლიმიტი კანდიდატად ჩავწერე, RC-R305-LESSON-CHAR-CAP, RETRO 320-მდე.
- **C-R304-01 (LoAF overlap).** **B-ის ruling (D-29z799):** overlap წესი კონტრაქტად მიიღება. მიზეზები:
  - reviewer-მა start-inside წესი Medium-ად შეაფასა (ფრეიმები იკარგებოდა);
  - ნაბიჯებს შორის ≥ 200 ms სიჩუმეა, რაც ნებისმიერ დაკვირვებულ LoAF-ზე (≤ 85 ms) მეტია.

  პროცესის ნაწილი L11-ში წავიდა.

## 8. ღია კანდიდატების ბედი (inventory: `retro305-mention-ids.txt`, `retro305-mentions.txt`)
retro 290-ის C-ის მეთოდით ვეძებე `retro[ -_]?305`, case-insensitive, და ცალკე „RETRO (305)“ / „round 305“.

| ID | გადაწყვეტილება |
|---|---|
| RC-R290-PRECHECK-FULL-SUITE | მიღებულია, L23 (§7) |
| RC-R295-CLAIMS-FROM-SKETCH | L56-ს შეუერთდა (alias) |
| RC-R284-POST-FRAME-PROBE | კანდიდატის სტატუსი მოეხსნა: 290–304-ის task-ებსა და C JSON-ებში მეორე შემთხვევა არ ჩანს (`grep -il 'post-frame\|postFrame'` c-round-290…304.json და tasks/round-290…304.md-ზე = 0). მეორე შემთხვევაზე ხელახლა გაიხსნება |
| RC-R290-AX-TREE-ROW | კანდიდატის სტატუსი მოეხსნა: `grep -il 'ariaSnapshot\|getFullAXTree\|accessibility tree'` task-ებში მხოლოდ 290-ს (RETRO-ს ტექსტი) და 291-ს (გამოყენება) პოულობს; მეორე finding არ ყოფილა. მეთოდი (Chromium accessibility tree row) role/ARIA ცვლილებისთვის harness-ის შენიშვნად რჩება |
| RC-R290-L50-MULTILINE-TERNARY | კანდიდატის სტატუსი მოეხსნა: მეორე შემთხვევა არ ყოფილა (`grep` task-ებში მხოლოდ 291) |
| L29-ის ზრდა (`b-round-303.md` l.156) | L29-ს ამ RETRO-ზე პუნქტი არ დაემატა. ზომის საკითხი → RC-R305-LESSON-CHAR-CAP (§7) |
| EXP-R290-ARTIFACT-MANIFEST | უარყოფილია (§9) |
| retro_policy `signals_for_next_retro` (counters) | C FAIL 2/15 (იყო 3); gate failed 1 (იგივე); STOP-ის შემდეგ C-მდე მისული რაუნდები 3 (იყო 2); lessons 59; Saba-ს ახალი საკითხი 0 |
| SYS-VACUOUS-ROWS-ის შედეგი | round 295 PASS, 4 Low დაიხურა. მაგრამ კლასი დაბრუნდა 297–299-ში (§3) |
| C-R301-01 (D-29z782, „counts under L47“) | L47-ის კლასის 1 finding ფანჯარაში; ადრე არსებული (DOM-ის რიგი), Low, deferred |
| B-R301-DOCS-OLD-NAME | CLAUDE.md-ის tagline — Saba-სთვის წინადადება (§12) |
| A-R302-INFO-CZABA-DOUBLE-READOUT | → SR-305-10 (`screen-review-305.md`) |
| PERF-3 / PERF-3d / STUDIO-PERFORMANCE („after RETRO 305“) | PERF-3d → round 306 (§13) |

## 9. retro 290-ის ექსპერიმენტი: EXP-R290-ARTIFACT-MANIFEST (`claims-findings-hand.txt`, `manifest-fields.txt`)
- **წესი:** უარყოფილია, თუ:
  - ≥ 3 claim/artifact finding-ია;
  - ან ≥ 1 cited-but-absent artifact;
  - ან ≥ 1 FAIL, რომლის წყაროც B-ის pre-check-ია.
- **ფაქტები:**
  - claim/artifact finding: 3 დასახელებული + 2 count mismatch (საწყისი 5);
  - absent: 1, C-R298-02 (`.gitignore`-მა `sketch.patch` წაშალა);
  - pre-check-ით გამოწვეული: gate 293.
- **ვერდიქტი: უარყოფილია სამივე პირობით.** `consequence-tester` ადასტურებს. L56-მა ხილული გაუმჯობესება არ მოიტანა.
- **stop-პირობები:**
  - B-ის მედიანა $9.75 < $15.96;
  - „C check > $2“ შეუმოწმებადია, რადგან C წუთებს წერდა და არა დოლარებს;
  - „manifest > 30 ხაზი“ შეუმოწმებადია, რადგან C path-ების რაოდენობას წერდა (max 27).
- **300–304 შეუმოწმებადია.** task-ებმა წესი აღარ დაასახელეს და C-მ ველები აღარ ჩაწერა. იქ absent artifact უცნობია და არა ნული. ეს ზუსტად retro 290-ის shadow ველების სახეა → L57.
- **L56 რჩება.** ეს წესია; ექსპერიმენტმა მხოლოდ ის აჩვენა, რომ მარტო L56 ჩავარდნებს ვერ აჩერებს.

## 10. ცვლილებები: lessons, harness, ექსპერიმენტი
- **`lessons.md`: 59 → 59 ხაზი** (D-29z803; diff `b-round-304/lessons-diff.txt`):
  - L43 შეუერთდა L44-ს (alias L43; `tech-lead`);
  - **ახალია L57** „Write the harness fields every round, without being asked“ (C ნაწილი);
  - L11-ს დაემატა: task-ის ფორმულის შეცვლა STOP-ია, და review-ის შემდეგ შეცვლილი კოდი ისევ reviewer-ს უბრუნდება (C-R304-01);
  - L23-ს დაემატა „full suite on the sketch“ (`app/**`-ის task-ებისთვის);
  - L56-ს დაემატა „allowed deltas from the sketch“ (RC-R295);
  - L38-ს დაემატა symlink / `find -L` და „C წერს მხოლოდ `c-round-N/`-ში“;
  - განახლდა header-ის ხაზი 3.
- **harness:** HR-C-MANIFEST-FIELDS-ის ტექსტი L57-ში გადავიდა. ახლა მას ჰყავს ფაილი, რომელსაც ყველა რაუნდი კითხულობს. ახალი ველები: `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch`.
- **ახალი ექსპერიმენტი EXP-R305-SKETCH-MUTANT** (`consequence-tester`-ის (c) ვარიანტი; ფანჯარა 305–319):
  - **ჰიპოთეზა:** fix-up ჯაჭვები მოდის assert-ებიდან, რომლებსაც B წერს და რომლებსაც ჩავარდნა არ შეუძლიათ.
  - **წესი:** B-ის ყოველ დაწერილ assert-ს აქვს დასახელებული mutant. B მას dispatch-მდე საკუთარ sketch-ზე უშვებს და შედეგს ინახავს. ეს L23/L52-ს უკვე ეწერა; ახალი მისი გაზომვაა (L57-ის ველები).
  - **საწყისი მდგომარეობა:** 1 ჯაჭვი (3 fix-up, $45.75); B-ის მედიანა $9.75.
  - **უარყოფილია, თუ:** ≥ 2 finding ისეთ assert-ზე, რომელსაც ჩაწერილი წითელი mutant ჰქონდა, მაგრამ მაინც ვერ ჩავარდებოდა; ან ≥ 1 ჯაჭვი ≥ 2 fix-up-ით, რომლის წყაროც B spec-ია.
  - **stop:** B-ის მედიანა > $11.70, ან C ველებს 2 რაუნდში ცარიელს ტოვებს.
  - **null:** ახალ assert-ს 3-ზე ნაკლები რაუნდი წერს.

## 11. სისტემური დავალება
ახალი არ არის. `tech-lead`-ის წინადადება (harness-ის წესების ფაილი) L57-ით სრულდება (§7).

deferred-ში keyboard (11) და focus (10) ჯგუფები ერთ საერთო მიზეზად ვერ დავაჯგუფე. დასაჯგუფებლად მიზეზის მტკიცებულება მაკლია, ამიტომ ახალ task-ს არ ვიგონებ. SYS-1…3 რიგში რჩება.

## 12. Saba-სთვის (წინადადებები; loop-ში არ სრულდება)
1. **RC-R275-STOP-ROUTES-TO-B (მესამედ).** A-ს STOP-ის შემდეგ runner-მა რაუნდი B-ს დაუბრუნოს და არა C-ს. ამ ფანჯარაში 3 STOP C-მდე მივიდა (291, 295, 303). სამივე PASS-ით დასრულდა, რადგან C-მ B-ის ruling-ის გარეშე შეაფასა. 303-ის ruling მხოლოდ შემდეგ დაგეგმვაზე დაიწერა (D-29z793).
2. **ეკრანის მიმოხილვა:** `user-review/screen-review-305.md`.
   - SR-305-1…10;
   - ყველაზე მნიშვნელოვანი SR-305-3: „Try it in the Studio“ ცარიელ timeline-ზე ჩერდება;
   - SR-305-2: demo-ს შენიშვნა ნამდვილ preview-ს ეწინააღმდეგება.
3. **პროექტის წესის წინადადება (B-R301-DOCS-OLD-NAME).** `store/CLAUDE.md`-ის tagline „Personal Mixdown Studio“ შენი Q4 გადაწყვეტილების მიხედვით „CZABA Studio“ გახდეს. loop ამას თავად არ ცვლის.
4. **შენს პასუხს ელოდება 70 კითხვა** (`b-round-304/awaiting-user.txt`). ამ ფანჯარაში ახლად დაემატა:
   - SABA-Q-FIXPD1C-COPY, -ESCAPE;
   - SABA-Q-STUDIO-LINK, -STUDIO-LINK-B;
   - SABA-Q-NAME-LAB-URL-FILE, -NAME-TESTIMONIAL, -NAME-HINT-LIFETIME, -NAME-HINT-KEYBOARD;
   - A-R302-INFO-CZABA-DOUBLE-READOUT (→ SR-305-10).

   არცერთი loop-ს არ ბლოკავს.
5. **root-ისთვის:** ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1). `perf/lib/*.test.ts` gate-ში არასოდეს გაშვებულა. სასურველია PERF-3d-მდე.

## 13. შემდეგი
round 305 (C ამოწმებს ამ retro-ს) → 306 **PERF-3d** (band-crossing-ის ფიქსი).
- PERF-3d მოიცავს GATE304-M2-ს: ორი `== 60` budget იმავე commit-ში იცვლება და task მოსალოდნელ მნიშვნელობას ასახელებს.
- C-R304-02-ც იქაა (`interactionSequence`).
- დაგეგმვამდე: `performance-optimizer` და `tech-lead`-ის კონსულტაცია და ხელახალი გაზომვა (C-ის მონაცემი: wheel-ის მე-4 ნაბიჯი 30 rewrite-ით LoAF 0-ია, მე-7 კი 70–80).

ამის შემდეგ: REGRESSION (2026-11-05-დან) → STUDIO-PERFORMANCE-ის დანარჩენი → STEM-LANES → SYS-1…3 → STORE-2b…5 (direction gate) → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). შემდეგი RETRO: round 320 ან STUDIO-PERFORMANCE-ის დასრულება, რომელიც უფრო ადრე მოვა.
