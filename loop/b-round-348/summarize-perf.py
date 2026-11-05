# B round 348 -> 349: summarize the sketch and HEAD perf runs. Run from the loop root: python3 -I b-round-348/summarize-perf.py
import json, pathlib, re

L = pathlib.Path('b-round-348')
ORACLE = json.load(open('c-round-348/perf-store-results/latest-interactions.json'))
orc = {r['id']: r for r in ORACLE['rows']}
NEWRX = re.compile(r'^interact\.(drag\.video-(trim|fade)\.|harness\.drag-video-(trim|fade)-live$)')
out = [f"oracle C348: durationMs {ORACLE['durationMs']} rows {len(ORACLE['rows'])}"]
for name in ('sketch', 'head'):
    f = L / f'perf-{name}-results/latest-interactions.json'
    log = L / f'perf-{name}.log'
    rc = None
    if log.exists():
        m = re.findall(r'^rc (\d+)$', log.read_text(errors='replace'), re.M)
        rc = m[-1] if m else None
    if not f.exists():
        out.append(f'{name}: no result file (rc {rc})')
        continue
    d = json.load(open(f))
    rows = d['rows']
    asserted = [r for r in rows if r['mode'] == 'assert']
    failed = [r for r in asserted if r.get('pass') is False]
    higher, diff = [], 0
    for r in rows:
        o = orc.get(r['id'])
        if o and r['kind'] == 'deterministic' and r.get('median') is not None and o.get('median') is not None:
            if r['median'] != o['median']:
                diff += 1
            if r['median'] > o['median']:
                higher.append(f"{r['id']} {o['median']}->{r['median']}")
    new = [r['id'] for r in rows if r['id'] not in orc]
    unexpected_new = [i for i in new if not NEWRX.match(i)]
    out.append(f"{name}: rc {rc} complete {d['complete']} failures {len(d['failures'])} rows {len(rows)} asserted {len(asserted)} pass {len(asserted) - len(failed)} durationMs {d['durationMs']} NEW {len(new)} unexpectedNEW {len(unexpected_new)} deterministicDIFF {diff}")
    for x in d['failures']:
        out.append(f'  FAILURE {str(x)[:300]}')
    for r in failed:
        out.append(f"  RED {r['id']} median {r['median']} max {r['max']} budget {r['budget']['op']}{r['budget']['value']}")
    for r in rows:
        if NEWRX.match(r['id']) or r['id'].startswith('interact.drag.video.') or r['id'] == 'interact.harness.drag-video-live':
            out.append(f"  row {r['id'].replace('interact.', '')} {r['mode']} {r['kind']} samples {r['samples']} median {r['median']} pass {r.get('pass')}")
            if NEWRX.match(r['id']) and r['id'].endswith('per-move'):
                out.append(f"     details {json.dumps(r['details'])[:400]}")
    out.append(f"  deterministic rows higher than C348: {len(higher)}" + ('' if not higher else ' | ' + '; '.join(higher[:40])))
    for p in d.get('passes', []):
        if isinstance(p, dict):
            out.append(f"  pass {json.dumps({k: v for k, v in p.items() if k in ('cpuRate', 'pass', 'abortedAt', 'problems', 'pageErrors')})[:600]}")
text = '\n'.join(out) + '\n'
(L / 'perf-summary.txt').write_text(text)
print(text)
