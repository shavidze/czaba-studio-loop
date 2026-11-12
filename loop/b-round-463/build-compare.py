# usage: python3 -I build-compare.py <head build dir> <tree build dir>   (each = a remix `build` folder)
# Prints a deterministic comparison: normalized server bundle diff, normalized client JS chunk equality, CSS selector delta, fingerprints.
import os, re, sys, difflib
H, T = sys.argv[1], sys.argv[2]
HASH = re.compile(r'-[A-Za-z0-9_-]{8}\.(js|css)')
def norm(text):
    text = HASH.sub(r'-HASH.\1', text)
    text = re.sub(r'"version": *"[0-9a-f]+"', '"version":"V"', text)
    return re.sub(r'manifest-[0-9a-f]{8}', 'manifest-V', text)
def read(p): return open(p, encoding='utf-8', errors='replace').read()
out = []
sd = list(difflib.unified_diff(norm(read(f'{H}/server/index.js')).splitlines(), norm(read(f'{T}/server/index.js')).splitlines(), lineterm='', n=0))
out.append(f'server-normalized-diff-lines={len([l for l in sd if l[:1] in "+-" and not l.startswith(("+++","---"))])}')
def chunks(d):
    a = f'{d}/client/assets'; res = {}
    for f in sorted(os.listdir(a)):
        if f.endswith('.js'):
            res.setdefault(HASH.sub('', f), []).append(norm(read(f'{a}/{f}')))
    return res
hc, tc = chunks(H), chunks(T)
diff = []
for base in sorted(set(hc) | set(tc)):
    hs, ts = sorted(hc.get(base, [])), sorted(tc.get(base, []))
    if hs != ts: diff.append(base)
out.append(f'client-js-bases={len(tc)} differing-after-normalization={" ".join(diff) or "none"}')
def css(d):
    a = f'{d}/client/assets'; f = [x for x in os.listdir(a) if x.startswith('app-') and x.endswith('.css')]
    assert len(f) == 1, f
    text = re.sub(r'/\*.*?\*/', '', read(f'{a}/{f[0]}'), flags=re.S); sel = set()
    for m in re.finditer(r'([^{}]+)\{', text):
        s = m.group(1).strip()
        if s.startswith('@'): continue
        sel.update(p.strip() for p in s.split(','))
    return sel, len(text)
hs, hl = css(H); ts, tl = css(T)
out.append(f'css-bytes-no-comments head={hl} tree={tl} selectors head={len(hs)} tree={len(ts)} removed={len(hs-ts)} added={len(ts-hs)}')
out += [f'REMOVED {s}' for s in sorted(hs - ts)] + [f'ADDED {s}' for s in sorted(ts - hs)]
for s in ['VideoShowcase','PianoLoadingAnimation','PianoCurtainLoader','CinemaCurtainLoader','Middle East - Demo Track','Loading your music','Thank You for Your Purchase','Brevo API key missing for order email','function SpotlightLoader']:
    n = sum(1 for r, _, fs in os.walk(T) for f in fs if s in read(os.path.join(r, f)))
    out.append(f'tree-fingerprint {s}: {n}')
print('\n'.join(out))
