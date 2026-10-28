# RETRO 215 — მეორე რეტროსპექტივა (რაუნდები 200–214)

**თარიღი:** 2026-10-28 · **ავტორი:** B (D-29z211) · **წესი:** policy „Retrospective: stop, look back, improve“ (Saba, 2026-10-26), `backlog.json` → `retro_policy` · **სტატუსი:** Round 215-ში C ამოწმებს (RT-* row-ები)

**კონსულტაციები:** `tech-lead` და `consequence-tester` (read-only, ორივე გამოძახებულია). `qa-engineer` B-ის ნებადართულ სიაში არ არის, ამიტომ არ გამოძახებულა; C-ს შეუძლია Round 215-ში გამოიძახოს. Advisor ხელმისაწვდომი იყო და გამოყენებულია.

**ფანჯარა:** რაუნდები 200–214 (15 რაუნდი), retro 200-ის შემდეგ. Round 200 თავად RETRO იყო და ფანჯარაში შედის.

**ყველა რიცხვის წყარო** (`tmp/studio-real-loop/`-ის მიმართ; სკრიპტები მხოლოდ loop-ის ფაილებს კითხულობს, გაუშვით loop-ის root-იდან):
- `b-round-214/collect.py` → `rounds-200-214.json`, `collect.txt` (C-ის ვერდიქტი, ბაგები, gate, ღირებულება);
- `b-round-214/cost.py` → `cost.txt`, `cost-rows.json`. B-ის ღირებულება წანაცვლებულია: `b-round-(N−1)-result*.json` რაუნდ N-ის დაგეგმვაა. ამ დაგეგმვის (Round 215) ღირებულება ფანჯარაში არ შედის. **Root gate-ისა და reviewer-ის ღირებულება არ ითვლება** (ფაილი არ არსებობს).
- `b-round-214/retro-numbers.py` → `retro-numbers.txt` (ფაზების მედიანა, ბაგების ჯამი, re-do რაუნდები);
- `b-round-214/fails-detail.py` → `fails-detail.txt`;
- `b-round-214/gate-reviews.py` → `gate-reviews.txt` (gate review-ში დანომრილი პუნქტები; ევრისტიკა);
- `b-round-214/classify.py` → `classify.txt`, `classify-out.json` (keyword-ების ევრისტიკა, როგორც retro 200-ში);
- `b-round-214/window-findings.py` → `window-findings.txt`; `b-round-214/l28-status.py` → `l28-status.txt`;
- `b-round-214/totals.py` → `deferred-totals.txt`, `open-medium-plus.txt`.

**შენიშვნა:** `classify`, `window-findings`, `l28-status` და `deferred-totals` ამ დაგეგმვის backlog-ის ცვლილებების (`update-backlog-1..4.py`) **შემდეგ** გაეშვა. ამიტომ ისინი შეიცავს ამ დაგეგმვაზე დამატებულ ID-ებს (GATE214-S1..S5, GATE214-DOC168-STATUS, B-R214-DOC160-161-STATUS, A-R214-DEV-*, C-R214-BIOME-PERF-VACUOUS). ცვლილებამდე `deferred_low_polish` 319 ჩანაწერი იყო (`b-round-214/backlog-before-215.json`).

---

## 1. მოკლედ

- **15 რაუნდი: C PASS 11, FAIL 4** (200, 201, 202, 209). `browserVerified=false` ორჯერ იყო (201, 209). ორივეჯერ A შეჩერდა (STOP) და დასამოწმებელი არაფერი იყო.
- **Gate:** გამოქვეყნდა 9, skipped 4 (ოთხივე C FAIL), blocked 1 (204), failed 1 (212).
- **ღირებულება:** $409.94 = B $151.29 + A $146.46 + C $112.19. რაუნდის მედიანაა $28.54. retro 200-ის ფანჯარაში იყო $21.12. ეს შედარება ორიენტირებითია: სამუშაოს სახე შეიცვალა (PERF harness-ის რაუნდები ძვირია).
- **FAIL-რაუნდების ღირებულება** $100.40 (~24 %). **Re-do რაუნდებისა** (202, 203, 210, 213) $101.46.
- **მთავარი დასკვნები:**
  1. **ყველაზე ხშირი განმეორებადი კლასი არის დოკუმენტის სტატუსის მოძველებული ხაზი** (implementation doc-ის l.4). ფანჯარაში gate-მა და root-მა ის 8-ჯერ დააფიქსირა; 8-დან 7 L28-ის დაწერის (Round 206-ის დაგეგმვა) შემდეგ მოხდა (GATE205-DOC162-STATUS მანამდე იყო). დაგეგმვისას B-მ კიდევ 2 ჩაუწერელი იპოვა (docs 160, 161). L28-ის წესი root-ის amend-ის ნაბიჯს ეყრდნობოდა, რომელიც არ სრულდება. ამიტომ L28 შეიცვალა (§7) და დაემატა SYS-4 (§6).
  2. **ორივე STOP ისეთი კლასიდან იყო, რომელზეც გაკვეთილი უკვე არსებობდა:** 201 L1-ის კლასიდან, 209 L23-ის კლასიდან. გაკვეთილები სწორი იყო, მაგრამ შემოწმების მოცულობა ვიწრო აღმოჩნდა (201: hidden focusable-ის scan; 209: B-ის მიერ ხელით არჩეული 15 ფაილი). ამიტომ L23 დაზუსტდა.
  3. **Round 212-ის gate-ის ჩავარდნა (GATE212-B1) წინასწარ იყო ცნობილი.** A-ს covering run-ში CP12 30 s timeout-ზე ჩავარდა (31.8 / 32.8 s). A-მ ის ძველ პრობლემად შეაფასა და „For B/root“-ის რისკად ჩაწერა (`a-round-212.md` l.38–42), STOP არ დაუწერია; C-მაც root-ის საქმედ მიიჩნია (`c-round-212.md` l.224). წესი, რომ ცნობილად წითელი ტესტი gate-მდე უნდა გადაწყდეს, არ არსებობდა. დაემატა L31 (B) და L32 (A).
- **Critical/High 0.** ფანჯრის ყველა Medium დახურულია. ღიად რჩება 3 Medium+ ჩანაწერი, ამ ფანჯრამდე გახსნილი: Safari-ის ხელით შემოწმება, ცხრილის შენიშვნა და backend-ის მოლოდინი (`open-medium-plus.txt`).

## 2. ციფრები

| საზომი | მნიშვნელობა | წყარო |
|---|---|---|
| რაუნდები | 15 (200–214) | `rounds-200-214.json` |
| C PASS / FAIL | 11 / 4 | `cost.txt` |
| FAIL-რაუნდები | 200, 201, 202, 209 | `cost.txt` |
| `browserVerified` false | 201, 209 | `retro-numbers.txt` |
| Gate | published 9 (203, 205, 206, 207, 208, 210, 211, 213, 214) · skipped 4 (200, 201, 202, 209) · blocked 1 (204) · failed 1 (212) | `cost.txt` |
| ღირებულება B / A / C / სულ | $151.29 / $146.46 / $112.19 / $409.94 | `cost.txt` |
| FAIL-რაუნდების ღირებულება | $100.40 | `cost.txt` |
| რაუნდის მედიანა | $28.54 | `cost.txt` |
| ყველაზე ძვირი რაუნდები | 211 ($36.66), 212 ($35.21), 214 ($34.90), 209 ($32.60), 206 ($32.15) | `cost.txt` top5 |
| ფაზის მედიანა (min–max) | B-ის დაგეგმვა $10.49 ($4.80–16.94) · A $9.70 ($0.43–20.72) · C $6.92 ($2.83–13.43) | `retro-numbers.txt` |
| ყველაზე ძვირი ფაზები | A 209 ($20.72), B-ის დაგეგმვა 211 ($16.94), A 206 ($16.65), A 214 ($15.22), A 210 ($13.70), C 211 ($13.43) | `retro-numbers.txt` |
| A-ს საშუალო FAIL / PASS რაუნდში | $9.38 / $9.90 | `cost.txt` |
| Re-do რაუნდები | 202 (201-ის STOP-ის re-dispatch), 203 (202-ის FAIL-ის fix-up), 210 (209-ის STOP-ის re-dispatch), 213 (gate 212-ის test split); სულ $101.46 | `retro-numbers.txt` |
| C-ის `bugs[]` ჩანაწერები | 26: medium 9, low 17; critical/high 0 | `retro-numbers.txt` |
| Gate review-ში დანომრილი პუნქტები | 69, 11 review-ში (203–208, 210, 211, 213, 214; 209-სა და 212-ზე review არ არსებობს) | `gate-reviews.txt` |
| ფანჯრის ID-ები `open_findings`-ში | 72: C 23, gate reviewer 24, A 14, B 11 | `classify.txt` |
| ფანჯრის ID-ები `deferred_low_polish`-ში | 49: gate reviewer 18, C 13, A 13, B 5 | `classify.txt` |
| `deferred_low_polish`, სულ | 324 (11 closed/folded, 313 ღია ან მოლოდინში). დაგეგმვამდე 319 იყო | `deferred-totals.txt`; `backlog-before-215.json` |
| სტატუსის მოძველებული ხაზის findings ფანჯარაში | 8 (gate/root): GATE205-DOC162-STATUS, GATE206-DOC163-STATUS, GATE207-DOC164-STATUS, GATE208-DOC163-STATUS, GATE210-S1, GATE211-S6, ROOT-L28-AMEND-MISSED (doc 167), GATE214-DOC168-STATUS; + B-R214-DOC160-161-STATUS (B, ამ დაგეგმვაზე) | `l28-status.txt` |

**შენიშვნები:**
- „ფანჯრის ID“ ნიშნავს, რომ ID-ის რაუნდის ნომერი 200–214-შია (`C-R2xx`, `GATE2xx`, `A-R2xx`, `B-R2xx`). ID-ის გარეშე ჩანაწერები და `ROOT-*` აქ არ ითვლება.
- `gate-reviews.txt` ითვლის `Critical`, `Suggestions` და `Findings` სექციების დანომრილ ხაზებს. review-ების ფორმატი განსხვავდება, ამიტომ ეს მიახლოებითი რიცხვია.
- თანხები, როგორც retro 200-ში, ფაზების ცენტამდე დამრგვალებული მნიშვნელობების ჯამია.

## 3. C FAIL-ები და gate-ის ბლოკები: მიზეზი და წესი

მიზეზები წყაროდან მოდის: C-ის ანგარიში (`c-round-N.json` → `bugs[]`, `failed`), A-ს ანგარიში და B-ის ruling. დასკვნა ცალკეა მონიშნული.

| რაუნდი | რა მოხდა (მტკიცებულება) | წარმოშობის კლასი | წესი |
|---|---|---|---|
| 200 | RETRO 200-მა 127 და 178 „A-ს self-check“-ად ჩაწერა, A-ს ანგარიშში კი STOP/BLOCKER ჩანს (C-R200-01, Medium; C-R200-02, Low) | ambiguous task text (B-ის ანალიზის შეცდომა) | RT-CAUSE row მუშაობს. ამავე row-ს ახლა retro 215-ზეც იყენებს C |
| 201 | A STOP: `SfxVideoSync.tsx:34` `opacity-0` file input. R94-ის სავალდებულო ცვლილება მას ერთადერთ indicator-ს ართმევდა (`a-round-201.md` l.1–17). B-ის inventory-ს hidden focusable-ის scan არ ჰქონდა (B-R200-HIDDEN-FOCUSABLE-GAP) | missing acceptance row / B inventory (L1-ის კლასი) | L1 Round 201-ის დაგეგმვაზე დაზუსტდა, Round 204-ზე კიდევ ერთხელ (runtime Tab probe) |
| 202 | `failed`: ERROR-BORDER და CONTRAST (`c-round-202.json`). **ERROR-BORDER** = C-R202-01: რეგრესია, რომელიც A-ს code-reviewer-მა იპოვა; A-მ ruling-ის თხოვნით გადასცა (`a-round-202.md` §6: „None was fixed in this round … each goes to B“), ფიქსი grant-ის გარეთ იყო. **CONTRAST** = C-R202-02: Play preview-ის ring ღილაკის საკუთარ teal glow-სთან 2.68:1, ref-ში იდენტური; ერთი row „listed with its ref result“ წესს იცნობდა, მეორე არა (spec-ის შეუსაბამობა). დამატებით Medium bug-ები C-R202-04/05 (runtime-ში დამალული focusable-ები, L1-ის კლასი, ref-ში იდენტური) — failed row არ ყოფილა | regression this round caused (A) + ambiguous task text (B) + missing acceptance row | ახალი **L33** (A); **L24** (B, Round 203-ის დაგეგმვა: ერთი pre-existing clause ყველა საზომ row-ში); L1-ის runtime ნაწილი Round 204-ზე |
| 209 | A STOP: frozen `gesture-guard.test.tsx` l.447 ქცევის სავალდებულო ცვლილებას ეჯახებოდა (C-R209-01). B-მ 15 ხელით არჩეულ ფაილში იძებნა (`b-round-208.md` l.36), მე-10 hit სხვა ფაილში იყო. C-R209-02: დაუსრულებელი deliverable-ები, STOP-ის შედეგი | frozen/protected collision (L23-ის კლასი) | **L23 დაზუსტდა**: ზუსტი grep (regex + root folders), hit list და ერთი class ruling |
| gate 204 | GATE204-B1: doc 161 l.111 ისეთ ტესტს ახსენებდა, რომელიც არ არსებობს | docs | L26 (Round 205-ის დაგეგმვა). ფანჯრის ბოლომდე იგივე აღარ განმეორდა (205–214, `window-findings.txt`) |
| gate 212 | GATE212-B1: CP12 full suite-ში 33.3 s, timeout 30 s (`describe` `{ timeout: 30_000 }`, `clip-gain-pointer-preview.test.tsx:503`). gate 211-ში უკვე 25.4 s იყო. A-ს covering run-ში CP12 ჩავარდა (31.8 / 32.8 s); A-მ ის ძველ პრობლემად, root-ის რისკად ჩაწერა და STOP არა (`a-round-212.md` l.38–42); C: „root-gate matter“ (`c-round-212.md` l.224) | harness/environment gap (speed rule: A/C full suite-ს არ უშვებს) + ცნობილი წითელი ტესტი STOP-ის გარეშე | ახალი **L31** (B, headroom gate-ის log-იდან) და **L32** (A, წითელი ან ნელი covering test STOP-ია, თუნდაც ძველი იყოს) |

**დაყოფა:** gate 212 A-ს handover-მდე დაიჭირებოდა (L32): A-ს რიცხვი ჰქონდა. 4 FAIL-დან 2 B-ს შეეძლო dispatch-მდე დაეჭირა (201, 209), 202-ს ორი მიზეზი აქვს: B-ის spec (CONTRAST, L24) და A-ს handover (ERROR-BORDER, L33); C-R202-04/05 B-ის მხარეა, runtime probe-ის ნაკლი (L1). 200 B-ის ანალიზის შეცდომაა. *დასკვნა:* 209-ის „დაიჭერდა“ გულისხმობს, რომ ფართო grep მე-10 ფაილს იპოვიდა. A-მ ის `beginTrackVolumeGesture|…|pointerDown` grep-ით იპოვა (`a-round-209.md`), ამიტომ ეს ძალიან სავარაუდოა, მაგრამ შემოწმებული არ არის.

## 4. ნაპოვნი საკითხების წარმოშობა

- **ვინ პოულობს:** ფანჯრის deferred Low-ებიდან gate reviewer 18-ს პოულობს, C 13-ს, A 13-ს, B 5-ს (`classify.txt`). Gate review-ებში დანომრილი პუნქტი 69-ია (`gate-reviews.txt`). მათი უმეტესობა test hygiene-ს ან harness-ს ეხება და არა მომხმარებლის ქცევას. *დასკვნა:* ეს `window-findings.txt`-ის სათაურების წაკითხვას ეფუძნება და ზუსტად არ დათვლილა.
- **კატეგორიები** (ევრისტიკა, `classify.txt`, `open_findings` ფანჯარაში 72): timing/audio 28, focus 15, uncategorised 8, tests/harness 7, docs/process 6. (ევრისტიკა status-ის ტექსტსაც კითხულობს: მაგ., „PERF-FADER“ timing/audio-ში ხვდება.) *დასკვნა:* focus სავარაუდოდ ფანჯრის პირველ ნახევარს ეკუთვნის (SABA-B-4, 201–205), timing/audio კი მეორეს (PERF, 206–214); ID-ების მიხედვით ეს ცალკე არ დათვლილა.
- **Root cause, რომელიც მტკიცებულებით დასტურდება:**
  1. **სტატუსის ხაზი C-ის შემდეგ amend-ს საჭიროებდა.** 8 finding gate-იდან ან root-იდან (`l28-status.txt`). თითოს მომდევნო რაუნდში ერთი grant დასჭირდა. root-ის ნაბიჯი არ სრულდება (ROOT-L28-AMEND-MISSED).
  2. **დოკუმენტის ხაზები ცალ-ცალკე იყო grant-ებული.** harness-ის ცვლილებისას grant-ის გარეთ დარჩენილი ხაზები მოძველდა: C-R208-01, C-R210-01 და C-R209-02-ის DOC ნაწილი (სამივე doc 163). `tech-lead`-მა იგივე მიზეზი დაასახელა. ახალი L34.
  3. **ხელსაწყო, რომელიც სინამდვილეში არაფერს ამოწმებს.** `npx biome check perf/` ამ რეპოს `biome.json`-ით (`includes` მხოლოდ `app/**`) არცერთ ფაილს არ ამუშავებს. ეს ჩანს GATE206-S2-ში, C-R214-BIOME-PERF-VACUOUS-ში და A-ს ანგარიშში („the same as rounds 206 and 208“, `a-round-214.md`). ახალი L30 და წინადადება საბასთვის (§8).
  4. **სიგნალი, რომელიც მოცემულ მდგომარეობაში არ არსებობს.** დავალებამ `[data-range-end]` დაასახელა, რომელიც მხოლოდ all-tracks range-ზე იხატება (`ArrangementLane.tsx` l.1016; A-R214-DEV-RANGE-LIVE, 1×). ახალი L29.
- **Bookkeeping (L7):** ამ დაგეგმვაზე დაიხურა GATE211-S1 (Round 212-ში გასწორდა, `c-round-212.md` l.172), GATE206-DOC163-STATUS, GATE208-DOC163-STATUS და GATE211-S6. მათი docs HEAD-ზე უკვე Completed-ია. სამივე „scheduled“ სტატუსით რჩებოდა. GATE206-S3/S6 და GATE211-S4 Round 214-მა დახურა (D-29z209).

## 5. ღირებულება და სიჩქარე

- **ეტაპზე დახარჯული რაუნდები** (`backlog.json` → `rounds[]`):
  - SABA-B-4 ეტაპი 2: 3 რაუნდი (201–203), 2 FAIL;
  - hidden focusables + LeadMagnet: 2 (204–205), 0 C FAIL, 1 gate block;
  - PERF-1a: 1 (206); SABA-B-6: 1 (207);
  - PERF-FADER a0/a/b/c: 6 (208–213), 1 FAIL, 1 gate fail;
  - PERF-1b-i: 1 (214); RETRO: 1 (200).
- **Re-do რაუნდებმა** 4 რაუნდი და $101.46 წაიღო. ეს FAIL-რაუნდების ღირებულებაზე ($100.40) მეტია.
- **ძვირი ფაზები:** A-ს harness/perf რაუნდები (209 $20.72, 206 $16.65, 214 $15.22) და B-ის დაგეგმვა 211-ისთვის ($16.94). *ჰიპოთეზა:* perf-რაუნდის A-ს ღირებულებას ზრდის perf run-ების ხანგრძლივობა (PERF-1a ~8 წთ, PERF-1b-i ~5 წთ, ორჯერ). ეს აქ არ გაზომილა.
- **STOP-ის ფასი C-სთვის (L22):** $2.83 (201) და $3.85 (209). Round 192-ში იყო $3.22. L22 მოქმედებს: ორივეჯერ C-მ მოკლე რაუნდი ჩაატარა.

## 6. სისტემური დავალებები

| ID | რა | იხურება | Owner area | ზომა |
|---|---|---|---|---|
| **SYS-4** (ახალი) | docs 160, 161, 162 და 168-ის l.4 ახალი L28-ის მიხედვით ხდება ზუსტად `Completed (C round N PASS)`: 160 → C round 203, 161 → C round 204, 162 → C round 205, 168 → C round 214. სხვა ხაზი არ იცვლება | GATE214-DOC168-STATUS, B-R214-DOC160-161-STATUS, GATE205-DOC162-STATUS | `docs/implementation/2026/quarter-IV/` (4 ფაილი, მხოლოდ l.4) | ცალკე რაუნდი არ სჭირდება: შემდეგ source-რაუნდში (216) ოთხი ერთხაზიანი grant-ია |
| SYS-1, SYS-2, SYS-3 | retro 200-იდან, ცვლილების გარეშე | იგივე | იგივე | ჯერ არ გაშვებულა. საბამ (D-29z172) STUDIO-PERFORMANCE მათ წინ გადმოიტანა |

**კლასის მოცილება:** ახალი L28-ით სტატუსი C-ის შემდეგ აღარ საჭიროებს ცვლილებას, ამიტომ root-ის amend-ის ნაბიჯიც აღარ არის საჭირო. SYS-4 მხოლოდ ძველ ნაშთებს ასწორებს.

**კანდიდატი, დაუგეგმავი:** dialog focus-ის ჯგუფი (C-R202-06, C-R203-02, C-R205-01, GATE205-S1-NESTED-SCROLL-LOCK, GATE205-S3-TRAP-SELECTOR). `deferred_low_polish` უკვე აღნიშნავს მათ საერთო `useDialogFocus` დავალებისთვის. owner-ი store-ის modal-ებია, ამიტომ უფრო ბუნებრივად STORE-2b-ს მიუერთდება და STUDIO-PERFORMANCE-ში არ იწერება. **PERF-HARNESS-SHARED-LIB** მეორედ დაფიქსირდა (A-ს და gate 214-ის Architecture note), მაგრამ reviewer-ის ვერდიქტი „keep“-ია. ის სიგნალად რჩება და STUDIO-PERFORMANCE-ის საზღვარზე გადაწყდება.

## 7. გაკვეთილები (`lessons.md`, 47 ხაზი)

- **შეიცვალა:**
  - **L23** — თუ B ცვლილებას წინასწარ ვერ გამოიყენებს, დავალებაში იწერება ზუსტი grep, hit list და ერთი class ruling. ხელით არჩეული ფაილების სია აღარ გამოიყენება. ერთი შემთხვევის მტკიცებულებაა (1×).
  - **L28** — მთლიანად ჩანაცვლდა. A თავად წერს საბოლოო `Completed (C round N PASS)`-ს, root აღარ ასწორებს, C ბაიტ-ბაიტ ამოწმებს. ლოგიკა: HEAD-ზე არაფერი ხვდება C PASS-ის გარეშე. ფანჯრის 4 C FAIL-ვე skipped იყო, ხოლო gate 212-ის შემთხვევაში C PASS იყო და შემდეგ gate 213-მა გამოაქვეყნა. ამიტომ ხაზში hash და gate-ის რაუნდი არ იწერება (`tech-lead`).
- **ახალი (B):** L29 (სიგნალის render condition, 1×), L30 (ხელსაწყომ დასახელებული path უნდა დაამუშაოს, 3 რაუნდი), L31 (timeout headroom, 1×), L34 (doc-ის მთელი contract სექციის grant, 3×).
- **ახალი (A):** L32 (წითელი ან ნელი covering test STOP-ია, თუნდაც ძველი იყოს, 1×), L33 (რეგრესია, რომლის ფიქსი grant-ის გარეთაა, STOP-ია, 1×).
- **დარჩა უცვლელი:** L1, L10, L22, L26 (`consequence-tester`: keep. L26-ზე ფანჯარაში საწინააღმდეგო მტკიცებულება არ არის).

**retro 200-ის ექსპერიმენტის შედეგი (§7):**
- **L10:** ორივე STOP-ს (201, 209) re-dispatch-მდე ჰქონდა ruling-ის ფაილი (`b-round-201.md` §3, `b-round-209.md` D-29z183). ფანჯარაში არ ყოფილა C FAIL, რომელიც მხოლოდ ruling-ს საჭიროებდა; retro 200-ის ფანჯარაში ასეთი 2–3 იყო. საბაზისო სიხშირე დაბალია, ამიტომ მტკიცებულება სუსტია.
- **L1–L4-ის კლასიდან FAIL:** 2 (201, 202), ორივე L1-ის კლასიდან. Round 204-ზე L1-ის დაზუსტების შემდეგ (runtime probe) 204–214-ში ასეთი FAIL აღარ ყოფილა. ეს 2 store/focus რაუნდია (204, 205) და შემდეგ სხვა სახის სამუშაო, ამიტომ მტკიცებულება სუსტია.
- **L1-ის mutant-ის მტკიცებულება:** ცალკე არ დათვლილა.

## 8. ექსპერიმენტი მომდევნო ფანჯრისთვის (215–229)

`consequence-tester`-ის ფორმით:
- **ჰიპოთეზა:** სტატუსის მოძველებული ხაზი იმ convention-ის ბრალია, რომელიც C-ის შემდეგ კიდევ ერთ ნაბიჯს ითხოვს, და არა აგენტების უყურადღებობის.
- **ცვლილება:** ახალი L28, Round 216-იდან.
- **საზომი:** `*-DOC*-STATUS` და მსგავსი findings 215–229-ში. საბაზისო მნიშვნელობა 8-ია.
- **ჰიპოთეზის უარყოფა:** ≥ 3 ასეთი finding ახალი წესის პირობებში.
- **შეჩერება:** თუ რომელიმე გამოქვეყნებული doc-ის სტატუსი არასწორი აღმოჩნდება.
- **ნულოვანი შედეგი:** 5-ზე ნაკლები ახალი doc-ის პირობებში 0 finding სუსტი მტკიცებულებაა.
- **საწინააღმდეგო საზომი:** B-ის დაგეგმვის მედიანა (ახლა $10.49). L29–L31 დაგეგმვას ამძიმებს. თუ მედიანა ~$12-ს გადააჭარბებს და FAIL-ები არ შემცირდება, დამატებული შემოწმებები შემცირდეს.
- **დამატებით დაითვლება:** L23-ის კლასის STOP-ები (საბაზისო 1), timeout-ით gate-ის ჩავარდნა (საბაზისო 1), reviewer-ის მიერ ნაპოვნი რეგრესია, რომელიც C-მ FAIL-ად მონიშნა (საბაზისო 1).

## 9. საბასთვის (For Saba) — მხოლოდ წინადადებები, არაფერი გამოყენებულა

**წესების ან config-ის ცვლილების წინადადებები** (დაცული ფაილებია; loop მათ შენი დასტურის გარეშე არ ცვლის):
1. **`biome.json`-ის `files.includes`-ში დაემატოს `perf/**` და `playwright.*.config.ts`.** დღეს `npm run check`/`verify` `perf/`-ს საერთოდ არ ამოწმებს. A-მ და C-მ სამ რაუნდში დროებითი config-ით შეამოწმეს (0 diagnostic, `a-round-214.md`, `c-round-214.md`). წყარო: GATE206-S2, C-R214-BIOME-PERF-VACUOUS, gate 214 review item 7. ცალკე `perf/`-ის config-იც შესაძლებელია, მაგრამ ჯერ არ შემოწმებულა.
2. **retro 200-ის §8-ის 1–3 წინადადება** (`TESTING_QUALITY_GATES.md`, `TAILWIND_FIRST.md`, `code-reviewer.md`) ჯერ უპასუხოა. loop-ში პასუხი არ ჩაწერილა.

**Root-ისთვის (loop runner, არა store-ის წესი):**
3. ახალი L28-ის შემდეგ gate-ს l.4-ის amend აღარ სჭირდება. თუ root სურს, შეუძლია გამოქვეყნებამდე შეამოწმოს, რომ ახალი doc-ის l.4-ში „pending“ არ წერია.
4. GATE213-S7: `verify.log` Biome-ის warning-ებიდან მხოლოდ ნაწილს ბეჭდავს. L31-ისთვის log-ში საჭიროა თითოეული ტესტის ხანგრძლივობაც (gate 213 l.536–539-ში ჩანს).

**ღია კითხვები (უცვლელი):** C-R188-I6 (testimonials), OBS-R199-LEDGER, announcement-ის გამეორება, C-R212-03 (6× CPU-ის ბიუჯეტი).
