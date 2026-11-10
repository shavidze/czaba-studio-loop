import json,sys,os,re,glob
SK={'t','waitedMs','at','ts','readyMs','durationMs','dur','ms','time','startedAt','tmp','path','date','now','elapsed'}
ID=re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
def norm(s): 
    s=ID.sub('ID',s); s=re.sub(r'blob:[^"\s]*','BLOB',s); s=re.sub(r'/home/runner[^"\s]*','PATH',s); return s
def load(p):
    try: return json.load(open(p))
    except Exception: return None
def walk(u,v,p,out):
    if isinstance(u,dict) and isinstance(v,dict):
        for k in sorted(set(u)|set(v)):
            if k in SK: continue
            walk(u.get(k),v.get(k),p+'/'+k,out)
    elif isinstance(u,list) and isinstance(v,list):
        if len(u)!=len(v): out.append((p+'[len]',len(u),len(v)))
        for i,(m,n) in enumerate(zip(u,v)): walk(m,n,p+f'[{i}]',out)
    elif u!=v:
        if isinstance(u,(int,float)) and isinstance(v,(int,float)) and abs(u-v)<=max(0.02,0.02*abs(v)): return
        if isinstance(u,str) and isinstance(v,str) and norm(u)==norm(v): return
        out.append((p,str(u)[:60],str(v)[:60]))
new,old=sys.argv[1],sys.argv[2]
res={}
for f in sorted(glob.glob(new+'/**/*.json',recursive=True)):
    rel=os.path.relpath(f,new); o=os.path.join(old,rel)
    if not os.path.exists(o): res[rel]=('NO-ORACLE',); continue
    a,b=load(f),load(o)
    if a is None or b is None: res[rel]=('UNPARSEABLE',); continue
    out=[]; walk(a,b,'',out); res[rel]=(len(out),out[:4])
json.dump(res,open(sys.argv[3],'w'),indent=1)
bad=[(k,v) for k,v in res.items() if v[0] not in (0,)]
print('files',len(res),'zero-diff',sum(1 for v in res.values() if v[0]==0),'nonzero',len(bad))
for k,v in bad: print(' ',k,v[0],(v[1][:2] if len(v)>1 else ''))
