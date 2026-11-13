"""SYS-3 stage 1 browser compare. Usage: python3 -I compare.py <ime-sites output json>. Prints one line per cell and ALL OK / NOT ALL OK (n failing)."""
import json, sys
d = json.load(open(sys.argv[1]))
COMMIT = {
    'TEMPO': lambda b, pe: (pe['status'] or '').startswith('Tempo 96 BPM') and pe['focused'] != 'arrangement-tempo-input',
    'MARKER': lambda b, pe: pe['markers'] == b['markers'] + 1 and not pe['markerEditor'] and (pe['status'] or '').startswith('Marker “7” added'),
    'GROUP': lambda b, pe: (pe['groupName'] or '').startswith('7 — group') and not pe['groupEditor'],
    'RANGE': lambda b, pe: (pe['status'] or '').startswith('Time selection: 00:07.000'),
    'GAIN': lambda b, pe: (pe['status'] or '').startswith('Clip Gain:') and pe['gain'] == '7.0',
}
VALUE = {'TEMPO': '96', 'MARKER': '7', 'GROUP': '7', 'RANGE': '7', 'GAIN': '7'}
bad = 0
for k, c in d.items():
    site, key = k.split(':')[1].split('-')
    if 'error' in c:
        ok, why = False, 'error ' + c['error'][:80]
    else:
        b, a, pe = c['before'], c['after'], c.get('afterPlainEnter')
        checks = {
            'composing-key-seen': any(x.startswith(('Enter|composing=true', 'Escape|composing=true')) for x in a['keys']),
            'focus-kept': a['focused'] == b['focused'],
            'value-kept': a['focusedValue'] == VALUE[site],
            'status-same': a['status'] == b['status'],
            'markers-same': a['markers'] == b['markers'],
            'editor-open': (a['markerEditor'] if site == 'MARKER' else a['groupEditor'] if site == 'GROUP' else True),
            'group-name-same': a['groupName'] == b['groupName'],
            'no-page-errors': not c['pageErrors'],
        }
        if key == 'ENTER':
            checks['plain-enter-not-composing'] = bool(pe) and pe['keys'][-1].startswith('Enter|composing=false')
            checks['plain-enter-commits'] = bool(pe) and COMMIT[site](b, pe)
        failed = [n for n, v in checks.items() if not v]
        ok, why = not failed, ','.join(failed)
    bad += 0 if ok else 1
    print(k, 'OK' if ok else 'FAIL ' + why)
print('ALL OK (%d cells)' % len(d) if bad == 0 else 'NOT ALL OK (%d of %d failing)' % (bad, len(d)))
