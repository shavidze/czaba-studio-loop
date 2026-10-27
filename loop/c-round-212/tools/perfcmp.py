# C round 212 — PERF-RUN-212 / LATENCY-212 comparison: C round 211 runs vs C round 212 runs.
import json, sys
R11 = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-211/out/perf-run%d.json'
R12 = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-212/out/perf-run%d.json'
runs = [int(x) for x in (sys.argv[1:] or ['1', '2'])]
def load(p):
    d = json.load(open(p)); return d, {r['id']: r for r in d['rows']}
a = [load(R11 % i) for i in (1, 2)]
b = [load(R12 % i) for i in runs]
for i, (d, rows) in zip(runs, b):
    asserts = [r for r in rows.values() if r['mode'] == 'assert']
    print(f'run{i}: complete={d["complete"]} rows={len(rows)} asserts={len(asserts)} failing={[r["id"] for r in asserts if not r["pass"]]} failures={d["failures"]} durationMs={d["durationMs"]}')
ids = b[0][1]
EXCL = lambda k: ('release-commits' in k and (k.startswith('fader.clipgain.') or k.startswith('fader.clipgain-members.')))
det_diff = []; checked = 0; excluded = []
for k, r in sorted(ids.items()):
    if r['kind'] != 'deterministic' or k not in a[0][1]: continue
    m11 = {json.dumps(a[0][1][k]['median']), json.dumps(a[1][1][k]['median'])}
    m12 = {json.dumps(x[1][k]['median']) for x in b}
    if EXCL(k): excluded.append((k, sorted(m11), sorted(m12))); continue
    checked += 1
    if m11 != m12 or len(m12) != 1: det_diff.append((k, sorted(m11), sorted(m12)))
print('deterministic rows compared to C r211 (excl. clipgain release-commits):', checked, 'differences:', len(det_diff))
for x in det_diff: print('  DIFF', x)
print('excluded rows:')
for x in excluded: print('  EXCL', x)
new = [k for k in ids if k not in a[0][1]]; gone = [k for k in a[0][1] if k not in ids]
print('new ids', new, 'gone ids', gone)
nd = [k for k, r in ids.items() if r['kind'] == 'deterministic' and len({json.dumps(x[1][k]['median']) for x in b}) > 1]
print('deterministic rows differing between runs:', nd)
ns = [k for k, r in ids.items() if r['kind'] == 'deterministic' and len({json.dumps(s) for s in r['samples']}) > 1]
print('deterministic rows with non-identical pass samples (run first):', ns)
# 1x vs 6x deterministic for clipgain
x6 = []
for k, r in ids.items():
    if r['kind'] == 'deterministic' and k.startswith('fader.clipgain') and not k.endswith('.6x') and (k + '.6x') in ids:
        if json.dumps(r['median']) != json.dumps(ids[k + '.6x']['median']): x6.append((k, r['median'], ids[k + '.6x']['median']))
print('clipgain deterministic 1x vs 6x differences:', x6)
print()
print('%-62s %-22s %s' % ('row', 'C r211 run1/run2', 'C r212 runs'))
for k in sorted(ids):
    if k.startswith('fader.') and any(m in k for m in ('move-to-paint-p95', 'release-commits', 'move-components-max', 'commits-per-move', 'restarts', 'move-components-per-move')):
        o = '/'.join(str(x[1][k]['median']) if k in x[1] else '-' for x in a)
        n = '/'.join(str(x[1][k]['median']) for x in b)
        mode = ids[k]['mode']; ok = all(x[1][k].get('pass') is not False for x in b)
        print('%-62s %-22s %-16s %s %s' % (k, o, n, mode, '' if ok else 'FAIL'))
