# SYS-2 stage 4 (2b-ii-a) HEAD vs fixed-tree compare. Usage: python3 -I compare.py <probe dir with head/ and sketch/>
# PASS per cell: the fixed tree's first Enter acts, the three repeats change nothing (state incl. side-effect counters),
# 0 page errors, the first-press state equals HEAD's (per-press unchanged), focus lands on the mapped element with
# :focus-visible and a solid outline. GMENU focus is recorded only (BODY at HEAD: pre-existing, confirmedBy on C-R301-01).
# XEXPORT: `downloads` depends on when the WAV lands (wallclock), so it is left out of the A/B and HEAD comparisons and the
# whole-interval totals are asserted instead (B renders == 1 and B downloads == 1). Non-cell JSONs are skipped.
import json, os, sys
d = sys.argv[1]
FOCUS = {
    'SFOOTER': ('label', 'Search shortcuts'), 'SCLOSE': ('label', 'Keyboard shortcuts (?)'),
    'XDONE': ('text', 'Export'), 'XMODALX': ('text', 'Export'), 'XEXPORT': ('text', 'Done'),
    'GMENU': None, 'NSEND': ('text', 'Send link'),
}
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
    fo = s['focusedAfterHeld']
    if FOCUS[s['row']] is None:
        key, want, focus_ok = 'tag', fo.get('tag'), True
    else:
        key, want = FOCUS[s['row']]
        focus_ok = fo.get(key) == want and fo.get('focusVisible') is True and fo.get('outline') == 'solid'
    skip = {'downloads'} if s['row'] == 'XEXPORT' else set()
    strip = lambda st: {k: v for k, v in st.items() if k not in skip}
    same_first = json.dumps(strip(s['A']), sort_keys=True) == json.dumps(strip(h['A']), sort_keys=True)
    held = [k for k in s['A'] if k not in skip and json.dumps(s['A'][k], sort_keys=True) != json.dumps(s['B'][k], sort_keys=True)]
    totals_ok = s['row'] != 'XEXPORT' or (s['B']['c']['renders'] == 1 and s['B']['downloads'] == 1)
    ok = s['firstActed'] and held == [] and not s['pageErrors'] and same_first and focus_ok and totals_ok
    bad += 0 if ok else 1
    print(f"{s['row']} {s['vp']} head held {h['heldChanged']} | sketch first {s['firstActed']} held {held} firstEqualsHead {same_first} focus {fo.get(key)} visible {fo.get('focusVisible')} {fo.get('outline')}{' (recorded)' if FOCUS[s['row']] is None else ''}{' totals ' + str(totals_ok) if s['row'] == 'XEXPORT' else ''} | {'OK' if ok else 'FAIL'}")
print(f"ALL OK ({n} cells)" if bad == 0 and n else f"FAIL {bad} of {n}")
