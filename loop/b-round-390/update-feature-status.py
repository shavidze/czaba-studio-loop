# B round 390 -> 391: feature-status.md update. Run once from the loop root.
import pathlib, sys
P = pathlib.Path('feature-status.md'); DONE = pathlib.Path('b-round-390/update-feature-status.done')
if DONE.exists(): sys.exit('already applied')
s = P.read_text()
old = 'განახლდა: 2026-11-07 · ავტორი: B (round 389 → round 390 დაგეგმვა, D-29z1316…D-29z1321)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-07 · ავტორი: B (round 390 → round 391 დაგეგმვა, D-29z1322…D-29z1329)')
L = s.split('\n')
i = next(k for k, l in enumerate(L) if l.startswith('  შემდეგი (D-29z1321):'))
L[i] = ('  - **Round 390 = REGRESSION-2026-11-08, ნაწილი 2 — C PASS** (`c-round-390.json`: 0 ჩავარდნა, ბაგი 0, `browserVerified`/`realVerified` true; gate 390 skipped — კოდი არ შეცვლილა, baseline `11ca746`; D-29z1322). '
        'REGRESSION-2026-11-08 დასრულდა; `regression-last.json` = 2026-11-07 / 390, შემდეგი 2026-11-10-ზე ან შემდეგ. NO-SHIFT-203 და ოთხი probe-ის ადაპტაცია შემდეგ regression-ში გადადის (D-29z1323).')
L.insert(i + 1, '  შემდეგი (D-29z1324…D-29z1329): **round 391 = PERF-13b-ii** — ხელახლა decode-ის დროს status „Loading “X”…“ → „“X” is ready.“; clip, რომლის ხმაც ვერ ჩაიტვირთა, export-ში ჩუმად აღარ იკარგება (export უარს ამბობს, Play უკრავს და აფრთხილებს); `pcm-live-mib-ready` ≤ 60 და `decode-mib-ready` ≤ 0 ხდება `assert` (B-ის sketch + mutant) → PERF-13c → PERF-13d → PERF-14 → PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule). ARCH-CHECKPOINT-DECODE-REGION ჯერ უპასუხოა (D-29z1328).')
L.insert(i + 2, '  ძველი: შემდეგი (D-29z1321): round 390 = REGRESSION-2026-11-08, ნაწილი 2 → regression-last → PERF-13b-ii …')
j = next(k for k, l in enumerate(L) if l.startswith('| REGRESSION-2026-11-08 |'))
L[j] = ('| REGRESSION-2026-11-08 | **მზადაა** (D-29z1322): ნაწილი 1 = round 389 C PASS, ნაწილი 2 = round 390 C PASS (ბაგი 0, browserVerified true) | '
        '`c-round-389.json`, `c-round-390.json`, `c-round-390.md` | შემდეგი regression 2026-11-10-ზე ან შემდეგ; carry: NO-SHIFT-203, probe-ების ადაპტაცია (D-29z1323) |')
P.write_text('\n'.join(L)); DONE.write_text('ok\n'); print('ok')
