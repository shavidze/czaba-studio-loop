import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new, 1)
rep('round 166 → round 167 დაგეგმვა, D-29z132', 'round 167 → round 168 დაგეგმვა, D-29z133')
anchor = "**⚠ ვეტოს შესაძლებლობით (D-29z132):** ჩარჩოს გარეშე ფონი ამ ღილაკებზე (R1), ჩართული ფერი hover-ზე (R2), ველებზე ჩარჩო რჩება (R3), 16 px სიმაღლის ღილაკები (marker `+`/◀/▶, Metronome) 8 px radius-ით მრგვალდება — `+` წრე ხდება (R4).\n"
bullet = ("- **Round 167 (V-3c-4a) — C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 167 გამოქვეყნდა `1fef377`. V-3c-4a — **მზადაა**.** "
  "SURF-V3C4A (გამჭვირვალე 1 px ჩარჩო, 8 px, ფონი 5/8/12 %, 180 ms; reduced motion-ზე `none`; Master Peak-ის რეალური overload ორივე ზომაზე), BOX-V3C4A (0.000 px 11 ღილაკზე), CONTRAST-V3C4A (5.98 / hover 12.35 / ჩართული 5.48 და 8.32 / Peak over 4.72), RV1-V3C4A, FUNC-SMOKE-V3C4A (რეალური აუდიო; Master Mute სიჩუმე 61–87 ms-ში) — PASS ორივე ზომაზე (`c-round-167.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
  "Triplets-ის მონიშნული Check ბრაუზერში დადასტურდა — C-R166-TRIPLET-CHECKED-BROWSER დაიხურა. gate review 8/10: doc 136-ის სტატუსი → Round 168-ში; WCAG 1.4.11 (ფონი ზედაპირთან 1.12:1) — სპეციფიკაციის ცნობილი trade-off; ორივე reviewer-ი გვთავაზობს ერთ საერთო კლას-კონსტანტას V-3c-4c-ის შემდეგ — სიგნალი ARCH-R167-SURFACE-RECIPE, root-ის checkpoint-ის მოლოდინში. "
  "**კითხვა Saba-ს (Q-R167-ON-HOVER):** ჩართული ღილაკები hover-ზე არ იცვლება (R2); ვარიანტი — hover/press-ზე ერთი საფეხურით მკვეთრი ფონი. "
  "**Round 168 (D-29z133): V-3c-4b** — Lane-ისა და ჯგუფის Mute/Solo: ჩარჩო → 5 % ფონი, 8 px, ჩართული ფერი hover-ზეც რჩება; ჯგუფის „ნახევრად Solo“ (mixed) უცვლელად გამოიყურება, hover-ზე მარჯვენა ნახევარი 8 % ფონს იღებს (R8); ვიდეოს იმპორტის ღილაკები იღებს Export-ის სახეს — `brand` ჩარჩო და ტექსტი + 5 % ფონი, `brand`-ის hover ელფერი ქრება (R6); ჩარჩოს გარეშე ღილაკები (fold, სახელი, Pan reset) და ჯგუფის სახელის ველი — მხოლოდ 8 px radius (R7, R3). "
  "B-ის ბრაუზერის probe: layout 0.000 px 5 მდგომარეობაში ორივე ზომაზე; კონტრასტი 5.98 (lane) / 5.57 (ჯგუფი), იმპორტი 7.05 (`b-round-167/out/v3c4b-probe.json`). checkpoint-ს პასუხი ჯერ არ აქვს → fallback (c). "
  "**⚠ ვეტოს შესაძლებლობით (D-29z133):** R1/R2 Mute/Solo-ზე, R6 (იმპორტი Export-ის სახით), R7 (არჩეული ტრეკის სახელი და Pan-ის მაჩვენებელი უფრო მომრგვალდება), R8 (mixed Solo უცვლელი).\n")
rep(anchor, anchor + bullet)
old = "**V-3c-4a — მუშავდება** (Snap, Env, Metronome, marker-ის ღილაკები, Master Peak/Mute: ჩარჩო → 5 % ფონი, 8 px; ველები — მხოლოდ radius; Round 167, D-29z132). შემდეგ V-3c-4b (Lane/Group Mute/Solo, ვიდეოს იმპორტის ღილაკები), V-3c-4c"
new = ("**V-3c-4a — მზადაა** (Round 167, C PASS `browserVerified`, `1fef377`; `c-round-167.json`). "
  "**V-3c-4b — მუშავდება** (Lane/Group Mute/Solo → 5 % ფონი, 8 px; ვიდეოს იმპორტი Export-ის სახით; fold/სახელი/Pan reset და ჯგუფის სახელის ველი — მხოლოდ radius; Round 168, D-29z133). შემდეგ V-3c-4c")
rep(old, new)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
