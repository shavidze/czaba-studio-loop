import json,re
d=json.load(open('b-round-259/backlog-before-260.json'))
def rnd(i):
    m=re.match(r'(?:C-R|A-R|GATE|B-R|ROOT-R|INFO-C|C-)(\d+)',i); return int(m.group(1)) if m else None
for pool in ('open_findings','deferred_low_polish'):
    print('##',pool)
    for f in d[pool]:
        r=rnd(f.get('id',''))
        if r and 245<=r<=259:
            t=f.get('title') or f.get('note') or f.get('actual') or ''
            print(f"{f['id']} | {str(f.get('severity'))[:12]} | {str(f.get('status'))[:60]} | {str(t)[:150]}")
