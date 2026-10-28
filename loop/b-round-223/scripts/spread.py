import json,sys,glob,os,collections
files=sys.argv[1:]
rows=collections.defaultdict(list)  # id -> list of (file, samples, kind, metric, unit)
meta={}
for f in files:
    try: r=json.load(open(f))
    except Exception: continue
    if not isinstance(r,dict) or 'rows' not in r: continue
    if not r.get('complete'): continue
    h=r.get('harness','?')
    for row in r['rows']:
        if row.get('kind')!='deterministic': continue
        s=row.get('samples') or []
        if not s: continue
        rows[(h,row['id'])].append((f,s))
        meta[(h,row['id'])]=(row['metric'],row['unit'],row['mode'],row.get('budget'))
out=[]
for k,v in sorted(rows.items()):
    within=max(max(s)-min(s) for _,s in v)
    import statistics
    meds=[sorted(s)[len(s)//2] for _,s in v]
    cross=max(meds)-min(meds)
    allint=all(float(x).is_integer() for _,s in v for x in s)
    out.append((k[0],k[1],meta[k][0],meta[k][1],meta[k][2],len(v),within,cross,allint,meds[:8]))
for o in out:
    if o[6]!=0 or o[7]!=0 or not o[8]:
        print(o)
print('total det rows',len(out),'nonzero-spread',sum(1 for o in out if o[6] or o[7]))
