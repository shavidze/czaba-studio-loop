import json, shutil, subprocess
L='/home/runner/czaba-project/tmp/studio-real-loop'
A=f'{L}/a-round-105'; M=f'{A}/mut'; S='/home/runner/czaba-project/store'
SNAP=f'{L}/b-round-104-r105-snapshots'
R='app/lib/arrangement/status-announcement.ts'
CTX='app/contexts/ArrangementContext.tsx'
T1='app/lib/arrangement/__tests__/status-announcement.test.ts'
T2='app/lib/arrangement/__tests__/status-announcement-ui.test.tsx'
def sync():
    for f in (R,CTX,T1,T2):
        shutil.copy(f'{S}/{f}', f'{M}/{f}')
def run(files):
    r=subprocess.run(['npx','vitest','run','--reporter=json',*files],cwd=M,capture_output=True,text=True)
    return json.loads(r.stdout[r.stdout.find('{'):])
def reds(d):
    out={}
    for t in d['testResults']:
        for a in t['assertionResults']:
            if a['status']=='failed':
                out[a['title'][:60]]=(a.get('failureMessages') or [''])[0].split('\n')[0][:220]
        if not t['assertionResults'] and t.get('message'): out['FILE '+t['name'].split('/')[-1]]=t['message'][:220]
    return out
def summary(d): return {'failed':d['numFailedTests'],'passed':d['numPassedTests'],'red':reds(d)}
res={}
sync()
d=run([T1,T2]); res['unmutated-control']=summary(d); print('control',d['numFailedTests'],d['numPassedTests'],flush=True)
# fail-before: round 104 snapshots of reducer + provider, new tests
shutil.copy(f'{SNAP}/status-announcement.ts', f'{M}/{R}')
shutil.copy(f'{SNAP}/ArrangementContext.tsx', f'{M}/{CTX}')
d=run([T1,T2]); res['fail-before']=summary(d); print('fail-before',d['numFailedTests'],d['numPassedTests'],list(reds(d)),flush=True)
sync()
NEWARG="      reduceArrangementStatus(previous, next, gestureCountRef.current > 0),\n"
muts={
 'm6-provider-passes-false':(CTX,[(NEWARG,"      reduceArrangementStatus(previous, next, false),\n")]),
 'm7-reducer-ignores-gestureActive':(R,[("    if (gestureActive && next === previous.text) {\n      return previous;\n    }\n","")]),
 'm8-provider-inverts-flag':(CTX,[(NEWARG,"      reduceArrangementStatus(previous, next, gestureCountRef.current === 0),\n")]),
 'm9-gestureCountRef-not-moved':(CTX,'m9'),
}
for mid,(f,edits) in muts.items():
    src=open(f'{S}/{f}',encoding='utf-8').read()
    if edits=='m9':
        line="  const gestureCountRef = useRef(0);\n"
        assert src.count(line)==1
        src=src.replace(line,"",1)
        anchor="  const activeGestureRef = useRef<ActivePointerGesture | null>(null);\n"
        assert src.count(anchor)==1
        src=src.replace(anchor,line+anchor,1)
    else:
        for old,new in edits:
            assert src.count(old)==1,(mid,src.count(old)); src=src.replace(old,new)
    open(f'{M}/{f}','w',encoding='utf-8').write(src)
    d=run([T1,T2]); res[mid]=summary(d)
    print(mid,d['numFailedTests'],d['numPassedTests'],list(reds(d)),flush=True)
    shutil.copy(f'{S}/{f}', f'{M}/{f}')
d=run([T1,T2]); res['unmutated-control-after']=summary(d); print('control-after',d['numFailedTests'],d['numPassedTests'],flush=True)
json.dump(res,open(f'{A}/mutation-results.json','w'),ensure_ascii=False,indent=1)
