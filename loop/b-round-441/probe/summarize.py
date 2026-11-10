import json, sys
for f in sys.argv[1:]:
    d = json.load(open(f)); print('==', f)
    for k, c in d.items():
        if 'error' in c: print(k, 'ERROR', c['error'][:120]); continue
        b, a, pe = c['before'], c['after'], c.get('afterPlainEnter')
        print(k, '| key', a['keys'], '| focus', b['focused'], '->', a['focused'], '| val', a['focusedValue'],
              '| mk', a['markers'], 'ed', a['markerEditor'], '| grp', a['groupEditor'], (a['groupName'] or '')[:14],
              '| tempo', a['tempo'], '| start', a['start'], '| gain', a['gain'],
              '| st=', 'same' if a['status'] == b['status'] else (a['status'] or '')[:50],
              '|| plain:', None if pe is None else (pe['focused'], pe['tempo'], pe['markers'], (pe['groupName'] or '')[:10], pe['start'], pe['gain'], (pe['status'] or '')[:55]), '| errs', len(c['pageErrors']))
