P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
L=open(P).read().split('\n')
assert L[2].startswith('განახლდა: 2026-11-12 · ავტორი: B (round 480 → round 481'), L[2][:80]
L[2]=L[2].replace('B (round 480 → round 481 დაგეგმვა, D-29z1708…D-29z1711)','B (round 481 → round 482 დაგეგმვა, D-29z1712…D-29z1715)')
i=next(k for k,x in enumerate(L) if x.startswith('  შემდეგი (D-29z1709…D-29z1711): **round 481'))
L[i]='  ძველი: '+L[i][2:]
new=[
"  - **Round 481 = B-R478-DEAD-MUSIC-LINK (account.orders-ის ნახევარი) — C PASS, გამოქვეყნდა; ბაგი ღიაა დაცული ნახევრის გამო (D-29z1712).** C round 481 PASS: C1–C8, `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-481.json`). „Browse Music“ ახლა `/store`-ზე მიდის ორივე viewport-ზე (L36 stub-ებით, სრული ჩატვირთვა, პირველი Tab ლოგოზე). Gate 481-მა გამოაქვეყნა `751e30e`. დაცული `account.downloads.tsx` ჯერ ისევ `/music`-ზე მიდის (C7) → ROOT-REQ-DOWNLOADS-MUSIC-LINK; ამიტომ B-R478-DEAD-MUSIC-LINK „მზადაა“ არ არის. რეალური მფლობელის გზა — BLOCKED (cloud-ში backend არ არის).",
"  შემდეგი (D-29z1713…D-29z1715): **round 482 = REGRESSION-2026-11-13, ნაწილი 1 — მოწმდება (მხოლოდ C; A კოდს არ ცვლის).** C ბრაუზერში ხელახლა ამოწმებს რაუნდების 426–481 ყველა დასრულებულ ელემენტს ორივე viewport-ზე: held Enter, SABA-B-12-ის native ელემენტები, ტექსტი და Export, IME, LeadMagnet, ფერები და token-ები, seek thumb, შესასვლელი, შრიფტები, scroll, client ნავიგაცია, My Orders. ასევე: `test:perf` ცალკე, perf lib, e2e smoke, auth და journey. ყველა `scope_additions` სახელით არის ჩამოთვლილი (L6). Oracle ყოველთვის ბოლო რაუნდის შედეგია, რომელმაც იგივე ზედაპირი შეცვალა. B-მ დაგეგმვა 2026-11-12T23:47Z-ზე დაიწყო, ვადამდე 13 წუთით ადრე; A და C 2026-11-13-ზე მუშაობენ (პრეცედენტი D-29z1476). შემდეგ: round 483 = REGRESSION ნაწილი 2 (≤ 425 და ძველი carry), round 484 = CLIENT-NAV-CONTRACT (GATE479-M1), round 485 = B-R480-ORDER-CARD-KEYBOARD, შემდეგ DPG-BUTTON-CLEANUP.",
]
L[i:i]=new
open(P,'w').write('\n'.join(L))
print('ok')
