import json
L='/home/runner/czaba-project/tmp/studio-real-loop/'
res={}
for vp in (1280,1440):
    a=json.load(open(L+f'c-round-148/out/bbox-post-v0-{vp}.json'))
    v1=json.load(open(L+f'c-round-150/out/bbox-post-v1b-{vp}.json'))
    b=json.load(open(L+f'c-round-152/out/bbox-post-v2a-{vp}.json'))
    res[vp]={}
    for s in ('S0','S1','S2'):
        A={e['key']:e for e in a['states'][s]['elements']}; B={e['key']:e for e in b['states'][s]['elements']}
        V={e['key']:e for e in v1['states'][s]['elements']}
        movers=[]; vert=[]; panel=[]; offright=[]
        for k in sorted(A.keys()&B.keys()):
            ea,eb=A[k],B[k]
            d={f:eb[f]-ea[f] for f in 'xywh'}
            if max(abs(x) for x in d.values())<=1: continue
            row={'key':k,'kind':eb['kind'],'tag':eb['tag'],'dx':d['x'],'dy':d['y'],'dw':d['w'],'dh':d['h'],'old':[ea[f] for f in 'xywh'],'new':[eb[f] for f in 'xywh']}
            if abs(d['y'])>1 or abs(d['h'])>1: vert.append(row)
            if eb['kind']=='panel': panel.append(row)
            movers.append(row)
        # cause: own width change or follower in same row (an element to the left in same row with dw!=0)
        for m in movers:
            if abs(m['dw'])>1: m['cause']='own width changed'
            else:
                y,h,x=m['new'][1],m['new'][3],m['old'][0]
                lead=[o for o in movers if o is not m and abs(o['dw'])>1 and o['old'][0]<x and not (o['new'][1]+o['new'][3]<=y or o['new'][1]>=y+h)]
                m['cause']='follower of '+', '.join(o['key'] for o in lead[:3]) if lead else 'UNEXPLAINED'
        for k,e in B.items():
            if vp==1280 and e['x']+e['w']>1280+0.5 and not (k in A and A[k]['x']+A[k]['w']>1280+0.5): offright.append({'key':k,'right':e['x']+e['w']})
        det=b['determinism'][s]['maxPx']
        res[vp][s]={'n148':len(A),'n151':len(B),'missing':sorted(A.keys()-B.keys()),'added':sorted(B.keys()-A.keys()),'v1bEqualsV0':all(V.get(k) and all(abs(V[k][f]-A[k][f])<=1 for f in 'xywh') for k in A),
                    'determinism151':det,'moversOver1px':movers,'nMovers':len(movers),'verticalOrHeight':vert,'panelMoves':panel,'newOffRight1280':offright,
                    'unexplained':[m['key'] for m in movers if m['cause']=='UNEXPLAINED'],'maxAbsDx':max([abs(m['dx']) for m in movers],default=0),'maxAbsDw':max([abs(m['dw']) for m in movers],default=0)}
json.dump(res,open(L+'c-round-152/out/rv1type-compare.json','w'),indent=1,ensure_ascii=False)
for vp in res:
    for s,r in res[vp].items():
        print(vp,s,'n',r['n148'],r['n151'],'miss',r['missing'],'add',r['added'],'movers',r['nMovers'],'vert',len(r['verticalOrHeight']),'panel',len(r['panelMoves']),'offR',r['newOffRight1280'],'unexpl',r['unexplained'],'det',r['determinism151'],'maxdx',r['maxAbsDx'],'maxdw',r['maxAbsDw'],'v1b=v0',r['v1bEqualsV0'])
        for m in r['verticalOrHeight']+r['panelMoves']: print('   VP',m['key'],m['kind'],m['dx'],m['dy'],m['dw'],m['dh'])
