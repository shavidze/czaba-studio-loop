import json
b=json.load(open('../b-round-225/bbox-before.json')); a=json.load(open('bbox-after.json'))
for k in b:
    bm={r['key']:r for r in b[k]}; am={r['key']:r for r in a[k]}
    print('==',k,'before',len(bm),'after',len(am))
    for key in sorted(set(bm)-set(am)): print('  REMOVED',key)
    for key in sorted(set(am)-set(bm)): print('  NEW',key,am[key])
    for key in bm:
        if key in am:
            d={f:round(am[key][f]-bm[key][f],2) for f in 'xywh'}
            if any(abs(v)>1 for v in d.values()): print('  DELTA',key,d)
