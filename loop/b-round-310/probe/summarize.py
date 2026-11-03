import json, sys, glob, os
d = sys.argv[1]
out = []
for name in ['head-proxy-throw', 'sketch-proxy-throw', 'sketch-proxy-short', 'sketch-alt-throw', 'sketch-alt-short']:
    r = json.load(open(os.path.join(d, name + '-1440.json')))
    out.append(f"== {name} {r['browser']}")
    for step, v in r['steps'].items():
        srv = [e for e in v.get('server', []) if e['method'] != 'OPTIONS']
        s = '; '.join(f"{e['method']} {e['status']} cr={e['contentRange']} cl={e['contentLength']} bytes={e['bodyBytes']} etag={e['etag']} h{e['r2']['heads']}g{e['r2']['gets']}c{e['r2']['cancels']} ranges={json.dumps(e['r2']['getRanges'])}" for e in srv)
        out.append(f"  {step}: status={v.get('status')} bytes={v.get('bytes')} ct={v.get('contentType')} err={v.get('error')} | {s}")
open(os.path.join(d, 'summary.txt'), 'w').write('\n'.join(out) + '\n')
print('\n'.join(out))
