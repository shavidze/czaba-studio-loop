# RETRO 450 — მეთვრამეტე რეტროსპექტივა (რაუნდები 435–449)

**ავტორი:** B, round 449 → 450 დაგეგმვისას, 2026-11-11. **D-ID:** D-29z1597…D-29z1601. **master:** `a8599a2` (gate 449 published).
**კონსულტაციები:**
- `tech-lead` — რეალურად გამოვიძახე; პასუხი: `b-round-449/consult-tech-lead.md`.
- `product-designer` — ეკრანი და გზა; `b-round-449/consult-product-designer.md`.
- advisor — დაგეგმვის მიდგომა (orientation-ის შემდეგ).
- `qa-engineer`, `consequence-tester`, `design-philosopher` და `first-visit-host` B-ის consult სიაში არ არიან (2026-11-04 §6) და არ გამომიძახებია.

**რატომ ახლა:** RETRO ყოველ 15 რაუნდში ტარდება (Saba, 2026-10-26). `retro_policy.next_due` = „round 450 (window 435–449)“ (D-29z1543). წინა ანგარიშში (`b-next.json`) ფანჯარა „436–449“ ეწერა; სწორია 435–449. ერთხელ აღვნიშნავ და ვასწორებ.

**მონაცემები:**
- სკრიპტები: `b-round-449/*.py` და `misc-outputs.sh` — retro 435-ის სკრიპტების ასლები, შეცვლილია ფანჯარა და გზები. `stage-sums.py` თავიდან დაიწერა 435–449-ის ეტაპებზე.
- input: `b-round-449/backlog-retro-input.json` = `backlog.json` v438, round 449-ის მიღების შემდეგ (D-29z1597). archive-ის ასლი: `b-round-449/archive-findings-snapshot.json`.
- შედეგები: `b-round-449/data/`.

## 1. მოკლედ
- **15 რაუნდი:** 14 C PASS, 1 FAIL (438). `browserVerified` 15/15 (`data/collect.txt`).
- **ხარჯი $264.79:** B $198.56, A $55.61, C $10.62 (`data/cost.txt`).
- **ბაგები და STOP:**
  - C-მ იპოვა 5 ბაგი: 2 Medium (C-R438-01, C-R442-M1) და 3 Low (C-R437-01, C-R439-01, C-R446-01) (`data/fails-detail.txt`).
  - A STOP: 2 (439, 442) (`data/stops-count.txt`).
  - Gate review: 13, ყველა `COMMIT: OK`; Critical/High 0; 54 პუნქტი (low 21, info 14, severity-ს გარეშე 19) (`data/gate-reviews.txt`).
- **დასრულდა:** COPY-PD-VIS (436–437), SYS-R435-SOURCE-SCAN-HELPER (438–439), SYS-1 (440–441), SYS-3 (442–445), STORE-2b-1, 2b-2a, 2b-2b, 2b-3a (446–449).
- **Saba-ს ახალი საკითხი ფანჯარაში:** 0.
- **ეკრანი:** მუდმივი ტექსტის ხაზები 435-ის ტოლია (138/168/118/144). Store-ის გვერდებზე teal და gradient ტექსტი აღარ ჩანს (`user-review/screen-review-450.md`).

## 2. ციფრები (`data/cost-rows.json`, `data/cost.txt`, `gates/gate-round-N.json`)
| რაუნდი | შინაარსი | B | A | C | ჯამი | C | gate |
|---|---|---|---|---|---|---|---|
| 435 | RETRO 435 | 13.11 | 0.51 | 1.06 | 14.68 | PASS | skipped (source არ შეცვლილა) |
| 436 | COPY-PD-VIS ეტაპი 1 | 9.00 | 2.88 | 0.57 | 12.45 | PASS | `69de9bd` |
| 437 | COPY-PD-VIS ეტაპი 2 | 16.72 | 5.50 | 0.80 | 23.02 | PASS | `142918b` |
| 438 | SYS-R435-SOURCE-SCAN-HELPER | 19.78 | 5.47 | 0.55 | 25.80 | **FAIL** | skipped |
| 439 | SYS-R435 re-do (v4.1) | 12.60 | 4.65 | 0.62 | 17.87 | PASS | `efd71f6` |
| 440 | SYS-1 ეტაპი 1 | 11.99 | 3.16 | 0.59 | 15.74 | PASS | `047a0fc` |
| 441 | SYS-1 ეტაპი 2 | 14.20 | 3.77 | 0.57 | 18.54 | PASS | `5d81795` |
| 442 | SYS-3 ეტაპი 1 | 12.33 | 3.78 | 0.55 | 16.66 | PASS | `4aa3c82` |
| 443 | SYS-3 fix-up | 8.14 | 2.55 | 0.58 | 11.27 | PASS | `1eefb4c` |
| 444 | SYS-3 ეტაპი 2a | 11.84 | 3.50 | 0.60 | 15.94 | PASS | `616729c` |
| 445 | SYS-3 ეტაპი 2b | 13.92 | 3.49 | 0.76 | 18.17 | PASS | `4bfebd7` |
| 446 | STORE-2b-1 | 14.07 | 3.79 | 0.94 | 18.80 | PASS | `5df7717` |
| 447 | STORE-2b-2a | 8.30 | 5.64 | 1.01 | 14.95 | PASS | `cce5eda` |
| 448 | STORE-2b-2b | 15.36 | 3.58 | 0.82 | 19.76 | PASS | `48e16b8` |
| 449 | STORE-2b-3a | 17.20 | 3.34 | 0.60 | 21.14 | PASS | `a8599a2` |

- B-ის სვეტი round N-ის დაგეგმვაა (`b-round-(N-1)-result*.json`).
- **მედიანები:** რაუნდი $17.87, B $13.11; B min/max 8.14/19.78. **A-ს საშუალო:** FAIL-ზე 5.47, PASS-ზე 3.58 (`data/cost.txt`).
- **retro 435-ის ფანჯარა (420–434):** ჯამი $255.35, რაუნდი $15.62, B $11.63, A PASS $4.37 (`b-round-434/data/cost.txt`).
- **ეტაპების მიხედვით** (`data/stage-sums.txt`): STORE-2b (446–449) $74.65; SYS-3 (442–445) $62.04; SYS-R435 (438–439) $43.67; COPY-PD-VIS $35.47; SYS-1 $34.28; RETRO 435 $14.68.
- **B-ის წილი:** 75.0 % (435-ზე 70.5 %). ყველაზე ძვირი B-დაგეგმვები: 438 ($19.78), 449 ($17.20), 437 ($16.72), 448 ($15.36). **ჰიპოთეზა (არ გაზომილა):** ზრდა sketch/probe/mutant-ის მომზადებიდან მოდის; ხარჯი ფაზის შიგნით ნაბიჯებად არ იწერება, ამიტომ ეს არ დადასტურებულა.

## 3. FAIL-ები და gate block-ები
- **438 FAIL — C-R438-01 (Medium, origin B spec).** SYS-R435-ის helper-ზე გადატანისას NF2-ის wrapper-tag-ის შემოწმება შევიწროვდა: HEAD-ზე mutant წითელია, sketch-ზე მწვანე (false pass). B-ის mutant matrix ამოწმებდა მხოლოდ იმ ადგილებს, სადაც HEAD ცდებოდა, და არა იმას, რასაც HEAD იჭერდა და port-მა დაკარგა (`c-round-438.json`; retro candidate B-R438-REVERSE-DIRECTION-MATRIX). 439-ში გასწორდა; ფასი $25.80 + re-do $17.87.
- **439:** NF2-ის გასწორებისას იგივე კითხვა sibling suite-ებზე (RD2/SF2) არ დაისვა; A-ს reviewer-მა Medium-ად აღნიშნა, B-მ Low-ად შეაფასა (HEAD-ის ტოლი) — C-R439-01 / A-R439-REVIEW-M1 (B-R439-SIBLING-SUITE-GAP).
- **442:** A-მ STOP დაწერა (unruled Medium, held key IME-ის შემდეგ), მაგრამ C-მ ყველა row გაუშვა, PASS დაწერა და gate-მა გამოაქვეყნა `4aa3c82` B-ის ruling-მდე. საბოლოო მდგომარეობა HEAD-ის ტოლი იყო, დანაკარგი არ ყოფილა; 443-მა გაასწორა (RETRO450-Q-STOP-THEN-PUBLISH). **იგივე ფორმა 439-შიც იყო:** A-მ STOP დაწერა reviewer-ის Medium-ზე (A-R439-REVIEW-M1), C-მ PASS დაწერა (თავად Low-ად შეაფასა, C-R439-01), gate-მა `efd71f6` B-ის ruling-მდე გამოაქვეყნა (`a-round-439.md` l.3, `c-round-439.json`). ე.ი. 2×.
- **Gate block:** 0. ყველა 13 published review `COMMIT: OK`.

## 4. Findings (`data/fails-detail.txt`, `data/classify.txt`, `data/gate-reviews.txt`, `data/l57-check-window.txt`)
- **C bugs 5:** C-R437-01 (Low; C-ის დასკვნით pre-existing, HEAD-ზე არ გაშვებულა: Play decode-ის დროს), C-R438-01 (Medium, B spec), C-R439-01 (Low), C-R442-M1 (Medium; `origin` ველი აკლია), C-R446-01 (Low, LeadMagnet-ის ძველი error).
- **deferred Lows ფანჯარაში: 45** (A 25, gate 18, B 1, C 1); regex კატეგორიები: tests/harness 13, focus 9, timing/audio 6, keyboard 5, უკატეგორიო 6, copy 3, layout 2, docs 1. archive-ში ფანჯრიდან 11 (3 Medium დაიხურა: C-R438-01, C-R442-M1, B-R447-HIREUS-EMAIL-LIGHT-CLIENT).
- **ღია Medium ფანჯრიდან:** 1 — A-R449-REVIEW-GT1-TSX (scheduled, 2b-3b row GT1b; B-ის grep: ერთადერთი TSX hit მკვდარ CinemaCurtainLoader-შია, ცოცხალი რეგრესია არ არის).
- **ხელით დაჯგუფება root cause-ის მიხედვით** (regex-კატეგორია უხეშია, ამიტომ B-მ id-ები თავად დააჯგუფა; სია `b-round-449/consult-inputs.md`):
  1. **Store-ის style scan ტესტები** (store-teal-sweep, store-gradient-text — ცალ-ცალკე ხელით დაწერილი regex/CSS parser): A-R447-REVIEW-L1/L2/L3, A-R449-REVIEW-L-FILL-REGEX, A-R449-REVIEW-L-TEST-HYGIENE, TL-R449-L3/L4/D1/D2 + Medium A-R449-REVIEW-GT1-TSX = **10**.
  2. **source-scan helper-ის ნარჩენი** (SYS-R435): A-R438-REVIEW-L2/L3, A-R439-REVIEW-M1/L2/L3/L4/L5, GATE439-L1/L2/L4/L5 = **11**.
  3. **IME / held key (SYS-3-ის ნარჩენი):** A-R442/443/445-ის Lows, GATE442/443/445, GATE444-L1-MACOS-OPTION, A-R444-REVIEW-L1-ALTGRAPH-META; პლატფორმის ნაწილი = TLM-SYS3-IME-PLATFORMS.
  4. **LeadMagnet-ის სასიცოცხლო ციკლი** (STORE-2b-1): C-R446-01, A-R446-REVIEW-L1, GATE446-L1/L2.
  5. **Studio-ს ვიზუალური წვრილმანი (437):** B-R437-BUTTON-CURSOR-UNLAYERED, GATE437-S1/S4/S5, A-R437-REVIEW-CR3/CR6, C-R437-01.
- **origin:** ფანჯრის Lows-ის უმეტესობა A-ს reviewer-მა და gate-მა იპოვა B-ის sketch-ში დაწერილ ტესტებში. ანუ წყარო ძირითადად „B spec“-ია (ტესტის დიზაინი), მპოვნელი — A/gate.
- **L57:** `tools/l57-check.py` INCOMPLETE 442, 443, 447-ზე; დანარჩენ 12-ზე OK. **L58:** 14/14 task OK (`data/l58-check-window.txt`).

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **ტესტის port, extraction ან rewrite-ის დროს HEAD-ის pin-ების დაკარგვა (4×):** C-R438-01, A-R439-REVIEW-M1, A-R441-REVIEW-L1-OUTLINE-ORDER, RETRO450-B-SKETCH-NO-GOLDEN. ოთხივეს სათავე B-ის sketch-ია: ახალი ვერსია მხოლოდ იმაზე შემოწმდა, სადაც HEAD ცდებოდა, და არა იმაზე, რასაც HEAD უკვე ამოწმებდა. **უკეთესი spec აიცილებდა:** HEAD-ის ყოველი pin-ის სია და mutant-ები ორივე მიმართულებით. → L4-ის ახალი clause (§10).
- **Store-ის style scan ტესტები (10 id, §4 კლასტერი 1):** ორ ფაილს, store-teal-sweep-სა და store-gradient-text-ს, ცალ-ცალკე ხელით დაწერილი parser აქვს. ყოველი ახალი STORE ეტაპი ორივეს აფართოებს და reviewer-ი ყოველ ჯერზე ახალ ნაკლს პოულობს. **shared helper აიცილებდა** → სისტემური ამოცანა (§11).
- **439-ისა და 442-ის STOP → PASS → publish (2×):** L22-ს ეს შემთხვევა არ ეწერა (unruled Medium-იანი STOP, როცა ყველა row გადის). → L22-ის clause (§10).
- **447-ის shell-edit-ები:** A-ს self-check-ს აკლდა წესი, რომელიც shell-ის string replace-სა და `git stash`-ს store-ში კრძალავს. → L60-ის clause (§10) და Saba-სთვის Q5.
- **449-ის პირველი inventory grep:** L1 ამას უკვე ფარავს („scanner-ი შეამოწმე ერთ ცნობილ შემთხვევაზე“), მაგრამ B-მ inventory-ის grep scanner-ად არ ჩათვალა. advisor-მა claim-მდე დაიჭირა. → L1-ს evidence id ემატება.
- **L57-ის INCOMPLETE (442, 443, 447):** შემოწმება არსებობს (`tools/l57-check.py`), მაგრამ C-მ სამ რაუნდში არ გაუშვა ან შედეგი არ გაასწორა. ახალი lesson ამას არ შველის, საჭიროა შემოწმება gate-ში → root-ის მოთხოვნა ROOT-REQ-GATE-L57-UNRULED-MEDIUM (§12).

## 6. Saba-ს ნაპოვნი საკითხები და ეკრანი
- **ფანჯარაში Saba-ს ახალი საკითხი: 0.** წინა ფანჯრის ორი (SABA-B-12, SABA-LANE-RESIZE-HANDLE) L61-ით არის დაფარული; SABA-LANE-RESIZE-HANDLE 437-ში დაიხურა. იგივე სახის საკითხი არ განმეორებულა.
- **ეკრანი და გზა:** `user-review/screen-review-450.md`; გადაღება `b-round-449/screens/` (`capture.mjs`, `capture.log`, `screen450.json`, 12 PNG). ხაზები: 1440 ცარიელი 138 / demo 168, 1280 ცარიელი 118 / demo 144; timeline-ისა და library-ის გარეთ 97/124/86/101 — 435-ისა და 420-ის ტოლი.
- **ახალი კანდიდატები** (`product-designer`): SR-450-1 (Clip details-ის ისარი), SR-450-2 (Clip Gain ორჯერ ჩანს), SR-450-3 (Store header-ის Sign In = მეორე მთავარი ღილაკი; ერთი ხაზით Saba-სთვის), SR-450-4 (Premium ბარათი გათიშულს ჰგავს), SR-450-5 (ფასის ორი ფორმატი). ყველა Low-ია, ადგილი არცერთში არ იცვლება. Saba-ს პასუხამდე არაფერი სრულდება.
- **უკეთესი გახდა:** Product page-ზე popup ყიდვას აღარ ფარავს (446); „Clip origin“ ერთი ტერმინია (436); Export dialog-ს ერთი მთავარი ღილაკი აქვს (437).

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
| საკითხი | `tech-lead` | B-ის გადაწყვეტილება და მიზეზი |
|---|---|---|
| მკვდარი Store ფაილების წაშლა | CLAUDE.md-ის მიხედვით Saba-ს ნებართვა სჭირდება | importer-ების შემოწმება: `b-round-449/data/dead-importers.txt` (barrel-ის გარდა 0). Saba-ს 2026-11-10-ის legacy წესი („must be removed incrementally“) B-ს ნებართვად მიაჩნია, იმ ფაილებისთვის, რომლებსაც 0 importer აქვს. TestimonialsSection (keep-list) გამონაკლისია. Saba-ს Q6-ით ეცნობება და შეუძლია 2b-3d-მდე შეაჩეროს |
| SIG-R441-SOURCE-PIN-RULING | Saba-ს ჰკითხეთ L4-თან ერთად | ტექნიკური საკითხია. B-ის default: source contract-ები რჩება ARCH-SPLIT-მდე, შემდეგ L4-ის წესით გადაკეთდება. Saba-ს ინფორმაციისთვის ეგზავნება (Q7) და პასუხი არ სჭირდება |
| A-R449-REVIEW-GT1-TSX-ის ადგილი | SYS-STORE-STYLE-SCAN-ში, 2b-3b-მდე | მიღებულია. D-29z1597-მა ის 2b-3b-ის row GT1b-ად დაგეგმა; ახლა სისტემურ ამოცანაში გადადის (D-29z1601) |
| L5 და L24-ის ამოღება | არასავალდებულო | არ ამოვიღე. ახალი ხაზი არ დაემატა (ყველა clause არსებულ lesson-ს მიუერთდა), 60 ხაზი შენარჩუნდა |

## 8. ღია კანდიდატებისა და ვადების ბედი (L46; `data/retro450-deadlines.txt`)
| id | ვადა | რა მოხდა (D-29z1599) |
|---|---|---|
| TLM-PERF15-FIREFOX | RETRO 450 | Saba-ს მეოთხედ ეკითხება (Q1). task-ად უკვე გახსნილია (435-ზე), ბლოკავს ROOT-REQ-PLAYWRIGHT-FIREFOX; runner-ზე ისევ მხოლოდ Chromium-ია. ახალი ვადა RETRO 465 |
| TLM-SABA-B-12-FIREFOX-SAFARI | RETRO 450 | მეორე RETRO პასუხის გარეშე. L46-ის მიხედვით Firefox-ის ნაწილი task-ად იხსნება, ბლოკირებული იმავე root მოთხოვნაზე (Q1). Safari-ის ნაწილი რჩება Tech Lead-ის სიაში (Q2). ვადა RETRO 465 |
| TLM-SYS3-IME-PLATFORMS + TL-R444-L1 | RETRO 450 (პირველი) | პირველად ეკითხება Saba-ს (Q3); ვადა RETRO 465 |
| STUDIO-PERFORMANCE-ის გაჩერებული ნაწილები | RETRO 450 | მეორედ ეკითხება (Q4). Saba-ს დიზაინის არჩევანს ელოდება და არა ხელით შემოწმებას, ამიტომ task-ად არ იხსნება. ვადა RETRO 465 |
| SIG-R441-SOURCE-PIN-RULING | RETRO 450 | B-ის default + Q7 (ინფორმაცია) |
| RC-R305-LESSON-CHAR-CAP | watch | L23 5058, L58 4988 byte (უცვლელი). RETRO 465-ის counter-ად გადადის |
| INFO-C447-L57-ABSENT | RETRO 450 | დაითვალა: 3/15 (442, 443, 447). lesson არ ემატება; root-ის მოთხოვნა (§12) |
| A-R441-REVIEW-L1-OUTLINE-ORDER (`retro_input`) | RETRO 450 | L4-ის „Port preserves HEAD“ clause-ის evidence. Low რჩება `deferred_low_polish`-ში |
| retro_candidates (7) | RETRO 450 | §5 / §10: 1–4 → L4, 5 → L1 evidence, 6 → L22, 7 → L60 + Q5; ყველა `ruled (D-29z1600)` |

## 9. countermetric-ები: retro 435-ის მიზნები → შედეგი
| მიზანი (retro 435, `tech-lead`) | შედეგი | წყარო |
|---|---|---|
| l58-check rc 0 sketch-ების 100 %-ზე | **შესრულდა** (14/14) | `data/l58-check-window.txt` |
| l57-check rc 0 origin enum-ით | **არ შესრულდა** (3/15 INCOMPLETE: 442, 443, 447; C-R442-M1 origin-ის გარეშე) | `data/l57-check-window.txt`, `data/l57-coverage.txt` |
| fiber-structure რაუნდს test:perf log აქვს | **არ ეხება** (ARCH-SPLIT ფანჯარაში არ ყოფილა) | `data/task-titles.txt` |
| C FAIL ≤ 1 | **შესრულდა** (1: 438) | `data/cost.txt` |
| fix-up chain < 15 % | **შესრულდა** (2/15 = 13.3 %: 439, 443) | `data/task-titles.txt` |
| რაუნდის მედიანა ≤ $17.00 | **არ შესრულდა** ($17.87) | `data/cost.txt` |
| B-ის მედიანა ≤ $14.50 | **შესრულდა** ($13.11) | `data/cost.txt` |
| L23 და L58 < 5100 byte, lessons ≤ 60 ხაზი | **შესრულდა** (L23 5058, L58 4988; 60 ხაზი) | `data/lesson-bytes.txt` |

## 10. ცვლილებები: lessons (`b-round-449/lessons-diff.txt`)
`lessons.md` 60 ხაზია და იყო. lesson-ის id-ები არ შეცვლილა. diff (`b-round-449/lessons-diff.txt`) ეხება მხოლოდ ხაზებს l.3, l.6, l.9, l.55 და l.60:
- **l.3:** pointer `retro-450.md` (435–449) და წინადადება „RETRO 450 (D-29z1600) …“.
- **l.6 (L1):** ერთი evidence: RETRO450-B-INVENTORY-TOOL-FIRST-PASS.
- **l.9 (L4):** „Port preserves HEAD (RETRO 450)“ (`tech-lead`; 4×).
- **l.55 (L22):** „A STOP naming an unruled Medium+ (RETRO 450)“ (`tech-lead`; C-R442-M1 + A-R439-REVIEW-M1, 2× — 439 advisor-ის მითითებით დაემატა).
- **l.60 (L60):** „Store tree (RETRO 450)“ (`tech-lead`; RETRO450-A-SHELL-EDITS-BYPASS-HOOK).
- ზომები (`data/lesson-bytes-after.txt`): L23 5058, L58 4988, უცვლელი.

## 11. სისტემური ამოცანა
**SYS-R450-STORE-STYLE-SCAN** (test-only, ერთი bounded რაუნდი; `tech-lead`):
- **რა:** ერთი საერთო helper `app/lib/__tests__/helpers/style-scan.ts`: file walk და roots (`app/` + `perf/`), quote-aware CSS rule reader, TSX-ის `className`-ისა და `style={{}}`-ის scanner. ორივე ტესტი, store-teal-sweep და store-gradient-text, მასზე გადადის. hit-ების რაოდენობა HEAD-ის ტოლი რჩება; L4-ის ახალი clause ვრცელდება (HEAD-ის ყოველი pin row-ზე, mutant-ები ორივე მიმართულებით).
- **ხურავს:** A-R449-REVIEW-GT1-TSX (Medium), TL-R449-L3-SCAN-ROOTS, A-R447-REVIEW-L2, A-R447-REVIEW-L3, TL-R449-L4-PARSER-QUOTES, A-R449-REVIEW-L-FILL-REGEX, A-R449-REVIEW-L-TEST-HYGIENE. თითო Low-ს თავისი mutant აქვს.
- **studio.css:** გაყინული legacy CSS (`app/styles/studio.css`, `pages/**`) მხოლოდ იკითხება და არ იცვლება, ამიტომ TL-R449-L3 მთლიანად იხურება.
- **ადგილი:** STORE-2b-3b-მდე. 2b-3b, 3c და 3d სხვაგვარად ორივე ასლს კიდევ სამჯერ გააფართოებდა. `tech-lead`-ის შეფასება: ღირებულება მაღალია, რისკი დაბალი.
- **არ ხურავს** (წაშლით იხურება, 2b-3d-ში LEGACY-DEAD-STORE-COMPONENTS-თან ერთად): A-R447-REVIEW-L1, TL-R449-D1-LOADING-BRAND-CLASS, TL-R449-D2-BARREL-ALIAS.
- **ცალკე რჩება:** arrangement-ის `source-scan.ts` helper-ის ~11 Low (§4 კლასტერი 2). ის სხვა ფაილია, ცალკე owner-ით; ამ რაუნდში არ ერთიანდება.

## 12. Saba-სთვის და root-ისთვის (წინადადებები და კითხვები; loop-ში არ სრულდება)
**Saba-სთვის** (`user-review/questions-retro-450.md`, Q1–Q7, თითოეულს default აქვს):
- Q1 Firefox (root-ის install), Q2 Safari-ის ხელით შემოწმება, Q3 IME, Q4 STUDIO-PERFORMANCE-ის გაჩერებული ნაწილები.
- Q5 **წინადადება** (`.claude/` hook, loop არ ცვლის): ითვლება თუ არა sketch-ის `git apply` hook-ის ეკვივალენტად.
- Q6 **ინფორმაცია:** მკვდარი Store ფაილების წაშლა 2b-3d-ში, Testimonials-ის გარდა.
- Q7 **ინფორმაცია:** Overview-ის source pin-ები.
- ეკრანის კანდიდატები SR-450-1…5 (`screen-review-450.md`). SR-450-3 გლობალური header-ის სახეს ცვლის.
- ღია რჩება: AGREE-STEM-LANES, questions-retro-435 Q4 (From/To), SABA-Q-TESTIMONIALS-UNMOUNTED, SABA-Q-LEADMAGNET-EYEBROW-TONE, SABA-Q-HIREUS-EMAIL-THEME, SABA-Q-CHECKOUT-RIPPLE, SABA-Q-LEADMAGNET-NAV-RULES, SABA-Q-LEADMAGNET-RECORDINGS-SCENES, SABA-PROP-DESIGN-TOKENS-PRIMITIVE-STALE.

**root-ისთვის** (არ ბლოკავს loop-ს):
- ROOT-REQ-PLAYWRIGHT-FIREFOX — ხელახლა (Q1).
- ROOT-REQ-ENV-MOCK-API-HEALTH (ახალი, D-29z1597): `env-status.json`-ში `:5199` mock API-ის შემოწმება; 449-ში A-მაც და C-მაც თავად გაუშვეს.
- ROOT-REQ-GATE-L57-UNRULED-MEDIUM (ახალი, D-29z1600): gate-მა გაუშვას `tools/l57-check.py c-round-N.json` და არ გამოაქვეყნოს რაუნდი, რომლის `c-round-N.json` ღია Medium+ ბაგს შეიცავს ან რომლის `a-round-N.md` STOP-ით იწყება B-ის ruling-ის გარეშე. ეს L22-ის ახალი clause-ის gate-ის ნახევარია.
- `agent-workflow.md`-ის სიგრძის საკითხი (round 447): დისკზე არსებული ფაილი 87 ხაზია და მთავრდება „Loop v2“-ზე; policy-ის snapshot-ში შემდეგი სექციებიცაა. ღია რჩება.

**Architecture note (`tech-lead`):** Store-ის ტესტის ratchet-ები (allow-list-ები ორ ფაილში, დუბლირებული scan-კოდი) → SIG-R450-STORE-TEST-RATCHETS; პასუხი = §11. მცირე სიგნალები (`useLeadMagnet.ts` route-ის ცოდნას იძენს; hairline-handle-ის class ორ ადგილასაა) backlog-ში სიგნალად რჩება. frontend-architect-ის checkpoint არ ვითხოვე: ერთ owner-ზე სტრუქტურული რისკი აპლიკაციის კოდში არ გროვდება, ეს test-only საკითხია და §11 ფარავს.

**RETRO 465-ის counter-ები (`tech-lead`):**
1. რაუნდის მედიანა ≤ $17.00, B-ის მედიანა ≤ $12.50.
2. B-ის წილი ≤ 70 %.
3. `l57-check` rc 0 15/15-ზე, short route-ების ჩათვლით.
4. unruled Medium-იანი A STOP → short FAIL `origin`-ით: 100 %.
5. fix-up chain ≤ 1; ახალი deferred Low ≤ 30 (ფანჯარაში იყო 45).
6. L23 და L58 < 5100 byte; lessons ≤ 60 ხაზი.

ხარჯის ბერკეტი, **ჰიპოთეზა:** ერთი feature-ის მომდევნო ეტაპებზე (2b-3b…3d) B იწყებს წინა ეტაპის claims, pre-check და mutant სკრიპტებიდან. ყოველი row ისევ ახალ sketch-ზე გაეშვება. შედარება: 446–449-ის B-ის საშუალო $13.73 (`data/cost-rows.json`).

## 13. შემდეგი
1. **Round 451:** თუ დაგეგმვა 2026-11-13-ზე ან მის შემდეგ ხდება → **REGRESSION-2026-11-13**, თავისი scope_additions-ით (`regression-last.json` = 2026-11-10). წინააღმდეგ შემთხვევაში → **SYS-R450-STORE-STYLE-SCAN**.
2. შემდეგ: SYS-R450-STORE-STYLE-SCAN (თუ ჯერ არ გაკეთებულა) → STORE-2b-3b (glow ჩრდილები; INFO-C449-C9-HEAD-CONTROL-FLAKE ჯერ ირკვევა) → 2b-3c → 2b-3d (+ მკვდარი ფაილების წაშლა, Q6) → 2b-4 → STORE-2c…5 → ARCH-SPLIT → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule-ით).
3. **STEM-LANES** წინ გადადის, როგორც კი Saba AGREE-STEM-LANES-ს უპასუხებს.
4. **შემდეგი RETRO:** round 465.
