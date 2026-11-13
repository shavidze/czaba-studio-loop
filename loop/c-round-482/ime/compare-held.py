# Usage: python3 -I compare-held.py held.json  -> one line per cell, then ALL OK (N cells) or NOT ALL OK (k of N failing)
# OK = after the composing key + 3 auto-repeat keys + keyUp: focus stays in the field, the editor stays open,
# nothing committed or reverted (tempo not 96 committed-by-blur, marker count unchanged, gain/start keep the IME text),
# and afterPlainKey (status-checked for TEMPO, RANGE and GAIN) (one plain press) acts exactly like HEAD's plain key (Enter commits, Escape cancels).
import json, sys
d = json.load(open(sys.argv[1]))
bad = 0
for k, c in d.items():
    site = k.split(':')[1]
    if 'error' in c:
        print(k, 'ERROR'); bad += 1; continue
    b, a, p = c['before'], c['after'], c.get('afterPlainKey')
    ok = a['focused'] == b['focused'] and not c['pageErrors'] and p is not None
    if site.startswith('MARKER'): ok = ok and a['markerEditor'] and a['markers'] == b['markers']
    if site.startswith('GROUP'): ok = ok and a['groupEditor']
    if site == 'GAIN-ESC': ok = ok and a['gain'] == '7'
    if site == 'TEMPO-ESC' or site == 'TEMPO-ENTER': ok = ok and a['focusedValue'] == '96'
    if p is not None:
        if site == 'TEMPO-ENTER': ok = ok and p['focused'] != b['focused'] and p['tempo'] == '96' and '96' in (p['status'] or '') and p['status'] != a['status']
        if site == 'TEMPO-ESC': ok = ok and p['focused'] != b['focused'] and p['tempo'] == b['tempo'] and p['status'] == a['status']
        if site == 'MARKER-ENTER': ok = ok and p['markers'] == b['markers'] + 1
        if site == 'MARKER-ESC': ok = ok and not p['markerEditor'] and p['markers'] == b['markers']
        if site == 'GROUP-ENTER': ok = ok and not p['groupEditor']
        if site == 'GROUP-ESC': ok = ok and not p['groupEditor']
        if site == 'GAIN-ENTER': ok = ok and p['gain'] in ('7.0', '+7.0') and '+7.0 dB' in (p['status'] or '')
        if site == 'RANGE-ENTER': ok = ok and (p['status'] or '').startswith('Time selection: 00:07.000')
        if site == 'GAIN-ESC': ok = ok and p['gain'] == b['gain']
    print(k, 'OK' if ok else 'FAIL'); bad += 0 if ok else 1
n = len(d)
print(f'ALL OK ({n} cells)' if bad == 0 else f'NOT ALL OK ({bad} of {n} failing)')
