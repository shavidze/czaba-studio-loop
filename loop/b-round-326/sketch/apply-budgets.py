import json, sys, pathlib
p = pathlib.Path(sys.argv[1]) / 'perf/budgets.interactions.json'
rows = json.loads(p.read_text())
want = {
  'interact.drag.fade.stopped.move-components-per-move': ('<=', 24),
  'interact.drag.fade.playing.move-components-per-move': ('<=', 24),
  'interact.drag.fade.stopped.move-components-max': ('<=', 24),
  'interact.drag.fade.playing.move-components-max': ('<=', 24),
  'interact.drag.fade.playing.move-restarts': ('==', 0),
}
hit = 0
for r in rows:
    if r['id'] in want:
        op, v = want[r['id']]
        r['mode'] = 'assert'; r['budget'] = {'op': op, 'value': v}
        r['note'] = r['note'] + ' Asserted since PERF-DRAG-PREVIEW stage b (round 327).'
        r['owner'] = 'PERF-DRAG-PREVIEW-b'
        hit += 1
assert hit == 5, hit
p.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + '\n')
print('budgets sketch applied', hit)
