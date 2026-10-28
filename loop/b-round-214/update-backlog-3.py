import json
P='backlog.json'; d=json.load(open(P))
for f in d['open_findings']:
    if f['id']=='GATE211-S1':
        f['status']='closed (L7 bookkeeping at RETRO 215): fixed in round 212 (storedClipGainsDb prop; C round 212 c-round-212.md l.172 "no getArrangement read" in the block leaf), published fe556fd | was: '+str(f.get('status'))
d['version']+=1
json.dump(d,open(P,'w'),indent=1,ensure_ascii=False); print('ok',d['version'])
