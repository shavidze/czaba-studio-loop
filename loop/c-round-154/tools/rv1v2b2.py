import json
L='/home/runner/czaba-project/tmp/studio-real-loop/'
res={'rule':'RV-1-LABELS: d6 keys (interactive/panel/clip) round-153 vs c-round-153/out/bbox-post-v2b1-{vp}.json. Follower = shares the row (y overlap) with a lead whose |dw|>1 (round-152 rule).'}
for vp in (1280,1440):
    a=json.load(open(L+f'c-round-153/out/bbox-post-v2b1-{vp}.json'))
    b=json.load(open(L+f'c-round-154/out/bbox-post-v2b2-{vp}.json'))
    res[vp]={}
    for s in ('S0','S1','S2'):
        A={e['key']:e for e in a['states'][s]['elements']}; B={e['key']:e for e in b['states'][s]['elements']}
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
                y,h=m['new'][1],m['new'][3]
                lead=[o for o in movers if o is not m and abs(o['dw'])>1 and not (o['new'][1]+o['new'][3]<=y or o['new'][1]>=y+h)]
                m['cause']=('follower (same row) of '+', '.join(o['key'] for o in lead[:3])) if lead else 'NO d6 LEAD (label span is not a d6 key; check label measurement)'
        if vp==1280:
            for k,e in B.items():
                if e['x']+e['w']>1280.5 and not (k in A and A[k]['x']+A[k]['w']>1280.5): offright.append({'key':k,'right':e['x']+e['w']})
        res[vp][s]={'n153':len(A),'n154':len(B),'missing':sorted(A.keys()-B.keys()),'added':sorted(B.keys()-A.keys()),
            'determinism154':b['determinism'][s]['maxPx'],'moversOver1px':movers,'nMovers':len(movers),'verticalOrHeight':vert,'panelMoves':panel,'newOffRight1280':offright}
json.dump(res,open(L+'c-round-154/out/rv1v2b2-compare.json','w'),indent=1,ensure_ascii=False)
for vp in (1280,1440):
    for s,r in res[vp].items():
        print(vp,s,'n',r['n153'],r['n154'],'miss',r['missing'],'add',r['added'],'movers',r['nMovers'],'vert',len(r['verticalOrHeight']),'panel',len(r['panelMoves']),'offR',r['newOffRight1280'],'det',r['determinism154'])
        for m in r['moversOver1px']: print('   ',m['key'][:60],m['kind'],'dx',m['dx'],'dy',m['dy'],'dw',m['dw'],'dh',m['dh'],'|',m['cause'][:70])
