# RETRO 420 — მეთექვსმეტე რეტროსპექტივა (რაუნდები 416–419)

**ავტორი:** B, round 419 → 420 დაგეგმვისას, 2026-11-09. **D-ID:** D-29z1465. **master:** `6609dfa` (gate 419 published).
**კონსულტაციები:** `tech-lead` (რეალურად გამოძახებული; პასუხი: `b-round-419/consult-tech-lead.md`), `product-designer` (ეკრანი და გზა; `b-round-419/consult-product-designer.md`), advisor (დაგეგმვის მიდგომა). `qa-engineer` და `consequence-tester` B-ის კონსულტაციების სიაში არ არიან (2026-11-04 §6) და არ გამომიძახებია.
**რატომ ახლა:** Saba-ს წესი (2026-10-26) — RETRO ყოველ 15 რაუნდში **და** ყოველი queue entry-ის ბოლოს, რომელიც ადრე მოვა. 419-ით STUDIO-PERFORMANCE-ს loop-ში გასაშვები ეტაპი აღარ დარჩა (§8). ფანჯარა მხოლოდ 4 რაუნდია, ამიტომ ყოველი ციფრი ჰიპოთეზაა; მხოლოდ ამ მონაცემებით წესი არ იცვლება (`tech-lead`, პუნქტი 1).

**მონაცემები:** `b-round-419/*.py` (retro 416-ის სკრიპტების ასლები, შეცვლილია მხოლოდ ფანჯარა და გზები) გაეშვა `b-round-419/backlog-before-420.json`-ზე; შედეგები `b-round-419/data/`-შია.

## 1. მოკლედ
- 4 რაუნდი, 4 C PASS, 0 FAIL, `browserVerified` 4/4 (`data/collect.txt`).
- ხარჯი $63.35: B $45.81, A $14.77, C $2.77 (`data/cost.txt`).
- C-მ 6 Low იპოვა, Medium+ — 0 (`data/fails-detail.txt`). A STOP — 0 (`data/stops-count.txt`).
- STUDIO-PERFORMANCE loop-ში დასრულდა; დარჩენილი ნაწილები Saba-ს, root-ის, backend-ის ან Tech Lead-ის ხელშია (§8).
- ეკრანი 416-თან შედარებით არ შეცვლილა; F2 (stems ერთმანეთის მიყოლებით) ისევ მეორდება და STEM-LANES-ს ეკუთვნის (`user-review/screen-review-420.md`).

## 2. ციფრები (`data/cost.txt`, `data/collect.txt`)
| რაუნდი | შინაარსი | B | A | C | ჯამი | C | gate |
|---|---|---|---|---|---|---|---|
| 416 | RETRO 416 | 11.66 | 0.55 | 0.85 | 13.06 | PASS | skipped (source არ შეცვლილა) |
| 417 | SYS-CLOCK-DETERMINISM (test-only) | 9.00 | 5.60 | 0.72 | 15.32 | PASS | published `061068d` |
| 418 | SYS-R416-PREVIEW-CONTROLLER | 13.34 | 5.35 | 0.58 | 19.27 | PASS | published `3579fcc` |
| 419 | SYS-R369-STEM-CACHE-WRITE-COORDINATOR | 11.81 | 3.27 | 0.62 | 15.70 | PASS | published `6609dfa` |

B-ის სვეტი round N-ის დაგეგმვაა (`b-round-(N-1)-result*.json`). მედიანა: რაუნდი $15.51, B $11.74. A-ს საშუალო PASS $3.69. retro 416-ის ფანჯარაში (401–415) იყო: რაუნდი $18.97, B $13.85, A PASS $5.53 (`retros/retro-416.md` §2; `tech-lead`-ის შედარება).

## 3. FAIL-ები
ფანჯარაში C FAIL და gate block არ ყოფილა. ერთადერთი gate `skipped` (416) RETRO-ა, source-ის ცვლილების გარეშე — ეს მოსალოდნელია.

## 4. Findings (`data/fails-detail.txt`, `data/manifest-fields.txt`, `data/classify.txt`)
- **C-ის 6 Low:** C-R416-CLAIMS-K22-ARCHIVE (origin: environment), C-R417-L58-SKETCH-REVIEW-MISSING (B spec), C-R417-BW5-HOIST-FRAGILE (B spec), C-R418-READTIME-STALE-START (B spec), C-R418-OFFSET-RAW-READ (pre-existing), C-R418-PC12-TITLE (B spec). ექვსივეს `origin` აქვს.
- **ფანჯარაში `deferred_low_polish`-ში დამატებული 15 Low:** A 7, C 4, gate reviewer 4. კატეგორიები: tests/harness 4, timing/audio 2, layout/visual 1, uncategorised 8.
- **`tech-lead`-ის დაკვირვება:** 15 Low ბევრად ნაკლებ განსხვავებულ პრობლემას ნიშნავს. ერთი დეფექტი ხშირად სამჯერ ფიქსირდება (A, C, TL). მაგალითად round 418-მა 8 id დაწერა 3 პრობლემაზე (A-R418-REVIEW-L1/L2/L3, C-R418 ×3, TL-R418-L2/L3). ეს §10-ის L7 clause-ს ასაბუთებს.
- **Gate review-ები (`data/gate-reviews.txt`):** 417 — 0 finding; 418 — score 8.5, 4 suggestion; 419 — score 9, 4 suggestion; Critical 0.

## 5. რას აიცილებდა უკეთესი spec, A-ს self-check ან shared helper
- **C-R417-L58-SKETCH-REVIEW-MISSING:** round 417-ის sketch `sketch-review.md`-ის გარეშე გაიგზავნა. 418-დან claims-ის K19 (`tools/l58-check.py`) ამას ამოწმებს; 418-ში და 419-ში `L58 OK`. ახალი წესი საჭირო არ არის.
- **C-R417-BW5-HOIST-FRAGILE, C-R418-READTIME-STALE-START, C-R418-PC12-TITLE:** B-ის sketch-ის row-ების სისუსტეები, ყველა Low; შემდეგ რაუნდში ერთ systemic task-ში იხურება (§11).
- **C-R416-CLAIMS-K22-ARCHIVE:** optimizer-მა დახურული finding archive-ში გადაიტანა B-ის დაგეგმვის შემდეგ; K14 ახლა archive-საც კითხულობს (D-29z1451).

## 6. Saba-ს ნაპოვნი საკითხები და ეკრანი
- ფანჯარაში Saba-ს ახალი SABA-B-* არ ყოფილა.
- **ეკრანი (`user-review/screen-review-420.md`):** მუდმივი ტექსტის ხაზები 138/168/118/144 — 416-ის იგივე. გზაზე (product page → Studio → stems → export) F2 ისევ ჩანს. ორი ახალი კანდიდატი, ორივე STEM-LANES-ისთვის: SR-420-1 (folder-ის ხაზს set-ის დამატების ნიშანი არ აქვს), SR-420-2 (1280×720-ზე group fold-ის ქვემოთ წავა).

## 7. უთანხმოებები და B-ის გადაწყვეტილებები
- **l58-check-ის საზომი:** B-ის პირველ input-ში (`consult-inputs.md`) ეს საზომი შესრულებულად ეწერა. `tech-lead`-მა შეასწორა: მიზანი 0 იყო, შედეგი 1 (417) → **ვერ შესრულდა**. §9-ში სწორი მნიშვნელობაა.
- **STEM-LANES-ის premise:** Q2 ამბობს „Stems group უკვე არსებობს“. HEAD-ზე „Stems“ track-ია და group-ი არ არის (`app/routes/studio-lab.tsx`, `createArrangement`). `product-designer` და `tech-lead` ორივე ამას ადასტურებს. B-მ ეს Saba-ს კითხვად გააგზავნა (`user-review/AGREE-STEM-LANES.md`), თვითონ არ გადაწყვიტა (L44).
- **GATE368-L3:** 418-ის ჩანაწერი ამბობდა, რომ STEM-LANES ერთდროულად ჩატვირთული stem-ების რაოდენობას გაზრდის. `tech-lead`: ეს არასწორია — mount-ის loop უკვე ყველა წყაროს ერთად ტვირთავს, add კი მზად არარსებულს უარყოფს. GATE368-L3 deferred რჩება; STEM-LANES S1 გაზომილ რაოდენობას `record` row-ად ჩაწერს.

## 8. ღია კანდიდატებისა და ვადების ბედი (L46; `data/retro420-deadlines.txt`)
- **STUDIO-PERFORMANCE:** loop-ში დასრულდა. დარჩენილი: PERF-4b, 9c, 11b, 12b, 14c-ii/iii (`awaiting_user`), PERF-9d და ROOT-REQ-* (root), PERF-4c (backend), PERF-15b-ii-b / TLM-PERF15-FIREFOX (Tech Lead record), PERF-DRAG-PREVIEW-ის „move crossing“ (კანდიდატი PERF-CAND-MASTER-GROUP-FADER-PROPS, არ დაგეგმილა). ყველას ვადა: **RETRO 435** (`tech-lead`).
- **TLM-PERF15-FIREFOX:** ვადა RETRO 431 იყო; ახლა RETRO 435. Firefox runner-ზე ისევ არ არის.
- **RC-R305-LESSON-CHAR-CAP:** L58 4988 bytes, უცვლელი (ამ RETRO-ში L58 არ შეცვლილა). watch → RETRO 435.
- **ARCH-CHECKPOINT-PERF9-STEM-CACHE:** root-ის პასუხი არ არის; L46 default (SYS-R369) შესრულდა 419-ში. ერთიანდება ახალ მოთხოვნასთან ARCH-CHECKPOINT-STEM-LANES (§12).

## 9. countermetric-ები: retro 416-ის მიზნები → შედეგი (`data/retro416-counters.txt`)
| საზომი | მიზანი | შედეგი | სტატუსი |
|---|---|---|---|
| sketch `l58-check` rc 0-ის გარეშე | 0 | 1 (417) | ვერ შესრულდა (418-დან გამოსწორდა K19-ით) |
| C ბაგებს `origin` + L57 ველები | ყველა | 4/4 რაუნდი, 6/6 ბაგი (`data/l57-coverage.txt`) | შესრულდა |
| ფაილის diff-თან შეუსაბამო ტექსტი | 0 | 0 C finding | შესრულდა |
| B-ის წარმოშობის C FAIL | ≤ 1 | 0 | შესრულდა |
| A STOP C-მდე | ≤ 1 | 0 | შესრულდა |
| წმინდა fix-up ჯაჭვი | < 15 % | 0 % | შესრულდა |
| B მედიანა | ≤ $14.50 | $11.74 | შესრულდა |
| B-ის წილი | ≤ 65 % | 72.3 % (RETRO-ს გარეშე 67.9 %) | ვერ შესრულდა |
| L58 | < 5000 bytes | 4988 | შესრულდა |
| ახალი host-დამოკიდებული generator | 0 | 0 (ერთადერთი `Math.random` hit `b-round-418/make-sketch-src.py`-ში app-ის ფაილის სახელის ტექსტია, generator არ არის) | შესრულდა |
| SYS-R416-PREVIEW-CONTROLLER | გაეშვა | 418 | შესრულდა |

**B-ის წილი:** `tech-lead`-ის ანალიზით გამოტოვება თანაფარდობითაა: B მედიანა 13.85 → 11.74, მაგრამ A 5.53 → 3.69 დაეცა, რადგან A B-ის sketch-ს ბაიტ-ბაიტ ადებს. წილის მიზანი იმ დროს დაიწერა, როცა A თვითონ წერდა კოდს. **გადაწყვეტილება (D-29z1465):** RETRO 435-იდან „B-ის წილი ≤ 65 %“ იცვლება საზომით „რაუნდის მედიანა ≤ $17.00 და B მედიანა ≤ $14.50“ (ორივე `cost.txt`-ით მოწმდება). ეს loop-ის საზომია, პროექტის წესი არ არის.

**RETRO 435-ის მიზნები:** sketch `l58-check` rc 0-ის გარეშე = 0; L57 ველები და `origin` ყველა ბაგზე; B-ის წარმოშობის C FAIL ≤ 1; A STOP C-მდე ≤ 1; წმინდა fix-up ჯაჭვი < 15 %; რაუნდის მედიანა ≤ $17.00; B მედიანა ≤ $14.50; L58 < 5000 bytes; ერთი დეფექტი = ერთი id (`confirmedBy`, §10); STEM-LANES-ის ყოველ ეტაპს „stems ერთად ჟღერს“ browser row აქვს (L55).

## 10. ცვლილებები: lessons (`b-round-419/lessons-diff.txt`)
- **l.3:** pointer → `retro-420.md`/`416–419`; ბოლოში „**RETRO 420 (D-29z1465):** L7 gains one clause (`tech-lead`).“
- **L7:** + „a confirmation is not a new id“ — C-ის ან gate-ის finding, რომელიც არსებულ A/TL id-ს ადასტურებს, იწერება `confirmedBy`-ად იმავე id-ზე (round 418: 8 id 3 პრობლემაზე).
- ფაილი ≤ 60 ხაზია; lesson-ების id-ები უცვლელია; L58 არ შეცვლილა.

## 11. სისტემური ამოცანა
**SYS-R418-PREVIEW-LIFECYCLE** (`tech-lead`). Round 418-ის Low-ებს ერთი ნამდვილი მიზეზი აქვს: preview-ის token-ი provider-ის unmount-ზე და collection-ის ცვლილებაზე არ იცვლება, `currentTime`-ის წაკითხვა დაუცველია, fallback-ის start seek-ს არ მიჰყვება.
- **ხურავს:** TL-R418-L1-UNMOUNT-NO-BUMP, GATE418-L4-FALLBACK-MICROTASK-UNMOUNT, TL-R418-L4-COLLECTION-CHANGE-PREVIEW, TL-R418-L2-READTIME-START-FALLBACK, TL-R418-L3-OFFSET-RAW-READ, A-R418-REVIEW-L1-READTIME-STALE-START, A-R418-REVIEW-L2-OFFSET-RAW-READ, A-R418-REVIEW-L3-PC12-TITLE (+ C-ის დადასტურებები C-R418-*).
- **არ ეხება:** Q-PREVIEW-STOPS-TRANSPORT (Saba-ს ელოდება) — preview timeline-ს აჩერებს თუ არა, არ იცვლება.
- **ადგილი:** REGRESSION-2026-11-10-ის შემდეგ, STEM-LANES-მდე. ის მაშინ მუშაობს, როცა AGREE-STEM-LANES პასუხს ელოდება; TL-R418-L4 (collection-ის ცვლილება) იგივე გზაა, რომელსაც STEM-LANES S3 გამოიყენებს.
- stem-cache-ის Low-ები (TL-R419-L3, L4a/b/c, A-R419-REVIEW-CR-1) deferred რჩება: ყველა „HEAD-ის იგივეა“ ან production caller არ აქვს.

## 12. Saba-სთვის და root-ისთვის (წინადადებები და კითხვები; loop-ში არ სრულდება)
- **Saba:** `user-review/AGREE-STEM-LANES.md` — Q1–Q5 (folder-ის Enter/drag, „Stems“ track → group, ერთი stem-ის ხაზი, ორი კოლექცია, ჩაუტვირთავი stem). სანამ პასუხი არ მოვა, A STEM-LANES-ს არ იწყებს; ლუპი სხვა დავალებებით გრძელდება.
- **Saba (L46):** TLM-PERF15-FIREFOX — 416-ის კითხვა ძალაშია, ვადა RETRO 435.
- **root:** `youtube-request.json` (STEM-LANES, 6 query) და transcripts; LIVE-MEAS-STEM-DROP (`live-checks.md`).
- **root:** frontend-architect checkpoint ARCH-CHECKPOINT-STEM-LANES (`b-round-419/root-request-arch-checkpoint-stem-lanes.md`): სამი კითხვა `tech-lead`-ისგან.
- **root:** STEM-LANES-ისთვის B-ის consult სიაში `design-philosopher`, `flow-sage`, `first-visit-host`-ის დაბრუნება (2026-11-04 §6 ამას ითვალისწინებს).
- **პროექტის წესებში ცვლილება არ არის შემოთავაზებული.**

## 13. შემდეგი
1. Round 420: ეს RETRO (C ამოწმებს traceability-ს; A არაფერს აკეთებს).
2. Round 421: REGRESSION-2026-11-10 (ვადა 2026-11-10).
3. SYS-R418-PREVIEW-LIFECYCLE.
4. STEM-LANES S1, თუ Saba-მ AGREE-ს უპასუხა; თუ არა — SYS-1…3, შემდეგ STORE-2b…5 (skip-while-waiting), და STEM-LANES პასუხისთანავე.
5. შემდეგი RETRO: round 435 ან queue entry-ის ბოლო.
