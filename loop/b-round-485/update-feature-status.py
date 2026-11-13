import os, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
M='/home/runner/czaba-project/tmp/studio-real-loop/b-round-485/update-feature-status.done'
if os.path.exists(M): sys.exit('already')
L=open(P).read().split('\n')
old='2026-11-13 · ავტორი: B (round 484 → round 485 დაგეგმვა, D-29z1723…D-29z1726)'
assert old in L[2]
L[2]=L[2].replace(old,'2026-11-13 · ავტორი: B (round 485 → round 486 დაგეგმვა, D-29z1727…D-29z1731)')
i=next(k for k,x in enumerate(L) if x.startswith('  შემდეგი (D-29z1724…D-29z1726): **round 485'))
L[i]='  ძველი: '+L[i][2:]
new=[
"  - **Round 485 = CLIENT-NAV-CONTRACT — C PASS; მზადაა (D-29z1727).** C round 485: 15 სტრიქონი PASS, `browserVerified`/`realVerified` true (`c-round-485.json`); gate 485 გამოქვეყნდა `0341229`-ზე (ორივე remote). client ნავიგაციისას ფარული `aria-live=polite` რეგიონი აცხადებს ახალი გვერდის სათაურს, 6 Store route-ს აქვს `<title>`, `releaseLinkFocus` გამაგრებულია. GATE479-M1-ROUTE-ANNOUNCE მზადაა live-region კონტრაქტისთვის; ეკრანის მკითხველით მოსმენა → Tech Lead row TLM-R485-SR-ROUTE-ANNOUNCE (ვადა RETRO 495, არ ბლოკავს). 4 Low დაიხურა. ახალი Low-ები `deferred_low_polish`-ში (D-29z1728): B-R485-STUDIO-PRODUCT-TITLE (დაცული `/studio/:productId` ჩუმადაა → ROOT-REQ-STUDIO-PRODUCT-TITLE), A-R485-REVIEW-L1-TARGET-CASE, GATE485-L1-H1-EXIT-WRAPPER.",
"  შემდეგი (D-29z1729…D-29z1731): **round 486 = B-R480-ORDER-CARD-KEYBOARD — მუშავდება.** „My Orders“-ის შეკვეთის ბარათი მხოლოდ მაუსით იხსნებოდა (`<div onClick>`); B-მ ბრაუზერში გაიმეორა: HEAD-ზე ბარათზე Tab-ის 0 გაჩერებაა. sketch: WAI-ARIA APG Accordion — `h3 > button` (`aria-expanded`, `aria-controls`, დამალული panel), focus ring ბარათის შიგნით, ხილული სახე HEAD-ის ტოლია (0 px სხვაობა). ტესტები OC1–OC4, 9 mutant წითელია, sketch-ზე სრული suite 4,263/4,263; tech-lead: APPROVE. backend-ით ნამდვილი შეკვეთები → BLOCKED (cloud). შემდეგ: round 487 = DPG-BUTTON-CLEANUP (ან REGRESSION, თუ დაგეგმვა 2026-11-16-ზე ან მის შემდეგ ხდება).",
]
L[i:i]=new
open(P,'w').write('\n'.join(L))
open(M,'w').write('ok\n'); print('ok')
