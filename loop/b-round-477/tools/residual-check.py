import sys, subprocess, os, collections
# usage: residual-check.py <store_root> <residual.tsv> -> rc 0 iff hue hits in scope == residual multiset (by file + line text)
root, resf = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
scope = ['docs/design', 'docs/technical/store-redesign/direction-decision.md']
out = subprocess.run([sys.executable, '-I', os.path.join(here, 'hue-scan.py')] + [os.path.join(root, s) for s in scope], capture_output=True, text=True).stdout
got = collections.Counter()
for l in out.splitlines():
    p, n, _ = l.split(':', 2)
    rel = os.path.relpath(p, root)
    if os.path.isfile(p):
        text = open(p, encoding='utf-8').read().split('\n')[int(n) - 1].strip()
    got[(rel, text)] += 1
want = collections.Counter()
for l in open(resf, encoding='utf-8').read().splitlines():
    if l.strip():
        f, t = l.split('\t', 1); want[(f, t)] += 1
extra = got - want; missing = want - got
for (f, t), c in sorted(extra.items()): print(f'UNEXPECTED {f}\t{t[:160]}')
for (f, t), c in sorted(missing.items()): print(f'RESIDUAL-CHANGED {f}\t{t[:160]}')
print(f'hits={sum(got.values())} residual={sum(want.values())} unexpected={sum(extra.values())} residual_changed={sum(missing.values())}')
sys.exit(0 if not extra and not missing else 1)
