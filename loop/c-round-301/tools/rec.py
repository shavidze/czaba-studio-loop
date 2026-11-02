import json,sys,os,datetime
# usage: rec.py <rowId> <PASS|FAIL|INCONCLUSIVE|OBS|BLOCKED|INVALID|LOOKUP|CARRIED> "<text>"
L='/home/runner/czaba-project/tmp/studio-real-loop'
J=L+'/c-round-301.json'; P=L+'/c-round-301/progress.json'; M=L+'/c-round-301.md'
row,st,txt=sys.argv[1],sys.argv[2],sys.argv[3]
d=json.load(open(J))
key={'PASS':'passed','FAIL':'failed','INCONCLUSIVE':'inconclusive','BLOCKED':'blocked','OBS':'observations','INVALID':'invalidRuns','LOOKUP':'lookups','CARRIED':'carried'}[st]
if st in('PASS','FAIL','INCONCLUSIVE'):
    for k in('passed','failed','inconclusive'):
        if row in d[k]: d[k].remove(row)
    d[key].append(row)
    d['rows'][row]={'status':st,'text':txt}
else:
    d[key].append({'id':row,'text':txt} if st!='BLOCKED' else f'{row}: {txt}')
json.dump(d,open(J,'w'),indent=1,ensure_ascii=False)
p=json.load(open(P)) if os.path.exists(P) else {'done':[]}
if st in('PASS','FAIL','INCONCLUSIVE','OBS','BLOCKED','CARRIED') and row not in p['done']: p['done'].append(row)
json.dump(p,open(P,'w'),indent=1)
with open(M,'a') as f: f.write(f"- **{row}**: {st} — {txt}\n")
print('recorded',row,st)
