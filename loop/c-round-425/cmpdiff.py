import json,sys,os,re
a,b=sys.argv[1:3]
def load(p):
    try: return json.load(open(p))
    except Exception as e: return None
x,y=load(a),load(b)
out=[]
def walk(u,v,p=''):
    if isinstance(u,dict) and isinstance(v,dict):
        for k in sorted(set(u)|set(v)):
            if k in('t','waitedMs','at','ts','readyMs'): continue
            walk(u.get(k),v.get(k),p+'/'+k)
    elif isinstance(u,list) and isinstance(v,list):
        if len(u)!=len(v): out.append((p+'[len]',len(u),len(v)))
        for i,(m,n) in enumerate(zip(u,v)): walk(m,n,p+f'[{i}]')
    elif u!=v:
        if isinstance(u,str) and isinstance(v,str) and re.sub(r'[0-9a-f]{8}-[0-9a-f-]{27}','ID',u)==re.sub(r'[0-9a-f]{8}-[0-9a-f-]{27}','ID',v): return
        out.append((p,str(u)[:70],str(v)[:70]))
walk(x,y)
print(os.path.basename(a),'diffs',len(out)); [print('   ',o) for o in out[:6]]
