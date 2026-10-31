# Usage: python3 -I equiv-check-b2.py <oracle.json> <new.json> [--note-exempt ROW_ID ...] [--tol ROW_ID=VALUE ...]
# Round-280 equivalence: b-round-222/scripts/equiv-check.py plus named median tolerances (--tol) for deterministic rows.
# Exit 0 = equivalent; 1 = a difference (printed). Tolerated moves are printed as 'tolerated'.
import json, sys
args = sys.argv[1:]
oracle, new = json.load(open(args[0])), json.load(open(args[1]))
exempt, tol, mode = set(), {}, None
for a in args[2:]:
    if a in ('--note-exempt', '--tol'):
        mode = a
    elif mode == '--note-exempt':
        exempt.add(a)
    elif mode == '--tol':
        k, v = a.split('=')
        tol[k] = float(v)
problems, tolerated = [], []
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
        d = None if o.get('median') is None or r.get('median') is None else abs(o['median'] - r['median'])
        if r['id'] in tol and d is not None and d <= tol[r['id']] + 1e-9:
            tolerated.append(f'{r["id"]}: {o.get("median")} -> {r.get("median")} (named tolerance {tol[r["id"]]})')
        else:
            problems.append(f'{r["id"]}: deterministic median {o.get("median")} != {r.get("median")} (samples {o.get("samples")} vs {r.get("samples")})')
    if r['mode'] == 'assert' and o.get('pass') != r.get('pass'):
        problems.append(f'{r["id"]}: assert pass {o.get("pass")} != {r.get("pass")}')
unused = [k for k in list(exempt) + list(tol) if k not in nid]
for k in unused: problems.append(f'named exception {k} is not a row id')
print(f'{new.get("harness")}: rows {len(nid)}, deterministic {sum(1 for r in new["rows"] if r["kind"]=="deterministic")}, problems {len(problems)}, tolerated {len(tolerated)}')
for t in tolerated: print('  tolerated ' + t)
for p in problems: print('  ' + p)
sys.exit(1 if problems else 0)
