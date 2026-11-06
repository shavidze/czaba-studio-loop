# usage: python3 -I perf-compare.py <sketch latest-interactions.json> <head latest-interactions.json>
# Prints every deterministic row: id sketch=<median> head=<median> releaseComponentsMax sketch=<v> head=<v> pass=<sketch pass>
import json, sys
def rows(p):
    d = json.load(open(p))
    out = {}
    for r in d.get('rows') or []:
        rel = None
        dets = [x for x in (r.get('details') or []) if isinstance(x, dict)]
        vals = [x.get('releaseComponentsMax') for x in dets if x.get('releaseComponentsMax') is not None]
        if vals:
            rel = max(vals)
        out[r['id']] = (r.get('median'), rel, r.get('pass'), r.get('kind'))
    return out
s, h = rows(sys.argv[1]), rows(sys.argv[2])
for k, (m, rel, ok, kind) in s.items():
    if kind != 'deterministic':
        continue
    hm, hrel, _, _ = h.get(k, (None, None, None, None))
    print(f"{k} sketch={m} head={hm} releaseComponentsMax sketch={rel} head={hrel} pass={ok}")
