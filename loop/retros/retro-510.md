# RETRO 510 — 22-ე რეტროსპექტივა (რაუნდები 495–509)

**ავტორი:** B, round 509 → 510 დაგეგმვისას, 2026-11-14 (დაგეგმვა დაიწყო 08:47Z, `b-round-509/checkpoint.md`). **D-ID:** D-29z1842…D-29z1849 (D-29z1849 = advisor-ის საბოლოო შემოწმების შესწორებები). **master:** `f5d1b9e` (gate 509 published).

**კონსულტაციები:**
- `tech-lead` — რეალურად გამოვიძახე; პასუხი: `b-round-509/consult-tech-lead.md`.
- `product-designer` — ეკრანი და მომხმარებლის გზა; პასუხი: `b-round-509/consult-product-designer.md`.
- advisor — დაგეგმვის მიდგომაზე (orientation-ის შემდეგ) და საბოლოო შემოწმებაზე.
- `qa-engineer`, `consequence-tester`, `design-philosopher` და `first-visit-host` ამ რაუნდის B-ის consult სიაში არ არიან (2026-11-04 §6; prompt-ის სია: product-designer, tech-lead, performance-optimizer, ableton-arrangement-expert), ამიტომ არ გამომიძახებია. ეკრანის მიმოხილვა მხოლოდ `product-designer`-მა გააკეთა.

**რატომ ახლა:** `retro_policy.next_due` = „round 510 (window 495–509)“ (D-29z1769); task 509 §0 „RETRO is round 510“. REGRESSION ჯერ არ არის საჭირო: `regression-last.json` = 2026-11-13, შემდეგი 2026-11-16-ზე ან მის შემდეგ.

**მონაცემები:** `b-round-509/*.py`, `misc-outputs.sh`, `stops-head.sh` — retro 495-ის სკრიპტების ასლები, ფანჯარა 495–509 (ჩანაცვლება 495→510, 494→509, 480→495; ხელით: `stage-sums.py`-ის stage map, `deferred-added.py`-ის D-დიაპაზონი 1772…1841). ახალი: `deferred-closed.py`, `data/l58-check-window.txt`, `data/stops-true.txt`. შესავალი: `b-round-509/backlog-retro-input.json` (v514, round 509-ის მიღების შემდეგ) და `b-round-509/archive-findings-snapshot.json`. ყველა რიცხვი ქვემოთ `b-round-509/data/`-დანაა.

## 1. მოკლედ
- **ღირებულება:** 15 რაუნდი, **$294.02** (`data/cost.txt`): B $230.74 (**78.5 %**), A $52.68, C $10.60. RETRO 495-თან ($247.20) შედარებით +19 %; B +$55.43, A +$5.21, C −$13.82.
- **C-ის ვერდიქტები** (`data/collect.txt`): PASS 12, FAIL 2 (499, 507), BLOCKED 1 (496). `browserVerified` false მხოლოდ ამ სამ STOP-რაუნდში (C-მ შესამოწმებელი ვერ მიიღო).
- **Gate:** 11 გამოქვეყნდა (497, 498, 500–506, 508, 509); გამოტოვებულია 495 (RETRO, კოდი არ შეცვლილა), 496, 499, 507.
- **STOP-ები: 4** (496, 499, 505, 507; `data/stops-true.txt`). ოთხივე — A-ს code-reviewer-ის Medium B-ის მიერ დაწერილი sketch-ის **ტესტის სიძლიერეზე** (guard scope, site × attribute, swap mutant, precondition; `tech-lead`-ის კლასიფიკაცია). doc-ის წინადადებაზე STOP არ ყოფილა.
  - შენიშვნა: `data/stops-head.txt`-ის regex (`STOP( —|:) needs`) მხოლოდ 496-ს („STATUS: STOP — routed“) ვერ ითვლის (499, 505, 507 = 1); ნამდვილი სია ხელით შემოწმდა (`a-round-496.md` l.3, `a-round-499.md` l.3, `a-round-505.md` l.3, `a-round-507.md` l.1).
  - ჩაწერილი `origin`: 496 — „A code-reviewer“ (A-R496-CR-GS3-GUARD, A-R496-CR-BC1-PIN), 499 და 505 — „B spec“, 507 — „B pre-check (mutant matrix lacked a pure-swap mutant)“. „ოთხივე B-ის sketch-ის ტესტის ხაზზე“ — `tech-lead`-ის კლასიფიკაციაა (§7).
- **ფანჯრის შედეგი:** DPG-BUTTON-CLEANUP ეტაპი 1 (496–497) და DPG-BUTTON-CLEANUP-2 ეტაპები 2a–2e (498–506) — Store-ის ბრენდის ღილაკები `Button.tsx`/`buildButtonClassName`-ზე გადავიდა; NONBRAND N1 (გლობალური audio player, 507–508); cart-ის layout-ის სამი ბაგი (502, მათ შორის High B-R502-CART-MOBILE-ITEMS-HIDDEN); პროდუქტის გვერდის მკვდარი „Complimentary Download“ → „Get it free“ (509).
- **Saba-ს ახალი საკითხი ფანჯარაში:** 0.
- **counter-ები (RETRO 495 → 510):** 10-დან მიღწეულია **3** (STOP-ის counter ერთი შედგენილი მიზანია და ვერ მიღწეულია, თუმცა doc-ის ნახევარი შესრულდა; §9).

## 2. ციფრები (`data/cost-rows.json`, `data/cost.txt`, `data/stage-sums.txt`)
- რაუნდის მედიანა **$19.39** (RETRO 495: $16.77); B-ის მედიანა **$15.16** (12.58); B min/max $6.74/$24.80.
- A-ს საშუალო FAIL-რაუნდში $5.67, PASS-ში $3.07. FAIL-რაუნდების ჯამი $43.12.
- ყველაზე ძვირი 5: 505 $27.96, 502 $27.94, 501 $24.30, 499 $23.68, 503 $21.77.
- ეტაპები: 2b-1 (499–500) $37.87; NONBRAND N1 (507–508) $31.47; ეტაპი 1 (496–497) $30.99; 2d (505) $27.96; cart (502) $27.94; 2b-3 $21.77; 2e $20.22; RETRO 495 $19.39; 2c $18.70; 2a $18.11; 509 $15.30; 2b-2 $24.30.
- **C იაფდება, B ძვირდება:** C-ის წილი 3.6 % (RETRO 495-ში 9.9 %). 15-დან 11 რაუნდი (496, 498–507) სრული byte sketch-ით დაიგეგმა; 497 — test-only addendum sketch-ის გარეშე, 508 — delta, 509 — sketch-ის გარეშე (`data/ledger-check-window.txt`: 497/509 „no sketch“); B წერს ყოველ ბაიტს და ტესტს, A — მხოლოდ ადებს (`a-round-502.md` l.3: "A wrote no code or doc prose (the sketch writes every granted byte)"; `a-round-504.md` l.3: "A wrote no code or prose of its own in the store"). ეს **დასკვნაა** და არა გაზომვა; `tech-lead`-ის შეფასება §7-შია.

## 3. FAIL-ები და STOP-ები (წყარო თითოეულზე)
| რაუნდი | რა მოხდა | წყარო | რა წესი აიცილებდა |
|---|---|---|---|
| 496 | code-reviewer-ის ორი Medium sketch-ის ტესტის guard-ებზე (BC1 pin, GS3 guard) → C BLOCKED, addendum 497 | `a-round-496.md` l.3, l.31; `c-round-496.json` | B-ის mutant-ები guard-ის მთელ scope-ზე (მეზობელი selector-ები, ფაილები, enum-ის ყველა წევრი) — RC-R496-SKETCH-TEST-STRENGTH |
| 499 | A-R499-CR-STORE-TRY-UNPINNED (Medium, origin B spec): სამი site-დან ერთი მხოლოდ source substring-ით იყო მიმაგრებული → 500 | `a-round-499.md` l.3; `c-round-499.json` | site × attribute matrix sketch review-ში — RC-R499-L58-PLANNING-FAIL |
| 505 | A-R505-CR-1-B2D7-NO-FOCUSED-BUTTON: code-reviewer Medium sketch-ის ტესტზე, A-მ STOP დაწერა; **C-მ PASS დაწერა გადაუწყვეტელ STOP-ზე და gate 505 B-ის გადაწყვეტილებამდე გამოქვეყნდა** (INFO-C505-UNRULED-STOP-PASS; B-მ 506-ის დაგეგმვისას გადაწყვიტა, D-29z1823; C-მ Medium Low-ად შეაფასა) | `a-round-505.md` l.3; `c-round-505.md` „A's STOP“; INFO-B505-SKETCH-REVIEWER-MEDIUM | იგივე კლასი; დამატებით L22 (STOP → მოკლე FAIL) C-მ არ შეასრულა |
| 507 | A-R507-CR-1-N1-2-SWAP-MUTANT: ერთნაირი ფორმის handler-ების swap mutant არ იყო B-ის matrix-ში → C FAIL, delta 508 | `a-round-507.md` l.1; `c-round-507.json` | ყოველ handler-wiring row-ს swap mutant წყვილზე — RC-R507-SWAP-MUTANT |

- **საერთო მიზეზი:** ოთხივე STOP B-ის sketch-ის ტესტის სიძლიერის ხარვეზია, რომელიც A-ს code-reviewer-მა იპოვა და B-ის `tech-lead` sketch review-მ გამოტოვა. RETRO 495-ში STOP-ის მიზეზი sketch-ის გადაუწყვეტელი Medium და doc-ის ცრუ წინადადება იყო; doc-ის კლასი გაქრა, ტესტის სიძლიერის კლასი დარჩა.
- **L58 sketch review 507/508-ში არასრული იყო** (`data/l58-check-window.txt`): 507-ის review v1-ს ეხება, dispatch-ილი v2-ის sha (`65ee9231…`) მასში არ წერია; 508-ის review-ში მხოლოდ მოკლე sha-ებია და verdict ხაზი არ არის. 507-ის STOP სწორედ ამ რაუნდშია.

## 4. Findings (`data/fails-detail.txt`, `data/classify.txt`, `data/deferred-added.txt`, `data/deferred-closed.txt`, `data/gate-reviews.txt`)
- **root cause-ის მიხედვით (მხოლოდ მტკიცებულებით):** ტესტის სიძლიერე B-ის sketch-ზე — 4 STOP + 18 deferred Low (§11, `tech-lead` §4); L58-ის განმეორება (B-მ გაუზომავი რიცხვი assert-ად დაწერა) — 1 (INFO-B497-C15-UNMEASURED-ASSERT: header-ის სიმაღლე 75 vs 81, `c-round-497.json`); task-ის ტექსტის შეცდომა — 2 (round 509 A dev 1, dev 2); C-ის პროცესი — 1 (INFO-C505-UNRULED-STOP-PASS). დანარჩენი 79 deferred-ის root cause კლასიფიცირებული არ არის.
- **C-ის ბაგები:** 4 (497 Low C497-HDR-HEIGHT-SIGNED-IN; 499 Medium A-R499-CR-STORE-TRY-UNPINNED; 505 Low A-R505-CR-1; 507 Medium A-R507-CR-1). ყველას აქვს `origin` (`data/l57-coverage.txt`).
- **ფანჯრის Medium+ (classify window ids):** B-R496-404-BROWSE-STORE-UNSTYLED, A-R496-CR-GS3-GUARD, A-R496-CR-BC1-PIN, A-R499-CR-STORE-TRY-UNPINNED, B-R502-CART-MOBILE-ITEMS-HIDDEN (High), B-R502-CART-LG-SUMMARY-CLIPPED, B-R502-CART-WHEEL-NESTED-SCROLL, A-R507-CR-1 — ყველა დახურულია C-ის მტკიცებულებით; ღიაა B-R509-AUTHMODAL-NOT-A-DIALOG (root grant-ს ელოდება) და B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD-ის backend ნაწილი (FREE-CHECKOUT-REAL-BACKEND).
- **ახალი deferred Low: 79**, ფანჯარაში დახურული deferred: **3** (A-R496-CR-BC3-SELF-DERIVED, A-R496-CR-BC4-NEAR-VACUOUS, B-R502-DOC323-L28-STATUS). პრეფიქსით: A 36, B 21, gate 9, TL 8, C 2, სხვა 3. კატეგორია (68 classify-ით): uncategorised 16, focus 11, timing/audio 11, tests/harness 7, layout/visual 6, a11y 5, copy 4, keyboard 4, docs 4.
- **Gate review-ები:** 11, 44 პუნქტი (low 23, info 10, unlabelled 11), Medium+ 0.
- **Round 509-ის A-ს deviation-ები:** dev 0 — primitives, pre-flight და lessons კოდის შემდეგ წაიკითხა (origin A); dev 1 — task-ის grep-ის მოლოდინი „`trackBeginCheckout(` მხოლოდ useBuyNowAction.ts-ში“ HEAD-ზევე მცდარი იყო (`app/hooks/useAnalytics.ts:77`) (origin B spec; L1-ის „inventory grep-იც scanner-ია“ განმეორება, 2×); dev 2 — ორი row ერთმანეთს ეწინააღმდეგებოდა (literal-ის უარყოფითი assert vs `grep app/` = 0) (origin B spec).

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **ტესტის სიძლიერე (4 STOP):** თუ B sketch-ის ტესტზე A-ს code-reviewer-ს იმავე კითხვას დაუსვამდა, რასაც A სვამს („რომელი mutant გადარჩება?“) — STOP-ები dispatch-მდე გამოჩნდებოდა. L58-ის review-ს ამ კითხვის მოთხოვნა აქვს, მაგრამ 507/508-ში review საბოლოო sketch-ს არ ეხებოდა.
- **grep-ის მოლოდინი (509 dev 1):** B-ს რომ task-ის grep HEAD-ზე გაეშვა და შედეგი `[K#]`-ად შეენახა (L58/L56), მცდარი მოლოდინი არ დაიწერებოდა.
- **row-ების წინააღმდეგობა (509 dev 2):** literal grep-ის row და უარყოფითი assert-ის row ერთად ვერ სრულდება; B-ის claims script-ს grep-ი ტესტ-ფაილებზეც რომ გაეშვა, წინააღმდეგობა გამოჩნდებოდა.
- **A-ს self-check (509 dev 0):** pre-flight და primitives კოდის წინ — ეს უკვე წესია (CLAUDE.md, `.claude/rules/read-primitives.md`); ახალი lesson არ სჭირდება, A-ს task-ში ერთი ხაზი „STOP if not read before first edit“ საკმარისია.

## 6. Saba-ს ნაპოვნი საკითხები და ეკრანი
- ფანჯარაში Saba-ს ახალი საკითხი არ ყოფილა. RETRO495-SABA-RECURRENCE-ENTRANCE: entrance/duration-ის მესამე საჩივარი **არ** დაბრუნებულა (0 განმეორება).
- **ეკრანი** (`b-round-509/screens/capture.log`, `screen510.json`): მუდმივი ტექსტის ხაზები 1440 S0 138 / DEMO 168, 1280 S0 118 / DEMO 144 — RETRO 495-ის ტოლი (Studio-ს კოდი ფანჯარაში არ შეცვლილა).
- **მომხმარებლის გზა:** product page → „Try it in the Studio“ → `/studio-lab?preview=middle-east` → Stems Pulse/Bass/Pad/Melody → play (00:01.471) → Export. ოთხი stem კვლავ ერთ Stems lane-ზე, ერთმანეთის მიყოლებით ლაგდება (left 512/1152/1792, მეოთხე 00:48.000-ზე) — STEM-LANES (Saba Q2) ჯერ არ დაწყებულა.
- `product-designer`-ის მიმოხილვა: `user-review/screen-review-510.md` (§7-ის ქვეშ შეჯამება).

## 7. `tech-lead`-ის და `product-designer`-ის დასკვნა და B-ის გადაწყვეტილებები
**`tech-lead`** (`b-round-509/consult-tech-lead.md`; ფაქტები file:line-ით, დასკვნები ცალკე):
- **STOP-ები:** 496, 499 და 507-ში B-ის matrix ამოწმებდა „დააბრუნე ან წაშალე“-ს, მაგრამ არასდროს „შეცვალე assert-ილი attribute სხვა ვალიდურ მნიშვნელობაზე“ ან „გაცვალე მეზობლები“ (`b-round-495/mutants.txt:1-8`, `b-round-498/sketch-review.md:10`, `a-round-507.md`). 505 — precondition-ის ხარვეზი (L47), კლასს ნაწილობრივ ეკუთვნის. ოთხივე Medium byte-pinned ტესტის ხაზზე იყო, A ვერ ასწორებდა და STOP გახდა (L10/L11, check 4).
- **L58-ის როლი:** `tech-lead`-ის თქმით, არ ყოფილა მიზეზი — 507-ის v1→v2 delta მხოლოდ mock-სა და ტიპებს ეხება (`b-round-506/sketch-delta-v1-v2.diff.txt:17-42`), ხარვეზი უკვე v1-ში იყო, review-მ კი „რა გადარჩება?“ არ იკითხა. 508-ის review-მ ეს კითხვა დასვა და სამი Medium იპოვა. sha/verdict-ის ნაკლი ფორმის ხარვეზია.
- **doc ledger:** lesson რეალისტური იყო და გამოტოვდა (500, 501, 503, 505, 506-ს აქვს; 507–509-ის task-ები ledger-ს არ ახსენებს). `b-round-506`-ს ledger არ ჰქონდა და review-მ ოთხი ცრუ doc-ის წინადადება იპოვა (`b-round-506/sketch-review.md:10-13`).
- **ღირებულება (დასკვნა):** მთავარი მიზეზი სრული byte sketch-ებია; რაუნდები sketch-ის გარეშე ან delta-თი B-ს $6.74 (497), $8.95 (508), $8.63 (509) დაუჯდა, sketch-იანი — მედიანა ≈ $17. ყველა STOP sketch-იან რაუნდზე მოხდა.
- **deferred Low-ები:** 18 — ტესტის სიძლიერის Low DPG-ის per-stage ტესტ-ფაილებზე → ერთი სისტემური ამოცანა (§11).

**`product-designer`** (`b-round-509/consult-product-designer.md`): ერთი ახალი Low (SR-510-1); ძველი SR-480-1/2/3, SR-290-1 და სხვები კვლავ ჩანს; გზის სამი ხახუნი (ჩასვლისას სიჩუმე SR-305-3, stem-ები მიყოლებით — STEM-LANES, export 64 წამი — SR-321-6); Medium+ ბაგი არ ჩანს. capture-მა $0 პროდუქტი და `/cart` არ გადაიღო → INFO-B510-CAPTURE-GAP.

**B-ის გადაწყვეტილებები (D-29z1846, D-29z1847):**
- `tech-lead`-ის სამივე lesson-ის ცვლილება მიღებულია (§10). Strengthen-only (L11) loop-ის შიდა grant-ის წესია, არა პროექტის წესი — B იღებს; C ამოწმებს `expect(`-ის რაოდენობას და red mutant-ს.
- RC-R510-SKETCH-SCOPE საცდელად 511–525-ში: სრული byte sketch მხოლოდ რისკიან product-code hunk-ზე; ტესტსა და doc-ს A წერს B-ის კონტრაქტით.
- RC-R496/R499/R507 → adopted; RC-R492 → ხელახლა ჩამოყალიბდა.

## 8. ღია კანდიდატებისა და ვადების ბედი (L46; `data/retro510-deadlines.txt`)
| ID | ვადა იყო | გადაწყვეტილება (D-29z1846) |
|---|---|---|
| TLM-R485-SR-ROUTE-ANNOUNCE, TLM-R489-SABA-ENTRANCE-FEEL, TLM-R489-TOUCH-SWIPE, TLM-R491-PHONE-NAME-EDITOR | RETRO 510 (მეორე) | შეუერთდა SABA-DEVICE-CHECKS-ს (როგორც D-29z1768 იწერებოდა); Q1 |
| TLM-R492-SR-PASSWORD-DIALOG | RETRO 510 (პირველი) | კითხვა Saba-ს (Q2); ახალი ვადა RETRO 525 |
| TLM-PERF15-FIREFOX, TLM-R454/R455/R459 (Firefox/Safari), TLM-SYS3-IME-PLATFORMS, TL-R444-L1-REAL-IME-SEARCH-CLEAR | RETRO 510 | FIREFOX-CHECKS / SAFARI-CHECKS / IME — Q3; ვადა RETRO 525 |
| ARCH-CHECKPOINT-ACCOUNT-PROFILE | RETRO 510 | root-ის პასუხი არ არის; guard რჩება (account.tsx-ზე მხოლოდ Medium+); Q4; ვადა RETRO 525 |
| RETRO480-SINGLE-RUNNER-CONTROL | counter | ფანჯარაში ახალი შემთხვევა არ ყოფილა (wall-clock control არ დანიშნულა); retired 1×-ად (D-29z1846) |
| RETRO495-SABA-RECURRENCE-ENTRANCE | counter | 0 განმეორება; retired (D-29z1846) |
| RC-R492-DOC-TRUTH-REVIEW (L26 „Every sentence has a ledger“) | counter 100 % | 5/11 — §9, §10 |
| RC-R496-SKETCH-TEST-STRENGTH, RC-R499-L58-PLANNING-FAIL, RC-R507-SWAP-MUTANT | RETRO 510 | 4 STOP-ის საერთო კლასი — §10 |
| INFO-B497-C15-UNMEASURED-ASSERT, INFO-C505-UNRULED-STOP-PASS, INFO-B505-SKETCH-REVIEWER-MEDIUM | RETRO 510 input | გამოყენებულია §3 (505) და §4 (497, L58 განმეორება); დაიხურა (D-29z1846, შესწორება D-29z1849) |

## 9. countermetric-ები: retro 495-ის მიზნები → შედეგი
| Counter (RETRO 495, `tech-lead`) | შედეგი | წყარო |
|---|---|---|
| C FAIL + BLOCKED ≤ 2 / 15 | 3 (496 BLOCKED, 499, 507) — **ვერ მიღწეულია** | `data/collect.txt` |
| STOP origin B spec ≤ 1 და 0 doc-ის წინადადებაზე | 4 B-spec — **ვერ მიღწეულია**; doc 0 — **მიღწეულია** | `data/stops-true.txt` |
| `c-round-N/l57-check.txt` L57 OK 15/15 | 15/15 — **მიღწეულია** | `c-round-N/l57-check.txt`, `data/l57-coverage.txt` |
| doc-ledger 100 % იმ რაუნდებში, რომლებიც impl doc-ს აქვეყნებს | 5/11 (500, 501, 503, 505, 506; აკლია 497, 498, 502, 504, 508, 509) — **ვერ მიღწეულია**; `tools/ledger-check.py`-ით 3/11 doc-sketch task (§10) | `gates/gate-round-N.json` paths, `ls b-round-(N-1)/doc-ledger.md`, `data/ledger-check-window.txt` |
| `lessons.md` ≤ 57,500 B, ≤ 60 ხაზი, ხაზი ≤ 4,800 B | 57,164 B, 60, max 4,753 — **მიღწეულია** | `b-round-509/lessons-before-510.md` |
| fix-up ჯაჭვი ≤ 1 | 496→497, 499→500, 507→508 (თითო 1) — **მიღწეულია** | `data/task-titles.txt` |
| ახალი deferred ≤ 35 და ≥ 12 დახურული | 79 / 3 — **ვერ მიღწეულია** | `data/deferred-added.txt`, `data/deferred-closed.txt` |
| რაუნდის მედიანა ≤ $18 | $19.39 — **ვერ მიღწეულია** | `data/cost.txt` |
| B-ის მედიანა ≤ $13 | $15.16 — **ვერ მიღწეულია** | `data/cost.txt` |
| B-ის წილი ≤ 68 % | 78.5 % — **ვერ მიღწეულია** | `data/stage-sums.txt` |
| (დამატებით) l58-check | 13/15 (INCOMPLETE 507, 508) | `data/l58-check-window.txt` |

## 10. ცვლილებები: lessons (`b-round-509/lessons-diff.txt`)
| # | ცვლილება | რატომ |
|---|---|---|
| E1 | L52 + „Site × attribute mutants (RETRO 510)“ | 4 STOP (496/499/505/507), `tech-lead` §1 |
| E2 | L11 + „Strengthen-only (RETRO 510)“: A-ს შეუძლია sketch-ის ტესტის ხაზის გამაძლიერებელი ფიქსი რაუნდშივე (`expect(` არ კლებულობს, red mutant); product-code Medium კვლავ STOP | ოთხივე STOP ამით რაუნდშივე გასწორდებოდა (დასკვნა) |
| E3 | L26 „Every sentence has a ledger“ → „Behaviour sentences have a ledger (RETRO 510)“ + ახალი `tools/ledger-check.py` | counter 5/11; შემოწმება ავტომატური არ იყო |
| E4 | L1 „inventory grep“: task-ის grep HEAD-ზე გაუშვი და შეინახე (2×) | round 509 A dev 1 |
| E5 | წაიშალა l.43 „(Also L38 under C: perf runs alone.)“ (L38 თვითონ C-ის ნაწილშია) | ზომა |
| E6 | header-ში RETRO 510-ის მითითება (შემდეგ T1-მა შეკუმშა) | მიკვლევადობა |
| E7 | L26-ში დაბრუნდა „per input origin“ და „greps open findings on touched files“ (`edit-lessons-3.log`, advisor, D-29z1849) | სწორედ ესენი აიცილებდა C-R492-01/C-R493-01-ს |
| T1 | header-ის ისტორია შემოკლდა (779 → 500 B); სრული ტექსტი `b-round-509/lessons-before-510.md` l.3-შია | ზომა ≤ 57,500 B |

შედეგი: 60 → 59 ხაზი, 57,164 → **57,494 B**, უგრძესი ხაზი 4,771 B. ლოგები: `edit-lessons.log`, `edit-lessons-2.log`, `edit-lessons-3.log`; diff: `lessons-diff.txt` (hunks 3, 6, 36, 43–44, 49).

`tools/ledger-check.py` ფანჯარაზე (`data/ledger-check-window.txt`): doc-ის ტექსტიანი sketch 11 task-ში (498–508); OK 3 (501, 505, 506), ledger არ არის 6-ში (498, 499, 502, 504, 507, 508), id აკლია 2-ში (500 `B2B-0`, 503 `B2B3-7`).

## 11. სისტემური ამოცანა
**DPG-BUTTON-CONTRACT-TABLE** (D-29z1847; `backlog.json` → `systemic_tasks`): `store-button-cleanup*.test.tsx` ფაილები ერთ table-driven კონტრაქტ-ტესტად — ყოველი migrated site-ის class set უდრის თავისი variant/size-ის rendered reference-ს (როგორც N1-7), + attribute და swap mutant-ები (L52), focus precondition-ის row-ები (L47) და ერთი CSS + TSX token guard მთელ `app/`-ზე. ქცევა არ იცვლება, მხოლოდ ტესტი.
- **ხურავს 18 deferred Low-ს:** A-R496-CR-BC5-CLASS-ONLY, A-R496-CR-BC6-BARE-BUTTON-TOKEN, A-R498-CR-ST5-EXACT-COUNT, A-R498-CR-ICON-ASSERT, A-R500-CR-B2B5-COMMENT-ANCHOR, A-R501-CR-ST5-STRING-PIN, A-R501-CR-B2B2-6-ONE-BUTTON, A-R501-CR-LUCIDE-CLASS, A-R503-CR-2-B2B3-6-WEAK-COUNT, A-R503-CR-3-STUBCATALOG-DRIFT, A-R504-CR-1-REDUNDANT-TEXT-BLACK, A-R504-CR-2-DISABLED-CLICK-NO-MUTANT, A-R505-CR-1-B2D7-NO-FOCUSED-BUTTON, A-R506-CR-1-HOOKS-MOCK-BARREL, A-R508-CR-VOLUME-ICON-UNPINNED, A-R508-CR-MUTE-LOW-VOLUME-CLICK, A-R508-CR-USEAUDIO-MOCK-UNTYPED, A-R509-CR-TEST-SELECTORS.
- **როდის:** NONBRAND N2–N9-ის შემდეგ, DPG-ის ეტაპი 2-ის დახურვად (`tech-lead`: N ეტაპები row-ებს პირდაპირ ცხრილში დაამატებს). ახლა არ იწყება.
- SYS-R495-SHARED-DIALOG კვლავ root-ის grant-ს ელოდება.

## 12. Saba-სთვის და root-ისთვის (წინადადებები და კითხვები; loop-ში არ სრულდება)
მხოლოდ წინადადებები; loop არ ასრულებს (`questions-retro-510.md` Q4, Q6):
1. **primitives განახლება (root, ROOT-REQ-DPG-PRIMITIVES-PATCH):** `DESIGN_TOKENS.md` teal 3, `TAILWIND_FIRST.md` 2, `DESIGN_SYSTEM.md` 1; ფონტები 3/2/9; focus-ის მაგალითები `ring-2` (`FORWARDREF_COMPONENT.md` l.57, l.150, l.152; `DESIGN_TOKENS.md` l.101) — `b-round-509/primitive-staleness.txt`. `.claude/primitives`-ზე 3bcf8cb-ის შემდეგ commit არ ყოფილა; DESIGN_SYSTEM.md-ის ღილაკის სექცია განახლდა (l.1112).
2. **RETRO-ს consult სია:** retro policy `qa-engineer`-ს და `consequence-tester`-ს ითხოვს, ეკრანის მიმოხილვა — `design-philosopher`-ს და `first-visit-host`-ს; B-ის სიაში ოთხი აგენტია (2026-11-04 §6). წინადადება: RETRO-რაუნდში ეს ოთხი დაემატოს.
3. **A-ს pre-flight (round 509 dev 0):** CLAUDE.md და `read-primitives.md` უკვე ითხოვს წაკითხვას კოდამდე; წინადადება — hook-მა პირველ Edit-ზე `pre-flight` checklist-ის კვალი მოითხოვოს (project-rule ცვლილება, Saba-ს თანხმობით).
4. **სისტემური:** `tools/ledger-check.py` loop-ის ინსტრუმენტია; root-ის gate-ს შეუძლია task-ზე გაუშვას (წინადადება).

## 13. შემდეგი
- **round 510** = ეს RETRO; C ამოწმებს მიკვლევადობას, lessons-ს, ledger-check-ს, დაცვას, anonymous `/studio-lab`-ის რეალურ აუდიოს და ეკრანის რიცხვებს (`current-task.md`).
- **round 511:** REGRESSION, თუ დაგეგმვა 2026-11-16-ზე ან მის შემდეგაა; თორემ NONBRAND N2 (პროდუქტის გვერდი: PurchaseHeader-ის in-card ღილაკები + PlayStems; sidebar 509-ში დასრულდა) RC-R510-SKETCH-SCOPE-ით.
- შემდეგ: N3–N9, StemsPlayerModal-ის წყვილი (ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE-ის stems ნაწილი), PD-R498-404-SECONDARY-ALIGN, DPG-BUTTON-CONTRACT-TABLE, DPG P1-ის დანარჩენი, DP gate, P2; შემდეგ STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS და დანარჩენი რიგი.
- **RETRO 525** — counter-ები `retro_policy.signals_for_next_retro[0]`-ში.
