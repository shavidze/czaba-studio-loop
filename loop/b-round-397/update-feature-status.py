import os, sys
P = '/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
DONE = '/home/runner/czaba-project/tmp/studio-real-loop/b-round-397/update-feature-status.done'
if os.path.exists(DONE):
    print('already applied'); sys.exit(0)
lines = open(P, encoding='utf-8').read().split('\n')
idx = next(i for i, l in enumerate(lines) if l.startswith('  შემდეგი (D-29z1355…D-29z1358): **round 397 = PERF-13d'))
lines[idx] = '  ძველი: შემდეგი (D-29z1355…D-29z1358): round 397 = PERF-13d …'
new = [
    '  - **Round 397 = PERF-13d — მზადაა (C round 397 PASS, `browserVerified` true, `realVerified` true, ბაგი 0; gate 397 გამოქვეყნდა `c93d926`; D-29z1359).** 6×-ზე, ორივე viewport-ზე, 3-3 გაშვება: ხუთი synth buffer-ის build long task-ში ≤ 1 (HEAD-ზე 5 ერთ 135–185 ms task-ში), ორივე არხი ერთი array-დან 5/5, არხების hash = HEAD (ხმა უცვლელია), status და Play უცვლელია; perf spec rc 0; AUTH დაცულია (`c-round-397.md`). **PERF-13 მზადაა** (13a–13d); R314-DEMO-BUFFER-LONGTASK-6X და PERF2-STEREO-COPY დაიხურა. C-R397-NOTE-LONGTASK-1280 (Low) → `deferred_low_polish` (D-29z1361).',
    '  - **PERF-14 დაიყო (D-29z1360):** B-მ HEAD `c93d926`-ზე გაზომა (`b-round-397/probe/head-200-*.json`): 200 clip-ზე გვერდზე 4294/4277 element-ია (მიზანი ≤ 2000), აქედან 3400 clip-ებშია (17 თითოში); ფანჯარაში ჩანს 1 clip default zoom-ზე და 16–19 მინიმალურ zoom-ზე; zoom-ის keydown max 48/40 ms 1×-ზე, 272/280 ms 6×-ზე. Ruler უკვე ფანჯრულია (95/79) — PERF-14-ის ძველი შენიშვნა შესწორდა. ეტაპები: 14a — 200 clip-ის harness (record row-ები); 14b — clip-ების virtualization + clip-ების რაოდენობის არა-DOM სიგნალი (51 ტესტ-ფაილი clip-ს DOM-ით პოულობს, `b-round-397/sweep-clip-dom-locators.txt`); 14c — peak pyramid worker-ში + canvas tiles + round-315-ის peaks Low-ები.',
    '  შემდეგი (D-29z1359…D-29z1361): **round 398 = PERF-14a — მუშავდება.** ახალი perf spec `perf/studio-lab-scale.perf.spec.ts` და `perf/budgets.scale.json`: 200 clip, DOM default და მინიმალურ zoom-ზე, clip-ები DOM-სა და ფანჯარაში, zoom keydown p95/max 1× და 6×, კომპონენტები zoom-ის ღილაკზე; ყველა row `record`; doc 254. app-ის კოდი არ იცვლება. შემდეგ: PERF-14b → PERF-14c → PERF-15; REGRESSION 2026-11-10-დან; RETRO 400; frontend-architect checkpoint root-თან (არ ბლოკავს).',
]
lines[idx + 1:idx + 1] = new
open(P, 'w', encoding='utf-8').write('\n'.join(lines))
open(DONE, 'w').write('ok\n')
print('applied')
