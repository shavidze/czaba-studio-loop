import sys
p = sys.argv[1]
lines = open(p, encoding='utf-8').read().split('\n')
assert lines[2].startswith('განახლდა: 2026-10-26 · ავტორი: B (round 185')
lines[2] = 'განახლდა: 2026-10-26 · ავტორი: B (round 186 → round 187 დაგეგმვა, D-29z152) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`'
idx = next(i for i, l in enumerate(lines) if l.startswith('- **Round 185 (D-29z150)'))
new = ('- **Round 186 (D-29z151): STORE-1a — მზადაა.** C PASS, `browserVerified: true`, `realVerified: true`, 12 row; gate 186 გამოქვეყნდა `cc207d6`. '
       'INACTIVE-186 (`/products/archived-rain` → 404 სამივე ზომაზე, mock-მა 200 დააბრუნა — უარი store-მა თქვა), META-186 (description/og/twitter fixture-იდან, SSR და hydration-ის შემდეგ), PX-NET-186 (0 unsplash), OFFERS-VIS, STORE-AFTER (home LCP ≤ 0.4 s, CLS < 0.002), PREVIEW, G186-3 (mock-backed), STUDIO-RV (0 px), SCOPE, T-RUN, AN-REVIEW, REG-HYD — PASS (`c-round-186.md`). C-R185-01/02 — გადაწყდა. '
       'ახალი Low-ები: C-R186-01 (ვარიანტების გარეშე აქტიური SFX $0.00 — purchase path, backend-ის კონტრაქტი უცნობია; Medium ხდება, თუ რეალური API ასეთ პროდუქტს აბრუნებს; owner STORE-4) და C-R186-02 (Gift Cards-ის აბზაცის კონტრასტი ოქროსფერ ასოებზე → `deferred_low_polish`, owner STORE-2). '
       '**Round 187 (D-29z152): STORE-1b — მუშავდება.** AudioPlayer-ის progress/volume ფერი (`--color-primary` არსად არ არის განსაზღვრული → `--color-brand`) და AudioPreviewButton-ის mount-ის შემდგომი ცვლილება (ერთი interactive markup, R55 — „Preview“ წარწერის გარეშე); doc 153-ის სტატუსი. რეგრესიის რაუნდი — 2026-10-27-დან პირველ დაგეგმვაზე (მოსალოდნელია Round 188).')
lines.insert(idx + 1, new)
i = next(i for i, l in enumerate(lines) if l.startswith('| STORE-REDESIGN |'))
lines[i] = ('| STORE-REDESIGN | **მუშავდება** — STORE-0 (mock API) — **მზადაა** (Round 185, `4a73ced`). '
            'STORE-1 დაიყო: **1a** (C-R185-02, C-R185-01, meta description) — **მზადაა** (Round 186 C PASS `browserVerified`, `cc207d6`); **1b** (AudioPlayer-ის progress/volume ფერი, AudioPreviewButton-ის ერთი markup) — **მუშავდება**, Round 187 (D-29z152); **1c** (D15 header, ორმაგი h1, footer-ის სახელი) — **არ დაწყებულა**; **1d** (D10 entrance loader) — **არ დაწყებულა**. '
            'STORE-2 (token-ები და ტიპოგრაფია; + C-R186-02), STORE-3 (hero), STORE-4 (პროდუქტი და მოსმენა; + C-R186-01), STORE-5 (ჩატვირთვის ტექსტი, დიზაინის დოკუმენტები) — **არ დაწყებულა**. მიმართულება: **A — Obsidian & Brass gallery** (Saba, 2026-10-25). '
            'Saba-ს keep-list სავალდებულოა (LeadMagnet, Free Samples, SpecialOffers, Limited, testimonials/სტატისტიკა — მხოლოდ restyle) | '
            '`docs/technical/store-redesign/store-redesign-spec.md`, `direction-decision.md`; `c-round-186.md`; backlog `post_current_stage_queue` → STORE-REDESIGN (`store1b_plan_d29z152`) |')
open(p, 'w', encoding='utf-8').write('\n'.join(lines))
print('ok', idx, i)
