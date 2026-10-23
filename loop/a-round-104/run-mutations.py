import json, shutil, subprocess
L='/home/runner/czaba-project/tmp/studio-real-loop'
A=f'{L}/a-round-104'; M=f'{A}/mut'; S='/home/runner/czaba-project/store'
R='app/lib/arrangement/status-announcement.ts'
CTX='app/contexts/ArrangementContext.tsx'
W='app/components/arrangement/StudioWorkspace.tsx'
T1='app/lib/arrangement/__tests__/status-announcement.test.ts'
T2='app/lib/arrangement/__tests__/status-announcement-ui.test.tsx'
for f in (R,CTX,W,T1,T2):
    shutil.copy(f'{S}/{f}', f'{M}/{f}')
muts={
 'm1-identical-string-returns-previous':(R,[("  if (typeof next === 'string') {\n    return { text: next, sequence: previous.sequence + 1 };\n","  if (typeof next === 'string') {\n    if (next === previous.text) {\n      return previous;\n    }\n    return { text: next, sequence: previous.sequence + 1 };\n")]),
 'm2-span-key-removed':(W,[("<span key={statusSequence}>{status}</span>","<span>{status}</span>")]),
 'm3-key-on-output-span-removed':(W,[('        <output\n          className="block w-full basis-full break-words text-foreground"\n','        <output\n          key={statusSequence}\n          className="block w-full basis-full break-words text-foreground"\n'),("<span key={statusSequence}>{status}</span>","{status}")]),
 'm4-function-branch-always-bumps':(R,[("  if (text === previous.text) {\n    return previous;\n  }\n","")]),
 'm5-statusSequence-missing-from-deps':(CTX,[]),
}
def run(files):
    r=subprocess.run(['npx','vitest','run','--reporter=json',*files],cwd=M,capture_output=True,text=True)
    return json.loads(r.stdout[r.stdout.find('{'):])
def reds(d):
    out={}
    for t in d['testResults']:
        for a in t['assertionResults']:
            if a['status']=='failed':
                out[a['title'][:70]]=(a.get('failureMessages') or [''])[0].split('\n')[0][:200]
        if not t['assertionResults'] and t.get('message'): out['FILE '+t['name'].split('/')[-1]]=t['message'][:200]
    return out
res={}
d=run([T1,T2]); res['unmutated-control']={'failed':d['numFailedTests'],'passed':d['numPassedTests'],'red':reds(d)}
print('unmutated',d['numFailedTests'],d['numPassedTests'],flush=True)
for mid,(f,edits) in muts.items():
    src=open(f'{S}/{f}',encoding='utf-8').read()
    if mid.startswith('m5'):
        o="      status,\n      statusSequence,\n      sourceStates,\n"
        i=src.rfind(o); assert src.count(o)==2
        src=src[:i]+"      status,\n      sourceStates,\n"+src[i+len(o):]
    for old,new in edits:
        assert src.count(old)==1,(mid,src.count(old)); src=src.replace(old,new)
    open(f'{M}/{f}','w',encoding='utf-8').write(src)
    d=run([T1,T2])
    res[mid]={'failed':d['numFailedTests'],'passed':d['numPassedTests'],'red':reds(d)}
    print(mid,d['numFailedTests'],d['numPassedTests'],list(reds(d)),flush=True)
    shutil.copy(f'{S}/{f}', f'{M}/{f}')
d=run([T1,T2]); res['unmutated-control-after']={'failed':d['numFailedTests'],'passed':d['numPassedTests'],'red':reds(d)}
print('unmutated-after',d['numFailedTests'],d['numPassedTests'],flush=True)
json.dump(res,open(f'{A}/mutation-results.json','w'),ensure_ascii=False,indent=1)
