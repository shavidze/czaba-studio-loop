# B round 384 -> 385: feature-status.md update. Run once from the loop root.
import pathlib, sys
P = pathlib.Path('feature-status.md'); DONE = pathlib.Path('b-round-384/update-feature-status.done')
if DONE.exists(): sys.exit('already applied')
s = P.read_text()
old = 'განახლდა: 2026-11-07 · ავტორი: B (round 382 → round 383 დაგეგმვა, D-29z1276…D-29z1279)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-07 · ავტორი: B (round 384 → round 385 დაგეგმვა, D-29z1285…D-29z1292)')
L = s.split('\n')
i = next(k for k, l in enumerate(L) if l.startswith('  - **Round 384 = PERF-13b-i — შემოწმების დასრულება, მოწმდება'))
assert L[i + 1].startswith('  შემდეგი (D-29z1284):')
L[i] = ('  - **Round 384 = PERF-13b-i — შემოწმების დასრულება — მზადაა (C round 384 PASS, `browserVerified` true, `realVerified` true; gate 384 გამოქვეყნდა `7295618`, რაუნდები 382–384; D-29z1285).** '
        'production heap ორივე viewport-ზე: live `[2,5,16,16,16,16,16]`, 0 `baseQueue`; PERF-RES 22/22, ready-ზე PCM 31.9 MiB / 7 / decode 0; mutant-ები 19/19 წითელი; PLAY-REFUSE; G384-AUTH: token API 401. '
        '**PERF-13b-i — მზადაა.** დაიხურა C-R382-01 (Medium) და B-R383-AUTH-ROW-BARE-URL; TL-R376-M1 დაიხურა როგორც stale-open (377 PASS). '
        'gate 384-ის review: **GATE384-M1-ENSURE-DECODED-UNHANDLED-REJECTION (Medium) → round 386**; L2 კანდიდატი 386-ისთვის, L3/L4 → `deferred_low_polish` (D-29z1286).')
L[i + 1] = ('  შემდეგი (D-29z1291): **round 385 = RETRO 385** (ფანჯარა 369–384) → **round 386 = GATE384-M1 + A-R383-REVIEW-L1** (`ensureDecoded`) → REGRESSION-2026-11-08 → PERF-13b-ii → PERF-13c → PERF-13d → PERF-14 → PERF-15 '
            '→ SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule). '
            'PERF-11c-iii-d/e ჩერდება Saba-ს პასუხამდე (`user-review/questions-arch-leaf-plumbing.md`, D-29z1290).')
j = next(k for k, l in enumerate(L) if l.startswith('| RETRO 369 |'))
L.insert(j + 1, '| RETRO 385 | **მოწმდება** (D-29z1288…D-29z1290) — round 385 (ფანჯარა 369–384, 16 რაუნდი): `retros/retro-385.md`, `lessons.md` (60 ხაზი; l.3, L29, L31, L58, L59), '
                '`user-review/screen-review-385.md` (ახალი კანდიდატი არ არის; Q-SR-385-1 მხოლოდ კითხვა), Saba-ს კითხვა `user-review/questions-arch-leaf-plumbing.md`, სისტემური SYS-R385-LEAF-ACTIONS-CONTEXT (awaiting_user). '
                'C ამოწმებს RT-* row-ებს, G385-AUTH-სა და STUDIO-SMOKE-385-ს ორივე viewport-ზე. |')
P.write_text('\n'.join(L)); DONE.write_text('ok\n'); print('ok')
