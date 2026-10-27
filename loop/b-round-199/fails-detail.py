import json
for n in [127,142,143,145,149,151,154,158,178,189,196]:
    c=json.load(open(f'c-round-{n}.json'))
    for b in c.get('bugs') or []:
        t={k:v for k,v in b.items() if k in ('id','severity','title','summary','description','what','actual','observed','text','rootCause','cause','repro')}
        print(n, json.dumps(t,ensure_ascii=False)[:520])
