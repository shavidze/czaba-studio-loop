"""B round 359 -> 360 addendum (after the advisor review): status-write signal + v3 stop position. Idempotent."""
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
B = os.path.join(L, 'backlog.json'); done = os.path.join(L, 'b-round-359/update-backlog-addendum.done')
if os.path.exists(done): sys.exit('already applied')
b = json.load(open(B, encoding='utf-8'))
assert b['version'] == 323
b['architecture_signals'].append({'id': 'SIG-R360-STATUS-WRITE-RENDERS-WORKSPACE', 'origin': 'B round 359 -> 360 planning (MU-B perf run, advisor)', 'note': 'One setStatus with a new text inside the Play/Stop window raises interact.play.start/stop-components 28 -> 99 (b-round-359/perf-mu-b-results/latest-interactions.json): a status write re-renders the provider value and about 71 components. The 28-component Play assert holds only because Space does not change the status in the harness scenario. Input for PERF-10b / PERF-11 planning (a status store or leaf subscriber); related A-R327-ARCH-STATUS-ONE-SOURCE and GATE253-ARCH-STATUS-SCOPE. Not scheduled.', 'added': '2026-11-06 B round 359 -> 360 planning'})
for d in b['decisions_log_b']:
    if d['id'] == 'D-29z1165':
        d['text'] += ' Addendum: after the advisor review the probe creates its output folder and was re-run (v2 stop 00:04.002, v3 stop 00:04.011); K7 excludes the root-lane paths; K12 pins doc 234 by content; doc 234 l.4 final md5 prefix 5807ea0e. Signal SIG-R360-STATUS-WRITE-RENDERS-WORKSPACE added.'
open(B, 'w', encoding='utf-8').write(json.dumps(b, indent=2)); open(done, 'w').write('ok\n'); print('addendum ok')
