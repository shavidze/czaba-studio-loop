import glob, sys
root = sys.argv[1] if len(sys.argv) > 1 else '/home/runner/czaba-project/store'
t = [l.strip() for l in open(f'{root}/docs/implementation/TEMPLATE.md') if l.startswith('## ') and not l.startswith('## Prompt')]
print('template', t)
ok, bad = 0, []
for f in sorted(glob.glob(f'{root}/docs/implementation/2026/quarter-IV/*.md')):
    h = [l.strip() for l in open(f) if l.startswith('## ')]
    it = iter(h)
    if all(any(x == y for y in it) for x in t):
        ok += 1
    else:
        bad.append(f.split('/')[-1])
print('quarter-IV ok', ok, 'not', len(bad))
print('not ok:', bad)
