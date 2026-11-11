import json,sys
rows=[]
for f in sys.argv[1:]: rows+=json.load(open(f))
out=[]
for r in rows:
    k=f"{r['case'].split()[0]}{(r.get('path') or '')}@{r['W']}={'P' if r['popup'] else '-'}"
    out.append(k)
print(f"{len(out)} cells popup {sum(1 for r in rows if r['popup'])}")
