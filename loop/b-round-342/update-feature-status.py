# B round 342 -> 343: feature-status.md edits (backup b-round-342/feature-status-before-343.md)
import pathlib, sys
P = 'feature-status.md'
if not pathlib.Path('b-round-342/feature-status-before-343.md').exists():
    sys.exit('backup missing')
s = open(P).read()
if 'Round 343 = PERF-DRAG-PREVIEW' in s:
    sys.exit('already applied')
old = 'განახლდა: 2026-11-05 · ავტორი: B (round 341 → round 342 დაგეგმვა, D-29z1067…D-29z1074)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-05 · ავტორი: B (round 342 → round 343 დაგეგმვა, D-29z1075…D-29z1078)', 1)
old = '  - **Round 342 = REGRESSION-ROUND-2026-11-05, ნაწილი 3 (დარჩენილი row-ები) — მოწმდება (D-29z1067…D-29z1074).**'
assert s.count(old) == 1
s = s.replace(old, '  - **Round 342 = REGRESSION-ROUND-2026-11-05, ნაწილი 3 — PASS, რეგრესია დასრულდა (D-29z1075): 12/12 row-ს აქვს დასაშვები შედეგი (9 PASS, 3 recorded), ახალი ბაგი 0, Medium+ 0, `browserVerified` true (`c-round-342.json`). `regression-last.json` = 2026-11-05 / round 342; შემდეგი რეგრესია 2026-11-08-დან. შემდეგი რეგრესიის oracle-ები: POSCTL = c-round-342 (valid=false), FONT-PIXEL = c-round-341/out/fonts/ (D-29z1076).** ძველი: მოწმდება (D-29z1067…D-29z1074).', 1)
i = s.index('  შემდეგი: 342 REGRESSION (დარჩენილი)')
j = s.index('\n', i) + 1
add = ("  - **Round 343 = PERF-DRAG-PREVIEW c4-ii — მუშავდება (D-29z1077, D-29z1078).** group move-ის preview store-ში გადადის (provider და workspace ყოველ move-ზე აღარ ხატავს), collapsed group-ის overview drag-ს მიჰყვება, 10 group perf row ხდება assert. Package: `b-round-339/sketch/{source,tests}.patch.txt` + რეგენერირებული `b-round-342/sketch/budgets.patch.txt`; claims `b-round-342/claims-343.sh`. G343-AUTH-ის oracle: fake Bearer 403, როცა mock მუშაობს.\n"
       "  შემდეგი: 343 PERF-DRAG-PREVIEW c4-ii → c5 (video) → frontend-architect checkpoint-ის მოთხოვნა → conversions → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). რეგრესია 2026-11-08-დან; RETRO ~351.\n")
s = s[:j] + add + s[j:]
old = '| STUDIO-PERFORMANCE | **მუშავდება ('
assert s.count(old) == 1
s = s.replace(old, '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1075…D-29z1078: REGRESSION-ROUND-2026-11-05 დასრულდა round 342-ში; round 343 = c4-ii.) ძველი: (', 1)
open(P, 'w').write(s)
print('ok')
