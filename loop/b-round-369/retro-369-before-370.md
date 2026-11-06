# RETRO 369 — მეთორმეტე რეტროსპექტივა (რაუნდები 353–368)

**თარიღი:** 2026-11-06 · **ავტორი:** B (D-29z1212…D-29z1217) · **სტატუსი:** C ამოწმებს round 369-ში (RT-* row-ები).

**წესები:** „Retrospective: stop, look back, improve“ (Saba, 2026-10-26); „Look back on every issue Saba finds, and guard the whole screen“ (2026-10-28); RETRO-ზე გზის მიმოხილვა (2026-10-31); `backlog.json` → `retro_policy`.

**კონსულტაციები** (read-only, ორივე რეალურად გამოძახებული; მათი verdict-ები მათი აზრია და ასეა მონიშნული):
- retro-სთვის: `tech-lead` (§3, §7, §10, §11);
- ეკრანისა და გზისთვის: `product-designer` (`user-review/screen-review-369.md`).

`consequence-tester`, `qa-engineer`, `design-philosopher` და `first-visit-host` 2026-11-04-ის §6-ის შემდეგ B-ის კონსულტაციების სიაში არ არიან; არ გამომიძახებია და მათ სახელით აზრი არ დამიწერია (root-ის მოთხოვნა §12.3).

**ფანჯარა:** 353–368, ანუ 16 რაუნდი. RETRO 368-ზე იყო დაგეგმილი; ერთი რაუნდით გადაიწია (D-29z1209), რადგან ხეში C-R367-DEDUP-CANCELLED-WRITE (Medium) იდო და RETRO კოდს ვერ ცვლის. round 353 თავად RETRO იყო და ფანჯარაში შედის.

**ყველა რიცხვის წყარო** (გზები `tmp/studio-real-loop/`-ის მიმართ). სკრიპტები retro 353-ის ასლია, ფანჯრით 353–368, და **default-ად `b-round-368/data/`-ში წერენ** (RC-R336-SCRIPT-OUTPUT-DIR). გაუშვით loop-ის root-იდან: `python3 -I b-round-368/<script>`.
- `collect.py` → `data/rounds-353-368.json`, `collect.txt`; `cost.py` → `data/cost-rows.json`, `cost.txt`. B-ის ღირებულება წანაცვლებულია: `b-round-(N−1)-result*.json` = რაუნდ N-ის დაგეგმვა.
- ყველა რიცხვი ერთად, recompute-ით: `data/retro-numbers-369.txt` (მისი ბრძანება — `b-round-368/retro-numbers.py`).
- `fails-detail.py` → `fails-detail.txt`; `gate-reviews.py` → `gate-reviews.txt`; `classify.py` → `classify.txt`, `classify-out.json`; `l57-coverage.py` → `l57-coverage.txt`; `exp-fields.py`, `manifest-fields.py`; `awaiting-user.py` → `awaiting-user.txt`; `misc-outputs.sh` → `task-titles.txt`, `stops-count.txt`, `deferred-totals.txt`, `open-medium-plus.txt`, `archived-mediums.txt`, `c-models.txt`.
- სკრიპტები კითხულობენ `b-round-368/backlog-before-369.json`-ს — backlog-ის ცვლილებამდე აღებულ ასლს (C-R215-01).

---

## 1. მოკლედ
- **C: PASS 13 / FAIL 3 / BLOCKED 0** (FAIL: 357, 363, 367). **Gate: published 12 / skipped 4 / failed 0** (skipped: 353 RETRO, 357, 363, 367 — სამივე FAIL რაუნდი, სადაც ხე დაუმთავრებელი იყო).
- **სამივე FAIL B-ის წარმოშობისაა** (ფაქტი: L58-ით „A-ს reviewer-ის მიერ ნაპოვნი განუჩინებელი Medium = planning FAIL“). მაგრამ ერთი კლასის არ არის (`tech-lead`-ის აზრი, §3): 357 და 367 — sketch-მა ქცევა გამოტოვა; 363 — pre-check-მა ერთი სატესტო root (perf/lib) არ გაუშვა.
- **ღირებულება $287.91** (B $173.19, A $99.77, C $14.95; B-ის წილი 60.2 %). round-ის მედიანა $16.73.
- **L57-ის checker-მა იმუშავა:** 12-ვე ველი 16/16 C JSON-ში (წინა ფანჯარაში 5/16), `origin` 21/21 bug-ზე (წინა 1/7).
- **ეკრანზე არაფერი შეცვლილა** (138/168/118/144, retro 353-ის ტოლი). Saba-ს ახალი ბაგი ფანჯარაში არ ყოფილა.
- **დასრულდა:** PERF-CAND-VIDEO-TRIM-FADE-COST ეტაპი 2 და VIDEO-MOVE-BUDGET (354, 356), SYS-R353-DP-TEST-POLISH (355), PERF-10a…10b-ii-b (357–364), PERF-9a, 9b-i, 9b-ii (365–368).

## 2. ციფრები (`data/retro-numbers-369.txt`, `cost.txt`, `collect.txt`)
| მაჩვენებელი | 353–368 | retro 353 (336–352) |
|---|---|---|
| რაუნდები | 16 | 17 |
| C PASS / FAIL / BLOCKED | 13 / 3 / 0 | 14 / 2 / 1 |
| gate published / skipped / failed | 12 / 4 / 0 | 11 / 6 / 0 |
| ჯამი | $287.91 | $277.65 |
| B / A / C | $173.19 / $99.77 / $14.95 | $160.75 / $86.52 / $30.38 |
| B-ის წილი | 60.2 % | 57.9 % |
| round-ის მედიანა | $16.73 | $17.01 |
| ფაზის მედიანა B / A / C | $11.46 / $6.07 / $0.76 | $11.51 / $5.93 / $0.95 |
| STOP ხაზი `a-round-N.md`-ში | 357, 361, 363, 367 (4) | 350, 351 (2) |
| FAIL რაუნდების ღირებულება | $54.00 | $31.43 |
| fix-up ჯაჭვები | 357–359 $44.02; 363–364 $31.85; 367–368 $42.99 (ჯამი $118.86) | 350–352 $43.44 |
| top 5 რაუნდი | 365 $26.43, 366 $22.86, 367 $22.54, 360 $21.85, 361 $21.04 | — |

- B-ის მედიანა ამ ფანჯარაში ითვლის 353–368-ის დაგეგმვას (`b-round-352…367`). retro 353-ის countermetric-ი (B მედიანა 337–352 $9.98, stop line $13.94) — ახალი მედიანა $11.46 stop line-ს ქვემოთაა, მაგრამ +$1.48-ით მეტია. **დასკვნა (inference):** ზრდა PERF-9-ის sketch-ების ხელახლა მიმოხილვამ გამოიწვია (365–367 B $12.87–$14.70, sketch v1 → v2 → v3).
- C-ის ღირებულება ორჯერ შემცირდა ($30.38 → $14.95). C 2026-11-04-დან Sonnet-ზეა (`data/c-models.txt`: 358-ში ერთხელ `claude-fable-5-1` advisor-იც). **inference:** შემცირება მოდელის ცვლილებას უკავშირდება; ხარისხის ვარდნის ნიშანი არ ჩანს — C-მ სამივე Medium დამოუკიდებლად გაიმეორა (`fails-detail.txt`).

## 3. FAIL-ები და ჯაჭვები: რატომ და რომელი წესი აიცილებდა (`data/fails-detail.txt`, `a-round-N.md` STOP ხაზები)
| რაუნდი | რა მოხდა (ფაქტი, წყარო) | კლასი (`tech-lead`-ის აზრი) | რა წესი არსებობდა / რა იცვლება |
|---|---|---|---|
| 357 | A-ს code-reviewer-მა B-ის sketch-ზე განუჩინებელი Medium იპოვა: StudioWorkspace-ის remount-ისას status-ის ტექსტის რიგი (`a-round-357.md` l.3; C-R357-01). 358-ში გასწორდა; 358-მა ძველი, HEAD-ზეც არსებული C-R358-01 იპოვა (tempo/grid remount-ზე იკარგება) → 359. `c-round-357.json`-ში `browserVerified` false-ია: C-მა L22-ის მოკლე გზა გაიარა (STOP diff-ით), feature row-ები არ გაუშვია (`c-round-357.md` l.1–3). | sketch-მა ქცევა გამოტოვა. inference: L51-ის (status clobber row) გამოტოვებაც. | L51 და L58 უკვე არსებობდა — **არ იქნა გამოყენებული**. ახალი წესი არ ემატება. |
| 363 | `perf/lib/report.test.ts`-ის DC-KINDS regex-მა ახალი drag-ის ტიპი არ იცოდა, perf/lib კი grant-ში არ იყო; A-მ STOP-ი docs-მდე გააკეთა (C-R363-01, C-R363-02). | **სხვა კლასი:** pre-check-ის დაფარვის / grant-ის ხარვეზი. `test:run` perf/lib-ს არ მოიცავს (GATE304-M1), ამიტომ B-ის full-suite log სრული ჩანდა და არ იყო. | **L30 იცვლება** (§10): ყველა სატესტო root-ის pre-run, საკუთარი config-ით. |
| 367 | A-ს reviewer-მა v2 sketch-ზე იპოვა dedup × cancel ურთიერთქმედება (C-R367-DEDUP-CANCELLED-WRITE). ფაქტი: `b-round-366/sketch-review.md` l.3 dispatched sha-ს (`66ce5455…`) ასახელებს, l.5 კი მიმოხილულ v1-ს (`18a264e6`). 368 PASS, მაგრამ A-მ კიდევ ერთი გამოტოვებული რიგი იპოვა (A-R368-REVIEW-L1: hit 200 → hit 404 → შეერთებული 200), რამაც `b-round-367/sketch-review.md`-ის ცხრილის მტკიცება გააბათილა (Low, D-29z1211). | sketch-მა ქცევა გამოტოვა; L58-ის sha-ს პუნქტი ქაღალდზე შესრულდა, შინაარსით — არა. | **L58 იცვლება** (§10): მიმოხილული sha = dispatched sha; ordering-კონტრაქტზე event × event მატრიცა. |

- **361-ის STOP** (TG1/UC1-ის ტაიმინგი 5 s-ის > 50 %, L11) C PASS-ით დასრულდა; FAIL არ ყოფილა. **inference:** L31-ის headroom-ის წესმა იმუშავა, როგორც დაწერილია.
- **ზოგადი სურათი:** ორ ფანჯარაში ზედიზედ (350, 351, 357, 363, 367) ყველა FAIL B-ის წარმოშობისაა. ხუთიდან ოთხში (350, 351, 357, 367) წესი არსებობდა, მაგრამ შინაარსით არ შესრულდა. ამიტომ ახალი ცვლილებებიც შემოწმებადი არტეფაქტებია (sha-ს ტოლობა, n² უჯრა), არა ახალი პროზა.

## 4. Findings-ის კლასიფიკაცია (`data/classify.txt`; regex-კატეგორიები retro 353-ისაა)
- **open_findings, ფანჯრის ID-ები:** 30 (C 7, gate 7, A 12, B 4); severity: Medium 1, Low 22, info 7. კატეგორია: uncategorised 10, tests/harness 5, keyboard 5, timing/audio 3, layout/visual 2, docs/process 2, copy 1, a11y 1, focus 1.
- **deferred_low_polish, ფანჯრის ID-ები:** 39 (A 28, gate 5, B 3, C 3), ყველა Low. კატეგორია: docs/process 13, uncategorised 8, tests/harness 7, timing/audio 4, keyboard 3, focus 2, copy 1, a11y 1.
- **ჯამში (before-ასლი):** `deferred_low_polish` 678, `open_findings` 1049; `awaiting_user` 95 ID (`awaiting-user.txt`).
- **ფესვური მიზეზები (inference, B):** ფანჯრის Low-ების უმეტესობა A-ს code-reviewer-იდანაა და ორ რეგიონშია: stem-cache-ის ჩაწერის კოორდინაცია (9 Low, §11) და perf-spec-ის/დოკის ტექსტი. „regression from an unrelated change“ ერთია: C-R358-01 (HEAD-ზეც არსებობდა, ფანჯარაზე ადრე შეტანილი).
- **gate review-ები** (`gate-reviews.txt`): 12 review.md, critical 0; სკრიპტმა 13 დანომრილი suggestion დაითვალა (356: 4, 358: 3, 366: 6). **შეზღუდვა:** სკრიპტი მხოლოდ `### Findings/Suggestions` სათაურებს კითხულობს; 368-ის review „**Findings, ranked**“ ფორმითაა და ხელით დაითვალა: 3 Low + 2 info (D-29z1211). სხვა review-ები ხელით არ გადამითვლია.

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **357:** უკეთესი spec — L51-ის clobber row status-ის ჩაწერაზე remount-ისას (წესი არსებობდა).
- **363:** B-ის pre-check perf/lib-ის scratch-config-ით (ახალი L30 clause). A-ს self-check-ს ვერ დაიჭერდა: ფაილი grant-ის გარეთ იყო.
- **367 / A-R368-REVIEW-L1:** event × event მატრიცა sketch-review-ში (ახალი L58 clause). mutant-ები წესებს სათითაოდ ამოწმებს და ურთიერთქმედებას ვერ იჭერს (B-R367-MUTANTS-MISSED-INTERACTION; v1-ზე 13/13 წითელი იყო და მაინც 2 High ჰქონდა — B-R366-V1-SKETCH-HIGHS).
- **shared helper:** stem-cache-ის per-key მდგომარეობის მოდელი (§11) ერთად ხურავს 9 Low-ს.

## 6. Saba-ს ნაპოვნი საკითხები და ეკრანი
- **ფანჯარაში Saba-ს ახალი bug არ ყოფილა** (`backlog-before-369.json`-ში SABA-B-1…11 მხოლოდ; ახალი ID არ არის). ამიტომ „Why we missed it“-ის ახალი ჩანაწერი და ახალი lesson ამ კლასში არ არის.
- **ეკრანი და გზა:** `user-review/screen-review-369.md`. row-ები 138/168/118/144 = retro 353; `laneErrors` none; გზა `/studio-lab?preview=middle-east`-ზე, Play-ის შემდეგ ≥ 00:01.000. **ახალი კანდიდატი არ არის.** `product-designer` (აზრი): SR-353-1…5 ისევ მართებულია (2 და 5 მხოლოდ 1440-ზე); SR-353-4 SR-290-1/2-ის დუბლიკატია.

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
- **363-ის კლასი.** B-ის თავდაპირველი ფორმულა იყო „სამივე FAIL — sketch-მა ქცევა გამოტოვა“. `tech-lead`-მა (აზრი) 363 ცალკე კლასად გამოყო (pre-check-ის დაფარვა). B დაეთანხმა; §3 ასე წერს.
- **lesson-ის ადგილი.** B-მა pre-run-ის წესი L23-ში შესთავაზა; `tech-lead`-მა L30 ურჩია, რადგან L23 5058 byte-ია და RC-R305-ის 5500-იან ზღვართან ახლოსაა. B დაეთანხმა.
- **სისტემური ამოცანა stem-cache-ზე.** gate-368-ის reviewer-ის აზრი: გაყოფა მხოლოდ მეოთხე ცვლილებაზე. `tech-lead`-ის აზრი: Low-ების სათითაოდ გასწორება თავისთავად მეოთხე ცვლილებაა; ორმა ციკლმა ზედიზედ ახალი რიგი იპოვა, ანუ დიზაინი არ კონვერგირებს. **B-ის გადაწყვეტილება:** ერთი სისტემური ამოცანა რიგში დგება (§11), მაგრამ root-ის არქიტექტურული checkpoint-ის (ARCH-CHECKPOINT-PERF9-STEM-CACHE) პასუხით: „არა ახლა“ → Low-ები `deferred_low_polish`-ში რჩება. checkpoint-ის მოლოდინი დამოუკიდებელ PERF-11-ს არ აჩერებს.
- **A-R368-REVIEW-L1-ის სიმძიმე** (D-29z1211): Low. C-R367-ისგან განსხვავებით (StrictMode + abort, ჩვეულებრივი გამოყენება) აქ საჭიროა სერვერმა ერთი სტატიკური ბილიკისთვის 200 → 404 → 200 უპასუხოს ერთი ჩაწერის ფანჯარაში (deploy race); შედეგი — ერთი დაკარგული cache ჩანაწერი, შემდეგ ჩატვირთვაზე აღდგება.

## 8. ღია კანდიდატების ბედი (`retro_candidates`, before-ასლი; inventory: `b-round-368/retro369-mentions.py` → `data/retro369-mentions.txt`, `data/retro369-mention-ids.txt`, 36 hit / 33 id, D-29z1217)
| ID | გადაწყვეტილება (D-29z1213) |
|---|---|
| RC-R305-LESSON-CHAR-CAP | watch → RETRO 384. L23 5058, L58 2931 → 3430 byte (ზღვარი 5500). |
| RC-R333-STALE-DERIVED-MUTANT | retired: მეორე შემთხვევა 353–368-ში არ არის (`fails-detail.txt`; C-R359-01 სხვა კლასია — browser row, რომელიც mutant-ს ვერ ასხვავებს). ხელახლა გაიხსნება მეორე შემთხვევაზე. |
| RC-R336-SCRIPT-OUTPUT-DIR | applied: retro 369-ის სკრიპტები default-ად `b-round-368/data/`-ში წერენ; C მაინც ასლს უშვებს `c-round-369/scripts/`-ში. |
| RC-R344-PROD-NAME-PROBES | applied in practice: 365–368-ში C-ის probe-ები production build-ზე გაეშვა (`remix-serve`, c-round-366…368). |
| RC-R297-SCRATCH-CACHEDIR, RC-R297-JSDOM-SSR-MUTANT | retired: სტატუსი არასდროს ჰქონიათ; მეორე შემთხვევა 353–368-ის `fails-detail.txt`-ში არ არის (ადრეული ფანჯრები B-ს ხელახლა არ შეუმოწმებია). |
| B-R365-COUNT-CLAIM-PLANNING-VS-FINAL | 1×; L56-ის count-ის წესი უკვე ფარავს (count ასახელებს ფაილს). watch → RETRO 384. |
| B-R363-PRECHECK-PERFLIB (RETRO 368-ის input, D-29z1185, D-29z1189; backlog-ში ობიექტი არ ჰქონდა) | adopted: L30-ის RETRO 369 clause; ობიექტი შეიქმნა და დაიხურა (D-29z1217). |
| B-R366-SKETCH-MEDIUMS-UNRULED, B-R366-V1-SKETCH-HIGHS, B-R367-FINAL-SKETCH-UNREVIEWED, B-R367-MUTANTS-MISSED-INTERACTION | adopted: L58-ის RETRO 369 clause (§10). |
| EXP-R321 მემკვიდრე | retro 353-ის პირობა („≈ 5 ზედიზედ სრული L57 JSON ახალ ექსპერიმენტამდე“) შესრულდა: 16/16. ახალ ექსპერიმენტს B არ ხსნის; §9-ის countermetric-ები საკმარისია. |

## 9. countermetric-ები RETRO 384-სთვის
- B-ის sketch-ზე A-ს მიერ ნაპოვნი განუჩინებელი Medium+: ამ ფანჯარაში 2 / 16 (357, 367); მიზანი 0.
- B-ის წარმოშობის C FAIL: ≤ 3 / 16.
- B-ის მედიანა: $11.46 (stop line $13.94). `tech-lead`-ის აზრი: თუ FAIL-ები იზრდება და B-ის მედიანა მცირდება — L58-ის „ერთი review frozen sketch-ზე“ წესი გადაიხედოს.
- L57 checker-ის rc 0 ყოველ C JSON-ზე (ახლა 16/16).

## 10. ცვლილებები: lessons (`lessons.md`, 60 ხაზი; diff `b-round-368/lessons-diff.txt`: `3c3 19c19 41c41`)
- **l.3:** წყაროების span → `retro-369.md` (353–368) და RETRO 369-ის შენიშვნა.
- **L30 (l.19), ახალი clause:** „Every test root is pre-run“ — B-ის pre-check ყველა სატესტო root-ს უშვებს, რომელიც ცვლილებამ შეიძლება დაარღვიოს, საკუთარი config-ით, თუ `test:run` მას არ მოიცავს; grant-ის გარეთ წითელი ფაილი ან grant-ში შედის, ან item იცვლება. Evidence: C-R363-01 (1×). 407 → 750 byte. (`tech-lead`)
- **L58 (l.41), ახალი clause:** „Reviewed = dispatched; ordering contracts get a matrix“ — ერთი review frozen sketch-ზე; მიმოხილული sha = dispatched; შემდგომი ცვლილება — delta re-review ორივე sha-თი; concurrency/ordering-კონტრაქტზე event-kind × event-kind მატრიცა, თითო უჯრა row ID ან განჩინებული გამორიცხვა, C ითვლის n² უჯრას. Evidence: B-R367-FINAL-SKETCH-UNREVIEWED, A-R368-REVIEW-L1 (2×). ბაიტის ასანაზღაურებლად ძველი evidence-ის ფრჩხილები შემოკლდა; **არცერთი evidence ID არ წაშლილა** (ID-ების set-ის შედარება: დაკარგული 0). 2931 → 3430 byte. (`tech-lead`) byte-ების ისტორია: RETRO 353-ის შემდეგ 2908, D-29z1136-ის შემდეგ 2931 (C-R353-01-ის გასწორებამ „fixed in the sketch or ruled“ დააბრუნა), ახლა 3430.

## 11. სისტემური ამოცანა
**SYS-R369-STEM-CACHE-WRITE-COORDINATOR** (D-29z1215; `systemic_tasks`):
- **ხურავს:** A-R367-REVIEW-L-c, -L-d, -L-e, -L-g, B-R367-TL3-1-JOIN-MICROTASK-GAP, A-R368-REVIEW-L1, A-R368-REVIEW-L3, GATE368-L1-REMOVEFILE-SAME-NAME, GATE368-L3-QUEUED-BUFFER-RETENTION (9).
- **ფარგლები (`tech-lead`-ის აზრი):** ცხადი per-key მდგომარეობის მოდელი (idle / reading / committing / deleting), L58-ის event × event მატრიცა row-ებად; SC1–SC33 უცვლელი და მწვანე; საჯარო ზედაპირი `{ fetchSource, idle }` უცვლელი. ფაილები: `stem-cache.client.ts`, მისი ტესტი, doc 236 (ან ახალი doc).
- **პირობა:** root-ის ARCH-CHECKPOINT-PERF9-STEM-CACHE-ის პასუხი (`b-round-368/root-request-arch-checkpoint.md`). „extract“ ან „keep, fix the Lows“ → ამოცანა დგება REGRESSION-ის შემდეგ და PERF-11-მდე. „not now“ ან პასუხი არ არის, როცა რიგი მოვა → PERF-11 იწყება, Low-ები `deferred_low_polish`-ში რჩება.

## 12. Saba-სთვის და root-ისთვის (წინადადებები და კითხვები; loop-ში არ სრულდება)
1. **ინფორმაცია:** ამ ფანჯარაში ეკრანზე არაფერი შეცვლილა; ახალი ეკრანის კანდიდატი არ არის. **წინადადება:** SR-353-4 შეუერთდეს SR-290-1/2-ს, რომ ერთსა და იმავეზე ორჯერ არ გკითხოთ (`screen-review-369.md`).
2. **ინფორმაცია:** 95 ID ისევ `awaiting_user`-ია (`data/awaiting-user.txt`); ამ ფანჯარაში ახალი კითხვა არ დამატებულა.
3. **root-ს (წინადადება) — ROOT-REQ-B-RETRO-CONSULTS:** RETRO რაუნდზე B-ის კონსულტაციების სიაში დაბრუნდეს `qa-engineer`, `consequence-tester`, `design-philosopher` და `first-visit-host` (retro_policy მათ ასახელებს; 2026-11-04 §6 ამბობს, რომ root საჭიროებისამებრ აბრუნებს). ორ RETRO-ზე ზედიზედ ისინი ვერ გამოვიძახე.
4. **root-ს:** ARCH-CHECKPOINT-PERF9-STEM-CACHE ახლა ვადაშია (`b-round-368/root-request-arch-checkpoint.md`, არ ბლოკავს). ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1) ისევ ღიაა — 363-ის FAIL-ის ნაწილობრივი მიზეზი (§3).
5. **წინადადება Saba-სთვის (პროექტის წესი, არ გამოიყენება დამტკიცებამდე):** არცერთი. lessons-ის ცვლილებები loop-ის შიდა ფაილშია.

## 13. შემდეგი
- round 369 = ეს RETRO (C ამოწმებს traceability-ს, ეკრანს, auth guard-ს და Studio smoke-ს).
- შემდეგ (D-29z1216): REGRESSION (პირველი დაგეგმვა 2026-11-08-ზე ან შემდეგ) → SYS-R369-STEM-CACHE-WRITE-COORDINATOR (თუ root-მა დაამტკიცა) → PERF-11 → PERF-12…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule). PERF-9c — awaiting_user; PERF-9d — root.
