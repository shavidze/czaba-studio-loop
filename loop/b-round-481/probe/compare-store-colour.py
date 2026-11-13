# Usage: python3 -I compare-store-colour.py <run.json> <oracle browser.json from c-round-474>. Compares the probe-<w> fields except btnShadowSamples.
import json,sys
r=json.load(open(sys.argv[1])); o=json.load(open(sys.argv[2])); bad=0; n=0
for w in ('1440','1280'):
    a=r[f'probe-{w}']; b=o[f'probe-{w}']
    for k in sorted(set(a)|set(b)):
        if k=='btnShadowSamples': continue
        n+=1; same=a.get(k)==b.get(k); bad+=0 if same else 1
        print(w,k,'SAME' if same else f'DIFF run={a.get(k)!r} oracle={b.get(k)!r}')
    if r.get(f'pageerrors-{w}'): bad+=1; print(w,'pageerrors',r[f'pageerrors-{w}'])
print(f'ALL SAME ({n} cells)' if bad==0 else f'NOT SAME ({bad})')
