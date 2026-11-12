# RETRO 480 — მეოცე რეტროსპექტივა (რაუნდები 465–479)

**ავტორი:** B, round 479 → 480 დაგეგმვისას, 2026-11-12 (დაგეგმვა დაიწყო 22:43Z, `b-round-479/checkpoint.md`). **D-ID:** D-29z1700…D-29z1707 (D-29z1707 = advisor-ის საბოლოო შემოწმების შესწორებები). **master:** `bbb3193` (gate 479 published).
**კონსულტაციები:**
- `tech-lead` — რეალურად გამოვიძახე; პასუხი: `b-round-479/consult-tech-lead.md`.
- `product-designer` — ეკრანი და გზა; `b-round-479/consult-product-designer.md`.
- advisor — დაგეგმვის მიდგომა (orientation-ის შემდეგ) და საბოლოო შემოწმება.
- `qa-engineer`, `consequence-tester`, `design-philosopher` და `first-visit-host` B-ის consult სიაში არ არიან (2026-11-04 §6) და არ გამომიძახებია.

**რატომ ახლა:** RETRO ყოველ 15 რაუნდში ტარდება (Saba, 2026-10-26). `retro_policy.next_due` = „round 480 (window 465–479)“ (D-29z1640). REGRESSION ჯერ არ არის საჭირო: `regression-last.json` 2026-11-10-ია, დაგეგმვა კი 2026-11-12-ს მიმდინარეობს. ის round 481-ია (D-29z1702).

**მონაცემები:** `b-round-479/*.py`, `misc-outputs.sh`, `stops-head.sh` (retro 465-ის სკრიპტების ასლები, ფანჯარა 465–479). შესავალი: `b-round-479/backlog-retro-input.json` (v467, round 479-ის მიღების შემდეგ) და `archive-findings-snapshot.json`. შედეგები: `b-round-479/data/`.

## 1. მოკლედ
- 15 რაუნდი, **$214.36**. B $133.40 (62.2 %), A $68.69, C $12.27 (`data/cost.txt`).
- C: PASS 10, FAIL 4 (466, 471, 472, 476), BLOCKED 1 (469). `browserVerified` false იყო მხოლოდ 471-სა და 476-ში: ორივე მოკლე FAIL-ია, სადაც ბრაუზერის row-ები არ გაეშვა (`data/fails-detail.txt`).
- გამოქვეყნდა 8 რაუნდი; gate გამოტოვებულია 7-ში (465, 466, 468, 469, 471, 472, 476; `data/cost.txt`).
- ხუთივე STOP (466, 471, 472, 475, 476) ერთი კლასისაა: A-ს reviewer-მა Medium ან სპეციფიკაციის წინააღმდეგობა იპოვა hash-ით დაფიქსირებულ sketch-ში ან grant-ში (`data/stops-head.txt`; §3).
- ფანჯრის მთავარი შედეგი: Store-ში teal აღარ არის. DPG P0 (474–478) და P1-ის პირველი ეტაპი (479) C-მ დაადასტურა. თუმცა „მზადაა“ არცერთი არ არის: DP-gate-ის ხელახალი შეფასება root-ს ჯერ არ ჩაუტარებია (DPG წესი 4).
- Saba-მ ფანჯარაში ორი საკითხი იპოვა: SABA-B-15 (სქროლი) და SABA-B-16 (ლოგოს ფერები). დიზაინის gate-მა (3.5/10 და 4/10) teal-ის ნარჩენი აღნიშნა. §6.

## 2. ციფრები (`data/cost-rows.json`, `data/cost.txt`, `data/stage-sums.txt`)
| ეტაპი | რაუნდები | ჯამი | საშუალო |
|---|---|---|---|
| RETRO 465 | 465 | $14.94 | $14.94 |
| STORE-2b-3c-2b | 466–467 | $25.39 | $12.70 |
| SABA-B-15 (სქროლი) | 468–470 | $50.36 | $16.79 |
| STORE-2c-1 (ფონტის token-ები) | 471–473 | $35.91 | $11.97 |
| DPG-P0-1 | 474 | $22.09 | $22.09 |
| DPG-P0-2 | 475 | $8.04 | $8.04 |
| DPG-P0-3a | 476–477 | $23.46 | $11.73 |
| DPG-P0-3b | 478 | $16.26 | $16.26 |
| DPG-FOOTER-LINKS | 479 | $17.91 | $17.91 |

- რაუნდის მედიანა **$15.29**, B-ის მედიანა **$9.38** (min 1.95, max 13.45).
- A-ს საშუალო: FAIL-ზე $4.90, PASS-ზე $4.43.
- FAIL რაუნდების ჯამი $60.45.
- ყველაზე ძვირი ხუთი რაუნდი: 474 $22.09, 468 $19.77, 479 $17.91, 476 $17.28, 478 $16.26.
- retro 465-თან შედარებით ($282.31, მედიანა $20.25, B-ის წილი 71.7 %) ფანჯარა 24 %-ით იაფია. B-ის წილი 62.2 %-მდე შემცირდა.
- B-ის ღირებულება round N-ზე არის `b-round-(N-1)-result*.json`, როგორც retro 465-ში. ამ დაგეგმვის (b-round-479) ღირებულება აქ არ შედის.

## 3. FAIL-ები, BLOCKED და STOP-ები (წყარო თითოეულზე)
| რაუნდი | კატეგორია (`tech-lead`) | მიზეზი (წყარო) | წესი |
|---|---|---|---|
| 466 FAIL | ტესტის სიძლიერე (B spec) | TS8 pre-check-ს ასახელებდა, მაგრამ მისი მოშორების mutant არ არსებობდა (`a-round-466.md` l.3–4; `c-round-466.json` C-R466-01) | L58 (l.41): branch-ის სახელის row-ს sketch-ზე გაშვებული mutant სჭირდება. უკვე არსებობს |
| 469 BLOCKED | გარემო + აკლდა row | HEAD-ის control-მა 5-ის ნაცვლად 2/1 ნელი კადრი აჩვენა, სამჯერ: სქროლის jank ამ runner-ზე არ მეორდება (`c-round-469.json` `blocked[0]`, B-მ წაიკითხა). C-R469-01: მხოლოდ mean-ის ზღვარმა ბრტყელი glow გაატარა | `tech-lead`-ის აზრით: HEAD control-ზე დამოკიდებულ row-ს B ამ runner-ზე წინასწარ უშვებს; თუ არ მეორდება, row `record` ხდება. ფორმის ნახევარი L58-შია (D-29z1654) |
| 471 FAIL | sketch-ის დეფექტი / ტესტის სიძლიერე | FN4 მთელ `app.css`-ს კითხულობდა, ამიტომ Store-ის `@theme` დაუცველი დარჩა (`a-round-471.md` l.3; C-R471-01). task 471-ზე l58-check INCOMPLETE იყო, ანუ არსებული წესი არ ამუშავდა (RC-R471-L58-SKIPPED) | L58 უკვე არსებობს; პრობლემა მისი შესრულებაა |
| 472 FAIL | ორაზროვანი grant | doc 306 ხაზის ნომრებით იყო granted და l.79 მცდარი დარჩა (`a-round-472.md` l.3; C-R472-01) | l.49 (L26): doc fix-up-ის grant ნებისმიერი მცდარი ხაზის გასწორებას უშვებს. უკვე არსებობს |
| 475 STOP (PASS) | task-ის ტექსტის წინააღმდეგობა | §1.2 და §1.6 STOP-ის ორ სხვადასხვა ზღვარს ამბობდა; A Low-ებზე გაჩერდა (`a-round-475.md` l.3; C-R475-01) | ახალი clause L10-ში: STOP-ის ზღვარი task-ში ერთხელ იწერება (§10) |
| 476 FAIL | sketch-ის დეფექტი, B-ის გადაწყვეტილების გარეშე | byte-exact sketch-მა ფონის ორმაგი ფენა დატოვა; B-ს არ უმსჯელია, ამიტომ row-ები არ გაეშვა (`a-round-476.md` l.3; C-R476-STOP-R1) | `tech-lead`-ის წაკითხვით l.15 (L10): STOP-ზე გადაწყვეტილება re-dispatch-მდე, და sketch review პროექტის წესებსაც ფარავს |

`tech-lead`-ის დასკვნა: 466, 471 და 476 ერთი კლასია, reviewer-ის Medium byte-pinned sketch-ზე. L58 მას უკვე planning FAIL-ს უწოდებს, ამიტომ ახალი წესი არ არის საჭირო. პრობლემა შესრულებაშია (`l58-check.py` INCOMPLETE). retro 465-ის counter-მა RETRO480-PINNED-SKETCH-MICRO-FIX ამ ფანჯარაში კიდევ 3 შემთხვევა დაითვალა (466, 471, 476).

## 4. Findings (`data/fails-detail.txt`, `data/classify.txt`, `data/deferred-added.txt`, `data/gate-reviews.txt`, `data/l57-check-window.txt`)
- **C-ის ბაგები: 11.** Medium 4: C-R466-01, C-R471-01, C-R472-01, C-R476-STOP-R1. Low 7: C-R469-01, C-R470-F1, C-R474-01, C-R474-02, C-R475-01, C-R475-02, C-R478-01.
- **ახალი deferred Low (union method): 43** (`data/deferred-added.txt`). მეთოდის მიხედვით: a 43, b 36, c 40. პრეფიქსის მიხედვით: A 19, TL 8, B 5, C 5, gate 3, სხვა 3. აქედან 7 ამავე დაგეგმვამ დაამატა round 479-დან (D-29z1701), ამიტომ წინა რაუნდების წილი 36-ია.
- **classify (id-ში რაუნდის ნომრით, `data/classify.txt`):** ფანჯარაში open 6, deferred 31, archive 8.
- **gate-ის review-ები: 8**, 35 პუნქტი: low 15, info 6, unlabelled 13, medium 1 (`data/gate-reviews.txt`). ერთადერთი Medium round 479-ისაა: client ნავიგაცია გვერდის სათაურს ეკრანის მკითხველს აღარ აცნობს (GATE479-M1-ROUTE-ANNOUNCE, D-29z1700).
- **L57 (C-ის JSON-ის ველები): OK 10/15.** INCOMPLETE (`data/l57-detail.txt`): 469 — 8 ველი აკლია და C-R469-01-ს `origin` არ აქვს; 470 — 5 ველი აკლია, 2 `null` (`manifestPaths`, `assertsSpecified`), C-R470-F1-ს `origin` არ აქვს; 472 — 12 ველი აკლია და C-R472-01-ს `origin` არ აქვს; 475 და 477 — 12-12 ველი აკლია. წყარო: `data/l57-check-window.txt`, `tools/l57-check.py`.
- **L58 (task-ის sketch-ის შემოწმება): OK 13/14** (466–479). 471 INCOMPLETE (`data/l58-check-window.txt`), იხ. RC-R471-L58-SKIPPED.
- **fix-up ჯაჭვები: 4** — 466→467, 469→470, 471→472→473, 476→477 (`data/task-titles.txt`).

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **უკეთესი spec:** 471 (l58-check-ის INCOMPLETE ბლოკი dispatch-მდე), 472 (მთელი დოკუმენტის grant), 475 (STOP-ის ერთი ზღვარი), 469 (control-ის წინასწარი გაშვება ამ runner-ზე).
- **A-ს self-check:** 466-სა და 476-ში A-მ თავად იპოვა პრობლემა (reviewer-ის Medium) და სწორად გაჩერდა. დაკარგული რაუნდი B-ის sketch-ის ხარისხს ეკუთვნის და არა A-ს.
- **shared helper:** round 479-ის focus helper-ი 13 ადგილას ხელით არის მიბმული; gate reviewer-ის აზრით `InternalLink` wrapper-ი ამას გაამარტივებს (SIG-R479-INTERNAL-LINK-WRAPPER). CSS-ის regex scanner-ების Low-ების კლასს (TL-R465-*, A-R466-REVIEW-*, SR-472-*, A-R472-REVIEW-L4, A-R473-*, TL-R464-*, A-R464-REVIEW-*) `tech-lead`-ის აზრით AST reader სჭირდება. `postcss` მხოლოდ transitive dependency-ა, `package.json` კი აკრძალულია, ამიტომ loop ამ კლასს პატიოსნად ვერ დახურავს (§12, root).

## 6. Saba-ს ნაპოვნი საკითხები და ეკრანი
- **SABA-B-15 (სქროლი, Medium).** „Why we missed it“ წერია `tasks/round-468.md`-ში l.62–65: STORE-ის C row-ები LCP/CLS-ს და კონტრასტს ზომავდა, სქროლის კადრებს კი არა. წესი L18-ში ჩაემატა („Scroll frames“). ფანჯარაში იგივე კლასი აღარ განმეორებულა. დახურვისთვის საჭიროა Saba-ს მოწყობილობაზე შემოწმება: `questions-retro-480.md` Q1.
- **SABA-B-16 (ლოგოს ძველი ფერები, Medium).** header-ის ლოგო და შესასვლელი wordmark round 477-ში brass გახდა (C7). asset-ის სახელი ჯერ Saba-ს არ დაუსახელებია (`questions-round-467.md` Q3). სათაურის ცალკე lesson არ არსებობს. მიზეზი იგივეა, რაც დიზაინის gate-ის: ფერის მიგრაცია token-ების დონეზე დასრულებულად ჩაითვალა.
- **დიზაინის gate 2026-11-12 (3.5/10, 4/10).** Saba-მ ხუთი პროცესის წესი დაწერა (policy, „Process improvements from DPG-1 failure analysis“). lessons-ში უკვე იყო L2 (token → consumer rows, l.7) და L15 (კონტრასტი). Saba-ს ფერის მიგრაციის წესები l.7-ის „Colour migration (DPG, Saba 2026-11-12)“ clause-მა უკვე ჩაიწერა; `tech-lead`-ის აზრით ახალი clause საჭირო არ არის (`consult-tech-lead.md` §2c).
- **ეკრანი (`user-review/screen-review-480.md`):** Studio-ს ხაზები 465-ის ტოლია (138/168/118/144; გარეთ 97/124/86/101). ახალი კანდიდატებია SR-480-1…3, სამივე Low. `product-designer`-ის აზრით, გზის ქულა 6/10-ია: ცარიელი timeline შესვლისას, stems ერთად არ უკრავს და export-ში საცდელი ტრეკი არ არის.
- **Primitive-ების სიძველე (Saba-ს წესი 5; `b-round-479/primitive-staleness.txt`):** `.claude/primitives/DESIGN_TOKENS.md` l.9 ისევ ამბობს, რომ brand არის `#13D9CC (Teal)`, l.108 კი „Teal + Orange“-ს. ეს მოძველებული წესია. `TAILWIND_FIRST.md` l.15 და l.18 „ცუდი მაგალითის“ ხაზებია ძველი hex-ით; Tailwind მათგან class-ს აგენერირებს (C-R474-02). `docs/design/DESIGN_SYSTEM.md` l.1536 changelog-ის ხაზია, ისტორია და არა მოძველებული წესი. ROOT-REQ-DPG-PRIMITIVES-PATCH root-ს ჯერ არ შეუსრულებია (`.claude/**` loop-ისთვის აკრძალულია). სანამ ის არ შესრულდება, ყველა აგენტი, რომელიც DESIGN_TOKENS.md-ს კითხულობს, ძველ brand ფერს ხედავს. **შრიფტებიც (advisor-ის შენიშვნით შემოწმება გაფართოვდა):** DESIGN_TOKENS.md l.57–59 და TAILWIND_FIRST.md l.101/105 ისევ Playfair Display / Inter-ს ასახელებს, `docs/design/DESIGN_SYSTEM.md` l.750–761 კი „რატომ Playfair Display + Inter?“-ს ხსნის. `app.css` l.113–115-ში Instrument Sans / IBM Plex Mono-ა (STORE-2c-1). ეს DPG წესი 2-ის („token change = docs change“) დარღვევაა round 471–473-ში. DESIGN_SYSTEM.md → DPG-FONT-RESOLVE, primitives → root-ის მოთხოვნა (D-29z1707).

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
- **GATE479-M1-ROUTE-ANNOUNCE (D-29z1704).** `tech-lead`-ის აზრით, ფიქსი `root.tsx`-ის გარეშეც შეიძლება: ახალი `RouteAnnouncer.tsx` `app/components/layout/`-ში, Header-ში ჩასმული. B-მ გადაამოწმა: `app/root.tsx` l.136 `isStudioPage = pathname.startsWith('/studio')`, l.143 `{!isStudioPage && <Header …/>}` — Header `/studio*`-ზე არ იხატება; `meta` export არ აქვს `cart`, `search`, `account`, `account_.login`, `account.orders`, `account.reset.$id.$token`, `account.downloads` route-ებს და `root.tsx`-ს (claims K30, K31). რისკები, რომლებიც B-მ sketch-ზე ბრაუზერით წინასწარ უნდა გაუშვას: (1) 7 Store route-ს `meta` არ აქვს, ამიტომ საჭიროა fallback (title, შემდეგ `main h1`); (2) Header Studio → Store-ზე თავიდან mount-დება, ამიტომ module-level flag; (3) title-ის დრო. **B-ის გადაწყვეტილება:** სისტემური ამოცანა CLIENT-NAV-CONTRACT, round 482 (REGRESSION-ის შემდეგ). თუ B-ის წინასწარი გაშვება (1)–(3)-ს ვერ დაამტკიცებს, root-ს ეგზავნება ROOT-REQ-ROUTE-ANNOUNCER („RouteAnnouncer `root.tsx`-ში `<Outlet/>`-ის შემდეგ + `meta` 7 route-ზე“).
- **B-R478-DEAD-MUSIC-LINK** — round 483 (`account.orders` → `/store`); L46-ის ვადა ამ დაგეგმვით სრულდება.
- **RETRO480-PINNED-SKETCH-MICRO-FIX:** 3 ახალი შემთხვევა (466, 471, 476). `tech-lead`-ის აზრით, წესი უკვე არსებობს და აკლია მისი შესრულება. ამიტომ micro-fix-ის წინადადება Saba-სთან ისევ წინადადებად რჩება, ახალი არგუმენტით (§12). counter იხურება: `ruled (D-29z1706)`.
- **RETRO480-COLLECTOR-UNDERCOUNT:** ამ ფანჯარაში union მეთოდმა 43, `added`-მა 43 დაითვალა; სხვაობა აღარ არის (`data/deferred-added.txt`). `ruled`.
- **RETRO480-LOOK-CONTROL:** უკვე L58-შია (D-29z1654). `ruled`.
- **RETRO480-SINGLE-RUNNER-CONTROL (1×):** მისი ერთადერთი შემთხვევა თავად round 469-ია, ამიტომ ისევ 1×. `tech-lead`-ის წესი („control წინასწარ ამ runner-ზე“) RETRO 495-მდე counter-ად რჩება (D-29z1707). `ruled`.
- **B-R471-SKETCH-UNREVIEWED, B-R472-LINE-GRANTS:** RC-R471-L58-SKIPPED-ითა და L26-ით არის დაფარული (D-29z1707).
- **ARCH-CHECKPOINT-STYLE-SCAN:** round 480-ის ვადა უპასუხოდ გავიდა; SYS-R465-DEAD-CSS-MATCHER მის გარეშე იგეგმება, მოთხოვნა root-თან ღიად რჩება (D-29z1707).
- **SIG-R477-DOCS-OUTSIDE-DESIGN:** სამ კანდიდატ დოკუმენტში teal/cyan ხაზი ისევ არის: `docs/technical/overview.md` 3, `components/ui-components.md` 1, `docs/prompts/modules/design-system.prompt.md` 1 (`primitive-staleness.txt`). DPG P1-ის შემდეგ დოკუმენტების follow-up-ის შესავალია, ახლა არ იგეგმება (D-29z1707).
- **RC-R471-L58-SKIPPED / RC-R476-SKETCH-RULE-REVIEW:** RETRO 495-ის counter „l58-check 15/15, 0 STOP unruled sketch Medium-ზე“. `ruled`.
- **RC-R472-DOC-GRANT-LINES:** L26 (l.49) ფარავს; 473–479-ში არ განმეორებულა. `ruled`.
- **RC-R473-POLICY-COUNT-STALE / RC-R474-POLICY-LIST-VS-RESOLVER:** Saba-ს policy-ის რაოდენობები ხეს არ ემთხვეოდა (~100 teal; `--radius-xs`). B ზომავდა თავად ხეზე, ასე რომ, ეს ორივე წესი უკვე L29-ის შესრულებაა („claim = re-runnable command“). DP-gate-ის ანგარიშს root-ისგან commit-ის სახელი სჭირდება (§12). `ruled`.
- **RC-R475-STOP-CLAUSE:** L10-ის ახალი clause (§10). `ruled`.
- **RC-R478-DOCS-NO-SKETCH:** prose-doc რაუნდში sketch-ის ნაცვლად HEAD-ზე და სინთეზურ ხეზე red/green/mutant-ით დამტკიცებული checker-ი მიღებულ ვარიანტად ითვლება, თუ checker-ს mutant აწითლებს (round 478 C PASS). `ruled`.
- **RC-R479-CLIENT-NAV-FOCUS:** L47-ის ახალი clause (§10) და CLIENT-NAV-CONTRACT. `ruled`.

## 8. ღია კანდიდატებისა და ვადების ბედი (L46; `data/retro480-deadlines.txt`)
| საკითხი | გადაწყვეტილება (D-29z1705) |
|---|---|
| Firefox-ის 5 შემოწმება (TLM-PERF15-FIREFOX, TLM-SABA-B-12-FIREFOX-SAFARI-ის Firefox ნაწილი, TLM-R454, TLM-R455, TLM-R459) | მეორე RETRO პასუხის გარეშე → L46: ერთ task-ად იხსნება, **FIREFOX-CHECKS**, დაბლოკილია ROOT-REQ-PLAYWRIGHT-FIREFOX-ზე. Q3 |
| Safari-ის სია (TLM-SABA-B-12 Safari, TLM-R449, TLM-R454/R459 Safari, A-R73-SAFARI-FLAG-FOCUS) | მეორე RETRO → **SAFARI-CHECKS** task, დაბლოკილია Saba-ს macOS-ზე. Q4 |
| TLM-R448-HIREUS-EMAIL-CLIENTS | მეორე RETRO → **HIREUS-EMAIL-CLIENTS** task, დაბლოკილია Brevo/Saba-ზე. Q4 |
| TLM-SYS3-IME-PLATFORMS, TL-R444-L1-REAL-IME-SEARCH-CLEAR | RETRO 465-ზე უკვე გაიხსნა task-ად, დაბლოკილია; ვადა RETRO 495. Q6 |
| STUDIO-PERFORMANCE-ის გაჩერებული ნაწილები | დიზაინის არჩევანია, არა ხელით შემოწმება; მეოთხე კითხვა, ვადა RETRO 495. Q5 |
| TLM-R468-SABA-SCROLL-DEVICE / SABA-B-15 | პირველი RETRO ვადა → კითხვა Q1, ახალი ვადა RETRO 495 |
| B-R478-DEAD-MUSIC-LINK (Medium) | ვადა: პირველი დაგეგმვა RETRO 480-ის შემდეგ. Round 481 REGRESSION-ია, ამიტომ round 481-ის დაგეგმვა მას round 482-ად ნიშნავს GATE479-M1-თან ერთად (D-29z1704) |
| SYS-R465-DEAD-CSS-MATCHER | trigger „round 480“ დადგა, ARCH-CHECKPOINT-STYLE-SCAN-ზე root-ს არ უპასუხია → იგეგმება root-ის პასუხის გარეშე, DPG P1-ის შემდეგ (მიმდინარე ეტაპის შემდეგ, სისტემური ამოცანების წესი) |
| RETRO480-* counter-ები და RC-R46x/R47x კანდიდატები | §7 |

## 9. countermetric-ები: retro 465-ის მიზნები → შედეგი
| მიზანი | შედეგი |
|---|---|
| რაუნდის მედიანა ≤ $18.00 | $15.29 — შესრულდა |
| B მედიანა ≤ $13.00 | $9.38 — შესრულდა |
| B წილი ≤ 68 % | 62.2 % — შესრულდა |
| C FAIL ≤ 2 | 4 (466, 471, 472, 476) — **ვერ** |
| ახალი deferred Low ≤ 35 | 43 (ამ დაგეგმვის 7-ის გარეშე 36) — **ვერ** |
| l58-check 15/15 | 13/14 (471 INCOMPLETE) — **ვერ** |
| lessons ≤ 60 ხაზი და ≤ 57,500 B; L23, L58 < 5100 B | დაგეგმვამდე: 60 ხაზი, 59,870 B; L23 4,622, L58 5,400 — **ვერ** (ბაიტები და L58). ამ RETRO-ს შემდეგ 57,487 B, L58 4,941 — ესეც RETRO 495-ის ახალ ზღვარს (4,800 B) აჭარბებს (§10) |
| თითო sketch-ზე ≤ 1 სრული + 1 delta `tech-lead` review | **არ გაზომილა.** `data/process-counters.txt` ითვლის მხოლოდ ხაზებს, სადაც `sketch-review.md` `tech-lead`-ს ახსენებს (0–1), და არა review-ების რაოდენობას |
| ახალი ერთჯერადი .py თითო b-round-N-ში ≤ 2 | 0 ყველა b-round-465…478-ში (`update-*.py` გარეშე; `data/process-counters.txt`) — შესრულდა |

**RETRO 495-ის counter-ები:** (`tech-lead`): C FAIL + BLOCKED ≤ 2 15-დან; STOP-იანი რაუნდი ≤ 2 და 0 STOP B-ის გადაწყვეტილების გარეშე დარჩენილ sketch-ის Medium-ზე; l58-check 15/15 და l57-check ≥ 14/15; `lessons.md` ≤ 57,500 B და არცერთი ხაზი 4,800 B-ზე მეტი; fix-up ჯაჭვის სიგრძე ≤ 1; ახალი deferred Low ≤ 35 და ≥ 10 დახურული.

## 10. ცვლილებები: lessons (`b-round-479/lessons-diff.txt`)
diff hunks: `3c3 15,16c15,16 18c18 24c24 28c28 40,41c40,41 58c58`. 60 ხაზი; 59,870 → **57,487** ბაიტი. lesson id-ები უცვლელია. finding id არცერთი არ დაკარგულა; l.3-ის pointer-იდან გაქრა მხოლოდ D-29z1639 (RETRO 465-ის შენიშვნა, რომლის ტექსტი `b-round-479/lessons-before-480.md` l.3-შია) (`b-round-479/lesson-finding-ids.txt`). ოთხი სკრიპტი: `edit-lessons.py` (37 ამოჭრა, `edit-lessons.log`), `edit-lessons-2.py` (18, `edit-lessons-2.log`), `edit-lessons-3.py` და `edit-lessons-4.py` (l.3 და L47-ის clause).
- **ამოჭრა მხოლოდ evidence-ისა და განმარტებისაა:** L23 (l.16) 4,622 → 3,894; L58 (l.41) 5,400 → 4,941; L37 (l.24) 3,163 → 2,528; L57 (l.58) 2,444 → 2,051 — `tech-lead`-ის tier 1 და tier 2-ის ნაწილი. L29 (l.18) 3,289 → 3,027 და L56 (l.40) 2,542 → 2,207 — B-ის: ახსნა-განმარტება და „Why rewritten“ წინადადება წაიშალა, id-ები დარჩა. `tech-lead`-ის გაფრთხილებით l.41-ის `counts.get` grep-ის ნიმუში დარჩა.
- **L47 (l.28), ახალი clause** (`tech-lead`-ის ტექსტი, advisor-ის შენიშვნით B-მ დაამატა „once an announcer exists“, `edit-lessons-4.py`): „ **Reload → client nav (RETRO 480):** the task carries a first-Tab row (L47 target) and, once an announcer exists, an announcement row (live text = new document.title). Evidence: RC-R479-CLIENT-NAV-FOCUS, GATE479-M1-ROUTE-ANNOUNCE (1×).“
- **L10 (l.15), ახალი clause:** „ **One STOP threshold (RETRO 480):** a task states its STOP threshold in one clause (Medium+ or outside the grants); others cite it, never restate it. Evidence: C-R475-01 (1×).“
- **l.3:** pointer, RETRO 480-ის შენიშვნა.
- Saba-ს ფერის მიგრაციის წესები ახალ clause-ს არ საჭიროებს: l.7 უკვე შეიცავს (`tech-lead`).

## 11. სისტემური ამოცანა
**CLIENT-NAV-CONTRACT** (`tech-lead`-ის წინადადება; `backlog.json` → `systemic_tasks`; round 482):
- Store-ის client ნავიგაციის ერთი კონტრაქტი: `RouteAnnouncer` Store-ის layout-ში (title, fallback `main h1`; Studio-ში არა), `releaseLinkFocus`-ში `try/finally`, `target="_blank"`/`reloadDocument`-ის გამოტოვება და `defaultPrevented`-ის runtime ტესტი, doc-ში ნელი loader-ის შემთხვევა.
- **ხურავს:** GATE479-M1-ROUTE-ANNOUNCE, GATE479-L2-TABINDEX-FINALLY, A-R479-L1-TARGET-BLANK, A-R479-L3-DEFAULTPREVENTED-UNTESTED, A-R479-L2-SLOW-LOADER-FOCUS, RC-R479-CLIENT-NAV-FOCUS. B-R479-LEADMAGNET-TIMER-CLIENT-NAV-ს მხოლოდ მაშინ ხურავს, თუ Saba Q2-ზე ქცევის შეცვლას აირჩევს. default-ის შემთხვევაში ის „keep“ გადაწყვეტილებით იხურება, კოდის ცვლილების გარეშე.
- **წინაპირობა (`tech-lead`):** B round 482-ის დაგეგმვისას sketch-ზე ბრაუზერით ამოწმებს title-ის დროს, fallback-ს meta-ს გარეშე route-ებზე და Studio → Store-ის remount-ს (L58). ჩავარდნის შემთხვევაში ROOT-REQ-ROUTE-ANNOUNCER.
- **SYS-R465-DEAD-CSS-MATCHER:** trigger „round 480“ დადგა, root-ს ARCH-CHECKPOINT-STYLE-SCAN-ზე არ უპასუხია. ამიტომ იგეგმება root-ის გარეშე, DPG P1-ის შემდეგ.
- **არქიტექტურა:** ახალი frontend-architect checkpoint-ს არ ვითხოვ. client ნავიგაციის owner ერთია (layout + `link-focus.ts`), ხოლო InternalLink wrapper-ი (SIG-R479-INTERNAL-LINK-WRAPPER) announcer-ის შემდეგ რჩება სიგნალად.

## 12. Saba-სთვის და root-ისთვის (წინადადებები და კითხვები; loop-ში არ სრულდება)
- `user-review/questions-retro-480.md` Q1–Q7, თითოეულს default აქვს: სქროლი შენს მოწყობილობაზე, LeadMagnet-ის ტაიმერი, Firefox, Safari და e-mail, PERF-ის გაჩერებული ნაწილები, IME და წინადადებები.
- **Root:** ROOT-REQ-DPG-PRIMITIVES-PATCH (DESIGN_TOKENS.md და TAILWIND_FIRST.md ისევ teal-ს ასწავლის); ROOT-REQ-PLAYWRIGHT-FIREFOX (ახლა ერთ task-ს ბლოკავს); DP-gate-ის ხელახალი შეფასება DPG P0-ის შემდეგ (474–478 და 479 ელოდება); GATE462-M1-EMAIL-SERVER-POLICY ისევ ღიაა.
- **micro-fix-ის წინადადება (RETRO480-PINNED-SKETCH-MICRO-FIX), მეორედ, წინადადებად:** ამ ფანჯარაში reviewer-ის Medium-მა byte-pinned sketch-ზე 3 რაუნდი გააჩერა (466, 471, 476). `tech-lead`-ის აზრით, მთავარი გამოსავალი B-ის sketch-ის შემოწმებაა (l58-check-ის შესრულება) და არა A-სთვის ნებართვის მიცემა. loop წესს თავად არ ცვლის.
- **Root:** CSS-ის AST reader-ი (`postcss` პირდაპირ dependency-ად) regex scanner-ების Low-ების კლასს დახურავდა (`tech-lead` §5). ეს `package.json`-ის ცვლილებაა, ამიტომ მხოლოდ root-ის/Saba-ს თანხმობით. C-R474-02 და B-R465-TEST-FIXTURE-CSS-LEAK root-ის ცვლილებას საჭიროებს.
- **DP-gate-ის ანგარიში:** root-ის მომდევნო ანგარიშმა commit-ის hash უნდა დაასახელოს (RC-R473-POLICY-COUNT-STALE).
- **`.claude/`-ის ან primitives-ის ცვლილება:** ROOT-REQ-DPG-PRIMITIVES-PATCH-ის გარდა ახალი არ არის.

## 13. შემდეგი
1. **Round 480:** ეს RETRO. C ამოწმებს traceability-ს, auth guard-ს, Studio smoke-ს და ეკრანს.
2. **Round 481:** REGRESSION-2026-11-13.
3. შემდეგ: GATE479-M1-ROUTE-ANNOUNCE და B-R478-DEAD-MUSIC-LINK (D-29z1704), DPG-BUTTON-CLEANUP და DPG P1-ის დანარჩენი, SYS-R465-DEAD-CSS-MATCHER, DP-gate-ის შედეგები, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2 skip-წესით.
4. **შემდეგი RETRO:** round 495 ან შემდეგი queue entry-ის დასასრული, რომელიც უფრო ადრე მოვა.
