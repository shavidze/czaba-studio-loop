import json,statistics as st
CR=json.load(open('c-round-215/rt/cost-rows.json'))
ph=[]
for n,b,a,c,s,g in CR:
    ph+= [('B plan',n,b or 0),('A',n,a),('C',n,c)]
print('top6 phases',sorted(ph,key=lambda t:-t[2])[:6])
for k in ('B plan','A','C'):
    v=[x[2] for x in ph if x[0]==k]; print(k,'median',st.median(v),'min',min(v),'max',max(v))
R=json.load(open('c-round-215/rt/rounds-200-214.json'))
import collections
sev=collections.Counter()
for r in R:
    for k,v in (r.get('bugs') or {}).items(): sev[k]+=v
print('C bugs[] entries 200-214',dict(sev),'browserVerified false',[r['round'] for r in R if r.get('browser') is not True])
print('C cost STOP rounds 201,209:',[ (x[0],x[3]) for x in CR if x[0] in (201,209)])
redo={202:'re-dispatch of 201 (A STOP)',203:'fix-up of 202 C FAIL',210:'re-dispatch of 209 (A STOP)',213:'gate-212 test split (GATE212-B1)'}
print('re-do rounds',redo,'cost',round(sum((x[1] or 0)+x[2]+x[3] for x in CR if x[0] in redo),2))
