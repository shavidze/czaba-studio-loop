# Usage: python3 -I equiv-check.py <oracle.json> <new.json> [--note-exempt ROW_ID ...]
# Exit 0 = equivalent under the round-223 EQUIV contract; 1 = a difference (printed).
import json, sys
args = sys.argv[1:]
oracle, new = json.load(open(args[0])), json.load(open(args[1]))
exempt = set(args[args.index('--note-exempt') + 1:]) if '--note-exempt' in args else set()
problems = []
for key in ('harness', 'budgetsFile', 'cpuRates', 'passesPerRate', 'viewport', 'sequence'):
    if oracle.get(key) != new.get(key):
        problems.append(f'envelope {key}: {oracle.get(key)!r} != {new.get(key)!r}')
if list(oracle.keys()) != list(new.keys()):
    problems.append(f'envelope key order: {list(oracle.keys())} != {list(new.keys())}')
if new.get('complete') is not True: problems.append('complete is not true')
if new.get('failures'): problems.append(f'failures: {new["failures"]}')
for p in new.get('passes', []):
    if p.get('abortedAt') is not None or p.get('pageErrors') or p.get('problems'):
        problems.append(f'pass {p.get("cpuRate")}x/{p.get("pass")}: {p}')
oid = [r['id'] for r in oracle['rows']]
nid = [r['id'] for r in new['rows']]
if oid != nid: problems.append('row ids/order differ')
orows = {r['id']: r for r in oracle['rows']}
for r in new['rows']:
    o = orows.get(r['id'])
    if o is None: continue
    if list(o.keys()) != list(r.keys()): problems.append(f'{r["id"]}: row key order differs')
    for f in ('scenario', 'metric', 'unit', 'kind', 'mode', 'budget', 'owner', 'note'):
        if f == 'note' and r['id'] in exempt: continue
        if o.get(f) != r.get(f): problems.append(f'{r["id"]}: {f} {o.get(f)!r} != {r.get(f)!r}')
    if r['kind'] == 'deterministic' and o.get('median') != r.get('median'):
        problems.append(f'{r["id"]}: deterministic median {o.get("median")} != {r.get("median")} (samples {o.get("samples")} vs {r.get("samples")})')
    if r['mode'] == 'assert' and o.get('pass') != r.get('pass'):
        problems.append(f'{r["id"]}: assert pass {o.get("pass")} != {r.get("pass")}')
print(f'{new.get("harness")}: rows {len(nid)}, deterministic {sum(1 for r in new["rows"] if r["kind"]=="deterministic")}, problems {len(problems)}')
for p in problems: print('  ' + p)
sys.exit(1 if problems else 0)
