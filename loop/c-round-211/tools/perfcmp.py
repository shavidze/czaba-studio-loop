# C round 211 — PERF-RUN-211 comparison: round-210 C runs vs round-211 C runs, bucketed per D-29z190.
import json, sys
R10 = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-210/out/perf-run%d.json'
R11 = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-211/out/perf-run%d.json'
def load(p):
    d = json.load(open(p)); return d, {r['id']: r for r in d['rows']}
a = [load(R10 % i) for i in (1, 2)]; b = [load(R11 % i) for i in (1, 2)]
for i, (d, rows) in enumerate(b, 1):
    asserts = [r for r in rows.values() if r['mode'] == 'assert']
    print(f'run{i}: complete={d["complete"]} rows={len(rows)} asserts={len(asserts)} failing={[r["id"] for r in asserts if not r["pass"]]} failures={d["failures"]} durationMs={d["durationMs"]}')
ids11 = b[0][1]
def must_identical(k, r):
    if r['kind'] != 'deterministic': return False
    if k.startswith('harness.') or k == 'load.commits' or k.startswith('play.idle-'): return True
    for f in ('track', 'group', 'master', 'pan'):
        if k.startswith(f'fader.{f}.'): return True
    if k.startswith('fader.clipgain.') and ('.moves-dispatched' in k or '.restarts' in k): return True
    return False
bad = []; checked = 0
for k, r in ids11.items():
    if k not in a[0][1]: continue
    if must_identical(k, r):
        checked += 1
        m10 = {a[0][1][k]['median'], a[1][1][k]['median']}
        m11 = {b[0][1][k]['median'], b[1][1][k]['median']}
        if m10 != m11 or len(m11) != 1: bad.append((k, sorted(m10, key=str), sorted(m11, key=str)))
print('must-be-identical deterministic rows checked', checked, 'differences', len(bad))
for x in bad: print('  DIFF', x)
# determinism between runs for all deterministic rows (except those exempt: release-commits)
nd = [k for k, r in ids11.items() if r['kind'] == 'deterministic' and b[0][1][k]['median'] != b[1][1][k]['median']]
print('deterministic rows differing between run1/run2:', nd)
# samples identical within a run (3 passes) for deterministic
ns = [k for k, r in ids11.items() if r['kind'] == 'deterministic' and len({json.dumps(s) for s in r['samples']}) > 1]
print('deterministic rows with non-identical pass samples run1:', ns)
# 1x vs 6x deterministic for clipgain
for k in sorted(ids11):
    if k.startswith('fader.clipgain') and r_kind(k) if False else False: pass
def show(prefix):
    for k in sorted(ids11):
        if k.startswith(prefix) and any(m in k for m in ('move-components', 'release-commits', 'restarts', 'moves-dispatched', 'move-to-paint-p95', 'components-per-commit')):
            rr = [x[1][k] for x in b]
            print(f'  {k:62s} mode={rr[0]["mode"]:6s} budget={json.dumps(rr[0]["budget"]):28s} r1={rr[0]["median"]} {rr[0]["samples"]} pass={rr[0]["pass"]} | r2={rr[1]["median"]} pass={rr[1]["pass"]}' + (f' | 210={a[0][1][k]["median"]}/{a[1][1][k]["median"]}' if k in a[0][1] else ''))
print('clipgain rows'); show('fader.clipgain.')
print('members rows'); show('fader.clipgain-members.')
for k in ('load.components', 'load.commits', 'harness.move-latency-live.sync', 'harness.move-latency-live.deferred', 'harness.move-latency-control', 'harness.move-window-live', 'fader.track.stopped.move-components-max', 'fader.track.playing.move-components-per-move'):
    if k in ids11: print(f'  {k:50s} 211={[x[1][k]["median"] for x in b]} {[x[1][k]["samples"] for x in b]} 210={[x[1][k]["median"] for x in a]} kind={ids11[k]["kind"]}')
