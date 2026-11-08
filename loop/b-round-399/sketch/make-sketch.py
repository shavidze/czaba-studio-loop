import sys
src, dst = sys.argv[1], sys.argv[2]
t = open(src).read()
def rep(old, new, count=1):
    global t
    n = t.count(old)
    assert n == count, (n, old[:80])
    t = t.replace(old, new)

# 1. helper after clipLaneTrackId
rep("""const clipLaneTrackId = (clip: Locator): Promise<string | null> =>
  clip.evaluate(
    (element) => element.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null,
  );
""", """const clipLaneTrackId = (clip: Locator): Promise<string | null> =>
  clip.evaluate(
    (element) => element.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null,
  );

const copyRevealMarginPx = 8;

const followMode = (page: Page): Promise<string | null> =>
  page.getByTestId('arrangement-follow').getAttribute('data-follow-mode');

async function readBesideClip<T>(
  page: Page,
  anchor: Locator,
  isMounted: () => Promise<boolean>,
  read: () => Promise<T>,
  problems: string[],
  label: string,
): Promise<{ value: T; revealed: boolean } | null> {
  if (await isMounted()) {
    return { value: await read(), revealed: false };
  }
  const scroller = page.getByTestId('arrangement-timeline-scroller');
  const followBefore = await followMode(page);
  const saved = await scroller.evaluate((element) => element.scrollLeft);
  const shift = await anchor.evaluate((element) => {
    const scrollerElement = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
    const header = document.querySelector('[data-testid="arrangement-track-header"]');
    if (scrollerElement === null || header === null) return null;
    const laneLeft =
      scrollerElement.getBoundingClientRect().left + header.getBoundingClientRect().width;
    return element.getBoundingClientRect().right - laneLeft;
  });
  if (shift === null) {
    problems.push(`${label}: no timeline scroller or track header to reveal the copy`);
    return null;
  }
  let from = await nowIn(page);
  await scroller.evaluate((element, left) => {
    element.scrollLeft = left;
  }, saved + shift - copyRevealMarginPx);
  await waitForQuiet(page, from, settleMs);
  const mounted = await isMounted();
  const value = mounted ? await read() : null;
  from = await nowIn(page);
  await scroller.evaluate((element, left) => {
    element.scrollLeft = left;
  }, saved);
  await waitForQuiet(page, from, settleMs);
  if ((await scroller.evaluate((element) => element.scrollLeft)) !== saved) {
    problems.push(`${label}: the timeline scroll did not return to ${saved} after the copy read`);
  }
  if (followBefore === 'on' && (await followMode(page)) !== 'on') {
    from = await nowIn(page);
    await page.getByTestId('arrangement-follow').click();
    await blurActive(page);
    await waitForQuiet(page, from, settleMs);
    if ((await followMode(page)) !== 'on') {
      problems.push(`${label}: Follow is ${await followMode(page)} after the copy read; want on`);
    }
  }
  if (!mounted || value === null) {
    problems.push(`${label}: the copy is not mounted after a reveal next to the clip`);
    return null;
  }
  return { value, revealed: true };
}
""")

# 2. GroupClips gets copyAtRest
rep("""interface GroupClips {
  clip: Locator;
  copy: Locator;
  undoBefore: string | null;
  before: ClipState;
}""", """interface GroupClips {
  clip: Locator;
  copy: Locator;
  undoBefore: string | null;
  before: ClipState;
  copyAtRest: ClipState;
  copyIdRevealed: boolean;
}""")

# 3. setup copy id discovery
rep("""  const ids = await audioClips(page).evaluateAll((clips) =>
    clips.map((element) => element.getAttribute('data-clip-id') ?? ''),
  );
  const copyId = ids.find((id) => id !== '' && id !== clipId);
  if (copyId === undefined) {
    result.problems.push(`group setup: no Ctrl+D copy next to clip ${clipId}`);
    return null;
  }
""", """  const findCopyId = async (): Promise<string | undefined> => {
    const ids = await audioClips(page).evaluateAll((clips) =>
      clips.map((element) => element.getAttribute('data-clip-id') ?? ''),
    );
    return ids.find((id) => id !== '' && id !== clipId);
  };
  const found = await readBesideClip(
    page,
    clip,
    async () => (await findCopyId()) !== undefined,
    findCopyId,
    result.problems,
    'group setup',
  );
  const copyId = found?.value;
  if (found === null || copyId === undefined) {
    result.problems.push(`group setup: no Ctrl+D copy next to clip ${clipId}`);
    return null;
  }
  const copy = clipById(page, copyId);
  const atRest = await readBesideClip(
    page,
    clip,
    async () => (await copy.count()) > 0,
    () => readClipState(copy),
    result.problems,
    'group setup',
  );
  if (atRest === null) {
    return null;
  }
""")
rep("""  return { clip, copy: clipById(page, copyId), undoBefore, before };""",
    """  return {
    clip,
    copy,
    undoBefore,
    before,
    copyAtRest: atRest.value,
    copyIdRevealed: found.revealed,
  };""")

# 4. measureGroupDrag copyBefore
rep("""  const before = await readClipState(clip);
  const copyBefore = await readClipState(copy);
  const t0 = await nowIn(page);""", """  const before = await readClipState(clip);
  const copyMountedBefore = (await copy.count()) > 0;
  const copyBefore = copyMountedBefore ? await readClipState(copy) : group.copyAtRest;
  const followAtT0 = await followMode(page);
  const t0 = await nowIn(page);""")
# 5. own read
rep("""      const own = await readClipState(copy);
      const crossStart""", """      const own = (await copy.count()) > 0 ? await readClipState(copy) : null;
      const crossStart""")
# 6. released reads
rep("""  const released = await readClipState(clip);
  const copyReleased = await readClipState(copy);
  const releasedTrackId = await clipLaneTrackId(clip);
  const copyReleasedTrackId = await clipLaneTrackId(copy);
  if (state === 'playing' && !(await isPlaying(page))) {""", """  const released = await readClipState(clip);
  const releasedTrackId = await clipLaneTrackId(clip);
  const releasedCopy = await readBesideClip(
    page,
    clip,
    async () => (await copy.count()) > 0,
    async () => ({ state: await readClipState(copy), trackId: await clipLaneTrackId(copy) }),
    result.problems,
    `${label} release read`,
  );
  if (releasedCopy === null) {
    return;
  }
  const copyReleased = releasedCopy.value.state;
  const copyReleasedTrackId = releasedCopy.value.trackId;
  if (state === 'playing' && !(await isPlaying(page))) {""")
# 7. reset reads
rep("""  const reset = await readClipState(clip);
  const copyReset = await readClipState(copy);
  const resetTrackId = await clipLaneTrackId(clip);
  const copyResetTrackId = await clipLaneTrackId(copy);

  const failed: string[] = [];
  if (ownCopy.start === copyBefore.start) {
    failed.push(`(f) the copy's start ${ownCopy.start} did not move on the own-lane read`);
  }""", """  const reset = await readClipState(clip);
  const resetTrackId = await clipLaneTrackId(clip);
  const resetCopy = await readBesideClip(
    page,
    clip,
    async () => (await copy.count()) > 0,
    async () => ({ state: await readClipState(copy), trackId: await clipLaneTrackId(copy) }),
    result.problems,
    `${label} reset read`,
  );
  if (resetCopy === null) {
    return;
  }
  const copyReset = resetCopy.value.state;
  const copyResetTrackId = resetCopy.value.trackId;

  const failed: string[] = [];
  if (ownCopy !== null && ownCopy.start === copyBefore.start) {
    failed.push(`(f) the copy's start ${ownCopy.start} did not move on the own-lane read`);
  }
  if (state === 'playing' && followAtT0 !== 'on') {
    failed.push(`(g) Follow is ${followAtT0} at the start of the playing group drag; want on`);
  }""")
# 8. detail
rep("""    [`${state}OwnCopyStart`]: ownCopy.start,""", """    [`${state}OwnCopyStart`]: ownCopy?.start ?? '',
    [`${state}OwnCopyObserved`]: ownCopy !== null,
    [`${state}CopyBeforeSource`]: copyMountedBefore ? 'mounted' : 'setup-at-rest',
    [`${state}CopyReveals`]:
      Number(group.copyIdRevealed) + Number(releasedCopy.revealed) + Number(resetCopy.revealed),
    [`${state}FollowAtT0`]: followAtT0 ?? '',""")
open(dst, 'w').write(t)
print('ok')
