import os, shutil, subprocess, sys, re
store='/home/runner/czaba-project/store'
here=os.path.dirname(os.path.abspath(__file__))
counts="""
function countsAgree(values: readonly number[]): boolean {
  if (values.length === 0) return true;
  const center = median(values);
  const allowed = Math.max(2, Math.abs(center) * 0.1);
  return values.every((value) => Math.abs(value - center) <= allowed);
}
"""
muts={
 'MU-1':[("return allEqual(values) ? null : `nondeterministic count","return countsAgree(values) ? null : `nondeterministic count"),("export const rateSuffix",counts+"export const rateSuffix")],
 'MU-2':[("if (allEqual(numerators) && allEqual(denominators)) return null;","if (allEqual(numerators)) return null;")],
 'MU-3':[("return spread > 1","return spread > 5")],
 'MU-4':[("return `no determinism contract ${row.id}: metric ${row.metric}, unit ${row.unit}`;","return null;")],
 'MU-5':[("if (base !== other) {","if (!countsAgree([base, other])) {"),("export const rateSuffix",counts+"export const rateSuffix")],
 'MU-6':[("const assertReported = complete || (options.assertWhenPartial && values.length > 0);","const assertReported = complete;")],
}
for name, edits in muts.items():
    d=os.path.join(here,name); lib=os.path.join(d,'perf','lib')
    shutil.rmtree(d,ignore_errors=True); os.makedirs(lib)
    for f in ['report.ts','determinism.ts','budgets.ts','stats.ts','report.test.ts']:
        shutil.copy(os.path.join(store,'perf','lib',f),lib)
    os.symlink(os.path.join(store,'node_modules'),os.path.join(d,'node_modules'))
    p=os.path.join(lib,'report.ts'); s=open(p).read()
    for a,b in edits:
        assert s.count(a)==1,(name,a); s=s.replace(a,b)
    open(p,'w').write(s)
    open(os.path.join(d,'vitest.config.ts'),'w').write("export default { root: %r, test: { include: ['perf/**/*.test.ts'], environment: 'node' } };\n" % d)
    r=subprocess.run(['npx','vitest','run','--config',os.path.join(d,'vitest.config.ts')],cwd=store,capture_output=True,text=True)
    out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
    failed=sorted(set(re.findall(r'(DC-[A-Z-]+):',' '.join(l for l in out.splitlines() if ('×' in l or 'FAIL' in l)))))
    print(name,'rc',r.returncode,'red:',failed)
    open(os.path.join(here,name+'.log'),'w').write(out)
