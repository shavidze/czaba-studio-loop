import json,sys
a=json.load(open(sys.argv[1])); b=json.load(open(sys.argv[2]))
tol=float(sys.argv[3]) if len(sys.argv)>3 else 1
bad=[]
def walk(x,y,p):
    if isinstance(x,dict) and isinstance(y,dict):
        for k in set(x)|set(y):
            if k in('errors',):continue
            walk(x.get(k),y.get(k),p+'.'+str(k))
    elif isinstance(x,list) and isinstance(y,list):
        if len(x)!=len(y): bad.append((p,'len',len(x),len(y)));return
        for i,(u,v) in enumerate(zip(x,y)): walk(u,v,p+f'[{i}]')
    elif isinstance(x,(int,float)) and isinstance(y,(int,float)) and not isinstance(x,bool):
        if abs(x-y)>tol: bad.append((p,x,y))
    elif x!=y: bad.append((p,x,y))
walk(a,b,'')
print(len(bad),'diffs')
for d in bad[:40]:print(d)
