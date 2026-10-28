import json, subprocess, sys, re, difflib
S='/home/runner/czaba-project/store'
RE=re.compile(r'interact\.drag\.(range|fade|trim|move)\.(stopped|playing)\.commits-per-move(\.6x)?')
bad=0
for f in ['perf/budgets.json','perf/budgets.resources.json']:
    old=subprocess.run(['git','-C',S,'show','HEAD:'+f],capture_output=True).stdout
    new=open(S+'/'+f,'rb').read()
    print(f,'equal HEAD' if old==new else 'DIFFERS'); bad+= old!=new
f='perf/budgets.interactions.json'
oldt=subprocess.run(['git','-C',S,'show','HEAD:'+f],capture_output=True,text=True).stdout
newt=open(S+'/'+f).read()
old=json.loads(oldt); new=json.loads(newt)
if [r['id'] for r in old]!=[r['id'] for r in new]: print('ids differ'); bad+=1
regex_rows=[r['id'] for r in old if RE.fullmatch(r['id'])]
print('regex rows in HEAD',len(regex_rows))
flips=[]
for o,n in zip(old,new):
    if list(o.keys())!=list(n.keys()): print('keys differ',o['id']); bad+=1
    for k in o:
        if o[k]!=n[k]:
            if k=='kind' and o[k]=='deterministic' and n[k]=='wallclock' and RE.fullmatch(o['id']): flips.append(o['id'])
            else: print('BAD change',o['id'],k,o[k],'->',n[k]); bad+=1
print('flips',len(flips)); bad+= len(flips)!=16 or set(flips)!=set(regex_rows)
# byte reconstruction: apply flips to HEAD and dump
for r in old:
    if r['id'] in flips: r['kind']='wallclock'
recon=json.dumps(old,indent=2,ensure_ascii=False)+'\n'
print('byte-identical to reconstruction', recon==newt); bad+= recon!=newt
d=[l for l in difflib.unified_diff(oldt.splitlines(),newt.splitlines(),lineterm='',n=0) if l[:1] in '+-' and l[:3] not in ('+++','---')]
print('changed lines',len(d), set(l[1:].strip() for l in d))
other=[r['id'] for r in json.loads(newt) if r.get('metric')=='commits-per-move' and not RE.fullmatch(r['id'])]
print('other commits-per-move rows in interactions',other)
print('BAD',bad); sys.exit(1 if bad else 0)
