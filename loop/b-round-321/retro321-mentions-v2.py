import json,re,sys
src=sys.argv[1] if len(sys.argv)>1 else 'b-round-320/backlog-before-321.json'
odir=sys.argv[2] if len(sys.argv)>2 else 'b-round-321'
d=json.load(open(src))
rx=re.compile(r'retro[ -_]?32[01]|RETRO \(32[01]\)|round 32[01]',re.I)
def has_ids(v):
    xs=v if isinstance(v,list) else [v]
    return any(isinstance(x,dict) and 'id' in x for x in xs)
out=[];ids=[]
def walk(o,path):
    if isinstance(o,dict):
        if 'id' in o:
            own={k:v for k,v in o.items() if not (isinstance(v,(dict,list)) and has_ids(v))}
            s=json.dumps(own,ensure_ascii=False); m=rx.search(s)
            if m:
                ids.append((path,o['id'])); out.append(f"{path} | {o['id']} | {s[max(0,m.start()-200):m.end()+120]}")
        for k,v in o.items():
            if isinstance(v,(dict,list)) and (('id' not in o) or has_ids(v)): walk(v,path+'.'+k)
            elif 'id' not in o and isinstance(v,str) and rx.search(v): out.append(f'{path}.{k} | (string) | '+v[:300])
    elif isinstance(o,list):
        for v in o:
            if isinstance(v,str):
                if rx.search(v): out.append(f'{path} | (string) | '+v[:300])
            else: walk(v,path)
walk(d,'')
open(odir+'/retro321-mentions-v2.txt','w').write('\n'.join(out)+'\n')
open(odir+'/retro321-mention-ids-v2.txt','w').write('\n'.join(f'{p} {i}' for p,i in ids)+'\n')
print(len(out), len(ids))
