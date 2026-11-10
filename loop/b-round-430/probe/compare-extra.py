# usage: python3 -I compare-extra.py <run dir containing radio-extra-probe.json>
import json, sys, os
cells = json.load(open(os.path.join(sys.argv[1], 'radio-extra-probe.json')))['cells']
ok = True
for key in ('1440x900', '1280x720'):
    c = cells.get(key); errs = []
    if c is None: print(key, 'MISSING'); ok = False; continue
    if c['pageErrors']: errs.append('pageErrors')
    fc = c['forcedColors']
    if len(fc) != 6 or any(x['appearance'] != 'auto' for x in fc): errs.append('forced-colors not auto on all 6')
    if not c['download']: errs.append('no download')
    late = c.get('disabledCheckedLate')
    if not c['disabledChecked'] or c['disabledChecked'][0]['appearance'] != 'none': errs.append('disabled-checked not caught or native')
    if not late or not late['stillDisabled']: errs.append('late sample missing (render ended < 250 ms: environment, retry)')
    elif not (late['checked'] and late['opacity'] == '0.5' and late['border'] == 'rgb(201, 164, 106)' and late['borderW'] == '4px'): errs.append(f'disabled-checked look {late}')
    print(key, 'OK' if not errs else 'FAIL ' + '; '.join(errs)); ok = ok and not errs
print('EXTRA ALL OK (2 cells)' if ok else 'EXTRA NOT OK')
