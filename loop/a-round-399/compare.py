import json,sys
base,cur,out=sys.argv[1:4]
b=json.load(open(base)); c=json.load(open(cur))
br={r['id']:r for r in b['rows'] if r.get('kind')=='deterministic'}
cr={r['id']:r for r in c['rows']}
lines=[]; diff=0
for i,r in br.items():
    s1=r['samples']; s2=cr.get(i,{}).get('samples')
    same = s1==s2
    if not same: diff+=1
    lines.append(f"{'SAME' if same else 'DIFF'}\t{i}\t{s1}\t{s2}")
problems=[p.get('problems') for p in c.get('passes',[])]
head=f"base {base}\ncurrent {cur}\ndeterministic rows {len(br)} differing {diff}\ncomplete {c.get('complete')} failures {c.get('failures')}\npass problems {problems}\naborted {[p.get('abortedAt') for p in c.get('passes',[])]}\n"
open(out,'w').write(head+'\n'.join(lines)+'\n')
print(head)
