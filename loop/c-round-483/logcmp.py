import json,sys,os,re,glob
src=open('cmp2.py').read().split("new,old=sys.argv")[0]
exec(src)
new,old=sys.argv[1],sys.argv[2]
tot=0
for f in sorted(glob.glob(new+'/*.log')):
    o=os.path.join(old,os.path.basename(f))
    if not os.path.exists(o): print('NO-ORACLE',os.path.basename(f)); continue
    def js(p):
        r=[]
        for l in open(p,errors='replace'):
            l=l.strip()
            if l.startswith('{') or l.startswith('['):
                try: r.append(json.loads(l))
                except Exception: pass
        return r
    a,b=js(f),js(o)
    out=[]
    if len(a)!=len(b): out.append(('objs',len(a),len(b)))
    for i,(x,y) in enumerate(zip(a,b)): walk(x,y,f'#{i}',out)
    tot+=len(out)
    if out: print(os.path.basename(f),len(out),[tuple(str(z)[:60] for z in t) for t in out[:2]])
print('total diffs',tot)
