import json,statistics as st,collections
CR=json.load(open('b-round-335/cost-rows.json'))
ph=[]
for n,b,a,c,s,g in CR: ph+=[('B plan',n,b or 0),('A',n,a),('C',n,c)]
print('top6 phases',sorted(ph,key=lambda t:-t[2])[:6])
for k in ('B plan','A','C'):
    v=[x[2] for x in ph if x[0]==k]; print(k,'median',st.median(v),'min',min(v),'max',max(v))
R=json.load(open('b-round-335/rounds-321-335.json'))
sev=collections.Counter()
for r in R:
    for k,v in (r.get('bugs') or {}).items(): sev[k]+=v
print('C bugs[] entries 321-335',dict(sev),'browserVerified not true',[r['round'] for r in R if r.get('browser') is not True])
tot=lambda L:round(sum((x[1] or 0)+x[2]+x[3] for x in CR if x[0] in L),2)
groups={'RETRO':[321],
 'feature stage (first round of a stage)':[322,325,327,329,331,332,333,334,335],
 'fix-up after a C FAIL':[323,324,328,330],
 'fix-up after a gate fail':[326]}
for k,v in groups.items(): print(k,v,tot(v))
S=dict((r['round'],r['c_status']) for r in R)
fs=groups['feature stage (first round of a stage)']; ff=[x for x in fs if S[x]=='FAIL']
print('feature stages failing C first time',ff,len(ff),'of',len(fs))
print('fix-up cost',{k:tot([k]) for k in (323,324,326,328,330)})
print('STOP rounds reaching C (a-round-N.md STOP line): 322 323 324 327; cost',{k:tot([k]) for k in (322,323,324,327)},'failed ones sum',tot([322,323,327]))
bs=[x[1] for x in CR if x[0]>=322]; print('B median 322-335',st.median(bs),'n',len(bs))
run=[];acc=[]
for x in CR:
    if x[0]<322: continue
    acc.append(x[1]); run.append((x[0],st.median(acc)))
print('B running median from 322',run)
a1=[x[2] for x in CR if x[0]<=328];a2=[x[2] for x in CR if x[0]>=329]
c1=[x[3] for x in CR if x[0]<=331];c2=[x[3] for x in CR if x[0]>=332]
print('A median 321-328',st.median(a1),'329-335',st.median(a2),'| C median 321-331',st.median(c1),'332-335',st.median(c2))
