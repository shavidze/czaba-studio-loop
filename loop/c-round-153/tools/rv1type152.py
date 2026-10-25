import json
L='/home/runner/czaba-project/tmp/studio-real-loop/'
HINT='tid:arrangement-shortcut-hint#1'
res={'rule':'R1 as amended by D-29z117: arrangement-shortcut-hint removed from d6 PANELS; its key is dropped from the v0 baseline as the direct consequence (it is a <p>, not interactive, so d6 no longer collects it).'}
for vp in (1280,1440):
    a=json.load(open(L+f'c-round-148/out/bbox-post-v0-{vp}.json'))
    p151=json.load(open(L+f'c-round-151/out/bbox-post-v2a-{vp}.json'))
    b=json.load(open(L+f'c-round-152/out/bbox-post-v2a-{vp}.json'))
    res[vp]={}
    for s in ('S0','S1','S2'):
        A={e['key']:e for e in a['states'][s]['elements']}; B={e['key']:e for e in b['states'][s]['elements']}
        P={e['key']:e for e in p151['states'][s]['elements']}
        hintBase=A.pop(HINT,None); hint151=P.pop(HINT,None)
        movers=[]; vert=[]; panel=[]; offright=[]
        for k in sorted(A.keys()&B.keys()):
            ea,eb=A[k],B[k]
            d={f:round(eb[f]-ea[f],2) for f in 'xywh'}
            if max(abs(x) for x in d.values())<=1: continue
            row={'key':k,'kind':eb['kind'],'tag':eb['tag'],'dx':d['x'],'dy':d['y'],'dw':d['w'],'dh':d['h'],'old':[ea[f] for f in 'xywh'],'new':[eb[f] for f in 'xywh']}
            if abs(d['y'])>1 or abs(d['h'])>1: vert.append(row)
            if eb['kind']=='panel' or ea['kind']=='panel': panel.append(row)
            movers.append(row)
        for m in movers:
            if abs(m['dw'])>1: m['cause']='own width changed'
            else:
                y,h,x=m['new'][1],m['new'][3],m['old'][0]
                lead=[o for o in movers if o is not m and abs(o['dw'])>1 and not (o['new'][1]+o['new'][3]<=y or o['new'][1]>=y+h)]
                m['cause']=('follower (same row) of '+', '.join(o['key'] for o in lead[:3])) if lead else 'UNEXPLAINED'
        for k,e in B.items():
            if e['x']+e['w']>1280+0.5 and vp==1280 and not (k in A and A[k]['x']+A[k]['w']>1280+0.5): offright.append({'key':k,'right':e['x']+e['w']})
        # vs round 151 (same source tree expected => 0 px)
        d151=0; d151k=None
        for k in P.keys()&B.keys():
            dd=max(abs(P[k][f]-B[k][f]) for f in 'xywh')
            if dd>d151: d151=dd; d151k=k
        res[vp][s]={'nV0':len(A),'n152':len(B),'missing':sorted(A.keys()-B.keys()),'added':sorted(B.keys()-A.keys()),
            'hintV0':hintBase and [hintBase[f] for f in 'xywh'],'hint151':hint151 and [hint151[f] for f in 'xywh'],
            'determinism152':b['determinism'][s]['maxPx'],'detOver1':b['determinism'][s]['over1px'],
            'moversOver1px':movers,'nMovers':len(movers),'verticalOrHeight':vert,'panelMoves':panel,'newOffRight1280':offright,
            'unexplained':[m['key'] for m in movers if m['cause']=='UNEXPLAINED'],
            'maxAbsDx':max([abs(m['dx']) for m in movers],default=0),'maxAbsDw':max([abs(m['dw']) for m in movers],default=0),
            'vs151':{'maxPx':d151,'maxKey':d151k,'only151':sorted(P.keys()-B.keys()),'only152':sorted(B.keys()-P.keys())}}
json.dump(res,open(L+'c-round-152/out/rv1type-compare.json','w'),indent=1,ensure_ascii=False)
for vp in (1280,1440):
    for s,r in res[vp].items():
        print(vp,s,'n',r['nV0'],r['n152'],'miss',r['missing'],'add',r['added'],'movers',r['nMovers'],'vert',len(r['verticalOrHeight']),'panel',len(r['panelMoves']),'offR',r['newOffRight1280'],'unexpl',r['unexplained'],'det',r['determinism152'],'maxdx',r['maxAbsDx'],'maxdw',r['maxAbsDw'],'vs151',r['vs151'])
        for m in r['verticalOrHeight']+r['panelMoves']: print('   VP',m['key'],m['kind'],m['dx'],m['dy'],m['dw'],m['dh'])
