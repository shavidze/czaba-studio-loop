# RETRO 353 — მეთერთმეტე რეტროსპექტივა (რაუნდები 336–352)

**თარიღი:** 2026-11-05 · **ავტორი:** B (D-29z1130…D-29z1134) · **სტატუსი:** C ამოწმებს round 353-ში (RT-* row-ები).

**წესები:**
- „Retrospective: stop, look back, improve“ (Saba, 2026-10-26);
- „Look back on every issue Saba finds, and guard the whole screen“ (2026-10-28);
- RETRO-ზე გზის მიმოხილვა (2026-10-31);
- `backlog.json` → `retro_policy`.

**კონსულტაციები** (read-only, ორივე რეალურად გამოძახებულია):
- retro-სთვის: `tech-lead` (§10, §11 — მისი verdict-ები მისი აზრია);
- ეკრანისა და გზისთვის: `product-designer` (`user-review/screen-review-353.md`).

`consequence-tester`, `qa-engineer`, `design-philosopher` და `first-visit-host` 2026-11-04-ის §6-ის შემდეგ B-ის კონსულტაციების სიაში აღარ არიან, ამიტომ არ გამომიძახებია.

**ფანჯარა:** 336–352, ანუ 17 რაუნდი. RETRO 351-ზე იყო დაგეგმილი, მაგრამ ორჯერ გადაიწია (D-29z1122, D-29z1126), რადგან ჯერ ღია Medium-ები უნდა დახურულიყო (2026-10-23-ის bug gate). round 336 თავად RETRO იყო და ფანჯარაში შედის (retro 321/336-ის პრეცედენტი).

**ყველა რიცხვის წყარო.** გზები `tmp/studio-real-loop/`-ის მიმართაა. სკრიპტები retro 336-ის ასლია, ფანჯრით 336–352. გაუშვით loop-ის root-იდან: `python3 -I b-round-352/<script>`.
- `collect.py` → `rounds-336-352.json`; `cost.py` → `cost-rows.json`, ჯამები `cost.txt`-ში. B-ის ღირებულება წანაცვლებულია: `b-round-(N−1)-result*.json` = რაუნდ N-ის დაგეგმვა.
- `retro-numbers.py` → `retro-numbers.txt`. ის თავიდან დაიწერა, რადგან ძველს რაუნდების ჯგუფები ხელით ჰქონდა ჩაწერილი. ყველა რიცხვი თავისი წყაროთი შეჯამებულია `retro-numbers-353.txt`-ში.
- `fails-detail.py` → `fails-detail.txt`; `gate-reviews.py` → `gate-reviews.txt`. ხელით შესწორება `gate-reviews-hand.txt`-შია (5 review ფორმატს სკრიპტი ვერ კითხულობს).
- `classify.py` → `classify.txt`, `classify-out.json`; `window-ids.txt`.
- `l57-coverage.py` → `l57-coverage.txt`; `exp-fields.py` → `exp-fields.txt`; `exp-r321-final.txt` (ხელით, წესის ციტატით).
- `awaiting-user.py` → `awaiting-user.txt`; `misc-outputs.sh` → `task-titles.txt`, `stops-count.txt`, `deferred-totals.txt`, `open-medium-plus.txt`, `archived-mediums.txt`, `c-models.txt`.
- ხელით: `fails-cause-hand.txt` (§3), `stops.txt` (§3), `rc-recurrence.txt` (§8).
- inventory: `retro353-mentions.py` → `retro353-mentions-v2.txt`, `retro353-mention-ids-v2.txt` (§8). ყველა recompute ბრძანება: `claims-data.txt`.

**C-R215-01-ის გაკვეთილი:** სკრიპტები კითხულობს `b-round-352/backlog-before-353.json`-ს, backlog-ის ცვლილებამდე აღებულ ასლს.

**ღირებულების შენიშვნა:** რიცხვები `*-result*.json`-ის `total_cost_usd`-იდან მოდის (retro 321/336-ის მეთოდი).

---

## 1. მოკლედ
- **C: PASS 14, FAIL 2 (350, 351), BLOCKED 1 (340).** `browserVerified` სამჯერ არ იყო true: 340, 341 (რეგრესია) და 351 (STOP-ის მოკლე მარშრუტი). retro 336-ის ფანჯარაში 10 / 5 იყო.
- **Gate:** გამოქვეყნდა 11, skipped 6, **failed 0**. skipped-ებიდან სამი „no real changes“-ია (336, 341, 342), ერთი C BLOCKED (340), ორი C FAIL (350, 351).
- **ღირებულება $277.65** = B $160.75 + A $86.52 + C $30.38.
  - რაუნდის მედიანა $17.01 (retro 336: $20.23).
  - FAIL-რაუნდებზე დაიხარჯა $31.43 (retro 336: $117.06).
  - **B-ის წილი 57.9%-ია** (retro 336: 44%). B-ის მედიანა 337–352-ში $9.98-ია (retro 336-ში 322–335: $8.685). C-ის მედიანა $0.95-ია.
- **ერთი fix-up ჯაჭვი:** 350 → 351 → 352, $43.44, ორივე ჩავარდნა B-ისგანაა (§3). feature-ის 11 პირველი ეტაპიდან C-ზე 1 ჩავარდა (retro 336-ში 9-დან 3).
- **A-ს STOP: 2** (350, 351). ორივე C-მდე მივიდა და FAIL-ით დასრულდა. L22-ის მოკლე მარშრუტი მხოლოდ 351-მა გამოიყენა (`stops.txt`).
- **REGRESSION 340–342:** 0 Medium+, 2 Low. 340 BLOCKED-ით დასრულდა (scope ერთი C ფაზისთვის დიდი იყო, mock API არ იყო გაშვებული), 341 C ფაზა ნაადრევად დასრულდა (L59), 342-მა სია დახურა. ღირებულება $29.51.
- **დასრულდა:** SYS-R336-PERF-DRAG-WINDOW (337); PERF-DRAG-PREVIEW-ის c3-ii, c4-i, c4-ii, c5-i, c5-ii, c6-i, c6-ii, conversions, video-trim-fade rows და PERF-CAND-VIDEO-TRIM-FADE-COST-ის ეტაპი 1 (350–352, gate `a55543b`).
- **Critical / High 0.** ფანჯრის ორი Medium (C-R351-01, A-R350-REVIEW-SEEK-TEST) C round 352-მა დახურა. ღია Medium-ები ისევ ძველი, დაპარკული ან root-ის საკითხებია (`open-medium-plus.txt`): A-R73-SAFARI-FLAG-FOCUS, GATE232-S2, GATE271-S1-NO-REALIGN, GATE274-S1-HELD-REPEAT-ANNOUNCE, GATE304-M1.
- **ეკრანზე 17 რაუნდში არაფერი შეცვლილა** (row-ების რაოდენობა 138 / 168 / 118 / 144 retro 336-ის ტოლია, §6).
- **მთავარი დასკვნა:** ორივე ჩავარდნა **არსებული წესის შეუსრულებლობაა** და არა წესის არქონა. ამავე კლასშია L57-ის ველების დაკარგვა 16-დან 8 JSON-ში. ამიტომ ახალი სტრიქონი lessons-ში არ დამატებულა: ეს წესები შემოწმებად artifact-ად იქცა (§10).

## 2. ციფრები
| მაჩვენებელი | 336–352 | retro 336 (321–335) | წყარო |
|---|---|---|---|
| რაუნდები | 17 (RETRO 1, REGRESSION 3, feature 11, fix-up 2) | 15 | `retro-numbers-353.txt`, `task-titles.txt` |
| C PASS / FAIL / BLOCKED | 14 / 2 / 1 | 10 / 5 / 0 | `cost.txt`, `rounds-336-352.json` |
| gate published / skipped / failed | 11 / 6 / 0 | 9 / 5 / 1 | `cost.txt` |
| ჯამი (B / A / C) | $277.65 ($160.75 / $86.52 / $30.38) | $339.76 | `cost.txt` |
| რაუნდის მედიანა | $17.01 | $20.23 | `cost.txt` |
| ფაზის მედიანა B / A / C | $11.51 / $5.93 / $0.95 | $9.20 / $5.44 / $5.90 | `retro-numbers.txt` |
| B-ის წილი | 57.9% | 44% | `retro-numbers.txt` |
| ჯგუფები | RETRO $14.17; REGRESSION $29.51; feature $212.05; fix-up $21.92 | — | `retro-numbers.txt` |
| ყველაზე ძვირი რაუნდები | 345 $27.64, 339 $24.72, 347 $23.67, 344 $21.96, 350 $21.52 | — | `cost.txt` |
| C `bugs[]` | Medium 1, Low 6 | Medium 3, Low 13 | `fails-detail.txt` |
| gate review-ები | 11 ფაილი, 49 პუნქტი (script 28 + ხელით 21), 0 Critical | 9 ფაილი, 42 | `gate-reviews*.txt` |
| კლასიფიცირებული id-ები | 61 (open 26 + deferred 35) | 44 | `classify.txt` |
| `deferred_low_polish` სულ | 634 | 592 | `deferred-totals.txt` |
| `awaiting_user` | 90 | 88 | `awaiting-user.txt` |
| L57-ის 12 ველი სრულად | 16-დან 5 JSON (337, 338, 339, 341, 344) | — | `l57-coverage.txt` |
| bug-ს `origin` აქვს | 7-დან 1 | — | `l57-coverage.txt` |

**C-ის ღირებულების ვარდნა** ($77.00 → $30.38) ფაქტია (`cost.txt`). C ყველა რაუნდში Sonnet 5.5-ზე მუშაობდა (`c-models.txt`; 341-სა და 347-ში Fable 5.1-იც). რომ ვარდნა მხოლოდ მოდელის ცვლილებითაა გამოწვეული, **დასკვნაა** და არა ფაქტი: ფანჯარაში ბევრი test-only და record რაუნდი იყო.

**B-ის წილის ზრდა** (44% → 57.9%) ფაქტია. ჩემი წაკითხვით (დასკვნა): ეს L58-ის sketch-run-ის წესის ფასია. B ყოველ PERF ეტაპზე perf spec-ს sketch-ზე უშვებს (L58), და სწორედ ამიტომ C-ზე პირველივე ცდაზე 11-დან 1 ეტაპი ჩავარდა. ეს წესის შესაბამისი ხარჯია და არა გადაჭარბება: B-ის მედიანა $9.98 retro 321-ის stop-ზღვარს ($13.94) ქვემოთაა.

## 3. FAIL-ები და fix-up ჯაჭვი: რატომ და რომელი წესი აიცილებდა (`fails-cause-hand.txt`, `stops.txt`)
| რაუნდი | რა მოხდა | origin | წესი, რომელიც უკვე არსებობდა |
|---|---|---|---|
| 350 | C FAIL, 1 Low C-R350-01. task-მა იწინასწარმეტყველა, რომ mutant M-B2 DP71-ს გააწითლებდა. B-ს ეს წყვილი sketch-ზე არ გაუშვია: `b-round-349/`-ში M-B2-ის log არ არის. A-მ STOP დაწერა (`a-round-350.md` l.3) | B pre-check | L58: „B runs C's exact command on the sketch … the row also names the mutant that turns it red“ |
| 351 | C FAIL „STOPPED — routed to B“, 1 Medium C-R351-01: DP72-ს release-სა და Undo-ს შორის assert არ ჰქონდა. A-ს code-reviewer-მა იპოვა (`a-round-351/review.md` F1) | B spec | L58-ის sketch-review clause (RETRO 336): B-ს sketch dispatch-მდე უნდა გადაეხედა. round 350-ში არ გადაუხედავს (D-29z1123) |
| 340 | C BLOCKED (დრო/ბიუჯეტი), 0 bug. REGRESSION-ის scope ერთ C ფაზაში არ ჩაეტია, mock API არ იყო გაშვებული (`c-round-340.md` l.3, l.7). 341-მა C ფაზა row-ების დარჩენით დაასრულა (INFO-C341, L59), 342-მა დახურა | B scope / environment | L59 (341-ის შემდეგ დაემატა) |

- **ჯაჭვი:** 350 → 351 → 352, ორი fix-up, $43.44. პროდუქტის კოდი 350-შივე სწორი იყო (C-მ ყველა product row გაიარა). ორივე fix-up მხოლოდ ტესტსა და doc-ს ეხებოდა.
- **STOP-ის მარშრუტი:** 350-ის STOP mutant-ის წყვილზე იყო, ანუ claim-ის მნიშვნელობაზე. L22-ის გამონაკლისის მიხედვით C-მ სრული run გაიარა (ჩემი წაკითხვა, `stops.txt`). 351-ის STOP ruled clause-ზე იყო, და C-მ მოკლე მარშრუტი აირჩია ($0.40).
- **gate:** failed 0 (retro 336-ის ფანჯარაში 1 იყო, 325).

## 4. Findings-ის კლასიფიკაცია (`classify.txt`)
- **origin:** open 26 (C 8, A 12, gate 6) + deferred 35 (A 24, gate 8, C 3) = 61. `INFO-*`-ის ჩათვლით 62 id (`window-ids.txt`).
- **severity:** open 26 = Medium 2, Low 20, info 4; deferred 35, ყველა Low.
- **კატეგორია (`classify.py`-ის keyword-ები):**
  - open: uncategorised 11, timing/audio 5, focus 3, keyboard 2, layout/visual 2, tests/harness 1, copy/i18n 1, docs/process 1;
  - deferred: uncategorised 11, keyboard 5, focus 5, timing/audio 5, layout/visual 4, tests/harness 2, copy/i18n 2, docs/process 1.
- **root cause (B-ის წაკითხვა, დასკვნა; keyword-ებმა 22 id უკატეგორიოდ დატოვა):** ფანჯრის სამუშაო PERF-DRAG-PREVIEW-ის ეტაპები იყო. ხელით წაკითხული ჯგუფები: „weak assert / missing test“ (A-ს reviewer-ის Low-ები DP ტესტებზე, §11) და „harness gap“ (interactions spec 450 s-ს აჭარბებს: C-R344-PERF-DURATION, C-R345-PERF-DURATION, ROOT-REQ-PERF-TIMEOUT).

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **350 და 351:** ორივეს აიცილებდა უკვე არსებული L58, შესრულების შემთხვევაში. ახალი წესი არ სჭირდება. საჭიროა, რომ წესის შესრულება შემოწმებადი იყოს: sketch-review ფაილი sha256-ით და mutant-ის log-ები, რომლებიც წითელ row-ს grep-ით აჩვენებს (§10).
- **L57-ის ველები:** C-ის JSON-ში ველები იკარგებოდა, როცა task მათ არ ჩამოთვლიდა. პროზაში დაწერილი წესი საკმარისი არ აღმოჩნდა. ამიტომ შეიქმნა checker-ი `tools/l57-check.py` (§10).
- **340:** REGRESSION-ის scope ერთ ფაზას აჭარბებდა. L59 და 341–342-ის გაყოფა უკვე დაემატა. შემდეგი REGRESSION (≥ 2026-11-08) წინასწარ იყოფა ორ ნაწილად, და mock API-ის health check პირველი row-ია.
- **shared helper:** DP ტესტების ოთხი Low ერთი მიზეზისაა: assert კონტრაქტზე სუსტია. ერთ test-only დავალებად გაერთიანდა (§11).

## 6. Saba-ს ნაპოვნი საკითხები და ეკრანი
- **ფანჯარაში Saba-ს ახალი bug არ ყოფილა.** 2026-11-05-ს root-მა Store-ის მიმართულება გადაწყვიტა (A Obsidian & Brass, `aca59b3`). backlog-ში ეს უკვე ჩაწერილია: STORE-2b…5 მიმართულებას აღარ ელოდება და თავის ადგილზე რჩება, STUDIO-PERFORMANCE-ისა და SYS-1…3-ის შემდეგ.
- **ეკრანი და გზა:** `user-review/screen-review-353.md`. გადაღებული კადრები `b-round-352/screens/`-შია: 12 PNG, `screen353.json` და `compare-336-353.txt`.
  - row-ები 138 / 168 / 118 / 144 retro 336-ის ტოლია; `laneErrors` none.
  - გზა მიდის `/studio-lab?preview=middle-east`-ზე, Play-ის შემდეგ position ≥ 00:01.000.
  - ახალი კანდიდატებია SR-353-1…5. ყველა კითხვაა Saba-სთვის. ყველაზე მნიშვნელოვანია SR-353-1: Add-ის შემდეგ clip ეკრანს მიღმა რჩება. `product-designer`-ის აზრით (modify) ის STEM-LANES-მა უნდა გადაჭრას.

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
- **L57-ის checker:** B-ს თავდაპირველი წინადადება იყო, რომ ველის არქონა C-ის row FAIL ყოფილიყო. `tech-lead`-მა ეს უარყო: ასე C-ის საკუთარი bookkeeping-ის გამო round FAIL-დება და gate გამოტოვდება, მაშინ როცა A-ს ნამუშევარი სწორია. B დაეთანხმა: C hand-off-მდე checker-ს rc 0-მდე უშვებს.
- **L58:** `tech-lead`-მა აღნიშნა, რომ `test -f` მხოლოდ ფაილის არსებობას ამტკიცებს. sha256 და წითელი row-ის grep დაემატა. L58 2803 → 2908 byte-მდე გაიზარდა (+105). `tech-lead` ზრდის გარეშე ცვლილებას ურჩევდა, მაგრამ პირველ ვარიანტში წაიშალა წესი „unruled Medium, რომელსაც A-ს reviewer B-ის sketch-ზე იპოვის, planning FAIL-ია“ და evidence id A-R327-REVIEW-SAME-TEXT-REMOUNT. ორივე აღვადგინე. წესის შენარჩუნება ბაიტის მიზანზე მნიშვნელოვანია; ზღვარი 5500 შორსაა.
- **cachedLane (A-R350-REVIEW-CACHED-TRACKS, GATE352-S1):** `tech-lead`: ერთი trigger და არა ორი. Low რჩება `deferred_low_polish`-ში ტრიგერით „როცა dock-ს შემდეგ შეეხებიან“. ამასთან, ის architecture checkpoint-ის მე-4 კითხვის input-ია. ეს ერთი და იგივე trigger-ია: შემდეგი dock-ის task.
- **SR-353-1-ის severity:** `product-designer`-მა Medium დაარქვა. B მას bug-ად არ აღრიცხავს: ეს view-ის ქცევის ცვლილების კითხვაა (Saba-ს გადაწყვეტილება), არა დეფექტი.

## 8. ღია კანდიდატების ბედი (inventory: `retro353-mention-ids-v2.txt`, `retro353-mentions-v2.txt`, `retro353-candidates.txt`)
| id | გადაწყვეტილება |
|---|---|
| RC-R351-SKETCH-REVIEW-SKIPPED | **adopted** → L58 (sha256-იანი `sketch-review.md`) |
| RC-R350-MUTANT-PAIR-UNRUN | **adopted** → L58 (`mutant-<id>.log`, რომლის `[K#]` წითელ row-ს grep-ავს) |
| RC-R351-L28-PENDING-FORM | **adopted** → L28 (`pending` ფორმა არასდროს; doc 232 l.4 შემდეგ task-ში სწორდება) |
| RC-R305-LESSON-CHAR-CAP | watch to RETRO 368. L23 5058 byte, L58 2908 byte; trigger > 5500 |
| RC-R332-COMPARATOR-BRANCH | **closed, not adopted.** 1×, ორ ფანჯარაში არ განმეორებულა (`rc-recurrence.txt`) |
| RC-R333-STALE-DERIVED-MUTANT | watch to RETRO 368. regex-ს არ დაემთხვა. B-ის წაკითხვით (დასკვნა) C-R345-CAPTION-MUTANT-GAP იგივე კლასია (2×?) |
| RC-R336-SCRIPT-OUTPUT-DIR | **2× (განმეორდა):** `collect.py`, `classify.py` და `awaiting-user.py` default-ად `b-round-352/`-ში წერს. lesson-ის ადგილი არ არის. round 353-ის task-ში C სკრიპტებს `c-round-353/`-ში აკოპირებს. watch to 368 |
| RC-R344-PROD-NAME-PROBES | watch to 368. 1×; ამის შემდეგ names probe ყოველთვის dev build-ზე გაეშვა |
| ROOT-REQ-PERF-TIMEOUT | L46-ის ვადა გავიდა (5+ RETRO). **ერთი კითხვა Saba-სთვის** (§12.1) |
| ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE | root-ს ახლა ეთხოვა (D-29z1129, `b-round-352/root-request-arch-checkpoint.md`), მე-4 კითხვით |
| STUDIO-PERFORMANCE, PERF-DRAG-PREVIEW | in_progress. შემდეგია video ეტაპი 2 (§13) |
| C-R350-01, A-R350-REVIEW-SEEK-TEST, C-R351-01, A-R351-REVIEW-GLOBAL-SPY, A-R351-REVIEW-TRY-SPAN | **closed** (D-29z1127, C round 352 PASS) |
| D-29z1094 … D-29z1126 (12 D-ID) | ისტორიული ჩანაწერებია; მოქმედება არ სჭირდება |

## 9. retro 321-ის ექსპერიმენტი: EXP-R321-PRECHECK-GATES — საბოლოო (`exp-r321-final.txt`)
- **წესი** (retro-321 §10, ფანჯარა 322–337): უარყოფილია, თუ (a) ≥ 1 ჯაჭვია ≥ 2 fix-up-ით და მისი საწყისი check B-მ sketch-ზე მწვანედ გაუშვა, ან (b) ≥ 2 ჯაჭვია pre-check-ის სრული დაფარვის მიუხედავად. stop: B-ის მედიანა > $13.94, ან შედეგის ფაილები 2 რაუნდში აკლია. null: gate-check-ს 3-ზე ნაკლები რაუნდი ასახელებს.
- **ფაქტები:** B-ის მედიანა 322–337-ში $9.93-ია (stop არ შესრულდა). null არ არის. (a) არ შესრულდა: ერთადერთი ჯაჭვი ≥ 2 fix-up-ით (322 → 324) B-ის განზრახ წითელი check-იდან დაიწყო. (b) არ შესრულდა: სრული დაფარვა არცერთ რაუნდს არ ჰქონია. countermetric: A-ს მედიანა $5.35-ია, ხარჯი A-ზე არ გადასულა.
- **საბოლოო ვერდიქტი: „როგორც დაიწერა, ისე ვერ ფასდება“.** treatment (ყველა დასახელებული gate check sketch-ზე) არცერთ რაუნდში არ მიწოდებულა. ეს B-ის წაკითხვაა (დასკვნა), `tech-lead` ეთანხმება. **ექსპერიმენტი იხურება.**
- **მემკვიდრე ველები** (`affectedChecksNamed`, `affectedChecksRunOnSketch`) 16-დან 8–9 JSON-ში აკლია. იგივე stop-წესით ეს გაზომვაც გამოუსადეგარია.
- **ახალი ექსპერიმენტი არ იხსნება**, სანამ `tools/l57-check.py` ზედიზედ ~5 სრულ JSON-ს არ მისცემს (`tech-lead`).

## 10. ცვლილებები: lessons და ინსტრუმენტი
- **`lessons.md`: 60 → 60 ხაზი** (D-29z1131; diff `b-round-352/lessons-diff.txt`, ოთხი ხაზი იცვლება: l.3, L28, L57, L58). ყველა ცვლილება `tech-lead`-თან შეთანხმებულია:
  - **L58:** sketch-review clause ჩანაცვლდა. `b-round-N/sketch-review.md` dispatch-ილი sketch-ის sha256-ით იწყება და ყოველ Medium+-ს id-ით წყვეტს (reviewer: code-reviewer, ან `tech-lead`, სანამ code-reviewer B-ის სიაში არ არის). ყოველ ნაწინასწარმეტყველებ mutant-ს აქვს `mutant-<id>.log`, ახალი ტესტებით გაშვებული, და მისი `[K#]` წითელ row-ს grep-ავს. ძველი წესი (unruled Medium = planning FAIL) და მისი evidence რჩება. ხაზი 2803 → 2908 byte (§7).
  - **L57:** `tools/l57-check.py`. C hand-off-მდე უშვებს, სანამ rc 0 არ იქნება. ველის არქონას C თავად ასწორებს, ეს row FAIL არ არის. B დაგეგმვისას იმავეს უშვებს და არქონას INFO-დ წერს. round 352-ის JSON-ზე rc 1-ია, 9 ველი აკლია (`b-round-352/l57-check-c352.txt`).
  - **L28:** multi-stage doc-იც იგივე ფორმას იყენებს. `C round N pending` არასდროს იწერება. C-ის DOCS row `docs/implementation`-ში მას grep-ავს, 0 hit უნდა იყოს.
  - **line 3** ახლა `retro-353.md`-ზე მიუთითებს.
- **L23 არ შეცვლილა** (5058 byte). ახალი ხაზი არ დამატებულა, ამიტომ წაშლა ან შერწყმა არ დასჭირდა.

## 11. სისტემური დავალება
**SYS-R353-DP-TEST-POLISH** (D-29z1132), test-only: `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` და doc 232.
- **ხურავს:** A-R350-REVIEW-TEST-NITS, A-R352-REVIEW-COMMIT-EXACT, A-R352-REVIEW-DRAG-DISTANCE, A-R352-REVIEW-WINDOW-PRECONDITION (GATE352-S3 შეერთებულია).
- **საერთო მიზეზი:** DP-ის assert-ები კონტრაქტზე სუსტია: `toBeCloseTo` ზუსტი key-ის ნაცვლად, მხოლოდ მიმართულება მანძილის გარეშე, ფიქსირებული 20 ms-ის ლოდინი, DP70-ის caption/gap-ის შემოწმება, რომელიც ვერ ჩავარდება.
- **მიღება:**
  - ყოველ გამკაცრებულ assert-ს აქვს mutant, რომელიც მას B-ის sketch-ზე აწითლებს (L58, log-ით);
  - DP66–DP72-ის არსებული mutant-ის რუკა უცვლელია;
  - 74 ტესტი რჩება 74 ან მეტი.
- **ადგილი:** PERF-CAND-VIDEO-TRIM-FADE-COST-ის ეტაპი 2-ის შემდეგ, PERF-CAND-MASTER-GROUP-FADER-PROPS-მდე. app-ის კოდი არ იცვლება.
- cachedLane (A-R350-REVIEW-CACHED-TRACKS, GATE352-S1) აქ **არ შედის**, რადგან ის app-ის კოდია. შემდეგი dock-ის task მას პირველად ასწორებს.

## 12. Saba-სთვის (წინადადებები და კითხვები; loop-ში არ სრულდება)
1. **ROOT-REQ-PERF-TIMEOUT (ერთი კითხვა, L46).** interactions perf spec-ს 15 წუთის ლიმიტი აქვს. ბოლო run-ები 454–497 s-ია, L31-ის საზღვარი კი 450 s. მოთხოვნა round 278-იდან ღიაა. **კითხვა:** გაზარდოს root-მა ლიმიტი, თუ spec ოჯახების მიხედვით გაიყოს (architecture checkpoint-ის მე-3 კითხვა)? სანამ პასუხი არ არის, interactions spec-ში ახალი row არ ემატება, მხოლოდ კონვერსიები.
2. **ეკრანის მიმოხილვა:** `user-review/screen-review-353.md`, ახალი კითხვებით SR-353-1…5. ყველაზე სუსტი ნაბიჯი ისევ SR-305-3-ია (ჩამოსვლისას ცარიელი timeline) და ახალი SR-353-1.
3. **90 კითხვა ელოდება შენს პასუხს** (`b-round-352/awaiting-user.txt`; retro 336-ში 88 იყო). არცერთი loop-ს არ ბლოკავს.
4. **root-ისთვის:**
   - ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE ახლა ითხოვება (`b-round-352/root-request-arch-checkpoint.md`);
   - `code-reviewer`-ის დამატება B-ის კონსულტაციების სიაში: L58-ის sketch review მას ასახელებს, ამჟამად კი `tech-lead` ანაცვლებს (წინადადება);
   - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1) ისევ ღიაა.
5. **პროექტის წესის წინადადება (retro 321-იდან, ისევ ღიაა):** `REACT_CONTEXT.md`-ში ჩაიწეროს zustand, როგორც Studio-ს ახალი store-ების სტანდარტი (D-29z193).

## 13. შემდეგი
round 353-ში C ამოწმებს ამ retro-ს. შემდეგ:
- **round 354 = PERF-CAND-VIDEO-TRIM-FADE-COST ეტაპი 2:** C round 350-ის მნიშვნელობებზე 22 video row-ის record → assert კონვერსია. მხოლოდ budget-ები, ახალი interactions row არ ემატება. doc 232 l.4 L28-ის ფორმაზე გადადის;
- **REGRESSION** 2026-11-08-დან, ორ ნაწილად, mock API-ის health-ით;
- შემდეგ: SYS-R353-DP-TEST-POLISH → PERF-CAND-MASTER-GROUP-FADER-PROPS → PERF-CAND-FADE-RELEASE-COMMITS → PERF-9…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule).

შემდეგი RETRO: round 368 ან STUDIO-PERFORMANCE-ის დასრულება, რომელიც უფრო ადრე მოვა.
