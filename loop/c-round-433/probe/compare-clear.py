# B round 432 -> 433 (SABA-B-12 stage 3): judge clear.json from clear-probe.mjs. usage: python3 -I compare-clear.py <dir with clear.json>
import json, sys
d = json.load(open(sys.argv[1] + '/clear.json'))
bad = []
def chk(cell, name, ok, got):
    print(f'{cell} {name}: {"ok" if ok else "FAIL"} ({got})')
    if not ok:
        bad.append(f'{cell}:{name}')
for cell in ('1440x900', '1280x720'):
    r = d.get(cell)
    if r is None:
        bad.append(cell + ':missing'); continue
    chk(cell, 'no-page-errors', len(r['errors']) == 0, len(r['errors']))
    chk(cell, 'no-clear-when-empty', r['clearWhenEmpty'] == 0, r['clearWhenEmpty'])
    chk(cell, 'one-clear-when-typed', r['clearWhenTyped'] == 1, r['clearWhenTyped'])
    chk(cell, 'filter-works', r['rowsLoop'] < r['rowsEmpty'], (r['rowsLoop'], r['rowsEmpty']))
    chk(cell, 'no-native-blue-cancel', r['inputTailPixels']['blue'] == 0, r['inputTailPixels'])
    e, t = r['inputBoxEmpty'], r['inputBoxTyped']
    chk(cell, 'input-box-670x38', (e['width'], e['height'], t['width'], t['height']) == (670, 38, 670, 38), (e['width'], e['height']))
    if r['clearWhenTyped'] != 1:
        continue
    pad = float(r['inputPadding'].rstrip('px'))
    text_end = t['x'] + t['width'] - 1 - pad
    cb = r['clearBox']
    chk(cell, 'text-stops-before-button', text_end <= cb['x'] and cb['x'] + cb['width'] <= t['x'] + t['width'], (round(text_end, 1), cb['x']))
    chk(cell, 'button-28-inside-field', cb['width'] == 28 and cb['height'] == 28 and t['y'] <= cb['y'] and cb['y'] + cb['height'] <= t['y'] + t['height'], cb)
    chk(cell, 'hover-changes-colour', r['clearColourRest'] != r['clearColourHover'], (r['clearColourRest'], r['clearColourHover']))
    chk(cell, 'real-tab-order', (r['tab1'], r['tab2'], r['shiftTab']) == ('Clear search', 'Close (Esc)', 'Clear search'), (r['tab1'], r['tab2'], r['shiftTab']))
    chk(cell, 'keyboard-focus-ring', r.get('focusRing', {}).get('outlineStyle') not in (None, 'none'), r.get('focusRing'))
    for k in ('afterEnter', 'afterClick'):
        a = r[k]
        chk(cell, k, a['value'] == '' and a['active'] == 'Search shortcuts' and a['rows'] == r['rowsEmpty'] and a['clear'] == 0 and a.get('dialogOpen', 1) == 1, a)
    s = r['afterSpace']
    chk(cell, 'afterSpace', r['spaceTarget'] == 'Clear search' and s['value'] == '' and s['active'] == 'Search shortcuts' and s['dialogOpen'] == 1 and s['playing'] == 0, s)
    chk(cell, 'esc-closes-with-query', r['afterEsc']['dialogOpen'] == 0, r['afterEsc'])
    chk(cell, 'reopen-empty', r['reopenValue'] == '', r['reopenValue'])
print('ALL OK (2 cells)' if not bad else 'NOT ALL OK: ' + ' '.join(bad))
