# B round 347 -> 348: PERF-DRAG-PREVIEW conversions. Usage: python3 -I apply-budgets.py <tree-root>
# Values = ceil of C round 347 (c-round-347/perf-results/latest-interactions.json), equal at 1x stopped and playing.
import json, pathlib, sys

p = pathlib.Path(sys.argv[1]) / 'perf/budgets.interactions.json'
rows = json.loads(p.read_text())
OWNER = 'PERF-DRAG-PREVIEW-conv'
SRC = ' Asserted since PERF-DRAG-PREVIEW conversions (round 348): ceil of the C round 347 value'
plan = {}
for st in ('stopped', 'playing'):
    plan[f'interact.drag.trim.{st}.move-components-per-move'] = ('record', {'op': '<=', 'value': 15}, SRC + ' 14.75 (c6-ii; target <= 15 met).')
    plan[f'interact.drag.trim.{st}.move-components-max'] = ('record', {'op': '<=', 'value': 15}, SRC + ' 15 (deterministic row, no headroom by design).')
    plan[f'interact.drag.trim.{st}.release-commits'] = ('record', {'op': '==', 'value': 1}, ' Asserted since PERF-DRAG-PREVIEW conversions (round 348): the trim release commits once (C round 347: 1).')
    plan[f'interact.drag.move.{st}.move-components-per-move'] = ('record', {'op': '<=', 'value': 16}, SRC + ' 15.317; it includes the one project-end crossing commit (82 components; steady commits 12), so the <= 15 target is met only in steady state until the crossing is addressed.')
    plan[f'interact.drag.move.{st}.release-commits'] = ('record', {'op': '==', 'value': 1}, ' Asserted since PERF-DRAG-PREVIEW conversions (round 348): the move release commits once (C round 347: 1).')
    plan[f'interact.drag.fade.{st}.move-components-per-move'] = ('assert', {'op': '<=', 'value': 4}, ' Tightened from <= 24 at PERF-DRAG-PREVIEW conversions (round 348): ceil of the C round 347 value 3.933.')
    plan[f'interact.drag.fade.{st}.move-components-max'] = ('assert', {'op': '<=', 'value': 4}, ' Tightened from <= 24 at PERF-DRAG-PREVIEW conversions (round 348): C round 347 value 4 (deterministic row, no headroom by design).')
seen = 0
for r in rows:
    if r['id'] in plan:
        mode, budget, note = plan[r['id']]
        assert r['mode'] == mode, (r['id'], r['mode'])
        if mode == 'record':
            assert r['budget'] is None, r['id']
        else:
            assert r['budget'] == {'op': '<=', 'value': 24}, (r['id'], r['budget'])
        r['mode'] = 'assert'
        r['budget'] = budget
        r['owner'] = OWNER
        r['note'] = r['note'] + note
        seen += 1
assert seen == 14, seen
p.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + '\n')
print('budgets ok', seen, 'asserted', sum(1 for r in rows if r['mode'] == 'assert'))
