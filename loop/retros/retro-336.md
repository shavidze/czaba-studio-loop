# RETRO 336 — მეათე რეტროსპექტივა (რაუნდები 321–335)

**თარიღი:** 2026-11-04 · **ავტორი:** B (D-29z1014) · **სტატუსი:** C ამოწმებს round 336-ში (RT-* row-ები).

**წესები:**
- „Retrospective: stop, look back, improve“ (Saba, 2026-10-26);
- „Look back on every issue Saba finds, and guard the whole screen“ (Saba, 2026-10-28);
- RETRO-ზე გზის მიმოხილვა (Saba, 2026-10-31);
- `backlog.json` → `retro_policy`.

**კონსულტაციები** (read-only, ორივე რეალურად გამოძახებულია):
- retro-სთვის: `tech-lead`;
- ეკრანისა და გზისთვის: `product-designer`.

retro-ს წესი `consequence-tester`-სა და `qa-engineer`-ს ასახელებს, ეკრანის მიმოხილვა კი `design-philosopher`-სა და `first-visit-host`-ს. 2026-11-04-ის წესის §6-მა B-ის კონსულტაციების სია ოთხამდე შეამცირა (`product-designer`, `tech-lead`, `performance-optimizer`, `ableton-arrangement-expert`). ამიტომ ეს ოთხი არ გამომიძახებია. ექსპერიმენტის ვერდიქტი (§9) B-მ მისი დაწერილი წესით გამოიტანა და ის `consequence-tester`-ის აზრად არ არის წარმოდგენილი. ორივე კონსულტაციის შემდეგ store-ის tree შევამოწმე: `git status` ცარიელია და `sha256sum -c` rc 0 (`b-round-335.md` §2).

**ფანჯარა:** 321–335 (15 რაუნდი). Round 321 თავად RETRO იყო და ფანჯარაში შედის (retro 305/321-ის პრეცედენტი).

**ყველა რიცხვის წყარო.** გზები `tmp/studio-real-loop/`-ის მიმართაა. სკრიპტები გაუშვით loop-ის root-იდან: `python3 -I b-round-335/<script>`. ისინი retro 321-ის ასლია ფანჯრით 321–335.
- `collect.py` → `rounds-321-335.json` (გამოტანა `collect.txt`).
- `cost.py` → `cost-rows.json`; ჯამები `cost.txt`-შია. B-ის ღირებულება წანაცვლებულია: `b-round-(N−1)-result*.json` არის რაუნდ N-ის დაგეგმვა. ამ დაგეგმვის (336) ღირებულება ფანჯარაში არ შედის.
- `retro-numbers.py` → `retro-numbers.txt`. ჯგუფები ხელითაა შედგენილი `task-titles.txt`-ის მიხედვით, retro 321-ის სიიდან არაფერია გადმოტანილი.
- `fails-detail.py` → `fails-detail.txt`; `gate-reviews.py` → `gate-reviews.txt`, ხელით შესწორება `gate-reviews-hand.txt`-შია.
- `classify.py` → `classify.txt`, `classify-out.json`; `deferred-totals.txt`; `open-medium-plus.txt`.
- `manifest-fields.py` → `manifest-fields.txt`; `exp-fields.py` → `exp-fields.txt`.
- `awaiting-user.py` → `awaiting-user.txt`.
- `misc-outputs.sh` ქმნის `task-titles.txt`, `stops-count.txt` (`grep -c 'STOP — needs B ruling' a-round-N.md`), `deferred-totals.txt`, `open-medium-plus.txt` (ფილტრი: severity Critical/High/Medium და სტატუსი არ იწყება closed/done/resolved/wontfix/deferred-ით), `archived-mediums.txt` და `c-models.txt`.
- ხელით: `fails-cause-hand.txt` (§3).
- inventory: `retro336-mentions.py` → `retro336-mentions-v2.txt`, `retro336-mention-ids-v2.txt` (§8).

**C-R215-01-ის გაკვეთილი:** სკრიპტები კითხულობს `b-round-335/backlog-before-336.json`-ს, backlog-ის ცვლილებამდე აღებულ ასლს.

**ღირებულების შენიშვნა:** რიცხვები `*-result*.json`-ის `total_cost_usd`-იდან მოდის. სესიის გაგრძელებისას ჯამი შეიძლება ნაკლები გამოვიდეს. ეს retro 321-ის მეთოდიცაა.

---

## 1. მოკლედ
- **C PASS 10, FAIL 5** (321, 322, 323, 327, 329). `browserVerified=false` ორჯერ იყო (322, 323): ორივე STOP-ის რაუნდია, სადაც ბრაუზერის row ვერ გაეშვა. retro 321-ის ფანჯარაში 10 / 6 იყო.
- **Gate:** გამოქვეყნდა 9, skipped 5 (ხუთივე C FAIL), **failed 1**. 325-ში verify ჩავარდა IM24-ზე, 326-მ გაასწორა.
- **ღირებულება $339.76** = B $150.61 + A $112.15 + C $77.00.
  - რაუნდის მედიანა $20.23 (retro 321: $24.46).
  - FAIL-რაუნდებზე დაიხარჯა $117.06 (retro 321: $150.14).
  - B-ის წილი 44%-ია. **B-ის დაგეგმვის მედიანა $9.20** (321–335), 322–335-ში კი $8.685 (retro 321: $12.12).
- **ოთხი fix-up ჯაჭვი** (§3): PERF-8b 322 → 323 → 324, gate 325 → 326, PERF-DRAG-PREVIEW b 327 → 328 და c1 329 → 330. fix-up რაუნდები ჯამში $101.29-ია ($86.26 C FAIL-ის შემდეგ და $15.03 gate-ის შემდეგ).
- **feature-ის 9 პირველი ეტაპიდან C-ზე 3 ჩავარდა** (322, 327, 329). retro 321-ში 7-დან 3 იყო.
- **330-დან ექვსი რაუნდი ზედიზედ PASS-ია და გამოქვეყნდა** (330–335).
- **A-ს STOP: 4** (322, 323, 324, 327). ოთხივე C-მდე მივიდა: 322, 323 და 327 FAIL-ით, 324 PASS-ით.
- **EXP-R321-PRECHECK-GATES:** შუალედური შედეგია „როგორც დაიწერა, ისე ვერ ფასდება“ (§9). ფანჯარა 337-ზე იხურება.
- **დასრულდა:**
  - RT-FIX 321 (322-ში);
  - **PERF-8b** (322–324);
  - PERF-DRAG-PREVIEW-ის ეტაპები: a (325–326), b (327–328), c1 (329–330), c2a (331), c2b-i (332), c2b-ii (333), c2b-iii (334) და c3-i (335).
- **Critical / High 0.** ღია Medium-ები (`open-medium-plus.txt`, backlog-ის ცვლილებამდე):
  - ძველი, დაპარკული: A-R73-SAFARI-FLAG-FOCUS, GATE232-S2, GATE271-S1-NO-REALIGN, GATE274-S1-HELD-REPEAT-ANNOUNCE;
  - GATE304-M1-PERF-LIB-NOT-IN-GATE (root-ის vitest include);
  - კიდევ სამი ჩანაწერი (C-R211-02, GATE219-S1, A-R267-REVIEW-GESTURE-ARROW): მათი სტატუსია „merged into …“.
  - **retro 321-ის სიიდან ორი Medium აქტიურ backlog-ში აღარ ჩანს** (`archived-mediums.txt`). root-ის `cloud/optimize-backlog.py`-მ ისინი `archive/findings-archived.json`-ში გადაიტანა:
    - GATE128-S1-MIXED-LANGUAGE: დაგეგმვის შენიშვნა იყო, არა დეფექტი. V-0-ით (VISUAL-A) დაიხურა;
    - R80-RECORDINGS-FIELD-BORDERS: source done (round 195, `7339cd5`), ბრაუზერის row BLOCKED, რადგან cloud-ში backend არ არის. ის **ისევ ღია backend-ის მტკიცებულებაა**. archive-ში გადატანა დახურვას არ ნიშნავს: root-ს ეცნობება (§12.4).
  - ფანჯარაში ახალი Medium არ დარჩენილა. C-R322-01 და C-R323-01 round 324-მა დახურა (`tasks/round-323.md` და `tasks/round-324.md` სათაურები; `c-round-324.json` PASS). C-R327-01 round 328-მა დახურა (`tasks/round-328.md` სათაური; `c-round-328.json` PASS).

## 2. ციფრები
| რა | მნიშვნელობა | წყარო |
|---|---|---|
| რაუნდები | 15 (321–335) | `collect.txt` |
| C PASS / FAIL | 10 / 5 | `cost.txt` |
| Gate published / skipped / failed | 9 / 5 / 1 | `cost.txt` |
| ღირებულება B / A / C / სულ | $150.61 / $112.15 / $77.00 / $339.76 | `cost.txt` |
| რაუნდის მედიანა | $20.23 | `cost.txt` |
| ფაზების მედიანა B / A / C | $9.20 / $5.44 / $5.90 | `retro-numbers.txt` |
| ყველაზე ძვირი ფაზა | A 324 ($20.24), A 325 ($19.71), B-ის დაგეგმვა 321 ($19.02) | `retro-numbers.txt` |
| FAIL-რაუნდების ღირებულება | $117.06 | `cost.txt` |
| ჯგუფები: RETRO / feature stage / fix-up C FAIL-ის შემდეგ / fix-up gate-ის შემდეგ | $25.54 / $212.93 / $86.26 / $15.03 | `retro-numbers.txt` |
| fix-up-ები ცალ-ცალკე | 323 $16.35, 324 $36.20, 326 $15.03, 328 $18.14, 330 $15.57 | `retro-numbers.txt` |
| C `bugs[]` | Medium 3, Low 13 | `retro-numbers.txt` |
| gate review.md | 9 ფაილი, 42 დანომრილი finding (სკრიპტით 38 + 334-ის 4 ხელით), Critical 0 | `gate-reviews.txt`, `gate-reviews-hand.txt` |
| ფანჯრის finding-ები (open + deferred) | 28 + 16 = 44 | `classify.txt` |
| deferred_low_polish | 592 სულ (ცვლილებამდე) | `deferred-totals.txt` |
| awaiting_user | 88 id (retro 321: 82) | `awaiting-user.txt` |
| A-ს STOP | 4 (322, 323, 324, 327) | `stops-count.txt` |
| A-ს მედიანა | 321–328: $7.655, 329–335: $4.54 | `retro-numbers.txt` |
| C-ის მედიანა | 321–331: $6.32, 332–335: $1.23 | `retro-numbers.txt` |

**C-ის ღირებულების ვარდნა 332-იდან.** 2026-11-04-ის წესის §8-ით C Sonnet-ზე გადავიდა. `c-models.txt` (`modelUsage`, `c-round-N-result.json`) ამას ადასტურებს: 321–331-ში `claude-opus-5-5` (+ advisor) იყო, 332–335-ში `claude-sonnet-5-5`. რომ ვარდნა **მხოლოდ** მოდელის ბრალია, ეს დასკვნაა. C-ის ხარისხი არ დაცემულა: 332–335-ის ოთხივე რაუნდი PASS-ია, mutant-ები წითელია და gate-მა ოთხივე გამოაქვეყნა (`exp-fields.txt`, `collect.txt`).

## 3. FAIL-ები და fix-up ჯაჭვები: რატომ და რომელი წესი აიცილებდა (`fails-cause-hand.txt`)
| რაუნდი | წყარო (C-ის `origin`) | რა მოხდა | წესი |
|---|---|---|---|
| 321 C FAIL | B, retro-ს დოკუმენტი | სამი Low traceability-ზე (C-R321-01/02/03) | L56/L58. RT-FIX 322-ში PASS-ით დაიხურა |
| 322 C FAIL | B spec + A STOP | C-R322-01 (Medium). `render-budget.test.tsx` l.617 იმ კავშირს ამაგრებდა, რომელსაც PERF-8b ხსნიდა. B-ის sketch მხოლოდ ტიპების იყო: ის covering ფაილებს ტესტამდე ამტვრევდა და ამ assert-ს მალავდა | L58-ის crash clause (C-R322-01, ფანჯარაში დაემატა) |
| 323 C FAIL | B spec + A STOP | C-R323-01 (Medium). ruling-ის memo-მ positive control R11-P1e გააჩუმა | L58-ის memo clause (C-R323-01, ფანჯარაში დაემატა) |
| 325 gate failed | ტესტის timing | C PASS იყო. verify-ში IM24 ჩავარდა: playing-state-ის წაკითხვა gate-ის დატვირთვაზე (`gates/round-325/verify.log` l.733, l.4918) | L37. 326-მა წაკითხვა დეტერმინისტული გახადა |
| 327 C FAIL | B-ის sketch-ის დიზაინი + A STOP | C-R327-01 (Medium). §1.2.3-ის flush-then-dispatch რიგმა drag-ის შუაში ძველი ტექსტი aria-live-ში ჩასვა. ეს A-ს reviewer-მა finding 1-ად უკვე დაინახა, A გაჩერდა, მაგრამ C მაინც გაეშვა | **ახალი:** L58-ის sketch-review clause და L22-ის მოკლე გზა |
| 329 C FAIL | B spec, გაუზომავი premise | C-R329-01 (Low). პირობა „round 328-ის ტოლი“ +1-ით ჩავარდა (memo-ს გარეშე leaf) | L58-ის clause „„ტოლი“ assert-იცაა“ (C-R329-01, ფანჯარაში დაემატა) |

- **324:** A გაჩერდა მხოლოდ claim-ის მნიშვნელობაზე (K19). C-მ სრულად შეამოწმა, PASS დაწერა და round გამოქვეყნდა (C-R324-01 Low, B spec). ამიტომ L22-ის ახალი clause claim-ის STOP-ს მოკლე გზიდან გამორიცხავს (`tech-lead`).
- **ხუთი FAIL-იდან ოთხის წყარო B-ია** (322, 323, 327, 329), მეხუთე, 321, B-ის retro-ს დოკუმენტია. სამის წესი ფანჯარაშივე დაიწერა, და 330-ის შემდეგ ექვსი PASS ზედიზედ მოვიდა. ეს ემთხვევა იმას, რომ L58-ის დამატებები მუშაობს, მაგრამ მიზეზობრიობას არ ამტკიცებს (`tech-lead`-ის აზრი).

## 4. Findings-ის კლასიფიკაცია (`classify.txt`)
- **origin, ფანჯარა (open + deferred):** gate reviewer 20, A 15, C 8, B 1. ორი pool ერთმანეთს ფარავს: ერთი id ორივეში შეიძლება იყოს (მაგ. C-R326-01, GATE328-S1).
- **severity:** open_findings-ში Low 14, info 14; deferred-ში Low 16.
- **კატეგორია:** ყველაზე დიდია timing/audio (open 6 + deferred 6), შემდეგ uncategorised (8 + 3: ძირითადად info და PERF-ის სიგნალები).
- regex მხოლოდ რიცხვიან id-ებს ითვლის (C-R, A-R, GATE, B-R, INFO-C …). SIG-* და ARCH-* id-ები `architecture_signals`-ში ან სტატუსებშია და აქ არ ჩანს.
- ფანჯრის სამივე Medium (C-R322-01, C-R323-01, C-R327-01) B-ის spec-იდან ან sketch-იდან მოვიდა და ფანჯარაშივე დაიხურა.

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **უკეთესი spec (B):** 322, 323, 327, 329 (§3).
- **A-ს self-check:** 327-ში A-მ ზუსტად ის გააკეთა, რასაც L11 ითხოვს. reviewer-ის finding-ზე გაჩერდა და მეტი არაფერი შეცვალა. დანაკარგი ის იყო, რომ C მაინც სრულად გაეშვა ($7.65). **ახალი L22 clause** ასეთ რაუნდს მოკლე გზას აძლევს.
- **shared helper:** perf spec-ში `measureDrag` და `measureLaneDrag` window-ის აღრიცხვას იმეორებს. ოთხი Low/info და ერთი არქიტექტურული სიგნალი ერთი მიზეზიდან მოდის (§11).
- **გარემო:** ცივი Vite dev server-ის timeout-ები C-მ სწორად ჩაანაცვლა (L38, მაგ. `c-round-335.md` Notes, `c-round-329.md` Environment). ჩავარდნა არცერთს არ გამოუწვევია.

## 6. Saba-ს ნაპოვნი საკითხები (2026-10-28-ის წესი)
ფანჯარაში ახალი SABA-B-* არ გაჩენილა: ბოლო ისევ SABA-B-11-ია, მთლიანი სია `backlog.json`-ის id-ებშია. დასათვლელი არაფერია. ძველი SABA-B-ების ტიპი (ხილული clutter, fader-ის სტილი, focus) §4-ის ფანჯრის finding-ებში არ განმეორებულა. ფანჯარაში ხილული არაფერი შეცვლილა (§12, `screen-review-336.md`).

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
- **SYS-R336-PERF-DRAG-WINDOW-ის დრო.** Gate 335-ის reviewer-მა helper-ის გამოყოფა c3-ii-ის **შემდეგ** შესთავაზა, რადგან ეტაპის შუაში row-ის მნიშვნელობები შეიძლება შეიცვალოს. `tech-lead`-მა c3-ii-მდე: c3-ii…c5 იმავე spec-ს row-ებს ამატებს, ამიტომ ფასი ყოველ ეტაპზე იზრდება. **გადაწყვეტილება (D-29z1019): c3-ii-მდე.** რისკს მიღება ზღუდავს: ყველა დეტერმინისტული row უნდა იყოს EQUAL C round 335-ის run-თან, row-ების id-ების სიმრავლე კი იგივე.
- **GATE335-S1 (mouse-up `finally`-ში არ არის).** advisor-ს required row c3-ii-ში ჰქონდა. რადგან SYS-R336 c3-ii-მდე მიდის და იმავე კოდს ეხება, S1 SYS-R336-ში შევიდა და mutant row მიიღო.
- **RC-R275 (STOP → B).** მეხუთედ იგივე ფორმით აღარ ვაყენებ. `tech-lead`-მა loop-ის შიგნით გამოსავალი შესთავაზა: L22-ის clause. Saba-ს ერთხელ ეცნობება (§12). root-ის ცვლილება მხოლოდ მაშინ მოითხოვება, თუ მოკლე გზით წასული STOP მაინც სრულ C-run-ს დაჯდება.
- **checkpoint D-29z915-ის რიგი (`tech-lead`-ის შენიშვნა).** checkpoint c3-მდე იყო მოთხოვნილი, მაგრამ პასუხი არ მოსულა. c3-i 335-ში ჩაწერილი default-ით (keep, D-29z1007) გაეშვა. ეს წესით მოხდა და გადახრა არ არის, მაგრამ checkpoint ოთხ რაუნდზე მეტია უპასუხოდ დგას. L46-ის ვადები (SIG-R331-DETAIL-PICK, SIG-R332-OVERVIEW-PICK) root-ს ამავე checkpoint-ის კითხვად გადაეცა (D-29z1018).
- **SR-336-2.** `product-designer`-ის აზრით scroll მთელ row-ებზე პოზიციას არ ცვლის, ამიტომ Saba-ს კითხვა არ სჭირდება. B მაინც კითხვად წერს: scroll-ის ქცევა ქცევაა, და screen-review-ის წესით loop Saba-ს პასუხამდე არაფერს ახორციელებს.

## 8. ღია კანდიდატების ბედი (inventory: `retro336-mention-ids-v2.txt`, `retro336-mentions-v2.txt`)
regex: `retro[ -_]?33[56]|RETRO \(33[56]\)|RETRO round 33[56]|round 33[56]|retro 336 window|RETRO-336` (case-insensitive), before-ასლზე. 14 id და 3 string.
| id / ადგილი | ბედი |
|---|---|
| `post_current_stage_queue` STUDIO-PERFORMANCE | სტატუსი განახლდა (c3-i done; შემდეგია RETRO 336, REGRESSION, SYS-R336) — D-29z1011, D-29z1021 |
| stage PERF-DRAG-PREVIEW | სტატუსი განახლდა: c3-i done, c3-ii SYS-R336-ის შემდეგ — D-29z1011 |
| SIG-R331-DETAIL-PICK | L46-ის ვადა (RETRO 336) დადგა → root-ს checkpoint D-29z915-ის კითხვად. ახალი ვადა: c5-ის დახურვა — D-29z1018 |
| SIG-R332-OVERVIEW-PICK | იგივე — D-29z1018 |
| B-R332-METER-NAME-RENAME | გაიყო (`tech-lead`). runtime-name-ის ნახევარი გაუქმდა (L23 და L58 უკვე ფარავს), comparator-ის ნახევარი → RC-R332-COMPARATOR-BRANCH (watch, 1×) — D-29z1018 |
| REGRESSION-ROUND-2026-11-05 | round 337, თუ დაგეგმვა 2026-11-05-ზე ან შემდეგაა; სხვა შემთხვევაში პირველი ასეთი დაგეგმვა — D-29z1021 |
| D-29z973, D-29z986 | ისტორიული ჩანაწერები (L46-ის ვადები). შესრულდა D-29z1018-ით |
| D-29z1006, D-29z1007, D-29z1008, D-29z1010 | ისტორიული ჩანაწერები (round 335-ის task). „round 335“ აქ c3-i-ს ნიშნავს. დაიხურა D-29z1011-ით |
| RC-R305-LESSON-CHAR-CAP | L23 უცვლელია, 5058 byte (`sed -n 16p lessons.md \| wc -c`). watch გრძელდება RETRO 351-მდე და ახლა L58-საც მოიცავს (2803 byte). ზღვარი > 5500 — D-29z1020 |
| RC-R321-RECORD-WORDING | **მიღებულია** → L58-ის clause — D-29z1015, D-29z1020 |
| `current_task` (string) | განახლდა round 336-ზე |
| `retro_policy.next_due` (string) | → „round 351 ან STUDIO-PERFORMANCE-ის დასრულება (ფანჯარა 336–350)“ — D-29z1014 |
| `retro_policy.signals_for_next_retro` (EXP-R321) | §9: შუალედური შედეგი; საბოლოო ვერდიქტი RETRO 351-ზე — D-29z1016 |

regex-ს გარეთ, მაგრამ ამ RETRO-სთვის დაწერილი:
- `b-round-333.md` l.42 / `b-round-334.md` l.48 (stale-derived mutant) → **RC-R333-STALE-DERIVED-MUTANT** (watch, 1×), D-29z1018.
- RC-R275-STOP-ROUTES-TO-B → §7, D-29z1020.
- gate 335-ის Architecture note → ARCH-R335-DRAG-WINDOW-HELPER → SYS-R336 (§11).

## 9. retro 321-ის ექსპერიმენტი: EXP-R321-PRECHECK-GATES — შუალედური (`exp-fields.txt`, `retro-numbers.txt`)
- **წესი** (retro-321 §10, ფანჯარა 322–337):
  - უარყოფილია, თუ (a) ≥ 1 ჯაჭვია ≥ 2 fix-up-ით და მისი საწყისი check B-მ sketch-ზე მწვანედ გაუშვა, ან (b) ≥ 2 ჯაჭვია pre-check-ის სრული დაფარვის მიუხედავად;
  - stop: B-ის მედიანა > $13.94, ან შედეგის ფაილები 2 რაუნდში აკლია;
  - null: gate-check-ს 3-ზე ნაკლები რაუნდი ასახელებს.
- **ფაქტები:**
  - null არ არის: 322–335-ის 14-ივე რაუნდი 6 gate-check-ს ასახელებს.
  - **treatment არცერთ რაუნდში არ მიწოდებულა სრულად:** `gateChecksRunOnSketch` 0–2-ია 6-დან. ექვსი დასახელებული check ყოველთვის ერთი და იგივე boilerplate gate row-ებია (full vitest, build, Biome, typecheck, verify, e2e smoke).
  - (a) არ შესრულდა. ერთადერთი ჯაჭვი ≥ 2 fix-up-ით (322 → 324) იმ check-იდან დაიწყო, რომელიც B-მ type-sketch-ზე განზრახ წითლად გაუშვა (collision list, `b-round-321.md` l.56). ეს მწვანე run არ იყო.
  - (b) არ შესრულდა, რადგან არცერთ რაუნდს სრული დაფარვა არ ჰქონდა.
  - stop არ შესრულდა: B-ის მედიანა 322–335-ში $8.685-ია. ველები 322–335-ის ყველა JSON-შია.
  - countermetric (A-ს ღირებულება): A-ს მედიანა $7.655-დან (321–328) $4.54-მდე დაეცა (329–335). ღირებულება B-დან A-ზე არ გადასულა.
- **შუალედური შედეგი: „როგორც დაიწერა, ისე ვერ ფასდება“** (`tech-lead`-ის აზრი, B ეთანხმება). ეს ვერდიქტი არ არის: ფანჯარაში ორი რაუნდი რჩება (336, 337).
- **რა იცვლება:** ტერმინი ფანჯრის შუაში არ იცვლება, რადგან ეს post-hoc იქნებოდა. round 337-იდან C პარალელურად წერს ახალ ველებს `affectedChecksNamed` და `affectedChecksRunOnSketch` (L57). ეს ის check-ებია, რომელთა შედეგიც ცვლილებას შეუძლია შეცვალოს: covering vitest ფაილები, perf spec, pixel compare. ეს მემკვიდრე ექსპერიმენტის საწყისი წერტილია. საბოლოო ვერდიქტი RETRO 351-ზეა.

## 10. ცვლილებები: lessons და ველები
- **`lessons.md`: 59 → 59 ხაზი** (D-29z1015; diff `b-round-335/lessons-diff.txt`, ოთხი ხაზი იცვლება). ყველა ცვლილება `tech-lead`-ის წინადადებაა:
  - **L58**-ს ორი clause დაემატა:
    - row, რომელიც sketch-ზე ვერ გაეშვა, ასე იწერება: `record — not run on sketch: <reason>`. A მას budget-ად და STOP-ად არ თვლის (RC-R321-RECORD-WORDING);
    - **B-ის sketch dispatch-მდე code-reviewer-ს გადის.** ყოველი Medium+ ან sketch-ში სწორდება, ან task-ში id-ით წყდება (C-R327-01).
  - **L22**-ს დაემატა: A-ს STOP ruled clause-ზე, diff-ით → C უშვებს მხოლოდ SOURCE-SCOPE-ს, CLAIMS-ს, auth guard-სა და STOP-ში დასახელებულ check-ს, და წერს მოკლე FAIL-ს „STOPPED — routed to B“. claim-ის მნიშვნელობაზე STOP სრულ run-ს ინარჩუნებს (322, 323, 327; 324).
  - **L57**-ს დაემატა `affectedChecksNamed` და `affectedChecksRunOnSketch` round 337-იდან.
  - **line 3** ახლა `retro-336.md`-ზე მიუთითებს და RETRO 336-ის ჩანაწერი აქვს.
- **L23 არ შეცვლილა** (5058 byte).
- ახალი ხაზი არ დამატებულა, ამიტომ წაშლა ან შერწყმა არ დასჭირდა.

## 11. სისტემური დავალება
**SYS-R336-PERF-DRAG-WINDOW** (D-29z1019) ერთი test-only დავალებაა: `perf/studio-lab-interactions.perf.spec.ts`. მასში:
- ერთი საერთო drag-window helper (down/up/firstMove, window-ის row-ები, per-move), რომელსაც `measureDrag`-იც და `measureLaneDrag`-იც იყენებს;
- gesture `try/finally`-ში, `mouse.up()`-ით;
- დასახელებული lane-segment-ის კონსტანტები;
- 1×-ის `interactionSequence` ტექსტი კოდის რიგით.

**ხურავს:** GATE335-S1-MOUSE-UP-FINALLY, GATE335-S3-LANE-SEGMENT-CONSTANTS, GATE335-S4-REPEATED-NOTES, A-R335-REVIEW-WHOLE-NOTE, INFO-A335-SEQUENCE-ORDER, ARCH-R335-DRAG-WINDOW-HELPER.

**მიღება:**
- row-ების id-ების სიმრავლე იგივეა;
- ყველა დეტერმინისტული row EQUAL-ია `c-round-335/perf-results/latest-interactions.json`-თან;
- liveness 1-ია;
- mutant, რომელიც `finally`-ს შლის, ჩაჭედილ ღილაკს აჩენს.

**ადგილი:** REGRESSION-ის შემდეგ (თუ ის დროულია) და c3-ii-მდე. app-ის კოდი არ იცვლება.

aria-live-ის same-text ოჯახი (A-R327-REVIEW-SAME-TEXT-REMOUNT, A-R328-REVIEW-SAME-TEXT-RACE, GATE328-S1…S3) პროდუქტის ქცევაა და უკვე checkpoint D-29z915-ის კითხვაა (A-R327-ARCH-STATUS-ONE-SOURCE). ამიტომ ის ჯერ bounded task არ არის (`tech-lead`). A-R328-REVIEW-SAME-TEXT-RACE-ს და GATE328-S1-ს REGRESSION-ში browser probe აქვს.

## 12. Saba-სთვის (წინადადებები; loop-ში არ სრულდება)
1. **STOP-ის მარშრუტი (RC-R275, ინფორმაციისთვის).** loop-მა თავად გამოასწორა: A-ს STOP diff-ით ახლა C-ის მოკლე რაუნდს იწვევს (L22). ამ ფანჯარაში 3 ასეთი STOP-მა C-ის სრული run ჩავარდნით დაასრულა: 322, 323 და 327, ჯამში $65.40 (`retro-numbers.txt`). runner-ის ცვლილებას მხოლოდ მაშინ ვითხოვთ, თუ მოკლე გზაც ძვირი აღმოჩნდება.
2. **ეკრანის მიმოხილვა:** `user-review/screen-review-336.md`. 15 რაუნდში ეკრანზე არაფერი შეცვლილა: ყველა რაუნდი სიჩქარეს ეხებოდა. ყველაზე სუსტი ნაბიჯი ისევ SR-305-3-ია: „Try it in the Studio“ ცარიელ timeline-ზე ჩერდება. ახალი კანდიდატებია SR-336-1 და SR-336-2. `product-designer`-ის აზრით, მხოლოდ SR-305-3-ზე და SR-321-2-ზე პასუხი გზას უკვე გახსნიდა.
3. **88 კითხვა ელოდება შენს პასუხს** (`b-round-335/awaiting-user.txt`; retro 321-ში 82 იყო). არცერთი loop-ს არ ბლოკავს.
4. **root-ისთვის:**
   - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1) ისევ ღიაა;
   - `optimize-backlog.py`-მ R80-RECORDINGS-FIELD-BORDERS (Medium, ღია backend-ის მტკიცებულება) archive-ში გადაიტანა. backend-ის მქონე შემოწმებამდე ის აქტიურ სიაში უნდა დარჩეს (§1);
   - checkpoint D-29z915 (preview-ის მფლობელი, status-ის ერთი წყარო, Pick projection) უპასუხოდ დგას და default keep მოქმედებს. მას დაემატა SIG-R331/SIG-R332-ის L46-ის კითხვა (`b-round-335.md` §8).
5. **პროექტის წესის წინადადება (retro 321-იდან, ისევ ღიაა):** `store/.claude/primitives/REACT_CONTEXT.md`-ში ჩაიწეროს, რომ Studio-ს ახალი store-ები zustand-ზე იწერება (D-29z193). loop ამას თავად არ ცვლის.

## 13. შემდეგი
round 336-ში C ამოწმებს ამ retro-ს. შემდეგ round 337:
- თუ 337-ის დაგეგმვა **2026-11-05-ზე ან შემდეგაა** → **REGRESSION** (`regression-last` 2026-11-02), C-R318-06-ის repro row-ით და დანარჩენი `scope_additions`-ით;
- სხვა შემთხვევაში → **SYS-R336-PERF-DRAG-WINDOW**, ხოლო REGRESSION 2026-11-05-ის პირველ დაგეგმვაზე.

ამის შემდეგ: SYS-R336 (თუ ჯერ არ გაშვებულა) → PERF-DRAG-PREVIEW c3-ii (liveness assert-ით) → c4 → c5 → record → assert-ის კონვერსიები → PERF-9…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule).

შემდეგი RETRO: round 351 ან STUDIO-PERFORMANCE-ის დასრულება, რომელიც უფრო ადრე მოვა.
