import json,statistics as st,collections
CR=json.load(open('c-round-260/rt/cost-rows.json'))
ph=[]
for n,b,a,c,s,g in CR:
    ph+= [('B plan',n,b or 0),('A',n,a),('C',n,c)]
print('top6 phases',sorted(ph,key=lambda t:-t[2])[:6])
for k in ('B plan','A','C'):
    v=[x[2] for x in ph if x[0]==k]; print(k,'median',st.median(v),'min',min(v),'max',max(v))
R=json.load(open('c-round-260/rt/rounds-245-259.json'))
sev=collections.Counter()
for r in R:
    for k,v in (r.get('bugs') or {}).items(): sev[k]+=v
print('C bugs[] entries 245-259',dict(sev),'browserVerified false',[r['round'] for r in R if r.get('browser') is not True])
tot=lambda L:round(sum((x[1] or 0)+x[2]+x[3] for x in CR if x[0] in L),2)
groups={'RETRO':[245],'REGRESSION':[258],
 'feature stage':[248,249,250,252,254,256],
 'fix: pre-existing surfaced':[246,247],
 'fix: caused in window (fix-up of a C FAIL)':[251,253,255,257,259]}
for k,v in groups.items(): print(k,v,tot(v))
fs=[248,249,250,252,254,256]; ff=[x for x in fs if dict((r['round'],r['c_status']) for r in R)[x]=='FAIL']
print('feature stages failing C first time',ff,len(ff),'of',len(fs))
print('fix-up cost after each FAIL',{k:tot([k]) for k in (246,251,253,255,257,259)})
print('A STOP rounds: see stops.txt')
