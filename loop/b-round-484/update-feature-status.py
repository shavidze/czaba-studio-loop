import os, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
M='/home/runner/czaba-project/tmp/studio-real-loop/b-round-484/update-feature-status.done'
if os.path.exists(M): sys.exit('already')
L=open(P).read().split('\n')
old='2026-11-13 · ავტორი: B (round 483 → round 484 დაგეგმვა, D-29z1719…D-29z1722)'
assert old in L[2]
L[2]=L[2].replace(old,'2026-11-13 · ავტორი: B (round 484 → round 485 დაგეგმვა, D-29z1723…D-29z1726)')
i=next(k for k,x in enumerate(L) if x.startswith('  შემდეგი (D-29z1720…D-29z1722): **round 484'))
L[i]='  ძველი: '+L[i][2:]
new=[
"  - **Round 484 = REGRESSION-2026-11-13, ნაწილი 2-ის დარჩენილი ნახევარი — C PASS; REGRESSION-2026-11-13 მზადაა (D-29z1723).** C round 484: 8 სტრიქონი PASS, 0 ბაგი, `browserVerified`/`realVerified` true (`c-round-484.json`). warm-up MP3 export-ით, R295-LOAF, Follow attribution (3 გაშვება თითო viewport-ზე), cross-lane, alt worker, parked oracle compare და auth გაიარა. C-R425-02 Low რჩება: გადახრა ±4 px-ის ფარგლებშია და გაშვებიდან გაშვებამდე იცვლება; მიზეზი ჰიპოთეზაა. `regression-last.json` = 2026-11-13 / 484; შემდეგი regression 2026-11-16-დან. Gate 484 გამოტოვდა (კოდი არ შეცვლილა).",
"  შემდეგი (D-29z1724…D-29z1726): **round 485 = CLIENT-NAV-CONTRACT — მუშავდება.** client ნავიგაციისას ეკრანის მკითხველს ახალი გვერდის სახელი უნდა ეცნობოს (GATE479-M1-ROUTE-ANNOUNCE, Medium). `RouteTransition`-ში ემატება ფარული `aria-live=polite` რეგიონი: ჯერ `document.title`, შემდეგ გვერდის h1; პირველ ჩატვირთვაზე ჩუმად რჩება; Studio ↔ Store გადასვლაც ცხადდება. `releaseLinkFocus`-ს ემატება try/finally და გამოტოვება `target`/`download` ბმულებზე; დოკში იწერება slow-loader-ის შენიშვნა. ერთად იხურება 4 Low. B-მ sketch ბრაუზერში წინასწარ შეამოწმა (`b-round-484/probe/`), 10 mutant წითელია, sketch-ზე სრული suite 4,255/4,255. ეკრანის მკითხველით შემოწმება → Tech Lead row TLM-R485-SR-ROUTE-ANNOUNCE. შემდეგ: round 486 = B-R480-ORDER-CARD-KEYBOARD, შემდეგ DPG-BUTTON-CLEANUP და DPG P1-ის დანარჩენი.",
]
L[i:i]=new
open(P,'w').write('\n'.join(L))
open(M,'w').write('ok\n'); print('ok')
