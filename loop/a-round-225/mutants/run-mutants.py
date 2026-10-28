import os, shutil, subprocess, re, json
store='/home/runner/czaba-project/store'
here=os.path.dirname(os.path.abspath(__file__))
guard="""      if (!values.every((value) => Number.isFinite(value))) {
        return `nondeterministic MiB ${row.id}: [${values.join(', ')}] (non-finite sample)`;
      }
"""
def flip(path, rid, kind):
    rows=json.load(open(path,encoding='utf8')); n=0
    for r in rows:
        if r['id']==rid: r['kind']=kind; n+=1
    assert n==1,(path,rid)
    open(path,'w',encoding='utf8').write(json.dumps(rows,indent=2,ensure_ascii=False)+'\n')
def fader_row():
    rows=json.load(open(os.path.join(store,'perf','budgets.json')))
    return [r['id'] for r in rows if r['metric']=='commits-per-move'][0]
muts={
 'MU-7':('report.ts',[(guard,'')],None),
 'MU-8':('report.ts',[('return spread > 1','return spread > 2')],None),
 'MU-9':(None,[],('budgets.interactions.json','interact.drag.fade.playing.commits-per-move','deterministic')),
 'MU-10':(None,[],('budgets.json',fader_row(),'wallclock')),
}
for name,(src,edits,bud) in muts.items():
    d=os.path.join(here,name); perf=os.path.join(d,'perf')
    shutil.rmtree(d,ignore_errors=True)
    shutil.copytree(os.path.join(store,'perf'),perf)
    os.symlink(os.path.join(store,'node_modules'),os.path.join(d,'node_modules'))
    if src:
        p=os.path.join(perf,'lib',src); s=open(p).read()
        for a,b in edits:
            assert s.count(a)==1,(name,a); s=s.replace(a,b)
        open(p,'w').write(s)
    if bud:
        flip(os.path.join(perf,bud[0]),bud[1],bud[2])
    open(os.path.join(d,'vitest.config.ts'),'w').write("export default { root: %r, test: { include: ['perf/**/*.test.ts'], environment: 'node' } };\n" % d)
    r=subprocess.run(['npx','vitest','run','--config',os.path.join(d,'vitest.config.ts')],cwd=store,capture_output=True,text=True)
    out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
    failed=sorted(set(re.findall(r'(DC-[A-Z-]+):',' '.join(l for l in out.splitlines() if ('×' in l or 'FAIL' in l)))))
    print(name,'rc',r.returncode,'red:',failed, 'detail:', bud or edits and 'src')
    open(os.path.join(here,name+'.log'),'w').write(out)
