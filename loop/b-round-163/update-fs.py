import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global s
    assert s.count(old) >= 1, old[:80]
    s = s.replace(old, new, count)
rep('round 162 → round 163 დაგეგმვა, D-29z128', 'round 163 → round 164 დაგეგმვა, D-29z129')
anchor = "**⚠ ვეტოს შესაძლებლობით (D-29z128):** `GripVertical`/`X` (B-ის გადაწყვეტა), `Maximize2` დაბრუნების მდგომარეობაშიც (ალტერნატივა `Minimize2`), „Esc or Close“, 10 px იკონი 24 px ღილაკში (Q-V3-ICON-SIZE).\n"
bullet = ("- **Round 163 (V-3c-3a: video dock-ის სიმბოლოები → lucide) — C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 163 გამოქვეყნდა `0e4287f`. V-3c-3a — **მზადაა**.** "
  "ICON-V3C3A (4 მდგომარეობა, 10×10, stroke 2.4, aria-hidden, CDP სახელები), RV1-V3C3A (0 px, 1 rename), DOCK-STATES-BOX (0.00 px), FUNC-SMOKE-DOCK (ყოველი მოქმედება svg-ის ცენტრიდან; ვიდეოს currentTime +1.0 წმ, აუდიოს peak 0.555), G163-3 — PASS ორივე ზომაზე (`c-round-163.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
  "gate-ის review-ის Low-ები: doc 132-ის სტატუსი → Round 164-ში; GATE163-LG3-DUP და GATE163-LVD2-CLAMP → `deferred_low_polish`; `text-xs` → REVIEW-R162-STATIC-CN-DEAD-TEXT. "
  "**მომხმარებლის გადაწყვეტილებები (2026-10-25, `user-review/ableton-decisions.md`, `design-ux-decisions.md`) ჩაიწერა backlog-ში:** ABL-R-1/2/3/4/7/8/9/10/11/12/13/14/15/18 და DUX-R-1…9 — დამტკიცდა; ახალი რიგი **REVIEW-RECOMMENDATIONS** (VISUAL-A-ს შემდეგ, T12-ADVANCED-მდე; B-ის რიგის წესი — ორი review-ს საკუთარი რიგი, მონაცვლეობით, ABL-R-7-ით დაწყებული; ვეტოს შესაძლებლობით). DUX-R-5 — VISUAL-A-ს ცალკე ეტაპი M1-მდე. ABL-R-6 — ქცევა რჩება, B-R107-ENTER-ON-BODY დაიხურა. ABL-R-5/16/17 — ისევ ელოდება მომხმარებელს. **V-2b-DISPLAY — გადაწყდა: serif არა** (Studio-ში მხოლოდ Instrument Sans + IBM Plex Mono; Cormorant Studio-ში არ იტვირთება, სამუშაო არ არის). "
  "**Round 164 (D-29z129): Saba-ს ბაგები** — SABA-B-1 (Medium; envelope-ის ხაზი და სახელური brass-ზე brass-ია: B-ის გაზომვით ხაზი min 1.74:1, სახელური 1.88:1, hover-ის სტილი არ არის) და SABA-B-2 (Low, ახლავე; overview-ის frame `rounded-xs` 2 px, root-ის 6 px clip-ში — კუთხეში ჭრილი). "
  "გამოსწორება: ხაზი — თეთრი 1.5 px ხაზი მუქი 4 px halo-ზე (simulation min 15.62:1); სახელური — თეთრი 10 px, მუქი საზღვრით, hover-ზე 1.25×; frame — `rounded-sm`. შემდეგ: Round 165 — ROOT-RECON-MARKER-ENTER (ჯერ ტესტი), Round 166 — V-3c-3b. "
  "**⚠ ვეტოს შესაძლებლობით (D-29z129):** თეთრი ხაზი მუქი halo-თი, თეთრი სახელური მუქი საზღვრით და hover-ზე გადიდება, frame-ის 6 px radius, REVIEW-RECOMMENDATIONS-ის რიგი.\n")
rep(anchor, anchor + bullet)
rep("V-3c-3a (video dock: ⠿ `GripVertical`, ⤢ `Maximize2`, ✕ `X` + „Esc or Close“ სტატუსი) — **მუშავდება** (Round 163, D-29z128); შემდეგ V-3c-3b (marker ◀▶, detail Expand/Collapse, grid ✓, ← CZABA; Round 164), V-3c-4 (ღილაკების ზედაპირები), V-3c-5 (პანელის 10 px).",
    "V-3c-3a (video dock: ⠿ `GripVertical`, ⤢ `Maximize2`, ✕ `X` + „Esc or Close“ სტატუსი) — **მზადაა** (Round 163, C PASS `browserVerified`, `0e4287f`; `c-round-163.json`). **SABA-B-1 + SABA-B-2 — მუშავდება** (Round 164, D-29z129; Saba-ს 2026-10-25-ის ბაგები, დანარჩენ V-3/M ეტაპებამდე). შემდეგ ROOT-RECON-MARKER-ENTER (Round 165), V-3c-3b (marker ◀▶, detail Expand/Collapse, grid ✓, ← CZABA; Round 166), V-3c-4 (ღილაკების ზედაპირები), V-3c-5 (პანელის 10 px; frame-ის radius root-ს უნდა ემთხვეოდეს — OV1), **DUX-R-5** (ფერის ერთი წესი; დამტკიცდა 2026-10-25; ცალკე ეტაპი M1-მდე; SABA-B-1-ის კონტრასტი ხელახლა მოწმდება), M1, M3, M4, ROOT-RECON-GRID-HARNESS (ტესტის helper, ეტაპის ბოლოს).")
rep("V-2b-DISPLAY (serif) — **დაბლოკილია: ელოდება მომხმარებელს** (ზომის ცვლილება საჭიროა; ვარიანტები ზემოთ).",
    "V-2b-DISPLAY (serif) — **გადაწყდა: serif არა** (Saba, 2026-10-25; Studio-ში მხოლოდ Instrument Sans + IBM Plex Mono; Cormorant Studio-ში არ იტვირთება — სამუშაო არ არის).")
rep("DUX-R-1…9 → `awaiting_user`.", "DUX-R-1…9 → **დამტკიცდა** 2026-10-25 (DUX-R-5 — VISUAL-A-ში; დანარჩენი — REVIEW-RECOMMENDATIONS).")
hdr = "## 3. ღია ბაგები\n\n| ID | სიმძიმე | სტატუსი | მტკიცებულება | შემდეგი ნაბიჯი |\n|---|---|---|---|---|\n"
rows = ("| SABA-B-1 | Medium | **ბაგია** — envelope-ის ხაზი (`text-accent`) და სახელური (`bg-accent`) brass waveform-ზე და არჩეული კლიპის brass header-ზე თითქმის არ ჩანს; hover-ის სტილი არ არის (Saba, 2026-10-25) | `user-review/img/saba-2026-10-25-envelope-handle.png`; B-ის რეპროდუქცია `b-round-163/out/saba-probe2.json`, `saba-sim-dpr2.json` (ხაზი min 1.74:1, სახელური 1.88:1) | Round 164 (D-29z129): ორფერიანი ხაზი + თეთრი სახელური; C ENV-VIS ≥ 3:1 ყველა მდგომარეობაში; DUX-R-5-ის შემდეგ ხელახლა |\n"
        "| SABA-B-2 | Low (ახლავე, არა გადადებული) | **ბაგია** — overview-ის კუთხეებში ჭრილი: frame `rounded-xs` (2 px) root-ის `overflow-hidden rounded-sm` (6 px) შიგნით | `user-review/img/saba-2026-10-25-overview-corners.png`; `b-round-163/out/corner-1440-*.png`, `saba-probe.json` | Round 164: frame → `rounded-sm`; C OV-CORNERS (ჭრილის პიქსელები 0) |\n"
        "| ROOT-RECON-MARKER-ENTER | დაუდასტურებელი (წყაროს ჰიპოთეზა) | **არ დაწყებულა** — marker-ის add/rename editor-ში Enter აქტიური pointer gesture-ის დროს შეიძლება commitArrangement-მდე მივიდეს (blur-ს იცავს, Enter-ს — არა) | `docs/technical/studio-real-workspace/agent-workflow.md` (2026-10-25 შეჯერება); PC MU14 | Round 165: ჯერ რეგრესიის ტესტი (add და rename); ფიქსი მხოლოდ განმეორების შემთხვევაში |\n")
rep(hdr, hdr + rows)
va_end = "სპეციფიკაცია: `docs/technical/studio-real-workspace/visual-direction-a.md`. ფაზა 1-სა და T12-ში არ ერევა |\n"
rr = ("| REVIEW-RECOMMENDATIONS | **არ დაწყებულა** (VISUAL-A-ს შემდეგ, T12-ADVANCED-მდე) — Saba-მ დაამტკიცა 2026-10-25: ABL-R-1/2/3/4/7/8/9/10/11/12/13/14/15/18, DUX-R-1/2/3/4/6/7/8/9. რიგი (B-ის წესი, ვეტოს შესაძლებლობით): ABL-R-7, DUX-R-3, ABL-R-12, DUX-R-1, ABL-R-13, DUX-R-4, ABL-R-10, DUX-R-6, ABL-R-9, DUX-R-2, შემდეგ დანარჩენი Low-ები. DUX-R-3-ის ვარიანტს ირჩევენ design-philosopher და flow-sage ბრაუზერის მტკიცებულებით | "
      "`user-review/ableton-decisions.md`, `user-review/design-ux-decisions.md`; backlog `post_current_stage_queue` → REVIEW-RECOMMENDATIONS. ABL-R-5/16/17 — ელოდება მომხმარებელს; ABL-R-6 — ქცევა რჩება |\n"
      "| ROOT-RECON-GRID-HARNESS | **არ დაწყებულა** — ტესტის helper-ის გამოყოფა (`createWorkspaceTestEnvironment`, სამი grid suite), დამტკიცებული; VISUAL-A-ს ბოლოს, უსაფრთხო საზღვარზე | agent-workflow.md 2026-10-25-ის შეჯერება; ლოკალური 3ea2e04 (`refactor/grid-test-harness`) cloud-ში არ არის; ახალი doc ნომერი |\n")
rep(va_end, va_end + rr)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
