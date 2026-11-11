# usage: python3 -I compare-extras.py <extras-head.json> <extras-tree.json>  -> rows, last line "ROWS n ALL_OK bool"
import json, re, sys
h = json.load(open(sys.argv[1])); t = json.load(open(sys.argv[2])); rows = []
TEAL = re.compile(r'19,\s*217,\s*204|18,\s*217,\s*200|20,\s*184,\s*166')
def row(n, ok, info=''): rows.append((n, bool(ok), info))
hm = h['liveTealMatches']; tm = t['liveTealMatches']
row('SWEEP-HEAD-CONTROL', all(hm[k] > 0 for k in ('home', 'homePlayer', 'palette', 'notFound', 'cart', 'cartDialog')), hm)
row('SWEEP-TREE-ZERO', all(v == 0 for v in tm.values()) and len(tm) == 8, tm)
dm = t['defaultMotion']
row('DEFAULT-MOTION-CARD', dm['beforeAnim'] == 'light-flicker-on' and dm['beforeOpacity'] == h['defaultMotion']['beforeOpacity'] and dm['afterContent'] == 'none' and not TEAL.search(json.dumps(dm)), dm)
row('THUMB-FOCUS', t['thumbFocus']['focusVisible'] is True and t['thumbFocus']['outline'] == h['thumbFocus']['outline'], t['thumbFocus'])
pl = t['paletteLongest']
row('PALETTE-LONGEST', pl['title'] == h['paletteLongest']['title'] and pl['bg'] == 'rgba(201, 164, 106, 0.12)' and pl['overflow'] is False, pl)
row('PALETTE-EMPTY', t['paletteEmpty'] == h['paletteEmpty'] and t['paletteEmpty']['items'] == 0, t['paletteEmpty'])
row('CONFIRM-IN-DIALOG', t['confirmInDialog'] == {'inDialog': True, 'scrollbarColor': 'rgb(115, 107, 96) rgba(0, 0, 0, 0)'} and h['confirmInDialog'].get('inDialog') is True, t['confirmInDialog'])
row('PAGE-ERRORS', t['pageErrors'] == 0 and h['pageErrors'] == 0)
for n, ok, info in rows: print('OK  ' if ok else 'FAIL', n, info if not ok or n.startswith('SWEEP') else '')
print('ROWS', len(rows), 'ALL_OK', all(ok for _, ok, _ in rows))
