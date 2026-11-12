# RETRO 480 (D-29z1707, advisor closing check): the L47 clause asks for an announcement row only once an announcer exists
# (else round 482 could become a root request and the row would be unpassable); l.3 shortened to stay <= 57,500 B.
import os, sys
P = 'lessons.md'; DONE = 'b-round-479/edit-lessons-4.done'
if os.path.exists(DONE):
    print('refused: .done marker exists'); sys.exit(0)
L = open(P, encoding='utf-8').read().split('\n')
R = [(27, 'the task carries a first-Tab row (L47 target) and a route-announcement row (live-region text = new document.title).',
          'the task carries a first-Tab row (L47 target) and, once an announcer exists, an announcement row (live text = new document.title).'),
     (2, 'L47, L10 +1 clause; evidence trimmed on L23, L29, L37, L56, L57, L58', 'L47, L10 +1 clause; trimmed L23, L29, L37, L56, L57, L58')]
for i, o, n in R:
    assert L[i].count(o) == 1, (i, o)
    L[i] = L[i].replace(o, n)
open(P, 'w', encoding='utf-8').write('\n'.join(L)); open(DONE, 'w').write('applied\n'); print('applied')
