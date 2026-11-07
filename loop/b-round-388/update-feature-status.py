# B round 388 -> 389: feature-status.md update. Run once from the loop root.
import pathlib, sys
P = pathlib.Path('feature-status.md'); DONE = pathlib.Path('b-round-388/update-feature-status.done')
if DONE.exists(): sys.exit('already applied')
s = P.read_text()
old = 'განახლდა: 2026-11-07 · ავტორი: B (round 387 → round 388 დაგეგმვა, D-29z1306…D-29z1309)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-07 · ავტორი: B (round 388 → round 389 დაგეგმვა, D-29z1310…D-29z1315)')
L = s.split('\n')
i = next(k for k, l in enumerate(L) if l.startswith('  - **Round 388 = C-R387-01 — მუშავდება'))
assert L[i + 1].startswith('  შემდეგი (D-29z1309):')
L[i] = ('  - **Round 388 = C-R387-01 — მზადაა (C round 388 PASS, `browserVerified` true, `realVerified` true, ბაგი 0; gate 388 გამოქვეყნდა `11ca746`, რაუნდები 387–388; D-29z1310).** '
        'loop-pump-ის შეცდომის შემდეგ meter-ები ორივე viewport-ზე −∞-ზე ეცემა, საათი ჩერდება (`c-round-388/meter-*.json`); UNIT 66/1026, mutant-ები 16/16 წითელი. '
        'დაიხურა C-R387-01, GATE-B385-M2, A-R386-REVIEW-M1, B-R386-UNGUARDED-GRAPH-CALLERS, TL-R387-M1, A-R386-REVIEW-L1. reviewer-ის L1–L4 → `deferred_low_polish` (D-29z1312).')
L[i + 1] = ('  შემდეგი (D-29z1315): **round 389 = REGRESSION-2026-11-08, ნაწილი 1** (რაუნდები 343–388, SA-1…SA-16; A კოდს არ ცვლის) → round 390 = ნაწილი 2 (რაუნდები 199–342, round 340-ის შაბლონი) → PERF-13b-ii → PERF-13c → PERF-13d → PERF-14 → PERF-15 '
            '→ SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES … ' + L[i + 1][len('  შემდეგი (D-29z1309): '):] if False else
            '  შემდეგი (D-29z1315): **round 389 = REGRESSION-2026-11-08, ნაწილი 1** (რაუნდები 343–388, SA-1…SA-16; A კოდს არ ცვლის) → round 390 = ნაწილი 2 (რაუნდები 199–342, round 340-ის შაბლონი) → PERF-13b-ii → PERF-13c → PERF-13d → PERF-14 → PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule).')
L.insert(i + 2, '  ძველი: ' + 'შემდეგი (D-29z1309): round 388 → REGRESSION-2026-11-08 (უპირობოდ) → PERF-13b-ii …')
j = next(k for k, l in enumerate(L) if l.startswith('| GATE-B385-M2-APPLY-SCHEDULE-ROLLBACK'))
L[j] = ('| GATE-B385-M2-APPLY-SCHEDULE-ROLLBACK (+ A-R386-REVIEW-M1, B-R386-UNGUARDED-GRAPH-CALLERS, A-R386-REVIEW-L1, TL-R387-M1) | **მზადაა** (C round 388 PASS, `browserVerified` true; gate 388 `11ca746`; D-29z1310) | '
        '`c-round-387.md` (M2-FLOW, M1-NEIGHBOUR, EXPORT-EQUAL), `c-round-388.md` (UNIT 66/1026, MUTANTS 16/16, M2-FLOW, M1-NEIGHBOUR ორივე viewport-ზე) | რეგრესიის row-ები R389-SCHED-FAIL, R389-EDIT-THROW |')
k = next(k for k, l in enumerate(L) if l.startswith('| C-R387-01-METER-FREEZE-AFTER-PUMP-FAILURE'))
L[k] = ('| C-R387-01-METER-FREEZE-AFTER-PUMP-FAILURE | **მზადაა** (Medium დაიხურა; C round 388 PASS, D-29z1310) | `c-round-388/meter-1440.json`, `meter-1280.json` (ყველა −∞), `meter-control-1440.json` | '
        'რეგრესიის row-ები R389-SCHED-FAIL, R389-RESYNC-METER (reviewer L1-ის ბრაუზერის ნახევარი) |')
L.insert(k + 1, '| REGRESSION-2026-11-08 | **მოწმდება** (D-29z1311): round 389 = ნაწილი 1 (343–388), round 390 = ნაწილი 2; ერთი დღით ადრე, რადგან 385–388-მა საერთო playback ინფრასტრუქტურა შეცვალა | `current-task.md`; `b-round-388/claims-389-planning-output.txt` | C: §3 row-ები ორივე viewport-ზე, RR-PERF მარტო, PERF-LIB, RG-SMOKE, G389-AUTH |')
P.write_text('\n'.join(L)); DONE.write_text('ok\n'); print('ok')
