import json, sys
def load(p): return {r['id']: r for r in json.load(open(p))['rows']}
c1, c2 = load('c-round-211/out/perf-run1.json'), load('c-round-211/out/perf-run2.json')
mine = [load(p) for p in sys.argv[1:]]
excluded_prefixes = ('fader.clipgain.stopped.release-commits', 'fader.clipgain.playing.release-commits', 'fader.clipgain-members.stopped.release-commits', 'fader.clipgain-members.playing.release-commits')
diffs, n = [], 0
for rid, r in c1.items():
    if r['kind'] != 'deterministic':
        continue
    n += 1
    for i, m in enumerate(mine):
        if rid not in m:
            diffs.append((rid, f'run{i+1} missing')); continue
        if m[rid]['median'] != r['median'] or m[rid]['median'] != c2[rid]['median']:
            diffs.append((rid, f"run{i+1}={m[rid]['median']} c1={r['median']} c2={c2[rid]['median']}", rid.startswith(excluded_prefixes)))
print('deterministic rows compared:', n)
for d in diffs: print(d)
for i, m in enumerate(mine):
    print(f'run{i+1}: rows', len(m), 'asserts failing', [k for k, v in m.items() if v['mode']=='assert' and not v['pass']])
keys = ['fader.clipgain.stopped.move-to-paint-p95.1x','fader.clipgain.playing.move-to-paint-p95.1x','fader.clipgain.stopped.move-to-paint-p95.6x','fader.clipgain.playing.move-to-paint-p95.6x','fader.clipgain-members.stopped.move-to-paint-p95.1x','fader.clipgain-members.playing.move-to-paint-p95.1x','fader.clipgain.stopped.release-commits','fader.clipgain.playing.release-commits','fader.clipgain-members.stopped.release-commits','fader.clipgain-members.playing.release-commits','fader.clipgain.stopped.move-components-max','fader.clipgain.playing.move-components-max']
print('| row | C211 run1 | C211 run2 | ' + ' | '.join(f'A run{i+1}' for i in range(len(mine))) + ' |')
for k in keys:
    print(f"| {k} | {c1[k]['median']} | {c2[k]['median']} | " + ' | '.join(str(m[k]['median']) for m in mine) + ' |')
