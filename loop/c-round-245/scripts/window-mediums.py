import json
o=json.load(open('c-round-245/out/classify-out.json'))
for p,v in o.items():
    for i,s,c in v['window_ids']:
        if s.lower().startswith(('medium','high','critical')): print(p,i,s,c)
CR=json.load(open('c-round-245/out/cost-rows.json'))
redo=[233,236,237,238,240,242,243,244]
print('re-do',{k:[round((x[1] or 0)+x[2]+x[3],2) for x in CR if x[0]==k][0] for k in redo},'sum',round(sum((x[1] or 0)+x[2]+x[3] for x in CR if x[0] in redo),2))
feat=[231,232,234,235,239,241];print('feature-stage rounds',feat,'sum',round(sum((x[1] or 0)+x[2]+x[3] for x in CR if x[0] in feat),2))
