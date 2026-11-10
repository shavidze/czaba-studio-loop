# B round 434 -> 435 feature-status update (D-29z1538..D-29z1543). Run once from the loop root.
import os, sys
p = 'feature-status.md'
if os.path.exists('b-round-434/update-feature-status.done'): sys.exit('already applied')
L = open(p, encoding='utf-8').read().split('\n')
def one(pred, what):
    ix = [i for i, l in enumerate(L) if pred(l)]
    assert len(ix) == 1, (what, ix); return ix[0]
i3 = one(lambda l: l.startswith('განახლდა: 2026-11-10 · ავტორი: B (round 433 → round 434 დაგეგმვა'), 'header')
L[i3] = L[i3].replace('B (round 433 → round 434 დაგეგმვა, D-29z1532…D-29z1537)', 'B (round 434 → round 435 დაგეგმვა, D-29z1538…D-29z1543)')
i16 = one(lambda l: l.startswith('- **TLM-SABA-B-12-FIREFOX-SAFARI (round 430, D-29z1513) — ღიაა, ვადა RETRO 435.**'), 'tlm')
L[i16] = L[i16].replace('— ღიაა, ვადა RETRO 435.**', '— ღიაა; RETRO 435-ზე კითხვა Saba-ს (`user-review/questions-retro-435.md` Q1, D-29z1540), ახალი ვადა RETRO 450. Firefox-ის ნაწილს ROOT-REQ-PLAYWRIGHT-FIREFOX ბლოკავს. ძველი ვადა: RETRO 435.**', 1)
nx = one(lambda l: l.startswith('  შემდეგი (D-29z1536): **round 434 = SABA-B-12 ეტაპი 3b'), 'next')
L[nx] = '  ძველი: ' + L[nx].lstrip()
new = [
 '  - **Round 434 = SABA-B-12 ეტაპი 3b (dialog-ების scrollbar) — მზადაა (D-29z1538).** C round 434 PASS: 7 row (+4b), `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-434.json`). B-მ თავად გაიმეორა: L57 OK (`b-round-434/l57-check-c434.txt`); `compare-scrollbar.py` C-ის after-ზე ALL OK, HEAD-ზე NOT ALL OK (`b-round-434/recheck/`); mutant-ების summary იდენტურია; auth pass. Gate 434 გამოქვეყნდა `8233840` (verify 272 ფაილი / 4018 ტესტი). Low-ები (D-29z1539): GATE434-S1, GATE434-S2, B-R434-CONFIRMMODAL-NAME → `deferred_low_polish`; Firefox-ის scrollbar = `confirmedBy` TLM-SABA-B-12-ზე. SABA-B-12: ეტაპები 1–3b მზადაა, ეტაპი 4 (select) REVIEW-RECOMMENDATIONS-ში.',
 '  შემდეგი (D-29z1540…D-29z1543): **round 435 = RETRO 435 — მოწმდება** (ფანჯარა 420–434, 15 რაუნდი: 14 PASS, 1 FAIL (423), $255.35). გამოსავალი: `retros/retro-435.md`, `lessons.md` (L37 perf clause, L56 რიცხვი/სახელი ფაილით; 60 ხაზი), `tools/l57-check.py` (origin enum), `user-review/screen-review-435.md`, `user-review/questions-retro-435.md` (Q1–Q4), სისტემური ამოცანა SYS-R435-SOURCE-SCAN-HELPER (11 Low). A არაფერს აკეთებს; C ამოწმებს traceability-ს, auth-ს, smoke-ს და ეკრანს. შემდეგ: REGRESSION-2026-11-13 (ვადაზე, REG-PERF-FULL-SUITE-ით) → COPY-PD-VIS (+ lane handle, SR-435-2) → SYS-R435 → SYS-1 → SYS-3 → STORE 2b…5 → ARCH-SPLIT → REVIEW-RECOMMENDATIONS → T12-ADVANCED; STEM-LANES — Saba-ს პასუხისთანავე.',
]
L[nx:nx] = new
ip = one(lambda l: l.startswith('| STUDIO-PERFORMANCE | **loop-ში დასრულდა, ნარჩენები Saba/root/backend-ის ხელშია (D-29z1463)'), 'perf')
L[ip] = L[ip].replace('| STUDIO-PERFORMANCE | **loop-ში დასრულდა', '| STUDIO-PERFORMANCE | **loop-ში დასრულდა; RETRO 435 (D-29z1540): Saba-ს ნარჩენები ერთ კითხვად (`questions-retro-435.md` Q3), root/backend ნარჩენები გაჩერებულია, ახალი ვადა RETRO 450.** ძველი: **loop-ში დასრულდა', 1)
open(p, 'w', encoding='utf-8').write('\n'.join(L)); open('b-round-434/update-feature-status.done', 'w').write('ok\n'); print('ok')
