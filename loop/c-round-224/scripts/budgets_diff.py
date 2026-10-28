import json, subprocess, sys
S='/home/runner/czaba-project/store'
SENT=' Not determinism-checked.'
allowed={'perf/budgets.json':{'kind':{'load.longtasks-over-50'},'note':{'load.longtasks-over-50'}},
 'perf/budgets.resources.json':{'kind':{'res.export.1.longtasks-over-50'},'note':{'res.export.1.longtasks-over-50'}},
 'perf/budgets.interactions.json':{'kind':set(),'note':{'interact.harness.zoom-live','interact.harness.zoom-live.6x','interact.harness.zoom-30-live'}}}
bad=0
for f,al in allowed.items():
    oldt=subprocess.run(['git','-C',S,'show','HEAD:'+f],capture_output=True,text=True).stdout
    newt=open(S+'/'+f).read()
    old=json.loads(oldt); new=json.loads(newt)
    orows=old; nrows=new
    if [r['id'] for r in orows]!=[r['id'] for r in nrows]: print(f,'ROW IDS/ORDER DIFFER'); bad+=1
    sentdel=0; kinds=[]; notes=[]
    for o,n in zip(orows,nrows):
        if list(o.keys())!=list(n.keys()): print(f,o['id'],'KEY ORDER/SET DIFF'); bad+=1
        for k in o:
            if o[k]==n.get(k): continue
            if k=='kind':
                kinds.append((o['id'],o[k],n[k]))
                if o['id'] not in al['kind'] or n[k]!='wallclock': print('BAD kind',o['id']); bad+=1
            elif k=='note':
                if o['id'] in al['note']: notes.append((o['id'],o[k],n[k]))
                elif o[k].replace(SENT,'')==n[k] and o[k].count(SENT)==1 and o['kind']=='deterministic' and o['metric'] in ('commits-per-move','release-commits'):
                    sentdel+=1
                else: print('BAD note',o['id'],repr(o[k]),'->',repr(n[k])); bad+=1
            else: print('BAD field',o['id'],k); bad+=1
    remaining=sum(1 for r in nrows if SENT in r.get('note',''))
    # byte check: rebuild text by applying expected edits
    print(f,'rows',len(nrows),'kind changes',kinds,'sentence deletions',sentdel,'remaining sentences',remaining)
    for nid,a,b in notes: print('  note',nid,'\n    OLD:',a,'\n    NEW:',b)
    # byte-level: diff lines count vs expected
    import difflib
    d=[l for l in difflib.unified_diff(oldt.splitlines(),newt.splitlines(),lineterm='',n=0) if l[:1] in '+-' and l[:3] not in ('+++','---')]
    print('  changed lines',len(d))
print('BAD',bad); sys.exit(1 if bad else 0)
