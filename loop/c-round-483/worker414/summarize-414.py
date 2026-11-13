import json, sys
for f in sys.argv[1:]:
    d = json.load(open(f)); out = []
    for k, v in d['steps'].items():
        if not isinstance(v, dict): out.append(f'{k}={v}'); continue
        srv = v.get('server') or []
        s = ' '.join(f"{x['status']} h{x['r2']['heads']}g{x['r2']['gets']}c{x['r2']['cancels']}" + (f" {x.get('cacheControl')}" if x['status'] == 416 else '') for x in srv)
        extra = {kk: v[kk] for kk in ('advanced', 'error') if kk in v}
        out.append(f"{k}: page {v.get('status')} | server {s} {extra if extra else ''}".rstrip())
    print(f.split('/')[-1]); print('  ' + '\n  '.join(out))
