import json,sys
f=sys.argv[1]; pat=sys.argv[2] if len(sys.argv)>2 else 'PERF-3c'
d=json.load(open(f))
print('complete',d.get('complete'),'failures',d.get('failures'),'durationMs',d.get('durationMs'))
for r in d['rows']:
    if pat in r['id'] or r.get('owner')==pat:
        print(r['id'],r['samples'],'median',r['median'],'pass',r['pass'], json.dumps(r['details'])[:300] if r['details'] and any(r['details']) else '')
