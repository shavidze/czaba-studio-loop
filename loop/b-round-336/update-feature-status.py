# B round 336 -> 337: feature-status.md edits (run once from the loop root; backup b-round-336/feature-status-before-337.md)
import shutil
P = 'feature-status.md'
shutil.copyfile(P, 'b-round-336/feature-status-before-337.md')
s = open(P).read()
old = 'განახლდა: 2026-11-04 · ავტორი: B (round 335 → round 336 დაგეგმვა, D-29z1011…D-29z1022)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-04 · ავტორი: B (round 336 → round 337 დაგეგმვა, D-29z1023…D-29z1030)', 1)
old = '  - **Round 336 = RETRO 336 (ფანჯარა 321–335) + ეკრანისა და გზის მიმოხილვა — მოწმდება (D-29z1014…D-29z1022).**'
assert s.count(old) == 1
s = s.replace(old, '  - **Round 336 = RETRO 336 (ფანჯარა 321–335) + ეკრანისა და გზის მიმოხილვა — მზადაა (D-29z1023; C round 336 PASS, `browserVerified`/`realVerified` true, 10 row, ბაგი 0; gate 336 skipped — store-ში ცვლილება არ ყოფილა, HEAD `f1def9c`).** ძველი: მოწმდება (D-29z1014…D-29z1022).', 1)
anchor = '  შემდეგი: 336 RETRO → 337 REGRESSION'
i = s.index(anchor); j = s.index('\n', i) + 1
add = (
"  - **Round 337 = SYS-R336-PERF-DRAG-WINDOW — მუშავდება (D-29z1025…D-29z1030).** მხოლოდ ტესტი: perf spec-ში ერთი `dragWindow` helper, `rowWriter`, `pressedGesture` (წარუმატებელ gesture-ზე ღილაკი თავისუფლდება), lane-ის დასახელებული მუდმივები, `interactionSequence`-ის რიგი და 58 budget note (მხოლოდ `note`). GATE335-S1-ის premise HEAD-ზე არ დადასტურდა (throw მთელ pass-ს წყვეტს), ამიტომ fix hygiene-ია, დაკვირვებადი mutant-ით (D-29z1025). B-ის sketch v2-ზე: 139 row EQUAL C round 335-თან, 0 DIFF; mutant-ები P/M/D (`b-round-336/`). ხურავს GATE335-S1/S3/S4, A-R335-REVIEW-WHOLE-NOTE, INFO-A335-SEQUENCE-ORDER, ARCH-R335-DRAG-WINDOW-HELPER.\n"
"  შემდეგი: 337 SYS-R336 → REGRESSION-ROUND-2026-11-05 (პირველი დაგეგმვა 2026-11-05-ზე ან შემდეგ, D-29z1029) → c3-ii → c4 → c5 → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule).\n"
)
s = s[:j] + add + s[j:]
old = '| STUDIO-PERFORMANCE | **მუშავდება ('
assert s.count(old) == 1
s = s.replace(old, '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1023…D-29z1030: RETRO 336 მზადაა; round 337 = SYS-R336-PERF-DRAG-WINDOW (მხოლოდ ტესტი); შემდეგ REGRESSION (2026-11-05-დან), c3-ii, c4, c5.) ძველი: ', 1)
old = '| RETRO 336 | **მოწმდება** (D-29z1014)'
assert s.count(old) == 1
s = s.replace(old, '| RETRO 336 | **მზადაა** (D-29z1023) — C round 336 PASS: ყველა RT row, RT-SCREEN, G336-AUTH და STUDIO-SMOKE-336 ორივე viewport-ზე (`c-round-336.json`, `browserVerified` true). ძველი: მოწმდება (D-29z1014)', 1)
open(P, 'w').write(s)
print('ok')
