import json,sys
def flat(o,p=''):
    if isinstance(o,dict):
        for k,v in o.items(): yield from flat(v,p+'/'+str(k))
    elif isinstance(o,list):
        for i,v in enumerate(o): yield from flat(v,p+'/'+str(i))
    else: yield p,o
a=dict(flat(json.load(open(sys.argv[1]))));b=dict(flat(json.load(open(sys.argv[2]))))
n=0
for k in sorted(set(a)|set(b)):
    if a.get(k)!=b.get(k):
        n+=1; print(k,'|',str(a.get(k))[:80],'->',str(b.get(k))[:80])
print('diffs',n,'of',len(set(a)|set(b)))
