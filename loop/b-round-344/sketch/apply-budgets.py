# B344 sketch: c5-ii budgets. Usage: python3 -I apply-budgets.py <store-root>. Keeps key order and 2-space layout.
import json, pathlib, sys
p = pathlib.Path(sys.argv[1]) / 'perf/budgets.interactions.json'
rows = json.loads(p.read_text())
SK = 'B sketch 23.617/move (round 345 planning, b-round-344/perf-sketch-results); HEAD 98.35 (C round 344)'
ASSERT = {
    'interact.drag.video.stopped.move-components-per-move': ('<=', 24, 'Asserted since PERF-DRAG-PREVIEW stage c5-ii (round 345): the video clip preview left the provider history (' + SK + '; the audio lane move is 22.8).'),
    'interact.drag.video.stopped.release-commits': ('==', 1, 'Asserted since PERF-DRAG-PREVIEW stage c5-ii (round 345): the release commits once (B sketch and HEAD 1).'),
    'interact.drag.video.playing.release-commits': ('==', 1, 'Asserted since PERF-DRAG-PREVIEW stage c5-ii (round 345): the release commits once (B sketch and HEAD 1).'),
    'interact.drag.video.playing.move-restarts': ('==', 0, 'Asserted since PERF-DRAG-PREVIEW stage c5-ii (round 345): no graph restart while a video clip is dragged during playback (B sketch and HEAD 0).'),
    'interact.harness.drag-video-live': ('==', 1, 'Asserted since PERF-DRAG-PREVIEW stage c5-ii (round 345): both video drags change data-clip-start start -> mid -> end from the store preview (B sketch 1 in 3/3 passes).'),
}
done = 0
for r in rows:
    a = ASSERT.get(r['id'])
    if a:
        assert r['mode'] == 'record' and r['budget'] is None and r['owner'] == 'PERF-DRAG-PREVIEW-c5-i', r['id']
        r['mode'] = 'assert'
        r['budget'] = {'op': a[0], 'value': a[1]}
        r['owner'] = 'PERF-DRAG-PREVIEW-c5-ii'
        r['note'] = r['note'] + ' ' + a[2]
        done += 1
    elif r['id'] == 'interact.drag.video.playing.move-components-per-move':
        assert r['kind'] == 'wallclock'
        r['note'] = r['note'] + ' Stage c5-ii (round 345): still wallclock, B sketch passes 23.617, 23.617, 23.65 (HEAD 98.35).'
        done += 1
    elif r['id'] in ('interact.drag.video.stopped.move-components-max', 'interact.drag.video.playing.move-components-max'):
        r['note'] = r['note'] + ' Stage c5-ii (round 345): B sketch 25 (HEAD 100); record, as every move/lane/group max row.'
        done += 1
assert done == 8, done
p.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')
print('ok')
