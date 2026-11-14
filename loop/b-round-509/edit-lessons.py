# RETRO 510 lessons edit (D-29z1847). Run from the loop root once; refuses if the .done marker exists.
import os, sys
P = 'lessons.md'; DONE = 'b-round-509/edit-lessons.done'
if os.path.exists(DONE): sys.exit('refused: done')
L = open(P, encoding='utf-8').read().split('\n')
log = []
def one(pred, what):
    h = [i for i, l in enumerate(L) if pred(l)]
    if len(h) != 1: sys.exit(f'{what}: {len(h)} hits')
    return h[0]
# E1 L52 append (tech-lead A)
i = one(lambda l: l.startswith('52. '), 'L52')
L[i] = L[i] + ' **Site × attribute mutants (RETRO 510):** per pinned site, one mutant per asserted attribute set to another valid value (variant, size, `to`, handler, focus precondition) and one swap of same-shaped siblings; the review asks "which single edit survives?". Evidence: STOPs 496/499/505/507 (4×).'
log.append('E1 L52 + site x attribute clause')
# E2 L11 append (tech-lead B; B adopts, loop-internal grant rule)
i = one(lambda l: l.startswith('11. '), 'L11')
L[i] = L[i] + ' **Strengthen-only (RETRO 510):** A fixes a reviewer finding on a sketch test line in-round if the fix only adds asserts/rows (`expect(` not fewer) with a red mutant; check 4 on tests = every sketch `+` line present. Product-code Mediums still STOP.'
log.append('E2 L11 + strengthen-only clause')
# E3 L26 clause replace (tech-lead C, enforcement tool named)
old = '**Every sentence has a ledger (RETRO 495, RC-R492-DOC-TRUTH-REVIEW):** before dispatch, `b-round-N/doc-ledger.md` maps each declarative doc sentence to a test row, a browser row on the same code per input origin (mouse, keyboard), a `[K#]` claim, or inference wording, and greps open/deferred findings on the touched files for contradictions; a task STOP list never overrides the clause above. Evidence: C-R492-01, C-R493-01 (2×).'
new = '**Behaviour sentences have a ledger (RETRO 510):** a sketch with doc text ships `b-round-N/doc-ledger.md` mapping each behaviour sentence to a test row, browser row, `[K#]` claim or inference; `tools/ledger-check.py` fails without it. Evidence: C-R492-01, C-R493-01 (2×); 5/11 in 495–509.'
i = one(lambda l: old in l, 'L26 clause')
L[i] = L[i].replace(old, new)
log.append('E3 L26 ledger clause replaced')
# E4 L1 evidence count
o1 = 'An inventory grep is a scanner too: RETRO450-B-INVENTORY-TOOL-FIRST-PASS (1×).'
i = one(lambda l: o1 in l, 'L1 inventory')
L[i] = L[i].replace(o1, 'An inventory grep is a scanner too: run each task grep at HEAD and save it. Evidence: RETRO450-B-INVENTORY-TOOL-FIRST-PASS, round 509 A dev 1 (2×).')
log.append('E4 L1 inventory clause + run-at-HEAD, 2x')
# E5 delete redundant cross-reference line
i = one(lambda l: l == '(Also L38 under C: perf runs alone.)', 'l.43')
del L[i]
log.append('E5 removed "(Also L38 under C: perf runs alone.)"')
# E6 header amendment pointer
oh = '(`retro-495.md` §10; before: `b-round-494/lessons-before-495.md`; RETRO 480: D-29z1706).'
i = one(lambda l: oh in l, 'header')
L[i] = L[i].replace(oh, '(`retro-495.md` §10; before: `b-round-494/lessons-before-495.md`; RETRO 480: D-29z1706). **RETRO 510 (D-29z1847):** L1, L11, L26, L52 (`retro-510.md` §10; before: `b-round-509/lessons-before-510.md`).')
log.append('E6 header amendment pointer')
open(P, 'w', encoding='utf-8').write('\n'.join(L))
open(DONE, 'w').write('applied\n'); open('b-round-509/edit-lessons.log', 'w').write('\n'.join(log) + '\n')
print('\n'.join(log))
