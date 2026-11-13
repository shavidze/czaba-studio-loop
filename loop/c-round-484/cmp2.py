import json,sys,os,re,glob
SK={'startedUtc','endedUtc','t','waitedMs','at','ts','readyMs','durationMs','dur','ms','time','startedAt','tmp','path','date','now','elapsed'}
ID=re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
def norm(s):
    s=ID.sub('ID',s); s=re.sub(r'blob:[^"\s]*','BLOB',s); s=re.sub(r'/home/runner[^"\s]*','PATH',s)
    s=re.sub(r'[Ss]ource offset','clip origin',s); s=re.sub(r'Clip origin','clip origin',s); s=s.replace('From, sTo, s','FromTo').replace('From, s','From').replace('To, s','To')
    return s
def numtok(s): return re.findall(r'-?\d+(?:[.:]\d+)*',s)
def close(a,b):
    ta,tb=numtok(a),numtok(b)
    if len(ta)!=len(tb): return False
    for x,y in zip(ta,tb):
        if x==y: continue
        try:
            def f(t):
                if ':' in t:
                    a,b=t.split(':')[-2:]; return float(a)*60+float(b)
                return float(t)
            fx,fy=f(x),f(y)
        except: return False
        if abs(fx-fy)>0.15: return False
    return re.sub(r'-?\d+(?:[.:]\d+)*','#',a)==re.sub(r'-?\d+(?:[.:]\d+)*','#',b)
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
        if isinstance(u,(int,float)) and isinstance(v,(int,float)) and abs(u-v)<=max(0.15,0.02*abs(v)): return
        if isinstance(u,str) and isinstance(v,str):
            a,b=norm(u),norm(v)
            if a==b or close(a,b): return
        out.append((p,str(u)[:90],str(v)[:90]))
new,old=sys.argv[1],sys.argv[2]
res={}
for f in sorted(glob.glob(new+'/**/*.json',recursive=True)):
    rel=os.path.relpath(f,new); o=os.path.join(old,rel)
    if not os.path.exists(o): res[rel]=('NO-ORACLE',); continue
    a,b=load(f),load(o)
    if a is None or b is None: res[rel]=('UNPARSEABLE',); continue
    out=[]; walk(a,b,'',out); res[rel]=(len(out),out[:int(sys.argv[4]) if len(sys.argv)>4 else 3])
json.dump(res,open(sys.argv[3],'w'),indent=1)
bad=[(k,v) for k,v in res.items() if v[0]!=0]
print('files',len(res),'zero-diff',sum(1 for v in res.values() if v[0]==0),'nonzero',len(bad))
for k,v in bad: print(' ',k,v[0],(v[1][:3] if len(v)>1 else ''))
