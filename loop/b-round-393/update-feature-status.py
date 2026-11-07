# B round 393 -> 394: feature-status.md update. Run once from the loop root.
import pathlib, sys
P = pathlib.Path('feature-status.md'); DONE = pathlib.Path('b-round-393/update-feature-status.done')
if DONE.exists(): sys.exit('already applied')
s = P.read_text()
old = 'განახლდა: 2026-11-07 · ავტორი: B (round 392 → round 393 დაგეგმვა, D-29z1336…D-29z1341)'
assert s.count(old) == 1
s = s.replace(old, 'განახლდა: 2026-11-07 · ავტორი: B (round 393 → round 394 დაგეგმვა, D-29z1342…D-29z1346)')
L = s.split('\n')
i = next(k for k, l in enumerate(L) if l.startswith('  შემდეგი (D-29z1336…D-29z1341):'))
L[i] = ('  - **Round 393 = PERF-13c-i — მზადაა (C round 393 PASS, `browserVerified` true, `realVerified` true, ბაგი 0; gate 393 გამოქვეყნდა `1091b9e`; D-29z1342).** '
        'Middle East-ისა და hero-ს preview ორივე viewport-ზე `HTMLAudioElement`-ით უკრავს: 0 decode, live PCM უცვლელი; Stop ათავისუფლებს element-ს; media-ს შეცდომისას decode-ზე გადადის (S1–S11, PERF-RES, AUTH; `c-round-393.json`).')
L.insert(i + 1, '  - **PERF-13c-ii დაიყო (D-29z1343):** 13c-ii-a — stream-ის სიმყარე (round 394); 13c-ii-b — შეძენილი `previewUrl`, harness-ის preview row, stem-cache, სტაბილური seek key, fallback-ის ვადა. doc 252 — 3 ეტაპი.')
L.insert(i + 2, '  შემდეგი (D-29z1342…D-29z1346): **round 394 = PERF-13c-ii-a — მუშავდება** — სამი Medium ერთ lifecycle-ში: (1) REV-B393-M1-STALL — media-ს მოთხოვნა თუ არ პასუხობს, HEAD-ზე toggle სამუდამოდ `Stop`-ზე რჩება (`b-round-393/premise/events-head.json`); 8 s watchdog → decode fallback (sketch: 8378 ms); (2) GATE393-M1-SYNC-THROW — `currentTime`/`play()`-ის სინქრონული throw → იგივე fallback; (3) A-R393-REVIEW-M1-EXTERNAL-PAUSE (ხელახლა შეფასდა Medium-ად) — media key/OS pause → toggle `Preview`. მხოლოდ `preview.client.ts` + ტესტი + doc 252; provider-ი არ იცვლება. NotAllowedError-ზე fallback რჩება (D-29z1344) → PERF-13c-ii-b → PERF-13d → PERF-14 → PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule). Frontend-architect checkpoint — PERF-13c-ii-b-ის შემდეგ (D-29z1346).')
L.insert(i + 3, '  ძველი: შემდეგი (D-29z1336…D-29z1341): round 393 = PERF-13c-i …')
j = next(k for k, l in enumerate(L) if l.startswith('| STUDIO-PERFORMANCE |'))
L[j] = L[j].replace('| STUDIO-PERFORMANCE | ', '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1342): PERF-13c-i — მზადაა (C round 393 PASS, `1091b9e`); round 394 = PERF-13c-ii-a (stream-ის სიმყარე).** ძველი: ', 1)
P.write_text('\n'.join(L)); DONE.write_text('ok\n'); print('ok')
