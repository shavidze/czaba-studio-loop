# RETRO 416 — მეთხუთმეტე რეტროსპექტივა (რაუნდები 401–415)

**თარიღი:** 2026-11-08 · **ავტორი:** B (D-29z1445…D-29z1449) · **სტატუსი:** C ამოწმებს round 416-ში (RT-* row-ები).

**წესები:** „Retrospective: stop, look back, improve“ (Saba, 2026-10-26); „Look back on every issue Saba finds, and guard the whole screen“ (2026-10-28); RETRO-ზე გზის მიმოხილვა (2026-10-31); `backlog.json` → `retro_policy`.

**კონსულტაციები** (read-only, ორივე რეალურად გამოძახებული; მათი verdict-ები მათი აზრია და ასეა მონიშნული):
- retro-სთვის: `tech-lead` (§3, §7, §8, §9, §10, §11);
- ეკრანისა და გზისთვის: `product-designer` (`user-review/screen-review-416.md`).

`consequence-tester`, `qa-engineer`, `design-philosopher` და `first-visit-host` B-ის კონსულტაციების სიაში არ არიან (2026-11-04 §6). არ გამომიძახებია და მათი სახელით აზრი არ დამიწერია. advisor ხელმისაწვდომია და გამოყენებულია დაგეგმვის მიდგომისთვის.

**ფანჯარა:** 401–415, ანუ 15 რაუნდი. round 401 თავად RETRO იყო და ფანჯარაში შედის.

**ყველა რიცხვის წყარო** (გზები `tmp/studio-real-loop/`-ის მიმართ). სკრიპტები retro 401-ის ასლია, ფანჯრით 401–415. ისინი default-ად `b-round-415/data/`-ში წერენ. გაუშვით loop-ის root-იდან: `python3 -I b-round-415/<script>`.
- `collect.py` → `data/rounds-401-415.json`, `collect.txt`. `cost.py` → `data/cost-rows.json`, `cost.txt`. B-ის ღირებულება წანაცვლებულია: `b-round-(N−1)-result*.json` არის რაუნდ N-ის დაგეგმვა.
- ყველა მთავარი რიცხვი ერთად: `data/retro-numbers-416.txt` (ბრძანება: `b-round-415/retro-numbers.py`, ხელით გადაწერილი ამ ფანჯრისთვის).
- დანარჩენი: `fails-detail.py`, `gate-reviews.py`, `classify.py` (`classify-out.json`), `l57-coverage.py`, `exp-fields.py`, `manifest-fields.py`, `awaiting-user.py`. `misc-outputs.sh` წერს `task-titles.txt`, `stops-count.txt`, `deferred-totals.txt`, `open-medium-plus.txt`, `archived-mediums.txt` და `c-models.txt`-ს.
- **სკრიპტებში ცვლილებები retro 401-ის შემდეგ:**
  - `stops-count.txt`-ის regex ახლა გამორიცხავს „STOP: none“-ს. ძველმა regex-მა 403 ჩათვალა, თუმცა `a-round-403.md` l.3 არის „**STOP: none.**“.
  - `archived-mediums.txt`-ის ფილტრი ფანჯრის id-ებს იყენებს (C-R401-01, A-R411-REVIEW-M1, B-R411-SKETCH-M1-MISSED).
  - `l57-coverage.py`-ის სათაურის ხაზი „rounds 401-415 = 15 C JSONs“-ზე გასწორდა.
- **ახალი ამ RETRO-ში:**
  - `data/l58-sketch-review-application.txt`: რომელ დაგეგმვას ჰქონდა sketch patch და `sketch-review.md` (`ls`);
  - `tools/l58-check.py` და მისი გაშვება ფანჯრის 14 task-ზე: `data/l58-check-window.txt`;
  - `data/new-clauses-applied.txt`: retro 401-ის clause-ები task-ებში (grep);
  - `data/l57-c415.txt`: `tools/l57-check.py` `c-round-415.json`-ზე;
  - `data/saba-window.txt`: Saba-ს წარმოშობის ჩანაწერები ფანჯარაში.
  - `data/retro416-deadlines.txt` (`retro416-deadlines.py`): backlog-ის before-ასლის ყველა ჩანაწერი, რომელიც „RETRO 416“-ს ასახელებს (11 ხაზი).
- სკრიპტები კითხულობენ `b-round-415/backlog-before-416.json`-ს, backlog-ის ასლს ამ დაგეგმვის ყველა ცვლილებამდე.
- **შეზღუდვები:**
  - `classify.py` before-ასლის **ღია** ჩანაწერებს ითვლის. დახურული Medium-ები ცალკე ჩანს `archived-mediums.txt`-ში.
  - `gate-reviews.txt`-ში 402, 406, 408, 412 და 413-ის `score None` parse-ის ხარვეზია: იმ `review.md`-ებში „Score: N/10“ ხაზი არ არის.
  - **round 409-ის დაგეგმვის ღირებულება ქვედა ზღვარია:** `b-round-408-result.json` = $1.43 (მეორე მცდელობა), `b-round-408-result.json.attempt1.json` ცარიელია და მისი ღირებულება უცნობია. ამიტომ B-ის ჯამი და წილი ქვედა ზღვარია.

---

## 1. მოკლედ
- **C: PASS 13 / FAIL 2 / BLOCKED 0.** FAIL-ები: 401 და 411. `browserVerified` true 15/15-ში.
- **Gate:** published 13, skipped 2 (401: RETRO, კოდი არ შეცვლილა; 411: FAIL), failed 0.
- **ღირებულება:** $286.64 (B $192.66, A $79.92, C $14.06). B-ის წილი 67.2 % (retro 401-ში 61.6 %).
- **ორივე FAIL-ის წარმოშობა B-ია.** 401: retro-ს ტექსტი ამბობდა ცვლილებას, რომელიც ფაილში არ იყო. 411: B-ის განხილულ sketch-ს Medium ჰქონდა (generator host-ის sample rate-ზე იყო დამოკიდებული).
- **A STOP:** მხოლოდ 411.
- **Sketch-ის განხილვის წესი ერთხელ დაირღვა:** round 415 `sketch-review.md`-ის გარეშე გაიგზავნა. Round PASS-ით დასრულდა, მაგრამ წესი მაინც დაირღვა.
- **Saba-ს ნაპოვნი ბაგი ფანჯარაში არ არის.**
- **ეკრანი:** ხილული ტექსტი retro 401-ის იდენტურია. ახალი clutter არ არის.

## 2. ციფრები (`data/retro-numbers-416.txt`, `cost.txt`, `collect.txt`)
| საზომი | 401–415 | 385–400 (retro 401) |
|---|---|---|
| რაუნდი | 15 | 16 |
| C PASS / FAIL / BLOCKED | 13 / 2 / 0 | 12 / 4 / 0 |
| ჯამი | $286.64 | $294.13 |
| B / A / C | $192.66 / $79.92 / $14.06 | $181.15 / $98.51 / $14.47 |
| B-ის წილი | 67.2 % | 61.6 % |
| რაუნდის მედიანა | $18.97 | $19.16 |
| B / A / C მედიანა | $13.85 / $5.0 / $0.71 | $11.28 / $5.695 / $0.64 |
| FAIL რაუნდების ღირებულება | $37.22 (13.0 %) | $101.13 (34.4 %) |
| ჯაჭვები (FAIL + შემდეგი რაუნდი) | $76.98 (26.9 %) | $156.23 (53.1 %) |
| მხოლოდ fix-up ჯაჭვი 411–412 | $35.78 (12.5 %) | — |
| L57 ყველა ველი | 14/15 (აკლია 411) | 12/16 |
| ყველაზე ძვირი რაუნდები | 404 $28.11, 403 $26.62, 402 $26.48, 411 $22.50, 408 $20.86 | — |

- **ჯაჭვის განმარტება** retro 401-ისაა: FAIL რაუნდი + მისი შემდეგი რაუნდი. 401→402-ში 402 ძირითადად ახალი scope იყო (PERF-14b-ii) და RT-FIX-401 მხოლოდ მცირე ნაწილი. ამიტომ ცალკე ვაჩვენებ წმინდა fix-up ჯაჭვს 411→412-ს.
- **RETRO 401:** $14.72. ფანჯარაში REGRESSION არ ყოფილა.
- **Gate review-ები:** 26 დანომრილი finding 13 review-ში; critical 0 ყველგან (`gate-reviews.txt`).

## 3. FAIL-ები: რატომ და რომელი წესი აიცილებდა (`data/fails-detail.txt`, `stops-count.txt`, `l58-check-window.txt`)
| რაუნდი | რა მოხდა (წყარო) | წარმოშობა | ძირეული მიზეზი (`tech-lead`-ის აზრი) | წესი |
|---|---|---|---|---|
| 401 | C-R401-01 (Low): retro-401 §10 ამბობდა, რომ l.3-ის pointer შეიცვალა; ფაილში მხოლოდ ერთი წინადადება დაემატა (`c-round-401.json`) | B (C-ის tag-ი) | B-მ §10 დაწერა იმით, რისი გაკეთებაც უნდოდა, და არა l.3-ის შენახული diff-ით | L56-ის ახალი clause |
| 411 | A STOP A-R411-REVIEW-M1-ზე (Medium): `generate-demo-peaks.mjs` `new AudioContext()` host-ის rate-ით, PS17 44100-ს hardcode-ავდა (`a-round-411.md` l.3, `c-round-411.md`) | **B spec** (re-tag; C-ს origin არ ჰქონდა) | sketch review-მ ლოგიკა შეამოწმა, მაგრამ არ იკითხა „რას წყვეტს host?“ (`b-round-410/sketch-review.md` v5 APPROVE) | L58-ის host-independence clause |
| 415 (FAIL არ არის) | `b-round-414/sketch-415.patch.txt` გაიგზავნა `sketch-review.md`-ის გარეშე; `tech-lead`-ის design review მხოლოდ prose-ად არის `b-round-414.md`-ში | B | წესი (L58, RETRO 401) არსებობდა, მაგრამ `[K#]` claim არ დაიწერა, ამიტომ ვერაფერი ჩავარდებოდა | `tools/l58-check.py` claims-ში |

- **საერთო ნიმუში (`tech-lead`):** ნაწილობრივ. 401 და 415 ზუსტად „B-ის განცხადება ≠ B-ის artifact“ კლასია. 411 სხვა კლასია: review-მ host-ზე დამოკიდებულება ვერ დაინახა. ორივე ცალ-ცალკე lesson-ად ჩაიწერა, რომ host-ის გაკვეთილი არ დაიკარგოს.
- **`l58-check.py` ფანჯარაზე** (`data/l58-check-window.txt`): rc 0 = 403–414 (12). rc 1 = 402 (review არსებობს, მაგრამ sha `**`-ით არის გაყოფილი: მხოლოდ ფორმატი) და 415 (review არ არსებობს).
- **STOP-ები:** მხოლოდ 411 (`stops-count.txt`).
- **C-ის ხარჯი FAIL-ებში:** 401 $1.07, 411 $0.52 (`cost.txt`). 411-ში C-მ L22-ის მოკლე გზა სწორად გამოიყენა, მაგრამ JSON-ში L57-ის ველები და `origin` გამოტოვა (`l57-coverage.txt`).

## 4. Findings-ის კლასიფიკაცია (`data/classify.txt`; regex-კატეგორიები retro 353-ისაა)
| სია | ფანჯარაში | წარმოშობა | severity |
|---|---|---|---|
| `open_findings` (ღია) | 22 | A 11, gate reviewer 7, B 3, C 1 | low 19, info 3 |
| `deferred_low_polish` | 40 | A 23, gate reviewer 13, B 3, C 1 | low 40 |

- ორივე სია ერთმანეთს ფარავს: ერთი Low ხშირად ორივეშია.
- **კატეგორიები (`deferred_low_polish`, ფანჯარა):** uncategorised 14, layout/visual 5, timing/audio 5, docs/process 4, keyboard 4, focus 3, tests/harness 3, copy/i18n 2.
- **დახურული Medium-ები ფანჯარაში** (`archived-mediums.txt`): A-R411-REVIEW-M1, დაიხურა C round 412-ით (D-29z1436). C-R401-01 Low-ია და დაიხურა C round 402-ით (D-29z1382).
- **ღია Medium+** (`open-medium-plus.txt`): ყველა ძველია და root-ის, manual-ის ან `awaiting_user`-ის სტატუსშია (A-R73-SAFARI-FLAG-FOCUS, GATE232-S2, GATE271-S1-NO-REALIGN, GATE274-S1-HELD-REPEAT-ANNOUNCE, GATE304-M1-PERF-LIB-NOT-IN-GATE); ფანჯარაში ახალი არ არის.
- **ჯამები** (`deferred-totals.txt`): `deferred_low_polish` 830, `open_findings` 1139.

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **C-R401-01:** B-ის self-check — ტექსტი diff-იდან (L56).
- **A-R411-REVIEW-M1:** უკეთესი sketch review — host-ის შეკითხვა (L58). A-ს reviewer-მა იპოვა, ანუ A-ს self-check-მა იმუშავა და round 411-ის STOP სწორი იყო.
- **415 review-ის გარეშე:** checker script (`tools/l58-check.py`), არა ახალი ტექსტი.
- **TL-R413-I1** (B-ის scratch commit-ში მოხვდა reviewer-ის mutant): პროცესის წესი — reviewer-ები ასლზე მუშაობენ (L38).
- **Shared helper:** ფანჯარაში ორი shared helper უკვე გაკეთდა (SYS-R2-FAKE-FIDELITY 414, SYS-R388 415). preview controller-ის 7 Low ერთ მიზეზს იზიარებს: SYS-R416-PREVIEW-CONTROLLER (§11).
- **retro 401-ის clause-ების გამოყენება** (`new-clauses-applied.txt`): `sketch-review.md` ნახსენებია 13/14 task-ში (402–414); 415-ში — არა. „degraded state × gesture“ ტექსტურად 0-ჯერ, მაგრამ 411-ის WAVEFORM-BEFORE-READY row-მა ზუსტად ეს შეამოწმა (დაჭერილი waveform-ზე click: `middleEastBegins 0`, `c-round-411.md`).

## 6. Saba-ს ნაპოვნი საკითხები და ეკრანი
- **Saba-ს ნაპოვნი ბაგი ფანჯარაში არ არის** (`data/saba-window.txt`: 2 ჩანაწერი, ორივე Saba-სთვის დასმული კითხვაა — SABA-Q-PERF14C-PYRAMID-CANVAS, SABA-Q-UNUSED-LEAF-WRAPPERS — და არა მისი ნაპოვნი ბაგი). ამიტომ „Why we missed it“-ის ახალი ანალიზი არ არის.
- **ეკრანი** (`user-review/screen-review-416.md`): ხილული ტექსტი 138/168/118/144, timeline-ის გარეთ 97/124/86/101 — retro 401-ის იდენტური. ერთადერთი სხვაობა (DOM-ში 3 clip 4-ის ნაცვლად) round 402-ის virtualization-ია და `melody-probe.json` ადასტურებს.
- **გზა:** მთავარი ხარვეზი ისევ STEM-LANES-ია (`product-designer`). ახალი კითხვა: SR-416-1.

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
- **L38 vs L58:** B-მ „reviewer-ები ასლზე მუშაობენ“ L58-ში შესთავაზა; `tech-lead`-მა L38-ში გადატანა ურჩია (ეს concurrency-ის საკითხია, არა asserted number-ის). B დაეთანხმა.
- **L57-ის origin:** B-მ ახალი მნიშვნელობა „B sketch“ შესთავაზა; `tech-lead`-მა არსებული „B spec“ ურჩია. B დაეთანხმა.
- **402-ის sha ფორმატი:** checker მას rc 1-ად თვლის. B-ის გადაწყვეტილება: 402 დარღვევად არ ითვლება (review არსებობდა და sha ტექსტში ჩანს), მაგრამ checker-ის წესი (sha უწყვეტად) მომავალში მოქმედებს.
- **411-ის origin:** C-ის JSON-ში origin არ იყო. B-მ „B spec“ მიანიჭა (D-29z1449) ახალი L57 clause-ის მიხედვით.

## 8. ღია კანდიდატებისა და ვადების ბედი (L46; `data/retro416-deadlines.txt`)
- **ARCH-CHECKPOINT-PREVIEW-AFTER-13C:** root-ის პასუხი არ არის (round 396-იდან). ჩაწერილი default მოქმედებს (D-29z1447): **SYS-R416-PREVIEW-CONTROLLER**, ერთი შეზღუდული რაუნდი, SYS-CLOCK-DETERMINISM-ის შემდეგ (`tech-lead`). თუ root dispatch-მდე უპასუხებს, მისი პასუხი უპირატესია.
- **TLM-PERF15-FIREFOX:** ვადა RETRO 416 იყო. Firefox runner-ზე ისევ არ არის (ROOT-REQ-PLAYWRIGHT-FIREFOX). L46-ის მიხედვით ერთი კითხვა მიდის Saba-სთან (§12); ახალი ვადა RETRO 431.
- **RC-R305-LESSON-CHAR-CAP:** L23 5058, L58 4988 bytes (trigger 5500). watch გრძელდება RETRO 431-მდე.
- **RC-R401-ORIGIN-RETAG:** გააქტიურდა (411-ში origin არ იყო, მიზეზი sketch-ში იყო) → L57-ის origin clause (adopted).
- **B-R411-SKETCH-M1-MISSED, TL-R413-I1:** retro-ს input-ებია; დამუშავდა (L58, L38) და დაიხურა.
- **Q-SR-385-1:** ისევ ღიაა (Saba).

## 9. countermetric-ები: retro 401-ის მიზნები → შედეგი
| საზომი | მიზანი | შედეგი | სტატუსი |
|---|---|---|---|
| A STOP, რომელიც C-მდე მივიდა | ≤ 1 | 1 (411) | შესრულდა |
| sketch `sketch-review.md`-ის გარეშე | 0 | 1/14 (415) | ვერ შესრულდა |
| B sketch-ზე A-ს ნაპოვნი unruled Medium+ | 0 | 1 (411) | ვერ შესრულდა |
| B-ის წარმოშობის C FAIL | ≤ 1 | 2 (401, 411) | ვერ შესრულდა |
| L57 ყველა ველი | 15/15 | 14/15 | ვერ შესრულდა |
| ჯაჭვების წილი | < 30 % | 26.9 % (წმინდა fix-up 12.5 %) | შესრულდა |
| B მედიანა | — | $13.85 (იყო $11.28) | გაიზარდა |
| L23 / L58 | < 5500 | 5058 / 4988 | შესრულდა |
| ARCH-CHECKPOINT-PREVIEW-AFTER-13C | პასუხი ან default | default დაიგეგმა | შესრულდა |

**RETRO 431-ის მიზნები (`tech-lead`-ის აზრი):** sketch უვალიდო `l58-check`-ით = 0; ყველა C ბაგს `origin` აქვს და L57-ის ველები 15/15, მოკლე FAIL-ების ჩათვლით; ტექსტი, რომელიც ფაილის diff-ს არ ემთხვევა = 0; B-ის წარმოშობის C FAIL ≤ 1; A STOP C-მდე ≤ 1; წმინდა fix-up ჯაჭვი < 15 %. **countermetric-ები**, რომ ახალი წესები ხარჯს არ ზრდიდეს: B მედიანა ≤ $14.50, B-ის წილი ≤ 65 %, L58 < 5000 bytes. ახალი host-დამოკიდებული generator ან fixture = 0 (`scripts/`-ში grep: `new AudioContext()` rate-ის გარეშე, `toLocale*`, `Math.random`).

## 10. ცვლილებები: lessons (`b-round-415/lessons-diff.txt`)
ეს სექცია `lessons-diff.txt`-იდან დაიწერა, რედაქტირების შემდეგ (L56-ის ახალი clause). diff-ის hunk-ები: `3c3`, `40,41c40,41`, `55c55`, `57,58c57,58`. ფაილი 60 ხაზია, lesson-ების id-ები უცვლელია (51).
- **l.3:** pointer `retro-401.md`/`385–400` → `retro-416.md`/`401–415`; ბოლოში ერთი წინადადება „**RETRO 416 (D-29z1446):** …“.
- **L56 (l.40):** + „A sentence that describes a file change is read from that file“ (C-R401-01).
- **L58 (l.41):** + „Host-independent artifacts; the review is checked“ (A-R411-REVIEW-M1, round 415, `tools/l58-check.py`). 4988 bytes.
- **L22 (l.55):** + „A short FAIL is still a full JSON“ (`c-round-411.json`).
- **L38 (l.57):** + „Reviewers work on a copy“ (TL-R413-I1).
- **L57 (l.58):** + „Origin“ (RC-R401-ORIGIN-RETAG).
- ხუთივე lesson-ის ძველი ტექსტი ბაიტ-ბაიტ prefix-ად რჩება; თითოეულს ერთი clause ემატება. ყველა `tech-lead`-ის მიერ endorse-ებულია (§7-ის ორი ცვლილებით).

## 11. სისტემური ამოცანა
**SYS-R416-PREVIEW-CONTROLLER** (D-29z1447, ARCH-CHECKPOINT-PREVIEW-AFTER-13C-ის L46 default). შვიდი deferred Low ერთ მიზეზს იზიარებს: library preview controller-ში supersession sourceId-ით ხდება და handler-ები start-ს სინქრონულად იძახებენ.
- **ხურავს:** GATE393-L3-FALLBACK-REENTRY, A-R394-REVIEW-L3-REENTRANT-SYNC-THROW, A-R395-REVIEW-L1-SEEK-REENTRANT, GATE395-L1-CURRENTTIME-READ, A-R392-REVIEW-L2-STALE-CALL-STOPS-PREVIEW, A-R392-REVIEW-L3-SUPERSESSION-BY-ID, A-R393-REVIEW-L3-URL-SWITCH-ROWS.
- **Scope (`tech-lead`-ის აზრი):** per-request token sourceId-ის ნაცვლად; media-error და seek handler-ებიდან start-ის სინქრონული გამოძახება არა; `currentTime` ერთხელ თითო tick-ზე; public hook surface უცვლელი; L58-ის event × event matrix row-ებად.
- **ადგილი:** SYS-CLOCK-DETERMINISM-ის შემდეგ (deterministic clock-ით GATE395-L1 და seek-ის row-ები wallclock-ის გარეშე გაიზომება), SYS-R369-სა და STEM-LANES-მდე.
- **ზომა:** ერთი რაუნდი; ორად იყოფა, თუ matrix sketch-ზე ~20 row-ს აჭარბებს.
- A-R415-REVIEW-L1-CALLSITE-FLAG (SF11-ის flag) SYS-CLOCK-DETERMINISM-ის `may_close`-ში დაემატა, რადგან SF11-ის clock იქ იცვლება.

## 12. Saba-სთვის და root-ისთვის (წინადადებები და კითხვები; loop-ში არ სრულდება)
- **კითხვა Saba-ს (TLM-PERF15-FIREFOX, L46):** Firefox-ში `/studio-lab` demo MP3-ით, სანამ ჩაიტვირთება — ემთხვევა თუ არა precomputed peaks Chromium-ს, თუ სუფთად გადადის fallback-ზე? Cloud runner-ზე Firefox არ არის. შეგიძლია გაუშვა შენს კომპიუტერზე, ან root დააყენოს Playwright Firefox (ROOT-REQ-PLAYWRIGHT-FIREFOX)? ახალი ვადა RETRO 431.
- **კითხვა Saba-ს (SR-416-1):** იხ. `screen-review-416.md` §2.
- **root-ისთვის:** ARCH-CHECKPOINT-PREVIEW-AFTER-13C-ის default დაიგეგმა. თუ frontend-architect-ის checkpoint მაინც გსურს, SYS-R416-ის dispatch-მდე უპასუხე. ARCH-CHECKPOINT-DECODE-REGION ისევ ღიაა.
- **root-ისთვის, ინფორმაცია:** gate review-ებს 402, 406, 408, 412, 413-ში „Score“ ხაზი არ აქვს.
- **პროექტის წესებში ცვლილება არ არის შემოთავაზებული.** `tools/l58-check.py` loop-ის ინსტრუმენტია და store-ის წესებს არ ცვლის.

## 13. შემდეგი
1. REGRESSION-2026-11-10, თუ შემდეგ დაგეგმვაზე თარიღი ≥ 2026-11-10.
2. SYS-CLOCK-DETERMINISM (ხურავს A-R388-REVIEW-L4-ს და შეიძლება A-R415-REVIEW-L1-იც).
3. SYS-R416-PREVIEW-CONTROLLER.
4. SYS-R369 (მხოლოდ root-ის checkpoint-ის პასუხით; სხვაგვარად გამოიტოვება).
5. STEM-LANES.
6. SYS-1…3.
7. STORE-2b…5 (direction A 2026-10-25-ს გადაწყდა; მხოლოდ რიგით არის შეჩერებული).
8. REVIEW-RECOMMENDATIONS, შემდეგ T12-ADVANCED.
9. Phase 2, skip rule-ით.

შემდეგი RETRO: round 431 ან STUDIO-PERFORMANCE-ის დასრულებისას, რომელიც უფრო ადრე მოვა.
