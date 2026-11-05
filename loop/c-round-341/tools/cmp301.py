import json,re,sys,glob,os
U=re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
def cl(x):
    if isinstance(x,str):
        x=U.sub('U',x); x=re.sub(r'clip-[0-9a-f]{6}','clip-X',x); return x
    return x
def walk(x,y,p,o):
    if isinstance(x,dict):
        for k in sorted(set(x)|set(y or {})): walk(x.get(k),(y or {}).get(k),p+'/'+k,o)
    elif isinstance(x,list) and isinstance(y,list) and len(x)==len(y):
        for i,(u,v) in enumerate(zip(x,y)): walk(u,v,p+f'[{i}]',o)
    elif isinstance(x,(int,float)) and isinstance(y,(int,float)) and not isinstance(x,bool):
        if abs(x-y)>max(1.0,abs(x)*0.1): o.append((p,x,y))
    elif cl(x)!=cl(y): o.append((p,str(cl(x))[:90],str(cl(y))[:90]))
O='/home/runner/czaba-project/tmp/studio-real-loop/c-round-301/tools/'; N='/home/runner/czaba-project/tmp/studio-real-loop/c-round-341/t301/'
for d in sys.argv[1:]:
    for f in sorted(glob.glob(N+d+'/*.json')):
        b=os.path.basename(f); of=O+d+'/'+b
        if not os.path.exists(of): print(d,b,'no oracle name');continue
        try: a=json.load(open(of)); n=json.load(open(f))
        except Exception as e: print(d,b,'load',e);continue
        o=[];walk(a,n,'',o);print(d,b,'diffs',len(o),o[:4])
