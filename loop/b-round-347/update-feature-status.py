# B round 347 -> 348: feature-status.md edits (backup b-round-347/feature-status-before-348.md). Run from the loop root.
import pathlib, sys
P = 'feature-status.md'
if not pathlib.Path('b-round-347/feature-status-before-348.md').exists():
    sys.exit('backup missing')
s = open(P).read()
if 'Round 348 = PERF-DRAG-PREVIEW conversions' in s:
    sys.exit('already applied')
old = 'განახლდა: 2026-11-05 · ავტორი: B (round 346 → round 347 დაგეგმვა, D-29z1095…D-29z1099)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-05 · ავტორი: B (round 347 → round 348 დაგეგმვა, D-29z1100…D-29z1104)', 1)
old = '  - **Round 347 = PERF-DRAG-PREVIEW c6-ii — მუშავდება (D-29z1097…D-29z1099).**'
assert s.count(old) == 1
s = s.replace(old, '  - **Round 347 = PERF-DRAG-PREVIEW c6-ii — PASS, ეტაპი დასრულდა (D-29z1100):** C-ის 14 row PASS, `browserVerified`/`realVerified` true (`c-round-347.json`), ბაგი 0; gate 347 გამოქვეყნდა `95774e6` ორივე remote-ზე. NAMES: fade 4, trim 15, move 12 (crossing 82), click 83; FADER-LANE და FADER-CLIPGAIN ორივე viewport-ზე (stale closure-ის probe-ები ჩათვლით) HEAD-ის ტოლია; perf 60/60 assert, 0 row გაზრდილი; fader spec 94/94, 0 DIFF. gate-ის და A-ის Low-ები → §5 routing (D-29z1101). ძველი ჩანაწერი:', 1)
anchor = '  შემდეგი: 347 c6-ii → conversions'
i = s.index(anchor)
j = s.index('\n', i) + 1
add = ('  - **Round 348 = PERF-DRAG-PREVIEW conversions — მუშავდება (D-29z1102…D-29z1104).** trim/move/fade-ის 1x row-ები `assert`-ზე C round 347-ის მნიშვნელობის ceil-ით: trim per-move/max `<= 15`, move per-move `<= 16` (crossing commit-ის ჩათვლით), fade per-move/max `<= 24` → `<= 4`, trim/move `release-commits` `== 1` (14 row, assert 60 → 70). fade `release-commits` (3/2) `record` რჩება — PERF-CAND-FADE-RELEASE-COMMITS; move max და 6x ასლები `record`. B-ის sketch და სამი perf mutant (fine, gross, combo): `b-round-347/perf-summary.txt`. DP63/DP65 `finally` (GATE347-S2). item-ის მიზანი ≤ 15: trim და fade სრულდება, move მხოლოდ steady state-ში (12) — item ჯერ არ არის მზადაა. claims `b-round-347/claims-348.sh`.\n'
       '  შემდეგი: 348 conversions → PERF-CAND-VIDEO-TRIM-FADE-ROWS → (root: ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE, ახლა სასურველია) → PERF-CAND-MASTER-GROUP-FADER-PROPS / project-end crossing → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). რეგრესია 2026-11-08-დან; RETRO ~351. Root-ისთვის: ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE, ROOT-REQ-PERF-TIMEOUT (არა-დამბლოკავი).\n')
s = s[:j] + add + s[j:]
open(P, 'w').write(s)
print('ok')
