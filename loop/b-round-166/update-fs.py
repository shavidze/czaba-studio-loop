import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new, 1)
rep('round 165 → round 166 დაგეგმვა, D-29z131', 'round 166 → round 167 დაგეგმვა, D-29z132')
anchor = "**⚠ ვეტოს შესაძლებლობით (D-29z131):** icon-ების არჩევანი და ზომები (R1), `Expand`/`Collapse` glyph-ის გარეშე, exit link-ის სახელი `CZABA`, `+` რჩება ტექსტად.\n"
bullet = ("- **Round 166 (V-3c-3b) — C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 166 გამოქვეყნდა `330f1f3`. V-3c-3b — **მზადაა**; V-3c-3 და სიმბოლოებიდან icon-ებზე გადასვლა სრულია.** "
  "ICON-V3C3B (marker 9×9, toggle 10×10, check 10×10, exit 12×12; stroke = host-ის ფერი), ICON-BOX (max 0.468 px, ზუსტად B-ის simulation), RV1-V3C3B (0 დაკარგული/დამატებული გასაღები), FUNC-SMOKE-V3C3B (svg-ის ცენტრიდან დაწკაპება; რეალური აუდიო, peak 0.374), G166-3 — PASS ორივე ზომაზე (`c-round-166.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
  "gate review-ის შენიშვნები: doc 135-ის სტატუსი → Round 167-ში; TS7-ის `indexOf` და grid-ის ორმაგი `aria-hidden` → `deferred_low_polish` (სულ 239); icon-ის props 7 ადგილას — სიგნალი GATE166-ICON-PROPS (checkpoint Q3). "
  "**კითხვა Saba-ს (Q-R166-EXIT-NAME):** exit link-ის სახელი ახლა `CZABA`-ა; შესაძლო `aria-label=\"Back to CZABA\"` — მხოლოდ თქვენი პასუხის შემდეგ. Triplets-ის მონიშნული Check ბრაუზერში ჯერ არ უნახავს C-ს (მხოლოდ vitest TU11) — შემდეგ რაუნდში ერთი შემოწმება. "
  "**Round 167 (D-29z132): V-3c-4a** — V-3c-4 იყოფა owner-ების მიხედვით (4a/4b/4c, მოცულობა უცვლელია). 4a: Snap, Env, Metronome, marker-ის `+`/◀/▶, Master Peak, Master Mute — ჩარჩოს ნაცვლად `foreground` 5 % ფონი (hover 8 %, active 12 %), 8 px radius, 180 ms მოძრაობა; ჩართული მდგომარეობის ფერი hover-ზეც რჩება; ველები (BPM, grid select, waveform zoom, marker-ის სახელი) — მხოლოდ 8 px radius, ჩარჩო რჩება. "
  "B-ის ბრაუზერის probe: layout 0.000 px ორივე ზომაზე; ტექსტის კონტრასტი 6.68 → 5.98 (≥ 4.5), hover 12.35 (`b-round-166/out/v3c4a-probe.json`). checkpoint-ს პასუხი არ აქვს → fallback (c), კლასები თითო კომპონენტში, ტესტებით დაცული. "
  "**⚠ ვეტოს შესაძლებლობით (D-29z132):** ჩარჩოს გარეშე ფონი ამ ღილაკებზე (R1), ჩართული ფერი hover-ზე (R2), ველებზე ჩარჩო რჩება (R3), 16 px სიმაღლის ღილაკები (marker `+`/◀/▶, Metronome) 8 px radius-ით მრგვალდება — `+` წრე ხდება (R4).\n")
rep(anchor, anchor + bullet)
old = "**V-3c-3b — მუშავდება** (marker ◀▶ → Chevron 9 px, detail Expand/Collapse + Chevron, grid ✓ → Check, ← CZABA → ArrowLeft; Round 166, D-29z131; marker `+` რჩება ტექსტად — კითხვა Q-V3-ICON-SIZE-ში). შემდეგ V-3c-4 (ღილაკების ზედაპირები),"
new = ("**V-3c-3b — მზადაა** (Round 166, C PASS `browserVerified`, `330f1f3`; `c-round-166.json`; marker `+` რჩება ტექსტად — კითხვა Q-V3-ICON-SIZE-ში) → V-3c-3 სრულია. "
  "**V-3c-4a — მუშავდება** (Snap, Env, Metronome, marker-ის ღილაკები, Master Peak/Mute: ჩარჩო → 5 % ფონი, 8 px; ველები — მხოლოდ radius; Round 167, D-29z132). შემდეგ V-3c-4b (Lane/Group Mute/Solo, ვიდეოს იმპორტის ღილაკები), V-3c-4c (Detail panel, ბიბლიოთეკის preview/ძიება, Export, video dock),")
rep(old, new)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
