import os,re,sys
root=sys.argv[1]; start=sys.argv[2:]
seen=set(); stack=[os.path.join(root,s) for s in start]
imp=re.compile(r"""(?:import|export)\s[^;]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]""",re.S)
def resolve(base,spec):
    if spec.startswith('~/'): p=os.path.join(root,'app',spec[2:])
    elif spec.startswith('.'): p=os.path.normpath(os.path.join(os.path.dirname(base),spec))
    else: return None
    p=p.split('?')[0]
    for c in [p,p+'.tsx',p+'.ts',os.path.join(p,'index.ts'),os.path.join(p,'index.tsx')]:
        if os.path.isfile(c): return c
    return None
while stack:
    f=stack.pop()
    if f in seen: continue
    seen.add(f)
    if not f.endswith(('.ts','.tsx')): continue
    src=open(f,encoding='utf-8').read()
    for m in imp.finditer(src):
        r=resolve(f,m.group(1) or m.group(2))
        if r and r not in seen: stack.append(r)
for f in sorted(seen):
    if f.endswith('.tsx'): print(os.path.relpath(f,root))
