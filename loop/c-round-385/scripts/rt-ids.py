import json
b=json.load(open('backlog.json'))
bb=json.load(open('b-round-384/backlog-before-385.json'))
arc=json.load(open('archive/findings-archived.json'))
def flat(x):
    if isinstance(x,dict):
        return list(x.values()) if all(isinstance(v,dict) for v in x.values()) else [x]
    return x
arcl=flat(arc) if not isinstance(arc,list) else arc
print('archive type',type(arc).__name__,len(arcl))
A={}
for f in arcl:
    if isinstance(f,dict) and 'id' in f: A[f['id']]=f
F={f['id']:f for f in b['open_findings']+b['deferred_low_polish']}
for i in ['C-R382-01','B-R383-AUTH-ROW-BARE-URL','TL-R376-M1-HANDOFF-ARM-LIFETIME','GATE384-M1-ENSURE-DECODED-UNHANDLED-REJECTION','GATE384-L2-PREVIEW-STOP-ON-FAILED-DECODE']:
    src='current' if i in F else ('archive' if i in A else 'none')
    f=F.get(i) or A.get(i) or {}
    print(i,src,str(f.get('status'))[:70])
print('version',b['version'],'last decision',[d.get('id') for d in b['decisions_log_b']][-3:] if isinstance(b.get('decisions_log_b'),list) else type(b.get('decisions_log_b')))
ids=set()
dl=b['decisions_log_b']
allids=[d.get('id') if isinstance(d,dict) else d for d in (dl if isinstance(dl,list) else dl.values())]
for n in list(range(1285,1293)):
    k=f'D-29z{n}'; print(k, k in allids or any(str(x).startswith(k) for x in allids))
print('retro_runs',json.dumps(b['retro_runs'])[-300:])
print('next_due',b['retro_policy']['next_due'])
