# B338 sketch for PERF-DRAG-PREVIEW c4-i: group (2 selected clips) drag rows in the interactions perf spec, record.
# Usage: python3 -I apply-sketch.py <tree root>
import sys, pathlib
root = pathlib.Path(sys.argv[1])
spec = root / 'perf/studio-lab-interactions.perf.spec.ts'
s = spec.read_text()

def once(old, new):
    global s
    assert s.count(old) == 1, (old[:80], s.count(old))
    s = s.replace(old, new)

once("""  'Space -> stopped (interact.play.stop-*)',
""", """  'Space -> stopped (interact.play.stop-*)',
  `group setup: click the clip name bar, Ctrl+D (a copy right after it), Ctrl+click the first clip's name bar (2 clips selected)`,
  `group drag stopped: press on the first clip's name bar; ${laneSegmentSteps} steps +${laneSegmentPx} px on its own lane; 1 step down into the next lane, then ${laneSegmentSteps} steps +${laneSegmentPx} px there; 1 step back up, then ${laneSegmentSteps} steps +${laneSegmentPx} px on its own lane; release; reset with Ctrl+Z (interact.drag.group.stopped.*, interact.harness.drag-group-live)`,
  `group drag playing: Space, then the same gesture after Home (seek to 0); reset with Ctrl+Z; Space (interact.drag.group.playing.*, interact.harness.drag-group-live)`,
  'group teardown: Ctrl+Z (the Ctrl+D copy is removed; 1 clip, Undo back at its start entry)',
""")

once("""async function measureZoom(
  page: Page,
  clipCount: 1 | 30,""", """interface GroupClips {
  clip: Locator;
  copy: Locator;
  undoBefore: string | null;
  before: ClipState;
}

async function setupGroupClips(
  page: Page,
  clip: Locator,
  result: InteractionPassResult,
): Promise<GroupClips | null> {
  const undoBefore = await undoTitle(page);
  const before = await readClipState(clip);
  const clipId = await clip.getAttribute('data-clip-id');
  const header = await clipHeaderPoint(clip);
  await page.mouse.click(header.x, header.y);
  await blurActive(page);
  const from = await nowIn(page);
  await page.keyboard.press('Control+d');
  await expect(audioClips(page)).toHaveCount(2);
  await waitForQuiet(page, from, settleMs);
  const ids = await audioClips(page).evaluateAll((clips) =>
    clips.map((element) => element.getAttribute('data-clip-id') ?? ''),
  );
  const copyId = ids.find((id) => id !== '' && id !== clipId);
  if (copyId === undefined) {
    result.problems.push(`group setup: no Ctrl+D copy next to clip ${clipId}`);
    return null;
  }
  const again = await clipHeaderPoint(clip);
  await page.keyboard.down('Control');
  await page.mouse.click(again.x, again.y);
  await page.keyboard.up('Control');
  await waitForQuiet(page, await nowIn(page), settleMs);
  return { clip, copy: clipById(page, copyId), undoBefore, before };
}

async function teardownGroupClips(
  page: Page,
  group: GroupClips,
  result: InteractionPassResult,
): Promise<void> {
  const from = await nowIn(page);
  await blurActive(page);
  await page.keyboard.press('Control+z');
  await expect(audioClips(page)).toHaveCount(1);
  await waitForQuiet(page, from, settleMs);
  const after = await readClipState(group.clip);
  if (JSON.stringify(after) !== JSON.stringify(group.before)) {
    result.problems.push(
      `group teardown: clip ${JSON.stringify(after)}, want ${JSON.stringify(group.before)}`,
    );
  }
  if ((await undoTitle(page)) !== group.undoBefore) {
    result.problems.push('group teardown: Undo history not back at its start entry');
  }
}

async function measureGroupDrag(
  page: Page,
  state: PlaybackState,
  group: GroupClips,
  result: InteractionPassResult,
): Promise<void> {
  const { clip, copy } = group;
  const baseId = `interact.drag.group.${state}`;
  const label = `${baseId} (${result.cpuRate}x)`;
  if (state === 'playing') {
    const from = await nowIn(page);
    await blurActive(page);
    await page.keyboard.press('Home');
    await waitForQuiet(page, from, settleMs);
    if (!(await isPlaying(page))) result.problems.push(`playback not running before ${label}`);
  }
  const grab = await clipHeaderPoint(clip);
  const target = await emptyLanePointAfterClip(clip);
  const undoBefore = await undoTitle(page);
  const before = await readClipState(clip);
  const copyBefore = await readClipState(copy);
  const t0 = await nowIn(page);
  const { ownCopy, t1, crossGhosts, t2, backGhosts, t3 } = await pressedGesture(
    page,
    grab,
    async () => {
      await page.mouse.move(grab.x + laneSegmentPx, grab.y, { steps: laneSegmentSteps });
      const own = await readClipState(copy);
      const crossStart = await nowIn(page);
      await page.mouse.move(grab.x + laneSegmentPx, target.y, { steps: 1 });
      await page.mouse.move(grab.x + 2 * laneSegmentPx, target.y, { steps: laneSegmentSteps });
      const cross = await readLaneGhosts(page, target.trackId);
      const crossEnd = await nowIn(page);
      await page.mouse.move(grab.x + 2 * laneSegmentPx, grab.y, { steps: 1 });
      await page.mouse.move(grab.x + 3 * laneSegmentPx, grab.y, { steps: laneSegmentSteps });
      const back = await readLaneGhosts(page, target.trackId);
      return {
        ownCopy: own,
        t1: crossStart,
        crossGhosts: cross,
        t2: crossEnd,
        backGhosts: back,
        t3: await nowIn(page),
      };
    },
  );
  const tUp = await nowIn(page);
  const tEnd = await waitForQuiet(page, tUp, settleMs);
  const whole = await snapshot(page, t0, tEnd);
  const released = await readClipState(clip);
  const copyReleased = await readClipState(copy);
  const releasedTrackId = await clipLaneTrackId(clip);
  const copyReleasedTrackId = await clipLaneTrackId(copy);
  if (state === 'playing' && !(await isPlaying(page))) {
    result.problems.push(`playback not running after ${label}`);
  }

  const pointerSpan = dragWindow(whole);
  if (pointerSpan === null) {
    result.problems.push(`${label}: no in-page pointerdown, pointermove and pointerup sequence`);
  } else {
    const { moves, firstMove, up, commits: wholeCommits, release } = pointerSpan;
    const inCross = (t: number): boolean => t > t1 && t < t2;
    const inLane = (t: number): boolean => (t > firstMove && t < t1) || (t > t2 && t < up);
    const crossCommits = whole.commits.filter((commit) => inCross(commit.t));
    const crossMoves = whole.moves.filter(inCross);
    const laneCommits = whole.commits.filter((commit) => inLane(commit.t));
    const laneMoves = whole.moves.filter(inLane);
    const put = rowWriter(result, baseId);
    const wholeDetail = {
      movesInWindow: moves.length,
      windowCommits: wholeCommits.length,
      settleMs: roundTo(tEnd - tUp, 0),
    };
    put('move-components-per-move', {
      value: componentsPerMove(wholeCommits, moves.length),
      detail: { ...wholeDetail, componentsSum: sumRendered(wholeCommits) },
    });
    put('move-components-max', { value: maxRendered(wholeCommits), detail: wholeDetail });
    put('release-commits', {
      value: release.length,
      detail: { releaseComponentsMax: maxRendered(release) },
    });
    put('cross-components-per-move', {
      value: componentsPerMove(crossCommits, crossMoves.length),
      detail: {
        movesInWindow: crossMoves.length,
        windowCommits: crossCommits.length,
        componentsSum: sumRendered(crossCommits),
      },
    });
    put('lane-components-per-move', {
      value: componentsPerMove(laneCommits, laneMoves.length),
      detail: {
        movesInWindow: laneMoves.length,
        windowCommits: laneCommits.length,
        componentsSum: sumRendered(laneCommits),
        backMoves: whole.moves.filter((t) => t > t2 && t < t3).length,
      },
    });
    if (state === 'playing') {
      const { moveStarts, releaseStarts } = pointerSpan;
      put('move-restarts', { value: moveStarts.length, detail: startTasks(moveStarts) });
      put('release-restarts', { value: releaseStarts.length, detail: startTasks(releaseStarts) });
    }
  }

  await resetAfterDrag(page, clip, 'move', grab, undoBefore, before, label, result.problems);
  const reset = await readClipState(clip);
  const copyReset = await readClipState(copy);

  const failed: string[] = [];
  if (ownCopy.start === copyBefore.start) {
    failed.push(`(f) the copy's start ${ownCopy.start} did not move on the own-lane read`);
  }
  if (crossGhosts.targetLane < 2) {
    failed.push(
      `(a) target-lane ${target.trackId} non-blocked ghosts ${crossGhosts.targetLane} at the cross read; want 2`,
    );
  }
  if (backGhosts.document !== 0) {
    failed.push(`(b) document ghosts ${backGhosts.document} at the back read`);
  }
  const releaseDelta = Number(released.start) - Number(before.start);
  const copyDelta = Number(copyReleased.start) - Number(copyBefore.start);
  if (
    releasedTrackId !== target.clipTrackId ||
    copyReleasedTrackId !== target.clipTrackId ||
    !(releaseDelta > 0) ||
    Math.abs(releaseDelta - copyDelta) > 0.0015
  ) {
    failed.push(
      `(c) after release lanes ${releasedTrackId}/${copyReleasedTrackId} (want ${target.clipTrackId}), deltas ${releaseDelta}/${copyDelta}`,
    );
  }
  if (
    JSON.stringify(reset) !== JSON.stringify(before) ||
    JSON.stringify(copyReset) !== JSON.stringify(copyBefore) ||
    (await clipLaneTrackId(clip)) !== target.clipTrackId
  ) {
    failed.push(
      `(d) after reset ${JSON.stringify(reset)} and copy ${JSON.stringify(copyReset)}, want ${JSON.stringify(before)} and ${JSON.stringify(copyBefore)}`,
    );
  }
  const live = failed.length === 0;
  setLive(result, rateRowId('interact.harness.drag-group-live', result.cpuRate), live, {
    [`${state}OwnCopyStart`]: ownCopy.start,
    [`${state}TargetLaneGhosts`]: crossGhosts.targetLane,
    [`${state}BackDocumentGhosts`]: backGhosts.document,
    [`${state}ReleaseDelta`]: roundTo(releaseDelta, 3),
    [`${state}CopyDelta`]: roundTo(copyDelta, 3),
    [`${state}Reset`]: JSON.stringify(reset),
  });
  for (const failure of failed) {
    result.problems.push(`${label}: group-drag liveness ${failure}`);
  }
}

async function measureZoom(
  page: Page,
  clipCount: 1 | 30,""")

once("""    step = 'pause';
    await measurePlayback(page, false, result);
""", """    step = 'pause';
    await measurePlayback(page, false, result);
    step = 'group setup';
    const group = await setupGroupClips(page, clip, result);
    if (group !== null) {
      step = 'drag group stopped';
      await measureGroupDrag(page, 'stopped', group, result);
      step = 'play for the group drag';
      await setPlayback(page, true);
      await waitForPlaybackSettled(page, result.problems, 'play for the group drag');
      step = 'drag group playing';
      await measureGroupDrag(page, 'playing', group, result);
      step = 'stop after the group drag';
      await setPlayback(page, false);
      step = 'group teardown';
      await teardownGroupClips(page, group, result);
    }
""")
spec.write_text(s)
print('spec ok')
