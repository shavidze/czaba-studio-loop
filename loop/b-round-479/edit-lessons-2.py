# RETRO 480 (D-29z1706), second pass after edit-lessons.py left 58,367 B (> 57,500): evidence glosses only.
# l.41 tags/examples and l.24/l.58 items are tech-lead tier 2 (consult-tech-lead.md §2); l.18 and l.40 cuts are B's,
# each removes explanation text and keeps every finding id. Each old string must occur exactly once. Run from the loop root.
import os
import sys

P = 'lessons.md'
DONE = 'b-round-479/edit-lessons-2.done'
if os.path.exists(DONE):
    print('refused: .done marker exists')
    sys.exit(0)
L = open(P, encoding='utf-8').read().split('\n')
REPL = [
    (41, ' (RETRO 321)', ''), (41, ' (RETRO 336)', ''), (41, ' (RETRO 353)', ''), (41, ' (RETRO 369)', ''),
    (41, ' (RETRO 385)', ''), (41, ' (RETRO 401)', ''), (41, ' (RETRO 416)', ''),
    (41, ' (e.g. hit-200, hit-404, miss, abort, disable, delete, join)', ''),
    (24, ' (RETRO 435)', ''),
    (58, ' A rule that lives only in task text is lost when a task forgets it, so the rule lives here.', ''),
    (18, ' Why rewritten: three clause additions in 245–259 left 5 claim findings against a baseline of 2 (retro-260 §8, `consequence-tester`).', ''),
    (18, '(A-R214-DEV-RANGE-LIVE: `[data-range-end]` renders only for all-tracks ranges)', '(A-R214-DEV-RANGE-LIVE)'),
    (18, '(C-N229-S3-METHOD: Escape does not clear a time selection here, an empty-lane click does)', '(C-N229-S3-METHOD)'),
    (40, '(RETRO 435; evidence: B-R433-HEAD-BLUE-PX-MISCOUNT, task 8 px vs probe 32; B-R434-CONFIRMMODAL-NAME, 2×)', '(B-R433-HEAD-BLUE-PX-MISCOUNT, B-R434-CONFIRMMODAL-NAME, 2×)'),
    (40, 'C-R283-02 (`+1` run file never saved), C-R289-INFO-01 and C-R298-02 (`sketch.patch` cited, absent)', 'C-R283-02, C-R289-INFO-01, C-R298-02'),
    (40, 'C-R474-01 (round-474 list was not produced on a tree that held the test edits; D-29z1678)', 'C-R474-01 (D-29z1678)'),
    (40, 'C-R324-01 (K19 `"interact\\.select` missed B\'s own `interact.harness.select-same-lane-live`, 4 vs ≥ 5)', 'C-R324-01'),
    (40, 'C-R401-01 (retro-401 §10 named an l.3 pointer change the file did not have)', 'C-R401-01'),
]
bad = [(ln, o) for ln, o, _ in REPL if L[ln - 1].count(o) != 1]
if bad:
    for b in bad:
        print('NOT-UNIQUE', b)
    sys.exit(1)
log = []
for ln, o, n in REPL:
    L[ln - 1] = L[ln - 1].replace(o, n)
    log.append('l.%d -%d B: %s -> %s' % (ln, len(o.encode()) - len(n.encode()), o, n))
open(P, 'w', encoding='utf-8').write('\n'.join(L))
open('b-round-479/edit-lessons-2.log', 'w', encoding='utf-8').write('\n'.join(log) + '\n')
open(DONE, 'w').write('applied\n')
print('applied', len(REPL))
