import sys
p = sys.argv[1]
lines = open(p, encoding='utf-8').read().split('\n')
assert lines[2].startswith('განახლდა: 2026-10-26 · ავტორი: B (round 184')
lines[2] = 'განახლდა: 2026-10-26 · ავტორი: B (round 185 → round 186 დაგეგმვა, D-29z151) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`'
idx = next(i for i, l in enumerate(lines) if l.startswith('- **Round 184 (D-29z149)'))
new = ('- **Round 185 (D-29z150): STORE-REDESIGN STORE-0 (mock API) — მზადაა.** C PASS, `browserVerified: true`, `realVerified: true`; gate 185 გამოქვეყნდა `4a73ced` (store-ში მხოლოდ doc 152; mock loop-ის საქაღალდეშია). '
       'MOCK-SELF (selftest 134/134, C-ის 43 curl), MOCK-TYPES (tsc 0, negative control TS2353), STORE-HOME/LIST/PRODUCT 3 ზომაზე (რეალური preview დაკვრა), CART (0 „Failed to load cart“), G185-3 (fake Bearer → 403, mock-backed — ნამდვილი backend-ის მტკიცებულება არ არის), STUDIO-RV-185 (0 px), SCOPE, AN-REVIEW, REG-HYD — PASS (`c-round-185.md`). '
       'PX-NET-185 მთავარ გვერდზე ჩავარდა მხოლოდ წინასწარ არსებული `SpecialOffersSection.tsx:15` unsplash-ის გამო → C-R185-01 (Low). C-R185-02 (Low): არააქტიური პროდუქტი პირდაპირი URL-ით იყიდება $0.00-ად. I2/I3 → `deferred_low_polish`. '
       '**Round 186 (D-29z151): STORE-1a — მუშავდება.** C-ის ბაგები პირველ რიგში: C-R185-02 (არააქტიური → 404), C-R185-01 (ადგილობრივი `gift-card.png`) და პროდუქტის meta description მონაცემებიდან. STORE-1 დაიყო 1a–1d-ად (არაფერი ამოვარდა). რეგრესიის რაუნდი — 2026-10-27-დან პირველ დაგეგმვაზე (მოსალოდნელია Round 187).')
lines.insert(idx + 1, new)
i = next(i for i, l in enumerate(lines) if l.startswith('| STORE-REDESIGN |'))
cells = lines[i].split(' | ')
lines[i] = ('| STORE-REDESIGN | **მუშავდება** — STORE-0 (mock API) — **მზადაა** (Round 185 C PASS `browserVerified`, `4a73ced`; `mock-api/server.mjs` loop-ის საქაღალდეში, cloud hook ადასტურებულია — `mock_api_hook_confirmed`). '
            'STORE-1 დაიყო: **1a** (C-R185-02, C-R185-01, meta description) — **მუშავდება**, Round 186 (D-29z151); **1b** (AudioPlayer-ის progress/volume ფერი, AudioPreviewButton SSR/CSR) — **არ დაწყებულა**; **1c** (D15 header, ორმაგი h1, footer-ის სახელი) — **არ დაწყებულა**; **1d** (D10 entrance loader) — **არ დაწყებულა**. '
            'STORE-2 (token-ები და ტიპოგრაფია), STORE-3 (hero), STORE-4 (პროდუქტი და მოსმენა), STORE-5 (ჩატვირთვის ტექსტი, დიზაინის დოკუმენტები) — **არ დაწყებულა**. მიმართულება: **A — Obsidian & Brass gallery** (Saba, 2026-10-25). '
            'Saba-ს keep-list სავალდებულოა (LeadMagnet, Free Samples, SpecialOffers, Limited, testimonials/სტატისტიკა — მხოლოდ restyle) | '
            '`docs/technical/store-redesign/store-redesign-spec.md`, `direction-decision.md`; `c-round-185.md`; backlog `post_current_stage_queue` → STORE-REDESIGN (`store1_split_d29z151`) |')
open(p, 'w', encoding='utf-8').write('\n'.join(lines))
print('ok', idx, i)
