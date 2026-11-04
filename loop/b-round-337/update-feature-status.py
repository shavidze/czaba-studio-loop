# B round 337 -> 338: feature-status.md edits (run once from the loop root; backup b-round-337/feature-status-before-338.md)
import pathlib, sys
P = 'feature-status.md'
if not pathlib.Path('b-round-337/feature-status-before-338.md').exists():
    sys.exit('backup missing')
s = open(P).read()
if 'Round 338 = PERF-DRAG-PREVIEW ეტაპი c3-ii' in s:
    sys.exit('already applied')
old = 'განახლდა: 2026-11-04 · ავტორი: B (round 336 → round 337 დაგეგმვა, D-29z1023…D-29z1030)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-04 · ავტორი: B (round 337 → round 338 დაგეგმვა, D-29z1031…D-29z1040)', 1)
old = '  - **Round 337 = SYS-R336-PERF-DRAG-WINDOW — მუშავდება (D-29z1025…D-29z1030).**'
assert s.count(old) == 1
s = s.replace(old, '  - **Round 337 = SYS-R336-PERF-DRAG-WINDOW — მზადაა (D-29z1031; C round 337 PASS, `browserVerified`/`realVerified` true, 9 row, ბაგი 0; gate 337 published `bbc281f`).** ძველი: მუშავდება (D-29z1025…D-29z1030).', 1)
anchor = '  შემდეგი: 337 SYS-R336 → REGRESSION-ROUND-2026-11-05'
i = s.index(anchor); j = s.index('\n', i) + 1
add = (
"  - **Round 338 = PERF-DRAG-PREVIEW ეტაპი c3-ii — მუშავდება (D-29z1031…D-29z1040).** სხვა ხაზზე კლიპის გადატანისას ghost-ები provider-ის `useState`-იდან ცალკე store-ში გადადის (`clip-lane-drag-store.ts`), ამიტომ ყოველ move-ზე აღარ ხდება provider-ისა და მთელი workspace-ის re-render. B-ის sketch-ზე: lane-ის `move-components-per-move` 58.969 → 24.906, cross-lane commit 87 → 5 component; ქცევა HEAD-ის ტოლია ორივე viewport-ზე (`b-round-337/probe/`). 7 lane row ხდება `assert` (≤ 25, == 1, == 0, liveness == 1, ახალი შემოწმება (e)). tech-lead-ის TL-1 (Medium) sketch-ში გასწორდა. ახალი ტესტები: DP49, DP50, CL1–CL4.\n"
"  შემდეგი: 338 c3-ii → REGRESSION-ROUND-2026-11-05 (პირველი დაგეგმვა 2026-11-05-ზე ან შემდეგ, D-29z1033) → c4 (group move; SIG-R338-GROUP-CROSS-PREVIEW) → c5 → conversions → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule).\n"
)
s = s[:j] + add + s[j:]
old = '| STUDIO-PERFORMANCE | **მუშავდება ('
assert s.count(old) == 1
s = s.replace(old, '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1031…D-29z1040: SYS-R336 მზადაა (round 337, `bbc281f`); round 338 = PERF-DRAG-PREVIEW c3-ii; შემდეგ REGRESSION (2026-11-05-დან), c4, c5.) ძველი: ', 1)
open(P, 'w').write(s)
print('ok')
