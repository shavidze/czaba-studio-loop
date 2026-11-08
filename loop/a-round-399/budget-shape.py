import json,subprocess
S='/home/runner/czaba-project/store'
for f in ['perf/budgets.interactions.json','perf/budgets.resources.json','perf/budgets.scale.json']:
    head=json.loads(subprocess.check_output(['git','-C',S,'show','HEAD:'+f]))
    cur=json.load(open(S+'/'+f))
    hr={r['id']:r for r in (head['rows'] if isinstance(head,dict) else head)}; cr={r['id']:r for r in (cur['rows'] if isinstance(cur,dict) else cur)}
    print(f,'same ids/order', list(hr)==list(cr))
    for i in hr:
        for k in sorted(set(hr[i])|set(cr[i])):
            if hr[i].get(k)!=cr[i].get(k): print('  ',i,k)
    print('  top-level', 'list' if isinstance(head,list) else [k for k in set(head)|set(cur) if k!='rows' and head.get(k)!=cur.get(k)])
