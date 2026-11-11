"""B round 447 -> 448 feature-status update. Idempotent (update-feature-status.done)."""
import os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = f'{LOOP}/b-round-447/update-feature-status.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = f'{LOOP}/feature-status.md'
lines = open(p, encoding='utf-8').read().split('\n')
assert lines[2].startswith('განახლდა:'), lines[2][:40]
lines[2] = ('განახლდა: 2026-11-11 · ავტორი: B (round 447 → round 448 დაგეგმვა, D-29z1589…D-29z1591) · წესი: '
            '`docs/technical/studio-real-workspace/agent-workflow.md` (+ policy-ის SABA-B-4, SABA-B-7, SABA-B-8 და SABA-B-9/10/11 სექციები)')
idx = next(i for i, l in enumerate(lines) if l.startswith('  შემდეგი (D-29z1587…D-29z1588): **round 447 = STORE-2b-2a'))
lines[idx] = '  ძველი: ' + lines[idx][2:]
new = [
    '  - **Round 447 = STORE-2b-2a (teal ქრება Store-ის ხილული ეკრანებიდან) — მზადაა (D-29z1589).** C round 447 PASS: C1–C15, '
    '`browserVerified`/`realVerified` true, 0 ბაგი (`c-round-447.json`). Gate 447 გამოქვეყნდა `cce5eda` (review: COMMIT OK, 9/10; verify 279/4109). '
    '21 შემთხვევა 7 ფაილში მოიხსნა: Studio-ს showcase, entrance loader-ის wordmark (ერთფეროვანი light ink), SpecialOffers/Newsletter-ის hover glow, '
    'პროდუქტის ბარათის spotlight, `/gift-cards`, `/checkout/success`-ის ripple. keep-list-ის ტექსტი და ბმულები HEAD-ის იდენტურია. '
    'A-ს reviewer-ის Low-ები: L1 და L3 → round 448, L2 → `deferred_low_polish`, L4 (S ღილაკი ისევ ყვითელია) = C-ის O2 → `deferred_low_polish`. '
    'C-ის C14 „Sign in required“ ტექსტი cloud-ში ვერ გამოჩნდა (backend არ არის) — ეს B-ის spec-ის ხარვეზია; შესყიდვის დაცვის row ამიერიდან ამოწმებს '
    '0 `audio[src]`-ს და HEAD-თან თანხვედრას. **Saba-სთვის (წინადადება):** `.claude/primitives/DESIGN_TOKENS.md` ჯერ კიდევ teal brand-ს წერს '
    '(SABA-PROP-DESIGN-TOKENS-PRIMITIVE-STALE).',
    '  შემდეგი (D-29z1590…D-29z1591): **round 448 = STORE-2b-2b — მუშავდება.** `app/lib/email.server.ts` მკვდარი კოდია (0 importer, '
    'Shopify-ს მოხსნის შემდეგ, `3b094eb`) — არ ვაფერადებთ, გადადის LEGACY-DEAD-STORE-COMPONENTS-ში `PianoCurtainLoader.tsx`-თან ერთად. '
    'ცოცხალია მხოლოდ `/hire-us` ფორმის შიდა e-mail, რომელიც საიტის მფლობელს მოდის. B-მ HEAD-ის e-mail Chromium-ში გაზომა: ღია ფონის mail client-ში '
    '12 ტექსტიდან 10 კონტრასტს ვერ აკმაყოფილებს, ხოლო სახელი, პროექტის ტიპი და ბიუჯეტი თეთრია თეთრზე (B-R447-HIREUS-EMAIL-LIGHT-CLIENT, Medium). '
    'ფიქსი: e-mail-ს საკუთარი მუქი Obsidian ფონი, სათაურები და მნიშვნელობები light ink-ით, ბმული brass-ით, teal აღარ არის; ფერები `@theme` token-ების '
    'ზუსტი ასლია და ტესტი HE1 ამოწმებს. გვერდი `/hire-us` არ იცვლება. B-ის sketch-ზე: 0 ჩავარდნა ორივე client-ში (მინ. 7.06:1), 10/10 mutant წითელია, '
    'typecheck/build/სრული suite (281/4119) მწვანეა. რეალური გაგზავნა და Gmail/Outlook/Apple Mail — Tech Lead-ის შემოწმება '
    'TLM-R448-HIREUS-EMAIL-CLIENTS (ვადა RETRO 465). შემდეგ: 2b-3 (`app.css` glow/gradient) → 2b-4 → STORE-2c… REGRESSION 2026-11-13-დან, RETRO — round 450.',
]
lines[idx:idx] = new
open(p, 'w', encoding='utf-8').write('\n'.join(lines))
open(DONE, 'w').write('done\n')
print('feature-status updated at line', idx + 1)
