# RETRO 510 lessons trim (D-29z1847): header history compacted (full text kept in b-round-509/lessons-before-510.md l.3 and decisions_log_b). Run once from the loop root.
import os, sys
P = 'lessons.md'; DONE = 'b-round-509/edit-lessons-2.done'
if os.path.exists(DONE): sys.exit('refused: done')
L = open(P, encoding='utf-8').read().split('\n')
old = L[2]
new = 'Kept by the RETRO rounds. Sources: `retros/retro-200.md` … `retro-510.md` (windows 123–199 … 495–509). ≤ 60 lines. Replace obsolete lessons; do not append forever. "(1×)" = single-event evidence, keep as hypothesis. Numbers are stable ids, not order. Amendment history: this line before RETRO 510 is kept verbatim in `b-round-509/lessons-before-510.md` l.3; amendments are in the `decisions_log_b` D-IDs (RETRO 495: D-29z1769; RETRO 510: D-29z1847, L1, L11, L26, L52, `retro-510.md` §10).'
assert old.startswith('Kept by the RETRO rounds.'), old[:40]
L[2] = new
open(P, 'w', encoding='utf-8').write('\n'.join(L)); open(DONE, 'w').write('applied\n')
open('b-round-509/edit-lessons-2.log', 'w').write('T1 header line 3 compacted: %d -> %d bytes\n' % (len(old.encode()), len(new.encode())))
print(open('b-round-509/edit-lessons-2.log').read())
