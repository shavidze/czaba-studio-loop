import json,statistics as st
CR=json.load(open('b-round-229/cost-rows.json'))
ph=[]
for n,b,a,c,s,g in CR:
    ph+= [('B plan',n,b or 0),('A',n,a),('C',n,c)]
print('top6 phases',sorted(ph,key=lambda t:-t[2])[:6])
for k in ('B plan','A','C'):
    v=[x[2] for x in ph if x[0]==k]; print(k,'median',st.median(v),'min',min(v),'max',max(v))
R=json.load(open('b-round-229/rounds-215-229.json'))
import collections
sev=collections.Counter()
for r in R:
    for k,v in (r.get('bugs') or {}).items(): sev[k]+=v
print('C bugs[] entries 215-229',dict(sev),'browserVerified false',[r['round'] for r in R if r.get('browser') is not True])
print('C cost STOP rounds 223:',[ (x[0],x[3]) for x in CR if x[0] in (223,)])
redo={217:'fix-up of 216 C FAIL',225:'fix-up of 224 findings',227:'gate-226 fix-up (GATE226-B1)'}
print('re-do rounds',redo,'cost',round(sum((x[1] or 0)+x[2]+x[3] for x in CR if x[0] in redo),2))
