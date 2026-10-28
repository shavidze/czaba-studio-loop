# Usage: python3 -I equiv-check-b1.py <oracle.json> <new.json>
# Round-224 (PERF-HARNESS-SHARED-LIB-b-i) contract. Exit 0 = equivalent, 1 = difference (printed).
# Same as b-round-222/scripts/equiv-check.py, except these planned changes are allowed:
#  - kind deterministic -> wallclock only for load.longtasks-over-50 and res.export.1.longtasks-over-50
#    (their medians are then not compared; their note may change);
#  - a note may differ only by removing the sentence " Not determinism-checked." (deterministic rows);
#  - the notes of the 3 zoom-live rows (GATE214-S4) and the 2 reclassified rows may change freely;
#  - details are never compared (1a commits-per-move gains {commits, moves}).
import json, sys
oracle, new = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
RECLASS = {'load.longtasks-over-50', 'res.export.1.longtasks-over-50'}
SENT = ' Not determinism-checked.'
NOTE_FREE = RECLASS | {'interact.harness.zoom-live', 'interact.harness.zoom-live.6x', 'interact.harness.zoom-30-live'}
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
compared = 0
for r in new['rows']:
    o = orows.get(r['id'])
    if o is None: continue
    if list(o.keys()) != list(r.keys()): problems.append(f'{r["id"]}: row key order differs')
    rid = r['id']
    for f in ('scenario', 'metric', 'unit', 'kind', 'mode', 'budget', 'owner', 'note'):
        ov, nv = o.get(f), r.get(f)
        if f == 'kind' and rid in RECLASS:
            if not (ov == 'deterministic' and nv == 'wallclock'): problems.append(f'{rid}: kind must become wallclock ({ov!r} -> {nv!r})')
            continue
        if f == 'note' and rid in NOTE_FREE: continue
        if f == 'note' and ov != nv and ov.replace(SENT, '') == nv and r['kind'] == 'deterministic': continue
        if ov != nv: problems.append(f'{rid}: {f} {ov!r} != {nv!r}')
    if r['kind'] == 'deterministic' and o['kind'] == 'deterministic':
        compared += 1
        if o.get('median') != r.get('median'):
            problems.append(f'{rid}: deterministic median {o.get("median")} != {r.get("median")} (samples {o.get("samples")} vs {r.get("samples")})')
    if r['mode'] == 'assert' and o.get('pass') != r.get('pass'):
        problems.append(f'{rid}: assert pass {o.get("pass")} != {r.get("pass")}')
print(f'{new.get("harness")}: rows {len(nid)}, deterministic compared {compared}, problems {len(problems)}')
for p in problems: print('  ' + p)
sys.exit(1 if problems else 0)
