# B round 344 -> 345: feature-status.md edits (backup b-round-344/feature-status-before-345.md). Run from the loop root.
import pathlib, sys
P = 'feature-status.md'
if not pathlib.Path('b-round-344/feature-status-before-345.md').exists():
    sys.exit('backup missing')
s = open(P).read()
if 'Round 345 = PERF-DRAG-PREVIEW c5-ii' in s:
    sys.exit('already applied')
old = 'განახლდა: 2026-11-05 · ავტორი: B (round 343 → round 344 დაგეგმვა, D-29z1079…D-29z1083)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-05 · ავტორი: B (round 344 → round 345 დაგეგმვა, D-29z1084…D-29z1088)', 1)
old = '  - **Round 344 = PERF-DRAG-PREVIEW c5-i — მუშავდება (D-29z1081…D-29z1083).**'
assert s.count(old) == 1
s = s.replace(old, '  - **Round 344 = PERF-DRAG-PREVIEW c5-i — PASS, ეტაპი დასრულდა (D-29z1084):** C-ის 10 row PASS, `browserVerified` true (`c-round-344.json`); gate 344 გამოქვეყნდა `c79642c`. video move-ის 11 row ჩაიწერა (stopped 98.35/move). A-ს 6 Low → `deferred_low_polish`; C-R344-PERF-DURATION → ROOT-REQ-PERF-TIMEOUT (D-29z1085). ძველი ჩანაწერი:', 1)
i = s.index('  შემდეგი: 344 PERF-DRAG-PREVIEW c5-i')
j = s.index('\n', i) + 1
add = ("  - **Round 345 = PERF-DRAG-PREVIEW c5-ii — მუშავდება (D-29z1086…D-29z1088).** video კლიპის drag-ის preview (move, trim, fade და video-იანი group) provider-ის history-დან preview store-ში გადადის; video dock (stopped frame, caption, gap caption, fade overlay) store-ის video lane-ს კითხულობს. B-ის sketch: video stopped 98.35 → 23.617 component თითო move-ზე, 162 EQUAL / 3 DIFF (მხოლოდ video), 5 video row → assert (60 assert); dock probe HEAD-ის ტოლია ორივე viewport-ზე (`b-round-344/probe/`); 4 unit mutant წითელი. Patch-ები `b-round-344/sketch/`; claims `b-round-344/claims-345.sh`.\n"
       "  შემდეგი: 345 PERF-DRAG-PREVIEW c5-ii → ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE (root, frontend-architect) → conversions (+PERF-CAND-VIDEO-TRIM-FADE-ROWS) → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). რეგრესია 2026-11-08-დან; RETRO ~351. Root-ისთვის: ROOT-REQ-PERF-TIMEOUT (არა-დამბლოკავი).\n")
s = s[:j] + add + s[j:]
old = '| STUDIO-PERFORMANCE | **მუშავდება ('
assert s.count(old) == 1
s = s.replace(old, '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1084…D-29z1088: c5-i დასრულდა round 344-ში; round 345 = c5-ii.) ძველი: (', 1)
open(P, 'w').write(s)
print('ok')
