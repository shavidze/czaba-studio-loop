import os, shutil, subprocess, sys, re, json
S='/home/runner/czaba-project/store'
OUT=sys.argv[1]
G="if (!values.every((value) => Number.isFinite(value))) {"
muts = {
 'BASE (no mutation)': ('report.ts', "", ""),
 'CM-1 exact uses tolerance': ('report.ts',"return allEqual(values) ? null : `nondeterministic count","return values.every((v) => Math.abs(v - median(values)) <= Math.max(2, Math.abs(median(values)) * 0.1)) ? null : `nondeterministic count"),
 'CM-2 ratio ignores denominators': ('report.ts',"if (allEqual(numerators) && allEqual(denominators)) return null;","if (allEqual(numerators)) return null;"),
 'CM-3 tenths floor 2': ('report.ts', "return spread > 1", "return spread > 2"),
 'CM-3b tenths floor 0': ('report.ts', "return spread > 1", "return spread > 0"),
 'CM-8 wallclock rows checked too': ('report.ts', "if (row.kind !== 'deterministic') return null;", "if (row.kind === 'nonexistent') return null;"),
 'G-1 guard removed': ('report.ts', G, "if (values.length < 0) {"),
 'G-2 guard checks only values[0]': ('report.ts', G, "if (!Number.isFinite(values[0])) {"),
 'G-3 guard checks NaN only': ('report.ts', G, "if (values.some((value) => Number.isNaN(value))) {"),
 'G-4 guard checks last only': ('report.ts', G, "if (!Number.isFinite(values[values.length - 1])) {"),
 'G-5 guard text changed': ('report.ts', "] (non-finite sample)`", "] (non-finite)`"),
 'G-6 guard returns null (fail open)': ('report.ts', "return `nondeterministic MiB ${row.id}: [${values.join(', ')}] (non-finite sample)`;", "return null;"),
 'K-1 drag fade.playing back to deterministic': ('budgets.interactions.json', 'interact.drag.fade.playing.commits-per-move', None),
 'K-1b drag move.stopped.6x back to deterministic': ('budgets.interactions.json', 'interact.drag.move.stopped.commits-per-move.6x', None),
 'K-2 fader row to wallclock': ('budgets.json', None, None),
 'K-3 (informative) unrelated interactions deterministic row to wallclock': ('budgets.interactions.json', 'OTHER', None),
}
res={}
for name, (f, a, b) in muts.items():
    d=f'/tmp/c225-mut/{re.sub(r"[^A-Za-z0-9]+","-",name)}'
    shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    shutil.copytree(S+'/perf', d+'/perf', ignore=shutil.ignore_patterns('test-results','node_modules'))
    os.symlink(S+'/node_modules', d+'/node_modules')
    if f.endswith('.ts') and a:
        p=d+'/perf/lib/'+f; t=open(p).read()
        if t.count(a)!=1: res[name]={'error':'anchor count %d'%t.count(a)}; print(name,res[name]); continue
        open(p,'w').write(t.replace(a,b))
    elif f.endswith('.json'):
        p=d+'/perf/'+f; rows=json.load(open(p)); hit=None
        for r in rows:
            if f=='budgets.json' and r['metric']=='commits-per-move' and hit is None: r['kind']='wallclock'; hit=r['id']
            elif a=='OTHER' and r['kind']=='deterministic' and 'commits-per-move' not in r['id'] and hit is None: r['kind']='wallclock'; hit=r['id']
            elif r['id']==a: r['kind']='deterministic'; hit=r['id']
        if hit is None: res[name]={'error':'no row'}; continue
        open(p,'w').write(json.dumps(rows,indent=2,ensure_ascii=False)+'\n'); name_hit=hit
    cfg=d+'/vitest.config.mjs'
    open(cfg,'w').write("export default { root: %r, test: { include: ['perf/**/*.test.ts'], environment: 'node' } };\n"%d)
    r=subprocess.run(['npx','vitest','run','--config',cfg,'--reporter=json'],cwd=S,capture_output=True,text=True)
    try:
        j=json.loads(r.stdout[r.stdout.index('{'):])
        failed=[t['title'].split(':')[0] for tr in j['testResults'] for t in tr['assertionResults'] if t['status']!='passed']
        res[name]={'rc':r.returncode,'red':failed,'total':j['numTotalTests'],'verdict':'killed' if failed else 'survived'}
        if f.endswith('.json'): res[name]['row']=name_hit
    except Exception as e:
        res[name]={'rc':r.returncode,'parse':str(e),'tail':(r.stdout+r.stderr)[-600:]}
    print(name, res[name], flush=True)
json.dump(res, open(OUT,'w'), indent=1)
