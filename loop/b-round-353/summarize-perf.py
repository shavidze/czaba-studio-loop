# B round 353 -> 354: summarize sketch + M-B2prime perf runs vs C round 350. Run from the loop root: python3 -I b-round-353/summarize-perf.py
import json, pathlib, re

L = pathlib.Path('b-round-353')
ORACLE = json.load(open('c-round-350/perf-results/latest-interactions.json'))
orc = {r['id']: r for r in ORACLE['rows']}
FOCUS = re.compile(r'^interact\.(drag\.video-(trim|fade)\.|harness\.drag-video-(trim|fade)-live)')
out = []
for name in ('sketch', 'mu-b2prime', 'mu-b2'):
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
    higher = []
    for r in rows:
        o = orc.get(r['id'])
        if o and r['kind'] == 'deterministic' and r.get('median') is not None and o.get('median') is not None and r['median'] > o['median']:
            higher.append(f"{r['id']} {o['median']}->{r['median']}")
    new = [r['id'] for r in rows if r['id'] not in orc]
    out.append(f"{name}: rc {rc} complete {d['complete']} failures {len(d['failures'])} rows {len(rows)} asserted {len(asserted)} pass {len(asserted) - len(failed)} durationMs {d['durationMs']} NEW {len(new)}")
    for r in failed:
        out.append(f"  RED {r['id']} median {r['median']} max {r['max']} samples {r.get('samples')} budget {r['budget']['op']}{r['budget']['value']}")
    for r in rows:
        if FOCUS.match(r['id']):
            out.append(f"  row {r['id'].replace('interact.', '')} {r['mode']} samples {r.get('samples')} pass {r.get('pass')} c350 {orc.get(r['id'], {}).get('samples')}")
    out.append(f"  deterministic rows higher than C350: {len(higher)}" + ('' if not higher else ' | ' + '; '.join(higher[:60])))
    out.append(f"  failures field: {d['failures'][:30]}")
text = '\n'.join(out) + '\n'
(L / 'perf-summary.txt').write_text(text)
print(text)
