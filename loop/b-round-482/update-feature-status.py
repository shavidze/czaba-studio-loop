P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
L=open(P).read().split('\n')
assert 'B (round 481 → round 482 დაგეგმვა, D-29z1712…D-29z1715)' in L[2], L[2][:120]
L[2]=L[2].replace('2026-11-12 · ავტორი: B (round 481 → round 482 დაგეგმვა, D-29z1712…D-29z1715)','2026-11-13 · ავტორი: B (round 482 → round 483 დაგეგმვა, D-29z1716…D-29z1718)')
i=next(k for k,x in enumerate(L) if x.startswith('  შემდეგი (D-29z1713…D-29z1715): **round 482'))
L[i]='  ძველი: '+L[i][2:]
new=[
"  - **Round 482 = REGRESSION-2026-11-13, ნაწილი 1 — C PASS (D-29z1716).** C round 482: 26 სტრიქონი PASS, 0 ბაგი, `browserVerified`/`realVerified` true (`c-round-482.json`); claims დასაწყისში და ბოლოს უდრის დაგეგმვის output-ს. `test:perf` (5 spec, 95 assert), perf lib (54), smoke (2), auth — PASS. Gate 482 გამოტოვდა (კოდი არ შეცვლილა). `regression-last.json` ნაწილი 2-ის დასრულებამდე არ იცვლება. ახალი ელემენტი „მზადაა“ არ გამხდარა (regression უკვე დასრულებულს ამოწმებს). INFO-C482-PLAYWAV-IDENTICAL ჩაიწერა; StudioShowcase-ის ყვითელი/წითელი Solo/Mute — სიგნალი DP gate-ისთვის.",
"  შემდეგი (D-29z1717, D-29z1718): **round 483 = REGRESSION-2026-11-13, ნაწილი 2 — მოწმდება (მხოლოდ C; A კოდს არ ცვლის).** იგივე baseline `751e30e`. C ბრაუზერში იმეორებს round 423-ის (391–422) და round 425-ის (≤ 390) სტრიქონებს და ძველ carry-ს: R-RVM (production 8 ჩატვირთვა + 5 ცივი dev start), R-CROSS-LANE-FIBERS, R-FOLLOW-OFFSET, R-DEV-WARMUP, R-EVICT-PIN. `test:perf`, perf lib და smoke round 482-დან გადმოდის (იგივე ხე). 426–481-ის მიზანმიმართული ცვლილებით ახსნილი სხვაობა `lookups`-ში მიდის. შემდეგ: regression-last განახლება, round 484 = CLIENT-NAV-CONTRACT (GATE479-M1), round 485 = B-R480-ORDER-CARD-KEYBOARD, შემდეგ DPG-BUTTON-CLEANUP.",
]
L[i:i]=new
open(P,'w').write('\n'.join(L))
print('ok')
