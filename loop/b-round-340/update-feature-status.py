# B round 340 -> 341: feature-status.md edits (backup b-round-340/feature-status-before-341.md)
import pathlib, sys
P = 'feature-status.md'
if not pathlib.Path('b-round-340/feature-status-before-341.md').exists():
    sys.exit('backup missing')
s = open(P).read()
if 'Round 341 = REGRESSION-ROUND-2026-11-05' in s:
    sys.exit('already applied')
old = 'განახლდა: 2026-11-05 · ავტორი: B (round 339 → round 340 დაგეგმვა, D-29z1049…D-29z1058)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-05 · ავტორი: B (round 340 → round 341 დაგეგმვა, D-29z1059…D-29z1066)', 1)
old = '  - **Round 340 = REGRESSION-ROUND-2026-11-05 — მოწმდება (D-29z1049…D-29z1058).**'
assert s.count(old) == 1
s = s.replace(old, '  - **Round 340 = REGRESSION-ROUND-2026-11-05 — დაუსრულებელი (D-29z1059; C BLOCKED: 6 row PASS, დანარჩენი არ გაეშვა, `browserVerified` false; gate 340 skipped, არაფერი გამოქვეყნებულა; ბაგი 0).** ძველი: მოწმდება (D-29z1049…D-29z1058).', 1)
i = s.index(old.replace('მოწმდება (D-29z1049…D-29z1058).**', '').strip()[:40]) if False else s.index('  - **Round 340 = REGRESSION-ROUND-2026-11-05 — დაუსრულებელი')
j = s.index('\n', i) + 1
add = ("  - **Round 341 = REGRESSION-ROUND-2026-11-05, გაგრძელება — მოწმდება (D-29z1059…D-29z1066).** C round 340-ის ყველა გაუშვებელ row-ს უშვებს (round 302–339-ის row-ები script → oracle ცხრილით, round 301-ის სექციები, parked row-ები, perf ცალკე, smoke, auth). A კოდს არ ცვლის. C round 340-ში თავისით, ~13 წუთში გაჩერდა (job limit არ ყოფილა; INFO-C340-EARLY-END, lessons L59). R340-HINT: round 303-ის კონტრაქტით hint reload-ის შემდეგ ისევ ჩანს — PASS (D-29z1062).\n"
       "  შემდეგი: 341 REGRESSION (გაგრძელება) → 342 PERF-DRAG-PREVIEW c4-ii (`b-round-339/current-task-c4-ii-draft.md`) ან ჯერ fix-up → c5 (video) → conversions → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → frontend-architect checkpoint → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule).\n")
s = s[:j] + add + s[j:]
old = '| STUDIO-PERFORMANCE | **მუშავდება ('
assert s.count(old) == 1
s = s.replace(old, '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1059…D-29z1066: round 340 რეგრესია დაუსრულებელია; round 341 = მისი გაგრძელება; c4-ii → round 342.) ძველი: (', 1)
open(P, 'w').write(s)
print('ok')
