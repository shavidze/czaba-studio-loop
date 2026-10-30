import json,statistics as st,collections
CR=json.load(open('c-round-275/rt/cost-rows.json'))
ph=[]
for n,b,a,c,s,g in CR:
    ph+= [('B plan',n,b or 0),('A',n,a),('C',n,c)]
print('top6 phases',sorted(ph,key=lambda t:-t[2])[:6])
for k in ('B plan','A','C'):
    v=[x[2] for x in ph if x[0]==k]; print(k,'median',st.median(v),'min',min(v),'max',max(v))
R=json.load(open('c-round-275/rt/rounds-260-274.json'))
sev=collections.Counter()
for r in R:
    for k,v in (r.get('bugs') or {}).items(): sev[k]+=v
print('C bugs[] entries 260-274',dict(sev),'browserVerified false',[r['round'] for r in R if r.get('browser') is not True])
tot=lambda L:round(sum((x[1] or 0)+x[2]+x[3] for x in CR if x[0] in L),2)
groups={'RETRO':[260],'REGRESSION':[],
 'feature stage':[262,265,269,271,272,273,274],
 'fix: pre-existing surfaced':[261,264,267,270],
 'fix: caused in window (fix-up of a C FAIL or gate fail)':[263,266,268]}
for k,v in groups.items(): print(k,v,tot(v))
fs=[262,265,269,271,272,273,274]; ff=[x for x in fs if dict((r['round'],r['c_status']) for r in R)[x]=='FAIL']
print('feature stages failing C first time',ff,len(ff),'of',len(fs))
print('fix-up cost after each FAIL',{k:tot([k]) for k in (263,266,268)})
print('A STOP rounds: see stops.txt')
