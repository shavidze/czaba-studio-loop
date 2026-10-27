import json
for n in [127,142,143,145,149,151,154,158,178,189,192,193,194,196,197,198]:
    c=json.load(open(f'c-round-{n}.json'))
    print('=== ROUND',n,c.get('taskStatus'),'| summary:',str(c.get('summary'))[:500])
    for b in c.get('bugs') or []:
        if isinstance(b,dict): print('  BUG',b.get('id'),b.get('severity'),'|',str(b.get('title') or b.get('summary') or b.get('text'))[:260])
    print('  failed:',str(c.get('failed'))[:400])
