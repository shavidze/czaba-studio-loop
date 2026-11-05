import json,statistics as st,collections
CR=json.load(open('c-round-353/out/cost-rows.json'))
ph=[]
for n,b,a,c,s,g in CR: ph+=[('B plan',n,b or 0),('A',n,a),('C',n,c)]
print('top6 phases',sorted(ph,key=lambda t:-t[2])[:6])
for k in ('B plan','A','C'):
    v=[x[2] for x in ph if x[0]==k]; print(k,'median',st.median(v),'min',min(v),'max',max(v))
R=json.load(open('c-round-353/out/rounds-336-352.json'))
sev=collections.Counter()
for r in R:
    for k,v in (r.get('bugs') or {}).items(): sev[k]+=v
print('C bugs[] entries 336-352',dict(sev),'browserVerified not true',[r['round'] for r in R if r.get('browser') is not True])
tot=lambda L:round(sum((x[1] or 0)+x[2]+x[3] for x in CR if x[0] in L),2)
groups={'RETRO':[336],
 'REGRESSION':[340,341,342],
 'feature stage (first round of a stage)':[337,338,339,343,344,345,346,347,348,349,350],
 'fix-up after a C FAIL':[351,352],
 'fix-up after a gate fail':[]}
for k,v in groups.items(): print(k,v,len(v),tot(v))
S=dict((r['round'],r['c_status']) for r in R)
fs=groups['feature stage (first round of a stage)']; ff=[x for x in fs if S[x]=='FAIL']
print('feature stages failing C first time',ff,len(ff),'of',len(fs))
print('chain 350-352 cost',tot([350,351,352]),'fix-up cost',{k:tot([k]) for k in (351,352)},'fix-ups total',tot([351,352]))
print('STOP rounds reaching C (a-round-N.md STOP line): 350 351; cost',{k:tot([k]) for k in (350,351)},'sum',tot([350,351]))
bs=[x[1] for x in CR if x[0]>=337]; print('B median 337-352',st.median(bs),'n',len(bs))
bs2=[x[1] for x in CR if x[0]<=337]; print('B in 336-337 (EXP window tail)',bs2)
a=[x[2] for x in CR if x[0] not in (336,340,341,342)]; print('A median on implementation rounds',st.median(a),'n',len(a))
c=[x[3] for x in CR]; print('C median 336-352',st.median(c))
allc=tot([x[0] for x in CR]); print('B share',round(sum(x[1] or 0 for x in CR)/allc*100,1),'%')
