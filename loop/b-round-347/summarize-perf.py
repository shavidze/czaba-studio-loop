# B round 347 -> 348: summarize sketch + mutant perf runs. Run from the loop root: python3 -I b-round-347/summarize-perf.py
import json, pathlib, re

L = pathlib.Path('b-round-347')
ORACLE = json.load(open('c-round-347/perf-results/latest-interactions.json'))
orc = {r['id']: r for r in ORACLE['rows']}
FOCUS = re.compile(r'^interact\.drag\.(trim|move|fade)\.(stopped|playing)\.(move-components-per-move|move-components-max|release-commits)$')
out = []
for name in ('sketch', 'mu-fine-clipgain', 'mu-gross-preview', 'mu-combo'):
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
        out.append(f"  RED {r['id']} median {r['median']} max {r['max']} budget {r['budget']['op']}{r['budget']['value']}")
    for r in rows:
        if FOCUS.match(r['id']):
            out.append(f"  row {r['id'].replace('interact.drag.', '')} {r['mode']} median {r['median']} max {r['max']} pass {r.get('pass')}")
    out.append(f"  deterministic rows higher than C347: {len(higher)}" + ('' if not higher else ' | ' + '; '.join(higher[:40])))
text = '\n'.join(out) + '\n'
(L / 'perf-summary.txt').write_text(text)
print(text)
