# B338 sketch: 26 group-drag budget rows (copied from the lane rows' shape) + drop the stale L58 sentence (gate 338 #3).
# Usage: python3 -I apply-budgets.py <tree root> <live-mode: assert|record>
import sys, json, pathlib, copy
root = pathlib.Path(sys.argv[1]); live_mode = sys.argv[2]
p = root / 'perf/budgets.interactions.json'
text = p.read_text()
rows = json.loads(text)
assert len(rows) == 193
stale = 'Record until C measures it (L58). '
n = 0
for r in rows:
    if r['id'] in ('interact.harness.drag-lane-live', 'interact.harness.drag-lane-live.6x'):
        assert r['note'].count(stale) == 1; r['note'] = r['note'].replace(stale, ''); n += 1
assert n == 2
lane = [r for r in rows if r['id'].startswith('interact.drag.lane.') or r['id'].startswith('interact.harness.drag-lane-live')]
assert len(lane) == 26, len(lane)
last = max(rows.index(r) for r in lane)
pre = 'Group drag (gesture: the \'group drag\' entries of interactionSequence; doc 168; two selected clips, the first pressed on its name bar). '
new = []
for r in lane:
    g = copy.deepcopy(r)
    g['id'] = r['id'].replace('interact.drag.lane.', 'interact.drag.group.').replace('drag-lane-live', 'drag-group-live')
    g['scenario'] = r['scenario'].replace('clip name bar cross-lane move drag', 'two-clip group name bar move drag (own lane, next lane, own lane)')
    g['metric'] = r['metric'].replace('drag-lane-live', 'drag-group-live')
    g['owner'] = 'PERF-DRAG-PREVIEW-c4-i'
    body = r['note'].split('doc 168). ', 1)[1]
    body = body.split(' Asserted since')[0]
    if g['metric'] == 'drag-group-live':
        body = ("1 only when, in both the stopped and the playing drag, (f) the Ctrl+D copy's data-clip-start moved at the own-lane read, "
                "(a) the next lane holds exactly two non-blocked lane-move ghosts at the cross read, (e) the first target-lane ghost start advances from the entry read to the cross read, (b) the document holds no lane-move ghost at the back read, "
                "(c) after release both clips stay on their own lane and moved right by the same delta, and (d) after the reset a re-read gives both clips' start states, each on its own lane. A failed group setup writes 0.")
        if live_mode == 'assert':
            g['mode'] = 'assert'; g['budget'] = {'op': '==', 'value': 1}
            body += ' Asserted from PERF-DRAG-PREVIEW stage c4-i (round 339): B sketch 1 in all passes; mutant MU-GROUP-SINGLE (Ctrl+click skipped) 0.'
        else:
            g['mode'] = 'record'; g['budget'] = None
    else:
        g['mode'] = 'record'; g['budget'] = None
    g['note'] = pre + body
    new.append(g)
rows[last + 1:last + 1] = new
assert len(rows) == 219
p.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + '\n')
print('budgets ok', len(rows))
