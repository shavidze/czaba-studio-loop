# B round 339 -> 340: feature-status.md edits (run once from the loop root; backup b-round-339/feature-status-before-340.md)
import pathlib, sys
P = 'feature-status.md'
if not pathlib.Path('b-round-339/feature-status-before-340.md').exists():
    sys.exit('backup missing')
s = open(P).read()
if 'Round 340 = REGRESSION-ROUND-2026-11-05' in s:
    sys.exit('already applied')
old = 'განახლდა: 2026-11-04 · ავტორი: B (round 338 → round 339 დაგეგმვა, D-29z1041…D-29z1048)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-05 · ავტორი: B (round 339 → round 340 დაგეგმვა, D-29z1049…D-29z1058)', 1)
old = '  - **Round 339 = PERF-DRAG-PREVIEW ეტაპი c4-i — მუშავდება (D-29z1041…D-29z1048).**'
assert s.count(old) == 1
s = s.replace(old, '  - **Round 339 = PERF-DRAG-PREVIEW ეტაპი c4-i — მზადაა (D-29z1049; C round 339 PASS, 10 row, `browserVerified`/`realVerified` true, ბაგი 0; gate 339 published `99a5912`).** ძველი: მუშავდება (D-29z1041…D-29z1048).', 1)
anchor = '  შემდეგი: 339 c4-i → REGRESSION-ROUND-2026-11-05'
i = s.index(anchor); j = s.index('\n', i) + 1
add = (
"  - **Round 340 = REGRESSION-ROUND-2026-11-05 — მოწმდება (D-29z1049…D-29z1058).** რეგრესიის რაუნდი დადგა (`regression-last` 2026-11-02 → დაგეგმვა დასრულდა 2026-11-05-ზე). C ბრაუზერში თავიდან ამოწმებს ყველა დასრულებულ ფუნქციას (round 301-ის სექციები + 302–339-ის რაუნდების თითო მოკლე row, scope additions SA-1…SA-20), perf-ს ცალკე, smoke-სა და auth-ის დაცვას. A კოდს არ ცვლის.\n"
"  შემდეგი: 340 REGRESSION → 341 PERF-DRAG-PREVIEW c4-ii (უკვე დაგეგმილი და გაზომილი: `b-round-339/current-task-c4-ii-draft.md`; group move-ის preview store-ში, 74.781 → 26.969 component / move; ჩაკეცილი group-ის overview drag-ს მიჰყვება; ვიდეოიანი group ძველ გზაზე, c5) → c5 (video) → conversions → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → frontend-architect checkpoint (PERF-DRAG-PREVIEW-ის ბოლოს) → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule).\n"
)
s = s[:j] + add + s[j:]
old = '| STUDIO-PERFORMANCE | **მუშავდება ('
assert s.count(old) == 1
s = s.replace(old, '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1049…D-29z1058: PERF-DRAG-PREVIEW c4-i მზადაა (round 339, `99a5912`); round 340 = REGRESSION-ROUND-2026-11-05; round 341 = c4-ii (group preview store-ში, დაგეგმილია); შემდეგ c5.) ძველი: ', 1)
open(P, 'w').write(s)
print('ok')
