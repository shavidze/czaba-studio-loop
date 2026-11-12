import sys, re, json, os
# usage: doc-token-check.py <store_root>; rc 0 iff the normative design docs state only app.css @theme values
root = sys.argv[1]
css = open(os.path.join(root, 'app/styles/app.css'), encoding='utf-8').read()
m = re.search(r'@theme\s*\{(.*?)\n\}', css, re.S)
theme = {}
for k, v in re.findall(r'--([a-z0-9-]+)\s*:\s*([^;]+);', re.sub(r'/\*.*?\*/', '', m.group(1), flags=re.S)):
    theme.setdefault(k, v.strip())
def norm(v): return re.sub(r'\s+', ' ', re.sub(r'/\*.*?\*/', '', v)).strip().lower().replace(', ', ',').replace(' ,', ',')
def resolve(v, d=0):
    mm = re.fullmatch(r'var\(--([a-z0-9-]+)\)', v.strip())
    return resolve(theme.get(mm.group(1), v), d + 1) if mm and d < 5 else v
csslow = norm(css)
fails = []
NORM = ['docs/design/DESIGN_SYSTEM.md', 'docs/design/style-guide.md', 'docs/design/components/button.md', 'docs/design/audit-design.md']
EXAMPLE_OK = {'#000', '#000000', '#fff', '#ffffff', '#121212', '#1e1e1e', 'hsl(0, 0%, 0%, 0.95)'}  # pure black/white and 'not #121212' counter-examples; DESIGN_SYSTEM modal backdrop example (D-29z1692)
HEXRE = re.compile(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b')
NAMERE = re.compile(r'`(?:--color-)?([a-z][a-z0-9-]*)`|^\s*(?:--color-)?([a-z][a-z0-9-]*):\s')
COL = re.compile(r'#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|(?:rgba?|hsla?)\([^)]*\)')
for f in NORM:
    lines = open(os.path.join(root, f), encoding='utf-8').read().split('\n')
    for i, l in enumerate(lines, 1):
        for k, v in re.findall(r'--((?:color|shadow|gradient)-[a-z0-9-]+)\s*:\s*([^;]+);', l):
            if k not in theme: fails.append(f'{f}:{i}: --{k} not in app.css @theme')
            elif norm(v) != norm(theme[k]): fails.append(f'{f}:{i}: --{k} doc={v.strip()} app={theme[k]}')
        for a, b2 in NAMERE.findall(l):
            nm = a or b2
            if 'color-' + nm in theme and not l.lstrip().startswith('--'):
                tv = norm(resolve(theme['color-' + nm]))
                for h in HEXRE.findall(l):
                    if h.lower() in EXAMPLE_OK: continue
                    if norm(h) != tv: fails.append(f'{f}:{i}: `{nm}` states {h} but app.css --color-{nm} = {theme["color-" + nm]}')
        for c in COL.findall(l):
            if 'var(' in c: continue
            if c.lower() in EXAMPLE_OK: continue
            if norm(c) not in csslow: fails.append(f'{f}:{i}: literal {c} not in app.css')
REQ = ['brand', 'brand-hover', 'brand-foreground', 'accent', 'background', 'surface', 'elevated', 'foreground', 'muted', 'dim', 'outline', 'outline-hover', 'positive', 'destructive', 'warning', 'info', 'buy', 'buy-hover']
ds = open(os.path.join(root, NORM[0]), encoding='utf-8').read()
for k in REQ:
    if not re.search(r'--color-' + re.escape(k) + r'\s*:', ds): fails.append(f'DESIGN_SYSTEM.md: --color-{k} declaration missing')
j = json.load(open(os.path.join(root, 'docs/design/design-tokens.json'), encoding='utf-8'))
def leaves(o, p):
    if isinstance(o, dict):
        if '$value' in o: yield p, o['$value']; return
        for k, v in o.items(): yield from leaves(v, p + [k])
seen = set()
for grp, pre in (('color', 'color-'), ('shadow', 'shadow-')):
    for p, v in leaves(j.get(grp, {}), []):
        k = pre + '-'.join(p); seen.add(k)
        if k not in theme: fails.append(f'design-tokens.json: {grp}.{".".join(p)} -> --{k} not in app.css @theme'); continue
        if norm(str(v)) not in (norm(theme[k]), norm(resolve(theme[k]))): fails.append(f'design-tokens.json: {grp}.{".".join(p)} doc={v} app={theme[k]}')
for k in REQ:
    if 'color-' + k not in seen: fails.append(f'design-tokens.json: color.{k} missing')
dd = open(os.path.join(root, 'docs/technical/store-redesign/direction-decision.md'), encoding='utf-8').read()
for k in sorted(set(re.findall(r'--((?:color|shadow|gradient)-[a-z0-9-]+)', dd))):
    if k not in theme and k + '-rgb' not in theme: fails.append(f'direction-decision.md: --{k} not in app.css @theme')
print('\n'.join(fails)); print(f'FAILS {len(fails)}')
sys.exit(1 if fails else 0)
