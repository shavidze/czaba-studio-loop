import json,sys
A=[json.loads(l) for l in open('c-round-506/after/after.jsonl')]
S=[json.loads(l) for l in open('b-round-505/probe/sketch/sketch.jsonl')]
def walk(a,b,p,diffs):
    if isinstance(a,dict) and isinstance(b,dict):
        for k in set(a)|set(b): walk(a.get(k),b.get(k),p+'.'+k,diffs)
    elif isinstance(a,list) and isinstance(b,list) and len(a)==len(b):
        for i,(x,y) in enumerate(zip(a,b)): walk(x,y,p+f'[{i}]',diffs)
    else:
        if isinstance(a,(int,float)) and isinstance(b,(int,float)) and abs(a-b)<=1: return
        if a!=b: diffs.append((p,a,b))
for a,s in zip(A,S):
    d=[];walk(a,s,'',d)
    print('W',a['W'],'diffs vs sketch',len(d))
    for x in d[:15]: print('  ',x[0],'|',str(x[1])[:70],'|',str(x[2])[:70])
    for step in ('offer','email','success'):
        r=a[step]['rest']; k=a[step].get('kbd')
        print(' ',step,r['tag'],r['type'],r['box'][2:],r['bg'],r['color'],r['font'],r['tt'],r['ls'],r['pad'],r['radius'],'shadow' ,r['shadow']!='none','hover',a[step]['hover']['bg'],'press',a[step]['press']['opacity'],a[step]['press']['transform'],'kbd',k and (k['fv'],k['os'],k['oo'],k['ow'],k['oc']),'contrast',a[step].get('restContrast'),a[step].get('hoverContrast'))
    for key in ('sending','postsTotal','emptyAlert','postsAfterEmpty','unstubbedAlert','stepAfterUnstubbed','activeAfterError','continueAfterError','activeOnEmail','activeOnSuccess','closedAfterBack','lm','escOpened','escClosed','errors'):
        print('  ',key,json.dumps(a.get(key))[:220])
