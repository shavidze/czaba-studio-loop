# Module reachability from app/root.tsx, app/entry.*.tsx and app/routes/** (non-test). Barrel-aware:
# a named import from an index.ts resolves to the barrel's re-export source of each name (export * fans out).
import re, os, sys, subprocess, json
root = sys.argv[1]
files = set(f for f in subprocess.run(['git','-C',root,'ls-files','app'],capture_output=True,text=True).stdout.split() if f.endswith(('.ts','.tsx')) and '__tests__' not in f)
def resolve(frm, spec):
    if spec.startswith('~/'): base = 'app/' + spec[2:]
    elif spec.startswith('.'): base = os.path.normpath(os.path.join(os.path.dirname(frm), spec))
    else: return None
    for c in [base, base+'.ts', base+'.tsx', base+'/index.ts', base+'/index.tsx']:
        if c in files: return c
    return None
IMP = re.compile(r'(?:import|export)\s+(type\s+)?([\s\S]*?)\s+from\s+[\'"]([^\'"]+)[\'"]|import\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)|import\s+[\'"]([^\'"]+)[\'"]')
txt = {f: open(os.path.join(root,f)).read() for f in files}
def names_of(clause):
    m = re.search(r'\{([^}]*)\}', clause or '')
    if not m: return None
    return [n.strip().split(' as ')[0].replace('type ','').strip() for n in m.group(1).split(',') if n.strip()]
def barrel_sources(barrel, name, seen=None):
    seen = seen or set()
    if barrel in seen: return set()
    seen.add(barrel); out = set()
    for m in IMP.finditer(txt[barrel]):
        if m.group(3) is None or not m.group(0).startswith('export'): continue
        tgt = resolve(barrel, m.group(3))
        if not tgt: continue
        ns = names_of(m.group(2))
        if ns is None and '*' in (m.group(2) or ''):
            if tgt.endswith(('index.ts','index.tsx')): out |= barrel_sources(tgt, name, seen)
            elif re.search(r'export\s+(?:const|function|class|type|interface|default)?\s*'+re.escape(name)+r'\b', txt[tgt]): out.add(tgt)
        elif ns and name in ns:
            out |= barrel_sources(tgt, name, seen) if tgt.endswith(('index.ts','index.tsx')) else {tgt}
    return out
reach = set(); stack = [f for f in files if f.startswith('app/routes/') or f in ('app/root.tsx','app/entry.client.tsx','app/entry.server.tsx')]
while stack:
    f = stack.pop()
    if f in reach: continue
    reach.add(f)
    for m in IMP.finditer(txt[f]):
        if m.group(1): continue
        spec = m.group(3) or m.group(4) or m.group(5)
        tgt = resolve(f, spec)
        if not tgt: continue
        if tgt.endswith(('index.ts','index.tsx')) and m.group(3):
            ns = names_of(m.group(2))
            if ns:
                for n in ns: stack += list(barrel_sources(tgt, n))
                continue
        stack.append(tgt)
json.dump(sorted(reach), open(sys.argv[2],'w'), indent=0)
print(len(files), 'files;', len(reach), 'reachable')
