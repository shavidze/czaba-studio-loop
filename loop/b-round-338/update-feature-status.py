# B round 338 -> 339: feature-status.md edits (run once from the loop root; backup b-round-338/feature-status-before-339.md)
import pathlib, sys
P = 'feature-status.md'
if not pathlib.Path('b-round-338/feature-status-before-339.md').exists():
    sys.exit('backup missing')
s = open(P).read()
if 'Round 339 = PERF-DRAG-PREVIEW ეტაპი c4-i' in s:
    sys.exit('already applied')
old = 'განახლდა: 2026-11-04 · ავტორი: B (round 337 → round 338 დაგეგმვა, D-29z1031…D-29z1040)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-04 · ავტორი: B (round 338 → round 339 დაგეგმვა, D-29z1041…D-29z1048)', 1)
old = '  - **Round 338 = PERF-DRAG-PREVIEW ეტაპი c3-ii — მუშავდება (D-29z1031…D-29z1040).**'
assert s.count(old) == 1
s = s.replace(old, '  - **Round 338 = PERF-DRAG-PREVIEW ეტაპი c3-ii — მზადაა (D-29z1041; C round 338 PASS, 10 row, `browserVerified`/`realVerified` true, ბაგი 0; gate 338 published `662ed42`).** ძველი: მუშავდება (D-29z1031…D-29z1040).', 1)
anchor = '  შემდეგი: 338 c3-ii → REGRESSION-ROUND-2026-11-05'
i = s.index(anchor); j = s.index('\n', i) + 1
add = (
"  - **Round 339 = PERF-DRAG-PREVIEW ეტაპი c4-i — მუშავდება (D-29z1041…D-29z1048).** interactions perf harness-ში ემატება ორი მონიშნული კლიპის (group) move-ის სცენარი: საკუთარ ხაზზე, შემდეგ ხაზზე და უკან, stopped და playing. HEAD-ზე (dev probe, 1440×900 და 1280×720, `b-round-338/probe/`) group-ის same-lane move ყოველ move-ზე ~104 component-ს render-ავს provider-ითა და `StudioWorkspace`-ით (ერთი კლიპი: 19). ახალი 26 row `record`-ია, liveness `interact.harness.drag-group-live` კი `assert == 1` (B-ის sketch perf run + mutant MU-GROUP-SINGLE). აპის კოდი არ იცვლება. c4-ii (fix) შემდეგია.\n"
"  შემდეგი: 339 c4-i → REGRESSION-ROUND-2026-11-05 (პირველი დაგეგმვა 2026-11-05-ზე ან შემდეგ) → c4-ii (group move preview store-ში; collapsed group overview reader; blocked-move status) → c5 → conversions → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule).\n"
)
s = s[:j] + add + s[j:]
old = '| STUDIO-PERFORMANCE | **მუშავდება ('
assert s.count(old) == 1
s = s.replace(old, '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1041…D-29z1048: PERF-DRAG-PREVIEW c3-ii მზადაა (round 338, `662ed42`); round 339 = c4-i (group move harness rows); შემდეგ REGRESSION (2026-11-05-დან), c4-ii, c5.) ძველი: ', 1)
open(P, 'w').write(s)
print('ok')
