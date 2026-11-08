import os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = L + '/b-round-400/update-feature-status.done'
if os.path.exists(done):
    sys.exit('already applied')
p = L + '/feature-status.md'
lines = open(p, encoding='utf-8').read().split('\n')
assert lines[2].startswith('განახლდა: 2026-11-08 · ავტორი: B (round 399 → round 400'), lines[2][:60]
lines[2] = lines[2].replace('B (round 399 → round 400 დაგეგმვა, D-29z1367…D-29z1370)', 'B (round 400 → round 401 დაგეგმვა, D-29z1371…D-29z1376)')
i = next(k for k, l in enumerate(lines) if l.startswith('  შემდეგი (D-29z1367…D-29z1370): **round 400 = PERF-14b-i-ის დასრულება — მუშავდება.**'))
lines[i] = lines[i].replace('  შემდეგი (D-29z1367', '  ძველი: შემდეგი (D-29z1367', 1)
new = [
 '  - **Round 400 = PERF-14b-i-ის დასრულება — მზადაა (C round 400 PASS, `browserVerified` true, `realVerified` true, ბაგი 0; gate 400 გამოქვეყნდა `c17d0e9`, რაუნდები 399–400; D-29z1371).** INTERACT-HEAD 189/189 deterministic row ემთხვევა HEAD-ს; INTERACT-VIRT VIRT-RULE PASS (problems [] ×6, drag-group-live 1, მხოლოდ path-rewrites 2 vs 3); RES/SCALE HEAD+VIRT PASS (`c-round-400.md`). **PERF-14b-i — მზადაა.** დაიხურა C-R399-01 და TL-R398-SK-M2. A-ს spec Lows → A-R400-REVIEW-SPEC-LOWS (14b-ii input).',
 '  შემდეგი (D-29z1372…D-29z1376): **round 401 = RETRO 401 (ფანჯარა 385–400) — მოწმდება (C ამოწმებს).** კოდი არ იცვლება. შედეგები: `retros/retro-401.md`, `lessons.md` (l.3, L4, L58), `user-review/screen-review-401.md` (ახალი კანდიდატი არ არის). RETRO-400-ის ვადები: SYS-R385 რიგშია PERF-14c-ის შემდეგ, SYS-R369 — STEM-LANES-მდე, SYS-R388 — SYS-R2-ის გვერდით. ARCH-CHECKPOINT-PREVIEW-AFTER-13C-ის ვადაა RETRO 416. შემდეგ: PERF-14b-ii (ან REGRESSION-2026-11-10, თუ იმ დაგეგმვაზე დადგება ვადა).',
]
lines[i:i] = new
j = next(k for k, l in enumerate(lines) if l.startswith('| STUDIO-PERFORMANCE | '))
lines[j] = lines[j].replace('| STUDIO-PERFORMANCE | ', '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1375): PERF-14b-i — მზადაა (C round 400 PASS, `c17d0e9`); round 401 = RETRO 401; შემდეგ PERF-14b-ii, PERF-14c, SYS-R385, PERF-15, SYS-R2 + SYS-R388, SYS-CLOCK-DETERMINISM.** ძველი: ', 1)
k = next(k for k, l in enumerate(lines) if l.startswith('| RETRO 385 | '))
lines.insert(k + 1, '| RETRO 401 | **მოწმდება** (D-29z1372…D-29z1376) — round 401 (ფანჯარა 385–400, 16 რაუნდი): `retros/retro-401.md`, `lessons.md` (60 ხაზი; l.3, L4, L58), `user-review/screen-review-401.md` (ახალი კანდიდატი არ არის), backlog v369 | `current-task.md`, `b-round-400/` | C round 401 RT-* row-ები |')
open(p, 'w', encoding='utf-8').write('\n'.join(lines))
open(done, 'w').write('ok\n')
print('feature-status updated')
