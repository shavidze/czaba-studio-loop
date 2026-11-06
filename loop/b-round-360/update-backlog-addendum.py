"""B round 360 -> 361 addendum after the advisor review: D-29z1170 gains MU-7, the HEAD browser baseline and the final-sketch checks. Idempotent."""
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = os.path.join(L, 'b-round-360/update-backlog-addendum.done')
if os.path.exists(done):
    sys.exit('already applied')
B = os.path.join(L, 'backlog.json'); b = json.load(open(B, encoding='utf-8'))
assert b['version'] == 324
for d in b['decisions_log_b']:
    if d['id'] == 'D-29z1170':
        d['text'] += (' | Addendum (advisor review): MU-7 (provider setActiveTrackId schedules setStatus 100 ms later) is the red-proof for click.commits <= 2: with the asserting budgets commits 3 x3 and components 113 x3 (42,0,71) red as predicted, 20 further drag rows red (recorded); sketch with asserting budgets 95/95 0 NEW, MU-1 red only on click.components (82). '
                      'Final sketch: perf-lib 40/40, full suite 248 files / 3643 tests rc 0. HEAD 93ea6c1 browser baseline for ACTIVE-LANE, GROUP-RING and PASTE-LANE: b-round-360/lane-probe/head-1440x900.json and head-1280x720.json.')
open(B, 'w', encoding='utf-8').write(json.dumps(b, indent=2))
open(done, 'w').write('ok\n'); print('addendum applied')
