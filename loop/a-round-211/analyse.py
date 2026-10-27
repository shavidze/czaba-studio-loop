import json, sys, glob
run = json.load(open(sys.argv[1]))
print('complete', run['complete'], 'durationMs', run['durationMs'], 'failures', run['failures'])
rows = {r['id']: r for r in run['rows']}
asserts = [r for r in run['rows'] if r['mode'] == 'assert']
print('rows', len(rows), 'asserts', len(asserts), 'assert fails', [r['id'] for r in asserts if r['pass'] is False])
for p in run['passes']:
    if p['problems'] or p['abortedAt']: print('pass', p)
refs = sorted(glob.glob('c-round-210/out/perf-run*.json'))
ref = [ {r['id']: r for r in json.load(open(f))['rows']} for f in refs ]
print('refs', refs)
must = lambda i: (i.startswith('harness.') or i in ('load.commits',) or i.startswith('play.idle-') or
    (any(i.startswith(f'fader.{f}.') for f in ('track','group','master','pan')) and rows[i]['kind']=='deterministic' and rows[i]['metric'] in ('components-per-commit','move-components-max','move-components-per-move','release-commits','restarts','moves-dispatched')) or
    (i.startswith('fader.clipgain.') and rows[i]['metric'] in ('moves-dispatched','restarts')))
diffs=[]
for i, r in rows.items():
    if not must(i): continue
    if r['kind'] == 'wallclock' and not i.startswith('harness.'): continue
    for k, rr in enumerate(ref):
        if i in rr and rr[i]['median'] != r['median']:
            diffs.append((i, r['kind'], r['median'], f'ref{k+1}', rr[i]['median']))
print('must-be-identical diffs:'); [print(' ', d) for d in diffs]
print('load.components', rows['load.components']['median'], rows['load.components']['samples'], [rr.get('load.components',{}).get('median') for rr in ref])
for i in sorted(rows):
    if i.startswith('fader.clipgain') and rows[i]['metric'] in ('move-components-max','move-components-per-move','release-commits','restarts','moves-dispatched','move-to-paint-p95','components-per-commit'):
        r=rows[i]; print(f"{i:62} {r['mode']:6} med {r['median']} samples {r['samples']} pass {r['pass']}  ref {[rr.get(i,{}).get('median') for rr in ref]}")
