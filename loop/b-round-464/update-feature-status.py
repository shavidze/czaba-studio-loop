"""B round 464 -> 465 feature-status update. Run once from anywhere. Idempotent (update-feature-status.done)."""
import os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = f'{LOOP}/b-round-464/update-feature-status.done'
if os.path.exists(DONE): sys.exit('already applied')
p = f'{LOOP}/feature-status.md'
lines = open(p, encoding='utf-8').read().split('\n')
assert lines[2].startswith('განახლდა:'), lines[2][:40]
lines[2] = ('განახლდა: 2026-11-12 · ავტორი: B (round 464 → round 465 დაგეგმვა, D-29z1636…D-29z1640) · წესი: '
            '`docs/technical/studio-real-workspace/agent-workflow.md` (+ policy-ის SABA-B-4, SABA-B-7, SABA-B-8 და SABA-B-9/10/11 სექციები)')
idx = next(i for i, l in enumerate(lines) if l.startswith('  შემდეგი (D-29z1635): **round 464 = STORE-2b-3d-3'))
lines[idx] = '  ძველი: ' + lines[idx][2:]
new = [
 '  - **Round 464 = STORE-2b-3d-3 — მზადაა (D-29z1636).** C round 464 PASS: C1–C10, `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-464.json`); gate 464 გამოქვეყნდა `6d321c7` (review: COMMIT OK, 9/10). '
 'წაიშალა 4 ობოლი `@keyframes` (float, grain, fadeInUp, fadeOut); DC2 ახლა მხოლოდ ნამდვილ animation გამოყენებას ითვლის. დაიხურა A-R463-REVIEW-M1 (= C-R463-01), B-R463-DC2-UNDERSCORE, A-R463-REVIEW-L3. '
 'A-ს reviewer-ის Low-ები L3–L6 → `deferred_low_polish`; L4/L5 (fail-silent / ტესტის სიძლიერე) Low-ად დარჩა: შენახული 11-დან მხოლოდ `pulse` იყენებს named-utility შტოს, და ეს სწორი შემთხვევაა (`b-round-464/l4-check.txt`).',
 '  შემდეგი (D-29z1637…D-29z1640): **round 465 = RETRO 465 (რაუნდები 450–464) — მოწმდება.** ანგარიში `retros/retro-465.md`; ეკრანი `user-review/screen-review-465.md` (SR-465-1…3, შენს პასუხს ელოდება); '
 'კითხვები `user-review/questions-retro-465.md` (Q1–Q7). lessons: L52 „A guard must be able to disagree with what it checks“, L56 „Pre-check tree = delivered tree“, L18 pre-hydration, L60 evidence; ფაილი 58,399 → 57,341 ბაიტი, 60 ხაზი. '
 'სისტემური ამოცანა **SYS-R465-DEAD-CSS-MATCHER** დაგეგმილია trigger-ით (root-ის ARCH-CHECKPOINT-STYLE-SCAN პასუხი, მომდევნო dead-CSS stage ან round 480). '
 'შემდეგ: round 466 = REGRESSION-2026-11-13, თუ დაგეგმვა 11-13-ზე ან მის შემდეგ ხდება, თორემ STORE-2b-3c-2b. შემდეგი RETRO — round 480.',
]
lines[idx:idx] = new
open(p, 'w', encoding='utf-8').write('\n'.join(lines))
open(DONE, 'w').write('done\n'); print('feature-status updated at line', idx + 1)
