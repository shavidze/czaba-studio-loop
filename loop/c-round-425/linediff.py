import json,sys,re,os
U=re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
def norm(s): return re.sub(r'clip-[0-9a-f]{6}','clip-X',U.sub('U',s))
def walk(u,v,p,out):
    if isinstance(u,dict) and isinstance(v,dict):
        for k in sorted(set(u)|set(v)): walk(u.get(k),v.get(k),p+'/'+k,out)
    elif isinstance(u,list) and isinstance(v,list):
        if len(u)!=len(v): out.append((p+'[len]',len(u),len(v)))
        for i,(a,b) in enumerate(zip(u,v)): walk(a,b,p+f'[{i}]',out)
    elif u!=v:
        if isinstance(u,str) and isinstance(v,str) and norm(u)==norm(v): return
        out.append((p,str(u)[:70],str(v)[:70]))
f=sys.argv[1]; o=f.replace('c-round-425','c-round-390')
def js(path):
    r=[]
    for l in open(path,errors='replace'):
        l=l.strip()
        if l.startswith('{'):
            try: r.append(json.loads(l))
            except Exception: pass
    return r
a,b=js(f),js(o)
print(os.path.basename(f),'objs',len(a),len(b))
for x,y in zip(a,b):
    out=[]; walk(x,y,'',out)
    for d in out[:int(sys.argv[2]) if len(sys.argv)>2 else 8]: print('   ',d)
