# Usage: python3 -I equiv-check-r282.py <oracle.json> <new.json> [--new ROW ...] [--reclass ROW ...] [--free ROW ...] [--tol ROW=VALUE ...]
# Round-282 equivalence (PERF-2): b-round-279/scripts/equiv-check-b2.py plus
#   --new ROW      a row that must exist in <new> and not in <oracle>; it is left out of the id/order comparison
#   --reclass ROW  a row whose kind and note may change (to the round-282 text); its median is not compared
#   --free ROW     a deterministic row whose median may change (the value is printed as a "moved" line)
#   --tol ROW=V    a named median tolerance for a deterministic row
import json, sys
args = sys.argv[1:]
oracle, new = json.load(open(args[0])), json.load(open(args[1]))
opts = {'--new': set(), '--reclass': set(), '--free': set(), '--tol': {}}
mode = None
for a in args[2:]:
    if a in opts: mode = a; continue
    if mode == '--tol':
        k, v = a.split('='); opts['--tol'][k] = float(v)
    elif mode: opts[mode].add(a)
problems, notes = [], []
for key in ('harness', 'budgetsFile', 'cpuRates', 'passesPerRate', 'viewport', 'sequence'):
    if oracle.get(key) != new.get(key): problems.append(f'envelope {key}: {oracle.get(key)!r} != {new.get(key)!r}')
if list(oracle.keys()) != list(new.keys()): problems.append('envelope key order differs')
if new.get('complete') is not True: problems.append('complete is not true')
if new.get('failures'): problems.append(f'failures: {new["failures"]}')
for p in new.get('passes', []):
    if p.get('abortedAt') is not None or p.get('pageErrors') or p.get('problems'):
        problems.append(f'pass {p.get("cpuRate")}x/{p.get("pass")}: {p}')
oid = [r['id'] for r in oracle['rows']]
nid = [r['id'] for r in new['rows']]
for r in opts['--new']:
    if r in oid: problems.append(f'--new row {r} already exists in the oracle')
    if r not in nid: problems.append(f'--new row {r} is missing')
if oid != [i for i in nid if i not in opts['--new']]: problems.append('row ids/order differ (new rows excluded)')
orows = {r['id']: r for r in oracle['rows']}
for r in new['rows']:
    o = orows.get(r['id'])
    if o is None: continue
    if list(o.keys()) != list(r.keys()): problems.append(f'{r["id"]}: row key order differs')
    for f in ('scenario', 'metric', 'unit', 'kind', 'mode', 'budget', 'owner', 'note'):
        if f in ('kind', 'note') and r['id'] in opts['--reclass']: continue
        if o.get(f) != r.get(f): problems.append(f'{r["id"]}: {f} {o.get(f)!r} != {r.get(f)!r}')
    if r['id'] in opts['--reclass']:
        notes.append(f'reclass {r["id"]}: kind {o.get("kind")} -> {r.get("kind")}, samples {o.get("samples")} -> {r.get("samples")}')
        continue
    if r['kind'] == 'deterministic' and o.get('median') != r.get('median'):
        if r['id'] in opts['--free']:
            notes.append(f'moved {r["id"]}: {o.get("median")} -> {r.get("median")} (samples {r.get("samples")})')
        elif r['id'] in opts['--tol'] and abs(o['median'] - r['median']) <= opts['--tol'][r['id']] + 1e-9:
            notes.append(f'tolerated {r["id"]}: {o.get("median")} -> {r.get("median")}')
        else:
            problems.append(f'{r["id"]}: deterministic median {o.get("median")} != {r.get("median")} (samples {o.get("samples")} vs {r.get("samples")})')
    if r['mode'] == 'assert' and o.get('pass') != r.get('pass'):
        problems.append(f'{r["id"]}: assert pass {o.get("pass")} != {r.get("pass")}')
print(f'{new.get("harness")}: rows {len(nid)}, deterministic {sum(1 for r in new["rows"] if r["kind"]=="deterministic")}, problems {len(problems)}')
for n in notes: print('  ' + n)
for p in problems: print('  ' + p)
sys.exit(1 if problems else 0)
