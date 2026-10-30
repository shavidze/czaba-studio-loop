import json,statistics as st
R={r['round']:r for r in json.load(open('c-round-260/rt/rounds-245-259.json'))}
def bcost(n):
    # planning of round n = b-round-(n-1)-result*.json
    import glob
    t=0;f=0
    for p in glob.glob(f'b-round-{n-1}-result*.json'):
        try: t+=round(json.load(open(p)).get('total_cost_usd',0),2); f+=1
        except Exception: pass
    return round(t,2) if f else None
rows=[]
for n in range(245,260):
    rows.append((n,bcost(n),R[n]['a_cost'],R[n]['c_cost'],R[n]['c_status'],R[n]['gate']))
tot=lambda i:sum(x[i] or 0 for x in rows)
print('rounds',len(rows),'B',round(tot(1),2),'A',round(tot(2),2),'C',round(tot(3),2),'all',round(tot(1)+tot(2)+tot(3),2))
fails=[x for x in rows if x[4]=='FAIL']
print('C FAIL rounds',len(fails),[x[0] for x in fails],'cost of FAIL rounds',round(sum((x[1] or 0)+x[2]+x[3] for x in fails),2))
print('C PASS',sum(1 for x in rows if x[4]=='PASS'))
per=[(x[0],round((x[1] or 0)+x[2]+x[3],2)) for x in rows]
print('median round cost',st.median(p for _,p in per))
print('top5',sorted(per,key=lambda t:-t[1])[:5])
print('gate',{s:[x[0] for x in rows if x[5]==s] for s in set(x[5] for x in rows)})
fa=[x[2] for x in fails];pa=[x[2] for x in rows if x[4]=='PASS']
print('A avg FAIL',round(sum(fa)/len(fa),2),'PASS',round(sum(pa)/len(pa),2))
bs=[x[1] for x in rows if x[1] is not None];print('B min',min(bs),'max',max(bs),'median',st.median(bs))
print('per-round',per)
print('rows',rows)
json.dump(rows,open('c-round-260/rt/cost-rows.json','w'))
