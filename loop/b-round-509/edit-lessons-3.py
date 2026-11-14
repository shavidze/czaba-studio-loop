# RETRO 510 lessons edit 3 (D-29z1849, advisor closing check): restore "per input origin" and "grep open findings on touched files" in L26. Run once from the loop root.
import os, sys
P = 'lessons.md'; DONE = 'b-round-509/edit-lessons-3.done'
if os.path.exists(DONE): sys.exit('refused: done')
s = open(P, encoding='utf-8').read()
old = 'mapping each behaviour sentence to a test row, browser row, `[K#]` claim or inference; `tools/ledger-check.py` fails without it.'
new = 'mapping each behaviour sentence to a test row, browser row per input origin, `[K#]` claim or inference, and greps open findings on touched files; `tools/ledger-check.py` fails without it.'
assert s.count(old) == 1
s = s.replace(old, new)
open(P, 'w', encoding='utf-8').write(s); open(DONE, 'w').write('applied\n')
open('b-round-509/edit-lessons-3.log', 'w').write('E7 L26 ledger clause: + "per input origin", + "and greps open findings on touched files"\n')
print('ok')
