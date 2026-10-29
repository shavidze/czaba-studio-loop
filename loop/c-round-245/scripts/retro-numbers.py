import json,statistics as st
CR=json.load(open('c-round-245/out/cost-rows.json'))
ph=[]
for n,b,a,c,s,g in CR:
    ph+= [('B plan',n,b or 0),('A',n,a),('C',n,c)]
print('top6 phases',sorted(ph,key=lambda t:-t[2])[:6])
for k in ('B plan','A','C'):
    v=[x[2] for x in ph if x[0]==k]; print(k,'median',st.median(v),'min',min(v),'max',max(v))
R=json.load(open('c-round-245/out/rounds-230-244.json'))
import collections
sev=collections.Counter()
for r in R:
    for k,v in (r.get('bugs') or {}).items(): sev[k]+=v
print('C bugs[] entries 230-244',dict(sev),'browserVerified false',[r['round'] for r in R if r.get('browser') is not True])
print('C cost of A STOP rounds 232/233/237:',[ (x[0],x[3]) for x in CR if x[0] in (232,233,237)])
redo={233:'CALM-3 follow-up (GATE232-S1 Medium, gate reviewer)',236:'11a-FIX-1 (GATE235-S1 gate, A-R235-REVIEW-M1 A reviewer)',237:'11a-FIX-2 (A-R234-REVIEW-M1 A reviewer + gate 234 S1)',238:'11a-FIX-3 fix-up of 237 C FAIL',240:'11b-FIX-1 (GATE239-S1/S2 gate)',242:'11b-FIX-2 fix-up of 241 C FAIL (C-R241-01)',243:'C-R242-01-FIX (C Medium in a PASS round)',244:'EDITOR-MENU-FOCUS-FIX (B probe, pre-existing, same focus mechanism)'}
print('re-do rounds',redo,'cost',round(sum((x[1] or 0)+x[2]+x[3] for x in CR if x[0] in redo),2))
