# B round 455 probe: which app script files are reachable from the Remix mount roots (root, entries, routes/**),
# following resolved imports with name-precise barrel following. Usage: python3 -I reach.py <store-root>
import os, re, sys, json, posixpath
APP = os.path.join(sys.argv[1], 'app')
files = []
for d, ds, fs in os.walk(APP):
    ds[:] = [x for x in ds if x != '__tests__']
    for f in fs:
        if re.search(r'\.(ts|tsx)$', f):
            files.append(os.path.relpath(os.path.join(d, f), APP).replace(os.sep, '/'))
fileset = set(files)
IMP = re.compile(r"\b(?:import|export)\s+(?:type\s+)?([\w$*\s{},]*?)\s*from\s*['\"]([^'\"\n]+)['\"]|\bimport\s*\(\s*['\"]([^'\"\n]+)['\"]\s*\)")
def src(p): return open(os.path.join(APP, p), encoding='utf-8').read()
def resolve(importer, spec):
    if spec.startswith('~/'): t = spec[2:]
    elif spec.startswith('.'): t = posixpath.normpath(posixpath.join(posixpath.dirname(importer), spec))
    else: return None
    t = re.sub(r'\.(ts|tsx|js|jsx)$', '', t)
    for c in (t + '.ts', t + '.tsx', t + '/index.ts', t + '/index.tsx'):
        if c in fileset: return c
    return None
def imports(p):
    out = []
    for m in IMP.finditer(src(p)):
        clause = m.group(1) or ''; spec = m.group(2) or m.group(3) or ''
        tgt = resolve(p, spec)
        if tgt is None: continue
        braced = re.search(r'\{([^}]*)\}', clause)
        names = [re.split(r'\s+as\s+', re.sub(r'^type\s+', '', x.strip()))[0].strip() for x in (braced.group(1) if braced else '').split(',')]
        names = [n for n in names if n]
        ns = m.group(3) is not None or '*' in clause or clause.strip() == ''
        out.append((tgt, names, ns, m.group(0).startswith('export')))
    return out
def is_barrel(p):
    s = re.sub(r'//.*', '', src(p)); s = re.sub(r'/\*[\s\S]*?\*/', '', s)
    stmts = [x for x in re.split(r';\s*|\n(?=export)', s) if x.strip()]
    return len(stmts) > 0 and all(re.match(r'\s*export\s', x) and ' from ' in x for x in stmts)
roots = [f for f in files if f in ('root.tsx', 'entry.client.tsx', 'entry.server.tsx') or f.startswith('routes/')]
seen = set(); want = {}  # (file, name-or-*)
stack = [(r, None) for r in roots]
while stack:
    p, names = stack.pop()
    key = (p, None if names is None else tuple(sorted(names)))
    if key in want: continue
    want[key] = 1; seen.add(p)
    barrel = is_barrel(p)
    for tgt, ns_names, ns, is_export in imports(p):
        if barrel and names is not None:
            if ns_names and not (set(ns_names) & set(names)) and not ns: continue
            stack.append((tgt, None if ns else [n for n in ns_names if n in names] or None))
        else:
            if False: pass
            else: stack.append((tgt, None))
for f in sys.argv[2:]:
    print(f, 'REACHABLE' if f in seen else 'unreachable')
print('roots', len(roots), 'reachable', len(seen), 'files', len(files))
