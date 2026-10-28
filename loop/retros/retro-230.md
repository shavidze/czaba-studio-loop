# RETRO 230 — მესამე რეტროსპექტივა (რაუნდები 215–229)

**თარიღი:** 2026-10-28 · **ავტორი:** B (D-29z294) · **წესი:** policy „Retrospective: stop, look back, improve“ (Saba, 2026-10-26) და „Look back on every issue Saba finds, and guard the whole screen“ (Saba, 2026-10-28); `backlog.json` → `retro_policy` · **სტატუსი:** Round 230-ში C ამოწმებს (RT-* row-ები)

**კონსულტაციები:** `tech-lead` და `consequence-tester` (read-only, ორივე გამოძახებულია); ეკრანის მიმოხილვისთვის `design-philosopher` და `first-visit-host` (read-only; `design-philosopher`-ს ფაილის ჩაწერა აეკრძალა და არაფერი ჩაუწერია). `qa-engineer` B-ის ნებადართულ სიაში არ არის და არ გამოძახებულა; C-ს შეუძლია Round 230-ში გამოიძახოს. Advisor ხელმისაწვდომი იყო და გამოყენებულია.

**ფანჯარა:** რაუნდები 215–229 (15 რაუნდი), retro 215-ის შემდეგ. Round 215 თავად RETRO იყო და ფანჯარაში შედის.

**ყველა რიცხვის წყარო** (`tmp/studio-real-loop/`-ის მიმართ; გაუშვით loop-ის root-იდან `python3 -I b-round-229/<script>`). სკრიპტები retro 215-ის სკრიპტების ასლია, ფანჯრით 215–229:
- `collect.py` → `rounds-215-229.json`, `collect.txt`;
- `cost.py` → `cost.txt`, `cost-rows.json`. B-ის ღირებულება წანაცვლებულია: `b-round-(N−1)-result*.json` რაუნდ N-ის დაგეგმვაა. ამ დაგეგმვის (Round 230) ღირებულება ფანჯარაში არ შედის. Root gate-ისა და reviewer-ის ღირებულება არ ითვლება (ფაილი არ არსებობს);
- `retro-numbers.py` → `retro-numbers.txt`; `fails-detail.py` → `fails-detail.txt`; `gate-reviews.py` → `gate-reviews.txt`;
- `classify.py` → `classify.txt`, `classify-out.json`; `window-findings.py` → `window-findings.txt`; `l28-status.py` → `l28-status.txt`; `totals.py` → `deferred-totals.txt`, `open-medium-plus.txt`;
- `experiments.py` → `experiments.txt` (retro 215-ის ექსპერიმენტის საზომები); `window-mediums.py` → `window-mediums.txt` (ფანჯრის Medium-ები და re-do-ს ღირებულება).

**მნიშვნელოვანი (C-R215-01-ის გაკვეთილი):** ამჯერად `classify`, `window-findings`, `l28-status` და `totals` **backlog-ის ცვლილებამდე** გაეშვა: ისინი კითხულობს `b-round-229/backlog-before-230.json`-ს და არა `backlog.json`-ს. ამიტომ ამ დაგეგმვაზე დამატებული ID-ები (C-R229-01-ის გადატანა, GATE229-*, B-R229-*, SABA-B-7) ამ რიცხვებში არ შედის.

---

## 1. მოკლედ

- **15 რაუნდი: C PASS 13, FAIL 2** (215, 216). `browserVerified=false` არცერთხელ. retro 215-ის ფანჯარაში იყო 11 / 4.
- **Gate:** გამოქვეყნდა 12, skipped 2 (ორივე C FAIL), failed 1 (226), blocked 0.
- **ღირებულება:** $357.83 = B $147.49 + A $120.58 + C $89.76. რაუნდის მედიანა $22.52 (retro 215: $28.54).
- **FAIL-რაუნდების ღირებულება** $49.07; **re-do რაუნდებისა** (217, 225, 227) $50.27.
- **A-ს ერთი STOP** (223): დავალების წინაპირობა მცდარი იყო (C-R223-01).
- **მთავარი დასკვნები:**
  1. **L28-ის ექსპერიმენტი არ უარყოფილა, მაგრამ შეჩერების პირობა შესრულდა.** gate-მა და root-მა სტატუსის მოძველებული ხაზი ფანჯარაში 0-ჯერ დააფიქსირა (საბაზისო 8, 10 ახალი doc: 169–178). თუმცა B-მ ამ დაგეგმვაზე იპოვა doc 170, რომლის l.4 ისევ `In Progress (stage 1 of 2; C round 218 PASS)`-ია, თუმცა მეორე ეტაპი (PERF-16b-i/ii) C round 221-ში დასრულდა (B-R229-DOC170-STATUS). მრავალეტაპიანი ფუნქციის პირველი ეტაპის doc-ს grant არავინ აძლევს. L28 დაზუსტდა (§7).
  2. **ორი B-ის დაგეგმვის ხარვეზი, რომელიც არცერთ row-ს არ დაუჭერია:** Saba-ს დამტკიცებული SABA-B-7 (clip envelope dB-ის taper-ზე, 2026-10-28) `backlog.json`-სა და `feature-status.md`-ში არ ჩაწერილა; Round 229-ის S3-ის recipe („Escape-ით გაასუფთავე time selection“) ბრაუზერში არ მუშაობს (C-N229-S3-METHOD). ახალი L42 და L29-ის დამატება.
  3. **ერთადერთი gate-ის ჩავარდნა (226) L12-ის კლასიდანაა,** რომელიც უკვე არსებობდა: A-მ `data-testid` ელემენტიდან კლასი გადაიტანა და ტესტებში grep არ გააკეთა. Round 227-ის დაგეგმვაზე დაემატა L40. 227–229-ში იგივე აღარ განმეორდა.
- **Critical/High 0.** ფანჯრის ყველა Medium დახურულია (`window-mediums.txt`). ღიად რჩება 3 Medium+ ჩანაწერი, ყველა ამ ფანჯრამდე გახსნილი (`open-medium-plus.txt`).

## 2. ციფრები

| საზომი | მნიშვნელობა | წყარო |
|---|---|---|
| რაუნდები | 15 (215–229) | `rounds-215-229.json` |
| C PASS / FAIL | 13 / 2 | `cost.txt` |
| FAIL-რაუნდები | 215, 216 | `cost.txt` |
| `browserVerified` false | არცერთი | `retro-numbers.txt` |
| Gate | published 12 (217–225, 227, 228, 229) · skipped 2 (215, 216) · failed 1 (226) | `cost.txt` |
| ღირებულება B / A / C / სულ | $147.49 / $120.58 / $89.76 / $357.83 | `cost.txt` |
| FAIL-რაუნდების ღირებულება | $49.07 | `cost.txt` |
| რაუნდის მედიანა | $22.52 | `cost.txt` |
| ყველაზე ძვირი რაუნდები | 226 ($36.49), 216 ($32.54), 223 ($32.37), 224 ($30.50), 218 ($28.92) | `cost.txt` top5 |
| ფაზის მედიანა (min–max) | B-ის დაგეგმვა $10.58 ($5.78–13.00) · A $7.60 ($0.53–13.80) · C $5.40 ($3.95–11.74) | `retro-numbers.txt` |
| ყველაზე ძვირი ფაზები | A 223 ($13.80), A 226 ($13.31), B-ის დაგეგმვა 216 ($13.00), A 216 ($12.77), B-ის დაგეგმვა 224 ($12.45), B-ის დაგეგმვა 229 ($12.00) | `retro-numbers.txt` |
| A-ს საშუალო FAIL / PASS რაუნდში | $6.65 / $8.25 | `cost.txt` |
| Re-do რაუნდები | 217 (216-ის FAIL-ის fix-up, $13.48), 225 (224-ის finding-ების fix-up, $20.19), 227 (gate 226-ის fix-up, $16.60); სულ $50.27 | `retro-numbers.txt` |
| C-ის `bugs[]` ჩანაწერები | 22: medium 2, low 20; critical/high 0 | `retro-numbers.txt` |
| Gate review-ში დანომრილი პუნქტები | 63, 12 review-ში (217–225, 227–229; 215, 216 და 226-ზე `review.md` არ არსებობს) | `gate-reviews.txt` |
| ფანჯრის ID-ები `open_findings`-ში | 42: C 19, gate reviewer 17, A 3, B 2, root 1 | `classify.txt` |
| ფანჯრის ID-ები `deferred_low_polish`-ში | 25: gate reviewer 14, A 6, C 4, B 1 | `classify.txt` |
| `deferred_low_polish`, სულ (ცვლილებამდე) | 353 (11 closed/folded, 342 ღია ან მოლოდინში) | `deferred-totals.txt` |
| სტატუსის მოძველებული ხაზი, gate/root-ის finding ფანჯარაში | 0 (`l28-status.txt`-ში ფანჯრის ID არ არის; `experiments.txt` §1: მხოლოდ C-R215-02 (info, L28-ის წესის განმარტება) და GATE217-S4 (doc 162-ის ტექსტი, არა სტატუსი)) | `l28-status.txt`, `experiments.txt` |
| ფარული მოძველებული სტატუსი, B-ის ნაპოვნი | 1: doc 170 (`experiments.txt` „docs 169-178 l.4 at HEAD“) | `experiments.txt` |

**შენიშვნები:**
- „ფანჯრის ID“ ნიშნავს, რომ ID-ის რაუნდის ნომერი 215–229-შია. ID-ის გარეშე ჩანაწერები აქ არ ითვლება.
- `gate-reviews.txt` ევრისტიკაა (`Critical`, `Suggestions`, `Findings` სექციების დანომრილი ხაზები).
- `closed_findings_d29z163`-ში ფანჯრის 9 ID-ია (3 Medium: C-R224-01, A-R224-REVIEW-TENTHS-NAN, GATE226-B1); ისინი ზემო ორ რიცხვში არ შედის.

## 3. C FAIL-ები, gate-ის ჩავარდნა და STOP: მიზეზი და წესი

ყველა მიზეზს ახლავს ციტირებული ხაზი. დასკვნა ცალკეა მონიშნული.

| რაუნდი | რა მოხდა (მტკიცებულება) | წარმოშობის კლასი | წესი |
|---|---|---|---|
| 215 | RT-NUM: retro 215-ის l.53-ში ეწერა „11 review“, სინამდვილეში 10 (`c-round-215.json` C-R215-01: „only 10 review.md exist … The 69 is correct“) | B-ის ანალიზის შეცდომა retro-ს ტექსტში (რიცხვი სკრიპტის output-იდან არ გადმოტანილა) | RT-NUM row მუშაობს. ამჯერად სკრიპტები ცვლილებამდე გაეშვა და ყოველი რიცხვი ფაილიდანაა |
| 216 | DOC-216: doc 169-ს `## არქიტექტურა` heading არ ჰქონდა (`c-round-216.md` l.22; C-R216-01). PERF-RUN-216: `mem-polls` row-ები `deterministic`-ად იყო მონიშნული, თუმცა მნიშვნელობა run-ებს შორის იცვლებოდა (`b-round-216.md` l.13; C-R216-02) | DOC: დავალებას TEMPLATE-ის heading-ების შემოწმება არ ჰქონდა (missing acceptance row); PERF: task-ის ტექსტი (§2.5) და frozen pattern ერთმანეთს ეწინააღმდეგებოდა (ambiguous task text) | DOC: RC-R216-DOC-TEMPLATE-HEADINGS → **L26 დაზუსტდა**. PERF: `b-round-216.md` l.41 ruling („a poll or sample count depends on timing, so it is `wallclock`“) და L37 (Round 225) |
| gate 226 | `gates/round-226/verify.log` l.2000: `track-layout.test.tsx` „reserves the selected-clip row …“ FAIL. A-ს deviation D1-მა `basis-full` footer-ის slot-ებიდან ახალ wrapper-ზე გადაიტანა, frozen ტესტი კი კლასების ზუსტ სიას ამოწმებდა (`tasks/round-227.md` l.75–76). „A removed `basis-full` from two `data-testid` elements without grepping. The covering set was B's static list“ (`tasks/round-227.md` l.80) | missing test in covering set (L12-ის კლასი, A-ს self-check) | **L40** (Round 227-ის დაგეგმვა). 227–229-ში იგივე არ განმეორდა |
| STOP 223 | „The task's §3 premise ("It resolves to `'stems'` in the fixture") is false … the demo Add places the clip on the Music lane“ (`a-round-223.md` l.3–4; C-R223-01) | ambiguous task text / signal-ის მდგომარეობა (L29-ის კლასი) | L29 უკვე არსებობდა (Round 215). ახლა L29-ს დაემატა „state recipe“-ის პუნქტი |

**დაყოფა:** 2 FAIL-დან ორივე B-ის მხარეა (215: retro-ს ტექსტი; 216: spec-ის ნაკლი, DOC და determinism). gate 226 A-ს handover-მდე დაიჭირებოდა (L12 უკვე ითხოვდა grep-ს). STOP 223 B-ის spec-ია. *დასკვნა:* retro 215-ის ფანჯარაში 4 FAIL-დან 3 მომხმარებლის ქცევის ან focus-ის სამუშაოს ეხებოდა, ამ ფანჯარაში ორივე FAIL დოკუმენტის ან label-ის საკითხია. სამუშაოს სახე შეიცვალა (perf harness, ფაილები, copy), ამიტომ შედარება სუსტია.

## 4. ნაპოვნი საკითხების წარმოშობა

- **ვინ პოულობს:** ფანჯრის `open_findings`-ში C 19-ს, gate reviewer 17-ს, A 3-ს, B 2-ს, root 1-ს; `deferred_low_polish`-ში gate reviewer 14-ს, C 4-ს, A 6-ს, B 1-ს (`classify.txt`).
- **კატეგორიები** (ევრისტიკა, `classify.txt`, `open_findings` ფანჯარაში 42): timing/audio 11, uncategorised 9, keyboard 5, tests/harness 4, a11y/announcements 4, focus 3, docs/process 2, copy/i18n 2, layout/visual 2.
- **Medium-ები** (`window-mediums.txt`; ყველა დახურული):
  - B-R220-LEGACY-EXPORT-NO-STEMS: იპოვა B-ის Playwright `page.route` stub-ის probe-მა (L36). ძველი ბაგი იანვრიდან; „backend-blocked“ row-ს რომ დავყრდნობოდით, ვერ ვიპოვიდით.
  - C-R224-01: windowed commit-ების რიცხვი დატვირთვაზე იცვლება (L37).
  - A-R224-REVIEW-TENTHS-NAN: contract NaN-ს უშვებდა (A-ს reviewer).
  - GATE226-B1: იხ. §3.
  - GATE219-S1 (C-R219-01-ში გაერთიანდა) და GATE220-S1 (გადაკეთდა stub-ის row-ად) ცალკე ბაგი არ არის.
- **Root cause, რომელიც მტკიცებულებით დასტურდება:**
  1. **მრავალეტაპიანი ფუნქციის ადრეული ეტაპის doc.** L28-ის ფორმა `In Progress (stage k of n; …)` სწორია ეტაპის დროს, მაგრამ ბოლო ეტაპის დავალება ადრეული doc-ის l.4-ს არ ითხოვს. doc 170 (PERF-16a) ასე დარჩა. `grep -rn 'In Progress (stage' docs/implementation` HEAD-ზე 3 hit-ს იძლევა: 170 (მოძველებული), 176 (b-ii ჯერ ღიაა) და 178 (CALM-2b ჯერ ღიაა). `tech-lead`: „Option A plus a check“.
  2. **წაშლილი export და vacuous ტესტი.** Round 229-ის L23 pre-check-მა იპოვა, რომ `tempo.test.ts` T10 vitest-ში მწვანეა (`undefined === undefined`) და მხოლოდ `tsc` აჩვენებს ჩავარდნას (B-R228-VACUOUS-DELETED-EXPORT; `tasks/round-229.md` §0.2). ამჯერად B-მა დაიჭირა; წესი არ არსებობდა.
  3. **ფაილში ჩაუწერელი მომხმარებლის მოთხოვნა.** SABA-B-7 policy-ში 2026-10-28-ს გამოჩნდა, მაგრამ `backlog.json`-ში 0 hit და `feature-status.md`-ში 0 hit ჰქონდა ამ დაგეგმვამდე (`grep -c SABA-B-7`). დაგეგმვის თანმიმდევრობაში (CALM-ის შემდეგ, PERF-მდე) ის ამიტომ არ ჩანდა.
  4. **შეუმოწმებელი recipe.** Round 229-ის §5 S3 „cleared with Escape“; C: „Escape does not clear a time selection … identical on HEAD 499c821“ (`c-round-229.json` notes). C-მ S3 empty-lane click-ით მიიღო.
- **Bookkeeping (L7):** ამ დაგეგმვაზე retro 215-ის `retro_runs` ჩანაწერი დაიხურა (C round 216 RT-FIX-216 PASS, `c-round-216.json` `passed`). C-R229-01 და gate 229-ის suggestion 1 ერთი და იგივე საკითხია: ერთი ჩანაწერი, ორივე ID-ით.

## 5. Saba-ს ნაპოვნი საკითხები ფანჯარაში (წესი 2026-10-28)

| საკითხი | `Why we missed it` | გაკვეთილი | იგივე სახე დაბრუნდა? |
|---|---|---|---|
| SABA-B-8 (Studio-ს ეკრანი გადატვირთულია) | დიახ: `tasks/round-226.md` §1.1 | L39 (Round 226-ის დაგეგმვა) | არა. Round 226, 228 და 229-ში C-ის budget row გაეშვა (`c-round-226.json` C-BUDGET, `c-round-228.json` C-BUDGET-228, `c-round-229.json` C-BUDGET-229); 227-მა მხოლოდ ტესტები და shortcut sheet-ის copy შეცვალა (C-R226-02/03); მუდმივი ელემენტი არ დაუმატებია, ამიტომ budget row არ იყო საჭირო. 229-მა 4 მუდმივი ხაზი მოაშორა |
| SABA-B-7 (envelope ბოლომდე არ ჩუმდება) | policy-ში (root-ის ტექსტი): reference-first წესი Round 82–83-ში არ არსებობდა. Task ჯერ არ გაგზავნილა | **არ იყო** ამ დაგეგმვამდე. ახლა L41 (perceptual curve) და L42 (approval → backlog id). ამ დაგეგმვამდე ID ფაილებში არ იყო | ჯერ ვერ ითქმება: task CALM-3-ის შემდეგ იწყება |

**შედეგი:** ფანჯრის 2 Saba-ს საკითხიდან 1-ს ჰქონდა გაკვეთილი დროულად. მეორე (SABA-B-7) ჩანაწერის გარეშე დარჩა, რაც თავად დაგეგმვის ხარვეზია (§4 პუნქტი 3).

## 6. ღირებულება და სიჩქარე

- **ეტაპზე დახარჯული რაუნდები** (`tasks/round-N.md`-ის სათაურები):
  - RETRO 215: 1 (215);
  - PERF-1b-ii: 2 (216, 217 fix-up);
  - PERF-16a / OSS-LIC / PERF-16b-i / PERF-16b-ii: 4 (218–221), 0 FAIL;
  - B-R220-LEGACY-EXPORT-NO-STEMS: 1 (222);
  - PERF-HARNESS-SHARED-LIB a / b-i: 3 (223, 224, 225 fix-up);
  - SABA-B-8 CALM-1a / 1a fix-up / 1b / 2a: 4 (226–229), 1 gate fail.
- **Re-do რაუნდები:** 3 რაუნდი, $50.27 (retro 215: 4, $101.46).
- **ძვირი ფაზები:** A 223 ($13.80, perf harness-ის გადატანა და STOP), A 226 ($13.31, shortcut sheet), B-ის დაგეგმვა 216/224/229 ($12.00–13.00). B-ის დაგეგმვის მედიანა $10.58-ია, retro 215-ის ზღვარი (~$12) არ გადაცილებულა.
- **STOP-ის ფასი C-სთვის:** 223-ში C-მ სრული რაუნდი ჩაატარა ($7.65), რადგან A-მ თავისი ცვლილება HEAD-ზე დააბრუნა და დანარჩენი სამუშაო დაასრულა; L22 (მოკლე რაუნდი) არ ეხებოდა.

## 7. სისტემური დავალებები

| ID | რა | იხურება | Owner area | ზომა |
|---|---|---|---|---|
| **SYS-5** (ახალი) | disabled ღილაკის მიზეზი კლავიატურითაც ხელმისაწვდომი ხდება: `disabled`-ის ნაცვლად `aria-disabled="true"` + focusable + handler-ში early return, ერთი საერთო pattern-ით (DUX-R-4(b), Saba-ს დამტკიცებული 2026-10-25). Loop, Zoom-to-selection, Split, Undo, Redo, Delete, metronome და ბიბლიოთეკის Add ერთად | C-R229-01 (+ GATE229-S1), ROOT-R66-L3 (metronome-ის მიზეზი მხოლოდ title-ში), C-R130-ADD-DISABLED-NO-REASON | transport toolbar (`ArrangementTransport.tsx`, metronome-ის ჩათვლით) და ბიბლიოთეკის Add ღილაკი ვიდეოს ხაზზე (`ArrangementLibrary.tsx`); შესაძლოა `~/components/ui` Button | 1–2 რაუნდი. 41 test ფაილი შეიცავს `disabled`/`toBeDisabled`/`toBeEnabled`-ს (`b-round-229/sys5-disabled-grep.txt`, ბრძანებით; L23/L40-ის collision surface; `tech-lead`-მა 27 დაასახელა, აქ B-ის grep-ის რიცხვია), ყველა shortcut-ს guard და ტესტი სჭირდება, Tab-ის რიგი იზრდება (L1-ის probe). საერთო Button prop-ის შემთხვევაში — შეზღუდული architecture checkpoint |
| SYS-1, SYS-2, SYS-3 | retro 200-იდან, ცვლილების გარეშე | იგივე | იგივე | ჯერ არ გაშვებულა (D-29z172: STUDIO-PERFORMANCE პირველია) |

**რიგი:** SYS-5 იდება SABA-B-8-ის (CALM-2b, CALM-3) და SABA-B-7-ის შემდეგ, STUDIO-PERFORMANCE b-ii-მდე. SABA-B-7-ის ადგილი policy-შია დადგენილი („after SABA-B-8 CALM-1…3 and before the next PERF task“); SYS-5 იმ დავალების მომდევნოა, რომელიც ამ Low-ებს ქმნის (CALM).

**Architecture checkpoint (`tech-lead`):** SABA-B-7-ის dispatch-მდე envelope-ის შენახვის ფორმატი (წრფივი თუ dB), AudioEngine-ის mapping და export-ის render ერთად წყდება. ეს დაემატა მოთხოვნას root-ისთვის (`b-round-229-checkpoint-request.md`) როგორც export-pipeline-ის არსებული მოთხოვნის (`b-round-221-checkpoint-request.md`) დანართი.

## 8. გაკვეთილები (`lessons.md`, 51 ხაზი)

- **შეიცვალა (B):**
  - **L23** — წაშლილი ან გადარქმეული export-ისთვის `npm run typecheck`-იც scratch copy-ზე (B-R228-VACUOUS-DELETED-EXPORT, 1×).
  - **L28** — მრავალეტაპიანი ფუნქციის ბოლო ეტაპი ადრეული ეტაპების doc-ების l.4-საც ითხოვს, და B-ის grep `In Progress (stage` (B-R229-DOC170-STATUS, 1×).
  - **L29** — დავალების ყოველი state recipe B-მ ბრაუზერში ერთხელ გაუშვა (C-N229-S3-METHOD, 1×).
- **შეიცვალა (A):** **L26** — doc-ის `## ` heading-ები TEMPLATE-ის ყველა `## ` heading-ს შეიცავს (C-R216-01, 1×).
- **ახალი (B):** **L41** (perceptual axis-ი reference-ის მრუდს მიჰყვება; SABA-B-7), **L42** (Saba-ს დამტკიცება იმავე დაგეგმვაზე backlog-ის ID ხდება; SABA-B-7).
- **ამოღებული არაფერი.** `tech-lead`-მა L16, L20 და L21-ის ამოღება შესთავაზა (font-ის რაუნდები ფანჯარაში არ ყოფილა), `consequence-tester`-მა კი უარი: „retire it only when … a matching trigger situation actually happened in those windows and the lesson made no difference“. ფანჯარაში font-ის რაუნდი არ ყოფილა, ამიტომ ისინი ძალაში რჩება. ხაზების ადგილი სექციებში ცარიელი ხაზების მოშორებით გამოთავისუფლდა (57 → 51).
- **გაერთიანება (L40 → L12, L32+L33 → L11), რომელიც `tech-lead`-მა შესთავაზა,** ამჯერად არ გაკეთდა: ნომრები სხვა ანგარიშებშია ციტირებული. კანდიდატია მომდევნო RETRO-სთვის.

## 9. retro 215-ის ექსპერიმენტის შედეგი (§8)

`consequence-tester`-ის ვერდიქტით:

| საზომი | შედეგი | ვერდიქტი |
|---|---|---|
| სტატუსის ხაზის findings (საბაზისო 8; უარყოფა ≥ 3) | gate/root 0, 10 ახალი doc-ზე | **არ უარყოფილა, მაგრამ სუსტია:** საზომი ითვლის, რა *დაფიქსირდა*; doc 170 აჩვენებს, რომ პოვნა შეიძლება გამოგვრჩეს. **შეჩერების პირობა** („any published doc status wrong“) doc 170-ით შესრულდა, ამიტომ L28 დაზუსტდა (§8) |
| B-ის დაგეგმვის მედიანა (საბაზისო $10.49; ზღვარი ~$12) | $10.58 | **დასტურდება:** counter-measure არ ამოქმედდა |
| L23-ის კლასის STOP (საბაზისო 1) | 0 | არ უარყოფილა, სუსტი (base rate 1) |
| timeout-ით gate-ის ჩავარდნა (საბაზისო 1) | 0 (`experiments.txt` §3: gate 226-ის log-ში „timed out“ არ არის) | არ უარყოფილა, სუსტი |
| reviewer-ის რეგრესია, რომელიც C-მ FAIL-ად მონიშნა (საბაზისო 1) | 0 | არ უარყოფილა, სუსტი |

## 10. ექსპერიმენტი მომდევნო ფანჯრისთვის (230–244)

`consequence-tester`-ის ფორმით:
- **ჰიპოთეზა:** ადრეული ეტაპის სტატუსი მოძველდება იმიტომ, რომ მას grant არ აქვს, და არა აგენტების უყურადღებობის გამო.
- **ცვლილება:** L28-ის დამატება (Round 230-იდან): ბოლო ეტაპის დავალება ადრეული doc-ების l.4-ს ითხოვს; B-ის grep `In Progress (stage`.
- **საზომი:** Round 244-ზე 169+ doc-ების `In Progress (stage` hit-ები, რომელთა ფუნქციის ბოლო ეტაპი C PASS-ია. საბაზისო: 1 (doc 170).
- **უარყოფა:** ≥ 1 ასეთი hit წესის ქვეშ დასრულებულ ფუნქციაზე.
- **შეჩერება:** A ან C doc-ის ხაზს grant-ის გარეთ ცვლის.
- **ნულოვანი შედეგი:** 2-ზე ნაკლები მრავალეტაპიანი ფუნქციის დასრულებისას 0 hit არაფერს ამტკიცებს; იწერება რიცხვი, არა „მუშაობს“.
- **საწინააღმდეგო საზომი:** grant-ის ან doc-ის ცვლილებით გამოწვეული C FAIL ან gate-ის ჩავარდნა. თუ გაიზრდება, წესი ჩანაცვლდება root-ის publish-მდე grep-ით.
- **დამატებით დაითვლება:** recipe-ის ხარვეზები (C-N229-S3-METHOD-ის ტიპი; საბაზისო 1), Saba-ს დამტკიცება ID-ის გარეშე (საბაზისო 1, SABA-B-7).

## 11. მთლიანი ეკრანის მიმოხილვა

შედეგი: `user-review/screen-review-230.md` (კანდიდატები Saba-სთვის; არაფერი არ განხორციელდება მის პასუხამდე). screenshot-ები: `b-round-229/screens/screen230-full-{S0,DEMO}-{1440x900,1280x720}.png`, HEAD `5da0f50`.

## 12. საბასთვის (For Saba) — მხოლოდ წინადადებები, არაფერი გამოყენებულა

1. **ეკრანის 10 კანდიდატი** — `user-review/screen-review-230.md`. ყველა პოზიციის ან ქცევის ცვლილება შენს თანხმობას საჭიროებს.
2. **retro 215-ის §9 1–2 და retro 200-ის §8 1–3** ჯერ უპასუხოა (`biome.json`-ის `perf/**`, `TESTING_QUALITY_GATES.md`, `TAILWIND_FIRST.md`, `code-reviewer.md`).
3. **SABA-B-7-ის შესახებ:** შენი გადაწყვეტილება loop-ის ფაილებში 2026-10-28-ის policy-დან ამ დაგეგმვამდე არ ჩაწერილა. ახლა ჩაწერილია, რიგით CALM-3-ის შემდეგ, PERF-მდე, როგორც დაამტკიცე. დაკარგული რაუნდი არ არის: SABA-B-8 ჯერ ისევ მიმდინარეობს.

**Root-ისთვის (loop runner):** `b-round-229-checkpoint-request.md` (SABA-B-7-ის envelope-ის ფორმატი; export-pipeline-ის მოთხოვნის დანართი). წინა მოთხოვნები (`b-round-211`, `-221`, `-225`) ისევ ღიაა და არ ბლოკავს.

**ღია კითხვები (უცვლელი):** C-R188-I6 (testimonials), OBS-R199-LEDGER, announcement-ის გამეორება, C-R212-03 (6× CPU-ის ბიუჯეტი), SABA-Q-CTRL-CMD-DISPLAY.
