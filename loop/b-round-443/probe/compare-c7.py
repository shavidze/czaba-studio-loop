# C7 compare (B round 443 planning): tree output must equal HEAD output cell by cell. Usage: python3 -I compare-c7.py <tree.json> <head.json>
import json, sys
t = json.load(open(sys.argv[1])); h = json.load(open(sys.argv[2])); n = 0; bad = 0
KEYS = ('focused', 'role', 'value', 'sheetOpen', 'focusSource', 'ring')
for vp in sorted(h):
    for step in ('a_escape', 'b_arrowdown', 'c_sheet_escape'):
        n += 1; a = {k: t.get(vp, {}).get(step, {}).get(k) for k in KEYS}; b = {k: h[vp].get(step, {}).get(k) for k in KEYS}
        ok = a == b and b.get('ring') is True; bad += 0 if ok else 1
        print(vp, step, 'OK' if ok else f'DIFF tree={a} head={b}')
print(f'ALL SAME ({n} cells)' if bad == 0 else f'NOT SAME ({bad} of {n})')
