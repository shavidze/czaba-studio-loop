import json
L='/home/runner/czaba-project/tmp/studio-real-loop/'
res={}
for vp in (1280,1440):
    a=json.load(open(L+f'c-round-148/out/bbox-post-v0-{vp}.json')); b=json.load(open(L+f'c-round-150/out/bbox-post-v1b-{vp}.json'))
    res[vp]={}
    for s in ('S0','S1','S2'):
        A={e['key']:e for e in a['states'][s]['elements']}; B={e['key']:e for e in b['states'][s]['elements']}
        mx=0;over=[]
        for k in A.keys()&B.keys():
            d=max(abs(A[k][f]-B[k][f]) for f in 'xywh'); mx=max(mx,d)
            if d>1: over.append({'key':k,'px':d})
        res[vp][s]={'n148':len(A),'n150':len(B),'maxPx':mx,'over1':over,'missing':sorted(A.keys()-B.keys()),'added':sorted(B.keys()-A.keys()),'det150':b['determinism'][s]['maxPx']}
json.dump(res,open(L+'c-round-150/out/rv1-compare.json','w'),indent=1,ensure_ascii=False)
print(json.dumps(res,indent=1,ensure_ascii=False)[:3000])
