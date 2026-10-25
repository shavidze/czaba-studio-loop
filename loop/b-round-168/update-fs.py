import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new, 1)
rep('round 167 → round 168 დაგეგმვა, D-29z133', 'round 168 → round 169 დაგეგმვა, D-29z134')
anchor = "**⚠ ვეტოს შესაძლებლობით (D-29z133):** R1/R2 Mute/Solo-ზე, R6 (იმპორტი Export-ის სახით), R7 (არჩეული ტრეკის სახელი და Pan-ის მაჩვენებელი უფრო მომრგვალდება), R8 (mixed Solo უცვლელი).\n"
bullet = ("- **Round 168 (V-3c-4b) — C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 168 გამოქვეყნდა `e50498f`. V-3c-4b — **მზადაა**.** "
  "SURF-V3C4B (გამჭვირვალე 1 px ჩარჩო, 8 px, ფონი 5/8/12 %, 180 ms; ჩართული ფერი hover-ზე რჩება; mixed Solo მოსვენებულ მდგომარეობაში უცვლელია, hover-ზე მარჯვენა ნახევარი 8 %-იანი; reduced motion-ზე `none`), BOX-V3C4B (0.000 px ყველგან), CONTRAST-V3C4B (5.98 / 5.57, იმპორტი 7.05, ჩართული 8.32), RV1-V3C4B, "
  "FUNC-SMOKE-V3C4B (რეალური აუდიო: Lane/Group Mute სიჩუმე 80–101 ms-ში, Solo, ჯგუფის mixed; ვიდეოს რეალური იმპორტი file chooser-ით და dock-ში დახატული კადრი; rename + Undo) — PASS ორივე ზომაზე (`c-round-168.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
  "gate review 9/10: doc 137-ის სტატუსი → Round 169-ში. Q-R167-ON-HOVER ბრაუზერში დადასტურდა (ჩართული ღილაკი hover-ზე არ იცვლება) — ისევ Saba-ს კითხვაა. reviewer-ები ერთ საერთო კლას-კონსტანტაზე თანხმდებიან, მაგრამ დროზე — არა (A-ს reviewer: V-3c-4c-ის შემდეგ; gate reviewer: V-3c-4c-მდე) — `b-round-168-checkpoint-request.md`, root-ის პასუხის მოლოდინში; ამ დრომდე fallback (c). "
  "**V-3c-4c დაიყო მფლობელის მიხედვით:** 4c-1 ბიბლიოთეკა + preview (Round 169), 4c-2 Detail panel (170), 4c-3 Export dialog + video dock + marker-ის ჭდის კითხვა (171). "
  "**Round 169 (D-29z134): V-3c-4c-1** — Preview ღილაკი კარგავს ჩარჩოს და იღებს 5 % ფონს (R9); Stop ინარჩუნებს ფერად ჩარჩოს, ფონს იღებს და hover-ზე რეაგირებს (R10); Add იღებს Export-ის სახეს — `brand` ჩარჩო და ტექსტი, `brand`-ის ელფერიანი ფონი ქრება (R11); ბიბლიოთეკის სტრიქონები, ხატულა-ღილაკები და ძიების ველი — მხოლოდ 8 px (R7, R3); ხის სტრიქონები კვადრატული რჩება (R12). "
  "B-ის ბრაუზერის probe: layout 0.000 px 4 მდგომარეობაში ორივე ზომაზე; კონტრასტი 7.88 → 7.05, Add 6.69 → 7.05 (`b-round-168/out/v3c4c1-probe.json`). "
  "**⚠ ვეტოს შესაძლებლობით (D-29z134):** R9/R10 (Preview/Stop), R11 (Add კარგავს `brand` ფონს), R7 (სტრიქონების 8 px კუთხეები), R12 (ხის სტრიქონები კვადრატული).\n")
rep(anchor, anchor + bullet)
old = "**V-3c-4b — მუშავდება** (Lane/Group Mute/Solo → 5 % ფონი, 8 px; ვიდეოს იმპორტი Export-ის სახით; fold/სახელი/Pan reset და ჯგუფის სახელის ველი — მხოლოდ radius; Round 168, D-29z133). შემდეგ V-3c-4c (Detail panel, ბიბლიოთეკის preview/ძიება, Export, video dock)"
new = ("**V-3c-4b — მზადაა** (Round 168, C PASS `browserVerified`, `e50498f`; `c-round-168.json`). "
  "**V-3c-4c-1 — მუშავდება** (ბიბლიოთეკის Preview/Stop და Add, სტრიქონები, ხატულა-ღილაკები, ძიების ველი; Round 169, D-29z134). შემდეგ V-3c-4c-2 (Detail panel, 170), V-3c-4c-3 (Export dialog, video dock, marker-ის ჭდის კითხვა; 171)")
rep(old, new)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
