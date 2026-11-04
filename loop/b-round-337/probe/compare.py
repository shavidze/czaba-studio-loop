# Usage: python3 -I compare.py <head.json> <other.json>  (prints behaviour fields equal/different and per-phase commit summaries)
import json, sys
h = json.load(open(sys.argv[1])); o = json.load(open(sys.argv[2]))
phases = ['same-lane-moves', 'cross-enter', 'cross-lane-moves', 'release']
diff = 0
for k in sorted(set(h) | set(o)):
    if k in phases:
        continue
    same = h.get(k) == o.get(k)
    diff += 0 if same else 1
    print(('SAME ' if same else 'DIFF ') + k, json.dumps(o.get(k))[:160] + ('' if same else '  (head ' + json.dumps(h.get(k))[:160] + ')'))
for p in phases:
    for name, d in (('head', h), ('other', o)):
        c = d.get(p, [])
        print(p, name, 'commits', len(c), 'rendered', [x.get('rendered') for x in c], 'provider', [x.get('providerRendered') for x in c], 'workspace', [x.get('workspaceRendered') for x in c], 'hooks', [x.get('changed') for x in c])
print('BEHAVIOUR-DIFFS', diff)
