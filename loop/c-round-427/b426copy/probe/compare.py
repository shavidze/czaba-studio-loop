# Usage: python3 -I compare.py <dir with head/ and sketch/>. Cell files only (files with a "row" key; smoke-*.json are skipped).
# Pass per cell: sketch firstActed, heldChanged empty, no error, no page errors, focus after the repeats on the expected element
# (FOCUS map), and that element matches :focus-visible with a solid outline.
import json, os, sys
FOCUS = {'SNAP': 'arrangement-snap-toggle', 'ENV': 'arrangement-envelope-toggle', 'LFOLDER': 'arrangement-library-folder',
         'LDISMISS': 'arrangement-library-search', 'DTOGGLE': 'arrangement-detail-toggle', 'VEXPAND': 'arrangement-video-expand',
         'VCLOSE': 'arrangement-video-expand', 'VRETURN': 'arrangement-video-expand', 'LFOLDC': 'label-ends:— Unfold'}
def focus_ok(row, fa):
    want = FOCUS[row]
    if want.startswith('label-ends:'):
        hit = fa.get('tag') == 'BUTTON' and (fa.get('label') or '').endswith(want.split(':', 1)[1])
    else:
        hit = fa.get('testid') == want
    return hit and fa.get('focusVisible') is True and fa.get('outline') == 'solid'
d = sys.argv[1]; bad = 0; n = 0
for f in sorted(os.listdir(os.path.join(d, 'sketch'))):
    if not f.endswith('.json'): continue
    s = json.load(open(os.path.join(d, 'sketch', f)))
    if 'row' not in s: continue
    n += 1
    hp = os.path.join(d, 'head', f); h = json.load(open(hp)) if os.path.exists(hp) else {}
    fa = s.get('focusedAfterHeld') or {}
    fok = focus_ok(s['row'], fa)
    ok = not s.get('error') and s.get('firstActed') and s.get('heldChanged') == [] and not s.get('pageErrors') and fok
    bad += 0 if ok else 1
    print(s['row'], s['vp'], 'head held', h.get('heldChanged'), '| sketch first', s.get('firstActed'), 'held', s.get('heldChanged'), 'focus', fa.get('testid') or fa.get('label'), 'ring', fa.get('focusVisible'), fa.get('outline'), 'focus-ok', fok, '|', 'OK' if ok else 'FAIL')
print(f'ALL OK ({n} cells)' if bad == 0 and n == 18 else f'{bad} FAIL of {n}')
