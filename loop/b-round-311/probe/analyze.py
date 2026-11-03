import json, sys
p = json.load(open(sys.argv[1]))
nodes = {n['id']: n for n in p['nodes']}
parent = {}
for n in p['nodes']:
    for c in n.get('children', []): parent[c] = n['id']
def stack(i):
    s = []
    while i is not None:
        cf = nodes[i]['callFrame']; s.append(cf['functionName'] + '@' + cf['url'].split('/')[-1].split('?')[0] + ':' + str(cf['lineNumber'] + 1)); i = parent.get(i)
    return s
t = p['startTime']; calls = []; cur = None
for sid, d in zip(p['samples'], p['timeDeltas']):
    t += d
    st = stack(sid)
    idx = next((k for k, f in enumerate(st) if f.startswith('computePeaks@')), None)
    if idx is not None:
        caller = st[idx + 1] if idx + 1 < len(st) else '?'
        if cur and t - cur['end'] < 400 and cur['caller'] == caller:
            cur['end'] = t; cur['ms'] += d / 1000
        else:
            cur = {'start': t, 'end': t, 'ms': d / 1000, 'caller': caller}; calls.append(cur)
    # top other heavy frames
for c in calls: print('computePeaks run', round((c['start'] - p['startTime']) / 1000), 'ms ~', round(c['ms'], 1), 'ms from', c['caller'])
# What is under Worker.onmessage handlers: inclusive by leaf-ish function
incl = {}
for sid, d in zip(p['samples'], p['timeDeltas']):
    for f in set(stack(sid)): incl[f] = incl.get(f, 0) + d / 1000
for f, v in sorted(incl.items(), key=lambda x: -x[1])[:45]:
    if v > 4 and 'chunk-' not in f: print(round(v, 1), f)
