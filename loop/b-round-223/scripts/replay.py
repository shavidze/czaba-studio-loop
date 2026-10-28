# Usage: python3 -I replay.py report.json [...]
# Lists deterministic rows whose samples are not all equal within the run (exact contract),
# and ratio rows whose detail numerator/denominator vary.
import json,sys,collections
bad=collections.defaultdict(list)
for f in sys.argv[1:]:
    r=json.load(open(f))
    for row in r['rows']:
        if row['kind']!='deterministic' or not row['samples']: continue
        s=row['samples']
        if len(set(s))>1: bad[(r['harness'],row['id'])].append((f.split('/')[-2]+'/'+f.split('/')[-1],s))
        for k in ('movesInWindow','windowCommits','componentsSum','commits','components'):
            vals=[d.get(k) for d in row['details'] if d]
            if vals and len(set(vals))>1: bad[(r['harness'],row['id']+' detail:'+k)].append((f,vals))
for k,v in sorted(bad.items()): print(k, v)
print('rows', len(bad))
