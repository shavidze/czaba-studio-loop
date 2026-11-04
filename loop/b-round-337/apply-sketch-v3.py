# Usage: python3 -I apply-sketch-v3.py <store-root>  (run after apply-sketch.py and B's hand-added DP49; v3 = tech-lead TL-1 fix,
# performance-optimizer DP49 + liveness hardening, and the lane budgets). Refuses to run inside the real store.
import sys, pathlib, json
root = pathlib.Path(sys.argv[1]).resolve()
if str(root) == '/home/runner/czaba-project/store':
    sys.exit('refusing to edit the real store')

def edit(rel, pairs):
    p = root / rel
    s = p.read_text()
    for old, new, count in pairs:
        n = s.count(old)
        if n != count:
            sys.exit(f'{rel}: expected {count} hit(s), got {n}: {old[:90]!r}')
        s = s.replace(old, new)
    p.write_text(s)

edit('app/components/arrangement/ArrangementClip.tsx', [
    ("""          if (getArrangement() !== gesture.before) {
            previewGeometry(gesture.before);
          }
""", """          previewGeometry(gesture.before);
""", 1),
])

edit('app/lib/arrangement/__tests__/drag-preview-render.test.tsx', [
    ("""    expect(live(api).clipLaneDrag?.ghosts[0]).toMatchObject({ trackId: 'sfx', start: 3 });
    renderLog.counts.clear();""", """    expect(live(api).clipLaneDrag?.ghosts[0]).toMatchObject({ trackId: 'sfx', start: 3 });
    expect(previewOf(api)).toBeNull();
    expect(live(api).getArrangement()).toBe(live(api).arrangement);
    expect(live(api).isArrangementPreviewActive()).toBe(true);
    renderLog.counts.clear();""", 1),
])

SP = 'perf/studio-lab-interactions.perf.spec.ts'
edit(SP, [
    ("""interface LaneGhostRead {
  targetLane: number;
  document: number;
}
""", """interface LaneGhostRead {
  targetLane: number;
  document: number;
  targetStart: number | null;
}
""", 1),
    ("""    const ghosts = [...document.querySelectorAll('[data-testid="arrangement-lane-move-ghost"]')];
    return {
      targetLane: ghosts.filter(
        (ghost) =>
          ghost.closest('[data-track-id]')?.getAttribute('data-track-id') === laneTrackId &&
          ghost.getAttribute('data-blocked') === 'false',
      ).length,
      document: ghosts.length,
    };""", """    const ghosts = [...document.querySelectorAll('[data-testid="arrangement-lane-move-ghost"]')];
    const target = ghosts.filter(
      (ghost) =>
        ghost.closest('[data-track-id]')?.getAttribute('data-track-id') === laneTrackId &&
        ghost.getAttribute('data-blocked') === 'false',
    );
    const start = target.at(0)?.getAttribute('data-ghost-start');
    return {
      targetLane: target.length,
      document: ghosts.length,
      targetStart: start === undefined || start === null ? null : Number(start),
    };""", 1),
    ("""  const { t1, crossGhosts, t2, backGhosts, t3 } = await pressedGesture(page, grab, async () => {""",
     """  const { t1, entryGhosts, crossGhosts, t2, backGhosts, t3 } = await pressedGesture(
    page,
    grab,
    async () => {""", 1),
    ("""    await page.mouse.move(grab.x + laneSegmentPx, target.y, { steps: 1 });
    await page.mouse.move(grab.x + 2 * laneSegmentPx, target.y, { steps: laneSegmentSteps });""",
     """    await page.mouse.move(grab.x + laneSegmentPx, target.y, { steps: 1 });
    const entry = await readLaneGhosts(page, target.trackId);
    await page.mouse.move(grab.x + 2 * laneSegmentPx, target.y, { steps: laneSegmentSteps });""", 1),
    ("""    return {
      t1: crossStart,
      crossGhosts: cross,""", """    return {
      t1: crossStart,
      entryGhosts: entry,
      crossGhosts: cross,""", 1),
    ("""      t3: await nowIn(page),
    };
  });
  const tUp = await nowIn(page);""", """      t3: await nowIn(page),
    };
    },
  );
  const tUp = await nowIn(page);""", 1),
    ("""  if (backGhosts.document !== 0) {""", """  if (
    entryGhosts.targetStart === null ||
    crossGhosts.targetStart === null ||
    !(crossGhosts.targetStart > entryGhosts.targetStart)
  ) {
    failed.push(
      `(e) target-lane ghost start ${entryGhosts.targetStart} at the entry read, ${crossGhosts.targetStart} at the cross read; want it to advance`,
    );
  }
  if (backGhosts.document !== 0) {""", 1),
    ("""    [`${state}TargetLaneGhosts`]: crossGhosts.targetLane,""", """    [`${state}TargetLaneGhosts`]: crossGhosts.targetLane,
    [`${state}EntryGhostStart`]: entryGhosts.targetStart ?? '',
    [`${state}CrossGhostStart`]: crossGhosts.targetStart ?? '',""", 1),
])

BUD = root / 'perf/budgets.interactions.json'
rows = json.loads(BUD.read_text())
ASSERT = {
    'interact.drag.lane.stopped.move-components-per-move': ('<=', 25),
    'interact.drag.lane.playing.move-components-per-move': ('<=', 25),
    'interact.drag.lane.stopped.release-commits': ('==', 1),
    'interact.drag.lane.playing.release-commits': ('==', 1),
    'interact.drag.lane.playing.move-restarts': ('==', 0),
    'interact.harness.drag-lane-live': ('==', 1),
    'interact.harness.drag-lane-live.6x': ('==', 1),
}
seen = 0
for r in rows:
    if r['id'] in ASSERT:
        op, value = ASSERT[r['id']]
        assert r['mode'] == 'record', r['id']
        r['mode'] = 'assert'
        r['budget'] = {'op': op, 'value': value}
        r['owner'] = 'PERF-DRAG-PREVIEW-c3-ii' if not r['id'].startswith('interact.harness.') else r['owner']
        if r['id'].endswith('move-components-per-move'):
            r['note'] += ' Asserted since PERF-DRAG-PREVIEW stage c3-ii (round 338): the cross-lane ghosts left the provider (B sketch 24.906/move at 1x and 6x; HEAD 58.969; mutant A, the per-move history write restored, 25.25).'
        elif r['id'].endswith('release-commits'):
            r['note'] += ' Asserted since PERF-DRAG-PREVIEW stage c3-ii (round 338): one commit after the in-page pointerup, one history entry per gesture.'
        elif r['id'].endswith('move-restarts'):
            r['note'] += ' Asserted since PERF-DRAG-PREVIEW stage c3-ii (round 338): a cross-lane move preview never restarts the playing graph.'
        else:
            r['note'] += ' Asserted since PERF-DRAG-PREVIEW stage c3-ii (round 338); (e) the target-lane ghost start advances from the entry read to the cross read.'
        seen += 1
assert seen == len(ASSERT), seen
BUD.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + '\n')
p = root / SP
s = p.read_text()
head = "  const { t1, entryGhosts, crossGhosts, t2, backGhosts, t3 } = await pressedGesture(\n    page,\n    grab,\n    async () => {\n"
a = s.index(head) + len(head)
b = s.index("    },\n  );\n  const tUp = await nowIn(page);", a)
s = s[:a] + ''.join(('  ' + l if l.strip() else l) for l in s[a:b].splitlines(True)) + s[b:]
p.write_text(s)
print('sketch v3 applied')
