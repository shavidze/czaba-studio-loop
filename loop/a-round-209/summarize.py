import json, sys
for path in sys.argv[1:]:
    d = json.load(open(path))
    rows = d['rows']
    fails = [r['id'] for r in rows if r.get('mode') == 'assert' and not r.get('pass')]
    print(path, 'complete', d['complete'], 'rows', len(rows), 'durationMs', d['durationMs'], 'assertFails', fails, 'failures', d.get('failures'))
    for r in rows:
        i = r['id']
        if i.startswith('fader.') and any(k in i for k in ('move-components-max', 'move-components-per-move', 'release-commits', 'move-to-paint-p95.1x', 'restarts', 'down-components')) and 'clip' not in i:
            print(f"  {i:60s} {r['mode']:7s} median={r['median']} samples={r['samples']}")
        if i.startswith('harness.move-window'):
            print(f"  {i:60s} {r['mode']:7s} median={r['median']}")
