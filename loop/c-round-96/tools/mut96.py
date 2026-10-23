# C round 96 own mutations a, b, d + control + fail-before (scratch copy only)
import json, shutil, subprocess
L='/home/runner/czaba-project/tmp/studio-real-loop'; M=f'{L}/c-round-96/mut'; S='/home/runner/czaba-project/store'
CTX='app/contexts/ArrangementContext.tsx'; NEW='app/lib/arrangement/__tests__/failed-source-refusal.test.tsx'
def run():
    r=subprocess.run(['npx','vitest','run','--reporter=json',NEW],cwd=M,capture_output=True,text=True)
    d=json.loads(r.stdout[r.stdout.find('{'):]); red=[a['title'].split(' ')[0] for t in d['testResults'] for a in t['assertionResults'] if a['status']=='failed']
    return {'failed':d['numFailedTests'],'passed':d['numPassedTests'],'red':red}
def mutate(fn):
    shutil.copy(f'{S}/{CTX}',f'{M}/{CTX}'); shutil.copy(f'{S}/{NEW}',f'{M}/{NEW}')
    s=open(f'{M}/{CTX}',encoding='utf-8').read(); o=fn(s); assert o!=s; open(f'{M}/{CTX}','w',encoding='utf-8').write(o)
def one(s,a,b): assert s.count(a)==1,(a,s.count(a)); return s.replace(a,b)
# a: add block always uses loading text
mut_a=lambda s: one(s,"state?.status === 'error'\n            ? librarySourceFailedMessage(source.title)","false\n            ? librarySourceFailedMessage(source.title)")
# b: preview block error branch removed (condition never true)
mut_b=lambda s: one(s,"} else if (latestRef.current.sourceStates[sourceId]?.status === 'error') {","} else if (false) {")
# d: remove the stopLibraryPreview() call that precedes the refusal status in the preview block
def mut_d(s):
    i=s.index("if (!source || !buffer || latestRef.current.sourceStates[sourceId]?.status !== 'ready') {")
    j=s.index("stopLibraryPreview();",i); assert j-i<200
    return s[:j]+s[j+len("stopLibraryPreview();"):]
res={}
for k,fn in (('a',mut_a),('b',mut_b),('d',mut_d)):
    mutate(fn); res[k]=run(); print(k,res[k],flush=True)
shutil.copy(f'{S}/{CTX}',f'{M}/{CTX}'); res['control']=run(); print('control',res['control'])
shutil.copy(f'{L}/b-round-95-r96-snapshots/ArrangementContext.tsx',f'{M}/{CTX}'); res['failBefore']=run(); print('failBefore',res['failBefore'])
shutil.copy(f'{S}/{CTX}',f'{M}/{CTX}')
json.dump(res,open(f'{L}/c-round-96/mutation-results.json','w'),ensure_ascii=False,indent=1)
