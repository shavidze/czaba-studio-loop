import json
for n in range(480,495):
    c=json.load(open(f'c-round-{n}.json'))
    print(n,c.get('taskStatus'),{k:c.get(k,'ABSENT') for k in ('gateChecksNamed','gateChecksRunOnSketch','chainHeadGateRunGreen','assertsSpecified','mutantsRecorded','mutantRedOnSketch','affectedChecksNamed','affectedChecksRunOnSketch')})
