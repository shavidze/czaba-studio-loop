# Usage: python3 -I compare-plain.py tree.json head.json -> per cell SAME/DIFF on the editor state after a plain held key; then ALL SAME (N cells) or k DIFF
import json, sys
t, h = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
F = ['focused', 'focusedValue', 'tempo', 'markers', 'markerEditor', 'groupEditor', 'groupName', 'start', 'gain', 'status']
bad = 0
for k in sorted(h):
    if 'error' in h[k] or 'error' in t.get(k, {'error': 1}):
        print(k, 'ERROR'); bad += 1; continue
    d = [f for f in F if t[k]['after'][f] != h[k]['after'][f]]
    print(k, 'SAME' if not d else 'DIFF ' + ','.join(d)); bad += 1 if d else 0
print(f'ALL SAME ({len(h)} cells)' if bad == 0 else f'{bad} of {len(h)} DIFF/ERROR')
