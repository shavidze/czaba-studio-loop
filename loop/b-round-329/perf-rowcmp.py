# Usage: python3 -I perf-rowcmp.py <prev latest-interactions.json> <new latest-interactions.json>
# Prints EQUAL/DIFF per non-wallclock row (median compare, exact), then budget failures and the move record rows.
import json, sys
a = {r['id']: r for r in json.load(open(sys.argv[1]))['rows']}
nd = json.load(open(sys.argv[2]))
b = {r['id']: r for r in nd['rows']}
print('complete', nd.get('complete'), 'failures', nd.get('failures'), 'rows', len(b), 'prev rows', len(a))
for k in sorted(b):
    r = b[k]
    if r.get('kind') == 'wallclock':
        continue
    p = a.get(k)
    if p is None:
        print('NEW', k, r.get('median'))
        continue
    tag = 'EQUAL' if p.get('median') == r.get('median') else 'DIFF'
    print(tag, k, p.get('median'), '->', r.get('median'), r.get('samples'), 'mode', r.get('mode'))
print('asserted', sum(1 for r in b.values() if r.get('mode') == 'assert'), 'asserted-pass', sum(1 for r in b.values() if r.get('mode') == 'assert' and r.get('pass')))
