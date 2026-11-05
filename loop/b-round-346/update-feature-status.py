# B round 346 -> 347: feature-status.md edits (backup b-round-346/feature-status-before-347.md). Run from the loop root.
import pathlib, sys
P = 'feature-status.md'
if not pathlib.Path('b-round-346/feature-status-before-347.md').exists():
    sys.exit('backup missing')
s = open(P).read()
if 'Round 347 = PERF-DRAG-PREVIEW c6-ii' in s:
    sys.exit('already applied')
old = 'განახლდა: 2026-11-05 · ავტორი: B (round 345 → round 346 დაგეგმვა, D-29z1090…D-29z1094)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-05 · ავტორი: B (round 346 → round 347 დაგეგმვა, D-29z1095…D-29z1099)', 1)
old = '  - **Round 346 = PERF-DRAG-PREVIEW c6-i — მუშავდება (D-29z1092…D-29z1094).**'
assert s.count(old) == 1
new_head = ('  - **Round 346 = PERF-DRAG-PREVIEW c6-i — PASS, ეტაპი დასრულდა (D-29z1095):** C-ის 11 row PASS, `browserVerified`/`realVerified` true (`c-round-346.json`), ბაგი 0; gate 346 გამოქვეყნდა `4895732` ორივე remote-ზე. NAMES: fade 6, trim 18, move 15 (crossing 89) თითო commit-ზე; VISUAL `outerHTML` HEAD-ის ტოლია 1440-სა და 1280-ზე; perf 60/60 assert, არცერთი row არ გაზრდილა (trim 17.7, move 18.467, fade 5.9 / move). gate-ის Low (DP64-ის 5-tick loop) და doc-ის სტატუსი → round 347 (D-29z1096). ძველი ჩანაწერი:')
s = s.replace(old, new_head, 1)
anchor = '  შემდეგი: 346 c6-i → c6-ii'
i = s.index(anchor)
j = s.index('\n', i) + 1
add = ('  - **Round 347 = PERF-DRAG-PREVIEW c6-ii — მუშავდება (D-29z1097…D-29z1099).** `ArrangementMixFader` და `ArrangementDetailClipGain` იღებს `memo`-ს; lane-ისა და Clip details-ის handler-ები გადის ახალ `useStableHandler` hook-ზე (ref + layout effect), ამიტომ trim/move/fade-ის დროს fader-ები და clip gain აღარ render-დება. B-ის sketch: names fade 6 → 4, trim 18 → 15, move 15 → 12 (crossing 89 → 82), click 88 → 83; production perf trim 17.7 → 14.75, move 18.467 → 15.317, fade 5.9 → 3.933 / move, არცერთი row არ გაიზარდა (`b-round-346/sketch-perf-rowcmp-vs-c346.txt`). item-ის მიზანი ≤ 15 ახლა trim-ზეც სრულდება. C ამოწმებს fader-ების საკუთარ drag-საც (`studio-lab.perf.spec.ts`, SABA-B-5). row-ები record რჩება; შემდეგი ეტაპი — conversions. Patch `b-round-346/sketch/source.patch.txt`; claims `b-round-346/claims-347.sh`.\n'
       '  შემდეგი: 347 c6-ii → conversions (trim/move/fade → assert, ceil) → PERF-CAND-VIDEO-TRIM-FADE-ROWS → PERF-CAND-MASTER-GROUP-FADER-PROPS → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). რეგრესია 2026-11-08-დან; RETRO ~351. Root-ისთვის: ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE, ROOT-REQ-PERF-TIMEOUT (ორივე არა-დამბლოკავი).\n')
s = s[:j] + add + s[j:]
open(P, 'w').write(s)
print('ok')
