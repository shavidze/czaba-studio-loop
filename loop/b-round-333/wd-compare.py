import json, sys, hashlib
d = sys.argv[1]
out = []
for vp in ('1440', '1280'):
    a = json.load(open(f'{d}/wd-sketch-{vp}.json')); h = json.load(open(f'{d}/wd-head-{vp}.json'))
    out.append(f'{vp}: samples sketch {len(a["samples"])} head {len(h["samples"])} errors sketch {len(a["errors"])} head {len(h["errors"])}')
    diffs = 0
    for x, y in zip(a['samples'], h['samples']):
        same = x['label'] == y['label'] and x['lane'] == y['lane'] and x['detail'] == y['detail'] and x['zoom'] == y['zoom']
        diffs += 0 if same else 1
        key = hashlib.sha256(json.dumps([x['lane'], x['detail']]).encode()).hexdigest()[:12]
        out.append(f"  {x['label']:<24} lane {len(x['lane'])} detail {len(x['detail'])} zoom {x['zoom']} changed {x.get('changed', '-')} sha {key} {'EQUAL' if same else 'DIFF'}")
    out.append(f'{vp}: DIFFS {diffs}')
print('\n'.join(out))
