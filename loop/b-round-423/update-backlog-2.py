# B round 423 -> 424, second pass after the close advisor call (v400, no version bump). Run once from the loop root.
import json, os, sys
DONE = 'b-round-423/update-backlog-2.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
if b.get('version') != 400 or b['decisions_log_b'][-1]['id'] != 'D-29z1482':
    sys.exit('unexpected backlog state')
BY = '2026-11-10 B round 423 -> 424 planning'
b['retro_candidates'].append({'id': 'RC-R423-PERF-SPEC-ON-STRUCTURE', 'decision': 'D-29z1482', 'status': 'candidate for RETRO 435',
    'note': 'any task that changes a component fiber structure (shell, memo split, wrapper) runs the whole perf suite on the sketch; round 409 ran only a leaf-name probe and C-R423-01 surfaced 14 rounds later (test:perf is not a gate row)'})
b['open_findings'].append({'id': 'INFO-B423-LANE-RESTORE-PARTIAL', 'severity': 'info', 'origin': 'B pre-check', 'status': 'open (D-29z1481): record only; C-R423-01 closes on its 17 ids',
    'title': 'the round-424 sketch returns the 17 failing ids to round-404 values; record-only or within-budget rows stay above round 404: zoom components 41 -> 45, move/lane move-components-max 40 -> 44, group max 44 -> 48, move/lane/group per-move +0.2 to +0.5; round 409 saving survives (play start/stop components 11 -> 7)',
    'evidence': 'b-round-423/perf-sketch/compare-404-423-sketch.txt', 'repro': 'compare c-round-404/perf/interactions.json with b-round-423/perf-sketch/latest-interactions.json', 'added': BY})
open(p, 'w', encoding='utf-8').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('applied\n')
print('ok')
