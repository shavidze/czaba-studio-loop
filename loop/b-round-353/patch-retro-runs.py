# B round 353 -> 354: close retro_runs[353] on C round 353 PASS (D-29z1135). Run once from the loop root.
import json, pathlib, sys
P = pathlib.Path('backlog.json'); DONE = pathlib.Path('b-round-353/patch-retro-runs.done')
if DONE.exists():
    sys.exit('already applied')
b = json.loads(P.read_text())
assert b['version'] == 317
r = b['retro_runs'][-1]
assert str(r['round']) == '353' and r['status'] == 'dispatched (round 353)'
r['status'] = 'done (D-29z1135): C round 353 PASS (c-round-353.json, browserVerified true); C-R353-01/02 fixed (D-29z1136) | ' + r['status']
P.write_text(json.dumps(b, indent=2)); DONE.write_text('ok\n'); print('ok')
