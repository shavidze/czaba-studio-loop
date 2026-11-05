# B round 343 -> 344: feature-status.md edits (backup b-round-343/feature-status-before-344.md). Run from the loop root.
import pathlib, sys
P = 'feature-status.md'
if not pathlib.Path('b-round-343/feature-status-before-344.md').exists():
    sys.exit('backup missing')
s = open(P).read()
if 'Round 344 = PERF-DRAG-PREVIEW c5-i' in s:
    sys.exit('already applied')
old = 'განახლდა: 2026-11-05 · ავტორი: B (round 342 → round 343 დაგეგმვა, D-29z1075…D-29z1078)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-05 · ავტორი: B (round 343 → round 344 დაგეგმვა, D-29z1079…D-29z1083)', 1)
old = '  - **Round 343 = PERF-DRAG-PREVIEW c4-ii — მუშავდება (D-29z1077, D-29z1078).**'
assert s.count(old) == 1
s = s.replace(old, '  - **Round 343 = PERF-DRAG-PREVIEW c4-ii — PASS, ეტაპი დასრულდა (D-29z1079):** C-ის 12 row PASS, ბაგი 0, `browserVerified` true (`c-round-343.json`); gate 343 გამოქვეყნდა `0aa317f`. group move 74.781 → 26.969 component თითო move-ზე; GATE338-S1 დაიხურა. A-ს 6 Low → `deferred_low_polish` (D-29z1080). ძველი ჩანაწერი:', 1)
i = s.index('  შემდეგი: 343 PERF-DRAG-PREVIEW c4-ii')
j = s.index('\n', i) + 1
add = ("  - **Round 344 = PERF-DRAG-PREVIEW c5-i — მუშავდება (D-29z1081…D-29z1083).** interactions perf harness-ში video კლიპის move drag-ის 11 `record` row (მხოლოდ 1×, pass-ის ბოლოს; fixture `public/videos/hero/1.mp4`). HEAD-ზე video drag ~94–101 component თითო move-ზე, provider + workspace + video dock ყოველ move-ზე (`b-round-343/probe/head-summary.txt`). B-ის sketch v3: 157 EQUAL, 0 DIFF, 55/55 assert, video stopped 98.35/move (`b-round-343/perf-rowcmp-sketch-vs-c343.txt`). Patch-ები `b-round-343/sketch/{spec,budgets}.patch.txt`; claims `b-round-343/claims-344.sh`. app კოდი არ იცვლება.\n"
       "  შემდეგი: 344 PERF-DRAG-PREVIEW c5-i → c5-ii (video preview store-ში; video row-ები → assert) → frontend-architect checkpoint-ის მოთხოვნა (ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE) → conversions → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). რეგრესია 2026-11-08-დან; RETRO ~351. Root-ისთვის: ROOT-REQ-PERF-INTERACTIONS-TIMEOUT (არა-დამბლოკავი).\n")
s = s[:j] + add + s[j:]
old = '| STUDIO-PERFORMANCE | **მუშავდება ('
assert s.count(old) == 1
s = s.replace(old, '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1079…D-29z1083: c4-ii დასრულდა round 343-ში; round 344 = c5-i.) ძველი: (', 1)
open(P, 'w').write(s)
print('ok')
