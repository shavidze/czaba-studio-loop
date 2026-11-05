import sys, json, pathlib
p = pathlib.Path(sys.argv[1])/'perf/budgets.interactions.json'
raw = p.read_text()
rows = json.loads(raw)
plan = {}
for st in ('stopped', 'playing'):
    for rate in ('', '.6x'):
        plan[f'interact.drag.group.{st}.move-components-per-move{rate}'] = ({'op': '<=', 'value': 27}, ' Asserted since PERF-DRAG-PREVIEW stage c4-ii (round 340): the group move preview left the provider history (B sketch 26.969/move at 1x and 6x, stopped and playing; HEAD 74.781; the lane drag is 24.906).')
        plan[f'interact.drag.group.{st}.release-commits{rate}'] = ({'op': '==', 'value': 1}, ' Asserted since PERF-DRAG-PREVIEW stage c4-ii (round 340): the release commits once (B sketch and HEAD 1).')
    for rate in ('', '.6x'):
        pass
for rate in ('', '.6x'):
    plan[f'interact.drag.group.playing.move-restarts{rate}'] = ({'op': '==', 'value': 0}, ' Asserted since PERF-DRAG-PREVIEW stage c4-ii (round 340): a group move preview never restarts the playing graph.')
seen = 0
for r in rows:
    if r['id'] in plan:
        assert r['mode'] == 'record' and r['budget'] is None, r['id']
        budget, note = plan[r['id']]
        r['mode'] = 'assert'
        r['budget'] = budget
        r['owner'] = 'PERF-DRAG-PREVIEW-c4-ii'
        r['note'] = r['note'] + note
        seen += 1
assert seen == 10, seen
p.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + '\n')
print('budgets ok', seen)
