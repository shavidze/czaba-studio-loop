# Usage: python3 -I commit-count-replay.py report.json [...]
# For every row whose details carry a commit count (windowCommits/commits/releaseCommits) or whose
# metric is release-commits, list per-report samples, and show whether componentsSum/movesInWindow vary.
import json,sys,collections
rows=collections.defaultdict(list)
for f in sys.argv[1:]:
    try: r=json.load(open(f))
    except Exception as e: print('skip',f,e); continue
    if not r.get('complete'): print('incomplete',f)
    for row in r.get('rows',[]):
        if not row.get('samples'): continue
        d=[x or {} for x in row.get('details',[])]
        keys=[k for k in ('windowCommits','commits','movesInWindow','moves','componentsSum') if any(k in x for x in d)]
        if row['metric'] not in ('commits-per-move','release-commits','move-components-per-move','components-per-commit','move-components-max') : continue
        vary={k:[x.get(k) for x in d] for k in keys}
        rows[(row['id'],row['kind'])].append((f,row['samples'],vary))
nvar=collections.Counter()
for (rid,kind),obs in sorted(rows.items()):
    for f,s,vary in obs:
        moved=[k for k,v in vary.items() if len(set(v))>1]
        if len(set(s))>1 or moved:
            nvar[rid]+=1
            print(kind,rid,f.replace('/home/runner/czaba-project/tmp/studio-real-loop/',''),'samples',s,{k:vary[k] for k in moved})
print('rows-with-variation',len(nvar),'of',len(rows))
