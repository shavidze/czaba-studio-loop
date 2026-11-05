# B round 341 -> 342: feature-status.md edits (backup b-round-341/feature-status-before-342.md)
import pathlib, sys
P = 'feature-status.md'
if not pathlib.Path('b-round-341/feature-status-before-342.md').exists():
    sys.exit('backup missing')
s = open(P).read()
if 'Round 342 = REGRESSION-ROUND-2026-11-05' in s:
    sys.exit('already applied')
old = 'განახლდა: 2026-11-05 · ავტორი: B (round 340 → round 341 დაგეგმვა, D-29z1059…D-29z1066)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-05 · ავტორი: B (round 341 → round 342 დაგეგმვა, D-29z1067…D-29z1074)', 1)
old = '  - **Round 341 = REGRESSION-ROUND-2026-11-05, გაგრძელება — მოწმდება (D-29z1059…D-29z1066).**'
assert s.count(old) == 1
s = s.replace(old, '  - **Round 341 = REGRESSION-ROUND-2026-11-05, გაგრძელება — დაუსრულებელი (D-29z1067): გაშვებული row-ები PASS, Medium+ ბაგი 0, Low 2 (C-R341-01 = C-R318-06-ის repro, C-R341-02 font preload warning client navigation-ზე → `deferred_low_polish`); `browserVerified` false, რადგან script-იანი row-ები გაუშვებელი დარჩა; gate 341 skipped (ცვლილება არ არის). C-მ შეცდომით loop-ის ძველი untracked WAV evidence წაშალა (INFO-C341-DELETE-MISTAKE, L60).** ძველი: მოწმდება (D-29z1059…D-29z1066).', 1)
i = s.index('  შემდეგი: 341 REGRESSION (გაგრძელება)')
j = s.index('\n', i) + 1
add = ("  - **Round 342 = REGRESSION-ROUND-2026-11-05, ნაწილი 3 (დარჩენილი row-ები) — მოწმდება (D-29z1067…D-29z1074).** A კოდს არ ცვლის. C უშვებს დახურულ სიას: WK-GUARD/HEAD-CONTROL, R301-PRICE, RS 1280-ზე, RG-22 narrow, parked RP row-ები, posctl ახალი oracle, auth. B-მ გადაწყვიტა: \"press L\" ქვე-row ბათილია (B-ის spec შეცდომა), FONT-PIXEL-ის oracle ახლით შეიცვალა.\n"
       "  შემდეგი: 342 REGRESSION (დარჩენილი) → 343 PERF-DRAG-PREVIEW c4-ii (`b-round-339/current-task-c4-ii-draft.md`; 3 patch 99a5912-ზე სუფთად ედება) ან ჯერ fix-up → c5 (video) → conversions → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → frontend-architect checkpoint → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule).\n")
s = s[:j] + add + s[j:]
old = '| STUDIO-PERFORMANCE | **მუშავდება ('
assert s.count(old) == 1
s = s.replace(old, '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1067…D-29z1074: რეგრესიის დარჩენილი ნაწილი round 342-ში; c4-ii → round 343.) ძველი: (', 1)
open(P, 'w').write(s)
print('ok')
