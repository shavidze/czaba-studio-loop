# Usage: python3 -I apply-sketch.py <store-root>  (applies B's round-337 sketch; refuses to run inside the real store)
import sys, json, pathlib
root = pathlib.Path(sys.argv[1]).resolve()
if str(root) == '/home/runner/czaba-project/store':
    sys.exit('refusing to edit the real store')
spec = root / 'perf/studio-lab-interactions.perf.spec.ts'
s = spec.read_text()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f'expected {count} hit(s), got {n}: {old[:80]!r}')
    s = s.replace(old, new)

# S3: named lane segment constants
rep("const dragDistancePx = 120;\n",
    "const dragDistancePx = 120;\nconst laneSegmentSteps = 10;\nconst laneSegmentPx = 40;\n")
rep("${dragSteps / 6} steps +${dragDistancePx / 3} px", "${laneSegmentSteps} steps +${laneSegmentPx} px", 6)
# INFO-A335: sequence order (Ctrl+wheel runs after the final Space)
rep("""zoom with ${clipsTarget} clips: keys, then the in-first path (5 x "=", 5 x "-"), the out-first path (5 x "-", 5 x "=") and Ctrl+wheel out-first (5 x deltaY +100, 5 x -100) with the zoom probe (interact.zoom.30.*, interact.zoom.30.in/out/wheel.*), Space, Home, fade-in drag on the first clip (interact.drag.fade.30.playing.*), Space`,""",
    """zoom with ${clipsTarget} clips: keys, then the in-first path (5 x "=", 5 x "-") and the out-first path (5 x "-", 5 x "=") with the zoom probe (interact.zoom.30.*, interact.zoom.30.in/out.*), Space, Home, fade-in drag on the first clip (interact.drag.fade.30.playing.*), Space, then Ctrl+wheel out-first (5 x deltaY +100, 5 x -100) with the zoom probe (interact.zoom.30.wheel.*)`,""")

# ARCH-R335: shared helpers, placed before resetAfterDrag
rep("""async function resetAfterDrag(""", """interface DragWindow {
  moves: number[];
  firstMove: number;
  up: number;
  commits: PerfWindowSnapshot['commits'];
  release: PerfWindowSnapshot['commits'];
  moveStarts: PerfWindowSnapshot['starts'];
  releaseStarts: PerfWindowSnapshot['starts'];
}

function dragWindow(whole: PerfWindowSnapshot): DragWindow | null {
  const downAt = whole.downs.at(-1);
  const up = downAt === undefined ? undefined : whole.ups.find((t) => t > downAt);
  if (downAt === undefined || up === undefined) return null;
  const moves = whole.moves.filter((t) => t > downAt && t < up);
  const firstMove = moves.at(0);
  if (firstMove === undefined) return null;
  const inWhole = (t: number): boolean => t > firstMove && t < up;
  return {
    moves,
    firstMove,
    up,
    commits: whole.commits.filter((commit) => inWhole(commit.t)),
    release: whole.commits.filter((commit) => commit.t >= up),
    moveStarts: whole.starts.filter((entry) => inWhole(entry.t)),
    releaseStarts: whole.starts.filter((entry) => entry.t >= up),
  };
}

const componentsPerMove = (commits: readonly { rendered: number }[], count: number): number =>
  roundTo(count ? sumRendered(commits) / count : 0, 3);

const rowWriter =
  (result: InteractionPassResult, baseId: string) =>
  (metric: string, sample: PerfSample): void => {
    result.samples.set(rateRowId(`${baseId}.${metric}`, result.cpuRate), sample);
  };

async function pressedGesture<T>(
  page: Page,
  grab: GrabPoint,
  gesture: () => Promise<T>,
): Promise<T> {
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  let value: T;
  try {
    value = await gesture();
  } catch (error) {
    await page.mouse.up().catch(() => undefined);
    throw error;
  }
  await page.mouse.up();
  return value;
}

async function resetAfterDrag(""")

# measureDrag gesture
rep("""  const t0 = await nowIn(page);
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x + dragDistancePx / 2, grab.y, { steps: dragSteps / 2 });
  const mid = await readClipState(clip);
  await page.mouse.move(grab.x + dragDistancePx, grab.y, { steps: dragSteps / 2 });
  const end = await readClipState(clip);
  await page.mouse.up();
  const tUp = await nowIn(page);""", """  const t0 = await nowIn(page);
  const { mid, end } = await pressedGesture(page, grab, async () => {
    await page.mouse.move(grab.x + dragDistancePx / 2, grab.y, { steps: dragSteps / 2 });
    const midState = await readClipState(clip);
    await page.mouse.move(grab.x + dragDistancePx, grab.y, { steps: dragSteps / 2 });
    return { mid: midState, end: await readClipState(clip) };
  });
  const tUp = await nowIn(page);""")

# measureDrag window
rep("""  const downAt = whole.downs.at(-1);
  const up = downAt === undefined ? undefined : whole.ups.find((t) => t > downAt);
  const moves =
    downAt === undefined || up === undefined ? [] : whole.moves.filter((t) => t > downAt && t < up);
  const firstMove = moves.at(0);
  if (downAt === undefined || up === undefined || firstMove === undefined) {
    result.problems.push(`${label}: no in-page pointerdown, pointermove and pointerup sequence`);
  } else {
    const inWindow = whole.commits.filter((commit) => commit.t > firstMove && commit.t < up);
    const release = whole.commits.filter((commit) => commit.t >= up);
    const moveStarts = whole.starts.filter((entry) => entry.t > firstMove && entry.t < up);
    const releaseStarts = whole.starts.filter((entry) => entry.t >= up);
    const put = (metric: string, sample: PerfSample): void => {
      result.samples.set(rateRowId(`${baseId}.${metric}`, result.cpuRate), sample);
    };
    const windowDetail = {
      movesInWindow: moves.length,
      windowCommits: inWindow.length,
      settleMs: roundTo(tEnd - tUp, 0),
    };
    const perMove = roundTo(moves.length ? sumRendered(inWindow) / moves.length : 0, 3);
    if (measure.rows === 'all') {""", """  const pointerSpan = dragWindow(whole);
  if (pointerSpan === null) {
    result.problems.push(`${label}: no in-page pointerdown, pointermove and pointerup sequence`);
  } else {
    const { moves, commits: inWindow, release, moveStarts, releaseStarts } = pointerSpan;
    const put = rowWriter(result, baseId);
    const windowDetail = {
      movesInWindow: moves.length,
      windowCommits: inWindow.length,
      settleMs: roundTo(tEnd - tUp, 0),
    };
    const perMove = componentsPerMove(inWindow, moves.length);
    if (measure.rows === 'all') {""")

# measureLaneDrag constants and gesture
rep("""  const s = dragSteps / 6;
  const d = dragDistancePx / 3;

  const t0 = await nowIn(page);
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x + d, grab.y, { steps: s });
  const t1 = await nowIn(page);
  await page.mouse.move(grab.x + d, target.y, { steps: 1 });
  await page.mouse.move(grab.x + 2 * d, target.y, { steps: s });
  const crossGhosts = await readLaneGhosts(page, target.trackId);
  const t2 = await nowIn(page);
  await page.mouse.move(grab.x + 2 * d, grab.y, { steps: 1 });
  await page.mouse.move(grab.x + 3 * d, grab.y, { steps: s });
  const backGhosts = await readLaneGhosts(page, target.trackId);
  const t3 = await nowIn(page);
  await page.mouse.up();
  const tUp = await nowIn(page);""", """  const t0 = await nowIn(page);
  const { t1, crossGhosts, t2, backGhosts, t3 } = await pressedGesture(page, grab, async () => {
    await page.mouse.move(grab.x + laneSegmentPx, grab.y, { steps: laneSegmentSteps });
    const crossStart = await nowIn(page);
    await page.mouse.move(grab.x + laneSegmentPx, target.y, { steps: 1 });
    await page.mouse.move(grab.x + 2 * laneSegmentPx, target.y, { steps: laneSegmentSteps });
    const cross = await readLaneGhosts(page, target.trackId);
    const crossEnd = await nowIn(page);
    await page.mouse.move(grab.x + 2 * laneSegmentPx, grab.y, { steps: 1 });
    await page.mouse.move(grab.x + 3 * laneSegmentPx, grab.y, { steps: laneSegmentSteps });
    const back = await readLaneGhosts(page, target.trackId);
    return {
      t1: crossStart,
      crossGhosts: cross,
      t2: crossEnd,
      backGhosts: back,
      t3: await nowIn(page),
    };
  });
  const tUp = await nowIn(page);""")

# measureLaneDrag window
rep("""  const downAt = whole.downs.at(-1);
  const up = downAt === undefined ? undefined : whole.ups.find((t) => t > downAt);
  const moves =
    downAt === undefined || up === undefined ? [] : whole.moves.filter((t) => t > downAt && t < up);
  const firstMove = moves.at(0);
  if (downAt === undefined || up === undefined || firstMove === undefined) {
    result.problems.push(`${label}: no in-page pointerdown, pointermove and pointerup sequence`);
  } else {
    const inWhole = (t: number): boolean => t > firstMove && t < up;
    const inCross = (t: number): boolean => t > t1 && t < t2;
    const inLane = (t: number): boolean => (t > firstMove && t < t1) || (t > t2 && t < up);
    const wholeCommits = whole.commits.filter((commit) => inWhole(commit.t));
    const crossCommits = whole.commits.filter((commit) => inCross(commit.t));
    const crossMoves = whole.moves.filter(inCross);
    const laneCommits = whole.commits.filter((commit) => inLane(commit.t));
    const laneMoves = whole.moves.filter(inLane);
    const release = whole.commits.filter((commit) => commit.t >= up);
    const put = (metric: string, sample: PerfSample): void => {
      result.samples.set(rateRowId(`${baseId}.${metric}`, result.cpuRate), sample);
    };
    const settle = roundTo(tEnd - tUp, 0);
    const perMove = (commits: readonly { rendered: number }[], count: number): number =>
      roundTo(count ? sumRendered(commits) / count : 0, 3);
    const wholeDetail = {""", """  const pointerSpan = dragWindow(whole);
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
    const settle = roundTo(tEnd - tUp, 0);
    const wholeDetail = {""")
rep("value: perMove(wholeCommits, moves.length)", "value: componentsPerMove(wholeCommits, moves.length)")
rep("value: perMove(crossCommits, crossMoves.length)", "value: componentsPerMove(crossCommits, crossMoves.length)")
rep("value: perMove(laneCommits, laneMoves.length)", "value: componentsPerMove(laneCommits, laneMoves.length)")
rep("""    if (state === 'playing') {
      const moveStarts = whole.starts.filter((entry) => inWhole(entry.t));
      const releaseStarts = whole.starts.filter((entry) => entry.t >= up);
      put('move-restarts'""", """    if (state === 'playing') {
      const { moveStarts, releaseStarts } = pointerSpan;
      put('move-restarts'""")
spec.write_text(s)

# Budgets: notes only (S4 + A-R335-REVIEW-WHOLE-NOTE); every other field untouched
bp = root / 'perf/budgets.interactions.json'
raw = bp.read_text()
rows = json.loads(raw)
gesture_prefix = ("Gesture: press on the first clip name bar, 10 steps +40 px on its own lane, 1 step down into the "
                  "next lane and 10 steps +40 px there, 1 step back up and 10 steps +40 px on its own lane, release, reset with Ctrl+Z. ")
short_prefix = "Lane drag (gesture: the 'lane drag' entries of interactionSequence; doc 168). "
old_whole = ("Sum of rendered components / pointermoves in the whole window. Whole window: after the first pointermove "
             "that follows the in-page pointerdown, before the in-page pointerup.")
new_whole = ("Sum of rendered components in the commits after the first pointermove and before the in-page pointerup "
             "/ all pointermoves between the in-page pointerdown and pointerup, the first one included.")
old_cpm = ("Commits in the move window (after the first pointermove that follows the in-page pointerdown, before the "
           "in-page pointerup) / pointermoves in that window.")
new_cpm = ("Commits in the move window (after the first pointermove that follows the in-page pointerdown, before the "
           "in-page pointerup) / all pointermoves between the in-page pointerdown and pointerup, the first one included.")
old_mcpm = ("Sum of rendered components in the move window / pointermoves in that window (per-move sum; per-commit "
            "sizes are bimodal).")
new_mcpm = ("Sum of rendered components in the move window / all pointermoves between the in-page pointerdown and "
            "pointerup, the first one included (per-move sum; per-commit sizes are bimodal).")
changed = []
for r in rows:
    n = r['note']
    m = n
    if m.startswith(gesture_prefix):
        m = short_prefix + m[len(gesture_prefix):]
    m = m.replace(old_whole, new_whole)
    m = m.replace(old_cpm, new_cpm)
    m = m.replace(old_mcpm, new_mcpm)
    if m != n:
        r['note'] = m
        changed.append(r['id'])
out = json.dumps(rows, indent=2, ensure_ascii=False) + '\n'
bp.write_text(out)
pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else '/dev/null').write_text('\n'.join(changed) + '\n')
print('spec edited; notes changed:', len(changed))
