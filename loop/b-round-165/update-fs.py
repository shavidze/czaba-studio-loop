import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new, 1)
rep('round 164 → round 165 დაგეგმვა, D-29z130', 'round 165 → round 166 დაგეგმვა, D-29z131')
anchor = "**⚠ ვეტოს შესაძლებლობით (D-29z130):** Enter drag-ის დროს editor-ს ღიად ტოვებს (ალტერნატივა — დახურვა blur-ის მსგავსად, აკრეფილი ტექსტის დაკარგვით).\n"
bullet = ("- **Round 165 (ROOT-RECON-MARKER-ENTER) — C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 165 გამოქვეყნდა `7581483`. ROOT-RECON-MARKER-ENTER — **მზადაა** (დაიხურა).** "
  "MK-GESTURE ორივე ზომაზე: მაუსით დაჭერილ drag-ში Shift+Tab ×14 → F2 — editor არ იხსნება, სტატუსი „Editing does not work while dragging — let go first.“; Undo: Move clip → Add Marker, „Rename Marker“ არ ჩნდება. MK-BASELINE-CHECK: C-ის შემოწმება B-ის baseline-ზე FAIL-ს აჩვენებს (row-ს ჩავარდნა შეუძლია). MK-POSITIVE, MK-BLUR, G165-3 — PASS (`c-round-165.md`). "
  "**შენიშვნა:** Enter-ის დაცვას (K2) ბრაუზერის მტკიცებულება არ აქვს — MK-ENTER-OPEN BLOCKED (harness): workspace-ის capture-phase pointerdown editor-ს gesture-მდე ხურავს, ამიტომ ეს მდგომარეობა ბრაუზერში მიუღწევადია; K2-ს მხოლოდ MU15/MU16 და m183/m184 იცავს. fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
  "gate-ის review-ისა და A-ს reviewer-ის Low-ები (screen reader-ის განმეორებითი სტატუსი, MU15-ის სუსტი blur შემოწმება, ტესტის helper, Tab/blur-ით draft-ის დაკარგვა drag-ში, IME Enter, MU18) → `deferred_low_polish` (სულ 237). ორივე reviewer-მა ერთი და იგივე არქიტექტურული შენიშვნა დაწერა (gesture guard 7+ ადგილას; ერთი guard `commitArrangement`-ში) → root-ს შეზღუდული მოთხოვნა `b-round-165-checkpoint-request.md` (Q-COMMIT; არ იგეგმება, არ ბლოკავს). "
  "**Round 166 (D-29z131): V-3c-3b** — marker ◀ ▶ → `ChevronLeft`/`ChevronRight` (9 px, რომ ორი მეზობელი ღილაკი ±1 px-ში დარჩეს), detail `Expand ▸`/`Collapse ▾` → სიტყვა + `ChevronRight`/`ChevronDown` (`pr-1`, ზომა უცვლელი), grid menu ✓ → `Check`, `← CZABA` → `ArrowLeft` + `CZABA`. B-ის ბრაუზერის probe: ყველა ცვლილება ერთად — max 0.468 px ორივე ზომაზე (`b-round-165/out/v3c3b-final.json`). marker-ის `+` ტექსტად რჩება (Plus icon 2–4 px-ით წაანაცვლებდა; კითხვა Saba-ს Q-V3-ICON-SIZE-ში). "
  "**⚠ ვეტოს შესაძლებლობით (D-29z131):** icon-ების არჩევანი და ზომები (R1), `Expand`/`Collapse` glyph-ის გარეშე, exit link-ის სახელი `CZABA`, `+` რჩება ტექსტად.\n")
rep(anchor, anchor + bullet)
old_row_start = "| ROOT-RECON-MARKER-ENTER | Medium (დადასტურდა B-ის ბრაუზერის რეპროდუქციით) | **მუშავდება** — "
rep(old_row_start, "| ROOT-RECON-MARKER-ENTER | Medium (დადასტურდა B-ის ბრაუზერის რეპროდუქციით) | **მზადაა (დაიხურა, Round 165 C PASS, `7581483`; `c-round-165.json` MK-GESTURE ორივე ზომაზე; K2 Enter — მხოლოდ vitest MU15/MU16, MK-ENTER-OPEN BLOCKED harness)** — იყო: ")
rep("**ROOT-RECON-MARKER-ENTER — მუშავდება** (Round 165, D-29z130; ბრაუზერში დადასტურებული Medium). შემდეგ V-3c-3b (marker ◀▶, detail Expand/Collapse, grid ✓, ← CZABA; Round 166)",
    "**ROOT-RECON-MARKER-ENTER — მზადაა** (Round 165, C PASS `browserVerified`, `7581483`; `c-round-165.json`; K2 მხოლოდ vitest-ით). **V-3c-3b — მუშავდება** (marker ◀▶ → Chevron 9 px, detail Expand/Collapse + Chevron, grid ✓ → Check, ← CZABA → ArrowLeft; Round 166, D-29z131; marker `+` რჩება ტექსტად — კითხვა Q-V3-ICON-SIZE-ში). შემდეგ")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
