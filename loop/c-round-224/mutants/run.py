import os, shutil, subprocess, sys, re, json
S='/home/runner/czaba-project/store'
OUT=sys.argv[1]
muts = {
 'CM-1 exact uses +-max(2,10%)': ('report.ts',
   "return allEqual(values) ? null : `nondeterministic count",
   "return values.every((v) => Math.abs(v - median(values)) <= Math.max(2, Math.abs(median(values)) * 0.1)) ? null : `nondeterministic count"),
 'CM-2 ratio ignores denominators': ('report.ts',
   "if (allEqual(numerators) && allEqual(denominators)) return null;",
   "if (allEqual(numerators)) return null;"),
 'CM-3 tenths floor 2': ('report.ts', "return spread > 1", "return spread > 2"),
 'CM-4 null contract skipped': ('report.ts',
   "return `no determinism contract ${row.id}: metric ${row.metric}, unit ${row.unit}`;", "return null;"),
 'CM-5 cross uses tolerance': ('report.ts', "if (base !== other) {", "if (Math.abs(base - other) > Math.max(2, Math.abs(base) * 0.1)) {"),
 'CM-6 ratio missing detail skipped': ('report.ts',
   "return `ratio detail missing ${row.id}: needs one of ${needed.join(', ')}`;", "return needed.length < 0 ? '' : null;"),
 'CM-7 ratio uses first pair even if partial': ('report.ts',
   "if (numerators === null || denominators === null) continue;",
   "if (numerators === null || denominators === null) break;"),
 'CM-8 wallclock rows checked too': ('report.ts', "if (row.kind !== 'deterministic') return null;", "if (row.kind === 'nonexistent') return null;"),
 'CM-9 MiB treated exact': ('determinism.ts', "if (row.unit === 'MiB') return { kind: 'tenths' };", "if (row.unit === 'MiB') return { kind: 'exact' };"),
 'CM-10 unknown unit falls back to exact': ('determinism.ts', "  return null;\n}", "  return { kind: 'exact' };\n}"),
 'CM-11 rowRate always 1': ('report.ts', "export const rowRate = (id: string): number => Number(rateSuffix.exec(id)?.[0].slice(1, -1) ?? 1);", "export const rowRate = (id: string): number => (id.length > 0 ? 1 : 1);"),
 'CM-12 determinism pushed after cross (order)': None,
}
res={}
for name, m in muts.items():
    if m is None: continue
    d=f'/tmp/c224-mut/{re.sub(r"[^A-Za-z0-9]+","-",name)}'
    shutil.rmtree(d, ignore_errors=True); os.makedirs(d+'/perf')
    shutil.copytree(S+'/perf/lib', d+'/perf/lib')
    os.symlink(S+'/node_modules', d+'/node_modules')
    f, a, b = m
    p=d+'/perf/lib/'+f; t=open(p).read()
    if t.count(a)!=1: res[name]={'error':'anchor count %d'%t.count(a)}; continue
    open(p,'w').write(t.replace(a,b))
    cfg=d+'/vitest.config.mjs'
    open(cfg,'w').write("export default { root: %r, test: { include: ['perf/**/*.test.ts'], environment: 'node' } };\n"%d)
    r=subprocess.run(['npx','vitest','run','--config',cfg,'--reporter=json'],cwd=S,capture_output=True,text=True)
    try:
        j=json.loads(r.stdout[r.stdout.index('{'):])
        failed=[t['title'].split(':')[0] for tr in j['testResults'] for t in tr['assertionResults'] if t['status']!='passed']
        res[name]={'rc':r.returncode,'red':failed,'total':j['numTotalTests']}
    except Exception as e:
        res[name]={'rc':r.returncode,'parse':str(e),'tail':(r.stdout+r.stderr)[-600:]}
    print(name, res[name], flush=True)
json.dump(res, open(OUT,'w'), indent=1)
