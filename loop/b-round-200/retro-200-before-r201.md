# RETRO 200 — პირველი რეტროსპექტივა (რაუნდები 123–199)

**თარიღი:** 2026-10-27 · **ავტორი:** B (D-29z165) · **წესი:** policy „Retrospective: stop, look back, improve“ (Saba, 2026-10-26) · **სტატუსი:** C-ის შემოწმებას ელოდება (Round 200)

**კონსულტაციები:** `tech-lead` და `consequence-tester` (read-only). `qa-engineer` B-ის ნებადართულ სიაში არ არის, ამიტომ არ გამოძახებულა; C-ს შეუძლია Round 200-ში გამოიძახოს. Advisor ხელმისაწვდომი იყო და გამოყენებულია.

**ფანჯარა:** რაუნდები 123–199 (77 რაუნდი) — ბოლო სრული რეგრესიის (Round 122) შემდეგ. ეს პირველი RETRO-ა. 1–122 რაუნდები ცალკე არ გაანალიზებულა; იქიდან მხოლოდ დღესაც ღია `deferred_low_polish` ჩანაწერები ითვლება.

**ყველა რიცხვის წყარო** (`tmp/studio-real-loop/`-ის მიმართ):
- `b-round-199/collect.py` → `rounds-123-199.json` (C-ის ვერდიქტი, ბაგები, gate, ღირებულება);
- `b-round-199/cost.py` → `cost-rows.json`. B-ის ღირებულება ერთი რაუნდით არის წანაცვლებული: `b-round-(N−1)-result.json` რაუნდ N-ის დაგეგმვაა. Round 123-ისთვის ეს `b-round-122-result.json`-ია.
- `b-round-199/fails.py` → `fails.txt`; `fails-detail.py` → `fails-detail.txt`;
- `b-round-199/classify.py` → `classify-out.json`. კატეგორია keyword-ების ევრისტიკაა და არა ხელით კლასიფიკაცია.
- `b-round-199/retro-numbers.py` → `retro-numbers.txt`;
- `b-round-199/deferred-list.py` → `deferred-list.txt`.

---

## 1. მოკლედ

- **77 რაუნდი: C PASS 63, FAIL 14.** `browserVerified=false` მხოლოდ ერთხელ იყო (Round 192: A შეჩერდა და დასამოწმებელი არაფერი იყო).
- **Gate:** გამოქვეყნდა 59, skipped 18. მათგან 14 იყო C FAIL-ის შემდეგ, ხოლო 4 (123–126) review-რაუნდი, რომელშიც source არ შეცვლილა.
- **ღირებულება:** $1635.42 = B $598.25 + A $547.08 + C $490.09. რაუნდის მედიანაა $21.12. **ყველაზე ძვირი ფაზა B-ის დაგეგმვაა.**
- **FAIL-რაუნდების ღირებულება:** $331.75, ანუ ფანჯრის ~20%.
- **მთავარი დასკვნა:**
  - 14 FAIL-იდან **11** წინასწარ დაიჭირებოდა: **7** B-ს შეეძლო dispatch-მდე (spec ან ინვენტარიზაცია: 142, 143, 145, 151, 192, 193, 194), ხოლო **4** A-ს handover-მდე (self-check: 127, 154, 158, 178). დანარჩენი 3-დან 2 არ გაზომილი კონტრასტია (149, 196), 1 კი first-visit მდგომარეობა (189). დაყოფა §3-შია.
  - პროდუქტის ქცევის ნამდვილი რეგრესია ცოტაა. ორი სამდღიანი რეგრესიის რაუნდი (122, 199) ორივე PASS-ით დასრულდა, 0 რეგრესიით.

## 2. ციფრები

| საზომი | მნიშვნელობა | წყარო |
|---|---|---|
| რაუნდები | 77 (123–199) | `rounds-123-199.json` |
| C PASS / FAIL | 63 / 14 | `cost.py` stdout, `rounds-123-199.json` `c_status` |
| FAIL-რაუნდები | 127, 142, 143, 145, 149, 151, 154, 158, 178, 189, 192, 193, 194, 196 | `cost.py` |
| Gate published / skipped | 59 / 18 | `cost.py`; skipped-ის სია `retro-numbers.txt`-შია |
| ღირებულება B / A / C / სულ | $598.25 / $547.08 / $490.09 / $1635.42 | `cost.py` |
| FAIL-რაუნდების ღირებულება | $331.75 | `cost.py` |
| ყველაზე ძვირი რაუნდები | 191 ($42.71), 196 ($38.73), 142 ($31.64), 134 ($29.94), 197 ($29.17) | `cost.py` top5 |
| პერიოდების მიხედვით | 123–141: 19 რაუნდი, 1 FAIL, $417.79 · 142–184: 43, 8 FAIL, $865.97 · 185–199: 15, 5 FAIL, $351.66 | `cost.py` |
| C-ის `bugs[]` ჩანაწერები | low 48, medium 12. Medium-ის 12 ჩანაწერიდან 3 არის C-R196-02, გადატანილი 196→197→198-ში, ამიტომ **უნიკალური Medium 10-ია**. | `retro-numbers.txt` |
| Critical / High | 0 / 0 | იგივე |
| `deferred_low_polish` | ანალიზისას 274 ჩანაწერი იყო: 10 closed/folded, 264 ღია ან მოლოდინში (`retro-numbers.txt`). შემდეგ ამ დაგეგმვამ დაამატა RETRO200-CLASS-SELECTORS (SYS-1), ამიტომ `retro-numbers.py`-ის ხელახლა გაშვება ახლა **275 / 10 / 265**-ს აჩვენებს. | `retro-numbers.txt`; `update-backlog-2.py` |
| გადადებული Low ფანჯარაში (123–199) | 99: gate reviewer 43, C 38, A 17, B 1 | `classify-out.json` |
| გადადებული Low, სულ, წარმომავლობით | gate reviewer 110, C 53, A 45, root 33, სხვა 26, user/review 6, B 1 (ანალიზისას; RETRO200-CLASS-SELECTORS-ის დამატების შემდეგ `classify.py` „სხვა“-ში 27-ს აჩვენებს, ფანჯრის 99 უცვლელია) | `classify-out.json` |

**ღირებულების შენიშვნები:**
- C-ის ღირებულება Fable advisor-საც მოიცავს (`*-result.json` → `modelUsage`).
- C-ს აქვს ფიქსირებული ფასი, რომელიც diff-ის ზომაზე არ არის დამოკიდებული. Round 192-ში A-მ კოდი არ შეცვალა, C-მ მაინც დახარჯა $3.22. 123–126 review-რაუნდებში A-მ დახარჯა $0.31–0.39, C-მ კი $1.51–14.48.
- `tech-lead`-მა B წანაცვლების გარეშე დაითვალა ($591). აქ ოფიციალურია წანაცვლებული რიცხვი.
- `rounds-123-199.json`-ში Round 199-ის `b_cost` 0-ია, რადგან ანალიზისას `b-round-199-result.json` (ეს დაგეგმვა) ჯერ არ არსებობდა. `collect.py`-ის ხელახლა გაშვება იქ არანულოვან რიცხვს აჩვენებს. ეს არის Round 200-ის დაგეგმვის ღირებულება, ფანჯარას არ ეკუთვნის და `cost.py`-ის ჯამებს არ ცვლის.
- `deferred-list.txt` და `classify-out.json` ხელახლა დაგენერირდა ამ დაგეგმვის სტატუსის ცვლილებების შემდეგ (`deferred-list.py`, `classify.py`).

## 3. C FAIL-ები: მიზეზი და ერთი წესი, რომელიც აიცილებდა

ყოველი მიზეზი C-ის ანგარიშიდანაა (`fails-detail.txt` / `c-round-N.json` → `bugs[].actual`). დასკვნა ცალკეა მონიშნული.

| რაუნდი | რა მოხდა (მტკიცებულება) | წარმოშობის კლასი | წესი (lessons.md) |
|---|---|---|---|
| 127 | C-R127-01: Export dialog-ში ორი „Close“ ღილაკია: frozen Modal-ის ✕ და footer. 15 granted ტესტი C-თან წითელი იყო. | A-ს self-check | L14 |
| 142 | C-R142-01: ინგლისური clipGainVideoReason 2 ხაზად გადადის. A-მ STOP გამოაცხადა, B-ს ruling არ დაუწერია. | spec (ტექსტის სიგრძე) + ruling-ის არქონა | L3, L10 |
| 143 | C-R143-01: placeholder-ის Δ (+16,0,−32,0) იგივე ტექსტის ეფექტია. A-მ STOP გამოაცხადა, მაგრამ „no written B acceptance exists“. მომხმარებლისთვის ხილული დეფექტი არ არის. | process: ruling-ის არქონა | L10 |
| 145 | C-R145-01: „▶ Playing“ უფრო გრძელია, ვიდრე „▶ ისმის“; option-ს სცდება და „▶ Play“-მდე იჭრება. | spec (ტექსტის სიგრძე) | L3, L16 |
| 149 | C-R149-1: text-accent bg-accent/30-ზე 4.32:1 · C-R149-2: brass playhead brass ზოლზე, 1.03:1 | token-ის კონტრასტი (same-token overlap) | L2, L15 |
| 151 | C-R151-1: spec-ის კონფლიქტი („R1 own-text clause“ ეწინააღმდეგება „R1 panel clause / §7“-ს) · C-R151-2: Instrument Sans-ში ` · ` ვიწროა | spec-ის კონფლიქტი + შრიფტის მეტრიკა | L4, L3 |
| 154 | C-R154-01: ახალ mono span-ს font-medium მემკვიდრეობით გადაეცა (ArrangementLane l.912) | A-ს self-check (computed style) | L12, L21 |
| 158 | C-R158-01: unlayered გლობალური transition rule (`app.css` l.305–314) Tailwind-ის `@layer utilities`-ს ჯობნის. TS1 jsdom-ში მხოლოდ class token-ს ამოწმებდა. | ტესტის ხარვეზი (cascade jsdom-ში) | L12 |
| 178 | C-R178-BADGE-SELECTOR: ტესტები badge-ს `span.border-accent`-ით ეძებდნენ, W2-მ კი ეს კლასი წაშალა. **ეს კლასი Round 147-ში უკვე იყო ჩაწერილი, როგორც გადადებული Low A-R147-REVIEW-L2.** | გადადებული Low → Medium | L8, L12 |
| 189 | C-R189-01: fresh-mode CLS 0.6158 (375) / 0.2727 (1280); seen-mode 0.0198 | first-visit მდგომარეობა არ გაზომილა. *დასკვნა:* მოითხოვდა თუ არა დავალება fresh mode-ს, `tech-lead`-მა არ იცის და არც B-ს გადაუმოწმებია. | L18 |
| 192 | A სწორად შეჩერდა K0.4-ზე, რადგან B-ის grant-ის სიას PurchaseHeader აკლდა; იმპლემენტაცია არ ყოფილა. | B-ის ინვენტარიზაცია (B-R192-PLANNING-GAP) | L1, L22 |
| 193 | C-R193-01/02: LeadMagnet-ის placeholder 3.41:1; ველების საზღვრები ~1.6 → ~1.2:1 · C-R193-03: „exactly N lines“ Biome-ის reflow-ს ეწინააღმდეგება | token-ის მომხმარებლები (B-R193-UNMEASURED-INFO) + line-count spec | L2, L15, L5 |
| 194 | C-R194-01: /support GuestForm-ის საზღვარი 1.21:1 · C-R194-02: ST8b guard false-pass-ს იძლევა, რადგან კლასი tag-იდან 14 ხაზის ქვემოთაა | B-ის ინვენტარიზაცია (B-R194-K0-SCAN-GAP) + guard-ის ხარვეზი | L1, L13, L17 |
| 196 | C-R196-01: inset ring pill-ის საზღვარს ერწყმის, 1.45:1 · C-R196-02: focus sticky strip-ის ქვეშაა; ref-შიც ასეა, ანუ ძველი პრობლემაა | ring-ის კონტრასტი მეზობელ საზღვართან + sticky chrome | L15, L19 |

**დაჯგუფება** (B-ის კლასიფიკაცია ზემოთა ცხრილიდან; თითო რაუნდი ერთ ჯგუფშია):
- spec ან ინვენტარიზაცია, რომელიც B-ს dispatch-მდე შეეძლო დაეჭირა: 142, 143, 145, 151, 192, 193, 194 (**7**);
- A-ს self-check, რომელიც ბრაუზერში ან ტესტით დაიჭირებოდა: 127, 154, 158, 178 (**4**);
- token-ის ან ring-ის კონტრასტი, რომელიც არ გაზომილა: 149, 196 (**2**);
- first-visit მდგომარეობა: 189 (**1**).

7 + 4 + 2 + 1 = 14.

**Policy-ის root-cause ტაქსონომიით** (Saba-ს ექვსი ეტიკეტი; თითო რაუნდს ერთი ძირითადი ეტიკეტი, B-ის შეფასებით):

| ეტიკეტი | რაუნდები | რაოდენობა |
|---|---|---|
| missing acceptance row | 145 (გრძელი ტექსტის მდგომარეობა), 149 (same-token კონტრასტი), 189 (fresh mode; *დასკვნა*), 193 (token-ის მომხმარებლები), 196 (ring vs მეზობელი საზღვარი) | 5 |
| ambiguous task text | 142 (ტექსტის სიგრძე + ruling-ის არქონა), 143 (STOP ruling-ის გარეშე), 151 (კონფლიქტური clause-ები) | 3 |
| missing test | 127 (granted ტესტები არ გაუშვია), 154 (computed weight), 158 (cascade მხოლოდ jsdom-ში) | 3 |
| missing shared helper / pattern | 178 (ტესტები სტილის კლასით) | 1 |
| environment / harness gap | 192 (B-ის same-line grep), 194 (B-ის scanner + ST8b guard) | 2 |
| regression from unrelated change | — | 0 |

ჯამი 14-ია. ეტიკეტის არჩევა დასკვნაა; ფაქტი მარცხენა ცხრილის „რა მოხდა“ სვეტშია.

## 4. გადადებული Low-ების წარმოშობა

- **ვინ პოულობს:** ფანჯარაში ყველაზე მეტ გადადებულ Low-ს gate reviewer პოულობს (43), შემდეგ C (38) და A (17). Gate reviewer-ის ნაპოვნის უმეტესობა test hygiene-ს ან კოდის სტილს ეხება და არა მომხმარებლის ქცევას. *დასკვნა:* ეს `deferred-list.txt`-ის სათაურების წაკითხვას ეფუძნება და ზუსტად არ დათვლილა.
- **კატეგორიები** (keyword-ების ევრისტიკა, `classify-out.json`; ფანჯრის 99 ჩანაწერი): focus 26, uncategorised 12, copy/i18n 11, layout/visual 11, a11y/announcements 11, timing/audio 10, keyboard 8, tests/harness 7, docs/process 3. ზუსტი კლასიფიკაციისთვის ხელით გადახედვაა საჭირო.
- **Root cause, რომელიც მტკიცებულებით დასტურდება:**
  1. **სტილის კლასზე მიბმული ტესტები.** ეს კლასი Round 178-ის FAIL-ად იქცა. დღესაც 5 ასეთი selector არსებობს და არცერთი არ არის ჩაწერილი (§6 SYS-1).
  2. **Held-Enter auto-repeat.** Helper არსებობს, მაგრამ ყველა ღილაკზე არ არის გამოყენებული (SYS-2).
  3. **IME `isComposing`-ის შემოწმება აპლიკაციაში არსად არის** (SYS-3).
- **Bookkeeping-ის ხარვეზი:**
  - A-R147-REVIEW-L2-BADGE-CLASS-SELECTOR Round 179-ში გასწორდა (`c-round-179.md` l.11), მაგრამ backlog-ში 21 რაუნდი ღიად დარჩა. ამ დაგეგმვაზე დაიხურა (L7).
  - REG-DUX5-PLAYHEAD-RESCAN regression-ის `scope_additions`-ში იყო, მაგრამ Round 199-ის დავალებაში არ შევიდა. გადავიდა Round 200-ის R200-P1-ში (L6).

## 5. ღირებულება და სიჩქარე

- **ეტაპზე დახარჯული რაუნდები** (`rounds[]`, `post_current_stage_queue`):
  - STORE-2a: 4 რაუნდი (192–195), აქედან 3 FAIL. ყველა მიზეზი B-ის ინვენტარიზაცია ან token-ის მომხმარებლები იყო.
  - SABA-B-4 ეტაპი 1: 3 რაუნდი (196–198), 1 FAIL.
  - STORE-1d: 2 რაუნდი (189–190).
  - VISUAL-A V-0/V-1: FAIL-ების უმეტესობა 142–158-შია.
- **ძვირი ფაზები:**
  - B-ის დაგეგმვა ერთ რაუნდზე $4.65–12.64 ჯდება (`cost-rows.json`); სულ ყველაზე დიდი წილია.
  - *ჰიპოთეზა:* ხანგრძლივი დაგეგმვის მთავარი ხარჯი backlog-ის (1.8 MB) და feature-status-ის (0.56 MB) წაკითხვა-რედაქტირებაა. აქ ეს არ გაზომილა.
- **FAIL-ის ფასი:**
  - FAIL-რაუნდებში A საშუალოდ $8.50 ხარჯავს, PASS-ზე $6.80 (`cost-rows.json`, A-ის სვეტი; `tech-lead`-მაც იგივე მიიღო).
  - ყოველი FAIL სულ მცირე ერთ fix-up რაუნდსაც მოითხოვს.

## 6. სისტემური დავალებები (თითო ამოიღებს ბაგების მთელ კლასს)

რიგი: SABA-B-4 ეტაპი 2-ის (Round 201) შემდეგ და STORE-2b-მდე, policy-ის მიხედვით („queued right after the current stage“). ეს სამი polish-რაუნდია დაუბლოკავი STORE-2b-ის წინ; root-ს ან Saba-ს შეუძლია რიგი შეცვალოს B-ის ცალკე რაუნდის გარეშე (vetoable). თითოს ჰყავს ერთი owner area და აქვს ქცევის შემნახველი ტესტები. დეტალური დავალება იწერება მისი dispatch-ის დაგეგმვაზე. მისამართები შემოწმებულია HEAD `5b1a2bb`-ზე.

| ID | რა | იხურება | Owner area | ზომა |
|---|---|---|---|---|
| **SYS-1** | სტილის კლასზე მიბმული ტესტების ჩანაცვლება: role, სახელი, ტექსტი ან `data-testid`. ასევე self-compare-ის, source-text-ის და პოზიციური selector-ების ჩანაცვლება. საიტები: `library-preview.test.tsx:241` (`span.text-foreground`), `detail-panel-strings-ui.test.tsx:239,277` (`span.text-dim`), `detail-panel-polish.test.tsx:369` (`span.font-sans`), `library-row-strings-ui.test.tsx:252` (`span.font-mono`), LRS3 `className).toBe` (l.236/251), OV1 (`studio-theme-obsidian.test.tsx:228-235`), UM8 (`track-group-mix-ui.test.tsx:641-645`), `panel-radius-ui.test.tsx` პოზიციური selector, `export-cancel.test.ts:211-215`, `export-wav.test.ts:170,594`. **არა** „readFileSync-ის მოცილება“: 19 ფაილიდან ზოგი შეგნებული source check-ია. | GATE146-S4-LRS3-CLASSNAME-PINS, GATE164-OV1-FRAGILE, GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR, GATE81-S2-UM8-SOURCE-TEXT, C-R127-L1f-SELF-COMPARE-TESTS, **RETRO200-CLASS-SELECTORS** (ახალი, 5 საიტი) | `app/lib/arrangement/__tests__/` (მხოლოდ ტესტები) | 1 რაუნდი |
| **SYS-2** | Held-Enter-ის guard: არსებული `preventRepeatedEnterKeyDown` (`ArrangementTransport.tsx:122`) გამოიყენება Play-ზე (l.132), Split-ზე (l.196), Loop-ზე (l.222), Follow-ზე (l.239), Zoom to range-ზე (l.283) და marker flag-ის Enter-ზე. Acceptance-ში შედის key auto-repeat და დაჭერილი კლავიში, ერთი ტოგლი ერთ დაჭერაზე. | GATE107-S1-MARKER-FLAG-HELD-ENTER, A-R107-SWEEP-HELD-ENTER-TOOLBAR | `ArrangementTransport.tsx`, `ArrangementMarkerRow.tsx` + ტესტები | 1 რაუნდი |
| **SYS-3** | IME: Enter-ზე commit არ ხდება, როცა `event.nativeEvent.isComposing` true-ა (Escape-ზეც). საიტები: `ArrangementTempoRow.tsx:201`, `ArrangementMarkerRow.tsx:836`, `ArrangementGroupHeader.tsx:246`, `ArrangementDetailPanel.tsx:371` (range ველი) და `:464` (Clip Gain ველი). jsdom-ში ტესტირებადია. | ROOT-R65-L5, A-R165-IME-ENTER (+ ორი ჩაუწერელი საიტი, რომლებიც იმავე დავალებაში შედის) | ზემოთ ჩამოთვლილი 4 კომპონენტი + ტესტები | 1 რაუნდი |

**უარყოფილი, როგორც ერთი დავალება:** announcement-ის dedupe (GATE165-SR-REPEAT, GATE106-S1, GATE107-S2, A-R105-REVIEW-2).
- `status-announcement.ts:18-20` gesture-ის დროს გამეორებას შეგნებულად ახშობს.
- GATE165-SR-REPEAT კი გამეორების გამოცხადებას ითხოვს. ეს ორი მიმართულება ერთმანეთს ეწინააღმდეგება, ამიტომ ჯერ პროდუქტის გადაწყვეტილებაა საჭირო. გადაწყვეტილება საბასთვის (ქვემოთ).

**კანდიდატი, დაუგეგმავი:** toggle-ების `aria-expanded`:
- GATE75-S5-ARIA-EXPANDED: marker flag-ის მნიშვნელობაა true ან undefined (`ArrangementMarkerRow.tsx:794`).
- GATE110-S3-TOGGLE-ARIA-EXPANDED: library-ის collapse ღილაკები.

ის მცირეა და შეიძლება SYS-3-ის owner area-ს მიუერთდეს, თუ dispatch-ზე ფაილი ემთხვევა.

## 7. გაკვეთილები

`lessons.md` (31 ხაზი) შეიცავს 22 გაკვეთილს: B — 10, A — 5, C — 7. თითოს მითითებული აქვს მტკიცებულება. „(1×)“ ნიშნავს, რომ მტკიცებულება ერთ შემთხვევას ეყრდნობა და გაკვეთილი ჰიპოთეზად რჩება.

**პირველი ექსპერიმენტი** (`consequence-tester`):
- **წესი L10 (B):** A-ს STOP-ზე ან C-ის „B has not ruled“-ზე შემდეგი დავალება ruling-ს შეიცავს, სანამ რამე ხელახლა გაიგზავნება. runner-ის gate („C არ იწყება ruling-ის ფაილის გარეშე“) root-ისთვის წინადადებაა, §8.
- **შემოწმება:** მომდევნო 15 რაუნდში დაითვლება C FAIL-ები, რომელთა გამოსწორება მხოლოდ ruling-ს მოითხოვს და კოდს არა. ამ ფანჯარაში ასეთი იყო 2–3 (143, 151; 142 ნაწილობრივ).
- **საწინააღმდეგო საზომი:** B-ის საათების მედიანა.
- **შეზღუდვა:** მომდევნო 15 რაუნდში 0 ასეთი FAIL სუსტი მტკიცებულება იქნება, რადგან საბაზისო სიხშირე დაბალია.

**მომდევნო RETRO-მ შეამოწმოს:**
- რამდენი FAIL მოხდა L1–L4-ის კლასიდან;
- გამოიყენა თუ არა B-მ L1-ის mutant-ის მტკიცებულება;
- აქვს თუ არა ყოველ STOP-ს ruling-ის ფაილი.

## 8. საბასთვის (For Saba) — მხოლოდ წინადადებები, არაფერი გამოყენებულა

**წესების ცვლილების წინადადებები** (store-ის `.claude/`-ში; loop მათ შენი დასტურის გარეშე არ ცვლის):
1. `.claude/primitives/TESTING_QUALITY_GATES.md`-ში დაემატოს: „ტესტი ელემენტს სტილის კლასით (`span.text-*`, `border-*`, `bg-*`) არ ეძებს. ეძებს role-ით, სახელით, ტექსტით ან `data-testid`-ით.“ მიზეზი: Round 178-ის FAIL და SYS-1.
2. `.claude/primitives/TAILWIND_FIRST.md`-ში დაემატოს: „unlayered გლობალური CSS rule (`a, button {…}`) Tailwind-ის `@layer utilities`-ს ჯობნის. ახალი გლობალური rule `@layer base`-ში უნდა იყოს.“ მიზეზი: C-R158-01, ROOT-GLOBAL-TRANSITION-RULE.
3. `.claude/agents/code-reviewer.md`-ში დაემატოს: „ყოველ ახალ keydown handler-ზე შეამოწმე key auto-repeat და IME `isComposing`.“ მიზეზი: SYS-2, SYS-3.

4. Loop runner-ისთვის (root): B/A/C-ის prompt-მა პირდაპირ მიუთითოს `lessons.md`-ზე, ხოლო runner-მა C-ის ფაზა არ დაიწყოს, თუ `a-round-N.md`-ში STOP წერია და `b-round-N*` ruling-ის ფაილი არ არსებობს. მიზეზი: Round 143 (C-R143-01).

**ღია კითხვები:**
- **C-R188-I6:** keep-list-ის testimonials („Netflix Original Score“, „2,500+ Happy Customers“) `TestimonialsSection.tsx`-შია, მაგრამ 2026-10-02-დან (`a208b4c`) არცერთ route-ზე არ ჩანს. რომელ გვერდზე უნდა იყოს? STORE-3 მას არც დაამატებს და არც წაშლის შენი პასუხის გარეშე.
- **OBS-R199-LEDGER:** დემოს ხმების სათაურები (საჯარო preview, ღამის პულსი, სრული მიქსი, სტემების სახელები) ქართულად რჩება, რადგან სათაური შინაარსია და არა UI-ის ტექსტი. B-ის გადაწყვეტილებაა „დარჩეს“. თუ ინგლისურად გინდა, თქვი.
- **Announcement-ის გამეორება:** როცა ერთი და იგივე უარი რამდენჯერმე მეორდება ერთი drag-ის დროს, screen reader-მა ყოველ ჯერზე წაიკითხოს თუ მხოლოდ ერთხელ? დღეს ერთხელ კითხულობს.
