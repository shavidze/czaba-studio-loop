import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new, 1)
rep('round 169 → round 170 დაგეგმვა, D-29z135', 'round 170 → round 171 დაგეგმვა, D-29z136')
anchor = "**⚠ ვეტოს შესაძლებლობით (D-29z135):** R13 (სამი ღილაკი ჩარჩოს გარეშე), R3 (ველები ინარჩუნებს ჩარჩოს).\n"
bullet = ("- **Round 170 (V-3c-4c-2) — C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 170 გამოქვეყნდა `fe6ea99`. V-3c-4c-2 — **მზადაა**.** "
  "SURF-V3C4C2 (გამჭვირვალე 1 px ჩარჩო, 8 px, ფონი 5/8/12 %, hover-ზე brand ტექსტი, 180 ms; reduced motion-ზე `none`; ველები 8 px, ჩარჩო რჩება), BOX-V3C4C2 (0.00 px), CONTRAST-V3C4C2 (13.24 / hover 6.58 / დაჭერისას 5.82; ველები 15.62 / 5.69 უცვლელი), RV1-V3C4C2, "
  "FUNC-SMOKE-V3C4C2 (Set selection 2–4 წმ კლიპში, არასწორი წყვილი უარყოფილი; რეალური აუდიო: Clip Gain −20 dB = −20.00 dB, „0 dB“ → 0.00 dB, Ctrl+Z; toggle — მაუსი/Space/Enter, ფოკუსი რჩება, transport არ ირთვება) — PASS ორივე ზომაზე (`c-round-170.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
  "C-R169-N1-ის ორმაგი ფოკუსის რგოლი Detail panel-ის ველებზეც ჩანს → ჩანაწერის ფარგლები გაფართოვდა (ყველა `ring-2` კონტროლი). ახალი Low → `deferred_low_polish`: GATE170-DISABLED-HOVER-TEXT-VARIANT. "
  "**Round 171 (D-29z136): V-3c-4c-3** — Export dialog: Cancel და Done კარგავს `border-outline`-ს და იღებს 5 % ფონს, 8 px (R16; Done-ის `disabled:opacity-40` რჩება, HE5); ძირითადი Export ღილაკი იღებს transport-ის Export-ის სახეს — `brand` ჩარჩო და ტექსტი, შევსებული `brand` ფონი ქრება (R15); ფორმატისა და scope-ის ბარათები — მხოლოდ 8 px, ჩარჩო და არჩეულის ფონი რჩება (R17). "
  "Video dock: მცურავი ღილაკები და Return — მხოლოდ 8 px, `bg-background/80` რჩება ვიდეოზე წაკითხვისთვის (R18); ჩარჩოები → V-3c-5 (R19). Marker-ის ჭდე (`ArrangementMarkerRow` l.811) V-3c-ში არ შედის — ეს ღილაკის შიგნით ტექსტის ეტიკეტია (R20). "
  "B-ის ბრაუზერის probe: layout 0.000 px 4 მდგომარეობაში ორივე ზომაზე; Done 14.78 → 13.24, ძირითადი Export 8.32 → 7.05, hover 6.58 (`b-round-170/out/v3c4c3-probe.json`). V-3c-4-ის ბოლო ნაწილია → frontend-architect checkpoint-ის მოთხოვნა: `b-round-170-checkpoint-request.md`. "
  "**⚠ ვეტოს შესაძლებლობით (D-29z136):** R15 (Export ღილაკი კარგავს შევსებულ `brand` ფონს; ალტერნატივა — ფონი რჩება, მხოლოდ 8 px), R16, R17 (ბარათები ინარჩუნებს ჩარჩოს), R18 (ვიდეოს ღილაკები ინარჩუნებს მუქ ფონს), R20 (marker-ის ჭდე უცვლელი).\n")
rep(anchor, anchor + bullet)
old = "**V-3c-4c-2 — მუშავდება** (Clip details: Set selection, 0 dB, Collapse/Expand, From/To და Clip Gain ველები; Round 170, D-29z135). შემდეგ V-3c-4c-3 (Export dialog, video dock, marker-ის ჭდის კითხვა; 171, თუ რეგრესია არ დგება)"
new = ("**V-3c-4c-2 — მზადაა** (Round 170, C PASS `browserVerified`, `fe6ea99`; `c-round-170.json`). "
  "**V-3c-4c-3 — მუშავდება** (Export dialog: Cancel, Done, Export, ბარათები; video dock: მცურავი ღილაკები, Return; marker-ის ჭდე — R20-ით დაიხურა; Round 171, D-29z136). შემდეგ რეგრესიის რაუნდი, თუ 2026-10-27 დადგა")
rep(old, new)
row_anchor = "| REVIEW-RECOMMENDATIONS | **არ დაწყებულა** (VISUAL-A-ს შემდეგ, T12-ADVANCED-მდე)"
store_row = ("| STORE-REDESIGN | **არ დაწყებულა** (VISUAL-A-OBSIDIAN-ის შემდეგ, REVIEW-RECOMMENDATIONS-მდე; backlog-ში ჩაიწერა Round 171-ის დაგეგმვისას, D-29z136). მიმართულება გადაწყდა: **A — Obsidian & Brass gallery** (Saba, 2026-10-25) → STORE-2…5 აღარ ელოდება. "
  "STORE-0 (mock API `mock-api/server.mjs` 127.0.0.1:5199, მხოლოდ loop-ის საქაღალდეში) — **არ დაწყებულა**; STORE-1 (ბაგები, loader, header) — **არ დაწყებულა**; STORE-2 (token-ები და ტიპოგრაფია) — **არ დაწყებულა**; STORE-3 (hero) — **არ დაწყებულა**; STORE-4 (პროდუქტი და მოსმენა) — **არ დაწყებულა**; STORE-5 (ჩატვირთვის ტექსტი, დიზაინის დოკუმენტები) — **არ დაწყებულა**. "
  "Saba-ს keep-list სავალდებულოა (LeadMagnet, Free Samples, SpecialOffers, Limited, testimonials/სტატისტიკა — მხოლოდ restyle). Root-ის საკითხი: `cloud/run.sh` ვერ ვიპოვე — root-მა უნდა დაადასტუროს, სად ირთვება mock-api | "
  "`docs/technical/store-redesign/store-redesign-spec.md`, `direction-decision.md`; backlog `post_current_stage_queue` → STORE-REDESIGN |\n")
rep(row_anchor, store_row + row_anchor)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
