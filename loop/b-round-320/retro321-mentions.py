import json,re
d=json.load(open('b-round-320/backlog-before-321.json'))
rx=re.compile(r'retro[ -_]?32[01]',re.I)
out=[];ids=[]
def walk(o,path):
    if isinstance(o,dict):
        s=json.dumps(o,ensure_ascii=False)
        if rx.search(s) and 'id' in o and not any(rx.search(json.dumps(v,ensure_ascii=False)) for k,v in o.items() if isinstance(v,(dict,list)) and any('id' in x for x in (v if isinstance(v,list) else [v]) if isinstance(x,dict))):
            ids.append((path,o['id'])); m=rx.search(s); out.append(f"{path} | {o['id']} | {s[max(0,m.start()-200):m.end()+120]}"); return
        for k,v in o.items(): walk(v,path+'.'+k)
    elif isinstance(o,list):
        for i,v in enumerate(o): walk(v,path)
    elif isinstance(o,str) and rx.search(o): out.append(f'{path} | (string) | '+o[:300])
walk(d,'')
open('b-round-320/retro321-mentions.txt','w').write('\n'.join(out)+'\n')
open('b-round-320/retro321-mention-ids.txt','w').write('\n'.join(f'{p} {i}' for p,i in ids)+'\n')
print(len(out))
