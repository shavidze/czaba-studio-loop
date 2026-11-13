# Compare key outcome fields of the preview browser rows: head vs sketch. Usage: python3 -I compare.py <probe-dir>
import json, glob, os, sys
d = sys.argv[1]
def load(side):
    out = {}
    for f in sorted(glob.glob(os.path.join(d, side, 'rows-*.json'))):
        out.update(json.load(open(f)))
    return out
def key(v):
    if 'error' in v: return {'error': v['error'][:60]}
    return {'dec': v.get('dec'), 'starts': v.get('starts'), 'toggle': v.get('toggle'), 'toggle2': v.get('toggle2'), 'toggleAfter': v.get('toggleAfter'),
            'ok': v.get('ok'), 'srcs': [m['src'] for m in v.get('media', [])], 'lastText': (v.get('texts') or [''])[-1][:70], 'after2': v.get('after2')}
h, s = load('head'), load('sketch')
same = True
for k in sorted(set(h) | set(s)):
    a, b = key(h.get(k, {'error': 'missing'})), key(s.get(k, {'error': 'missing'}))
    eq = a == b; same = same and eq
    print(('EQUAL ' if eq else 'DIFF  ') + k + ' ' + json.dumps(b, ensure_ascii=False))
    if not eq: print('   head ' + json.dumps(a, ensure_ascii=False))
print('ALL EQUAL' if same else 'DIFFERENCES')
