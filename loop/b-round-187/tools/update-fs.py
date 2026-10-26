import sys
p = sys.argv[1]
lines = open(p, encoding='utf-8').read().split('\n')
assert lines[2].startswith('განახლდა: 2026-10-26 · ავტორი: B (round 186')
lines[2] = 'განახლდა: 2026-10-26 · ავტორი: B (round 187 → round 188 დაგეგმვა, D-29z153) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`'
idx = next(i for i, l in enumerate(lines) if l.startswith('- **Round 186 (D-29z151): STORE-1a — მზადაა.'))
new = ('- **Round 187 (D-29z152): STORE-1b — მზადაა.** C PASS, `browserVerified: true`, `realVerified: true`, 11 row, ბაგი 0; gate 187 გამოქვეყნდა `cb24362`. '
       'FILL-187 (progress/volume-ის ფერი runtime probe-ით `rgb(18, 217, 200)`, ΔE ≤ 2.26, volume 0.70/0.30 ±3 %, კონტრასტი 8.15–8.71:1), FLIP-187 (JS-off და hydrated `outerHTML` იდენტურია, ზომები Δ 0), PREVIEW-187 (რეალური აუდიო ≥ 1 s; card-ის click არ ნავიგირებს), STORE-AFTER-187 (ცვლილება მხოლოდ ორ track-ში; home LCP ≤ 0.38 s), G187-3 (mock-backed), STUDIO-RV (0 px), SCOPE, T-RUN (start-ზე 10 წითელი), AN-REVIEW, PX-NET/REG-HYD — PASS (`c-round-187.md`). '
       'ინფო: C-R187-I1 (entrance loader ~3–5.4 s ფარავს `/`-ის card-ის Play-ს → STORE-1d-ის მიღებაში), C-R187-I2 (LeadMagnet popup scrolled shot-ებში — baseline-ის შენიშვნა); `/store`-ზე preview ღილაკი საერთოდ არ არის (დავალების ტექსტის შესწორება). '
       '**Round 188 (D-29z153): STORE-1c — მუშავდება.** Header (desktop და mobile): Collections (`/store`, R56) · Studio (`/studio-lab`, „Demo“ badge-ის გარეშე) · Free Samples · About; Gift Cards და Hire Us მხოლოდ footer-ში (R57); wordmark — `<span>` gradient-ის გარეშე, ყოველ გვერდზე ერთი h1 (R59); footer — `© CZABA` (R58); „Sign In“ უცვლელი (R60); e2e navigation-ის სია; doc 154-ის სტატუსი. რეგრესიის რაუნდი — 2026-10-27-დან პირველ დაგეგმვაზე (მოსალოდნელია Round 189).')
lines.insert(idx + 1, new)
i = next(i for i, l in enumerate(lines) if l.startswith('| STORE-REDESIGN |'))
lines[i] = ('| STORE-REDESIGN | **მუშავდება** — STORE-0 (mock API) — **მზადაა** (Round 185, `4a73ced`). '
            'STORE-1 დაიყო: **1a** (C-R185-02, C-R185-01, meta description) — **მზადაა** (Round 186, `cc207d6`); **1b** (AudioPlayer-ის progress/volume ფერი, AudioPreviewButton-ის ერთი markup) — **მზადაა** (Round 187 C PASS `browserVerified`, `cb24362`); **1c** (D15 header, ორმაგი h1, plain wordmark, footer-ის სახელი) — **მუშავდება**, Round 188 (D-29z153); **1d** (D10 entrance loader; + C-R187-I1: loader-მა card-ის Play არ უნდა დაბლოკოს) — **არ დაწყებულა**. '
            'STORE-2 (token-ები და ტიპოგრაფია; + C-R186-02, A-R187-PRODUCTCARD-PRIMARY-TOKEN), STORE-3 (hero), STORE-4 (პროდუქტი და მოსმენა; + C-R186-01), STORE-5 (ჩატვირთვის ტექსტი, დიზაინის დოკუმენტები) — **არ დაწყებულა**. მიმართულება: **A — Obsidian & Brass gallery** (Saba, 2026-10-25). '
            'Saba-ს keep-list სავალდებულოა (LeadMagnet, Free Samples, SpecialOffers, Limited, testimonials/სტატისტიკა — მხოლოდ restyle) | '
            '`docs/technical/store-redesign/store-redesign-spec.md`, `direction-decision.md`; `c-round-187.md`; backlog `post_current_stage_queue` → STORE-REDESIGN (`store1c_plan_d29z153`) |')
open(p, 'w', encoding='utf-8').write('\n'.join(lines))
print('ok', idx, i)
