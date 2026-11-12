"""Usage: python3 -I css-prune.py <store-root> <report.txt>
Rewrites app/styles/app.css and app/styles/base/utilities.css in place under <store-root>:
removes every rule block that css-inventory.py (v2) marks dead: no top-level selector branch whose required classes
are all rendered by non-test app source or set at runtime by Lenis, drops @media/@supports wrappers left empty, then removes
@keyframes whose name no remaining CSS file and no app source names, and the comment lines that directly
introduce a removed block. Writes the removed headers with HEAD line numbers to <report.txt>."""
import os, re, sys, json, subprocess
root, report = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
inv = os.path.join('/tmp', 'b463-inv.json')
subprocess.run([sys.executable, '-I', os.path.join(here, 'css-inventory.py'), root, inv], check=True, stdout=subprocess.DEVNULL)
inventory = json.load(open(inv))
srcfiles = []
for d, _, fs in os.walk(os.path.join(root, 'app')):
    if '__tests__' in d.split(os.sep): continue
    for f in fs:
        if re.search(r'\.(tsx?|jsx?|mdx?)$', f) and '.test.' not in f:
            srcfiles.append(open(os.path.join(d, f), encoding='utf-8').read())
def ranges(src):
    """(header,start,end) for every block incl. nested; start = index of header start, end = index after '}'"""
    out = []; stack = []; hstart = 0; i = 0; in_c = False
    while i < len(src):
        if src.startswith('/*', i):
            j = src.index('*/', i) + 2
            if not stack or True: pass
            i = j; hstart = j if src[hstart:i].strip().startswith('/*') or not src[hstart:i].strip() else hstart; continue
        c = src[i]
        if c == '{': stack.append((src[hstart:i], hstart, i)); hstart = i + 1
        elif c == '}':
            h, s, o = stack.pop(); out.append([h.strip(), s, i + 1, len(stack)]); hstart = i + 1
        elif c == ';': hstart = i + 1
        i += 1
    return out
removed = []
for path in ['app/styles/app.css', 'app/styles/base/utilities.css']:
    full = os.path.join(root, path); src = open(full, encoding='utf-8').read()
    dead_lines = {b['line'] for b in inventory if b['file'] == path and b.get('dead') and b['leaf']}
    spans = []
    for h, s, e, depth in ranges(src):
        hdr = re.sub(r'/\*.*?\*/', '', h, flags=re.S).strip()
        line = src.count('\n', 0, s + (len(src[s:e]) - len(src[s:e].lstrip()))) + 1
        # header line = line of '{' per inventory
        brace = src.index('{', s)
        bline = src.count('\n', 0, brace) + 1
        if bline in dead_lines and hdr and not hdr.startswith('@'):
            spans.append((s, e, bline, hdr))
    # expand span start to beginning of line + preceding attached comments
    keep = list(src)
    marks = [False] * len(src)
    for s, e, bline, hdr in spans:
        a = s
        while a > 0 and src[a - 1] in ' \t\n': a -= 1
        # attached comments: comment directly before (only whitespace between)
        while True:
            m = re.search(r'/\*(?:(?!\*/).)*\*/[ \t\n]*$', src[:a], flags=re.S)
            if not m: break
            prev = src[:m.start()].rstrip(' \t')
            a2 = m.start()
            while a2 > 0 and src[a2 - 1] in ' \t\n': a2 -= 1
            a = a2
        b = e
        for k in range(a, b): marks[k] = True
        removed.append(f'{path}:{bline}: {" ".join(hdr.split())}')
    out = ''.join(ch for k, ch in enumerate(src) if not marks[k])
    # drop wrappers left empty
    while True:
        new = re.sub(r'\n?[ \t]*/\*[^*]*\*/[ \t]*\n?(?=[ \t]*@(?:media|supports)[^{]*\{\s*\})', '\n', out)
        new = re.sub(r'\n?[ \t]*@(?:media|supports)[^{;}]*\{\s*\}', '', new)
        if new == out: break
        out = new
    if not out.endswith('\n'): out += '\n'
    out = re.sub(r'\n{3,}', '\n\n', out)
    open(full, 'w', encoding='utf-8').write(out)
# keyframes no longer named anywhere
allcss = ''
for d, _, fs in os.walk(os.path.join(root, 'app')):
    for f in fs:
        if f.endswith('.css'): allcss += open(os.path.join(d, f), encoding='utf-8').read()
for path in ['app/styles/app.css', 'app/styles/base/utilities.css']:
    full = os.path.join(root, path); src = open(full, encoding='utf-8').read()
    for m in list(re.finditer(r'@keyframes\s+([\w-]+)', src)):
        name = m.group(1)
        pat = re.compile(r'(?<![\w-])' + re.escape(name) + r'(?![\w-])')
        cssrefs = len(pat.findall(allcss)) - 1
        if cssrefs == 0 and not any(pat.search(s) for s in srcfiles):
            removed.append(f'{path}: @keyframes {name}')
    for line in [r for r in removed if r.startswith(path + ': @keyframes ')]:
        name = line.split()[-1]
        s = src.find('@keyframes ' + name)
        if s < 0: continue
        depth = 0; e = src.index('{', s)
        for k in range(e, len(src)):
            if src[k] == '{': depth += 1
            elif src[k] == '}':
                depth -= 1
                if depth == 0: e = k + 1; break
        a = s
        while a > 0 and src[a - 1] in ' \t\n': a -= 1
        m = re.search(r'/\*(?:(?!\*/).)*\*/[ \t\n]*$', src[:a], flags=re.S)
        if m:
            a = m.start()
            while a > 0 and src[a - 1] in ' \t\n': a -= 1
        src = src[:a] + src[e:]
    src = re.sub(r'\n{3,}', '\n\n', src)
    if not src.startswith('@') and src.startswith('\n'): src = src.lstrip('\n')
    open(full, 'w', encoding='utf-8').write(src)
open(report, 'w').write('\n'.join(removed) + '\n')
print('removed', len(removed))
