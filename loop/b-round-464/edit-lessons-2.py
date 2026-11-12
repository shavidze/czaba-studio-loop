# RETRO 465 lessons edit 2 (D-29z1641, advisor closing check): L58 heading names only what remains. Run once from the loop root.
import os, sys
p = 'lessons.md'; DONE = 'b-round-464/edit-lessons-2.done'
if os.path.exists(DONE): sys.exit('already applied')
s = open(p, encoding='utf-8').read()
old = '**Pre-step rules and the review claim (RETRO 401):**'; assert s.count(old) == 1
s = s.replace(old, '**Pre-step rules (RETRO 401):**')
old2 = '. Evidence: C-R399-01, D-29z1369 (2×).'; assert s.count(old2) == 1
s = s.replace(old2, '. Evidence: C-R399-01, D-29z1369 (1×).')
open(p, 'w', encoding='utf-8').write(s); open(DONE, 'w').write('ok\n'); print('ok')
