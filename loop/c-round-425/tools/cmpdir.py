import json,sys,os,subprocess
a,b=sys.argv[1],sys.argv[2]
sys.path.insert(0,os.path.dirname(__file__))
import importlib.util
res={}
for f in sorted(os.listdir(b)):
    if not f.endswith('.json'): continue
    if not os.path.exists(os.path.join(a,f)): res[f]='NO-ORACLE'; continue
    r=subprocess.run([sys.executable,'-I','/home/runner/czaba-project/tmp/studio-real-loop/c-round-425/tools/ndiff.py',os.path.join(a,f),os.path.join(b,f),'3'],capture_output=True,text=True).stdout.strip().splitlines()
    res[f]=r
for f,r in res.items():
    if r=='NO-ORACLE': print(f,'NO-ORACLE')
    else:
        n=r[-1]
        if n!='NDIFFS 0': print(f,n,'|',' ; '.join(x[:140] for x in r[:-1]))
print('files',len(res),'equal',sum(1 for r in res.values() if r!='NO-ORACLE' and r[-1]=='NDIFFS 0'))
