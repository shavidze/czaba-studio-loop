"""Summarise B round 359 -> 360 perf runs against C359 (python3 -I summarize-perf.py > perf-summary.txt)."""
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
NINE = ['interact.play.start-commits', 'interact.play.start-components', 'interact.play.start-sources',
        'interact.play.stop-commits', 'interact.play.stop-components',
        'interact.drag.fade.stopped.release-commits', 'interact.drag.fade.playing.release-commits',
        'interact.drag.video-fade.stopped.release-commits', 'interact.drag.video-fade.playing.release-commits']
oracle = {r['id']: r for r in json.load(open(f'{L}/c-round-359/latest-interactions.json'))['rows']}
for name in ['sketch', 'mu-a', 'mu-b']:
    p = f'{L}/b-round-359/perf-{name}-results/latest-interactions.json'
    if not os.path.exists(p):
        print(f'== {name}: MISSING {p}'); continue
    d = json.load(open(p)); rows = {r['id']: r for r in d['rows']}
    asserted = [r for r in d['rows'] if r['mode'] == 'assert']
    red = [r for r in asserted if r.get('pass') is False]
    new = [i for i in rows if i not in oracle]
    higher = [i for i, r in rows.items() if r.get('kind') == 'deterministic' and isinstance(r.get('median'), (int, float))
              and isinstance(oracle.get(i, {}).get('median'), (int, float)) and r['median'] > oracle[i]['median']
              and any(k in i for k in ('components', 'commits', 'sources', 'restarts'))]
    rc = open(f'{L}/b-round-359/perf-{name}.log').read().strip().splitlines()[-1]
    print(f'== {name}: {rc}; complete {d.get("complete")}; failures {len(d.get("failures", []))}; rows {len(d["rows"])}; '
          f'asserted pass {len(asserted) - len(red)}/{len(asserted)}; NEW {len(new)}; durationMs {d.get("durationMs")}')
    for i in NINE:
        print(f'   {i}: samples {rows[i]["samples"]} median {rows[i]["median"]} pass {rows[i].get("pass")} (C359 {oracle[i]["samples"]})')
    for r in red:
        print(f'   RED {r["id"]} median {r["median"]} budget {r["budget"]["op"]}{r["budget"]["value"]}')
    for i in higher:
        print(f'   HIGHER-THAN-C359 {i}: {rows[i]["median"]} vs {oracle[i]["median"]}')
