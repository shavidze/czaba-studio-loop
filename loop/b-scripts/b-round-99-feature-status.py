P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
t=open(P,encoding='utf-8').read()
def rep(old,new,count=1):
    global t
    assert t.count(old)>=1, old[:80]
    t=t.replace(old,new,count)
rep('განახლდა: 2026-10-23 · ავტორი: B (round 98 → round 99 დაგეგმვა)','განახლდა: 2026-10-23 · ავტორი: B (round 99 → round 100 დაგეგმვა)')
rep('| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **ბაგია** → Round 99 (B-R98-HELD-ENTER-MULTI-ADD, Low: დაჭერილი Enter ყოველ auto-repeat-ზე ახალ კლიპს ამატებს — row, გლობალური Enter, ＋ დამატება; B-ის Chromium probe 0 → 3).',
    '| SRW-12 | ბიბლიოთეკა: ხე, ძებნა, preview, drag, სტემები | **ბაგია** → Round 100 (B-R98-H1-PREVIEW-TOGGLE-HOLD, Low: ▶ მოუსმინე-ზე დაჭერილი Enter preview-ს ყოველ auto-repeat-ზე რთავს/თიშავს — B-ის Chromium probe: 3 keydown → 3 click). B-R98-HELD-ENTER-MULTI-ADD დაიხურა — C round 99 PASS (`c-round-99.md`, ორივე viewport, 0 → 1), გამოქვეყნდა `e2412db`.')
import re
lines=t.split('\n')
for i,l in enumerate(lines):
    if l.startswith('| B-R98-HELD-ENTER-MULTI-ADD |'):
        lines[i]='| B-R98-HELD-ENTER-MULTI-ADD | Low | **დაიხურა** — C round 99 PASS `browserVerified`: HOLD-ROW, HOLD-BODY, HOLD-PLUS ორივე viewport-ზე 0 → 1; FRESH-ADD +2/+2/+1; HELD-ARROW-REG; AN-REVIEW (C-მ mutation-ები a, b, c, g გაიმეორა); გამოქვეყნდა `e2412db` | `c-round-99.md`, `c-round-99.json`, `gates/gate-round-99.json` | — |'
    elif l.startswith('| GATE98-S5-DOC086-STATUS |'):
        lines[i]='| GATE98-S5-DOC086-STATUS | Low | **დაიხურა** — C round 99 SOURCE-UNCHANGED (doc 086 l.4), გამოქვეყნდა `e2412db` | `c-round-99.md` | — |'
    elif l.startswith('| B-R98-H1-PREVIEW-TOGGLE-HOLD |'):
        lines[i]=('| B-R98-H1-PREVIEW-TOGGLE-HOLD | Low | **მუშავდება** → Round 100 (D-29z65). ჰიპოთეზა B-ის Chromium probe-ით დადასტურდა: ▶ მოუსმინე-ზე focus, `keyboard.down(\'Enter\')` ×3 → 3 click, ▶ → ■ → ▶ → ■. გამოსწორება: ღილაკზე `Enter && repeat` → `preventDefault` (＋-ის წესი). C 4 keydown-ით ამოწმებს, რომ საბოლოო მდგომარეობა განასხვავებდეს | `b-round-99-probe/probe-toggle-result.json`; `gates/round-99/review.md` #2 | A → C (HOLD-TOGGLE) |\n'
                  '| GATE99-S1-DOC087-STATUS | Low | **მუშავდება** → Round 100: doc 087 l.4 | `gates/round-99/review.md` #1 | A → C (SOURCE-UNCHANGED) |\n'
                  '| GATE99-S3-INLINE-ARROW-KEYDOWN | Info | ჩაიწერა — keep (reviewer: ღირებულება უმნიშვნელოა, არსებული ნიმუში); ARCH-R97 სიგნალის ნაწილი | `gates/round-99/review.md` #3 | — |\n'
                  '| C-R99-N1-CONCURRENT-ROUTE-LOAD | Info | ჩაიწერა — C-ის მეთოდი: route-ის ჩამტვირთავი G რიგი დაჭერილი ღილაკის გაზომვასთან ერთად არ ეშვება (Vite-ის reload); round 100-ის setup-შია | `c-round-99.json` N1 | C |')
    elif l.startswith('| ARCH-R97-EXPORT-FOOTER-KEYBOARD |'):
        lines[i]='| ARCH-R97-EXPORT-FOOTER-KEYBOARD | Info | ღიაა, არ არის დაგეგმილი — არქიტექტურული სიგნალი (gate 97–99, keep). round 100-ის შემდეგ repeat-Enter-ის guard 6 ადგილზეა; gate 99-ის reviewer-ი მცირე საერთო helper-ს გვთავაზობს (ღირებულება დაბალი, რისკი დაბალი). B root-ს SRW-12-ის held-Enter ოჯახის საზღვარზე ერთ შეზღუდულ checkpoint-ს სთხოვს — დამატება (l), (g)-სთან ერთად | `gates/round-97/review.md`, `gates/round-99/review.md` Architecture note; `b-round-91-checkpoint-request.md` (l) | root/B |'
t='\n'.join(lines)
anchor='Round 99 (D-29z64): დაჭერილი Enter ბიბლიოთეკიდან'
idx=t.index(anchor)
new=('Round 100 (D-29z65): ▶ მოუსმინე-ზე დაჭერილი Enter preview-ს ერთხელ რთავს (B-R98-H1-PREVIEW-TOGGLE-HOLD; B-ის Chromium probe 3 click-ს აჩვენებს). მხოლოდ toggle-ის `<button>`: `Enter && repeat` → `preventDefault`, `stopPropagation`-ის გარეშე; click, ახალი Enter და waveform-ის handler უცვლელია. GATE99-S1: doc 087 l.4. ტესტები HT1–HT3 ემატება `library-preview.test.tsx`-ს (მხოლოდ დამატება, harness-ის ახალი ასლის გარეშე), doc 088. Round 99 → C PASS `browserVerified`, გამოქვეყნდა `e2412db` (B-R98-HELD-ENTER-MULTI-ADD, GATE98-S5 დაიხურა). რეგრესიის რაუნდი ჯერ არ დამდგარა (2026-10-21 → 2026-10-23, 2 დღე); **შემდეგი B-ის დაგეგმვა 2026-10-24-ზე ან შემდეგ რეგრესიის რაუნდია, რაც არ უნდა დარჩეს ღია.** შემდეგ: Export footer-ის Low-ები (GATE89-S4 + A-R88 #4 + GATE97-S4, GATE89-S6) → GATE89-S3, C-R90-MUT-B-CU4-GAP, A-R87-LOW-PU-ORDER → GATE96-S2 → grid/tempo Low-ები → R21-I2 → T12 → VISUAL-A-OBSIDIAN. Root-ს ეთხოვა checkpoint (g)/(k)/(l) — არ ბლოკავს. ფარგლები არ მცირდება.\n\n')
t=t[:idx]+new+t[idx:]
open(P,'w',encoding='utf-8').write(t)
print('ok')
