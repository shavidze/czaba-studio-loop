"""Summarise B round 360 -> 361 perf runs against C360 (python3 -I summarize-perf.py > perf-summary.txt)."""
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
WATCH = ['interact.click.commits', 'interact.click.components', 'interact.click.commits.6x', 'interact.click.components.6x',
         'interact.select.same-lane.30.commits', 'interact.select.same-lane.30.components',
         'interact.select.reclick.30.commits', 'interact.select.reclick.30.components']
oracle = {r['id']: r for r in json.load(open(f'{L}/c-round-360/latest-interactions.json'))['rows']}
for name in ['sketch', 'mu-1', 'sketch-b', 'mu-1-b', 'mu-7-b']:
    p = f'{L}/b-round-360/perf-{name}-results/latest-interactions.json'
    if not os.path.exists(p):
        print(f'== {name}: MISSING {p}'); continue
    d = json.load(open(p)); rows = {r['id']: r for r in d['rows']}
    asserted = [r for r in d['rows'] if r['mode'] == 'assert']
    red = [r for r in asserted if r.get('pass') is False]
    new = [i for i in rows if i not in oracle]
    rc = open(f'{L}/b-round-360/perf-{name}.log').read().strip().splitlines()[-1]
    print(f'== {name}: {rc}; complete {d.get("complete")}; failures {len(d.get("failures", []))}; rows {len(d["rows"])}; '
          f'asserted pass {len(asserted) - len(red)}/{len(asserted)}; NEW {len(new)}; durationMs {d.get("durationMs")}')
    for i in WATCH:
        r = rows.get(i)
        if r:
            print(f'   {i}: samples {r["samples"]} details {[x.get("perCommit") if isinstance(x, dict) else x for x in (r.get("details") or [])]} (C360 {oracle[i]["samples"]})')
    for r in red:
        print(f'   RED {r["id"]} median {r["median"]} budget {r["budget"]["op"]}{r["budget"]["value"]}')
    changed = [(i, r['median'], oracle[i]['median']) for i, r in rows.items() if r.get('kind') == 'deterministic' and i in oracle
               and r.get('median') != oracle[i].get('median')]
    print(f'   deterministic rows differing from C360: {len(changed)}')
    for i, a, b in changed:
        print(f'     DIFF {i}: {a} (C360 {b})')
