# RETRO 290 — მეშვიდე რეტროსპექტივა (რაუნდები 275–289)

**თარიღი:** 2026-10-31 · **ავტორი:** B (D-29z712) · **სტატუსი:** C-ის შემოწმება round 290-ში (RT-* row-ები).
**წესები:**
- „Retrospective: stop, look back, improve“ (Saba, 2026-10-26);
- „Look back on every issue Saba finds, and guard the whole screen“ (Saba, 2026-10-28);
- RETRO-ზე გზის მიმოხილვა (Saba, 2026-10-31);
- `backlog.json` → `retro_policy`.

**კონსულტაციები** (read-only, ყველა რეალურად გამოძახებულია):
- retro-სთვის: `tech-lead`, `consequence-tester`;
- ეკრანისა და გზისთვის: `product-designer`, `design-philosopher`, `first-visit-host`. `design-philosopher`-ს ჩაწერა აეკრძალა; store-ის tree შემდეგ `sha256sum -c`-ით შევამოწმე, rc 0.

`qa-engineer` B-ის ნებადართულ სიაში არ არის, ამიტომ არ გამომიძახებია. Advisor ხელმისაწვდომი იყო; მიდგომამდე გამოვიყენე. კონსულტაციების დასკვნები მონიშნულია („`tech-lead`:“ და ა.შ.). ეს მათი აზრია და არა ხელახლა გამოთვლილი ფაქტი.

**ფანჯარა:** 275–289 (15 რაუნდი). Round 275 თავად RETRO იყო და ფანჯარაში შედის (retro 260/275-ის პრეცედენტი).

**ყველა რიცხვის წყარო** (`tmp/studio-real-loop/`-ის მიმართ; გაშვება loop-ის root-იდან `python3 -I b-round-289/<script>`). სკრიპტები retro 275-ის ასლია, ფანჯრით 275–289; ჯგუფები `retro-numbers.py`-ში ხელით ხელახლა დავწერე რაუნდების სათაურების მიხედვით.
- `collect.py` → `rounds-275-289.json`; `cost.py` → `cost-rows.json` (ბეჭდავს ჯამებს; გამოტანა `cost.txt`). B-ის ღირებულება წანაცვლებულია: `b-round-(N−1)-result*.json` = რაუნდ N-ის დაგეგმვა. ამ დაგეგმვის (290) ღირებულება ფანჯარაში არ შედის. root gate და reviewer არ ითვლება.
- `retro-numbers.py` → `retro-numbers.txt`; `fails-detail.py` → `fails-detail.txt`; `gate-reviews.py` → `gate-reviews.txt`.
- `classify.py` → `classify.txt`, `classify-out.json`; `window-findings.py` → `window-findings.txt`; `totals.py` → `deferred-totals.txt`, `open-medium-plus.txt`; `l28-status.py` → `l28-status.txt`.
- `claims-count.txt`: თითო `tasks/round-N.md`-ში `SWEEP`-ის hit-ები, უნიკალური `[K#]` tag-ები და A-ს STOP-ხაზები; C-ის shadow ველები `c-round-N.json`-ში.
- ხელით: `fails-cause-hand.txt` (FAIL-ების მიზეზები, §3), `claims-findings-hand.txt` (§9), `stops.txt`.

**C-R215-01-ის გაკვეთილი:** სკრიპტები კითხულობს `b-round-289/backlog-before-290.json`-ს, backlog-ის ცვლილებამდე აღებულ ასლს.

---

## 1. მოკლედ
- **C PASS 12, FAIL 3** (275, 282, 287). `browserVerified=false` არცერთხელ. retro 275-ის ფანჯარაშიც 12 / 3 იყო.
- **Gate:** გამოქვეყნდა 11, skipped 3 (სამივე C FAIL), **failed 1** (276: C PASS, `verify`-ში 3 ტესტი ჩავარდა).
- **ღირებულება $358.81** = B $183.74 + A $96.58 + C $78.49.
  - რაუნდის მედიანა $22.32 (retro 275: $24.12).
  - FAIL-რაუნდებზე დაიხარჯა $72.19, მათ fix-up-ებზე (277, 283, 288) $44.60.
  - **B ხარჯის 51%-ია.** B-ის დაგეგმვის მედიანა $12.77 (retro 275: $10.51; stop-ზღვარი $15.77).
- **ოთხივე ჩავარდნა (3 C FAIL + 1 gate fail) B-დან მოდის** (§3):
  - retro-ს inventory;
  - SWEEP-ის ფარგლები;
  - pre-check;
  - clause-ების წინააღმდეგობა.

  A-ს იმპლემენტაციაში ჩავარდნის მიზეზი არცერთხელ არ ყოფილა.
- **ფუნქციის 7 ეტაპიდან პირველ C-ზე 1 ჩავარდა** (282). retro 275-ის ფანჯარაშიც 7-დან 1 იყო.
- **retro 275-ის SWEEP ექსპერიმენტი უარყოფილია** (§9). RC-R260-ROW-SEVERITY მისივე მიღების წესით არ მიიღება (§10).
- **დასრულდა:**
  - SYS-5 (276–278);
  - PERF-2 (282–283);
  - PERF-3a/3b (284–285);
  - FIX-PD-1a/1a2 (F9, 286–288);
  - FIX-PD-1b (F7 + SR-230-6, 289).
- **Critical / High 0.** ღია Medium-ები:
  - ძველი, დაპარკული: A-R73-SAFARI-FLAG-FOCUS, GATE128-S1, R80-RECORDINGS-FIELD-BORDERS, GATE232-S2, GATE271-S1, GATE274-S1;
  - ახალი, gate-289-დან: GATE289-S1 და S2. ფიქსი FIX-PD-1b2-ში, round 291.

  C-R282-01/02 და A-R282-REVIEW-DW11 round 283-ში გასწორდა, მაგრამ სტატუსი „fix dispatched“ დარჩა. ახლა დავხურე (L7, D-29z710).

## 2. ციფრები

| საზომი | მნიშვნელობა | წყარო |
|---|---|---|
| რაუნდები | 15 (275–289) | `rounds-275-289.json` |
| C PASS / FAIL | 12 / 3 (275, 282, 287) | `cost.txt` |
| Gate | published 11, skipped 3, failed 1 (276) | `cost.txt` |
| ღირებულება | $358.81: B 183.74, A 96.58, C 78.49 | `cost.txt` |
| მედიანა ფაზის მიხედვით | B $12.77, A $6.54, C $4.98 | `retro-numbers.txt` |
| ყველაზე ძვირი ფაზები | B plan 282 ($19.26), 281 ($17.61), 279 ($17.26), 275 ($16.67), 285 ($15.95), 284 ($15.20) | `retro-numbers.txt` |
| C `bugs[]` | 16: Medium 3, Low 13 | `retro-numbers.txt`, `fails-detail.txt` |
| gate review | 11 review.md, 56 დანომრილი suggestion, Critical 0 | `gate-reviews.txt` |
| ფანჯრის findings, `open_findings` | 53: C 21, gate 13, A 11, B 8; info 32, Low 14, Medium 7 | `classify.txt` |
| ფანჯრის findings, `deferred_low_polish` | 35: A 19, gate 10, B 3, C 3 | `classify.txt` |
| `deferred_low_polish` სულ (წინა ასლი) | 503: closed/folded 22, დანარჩენი 481 | `deferred-totals.txt` |
| A-ს STOP | 2 (276, 282); ორივე C-მდე მივიდა | `stops.txt` |
| `[K#]` claims თითო task-ში | 7–24, max 24 (285) | `claims-count.txt` |

**ჯგუფები და ღირებულება** (`retro-numbers.txt`):
- RETRO [275] $22.32;
- feature stage [276, 278, 282, 284, 285, 286, 289] $193.90;
- test-only harness [279, 280, 281] $79.89;
- ადრე არსებული ბაგის ფიქსი [287] $18.10;
- ფანჯარაში გამოწვეულის fix-up [277, 283, 288] $44.60.

## 3. FAIL-ები და gate fail: რატომ და რომელი წესი აიცილებდა (`fails-cause-hand.txt`)

| რაუნდი | რა მოხდა | საიდან | წესი |
|---|---|---|---|
| 275 C FAIL | retro-მ `retro_candidates`-ის გარეთ მონიშნული ორი „RETRO-275 candidate“ გამოტოვა (C-R275-01/02, Low) | B, retro-ს inventory | უკვე გასწორდა RT-FIX-276-ში. ამ retro-ს inventory D-ID-ებსა და სტატუსებშიც ეძებს „RETRO 290“-ს (§8) |
| 276 gate fail | SWEEP-მა მხოლოდ runtime consumer-ები განიხილა; 3 test ფაილი native `disabled`-ს ამოწმებდა (GATE276-T1, Medium) | B spec, SWEEP-ის ფარგლები | L23-ის attribute/state-contract პუნქტი (D-29z622). მას შემდეგ განმეორება 0 |
| 282 C FAIL | B-ის scratch-მა DW row-ები sketch-ზე არ გაუშვა (C-R282-01, Medium); doc 211 A-ს STOP-ის გამო არ დაიწერა (C-R282-02) | B pre-check | L23-ის „specified test rows run on the sketch“ (D-29z670) |
| 287 C FAIL | task-ის `text-sm` label ეწინააღმდეგებოდა იმავე task-ის „card keeps its box“-ს (C-R287-01, Low) | B spec conflict | L4-ის ახალი „ruling line“ პუნქტი (D-29z713) |

`tech-lead`: „B-ის pre-check gate-ზე ვიწროა“ (276, 282). „B-ის claim-ები და artifact-ები შეუმოწმებელია“ (5 finding, ზღვარი 2). „clause-ების კონფლიქტი B-საც და A-საც გამორჩა“ (287).

## 4. Findings-ის კლასიფიკაცია
- **წარმოშობა** (`classify.txt`, ფანჯრის `open_findings` + `deferred_low_polish`): C 24, gate reviewer 23, A 30, B 11.
- **კატეგორია** (`open_findings`):
  - tests/harness 9;
  - docs/process 9;
  - a11y/announcements 7;
  - focus 6;
  - copy/i18n 4;
  - keyboard 4;
  - timing/audio 2;
  - layout/visual 1;
  - უკატეგორიო 11.

  deferred-ში timing/audio 9 და tests/harness 7 სჭარბობს.
- **ძირეული მიზეზები** (ხელით, §3 + §9):
  - **B-ის spec ან pre-check** — ოთხივე ჩავარდნა;
  - **cited-but-absent artifact** — 2 (C-R283-02, C-R289-INFO-01);
  - **ფაქტი task-ში tag-ის გარეშე ან ძველი რიცხვით** — 3 (C-R281-01, C-R283-03, INFO-C288-FIXTURE-COUNT);
  - **row, რომელიც ვერ ჩავარდება** (vacuous test) — 4 deferred Low და C-R282-03 (§11);
  - **ადრე არსებული ბაგი, რომელიც ჩვენმა ცვლილებამ გამოაჩინა** — C-R276-01 (unlayered `button{cursor:pointer}`), C-R286-01/02 (`?? 0`).

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **უკეთესი spec:** 276, 282 და 287 (§3). სამივეს უკვე აქვს გაკვეთილი (L23 ორი პუნქტი, L4).
- **A-ს self-check:** ფანჯარაში A-ს მიზეზით ჩავარდნა არ ყოფილა. A-ს წარმოშობის 30 finding (A-ს code-reviewer და A-ს შენიშვნები; `classify.txt`) ძირითადად Low/info-ა და A-ს ჩავარდნა არ გამოუწვევია.
- **shared helper:** SYS-5-მა (276–278) soft-disabled pattern-ი ერთ helper-ში გაიტანა. ახალი helper-კლასი ფანჯარაში არ გამოჩენილა.
- **artifact manifest:** ორი cited-but-absent ფაილი task-ის `[K#]` `test -f` claim-ით დაიჭირებოდა (ახალი L56).

## 6. Saba-ს ნაპოვნი საკითხები (2026-10-28-ის წესი)
- ფანჯარაში ახალი `SABA-B-*` არ შემოსულა.
- **2026-10-31-ის product-design მიმოხილვა** (F1–F12) Saba-მ დაამტკიცა. ამ წესის მიხედვით ისიც მისი ნაპოვნია. გაკვეთილები L54 (journey) და L55 (promise vs model) იმავე დაგეგმვაზე დაემატა (D-29z698, round 286).
- **გაკვეთილი ჰქონდა?** F9 (286–288) და F7 (289) იმავე დღეს გამოჩნდა, L54-მდე. ორივე ადრე არსებული ხარვეზია და მიზეზი „journey არავინ გაიარა“.
- **იგივე სახე დაბრუნდა?** L54-ის შემდეგ ახალი journey-ხარვეზი არცერთ task-ში არ შემოსულა.
- **ამ RETRO-ს გზა** ცნობილს (F2: stem-ები ერთ ხაზზე) ადასტურებს და ახალს ამატებს: SR-290-3, Add active lane-ზე სვამს ნებისმიერ ელემენტს. F2-ის პირველადი მიზეზი უკვე L55-შია.

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
- **RC-R260-ROW-SEVERITY.**
  - `tech-lead`: „shadow გავაგრძელოთ და ვაიძულოთ; C-მ ველების წერა 276-ის შემდეგ შეწყვიტა და ვერავინ შეამჩნია“.
  - **B:** უარი. წესის საკუთარი პირობა იყო „არცერთ deferred Low-ს არ დასჭირდა fix-up“. Round 287-ის FAIL მხოლოდ Low-ზე იყო (C-R287-01) და fix-up 288 დასჭირდა: ბარათის 12 px-იანი რეგრესია გავიდოდა. ეს მონაცემებით დადასტურდება shadow ველების გარეშეც (`fails-detail.txt`). HR-C-SHADOW-FIELDS გაუქმდა.
- **RC-R290-PRECHECK-FULL-SUITE.**
  - `tech-lead`: „B-ის scratch-მა სრული `npm run test:run` გაუშვას“.
  - **B:** ჯერ არა. L23 უკვე მოითხოვს ყველა grep-hit ფაილისა და მითითებული row-ების გაშვებას. ჯერ იაფ წესს ვამოწმებთ (§10). თუ pre-check-ით გამოწვეული FAIL განმეორდა, RETRO 305 ხელახლა განიხილავს.
- **L46 / TLM-R274-SR-HELD-REPEAT.** ვადა (RETRO 290) პასუხის გარეშე გავიდა. საკითხი Saba-ს საბოლოო ხელით შემოწმების სიაშია და რაუნდებს არ ბლოკავს (D-29z715). GATE274-S1 `open_tech_lead_manual`-ად რჩება.

## 8. ღია კანდიდატების ბედი
- **RC-R275-STOP-ROUTES-TO-B** (STOP-ის შემდეგ round ისევ B-ს უბრუნდება): root/Saba-ს წინადადებაა. 2 STOP ისევ C-მდე მივიდა (276, 282). §12-ში ვიმეორებ.
- **ყველა ჩანაწერი, რომელიც „RETRO 290“-ს ასახელებს** (C-R275-01-ის გაკვეთილი). სკრიპტი `b-round-289/retro290-mention-ids.txt`-ში და სტრიქონების grep `retro290-mentions.txt`-ში. ყველა საკითხს აქვს გადაწყვეტილება (D-29z718):

  | ID | გადაწყვეტილება |
  |---|---|
  | GATE274-S1 / TLM-R274-SR-HELD-REPEAT | §7 (L46) |
  | RC-R260-ROW-SEVERITY | §7, უარყოფილია |
  | L27 → L52 (D-29z608) | გაერთიანდა (§10) |
  | B-R280-TASK-2.4-OVERSTATED, B-R281-GATE279-S1-PREMISE, INFO-B282-CONSULT-FALSE-CLAIMS | დათვლილია `claims-findings-hand.txt`-ში. სამივე B-მ თავად იპოვა, სანამ ზიანს მიაყენებდა. B-R281-ის შემთხვევაში L23-ის pre-check-მა იმუშავა. ექსპერიმენტის საწყის მაჩვენებელში არ შედის |
  | C-R261-N2-WIRING-WORDING, RC-R266-JSX-ATTR-GREP, RC-R270-TEST-ID-COLLISION | კანდიდატის სტატუსი მოეხსნა: 275–289-ის C ბაგებში, gate fail-ებსა და FAIL-ის მიზეზებში მეორე შემთხვევა არ ჩანს. მეორე შემთხვევაზე ხელახლა გაიხსნება |
  | RC-R265-AT-RISK-NO-ROW (ზოგადი ფორმა) | დაკვირვება დაიხურა: 4 ჩავარდნიდან არცერთი ამ კლასის არ არის |
  | D-29z689-ის კანდიდატი (post-frame probe, 1×) | RC-R284-POST-FRAME-PROBE: lessons-ში არ შევიდა (ხაზების ლიმიტი); დაკვირვება RETRO 305-მდე |
  | GATE264-ARCH-TEST-HELPER | ხელახლა განვიხილე. `helpers/workspace-test-environment.ts`-ს `app`-ში 13 ფაილი ასახელებს (`grep -rl`, `helper-users.txt`). a4c0e24-ზე ჩაწერილი „13“-ის დათვლის მეთოდი უცნობია. რჩება სისტემურ კანდიდატად ROOT-RECON-GRID-HARNESS-თან ერთად |

## 9. retro 275-ის ექსპერიმენტი: SWEEP (`claims-findings-hand.txt`)
- **წესი:** უარყოფილია, თუ ≥ 3 sweep-ით გამოწვეული finding-ია, ან SWEEP-tag-იან task-ში ≥ 1 Medium.
- **ფაქტები:**
  - GATE276-T1: Medium, task 276-ს SWEEP ჰქონდა;
  - C-R286-01: Medium, task 286-ს SWEEP არ ჰქონდა;
  - C-R286-02: Low, task 286-ს SWEEP არ ჰქონდა.

  სულ 3, მათ შორის 1 Medium tag-იან task-ში.
- **ვერდიქტი: უარყოფილია ორივე პირობით** (`consequence-tester` ადასტურებს).
- **შენიშვნები:**
  - L23-ის test-reader პუნქტი 277-ში დაემატა. მას შემდეგ tag-იან task-ში Medium 0-ია, მაგრამ ეს მხოლოდ ერთი ფანჯრის მონაცემია.
  - 286 tag-ის გამოუყენებლობაა და არა sweep-ის.
- **stop-პირობები:**
  - B-ის მედიანა $12.77 < $15.77;
  - max tag 24 < 25;
  - `claimRerunMinutes` მხოლოდ 275–276-შია, ამიტომ $3-ის ზღვარი შეუმოწმებადია.
- **counter-ები:**
  - claim-ით გამოწვეული 5 (ზღვარი ≤ 2) — დარღვეულია;
  - STOP-ის შემდეგ C-მდე მისული რაუნდები 2 (საწყისი 1).

## 10. ცვლილებები: lessons, harness, ექსპერიმენტი
- **`lessons.md`: 60 → 59 ხაზი** (D-29z713; diff `b-round-289/lessons-diff.txt`):
  - L27 შეერწყა L52-ს (`tech-lead`-ის ფორმულირება; retro 275-დან გადმოტანილი);
  - L17 შეერწყა L2-ს (alias L17);
  - **ახალია L56** „Every cited artifact exists at hand-off“;
  - L4-ს დაემატა „ruling line“;
  - განახლდა header-ის ხაზი 3.
- **harness:**
  - HR-C-SHADOW-FIELDS გაუქმდა;
  - ახალია HR-C-MANIFEST-FIELDS (C წერს `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, finding-ის `origin`);
  - ახალია HR-CAPTURE-LANE-BY-NAME (screen-review §„გადაღების შეცდომა“).
- **ახალი ექსპერიმენტი EXP-R290-ARTIFACT-MANIFEST** (`consequence-tester`, ფანჯარა 290–304):
  - **ჰიპოთეზა:** B-ის ჩავარდნები ფაქტებიდან მოდის, რომლებიც B-მ თქვა, მაგრამ ფაილში არ შეინახა.
  - **წესი:** L56.
  - **საწყისი მდგომარეობა:** claim/artifact-ით გამოწვეული 5 (2 absent); B-დან მოსული ჩავარდნა 4 / 15; B-ის მედიანა $12.77.
  - **უარყოფილია, თუ:** ≥ 3 claim/artifact finding, ან ≥ 1 absent artifact, ან ≥ 1 FAIL, რომლის წყაროც B-ის pre-check-ია.
  - **stop:** B-ის მედიანა > $15.96, ან C-ის შემოწმება > $2, ან manifest > 30 ხაზი.
  - **null:** 5-ზე ნაკლები task, რომელიც artifact-ს ან რიცხვს ასახელებს.

## 11. სისტემური დავალება
**SYS-VACUOUS-ROWS** (`tech-lead`). ერთი test-only რაუნდი, FIX-PD-1-ის შემდეგ. ხურავს A-R278-REVIEW-METRONOME-SPY, C-R283-01, A-R283-REVIEW-LOAF-SCRIPTS და A-R284-REVIEW-ZQ3-VACUITY.

საერთო მიზეზი: row, რომელსაც არცერთი mutant არ აწითლებს (L52). C-R282-03 უკვე დახურულია (round 283).

## 12. Saba-სთვის (წინადადებები, loop-ში არ სრულდება)
1. **RC-R275-STOP-ROUTES-TO-B** (განმეორებით). A-ს STOP-ის შემდეგ runner-მა რაუნდი B-ს დაუბრუნოს და არა C-ს. ამ ფანჯარაში 2 ასეთი რაუნდი C-მდე მივიდა: 276 (PASS, ერთი ნახევარ-row ჩავარდა) და 282 (FAIL).
2. **ეკრანის მიმოხილვა:** `user-review/screen-review-290.md` (SR-290-1…10, SABA-Q-LIB-SINGLE-RUN).
3. **საბოლოო ხელით შემოწმებების სიაში** ახლა TLM-R274-SR-HELD-REPEAT-იცაა.
4. პროექტის წესებში (`.claude/*`, `CLAUDE.md`) ცვლილებას არ ვთავაზობ.

## 13. შემდეგი
round 290 (C ამოწმებს ამ retro-ს) → 291 FIX-PD-1b2 (gate-289 Medium-ები) → REGRESSION, როცა ვადა მოვა (2026-11-02-დან) → FIX-PD-1c → SYS-VACUOUS-ROWS → STUDIO-LINK → NAME-AND-HINT → STUDIO-PERFORMANCE-ის დანარჩენი (D-29z717).
