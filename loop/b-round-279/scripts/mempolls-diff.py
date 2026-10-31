# Usage: python3 -I mempolls-diff.py <latest-resources.json>
# Prints, per res.harness.mem-polls-* row and pass, value, detail.endpointRule and the clock fields; then the run total of (value - endpointRule).
import json, sys
r = json.load(open(sys.argv[1]))
total, n = 0, 0
for row in r['rows']:
    if not row['id'].startswith('res.harness.mem-polls-'): continue
    for v, d in zip(row['samples'], row.get('details') or []):
        e = (d or {}).get('endpointRule')
        print(row['id'], 'value', v, 'endpointRule', e, 'clockOffsetMs', (d or {}).get('clockOffsetMs'), 'clockRttMs', (d or {}).get('clockRttMs'), 'expectedPolls', (d or {}).get('expectedPolls'))
        if e is not None: total += v - e; n += 1
print(f'exports {n}, sum(value - endpointRule) = {total}')
