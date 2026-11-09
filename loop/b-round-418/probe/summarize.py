import json, sys
def summarize(path):
    d = json.load(open(path))
    out = [f"== {path.split('/')[-1]} viewport {d['viewport']['width']}x{d['viewport']['height']} pageErrors {len(d['pageErrors'])}"]
    prev = None
    for name, v in d['phases'].items():
        recs = {r['key']: r for r in v['state']['records']}
        files = {f.get('name'): f.get('size') for f in v['state']['files']}
        consistent = v.get('waitedMs') is not None
        reqs = [r for r in d['requests'] if r['phase'] == name and r.get('type') == 'Fetch']
        rq = '; '.join(f"{r['path'].split('/')[-1]} {r.get('status')} INM={r.get('ifNoneMatch')} body={r.get('encodedDataLength')}" for r in reqs)
        ready = 'ready' if 'Demo collection ready' in (v.get('readyText') or '') else (v.get('readyText') or '')[:60]
        play = v.get('playback')
        ps = f"pos {play['pos1']} peak {max([p or 0 for p in play['peaks']])} starts {play['starts']}" if play else 'no-play'
        fn = {k.split('/')[-1]: (r['fileName'], r['size'], r['etag']) for k, r in recs.items()}
        changed = []
        if prev:
            for k, r in recs.items():
                if k in prev and prev[k]['fileName'] != r['fileName']:
                    changed.append(k.split('/')[-1])
        out.append(f"{name}: {ready} | consistent(2 records, files match sizes)={consistent} files={len(files)} | re-stored={changed} | etags={ {k: e for k, (_, _, e) in fn.items()} } | {rq} | {ps}")
        prev = recs
    return '\n'.join(out)
print('\n\n'.join(summarize(p) for p in sys.argv[1:]))
