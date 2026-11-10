# Usage: python3 -I compare.py <probe-dir with head/ and sketch/>. Prints one line per cell and a verdict.
import json, os, sys
d = sys.argv[1]; bad = 0; n = 0
for row in ['FOLLOW', 'LOOP', 'SPLIT', 'ZOOMRANGE', 'BACK', 'FLAG']:
    for vp in ['1440x900', '1280x720']:
        n += 1
        h = json.load(open(os.path.join(d, 'head', f'{row}-{vp}.json'))); s = json.load(open(os.path.join(d, 'sketch', f'{row}-{vp}.json')))
        ok = ('error' not in s) and s['firstActed'] and s['heldChanged'] == [] and s['pageErrors'] == []
        bad += 0 if ok else 1
        print(row, vp, 'head held', h.get('heldChanged'), '| sketch first', s.get('firstActed'), 'held', s.get('heldChanged'), '|', 'OK' if ok else 'FAIL')
print('ALL OK' if bad == 0 else f'{bad} FAIL', f'({n} cells)')
