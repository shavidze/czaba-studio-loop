"""B round 355 -> 356: PERF-CAND-VIDEO-MOVE-BUDGET (+ GATE354-S1 note wording).
Usage: python3 -I apply-budgets.py <store-tree>. Refuses the real store path unless --store (A only).
1. Tightens interact.drag.video.stopped.move-components-per-move <= 24 -> <= 10 (ceiling of 9.883).
2. interact.drag.video.{stopped,playing}.move-components-max record -> assert <= 13 / <= 12.
3. Drops the stale "Record until ..." clause from every asserted row whose note still carries it
   (the 12 stage-2 rows of GATE354-S1 and the 5 c5-ii video move rows: same class, L7).
Keeps json.dumps(indent=2, ensure_ascii=False) + newline (checked before writing)."""
import json, sys, os
from collections import Counter

root = os.path.realpath(sys.argv[1])
if root == os.path.realpath('/home/runner/czaba-project/store') and '--store' not in sys.argv:
    sys.exit('refusing the real store path (pass --store only for A)')
p = os.path.join(root, 'perf/budgets.interactions.json')
raw = open(p, encoding='utf-8').read()
rows = json.loads(raw)
assert json.dumps(rows, indent=2, ensure_ascii=False) + '\n' == raw, 'format differs; abort'

OWNER = 'PERF-CAND-VIDEO-MOVE-BUDGET'
SRC = 'C round 350, B round 353 sketch and C round 354 (three equal samples in each run, 1x)'
CLAUSES = [
    ' Record until C measures it (L58, PERF-CAND-VIDEO-TRIM-FADE-ROWS, round 349); kind copied from ',
    ' Record until c5-ii moves the video preview off history (PERF-DRAG-PREVIEW c5-i, L58).',
    ' Record until C measures it (L58).',
]
REPL = [' Kind copied from ', '', '']

TIGHTEN = {
    'interact.drag.video.stopped.move-components-per-move': (
        ('assert', 'deterministic', {'op': '<=', 'value': 24}),
        {'op': '<=', 'value': 10},
        f' Tightened (round 356, D-29z1147): <= 10, the ceiling of 9.883 ({SRC}); 593 of 600 components over 60 moves,'
        ' so 8 or more extra components in the window turn it red; mutant M-B2 (dock re-renders on video'
        ' preview writes) measured 15.75 and passed the old <= 24.'),
    'interact.drag.video.stopped.move-components-max': (
        ('record', 'deterministic', None),
        {'op': '<=', 'value': 13},
        f' Asserted (round 356, D-29z1147): <= 13, the value 13 ({SRC}; no headroom, deterministic max).'
        ' Unlike the audio move/lane/group max rows, which stay record, this 1x single-clip scenario repeated'
        ' exactly; mutant M-B2 measured 17.'),
    'interact.drag.video.playing.move-components-max': (
        ('record', 'deterministic', None),
        {'op': '<=', 'value': 12},
        f' Asserted (round 356, D-29z1147): <= 12, the value 12 ({SRC}; no headroom, deterministic max).'
        ' Unlike the audio move/lane/group max rows, which stay record, this 1x single-clip scenario repeated'
        ' exactly; mutant M-B2 measured 17.'),
}

cleaned, tightened = [], []
for r in rows:
    note = r.get('note') or ''
    if r['id'] in TIGHTEN:
        (mode0, kind0, budget0), budget, tail = TIGHTEN[r['id']]
        assert (r['mode'], r['kind'], r['budget']) == (mode0, kind0, budget0), r['id']
        r['mode'] = 'assert'
        r['budget'] = budget
        r['owner'] = OWNER
        note = note.replace('; record, as every move/lane/group max row.', '.')
        note = note + tail
        tightened.append(r['id'])
    if r['mode'] == 'assert':
        before = note
        for c, s in zip(CLAUSES, REPL):
            note = note.replace(c, s)
        if note != before:
            cleaned.append(r['id'])
    r['note'] = note

assert sorted(tightened) == sorted(TIGHTEN), tightened
left = [r['id'] for r in rows if r['mode'] == 'assert' and 'Record until' in r['note']]
assert not left, left
assert all('  ' not in r['note'] for r in rows if r['id'] in cleaned), 'double space'
open(p, 'w', encoding='utf-8').write(json.dumps(rows, indent=2, ensure_ascii=False) + '\n')
print('rows', len(rows), 'assert', Counter(r['mode'] for r in rows)['assert'],
      'tightened', len(tightened), 'cleaned', len(cleaned))
print('cleaned ids:', *sorted(cleaned), sep='\n  ')
