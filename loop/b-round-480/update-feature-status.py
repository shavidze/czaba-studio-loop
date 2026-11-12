P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
L=open(P,encoding='utf-8').read().split('\n')
assert L[2].startswith('განახლდა: 2026-11-12 · ავტორი: B (round 479 → round 480'), L[2][:80]
L[2]=L[2].replace('B (round 479 → round 480 დაგეგმვა, D-29z1700…D-29z1707)','B (round 480 → round 481 დაგეგმვა, D-29z1708…D-29z1711)',1)
i=next(k for k,l in enumerate(L) if l.startswith('  შემდეგი (D-29z1702…D-29z1706): **round 480 = RETRO 480'))
new=[
"  - **Round 480 = RETRO 480 (რაუნდები 465–479) — მზადაა (D-29z1708).** C round 480 PASS: 13 რიგი, ბრაუზერში G480-AUTH, STUDIO-SMOKE-480 და RT-SCREEN ორივე viewport-ზე, `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-480.json`); fake-bearer — BLOCKED (cloud-ში backend არ არის). Gate 480 გამოტოვდა („no real changes“), HEAD რჩება `bbb3193`. ანგარიში `retros/retro-480.md`; Saba-ს კითხვები `user-review/questions-retro-480.md` (Q1–Q7) პასუხს ელოდება.",
"  შემდეგი (D-29z1709…D-29z1711): **round 481 = B-R478-DEAD-MUSIC-LINK (account.orders-ის ნახევარი) — მუშავდება.** „My Orders“-ის ცარიელ მდგომარეობაში „Browse Music“ `/music`-ის (404) ნაცვლად `/store`-ზე მიდის; ბმული ჩვეულებრივ `<a>`-დ რჩება (გვერდის სრული ჩატვირთვა, სათაური კვლავ ცხადდება). B-მ ბრაუზერში stub-ებით შეამოწმა HEAD (404) და sketch (`/store`), `b-round-480/probe/`. დაცული `account.downloads.tsx`-ის ნახევარი → ROOT-REQ-DOWNLOADS-MUSIC-LINK (root/Saba). **ახალი ბაგი:** B-R480-ORDER-CARD-KEYBOARD (Medium) — შეკვეთის ბარათი მხოლოდ მაუსით იხსნება → round 484. შემდეგ: round 482 = REGRESSION-2026-11-13, round 483 = CLIENT-NAV-CONTRACT (GATE479-M1), round 484 = B-R480-ORDER-CARD-KEYBOARD, შემდეგ DPG-BUTTON-CLEANUP.",
"  ძველი: "+L[i].lstrip(),
]
L[i:i+1]=new
open(P,'w',encoding='utf-8').write('\n'.join(L))
print('ok', i)
