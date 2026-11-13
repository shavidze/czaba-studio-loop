P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
L=open(P).read().split('\n')
old='2026-11-13 · ავტორი: B (round 482 → round 483 დაგეგმვა, D-29z1716…D-29z1718)'
assert old in L[2], L[2][:160]
L[2]=L[2].replace(old,'2026-11-13 · ავტორი: B (round 483 → round 484 დაგეგმვა, D-29z1719…D-29z1722)')
i=next(k for k,x in enumerate(L) if x.startswith('  შემდეგი (D-29z1717, D-29z1718): **round 483'))
L[i]='  ძველი: '+L[i][2:]
new=[
"  - **Round 483 = REGRESSION-2026-11-13, ნაწილი 2 — C PASS, მაგრამ `browserVerified: false` (D-29z1719).** C round 483: 24 სტრიქონი PASS, 0 ბაგი, 0 FAIL (`c-round-483.json`), მაგრამ სამი ჩასაწერი ბრაუზერის ქვე-სტრიქონი არ გაეშვა: R-FOLLOW-OFFSET-ის attribution ველები, R-CROSS-LANE-FIBERS-ის mounted lane-ების რაოდენობა და R423-STEM-WORKER-ის alt worker (`cloudflare/r2-worker.js`). ამიტომ regression ჯერ არ დახურულა და `regression-last.json` უცვლელია (2026-11-10 / 425). C-R425-01 (Low) დადასტურდა: 5/5 ცივი dev start-ი Vite-ის re-optimise ხაზით, production 16/16 სუფთა. Gate 483 გამოტოვდა (კოდი არ შეცვლილა).",
"  შემდეგი (D-29z1720…D-29z1722): **round 484 = REGRESSION-2026-11-13, ნაწილი 2-ის დარჩენილი ნახევარი — მოწმდება (მხოლოდ C; A კოდს არ ცვლის).** იგივე baseline `751e30e`. C ჯერ აკეთებს warm-up-ს MP3 export-ით, შემდეგ უშვებს სამ გამოტოვებულ ქვე-სტრიქონს. B-მ ამ სამის probe baseline-ზე უკვე გაუშვა (`b-round-483/probe/`). C ასევე ადარებს parked სტრიქონებს round 342-ის oracle-ს და ცალკე, მარტო უშვებს R295-LOAF-ს. PASS-ის შემდეგ regression იხურება და `regression-last.json` განახლდება. შემდეგ: round 485 = CLIENT-NAV-CONTRACT (GATE479-M1, sketch-ის წინასწარი შემოწმებით), round 486 = B-R480-ORDER-CARD-KEYBOARD, შემდეგ DPG-BUTTON-CLEANUP და DPG P1-ის დანარჩენი.",
]
L[i:i]=new
open(P,'w').write('\n'.join(L))
open('/home/runner/czaba-project/tmp/studio-real-loop/b-round-483/update-feature-status.done','w').write('ok\n')
print('ok')
