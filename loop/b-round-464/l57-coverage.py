import json
F=['manifestPaths','missingPaths','countMismatches','claimCheckMinutes','assertsSpecified','mutantsRecorded','mutantRedOnSketch','gateChecksNamed','gateChecksRunOnSketch','chainHeadGateRunGreen','affectedChecksNamed','affectedChecksRunOnSketch']
tot={f:{'value':[],'null':[],'absent':[]} for f in F}; orig={'bugs':0,'with_origin':0,'without':[]}
for n in range(450,465):
    c=json.load(open(f'c-round-{n}.json'))
    for f in F:
        if f not in c: tot[f]['absent'].append(n)
        elif c[f] is None: tot[f]['null'].append(n)
        else: tot[f]['value'].append(n)
    for b in c.get('bugs') or []:
        if isinstance(b,dict):
            orig['bugs']+=1
            if b.get('origin'): orig['with_origin']+=1
            else: orig['without'].append((n,b.get('id'),sorted(b.keys())))
full=[n for n in range(450,465) if all(n not in tot[f]['absent'] for f in F)]
print('rounds 450-464 = 15 C JSONs')
for f in F: print(f,'value',len(tot[f]['value']),'null',len(tot[f]['null']),'absent',len(tot[f]['absent']),tot[f]['absent'])
print('rounds with all 12 fields present (value or null):',full,len(full))
print('origin per finding:',orig)
