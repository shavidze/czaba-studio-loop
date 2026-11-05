"""B round 353 -> 354: PERF-CAND-VIDEO-TRIM-FADE-COST stage 2 budgets.
Usage: python3 -I apply-budgets.py <store-tree>. Refuses the real store path.
Converts the deterministic video-trim / video-fade rows to assert at the ceiling of C round 350
(c-round-350/perf-results/latest-interactions.json). Keeps json.dumps(indent=2) + trailing newline
only if the file already used that form (checked)."""
import json, sys, os
root = os.path.realpath(sys.argv[1])
if root == os.path.realpath('/home/runner/czaba-project/store') and '--store' not in sys.argv:
    sys.exit('refusing the real store path (pass --store only for A)')
p = os.path.join(root, 'perf/budgets.interactions.json')
raw = open(p, encoding='utf-8').read()
rows = json.loads(raw)
assert json.dumps(rows, indent=2, ensure_ascii=False) + '\n' == raw, 'format differs; abort'
OWNER = 'PERF-CAND-VIDEO-TRIM-FADE-COST-2'
CONV = {
 'interact.drag.video-trim.stopped.move-components-per-move': ('<=', 13, '12.817'),
 'interact.drag.video-trim.stopped.move-components-max': ('<=', 15, '15'),
 'interact.drag.video-trim.stopped.release-commits': ('==', 1, '1'),
 'interact.drag.video-trim.playing.move-components-max': ('<=', 15, '15'),
 'interact.drag.video-trim.playing.release-commits': ('==', 1, '1'),
 'interact.drag.video-trim.playing.move-restarts': ('==', 0, '0'),
 'interact.drag.video-fade.stopped.move-components-per-move': ('<=', 3, '2.95'),
 'interact.drag.video-fade.stopped.move-components-max': ('<=', 3, '3'),
 'interact.drag.video-fade.playing.move-components-max': ('<=', 3, '3'),
 'interact.drag.video-fade.playing.move-restarts': ('==', 0, '0'),
 'interact.harness.drag-video-trim-live': ('==', 1, '1'),
 'interact.harness.drag-video-fade-live': ('==', 1, '1'),
}
seen = set()
for r in rows:
    if r['id'] in CONV:
        op, val, c350 = CONV[r['id']]
        assert r['mode'] == 'record' and r['budget'] is None and r['kind'] == 'deterministic', r['id']
        assert r['owner'] == 'PERF-CAND-VIDEO-TRIM-FADE-ROWS', r['id']
        r['mode'] = 'assert'
        r['budget'] = {'op': op, 'value': val}
        r['owner'] = OWNER
        if r['id'].startswith('interact.harness.'):
            tail = f' Stage 2 (round 354, D-29z1138): assert {op} {val}; C round 350: 1 (the drag was live in all three passes).'
        elif op == '==':
            tail = f' Stage 2 (round 354, D-29z1138): assert {op} {val}; C round 350 value {c350} (three equal samples, 1x).'
        else:
            tail = f' Stage 2 (round 354, D-29z1138): assert {op} {val}, the ceiling of the C round 350 value {c350} (three equal samples, 1x).'
        r['note'] = r['note'] + tail
        seen.add(r['id'])
assert seen == set(CONV), set(CONV) - seen
open(p, 'w', encoding='utf-8').write(json.dumps(rows, indent=2, ensure_ascii=False) + '\n')
from collections import Counter
print('rows', len(rows), 'assert', Counter(r['mode'] for r in rows)['assert'], 'converted', len(seen))
