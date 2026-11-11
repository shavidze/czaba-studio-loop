# Inventory v2: every tracked app CSS file; rule-level selector parsing (comments stripped, multi-line selectors);
# teal/glow hits; keyframes resolved to the rules that animate them; per-class TSX consumers (non-test files);
# liveness = every class of at least one compound selector has a consumer file.
import re, os, sys, subprocess, json
root = sys.argv[1]
files = subprocess.run(['git','-C',root,'ls-files','app'],capture_output=True,text=True).stdout.split()
cssf = [f for f in files if f.endswith('.css')]
src = {f: open(os.path.join(root,f)).read() for f in files if f.endswith(('.ts','.tsx')) and '__tests__' not in f}
HIT = re.compile(r'19,\s*217,\s*204|20,\s*184,\s*166|hsla?\(\s*17\d|#13d9cc|#14b8a6|--gradient-primary|--gradient-glow|--color-glow|rgba\(var\(--color-(brand|accent)-rgb\)|(?<![\w.-])0(?:px|rem|em)?\s+0(?:px|rem|em)?\s+\d+(?:\.\d+)?px', re.I)
def strip_comments(t):
    return re.sub(r'/\*.*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group(0)), t, flags=re.S)
out = []
anim = {}  # keyframe -> selectors animating it
for f in cssf:
    raw = open(os.path.join(root,f)).read(); t = strip_comments(raw)
    stack = []; buf_start = 0; i = 0
    rules = []  # (selector_chain, body_start, body_end)
    for i,ch in enumerate(t):
        if ch == '{':
            sel = t[buf_start:i].strip(); stack.append((sel, i)); buf_start = i+1
        elif ch == '}':
            if stack:
                sel, st = stack.pop(); rules.append(([s for s,_ in stack]+[sel], st, i))
            buf_start = i+1
        elif ch == ';':
            buf_start = i+1
    for chain, st, en in rules:
        body = t[st+1:en]
        # only direct declarations (skip nested blocks)
        direct = re.sub(r'\{[^{}]*\}', '', body)
        sel = chain[-1]
        for m in re.finditer(r'animation(?:-name)?\s*:\s*([^;]+)', direct):
            for name in re.findall(r'[A-Za-z_][\w-]*', m.group(1)):
                anim.setdefault(name, []).append((f, ' '.join(chain)))
        hits = [l.strip() for l in direct.split(';') if HIT.search(l)]
        if hits:
            line = t[:st].count('\n')+1
            out.append({'file': f, 'line': line, 'chain': chain, 'hits': [h[:90] for h in hits]})
def consumers(cls):
    return sorted(f for f,c in src.items() if re.search(r'(?<![\w-])'+re.escape(cls)+r'(?![\w-])', c))
def selector_live(sel):
    res = []
    for comp in [s.strip() for s in sel.split(',')]:
        classes = re.findall(r'\.([A-Za-z_][\w-]*)', comp)
        cons = {c: consumers(c) for c in classes}
        res.append((comp, cons, bool(classes) and all(cons.values())))
    return res
for r in out:
    chain = r['chain']
    kf = re.match(r'@keyframes\s+([\w-]+)', chain[0]) if chain else None
    if kf:
        users = anim.get(kf.group(1), [])
        r['keyframe'] = kf.group(1); r['animated_by'] = [u[1] for u in users]
        r['live'] = any(any(x[2] for x in selector_live(u[1].split('@media')[-1])) for u in users)
        r['detail'] = {u[1]: [(c, {k: v for k, v in cons.items()}, lv) for c, cons, lv in selector_live(u[1])] for u in users}
    elif chain and chain[0].startswith('@theme') or (chain and chain[-1] in (':root',) ):
        r['live'] = 'token'; r['detail'] = {}
    else:
        sel = chain[-1]
        d = selector_live(sel)
        r['live'] = any(x[2] for x in d); r['detail'] = {c: cons for c, cons, lv in d}
json.dump(out, open(sys.argv[2],'w'), indent=1)
for r in out:
    print(f"{r['file'].split('app/')[-1]}:{r['line']}\t{'LIVE' if r['live'] is True else ('token' if r['live']=='token' else 'dead')}\t{' >> '.join(r['chain'])[:90]}\t{len(r['hits'])} hit(s)" + (f"\tanimated_by={r.get('animated_by')}" if 'keyframe' in r else ''))
