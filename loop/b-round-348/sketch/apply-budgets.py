"""B round 348 -> 349 sketch: 22 record rows for the video trim-start and fade-in drags. Usage: python3 -I apply-budgets.py <store-tree> [--allow-store]."""
import json, sys, pathlib
root = pathlib.Path(sys.argv[1]).resolve()
if str(root) == '/home/runner/czaba-project/store' and '--allow-store' not in sys.argv:
    sys.exit('refusing the live store path (pass --allow-store as A)')
p = root / 'perf' / 'budgets.interactions.json'
rows = json.loads(p.read_text())
ids = [r['id'] for r in rows]
anchor = ids.index('interact.harness.drag-video-live')
OWNER = 'PERF-CAND-VIDEO-TRIM-FADE-ROWS'
names = {'trim': ('video clip trim-start drag', 'interact.drag.trim'), 'fade': ('video clip fade-in drag', 'interact.drag.fade')}
new = []
for drag in ('trim', 'fade'):
    label, twin = names[drag]
    for state in ('stopped', 'playing'):
        metrics = ['move-components-per-move', 'move-components-max', 'release-commits', 'move-to-paint-p95']
        if state == 'playing':
            metrics += ['move-restarts', 'release-restarts']
        for m in metrics:
            twin_row = next(r for r in rows if r['id'] == f'interact.drag.video.{state}.{m}')
            new.append({
                'id': f'interact.drag.video-{drag}.{state}.{m}',
                'scenario': f'{label}, {state}, 30 audio clips',
                'metric': m, 'unit': twin_row['unit'], 'kind': twin_row['kind'],
                'mode': 'record', 'budget': None, 'owner': OWNER,
                'note': (f'1x only, measured last (after the 30-clip block), on the same imported video clip as interact.drag.video.*: '
                         f'same windows and definition as {twin}.{state}.{m}. Record until C measures it (L58, PERF-CAND-VIDEO-TRIM-FADE-ROWS, round 349); '
                         f'kind copied from interact.drag.video.{state}.{m}.'),
            })
for drag in ('trim', 'fade'):
    new.append({
        'id': f'interact.harness.drag-video-{drag}-live', 'scenario': names[drag][0], 'metric': f'drag-video-{drag}-live',
        'unit': 'boolean (1 = true)', 'kind': 'deterministic', 'mode': 'record', 'budget': None, 'owner': OWNER,
        'note': ('1x only. 1 only when both the stopped and the playing ' + names[drag][0] +
                 (' were live: data-clip-start changes from the start to mid-drag and from mid-drag to the end' if drag == 'trim'
                  else ' were live: data-fade-in grows from the start to mid-drag and from mid-drag to the end') +
                 '; 0 when the video setup failed. Record until C measures it (L58).'),
    })
assert not set(r['id'] for r in new) & set(ids)
rows[anchor + 1:anchor + 1] = new
p.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + '\n')
print('budgets', len(rows), 'added', len(new))
