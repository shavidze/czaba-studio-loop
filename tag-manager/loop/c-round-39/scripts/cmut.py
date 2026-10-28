import subprocess, re, sys
DQ='tests/renderer/helpers/dom-queries.ts'
FS='src/renderer/src/stores/file-store.ts'
SE='src/renderer/src/components/schema/SchemaEditor.tsx'
muts={
 'C-1 only y rejected':(DQ,'(name.global || name.sticky)','name.sticky'),
 'C-2 lastIndex reset instead of reject':(DQ,'  if (typeof name !== "string" && (name.global || name.sticky)) {\n    throw new Error(`button ${String(name)}: g and y flags are not supported`);\n  }\n','  if (typeof name !== "string") name.lastIndex = 0;\n'),
 'C-3 RegExp tested on untrimmed text':(DQ,'text === name : name.test(text)','text === name : name.test(button.textContent ?? "")'),
 'C-4 empty-list Done natively disabled':(SE,'          aria-disabled={isApplying || fields.length === 0}\n','          aria-disabled={isApplying || fields.length === 0}\n          disabled={fields.length === 0}\n'),
 'C-5 empty-list Done marked busy':(SE,'aria-busy={isApplying}','aria-busy={isApplying || fields.length === 0}'),
 'C-6 prune reverses order':(FS,'  const selectedPaths = state.selectedPaths.filter((path) => listedPaths.has(path));','  const selectedPaths = state.selectedPaths.filter((path) => listedPaths.has(path)).reverse();'),
 'C-7 empty-list Done guard calls onClose':(SE,'if (fields.length === 0 || isApplying) return;','if (fields.length === 0) { onClose(); return; } if (isApplying) return;'),
 'C-8 uniqueness returns last instead of throw':(DQ,'  if (matches.length > 1) throw new Error(`button ${String(name)} matched ${matches.length} buttons`);\n  return matches[0];','  return matches[matches.length - 1];'),
}
for name,(f,a,b) in muts.items():
    s=open(f).read()
    assert s.count(a)==1,(name,s.count(a))
    open(f,'w').write(s.replace(a,b))
    try:
        r=subprocess.run(['npx','vitest','run','--config','vitest.config.renderer.ts'],capture_output=True,text=True)
        out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
        failed=sorted(set(re.findall(r'FAIL .*?> (\([a-z]\d+\))',out)))
        tests=[t for t in re.findall(r'Tests\s+(\d.*)',out)]
        print(f'{name} | killed by: {" ".join(failed) or "NONE (survives)"} | {tests[-1] if tests else "?"}',flush=True)
    finally:
        open(f,'w').write(s)
