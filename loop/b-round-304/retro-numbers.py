import json,statistics as st,collections
CR=json.load(open('b-round-304/cost-rows.json'))
ph=[]
for n,b,a,c,s,g in CR:
    ph+= [('B plan',n,b or 0),('A',n,a),('C',n,c)]
print('top6 phases',sorted(ph,key=lambda t:-t[2])[:6])
for k in ('B plan','A','C'):
    v=[x[2] for x in ph if x[0]==k]; print(k,'median',st.median(v),'min',min(v),'max',max(v))
R=json.load(open('b-round-304/rounds-290-304.json'))
sev=collections.Counter()
for r in R:
    for k,v in (r.get('bugs') or {}).items(): sev[k]+=v
print('C bugs[] entries 290-304',dict(sev),'browserVerified false',[r['round'] for r in R if r.get('browser') is not True])
tot=lambda L:round(sum((x[1] or 0)+x[2]+x[3] for x in CR if x[0] in L),2)
groups={'RETRO':[290],'REGRESSION':[301],
 'feature stage':[292,296,300,302,303],
 'test-only / perf harness':[295,304],
 'fix: findings from before the window (gate-289 Mediums)':[291],
 'fix: caused in window (C FAIL / gate fail / review Medium fix-ups)':[293,294,297,298,299]}
for k,v in groups.items(): print(k,v,tot(v))
fs=[292,296,300,302,303]; ff=[x for x in fs if dict((r['round'],r['c_status']) for r in R)[x]=='FAIL']
print('feature stages failing C first time',ff,len(ff),'of',len(fs))
print('fix-up cost after each FAIL',{k:tot([k]) for k in (293,294,297,298,299)})
print('A STOP rounds: see stops.txt')
