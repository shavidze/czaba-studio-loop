# Usage: python3 -I equiv-check-b2.py <oracle.json> <new.json>
# Round-225 (PERF-HARNESS-SHARED-LIB-b-i fix-up, D-29z259) contract. Exit 0 = equivalent, 1 = difference.
# Oracle: c-round-224/reports/<same file>. Only planned change: kind deterministic -> wallclock for the
# 16 PERF-1b-i rows interact.drag.<range|fade|trim|move>.<stopped|playing>.commits-per-move(.6x).
# Their medians are then not compared. Every other field of every row (note included) must be identical;
# details are not compared.
import json, re, sys
oracle, new = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
RECLASS = re.compile(r'interact\.drag\.(range|fade|trim|move)\.(stopped|playing)\.commits-per-move(\.6x)?')
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
compared = reclassified = 0
for r in new['rows']:
    o = orows.get(r['id'])
    if o is None: continue
    rid = r['id']
    if list(o.keys()) != list(r.keys()): problems.append(f'{rid}: row key order differs')
    planned = bool(RECLASS.fullmatch(rid)) and new.get('harness') == 'PERF-1b-i'
    for f in ('scenario', 'metric', 'unit', 'kind', 'mode', 'budget', 'owner', 'note'):
        ov, nv = o.get(f), r.get(f)
        if f == 'kind' and planned:
            if not (ov == 'deterministic' and nv == 'wallclock'):
                problems.append(f'{rid}: kind must become wallclock ({ov!r} -> {nv!r})')
            else:
                reclassified += 1
            continue
        if ov != nv: problems.append(f'{rid}: {f} {ov!r} != {nv!r}')
    if r['kind'] == 'deterministic' and o['kind'] == 'deterministic':
        compared += 1
        if o.get('median') != r.get('median'):
            problems.append(f'{rid}: deterministic median {o.get("median")} != {r.get("median")} (samples {o.get("samples")} vs {r.get("samples")})')
    if r['mode'] == 'assert' and o.get('pass') != r.get('pass'):
        problems.append(f'{rid}: assert pass {o.get("pass")} != {r.get("pass")}')
if new.get('harness') == 'PERF-1b-i' and reclassified != 16:
    problems.append(f'reclassified rows {reclassified}, expected 16')
print(f'{new.get("harness")}: rows {len(nid)}, deterministic compared {compared}, reclassified {reclassified}, problems {len(problems)}')
for p in problems: print('  ' + p)
sys.exit(1 if problems else 0)
