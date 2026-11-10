import re,sys,glob,os,difflib
R='/home/runner/czaba-project/tmp/studio-real-loop/'
def n(s):
    s=s.replace('c-round-341','c-round-425')
    s=re.sub(r'"(t|eff|afterMs|focusMs|sinceLoadMs|ms|lcp|cls|dcl|fcp|at|durMs|ts)":\s*[-0-9.e]+','"\\1":N',s)
    s=re.sub(r'\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?','DATE',s)
    s=re.sub(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}','U',s)
    s=re.sub(r'\b\d{2}:\d{2}:\d{2}\b','HMS',s)
    s=re.sub(r':5173/[^\s"]*?_[0-9a-f]{8}','X',s)
    return s
sub=sys.argv[1]
tot=0;eq=0;rows=[]
for f in sorted(glob.glob(R+'c-round-425/t258/'+sub+'/**/logs/*.log',recursive=True)+glob.glob(R+'c-round-425/t258/'+sub+'/logs/*.log')):
    o=f.replace('c-round-425','c-round-341')
    if not os.path.exists(o): rows.append((os.path.basename(f),'NO-ORACLE')); continue
    a=n(open(o,errors='replace').read()).splitlines(); b=n(open(f,errors='replace').read()).splitlines()
    d=[l for l in difflib.unified_diff(a,b,lineterm='',n=0) if l[:1] in '+-' and l[:3] not in('+++','---')]
    tot+=1
    if not d: eq+=1
    else: rows.append((f.split('t258/')[1],len(d),[x[:160] for x in d[:2]]))
for r in rows: print(r)
print('logs',tot,'equal',eq)
