# B round 433 -> 434 (SABA-B-12 stage 3b): judge scrollbar.json from scrollbar-probe.mjs (run with visible scrollbars).
# usage: python3 -I compare-scrollbar.py <dir with scrollbar.json>
import json, sys
d = json.load(open(sys.argv[1] + '/scrollbar.json'))
bad = []
def chk(cell, name, ok, got):
    print(f'{cell} {name}: {"ok" if ok else "FAIL"} ({got})')
    if not ok:
        bad.append(f'{cell}:{name}')
HEAD_COLS = {'1440x900': [385, 731], '1280x720': [305, 651]}
for cell in ('1440x900', '1280x720'):
    r = d.get(cell)
    if r is None:
        bad.append(cell + ':missing'); continue
    s, e, lib = r['sheet'], r['exportDialog'], r['libraryRef']
    chk(cell, 'no-page-errors', len(r['errors']) == 0, len(r['errors']))
    chk(cell, 'library-reference-bar', lib is not None and lib['barWidth'] == 10 and lib['scrollbarColor'] == 'auto', lib)
    chk(cell, 'sheet-overflows', s['overflows'] and s['scrollHeight'] > s['clientHeight'], (s['scrollHeight'], s['clientHeight']))
    chk(cell, 'sheet-standard-props-auto', s['scrollbarColor'] == 'auto' and s['scrollbarWidth'] == 'auto', (s['scrollbarColor'], s['scrollbarWidth']))
    chk(cell, 'sheet-no-styled-scrollbar-class', 'styled-scrollbar' not in s['cls'].split(), 'styled-scrollbar' in s['cls'].split())
    chk(cell, 'sheet-bar-width-10-as-library', s['barWidth'] == lib['barWidth'] == 10, s['barWidth'])
    chk(cell, 'sheet-no-gutter-reserve', s['scrollbarGutter'] == 'auto', s['scrollbarGutter'])
    chk(cell, 'sheet-0-teal-px', r['sheetStrip']['teal'] == 0, r['sheetStrip'])
    chk(cell, 'sheet-warm-thumb-visible', r['sheetStrip']['warmThumb'] > 500, r['sheetStrip']['warmThumb'])
    chk(cell, 'sheet-thumb-hover-brightens', r['sheetStripHover']['bright'] > 500 and r['sheetStrip']['bright'] == 0, (r['sheetStrip']['bright'], r['sheetStripHover']['bright']))
    chk(cell, 'sheet-search-660-wide', r['sheetInputBox']['width'] == 660, r['sheetInputBox']['width'])
    chk(cell, 'sheet-two-columns-unchanged', r['sheetColumns']['xs'] == HEAD_COLS[cell] and r['sheetColumns']['headings'] == 8, r['sheetColumns'])
    chk(cell, 'export-standard-props-auto', e['scrollbarColor'] == 'auto' and 'styled-scrollbar' not in e['cls'].split(), e['scrollbarColor'])
    chk(cell, 'export-560-wide-no-gutter', e['offsetWidth'] == 560 and e['scrollbarGutter'] == 'auto', (e['offsetWidth'], e['scrollbarGutter']))
    chk(cell, 'export-focus-in-dialog', r['exportFocusInDialog'] is True, r['exportFocusInDialog'])
    if cell == '1440x900':
        chk(cell, 'export-1440-fits-no-bar', (not e['overflows']) and e['barWidth'] == 0 and e['clientWidth'] == 558, (e['overflows'], e['barWidth'], e['clientWidth']))
    else:
        chk(cell, 'export-1280-scrolls-bar-10', e['overflows'] and e['barWidth'] == 10 and e['clientWidth'] == 548, (e['overflows'], e['barWidth'], e['clientWidth']))
        chk(cell, 'export-1280-0-teal-warm-thumb', r['exportStrip']['teal'] == 0 and r['exportStrip']['warmThumb'] > 500, r['exportStrip'])
print('ALL OK (2 cells)' if not bad else 'NOT ALL OK: ' + ', '.join(bad))
