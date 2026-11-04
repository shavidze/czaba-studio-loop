# Usage: python3 -I rowcmp-1x.py <reference latest-interactions.json (3 passes)> <1-pass 1x latest-interactions.json>
# For every non-wallclock 1x row (no .6x suffix) present in both: EQUAL if the single sample equals the reference median.
import json, sys
a = {r['id']: r for r in json.load(open(sys.argv[1]))['rows']}
b = {r['id']: r for r in json.load(open(sys.argv[2]))['rows']}
eq = diff = 0
for k in sorted(b):
    r = b[k]
    if r.get('kind') == 'wallclock' or k.endswith('.6x') or k not in a or not r.get('samples'):
        continue
    if r['samples'][0] == a[k]['median']:
        eq += 1
    else:
        diff += 1
        print('DIFF', k, a[k]['median'], '->', r['samples'][0])
print('EQUAL', eq, 'DIFF', diff)
