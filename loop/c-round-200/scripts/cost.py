import json,statistics as st
R={r['round']:r for r in json.load(open('b-round-199/rounds-123-199.json'))}
# B cost of b-round-(N-1)-result is the planning of round N
rows=[]
for n in range(123,200):
    b=R.get(n-1,{}).get('b_cost') if n-1 in R else None
    if n==123:
        try: b=round(json.load(open('b-round-122-result.json'))['total_cost_usd'],2)
        except Exception: b=None
    rows.append((n,b,R[n]['a_cost'],R[n]['c_cost'],R[n]['c_status'],R[n]['gate']))
tot=lambda i:sum(x[i] or 0 for x in rows)
print('rounds',len(rows),'B',round(tot(1),2),'A',round(tot(2),2),'C',round(tot(3),2),'all',round(tot(1)+tot(2)+tot(3),2))
fails=[x for x in rows if x[4]=='FAIL']
print('C FAIL rounds',len(fails),[x[0] for x in fails],'cost of FAIL rounds',round(sum((x[1] or 0)+x[2]+x[3] for x in fails),2))
print('C PASS',sum(1 for x in rows if x[4]=='PASS'))
per=[(x[0],round((x[1] or 0)+x[2]+x[3],2)) for x in rows]
print('median round cost',st.median(p for _,p in per))
print('top5',sorted(per,key=lambda t:-t[1])[:5])
print('A top5',sorted([(x[0],x[2]) for x in rows],key=lambda t:-t[1])[:5])
print('gate published',sum(1 for x in rows if x[5]=='published'),'skipped',sum(1 for x in rows if x[5]=='skipped'))
# blocks of rounds by span 185-199
for a,b_ in [(123,141),(142,184),(185,199)]:
    s=[x for x in rows if a<=x[0]<=b_]
    print(f'{a}-{b_}: n={len(s)} fail={sum(1 for x in s if x[4]=="FAIL")} cost={round(sum((x[1] or 0)+x[2]+x[3] for x in s),2)}')
json.dump(rows,open('b-round-199/cost-rows.json','w'))
