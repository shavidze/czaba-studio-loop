import json
for n in range(321,336):
    c=json.load(open(f'c-round-{n}.json'))
    print(n,c.get('taskStatus'),{k:c.get(k,'ABSENT') for k in ('gateChecksNamed','gateChecksRunOnSketch','chainHeadGateRunGreen','assertsSpecified','mutantsRecorded','mutantRedOnSketch')})
