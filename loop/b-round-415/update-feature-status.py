import os, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
M='/home/runner/czaba-project/tmp/studio-real-loop/b-round-415/update-feature-status.done'
if os.path.exists(M): sys.exit('already applied (marker)')
L=open(P,encoding='utf-8').read().split('\n')
assert L[2].startswith('განახლდა: 2026-11-08 · ავტორი: B (round 414 → round 415 დაგეგმვა, D-29z1441…D-29z1443)')
L[2]=L[2].replace('(round 414 → round 415 დაგეგმვა, D-29z1441…D-29z1443)','(round 415 → round 416 დაგეგმვა, D-29z1444…D-29z1449)')
idx=[i for i,x in enumerate(L) if x.startswith('  შემდეგი (D-29z1441…D-29z1443): **round 415 = SYS-R388-FAKE-WEB-AUDIO-HELPER')]
assert len(idx)==1, idx
i=idx[0]
new=['  - **Round 415 = SYS-R388-FAKE-WEB-AUDIO-HELPER — მზადაა (D-29z1444).** C round 415 PASS: 8 row, `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-415.json`); 4 ფაილი 54/54, `it()` body-ები HEAD-ის ტოლია, mutant-ების შედეგი B-ისას ბაიტ-ბაიტ ემთხვევა (8 წითელი, 3 მწვანე დიზაინით), meter play/stop და auth რეალურ Chromium-ში 1440×900 და 1280×720-ზე. Gate 415 გამოქვეყნდა `344a59f`. A-R388-REVIEW-L3 დაიხურა helper-ის მხარეს; call-site-ის ნარჩენი → A-R415-REVIEW-L1-CALLSITE-FLAG (Low, deferred).',
     '  შემდეგი (D-29z1445…D-29z1449): **round 416 = RETRO 416 — მუშავდება (კოდი არ იცვლება).** ფანჯარა 401–415: `retros/retro-416.md`, `user-review/screen-review-416.md`, `lessons.md` (L22, L38, L56, L57, L58 + `tools/l58-check.py`). C ამოწმებს traceability-ს და სამ ბრაუზერის row-ს. შემდეგ: REGRESSION-2026-11-10 (თუ დროა) → SYS-CLOCK-DETERMINISM → **SYS-R416-PREVIEW-CONTROLLER** (ახალი, ARCH-CHECKPOINT-PREVIEW-AFTER-13C-ის L46 default; ხურავს 7 preview Low-ს) → SYS-R369 (root-ის პასუხით) → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2.',
     '  ძველი: '+L[i].lstrip()]
L[i:i+1]=new
open(P,'w',encoding='utf-8').write('\n'.join(L))
open(M,'w').write('applied\n')
print('ok')
