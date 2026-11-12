"""Usage: python3 -I css-inventory.py <store-root> <out.json>
Lists every rule block of app/styles/app.css and app/styles/base/utilities.css (nested in @media/@supports/@layer too),
its class tokens, and for each class the non-CSS app source files (excluding app/**/__tests__/** and *.test.*) that name it as a whole token."""
import json, os, re, sys
root, out = sys.argv[1], sys.argv[2]
CSS = ['app/styles/app.css', 'app/styles/base/utilities.css']
def strip_comments(s):
    return re.sub(r'/\*.*?\*/', lambda m: ' ' * len(m.group(0)) if '\n' not in m.group(0) else re.sub(r'[^\n]', ' ', m.group(0)), s, flags=re.S)
def blocks(src):
    res = []; stack = []; start = 0; i = 0; depth = 0; headers = []
    hstart = 0
    while i < len(src):
        c = src[i]
        if c == '{':
            header = src[hstart:i].strip()
            headers.append((header, src.count('\n', 0, i) + 1, i))
            hstart = i + 1
        elif c == '}':
            if headers:
                header, line, open_i = headers.pop()
                body = src[open_i + 1:i]
                endline = src.count('\n', 0, i) + 1
                res.append({'header': header, 'line': line, 'end': endline, 'parents': [h[0] for h in headers], 'leaf': '{' not in body})
            hstart = i + 1
        elif c == ';' and headers is not None:
            hstart = i + 1
        i += 1
    return res
srcfiles = []
for d, _, fs in os.walk(os.path.join(root, 'app')):
    if '__tests__' in d.split(os.sep): continue
    for f in fs:
        if re.search(r'\.(tsx?|jsx?|mdx?)$', f) and '.test.' not in f:
            p = os.path.join(d, f); srcfiles.append((os.path.relpath(p, root), open(p, encoding='utf-8').read()))
cache = {}
def consumers(cls):
    if cls in cache: return cache[cls]
    pat = re.compile(r'(?<![\w-])' + re.escape(cls) + r'(?![\w-])')
    cache[cls] = sorted(p for p, s in srcfiles if pat.search(s))
    return cache[cls]
result = []
for path in CSS:
    src = strip_comments(open(os.path.join(root, path), encoding='utf-8').read())
    for b in blocks(src):
        h = b['header']
        if h.startswith('@') and not h.startswith('@keyframes'):
            continue
        if any(p.startswith('@keyframes') for p in b['parents']):
            continue
        if h.startswith('@keyframes'):
            name = h.split()[1]
            b['keyframes'] = name; b['classes'] = []; b['users'] = {name: consumers(name)}
        else:
            classes = sorted(set(re.findall(r'\.(-?[A-Za-z_][\w-]*)', re.sub(r'url\([^)]*\)|\[[^\]]*\]', '', h))))
            b['classes'] = classes
            b['users'] = {c: consumers(c) for c in classes}
        b['file'] = path
        result.append(b)
json.dump(result, open(out, 'w'), indent=1)
dead = [b for b in result if b['classes'] and all(not v for v in b['users'].values())]
part = [b for b in result if b['classes'] and any(not v for v in b['users'].values()) and not all(not v for v in b['users'].values())]
print('blocks', len(result), 'all-classes-zero-consumer', len(dead), 'mixed', len(part))
