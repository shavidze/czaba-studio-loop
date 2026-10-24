import sys
P = sys.argv[1]
t = open(P, encoding='utf-8').read()
def rep(old, new, count=1):
    global t
    n = t.count(old)
    if n != count:
        sys.exit(f'anchor count {n} != {count}: {old[:80]}')
    t = t.replace(old, new)
rep('განახლდა: 2026-10-24 · ავტორი: B (round 143 → round 144 დაგეგმვა, D-29z109)', 'განახლდა: 2026-10-24 · ავტორი: B (round 144 → round 145 დაგეგმვა, D-29z110)')
anchor = '- **C-R6-02 / C-R8-01 (Medium, T12-ს არ ბლოკავს)**'
line144 = ('- **Round 144 (V-0.4e დახურვა) — C PASS, `browserVerified: true`, `realVerified: true`; gate 144 გამოქვეყნდა `9a67abd` (rounds 142+143+144 ერთად). V-0.4e — მზადაა; V-0.4 სრულია.** '
    'LAYOUT-1440: placeholder ზუსტად [735.5, 759.5, 139, 16] (D-29z109), მშობელი d=0, ქართული swap = baseline; LAYOUT-1280-SPOT, VIDEO-REASON-TEXT, G144-3, PX-NET — PASS; C-R143-01 დაიხურა. fake-Bearer 403 — BLOCKED (backend unavailable in cloud). '
    '**შემდეგი:** Round 145 (D-29z110) — V-0.5a: ჩატვირთვის შეცდომები, ბიბლიოთეკის რიგის სტატუსი (`Loading…` / `Error: …` / `▶ Playing`), დემო კოლექციის ლეიბლები და შენიშვნა ინგლისურად, ძიების keywords (`stems`, C-R142-02); ბმულები: `c-round-144.json`, `gates/gate-round-144.json`.\n')
rep(anchor, line144 + anchor)
rep('| C-R142-01 | Medium | **გასწორდა Round 143-ში** (C VIDEO-REASON-TEXT PASS, მიზეზი 1 ხაზზე; იხურება V-0.4e-ის გამოქვეყნებით)', '| C-R142-01 | Medium | **დაიხურა** (Round 143-ში გასწორდა; C PASS Round 143/144; გამოქვეყნდა `9a67abd`)')
rep('| C-R142-02 | Low | `deferred_low_polish` — `stems` ძიებაში 0 შედეგს აბრუნებს (kind label `Stem`) | `c-round-142/out/lib142-1440-r1.json` | V-0.5-ის forward constraint LIB-SEARCH-KEYWORDS ან polish |',
    '| C-R142-02 | Low | **მუშავდება** Round 145-ში (V-0.5a ფლობს `library.ts`-ს; LIB-SEARCH-KEYWORDS, D-29z110 R2) — `stems` ძიებაში 0 შედეგს აბრუნებს (kind label `Stem`) | `c-round-142/out/lib142-1440-r1.json` | Round 145 C LIB-SEARCH (`stems`, `Stems`, `stem` → 4 სტემი) |')
rep('| C-R143-01 | Low | **დაიხურა დასკვნით** D-29z109 R1 (არა `deferred_low_polish`)', '| C-R143-01 | Low | **დაიხურა** — D-29z109 R1 + C Round 144 LAYOUT-1440 PASS (გამოქვეყნდა `9a67abd`)')
rep('| A-R143-REVIEW-LOWS | Low | R-L1 (polish `describe` სათაური) და R-L2 (doc 118-ის ნარჩენები) → Round 144; R-L3 — info |', '| A-R143-REVIEW-LOWS | Low | **დაიხურა** — R-L1/R-L2 C AN-REVIEW PASS Round 144-ში (`9a67abd`); R-L3 — info |')
new_rows = ('| GATE144-S1-DOC118-STATUS | Low | **მუშავდება** Round 145-ში (doc 118 → Completed) | `gates/round-144/review.md` #1 | Round 145 AN-REVIEW |\n'
    '| GATE144-S2 / S3 / S5 | Low | `deferred_low_polish` — DetailPanel-ის inline ტექსტები (Clip Gain single, open-state `aria-valuetext`, pending hint prefix slice) | `gates/round-144/review.md` #2, #3, #5 | polish pass |\n'
    '| LIB-SEARCH-GEORGIAN-SYNONYMS | info | სიგნალი Saba-სთვის, არ არის დაგეგმილი (D-29z110 R2): V-0-ის შემდეგ ქართული სიტყვები (მუსიკა / სტემები) ტიპით აღარ ემთხვევა | `gates/round-144/review.md` #4 | Saba-ს გადაწყვეტილება საჭიროების შემთხვევაში |\n')
rep('| R87-PROGRESS-BELOW-FOLD-1280 |', new_rows + '| R87-PROGRESS-BELOW-FOLD-1280 |')
rep('→ V-0.4e (DetailPanel + ბიბლიოთეკის ლეიბლები) **მუშავდება** (Round 142 C FAIL: C-R142-01 → Round 143-ში გასწორდა; Round 143 C FAIL მხოლოდ დაუმტკიცებელ placeholder-ის სხვაობაზე, C-R143-01 → D-29z109; Round 144 — ხელახალი შემოწმება) → V-0.5 |',
    '→ V-0.4e მზადაა (Rounds 142–144, `9a67abd`; V-0.4 სრულია) → V-0.5a **მუშავდება** (Round 145: ჩატვირთვის შეცდომები + ბიბლიოთეკის რიგის სტატუსი ერთად, რომ ერთ რიგში ორი ენა არ შეხვდეს) → V-0.5b → V-0.5c |')
rep('V-0.4e (Clip Detail panel + ბიბლიოთეკის kind/folder ლეიბლები) — **მუშავდება** (Round 142 C FAIL → Round 143 გასწორება, C-მ დაადასტურა; Round 143 C FAIL მხოლოდ C-R143-01-ზე, Low, დასკვნით იხურება D-29z109; Round 144 — C-ის ხელახალი შემოწმება; `c-round-143.json`); V-0.5, V-1…V-3, M1/M3/M4 — **არ დაწყებულა**.',
    'V-0.4e (Clip Detail panel + ბიბლიოთეკის kind/folder ლეიბლები) — **მზადაა** (Rounds 142–144, C Round 144 PASS `browserVerified`, `9a67abd`; `c-round-144.json`) → V-0.4 სრულია. V-0.5a (ჩატვირთვის შეცდომები, რიგის სტატუსი, დემო ლეიბლები, ძიების keywords) — **მუშავდება** (Round 145, D-29z110); V-0.5b, V-0.5c, V-1…V-3, M1/M3/M4 — **არ დაწყებულა**.')
open(P, 'w', encoding='utf-8').write(t)
print('ok')
