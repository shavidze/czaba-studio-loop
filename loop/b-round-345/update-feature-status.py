# B round 345 -> 346: feature-status.md edits (backup b-round-345/feature-status-before-346.md). Run from the loop root.
import pathlib, sys
P = 'feature-status.md'
if not pathlib.Path('b-round-345/feature-status-before-346.md').exists():
    sys.exit('backup missing')
s = open(P).read()
if 'Round 346 = PERF-DRAG-PREVIEW c6-i' in s:
    sys.exit('already applied')
old = 'განახლდა: 2026-11-05 · ავტორი: B (round 344 → round 345 დაგეგმვა, D-29z1084…D-29z1088)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-05 · ავტორი: B (round 345 → round 346 დაგეგმვა, D-29z1090…D-29z1094)', 1)
old = '  - **Round 345 = PERF-DRAG-PREVIEW c5-ii — მუშავდება (D-29z1086…D-29z1088).**'
assert s.count(old) == 1
new_head = ('  - **Round 345 = PERF-DRAG-PREVIEW c5-ii — PASS, ეტაპი დასრულდა (D-29z1090):** C-ის 12 row PASS, `browserVerified`/`realVerified` true (`c-round-345.json`); gate 345 გამოქვეყნდა `645b2e6` ორივე remote-ზე. video stopped 98.35 → 23.617 component / move; 60/60 assert; dock (caption, gap caption, fade overlay, stopped frame) HEAD-ის ტოლია ორივე viewport-ზე; WAV export-ის flow გადამოწმდა. C-ის 2 Low: C-R345-CAPTION-MUTANT-GAP → round 346; C-R345-PERF-DURATION → ROOT-REQ-PERF-TIMEOUT (D-29z1091). ძველი ჩანაწერი:')
s = s.replace(old, new_head, 1)
anchor = '  შემდეგი: 345 PERF-DRAG-PREVIEW c5-ii → ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE'
i = s.index(anchor)
j = s.index('\n', i) + 1
add = ('  - **Round 346 = PERF-DRAG-PREVIEW c6-i — მუშავდება (D-29z1092…D-29z1094).** item-ის მიზანი (≤ 15 component / move fade/trim/move-ზე) **რჩება**: B-ის names probe-მა (`b-round-345/names-head-645b2e6-v2.json`) trim-ის 22-დან 7 ზედმეტი render იპოვა (lane-ის chevron, clip-ის grip icon, 2 MixFader, DetailClipGain). c6-i: lucide icon-ები module constant-ად (DOM უცვლელი) + 3 Low (DP64 caption ტესტი, DP62 finally, budget notes). B-ის sketch: fade 10 → 6, trim 22 → 18, move 19 → 15 component თითო commit-ზე (`b-round-345/names-compare.txt`); perf row-ები record რჩება. Patch `b-round-345/sketch/source.patch.txt`; claims `b-round-345/claims-346.sh`. frontend-architect checkpoint (ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE) ახლა root-თანაა, არა-დამბლოკავი (D-29z1093).\n'
       '  შემდეგი: 346 c6-i → c6-ii (MixFader + DetailClipGain memo, სტაბილური props) → conversions (trim/move/fade → assert, ceil) → PERF-CAND-VIDEO-TRIM-FADE-ROWS → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). რეგრესია 2026-11-08-დან; RETRO ~351. Root-ისთვის: ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE, ROOT-REQ-PERF-TIMEOUT (ორივე არა-დამბლოკავი).\n')
s = s[:j] + add + s[j:]
open(P, 'w').write(s)
print('ok')
