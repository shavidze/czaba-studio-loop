"""B round 449 -> 450 feature-status update. Idempotent (update-feature-status.done)."""
import os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = f'{LOOP}/b-round-449/update-feature-status.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = f'{LOOP}/feature-status.md'
lines = open(p, encoding='utf-8').read().split('\n')
assert lines[2].startswith('განახლდა:'), lines[2][:40]
lines[2] = ('განახლდა: 2026-11-11 · ავტორი: B (round 449 → round 450 დაგეგმვა, D-29z1597…D-29z1601) · წესი: '
            '`docs/technical/studio-real-workspace/agent-workflow.md` (+ policy-ის SABA-B-4, SABA-B-7, SABA-B-8 და SABA-B-9/10/11 სექციები)')
idx = next(i for i, l in enumerate(lines) if l.startswith('  შემდეგი (D-29z1594…D-29z1595): **round 449 = STORE-2b-3a'))
lines[idx] = '  ძველი: ' + lines[idx][2:]
new = [
    '  - **Round 449 = STORE-2b-3a (gradient ტექსტი) — მზადაა (D-29z1597).** C round 449 PASS: C1–C7, C9–C13, `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-449.json`); '
    'C8 Safari BLOCKED — cloud-ში WebKit არ არის (TLM-R449-WEBKIT-HEADING-INK, ვადა RETRO 465). Gate 449 გამოქვეყნდა `a8599a2` (review: COMMIT OK, 9/10). '
    'სათაურების 8 გამოყოფილი სიტყვა ახლა light ink-ითაა (#ECE6DA): HEAD-ზე teal 34–80 %, ახლა ≤ 0.1 %, კონტრასტი 13.6–15.7, ზომები უცვლელი; LeadMagnet-ის ტექსტი და ზომა იგივეა; `/studio-lab` 0 px. '
    'A-ს reviewer-ის Medium A-R449-REVIEW-GT1-TSX (ტესტი TSX-ს არ ამოწმებს; ერთადერთი hit მკვდარ CinemaCurtainLoader-შია) → SYS-R450-STORE-STYLE-SCAN. '
    'INFO-C449-C9-HEAD-CONTROL-FLAKE (Studio-ს HEAD-vs-HEAD 8 px, 3-დან 2 გაშვებაში) — 2b-3b-მდე გაირკვევა. ROOT-REQ-ENV-MOCK-API-HEALTH — mock API A-საც და C-საც თავად უნდა გაეშვა.',
    '  შემდეგი (D-29z1598…D-29z1601): **round 450 = RETRO 450 (რაუნდები 435–449) — მოწმდება.** ანგარიში `retros/retro-450.md`; ეკრანი `user-review/screen-review-450.md` (SR-450-1…5, კანდიდატები); '
    'კითხვები Saba-სთვის `user-review/questions-retro-450.md` (Q1–Q7). lessons: L4 „Port preserves HEAD“, L22 (unruled Medium-იანი STOP = short FAIL), L60 (store-ში shell edit/`git stash` აკრძალულია), L1 evidence. '
    'ახალი სისტემური ამოცანა **SYS-R450-STORE-STYLE-SCAN** (test-only; Store-ის style scan-ის ერთი helper; ხურავს 1 Medium + 6 Low) — STORE-2b-3b-მდე. '
    '2b-3d-ში მკვდარი Store ფაილები წაიშლება Saba-ს 2026-11-10-ის legacy წესით, TestimonialsSection-ის გარდა (Q6). '
    'შემდეგ: round 451 = REGRESSION-2026-11-13, თუ დაგეგმვა 11-13-ზე ან მის შემდეგ ხდება, თორემ SYS-R450-STORE-STYLE-SCAN; მერე 2b-3b. შემდეგი RETRO — 465.',
]
lines[idx:idx] = new
open(p, 'w', encoding='utf-8').write('\n'.join(lines))
open(DONE, 'w').write('done\n')
print('feature-status updated at line', idx + 1)
