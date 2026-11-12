# RETRO 465 — მეცხრამეტე რეტროსპექტივა (რაუნდები 450–464)

**ავტორი:** B, round 464 → 465 დაგეგმვისას, 2026-11-12. **D-ID:** D-29z1636…D-29z1641 (D-29z1641 = advisor-ის საბოლოო შემოწმების შესწორებები). **master:** `6d321c7` (gate 464 published).
**კონსულტაციები:**
- `tech-lead` — რეალურად გამოვიძახე; პასუხი: `b-round-464/consult-tech-lead.md`.
- `product-designer` — ეკრანი და გზა; `b-round-464/consult-product-designer.md`.
- advisor — დაგეგმვის მიდგომა (orientation-ის შემდეგ).
- `qa-engineer`, `consequence-tester`, `design-philosopher` და `first-visit-host` B-ის consult სიაში არ არიან (2026-11-04 §6) და არ გამომიძახებია.

**რატომ ახლა:** RETRO ყოველ 15 რაუნდში ტარდება (Saba, 2026-10-26). `retro_policy.next_due` = „round 465 (window 450–464)“ (D-29z1601). REGRESSION ჯერ არ არის საჭირო: `regression-last.json` 2026-11-10-ია, დღეს 2026-11-12.

**მონაცემები:**
- სკრიპტები: `b-round-464/*.py` და `misc-outputs.sh` — retro 450-ის სკრიპტების ასლები; შეიცვალა მხოლოდ ფანჯარა (450–464), ფაილის გზები და stage-ების რუკა (`stage-sums.py`).
- ახალი: `stops-head.sh` (STOP-ები A-ს ანგარიშის პირველი სამი ხაზიდან) და `deferred-added.py` (ფანჯრის ახალი deferred Low-ები სამი მეთოდის გაერთიანებით: `added` ველი, პირველი D-ID 1602…1640 და id-ის რაუნდი).
- შესავალი: `b-round-464/backlog-retro-input.json` (v457, round 464-ის მიღების შემდეგ) და `archive-findings-snapshot.json` (`archive/findings-archived.json`-ის ასლი).
- გამოსავალი: `b-round-464/data/`.

## 1. მოკლედ
- **15 რაუნდი:** 11 C PASS, 4 FAIL (451, 456, 457, 459). `browserVerified` 15/15 (`data/collect.txt`).
- **ხარჯი $282.31:** B $202.43, A $70.17, C $9.71 (`data/cost.txt`).
- **ბაგები და STOP:**
  - C-მ 10 ბაგი ჩაწერა: 4 Medium (A-R451-REVIEW-M1-GT5-BARREL-SCOPE, A-R456-REVIEW-M1, A-R457-REVIEW-M1, C-R459-01) და 6 Low (C-R458-L1, C-R458-L2, C-R459-02, C-R459-03, C-R462-01, C-R463-01) (`data/fails-detail.txt`).
  - A STOP: **5** (451, 456, 457, 459, 462) (`data/stops-head.txt`). retro 450-ის regex-მა (`data/stops-count.txt`) მხოლოდ 3 იპოვა; 457 და 459 გამორჩა (`tech-lead`-მა შენიშნა, B-მ ანგარიშების თავებით გადაამოწმა).
  - Gate review: 10 (450, 451, 456, 457 და 459-ზე gate skipped), ყველა `COMMIT: OK`; 51 პუნქტი: low 15, info 7, medium 1 (GATE462-M1), severity-ს გარეშე 28 (`data/gate-reviews.txt`).
- **დასრულდა:** SYS-R450-STORE-STYLE-SCAN (451–452), STORE-2b-3b (453), 2b-3c-1 (454), SABA-B-14 (455), 2b-3c-2a (456–458), SABA-B-13 (459–461), 2b-3d-1…3 (462–464).
- **Saba-ს ახალი საკითხები ფანჯარაში:** 2 — SABA-B-14 (Store player-ის seek thumb, 455) და SABA-B-13 (Store-ის შესვლის ანიმაცია, 459–461). §6.
- **ეკრანი:** მუდმივი ტექსტის ხაზები 450-ის ტოლია (138/168/118/144; `user-review/screen-review-465.md`).

## 2. ციფრები (`data/cost-rows.json`, `data/cost.txt`, `data/stage-sums.txt`, `gates/gate-round-N.json`)
- **მედიანა:** რაუნდი $20.25; B $14.44 (min 1.51, max 21.04).
- **B-ის წილი:** 71.7 % (retro 450: 75.0 %).
- **ყველაზე ძვირი რაუნდები:** 454 $26.27, 453 $23.15, 451 $22.31, 463 $22.06, 456 $21.91.
- **A-ს საშუალო:** FAIL რაუნდში $6.38, PASS-ში $4.06. 4 FAIL რაუნდის ჯამი $72.53.
- **Stage-ების ჯამი:** RETRO 450 $15.71; SYS-R450 (451–452) $35.83; 2b-3b $23.15; 2b-3c-1 $26.27; SABA-B-14 $16.23; 2b-3c-2a (456–458) $60.82; SABA-B-13 (459–461) $43.35; 2b-3d (462–464) $60.95.
- **შეზღუდვა:** round 459-ის B ხარჯი ($1.51) ქვედა ზღვარია. `b-round-458-result.json.attempt1.json` 0 ბაიტია, ანუ შეწყვეტილი პირველი მცდელობის ხარჯი ჩაწერილი არ არის. `cost.py` attempt ფაილებს ითვლის, მაგრამ ცარიელს ვერ კითხულობს.
- **retro 450-ის ჰიპოთეზა** („მომდევნო stage-ები წინა stage-ის სკრიპტებს იყენებს და B იაფდება“) არ დადასტურდა: 2b-3b…3d-ის B საშუალო $15.08 (453, 454, 456–458, 462–464), საბაზისო $13.73.

## 3. FAIL-ები და STOP-ები (წყარო თითოეულზე)
| რაუნდი | რა მოხდა | წყარო | წესი, რომელიც აიცილებდა (`tech-lead`-ის აზრი) |
|---|---|---|---|
| 451 FAIL + STOP | sketch-მა საერთო `BARREL_FILES` 3-დან 5-მდე გააფართოვა, ამიტომ GT5-მა HEAD-ის 2 ფაილი აღარ შეამოწმა | `a-round-451.md`, `c-round-451.json`, `b-round-451/scope-sweep.md` | L52-ის ახალი clause (exclusion list-ის sweep + HEAD-pin mutant) |
| 456 FAIL + STOP | `IMPORT_STATEMENT` brace list-ს კომენტარით აგდებდა, walker-ის „unmounted“ ვერდიქტი კი გადამწყვეტი იყო (origin B spec) | `a-round-456.md`, `c-round-456.json` | L52 (დამოუკიდებელი, სინტაქსზე დაფუძნებული წესი) |
| 457 FAIL + STOP | `resolveSpecifier` `./u/`-ს მეზობელ `u.ts`-ზე აგზავნიდა, tsc კი `u/index.ts`-ზე | `a-round-457.md`, `c-round-457.json`, `b-round-457.md` | L52 (ყველა რეალური resolver-თან შედარება) |
| 459 FAIL + STOP | `hydrateRoot(document)` mismatch-ის შემდეგ მთელ დოკუმენტს თავიდან ხატავს და boot script-ის შეცვლილ `<style>`-ს ცვლის | `a-round-459.md`, `c-round-459.json`, `tasks/round-460.md` „Why we missed it“ | L18-ის ახალი წინადადება |
| 462 STOP (PASS) | B-ის pre-check-ის doc 301 placeholder იყო, ხაზი 4-ის გარეშე, ამიტომ K23-ის მოსალოდნელი მნიშვნელობა არასწორი იყო; C-R462-01-ს იგივე ფესვი აქვს | `a-round-462.md`, `c-round-462.json` | L56-ის ახალი clause |

ხუთი STOP-დან ოთხი იგივე მოვლენაა, რაც ოთხი C FAIL. ოთხივე FAIL-ის Medium-ის origin არის `B spec` (`data/manifest-fields.txt`: A-R451-REVIEW-M1-GT5-BARREL-SCOPE, A-R456-REVIEW-M1, A-R457-REVIEW-M1, C-R459-01). `tech-lead`-ის დაკვირვებით, ფიქსი ყოველთვის hash-ით დაფიქსირებულ sketch-ში იყო (§12 Q7).

## 4. Findings (`data/fails-detail.txt`, `data/classify.txt`, `data/deferred-added.txt`, `data/gate-reviews.txt`, `data/l57-coverage.txt`)
- **C-ის 10 ბაგი:** ყველას აქვს `origin` (10/10; `data/l57-coverage.txt`).
- **ახალი deferred Low-ები:** **78** ჩანაწერი (`data/deferred-added.txt`, სამი მეთოდის გაერთიანება): A 34, `tech-lead` review 23, gate 12, სხვა 5, B 3, C 1; აქედან 10 უკვე დაიხურა. მხოლოდ `added` ველით 52 გამოდის, რადგან ბევრ ჩანაწერს `added` არ აქვს (advisor-მა შენიშნა). id-ის რაუნდით, მხოლოდ A-R/C-R/GATE/B-R პრეფიქსით (`classify.txt`, retro 450-ის მეთოდი) — 49. counter-ისთვის ვიყენებ 78-ს. ეს RETRO480-COLLECTOR-UNDERCOUNT-ის მეორე შემთხვევაა.
- **კატეგორიები (`classify.txt`, regex):** tests/harness 13, uncategorised 14, focus 8, docs/process 4, timing/audio 4, layout/visual 2, copy 2, keyboard 2.
- **Archive (ფანჯარა):** 18; Medium 6, ყველა დახურულია (`data/archived-mediums.txt`).
- **ღია Medium+:** 11 ჩანაწერი (`data/open-medium-plus.txt`); loop-ში გასაკეთებელი არცერთი. ყველა manual, root, Saba ან დაგეგმილია (2026-10-23 clarification).
- **Checker-ები:** L57 OK 15/15 (`data/l57-check-window.txt`); L58 OK 13/14, task 458 INCOMPLETE (`data/l58-check-window.txt`).
- **კლასტერები (B, id-ებით):**
  - dead-CSS/keyframes matcher: TL-R464-L1, TL-R464-L2, A-R464-REVIEW-L3…L6, A-R463-REVIEW-L1, A-R463-REVIEW-L6, SIG-R463-USED-DEFINED-TWICE, SIG-R464-THIRD-COMMENT-STRIPPER — 10;
  - style-scan walker: TL-R455-WALKER-LIMITS, TL-R458-L1…L4, C-R458-L1, C-R458-L2 — 7. **გადაწყვეტილება:** SYS-R465-ში არ შედის (`tech-lead` §4). ისინი TL-R455-WALKER-LIMITS-ის stop-loss ruling-ის ქვეშ რჩება (D-29z1621 / D-29z1623) და ARCH-CHECKPOINT-STYLE-SCAN-ის walker-ის ნაწილს ელოდება.

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
ქვემოთ „რა აიცილებდა“ `tech-lead`-ის აზრია (`consult-tech-lead.md` §1–§2); ფაქტები §3-ის წყაროებშია.
- **ერთი ფესვი, ოთხი შემთხვევა:** guard-ს არ შეეძლო დაეწუნებინა ის, რასაც ამოწმებდა (`tech-lead`). ესენია exclusion list „უფრო ძლიერად“ ჩათვლილი (451), regex walker-ის ორი ფორმა (456, 457) და generator-ი guard-თან ერთი წესით (463). ოთხივე B spec-ის დონეზე იჭერდა: მცირე mutant, რომელზეც guard და subject ერთმანეთს არ ეთანხმება.
- **Pre-check ≠ მიწოდებული ხე** (462 ორჯერ): B-ის scratch-ში doc A-ს დაწერილი სახით არ იყო. Tailwind v4 `docs/*.md`-საც კითხულობს, ამიტომ CSS build-იც განსხვავდებოდა.
- **Pre-hydration handshake** (459): browser row inject-ილი node-ით (React #418) ამას დაიჭერდა.
- **Shared helper:** ორი „used“ განსაზღვრება და სამი comment stripper (SIG-R463-USED-DEFINED-TWICE, SIG-R464-THIRD-COMMENT-STRIPPER) — §11.

## 6. Saba-ს ნაპოვნი საკითხები და ეკრანი
| საკითხი | `Why we missed it` | lesson | იგივე სახე დაბრუნდა? |
|---|---|---|---|
| SABA-B-14 seek thumb (455) | `tasks/round-455.md` §„Why we missed it“ | L61 „painted range fill“ clause (lessons l.14) | არა, ფანჯარაში არა |
| SABA-B-13 შესვლის ანიმაცია (459–461) | `tasks/round-459.md` §„Why we missed it“ | L18 „First painted frame“ (l.53) + RETRO 465-ის pre-hydration წინადადება | ერთი fix-up (C-R459-01 → 460), შემდეგ ტესტების გამაგრება (461); ახალი Saba-საკითხი არ ყოფილა |

ორივეს lesson ჰქონდა. ეკრანი 450-ის ტოლია (`screen-review-465.md`). `product-designer`-მა 3 ახალი Low კანდიდატი იპოვა (SR-465-1…3); Medium არ არის.

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
- **სისტემური ამოცანა ახლავე თუ მოგვიანებით:** retro-ს წესი ამბობს, რომ საერთო ფესვის მქონე Low-ებს ერთი task ხურავს. `tech-lead` გვირჩევს ახლა **არ** გავუშვათ: Low-ები app/-ში დღეს 0 შემთხვევაა, ხოლო root-ის ARCH-CHECKPOINT-STYLE-SCAN-ის პასუხამდე გაერთიანება ორ port-ს ნიშნავს. walker-ის precedent: 3 რაუნდი, $60.82, 2 FAIL. B-მ ეს მიიღო, ოღონდ ვადით: SYS-R465-DEAD-CSS-MATCHER იწყება root-ის პასუხზე, მომდევნო dead-CSS წაშლის stage-ზე ან round 480-ზე, რომელიც უფრო ადრე მოვა. ეს „ჩუმი გადადება“ არ არის: ვადა backlog-შია.
- **WALKER-STOP-LOSS:** stop-loss-ის ნაწილი lesson-ად არ იწერება (უკვე D-29z1621/D-29z1623 ruling-ია, 1×); resolver-ის ნაწილი L52-ში შევიდა.

## 8. ღია კანდიდატებისა და ვადების ბედი (L46; `data/retro465-deadlines.txt`)
| id | ბედი |
|---|---|
| RETRO465-B-EXCLUSION-LIST-AS-STRONGER | ruled → L52 clause |
| RETRO465-B-GENERATOR-TEST-SHARED-RULE | ruled → L52 clause |
| RETRO465-B-WALKER-STOP-LOSS | ruled → resolver ნაწილი L52-ში; stop-loss უარყოფილი |
| RETRO465-B-PRECHECK-TREE-NOT-DELIVERED | ruled → L56 clause |
| RETRO465-B-PREHYDRATION-HANDSHAKE | ruled → L18 წინადადება |
| INFO-A451-L60-SED-DOC | ruled → L60-ის evidence (2×) |
| RC-R305-LESSON-CHAR-CAP | counter RETRO 480-მდე (L23 4623, L58 4689 ბაიტი) |
| TLM-PERF15-FIREFOX, TLM-R454-…, TLM-R455-…, TLM-R459-… | Saba-ს Q1 (Firefox) / Q2 (Safari); ვადა RETRO 480 |
| TLM-SYS3-IME-PLATFORMS + TL-R444-L1 | მეორე RETRO პასუხის გარეშე → task, დაბლოკილი რეალურ IME-ზე (Q3) |
| TLM-SABA-B-12-FIREFOX-SAFARI | მესამე RETRO: Firefox — task ROOT-REQ-PLAYWRIGHT-FIREFOX-ზე; Safari — Q2 |
| TLM-R448-HIREUS-EMAIL-CLIENTS, TLM-R449-WEBKIT-HEADING-INK | Q5 / Q2, ვადა RETRO 480 |
| TLM-R453-LEGACY-PLAYHEAD | ვადა D-29z1610-ის supersession-ით დაკმაყოფილდა |
| STUDIO-PERFORMANCE parked | მესამე კითხვა (Q4); L46-ის reopen არ ეხება (დიზაინის არჩევანი) |

## 9. countermetric-ები: retro 450-ის მიზნები → შედეგი
| მიზანი | შედეგი |
|---|---|
| რაუნდის მედიანა ≤ $17.00 | $20.25 — **ვერ** |
| B მედიანა ≤ $12.50 | $14.44 — **ვერ** |
| B წილი ≤ 70 % | 71.7 % — **ვერ** |
| l57-check rc 0 15/15 | 15/15 — შესრულდა |
| unruled Medium-იანი A STOP → short FAIL, origin 100 % | origin 10/10 — შესრულდა; STOP-ები 451/456/457/459 — FAIL. **ნაწილობრივ:** round 463-ში A-მ Medium A-R463-REVIEW-M1 დაწერა როგორც „Needs B ruling (not a STOP)“ (`a-round-463.md` l.3), C-მ PASS მისცა Low C-R463-01-ით, gate 463-მა `d55ec17` 08:18Z-ზე გამოაქვეყნა, B-ის ruling-მდე (`gates/gate-round-463.json`); ხილული ეფექტი არ ჰქონდა |
| fix-up chain ≤ 1 | **ვერ:** 4 ჯაჭვი — 451→452, 456→457→458, 459→460→461, 463→464; ორის სიგრძე 2-ია (`data/task-titles.txt`) |
| ახალი deferred Low ≤ 30 | 78 — **ვერ** |
| lessons ≤ 60 ხაზი; L23, L58 < 5100 B | 60; 4623 / 4689 — შესრულდა |

**RETRO 480-ის counter-ები** (`tech-lead`): რაუნდის მედიანა ≤ $18.00; B მედიანა ≤ $13.00; B წილი ≤ 68 %; C FAIL ≤ 2; ახალი deferred Low ≤ 35; l58-check 15/15; lessons ≤ 60 ხაზი და ≤ 57,500 B; თითო sketch-ზე ერთი სრული `tech-lead` review და მაქსიმუმ ერთი delta, მესამე მხოლოდ წერილობითი მიზეზით; ახალი ერთჯერადი `.py` თითო `b-round-N/`-ში ≤ 2 (RETRO-ს გარდა).

## 10. ცვლილებები: lessons (`b-round-464/lessons-diff.txt`)
diff hunks: `3c3 16c16 36c36 40,41c40,41 53c53 60c60`. 60 ხაზი; 58,399 → 57,320 ბაიტი; lesson id-ები უცვლელია (`data/lesson-ids-after.txt`).
- **l.3:** pointer, RETRO 465-ის შენიშვნა; ძველი ისტორია `b-round-464/lessons-before-465.md` l.3-შია.
- **L52 (l.36):** „A guard must be able to disagree with what it checks“ (4×).
- **L56 (l.40):** „Pre-check tree = delivered tree“ (2×).
- **L58 (l.41):** წაიშალა RETRO 401-ის sketch-review claim-ის წინადადება (RETRO 416-ის `l58-check.py` ფარავს) და 388/391/394/395-ის ფრჩხილი; სათაური ახლა „Pre-step rules (RETRO 401)“, evidence (2×) → (1×).
- **L23 (l.16):** GATE276-T1, C-R258-01 და gate 262-ის evidence ფრჩხილები id-მდე შემოკლდა.
- **L18 (l.53):** pre-hydration handshake-ის წინადადება (1×).
- **L60 (l.60):** evidence INFO-A451-L60-SED-DOC, (1×) → (2×).

## 11. სისტემური ამოცანა
**SYS-R465-DEAD-CSS-MATCHER** (test-only; `backlog.json` → `systemic_tasks`):
- `store-dead-css.test.ts`-ის საკუთარი comment stripper-ი და „used“ matcher იცვლება ერთი ექსპორტირებული string-aware stripper-ით და `isUsedInSource` helper-ით `helpers/style-scan.ts`-ში.
- DC1–DC4-ის ვერდიქტები HEAD-ის ტოლი უნდა დარჩეს (L4: golden test, HEAD-pin mutant-ები ორივე მიმართულებით; L52: guard-ს და subject-ს შეუძლიათ ერთმანეთს არ დაეთანხმონ).
- **ხურავს:** TL-R464-L1-COMMENT-AFTER-UNLISTED-CHAR, A-R464-REVIEW-L3, L4, L5, L6, SIG-R464-THIRD-COMMENT-STRIPPER. SIG-R463-USED-DEFINED-TWICE მხოლოდ მაშინ, თუ `css-prune.py`-ის წესი ჩანაცვლდება.
- **არ ხურავს:** A-R463-REVIEW-L1, L6, TL-R464-L2 (fail-red განზრახ), walker-ის Low-ები.
- **როდის:** §7-ის trigger-ით (root-ის პასუხი, მომდევნო dead-CSS წაშლის stage ან round 480).
- **არქიტექტურა:** ARCH-CHECKPOINT-STYLE-SCAN root-თან ისევ ღიაა (D-29z1619-დან), ახლა ვადით round 480. ახალი frontend-architect checkpoint არ ვითხოვ: სიგნალი ძველ მოთხოვნას დაემატა.

## 12. Saba-სთვის და root-ისთვის (წინადადებები და კითხვები; loop-ში არ სრულდება)
- `user-review/questions-retro-465.md` Q1–Q7, თითოეულს default აქვს: Firefox (5 შემოწმება), Safari სია, IME (მეორედ), STUDIO-PERFORMANCE (მესამედ), Hire-Us e-mail, ეკრანის კანდიდატები და micro-fix-ის წინადადება.
- **Q7 მხოლოდ წინადადებაა** (`tech-lead`): ჩაწერილი micro-fix კლასი hash-pinned sketch-ში. ის „writer does not verify“ წესს ეხება, ამიტომ loop მას თავად არ ცვლის (counter RETRO480-PINNED-SKETCH-MICRO-FIX).
- **Root:** ROOT-REQ-PLAYWRIGHT-FIREFOX ხელახლა (5 შემოწმებას ბლოკავს); ARCH-CHECKPOINT-STYLE-SCAN ვადით round 480; GATE462-M1-EMAIL-SERVER-POLICY ისევ ღიაა.
- **`.claude/`-ის ან primitives-ის ცვლილება:** ამ RETRO-ში არ არის.

## 13. შემდეგი
1. **Round 466:** REGRESSION-2026-11-13, თუ დაგეგმვა 2026-11-13-ზე ან მის შემდეგ ხდება; თორემ STORE-2b-3c-2b.
2. შემდეგ: 2b-3c-2b (თუ ჯერ არ გაკეთებულა), 2b-4, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2 (skip rule-ით).
3. STEM-LANES წინ გადმოდის, როგორც კი Saba AGREE-STEM-LANES-ს უპასუხებს.
4. **შემდეგი RETRO:** round 480.
