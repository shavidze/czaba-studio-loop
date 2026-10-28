import json
o=json.load(open('c-round-230/rt/classify-out.json'))
for p,v in o.items():
    for i,s,c in v['window_ids']:
        if s.lower().startswith(('medium','high','critical')): print(p,i,s,c)
CR=json.load(open('c-round-230/rt/cost-rows.json'))
redo={217:'fix-up of 216 C FAIL',225:'fix-up of 224 findings (C-R224-01 Medium, A-R224-REVIEW-TENTHS-NAN Medium, C-R224-02)',227:'gate-226 fix-up (GATE226-B1) + 2 copy Lows'}
print('re-do',{k:[round((x[1] or 0)+x[2]+x[3],2) for x in CR if x[0]==k][0] for k in redo}, 'sum',round(sum((x[1] or 0)+x[2]+x[3] for x in CR if x[0] in redo),2))
