# RETRO 495 — 21-ე რეტროსპექტივა (რაუნდები 480–494)

**ავტორი:** B, round 494 → 495 დაგეგმვისას, 2026-11-13 (დაგეგმვა დაიწყო 18:17Z, `b-round-494/checkpoint.md`). **D-ID:** D-29z1764…D-29z1771 (D-29z1771 = advisor-ის საბოლოო შემოწმების შესწორებები). **master:** `3bcf8cb` (gate 494 published).

**კონსულტაციები:**
- `tech-lead` — რეალურად გამოვიძახე; პასუხი: `b-round-494/consult-tech-lead.md`.
- `product-designer` — ეკრანი და მომხმარებლის გზა; პასუხი: `b-round-494/consult-product-designer.md`.
- advisor — ორჯერ: დაგეგმვის მიდგომაზე (orientation-ის შემდეგ) და საბოლოო შემოწმებაზე.
- `qa-engineer`, `consequence-tester`, `design-philosopher` და `first-visit-host` B-ის consult სიაში არ არიან (2026-11-04 §6), ამიტომ არ გამომიძახებია. RETRO-ს ეკრანის მიმოხილვა მათ ითხოვს; ამჯერად ის მხოლოდ `product-designer`-მა გააკეთა.

**რატომ ახლა:** `retro_policy.next_due` = „round 495 (window 480–494)“ (D-29z1706). Task 494 §5-ში ფანჯარა 481–494 ეწერა. B იყენებს 480–494-ს, როგორც ყველა წინა რეტროში (15 რაუნდი; D-29z1766). REGRESSION ჯერ არ არის საჭირო: `regression-last.json` 2026-11-13-ია, შემდეგი 2026-11-16-ზე ან მის შემდეგ.

**მონაცემები:** `b-round-494/*.py`, `misc-outputs.sh` და `stops-head.sh` retro 480-ის სკრიპტების ასლებია; ფანჯარა 480–494-ზე გადავიყვანე. შესავალი მონაცემები:
- `b-round-494/backlog-retro-input.json` (v484, round 494-ის მიღების შემდეგ);
- `b-round-494/archive-findings-snapshot.json`.

შედეგები: `b-round-494/data/`. ქვემოთ ყველა რიცხვი ამ ფაილებიდანაა; ფაილი ყველგან მითითებულია.

## 1. მოკლედ
- **ღირებულება:** 15 რაუნდი, **$247.20** (`data/cost.txt`): B $175.31 (70.9 %), A $47.47, C $24.42.
  - round 492-ის B-ის ხარჯი არასრულია: `b-round-491-result.json.attempt1.json` 0 ბაიტია.
- **C-ის ვერდიქტები:** PASS 11, FAIL 4 (487, 489, 492, 493). `browserVerified` false იყო 483-ში (PASS, regression-ის ნაწილი 2; ნაწილი 484-ში დასრულდა) და 493-ში (მოკლე FAIL) (`data/fails-detail.txt`).
- **Gate:** 7 რაუნდი გამოქვეყნდა (481, 485, 486, 488, 490, 491, 494); დანარჩენ 8-ში gate გამოტოვებულია.
- **STOP-ები:** ოთხივე FAIL-ს A-ს STOP უძღოდა (`data/stops-head.txt`). ოთხივეს წყარო B-ის dispatch-ილი sketch-ია:
  - 487 და 489 — Medium, რომელიც A-ს reviewer-მა იპოვა და B-ს არ ჰქონდა გადაწყვეტილი;
  - 492 და 493 — doc-ის ცრუ წინადადება.
- **ფანჯრის შედეგი:** Account-ის accessibility-ის ექვსი Medium დაიხურა.
  - Order card disclosure (486), Profile name keyboard (487–488), narrow overflow (491) და პაროლის დიალოგის სამი Medium (492–494).
  - Store-ის შესასვლელი ≥ 3.5 წამი გახდა (SABA-B-17, 489–490). client ნავიგაცია გვერდის სათაურს აცნობს (485).
  - ახალი High: პაროლის შეცვლა საერთოდ არ მუშაობს (B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED, root, backend).
- **counter-ები:** RETRO 480-მა 7 counter დააწესა. მიღწეულია 1 (l58 15/15), ვერ მიღწეულია 6 (§9).
- **DPG P1** (DPG-BUTTON-CLEANUP …) round 479-ის შემდეგ არ განახლებულა: ფანჯარა მთლიანად Account-ის Medium-ებს და regression-ს დაეთმო.

## 2. ციფრები (`data/cost-rows.json`, `data/cost.txt`, `data/stage-sums.txt`)
| ეტაპი | რაუნდები | ჯამი | საშუალო |
|---|---|---|---|
| RETRO 480 | 480 | $16.77 | $16.77 |
| B-R478-DEAD-MUSIC-LINK | 481 | $11.28 | $11.28 |
| REGRESSION-2026-11-13 | 482–484 | $44.09 | $14.70 |
| CLIENT-NAV-CONTRACT | 485 | $20.50 | $20.50 |
| B-R480-ORDER-CARD-KEYBOARD | 486 | $17.34 | $17.34 |
| B-R486-PROFILE-NAME-KEYBOARD | 487–488 | $37.16 | $18.58 |
| SABA-B-17 (შესასვლელი 3–4 წმ) | 489–490 | $42.95 | $21.48 |
| B-R487-PROFILE-EDITOR-NARROW-OVERFLOW | 491 | $15.63 | $15.63 |
| B-R488-PASSWORD-MODAL-DIALOG | 492–494 | $41.48 | $13.83 |

- **მედიანები და ხარჯი (`data/cost.txt`):**
  - რაუნდის მედიანა **$16.77**, B-ის მედიანა **$12.58** (min 1.60 — არასრული ჩანაწერი, იხ. §1; max 20.52).
  - A-ს საშუალო: FAIL-ზე $4.92, PASS-ზე $2.53. FAIL რაუნდების ჯამი $69.53.
  - ხუთი ყველაზე ძვირი რაუნდი: 489 $26.69, 485 $20.50, 487 $20.10, 494 $18.74, 483 $17.66.
- **retro 480-თან შედარება** ($214.36, მედიანა $15.29, B-ის წილი 62.2 %; `retros/retro-480.md` §1–§2): ფანჯარა 15 %-ით ძვირია (247.20/214.36 = 1.153), B-ის წილი კი 70.9 %-მდე გაიზარდა.
- **სად არის ზრდა:** ზრდა B-შია ($133.40 → $175.31). A ($68.69 → $47.47) და C ($12.27 → $24.42) ჯამში იაფია.
  - C-ის ზრდის უმეტესი ნაწილი regression-ია: 482 $4.78, 483 $8.41, 484 $2.58.
- **B-ის ღირებულება:** round N-ის ღირებულება არის `b-round-(N-1)-result*.json`, როგორც retro 480-ში. ამ დაგეგმვის (b-round-494) ღირებულება აქ არ შედის.

## 3. FAIL-ები და STOP-ები (წყარო თითოეულზე)
| რაუნდი | რა მოხდა (წყარო) | კლასი | წესი |
|---|---|---|---|
| 487 FAIL | A-ს reviewer-მა B-ის sketch-ში იპოვა A-R487-REVIEW-FOCUS-STEAL (Medium): შენახვის დასრულება focus-ს იქიდან წაიღებდა, სადაც მომხმარებელმა გადაიტანა. A გაჩერდა; C-მ ბრაუზერში გაიმეორა, C-R487-01 (`a-round-487.md` l.3; `c-round-487.md`) | sketch-ის Medium, B-ს გადაწყვეტილი არ ჰქონდა | ახალი clause L47-ში „Focus write after an async settle“ (RETRO 495) |
| 489 FAIL | A-ს reviewer-მა იპოვა A-R489-REVIEW-NONZOOM-CLASSIFY (Medium): B-ის 22 mutant-მა გადაჭარბებით ფართო classifier ვერ დაიჭირა, 4 mutant გადარჩა. პროდუქტის ქცევა ბრაუზერში სწორი იყო (`a-round-489.md` l.3; `c-round-489.json` C-R489-A-STOP-NONZOOM-TEST-GAP) | ტესტის სიძლიერე B-ის sketch-ში | L52 „Classifier rows dispatch the real event“ (round 490-ში დაემატა) |
| 492 FAIL | doc 318 l.22 ამბობდა, რომ ფანჯრის გახსნისას ველზე focus ring ჩანს. მაუსით გახსნისას ეს სიცრუეა (C5 P2 `none 0px`). A გაჩერდა (`c-round-492.json` C-R492-01) | doc-ის ცრუ წინადადება B-ის sketch-ში | ახალი clause L26-ში „Every sentence has a ledger“ (RETRO 495) |
| 493 FAIL | doc 318 l.36 ამბობდა, რომ backdrop-ი მთელ ფონს ფარავს. ქვედა 40 px ზოლი მის გარეთაა (`c-round-493/f1.json`; C-R493-01). ეს B-ის საკუთარი deferred Low იყო, B-R492-PASSWORD-BACKDROP-SHORT | იგივე კლასი + doc ღია finding-ს არ შეადარეს | იგივე L26 clause (ღია/deferred finding-ებთან შედარება; STOP სია clause-ს არ გადაფარავს) |

`tech-lead`-ის დასკვნა ჩაწერილია ქვემოთ, §7-ში. წყარო: `b-round-494/consult-tech-lead.md`.

## 4. Findings (`data/fails-detail.txt`, `data/classify.txt`, `data/deferred-added.txt`, `data/gate-reviews.txt`, `data/l57-check-window.txt`)
- **C-ის ბაგები: 5 დასახელებული + 4 info** (`data/fails-detail.txt`).
  - Medium 2: C-R487-01, C-R489-A-STOP-NONZOOM-TEST-GAP.
  - Low 3: B-R485-STUDIO-PRODUCT-TITLE, C-R492-01, C-R493-01.
  - info 4: C-R489-ENV-K17-WEBM-GITIGNORED, C-R489-ENTRANCE-TOUCH-FIRST-MOVES, C-R490-INFO-CLICK50-HANDOFF-GAP, C-R490-INFO-EXIT-FADE-DOUBLE-WORDMARK.
- **ახალი deferred Low (union method): 56** (`data/deferred-added.txt`). აქედან 6 დახურულია.
  - პრეფიქსის მიხედვით: A 34, B 10, gate 8, TL 3, სხვა 1.
  - ერთი, GATE494-L4-TEST-BLANK-LINES, ამავე დაგეგმვამ დაამატა (D-29z1765).
  - **კონცენტრაცია:** 23 ერთეული პაროლის დიალოგს ეკუთვნის (პრეფიქსები TL-R492, B-R492, A-R492, A-R493, GATE494), 9 — შესასვლელს (B-R489, A-R489, A-R490, GATE490). დათვლა: `grep -cE` ამ პრეფიქსებზე `data/deferred-added.txt`-ის id სიაში.
- **classify (`data/classify.txt`), id-ში რაუნდის ნომრით:** ფანჯარაში open 7, deferred 52, archive 14.
  - deferred-ის კატეგორიები: focus 16, keyboard 11, docs/process 5, a11y/announcements 4.
- **gate-ის review-ები: 7**, 30 პუნქტი (`data/gate-reviews.txt`): medium 1 (485), low 12, info 8, unlabelled 9.
- **L57 (C-ის JSON-ის ველები): OK 11/15** (`data/l57-check-window.txt`, `data/l57-coverage.txt`).
  - INCOMPLETE 485, 487 და 493: 12-12 ველი აკლია. 485-ში B-R485-STUDIO-PRODUCT-TITLE-ს `origin` არ აქვს, 493-ში C-R493-01-ს.
  - INCOMPLETE 488: 5 ველი აკლია (`gateChecks*`, `affectedChecks*`, `chainHeadGateRunGreen`) და 2 `null`-ია.
  - 487 და 493 მოკლე route-ებია; L22 „A short FAIL is still a full JSON“ მათზე არ შესრულდა.
- **L58 (task-ის sketch-ის შემოწმება): OK 15/15** (480–494; `data/l58-check-window.txt` + task 480).
- **fix-up ჯაჭვები: 3** (`data/task-titles.txt`): 487→488, 489→490, 492→493→494. ბოლო ჯაჭვის სიგრძე 2-ია.

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **უკეთესი spec** (ოთხივე დაკარგული რაუნდი):
  - 487: sketch review ასინქრონული შენახვის დასრულებას focus-ის მიმართ არ ამოწმებდა;
  - 489: mutant-ების სიაში classifier-ის ორივე მხარის ფართო mutant აკლდა;
  - 492/493: doc-ის თითო წინადადება ბრაუზერის row-ებს და ღია finding-ებს არ შეადარეს.
- **A-ს self-check:** ოთხივეში A-მ ან მისმა reviewer-მა თავად იპოვა პრობლემა და სწორად გაჩერდა (L11). დაკარგული რაუნდები B-ის sketch-ის ხარისხს ეკუთვნის.
- **shared helper:** პაროლის დიალოგის 23 Low-ის დიდი ნაწილი (focus return, Esc, palette, reopen, tab trap, IME) ისეთი ქცევაა, რომელიც `app/components/ui/Modal.tsx`-ს არ აქვს. Account-ის ფაილმა ყველაფერი ხელით მოაწყო. ცნობილი ხარვეზია: `shared-modal-no-focus-management` (deferred). `tech-lead`-ის შეფასება: §11.

## 6. Saba-ს ნაპოვნი საკითხები და ეკრანი
- **SABA-B-17 (შესასვლელი 3–4 წმ, 2026-11-13).** რაუნდები 489–490, C PASS, გამოქვეყნდა.
  - „Why we missed it“ წერია `tasks/round-489.md`-ში: SABA-B-13 Saba-ს მაგალითის რიცხვით (1.2–1.5 წმ) აიგო.
  - lesson: L18 „A felt quantity Saba names“ (D-29z1746), ამ ფანჯარაშივე დაემატა. Saba-ს ხელით შემოწმება TLM-R489-SABA-ENTRANCE-FEEL ღიაა (`questions-retro-495.md` Q2).
- **განმეორება (2026-10-28 წესი):** SABA-B-17 იმავე სახისაა, რაც SABA-B-13 (შესასვლელი ძალიან სწრაფია, 2026-11-11). lesson მაშინ არსებობდა (L18 „First painted frame“, D-29z1625), მაგრამ გაზომვას ფარავდა და არა იმას, რომ მაგალითის რიცხვი მიზნად არ ითვლება. **1 განმეორება** (RETRO495-SABA-RECURRENCE-ENTRANCE, D-29z1771).
- **ფანჯარაში Saba-ს ახალი საკითხი სხვა არ ყოფილა.**
  - ძველი ღია: SABA-B-15 (სქროლი; ამ RETRO-ზე L46-ით task SABA-DEVICE-CHECKS იხსნება, Q1) და SABA-B-16 (ლოგოს asset, `questions-round-467.md` Q3).
  - lesson-ის შემოწმება: SABA-B-15 → L18 „Scroll frames“, SABA-B-17 → L18 „felt quantity“. SABA-B-16-ს ცალკე lesson არ აქვს, მის ფერის მიგრაციის მიზეზს L2 ფარავს. SABA-B-15-სა და SABA-B-16-ის კლასი ფანჯარაში არ განმეორებულა.
- **ეკრანი** (`user-review/screen-review-495.md`, `b-round-494/screens/compare-480.txt`): `/studio-lab`-ის ტექსტის ხაზები RETRO 480-ისას უდრის, 138/168/118/144 (outside 97/124/86/101).
  - გზა იგივეა: product → „Try it in the Studio“ → `?preview=middle-east` → ოთხი stem → Play → Export.
  - ოთხი stem ისევ ერთ lane-ზე, ერთმანეთის მიყოლებით ჯდება; მეოთხე „00:48.000 (nearest free spot)“-ზეა.
  - ეს STEM-LANES-ის ცნობილი ხარვეზია; AGREE-STEM-LANES ისევ Saba-ს პასუხს ელოდება.
  - `product-designer`-ის დასკვნა: `b-round-494/consult-product-designer.md`. მან 12-დან 6 PNG გახსნა (journey-ის ექვსი). ოთხი `screen495-full-*` არ გაუხსნია; მათთვის `screen495.json`-სა და `compare-480.txt`-ს დაეყრდნო. ეს დაფარვის ხარვეზია და არა დადასტურება.

## 7. `tech-lead`-ის დასკვნა და B-ის გადაწყვეტილებები
`tech-lead`-ის მთავარი დასკვნა (`b-round-494/consult-tech-lead.md` §1): ოთხივე FAIL ოთხივე STOP-ს ემთხვევა. ყველა დეფექტის origin B spec-ია და ყველა იმ sketch-ში იყო, რომელიც `tech-lead`-ის review-მა უკვე დაამტკიცა.

| რაუნდი | მიზეზი (`tech-lead`) | წესი → B-ის გადაწყვეტილება |
|---|---|---|
| 487 | sketch შენახვის დასრულებისას ველს focus-ს უპირობოდ აძლევდა (`account.tsx`-ის hit-ები 132, 137, 160, 173, ჩამოთვლილი `b-round-486/l50-hits.txt`-ში). review-ის Q1-მა focus return „სწორად“ შეაფასა (`b-round-486/sketch-review.md` l.9). კითხვა „რა მოხდება, თუ მომხმარებელმა focus შენახვის დროს გადაიტანა?“ არავის დაუსვამს. მეორე STOP: task-ის §1 და §2 STOP-ის ზღვარზე ერთმანეთს ეწინააღმდეგებოდა (L10, RETRO 480) | ახალი clause L47-ში „Focus write after an async settle“; L10 უცვლელია (შესრულების ხარვეზია) |
| 489 | TL-R489-M1-ის ფიქსმა `isZoomGesture` დაამატა. mutant-ები M18–M20 მხოლოდ ერთ მიმართულებას ამოწმებდა, dispatcher კი უბრალო `new Event`-ს აგზავნიდა | L52-ის round-490 clause უკვე არსებობს; დაემატა: reviewer-ის Medium-ის ფიქსს თითო მიმართულებაზე საკუთარი mutant სჭირდება |
| 492 | doc 318 l.22 მხოლოდ კლავიატურით გახსნისთვის იყო სწორი, თუმცა task-ის საკუთარი Deviation უკვე ამბობდა „mouse: no ring“ | ახალი clause L26-ში „Every sentence has a ledger“ (წინადადება × შეყვანის წყარო) |
| 493 | doc 318 l.36 B-ის საკუთარ deferred Low-ს ეწინააღმდეგებოდა. task 493-ის STOP სიამ (l.96–102) L26-ის round-473 clause გადაფარა, რომლის მიხედვითაც A ცრუ ხაზს თავისივე ხაზზე ასწორებს. ამან ჯაჭვი 2-მდე გაზარდა | იგივე clause: „task-ის STOP სია ზემოთა clause-ს არ გადაფარავს“ (RETRO495-STOP-LIST-OVERRIDE) |

- **სისტემური შენიშვნა (`tech-lead` §2):** ორივე sketch (487, 489) მხოლოდ `tech-lead`-მა გადახედა, Medium კი A-ს `code-reviewer`-მა იპოვა. `l58-check` review-ის ფორმას ამოწმებს (sha, verdict) და არა შინაარსს.
  - წინადადება root-ისთვის: RETRO495-CODE-REVIEWER-ON-B — B-ის სიას `code-reviewer` დაემატოს. მანამდე B-ის review-ის brief-ში იქნება A-ს reviewer-ის კითხვები: რა ხდება ყოველი `await`-ის შემდეგ; რომელი mutant ფარავს ახალი branch-ის თითო მხარეს.
- **L57 (`tech-lead` §5):** ოთხ INCOMPLETE რაუნდს `c-round-N/l57-check.txt` არ აქვს. task-ებს 485-სა და 488-ს l57-check-ის row არ ჰქონდა; 487-სა და 493-ში მოკლე route-მა ის გამოტოვა. ოთხივე მიზეზი B-ის მხარესაა → ახალი clause L57-ში „B enforces it“. ამ task-ის claims-ში უკვე არის K-ხაზი წინა რაუნდის l57-check.txt-ზე. INFO-B495-L57-MISSES.
- **RC-R483-SINGLE-SAMPLE-ASSERT, RC-R483-PRECEDENT-LOOKUP:** თითო შემთხვევაა, ამიტომ კანდიდატებად რჩება. შემდეგი REGRESSION task-ი c250-ს ფანჯარაზე ფრაქციით ჩაწერს (record) და ყოველი გადმოწერილი row-ისთვის template round-ის C report-ში ბოლო გადაწყვეტილებას მოძებნის (D-29z1769). `tech-lead`-ს ამაზე არ უპასუხია; ეს B-ის გადაწყვეტილებაა.
- **arch checkpoint (`tech-lead` §7): ახალი მოთხოვნა არ იგზავნება.** ARCH-CHECKPOINT-ACCOUNT-PROFILE უკვე ფარავს „ProfileContent + PasswordModal“-ს. gate 494-ის PasswordDialog-ის extraction მასზე `confirmedBy`-ად ჩაიწერა, L46-ის ვადით (RETRO 510). root-ის პასუხამდე `account.tsx`-ზე ახალი task აღარ იგეგმება, გარდა Critical/High/Medium-ის ფიქსისა.

## 8. ღია კანდიდატებისა და ვადების ბედი (L46; `data/retro495-deadlines.txt`)
| Id | ბედი (D-29z1768) |
|---|---|
| TLM-R468-SABA-SCROLL-DEVICE (+ SABA-B-15) | მეორე RETRO უპასუხოდ → L46-ით იხსნება task **SABA-DEVICE-CHECKS**, დაბლოკილია Saba-ს მოწყობილობაზე (`questions-retro-495.md` Q1); არაფერს ბლოკავს |
| TLM-R485-SR-ROUTE-ANNOUNCE, TLM-R489-SABA-ENTRANCE-FEEL, TLM-R489-TOUCH-SWIPE, TLM-R491-PHONE-NAME-EDITOR | პირველი RETRO ვადა → Q2, ახალი ვადა RETRO 510 |
| TLM-PERF15-FIREFOX, TLM-R454-FIREFOX-SAFARI-SCROLLBAR, TLM-R455-FIREFOX-SEEK-THUMB, TLM-R459-FIREFOX-SAFARI-ENTRANCE | უკვე FIREFOX-CHECKS / SAFARI-CHECKS task-ებშია (RETRO 480) → ვადა RETRO 510 (Q3) |
| TLM-SYS3-IME-PLATFORMS, TL-R444-L1-REAL-IME-SEARCH-CLEAR | დაბლოკილი task უცვლელია → ვადა RETRO 510 (Q5) |
| RETRO480-SINGLE-RUNNER-CONTROL | ფანჯარაში ახალი შემთხვევა არ ყოფილა (HEAD-control ამ runner-ზე აღარ გამოუყენებიათ) → ისევ 1×, counter RETRO 510-მდე |
| RC-R471-L58-SKIPPED | l58 15/15 → დახურულია |
| RC-R476-SKETCH-RULE-REVIEW | ამ ფანჯარაში 2 STOP იყო sketch-ის გადაუწყვეტელ Medium-ზე (487, 489) → counter ვერ მიღწეულია, §7 |
| RC-R483-SINGLE-SAMPLE-ASSERT, RC-R483-PRECEDENT-LOOKUP | §7 |
| RC-R486-PRIMITIVE-FOCUS-EXAMPLES | primitive-ის staleness: FORWARDREF_COMPONENT.md 3 და DESIGN_TOKENS.md 1 ხაზი (`b-round-494/primitive-staleness.txt`) → წინადადება Saba-სთვის/root-ისთვის (§12) |
| RC-R492-EXIT-ANIMATION-DIALOG, RC-R492-DOC-TRUTH-REVIEW | §7, §10 |

## 9. countermetric-ები: retro 480-ის მიზნები → შედეგი
| Counter (RETRO 480, `tech-lead`) | შედეგი | წყარო |
|---|---|---|
| C FAIL + BLOCKED ≤ 2 / 15 | 4 — **ვერ მიღწეულია** | `data/cost.txt` |
| STOP-იანი რაუნდი ≤ 2 და 0 STOP sketch-ის გადაუწყვეტელ Medium-ზე | 4 STOP; 2 Medium-ზე (487, 489) — **ვერ მიღწეულია** | `data/stops-head.txt`, `a-round-487.md` l.3, `a-round-489.md` l.3 |
| l58-check 15/15 | 15/15 — **მიღწეულია** | `data/l58-check-window.txt` |
| l57-check ≥ 14/15 | 11/15 — **ვერ მიღწეულია** | `data/l57-check-window.txt` |
| `lessons.md` ≤ 57,500 B, არცერთი ხაზი > 4,800 B | დაგეგმვამდე 58,361 B, l.41 (L58) 4,941 B — **ვერ მიღწეულია**; ამ რეტროს შემდეგ: §10 | `b-round-494/lessons-before-495.md` |
| fix-up ჯაჭვის სიგრძე ≤ 1 | 492→493→494 = 2 — **ვერ მიღწეულია** | `data/task-titles.txt` |
| ახალი deferred Low ≤ 35 და ≥ 10 დახურული | 56 ახალი, 6 დახურული — **ვერ მიღწეულია** | `data/deferred-added.txt` |

ძველი ხარჯის counter-ები შედარებისთვის: რაუნდის მედიანა ≤ $18 → $16.77 (მიღწეულია); B-ის მედიანა ≤ $13 → $12.58 (მიღწეულია); B-ის წილი ≤ 68 % → 70.9 % (ვერ მიღწეულია).

## 10. ცვლილებები: lessons (`b-round-494/lessons-diff.txt`)
before: `b-round-494/lessons-before-495.md` (60 ხაზი, 58,361 B). after: `lessons.md` (60 ხაზი, **57,164 B**, ყველაზე გრძელი ხაზი l.41 4,771 B). სკრიპტები: `b-round-494/edit-lessons.py` (27 ჩანაცვლება) და `edit-lessons-2.py` (8). ზუსტი ამოღებული და დამატებული ტექსტი წერია `edit-lessons.log`-სა და `edit-lessons-2.log`-ში.
- **ახალი clause-ები** (ტექსტი სიტყვასიტყვით log-შია):
  - L26 „Every sentence has a ledger (RETRO 495, RC-R492-DOC-TRUTH-REVIEW)“, `tech-lead`-ის ფორმულირება;
  - L47 „Focus write after an async settle (RETRO 495)“, `tech-lead`-ის ფორმულირება;
  - L52: „a fix made for a reviewer Medium gets its own mutant per direction“;
  - L57 „B enforces it (RETRO 495)“.
- **შემცირებები** (მხოლოდ ნარატივი; finding id არ წაშლილა):
  - `tech-lead`-ის სიიდან: L1, L11, L12, L14, L18, L26, L28, L44, L57, L58, L59, L61;
  - B-ის მეორე ტალღა, რადგან ორმა ახალმა clause-მა (L52, L57) 57,500 B გადააჭარბა: L38, L39, L41, L45, L46, L48, L49.
  - id-ების შედარება (`b-round-494/ids-before.txt`, `ids-after.txt`) ერთ ამოღებულ token-ს აჩვენებს, `C-STRIP-PLAYING`-ს. ეს C-ის row-ის სახელია და არა finding-ის id.
- l.3-ის pointer `retro-495.md`-სა და `b-round-494/lessons-before-495.md`-ს ასახელებს.
- **შენიშვნა შემდეგი sketch task-ისთვის (advisor):** L26-ის ახალი clause A-ს ცრუ doc ხაზის ადგილზე გასწორებას უშვებს. byte-pinned sketch-ის task-მა ამიტომ granted doc-ები sha-pin-იდან უნდა გამორიცხოს, ან ხაზი შეცვლილად ჩათვალოს (content-ით). წინააღმდეგ შემთხვევაში ახალ STOP-ს ჩავწერთ.
- lesson-ების ნომრები უცვლელია.

## 11. სისტემური ამოცანა
**SYS-R495-SHARED-DIALOG** (D-29z1769; წყარო: `tech-lead` §4).
- **რა არის:** ერთი საერთო dialog primitive. focus შედის შიგნით, Tab ჩაკეტილია, Esc-ის stack-ი `stopPropagation`-ით, backdrop მთელ viewport-ს ფარავს, focus ბრუნდება. იქვე row-ები Tab-სა და ხელახლა გახსნაზე exit animation-ის დროს (RC-R492-EXIT-ANIMATION-DIALOG). PasswordModal `account.tsx`-დან მასზე გადადის; LeadMagnetPopup და ExportDialog მოგვიანებით.
- **რას ხურავს (8):** TL-R492-L4-CTRLK-OVER-DIALOG, A-R492-REVIEW-I1-PALETTE-TRAP, A-R492-REVIEW-L5-TABBABLE-SELECTOR, A-R492-REVIEW-L1-IME-KEYCODE229, B-R492-PASSWORD-BACKDROP-SHORT, B-R492-PASSWORD-DIALOG-NO-MARGIN-NARROW, A-R492-REVIEW-L4-REOPEN-MOUSE, shared-modal-no-focus-management.
- **დაბლოკილია root-ზე:** `app/components/ui/Modal.tsx` `global_forbidden_files`-შია (ROOT-REQ-SHARED-DIALOG-GRANT), საჭიროა ARCH-CHECKPOINT-ACCOUNT-PROFILE-ის პასუხიც. რიგში DPG-BUTTON-CLEANUP-ის შემდეგაა და არაფერს ბლოკავს.
- **L8 (`tech-lead`):** B-R492-PASSWORD-SUBMIT-FOCUS-LOST და GATE488-L3-SAVE-CANCEL-FOCUS-DISABLED (disabled ღილაკის focus) DPG-BUTTON-CLEANUP-ის row-ებში შედის.
- **სხვა კლასი:** `tech-lead`-ის აზრით, focus/keyboard-ის 27 id ერთი კლასი არ არის. მათი დიდი ნაწილი შესასვლელის ტესტებისა და classifier-ის საკითხებია (A-R490-*, GATE490-*); მათთვის ცალკე სისტემური task არ იგეგმება.

## 12. Saba-სთვის და root-ისთვის (წინადადებები და კითხვები; loop-ში არ სრულდება)
- **primitives-ის staleness (DPG წესი 5; `b-round-494/primitive-staleness.txt`).** RETRO 480-ის შემდეგ არაფერი შეცვლილა (`git log bbb3193..HEAD -- .claude/primitives docs/design` ცარიელია).
  - teal: DESIGN_TOKENS.md 3, TAILWIND_FIRST.md 2, DESIGN_SYSTEM.md 1;
  - შრიფტები (Inter / Playfair): 3 / 2 / 9.
  - ახალი (RC-R486-PRIMITIVE-FOCUS-EXAMPLES): FORWARDREF_COMPONENT.md l.57, l.150 და l.152 და DESIGN_TOKENS.md l.101 focus-ის `ring-2`/`outline-none` მაგალითს აძლევს. ეს store-ის ერთიან `:focus-visible` წესს (SABA-B-4) ეწინააღმდეგება.
  - `.claude/**` loop-ისთვის აკრძალულია; წინადადება: ROOT-REQ-DPG-PRIMITIVES-PATCH-ს დაემატოს focus-ის ოთხი ხაზი.
- **B-ის attempt-ის result ფაილი:** `b-round-491-result.json.attempt1.json` 0 ბაიტია, ამიტომ round 492-ის დაგეგმვის ხარჯი უცნობია. წინადადება root-ისთვის: runner-მა შეწყვეტილი attempt-ის ხარჯიც ჩაწეროს.
- **პაროლის შეცვლა (High):** `questions-retro-495.md` Q4.
- **arch checkpoint:** §7.

## 13. შემდეგი
1. **Round 495 = RETRO 495-ის შემოწმება** (`current-task.md`): A კოდს არ ცვლის. C ამოწმებს რიცხვებს, მიზეზებს, id-ებს, lesson-ებს, ეკრანს, auth guard-სა და Studio smoke-ს ბრაუზერში.
2. **Round 496 = DPG-BUTTON-CLEANUP** (DPG P1), L8-ის row-ებით (B-R492-PASSWORD-SUBMIT-FOCUS-LOST, GATE488-L3). თუ დაგეგმვა 2026-11-16-ზე ან მის შემდეგ მოხდა, მანამდე REGRESSION ჩატარდება.
3. შემდეგ DPG P1-ის დანარჩენი ნაწილი (DPG-CSS-DEDUP, DPG-FONT-RESOLVE, DPG-COLOR-CONSOLIDATE …), DP-gate-ის ხელახალი შეფასება root-თან, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED და phase 2 skip rule-ით.
4. **STEM-LANES** რიგს გაუსწრებს, როგორც კი Saba AGREE-STEM-LANES-ს უპასუხებს. **SYS-R495-SHARED-DIALOG** იწყება, როგორც კი root grant-ს მისცემს.
5. **შემდეგი RETRO:** round 510 (ფანჯარა 495–509). counter-ები `retro_policy.signals_for_next_retro[0]`-შია: C FAIL+BLOCKED ≤ 2; B spec-ის STOP ≤ 1 და 0 doc-ის წინადადებაზე; l57-check.txt 15/15; doc-ledger 100 %; lessons ≤ 57,500 B; ჯაჭვი ≤ 1; deferred ≤ 35 ახალი და ≥ 12 დახურული.
