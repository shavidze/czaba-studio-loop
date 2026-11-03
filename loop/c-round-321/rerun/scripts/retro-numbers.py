import json,statistics as st,collections
CR=json.load(open('c-round-321/rerun/cost-rows.json'))
ph=[]
for n,b,a,c,s,g in CR:
    ph+= [('B plan',n,b or 0),('A',n,a),('C',n,c)]
print('top6 phases',sorted(ph,key=lambda t:-t[2])[:6])
for k in ('B plan','A','C'):
    v=[x[2] for x in ph if x[0]==k]; print(k,'median',st.median(v),'min',min(v),'max',max(v))
R=json.load(open('c-round-321/rerun/rounds-305-320.json'))
sev=collections.Counter()
for r in R:
    for k,v in (r.get('bugs') or {}).items(): sev[k]+=v
print('C bugs[] entries 305-320',dict(sev),'browserVerified false',[r['round'] for r in R if r.get('browser') is not True])
tot=lambda L:round(sum((x[1] or 0)+x[2]+x[3] for x in CR if x[0] in L),2)
groups={'RETRO':[305],
 'feature stage (first round of a PERF stage)':[306,307,309,312,315,316,318],
 'close-out / hardening (planned follow-on stage)':[308,310,311],
 'fix-up after a C FAIL':[313,314,317,319,320]}
for k,v in groups.items(): print(k,v,tot(v))
fs=[306,307,309,312,315,316,318]; ff=[x for x in fs if dict((r['round'],r['c_status']) for r in R)[x]=='FAIL']
print('feature stages failing C first time',ff,len(ff),'of',len(fs))
print('fix-up cost after each FAIL',{k:tot([k]) for k in (313,314,317,319,320)})
print('A STOP rounds: see stops.txt')
