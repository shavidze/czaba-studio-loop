import json, sys
for f in sys.argv[1:]:
    d = json.load(open(f)); print('==', f, d.get('browser'), d.get('viewport'))
    for k, v in d['steps'].items():
        srv = v.pop('server', [])
        print(' ', k, json.dumps(v))
        for s in srv:
            r = s.get('r2', {})
            print('    ', s.get('method'), s.get('status'), 'range=', s.get('range'), 'cr=', s.get('contentRange'), 'cl=', s.get('contentLength'), 'bytes=', s.get('bodyBytes'), 'cc=', s.get('cacheControl'), 'h%sg%sc%s' % (r.get('heads'), r.get('gets'), r.get('cancels')), 'MISMATCH' if s.get('contentLength') not in (None,) and s.get('method')=='GET' and str(s.get('contentLength'))!=str(s.get('bodyBytes')) else '')
