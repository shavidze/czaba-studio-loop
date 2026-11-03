import json, sys, os
d = sys.argv[1]; names = sys.argv[2:]
out = []
for name in names:
    r = json.load(open(os.path.join(d, name + '-1440.json')))
    out.append(f"== {name} {r.get('browser')}")
    for step, v in r['steps'].items():
        if not isinstance(v, dict): out.append(f"  {step}: {json.dumps(v)[:300]}"); continue
        srv = [e for e in v.get('server', []) if e['method'] != 'OPTIONS']
        s = '; '.join(f"{e['method']} {e['status']} cr={e['contentRange']} cl={e['contentLength']} bytes={e['bodyBytes']} etag={e['etag']} cc={e['cacheControl']} h{e['r2']['heads']}g{e['r2']['gets']}c{e['r2']['cancels']} ranges={json.dumps(e['r2']['getRanges'])}" for e in srv)
        extra = {k: v[k] for k in v if k not in ('server','status','bytes','contentType','error','contentRange','contentLength','etag','via')}
        out.append(f"  {step}: status={v.get('status')} bytes={v.get('bytes')} ct={v.get('contentType')} etag={v.get('etag')} err={v.get('error')} {json.dumps(extra)[:200] if extra else ''} | {s}")
print('\n'.join(out))
