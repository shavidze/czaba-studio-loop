import json
for n in range(245,260):
    c=json.load(open(f'c-round-{n}.json'))
    print('=== ROUND',n,c.get('taskStatus'),'bV',c.get('browserVerified'),'failed:',str(c.get('failed'))[:300])
    for b in c.get('bugs') or []:
        if isinstance(b,dict):
            t={k:v for k,v in b.items() if k in ('id','severity','title','summary','actual','observed','text','cause','rootCause')}
            print('  BUG',json.dumps(t,ensure_ascii=False)[:420])
