# RETRO 480 (D-29z1706), third pass: l.3 pointer names every trimmed lesson (edit-lessons-2 also trimmed L29, L56) and is shorter.
import os, sys
P = 'lessons.md'; DONE = 'b-round-479/edit-lessons-3.done'
if os.path.exists(DONE):
    print('refused: .done marker exists'); sys.exit(0)
L = open(P, encoding='utf-8').read().split('\n')
old = (' **RETRO 480 (D-29z1706):** L47 and L10 gain one clause each; evidence trimmed on L23, L58, L37 and L57 '
       '(`tech-lead`, `retros/retro-480.md` §10); full previous text `b-round-479/lessons-before-480.md`.')
new = (' **RETRO 480 (D-29z1706):** L47, L10 +1 clause; evidence trimmed on L23, L29, L37, L56, L57, L58 '
       '(`retro-480.md` §10; before: `b-round-479/lessons-before-480.md`).')
assert L[2].count(old) == 1
L[2] = L[2].replace(old, new)
open(P, 'w', encoding='utf-8').write('\n'.join(L)); open(DONE, 'w').write('applied\n'); print('applied')
