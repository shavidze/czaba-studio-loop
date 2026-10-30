import json,re
d=json.load(open('b-round-259/backlog-before-260.json'))
for pool in ('open_findings','deferred_low_polish'):
    for f in d[pool]:
        t=json.dumps(f,ensure_ascii=False)
        if re.search(r'(DOC\d+-STATUS|L28|l\.4 (still|published))',t) and re.search(r'doc ?1\d\d',t,re.I):
            m=re.findall(r'doc ?(1\d\d)',t,re.I)
            print(f"{f['id']} | docs {sorted(set(m))} | {str(f.get('status'))[:70]}")
