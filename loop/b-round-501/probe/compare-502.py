# usage: python3 -I compare-502.py <head-cart.json> <after-cart.json>
# lg rows (>=1024 wide): every box equal within 1 px; below lg: items column shows its whole content (h == scrollHeight) and title/remove hit-test true.
import json, sys
h = {(r['state'], r['vp']): r for r in json.load(open(sys.argv[1]))}
a = {(r['state'], r['vp']): r for r in json.load(open(sys.argv[2]))}
bad = 0
for k in sorted(a):
    w = int(k[1].split('x')[0]); x = a[k]; y = h.get(k)
    if w >= 1024:
        diffs = []
        # HEAD overflowed when its items column ran past main's bottom (summary taller than main): then the column is
        # bounded to the grid track (== the HEAD height of the same state at the same viewport with a short summary) and only col.h may differ.
        head_overflow = y['col']['y'] + y['col']['h'] > y['main']['bottom'] - 48 + 1  # 48 = main's inner py-12 bottom padding
        for f in ('col', 'checkout', 'summary', 'firstTitle', 'remove'):
            for d in ('x', 'y', 'w', 'h'):
                p = (x.get(f) or {}).get(d); q = ((y or {}).get(f) or {}).get(d)
                if f == 'col' and d == 'h' and head_overflow:
                    if p is None or x['col']['y'] + p > x['main']['bottom'] - 48 + 1: diffs.append(f'col.h {q}->{p} still past main bottom')
                    continue
                if p is None or q is None or abs(p - q) > 1: diffs.append(f'{f}.{d} {q}->{p}')
        if x['main']['h'] != y['main']['h'] or x['main']['ov'] != 'hidden': diffs.append(f"main {y['main']['h']}->{x['main']['h']} {x['main']['ov']}")
        ok = not diffs
        print(k[0], k[1], ('LG-EQUAL' + (' (HEAD column ran past main; bounded now)' if head_overflow else '')) if ok else 'LG-DIFF ' + '; '.join(diffs))
    else:
        c = x['col'] or {}
        ok = c.get('h') == c.get('sh') and c.get('h', 0) > 0 and x['reach']['title']['hits'] and x['reach']['remove']['hits'] and x['main']['ov'] == 'visible'
        print(k[0], k[1], 'SMALL-OK' if ok else 'SMALL-FAIL', f"col {c.get('h')}/{c.get('sh')} (head {(y['col'] or {}).get('h')}/{(y['col'] or {}).get('sh')}) titleHit {x['reach']['title']['hits']} removeHit {x['reach']['remove']['hits']} main.ov {x['main']['ov']}")
    bad += 0 if ok else 1
print('RESULT', 'PASS' if bad == 0 else f'FAIL {bad}')
