# C324: compare HEAD vs A perf rows. usage: python3 -I rowcmp.py <head.json> <a.json>
import json, sys
h = json.load(open(sys.argv[1])); a = json.load(open(sys.argv[2]))
print('HEAD failures', h.get('failures'), 'complete', h.get('complete'))
print('A    failures', a.get('failures'), 'complete', a.get('complete'))
hr = {r['id']: r for r in h['rows']}; ar = {r['id']: r for r in a['rows']}
print('rows head', len(hr), 'a', len(ar), 'only-head', sorted(set(hr) - set(ar)), 'only-a', sorted(set(ar) - set(hr)))
eq, rise, low, wall = [], [], [], []
for k in sorted(set(hr) & set(ar)):
    x, y = hr[k], ar[k]
    if x.get('kind') == 'wallclock':
        wall.append((k, x.get('median'), y.get('median'))); continue
    if x.get('median') == y.get('median') and x.get('samples') == y.get('samples'):
        eq.append(k)
    elif (y.get('median') or 0) > (x.get('median') or 0):
        rise.append((k, x.get('median'), y.get('median'), x.get('samples'), y.get('samples')))
    else:
        low.append((k, x.get('median'), y.get('median'), x.get('samples'), y.get('samples')))
print('EQUAL', len(eq)); print('RISE', len(rise))
for r in rise: print('  ', *r)
print('LOWER', len(low))
for r in low: print('  ', *r)
print('WALLCLOCK (record only)', len(wall))
for r in wall: print('  ', *r)
for k in [i for i in ar if 'select' in i]:
    print(k, 'H', hr.get(k, {}).get('samples'), hr.get(k, {}).get('details'), 'A', ar[k].get('samples'), ar[k].get('details'), 'pass', ar[k].get('pass'))
