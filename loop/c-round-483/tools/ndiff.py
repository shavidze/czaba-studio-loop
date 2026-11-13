import json,re,sys
U=re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
D=re.compile(r'\d{4}-\d\d-\d\dT[\d:.]+Z')
def norm(x):
    if isinstance(x,dict): return {k:norm(v) for k,v in x.items() if k not in('tag','startedUtc','endedUtc')}
    if isinstance(x,list): return [norm(v) for v in x]
    if isinstance(x,str): return D.sub('TS',U.sub('ID',x))
    return x
def flat(x,p=''):
    if isinstance(x,dict):
        for k,v in x.items(): yield from flat(v,p+'.'+k)
    elif isinstance(x,list):
        for i,v in enumerate(x): yield from flat(v,p+f'[{i}]')
    else: yield p,x
a=dict(flat(norm(json.load(open(sys.argv[1])))));b=dict(flat(norm(json.load(open(sys.argv[2])))))
n=0
for k in sorted(set(a)|set(b)):
    if a.get(k)!=b.get(k):
        n+=1
        if n<=int(sys.argv[3] if len(sys.argv)>3 else 8): print(k,'|',str(a.get(k))[:90],'=>',str(b.get(k))[:90])
print('NDIFFS',n)
