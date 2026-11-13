# B round 431 -> 432 row 4b: the load-phase bar keeps its label, accessible name and box. usage: python3 -I compare-neighbours.py <after dir> <head dir>
import json, sys
a = json.load(open(sys.argv[1] + '/progress-probe.json'))
h = json.load(open(sys.argv[2] + '/progress-probe.json'))
out, ok_all = [], True
for key in ('1440x900', '1280x720'):
    bad = []
    hs = h['cells'][key]['indeterminate']['samples'][0]
    for state in ('indeterminate', 'reducedMotion', 'forcedColors'):
        for q in a['cells'][key][state]['samples']:
            if q['label'] != q['valuetext']: bad.append('%s label %r != valuetext %r' % (state, q['label'], q['valuetext']))
            if q['arialabel'] != hs['arialabel']: bad.append('%s aria-label %r != HEAD %r' % (state, q['arialabel'], hs['arialabel']))
            if q['label'] != hs['label']: bad.append('%s label %r != HEAD %r' % (state, q['label'], hs['label']))
            for f in ('x', 'y', 'w', 'h'):
                if abs(q[f] - hs[f]) > 1: bad.append('%s %s %.1f vs HEAD %.1f' % (state, f, q[f], hs[f]))
    out.append('%s %s' % (key, 'OK' if not bad else 'NOT OK: ' + '; '.join(sorted(set(bad))[:6])))
    ok_all = ok_all and not bad
out.append('NEIGHBOURS OK (2 cells, 3 load-phase states)' if ok_all else 'NEIGHBOURS NOT OK')
print('\n'.join(out))
