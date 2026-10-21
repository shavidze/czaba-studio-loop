import sys
p = sys.argv[1]
lines = open(p, encoding='utf-8').read().split('\n')
def find(prefix):
    idx = [i for i, l in enumerate(lines) if l.startswith(prefix)]
    assert len(idx) == 1, (prefix, idx)
    return idx[0]
i = find('განახლდა: ')
lines[i] = 'განახლდა: 2026-10-21 · ავტორი: B (round 74 → round 75 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`'
i = find('მიმდინარე რაუნდი: **Round 74**')
j = find('**Round 73-ის შედეგი:**')
new = ('მიმდინარე რაუნდი: **Round 75** (`current-task.md`, D-29z40) — **SRW-16 ეტაპი 2a-ს გასწორება:** '
       'C-R74-01 — `markers-ui.test.tsx` MU8-ის ძველი assertion (l.526) ახალ B5 კონტრაქტს ეწინააღმდეგებოდა და gate-ს აწითლებდა (B-ის spec-ის ხარვეზი, არა A-ს გადახვევა); ნებართვა: `toBe(\'Move Marker\')` + დროების round-trip შემოწმება, MU8e-ში ორი `pointerUp` (A-R74-MU8E-POINTERUP). '
       'C-R74-02 — მარკერის მენიუ იხურება ტაიმლაინის მომხმარებლის ჰორიზონტალურ scroll-ზე (იგივე Follow-ის წესი, რაც grid-მენიუს: Follow-ის ავტო-scroll მენიუს არ ხურავს) და zoom-ის ცვლილებაზე; ფოკუსი flag-ს უბრუნდება. '
       'ბაზა: HEAD `6b574e8` + Round 74-ის გამოუქვეყნებელი ცვლილებები (7 M + 3 ??, არ ბრუნდება). ეტაპი 2b — Round 76 (დაგეგმილია, არ გადადებულა).\n\n'
       '**Round 74-ის შედეგი:** C FAIL, `browserVerified=true` — ბრაუზერის ყველა რიგი PASS ორივე viewport-ზე (MK-DRAG-SNAP/FREE/CLICK, MK-MOVE-DUP, MK-ARROW, MK-DRAG-PLAYING, MK-MENU*, REG-STAGE1, REG-KEYS, REG-HYD, G74-3), მაგრამ წითელი unit ტესტი (C-R74-01, medium) gate-ს ბლოკავს; C-R74-02 (low). Gate 74 გამოტოვდა; რაუნდები 74+75 ერთად გამოქვეყნდება. fake-Bearer 403 — BLOCKED (backend ღრუბელში მიუწვდომელია).')
lines[i:j] = [new, '']
j = find('**Round 73-ის შედეგი:**')
lines[j] = '**Round 73-ის შედეგი (ისტორია):**' + lines[j][len('**Round 73-ის შედეგი:**'):]
row = find('| FB-10 | Markers/Locators |')
lines[row] = '| FB-10 | Markers/Locators | **ბაგია** (SRW-16 ეტაპი 1 — მზადაა, `6b574e8`; ეტაპი 2a — C Round 74 ბრაუზერი PASS, მაგრამ FAIL C-R74-01/02-ის გამო, გასწორება Round 75; ეტაპი 2b — Round 76) | `c-round-74.md`, `c-round-74.json`, `gates/gate-round-74.json` | Round 75 → 76 |'
row = find('| SRW-16 | Markers/Locators |')
lines[row] = '| SRW-16 | Markers/Locators | **ბაგია** (ეტაპი 1 დადასტურდა და გამოქვეყნდა `6b574e8`; ეტაპი 2a — C Round 74: ბრაუზერის ყველა რიგი PASS, `browserVerified=true`, მაგრამ verdict FAIL: C-R74-01 medium (წითელი MU8), C-R74-02 low (მენიუ scroll-ზე); gate 74 გამოტოვდა; ეტაპი 2b — Round 76) | `c-round-74.md`, `c-round-74.json` | Round 75 (2a გასწორება) → Round 76 (2b) |'
h = find('Round 74 (D-29z39): SRW-16 (FB-10) ეტაპი 2a')
lines.insert(h, 'Round 75 (D-29z40): SRW-16 ეტაპი 2a-ს გასწორება — C-R74-01 (MU8 l.526 → `Move Marker`, MU8e `pointerUp`), C-R74-02 (მენიუ იხურება მომხმარებლის ჰორიზონტალურ scroll-ზე და zoom-ზე; Follow-ის ავტო-scroll — არა); `ArrangementMarkerRow.tsx` (`closeMenu`), `ArrangementMarkerMenu.tsx` (ერთი union-ის წევრი), `StudioWorkspace.tsx` (მხოლოდ `handleTimelineScroll`), ტესტები, doc 065. შემდეგ Round 76 — ეტაპი 2b → checkpoint-ის თხოვნა SRW-16-ის საზღვარზე → SRW-17 → SRW-18 → SRW-19 → SRW-20 → Low-ების ჯგუფი → SRW-21 → სრული რეგრესია → T12 → VISUAL-A-OBSIDIAN. რეგრესიის რაუნდი — 2026-10-24-დან. ფარგლები არ მცირდება.\n')
h = find('Round 74 (D-29z39): SRW-16 (FB-10) ეტაპი 2a')
lines[h] = lines[h] + ' **შედეგი: C FAIL (`browserVerified: true`; C-R74-01, C-R74-02), gate 74 გამოტოვდა.**'
open(p, 'w', encoding='utf-8').write('\n'.join(lines))
print('ok')
