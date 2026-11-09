# B round 419 -> 420 feature-status update (D-29z1462..D-29z1466). Run once from the loop root.
import os, sys
if os.path.exists('b-round-419/update-feature-status.done'): sys.exit('already applied')
p = 'feature-status.md'; L = open(p, encoding='utf-8').read().split('\n')
i3 = [i for i, l in enumerate(L) if l.startswith('განახლდა: 2026-11-09 · ავტორი: B (round 418 → round 419 დაგეგმვა')]
assert len(i3) == 1
L[i3[0]] = L[i3[0]].replace('B (round 418 → round 419 დაგეგმვა, D-29z1458…D-29z1461)', 'B (round 419 → round 420 დაგეგმვა, D-29z1462…D-29z1466)')
nx = [i for i, l in enumerate(L) if l.startswith('  შემდეგი (D-29z1460…D-29z1461): **round 419 = SYS-R369')]
assert len(nx) == 1
k = nx[0]
L[k] = '  ძველი: ' + L[k][2:]
L[k:k] = [
 '  - **Round 419 = SYS-R369-STEM-CACHE-WRITE-COORDINATOR — მზადაა (D-29z1462).** C round 419 PASS: 8 row, `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-419.json`); 49/49, 15 mutant-ის ხაზი B-ისას ემთხვევა, დატვირთვაზე 43/43; production build-ის stem-cache შედარება 1440×900 და 1280×720-ზე HEAD-ის ტოლია, Play/Stop და auth რეალურ Chromium-ში. Gate 419 გამოქვეყნდა `6609dfa`. დაიხურა 8 Low + TL-R419-L1; R419-CR-1 → `deferred_low_polish`.',
 '  - **STUDIO-PERFORMANCE — loop-ში დასრულდა (D-29z1463).** გასაშვები ეტაპი აღარ დარჩა; დარჩენილი ნაწილები Saba-ს (PERF-4b, 9c, 11b, 12b, 14c-ii/iii), root-ის (9d, ROOT-REQ-*), backend-ის (4c) ან Tech Lead-ის (Firefox) ხელშია, ვადა RETRO 435.',
 '  შემდეგი (D-29z1465…D-29z1466): **round 420 = RETRO 420 — მოწმდება** (ფანჯარა 416–419, queue entry-ის დასრულების წესით; `retros/retro-420.md`, `user-review/screen-review-420.md`; app კოდი არ იცვლება). შემდეგ 421 REGRESSION-2026-11-10 → SYS-R418-PREVIEW-LIFECYCLE → STEM-LANES (ელოდება Saba-ს პასუხს `user-review/AGREE-STEM-LANES.md`-ზე; თუ პასუხი ჯერ არ არის — SYS-1…3, შემდეგ STORE-2b…5) → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2. შემდეგი RETRO — 435.',
]
row = [i for i, l in enumerate(L) if l.startswith('| STUDIO-PERFORMANCE | **მუშავდება (D-29z1461)')]
assert len(row) == 1
L[row[0]] = L[row[0]].replace('| STUDIO-PERFORMANCE | **მუშავდება (D-29z1461)', '| STUDIO-PERFORMANCE | **loop-ში დასრულდა, ნარჩენები Saba/root/backend-ის ხელშია (D-29z1463): SYS-R369 მზადაა (round 419, `6609dfa`); ვადა RETRO 435.** ძველი: **მუშავდება (D-29z1461)', 1)
pd = [i for i, l in enumerate(L) if l.startswith('| PD-REVIEW-2026-10-31 | **მუშავდება**')]
assert len(pd) == 1
L[pd[0]] = L[pd[0]].replace('| PD-REVIEW-2026-10-31 | **მუშავდება**', '| PD-REVIEW-2026-10-31 | **მუშავდება** (D-29z1464: STEM-LANES — **დაბლოკილია: ელოდება Saba-ს** `user-review/AGREE-STEM-LANES.md`-ზე (Q1–Q5; „Stems group უკვე არსებობს“ HEAD-ზე არ მართლდება); frontend-architect checkpoint ARCH-CHECKPOINT-STEM-LANES root-თან)', 1)
open(p, 'w', encoding='utf-8').write('\n'.join(L))
open('b-round-419/update-feature-status.done', 'w').write('ok\n'); print('ok')
