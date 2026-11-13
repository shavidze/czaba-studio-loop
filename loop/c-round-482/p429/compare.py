# SYS-2 stage 5 HEAD vs fixed-tree compare. Usage: python3 -I compare.py <probe dir with head/ and sketch/>
# PASS per cell: first Enter acts, the three repeats change nothing (markers, editor, library menu, status, undo, insert marker,
# clock, popup count), 0 page errors, the first-press state equals HEAD's (fold is behaviour-identical), focus on the mapped element
# with :focus-visible and a solid outline. Non-cell JSONs are skipped.
import json, os, sys
d = sys.argv[1]
FOCUS = {'MADD': ('testid', 'arrangement-marker-name-input'), 'MEDIT': ('testid', 'arrangement-marker'),
         'MFLAG': ('testid', 'arrangement-marker'), 'LMENU': ('tag', 'BUTTON')}
bad = 0; n = 0
for f in sorted(os.listdir(os.path.join(d, 'sketch'))):
    if not f.endswith('.json'):
        continue
    s = json.load(open(os.path.join(d, 'sketch', f)))
    if s.get('row') not in FOCUS:
        continue
    n += 1
    h = json.load(open(os.path.join(d, 'head', f)))
    if 'error' in s or 'error' in h:
        print(f, 'ERROR', s.get('error') or h.get('error')); bad += 1; continue
    key, want = FOCUS[s['row']]; fo = s['focusedAfterHeld']
    focus_ok = fo.get(key) == want and fo.get('focusVisible') is True and fo.get('outline') == 'solid'
    if s['row'] == 'LMENU':
        focus_ok = focus_ok and (fo.get('text') or '').startswith('Middle East')
    same_first = json.dumps(s['A'], sort_keys=True) == json.dumps(h['A'], sort_keys=True)
    held = [k for k in s['A'] if json.dumps(s['A'][k], sort_keys=True) != json.dumps(s['B'][k], sort_keys=True)]
    ok = s['firstActed'] and held == [] and not s['pageErrors'] and same_first and focus_ok
    bad += 0 if ok else 1
    print(f"{s['row']} {s['vp']} head held {h['heldChanged']} | sketch first {s['firstActed']} held {held} firstEqualsHead {same_first} focus {fo.get(key)} visible {fo.get('focusVisible')} {fo.get('outline')} | {'OK' if ok else 'FAIL'}")
print(f"ALL OK ({n} cells)" if bad == 0 and n else f"FAIL {bad} of {n}")
