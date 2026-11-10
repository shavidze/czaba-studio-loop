# usage: python3 -I compare-radio.py <probe dir with head/ and the run dir> <run subdir>
import json, sys, os
base, run = sys.argv[1], sys.argv[2]
head = json.load(open(os.path.join(base, 'head', 'radio-probe.json')))['cells']
cur = json.load(open(os.path.join(base, run, 'radio-probe.json')))['cells']
BRASS, STRONG = 'rgb(201, 164, 106)', 'rgb(115, 107, 96)'
ok_all = True
for key in ('1440x900', '1280x720'):
    h, c = head[key], cur.get(key)
    errs = []
    if c is None:
        print(key, 'MISSING'); ok_all = False; continue
    if c['pageErrors']: errs.append(f"pageErrors {len(c['pageErrors'])}")
    if c['tabStops'] != h['tabStops']: errs.append('tabStops differ')
    if not (c['arrowDown']['mp3Checked'] and c['arrowDown']['focusVisible'] and c['arrowDown2']['bothChecked'] and c['arrowDown3']['wavChecked']): errs.append('arrow cycle')
    if c['mousePress']['matchesFocusVisible']: errs.append('mouse press shows focus-visible')
    for rid, v in c['radios'].items():
        r, hr = v['rest'], h['radios'][rid]['rest']
        if r['appearance'] != 'none': errs.append(f'{rid} appearance {r["appearance"]}')
        if (r['w'], r['h']) != (16, 16): errs.append(f'{rid} box {r["w"]}x{r["h"]}')
        for k in ('x', 'y', 'w', 'h'):
            if abs(r['label'][k] - hr['label'][k]) > 1: errs.append(f'{rid} label {k} {r["label"][k]} vs {hr["label"][k]}')
        if r['checked'] != hr['checked'] or r['disabled'] != hr['disabled']: errs.append(f'{rid} state differs')
        want = BRASS if r['checked'] else STRONG
        if r['border'] != want: errs.append(f'{rid} border {r["border"]} want {want}')
        if r['checked'] and r['borderW'] != '4px': errs.append(f'{rid} checked border width {r["borderW"]}')
        hb = v['hover']['border']
        if not r['disabled'] and not r['checked'] and hb == r['border']: errs.append(f'{rid} no hover change')
        if r['disabled'] and hb != r['border']: errs.append(f'{rid} disabled hover changed')
        if r['checked'] and not r['disabled'] and hb != r['border']: errs.append(f'{rid} checked ring changed on hover {hb}')
    print(key, 'OK' if not errs else 'FAIL ' + '; '.join(errs))
    ok_all = ok_all and not errs
print('ALL OK (2 cells, 6 radios each)' if ok_all else 'NOT OK')
