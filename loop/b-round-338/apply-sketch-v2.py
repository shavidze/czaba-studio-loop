# B338 sketch v2 (tech-lead review, b-round-338/sketch-review.md TL-1..TL-6), applied on a v1 tree (apply-sketch.py).
# Usage: python3 -I apply-sketch-v2.py <tree root>
import sys, pathlib
p = pathlib.Path(sys.argv[1]) / 'perf/studio-lab-interactions.perf.spec.ts'
s = p.read_text()
def once(old, new):
    global s
    assert s.count(old) == 1, (old[:90], s.count(old))
    s = s.replace(old, new)
# TL-4: a missing clip id is a problem, not a copy that points at the original
once("""  const clipId = await clip.getAttribute('data-clip-id');
  const header = await clipHeaderPoint(clip);""", """  const clipId = await clip.getAttribute('data-clip-id');
  if (clipId === null) {
    result.problems.push('group setup: the clip has no data-clip-id');
    return null;
  }
  const header = await clipHeaderPoint(clip);""")
# TL-5: Control is always released
once("""  const again = await clipHeaderPoint(clip);
  await page.keyboard.down('Control');
  await page.mouse.click(again.x, again.y);
  await page.keyboard.up('Control');
""", """  const again = await clipHeaderPoint(clip);
  await page.keyboard.down('Control');
  try {
    await page.mouse.click(again.x, again.y);
  } finally {
    await page.keyboard.up('Control');
  }
""")
# TL-6: settle frames before the own-lane copy read; TL-3: entry ghost read (e)
once("""      await page.mouse.move(grab.x + laneSegmentPx, grab.y, { steps: laneSegmentSteps });
      const own = await readClipState(copy);
      const crossStart = await nowIn(page);
      await page.mouse.move(grab.x + laneSegmentPx, target.y, { steps: 1 });
      await page.mouse.move(grab.x + 2 * laneSegmentPx, target.y, { steps: laneSegmentSteps });
      const cross = await readLaneGhosts(page, target.trackId);""", """      await page.mouse.move(grab.x + laneSegmentPx, grab.y, { steps: laneSegmentSteps });
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          }),
      );
      const own = await readClipState(copy);
      const crossStart = await nowIn(page);
      await page.mouse.move(grab.x + laneSegmentPx, target.y, { steps: 1 });
      const entry = await readLaneGhosts(page, target.trackId);
      await page.mouse.move(grab.x + 2 * laneSegmentPx, target.y, { steps: laneSegmentSteps });
      const cross = await readLaneGhosts(page, target.trackId);""")
once("""  const { ownCopy, t1, crossGhosts, t2, backGhosts, t3 } = await pressedGesture(""", """  const { ownCopy, t1, entryGhosts, crossGhosts, t2, backGhosts, t3 } = await pressedGesture(""")
once("""        ownCopy: own,
        t1: crossStart,
        crossGhosts: cross,""", """        ownCopy: own,
        t1: crossStart,
        entryGhosts: entry,
        crossGhosts: cross,""")
# TL-1: exactly two ghosts
once("""  if (crossGhosts.targetLane < 2) {
    failed.push(
      `(a) target-lane ${target.trackId} non-blocked ghosts ${crossGhosts.targetLane} at the cross read; want 2`,
    );
  }""", """  if (crossGhosts.targetLane !== 2) {
    failed.push(
      `(a) target-lane ${target.trackId} non-blocked ghosts ${crossGhosts.targetLane} at the cross read; want 2`,
    );
  }
  if (
    entryGhosts.targetStart === null ||
    crossGhosts.targetStart === null ||
    !(crossGhosts.targetStart > entryGhosts.targetStart)
  ) {
    failed.push(
      `(e) target-lane ghost start ${entryGhosts.targetStart} at the entry read, ${crossGhosts.targetStart} at the cross read; want it to advance`,
    );
  }""")
# TL-2: the copy's lane after the reset
once("""  const reset = await readClipState(clip);
  const copyReset = await readClipState(copy);
""", """  const reset = await readClipState(clip);
  const copyReset = await readClipState(copy);
  const resetTrackId = await clipLaneTrackId(clip);
  const copyResetTrackId = await clipLaneTrackId(copy);
""")
once("""    JSON.stringify(copyReset) !== JSON.stringify(copyBefore) ||
    (await clipLaneTrackId(clip)) !== target.clipTrackId
  ) {
    failed.push(
      `(d) after reset ${JSON.stringify(reset)} and copy ${JSON.stringify(copyReset)}, want ${JSON.stringify(before)} and ${JSON.stringify(copyBefore)}`,
    );""", """    JSON.stringify(copyReset) !== JSON.stringify(copyBefore) ||
    resetTrackId !== target.clipTrackId ||
    copyResetTrackId !== target.clipTrackId
  ) {
    failed.push(
      `(d) after reset ${JSON.stringify(reset)} on lane ${resetTrackId} and copy ${JSON.stringify(copyReset)} on lane ${copyResetTrackId}, want ${JSON.stringify(before)} and ${JSON.stringify(copyBefore)} on lane ${target.clipTrackId}`,
    );""")
once("""    [`${state}OwnCopyStart`]: ownCopy.start,
    [`${state}TargetLaneGhosts`]: crossGhosts.targetLane,""", """    [`${state}OwnCopyStart`]: ownCopy.start,
    [`${state}TargetLaneGhosts`]: crossGhosts.targetLane,
    [`${state}EntryGhostStart`]: entryGhosts.targetStart ?? '',
    [`${state}CrossGhostStart`]: crossGhosts.targetStart ?? '',""")
# TL-5: a failed setup still writes the live row 0 and removes a leftover copy
once("""      step = 'group teardown';
      await teardownGroupClips(page, group, result);
    }
""", """      step = 'group teardown';
      await teardownGroupClips(page, group, result);
    } else {
      setLive(result, rateRowId('interact.harness.drag-group-live', result.cpuRate), false, {
        setup: 'failed',
      });
      if ((await audioClips(page).count()) === 2) {
        await blurActive(page);
        await page.keyboard.press('Control+z');
        await expect(audioClips(page)).toHaveCount(1);
      }
    }
""")
p.write_text(s)
print('v2 ok')
