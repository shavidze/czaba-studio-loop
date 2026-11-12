# usage: python3 -I reblack.py <matrix dir> [glob-substring]
# Per JSON: first covered sample (cover|overlay >= 0.99), first fully uncovered sample after it (both < 0.01),
# and "reblack" = count of later samples with cover > 0.01 or overlay > 0.01 (must be 0 for C13 on the tree).
import json, os, sys
d = sys.argv[1]; sub = sys.argv[2] if len(sys.argv) > 2 else ''
for f in sorted(os.listdir(d)):
    if not f.endswith('.json') or sub not in f: continue
    s = json.load(open(os.path.join(d, f)))['samples']
    s = [x for x in s if 'cover' in x]
    fc = next((x['t'] for x in s if max(x['cover'], x['overlay']) >= 0.99), None)
    un = None if fc is None else next((x['t'] for x in s if x['t'] > fc and max(x['cover'], x['overlay']) < 0.01), None)
    rb = None if un is None else sum(1 for x in s if x['t'] > un and max(x['cover'], x['overlay']) > 0.01)
    ov = any(x['overlay'] > 0.01 for x in s)
    print(f, 'firstCovered', fc, 'firstUncovered', un, 'uncovered-firstCovered', None if un is None or fc is None else un - fc, 'reblack', rb, 'overlaySeen', ov)
