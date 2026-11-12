import json, sys
def counts(p):
    d = json.load(open(p))
    out = {}
    for k, v in d['screens'].items():
        out[k] = (len(v), sum(1 for x in v if not x['inClip'] and not x['inLibraryList']))
    return out, d.get('journey', {})
a, ja = counts('b-round-479/screens/screen480.json')
b, jb = counts('b-round-464/screens/screen465.json')
for k in a:
    print(k, 'all', b.get(k, (None,))[0], '->', a[k][0], '| outside', b.get(k, (0, None))[1], '->', a[k][1])
for vp in ja:
    for kk, vv in ja[vp].items():
        o = jb.get(vp, {}).get(kk)
        print('journey', vp, kk, 'SAME' if o == vv else 'DIFF', str(o)[:90], '->', str(vv)[:90])
