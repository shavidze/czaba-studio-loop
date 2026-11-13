# Usage: python3 -I compare.py <probe-dir with sketch/ (and head/ for context)>. One line per cell and a verdict.
# Pass per cell: no error, firstActed true (MPEAK: a peak reset with no peak is idempotent, so firstActed is not required), heldChanged [] and pageErrors []. PANRESET also needs focus on the Pan slider after the first Enter.
import json, os, sys
d = sys.argv[1]; bad = 0; n = 0
rows = 'LMUTE,LSOLO,LFOLD,LNAME,LVIDEO,PANRESET,GFOLD,GMUTE,GSOLO,GNAME,GEDIT,MMUTE,MPEAK,METRO'.split(',')
for row in rows:
    for vp in ['1440x900', '1280x720']:
        n += 1
        s = json.load(open(os.path.join(d, 'sketch', f'{row}-{vp}.json')))
        hp = os.path.join(d, 'head', f'{row}-{vp}.json'); h = json.load(open(hp)) if os.path.exists(hp) else {}
        ok = ('error' not in s) and (s['firstActed'] or row == 'MPEAK') and s['heldChanged'] == [] and s['pageErrors'] == []
        if row == 'PANRESET':
            ok = ok and s['focusedAfterFirst'].get('type') == 'range'
        bad += 0 if ok else 1
        print(row, vp, 'head held', h.get('heldChanged'), '| sketch first', s.get('firstActed'), 'held', s.get('heldChanged'), '|', 'OK' if ok else 'FAIL')
print('ALL OK' if bad == 0 else f'{bad} FAIL', f'({n} cells)')
