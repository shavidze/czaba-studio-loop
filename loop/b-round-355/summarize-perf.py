"""Summarize B round 355 perf runs vs C round 354 (python3 -I b-round-355/summarize-perf.py)."""
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
ref = {r['id']: r for r in json.load(open(f'{L}/c-round-354/perf-results/latest-interactions.json'))['rows']}
FOCUS = ['interact.drag.video.stopped.move-components-per-move', 'interact.drag.video.stopped.move-components-max',
         'interact.drag.video.playing.move-components-max', 'interact.drag.video.playing.move-components-per-move']
for name in ('sketch', 'mu-b2'):
    p = f'{L}/b-round-355/perf-{name}-results/latest-interactions.json'
    if not os.path.exists(p):
        print(name, 'missing'); continue
    d = json.load(open(p)); rows = d['rows']
    rc = open(f'{L}/b-round-355/perf-{name}.log').read().strip().splitlines()[-1]
    asserted = [r for r in rows if r.get('mode') == 'assert']
    new = [r['id'] for r in rows if r['id'] not in ref]
    print(f"{name}: {rc} complete {d.get('complete')} rows {len(rows)} asserted {len(asserted)} pass {sum(1 for r in asserted if r.get('pass'))} NEW {len(new)} durationMs {d.get('durationMs')} failures {len(d.get('failures') or [])}")
    for r in asserted:
        if not r.get('pass'):
            print(f"  RED {r['id']} median {r.get('median')} samples {r.get('samples')} budget {r['budget']['op']}{r['budget']['value']}")
    for i in FOCUS:
        r = next(x for x in rows if x['id'] == i)
        print(f"  row {i} {r.get('mode')} samples {r.get('samples')} pass {r.get('pass')} c354 {ref[i].get('samples')}")
    higher = [f"{r['id']} {ref[r['id']]['median']}->{r['median']}" for r in rows
              if r['id'] in ref and r.get('kind') == 'deterministic' and isinstance(r.get('median'), (int, float))
              and isinstance(ref[r['id']].get('median'), (int, float)) and r['median'] > ref[r['id']]['median']
              and ('components' in r['id'] or 'commits' in r['id'])]
    print(f"  deterministic components/commits rows higher than C354: {len(higher)}" + (' | ' + '; '.join(higher) if higher else ''))
