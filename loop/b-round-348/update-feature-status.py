# B round 348 -> 349: feature-status.md edits (backup b-round-348/feature-status-before-349.md). Run from the loop root.
import pathlib, sys
P = 'feature-status.md'
if not pathlib.Path('b-round-348/feature-status-before-349.md').exists():
    sys.exit('backup missing')
s = open(P).read()
if 'Round 349 = PERF-CAND-VIDEO-TRIM-FADE-ROWS' in s:
    sys.exit('already applied')
old = 'განახლდა: 2026-11-05 · ავტორი: B (round 347 → round 348 დაგეგმვა, D-29z1100…D-29z1104)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-05 · ავტორი: B (round 348 → round 349 დაგეგმვა, D-29z1106…D-29z1110)', 1)
old = '  - **Round 348 = PERF-DRAG-PREVIEW conversions — მუშავდება (D-29z1102…D-29z1104).**'
assert s.count(old) == 1
s = s.replace(old, '  - **Round 348 = PERF-DRAG-PREVIEW conversions — PASS, ეტაპი დასრულდა (D-29z1106):** C-ის 10 row PASS, `browserVerified`/`realVerified` true (`c-round-348.json`), ბაგი 0; gate 348 გამოქვეყნდა `70751a5` ორივე remote-ზე. perf 70/70 assert, 0 NEW, 0 DIFF C347-თან; C-ის საკუთარი mutant (`ArrangementMixFader`-ის memo მოხსნილი) ზუსტად 10 ნაწინასწარმეტყველებ row-ზე წითელია; G348-AUTH და DRAG-SMOKE ორივე viewport-ზე PASS. gate-ის Low-ები → deferred (D-29z1107). ძველი ჩანაწერი:', 1)
anchor = '  შემდეგი: 348 conversions'
i = s.index(anchor)
j = s.index('\n', i) + 1
add = ('  - **Round 349 = PERF-CAND-VIDEO-TRIM-FADE-ROWS — მუშავდება (D-29z1108…D-29z1110).** interactions harness-ი video კლიპის trim-start-სა და fade-in drag-ს ზომავს: 22 ახალი `record` row (230 → 252, assert 70 რჩება). B-ის sketch (production, მარტო): 70/70 assert, 22 NEW, 0 DIFF C348-თან, liveness 3/3; video trim 18.683/move (item-ის მიზანი ≤ 15 — PERF-CAND-VIDEO-TRIM-FADE-COST), video fade 8.85 (audio 3.933). L31: HEAD 459503 ms, sketch 496938 ms (55 %); A-ს STOP > 540000; ამის შემდეგ interactions spec-ში ახალი row არ ემატება, სანამ root ROOT-REQ-PERF-TIMEOUT-ს (25 წთ) არ გამოიყენებს — ვადაგადაცილებულია (L46), RETRO 351-ზე Saba-სთვის კითხვა. `b-round-348/perf-summary.txt`, claims `b-round-348/claims-349.sh`. PERF-DRAG-PREVIEW ჯერ არ არის მზადაა.\n'
       '  შემდეგი: 349 video trim/fade rows → 350 PERF-CAND-VIDEO-TRIM-FADE-COST (ან PERF-CAND-MASTER-GROUP-FADER-PROPS, თუ ARCH checkpoint-მა უპასუხა) → RETRO 351 → PERF-CAND-MASTER-GROUP-FADER-PROPS / crossing → PERF-CAND-FADE-RELEASE-COMMITS → PERF-9 … PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). რეგრესია 2026-11-08-დან. Root-ისთვის: ROOT-REQ-PERF-TIMEOUT (ვადაგადაცილებული), ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE (არა-დამბლოკავი).\n')
s = s[:j] + add + s[j:]
open(P, 'w').write(s)
print('ok')
