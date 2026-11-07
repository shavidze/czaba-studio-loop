# B round 389 -> 390: feature-status.md update. Run once from the loop root.
import pathlib, sys
P = pathlib.Path('feature-status.md'); DONE = pathlib.Path('b-round-389/update-feature-status.done')
if DONE.exists(): sys.exit('already applied')
s = P.read_text()
old = 'განახლდა: 2026-11-07 · ავტორი: B (round 388 → round 389 დაგეგმვა, D-29z1310…D-29z1315)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-07 · ავტორი: B (round 389 → round 390 დაგეგმვა, D-29z1316…D-29z1321)')
L = s.split('\n')
i = next(k for k, l in enumerate(L) if l.startswith('  შემდეგი (D-29z1315):'))
L[i] = ('  - **Round 389 = REGRESSION-2026-11-08, ნაწილი 1 — C PASS** (`c-round-389.json`: 20 row, 0 ჩავარდნა, ბაგი 0, `browserVerified`/`realVerified` true; gate 389 skipped — კოდი არ შეცვლილა, baseline `11ca746`; D-29z1316). '
        'რაუნდები 343–388-ის ყველა ერთეული ორივე viewport-ზე: schedule-failure + meter-ები −∞, late-resync, decoded cache + Play-ის უარი, WAV export, leaf memo-ები, status, lazy signalr, stem cache, range, transport, video drag, fader-ები, ჯგუფის move, journey; RR-PERF 4/4 (218 assert row), PERF-LIB 3/54, RG-SMOKE 2. '
        'ორი ხარვეზი გადავიდა ნაწილ 2-ში (D-29z1318): ვიდეოს ხმა გადატანის შემდეგ (R390-VIDEO-SOUND) და 3-კლიპიანი export-ის სიგრძე (R390-WAV-3CLIP-LEN). Esc კლიპის drag-ს არ აუქმებს — არსებული სიგნალი ESCAPE-CANCEL-GESTURE, არა ბაგი (D-29z1319).')
L.insert(i + 1, '  შემდეგი (D-29z1321): **round 390 = REGRESSION-2026-11-08, ნაწილი 2** (რაუნდები ≤ 342, round 340-ის შაბლონი + 2 გადმოტანილი row; A კოდს არ ცვლის) → `regression-last.json` → PERF-13b-ii (ARCH-CHECKPOINT-DECODE-REGION სასურველია მანამდე) → PERF-13c → PERF-13d → PERF-14 → PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule).')
L.insert(i + 2, '  ძველი: ' + 'შემდეგი (D-29z1315): round 389 = REGRESSION-2026-11-08, ნაწილი 1 → round 390 = ნაწილი 2 → PERF-13b-ii …')
j = next(k for k, l in enumerate(L) if l.startswith('| REGRESSION-2026-11-08 |'))
L[j] = ('| REGRESSION-2026-11-08 | **მოწმდება** (D-29z1317): ნაწილი 1 = round 389 C PASS (343–388, 20 row, ბაგი 0); ნაწილი 2 = round 390 (≤ 342 + R390-VIDEO-SOUND, R390-WAV-3CLIP-LEN) | '
        '`c-round-389.md`, `c-round-389.json`; `current-task.md`; `b-round-389/claims-390-planning-output.txt` | C: ნაწილი 2-ის ყველა row ორივე viewport-ზე, mock API პირველად, G390-AUTH; შემდეგ `regression-last.json` |')
P.write_text('\n'.join(L)); DONE.write_text('ok\n'); print('ok')
