# B round 404 -> 405 planning: backlog v374 -> v375 (carry INFO-C404-MARKER-SEEK-RECIPE into REGRESSION-2026-11-10, L6). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-404/update-backlog-2.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 374, b['version']
BY = '2026-11-08 B round 404 -> 405 planning'
rg = [r for r in b['regression_rounds'] if r.get('id') == 'REGRESSION-2026-11-10']
assert len(rg) == 1
rg[0]['scope_additions_d29z1401'] = ['marker seek (INFO-C404-MARKER-SEEK-RECIPE): place the marker at a non-zero time, Home, then Next marker; read the clock = the marker time (round 404 row 4 left this unexercised: marker at 0 s, Next fell back to project end)']
for o in b['open_findings']:
    if o.get('id') == 'INFO-C404-MARKER-SEEK-RECIPE':
        o['status'] = 'info (D-29z1401): carried into REGRESSION-2026-11-10 scope_additions_d29z1401 | ' + o['status']
b['version'] = 375
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v374 -> v375\n')
print('ok v375')
