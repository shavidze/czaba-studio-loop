# B round 418 -> 419: compares stem-integrity-probe JSON of HEAD vs sketch per viewport and phase.
# Usage: python3 -I compare.py <dir>  (reads <dir>/head/<vp>.json and <dir>/sketch/<vp>.json; vp = 1440x900, 1280x720)
# Compared per phase: ready, consistent, file count, re-stored keys, records (key,size), Fetch requests
# (file, status, If-None-Match kind, body bytes), playback started and peak (2 dp). Not compared: ETag values
# (build-dependent mtimes), file names (sketch adds a counter; checked separately), playhead ms.
import json, os, re, sys
d = sys.argv[1]
def norm(path):
    j = json.load(open(path))
    out, prev = {}, None
    for name, v in j['phases'].items():
        recs = {r['key']: r for r in v['state']['records']}
        etags = {r['etag'] for r in recs.values()}
        if prev:
            etags |= {r['etag'] for r in prev.values()}
        restored = sorted(k for k, r in recs.items() if prev and k in prev and prev[k]['fileName'] != r['fileName'])
        reqs = []
        for r in j['requests']:
            if r['phase'] != name or r.get('type') != 'Fetch':
                continue
            inm = r.get('ifNoneMatch')
            kind = 'none' if inm is None else ('stale' if 'b366-stale' in inm else ('stored' if inm in etags else 'other'))
            reqs.append((r['path'].split('/')[-1], r.get('status'), kind, r.get('encodedDataLength') if r.get('status') == 200 else None))
        play = v.get('playback')
        out[name] = {
            'ready': 'Demo collection ready' in (v.get('readyText') or ''),
            'consistent': v.get('waitedMs') is not None,
            'files': len(v['state']['files']),
            'restored': restored,
            'records': sorted((k, r['size']) for k, r in recs.items()),
            'requests': sorted(reqs, key=str),
            'starts': play['starts'] if play else None,
            'peak': round(max([p or 0 for p in play['peaks']]), 2) if play else None,
        }
        prev = recs
    names = [r['fileName'] for v in j['phases'].values() for r in v['state']['records']]
    return out, len(j['pageErrors']), names
lines, diffs = [], 0
for vp in ('1440x900', '1280x720'):
    h, he, hn = norm(os.path.join(d, 'head', vp + '.json'))
    s, se, sn = norm(os.path.join(d, 'sketch', vp + '.json'))
    for phase in h:
        same = h[phase] == s.get(phase)
        diffs += 0 if same else 1
        lines.append(f"{'EQUAL' if same else 'DIFF'} {vp} {phase} {json.dumps(s.get(phase))}")
        if not same:
            lines.append(f"  head {json.dumps(h[phase])}")
    ok3 = all(re.fullmatch(r'[0-9a-z]+-[0-9a-z]+-[0-9a-z]+', n) for n in sn)
    played = all(v['ready'] and v['starts'] == 1 and (v['peak'] or 0) > 0 for v in s.values())
    lines.append(f"INFO {vp} pageErrors head {he} sketch {se}; sketch file names have time-counter-random form: {ok3} ({len(sn)} names); sketch every phase ready, starts 1, peak > 0: {played}")
    diffs += 0 if (he == 0 and se == 0 and ok3 and played) else 1
lines.append('ALL EQUAL' if diffs == 0 else f'DIFF {diffs}')
print('\n'.join(lines))
