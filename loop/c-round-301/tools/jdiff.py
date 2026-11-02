import json,sys,re
a=json.load(open(sys.argv[1]));b=json.load(open(sys.argv[2]))
ign=re.compile(sys.argv[3]) if len(sys.argv)>3 else None
def flat(x,p=''):
    o={}
    if isinstance(x,dict):
        for k,v in x.items(): o.update(flat(v,p+'.'+k))
    elif isinstance(x,list) and all(not isinstance(i,(dict,list)) for i in x) and len(x)<30: o[p]=x
    elif isinstance(x,list):
        for i,v in enumerate(x): o.update(flat(v,p+f'[{i}]'))
    else: o[p]=x
    return o
fa,fb=flat(a),flat(b); n=0
for k in sorted(set(fa)|set(fb)):
    if ign and ign.search(k): continue
    if fa.get(k)!=fb.get(k): n+=1; print(k,'|',str(fa.get(k))[:150],'=>',str(fb.get(k))[:150])
print('DIFFS',n)
