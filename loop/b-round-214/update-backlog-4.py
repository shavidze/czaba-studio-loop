import json
P='backlog.json'; d=json.load(open(P))
ev={'GATE206-DOC163-STATUS':'doc 163 l.4 at eb9e76e = Completed (PERF-1a C round 206 PASS, published 60c82ed; PERF-FADER-a0 C round 208 PASS, published f535ab3)',
    'GATE208-DOC163-STATUS':'doc 163 l.4 at eb9e76e = Completed (... PERF-FADER-a0 C round 208 PASS, published f535ab3)',
    'GATE211-S6':'doc 166 l.4 at eb9e76e = Completed (PERF-FADER-b C round 211 PASS, published 28a274c)'}
for f in d['open_findings']+d['deferred_low_polish']:
    if f['id'] in ev:
        f['status']='closed (L7 bookkeeping at RETRO 215): '+ev[f['id']]+' | was: '+str(f.get('status'))
d['version']+=1
json.dump(d,open(P,'w'),indent=1,ensure_ascii=False); print('ok',d['version'])
